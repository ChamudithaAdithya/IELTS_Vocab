import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Send, 
  Sparkles, 
  Key, 
  Settings,
  BookOpen, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Award,
  Layers,
  ArrowRight,
  ArrowLeft,
  Loader2,
  X,
  PenTool,
  BarChart3,
  Mail,
  GraduationCap,
  Clock,
  Compass,
  Image as ImageIcon,
  Upload,
  Trash2,
  Maximize2
} from 'lucide-react';
import type { TutorReport, TutorLesson, LessonTopicId, TutorState, WritingTaskType } from '../types/tutor';
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
import { ApiSettingsModal } from './tutor/ApiSettingsModal';
import { evaluateEssayLocally } from '../utils/localEvaluator';
import { ALL_CAMBRIDGE_TESTS, CambridgeTestPrompt } from '../data/cambridgeTests';

interface WritingTutorViewProps {
  showSinhala: boolean;
  onNavigateToModule?: (module: string) => void;
  initialPromptId?: string;
}

export const WritingTutorView: React.FC<WritingTutorViewProps> = ({ 
  showSinhala, 
  onNavigateToModule,
  initialPromptId 
}) => {
  const [tutorState, setTutorState] = useState<TutorState>(loadTutorState);
  const [currentReport, setCurrentReport] = useState<TutorReport>(() => {
    try {
      const saved = loadTutorState();
      return (saved?.assessments && saved.assessments[0]) || SAMPLE_REPORT;
    } catch {
      return SAMPLE_REPORT;
    }
  });

  // Dedicated Page/View state (Replaces nested tabs with clear distinct views)
  const [currentView, setCurrentView] = useState<'hub' | 'editor' | 'report' | 'cambridge' | 'curriculum' | 'settings'>('hub');

  // Submission form state
  const [taskType, setTaskType] = useState<WritingTaskType>('task2');
  const [questionInput, setQuestionInput] = useState(SAMPLE_QUESTION);
  const [essayInput, setEssayInput] = useState(
    'Nowadays, choosing subject in university is a big decision for many student. Some people think student should study what they like, but other people believe they must only study useful subject like science and technology. In this essay I will discuss both side and give my opinion.\n\nFirstly, many people have different opinion about this. Students should choose their interested subjects because interest make them more motivated. If a student study a subject that they are interested, they will work hard and get good marks. For example my cousin love art and now he is a designer.\n\nOn the other hand, some peoples think science and technology is more useful. This subjects help the country to develop and it give many jobs. If students study history or art, they may face difficulties to find a employment after graduate.\n\nIn conclusion, I think both side have good points. Students should study what they like but they should also think about the jobs. Government should balance both sides.'
  );
  const [targetBand, setTargetBand] = useState<number>(8.0);

  // Cambridge past paper prompt picker modal state
  const [isPromptSelectorOpen, setIsPromptSelectorOpen] = useState<boolean>(false);
  const [promptFilterTab, setPromptFilterTab] = useState<'all' | 'c1' | 'c14-18' | 'task1' | 'task2'>('c1');
  const [isModelModalOpen, setIsModelModalOpen] = useState<boolean>(false);
  const [selectedModelPrompt, setSelectedModelPrompt] = useState<CambridgeTestPrompt | null>(null);

  // Evaluation pipeline state
  const [apiKey, setApiKey] = useState<string>(loadApiKey);
  const [model, setModel] = useState<string>(loadModel);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalStage, setEvalStage] = useState<PipelineStage>('validating');
  const [evalDetail, setEvalDetail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Attached Visual Prompt / Chart image state (for Academic Task 1 / Cambridge prompts)
  const [promptImage, setPromptImage] = useState<string | null>(null);
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState<boolean>(false);
  const [isDraggingPrompt, setIsDraggingPrompt] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 10MB. Please use a smaller screenshot or compressed image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setPromptImage(e.target.result);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePromptPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleImageFile(file);
          break;
        }
      }
    }
  };

  const handlePromptDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPrompt(false);
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleImageFile(file);
      }
    }
  };

  const handleRemovePromptImage = () => {
    setPromptImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Active Lesson modal state
  const [activeLesson, setActiveLesson] = useState<TutorLesson | null>(null);
  const [activeSentence, setActiveSentence] = useState<{ original: string; corrected: string } | undefined>();

  const essayWordCount = countWords(essayInput);
  const minWords = taskType === 'task2' ? 250 : 150;

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
      const currentEntry = prev.lessonProgress[activeLesson.id];
      const updated: TutorState = {
        ...prev,
        lessonProgress: {
          ...prev.lessonProgress,
          [activeLesson.id]: {
            status: 'completed',
            bestScore: Math.max(score, currentEntry?.bestScore || 0),
            attempts: (currentEntry?.attempts || 0) + 1,
          },
        },
      };
      saveTutorState(updated);
      return updated;
    });
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    saveApiKey(key);
  };

  const handleSaveModel = (m: string) => {
    setModel(m);
    saveModel(m);
  };

  const handleLoadSampleReport = () => {
    setCurrentReport(SAMPLE_REPORT);
    setCurrentView('report');
    setErrorMessage(null);
  };

  const handleLoadReportDirectly = (report: TutorReport) => {
    setCurrentReport(report);
    setCurrentView('report');
    setErrorMessage(null);
  };

  const handleLoadCambridgePrompt = (test: CambridgeTestPrompt, withCandidateEssay: boolean = false) => {
    setQuestionInput(test.question);
    if (test.taskType === 'task1') {
      setTaskType(test.id.includes('gt') ? 'gt_task1' : 'academic_task1');
    } else {
      setTaskType('task2');
    }
    if (withCandidateEssay && test.weakCandidateEssay?.text) {
      setEssayInput(test.weakCandidateEssay.text);
    } else {
      setEssayInput('');
    }
    setPromptImage(null);
    setCurrentView('editor');
    setIsPromptSelectorOpen(false);
    setErrorMessage(null);
  };

  const handleOpenModelAnswer = (test: CambridgeTestPrompt) => {
    setSelectedModelPrompt(test);
    setIsModelModalOpen(true);
  };

  useEffect(() => {
    if (initialPromptId) {
      const found = ALL_CAMBRIDGE_TESTS.find(t => t.id === initialPromptId);
      if (found) {
        handleLoadCambridgePrompt(found, false);
      }
    }
  }, [initialPromptId]);

  const handleSelectTaskType = (type: WritingTaskType) => {
    setTaskType(type);
    if (type === 'academic_task1') {
      const c18Task1 = ALL_CAMBRIDGE_TESTS.find(t => t.id === 'c18-t2-t1');
      setQuestionInput(c18Task1 ? c18Task1.question : 'The bar chart below illustrates housing tenure in England and Wales from 1918 to 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.');
      setEssayInput(c18Task1 ? c18Task1.weakCandidateEssay.text : '');
    } else if (type === 'gt_task1') {
      const gtTask1 = ALL_CAMBRIDGE_TESTS.find(t => t.id === 'c16-gt-t1');
      setQuestionInput(gtTask1 ? gtTask1.question : 'You recently stayed at a hotel and left a valuable item in your room. Write a letter to the hotel manager.');
      setEssayInput(gtTask1 ? gtTask1.weakCandidateEssay.text : '');
    } else {
      setQuestionInput(SAMPLE_QUESTION);
      setEssayInput(
        'Nowadays, choosing subject in university is a big decision for many student. Some people think student should study what they like, but other people believe they must only study useful subject like science and technology. In this essay I will discuss both side and give my opinion.\n\nFirstly, many people have different opinion about this. Students should choose their interested subjects because interest make them more motivated. If a student study a subject that they are interested, they will work hard and get good marks. For example my cousin love art and now he is a designer.\n\nOn the other hand, some peoples think science and technology is more useful. This subjects help the country to develop and it give many jobs. If students study history or art, they may face difficulties to find a employment after graduate.\n\nIn conclusion, I think both side have good points. Students should study what they like but they should also think about the jobs. Government should balance both sides.'
      );
    }
    setCurrentView('editor');
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
          taskType: taskType === 'task2' ? 'task2' : 'task1',
          targetBand,
          sinhala: showSinhala,
          promptImage: promptImage || undefined,
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

        setCurrentView('report');
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
      }
    }

    // 2. Instant Built-in Cambridge Examiner (100% Functional, Offline & Key-Free)
    try {
      setEvalStage('examining');
      setEvalDetail('Analyzing grammar, plurals, agreement and criterion band scores...');
      const report = evaluateEssayLocally({
        question: questionInput,
        essay: essayInput,
        taskType: taskType === 'task2' ? 'task2' : 'task1',
        targetBand,
        sinhala: showSinhala,
        promptImage: promptImage || undefined,
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

      setCurrentView('report');
    } catch (err: any) {
      setErrorMessage(err.message || 'Evaluation failed.');
    } finally {
      setIsEvaluating(false);
      setEvalDetail('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ========================================================================= */}
      {/* VIEW 1: THE WRITING PORTAL / HUB                                          */}
      {/* ========================================================================= */}
      {currentView === 'hub' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Bar of Writing Hub */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono shadow-2xs">
                  Writing Studio
                </span>
                <span className="text-xs text-slate-500 font-medium">Academic & General Training Tasks</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Select Writing Module
              </h1>
            </div>

            {/* Top Right Corner Settings & Tools Component */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleLoadSampleReport}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              >
                View Sample Report
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs border cursor-pointer ${
                  apiKey.trim()
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                }`}
                title="Configure Google Gemini API Key & Model"
              >
                <Settings className={`w-3.5 h-3.5 ${apiKey.trim() ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span>API Settings</span>
                {apiKey.trim() ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-normal">
                    Setup Key
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Module Selection Cards */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Select Writing Module (Dedicated Rooms)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Academic Task 1 */}
              <div 
                onClick={() => handleSelectTaskType('academic_task1')}
                className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
                      150 Words · 20 Mins
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      Academic Task 1: Data & Charts
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Practice Bar Charts, Line Graphs, Tables, Pie Charts and Process Diagrams. Focus on Task Achievement (TA) and overview structure.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 mt-4">
                  <span>Open Task 1 Academic Room</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: General Training Task 1 */}
              <div 
                onClick={() => handleSelectTaskType('gt_task1')}
                className="bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 font-mono">
                      150 Words · 20 Mins
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      General Training Task 1: Letters
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Practice Formal, Semi-formal and Informal letters (complaints, inquiries, apologies). Master tone, register and prompt bullet points.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 mt-4">
                  <span>Open GT Letter Room</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3: Task 2 Essays */}
              <div 
                onClick={() => handleSelectTaskType('task2')}
                className="bg-white border border-slate-200 hover:border-indigo-600 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold group-hover:bg-indigo-600 transition-colors">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 font-mono">
                      250 Words · 40 Mins
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      Task 2: Discursive Essay Master
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Agree/Disagree, Discussion, Problem-Solution, and Advantage/Disadvantage essays. Honest grading on TR, CC, LR, and GRA.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 mt-4">
                  <span>Open Task 2 Essay Room</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Official Cambridge Book 1 Writing Suite (All 10 Tasks) */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-md border border-indigo-900/50 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/40 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
                    Cambridge Book 1 Complete Suite
                  </span>
                  <span className="text-xs text-indigo-300 font-medium">10 Authentic Past Paper Tasks</span>
                </div>
                <h3 className="text-lg font-bold text-white">Official Cambridge 1 Writing Practice</h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Real examination tasks from Cambridge IELTS 1 (Academic Tests 1–4 Task 1 & 2 + General Training). Each task features an official prompt, authentic weak candidate sample (Band 5.0–5.5) with full error diagnosis, and an examiner-verified Band 8.5 model answer.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPromptFilterTab('c1');
                  setIsPromptSelectorOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Browse All 10 Tasks</span>
              </button>
            </div>

            {/* Quick 10-Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ALL_CAMBRIDGE_TESTS.filter(t => t.id.startsWith('c1-')).map(test => {
                const isTask1 = test.taskType === 'task1';
                return (
                  <div
                    key={test.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-indigo-800/40 hover:border-indigo-400/80 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {test.cambridgeBook}
                        </span>
                        <span className={`px-2 py-0.5 rounded ${isTask1 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'}`}>
                          {isTask1 ? 'Task 1 (150 words)' : 'Task 2 Essay (250 words)'}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {test.category}: {test.question.substring(0, 65)}...
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 font-serif italic">
                        "{test.question}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleLoadCambridgePrompt(test, false)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all flex items-center gap-1 cursor-pointer text-[11px]"
                        title="Open this prompt in the writing editor to write your own essay"
                      >
                        <PenTool className="w-3 h-3" />
                        <span>Write Essay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLoadReportDirectly(test.weakCandidateEssay.report)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold transition-all flex items-center gap-1 cursor-pointer text-[11px]"
                        title="Examine real candidate errors and check grade in the offline examiner"
                      >
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>Candidate (Band {test.weakCandidateEssay.band})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenModelAnswer(test)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold transition-all flex items-center gap-1 cursor-pointer text-[11px]"
                        title="Read examiner Band 8.5 model answer"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>Model</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Secondary Hub Cards: Cambridge Practical & Lessons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Cambridge Test Bank & Error Lab */}
            <div 
              onClick={() => setCurrentView('cambridge')}
              className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="space-y-1.5 max-w-md">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
                  Cambridge 1 & 14–18 Papers
                </span>
                <h3 className="text-base font-bold text-white">Cambridge Real Practical & Error Lab</h3>
                <p className="text-xs text-slate-300">
                  Analyze actual candidate submissions, spot real agreement errors in the Lab, or run the Timed Exam Simulator.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0 ml-3" />
            </div>

            {/* Grammar Curriculum */}
            <div 
              onClick={() => setCurrentView('curriculum')}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-slate-400 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="space-y-1.5 max-w-md">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono">
                  10 Personal Lessons
                </span>
                <h3 className="text-base font-bold text-slate-900">Grammar & Sentence Curriculum</h3>
                <p className="text-xs text-slate-500">
                  Learn subject-verb agreement, plural rules, and academic collocations directly linked to your errors.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-700 group-hover:translate-x-1 transition-transform shrink-0 ml-3" />
            </div>
          </div>

          {/* Direct Links to Reading & Listening Test Banks (ieltsfreepractice.com integration) */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Cambridge Reading & Listening Practice Sets (Exam Simulator)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Reading Practice Card */}
              <div
                onClick={() => onNavigateToModule?.('reading')}
                className="bg-emerald-50/60 border border-emerald-200 hover:border-emerald-400 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono">
                      Cambridge 15–18
                    </span>
                    <span className="text-xs font-bold text-emerald-800">4 Reading Passages</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Academic Reading Practice Tests</h3>
                  <p className="text-xs text-slate-600">
                    Urban Farming, History of Pencil, Polar Bears & Driverless Cars. Features Practice & 20-min Exam Mode with instant line citations.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0 ml-3 shadow-xs">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Listening Practice Card */}
              <div
                onClick={() => onNavigateToModule?.('listening')}
                className="bg-indigo-50/60 border border-indigo-200 hover:border-indigo-400 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono">
                      Sections 1 to 4
                    </span>
                    <span className="text-xs font-bold text-indigo-900">4 Listening Sets</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Cambridge Listening Practice Tests</h3>
                  <p className="text-xs text-slate-600">
                    Buckworth Arts, Redhill Reserve, Wind Farms & Roman Aqueducts. Includes audio speed controller, transcripts & distractor analysis.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0 ml-3 shadow-xs">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Cambridge Past Paper Prompt Selector Modal */}
      {isPromptSelectorOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsPromptSelectorOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Select Official Cambridge Writing Prompt</h3>
                  <p className="text-xs text-slate-500">Pick any real past paper prompt from Cambridge 1 or Books 14–18</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Filter:</span>
              {[
                { id: 'c1', label: `Cambridge 1 (${ALL_CAMBRIDGE_TESTS.filter(t => t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'c14-18', label: `Cambridge 14–18 (${ALL_CAMBRIDGE_TESTS.filter(t => !t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'task1', label: 'Academic Task 1' },
                { id: 'task2', label: 'Task 2 Essays' },
                { id: 'all', label: `All Prompts (${ALL_CAMBRIDGE_TESTS.length})` }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPromptFilterTab(f.id as any)}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    promptFilterTab === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Prompts List Grid */}
            <div className="p-5 overflow-y-auto space-y-3 max-h-[60vh] bg-slate-50/50">
              {ALL_CAMBRIDGE_TESTS
                .filter(t => {
                  if (promptFilterTab === 'c1') return t.id.startsWith('c1-');
                  if (promptFilterTab === 'c14-18') return !t.id.startsWith('c1-');
                  if (promptFilterTab === 'task1') return t.taskType === 'task1';
                  if (promptFilterTab === 'task2') return t.taskType === 'task2';
                  return true;
                })
                .map(test => {
                  const isTask1 = test.taskType === 'task1';
                  return (
                    <div
                      key={test.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-white">
                            {test.cambridgeBook}
                          </span>
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            isTask1 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {isTask1 ? 'Task 1 (150 words)' : 'Task 2 (250 words)'}
                          </span>
                          <span className="text-xs font-bold text-indigo-700">{test.category}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {test.suggestedTimeMinutes} mins · {test.minimumWords}+ words
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed font-medium">
                        {test.question}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] text-slate-500">
                          Candidate Band {test.weakCandidateEssay?.band || 5.0} attempt & Band 8.5 Model ready
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModelAnswer(test)}
                            className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            Read Band 8.5 Model
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, true)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
                            title="Load official prompt with the candidate attempt to grade and test"
                          >
                            Load Candidate Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, false)}
                            className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors shadow-xs cursor-pointer"
                          >
                            Write My Essay
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Tip: You can also attach real prompt charts/diagrams from past papers using the image button in the editor.</span>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Band 8.5 Model Answer Lightbox Modal */}
      {isModelModalOpen && selectedModelPrompt && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsModelModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white font-mono">
                  Band 8.5 Model Answer
                </span>
                <span className="text-xs font-bold text-slate-800">{selectedModelPrompt.cambridgeBook}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Examination Prompt:
                </span>
                <p className="text-xs sm:text-sm font-serif text-slate-900 leading-relaxed font-medium">
                  {selectedModelPrompt.question}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    High-Scoring Academic Response ({countWords(selectedModelPrompt.band8ModelAnswer.text)} Words)
                  </span>
                </div>
                <div className="font-serif text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap p-4 bg-emerald-50/30 rounded-xl border border-emerald-200/60 shadow-2xs">
                  {selectedModelPrompt.band8ModelAnswer.text}
                </div>
              </div>

              {selectedModelPrompt.band8ModelAnswer.examinerComments && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 block">Examiner Scoring Notes:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    {selectedModelPrompt.band8ModelAnswer.examinerComments.map((com, i) => (
                      <li key={i}>{com}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleLoadCambridgePrompt(selectedModelPrompt, false);
                  setIsModelModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Practice Writing This Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DEDICATED WRITING ROOM / EDITOR                                    */}
      {/* ========================================================================= */}
      {currentView === 'editor' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setCurrentView('hub')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Writing Hub</span>
            </button>

            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-500 hidden sm:inline">Task Type:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => handleSelectTaskType('academic_task1')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    taskType === 'academic_task1' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Academic Task 1
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTaskType('gt_task1')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    taskType === 'gt_task1' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  GT Task 1 (Letter)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTaskType('task2')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    taskType === 'task2' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Task 2 Essay
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  apiKey.trim()
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
                title="Configure Gemini API Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Error Notice if any */}
          {errorMessage && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Exam Workspace */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
            {/* Question Box & Visual Task Prompt */}
            <div
              className={`relative rounded-xl transition-all ${
                isDraggingPrompt ? 'ring-2 ring-indigo-500 bg-indigo-50/40 p-2 border-indigo-300' : ''
              }`}
              onDragOver={e => {
                e.preventDefault();
                setIsDraggingPrompt(true);
              }}
              onDragLeave={() => setIsDraggingPrompt(false)}
              onDrop={handlePromptDrop}
            >
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Official IELTS Prompt
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPromptFilterTab('c1');
                      setIsPromptSelectorOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all cursor-pointer"
                    title="Load an authentic Cambridge past paper prompt from Book 1 or Books 14–18"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Choose Cambridge Prompt</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      promptImage
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                    title="Upload or attach task diagram, chart, map, or table (Task 1 & 2)"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{promptImage ? 'Change Image' : 'Attach Task Image / Chart'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={questionInput}
                onChange={e => setQuestionInput(e.target.value)}
                onPaste={handlePromptPaste}
                rows={3}
                placeholder="Type or paste the IELTS question here... (Tip: You can press Ctrl+V to paste a copied chart or diagram directly here!)"
                className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-serif leading-relaxed"
              />

              {/* Attached Image Preview Card */}
              {promptImage ? (
                <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="relative w-16 h-12 bg-white rounded-lg border border-slate-300 overflow-hidden cursor-pointer group shrink-0 shadow-2xs"
                      onClick={() => setIsImageLightboxOpen(true)}
                      title="Click to view full size"
                    >
                      <img
                        src={promptImage}
                        alt="Task Prompt Chart"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          Task Diagram / Visual Prompt Attached
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                          Multimodal AI Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Gemini examiner will inspect visual trends, data, and charts for Task Achievement (TA)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsImageLightboxOpen(true)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                      title="Zoom diagram"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePromptImage}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove diagram"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>💡 Academic Task 1: Paste screenshot (<kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-600 text-[10px]">Ctrl+V</kbd>), drag & drop, or click attach to load bar/line charts, maps or diagrams.</span>
                </div>
              )}
            </div>

            {/* Essay Input Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Candidate Essay Submission
                </label>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    essayWordCount < minWords ? 'text-amber-600' : 'text-emerald-700'
                  }`}
                >
                  {essayWordCount} / {minWords} words required
                </span>
              </div>
              <textarea
                value={essayInput}
                onChange={e => setEssayInput(e.target.value)}
                rows={13}
                placeholder="Type or paste your essay here..."
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

            {/* Action Bar */}
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
                  View Sample
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


      {/* Cambridge Past Paper Prompt Selector Modal */}
      {isPromptSelectorOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsPromptSelectorOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Select Official Cambridge Writing Prompt</h3>
                  <p className="text-xs text-slate-500">Pick any real past paper prompt from Cambridge 1 or Books 14–18</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Filter:</span>
              {[
                { id: 'c1', label: `Cambridge 1 (${ALL_CAMBRIDGE_TESTS.filter(t => t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'c14-18', label: `Cambridge 14–18 (${ALL_CAMBRIDGE_TESTS.filter(t => !t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'task1', label: 'Academic Task 1' },
                { id: 'task2', label: 'Task 2 Essays' },
                { id: 'all', label: `All Prompts (${ALL_CAMBRIDGE_TESTS.length})` }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPromptFilterTab(f.id as any)}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    promptFilterTab === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Prompts List Grid */}
            <div className="p-5 overflow-y-auto space-y-3 max-h-[60vh] bg-slate-50/50">
              {ALL_CAMBRIDGE_TESTS
                .filter(t => {
                  if (promptFilterTab === 'c1') return t.id.startsWith('c1-');
                  if (promptFilterTab === 'c14-18') return !t.id.startsWith('c1-');
                  if (promptFilterTab === 'task1') return t.taskType === 'task1';
                  if (promptFilterTab === 'task2') return t.taskType === 'task2';
                  return true;
                })
                .map(test => {
                  const isTask1 = test.taskType === 'task1';
                  return (
                    <div
                      key={test.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-white">
                            {test.cambridgeBook}
                          </span>
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            isTask1 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {isTask1 ? 'Task 1 (150 words)' : 'Task 2 (250 words)'}
                          </span>
                          <span className="text-xs font-bold text-indigo-700">{test.category}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {test.suggestedTimeMinutes} mins · {test.minimumWords}+ words
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed font-medium">
                        {test.question}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] text-slate-500">
                          Candidate Band {test.weakCandidateEssay?.band || 5.0} attempt & Band 8.5 Model ready
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModelAnswer(test)}
                            className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            Read Band 8.5 Model
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, true)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
                            title="Load official prompt with the candidate attempt to grade and test"
                          >
                            Load Candidate Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, false)}
                            className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors shadow-xs cursor-pointer"
                          >
                            Write My Essay
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Tip: You can also attach real prompt charts/diagrams from past papers using the image button in the editor.</span>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Band 8.5 Model Answer Lightbox Modal */}
      {isModelModalOpen && selectedModelPrompt && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsModelModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white font-mono">
                  Band 8.5 Model Answer
                </span>
                <span className="text-xs font-bold text-slate-800">{selectedModelPrompt.cambridgeBook}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Examination Prompt:
                </span>
                <p className="text-xs sm:text-sm font-serif text-slate-900 leading-relaxed font-medium">
                  {selectedModelPrompt.question}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    High-Scoring Academic Response ({countWords(selectedModelPrompt.band8ModelAnswer.text)} Words)
                  </span>
                </div>
                <div className="font-serif text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap p-4 bg-emerald-50/30 rounded-xl border border-emerald-200/60 shadow-2xs">
                  {selectedModelPrompt.band8ModelAnswer.text}
                </div>
              </div>

              {selectedModelPrompt.band8ModelAnswer.examinerComments && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 block">Examiner Scoring Notes:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    {selectedModelPrompt.band8ModelAnswer.examinerComments.map((com, i) => (
                      <li key={i}>{com}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleLoadCambridgePrompt(selectedModelPrompt, false);
                  setIsModelModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Practice Writing This Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: DEDICATED FULL EVALUATION REPORT PAGE                             */}
      {/* ========================================================================= */}
      {currentView === 'report' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Fallback Notice if Gemini AI failed or key had issues */}
          {errorMessage && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 animate-in fade-in shadow-2xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Gemini AI Notification:</span>
                  <p className="text-[11px] text-amber-900 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl font-bold text-xs shrink-0 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
              >
                Open Settings & Test Key
              </button>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setCurrentView('hub')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Writing Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('editor')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Edit / Write Next Essay</span>
            </button>
          </div>

          <TutorReportView
            report={currentReport}
            showSinhala={showSinhala}
            onOpenLesson={handleOpenLesson}
            onRetest={() => setCurrentView('editor')}
          />
        </div>
      )}


      {/* Cambridge Past Paper Prompt Selector Modal */}
      {isPromptSelectorOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsPromptSelectorOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Select Official Cambridge Writing Prompt</h3>
                  <p className="text-xs text-slate-500">Pick any real past paper prompt from Cambridge 1 or Books 14–18</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Filter:</span>
              {[
                { id: 'c1', label: `Cambridge 1 (${ALL_CAMBRIDGE_TESTS.filter(t => t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'c14-18', label: `Cambridge 14–18 (${ALL_CAMBRIDGE_TESTS.filter(t => !t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'task1', label: 'Academic Task 1' },
                { id: 'task2', label: 'Task 2 Essays' },
                { id: 'all', label: `All Prompts (${ALL_CAMBRIDGE_TESTS.length})` }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPromptFilterTab(f.id as any)}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    promptFilterTab === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Prompts List Grid */}
            <div className="p-5 overflow-y-auto space-y-3 max-h-[60vh] bg-slate-50/50">
              {ALL_CAMBRIDGE_TESTS
                .filter(t => {
                  if (promptFilterTab === 'c1') return t.id.startsWith('c1-');
                  if (promptFilterTab === 'c14-18') return !t.id.startsWith('c1-');
                  if (promptFilterTab === 'task1') return t.taskType === 'task1';
                  if (promptFilterTab === 'task2') return t.taskType === 'task2';
                  return true;
                })
                .map(test => {
                  const isTask1 = test.taskType === 'task1';
                  return (
                    <div
                      key={test.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-white">
                            {test.cambridgeBook}
                          </span>
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            isTask1 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {isTask1 ? 'Task 1 (150 words)' : 'Task 2 (250 words)'}
                          </span>
                          <span className="text-xs font-bold text-indigo-700">{test.category}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {test.suggestedTimeMinutes} mins · {test.minimumWords}+ words
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed font-medium">
                        {test.question}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] text-slate-500">
                          Candidate Band {test.weakCandidateEssay?.band || 5.0} attempt & Band 8.5 Model ready
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModelAnswer(test)}
                            className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            Read Band 8.5 Model
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, true)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
                            title="Load official prompt with the candidate attempt to grade and test"
                          >
                            Load Candidate Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, false)}
                            className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors shadow-xs cursor-pointer"
                          >
                            Write My Essay
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Tip: You can also attach real prompt charts/diagrams from past papers using the image button in the editor.</span>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Band 8.5 Model Answer Lightbox Modal */}
      {isModelModalOpen && selectedModelPrompt && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsModelModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white font-mono">
                  Band 8.5 Model Answer
                </span>
                <span className="text-xs font-bold text-slate-800">{selectedModelPrompt.cambridgeBook}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Examination Prompt:
                </span>
                <p className="text-xs sm:text-sm font-serif text-slate-900 leading-relaxed font-medium">
                  {selectedModelPrompt.question}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    High-Scoring Academic Response ({countWords(selectedModelPrompt.band8ModelAnswer.text)} Words)
                  </span>
                </div>
                <div className="font-serif text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap p-4 bg-emerald-50/30 rounded-xl border border-emerald-200/60 shadow-2xs">
                  {selectedModelPrompt.band8ModelAnswer.text}
                </div>
              </div>

              {selectedModelPrompt.band8ModelAnswer.examinerComments && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 block">Examiner Scoring Notes:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    {selectedModelPrompt.band8ModelAnswer.examinerComments.map((com, i) => (
                      <li key={i}>{com}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleLoadCambridgePrompt(selectedModelPrompt, false);
                  setIsModelModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Practice Writing This Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: CAMBRIDGE TEST BANK & ERROR SPOTTER LAB                           */}
      {/* ========================================================================= */}
      {currentView === 'cambridge' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setCurrentView('hub')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Writing Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('editor')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Open Custom Writing Room
            </button>
          </div>

          <CambridgeActivitiesView
            showSinhala={showSinhala}
            onLoadReport={handleLoadReportDirectly}
            onStartWritingPrompt={(q, t) => {
              setQuestionInput(q);
              setTaskType(t === 'task1' ? 'academic_task1' : 'task2');
              setCurrentView('editor');
            }}
          />
        </div>
      )}


      {/* Cambridge Past Paper Prompt Selector Modal */}
      {isPromptSelectorOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsPromptSelectorOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Select Official Cambridge Writing Prompt</h3>
                  <p className="text-xs text-slate-500">Pick any real past paper prompt from Cambridge 1 or Books 14–18</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Filter:</span>
              {[
                { id: 'c1', label: `Cambridge 1 (${ALL_CAMBRIDGE_TESTS.filter(t => t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'c14-18', label: `Cambridge 14–18 (${ALL_CAMBRIDGE_TESTS.filter(t => !t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'task1', label: 'Academic Task 1' },
                { id: 'task2', label: 'Task 2 Essays' },
                { id: 'all', label: `All Prompts (${ALL_CAMBRIDGE_TESTS.length})` }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPromptFilterTab(f.id as any)}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    promptFilterTab === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Prompts List Grid */}
            <div className="p-5 overflow-y-auto space-y-3 max-h-[60vh] bg-slate-50/50">
              {ALL_CAMBRIDGE_TESTS
                .filter(t => {
                  if (promptFilterTab === 'c1') return t.id.startsWith('c1-');
                  if (promptFilterTab === 'c14-18') return !t.id.startsWith('c1-');
                  if (promptFilterTab === 'task1') return t.taskType === 'task1';
                  if (promptFilterTab === 'task2') return t.taskType === 'task2';
                  return true;
                })
                .map(test => {
                  const isTask1 = test.taskType === 'task1';
                  return (
                    <div
                      key={test.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-white">
                            {test.cambridgeBook}
                          </span>
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            isTask1 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {isTask1 ? 'Task 1 (150 words)' : 'Task 2 (250 words)'}
                          </span>
                          <span className="text-xs font-bold text-indigo-700">{test.category}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {test.suggestedTimeMinutes} mins · {test.minimumWords}+ words
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed font-medium">
                        {test.question}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] text-slate-500">
                          Candidate Band {test.weakCandidateEssay?.band || 5.0} attempt & Band 8.5 Model ready
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModelAnswer(test)}
                            className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            Read Band 8.5 Model
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, true)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
                            title="Load official prompt with the candidate attempt to grade and test"
                          >
                            Load Candidate Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, false)}
                            className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors shadow-xs cursor-pointer"
                          >
                            Write My Essay
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Tip: You can also attach real prompt charts/diagrams from past papers using the image button in the editor.</span>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Band 8.5 Model Answer Lightbox Modal */}
      {isModelModalOpen && selectedModelPrompt && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsModelModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white font-mono">
                  Band 8.5 Model Answer
                </span>
                <span className="text-xs font-bold text-slate-800">{selectedModelPrompt.cambridgeBook}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Examination Prompt:
                </span>
                <p className="text-xs sm:text-sm font-serif text-slate-900 leading-relaxed font-medium">
                  {selectedModelPrompt.question}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    High-Scoring Academic Response ({countWords(selectedModelPrompt.band8ModelAnswer.text)} Words)
                  </span>
                </div>
                <div className="font-serif text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap p-4 bg-emerald-50/30 rounded-xl border border-emerald-200/60 shadow-2xs">
                  {selectedModelPrompt.band8ModelAnswer.text}
                </div>
              </div>

              {selectedModelPrompt.band8ModelAnswer.examinerComments && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 block">Examiner Scoring Notes:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    {selectedModelPrompt.band8ModelAnswer.examinerComments.map((com, i) => (
                      <li key={i}>{com}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleLoadCambridgePrompt(selectedModelPrompt, false);
                  setIsModelModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Practice Writing This Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: CURRICULUM & LESSONS LIBRARY                                      */}
      {/* ========================================================================= */}
      {currentView === 'curriculum' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setCurrentView('hub')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Writing Hub</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
              Underlying Curriculum
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Personal English Curriculum (Beginner to IELTS Band 8)
            </h2>
            <p className="text-xs text-slate-500">
              The AI maps every detected mistake to this curriculum so you master the rule before writing your next essay.
            </p>
          </div>

          {/* Curriculum Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-3 w-16">Level</th>
                    <th className="p-3">Skill Area</th>
                    <th className="p-3">Core Grammar Rule</th>
                    <th className="p-3">Coverage & Applications</th>
                    <th className="p-3 w-28 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TUTOR_LESSONS.map(l => {
                    const prog = tutorState.lessonProgress[l.id];
                    const isPassed = prog && prog.bestScore >= 80;

                    return (
                      <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-bold font-mono text-slate-900">Lvl {l.curriculumLevel}</td>
                        <td className="p-3 font-semibold text-slate-900">
                          {l.title}
                          {showSinhala && (
                            <span className="block text-[11px] text-slate-500 font-sans font-normal">
                              {l.titleSi}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-700">{l.summary}</td>
                        <td className="p-3 text-slate-500">{l.covers}</td>
                        <td className="p-3 text-center">
                          {isPassed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Passed ({prog.bestScore}%)
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenLesson(l.id)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-lg transition-colors"
                            >
                              Study Now
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* Cambridge Past Paper Prompt Selector Modal */}
      {isPromptSelectorOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsPromptSelectorOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Select Official Cambridge Writing Prompt</h3>
                  <p className="text-xs text-slate-500">Pick any real past paper prompt from Cambridge 1 or Books 14–18</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Filter:</span>
              {[
                { id: 'c1', label: `Cambridge 1 (${ALL_CAMBRIDGE_TESTS.filter(t => t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'c14-18', label: `Cambridge 14–18 (${ALL_CAMBRIDGE_TESTS.filter(t => !t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'task1', label: 'Academic Task 1' },
                { id: 'task2', label: 'Task 2 Essays' },
                { id: 'all', label: `All Prompts (${ALL_CAMBRIDGE_TESTS.length})` }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPromptFilterTab(f.id as any)}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    promptFilterTab === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Prompts List Grid */}
            <div className="p-5 overflow-y-auto space-y-3 max-h-[60vh] bg-slate-50/50">
              {ALL_CAMBRIDGE_TESTS
                .filter(t => {
                  if (promptFilterTab === 'c1') return t.id.startsWith('c1-');
                  if (promptFilterTab === 'c14-18') return !t.id.startsWith('c1-');
                  if (promptFilterTab === 'task1') return t.taskType === 'task1';
                  if (promptFilterTab === 'task2') return t.taskType === 'task2';
                  return true;
                })
                .map(test => {
                  const isTask1 = test.taskType === 'task1';
                  return (
                    <div
                      key={test.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-white">
                            {test.cambridgeBook}
                          </span>
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            isTask1 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {isTask1 ? 'Task 1 (150 words)' : 'Task 2 (250 words)'}
                          </span>
                          <span className="text-xs font-bold text-indigo-700">{test.category}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {test.suggestedTimeMinutes} mins · {test.minimumWords}+ words
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed font-medium">
                        {test.question}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] text-slate-500">
                          Candidate Band {test.weakCandidateEssay?.band || 5.0} attempt & Band 8.5 Model ready
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModelAnswer(test)}
                            className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            Read Band 8.5 Model
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, true)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
                            title="Load official prompt with the candidate attempt to grade and test"
                          >
                            Load Candidate Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, false)}
                            className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors shadow-xs cursor-pointer"
                          >
                            Write My Essay
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Tip: You can also attach real prompt charts/diagrams from past papers using the image button in the editor.</span>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Band 8.5 Model Answer Lightbox Modal */}
      {isModelModalOpen && selectedModelPrompt && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsModelModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white font-mono">
                  Band 8.5 Model Answer
                </span>
                <span className="text-xs font-bold text-slate-800">{selectedModelPrompt.cambridgeBook}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Examination Prompt:
                </span>
                <p className="text-xs sm:text-sm font-serif text-slate-900 leading-relaxed font-medium">
                  {selectedModelPrompt.question}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    High-Scoring Academic Response ({countWords(selectedModelPrompt.band8ModelAnswer.text)} Words)
                  </span>
                </div>
                <div className="font-serif text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap p-4 bg-emerald-50/30 rounded-xl border border-emerald-200/60 shadow-2xs">
                  {selectedModelPrompt.band8ModelAnswer.text}
                </div>
              </div>

              {selectedModelPrompt.band8ModelAnswer.examinerComments && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 block">Examiner Scoring Notes:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    {selectedModelPrompt.band8ModelAnswer.examinerComments.map((com, i) => (
                      <li key={i}>{com}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleLoadCambridgePrompt(selectedModelPrompt, false);
                  setIsModelModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Practice Writing This Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 6: SETTINGS & GEMINI API CONFIGURATION                               */}
      {/* ========================================================================= */}
      {currentView === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setCurrentView('hub')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Writing Hub</span>
            </button>
          </div>

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
                <div className="flex flex-wrap gap-2 mb-2">
                  {['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-3.8-flash'].map(m => (
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
                  Recommended: <code className="bg-slate-100 px-1 py-0.5 rounded">gemini-1.5-flash</code> (fastest, most stable free-tier model) or <code className="bg-slate-100 px-1 py-0.5 rounded">gemini-2.0-flash</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <p className="font-bold text-slate-800">Why Bring-Your-Own-Key?</p>
                <p>
                  Since this IELTS application is deployed to static GitHub Pages without any backend servers, storing an API key in the source code would leak it to the public. Using your own key keeps your requests private and free within Google's free-tier limits.
                </p>
                <p>
                  If you do not want to use an API key, you can always test with the Built-in Cambridge Examiner 100% offline and key-free.
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
                  onClick={() => setCurrentView('hub')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Return to Hub
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Cambridge Past Paper Prompt Selector Modal */}
      {isPromptSelectorOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsPromptSelectorOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Select Official Cambridge Writing Prompt</h3>
                  <p className="text-xs text-slate-500">Pick any real past paper prompt from Cambridge 1 or Books 14–18</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Filter:</span>
              {[
                { id: 'c1', label: `Cambridge 1 (${ALL_CAMBRIDGE_TESTS.filter(t => t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'c14-18', label: `Cambridge 14–18 (${ALL_CAMBRIDGE_TESTS.filter(t => !t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'task1', label: 'Academic Task 1' },
                { id: 'task2', label: 'Task 2 Essays' },
                { id: 'all', label: `All Prompts (${ALL_CAMBRIDGE_TESTS.length})` }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPromptFilterTab(f.id as any)}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    promptFilterTab === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Prompts List Grid */}
            <div className="p-5 overflow-y-auto space-y-3 max-h-[60vh] bg-slate-50/50">
              {ALL_CAMBRIDGE_TESTS
                .filter(t => {
                  if (promptFilterTab === 'c1') return t.id.startsWith('c1-');
                  if (promptFilterTab === 'c14-18') return !t.id.startsWith('c1-');
                  if (promptFilterTab === 'task1') return t.taskType === 'task1';
                  if (promptFilterTab === 'task2') return t.taskType === 'task2';
                  return true;
                })
                .map(test => {
                  const isTask1 = test.taskType === 'task1';
                  return (
                    <div
                      key={test.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-white">
                            {test.cambridgeBook}
                          </span>
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            isTask1 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {isTask1 ? 'Task 1 (150 words)' : 'Task 2 (250 words)'}
                          </span>
                          <span className="text-xs font-bold text-indigo-700">{test.category}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {test.suggestedTimeMinutes} mins · {test.minimumWords}+ words
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed font-medium">
                        {test.question}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] text-slate-500">
                          Candidate Band {test.weakCandidateEssay?.band || 5.0} attempt & Band 8.5 Model ready
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModelAnswer(test)}
                            className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            Read Band 8.5 Model
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, true)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
                            title="Load official prompt with the candidate attempt to grade and test"
                          >
                            Load Candidate Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, false)}
                            className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors shadow-xs cursor-pointer"
                          >
                            Write My Essay
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Tip: You can also attach real prompt charts/diagrams from past papers using the image button in the editor.</span>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Band 8.5 Model Answer Lightbox Modal */}
      {isModelModalOpen && selectedModelPrompt && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsModelModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white font-mono">
                  Band 8.5 Model Answer
                </span>
                <span className="text-xs font-bold text-slate-800">{selectedModelPrompt.cambridgeBook}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Examination Prompt:
                </span>
                <p className="text-xs sm:text-sm font-serif text-slate-900 leading-relaxed font-medium">
                  {selectedModelPrompt.question}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    High-Scoring Academic Response ({countWords(selectedModelPrompt.band8ModelAnswer.text)} Words)
                  </span>
                </div>
                <div className="font-serif text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap p-4 bg-emerald-50/30 rounded-xl border border-emerald-200/60 shadow-2xs">
                  {selectedModelPrompt.band8ModelAnswer.text}
                </div>
              </div>

              {selectedModelPrompt.band8ModelAnswer.examinerComments && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 block">Examiner Scoring Notes:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    {selectedModelPrompt.band8ModelAnswer.examinerComments.map((com, i) => (
                      <li key={i}>{com}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleLoadCambridgePrompt(selectedModelPrompt, false);
                  setIsModelModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Practice Writing This Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
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

      {/* Google Gemini API Configuration Modal */}
      <ApiSettingsModal
        isOpen={isSettingsModalOpen || currentView === 'settings'}
        onClose={() => {
          setIsSettingsModalOpen(false);
          if (currentView === 'settings') {
            setCurrentView('hub');
          }
        }}
        onKeyUpdated={(k, m) => {
          setApiKey(k);
          setModel(m);
        }}
      />

      {/* Visual Prompt Lightbox Modal */}
      {isImageLightboxOpen && promptImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsImageLightboxOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Official IELTS Task Visual Prompt / Diagram</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImageLightboxOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-100 min-h-[300px]">
              <img 
                src={promptImage} 
                alt="IELTS Task Diagram" 
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="px-5 py-2.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500 font-serif">
              <span className="truncate max-w-xl">"{questionInput}"</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRemovePromptImage}
                  className="px-3 py-1 text-rose-600 hover:bg-rose-50 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Remove Diagram
                </button>
                <button
                  type="button"
                  onClick={() => setIsImageLightboxOpen(false)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cambridge Past Paper Prompt Selector Modal */}
      {isPromptSelectorOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsPromptSelectorOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Select Official Cambridge Writing Prompt</h3>
                  <p className="text-xs text-slate-500">Pick any real past paper prompt from Cambridge 1 or Books 14–18</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Filter:</span>
              {[
                { id: 'c1', label: `Cambridge 1 (${ALL_CAMBRIDGE_TESTS.filter(t => t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'c14-18', label: `Cambridge 14–18 (${ALL_CAMBRIDGE_TESTS.filter(t => !t.id.startsWith('c1-')).length} Tasks)` },
                { id: 'task1', label: 'Academic Task 1' },
                { id: 'task2', label: 'Task 2 Essays' },
                { id: 'all', label: `All Prompts (${ALL_CAMBRIDGE_TESTS.length})` }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPromptFilterTab(f.id as any)}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    promptFilterTab === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Prompts List Grid */}
            <div className="p-5 overflow-y-auto space-y-3 max-h-[60vh] bg-slate-50/50">
              {ALL_CAMBRIDGE_TESTS
                .filter(t => {
                  if (promptFilterTab === 'c1') return t.id.startsWith('c1-');
                  if (promptFilterTab === 'c14-18') return !t.id.startsWith('c1-');
                  if (promptFilterTab === 'task1') return t.taskType === 'task1';
                  if (promptFilterTab === 'task2') return t.taskType === 'task2';
                  return true;
                })
                .map(test => {
                  const isTask1 = test.taskType === 'task1';
                  return (
                    <div
                      key={test.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-white">
                            {test.cambridgeBook}
                          </span>
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            isTask1 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {isTask1 ? 'Task 1 (150 words)' : 'Task 2 (250 words)'}
                          </span>
                          <span className="text-xs font-bold text-indigo-700">{test.category}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {test.suggestedTimeMinutes} mins · {test.minimumWords}+ words
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed font-medium">
                        {test.question}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] text-slate-500">
                          Candidate Band {test.weakCandidateEssay?.band || 5.0} attempt & Band 8.5 Model ready
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModelAnswer(test)}
                            className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            Read Band 8.5 Model
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, true)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
                            title="Load official prompt with the candidate attempt to grade and test"
                          >
                            Load Candidate Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCambridgePrompt(test, false)}
                            className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors shadow-xs cursor-pointer"
                          >
                            Write My Essay
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Tip: You can also attach real prompt charts/diagrams from past papers using the image button in the editor.</span>
              <button
                type="button"
                onClick={() => setIsPromptSelectorOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Band 8.5 Model Answer Lightbox Modal */}
      {isModelModalOpen && selectedModelPrompt && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsModelModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col w-full animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white font-mono">
                  Band 8.5 Model Answer
                </span>
                <span className="text-xs font-bold text-slate-800">{selectedModelPrompt.cambridgeBook}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Examination Prompt:
                </span>
                <p className="text-xs sm:text-sm font-serif text-slate-900 leading-relaxed font-medium">
                  {selectedModelPrompt.question}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    High-Scoring Academic Response ({countWords(selectedModelPrompt.band8ModelAnswer.text)} Words)
                  </span>
                </div>
                <div className="font-serif text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap p-4 bg-emerald-50/30 rounded-xl border border-emerald-200/60 shadow-2xs">
                  {selectedModelPrompt.band8ModelAnswer.text}
                </div>
              </div>

              {selectedModelPrompt.band8ModelAnswer.examinerComments && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 block">Examiner Scoring Notes:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    {selectedModelPrompt.band8ModelAnswer.examinerComments.map((com, i) => (
                      <li key={i}>{com}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleLoadCambridgePrompt(selectedModelPrompt, false);
                  setIsModelModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Practice Writing This Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModelModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
