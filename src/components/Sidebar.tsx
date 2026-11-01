import React from 'react';
import { 
  Library, 
  Search, 
  Volume2, 
  Languages, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Target
} from 'lucide-react';
import { UserProgress } from '../types';
import { AppTab, NAV_CATEGORIES } from '../data/navigation';
export type { AppTab } from '../data/navigation';

interface SidebarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  showSinhala: boolean;
  setShowSinhala: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenVoiceSettings: () => void;
  onOpenSearch: () => void;
  userProgress?: UserProgress;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  showSinhala,
  setShowSinhala,
  onOpenVoiceSettings,
  onOpenSearch,
  userProgress,
}) => {
  const masteredCount = userProgress?.masteredWordIds?.length || 0;
  const bookmarkedCount = userProgress?.bookmarkedWordIds?.length || 0;

  const handleSelectTab = (tab: AppTab) => {
    setCurrentTab(tab);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => handleSelectTab('cambridge')}
          className="flex items-center gap-2.5 text-left group overflow-hidden cursor-pointer"
          title="Cambridge IELTS Master"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-extrabold shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <Library className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight block leading-tight truncate group-hover:text-indigo-600 transition-colors">
                Cambridge IELTS
              </span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                Band 8.5 Platform
              </span>
            </div>
          )}
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed(prev => !prev)}
          className="hidden lg:flex w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 items-center justify-center transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
          aria-label={isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Search Bar Trigger */}
      <div className="p-3 border-b border-slate-100 shrink-0">
        <button
          type="button"
          onClick={onOpenSearch}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center px-2' : 'justify-between'
          }`}
          title="Quick Word & Topic Search (Ctrl + K)"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Quick Search...</span>}
          </div>
          {!isCollapsed && (
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-400">
              ⌘K
            </kbd>
          )}
        </button>
      </div>

      {/* Categorized Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5 scrollbar-thin">
        {NAV_CATEGORIES.map((category) => (
          <div key={category.title} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-2.5 pb-1 flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                <span>{category.title}</span>
              </div>
            ) : (
              <div className="px-2 pb-1 text-center text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                {category.shortTitle}
              </div>
            )}

            <div className="space-y-0.5">
              {category.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    } ${isCollapsed ? 'justify-center px-2' : 'justify-start'}`}
                    title={isCollapsed ? `${item.label} — ${item.description}` : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : item.iconColor
                      }`}
                    />

                    {!isCollapsed && (
                      <div className="flex-1 min-w-0 flex items-center justify-between text-left">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                              isActive ? 'bg-white/20 text-white' : item.badgeClass
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Collapsed Tooltip on Hover */}
                    {isCollapsed && (
                      <div className="fixed left-20 ml-2 hidden group-hover:flex flex-col z-50 bg-slate-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] px-1 py-0.2 bg-white/20 rounded">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-300 font-normal">
                          {item.description}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Vocabulary Mastery Pill (when expanded) */}
      {!isCollapsed && (masteredCount > 0 || bookmarkedCount > 0) && (
        <div className="px-3 py-2.5 mx-3 mb-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>Vocabulary Goals</span>
            </span>
            <span className="text-indigo-600 font-mono">{masteredCount} Mastered</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((masteredCount / 100) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Controls / Tools Dock */}
      <div className="p-3 border-t border-slate-200 space-y-1.5 shrink-0 bg-white">
        {/* Sinhala Bilingual Toggle */}
        <button
          type="button"
          onClick={() => setShowSinhala(prev => !prev)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            showSinhala
              ? 'bg-indigo-50/80 text-indigo-900 border-indigo-200 hover:bg-indigo-100/80'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          } ${isCollapsed ? 'justify-center px-2' : 'justify-between'}`}
          title="Toggle Sinhala Assistance (සිංහල පරිවර්තන)"
        >
          <div className="flex items-center gap-2">
            <Languages className={`w-4 h-4 shrink-0 ${showSinhala ? 'text-indigo-600' : 'text-slate-400'}`} />
            {!isCollapsed && <span>Sinhala Helper</span>}
          </div>
          {!isCollapsed && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              showSinhala ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {showSinhala ? 'ON' : 'OFF'}
            </span>
          )}
        </button>

        {/* Natural Voice Settings */}
        <button
          type="button"
          onClick={onOpenVoiceSettings}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center px-2' : 'justify-between'
          }`}
          title="Voice & Accent Settings (Studio HD Natural Voices)"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
            {!isCollapsed && <span>Voice Studio</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
              🇬🇧 HD
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

