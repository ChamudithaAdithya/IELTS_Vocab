import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2,
  Pause,
  Mic,
  MicOff,
  Play,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Gauge,
  Headphones
} from 'lucide-react';
import { playSpeech, stopSpeech } from '../../utils/speech';

export interface ShadowingTopicOption {
  id: string;
  topic: string;
  part: number;
  category: string;
  sampleBand8Answer: string;
}

export interface ShadowingPlayerProps {
  topicTitle: string;
  modelText: string;
  allTopics?: ShadowingTopicOption[];
  selectedTopicId?: string;
  onSelectTopicId?: (id: string) => void;
  showSinhala?: boolean;
  compact?: boolean;
}

const DISCOURSE_HIGHLIGHTS = [
  'well, to be honest',
  'to be honest',
  'personally speaking',
  'from my perspective',
  'in my opinion',
  'on the other hand',
  'having said that',
  'nevertheless',
  'furthermore',
  'moreover',
  'however',
  'consequently',
  'first of all',
  'all in all',
  'for instance',
  'for example',
  'admittedly',
  'actually',
  'frankly'
];

const CONTRACTION_REGEX = /\b(I'm|I've|I'll|I'd|it's|that's|there's|don't|doesn't|didn't|can't|won't|wouldn't|couldn't|shouldn't|we've|they're|you're|isn't|aren't)\b/gi;

function splitModelIntoSentences(text: string): string[] {
  if (!text || !text.trim()) return [];
  const raw = text
    .trim()
    .replace(/\s+/g, ' ')
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 3);
  return raw.length > 0 ? raw : [text.trim()];
}

// Render sentence with visual prosody hints: discourse markers (indigo) & connected contractions (emerald)
function renderProsodyAnnotatedSentence(sentence: string): React.ReactNode {
  const parts: { text: string; kind: 'normal' | 'marker' | 'contraction' }[] = [];
  let remaining = sentence;

  // Check if starts with a discourse marker
  const lower = remaining.toLowerCase();
  for (const marker of DISCOURSE_HIGHLIGHTS) {
    if (lower.startsWith(marker)) {
      const endIdx = marker.length + (remaining[marker.length] === ',' ? 1 : 0);
      parts.push({ text: remaining.slice(0, endIdx), kind: 'marker' });
      remaining = remaining.slice(endIdx);
      break;
    }
  }

  // Split remaining by contractions
  let lastIndex = 0;
  CONTRACTION_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CONTRACTION_REGEX.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: remaining.slice(lastIndex, match.index), kind: 'normal' });
    }
    parts.push({ text: match[0], kind: 'contraction' });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < remaining.length) {
    parts.push({ text: remaining.slice(lastIndex), kind: 'normal' });
  }

  return parts.map((p, idx) => {
    if (p.kind === 'marker') {
      return (
        <span
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-semibold not-italic"
          title="Discourse marker — pause slightly after comma"
        >
          {p.text}
        </span>
      );
    }
    if (p.kind === 'contraction') {
      return (
        <span
          key={idx}
          className="underline decoration-emerald-500 decoration-2 underline-offset-2 font-semibold text-emerald-900"
          title="Natural connected speech contraction"
        >
          {p.text}
        </span>
      );
    }
    return <span key={idx}>{p.text}</span>;
  });
}

export const ShadowingPlayer: React.FC<ShadowingPlayerProps> = ({
  topicTitle,
  modelText,
  allTopics,
  selectedTopicId,
  onSelectTopicId,
  showSinhala = false,
  compact = false
}) => {
  const sentences = useMemo(() => splitModelIntoSentences(modelText), [modelText]);

  const [playbackRate, setPlaybackRate] = useState<number>(0.9);
  const [playingIdx, setPlayingIdx] = useState<number | 'full' | null>(null);
  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [recordedBlobs, setRecordedBlobs] = useState<Record<number, string>>({});
  const [playingUserIdx, setPlayingUserIdx] = useState<number | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const userAudioElRef = useRef<HTMLAudioElement | null>(null);

  // Reset recordings when modelText changes
  useEffect(() => {
    Object.values(recordedBlobs).forEach((url: string) => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    });
    setRecordedBlobs({});
    setPlayingIdx(null);
    setRecordingIdx(null);
    setPlayingUserIdx(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      stopShadowRecordingResources();
      if (userAudioElRef.current) {
        userAudioElRef.current.pause();
        userAudioElRef.current = null;
      }
      Object.values(recordedBlobs).forEach((url: string) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopShadowRecordingResources = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      } catch {}
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    setAudioLevel(0);
  };

  const handlePlayNative = (text: string, idx: number | 'full') => {
    if (playingIdx === idx) {
      stopSpeech();
      setPlayingIdx(null);
      return;
    }
    stopSpeech();
    if (userAudioElRef.current) {
      userAudioElRef.current.pause();
      setPlayingUserIdx(null);
    }
    setPlayingIdx(idx);
    playSpeech(text, {
      rate: playbackRate,
      onStart: () => setPlayingIdx(idx),
      onEnd: () => setPlayingIdx(null),
      onError: () => setPlayingIdx(null)
    });
  };

  const handleStartShadowRecord = async (idx: number) => {
    setMicError(null);
    stopSpeech();
    setPlayingIdx(null);
    if (userAudioElRef.current) {
      userAudioElRef.current.pause();
      setPlayingUserIdx(null);
    }

    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicError('Audio recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        }
      });
      mediaStreamRef.current = stream;

      // Live audio visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        const src = ctx.createMediaStreamSource(stream);
        src.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (!mediaStreamRef.current) return;
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          setAudioLevel(Math.min(100, Math.round((sum / data.length / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(tick);
        };
        animFrameRef.current = requestAnimationFrame(tick);
      }

      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlobs(prev => {
          if (prev[idx]) {
            try {
              URL.revokeObjectURL(prev[idx]);
            } catch {}
          }
          return { ...prev, [idx]: url };
        });
        stopShadowRecordingResources();
        setRecordingIdx(null);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecordingIdx(idx);
    } catch {
      setMicError('Microphone permission denied. Please allow microphone access to shadow sentences.');
      stopShadowRecordingResources();
      setRecordingIdx(null);
    }
  };

  const handleStopShadowRecord = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    } else {
      stopShadowRecordingResources();
      setRecordingIdx(null);
    }
  };

  const handlePlayUserRecording = (idx: number) => {
    const url = recordedBlobs[idx];
    if (!url) return;

    if (playingUserIdx === idx && userAudioElRef.current) {
      userAudioElRef.current.pause();
      setPlayingUserIdx(null);
      return;
    }

    stopSpeech();
    setPlayingIdx(null);
    if (userAudioElRef.current) {
      userAudioElRef.current.pause();
    }

    const audio = new Audio(url);
    userAudioElRef.current = audio;
    setPlayingUserIdx(idx);
    audio.onended = () => setPlayingUserIdx(null);
    audio.onerror = () => setPlayingUserIdx(null);
    audio.play().catch(() => setPlayingUserIdx(null));
  };

  const shadowedCount = Object.keys(recordedBlobs).length;

  return (
    <div className={`bg-white border border-slate-200 rounded-3xl ${compact ? 'p-4 sm:p-5' : 'p-5 sm:p-7'} shadow-xs space-y-5`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1">
              <Headphones className="w-3 h-3 text-amber-300" />
              <span>Shadowing & Intonation Studio</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {shadowedCount}/{sentences.length} Sentences Shadowed
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
            {topicTitle}
          </h2>
          <p className="text-xs text-slate-500">
            Listen to each native Band 8.5 thought group, record your voice mimicking the rhythm & stress, then compare side-by-side.
          </p>
          {showSinhala && (
            <p className="text-[11px] text-indigo-700 font-sinhala">
              💡 එක් එක් වාක්‍යයට සවන් දී, එහි රිද්මය සහ උච්චාරණය අනුකරණය කරමින් පටිගත කර සංසන්දනය කරන්න.
            </p>
          )}
        </div>

        {/* Speed Selector & Full Playback */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px]">
            <Gauge className="w-3.5 h-3.5 text-slate-500 ml-1" />
            {[
              { label: '0.75x Slow', val: 0.75 },
              { label: '0.9x Clear', val: 0.9 },
              { label: '1.0x Native', val: 1.0 }
            ].map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setPlaybackRate(opt.val)}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  playbackRate === opt.val
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handlePlayNative(modelText, 'full')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              playingIdx === 'full'
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {playingIdx === 'full' ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-300" />}
            <span>{playingIdx === 'full' ? 'Stop Full Model' : 'Play Full Model'}</span>
          </button>
        </div>
      </div>

      {/* Optional Topic Switcher when used as standalone Mode 4 */}
      {allTopics && onSelectTopicId && selectedTopicId && (
        <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-50 border border-slate-200 rounded-2xl p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700">Practice Model:</span>
            <select
              value={selectedTopicId}
              onChange={(e) => onSelectTopicId(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-xs sm:max-w-md truncate"
            >
              {allTopics.map(t => (
                <option key={t.id} value={t.id}>
                  {t.category} · Part {t.part}: {t.topic}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-indigo-200 border border-indigo-400 inline-block" />
              <span>Discourse Marker</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-200 border border-emerald-500 inline-block" />
              <span>Connected Contraction</span>
            </span>
          </div>
        </div>
      )}

      {micError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <span>{micError}</span>
          <button
            type="button"
            onClick={() => setMicError(null)}
            className="font-bold text-amber-800 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sentence-by-Sentence Shadowing Cards */}
      <div className="space-y-3">
        {sentences.map((sentence, idx) => {
          const isThisPlaying = playingIdx === idx;
          const isThisRecording = recordingIdx === idx;
          const hasUserRecording = Boolean(recordedBlobs[idx]);
          const isPlayingUser = playingUserIdx === idx;

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                isThisRecording
                  ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-100'
                  : isThisPlaying
                  ? 'bg-indigo-50/60 border-indigo-300'
                  : hasUserRecording
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold shrink-0 mt-0.5 ${
                      hasUserRecording
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {hasUserRecording ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </span>
                  <p className="text-sm sm:text-base font-serif italic text-slate-800 leading-relaxed">
                    "{renderProsodyAnnotatedSentence(sentence)}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-200/70">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* 1. Listen Native */}
                  <button
                    type="button"
                    onClick={() => handlePlayNative(sentence, idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isThisPlaying
                        ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse'
                        : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {isThisPlaying ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isThisPlaying ? 'Playing Native...' : '1. Listen Native'}</span>
                  </button>

                  {/* 2. Shadow Record */}
                  {!isThisRecording ? (
                    <button
                      type="button"
                      onClick={() => handleStartShadowRecord(idx)}
                      disabled={recordingIdx !== null && recordingIdx !== idx}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{hasUserRecording ? '2. Re-Shadow' : '2. Shadow Now'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopShadowRecord}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <MicOff className="w-3.5 h-3.5 text-rose-400" />
                      <span>Stop</span>
                      <span className="flex items-center gap-0.5 ml-1 h-3">
                        {[0.5, 1.0, 0.7].map((mult, barIdx) => (
                          <span
                            key={barIdx}
                            className="w-0.5 bg-rose-400 rounded-full"
                            style={{ height: `${Math.max(4, Math.min(12, audioLevel * mult * 0.16 + 4))}px` }}
                          />
                        ))}
                      </span>
                    </button>
                  )}

                  {/* 3. Play Back My Voice */}
                  {hasUserRecording && !isThisRecording && (
                    <button
                      type="button"
                      onClick={() => handlePlayUserRecording(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isPlayingUser
                          ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isPlayingUser ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlayingUser ? 'Playing Your Voice...' : '3. Play My Voice'}</span>
                    </button>
                  )}
                </div>

                {hasUserRecording && (
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Recorded</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Reset */}
      {shadowedCount > 0 && (
        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              Object.values(recordedBlobs).forEach((url: string) => {
                try {
                  URL.revokeObjectURL(url);
                } catch {}
              });
              setRecordedBlobs({});
              setPlayingUserIdx(null);
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Shadowing Session</span>
          </button>
        </div>
      )}
    </div>
  );
};
