import React, { useState, useRef } from 'react';
import {
  TrendingUp,
  Repeat,
  Sparkles,
  Brain,
  BookMarked,
  Volume2,
  BookmarkPlus,
  BookmarkCheck,
  Trash2,
  Search,
  ShieldCheck,
  Plus,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Activity,
  Mic,
  Square,
  Play,
  Languages,
  Info
} from 'lucide-react';
import type {
  BuddyFluencyMetrics,
  BuddyLearningAnalytics,
  BuddyMemoryItem,
  BuddyMemoryState,
  ExplanationLangMode,
  GrammarCategoryCode,
  PersonalGrammarNote,
  PronunciationSpotlight,
  SavedBuddyVocabItem
} from '../../types/speakingBuddy';
import {
  ORGANIC_EXPRESSION_DROPS,
  buildWeeklyEnglishReport,
  computeNormalizedErrorRate,
  getCorrectionSuccessRate,
  getErrorRateTrend,
  getTopRecurringMistakes
} from '../../utils/buddyLearningStore';
import {
  PRONUNCIATION_DRILL_BANK,
  SINHALA_TRANSFER_GUIDE
} from '../../utils/buddySpeechCoach';
import { playSpeech, stopSpeech } from '../../utils/speech';

export interface BuddyLearningPanelProps {
  analytics: BuddyLearningAnalytics;
  memory: BuddyMemoryState;
  savedVocab: SavedBuddyVocabItem[];
  grammarLibrary: PersonalGrammarNote[];
  sessionsCount: number;
  latestFluency?: BuddyFluencyMetrics | null;
  recentPronunciationSpotlights?: PronunciationSpotlight[];
  explanationLangMode: ExplanationLangMode;
  showSinhala: boolean;
  onChangeExplanationLangMode: (mode: ExplanationLangMode) => void;
  onPracticeCategory: (category: GrammarCategoryCode) => void;
  onSaveVocab: (item: Omit<SavedBuddyVocabItem, 'id' | 'savedAt'>) => void;
  onRemoveVocab: (id: string) => void;
  onToggleMemoryEnabled: (enabled: boolean) => void;
  onAddManualMemory: (label: string, detail: string, category: BuddyMemoryItem['category']) => void;
  onDeleteMemoryItem: (id: string) => void;
  onClearAllMemories: () => void;
  onRemoveGrammarNote: (id: string) => void;
  onResetAnalytics: () => void;
}

type HubSubTab = 'progress' | 'weekly' | 'speech' | 'vocab' | 'memory' | 'kb';

export const BuddyLearningPanel: React.FC<BuddyLearningPanelProps> = ({
  analytics,
  memory,
  savedVocab,
  grammarLibrary,
  sessionsCount,
  latestFluency,
  recentPronunciationSpotlights = [],
  explanationLangMode,
  showSinhala,
  onChangeExplanationLangMode,
  onPracticeCategory,
  onSaveVocab,
  onRemoveVocab,
  onToggleMemoryEnabled,
  onAddManualMemory,
  onDeleteMemoryItem,
  onClearAllMemories,
  onRemoveGrammarNote,
  onResetAnalytics
}) => {
  const [subTab, setSubTab] = useState<HubSubTab>('progress');
  const [expressionIndex, setExpressionIndex] = useState<number>(0);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [newMemLabel, setNewMemLabel] = useState<string>('');
  const [newMemCategory, setNewMemCategory] = useState<BuddyMemoryItem['category']>('interest');
  const [kbQuery, setKbQuery] = useState<string>('');
  const [kbFilter, setKbFilter] = useState<'all' | 'grammar' | 'vocab' | 'expressions'>('all');

  // Phase 4 P2.1 — Pronunciation Practice Loop (Listen -> Record -> Compare Audio & Stress)
  const [drillIdx, setDrillIdx] = useState<number>(0);
  const [isRecordingDrill, setIsRecordingDrill] = useState<boolean>(false);
  const [recordedDrillAudioUrl, setRecordedDrillAudioUrl] = useState<string | null>(null);
  const [drillRecError, setDrillRecError] = useState<string | null>(null);
  const drillRecorderRef = useRef<MediaRecorder | null>(null);
  const drillChunksRef = useRef<Blob[]>([]);

  const showSiNotes =
    showSinhala ||
    explanationLangMode === 'bilingual_si' ||
    explanationLangMode === 'sinhala_focused';

  const recurringList = getTopRecurringMistakes(analytics);
  const recurringCount = recurringList.filter(r => r.count >= 2).length;
  const normalizedErrorRate = computeNormalizedErrorRate(
    analytics.totalConfirmedErrors,
    analytics.totalAnalyzedWords
  );
  const successRate = getCorrectionSuccessRate(analytics);
  const trend = getErrorRateTrend(analytics);
  const maxCategoryCount = Math.max(1, recurringList[0]?.count || 1);

  const weeklyReport = buildWeeklyEnglishReport(analytics, savedVocab, sessionsCount);
  const maxDailyRate = Math.max(10, ...weeklyReport.dailySeries.map(d => d.normalizedErrorRate));

  const combinedDrills = [
    ...recentPronunciationSpotlights,
    ...PRONUNCIATION_DRILL_BANK.filter(
      b => !recentPronunciationSpotlights.some(r => r.word.toLowerCase() === b.word.toLowerCase())
    )
  ];
  const currentDrill = combinedDrills[drillIdx % combinedDrills.length];

  const currentDrop = ORGANIC_EXPRESSION_DROPS[expressionIndex % ORGANIC_EXPRESSION_DROPS.length];
  const savedSet = new Set(savedVocab.map(v => v.phrase.toLowerCase()));
  const isDropSaved = savedSet.has(currentDrop.naturalPhrase.toLowerCase());

  const speakText = (id: string, text: string, rate: number = 0.92) => {
    if (speakingId === id) {
      stopSpeech();
      setSpeakingId(null);
      return;
    }
    stopSpeech();
    setSpeakingId(id);
    playSpeech(text, {
      rate,
      onStart: () => setSpeakingId(id),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null)
    });
  };

  const handleToggleRecordDrill = async () => {
    setDrillRecError(null);
    if (isRecordingDrill) {
      try {
        drillRecorderRef.current?.stop();
      } catch { }
      setIsRecordingDrill(false);
      return;
    }

    stopSpeech();
    if (!navigator.mediaDevices?.getUserMedia) {
      setDrillRecError('Microphone recording is unavailable in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      drillChunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) drillChunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (drillChunksRef.current.length > 0) {
          const blob = new Blob(drillChunksRef.current, { type: rec.mimeType || 'audio/webm' });
          if (recordedDrillAudioUrl) URL.revokeObjectURL(recordedDrillAudioUrl);
          setRecordedDrillAudioUrl(URL.createObjectURL(blob));
        }
        setIsRecordingDrill(false);
      };
      drillRecorderRef.current = rec;
      setIsRecordingDrill(true);
      rec.start();
    } catch {
      setIsRecordingDrill(false);
      setDrillRecError('Allow microphone permission to record and compare your voice.');
    }
  };

  const handlePlayMyDrillRecording = () => {
    if (!recordedDrillAudioUrl) return;
    const audio = new Audio(recordedDrillAudioUrl);
    audio.play().catch(() => { });
  };

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemLabel.trim()) return;
    onAddManualMemory(newMemLabel.trim(), `Saved ${newMemCategory}: ${newMemLabel.trim()}`, newMemCategory);
    setNewMemLabel('');
  };

  // Unified searchable Knowledge Base entries (5.4)
  const q = kbQuery.trim().toLowerCase();
  const filteredGrammar = grammarLibrary.filter(g => {
    if (kbFilter !== 'all' && kbFilter !== 'grammar') return false;
    if (!q) return true;
    return (
      g.original.toLowerCase().includes(q) ||
      g.correction.toLowerCase().includes(q) ||
      g.categoryLabel.toLowerCase().includes(q) ||
      g.rule.toLowerCase().includes(q)
    );
  });
  const filteredVocab = savedVocab.filter(v => {
    if (kbFilter === 'grammar') return false;
    if (kbFilter === 'vocab' && v.category === 'expression') return false;
    if (kbFilter === 'expressions' && v.category !== 'expression') return false;
    if (!q) return true;
    return (
      v.phrase.toLowerCase().includes(q) ||
      (v.original || '').toLowerCase().includes(q) ||
      v.explanation.toLowerCase().includes(q) ||
      v.synonyms.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50/40">
      {/* Compact Phase 3 & Phase 4 Sub-Navigation Pills */}
      <div className="shrink-0 px-3.5 py-2.5 border-b border-slate-200/80 bg-white flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'progress' as HubSubTab, label: 'Progress', icon: TrendingUp },
          { id: 'weekly' as HubSubTab, label: 'Weekly', icon: Calendar },
          { id: 'speech' as HubSubTab, label: 'Speech & SI', icon: Activity },
          { id: 'vocab' as HubSubTab, label: `Vocab (${savedVocab.length})`, icon: Sparkles },
          { id: 'memory' as HubSubTab, label: `Memory (${memory.items.length})`, icon: Brain },
          { id: 'kb' as HubSubTab, label: 'Library', icon: BookMarked }
        ].map(tab => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${active
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scrollable Hub Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
        {/* =============================================================== */}
        {/* SUB-TAB 1: PROGRESS & RECURRING MISTAKES (P1.4 + Guideline §5)  */}
        {/* =============================================================== */}
        {subTab === 'progress' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-white border border-slate-200/90 p-3 space-y-0.5 shadow-xs">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {analytics.totalMistakesCorrected}
                </span>
                <p className="text-[11px] text-slate-500 font-medium">Mistakes corrected</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200/90 p-3 space-y-0.5 shadow-xs">
                <span className="text-2xl font-bold text-amber-600 tabular-nums">
                  {recurringCount}
                </span>
                <p className="text-[11px] text-slate-500 font-medium">Recurring patterns</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200/90 p-3 space-y-0.5 shadow-xs">
                <span className="text-2xl font-bold text-purple-600 tabular-nums">
                  {savedVocab.length}
                </span>
                <p className="text-[11px] text-slate-500 font-medium">Expressions saved</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200/90 p-3 space-y-0.5 shadow-xs">
                <span className="text-2xl font-bold text-emerald-600 tabular-nums">
                  {analytics.totalTryAgainAttempts > 0 ? `${successRate}%` : '—'}
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Try Again success
                  {analytics.totalTryAgainAttempts > 0
                    ? ` (${analytics.totalTryAgainSuccesses}/${analytics.totalTryAgainAttempts})`
                    : ''}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50/75 border border-blue-200 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                  Normalized Error Rate
                </span>
                <span className="text-sm font-bold text-blue-900 font-mono">
                  {analytics.totalAnalyzedWords > 0 ? `${normalizedErrorRate}%` : '0.0%'}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">{trend.label}</p>
              <p className="text-[10px] text-slate-500">
                Calculated across {analytics.totalAnalyzedWords} analyzed words ({analytics.totalConfirmedErrors} confirmed errors per 100 words).
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-amber-600" />
                  <span>Frequently Repeated Mistakes</span>
                </h4>
                {analytics.totalAnalyzedWords > 0 && (
                  <button
                    type="button"
                    onClick={onResetAnalytics}
                    className="text-[10px] font-semibold text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    Reset stats
                  </button>
                )}
              </div>

              {recurringList.length === 0 ? (
                <div className="rounded-2xl bg-white border border-slate-200/90 p-4 text-center space-y-1 shadow-xs">
                  <p className="text-xs font-semibold text-slate-800">No recurring mistakes yet!</p>
                  <p className="text-[11px] text-slate-500">
                    Keep chatting naturally — Lingo Buddy will automatically highlight your top grammar habits here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recurringList.slice(0, 6).map(rec => {
                    const pct = Math.max(12, Math.round((rec.count / maxCategoryCount) * 100));
                    return (
                      <div
                        key={rec.category}
                        className="rounded-xl bg-white border border-slate-200/90 p-3 space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900">
                              {rec.categoryLabel}
                            </span>
                            <span className="ml-2 text-[11px] text-amber-600 font-mono font-semibold">
                              {rec.count} {rec.count === 1 ? 'time' : 'times'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onPracticeCategory(rec.category)}
                            className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          >
                            <span>Practice</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {rec.recentExamples[0] && (
                          <p className="text-[11px] text-slate-500 truncate">
                            Recent:{' '}
                            <span className="line-through text-rose-600">
                              {rec.recentExamples[0].original}
                            </span>{' '}
                            →{' '}
                            <span className="text-emerald-700 font-medium">
                              {rec.recentExamples[0].correction}
                            </span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* SUB-TAB 2: WEEKLY ENGLISH IMPROVEMENT REPORT (Phase 4 P2.2)     */}
        {/* =============================================================== */}
        {subTab === 'weekly' && (
          <div className="space-y-4">
            {/* Report Header Card matching Phase 4 §2 Layout */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-blue-200 p-3.5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 block">
                    WEEKLY ENGLISH REPORT
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">7-Day Learning Summary</h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-blue-200 text-blue-700 font-semibold">
                  {weeklyReport.sessionsCount} {weeklyReport.sessionsCount === 1 ? 'session' : 'sessions'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="rounded-xl bg-white border border-slate-200/90 py-2 px-1">
                  <span className="text-sm font-bold text-slate-900 tabular-nums block">
                    {weeklyReport.minutesSpoken}m
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium">spoken</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-200/90 py-2 px-1">
                  <span className="text-sm font-bold text-sky-600 tabular-nums block">
                    {weeklyReport.wordsSpoken}
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium">words</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-200/90 py-2 px-1">
                  <span className="text-sm font-bold text-amber-600 tabular-nums block">
                    {weeklyReport.mistakesCorrected}
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium">fixed</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-200/90 py-2 px-1">
                  <span className="text-sm font-bold text-purple-600 tabular-nums block">
                    {weeklyReport.expressionsLearned}
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium">vocab</span>
                </div>
              </div>
            </div>

            {/* 7-Day Normalized Error Rate Chart */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-900">
                  Grammar Accuracy Trend (7 Days)
                </span>
                <span className="text-[10px] text-slate-500">Errors / 100 words</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 items-end h-24 pt-2">
                {weeklyReport.dailySeries.map(day => {
                  const hasActivity = day.wordsSpoken > 0;
                  const barPct = hasActivity
                    ? Math.max(14, Math.min(100, Math.round((day.normalizedErrorRate / maxDailyRate) * 100)))
                    : 8;
                  return (
                    <div
                      key={day.dateKey}
                      className="flex flex-col items-center gap-1 h-full justify-end"
                      title={
                        hasActivity
                          ? `${day.dayLabel}: ${day.wordsSpoken} words, ${day.confirmedErrors} errors (${day.normalizedErrorRate}%)`
                          : `${day.dayLabel}: No speaking turns logged`
                      }
                    >
                      <span className="text-[9px] font-mono text-slate-500">
                        {hasActivity ? `${day.normalizedErrorRate}%` : '—'}
                      </span>
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className={`w-full rounded-t-md transition-all ${!hasActivity
                              ? 'bg-slate-100'
                              : day.normalizedErrorRate <= 4
                                ? 'bg-emerald-500'
                                : day.normalizedErrorRate <= 10
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                            }`}
                          style={{ height: `${barPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{day.dayLabel}</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-100">
                {weeklyReport.weekOverWeek.summary}
              </p>
            </div>

            {/* Weekly Achievement & Fluency Highlight */}
            <div className="space-y-2">
              <div className="rounded-xl bg-emerald-50/85 border border-emerald-200 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Weekly Achievement</span>
                </span>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {weeklyReport.weeklyAchievement}
                </p>
              </div>

              <div className="rounded-xl bg-sky-50/85 border border-sky-200 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Fluency &amp; Pace Highlight</span>
                </span>
                <p className="text-xs text-sky-900 leading-relaxed">
                  {weeklyReport.fluencyHighlight}
                </p>
              </div>
            </div>

            {/* Next Week's Personalized Focus */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900">Next Week&apos;s Focus Plan</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {weeklyReport.nextWeekActionPlan.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mandatory Phase 4 Integrity Guardrail */}
            <p className="text-[10px] text-slate-500 flex items-start gap-1.5 leading-relaxed px-1">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
              <span>
                Integrity note: Weekly statistics are personal learning analytics, not official IELTS Band scores.
              </span>
            </p>
          </div>
        )}

        {/* =============================================================== */}
        {/* SUB-TAB 3: SPEECH LAB (P2.1 Fluency + Pronunciation) & P2.3 SI  */}
        {/* =============================================================== */}
        {subTab === 'speech' && (
          <div className="space-y-4">
            {/* P2.3 Four Explanation Language Mode Selector */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-3 space-y-2 shadow-xs">
              <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-blue-600" />
                <span>Explanation Language Mode</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'english', label: 'English Only' },
                    { id: 'simple_english', label: 'Simple English' },
                    { id: 'bilingual_si', label: 'English + සිංහල' },
                    { id: 'sinhala_focused', label: 'සිංහල Focused' }
                  ] as const
                ).map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeExplanationLangMode(opt.id)}
                    className={`py-1.5 px-2.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${explanationLangMode === opt.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* P2.1 Seven-Metric Fluency Dashboard */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-600" />
                  <span>7-Metric Fluency Snapshot</span>
                </h4>
                {latestFluency && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-semibold">
                    {latestFluency.paceLabel}
                  </span>
                )}
              </div>

              {!latestFluency ? (
                <p className="text-[11px] text-slate-500">
                  Speak a turn with Lingo Buddy to see your live WPM pace, pause rhythm, hesitations, repetitions, self-corrections, sentence length, and idea development.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2">
                      <span className="text-sm font-bold text-sky-600 block">{latestFluency.wpm}</span>
                      <span className="text-[9px] text-slate-500 font-medium">Speed (WPM)</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2">
                      <span className="text-sm font-bold text-slate-900 block">
                        {latestFluency.pauseCount}
                        {latestFluency.avgPauseSec > 0 ? ` (${latestFluency.avgPauseSec}s)` : ''}
                      </span>
                      <span className="text-[9px] text-slate-500 font-medium">Pauses</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2">
                      <span className="text-sm font-bold text-amber-600 block">
                        {latestFluency.hesitationCount}
                      </span>
                      <span className="text-[9px] text-slate-500 font-medium">Hesitations</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2">
                      <span className="text-sm font-bold text-slate-900 block">
                        {latestFluency.repetitionCount}
                      </span>
                      <span className="text-[9px] text-slate-500 font-medium">Repetitions</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2">
                      <span className="text-sm font-bold text-slate-900 block">
                        {latestFluency.selfCorrectionCount}
                      </span>
                      <span className="text-[9px] text-slate-500 font-medium">Self-Fixes</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2">
                      <span className="text-sm font-bold text-emerald-600 block">
                        {latestFluency.avgSentenceLength}w
                      </span>
                      <span className="text-[9px] text-slate-500 font-medium">Avg Sent Len</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] px-1">
                    <span className="text-slate-500 font-medium">Response Development:</span>
                    <span className="font-bold text-emerald-700">
                      {latestFluency.responseDevelopment} ({latestFluency.developmentScore}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1.5 border-t border-slate-100">
                    {latestFluency.clarityRhythmNote}
                  </p>
                </>
              )}
            </div>

            {/* P2.1 Interactive Pronunciation & Word-Stress Practice Loop */}
            <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-white to-blue-50 border border-sky-200 p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
                  Pronunciation &amp; Stress Lab
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDrillIdx(i => (i + 1) % combinedDrills.length);
                    setRecordedDrillAudioUrl(null);
                  }}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-sky-50 border border-sky-200 text-slate-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Next Word</span>
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-base font-bold text-slate-900 capitalize">
                    {currentDrill.word}
                  </span>
                  <span className="text-xs font-mono text-sky-700 font-medium">{currentDrill.ipa}</span>
                </div>
                <p className="text-xs font-bold text-blue-700">
                  {currentDrill.stressPattern}
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed">{currentDrill.tip}</p>
                {showSiNotes && (
                  <p className="text-[11px] text-indigo-700 font-sinhala leading-relaxed">
                    {currentDrill.tipSi}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 italic">“{currentDrill.example}”</p>
              </div>

              {/* Practice Loop: Listen -> Repeat Aloud -> Compare Audio */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      `drill-${currentDrill.word}`,
                      `${currentDrill.word}. ${currentDrill.example}`,
                      0.82
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>1. Listen</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleRecordDrill}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs ${isRecordingDrill
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  {isRecordingDrill ? <Square className="w-3 h-3" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecordingDrill ? 'Stop' : '2. Record Voice'}</span>
                </button>
                {recordedDrillAudioUrl && (
                  <button
                    type="button"
                    onClick={handlePlayMyDrillRecording}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>3. Compare Mine</span>
                  </button>
                )}
              </div>

              {drillRecError && <p className="text-[10px] text-amber-700 font-medium">{drillRecError}</p>}

              <p className="text-[10px] text-slate-500 pt-1.5 border-t border-sky-200/70 leading-relaxed">
                Acoustic note: Compare your recorded voice directly with the reference stress — browser STT confidence is never used to grade phoneme accuracy.
              </p>
            </div>

            {/* P2.3 Sinhala-to-English Structural Transfer Guide */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-blue-600" />
                <span>Sinhala ↔ English Transfer Guide (සිංහල)</span>
              </h4>
              <div className="space-y-2">
                {SINHALA_TRANSFER_GUIDE.map(item => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-white border border-slate-200/90 p-3 space-y-1.5 text-xs shadow-xs"
                  >
                    <p className="font-bold text-slate-900 text-[12px]">{item.titleEn}</p>
                    <p className="text-[11px] text-indigo-700 font-sinhala font-medium">{item.titleSi}</p>
                    <div className="text-[11px] space-y-0.5 pt-1">
                      <p className="text-rose-600 line-through">“{item.commonTransfer}”</p>
                      <p className="text-emerald-700 font-semibold">“{item.naturalEnglish}”</p>
                    </div>
                    <p className="text-[11px] text-slate-600 font-sinhala leading-relaxed pt-1.5 border-t border-slate-100">
                      {item.whySi}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* SUB-TAB 4: VOCABULARY & "TEACH ME SOMETHING NEW" (P1.2 + 5.2)   */}
        {/* =============================================================== */}
        {subTab === 'vocab' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-white to-cyan-50 border border-purple-200 p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Teach Me Something New</span>
                </span>
                <button
                  type="button"
                  onClick={() => setExpressionIndex(i => (i + 1) % ORGANIC_EXPRESSION_DROPS.length)}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-purple-50 border border-purple-200 text-slate-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Next</span>
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-slate-500 text-[11px]">
                  Instead of: <span className="text-slate-700 font-medium">“{currentDrop.basicPhrase}”</span>
                </p>
                <p className="text-sm font-bold text-slate-900">“{currentDrop.naturalPhrase}”</p>
                <p className="text-[11px] text-slate-700 leading-relaxed">{currentDrop.explanation}</p>
                {showSiNotes && (
                  <p className="text-[11px] text-indigo-700 font-sinhala leading-relaxed">
                    {currentDrop.explanationSi}
                  </p>
                )}
                <p className="text-[11px] text-purple-800 italic pt-1">
                  Example: “{currentDrop.example}”
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                <div className="flex items-center gap-1 flex-wrap">
                  {currentDrop.synonyms.slice(0, 2).map((syn, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-purple-200 text-purple-700 font-medium"
                    >
                      {syn}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      speakText(currentDrop.id, `${currentDrop.naturalPhrase}. ${currentDrop.example}`)
                    }
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3 text-blue-600" />
                    <span>{speakingId === currentDrop.id ? 'Stop' : 'Hear'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isDropSaved}
                    onClick={() =>
                      onSaveVocab({
                        phrase: currentDrop.naturalPhrase,
                        original: currentDrop.basicPhrase,
                        explanation: currentDrop.explanation,
                        explanationSi: currentDrop.explanationSi,
                        example: currentDrop.example,
                        synonyms: currentDrop.synonyms,
                        category: currentDrop.category
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 border cursor-pointer ${isDropSaved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                      }`}
                  >
                    {isDropSaved ? (
                      <>
                        <BookmarkCheck className="w-3 h-3" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3 h-3" />
                        <span>1-Click Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900">
                Your Saved Vocabulary Collection ({savedVocab.length})
              </h4>

              {savedVocab.length === 0 ? (
                <div className="rounded-2xl bg-white border border-slate-200/90 p-4 text-center text-xs text-slate-500 shadow-xs">
                  Save natural expressions above or click <strong className="text-purple-700">Save Vocab</strong> on any live feedback card to build your personal bank.
                </div>
              ) : (
                <div className="space-y-2">
                  {savedVocab.map(item => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-white border border-slate-200/90 p-3 space-y-1.5 text-xs shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 text-[13px]">{item.phrase}</span>
                          {item.original && (
                            <span className="ml-2 text-[10px] text-slate-500">
                              (replaces “{item.original}”)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => speakText(item.id, `${item.phrase}. ${item.example}`)}
                            className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer"
                            title="Play pronunciation"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveVocab(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Remove saved item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-700">{item.explanation}</p>
                      {showSiNotes && item.explanationSi && (
                        <p className="text-[11px] text-indigo-700 font-sinhala">{item.explanationSi}</p>
                      )}
                      <p className="text-[11px] text-slate-500 italic">“{item.example}”</p>
                      <div className="flex items-center justify-between gap-2 pt-1 text-[10px] text-slate-400">
                        <span>
                          {item.synonyms.length > 0 ? `Also: ${item.synonyms.join(', ')}` : item.category}
                        </span>
                        <span>{new Date(item.savedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* SUB-TAB 5: LONG-TERM MEMORY & PRIVACY CONTROLS (P1.3)           */}
        {/* =============================================================== */}
        {subTab === 'memory' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Personalization Memory</span>
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Remember your interests &amp; goals across sessions so Lingo Buddy feels like a real friend.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={memory.enabled}
                  onClick={() => onToggleMemoryEnabled(!memory.enabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${memory.enabled ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${memory.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Privacy guarantee: Personal memories are stored separately from grammar analytics and never store raw transcripts indiscriminately. Delete any item or wipe everything in 1 click.
              </p>
            </div>

            <form onSubmit={handleAddMemorySubmit} className="flex items-center gap-1.5">
              <select
                value={newMemCategory}
                onChange={(e) => setNewMemCategory(e.target.value as BuddyMemoryItem['category'])}
                className="bg-white border border-slate-200 rounded-xl px-2 py-2 text-[11px] text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="interest">Interest</option>
                <option value="goal">Goal</option>
                <option value="topic">Field</option>
              </select>
              <input
                type="text"
                value={newMemLabel}
                onChange={(e) => setNewMemLabel(e.target.value)}
                placeholder="e.g., React & TypeScript, Band 7.5..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newMemLabel.trim()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white cursor-pointer shadow-xs"
                title="Add memory"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">
                  What Lingo Buddy Remembers ({memory.items.length})
                </h4>
                {memory.items.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAllMemories}
                    className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Wipe All Memories
                  </button>
                )}
              </div>

              {memory.items.length === 0 ? (
                <div className="rounded-2xl bg-white border border-slate-200/90 p-4 text-center space-y-1 shadow-xs">
                  <p className="text-xs font-semibold text-slate-800">No personal memories stored yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Mention what you&apos;re learning (e.g., &ldquo;I&apos;m learning React and TypeScript&rdquo;), your hobbies, or your IELTS goal — or add one above!
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {memory.items.map(item => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-white border border-slate-200/90 px-3 py-2.5 flex items-center justify-between gap-2 shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                            {item.category}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.detail}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteMemoryItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                        title="Delete this memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* SUB-TAB 6: PERSONAL ENGLISH KNOWLEDGE BASE (5.4)                */}
        {/* =============================================================== */}
        {subTab === 'kb' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={kbQuery}
                onChange={(e) => setKbQuery(e.target.value)}
                placeholder="Search grammar rules, mistakes, or vocab..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'grammar', label: `Grammar (${grammarLibrary.length})` },
                  { id: 'vocab', label: 'Vocab' },
                  { id: 'expressions', label: 'Expressions' }
                ] as const
              ).map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setKbFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer ${kbFilter === f.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredGrammar.length === 0 && filteredVocab.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200/90 p-5 text-center space-y-1 shadow-xs">
                <BookMarked className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-800">Your Personal Library is empty</p>
                <p className="text-[11px] text-slate-500">
                  Every grammar mistake detected and every vocabulary expression you save is automatically organized here for quick revision.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredGrammar.map(g => (
                  <div
                    key={g.id}
                    className="rounded-xl bg-white border border-slate-200/90 p-3 space-y-1.5 text-xs shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="line-through text-rose-600">“{g.original}”</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-emerald-700 font-semibold">“{g.correction}”</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {g.mastered && (
                          <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemoveGrammarNote(g.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-blue-700 font-semibold">
                      {g.categoryLabel} · {g.rule}
                    </p>
                    <p className="text-[11px] text-slate-600">{g.explanation}</p>
                  </div>
                ))}

                {filteredVocab.map(v => (
                  <div
                    key={v.id}
                    className="rounded-xl bg-purple-50/75 border border-purple-200 p-3 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-purple-900">{v.phrase}</span>
                      <button
                        type="button"
                        onClick={() => speakText(v.id, `${v.phrase}. ${v.example}`)}
                        className="p-1 rounded bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-700">{v.explanation}</p>
                    <p className="text-[11px] text-slate-500 italic">“{v.example}”</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
