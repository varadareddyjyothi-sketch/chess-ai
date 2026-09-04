import React from 'react';
import { UserProfile } from '../../types/chess';
import { User, Trophy, Flame, Zap, Award, Target, Shield, CheckCircle2 } from 'lucide-react';

interface ProfileScreenProps {
  userProfile: UserProfile;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ userProfile }) => {
  const winRate = userProfile.gamesPlayed > 0 
    ? Math.round((userProfile.wins / userProfile.gamesPlayed) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Profile Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-1 shadow-2xl">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <User className="w-12 h-12 text-indigo-400" />
          </div>
        </div>

        <div className="text-center md:text-left space-y-1">
          <div className="inline-block px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            Grandmaster Aspirant
          </div>
          <h1 className="text-3xl font-extrabold text-white">{userProfile.username}</h1>
          <p className="text-slate-400 text-sm">Joined ChessMind AI • Active Player</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <Trophy className="w-6 h-6 text-amber-400 mb-2" />
          <div className="text-xs uppercase font-semibold text-slate-400">Blitz Elo</div>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">{userProfile.blitzElo}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <Zap className="w-6 h-6 text-indigo-400 mb-2" />
          <div className="text-xs uppercase font-semibold text-slate-400">Rapid Elo</div>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">{userProfile.rapidElo}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <Flame className="w-6 h-6 text-rose-400 mb-2" />
          <div className="text-xs uppercase font-semibold text-slate-400">Current Streak</div>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">{userProfile.currentStreak} 🔥</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <Target className="w-6 h-6 text-sky-400 mb-2" />
          <div className="text-xs uppercase font-semibold text-slate-400">Win Rate</div>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">{winRate}%</div>
        </div>
      </div>

      {/* Achievements Badges */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Unlockable Achievements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'First Blood', desc: 'Win your first game vs AI or player', unlocked: true },
            { title: 'Tactical Genius', desc: 'Solve 10 daily chess puzzles', unlocked: userProfile.puzzlesSolved >= 10 },
            { title: 'Streak Master', desc: 'Reach a 5-day win streak', unlocked: userProfile.bestStreak >= 5 },
          ].map((ach, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                ach.unlocked
                  ? 'bg-indigo-950/40 border-indigo-500/40 text-white'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${ach.unlocked ? 'text-emerald-400' : 'text-slate-600'}`} />
              <div>
                <div className="font-bold text-xs">{ach.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{ach.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
