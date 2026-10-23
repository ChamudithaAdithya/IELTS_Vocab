import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Volume2, 
  BookOpen, 
  ExternalLink, 
  ArrowLeft, 
  Check, 
  Bookmark, 
  ChevronRight,
  Sliders
} from 'lucide-react';
import { Lesson, Word, UserProgress } from '../types';
import { ALL_WORDS } from '../data/lessons';
import { playSpeech, stopAllSpeech } from '../utils/speech';

// Dictionary of secondary advanced words appearing in collocations and example sentences
const COMMON_IELTS_LOOKUP: Record<string, { def: string; si: string; pos: string }> = {
  perseverance: {
    def: 'Persistence in doing something despite difficulty or delay in achieving success.',
    si: 'නොපසුබස්නා උත්සාහය / නොසැලී ඉදිරියට යාම',
    pos: 'noun'
  },
  profound: {
    def: 'Very great, intense, or having deep insight or impact.',
    si: 'ඉතා ගැඹුරු / දැවැන්ත බලපෑමක් ඇති',
    pos: 'adjective'
  },
  indispensable: {
    def: 'Absolutely necessary; essential.',
    si: 'නැතුවම බැරි / අත්‍යවශ්‍ය',
    pos: 'adjective'
  },
  eradicate: {
    def: 'Destroy completely; put an end to.',
    si: 'මුලිනුපුටා දැමීම / සහමුලින්ම නැති කිරීම',
    pos: 'verb'
  },
  stifle: {
    def: 'Restrain, suppress, or prevent the development of something.',
    si: 'මර්දනය කිරීම / යටපත් කිරීම',
    pos: 'verb'
  },
  mitigate: {
    def: 'Make less severe, serious, or painful.',
    si: 'අවම කිරීම / සමනය කිරීම',
    pos: 'verb'
  },
  paramount: {
    def: 'More important than anything else; supreme.',
    si: 'ප්‍රමුඛතම / අතිශය වැදගත්ම',
    pos: 'adjective'
  },
  ubiquitous: {
    def: 'Present, appearing, or found everywhere.',
    si: 'සැම තැනම පවතින / සර්වව්‍යාපී',
    pos: 'adjective'
  },
  curtail: {
    def: 'Reduce in extent or quantity; impose a restriction on.',
    si: 'සීමා කිරීම / කප්පාදු කිරීම',
    pos: 'verb'
  },
  bolster: {
    def: 'Support, strengthen, or prop up.',
    si: 'ශක්තිමත් කිරීම / රුකුල් දීම',
    pos: 'verb'
  },
  exorbitant: {
    def: 'Unreasonably high in price or cost.',
    si: 'අසාධාරණ ලෙස අධික (මිල/ගාස්තු)',
    pos: 'adjective'
  },
  instill: {
    def: 'Gradually but firmly establish an idea or attitude in a person\'s mind.',
    si: 'මනසෙහි කාවැද්දීම / පුරුදු කිරීම',
    pos: 'verb'
  },
  erode: {
    def: 'Gradually wear away, destroy, or diminish.',
    si: 'ක්‍රමයෙන් ක්ෂය වීම හෝ පිරිහීම',
    pos: 'verb'
  },
  thrive: {
    def: 'Grow or develop vigorously; flourish.',
    si: 'සරුසාරව වැඩීම / සමෘද්ධිමත් වීම',
    pos: 'verb'
  },
  prevalent: {
    def: 'Widespread in a particular area or at a particular time.',
    si: 'බහුලව පවතින / පැතිරී ගිය',
    pos: 'adjective'
  },
  foster: {
    def: 'Encourage or promote the development of something.',
    si: 'පෝෂණය කිරීම / දිරිගැන්වීම',
    pos: 'verb'
  },
  drastically: {
    def: 'In an extreme, severe, or radical way.',
    si: 'දැඩි ලෙස / අතිශයින්ම',
    pos: 'adverb'
  },
  deter: {
    def: 'Discourage someone from doing something by instilling doubt or fear.',
    si: 'වළක්වාලීම / පසුබෑමට ලක් කිරීම',
    pos: 'verb'
  },
  deplete: {
    def: 'Use up the supply or resources of something.',
    si: 'ක්ෂය කිරීම / අවසන් කර දැමීම',
    pos: 'verb'
  },
  decimate: {
    def: 'Kill, destroy, or remove a large percentage of something.',
    si: 'මහා පරිමාණයෙන් විනාශ කිරීම',
    pos: 'verb'
  },
  exacerbate: {
    def: 'Make a problem, bad situation, or negative feeling worse.',
    si: 'තවත් උග්‍ර කිරීම / තත්වය නරක අතට හැරවීම',
    pos: 'verb'
  },
  subsidize: {
    def: 'Support financially, paying part of the cost.',
    si: 'සහනාධාර ලබා දීම',
    pos: 'verb'
  },
  monotonous: {
    def: 'Dull, tedious, and repetitious; lacking in variety.',
    si: 'ඒකාකාරී / නීරස',
    pos: 'adjective'
  },
  disproportionate: {
    def: 'Too large or too small in comparison for something else.',
    si: 'අසමානුපාතික / ප්‍රමාණයට වඩා වැඩි හෝ අඩු',
    pos: 'adjective'
  },
  endow: {
    def: 'Provide with a quality, ability, or asset.',
    si: 'හිමිකර දීම / දායාද කිරීම',
    pos: 'verb'
  },
  harmonious: {
    def: 'Forming a pleasing or consistent whole; free from disagreement.',
    si: 'සුසංයෝගී / එකමුතු හා සාමකාමී',
    pos: 'adjective'
  }
};

interface LessonRightSidebarProps {
  lesson: Lesson;
  allLessons?: Lesson[];
  showSinhala: boolean;
  userProgress?: UserProgress;
  onScrollToWord: (wordId: string) => void;
  onSelectLesson?: (lessonId: string) => void;
  onOpenVoiceSettings?: () => void;
  onCloseMobileDrawer?: () => void;
}

export const LessonRightSidebar: React.FC<LessonRightSidebarProps> = ({
  lesson,
  allLessons = [],
  showSinhala,
  userProgress,
  onScrollToWord,
  onSelectLesson,
  onOpenVoiceSettings,
  onCloseMobileDrawer,
}) => {
  const [query, setQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [selectedSecondary, setSelectedSecondary] = useState<{
    word: string;
    def: string;
    si: string;
    pos: string;
  } | null>(null);
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const cleanQuery = query.toLowerCase().trim();

  // Pronounce word
  const handlePronounce = (term: string) => {
    if (playingWord === term) {
      stopAllSpeech();
      setPlayingWord(null);
      return;
    }

    playSpeech(term, {
      onStart: () => setPlayingWord(term),
      onEnd: () => setPlayingWord(null),
      onError: () => setPlayingWord(null),
    });
  };

  // Filter current lesson words
  const lessonMatches = lesson.words.filter(w => {
    if (!cleanQuery) return true;
    return (
      w.term.toLowerCase().includes(cleanQuery) ||
      w.definition.toLowerCase().includes(cleanQuery) ||
      w.sinhalaDefinition.toLowerCase().includes(cleanQuery) ||
      w.collocations.some(c => c.text.toLowerCase().includes(cleanQuery) || c.sinhala.toLowerCase().includes(cleanQuery)) ||
      w.exampleSentences.some(s => s.en.toLowerCase().includes(cleanQuery) || s.si.toLowerCase().includes(cleanQuery))
    );
  });

  // Filter other lessons words if query exists
  const otherLessonsMatches = cleanQuery
    ? ALL_WORDS.filter(w => 
        !lesson.words.some(lw => lw.id === w.id) &&
        (w.term.toLowerCase().includes(cleanQuery) ||
         w.definition.toLowerCase().includes(cleanQuery) ||
         w.sinhalaDefinition.toLowerCase().includes(cleanQuery))
      ).slice(0, 5)
    : [];

  // Filter secondary vocabulary dictionary
  const secondaryMatches = cleanQuery
    ? Object.entries(COMMON_IELTS_LOOKUP)
        .filter(([word, data]) => 
          word.includes(cleanQuery) ||
          data.def.toLowerCase().includes(cleanQuery) ||
          data.si.toLowerCase().includes(cleanQuery)
        )
        .map(([word, data]) => ({ word, ...data }))
        .slice(0, 4)
    : [];

  const handleSelectWord = (w: Word) => {
    setSelectedWord(w);
    setSelectedSecondary(null);
  };

  const handleSelectSecondary = (item: { word: string; def: string; si: string; pos: string }) => {
    setSelectedSecondary(item);
    setSelectedWord(null);
  };

  const handleGoToCard = (wordId: string) => {
    onScrollToWord(wordId);
    if (onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const handleGoToOtherLesson = (targetLessonId: string, wordId: string) => {
    if (onSelectLesson) {
      onSelectLesson(targetLessonId);
      setTimeout(() => {
        onScrollToWord(wordId);
      }, 150);
      if (onCloseMobileDrawer) {
        onCloseMobileDrawer();
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col h-full max-h-[calc(100vh-7rem)] overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/75">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate">
              Lookup Word Meaning
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenVoiceSettings && (
              <button
                type="button"
                onClick={onOpenVoiceSettings}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors"
                title="Pronunciation Voice & Audio Settings"
                aria-label="Voice settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            )}

            {onCloseMobileDrawer && (
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors"
                aria-label="Close word lookup"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
          <span className="truncate">Lesson {lesson.number}: {lesson.title}</span>
          <span className="font-semibold text-slate-700">{lesson.words.length} words</span>
        </div>

        {/* Search Input */}
        <div className="relative mt-2.5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search word, meaning, or sentence..."
            className="w-full text-xs bg-white border border-slate-300 rounded-md pl-8 pr-7 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-slate-500 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
        {/* DETAIL VIEW: When a specific word is selected for in-depth inspection */}
        {selectedWord ? (
          <div className="space-y-3.5 pt-1 pb-2">
            <button
              type="button"
              onClick={() => setSelectedWord(null)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all {lesson.words.length} words</span>
            </button>

            {/* Word Header */}
            <div className="border border-slate-200 rounded-md p-3 bg-slate-50/50 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-slate-900">
                      {selectedWord.term}
                    </span>
                    <span className="text-xs text-slate-500 italic">
                      ({selectedWord.partOfSpeech})
                    </span>
                  </div>
                  {selectedWord.ipa && (
                    <span className="text-xs text-slate-400 font-mono block mt-0.5">
                      {selectedWord.ipa}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handlePronounce(selectedWord.term)}
                  className={`p-1.5 rounded border transition-colors ${
                    playingWord === selectedWord.term
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Listen to pronunciation"
                  aria-label={`Pronounce ${selectedWord.term}`}
                >
                  <Volume2 className={`w-4 h-4 ${playingWord === selectedWord.term ? 'animate-pulse text-blue-700' : ''}`} />
                </button>
              </div>

              {/* Band badge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  {selectedWord.bandLevel}
                </span>
                {userProgress?.masteredWordIds.includes(selectedWord.id) && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Learned
                  </span>
                )}
              </div>

              {/* English Definition */}
              <div className="pt-2 border-t border-slate-200 text-xs">
                <p className="font-semibold text-slate-700">English Definition:</p>
                <p className="text-slate-800 mt-0.5 leading-relaxed">
                  {selectedWord.definition}
                </p>
              </div>

              {/* Sinhala Meaning */}
              {showSinhala && (
                <div className="pt-2 border-t border-slate-200 text-xs">
                  <p className="font-semibold text-slate-700">සිංහල තේරුම (Sinhala Meaning):</p>
                  <p className="font-sinhala font-medium text-slate-900 mt-0.5 leading-relaxed bg-white border border-slate-200 rounded p-2">
                    {selectedWord.sinhalaDefinition}
                  </p>
                </div>
              )}

              {/* Action to Jump to Card */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleGoToCard(selectedWord.id)}
                  className="w-full py-1.5 px-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Go to full card in lesson</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Collocations */}
            {selectedWord.collocations.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-800">
                  Band 7+ Collocations:
                </p>
                <div className="space-y-1">
                  {selectedWord.collocations.map((col, idx) => (
                    <div key={idx} className="p-2 border border-slate-200 rounded bg-white text-xs">
                      <p className="font-semibold text-slate-900">{col.text}</p>
                      {showSinhala && (
                        <p className="text-slate-600 font-sinhala text-[11px] mt-0.5">
                          {col.sinhala}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Example Sentences */}
            {selectedWord.exampleSentences.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-800">
                  Example Sentences:
                </p>
                <div className="space-y-1.5">
                  {selectedWord.exampleSentences.map((sent, idx) => (
                    <div key={idx} className="p-2 border border-slate-200 rounded bg-white text-xs space-y-0.5">
                      <p className="text-slate-800 italic">"{sent.en}"</p>
                      {showSinhala && (
                        <p className="text-slate-600 font-sinhala text-[11px]">
                          {sent.si}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : selectedSecondary ? (
          /* DETAIL VIEW: Secondary word dictionary inspection */
          <div className="space-y-3 pt-1 pb-2">
            <button
              type="button"
              onClick={() => setSelectedSecondary(null)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to word list</span>
            </button>

            <div className="border border-slate-200 rounded-md p-3 bg-slate-50/50 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">
                      {selectedSecondary.word}
                    </span>
                    <span className="text-xs text-slate-500 italic">
                      ({selectedSecondary.pos})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    IELTS Vocabulary
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handlePronounce(selectedSecondary.word)}
                  className={`p-1.5 rounded border transition-colors ${
                    playingWord === selectedSecondary.word
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Listen to pronunciation"
                  aria-label={`Pronounce ${selectedSecondary.word}`}
                >
                  <Volume2 className={`w-4 h-4 ${playingWord === selectedSecondary.word ? 'animate-pulse text-blue-700' : ''}`} />
                </button>
              </div>

              {/* Definition */}
              <div className="pt-2 border-t border-slate-200 text-xs">
                <p className="font-semibold text-slate-700">English Definition:</p>
                <p className="text-slate-800 mt-0.5 leading-relaxed">
                  {selectedSecondary.def}
                </p>
              </div>

              {/* Sinhala Meaning */}
              {showSinhala && (
                <div className="pt-2 border-t border-slate-200 text-xs">
                  <p className="font-semibold text-slate-700">සිංහල තේරුම (Sinhala Meaning):</p>
                  <p className="font-sinhala font-medium text-slate-900 mt-0.5 leading-relaxed bg-white border border-slate-200 rounded p-2">
                    {selectedSecondary.si}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* DEFAULT & SEARCH LIST VIEW */
          <div className="space-y-4 pt-1">
            {/* Section: Words in Current Lesson */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider pb-1">
                <span>Words in This Lesson ({lessonMatches.length})</span>
                {cleanQuery && <span>Filtered</span>}
              </div>

              {lessonMatches.length === 0 ? (
                <p className="text-xs text-slate-500 py-2 italic text-center">
                  No lesson words matched "{query}"
                </p>
              ) : (
                <div className="space-y-1.5">
                  {lessonMatches.map((w, idx) => {
                    const isMastered = userProgress?.masteredWordIds.includes(w.id);
                    const isBookmarked = userProgress?.bookmarkedWordIds.includes(w.id);

                    return (
                      <div
                        key={w.id}
                        className="group border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/60 rounded-md p-2 transition-all cursor-pointer"
                        onClick={() => handleSelectWord(w)}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 w-3.5 shrink-0">
                              {lesson.words.findIndex(item => item.id === w.id) + 1}.
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {w.term}
                            </span>
                            <span className="text-[10px] text-slate-500 italic shrink-0">
                              ({w.partOfSpeech})
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Pronounce Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePronounce(w.term);
                              }}
                              className={`p-1 rounded transition-colors ${
                                playingWord === w.term
                                  ? 'text-blue-700 bg-blue-50'
                                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                              }`}
                              title={`Listen to ${w.term}`}
                              aria-label={`Pronounce ${w.term}`}
                            >
                              <Volume2 className={`w-3.5 h-3.5 ${playingWord === w.term ? 'animate-pulse text-blue-700' : ''}`} />
                            </button>

                            {/* Jump to card directly */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGoToCard(w.id);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                              title="Scroll to word card in lesson"
                              aria-label="Scroll to card"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Sinhala Meaning */}
                        {showSinhala && (
                          <p className="font-sinhala text-[11px] text-slate-700 mt-1 line-clamp-1 pl-5">
                            {w.sinhalaDefinition}
                          </p>
                        )}

                        {/* Quick definition preview */}
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 pl-5">
                          {w.definition}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section: Secondary Words Dictionary (matches from example sentences/collocations) */}
            {cleanQuery && secondaryMatches.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pb-1">
                  Common IELTS Collocation Words ({secondaryMatches.length})
                </div>

                <div className="space-y-1.5">
                  {secondaryMatches.map((item) => (
                    <div
                      key={item.word}
                      onClick={() => handleSelectSecondary(item)}
                      className="border border-slate-200 hover:border-slate-400 bg-white rounded-md p-2 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">
                            {item.word}
                          </span>
                          <span className="text-[10px] text-slate-500 italic">
                            ({item.pos})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePronounce(item.word);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-800 rounded"
                          title="Listen to pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {showSinhala && (
                        <p className="font-sinhala text-[11px] text-slate-700 mt-0.5 line-clamp-1">
                          {item.si}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.def}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Other IELTS Lessons (cross-lesson lookup) */}
            {cleanQuery && otherLessonsMatches.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pb-1">
                  In Other IELTS Lessons ({otherLessonsMatches.length})
                </div>

                <div className="space-y-1.5">
                  {otherLessonsMatches.map((ow) => {
                    // Find which lesson it belongs to
                    const parentLesson = allLessons.find(l => l.words.some(w => w.id === ow.id));

                    return (
                      <div
                        key={ow.id}
                        className="border border-slate-200 hover:border-slate-400 bg-white rounded-md p-2 transition-all"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {ow.term}
                            </span>
                            <span className="text-[10px] text-slate-500 italic">
                              ({ow.partOfSpeech})
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handlePronounce(ow.term)}
                              className="p-1 text-slate-400 hover:text-slate-800 rounded"
                              title="Listen"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>

                            {parentLesson && (
                              <button
                                type="button"
                                onClick={() => handleGoToOtherLesson(parentLesson.id, ow.id)}
                                className="text-[10px] font-semibold text-blue-700 hover:underline px-1 py-0.5"
                                title={`Open Lesson ${parentLesson.number}`}
                              >
                                L{parentLesson.number} →
                              </button>
                            )}
                          </div>
                        </div>

                        {showSinhala && (
                          <p className="font-sinhala text-[11px] text-slate-700 mt-0.5 line-clamp-1">
                            {ow.sinhalaDefinition}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
        <span>Click any word to inspect meaning, collocations & Sinhala</span>
      </div>
    </div>
  );
};
