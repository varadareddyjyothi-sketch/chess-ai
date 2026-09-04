import React from 'react';
import { GameSettings } from '../../types/chess';
import { Settings as SettingsIcon, Volume2, VolumeX, Eye, Palette, Shield } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface SettingsScreenProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const handleSoundToggle = (enabled: boolean) => {
    soundService.setMuted(!enabled);
    onUpdateSettings({ soundEnabled: enabled });
  };

  const handleVolumeChange = (vol: number) => {
    soundService.setVolume(vol);
    onUpdateSettings({ soundVolume: vol });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-indigo-400" /> Platform <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Customize board themes, audio cues, accessibility, and move indicators.
        </p>
      </div>

      {/* Board Theme Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-400" /> Board Theme
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'emerald', name: 'Dark Emerald', colors: 'from-[#769656] to-[#eeeed2]' },
            { id: 'wood', name: 'Classic Wood', colors: 'from-[#b58863] to-[#f0d9b5]' },
            { id: 'glass', name: 'Frost Glass', colors: 'from-slate-700 to-slate-200' },
            { id: 'slate', name: 'Slate Gray', colors: 'from-slate-600 to-slate-300' },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => onUpdateSettings({ boardTheme: theme.id as any })}
              className={`p-4 rounded-xl border text-center transition-all ${
                settings.boardTheme === theme.id
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${theme.colors} mb-2 shadow-inner`}></div>
              <span className="text-xs font-bold text-white">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sound Settings */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-indigo-400" /> Audio & Sound Effects
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <div className="text-sm font-bold text-white">Synthesized Audio Cues</div>
            <div className="text-xs text-slate-400">Play web audio tones on moves, captures, checks, and game end.</div>
          </div>
          <button
            onClick={() => handleSoundToggle(!settings.soundEnabled)}
            className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
              settings.soundEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
          </button>
        </div>

        {settings.soundEnabled && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>Volume</span>
              <span>{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Accessibility & Assistance */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400" /> Gameplay Assistance & Accessibility
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <div className="text-sm font-bold text-white">Highlight Legal Move Indicators</div>
            <div className="text-xs text-slate-400">Display green dots and capture rings on eligible squares.</div>
          </div>
          <button
            onClick={() => onUpdateSettings({ showLegalMoves: !settings.showLegalMoves })}
            className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
              settings.showLegalMoves ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <div className="text-sm font-bold text-white">Auto Queen Pawn Promotion</div>
            <div className="text-xs text-slate-400">Automatically promote advancing pawns to Queen without showing selection dialog.</div>
          </div>
          <button
            onClick={() => onUpdateSettings({ autoQueen: !settings.autoQueen })}
            className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
              settings.autoQueen ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
          </button>
        </div>
      </div>
    </div>
  );
};
