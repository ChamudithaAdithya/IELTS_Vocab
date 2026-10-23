import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Volume2, BookOpen, ExternalLink } from 'lucide-react';
import { ALL_WORDS } from '../data/lessons';
import { playSpeech } from '../utils/speech';

// Dictionary of secondary advanced words appearing in collocations and example sentences
const COMMON_IELTS_LOOKUP: Record<string, { def: string; si: string; pos: string }> = {
  perseverance: {
    def: 'Persistence in doing something despite difficulty or delay in achieving success.',
    si: 'නොපසුබස්නා උත්සාහය / නොසැලී ඉදිරියට යාම',
    pos: 'noun'
  },
  profound: {
    def: 'Very great, intense, or having deep insight/meaning.',
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
    def: '(Of a price or amount charged) unreasonably high.',
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
    def: 'Kill, destroy, or remove a large percentage or proportion of.',
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

interface StickyWordLookupProps {
  showSinhala: boolean;
  onNavigateToTargetWord?: (lessonId: string, wordId: string) => void;
}

export const StickyWordLookup: React.FC<StickyWordLookupProps> = ({
  showSinhala,
  onNavigateToTargetWord,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanQuery = query.toLowerCase().trim();

  // Search in target vocabulary words & collocations
  const matchedTargetWords = cleanQuery
    ? ALL_WORDS.filter(w => 
        w.term.toLowerCase().includes(cleanQuery) ||
        w.collocations.some(c => c.text.toLowerCase().includes(cleanQuery))
      ).slice(0, 4)
    : [];

  // Search in secondary word dictionary
  const matchedSecondaryWords = cleanQuery
    ? Object.entries(COMMON_IELTS_LOOKUP)
        .filter(([word]) => word.includes(cleanQuery))
        .slice(0, 4)
    : [];

  const hasResults = matchedTargetWords.length > 0 || matchedSecondaryWords.length > 0;

  const handlePronounce = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    playSpeech(text);
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full sm:w-auto">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Lookup word meaning..."
          className="w-full sm:w-56 pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-slate-500 transition-all placeholder:text-slate-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Floating Meaning Card Popup */}
      {isOpen && cleanQuery.length > 1 && (
        <div className="absolute right-0 top-full mt-1.5 w-[calc(100vw-2.5rem)] max-w-sm sm:w-96 max-h-[75vh] overflow-y-auto bg-white border border-slate-300 rounded-lg shadow-xl p-3 z-50 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 text-slate-500 font-semibold text-[11px]">
            <span>Quick Vocabulary Lookup: "{query}"</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="hover:text-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. Target lesson words found */}
          {matchedTargetWords.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Target IELTS Words:
              </span>
              {matchedTargetWords.map(w => (
                <div key={w.id} className="p-2 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                      <span>{w.term}</span>
                      <button
                        type="button"
                        onClick={(e) => handlePronounce(e, w.term)}
                        className="text-slate-500 hover:text-slate-900 p-0.5"
                        title="Pronounce"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-slate-400 font-normal italic">
                        ({w.partOfSpeech})
                      </span>
                    </div>

                    {onNavigateToTargetWord && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigateToTargetWord(w.lessonId, w.id);
                          setIsOpen(false);
                        }}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-slate-700 leading-snug">{w.definition}</p>

                  {showSinhala && (
                    <p className="text-slate-600 font-sinhala font-medium text-[11px] pt-0.5">
                      {w.sinhalaDefinition}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 2. Secondary words appearing in collocations/sentences */}
          {matchedSecondaryWords.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Collocation / Sentence Words:
              </span>
              {matchedSecondaryWords.map(([wKey, info]) => (
                <div key={wKey} className="p-2 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900 text-sm capitalize">
                    <div className="flex items-center gap-1.5">
                      <span>{wKey}</span>
                      <button
                        type="button"
                        onClick={(e) => handlePronounce(e, wKey)}
                        className="text-slate-500 hover:text-slate-900 p-0.5"
                        title="Pronounce"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-slate-400 font-normal italic">
                        ({info.pos})
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 leading-snug">{info.def}</p>

                  {showSinhala && (
                    <p className="text-slate-600 font-sinhala font-medium text-[11px] pt-0.5">
                      {info.si}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Fallback when word is not in pre-defined set */}
          {!hasResults && (
            <div className="p-3 bg-slate-50 rounded text-center space-y-2">
              <p className="text-slate-600 text-xs">
                Word: <strong className="text-slate-900">"{query}"</strong>
              </p>
              <button
                type="button"
                onClick={(e) => handlePronounce(e, query)}
                className="px-3 py-1 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Pronunciation</span>
              </button>
              <p className="text-[11px] text-slate-500 pt-1">
                Tip: Type keywords like "perseverance", "profound", "mitigate", "curtail", or any lesson word.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
