import React from 'react';
import { Sparkles } from 'lucide-react';
import type {
  BuddyFluencyMetrics,
  BuddyLearningAnalytics,
  BuddyMemoryItem,
  BuddyMemoryState,
  BuddyMessage,
  ExplanationLangMode,
  GrammarCategoryCode,
  PersonalGrammarNote,
  PronunciationSpotlight,
  SavedBuddyVocabItem,
  TryAgainAttemptResult
} from '../../types/speakingBuddy';
import { BuddyFeedbackCard } from './BuddyFeedbackCard';
import { BuddyLearningPanel } from './BuddyLearningPanel';

export interface BuddyCoachingRailColumnProps {
  rightTab: 'feedback' | 'hub';
  onChangeRightTab: (tab: 'feedback' | 'hub') => void;
  totalFindings: number;
  analyzedUserTurns: BuddyMessage[];
  focusedFeedbackId: string | null;
  lastUserMsgId?: string;
  onSelectFeedbackMsg: (msgId: string | null) => void;
  showSinhala: boolean;
  explanationLangMode: ExplanationLangMode;
  recognitionLang: string;
  categoryCountsMap: Record<string, number>;
  savedVocabSet: Set<string>;
  onToggleMistakeLearned: (msgId: string, mkId: string) => void;
  onRequestEditTurn: (msgId: string, currentText: string) => void;
  onSaveVocab: (item: Omit<SavedBuddyVocabItem, 'id' | 'savedAt'>) => void;
  onTryAgainComplete: (msgId: string, res: TryAgainAttemptResult) => void;
  onBeforeStartTryAgain: () => void;
  onInspectRule: () => void;
  learningAnalytics: BuddyLearningAnalytics;
  buddyMemory: BuddyMemoryState;
  savedVocab: SavedBuddyVocabItem[];
  grammarLibrary: PersonalGrammarNote[];
  sessionsCount: number;
  latestFluency: BuddyFluencyMetrics | null;
  recentPronunciationSpotlights: PronunciationSpotlight[];
  onChangeExplanationLangMode: (mode: ExplanationLangMode) => void;
  onPracticeCategory: (category: GrammarCategoryCode) => void;
  onRemoveVocab: (id: string) => void;
  onToggleMemoryEnabled: (enabled: boolean) => void;
  onAddManualMemory: (label: string, detail: string, category: BuddyMemoryItem['category']) => void;
  onDeleteMemoryItem: (id: string) => void;
  onClearAllMemories: () => void;
  onRemoveGrammarNote: (id: string) => void;
  onResetAnalytics: () => void;
}

export const BuddyCoachingRailColumn: React.FC<BuddyCoachingRailColumnProps> = ({
  rightTab,
  onChangeRightTab,
  totalFindings,
  analyzedUserTurns,
  focusedFeedbackId,
  lastUserMsgId,
  onSelectFeedbackMsg,
  showSinhala,
  explanationLangMode,
  recognitionLang,
  categoryCountsMap,
  savedVocabSet,
  onToggleMistakeLearned,
  onRequestEditTurn,
  onSaveVocab,
  onTryAgainComplete,
  onBeforeStartTryAgain,
  onInspectRule,
  learningAnalytics,
  buddyMemory,
  savedVocab,
  grammarLibrary,
  sessionsCount,
  latestFluency,
  recentPronunciationSpotlights,
  onChangeExplanationLangMode,
  onPracticeCategory,
  onRemoveVocab,
  onToggleMemoryEnabled,
  onAddManualMemory,
  onDeleteMemoryItem,
  onClearAllMemories,
  onRemoveGrammarNote,
  onResetAnalytics
}) => {
  const focusedTurn =
    analyzedUserTurns.find(t => t.id === focusedFeedbackId) ||
    analyzedUserTurns[analyzedUserTurns.length - 1] ||
    null;
  const earlierTurns = [...analyzedUserTurns]
    .reverse()
    .filter(t => t.id !== focusedTurn?.id);

  return (
    <aside className="lg:col-span-4 xl:col-span-4 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/85 ring-1 ring-purple-200/40 shadow-[0_10px_32px_rgba(124,58,237,0.06)] flex flex-col h-[520px] lg:h-full lg:min-h-0 overflow-hidden">
      {/* Segmented SaaS Rail Header: Live Feedback | Progress & Hub */}
      <div className="shrink-0 px-4 py-3 border-b border-indigo-100/70 bg-gradient-to-r from-white/75 via-purple-50/35 to-blue-50/35 flex items-center justify-between gap-2">
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/70">
          <button
            type="button"
            onClick={() => onChangeRightTab('feedback')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              rightTab === 'feedback'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Live Feedback</span>
            {totalFindings > 0 && (
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  rightTab === 'feedback'
                    ? 'bg-blue-600 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {totalFindings}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onChangeRightTab('hub')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              rightTab === 'hub'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Progress &amp; Hub
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Fix</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Clean</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Natural</span>
          </span>
        </div>
      </div>

      {/* RIGHT TAB 1: Dedicated Live English Feedback Panel */}
      {rightTab === 'feedback' && (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-3.5">
          {!focusedTurn ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  English Coaching Appears Here
                </p>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Your chat in the centre stays friendly and uninterrupted, while every grammar fix, vocabulary upgrade, Try Again drill, and pronunciation tip appears cleanly here.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Focused / Latest Turn Spotlight */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {focusedTurn.id === lastUserMsgId
                      ? 'Latest Turn Coaching'
                      : 'Selected Turn Coaching'}
                  </span>
                  {focusedTurn.id !== lastUserMsgId && lastUserMsgId && (
                    <button
                      type="button"
                      onClick={() => onSelectFeedbackMsg(null)}
                      className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Back to latest
                    </button>
                  )}
                </div>

                <div className="rounded-2xl ring-2 ring-blue-500/15">
                  <BuddyFeedbackCard
                    key={focusedTurn.id}
                    analysis={focusedTurn.analysis!}
                    showSinhala={showSinhala}
                    explanationLangMode={explanationLangMode}
                    recognitionLang={recognitionLang}
                    categoryCounts={categoryCountsMap}
                    savedVocabPhrases={savedVocabSet}
                    defaultExpanded={true}
                    onToggleLearned={(mkId) => onToggleMistakeLearned(focusedTurn.id, mkId)}
                    onRequestEdit={() => onRequestEditTurn(focusedTurn.id, focusedTurn.text)}
                    onSaveVocab={onSaveVocab}
                    onTryAgainComplete={(res) => onTryAgainComplete(focusedTurn.id, res)}
                    onBeforeStartTryAgain={onBeforeStartTryAgain}
                    onInspectRule={onInspectRule}
                  />
                </div>
              </div>

              {/* Compact Single-Line Switcher for Earlier Turns */}
              {earlierTurns.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-0.5">
                    Earlier Turns ({earlierTurns.length}) · Click to inspect
                  </span>
                  <div className="space-y-1.5">
                    {earlierTurns.map(turn => {
                      const eCount =
                        turn.analysis?.mistakes.filter(
                          m => m.severity === 'GRAMMAR_ERROR'
                        ).length || 0;
                      const tipCount =
                        (turn.analysis?.mistakes.length || 0) +
                        (turn.analysis?.vocabUpgrades?.length || 0);
                      const unclear = turn.analysis?.transcriptQuality === 'unclear';
                      const incomplete =
                        turn.analysis?.transcriptQuality === 'partially_unclear' &&
                        tipCount === 0;
                      const mastered = Boolean(turn.analysis?.tryAgainResult?.matched);

                      return (
                        <button
                          key={turn.id}
                          type="button"
                          onClick={() => onSelectFeedbackMsg(turn.id)}
                          className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                        >
                          <span className="text-xs text-slate-700 truncate font-medium">
                            “{turn.text}”
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                              unclear || incomplete
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : mastered
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : eCount > 0
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : tipCount > 0
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {unclear
                              ? 'Unclear'
                              : incomplete
                              ? 'Incomplete'
                              : mastered
                              ? '✓ Mastered'
                              : eCount > 0
                              ? `${eCount} fix${eCount > 1 ? 'es' : ''}`
                              : tipCount > 0
                              ? `${tipCount} tip${tipCount > 1 ? 's' : ''}`
                              : '✓ Clean'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* RIGHT TAB 2: Progress & Personal Learning Hub */}
      {rightTab === 'hub' && (
        <BuddyLearningPanel
          analytics={learningAnalytics}
          memory={buddyMemory}
          savedVocab={savedVocab}
          grammarLibrary={grammarLibrary}
          sessionsCount={sessionsCount}
          latestFluency={latestFluency}
          recentPronunciationSpotlights={recentPronunciationSpotlights}
          explanationLangMode={explanationLangMode}
          showSinhala={showSinhala}
          onChangeExplanationLangMode={onChangeExplanationLangMode}
          onPracticeCategory={onPracticeCategory}
          onSaveVocab={onSaveVocab}
          onRemoveVocab={onRemoveVocab}
          onToggleMemoryEnabled={onToggleMemoryEnabled}
          onAddManualMemory={onAddManualMemory}
          onDeleteMemoryItem={onDeleteMemoryItem}
          onClearAllMemories={onClearAllMemories}
          onRemoveGrammarNote={onRemoveGrammarNote}
          onResetAnalytics={onResetAnalytics}
        />
      )}
    </aside>
  );
};
