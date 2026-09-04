import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Chess } from 'chess.js';
const app = express();
app.use(cors());
// Health Check Endpoint
app.get('/', (req, res) => {
    res.json({ status: 'online', service: 'ChessMind Socket Server', activeRooms: Object.keys(rooms).length });
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok', activeRooms: Object.keys(rooms).length });
});
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
const rooms = {};
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
// Server clock tick interval for active games (1 second precision)
setInterval(() => {
    for (const code in rooms) {
        const room = rooms[code];
        if (room.status === 'playing' && room.lastMoveTimestamp) {
            const activePlayer = room.turn === 'w' ? room.whitePlayer : room.blackPlayer;
            if (activePlayer) {
                activePlayer.timeRemainingSeconds = Math.max(0, activePlayer.timeRemainingSeconds - 1);
                if (activePlayer.timeRemainingSeconds <= 0) {
                    const winnerColor = room.turn === 'w' ? 'b' : 'w';
                    room.status = 'ended';
                    room.winner = winnerColor;
                    room.reason = 'Time Forfeit';
                    io.to(code).emit('game_ended', {
                        winner: winnerColor,
                        reason: 'Time Forfeit',
                        fen: room.chess.fen(),
                    });
                }
            }
        }
    }
}, 1000);
io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);
    // Safe helper to invoke ack callback
    const safeCallback = (cb, data) => {
        if (typeof cb === 'function') {
            cb(data);
        }
    };
    // Create room
    socket.on('create_room', (payload, callback) => {
        const username = payload?.username || 'Player 1';
        const timeControl = payload?.timeControl || '10+0';
        const code = generateRoomCode();
        const initialTime = timeControl === '3+2' ? 180 : 600;
        const room = {
            code,
            chess: new Chess(),
            whitePlayer: {
                id: socket.id,
                socketId: socket.id,
                username,
                color: 'w',
                timeRemainingSeconds: initialTime,
            },
            blackPlayer: null,
            timeControl,
            status: 'waiting',
            turn: 'w',
        };
        rooms[code] = room;
        socket.join(code);
        safeCallback(callback, {
            success: true,
            roomCode: code,
            color: 'w',
            fen: room.chess.fen(),
        });
        console.log(`[Room Created] ${code} by ${username}`);
    });
    // Join room
    socket.on('join_room', (payload, callback) => {
        if (!payload?.roomCode) {
            return safeCallback(callback, { success: false, error: 'Room code required' });
        }
        const code = payload.roomCode.toUpperCase().trim();
        const room = rooms[code];
        if (!room) {
            return safeCallback(callback, { success: false, error: 'Room not found' });
        }
        if (room.status !== 'waiting') {
            return safeCallback(callback, { success: false, error: 'Room is full or game already started' });
        }
        const username = payload.username || 'Player 2';
        const initialTime = room.timeControl === '3+2' ? 180 : 600;
        room.blackPlayer = {
            id: socket.id,
            socketId: socket.id,
            username,
            color: 'b',
            timeRemainingSeconds: initialTime,
        };
        room.status = 'playing';
        room.lastMoveTimestamp = Date.now();
        socket.join(code);
        safeCallback(callback, {
            success: true,
            roomCode: code,
            color: 'b',
            fen: room.chess.fen(),
            whiteUsername: room.whitePlayer?.username,
            blackUsername: room.blackPlayer?.username,
        });
        // Notify all players game started
        io.to(code).emit('game_started', {
            fen: room.chess.fen(),
            whiteUsername: room.whitePlayer?.username,
            blackUsername: room.blackPlayer?.username,
            timeControl: room.timeControl,
        });
        console.log(`[Room Joined] ${code} by ${username}`);
    });
    // Reconnect to active room after browser refresh or drop
    socket.on('reconnect_room', (payload, callback) => {
        if (!payload?.roomCode) {
            return safeCallback(callback, { success: false, error: 'Room code required' });
        }
        const code = payload.roomCode.toUpperCase().trim();
        const room = rooms[code];
        if (!room) {
            return safeCallback(callback, { success: false, error: 'Room not found' });
        }
        const color = payload.color || 'w';
        if (color === 'w' && room.whitePlayer) {
            room.whitePlayer.socketId = socket.id;
        }
        else if (color === 'b' && room.blackPlayer) {
            room.blackPlayer.socketId = socket.id;
        }
        socket.join(code);
        safeCallback(callback, {
            success: true,
            roomCode: code,
            fen: room.chess.fen(),
            turn: room.turn,
            status: room.status,
            whiteUsername: room.whitePlayer?.username,
            blackUsername: room.blackPlayer?.username,
        });
        console.log(`[Room Reconnected] ${code} by ${socket.id} (${color})`);
    });
    // Make move
    socket.on('make_move', (payload, callback) => {
        if (!payload?.roomCode || !payload?.move) {
            return safeCallback(callback, { success: false, error: 'Invalid payload' });
        }
        const code = payload.roomCode.toUpperCase().trim();
        const room = rooms[code];
        if (!room || room.status !== 'playing') {
            return safeCallback(callback, { success: false, error: 'Invalid room or game not active' });
        }
        const currentTurnColor = room.chess.turn();
        const playerSocket = currentTurnColor === 'w' ? room.whitePlayer?.socketId : room.blackPlayer?.socketId;
        if (socket.id !== playerSocket) {
            return safeCallback(callback, { success: false, error: 'Not your turn' });
        }
        try {
            const result = room.chess.move({
                from: payload.move.from,
                to: payload.move.to,
                promotion: payload.move.promotion || 'q',
            });
            if (!result) {
                return safeCallback(callback, { success: false, error: 'Illegal move rejected' });
            }
            room.turn = room.chess.turn();
            room.lastMoveTimestamp = Date.now();
            const isGameOver = room.chess.isGameOver();
            if (isGameOver) {
                room.status = 'ended';
                if (room.chess.isCheckmate()) {
                    room.winner = currentTurnColor;
                    room.reason = 'Checkmate';
                }
                else {
                    room.winner = 'draw';
                    room.reason = room.chess.isStalemate() ? 'Stalemate' : 'Draw';
                }
            }
            safeCallback(callback, { success: true, fen: room.chess.fen(), san: result.san });
            // Broadcast move to room
            io.to(code).emit('move_made', {
                move: { from: payload.move.from, to: payload.move.to, promotion: payload.move.promotion },
                san: result.san,
                fen: room.chess.fen(),
                turn: room.turn,
                isGameOver,
                winner: room.winner,
                reason: room.reason,
            });
            if (isGameOver) {
                io.to(code).emit('game_ended', {
                    winner: room.winner,
                    reason: room.reason,
                    fen: room.chess.fen(),
                });
            }
        }
        catch (err) {
            safeCallback(callback, { success: false, error: 'Failed to process move' });
        }
    });
    // Resign
    socket.on('resign', (payload) => {
        if (!payload?.roomCode)
            return;
        const code = payload.roomCode.toUpperCase().trim();
        const room = rooms[code];
        if (!room || room.status !== 'playing')
            return;
        const resigningColor = socket.id === room.whitePlayer?.socketId ? 'w' : 'b';
        const winningColor = resigningColor === 'w' ? 'b' : 'w';
        room.status = 'ended';
        room.winner = winningColor;
        room.reason = `${resigningColor === 'w' ? 'White' : 'Black'} resigned`;
        io.to(code).emit('game_ended', {
            winner: winningColor,
            reason: room.reason,
            fen: room.chess.fen(),
        });
    });
    // Draw offer
    socket.on('offer_draw', (payload) => {
        if (!payload?.roomCode)
            return;
        const code = payload.roomCode.toUpperCase().trim();
        const room = rooms[code];
        if (!room || room.status !== 'playing')
            return;
        const offeringColor = socket.id === room.whitePlayer?.socketId ? 'w' : 'b';
        socket.to(code).emit('draw_offered', { offeringColor });
    });
    // Accept draw
    socket.on('accept_draw', (payload) => {
        if (!payload?.roomCode)
            return;
        const code = payload.roomCode.toUpperCase().trim();
        const room = rooms[code];
        if (!room || room.status !== 'playing')
            return;
        room.status = 'ended';
        room.winner = 'draw';
        room.reason = 'Agreement';
        io.to(code).emit('game_ended', {
            winner: 'draw',
            reason: 'Draw by Agreement',
            fen: room.chess.fen(),
        });
    });
    // Disconnection
    socket.on('disconnect', () => {
        console.log(`[Socket] Disconnected: ${socket.id}`);
        for (const code in rooms) {
            const room = rooms[code];
            const isWhite = room.whitePlayer?.socketId === socket.id;
            const isBlack = room.blackPlayer?.socketId === socket.id;
            if (isWhite || isBlack) {
                if (room.status === 'playing') {
                    io.to(code).emit('opponent_disconnected', {
                        message: 'Opponent disconnected.',
                    });
                }
                // Clean up empty room if both players leave
                if (isWhite)
                    room.whitePlayer = null;
                if (isBlack)
                    room.blackPlayer = null;
                if (!room.whitePlayer && !room.blackPlayer) {
                    delete rooms[code];
                    console.log(`[Room Cleaned] ${code}`);
                }
            }
        }
    });
});
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`[ChessMind Socket Server] Running on http://localhost:${PORT}`);
});
