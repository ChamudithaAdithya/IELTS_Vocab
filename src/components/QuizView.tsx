import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  RotateCcw, 
  ArrowLeft,
  Check
} from 'lucide-react';
import { Lesson, QuizQuestion } from '../types';
import { generateQuizForLesson } from '../utils/quizGenerator';

interface QuizViewProps {
  lesson: Lesson;
  allLessons: Lesson[];
  onSelectLesson: (id: string) => void;
  showSinhala: boolean;
  onRecordBestScore: (lessonId: string, scorePercent: number) => void;
  onBackToLesson: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  lesson,
  allLessons,
  onSelectLesson,
  showSinhala,
  onRecordBestScore,
  onBackToLesson,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const qList = generateQuizForLesson(lesson);
    setQuestions(qList);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  }, [lesson]);

  const currentQ = questions[currentIndex];

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQ.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      const percent = Math.round((score / questions.length) * 100);
      onRecordBestScore(lesson.id, percent);
    }
  };

  const handleRestart = () => {
    const qList = generateQuizForLesson(lesson);
    setQuestions(qList);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  if (!currentQ && !quizFinished) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-slate-500 text-sm">
        Loading test questions...
      </div>
    );
  }

  // Final Results Screen
  if (quizFinished) {
    const percent = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-xl mx-auto px-4 py-12 space-y-6 text-center">
        <div className="bg-white rounded-lg p-8 border border-slate-200 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Vocabulary Test Result
          </h2>
          <p className="text-xs text-slate-500">
            Lesson {lesson.number}: {lesson.title}
          </p>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded">
            <p className="text-3xl font-bold text-slate-900">
              {score} / {questions.length}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Score: {percent}%
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRestart}
              className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake test</span>
            </button>
            <button
              type="button"
              onClick={onBackToLesson}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Back to lesson
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCorrect = selectedOption === currentQ.correctAnswer;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Quiz Top bar */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onBackToLesson}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit test</span>
        </button>

        <span className="text-slate-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-slate-800 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {currentQ.type === 'definition' ? 'Definition Check' : 'Contextual Check'}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2 whitespace-pre-line leading-relaxed">
            {currentQ.question}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((option, idx) => {
            let style = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';

            if (isAnswered) {
              if (option === currentQ.correctAnswer) {
                style = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
              } else if (option === selectedOption) {
                style = 'bg-rose-50 border-rose-300 text-rose-900';
              } else {
                style = 'bg-white border-slate-200 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelect(option)}
                className={`w-full p-3 rounded border text-left text-sm transition-colors flex items-center justify-between ${style}`}
              >
                <span>{option}</span>
                {isAnswered && option === currentQ.correctAnswer && (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Answer explanation */}
        {isAnswered && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5">
            <p className="font-semibold text-slate-900">
              {isCorrect ? '✓ Correct' : '✕ Incorrect'}
            </p>
            <p className="text-slate-700">{currentQ.explanation}</p>
            {showSinhala && (
              <p className="text-slate-600 font-sinhala">{currentQ.sinhalaExplanation}</p>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
              >
                <span>{currentIndex + 1 === questions.length ? 'View Result' : 'Next Question'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
