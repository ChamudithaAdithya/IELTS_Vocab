import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  AlertCircle, 
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
  HelpCircle,
  FastForward,
  Rewind,
  Check,
  ChevronDown,
  Layers,
  ArrowUp
} from 'lucide-react';
import { CAMBRIDGE_LISTENING_TESTS } from '../../data/listeningTests';
import type { ListeningItem, ListeningAIReport, ListeningQuestion } from '../../types/tutor';
import { evaluateListeningPerformance } from '../../utils/listeningEvaluator';

interface ListeningTutorViewProps {
  showSinhala: boolean;
  onBackToHub?: () => void;
}

interface QuestionGroup {
  type: 'mcq' | 'gap_fill';
  startNum: number;
  endNum: number;
  instruction: string;
  questions: ListeningQuestion[];
}

export const ListeningTutorView: React.FC<ListeningTutorViewProps> = ({ showSinhala, onBackToHub }) => {
  // Test Selection State
  const [selectedBook, setSelectedBook] = useState<number | 'all'>(1);
  const [selectedTestNum, setSelectedTestNum] = useState<number>(1);
  const [selectedTest, setSelectedTest] = useState<ListeningItem>(CAMBRIDGE_LISTENING_TESTS[0]);
  const [testMode, setTestMode] = useState<'practice' | 'exam'>('practice');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  
  // Real HTML Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showStickyAudio, setShowStickyAudio] = useState<boolean>(false);

  // AI Evaluation State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<ListeningAIReport | null>(null);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

  // Monitor scroll for sticky audio bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowStickyAudio(true);
      } else {
        setShowStickyAudio(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter tests by selected book
  const availableBooks = Array.from(new Set(CAMBRIDGE_LISTENING_TESTS.map(t => t.bookNumber || 1))).sort((a, b) => b - a);
  
  // Tests in the active book
  const testsInBook = CAMBRIDGE_LISTENING_TESTS.filter(t => 
    selectedBook === 'all' || t.bookNumber === selectedBook
  );

  // Distinct test numbers in current book (e.g. Tests 1, 2, 3, 4)
  const availableTestNums = Array.from(new Set(testsInBook.map(t => t.testNumber || 1))).sort((a, b) => a - b);

  // Sections in the current test (e.g. Sections 1, 2, 3, 4)
  const sectionsInTest = testsInBook.filter(t => (t.testNumber || 1) === selectedTestNum);

  // Update selectedTest when book/test/section changes
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
    setIsPlaying(false);
    setCurrentTime(0);
    setShowTranscript(false);
  };

  // Toggle Audio Play/Pause
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        // Fallback to speech synthesis if audio file cannot be loaded
        fallbackSpeakTranscript();
      });
    }
  };

  // Skip audio forwards / backwards
  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration || 300, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Fallback speech synthesis
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

  const handleSelectOption = (qNum: number, letter: string) => {
    if (aiReport) return;
    setUserAnswers(prev => ({ ...prev, [qNum]: letter }));
  };

  const handleInputChange = (qNum: number, text: string) => {
    if (aiReport) return;
    setUserAnswers(prev => ({ ...prev, [qNum]: text }));
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
    setIsPlaying(false);
    setCurrentTime(0);
    setShowTranscript(false);
  };

  // Submit and run AI evaluation
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
      // Smooth scroll to top of results
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }, 600);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Group questions into subsections (e.g. Q1-5 MCQ, Q6-10 Note completion)
  const questionGroups: QuestionGroup[] = [];
  let currentGroup: QuestionGroup | null = null;

  for (const q of selectedTest.questions) {
    const isMcq = q.type === 'mcq' || (q.options && q.options.length > 0);
    const groupType: 'mcq' | 'gap_fill' = isMcq ? 'mcq' : 'gap_fill';
    
    if (!currentGroup || currentGroup.type !== groupType) {
      if (currentGroup) questionGroups.push(currentGroup);
      currentGroup = {
        type: groupType,
        startNum: q.number,
        endNum: q.number,
        instruction: groupType === 'mcq'
          ? 'Choose the correct letter, A, B, C or D.'
          : 'Complete the notes below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
        questions: [q]
      };
    } else {
      currentGroup.endNum = q.number;
      currentGroup.questions.push(q);
    }
  }
  if (currentGroup) questionGroups.push(currentGroup);

  const total = selectedTest.questions.length;
  const answeredCount = Object.keys(userAnswers).filter(k => (userAnswers[Number(k)] || '').trim()).length;
  const progressPercent = Math.round((answeredCount / total) * 100);

  const scrollToQuestion = (num: number) => {
    const el = document.getElementById(`q-item-${num}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      {/* Hidden HTML5 Audio Element streaming authentic MP3 */}
      {selectedTest.audioUrl && (
        <audio
          ref={audioRef}
          src={selectedTest.audioUrl}
          onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* STICKY FLOATING AUDIO CONTROLLER (Appears when scrolled down) */}
      {showStickyAudio && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-indigo-500/30 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={togglePlayAudio}
              className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => skipTime(-10)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Rewind 10 seconds"
            >
              <Rewind className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => skipTime(10)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Forward 10 seconds"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 min-w-0 px-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span className="truncate max-w-[140px] sm:max-w-xs font-sans font-medium text-white">
                Part {selectedTest.section}: {selectedTest.title}
              </span>
              <span>{formatTime(currentTime)} / {formatTime(duration || 300)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={duration || 300}
              step={0.5}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER & BREADCRUMBS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Return to Tutor Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono">
                Listening Section {selectedTest.section}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {selectedTest.cambridgeSource}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {selectedTest.title}
            </h1>
          </div>
        </div>

        {/* Practice Mode vs Exam Mode Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTestMode('practice');
                setAiReport(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                testMode === 'practice'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Practice Mode
            </button>
            <button
              type="button"
              onClick={() => {
                setTestMode('exam');
                setShowTranscript(false);
                setAiReport(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                testMode === 'exam'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Exam Mode</span>
            </button>
          </div>

          {aiReport && (
            <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs shadow-xs font-sans">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-emerald-400">Band {aiReport.bandScore.toFixed(1)}</span>
              <span className="text-slate-400">({aiReport.score}/{aiReport.total})</span>
            </div>
          )}
        </div>
      </div>

      {/* STRUCTURED TEST SELECTOR SUITE (Book -> Test -> Section) */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Cambridge Book Selection */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Cambridge Edition:
            </span>
            {availableBooks.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  setSelectedBook(b);
                  const firstInBook = CAMBRIDGE_LISTENING_TESTS.find(t => t.bookNumber === b);
                  if (firstInBook) switchTest(firstInBook);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedBook === b
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cambridge {b}
              </button>
            ))}
          </div>

          {/* Test Tabs in selected book (Test 1, Test 2, Test 3, Test 4) */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            {availableTestNums.map(num => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setSelectedTestNum(num);
                  const target = sectionsInTest.find(t => (t.testNumber || 1) === num) || testsInBook.find(t => (t.testNumber || 1) === num);
                  if (target) switchTest(target);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedTestNum === num
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Test {num}
              </button>
            ))}
          </div>
        </div>

        {/* Section (Part 1, 2, 3, 4) Segmented Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/60">
          {sectionsInTest.map(item => {
            const isSelected = selectedTest.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => switchTest(item)}
                className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/10'
                    : 'bg-white/60 hover:bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    Part {item.section}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Q{item.questions[0]?.number}–{item.questions[item.questions.length - 1]?.number}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate" title={item.title}>
                  {item.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* REAL CAMBRIDGE AUDIO PLAYER CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Play/Pause Main Button */}
            <button
              type="button"
              onClick={togglePlayAudio}
              className={`w-14 h-14 rounded-2xl text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer ${
                isPlaying 
                  ? 'bg-amber-500 hover:bg-amber-400 ring-4 ring-amber-500/20' 
                  : 'bg-indigo-600 hover:bg-indigo-500 ring-4 ring-indigo-500/20'
              }`}
              title={isPlaying ? 'Pause Audio' : 'Play Authentic Audio'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            {/* Skip 10s Backward & Forward */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => skipTime(-10)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                title="Rewind 10 seconds"
              >
                <Rewind className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => skipTime(10)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                title="Forward 10 seconds"
              >
                <FastForward className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  Authentic Exam Audio
                </span>
                <span className="text-xs text-indigo-300 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration || 300)}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5 truncate max-w-sm sm:max-w-md">
                {selectedTest.title}
              </h2>
            </div>
          </div>

          {/* Speed & Transcript Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-white/10 backdrop-blur-xs rounded-xl p-1 text-xs">
              <span className="text-[10px] text-slate-400 px-1 font-mono">Speed:</span>
              {[0.85, 1.0, 1.15, 1.25].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRateChange(r)}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                    playbackRate === r
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {r}x
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {testMode === 'practice' && (
              <button
                type="button"
                onClick={() => setShowTranscript(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  showTranscript
                    ? 'bg-white text-slate-900 border-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                }`}
              >
                {showTranscript ? 'Hide Script' : 'Transcript'}
              </button>
            )}
          </div>
        </div>

        {/* Real-time Audio Scrub / Progress Bar */}
        <div className="space-y-1 pt-1">
          <input
            type="range"
            min={0}
            max={duration || 300}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      {/* Collapsible Transcript (Practice Mode Only) */}
      {showTranscript && testMode === 'practice' && (
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-line animate-in fade-in">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 font-sans">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Official Cambridge Audio Transcript:
            </span>
            <span className="text-slate-500 text-[11px]">Notice British / Australian accent markers & stress</span>
          </div>
          {selectedTest.audioSimText}
        </div>
      )}

      {/* QUESTION NAVIGATOR / JUMP PALETTE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Questions Navigator:
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {answeredCount}/{total} Answered ({progressPercent}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Click any question number to scroll directly to it
          </div>
        </div>

        {/* Number Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {selectedTest.questions.map(q => {
            const hasAns = !!(userAnswers[q.number] || '').trim();
            const fb = aiReport?.questionBreakdown.find(b => b.number === q.number);

            let pillStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
            if (fb) {
              pillStyle = fb.isCorrect 
                ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs' 
                : 'bg-red-500 text-white font-bold border-red-500 shadow-xs';
            } else if (hasAns) {
              pillStyle = 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-xs';
            }

            return (
              <button
                key={q.number}
                type="button"
                onClick={() => scrollToQuestion(q.number)}
                className={`w-8 h-8 rounded-xl text-xs font-mono font-bold flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${pillStyle}`}
                title={`Jump to Question ${q.number}`}
              >
                {q.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* QUESTION SECTIONS & INTERACTIVE CARDS */}
      <div className="space-y-6">
        {questionGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
            {/* Section Instruction Banner */}
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white">
                    Questions {group.startNum}–{group.endNum}
                  </span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 font-mono">
                    {group.type === 'mcq' ? 'Multiple Choice (A, B, C, D)' : 'Note / Form Completion'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium mt-1.5 leading-relaxed">
                  {group.instruction}
                </p>
              </div>

              {group.type === 'gap_fill' && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg shrink-0">
                  Word Limit: Max 3 Words / Number
                </span>
              )}
            </div>

            {/* Questions within this group */}
            <div className="space-y-4">
              {group.questions.map(q => {
                const userAns = (userAnswers[q.number] || '').trim();
                const feedback = aiReport?.questionBreakdown.find(b => b.number === q.number);
                const isMcq = q.type === 'mcq' || (q.options && q.options.length > 0);

                return (
                  <div
                    key={q.number}
                    id={`q-item-${q.number}`}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      feedback
                        ? feedback.isCorrect
                          ? 'bg-emerald-50/40 border-emerald-300'
                          : feedback.errorType === 'distractor_trap'
                          ? 'bg-amber-50/50 border-amber-300'
                          : 'bg-red-50/40 border-red-300'
                        : userAns
                        ? 'bg-indigo-50/20 border-indigo-200 shadow-xs'
                        : 'bg-slate-50/50 border-slate-200'
                    }`}
                  >
                    {/* Question Header & Title */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="text-sm font-semibold text-slate-900 leading-snug">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-mono font-bold mr-2.5 shrink-0">
                          {q.number}
                        </span>
                        <span>{q.question}</span>
                      </div>

                      {feedback && (
                        <div className="shrink-0 pt-0.5">
                          {feedback.isCorrect ? (
                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-100/70 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Correct</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600 font-bold text-xs bg-red-100/70 px-2.5 py-1 rounded-full">
                              <XCircle className="w-4 h-4" />
                              <span>Incorrect</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* INTERACTIVE MULTIPLE CHOICE (A, B, C, D) OPTIONS */}
                    {isMcq && q.options && q.options.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {q.options.map((optTextRaw, optIdx) => {
                          const optionLetter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][optIdx] || String.fromCharCode(65 + optIdx);
                          const cleanOptionText = optTextRaw.replace(/^[A-H]:\s*/, '');
                          const isSelected = userAns.toUpperCase() === optionLetter;
                          const isOfficialCorrect = q.answer.trim().toUpperCase() === optionLetter;

                          // Option styling based on state and evaluation
                          let optCardStyle = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';
                          let letterBadgeStyle = 'bg-slate-100 text-slate-700 border-slate-300';

                          if (aiReport) {
                            if (isOfficialCorrect) {
                              optCardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 font-bold';
                              letterBadgeStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                            } else if (isSelected && !isOfficialCorrect) {
                              optCardStyle = 'bg-red-50 border-red-400 text-red-950 ring-2 ring-red-400/20';
                              letterBadgeStyle = 'bg-red-500 text-white border-red-500 font-bold';
                            } else {
                              optCardStyle = 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60';
                            }
                          } else if (isSelected) {
                            optCardStyle = 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-xs';
                            letterBadgeStyle = 'bg-indigo-600 text-white border-indigo-600 font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={!!aiReport}
                              onClick={() => handleSelectOption(q.number, optionLetter)}
                              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${optCardStyle}`}
                            >
                              <div className={`w-6 h-6 rounded-full border text-xs font-mono flex items-center justify-center shrink-0 mt-0.5 ${letterBadgeStyle}`}>
                                {optionLetter}
                              </div>
                              <div className="flex-1 text-xs sm:text-sm leading-snug">
                                {cleanOptionText}
                              </div>
                              {aiReport && isOfficialCorrect && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                                  Correct
                                </span>
                              )}
                              {aiReport && isSelected && !isOfficialCorrect && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-1.5 py-0.5 rounded shrink-0">
                                  Your Choice
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* GAP FILL / NOTE COMPLETION INPUT FIELD */
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            disabled={!!aiReport}
                            value={userAns}
                            onChange={e => handleInputChange(q.number, e.target.value)}
                            placeholder="Type exact answer (e.g. Mary / 165)..."
                            className="w-full max-w-md px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white disabled:bg-slate-100 disabled:text-slate-700"
                          />
                          {!aiReport && userAns && (
                            <button
                              type="button"
                              onClick={() => handleInputChange(q.number, '')}
                              className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 cursor-pointer"
                              title="Clear answer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* POST-EVALUATION FEEDBACK ACCORDION */}
                    {feedback && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200/80 text-xs space-y-2 animate-in fade-in">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900">
                            Official Answer: <code className="text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded font-mono text-xs">{q.answer}</code>
                          </span>

                          {feedback.errorType === 'distractor_trap' && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-200">
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              Cambridge Trap Triggered
                            </span>
                          )}

                          {feedback.errorType === 'spelling_grammar' && (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                              Spelling / Grammar Slip
                            </span>
                          )}
                        </div>

                        <p className="text-slate-700 text-xs leading-relaxed">
                          {q.explanation}
                        </p>

                        {showSinhala && q.explanationSi && (
                          <div className="text-slate-600 text-[11px] leading-relaxed bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
                            <span className="font-bold text-slate-800">💡 විවරණය:</span> {q.explanationSi}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* SUBMIT ACTIONS BAR */}
      {!aiReport && (
        <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="font-bold text-slate-900">{answeredCount} of {total}</span> questions answered
            {answeredCount < total && (
              <span className="text-amber-600 font-medium">({total - answeredCount} remaining)</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={resetTest}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}

            <button
              type="button"
              disabled={answeredCount === 0 || isEvaluating}
              onClick={handleSubmitAndEvaluate}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Evaluating Cambridge Answers & Traps...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Submit Answers & AI Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE AI EVALUATION REPORT MODAL / PANEL */}
      {aiReport && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-mono">
                  Official Cambridge Evaluation
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  Listening Performance Diagnostic
                </h2>
              </div>
            </div>

            {/* Score & Band Card */}
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
              <div className="text-right">
                <div className="text-[11px] text-slate-500 font-medium">Estimated Band</div>
                <div className="text-2xl font-black text-indigo-600">
                  Band {aiReport.bandScore.toFixed(1)}
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="text-right">
                <div className="text-[11px] text-slate-500 font-medium">Score</div>
                <div className="text-2xl font-black text-slate-900">
                  {aiReport.score}/{aiReport.total} ({aiReport.accuracyPercentage}%)
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Distractor Vulnerability Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Distractor Trap Susceptibility:
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  aiReport.distractorVulnerability === 'Low'
                    ? 'bg-emerald-100 text-emerald-800'
                    : aiReport.distractorVulnerability === 'Medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {aiReport.distractorVulnerability} Risk
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {aiReport.distractorVulnerability === 'Low'
                  ? 'Excellent auditory restraint! You avoided preliminary traps and waited for confirmed answers.'
                  : 'Watch out for preliminary numbers, dates or spelling that speakers modify later in the sentence.'}
              </p>
            </div>

            {/* Executive Examiner Summary */}
            <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 space-y-2">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Examiner Assessment Summary:
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {aiReport.executiveSummary}
              </p>
              {showSinhala && (
                <p className="text-[11px] text-indigo-900/80 leading-relaxed pt-1 border-t border-indigo-100">
                  {aiReport.executiveSummarySi}
                </p>
              )}
            </div>
          </div>

          {/* Acoustic & Phonetic Advisory */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-purple-600" />
              Acoustic & Phonetic Focus for Section {selectedTest.section}:
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {aiReport.acousticAnalysis}
            </p>
            {showSinhala && aiReport.acousticAnalysisSi && (
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {aiReport.acousticAnalysisSi}
              </p>
            )}
          </div>

          {/* Action Drills List */}
          {aiReport.recommendedDrills.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Recommended Action Drills:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {aiReport.recommendedDrills.map((drill, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{drill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={resetTest}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry This Section</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const currentIdx = CAMBRIDGE_LISTENING_TESTS.findIndex(t => t.id === selectedTest.id);
                const nextIdx = (currentIdx + 1) % CAMBRIDGE_LISTENING_TESTS.length;
                switchTest(CAMBRIDGE_LISTENING_TESTS[nextIdx]);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Next Cambridge Section</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
