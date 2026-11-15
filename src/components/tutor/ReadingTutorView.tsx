import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Maximize2, 
  Minimize2, 
  Layers, 
  FileText, 
  Target, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X, 
  Check, 
  AlertCircle,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { CAMBRIDGE_READING_TESTS } from '../../data/readingTests';
import type { ReadingPassage, ReadingQuestion } from '../../types/tutor';

interface ReadingTutorViewProps {
  showSinhala: boolean;
  onBackToHub?: () => void;
  initialPassageId?: string;
}

export interface ReadingQuestionGroup {
  id: string;
  type: 'TFNG' | 'headings' | 'summary' | 'mcq';
  startNum: number;
  endNum: number;
  instruction: string;
  questions: { q: ReadingQuestion; index: number }[];
}

/**
 * Removes accidental leading numbering ("9. ", "16. ", "TABLE: ", "Cause: ") from question text
 * so that the index badge and question text never display duplicate numbers.
 */
const cleanQuestionText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/^\s*(?:Question|Q)?\s*(?:[1-9]|[1-3][0-9]|4[0-5])[\.\:\)\-]\s*/i, '')
    .replace(/^\s*\((?:[1-9]|[1-3][0-9]|4[0-5])\)\s*/, '')
    .replace(/^TABLE:\s*(\(\d+\)\s*)?/i, '')
    .replace(/^Cause:\s*/i, '')
    .replace(/:\s*\.{2,}\s*\(\d+\)\s*\.{2,}/g, '')
    .replace(/\s*\.{2,}\s*\(\d+\)\s*\.{2,}/g, '')
    .replace(/\s*\(\d+\)\s*\.{3,}/g, '')
    .replace(/\s*\.{3,}\s*\(\d+\)/g, '')
    .trim();
};

/**
 * Formats an option code into a human-readable display label with the full text,
 * e.g. "D" -> "D – Charles Moore", or "C" -> "C – Geschwind and Galaburda".
 */
const getOptionFullLabel = (codeOrText: string, options?: string[]): string => {
  if (!codeOrText) return '';
  const clean = codeOrText.trim();
  if (!options || options.length === 0) {
    return clean.split('//')[0].trim();
  }
  const cleanUpper = clean.toUpperCase();
  for (const opt of options) {
    const match = opt.match(/^([A-Za-z0-9ivxlcdmIVXLCDM]+):\s*(.*)$/);
    if (match) {
      if (match[1].toUpperCase() === cleanUpper) {
        return `${match[1]} – ${match[2]}`;
      }
    } else if (opt.toUpperCase().startsWith(cleanUpper)) {
      return opt;
    }
  }
  return clean.split('//')[0].trim();
};

/**
 * Parses Cambridge IELTS source into book number, test number, and passage/section number.
 * e.g. "Cambridge IELTS 1, Test 2 - Reading Passage 3" -> { book: 1, isGT: false, testNum: 2, passageNum: 3 }
 * e.g. "Cambridge IELTS 1, General Training - Section 2" -> { book: 1, isGT: true, testNum: 'GT', passageNum: 2 }
 */
const parseReadingSource = (source: string) => {
  const bookMatch = source.match(/Cambridge(?:\s+IELTS)?\s+(\d+)/i);
  const book = bookMatch ? parseInt(bookMatch[1], 10) : 1;

  const isGT = /General\s+Training/i.test(source);
  const testMatch = source.match(/Test\s+(\d+)/i);
  const testNum: number | 'GT' = isGT ? 'GT' : (testMatch ? parseInt(testMatch[1], 10) : 1);

  const passMatch = source.match(/(?:Passage|Section)\s+(\d+)/i);
  const passageNum = passMatch ? parseInt(passMatch[1], 10) : 1;

  return {
    book,
    isGT,
    testNum,
    passageNum,
    testLabel: isGT ? 'General Training' : `Academic Test ${testNum}`,
    passageLabel: isGT ? `Section ${passageNum}` : `Passage ${passageNum}`
  };
};

/**
 * Extracts authentic question number from question id (e.g. "c1-t1-p2-q16" -> 16).
 */
const getQuestionNumber = (q: ReadingQuestion, fallbackIndex: number): number => {
  const match = q.id.match(/-q(\d+)$/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return fallbackIndex;
};

/**
 * Initial student answers pre-filled for retest mode.
 */
const DEFAULT_PREFILLED_ANSWERS: Record<string, Record<string, string>> = {};

export const ReadingTutorView: React.FC<ReadingTutorViewProps> = ({ 
  showSinhala, 
  onBackToHub, 
  initialPassageId 
}) => {
  // 1. Passage Selection State
  const initialPassage = useMemo(() => {
    if (initialPassageId) {
      const found = CAMBRIDGE_READING_TESTS.find(p => p.id === initialPassageId);
      if (found) return found;
    }
    return CAMBRIDGE_READING_TESTS[0] || null;
  }, [initialPassageId]);

  const initialInfo = useMemo(() => {
    if (initialPassage) return parseReadingSource(initialPassage.cambridgeSource);
    return { book: 1, isGT: false, testNum: 1 as const, passageNum: 1, testLabel: 'Test 1', passageLabel: 'Passage 1' };
  }, [initialPassage]);

  const [selectedBook, setSelectedBook] = useState<number | 'all'>(initialInfo.book);
  const [selectedTestNum, setSelectedTestNum] = useState<number | 'GT' | 'all'>(initialInfo.testNum);
  const [selectedPassage, setSelectedPassage] = useState<ReadingPassage | null>(initialPassage);
  const [testMode, setTestMode] = useState<'practice' | 'exam'>('practice');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>(() => {
    if (initialPassage && DEFAULT_PREFILLED_ANSWERS[initialPassage.id]) {
      return { ...DEFAULT_PREFILLED_ANSWERS[initialPassage.id] };
    }
    return {};
  });
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [hideTime, setHideTime] = useState<boolean>(false);
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [passageNotes, setPassageNotes] = useState<string>(() => {
    try {
      return localStorage.getItem('ielts_reading_notes_v1') || '';
    } catch {
      return '';
    }
  });
  const [highlightedSnippets, setHighlightedSnippets] = useState<string[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('ielts_reading_notes_v1', passageNotes);
    } catch {}
  }, [passageNotes]);

  // 2. Layout Mode: 'one-screen' (Split dual-column) | 'by-task' (Tabbed tasks) | 'single' (Focus 1-by-1)
  const [layoutMode, setLayoutMode] = useState<'one-screen' | 'by-task' | 'single'>('one-screen');
  const [activeTaskTab, setActiveTaskTab] = useState<number>(0);

  const firstQuestionNum = useMemo(() => {
    if (!selectedPassage || !selectedPassage.questions || selectedPassage.questions.length === 0) return 1;
    return getQuestionNumber(selectedPassage.questions[0], 1);
  }, [selectedPassage]);

  const [focusedQuestionIndex, setFocusedQuestionIndex] = useState<number>(firstQuestionNum);
  const [highlightedPara, setHighlightedPara] = useState<string | null>(null);

  // 3. Passage Reader Controls: Font Size & Search
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchBox, setShowSearchBox] = useState<boolean>(false);

  // 4. Submission & Evaluation State
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportFilter, setReportFilter] = useState<'all' | 'incorrect' | 'flagged'>('all');
  const [resultsViewMode, setResultsViewMode] = useState<'list' | 'split'>('list');
  const [showOnlyWrong, setShowOnlyWrong] = useState<boolean>(false);
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  const [activeResultsPassageId, setActiveResultsPassageId] = useState<string>(
    initialPassage?.id || ''
  );
  const [focusedResultsQuestionId, setFocusedResultsQuestionId] = useState<string | null>(null);

  // 5. Countdown Timer (60 minutes for full 3-passage Reading Test)
  const [examSecondsLeft, setExamSecondsLeft] = useState<number>(60 * 60);

  // 6. Fullscreen Mode Controller
  const containerRef = useRef<HTMLDivElement | null>(null);
  const passageScrollRef = useRef<HTMLDivElement | null>(null);
  const resultsPassageScrollRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any)?.webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch {
      // Ignore fullscreen rejection
    }
  };

  // Sync when initialPassageId changes externally
  useEffect(() => {
    if (initialPassageId) {
      const found = CAMBRIDGE_READING_TESTS.find(p => p.id === initialPassageId);
      if (found) {
        const info = parseReadingSource(found.cambridgeSource);
        setSelectedPassage(found);
        setSelectedBook(info.book);
        setSelectedTestNum(info.testNum);
        setFocusedQuestionIndex(getQuestionNumber(found.questions[0], 1));
        resetTest();
      }
    }
  }, [initialPassageId]);

  // Continuous timer countdown (active unless submitted)
  useEffect(() => {
    let interval: any = null;
    if (examSecondsLeft > 0 && !submitted) {
      interval = setInterval(() => {
        setExamSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (examSecondsLeft === 0 && !submitted) {
      setSubmitted(true);
      setShowReportModal(true);
    }
    return () => clearInterval(interval);
  }, [examSecondsLeft, submitted]);

  // Available books
  const availableBooks = useMemo(() => {
    const set = new Set<number>();
    CAMBRIDGE_READING_TESTS.forEach(p => {
      const info = parseReadingSource(p.cambridgeSource);
      set.add(info.book);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, []);

  // Passages in currently selected book
  const passagesInBook = useMemo(() => {
    return CAMBRIDGE_READING_TESTS.filter(p => {
      const info = parseReadingSource(p.cambridgeSource);
      return selectedBook === 'all' || info.book === selectedBook;
    });
  }, [selectedBook]);

  // Available tests in currently selected book
  const availableTestNums = useMemo(() => {
    const set = new Set<number | 'GT'>();
    passagesInBook.forEach(p => {
      const info = parseReadingSource(p.cambridgeSource);
      set.add(info.testNum);
    });
    return Array.from(set).sort((a, b) => {
      if (a === 'GT') return 1;
      if (b === 'GT') return -1;
      return (a as number) - (b as number);
    });
  }, [passagesInBook]);

  // Passages in selected test
  const passagesInTest = useMemo(() => {
    return passagesInBook.filter(p => {
      if (selectedTestNum === 'all') return true;
      const info = parseReadingSource(p.cambridgeSource);
      return info.testNum === selectedTestNum;
    });
  }, [passagesInBook, selectedTestNum]);

  const isMatchingQuestion = (q?: ReadingQuestion): boolean => {
    if (!q || !selectedPassage?.matchingContext) return false;
    const items = selectedPassage.matchingContext.options || (selectedPassage.matchingContext as any).items || [];
    if (items.length === 0 || !q.options) return false;
    const matchCodes = new Set(items.map((it: any) => String(it.code).toUpperCase()));
    return q.options.some(opt => {
      const match = opt.match(/^([A-Za-z0-9ivxlcdmIVXLCDM]+):/);
      return match && matchCodes.has(match[1].toUpperCase());
    });
  };

  const getGroupTitle = (group: ReadingQuestionGroup): string => {
    if (group.type === 'headings') return 'LIST OF HEADINGS';
    if (group.type === 'TFNG') {
      const isYesNo = group.questions[0]?.q.options?.includes('YES') || group.questions[0]?.q.correctAnswer === 'YES';
      return isYesNo ? 'YES / NO / NOT GIVEN' : 'TRUE / FALSE / NOT GIVEN';
    }
    if (group.type === 'summary') {
      if (selectedPassage?.tableContext) return 'TABLE COMPLETION';
      if (selectedPassage?.wordBank) return 'SUMMARY COMPLETION (WORD BANK)';
      return 'SUMMARY COMPLETION';
    }
    if (group.type === 'mcq') {
      if (group.questions[0]?.q && isMatchingQuestion(group.questions[0].q)) {
        return selectedPassage?.matchingContext?.title 
          ? selectedPassage.matchingContext.title.toUpperCase() 
          : 'MATCHING RESEARCHERS';
      }
      return 'MULTIPLE CHOICE';
    }
    return 'QUESTIONS';
  };

  function getGroupInstruction(type: string, sampleQ: ReadingQuestion, startNum?: number, endNum?: number): string {
    if (!selectedPassage) return 'Answer the questions based on the reading passage.';
    if (type === 'headings') {
      return 'Choose the correct heading for each section from the list of headings.';
    }
    if (type === 'TFNG') {
      const isYesNo = sampleQ.options?.includes('YES') || sampleQ.correctAnswer === 'YES' || sampleQ.correctAnswer === 'NO';
      if (isYesNo) {
        const pInfo = parseReadingSource(selectedPassage.cambridgeSource);
        const rangeStr = startNum && endNum ? `${startNum}-${endNum}` : 'below';
        return `Do the following statements agree with the views of the writer in Reading Passage ${pInfo.passageNum}? In boxes ${rangeStr} write\nYES if the statement agrees with the writer\nNO if the statement contradicts the writer\nNOT GIVEN if it is impossible to say what the writer thinks about this`;
      }
      return 'Do the following statements agree with the information given in the Reading Passage? Write TRUE, FALSE, or NOT GIVEN.';
    }
    if (type === 'summary') {
      if (selectedPassage.id === 'c1-t2-pass2' && startNum && startNum >= 20) {
        return 'Label the diagram below. Choose ONE OR TWO WORDS from the Reading Passage for each answer. Write your answers in boxes 20-23 on your answer sheet.';
      }
      if (selectedPassage.summaryContext?.instruction) {
        return selectedPassage.summaryContext.instruction;
      }
      if (selectedPassage.tableContext) {
        if (selectedPassage.id === 'c1-t1-pass3') {
          return 'Complete the table below using information from Reading Passage 3. Write NO MORE THAN THREE WORDS for each answer. Write your answers in boxes 29-35 on your answer sheet.';
        }
        const rangeStr = startNum && endNum ? `${startNum}-${endNum}` : 'below';
        return `Using the information in the passage, complete the table below. Write your answers in boxes ${rangeStr} on your answer sheet.`;
      }
      return 'Complete the summary, diagram, or flow chart below. Write NO MORE THAN THREE WORDS for each answer.';
    }
    if (type === 'mcq') {
      if (selectedPassage.id === 'c1-t1-pass2' && startNum === 26) {
        return 'The writer mentions a number of factors which lead him to doubt the value of the WZCS document. Which THREE of the following factors are mentioned? Write your answers (A-F) in boxes 26-28 on your answer sheet.';
      }
      if (selectedPassage.id === 'c1-t2-pass3' && startNum && startNum >= 38) {
        return 'Choose one phrase (A-H) from the list of phrases to complete each key point below. Write the appropriate letters (A-H) in boxes 38-41 on your answer sheet.';
      }
      if (isMatchingQuestion(sampleQ) && selectedPassage.matchingContext?.instruction) {
        return selectedPassage.matchingContext.instruction;
      }
      if (sampleQ.correctAnswer.includes('//') && sampleQ.correctAnswer.split('//').every(p => p.trim().length <= 2)) {
        return 'Which of the following factors are mentioned? Choose the correct letters.';
      }
      if (sampleQ.options && sampleQ.options.length === 4) {
        const rangeStr = startNum && endNum ? `${startNum}-${endNum}` : 'on your answer sheet';
        return `Choose the appropriate letters A-D and write them in boxes ${rangeStr} on your answer sheet.`;
      }
      if (sampleQ.options && sampleQ.options.length > 4) {
        return 'Choose the appropriate letter corresponding to each description.';
      }
      return 'Choose the appropriate letters A-D and write them on your answer sheet.';
    }
    return 'Answer the questions based on the reading passage.';
  }

  // Group questions dynamically by consecutive type with authentic numbers
  const questionGroups: ReadingQuestionGroup[] = useMemo(() => {
    if (!selectedPassage) return [];
    const questions = selectedPassage.questions || [];
    if (questions.length === 0) return [];

    const groups: ReadingQuestionGroup[] = [];
    let currentType = questions[0].type;
    const firstNum = getQuestionNumber(questions[0], 1);
    let currentList: { q: ReadingQuestion; index: number }[] = [{ q: questions[0], index: firstNum }];
    let startNum = firstNum;

    for (let i = 1; i < questions.length; i++) {
      const q = questions[i];
      const num = getQuestionNumber(q, i + 1);
      const forceSplit =
        (selectedPassage.id === 'c1-t2-pass2' && num === 20) ||
        (selectedPassage.id === 'c1-t1-pass2' && num === 26);
      if (q.type === currentType && !forceSplit) {
        currentList.push({ q, index: num });
      } else {
        const lastNum = currentList[currentList.length - 1].index;
        groups.push({
          id: `group-${groups.length}`,
          type: currentType,
          startNum,
          endNum: lastNum,
          instruction: getGroupInstruction(currentType, currentList[0].q, startNum, lastNum),
          questions: currentList,
        });
        currentType = q.type;
        startNum = num;
        currentList = [{ q, index: num }];
      }
    }

    if (currentList.length > 0) {
      const lastNum = currentList[currentList.length - 1].index;
      groups.push({
        id: `group-${groups.length}`,
        type: currentType,
        startNum,
        endNum: lastNum,
        instruction: getGroupInstruction(currentType, currentList[0].q, startNum, lastNum),
        questions: currentList,
      });
    }

    return groups;
  }, [selectedPassage]);

  // Answer matching with tolerance for IELTS conventions
  const isAnswerCorrect = (userAns?: string, official?: string): boolean => {
    if (!userAns || !official) return false;
    const u = userAns.trim().toLowerCase().replace(/[£$,.?!]/g, '').replace(/\s+/g, ' ').replace(/[–—]/g, '-');
    const parts = official.split(/\/\/|\sor\s|\//).map(p => 
      p.trim().toLowerCase().replace(/[()£$,.?!]/g, '').replace(/\s+/g, ' ').replace(/[–—]/g, '-')
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

  // Total questions across all passages in the current test (e.g. 40 or 41 questions across Passages 1, 2, 3)
  const allTestQuestions = useMemo(() => {
    return passagesInTest.flatMap(p => p.questions);
  }, [passagesInTest]);

  /**
   * Comprehensive IELTS correctness checker that additionally handles multi-factor choice sets
   * (e.g. Q26-28 where factors A, D, E are valid in any order without duplicate counting).
   */
  const isQuestionCorrect = (q: ReadingQuestion, allAnswers: Record<string, string>): boolean => {
    if (!selectedPassage) return false;
    const userAns = (allAnswers[q.id] || '').trim().toUpperCase();
    if (!userAns) return false;

    // Check if this is a multi-select set where options are letters separated by //, e.g. "A // D // E"
    const isMultiSet = q.correctAnswer.includes('//') && q.correctAnswer.split('//').every(p => p.trim().length <= 2);
    if (isMultiSet) {
      const validOptions = q.correctAnswer.split('//').map(p => p.trim().toUpperCase());
      if (!validOptions.includes(userAns)) return false;

      // Find sibling questions in the test with the exact same multi-select options
      const pool = allTestQuestions.length > 0 ? allTestQuestions : selectedPassage.questions;
      const siblingQuestions = pool.filter(sibling => 
        sibling.correctAnswer.includes('//') && 
        sibling.correctAnswer.split('//').map(p => p.trim().toUpperCase()).sort().join('_') === validOptions.sort().join('_')
      );

      // If user provided this answer for an earlier sibling question, this one is duplicate
      const mySiblingIndex = siblingQuestions.findIndex(s => s.id === q.id);
      for (let i = 0; i < mySiblingIndex; i++) {
        const prevAns = (allAnswers[siblingQuestions[i].id] || '').trim().toUpperCase();
        if (prevAns === userAns) return false;
      }
      return true;
    }

    return isAnswerCorrect(userAns, q.correctAnswer);
  };

  const getExpectedAnswerLabel = (q: ReadingQuestion): string => {
    if (q.id === 'c1-t1-p2-q26') return 'A';
    if (q.id === 'c1-t1-p2-q27') return 'D';
    if (q.id === 'c1-t1-p2-q28') return 'E';
    return q.correctAnswer.split('//')[0].trim();
  };

  const toggleExplanation = (q: ReadingQuestion, passageId?: string) => {
    const wasInListView = resultsViewMode === 'list';
    const isCurrentlyExpanded = Boolean(expandedExplanations[q.id]);
    const willExpand = wasInListView ? true : !isCurrentlyExpanded;

    if (passageId) {
      setActiveResultsPassageId(passageId);
    }
    if (wasInListView) {
      setResultsViewMode('split');
    }

    setExpandedExplanations(prev => ({ ...prev, [q.id]: willExpand }));

    if (willExpand) {
      setFocusedResultsQuestionId(q.id);
      setTimeout(() => {
        if (wasInListView) {
          const qCardEl = document.getElementById(`results-q-card-${q.id}`);
          if (qCardEl) {
            qCardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        const container = resultsPassageScrollRef.current;
        const markEl = document.getElementById(`evidence-mark-${q.id}`);
        if (container && markEl) {
          const containerRect = container.getBoundingClientRect();
          const markRect = markEl.getBoundingClientRect();
          const targetTop =
            container.scrollTop +
            (markRect.top - containerRect.top) -
            container.clientHeight / 2 +
            markRect.height / 2;
          container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
        }
      }, 90);
    } else if (focusedResultsQuestionId === q.id) {
      setFocusedResultsQuestionId(null);
    }
  };

  // Render Question Prompt with Red/Green Underline Blank for Summary/Flow-chart items (Matches Screenshot 3)
  const renderResultQuestionPrompt = (
    passage: ReadingPassage,
    q: ReadingQuestion,
    qNum: number,
    isCorr: boolean
  ) => {
    if (passage.summaryContext?.fullText) {
      const lines = passage.summaryContext.fullText.split('\n');
      const matchingLine = lines.find(l => l.includes(`(${qNum})`));
      if (matchingLine) {
        const tokens = matchingLine.split(/(\(\d+\)\s*\.+)/g);
        return (
          <span className="text-[12.5px] font-semibold text-slate-900 leading-[1.6]">
            {tokens.map((tok, tIdx) => {
              const m = tok.match(/^\((\d+)\)\s*\.+$/);
              if (m) {
                const tokNum = parseInt(m[1], 10);
                if (tokNum === qNum) {
                  return (
                    <span
                      key={tIdx}
                      className="inline-flex flex-col w-11 mx-1 align-middle translate-y-[2px]"
                    >
                      <span
                        className={`block border-b-[1.5px] ${
                          isCorr ? 'border-emerald-600' : 'border-[#dc2626]'
                        }`}
                      />
                      <span
                        className={`block border-b border-dashed mt-[3px] ${
                          isCorr ? 'border-emerald-300' : 'border-rose-300'
                        }`}
                      />
                    </span>
                  );
                }
                return (
                  <span key={tIdx} className="text-slate-400 font-normal mx-0.5">
                    ___
                  </span>
                );
              }
              return <React.Fragment key={tIdx}>{tok}</React.Fragment>;
            })}
          </span>
        );
      }
    }
    return (
      <span className="text-[12.5px] font-semibold text-slate-900 leading-[1.55]">
        {cleanQuestionText(q.question)}
      </span>
    );
  };

  // Render Passage Paragraph with Green Evidence Sentence Highlighting + Dark [qNum] Badges (Matches Screenshot 3)
  const renderPassageParagraphWithEvidence = (
    passage: ReadingPassage,
    pLabel: string,
    pText: string
  ) => {
    const activeQuestions = passage.questions
      .map((q, idx) => ({ q, qNum: getQuestionNumber(q, idx + 1) }))
      .filter(({ q }) => Boolean(expandedExplanations[q.id]) || focusedResultsQuestionId === q.id);

    if (activeQuestions.length === 0) {
      return pText;
    }

    interface MatchedRange {
      start: number;
      end: number;
      qIds: string[];
      qNums: number[];
    }

    const ranges: MatchedRange[] = [];
    const lowerText = pText.toLowerCase();

    activeQuestions.forEach(({ q, qNum }) => {
      const rawEv = (q.evidence || '').trim();
      const snippets = rawEv
        .split(/\.{3}|…/)
        .map(s => s.replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim())
        .filter(s => s.length >= 10)
        .sort((a, b) => b.length - a.length);

      let foundStart = -1;
      let foundEnd = -1;

      for (const snip of snippets) {
        const idx = lowerText.indexOf(snip.toLowerCase());
        if (idx !== -1) {
          foundStart = idx;
          foundEnd = idx + snip.length;
          break;
        }
      }

      if (foundStart === -1 && q.paragraphReference === pLabel) {
        const anyLiteralInPassage = passage.paragraphs.some(para =>
          snippets.some(s => para.text.toLowerCase().includes(s.toLowerCase()))
        );
        if (!anyLiteralInPassage) {
          const dotIdx = pText.indexOf('. ');
          foundStart = 0;
          foundEnd = dotIdx !== -1 ? dotIdx + 1 : pText.length;
        }
      }

      if (foundStart !== -1 && foundEnd > foundStart) {
        const existing = ranges.find(
          r => Math.max(r.start, foundStart) < Math.min(r.end, foundEnd)
        );
        if (existing) {
          existing.start = Math.min(existing.start, foundStart);
          existing.end = Math.max(existing.end, foundEnd);
          if (!existing.qIds.includes(q.id)) existing.qIds.push(q.id);
          if (!existing.qNums.includes(qNum)) existing.qNums.push(qNum);
        } else {
          ranges.push({
            start: foundStart,
            end: foundEnd,
            qIds: [q.id],
            qNums: [qNum],
          });
        }
      }
    });

    if (ranges.length === 0) return pText;

    ranges.sort((a, b) => a.start - b.start);

    const nodes: React.ReactNode[] = [];
    let cursor = 0;

    ranges.forEach((r, idx) => {
      if (r.start > cursor) {
        nodes.push(<React.Fragment key={`txt-${idx}`}>{pText.slice(cursor, r.start)}</React.Fragment>);
      }
      nodes.push(
        <mark
          key={`mk-${idx}`}
          id={`evidence-mark-${r.qIds[0]}`}
          className="bg-[#d1fae5] text-slate-900 px-1 py-0.5 rounded-xs transition-all"
        >
          {r.qIds.slice(1).map(extraId => (
            <span key={extraId} id={`evidence-mark-${extraId}`} className="sr-only" />
          ))}
          {pText.slice(r.start, r.end)}
          {r.qNums.map(num => (
            <span
              key={num}
              className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-[4px] bg-[#1e293b] text-white text-[10.5px] font-bold ml-1 align-middle select-none"
            >
              {num}
            </span>
          ))}
        </mark>
      );
      cursor = r.end;
    });

    if (cursor < pText.length) {
      nodes.push(<React.Fragment key="txt-end">{pText.slice(cursor)}</React.Fragment>);
    }

    return nodes;
  };

  const handleSelectAnswer = (qId: string, answer: string) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const totalQuestions = selectedPassage?.questions?.length || 0;
  const answeredCount = useMemo(() => {
    if (!selectedPassage) return 0;
    return selectedPassage.questions.filter(q => Boolean(userAnswers[q.id]?.trim())).length;
  }, [selectedPassage, userAnswers]);
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const totalTestQuestions = allTestQuestions.length || totalQuestions;
  const totalTestAnswered = useMemo(() => {
    return allTestQuestions.filter(q => Boolean(userAnswers[q.id]?.trim())).length;
  }, [allTestQuestions, userAnswers]);

  const score = useMemo(() => {
    if (!selectedPassage) return 0;
    let count = 0;
    allTestQuestions.forEach(q => {
      if (isQuestionCorrect(q, userAnswers)) {
        count++;
      }
    });
    return count;
  }, [userAnswers, allTestQuestions, selectedPassage]);

  // IELTS Academic Reading Band Formula (Scaled accurately to total test questions)
  const bandScore = useMemo(() => {
    if (totalTestQuestions === 0) return 0.0;
    if (score === 0) return 0.0;
    const ratio = score / totalTestQuestions;
    if (ratio >= 0.93) return 9.0;
    if (ratio >= 0.85) return 8.5;
    if (ratio >= 0.77) return 8.0;
    if (ratio >= 0.69) return 7.5;
    if (ratio >= 0.60) return 7.0;
    if (ratio >= 0.52) return 6.5;
    if (ratio >= 0.44) return 6.0;
    if (ratio >= 0.35) return 5.5;
    if (ratio >= 0.25) return 5.0;
    return 4.5;
  }, [score, totalTestQuestions]);

  const resetTest = () => {
    setUserAnswers({});
    setFlaggedQuestions({});
    setSubmitted(false);
    setShowReportModal(false);
    setExpandedExplanations({});
    setFocusedResultsQuestionId(null);
    setExamSecondsLeft(60 * 60);
    setFocusedQuestionIndex(firstQuestionNum);
    setHighlightedPara(null);
  };

  const switchPassage = (target: ReadingPassage) => {
    const currentInfo = selectedPassage ? parseReadingSource(selectedPassage.cambridgeSource) : null;
    const nextInfo = parseReadingSource(target.cambridgeSource);
    const isSameTest =
      currentInfo &&
      currentInfo.book === nextInfo.book &&
      currentInfo.testNum === nextInfo.testNum;

    setSelectedPassage(target);
    setSelectedBook(nextInfo.book);
    setSelectedTestNum(nextInfo.testNum);
    const firstNum = getQuestionNumber(target.questions[0], 1);
    setFocusedQuestionIndex(firstNum);
    setHighlightedPara(null);

    if (!isSameTest) {
      setUserAnswers({});
      setFlaggedQuestions({});
      setSubmitted(false);
      setShowReportModal(false);
      setExamSecondsLeft(60 * 60);
    }
  };

  const handleJumpToParagraph = (label: string) => {
    const cleanId = `para-${label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
    const el = document.getElementById(cleanId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedPara(label);
      setTimeout(() => setHighlightedPara(null), 2500);
    }
  };

  const handleFocusQuestion = (num: number) => {
    setFocusedQuestionIndex(num);
    if (!selectedPassage) return;
    const qInCurrent = selectedPassage.questions.find((item, idx) => getQuestionNumber(item, idx + 1) === num);
    if (qInCurrent) {
      const qEl = document.getElementById(`reading-q-${qInCurrent.id}`);
      if (qEl) {
        qEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (qInCurrent.paragraphReference) {
        handleJumpToParagraph(qInCurrent.paragraphReference);
      }
      return;
    }

    // If the question is in another passage of the same test, switch to that passage and focus it
    for (const p of passagesInTest) {
      const foundQ = p.questions.find((item, idx) => getQuestionNumber(item, idx + 1) === num);
      if (foundQ) {
        setSelectedPassage(p);
        setFocusedQuestionIndex(num);
        setTimeout(() => {
          const qEl = document.getElementById(`reading-q-${foundQ.id}`);
          if (qEl) qEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 60);
        break;
      }
    }
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Render Matching Context (Grey bullet list box matching IELTS Free Practice)
  const renderMatchingContext = (customItems?: Array<{ code: string; text: string }>) => {
    if (!selectedPassage) return null;
    const ctx = selectedPassage.matchingContext;
    const items = customItems || ctx?.options || (ctx as any)?.items || [];
    if (items.length === 0) return null;
    return (
      <div className="bg-[#f8f9fa] border border-slate-200/70 rounded-lg p-4 mb-4">
        <ul className="space-y-2 text-[13.5px] text-slate-800 list-disc pl-5">
          {items.map((opt: any) => (
            <li key={opt.code} className="leading-snug">
              <strong className="font-bold text-slate-900">{opt.code}</strong> — {opt.text}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Render Inline Flow-Chart / Summary Completion for c1-t1-pass1 (Q1–8) & c1-t2-pass2 (Q13–19)
  const renderInlineFlowChart = () => {
    if (!selectedPassage || (selectedPassage.id !== 'c1-t2-pass2' && selectedPassage.id !== 'c1-t1-pass1')) {
      return null;
    }

    const isTest1FireSummary = selectedPassage.id === 'c1-t1-pass1';
    const minQ = isTest1FireSummary ? 1 : 13;
    const maxQ = isTest1FireSummary ? 8 : 19;

    const renderBlank = (num: number) => {
      const q = selectedPassage.questions.find((item, idx) => getQuestionNumber(item, idx + 1) === num);
      if (!q) return null;
      const val = (userAnswers[q.id] || '').trim();
      const isCorr = submitted ? isQuestionCorrect(q, userAnswers) : false;

      return (
        <span
          id={`reading-q-${q.id}`}
          className="inline-flex items-center gap-1.5 mx-1 align-middle my-1"
        >
          <span className="w-6 h-6 rounded bg-[#1e293b] text-white font-bold text-xs inline-flex items-center justify-center shrink-0">
            {num}
          </span>
          <input
            type="text"
            disabled={submitted}
            value={val}
            onFocus={() => setFocusedQuestionIndex(num)}
            onChange={e => handleSelectAnswer(q.id, e.target.value)}
            className={`w-36 sm:w-40 px-2.5 py-1 text-[13px] rounded border transition-colors focus:outline-none ${
              submitted
                ? isCorr
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                  : 'border-rose-400 bg-rose-50 text-rose-900 font-bold'
                : focusedQuestionIndex === num
                ? 'border-blue-600 ring-2 ring-blue-500/20 bg-white text-slate-900'
                : 'border-slate-300 bg-white text-slate-900'
            }`}
          />
          {submitted && !isCorr && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              ✓ {q.correctAnswer}
            </span>
          )}
        </span>
      );
    };

    return (
      <div className="space-y-4 mb-6">
        {/* Word Bank Box (3-column grid for Test 1 Fire Summary, or pill wrap for Test 2) */}
        {selectedPassage.wordBank && (
          <div className="bg-[#f8f9fa] border border-slate-200/80 rounded-lg p-3.5 space-y-2.5">
            {isTest1FireSummary ? (
              <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-center">
                {selectedPassage.wordBank.map(w => (
                  <button
                    key={w}
                    type="button"
                    disabled={submitted}
                    onClick={() => {
                      const targetNum =
                        focusedQuestionIndex >= minQ && focusedQuestionIndex <= maxQ
                          ? focusedQuestionIndex
                          : minQ;
                      const activeQ = selectedPassage.questions.find(
                        (item, idx) => getQuestionNumber(item, idx + 1) === targetNum
                      );
                      if (activeQ) handleSelectAnswer(activeQ.id, w);
                    }}
                    className="py-1 px-2 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[13px] font-medium cursor-pointer transition-colors"
                  >
                    {w}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Word Box (click a word to fill Question{' '}
                    {focusedQuestionIndex >= minQ && focusedQuestionIndex <= maxQ
                      ? focusedQuestionIndex
                      : minQ}
                    , or type directly):
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPassage.wordBank.map(w => (
                    <button
                      key={w}
                      type="button"
                      disabled={submitted}
                      onClick={() => {
                        const targetNum =
                          focusedQuestionIndex >= minQ && focusedQuestionIndex <= maxQ
                            ? focusedQuestionIndex
                            : minQ;
                        const activeQ = selectedPassage.questions.find(
                          (item, idx) => getQuestionNumber(item, idx + 1) === targetNum
                        );
                        if (activeQ) handleSelectAnswer(activeQ.id, w);
                      }}
                      className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-medium cursor-pointer transition-colors"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Inline Summary / Flow-Chart Sentences */}
        {isTest1FireSummary ? (
          <div className="space-y-4 text-[14px] leading-[2.1] text-slate-800">
            <h4 className="font-bold text-slate-900 text-[14px] tracking-wide">
              EARLY FIRE-LIGHTING METHODS
            </h4>
            <p className="text-slate-700">Primitive societies saw fire as a heavenly gift.</p>
            <p>
              They tried to {renderBlank(1)} burning logs or charcoal {renderBlank(2)} that they
              could create fire themselves. It is suspected that the first man-made flames were
              produced by {renderBlank(3)} .
            </p>
            <p>
              The very first fire-lighting methods involved the creation of {renderBlank(4)} by, for
              example, rapidly {renderBlank(5)} a wooden stick in a round hole. The use of{' '}
              {renderBlank(6)} or persistent chipping was also widespread in Europe and among other
              peoples such as the Chinese and {renderBlank(7)} . European practice of this method
              continued until the 1850s {renderBlank(8)} the discovery of phosphorus some years
              earlier.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-[14px] leading-[2.1] text-slate-800">
            <p className="text-slate-700">
              Example: In February, Californian farmers hire bees to help pollinate almond trees.
            </p>

            <p>
              In March, beekeepers {renderBlank(13)} for migration at night when the hives are{' '}
              {renderBlank(14)} and the bees are generally tranquil. A little {renderBlank(15)} can
              ensure that this is the case.
            </p>

            <p>
              They transport their hives to orange groves where farmers {renderBlank(16)} beekeepers
              for placing them on their land. Here the bees make honey.
            </p>

            <p>
              After three weeks, the supers can be taken to a warehouse where {renderBlank(17)} are
              used to remove the wax and extract the honey from the {renderBlank(18)} .
            </p>

            <p>
              After the honey collection, the old hives are rejected. Good double hives are{' '}
              {renderBlank(19)} and re-queened and the beekeeper transports them to their summer
              base.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render Beehive Technical Line-Art Diagram + Inputs for Passage 2 (Questions 20–23, Screenshot 3 Bottom)
  const renderBeehiveDiagram = () => {
    if (!selectedPassage || selectedPassage.id !== 'c1-t2-pass2') return null;

    return (
      <div className="space-y-4 mb-6">
        <div className="bg-white border border-slate-200/80 rounded-lg p-4">
          <h4 className="text-center font-serif font-bold text-slate-900 text-sm tracking-wide uppercase mb-2">
            A BEEHIVE
          </h4>
          {/* Technical Line-Art SVG of the Beehive (Matches Screenshot 3) */}
          <svg
            viewBox="0 0 540 270"
            className="w-full max-w-lg mx-auto h-auto text-slate-900"
            fill="none"
          >
            {/* Upper Super Box (3D perspective) */}
            <polygon
              points="150,45 275,20 385,55 260,80"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="#ffffff"
            />
            <polygon
              points="150,45 260,80 260,125 150,90"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="#ffffff"
            />
            <polygon
              points="260,80 385,55 385,100 260,125"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="#ffffff"
            />
            {/* Vertical Comb Frames inside Super */}
            <line x1="168" y1="42" x2="275" y2="75" stroke="currentColor" strokeWidth="1.2" />
            <line x1="186" y1="38" x2="292" y2="71" stroke="currentColor" strokeWidth="1.2" />
            <line x1="204" y1="35" x2="310" y2="68" stroke="currentColor" strokeWidth="1.2" />
            <line x1="222" y1="31" x2="328" y2="64" stroke="currentColor" strokeWidth="1.2" />
            <line x1="240" y1="28" x2="346" y2="61" stroke="currentColor" strokeWidth="1.2" />
            <line x1="258" y1="24" x2="364" y2="57" stroke="currentColor" strokeWidth="1.2" />

            {/* Handle recess on right face of Super */}
            <rect x="315" y="75" width="26" height="8" rx="2" stroke="currentColor" strokeWidth="1.3" />

            {/* (21) Screen / Queen Excluder Grid between Supers and Brood Chamber */}
            <polygon
              points="145,112 260,145 388,118 273,87"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              fill="none"
            />
            {/* Callout (21) */}
            <text x="68" y="96" className="text-[12px] font-serif font-bold" fill="currentColor">
              (21)
            </text>
            <line x1="95" y1="92" x2="148" y2="110" stroke="currentColor" strokeWidth="1.2" />

            {/* Lower Deep Box: (22) Brood Chamber */}
            <polygon
              points="150,125 260,160 260,225 150,190"
              stroke="currentColor"
              strokeWidth="1.8"
              fill="#ffffff"
            />
            <polygon
              points="260,160 385,135 385,200 260,225"
              stroke="currentColor"
              strokeWidth="1.8"
              fill="#ffffff"
            />
            {/* Callout (22) */}
            <text x="68" y="175" className="text-[12px] font-serif font-bold" fill="currentColor">
              (22)
            </text>
            <line x1="95" y1="171" x2="150" y2="165" stroke="currentColor" strokeWidth="1.2" />

            {/* Base Board & (23) Narrow Entrance */}
            <polygon
              points="135,195 260,235 395,205 385,200 260,225 150,190"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="#f1f5f9"
            />
            <rect x="275" y="212" width="75" height="6" transform="rotate(-12 275 212)" fill="currentColor" />
            {/* Callout (23) */}
            <text x="395" y="242" className="text-[12px] font-serif font-bold" fill="currentColor">
              (23)
            </text>
            <line x1="390" y1="236" x2="325" y2="215" stroke="currentColor" strokeWidth="1.2" />

            {/* Zoom Circle for (20) Empty Comb Hexagons */}
            <circle cx="455" cy="95" r="36" stroke="currentColor" strokeWidth="1.6" fill="#ffffff" />
            {/* Honeycomb hexagons inside zoom circle */}
            <polygon points="445,78 455,73 465,78 465,89 455,94 445,89" stroke="currentColor" strokeWidth="1.2" />
            <polygon points="455,94 465,89 475,94 475,105 465,110 455,105" stroke="currentColor" strokeWidth="1.2" />
            <polygon points="435,94 445,89 455,94 455,105 445,110 435,105" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 305,65 Q 375,45 420,85" stroke="currentColor" strokeWidth="1.3" fill="none" />
            {/* Callout (20) */}
            <text x="442" y="152" className="text-[12px] font-serif font-bold" fill="currentColor">
              (20)
            </text>
            <line x1="455" y1="131" x2="455" y2="140" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>

        {/* Questions 20–23 Inputs */}
        <div className="space-y-3 pt-1">
          {[20, 21, 22, 23].map(num => {
            const q = selectedPassage.questions.find(
              (item, idx) => getQuestionNumber(item, idx + 1) === num
            );
            if (!q) return null;
            const val = (userAnswers[q.id] || '').trim();
            const isCorr = submitted ? isQuestionCorrect(q, userAnswers) : false;

            return (
              <div
                key={q.id}
                id={`reading-q-${q.id}`}
                onClick={() => setFocusedQuestionIndex(num)}
                className="flex items-center gap-3 flex-wrap"
              >
                <span className="w-6 h-6 rounded bg-[#1e293b] text-white font-bold text-xs inline-flex items-center justify-center shrink-0">
                  {num}
                </span>
                <span className="text-[13.5px] font-semibold text-slate-800 min-w-[220px]">
                  {cleanQuestionText(q.question)}
                </span>
                <input
                  type="text"
                  disabled={submitted}
                  value={val}
                  onFocus={() => setFocusedQuestionIndex(num)}
                  onChange={e => handleSelectAnswer(q.id, e.target.value)}
                  className={`w-48 px-3 py-1.5 text-[13px] rounded-md border transition-colors focus:outline-none ${
                    submitted
                      ? isCorr
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-rose-400 bg-rose-50 text-rose-900 font-bold'
                      : focusedQuestionIndex === num
                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-white text-slate-900'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
                {submitted && !isCorr && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ {q.correctAnswer.split('//')[0].trim()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render text with clickable yellow highlights (click a highlight to remove)
  const renderHighlightedText = (text: string) => {
    if (highlightedSnippets.length === 0) return text;
    let segments: Array<{ text: string; highlight?: string }> = [{ text }];
    highlightedSnippets.forEach(snippet => {
      if (!snippet) return;
      const nextSegments: Array<{ text: string; highlight?: string }> = [];
      segments.forEach(seg => {
        if (seg.highlight) {
          nextSegments.push(seg);
          return;
        }
        const parts = seg.text.split(snippet);
        parts.forEach((part, idx) => {
          if (part) nextSegments.push({ text: part });
          if (idx < parts.length - 1) {
            nextSegments.push({ text: snippet, highlight: snippet });
          }
        });
      });
      segments = nextSegments;
    });
    return segments.map((seg, i) =>
      seg.highlight ? (
        <mark
          key={i}
          onClick={e => {
            e.stopPropagation();
            setHighlightedSnippets(prev => prev.filter(s => s !== seg.highlight));
          }}
          title="Click highlight to remove"
          className="bg-amber-200/90 hover:bg-rose-200 text-slate-900 px-0.5 rounded cursor-pointer transition-colors"
        >
          {seg.text}
        </mark>
      ) : (
        <React.Fragment key={i}>{seg.text}</React.Fragment>
      )
    );
  };

  // Helper renderer for a single question item (Matches IELTS Free Practice Screenshots 1–4)
  const renderQuestionCard = (q: ReadingQuestion, index: number) => {
    const userAns = (userAnswers[q.id] || '').trim();
    const isCorrect = isQuestionCorrect(q, userAnswers);
    const isHeading = q.type === 'headings';
    const isDropdownMatching = isHeading || isMatchingQuestion(q);
    const isMcq = q.type === 'mcq' || (q.options && q.options.length > 0 && q.type !== 'TFNG');

    const tfngOptions = q.type === 'TFNG'
      ? (q.options && q.options.length === 3 ? q.options : (q.correctAnswer === 'YES' || q.correctAnswer === 'NO' ? ['YES', 'NO', 'NOT GIVEN'] : ['TRUE', 'FALSE', 'NOT GIVEN']))
      : [];

    return (
      <div
        key={q.id}
        id={`reading-q-${q.id}`}
        onClick={() => setFocusedQuestionIndex(index)}
        className="py-2 transition-all"
      >
        {/* CASE 1: Dropdown Select (Headings Q28–32, Matching Researchers Q1–7, Matching Phrases Q38–41) */}
        {isDropdownMatching && q.options && q.options.length > 0 ? (
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-6 h-6 rounded bg-[#1e293b] text-white font-bold text-xs inline-flex items-center justify-center shrink-0">
              {index}
            </span>
            <span className="font-bold text-slate-900 text-[13.5px]">
              {cleanQuestionText(q.question)}
            </span>
            <select
              disabled={submitted}
              value={userAns}
              onFocus={() => setFocusedQuestionIndex(index)}
              onChange={e => handleSelectAnswer(q.id, e.target.value)}
              className={`px-3 py-1.5 rounded-md border text-[13px] bg-white min-w-[230px] max-w-full cursor-pointer focus:outline-none ${
                submitted
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-rose-400 bg-rose-50 text-rose-900 font-bold'
                  : 'border-slate-300 text-slate-800 focus:border-blue-600'
              }`}
            >
              <option value="">—</option>
              {q.options.map((optRaw, optIdx) => {
                const match = optRaw.match(/^([A-Za-z0-9ivxlcdmIVXLCDM]+)[:.]\s*(.*)$/);
                const optionCode = match ? match[1] : String.fromCharCode(65 + optIdx);
                const cleanText = match ? match[2] : optRaw;
                return (
                  <option key={optIdx} value={optionCode}>
                    {optionCode} — {cleanText}
                  </option>
                );
              })}
            </select>
          </div>
        ) : q.type === 'TFNG' ? (
          /* CASE 2: YES / NO / NOT GIVEN or TRUE / FALSE / NOT GIVEN Radio Buttons (Screenshot 2) */
          <div className="space-y-2">
            <div className="flex items-baseline gap-2.5">
              <span className="w-6 h-6 rounded bg-[#1e293b] text-white font-bold text-xs inline-flex items-center justify-center shrink-0">
                {index}
              </span>
              <span className="font-bold text-slate-900 text-[13.5px] leading-snug">
                {cleanQuestionText(q.question)}
              </span>
            </div>
            <div className="space-y-1.5 pl-1 pt-0.5">
              {tfngOptions.map(opt => {
                const isSelected = userAns.toUpperCase() === opt.toUpperCase();
                return (
                  <label
                    key={opt}
                    className="flex items-center gap-2.5 cursor-pointer text-[13px] text-slate-800 py-0.5 select-none"
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      disabled={submitted}
                      checked={isSelected}
                      onChange={() => handleSelectAnswer(q.id, opt)}
                      className="w-3.5 h-3.5 accent-slate-900 cursor-pointer"
                    />
                    <span>
                      <strong className="font-bold text-slate-900">{opt}</strong>{' '}
                      <span className="text-slate-600">{opt}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : isMcq && q.options && q.options.length > 0 ? (
          /* CASE 3: Multiple Choice A–D Radio Buttons (Screenshot 4) */
          <div className="space-y-2">
            <div className="flex items-baseline gap-2.5">
              <span className="w-6 h-6 rounded bg-[#1e293b] text-white font-bold text-xs inline-flex items-center justify-center shrink-0">
                {index}
              </span>
              <span className="font-bold text-slate-900 text-[13.5px] leading-snug">
                {cleanQuestionText(q.question)}
              </span>
            </div>
            <div className="space-y-1.5 pl-1 pt-0.5">
              {q.options.map((optRaw, optIdx) => {
                const match = optRaw.match(/^([A-Za-z0-9ivxlcdmIVXLCDM]+)[:.]\s*(.*)$/);
                const optionCode = match ? match[1] : String.fromCharCode(65 + optIdx);
                const cleanText = match ? match[2] : optRaw;
                const isSelected =
                  userAns.toUpperCase() === optionCode.toUpperCase() ||
                  userAns.toLowerCase() === cleanText.toLowerCase();

                return (
                  <label
                    key={optIdx}
                    className="flex items-center gap-2.5 cursor-pointer text-[13px] text-slate-800 py-0.5 select-none"
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      disabled={submitted}
                      checked={isSelected}
                      onChange={() => handleSelectAnswer(q.id, optionCode)}
                      className="w-3.5 h-3.5 accent-slate-900 cursor-pointer"
                    />
                    <span>
                      <strong className="font-bold text-slate-900 mr-1.5">{optionCode}</strong>
                      {cleanText}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          /* CASE 4: Inline Text Input for Short-Answer / Summary Questions */
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-6 h-6 rounded bg-[#1e293b] text-white font-bold text-xs inline-flex items-center justify-center shrink-0">
              {index}
            </span>
            <span className="font-bold text-slate-900 text-[13.5px]">
              {cleanQuestionText(q.question)}
            </span>
            <input
              type="text"
              disabled={submitted}
              value={userAns}
              onFocus={() => setFocusedQuestionIndex(index)}
              onChange={e => handleSelectAnswer(q.id, e.target.value)}
              className="w-48 px-3 py-1.5 text-[13px] border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 bg-white"
            />
          </div>
        )}

        {/* Post-Submission Inline Review Details */}
        {submitted && (
          <div className="mt-3 pt-3 border-t border-slate-200 text-xs space-y-2.5 animate-in fade-in">
            {/* Header & Status */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
              isCorrect 
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50/90 border-rose-200 text-rose-900'
            }`}>
              <div className="font-extrabold flex items-center gap-1.5 text-xs">
                {isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>Question {index} {isCorrect ? 'Correct' : 'Incorrect'}</span>
              </div>
              {q.paragraphReference && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJumpToParagraph(q.paragraphReference);
                  }}
                  className="text-[10.5px] font-mono font-bold bg-white/90 text-slate-700 hover:text-indigo-600 px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
                  title={`Jump to ${q.paragraphReference} in passage`}
                >
                  📍 {q.paragraphReference}
                </button>
              )}
            </div>

            {/* Statement and Selected vs Correct Answers */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                  Statement
                </span>
                <p className="text-slate-900 font-semibold text-xs leading-snug">
                  {cleanQuestionText(q.question)}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-sans text-[11px] w-28 shrink-0">• Your answer:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    !userAns 
                      ? 'bg-slate-100 text-slate-500 italic font-sans' 
                      : isCorrect 
                        ? 'bg-emerald-100 text-emerald-900' 
                        : 'bg-rose-100 text-rose-900'
                  }`}>
                    {userAns ? getOptionFullLabel(userAns, q.options) : '(Unanswered)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-sans text-[11px] w-28 shrink-0">• Correct answer:</span>
                  <span className="font-bold bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded text-[11px]">
                    {getOptionFullLabel(q.correctAnswer, q.options)}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Passage Evidence */}
            {q.evidence && (
              <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl space-y-1">
                <div className="text-[10.5px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Evidence ({q.paragraphReference || 'Reading Passage'}):</span>
                </div>
                <blockquote className="italic font-serif text-[11.5px] text-slate-800 pl-2.5 border-l-2 border-amber-400 leading-relaxed">
                  "{q.evidence}"
                </blockquote>
              </div>
            )}

            {/* Explanation & Breakdown */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Explanation:
                </span>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {q.explanation}
                </p>
              </div>

              {/* Specific Why Incorrect for User Choice */}
              {!isCorrect && userAns && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/90 text-rose-950 text-xs space-y-0.5">
                  <strong className="text-[10.5px] uppercase tracking-wide text-rose-800 block">
                    ⚠️ Why your choice ({userAns.toUpperCase()}) is wrong:
                  </strong>
                  <p className="text-[11.5px] text-rose-900 leading-snug">
                    {typeof q.whyWrong === 'object' && q.whyWrong
                      ? (q.whyWrong[userAns.toUpperCase()] || 
                         Object.entries(q.whyWrong).find(([k]) => userAns.toUpperCase().startsWith(k))?.[1] || 
                         'This choice is contradicted by or unsupported in the reading passage.')
                      : (typeof q.whyWrong === 'string' ? q.whyWrong : 'This choice is not supported by the passage evidence.')}
                  </p>
                </div>
              )}

              {/* Complete Distractor Breakdown if available */}
              {q.whyWrong && typeof q.whyWrong === 'object' && Object.keys(q.whyWrong).length > 0 && (
                <details className="text-[11px] text-slate-600 pt-1 group cursor-pointer">
                  <summary className="font-semibold text-indigo-600 hover:text-indigo-800 select-none">
                    View why other options are incorrect ▾
                  </summary>
                  <div className="mt-1.5 space-y-1.5 pl-2.5 border-l-2 border-indigo-200 text-[11px]">
                    {Object.entries(q.whyWrong).map(([optKey, reason]) => (
                      <p key={optKey} className="text-slate-600">
                        <strong className="text-slate-800 font-mono">Option {optKey}:</strong> {reason}
                      </p>
                    ))}
                  </div>
                </details>
              )}

              {/* Sinhala Explanation */}
              {showSinhala && q.explanationSi && (
                <div className="pt-2 border-t border-slate-200 text-slate-800 font-sinhala text-[11px] leading-relaxed">
                  💡 {q.explanationSi}
                </div>
              )}
            </div>

            {/* Academic Collocation & Lexical Resource */}
            {q.vocabularyFocus && (
              <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-center justify-between flex-wrap gap-1">
                <div>
                  <span className="font-bold text-indigo-950">Academic Collocation: </span>
                  <span className="font-semibold">{q.vocabularyFocus.term}</span> ➜ {q.vocabularyFocus.academicCollocation}
                </div>
                <span className="text-[10px] text-indigo-600 font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                  IELTS Band 8+ Resource
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const parsedCurrentPassage = useMemo(() => {
    if (!selectedPassage) {
      return { book: 1, isGT: false, testNum: 1 as const, passageNum: 1, testLabel: 'Test 1', passageLabel: 'Passage 1' };
    }
    return parseReadingSource(selectedPassage.cambridgeSource);
  }, [selectedPassage]);

  if (CAMBRIDGE_READING_TESTS.length === 0 || !selectedPassage) {
    return (
      <div 
        ref={containerRef}
        className="h-[calc(100vh-3.5rem)] bg-slate-100/70 flex flex-col items-center justify-center p-6 text-center font-sans animate-in fade-in"
      >
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4 text-slate-400">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">No Reading Tests Available</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
          All existing reading test data has been removed. When new reading tests are added, they will appear here automatically.
        </p>
        {onBackToHub && (
          <button
            type="button"
            onClick={onBackToHub}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Cambridge Hub</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 h-screen w-screen bg-white flex flex-col overflow-hidden font-sans select-none animate-in fade-in"
    >
      {/* 1. TOP DOCKED CONTROL BAR (Exact IELTS Free Practice Header) */}
      <div className="bg-white text-slate-900 px-4 py-2 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 z-30">
        {/* Left: Red Bar-Chart Icon + Reading Test Title + Cambridge IELTS Subtitle */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBackToHub}
            className="w-7 h-7 rounded-md bg-[#dc2626] hover:bg-[#b91c1c] flex items-end justify-center gap-0.5 pb-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Return to Cambridge IELTS 21–1"
          >
            <span className="w-1 h-2 bg-white rounded-xs" />
            <span className="w-1 h-3 bg-white rounded-xs" />
            <span className="w-1 h-4 bg-white rounded-xs" />
          </button>

          <div className="min-w-0 leading-tight">
            <div className="font-bold text-slate-900 text-[13.5px]">
              {parsedCurrentPassage.isGT
                ? 'General Training Reading'
                : `Reading Test ${parsedCurrentPassage.testNum}`}
            </div>
            <div className="text-[11px] text-slate-400">
              Cambridge IELTS {parsedCurrentPassage.book} ·{' '}
              {testMode === 'exam' ? 'Exam mode' : 'Practice mode'}
            </div>
          </div>
        </div>

        {/* Right: ✓ saved + Timer Pill + Hide time + 📝 Notes + ⚙ Settings + Submit */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11.5px] font-medium text-emerald-600 hidden sm:inline mr-1">
            ✓ saved
          </span>

          {!hideTime && (
            <div className="border border-slate-200 rounded-md px-2.5 py-1 bg-white flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              <span
                className={`font-bold text-[13px] ${
                  examSecondsLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-900'
                }`}
              >
                {formatTimer(examSecondsLeft)}
              </span>
              <span className="text-[11px] text-slate-400">left</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setHideTime(prev => !prev)}
            className="border border-slate-200 rounded-md px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {hideTime ? 'Show time' : 'Hide time'}
          </button>

          {/* 📝 Notes Button */}
          <button
            type="button"
            onClick={() => setShowNotesModal(prev => !prev)}
            className={`border rounded-md px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showNotesModal
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span aria-hidden="true">📝</span>
            <span className="hidden sm:inline">Notes</span>
          </button>

          {/* ⚙ Settings Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettingsModal(prev => !prev)}
              className={`border rounded-md px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showSettingsModal
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span aria-hidden="true">⚙</span>
              <span className="hidden sm:inline">Settings</span>
            </button>

            {showSettingsModal && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-4 space-y-3 z-50 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900">Reading Settings</span>
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 block">Text Size</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['sm', 'base', 'lg'] as const).map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setFontSize(sz)}
                        className={`py-1.5 rounded-lg border font-bold uppercase cursor-pointer ${
                          fontSize === sz
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sz === 'sm' ? 'Small' : sz === 'base' ? 'Medium' : 'Large'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetTest();
                      setShowSettingsModal(false);
                    }}
                    className="w-full py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Answers</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          {!submitted ? (
            <button
              type="button"
              onClick={() => {
                setSubmitted(true);
                setShowReportModal(true);
                setActiveResultsPassageId(passagesInTest[0]?.id || selectedPassage.id);
              }}
              className="px-4 py-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs rounded-md shadow-2xs transition-all cursor-pointer"
            >
              Submit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-200" />
              <span>
                ✓ {score}/{totalTestQuestions} · Band {bandScore.toFixed(1)}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Slide-Down Notes Panel when 📝 Notes is open */}
      {showNotesModal && (
        <div className="bg-amber-50/95 border-b border-amber-200 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 z-20">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>📝 Scratchpad &amp; Passage Notes</span>
              </span>
              <button
                type="button"
                onClick={() => setShowNotesModal(false)}
                className="text-xs text-amber-800 hover:text-amber-950 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
            <textarea
              rows={2}
              value={passageNotes}
              onChange={e => setPassageNotes(e.target.value)}
              placeholder="Write your reading notes, keywords, or paragraph summaries here..."
              className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
      )}

      {/* 2. MAIN 50/50 SPLIT WORKSPACE (Clean full-height white split matching Screenshots 1–4) */}
      <div className="flex-1 min-h-0 bg-white grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 overflow-hidden">
        {/* LEFT PANE: READING PASSAGE */}
        <div
          ref={passageScrollRef}
          onMouseUp={() => {
            const sel = window.getSelection()?.toString().trim();
            if (sel && sel.length >= 3 && sel.length <= 140) {
              setHighlightedSnippets(prev => (prev.includes(sel) ? prev : [...prev, sel]));
            }
          }}
          className={`h-full overflow-y-auto px-5 sm:px-6 py-4 select-text text-slate-800 font-sans ${
            fontSize === 'sm'
              ? 'text-xs leading-relaxed'
              : fontSize === 'lg'
              ? 'text-base leading-relaxed'
              : 'text-[14px] leading-[1.68]'
          }`}
        >
          {/* Sub-line at top of left pane */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 mb-3 select-none">
            <span>
              Select text to <strong className="text-slate-600">highlight</strong> or add a{' '}
              <strong className="text-slate-600">note</strong> · click a highlight to remove, a note to edit
            </span>
            {highlightedSnippets.length > 0 && (
              <button
                type="button"
                onClick={() => setHighlightedSnippets([])}
                className="text-[11px] text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-full font-semibold cursor-pointer"
              >
                Clear ({highlightedSnippets.length})
              </button>
            )}
          </div>

          {/* Italic time instruction */}
          <p className="italic text-slate-800 text-[13.5px] mb-3">
            You should spend about 20 minutes on Questions {questionGroups[0]?.startNum || 1}-
            {questionGroups[questionGroups.length - 1]?.endNum || totalQuestions} which are based on
            Reading {parsedCurrentPassage.passageLabel} below.
          </p>

          {/* Passage Title (splits on — if present, e.g., MIGRATORY BEEKEEPING / Taking Wing) */}
          {selectedPassage.title.includes('—') ? (
            <div className="mb-3 space-y-2">
              <h2 className="font-bold text-slate-900 text-[15px]">
                {selectedPassage.title.split('—')[0].trim()}
              </h2>
              <h3 className="font-bold text-slate-900 text-[14.5px]">
                {selectedPassage.title.split('—')[1].trim()}
              </h3>
            </div>
          ) : (
            <h2 className="font-bold text-slate-900 text-[15px] mb-3">{selectedPassage.title}</h2>
          )}

          {/* Passage Paragraphs (Clean natural paragraphs matching Screenshots 1–4) */}
          <div className="space-y-4">
            {selectedPassage.paragraphs.map(p => {
              const isHighlight = highlightedPara === p.label;
              const textContent = p.text;

              // Map Paragraph A, B, C, E, F in Tourism (c1-t2-pass3) to their inline heading prompt
              const headingQuestionMap: Record<string, number> =
                selectedPassage.id === 'c1-t2-pass3'
                  ? {
                      'Paragraph A': 28,
                      'Paragraph B': 29,
                      'Paragraph C': 30,
                      'Paragraph E': 31,
                      'Paragraph F': 32,
                    }
                  : {};
              const linkedHeadingQNum = headingQuestionMap[p.label];

              // Check if paragraph label is "Paragraph A".."Paragraph F" to prefix bold letter A..F
              const letterMatch = p.label.match(/^Paragraph\s+([A-Z])$/);
              const sectionLetter = letterMatch ? letterMatch[1] : null;

              return (
                <div
                  key={p.label}
                  id={`para-${p.label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                  className={isHighlight ? 'bg-amber-50/70 rounded px-1 -mx-1 transition-colors' : ''}
                >
                  {linkedHeadingQNum && (
                    <p
                      onClick={() => handleFocusQuestion(linkedHeadingQNum)}
                      className="italic text-slate-800 text-[13.5px] mb-2 cursor-pointer hover:text-blue-700"
                    >
                      [Question {linkedHeadingQNum} — choose the best heading for this section]
                    </p>
                  )}

                  <p className="whitespace-pre-line">
                    {sectionLetter && (
                      <strong className="font-bold text-slate-900 mr-1.5">{sectionLetter}</strong>
                    )}
                    {renderHighlightedText(textContent)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: QUESTIONS */}
        <div className="h-full overflow-y-auto px-5 sm:px-6 py-4 space-y-6 text-slate-800">
          {questionGroups.map(group => {
            const isFlowChartGroup =
              (selectedPassage.id === 'c1-t2-pass2' && group.startNum === 13) ||
              (selectedPassage.id === 'c1-t1-pass1' && group.startNum === 1);
            const isBeehiveDiagramGroup =
              selectedPassage.id === 'c1-t2-pass2' && group.startNum === 20;
            const isTableCompletionGroup =
              Boolean(selectedPassage.tableContext) &&
              group.type === 'summary' &&
              (selectedPassage.id === 'c1-t2-pass1' || selectedPassage.id === 'c1-t1-pass3');
            const isMultiSelectFactorsGroup =
              selectedPassage.id === 'c1-t1-pass2' && group.startNum === 26;
            const isPhraseMatchingGroup =
              selectedPassage.id === 'c1-t2-pass3' && group.startNum === 38;

            const phraseItems = isPhraseMatchingGroup
              ? [
                  { code: 'A', text: 'local people and their environment.' },
                  { code: 'B', text: 'the expectations of tourists.' },
                  { code: 'C', text: 'the phenomena of holidaymaking.' },
                  { code: 'D', text: 'the distinction we make between work and leisure.' },
                  { code: 'E', text: 'the individual character of travel.' },
                  { code: 'F', text: 'places seen in everyday life.' },
                  { code: 'G', text: 'photographs which recapture our holidays.' },
                  { code: 'H', text: 'sights designed specially for tourists.' },
                ]
              : undefined;

            return (
              <div key={group.id} className="space-y-3.5">
                {/* Red-Left-Bordered Instruction Callout (Matches Screenshots 1–4) */}
                <div className="border-l-[3px] border-l-[#dc2626] bg-[#f8f9fa] px-3.5 py-2.5 rounded-r-md text-[13px] text-slate-700 whitespace-pre-line leading-relaxed">
                  {group.instruction}
                </div>

                {/* Grey Bullet Reference Box for Headings (Q28–32), Researchers (Q1–7), Matches (Q9–15), or Phrases (Q38–41) */}
                {group.type === 'headings' && renderMatchingContext()}
                {group.type === 'mcq' &&
                  isMatchingQuestion(group.questions[0]?.q) &&
                  !selectedPassage.matchingContext?.title?.toLowerCase().includes('heading') &&
                  renderMatchingContext()}
                {isPhraseMatchingGroup && renderMatchingContext(phraseItems)}

                {/* 1. Inline Flow-Chart / Summary Completion (Q1–8 in Test 1 P1 or Q13–19 in Test 2 P2) */}
                {isFlowChartGroup ? (
                  renderInlineFlowChart()
                ) : isBeehiveDiagramGroup ? (
                  /* 2. Technical Line-Art Beehive Diagram + Inputs (Q20–23 in Test 2 P2) */
                  renderBeehiveDiagram()
                ) : isTableCompletionGroup && selectedPassage.tableContext ? (
                  /* 3. Table Completion with Embedded [num] [input] (Test 2 P1 Q8–10 & Test 1 P3 Q29–35) */
                  <div className="rounded-lg border border-slate-200 overflow-hidden bg-white text-[13px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f8f9fa] text-slate-800 font-bold border-b border-slate-200">
                          {selectedPassage.tableContext.headers.map((h, hIdx) => (
                            <th
                              key={hIdx}
                              className="px-3.5 py-2.5 text-[12.5px] border-r last:border-r-0 border-slate-200"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPassage.tableContext.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b last:border-b-0 border-slate-200">
                            {row.map((cell, cIdx) => {
                              const qMatch = cell.match(/^(.*?)\((\d+)\)(.*)$/);
                              if (qMatch && cIdx >= 1) {
                                const prefixText = qMatch[1].replace(/\.+/g, '').trim();
                                const qNum = parseInt(qMatch[2], 10);
                                const rawSuffix = qMatch[3].replace(/\.+/g, '').trim();
                                const suffixText =
                                  selectedPassage.id === 'c1-t2-pass1' ? '%' : rawSuffix;
                                const targetQ = selectedPassage.questions.find(
                                  (item, idx) => getQuestionNumber(item, idx + 1) === qNum
                                );
                                const targetAns = targetQ ? (userAnswers[targetQ.id] || '').trim() : '';
                                const isTargetCorr =
                                  submitted && targetQ
                                    ? isQuestionCorrect(targetQ, userAnswers)
                                    : false;

                                return (
                                  <td
                                    key={cIdx}
                                    id={targetQ ? `reading-q-${targetQ.id}` : undefined}
                                    onClick={() => setFocusedQuestionIndex(qNum)}
                                    className="px-3.5 py-2.5 border-r last:border-r-0 border-slate-200"
                                  >
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      {prefixText && (
                                        <span className="text-slate-800">{prefixText}</span>
                                      )}
                                      <span className="w-6 h-6 rounded bg-[#1e293b] text-white font-bold text-xs inline-flex items-center justify-center shrink-0">
                                        {qNum}
                                      </span>
                                      <input
                                        type="text"
                                        disabled={submitted}
                                        value={targetAns}
                                        onFocus={() => setFocusedQuestionIndex(qNum)}
                                        onChange={e =>
                                          targetQ && handleSelectAnswer(targetQ.id, e.target.value)
                                        }
                                        className={`w-36 px-2.5 py-1 text-[13px] rounded border transition-colors focus:outline-none ${
                                          submitted
                                            ? isTargetCorr
                                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                                              : 'border-rose-400 bg-rose-50 text-rose-900 font-bold'
                                            : focusedQuestionIndex === qNum
                                            ? 'border-blue-600 ring-2 ring-blue-500/20 bg-white'
                                            : 'border-slate-300 bg-white'
                                        }`}
                                      />
                                      {suffixText && (
                                        <span className="text-slate-700 font-medium">{suffixText}</span>
                                      )}
                                      {submitted && !isTargetCorr && targetQ && (
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                          ✓ {targetQ.correctAnswer.split('//')[0].trim()}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                );
                              }
                              return (
                                <td
                                  key={cIdx}
                                  className="px-3.5 py-2.5 border-r last:border-r-0 border-slate-200 text-slate-800 whitespace-pre-line"
                                >
                                  {cell}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : isMultiSelectFactorsGroup ? (
                  /* 4. Combined 26–27–28 Multi-Select 3 Checkboxes (Test 1 Passage 2 Q26–28) */
                  (() => {
                    const qIds = ['c1-t1-p2-q26', 'c1-t1-p2-q27', 'c1-t1-p2-q28'];
                    const selectedLetters = qIds
                      .map(id => (userAnswers[id] || '').trim().split(/[:.]/)[0].trim().toUpperCase())
                      .filter(Boolean);
                    const sampleQ = group.questions[0]?.q;
                    const options = sampleQ?.options || [];

                    const toggleFactorOption = (code: string) => {
                      if (submitted) return;
                      let nextLetters: string[];
                      if (selectedLetters.includes(code)) {
                        nextLetters = selectedLetters.filter(l => l !== code);
                      } else {
                        if (selectedLetters.length >= 3) return;
                        nextLetters = [...selectedLetters, code].sort();
                      }
                      setUserAnswers(prev => ({
                        ...prev,
                        'c1-t1-p2-q26': nextLetters[0] || '',
                        'c1-t1-p2-q27': nextLetters[1] || '',
                        'c1-t1-p2-q28': nextLetters[2] || '',
                      }));
                      setFocusedQuestionIndex(26);
                    };

                    return (
                      <div
                        id="reading-q-c1-t1-p2-q26"
                        onClick={() => setFocusedQuestionIndex(26)}
                        className="py-2 space-y-3"
                      >
                        <span id="reading-q-c1-t1-p2-q27" className="sr-only" />
                        <span id="reading-q-c1-t1-p2-q28" className="sr-only" />
                        <div className="flex items-start gap-2.5">
                          <span className="px-2 h-6 rounded bg-[#1e293b] text-white font-bold text-xs inline-flex items-center justify-center shrink-0 mt-0.5">
                            26–27–28
                          </span>
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 text-[14px]">
                              Which THREE of the following factors are mentioned?
                            </p>
                            <p className="text-xs text-slate-500">Select 3.</p>
                          </div>
                        </div>

                        <div className="pl-8 space-y-2">
                          {options.map(opt => {
                            const m = opt.match(/^([A-Z])[:.]\s*(.*)$/);
                            const optCode = m ? m[1] : opt;
                            const optLabel = m ? m[2] : opt;
                            const isChecked = selectedLetters.includes(optCode);
                            const isCorrectChoice = ['A', 'D', 'E'].includes(optCode);

                            return (
                              <label
                                key={optCode}
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleFactorOption(optCode);
                                }}
                                className={`flex items-start gap-2.5 py-1 text-[13.5px] cursor-pointer select-none ${
                                  submitted
                                    ? isCorrectChoice
                                      ? 'text-emerald-700 font-bold'
                                      : isChecked
                                      ? 'text-rose-600 line-through'
                                      : 'text-slate-600'
                                    : 'text-slate-800 hover:text-slate-950'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  disabled={submitted}
                                  checked={isChecked}
                                  readOnly
                                  className="mt-1 w-4 h-4 rounded border-slate-300 accent-blue-600 pointer-events-none shrink-0"
                                />
                                <span>
                                  <strong className="font-bold text-slate-900 mr-1.5">
                                    {optCode}
                                  </strong>
                                  {optLabel}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {submitted && (
                          <div className="pl-8 pt-1 text-xs font-bold text-emerald-700">
                            ✓ Correct answers: A, D, E
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  /* 5. Standard Question Items (Dropdowns, Radio MCQs, Radio YES/NO/NOT GIVEN) */
                  <div className="space-y-3">
                    {group.questions.map(({ q, index }) => renderQuestionCard(q, index))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BOTTOM IELTS FREE PRACTICE DOCKED QUESTION NAVIGATOR RIBBON (Matches Screenshots 1–4) */}
      <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between gap-2.5 shrink-0 z-20 text-xs">
        {/* Left & Center: Passage 1 | Passage 2 | Passage 3 */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {(passagesInTest.length > 0 ? passagesInTest : [selectedPassage]).map((p, pIdx) => {
            const isActivePassage = p.id === selectedPassage.id;
            const pInfo = parseReadingSource(p.cambridgeSource);
            const pLabel = `Passage ${pInfo.passageNum || pIdx + 1}:`;
            const pAnswered = p.questions.filter(q => Boolean(userAnswers[q.id]?.trim())).length;

            if (!isActivePassage) {
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => switchPassage(p)}
                  className="flex-1 min-w-[160px] py-2 px-4 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 transition-colors"
                >
                  <span className="font-bold text-slate-900">{pLabel}</span>
                  <span className="italic text-slate-400">
                    {pAnswered > 0
                      ? `${pAnswered}/${p.questions.length} answered`
                      : `${p.questions.length} questions`}
                  </span>
                </button>
              );
            }

            return (
              <div
                key={p.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border-[1.5px] border-[#dc2626] shrink-0"
              >
                <span className="font-bold text-slate-900 text-xs pr-1">{pLabel}</span>
                <div className="flex items-center gap-1">
                  {p.questions.map((q, idx) => {
                    const num = getQuestionNumber(q, idx + 1);
                    const isAns = Boolean(userAnswers[q.id]?.trim());
                    const isFlag = Boolean(flaggedQuestions[q.id]);
                    const isFocus = focusedQuestionIndex === num;

                    let pillClass = 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200';
                    if (submitted) {
                      const isCorr = isQuestionCorrect(q, userAnswers);
                      pillClass = isCorr
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-rose-600 text-white border-rose-600';
                    } else if (isFocus) {
                      pillClass = 'bg-white text-blue-700 font-bold border-2 border-blue-600';
                    } else if (isAns) {
                      pillClass = 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-400';
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleFocusQuestion(num)}
                        className={`min-w-6 h-6 px-1 rounded text-[11px] font-bold flex items-center justify-center shrink-0 relative cursor-pointer transition-all ${pillClass}`}
                        title={`Question ${num} ${isAns ? '(Answered)' : '(Blank)'}`}
                      >
                        {num}
                        {isFlag && !submitted && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 ring-1 ring-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Review Checkbox + 0/41 Counter + Circular ‹ › Arrows */}
        <div className="flex items-center gap-2.5 shrink-0">
          {(() => {
            const activeQ = selectedPassage.questions.find(
              (item, idx) => getQuestionNumber(item, idx + 1) === focusedQuestionIndex
            );
            if (!activeQ) return null;
            const isFlagged = Boolean(flaggedQuestions[activeQ.id]);
            return (
              <label
                onClick={() => toggleFlag(activeQ.id)}
                className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none"
                title="Mark current question for review"
              >
                <input
                  type="checkbox"
                  checked={isFlagged}
                  readOnly
                  className="w-3.5 h-3.5 rounded border-slate-300 accent-amber-600 pointer-events-none"
                />
                <span>Review</span>
              </label>
            );
          })()}

          <span className="text-xs text-slate-400 font-medium">
            {totalTestAnswered}/{totalTestQuestions}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={focusedQuestionIndex <= 1}
              onClick={() => handleFocusQuestion(focusedQuestionIndex - 1)}
              className="w-7 h-7 rounded-full bg-white hover:bg-slate-50 disabled:opacity-30 text-slate-600 flex items-center justify-center text-sm cursor-pointer border border-slate-200 transition-colors"
              title="Previous question"
            >
              ‹
            </button>
            <button
              type="button"
              disabled={focusedQuestionIndex >= totalTestQuestions}
              onClick={() => handleFocusQuestion(focusedQuestionIndex + 1)}
              className="w-7 h-7 rounded-full bg-white hover:bg-slate-50 disabled:opacity-30 text-slate-600 flex items-center justify-center text-sm cursor-pointer border border-slate-200 transition-colors"
              title="Next question"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* 5. FULL-PAGE IELTS FREE PRACTICE RESULTS VIEW (Matches User Screenshots 1, 2, 3) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col font-sans text-slate-800">
          {/* Top IELTS Free Practice Header Bar */}
          <header className="w-full bg-white">
            <div className="max-w-[1320px] mx-auto px-6 sm:px-8 h-14 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onBackToHub?.()}
                className="flex items-center gap-2 cursor-pointer group"
                title="Back to Cambridge IELTS Library"
              >
                <span className="w-7 h-7 rounded-[6px] bg-[#dc2626] flex items-end justify-center gap-[2px] p-1.5 shadow-2xs">
                  <span className="w-[2.5px] h-2 bg-white rounded-xs" />
                  <span className="w-[2.5px] h-3 bg-white rounded-xs" />
                  <span className="w-[2.5px] h-4 bg-white rounded-xs" />
                </span>
                <span className="text-[15px] font-extrabold tracking-tight text-slate-900">
                  IELTS <span className="text-[#dc2626]">Free Practice</span>
                </span>
              </button>

              {/* Right Pill Nav */}
              <div className="hidden sm:flex items-center bg-[#f8f9fa] border border-slate-200/80 rounded-full p-1 text-[12px]">
                <button
                  type="button"
                  onClick={() => onBackToHub?.()}
                  className="px-3.5 py-1 rounded-full bg-white text-[#dc2626] font-semibold shadow-2xs border border-slate-200/60 cursor-pointer"
                >
                  Cambridge
                </button>
                <span className="px-3 py-1 text-slate-600 font-medium">Mini tests</span>
                <span className="px-3 py-1 text-slate-600 font-medium">Band calculator</span>
                <span className="px-3 py-1 text-slate-600 font-medium">Guides</span>
                <span className="px-3 py-1 text-slate-600 font-medium">Progress</span>
              </div>
            </div>
          </header>

          {/* Main Results Container */}
          <div className="max-w-[1320px] mx-auto w-full px-6 sm:px-8 py-3 space-y-5 flex-1">
            {/* Breadcrumb Row */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 text-[11.5px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <button
                  type="button"
                  onClick={() => onBackToHub?.()}
                  className="hover:text-slate-700 cursor-pointer"
                >
                  Home
                </button>
                <span>/</span>
                <button
                  type="button"
                  onClick={() => onBackToHub?.()}
                  className="hover:text-slate-700 cursor-pointer"
                >
                  Cambridge IELTS {parsedCurrentPassage.book}
                </button>
                <span>/</span>
                <span className="text-slate-800 font-semibold">
                  Reading Test {parsedCurrentPassage.testNum} results
                </span>
              </div>
            </div>

            {/* Title + Score Banner + 3-Col Stats Card */}
            <div className="space-y-4">
              <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
                Reading Test {parsedCurrentPassage.testNum} — Results
              </h1>

              {/* Soft Pink/Emerald Score Callout */}
              <div
                className={`rounded-xl px-6 py-4 border text-[15px] ${
                  bandScore >= 6.5
                    ? 'bg-emerald-50/70 border-emerald-200/80 text-slate-800'
                    : 'bg-[#fdf3f2] border-[#f9e1de] text-slate-800'
                }`}
              >
                You scored{' '}
                <strong className="font-extrabold text-slate-900 text-[20px]">
                  {score}/{totalTestQuestions}
                </strong>{' '}
                <span className="text-slate-400 mx-1">=</span>{' '}
                <strong
                  className={`font-extrabold text-[19px] ${
                    bandScore >= 6.5 ? 'text-emerald-700' : 'text-[#dc2626]'
                  }`}
                >
                  Band {bandScore.toFixed(1)}
                </strong>
              </div>

              {/* 3-Column Metrics Card */}
              <div className="rounded-xl border border-slate-200/70 bg-white py-5 px-6 grid grid-cols-3 text-center">
                <div>
                  <div className="text-[26px] leading-tight font-extrabold text-slate-900">
                    {score}/{totalTestQuestions}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-1">
                    CORRECT ANSWERS
                  </div>
                </div>
                <div>
                  <div
                    className={`text-[26px] leading-tight font-extrabold ${
                      bandScore >= 6.5 ? 'text-emerald-600' : 'text-[#dc2626]'
                    }`}
                  >
                    {bandScore.toFixed(1)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-1">
                    ESTIMATED BAND
                  </div>
                </div>
                <div>
                  <div className="text-[26px] leading-tight font-extrabold text-slate-900">
                    {Math.round((score / (totalTestQuestions || 1)) * 100)}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-1">
                    ACCURACY
                  </div>
                </div>
              </div>

              <p className="text-[11.5px] text-slate-400">
                Band is an approximate guide from the standard Academic Reading conversion and varies
                slightly by test.{' '}
                <span className="text-blue-600 hover:underline cursor-pointer">
                  Open the band score calculator →
                </span>
              </p>
            </div>

            {/* Filter & View Mode Toggle Row */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-800 cursor-pointer select-none hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={showOnlyWrong}
                  onChange={e => setShowOnlyWrong(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 accent-slate-900"
                />
                <span>Show only wrong answers ({totalTestQuestions - score})</span>
              </label>

              <div className="inline-flex items-center bg-[#f1f3f5] p-1 rounded-full text-[11.5px]">
                <button
                  type="button"
                  onClick={() => setResultsViewMode('split')}
                  className={`px-3 py-1 rounded-full flex items-center gap-1.5 cursor-pointer transition-all ${
                    resultsViewMode === 'split'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>◫</span>
                  <span>Split view</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResultsViewMode('list')}
                  className={`px-3 py-1 rounded-full flex items-center gap-1.5 cursor-pointer transition-all ${
                    resultsViewMode === 'list'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>☰</span>
                  <span>List</span>
                </button>
              </div>
            </div>

            {/* VIEW MODE 1: LIST VIEW (Matches Screenshots 1 & 2) */}
            {resultsViewMode === 'list' ? (
              <div className="space-y-8 pb-12">
                {(passagesInTest.length > 0 ? passagesInTest : [selectedPassage]).map(
                  (p, pIdx) => {
                    const pQuestions = p.questions
                      .map((q, idx) => ({ q, qNum: getQuestionNumber(q, idx + 1) }))
                      .filter(({ q }) => !showOnlyWrong || !isQuestionCorrect(q, userAnswers));

                    if (pQuestions.length === 0) return null;

                    return (
                      <div key={p.id} className="space-y-3">
                        <div className="border-b border-slate-200/80 pb-2">
                          <h2 className="text-[15px] font-medium text-slate-800">
                            Passage {pIdx + 1} — {p.title.split('—')[0].trim()}
                          </h2>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveResultsPassageId(p.id);
                              setResultsViewMode('split');
                            }}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-bold text-slate-800 cursor-pointer"
                          >
                            Show passage
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {pQuestions.map(({ q, qNum }) => {
                            const userAns = (userAnswers[q.id] || '').trim();
                            const isCorr = isQuestionCorrect(q, userAnswers);
                            const expectedAns = getExpectedAnswerLabel(q);
                            const isExpanded = Boolean(expandedExplanations[q.id]);

                            return (
                              <div
                                key={q.id}
                                className={`rounded-[14px] border border-slate-200/80 border-l-[3.5px] ${
                                  isCorr ? 'border-l-emerald-600' : 'border-l-[#dc2626]'
                                } bg-white px-4 py-3 transition-all`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5 flex-wrap text-[12px]">
                                    <span
                                      className={`w-[22px] h-[22px] rounded-[5px] font-bold text-[11.5px] text-white inline-flex items-center justify-center shrink-0 ${
                                        isCorr ? 'bg-emerald-600' : 'bg-[#dc2626]'
                                      }`}
                                    >
                                      {qNum}
                                    </span>
                                    <span
                                      className={`font-medium text-[13px] ${
                                        isCorr ? 'text-emerald-600' : 'text-[#dc2626]'
                                      }`}
                                    >
                                      {isCorr ? '✓' : '✗'}
                                    </span>
                                    <span className="text-slate-600">
                                      You:{' '}
                                      <strong
                                        className={`font-semibold ${
                                          isCorr ? 'text-[#15803d]' : 'text-[#dc2626]'
                                        }`}
                                      >
                                        {userAns || '—'}
                                      </strong>
                                    </span>
                                    <span className="text-slate-600">
                                      Answer:{' '}
                                      <strong className="font-bold text-[#15803d]">
                                        {expectedAns}
                                      </strong>
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => toggleExplanation(q, p.id)}
                                    className="px-2.5 py-1 rounded-[6px] bg-[#f1f3f5] hover:bg-slate-200 text-slate-800 font-semibold text-[11px] shrink-0 cursor-pointer transition-colors"
                                  >
                                    Explain more {isExpanded ? '▾' : '▸'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              /* VIEW MODE 2: SPLIT VIEW WITH GREEN SENTENCE HIGHLIGHTING IN PASSAGE (Matches Screenshot 3) */
              (() => {
                const activeP =
                  passagesInTest.find(p => p.id === activeResultsPassageId) ||
                  passagesInTest[0] ||
                  selectedPassage;
                const activePIdx = Math.max(
                  0,
                  passagesInTest.findIndex(p => p.id === activeP.id)
                );
                const pQuestions = activeP.questions
                  .map((q, idx) => ({ q, qNum: getQuestionNumber(q, idx + 1) }))
                  .filter(({ q }) => !showOnlyWrong || !isQuestionCorrect(q, userAnswers));
                const firstQNum =
                  activeP.questions.length > 0 ? getQuestionNumber(activeP.questions[0], 1) : 1;
                const lastQNum =
                  activeP.questions.length > 0
                    ? getQuestionNumber(
                        activeP.questions[activeP.questions.length - 1],
                        activeP.questions.length
                      )
                    : 15;

                return (
                  <div className="space-y-4 pb-12">
                    {/* Passage Selector Tabs (Passage 1 · 15 wrong | Passage 2 · 13 wrong | Passage 3 · 12 wrong) */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {(passagesInTest.length > 0 ? passagesInTest : [selectedPassage]).map(
                        (p, idx) => {
                          const isTabActive = p.id === activeP.id;
                          const wrongCount = p.questions.filter(
                            q => !isQuestionCorrect(q, userAnswers)
                          ).length;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setActiveResultsPassageId(p.id)}
                              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-all ${
                                isTabActive
                                  ? 'bg-[#111827] text-white'
                                  : 'bg-white border border-slate-200/90 text-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              <span>Passage {idx + 1} · </span>
                              <span
                                className={
                                  wrongCount > 0
                                    ? isTabActive
                                      ? 'text-[#ef4444]'
                                      : 'text-[#dc2626]'
                                    : 'text-emerald-500'
                                }
                              >
                                {wrongCount} wrong
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>

                    {/* 2-Column Split Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      {/* LEFT COLUMN: Sticky Scrollable Passage with Green Highlighted Answer Sentences + Dark [qNum] Badges */}
                      <div
                        ref={resultsPassageScrollRef}
                        className="lg:sticky lg:top-4 bg-white border border-slate-200/80 rounded-xl p-5 max-h-[calc(100vh-32px)] overflow-y-auto space-y-3.5 text-[13px] leading-[1.78] text-slate-700"
                      >
                        <h3 className="font-bold text-slate-900 text-[15px]">
                          {activeP.title.split('—')[0].trim()}
                        </h3>

                        <div className="border border-slate-200/60 rounded-xl p-4 sm:p-5 space-y-3.5 bg-white">
                          <p className="italic text-slate-700 text-[13px] leading-[1.65]">
                            You should spend about 20 minutes on Questions {firstQNum}-{lastQNum}{' '}
                            which are based on Reading Passage {activePIdx + 1} below
                          </p>

                          {activeP.title.includes('—') ? (
                            <div className="space-y-2.5">
                              <h4 className="font-bold text-slate-900 text-[13.5px]">
                                {activeP.title.split('—')[0].trim()}
                              </h4>
                              <p className="font-bold text-slate-900 text-[13px] leading-[1.6]">
                                {activeP.title.split('—')[1].trim()}
                              </p>
                            </div>
                          ) : (
                            <h4 className="font-bold text-slate-900 text-[13.5px]">
                              {activeP.title}
                            </h4>
                          )}

                          <div className="space-y-3.5">
                            {activeP.paragraphs.map(para => {
                              const letterMatch = para.label.match(/^Paragraph\s+([A-Z])$/);
                              const sectionLetter = letterMatch ? letterMatch[1] : null;
                              return (
                                <p key={para.label} className="whitespace-pre-line">
                                  {sectionLetter && (
                                    <strong className="font-bold text-slate-900 mr-1.5">
                                      {sectionLetter}
                                    </strong>
                                  )}
                                  {renderPassageParagraphWithEvidence(
                                    activeP,
                                    para.label,
                                    para.text
                                  )}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT COLUMN: Question Result Cards Flowing Naturally with Red Blank & Explain More */}
                      <div className="space-y-3">
                        {pQuestions.map(({ q, qNum }) => {
                          const userAns = (userAnswers[q.id] || '').trim();
                          const isCorr = isQuestionCorrect(q, userAnswers);
                          const expectedAns = getExpectedAnswerLabel(q);
                          const isExpanded = Boolean(expandedExplanations[q.id]);

                          return (
                            <div
                              key={q.id}
                              id={`results-q-card-${q.id}`}
                              className={`rounded-[14px] border border-slate-200/80 border-l-[3.5px] ${
                                isCorr ? 'border-l-emerald-600' : 'border-l-[#dc2626]'
                              } bg-white px-4 py-3.5 space-y-2 transition-all`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 flex-1">
                                  <span
                                    className={`w-[22px] h-[22px] rounded-[5px] font-bold text-[11.5px] text-white inline-flex items-center justify-center shrink-0 ${
                                      isCorr ? 'bg-emerald-600' : 'bg-[#dc2626]'
                                    }`}
                                  >
                                    {qNum}
                                  </span>
                                  <span
                                    className={`font-medium text-[13px] shrink-0 ${
                                      isCorr ? 'text-emerald-600' : 'text-[#dc2626]'
                                    }`}
                                  >
                                    {isCorr ? '✓' : '✗'}
                                  </span>
                                  <div className="flex-1">
                                    {renderResultQuestionPrompt(activeP, q, qNum, isCorr)}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => toggleExplanation(q, activeP.id)}
                                  className="px-2.5 py-1 rounded-[6px] bg-[#f1f3f5] hover:bg-slate-200 text-slate-800 font-semibold text-[11px] shrink-0 cursor-pointer transition-colors"
                                >
                                  Explain more {isExpanded ? '▾' : '▸'}
                                </button>
                              </div>

                              <div className="text-[12px] text-slate-600">
                                You:{' '}
                                <strong
                                  className={`font-semibold ${
                                    isCorr ? 'text-[#15803d]' : 'text-[#dc2626]'
                                  }`}
                                >
                                  {userAns || '—'}
                                </strong>{' '}
                                · Answer:{' '}
                                <strong className="font-bold text-[#15803d]">
                                  {expectedAns}
                                </strong>
                              </div>

                              {isExpanded && (
                                <div className="bg-[#f8f9fa] rounded-[8px] px-3.5 py-2.5 text-[12px] text-slate-700 mt-2 space-y-1.5 leading-[1.6]">
                                  <p>
                                    <strong className="font-bold text-slate-900">Why: </strong>
                                    {q.evidence ? q.evidence.replace(/\.$/, '') : q.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
};
