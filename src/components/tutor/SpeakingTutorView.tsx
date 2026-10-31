import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, ArrowLeft, Clock, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { CAMBRIDGE_SPEAKING_TESTS } from '../../data/speakingTests';
import type { SpeakingPartPrompt } from '../../types/tutor';

interface SpeakingTutorViewProps {
  showSinhala: boolean;
  onBackToHub?: () => void;
}

export const SpeakingTutorView: React.FC<SpeakingTutorViewProps> = ({ showSinhala, onBackToHub }) => {
  const [selectedPrompt, setSelectedPrompt] = useState<SpeakingPartPrompt>(CAMBRIDGE_SPEAKING_TESTS[1]);
  const [prepTimeRemaining, setPrepTimeRemaining] = useState<number>(60);
  const [isPrepRunning, setIsPrepRunning] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [isPlayingModel, setIsPlayingModel] = useState<boolean>(false);
  const [userSpeechText, setUserSpeechText] = useState<string>('');
  const [recognitionActive, setRecognitionActive] = useState<boolean>(false);

  // Preparation Timer (60s)
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

  const handleStartRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setUserSpeechText(transcript.trim());
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      try {
        recognition.start();
        setRecognitionActive(true);
      } catch {
        // Fallback
      }
    }
    setIsRecording(true);
    setRecordSeconds(0);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setRecognitionActive(false);
    if ((window as any).speechRecognitionInstance) {
      (window as any).speechRecognitionInstance.stop();
    }
  };

  const handlePlayModelAnswer = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlayingModel) {
      window.speechSynthesis.cancel();
      setIsPlayingModel(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(selectedPrompt.sampleBand8Answer);
    utter.lang = 'en-GB';
    utter.rate = 0.95;
    utter.onend = () => setIsPlayingModel(false);
    utter.onerror = () => setIsPlayingModel(false);
    setIsPlayingModel(true);
    window.speechSynthesis.speak(utter);
  };

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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
                Speaking Tutor · Part {selectedPrompt.part}
              </span>
              <span className="text-xs text-slate-500">IELTS Examiner Simulation</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {selectedPrompt.topic}
            </h1>
          </div>
        </div>

        {/* Part Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {CAMBRIDGE_SPEAKING_TESTS.map(sp => (
            <button
              key={sp.id}
              type="button"
              onClick={() => {
                setSelectedPrompt(sp);
                setIsRecording(false);
                setUserSpeechText('');
                setPrepTimeRemaining(60);
                setIsPrepRunning(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedPrompt.id === sp.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Part {sp.part}
            </button>
          ))}
        </div>
      </div>

      {/* Main Speaking Examiner Room */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Cue Card / Prompt (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Official Candidate Task Card
            </span>
            {selectedPrompt.part === 2 && (
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>1 Min Prep + 2 Min Speech</span>
              </span>
            )}
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 font-serif text-slate-800">
            <h2 className="font-bold text-base text-slate-900 font-sans">
              {selectedPrompt.topic}
            </h2>
            <p className="text-xs text-slate-600 font-sans">
              You should say:
            </p>
            {selectedPrompt.cueCardPoints ? (
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700">
                {selectedPrompt.cueCardPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            ) : (
              <div className="space-y-2">
                {selectedPrompt.questions.map((q, i) => (
                  <p key={i} className="text-xs sm:text-sm font-medium text-slate-800">
                    • {q}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Prep Timer & Audio Recorder Controls */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Part 2: 1-Min Prep Timer */}
              {selectedPrompt.part === 2 && (
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-indigo-300">Prep Timer</p>
                    <p className="text-2xl font-mono font-bold text-white">{prepTimeRemaining}s</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrepRunning(prev => !prev)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {isPrepRunning ? 'Pause Prep' : 'Start 1m Prep'}
                  </button>
                </div>
              )}

              {/* Speech Recording Simulation */}
              <div className="flex items-center gap-3 ml-auto">
                {isRecording && (
                  <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>{formatSec(recordSeconds)} / 2:00</span>
                  </span>
                )}
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Record Candidate Answer</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <MicOff className="w-4 h-4 text-red-400" />
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>
            </div>

            {/* Speech Transcript Display */}
            {userSpeechText && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 font-mono">
                <span className="block font-sans font-bold text-[10px] uppercase tracking-wider text-indigo-300 mb-1">
                  Recorded Speech Transcript:
                </span>
                "{userSpeechText}"
              </div>
            )}
          </div>
        </div>

        {/* Right: Band 8 Model Answer & Examiner Rubric (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Band 8 Model Audio & Answer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Band 8.5 Native Model Answer</span>
              </span>
              <button
                type="button"
                onClick={handlePlayModelAnswer}
                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                {isPlayingModel ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingModel ? 'Pause' : 'Listen'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-700 font-serif leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-200">
              "{selectedPrompt.sampleBand8Answer}"
            </p>

            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-900 block">
                Examiner Assessment Tips:
              </span>
              <div className="space-y-1.5">
                {selectedPrompt.examinerTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4 Assessment Criteria Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-900 block border-b border-slate-100 pb-2">
              Speaking Band 8 Assessment Rubric
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">Fluency & Coherence</span>
                <span className="text-[11px] text-slate-500">Speaks smoothly without hesitation.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">Lexical Resource</span>
                <span className="text-[11px] text-slate-500">Natural idiomatic collocations.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">Grammar Accuracy</span>
                <span className="text-[11px] text-slate-500">Complex subordinate clauses.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">Pronunciation</span>
                <span className="text-[11px] text-slate-500">Easy to understand rhythm & stress.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

