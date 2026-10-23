import React, { useState, useEffect } from 'react';
import { LESSONS, ALL_WORDS } from './data/lessons';
import { Lesson, UserProgress } from './types';
import { loadProgress, saveProgress } from './utils/storage';
import { Header } from './components/Header';
import { LessonView } from './components/LessonView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { SpeakingLabView } from './components/SpeakingLabView';
import { WordBankView } from './components/WordBankView';
import { SearchModal } from './components/SearchModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { Award, BookOpen, Layers, Sparkles, Mic, Heart, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'lessons' | 'flashcards' | 'quiz' | 'lab' | 'bank'>('lessons');
  // Default to Lesson 2: Family & Relationships as specifically requested by user
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

      {/* Main Content Area */}
      <main className="flex-1">
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

        {currentTab === 'lab' && (
          <SpeakingLabView showSinhala={showSinhala} />
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

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-800">IELTS Master Band 7+ Vocabulary</span>
            <p className="mt-0.5">With Sinhala translations for Speaking & Writing preparation.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentTab('lessons')} className="hover:text-slate-900">
              Lessons
            </button>
            <button onClick={() => setCurrentTab('flashcards')} className="hover:text-slate-900">
              Flashcards
            </button>
            <button onClick={() => setCurrentTab('quiz')} className="hover:text-slate-900">
              Quiz
            </button>
            <button onClick={() => setCurrentTab('bank')} className="hover:text-slate-900">
              Word Bank
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
