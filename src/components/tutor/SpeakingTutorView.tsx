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
  AlertTriangle,
  Layers,
  BookOpen,
  MessageSquare,
  Shuffle,
  Info,
  Check,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { CAMBRIDGE_SPEAKING_TESTS } from '../../data/speakingTests';
import type { SpeakingPartPrompt } from '../../types/tutor';
import type {
  SpeakingEvaluationReport,
  SpeakingTurn,
  SpeakingTopic
} from '../../types/speakingTutor';
import {
  RANDOM_SPEAKING_TOPICS,
  evaluateSpokenTurnLocally,
  evaluateSpokenTurnWithGemini
} from '../../utils/speakingEngine';
import { playSpeech, stopSpeech } from '../../utils/speech';
import { loadApiKey, loadModel, formatBand } from '../../utils/tutorEngine';
import { SpeakingInteractiveUpgradesSandbox } from './SpeakingInteractiveUpgradesSandbox';

interface SpeakingTutorViewProps {
  showSinhala: boolean;
  onBackToHub?: () => void;
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

export const SpeakingTutorView: React.FC<SpeakingTutorViewProps> = ({ 
  showSinhala, 
  onBackToHub 
}) => {
  // Topic & Session State
  const [selectedTopic, setSelectedTopic] = useState<SpeakingTopic>(RANDOM_SPEAKING_TOPICS[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isRandomMode, setIsRandomMode] = useState<boolean>(true);

  // Audio & Speech Synthesis
  const [examinerAudioEnabled, setExaminerAudioEnabled] = useState<boolean>(true);
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState<boolean>(false);
  const [isPlayingModelAnswer, setIsPlayingModelAnswer] = useState<boolean>(false);

  // Microphone & Speech Recognition
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [userSpeechText, setUserSpeechText] = useState<string>('');
  const [speechInterim, setSpeechInterim] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  // Part 2 Preparation Timer (60s)
  const [prepTimeRemaining, setPrepTimeRemaining] = useState<number>(60);
  const [isPrepRunning, setIsPrepRunning] = useState<boolean>(false);

  // Evaluation & Pedagogical Stages
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentReport, setCurrentReport] = useState<SpeakingEvaluationReport | null>(null);
  const [activeStageTab, setActiveStageTab] = useState<'stage1' | 'stage2' | 'stage3' | 'stage4'>('stage1');

  // Turn History
  const [turns, setTurns] = useState<SpeakingTurn[]>([]);

  // Current Question
  const activeQuestion = useMemo(() => {
    if (selectedTopic.questions && selectedTopic.questions.length > 0) {
      return selectedTopic.questions[currentQuestionIndex] || selectedTopic.questions[0];
    }
    return `Can you tell me about ${selectedTopic.topic}?`;
  }, [selectedTopic, currentQuestionIndex]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Part 2 Preparation Timer (1 min)
  useEffect(() => {
    let timer: any = null;
    if (isPrepRunning && prepTimeRemaining > 0) {
      timer = setInterval(() => {
        setPrepTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (prepTimeRemaining === 0) {
      setIsPrepRunning(false);
    }
    return () => clearInterval(timer);
  }, [isPrepRunning, prepTimeRemaining]);

  // Speaking Recording Timer
  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Speak Examiner Question aloud on topic/question change
  const speakExaminerQuestion = (text: string) => {
    if (!examinerAudioEnabled) return;
    stopSpeech();
    setIsExaminerSpeaking(true);
    playSpeech(text, {
      rate: 0.95,
      onStart: () => setIsExaminerSpeaking(true),
      onEnd: () => setIsExaminerSpeaking(false),
      onError: () => setIsExaminerSpeaking(false)
    });
  };

  // Trigger audio on question switch
  useEffect(() => {
    const intro = currentQuestionIndex === 0 && selectedTopic.introAudioText
      ? selectedTopic.introAudioText
      : `Question: ${activeQuestion}`;
    speakExaminerQuestion(intro);
  }, [selectedTopic.id, currentQuestionIndex]);

  // Start Live Microphone Speech-to-Text
  const handleStartRecording = () => {
    stopSpeech();
    setIsExaminerSpeaking(false);
    setIsPlayingModelAnswer(false);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setUserSpeechText(prev => {
              const combined = (prev + ' ' + finalTranscript).replace(/\s+/g, ' ').trim();
              return combined;
            });
          }
          setSpeechInterim(interimTranscript);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
        };

        recognition.onend = () => {
          // Keep state consistent
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
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    // Combine any remaining interim
    if (speechInterim) {
      setUserSpeechText(prev => (prev + ' ' + speechInterim).trim());
      setSpeechInterim('');
    }
  };

  // Evaluate candidate answer with 4-Stage Engine & Spoken Audio Feedback
  const handleEvaluate = async () => {
    const textToEvaluate = (userSpeechText + ' ' + speechInterim).trim();
    if (!textToEvaluate) return;

    if (isRecording) {
      handleStopRecording();
    }

    setIsEvaluating(true);
    stopSpeech();

    try {
      const apiKey = loadApiKey();
      const model = loadModel();

      let report: SpeakingEvaluationReport;
      if (apiKey) {
        report = await evaluateSpokenTurnWithGemini(
          apiKey,
          model,
          activeQuestion,
          textToEvaluate,
          selectedTopic,
          recordSeconds
        );
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

      // Add to conversation turns
      const candidateTurn: SpeakingTurn = {
        id: `turn-cand-${Date.now()}`,
        role: 'candidate',
        text: textToEvaluate,
        timestamp: Date.now(),
        audioDurationSec: recordSeconds,
        report
      };
      setTurns(prev => [...prev, candidateTurn]);

      // Play real-time spoken audio feedback from examiner
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

  // Next Question in current topic
  const handleNextQuestion = () => {
    stopSpeech();
    setUserSpeechText('');
    setSpeechInterim('');
    setCurrentReport(null);
    setRecordSeconds(0);
    setIsRecording(false);
    setPrepTimeRemaining(60);
    setIsPrepRunning(false);

    if (currentQuestionIndex + 1 < selectedTopic.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Advance to next random topic
      handlePickRandomTopic();
    }
  };

  // Pick a Random Conversation Topic
  const handlePickRandomTopic = () => {
    stopSpeech();
    setUserSpeechText('');
    setSpeechInterim('');
    setCurrentReport(null);
    setRecordSeconds(0);
    setIsRecording(false);
    setPrepTimeRemaining(60);
    setIsPrepRunning(false);

    const otherTopics = RANDOM_SPEAKING_TOPICS.filter(t => t.id !== selectedTopic.id);
    const randomChoice = otherTopics[Math.floor(Math.random() * otherTopics.length)] || RANDOM_SPEAKING_TOPICS[0];
    setSelectedTopic(randomChoice);
    setCurrentQuestionIndex(0);
    setIsRandomMode(true);
  };

  // Select Cambridge Test or Custom Topic
  const handleSelectTopic = (topic: SpeakingTopic) => {
    stopSpeech();
    setUserSpeechText('');
    setSpeechInterim('');
    setCurrentReport(null);
    setRecordSeconds(0);
    setIsRecording(false);
    setPrepTimeRemaining(60);
    setIsPrepRunning(false);
    setSelectedTopic(topic);
    setCurrentQuestionIndex(0);
    setIsRandomMode(topic.id.startsWith('rnd-'));
  };

  // Play Native Band 8.5 Model Spoken Answer
  const handlePlayModelAnswer = () => {
    if (isPlayingModelAnswer) {
      stopSpeech();
      setIsPlayingModelAnswer(false);
      return;
    }
    stopSpeech();
    setIsExaminerSpeaking(false);
    setIsPlayingModelAnswer(true);

    const textToSpeak = currentReport?.band8ModelAnswer || selectedTopic.sampleBand8Answer;
    playSpeech(textToSpeak, {
      rate: 0.92,
      onStart: () => setIsPlayingModelAnswer(true),
      onEnd: () => setIsPlayingModelAnswer(false),
      onError: () => setIsPlayingModelAnswer(false)
    });
  };

  // Format seconds into mm:ss
  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & MODE CONTROLS                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onBackToHub();
              }}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Return to Cambridge Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                IELTS Speaking Tutor AI · Real-Time Audio & Multi-Stage
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">Official Cambridge Rubric</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <span>{selectedTopic.topic}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-normal">
                Part {selectedTopic.part}
              </span>
            </h1>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Random Spontaneous Conversation Button */}
          <button
            type="button"
            onClick={handlePickRandomTopic}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
              isRandomMode
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-200'
                : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-300" />
            <span>🎲 Random Conversation</span>
          </button>

          {/* Examiner Audio Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (examinerAudioEnabled) stopSpeech();
              setExaminerAudioEnabled(prev => !prev);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              examinerAudioEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title="Toggle Examiner voice audio output"
          >
            {examinerAudioEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Voice: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span>Voice: MUTED</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Topic Selector Pills */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto max-w-full">
        {ALL_TOPICS.map(t => {
          const isSelected = selectedTopic.id === t.id;
          const isC1 = t.id.startsWith('c1-');
          const isRnd = t.id.startsWith('rnd-');
          const badge = isRnd ? '🎲 Spontaneous' : isC1 ? 'C1 Official' : 'C18 Official';

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTopic(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <span>{t.topic}</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20 text-indigo-200' : 'bg-slate-200 text-slate-600'}`}>
                {badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. REAL-TIME AI EXAMINER ROOM & MICROPHONE PIPELINE            */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Examiner Dialogue & Audio Live Microphone (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* AI Examiner Dialogue Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-sm transition-all ${
                  isExaminerSpeaking
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 animate-pulse ring-4 ring-indigo-100'
                    : 'bg-slate-900'
                }`}>
                  {isExaminerSpeaking ? '🔊' : 'AI'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">IELTS Senior Examiner</span>
                    {isExaminerSpeaking && (
                      <span className="text-[10px] font-bold text-indigo-600 animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        Speaking live...
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">British Accent · Real-Time Audio Feedback</span>
                </div>
              </div>

              {/* Examiner Audio Replay Button */}
              <button
                type="button"
                onClick={() => {
                  const speech = currentReport?.examinerSpokenFeedback || `Question: ${activeQuestion}`;
                  speakExaminerQuestion(speech);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Replay Examiner Question or Feedback"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Replay Voice</span>
              </button>
            </div>

            {/* Examiner Question or Real-Time Spoken Critique */}
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono">
                  {currentReport ? 'Examiner Real-Time Spoken Critique:' : `Question ${currentQuestionIndex + 1} of ${selectedTopic.questions.length}:`}
                </span>
                {selectedTopic.part === 2 && (
                  <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>1 Min Prep + 2 Min Turn</span>
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base font-serif text-slate-900 leading-relaxed font-medium">
                {currentReport ? currentReport.examinerSpokenFeedback : activeQuestion}
              </p>

              {showSinhala && currentReport?.examinerSpokenFeedbackSi && (
                <p className="text-xs text-indigo-800/80 font-sinhala pt-1 border-t border-indigo-100/60">
                  💡 {currentReport.examinerSpokenFeedbackSi}
                </p>
              )}

              {/* Part 2 Cue Card Bullet Points if present */}
              {selectedTopic.cueCardPoints && (
                <div className="pt-2 border-t border-indigo-100 mt-2 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-900 block">You should say:</span>
                  <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                    {selectedTopic.cueCardPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Next Question Control */}
            {currentReport && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  Ready for the next turn?
                </span>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Candidate Live Speech Recorder & Transcript Card */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono block">
                  Candidate Spoken Turn
                </span>
                <span className="text-xs text-slate-400">Speak into your microphone or refine text below</span>
              </div>

              {/* Part 2: 1-Min Prep Countdown Timer */}
              {selectedTopic.part === 2 && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                  <div className="text-center">
                    <span className="text-[9px] uppercase font-bold text-amber-300 block">Prep Time</span>
                    <span className="text-lg font-mono font-bold text-white">{prepTimeRemaining}s</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrepRunning(prev => !prev)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {isPrepRunning ? 'Pause' : 'Start 1m'}
                  </button>
                </div>
              )}
            </div>

            {/* Recorder Controls Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-rose-900/40 cursor-pointer"
                  >
                    <Mic className="w-4 h-4 animate-pulse" />
                    <span>Start Speaking</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <MicOff className="w-4 h-4 text-rose-400" />
                    <span>Stop Recording</span>
                  </button>
                )}

                {/* Live Timer & Waveform Indicator */}
                {isRecording && (
                  <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-800/80 px-3 py-1.5 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-mono font-bold text-rose-200">
                      {formatSec(recordSeconds)}
                    </span>
                    <span className="text-[10px] text-rose-300 font-sans hidden sm:inline">Recording...</span>
                  </div>
                )}
              </div>

              {/* Evaluate Button */}
              <button
                type="button"
                onClick={handleEvaluate}
                disabled={isEvaluating || (!userSpeechText && !speechInterim)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
                  !userSpeechText && !speechInterim
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : isEvaluating
                    ? 'bg-indigo-700 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 cursor-pointer'
                }`}
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Evaluating Speech...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Evaluate Spoken Turn</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Speech Recognition Transcript Box (Editable) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Spoken Transcript (Live or Edit):</span>
                {userSpeechText && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserSpeechText('');
                      setSpeechInterim('');
                    }}
                    className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Clear Text
                  </button>
                )}
              </label>

              <div className="relative">
                <textarea
                  value={userSpeechText}
                  onChange={(e) => setUserSpeechText(e.target.value)}
                  placeholder="Click 'Start Speaking' and answer the examiner aloud, or type your spoken response here..."
                  rows={4}
                  className="w-full rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 text-xs sm:text-sm font-serif text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 leading-relaxed resize-none"
                />

                {/* Interim speech ghost overlay */}
                {speechInterim && (
                  <div className="absolute bottom-3 left-3.5 right-3.5 text-xs sm:text-sm font-serif text-indigo-300/80 italic pointer-events-none truncate">
                    ...{speechInterim}
                  </div>
                )}
              </div>

              {/* Real-time word count & speech speed tracker */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                <span>Words: {userSpeechText.trim().split(/\s+/).filter(Boolean).length}</span>
                {recordSeconds > 0 && userSpeechText && (
                  <span>
                    Est. Pace: {Math.round((userSpeechText.trim().split(/\s+/).filter(Boolean).length / Math.max(recordSeconds, 5)) * 60)} WPM (Normal IELTS: 110-150)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stage 4 Model Answer & Examiner Rubric (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Band 8.5 Native Model Spoken Answer Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Band 8.5+ Native Model Answer</span>
              </span>

              {/* Model Audio Listen Button */}
              <button
                type="button"
                onClick={handlePlayModelAnswer}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                {isPlayingModelAnswer ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Pause Audio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-indigo-600" />
                    <span>🔊 Listen Native</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-200">
              "{currentReport?.band8ModelAnswer || selectedTopic.sampleBand8Answer}"
            </p>

            {/* Examiner Assessment Tips */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-900 block">
                Examiner High-Scoring Tips:
              </span>
              <div className="space-y-1.5">
                {(currentReport?.band8AudioTips || selectedTopic.examinerTips).map((tip, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* The 4 Speaking Criteria Reference Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-900 block border-b border-slate-100 pb-2">
              Official IELTS Speaking Criteria
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block text-[11px]">FC · Fluency & Coherence</span>
                <span className="text-[10px] text-slate-500">Flow, natural pauses, minimal fillers.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block text-[11px]">LR · Lexical Resource</span>
                <span className="text-[10px] text-slate-500">Spoken collocations & idioms.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block text-[11px]">GRA · Grammar Range</span>
                <span className="text-[10px] text-slate-500">Subject-verb agreement & clauses.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block text-[11px]">PR · Pronunciation</span>
                <span className="text-[10px] text-slate-500">Cadence, stress & contractions.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. MULTI-STAGE PEDAGOGICAL EVALUATION PANEL (EXACT WRITING)   */}
      {/* ------------------------------------------------------------- */}
      {currentReport && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6 animate-in fade-in duration-300">
          {/* Stage Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                  Turn {turns.length} Evaluation
                </span>
                <span className="text-xs text-slate-500">Official Cambridge Assessment Engine</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                Diagnostic Spoken Report & Interactive Upgrades
              </h2>
            </div>

            {/* Stage Tabs (Exact same 4 stages as Writing Tutor AI) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveStageTab('stage1')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeStageTab === 'stage1'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span>Stage 1 · Assessment</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStageTab('stage2')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeStageTab === 'stage2'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Stage 2 · Corrections ({currentReport.issues.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStageTab('stage3')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeStageTab === 'stage3'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Stage 3 · Live Score Simulator</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStageTab('stage4')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeStageTab === 'stage4'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Stage 4 · Model Answer</span>
              </button>
            </div>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* STAGE 1: ASSESSMENT CRITERIA & OVERALL BAND SCORE           */}
          {/* ----------------------------------------------------------- */}
          {activeStageTab === 'stage1' && (
            <div className="space-y-6">
              {/* Overall Band Banner */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 font-mono">
                      Official IELTS Speaking Result
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                      Confidence: High
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold">
                    Estimated Overall Band: <span className="text-amber-400 font-mono text-3xl">{formatBand(currentReport.overallBand)}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    Based on your spoken turn, you demonstrated a coherent communicative attempt. Advancing to Band 8 requires reducing fillers and deploying natural idiomatic collocations.
                  </p>
                </div>

                {/* Fluency Metrics Pill */}
                {currentReport.fluencyMetrics && (
                  <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/10 shrink-0 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-indigo-200 block uppercase">Word Count</span>
                      <strong className="text-base text-white">{currentReport.fluencyMetrics.wordCount}</strong>
                    </div>
                    <div className="h-7 w-px bg-white/20" />
                    <div>
                      <span className="text-[10px] text-indigo-200 block uppercase">Pace</span>
                      <strong className="text-base text-white">{currentReport.fluencyMetrics.wordsPerMinute} WPM</strong>
                    </div>
                    <div className="h-7 w-px bg-white/20" />
                    <div>
                      <span className="text-[10px] text-indigo-200 block uppercase">Fillers</span>
                      <strong className="text-base text-rose-400">{currentReport.fluencyMetrics.fillerCount}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* 4 Assessment Criteria Cards (FC, LR, GRA, PR) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentReport.criteria.map(crit => (
                  <div
                    key={crit.key}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{crit.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">{crit.key} Descriptor</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold font-mono text-slate-900">{formatBand(crit.band)}</span>
                        <span className="text-[10px] text-slate-400 font-mono">/ 9.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {crit.comment}
                    </p>

                    {showSinhala && crit.commentSi && (
                      <p className="text-[11px] text-indigo-900 font-sinhala bg-indigo-50/60 p-2 rounded-xl">
                        💡 {crit.commentSi}
                      </p>
                    )}

                    {crit.toReach8 && (
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-800 bg-emerald-50/60 p-2.5 rounded-xl">
                        <span className="font-bold block text-[10px] uppercase tracking-wider text-emerald-900 mb-0.5">
                          How to reach Band 8.0:
                        </span>
                        {crit.toReach8}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Main Problems / Spoken Diagnostics */}
              {currentReport.mainProblems.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Key Areas for Immediate Improvement
                  </h4>
                  <div className="space-y-2">
                    {currentReport.mainProblems.map((prob, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3"
                      >
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md uppercase shrink-0 mt-0.5 ${
                          prob.severity === 'High'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {prob.severity} Priority
                        </span>
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-slate-900">{prob.title}</h5>
                          <p className="text-xs text-slate-600 leading-relaxed">{prob.description}</p>
                          {showSinhala && prob.descriptionSi && (
                            <p className="text-[11px] text-slate-500 font-sinhala">💡 {prob.descriptionSi}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* STAGE 2: CORRECTION PASS (INLINE STRIKETHROUGH + RULES)     */}
          {/* ----------------------------------------------------------- */}
          {activeStageTab === 'stage2' && (
            <div className="space-y-6">
              {/* Strikethrough Transcript Surface */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Exact Spoken Sentences Transcribed & Marked</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    <span className="line-through text-rose-500 font-serif mr-1">striked</span> = error · <span className="text-emerald-700 font-bold font-serif">green</span> = correction
                  </span>
                </div>

                <div className="font-serif text-sm sm:text-base leading-8 text-slate-800 whitespace-pre-wrap select-text">
                  {currentReport.markedSpeech.map((seg, idx) => {
                    if (seg.type === 'text') {
                      return <span key={idx}>{seg.text}</span>;
                    }
                    if (seg.type === 'del') {
                      return (
                        <del
                          key={idx}
                          className="line-through decoration-rose-500 decoration-2 text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-bold mx-0.5"
                          title="Unnecessary filler or slip"
                        >
                          {seg.text}
                        </del>
                      );
                    }
                    if (seg.type === 'replace') {
                      return (
                        <span key={idx} className="inline-flex items-center gap-1 mx-1">
                          <del className="line-through decoration-rose-500 decoration-2 text-rose-600 bg-rose-50 px-1 rounded text-sm">
                            {seg.text}
                          </del>
                          <ins className="no-underline text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 rounded font-bold text-sm">
                            {seg.to}
                          </ins>
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              {/* List of Detected Issues with Rules & Sinhala Guidance */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Detected Grammatical Slips & Explanations ({currentReport.issues.length})
                </h4>

                {currentReport.issues.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Flawless spoken grammar! No subject-verb agreement or tense errors detected in this turn.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentReport.issues.map((iss, i) => (
                      <div
                        key={iss.id || i}
                        className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{iss.title}</span>
                            {iss.tag && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                                {iss.tag}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-serif">
                            <span className="line-through text-rose-600">"{iss.original}"</span>
                            <span>→</span>
                            <span className="font-bold text-emerald-700">"{iss.corrected}"</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">
                          <strong className="text-slate-900">Why is this wrong? </strong>
                          {iss.why}
                        </p>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Official Rule:</span>
                          {iss.rule}
                        </div>

                        {showSinhala && iss.whySi && (
                          <div className="text-[11px] text-indigo-900 font-sinhala bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
                            💡 {iss.whySi}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* STAGE 3: SPOKEN UPGRADES & LIVE DYNAMIC SCORE SIMULATOR     */}
          {/* ----------------------------------------------------------- */}
          {activeStageTab === 'stage3' && (
            <SpeakingInteractiveUpgradesSandbox
              spokenText={currentReport.spokenText}
              segments={currentReport.band8Edits}
              stage2Criteria={currentReport.stage2Criteria}
              stage2Band={currentReport.stage2Band}
              showSinhala={showSinhala}
            />
          )}

          {/* ----------------------------------------------------------- */}
          {/* STAGE 4: MODEL NATIVE SPOKEN ANSWER                         */}
          {/* ----------------------------------------------------------- */}
          {activeStageTab === 'stage4' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Band 8.5/9.0 Polished Spoken Delivery
                  </h3>
                  <span className="text-xs text-slate-500">Native British Cadence & Natural Discourse Markers</span>
                </div>

                <button
                  type="button"
                  onClick={handlePlayModelAnswer}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {isPlayingModelAnswer ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>🔊 Listen to Model Answer</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 font-serif text-sm sm:text-base leading-relaxed text-slate-800 space-y-3">
                <p className="italic">
                  "{currentReport.band8ModelAnswer}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono block">
                    Discourse Markers
                  </span>
                  <p className="text-xs text-slate-700">
                    "From my perspective", "Having said that", "Consequently"
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono block">
                    Idiomatic Collocations
                  </span>
                  <p className="text-xs text-slate-700">
                    "Strike a delicate balance", "A double-edged sword", "Broaden one's horizons"
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 font-mono block">
                    Pronunciation Phrasing
                  </span>
                  <p className="text-xs text-slate-700">
                    Smooth contractions ("I've", "it's"), connected speech, expressive intonation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
