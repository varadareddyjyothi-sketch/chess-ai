import React, { useState } from 'react';
import { Square } from 'chess.js';
import { BoardSquare } from '../../services/chessEngine';
import { PieceColor, PieceType } from '../../types/chess';
import { Crown } from 'lucide-react';

interface ChessBoardProps {
  board: (BoardSquare | null)[][];
  turn: PieceColor;
  orientation?: PieceColor;
  onMove: (from: Square, to: Square, promotion?: PieceType) => void;
  legalMoves?: { from: Square; to: Square; promotion?: string; captured?: string }[];
  lastMove?: { from: Square; to: Square } | null;
  kingInCheckSquare?: Square | null;
  boardTheme?: 'emerald' | 'wood' | 'glass' | 'slate';
  showCoordinates?: boolean;
  disabled?: boolean;
}

// SVG Chess Piece Vectors
const PIECE_UNICODE: Record<string, string> = {
  w_p: '♙',
  w_n: '♘',
  w_b: '♗',
  w_r: '♖',
  w_q: '♕',
  w_k: '♔',
  b_p: '♟',
  b_n: '♞',
  b_b: '♝',
  b_r: '♜',
  b_q: '♛',
  b_k: '♚',
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  turn,
  orientation = 'w',
  onMove,
  legalMoves = [],
  lastMove = null,
  kingInCheckSquare = null,
  boardTheme = 'emerald',
  showCoordinates = true,
  disabled = false,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayRanks = orientation === 'w' ? ranks : [...ranks].reverse();
  const displayFiles = orientation === 'w' ? files : [...files].reverse();

  // Color themes
  const themeColors = {
    emerald: { light: 'bg-[#eeeed2] text-[#769656]', dark: 'bg-[#769656] text-[#eeeed2]' },
    wood: { light: 'bg-[#f0d9b5] text-[#b58863]', dark: 'bg-[#b58863] text-[#f0d9b5]' },
    glass: { light: 'bg-slate-200/90 text-slate-700', dark: 'bg-slate-700/90 text-slate-200' },
    slate: { light: 'bg-slate-300 text-slate-800', dark: 'bg-slate-600 text-slate-300' },
  }[boardTheme];

  const getSquareName = (rIdx: number, cIdx: number): Square => {
    const file = displayFiles[cIdx];
    const rank = displayRanks[rIdx];
    return `${file}${rank}` as Square;
  };

  const getSquarePiece = (sq: Square): BoardSquare | null => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const item = board[r][c];
        if (item && item.square === sq) return item;
      }
    }
    return null;
  };

  const handleSquareClick = (sq: Square) => {
    if (disabled) return;

    // If already selected, check if clicking a valid move target
    if (selectedSquare) {
      if (selectedSquare === sq) {
        setSelectedSquare(null);
        return;
      }

      const moveMatch = legalMoves.find((m) => m.from === selectedSquare && m.to === sq);
      if (moveMatch) {
        // Check for Pawn Promotion (Pawn advancing to 8th/1st rank)
        const piece = getSquarePiece(selectedSquare);
        if (piece && piece.type === 'p' && (sq.endsWith('8') || sq.endsWith('1'))) {
          setPendingPromotion({ from: selectedSquare, to: sq });
          return;
        }

        onMove(selectedSquare, sq);
        setSelectedSquare(null);
        return;
      }
    }

    // Select piece if it belongs to current turn
    const clickedPiece = getSquarePiece(sq);
    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedSquare(sq);
    } else {
      setSelectedSquare(null);
    }
  };

  const activeLegalTargets = selectedSquare
    ? legalMoves.filter((m) => m.from === selectedSquare)
    : [];

  const handlePromotionSelect = (promo: PieceType) => {
    if (pendingPromotion) {
      onMove(pendingPromotion.from, pendingPromotion.to, promo);
      setPendingPromotion(null);
      setSelectedSquare(null);
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-[600px] mx-auto select-none rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 glass-panel">
      {/* 8x8 Board Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {displayRanks.map((rank, rIdx) =>
          displayFiles.map((file, cIdx) => {
            const sq = `${file}${rank}` as Square;
            const isLight = (rIdx + cIdx) % 2 === 0;
            const piece = getSquarePiece(sq);
            const isSelected = selectedSquare === sq;
            const isLastMove = lastMove?.from === sq || lastMove?.to === sq;
            const isCheck = kingInCheckSquare === sq;

            const legalTarget = activeLegalTargets.find((m) => m.to === sq);
            const isCapture = legalTarget && (piece !== null || legalTarget.captured);

            return (
              <div
                key={sq}
                onClick={() => handleSquareClick(sq)}
                className={`relative flex items-center justify-center cursor-pointer transition-all duration-100 ${
                  isLight ? themeColors.light : themeColors.dark
                } ${isSelected ? 'square-selected' : ''} ${isLastMove ? 'square-last-move' : ''} ${
                  isCheck ? 'square-check' : ''
                }`}
              >
                {/* Coordinates Labels */}
                {showCoordinates && cIdx === 0 && (
                  <span className="absolute top-1 left-1.5 text-[10px] font-bold opacity-60">
                    {rank}
                  </span>
                )}
                {showCoordinates && rIdx === 7 && (
                  <span className="absolute bottom-1 right-1.5 text-[10px] font-bold opacity-60">
                    {file}
                  </span>
                )}

                {/* Piece Rendering */}
                {piece && (
                  <span
                    className={`text-4xl md:text-5xl font-sans drop-shadow-md transform transition-transform hover:scale-105 ${
                      piece.color === 'w'
                        ? 'text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                        : 'text-slate-950 filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]'
                    }`}
                  >
                    {PIECE_UNICODE[`${piece.color}_${piece.type}`]}
                  </span>
                )}

                {/* Legal Move Indicators */}
                {legalTarget && !isCapture && <div className="legal-move-dot pointer-events-none"></div>}
                {legalTarget && isCapture && <div className="legal-capture-ring pointer-events-none"></div>}
              </div>
            );
          })
        )}
      </div>

      {/* Pawn Promotion Modal Dialog */}
      {pendingPromotion && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl text-center max-w-xs">
            <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2 animate-bounce" />
            <h3 className="text-lg font-bold text-white mb-1">Promote Pawn</h3>
            <p className="text-slate-400 text-xs mb-4">Choose a piece to promote your pawn into:</p>

            <div className="grid grid-cols-4 gap-3">
              {[
                { type: 'q' as PieceType, label: 'Queen', icon: turn === 'w' ? '♕' : '♛' },
                { type: 'r' as PieceType, label: 'Rook', icon: turn === 'w' ? '♖' : '♜' },
                { type: 'b' as PieceType, label: 'Bishop', icon: turn === 'w' ? '♗' : '♝' },
                { type: 'n' as PieceType, label: 'Knight', icon: turn === 'w' ? '♘' : '♞' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => handlePromotionSelect(item.type)}
                  className="p-3 bg-slate-800 hover:bg-indigo-600 rounded-xl border border-slate-700 text-3xl flex items-center justify-center transition-all hover:scale-110"
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
