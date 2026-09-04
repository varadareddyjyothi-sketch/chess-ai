import React, { useState } from 'react';
import { ChessEngineService } from '../../services/chessEngine';
import { aiTutorService, TutorExplanation } from '../../services/aiTutorService';
import { ChessBoard } from '../board/ChessBoard';
import { Bot, Sparkles, HelpCircle, Lightbulb, RefreshCw, Send } from 'lucide-react';

export const AITutorScreen: React.FC = () => {
  const [engine] = useState(() => new ChessEngineService());
  const [boardState, setBoardState] = useState(() => engine.getBoard());
  const [fenInput, setFenInput] = useState('');
  const [explanation, setExplanation] = useState<TutorExplanation | null>(null);

  const handleExplain = () => {
    setExplanation(aiTutorService.explainMove(engine.getFen()));
  };

  const handleHint = () => {
    setExplanation(aiTutorService.getHint(engine.getFen()));
  };

  const handleWhyBad = () => {
    setExplanation(aiTutorService.whyIsThisBad(engine.getFen(), 'e4'));
  };

  const handleTeach = () => {
    setExplanation(aiTutorService.teachPosition(engine.getFen()));
  };

  const handleLoadCustomFen = () => {
    if (fenInput.trim() && engine.loadFen(fenInput.trim())) {
      setBoardState(engine.getBoard());
      setExplanation(aiTutorService.teachPosition(engine.getFen()));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Bot className="w-8 h-8 text-indigo-400" /> ChessMind <span className="gradient-text">AI Coach</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            An intelligent chess tutor that explains tactical motifs, threats, and positioning in plain, beginner-friendly language.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Board Column */}
        <div className="lg:col-span-6 space-y-4">
          <ChessBoard
            board={boardState}
            turn={engine.getTurn()}
            onMove={(from, to) => {
              engine.makeMove({ from, to });
              setBoardState(engine.getBoard());
              setExplanation(aiTutorService.explainMove(engine.getFen()));
            }}
            legalMoves={engine.getLegalMoves()}
          />

          {/* FEN Loader */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Paste FEN position string..."
              value={fenInput}
              onChange={(e) => setFenInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              onClick={handleLoadCustomFen}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Analyze Position
            </button>
          </div>
        </div>

        {/* Right Tutor Interface Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Ask ChessMind AI
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExplain}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-white flex items-center gap-2 transition-all hover:border-indigo-500/50"
              >
                <HelpCircle className="w-4 h-4 text-indigo-400" /> Explain Move
              </button>

              <button
                onClick={handleHint}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-white flex items-center gap-2 transition-all hover:border-amber-500/50"
              >
                <Lightbulb className="w-4 h-4 text-amber-400" /> Find Better Move
              </button>

              <button
                onClick={handleWhyBad}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-white flex items-center gap-2 transition-all hover:border-rose-500/50"
              >
                Why Is This Bad?
              </button>

              <button
                onClick={handleTeach}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-white flex items-center gap-2 transition-all hover:border-purple-500/50"
              >
                Teach Position
              </button>
            </div>

            {explanation ? (
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-4 animate-fade-in shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-indigo-400">{explanation.title}</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] uppercase font-bold tracking-wider">
                    {explanation.threatLevel} threat
                  </span>
                </div>

                <p className="text-slate-200 text-sm leading-relaxed">{explanation.summary}</p>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Lessons & Principles</span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {explanation.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center text-slate-500 text-xs">
                Select one of the prompt options above to ask ChessMind AI for position guidance.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
