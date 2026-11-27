import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type {
  BuddyMode,
  BuddyPersonality,
  BuddySession,
  CorrectionIntensity,
  ExplanationLangMode
} from '../../types/speakingBuddy';
import { BUDDY_MODES, BUDDY_PERSONALITIES } from '../../utils/speakingBuddyEngine';

export interface BuddyHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: BuddySession[];
  activeSessionId?: string;
  onNewChat: () => void;
  onSelectSession: (sess: BuddySession) => void;
  onDeleteSession: (id: string) => void;
  mode: BuddyMode;
  onChangeMode: (next: BuddyMode) => void;
  personality: BuddyPersonality;
  onChangePersonality: (next: BuddyPersonality) => void;
  intensity: CorrectionIntensity;
  onChangeIntensity: (next: CorrectionIntensity) => void;
  explanationLangMode: ExplanationLangMode;
  onChangeExplanationLangMode: (next: ExplanationLangMode) => void;
}

export const BuddyHistoryDrawer: React.FC<BuddyHistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  mode,
  onChangeMode,
  personality,
  onChangePersonality,
  intensity,
  onChangeIntensity,
  explanationLangMode,
  onChangeExplanationLangMode
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-xs flex animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-80 max-w-[85%] h-full bg-white border-r border-slate-200 p-5 flex flex-col justify-between shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Conversations</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onNewChat}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {sessions.map(sess => {
              const isActive = sess.id === activeSessionId;
              return (
                <div
                  key={sess.id}
                  onClick={() => onSelectSession(sess)}
                  className={`group flex items-center justify-between gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-slate-50/70 border-transparent hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{sess.title}</p>
                    <span className="text-[10px] text-slate-400">
                      {sess.messages.length} messages
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(sess.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 cursor-pointer transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Mode, Personality, Intensity & Language controls inside drawer */}
        <div className="pt-4 border-t border-slate-200 space-y-2 md:hidden">
          <select
            value={mode}
            onChange={(e) => onChangeMode(e.target.value as BuddyMode)}
            aria-label="Conversation Mode"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
          >
            {BUDDY_MODES.map(m => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={personality}
            onChange={(e) => onChangePersonality(e.target.value as BuddyPersonality)}
            aria-label="Companion Personality"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
          >
            {BUDDY_PERSONALITIES.map(p => (
              <option key={p.id} value={p.id}>
                {p.label} Tone
              </option>
            ))}
          </select>
          <select
            value={intensity}
            onChange={(e) => onChangeIntensity(e.target.value as CorrectionIntensity)}
            aria-label="Correction Intensity"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
          >
            <option value="gentle">Gentle Friend</option>
            <option value="balanced">Balanced Coach</option>
            <option value="detailed">Detailed Teacher</option>
          </select>
          <select
            value={explanationLangMode}
            onChange={(e) => onChangeExplanationLangMode(e.target.value as ExplanationLangMode)}
            aria-label="Explanation Language Mode"
            className="w-full bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 text-xs font-semibold text-indigo-700"
          >
            <option value="english">English Only</option>
            <option value="simple_english">Simple English</option>
            <option value="bilingual_si">English + සිංහල</option>
            <option value="sinhala_focused">සිංහල Focused</option>
          </select>
        </div>
      </div>
    </div>
  );
};
