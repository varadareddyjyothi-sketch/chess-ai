import React, { useState } from 'react';
import { GameHistoryItem } from '../../types/chess';
import { History, Search, Filter, Play, BarChart2, Trash2 } from 'lucide-react';

interface GameHistoryScreenProps {
  historyItems: GameHistoryItem[];
  onSelectReplay: (item: GameHistoryItem) => void;
  onSelectAnalyze: (item: GameHistoryItem) => void;
}

export const GameHistoryScreen: React.FC<GameHistoryScreenProps> = ({
  historyItems,
  onSelectReplay,
  onSelectAnalyze,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'ai' | 'online_pvp' | 'offline_pvp'>('all');

  const sampleHistory: GameHistoryItem[] = [
    {
      id: 'gh-1',
      date: '2026-09-04',
      opponentName: 'ChessMind AI (Intermediate)',
      opponentRating: 1300,
      mode: 'ai',
      userColor: 'w',
      result: 'win',
      reason: 'Checkmate',
      movesCount: 28,
      durationSeconds: 340,
      pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O Nf6',
      fenHistory: [],
      ratingChange: +12,
    },
    {
      id: 'gh-2',
      date: '2026-09-03',
      opponentName: 'GrandmasterFlex99',
      opponentRating: 1480,
      mode: 'online_pvp',
      userColor: 'b',
      result: 'loss',
      reason: 'Resignation',
      movesCount: 42,
      durationSeconds: 620,
      pgn: '1. d4 Nf6 2. c4 e6 3. Nc3 Bb4',
      fenHistory: [],
      ratingChange: -10,
    },
    {
      id: 'gh-3',
      date: '2026-09-02',
      opponentName: 'Local Player 2',
      opponentRating: 1200,
      mode: 'offline_pvp',
      userColor: 'w',
      result: 'draw',
      reason: 'Stalemate',
      movesCount: 35,
      durationSeconds: 450,
      pgn: '1. e4 e5 2. f4 exf4',
      fenHistory: [],
      ratingChange: 0,
    },
  ];

  const itemsToDisplay = historyItems.length > 0 ? historyItems : sampleHistory;

  const filtered = itemsToDisplay.filter((item) => {
    const matchesSearch = item.opponentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterMode === 'all' || item.mode === filterMode;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <History className="w-8 h-8 text-indigo-400" /> Game <span className="gradient-text">History</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review past games, re-examine move histories, and launch post-game AI analysis.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by opponent name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'ai', label: 'vs AI' },
            { id: 'online_pvp', label: 'Online' },
            { id: 'offline_pvp', label: 'Local PvP' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterMode(btn.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterMode === btn.id
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Items List */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
        {filtered.map((item) => (
          <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  item.result === 'win'
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                    : item.result === 'loss'
                    ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {item.result === 'win' ? 'W' : item.result === 'loss' ? 'L' : 'D'}
              </div>

              <div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  vs {item.opponentName}
                  <span className="text-xs font-normal text-slate-400">({item.opponentRating} Elo)</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {item.date} • {item.movesCount} moves • Reason: {item.reason}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full ${
                  item.ratingChange > 0
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : item.ratingChange < 0
                    ? 'bg-rose-500/10 text-rose-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {item.ratingChange > 0 ? `+${item.ratingChange}` : item.ratingChange} Elo
              </span>

              <button
                onClick={() => onSelectAnalyze(item)}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-400 flex items-center gap-1.5"
              >
                <BarChart2 className="w-3.5 h-3.5" /> Analyze
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
