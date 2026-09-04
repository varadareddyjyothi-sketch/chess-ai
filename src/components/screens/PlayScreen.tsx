import React from 'react';
import { Globe, Users, Bot, ChevronRight, Shield, Zap, Swords } from 'lucide-react';

interface PlayScreenProps {
  onSelectMode: (mode: 'online' | 'offline_pvp' | 'vs_ai') => void;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({ onSelectMode }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Select Game Mode
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Choose how you want to play today. Train against AI offline, challenge a friend locally, or match online globally.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Play Online Card */}
        <div
          onClick={() => onSelectMode('online')}
          className="glass-card p-8 rounded-3xl cursor-pointer border border-slate-800 hover:border-indigo-500/60 transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Globe className="w-7 h-7 text-indigo-400" />
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
              Multiplayer
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
              Play Online
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Challenge players around the world in real-time matches via WebSocket server or create private invite rooms.
            </p>
          </div>

          <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20">
            Play Online <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Play Offline PvP Card */}
        <div
          onClick={() => onSelectMode('offline_pvp')}
          className="glass-card p-8 rounded-3xl cursor-pointer border border-slate-800 hover:border-purple-500/60 transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-purple-400" />
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
              Local PvP
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
              Play Offline
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Play locally with a friend on the same screen without requiring an internet connection.
            </p>
          </div>

          <button className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20">
            Local Game <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Play vs AI Card */}
        <div
          onClick={() => onSelectMode('vs_ai')}
          className="glass-card p-8 rounded-3xl cursor-pointer border border-slate-800 hover:border-emerald-500/60 transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Bot className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
              AI Engine
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
              Play vs AI
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Train against intelligent engine bots (Beginner to Expert) with non-blocking Web Worker AI search.
            </p>
          </div>

          <button className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20">
            Play AI <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
