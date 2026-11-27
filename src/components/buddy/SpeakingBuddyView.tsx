import React, { useState, useEffect, useRef } from 'react';
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
  createFreshBuddySession,
  getPersonalityConfig,
  getTargetedPracticePrompt,
  loadBuddySessions,
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
  getMicrophoneUnavailableReason,
  requestMicrophoneStream,
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
  type KokoroEngineStatus,
  type RealtimeTtsQueue
} from '../../utils/speech';
import { loadApiKey, loadModel } from '../../utils/tutorEngine';
import { BuddyTopHeader } from './BuddyTopHeader';
import { BuddyAudioSettingsDrawer } from './BuddyAudioSettingsDrawer';
import { BuddyOrbSanctuaryColumn } from './BuddyOrbSanctuaryColumn';
import { BuddyChatStreamColumn } from './BuddyChatStreamColumn';
import { BuddyCoachingRailColumn } from './BuddyCoachingRailColumn';
import { BuddyHistoryDrawer } from './BuddyHistoryDrawer';
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
  const sttRestartTimerRef = useRef<any>(null);
  const orbPulseDecayTimerRef = useRef<any>(null);
  const lockedTurnPrefixRef = useRef<string>('');
  const finalBufferRef = useRef<string>('');
  const interimBufferRef = useRef<string>('');
  const lastSttActivityMsRef = useRef<number>(0);
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
    if (sttRestartTimerRef.current) {
      clearTimeout(sttRestartTimerRef.current);
      sttRestartTimerRef.current = null;
    }
    if (orbPulseDecayTimerRef.current) {
      clearTimeout(orbPulseDecayTimerRef.current);
      orbPulseDecayTimerRef.current = null;
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
   * Acquires or reuses a clean microphone MediaStream for Gemini 16kHz WAV mode.
   * Disables aggressive Windows echoCancellation/noiseSuppression APOs (matching SpeakingTutorView)
   * so neural ASR hears crisp consonant endings ("-ed", "-s", "t", "d") without muffling.
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
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: true,
      channelCount: 1
    };
    if (selectedMicDeviceIdRef.current) {
      constraints.deviceId = { exact: selectedMicDeviceIdRef.current };
    }

    const stream = await requestMicrophoneStream(constraints);
    mediaStreamRef.current = stream;
    warmMicDeviceRef.current = desiredDevice;
    return stream;
  };

  const getCombinedLiveTranscript = (): string =>
    [
      lockedTurnPrefixRef.current.trim(),
      finalBufferRef.current.trim(),
      interimBufferRef.current.trim()
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

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
    if (sttRestartTimerRef.current) {
      clearTimeout(sttRestartTimerRef.current);
      sttRestartTimerRef.current = null;
    }
    if (orbPulseDecayTimerRef.current) {
      clearTimeout(orbPulseDecayTimerRef.current);
      orbPulseDecayTimerRef.current = null;
    }
    if (rollingChunkTimerRef.current) {
      clearInterval(rollingChunkTimerRef.current);
      rollingChunkTimerRef.current = null;
    }

    // Grab any already in-flight speculative pause STT promise BEFORE cleanup!
    const inFlightSpeculativeStt = speculativeSttPromiseRef.current;
    speculativeSttPromiseRef.current = null;
    speculativeSttAbortRef.current = null;

    // Stop SpeechRecognition gracefully: when manually stopped or while provisional interim words
    // are still settling, keep `onresult` alive briefly (up to 360ms or until `onend`) so Chrome's
    // final cloud STT packet is NEVER discarded!
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      const needsFinalFlush =
        reason === 'manual' || interimBufferRef.current.trim().length > 0;

      if (needsFinalFlush) {
        await new Promise<void>((resolve) => {
          let settled = false;
          const finishFlush = () => {
            if (settled) return;
            settled = true;
            clearTimeout(flushGuard);
            try {
              rec.onresult = null;
              rec.onerror = null;
              rec.onend = null;
            } catch {}
            resolve();
          };
          const flushGuard = setTimeout(finishFlush, 360);
          rec.onend = finishFlush;
          rec.onerror = finishFlush;
          try {
            rec.stop();
          } catch {
            finishFlush();
          }
        });
      } else {
        try {
          rec.onresult = null;
          rec.onerror = null;
          rec.onend = null;
          rec.stop();
        } catch {}
      }
    }

    // Snapshot complete live streaming transcript AFTER final SpeechRecognition flush!
    const liveStreamedTranscript = getCombinedLiveTranscript();
    const capturedUncertainWords = Array.from(uncertainWordsRef.current);
    const avgConf =
      confidenceSumRef.current.count > 0
        ? Number((confidenceSumRef.current.total / confidenceSumRef.current.count).toFixed(2))
        : undefined;

    // Finalize incremental 16kHz conditioned WAV in ~1ms (when Gemini/backup WebAudio capture was active)
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

    cleanupMediaCapture(false);
    setLiveFinalText('');
    setLiveInterimText('');

    const rawElapsedSec = (Date.now() - listenStartedAtRef.current) / 1000;
    const durationSec =
      conditionedPcmResult?.durationSec ||
      Math.max(1, Math.round(rawElapsedSec - (reason === 'vad' ? 1.5 : 0)));

    const activeEngine = speechEngineRef.current;
    const currentKey = apiKey || loadApiKey();

    // PATH A: Real-Time Live Web Speech ('live-solo') -> 0ms instant turn handoff with ZERO "Transcribing" delay!
    if (activeEngine === 'live-solo') {
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
      // If browser STT had to fall back to backup WAV capture (e.g. network block) and captured speech, allow Path B rescue; otherwise return cleanly to idle
      if (!conditionedPcmResult || !currentKey) {
        if (recordedAudioUrl) { try { URL.revokeObjectURL(recordedAudioUrl); } catch {} }
        setOrbState('idle');
        setLifecyclePhase('PHASE_01_IDLE');
        return;
      }
    }

    // PATH B: Reuse already-running Speculative Pause STT OR run fast 16kHz WAV Gemini SSE!
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

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    // Early guard on mobile LAN plain HTTP (`http://192.168.x.x:3000`) where browsers disable all mic APIs
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      const insecureReason = getMicrophoneUnavailableReason();
      setOrbState('error');
      setStatusNotice(
        insecureReason ||
          'Mobile browsers require HTTPS (or localhost) for microphone access. Run "npm run dev:https" or type below.'
      );
      setTimeout(() => typedInputRef.current?.focus(), 60);
      return;
    }

    if (speechEngineRef.current === 'gemini-cloud' && !(apiKey || loadApiKey())) {
      if (SpeechRecognition) {
        handleSelectEngine('live-solo');
      } else {
        setStatusNotice('Connect a Gemini API key for Gemini Verbatim Audio.');
        setIsApiModalOpen(true);
        return;
      }
    }

    // In 'live-solo' mode, release any open getUserMedia tracks so browser SpeechRecognition has
    // 100% exclusive, distortion-free access to the microphone (eliminates Windows APO contention!).
    const usePureSoloBrowserStt =
      speechEngineRef.current === 'live-solo' && Boolean(SpeechRecognition);
    cleanupMediaCapture(usePureSoloBrowserStt);

    const nowPerf = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const currentKeyForTurn = apiKey || loadApiKey();
    if (currentKeyForTurn) {
      warmUpGeminiVoiceConnection(currentKeyForTurn);
    }

    lockedTurnPrefixRef.current = '';
    finalBufferRef.current = '';
    interimBufferRef.current = '';
    lastSttActivityMsRef.current = 0;
    uncertainWordsRef.current = new Set();
    confidenceSumRef.current = { total: 0, count: 0 };
    listenStartedAtRef.current = Date.now();
    activeSpeechPerfRef.current = {
      speechStart: null,
      firstPartialSTT: null,
      lastPartialSTT: null,
      speechEnd: null
    };

    let browserSttAlive = false;
    let sttFatalError = false;
    let backupCaptureStarted = false;

    isListeningRef.current = true;
    setIsListening(true);
    setLiveFinalText('');
    setLiveInterimText('');
    setOrbState('listening');
    setLifecyclePhase('PHASE_02_LISTENING');

    const DANGLING_PAUSE_WORDS =
      /\b(and|but|because|so|or|to|the|a|an|my|your|our|his|her|their|this|that|in|on|at|with|about|for|if|when|while|although|thinking|wondering|planning|trying|going|wanting|talking|was|were|am|is|are|have|has|had|will|would|can|could|should|um|uh|well|like)\s*$/i;

    const pulseOrbForSoloStt = (level: number) => {
      if (!usePureSoloBrowserStt || backupCaptureStarted) return;
      audioLevelRef.current = level;
      if (orbPulseDecayTimerRef.current) clearTimeout(orbPulseDecayTimerRef.current);
      orbPulseDecayTimerRef.current = setTimeout(() => {
        if (isListeningRef.current && usePureSoloBrowserStt && !backupCaptureStarted) {
          audioLevelRef.current = 12;
        }
      }, 280);
    };

    const scheduleSmartVadCommit = () => {
      if (vadPauseTimerRef.current) clearTimeout(vadPauseTimerRef.current);
      if (!continuousModeRef.current || !isListeningRef.current) return;
      const preview = getCombinedLiveTranscript();
      if (!preview) return;
      const wordCount = preview.split(/\s+/).filter(Boolean).length;
      // Learner-friendly pause budgets (~1.75s normal / ~2.45s on incomplete clauses or <3 words)
      // so ESL speakers can breathe and think without getting cut off mid-sentence!
      const waitMs =
        DANGLING_PAUSE_WORDS.test(preview) || wordCount < 3 ? 2450 : 1750;
      vadPauseTimerRef.current = setTimeout(() => {
        if (!isListeningRef.current) return;
        activeSpeechPerfRef.current.speechEnd = nowPerf();
        void finalizeCapturedTurn('vad');
      }, waitMs);
    };

    // Helper: starts clean WebAudio 16kHz PCM + MediaRecorder capture (used in 'gemini-cloud' mode,
    // or as automatic fallback if browser SpeechRecognition is unavailable / blocked by network).
    const startWebAudioCapture = async (enable16kPcm: boolean) => {
      if (backupCaptureStarted || !isListeningRef.current) return;
      backupCaptureStarted = true;
      try {
        const stream = await acquireWarmMicStream();
        if (!isListeningRef.current) return;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            void ctx.resume().catch(() => {});
          }
          audioCtxRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);

          if (enable16kPcm) {
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
                if (speculativeSttAbortRef.current) {
                  try { speculativeSttAbortRef.current.abort(); } catch {}
                  speculativeSttAbortRef.current = null;
                  speculativeSttPromiseRef.current = null;
                }
                if (activeSpeechPerfRef.current.speechStart === null) {
                  activeSpeechPerfRef.current.speechStart = Math.max(0, nowPerf() - 90);
                }
                activeSpeechMs += dt;
                if (activeSpeechMs >= 220) {
                  hasSpokenInTurn = true;
                }
                silenceStartedAt = 0;

                const sinceSpeechStart =
                  nowPerf() - (activeSpeechPerfRef.current.speechStart ?? nowPerf());
                if (
                  enable16kPcm &&
                  !browserSttAlive &&
                  hasSpokenInTurn &&
                  sinceSpeechStart >= 350 &&
                  nowPerf() - lastRollingSentAt >= 950
                ) {
                  triggerRollingLivePartial();
                }
              } else if (hasSpokenInTurn && level <= silenceThreshold) {
                if (!silenceStartedAt) {
                  silenceStartedAt = now;
                  activeSpeechPerfRef.current.speechEnd = nowPerf();
                } else if (continuousModeRef.current && !browserSttAlive) {
                  // Only drive turn cutoff from acoustic volume when browser SpeechRecognition is NOT active
                  const silenceMs = now - silenceStartedAt;
                  if (
                    enable16kPcm &&
                    silenceMs >= 420 &&
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

                  const liveText = getCombinedLiveTranscript();
                  const silenceBudget =
                    liveText && DANGLING_PAUSE_WORDS.test(liveText) ? 2200 : 1550;
                  if (silenceMs >= silenceBudget) {
                    void finalizeCapturedTurn('vad');
                    return;
                  }
                }
              }
            }

            rafRef.current = requestAnimationFrame(tick);
          };
          rafRef.current = requestAnimationFrame(tick);
        }

        if (typeof MediaRecorder !== 'undefined') {
          try {
            const recorder = new MediaRecorder(stream);
            audioChunksRef.current = [];
            recorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            recorder.start(250);
            mediaRecorderRef.current = recorder;
          } catch {
            // Non-fatal on mobile WebViews where MediaRecorder codecs differ; 16kHz PCM capture still runs
          }
        }
      } catch (err: any) {
        if (!recognitionRef.current) {
          isListeningRef.current = false;
          setIsListening(false);
          setOrbState('error');
          setStatusNotice(err?.message || 'Microphone access denied.');
        }
      }
    };

    // 1. Start Live Browser SpeechRecognition (with automatic restart on `no-speech` & prefix locking)
    const launchRecognitionInstance = () => {
      if (!SpeechRecognition || !isListeningRef.current || sttFatalError) return;

      try {
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

        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 1;
        rec.lang = recognitionLangRef.current || 'en-GB';

        rec.onspeechstart = () => {
          if (activeSpeechPerfRef.current.speechStart === null) {
            activeSpeechPerfRef.current.speechStart = nowPerf();
          }
          pulseOrbForSoloStt(52);
        };

        rec.onresult = (event: any) => {
          if (!isListeningRef.current) return;
          browserSttAlive = true;
          lastSttActivityMsRef.current = Date.now();
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
              // Always use item[0] (Google's #1 contextual LM hypothesis) so interim confidence=0
              // never overrides the primary transcript with lower-ranked homophone alternatives!
              const primaryAlt = item[0];
              const txt = primaryAlt?.transcript || '';
              if (item.isFinal) {
                fin += txt + ' ';
                if (typeof primaryAlt?.confidence === 'number' && primaryAlt.confidence > 0) {
                  confidenceSumRef.current.total += primaryAlt.confidence;
                  confidenceSumRef.current.count += 1;
                  if (primaryAlt.confidence < 0.72) {
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

          const fullLockedFinal = [lockedTurnPrefixRef.current.trim(), fin.trim()]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          setLiveFinalText(fullLockedFinal);
          setLiveInterimText(inter.trim());
          pulseOrbForSoloStt(inter.trim() ? 66 : 44);
          scheduleSmartVadCommit();
        };

        rec.onerror = (e: any) => {
          if (!isListeningRef.current) return;
          if (e.error === 'no-speech' || e.error === 'aborted') {
            // Normal pause while learner thinks before/between sentences — `onend` will keep listening alive!
            return;
          }
          if (e.error === 'language-not-supported') {
            if (recognitionLangRef.current !== 'en-GB') {
              recognitionLangRef.current = 'en-GB';
              setRecognitionLang('en-GB');
              setStatusNotice('Switched accent profile to British English (en-GB) for browser compatibility.');
              return;
            }
          }
          if (e.error === 'not-allowed') {
            sttFatalError = true;
            if (!backupCaptureStarted) {
              isListeningRef.current = false;
              setIsListening(false);
              setOrbState('error');
              setStatusNotice('Microphone access blocked. Allow microphone permission in your browser bar.');
            }
            return;
          }
          if (e.error === 'audio-capture') {
            sttFatalError = true;
            if (!backupCaptureStarted) {
              isListeningRef.current = false;
              setIsListening(false);
              setOrbState('error');
              setStatusNotice('Could not access your default microphone. Check your mic or open Test Mic in Audio Settings.');
            }
            return;
          }
          if (e.error === 'network' || e.error === 'service-not-allowed') {
            sttFatalError = true;
            browserSttAlive = false;
            recognitionRef.current = null;
            const unavailableReason = getMicrophoneUnavailableReason();
            if (currentKeyForTurn && !unavailableReason) {
              setStatusNotice('Browser Live Speech unavailable on this network — using Gemini 16kHz Audio automatically.');
              void startWebAudioCapture(true);
            } else {
              isListeningRef.current = false;
              setIsListening(false);
              setOrbState('error');
              setStatusNotice(
                unavailableReason ||
                  'Browser Speech-to-Text hit a network/permission block. Connect a Gemini API key in Audio Settings or type below.'
              );
            }
            return;
          }
          browserSttAlive = false;
        };

        rec.onend = () => {
          if (!isListeningRef.current || sttFatalError || recognitionRef.current !== rec) return;

          // Lock any spoken words from this recognition burst into `lockedTurnPrefixRef`
          // BEFORE restarting so a mid-turn restart NEVER erases earlier words!
          const burstWords = [finalBufferRef.current.trim(), interimBufferRef.current.trim()]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          if (burstWords) {
            lockedTurnPrefixRef.current = [lockedTurnPrefixRef.current.trim(), burstWords]
              .filter(Boolean)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
            finalBufferRef.current = '';
            interimBufferRef.current = '';
            setLiveFinalText(lockedTurnPrefixRef.current);
            setLiveInterimText('');
          }

          const totalWordsSoFar = getCombinedLiveTranscript();
          const silentSinceLastWordMs =
            lastSttActivityMsRef.current > 0 ? Date.now() - lastSttActivityMsRef.current : 0;

          if (
            totalWordsSoFar.length > 0 &&
            continuousModeRef.current &&
            speechEngineRef.current === 'live-solo' &&
            silentSinceLastWordMs >= 1650 &&
            !DANGLING_PAUSE_WORDS.test(totalWordsSoFar)
          ) {
            void finalizeCapturedTurn('stt-end');
            return;
          }

          // Keep SpeechRecognition continuously alive (even after ~5s of pre-speech thinking silence!)
          if (sttRestartTimerRef.current) clearTimeout(sttRestartTimerRef.current);
          sttRestartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current && !sttFatalError) {
              launchRecognitionInstance();
            }
          }, 80);
        };

        rec.start();
        recognitionRef.current = rec;
      } catch {
        sttFatalError = true;
        if (currentKeyForTurn) {
          void startWebAudioCapture(true);
        } else {
          isListeningRef.current = false;
          setIsListening(false);
          setOrbState('error');
          setStatusNotice('Could not start browser Speech-to-Text. Check microphone permissions or connect a Gemini API key.');
        }
      }
    };

    if (SpeechRecognition) {
      launchRecognitionInstance();
    }

    // 2. Only open concurrent WebAudio/MediaRecorder when in 'gemini-cloud' mode (or when SpeechRecognition is unsupported)
    if (!usePureSoloBrowserStt) {
      await startWebAudioCapture(true);
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
        {/* 1. Frosted Glass Top Header */}
        <BuddyTopHeader
          hasBack={Boolean(onBack)}
          onBack={handleBackToApp}
          onOpenHistory={() => setIsHistoryOpen(true)}
          mode={mode}
          onChangeMode={(next) => {
            setMode(next);
            updateActiveSession(s => ({ ...s, mode: next }));
          }}
          personality={personality}
          onChangePersonality={(next) => {
            setPersonality(next);
            updateActiveSession(s => ({ ...s, personality: next }));
          }}
          intensity={intensity}
          onChangeIntensity={(next) => {
            setIntensity(next);
            updateActiveSession(s => ({ ...s, intensity: next }));
          }}
          explanationLangMode={explanationLangMode}
          onChangeExplanationLangMode={handleChangeExplanationLangMode}
          onNewChat={() => handleNewChat()}
          latestPerf={latestPerf}
          onOpenPerfModal={() => {
            setSystemModalInitialTab('perf');
            setIsSystemModalOpen(true);
          }}
          onOpenOrbLabModal={() => {
            setSystemModalInitialTab('orb');
            setIsSystemModalOpen(true);
          }}
          isAudioSettingsOpen={isAudioSettingsOpen}
          onToggleAudioSettings={() => setIsAudioSettingsOpen(prev => !prev)}
          engineLabel={engineLabel}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />

        {/* 2. Dropdown Audio & 3-Engine Voice Picker Sheet */}
        {isAudioSettingsOpen && (
          <BuddyAudioSettingsDrawer
            speechEngine={speechEngine}
            isListening={isListening}
            onSelectEngine={handleSelectEngine}
            recognitionLang={recognitionLang}
            onSelectAccent={handleSelectAccent}
            continuousMode={continuousMode}
            onToggleContinuousMode={() => setContinuousMode(prev => !prev)}
            onOpenMicDiagnostic={() => {
              setIsAudioSettingsOpen(false);
              setIsMicDiagnosticOpen(true);
            }}
            apiKey={apiKey}
            onOpenApiModal={() => {
              setIsAudioSettingsOpen(false);
              setIsApiModalOpen(true);
            }}
            buddyVoiceConfig={buddyVoiceConfig}
            onUpdateBuddyVoiceConfig={updateBuddyVoiceConfig}
            kokoroStatus={kokoroStatus}
            osVoiceOptions={osVoiceOptions}
            onTestSelectedVoice={handleTestSelectedVoice}
            voiceTestFeedback={voiceTestFeedback}
            onClearVoiceTestFeedback={() => setVoiceTestFeedback(null)}
          />
        )}

        {/* 3. Three-Column Workspace (Orb Sanctuary | Friend Chat | Coaching & Hub) */}
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
              <BuddyOrbSanctuaryColumn
                currentPersonalityCfg={currentPersonalityCfg}
                currentModeCfg={currentModeCfg}
                apiKey={apiKey}
                onOpenApiModal={() => setIsApiModalOpen(true)}
                buddyVoiceConfig={buddyVoiceConfig}
                onToggleAudioSettings={() => setIsAudioSettingsOpen(prev => !prev)}
                speechEngine={speechEngine}
                engineLabel={engineLabel}
                buddyMemory={buddyMemory}
                onOpenHubTab={() => setRightTab('hub')}
                orbState={orbState}
                currentOrbDesc={currentOrbDesc}
                audioLevelRef={audioLevelRef}
                isFullscreen={isFullscreen}
                onOrbOrMicClick={handleOrbOrMicClick}
                onOpenSystemModal={() => {
                  setSystemModalInitialTab('orb');
                  setIsSystemModalOpen(true);
                }}
                isListening={isListening}
                isBuddySpeaking={isBuddySpeaking}
                liveFinalText={liveFinalText}
                liveInterimText={liveInterimText}
                latestBuddyMessage={latestBuddyMessage}
                hasUserMessages={hasUserMessages}
                orbStatusSubtitle={orbStatusSubtitle}
                showSinhala={showSinhala}
                statusNotice={statusNotice}
                onClearStatusNotice={() => setStatusNotice(null)}
                voiceOutputEnabled={voiceOutputEnabled}
                onToggleVoiceOutput={() => {
                  if (voiceOutputEnabled) {
                    if (activeTtsQueueRef.current) {
                      try { activeTtsQueueRef.current.cancel(); } catch {}
                      activeTtsQueueRef.current = null;
                    }
                    stopSpeech();
                    setIsBuddySpeaking(false);
                  }
                  setVoiceOutputEnabled(prev => !prev);
                }}
                onPauseSession={() => {
                  stopAllAudioAndCapture();
                  setOrbState('sleeping');
                  setLifecyclePhase('PHASE_01_IDLE');
                }}
                onFocusKeyboardInput={() => {
                  setTimeout(() => typedInputRef.current?.focus(), 40);
                }}
              />

              <BuddyChatStreamColumn
                activeSession={activeSession}
                chatScrollRef={chatScrollRef}
                chatEndRef={chatEndRef}
                typedInputRef={typedInputRef}
                editingMsgId={editingMsgId}
                editingDraft={editingDraft}
                onChangeEditingDraft={setEditingDraft}
                onCancelEditing={() => {
                  setEditingMsgId(null);
                  setEditingDraft('');
                }}
                onSaveEditedTranscript={handleSaveEditedTranscript}
                onStartEditingMsg={(msgId, currentText) => {
                  setEditingMsgId(msgId);
                  setEditingDraft(currentText);
                }}
                streamingBuddyMsgId={streamingBuddyMsgId}
                focusedFeedbackId={focusedFeedbackId}
                onSelectFeedbackMsg={(msgId) => {
                  setSelectedFeedbackMsgId(msgId);
                  setRightTab('feedback');
                }}
                showRawForMsgId={showRawForMsgId}
                onToggleShowRaw={(msgId) =>
                  setShowRawForMsgId(prev => (prev === msgId ? null : msgId))
                }
                onSpeakBuddyAgain={(text) => speakBuddyMessage(text, false)}
                isListening={isListening}
                orbState={orbState}
                liveFinalText={liveFinalText}
                liveInterimText={liveInterimText}
                hasUserMessages={hasUserMessages}
                onStartTopicChat={(prompt) => handleNewChat(prompt)}
                typedInput={typedInput}
                onChangeTypedInput={setTypedInput}
                onSendTyped={handleSendTyped}
              />

              <BuddyCoachingRailColumn
                rightTab={rightTab}
                onChangeRightTab={setRightTab}
                totalFindings={totalFindings}
                analyzedUserTurns={analyzedUserTurns}
                focusedFeedbackId={focusedFeedbackId}
                lastUserMsgId={lastUserMsgId}
                onSelectFeedbackMsg={setSelectedFeedbackMsgId}
                showSinhala={showSinhala}
                explanationLangMode={explanationLangMode}
                recognitionLang={recognitionLang}
                categoryCountsMap={categoryCountsMap}
                savedVocabSet={savedVocabSet}
                onToggleMistakeLearned={handleToggleMistakeLearned}
                onRequestEditTurn={(msgId, currentText) => {
                  setEditingMsgId(msgId);
                  setEditingDraft(currentText);
                }}
                onSaveVocab={handleSaveVocabItem}
                onTryAgainComplete={handleTryAgainComplete}
                onBeforeStartTryAgain={() => {
                  stopAllAudioAndCapture();
                  setOrbState('idle');
                }}
                onInspectRule={handleTriggerDeepThinkingOrb}
                learningAnalytics={learningAnalytics}
                buddyMemory={buddyMemory}
                savedVocab={savedVocab}
                grammarLibrary={grammarLibrary}
                sessionsCount={sessions.length}
                latestFluency={latestFluency}
                recentPronunciationSpotlights={recentPronunciationSpotlights}
                onChangeExplanationLangMode={handleChangeExplanationLangMode}
                onPracticeCategory={handlePracticeRecurringCategory}
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
            </div>
          );
        })()}

        {/* 4. Slide-Over Conversation History Drawer */}
        <BuddyHistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          sessions={sessions}
          activeSessionId={activeSession?.id}
          onNewChat={() => handleNewChat()}
          onSelectSession={(sess) => {
            stopAllAudioAndCapture();
            setActiveSessionId(sess.id);
            setSelectedFeedbackMsgId(null);
            setPersonality(sess.personality);
            setMode(sess.mode);
            setIntensity(sess.intensity || 'gentle');
            setOrbState('idle');
            setIsHistoryOpen(false);
          }}
          onDeleteSession={handleDeleteSession}
          mode={mode}
          onChangeMode={(next) => {
            setMode(next);
            updateActiveSession(s => ({ ...s, mode: next }));
          }}
          personality={personality}
          onChangePersonality={(next) => {
            setPersonality(next);
            updateActiveSession(s => ({ ...s, personality: next }));
          }}
          intensity={intensity}
          onChangeIntensity={(next) => {
            setIntensity(next);
            updateActiveSession(s => ({ ...s, intensity: next }));
          }}
          explanationLangMode={explanationLangMode}
          onChangeExplanationLangMode={handleChangeExplanationLangMode}
        />
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
