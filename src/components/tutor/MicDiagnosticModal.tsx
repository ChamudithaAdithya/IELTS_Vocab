import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { transcribeAudioBlobWithGemini } from '../../utils/speakingEngine';

export type SpeechEngineMode = 'gemini-cloud' | 'live-solo';

export interface MicDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDeviceId: string;
  onSelectDeviceId: (deviceId: string) => void;
  speechEngine: SpeechEngineMode;
  onSelectSpeechEngine: (engine: SpeechEngineMode) => void;
  recognitionLang: string;
  onAccentChange: (lang: string) => void;
  apiKey?: string;
  selectedModel?: string;
  showSinhala?: boolean;
}

const TEST_SENTENCE =
  'I enjoy travelling because it allows me to explore different cultures. Why do you prefer it?';

function computeWordMatchPercent(expected: string, actual: string): number {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

  const expWords = norm(expected);
  const actWords = norm(actual);
  if (expWords.length === 0 || actWords.length === 0) return 0;

  const actSet = new Set(actWords);
  let matched = 0;
  for (const w of expWords) {
    if (actSet.has(w) || (w === 'travelling' && actSet.has('traveling'))) {
      matched += 1;
    }
  }
  return Math.round((matched / expWords.length) * 100);
}

export const MicDiagnosticModal: React.FC<MicDiagnosticModalProps> = ({
  isOpen,
  onClose,
  selectedDeviceId,
  onSelectDeviceId,
  speechEngine,
  onSelectSpeechEngine,
  recognitionLang,
  onAccentChange,
  apiKey,
  selectedModel,
  showSinhala = false
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [isRecordingTest, setIsRecordingTest] = useState(false);
  const [testLevel, setTestLevel] = useState(0);
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [detectedText, setDetectedText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const loadAudioInputs = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const list = await navigator.mediaDevices.enumerateDevices();
      const inputs = list.filter(d => d.kind === 'audioinput');
      setDevices(inputs);
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      loadAudioInputs();
    } else {
      cleanupTestResources();
    }
    return () => cleanupTestResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const cleanupTestResources = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(t => t.stop());
      } catch {}
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }
    setIsRecordingTest(false);
    setIsPlayingTest(false);
    setTestLevel(0);
  };

  if (!isOpen) return null;

  const handleStartTest = async () => {
    setDetectedText('');
    setStatusMessage(null);
    blobRef.current = null;
    if (testAudioUrl) {
      try {
        URL.revokeObjectURL(testAudioUrl);
      } catch {}
      setTestAudioUrl(null);
    }

    if (speechEngine === 'live-solo') {
      // PURE SOLO Web Speech API — zero getUserMedia / MediaRecorder conflict!
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setStatusMessage('Browser Speech API unavailable here. Switch to Gemini Audio AI above!');
        return;
      }
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 3;
        rec.lang = recognitionLang;
        rec.onresult = (event: any) => {
          let full = '';
          for (let i = 0; i < event.results.length; i++) {
            const alt = event.results[i][0];
            if (alt?.transcript) full += alt.transcript + ' ';
          }
          setDetectedText(full.trim());
        };
        rec.onerror = (e: any) => {
          setStatusMessage(`Browser STT notice: ${e.error}. Try switching to Gemini Audio AI for highest accuracy.`);
        };
        rec.start();
        recognitionRef.current = rec;
        setIsRecordingTest(true);
        setStatusMessage(`Pure Solo Live STT (${recognitionLang}) listening — read the sentence aloud, then click Stop.`);
      } catch (err: any) {
        setStatusMessage(err?.message || 'Could not start browser speech recognition.');
      }
      return;
    }

    // Gemini Audio AI -> SINGLE CLEAN getUserMedia stream
    try {
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true
      };
      if (selectedDeviceId) {
        audioConstraints.deviceId = { exact: selectedDeviceId };
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      streamRef.current = stream;
      loadAudioInputs(); // refresh labels now that permission is granted

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (!streamRef.current) return;
          analyser.getByteFrequencyData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i];
          setTestLevel(Math.min(100, Math.round((sum / buf.length / 128) * 100)));
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setTestAudioUrl(url);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          try {
            audioCtxRef.current.close();
          } catch {}
          audioCtxRef.current = null;
        }
        setTestLevel(0);

        // Immediately run Gemini Audio transcription on the captured studio WAV clip!
        setIsBusy(true);
        try {
          if (!apiKey) {
            setStatusMessage('Please connect a Gemini API key first, or select Browser Live STT.');
          } else {
            setStatusMessage('Sending studio-conditioned 16kHz WAV audio to Gemini Multimodal AI...');
            const txt = await transcribeAudioBlobWithGemini(apiKey, selectedModel || 'gemini-2.5-flash', blob, recognitionLang);
            setDetectedText(txt || '(No speech detected)');
            setStatusMessage('Transcribed via Gemini Multimodal Audio AI (0% auto-correction).');
          }
        } catch (err: any) {
          setStatusMessage(err?.message || 'Transcription error.');
        } finally {
          setIsBusy(false);
        }
      };

      recorder.start();
      recorderRef.current = recorder;
      setIsRecordingTest(true);
      setStatusMessage('Recording clean raw audio (Zero Windows APO conflict) — read the test sentence aloud, then click Stop.');
    } catch (err: any) {
      setStatusMessage(err?.message || 'Could not access the selected microphone.');
    }
  };

  const handleStopTest = () => {
    setIsRecordingTest(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
      setStatusMessage('Pure Solo Live STT finished.');
      return;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop();
      } catch {}
    }
  };

  const handleTogglePlayTest = () => {
    if (!testAudioUrl) return;
    if (isPlayingTest && audioElRef.current) {
      audioElRef.current.pause();
      setIsPlayingTest(false);
      return;
    }
    const audio = new Audio(testAudioUrl);
    audioElRef.current = audio;
    setIsPlayingTest(true);
    audio.onended = () => setIsPlayingTest(false);
    audio.onerror = () => setIsPlayingTest(false);
    audio.play().catch(() => setIsPlayingTest(false));
  };

  const matchScore = detectedText ? computeWordMatchPercent(TEST_SENTENCE, detectedText) : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Microphone & Speech Accuracy Studio Check
              </h2>
              <p className="text-xs text-slate-500">
                Choose your physical mic & zero-conflict speech engine, then test accuracy in 5 seconds.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* 1. Speech Engine Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              1. Speech Recognition Engine (Zero Dual-Mic Conflict)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectSpeechEngine('gemini-cloud')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                  speechEngine === 'gemini-cloud'
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Gemini Verbatim Audio</span>
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    BEST
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Studio 16kHz WAV sent to Gemini Multimodal Audio. Highest accent accuracy &amp; 0% auto-correction.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectSpeechEngine('live-solo')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                  speechEngine === 'live-solo'
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">⚡ Browser Live STT</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    INSTANT
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Built-in Chrome live speech captioning without MediaRecorder lock.
                </p>
              </button>
            </div>
          </div>

          {/* 2. Engine-Specific Tuning (Mic Device / Browser Dialect) */}
          <div className="grid grid-cols-1 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            {speechEngine !== 'live-solo' ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700">Physical Microphone Input</label>
                  <button
                    type="button"
                    onClick={loadAudioInputs}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer font-semibold"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Refresh
                  </button>
                </div>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => onSelectDeviceId(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">System Default Microphone</option>
                  {devices.map((d, idx) => (
                    <option key={d.deviceId || idx} value={d.deviceId}>
                      {d.label || `Microphone ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Browser Accent Locale
                </label>
                <select
                  value={recognitionLang}
                  onChange={(e) => onAccentChange(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="en-GB">🇬🇧 UK English (en-GB — Recommended)</option>
                  <option value="en-US">🇺🇸 US English (en-US)</option>
                  <option value="en-AU">🇦🇺 Australian English (en-AU)</option>
                  <option value="en-IN">🇱🇰 / 🇮🇳 South Asian English (en-IN)</option>
                </select>
              </div>
            )}
          </div>

          {/* 3. Live 5-Second Accuracy Self-Test */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 block">
              2. Read This Sentence Aloud to Verify Accuracy
            </span>
            <p className="text-sm sm:text-base font-serif font-bold text-slate-900 bg-white p-3.5 rounded-xl border border-indigo-100">
              "{TEST_SENTENCE}"
            </p>
            {showSinhala && (
              <p className="text-[11px] text-indigo-800 font-sinhala">
                මෙම වාක්‍යය පැහැදිලිව කියවා Stop ඔබා නිරවද්‍යතාවය පරීක්ෂා කරන්න.
              </p>
            )}

            <div className="flex items-center gap-2.5 flex-wrap">
              {!isRecordingTest ? (
                <button
                  type="button"
                  onClick={handleStartTest}
                  disabled={isBusy}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Mic className="w-4 h-4" />
                  <span>Record Test Sentence</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopTest}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <MicOff className="w-4 h-4 text-rose-400" />
                  <span>Stop & Check Accuracy</span>
                </button>
              )}

              {isRecordingTest && speechEngine !== 'live-solo' && (
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-rose-200">
                  <span className="text-[11px] font-bold text-rose-700">Mic Signal:</span>
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75"
                      style={{ width: `${Math.max(5, testLevel)}%` }}
                    />
                  </div>
                </div>
              )}

              {testAudioUrl && !isRecordingTest && (
                <button
                  type="button"
                  onClick={handleTogglePlayTest}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {isPlayingTest ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingTest ? 'Playing Raw Mic...' : 'Hear Raw Mic Audio'}</span>
                </button>
              )}
            </div>

            {statusMessage && (
              <p className="text-xs text-slate-600 font-medium">{statusMessage}</p>
            )}

            {/* Result & Match Score */}
            {detectedText && (
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Detected Transcript
                  </span>
                  {matchScore !== null && (
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        matchScore >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : matchScore >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {matchScore >= 80 ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      <span>Match: {matchScore}%</span>
                    </span>
                  )}
                </div>
                <p className="text-sm font-serif text-slate-900">"{detectedText}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
