import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Header, AppTab } from './components/Header';
import { WritingTutorView } from './components/WritingTutorView';
import { SpeakingTutorView } from './components/tutor/SpeakingTutorView';
import { ReadingTutorView } from './components/tutor/ReadingTutorView';
import { ListeningTutorView } from './components/tutor/ListeningTutorView';
import { AnalyticsView } from './components/tutor/AnalyticsView';
import { CambridgeLibraryView } from './components/tutor/CambridgeLibraryView';
import { loadTutorState } from './utils/tutorEngine';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
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
  // Default to Cambridge Past Papers Master Library
  const [currentTab, setCurrentTab] = useState<AppTab>('cambridge');
  const [showSinhala, setShowSinhala] = useState<boolean>(true);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

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

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans">
      {/* Top Header - Pure Cambridge Real Tests */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        showSinhala={showSinhala}
        setShowSinhala={setShowSinhala}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
      />

      {/* Main Dedicated Content Views */}
      <main className="flex-1">
        {/* Flagship: Cambridge Past Papers Central Library (Books 1 to 18) */}
        {currentTab === 'cambridge' && (
          <CambridgeLibraryView
            showSinhala={showSinhala}
            onSelectTest={(module) => setCurrentTab(module as AppTab)}
          />
        )}

        {/* Module 1: Listening Tests (Authentic CD Audio, Speed Controls, Instant Cambridge Diagnostic) */}
        {currentTab === 'listening' && (
          <ListeningTutorView 
            showSinhala={showSinhala} 
            onBackToHub={() => setCurrentTab('cambridge')}
          />
        )}

        {/* Module 2: Reading Tests (Dual-Pane Reader, Paragraph Markers, Line Citations & Explanations) */}
        {currentTab === 'reading' && (
          <ReadingTutorView 
            showSinhala={showSinhala} 
            onBackToHub={() => setCurrentTab('cambridge')}
          />
        )}

        {/* Module 3: Writing Tutor AI (Task 1 & 2 Prompts, Official Models & Weak Essay Markups) */}
        {currentTab === 'tutor' && (
          <WritingTutorView 
            showSinhala={showSinhala} 
            onNavigateToModule={(m) => setCurrentTab(m as AppTab)}
          />
        )}

        {/* Module 4: Speaking Tutor (Interviews, 1-Min Prep Countdown, Voice Recorder & Model Speech) */}
        {currentTab === 'speaking' && (
          <SpeakingTutorView 
            showSinhala={showSinhala} 
            onBackToHub={() => setCurrentTab('cambridge')}
          />
        )}

        {/* Module 5: Performance Analytics & Unified Cambridge Score Tracker */}
        {currentTab === 'analytics' && (
          <AnalyticsView 
            tutorState={loadTutorState()} 
            showSinhala={showSinhala} 
            onBackToHub={() => setCurrentTab('cambridge')}
            onNavigateToSection={(s) => setCurrentTab(s as AppTab)}
          />
        )}
      </main>

      {/* Voice & Pronunciation Settings Modal */}
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

      {/* Clean Global Footer - Dedicated to Cambridge Real Tests */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-800">Cambridge IELTS Master Exam Platform</span>
            <p className="mt-0.5">Authentic past papers from Books 1 to 18 with local audio streaming and bilingual Sinhala assistance.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => setCurrentTab('cambridge')} className="hover:text-slate-900 font-bold text-indigo-700">
              Cambridge Library
            </button>
            <button onClick={() => setCurrentTab('listening')} className="hover:text-slate-900">
              Listening
            </button>
            <button onClick={() => setCurrentTab('reading')} className="hover:text-slate-900">
              Reading
            </button>
            <button onClick={() => setCurrentTab('tutor')} className="hover:text-slate-900">
              Writing
            </button>
            <button onClick={() => setCurrentTab('speaking')} className="hover:text-slate-900">
              Speaking
            </button>
            <button onClick={() => setCurrentTab('analytics')} className="hover:text-slate-900">
              Analytics
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
