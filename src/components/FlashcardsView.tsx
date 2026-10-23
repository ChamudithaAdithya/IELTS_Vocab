import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  ArrowLeft,
  Bookmark
} from 'lucide-react';
import { Lesson, Word } from '../types';

interface FlashcardsViewProps {
  lesson: Lesson;
  allLessons: Lesson[];
  onSelectLesson: (id: string) => void;
  showSinhala: boolean;
  masteredWordIds: string[];
  bookmarkedWordIds: string[];
  onToggleMastered: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onBackToLesson: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  lesson,
  allLessons,
  onSelectLesson,
  showSinhala,
  masteredWordIds,
  bookmarkedWordIds,
  onToggleMastered,
  onToggleBookmark,
  onBackToLesson,
}) => {
  const [words, setWords] = useState<Word[]>(lesson.words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyAll, setStudyAll] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (studyAll) {
      const all = allLessons.flatMap(l => l.words);
      setWords(all);
    } else {
      setWords(lesson.words);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [lesson, studyAll, allLessons]);

  const currentWord = words[currentIndex] || words[0];
  const isMastered = currentWord ? masteredWordIds.includes(currentWord.id) : false;
  const isBookmarked = currentWord ? bookmarkedWordIds.includes(currentWord.id) : false;

  const handlePronounce = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % words.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setCurrentIndex(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [words.length]);

  if (!currentWord) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onBackToLesson}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lesson</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStudyAll(prev => !prev)}
            className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              studyAll 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {studyAll ? `All ${words.length} Words` : `Lesson ${lesson.number} (${lesson.words.length} words)`}
          </button>

          <button
            type="button"
            onClick={handleShuffle}
            className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
            title="Shuffle words"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-500 flex justify-between">
        <span>Card {currentIndex + 1} of {words.length}</span>
        <span>Press Space to flip, Arrows to navigate</span>
      </div>

      {/* Clean Flashcard */}
      <div
        onClick={() => setIsFlipped(prev => !prev)}
        className="w-full min-h-[320px] sm:min-h-[360px] bg-white rounded-lg border border-slate-300 p-8 cursor-pointer flex flex-col justify-between select-none shadow-2xs hover:border-slate-400 transition-colors"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 italic">
            ({currentWord.partOfSpeech})
          </span>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => handlePronounce(e, currentWord.term)}
              className={`p-1.5 rounded transition-colors ${
                isSpeaking ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Pronounce"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onToggleBookmark(currentWord.id)}
              className={`p-1.5 rounded ${isBookmarked ? 'text-amber-700' : 'text-slate-400 hover:text-slate-700'}`}
              title="Save word"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Card Content */}
        {!isFlipped ? (
          <div className="my-auto text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {currentWord.term}
            </h2>
            {currentWord.ipa && (
              <p className="text-xs text-slate-400 font-mono">
                {currentWord.ipa}
              </p>
            )}
            <p className="text-xs text-slate-400 pt-4">
              (Click to flip)
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-left my-auto text-sm">
            <div>
              <span className="font-semibold text-slate-900">Definition: </span>
              <span className="text-slate-800">{currentWord.definition}</span>
            </div>

            {showSinhala && (
              <div className="font-sinhala text-slate-700 pt-1">
                <span className="font-semibold text-slate-900">Sinhala: </span>
                <span>{currentWord.sinhalaDefinition}</span>
              </div>
            )}

            {currentWord.collocations.length > 0 && (
              <div className="pt-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-900 block mb-1">Collocations:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {currentWord.collocations.slice(0, 3).map((c, i) => (
                    <li key={i}>
                      {c.text} {showSinhala && <span className="font-sinhala">({c.sinhala})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentWord.exampleSentences[0] && (
              <div className="pt-2 border-t border-slate-100 space-y-0.5">
                <p className="text-xs text-slate-700 italic">
                  "{typeof currentWord.exampleSentences[0] === 'string' ? currentWord.exampleSentences[0] : currentWord.exampleSentences[0].en}"
                </p>
                {showSinhala && typeof currentWord.exampleSentences[0] !== 'string' && currentWord.exampleSentences[0].si && (
                  <p className="text-[11px] text-slate-500 font-sinhala">
                    {currentWord.exampleSentences[0].si}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Card Footer */}
        <div className="text-[11px] text-slate-400 text-center pt-2">
          {isFlipped ? 'Back' : 'Front'}
        </div>
      </div>

      {/* Nav Buttons */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={handlePrev}
          className="flex-1 py-2 rounded border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 flex items-center justify-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleMastered(currentWord.id)}
          className={`px-4 py-2 rounded font-medium border transition-colors ${
            isMastered
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {isMastered ? 'Learned ✓' : 'Mark learned'}
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-2 rounded bg-slate-900 text-white font-medium hover:bg-slate-800 flex items-center justify-center gap-1"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
