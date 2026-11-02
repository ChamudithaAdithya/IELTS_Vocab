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
  Compass
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
  punctuateSpokenTranscript
} from '../../utils/speakingEngine';
import { playSpeech, stopSpeech } from '../../utils/speech';
import { loadApiKey, loadModel, formatBand } from '../../utils/tutorEngine';
import { SpeakingInteractiveUpgradesSandbox } from './SpeakingInteractiveUpgradesSandbox';

interface SpeakingTutorViewProps {
  showSinhala: boolean;
  onBackToHub?: () => void;
  initialTopicId?: string;
}

// Convert CAMBRIDGE_SPEAKING_TESTS to full SpeakingTopic structure
const ALL_TOPICS: SpeakingTopic[] = [
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
  initialTopicId
}) => {
  // Navigation Mode: 'roadmap' (Personalized Adaptive Diagnostic Roadmap) | 'cambridge' | 'random'
  const [activeMode, setActiveMode] = useState<'roadmap' | 'cambridge' | 'random'>(() => {
    return initialTopicId ? 'cambridge' : 'roadmap';
  });

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
      const found = ALL_TOPICS.find(t => t.id === initialTopicId);
      if (found) return found;
    }
    return RANDOM_SPEAKING_TOPICS[0];
  });

  useEffect(() => {
    if (initialTopicId) {
      const found = ALL_TOPICS.find(t => t.id === initialTopicId);
      if (found) {
        setSelectedTopic(found);
        setActiveMode('cambridge');
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

  // Part 2 Cue Card Prep Countdown
  const [prepTimeRemaining, setPrepTimeRemaining] = useState<number>(60);
  const [isPrepRunning, setIsPrepRunning] = useState<boolean>(false);

  // Regular Mode Evaluation & Stages
  const [currentReport, setCurrentReport] = useState<SpeakingEvaluationReport | null>(null);
  const [activeStageTab, setActiveStageTab] = useState<'stage1' | 'stage2' | 'stage3' | 'stage4'>('stage1');
  const [turns, setTurns] = useState<SpeakingTurn[]>([]);

  // Refs for speech recognition
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const prepTimerRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const userSpeechTextRef = useRef<string>('');
  const baseSpeechTextRef = useRef<string>('');

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    userSpeechTextRef.current = userSpeechText;
  }, [userSpeechText]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, []);

  // Timer while recording
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } else {
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
              playSpeech("Your one minute preparation time is up. Please begin speaking now.", { rate: 0.95 });
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

  // Start Live Microphone Recording
  const handleStartRecording = () => {
    stopSpeech();
    setIsExaminerSpeaking(false);
    setIsPlayingModelAnswer(false);

    baseSpeechTextRef.current = userSpeechText.trim();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let sessionFinalTranscript = '';
          let sessionInterimTranscript = '';

          for (let i = 0; i < event.results.length; i++) {
            const item = event.results[i];
            if (item && item[0]) {
              const transcript = item[0].transcript || '';
              if (item.isFinal) {
                sessionFinalTranscript += transcript + ' ';
              } else {
                sessionInterimTranscript += transcript;
              }
            }
          }

          const cleanFinal = sessionFinalTranscript.trim();
          const combined = [baseSpeechTextRef.current, cleanFinal]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          setUserSpeechText(combined);
          setSpeechInterim(sessionInterimTranscript.trim());
        };

        recognition.onerror = (e: any) => {
          if (e.error !== 'no-speech' && e.error !== 'aborted') {
            console.warn('Speech recognition warning:', e.error);
          }
        };

        recognition.onend = () => {
          if (isRecordingRef.current && recognitionRef.current) {
            try {
              baseSpeechTextRef.current = userSpeechTextRef.current.trim();
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Could not initialize SpeechRecognition:', err);
      }
    }

    setIsRecording(true);
    setRecordSeconds(0);
    setSpeechInterim('');
  };

  // Stop Live Microphone
  const handleStopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    // Flush and auto-punctuate
    setUserSpeechText((prev) => {
      const cleanPrev = prev.trim();
      const cleanInterim = speechInterim.trim();
      const combined = [cleanPrev, cleanInterim].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      const formatted = punctuateSpokenTranscript(combined);
      baseSpeechTextRef.current = formatted;
      return formatted;
    });
    setSpeechInterim('');
  };

  // Auto-punctuate trigger
  const handleAutoPunctuate = () => {
    const raw = (userSpeechText + ' ' + speechInterim).trim();
    if (!raw) return;
    const formatted = punctuateSpokenTranscript(raw);
    setUserSpeechText(formatted);
    baseSpeechTextRef.current = formatted;
    setSpeechInterim('');
  };

  // Submit Answer in Diagnostic Roadmap Mode
  const handleDiagnosticSubmit = () => {
    handleStopRecording();
    const raw = (userSpeechText + ' ' + speechInterim).trim();
    if (!raw) return;

    const textToEvaluate = punctuateSpokenTranscript(raw);
    setUserSpeechText(textToEvaluate);
    baseSpeechTextRef.current = textToEvaluate;
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

      if (examinerAudioEnabled && result.whatYouDidWell[0]) {
        playSpeech(
          `Good communicative effort. What you did well: ${result.whatYouDidWell[0]}. Here is your high impact improvement task.`,
          { rate: 0.95 }
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
      setActiveMode('cambridge');
      handleSelectTopic(CAMBRIDGE_SPEAKING_TESTS[0] as any);
    }
  };

  // Reset Diagnostic Progress
  const handleResetDiagnosticProgress = () => {
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
    const raw = (userSpeechText + ' ' + speechInterim).trim();
    if (!raw) return;

    const textToEvaluate = punctuateSpokenTranscript(raw);
    setUserSpeechText(textToEvaluate);
    baseSpeechTextRef.current = textToEvaluate;
    setIsEvaluating(true);

    try {
      const apiKey = loadApiKey();
      const model = loadModel();
      let report: SpeakingEvaluationReport;

      if (apiKey) {
        try {
          report = await evaluateSpokenTurnWithGemini(
            activeQuestion,
            textToEvaluate,
            selectedTopic,
            apiKey,
            model,
            recordSeconds
          );
        } catch {
          report = evaluateSpokenTurnLocally(
            activeQuestion,
            textToEvaluate,
            selectedTopic,
            recordSeconds
          );
        }
      } else {
        report = evaluateSpokenTurnLocally(
          activeQuestion,
          textToEvaluate,
          selectedTopic,
          recordSeconds
        );
      }

      setCurrentReport(report);
      setActiveStageTab('stage1');

      const candidateTurn: SpeakingTurn = {
        id: `turn-${Date.now()}`,
        speaker: 'candidate',
        question: activeQuestion,
        transcript: textToEvaluate,
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
      setActiveStageTab('stage1');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Next Question in regular topic
  const handleNextQuestion = () => {
    stopSpeech();
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
                onBackToHub();
              }}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Return to Cambridge Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
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
            </h1>
          </div>
        </div>

        {/* Studio Mode Selector (Clean Segmented Control) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            {/* Roadmap Tab */}
            <button
              type="button"
              onClick={() => {
                stopSpeech();
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
                setActiveMode('cambridge');
                handleSelectTopic(CAMBRIDGE_SPEAKING_TESTS[0] as any);
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
          </div>

          {/* Examiner Voice Output Toggle */}
          <button
            type="button"
            onClick={() => {
              if (examinerAudioEnabled) stopSpeech();
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
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((stepNum) => {
                  const isCurrent = currentDiagnosticQuestion.number === stepNum;
                  const isDone = currentDiagnosticQuestion.number > stepNum;
                  return (
                    <div
                      key={stepNum}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 border-indigo-400 text-white font-bold'
                          : isDone
                          ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <span className="font-mono text-xs">Q{stepNum}</span>
                      <span className="text-[11px] font-sans">
                        {stepNum === 1 ? 'Study Habits' : stepNum === 2 ? 'Daily Routine' : 'Past Experience'}
                      </span>
                      {isDone && <Check className="w-3 h-3 text-emerald-400" />}
                    </div>
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
                
                <div className="flex items-center gap-2">
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

              {/* Candidate Voice Booth */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Mic className="w-4 h-4 animate-pulse" />
                        <span>Record Speech</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <MicOff className="w-4 h-4 text-rose-400" />
                        <span>Stop Recording</span>
                      </button>
                    )}

                    {isRecording && (
                      <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        <span className="text-xs font-mono font-bold text-rose-700">
                          {formatSec(recordSeconds)}
                        </span>
                        <span className="text-[11px] text-rose-600 hidden sm:inline font-medium">Recording speech...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {userSpeechText && !isRecording && (
                      <button
                        type="button"
                        onClick={handleAutoPunctuate}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-indigo-200"
                        title="Add periods, commas, and capital letters automatically"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>✨ Auto-Punctuate</span>
                      </button>
                    )}
                    <span className="text-xs text-slate-500 font-mono">
                      Words: {userSpeechText.trim().split(/\s+/).filter(Boolean).length}
                    </span>
                  </div>
                </div>

                {/* Textarea for spoken transcript */}
                <div className="relative">
                  <textarea
                    value={userSpeechText}
                    onChange={(e) => setUserSpeechText(e.target.value)}
                    placeholder="Click 'Record Speech' to speak into your microphone, or type your normal everyday answer here..."
                    rows={4}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm font-serif text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
                  />
                  {speechInterim && (
                    <div className="absolute bottom-3 left-4 right-4 text-xs font-serif text-indigo-600 italic pointer-events-none truncate">
                      ...{speechInterim}
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleDiagnosticSubmit}
                    disabled={isEvaluating || (!userSpeechText && !speechInterim)}
                    className={`px-8 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
                      !userSpeechText && !speechInterim
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : isEvaluating
                        ? 'bg-indigo-700 text-white animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                    }`}
                  >
                    {isEvaluating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Evaluating with Official Rubric...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-emerald-400" />
                        <span>Submit my answer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
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
                            <span key={idx} className="mx-1">
                              <del className="line-through decoration-rose-500 text-rose-600 bg-rose-50 px-1 rounded">{s.text}</del>
                              <ins className="no-underline font-bold text-emerald-700 bg-emerald-50 px-1.5 rounded">{s.to}</ins>
                            </span>
                          );
                        }
                        if (s.type === 'del') {
                          return <del key={idx} className="line-through decoration-rose-500 text-rose-600 bg-rose-50 px-1 rounded mx-0.5">{s.text}</del>;
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
      {/* 3. MODE: CAMBRIDGE PRACTICE TESTS & SPONTANEOUS PRACTICE      */}
      {/* ------------------------------------------------------------- */}
      {activeMode !== 'roadmap' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Topic Selector Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Select Test Topic:</span>
              <select
                value={selectedTopic.id}
                onChange={(e) => {
                  const found = ALL_TOPICS.find(t => t.id === e.target.value);
                  if (found) handleSelectTopic(found);
                }}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 cursor-pointer"
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

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] font-mono text-slate-500">
                Question {currentQuestionIndex + 1} of {selectedTopic.questions.length}
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
                      <span className="text-[10px] text-slate-500 font-mono">Part {selectedTopic.part} Discussion</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const speech = currentReport?.examinerSpokenFeedback || `Question: ${activeQuestion}`;
                      speakExaminerQuestion(speech);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Replay Audio</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                  <p className="text-base font-serif text-slate-900 leading-relaxed font-semibold">
                    {currentReport ? currentReport.examinerSpokenFeedback : activeQuestion}
                  </p>

                  {selectedTopic.cueCardPoints && (
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

                {/* 1-Minute Prep for Part 2 */}
                {selectedTopic.part === 2 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <span className="font-bold text-amber-900">1-Minute Notes Prep Time:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-950 text-base">{prepTimeRemaining}s</span>
                      <button
                        type="button"
                        onClick={() => setIsPrepRunning(prev => !prev)}
                        className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg font-bold text-[11px] cursor-pointer"
                      >
                        {isPrepRunning ? 'Pause' : 'Start Timer'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Candidate Recording Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-rose-600" />
                    <span>Candidate Spoken Turn</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {userSpeechText && !isRecording && (
                      <button
                        type="button"
                        onClick={handleAutoPunctuate}
                        className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-indigo-200"
                        title="Add periods, commas, and capital letters automatically"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>✨ Auto-Punctuate</span>
                      </button>
                    )}
                    <span className="text-xs text-slate-500 font-mono">
                      Words: {userSpeechText.trim().split(/\s+/).filter(Boolean).length}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Mic className="w-4 h-4 animate-pulse" />
                        <span>Start Speaking</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <MicOff className="w-4 h-4 text-rose-400" />
                        <span>Stop Recording</span>
                      </button>
                    )}

                    {isRecording && (
                      <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        <span className="text-xs font-mono font-bold text-rose-700">
                          {formatSec(recordSeconds)}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleEvaluate}
                    disabled={isEvaluating || (!userSpeechText && !speechInterim)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                      !userSpeechText && !speechInterim
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : isEvaluating
                        ? 'bg-indigo-700 text-white animate-pulse'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                    }`}
                  >
                    {isEvaluating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Evaluate Speech</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={userSpeechText}
                    onChange={(e) => setUserSpeechText(e.target.value)}
                    placeholder="Speak aloud into your microphone or type your response here..."
                    rows={4}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm font-serif text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
                  />
                  {speechInterim && (
                    <div className="absolute bottom-3 left-4 right-4 text-xs font-serif text-indigo-600 italic pointer-events-none truncate">
                      ...{speechInterim}
                    </div>
                  )}
                </div>
              </div>
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

              {/* Official Criteria Summary */}
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
            </div>
          </div>

          {/* Regular Evaluation Report (When Available) */}
          {currentReport && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                    Evaluation Result
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    Turn Assessment & Interactive Score Simulator
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveStageTab('stage1')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeStageTab === 'stage1' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Scores
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStageTab('stage2')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeStageTab === 'stage2' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Corrections ({currentReport.issues.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStageTab('stage3')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeStageTab === 'stage3' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Score Simulator
                  </button>
                </div>
              </div>

              {activeStageTab === 'stage1' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <span className="text-xs text-indigo-300 font-mono">Estimated Overall Band</span>
                      <div className="text-3xl font-bold font-mono text-amber-400">
                        {formatBand(currentReport.overallBand)}
                      </div>
                    </div>
                    {currentReport.fluencyMetrics && (
                      <div className="text-right text-xs font-mono text-slate-300 space-y-0.5">
                        <div>Words: {currentReport.fluencyMetrics.wordCount}</div>
                        <div>Pace: {currentReport.fluencyMetrics.wordsPerMinute} WPM</div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentReport.criteria.map(crit => (
                      <div key={crit.key} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{crit.name}</span>
                          <span className="font-mono text-indigo-600">{formatBand(crit.band)}</span>
                        </div>
                        <p className="text-slate-600">{crit.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStageTab === 'stage2' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-serif text-sm leading-relaxed">
                    {currentReport.markedSpeech.map((seg, idx) => {
                      if (seg.type === 'text') return <span key={idx}>{seg.text}</span>;
                      if (seg.type === 'del') return <del key={idx} className="line-through text-rose-600 bg-rose-50 px-1 rounded">{seg.text}</del>;
                      if (seg.type === 'replace') {
                        return (
                          <span key={idx} className="mx-1">
                            <del className="line-through text-rose-600 bg-rose-50 px-1 rounded">{seg.text}</del>
                            <ins className="no-underline font-bold text-emerald-800 bg-emerald-50 px-1 rounded">{seg.to}</ins>
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
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
            </div>
          )}
        </div>
      )}
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
