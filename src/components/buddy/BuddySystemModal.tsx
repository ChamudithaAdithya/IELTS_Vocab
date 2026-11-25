import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Play,
  Sparkles,
  ShieldCheck,
  Download,
  Layers,
  FlaskConical,
  Cpu,
  Gauge
} from 'lucide-react';
import type {
  BuddyLearningAnalytics,
  BuddyMemoryState,
  BuddyOrbState,
  BuddySession,
  BuddyTurnPerfRecord,
  BuddyTurnTrace,
  PersonalGrammarNote,
  SavedBuddyVocabItem
} from '../../types/speakingBuddy';
import {
  ORB_14_STATES,
  PHASE5_MODULAR_SERVICES,
  buildImmutableAuditExport,
  runAll13BuddyQaScenarios,
  type BuddyQaSuiteReport
} from '../../utils/buddyQaSuite';
import { BuddyEnergyOrb } from './BuddyEnergyOrb';

export interface BuddySystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ModalTab;
  currentOrbState: BuddyOrbState;
  onPreviewOrbState: (state: BuddyOrbState) => void;
  sessions: BuddySession[];
  analytics: BuddyLearningAnalytics;
  memory: BuddyMemoryState;
  savedVocab: SavedBuddyVocabItem[];
  grammarLibrary: PersonalGrammarNote[];
  turnTraces?: BuddyTurnTrace[];
  perfRecords?: BuddyTurnPerfRecord[];
}

type ModalTab = 'orb' | 'perf' | 'qa' | 'traces' | 'architecture';

export const BuddySystemModal: React.FC<BuddySystemModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'orb',
  currentOrbState,
  onPreviewOrbState,
  sessions,
  analytics,
  memory,
  savedVocab,
  grammarLibrary,
  turnTraces = [],
  perfRecords = []
}) => {
  const [tab, setTab] = useState<ModalTab>(initialTab);
  useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);
  const [previewState, setPreviewState] = useState<BuddyOrbState>(currentOrbState);
  const [qaReport, setQaReport] = useState<BuddyQaSuiteReport>(() => runAll13BuddyQaScenarios());
  const previewAudioRef = useRef<number>(42);

  if (!isOpen) return null;

  const activeDesc = ORB_14_STATES.find(s => s.state === previewState) || ORB_14_STATES[0];

  const userTurns = sessions.flatMap(s => s.messages.filter(m => m.role === 'user'));
  const immutableCount = userTurns.filter(m => Boolean(m.originalRawTranscript)).length;

  const handleExportAuditJson = () => {
    const payload = buildImmutableAuditExport({
      sessions,
      analytics,
      memory,
      savedVocab,
      grammarLibrary
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingo-buddy-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[88vh] rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Lingo Buddy · Orb Lab, QA &amp; Architecture
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              14-state living crystal orb, live {qaReport.total}-scenario conversation intelligence QA suite, and immutable audit architecture.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="px-5 py-2.5 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto bg-slate-50/70">
          {[
            { id: 'orb' as ModalTab, label: '14-State Living Orb', icon: Sparkles },
            {
              id: 'perf' as ModalTab,
              label: `Voice Latency (${perfRecords.length})`,
              icon: Gauge
            },
            {
              id: 'qa' as ModalTab,
              label: `QA Lab (${qaReport.passedCount}/${qaReport.total})`,
              icon: FlaskConical
            },
            {
              id: 'traces' as ModalTab,
              label: `Turn Traces (${turnTraces.length})`,
              icon: Cpu
            },
            { id: 'architecture' as ModalTab, label: 'Architecture & Audit', icon: Layers }
          ].map(item => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#F8FAFD]">
          {/* ========================================================= */}
          {/* TAB 1: 14-STATE LIVING ORB SHOWCASE                       */}
          {/* ========================================================= */}
          {tab === 'orb' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Airy Glassmorphism Chamber so the Living Crystal Orb & Outer Energy Rings Shine */}
              <div className="md:col-span-5 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#eaf2ff] via-[#f5f7ff] to-[#f2ecff] border border-indigo-200/80 shadow-inner p-5 text-center space-y-3">
                <BuddyEnergyOrb
                  state={previewState}
                  audioLevelRef={previewAudioRef}
                  size={232}
                />
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-indigo-200/80 text-xs font-bold text-slate-900 shadow-2xs">
                    <span className={`w-2 h-2 rounded-full ${activeDesc.dotColor}`} />
                    <span>{activeDesc.label}</span>
                  </div>
                  <p className="text-[11px] text-blue-700 font-semibold">{activeDesc.visual}</p>
                  <p className="text-[11px] text-slate-600">{activeDesc.meaning}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onPreviewOrbState(previewState);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-[11px] font-semibold cursor-pointer shadow-sm"
                >
                  Apply to Main Orb
                </button>
              </div>

              <div className="md:col-span-7 grid grid-cols-2 gap-2">
                {ORB_14_STATES.map((st, idx) => {
                  const selected = previewState === st.state;
                  return (
                    <button
                      key={st.state}
                      type="button"
                      onClick={() => setPreviewState(st.state)}
                      className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                        selected
                          ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-xs'
                          : 'bg-white border-slate-200/90 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${st.dotColor} shrink-0`} />
                        <span className="text-xs font-semibold truncate">{st.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{st.meaning}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1B: REAL-TIME VOICE PERFORMANCE DIAGNOSTICS (SEC. 6)  */}
          {/* ========================================================= */}
          {tab === 'perf' && (() => {
            const avgMetric = (getter: (r: BuddyTurnPerfRecord) => number | null) => {
              const vals = perfRecords.map(getter).filter((v): v is number => v !== null);
              if (vals.length === 0) return null;
              return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
            };
            const avgFirstStt = avgMetric(r => r.durations.timeToFirstTranscriptMs);
            const avgAiTtft = avgMetric(r => r.durations.aiTimeToFirstTokenMs);
            const avgFirstAudio = avgMetric(r => r.durations.userEndToFirstAudioMs);
            const avgTts = avgMetric(r => r.durations.ttsTimeToFirstAudioMs);

            const fmtMs = (v: number | null | undefined) =>
              v === null || v === undefined ? '—' : `${v} ms`;

            return (
              <div className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-sky-50 border border-emerald-200 p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-emerald-600" />
                      <span>Real-Time Voice Pipeline Telemetry (`performance.now()`)</span>
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      Zero API keys or raw audio logged
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Measures all 12 pipeline timestamps per turn: live partial STT, final transcript, AI TTFT, non-blocking grammar, progressive MSE TTS first byte, speaker playback start, and full completion.
                  </p>

                  {/* Engineering Performance Targets Scorecard */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {[
                      {
                        label: 'First Live Transcript',
                        target: 'Target < 500 ms',
                        val: fmtMs(avgFirstStt),
                        ok: avgFirstStt !== null && avgFirstStt <= 500
                      },
                      {
                        label: 'AI First Text Token',
                        target: 'Target < 1,000 ms',
                        val: fmtMs(avgAiTtft),
                        ok: avgAiTtft !== null && avgAiTtft <= 1000
                      },
                      {
                        label: 'End-of-Speech → Audio',
                        target: 'Target < 1,500 ms',
                        val: fmtMs(avgFirstAudio),
                        ok: avgFirstAudio !== null && avgFirstAudio <= 1500
                      },
                      {
                        label: 'TTS First Audio Byte',
                        target: 'Progressive Stream',
                        val: fmtMs(avgTts),
                        ok: avgTts !== null && avgTts <= 900
                      }
                    ].map(card => (
                      <div
                        key={card.label}
                        className="rounded-xl bg-white border border-slate-200/90 p-2.5 text-left shadow-2xs"
                      >
                        <span className="text-[10px] font-bold text-slate-500 block">
                          {card.label}
                        </span>
                        <span
                          className={`text-sm font-extrabold font-mono block mt-0.5 ${
                            card.val === '—'
                              ? 'text-slate-400'
                              : card.ok
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {card.val}
                        </span>
                        <span className="text-[9px] text-slate-400">{card.target}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {perfRecords.length === 0 ? (
                  <div className="rounded-2xl bg-white border border-slate-200/90 p-6 text-center text-xs text-slate-500 shadow-xs">
                    Speak or type a turn in Lingo Buddy to inspect live 12-stage `performance.now()` latency measurements here.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {perfRecords.map((rec, idx) => {
                      const baseT0 =
                        rec.timestamps.speech_start ??
                        rec.timestamps.speech_end ??
                        rec.timestamps.ai_request_start ??
                        0;
                      const rel = (t: number | null) =>
                        t === null ? '—' : `+${Math.max(0, Math.round(t - baseT0))}ms`;

                      return (
                        <div
                          key={`${rec.turnId}-${idx}`}
                          className="rounded-xl bg-white border border-slate-200/90 p-3.5 space-y-2.5 text-xs shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                STT: {rec.sttEngineUsed}
                              </span>
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                AI: {rec.aiProviderUsed}
                              </span>
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                TTS: {rec.ttsProviderUsed}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {rec.wordCount} words
                              </span>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-emerald-700">
                              User-End → First Audio: {fmtMs(rec.durations.userEndToFirstAudioMs)}
                            </span>
                          </div>

                          {/* 7 Derived Durations */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                            <div className="rounded-lg bg-slate-50 px-2 py-1 border border-slate-100">
                              <span className="text-slate-400 block">1st Partial STT</span>
                              <strong className="font-mono text-slate-800">
                                {fmtMs(rec.durations.timeToFirstTranscriptMs)}
                              </strong>
                            </div>
                            <div className="rounded-lg bg-slate-50 px-2 py-1 border border-slate-100">
                              <span className="text-slate-400 block">Final STT Latency</span>
                              <strong className="font-mono text-slate-800">
                                {fmtMs(rec.durations.finalTranscriptionLatencyMs)}
                              </strong>
                            </div>
                            <div className="rounded-lg bg-slate-50 px-2 py-1 border border-slate-100">
                              <span className="text-slate-400 block">AI 1st Token</span>
                              <strong className="font-mono text-slate-800">
                                {fmtMs(rec.durations.aiTimeToFirstTokenMs)}
                              </strong>
                            </div>
                            <div className="rounded-lg bg-slate-50 px-2 py-1 border border-slate-100">
                              <span className="text-slate-400 block">TTS 1st Audio</span>
                              <strong className="font-mono text-slate-800">
                                {fmtMs(rec.durations.ttsTimeToFirstAudioMs)}
                              </strong>
                            </div>
                            <div className="rounded-lg bg-slate-50 px-2 py-1 border border-slate-100">
                              <span className="text-slate-400 block">Bg Grammar Ready</span>
                              <strong className="font-mono text-slate-800">
                                {fmtMs(rec.durations.grammarAnalysisLatencyMs)}
                              </strong>
                            </div>
                            <div className="rounded-lg bg-slate-50 px-2 py-1 border border-slate-100">
                              <span className="text-slate-400 block">End → Playback</span>
                              <strong className="font-mono text-emerald-700">
                                {fmtMs(rec.durations.userEndToFirstAudioMs)}
                              </strong>
                            </div>
                            <div className="rounded-lg bg-slate-50 px-2 py-1 border border-slate-100 sm:col-span-2">
                              <span className="text-slate-400 block">Total Turn Completion</span>
                              <strong className="font-mono text-slate-800">
                                {fmtMs(rec.durations.totalResponseCompletionMs)}
                              </strong>
                            </div>
                          </div>

                          {/* Raw 12-Point Timestamp Waterfall */}
                          <details className="text-[10px] text-slate-500">
                            <summary className="cursor-pointer font-semibold text-blue-600 hover:underline">
                              Inspect all 12 `performance.now()` stage marks
                            </summary>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 pt-1.5 font-mono text-[10px]">
                              <span>speech_start: {rel(rec.timestamps.speech_start)}</span>
                              <span>1st_partial: {rel(rec.timestamps.first_partial_transcript)}</span>
                              <span>speech_end: {rel(rec.timestamps.speech_end)}</span>
                              <span>final_stt: {rel(rec.timestamps.final_transcript)}</span>
                              <span>ai_req_start: {rel(rec.timestamps.ai_request_start)}</span>
                              <span>ai_1st_token: {rel(rec.timestamps.ai_first_token)}</span>
                              <span>grammar_ready: {rel(rec.timestamps.grammar_ready)}</span>
                              <span>ai_complete: {rel(rec.timestamps.ai_response_complete)}</span>
                              <span>tts_req_start: {rel(rec.timestamps.tts_request_start)}</span>
                              <span>tts_1st_audio: {rel(rec.timestamps.tts_first_audio)}</span>
                              <span>playback_start: {rel(rec.timestamps.playback_start)}</span>
                              <span>resp_complete: {rel(rec.timestamps.response_complete)}</span>
                            </div>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* TAB 2: LIVE 23-SCENARIO SUBSYSTEM QA SUITE                */}
          {/* ========================================================= */}
          {tab === 'qa' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-950">
                      Subsystem QA Validation: {qaReport.passedCount} / {qaReport.total} Scenarios Passing
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Executed live against Grammar, Conversation, Fluency, Vocabulary, Try Again &amp; STT Guard engines in {qaReport.totalDurationMs}ms.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQaReport(runAll13BuddyQaScenarios())}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Re-Run All {qaReport.total} Tests</span>
                </button>
              </div>

              {/* Quantitative Conversation Intelligence Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                {[
                  { label: 'Context Rel.', val: `${qaReport.metrics.contextRelevancePct}%`, cls: 'text-emerald-600' },
                  { label: 'Intent Acc.', val: `${qaReport.metrics.intentAccuracyPct}%`, cls: 'text-sky-600' },
                  { label: 'Gram. Prec.', val: `${qaReport.metrics.grammarPrecisionPct}%`, cls: 'text-emerald-600' },
                  { label: 'Gram. Recall', val: `${qaReport.metrics.grammarRecallPct}%`, cls: 'text-purple-600' },
                  { label: 'Repetitive', val: `${qaReport.metrics.repetitiveReplyRatePct}%`, cls: 'text-blue-600' },
                  { label: 'Avg Latency', val: `${qaReport.metrics.avgLatencyMs}ms`, cls: 'text-slate-900' }
                ].map(m => (
                  <div key={m.label} className="rounded-xl bg-white border border-slate-200/90 py-2 px-1.5 shadow-xs">
                    <span className={`text-sm font-bold font-mono block ${m.cls}`}>{m.val}</span>
                    <span className="text-[9px] text-slate-500 font-medium">{m.label}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {qaReport.results.map(item => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3 flex items-start justify-between gap-3 text-xs shadow-xs ${
                      item.isGolden
                        ? 'bg-amber-50/90 border-amber-300'
                        : item.passed
                        ? 'bg-white border-slate-200/90'
                        : 'bg-rose-50 border-rose-300'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-400">
                          #{String(item.id).padStart(2, '0')}
                        </span>
                        <span className="font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                          {item.subsystem}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{item.detail}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400">{item.durationMs}ms</span>
                      {item.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: LIVE ORCHESTRATOR TURN TRACE INSPECTOR             */}
          {/* ========================================================= */}
          {tab === 'traces' && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 text-xs space-y-1 shadow-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>Conversation Orchestrator · Live Turn Execution Traces</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Every spoken or typed turn logs the exact provider (`gemini` vs `local`), fallback reason, classified intent, active topic/subject, raw vs. analysis transcript, and latency so nothing happens silently.
                </p>
              </div>

              {turnTraces.length === 0 ? (
                <div className="rounded-2xl bg-white border border-slate-200/90 p-6 text-center text-xs text-slate-500 shadow-xs">
                  Speak or type a message in Lingo Buddy to inspect its live orchestration trace here.
                </div>
              ) : (
                <div className="space-y-2">
                  {turnTraces.map(tr => (
                    <div
                      key={tr.turnId}
                      className="rounded-xl bg-white border border-slate-200/90 p-3 space-y-1.5 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              tr.providerUsed === 'gemini'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-sky-50 text-sky-700 border-sky-200'
                            }`}
                          >
                            Friend: {tr.providerUsed}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono font-semibold">
                            intent: {tr.intent}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                            topic: {tr.activeTopic}
                            {tr.activeSubject ? ` (${tr.activeSubject})` : ''}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                            stage A: {tr.coherenceQuality}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          friend {tr.friendLatencyMs}ms · grammar {tr.grammarLatencyMs}ms ({tr.grammarSource})
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-700">
                        <strong className="text-slate-500">Raw:</strong> “{tr.rawTranscript}” ·{' '}
                        <strong className="text-slate-500">Analyzed:</strong> “{tr.analysisTranscript}”
                      </p>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        <strong className="text-slate-500">Reply:</strong> “{tr.replyPreview}” ({tr.mistakesCount} findings)
                      </p>
                      {tr.fallbackReason && (
                        <p className="text-[10px] text-amber-700 font-medium">
                          Provider note: {tr.fallbackReason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: FULL-STACK ARCHITECTURE & IMMUTABLE AUDIT EXPORT   */}
          {/* ========================================================= */}
          {tab === 'architecture' && (
            <div className="space-y-4">
              {/* Immutable Data Integrity Banner */}
              <div className="rounded-2xl bg-blue-50/85 border border-blue-200 p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Immutable Transcript &amp; Privacy Separation Verified</span>
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Raw transcripts preserved: <strong className="text-slate-900">{immutableCount}/{userTurns.length}</strong> turns ·
                    Memory &amp; Learning Analytics stored in separate isolated namespaces.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportAuditJson}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export 14-Table Audit JSON</span>
                </button>
              </div>

              {/* 11 Modular Services Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>11 Decoupled Modular Services (Frontend-Ready / Spring Boot Contract)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PHASE5_MODULAR_SERVICES.map(svc => (
                    <div
                      key={svc.name}
                      className="rounded-xl bg-white border border-slate-200/90 px-3 py-2 flex items-center justify-between gap-2 text-xs shadow-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-blue-700 font-semibold">{svc.name}</span>
                        <p className="text-[10px] text-slate-500 truncate">{svc.status}</p>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shrink-0">
                        {svc.layer}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
