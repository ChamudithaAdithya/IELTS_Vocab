import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Send,
  Sparkles,
  Sliders,
  Edit3,
  Check,
  X,
  AlertTriangle,
  History,
  Keyboard,
  ChevronDown,
  Square,
  Cpu,
  Radio,
  RefreshCw,
  ArrowUpRight,
  ArrowLeft,
  Maximize2,
  Minimize2
} from 'lucide-react';
import type {
  BuddyLifecyclePhase,
  BuddyMessage,
  BuddyMode,
  BuddyOrbState,
  BuddyPersonality,
  BuddySession,
  BuddySpeechEngine
} from '../../types/speakingBuddy';
import {
  BUDDY_MODES,
  BUDDY_PERSONALITIES,
  BUDDY_TOPIC_STARTERS,
  createFreshBuddySession,
  generateBuddyFriendReply,
  getPersonalityConfig,
  loadBuddySessions,
  processBuddyTranscript,
  saveBuddySessions
} from '../../utils/speakingBuddyEngine';
import { transcribeAudioBlobWithGemini } from '../../utils/speakingEngine';
import {
  transcribeBlobWithWhisper,
  type WhisperModelId,
  type WhisperProgressUpdate
} from '../../utils/whisperClient';
import { playSpeech, stopSpeech } from '../../utils/speech';
import { loadApiKey, loadModel } from '../../utils/tutorEngine';
import { BuddyEnergyOrb } from './BuddyEnergyOrb';
import { MicDiagnosticModal } from '../tutor/MicDiagnosticModal';
import { ApiSettingsModal } from '../tutor/ApiSettingsModal';

export interface SpeakingBuddyViewProps {
  showSinhala: boolean;
  onBack?: () => void;
}

export const SpeakingBuddyView: React.FC<SpeakingBuddyViewProps> = ({ showSinhala, onBack }) => {
  // Sessions & History
  const [sessions, setSessions] = useState<BuddySession[]>(() => {
    const stored = loadBuddySessions();
    if (stored.length > 0) return stored;
    const initial = createFreshBuddySession('friendly', 'friendly');
    saveBuddySessions([initial]);
    return [initial];
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const stored = loadBuddySessions();
    return stored[0]?.id || '';
  });

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    if (activeSession && activeSession.id !== activeSessionId) {
      setActiveSessionId(activeSession.id);
    }
  }, [activeSession, activeSessionId]);

  useEffect(() => {
    saveBuddySessions(sessions);
  }, [sessions]);

  // Companion preferences
  const [personality, setPersonality] = useState<BuddyPersonality>(
    activeSession?.personality || 'friendly'
  );
  const [mode, setMode] = useState<BuddyMode>(activeSession?.mode || 'friendly');
  const [continuousMode, setContinuousMode] = useState<boolean>(true);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState<boolean>(true);

  // Speech Engine & Accent (Zero-Conflict 3-Engine Architecture)
  const [speechEngine, setSpeechEngine] = useState<BuddySpeechEngine>(() => {
    try {
      const saved = localStorage.getItem('ielts_speaking_stt_engine') as BuddySpeechEngine | null;
      if (saved === 'whisper-local' || saved === 'live-solo' || saved === 'gemini-cloud') return saved;
      return 'live-solo';
    } catch {
      return 'live-solo';
    }
  });
  const [recognitionLang, setRecognitionLang] = useState<string>(() => {
    try {
      return localStorage.getItem('ielts_speaking_accent') || 'en-IN';
    } catch {
      return 'en-IN';
    }
  });
  const [whisperModel, setWhisperModel] = useState<WhisperModelId>(() => {
    try {
      const saved = localStorage.getItem('ielts_speaking_whisper_model') as WhisperModelId | null;
      if (saved === 'onnx-community/whisper-base.en' || saved === 'onnx-community/whisper-tiny.en') return saved;
      return 'onnx-community/whisper-base.en';
    } catch {
      return 'onnx-community/whisper-base.en';
    }
  });
  const [selectedMicDeviceId, setSelectedMicDeviceId] = useState<string>(() => {
    try {
      return localStorage.getItem('ielts_speaking_mic_device_id') || '';
    } catch {
      return '';
    }
  });

  // Clean Progressive-Disclosure UI Overlays
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState<boolean>(false);
  const [showKeyboardInput, setShowKeyboardInput] = useState<boolean>(false);
  const [isMicDiagnosticOpen, setIsMicDiagnosticOpen] = useState<boolean>(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const el = pageContainerRef.current || document.documentElement;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen toggle unavailable:', err);
    }
  };

  const handleBackToApp = async () => {
    stopAllAudioAndCapture();
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch {}
    }
    if (onBack) onBack();
  };

  // Live Lifecycle & Orb State
  const [orbState, setOrbState] = useState<BuddyOrbState>('idle');
  const [_lifecyclePhase, setLifecyclePhase] = useState<BuddyLifecyclePhase>('PHASE_01_IDLE');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isBuddySpeaking, setIsBuddySpeaking] = useState<boolean>(false);
  const [liveInterimText, setLiveInterimText] = useState<string>('');
  const [typedInput, setTypedInput] = useState<string>('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [whisperProgress, setWhisperProgress] = useState<WhisperProgressUpdate | null>(null);

  // Inline Transcript Editing (Phase 1 P0.2)
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<string>('');
  const [showRawForMsgId, setShowRawForMsgId] = useState<string | null>(null);

  // API Key State
  const [apiKey, setApiKey] = useState<string>(() => loadApiKey());
  const [selectedModel, setSelectedModel] = useState<string>(() => loadModel());

  // Mutable Refs for 60 FPS Orb & Audio Lifecycle
  const audioLevelRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const vadPauseTimerRef = useRef<any>(null);
  const finalBufferRef = useRef<string>('');
  const interimBufferRef = useRef<string>('');
  const uncertainWordsRef = useRef<Set<string>>(new Set());
  const confidenceSumRef = useRef<{ total: number; count: number }>({ total: 0, count: 0 });
  const listenStartedAtRef = useRef<number>(0);
  const isListeningRef = useRef<boolean>(false);
  const continuousModeRef = useRef<boolean>(continuousMode);
  const voiceOutputEnabledRef = useRef<boolean>(voiceOutputEnabled);
  const speechEngineRef = useRef<BuddySpeechEngine>(speechEngine);
  const recognitionLangRef = useRef<string>(recognitionLang);
  const whisperModelRef = useRef<WhisperModelId>(whisperModel);
  const selectedMicDeviceIdRef = useRef<string>(selectedMicDeviceId);
  const personalityRef = useRef<BuddyPersonality>(personality);
  const modeRef = useRef<BuddyMode>(mode);
  const activeSessionRef = useRef<BuddySession>(activeSession);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const typedInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { continuousModeRef.current = continuousMode; }, [continuousMode]);
  useEffect(() => { voiceOutputEnabledRef.current = voiceOutputEnabled; }, [voiceOutputEnabled]);
  useEffect(() => { speechEngineRef.current = speechEngine; }, [speechEngine]);
  useEffect(() => { recognitionLangRef.current = recognitionLang; }, [recognitionLang]);
  useEffect(() => { whisperModelRef.current = whisperModel; }, [whisperModel]);
  useEffect(() => { selectedMicDeviceIdRef.current = selectedMicDeviceId; }, [selectedMicDeviceId]);
  useEffect(() => { personalityRef.current = personality; }, [personality]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { activeSessionRef.current = activeSession; }, [activeSession]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages.length, liveInterimText]);

  useEffect(() => {
    if (showKeyboardInput) {
      setTimeout(() => typedInputRef.current?.focus(), 60);
    }
  }, [showKeyboardInput]);

  useEffect(() => {
    return () => {
      stopAllAudioAndCapture();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateActiveSession = (updater: (sess: BuddySession) => BuddySession) => {
    const targetId = activeSessionRef.current?.id;
    if (!targetId) return;
    setSessions(prev => prev.map(s => (s.id === targetId ? updater(s) : s)));
  };

  const cleanupMediaCapture = () => {
    if (vadPauseTimerRef.current) {
      clearTimeout(vadPauseTimerRef.current);
      vadPauseTimerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
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
    audioLevelRef.current = 0;
  };

  const stopAllAudioAndCapture = () => {
    stopSpeech();
    setIsBuddySpeaking(false);
    isListeningRef.current = false;
    setIsListening(false);
    setLiveInterimText('');
    cleanupMediaCapture();
  };

  const speakBuddyMessage = (text: string, autoResumeAfter: boolean) => {
    if (!voiceOutputEnabledRef.current) {
      setOrbState('idle');
      setLifecyclePhase('PHASE_07_SAVED');
      if (autoResumeAfter && continuousModeRef.current && speechEngineRef.current === 'live-solo') {
        setTimeout(() => {
          if (!isListeningRef.current) startListeningTurn();
        }, 400);
      }
      return;
    }

    stopSpeech();
    const pCfg = getPersonalityConfig(personalityRef.current);
    setIsBuddySpeaking(true);
    setOrbState('speaking');
    setLifecyclePhase('PHASE_06_SPEAKING');

    playSpeech(text, {
      rate: pCfg.speechRate,
      onStart: () => {
        setIsBuddySpeaking(true);
        setOrbState('speaking');
      },
      onEnd: () => {
        setIsBuddySpeaking(false);
        setLifecyclePhase('PHASE_07_SAVED');
        if (autoResumeAfter && continuousModeRef.current && speechEngineRef.current === 'live-solo') {
          setTimeout(() => {
            if (!isListeningRef.current) {
              startListeningTurn();
            }
          }, 350);
        } else {
          setOrbState('idle');
        }
      },
      onError: () => {
        setIsBuddySpeaking(false);
        setOrbState('idle');
      }
    });
  };

  const processFinalizedUserTurn = async (params: {
    rawTranscript: string;
    engine: BuddySpeechEngine | 'typed';
    uncertainWords?: string[];
    sttConfidence?: number;
    durationSec?: number;
    autoResumeAfter?: boolean;
  }) => {
    const cleanRaw = params.rawTranscript.trim();
    if (!cleanRaw) {
      setOrbState('idle');
      setLifecyclePhase('PHASE_01_IDLE');
      return;
    }

    setOrbState('understanding');
    setLifecyclePhase('PHASE_04_UNDERSTANDING');

    const punctuated = processBuddyTranscript(cleanRaw);
    const now = Date.now();
    const userMsg: BuddyMessage = {
      id: `msg-user-${now}`,
      role: 'user',
      timestamp: now,
      text: punctuated,
      originalRawTranscript: cleanRaw,
      isEdited: false,
      uncertainWords: params.uncertainWords && params.uncertainWords.length > 0 ? params.uncertainWords : undefined,
      sttConfidence: params.sttConfidence,
      sttEngine: params.engine,
      audioDurationSec: params.durationSec
    };

    const currentMessages = activeSessionRef.current?.messages || [];
    const updatedHistory = [...currentMessages, userMsg];
    const isFirstUserMsg = !currentMessages.some(m => m.role === 'user');
    const derivedTitle = isFirstUserMsg
      ? punctuated.slice(0, 36) + (punctuated.length > 36 ? '...' : '')
      : activeSessionRef.current.title;

    updateActiveSession(sess => ({
      ...sess,
      title: derivedTitle,
      updatedAt: now,
      messages: [...sess.messages, userMsg]
    }));

    setOrbState('thinking');
    setLifecyclePhase('PHASE_05_RESPONDING');

    const { reply, source } = await generateBuddyFriendReply({
      userText: punctuated,
      history: updatedHistory,
      personality: personalityRef.current,
      mode: modeRef.current,
      apiKey: apiKey || loadApiKey(),
      model: selectedModel || loadModel()
    });

    const buddyMsg: BuddyMessage = {
      id: `msg-buddy-${Date.now()}`,
      role: 'buddy',
      timestamp: Date.now(),
      text: reply,
      responseSource: source
    };

    updateActiveSession(sess => ({
      ...sess,
      updatedAt: Date.now(),
      messages: [...sess.messages, buddyMsg]
    }));

    speakBuddyMessage(reply, Boolean(params.autoResumeAfter));
  };

  const startListeningTurn = async () => {
    // Clean Barge-In: immediately cancel AI voice playback
    stopSpeech();
    setIsBuddySpeaking(false);
    setStatusNotice(null);
    setWhisperProgress(null);

    if (speechEngineRef.current === 'gemini-cloud' && !(apiKey || loadApiKey())) {
      setStatusNotice('Connect a Gemini API key or switch to Whisper AI / Pure Live in Audio Settings.');
      setIsApiModalOpen(true);
      return;
    }

    cleanupMediaCapture();
    finalBufferRef.current = '';
    interimBufferRef.current = '';
    uncertainWordsRef.current = new Set();
    confidenceSumRef.current = { total: 0, count: 0 };
    listenStartedAtRef.current = Date.now();
    isListeningRef.current = true;
    setIsListening(true);
    setLiveInterimText('');
    setOrbState('listening');
    setLifecyclePhase('PHASE_02_LISTENING');

    if (speechEngineRef.current === 'live-solo') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        isListeningRef.current = false;
        setIsListening(false);
        setOrbState('error');
        setStatusNotice('Live Browser Speech is unavailable in this browser. Open Audio Settings to switch to Whisper AI.');
        return;
      }

      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 3;
        rec.lang = recognitionLangRef.current || 'en-IN';

        const commitLiveTurnNow = () => {
          if (!isListeningRef.current) return;
          isListeningRef.current = false;
          setIsListening(false);
          if (vadPauseTimerRef.current) {
            clearTimeout(vadPauseTimerRef.current);
            vadPauseTimerRef.current = null;
          }
          if (recognitionRef.current) {
            try {
              recognitionRef.current.onresult = null;
              recognitionRef.current.onerror = null;
              recognitionRef.current.onend = null;
              recognitionRef.current.stop();
            } catch {}
            recognitionRef.current = null;
          }

          const combined = [finalBufferRef.current.trim(), interimBufferRef.current.trim()]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          setLiveInterimText('');
          const durationSec = Math.max(1, Math.round((Date.now() - listenStartedAtRef.current) / 1000));
          const avgConf =
            confidenceSumRef.current.count > 0
              ? Number((confidenceSumRef.current.total / confidenceSumRef.current.count).toFixed(2))
              : undefined;

          if (!combined) {
            setOrbState('idle');
            setLifecyclePhase('PHASE_01_IDLE');
            return;
          }

          setOrbState('transcribing');
          setLifecyclePhase('PHASE_03_TRANSCRIBING');
          processFinalizedUserTurn({
            rawTranscript: combined,
            engine: 'live-solo',
            uncertainWords: Array.from(uncertainWordsRef.current),
            sttConfidence: avgConf,
            durationSec,
            autoResumeAfter: continuousModeRef.current
          });
        };

        rec.onresult = (event: any) => {
          let fin = '';
          let inter = '';

          for (let i = 0; i < event.results.length; i++) {
            const item = event.results[i];
            if (item && item.length > 0) {
              let bestAlt = item[0];
              for (let a = 1; a < item.length; a++) {
                if (
                  item[a]?.transcript &&
                  typeof item[a].confidence === 'number' &&
                  item[a].confidence > (bestAlt?.confidence || 0)
                ) {
                  bestAlt = item[a];
                }
              }
              const txt = bestAlt?.transcript || '';
              if (item.isFinal) {
                fin += txt + ' ';
                if (typeof bestAlt?.confidence === 'number' && bestAlt.confidence > 0) {
                  confidenceSumRef.current.total += bestAlt.confidence;
                  confidenceSumRef.current.count += 1;
                  if (bestAlt.confidence < 0.72) {
                    txt
                      .split(/\s+/)
                      .map((w: string) => w.replace(/[^a-zA-Z0-9']/g, ''))
                      .filter((w: string) => w.length >= 3)
                      .forEach((w: string) => uncertainWordsRef.current.add(w));
                  }
                }
              } else {
                inter += txt;
              }
            }
          }

          finalBufferRef.current = fin;
          interimBufferRef.current = inter;
          const preview = [fin.trim(), inter.trim()].filter(Boolean).join(' ');
          setLiveInterimText(preview);

          audioLevelRef.current = 58;
          setTimeout(() => {
            if (isListeningRef.current) audioLevelRef.current = 18;
          }, 220);

          if (vadPauseTimerRef.current) clearTimeout(vadPauseTimerRef.current);
          if (continuousModeRef.current && preview.length > 0) {
            vadPauseTimerRef.current = setTimeout(() => {
              commitLiveTurnNow();
            }, 2200);
          }
        };

        rec.onerror = (e: any) => {
          if (e.error === 'no-speech') return;
          if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
            isListeningRef.current = false;
            setIsListening(false);
            setOrbState('error');
            setStatusNotice('Microphone access was blocked. Allow microphone permission in your browser bar.');
          } else if (e.error === 'network') {
            isListeningRef.current = false;
            setIsListening(false);
            setOrbState('error');
            setStatusNotice('Browser speech service could not connect. Switch to Whisper AI in Audio Settings for free offline speech.');
          } else if (e.error !== 'aborted') {
            setStatusNotice(`Speech recognition notice (${e.error}). Try Whisper AI in Audio Settings.`);
          }
        };

        rec.onend = () => {
          if (!isListeningRef.current) return;
          const hasWords = (finalBufferRef.current + interimBufferRef.current).trim().length > 0;
          if (hasWords && continuousModeRef.current) {
            commitLiveTurnNow();
          } else if (isListeningRef.current) {
            try {
              rec.start();
            } catch {
              isListeningRef.current = false;
              setIsListening(false);
              setOrbState('idle');
            }
          }
        };

        rec.start();
        recognitionRef.current = rec;
      } catch (err: any) {
        isListeningRef.current = false;
        setIsListening(false);
        setOrbState('error');
        setStatusNotice(err?.message || 'Unable to initialize speech recognition.');
      }
      return;
    }

    // Whisper Local / Gemini Cloud -> Single Clean Raw Audio Capture
    try {
      const constraints: MediaTrackConstraints = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true
      };
      if (selectedMicDeviceIdRef.current) {
        constraints.deviceId = { exact: selectedMicDeviceIdRef.current };
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true }
        });
      }

      if (!isListeningRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (!isListeningRef.current) return;
          analyser.getByteFrequencyData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i];
          audioLevelRef.current = Math.min(100, Math.round((sum / buf.length / 128) * 100));
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }

      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob =
          audioChunksRef.current.length > 0
            ? new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
            : null;
        cleanupMediaCapture();

        if (!blob || blob.size === 0) {
          setOrbState('idle');
          setLifecyclePhase('PHASE_01_IDLE');
          return;
        }

        const durationSec = Math.max(1, Math.round((Date.now() - listenStartedAtRef.current) / 1000));
        setOrbState('transcribing');
        setLifecyclePhase('PHASE_03_TRANSCRIBING');

        try {
          let transcribed = '';
          if (speechEngineRef.current === 'whisper-local') {
            const res = await transcribeBlobWithWhisper(blob, {
              model: whisperModelRef.current,
              onProgress: (p) => setWhisperProgress(p)
            });
            transcribed = res.text;
          } else {
            transcribed = await transcribeAudioBlobWithGemini(
              apiKey || loadApiKey(),
              selectedModel || loadModel(),
              blob,
              recognitionLangRef.current
            );
          }

          setWhisperProgress(null);

          if (!transcribed || !transcribed.trim()) {
            setOrbState('idle');
            setLifecyclePhase('PHASE_01_IDLE');
            setStatusNotice('No clear speech detected in that recording. Open Audio Settings to test your microphone.');
            return;
          }

          await processFinalizedUserTurn({
            rawTranscript: transcribed,
            engine: speechEngineRef.current,
            durationSec,
            autoResumeAfter: false
          });
        } catch (err: any) {
          setWhisperProgress(null);
          setOrbState('error');
          setStatusNotice(err?.message || 'Transcription failed.');
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch (err: any) {
      isListeningRef.current = false;
      setIsListening(false);
      setOrbState('error');
      setStatusNotice(err?.message || 'Microphone access denied.');
    }
  };

  const stopListeningAndSend = () => {
    if (!isListeningRef.current) return;

    if (speechEngineRef.current === 'live-solo') {
      isListeningRef.current = false;
      setIsListening(false);
      if (vadPauseTimerRef.current) {
        clearTimeout(vadPauseTimerRef.current);
        vadPauseTimerRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }

      const combined = [finalBufferRef.current.trim(), interimBufferRef.current.trim()]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      setLiveInterimText('');
      const durationSec = Math.max(1, Math.round((Date.now() - listenStartedAtRef.current) / 1000));
      const avgConf =
        confidenceSumRef.current.count > 0
          ? Number((confidenceSumRef.current.total / confidenceSumRef.current.count).toFixed(2))
          : undefined;

      if (!combined) {
        setOrbState('idle');
        setLifecyclePhase('PHASE_01_IDLE');
        return;
      }

      setOrbState('transcribing');
      setLifecyclePhase('PHASE_03_TRANSCRIBING');
      processFinalizedUserTurn({
        rawTranscript: combined,
        engine: 'live-solo',
        uncertainWords: Array.from(uncertainWordsRef.current),
        sttConfidence: avgConf,
        durationSec,
        autoResumeAfter: continuousModeRef.current
      });
      return;
    }

    isListeningRef.current = false;
    setIsListening(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        cleanupMediaCapture();
        setOrbState('idle');
      }
    } else {
      cleanupMediaCapture();
      setOrbState('idle');
    }
  };

  const handleOrbOrMicClick = () => {
    if (isBuddySpeaking) {
      startListeningTurn();
      return;
    }
    if (isListening) {
      stopListeningAndSend();
    } else {
      startListeningTurn();
    }
  };

  const handleSendTyped = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = typedInput.trim();
    if (!trimmed) return;
    stopAllAudioAndCapture();
    setTypedInput('');
    processFinalizedUserTurn({
      rawTranscript: trimmed,
      engine: 'typed',
      autoResumeAfter: false
    });
  };

  const handleNewChat = (customPrompt?: string) => {
    stopAllAudioAndCapture();
    setOrbState('idle');
    setLifecyclePhase('PHASE_01_IDLE');
    setIsHistoryOpen(false);
    const fresh = createFreshBuddySession(personality, mode, customPrompt);
    setSessions(prev => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    if (voiceOutputEnabled && fresh.messages[0]) {
      speakBuddyMessage(fresh.messages[0].text, false);
    }
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      handleNewChat();
      return;
    }
    const remaining = sessions.filter(s => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id && remaining[0]) {
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleSaveEditedTranscript = (msgId: string) => {
    const clean = editingDraft.trim();
    if (!clean) return;
    const formatted = processBuddyTranscript(clean);
    updateActiveSession(sess => ({
      ...sess,
      messages: sess.messages.map(m =>
        m.id === msgId ? { ...m, text: formatted, isEdited: true, uncertainWords: undefined } : m
      )
    }));
    setEditingMsgId(null);
    setEditingDraft('');
  };

  const handleSelectEngine = (eng: BuddySpeechEngine) => {
    setSpeechEngine(eng);
    setStatusNotice(null);
    try { localStorage.setItem('ielts_speaking_stt_engine', eng); } catch {}
  };

  const handleSelectAccent = (lang: string) => {
    setRecognitionLang(lang);
    try { localStorage.setItem('ielts_speaking_accent', lang); } catch {}
  };

  const latestBuddyMessage = [...(activeSession?.messages || [])]
    .reverse()
    .find(m => m.role === 'buddy');

  const hasUserMessages = (activeSession?.messages || []).some(m => m.role === 'user');
  const currentPersonalityCfg = getPersonalityConfig(personality);
  const currentModeCfg = BUDDY_MODES.find(m => m.id === mode) || BUDDY_MODES[0];

  const engineLabel =
    speechEngine === 'whisper-local'
      ? 'Whisper AI'
      : speechEngine === 'gemini-cloud'
      ? 'Gemini Audio'
      : `Live Voice · ${recognitionLang}`;

  const orbStatusSubtitle =
    orbState === 'listening'
      ? speechEngine === 'live-solo'
        ? 'Listening — pause naturally to send'
        : 'Listening — tap orb when finished'
      : orbState === 'transcribing'
      ? 'Converting voice to text...'
      : orbState === 'understanding' || orbState === 'thinking'
      ? 'Thinking of a reply...'
      : orbState === 'speaking'
      ? 'Speaking — tap orb to interrupt'
      : orbState === 'sleeping'
      ? 'Session paused'
      : 'Tap the orb to start talking';

  return (
    <div
      ref={pageContainerRef}
      className="relative w-full min-h-screen overflow-hidden bg-black text-slate-100 font-sans flex flex-col"
    >
      {/* Unified Full-Viewport Pure-Black Sanctuary (Highlights the Crystal Orb Exactly Like Reference) */}
      <div className="relative flex-1 flex flex-col min-h-screen w-full">
        {/* Ultra-subtle radial depth glow behind orb */}
        <div
          className="pointer-events-none absolute top-1/2 left-[29%] -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full blur-[150px] opacity-20 transition-colors duration-1000"
          style={{
            background:
              orbState === 'speaking'
                ? 'radial-gradient(circle, #38bdf8, #d946ef 55%, transparent 75%)'
                : orbState === 'listening'
                ? 'radial-gradient(circle, #0ea5e9, #6366f1 55%, transparent 75%)'
                : 'radial-gradient(circle, #2563eb, #c026d3 60%, transparent 78%)'
          }}
        />

        {/* ------------------------------------------------------------- */}
        {/* 1. MINIMAL STUDIO TOP HEADER (Single Clean Row)               */}
        {/* ------------------------------------------------------------- */}
        <header className="relative z-10 h-16 px-4 sm:px-6 border-b border-white/[0.07] flex items-center justify-between gap-3 bg-white/[0.015] backdrop-blur-md">
          {/* Left: Back to Platform + History Drawer Trigger + Lingo Buddy Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {onBack && (
              <button
                type="button"
                onClick={handleBackToApp}
                className="px-2.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.11] border border-white/[0.08] text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                title="Back to IELTS Platform"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Conversations & Topics"
            >
              <History className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                  Lingo Buddy
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-200 border border-indigo-400/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>English Companion</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block truncate">
                Speak freely. Make mistakes. Learn naturally.
              </p>
            </div>
          </div>

          {/* Center: Clean Mode & Personality Pill Selectors */}
          <div className="hidden md:flex items-center gap-2">
            <div className="relative flex items-center">
              <select
                value={mode}
                onChange={(e) => {
                  const next = e.target.value as BuddyMode;
                  setMode(next);
                  updateActiveSession(s => ({ ...s, mode: next }));
                }}
                aria-label="Conversation Mode"
                className="appearance-none bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] rounded-full pl-3.5 pr-8 py-1.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-400/60 transition-colors cursor-pointer"
              >
                {BUDDY_MODES.map(m => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none -ml-6" />
            </div>

            <div className="relative flex items-center">
              <select
                value={personality}
                onChange={(e) => {
                  const next = e.target.value as BuddyPersonality;
                  setPersonality(next);
                  updateActiveSession(s => ({ ...s, personality: next }));
                }}
                aria-label="Companion Personality"
                className="appearance-none bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] rounded-full pl-3.5 pr-8 py-1.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-400/60 transition-colors cursor-pointer"
              >
                {BUDDY_PERSONALITIES.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.label} Tone
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none -ml-6" />
            </div>
          </div>

          {/* Right: New Chat + Clean Audio Settings Popover Trigger */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNewChat()}
              className="px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Start a new conversation"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAudioSettingsOpen(prev => !prev)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isAudioSettingsOpen
                  ? 'bg-indigo-500/25 border-indigo-400/50 text-white'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-slate-200'
              }`}
              title="Voice Engine, Accent & Microphone Settings"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">{engineLabel}</span>
            </button>

            {/* Full Screen Toggle Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className={`p-2 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isFullscreen
                  ? 'bg-indigo-500/25 border-indigo-400/50 text-white'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-slate-300 hover:text-white'
              }`}
              title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Enter Full Screen'}
              aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-indigo-300" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {/* Clean Dropdown Audio & Voice Settings Sheet (Progressive Disclosure) */}
        {isAudioSettingsOpen && (
          <div className="relative z-20 border-b border-white/[0.08] bg-[#101626]/95 backdrop-blur-xl px-5 py-4 animate-in fade-in duration-150">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Engine Choice */}
              <div className="space-y-1.5 md:col-span-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Speech Engine
                </span>
                <div className="grid grid-cols-3 gap-1.5 bg-black/30 p-1 rounded-xl border border-white/[0.08]">
                  <button
                    type="button"
                    disabled={isListening}
                    onClick={() => handleSelectEngine('live-solo')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1 ${
                      speechEngine === 'live-solo'
                        ? 'bg-indigo-500 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Radio className="w-3 h-3" />
                    <span>Live Voice</span>
                  </button>
                  <button
                    type="button"
                    disabled={isListening}
                    onClick={() => handleSelectEngine('whisper-local')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1 ${
                      speechEngine === 'whisper-local'
                        ? 'bg-indigo-500 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Cpu className="w-3 h-3" />
                    <span>Whisper AI</span>
                  </button>
                  <button
                    type="button"
                    disabled={isListening}
                    onClick={() => handleSelectEngine('gemini-cloud')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1 ${
                      speechEngine === 'gemini-cloud'
                        ? 'bg-indigo-500 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Gemini</span>
                  </button>
                </div>
              </div>

              {/* Accent / Mobile Mode */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Accent Profile
                </span>
                <select
                  value={recognitionLang}
                  onChange={(e) => handleSelectAccent(e.target.value)}
                  disabled={isListening}
                  className="w-full bg-black/30 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none cursor-pointer"
                >
                  <option value="en-IN" className="bg-slate-900">South Asian / Sri Lankan (en-IN)</option>
                  <option value="en-GB" className="bg-slate-900">British English (en-GB)</option>
                  <option value="en-US" className="bg-slate-900">American English (en-US)</option>
                  <option value="en-AU" className="bg-slate-900">Australian English (en-AU)</option>
                </select>
              </div>

              {/* Quick Toggles & Modals */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setContinuousMode(prev => !prev)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    continuousMode
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                      : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Hands-Free {continuousMode ? 'On' : 'Off'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAudioSettingsOpen(false);
                    setIsMicDiagnosticOpen(true);
                  }}
                  className="py-2 px-3 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/[0.1] cursor-pointer"
                >
                  Test Mic
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAudioSettingsOpen(false);
                    setIsApiModalOpen(true);
                  }}
                  className="py-2 px-3 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-amber-200 text-xs font-semibold border border-white/[0.1] cursor-pointer"
                >
                  {apiKey ? 'API Ready' : 'API Key'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. MAIN TWO-ZONE SANCTUARY (Left Voice Orb | Right Transcript) */}
        {/* ------------------------------------------------------------- */}
        <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* ZONE A: Centerpiece Voice Sanctuary (7 Cols) */}
          <section className="lg:col-span-7 flex flex-col items-center justify-between px-6 py-8 sm:py-10">
            {/* Subtle Active Companion Pill */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-slate-300 font-medium">
                {currentModeCfg.label} · {currentPersonalityCfg.label}
              </span>
            </div>

            {/* Living Crystal-Galaxy Energy Orb + Poetic Live Caption */}
            <div className="flex flex-col items-center justify-center w-full max-w-lg my-4 text-center">
              <BuddyEnergyOrb
                state={orbState}
                audioLevelRef={audioLevelRef}
                onClick={handleOrbOrMicClick}
                size={isFullscreen ? 380 : 320}
              />

              {/* Clean Live Caption Area */}
              <div className="mt-5 min-h-[84px] w-full flex flex-col items-center justify-center space-y-2">
                {whisperProgress && (whisperProgress.status === 'loading' || whisperProgress.status === 'inferencing') ? (
                  <div className="w-full max-w-sm px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-xs text-indigo-200 space-y-2">
                    <div className="flex items-center justify-between font-medium">
                      <span>{whisperProgress.message}</span>
                      {typeof whisperProgress.percent === 'number' && (
                        <span className="font-mono">{whisperProgress.percent}%</span>
                      )}
                    </div>
                    {typeof whisperProgress.percent === 'number' && (
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-400 transition-all duration-200 rounded-full"
                          style={{ width: `${whisperProgress.percent}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : isListening && liveInterimText ? (
                  <p className="text-lg sm:text-xl font-medium text-white leading-relaxed tracking-tight animate-in fade-in duration-150">
                    “{liveInterimText}
                    <span className="inline-block w-0.5 h-5 bg-sky-400 ml-1 align-middle animate-pulse" />”
                  </p>
                ) : isBuddySpeaking && latestBuddyMessage ? (
                  <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-md">
                    “{latestBuddyMessage.text}”
                  </p>
                ) : (
                  <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                    {hasUserMessages ? 'Ready when you are.' : 'What would you like to talk about today?'}
                  </h2>
                )}

                <p className="text-xs font-medium text-slate-400 tracking-wide">
                  {orbStatusSubtitle}
                </p>

                {showSinhala && !isListening && !hasUserMessages && (
                  <p className="text-xs text-indigo-300/80 font-sinhala">
                    මිතුරෙකු සමඟ මෙන් නිදහසේ කතා කරන්න — වැරදීම් ගැන බිය නොවන්න.
                  </p>
                )}

                {statusNotice && (
                  <div className="mt-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-400/25 text-xs text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>{statusNotice}</span>
                    <button
                      type="button"
                      onClick={() => setStatusNotice(null)}
                      className="text-amber-300 hover:text-white cursor-pointer ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sleek Floating Glassmorphic Bottom Dock */}
            <div className="w-full max-w-md space-y-3">
              <div className="mx-auto w-fit flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/[0.09] shadow-xl">
                {/* Mute Voice Output */}
                <button
                  type="button"
                  onClick={() => {
                    if (voiceOutputEnabled) {
                      stopSpeech();
                      setIsBuddySpeaking(false);
                      if (!isListening) setOrbState('idle');
                    }
                    setVoiceOutputEnabled(prev => !prev);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    voiceOutputEnabled
                      ? 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                  }`}
                  title={voiceOutputEnabled ? 'Mute voice reply' : 'Unmute voice reply'}
                >
                  {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Primary Hero Mic / Stop / Interrupt Button */}
                <button
                  type="button"
                  onClick={handleOrbOrMicClick}
                  className={`h-13 px-6 rounded-full text-sm font-semibold transition-all flex items-center gap-2.5 cursor-pointer shadow-lg ${
                    isListening
                      ? 'bg-rose-500 hover:bg-rose-400 text-white ring-4 ring-rose-500/25'
                      : isBuddySpeaking
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      : 'bg-white hover:bg-slate-100 text-slate-950'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>{speechEngine === 'live-solo' ? 'Done' : 'Stop & Send'}</span>
                    </>
                  ) : isBuddySpeaking ? (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Interrupt</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Speak</span>
                    </>
                  )}
                </button>

                {/* Toggle Minimal Keyboard Input */}
                <button
                  type="button"
                  onClick={() => setShowKeyboardInput(prev => !prev)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    showKeyboardInput
                      ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200'
                  }`}
                  title="Type instead of speaking"
                >
                  <Keyboard className="w-4 h-4" />
                </button>

                {/* Pause / End Active Audio */}
                {(isListening || isBuddySpeaking) && (
                  <button
                    type="button"
                    onClick={() => {
                      stopAllAudioAndCapture();
                      setOrbState('sleeping');
                      setLifecyclePhase('PHASE_01_IDLE');
                    }}
                    className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 flex items-center justify-center transition-all cursor-pointer"
                    title="Pause voice session"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Smoothly revealed minimal typing bar */}
              {showKeyboardInput && (
                <form
                  onSubmit={handleSendTyped}
                  className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] rounded-2xl p-1.5 pl-4 animate-in fade-in duration-150"
                >
                  <input
                    ref={typedInputRef}
                    type="text"
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    placeholder="Say anything to Lingo Buddy..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!typedInput.trim()}
                    className="p-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-35 text-white transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* ZONE B: Editorial Live Transcript Rail (5 Cols) */}
          <aside className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-white/[0.07] bg-white/[0.02] flex flex-col max-h-[60vh] lg:max-h-[calc(100vh-4rem)]">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Conversation
              </span>
              <span className="text-[11px] text-slate-500">
                {activeSession?.messages.length || 0} messages
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {activeSession?.messages.map(msg => {
                const isUser = msg.role === 'user';
                const isEditing = editingMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`group flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    <span className="text-[11px] font-medium text-slate-500 px-1">
                      {isUser ? 'You' : 'Lingo Buddy'}
                      {isUser && msg.isEdited && (
                        <span className="ml-1.5 text-emerald-400">· Edited</span>
                      )}
                    </span>

                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed space-y-2 transition-colors ${
                        isUser
                          ? 'bg-indigo-500/20 border border-indigo-400/25 text-white rounded-tr-sm'
                          : 'bg-white/[0.05] border border-white/[0.07] text-slate-200 rounded-tl-sm'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2.5">
                          <textarea
                            value={editingDraft}
                            onChange={(e) => setEditingDraft(e.target.value)}
                            rows={2}
                            className="w-full rounded-xl p-2.5 text-sm text-white bg-black/40 border border-indigo-400/40 focus:outline-none"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingMsgId(null)}
                              className="px-2.5 py-1 rounded-lg text-xs text-slate-300 hover:text-white cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditedTranscript(msg.id)}
                              className="px-3 py-1 rounded-lg bg-white text-slate-950 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>{msg.text}</p>
                      )}

                      {/* Low-confidence STT guard (subtle, never alarming) */}
                      {isUser && msg.uncertainWords && msg.uncertainWords.length > 0 && !isEditing && (
                        <div className="pt-2 border-t border-white/10 text-[11px] text-amber-200/90 flex items-center justify-between gap-2">
                          <span>
                            Uncertain capture: <span className="underline decoration-dotted">{msg.uncertainWords.slice(0, 3).join(', ')}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMsgId(msg.id);
                              setEditingDraft(msg.text);
                            }}
                            className="font-semibold text-white hover:underline cursor-pointer shrink-0"
                          >
                            Fix
                          </button>
                        </div>
                      )}

                      {isUser && msg.isEdited && msg.originalRawTranscript && showRawForMsgId === msg.id && (
                        <p className="text-[11px] text-slate-400 pt-1.5 border-t border-white/10 font-mono">
                          Raw capture: “{msg.originalRawTranscript}”
                        </p>
                      )}
                    </div>

                    {/* Subtle Hover Actions (Zero Clutter When Idle) */}
                    {!isEditing && (
                      <div className="flex items-center gap-3 px-1 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity text-[11px]">
                        {isUser ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMsgId(msg.id);
                                setEditingDraft(msg.text);
                              }}
                              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            {msg.isEdited && msg.originalRawTranscript && (
                              <button
                                type="button"
                                onClick={() => setShowRawForMsgId(prev => (prev === msg.id ? null : msg.id))}
                                className="text-slate-500 hover:text-slate-300 cursor-pointer"
                              >
                                {showRawForMsgId === msg.id ? 'Hide original' : 'View original'}
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => speakBuddyMessage(msg.text, false)}
                            className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
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

              {/* Inviting Topic Starter Cards on a Fresh Conversation */}
              {!hasUserMessages && (
                <div className="pt-4 space-y-2.5">
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Or pick a conversation starter
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {BUDDY_TOPIC_STARTERS.map(topic => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => handleNewChat(topic.prompt)}
                        className="group text-left p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-indigo-400/35 transition-all cursor-pointer flex items-center justify-between gap-2"
                      >
                        <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                          {topic.label}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </aside>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. SLIDE-OVER CONVERSATION HISTORY DRAWER                     */}
        {/* ------------------------------------------------------------- */}
        {isHistoryOpen && (
          <div
            className="absolute inset-0 z-30 bg-black/55 backdrop-blur-xs flex animate-in fade-in duration-150"
            onClick={() => setIsHistoryOpen(false)}
          >
            <div
              className="w-80 max-w-[85%] h-full bg-[#0F1524] border-r border-white/[0.09] p-5 flex flex-col justify-between shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Conversations</h3>
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleNewChat()}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Conversation</span>
                </button>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {sessions.map(sess => {
                    const isActive = sess.id === activeSession?.id;
                    return (
                      <div
                        key={sess.id}
                        onClick={() => {
                          stopAllAudioAndCapture();
                          setActiveSessionId(sess.id);
                          setPersonality(sess.personality);
                          setMode(sess.mode);
                          setOrbState('idle');
                          setIsHistoryOpen(false);
                        }}
                        className={`group flex items-center justify-between gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-500/20 border-indigo-400/40 text-white'
                            : 'bg-white/[0.02] border-transparent hover:bg-white/[0.06] text-slate-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{sess.title}</p>
                          <span className="text-[10px] text-slate-500">
                            {sess.messages.length} messages
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(sess.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 cursor-pointer transition-opacity"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Mode & Personality controls inside drawer */}
              <div className="pt-4 border-t border-white/[0.08] space-y-2.5 md:hidden">
                <select
                  value={mode}
                  onChange={(e) => {
                    const next = e.target.value as BuddyMode;
                    setMode(next);
                    updateActiveSession(s => ({ ...s, mode: next }));
                  }}
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white"
                >
                  {BUDDY_MODES.map(m => (
                    <option key={m.id} value={m.id} className="bg-slate-900">{m.label}</option>
                  ))}
                </select>
                <select
                  value={personality}
                  onChange={(e) => {
                    const next = e.target.value as BuddyPersonality;
                    setPersonality(next);
                    updateActiveSession(s => ({ ...s, personality: next }));
                  }}
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white"
                >
                  {BUDDY_PERSONALITIES.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900">{p.label} Tone</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Physical Microphone & Accuracy Self-Test Modal */}
      <MicDiagnosticModal
        isOpen={isMicDiagnosticOpen}
        onClose={() => setIsMicDiagnosticOpen(false)}
        selectedDeviceId={selectedMicDeviceId}
        onSelectDeviceId={(id) => {
          setSelectedMicDeviceId(id);
          try { localStorage.setItem('ielts_speaking_mic_device_id', id); } catch {}
        }}
        speechEngine={speechEngine}
        onSelectSpeechEngine={handleSelectEngine}
        whisperModel={whisperModel}
        onSelectWhisperModel={(m) => {
          setWhisperModel(m);
          try { localStorage.setItem('ielts_speaking_whisper_model', m); } catch {}
        }}
        recognitionLang={recognitionLang}
        onAccentChange={handleSelectAccent}
        apiKey={apiKey}
        selectedModel={selectedModel}
        showSinhala={showSinhala}
      />

      {/* Gemini API Settings Modal */}
      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => {
          setIsApiModalOpen(false);
          setApiKey(loadApiKey());
          setSelectedModel(loadModel());
        }}
        onKeyUpdated={(newKey, newModel) => {
          setApiKey(newKey);
          setSelectedModel(newModel);
          setIsApiModalOpen(false);
        }}
      />
    </div>
  );
};
