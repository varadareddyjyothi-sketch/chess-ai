import React, { useState } from 'react';
import { ChessEngineService } from '../../services/chessEngine';
import { analysisEngineService } from '../../services/analysisEngine';
import { ChessBoard } from '../board/ChessBoard';
import { BarChart2, SkipBack, ChevronLeft, ChevronRight, SkipForward, Play, Pause, Award, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import { GameAnalysisResult } from '../../types/chess';

export const AnalysisScreen: React.FC = () => {
  // Sample demo game FEN trajectory
  const sampleMovesSan = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+'];
  const sampleFenHistory = [
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 4',
    'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 1 5',
    'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq - 0 5',
    'r1bqk2r/pppp1ppp/2n2n2/2b5/2BpP3/2P2N2/PP3PPP/RNBQK2R w KQkq - 0 6',
    'r1bqk2r/pppp1ppp/2n2n2/2b5/2BPP3/5N2/PP3PPP/RNBQK2R b KQkq - 0 6',
    'r1bqk2r/pppp1ppp/2n2n2/8/1bBPP3/5N2/PP3PPP/RNBQK2R w KQkq - 1 7',
  ];

  const [analysisResult] = useState<GameAnalysisResult>(() =>
    analysisEngineService.analyzeGame(sampleFenHistory, sampleMovesSan)
  );

  const [engine] = useState(() => new ChessEngineService(sampleFenHistory[0]));
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStep = (step: number) => {
    const validStep = Math.max(0, Math.min(step, sampleFenHistory.length - 1));
    setCurrentStep(validStep);
    engine.loadFen(sampleFenHistory[validStep]);
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'brilliant':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">Brilliant !!</span>;
      case 'best':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">Best</span>;
      case 'inaccuracy':
        return <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold text-[10px]">Inaccuracy ?!</span>;
      case 'mistake':
        return <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold text-[10px]">Mistake ?</span>;
      case 'blunder':
        return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px]">Blunder ??</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">Good</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <BarChart2 className="w-8 h-8 text-indigo-400" /> Post-Game <span className="gradient-text">Analysis</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review accuracy scores, move evaluations, mistakes, and engine timelines.
          </p>
        </div>
      </div>

      {/* Accuracy Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white uppercase tracking-wider">White Accuracy</span>
            <span className="text-3xl font-extrabold font-mono text-indigo-400">{analysisResult.whiteAccuracy}%</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-amber-400 font-bold">{analysisResult.whiteBrilliances}</div>
              <div className="text-slate-400 text-[10px]">Brilliant</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-yellow-400 font-bold">{analysisResult.whiteInaccuracies}</div>
              <div className="text-slate-400 text-[10px]">Inaccuracies</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-orange-400 font-bold">{analysisResult.whiteMistakes}</div>
              <div className="text-slate-400 text-[10px]">Mistakes</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-rose-400 font-bold">{analysisResult.whiteBlunders}</div>
              <div className="text-slate-400 text-[10px]">Blunders</div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white uppercase tracking-wider">Black Accuracy</span>
            <span className="text-3xl font-extrabold font-mono text-purple-400">{analysisResult.blackAccuracy}%</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-amber-400 font-bold">{analysisResult.blackBrilliances}</div>
              <div className="text-slate-400 text-[10px]">Brilliant</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-yellow-400 font-bold">{analysisResult.blackInaccuracies}</div>
              <div className="text-slate-400 text-[10px]">Inaccuracies</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-orange-400 font-bold">{analysisResult.blackMistakes}</div>
              <div className="text-slate-400 text-[10px]">Mistakes</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-rose-400 font-bold">{analysisResult.blackBlunders}</div>
              <div className="text-slate-400 text-[10px]">Blunders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Board & Replay Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-4">
          <ChessBoard
            board={engine.getBoard()}
            turn={engine.getTurn()}
            onMove={() => {}}
            disabled={true}
          />

          {/* Interactive Replay Controls */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-center gap-3">
            <button
              onClick={() => handleStep(0)}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
              title="First Move"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleStep(currentStep - 1)}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Previous Move"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              {isPlaying ? 'Pause' : 'Auto Play'}
            </button>
            <button
              onClick={() => handleStep(currentStep + 1)}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Next Move"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleStep(sampleFenHistory.length - 1)}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Last Move"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Move History & Move Quality List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white">Move Evaluation Breakdown</h3>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {analysisResult.moves.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => handleStep(idx + 1)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    currentStep === idx + 1
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-500">{m.moveNumber}.</span>
                    <span className="font-mono font-bold text-sm text-white">{m.san}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-slate-400">
                      {m.evalAfter > 0 ? `+${m.evalAfter}` : m.evalAfter}
                    </span>
                    {getQualityBadge(m.quality)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
