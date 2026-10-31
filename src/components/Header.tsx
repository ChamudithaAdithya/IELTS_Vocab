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
  Volume2,
  PenTool,
  Headphones,
  Award,
  TrendingUp
} from 'lucide-react';

export type AppTab = 'tutor' | 'speaking' | 'reading' | 'listening' | 'analytics' | 'lessons' | 'flashcards' | 'quiz' | 'bank';

interface HeaderProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
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
            onClick={() => setCurrentTab('tutor')} 
            className="flex items-baseline gap-2 cursor-pointer select-none"
          >
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">
              IELTS Master AI
            </span>
            <span className="text-[10px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Band 8+ Tutor
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
              title="Voice & Pronunciation Settings"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice</span>
            </button>

            {/* Progress counter */}
            <span className="text-xs text-slate-500 hidden sm:inline pl-1 border-l border-slate-200">
              {masteredCount}/{totalWords} words
            </span>
          </div>
        </div>

        {/* Organized Navigation Bar: AI Tutor Suite + Vocab Master */}
        <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1.5 border-t border-slate-100 text-xs sm:text-sm font-medium">
          {/* Writing Tutor (Main Tab) */}
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
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-red-500" />
            <span>Speaking Tutor</span>
          </button>

          {/* Reading Tutor */}
          <button
            type="button"
            onClick={() => setCurrentTab('reading')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'reading'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reading Tutor</span>
          </button>

          {/* Listening Tutor */}
          <button
            type="button"
            onClick={() => setCurrentTab('listening')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'listening'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-indigo-500" />
            <span>Listening Tutor</span>
          </button>

          {/* Analytics & Coach */}
          <button
            type="button"
            onClick={() => setCurrentTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'analytics'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Analytics & Coach</span>
          </button>

          <span className="w-px h-4 bg-slate-200 mx-1 shrink-0" />

          {/* Vocabulary Lessons */}
          <button
            type="button"
            onClick={() => setCurrentTab('lessons')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'lessons'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Lessons
          </button>

          {/* Flashcards */}
          <button
            type="button"
            onClick={() => setCurrentTab('flashcards')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'flashcards'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Flashcards
          </button>

          {/* Word Bank */}
          <button
            type="button"
            onClick={() => setCurrentTab('bank')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'bank'
                ? 'bg-slate-900 text-white font-bold'
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
