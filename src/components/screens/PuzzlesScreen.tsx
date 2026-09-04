import React, { useState } from 'react';
import { PUZZLES_DATA } from '../../data/puzzlesData';
import { ChessEngineService } from '../../services/chessEngine';
import { ChessBoard } from '../board/ChessBoard';
import { soundService } from '../../services/soundService';
import { Award, Flame, Lightbulb, CheckCircle2, RefreshCw, HelpCircle, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PuzzlesScreen: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const puzzle = PUZZLES_DATA[currentIdx] || PUZZLES_DATA[0];

  const [engine] = useState(() => new ChessEngineService(puzzle.fen));
  const [boardState, setBoardState] = useState(() => engine.getBoard());

  const [streak, setStreak] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handlePuzzleMove = (from: string, to: string) => {
    if (isSolved) return;

    const moveSan = `${from}${to}`;
    const moveRes = engine.makeMove({ from, to });

    if (moveRes.success) {
      soundService.playMove();
      setBoardState(engine.getBoard());

      // Check if move matches solution
      const expectedMove = puzzle.solution[0];
      if (expectedMove && (moveRes.san === expectedMove || moveSan === expectedMove || moveSan.includes(expectedMove))) {
        setIsSolved(true);
        setFeedback('Correct! Tactical vision confirmed.');
        setStreak((prev) => prev + 1);
        soundService.playWin();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        setFeedback('Incorrect move. Try again or ask for a hint.');
        soundService.playLoss();
      }
    }
  };

  const handleNextPuzzle = () => {
    const nextIdx = (currentIdx + 1) % PUZZLES_DATA.length;
    setCurrentIdx(nextIdx);
    engine.loadFen(PUZZLES_DATA[nextIdx].fen);
    setBoardState(engine.getBoard());
    setIsSolved(false);
    setShowHint(false);
    setFeedback(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-8 h-8 text-sky-400" /> Daily Chess <span className="gradient-text">Puzzles</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sharpen your calculation skills. Find the winning combination.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-card px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-400 animate-bounce" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Puzzle Streak</div>
              <div className="text-sm font-extrabold font-mono text-white">{streak} Days</div>
            </div>
          </div>

          <div className="glass-card px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Puzzle Rating</div>
              <div className="text-sm font-extrabold font-mono text-white">{puzzle.rating}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Board */}
        <div className="lg:col-span-6 space-y-4">
          <ChessBoard
            board={boardState}
            turn={engine.getTurn()}
            onMove={handlePuzzleMove}
            legalMoves={engine.getLegalMoves()}
            disabled={isSolved}
          />
        </div>

        {/* Right Puzzle Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-wider">
                {puzzle.tacticalMotif}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {puzzle.id}</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{puzzle.title}</h2>
              <p className="text-slate-300 text-sm leading-relaxed">{puzzle.description}</p>
            </div>

            {feedback && (
              <div
                className={`p-4 rounded-xl border text-sm font-medium animate-fade-in ${
                  isSolved
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                {feedback}
              </div>
            )}

            {showHint && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2 animate-fade-in">
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold mb-0.5">Tactical Hint:</div>
                  <div>{puzzle.hint}</div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {!isSolved && (
                <button
                  onClick={() => setShowHint(true)}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-amber-400 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Lightbulb className="w-4 h-4" /> Get Hint
                </button>
              )}

              {isSolved && (
                <button
                  onClick={handleNextPuzzle}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
                >
                  Next Puzzle <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
