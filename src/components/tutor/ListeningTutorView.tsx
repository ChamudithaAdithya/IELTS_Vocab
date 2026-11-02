import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Volume2, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Headphones, 
  Clock, 
  Award, 
  RotateCcw, 
  Sparkles, 
  FileText, 
  VolumeX, 
  Target, 
  ArrowRight, 
  ShieldAlert, 
  FastForward, 
  Rewind, 
  Check, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Layers, 
  X,
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { CAMBRIDGE_LISTENING_TESTS } from '../../data/listeningTests';
import type { ListeningItem, ListeningAIReport, ListeningQuestion } from '../../types/tutor';
import { evaluateListeningPerformance } from '../../utils/listeningEvaluator';

export interface ListeningTutorViewProps {
  showSinhala: boolean;
  onBackToHub?: () => void;
  initialTestId?: string;
}

export interface QuestionGroup {
  type: 'mcq' | 'gap_fill';
  startNum: number;
  endNum: number;
  instruction: string;
  questions: ListeningQuestion[];
}

export const ListeningTutorView: React.FC<ListeningTutorViewProps> = ({ 
  showSinhala, 
  onBackToHub,
  initialTestId
}) => {
  // 1. Test Selection State
  const initialTest = useMemo(() => {
    if (initialTestId) {
      const found = CAMBRIDGE_LISTENING_TESTS.find(t => t.id === initialTestId);
      if (found) return found;
    }
    return CAMBRIDGE_LISTENING_TESTS[0];
  }, [initialTestId]);

  const [selectedBook, setSelectedBook] = useState<number | 'all'>(initialTest.bookNumber || 1);
  const [selectedTestNum, setSelectedTestNum] = useState<number>(initialTest.testNumber || 1);
  const [selectedTest, setSelectedTest] = useState<ListeningItem>(initialTest);
  const [testMode, setTestMode] = useState<'practice' | 'exam'>('practice');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  // 2. Layout Mode: 'one-screen' (All 10 questions side-by-side) | 'by-task' (Q1-5 / Q6-10 tabs) | 'single' (1-by-1 focus)
  const [layoutMode, setLayoutMode] = useState<'one-screen' | 'by-task' | 'single'>('one-screen');
  const [activeTaskTab, setActiveTaskTab] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [focusedQuestionNum, setFocusedQuestionNum] = useState<number | null>(null);

  // 3. Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

  // 4. AI Evaluation State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<ListeningAIReport | null>(null);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  // 5. Exam Countdown Timer (30 minutes for listening test session)
  const [examSecondsLeft, setExamSecondsLeft] = useState<number>(30 * 60);

  // 6. Fullscreen Mode State & Controller
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any)?.webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  };

  // Filter lists for book, test, and sections
  const availableBooks = useMemo(() => {
    return Array.from(new Set(CAMBRIDGE_LISTENING_TESTS.map(t => t.bookNumber || 1))).sort((a, b) => b - a);
  }, []);

  const testsInBook = useMemo(() => {
    return CAMBRIDGE_LISTENING_TESTS.filter(t => selectedBook === 'all' || t.bookNumber === selectedBook);
  }, [selectedBook]);

  const availableTestNums = useMemo(() => {
    return Array.from(new Set(testsInBook.map(t => t.testNumber || 1))).sort((a, b) => a - b);
  }, [testsInBook]);

  const sectionsInTest = useMemo(() => {
    return testsInBook.filter(t => (t.testNumber || 1) === selectedTestNum);
  }, [testsInBook, selectedTestNum]);

  // Handle Switching Test
  const switchTest = (targetTest: ListeningItem) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSelectedTest(targetTest);
    setSelectedBook(targetTest.bookNumber || 1);
    setSelectedTestNum(targetTest.testNumber || 1);
    setUserAnswers({});
    setAiReport(null);
    setShowAiModal(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setShowTranscript(false);
    setActiveTaskTab(0);
    setCurrentQuestionIndex(0);
    setExamSecondsLeft(30 * 60);
  };

  // Group questions into Sub-Tasks (e.g. Q1-5 MCQ, Q6-10 Note completion)
  const questionGroups = useMemo<QuestionGroup[]>(() => {
    const groups: QuestionGroup[] = [];
    let current: QuestionGroup | null = null;

    for (const q of selectedTest.questions) {
      const isMcq = q.type === 'mcq' || (q.options && q.options.length > 0);
      const groupType: 'mcq' | 'gap_fill' = isMcq ? 'mcq' : 'gap_fill';

      if (!current || current.type !== groupType) {
        if (current) groups.push(current);
        current = {
          type: groupType,
          startNum: q.number,
          endNum: q.number,
          instruction: groupType === 'mcq'
            ? 'Choose the correct letter, A, B, C or D.'
            : 'Complete the notes below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
          questions: [q]
        };
      } else {
        current.endNum = q.number;
        current.questions.push(q);
      }
    }
    if (current) groups.push(current);

    // If single large group (>6 questions), divide cleanly into 2 columns for comfortable side-by-side view
    if (groups.length === 1 && groups[0].questions.length > 5) {
      const allQ = groups[0].questions;
      const mid = Math.ceil(allQ.length / 2);
      const g1: QuestionGroup = {
        type: groups[0].type,
        startNum: allQ[0].number,
        endNum: allQ[mid - 1].number,
        instruction: groups[0].instruction,
        questions: allQ.slice(0, mid)
      };
      const g2: QuestionGroup = {
        type: groups[0].type,
        startNum: allQ[mid].number,
        endNum: allQ[allQ.length - 1].number,
        instruction: groups[0].instruction,
        questions: allQ.slice(mid)
      };
      return [g1, g2];
    }

    return groups;
  }, [selectedTest]);

  // Audio Playback Controls
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        fallbackSpeakTranscript();
      });
    }
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration || 300, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const fallbackSpeakTranscript = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(selectedTest.audioSimText);
    utter.lang = 'en-GB';
    utter.rate = playbackRate;
    utter.onend = () => setIsPlaying(false);
    utter.onerror = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utter);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleRateChange = (r: number) => {
    setPlaybackRate(r);
    if (audioRef.current) {
      audioRef.current.playbackRate = r;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Answer Input Handlers
  const handleSelectOption = (qNum: number, letter: string) => {
    if (aiReport) return;
    setUserAnswers(prev => ({ ...prev, [qNum]: letter }));
    setFocusedQuestionNum(qNum);
  };

  const handleInputChange = (qNum: number, text: string) => {
    if (aiReport) return;
    setUserAnswers(prev => ({ ...prev, [qNum]: text }));
    setFocusedQuestionNum(qNum);
  };

  const resetTest = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setUserAnswers({});
    setAiReport(null);
    setShowAiModal(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setShowTranscript(false);
    setExamSecondsLeft(30 * 60);
  };

  const handleSubmitAndEvaluate = () => {
    setIsEvaluating(true);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setTimeout(() => {
      const report = evaluateListeningPerformance(selectedTest, userAnswers);
      setAiReport(report);
      setIsEvaluating(false);
      setShowAiModal(true);
    }, 500);
  };

  // Keyboard navigation for Focus Mode
  useEffect(() => {
    if (layoutMode !== 'single') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentQuestionIndex(prev => Math.min(selectedTest.questions.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
      } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
        const q = selectedTest.questions[currentQuestionIndex];
        if (q && (q.type === 'mcq' || (q.options && q.options.length > 0))) {
          handleSelectOption(q.number, e.key.toUpperCase());
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layoutMode, currentQuestionIndex, selectedTest.questions]);

  // Exam timer countdown
  useEffect(() => {
    let timer: any = null;
    if (testMode === 'exam' && !aiReport && examSecondsLeft > 0) {
      timer = setInterval(() => {
        setExamSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitAndEvaluate();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testMode, aiReport, examSecondsLeft]);

  const total = selectedTest.questions.length;
  const answeredCount = Object.keys(userAnswers).filter(k => (userAnswers[Number(k)] || '').trim()).length;
  const progressPercent = Math.round((answeredCount / total) * 100);

  // Jump smoothly to question
  const scrollToQuestion = (num: number) => {
    setFocusedQuestionNum(num);
    const qIndex = selectedTest.questions.findIndex(q => q.number === num);
    if (qIndex !== -1) setCurrentQuestionIndex(qIndex);

    // Switch task tab if in by-task mode
    if (layoutMode === 'by-task') {
      const gIdx = questionGroups.findIndex(g => g.questions.some(q => q.number === num));
      if (gIdx !== -1) setActiveTaskTab(gIdx);
    }

    const el = document.getElementById(`q-box-${num}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Helper renderer for a single question item (compact, zero-scroll friendly)
  const renderQuestionCard = (q: ListeningQuestion) => {
    const userAns = (userAnswers[q.number] || '').trim();
    const feedback = aiReport?.questionBreakdown.find(b => b.number === q.number);
    const isMcq = q.type === 'mcq' || (q.options && q.options.length > 0);
    const isFocused = focusedQuestionNum === q.number;

    return (
      <div
        key={q.number}
        id={`q-box-${q.number}`}
        className={`p-2.5 sm:p-3 rounded-xl border transition-all text-xs ${
          feedback
            ? feedback.isCorrect
              ? 'bg-emerald-50/60 border-emerald-300'
              : feedback.errorType === 'distractor_trap'
              ? 'bg-amber-50/70 border-amber-300'
              : 'bg-rose-50/60 border-rose-300'
            : isFocused
            ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-2xs'
            : userAns
            ? 'bg-indigo-50/30 border-indigo-200'
            : 'bg-white border-slate-200/90 hover:border-slate-300'
        }`}
      >
        {/* Question Header */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-900 text-white font-mono font-bold text-[11px] shrink-0">
              {q.number}
            </span>
            <span className="font-semibold text-slate-900 text-xs leading-snug">
              {q.question}
            </span>
          </div>

          {feedback && (
            <div className="shrink-0">
              {feedback.isCorrect ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Correct</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-full font-mono">
                  <XCircle className="w-3 h-3 text-rose-600" />
                  <span>Slip</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* MCQ Option Pills (2x2 or compact row) */}
        {isMcq && q.options && q.options.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
            {q.options.map((optRaw, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const cleanText = optRaw.replace(/^[A-H]:\s*/, '');
              const isSelected = userAns.toUpperCase() === letter;
              const isOfficial = q.answer.trim().toUpperCase() === letter;

              let style = 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200';
              let badgeStyle = 'bg-white text-slate-700 border-slate-300';

              if (aiReport) {
                if (isOfficial) {
                  style = 'bg-emerald-100/80 text-emerald-950 border-emerald-400 font-bold ring-1 ring-emerald-500/30';
                  badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                } else if (isSelected) {
                  style = 'bg-rose-100/80 text-rose-950 border-rose-300 ring-1 ring-rose-400/30';
                  badgeStyle = 'bg-rose-600 text-white border-rose-600';
                } else {
                  style = 'bg-slate-50/50 text-slate-400 border-slate-200 opacity-50';
                }
              } else if (isSelected) {
                style = 'bg-indigo-100/90 text-indigo-950 border-indigo-500 font-bold ring-2 ring-indigo-500/20 shadow-2xs';
                badgeStyle = 'bg-indigo-600 text-white border-indigo-600';
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={!!aiReport}
                  onClick={() => handleSelectOption(q.number, letter)}
                  className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${style}`}
                >
                  <span className={`w-4 h-4 rounded text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border ${badgeStyle}`}>
                    {letter}
                  </span>
                  <span className="text-[11px] truncate leading-tight flex-1" title={cleanText}>
                    {cleanText}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Gap Fill Input Line */
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="text"
              disabled={!!aiReport}
              value={userAns}
              onChange={e => handleInputChange(q.number, e.target.value)}
              placeholder="Type answer here..."
              className="flex-1 max-w-xs px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white disabled:bg-slate-100 disabled:text-slate-800"
            />
            {!aiReport && userAns && (
              <button
                type="button"
                onClick={() => handleInputChange(q.number, '')}
                className="text-[10px] text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Review Mode Inline Diagnosis */}
        {feedback && (
          <div className="mt-2 pt-1.5 border-t border-slate-200 text-[11px] space-y-1">
            <div className="flex items-center gap-2 flex-wrap font-mono">
              <span className="text-slate-600 font-sans">Official:</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                {q.answer}
              </span>
              {feedback.errorType === 'distractor_trap' && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-sans">
                  ⚠️ Trap Triggered
                </span>
              )}
            </div>
            <p className="text-slate-600 text-[11px] leading-tight">
              {q.explanation}
            </p>
            {showSinhala && q.explanationSi && (
              <p className="text-slate-700 text-[10.5px] font-sinhala leading-tight pt-0.5">
                💡 {q.explanationSi}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen bg-slate-100'
          : 'h-[calc(100vh-3.5rem)] bg-slate-100/70'
      } flex flex-col overflow-hidden font-sans select-none animate-in fade-in`}
    >
      {/* Hidden Audio Element */}
      {selectedTest.audioUrl && (
        <audio
          ref={audioRef}
          src={selectedTest.audioUrl}
          onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* 1. TOP DOCKED CONTROL BAR (Height: ~60px) */}
      <div className="bg-slate-900 text-white px-3 sm:px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 z-30">
        {/* Left: Hub Back + Selectors */}
        <div className="flex items-center gap-2 shrink-0">
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Return to Cambridge Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Quick Dropdown: Book */}
          <select
            value={selectedBook}
            onChange={(e) => {
              const b = Number(e.target.value);
              setSelectedBook(b);
              const firstInBook = CAMBRIDGE_LISTENING_TESTS.find(t => t.bookNumber === b);
              if (firstInBook) switchTest(firstInBook);
            }}
            className="text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {availableBooks.map(b => (
              <option key={b} value={b}>Cambridge {b}</option>
            ))}
          </select>

          {/* Quick Dropdown: Test */}
          <select
            value={selectedTestNum}
            onChange={(e) => {
              const tNum = Number(e.target.value);
              setSelectedTestNum(tNum);
              const target = sectionsInTest.find(t => (t.testNumber || 1) === tNum) || testsInBook.find(t => (t.testNumber || 1) === tNum);
              if (target) switchTest(target);
            }}
            className="text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {availableTestNums.map(n => (
              <option key={n} value={n}>Test {n}</option>
            ))}
          </select>

          {/* Practice vs Exam Mode Toggle */}
          <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 text-[11px] font-semibold border border-slate-700">
            <button
              type="button"
              onClick={() => { setTestMode('practice'); setAiReport(null); }}
              className={`px-2 py-0.5 rounded cursor-pointer ${testMode === 'practice' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Practice
            </button>
            <button
              type="button"
              onClick={() => { setTestMode('exam'); setShowTranscript(false); setAiReport(null); }}
              className={`px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer ${testMode === 'exam' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Clock className="w-3 h-3" />
              <span>Exam</span>
            </button>
          </div>
        </div>

        {/* Center: Real Exam Audio Player Strip */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-xl max-w-lg flex-1 justify-center shadow-inner">
          <button
            type="button"
            onClick={togglePlayAudio}
            className={`w-7 h-7 rounded-lg text-white flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0 ${
              isPlaying ? 'bg-amber-500 hover:bg-amber-400' : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
            title={isPlaying ? 'Pause Audio' : 'Play Official Audio'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => skipTime(-10)}
            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
            title="Rewind 10s"
          >
            <Rewind className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => skipTime(10)}
            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
            title="Forward 10s"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono text-slate-300 shrink-0">
            {formatTime(currentTime)} / {formatTime(duration || 300)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 300}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            className="w-20 sm:w-36 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          {/* Speed Toggle */}
          <div className="hidden md:flex items-center gap-1 text-[10px] font-mono">
            {[0.85, 1.0, 1.15, 1.25].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => handleRateChange(r)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${playbackRate === r ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                {r}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleMute}
            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer shrink-0"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Transcript Drawer Toggle (Practice Mode) */}
          {testMode === 'practice' && (
            <button
              type="button"
              onClick={() => setShowTranscript(prev => !prev)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer shrink-0 ${
                showTranscript
                  ? 'bg-white text-slate-900 border-white'
                  : 'bg-slate-700/80 text-slate-300 border-slate-600 hover:text-white'
              }`}
            >
              {showTranscript ? 'Hide Script' : 'Script'}
            </button>
          )}
        </div>

        {/* Right: Progress & Submit Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Answered</span>
            <span className="text-xs font-mono font-bold text-indigo-300">
              {answeredCount}/{total} ({progressPercent}%)
            </span>
          </div>

          {answeredCount > 0 && !aiReport && (
            <button
              type="button"
              onClick={resetTest}
              className="px-2 py-1 text-[11px] text-slate-400 hover:text-white rounded cursor-pointer"
            >
              Reset
            </button>
          )}

          {!aiReport ? (
            <button
              type="button"
              disabled={answeredCount === 0 || isEvaluating}
              onClick={handleSubmitAndEvaluate}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Scoring...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Submit & Score</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Band {aiReport.bandScore.toFixed(1)}</span>
            </button>
          )}

          {/* Fullscreen Button in Top Control Dock */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isFullscreen
                ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:text-white'
            }`}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen CD-IELTS Mode'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. SUB-HEADER: TITLE & ONE-SCREEN VIEW CONTROLS (Height: ~36px) */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 shrink-0 text-xs z-20">
        <div className="flex items-center gap-2 truncate">
          <span className="font-extrabold text-slate-900 truncate">
            Part {selectedTest.section}: {selectedTest.title}
          </span>
          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
            ({selectedTest.cambridgeSource})
          </span>
          {testMode === 'exam' && (
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded">
              ⏱️ {formatTime(examSecondsLeft)}
            </span>
          )}
        </div>

        {/* View Mode Switcher + Fullscreen Pill */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setLayoutMode('one-screen')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                layoutMode === 'one-screen'
                  ? 'bg-white text-indigo-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="All 10 questions side-by-side in one screen (Zero Scrolling)"
            >
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>One-Screen Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode('by-task')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                layoutMode === 'by-task'
                  ? 'bg-white text-indigo-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Split by Task (Q1-5 / Q6-10 tabs)"
            >
              <FileText className="w-3 h-3 text-indigo-600" />
              <span>By Task</span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode('single')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                layoutMode === 'single'
                  ? 'bg-white text-indigo-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Single question focus mode (Use Left/Right arrow keys)"
            >
              <Target className="w-3 h-3 text-indigo-600" />
              <span>Focus 1-by-1</span>
            </button>
          </div>

          {/* Fullscreen Button Pill in Subheader */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              isFullscreen
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen CD-IELTS Exam Mode'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3 h-3 text-amber-600" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3 text-indigo-600" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. MAIN ZERO-SCROLLING WORKSPACE */}
      <div className="flex-1 min-h-0 p-2.5 sm:p-3 overflow-hidden flex relative">
        {/* VIEW MODE 1: ONE-SCREEN GRID (DEFAULT - 2 COLUMNS SIDE-BY-SIDE) */}
        {layoutMode === 'one-screen' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 w-full h-full overflow-hidden">
            {questionGroups.map((group, gIdx) => (
              <div
                key={gIdx}
                className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs flex flex-col h-full overflow-hidden"
              >
                {/* Column Task Header */}
                <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                      Questions {group.startNum}–{group.endNum}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full font-mono">
                      {group.type === 'mcq' ? 'MCQ (A–D)' : 'Note Completion'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]">
                    {group.instruction}
                  </span>
                </div>

                {/* Column Questions (Fitted inside column with subtle smooth scroll only if screen is tiny) */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {group.questions.map(q => renderQuestionCard(q))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW MODE 2: BY-TASK (Q1–5 / Q6–10 TABS - SPACIOUS ZERO-SCROLL) */}
        {layoutMode === 'by-task' && (
          <div className="w-full h-full bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col overflow-hidden">
            {/* Task Tabs Header */}
            <div className="border-b border-slate-200 pb-2 mb-3 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                {questionGroups.map((group, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTaskTab(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      activeTaskTab === idx
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Task {idx + 1}: Questions {group.startNum}–{group.endNum}</span>
                    <span className="text-[10px] opacity-80 font-mono">
                      ({group.questions.filter(q => (userAnswers[q.number] || '').trim()).length}/{group.questions.length})
                    </span>
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-600 font-medium">
                {questionGroups[activeTaskTab]?.instruction}
              </span>
            </div>

            {/* Questions for Active Task */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {questionGroups[activeTaskTab]?.questions.map(q => renderQuestionCard(q))}
            </div>
          </div>
        )}

        {/* VIEW MODE 3: SINGLE QUESTION FOCUS (1-BY-1 ERGONOMIC) */}
        {layoutMode === 'single' && (
          <div className="w-full h-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between overflow-hidden">
            {(() => {
              const q = selectedTest.questions[currentQuestionIndex] || selectedTest.questions[0];
              const userAns = (userAnswers[q.number] || '').trim();
              const feedback = aiReport?.questionBreakdown.find(b => b.number === q.number);
              const isMcq = q.type === 'mcq' || (q.options && q.options.length > 0);

              return (
                <div className="space-y-4">
                  {/* Focus Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                      Question {currentQuestionIndex + 1} of {selectedTest.questions.length} (Q{q.number})
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Use Left / Right Arrow keys
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  {/* Options / Input */}
                  {isMcq && q.options ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((optRaw, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const cleanText = optRaw.replace(/^[A-H]:\s*/, '');
                        const isSelected = userAns.toUpperCase() === letter;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={!!aiReport}
                            onClick={() => handleSelectOption(q.number, letter)}
                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold ring-2 ring-indigo-500/20'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center border ${
                              isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}>
                              {letter}
                            </span>
                            <span className="text-sm font-medium">{cleanText}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Answer:</label>
                      <input
                        type="text"
                        disabled={!!aiReport}
                        value={userAns}
                        onChange={e => handleInputChange(q.number, e.target.value)}
                        placeholder="Type exact answer (e.g. library)..."
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                        autoFocus
                      />
                    </div>
                  )}

                  {feedback && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-800">
                        Official Answer: <code className="text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded">{q.answer}</code>
                      </div>
                      <p className="text-slate-600">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Focus Prev / Next Buttons */}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 disabled:opacity-40 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={currentQuestionIndex === selectedTest.questions.length - 1}
                onClick={() => setCurrentQuestionIndex(prev => Math.min(selectedTest.questions.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PRACTICE MODE AUDIO TRANSCRIPT DRAWER */}
        {showTranscript && testMode === 'practice' && (
          <div className="absolute right-0 top-0 bottom-0 w-80 sm:w-96 bg-white/95 backdrop-blur-md border-l border-slate-200 p-4 shadow-2xl flex flex-col z-40 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Official Script
              </span>
              <button
                type="button"
                onClick={() => setShowTranscript(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-line pr-1 scrollbar-thin">
              {selectedTest.audioSimText}
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM DOCKED BAR: SECTION TABS & QUESTION NAVIGATOR (Height: ~44px) */}
      <div className="bg-white border-t border-slate-200 px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 shrink-0 z-20">
        {/* Sections in current test (Part 1, 2, 3, 4) */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase hidden sm:inline mr-1">
            Section:
          </span>
          {sectionsInTest.map(item => {
            const isSel = selectedTest.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => switchTest(item)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSel
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Part {item.section}
              </button>
            );
          })}
        </div>

        {/* Question Numbers Navigator (Q1 to Q10) */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {selectedTest.questions.map((q, idx) => {
            const hasAns = !!(userAnswers[q.number] || '').trim();
            const fb = aiReport?.questionBreakdown.find(b => b.number === q.number);

            let style = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
            if (fb) {
              style = fb.isCorrect
                ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                : 'bg-rose-600 text-white font-bold border-rose-600';
            } else if (hasAns) {
              style = 'bg-indigo-600 text-white font-bold border-indigo-600';
            }

            return (
              <button
                key={q.number}
                type="button"
                onClick={() => scrollToQuestion(q.number)}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center border transition-all cursor-pointer ${style}`}
                title={`Question ${q.number}${hasAns ? ' (Answered)' : ''}`}
              >
                {q.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. AI EVALUATION DIAGNOSTIC MODAL */}
      {showAiModal && aiReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Official Cambridge Assessment
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    Listening Diagnostic Report
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 scrollbar-thin">
              {/* Score Highlight Box */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-4 text-center">
                <div>
                  <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Estimated Band</div>
                  <div className="text-2xl sm:text-3xl font-black text-indigo-700">
                    Band {aiReport.bandScore.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Raw Score</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    {aiReport.score}/{aiReport.total}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Accuracy</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                    {aiReport.accuracyPercentage}%
                  </div>
                </div>
              </div>

              {/* Trap Susceptibility Alert */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    Distractor Trap Susceptibility:
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    aiReport.distractorVulnerability === 'Low'
                      ? 'bg-emerald-100 text-emerald-800'
                      : aiReport.distractorVulnerability === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {aiReport.distractorVulnerability} Risk
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {aiReport.teacherRecommendation}
                </p>
                {showSinhala && aiReport.teacherRecommendationSi && (
                  <p className="text-xs text-slate-700 font-sinhala leading-relaxed pt-1 border-t border-slate-200">
                    🇱🇰 {aiReport.teacherRecommendationSi}
                  </p>
                )}
              </div>

              {/* Question Breakdown List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Questions Breakdown & Official Explanations:
                </h4>
                <div className="space-y-2">
                  {aiReport.questionBreakdown.map(b => (
                    <div
                      key={b.number}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        b.isCorrect
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : b.errorType === 'distractor_trap'
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-rose-50/50 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-slate-900">
                          Q{b.number}: {b.isCorrect ? '✓ Correct' : '✕ Slip'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Your: <strong className={b.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{b.userAnswer || '(Blank)'}</strong> | Official: <strong className="text-emerald-800">{b.officialAnswer}</strong>
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        {b.explanation}
                      </p>
                      {showSinhala && b.explanationSi && (
                        <p className="text-slate-700 text-[10.5px] font-sinhala pt-0.5">
                          💡 {b.explanationSi}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Review on Exam Screen
              </button>

              {/* Next Section Button if available */}
              {(() => {
                const nextSec = sectionsInTest.find(s => s.section === selectedTest.section + 1);
                if (!nextSec) return null;
                return (
                  <button
                    type="button"
                    onClick={() => switchTest(nextSec)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Proceed to Part {nextSec.section}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
