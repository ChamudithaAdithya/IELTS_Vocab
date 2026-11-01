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

interface TabDefinition {
  id: AppTab;
  label: string;
  badge?: string;
  badgeClass?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  activeClass: string;
  inactiveClass: string;
}

const TABS: TabDefinition[] = [
  {
    id: 'cambridge',
    label: 'Cambridge Library',
    badge: 'Books 1–18',
    badgeClass: 'bg-indigo-500/20 text-indigo-600 font-mono font-extrabold',
    icon: Library,
    iconColor: 'text-indigo-400',
    activeClass: 'bg-slate-900 text-white font-bold shadow-xs border-slate-900',
    inactiveClass: 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-transparent font-semibold',
  },
  {
    id: 'listening',
    label: 'Listening Tests',
    badge: 'Real Audio',
    badgeClass: 'bg-purple-100 text-purple-700 font-bold',
    icon: Headphones,
    iconColor: 'text-purple-500',
    activeClass: 'bg-slate-900 text-white font-bold shadow-xs border-slate-900',
    inactiveClass: 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-transparent font-semibold',
  },
  {
    id: 'reading',
    label: 'Reading Tests',
    badge: 'Dual-Pane',
    badgeClass: 'bg-emerald-100 text-emerald-700 font-bold',
    icon: BookOpen,
    iconColor: 'text-emerald-500',
    activeClass: 'bg-slate-900 text-white font-bold shadow-xs border-slate-900',
    inactiveClass: 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-transparent font-semibold',
  },
  {
    id: 'tutor',
    label: 'Writing Tutor AI',
    badge: 'Task 1 & 2',
    badgeClass: 'bg-amber-400 text-slate-950 font-mono font-extrabold',
    icon: Sparkles,
    iconColor: 'text-amber-300',
    activeClass: 'bg-indigo-600 text-white font-bold shadow-xs border-indigo-600',
    inactiveClass: 'text-indigo-900 hover:text-indigo-950 hover:bg-indigo-50 border-transparent font-semibold',
  },
  {
    id: 'speaking',
    label: 'Speaking Tutor',
    badge: 'Interviews',
    badgeClass: 'bg-red-100 text-red-700 font-bold',
    icon: Mic,
    iconColor: 'text-red-500',
    activeClass: 'bg-slate-900 text-white font-bold shadow-xs border-slate-900',
    inactiveClass: 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-transparent font-semibold',
  },
  {
    id: 'analytics',
    label: 'Analytics & Tracker',
    icon: Award,
    iconColor: 'text-amber-500',
    activeClass: 'bg-slate-900 text-white font-bold shadow-xs border-slate-900',
    inactiveClass: 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-transparent font-semibold',
  },
];

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
          {/* Logo & Brand (Switches to Cambridge Library in the same page) */}
          <button 
            type="button"
            onClick={() => setCurrentTab('cambridge')}
            className="flex items-baseline gap-2 cursor-pointer select-none group text-left"
            title="Cambridge Library Hub"
          >
            <span className="font-extrabold text-slate-900 tracking-tight text-lg group-hover:text-indigo-600 transition-colors">
              Cambridge IELTS Master
            </span>
            <span className="text-[10px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Books 1–18 Real Tests
            </span>
          </button>

          {/* Top Controls */}
          <div className="flex items-center gap-2">
            {/* Sinhala Toggle Switch */}
            <button
              type="button"
              onClick={() => setShowSinhala(prev => !prev)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
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
              className="px-2 py-1 sm:px-2.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Voice & Pronunciation Settings"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice</span>
            </button>
          </div>
        </div>

        {/* Real Cambridge Tests Navigation Bar - Switches in the same page */}
        <nav className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1.5 border-t border-slate-100 text-xs sm:text-sm font-medium">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                  isActive ? tab.activeClass : tab.inactiveClass
                }`}
                title={tab.label}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.iconColor}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded ${tab.badgeClass}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
