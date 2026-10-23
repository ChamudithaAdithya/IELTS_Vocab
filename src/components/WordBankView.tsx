import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Bookmark, 
  Volume2, 
  Printer, 
  ExternalLink
} from 'lucide-react';
import { ALL_WORDS, LESSONS } from '../data/lessons';
import { UserProgress } from '../types';

interface WordBankViewProps {
  showSinhala: boolean;
  userProgress: UserProgress;
  onToggleMastered: (wordId: string) => void;
  onToggleBookmark: (wordId: string) => void;
  onNavigateToWord: (lessonId: string, wordId: string) => void;
}

export const WordBankView: React.FC<WordBankViewProps> = ({
  showSinhala,
  userProgress,
  onToggleMastered,
  onToggleBookmark,
  onNavigateToWord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'saved' | 'mastered'>('all');

  const handlePronounce = (term: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(term);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const filteredWords = useMemo(() => {
    return ALL_WORDS.filter(w => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        w.term.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        w.sinhalaDefinition.includes(q) ||
        w.collocations.some(c => c.text.toLowerCase().includes(q) || c.sinhala.includes(q));

      const matchesLesson = selectedLesson === 'all' || w.lessonId === selectedLesson;

      let matchesStatus = true;
      if (filterStatus === 'saved') {
        matchesStatus = userProgress.bookmarkedWordIds.includes(w.id);
      } else if (filterStatus === 'mastered') {
        matchesStatus = userProgress.masteredWordIds.includes(w.id);
      }

      return matchesSearch && matchesLesson && matchesStatus;
    });
  }, [searchQuery, selectedLesson, filterStatus, userProgress]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Vocabulary Bank
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            All 80 target vocabulary words across 8 lessons.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words (English or සිංහල)..."
            className="w-full border border-slate-300 rounded pl-9 pr-3 py-1.5 text-sm text-slate-900 focus:outline-slate-400 font-sinhala"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-slate-400"
          >
            <option value="all">All Lessons</option>
            {LESSONS.map(l => (
              <option key={l.id} value={l.id}>
                Lesson {l.number}: {l.title}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-slate-400"
          >
            <option value="all">All ({ALL_WORDS.length})</option>
            <option value="saved">Saved ({userProgress.bookmarkedWordIds.length})</option>
            <option value="mastered">Learned ({userProgress.masteredWordIds.length})</option>
          </select>
        </div>
      </div>

      {/* Word List Table / Cards */}
      <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white overflow-hidden text-sm">
        {filteredWords.map((word) => {
          const isMastered = userProgress.masteredWordIds.includes(word.id);
          const isBookmarked = userProgress.bookmarkedWordIds.includes(word.id);

          return (
            <div key={word.id} className="p-4 hover:bg-slate-50 transition-colors space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">
                    {word.term}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handlePronounce(word.term)}
                    className="p-1 rounded text-slate-400 hover:text-slate-800"
                    title="Pronounce"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 italic">
                    ({word.partOfSpeech})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onToggleBookmark(word.id)}
                    className={`p-1 rounded ${isBookmarked ? 'text-amber-700' : 'text-slate-400 hover:text-slate-700'}`}
                    title="Save word"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToWord(word.lessonId, word.id)}
                    className="text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
                  >
                    <span>Lesson {word.lessonNumber}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {word.definition}
              </p>

              {showSinhala && (
                <p className="text-xs text-slate-600 font-sinhala">
                  {word.sinhalaDefinition}
                </p>
              )}
            </div>
          );
        })}

        {filteredWords.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            No vocabulary words matched your search.
          </div>
        )}
      </div>
    </div>
  );
};
