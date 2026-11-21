import React, { useState, useEffect, useRef } from 'react';
import {
  History,
  Play,
  Pause,
  Trash2,
  X,
  Clock,
  Award,
  Gauge,
  Volume2
} from 'lucide-react';
import type { SavedSpeakingAttempt } from '../../utils/speakingAudioHistory';
import { formatBand } from '../../utils/tutorEngine';

export interface SpeakingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempts: SavedSpeakingAttempt[];
  onDeleteAttempt: (id: string) => void;
  onClearAll: () => void;
  showSinhala?: boolean;
}

export const SpeakingHistoryModal: React.FC<SpeakingHistoryModalProps> = ({
  isOpen,
  onClose,
  attempts,
  onDeleteAttempt,
  onClearAll,
  showSinhala = false
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeUrlRef = useRef<string | null>(null);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (activeUrlRef.current) {
      try {
        URL.revokeObjectURL(activeUrlRef.current);
      } catch {}
      activeUrlRef.current = null;
    }
    setPlayingId(null);
  };

  useEffect(() => {
    if (!isOpen) {
      stopPlayback();
    }
    return () => stopPlayback();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTogglePlay = (attempt: SavedSpeakingAttempt) => {
    if (!attempt.audioBlob) return;

    if (playingId === attempt.id) {
      stopPlayback();
      return;
    }

    stopPlayback();
    const url = URL.createObjectURL(attempt.audioBlob);
    activeUrlRef.current = url;
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingId(attempt.id);
    audio.onended = () => stopPlayback();
    audio.onerror = () => stopPlayback();
    audio.play().catch(() => stopPlayback());
  };

  const formatDate = (ts: number) => {
    try {
      return new Date(ts).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Past Recordings & Speaking Progress
              </h2>
              <p className="text-xs text-slate-500">
                Cached locally in your browser (IndexedDB) — replay past attempts to hear your growth.
              </p>
              {showSinhala && (
                <p className="text-[11px] text-indigo-700 font-sinhala">
                  පෙර පටිගත කළ කථන අභ්‍යාස නැවත අසා ඔබේ දියුණුව සංසන්දනය කරන්න.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {attempts.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  stopPlayback();
                  onClearAll();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer transition-colors"
              title="Close History"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Attempts List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {attempts.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Volume2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No recorded sessions saved yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Record and evaluate a speaking turn in Diagnostic Roadmap, Cambridge Exams, or Spontaneous Arena to automatically save your audio and score here.
              </p>
            </div>
          ) : (
            attempts.map((att) => {
              const isPlaying = playingId === att.id;
              return (
                <div
                  key={att.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {att.mode === 'roadmap'
                            ? 'Diagnostic'
                            : att.mode === 'cambridge'
                            ? 'Cambridge Mock'
                            : 'Spontaneous'}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{att.topic}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          · {formatDate(att.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Q: {att.question}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-amber-400 font-mono font-bold text-xs flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Band {formatBand(att.overallBand)}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (playingId === att.id) stopPlayback();
                          onDeleteAttempt(att.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete recording"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-serif italic text-slate-800 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                    "{att.transcript}"
                  </p>

                  <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{att.wpm} WPM</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{att.durationSec}s</span>
                      </span>
                      <span>{att.wordCount} words</span>
                    </div>

                    {att.audioBlob ? (
                      <button
                        type="button"
                        onClick={() => handleTogglePlay(att)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isPlaying
                            ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? 'Playing Recording...' : 'Replay My Voice'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Text-only turn (no mic audio)
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
