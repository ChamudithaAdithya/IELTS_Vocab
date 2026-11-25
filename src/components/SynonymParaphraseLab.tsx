import React, { useState, useMemo, useEffect } from 'react';
import {
  Shuffle,
  Check,
  Volume2,
  Search,
  AlertTriangle,
  Sparkles,
  BookOpen,
  RotateCcw,
  ArrowLeftRight
} from 'lucide-react';
import { LessonParaphraseSection, ParaphrasePairItem } from '../types';

interface SynonymParaphraseLabProps {
  sections: LessonParaphraseSection[];
  showSinhala: boolean;
  onPronounce: (text: string, id: string) => void;
  playingId: string | null;
}

const ROUND_SIZE = 6;

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const SynonymParaphraseLab: React.FC<SynonymParaphraseLabProps> = ({
  sections,
  showSinhala,
  onPronounce,
  playingId
}) => {
  const [activeMode, setActiveMode] = useState<'tables' | 'drill'>('drill');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');

  // Flatten all valid (non-distractor) pairs for the interactive matching drill
  const drillPool = useMemo(() => {
    const seen = new Set<string>();
    const list: (ParaphrasePairItem & { sectionTitle: string })[] = [];
    for (const sec of sections) {
      for (const item of sec.items) {
        if (item.isDistractor) continue;
        const dedupKey = `${item.leftText.toLowerCase()}::${item.rightText.toLowerCase()}`;
        if (seen.has(dedupKey)) continue;
        seen.add(dedupKey);
        list.push({ ...item, sectionTitle: sec.title });
      }
    }
    return list;
  }, [sections]);

  const totalPairsCount = useMemo(
    () => sections.reduce((sum, s) => sum + s.items.length, 0),
    [sections]
  );

  // Interactive Matching Drill State
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundItems, setRoundItems] = useState<(ParaphrasePairItem & { sectionTitle: string })[]>([]);
  const [shuffledRight, setShuffledRight] = useState<(ParaphrasePairItem & { sectionTitle: string })[]>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ leftId: string; rightId: string } | null>(null);
  const [streak, setStreak] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);

  const totalRounds = Math.max(1, Math.ceil(drillPool.length / ROUND_SIZE));

  const setupRound = (targetRoundIdx: number, randomizePool = false) => {
    if (drillPool.length === 0) return;
    const source = randomizePool ? shuffleArray(drillPool) : drillPool;
    const safeIdx = ((targetRoundIdx % totalRounds) + totalRounds) % totalRounds;
    const start = safeIdx * ROUND_SIZE;
    let slice = source.slice(start, start + ROUND_SIZE);
    if (slice.length < Math.min(ROUND_SIZE, source.length)) {
      slice = source.slice(0, Math.min(ROUND_SIZE, source.length));
    }
    setRoundIndex(safeIdx);
    setRoundItems(slice);
    setShuffledRight(shuffleArray(slice));
    setSelectedLeftId(null);
    setMatchedIds([]);
    setWrongPair(null);
    setMistakesCount(0);
  };

  useEffect(() => {
    setupRound(0, false);
    setStreak(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drillPool]);

  const handleSelectLeft = (item: ParaphrasePairItem) => {
    if (matchedIds.includes(item.id)) return;
    setWrongPair(null);
    setSelectedLeftId(prev => (prev === item.id ? null : item.id));
  };

  const handleSelectRight = (rightItem: ParaphrasePairItem) => {
    if (!selectedLeftId || matchedIds.includes(rightItem.id)) return;

    if (selectedLeftId === rightItem.id) {
      const nextMatched = [...matchedIds, rightItem.id];
      setMatchedIds(nextMatched);
      setSelectedLeftId(null);
      setWrongPair(null);
      setStreak(s => s + 1);
      onPronounce(`${rightItem.leftText}. ${rightItem.rightText}`, `match-${rightItem.id}`);
    } else {
      setWrongPair({ leftId: selectedLeftId, rightId: rightItem.id });
      setStreak(0);
      setMistakesCount(m => m + 1);
      setTimeout(() => {
        setWrongPair(curr =>
          curr && curr.leftId === selectedLeftId && curr.rightId === rightItem.id ? null : curr
        );
      }, 900);
    }
  };

  const isRoundComplete = roundItems.length > 0 && matchedIds.length === roundItems.length;

  const filteredSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return sections
      .filter(s => selectedSectionFilter === 'all' || s.id === selectedSectionFilter)
      .map(sec => ({
        ...sec,
        items: !q
          ? sec.items
          : sec.items.filter(
              it =>
                it.leftText.toLowerCase().includes(q) ||
                it.rightText.toLowerCase().includes(q) ||
                (it.leftSinhala && it.leftSinhala.includes(q)) ||
                (it.rightSinhala && it.rightSinhala.includes(q))
            )
      }))
      .filter(sec => sec.items.length > 0);
  }, [sections, selectedSectionFilter, searchQuery]);

  return (
    <section
      id="synonym-paraphrase-lab"
      className="bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/50 border border-indigo-200/80 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xs scroll-mt-20"
    >
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold uppercase tracking-wider">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>IELTS Reading Paraphrase &amp; Synonym Mastery · {totalPairsCount} Pairs</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Synonyms &amp; Question-vs-Passage Paraphrases
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            IELTS Reading questions rarely repeat exact words—train your eye to spot instant synonym &amp; phrase equivalents.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveMode('drill')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'drill'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Match</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('tables')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'tables'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>All Tables ({totalPairsCount})</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODE 1: INTERACTIVE SYNONYM & PARAPHRASE MATCHING DRILL           */}
      {/* ================================================================= */}
      {activeMode === 'drill' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3.5 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-slate-800">
                Round {roundIndex + 1} of {totalRounds}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Matched: {matchedIds.length}/{roundItems.length}
              </span>
              {streak >= 2 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  🔥 {streak} Streak
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setupRound(roundIndex, false)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setupRound(roundIndex + 1, false)}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Next Set →</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            1. Click a <strong>Word / Question Phrase</strong> on the left · 2. Click its matching{' '}
            <strong>IELTS Synonym / Passage Paraphrase</strong> on the right.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Question / Passage Words */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
                Word / Question Wording
              </div>
              {roundItems.map(item => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedLeftId === item.id;
                const isWrong = wrongPair?.leftId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handleSelectLeft(item)}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-start justify-between gap-2 cursor-pointer ${
                      isMatched
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 opacity-80 cursor-default'
                        : isWrong
                        ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-200'
                        : isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                        : 'bg-white hover:bg-indigo-50/50 border-slate-200 hover:border-indigo-300 text-slate-900'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold leading-snug">{item.leftText}</div>
                      {showSinhala && item.leftSinhala && (
                        <div
                          className={`text-xs font-sinhala ${
                            isSelected ? 'text-indigo-100' : 'text-slate-500'
                          }`}
                        >
                          {item.leftSinhala}
                        </div>
                      )}
                    </div>
                    {isMatched && <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Right Column: Shuffled Synonyms / Passage Paraphrases */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
                Matching Synonym / Passage Wording
              </div>
              {shuffledRight.map(item => {
                const isMatched = matchedIds.includes(item.id);
                const isWrong = wrongPair?.rightId === item.id;

                return (
                  <button
                    key={`right-${item.id}`}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handleSelectRight(item)}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-start justify-between gap-2 ${
                      isMatched
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 opacity-80 cursor-default'
                        : isWrong
                        ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-200 cursor-pointer'
                        : selectedLeftId
                        ? 'bg-white hover:bg-emerald-50/60 border-indigo-200 hover:border-emerald-400 text-slate-900 cursor-pointer shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-800 cursor-pointer hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-semibold leading-snug">{item.rightText}</div>
                      {showSinhala && (isMatched || item.rightSinhala) && item.rightSinhala && (
                        <div className="text-xs font-sinhala text-slate-500">
                          {item.rightSinhala}
                        </div>
                      )}
                    </div>
                    {isMatched && <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {isRoundComplete && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-emerald-900">
                  🎉 Round {roundIndex + 1} Complete!{' '}
                  {mistakesCount === 0
                    ? '100% Flawless First-Try Accuracy!'
                    : `Completed with ${mistakesCount} retry${mistakesCount > 1 ? 's' : ''}.`}
                </p>
                <p className="text-xs text-emerald-700">
                  Keep drilling the remaining sets to lock every IELTS Reading paraphrase into memory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setupRound(roundIndex + 1, false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shrink-0 shadow-xs"
              >
                Start Round {((roundIndex + 1) % totalRounds) + 1} →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* MODE 2: COMPLETE REFERENCE TABLES & EXAMINER TRAP NOTES           */}
      {/* ================================================================= */}
      {activeMode === 'tables' && (
        <div className="space-y-5">
          {/* Search & Section Filter */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search synonyms, paraphrases, or සිංහල meanings..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-indigo-500 font-sinhala"
              />
            </div>
            <select
              value={selectedSectionFilter}
              onChange={e => setSelectedSectionFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="all">All Tables ({sections.length})</option>
              {sections.map(sec => (
                <option key={sec.id} value={sec.id}>
                  {sec.title}
                </option>
              ))}
            </select>
          </div>

          {filteredSections.map(sec => (
            <div
              key={sec.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{sec.title}</h3>
                {sec.subtitle && <p className="text-xs text-slate-600">{sec.subtitle}</p>}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      <th className="py-2.5 px-4 w-[42%]">{sec.leftColumnLabel}</th>
                      <th className="py-2.5 px-4 w-[42%]">{sec.rightColumnLabel}</th>
                      <th className="py-2.5 px-3 w-[16%]">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sec.items.map(item => (
                      <tr
                        key={item.id}
                        className={
                          item.isDistractor
                            ? 'bg-amber-50/50 hover:bg-amber-50'
                            : 'hover:bg-indigo-50/30 transition-colors'
                        }
                      >
                        <td className="py-3 px-4 align-top space-y-0.5">
                          <div className="flex items-start gap-1.5">
                            <span className="font-bold text-slate-900">{item.leftText}</span>
                            <button
                              type="button"
                              onClick={() => onPronounce(item.leftText, `tbl-l-${item.id}`)}
                              className="p-0.5 rounded text-slate-400 hover:text-indigo-600 shrink-0 cursor-pointer"
                              title="Pronounce"
                            >
                              <Volume2
                                className={`w-3.5 h-3.5 ${
                                  playingId === `tbl-l-${item.id}` ? 'text-indigo-600 animate-pulse' : ''
                                }`}
                              />
                            </button>
                          </div>
                          {showSinhala && item.leftSinhala && (
                            <div className="text-xs text-slate-600 font-sinhala">
                              {item.leftSinhala}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 align-top space-y-0.5">
                          <div className="flex items-start gap-1.5">
                            <span
                              className={`font-semibold ${
                                item.isDistractor ? 'text-amber-800 italic' : 'text-emerald-800'
                              }`}
                            >
                              {item.rightText}
                            </span>
                            {!item.isDistractor && (
                              <button
                                type="button"
                                onClick={() => onPronounce(item.rightText, `tbl-r-${item.id}`)}
                                className="p-0.5 rounded text-slate-400 hover:text-emerald-600 shrink-0 cursor-pointer"
                                title="Pronounce"
                              >
                                <Volume2
                                  className={`w-3.5 h-3.5 ${
                                    playingId === `tbl-r-${item.id}`
                                      ? 'text-emerald-600 animate-pulse'
                                      : ''
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                          {showSinhala && item.rightSinhala && (
                            <div className="text-xs text-slate-600 font-sinhala">
                              {item.rightSinhala}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 align-top">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              item.isDistractor
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}
                          >
                            {item.relationship || 'Synonym'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sec.notes && sec.notes.length > 0 && (
                <div className="p-3.5 bg-amber-50/70 border-t border-amber-200/80 space-y-1.5 text-xs text-amber-950">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>IELTS Examiner Reading Insights:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-amber-900">
                    {sec.notes.map((n, idx) => (
                      <li key={idx}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
