import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Volume2,
  Sparkles,
  BookOpen,
  Lightbulb,
  Check,
  ShieldAlert,
  HelpCircle,
  Edit3,
  Mic,
  MicOff,
  BookmarkPlus,
  BookmarkCheck,
  Repeat,
  RotateCcw
} from 'lucide-react';
import type {
  BuddyGrammarAnalysis,
  BuddyMistake,
  BuddyVocabUpgrade,
  ExplanationLangMode,
  FeedbackSeverity,
  SavedBuddyVocabItem,
  TryAgainAttemptResult
} from '../../types/speakingBuddy';
import { playSpeech, stopSpeech } from '../../utils/speech';
import { evaluateTryAgainAttempt } from '../../utils/buddyLearningStore';

export interface BuddyFeedbackCardProps {
  analysis: BuddyGrammarAnalysis;
  showSinhala?: boolean;
  /** Phase 4 P2.3 — Four Explanation Language Modes */
  explanationLangMode?: ExplanationLangMode;
  defaultExpanded?: boolean;
  recognitionLang?: string;
  /** Recurring mistake counts by category code (Phase 3 P1.4) */
  categoryCounts?: Record<string, number>;
  /** Saved vocabulary phrases (lowercase) so 1-click Save buttons reflect saved state */
  savedVocabPhrases?: Set<string>;
  onToggleLearned?: (mistakeId: string) => void;
  onRequestEdit?: () => void;
  onSaveVocab?: (item: Omit<SavedBuddyVocabItem, 'id' | 'savedAt'>) => void;
  onTryAgainComplete?: (result: TryAgainAttemptResult) => void;
  /** Stops main Lingo Buddy mic & TTS before Try Again claims the microphone (prevents Chrome dual-STT abort!) */
  onBeforeStartTryAgain?: () => void;
  /** Phase 5 — Triggers the Living Orb's "deep_thinking" state when inspecting a detailed grammar rule */
  onInspectRule?: () => void;
}

const SEVERITY_META: Record<
  FeedbackSeverity,
  { label: string; badgeClass: string; borderClass: string }
> = {
  GRAMMAR_ERROR: {
    label: 'Mistake',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    borderClass: 'border-red-200/90'
  },
  UNNATURAL: {
    label: 'Natural Expression',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    borderClass: 'border-purple-200/85'
  },
  ALTERNATIVE: {
    label: 'Natural Option',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    borderClass: 'border-purple-200/80'
  },
  ADVANCED: {
    label: 'Expression Upgrade',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    borderClass: 'border-purple-200/85'
  }
};

export const BuddyFeedbackCard: React.FC<BuddyFeedbackCardProps> = ({
  analysis,
  showSinhala = false,
  explanationLangMode,
  defaultExpanded = true,
  recognitionLang = 'en-IN',
  categoryCounts,
  savedVocabPhrases,
  onToggleLearned,
  onRequestEdit,
  onSaveVocab,
  onTryAgainComplete,
  onBeforeStartTryAgain,
  onInspectRule
}) => {
  const effectiveLangMode: ExplanationLangMode =
    explanationLangMode || (showSinhala ? 'bilingual_si' : 'english');
  const showSinhalaNotes =
    effectiveLangMode === 'bilingual_si' || effectiveLangMode === 'sinhala_focused';
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  // Phase 3 Section 5.1 — Active "Try Again" Spoken Practice Loop
  const [isRecordingTryAgain, setIsRecordingTryAgain] = useState<boolean>(false);
  const [tryAgainLiveText, setTryAgainLiveText] = useState<string>('');
  const [tryAgainStatusMsg, setTryAgainStatusMsg] = useState<string | null>(null);
  const [showTryAgainTypeBox, setShowTryAgainTypeBox] = useState<boolean>(false);
  const [tryAgainTypedDraft, setTryAgainTypedDraft] = useState<string>('');
  const [localTryResult, setLocalTryResult] = useState<TryAgainAttemptResult | null>(
    analysis.tryAgainResult || null
  );
  const tryRecRef = useRef<any>(null);
  const tryCapturedRef = useRef<string>('');
  const trySilenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tryStartDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (trySilenceTimerRef.current) clearTimeout(trySilenceTimerRef.current);
      if (tryStartDelayRef.current) clearTimeout(tryStartDelayRef.current);
      if (tryRecRef.current) {
        try {
          tryRecRef.current.onresult = null;
          tryRecRef.current.onerror = null;
          tryRecRef.current.onend = null;
          tryRecRef.current.abort();
        } catch { }
        tryRecRef.current = null;
      }
    };
  }, []);

  const activeTryResult = analysis.tryAgainResult || localTryResult;

  const errorCount = analysis.mistakes.filter(m => m.severity === 'GRAMMAR_ERROR').length;
  const suggestionCount = analysis.mistakes.length;
  const vocabCount = analysis.vocabUpgrades?.length || 0;
  const totalCardItems = suggestionCount + vocabCount;

  const speakCoachAudio = (id: string, text: string) => {
    if (speakingId === id) {
      stopSpeech();
      setSpeakingId(null);
      return;
    }
    stopSpeech();
    setSpeakingId(id);
    playSpeech(text, {
      rate: 0.92,
      onStart: () => setSpeakingId(id),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null)
    });
  };

  const handleExplainMistakeAloud = (m: BuddyMistake) => {
    const script =
      m.severity === 'GRAMMAR_ERROR'
        ? `By the way, you said "${m.original}". The correct form is "${m.correction}". ${m.explanation} For example: ${m.example}`
        : `Here is a more natural way to say "${m.original}": try "${m.correction}". ${m.explanation}`;
    speakCoachAudio(m.id, script);
  };

  const commitTryAgainAttempt = (spoken: string) => {
    const clean = spoken.trim();
    if (!clean) return;
    const fixableMistakes = analysis.mistakes.filter(
      m => m.severity === 'GRAMMAR_ERROR' || m.severity === 'UNNATURAL'
    );
    const res = evaluateTryAgainAttempt(
      clean,
      analysis.corrected_sentence,
      fixableMistakes.map(m => m.correction),
      fixableMistakes.map(m => m.original)
    );
    setLocalTryResult(res);
    setTryAgainTypedDraft('');
    setShowTryAgainTypeBox(false);
    if (onTryAgainComplete) {
      onTryAgainComplete(res);
    }
  };

  const cleanupTryAgainMic = () => {
    if (trySilenceTimerRef.current) {
      clearTimeout(trySilenceTimerRef.current);
      trySilenceTimerRef.current = null;
    }
    if (tryStartDelayRef.current) {
      clearTimeout(tryStartDelayRef.current);
      tryStartDelayRef.current = null;
    }
    if (tryRecRef.current) {
      try {
        tryRecRef.current.onresult = null;
        tryRecRef.current.onerror = null;
        tryRecRef.current.onend = null;
        tryRecRef.current.stop();
      } catch { }
      tryRecRef.current = null;
    }
  };

  const finishAndScoreTryAgain = () => {
    const spoken = tryCapturedRef.current.trim();
    cleanupTryAgainMic();
    setIsRecordingTryAgain(false);
    if (spoken) {
      setTryAgainStatusMsg(null);
      commitTryAgainAttempt(spoken);
    } else {
      setTryAgainStatusMsg('No speech captured — speak clearly right after clicking Try Again, or use Type.');
    }
  };

  const handleStartTryAgainMic = () => {
    // Clicking while recording immediately finishes and checks whatever was captured!
    if (isRecordingTryAgain) {
      finishAndScoreTryAgain();
      return;
    }

    // Critical fix: Stop main Lingo Buddy Hands-Free mic & TTS FIRST so Chrome doesn't abort dual SpeechRecognition!
    if (onBeforeStartTryAgain) {
      onBeforeStartTryAgain();
    }
    stopSpeech();
    cleanupTryAgainMic();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setTryAgainStatusMsg('Live browser microphone is unavailable here — type the sentence below to check it.');
      setShowTryAgainTypeBox(true);
      return;
    }

    tryCapturedRef.current = '';
    setIsRecordingTryAgain(true);
    setTryAgainLiveText('');
    setTryAgainStatusMsg('Listening — say the corrected sentence aloud, then pause or click Done.');

    // Give Chrome 140ms to cleanly release the main Hands-Free microphone before opening Try Again mic
    tryStartDelayRef.current = setTimeout(() => {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = recognitionLang || 'en-IN';

        rec.onresult = (e: any) => {
          let str = '';
          for (let i = 0; i < e.results.length; i++) {
            str += (e.results[i][0]?.transcript || '') + ' ';
          }
          const cleanStr = str.replace(/\s+/g, ' ').trim();
          tryCapturedRef.current = cleanStr;
          setTryAgainLiveText(cleanStr);

          // Auto-finish smoothly 1.9s after the user finishes speaking
          if (trySilenceTimerRef.current) clearTimeout(trySilenceTimerRef.current);
          if (cleanStr.length > 0) {
            trySilenceTimerRef.current = setTimeout(() => {
              finishAndScoreTryAgain();
            }, 1900);
          }
        };

        rec.onerror = (e: any) => {
          const errCode = e?.error || 'unknown';
          if (errCode === 'no-speech') {
            setTryAgainStatusMsg('Still listening — speak the corrected sentence clearly into your mic.');
            return;
          }
          cleanupTryAgainMic();
          setIsRecordingTryAgain(false);
          if (tryCapturedRef.current.trim()) {
            commitTryAgainAttempt(tryCapturedRef.current);
          } else {
            setTryAgainStatusMsg(
              errCode === 'not-allowed'
                ? 'Microphone permission blocked — allow mic access or click Type.'
                : errCode === 'network'
                  ? 'Browser speech network busy — click Try Again or use Type to practice.'
                  : `Mic stopped (${errCode}) — tap Try Again or click Type.`
            );
            setShowTryAgainTypeBox(true);
          }
        };

        rec.onend = () => {
          if (tryRecRef.current === rec) {
            finishAndScoreTryAgain();
          }
        };

        tryRecRef.current = rec;
        rec.start();
      } catch {
        cleanupTryAgainMic();
        setIsRecordingTryAgain(false);
        setTryAgainStatusMsg('Could not open microphone — use Type below to check your sentence.');
        setShowTryAgainTypeBox(true);
      }
    }, 140);
  };

  const handleSaveVocabUpgrade = (vu: BuddyVocabUpgrade) => {
    if (!onSaveVocab || vu.upgrades.length === 0) return;
    onSaveVocab({
      phrase: vu.upgrades[0].word,
      original: vu.original,
      explanation: vu.explanation,
      explanationSi: vu.explanationSi,
      example: vu.example,
      synonyms: vu.upgrades.slice(1).map(u => u.word),
      category: vu.category
    });
  };

  // Stage A Gate: Unclear / garbled speech capture -> NEVER show "Clean, natural English"!
  if (analysis.transcriptQuality === 'unclear') {
    return (
      <div className="w-full rounded-2xl bg-amber-50/90 border border-amber-200 px-3.5 py-3 space-y-2 text-xs text-left shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-amber-800 font-semibold">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Unclear Speech Capture · Needs Clarification</span>
          </span>
          {onRequestEdit && (
            <button
              type="button"
              onClick={onRequestEdit}
              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200/80 border border-amber-300 text-amber-900 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit What I Meant</span>
            </button>
          )}
        </div>
        <p className="text-[12px] text-amber-900/85 leading-relaxed">
          {analysis.clarificationNote ||
            "I'm not sure the microphone captured that accurately, so I skipped grammar grading. Try speaking again or click Edit to fix any misheard words."}
        </p>
      </div>
    );
  }

  // 5-Way Diagnostic Gate #1: Incomplete Speech ("About my...", "I was thinking...") -> Encourage continuation, NEVER mark as grammar error or "Clean English"!
  if (analysis.utteranceCategory === 'incomplete_speech' && totalCardItems === 0) {
    return (
      <div className="w-full rounded-2xl bg-sky-50/90 border border-sky-200 px-3.5 py-3 space-y-1.5 text-xs text-left shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sky-800 font-semibold">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Incomplete Thought · Keep Going!</span>
          </span>
          {onRequestEdit && (
            <button
              type="button"
              onClick={onRequestEdit}
              className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200/80 border border-sky-300 text-sky-900 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Edit3 className="w-3 h-3" />
              <span>Complete / Edit</span>
            </button>
          )}
        </div>
        <p className="text-[12px] text-sky-900/85 leading-relaxed">
          {analysis.clarificationNote ||
            'No grammar mistake counted — it sounds like you paused mid-thought. Go ahead and finish your sentence!'}
        </p>
      </div>
    );
  }

  // 5-Way Diagnostic Gate #2: Contextual Speech Recognition Slip vs. Pronunciation Minimal-Pair Tip
  if (
    (analysis.utteranceCategory === 'stt_error' ||
      analysis.utteranceCategory === 'pronunciation_difficulty') &&
    analysis.contextualWord &&
    totalCardItems === 0
  ) {
    const cw = analysis.contextualWord;
    const isPron = analysis.utteranceCategory === 'pronunciation_difficulty';
    return (
      <div
        className={`w-full rounded-2xl px-3.5 py-3 space-y-2 text-xs text-left shadow-xs border ${
          isPron
            ? 'bg-violet-50/90 border-violet-200'
            : 'bg-indigo-50/90 border-indigo-200'
        }`}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className={`flex items-center gap-2 font-semibold ${
              isPron ? 'text-violet-800' : 'text-indigo-800'
            }`}
          >
            <Lightbulb
              className={`w-4 h-4 shrink-0 ${
                isPron ? 'text-violet-600' : 'text-indigo-600'
              }`}
            />
            <span>
              {isPron
                ? `Pronunciation Tip · "${cw.intendedWord}" vs "${cw.heardWord}"`
                : `Speech Recognition Note · Did you mean "${cw.intendedWord}"?`}
            </span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                speakCoachAudio(
                  `cw-${cw.intendedWord}`,
                  `${cw.intendedWord}. For example, let's talk about your ${cw.intendedWord}.`
                )
              }
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3 h-3" />
              <span>Hear "{cw.intendedWord}"</span>
            </button>
            {onRequestEdit && (
              <button
                type="button"
                onClick={onRequestEdit}
                className="px-2 py-1 rounded-lg bg-white/80 hover:bg-white border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
        {cw.ipaComparison && (
          <div className="inline-block px-2 py-0.5 rounded-md bg-white/90 border border-indigo-200/70 text-[11px] font-mono text-slate-700">
            {cw.ipaComparison}
          </div>
        )}
        <p className="text-[12px] text-slate-800 leading-relaxed">{cw.phoneticNote}</p>
        {showSinhalaNotes && cw.phoneticNoteSi && (
          <p className="text-[11.5px] text-slate-700 leading-relaxed pt-1 border-t border-indigo-200/60">
            {cw.phoneticNoteSi}
          </p>
        )}
      </div>
    );
  }

  // 5-Way Diagnostic Gate #3: Correct but Unusual / Formal Expression (never penalize valid English!)
  if (analysis.utteranceCategory === 'unusual_but_correct' && totalCardItems === 0) {
    return (
      <div className="w-full rounded-2xl bg-teal-50/90 border border-teal-200 px-3.5 py-2.5 space-y-1 text-xs text-left shadow-xs">
        <div className="flex items-center gap-2 text-teal-800 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Grammatically Correct · Expressive / Formal Phrasing</span>
        </div>
        <p className="text-[11.5px] text-teal-900/80 leading-relaxed">
          Your sentence is 100% grammatically valid! It uses slightly formal or literary phrasing rather than casual everyday speech — no grammar correction needed.
        </p>
      </div>
    );
  }

  // Stage A Gate (Incomplete / Cut-Off Fragment with 0 cleanable mistakes, e.g. "Much into. Nothing much."):
  // NEVER show a false green "Clean, natural English" badge on incomplete speech!
  if (analysis.transcriptQuality === 'partially_unclear' && totalCardItems === 0) {
    return (
      <div className="w-full rounded-2xl bg-amber-50/90 border border-amber-200 px-3.5 py-3 space-y-2 text-xs text-left shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-amber-800 font-semibold">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Incomplete or Cut-Off Speech · Needs Clarification</span>
          </span>
          {onRequestEdit && (
            <button
              type="button"
              onClick={onRequestEdit}
              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200/80 border border-amber-300 text-amber-900 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit What I Meant</span>
            </button>
          )}
        </div>
        <p className="text-[12px] text-amber-900/85 leading-relaxed">
          {analysis.clarificationNote ||
            'Part of your sentence sounded incomplete or cut off, so I paused grammar grading until you clarify.'}
        </p>
      </div>
    );
  }

  // Clean English — zero mistakes AND zero vocab upgrades
  if (totalCardItems === 0) {
    // Don't clutter trivial 1-2 word greetings ("Hello.", "Hi.", "Okay.") with a full grammar report card!
    const wc = analysis.original_sentence.trim().split(/\s+/).filter(Boolean).length;
    if (wc <= 2) {
      return null;
    }
    const firstSpot = analysis.pronunciationSpotlights?.[0];
    const spotBadgeText = firstSpot
      ? firstSpot.category === 'linking'
        ? `Link: "${firstSpot.word}"`
        : `Stress: ${firstSpot.stressPattern.split(' ')[0]}`
      : null;

    return (
      <div className="w-full rounded-2xl bg-emerald-50/85 border border-emerald-200 px-3.5 py-2.5 space-y-2 text-xs shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-emerald-800 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Clean, natural English — no grammar mistakes detected.</span>
          </span>
          {analysis.skippedUncertainWords && analysis.skippedUncertainWords.length > 0 && (
            <span
              className="text-[10px] text-amber-700 font-medium flex items-center gap-1 shrink-0"
              title={`Skipped uncertain STT words: ${analysis.skippedUncertainWords.join(', ')}`}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>STT guarded</span>
            </span>
          )}
        </div>
        {(analysis.fluency || firstSpot) && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-emerald-200/70 text-[10px]">
            {analysis.fluency && (
              <>
                <span className="px-2 py-0.5 rounded-full bg-white border border-sky-200 text-sky-700 font-semibold">
                  {analysis.fluency.wpm} WPM · {analysis.fluency.paceLabel}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium">
                  Depth: {analysis.fluency.responseDevelopment}
                </span>
              </>
            )}
            {firstSpot && spotBadgeText && (
              <button
                type="button"
                onClick={() =>
                  speakCoachAudio(`spot-${firstSpot.word}`, `${firstSpot.word}. ${firstSpot.example}`)
                }
                className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center gap-1 font-semibold cursor-pointer"
                title={showSinhalaNotes ? firstSpot.tipSi : firstSpot.tip}
              >
                <Volume2 className="w-2.5 h-2.5" />
                <span>{spotBadgeText}</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-slate-50/80 border border-slate-200/90 overflow-hidden text-left transition-all shadow-xs">
      {/* Compact Collapsible Summary Bar */}
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 bg-white hover:bg-slate-50/90 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${errorCount > 0 ? 'bg-red-500' : 'bg-purple-500'
              }`}
          />
          <span className="text-xs font-bold text-slate-900 truncate">
            Live English Feedback
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${errorCount > 0
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}
          >
            {errorCount > 0
              ? `${errorCount} ${errorCount === 1 ? 'mistake' : 'mistakes'}${suggestionCount - errorCount + vocabCount > 0
                ? ` · +${suggestionCount - errorCount + vocabCount} boost`
                : ''
              }`
              : suggestionCount > 0
                ? `${suggestionCount} ${suggestionCount === 1 ? 'suggestion' : 'suggestions'}${vocabCount > 0 ? ` · +${vocabCount} vocab` : ''
                }`
                : `${vocabCount} vocabulary ${vocabCount === 1 ? 'upgrade' : 'upgrades'}`}
          </span>
          {activeTryResult?.matched && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              ✓ Mastered
            </span>
          )}
        </div>

        <span className="text-slate-500 flex items-center gap-1 text-[11px] font-medium shrink-0">
          <span className="hidden sm:inline">{expanded ? 'Hide' : 'Details'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {/* Expanded Full Phase 2 Feedback Card */}
      {expanded && (
        <div className="px-3.5 pb-3.5 pt-2.5 space-y-3 border-t border-slate-200/80 animate-in fade-in duration-150">
          {/* Side-by-Side Original (Red) vs. Corrected Sentence (Green) */}
          {analysis.corrected_sentence.toLowerCase() !== analysis.original_sentence.toLowerCase() && (
            <div className="rounded-xl bg-white/95 border border-slate-200/90 p-3 space-y-2.5 text-xs shadow-2xs">
              <div className="rounded-lg bg-red-50/60 border border-red-100 px-2.5 py-2 space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                  What You Said
                </span>
                <p className="text-red-900/85 leading-relaxed line-through decoration-red-400">
                  “{analysis.original_sentence}”
                </p>
              </div>

              <div className="rounded-lg bg-emerald-50/75 border border-emerald-200/80 px-2.5 py-2 space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {analysis.isProvisional ? 'Possible Correction' : 'Corrected Sentence'}
                    </span>
                    {analysis.isProvisional && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Based on intended meaning
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => speakCoachAudio('corrected-full', analysis.corrected_sentence)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${speakingId === 'corrected-full'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    title="Hear the corrected sentence spoken aloud"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{speakingId === 'corrected-full' ? 'Playing...' : 'Hear Correct'}</span>
                  </button>
                </div>
                <p className="text-emerald-800 font-semibold leading-relaxed text-[13px]">
                  “{analysis.corrected_sentence}”
                </p>
                {analysis.transcriptQuality === 'partially_unclear' && analysis.clarificationNote && (
                  <p className="text-[11px] text-amber-800 pt-1 flex items-start gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{analysis.clarificationNote}</span>
                  </p>
                )}

                {/* Phase 3 Section 5.1 — Active Spoken "Try Again" Correction Loop */}
                <div className="pt-2.5 mt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-600 font-medium">
                      {activeTryResult?.matched
                        ? 'Awesome! You said the corrected structure cleanly.'
                        : 'Practice it aloud to build muscle memory:'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleStartTryAgainMic}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${isRecordingTryAgain
                          ? 'bg-rose-600 text-white animate-pulse'
                          : activeTryResult?.matched
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                      >
                        {isRecordingTryAgain ? (
                          <>
                            <MicOff className="w-3 h-3" />
                            <span>Done &amp; Check</span>
                          </>
                        ) : activeTryResult?.matched ? (
                          <>
                            <RotateCcw className="w-3 h-3" />
                            <span>Say Again</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3 h-3" />
                            <span>Try Again</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTryAgainTypeBox(prev => !prev)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer"
                        title="Practice by typing if your mic is muted"
                      >
                        Type
                      </button>
                    </div>
                  </div>

                  {isRecordingTryAgain && (
                    <div className="rounded-lg bg-sky-50 border border-sky-200 px-2.5 py-1.5 space-y-0.5 text-[11px]">
                      <p className="text-sky-800 font-semibold">
                        {tryAgainLiveText ? `“${tryAgainLiveText}”` : 'Listening to your voice...'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Say the corrected sentence aloud — pauses auto-check, or click Done &amp; Check.
                      </p>
                    </div>
                  )}

                  {!isRecordingTryAgain && tryAgainStatusMsg && (
                    <p className="text-[11px] text-amber-700 font-medium">{tryAgainStatusMsg}</p>
                  )}

                  {showTryAgainTypeBox && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        commitTryAgainAttempt(tryAgainTypedDraft);
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        value={tryAgainTypedDraft}
                        onChange={(e) => setTryAgainTypedDraft(e.target.value)}
                        placeholder={`Type: ${analysis.corrected_sentence}`}
                        className="flex-1 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={!tryAgainTypedDraft.trim()}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-[11px] font-semibold cursor-pointer"
                      >
                        Check
                      </button>
                    </form>
                  )}

                  {activeTryResult && (
                    <div
                      className={`rounded-lg px-2.5 py-2 text-[11px] border flex items-start justify-between gap-2 ${activeTryResult.matched
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold">
                          {activeTryResult.matched
                            ? `✓ Mastered (${activeTryResult.score}% match)`
                            : `Almost there (${activeTryResult.score}% match)`}
                        </p>
                        <p className="text-slate-600">You said: “{activeTryResult.attemptedText}”</p>
                        {!activeTryResult.matched && activeTryResult.missedWords.length > 0 && (
                          <p className="text-amber-800">
                            Watch for:{' '}
                            <span className="font-semibold">
                              {activeTryResult.missedWords.slice(0, 4).join(', ')}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Optional More Natural / Advanced Phrasing */}
          {analysis.natural_expression && (
            <div className="rounded-xl bg-purple-50/80 border border-purple-200 px-3 py-2 text-xs space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>More Natural Expression</span>
              </span>
              <p className="text-purple-900 italic font-medium">“{analysis.natural_expression}”</p>
            </div>
          )}

          {/* Itemized Mistake Breakdown */}
          <div className="space-y-2">
            {analysis.mistakes.map((m, idx) => {
              const sev = SEVERITY_META[m.severity] || SEVERITY_META.GRAMMAR_ERROR;
              const isRuleOpen = expandedRuleId === m.id;

              return (
                <div
                  key={m.id}
                  className={`rounded-xl bg-white border ${sev.borderClass} p-3 space-y-2 text-xs shadow-xs transition-opacity ${m.learned ? 'opacity-65' : ''
                    }`}
                >
                  {/* Top Row: Number, Phrase -> Correction, Severity & Category */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-400">{idx + 1}.</span>
                      <span className="line-through text-rose-600 font-medium">“{m.original}”</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-700 font-semibold">“{m.correction}”</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${sev.badgeClass}`}>
                        {sev.label}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {m.categoryLabel}
                      </span>
                      {categoryCounts && (categoryCounts[m.category] || 0) >= 2 && (
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5"
                          title={`This category has occurred ${categoryCounts[m.category]} times across your sessions`}
                        >
                          <Repeat className="w-2.5 h-2.5" />
                          <span>×{categoryCounts[m.category]}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Phase 4 P2.3 — 4-Mode Explanation Display (English / Simple / Bilingual / Sinhala Focused) */}
                  {effectiveLangMode === 'sinhala_focused' && m.explanationSi ? (
                    <div className="space-y-1.5">
                      <p className="text-[12.5px] text-indigo-700 font-sinhala leading-relaxed font-medium">
                        {m.explanationSi}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {m.simpleExplanation || m.explanation}
                      </p>
                    </div>
                  ) : effectiveLangMode === 'simple_english' ? (
                    <p className="text-slate-700 leading-relaxed text-[12px]">
                      {m.simpleExplanation || m.explanation}
                    </p>
                  ) : (
                    <>
                      <p className="text-slate-700 leading-relaxed text-[12px]">{m.explanation}</p>
                      {showSinhalaNotes && m.explanationSi && (
                        <p className="text-[11.5px] text-indigo-700 font-sinhala leading-relaxed pt-1 border-t border-slate-100">
                          {m.explanationSi}
                        </p>
                      )}
                    </>
                  )}

                  {/* Phase 4 P2.3 — Sinhala-to-English Structural Transfer Callout */}
                  {showSinhalaNotes && m.sinhalaTransferNote && (
                    <div className="rounded-lg bg-indigo-50/80 border border-indigo-200 px-2.5 py-1.5 text-[11px] text-indigo-800 font-sinhala leading-relaxed">
                      💡 {m.sinhalaTransferNote}
                    </div>
                  )}

                  {/* Phase 4 P2.3 — Crisp V1 / V2 / V3 Irregular Verb Form Table */}
                  {m.verbFormTable && (
                    <div className="rounded-lg bg-slate-50 border border-slate-200 overflow-hidden text-[11px]">
                      <div className="grid grid-cols-3 bg-slate-100/90 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                        <span className="py-1 border-r border-slate-200">V1 (Base)</span>
                        <span className="py-1 border-r border-slate-200">V2 (Past)</span>
                        <span className="py-1 text-emerald-700">V3 (Participle)</span>
                      </div>
                      <div className="grid grid-cols-3 text-center font-semibold bg-white">
                        <span className="py-1.5 text-slate-800 border-r border-slate-200">
                          {m.verbFormTable.v1}
                        </span>
                        <span className="py-1.5 text-slate-800 border-r border-slate-200">
                          {m.verbFormTable.v2}
                        </span>
                        <span className="py-1.5 text-emerald-700">{m.verbFormTable.v3}</span>
                      </div>
                    </div>
                  )}

                  {/* Expandable Grammar Rule, Examples & Learning Tip */}
                  {isRuleOpen && (
                    <div className="rounded-lg bg-slate-50 border border-slate-200/90 p-2.5 space-y-2 text-[11px] animate-in fade-in duration-150">
                      <div className="flex items-start gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-blue-800">Rule: </span>
                          <span className="text-slate-700">{m.grammar_rule}</span>
                        </div>
                      </div>

                      {m.example && (
                        <div className="space-y-0.5 pl-5 text-slate-700">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                            Examples
                          </span>
                          <p>• {m.example}</p>
                          {m.more_examples?.map((ex, i) => (
                            <p key={i}>• {ex}</p>
                          ))}
                        </div>
                      )}

                      {m.learning_tip && (
                        <div className="flex items-start gap-1.5 pt-1 border-t border-slate-200/70">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="text-amber-900">{m.learning_tip}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Footer per Mistake: Rule/Examples, Explain Aloud, Learned */}
                  <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const opening = expandedRuleId !== m.id;
                          setExpandedRuleId(opening ? m.id : null);
                          if (opening && onInspectRule) onInspectRule();
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>{isRuleOpen ? 'Hide Rule' : 'Rule & Examples'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExplainMistakeAloud(m)}
                        className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${speakingId === m.id
                          ? 'text-emerald-700'
                          : 'text-slate-500 hover:text-slate-900'
                          }`}
                        title="Hear Lingo Buddy explain this rule verbally"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{speakingId === m.id ? 'Explaining...' : 'Explain Aloud'}</span>
                      </button>
                    </div>

                    {onToggleLearned && (
                      <button
                        type="button"
                        onClick={() => onToggleLearned(m.id)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${m.learned
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{m.learned ? 'Learned' : 'Mark Learned'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Phase 3 P1.2 — Vocabulary & Natural-Expression Upgrade Cards (Never marked as Incorrect!) */}
          {analysis.vocabUpgrades && analysis.vocabUpgrades.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Vocabulary &amp; Naturalness Boost</span>
              </span>
              {analysis.vocabUpgrades.map(vu => {
                const primaryWord = vu.upgrades[0]?.word || '';
                const isSaved = savedVocabPhrases?.has(primaryWord.toLowerCase()) || false;
                return (
                  <div
                    key={vu.id}
                    className="rounded-xl bg-purple-50/75 border border-purple-200 p-3 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                            Basic:
                          </span>
                          <span className="text-slate-800 font-semibold">“{vu.original}”</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {vu.upgrades.map((opt, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-purple-200 text-purple-800 text-[11px] font-semibold shadow-xs"
                            >
                              <span>{opt.word}</span>
                              <span className="text-[9px] text-purple-500 font-normal">
                                · {opt.nuance}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => speakCoachAudio(vu.id, `${primaryWord}. ${vu.example}`)}
                          className="p-1.5 rounded-lg bg-white hover:bg-purple-100 border border-purple-200 text-purple-700 cursor-pointer"
                          title="Hear pronunciation and example"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        {onSaveVocab && (
                          <button
                            type="button"
                            onClick={() => handleSaveVocabUpgrade(vu)}
                            disabled={isSaved}
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${isSaved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600'
                              }`}
                          >
                            {isSaved ? (
                              <>
                                <BookmarkCheck className="w-3 h-3" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="w-3 h-3" />
                                <span>Save Vocab</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-700 leading-relaxed">{vu.explanation}</p>
                    {showSinhalaNotes && vu.explanationSi && (
                      <p className="text-[11px] text-indigo-700 font-sinhala leading-relaxed">
                        {vu.explanationSi}
                      </p>
                    )}
                    <p className="text-[11px] text-purple-800 italic">
                      Example: “{vu.example}”
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Phase 4 P2.1 — Compact Per-Turn Fluency & Pronunciation Spotlight Strip */}
          {(analysis.fluency || (analysis.pronunciationSpotlights && analysis.pronunciationSpotlights.length > 0)) && (
            <div className="rounded-xl bg-sky-50/80 border border-sky-200 px-3 py-2 space-y-1.5 text-[11px]">
              {analysis.fluency && (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                      Delivery
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-sky-200 text-sky-800 font-semibold text-[10px]">
                      {analysis.fluency.wpm} WPM · {analysis.fluency.paceLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium text-[10px]">
                      Avg {analysis.fluency.avgSentenceLength} words/sent
                    </span>
                    {analysis.fluency.hesitationCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-[10px]">
                        {analysis.fluency.hesitationCount} filler{analysis.fluency.hesitationCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {analysis.pronunciationSpotlights && analysis.pronunciationSpotlights.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1.5 border-t border-sky-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    Stress Tip:
                  </span>
                  {analysis.pronunciationSpotlights.map(sp => (
                    <button
                      key={sp.word}
                      type="button"
                      onClick={() => speakCoachAudio(`sp-${sp.word}`, `${sp.word}. ${sp.example}`)}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-semibold cursor-pointer"
                      title={showSinhalaNotes ? sp.tipSi : sp.tip}
                    >
                      <Volume2 className="w-3 h-3 text-blue-600" />
                      <span>{sp.stressPattern}</span>
                      <span className="text-blue-500 font-mono">{sp.ipa}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skipped Low-Confidence STT Guard Notice */}
          {analysis.skippedUncertainWords && analysis.skippedUncertainWords.length > 0 && (
            <p className="text-[10px] text-amber-700 flex items-center gap-1 pt-1">
              <ShieldAlert className="w-3 h-3 shrink-0" />
              <span>
                Ignored uncertain mic capture ({analysis.skippedUncertainWords.join(', ')}) so you are never blamed for an STT slip.
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
