import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Send, 
  Sparkles, 
  Key, 
  BookOpen, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Award,
  Layers,
  ArrowRight,
  Loader2,
  X
} from 'lucide-react';
import type { TutorReport, TutorLesson, LessonTopicId, TutorState } from '../types/tutor';
import { SAMPLE_REPORT, SAMPLE_QUESTION } from '../data/tutorSampleReport';
import { TUTOR_LESSONS, CURRICULUM_LEVELS, getTutorLesson } from '../data/tutorLessons';
import { 
  loadTutorState, 
  saveTutorState, 
  loadApiKey, 
  saveApiKey, 
  loadModel, 
  saveModel,
  DEFAULT_GEMINI_MODEL,
  evaluateEssayWithGemini,
  countWords,
  PipelineStage
} from '../utils/tutorEngine';
import { TutorReportView } from './tutor/TutorReportView';
import { TutorLessonModal } from './tutor/TutorLessonModal';
import { CambridgeActivitiesView } from './tutor/CambridgeActivitiesView';
import { evaluateEssayLocally } from '../utils/localEvaluator';
import { ALL_CAMBRIDGE_TESTS } from '../data/cambridgeTests';

interface WritingTutorViewProps {
  showSinhala: boolean;
}

export const WritingTutorView: React.FC<WritingTutorViewProps> = ({ showSinhala }) => {
  const [tutorState, setTutorState] = useState<TutorState>(loadTutorState);
  const [currentReport, setCurrentReport] = useState<TutorReport>(() => {
    const saved = loadTutorState();
    return saved.assessments[0] || SAMPLE_REPORT;
  });

  const [activeSubTab, setActiveSubTab] = useState<'cambridge' | 'report' | 'submit' | 'curriculum' | 'settings'>('cambridge');

  // Submission form state
  const [taskType, setTaskType] = useState<'task1' | 'task2'>('task2');
  const [questionInput, setQuestionInput] = useState(SAMPLE_QUESTION);
  const [essayInput, setEssayInput] = useState(
    'Nowadays, choosing subject in university is a big decision for many student. Some people think student should study what they like, but other people believe they must only study useful subject like science and technology. In this essay I will discuss both side and give my opinion.\n\nFirstly, many people have different opinion about this. Students should choose their interested subjects because interest make them more motivated. If a student study a subject that they are interested, they will work hard and get good marks. For example my cousin love art and now he is a designer.\n\nOn the other hand, some peoples think science and technology is more useful. This subjects help the country to develop and it give many jobs. If students study history or art, they may face difficulties to find a employment after graduate.\n\nIn conclusion, I think both side have good points. Students should study what they like but they should also think about the jobs. Government should balance both sides.'
  );
  const [targetBand, setTargetBand] = useState<number>(8.0);

  // Evaluation pipeline state
  const [apiKey, setApiKey] = useState<string>(loadApiKey);
  const [model, setModel] = useState<string>(loadModel);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalStage, setEvalStage] = useState<PipelineStage>('validating');
  const [evalDetail, setEvalDetail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Active Lesson modal state
  const [activeLesson, setActiveLesson] = useState<TutorLesson | null>(null);
  const [activeSentence, setActiveSentence] = useState<{ original: string; corrected: string } | undefined>();

  const essayWordCount = countWords(essayInput);
  const minWords = taskType === 'task1' ? 150 : 250;

  const handleOpenLesson = (topicId: LessonTopicId, sentence?: { original: string; corrected: string }) => {
    const lesson = getTutorLesson(topicId);
    if (lesson) {
      setActiveLesson(lesson);
      setActiveSentence(sentence);
    }
  };

  const handleSaveLessonProgress = (score: number) => {
    if (!activeLesson) return;
    setTutorState((prev: TutorState) => {
      const updated: TutorState = {
        ...prev,
        lessonProgress: {
          ...prev.lessonProgress,
          [activeLesson.id]: {
            status: (score >= 70 ? 'completed' : 'in_progress') as 'completed' | 'in_progress',
            bestScore: Math.max(score, prev.lessonProgress[activeLesson.id]?.bestScore ?? 0),
            attempts: (prev.lessonProgress[activeLesson.id]?.attempts ?? 0) + 1,
          },
        },
      };
      saveTutorState(updated);
      return updated;
    });
  };

  const handleSaveApiKey = (keyVal: string) => {
    setApiKey(keyVal);
    saveApiKey(keyVal);
  };

  const handleSaveModel = (modelVal: string) => {
    setModel(modelVal);
    saveModel(modelVal);
  };

  const handleLoadSampleReport = () => {
    setCurrentReport(SAMPLE_REPORT);
    setActiveSubTab('report');
    setErrorMessage(null);
  };

  const handleStartWritingPrompt = (question: string, type: 'task1' | 'task2') => {
    setQuestionInput(question);
    setTaskType(type);
    setEssayInput('');
    setActiveSubTab('submit');
    setErrorMessage(null);
  };

  const handleLoadReportDirectly = (report: TutorReport) => {
    setCurrentReport(report);
    setActiveSubTab('report');
    setErrorMessage(null);
  };

  const handleCancelEvaluation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsEvaluating(false);
    setEvalDetail('');
  };

  const handleEvaluate = async (forceOffline: boolean = false) => {
    if (essayWordCount < 20) {
      setErrorMessage('Please write or paste at least 20-30 words before evaluating.');
      return;
    }

    setIsEvaluating(true);
    setErrorMessage(null);
    setEvalDetail(forceOffline ? 'Running Cambridge linguistic examiner...' : 'Initializing examiner pipeline...');

    // 1. Try Gemini AI if requested and API key is provided
    if (!forceOffline && apiKey.trim()) {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const report = await evaluateEssayWithGemini({
          apiKey,
          model,
          question: questionInput,
          essay: essayInput,
          taskType,
          targetBand,
          sinhala: showSinhala,
          onStage: (stage, detail) => {
            setEvalStage(stage);
            if (detail) setEvalDetail(detail);
          },
          signal: controller.signal,
        });

        setCurrentReport(report);
        setTutorState((prev: TutorState) => {
          const updated: TutorState = {
            ...prev,
            assessments: [report, ...prev.assessments.slice(0, 19)],
          };
          saveTutorState(updated);
          return updated;
        });

        setActiveSubTab('report');
        setIsEvaluating(false);
        abortControllerRef.current = null;
        return;
      } catch (err: any) {
        abortControllerRef.current = null;
        if (err.message?.includes('cancelled')) {
          setIsEvaluating(false);
          return;
        }
        console.warn('Gemini evaluation issue, falling back to built-in examiner:', err);
        const is503 = err.message?.includes('503') || err.message?.includes('unavailable') || err.message?.includes('busy');
        setErrorMessage(
          is503
            ? 'Google Gemini servers are currently experiencing peak traffic / temporary overload (HTTP 503). Your essay was automatically evaluated using the Built-in Cambridge Examiner so you do not have to wait.'
            : `Gemini AI issue: ${err.message || 'Call failed'}. Generated report using Built-in Cambridge Examiner instead.`
        );
        // Fall through to built-in examiner below!
      }
    }

    // 2. Instant Built-in Cambridge Examiner (100% Functional, Offline & Key-Free)
    try {
      setEvalStage('examining');
      setEvalDetail('Analyzing grammar, plurals, agreement and criterion band scores...');
      const report = evaluateEssayLocally({
        question: questionInput,
        essay: essayInput,
        taskType,
        targetBand,
        sinhala: showSinhala,
      });

      setCurrentReport(report);
      setTutorState((prev: TutorState) => {
        const updated: TutorState = {
          ...prev,
          assessments: [report, ...prev.assessments.slice(0, 19)],
        };
        saveTutorState(updated);
        return updated;
      });

      setActiveSubTab('report');
    } catch (err: any) {
      setErrorMessage(err.message || 'Evaluation failed.');
    } finally {
      setIsEvaluating(false);
      setEvalDetail('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                AI Personal Tutor
              </span>
              <span className="text-xs text-indigo-200 font-semibold">Target: Band 8.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              IELTS Writing Tutor & Error Examiner
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Designed for learners who struggle with basic English, grammar and sentence building.
              Detects every mistake, replaces only errors, scores honestly, and teaches the rule.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadSampleReport}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Worked Example</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('submit')}
              className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Evaluate Essay</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-1 pt-5 mt-5 border-t border-white/10 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveSubTab('cambridge')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'cambridge'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Cambridge Real Practical</span>
            <span className="text-[9px] uppercase tracking-wider font-extrabold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-mono">
              3 Tests + Drills
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('report')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'report'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Evaluation Report</span>
            {currentReport && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900">
                Band {currentReport.overallBand.toFixed(1)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('submit')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'submit'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Practice & Submit</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('curriculum')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'curriculum'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Lessons ({TUTOR_LESSONS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('settings')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'settings'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Key & Settings</span>
            {apiKey ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Key configured" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Offline examiner active" />
            )}
          </button>
        </div>
      </div>

      {/* Sub-tab 0: Cambridge Real Practical Activities */}
      {activeSubTab === 'cambridge' && (
        <CambridgeActivitiesView
          showSinhala={showSinhala}
          onLoadReport={handleLoadReportDirectly}
          onStartWritingPrompt={handleStartWritingPrompt}
        />
      )}

      {/* Sub-tab 1: Report View */}
      {activeSubTab === 'report' && (
        <TutorReportView
          report={currentReport}
          showSinhala={showSinhala}
          onOpenLesson={handleOpenLesson}
        />
      )}

      {/* Sub-tab 2: Submit / Practice */}
      {activeSubTab === 'submit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              New Practice Essay
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Submit Essay for AI Evaluation</h2>
            <p className="text-xs text-slate-500">
              The AI will mark wrong words with strike-through, show missing words in red, and generate your personal learning plan.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* Task type & target band */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Type</label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setTaskType('task2')}
                    className={`flex-1 py-2 font-semibold transition-colors ${
                      taskType === 'task2' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Writing Task 2 (250+ w)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskType('task1')}
                    className={`flex-1 py-2 font-semibold transition-colors ${
                      taskType === 'task1' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Task 1 (150+ w)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Band</label>
                <select
                  value={targetBand}
                  onChange={e => setTargetBand(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={7.0}>Band 7.0</option>
                  <option value={7.5}>Band 7.5</option>
                  <option value={8.0}>Band 8.0 (Recommended)</option>
                  <option value={8.5}>Band 8.5</option>
                  <option value={9.0}>Band 9.0</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Load Real Cambridge Test</label>
                <select
                  onChange={e => {
                    const idx = Number(e.target.value);
                    if (idx >= 0 && ALL_CAMBRIDGE_TESTS[idx]) {
                      const t = ALL_CAMBRIDGE_TESTS[idx];
                      setQuestionInput(t.question);
                      setTaskType(t.taskType);
                      setEssayInput(t.weakCandidateEssay.text);
                    }
                  }}
                  defaultValue=""
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="" disabled>Choose Cambridge Exam Paper...</option>
                  {ALL_CAMBRIDGE_TESTS.map((t, i) => (
                    <option key={t.id} value={i}>
                      {t.cambridgeBook} ({t.taskType === 'task1' ? 'Task 1' : 'Task 2'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question prompt */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                IELTS Question / Prompt
              </label>
              <textarea
                value={questionInput}
                onChange={e => setQuestionInput(e.target.value)}
                rows={2}
                placeholder="Paste the IELTS essay question here..."
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-serif"
              />
            </div>

            {/* Essay Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Your Essay</label>
                <span
                  className={`text-xs font-semibold ${
                    essayWordCount < minWords ? 'text-amber-600' : 'text-emerald-700'
                  }`}
                >
                  {essayWordCount} / {minWords} words required
                </span>
              </div>
              <textarea
                value={essayInput}
                onChange={e => setEssayInput(e.target.value)}
                rows={12}
                placeholder="Type or paste your IELTS essay here..."
                className="w-full text-xs sm:text-sm p-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-serif leading-relaxed"
              />
            </div>

            {/* Live Progress Banner during evaluation */}
            {isEvaluating && (
              <div className="p-3.5 bg-indigo-50/90 border border-indigo-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 text-indigo-950 font-medium">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                  <span>{evalDetail || `Evaluating (${evalStage})...`}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEvaluate(true)}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-300 text-indigo-900 rounded-lg text-[11px] font-bold shadow-xs transition-colors"
                  >
                    Skip to Instant Examiner
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEvaluation}
                    className="px-2 py-1 text-slate-500 hover:text-red-600 text-[11px] font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Evaluation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500">
                {apiKey ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected to Gemini AI ({model})
                  </span>
                ) : (
                  <span className="text-indigo-900 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Instant Built-in Cambridge Examiner Active (Offline & Key-Free)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleLoadSampleReport}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                >
                  Sample Report
                </button>
                {apiKey ? (
                  <>
                    <button
                      type="button"
                      disabled={isEvaluating}
                      onClick={() => handleEvaluate(true)}
                      title="Test the 100% offline built-in examiner without calling Gemini API"
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Test Offline Mode</span>
                    </button>
                    <button
                      type="button"
                      disabled={isEvaluating}
                      onClick={() => handleEvaluate(false)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>
                        {isEvaluating ? `Evaluating (${evalStage})...` : 'Evaluate with Gemini AI'}
                      </span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={isEvaluating}
                    onClick={() => handleEvaluate(false)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>
                      {isEvaluating ? `Evaluating (${evalStage})...` : 'Evaluate with Built-in Examiner (Offline)'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Curriculum & Lessons */}
      {activeSubTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
              Underlying Curriculum
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Personal English Curriculum (Beginner to IELTS)
            </h2>
            <p className="text-xs text-slate-500">
              The AI maps every detected mistake to this curriculum so you master the rule before writing your next essay.
            </p>
          </div>

          {/* Curriculum Levels Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Curriculum Levels (1 to 7)
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {CURRICULUM_LEVELS.map((lvl: { level: number; name: string; topics: string }) => (
                <div key={lvl.level} className="py-2.5 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {lvl.level}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">{lvl.name}:</span>{' '}
                    <span className="text-slate-600">{lvl.topics}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Available Lessons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TUTOR_LESSONS.map((lesson: TutorLesson) => {
              const prog = tutorState.lessonProgress[lesson.id];
              return (
                <div
                  key={lesson.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Level {lesson.curriculumLevel} · {lesson.category}
                      </span>
                      {prog?.status === 'completed' && (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mastered ({prog.bestScore}%)
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{lesson.title}</h3>
                    {showSinhala && (
                      <p className="text-xs text-indigo-700 font-sinhala">{lesson.titleSi}</p>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed">{lesson.summary}</p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {lesson.quiz.length} practice questions
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenLesson(lesson.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Study</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-tab 4: API Key & Settings */}
      {activeSubTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6 max-w-2xl mx-auto">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
              Configuration
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Google Gemini API Settings
            </h2>
            <p className="text-xs text-slate-500">
              Your API key is saved strictly in your local browser storage (localStorage). It is never sent to any third-party server.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gemini API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => handleSaveApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Get a free API key at{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline font-medium"
                >
                  Google AI Studio (aistudio.google.com)
                </a>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gemini Model</label>
              <div className="flex gap-2 mb-2">
                {['gemini-3.8-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSaveModel(m)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                      model === m
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={model}
                onChange={e => handleSaveModel(e.target.value)}
                placeholder={DEFAULT_GEMINI_MODEL}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Recommended: <code className="bg-slate-100 px-1 py-0.5 rounded">gemini-3.8-flash</code> (fastest, latest Google recommendation) or <code className="bg-slate-100 px-1 py-0.5 rounded">gemini-1.5-flash</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-800">Why Bring-Your-Own-Key?</p>
              <p>
                Since this IELTS application is deployed to static GitHub Pages without any backend servers, storing an API key in the source code would leak it to the public. Using your own key keeps your requests private and free within Google's free-tier limits.
              </p>
              <p>
                If you do not want to use an API key, you can always explore the complete worked example report and take all lessons directly.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  handleSaveApiKey('');
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Clear Saved Key
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('submit')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Go to Essay Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Active Lesson Modal */}
      {activeLesson && (
        <TutorLessonModal
          lesson={activeLesson}
          userSentence={activeSentence}
          progress={tutorState.lessonProgress[activeLesson.id]}
          showSinhala={showSinhala}
          onClose={() => setActiveLesson(null)}
          onSaveProgress={handleSaveLessonProgress}
        />
      )}
    </div>
  );
};
