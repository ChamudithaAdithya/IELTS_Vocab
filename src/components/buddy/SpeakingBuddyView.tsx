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
  Radio,
  RefreshCw,
  ArrowUpRight,
  ArrowLeft,
  Maximize2,
  Minimize2,
  FlaskConical,
  Gauge
} from 'lucide-react';
import type {
  BuddyLearningAnalytics,
  BuddyLifecyclePhase,
  BuddyMemoryState,
  BuddyMessage,
  BuddyMode,
  BuddyOrbState,
  BuddyPersonality,
  BuddySession,
  BuddySpeechEngine,
  BuddyTurnPerfRecord,
  BuddyTurnPerfTimestamps,
  BuddyTurnTrace,
  CorrectionIntensity,
  ExplanationLangMode,
  GrammarCategoryCode,
  PersonalGrammarNote,
  PronunciationSpotlight,
  SavedBuddyVocabItem,
  TryAgainAttemptResult
} from '../../types/speakingBuddy';
import {
  BUDDY_MODES,
  BUDDY_PERSONALITIES,
  BUDDY_TOPIC_STARTERS,
  createFreshBuddySession,
  getPersonalityConfig,
  getTargetedPracticePrompt,
  loadBuddySessions,
  pickTopicStarterPrompt,
  processBuddyTranscript,
  saveBuddySessions
} from '../../utils/speakingBuddyEngine';
import {
  analyzeBuddyGrammar,
  validateTranscriptCoherence
} from '../../utils/buddyGrammarEngine';
import {
  buildFinalizedTurnPacket,
  orchestrateBuddyTurn
} from '../../utils/buddyOrchestrator';
import {
  addManualBuddyMemory,
  clearAllBuddyMemories,
  deleteBuddyMemoryItem,
  generateMemoryAwareGreeting,
  loadBuddyAnalytics,
  loadBuddyMemory,
  loadExplanationLangMode,
  loadGrammarLibrary,
  loadSavedVocab,
  recordTryAgainOutcome,
  recordTurnAnalytics,
  removeGrammarLibraryItem,
  removeVocabItemFromCollection,
  resetBuddyAnalytics,
  saveExplanationLangMode,
  saveMistakeToGrammarLibrary,
  saveVocabItemToCollection,
  setMemoryPersonalizationEnabled
} from '../../utils/buddyLearningStore';
import {
  transcribeAudioBlobWithGemini,
  warmUpGeminiVoiceConnection
} from '../../utils/speakingEngine';
import {
  createLive16kPcmCapture,
  type Live16kPcmCaptureHandle
} from '../../utils/audioConditioner';
import {
  createRealtimeTtsQueue,
  FREE_NEURAL_VOICES,
  getEnglishVoices,
  getKokoroStatus,
  KOKORO_NATURAL_VOICES,
  loadBuddyVoiceConfig,
  playFreeNeuralSpeech,
  playKokoroSpeech,
  playSpeech,
  saveBuddyVoiceConfig,
  stopSpeech,
  subscribeKokoroStatus,
  unlockAudioOutput,
  warmUpKokoroTts,
  warmUpNeuralTts,
  type AppVoiceOption,
  type BuddyVoiceConfig,
  type FreeNeuralVoiceName,
  type KokoroEngineStatus,
  type KokoroVoiceId,
  type RealtimeTtsQueue
} from '../../utils/speech';
import { loadApiKey, loadModel } from '../../utils/tutorEngine';
import { BuddyEnergyOrb } from './BuddyEnergyOrb';
import { BuddyFeedbackCard } from './BuddyFeedbackCard';
import { BuddyLearningPanel } from './BuddyLearningPanel';
import { BuddySystemModal } from './BuddySystemModal';
import { getOrbStateDescriptor } from '../../utils/buddyQaSuite';
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
  const [intensity, setIntensity] = useState<CorrectionIntensity>(
    activeSession?.intensity || 'gentle'
  );
  const [rightTab, setRightTab] = useState<'feedback' | 'hub'>('feedback');
  const [selectedFeedbackMsgId, setSelectedFeedbackMsgId] = useState<string | null>(null);
  const [continuousMode, setContinuousMode] = useState<boolean>(true);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState<boolean>(true);
  const [buddyVoiceConfig, setBuddyVoiceConfig] = useState<BuddyVoiceConfig>(() =>
    loadBuddyVoiceConfig()
  );
  const [kokoroStatus, setKokoroStatus] = useState<KokoroEngineStatus>(() => getKokoroStatus());
  const [osVoiceOptions, setOsVoiceOptions] = useState<AppVoiceOption[]>(() =>
    getEnglishVoices().filter(v => !v.isCloud)
  );
  const [voiceTestFeedback, setVoiceTestFeedback] = useState<{
    tone: 'loading' | 'ok' | 'error';
    message: string;
  } | null>(null);
  const buddyVoiceConfigRef = useRef<BuddyVoiceConfig>(buddyVoiceConfig);
  const updateBuddyVoiceConfig = (patch: Partial<BuddyVoiceConfig>) => {
    setVoiceTestFeedback(null);
    setBuddyVoiceConfig(prev => {
      const next = { ...prev, ...patch };
      buddyVoiceConfigRef.current = next;
      saveBuddyVoiceConfig(next);
      if (next.provider === 'kokoro') {
        warmUpKokoroTts();
      } else if (next.provider === 'neural-free') {
        warmUpNeuralTts(next.freeNeuralVoice);
      }
      return next;
    });
  };
  const intensityRef = useRef<CorrectionIntensity>(intensity);
  useEffect(() => { intensityRef.current = intensity; }, [intensity]);

  // Phase 3 — Decoupled Learning Intelligence States (Analytics, Memory, Saved Vocab, Knowledge Base)
  const [learningAnalytics, setLearningAnalytics] = useState<BuddyLearningAnalytics>(() =>
    loadBuddyAnalytics()
  );
  const [buddyMemory, setBuddyMemory] = useState<BuddyMemoryState>(() => loadBuddyMemory());
  const [savedVocab, setSavedVocab] = useState<SavedBuddyVocabItem[]>(() => loadSavedVocab());
  const [grammarLibrary, setGrammarLibrary] = useState<PersonalGrammarNote[]>(() =>
    loadGrammarLibrary()
  );
  // Audit Architecture — Live Per-Turn Execution Traces & 12-Point Performance Telemetry
  const [turnTraces, setTurnTraces] = useState<BuddyTurnTrace[]>([]);
  const [perfRecords, setPerfRecords] = useState<BuddyTurnPerfRecord[]>([]);
  const [systemModalInitialTab, setSystemModalInitialTab] = useState<'orb' | 'qa' | 'perf' | 'traces' | 'architecture'>('orb');
  // Phase 4 P2.3 — 4 Explanation Language Modes (English / Simple English / English+Sinhala / Sinhala Focused)
  const [explanationLangMode, setExplanationLangMode] = useState<ExplanationLangMode>(() =>
    loadExplanationLangMode(showSinhala)
  );
  const handleChangeExplanationLangMode = (nextMode: ExplanationLangMode) => {
    setExplanationLangMode(nextMode);
    saveExplanationLangMode(nextMode);
  };
  const buddyMemoryRef = useRef<BuddyMemoryState>(buddyMemory);
  const learningAnalyticsRef = useRef<BuddyLearningAnalytics>(learningAnalytics);
  useEffect(() => { buddyMemoryRef.current = buddyMemory; }, [buddyMemory]);
  useEffect(() => { learningAnalyticsRef.current = learningAnalytics; }, [learningAnalytics]);

  // Real-Time Live Web Speech Engine (v4 always defaults to instant browser Live Streaming STT
  // so the user sees live words as they speak and gets 0ms instant responses with NO "Transcribing" wait!)
  const [speechEngine, setSpeechEngine] = useState<BuddySpeechEngine>(() => {
    try {
      const hasSpeechRec =
        typeof window !== 'undefined' &&
        Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
      const hasKey = Boolean(loadApiKey());
      const v4Choice = localStorage.getItem('lingo_buddy_stt_engine_v4') as string | null;
      if (v4Choice === 'gemini-cloud' || v4Choice === 'live-solo') {
        if (v4Choice === 'gemini-cloud' && !hasKey) return 'live-solo';
        return v4Choice;
      }
      const preferred: BuddySpeechEngine = hasSpeechRec ? 'live-solo' : hasKey ? 'gemini-cloud' : 'live-solo';
      localStorage.setItem('lingo_buddy_stt_engine_v4', preferred);
      return preferred;
    } catch {
      return 'live-solo';
    }
  });
  const [recognitionLang, setRecognitionLang] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ielts_speaking_accent');
      // Avoid Chrome's en-IN Hindi-word bleed default unless explicitly chosen under v2
      const v2Accent = localStorage.getItem('lingo_buddy_accent_v2');
      if (v2Accent) return v2Accent;
      if (saved && saved !== 'en-IN') return saved;
      return 'en-GB';
    } catch {
      return 'en-GB';
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
  const [isSystemModalOpen, setIsSystemModalOpen] = useState<boolean>(false);
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
    stopAllAudioAndCapture(true);
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch { }
    }
    if (onBack) onBack();
  };

  // Live Lifecycle & Orb State
  const [orbState, setOrbState] = useState<BuddyOrbState>('idle');
  const [_lifecyclePhase, setLifecyclePhase] = useState<BuddyLifecyclePhase>('PHASE_01_IDLE');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isBuddySpeaking, setIsBuddySpeaking] = useState<boolean>(false);
  const [liveFinalText, setLiveFinalText] = useState<string>('');
  const [liveInterimText, setLiveInterimText] = useState<string>('');
  const [streamingBuddyMsgId, setStreamingBuddyMsgId] = useState<string | null>(null);
  const [typedInput, setTypedInput] = useState<string>('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Inline Transcript Editing (Phase 1 P0.2)
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<string>('');
  const [showRawForMsgId, setShowRawForMsgId] = useState<string | null>(null);

  // API Key State
  const [apiKey, setApiKey] = useState<string>(() => loadApiKey());
  const [selectedModel, setSelectedModel] = useState<string>(() => loadModel());

  // Mutable Refs for 60 FPS Orb, Warm Mic Pool & 12-Point Performance Telemetry
  const audioLevelRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const warmMicDeviceRef = useRef<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const livePcmCaptureRef = useRef<Live16kPcmCaptureHandle | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const vadPauseTimerRef = useRef<any>(null);
  const finalBufferRef = useRef<string>('');
  const interimBufferRef = useRef<string>('');
  const uncertainWordsRef = useRef<Set<string>>(new Set());
  const confidenceSumRef = useRef<{ total: number; count: number }>({ total: 0, count: 0 });
  const listenStartedAtRef = useRef<number>(0);
  const activeSpeechPerfRef = useRef<{
    speechStart: number | null;
    firstPartialSTT: number | null;
    lastPartialSTT: number | null;
    speechEnd: number | null;
  }>({ speechStart: null, firstPartialSTT: null, lastPartialSTT: null, speechEnd: null });
  const speculativeSttAbortRef = useRef<AbortController | null>(null);
  const speculativeSttPromiseRef = useRef<Promise<string> | null>(null);
  const rollingChunkTimerRef = useRef<any>(null);
  const inFlightTurnSigRef = useRef<string>('');
  const activeTtsQueueRef = useRef<RealtimeTtsQueue | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const continuousModeRef = useRef<boolean>(continuousMode);
  const voiceOutputEnabledRef = useRef<boolean>(voiceOutputEnabled);
  const speechEngineRef = useRef<BuddySpeechEngine>(speechEngine);
  const recognitionLangRef = useRef<string>(recognitionLang);
  const selectedMicDeviceIdRef = useRef<string>(selectedMicDeviceId);
  const personalityRef = useRef<BuddyPersonality>(personality);
  const modeRef = useRef<BuddyMode>(mode);
  const activeSessionRef = useRef<BuddySession>(activeSession);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const typedInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { continuousModeRef.current = continuousMode; }, [continuousMode]);
  useEffect(() => { voiceOutputEnabledRef.current = voiceOutputEnabled; }, [voiceOutputEnabled]);
  useEffect(() => { speechEngineRef.current = speechEngine; }, [speechEngine]);
  useEffect(() => { recognitionLangRef.current = recognitionLang; }, [recognitionLang]);
  useEffect(() => { selectedMicDeviceIdRef.current = selectedMicDeviceId; }, [selectedMicDeviceId]);
  useEffect(() => { personalityRef.current = personality; }, [personality]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { activeSessionRef.current = activeSession; }, [activeSession]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [activeSession?.messages.length, liveInterimText, streamingBuddyMsgId]);

  useEffect(() => {
    if (showKeyboardInput) {
      setTimeout(() => typedInputRef.current?.focus(), 60);
    }
  }, [showKeyboardInput]);

  useEffect(() => {
    const unsubKokoro = subscribeKokoroStatus(status => {
      setKokoroStatus(status);
    });
    const refreshOsVoices = () => {
      const list = getEnglishVoices().filter(v => !v.isCloud);
      if (list.length > 0) setOsVoiceOptions(list);
    };
    refreshOsVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener?.('voiceschanged', refreshOsVoices);
    }

    // Pre-warm active TTS engine AND Gemini HTTP/2 fast Flash model on mount!
    if (buddyVoiceConfigRef.current.provider === 'kokoro') {
      warmUpKokoroTts();
    } else if (buddyVoiceConfigRef.current.provider === 'neural-free') {
      warmUpNeuralTts(buddyVoiceConfigRef.current.freeNeuralVoice);
    }
    const existingKey = apiKey || loadApiKey();
    if (existingKey) {
      warmUpGeminiVoiceConnection(existingKey);
    }
    // Keep Edge Neural WSS sockets warm every 11s while Lingo Buddy view is open
    const keepWarmInterval = setInterval(() => {
      if (buddyVoiceConfigRef.current.provider === 'neural-free') {
        warmUpNeuralTts(buddyVoiceConfigRef.current.freeNeuralVoice);
      }
    }, 11000);
    return () => {
      unsubKokoro();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener?.('voiceschanged', refreshOsVoices);
      }
      clearInterval(keepWarmInterval);
      stopAllAudioAndCapture(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateActiveSession = (updater: (sess: BuddySession) => BuddySession) => {
    const targetId = activeSessionRef.current?.id;
    if (!targetId) return;
    setSessions(prev => prev.map(s => (s.id === targetId ? updater(s) : s)));
  };

  const cleanupMediaCapture = (releaseWarmMic: boolean = false) => {
    if (vadPauseTimerRef.current) {
      clearTimeout(vadPauseTimerRef.current);
      vadPauseTimerRef.current = null;
    }
    if (rollingChunkTimerRef.current) {
      clearInterval(rollingChunkTimerRef.current);
      rollingChunkTimerRef.current = null;
    }
    if (speculativeSttAbortRef.current) {
      try { speculativeSttAbortRef.current.abort(); } catch {}
      speculativeSttAbortRef.current = null;
    }
    speculativeSttPromiseRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (livePcmCaptureRef.current) {
      try { livePcmCaptureRef.current.stop(); } catch {}
      livePcmCaptureRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch { }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      } catch { }
      mediaRecorderRef.current = null;
    }
    if (releaseWarmMic && mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      } catch { }
      mediaStreamRef.current = null;
      warmMicDeviceRef.current = '';
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch { }
      audioCtxRef.current = null;
    }
    audioLevelRef.current = 0;
  };

  const stopAllAudioAndCapture = (releaseWarmMic: boolean = false) => {
    if (activeTtsQueueRef.current) {
      try { activeTtsQueueRef.current.cancel(); } catch {}
      activeTtsQueueRef.current = null;
    }
    stopSpeech();
    setIsBuddySpeaking(false);
    isListeningRef.current = false;
    setIsListening(false);
    setLiveFinalText('');
    setLiveInterimText('');
    cleanupMediaCapture(releaseWarmMic);
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
    const vCfg = buddyVoiceConfigRef.current;
    setIsBuddySpeaking(true);
    setOrbState('speaking');
    setLifecyclePhase('PHASE_06_SPEAKING');

    const handleSpeechStart = () => {
      setIsBuddySpeaking(true);
      setOrbState('speaking');
    };

    const handleSpeechEnd = () => {
      audioLevelRef.current = 0;
      setIsBuddySpeaking(false);
      setLifecyclePhase('PHASE_07_SAVED');
      if (autoResumeAfter && continuousModeRef.current) {
        setTimeout(() => {
          if (!isListeningRef.current) {
            void startListeningTurn();
          }
        }, 650);
      } else {
        setOrbState('idle');
      }
    };

    const handleSpeechError = () => {
      audioLevelRef.current = 0;
      setIsBuddySpeaking(false);
      setOrbState('idle');
    };

    if (vCfg.provider === 'kokoro') {
      void playKokoroSpeech(text, {
        voice: vCfg.kokoroVoice,
        fallbackEdgeVoice: vCfg.freeNeuralVoice,
        rate: vCfg.rate,
        onAudioLevel: (lvl) => {
          audioLevelRef.current = lvl;
        },
        onStart: handleSpeechStart,
        onEnd: handleSpeechEnd,
        onError: handleSpeechError
      });
      return;
    }

    if (vCfg.provider === 'neural-free') {
      void playFreeNeuralSpeech(text, {
        voice: vCfg.freeNeuralVoice,
        rate: vCfg.rate,
        onAudioLevel: (lvl) => {
          audioLevelRef.current = lvl;
        },
        onStart: handleSpeechStart,
        onEnd: handleSpeechEnd,
        onError: handleSpeechError
      });
      return;
    }

    playSpeech(text, {
      voiceURI: vCfg.osVoiceURI || undefined,
      rate: vCfg.rate || pCfg.speechRate,
      onStart: handleSpeechStart,
      onEnd: handleSpeechEnd,
      onError: handleSpeechError
    });
  };

  /** Strict per-voice diagnostic preview in Settings so user can hear & verify which exact voice works! */
  const handleTestSelectedVoice = () => {
    unlockAudioOutput();
    stopSpeech();
    const vCfg = buddyVoiceConfigRef.current;
    const sample = "Hi there! I'm Lingo Buddy. How has your day been going so far?";

    if (vCfg.provider === 'kokoro') {
      const vMeta = KOKORO_NATURAL_VOICES.find(v => v.id === vCfg.kokoroVoice);
      const label = vMeta?.label || vCfg.kokoroVoice;
      setVoiceTestFeedback({
        tone: 'loading',
        message:
          kokoroStatus.state === 'ready'
            ? `Synthesizing Kokoro · ${label}...`
            : `Loading Kokoro-82M & synthesizing ${label} (first load downloads ~86 MB)...`
      });
      void playKokoroSpeech(sample, {
        voice: vCfg.kokoroVoice,
        rate: vCfg.rate,
        strictNoFallback: true,
        onAudioLevel: (lvl) => {
          audioLevelRef.current = lvl;
        },
        onStart: () => {
          setIsBuddySpeaking(true);
          setOrbState('speaking');
          setVoiceTestFeedback({
            tone: 'ok',
            message: `✓ Working! Playing Kokoro AI · ${label}`
          });
        },
        onEnd: () => {
          audioLevelRef.current = 0;
          setIsBuddySpeaking(false);
          setOrbState('idle');
        },
        onError: (err) => {
          audioLevelRef.current = 0;
          setIsBuddySpeaking(false);
          setOrbState('idle');
          setVoiceTestFeedback({
            tone: 'error',
            message: `Kokoro voice could not play (${err?.message || 'network/browser error'}) — try Edge Neural HD or OS Voice!`
          });
        }
      });
      return;
    }

    if (vCfg.provider === 'neural-free') {
      const vMeta = FREE_NEURAL_VOICES.find(v => v.id === vCfg.freeNeuralVoice);
      const label = vMeta?.label || vCfg.freeNeuralVoice;
      setVoiceTestFeedback({
        tone: 'loading',
        message: `Connecting to Edge Neural HD · ${label}...`
      });
      void playFreeNeuralSpeech(sample, {
        voice: vCfg.freeNeuralVoice,
        rate: vCfg.rate,
        strictNoFallback: true,
        onAudioLevel: (lvl) => {
          audioLevelRef.current = lvl;
        },
        onStart: () => {
          setIsBuddySpeaking(true);
          setOrbState('speaking');
          setVoiceTestFeedback({
            tone: 'ok',
            message: `✓ Working! Playing Edge Neural HD · ${label}`
          });
        },
        onEnd: () => {
          audioLevelRef.current = 0;
          setIsBuddySpeaking(false);
          setOrbState('idle');
        },
        onError: () => {
          audioLevelRef.current = 0;
          setIsBuddySpeaking(false);
          setOrbState('idle');
          setVoiceTestFeedback({
            tone: 'error',
            message: `Edge Neural HD could not connect (make sure Vite dev server is running, or switch to Kokoro AI / OS Voice).`
          });
        }
      });
      return;
    }

    setVoiceTestFeedback({
      tone: 'loading',
      message: 'Testing Browser / OS Voice...'
    });
    playSpeech(sample, {
      voiceURI: vCfg.osVoiceURI || undefined,
      rate: vCfg.rate,
      onStart: () => {
        setIsBuddySpeaking(true);
        setOrbState('speaking');
        setVoiceTestFeedback({
          tone: 'ok',
          message: '✓ Working! Playing Browser / OS Voice'
        });
      },
      onEnd: () => {
        setIsBuddySpeaking(false);
        setOrbState('idle');
      },
      onError: () => {
        setIsBuddySpeaking(false);
        setOrbState('idle');
        setVoiceTestFeedback({
          tone: 'error',
          message: 'No browser speech synthesis voice responded on this device.'
        });
      }
    });
  };

  // Phase 05B — Decoupled Asynchronous English Grammar, Vocab & Fluency Analyzer
  const runGrammarAnalysisForMessage = async (params: {
    sessionId: string;
    messageId: string;
    transcript: string;
    contextSnippet: string;
    uncertainWords?: string[];
    sttConfidence?: number;
    durationSec?: number;
  }) => {
    try {
      const coherence = validateTranscriptCoherence(
        params.transcript,
        params.uncertainWords,
        params.sttConfidence
      );
      const analysis = await analyzeBuddyGrammar({
        originalTranscript: params.transcript,
        conversationContext: params.contextSnippet,
        intensity: intensityRef.current,
        mode: modeRef.current,
        uncertainWords: params.uncertainWords,
        sttConfidence: params.sttConfidence,
        durationSec: params.durationSec,
        coherence,
        apiKey: apiKey || loadApiKey(),
        model: selectedModel || loadModel()
      });

      // Phase 3 P1.4, 5.4 & Phase 4 P2.2 — Record normalized error rate, 7-day daily bucket & knowledge base
      const updatedAnalytics = recordTurnAnalytics(analysis, params.durationSec);
      setLearningAnalytics(updatedAnalytics);
      if (analysis.transcriptQuality !== 'unclear' && analysis.mistakes.length > 0) {
        let nextLib = loadGrammarLibrary();
        for (const mk of analysis.mistakes) {
          if (mk.severity === 'GRAMMAR_ERROR' || mk.severity === 'UNNATURAL') {
            nextLib = saveMistakeToGrammarLibrary(mk, false);
          }
        }
        setGrammarLibrary(nextLib);
      }

      setSessions(prev =>
        prev.map(s =>
          s.id === params.sessionId
            ? {
                ...s,
                messages: s.messages.map(m =>
                  m.id === params.messageId
                    ? {
                        ...m,
                        analysis,
                        correctedSentence: analysis.corrected_sentence,
                        grammarMistakes: analysis.mistakes,
                        isAnalyzing: false
                      }
                    : m
                )
              }
            : s
        )
      );

      // Phase 5 — Expressive 14-State Living Orb feedback pulse when resting
      if (!isListeningRef.current) {
        if (analysis.utteranceCategory === 'incomplete_speech') {
          setOrbState(curr => (curr === 'idle' || curr === 'analyzing' ? 'encouraging' : curr));
          setTimeout(() => setOrbState(curr => (curr === 'encouraging' ? 'idle' : curr)), 1800);
        } else if (analysis.transcriptQuality === 'unclear') {
          setOrbState(curr => (curr === 'idle' ? 'confused' : curr));
          setTimeout(() => setOrbState(curr => (curr === 'confused' ? 'idle' : curr)), 1800);
        } else if (analysis.mistakes.length > 0) {
          setOrbState(curr => (curr === 'idle' || curr === 'analyzing' ? 'correcting' : curr));
          setTimeout(() => setOrbState(curr => (curr === 'correcting' ? 'idle' : curr)), 1900);
        } else {
          // Clean, natural English -> warm purple "happy" celebratory lift!
          setOrbState(curr => (curr === 'idle' || curr === 'analyzing' ? 'happy' : curr));
          setTimeout(() => setOrbState(curr => (curr === 'happy' ? 'idle' : curr)), 1800);
        }
      }
    } catch {
      setSessions(prev =>
        prev.map(s =>
          s.id === params.sessionId
            ? {
                ...s,
                messages: s.messages.map(m =>
                  m.id === params.messageId ? { ...m, isAnalyzing: false } : m
                )
              }
            : s
        )
      );
    }
  };

  const handleToggleMistakeLearned = (msgId: string, mistakeId: string) => {
    let toggledMistake: { mistake: any; nextLearned: boolean } | null = null;
    updateActiveSession(sess => ({
      ...sess,
      messages: sess.messages.map(m => {
        if (m.id !== msgId || !m.analysis) return m;
        return {
          ...m,
          analysis: {
            ...m.analysis,
            mistakes: m.analysis.mistakes.map(mk => {
              if (mk.id === mistakeId) {
                const nextLearned = !mk.learned;
                toggledMistake = { mistake: mk, nextLearned };
                return { ...mk, learned: nextLearned };
              }
              return mk;
            })
          }
        };
      })
    }));
    if (toggledMistake) {
      const tm = toggledMistake as { mistake: any; nextLearned: boolean };
      setGrammarLibrary(saveMistakeToGrammarLibrary(tm.mistake, tm.nextLearned));
    }
  };

  // Phase 3 Section 5.1 — Active Spoken "Try Again" Result Persistence
  const handleTryAgainComplete = (msgId: string, result: TryAgainAttemptResult) => {
    const targetMsg = activeSessionRef.current?.messages.find(m => m.id === msgId);
    const cats = (targetMsg?.analysis?.mistakes || [])
      .filter(m => m.severity === 'GRAMMAR_ERROR' || m.severity === 'UNNATURAL')
      .map(m => m.category);

    const updatedAnalytics = recordTryAgainOutcome(result.matched, cats);
    setLearningAnalytics(updatedAnalytics);

    updateActiveSession(sess => ({
      ...sess,
      messages: sess.messages.map(m => {
        if (m.id !== msgId || !m.analysis) return m;
        return {
          ...m,
          analysis: {
            ...m.analysis,
            tryAgainResult: result,
            mistakes: result.matched
              ? m.analysis.mistakes.map(mk => ({ ...mk, learned: true }))
              : m.analysis.mistakes
          }
        };
      })
    }));

    if (result.matched) {
      // Phase 5 — Trigger "encouraging" golden sparkle aura on "Try Again" mastery win!
      if (!isListeningRef.current && !isBuddySpeaking) {
        setOrbState('encouraging');
        setTimeout(() => {
          setOrbState(curr => (curr === 'encouraging' ? 'idle' : curr));
        }, 2600);
      }
      if (targetMsg?.analysis?.mistakes) {
        let nextLib = loadGrammarLibrary();
        for (const mk of targetMsg.analysis.mistakes) {
          if (mk.severity === 'GRAMMAR_ERROR' || mk.severity === 'UNNATURAL') {
            nextLib = saveMistakeToGrammarLibrary(mk, true);
          }
        }
        setGrammarLibrary(nextLib);
      }
    }
  };

  const handleTriggerDeepThinkingOrb = () => {
    if (!isListeningRef.current && !isBuddySpeaking) {
      setOrbState('deep_thinking');
      setTimeout(() => {
        setOrbState(curr => (curr === 'deep_thinking' ? 'idle' : curr));
      }, 2200);
    }
  };

  const handleSaveVocabItem = (item: Omit<SavedBuddyVocabItem, 'id' | 'savedAt'>) => {
    setSavedVocab(saveVocabItemToCollection(item));
  };

  const handlePracticeRecurringCategory = (category: GrammarCategoryCode) => {
    const prompt = getTargetedPracticePrompt(category);
    setRightTab('feedback');
    handleNewChat(prompt);
  };

  const processFinalizedUserTurn = async (params: {
    rawTranscript: string;
    engine: BuddySpeechEngine | 'typed';
    sttEngineDetail?: string;
    recordedAudioUrl?: string;
    uncertainWords?: string[];
    sttConfidence?: number;
    durationSec?: number;
    autoResumeAfter?: boolean;
    speechPerf?: {
      speechStart: number | null;
      firstPartialSTT: number | null;
      lastPartialSTT: number | null;
      speechEnd: number | null;
      finalTranscript: number | null;
    };
  }) => {
    const cleanRaw = params.rawTranscript.trim();
    if (!cleanRaw) {
      setOrbState('idle');
      setLifecyclePhase('PHASE_01_IDLE');
      return;
    }

    const nowPerf = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const targetSessionId = activeSessionRef.current.id;

    // Section 7 — Turn Idempotency Guard: never generate duplicate responses for the same finalized user turn!
    const dedupSig = `${targetSessionId}|${cleanRaw.toLowerCase()}|${Math.floor(Date.now() / 1800)}`;
    if (inFlightTurnSigRef.current === dedupSig) {
      return;
    }
    inFlightTurnSigRef.current = dedupSig;

    // Re-warm Neural TTS right as AI request begins so socket is 100% OPEN (< 13s old) when token 1 arrives!
    if (voiceOutputEnabledRef.current && buddyVoiceConfigRef.current.provider !== 'standard') {
      warmUpNeuralTts(buddyVoiceConfigRef.current.freeNeuralVoice);
    }

    const speechEndAnchor = params.speechPerf?.speechEnd ?? nowPerf();
    const pMarks: BuddyTurnPerfTimestamps = {
      speechStart: params.speechPerf?.speechStart ?? speechEndAnchor,
      firstPartialSTT: params.speechPerf?.firstPartialSTT ?? null,
      lastPartialSTT: params.speechPerf?.lastPartialSTT ?? null,
      finalTranscript: params.speechPerf?.finalTranscript ?? nowPerf(),
      aiRequestStart: null,
      aiFirstToken: null,
      grammarStart: null,
      grammarComplete: null,
      ttsRequestStart: null,
      ttsFirstByte: null,
      playbackStart: null,
      turnComplete: null
    };
    let ttsDeliveryUsed: 'neural-stream' | 'neural-cache' | 'browser-speech' | 'muted' =
      voiceOutputEnabledRef.current ? 'neural-stream' : 'muted';
    let aiProviderUsed: 'gemini' | 'local' = apiKey || loadApiKey() ? 'gemini' : 'local';
    let perfCommitted = false;

    setOrbState('understanding');
    setLifecyclePhase('PHASE_04_UNDERSTANDING');

    const priorMessages = activeSessionRef.current?.messages || [];

    // Audit Section 3 — Single Immutable Turn Packet consumed identically by Friend Engine & Grammar Coach
    const packet = buildFinalizedTurnPacket({
      sessionId: targetSessionId,
      rawTranscript: cleanRaw,
      engine: params.engine,
      recordedAudioUrl: params.recordedAudioUrl,
      uncertainWords: params.uncertainWords,
      sttConfidence: params.sttConfidence,
      durationSec: params.durationSec,
      priorHistory: priorMessages
    });

    const commitPerfSnapshot = (bargeInInterrupted?: boolean) => {
      if (perfCommitted) return;
      perfCommitted = true;
      if (pMarks.turnComplete === null) {
        pMarks.turnComplete = nowPerf();
      }
      const diff = (b: number | null, a: number | null) =>
        b !== null && a !== null ? Math.max(0, Math.round(b - a)) : null;

      const record: BuddyTurnPerfRecord = {
        turnId: packet.turnId,
        sessionId: packet.sessionId,
        recordedAt: Date.now(),
        sttEngineUsed: params.sttEngineDetail || params.engine,
        aiProviderUsed,
        ttsProviderUsed: ttsDeliveryUsed,
        wordCount: packet.analysisTranscript.split(/\s+/).filter(Boolean).length,
        bargeInInterrupted,
        timestamps: { ...pMarks },
        durations: {
          timeToFirstTranscriptMs: diff(pMarks.firstPartialSTT, pMarks.speechStart),
          partialWindowSpanMs: diff(pMarks.lastPartialSTT, pMarks.firstPartialSTT),
          finalTranscriptionLatencyMs: diff(pMarks.finalTranscript, speechEndAnchor),
          aiTimeToFirstTokenMs: diff(pMarks.aiFirstToken, pMarks.aiRequestStart),
          grammarAnalysisLatencyMs: diff(pMarks.grammarComplete, pMarks.grammarStart),
          ttsTimeToFirstAudioMs: diff(pMarks.ttsFirstByte, pMarks.ttsRequestStart),
          userEndToFirstAudioMs: diff(pMarks.playbackStart, speechEndAnchor),
          totalResponseCompletionMs: diff(pMarks.turnComplete, speechEndAnchor)
        }
      };

      setPerfRecords(prev => [record, ...prev].slice(0, 30));
      setTurnTraces(prev =>
        prev.map(t => (t.turnId === packet.turnId ? { ...t, perf: record } : t))
      );
    };

    const userMsg: BuddyMessage = {
      id: packet.messageId,
      role: 'user',
      timestamp: packet.timestamp,
      text: packet.analysisTranscript,
      originalRawTranscript: packet.rawTranscript,
      finalizedVerbatimTranscript: packet.finalizedVerbatimTranscript,
      punctuationNormalizedTranscript: packet.punctuationNormalizedTranscript,
      recordedAudioUrl: packet.recordedAudioUrl,
      isEdited: false,
      uncertainWords: packet.uncertainWords,
      sttConfidence: packet.sttConfidence,
      sttEngine: packet.sttEngine,
      audioDurationSec: packet.audioDurationSec,
      isAnalyzing: true
    };

    const isFirstUserMsg = !priorMessages.some(m => m.role === 'user');
    const derivedTitle = isFirstUserMsg
      ? packet.analysisTranscript.slice(0, 36) + (packet.analysisTranscript.length > 36 ? '...' : '')
      : activeSessionRef.current.title;

    const buddyPlaceholderId = `msg-buddy-${packet.timestamp + 1}`;
    const buddyPlaceholderMsg: BuddyMessage = {
      id: buddyPlaceholderId,
      role: 'buddy',
      timestamp: packet.timestamp + 1,
      text: '',
      responseSource: apiKey || loadApiKey() ? 'gemini' : 'local'
    };

    // Session-locked state mutation — show User message + instant Buddy streaming bubble in 0ms!
    setSessions(prev =>
      prev.map(s =>
        s.id === packet.sessionId
          ? {
              ...s,
              title: derivedTitle,
              updatedAt: packet.timestamp,
              messages: [...s.messages, userMsg, buddyPlaceholderMsg]
            }
          : s
      )
    );
    setStreamingBuddyMsgId(buddyPlaceholderId);

    setOrbState(packet.coherence.quality === 'unclear' ? 'confused' : 'thinking');
    setLifecyclePhase('PHASE_05_RESPONDING');

    // Create a progressive streaming TTS queue so Segment 0 plays while Segment 1+ streams & prefetches!
    let ttsQueue: RealtimeTtsQueue | null = null;
    let enqueuedSentenceCount = 0;

    if (voiceOutputEnabledRef.current && activeSessionRef.current?.id === packet.sessionId) {
      ttsQueue = createRealtimeTtsQueue({
        voiceConfig: buddyVoiceConfigRef.current,
        onAudioLevel: (lvl) => {
          audioLevelRef.current = lvl;
        },
        onTtsRequestStart: () => {
          if (pMarks.ttsRequestStart === null) pMarks.ttsRequestStart = nowPerf();
        },
        onTtsFirstAudio: (delivery) => {
          ttsDeliveryUsed = delivery;
          if (pMarks.ttsFirstByte === null) pMarks.ttsFirstByte = nowPerf();
        },
        onFirstStart: () => {
          if (pMarks.playbackStart === null) pMarks.playbackStart = nowPerf();
          setIsBuddySpeaking(true);
          setOrbState('speaking');
          setLifecyclePhase('PHASE_06_SPEAKING');
        },
        onAllEnd: () => {
          activeTtsQueueRef.current = null;
          pMarks.turnComplete = nowPerf();
          commitPerfSnapshot(false);
          audioLevelRef.current = 0;
          setIsBuddySpeaking(false);
          setLifecyclePhase('PHASE_07_SAVED');
          if (
            params.autoResumeAfter &&
            continuousModeRef.current &&
            activeSessionRef.current?.id === packet.sessionId
          ) {
            setTimeout(() => {
              if (!isListeningRef.current) {
                void startListeningTurn();
              }
            }, 320);
          } else {
            setOrbState('idle');
          }
        }
      });
      activeTtsQueueRef.current = ttsQueue;
    }

    try {
      await orchestrateBuddyTurn({
        packet,
        personality: personalityRef.current,
        mode: modeRef.current,
        intensity: intensityRef.current,
        memory: buddyMemoryRef.current,
        analytics: learningAnalyticsRef.current,
        apiKey: apiKey || loadApiKey(),
        model: selectedModel || loadModel(),
        callbacks: {
          onAiRequestStart: () => {
            pMarks.aiRequestStart = nowPerf();
          },
          onAiFirstToken: () => {
            if (pMarks.aiFirstToken === null) pMarks.aiFirstToken = nowPerf();
          },
          onGrammarStart: () => {
            pMarks.grammarStart = nowPerf();
          },
          onMemoryUpdated: (nextMem) => {
            setBuddyMemory(nextMem);
          },
          onFriendPartialReply: (partialText, pkt, meta) => {
            if (pMarks.aiFirstToken === null) pMarks.aiFirstToken = nowPerf();
            if (meta?.spokenCorrection && !isBuddySpeaking && !isListeningRef.current) {
              setOrbState(curr => (curr === 'thinking' || curr === 'understanding' ? 'correcting' : curr));
            }
            setSessions(prev =>
              prev.map(s =>
                s.id === pkt.sessionId
                  ? {
                      ...s,
                      messages: s.messages.map(m =>
                        m.id === buddyPlaceholderId
                          ? {
                              ...m,
                              text: partialText,
                              spokenCorrection: meta?.spokenCorrection || undefined,
                              conversationalResponse: meta?.conversationalResponse || undefined,
                              correctionType: meta?.correctionType || undefined
                            }
                          : m
                      )
                    }
                  : s
              )
            );
          },
          onFriendSentenceReady: (sentence, pkt) => {
            if (ttsQueue && activeSessionRef.current?.id === pkt.sessionId) {
              enqueuedSentenceCount += 1;
              ttsQueue.enqueue(sentence);
            }
          },
          onFriendReplyReady: (friendResult, pkt) => {
            aiProviderUsed = friendResult.source;
            setStreamingBuddyMsgId(curr => (curr === buddyPlaceholderId ? null : curr));

            setSessions(prev =>
              prev.map(s =>
                s.id === pkt.sessionId
                  ? {
                      ...s,
                      updatedAt: Date.now(),
                      messages: s.messages.map(m =>
                        m.id === buddyPlaceholderId
                          ? {
                              ...m,
                              text: friendResult.reply,
                              spokenCorrection: friendResult.spokenCorrection || undefined,
                              conversationalResponse: friendResult.conversationalResponse || undefined,
                              correctionType: friendResult.correctionType,
                              structuredTurn: friendResult.structuredTurn,
                              responseSource: friendResult.source
                            }
                          : m
                      )
                    }
                  : s
              )
            );

            if (activeSessionRef.current?.id === pkt.sessionId && ttsQueue) {
              if (enqueuedSentenceCount === 0 && friendResult.reply.trim()) {
                enqueuedSentenceCount += 1;
                ttsQueue.enqueue(friendResult.reply);
              }
            }
          },
          onFriendReplyUpdated: (updatedFriendResult, pkt) => {
            setSessions(prev =>
              prev.map(s =>
                s.id === pkt.sessionId
                  ? {
                      ...s,
                      messages: s.messages.map(m =>
                        m.id === buddyPlaceholderId
                          ? {
                              ...m,
                              text: updatedFriendResult.reply,
                              spokenCorrection: updatedFriendResult.spokenCorrection || undefined,
                              conversationalResponse:
                                updatedFriendResult.conversationalResponse || undefined,
                              correctionType: updatedFriendResult.correctionType,
                              structuredTurn: updatedFriendResult.structuredTurn
                            }
                          : m
                      )
                    }
                  : s
              )
            );
          },
          onLateSpokenCorrection: (spokenSentence, pkt) => {
            if (ttsQueue && activeSessionRef.current?.id === pkt.sessionId && spokenSentence.trim()) {
              enqueuedSentenceCount += 1;
              ttsQueue.enqueue(spokenSentence);
            }
          },
          onGrammarAnalysisReady: (analysis, updatedAnalytics, updatedLib, pkt) => {
            pMarks.grammarComplete = nowPerf();
            setLearningAnalytics(updatedAnalytics);
            setGrammarLibrary(updatedLib);

            setSessions(prev =>
              prev.map(s =>
                s.id === pkt.sessionId
                  ? {
                      ...s,
                      messages: s.messages.map(m =>
                        m.id === pkt.messageId
                          ? {
                              ...m,
                              analysis,
                              correctedSentence: analysis.corrected_sentence,
                              grammarMistakes: analysis.mistakes,
                              isAnalyzing: false
                            }
                          : m
                      )
                    }
                  : s
              )
            );

            if (activeSessionRef.current?.id === pkt.sessionId && !isListeningRef.current && !isBuddySpeaking) {
              if (analysis.utteranceCategory === 'incomplete_speech') {
                setOrbState(curr => (curr === 'idle' || curr === 'analyzing' ? 'encouraging' : curr));
                setTimeout(() => setOrbState(curr => (curr === 'encouraging' ? 'idle' : curr)), 1800);
              } else if (analysis.transcriptQuality === 'unclear') {
                setOrbState(curr => (curr === 'idle' ? 'confused' : curr));
                setTimeout(() => setOrbState(curr => (curr === 'confused' ? 'idle' : curr)), 1800);
              } else if (analysis.mistakes.length > 0) {
                setOrbState(curr => (curr === 'idle' || curr === 'analyzing' ? 'correcting' : curr));
                setTimeout(() => setOrbState(curr => (curr === 'correcting' ? 'idle' : curr)), 1900);
              } else {
                setOrbState(curr => (curr === 'idle' || curr === 'analyzing' ? 'happy' : curr));
                setTimeout(() => setOrbState(curr => (curr === 'happy' ? 'idle' : curr)), 1800);
              }
            }
          },
          onTraceReady: (trace) => {
            setTurnTraces(prev => [trace, ...prev].slice(0, 25));
          }
        }
      });
    } finally {
      if (activeSessionRef.current?.id === packet.sessionId) {
        if (ttsQueue) {
          ttsQueue.markStreamDone();
        } else if (!voiceOutputEnabledRef.current) {
          pMarks.turnComplete = nowPerf();
          commitPerfSnapshot(false);
          setOrbState('idle');
          setLifecyclePhase('PHASE_07_SAVED');
          if (params.autoResumeAfter && continuousModeRef.current) {
            setTimeout(() => {
              if (!isListeningRef.current) void startListeningTurn();
            }, 260);
          }
        }
      }
    }
  };

  /**
   * Acquires or reuses a warm echo-cancelled, noise-suppressed microphone MediaStream
   * so consecutive turns start in < 5ms instead of paying 250-450ms OS hardware cold-start!
   */
  const acquireWarmMicStream = async (): Promise<MediaStream> => {
    const desiredDevice = selectedMicDeviceIdRef.current || 'default';
    if (
      mediaStreamRef.current &&
      warmMicDeviceRef.current === desiredDevice &&
      mediaStreamRef.current.getAudioTracks().some(t => t.readyState === 'live' && t.enabled)
    ) {
      return mediaStreamRef.current;
    }

    if (mediaStreamRef.current) {
      try { mediaStreamRef.current.getTracks().forEach(t => t.stop()); } catch {}
      mediaStreamRef.current = null;
    }

    const constraints: MediaTrackConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1
    };
    if (selectedMicDeviceIdRef.current) {
      constraints.deviceId = { exact: selectedMicDeviceIdRef.current };
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
    }
    mediaStreamRef.current = stream;
    warmMicDeviceRef.current = desiredDevice;
    return stream;
  };

  const finalizeCapturedTurn = async (reason: 'vad' | 'manual' | 'stt-end') => {
    if (!isListeningRef.current) return;
    isListeningRef.current = false;
    setIsListening(false);

    const nowPerf = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const speechEndPerf = activeSpeechPerfRef.current.speechEnd ?? nowPerf();
    activeSpeechPerfRef.current.speechEnd = speechEndPerf;

    if (vadPauseTimerRef.current) {
      clearTimeout(vadPauseTimerRef.current);
      vadPauseTimerRef.current = null;
    }
    if (rollingChunkTimerRef.current) {
      clearInterval(rollingChunkTimerRef.current);
      rollingChunkTimerRef.current = null;
    }

    // Grab any already in-flight speculative pause STT promise BEFORE cleanup!
    const inFlightSpeculativeStt = speculativeSttPromiseRef.current;
    speculativeSttPromiseRef.current = null;
    speculativeSttAbortRef.current = null;

    // Snapshot live streaming recognition buffers BEFORE stopping recognition
    const liveStreamedTranscript = [finalBufferRef.current.trim(), interimBufferRef.current.trim()]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const capturedUncertainWords = Array.from(uncertainWordsRef.current);
    const avgConf =
      confidenceSumRef.current.count > 0
        ? Number((confidenceSumRef.current.total / confidenceSumRef.current.count).toFixed(2))
        : undefined;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    // Finalize incremental 16kHz conditioned WAV in ~1ms (zero decodeAudioData / OfflineAudioContext!)
    const conditionedPcmResult = livePcmCaptureRef.current
      ? livePcmCaptureRef.current.finalizeWav()
      : null;
    livePcmCaptureRef.current = null;

    // Collect MediaRecorder compressed blob for "My voice" replay if active
    let recordedAudioUrl: string | undefined;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const rec = mediaRecorderRef.current;
      mediaRecorderRef.current = null;
      await new Promise<void>((resolve) => {
        const safety = setTimeout(resolve, 60);
        rec.onstop = () => {
          clearTimeout(safety);
          if (audioChunksRef.current.length > 0) {
            const rawBlob = new Blob(audioChunksRef.current, { type: rec.mimeType || 'audio/webm' });
            if (rawBlob.size > 0) {
              recordedAudioUrl = URL.createObjectURL(rawBlob);
            }
          }
          resolve();
        };
        try { rec.stop(); } catch { clearTimeout(safety); resolve(); }
      });
    } else if (conditionedPcmResult?.wavBlob) {
      recordedAudioUrl = URL.createObjectURL(conditionedPcmResult.wavBlob);
    }

    cleanupMediaCapture(false); // Keep warm mic stream alive for instant next turn!
    setLiveFinalText('');
    setLiveInterimText('');

    const rawElapsedSec = (Date.now() - listenStartedAtRef.current) / 1000;
    const durationSec =
      conditionedPcmResult?.durationSec ||
      Math.max(1, Math.round(rawElapsedSec - (reason === 'vad' ? 0.7 : 0)));

    const activeEngine = speechEngineRef.current;
    const currentKey = apiKey || loadApiKey();

    // PATH A: Real-Time Live Web Speech ('live-solo') -> 0ms instant turn handoff with ZERO "Transcribing" delay!
    if (activeEngine === 'live-solo') {
      if (inFlightSpeculativeStt) {
        // Never block live-solo on background WAV promises
      }
      if (liveStreamedTranscript.length > 0) {
        const finalPerf = nowPerf();
        await processFinalizedUserTurn({
          rawTranscript: liveStreamedTranscript,
          engine: 'live-solo',
          sttEngineDetail: `live-streaming (${recognitionLangRef.current})`,
          recordedAudioUrl,
          uncertainWords: capturedUncertainWords,
          sttConfidence: avgConf,
          durationSec,
          autoResumeAfter: continuousModeRef.current,
          speechPerf: {
            speechStart: activeSpeechPerfRef.current.speechStart ?? speechEndPerf,
            firstPartialSTT: activeSpeechPerfRef.current.firstPartialSTT ?? finalPerf,
            lastPartialSTT: activeSpeechPerfRef.current.lastPartialSTT ?? finalPerf,
            speechEnd: speechEndPerf,
            finalTranscript: finalPerf
          }
        });
        return;
      }
      // In live-solo, if nothing was spoken (silence), return straight to idle without entering "Transcribing"!
      if (recordedAudioUrl) { try { URL.revokeObjectURL(recordedAudioUrl); } catch {} }
      setOrbState('idle');
      setLifecyclePhase('PHASE_01_IDLE');
      return;
    }

    // PATH B: Reuse already-running Speculative Pause STT (~380ms head-start!) OR run fast 16kHz WAV Gemini SSE!
    if ((inFlightSpeculativeStt || conditionedPcmResult) && currentKey) {
      setOrbState('transcribing');
      setLifecyclePhase('PHASE_03_TRANSCRIBING');
      if (liveStreamedTranscript) {
        setLiveInterimText(liveStreamedTranscript);
      }
      try {
        const geminiText = inFlightSpeculativeStt
          ? await inFlightSpeculativeStt
          : await transcribeAudioBlobWithGemini(
              currentKey,
              selectedModel || loadModel(),
              conditionedPcmResult!.wavBlob,
              recognitionLangRef.current,
              {
                isPreConditionedWav: true,
                timeoutMs: liveStreamedTranscript ? 3200 : 4200,
                onPartialTranscript: (partial) => {
                  const ts = nowPerf();
                  if (activeSpeechPerfRef.current.firstPartialSTT === null) {
                    activeSpeechPerfRef.current.firstPartialSTT = ts;
                  }
                  activeSpeechPerfRef.current.lastPartialSTT = ts;
                  setLiveInterimText(partial);
                }
              }
            );
        setLiveInterimText('');
        const resolvedText = (geminiText && geminiText.trim()) || liveStreamedTranscript;
        if (!resolvedText) {
          if (recordedAudioUrl) { try { URL.revokeObjectURL(recordedAudioUrl); } catch {} }
          setOrbState('idle');
          setLifecyclePhase('PHASE_01_IDLE');
          setStatusNotice('No clear speech detected — speak naturally near your microphone.');
          return;
        }
        const finalPerf = nowPerf();
        await processFinalizedUserTurn({
          rawTranscript: resolvedText,
          engine: activeEngine === 'gemini-cloud' ? 'gemini-cloud' : 'live-solo',
          sttEngineDetail: inFlightSpeculativeStt
            ? 'speculative-live-16k-wav'
            : activeEngine === 'gemini-cloud'
            ? 'gemini-sse-16k-wav'
            : 'gemini-fallback-16k-wav',
          recordedAudioUrl,
          durationSec,
          autoResumeAfter: continuousModeRef.current,
          speechPerf: {
            speechStart: activeSpeechPerfRef.current.speechStart ?? speechEndPerf,
            firstPartialSTT: activeSpeechPerfRef.current.firstPartialSTT ?? finalPerf,
            lastPartialSTT: activeSpeechPerfRef.current.lastPartialSTT ?? finalPerf,
            speechEnd: speechEndPerf,
            finalTranscript: finalPerf
          }
        });
        return;
      } catch (err: any) {
        setLiveInterimText('');
        if (liveStreamedTranscript) {
          const finalPerf = nowPerf();
          await processFinalizedUserTurn({
            rawTranscript: liveStreamedTranscript,
            engine: 'live-solo',
            sttEngineDetail: 'live-streaming (gemini-timeout-fallback)',
            recordedAudioUrl,
            uncertainWords: capturedUncertainWords,
            sttConfidence: avgConf,
            durationSec,
            autoResumeAfter: continuousModeRef.current,
            speechPerf: {
              speechStart: activeSpeechPerfRef.current.speechStart ?? speechEndPerf,
              firstPartialSTT: activeSpeechPerfRef.current.firstPartialSTT ?? finalPerf,
              lastPartialSTT: activeSpeechPerfRef.current.lastPartialSTT ?? finalPerf,
              speechEnd: speechEndPerf,
              finalTranscript: finalPerf
            }
          });
          return;
        }
        if (recordedAudioUrl) { try { URL.revokeObjectURL(recordedAudioUrl); } catch {} }
        setOrbState('error');
        setStatusNotice(err?.message || 'Speech transcription failed. Check your network or API key.');
        return;
      }
    }

    // If neither live speech nor conditioned PCM detected real voice (e.g. pure silence)
    if (recordedAudioUrl) { try { URL.revokeObjectURL(recordedAudioUrl); } catch {} }
    setOrbState('idle');
    setLifecyclePhase('PHASE_01_IDLE');
  };

  const startListeningTurn = async (initialNotice?: string) => {
    // Immediate Barge-In: cancel AI voice playback in 0ms
    if (activeTtsQueueRef.current) {
      try { activeTtsQueueRef.current.cancel(); } catch {}
      activeTtsQueueRef.current = null;
    }
    stopSpeech();
    setIsBuddySpeaking(false);
    setStatusNotice(initialNotice || null);

    // Pre-warm Neural TTS WebSocket pool while the user speaks so response audio starts immediately!
    if (voiceOutputEnabledRef.current && buddyVoiceConfigRef.current.provider !== 'standard') {
      warmUpNeuralTts(buddyVoiceConfigRef.current.freeNeuralVoice);
    }

    if (speechEngineRef.current === 'gemini-cloud' && !(apiKey || loadApiKey())) {
      const hasSpeechRec =
        typeof window !== 'undefined' &&
        Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
      if (hasSpeechRec) {
        handleSelectEngine('live-solo');
      } else {
        setStatusNotice('Connect a Gemini API key for Gemini Verbatim Audio.');
        setIsApiModalOpen(true);
        return;
      }
    }

    cleanupMediaCapture(false);
    const nowPerf = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const currentKeyForTurn = apiKey || loadApiKey();
    if (currentKeyForTurn) {
      warmUpGeminiVoiceConnection(currentKeyForTurn);
    }

    finalBufferRef.current = '';
    interimBufferRef.current = '';
    uncertainWordsRef.current = new Set();
    confidenceSumRef.current = { total: 0, count: 0 };
    listenStartedAtRef.current = Date.now();
    // Section 4 Row 1: `speechStart` stamps actual voice onset (NOT pre-speech silence after clicking mic!)
    activeSpeechPerfRef.current = {
      speechStart: null,
      firstPartialSTT: null,
      lastPartialSTT: null,
      speechEnd: null
    };
    let browserSttAlive = false;
    isListeningRef.current = true;
    setIsListening(true);
    setLiveFinalText('');
    setLiveInterimText('');
    setOrbState('listening');
    setLifecyclePhase('PHASE_02_LISTENING');

    const DANGLING_PAUSE_WORDS =
      /\b(and|but|because|so|or|to|the|a|an|my|your|our|his|her|their|this|that|in|on|at|with|about|for|if|when|while|although|thinking|wondering|planning|trying|going|wanting|talking|was|were|am|is|are|um|uh)\s*$/i;

    const scheduleSmartVadCommit = () => {
      if (vadPauseTimerRef.current) clearTimeout(vadPauseTimerRef.current);
      if (!continuousModeRef.current || !isListeningRef.current) return;
      const preview = [finalBufferRef.current.trim(), interimBufferRef.current.trim()]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (!preview) return;
      const wordCount = preview.split(/\s+/).filter(Boolean).length;
      const waitMs =
        DANGLING_PAUSE_WORDS.test(preview) || wordCount < 2 ? 1350 : 720;
      vadPauseTimerRef.current = setTimeout(() => {
        activeSpeechPerfRef.current.speechEnd = nowPerf();
        void finalizeCapturedTurn('vad');
      }, waitMs);
    };

    // 1. Start Live Browser SpeechRecognition (when supported & reachable)
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 3;
        rec.lang = recognitionLangRef.current || 'en-GB';

        rec.onspeechstart = () => {
          if (activeSpeechPerfRef.current.speechStart === null) {
            activeSpeechPerfRef.current.speechStart = nowPerf();
          }
        };

        rec.onresult = (event: any) => {
          if (!isListeningRef.current) return;
          browserSttAlive = true;
          const ts = nowPerf();
          if (activeSpeechPerfRef.current.speechStart === null) {
            activeSpeechPerfRef.current.speechStart = Math.max(0, ts - 180);
          }
          if (activeSpeechPerfRef.current.firstPartialSTT === null) {
            activeSpeechPerfRef.current.firstPartialSTT = ts;
          }
          activeSpeechPerfRef.current.lastPartialSTT = ts;

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
          setLiveFinalText(fin.trim());
          setLiveInterimText(inter.trim());
          scheduleSmartVadCommit();
        };

        rec.onerror = (e: any) => {
          if (!isListeningRef.current) return;
          if (e.error === 'no-speech' || e.error === 'aborted') return;
          if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
            if (!mediaStreamRef.current) {
              isListeningRef.current = false;
              setIsListening(false);
              setOrbState('error');
              setStatusNotice('Microphone access blocked. Allow microphone permission in your browser bar.');
            }
            return;
          }
          browserSttAlive = false;
        };

        rec.onend = () => {
          if (!isListeningRef.current) return;
          const hasWords = (finalBufferRef.current + interimBufferRef.current).trim().length > 0;
          if (hasWords && continuousModeRef.current && speechEngineRef.current === 'live-solo') {
            void finalizeCapturedTurn('stt-end');
          } else if (isListeningRef.current && recognitionRef.current === rec && browserSttAlive) {
            try { rec.start(); } catch {}
          }
        };

        rec.start();
        recognitionRef.current = rec;
      } catch {
        // Fallback smoothly to WebAudio Live Rolling PCM Streamer below!
      }
    }

    // 2. Attach Warm Mic Stream + Incremental 16kHz PCM + Rolling Live Partial Streamer + Speculative Pause STT!
    try {
      const stream = await acquireWarmMicStream();
      if (!isListeningRef.current) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);

        if (speechEngineRef.current === 'gemini-cloud') {
          livePcmCaptureRef.current = createLive16kPcmCapture(ctx, source);
        }

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        const buf = new Uint8Array(analyser.frequencyBinCount);

        const vadStartMs = Date.now();
        let lastFrameMs = vadStartMs;
        let noiseSum = 0;
        let noiseCount = 0;
        let noiseFloor = 5;
        let activeSpeechMs = 0;
        let hasSpokenInTurn = false;
        let silenceStartedAt = 0;
        let rollingChunkInFlight = false;
        let lastRollingSentAt = 0;

        // Helper: fires a rolling 16kHz micro-window to Gemini Flash while user is STILL SPEAKING
        // whenever browser SpeechRecognition is unavailable/blocked (eliminates the 7.99s blind wait!)
        const triggerRollingLivePartial = () => {
          if (
            rollingChunkInFlight ||
            browserSttAlive ||
            !currentKeyForTurn ||
            !isListeningRef.current ||
            !livePcmCaptureRef.current
          ) {
            return;
          }
          const snap = livePcmCaptureRef.current.peekWav(5.5);
          if (!snap) return;
          rollingChunkInFlight = true;
          lastRollingSentAt = nowPerf();
          transcribeAudioBlobWithGemini(
            currentKeyForTurn,
            selectedModel || loadModel(),
            snap.wavBlob,
            recognitionLangRef.current,
            {
              isPreConditionedWav: true,
              isLiveRollingChunk: true,
              timeoutMs: 2200,
              onPartialTranscript: (partial) => {
                if (!isListeningRef.current || browserSttAlive || !partial) return;
                const ts = nowPerf();
                if (activeSpeechPerfRef.current.firstPartialSTT === null) {
                  activeSpeechPerfRef.current.firstPartialSTT = ts;
                }
                activeSpeechPerfRef.current.lastPartialSTT = ts;
                interimBufferRef.current = partial;
                setLiveInterimText(partial);
              }
            }
          )
            .then(txt => {
              if (isListeningRef.current && !browserSttAlive && txt) {
                const ts = nowPerf();
                if (activeSpeechPerfRef.current.firstPartialSTT === null) {
                  activeSpeechPerfRef.current.firstPartialSTT = ts;
                }
                activeSpeechPerfRef.current.lastPartialSTT = ts;
                interimBufferRef.current = txt;
                setLiveInterimText(txt);
              }
            })
            .catch(() => {})
            .finally(() => {
              rollingChunkInFlight = false;
            });
        };

        const tick = () => {
          if (!isListeningRef.current) return;
          analyser.getByteFrequencyData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i];
          const level = Math.min(100, Math.round((sum / buf.length / 128) * 100));
          audioLevelRef.current = level;

          const now = Date.now();
          const dt = Math.min(80, Math.max(0, now - lastFrameMs));
          lastFrameMs = now;

          if (now - vadStartMs < 200 && !hasSpokenInTurn) {
            noiseSum += level;
            noiseCount += 1;
            noiseFloor = Math.min(24, Math.round(noiseSum / Math.max(1, noiseCount)));
          } else {
            const speechThreshold = Math.max(13, noiseFloor + 8);
            const silenceThreshold = Math.max(7, noiseFloor + 3);
            if (level >= speechThreshold) {
              // User resumed speaking -> cancel any speculative pause transcription!
              if (speculativeSttAbortRef.current) {
                try { speculativeSttAbortRef.current.abort(); } catch {}
                speculativeSttAbortRef.current = null;
                speculativeSttPromiseRef.current = null;
              }
              if (activeSpeechPerfRef.current.speechStart === null) {
                // Backdate by 90ms so initial plosive consonant onset is accurately captured
                activeSpeechPerfRef.current.speechStart = Math.max(0, nowPerf() - 90);
              }
              activeSpeechMs += dt;
              if (activeSpeechMs >= 220) {
                hasSpokenInTurn = true;
              }
              silenceStartedAt = 0;

              // Only stream rolling WAV chunks when explicitly using Gemini Cloud Audio mode
              const sinceSpeechStart =
                nowPerf() - (activeSpeechPerfRef.current.speechStart ?? nowPerf());
              if (
                speechEngineRef.current === 'gemini-cloud' &&
                !browserSttAlive &&
                hasSpokenInTurn &&
                sinceSpeechStart >= 300 &&
                nowPerf() - lastRollingSentAt >= 950
              ) {
                triggerRollingLivePartial();
              }
            } else if (hasSpokenInTurn && level <= silenceThreshold) {
              if (!silenceStartedAt) {
                silenceStartedAt = now;
                activeSpeechPerfRef.current.speechEnd = nowPerf();
              } else if (continuousModeRef.current) {
                const silenceMs = now - silenceStartedAt;
                // Speculative Pause Head-Start ONLY when user explicitly selected 'gemini-cloud' mode!
                if (
                  speechEngineRef.current === 'gemini-cloud' &&
                  silenceMs >= 280 &&
                  !speculativeSttPromiseRef.current &&
                  currentKeyForTurn &&
                  livePcmCaptureRef.current
                ) {
                  const snap = livePcmCaptureRef.current.peekWav();
                  if (snap) {
                    const specAbort = new AbortController();
                    speculativeSttAbortRef.current = specAbort;
                    speculativeSttPromiseRef.current = transcribeAudioBlobWithGemini(
                      currentKeyForTurn,
                      selectedModel || loadModel(),
                      snap.wavBlob,
                      recognitionLangRef.current,
                      {
                        isPreConditionedWav: true,
                        signal: specAbort.signal,
                        timeoutMs: 3600,
                        onPartialTranscript: (partial) => {
                          if (!partial) return;
                          const ts = nowPerf();
                          if (activeSpeechPerfRef.current.firstPartialSTT === null) {
                            activeSpeechPerfRef.current.firstPartialSTT = ts;
                          }
                          activeSpeechPerfRef.current.lastPartialSTT = ts;
                          if (isListeningRef.current) setLiveInterimText(partial);
                        }
                      }
                    );
                  }
                }

                const liveText = (finalBufferRef.current + ' ' + interimBufferRef.current).trim();
                const isLiveWebMode = speechEngineRef.current === 'live-solo';
                // In Live Web Speech mode, wait until live words appear on screen so SpeechRecognition never gets cut off early!
                if (!isLiveWebMode || liveText.length > 0) {
                  const silenceBudget =
                    liveText && DANGLING_PAUSE_WORDS.test(liveText)
                      ? 1350
                      : isLiveWebMode
                      ? 950
                      : 680;
                  if (silenceMs >= silenceBudget) {
                    void finalizeCapturedTurn('vad');
                    return;
                  }
                }
              }
            }
          }

          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }

      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start(250); // 250ms timeslices so stop() flushes in < 15ms!
      mediaRecorderRef.current = recorder;
    } catch (err: any) {
      // If SpeechRecognition is already running, let it continue; otherwise report mic error
      if (!recognitionRef.current) {
        isListeningRef.current = false;
        setIsListening(false);
        setOrbState('error');
        setStatusNotice(err?.message || 'Microphone access denied.');
      }
    }
  };

  const stopListeningAndSend = () => {
    if (!isListeningRef.current) return;
    void finalizeCapturedTurn('manual');
  };

  const handleOrbOrMicClick = () => {
    unlockAudioOutput();
    if (isBuddySpeaking) {
      if (activeTtsQueueRef.current) {
        try { activeTtsQueueRef.current.cancel(); } catch {}
        activeTtsQueueRef.current = null;
      }
      stopSpeech();
      setIsBuddySpeaking(false);
      setOrbState('interrupted');
      // Immediate 0-delay barge-in straight into active listening!
      void startListeningTurn();
      return;
    }
    if (isListening) {
      stopListeningAndSend();
    } else {
      void startListeningTurn();
    }
  };

  const handleSendTyped = (e: React.FormEvent) => {
    e.preventDefault();
    unlockAudioOutput();
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
    const memoryGreeting =
      customPrompt ||
      generateMemoryAwareGreeting(
        buddyMemoryRef.current,
        learningAnalyticsRef.current,
        personality
      );
    const fresh = createFreshBuddySession(personality, mode, memoryGreeting);
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
    const targetSessionId = activeSessionRef.current.id;
    // Never overwrite originalRawTranscript or finalizedVerbatimTranscript!
    updateActiveSession(sess => ({
      ...sess,
      messages: sess.messages.map(m =>
        m.id === msgId
          ? {
              ...m,
              text: formatted,
              userEditedTranscript: clean,
              punctuationNormalizedTranscript: formatted,
              isEdited: true,
              uncertainWords: undefined,
              isAnalyzing: true
            }
          : m
      )
    }));
    setEditingMsgId(null);
    setEditingDraft('');

    // Re-run Phase 2 Grammar Analysis on the user-verified transcript!
    void runGrammarAnalysisForMessage({
      sessionId: targetSessionId,
      messageId: msgId,
      transcript: formatted,
      contextSnippet: 'User manually verified and edited their spoken transcript.'
    });
  };

  const handleSelectEngine = (eng: BuddySpeechEngine) => {
    setSpeechEngine(eng);
    setStatusNotice(null);
    try {
      localStorage.setItem('lingo_buddy_stt_engine_v4', eng);
      localStorage.setItem('lingo_buddy_stt_engine_v3', eng);
      localStorage.setItem('lingo_buddy_stt_engine_v2', eng);
      localStorage.setItem('ielts_speaking_stt_engine', eng);
    } catch { }
  };

  const handleSelectAccent = (lang: string) => {
    setRecognitionLang(lang);
    try {
      localStorage.setItem('lingo_buddy_accent_v2', lang);
      localStorage.setItem('ielts_speaking_accent', lang);
    } catch { }
  };

  const latestBuddyMessage = [...(activeSession?.messages || [])]
    .reverse()
    .find(m => m.role === 'buddy');

  const hasUserMessages = (activeSession?.messages || []).some(m => m.role === 'user');
  const currentPersonalityCfg = getPersonalityConfig(personality);
  const currentModeCfg = BUDDY_MODES.find(m => m.id === mode) || BUDDY_MODES[0];

  const engineLabel =
    speechEngine === 'gemini-cloud'
      ? 'Gemini Verbatim + Live'
      : `Live Stream · ${recognitionLang}`;

  const latestPerf = perfRecords[0] || null;

  const currentOrbDesc = getOrbStateDescriptor(orbState);

  const orbStatusSubtitle =
    orbState === 'listening'
      ? continuousMode
        ? 'Listening — speak freely, pause ~2s to send or tap Stop'
        : 'Listening — tap Stop & Send when finished'
      : orbState === 'transcribing'
        ? 'Converting voice to text...'
        : orbState === 'confused'
          ? "Didn't quite catch that — asking to clarify..."
          : orbState === 'happy'
            ? 'Clean, natural English — nice job!'
            : orbState === 'encouraging'
              ? 'Mastered! Awesome spoken practice!'
              : orbState === 'analyzing'
                ? 'Analyzing grammar & fluency...'
                : orbState === 'correcting'
                  ? 'Helpful feedback ready on the right'
                  : orbState === 'deep_thinking'
                    ? 'Breaking down the grammar rule...'
                    : orbState === 'understanding' || orbState === 'thinking'
                      ? 'Thinking of a reply...'
                      : orbState === 'interrupted'
                        ? 'Interrupted — listening to you now...'
                        : orbState === 'speaking'
                        ? 'Speaking — tap orb to interrupt'
                        : orbState === 'sleeping'
                          ? 'Session paused'
                          : 'Tap the orb to start talking';

  return (
    <div
      ref={pageContainerRef}
      className="relative w-full min-h-screen lg:h-dvh lg:max-h-dvh lg:overflow-hidden overflow-x-hidden bg-[#EEF3FD] text-slate-900 font-sans flex flex-col"
      style={{
        backgroundImage: `
          radial-gradient(circle at 12% 16%, rgba(59, 130, 246, 0.14) 0%, transparent 42%),
          radial-gradient(circle at 88% 14%, rgba(147, 51, 234, 0.12) 0%, transparent 40%),
          radial-gradient(circle at 78% 88%, rgba(14, 165, 233, 0.11) 0%, transparent 40%),
          radial-gradient(circle at 16% 86%, rgba(217, 70, 239, 0.10) 0%, transparent 38%),
          linear-gradient(to right, rgba(99, 102, 241, 0.035) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(99, 102, 241, 0.035) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 32px 32px, 32px 32px'
      }}
    >
      {/* Unified Glassmorphism Three-Column Sanctuary (Viewport-Locked on Desktop) */}
      <div className="relative flex-1 flex flex-col min-h-0 w-full lg:overflow-hidden">
        {/* ------------------------------------------------------------- */}
        {/* 1. TRANSLUCENT FROSTED GLASS TOP HEADER                       */}
        {/* ------------------------------------------------------------- */}
        <header className="shrink-0 sticky lg:static top-0 z-20 h-16 px-4 sm:px-6 border-b border-white/75 flex items-center justify-between gap-3 bg-white/72 backdrop-blur-xl shadow-[0_2px_16px_rgba(37,99,235,0.05)]">
          {/* Left: Back to Platform + History Drawer Trigger + Lingo Buddy Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {onBack && (
              <button
                type="button"
                onClick={handleBackToApp}
                className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Back to IELTS Platform"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Conversations & History"
            >
              <History className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate">
                    Lingo Buddy
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>English Companion</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden md:block truncate">
                  Speak freely. Make mistakes. Learn naturally.
                </p>
              </div>
            </div>
          </div>

          {/* Center: Clean SaaS Pill Selectors */}
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
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-full pl-3.5 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all cursor-pointer"
              >
                {BUDDY_MODES.map(m => (
                  <option key={m.id} value={m.id}>
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
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-full pl-3.5 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all cursor-pointer"
              >
                {BUDDY_PERSONALITIES.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.label} Tone
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none -ml-6" />
            </div>

            <div className="relative flex items-center">
              <select
                value={intensity}
                onChange={(e) => {
                  const next = e.target.value as CorrectionIntensity;
                  setIntensity(next);
                  updateActiveSession(s => ({ ...s, intensity: next }));
                }}
                aria-label="Correction Intensity"
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-full pl-3.5 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all cursor-pointer"
              >
                <option value="gentle">Gentle Friend</option>
                <option value="balanced">Balanced Coach</option>
                <option value="detailed">Detailed Teacher</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none -ml-6" />
            </div>

            <div className="relative hidden xl:flex items-center">
              <select
                value={explanationLangMode}
                onChange={(e) =>
                  handleChangeExplanationLangMode(e.target.value as ExplanationLangMode)
                }
                aria-label="Explanation Language Mode"
                className="appearance-none bg-indigo-50/80 hover:bg-indigo-100/70 border border-indigo-200/90 rounded-full pl-3.5 pr-8 py-1.5 text-xs font-semibold text-indigo-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all cursor-pointer"
              >
                <option value="english">English Only</option>
                <option value="simple_english">Simple English</option>
                <option value="bilingual_si">English + සිංහල</option>
                <option value="sinhala_focused">සිංහල Focused</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-400 pointer-events-none -ml-6" />
            </div>
          </div>

          {/* Right: New Chat + Orb Lab & QA + Audio Settings + Full Screen */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNewChat()}
              className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Start a new conversation"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSystemModalInitialTab('perf');
                setIsSystemModalOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Real-Time Voice Latency Diagnostics (12-stage performance.now() telemetry)"
            >
              <Gauge className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xl:inline">
                {latestPerf?.durations.userEndToFirstAudioMs != null
                  ? `${latestPerf.durations.userEndToFirstAudioMs}ms`
                  : 'Latency'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSystemModalInitialTab('orb');
                setIsSystemModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-xs font-semibold text-purple-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="14-State Living Orb Lab, 40-Scenario QA Suite & Turn Traces"
            >
              <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden lg:inline">Orb Lab &amp; QA</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAudioSettingsOpen(prev => !prev)}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAudioSettingsOpen
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
              title="Voice Engine, Accent & Microphone Settings"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">{engineLabel}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className={`p-2 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isFullscreen
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Enter Full Screen'}
              aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-blue-600" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {/* Clean Dropdown Audio & Voice Settings Sheet */}
        {isAudioSettingsOpen && (
          <div className="shrink-0 relative z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl px-5 py-4 shadow-sm animate-in fade-in duration-150 space-y-3.5">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5 md:col-span-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Speech Input Engine (Your Mic · 0% Auto-Correction)
                </span>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    disabled={isListening}
                    onClick={() => handleSelectEngine('live-solo')}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 ${
                      speechEngine === 'live-solo'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Real-time streaming STT (< 300ms live words, 0ms post-speech wait) + recorded audio + automatic Gemini 16kHz WAV fallback"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Live Streaming (Fastest)</span>
                  </button>
                  <button
                    type="button"
                    disabled={isListening}
                    onClick={() => handleSelectEngine('gemini-cloud')}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 ${
                      speechEngine === 'gemini-cloud'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Live interim word preview + conditioned 16kHz WAV verified by Gemini SSE Audio (0% auto-correction)"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini Verbatim + Live</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Accent Profile
                </span>
                <select
                  value={recognitionLang}
                  onChange={(e) => handleSelectAccent(e.target.value)}
                  disabled={isListening}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="en-LK">Sri Lankan English (en-LK)</option>
                  <option value="en-IN">South Asian English (en-IN)</option>
                  <option value="en-GB">British English (en-GB)</option>
                  <option value="en-US">American English (en-US)</option>
                  <option value="en-AU">Australian English (en-AU)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setContinuousMode(prev => !prev)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    continuousMode
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
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
                  className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer"
                >
                  Test Mic
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAudioSettingsOpen(false);
                    setIsApiModalOpen(true);
                  }}
                  className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-xs font-semibold border border-amber-200 cursor-pointer"
                >
                  {apiKey ? 'API Ready' : 'API Key'}
                </button>
              </div>
            </div>

            {/* Row 2: 3-Engine Voice Picker (Kokoro-82M Natural AI · Edge Neural HD · OS Voice) + Live Tester */}
            <div className="max-w-6xl mx-auto pt-3 border-t border-slate-100 space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Buddy Voice Engine (Choose What Works Best)
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => updateBuddyVoiceConfig({ provider: 'kokoro' })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        buddyVoiceConfig.provider === 'kokoro'
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Kokoro-82M Local Natural Neural Voices (12 US & UK voices via WebGPU / WASM)"
                    >
                      Kokoro AI
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBuddyVoiceConfig({ provider: 'neural-free' })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        buddyVoiceConfig.provider === 'neural-free'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Microsoft Edge Neural HD Voices (Ava, Emma, Sonia, Ryan)"
                    >
                      Edge Neural
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBuddyVoiceConfig({ provider: 'standard' })}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        buddyVoiceConfig.provider === 'standard'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Offline built-in Windows / Mac / Browser voices"
                    >
                      OS Voice
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        buddyVoiceConfig.provider === 'kokoro'
                          ? 'text-violet-700'
                          : buddyVoiceConfig.provider === 'neural-free'
                          ? 'text-emerald-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {buddyVoiceConfig.provider === 'kokoro'
                        ? 'Kokoro-82M Natural Voice (12 US & UK Voices)'
                        : buddyVoiceConfig.provider === 'neural-free'
                        ? 'Edge Neural HD Voice (6 Voices)'
                        : 'Installed Browser / OS Voice'}
                    </span>
                    {buddyVoiceConfig.provider === 'kokoro' && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          kokoroStatus.state === 'ready'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : kokoroStatus.state === 'loading'
                            ? 'bg-violet-50 text-violet-700 border-violet-200 animate-pulse'
                            : kokoroStatus.state === 'error'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {kokoroStatus.state === 'ready'
                          ? `✓ Ready (${kokoroStatus.backend === 'webgpu' ? 'WebGPU' : 'WASM'})`
                          : kokoroStatus.state === 'loading'
                          ? `Loading ${kokoroStatus.progress}%`
                          : kokoroStatus.state === 'error'
                          ? 'Load Error'
                          : 'On-Demand'}
                      </span>
                    )}
                  </div>

                  {buddyVoiceConfig.provider === 'kokoro' ? (
                    <select
                      value={buddyVoiceConfig.kokoroVoice}
                      onChange={(e) =>
                        updateBuddyVoiceConfig({
                          kokoroVoice: e.target.value as KokoroVoiceId
                        })
                      }
                      aria-label="Kokoro Natural Voice"
                      className="w-full bg-violet-50/70 border border-violet-200 rounded-xl px-3 py-2 text-xs font-semibold text-violet-950 focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      {KOKORO_NATURAL_VOICES.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.label} · {v.gender} · {v.trait}
                        </option>
                      ))}
                    </select>
                  ) : buddyVoiceConfig.provider === 'neural-free' ? (
                    <select
                      value={buddyVoiceConfig.freeNeuralVoice}
                      onChange={(e) =>
                        updateBuddyVoiceConfig({
                          freeNeuralVoice: e.target.value as FreeNeuralVoiceName
                        })
                      }
                      aria-label="Edge Neural HD Voice"
                      className="w-full bg-emerald-50/70 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {FREE_NEURAL_VOICES.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.label} · {v.trait}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={buddyVoiceConfig.osVoiceURI || ''}
                      onChange={(e) =>
                        updateBuddyVoiceConfig({
                          osVoiceURI: e.target.value
                        })
                      }
                      aria-label="OS Standard Voice"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-500 cursor-pointer"
                    >
                      <option value="">Auto Best Installed English Voice</option>
                      {osVoiceOptions.map(v => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.flag} {v.name} ({v.badge})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="md:col-span-3 flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                      <span>Speed</span>
                      <span className="font-mono text-blue-600">{buddyVoiceConfig.rate.toFixed(2)}×</span>
                    </div>
                    <input
                      type="range"
                      min={0.85}
                      max={1.2}
                      step={0.05}
                      value={buddyVoiceConfig.rate}
                      onChange={(e) =>
                        updateBuddyVoiceConfig({ rate: parseFloat(e.target.value) })
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleTestSelectedVoice}
                    className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                    title="Test this exact voice engine & speaker right now"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Voice</span>
                  </button>
                </div>
              </div>

              {/* Live Kokoro Download Progress Bar or Voice Test Verification Banner */}
              {(buddyVoiceConfig.provider === 'kokoro' && kokoroStatus.state === 'loading') && (
                <div className="space-y-1 bg-violet-50/80 border border-violet-200 rounded-xl px-3 py-2 text-[11px] text-violet-900">
                  <div className="flex items-center justify-between font-semibold">
                    <span>{kokoroStatus.detail}</span>
                    <span>{kokoroStatus.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-violet-200/70 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all duration-300"
                      style={{ width: `${Math.max(4, kokoroStatus.progress)}%` }}
                    />
                  </div>
                </div>
              )}

              {voiceTestFeedback && (
                <div
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center justify-between gap-2 ${
                    voiceTestFeedback.tone === 'ok'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : voiceTestFeedback.tone === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  <span>{voiceTestFeedback.message}</span>
                  <button
                    type="button"
                    onClick={() => setVoiceTestFeedback(null)}
                    className="opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* 2. THREE-COLUMN NEXNODO SAAS WORKSPACE                                  */}
        {/*    LEFT: Living Crystal Orb | CENTER: Friend Chat | RIGHT: Coach & Hub  */}
        {/* ----------------------------------------------------------------------- */}
        {(() => {
          const analyzedUserTurns = (activeSession?.messages || []).filter(
            m => m.role === 'user' && m.analysis
          );
          const totalFindings = analyzedUserTurns.reduce(
            (acc, m) => acc + (m.analysis?.mistakes.length || 0),
            0
          );
          const lastUserMsgId = [...(activeSession?.messages || [])]
            .reverse()
            .find(m => m.role === 'user')?.id;
          const focusedFeedbackId =
            selectedFeedbackMsgId &&
            analyzedUserTurns.some(t => t.id === selectedFeedbackMsgId)
              ? selectedFeedbackMsgId
              : lastUserMsgId || null;

          const categoryCountsMap: Record<string, number> = {};
          for (const rec of Object.values(learningAnalytics.categoryStats)) {
            categoryCountsMap[rec.category] = rec.count;
          }
          const savedVocabSet = new Set(savedVocab.map(v => v.phrase.toLowerCase()));
          const latestFluency =
            [...analyzedUserTurns].reverse().find(t => t.analysis?.fluency)?.analysis?.fluency ||
            null;
          const recentPronunciationSpotlights: PronunciationSpotlight[] = [];
          for (const t of [...analyzedUserTurns].reverse()) {
            for (const sp of t.analysis?.pronunciationSpotlights || []) {
              if (!recentPronunciationSpotlights.some(x => x.word === sp.word)) {
                recentPronunciationSpotlights.push(sp);
              }
            }
            if (recentPronunciationSpotlights.length >= 6) break;
          }

          return (
            <div className="relative z-10 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)] gap-4 p-3 sm:p-4 max-w-[1680px] w-full mx-auto lg:overflow-hidden">
              {/* ================================================================= */}
              {/* COLUMN 1 (LEFT): LIVING CRYSTAL ORB VOICE SANCTUARY (3/12 Cols)   */}
              {/* Airy glassmorphism stage — Orb floats natively with energy rings  */}
              {/* ================================================================= */}
              <section className="lg:col-span-4 xl:col-span-3 bg-gradient-to-b from-white/82 via-[#f4f7ff]/82 to-[#f4efff]/82 backdrop-blur-xl rounded-3xl border border-white/85 ring-1 ring-indigo-200/45 shadow-[0_10px_32px_rgba(59,130,246,0.08)] p-4 flex flex-col justify-between gap-2.5 lg:h-full lg:min-h-0 lg:overflow-hidden">
                {/* Friendly AI Presence Header & Voice Pills */}
                <div className="shrink-0 flex flex-col items-center gap-1.5 text-center">
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/85 border border-indigo-200/70 text-[11px] font-bold text-indigo-800 shadow-2xs">
                      {currentPersonalityCfg.emoji} {currentPersonalityCfg.label} · {currentModeCfg.label}
                    </span>
                    {apiKey ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50/90 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>AI Live</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsApiModalOpen(true)}
                        className="px-2.5 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="Connect a Gemini API key for Cheeky Sidekick voice & deep AI chat"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Connect AI</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={() => setIsAudioSettingsOpen(prev => !prev)}
                      className="px-2.5 py-0.5 rounded-full bg-white/80 hover:bg-blue-50 border border-blue-200/70 text-blue-700 text-[10px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      title="Change Buddy Voice & AI Studio Style"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>
                        {buddyVoiceConfig.provider === 'kokoro'
                          ? `Kokoro AI · ${
                              KOKORO_NATURAL_VOICES.find(
                                v => v.id === buddyVoiceConfig.kokoroVoice
                              )?.label || 'Heart (US)'
                            }`
                          : buddyVoiceConfig.provider === 'standard'
                          ? 'OS Standard Voice'
                          : `Neural HD · ${
                              FREE_NEURAL_VOICES.find(
                                v => v.id === buddyVoiceConfig.freeNeuralVoice
                              )?.label || 'Ava (US)'
                            }`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAudioSettingsOpen(prev => !prev)}
                      className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs ${
                        speechEngine === 'live-solo'
                          ? 'bg-amber-50/90 hover:bg-amber-100 border-amber-200 text-amber-800'
                          : 'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                      }`}
                      title="Active Speech-to-Text Engine (0% Auto-Correction) — click to switch"
                    >
                      <Mic className="w-3 h-3" />
                      <span>Mic: {engineLabel}</span>
                    </button>

                    {buddyMemory.enabled && buddyMemory.items.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setRightTab('hub')}
                        className="px-2.5 py-0.5 rounded-full bg-purple-50/90 hover:bg-purple-100 border border-purple-200/80 text-purple-700 text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Remembers {buddyMemory.items.length}{' '}
                        {buddyMemory.items.length === 1 ? 'interest' : 'interests'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Living Crystal Orb Centerpiece — Floating Directly on Airy Glass Surface */}
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="relative flex items-center justify-center shrink-0">
                    <BuddyEnergyOrb
                      state={orbState}
                      audioLevelRef={audioLevelRef}
                      onClick={handleOrbOrMicClick}
                      size={isFullscreen ? 264 : 240}
                    />
                  </div>

                  {/* Interactive State Pill + Animated Voice Sound Waves */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsSystemModalOpen(true)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer shadow-2xs ${
                        isListening
                          ? 'bg-sky-50 border-sky-300 text-sky-800'
                          : isBuddySpeaking
                          ? 'bg-purple-50 border-purple-300 text-purple-800'
                          : orbState === 'thinking' || orbState === 'understanding'
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                          : 'bg-white/85 hover:bg-blue-50 border-slate-200/90 text-slate-700'
                      }`}
                      title="Open 14-State Living Orb Lab & QA Suite"
                    >
                      <span className={`w-2 h-2 rounded-full ${currentOrbDesc.dotColor} ${isListening || isBuddySpeaking ? 'animate-pulse' : ''}`} />
                      <span>{currentOrbDesc.label}</span>
                      {(isListening || isBuddySpeaking) && (
                        <span className="inline-flex items-end gap-[2px] h-3 ml-0.5" aria-hidden="true">
                          {[0, 1, 2, 3].map(bar => (
                            <span
                              key={bar}
                              className={`w-[2.5px] rounded-full animate-pulse ${
                                isListening ? 'bg-sky-500' : 'bg-purple-500'
                              }`}
                              style={{
                                height: `${[55, 100, 70, 90][bar]}%`,
                                animationDelay: `${bar * 120}ms`,
                                animationDuration: '650ms'
                              }}
                            />
                          ))}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Live Caption */}
                  <div className="min-h-[54px] w-full flex flex-col items-center justify-center space-y-1 px-1">
                    {isListening && (liveFinalText || liveInterimText) ? (
                      <div className="space-y-0.5 animate-in fade-in duration-150">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[9px] font-bold uppercase tracking-wider text-sky-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                          <span>Live Transcription · Provisional</span>
                        </span>
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed line-clamp-2">
                          “{liveFinalText}
                          {liveFinalText && liveInterimText ? ' ' : ''}
                          {liveInterimText && (
                            <span className="text-blue-600 italic font-medium">{liveInterimText}</span>
                          )}
                          <span className="inline-block w-0.5 h-3.5 bg-sky-500 ml-1 align-middle animate-pulse" />”
                        </p>
                      </div>
                    ) : isBuddySpeaking && latestBuddyMessage ? (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        “{latestBuddyMessage.text}”
                      </p>
                    ) : (
                      <p className="text-xs font-semibold text-slate-700">
                        {hasUserMessages
                          ? 'I’m listening whenever you’re ready.'
                          : 'Tap the crystal orb or microphone to talk.'}
                      </p>
                    )}

                    <p className="text-[11px] font-medium text-slate-500">{orbStatusSubtitle}</p>

                    {showSinhala && !isListening && !hasUserMessages && (
                      <p className="text-[11px] text-indigo-600/90 font-sinhala">
                        මිතුරෙකු සමඟ මෙන් නිදහසේ කතා කරන්න.
                      </p>
                    )}

                    {statusNotice && (
                      <div className="mt-1 px-3 py-1.5 rounded-xl bg-amber-50/95 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2 text-left">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="flex-1">{statusNotice}</span>
                        <button
                          type="button"
                          onClick={() => setStatusNotice(null)}
                          className="text-amber-600 hover:text-amber-900 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Hero Voice Microphone Action Dock */}
                <div className="shrink-0 pt-2.5 border-t border-indigo-100/80">
                  <div className="flex items-center justify-center gap-2.5">
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
                      className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-2xs ${
                        voiceOutputEnabled
                          ? 'bg-white/90 hover:bg-blue-50 border-indigo-100 text-slate-700'
                          : 'bg-red-50 border-red-200 text-red-600'
                      }`}
                      title={voiceOutputEnabled ? 'Mute voice reply' : 'Unmute voice reply'}
                    >
                      {voiceOutputEnabled ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleOrbOrMicClick}
                      className={`relative h-12 px-7 rounded-full text-sm font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                        isListening
                          ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-[0_8px_24px_rgba(239,68,68,0.32)] ring-4 ring-red-500/20'
                          : isBuddySpeaking
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-[0_8px_24px_rgba(147,51,234,0.28)] ring-4 ring-purple-500/15'
                          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-[0_8px_24px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          <span>{speechEngine === 'live-solo' ? 'Listening · Done' : 'Stop & Send'}</span>
                        </>
                      ) : isBuddySpeaking ? (
                        <>
                          <Mic className="w-4 h-4" />
                          <span>Speaking · Interrupt</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          <span>Speak to Buddy</span>
                        </>
                      )}
                    </button>

                    {(isListening || isBuddySpeaking) ? (
                      <button
                        type="button"
                        onClick={() => {
                          stopAllAudioAndCapture();
                          setOrbState('sleeping');
                          setLifecyclePhase('PHASE_01_IDLE');
                        }}
                        className="w-10 h-10 rounded-full bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                        title="Pause voice session"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setShowKeyboardInput(true);
                          setTimeout(() => typedInputRef.current?.focus(), 40);
                        }}
                        className="w-10 h-10 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-all cursor-pointer"
                        title="Focus chat input"
                      >
                        <Keyboard className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* ================================================================= */}
              {/* COLUMN 2 (CENTER): PURE FRIEND CONVERSATION STREAM (5/12 Cols)    */}
              {/* Frosted glass chat zone visually separated from grammar coaching  */}
              {/* ================================================================= */}
              <main className="lg:col-span-4 xl:col-span-5 bg-white/78 backdrop-blur-xl rounded-3xl border border-white/85 ring-1 ring-blue-200/35 shadow-[0_10px_32px_rgba(37,99,235,0.06)] flex flex-col h-[560px] lg:h-full lg:min-h-0 overflow-hidden">
                {/* Clean Chat Column Header with Friendly AI Presence */}
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

                {/* Pure Friend Messages Stream — ONLY this area scrolls as chat grows */}
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
                      (msg.analysis?.mistakes.length || 0) +
                      (msg.analysis?.vocabUpgrades?.length || 0);
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
                            <span className="text-[10px] font-semibold text-emerald-600">
                              · Edited
                            </span>
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
                                onChange={(e) => setEditingDraft(e.target.value)}
                                rows={2}
                                className="w-full rounded-xl p-2.5 text-sm text-slate-900 bg-white border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingMsgId(null)}
                                  className="px-2.5 py-1 rounded-lg text-xs text-blue-100 hover:text-white cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditedTranscript(msg.id)}
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

                          {/* Low-confidence STT guard inside bubble */}
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
                                onClick={() => {
                                  setEditingMsgId(msg.id);
                                  setEditingDraft(msg.text);
                                }}
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

                        {/* Subtle Inline Coaching Pointer Pill (Visually Separate from Chat!) + Actions */}
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
                                    onClick={() => {
                                      setSelectedFeedbackMsgId(msg.id);
                                      setRightTab('feedback');
                                    }}
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
                                  onClick={() => {
                                    setEditingMsgId(msg.id);
                                    setEditingDraft(msg.text);
                                  }}
                                  className="text-slate-400 hover:text-blue-600 flex items-center gap-1 cursor-pointer opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                {msg.isEdited && msg.originalRawTranscript && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowRawForMsgId(prev => (prev === msg.id ? null : msg.id))
                                    }
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
                                  speakBuddyMessage(msg.text, false);
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

                  {/* Live Streaming Speech Bubble inside Chat Stream (distinguishes Finalized vs Provisional words!) */}
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
                          {liveInterimText && (
                            <span className="text-sky-200 italic">{liveInterimText}</span>
                          )}
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
                          onClick={() => handleNewChat(pickTopicStarterPrompt())}
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
                            onClick={() => handleNewChat(pickTopicStarterPrompt(topic.id))}
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

                {/* Section 5 — Live 3-Stage Verbatim Speech -> Final Transcript -> Grammar Analysis Strip */}
                {(() => {
                  const latestUserTurn = [...(activeSession?.messages || [])]
                    .reverse()
                    .find(m => m.role === 'user');
                  if (!isListening && orbState !== 'transcribing' && !latestUserTurn) return null;

                  const latestErrors =
                    latestUserTurn?.analysis?.mistakes.filter(
                      m => m.severity === 'GRAMMAR_ERROR' || m.severity === 'UNNATURAL'
                    ).length || 0;
                  const isLatestUnclear = latestUserTurn?.analysis?.transcriptQuality === 'unclear';
                  const isLatestIncomplete =
                    latestUserTurn?.analysis?.transcriptQuality === 'partially_unclear' &&
                    latestErrors === 0;
                  const liveTextPreview = [liveFinalText, liveInterimText].filter(Boolean).join(' ');

                  return (
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
                  );
                })()}

                {/* Always-Ready Clean SaaS Chat Composer */}
                <div className="shrink-0 p-3.5 border-t border-slate-100 bg-slate-50/60">
                  <form
                    onSubmit={handleSendTyped}
                    className="flex items-center gap-2 bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 rounded-2xl p-1.5 pl-4 shadow-2xs transition-all"
                  >
                    <input
                      ref={typedInputRef}
                      type="text"
                      value={typedInput}
                      onChange={(e) => setTypedInput(e.target.value)}
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

              {/* ================================================================= */}
              {/* COLUMN 3 (RIGHT): DEDICATED COACHING & PROGRESS RAIL (4/12 Cols)  */}
              {/* Distinct glassmorphism coaching panel (Red / Green / Purple)      */}
              {/* ================================================================= */}
              <aside className="lg:col-span-4 xl:col-span-4 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/85 ring-1 ring-purple-200/40 shadow-[0_10px_32px_rgba(124,58,237,0.06)] flex flex-col h-[520px] lg:h-full lg:min-h-0 overflow-hidden">
                {/* Segmented SaaS Rail Header: Live Feedback | Progress & Hub */}
                <div className="shrink-0 px-4 py-3 border-b border-indigo-100/70 bg-gradient-to-r from-white/75 via-purple-50/35 to-blue-50/35 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => setRightTab('feedback')}
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
                      onClick={() => setRightTab('hub')}
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

                {/* RIGHT TAB 1: Dedicated Live English Feedback Panel (Single Focused Turn + Compact Turn Switcher) */}
                {rightTab === 'feedback' && (() => {
                  const focusedTurn =
                    analyzedUserTurns.find(t => t.id === focusedFeedbackId) ||
                    analyzedUserTurns[analyzedUserTurns.length - 1] ||
                    null;
                  const earlierTurns = [...analyzedUserTurns]
                    .reverse()
                    .filter(t => t.id !== focusedTurn?.id);

                  return (
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
                                  onClick={() => setSelectedFeedbackMsgId(null)}
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
                                onToggleLearned={(mkId) => handleToggleMistakeLearned(focusedTurn.id, mkId)}
                                onRequestEdit={() => {
                                  setEditingMsgId(focusedTurn.id);
                                  setEditingDraft(focusedTurn.text);
                                }}
                                onSaveVocab={handleSaveVocabItem}
                                onTryAgainComplete={(res) => handleTryAgainComplete(focusedTurn.id, res)}
                                onBeforeStartTryAgain={() => {
                                  stopAllAudioAndCapture();
                                  setOrbState('idle');
                                }}
                                onInspectRule={handleTriggerDeepThinkingOrb}
                              />
                            </div>
                          </div>

                          {/* Compact Single-Line Switcher for Earlier Turns (Never stacks endless open cards!) */}
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
                                      onClick={() => setSelectedFeedbackMsgId(turn.id)}
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
                  );
                })()}

                {/* RIGHT TAB 2: Progress & Personal Learning Hub */}
                {rightTab === 'hub' && (
                  <BuddyLearningPanel
                    analytics={learningAnalytics}
                    memory={buddyMemory}
                    savedVocab={savedVocab}
                    grammarLibrary={grammarLibrary}
                    sessionsCount={sessions.length}
                    latestFluency={latestFluency}
                    recentPronunciationSpotlights={recentPronunciationSpotlights}
                    explanationLangMode={explanationLangMode}
                    showSinhala={showSinhala}
                    onChangeExplanationLangMode={handleChangeExplanationLangMode}
                    onPracticeCategory={handlePracticeRecurringCategory}
                    onSaveVocab={handleSaveVocabItem}
                    onRemoveVocab={(id) => setSavedVocab(removeVocabItemFromCollection(id))}
                    onToggleMemoryEnabled={(enabled) =>
                      setBuddyMemory(setMemoryPersonalizationEnabled(enabled))
                    }
                    onAddManualMemory={(label, detail, category) =>
                      setBuddyMemory(addManualBuddyMemory(label, detail, category))
                    }
                    onDeleteMemoryItem={(id) => setBuddyMemory(deleteBuddyMemoryItem(id))}
                    onClearAllMemories={() => setBuddyMemory(clearAllBuddyMemories())}
                    onRemoveGrammarNote={(id) => setGrammarLibrary(removeGrammarLibraryItem(id))}
                    onResetAnalytics={() => setLearningAnalytics(resetBuddyAnalytics())}
                  />
                )}
              </aside>
            </div>
          );
        })()}

        {/* ------------------------------------------------------------- */}
        {/* 3. SLIDE-OVER LIGHT SAAS CONVERSATION HISTORY DRAWER          */}
        {/* ------------------------------------------------------------- */}
        {isHistoryOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-xs flex animate-in fade-in duration-150"
            onClick={() => setIsHistoryOpen(false)}
          >
            <div
              className="w-80 max-w-[85%] h-full bg-white border-r border-slate-200 p-5 flex flex-col justify-between shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Conversations</h3>
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleNewChat()}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
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
                          setSelectedFeedbackMsgId(null);
                          setPersonality(sess.personality);
                          setMode(sess.mode);
                          setIntensity(sess.intensity || 'gentle');
                          setOrbState('idle');
                          setIsHistoryOpen(false);
                        }}
                        className={`group flex items-center justify-between gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : 'bg-slate-50/70 border-transparent hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{sess.title}</p>
                          <span className="text-[10px] text-slate-400">
                            {sess.messages.length} messages
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(sess.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 cursor-pointer transition-opacity"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Mode, Personality, Intensity & Language controls inside drawer */}
              <div className="pt-4 border-t border-slate-200 space-y-2 md:hidden">
                <select
                  value={mode}
                  onChange={(e) => {
                    const next = e.target.value as BuddyMode;
                    setMode(next);
                    updateActiveSession(s => ({ ...s, mode: next }));
                  }}
                  aria-label="Conversation Mode"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  {BUDDY_MODES.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
                <select
                  value={personality}
                  onChange={(e) => {
                    const next = e.target.value as BuddyPersonality;
                    setPersonality(next);
                    updateActiveSession(s => ({ ...s, personality: next }));
                  }}
                  aria-label="Companion Personality"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  {BUDDY_PERSONALITIES.map(p => (
                    <option key={p.id} value={p.id}>{p.label} Tone</option>
                  ))}
                </select>
                <select
                  value={intensity}
                  onChange={(e) => {
                    const next = e.target.value as CorrectionIntensity;
                    setIntensity(next);
                    updateActiveSession(s => ({ ...s, intensity: next }));
                  }}
                  aria-label="Correction Intensity"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="gentle">Gentle Friend</option>
                  <option value="balanced">Balanced Coach</option>
                  <option value="detailed">Detailed Teacher</option>
                </select>
                <select
                  value={explanationLangMode}
                  onChange={(e) =>
                    handleChangeExplanationLangMode(e.target.value as ExplanationLangMode)
                  }
                  aria-label="Explanation Language Mode"
                  className="w-full bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 text-xs font-semibold text-indigo-700"
                >
                  <option value="english">English Only</option>
                  <option value="simple_english">Simple English</option>
                  <option value="bilingual_si">English + සිංහල</option>
                  <option value="sinhala_focused">සිංහල Focused</option>
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
          try { localStorage.setItem('ielts_speaking_mic_device_id', id); } catch { }
        }}
        speechEngine={speechEngine}
        onSelectSpeechEngine={handleSelectEngine}
        recognitionLang={recognitionLang}
        onAccentChange={handleSelectAccent}
        apiKey={apiKey}
        selectedModel={selectedModel}
        showSinhala={showSinhala}
      />

      {/* Phase 5 — 14-State Living Orb Lab, 40-Scenario QA, Voice Latency Diagnostics & Immutable Audit Modal */}
      <BuddySystemModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        initialTab={systemModalInitialTab}
        currentOrbState={orbState}
        onPreviewOrbState={(nextState) => {
          setOrbState(nextState);
          if (nextState !== 'idle' && nextState !== 'sleeping') {
            setTimeout(() => {
              setOrbState(curr => (curr === nextState ? 'idle' : curr));
            }, 4500);
          }
        }}
        sessions={sessions}
        analytics={learningAnalytics}
        memory={buddyMemory}
        savedVocab={savedVocab}
        grammarLibrary={grammarLibrary}
        turnTraces={turnTraces}
        perfRecords={perfRecords}
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
