import React, { useState } from 'react';
import { Volume2, Play, Pause, CheckCircle2, XCircle, ArrowLeft, AlertCircle, Headphones } from 'lucide-react';
import { CAMBRIDGE_LISTENING_TESTS } from '../../data/listeningTests';
import type { ListeningItem } from '../../types/tutor';

interface ListeningTutorViewProps {
  showSinhala: boolean;
  onBackToHub?: () => void;
}

export const ListeningTutorView: React.FC<ListeningTutorViewProps> = ({ showSinhala, onBackToHub }) => {
  const [selectedTest, setSelectedTest] = useState<ListeningItem>(CAMBRIDGE_LISTENING_TESTS[0]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(selectedTest.audioSimText);
    utter.lang = 'en-GB';
    utter.rate = 0.95;
    utter.onend = () => setIsPlaying(false);
    utter.onerror = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utter);
  };

  const handleInputChange = (qNum: number, text: string) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [qNum]: text }));
  };

  const calculateScore = () => {
    let correct = 0;
    selectedTest.questions.forEach(q => {
      const u = (userAnswers[q.number] || '').trim().toLowerCase();
      const a = q.answer.trim().toLowerCase();
      if (u === a) correct++;
    });
    return correct;
  };

  const score = calculateScore();
  const total = selectedTest.questions.length;
  const estimatedBand = total > 0 ? (score === total ? 8.5 : score >= 3 ? 7.5 : score >= 2 ? 6.5 : 5.5) : 6.0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                Listening Tutor · Section {selectedTest.section}
              </span>
              <span className="text-xs text-slate-500">{selectedTest.cambridgeSource}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {selectedTest.title}
            </h1>
          </div>
        </div>

        {submitted && (
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Listening Band</p>
              <p className="text-lg font-extrabold text-indigo-400">{estimatedBand.toFixed(1)} / 9.0</p>
            </div>
            <div className="pl-3 border-l border-slate-700">
              <p className="text-[10px] text-slate-400">Score</p>
              <p className="text-sm font-bold">{score} / {total} Correct</p>
            </div>
          </div>
        )}
      </div>

      {/* Audio Player Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Cambridge British Audio Simulation</h2>
            <p className="text-xs text-indigo-200">
              Listen once at normal IELTS exam speed. Fill the blanks as you hear the recording.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSpeak}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Audio' : 'Play Cambridge Audio'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTranscript(prev => !prev)}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            {showTranscript ? 'Hide Transcript' : 'View Transcript'}
          </button>
        </div>
      </div>

      {/* Transcript collapsible */}
      {showTranscript && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-line animate-in fade-in">
          <span className="font-sans font-bold text-[11px] uppercase tracking-wider text-slate-500 block mb-1">
            Exam Audio Transcript:
          </span>
          {selectedTest.audioSimText}
        </div>
      )}

      {/* Fill-in-the-Blank Test Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-900 block">Questions 1–{total}</span>
          <p className="text-xs text-slate-500">
            Complete the notes below. Write <span className="font-bold text-slate-800">ONE WORD AND/OR A NUMBER</span> for each answer.
          </p>
        </div>

        <div className="space-y-4">
          {selectedTest.questions.map(q => {
            const userAns = userAnswers[q.number] || '';
            const isCorrect = userAns.trim().toLowerCase() === q.answer.trim().toLowerCase();

            return (
              <div
                key={q.number}
                className={`p-4 rounded-xl border transition-colors ${
                  submitted
                    ? isCorrect
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : 'bg-red-50/60 border-red-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm font-medium text-slate-800">
                    <span className="font-bold text-slate-900 mr-2">{q.number}.</span>
                    <span>{q.question}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      disabled={submitted}
                      value={userAns}
                      onChange={e => handleInputChange(q.number, e.target.value)}
                      placeholder="Your answer..."
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono w-40"
                    />
                    {submitted && (
                      isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )
                    )}
                  </div>
                </div>

                {/* Distractor & Answer Explanation */}
                {submitted && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-900">
                      Correct Answer: <span className="text-emerald-700 font-mono">{q.answer}</span>
                    </p>
                    <p className="text-slate-600">{q.explanation}</p>
                    {q.distractors.length > 0 && (
                      <p className="text-amber-800 text-[11px] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Common Distractor: {q.distractors.join(', ')}</span>
                      </p>
                    )}
                    {showSinhala && q.explanationSi && (
                      <p className="text-slate-500 text-[11px] font-sans">{q.explanationSi}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex items-center gap-3">
          {!submitted ? (
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Submit & Check Listening Band
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setUserAnswers({});
                setSubmitted(false);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Reset / Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

