import React from 'react';
import {
  ArrowLeft,
  ChevronDown,
  FlaskConical,
  Gauge,
  History,
  Maximize2,
  Minimize2,
  Plus,
  Sliders,
  Sparkles
} from 'lucide-react';
import type {
  BuddyMode,
  BuddyPersonality,
  BuddyTurnPerfRecord,
  CorrectionIntensity,
  ExplanationLangMode
} from '../../types/speakingBuddy';
import { BUDDY_MODES, BUDDY_PERSONALITIES } from '../../utils/speakingBuddyEngine';

export interface BuddyTopHeaderProps {
  hasBack: boolean;
  onBack: () => void;
  onOpenHistory: () => void;
  mode: BuddyMode;
  onChangeMode: (next: BuddyMode) => void;
  personality: BuddyPersonality;
  onChangePersonality: (next: BuddyPersonality) => void;
  intensity: CorrectionIntensity;
  onChangeIntensity: (next: CorrectionIntensity) => void;
  explanationLangMode: ExplanationLangMode;
  onChangeExplanationLangMode: (next: ExplanationLangMode) => void;
  onNewChat: () => void;
  latestPerf: BuddyTurnPerfRecord | null;
  onOpenPerfModal: () => void;
  onOpenOrbLabModal: () => void;
  isAudioSettingsOpen: boolean;
  onToggleAudioSettings: () => void;
  engineLabel: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const BuddyTopHeader: React.FC<BuddyTopHeaderProps> = ({
  hasBack,
  onBack,
  onOpenHistory,
  mode,
  onChangeMode,
  personality,
  onChangePersonality,
  intensity,
  onChangeIntensity,
  explanationLangMode,
  onChangeExplanationLangMode,
  onNewChat,
  latestPerf,
  onOpenPerfModal,
  onOpenOrbLabModal,
  isAudioSettingsOpen,
  onToggleAudioSettings,
  engineLabel,
  isFullscreen,
  onToggleFullscreen
}) => {
  return (
    <header className="shrink-0 sticky lg:static top-0 z-20 h-16 px-4 sm:px-6 border-b border-white/75 flex items-center justify-between gap-3 bg-white/72 backdrop-blur-xl shadow-[0_2px_16px_rgba(37,99,235,0.05)]">
      {/* Left: Back to Platform + History Drawer Trigger + Lingo Buddy Brand */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {hasBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Back to IELTS Platform"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenHistory}
          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          title="Conversations & History"
        >
          <History className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate">
                Lingo Buddy
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span>English Companion</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block truncate">
              Speak freely. Make mistakes. Learn naturally.
            </p>
          </div>
        </div>
      </div>

      {/* Center: Clean SaaS Pill Selectors */}
      <div className="hidden md:flex items-center gap-2">
        <div className="relative flex items-center">
          <select
            value={mode}
            onChange={(e) => onChangeMode(e.target.value as BuddyMode)}
            aria-label="Conversation Mode"
            className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-full pl-3.5 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all cursor-pointer"
          >
            {BUDDY_MODES.map(m => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none -ml-6" />
        </div>

        <div className="relative flex items-center">
          <select
            value={personality}
            onChange={(e) => onChangePersonality(e.target.value as BuddyPersonality)}
            aria-label="Companion Personality"
            className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-full pl-3.5 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all cursor-pointer"
          >
            {BUDDY_PERSONALITIES.map(p => (
              <option key={p.id} value={p.id}>
                {p.label} Tone
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none -ml-6" />
        </div>

        <div className="relative flex items-center">
          <select
            value={intensity}
            onChange={(e) => onChangeIntensity(e.target.value as CorrectionIntensity)}
            aria-label="Correction Intensity"
            className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-full pl-3.5 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all cursor-pointer"
          >
            <option value="gentle">Gentle Friend</option>
            <option value="balanced">Balanced Coach</option>
            <option value="detailed">Detailed Teacher</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none -ml-6" />
        </div>

        <div className="relative hidden xl:flex items-center">
          <select
            value={explanationLangMode}
            onChange={(e) => onChangeExplanationLangMode(e.target.value as ExplanationLangMode)}
            aria-label="Explanation Language Mode"
            className="appearance-none bg-indigo-50/80 hover:bg-indigo-100/70 border border-indigo-200/90 rounded-full pl-3.5 pr-8 py-1.5 text-xs font-semibold text-indigo-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all cursor-pointer"
          >
            <option value="english">English Only</option>
            <option value="simple_english">Simple English</option>
            <option value="bilingual_si">English + සිංහල</option>
            <option value="sinhala_focused">සිංහල Focused</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-indigo-400 pointer-events-none -ml-6" />
        </div>
      </div>

      {/* Right: New Chat + Orb Lab & QA + Audio Settings + Full Screen */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onNewChat}
          className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          title="Start a new conversation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        <button
          type="button"
          onClick={onOpenPerfModal}
          className="px-2.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Real-Time Voice Latency Diagnostics (12-stage performance.now() telemetry)"
        >
          <Gauge className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden xl:inline">
            {latestPerf?.durations.userEndToFirstAudioMs != null
              ? `${latestPerf.durations.userEndToFirstAudioMs}ms`
              : 'Latency'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenOrbLabModal}
          className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-xs font-semibold text-purple-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="14-State Living Orb Lab, 50-Scenario QA Suite & Turn Traces"
        >
          <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
          <span className="hidden lg:inline">Orb Lab &amp; QA</span>
        </button>

        <button
          type="button"
          onClick={onToggleAudioSettings}
          className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isAudioSettingsOpen
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
          }`}
          title="Voice Engine, Accent & Microphone Settings"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">{engineLabel}</span>
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          className={`p-2 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            isFullscreen
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
          title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Enter Full Screen'}
          aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-blue-600" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
