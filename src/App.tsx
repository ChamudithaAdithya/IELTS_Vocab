import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Sidebar, AppTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { WritingTutorView } from './components/WritingTutorView';
import { SpeakingTutorView } from './components/tutor/SpeakingTutorView';
import { ReadingTutorView } from './components/tutor/ReadingTutorView';
import { ListeningTutorView } from './components/tutor/ListeningTutorView';
import { AnalyticsView } from './components/tutor/AnalyticsView';
import { CambridgeLibraryView } from './components/tutor/CambridgeLibraryView';
import { WordBankView } from './components/WordBankView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { LessonView } from './components/LessonView';
import { SearchModal } from './components/SearchModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { loadTutorState } from './utils/tutorEngine';
import { loadProgress, saveProgress } from './utils/storage';
import { LESSONS } from './data/lessons';
import { UserProgress } from './types';
import { Award, RotateCcw, ArrowUp } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('ielts_tutor_state_v1');
      localStorage.removeItem('ielts_speaking_adaptive_progress_v1');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-md border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Application Notice</h1>
            <p className="text-xs text-slate-600">
              A temporary layout sync issue occurred:
              <br />
              <code className="text-[11px] font-mono text-red-700 bg-red-50 p-1 rounded block mt-1">
                {this.state.error?.message || 'Unexpected state'}
              </code>
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Cache & Reload App</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const VALID_TABS: AppTab[] = [
  'cambridge', 
  'listening', 
  'reading', 
  'tutor', 
  'speaking', 
  'wordbank', 
  'flashcards', 
  'quiz', 
  'lessons', 
  'analytics'
];

function getInitialTab(): AppTab {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as AppTab | null;
    if (tabParam && VALID_TABS.includes(tabParam)) {
      return tabParam;
    }
    const hash = window.location.hash.replace(/^#/, '') as AppTab;
    if (hash && VALID_TABS.includes(hash)) {
      return hash;
    }
  }
  return 'cambridge';
}

function MainApp() {
  const [currentTab, setCurrentTab] = useState<AppTab>(getInitialTab);
  const [showSinhala, setShowSinhala] = useState<boolean>(true);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ielts_sidebar_collapsed_v1') === 'true';
    }
    return false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Vocabulary & Study State
  const [userProgress, setUserProgress] = useState<UserProgress>(loadProgress);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(LESSONS[0]?.id || 'lesson-1');

  // Sync tab with URL search parameter & browser document title
  useEffect(() => {
    const tabTitles: Record<AppTab, string> = {
      cambridge: 'Cambridge Library (Books 1–18) | Cambridge IELTS Master',
      listening: 'Listening Tests | Cambridge IELTS Master',
      reading: 'Reading Tests | Cambridge IELTS Master',
      tutor: 'Writing Tutor AI | Cambridge IELTS Master',
      speaking: 'Speaking Tutor | Cambridge IELTS Master',
      wordbank: 'Word Bank & Academic Dictionary | Cambridge IELTS Master',
      flashcards: 'Vocabulary Flashcards Lab | Cambridge IELTS Master',
      quiz: 'Vocabulary Quizzes & Tests | Cambridge IELTS Master',
      lessons: 'Topic Vocabulary Lessons | Cambridge IELTS Master',
      analytics: 'Analytics & Score Tracker | Cambridge IELTS Master',
    };
    document.title = tabTitles[currentTab] || 'Cambridge IELTS Master';

    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('tab') !== currentTab) {
        url.searchParams.set('tab', currentTab);
        window.history.pushState({ tab: currentTab }, '', url.toString());
      }
    } catch {
      // Ignore in non-standard context
    }
  }, [currentTab]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AppTab | null;
      if (tabParam && VALID_TABS.includes(tabParam)) {
        setCurrentTab(tabParam);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Save sidebar collapsed state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ielts_sidebar_collapsed_v1', String(isCollapsed));
    }
  }, [isCollapsed]);

  // Global Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to top tracking
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Vocabulary handlers
  const handleToggleMastered = (wordId: string) => {
    setUserProgress(prev => {
      const isAlready = prev.masteredWordIds.includes(wordId);
      const updated = {
        ...prev,
        masteredWordIds: isAlready 
          ? prev.masteredWordIds.filter(id => id !== wordId)
          : [...prev.masteredWordIds, wordId]
      };
      saveProgress(updated);
      return updated;
    });
  };

  const handleToggleBookmark = (wordId: string) => {
    setUserProgress(prev => {
      const isAlready = prev.bookmarkedWordIds.includes(wordId);
      const updated = {
        ...prev,
        bookmarkedWordIds: isAlready 
          ? prev.bookmarkedWordIds.filter(id => id !== wordId)
          : [...prev.bookmarkedWordIds, wordId]
      };
      saveProgress(updated);
      return updated;
    });
  };

  const handleSaveChecklistSentence = (wordId: string, sentence: string) => {
    setUserProgress(prev => {
      const updated = {
        ...prev,
        checklistSubmissions: {
          ...prev.checklistSubmissions,
          [wordId]: sentence
        },
        completedChecklistIds: prev.completedChecklistIds.includes(wordId)
          ? prev.completedChecklistIds
          : [...prev.completedChecklistIds, wordId]
      };
      saveProgress(updated);
      return updated;
    });
  };

  const handleRecordBestScore = (lessonId: string, scorePercent: number) => {
    setUserProgress(prev => {
      const prevScore = prev.quizBestScores[lessonId] || 0;
      if (scorePercent > prevScore) {
        const updated = {
          ...prev,
          quizBestScores: {
            ...prev.quizBestScores,
            [lessonId]: scorePercent
          }
        };
        saveProgress(updated);
        return updated;
      }
      return prev;
    });
  };

  const handleNavigateToWord = (lessonId: string, _wordId: string) => {
    setSelectedLessonId(lessonId);
    setCurrentTab('lessons');
  };

  const selectedLesson = LESSONS.find(l => l.id === selectedLessonId) || LESSONS[0];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex font-sans">
      {/* Organized Left Side Navigation Menu */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        showSinhala={showSinhala}
        setShowSinhala={setShowSinhala}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        userProgress={userProgress}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Sleek Top Navigation Header */}
        <TopBar
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          showSinhala={showSinhala}
          setShowSinhala={setShowSinhala}
          onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Dedicated Main Content Router */}
        <main className="flex-1">
          {/* Category 1: Cambridge Real Exams */}
          {currentTab === 'cambridge' && (
            <CambridgeLibraryView
              showSinhala={showSinhala}
              onSelectTest={(module) => setCurrentTab(module as AppTab)}
            />
          )}

          {currentTab === 'listening' && (
            <ListeningTutorView 
              showSinhala={showSinhala} 
              onBackToHub={() => setCurrentTab('cambridge')}
            />
          )}

          {currentTab === 'reading' && (
            <ReadingTutorView 
              showSinhala={showSinhala} 
              onBackToHub={() => setCurrentTab('cambridge')}
            />
          )}

          {currentTab === 'tutor' && (
            <WritingTutorView 
              showSinhala={showSinhala} 
              onNavigateToModule={(m) => setCurrentTab(m as AppTab)}
            />
          )}

          {currentTab === 'speaking' && (
            <SpeakingTutorView 
              showSinhala={showSinhala} 
              onBackToHub={() => setCurrentTab('cambridge')}
            />
          )}

          {/* Category 2: Vocabulary & Practice */}
          {currentTab === 'wordbank' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <WordBankView
                showSinhala={showSinhala}
                userProgress={userProgress}
                onToggleMastered={handleToggleMastered}
                onToggleBookmark={handleToggleBookmark}
                onNavigateToWord={handleNavigateToWord}
              />
            </div>
          )}

          {currentTab === 'flashcards' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <FlashcardsView
                lesson={selectedLesson}
                allLessons={LESSONS}
                onSelectLesson={(id) => setSelectedLessonId(id)}
                showSinhala={showSinhala}
                masteredWordIds={userProgress.masteredWordIds}
                bookmarkedWordIds={userProgress.bookmarkedWordIds}
                onToggleMastered={handleToggleMastered}
                onToggleBookmark={handleToggleBookmark}
                onBackToLesson={() => setCurrentTab('lessons')}
              />
            </div>
          )}

          {currentTab === 'quiz' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <QuizView
                lesson={selectedLesson}
                allLessons={LESSONS}
                onSelectLesson={(id) => setSelectedLessonId(id)}
                showSinhala={showSinhala}
                onRecordBestScore={handleRecordBestScore}
                onBackToLesson={() => setCurrentTab('lessons')}
              />
            </div>
          )}

          {currentTab === 'lessons' && (
            <LessonView
              lesson={selectedLesson}
              allLessons={LESSONS}
              onSelectLesson={(id) => setSelectedLessonId(id)}
              showSinhala={showSinhala}
              userProgress={userProgress}
              onToggleMastered={handleToggleMastered}
              onToggleBookmark={handleToggleBookmark}
              onSaveChecklistSentence={handleSaveChecklistSentence}
              onStartQuiz={(l) => {
                setSelectedLessonId(l.id);
                setCurrentTab('quiz');
              }}
              onStartFlashcards={(l) => {
                setSelectedLessonId(l.id);
                setCurrentTab('flashcards');
              }}
              onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
            />
          )}

          {/* Category 3: Progress & Insights */}
          {currentTab === 'analytics' && (
            <AnalyticsView 
              tutorState={loadTutorState()} 
              showSinhala={showSinhala} 
              onBackToHub={() => setCurrentTab('cambridge')}
              onNavigateToSection={(s) => setCurrentTab(s as AppTab)}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-slate-800">Cambridge IELTS Master Platform</span>
              <p className="mt-0.5">Authentic past papers from Books 1 to 18 with local audio streaming, AI tutors, and bilingual Sinhala assistance.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <button 
                type="button"
                onClick={() => setCurrentTab('cambridge')} 
                className="hover:text-indigo-600 cursor-pointer"
              >
                Cambridge Library
              </button>
              <button 
                type="button"
                onClick={() => setCurrentTab('wordbank')} 
                className="hover:text-indigo-600 cursor-pointer"
              >
                Word Bank
              </button>
              <button 
                type="button"
                onClick={() => setCurrentTab('speaking')} 
                className="hover:text-indigo-600 cursor-pointer"
              >
                Speaking
              </button>
              <button 
                type="button"
                onClick={() => setCurrentTab('tutor')} 
                className="hover:text-indigo-600 cursor-pointer"
              >
                Writing
              </button>
              <button 
                type="button"
                onClick={() => setCurrentTab('analytics')} 
                className="hover:text-indigo-600 cursor-pointer"
              >
                Analytics
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Quick Search Modal (Ctrl + K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        showSinhala={showSinhala}
        onSelectWord={(lessonId, _wordId) => {
          setSelectedLessonId(lessonId);
          setCurrentTab('lessons');
          setIsSearchOpen(false);
        }}
      />

      {/* Voice & Pronunciation Studio Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        showSinhala={showSinhala}
      />

      {/* Floating Bring to Top Button with Arrow */}
      {showScrollTop && (
        <button
          type="button"
          onClick={handleScrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-slate-900/95 hover:bg-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 backdrop-blur-xs flex items-center justify-center group cursor-pointer border border-white/20 animate-in fade-in zoom-in-95"
          aria-label="Bring to top"
          title="Bring to top"
        >
          <ArrowUp className="w-5 h-5 text-white group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
