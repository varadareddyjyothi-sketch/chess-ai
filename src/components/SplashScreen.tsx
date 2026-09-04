import React, { useEffect, useState } from 'react';
import { Sparkles, Shield, Cpu, ChevronRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  const handleSkip = () => {
    setIsSkipped(true);
    onComplete();
  };

  if (isSkipped) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white selection:bg-indigo-500 overflow-hidden">
      {/* Background glow animations */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>

      {/* Floating Chess Pieces Silhouettes */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-2xl shadow-indigo-500/30 animate-float">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
            <Cpu className="w-12 h-12 text-indigo-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* App Branding */}
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-sans text-center mb-2">
        ChessMind <span className="gradient-text">AI</span>
      </h1>

      <p className="text-slate-400 text-lg md:text-xl font-medium tracking-wide mb-10 text-center">
        Think. Learn. Play. Master.
      </p>

      {/* Progress Bar */}
      <div className="w-72 md:w-96 bg-slate-900/80 p-1.5 rounded-full border border-slate-800 shadow-inner mb-6">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 transition-all duration-150 ease-out shadow-lg shadow-indigo-500/50"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-widest mb-12">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Initializing Neural Engine & Boards...
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="px-5 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium tracking-wider flex items-center gap-1.5 transition-all hover:text-white"
      >
        Skip Intro <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
