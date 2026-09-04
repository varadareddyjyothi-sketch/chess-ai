import React from 'react';
import { 
  Play, BookOpen, Bot, BarChart2, Award, Zap, Trophy, Flame, Target, ChevronRight, Users, Shield, Sparkles
} from 'lucide-react';
import { UserProfile } from '../../types/chess';

interface HomeScreenProps {
  userProfile: UserProfile;
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ userProfile, onNavigate }) => {
  const winPercentage = userProfile.gamesPlayed > 0 
    ? Math.round((userProfile.wins / userProfile.gamesPlayed) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-12 border border-slate-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Welcome Back, {userProfile.username}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold font-sans text-white tracking-tight leading-tight">
              Your Chess Journey <span className="gradient-text">Mastery Awaits</span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-xl">
              Elevate your tactical prowess with ChessMind AI. Train against offline engine bots, analyze your completed games, or challenge players online in real time.
            </p>

            {/* Primary & Secondary Quick Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('play')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
              >
                <Play className="w-4 h-4 fill-white" /> Play Now
              </button>

              <button
                onClick={() => onNavigate('learn')}
                className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold text-sm flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" /> Learn Chess
              </button>

              <button
                onClick={() => onNavigate('analysis')}
                className="px-5 py-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 text-slate-300 hover:text-white font-medium text-sm flex items-center gap-2 transition-all"
              >
                <BarChart2 className="w-4 h-4 text-purple-400" /> Analyze Game
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Blitz Rating</span>
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-white">{userProfile.blitzElo}</div>
              <div className="text-xs text-emerald-400 mt-1 font-medium">+15 Elo this week</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Win Rate</span>
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-white">{winPercentage}%</div>
              <div className="text-xs text-slate-400 mt-1">{userProfile.wins}W / {userProfile.losses}L</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Streak</span>
                <Flame className="w-5 h-5 text-rose-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-white">{userProfile.currentStreak} 🔥</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Best: {userProfile.bestStreak}</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Puzzles Solved</span>
                <Target className="w-5 h-5 text-sky-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-white">{userProfile.puzzlesSolved}</div>
              <div className="text-xs text-sky-400 mt-1 font-medium">Rating: {userProfile.puzzleRating}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Play AI Card */}
        <div 
          onClick={() => onNavigate('play')}
          className="glass-card p-6 rounded-2xl cursor-pointer group hover:border-indigo-500/50 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
              Play vs AI Engine
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Train against 4 intelligent AI bot difficulty tiers running locally via Web Worker.
            </p>
          </div>
          <div className="flex items-center text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
            Start Match <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* AI Tutor Card */}
        <div 
          onClick={() => onNavigate('ai-tutor')}
          className="glass-card p-6 rounded-2xl cursor-pointer group hover:border-purple-500/50 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              ChessMind AI Tutor
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Ask questions about board positions, get tactical hints, and understand move mistakes in plain language.
            </p>
          </div>
          <div className="flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
            Open AI Tutor <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Daily Puzzles Card */}
        <div 
          onClick={() => onNavigate('puzzles')}
          className="glass-card p-6 rounded-2xl cursor-pointer group hover:border-sky-500/50 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
              Daily Chess Puzzles
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Solve tactical puzzles daily, build your streak, and unlock post-solution explanations.
            </p>
          </div>
          <div className="flex items-center text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
            Solve Puzzle <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
