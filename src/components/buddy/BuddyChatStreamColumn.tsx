import React from 'react';
import {
  ArrowUpRight,
  Check,
  Edit3,
  Send,
  Sparkles,
  Volume2
} from 'lucide-react';
import type { BuddyOrbState, BuddySession } from '../../types/speakingBuddy';
import {
  BUDDY_TOPIC_STARTERS,
  pickTopicStarterPrompt
} from '../../utils/speakingBuddyEngine';
import { stopSpeech, unlockAudioOutput } from '../../utils/speech';

export interface BuddyChatStreamColumnProps {
  activeSession?: BuddySession;
  chatScrollRef: React.RefObject<HTMLDivElement | null>;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  typedInputRef: React.RefObject<HTMLInputElement | null>;
  editingMsgId: string | null;
  editingDraft: string;
  onChangeEditingDraft: (next: string) => void;
  onCancelEditing: () => void;
  onSaveEditedTranscript: (msgId: string) => void;
  onStartEditingMsg: (msgId: string, currentText: string) => void;
  streamingBuddyMsgId: string | null;
  focusedFeedbackId: string | null;
  onSelectFeedbackMsg: (msgId: string) => void;
  showRawForMsgId: string | null;
  onToggleShowRaw: (msgId: string) => void;
  onSpeakBuddyAgain: (text: string) => void;
  isListening: boolean;
  orbState: BuddyOrbState;
  liveFinalText: string;
  liveInterimText: string;
  hasUserMessages: boolean;
  onStartTopicChat: (prompt: string) => void;
  typedInput: string;
  onChangeTypedInput: (val: string) => void;
  onSendTyped: (e: React.FormEvent) => void;
}

export const BuddyChatStreamColumn: React.FC<BuddyChatStreamColumnProps> = ({
  activeSession,
  chatScrollRef,
  chatEndRef,
  typedInputRef,
  editingMsgId,
  editingDraft,
  onChangeEditingDraft,
  onCancelEditing,
  onSaveEditedTranscript,
  onStartEditingMsg,
  streamingBuddyMsgId,
  focusedFeedbackId,
  onSelectFeedbackMsg,
  showRawForMsgId,
  onToggleShowRaw,
  onSpeakBuddyAgain,
  isListening,
  orbState,
  liveFinalText,
  liveInterimText,
  hasUserMessages,
  onStartTopicChat,
  typedInput,
  onChangeTypedInput,
  onSendTyped
}) => {
  const latestUserTurn = [...(activeSession?.messages || [])]
    .reverse()
    .find(m => m.role === 'user');
  const latestErrors =
    latestUserTurn?.analysis?.mistakes.filter(
      m => m.severity === 'GRAMMAR_ERROR' || m.severity === 'UNNATURAL'
    ).length || 0;
  const isLatestUnclear = latestUserTurn?.analysis?.transcriptQuality === 'unclear';
  const isLatestIncomplete =
    latestUserTurn?.analysis?.transcriptQuality === 'partially_unclear' && latestErrors === 0;
  const liveTextPreview = [liveFinalText, liveInterimText].filter(Boolean).join(' ');

  return (
    <main className="lg:col-span-4 xl:col-span-5 bg-white/78 backdrop-blur-xl rounded-3xl border border-white/85 ring-1 ring-blue-200/35 shadow-[0_10px_32px_rgba(37,99,235,0.06)] flex flex-col h-[560px] lg:h-full lg:min-h-0 overflow-hidden">
      {/* Clean Chat Column Header */}
      <div className="shrink-0 px-5 py-3.5 border-b border-indigo-100/70 bg-gradient-to-r from-white/70 via-blue-50/40 to-purple-50/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-8 h-8 rounded-full shrink-0 shadow-sm ring-2 ring-white/90"
            style={{
              background:
                'radial-gradient(circle at 35% 28%, #ffffff 0%, #38bdf8 28%, #2563eb 58%, #d946ef 100%)'
            }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 truncate">
              {activeSession?.title || "Today's conversation"}
            </h2>
            <p className="text-[11px] text-slate-500 truncate">
              Chatting with Lingo Buddy · Grammar coaching stays cleanly on the right
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/85 border border-indigo-100 text-indigo-700 shrink-0 shadow-2xs">
          {activeSession?.messages.length || 0} turns
        </span>
      </div>

      {/* Pure Friend Messages Stream */}
      <div
        ref={chatScrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 space-y-4"
      >
        {activeSession?.messages.map(msg => {
          const isUser = msg.role === 'user';
          const isEditing = editingMsgId === msg.id;
          const isFocused = focusedFeedbackId === msg.id;
          const errCount =
            msg.analysis?.mistakes.filter(m => m.severity === 'GRAMMAR_ERROR').length || 0;
          const totalTips =
            (msg.analysis?.mistakes.length || 0) + (msg.analysis?.vocabUpgrades?.length || 0);
          const isUnclear =
            msg.analysis?.transcriptQuality === 'unclear' ||
            (msg.analysis?.transcriptQuality === 'partially_unclear' && totalTips === 0);
          const isIncomplete =
            msg.analysis?.transcriptQuality === 'partially_unclear' && totalTips === 0;
          const isMastered = Boolean(msg.analysis?.tryAgainResult?.matched);

          return (
            <div
              key={msg.id}
              className={`group flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div className="flex items-center gap-1.5 px-1">
                {!isUser && (
                  <span
                    className="w-4 h-4 rounded-full shadow-2xs ring-1 ring-white inline-block shrink-0"
                    style={{
                      background:
                        'radial-gradient(circle at 35% 28%, #ffffff 0%, #38bdf8 30%, #2563eb 62%, #d946ef 100%)'
                    }}
                    aria-hidden="true"
                  />
                )}
                <span className="text-[11px] font-semibold text-slate-500">
                  {isUser ? 'You' : 'Lingo Buddy'}
                </span>
                {isUser && msg.isEdited && (
                  <span className="text-[10px] font-semibold text-emerald-600">· Edited</span>
                )}
              </div>

              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed space-y-2 transition-all ${
                  isUser
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-xs'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-sm'
                }`}
              >
                {isEditing ? (
                  <div className="space-y-2.5">
                    <textarea
                      value={editingDraft}
                      onChange={(e) => onChangeEditingDraft(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl p-2.5 text-sm text-slate-900 bg-white border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={onCancelEditing}
                        className="px-2.5 py-1 rounded-lg text-xs text-blue-100 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => onSaveEditedTranscript(msg.id)}
                        className="px-3 py-1 rounded-lg bg-white text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save &amp; Re-Check</span>
                      </button>
                    </div>
                  </div>
                ) : !isUser && msg.id === streamingBuddyMsgId && !msg.text ? (
                  <span className="inline-flex items-center gap-1.5 py-0.5 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '140ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '280ms' }} />
                  </span>
                ) : !isUser && msg.spokenCorrection ? (
                  <div className="space-y-1.5">
                    <span
                      className={`inline-block rounded-xl px-2.5 py-1 text-xs font-semibold border leading-relaxed ${
                        msg.correctionType === 'naturalness'
                          ? 'bg-purple-50/90 text-purple-900 border-purple-200/90'
                          : 'bg-emerald-50/90 text-emerald-900 border-emerald-200/90'
                      }`}
                    >
                      {msg.spokenCorrection}
                    </span>
                    {(msg.conversationalResponse || msg.id === streamingBuddyMsgId) && (
                      <p className="text-slate-800">
                        {msg.conversationalResponse}
                        {msg.id === streamingBuddyMsgId && (
                          <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 align-middle rounded-full animate-pulse" />
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <p>
                    {msg.text}
                    {!isUser && msg.id === streamingBuddyMsgId && (
                      <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 align-middle rounded-full animate-pulse" />
                    )}
                  </p>
                )}

                {isUser && msg.uncertainWords && msg.uncertainWords.length > 0 && !isEditing && (
                  <div className="pt-2 border-t border-white/20 text-[11px] text-amber-100 flex items-center justify-between gap-2">
                    <span>
                      Uncertain mic word:{' '}
                      <span className="underline decoration-dotted">
                        {msg.uncertainWords.slice(0, 3).join(', ')}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onStartEditingMsg(msg.id, msg.text)}
                      className="font-bold text-white hover:underline cursor-pointer shrink-0"
                    >
                      Fix
                    </button>
                  </div>
                )}

                {isUser &&
                  msg.isEdited &&
                  msg.originalRawTranscript &&
                  showRawForMsgId === msg.id && (
                    <p className="text-[11px] text-blue-100/90 pt-1.5 border-t border-white/20 font-mono">
                      Raw capture: “{msg.originalRawTranscript}”
                    </p>
                  )}
              </div>

              {/* Inline Coaching Pointer Pill + Actions */}
              {!isEditing && (
                <div className="flex items-center gap-2.5 px-1 flex-wrap text-[11px]">
                  {isUser ? (
                    <>
                      {msg.isAnalyzing ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 animate-pulse">
                          <Sparkles className="w-3 h-3 animate-spin" />
                          <span>Analyzing...</span>
                        </span>
                      ) : msg.analysis ? (
                        <button
                          type="button"
                          onClick={() => onSelectFeedbackMsg(msg.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                            isUnclear
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : isMastered
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : errCount > 0
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : totalTips > 0
                              ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          } ${isFocused ? 'ring-2 ring-blue-500/25' : ''}`}
                        >
                          <span>
                            {isIncomplete
                              ? 'Incomplete / cut off · Review →'
                              : isUnclear
                              ? 'Unclear capture · Review →'
                              : isMastered
                              ? '✓ Mastered · View →'
                              : errCount > 0
                              ? `${errCount} ${errCount === 1 ? 'mistake' : 'mistakes'} · View coach →`
                              : totalTips > 0
                              ? `${totalTips} phrasing ${totalTips === 1 ? 'tip' : 'tips'} · View →`
                              : '✓ Clean English'}
                          </span>
                        </button>
                      ) : null}

                      {msg.recordedAudioUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              stopSpeech();
                              const clip = new Audio(msg.recordedAudioUrl);
                              clip.play().catch(() => {});
                            } catch {}
                          }}
                          className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Replay your original recorded audio to verify verbatim words"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>My voice</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onStartEditingMsg(msg.id, msg.text)}
                        className="text-slate-400 hover:text-blue-600 flex items-center gap-1 cursor-pointer opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      {msg.isEdited && msg.originalRawTranscript && (
                        <button
                          type="button"
                          onClick={() => onToggleShowRaw(msg.id)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {showRawForMsgId === msg.id ? 'Hide raw' : 'View raw'}
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        unlockAudioOutput();
                        onSpeakBuddyAgain(msg.text);
                      }}
                      className="text-slate-400 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Listen again</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Live Streaming Speech Bubble inside Chat Stream */}
        {isListening && (liveFinalText || liveInterimText) && (
          <div className="flex flex-col items-end space-y-1 animate-in fade-in duration-100">
            <div className="flex items-center gap-1.5 px-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[9px] font-bold uppercase tracking-wider text-sky-700">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                <span>Speaking Live</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">You</span>
            </div>
            <div className="max-w-[88%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed bg-gradient-to-br from-blue-600/90 to-indigo-600/90 text-white shadow-xs border border-blue-400/40">
              <p>
                {liveFinalText && <span>{liveFinalText}</span>}
                {liveFinalText && liveInterimText ? ' ' : ''}
                {liveInterimText && <span className="text-sky-200 italic">{liveInterimText}</span>}
                <span className="inline-block w-1 h-4 bg-sky-200 ml-1 align-middle rounded-full animate-pulse" />
              </p>
            </div>
          </div>
        )}

        {/* Fresh Conversation Topic Generator Cards */}
        {!hasUserMessages && !isListening && (
          <div className="pt-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Conversation Starters
              </span>
              <button
                type="button"
                onClick={() => onStartTopicChat(pickTopicStarterPrompt())}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Surprise Topic</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BUDDY_TOPIC_STARTERS.map(topic => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onStartTopicChat(pickTopicStarterPrompt(topic.id))}
                  className="group text-left p-3.5 rounded-2xl bg-slate-50/80 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 block">
                      {topic.label}
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-snug">
                      {topic.description}
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Live 3-Stage Verbatim Speech -> Final Transcript -> Grammar Analysis Strip */}
      {(isListening || orbState === 'transcribing' || latestUserTurn) && (
        <div className="shrink-0 px-4 py-2 border-t border-slate-100 bg-slate-50/90 text-[11px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Stage 1: Live Speech Detection */}
            <div className="rounded-xl bg-white border border-slate-200/80 px-2.5 py-1.5 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  1. Speech Capture
                </span>
                {isListening ? (
                  <span className="text-[9px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-1.5 rounded-full">
                    Provisional
                  </span>
                ) : orbState === 'transcribing' ? (
                  <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 rounded-full animate-pulse">
                    Transcribing
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold text-slate-500">
                    {latestUserTurn?.sttEngine === 'typed' ? 'Typed' : 'Captured'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-700 truncate mt-0.5">
                {isListening
                  ? liveTextPreview
                    ? `“${liveTextPreview}”`
                    : 'Listening to your voice...'
                  : orbState === 'transcribing'
                  ? 'Transcribing verbatim...'
                  : `“${latestUserTurn?.originalRawTranscript || latestUserTurn?.text}”`}
              </p>
            </div>

            {/* Stage 2: Final Verbatim Transcript */}
            <div className="rounded-xl bg-white border border-slate-200/80 px-2.5 py-1.5 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  2. Final Verbatim
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 rounded-full border ${
                    isListening || orbState === 'transcribing'
                      ? 'bg-slate-50 text-slate-400 border-slate-200'
                      : latestUserTurn?.isEdited
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isListening || orbState === 'transcribing'
                    ? 'Waiting'
                    : latestUserTurn?.isEdited
                    ? 'User Edited'
                    : 'Finalized'}
                </span>
              </div>
              <p className="text-[11px] text-slate-800 font-medium truncate mt-0.5">
                {isListening || orbState === 'transcribing'
                  ? 'Waits for turn end (never grades partial words)'
                  : `“${latestUserTurn?.finalizedVerbatimTranscript || latestUserTurn?.text}”`}
              </p>
            </div>

            {/* Stage 3: Independent Grammar Analysis */}
            <div className="rounded-xl bg-white border border-slate-200/80 px-2.5 py-1.5 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  3. Grammar Coach
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 rounded-full border ${
                    isListening || orbState === 'transcribing'
                      ? 'bg-slate-50 text-slate-400 border-slate-200'
                      : latestUserTurn?.isAnalyzing
                      ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                      : isLatestUnclear || isLatestIncomplete
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : latestErrors > 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isListening || orbState === 'transcribing'
                    ? 'Standby'
                    : latestUserTurn?.isAnalyzing
                    ? 'Analyzing'
                    : 'Completed'}
                </span>
              </div>
              <p className="text-[11px] font-semibold truncate mt-0.5 text-slate-700">
                {isListening || orbState === 'transcribing'
                  ? 'Will analyze finalized verbatim words'
                  : latestUserTurn?.isAnalyzing
                  ? 'Checking grammar & phrasing...'
                  : isLatestUnclear
                  ? 'Unclear capture — skipped grading'
                  : isLatestIncomplete
                  ? 'Incomplete fragment — needs clarification'
                  : latestErrors > 0
                  ? `${latestErrors} ${latestErrors === 1 ? 'mistake' : 'mistakes'} identified`
                  : '✓ Clean, natural English'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Always-Ready Clean SaaS Chat Composer */}
      <div className="shrink-0 p-3.5 border-t border-slate-100 bg-slate-50/60">
        <form
          onSubmit={onSendTyped}
          className="flex items-center gap-2 bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 rounded-2xl p-1.5 pl-4 shadow-2xs transition-all"
        >
          <input
            ref={typedInputRef}
            type="text"
            value={typedInput}
            onChange={(e) => onChangeTypedInput(e.target.value)}
            placeholder="Type a message or speak using the orb on the left..."
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!typedInput.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-35 text-white transition-colors cursor-pointer shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </main>
  );
};
