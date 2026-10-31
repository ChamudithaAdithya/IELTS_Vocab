import React, { useState } from 'react';
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
  Sliders
} from 'lucide-react';
import { CAMBRIDGE_LISTENING_TESTS } from '../../data/listeningTests';
import type { ListeningItem } from '../../types/tutor';

interface ListeningTutorViewProps {
  showSinhala: boolean;
  onBackToHub?: () => void;
}

export const ListeningTutorView: React.FC<ListeningTutorViewProps> = ({ showSinhala, onBackToHub }) => {
  const [selectedTest, setSelectedTest] = useState<ListeningItem>(CAMBRIDGE_LISTENING_TESTS[0]);
  const [testMode, setTestMode] = useState<'practice' | 'exam'>('practice');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(0.95);
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
    utter.rate = playbackRate;
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

  const resetTest = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setUserAnswers({});
    setSubmitted(false);
    setIsPlaying(false);
    setShowTranscript(false);
  };

  const handleChangeTest = (t: ListeningItem) => {
    setSelectedTest(t);
    resetTest();
  };

  const score = calculateScore();
  const total = selectedTest.questions.length;
  const estimatedBand = total > 0 ? (score === total ? 9.0 : score >= 3 ? 8.0 : score >= 2 ? 6.5 : 5.0) : 6.0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
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
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono">
                Listening Section {selectedTest.section}
              </span>
              <span className="text-xs text-slate-500">{selectedTest.cambridgeSource}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {selectedTest.title}
            </h1>
          </div>
        </div>

        {/* Practice vs Exam Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTestMode('practice')}
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
                setShowTranscript(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                testMode === 'exam'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Exam Mode (Play Once)</span>
            </button>
          </div>

          {submitted && (
            <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <Award className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-indigo-400">Band {estimatedBand.toFixed(1)}</span>
              <span className="text-slate-400">({score}/{total})</span>
            </div>
          )}
        </div>
      </div>

      {/* Section Switcher Tabs (Sections 1, 2, 3, 4) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {CAMBRIDGE_LISTENING_TESTS.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleChangeTest(item)}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedTest.id === item.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Sec {item.section}:</span>
            <span className="font-medium text-[11px] truncate max-w-[170px]">{item.title}</span>
          </button>
        ))}
      </div>

      {/* Audio Player Card with Speed Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Cambridge British Audio Simulation</h2>
            <p className="text-xs text-indigo-200">
              {testMode === 'practice'
                ? 'Play audio freely at your own pace with transcript aids.'
                : 'Exam Mode: Listen carefully once without pausing, and complete your answers.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Speed Selector */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-[11px] font-mono">
            {[0.85, 0.95, 1.1].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setPlaybackRate(r)}
                className={`px-2 py-1 rounded transition-colors ${
                  playbackRate === r ? 'bg-white text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {r === 0.95 ? '1.0x' : `${r}x`}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSpeak}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Audio' : 'Play Cambridge Audio'}</span>
          </button>

          {testMode === 'practice' && (
            <button
              type="button"
              onClick={() => setShowTranscript(prev => !prev)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {showTranscript ? 'Hide Transcript' : 'Transcript'}
            </button>
          )}
        </div>
      </div>

      {/* Transcript Collapsible */}
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
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Questions 1–{total}</span>
            <p className="text-xs text-slate-500">
              Complete the notes below. Write <span className="font-bold text-slate-800">NO MORE THAN TWO WORDS AND/OR A NUMBER</span> for each answer.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {Object.keys(userAnswers).length}/{total} Answered
          </span>
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
                    : userAns
                    ? 'bg-indigo-50/30 border-indigo-200'
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
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono w-44"
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
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs space-y-1 animate-in fade-in">
                    <p className="font-bold text-slate-900">
                      Correct Answer: <span className="text-emerald-700 font-mono font-bold">{q.answer}</span>
                    </p>
                    <p className="text-slate-600">{q.explanation}</p>
                    {q.distractors.length > 0 && (
                      <p className="text-amber-800 text-[11px] flex items-center gap-1 font-medium">
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
              disabled={Object.keys(userAnswers).length === 0}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Submit & Check Listening Band Score
            </button>
          ) : (
            <button
              type="button"
              onClick={resetTest}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Reset / Try Next Section
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
