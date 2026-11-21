import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  ArrowLeft,
  Clock,
  Award,
  Sparkles,
  CheckCircle2,
  Volume2,
  VolumeX,
  RotateCcw,
  Send,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Layers,
  BookOpen,
  MessageSquare,
  Shuffle,
  Info,
  Check,
  TrendingUp,
  Sliders,
  Target,
  Eye,
  EyeOff,
  HelpCircle,
  Compass,
  Headphones,
  Gauge,
  History,
  Flame
} from 'lucide-react';
import { CAMBRIDGE_SPEAKING_TESTS } from '../../data/speakingTests';
import type { SpeakingPartPrompt } from '../../types/tutor';
import type {
  SpeakingEvaluationReport,
  SpeakingTurn,
  SpeakingTopic,
  DiagnosticQuestion,
  DiagnosticAssessmentResult,
  ProgressSessionPoint
} from '../../types/speakingTutor';
import {
  RANDOM_SPEAKING_TOPICS,
  DIAGNOSTIC_QUESTIONS,
  evaluateSpokenTurnLocally,
  evaluateSpokenTurnWithGemini,
  evaluateDiagnosticSpokenTurn,
  loadDiagnosticProgress,
  saveDiagnosticProgress,
  punctuateSpokenTranscript,
  transcribeAudioBlobWithGemini
} from '../../utils/speakingEngine';
import { playSpeech, stopSpeech } from '../../utils/speech';
import { loadApiKey, loadModel, formatBand } from '../../utils/tutorEngine';
import { SpeakingInteractiveUpgradesSandbox } from './SpeakingInteractiveUpgradesSandbox';
import { SpeakingPerformanceCard } from './SpeakingPerformanceCard';
import { CueCardNotepad } from './CueCardNotepad';
import { ShadowingPlayer } from './ShadowingPlayer';
import { SpeakingHistoryModal } from './SpeakingHistoryModal';
import { VoiceTranscriptNotepad, type SttLiveStatus } from './VoiceTranscriptNotepad';
import { MicDiagnosticModal, type SpeechEngineMode } from './MicDiagnosticModal';
import {
  transcribeBlobWithWhisper,
  type WhisperModelId,
  type WhisperProgressUpdate
} from '../../utils/whisperClient';
import {
  saveSpeakingAttempt,
  listSpeakingAttempts,
  deleteSpeakingAttempt,
  clearAllSpeakingAttempts,
  type SavedSpeakingAttempt
} from '../../utils/speakingAudioHistory';

interface SpeakingTutorViewProps {
  showSinhala: boolean;
  onBackToHub?: () => void;
  initialTopicId?: string;
  apiKey?: string;
  selectedModel?: string;
  onOpenApiKeyModal?: () => void;
}

// Convert CAMBRIDGE_SPEAKING_TESTS to full SpeakingTopic structure
export const ALL_TOPICS: SpeakingTopic[] = [
  ...RANDOM_SPEAKING_TOPICS,
  ...CAMBRIDGE_SPEAKING_TESTS.map(c => ({
    id: c.id,
    part: c.part,
    topic: c.topic,
    category: c.id.startsWith('c1-') ? 'Cambridge 1 Official' : 'Cambridge 18 Official',
    introAudioText: `Welcome to Cambridge IELTS Speaking Part ${c.part}. Let's examine the topic: ${c.topic}. Here is your first question: ${c.questions[0]}`,
    questions: c.questions,
    cueCardPoints: c.cueCardPoints,
    sampleBand8Answer: c.sampleBand8Answer,
    examinerTips: c.examinerTips
  }))
];

export const findSpeakingTopicById = (id?: string): SpeakingTopic | undefined => {
  if (!id) return undefined;
  const exact = ALL_TOPICS.find(t => t.id === id);
  if (exact) return exact;

  const lower = id.toLowerCase();
  const partial = ALL_TOPICS.find(t => 
    t.id.toLowerCase() === lower ||
    t.id.toLowerCase().replace(/[^a-z0-9]/g, '') === lower.replace(/[^a-z0-9]/g, '')
  );
  if (partial) return partial;

  if (lower.includes('c1') || lower.includes('cambridge-1') || lower.includes('cambridge1')) {
    if (lower.includes('test1') || lower.includes('t1')) return ALL_TOPICS.find(t => t.id === 'c1-spk-test1');
    if (lower.includes('test2') || lower.includes('t2')) return ALL_TOPICS.find(t => t.id === 'c1-spk-test2');
    if (lower.includes('test3') || lower.includes('t3')) return ALL_TOPICS.find(t => t.id === 'c1-spk-test3');
    if (lower.includes('test4') || lower.includes('t4')) return ALL_TOPICS.find(t => t.id === 'c1-spk-test4');
  }

  if (lower.includes('18')) {
    if (lower.includes('part1') || lower.includes('hometown')) return ALL_TOPICS.find(t => t.id === 'sp-part1-hometown');
    if (lower.includes('part2') || lower.includes('festival') || lower.includes('celebration')) return ALL_TOPICS.find(t => t.id === 'sp-part2-cuecard-c18');
    if (lower.includes('part3') || lower.includes('culture')) return ALL_TOPICS.find(t => t.id === 'sp-part3-culture');
  }

  return undefined;
};

interface SpeakingErrorBoundaryProps {
  children: React.ReactNode;
}

interface SpeakingErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class SpeakingErrorBoundary extends React.Component<SpeakingErrorBoundaryProps, SpeakingErrorBoundaryState> {
  constructor(props: SpeakingErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SpeakingErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SpeakingTutor error caught by local boundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('ielts_speaking_adaptive_progress_v1');
    } catch {}
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-rose-200 rounded-3xl shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Speaking Tutor Session Refresh Required</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            A temporary layout sync occurred. Click below to clear temporary session cache and restart cleanly.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset Session Progress & Reload</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SpeakingTutorViewInner: React.FC<SpeakingTutorViewProps> = ({ 
  showSinhala, 
  onBackToHub,
  initialTopicId,
  apiKey: propApiKey,
  selectedModel: propModel,
  onOpenApiKeyModal
}) => {
  // Navigation Mode: 'roadmap' | 'cambridge' | 'random' | 'shadowing'
  const [activeMode, setActiveMode] = useState<'roadmap' | 'cambridge' | 'random' | 'shadowing'>(() => {
    return initialTopicId ? 'cambridge' : 'roadmap';
  });

  // Effective API config
  const effectiveApiKey = (propApiKey && propApiKey.trim()) || loadApiKey();
  const effectiveModel = (propModel && propModel.trim()) || loadModel();

  // Diagnostic Roadmap State
  const [diagnosticIndex, setDiagnosticIndex] = useState<number>(0);
  const currentDiagnosticQuestion = (DIAGNOSTIC_QUESTIONS && DIAGNOSTIC_QUESTIONS[diagnosticIndex])
    ? DIAGNOSTIC_QUESTIONS[diagnosticIndex]
    : DIAGNOSTIC_QUESTIONS[0];
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticAssessmentResult | null>(null);
  const [diagnosticReportTab, setDiagnosticReportTab] = useState<'corrections' | 'model' | 'task' | 'evidence'>('corrections');
  const [progressPoints, setProgressPoints] = useState<ProgressSessionPoint[]>(loadDiagnosticProgress);
  const [workingDecimalScore, setWorkingDecimalScore] = useState<number>(() => {
    const pts = loadDiagnosticProgress();
    const last = pts.length > 0 ? pts[pts.length - 1] : null;
    return (last && typeof last.internalDecimalScore === 'number' && !isNaN(last.internalDecimalScore))
      ? last.internalDecimalScore
      : 4.0;
  });

  const safeWorkingScore = (typeof workingDecimalScore === 'number' && !isNaN(workingDecimalScore))
    ? workingDecimalScore
    : 4.0;

  // Regular Practice Topic & Session State
  const [selectedTopic, setSelectedTopic] = useState<SpeakingTopic>(() => {
    if (initialTopicId) {
      const found = findSpeakingTopicById(initialTopicId);
      if (found) return found;
      const firstCambridge = ALL_TOPICS.find(t => !t.id.startsWith('rnd-'));
      if (firstCambridge) return firstCambridge;
    }
    return RANDOM_SPEAKING_TOPICS[0];
  });

  useEffect(() => {
    if (initialTopicId) {
      const found = findSpeakingTopicById(initialTopicId);
      if (found) {
        setSelectedTopic(found);
        setActiveMode(found.id.startsWith('rnd-') ? 'random' : 'cambridge');
        setCurrentQuestionIndex(0);
        setCurrentReport(null);
      }
    }
  }, [initialTopicId]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showModelAnswerPreview, setShowModelAnswerPreview] = useState<boolean>(false);

  // Audio & Speech Synthesis
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState<boolean>(false);
  const [isPlayingModelAnswer, setIsPlayingModelAnswer] = useState<boolean>(false);
  const [examinerAudioEnabled, setExaminerAudioEnabled] = useState<boolean>(true);

  // Recording & Transcription
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [userSpeechText, setUserSpeechText] = useState<string>('');
  const [speechInterim, setSpeechInterim] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [recognitionLang, setRecognitionLang] = useState<string>(() => {
    try {
      return localStorage.getItem('ielts_speaking_accent') || 'en-IN';
    } catch {
      return 'en-IN';
    }
  });
  const [speechEngine, setSpeechEngine] = useState<SpeechEngineMode>(() => {
    try {
      const saved = localStorage.getItem('ielts_speaking_stt_engine') as SpeechEngineMode | null;
      if (saved === 'whisper-local' || saved === 'live-solo' || saved === 'gemini-cloud') return saved;
      return 'live-solo';
    } catch {
      return 'live-solo';
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
  const [isMicDiagnosticOpen, setIsMicDiagnosticOpen] = useState<boolean>(false);
  const [whisperProgress, setWhisperProgress] = useState<WhisperProgressUpdate | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);

  // Part 2 Cue Card Prep Countdown
  const [prepTimeRemaining, setPrepTimeRemaining] = useState<number>(60);
  const [isPrepRunning, setIsPrepRunning] = useState<boolean>(false);

  // Regular Mode Evaluation & Stages (Stage 1 to 4)
  const [currentReport, setCurrentReport] = useState<SpeakingEvaluationReport | null>(null);
  const [activeStageTab, setActiveStageTab] = useState<'stage1' | 'stage2' | 'stage3' | 'stage4'>('stage1');
  const [turns, setTurns] = useState<SpeakingTurn[]>([]);

  // Refs for speech recognition & timers
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const prepTimerRef = useRef<any>(null);
  const restartTimeoutRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const isManuallyStoppedRef = useRef<boolean>(true);
  const userSpeechTextRef = useRef<string>('');
  const baseSpeechTextRef = useRef<string>('');
  const sessionFinalTextRef = useRef<string>('');
  const sessionInterimTextRef = useRef<string>('');

  // Audio stream, candidate playback, IndexedDB history & live visualizer refs
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingOwnAudio, setIsPlayingOwnAudio] = useState<boolean>(false);
  const [hesitationAlert, setHesitationAlert] = useState<boolean>(false);
  const [savedAttempts, setSavedAttempts] = useState<SavedSpeakingAttempt[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Mode 3: 60-Second Spontaneous Pressure Drill Arena State
  const [drillCountdown, setDrillCountdown] = useState<number | null>(null);
  const [isDrillActive, setIsDrillActive] = useState<boolean>(false);
  const [drillCompleted, setDrillCompleted] = useState<boolean>(false);
  const [drillHesitationCount, setDrillHesitationCount] = useState<number>(0);

  // Evaluation source & opt-in Deep Gemini AI state
  const [evaluationSource, setEvaluationSource] = useState<'local' | 'gemini'>('local');
  const [isDeepEvaluating, setIsDeepEvaluating] = useState<boolean>(false);

  // Live STT diagnostics, Solo-STT fallback, Undo & Gemini Audio-to-Text Rescue
  const [sttStatus, setSttStatus] = useState<SttLiveStatus>('idle');
  const [isTranscribingAudio, setIsTranscribingAudio] = useState<boolean>(false);
  const [hasAudioBlob, setHasAudioBlob] = useState<boolean>(false);
  const [canUndoBurst, setCanUndoBurst] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordedAudioBlobRef = useRef<Blob | null>(null);
  const ownAudioElRef = useRef<HTMLAudioElement | null>(null);
  const lastSpeechActivityRef = useRef<number>(Date.now());
  const prevHesitationAlertRef = useRef<boolean>(false);
  const drillCountdownTimerRef = useRef<any>(null);
  const softAudioTimeoutRef = useRef<any>(null);
  const recognitionLangRef = useRef<string>(recognitionLang);
  const audioLevelRef = useRef<number>(0);
  const sttHasProducedResultRef = useRef<boolean>(false);
  const micVoiceSecondsRef = useRef<number>(0);
  const soloSttModeRef = useRef<boolean>(false);
  const autoTranscribePendingRef = useRef<boolean>(false);
  const previousTranscriptRef = useRef<string>('');

  const speechEngineRef = useRef<SpeechEngineMode>(speechEngine);
  const whisperModelRef = useRef<WhisperModelId>(whisperModel);
  const selectedMicDeviceIdRef = useRef<string>(selectedMicDeviceId);

  useEffect(() => {
    recognitionLangRef.current = recognitionLang;
  }, [recognitionLang]);

  useEffect(() => {
    speechEngineRef.current = speechEngine;
  }, [speechEngine]);

  useEffect(() => {
    whisperModelRef.current = whisperModel;
  }, [whisperModel]);

  useEffect(() => {
    selectedMicDeviceIdRef.current = selectedMicDeviceId;
  }, [selectedMicDeviceId]);

  const handleSelectSpeechEngine = (engine: SpeechEngineMode) => {
    speechEngineRef.current = engine;
    setSpeechEngine(engine);
    setMicError(null);
    setWhisperProgress(null);
    try {
      localStorage.setItem('ielts_speaking_stt_engine', engine);
    } catch {}
  };

  const handleSelectWhisperModel = (model: WhisperModelId) => {
    whisperModelRef.current = model;
    setWhisperModel(model);
    try {
      localStorage.setItem('ielts_speaking_whisper_model', model);
    } catch {}
  };

  const handleSelectMicDeviceId = (deviceId: string) => {
    selectedMicDeviceIdRef.current = deviceId;
    setSelectedMicDeviceId(deviceId);
    try {
      localStorage.setItem('ielts_speaking_mic_device_id', deviceId);
    } catch {}
  };

  // Load saved speaking attempts from IndexedDB on mount
  useEffect(() => {
    listSpeakingAttempts().then(setSavedAttempts).catch(() => {});
  }, []);

  // Track hesitation transitions during active spontaneous drill
  useEffect(() => {
    if (isDrillActive && hesitationAlert && !prevHesitationAlertRef.current) {
      setDrillHesitationCount(c => c + 1);
    }
    prevHesitationAlertRef.current = hesitationAlert;
  }, [hesitationAlert, isDrillActive]);

  // Auto-finish 60s spontaneous pressure drill when recordSeconds hits 60
  useEffect(() => {
    if (isDrillActive && isRecording && recordSeconds >= 60) {
      setIsDrillActive(false);
      setDrillCompleted(true);
      handleStopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordSeconds, isDrillActive, isRecording]);

  const clearRecordedAudio = () => {
    if (ownAudioElRef.current) {
      ownAudioElRef.current.pause();
      ownAudioElRef.current = null;
    }
    recordedAudioBlobRef.current = null;
    setHasAudioBlob(false);
    setIsPlayingOwnAudio(false);
    setRecordedAudioUrl(prev => {
      if (prev) {
        try {
          URL.revokeObjectURL(prev);
        } catch {}
      }
      return null;
    });
  };

  const handleTogglePlayOwnAudio = () => {
    if (!recordedAudioUrl) return;
    if (isPlayingOwnAudio && ownAudioElRef.current) {
      ownAudioElRef.current.pause();
      setIsPlayingOwnAudio(false);
      return;
    }
    stopSpeech();
    setIsExaminerSpeaking(false);
    setIsPlayingModelAnswer(false);
    if (ownAudioElRef.current) {
      ownAudioElRef.current.pause();
    }
    const audio = new Audio(recordedAudioUrl);
    ownAudioElRef.current = audio;
    setIsPlayingOwnAudio(true);
    audio.onended = () => setIsPlayingOwnAudio(false);
    audio.onerror = () => setIsPlayingOwnAudio(false);
    audio.play().catch(() => setIsPlayingOwnAudio(false));
  };

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    userSpeechTextRef.current = userSpeechText;
  }, [userSpeechText]);

  // Clean audio visualizer resources
  const stopAudioVisualizer = (keepStreamForRecorder = false) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (!keepStreamForRecorder && mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      } catch {}
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    setHesitationAlert(false);
  };

  // Check speech recognition capability
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSpeechSupported(!!SpeechRecognition);
  }, []);

  // Clean audio and timers on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      stopAudioVisualizer(false);
      if (ownAudioElRef.current) {
        ownAudioElRef.current.pause();
        ownAudioElRef.current = null;
      }
      setIsExaminerSpeaking(false);
      setIsPlayingModelAnswer(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (drillCountdownTimerRef.current) clearInterval(drillCountdownTimerRef.current);
      if (softAudioTimeoutRef.current) clearTimeout(softAudioTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // Timer, live hesitation detector & stalled-STT watchdog while recording
  useEffect(() => {
    if (isRecording) {
      lastSpeechActivityRef.current = Date.now();
      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds(prev => {
          const next = prev + 1;
          const silentMs = Date.now() - lastSpeechActivityRef.current;
          setHesitationAlert(next >= 3 && silentMs >= 3500);

          // Watchdog: if mic clearly hears voice for >= 4s but browser STT has 0 words, flag stalled status
          if (audioLevelRef.current > 12 && !sttHasProducedResultRef.current) {
            micVoiceSecondsRef.current += 1;
            if (micVoiceSecondsRef.current >= 4) {
              setSttStatus(curr => (curr === 'listening' || curr === 'starting' ? 'stalled' : curr));
            }
          }
          return next;
        });
      }, 1000);
    } else {
      setHesitationAlert(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Prep timer for Part 2
  useEffect(() => {
    if (isPrepRunning && prepTimeRemaining > 0) {
      prepTimerRef.current = setInterval(() => {
        setPrepTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPrepRunning(false);
            if (examinerAudioEnabled) {
              setIsExaminerSpeaking(true);
              playSpeech("Your one minute preparation time is up. Please begin speaking now.", {
                rate: 0.95,
                onStart: () => setIsExaminerSpeaking(true),
                onEnd: () => setIsExaminerSpeaking(false),
                onError: () => setIsExaminerSpeaking(false)
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    }
    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, [isPrepRunning, prepTimeRemaining, examinerAudioEnabled]);

  const activeQuestion = (selectedTopic.questions && selectedTopic.questions[currentQuestionIndex])
    ? selectedTopic.questions[currentQuestionIndex]
    : selectedTopic.questions[0] || 'Tell me about yourself.';

  // Play question audio for the candidate
  const speakExaminerQuestion = (text: string) => {
    if (isRecording) return;
    if (isExaminerSpeaking) {
      stopSpeech();
      setIsExaminerSpeaking(false);
      return;
    }
    stopSpeech();
    setIsPlayingModelAnswer(false);
    setIsExaminerSpeaking(true);

    playSpeech(text, {
      rate: 0.93,
      onStart: () => setIsExaminerSpeaking(true),
      onEnd: () => setIsExaminerSpeaking(false),
      onError: () => setIsExaminerSpeaking(false)
    });
  };

  const handleToggleQuestionAudio = () => {
    const qText = activeMode === 'roadmap'
      ? `Question ${currentDiagnosticQuestion.number} of 3: ${currentDiagnosticQuestion.question}`
      : `Question ${currentQuestionIndex + 1}: ${activeQuestion}`;
    speakExaminerQuestion(qText);
  };

  // Format live spoken chunks while protecting legitimate noun phrases (e.g. "period of time")
  const formatLiveSpokenChunk = (str: string): string => {
    if (!str) return '';
    const protectedPhrases: string[] = [];
    let s = str.replace(
      /\b(?:(?:a|an|the|this|that|long|short|time|brief|extended|certain|entire|given|study|exam|trial|grace|notice|probation)\s+period|period\s+(?:of|in|for|over|between|from|after|before|during))\b/gi,
      (match) => {
        const placeholder = `___PROT_PERIOD_${protectedPhrases.length}___`;
        protectedPhrases.push(match);
        return placeholder;
      }
    );

    s = s.replace(/\s*\bfull\s*stop\b\s*/gi, '. ');
    s = s.replace(/\s*\bperiod\b\s*/gi, '. ');
    s = s.replace(/\s*\bquestion\s*mark\b\s*/gi, '? ');
    s = s.replace(/\s*\b(?:exclamation\s*mark|exclamation\s*point)\b\s*/gi, '! ');
    s = s.replace(/([a-zA-Z0-9])\s+\bdot\b\s+([a-zA-Z0-9])/gi, '$1. $2');
    s = s.replace(/\s*\bcomma\b\s*(?!separated|delimited)/gi, ', ');

    protectedPhrases.forEach((orig, idx) => {
      s = s.replace(`___PROT_PERIOD_${idx}___`, orig);
    });

    s = s.replace(/\s+([,.?!])/g, '$1');
    s = s.replace(/([,.?!])(?=[A-Za-z])/g, '$1 ');
    return s;
  };

  // Local OpenAI Whisper Neural Transcription (100% Free, Multi-Accent, Native Punctuation)
  const handleTranscribeWithWhisper = async (blobOverride?: Blob | null) => {
    const targetBlob = blobOverride || recordedAudioBlobRef.current;
    if (!targetBlob || targetBlob.size === 0) {
      setMicError('No recorded audio clip found yet. Click Start Speaking, speak aloud, and click Stop first.');
      return;
    }

    setIsTranscribingAudio(true);
    setSttStatus('transcribing');
    setMicError(null);
    setWhisperProgress({ status: 'loading', message: 'Preparing Whisper neural engine...' });

    try {
      const result = await transcribeBlobWithWhisper(targetBlob, {
        model: whisperModelRef.current,
        onProgress: (upd) => setWhisperProgress(upd)
      });

      if (result.text && result.text.trim()) {
        const merged = [baseSpeechTextRef.current.trim(), result.text.trim()]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        const formatted = punctuateSpokenTranscript(merged);
        setUserSpeechText(formatted);
        baseSpeechTextRef.current = formatted;
        userSpeechTextRef.current = formatted;
        setCanUndoBurst(true);
        setSttStatus('idle');
      } else {
        setMicError('Whisper AI listened to the audio clip but did not detect clear speech. Click "Play My Voice" or "Test Mic" to check your microphone input level.');
        setSttStatus('error');
      }
    } catch (err: any) {
      console.warn('Whisper local transcription error:', err);
      setMicError(err?.message || 'Whisper local transcription encountered an error. You can retry or switch engines.');
      setSttStatus('error');
    } finally {
      setIsTranscribingAudio(false);
      setTimeout(() => setWhisperProgress(null), 1500);
    }
  };

  // Gemini Multimodal Audio-to-Text Transcription (Cloud Pro)
  const handleTranscribeRecordedAudio = async (blobOverride?: Blob | null) => {
    const targetBlob = blobOverride || recordedAudioBlobRef.current;
    if (!targetBlob || targetBlob.size === 0) {
      setMicError('No recorded audio clip found yet. Click Start Speaking, speak aloud, and click Stop first.');
      return;
    }
    if (!effectiveApiKey) {
      setMicError('Connect a Gemini API key for Gemini Audio AI, or switch to Whisper AI (100% Free Local).');
      if (onOpenApiKeyModal) onOpenApiKeyModal();
      return;
    }

    setIsTranscribingAudio(true);
    setSttStatus('transcribing');
    setMicError(null);
    try {
      const transcribed = await transcribeAudioBlobWithGemini(
        effectiveApiKey,
        effectiveModel,
        targetBlob,
        recognitionLangRef.current
      );
      if (transcribed && transcribed.trim()) {
        const merged = [baseSpeechTextRef.current.trim(), transcribed.trim()]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        const formatted = punctuateSpokenTranscript(merged);
        setUserSpeechText(formatted);
        baseSpeechTextRef.current = formatted;
        userSpeechTextRef.current = formatted;
        setCanUndoBurst(true);
        setSttStatus('idle');
      } else {
        setMicError('Gemini listened to the audio clip but did not detect clear speech. Click "Play My Voice" to verify your microphone.');
        setSttStatus('error');
      }
    } catch (err: any) {
      console.warn('Gemini audio transcription error:', err);
      setMicError(err?.message || 'Could not transcribe audio via Gemini AI. Try Whisper AI Local (Free) instead.');
      setSttStatus('error');
    } finally {
      setIsTranscribingAudio(false);
    }
  };

  // Engine 2: PURE SOLO Web Speech API (ZERO concurrent getUserMedia/MediaRecorder — eliminates Windows APO distortion!)
  const startRecognitionSession = () => {
    if (isManuallyStoppedRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      isManuallyStoppedRef.current = true;
      isRecordingRef.current = false;
      setIsRecording(false);
      setSttStatus('error');
      setMicError('Browser Web Speech API is not supported here. Switch to "Whisper AI" above for free high-accuracy offline transcription!');
      return;
    }

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

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      recognition.lang = recognitionLangRef.current || 'en-IN';

      recognition.onstart = () => {
        if (!isManuallyStoppedRef.current) {
          setSttStatus('solo-stt');
        }
      };

      recognition.onresult = (event: any) => {
        let sessionFinalTranscript = '';
        let sessionInterimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item && item.length > 0) {
            // Select the highest-confidence non-empty alternative
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
            const transcript = bestAlt?.transcript || '';
            if (item.isFinal) {
              sessionFinalTranscript += transcript + ' ';
            } else {
              sessionInterimTranscript += transcript;
            }
          }
        }

        sttHasProducedResultRef.current = true;
        micVoiceSecondsRef.current = 0;
        lastSpeechActivityRef.current = Date.now();
        setSttStatus('streaming');
        setMicError(null);

        sessionFinalTextRef.current = sessionFinalTranscript;
        sessionInterimTextRef.current = sessionInterimTranscript;

        const cleanFinal = formatLiveSpokenChunk(sessionFinalTranscript).trim();
        const cleanInterim = sessionInterimTranscript.trim();
        const base = baseSpeechTextRef.current.trim();

        const liveFull = [base, cleanFinal, cleanInterim]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        setUserSpeechText(liveFull);
        userSpeechTextRef.current = liveFull;
        setSpeechInterim(cleanInterim);
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          isManuallyStoppedRef.current = true;
          isRecordingRef.current = false;
          setIsRecording(false);
          setSttStatus('error');
          setMicError('Microphone permission was denied. Please allow microphone access in your browser address bar.');
        } else if (e.error === 'audio-capture') {
          isManuallyStoppedRef.current = true;
          isRecordingRef.current = false;
          setIsRecording(false);
          setSttStatus('error');
          setMicError('Browser could not open your default microphone. Click "Test Mic" or switch to "Whisper AI" to pick a specific mic device.');
        } else if (e.error === 'network') {
          isManuallyStoppedRef.current = true;
          isRecordingRef.current = false;
          setIsRecording(false);
          setSttStatus('error');
          setMicError('Browser Speech-to-Text hit a network block (common on Brave/VPN/offline). Switch to "Whisper AI" above for 100% free local transcription!');
        } else if (e.error === 'language-not-supported') {
          if (recognitionLangRef.current !== 'en-US') {
            recognitionLangRef.current = 'en-US';
            setRecognitionLang('en-US');
            setMicError('Selected dialect not supported by browser — switched to en-US automatically.');
          }
        } else if (e.error === 'no-speech') {
          // Normal pause between sentences
        } else if (e.error !== 'aborted') {
          console.warn('Speech recognition status:', e.error);
          setSttStatus('error');
          setMicError(`Browser STT notice (${e.error}). For highest accuracy, switch to "Whisper AI" above.`);
        }
      };

      recognition.onend = () => {
        if (!isManuallyStoppedRef.current && isRecordingRef.current && speechEngineRef.current === 'live-solo') {
          const lockedSoFar = [
            baseSpeechTextRef.current.trim(),
            formatLiveSpokenChunk(sessionFinalTextRef.current).trim(),
            sessionInterimTextRef.current.trim()
          ]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          baseSpeechTextRef.current = lockedSoFar;
          userSpeechTextRef.current = lockedSoFar;
          sessionFinalTextRef.current = '';
          sessionInterimTextRef.current = '';
          setSpeechInterim('');

          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (!isManuallyStoppedRef.current && isRecordingRef.current && speechEngineRef.current === 'live-solo') {
              startRecognitionSession();
            }
          }, 90);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Could not launch recognition session:', err);
      if (!isManuallyStoppedRef.current && isRecordingRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (!isManuallyStoppedRef.current && isRecordingRef.current) {
            startRecognitionSession();
          }
        }, 300);
      }
    }
  };

  // Engines 1 & 3: Single Clean Raw Audio Capture (Whisper AI Local / Gemini Cloud) — ZERO Windows APO Distortion!
  const startCleanAudioCapture = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone recording is not available in this browser.');
      }

      // Disable aggressive Windows echoCancellation/noiseSuppression APOs so neural ASR receives clean speech
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true
      };
      if (selectedMicDeviceIdRef.current) {
        audioConstraints.deviceId = { exact: selectedMicDeviceIdRef.current };
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      } catch {
        // Fallback to default device if saved deviceId was unplugged
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true }
        });
      }

      if (isManuallyStoppedRef.current || !isRecordingRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      mediaStreamRef.current = stream;
      setSttStatus('recording-clean');

      if (typeof MediaRecorder === 'undefined') {
        throw new Error('MediaRecorder is unavailable in this browser. Switch to Pure Live STT.');
      }

      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        let finalBlob: Blob | null = null;
        if (recordedChunksRef.current.length > 0) {
          finalBlob = new Blob(recordedChunksRef.current, {
            type: recorder.mimeType || 'audio/webm'
          });
          recordedAudioBlobRef.current = finalBlob;
          setHasAudioBlob(true);
          const url = URL.createObjectURL(finalBlob);
          setRecordedAudioUrl(prev => {
            if (prev) {
              try {
                URL.revokeObjectURL(prev);
              } catch {}
            }
            return url;
          });
        }
        if (mediaStreamRef.current) {
          try {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
          } catch {}
          mediaStreamRef.current = null;
        }
        mediaRecorderRef.current = null;

        // Immediately run chosen neural transcription engine on the crisp audio clip!
        if (finalBlob && autoTranscribePendingRef.current) {
          autoTranscribePendingRef.current = false;
          if (speechEngineRef.current === 'whisper-local') {
            handleTranscribeWithWhisper(finalBlob);
          } else if (speechEngineRef.current === 'gemini-cloud') {
            handleTranscribeRecordedAudio(finalBlob);
          }
        } else {
          autoTranscribePendingRef.current = false;
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;

      // Live audio equalizer on the exact same single stream
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (!isRecordingRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          const level = Math.min(100, Math.round((avg / 128) * 100));
          audioLevelRef.current = level;
          setAudioLevel(level);
          if (level > 12) {
            lastSpeechActivityRef.current = Date.now();
          }
          animFrameRef.current = requestAnimationFrame(updateLevel);
        };
        animFrameRef.current = requestAnimationFrame(updateLevel);
      }
    } catch (micErr: any) {
      isManuallyStoppedRef.current = true;
      isRecordingRef.current = false;
      setIsRecording(false);
      setSttStatus('error');
      setMicError(micErr?.message || 'Microphone access denied. Check browser permissions or click "Test Mic".');
      stopAudioVisualizer(false);
    }
  };

  // Zero-Conflict Recording Starter: STRICTLY launches ONE engine at a time!
  const handleStartRecording = () => {
    setMicError(null);
    setWhisperProgress(null);
    stopSpeech();
    setIsExaminerSpeaking(false);
    setIsPlayingModelAnswer(false);

    if (speechEngineRef.current === 'gemini-cloud' && !effectiveApiKey) {
      setMicError('Please connect your Gemini API key first, or click "Whisper AI" for 100% free local neural transcription.');
      if (onOpenApiKeyModal) onOpenApiKeyModal();
      return;
    }

    previousTranscriptRef.current = userSpeechText.trim();
    isManuallyStoppedRef.current = false;
    isRecordingRef.current = true;
    sttHasProducedResultRef.current = false;
    micVoiceSecondsRef.current = 0;
    autoTranscribePendingRef.current = false;
    audioLevelRef.current = 0;

    baseSpeechTextRef.current = userSpeechText.trim();
    userSpeechTextRef.current = userSpeechText.trim();
    sessionFinalTextRef.current = '';
    sessionInterimTextRef.current = '';
    setIsRecording(true);
    setSpeechInterim('');
    setSttStatus('starting');
    clearRecordedAudio();
    lastSpeechActivityRef.current = Date.now();

    if (speechEngineRef.current === 'live-solo') {
      // Pure Solo Browser STT — NEVER runs getUserMedia/MediaRecorder alongside!
      startRecognitionSession();
    } else {
      // Whisper AI Local OR Gemini Cloud — Single Clean Raw Audio Stream!
      startCleanAudioCapture();
    }
  };

  // Stop Live Microphone
  const handleStopRecording = () => {
    isManuallyStoppedRef.current = true;
    isRecordingRef.current = false;
    setIsRecording(false);

    if (softAudioTimeoutRef.current) {
      clearTimeout(softAudioTimeoutRef.current);
      softAudioTimeoutRef.current = null;
    }

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    const hasActiveRecorder =
      mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive';

    if (speechEngineRef.current === 'whisper-local' || speechEngineRef.current === 'gemini-cloud') {
      if (hasActiveRecorder && mediaRecorderRef.current) {
        autoTranscribePendingRef.current = true;
        setSttStatus('transcribing');
        stopAudioVisualizer(true);
        try {
          mediaRecorderRef.current.stop();
        } catch {
          autoTranscribePendingRef.current = false;
          stopAudioVisualizer(false);
        }
      } else {
        setSttStatus('idle');
        stopAudioVisualizer(false);
      }
      return;
    }

    // Pure Live Solo STT finalization
    const fullSpokenRaw = [
      baseSpeechTextRef.current.trim(),
      sessionFinalTextRef.current.trim(),
      sessionInterimTextRef.current.trim()
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    sessionFinalTextRef.current = '';
    sessionInterimTextRef.current = '';

    const textToFormat = fullSpokenRaw || userSpeechTextRef.current.trim();
    const formatted = punctuateSpokenTranscript(textToFormat);
    setUserSpeechText(formatted);
    baseSpeechTextRef.current = formatted;
    userSpeechTextRef.current = formatted;
    setSpeechInterim('');

    const gotNewText = formatted.trim().length > previousTranscriptRef.current.trim().length;
    if (gotNewText) {
      setCanUndoBurst(true);
      setSttStatus('idle');
    } else {
      setSttStatus('idle');
      setMicError('Pure Live Browser STT did not detect words. Try switching accent to "en-IN" (South Asian), click "Test Mic", or switch to "Whisper AI" for guaranteed accuracy!');
    }
    stopAudioVisualizer(false);
  };

  // Undo last spoken recording burst
  const handleUndoLastBurst = () => {
    const prev = previousTranscriptRef.current;
    setUserSpeechText(prev);
    baseSpeechTextRef.current = prev;
    userSpeechTextRef.current = prev;
    sessionFinalTextRef.current = '';
    sessionInterimTextRef.current = '';
    setSpeechInterim('');
    setCanUndoBurst(false);
  };

  // Clear transcript + audio
  const handleClearTranscript = () => {
    previousTranscriptRef.current = '';
    setCanUndoBurst(false);
    setUserSpeechText('');
    baseSpeechTextRef.current = '';
    userSpeechTextRef.current = '';
    sessionFinalTextRef.current = '';
    sessionInterimTextRef.current = '';
    setSpeechInterim('');
    setRecordSeconds(0);
    setSttStatus('idle');
    setMicError(null);
    clearRecordedAudio();
  };

  // Auto-punctuate trigger
  const handleAutoPunctuate = () => {
    const raw = (userSpeechTextRef.current || userSpeechText).trim();
    if (!raw) return;
    const formatted = punctuateSpokenTranscript(raw);
    setUserSpeechText(formatted);
    baseSpeechTextRef.current = formatted;
    userSpeechTextRef.current = formatted;
    setSpeechInterim('');
  };

  // Accent change handler with localStorage persistence and live mic dialect switch
  const handleAccentChange = (newLang: string) => {
    recognitionLangRef.current = newLang;
    setRecognitionLang(newLang);
    try {
      localStorage.setItem('ielts_speaking_accent', newLang);
    } catch {}
    if (isRecordingRef.current && recognitionRef.current) {
      // Restart recognition session cleanly with new dialect
      startRecognitionSession();
    }
  };

  // Smart User Typing handler: converts double-space after a word to '. '
  const handleUserTextChange = (val: string) => {
    const smartVal = val.replace(/([a-zA-Z0-9]) {2}/g, '$1. ');
    setUserSpeechText(smartVal);
    baseSpeechTextRef.current = smartVal;
    userSpeechTextRef.current = smartVal;
    sessionFinalTextRef.current = '';
    sessionInterimTextRef.current = '';
  };

  // Submit Answer in Diagnostic Roadmap Mode
  const handleDiagnosticSubmit = () => {
    handleStopRecording();
    const raw = (userSpeechTextRef.current || userSpeechText).trim();
    if (!raw) return;

    const textToEvaluate = punctuateSpokenTranscript(raw);
    setUserSpeechText(textToEvaluate);
    baseSpeechTextRef.current = textToEvaluate;
    userSpeechTextRef.current = textToEvaluate;
    setIsEvaluating(true);

    try {
      const result = evaluateDiagnosticSpokenTurn(
        currentDiagnosticQuestion,
        textToEvaluate,
        safeWorkingScore,
        Math.max(recordSeconds, 20)
      );

      setDiagnosticResult(result);
      setDiagnosticReportTab('corrections');
      setWorkingDecimalScore(result.workingDecimalScore);

      const newPoint: ProgressSessionPoint = {
        id: `sess-${Date.now()}`,
        sessionNumber: progressPoints.length + 1,
        sessionLabel: `Question ${currentDiagnosticQuestion.number} (${currentDiagnosticQuestion.question.slice(0, 16)}...)`,
        internalDecimalScore: result.workingDecimalScore,
        officialBand: result.officialBandEstimate,
        completedTasks: result.microTasks.map(t => t.title),
        notes: result.microTasks[0]?.instruction || 'Completed diagnostic step'
      };

      const updated = [...progressPoints, newPoint];
      setProgressPoints(updated);
      saveDiagnosticProgress(updated);

      // Persist recorded audio & diagnostic attempt to local IndexedDB history
      const diagWords = textToEvaluate.split(/\s+/).filter(Boolean).length;
      const diagDur = Math.max(recordSeconds, 10);
      const diagAttempt: SavedSpeakingAttempt = {
        id: `att-${Date.now()}`,
        timestamp: Date.now(),
        mode: 'roadmap',
        topic: `Diagnostic Part 1 · Q${currentDiagnosticQuestion.number}`,
        question: currentDiagnosticQuestion.question,
        transcript: textToEvaluate,
        overallBand: result.officialBandEstimate,
        wpm: Math.round((diagWords / diagDur) * 60),
        durationSec: diagDur,
        wordCount: diagWords,
        audioBlob: recordedAudioBlobRef.current
      };
      saveSpeakingAttempt(diagAttempt)
        .then(() => listSpeakingAttempts())
        .then(setSavedAttempts)
        .catch(() => {});

      if (examinerAudioEnabled && result.whatYouDidWell[0]) {
        setIsExaminerSpeaking(true);
        playSpeech(
          `Good communicative effort. What you did well: ${result.whatYouDidWell[0]}. Here is your high impact improvement task.`,
          {
            rate: 0.95,
            onStart: () => setIsExaminerSpeaking(true),
            onEnd: () => setIsExaminerSpeaking(false),
            onError: () => setIsExaminerSpeaking(false)
          }
        );
      }
    } catch (err) {
      console.error('Error during diagnostic submit:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Retry with Micro-Task Applied
  const handleRetryDiagnosticWithTask = () => {
    stopSpeech();
    setIsExaminerSpeaking(false);
    setIsPlayingModelAnswer(false);
    setDiagnosticResult(null);
    setUserSpeechText('');
    setSpeechInterim('');
    baseSpeechTextRef.current = '';
    setRecordSeconds(0);
    setIsRecording(false);
  };

  // Proceed to Next Diagnostic Question
  const handleProceedNextDiagnosticQuestion = () => {
    stopSpeech();
    setIsExaminerSpeaking(false);
    setIsPlayingModelAnswer(false);
    setDiagnosticResult(null);
    setUserSpeechText('');
    setSpeechInterim('');
    baseSpeechTextRef.current = '';
    setRecordSeconds(0);
    setIsRecording(false);

    if (diagnosticIndex + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setDiagnosticIndex(prev => prev + 1);
    } else {
      // Completed diagnostic baseline! Switch to Cambridge tests
      const firstCambridge = ALL_TOPICS.find(t => !t.id.startsWith('rnd-')) || ALL_TOPICS[0];
      setActiveMode('cambridge');
      handleSelectTopic(firstCambridge);
    }
  };

  // Reset Diagnostic Progress
  const handleResetDiagnosticProgress = () => {
    stopSpeech();
    setIsExaminerSpeaking(false);
    setIsPlayingModelAnswer(false);
    try {
      localStorage.removeItem('ielts_speaking_adaptive_progress_v1');
    } catch {}
    setProgressPoints(loadDiagnosticProgress());
    setWorkingDecimalScore(4.0);
    setDiagnosticIndex(0);
    setDiagnosticResult(null);
    setUserSpeechText('');
    setSpeechInterim('');
  };

  // Regular Mode: Evaluate Speech
  const handleEvaluate = async () => {
    handleStopRecording();
    const raw = (userSpeechTextRef.current || userSpeechText).trim();
    if (!raw) return;

    const textToEvaluate = punctuateSpokenTranscript(raw);
    setUserSpeechText(textToEvaluate);
    baseSpeechTextRef.current = textToEvaluate;
    userSpeechTextRef.current = textToEvaluate;
    setIsEvaluating(true);

    try {
      let report: SpeakingEvaluationReport;

      if (effectiveApiKey) {
        try {
          report = await evaluateSpokenTurnWithGemini(
            effectiveApiKey,
            effectiveModel,
            activeQuestion,
            textToEvaluate,
            selectedTopic,
            recordSeconds
          );
          setEvaluationSource('gemini');
        } catch {
          report = evaluateSpokenTurnLocally(
            activeQuestion,
            textToEvaluate,
            selectedTopic,
            recordSeconds
          );
          setEvaluationSource('local');
        }
      } else {
        report = evaluateSpokenTurnLocally(
          activeQuestion,
          textToEvaluate,
          selectedTopic,
          recordSeconds
        );
        setEvaluationSource('local');
      }

      setCurrentReport(report);
      setActiveStageTab('stage1');
      setIsDrillActive(false);

      // Persist recording + score to IndexedDB History
      const turnWords = report.fluencyMetrics?.wordCount || textToEvaluate.split(/\s+/).filter(Boolean).length;
      const turnDur = Math.max(recordSeconds, 10);
      const savedAttempt: SavedSpeakingAttempt = {
        id: `att-${Date.now()}`,
        timestamp: Date.now(),
        mode: activeMode === 'random' ? 'random' : 'cambridge',
        topic: selectedTopic.topic,
        question: activeQuestion,
        transcript: textToEvaluate,
        overallBand: report.overallBand,
        wpm: report.fluencyMetrics?.wordsPerMinute || Math.round((turnWords / turnDur) * 60),
        durationSec: turnDur,
        wordCount: turnWords,
        audioBlob: recordedAudioBlobRef.current
      };
      saveSpeakingAttempt(savedAttempt)
        .then(() => listSpeakingAttempts())
        .then(setSavedAttempts)
        .catch(() => {});

      const candidateTurn: SpeakingTurn = {
        id: `turn-${Date.now()}`,
        role: 'candidate',
        text: textToEvaluate,
        timestamp: Date.now(),
        audioDurationSec: recordSeconds,
        report
      };
      setTurns(prev => [...prev, candidateTurn]);

      if (examinerAudioEnabled && report.examinerSpokenFeedback) {
        setIsExaminerSpeaking(true);
        playSpeech(report.examinerSpokenFeedback, {
          rate: 0.95,
          onStart: () => setIsExaminerSpeaking(true),
          onEnd: () => setIsExaminerSpeaking(false),
          onError: () => setIsExaminerSpeaking(false)
        });
      }
    } catch (err) {
      console.error('Error during spoken evaluation:', err);
      const fallbackReport = evaluateSpokenTurnLocally(
        activeQuestion,
        textToEvaluate,
        selectedTopic,
        recordSeconds
      );
      setCurrentReport(fallbackReport);
      setEvaluationSource('local');
      setActiveStageTab('stage1');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Opt-in Deep Gemini AI Re-Evaluation for current turn
  const handleRunDeepGeminiAnalysis = async () => {
    if (!effectiveApiKey) {
      if (onOpenApiKeyModal) onOpenApiKeyModal();
      return;
    }
    const textToEval = (currentReport?.spokenText || userSpeechTextRef.current || userSpeechText).trim();
    if (!textToEval) return;
    setIsDeepEvaluating(true);
    try {
      const deepReport = await evaluateSpokenTurnWithGemini(
        effectiveApiKey,
        effectiveModel,
        activeQuestion,
        textToEval,
        selectedTopic,
        Math.max(recordSeconds, 15)
      );
      setCurrentReport(deepReport);
      setEvaluationSource('gemini');
    } catch (err) {
      console.warn('Deep Gemini AI evaluation failed, retaining current report:', err);
    } finally {
      setIsDeepEvaluating(false);
    }
  };

  // Start 60-Second Spontaneous Pressure Drill with 5-second countdown
  const handleStartSpontaneousDrill = () => {
    if (drillCountdownTimerRef.current) {
      clearInterval(drillCountdownTimerRef.current);
      drillCountdownTimerRef.current = null;
    }
    stopSpeech();
    clearRecordedAudio();
    setUserSpeechText('');
    baseSpeechTextRef.current = '';
    userSpeechTextRef.current = '';
    sessionFinalTextRef.current = '';
    sessionInterimTextRef.current = '';
    setSpeechInterim('');
    setCurrentReport(null);
    setRecordSeconds(0);
    setDrillCompleted(false);
    setDrillHesitationCount(0);
    setIsDrillActive(false);

    let count = 5;
    setDrillCountdown(count);
    drillCountdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(drillCountdownTimerRef.current);
        drillCountdownTimerRef.current = null;
        setDrillCountdown(null);
        setIsDrillActive(true);
        handleStartRecording();
      } else {
        setDrillCountdown(count);
      }
    }, 1000);
  };

  const handleCancelSpontaneousDrill = () => {
    if (drillCountdownTimerRef.current) {
      clearInterval(drillCountdownTimerRef.current);
      drillCountdownTimerRef.current = null;
    }
    setDrillCountdown(null);
    setIsDrillActive(false);
    if (isRecordingRef.current) {
      handleStopRecording();
    }
  };

  // Navigate to Previous Question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      stopSpeech();
      clearRecordedAudio();
      setIsExaminerSpeaking(false);
      setIsPlayingModelAnswer(false);
      setUserSpeechText('');
      setSpeechInterim('');
      baseSpeechTextRef.current = '';
      setCurrentReport(null);
      setRecordSeconds(0);
      setIsRecording(false);
      setPrepTimeRemaining(60);
      setIsPrepRunning(false);
      setShowModelAnswerPreview(false);
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Navigate to Next Question in regular topic
  const handleNextQuestion = () => {
    stopSpeech();
    clearRecordedAudio();
    setIsExaminerSpeaking(false);
    setIsPlayingModelAnswer(false);
    setUserSpeechText('');
    setSpeechInterim('');
    baseSpeechTextRef.current = '';
    setCurrentReport(null);
    setRecordSeconds(0);
    setIsRecording(false);
    setPrepTimeRemaining(60);
    setIsPrepRunning(false);
    setShowModelAnswerPreview(false);

    if (currentQuestionIndex + 1 < selectedTopic.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handlePickRandomTopic();
    }
  };

  // Pick a Random Conversation Topic
  const handlePickRandomTopic = () => {
    stopSpeech();
    clearRecordedAudio();
    setIsExaminerSpeaking(false);
    setIsPlayingModelAnswer(false);
    setUserSpeechText('');
    setSpeechInterim('');
    baseSpeechTextRef.current = '';
    setCurrentReport(null);
    setRecordSeconds(0);
    setIsRecording(false);
    setPrepTimeRemaining(60);
    setIsPrepRunning(false);
    setShowModelAnswerPreview(false);

    const otherTopics = RANDOM_SPEAKING_TOPICS.filter(t => t.id !== selectedTopic.id);
    const randomChoice = otherTopics[Math.floor(Math.random() * otherTopics.length)] || RANDOM_SPEAKING_TOPICS[0];
    setSelectedTopic(randomChoice);
    setCurrentQuestionIndex(0);
    setActiveMode('random');
  };

  // Select Cambridge Test or Custom Topic
  const handleSelectTopic = (topic: SpeakingTopic) => {
    stopSpeech();
    clearRecordedAudio();
    setIsExaminerSpeaking(false);
    setIsPlayingModelAnswer(false);
    setUserSpeechText('');
    setSpeechInterim('');
    baseSpeechTextRef.current = '';
    setCurrentReport(null);
    setRecordSeconds(0);
    setIsRecording(false);
    setPrepTimeRemaining(60);
    setIsPrepRunning(false);
    setShowModelAnswerPreview(false);
    setSelectedTopic(topic);
    setCurrentQuestionIndex(0);
    setActiveMode(topic.id.startsWith('rnd-') ? 'random' : 'cambridge');
  };

  // Play Native Band 8.5 Model Spoken Answer
  const handlePlayModelAnswer = (textOverride?: string) => {
    if (isPlayingModelAnswer) {
      stopSpeech();
      setIsPlayingModelAnswer(false);
      return;
    }
    stopSpeech();
    setIsExaminerSpeaking(false);
    setIsPlayingModelAnswer(true);

    const textToSpeak = textOverride || currentReport?.band8ModelAnswer || selectedTopic.sampleBand8Answer;
    playSpeech(textToSpeak, {
      rate: 0.92,
      onStart: () => setIsPlayingModelAnswer(true),
      onEnd: () => setIsPlayingModelAnswer(false),
      onError: () => setIsPlayingModelAnswer(false)
    });
  };

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & STUDIO CONTROLS                                */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                setIsExaminerSpeaking(false);
                setIsPlayingModelAnswer(false);
                onBackToHub();
              }}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Return to Cambridge Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-2xs">
                <Target className="w-3 h-3 text-amber-300" />
                <span>IELTS Speaking Studio</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                Adaptive AI Examiner · Official Criteria
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
              {activeMode === 'roadmap' && 'Personalised Diagnostic Improvement Roadmap'}
              {activeMode === 'cambridge' && `Cambridge Official Speaking: ${selectedTopic.topic}`}
              {activeMode === 'random' && `Spontaneous Conversation: ${selectedTopic.topic}`}
              {activeMode === 'shadowing' && `Shadowing & Intonation Studio: ${selectedTopic.topic}`}
            </h1>
          </div>
        </div>

        {/* Studio Mode Selector & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            {/* Roadmap Tab */}
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                setIsExaminerSpeaking(false);
                setIsPlayingModelAnswer(false);
                setActiveMode('roadmap');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'roadmap'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Diagnostic Roadmap</span>
            </button>

            {/* Cambridge Tests Tab */}
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                setIsExaminerSpeaking(false);
                setIsPlayingModelAnswer(false);
                setActiveMode('cambridge');
                const firstCambridge = ALL_TOPICS.find(t => !t.id.startsWith('rnd-')) || ALL_TOPICS[0];
                handleSelectTopic(firstCambridge);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'cambridge'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cambridge Exams</span>
            </button>

            {/* Random Spontaneous Tab */}
            <button
              type="button"
              onClick={handlePickRandomTopic}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'random'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-500" />
              <span>Spontaneous</span>
            </button>

            {/* Shadowing & Intonation Studio Tab */}
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                setIsExaminerSpeaking(false);
                setIsPlayingModelAnswer(false);
                setActiveMode('shadowing');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'shadowing'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Shadowing</span>
            </button>
          </div>

          {/* Past Recordings & Progress History (IndexedDB) */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer"
            title="Replay past recorded sessions saved locally in your browser"
          >
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">History</span>
            {savedAttempts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-mono text-[10px] font-extrabold">
                {savedAttempts.length}
              </span>
            )}
          </button>

          {/* AI Settings Trigger */}
          {onOpenApiKeyModal && (
            <button
              type="button"
              onClick={onOpenApiKeyModal}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                effectiveApiKey
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
              title="Configure Google Gemini API key for certified examiner evaluation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">
                {effectiveApiKey ? `AI: ${effectiveModel || 'Gemini'}` : 'Connect Gemini AI'}
              </span>
            </button>
          )}

          {/* Examiner Voice Output Toggle */}
          <button
            type="button"
            onClick={() => {
              if (examinerAudioEnabled) stopSpeech();
              setIsExaminerSpeaking(false);
              setExaminerAudioEnabled(prev => !prev);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              examinerAudioEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Examiner spoken audio output"
          >
            {examinerAudioEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Voice: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Voice: MUTED</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. MODE: PERSONALISED ADAPTIVE DIAGNOSTIC ROADMAP             */}
      {/* ------------------------------------------------------------- */}
      {activeMode === 'roadmap' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Progress Timeline & Stepper Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 font-mono block">
                  Phase 1 · Evidence-Based Diagnostic Baseline
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  Question {currentDiagnosticQuestion.number} of {currentDiagnosticQuestion.total}: Initial Level Profiling
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Working baseline assumption: <strong className="text-amber-300">Band 4.0</strong>. We evaluate against official Cambridge criteria, identify high-impact slips, and track small decimal improvements.
                </p>
              </div>

              {/* Progress Decimal Score Gauge */}
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 shrink-0 font-mono">
                <div>
                  <span className="text-[9px] text-indigo-200 uppercase block font-sans">Current Progress</span>
                  <span className="text-2xl font-bold text-amber-400">{safeWorkingScore.toFixed(1)}</span>
                </div>
                <div className="h-7 w-px bg-white/20" />
                <div>
                  <span className="text-[9px] text-emerald-300 uppercase block font-sans">Next Milestone</span>
                  <span className="text-lg font-bold text-emerald-400">{(safeWorkingScore + 0.3).toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Stepper Dots & Reset Trigger */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 2, 3].map((stepNum) => {
                  const isCurrent = currentDiagnosticQuestion.number === stepNum;
                  const isDone = currentDiagnosticQuestion.number > stepNum;
                  return (
                    <button
                      type="button"
                      key={stepNum}
                      onClick={() => {
                        stopSpeech();
                        setIsExaminerSpeaking(false);
                        setIsPlayingModelAnswer(false);
                        setDiagnosticIndex(stepNum - 1);
                        setDiagnosticResult(null);
                        setUserSpeechText('');
                        setSpeechInterim('');
                        baseSpeechTextRef.current = '';
                        setRecordSeconds(0);
                        setIsRecording(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600 border-indigo-400 text-white font-bold'
                          : isDone
                          ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                      title={`Jump to Question ${stepNum}`}
                    >
                      <span className="font-mono text-xs">Q{stepNum}</span>
                      <span className="text-[11px] font-sans">
                        {stepNum === 1 ? 'Study Habits' : stepNum === 2 ? 'Daily Routine' : 'Past Experience'}
                      </span>
                      {isDone && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleResetDiagnosticProgress}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors self-end sm:self-auto cursor-pointer"
                title="Restart diagnostic progress from Question 1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restart Baseline</span>
              </button>
            </div>
          </div>

          {/* Active Diagnostic Question & Studio Voice Console (Before Submit) */}
          {!diagnosticResult && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 font-mono flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>Speaking · Part 1 · Question {currentDiagnosticQuestion.number} of {currentDiagnosticQuestion.total}</span>
                </span>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Accent Selector */}
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-0.5 text-[11px]">
                    <span className="text-slate-500">Accent:</span>
                    <select
                      value={recognitionLang}
                      onChange={(e) => handleAccentChange(e.target.value)}
                      className="bg-transparent font-semibold text-slate-800 text-[11px] focus:outline-none cursor-pointer"
                      title="Select your native or target speaking accent"
                    >
                      <option value="en-IN">🇱🇰 / 🇮🇳 South Asian (Best for SL)</option>
                      <option value="en-GB">🇬🇧 UK English (IELTS Standard)</option>
                      <option value="en-US">🇺🇸 US English</option>
                      <option value="en-AU">🇦🇺 Australian English</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleQuestionAudio}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isExaminerSpeaking
                        ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                    }`}
                    title={isExaminerSpeaking ? 'Pause examiner audio' : 'Hear examiner read question aloud'}
                  >
                    {isExaminerSpeaking ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-700" />
                        <span>Speaking... Click to Pause</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>🔊 Hear Examiner</span>
                      </>
                    )}
                  </button>
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    Aim for 20–30s
                  </span>
                </div>
              </div>

              {/* The Core Question Prompt */}
              <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <h3 className="text-lg sm:text-2xl font-bold font-serif text-slate-900 leading-snug">
                  {currentDiagnosticQuestion.question}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  💡 {currentDiagnosticQuestion.guidance}
                </p>
                {showSinhala && currentDiagnosticQuestion.guidanceSi && (
                  <p className="text-[11px] text-indigo-900 font-sinhala pt-1.5 border-t border-indigo-100/70">
                    🇱🇰 {currentDiagnosticQuestion.guidanceSi}
                  </p>
                )}
              </div>

              {/* Unified Live Voice-to-Text Transcript Notepad */}
              <VoiceTranscriptNotepad
                title="Live Voice-to-Text Notepad (Diagnostic Answer)"
                value={userSpeechText}
                onChange={handleUserTextChange}
                speechInterim={speechInterim}
                isRecording={isRecording}
                recordSeconds={recordSeconds}
                audioLevel={audioLevel}
                speechEngine={speechEngine}
                onSelectSpeechEngine={handleSelectSpeechEngine}
                whisperProgress={whisperProgress}
                recognitionLang={recognitionLang}
                onAccentChange={handleAccentChange}
                sttStatus={sttStatus}
                sttError={micError}
                onDismissError={() => {
                  setMicError(null);
                  if (sttStatus === 'stalled' || sttStatus === 'error') setSttStatus('idle');
                }}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onOpenMicDiagnostic={() => setIsMicDiagnosticOpen(true)}
                onAutoPunctuate={handleAutoPunctuate}
                onClear={handleClearTranscript}
                canUndo={canUndoBurst}
                onUndoLastBurst={handleUndoLastBurst}
                recordedAudioUrl={recordedAudioUrl}
                isPlayingOwnAudio={isPlayingOwnAudio}
                onTogglePlayOwnAudio={handleTogglePlayOwnAudio}
                hasAudioBlob={hasAudioBlob}
                isTranscribingAudio={isTranscribingAudio}
                hasGeminiApiKey={Boolean(effectiveApiKey)}
                onTranscribeWithWhisper={() => handleTranscribeWithWhisper()}
                onTranscribeWithGemini={() => handleTranscribeRecordedAudio()}
                onOpenApiKeyModal={onOpenApiKeyModal}
                hesitationAlert={hesitationAlert}
                showSparks={false}
                showAccentSelector={false}
                placeholder="Click 'Start Speaking' to convert your voice into accurate text here, or type your answer..."
                submitLabel="Submit my answer"
                submitLoadingLabel="Evaluating with Official Rubric..."
                isEvaluating={isEvaluating}
                onSubmit={handleDiagnosticSubmit}
                showSinhala={showSinhala}
              />
            </div>
          )}

          {/* Diagnostic Evaluation Dashboard (When Submitted) */}
          {diagnosticResult && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-300">
              {/* Score Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono block">
                    Diagnostic Turn {diagnosticResult.questionNumber} Assessment Complete
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                    Targeted Feedback & High-Impact Micro-Tasks
                  </h2>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-2xl border border-slate-800 font-mono text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-sans">Internal Progress</span>
                    <strong className="text-lg text-amber-400">
                      {(typeof diagnosticResult.workingDecimalScore === 'number' && !isNaN(diagnosticResult.workingDecimalScore)
                        ? diagnosticResult.workingDecimalScore
                        : safeWorkingScore
                      ).toFixed(1)}
                    </strong>
                  </div>
                  <div className="h-6 w-px bg-white/20" />
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-sans">Official Band</span>
                    <strong className="text-lg text-emerald-400">Band {formatBand(diagnosticResult.officialBandEstimate)}</strong>
                  </div>
                </div>
              </div>

              {/* Executive "Your Performance" Metric Card */}
              <SpeakingPerformanceCard
                overallBand={diagnosticResult.officialBandEstimate}
                fluencyBand={diagnosticResult.criteria.find(c => c.key === 'FC')?.band || 5.0}
                grammarBand={diagnosticResult.criteria.find(c => c.key === 'GRA')?.band || 4.5}
                vocabularyBand={diagnosticResult.criteria.find(c => c.key === 'LR')?.band || 5.0}
                pronunciationBand={diagnosticResult.criteria.find(c => c.key === 'PR')?.band || 5.5}
                wordCount={diagnosticResult.candidateAnswer.split(/\s+/).filter(Boolean).length}
                showSinhala={showSinhala}
              />

              {/* Sub-Tabs for Feedback Dashboard */}
              <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setDiagnosticReportTab('corrections')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    diagnosticReportTab === 'corrections'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>1. Sentence Corrections ({diagnosticResult.whatNeedsCorrection.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDiagnosticReportTab('model')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    diagnosticReportTab === 'model'
                      ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>2. Stepping-Stone Model (Band 5.5)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDiagnosticReportTab('task')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    diagnosticReportTab === 'task'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>3. Micro-Mission Task</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDiagnosticReportTab('evidence')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    diagnosticReportTab === 'evidence'
                      ? 'bg-slate-100 text-slate-900 border border-slate-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>4. Next Band Criteria</span>
                </button>
              </div>

              {/* Tab 1: Detailed Sentence Corrections */}
              {diagnosticReportTab === 'corrections' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-900 block">
                      Spoken Transcript with Inline Corrections:
                    </span>
                    <div className="p-3.5 bg-white rounded-xl border border-rose-200 font-serif text-sm sm:text-base leading-relaxed select-text">
                      {diagnosticResult.markedSpeech.map((s, idx) => {
                        if (s.type === 'replace') {
                          return (
                            <span key={idx} className="inline ml-1">
                              <del className="line-through decoration-rose-500 text-rose-600 bg-rose-50 px-1 rounded mr-1">{s.text}</del>
                              <ins className="no-underline font-bold text-emerald-700 bg-emerald-50 px-1.5 rounded">{s.to}</ins>
                            </span>
                          );
                        }
                        if (s.type === 'del') {
                          return <del key={idx} className="line-through decoration-rose-500 text-rose-600 bg-rose-50 px-1 rounded ml-1">{s.text}</del>;
                        }
                        return <span key={idx}>{s.text}</span>;
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {diagnosticResult.whatNeedsCorrection.map(iss => (
                      <div key={iss.id} className="text-xs text-rose-950 space-y-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{iss.title}</span>
                          <span className="font-mono text-[11px] text-rose-600 font-bold">{iss.original} → {iss.corrected}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{iss.why}</p>
                        {showSinhala && iss.whySi && (
                          <p className="text-[11px] text-slate-500 font-sinhala pt-1 border-t border-slate-100">💡 {iss.whySi}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Strengths note */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-emerald-900 mb-0.5">What you did well:</span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {diagnosticResult.whatYouDidWell.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Stepping-Stone Model Answer */}
              {diagnosticReportTab === 'model' && (
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                        Achievable Stepping-Stone Model Answer (Band 5.0–5.5)
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Natural, simple conversational English you can produce immediately without memorizing big words.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlayModelAnswer(diagnosticResult.steppingStoneModel)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>🔊 Listen Audio</span>
                    </button>
                  </div>

                  <p className="text-sm sm:text-base font-serif italic text-slate-800 bg-white p-4 rounded-xl border border-indigo-100 leading-relaxed">
                    "{diagnosticResult.steppingStoneModel}"
                  </p>
                </div>
              )}

              {/* Tab 3: One Small Improvement Task (Micro-Mission) */}
              {diagnosticReportTab === 'task' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                        Your Single Highest-Impact Micro-Mission
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Focus exclusively on applying this one habit for your next attempt to measure improvement.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                      Target: +0.3 Decimal Boost
                    </span>
                  </div>

                  {diagnosticResult.microTasks.map(task => (
                    <div key={task.id} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2 text-xs">
                      <span className="font-bold text-slate-900 text-sm block">{task.title}</span>
                      <p className="text-slate-700 leading-relaxed">{task.instruction}</p>
                      <div className="flex items-center gap-2 font-mono text-[11px] pt-2 border-t border-amber-200/60">
                        <span className="line-through text-slate-400">"{task.exampleBefore}"</span>
                        <span>→</span>
                        <span className="text-emerald-700 font-bold">"{task.exampleAfter}"</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Evidence Needed for Higher Band */}
              {diagnosticReportTab === 'evidence' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in duration-150">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Official Evidence Required Before Estimating Band 6.0+
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {diagnosticResult.evidenceNeededForHigherBand.map((ev, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-mono font-bold">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons: Retry vs Next Milestone */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleRetryDiagnosticWithTask}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>🔁 Try Again with Task Applied (Measure Improvement)</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedNextDiagnosticQuestion}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>
                    {diagnosticIndex + 1 < DIAGNOSTIC_QUESTIONS.length
                      ? `➡️ Proceed to Question ${diagnosticIndex + 2} of 3`
                      : '🎉 Complete Baseline & Unlock Cambridge Tests'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2B. MODE: SHADOWING & INTONATION STUDIO                       */}
      {/* ------------------------------------------------------------- */}
      {activeMode === 'shadowing' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <ShadowingPlayer
            topicTitle={selectedTopic.topic}
            modelText={currentReport?.band8ModelAnswer || selectedTopic.sampleBand8Answer}
            allTopics={ALL_TOPICS}
            selectedTopicId={selectedTopic.id}
            onSelectTopicId={(id) => {
              const found = ALL_TOPICS.find(t => t.id === id);
              if (found) {
                stopSpeech();
                setSelectedTopic(found);
                setCurrentQuestionIndex(0);
                setCurrentReport(null);
              }
            }}
            showSinhala={showSinhala}
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MODE: CAMBRIDGE PRACTICE TESTS & SPONTANEOUS PRACTICE      */}
      {/* ------------------------------------------------------------- */}
      {(activeMode === 'cambridge' || activeMode === 'random') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Mode 3: 60-Second Spontaneous Pressure Drill Arena HUD */}
          {activeMode === 'random' && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-indigo-800/60 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                        60s Spontaneous Drill Arena
                      </span>
                      {drillHesitationCount > 0 && (
                        <span className="text-[11px] font-mono text-rose-300">
                          Pauses (&gt;3s): {drillHesitationCount}
                        </span>
                      )}
                      {drillCompleted && (
                        <span className="text-[11px] font-bold text-emerald-300">
                          🎉 60s Non-Stop Drill Completed!
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      5-second countdown, then speak non-stop for 60 seconds without freezing to build real exam fluency.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {drillCountdown !== null ? (
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-mono font-extrabold text-sm animate-pulse">
                        Get Ready: {drillCountdown}s...
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelSpontaneousDrill}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : isDrillActive ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-2 rounded-xl bg-rose-500 text-white font-mono font-extrabold text-sm animate-pulse">
                        {Math.max(0, 60 - recordSeconds)}s left
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelSpontaneousDrill}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                      >
                        End Early
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleStartSpontaneousDrill}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Start 60s Pressure Drill</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePickRandomTopic}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Draw a fresh surprise IELTS topic"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-amber-300" />
                        <span>New Surprise Topic</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 60-Second Progress Bar during active pressure drill */}
              {(isDrillActive || drillCompleted) && (
                <div className="space-y-1">
                  <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        drillCompleted ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.round((recordSeconds / 60) * 100))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>0s</span>
                    <span>30s Halfway</span>
                    <span className={recordSeconds >= 60 ? 'text-emerald-300 font-bold' : ''}>
                      60s Fluency Goal
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Topic Selector & Question Navigation Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700">Test Topic:</span>
              <select
                value={selectedTopic.id}
                onChange={(e) => {
                  const found = ALL_TOPICS.find(t => t.id === e.target.value);
                  if (found) handleSelectTopic(found);
                }}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 cursor-pointer max-w-xs sm:max-w-md truncate"
              >
                <optgroup label="Cambridge Official Tests">
                  {ALL_TOPICS.filter(t => !t.id.startsWith('rnd-')).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.category} · Part {t.part}: {t.topic}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Spontaneous Conversation Topics">
                  {ALL_TOPICS.filter(t => t.id.startsWith('rnd-')).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.category} · Part {t.part}: {t.topic}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Question Switcher Controls (Prev / Pills / Next) */}
            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-slate-700 transition-colors"
                title="Previous Question"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {selectedTopic.questions.map((_, qIdx) => (
                  <button
                    key={qIdx}
                    type="button"
                    onClick={() => {
                      stopSpeech();
                      setIsExaminerSpeaking(false);
                      setIsPlayingModelAnswer(false);
                      setUserSpeechText('');
                      setSpeechInterim('');
                      baseSpeechTextRef.current = '';
                      setCurrentReport(null);
                      setRecordSeconds(0);
                      setIsRecording(false);
                      setPrepTimeRemaining(60);
                      setIsPrepRunning(false);
                      setShowModelAnswerPreview(false);
                      setCurrentQuestionIndex(qIdx);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      currentQuestionIndex === qIdx
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title={`Go to Question ${qIdx + 1}`}
                  >
                    {qIdx + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer text-slate-700 transition-colors"
                title="Next Question"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className="text-[11px] font-mono text-slate-500 ml-1">
                ({currentQuestionIndex + 1}/{selectedTopic.questions.length})
              </span>
            </div>
          </div>

          {/* Focused 2-Column Speaking Room */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Examiner Dialogue & Voice Booth (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Examiner Dialogue Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs ${
                      isExaminerSpeaking ? 'bg-indigo-600 animate-pulse ring-4 ring-indigo-100' : 'bg-slate-900'
                    }`}>
                      {isExaminerSpeaking ? '🔊' : 'AI'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">Examiner Question</span>
                      <span className="text-[10px] text-slate-500 font-mono">Part {selectedTopic.part} Discussion · Question {currentQuestionIndex + 1}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const speech = currentReport?.examinerSpokenFeedback || `Question: ${activeQuestion}`;
                      speakExaminerQuestion(speech);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isExaminerSpeaking
                        ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {isExaminerSpeaking ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-700" />
                        <span>Speaking (Pause)</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>🔊 Replay Audio</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                  <p className="text-base font-serif text-slate-900 leading-relaxed font-semibold">
                    {currentReport ? currentReport.examinerSpokenFeedback : activeQuestion}
                  </p>

                  {selectedTopic.cueCardPoints && selectedTopic.part !== 2 && (
                    <div className="pt-2 border-t border-indigo-100/70 mt-2 space-y-1">
                      <span className="text-[11px] font-bold text-indigo-900 block">Cue Card Points (You should say):</span>
                      <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                        {selectedTopic.cueCardPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Enhanced Part 2 Cue Card Notepad, 1-Min Prep, 2-Min Target & Live Coverage Tracker */}
                {selectedTopic.part === 2 && (
                  <CueCardNotepad
                    cueCardPoints={selectedTopic.cueCardPoints || [
                      'What it is / who it involves',
                      'When and where it happened',
                      'What you did or experienced',
                      'And explain why it was meaningful to you'
                    ]}
                    prepTimeRemaining={prepTimeRemaining}
                    isPrepRunning={isPrepRunning}
                    onTogglePrepTimer={() => {
                      if (prepTimeRemaining === 0) setPrepTimeRemaining(60);
                      setIsPrepRunning(prev => !prev);
                    }}
                    onResetPrepTimer={() => {
                      setIsPrepRunning(false);
                      setPrepTimeRemaining(60);
                    }}
                    isRecording={isRecording}
                    recordSeconds={recordSeconds}
                    spokenText={userSpeechText}
                    showSinhala={showSinhala}
                  />
                )}
              </div>

              {/* Unified Live Voice-to-Text Transcript Notepad */}
              <VoiceTranscriptNotepad
                title="Live Voice-to-Text Notepad (Your Spoken Answer)"
                value={userSpeechText}
                onChange={handleUserTextChange}
                speechInterim={speechInterim}
                isRecording={isRecording}
                recordSeconds={recordSeconds}
                audioLevel={audioLevel}
                speechEngine={speechEngine}
                onSelectSpeechEngine={handleSelectSpeechEngine}
                whisperProgress={whisperProgress}
                recognitionLang={recognitionLang}
                onAccentChange={handleAccentChange}
                sttStatus={sttStatus}
                sttError={micError}
                onDismissError={() => {
                  setMicError(null);
                  if (sttStatus === 'stalled' || sttStatus === 'error') setSttStatus('idle');
                }}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onOpenMicDiagnostic={() => setIsMicDiagnosticOpen(true)}
                onAutoPunctuate={handleAutoPunctuate}
                onClear={handleClearTranscript}
                canUndo={canUndoBurst}
                onUndoLastBurst={handleUndoLastBurst}
                recordedAudioUrl={recordedAudioUrl}
                isPlayingOwnAudio={isPlayingOwnAudio}
                onTogglePlayOwnAudio={handleTogglePlayOwnAudio}
                hasAudioBlob={hasAudioBlob}
                isTranscribingAudio={isTranscribingAudio}
                hasGeminiApiKey={Boolean(effectiveApiKey)}
                onTranscribeWithWhisper={() => handleTranscribeWithWhisper()}
                onTranscribeWithGemini={() => handleTranscribeRecordedAudio()}
                onOpenApiKeyModal={onOpenApiKeyModal}
                hesitationAlert={hesitationAlert}
                showSparks={true}
                showAccentSelector={true}
                placeholder="Click 'Start Speaking' to convert your voice into accurate text here, or type your response..."
                submitLabel="Evaluate Speech"
                submitLoadingLabel="Evaluating..."
                isEvaluating={isEvaluating}
                onSubmit={handleEvaluate}
                showSinhala={showSinhala}
              />
            </div>

            {/* Right Column: Model Answer & Official IELTS Criteria (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Native Model Answer (With Reveal Toggle to Avoid Spoiling Test) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Band 8.5 Native Model</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowModelAnswerPreview(prev => !prev)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {showModelAnswerPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showModelAnswerPreview ? 'Hide Answer' : 'Reveal Model'}</span>
                  </button>
                </div>

                {showModelAnswerPreview ? (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-200">
                      "{currentReport?.band8ModelAnswer || selectedTopic.sampleBand8Answer}"
                    </p>

                    <button
                      type="button"
                      onClick={() => handlePlayModelAnswer()}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>🔊 Listen to Native Speaker</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                    <p className="text-xs text-slate-500">
                      Try answering first! Click "Reveal Model" to study native Band 8.5 phrasing.
                    </p>
                  </div>
                )}
              </div>

              {/* Official Criteria Summary or Quick Performance Summary */}
              {currentReport ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900">
                      Turn Performance Summary
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-600">
                      Band {formatBand(currentReport.overallBand)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-700 block">Fluency</span>
                      <span className="text-sm font-extrabold font-mono text-indigo-950">
                        {Math.min(100, Math.round((currentReport.stage2Criteria.FC / 9) * 100))}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-purple-700 block">Grammar</span>
                      <span className="text-sm font-extrabold font-mono text-purple-950">
                        {Math.min(100, Math.round((currentReport.stage2Criteria.GRA / 9) * 100))}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block">Vocabulary</span>
                      <span className="text-sm font-extrabold font-mono text-emerald-950">
                        {Math.min(100, Math.round((currentReport.stage2Criteria.LR / 9) * 100))}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-amber-700 block">Pronunciation</span>
                      <span className="text-sm font-extrabold font-mono text-amber-950">
                        {Math.min(100, Math.round((currentReport.stage2Criteria.PR / 9) * 100))}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <span className="text-xs font-bold text-slate-900 block border-b border-slate-100 pb-2">
                    Cambridge 4 Speaking Criteria
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-900 block text-[11px]">FC · Fluency</span>
                      <span className="text-[10px] text-slate-500">Flow & natural pausing.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-900 block text-[11px]">LR · Lexical</span>
                      <span className="text-[10px] text-slate-500">Collocations & idioms.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-900 block text-[11px]">GRA · Grammar</span>
                      <span className="text-[10px] text-slate-500">Complex sentence range.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-900 block text-[11px]">PR · Pronunciation</span>
                      <span className="text-[10px] text-slate-500">Cadence, stress, intonation.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Regular Evaluation Report (When Available) */}
          {currentReport && (
            <div id="speaking-detailed-analysis-section" className="space-y-6 animate-in fade-in duration-300">
              {/* Executive "Your Performance" Evaluation Card */}
              <SpeakingPerformanceCard
                overallBand={currentReport.overallBand}
                fluencyBand={currentReport.stage2Criteria.FC}
                grammarBand={currentReport.stage2Criteria.GRA}
                vocabularyBand={currentReport.stage2Criteria.LR}
                pronunciationBand={currentReport.stage2Criteria.PR}
                wordCount={currentReport.fluencyMetrics?.wordCount}
                wordsPerMinute={currentReport.fluencyMetrics?.wordsPerMinute}
                onViewDetailedAnalysis={() => {
                  const el = document.getElementById('speaking-stage-tabs-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  setActiveStageTab('stage1');
                }}
                showSinhala={showSinhala}
              />

              <div id="speaking-stage-tabs-section" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                      Evaluation Result
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                      Turn Assessment & Interactive Score Simulator
                    </h2>
                  </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveStageTab('stage1')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeStageTab === 'stage1' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Scores
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStageTab('stage2')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeStageTab === 'stage2' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Corrections ({currentReport.issues.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStageTab('stage3')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeStageTab === 'stage3' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Score Simulator
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStageTab('stage4')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeStageTab === 'stage4' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Model & Tips
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Next Turn</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {activeStageTab === 'stage1' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-indigo-300 font-mono">Estimated Overall Band</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            evaluationSource === 'gemini'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                              : 'bg-white/10 text-slate-300 border-white/20'
                          }`}
                        >
                          {evaluationSource === 'gemini' ? '✦ Gemini AI Examiner' : '⚡ Instant Local Engine'}
                        </span>
                      </div>
                      <div className="text-3xl font-bold font-mono text-amber-400 mt-0.5">
                        Band {formatBand(currentReport.overallBand)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      {currentReport.fluencyMetrics && (
                        <div className="text-left sm:text-right text-xs font-mono text-slate-300 space-y-0.5">
                          <div>Words: {currentReport.fluencyMetrics.wordCount}</div>
                          <div>Pace: {currentReport.fluencyMetrics.wordsPerMinute} WPM</div>
                          {currentReport.fluencyMetrics.fillerCount > 0 && (
                            <div className="text-rose-300">Fillers: {currentReport.fluencyMetrics.fillerCount}</div>
                          )}
                        </div>
                      )}

                      {evaluationSource !== 'gemini' && (
                        <button
                          type="button"
                          onClick={handleRunDeepGeminiAnalysis}
                          disabled={isDeepEvaluating}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Run deep qualitative critique using Google Gemini AI"
                        >
                          <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isDeepEvaluating ? 'animate-spin' : ''}`} />
                          <span>
                            {isDeepEvaluating
                              ? 'Analyzing with Gemini...'
                              : effectiveApiKey
                              ? 'Run Deep Gemini AI'
                              : 'Unlock Deep Gemini AI'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentReport.criteria.map(crit => (
                      <div key={crit.key} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{crit.name}</span>
                          <span className="font-mono text-indigo-600">{formatBand(crit.band)}</span>
                        </div>
                        <p className="text-slate-600">{crit.comment}</p>
                        {showSinhala && crit.commentSi && (
                          <p className="text-[11px] text-slate-500 font-sinhala pt-1 border-t border-slate-200/60">💡 {crit.commentSi}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Main Problems Summary */}
                  {currentReport.mainProblems && currentReport.mainProblems.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
                      <span className="font-bold text-amber-950 block">Examiner Key Observations:</span>
                      <div className="space-y-1.5">
                        {currentReport.mainProblems.map((prob, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <span className="font-bold text-amber-900">{prob.title}:</span>
                            <p className="text-slate-700">{prob.description}</p>
                            {showSinhala && prob.descriptionSi && (
                              <p className="text-[11px] text-slate-500 font-sinhala">💡 {prob.descriptionSi}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeStageTab === 'stage2' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-serif text-sm leading-relaxed">
                    {currentReport.markedSpeech.map((seg, idx) => {
                      if (seg.type === 'text') return <span key={idx}>{seg.text}</span>;
                      if (seg.type === 'del') return <del key={idx} className="line-through text-rose-600 bg-rose-50 px-1 rounded ml-1">{seg.text}</del>;
                      if (seg.type === 'replace') {
                        return (
                          <span key={idx} className="inline ml-1">
                            <del className="line-through text-rose-600 bg-rose-50 px-1 rounded mr-1">{seg.text}</del>
                            <ins className="no-underline font-bold text-emerald-800 bg-emerald-50 px-1 rounded">{seg.to}</ins>
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {currentReport.issues.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-800 block">
                        Grammar & Spoken Slips ({currentReport.issues.length}):
                      </span>
                      {currentReport.issues.map(iss => (
                        <div key={iss.id} className="text-xs bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{iss.title}</span>
                            <span className="font-mono text-[11px] text-rose-600 font-bold">{iss.original} → {iss.corrected}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{iss.why}</p>
                          {showSinhala && iss.whySi && (
                            <p className="text-[11px] text-slate-500 font-sinhala pt-1 border-t border-slate-100">💡 {iss.whySi}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero high-severity spoken slips detected in this turn! Great grammatical accuracy.</span>
                    </div>
                  )}
                </div>
              )}

              {activeStageTab === 'stage3' && (
                <SpeakingInteractiveUpgradesSandbox
                  spokenText={currentReport.spokenText}
                  segments={currentReport.band8Edits}
                  stage2Criteria={currentReport.stage2Criteria}
                  stage2Band={currentReport.stage2Band}
                  showSinhala={showSinhala}
                />
              )}

              {activeStageTab === 'stage4' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <ShadowingPlayer
                    topicTitle={`Shadow the Band 8.5 Model — ${selectedTopic.topic}`}
                    modelText={currentReport.band8ModelAnswer}
                    showSinhala={showSinhala}
                    compact
                  />

                  {currentReport.band8AudioTips && currentReport.band8AudioTips.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <span className="font-bold text-slate-900 block">Cambridge Senior Examiner Tips for this Question:</span>
                      <ul className="list-disc pl-5 space-y-1 text-slate-700">
                        {currentReport.band8AudioTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentReport.nextFollowUpQuestion && (
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                      <span className="font-bold text-amber-950 block">Next Examiner Follow-Up:</span>
                      <p className="text-slate-800 font-serif italic text-sm">
                        "{currentReport.nextFollowUpQuestion}"
                      </p>
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Local IndexedDB Past Recordings & Progress History Modal */}
      <SpeakingHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        attempts={savedAttempts}
        onDeleteAttempt={(id) => {
          deleteSpeakingAttempt(id)
            .then(() => listSpeakingAttempts())
            .then(setSavedAttempts)
            .catch(() => {});
        }}
        onClearAll={() => {
          clearAllSpeakingAttempts()
            .then(() => setSavedAttempts([]))
            .catch(() => {});
        }}
        showSinhala={showSinhala}
      />

      {/* 10-Second Physical Microphone & Speech Accuracy Studio Check Modal */}
      <MicDiagnosticModal
        isOpen={isMicDiagnosticOpen}
        onClose={() => setIsMicDiagnosticOpen(false)}
        selectedDeviceId={selectedMicDeviceId}
        onSelectDeviceId={handleSelectMicDeviceId}
        speechEngine={speechEngine}
        onSelectSpeechEngine={handleSelectSpeechEngine}
        whisperModel={whisperModel}
        onSelectWhisperModel={handleSelectWhisperModel}
        recognitionLang={recognitionLang}
        onAccentChange={handleAccentChange}
        apiKey={effectiveApiKey}
        selectedModel={effectiveModel}
        showSinhala={showSinhala}
      />
    </div>
  );
};

export const SpeakingTutorView: React.FC<SpeakingTutorViewProps> = (props) => {
  return (
    <SpeakingErrorBoundary>
      <SpeakingTutorViewInner {...props} />
    </SpeakingErrorBoundary>
  );
};
