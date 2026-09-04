import React, { useState, useEffect } from 'react';
import { Square } from 'chess.js';
import { multiplayerService } from '../../services/multiplayerService';
import { ChessEngineService } from '../../services/chessEngine';
import { soundService } from '../../services/soundService';
import { ChessBoard } from '../board/ChessBoard';
import { ChessClock } from '../board/ChessClock';
import { PieceColor, PieceType, GameSettings } from '../../types/chess';
import { Globe, Copy, Check, Users, ShieldAlert, Wifi, WifiOff, Award } from 'lucide-react';

interface PlayOnlineScreenProps {
  settings: GameSettings;
  username: string;
}

export const PlayOnlineScreen: React.FC<PlayOnlineScreenProps> = ({ settings, username }) => {
  const [engine] = useState(() => new ChessEngineService());
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [userColor, setUserColor] = useState<PieceColor>('w');

  const [inGame, setInGame] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [boardState, setBoardState] = useState(() => engine.getBoard());
  const [turn, setTurn] = useState<PieceColor>('w');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [gameOver, setGameOver] = useState<{ ended: boolean; winner?: string; reason?: string }>({ ended: false });

  const [opponentUsername, setOpponentUsername] = useState('Opponent');

  useEffect(() => {
    multiplayerService.listen({
      onGameStarted: (data) => {
        engine.loadFen(data.fen);
        setBoardState(engine.getBoard());
        setTurn(engine.getTurn());
        setInGame(true);
        setStatusMessage('Game Started!');
        if (data.whiteUsername && data.blackUsername) {
          setOpponentUsername(userColor === 'w' ? data.blackUsername : data.whiteUsername);
        }
      },
      onMoveMade: (data) => {
        engine.loadFen(data.fen);
        setBoardState(engine.getBoard());
        setTurn(engine.getTurn());
        setLastMove(data.move as any);

        soundService.playMove();

        if (data.isGameOver) {
          setGameOver({ ended: true, winner: data.winner, reason: data.reason });
        }
      },
      onGameEnded: (data) => {
        setGameOver({ ended: true, winner: data.winner, reason: data.reason });
      },
      onOpponentDisconnected: (data) => {
        setStatusMessage(data.message);
      },
    });
  }, [userColor, engine]);

  const handleCreateRoom = () => {
    multiplayerService.createRoom(username || 'Player 1', '10+0', (res) => {
      if (res.success && res.roomCode) {
        setActiveRoomCode(res.roomCode);
        setUserColor('w');
        setStatusMessage(`Room Code: ${res.roomCode} — Waiting for opponent to join...`);
      } else {
        setStatusMessage(res.error || 'Failed to create room');
      }
    });
  };

  const handleJoinRoom = () => {
    if (!roomCodeInput.trim()) return;
    multiplayerService.joinRoom(roomCodeInput, username || 'Player 2', (res) => {
      if (res.success && res.roomCode) {
        setActiveRoomCode(res.roomCode);
        setUserColor('b');
        setInGame(true);
        setStatusMessage('Joined room! Match starting...');
      } else {
        setStatusMessage(res.error || 'Failed to join room');
      }
    });
  };

  const handleMove = (from: Square, to: Square, promotion?: PieceType) => {
    if (!inGame || gameOver.ended || turn !== userColor) return;

    multiplayerService.makeMove({ from, to, promotion }, (res) => {
      if (res.success && res.fen) {
        engine.loadFen(res.fen);
        setBoardState(engine.getBoard());
        setTurn(engine.getTurn());
        setLastMove({ from, to });
        soundService.playMove();
      } else {
        setStatusMessage(res.error || 'Illegal move rejected');
      }
    });
  };

  const copyRoomCode = () => {
    if (activeRoomCode) {
      navigator.clipboard.writeText(activeRoomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!inGame) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 animate-fade-in">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto">
            <Globe className="w-8 h-8 text-indigo-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Online Multiplayer Lobby</h2>
            <p className="text-slate-400 text-sm mt-1">Create a room or join with a room code.</p>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-300 font-medium">
              {statusMessage}
            </div>
          )}

          {activeRoomCode ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Your Room Code</div>
              <div className="text-4xl font-extrabold font-mono text-indigo-400 tracking-widest">{activeRoomCode}</div>
              <button
                onClick={copyRoomCode}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white inline-flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Code Copied!' : 'Copy Invite Code'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleCreateRoom}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-transform"
              >
                Create New Match Room
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase font-semibold">Or Join Room</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-char Room Code"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-center font-bold text-sm focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleJoinRoom}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
                >
                  Join Match
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between glass-card p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-indigo-400" />
          <div>
            <div className="text-base font-bold text-white">Online Match</div>
            <div className="text-xs text-slate-400">Room: <span className="font-mono text-indigo-400">{activeRoomCode}</span></div>
          </div>
        </div>

        <button
          onClick={() => multiplayerService.resign()}
          className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-semibold"
        >
          Resign Match
        </button>
      </div>

      <ChessClock
        whiteTimeSeconds={600}
        blackTimeSeconds={600}
        activeColor={turn}
        isGameRunning={!gameOver.ended}
      />

      <ChessBoard
        board={boardState}
        turn={turn}
        orientation={userColor}
        onMove={handleMove}
        legalMoves={engine.getLegalMoves()}
        lastMove={lastMove}
        boardTheme={settings.boardTheme}
        disabled={turn !== userColor || gameOver.ended}
      />

      {gameOver.ended && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/40 text-center space-y-3">
          <Award className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-2xl font-extrabold text-white">Game Over</h3>
          <p className="text-slate-300 text-sm">Result: {gameOver.winner} won by {gameOver.reason}</p>
        </div>
      )}
    </div>
  );
};
