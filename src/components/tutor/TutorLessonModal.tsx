import React, { useState } from 'react';
import { X, BookOpen, CheckCircle2, XCircle, ArrowRight, Sparkles, Award } from 'lucide-react';
import type { TutorLesson, LessonProgressEntry } from '../../types/tutor';

interface TutorLessonModalProps {
  lesson: TutorLesson;
  userSentence?: { original: string; corrected: string };
  progress?: LessonProgressEntry;
  showSinhala: boolean;
  onClose: () => void;
  onSaveProgress: (score: number) => void;
}

export const TutorLessonModal: React.FC<TutorLessonModalProps> = ({
  lesson,
  userSentence,
  progress,
  showSinhala,
  onClose,
  onSaveProgress,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [applyText, setApplyText] = useState('');
  const [applySaved, setApplySaved] = useState(false);

  const handleSelectOption = (qIdx: number, option: string) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const calculateScore = () => {
    let correct = 0;
    lesson.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) correct++;
    });
    return Math.round((correct / lesson.quiz.length) * 100);
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
    const score = calculateScore();
    onSaveProgress(score);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const scorePercent = submitted ? calculateScore() : progress?.bestScore ?? 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <BookOpen className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {lesson.category} · Level {lesson.curriculumLevel}
                </span>
                {progress?.status === 'completed' && (
                  <span className="text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold leading-tight mt-0.5">{lesson.title}</h2>
              {showSinhala && (
                <p className="text-xs text-indigo-200 font-sinhala">{lesson.titleSi}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Close lesson"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm text-slate-700">
          {/* Summary Banner */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">
            <p className="font-medium text-indigo-950 text-xs sm:text-sm">{lesson.summary}</p>
            <p className="text-[11px] text-indigo-700 mt-1">
              <span className="font-semibold">Covers:</span> {lesson.covers}
            </p>
          </div>

          {/* Step 1: Understand the Basics */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                Understand the Basics
              </h3>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              {lesson.basics.points.map((pt, i) => (
                <div key={i} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed text-slate-700">
                  <span className="text-indigo-500 font-bold">•</span>
                  <div>
                    <p>{pt}</p>
                    {showSinhala && lesson.basics.pointsSi[i] && (
                      <p className="text-xs text-slate-500 font-sinhala mt-0.5">
                        {lesson.basics.pointsSi[i]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Basic Examples */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {lesson.basics.examples.map((ex, i) => (
                <div key={i} className="p-3 bg-white border border-slate-200 rounded-lg">
                  <p className="font-semibold text-slate-900 text-xs">{ex.sentence}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{ex.note}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Step 2: Understand the Rule */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                {lesson.rule.title}
              </h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    {lesson.rule.headers.map((h, i) => (
                      <th key={i} className="px-3.5 py-2.5 text-left font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {lesson.rule.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 text-slate-700 font-sans text-xs">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <p className="font-medium">💡 Examiner Tip: {lesson.rule.tip}</p>
              {showSinhala && lesson.rule.tipSi && (
                <p className="font-sinhala text-amber-800 text-[11px] mt-0.5">{lesson.rule.tipSi}</p>
              )}
            </div>
          </section>

          {/* Step 3: Learn from your own mistake */}
          {userSentence && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  Learn From Your Own Mistake
                </h3>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                    Your sentence from essay
                  </span>
                  <p className="mt-1.5 text-slate-700 font-serif italic text-sm">
                    "{userSentence.original}"
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Corrected version
                  </span>
                  <p className="mt-1.5 text-slate-900 font-medium text-sm">
                    "{userSentence.corrected}"
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Step 4: Practice Quiz */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  {userSentence ? '4' : '3'}
                </span>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  Practise & Test Your Understanding ({lesson.quiz.length} Questions)
                </h3>
              </div>
              {submitted && (
                <span className="text-xs font-bold px-2 py-1 rounded bg-slate-900 text-white">
                  Score: {scorePercent}%
                </span>
              )}
            </div>

            <div className="space-y-3">
              {lesson.quiz.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.answer;
                return (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userAns === opt;
                        let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300';
                        if (submitted) {
                          if (opt === q.answer) {
                            btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                          } else if (isSelected) {
                            btnStyle = 'bg-red-50 border-red-400 text-red-900';
                          } else {
                            btnStyle = 'bg-white/60 border-slate-200 text-slate-400';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold ring-1 ring-indigo-400';
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            disabled={submitted}
                            onClick={() => handleSelectOption(idx, opt)}
                            className={`px-3 py-2 rounded-lg border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {submitted && opt === q.answer && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            {submitted && isSelected && !isCorrect && (
                              <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {submitted && (
                      <p className="text-[11px] text-slate-600 bg-white border border-slate-200 rounded-md p-2 mt-1">
                        <span className="font-semibold text-slate-800">Explanation:</span> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-2">
              {!submitted ? (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length < lesson.quiz.length}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  Submit Lesson Test
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors"
                >
                  Retake Test
                </button>
              )}
            </div>
          </section>

          {/* Step 5: Apply What You Learned */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                {userSentence ? '5' : '4'}
              </span>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                Apply What You Learned
              </h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
              <p className="text-xs text-slate-600 font-medium">Prompt: {lesson.applyPrompt}</p>
              <textarea
                value={applyText}
                onChange={e => setApplyText(e.target.value)}
                placeholder="Write your practice sentences here..."
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setApplySaved(true)}
                  disabled={!applyText.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-md text-xs font-semibold transition-colors"
                >
                  Save Practice Draft
                </button>
                {applySaved && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Practice saved locally
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {progress?.status === 'completed' ? (
              <span className="text-emerald-700 font-medium">Lesson marked as mastered ({scorePercent}%)</span>
            ) : (
              <span>Pass score: 70%+ to master this topic</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
