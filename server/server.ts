import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { Chess } from 'chess.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

interface RoomPlayer {
  id: string;
  socketId: string;
  username: string;
  color: 'w' | 'b';
  timeRemainingSeconds: number;
}

interface RoomState {
  code: string;
  chess: Chess;
  whitePlayer: RoomPlayer | null;
  blackPlayer: RoomPlayer | null;
  timeControl: string;
  status: 'waiting' | 'playing' | 'ended';
  turn: 'w' | 'b';
  winner?: 'w' | 'b' | 'draw';
  reason?: string;
  lastMoveTimestamp?: number;
}

const rooms: Record<string, RoomState> = {};

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // Create private or public room
  socket.on('create_room', ({ username, timeControl }: { username: string; timeControl: string }, callback) => {
    const code = generateRoomCode();
    const room: RoomState = {
      code,
      chess: new Chess(),
      whitePlayer: {
        id: socket.id,
        socketId: socket.id,
        username: username || 'Player 1',
        color: 'w',
        timeRemainingSeconds: timeControl === '3+2' ? 180 : 600,
      },
      blackPlayer: null,
      timeControl: timeControl || '10+0',
      status: 'waiting',
      turn: 'w',
    };

    rooms[code] = room;
    socket.join(code);

    callback({
      success: true,
      roomCode: code,
      color: 'w',
      fen: room.chess.fen(),
    });
    console.log(`[Room Created] ${code} by ${username}`);
  });

  // Join room
  socket.on('join_room', ({ roomCode, username }: { roomCode: string; username: string }, callback) => {
    const code = roomCode.toUpperCase().trim();
    const room = rooms[code];

    if (!room) {
      return callback({ success: false, error: 'Room not found' });
    }

    if (room.status !== 'waiting') {
      return callback({ success: false, error: 'Room is full or game already started' });
    }

    room.blackPlayer = {
      id: socket.id,
      socketId: socket.id,
      username: username || 'Player 2',
      color: 'b',
      timeRemainingSeconds: room.timeControl === '3+2' ? 180 : 600,
    };
    room.status = 'playing';
    room.lastMoveTimestamp = Date.now();

    socket.join(code);

    callback({
      success: true,
      roomCode: code,
      color: 'b',
      fen: room.chess.fen(),
      whiteUsername: room.whitePlayer?.username,
      blackUsername: room.blackPlayer?.username,
    });

    // Notify both players that game started
    io.to(code).emit('game_started', {
      fen: room.chess.fen(),
      whiteUsername: room.whitePlayer?.username,
      blackUsername: room.blackPlayer?.username,
      timeControl: room.timeControl,
    });

    console.log(`[Room Joined] ${code} by ${username}`);
  });

  // Make move (validated server-side)
  socket.on('make_move', ({ roomCode, move }: { roomCode: string; move: { from: string; to: string; promotion?: string } }, callback) => {
    const code = roomCode.toUpperCase().trim();
    const room = rooms[code];

    if (!room || room.status !== 'playing') {
      return callback({ success: false, error: 'Invalid room state' });
    }

    const currentTurnColor = room.chess.turn();
    const playerSocket = currentTurnColor === 'w' ? room.whitePlayer?.socketId : room.blackPlayer?.socketId;

    if (socket.id !== playerSocket) {
      return callback({ success: false, error: 'Not your turn' });
    }

    try {
      const result = room.chess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q',
      });

      if (!result) {
        return callback({ success: false, error: 'Illegal move rejected by server' });
      }

      room.turn = room.chess.turn() as 'w' | 'b';

      const isGameOver = room.chess.isGameOver();
      if (isGameOver) {
        room.status = 'ended';
        if (room.chess.isCheckmate()) {
          room.winner = currentTurnColor;
          room.reason = 'Checkmate';
        } else {
          room.winner = 'draw';
          room.reason = room.chess.isStalemate() ? 'Stalemate' : 'Draw';
        }
      }

      callback({ success: true, fen: room.chess.fen(), san: result.san });

      // Broadcast move to all players in room
      io.to(code).emit('move_made', {
        move: { from: move.from, to: move.to, promotion: move.promotion },
        san: result.san,
        fen: room.chess.fen(),
        turn: room.turn,
        isGameOver,
        winner: room.winner,
        reason: room.reason,
      });
    } catch (err) {
      callback({ success: false, error: 'Invalid move execution' });
    }
  });

  // Resignation
  socket.on('resign', ({ roomCode }: { roomCode: string }) => {
    const code = roomCode.toUpperCase().trim();
    const room = rooms[code];
    if (!room) return;

    const resigningColor = socket.id === room.whitePlayer?.socketId ? 'w' : 'b';
    const winningColor = resigningColor === 'w' ? 'b' : 'w';

    room.status = 'ended';
    room.winner = winningColor;
    room.reason = `${resigningColor === 'w' ? 'White' : 'Black'} resigned`;

    io.to(code).emit('game_ended', {
      winner: winningColor,
      reason: room.reason,
    });
  });

  // Disconnection
  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    for (const code in rooms) {
      const room = rooms[code];
      if (room.whitePlayer?.socketId === socket.id || room.blackPlayer?.socketId === socket.id) {
        io.to(code).emit('opponent_disconnected', {
          message: 'Opponent disconnected. Waiting 60s for reconnection...',
        });
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`[ChessMind Socket Server] Running on http://localhost:${PORT}`);
});
