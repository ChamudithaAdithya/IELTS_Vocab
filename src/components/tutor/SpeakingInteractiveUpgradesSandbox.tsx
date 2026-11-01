import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Plus,
  X,
  TrendingUp,
  Award,
  ChevronDown,
  Info
} from 'lucide-react';
import type { EssaySegment } from '../../types/tutor';
import type { SpeakingCriterionKey, SpeakingUpgradeDetailItem } from '../../types/speakingTutor';
import { roundIeltsBand, formatBand } from '../../utils/tutorEngine';
import { SPOKEN_BAND8_UPGRADES, generateSpokenUpgradeSegments } from '../../utils/speakingEngine';

interface SpeakingInteractiveUpgradesSandboxProps {
  spokenText: string;
  segments: EssaySegment[];
  stage2Criteria: { FC: number; LR: number; GRA: number; PR: number };
  stage2Band: number;
  showSinhala: boolean;
}

export const SpeakingInteractiveUpgradesSandbox: React.FC<SpeakingInteractiveUpgradesSandboxProps> = ({
  spokenText,
  segments,
  stage2Criteria,
  stage2Band,
  showSinhala
}) => {
  // Validate segments: ensure we don't have monolithic blocks > 18 words
  const effectiveSegments = useMemo<EssaySegment[]>(() => {
    if (!segments || segments.length === 0) {
      return generateSpokenUpgradeSegments(spokenText);
    }
    const hasMonolithicBlock = segments.some(s => {
      const origWords = (s.text || '').trim().split(/\s+/).filter(Boolean).length;
      const replWords = (s.to || '').trim().split(/\s+/).filter(Boolean).length;
      return (s.type === 'replace' && (origWords > 18 || replWords > 22));
    });

    if (hasMonolithicBlock) {
      return generateSpokenUpgradeSegments(spokenText);
    }
    return segments;
  }, [segments, spokenText]);

  // Extract upgrade items
  const upgradeItems = useMemo<SpeakingUpgradeDetailItem[]>(() => {
    const items: SpeakingUpgradeDetailItem[] = [];
    let count = 0;

    for (const seg of effectiveSegments) {
      if (seg.type === 'replace' && seg.to) {
        count++;
        const id = `spk-upg-${count}`;
        const key = seg.text.toLowerCase().trim();
        const matched = SPOKEN_BAND8_UPGRADES[key];

        const criterion: SpeakingCriterionKey = matched?.criterion || (count % 3 === 0 ? 'FC' : count % 2 === 0 ? 'GRA' : 'LR');
        const originalCritique = matched?.critique || `"${seg.text}" is basic everyday conversational English. Examiners expect higher lexical precision in IELTS Speaking.`;
        const originalCritiqueSi = matched?.critiqueSi || `"${seg.text}" යනු එදිනෙදා භාවිත වන සරල කථන යෙදුමකි.`;
        const upgradeValue = matched?.value || `Upgrades to "${seg.to}", demonstrating Band 8 spoken fluency and natural idiomatic expression.`;
        const upgradeValueSi = matched?.valueSi || `"${seg.to}" යොදා Band 8 කථන චතුරතාව සහ උසස් වාග්කෝෂය තහවුරු කරයි.`;

        items.push({
          id,
          type: 'replace',
          originalText: seg.text,
          upgradedText: seg.to,
          criterion,
          originalCritique,
          originalCritiqueSi,
          upgradeValue,
          upgradeValueSi,
          note: seg.note
        });
      }
    }
    return items;
  }, [effectiveSegments]);

  // Active upgrades state (initially all active)
  const [activeUpgradeIds, setActiveUpgradeIds] = useState<Set<string>>(() => {
    return new Set(upgradeItems.map(i => i.id));
  });

  // Keep activeUpgradeIds synchronized when upgradeItems changes
  useEffect(() => {
    setActiveUpgradeIds(new Set(upgradeItems.map(i => i.id)));
  }, [upgradeItems]);

  // Collapsible criteria drawer
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Hover state for interactive tooltips
  const [hovered, setHovered] = useState<{ id: string; target: 'striked' | 'added' } | null>(null);

  const toggleUpgrade = (id: string) => {
    setActiveUpgradeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const applyAll = () => {
    setActiveUpgradeIds(new Set(upgradeItems.map(i => i.id)));
  };

  const revertAll = () => {
    setActiveUpgradeIds(new Set());
  };

  // Dynamic live score simulation
  const { currentBand, currentCriteria, totalBoost } = useMemo(() => {
    let fcBoost = 0;
    let lrBoost = 0;
    let graBoost = 0;
    let prBoost = 0;

    for (const item of upgradeItems) {
      if (activeUpgradeIds.has(item.id)) {
        if (item.criterion === 'FC') fcBoost += 0.25;
        else if (item.criterion === 'LR') lrBoost += 0.25;
        else if (item.criterion === 'GRA') graBoost += 0.25;
        else if (item.criterion === 'PR') prBoost += 0.25;
      }
    }

    const simFC = Math.min(9.0, stage2Criteria.FC + fcBoost);
    const simLR = Math.min(9.0, stage2Criteria.LR + lrBoost);
    const simGRA = Math.min(9.0, stage2Criteria.GRA + graBoost);
    const simPR = Math.min(9.0, stage2Criteria.PR + prBoost);

    const calculatedOverall = roundIeltsBand([simFC, simLR, simGRA, simPR]);
    const boostVal = Math.max(0, calculatedOverall - stage2Band);

    return {
      currentBand: calculatedOverall,
      currentCriteria: { FC: simFC, LR: simLR, GRA: simGRA, PR: simPR },
      totalBoost: boostVal
    };
  }, [upgradeItems, activeUpgradeIds, stage2Criteria, stage2Band]);

  // Map segments with their corresponding upgrade item
  const mappedSegments = useMemo(() => {
    let itemIdx = 0;
    return effectiveSegments.map(s => {
      if (s.type === 'replace') {
        const item = upgradeItems[itemIdx++];
        return { segment: s, upgradeItem: item };
      }
      return { segment: s, upgradeItem: null };
    });
  }, [effectiveSegments, upgradeItems]);

  const activeCount = activeUpgradeIds.size;
  const totalCount = upgradeItems.length;

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------- */}
      {/* ULTRA-COMPACT FLOATING STICKY SCORE HUD (Exact Stage 3 UI)    */}
      {/* ------------------------------------------------------------- */}
      <div className="sticky top-2 z-30 transition-all duration-200">
        <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl shadow-xl px-3.5 py-2 sm:px-4 sm:py-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Live Score Display */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-baseline gap-1.5 bg-white/10 px-2.5 py-1 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  Live Spoken Band
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-white leading-none">
                  {formatBand(currentBand)}
                </span>
                {totalBoost > 0 && (
                  <span className="text-xs font-bold font-mono text-emerald-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    +{totalBoost.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Criteria Pills: FC, LR, GRA, PR */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono">
                <span className={`px-2 py-0.5 rounded-md font-bold transition-colors ${currentCriteria.FC > stage2Criteria.FC ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40' : 'bg-white/5 text-slate-400'}`}>
                  FC {formatBand(currentCriteria.FC)}
                </span>
                <span className={`px-2 py-0.5 rounded-md font-bold transition-colors ${currentCriteria.LR > stage2Criteria.LR ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40' : 'bg-white/5 text-slate-400'}`}>
                  LR {formatBand(currentCriteria.LR)}
                </span>
                <span className={`px-2 py-0.5 rounded-md font-bold transition-colors ${currentCriteria.GRA > stage2Criteria.GRA ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40' : 'bg-white/5 text-slate-400'}`}>
                  GRA {formatBand(currentCriteria.GRA)}
                </span>
                <span className={`px-2 py-0.5 rounded-md font-bold transition-colors ${currentCriteria.PR > stage2Criteria.PR ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40' : 'bg-white/5 text-slate-400'}`}>
                  PR {formatBand(currentCriteria.PR)}
                </span>
              </div>
            </div>

            {/* Controls: Revert All / Apply All + Drawer Toggle */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] text-slate-400 hidden md:inline font-sans">
                Active: <strong className="text-white font-mono">{activeCount}/{totalCount}</strong>
              </span>

              {activeCount < totalCount ? (
                <button
                  type="button"
                  onClick={applyAll}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  <span>Apply All</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={revertAll}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Revert All</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsExpanded(prev => !prev)}
                className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs ${isExpanded ? 'bg-white/10 text-white' : ''}`}
                title="Toggle detailed criteria progress bars"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Collapsible Details Drawer */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs animate-in fade-in duration-150">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Fluency & Coherence</span>
                  <span className="font-bold font-mono text-white">{formatBand(currentCriteria.FC)}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(currentCriteria.FC / 9) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Lexical Resource</span>
                  <span className="font-bold font-mono text-white">{formatBand(currentCriteria.LR)}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(currentCriteria.LR / 9) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Grammar Accuracy</span>
                  <span className="font-bold font-mono text-white">{formatBand(currentCriteria.GRA)}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-purple-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(currentCriteria.GRA / 9) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Pronunciation</span>
                  <span className="font-bold font-mono text-white">{formatBand(currentCriteria.PR)}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(currentCriteria.PR / 9) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* INTERACTIVE SPOKEN SURFACE (Strikethrough + Add/Remove)        */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        {/* Helper Instructions Pill */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Interactive Band 8 Spoken Improvement Pass</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="line-through text-slate-400 decoration-rose-500 font-serif">basic phrase</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold text-[10px]">upgraded ✕</span>
              <span>= Click <strong>✕</strong> to remove upgrade</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-300 text-slate-800 font-serif text-[10px]">phrase <strong className="text-indigo-600">+FC</strong></span>
              <span>= Click <strong>+</strong> to apply Band 8 upgrade</span>
            </span>
          </div>
        </div>

        {/* Spoken Text Container */}
        <div className="font-serif text-[15px] sm:text-base leading-9 text-slate-800 whitespace-pre-wrap select-text">
          {mappedSegments.map(({ segment: s, upgradeItem: item }, idx) => {
            if (!item) {
              return <span key={idx}>{s.text}</span>;
            }

            const isActive = activeUpgradeIds.has(item.id);
            const isHoveredStriked = hovered?.id === item.id && hovered?.target === 'striked';
            const isHoveredAdded = hovered?.id === item.id && hovered?.target === 'added';

            // Active State: Strikethrough basic spoken words + Show Band 8 upgrade with [✕] button
            if (isActive) {
              return (
                <span key={idx} className="relative inline-block my-0.5">
                  {/* Strikethrough of Original Spoken Word */}
                  <del
                    onMouseEnter={() => setHovered({ id: item.id, target: 'striked' })}
                    onMouseLeave={() => setHovered(null)}
                    className="line-through decoration-rose-500 decoration-2 text-slate-400 select-none mr-1.5 font-serif text-sm cursor-help hover:text-slate-600 transition-colors"
                  >
                    {item.originalText}
                  </del>

                  {/* Upgraded Band 8 Spoken Collocation with [✕] remove button */}
                  <ins
                    onMouseEnter={() => setHovered({ id: item.id, target: 'added' })}
                    onMouseLeave={() => setHovered(null)}
                    className="no-underline inline-flex items-center gap-1 font-bold text-indigo-950 bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-300 rounded-lg px-2 py-0.5 shadow-2xs font-serif transition-all cursor-help"
                  >
                    <span className="text-sm">{item.upgradedText}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUpgrade(item.id);
                      }}
                      title={`Remove Band 8 upgrade "${item.upgradedText}" to see score drop`}
                      className="w-4 h-4 rounded-full bg-indigo-200/90 hover:bg-rose-600 hover:text-white text-indigo-800 flex items-center justify-center transition-all cursor-pointer shrink-0 ml-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </ins>

                  {/* STRIKED WORD TOOLTIP */}
                  {isHoveredStriked && (
                    <div className="absolute left-0 bottom-full mb-2 z-50 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-sans shadow-2xl border border-rose-500/40 space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-rose-300 flex items-center gap-1.5 font-mono">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          Spoken Vocabulary Limitation
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-bold">
                          Band 6.0 Spoken
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-rose-200">
                          Striked: <span className="line-through text-slate-300 font-serif font-normal">"{item.originalText}"</span>
                        </div>
                        <p className="text-slate-200 text-[11px] leading-relaxed">
                          {item.originalCritique}
                        </p>
                      </div>
                      {showSinhala && item.originalCritiqueSi && (
                        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-rose-200 font-sinhala leading-relaxed">
                          💡 {item.originalCritiqueSi}
                        </div>
                      )}
                    </div>
                  )}

                  {/* NEWLY ADDED WORD TOOLTIP */}
                  {isHoveredAdded && (
                    <div className="absolute left-0 bottom-full mb-2 z-50 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-sans shadow-2xl border border-emerald-500/40 space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 font-mono">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Band 8 Spoken Collocation
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-bold">
                          +{item.criterion} Boost
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-emerald-200">
                          Upgraded: <span className="text-white font-serif font-bold">"{item.upgradedText}"</span>
                        </div>
                        <p className="text-slate-100 text-[11px] leading-relaxed">
                          {item.upgradeValue}
                        </p>
                      </div>
                      {showSinhala && item.upgradeValueSi && (
                        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-indigo-200 font-sinhala leading-relaxed">
                          💡 {item.upgradeValueSi}
                        </div>
                      )}
                    </div>
                  )}
                </span>
              );
            }

            // Inactive (Removed State): Display original spoken words cleanly with [+] button
            return (
              <span
                key={idx}
                onMouseEnter={() => setHovered({ id: item.id, target: 'striked' })}
                onMouseLeave={() => setHovered(null)}
                className="relative inline-block my-0.5"
              >
                <span className="inline-flex items-center gap-1 text-slate-800 bg-slate-100/90 hover:bg-slate-200/90 border border-slate-300 rounded-lg px-2 py-0.5 transition-all">
                  <span className="text-sm font-serif">{item.originalText}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUpgrade(item.id);
                    }}
                    title={`Click + to apply Band 8 upgrade: "${item.upgradedText}" (+${item.criterion})`}
                    className="px-1.5 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-sans font-bold flex items-center gap-0.5 cursor-pointer shadow-2xs ml-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>+{item.criterion}</span>
                  </button>
                </span>

                {/* Tooltip on inactive word */}
                {isHoveredStriked && (
                  <div className="absolute left-0 bottom-full mb-2 z-50 w-72 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-sans shadow-2xl border border-slate-700 space-y-1.5 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <span className="font-bold text-[10px] uppercase text-indigo-300 font-mono block">
                      Spoken Baseline: "{item.originalText}"
                    </span>
                    <p className="text-slate-200 text-[11px]">
                      Click <span className="font-bold text-emerald-300">+{item.criterion}</span> to apply <span className="font-bold text-indigo-300">"{item.upgradedText}"</span> and raise your speaking score.
                    </p>
                  </div>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpeakingInteractiveUpgradesSandbox;


 