import { io, Socket } from 'socket.io-client';

export interface MultiplayerEvents {
  onGameStarted?: (data: { fen: string; whiteUsername: string; blackUsername: string; timeControl: string }) => void;
  onMoveMade?: (data: { move: { from: string; to: string }; san: string; fen: string; turn: 'w' | 'b'; isGameOver: boolean; winner?: string; reason?: string }) => void;
  onGameEnded?: (data: { winner: string; reason: string }) => void;
  onOpponentDisconnected?: (data: { message: string }) => void;
}

export class MultiplayerService {
  private socket: Socket | null = null;
  private serverUrl: string = 'http://localhost:5000';
  private currentRoomCode: string | null = null;

  public connect(): void {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
      });
    }
  }

  public createRoom(
    username: string,
    timeControl: string,
    callback: (res: { success: boolean; roomCode?: string; color?: 'w' | 'b'; fen?: string; error?: string }) => void
  ): void {
    this.connect();
    if (!this.socket) return callback({ success: false, error: 'Socket connection failed' });

    this.socket.emit('create_room', { username, timeControl }, (res: any) => {
      if (res.success) {
        this.currentRoomCode = res.roomCode;
      }
      callback(res);
    });
  }

  public joinRoom(
    roomCode: string,
    username: string,
    callback: (res: { success: boolean; roomCode?: string; color?: 'w' | 'b'; fen?: string; whiteUsername?: string; blackUsername?: string; error?: string }) => void
  ): void {
    this.connect();
    if (!this.socket) return callback({ success: false, error: 'Socket connection failed' });

    this.socket.emit('join_room', { roomCode, username }, (res: any) => {
      if (res.success) {
        this.currentRoomCode = res.roomCode;
      }
      callback(res);
    });
  }

  public makeMove(
    move: { from: string; to: string; promotion?: string },
    callback: (res: { success: boolean; fen?: string; san?: string; error?: string }) => void
  ): void {
    if (!this.socket || !this.currentRoomCode) return callback({ success: false, error: 'No active room' });

    this.socket.emit('make_move', { roomCode: this.currentRoomCode, move }, callback);
  }

  public resign(): void {
    if (this.socket && this.currentRoomCode) {
      this.socket.emit('resign', { roomCode: this.currentRoomCode });
    }
  }

  public listen(events: MultiplayerEvents): void {
    if (!this.socket) this.connect();
    if (!this.socket) return;

    if (events.onGameStarted) {
      this.socket.off('game_started');
      this.socket.on('game_started', events.onGameStarted);
    }
    if (events.onMoveMade) {
      this.socket.off('move_made');
      this.socket.on('move_made', events.onMoveMade);
    }
    if (events.onGameEnded) {
      this.socket.off('game_ended');
      this.socket.on('game_ended', events.onGameEnded);
    }
    if (events.onOpponentDisconnected) {
      this.socket.off('opponent_disconnected');
      this.socket.on('opponent_disconnected', events.onOpponentDisconnected);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentRoomCode = null;
    }
  }
}

export const multiplayerService = new MultiplayerService();
