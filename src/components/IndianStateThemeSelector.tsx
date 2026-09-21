import React from 'react';
import { Sparkles, Check, Compass, MapPin, Music } from 'lucide-react';
import { IndianStateId, IndianStateTheme } from '../types';
import { INDIAN_STATE_THEMES } from '../assets/scenes';

interface IndianStateThemeSelectorProps {
  selectedState: IndianStateId;
  onSelectState: (stateId: IndianStateId) => void;
}

export const IndianStateThemeSelector: React.FC<IndianStateThemeSelectorProps> = ({
  selectedState,
  onSelectState,
}) => {
  const themesList = Object.values(INDIAN_STATE_THEMES);
  const currentTheme = INDIAN_STATE_THEMES[selectedState];

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-purple-900/40 p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            Select Indian State Wedding Theme
          </h2>
          <p className="text-xs text-purple-300/80">
            Choose your cultural heritage to apply authentic 3D Pixar attire, regional blessings & wedding aesthetics
          </p>
        </div>
        <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          12 Cultural Themes
        </span>
      </div>

      {/* Grid of Indian State Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {themesList.map((theme) => {
          const isSelected = theme.id === selectedState;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectState(theme.id)}
              className={`relative rounded-xl overflow-hidden border p-2 text-left transition-all group flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-400 bg-purple-950/80 ring-2 ring-amber-400/50 shadow-lg shadow-purple-900/50 scale-[1.02]'
                  : 'border-purple-900/40 bg-slate-950/60 hover:border-purple-600/70 hover:bg-slate-900/80'
              }`}
            >
              {/* Image thumbnail of 3D Pixar Couple in State Attire */}
              <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden mb-2 bg-black">
                <img
                  src={theme.officialCoupleImage}
                  alt={theme.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                <div className="absolute bottom-1.5 left-1.5 right-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-amber-300 border border-amber-400/30">
                    {theme.region}
                  </span>
                </div>
              </div>

              {/* State Details */}
              <div>
                <div className="font-bold text-xs text-white group-hover:text-amber-300 transition truncate">
                  {theme.stateLabel}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {theme.blessingHeader.replace(/\|/g, '').trim()}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Theme Highlight Banner & 4-Scene Auto-Sync Strip */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/90 via-slate-950 to-amber-950/70 border border-amber-500/40 space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Active Culture Theme: {currentTheme.name}</span>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-900/60 text-purple-200 border border-purple-700/50">
            All 4 Scenes Auto-Synced ✨
          </span>
        </div>

        {/* 4-Scene Preview Strip */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
            <span>Scenes automatically updated to {currentTheme.stateLabel} theme:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currentTheme.scenes.map((scene, idx) => (
              <div
                key={scene.id}
                className="relative rounded-lg overflow-hidden border border-purple-800/50 bg-slate-900/90 p-1.5 flex flex-col gap-1.5"
              >
                <div className="relative aspect-[9/16] rounded overflow-hidden bg-black">
                  <img
                    src={scene.imageUrl}
                    alt={scene.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-amber-300 border border-amber-400/30">
                    Scene {idx + 1}
                  </div>
                </div>
                <div className="px-0.5">
                  <div className="font-bold text-[11px] text-white truncate">{scene.title}</div>
                  <div className="text-[9px] text-purple-300/80 line-clamp-1">{scene.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-purple-900/40">
          <div>
            <span className="font-semibold text-pink-300">👰 Bride's Regional Attire:</span>
            <p className="text-slate-300 mt-0.5">{currentTheme.brideAttire}</p>
          </div>
          <div>
            <span className="font-semibold text-indigo-300">🤵 Groom's Regional Attire:</span>
            <p className="text-slate-300 mt-0.5">{currentTheme.groomAttire}</p>
          </div>
        </div>

        <div className="text-[10px] text-amber-200/90 flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-purple-900/30">
          <span>✨ Cultural Blessing: {currentTheme.blessingHeader}</span>
          <span className="text-slate-400 font-mono">Ceremony: {currentTheme.ceremonyType}</span>
        </div>
      </div>
    </div>
  );
};
