import React from 'react';
import { 
  Menu, 
  Search, 
  Volume2, 
  Languages, 
  Target, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { AppTab, NAV_CATEGORIES } from '../data/navigation';

interface TopBarProps {
  currentTab: AppTab;
  onOpenMobileMenu: () => void;
  showSinhala: boolean;
  setShowSinhala: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenVoiceSettings: () => void;
  onOpenSearch: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onOpenMobileMenu,
  showSinhala,
  setShowSinhala,
  onOpenVoiceSettings,
  onOpenSearch,
}) => {
  // Find current tab details
  let currentCategory = 'Cambridge Exam Hub';
  let currentItem = {
    label: 'Cambridge Library',
    badge: 'Books 1–18',
    iconColor: 'text-indigo-600',
  };

  for (const cat of NAV_CATEGORIES) {
    const found = cat.items.find(i => i.id === currentTab);
    if (found) {
      currentCategory = cat.title;
      currentItem = found;
      break;
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Left: Mobile Menu Toggle + Breadcrumb / Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
                  {currentCategory}
                </span>
                <span className="text-slate-300 hidden sm:inline">/</span>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate flex items-center gap-2">
                  <span>{currentItem.label}</span>
                  {currentItem.badge && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 hidden md:inline">
                      {currentItem.badge}
                    </span>
                  )}
                </h1>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Word Search Pill */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
              title="Search vocabulary, definitions & exam topics (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search...</span>
              <kbd className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* Sinhala Toggle Switch */}
            <button
              type="button"
              onClick={() => setShowSinhala(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                showSinhala
                  ? 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle Sinhala translations across all modules"
            >
              <Languages className={`w-3.5 h-3.5 ${showSinhala ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">සිංහල:</span>
              <span>{showSinhala ? 'ON' : 'OFF'}</span>
            </button>

            {/* Voice Settings Launcher */}
            <button
              type="button"
              onClick={onOpenVoiceSettings}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Studio Natural Voice Settings"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Voice</span>
            </button>

            {/* Target Band Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-2xs">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Target: Band 7.5+</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

