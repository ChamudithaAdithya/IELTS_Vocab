import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Gauge,
  Check,
  Undo2,
  Copy,
  Radio,
  Wand2,
  Send,
  Cpu,
  Sliders
} from 'lucide-react';
import type { SpeechEngineMode } from './MicDiagnosticModal';
import type { WhisperProgressUpdate } from '../../utils/whisperClient';

export type SttLiveStatus =
  | 'idle'
  | 'starting'
  | 'listening'
  | 'streaming'
  | 'solo-stt'
  | 'recording-clean'
  | 'stalled'
  | 'error'
  | 'transcribing';

export interface VoiceTranscriptNotepadProps {
  title?: string;
  value: string;
  onChange: (val: string) => void;
  speechInterim: string;
  isRecording: boolean;
  recordSeconds: number;
  audioLevel: number;
  speechEngine: SpeechEngineMode;
  onSelectSpeechEngine: (engine: SpeechEngineMode) => void;
  whisperProgress?: WhisperProgressUpdate | null;
  recognitionLang: string;
  onAccentChange: (lang: string) => void;
  sttStatus: SttLiveStatus;
  sttError: string | null;
  onDismissError: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onOpenMicDiagnostic?: () => void;
  onAutoPunctuate: () => void;
  onClear: () => void;
  canUndo?: boolean;
  onUndoLastBurst?: () => void;
  recordedAudioUrl: string | null;
  isPlayingOwnAudio: boolean;
  onTogglePlayOwnAudio: () => void;
  hasAudioBlob: boolean;
  isTranscribingAudio: boolean;
  hasGeminiApiKey: boolean;
  onTranscribeWithWhisper: () => void;
  onTranscribeWithGemini: () => void;
  onOpenApiKeyModal?: () => void;
  hesitationAlert: boolean;
  showSparks?: boolean;
  showAccentSelector?: boolean;
  placeholder?: string;
  submitLabel?: string;
  submitLoadingLabel?: string;
  isEvaluating?: boolean;
  onSubmit?: () => void;
  showSinhala?: boolean;
}

const BAND8_SPARKS = [
  'to be honest',
  'from my perspective',
  'for instance',
  'on the other hand',
  'as a result'
];

const FILLER_REGEX = /\b(um+|uh+|erm+|like|you know|sort of|kind of)\b/gi;

export const VoiceTranscriptNotepad: React.FC<VoiceTranscriptNotepadProps> = ({
  title = 'Live Voice-to-Text Notepad',
  value,
  onChange,
  speechInterim,
  isRecording,
  recordSeconds,
  audioLevel,
  speechEngine,
  onSelectSpeechEngine,
  whisperProgress,
  recognitionLang,
  onAccentChange,
  sttStatus,
  sttError,
  onDismissError,
  onStartRecording,
  onStopRecording,
  onOpenMicDiagnostic,
  onAutoPunctuate,
  onClear,
  canUndo = false,
  onUndoLastBurst,
  recordedAudioUrl,
  isPlayingOwnAudio,
  onTogglePlayOwnAudio,
  hasAudioBlob,
  isTranscribingAudio,
  hasGeminiApiKey,
  onTranscribeWithWhisper,
  onTranscribeWithGemini,
  onOpenApiKeyModal,
  hesitationAlert,
  showSparks = true,
  showAccentSelector = true,
  placeholder = 'Click "Start Speaking" to record your voice into accurate text here, or type your response...',
  submitLabel = 'Evaluate Speech',
  submitLoadingLabel = 'Evaluating...',
  isEvaluating = false,
  onSubmit,
  showSinhala = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [copied, setCopied] = useState(false);

  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const fillerMatches = value.match(FILLER_REGEX) || [];

  // Auto-scroll notepad while text updates
  useEffect(() => {
    if ((isRecording || speechInterim) && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [value, speechInterim, isRecording]);

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopy = () => {
    if (!value.trim()) return;
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  };

  const renderStatusPill = () => {
    if (isTranscribingAudio || sttStatus === 'transcribing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse">
          <Cpu className="w-3 h-3 animate-spin" />
          <span>
            {speechEngine === 'gemini-cloud'
              ? 'Transcribing via Gemini Audio AI...'
              : whisperProgress?.message || 'Transcribing with Whisper AI...'}
          </span>
        </span>
      );
    }
    if (isRecording) {
      if (speechEngine === 'whisper-local' || speechEngine === 'gemini-cloud') {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>
              {speechEngine === 'whisper-local'
                ? 'Clean Audio Capture → Whisper AI on Stop'
                : 'Clean Audio Capture → Gemini AI on Stop'}
            </span>
          </span>
        );
      }
      if (sttStatus === 'streaming') {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Pure Live STT Streaming</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>Pure Live STT Listening ({recognitionLang})</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header Row: Title + Engine Mode Switcher + Mic Test */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Mic className={`w-3.5 h-3.5 ${isRecording ? 'text-rose-600 animate-pulse' : 'text-indigo-600'}`} />
            <span>{title}</span>
          </span>
          {renderStatusPill()}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Zero-Conflict 3-Engine Selector */}
          <div
            className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-[11px]"
            title="Each engine owns your microphone cleanly with zero Windows audio conflict"
          >
            <button
              type="button"
              disabled={isRecording}
              onClick={() => onSelectSpeechEngine('whisper-local')}
              className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                speechEngine === 'whisper-local'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Free OpenAI Whisper neural ASR in browser — best accent accuracy & native punctuation"
            >
              <Cpu className="w-3 h-3" />
              <span>Whisper AI</span>
            </button>
            <button
              type="button"
              disabled={isRecording}
              onClick={() => onSelectSpeechEngine('live-solo')}
              className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer disabled:opacity-50 ${
                speechEngine === 'live-solo'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Pure Browser Live STT without MediaRecorder contention"
            >
              ⚡ Pure Live
            </button>
            <button
              type="button"
              disabled={isRecording}
              onClick={() => onSelectSpeechEngine('gemini-cloud')}
              className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer disabled:opacity-50 ${
                speechEngine === 'gemini-cloud'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Transcribe raw audio via Gemini Multimodal API (requires API key)"
            >
              ☁️ Gemini
            </button>
          </div>

          {onOpenMicDiagnostic && (
            <button
              type="button"
              disabled={isRecording}
              onClick={onOpenMicDiagnostic}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
              title="Select physical microphone and run a 5-second accuracy self-test"
            >
              <Sliders className="w-3 h-3" />
              <span>Test Mic</span>
            </button>
          )}

          {showAccentSelector && speechEngine === 'live-solo' && (
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-0.5 text-[11px]">
              <span className="text-slate-500">Accent:</span>
              <select
                value={recognitionLang}
                onChange={(e) => onAccentChange(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 text-[11px] focus:outline-none cursor-pointer"
                title="For Sri Lankan / South Asian English speakers, en-IN achieves highest browser STT accuracy"
              >
                <option value="en-IN">🇱🇰 / 🇮🇳 South Asian (Best for SL)</option>
                <option value="en-GB">🇬🇧 UK English (IELTS)</option>
                <option value="en-US">🇺🇸 US English</option>
                <option value="en-AU">🇦🇺 Australian</option>
              </select>
            </div>
          )}

          {fillerMatches.length > 0 && (
            <span
              className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200"
              title={`Detected verbal fillers: ${Array.from(new Set(fillerMatches.map(f => f.toLowerCase()))).join(', ')}`}
            >
              Fillers: {fillerMatches.length}
            </span>
          )}

          <span className="text-xs text-slate-500 font-mono">
            Words: {wordCount}
          </span>
        </div>
      </div>

      {/* Whisper Neural Model Download / Inference Progress Bar */}
      {whisperProgress && (whisperProgress.status === 'loading' || whisperProgress.status === 'inferencing') && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-indigo-900 font-bold">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>{whisperProgress.message || 'Running Whisper AI locally in your browser...'}</span>
            </span>
            {typeof whisperProgress.percent === 'number' && (
              <span className="font-mono">{whisperProgress.percent}%</span>
            )}
          </div>
          {typeof whisperProgress.percent === 'number' && (
            <div className="w-full h-1.5 bg-indigo-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-200 rounded-full"
                style={{ width: `${whisperProgress.percent}%` }}
              />
            </div>
          )}
          <p className="text-[10px] text-indigo-700">
            First-time model weights download once and stay cached offline in your browser.
          </p>
        </div>
      )}

      {/* Explicit Diagnostic / Rescue Banner */}
      {sttError && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">{sttError}</p>
                {showSinhala && (
                  <p className="text-[11px] text-amber-800 font-sinhala">
                    වඩාත් නිවැරදි හඬ හඳුනාගැනීම සඳහා "Whisper AI" එන්ජිම තෝරාගන්න හෝ "Test Mic" මඟින් මයික්‍රෆෝනය පරීක්ෂා කරන්න.
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onDismissError}
              className="text-amber-700 hover:text-amber-950 font-bold cursor-pointer text-[11px] shrink-0"
            >
              Dismiss
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            {speechEngine !== 'whisper-local' && !isRecording && (
              <button
                type="button"
                onClick={() => {
                  onDismissError();
                  onSelectSpeechEngine('whisper-local');
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold cursor-pointer flex items-center gap-1"
              >
                <Cpu className="w-3 h-3" />
                <span>Switch to Whisper AI Local (Recommended)</span>
              </button>
            )}
            {speechEngine === 'live-solo' && recognitionLang !== 'en-IN' && (
              <button
                type="button"
                onClick={() => onAccentChange('en-IN')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold cursor-pointer"
              >
                🇱🇰 Try South Asian English (en-IN)
              </button>
            )}
            {onOpenMicDiagnostic && !isRecording && (
              <button
                type="button"
                onClick={onOpenMicDiagnostic}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer"
              >
                🎛️ Open Mic & Accuracy Test
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary Action & Telemetry Controls Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {!isRecording ? (
            <button
              type="button"
              onClick={onStartRecording}
              disabled={isTranscribingAudio}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>Start Speaking</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStopRecording}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <MicOff className="w-4 h-4 text-rose-400" />
              <span>
                {speechEngine === 'whisper-local'
                  ? 'Stop & Transcribe (Whisper)'
                  : speechEngine === 'gemini-cloud'
                  ? 'Stop & Transcribe (Gemini)'
                  : 'Stop Recording'}
              </span>
            </button>
          )}

          {/* Live Equalizer + Timer + Pace Meter + Hesitation Alert */}
          {isRecording && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl shadow-2xs">
                {speechEngine !== 'live-solo' ? (
                  <div className="flex items-center gap-0.5 h-4" title="Live Microphone Audio Signal">
                    {[0.4, 0.8, 1.0, 0.7, 0.5].map((multiplier, i) => (
                      <span
                        key={i}
                        className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                        style={{
                          height: `${Math.max(4, Math.min(16, audioLevel * multiplier * 0.22 + 4))}px`
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                )}
                <span className="text-xs font-mono font-bold text-rose-700">
                  {formatSec(recordSeconds)}
                </span>
                <span className="text-[11px] text-rose-600 hidden sm:inline font-medium">
                  {speechEngine === 'live-solo'
                    ? 'Pure Solo STT'
                    : audioLevel > 10
                    ? 'Voice Detected'
                    : 'Speak now...'}
                </span>
              </div>

              {recordSeconds >= 4 && wordCount > 0 && (() => {
                const liveWpm = Math.round((wordCount / recordSeconds) * 60);
                const paceStyle =
                  liveWpm < 95
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : liveWpm <= 160
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200';
                const paceLabel =
                  liveWpm < 95 ? 'Slow' : liveWpm <= 160 ? 'Ideal Pace' : 'Fast';
                return (
                  <span className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1 ${paceStyle}`}>
                    <Gauge className="w-3 h-3" />
                    <span>{liveWpm} WPM · {paceLabel}</span>
                  </span>
                );
              })()}

              {hesitationAlert && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-700" />
                  <span>Pause &gt; 3s — Keep flowing!</span>
                </span>
              )}
            </div>
          )}

          {/* Post-Recording Audio Playback & Re-Transcribe Actions */}
          {!isRecording && recordedAudioUrl && (
            <button
              type="button"
              onClick={onTogglePlayOwnAudio}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isPlayingOwnAudio
                  ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
              title="Listen back to your exact raw recorded voice"
            >
              {isPlayingOwnAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingOwnAudio ? 'Playing Voice...' : 'Play My Voice'}</span>
            </button>
          )}

          {!isRecording && hasAudioBlob && (
            <>
              <button
                type="button"
                onClick={onTranscribeWithWhisper}
                disabled={isTranscribingAudio}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-indigo-200"
                title="Re-transcribe recorded audio locally using OpenAI Whisper"
              >
                <Cpu className={`w-3.5 h-3.5 text-indigo-600 ${isTranscribingAudio ? 'animate-spin' : ''}`} />
                <span>Whisper AI</span>
              </button>

              {hasGeminiApiKey && (
                <button
                  type="button"
                  onClick={onTranscribeWithGemini}
                  disabled={isTranscribingAudio}
                  className="px-2.5 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 disabled:opacity-50 text-violet-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-violet-200"
                  title="Re-transcribe recorded audio via Gemini Cloud AI"
                >
                  <Wand2 className={`w-3.5 h-3.5 text-violet-600 ${isTranscribingAudio ? 'animate-spin' : ''}`} />
                  <span>Gemini AI</span>
                </button>
              )}
            </>
          )}

          {/* Editing Utilities */}
          {!isRecording && value && (
            <>
              <button
                type="button"
                onClick={onAutoPunctuate}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-indigo-200"
                title="Add periods, question marks, exclamation marks, commas, and capital letters automatically"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>✨ Punctuate</span>
              </button>

              {canUndo && onUndoLastBurst && (
                <button
                  type="button"
                  onClick={onUndoLastBurst}
                  className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  title="Undo last spoken recording burst"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>Undo</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                title="Copy transcript text"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={onClear}
                className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear notepad and audio recording"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>

        {/* Optional Submit Button */}
        {onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isEvaluating || isTranscribingAudio || (!value.trim() && !speechInterim.trim())}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              !value.trim() && !speechInterim.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : isEvaluating
                ? 'bg-indigo-700 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
            }`}
          >
            {isEvaluating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                <span>{submitLoadingLabel}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{submitLabel}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Live Voice-to-Text Notepad Canvas */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className={`w-full rounded-2xl p-4 pb-10 text-sm sm:text-base font-serif text-slate-900 placeholder:text-slate-400 focus:outline-none leading-relaxed resize-y transition-all ${
            isRecording
              ? 'bg-rose-50/25 border-2 border-rose-400 ring-2 ring-rose-100'
              : isTranscribingAudio
              ? 'bg-indigo-50/30 border-2 border-indigo-300 animate-pulse'
              : 'bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500'
          }`}
        />

        {/* Inline Live Status / Interim Capsule */}
        {isRecording && (
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-xs bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-indigo-200 shadow-xs pointer-events-none">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${speechInterim || audioLevel > 10 ? 'bg-emerald-500 animate-ping' : 'bg-rose-500 animate-pulse'}`} />
              {speechEngine === 'live-solo' ? (
                speechInterim ? (
                  <span className="font-serif italic text-indigo-800 truncate font-medium">
                    Hearing: "{speechInterim}"
                    <span className="inline-block w-0.5 h-3.5 bg-indigo-600 ml-0.5 align-middle animate-pulse" />
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium truncate">
                    Pure Live STT active (Zero Windows APO conflict) — speak clearly...
                  </span>
                )
              ) : (
                <span className="text-emerald-800 font-medium truncate">
                  {audioLevel > 10
                    ? `Capturing crystal-clear raw voice — click "Stop & Transcribe" for accurate ${speechEngine === 'whisper-local' ? 'Whisper AI' : 'Gemini AI'} text!`
                    : 'Microphone ready — speak your full answer clearly, then click Stop...'}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-400 shrink-0 hidden sm:inline">
              {speechEngine === 'whisper-local'
                ? 'Whisper Neural'
                : speechEngine === 'gemini-cloud'
                ? 'Gemini Audio'
                : recognitionLang}
            </span>
          </div>
        )}
      </div>

      {/* Live Band 8 Target Discourse Sparks */}
      {showSparks && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Band 8 Sparks:
          </span>
          {BAND8_SPARKS.map(spark => {
            const used = value.toLowerCase().includes(spark);
            return (
              <span
                key={spark}
                className={`text-[11px] px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                  used
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                {used && <Check className="w-3 h-3 text-emerald-600" />}
                <span>"{spark}"</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
