import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/screens/HomeScreen';
import { PlayScreen } from './components/screens/PlayScreen';
import { PlayVsAIScreen } from './components/screens/PlayVsAIScreen';
import { PlayOfflinePvPScreen } from './components/screens/PlayOfflinePvPScreen';
import { PlayOnlineScreen } from './components/screens/PlayOnlineScreen';
import { AITutorScreen } from './components/screens/AITutorScreen';
import { AnalysisScreen } from './components/screens/AnalysisScreen';
import { LearnScreen } from './components/screens/LearnScreen';
import { PuzzlesScreen } from './components/screens/PuzzlesScreen';
import { GameHistoryScreen } from './components/screens/GameHistoryScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { GameSettings, UserProfile, GameHistoryItem } from './types/chess';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Settings State
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('chessmind_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      timeControl: '10+0',
      playerColor: 'w',
      boardTheme: 'emerald',
      pieceStyle: 'standard',
      soundEnabled: true,
      soundVolume: 0.5,
      showLegalMoves: true,
      autoQueen: false,
      theme: 'dark',
      reducedMotion: false,
    };
  });

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('chessmind_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      username: 'Grandmaster flex',
      blitzElo: 1450,
      rapidElo: 1520,
      aiElo: 1380,
      gamesPlayed: 24,
      wins: 16,
      losses: 6,
      draws: 2,
      currentStreak: 4,
      bestStreak: 7,
      puzzlesSolved: 12,
      puzzleRating: 1420,
      lessonsCompleted: ['b1-board-basics'],
    };
  });

  // Game History State
  const [historyItems, setHistoryItems] = useState<GameHistoryItem[]>(() => {
    const saved = localStorage.getItem('chessmind_history');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('chessmind_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('chessmind_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('chessmind_history', JSON.stringify(historyItems));
  }, [historyItems]);

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const handleCompleteLesson = (lessonId: string) => {
    setUserProfile((prev) => {
      if (prev.lessonsCompleted.includes(lessonId)) return prev;
      return {
        ...prev,
        lessonsCompleted: [...prev.lessonsCompleted, lessonId],
      };
    });
  };

  const handleGameComplete = (pgn: string, result: 'win' | 'loss' | 'draw') => {
    const ratingDelta = result === 'win' ? 15 : result === 'loss' ? -12 : 0;

    const newHistoryItem: GameHistoryItem = {
      id: `gh-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      opponentName: 'ChessMind Bot',
      opponentRating: 1300,
      mode: 'ai',
      userColor: 'w',
      result,
      reason: result === 'win' ? 'Checkmate' : result === 'loss' ? 'Checkmate' : 'Draw',
      movesCount: pgn.split(' ').length / 2,
      durationSeconds: 300,
      pgn,
      fenHistory: [],
      ratingChange: ratingDelta,
    };

    setHistoryItems((prev) => [newHistoryItem, ...prev]);

    setUserProfile((prev) => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      wins: result === 'win' ? prev.wins + 1 : prev.wins,
      losses: result === 'loss' ? prev.losses + 1 : prev.losses,
      draws: result === 'draw' ? prev.draws + 1 : prev.draws,
      currentStreak: result === 'win' ? prev.currentStreak + 1 : 0,
      bestStreak: result === 'win' ? Math.max(prev.bestStreak, prev.currentStreak + 1) : prev.bestStreak,
      aiElo: prev.aiElo + ratingDelta,
    }));
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Splash Opening Animation */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Main App Navigation Header */}
      <Navbar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main Screen Content Body */}
      <main className="flex-1 pb-16">
        {activeScreen === 'home' && (
          <HomeScreen userProfile={userProfile} onNavigate={setActiveScreen} />
        )}
        {activeScreen === 'play' && (
          <PlayScreen
            onSelectMode={(mode) => {
              if (mode === 'vs_ai') setActiveScreen('vs_ai');
              else if (mode === 'online') setActiveScreen('online');
              else if (mode === 'offline_pvp') setActiveScreen('offline_pvp');
            }}
          />
        )}
        {activeScreen === 'vs_ai' && (
          <PlayVsAIScreen settings={settings} onGameComplete={handleGameComplete} />
        )}
        {activeScreen === 'offline_pvp' && (
          <PlayOfflinePvPScreen settings={settings} />
        )}
        {activeScreen === 'online' && (
          <PlayOnlineScreen settings={settings} username={userProfile.username} />
        )}
        {activeScreen === 'ai-tutor' && <AITutorScreen />}
        {activeScreen === 'analysis' && <AnalysisScreen />}
        {activeScreen === 'learn' && (
          <LearnScreen
            completedLessonIds={userProfile.lessonsCompleted}
            onCompleteLesson={handleCompleteLesson}
          />
        )}
        {activeScreen === 'puzzles' && <PuzzlesScreen />}
        {activeScreen === 'history' && (
          <GameHistoryScreen
            historyItems={historyItems}
            onSelectReplay={() => setActiveScreen('analysis')}
            onSelectAnalyze={() => setActiveScreen('analysis')}
          />
        )}
        {activeScreen === 'profile' && <ProfileScreen userProfile={userProfile} />}
        {activeScreen === 'settings' && (
          <SettingsScreen settings={settings} onUpdateSettings={handleUpdateSettings} />
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="w-full border-t border-slate-800/80 py-4 text-center text-slate-500 text-xs glass-panel">
        ChessMind AI Platform • Think. Learn. Play. Master.
      </footer>
    </div>
  );
};
