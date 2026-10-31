import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  RotateCcw, 
  Play, 
  Pause, 
  HelpCircle,
  BookOpen,
  Send,
  Sliders,
  Check
} from 'lucide-react';
import { ALL_CAMBRIDGE_TESTS, CambridgeTestPrompt } from '../../data/cambridgeTests';
import type { TutorReport } from '../../types/tutor';
import { countWords } from '../../utils/tutorEngine';

interface CambridgeActivitiesViewProps {
  showSinhala: boolean;
  onLoadReport: (report: TutorReport) => void;
  onStartWritingPrompt: (question: string, taskType: 'task1' | 'task2') => void;
}

export const CambridgeActivitiesView: React.FC<CambridgeActivitiesViewProps> = ({
  showSinhala,
  onLoadReport,
  onStartWritingPrompt
}) => {
  const [activeActivity, setActiveActivity] = useState<'tests' | 'error_spotter' | 'upgrader' | 'simulator'>('tests');

  // Selected Cambridge test in test bank
  const [selectedTest, setSelectedTest] = useState<CambridgeTestPrompt>(ALL_CAMBRIDGE_TESTS[0]);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  // Activity 1: Error Spotting State
  const ERROR_DRILLS = [
    {
      id: 1,
      source: 'Cambridge 18 Test 1 Candidate Attempt',
      sentence: 'Community service help high school student to learn many useful skill.',
      options: [
        'Community service help high school student to learn many useful skills.',
        'Community service helps high school students to learn many useful skills.',
        'Community service helps high school student to learn many useful skill.'
      ],
      correctIndex: 1,
      explanation: '"Service" is singular → helps. "Students" is general plural. "Many" requires plural → skills.',
      explanationSi: '"Service" ඒකවචන බැවින් helps වේ. "many" සමඟ බහුවචන skills යොදන්න.'
    },
    {
      id: 2,
      source: 'Cambridge 17 Test 2 Candidate Attempt',
      sentence: 'I am totally agree with this opinion because there is better alternatives.',
      options: [
        'I am totally agree with this opinion because there are better alternatives.',
        'I totally agree with this opinion because there is better alternatives.',
        'I totally agree with this opinion because there are better alternatives.'
      ],
      correctIndex: 2,
      explanation: '"Agree" is an active verb (never "am agree"). "Alternatives" is plural → there are.',
      explanationSi: '"agree" යනු ක්‍රියාපදයකි ("am agree" නොවේ). "alternatives" බහුවචන බැවින් there are වේ.'
    },
    {
      id: 3,
      source: 'Cambridge 18 Test 2 Task 1 Report',
      sentence: 'Between 1918 and 1971, home ownership went up gradual and reached the highest peak.',
      options: [
        'Between 1918 and 1971, home ownership went up gradually and reached a peak.',
        'Between 1918 and 1971, home ownership went up gradual and reached a peak.',
        'Between 1918 and 1971, home ownership went up gradually and reached the highest peak.'
      ],
      correctIndex: 0,
      explanation: 'Verbs of change require adverbs ending in -ly (gradually). Saying "highest peak" is redundant; say "reached a peak".',
      explanationSi: 'ක්‍රියාපදයක් විස්තර කිරීමට -ly සහිත adverb යොදන්න (gradually). "highest peak" අනවශ්‍යයි.'
    },
    {
      id: 4,
      source: 'Cambridge 16 Test 1 Candidate Attempt',
      sentence: 'Young peoples cannot find a employment without having a work experience.',
      options: [
        'Young people cannot find a employment without having work experience.',
        'Young people cannot find employment without having work experience.',
        'Young peoples cannot find employment without having a work experience.'
      ],
      correctIndex: 1,
      explanation: '"People" is already plural. "Employment" and "work experience" are uncountable (no "a").',
      explanationSi: '"People" දැනටමත් බහුවචනයි. "employment" සහ "work experience" ගණන් කළ නොහැකි නාම පද වේ.'
    },
    {
      id: 5,
      source: 'Cambridge 17 Test 1 Candidate Attempt',
      sentence: 'Government should protect environment instead of just rising fuel price.',
      options: [
        'The government should protect the environment instead of just raising fuel prices.',
        'Government should protect the environment instead of just raising fuel price.',
        'The government should protect environment instead of just rising fuel prices.'
      ],
      correctIndex: 0,
      explanation: 'Requires "the" before government and environment. Use transitive "raising" (not "rising") with an object.',
      explanationSi: 'රජය සහ පරිසරය සඳහා "the" යොදන්න. මිල වැඩිකිරීම සඳහා "raising" යොදන්න.'
    }
  ];

  const [drillAnswers, setDrillAnswers] = useState<Record<number, number>>({});
  const [drillSubmitted, setDrillSubmitted] = useState<Record<number, boolean>>({});

  const handleSelectDrillOption = (drillId: number, optionIdx: number) => {
    if (drillSubmitted[drillId]) return;
    setDrillAnswers(prev => ({ ...prev, [drillId]: optionIdx }));
  };

  const handleCheckDrill = (drillId: number) => {
    setDrillSubmitted(prev => ({ ...prev, [drillId]: true }));
  };

  // Activity 2: Band 5 to Band 8 Academic Upgrader
  const UPGRADE_CHALLENGES = [
    {
      simple: 'cost a lot of money for government',
      advanced: 'place an unsustainable fiscal burden on municipal budgets',
      category: 'Lexical Resource'
    },
    {
      simple: 'make poor people suffer',
      advanced: 'disproportionately penalise economically vulnerable demographics',
      category: 'Academic Tone'
    },
    {
      simple: 'kids do community service to be good',
      advanced: 'adolescents engage in voluntary service to cultivate civic responsibility',
      category: 'Collocation'
    },
    {
      simple: 'car prices went up a lot',
      advanced: 'vehicle expenditures experienced an exponential surge',
      category: 'Task 1 Trend'
    },
    {
      simple: 'big problem for nature',
      advanced: 'catastrophic environmental degradation',
      category: 'Lexical Resource'
    }
  ];

  const [revealedUpgrades, setRevealedUpgrades] = useState<Record<number, boolean>>({});

  // Activity 3: Mock Exam Simulator Timer State
  const [simTaskType, setSimTaskType] = useState<'task1' | 'task2'>('task2');
  const [simQuestion, setSimQuestion] = useState(selectedTest.question);
  const [simText, setSimText] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(40 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const handleResetTimer = (minutes: number) => {
    setTimerRunning(false);
    setTimerSeconds(minutes * 60);
  };

  const simWordCount = countWords(simText);
  const simMinWords = simTaskType === 'task1' ? 150 : 250;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Activity Navigation Pill Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveActivity('tests')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeActivity === 'tests'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          <span>Cambridge Test Bank ({ALL_CAMBRIDGE_TESTS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveActivity('error_spotter')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeActivity === 'error_spotter'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Error Spotter Lab ({ERROR_DRILLS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveActivity('upgrader')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeActivity === 'upgrader'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Band 5 → Band 8 Upgrader</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveActivity('simulator')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeActivity === 'simulator'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-red-500" />
          <span>Timed Mock Simulator</span>
        </button>
      </div>

      {/* Mode 1: Cambridge Test Bank */}
      {activeActivity === 'tests' && (
        <div className="space-y-6">
          {/* Test Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ALL_CAMBRIDGE_TESTS.map(test => (
              <button
                key={test.id}
                type="button"
                onClick={() => {
                  setSelectedTest(test);
                  setShowModelAnswer(false);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedTest.id === test.id
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span>{test.taskType === 'task1' ? 'Task 1' : 'Task 2'}</span>
                  <span className="text-indigo-600">{test.category}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs mt-1">{test.cambridgeBook}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-serif">
                  "{test.question}"
                </p>
              </button>
            ))}
          </div>

          {/* Test Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
                    Official Cambridge Exam Paper
                  </span>
                  <span className="text-xs font-semibold text-indigo-700">{selectedTest.cambridgeBook}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {selectedTest.taskType === 'task1' ? 'IELTS Academic Writing Task 1' : 'IELTS Academic Writing Task 2'}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" /> {selectedTest.suggestedTimeMinutes} mins
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                  <FileText className="w-3.5 h-3.5" /> {selectedTest.minimumWords}+ words
                </span>
              </div>
            </div>

            {/* Official Question Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Official Examination Prompt
              </span>
              <p className="font-serif text-sm sm:text-base text-slate-900 leading-relaxed font-medium">
                {selectedTest.question}
              </p>
              <ul className="text-xs text-slate-500 list-disc list-inside space-y-0.5 pt-1">
                {selectedTest.examinerInstructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            </div>

            {/* Actions for Candidate Submission vs Band 8 Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Weak Candidate Submission Box */}
              <div className="p-4 bg-red-50/40 border border-red-200 rounded-xl flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      Weak Candidate Attempt (Band {selectedTest.weakCandidateEssay.band})
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs pt-1">
                    {selectedTest.weakCandidateEssay.title}
                  </h5>
                  <p className="text-[11px] text-slate-600 line-clamp-3 font-serif italic pt-1">
                    "{selectedTest.weakCandidateEssay.text}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onLoadReport(selectedTest.weakCandidateEssay.report)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Examine & Correct in Tutor Report</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Band 8.5 Model Answer Box */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Examiner Verified Model (Band 8.0+)
                  </span>
                  <h5 className="font-bold text-slate-900 text-xs pt-1">
                    High-Scoring Academic Structure
                  </h5>
                  <ul className="text-[11px] text-slate-600 space-y-1 pt-1 list-disc list-inside">
                    {selectedTest.band8ModelAnswer.examinerComments.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModelAnswer(prev => !prev)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{showModelAnswer ? 'Hide Model Answer' : 'Read Band 8.5 Model Answer'}</span>
                </button>
              </div>
            </div>

            {/* Expanded Model Answer */}
            {showModelAnswer && (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Band 8.5 Cambridge Model Response
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {countWords(selectedTest.band8ModelAnswer.text)} words
                  </span>
                </div>
                <div className="font-serif text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap p-4 bg-white rounded-lg border border-slate-200">
                  {selectedTest.band8ModelAnswer.text}
                </div>
              </div>
            )}

            {/* Write Prompt Action */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Ready to practice this Cambridge prompt yourself?
              </span>
              <button
                type="button"
                onClick={() => onStartWritingPrompt(selectedTest.question, selectedTest.taskType)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Write Response for this Test</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Error Spotter Lab */}
      {activeActivity === 'error_spotter' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Practical Drill
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Cambridge Candidate Error Spotter
            </h3>
            <p className="text-xs text-slate-500">
              These sentences are taken directly from real student attempts. Choose the version that eliminates all grammar, agreement, and preposition errors.
            </p>
          </div>

          <div className="space-y-4">
            {ERROR_DRILLS.map((drill, idx) => {
              const selectedIdx = drillAnswers[drill.id];
              const isSubmitted = drillSubmitted[drill.id];
              const isCorrect = selectedIdx === drill.correctIndex;

              return (
                <div key={drill.id} className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Sentence #{idx + 1} · {drill.source}
                    </span>
                    {isSubmitted && (
                      <span className={`text-xs font-bold flex items-center gap-1 ${
                        isCorrect ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-red-50/40 border border-red-200 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                      Original sentence with errors:
                    </span>
                    <p className="font-serif italic text-xs sm:text-sm text-slate-900 mt-1">
                      "{drill.sentence}"
                    </p>
                  </div>

                  <div className="space-y-2">
                    {drill.options.map((opt, oIdx) => {
                      const isOptionSelected = selectedIdx === oIdx;
                      let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300';
                      if (isSubmitted) {
                        if (oIdx === drill.correctIndex) {
                          btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                        } else if (isOptionSelected) {
                          btnStyle = 'bg-red-50 border-red-300 text-red-900';
                        } else {
                          btnStyle = 'bg-white/60 border-slate-200 text-slate-400';
                        }
                      } else if (isOptionSelected) {
                        btnStyle = 'bg-indigo-50 border-indigo-500 text-indigo-950 font-semibold ring-1 ring-indigo-400';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => handleSelectDrillOption(drill.id, oIdx)}
                          className={`w-full p-3 rounded-lg border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && oIdx === drill.correctIndex && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  {isSubmitted && (
                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                      <p className="font-semibold text-slate-900">Examiner Explanation:</p>
                      <p className="text-slate-600 leading-relaxed">{drill.explanation}</p>
                      {showSinhala && (
                        <p className="text-slate-500 font-sinhala text-[11px] pt-1">{drill.explanationSi}</p>
                      )}
                    </div>
                  )}

                  {!isSubmitted && (
                    <button
                      type="button"
                      disabled={selectedIdx === undefined}
                      onClick={() => handleCheckDrill(drill.id)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Check Answer
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 3: Band 5 to Band 8 Academic Upgrader */}
      {activeActivity === 'upgrader' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              Vocabulary & Collocation Drill
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Band 5.0 → Band 8.0 Academic Lexical Upgrader
            </h3>
            <p className="text-xs text-slate-500">
              IELTS examiners reward precise, natural collocations over simple everyday spoken phrases. Click to reveal the Band 8 academic upgrade.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {UPGRADE_CHALLENGES.map((ch, idx) => {
              const isRevealed = revealedUpgrades[idx];
              return (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {ch.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-serif text-slate-600 line-through">
                        "{ch.simple}"
                      </span>
                      <span className="text-xs text-slate-400 font-sans">(Band 5.0)</span>
                    </div>
                    {isRevealed && (
                      <div className="pt-1 flex items-center gap-2 text-indigo-950 font-bold text-xs sm:text-sm animate-in fade-in">
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-indigo-900">
                          "{ch.advanced}"
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-600">Band 8.0+</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setRevealedUpgrades(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                  >
                    {isRevealed ? 'Hide Upgrade' : 'Reveal Band 8 Collocation'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 4: Timed Mock Simulator */}
      {activeActivity === 'simulator' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                Timed Examination Simulator
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Real Cambridge Exam Conditions
              </h3>
              <p className="text-xs text-slate-500">
                Practice typing with an official countdown timer and live word count monitor.
              </p>
            </div>

            {/* Countdown Timer Display */}
            <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xs shrink-0">
              <Clock className="w-4 h-4 text-amber-300" />
              <span className="text-xl font-mono font-extrabold tracking-wider">
                {formatTimer(timerSeconds)}
              </span>
              <div className="flex items-center gap-1 pl-2 border-l border-white/20">
                <button
                  type="button"
                  onClick={() => setTimerRunning(prev => !prev)}
                  className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  title={timerRunning ? 'Pause' : 'Start'}
                >
                  {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleResetTimer(simTaskType === 'task1' ? 20 : 40)}
                  className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Reset timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Task selector & question */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSimTaskType('task2');
                  setTimerSeconds(40 * 60);
                  setSimQuestion(ALL_CAMBRIDGE_TESTS[0].question);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  simTaskType === 'task2' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Task 2 (40 Minutes)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimTaskType('task1');
                  setTimerSeconds(20 * 60);
                  setSimQuestion(ALL_CAMBRIDGE_TESTS[2].question);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  simTaskType === 'task1' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Task 1 (20 Minutes)
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Exam Question:
              </span>
              <p className="font-serif text-xs sm:text-sm text-slate-900 mt-0.5">
                {simQuestion}
              </p>
            </div>

            {/* Typing textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">Write Your Essay</span>
                <span className={`text-xs font-bold ${
                  simWordCount < simMinWords ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  {simWordCount} / {simMinWords} words required
                </span>
              </div>
              <textarea
                value={simText}
                onChange={e => setSimText(e.target.value)}
                rows={12}
                placeholder="Start typing your exam response here under timed conditions..."
                className="w-full text-xs sm:text-sm p-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-serif leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Done writing? Transfer to the Examiner engine for immediate evaluation.
              </span>
              <button
                type="button"
                disabled={simWordCount < 20}
                onClick={() => onStartWritingPrompt(simQuestion, simTaskType)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Evaluate My Timed Attempt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
