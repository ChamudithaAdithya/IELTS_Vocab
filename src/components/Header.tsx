import React from 'react';
import { 
  BookOpen, 
  Layers, 
  Mic, 
  Search, 
  Languages, 
  Bookmark, 
  Sparkles,
  Check,
  Volume2
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'lessons' | 'flashcards' | 'quiz' | 'lab' | 'bank' | 'tutor';
  setCurrentTab: (tab: 'lessons' | 'flashcards' | 'quiz' | 'lab' | 'bank' | 'tutor') => void;
  showSinhala: boolean;
  setShowSinhala: (val: boolean | ((prev: boolean) => boolean)) => void;
  masteredCount: number;
  totalWords: number;
  bookmarkedCount: number;
  onOpenSearch: () => void;
  onOpenVoiceSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  showSinhala,
  setShowSinhala,
  masteredCount,
  totalWords,
  bookmarkedCount,
  onOpenSearch,
  onOpenVoiceSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentTab('lessons')} 
            className="flex items-baseline gap-2 cursor-pointer select-none"
          >
            <span className="font-bold text-slate-900 tracking-tight text-lg">
              IELTS Master
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Band 7+
            </span>
          </div>

          {/* Controls */}
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

            {/* Search Button */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="px-2.5 py-1 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent transition-colors flex items-center gap-1.5"
              title="Search vocabulary"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Voice & Pronunciation Settings */}
            <button
              type="button"
              onClick={onOpenVoiceSettings}
              className="px-2 py-1 sm:px-2.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5"
              title="Voice & Pronunciation Settings (iPhone/Android voices, speed)"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice</span>
            </button>

            {/* Progress counter */}
            <span className="text-xs text-slate-500 hidden sm:inline pl-1 border-l border-slate-200">
              {masteredCount}/{totalWords} learned
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1.5 border-t border-slate-100 text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setCurrentTab('lessons')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              currentTab === 'lessons'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Lessons
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('flashcards')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              currentTab === 'flashcards'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Flashcards
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('quiz')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              currentTab === 'quiz'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Vocabulary Test
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('lab')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              currentTab === 'lab'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Speaking & Writing Lab
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('tutor')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'tutor'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-indigo-900 hover:text-indigo-950 hover:bg-indigo-50 font-semibold'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Writing Tutor AI</span>
            <span className="text-[9px] uppercase tracking-wider font-extrabold bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-mono">
              Band 8
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('bank')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'bank'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Word Bank</span>
            {bookmarkedCount > 0 && (
              <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-1.5 py-0.2 rounded-full">
                {bookmarkedCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
