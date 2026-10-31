import React, { useState } from 'react';
import { BookOpen, CheckCircle2, XCircle, ArrowLeft, HelpCircle, Sparkles, Award } from 'lucide-react';
import { CAMBRIDGE_READING_TESTS } from '../../data/readingTests';
import type { ReadingPassage, ReadingQuestion } from '../../types/tutor';

interface ReadingTutorViewProps {
  showSinhala: boolean;
  onBackToHub?: () => void;
}

export const ReadingTutorView: React.FC<ReadingTutorViewProps> = ({ showSinhala, onBackToHub }) => {
  const [selectedPassage, setSelectedPassage] = useState<ReadingPassage>(CAMBRIDGE_READING_TESTS[0]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const handleSelectAnswer = (qId: string, answer: string) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const calculateScore = () => {
    let correct = 0;
    selectedPassage.questions.forEach(q => {
      if (userAnswers[q.id]?.trim().toUpperCase() === q.correctAnswer.toUpperCase()) {
        correct++;
      }
    });
    return correct;
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
    setActiveQuestionId(null);
  };

  const score = calculateScore();
  const total = selectedPassage.questions.length;
  const estimatedBand = total > 0 ? (score === total ? 8.5 : score >= 3 ? 7.5 : score >= 2 ? 6.5 : 5.5) : 6.0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                Reading Tutor
              </span>
              <span className="text-xs text-slate-500">{selectedPassage.cambridgeSource}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {selectedPassage.title}
            </h1>
          </div>
        </div>

        {submitted && (
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Reading Band</p>
              <p className="text-lg font-extrabold text-emerald-400">{estimatedBand.toFixed(1)} / 9.0</p>
            </div>
            <div className="pl-3 border-l border-slate-700">
              <p className="text-[10px] text-slate-400">Score</p>
              <p className="text-sm font-bold">{score} / {total} Correct</p>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Split: Passage vs Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Academic Passage Reader (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Official Academic Passage</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">4 Paragraphs</span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 font-serif leading-relaxed">
            {selectedPassage.paragraphs.map(p => (
              <div
                key={p.label}
                id={`para-${p.label.toLowerCase().replace(/\s+/g, '-')}`}
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

        {/* Right Column: Interactive Questions & Explanations (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800">Questions 1–{total}</span>
              <span className="text-[11px] text-slate-500">True / False / Not Given & MCQ</span>
            </div>

            <div className="space-y-5">
              {selectedPassage.questions.map((q, idx) => {
                const userAns = userAnswers[q.id];
                const isCorrect = userAns?.trim().toUpperCase() === q.correctAnswer.toUpperCase();
                const isSelectedForFocus = activeQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border transition-all ${
                      submitted
                        ? isCorrect
                          ? 'bg-emerald-50/60 border-emerald-300'
                          : 'bg-red-50/60 border-red-300'
                        : isSelectedForFocus
                        ? 'bg-indigo-50/50 border-indigo-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">
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
                        {['TRUE', 'FALSE', 'NOT GIVEN'].map(opt => (
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
                    ) : (
                      /* MCQ Options */
                      <div className="space-y-1.5 mt-3">
                        {q.options?.map(opt => (
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
                    )}

                    {/* Explanation and Vocabulary Focus on Submission */}
                    {submitted && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block">
                            Correct Answer: <span className="text-emerald-700">{q.correctAnswer}</span> ({q.paragraphReference})
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
                  Submit & Check Reading Band
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Try Again / Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

