import React from 'react';
import { 
  BookOpen, 
  Mic, 
  Search, 
  Languages, 
  Sparkles,
  Volume2,
  Headphones,
  Award,
  Library
} from 'lucide-react';

export type AppTab = 'cambridge' | 'listening' | 'reading' | 'tutor' | 'speaking' | 'analytics';

interface HeaderProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  showSinhala: boolean;
  setShowSinhala: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenVoiceSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  showSinhala,
  setShowSinhala,
  onOpenVoiceSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentTab('cambridge')} 
            className="flex items-baseline gap-2 cursor-pointer select-none"
          >
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">
              Cambridge IELTS Master
            </span>
            <span className="text-[10px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Books 1–18 Real Tests
            </span>
          </div>

          {/* Top Controls */}
          <div className="flex items-center gap-2">
            {/* Sinhala Toggle Switch */}
            <button
              type="button"
              onClick={() => setShowSinhala(prev => !prev)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                showSinhala
                  ? 'bg-slate-100 text-slate-900 border-slate-300'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-slate-700'
              }`}
              title="Toggle Sinhala translations"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{showSinhala ? 'Sinhala: ON' : 'Sinhala: OFF'}</span>
            </button>

            {/* Voice & Pronunciation Settings */}
            <button
              type="button"
              onClick={onOpenVoiceSettings}
              className="px-2 py-1 sm:px-2.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5"
              title="Voice & Pronunciation Settings"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice</span>
            </button>
          </div>
        </div>

        {/* Exclusive Real Cambridge Tests Navigation Bar */}
        <nav className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1.5 border-t border-slate-100 text-xs sm:text-sm font-medium">
          {/* Cambridge Past Papers Central Library (Flagship) */}
          <button
            type="button"
            onClick={() => setCurrentTab('cambridge')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'cambridge'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold'
            }`}
          >
            <Library className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cambridge Library</span>
            <span className="text-[9px] uppercase tracking-wider font-extrabold bg-indigo-500/20 text-indigo-600 px-1.5 py-0.2 rounded font-mono">
              Books 1–18
            </span>
          </button>

          {/* Listening Tests */}
          <button
            type="button"
            onClick={() => setCurrentTab('listening')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'listening'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-purple-500" />
            <span>Listening Tests</span>
            <span className="text-[9px] uppercase tracking-wider font-bold bg-purple-100 text-purple-700 px-1 py-0.2 rounded">
              Real Audio
            </span>
          </button>

          {/* Reading Tests */}
          <button
            type="button"
            onClick={() => setCurrentTab('reading')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'reading'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span>Reading Tests</span>
            <span className="text-[9px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-700 px-1 py-0.2 rounded">
              Dual-Pane
            </span>
          </button>

          {/* Writing Tutor AI */}
          <button
            type="button"
            onClick={() => setCurrentTab('tutor')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'tutor'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-indigo-900 hover:text-indigo-950 hover:bg-indigo-50 font-semibold'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Writing Tutor AI</span>
            <span className="text-[9px] uppercase tracking-wider font-extrabold bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-mono">
              Task 1 & 2
            </span>
          </button>

          {/* Speaking Tutor */}
          <button
            type="button"
            onClick={() => setCurrentTab('speaking')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'speaking'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-red-500" />
            <span>Speaking Tutor</span>
            <span className="text-[9px] uppercase tracking-wider font-bold bg-red-100 text-red-700 px-1 py-0.2 rounded">
              Interviews
            </span>
          </button>

          {/* Analytics & Coach */}
          <button
            type="button"
            onClick={() => setCurrentTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'analytics'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Analytics & Tracker</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
