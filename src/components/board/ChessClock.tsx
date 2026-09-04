import React, { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { PieceColor } from '../../types/chess';

interface ChessClockProps {
  whiteTimeSeconds: number;
  blackTimeSeconds: number;
  activeColor: PieceColor;
  isGameRunning: boolean;
  onTimeExpired?: (color: PieceColor) => void;
  incrementSeconds?: number;
}

export const ChessClock: React.FC<ChessClockProps> = ({
  whiteTimeSeconds,
  blackTimeSeconds,
  activeColor,
  isGameRunning,
  onTimeExpired,
}) => {
  const [wTime, setWTime] = useState(whiteTimeSeconds);
  const [bTime, setBTime] = useState(blackTimeSeconds);

  useEffect(() => {
    setWTime(whiteTimeSeconds);
    setBTime(blackTimeSeconds);
  }, [whiteTimeSeconds, blackTimeSeconds]);

  useEffect(() => {
    if (!isGameRunning) return;

    const interval = setInterval(() => {
      if (activeColor === 'w') {
        setWTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onTimeExpired?.('w');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onTimeExpired?.('b');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeColor, isGameRunning, onTimeExpired]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full my-2">
      {/* Black Player Clock */}
      <div
        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
          activeColor === 'b' && isGameRunning
            ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/10'
            : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Black</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xl font-bold tracking-tight">
          <Clock className={`w-4 h-4 ${activeColor === 'b' && isGameRunning ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
          <span className={bTime < 30 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}>
            {formatTime(bTime)}
          </span>
        </div>
      </div>

      {/* White Player Clock */}
      <div
        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
          activeColor === 'w' && isGameRunning
            ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
            : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white shadow-sm"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">White</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xl font-bold tracking-tight">
          <Clock className={`w-4 h-4 ${activeColor === 'w' && isGameRunning ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
          <span className={wTime < 30 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}>
            {formatTime(wTime)}
          </span>
        </div>
      </div>
    </div>
  );
};
