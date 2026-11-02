import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  HelpCircle, 
  Sparkles, 
  Award, 
  Clock, 
  RotateCcw,
  Sliders,
  Check
} from 'lucide-react';
import { CAMBRIDGE_READING_TESTS } from '../../data/readingTests';
import type { ReadingPassage, ReadingQuestion } from '../../types/tutor';

interface ReadingTutorViewProps {
  showSinhala: boolean;
  onBackToHub?: () => void;
  initialPassageId?: string;
}

export const ReadingTutorView: React.FC<ReadingTutorViewProps> = ({ showSinhala, onBackToHub, initialPassageId }) => {
  const [selectedPassage, setSelectedPassage] = useState<ReadingPassage>(() => {
    if (initialPassageId) {
      const found = CAMBRIDGE_READING_TESTS.find(p => p.id === initialPassageId);
      if (found) return found;
    }
    return CAMBRIDGE_READING_TESTS[0];
  });
  const [selectedBook, setSelectedBook] = useState<'all' | number | string>(() => {
    if (initialPassageId) {
      const found = CAMBRIDGE_READING_TESTS.find(p => p.id === initialPassageId);
      if (found) {
        const match = found.cambridgeSource.match(/Cambridge(?:\s+IELTS)?\s+(\d+)/i);
        return match ? parseInt(match[1], 10) : 1;
      }
    }
    return 'all';
  });
  const [testMode, setTestMode] = useState<'practice' | 'exam'>('practice');

  const getBookNumber = (p: ReadingPassage): number => {
    const match = p.cambridgeSource.match(/Cambridge(?:\s+IELTS)?\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : 18;
  };

  const filteredPassages = selectedBook === 'all'
    ? CAMBRIDGE_READING_TESTS
    : CAMBRIDGE_READING_TESTS.filter(p => getBookNumber(p) === Number(selectedBook));
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Exam Mode 20-minute countdown timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(20 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (initialPassageId) {
      const found = CAMBRIDGE_READING_TESTS.find(p => p.id === initialPassageId);
      if (found) {
        setSelectedPassage(found);
        const match = found.cambridgeSource.match(/Cambridge(?:\s+IELTS)?\s+(\d+)/i);
        setSelectedBook(match ? parseInt(match[1], 10) : 1);
        setUserAnswers({});
        setSubmitted(false);
        setActiveQuestionId(null);
        setTimeLeftSeconds(20 * 60);
        setIsTimerRunning(false);
      }
    }
  }, [initialPassageId]);

  useEffect(() => {
    let interval: any = null;
    if (testMode === 'exam' && isTimerRunning && timeLeftSeconds > 0 && !submitted) {
      interval = setInterval(() => {
        setTimeLeftSeconds(prev => prev - 1);
      }, 1000);
    } else if (timeLeftSeconds === 0 && !submitted) {
      setSubmitted(true);
    }
    return () => clearInterval(interval);
  }, [testMode, isTimerRunning, timeLeftSeconds, submitted]);

  const handleSelectAnswer = (qId: string, answer: string) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const isAnswerCorrect = (userAns?: string, official?: string): boolean => {
    if (!userAns || !official) return false;
    const u = userAns.trim().toLowerCase().replace(/[£$,.?!]/g, '').replace(/\s+/g, ' ');
    const parts = official.split(/\/\/|\sor\s|\//).map(p => 
      p.trim().toLowerCase().replace(/[()£$,.?!]/g, '').replace(/\s+/g, ' ')
    );
    if (parts.includes(u)) return true;
    return parts.some(p => {
      if (u === p) return true;
      if (u.replace(/-/g, ' ') === p.replace(/-/g, ' ')) return true;
      if (u + 's' === p || u === p + 's') return true;
      if (p.startsWith(u + ':') || u.startsWith(p + ':')) return true;
      return false;
    });
  };

  const calculateScore = () => {
    let correct = 0;
    selectedPassage.questions.forEach(q => {
      if (isAnswerCorrect(userAnswers[q.id], q.correctAnswer)) {
        correct++;
      }
    });
    return correct;
  };

  const resetTest = () => {
    setUserAnswers({});
    setSubmitted(false);
    setActiveQuestionId(null);
    setTimeLeftSeconds(20 * 60);
    setIsTimerRunning(false);
  };

  const handleChangePassage = (p: ReadingPassage) => {
    setSelectedPassage(p);
    resetTest();
  };

  const score = calculateScore();
  const total = selectedPassage.questions.length;
  // Standard IELTS academic reading band conversion formula
  const estimatedBand = total > 0 ? (score === total ? 9.0 : score >= 3 ? 8.0 : score >= 2 ? 6.5 : 5.0) : 6.0;

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Return to Tutor Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono">
                Academic Reading
              </span>
              <span className="text-xs text-slate-500">{selectedPassage.cambridgeSource}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {selectedPassage.title}
            </h1>
          </div>
        </div>

        {/* Practice vs Exam Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTestMode('practice');
                setIsTimerRunning(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
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
                setIsTimerRunning(true);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                testMode === 'exam'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Exam Mode (20m)</span>
            </button>
          </div>

          {submitted && (
            <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-emerald-400">Band {estimatedBand.toFixed(1)}</span>
              <span className="text-slate-400">({score}/{total})</span>
            </div>
          )}
        </div>
      </div>

      {/* Cambridge Book Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0">
          Cambridge Book:
        </span>
        {[
          { id: 'all', label: `All Books (${CAMBRIDGE_READING_TESTS.length})` },
          { id: 18, label: 'Cambridge 18' },
          { id: 17, label: 'Cambridge 17' },
          { id: 16, label: 'Cambridge 16' },
          { id: 15, label: 'Cambridge 15' },
          { id: 14, label: 'Cambridge 14' },
          { id: 13, label: 'Cambridge 13' },
          { id: 12, label: 'Cambridge 12' },
          { id: 10, label: 'Cambridge 10' },
          { id: 1, label: 'Cambridge 1 (15 Passages)' }
        ].map(b => (
          <button
            key={b.id}
            type="button"
            onClick={() => setSelectedBook(b.id as any)}
            className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
              selectedBook === b.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Passage Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs scrollbar-none">
        {filteredPassages.map((t) => {
          const bNum = getBookNumber(t);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleChangePassage(t)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                selectedPassage.id === t.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-mono opacity-80">Book {bNum}:</span>
              <span className="font-medium text-[11px] truncate max-w-[190px]">{t.title}</span>
            </button>
          );
        })}
      </div>

      {/* Exam Mode Status Bar if active */}
      {testMode === 'exam' && !submitted && (
        <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-bold">Exam Timer:</span>
            <span className="font-mono text-amber-300 font-bold text-sm">{formatTimer(timeLeftSeconds)}</span>
          </div>
          <span className="text-slate-300">Answer all questions before the timer reaches 00:00.</span>
        </div>
      )}

      {/* Main 2-Column Split: Passage vs Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Academic Passage Reader (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Official Reading Passage</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {selectedPassage.paragraphs.length} Paragraphs
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 font-serif leading-relaxed">
            {selectedPassage.paragraphs.map(p => (
              <div
                key={p.label}
                className="p-3.5 rounded-xl bg-slate-50/50 hover:bg-emerald-50/30 transition-colors border border-transparent hover:border-emerald-200"
              >
                <span className="block font-sans font-bold text-[11px] text-emerald-800 uppercase tracking-wider mb-1">
                  [{p.label}]
                </span>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Questions & Instant Analyzer (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800">Questions 1–{total}</span>
              {/* Question Navigator Pills */}
              <div className="flex items-center gap-1">
                {selectedPassage.questions.map((q, idx) => {
                  const answered = Boolean(userAnswers[q.id]);
                  return (
                    <span
                      key={q.id}
                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                        answered ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="space-y-5">
              {selectedPassage.questions.map((q, idx) => {
                const userAns = userAnswers[q.id];
                const isCorrect = isAnswerCorrect(userAns, q.correctAnswer);
                const tfngOpts = q.options && q.options.length === 3 ? q.options : ['TRUE', 'FALSE', 'NOT GIVEN'];

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border transition-all ${
                      submitted
                        ? isCorrect
                          ? 'bg-emerald-50/60 border-emerald-300'
                          : 'bg-red-50/60 border-red-300'
                        : userAns
                        ? 'bg-indigo-50/40 border-indigo-200'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900 leading-snug">
                        {idx + 1}. {q.question}
                      </span>
                      {submitted && (
                        isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        )
                      )}
                    </div>

                    {/* TFNG Options */}
                    {q.type === 'TFNG' ? (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {tfngOpts.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            disabled={submitted}
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                              userAns === opt
                                ? 'bg-slate-900 text-white'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : q.options && q.options.length > 0 ? (
                      /* MCQ Options */
                      <div className="space-y-1.5 mt-3">
                        {q.options.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            disabled={submitted}
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`w-full text-left p-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                              userAns === opt
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      /* Text Input for Summary / Gap-fill / Short Answer */
                      <div className="mt-3">
                        <input
                          type="text"
                          disabled={submitted}
                          value={userAns || ''}
                          onChange={e => handleSelectAnswer(q.id, e.target.value)}
                          placeholder="Type answer from passage..."
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono bg-white disabled:bg-slate-100 text-slate-900"
                        />
                      </div>
                    )}

                    {/* Explanation and Vocabulary Focus on Submission */}
                    {submitted && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 text-xs animate-in fade-in">
                        <div>
                          <span className="font-bold text-slate-900 block">
                            Correct Answer: <span className="text-emerald-700 font-bold">{q.correctAnswer}</span> ({q.paragraphReference})
                          </span>
                          <p className="text-slate-600 mt-0.5">{q.explanation}</p>
                          {showSinhala && q.explanationSi && (
                            <p className="text-slate-500 mt-0.5 font-sans text-[11px]">{q.explanationSi}</p>
                          )}
                        </div>

                        {q.vocabularyFocus && (
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] space-y-0.5">
                            <span className="font-bold text-indigo-900 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              Academic Paraphrase:
                            </span>
                            <p className="text-slate-700">
                              <span className="font-semibold text-slate-900">{q.vocabularyFocus.term}</span> ➜ {q.vocabularyFocus.academicCollocation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              {!submitted ? (
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  disabled={Object.keys(userAnswers).length === 0}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Submit & Score Reading Band
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetTest}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Try Again / Reset Test
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
