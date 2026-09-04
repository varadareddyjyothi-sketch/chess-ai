import React, { useState } from 'react';
import { Square } from 'chess.js';
import { ChessEngineService } from '../../services/chessEngine';
import { soundService } from '../../services/soundService';
import { ChessBoard } from '../board/ChessBoard';
import { ChessClock } from '../board/ChessClock';
import { PieceColor, PieceType, GameSettings } from '../../types/chess';
import { Users, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlayOfflinePvPScreenProps {
  settings: GameSettings;
}

export const PlayOfflinePvPScreen: React.FC<PlayOfflinePvPScreenProps> = ({ settings }) => {
  const [engine] = useState(() => new ChessEngineService());
  const [boardState, setBoardState] = useState(() => engine.getBoard());
  const [turn, setTurn] = useState<PieceColor>('w');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [kingInCheck, setKingInCheck] = useState<Square | null>(null);

  const [gameOver, setGameOver] = useState<{ ended: boolean; winner?: PieceColor | 'draw'; reason?: string }>({ ended: false });

  const handleMove = (from: Square, to: Square, promotion?: PieceType) => {
    if (gameOver.ended) return;

    const moveRes = engine.makeMove({ from, to, promotion });
    if (moveRes.success) {
      if (moveRes.captured) soundService.playCapture();
      else soundService.playMove();

      if (moveRes.isCheck) {
        soundService.playCheck();
        setKingInCheck(engine.getKingSquare(engine.getTurn()));
      } else {
        setKingInCheck(null);
      }

      setLastMove({ from, to });
      setBoardState(engine.getBoard());
      setTurn(engine.getTurn());

      if (engine.isCheckmate()) {
        const winnerColor = engine.getTurn() === 'w' ? 'b' : 'w';
        setGameOver({ ended: true, winner: winnerColor, reason: 'Checkmate' });
        soundService.playWin();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else if (engine.isDraw()) {
        setGameOver({ ended: true, winner: 'draw', reason: 'Draw' });
      }
    }
  };

  const handleResetGame = () => {
    engine.reset();
    setBoardState(engine.getBoard());
    setTurn('w');
    setLastMove(null);
    setKingInCheck(null);
    setGameOver({ ended: false });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between glass-card p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Local Pass & Play PvP</h2>
            <p className="text-xs text-slate-400">Play locally on the same device without internet.</p>
          </div>
        </div>

        <button
          onClick={handleResetGame}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart Game
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
        orientation="w"
        onMove={handleMove}
        legalMoves={engine.getLegalMoves()}
        lastMove={lastMove}
        kingInCheckSquare={kingInCheck}
        boardTheme={settings.boardTheme}
        disabled={gameOver.ended}
      />

      {gameOver.ended && (
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/40 text-center space-y-3 animate-bounce-in">
          <Award className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-2xl font-extrabold text-white">
            {gameOver.winner === 'w' ? '🎉 White Wins!' : gameOver.winner === 'b' ? '🎉 Black Wins!' : '🤝 Draw Game'}
          </h3>
          <p className="text-slate-300 text-sm">Reason: {gameOver.reason}</p>
          <button
            onClick={handleResetGame}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
