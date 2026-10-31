import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { LESSONS, ALL_WORDS } from './data/lessons';
import { Lesson, UserProgress } from './types';
import { loadProgress, saveProgress } from './utils/storage';
import { Header, AppTab } from './components/Header';
import { LessonView } from './components/LessonView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { SpeakingLabView } from './components/SpeakingLabView';
import { WordBankView } from './components/WordBankView';
import { WritingTutorView } from './components/WritingTutorView';
import { SpeakingTutorView } from './components/tutor/SpeakingTutorView';
import { ReadingTutorView } from './components/tutor/ReadingTutorView';
import { ListeningTutorView } from './components/tutor/ListeningTutorView';
import { AnalyticsView } from './components/tutor/AnalyticsView';
import { loadTutorState } from './utils/tutorEngine';
import { SearchModal } from './components/SearchModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { Award, BookOpen, Layers, Sparkles, Mic, Heart, CheckCircle2, RotateCcw } from 'lucide-react';

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
    localStorage.removeItem('ielts_tutor_state_v1');
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
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
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

function MainApp() {
  const [currentTab, setCurrentTab] = useState<AppTab>('tutor');
  // Default to Lesson 2: Family & Relationships
  const [currentLessonId, setCurrentLessonId] = useState<string>('lesson-2');
  const [showSinhala, setShowSinhala] = useState<boolean>(true);
  const [globalAccent, setGlobalAccent] = useState<'en-GB' | 'en-US' | 'en-AU'>('en-GB');
  const [userProgress, setUserProgress] = useState<UserProgress>(loadProgress);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    saveProgress(userProgress);
  }, [userProgress]);

  const currentLesson: Lesson = LESSONS.find(l => l.id === currentLessonId) || LESSONS[1];

  const handleToggleMastered = (wordId: string) => {
    setUserProgress(prev => {
      const isAlready = prev.masteredWordIds.includes(wordId);
      const updated = isAlready
        ? prev.masteredWordIds.filter(id => id !== wordId)
        : [...prev.masteredWordIds, wordId];
      return { ...prev, masteredWordIds: updated };
    });
  };

  const handleToggleBookmark = (wordId: string) => {
    setUserProgress(prev => {
      const isAlready = prev.bookmarkedWordIds.includes(wordId);
      const updated = isAlready
        ? prev.bookmarkedWordIds.filter(id => id !== wordId)
        : [...prev.bookmarkedWordIds, wordId];
      return { ...prev, bookmarkedWordIds: updated };
    });
  };

  const handleSaveChecklistSentence = (wordId: string, sentence: string) => {
    setUserProgress(prev => {
      const updatedSubmissions = { ...prev.checklistSubmissions, [wordId]: sentence };
      const updatedCompleted = prev.completedChecklistIds.includes(wordId)
        ? prev.completedChecklistIds
        : [...prev.completedChecklistIds, wordId];
      return {
        ...prev,
        checklistSubmissions: updatedSubmissions,
        completedChecklistIds: updatedCompleted,
      };
    });
  };

  const handleRecordBestScore = (lessonId: string, scorePercent: number) => {
    setUserProgress(prev => {
      const currentBest = prev.quizBestScores[lessonId] || 0;
      if (scorePercent > currentBest) {
        return {
          ...prev,
          quizBestScores: { ...prev.quizBestScores, [lessonId]: scorePercent },
        };
      }
      return prev;
    });
  };

  const handleNavigateToWord = (lessonId: string, wordId: string) => {
    setCurrentLessonId(lessonId);
    setCurrentTab('lessons');
    setTimeout(() => {
      const elem = document.getElementById(`word-${wordId}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleStartQuiz = (lesson: Lesson) => {
    setCurrentLessonId(lesson.id);
    setCurrentTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartFlashcards = (lesson: Lesson) => {
    setCurrentLessonId(lesson.id);
    setCurrentTab('flashcards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        showSinhala={showSinhala}
        setShowSinhala={setShowSinhala}
        masteredCount={userProgress.masteredWordIds.length}
        totalWords={ALL_WORDS.length}
        bookmarkedCount={userProgress.bookmarkedWordIds.length}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
      />

      {/* Main Dedicated Content Views */}
      <main className="flex-1">
        {/* Module 1: Writing Tutor AI (Dedicated Room & Hub) */}
        {currentTab === 'tutor' && (
          <WritingTutorView 
            showSinhala={showSinhala} 
            onNavigateToModule={(m) => setCurrentTab(m as AppTab)}
          />
        )}

        {/* Module 2: Speaking Tutor AI */}
        {currentTab === 'speaking' && (
          <SpeakingTutorView 
            showSinhala={showSinhala} 
            onBackToHub={() => setCurrentTab('tutor')}
          />
        )}

        {/* Module 3: Reading Tutor AI */}
        {currentTab === 'reading' && (
          <ReadingTutorView 
            showSinhala={showSinhala} 
            onBackToHub={() => setCurrentTab('tutor')}
          />
        )}

        {/* Module 4: Listening Tutor AI */}
        {currentTab === 'listening' && (
          <ListeningTutorView 
            showSinhala={showSinhala} 
            onBackToHub={() => setCurrentTab('tutor')}
          />
        )}

        {/* Module 5 & 6: Performance Analytics & Learning Coach */}
        {currentTab === 'analytics' && (
          <AnalyticsView 
            tutorState={loadTutorState()} 
            showSinhala={showSinhala} 
            onBackToHub={() => setCurrentTab('tutor')}
            onNavigateToSection={(s) => setCurrentTab(s as AppTab)}
          />
        )}

        {/* Vocabulary Modules */}
        {currentTab === 'lessons' && (
          <LessonView
            lesson={currentLesson}
            allLessons={LESSONS}
            onSelectLesson={setCurrentLessonId}
            showSinhala={showSinhala}
            userProgress={userProgress}
            onToggleMastered={handleToggleMastered}
            onToggleBookmark={handleToggleBookmark}
            onSaveChecklistSentence={handleSaveChecklistSentence}
            onStartQuiz={handleStartQuiz}
            onStartFlashcards={handleStartFlashcards}
            onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
          />
        )}

        {currentTab === 'flashcards' && (
          <FlashcardsView
            lesson={currentLesson}
            allLessons={LESSONS}
            onSelectLesson={setCurrentLessonId}
            showSinhala={showSinhala}
            masteredWordIds={userProgress.masteredWordIds}
            bookmarkedWordIds={userProgress.bookmarkedWordIds}
            onToggleMastered={handleToggleMastered}
            onToggleBookmark={handleToggleBookmark}
            onBackToLesson={() => setCurrentTab('lessons')}
          />
        )}

        {currentTab === 'quiz' && (
          <QuizView
            lesson={currentLesson}
            allLessons={LESSONS}
            onSelectLesson={setCurrentLessonId}
            showSinhala={showSinhala}
            onRecordBestScore={handleRecordBestScore}
            onBackToLesson={() => setCurrentTab('lessons')}
          />
        )}

        {currentTab === 'bank' && (
          <WordBankView
            showSinhala={showSinhala}
            userProgress={userProgress}
            onToggleMastered={handleToggleMastered}
            onToggleBookmark={handleToggleBookmark}
            onNavigateToWord={handleNavigateToWord}
          />
        )}
      </main>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        showSinhala={showSinhala}
        onSelectWord={handleNavigateToWord}
      />

      {/* Voice & Pronunciation Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        showSinhala={showSinhala}
      />

      {/* Clean Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-800">IELTS Master Band 8 AI Examiner Suite</span>
            <p className="mt-0.5">Academic & General Training with Sinhala bilingual explanations.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => setCurrentTab('tutor')} className="hover:text-slate-900 font-bold text-indigo-700">
              Writing Tutor
            </button>
            <button onClick={() => setCurrentTab('speaking')} className="hover:text-slate-900">
              Speaking
            </button>
            <button onClick={() => setCurrentTab('reading')} className="hover:text-slate-900">
              Reading
            </button>
            <button onClick={() => setCurrentTab('listening')} className="hover:text-slate-900">
              Listening
            </button>
            <button onClick={() => setCurrentTab('analytics')} className="hover:text-slate-900">
              Analytics
            </button>
            <button onClick={() => setCurrentTab('lessons')} className="hover:text-slate-900">
              Vocab Lessons
            </button>
          </div>
        </div>
      </footer>
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
