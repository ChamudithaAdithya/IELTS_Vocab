import React, { useState, useEffect } from 'react';
import { Search, X, Volume2 } from 'lucide-react';
import { ALL_WORDS } from '../data/lessons';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  showSinhala: boolean;
  onSelectWord: (lessonId: string, wordId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  showSinhala,
  onSelectWord,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handlePronounce = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const results = !query.trim()
    ? ALL_WORDS.slice(0, 5)
    : ALL_WORDS.filter(w => {
        const q = query.toLowerCase().trim();
        return (
          w.term.toLowerCase().includes(q) ||
          w.definition.toLowerCase().includes(q) ||
          w.sinhalaDefinition.includes(q) ||
          w.collocations.some(c => c.text.toLowerCase().includes(q) || c.sinhala.includes(q))
        );
      }).slice(0, 10);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 pt-16 sm:pt-20"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-xl border border-slate-300 shadow-lg overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3 border-b border-slate-200 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vocabulary (English or සිංහල)..."
            className="w-full text-sm text-slate-900 focus:outline-hidden placeholder-slate-400 font-sinhala"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto divide-y divide-slate-100 p-2 text-sm">
          {results.map((word) => (
            <div
              key={word.id}
              onClick={() => {
                onSelectWord(word.lessonId, word.id);
                onClose();
              }}
              className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {word.term}
                  </span>
                  <span className="text-xs text-slate-400 italic">
                    ({word.partOfSpeech})
                  </span>
                  <span className="text-xs text-slate-500">
                    · Lesson {word.lessonNumber}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-1">
                  {word.definition}
                </p>

                {showSinhala && (
                  <p className="text-xs text-slate-600 font-sinhala">
                    {word.sinhalaDefinition}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => handlePronounce(e, word.term)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded shrink-0"
                title="Pronounce"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {results.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              No vocabulary words matched "{query}".
            </div>
          )}
        </div>

        <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400 flex items-center justify-between px-3">
          <span>Search in English or Sinhala</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
