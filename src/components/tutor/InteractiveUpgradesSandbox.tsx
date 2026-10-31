import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Plus, 
  X, 
  TrendingUp, 
  Award, 
  HelpCircle, 
  ArrowRight,
  Sliders,
  Check,
  ChevronDown,
  Info
} from 'lucide-react';
import type { EssaySegment } from '../../types/tutor';
import { roundIeltsBand, formatBand } from '../../utils/tutorEngine';

export interface UpgradeDetailItem {
  id: string;
  originalText: string;
  upgradedText: string;
  criterion: 'LR' | 'TR' | 'CC' | 'GRA';
  originalCritique: string;
  originalCritiqueSi?: string;
  upgradeValue: string;
  upgradeValueSi?: string;
  note?: string;
}

interface InteractiveUpgradesSandboxProps {
  correctedText: string;
  segments: EssaySegment[];
  stage2Criteria: { TR: number; CC: number; LR: number; GRA: number };
  stage2Band: number;
  showSinhala: boolean;
}

// Knowledge base of authentic IELTS upgrade rationale
const UPGRADE_EXPLANATIONS: Record<string, {
  criterion: 'LR' | 'TR' | 'CC' | 'GRA';
  critique: string;
  critiqueSi?: string;
  value: string;
  valueSi?: string;
}> = {
  'big': {
    criterion: 'LR',
    critique: 'Generic spoken adjective. In IELTS Task 2, "big" lacks academic sophistication.',
    critiqueSi: '"big" යනු කතාබහේදී යොදන සරල වචනයකි. ශාස්ත්‍රීය රචනයකට එය ප්‍රමාණවත් නොවේ.',
    value: 'Replaces generic adjective with "significant/substantial", directly boosting Lexical Resource (Band 8).',
    valueSi: 'වඩාත් විධිමත් ශාස්ත්‍රීය විශේෂණ පදයක් යොදා LR ලකුණු ඉහළ නංවයි.'
  },
  'good points': {
    criterion: 'LR',
    critique: 'Casual conversational phrasing. Examiners look for academic discourse markers.',
    critiqueSi: '"good points" යනු සාමාන්‍ය කතාබහේදී යොදන සරල යෙදුමකි.',
    value: 'Introduces "valid arguments/merits", demonstrating precise academic collocation (LR Band 8).',
    valueSi: '"valid arguments" යනු Band 8 මට්ටමේ නිවැරදි ශාස්ත්‍රීය වචන සංයෝජනයකි.'
  },
  'study what they like': {
    criterion: 'TR',
    critique: 'Repeats the exact wording from the prompt without demonstration of paraphrasing.',
    critiqueSi: 'ප්‍රශ්නයේ ඇති වචන ඒ ආකාරයෙන්ම නැවත යෙදීමකි.',
    value: 'Paraphrases prompt ideas with "be free to pursue intellectual interests", fulfilling Task Response criteria.',
    valueSi: 'ප්‍රශ්නයේ අදහස වඩාත් පරිණත ලෙස විස්තර කර TR ලකුණු ඉහළ නංවයි.'
  },
  'about jobs': {
    criterion: 'LR',
    critique: 'Vague prepositional phrase common in colloquial conversation.',
    critiqueSi: '"about jobs" යනු පැහැදිලි නොවන සරල යෙදුමකි.',
    value: 'Upgrades to "future career prospects", showcasing precise academic employment terminology.',
    valueSi: '"future career prospects" ලෙස වඩාත් නිශ්චිත වෘත්තීය යෙදුමක් යෙදීම.'
  },
  'give jobs': {
    criterion: 'LR',
    critique: '"give jobs" is unnatural English. Governments and economies do not "give" jobs.',
    critiqueSi: '"give jobs" යනු ඉංග්‍රීසි භාෂාවේ ස්වභාවික යෙදුමක් නොවේ.',
    value: 'Uses natural collocation "generate sustainable employment opportunities", satisfying Band 8 LR.',
    valueSi: 'ස්වභාවික ශාස්ත්‍රීය යෙදුමක් වන "generate employment" යෙදීම.'
  },
  'in my opinion': {
    criterion: 'CC',
    critique: 'Overused standard transition. Lacks the nuanced authorial voice expected at Band 8.',
    critiqueSi: 'නිතර භාවිත වන සරල සංක්‍රාන්ති යෙදුමකි.',
    value: 'Upgrades to "from my perspective, it is evident that", providing sophisticated cohesion and stance.',
    valueSi: 'වඩාත් ප්‍රබල ලෙස කතුවරයාගේ මතය ඉදිරිපත් කරමින් Cohesion ඉහළ නංවයි.'
  },
  'balance both sides': {
    criterion: 'TR',
    critique: 'Vague recommendation that fails to provide a concrete, developed conclusion.',
    critiqueSi: '"balance both sides" යනු අපැහැදිලි නිර්දේශයකි.',
    value: 'Synthesizes both arguments specifically: "harmonise student aspirations with labour market requirements".',
    valueSi: 'දෙපාර්ශ්වයේම අදහස් නිශ්චිතව සංසන්දනය කර පරිණත නිගමනයකට එළඹීම.'
  },
  'cost a lot of money': {
    criterion: 'LR',
    critique: '"a lot of money" is spoken English, not suitable for academic essays.',
    critiqueSi: '"a lot of money" යනු කතාබහේදී යොදන සරල වචනයකි.',
    value: 'Replaces with "place an unsustainable fiscal burden on public budgets" (Advanced Lexical Resource).',
    valueSi: 'ශාස්ත්‍රීය ආර්ථික විද්‍යාත්මක යෙදුමක් යොදා LR ඉහළ නංවයි.'
  },
  'make poor people suffer': {
    criterion: 'LR',
    critique: 'Emotional, colloquial wording without sociological or analytical depth.',
    critiqueSi: 'චිත්තවේගීය, අවිධිමත් වචන භාවිතයකි.',
    value: 'Replaces with "imposes disproportionate economic hardship on low-income households".',
    valueSi: 'වඩාත් විශ්ලේෂණාත්මක ශාස්ත්‍රීය යෙදුමක් යෙදීම.'
  },
  'get good marks': {
    criterion: 'LR',
    critique: 'Elementary school phrasing. High-band candidates use academic collocations.',
    critiqueSi: 'පාසල් මට්ටමේ සරල යෙදුමකි.',
    value: 'Replaces with "achieve distinguished academic results" (Lexical Resource Band 8).',
    valueSi: 'විධිමත් අධ්‍යාපනික යෙදුමක් යෙදීම.'
  },
  'very popular': {
    criterion: 'CC',
    critique: 'Subjective intensity adverb ("very") that weakens academic authority.',
    critiqueSi: '"very" වැනි සරල තීව්‍රකාරක යෙදීමෙන් ශාස්ත්‍රීය බව අඩු වේ.',
    value: 'Replaces with "widely debated across modern society", enhancing objective discourse.',
    valueSi: 'වෛෂයික ශාස්ත්‍රීය ඉදිරිපත් කිරීමක් ලබා දෙයි.'
  }
};

export const InteractiveUpgradesSandbox: React.FC<InteractiveUpgradesSandboxProps> = ({
  correctedText,
  segments,
  stage2Criteria,
  stage2Band,
  showSinhala
}) => {
  // Extract all upgradeable segments
  const upgradeItems = useMemo<UpgradeDetailItem[]>(() => {
    const list: UpgradeDetailItem[] = [];
    let counter = 0;

    segments.forEach((s) => {
      if (s.type === 'replace' || s.type === 'ins') {
        counter++;
        const id = `up-${counter}`;
        const orig = s.type === 'replace' ? s.text.trim() : '(none - idea added)';
        const upg = s.type === 'replace' ? (s.to || '').trim() : s.text.trim();

        // Match lookup or generate intelligent fallback
        const key = Object.keys(UPGRADE_EXPLANATIONS).find(k => 
          orig.toLowerCase().includes(k) || k.includes(orig.toLowerCase())
        );
        const exp = key ? UPGRADE_EXPLANATIONS[key] : null;

        list.push({
          id,
          originalText: s.type === 'replace' ? s.text : '',
          upgradedText: s.type === 'replace' ? (s.to || '') : s.text,
          criterion: exp?.criterion || 'LR',
          originalCritique: exp?.critique || `The original phrasing "${orig}" is basic or conversational for IELTS Academic Task 2.`,
          originalCritiqueSi: exp?.critiqueSi || `මුල් යෙදුම ("${orig}") IELTS ශාස්ත්‍රීය රචනයකට සාපේක්ෂව සරල වේ.`,
          upgradeValue: exp?.value || s.note || `Replaces informal expression with authentic Band 8 academic phrasing, directly strengthening Lexical Resource.`,
          upgradeValueSi: exp?.valueSi || `ශාස්ත්‍රීය වචන භාවිතය (LR) ඉහළ නංවමින් Band 8 මට්ටමට ළඟා වීමට උපකාරී වේ.`,
          note: s.note
        });
      }
    });

    return list;
  }, [segments]);

  // Set of currently active upgrade IDs (all active by default to showcase Band 8 initially)
  const [activeUpgradeIds, setActiveUpgradeIds] = useState<Set<string>>(() => {
    return new Set(upgradeItems.map(u => u.id));
  });

  const [hoveredUpgradeId, setHoveredUpgradeId] = useState<string | null>(null);

  // Toggle single upgrade on or off
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

  // Bulk actions
  const applyAll = () => {
    setActiveUpgradeIds(new Set(upgradeItems.map(u => u.id)));
  };

  const revertAll = () => {
    setActiveUpgradeIds(new Set());
  };

  // DYNAMIC IELTS SCORE CALCULATION ENGINE
  const totalCount = upgradeItems.length;
  const activeCount = upgradeItems.filter(u => activeUpgradeIds.has(u.id)).length;
  const ratio = totalCount > 0 ? activeCount / totalCount : 1;

  // Real-time criteria progression from Stage 2 Baseline up to 8.0
  const clampBandVal = (n: number) => Math.round(n * 2) / 2;

  const dynamicTR = clampBandVal(stage2Criteria.TR + ratio * (8.0 - stage2Criteria.TR));
  const dynamicCC = clampBandVal(stage2Criteria.CC + ratio * (8.0 - stage2Criteria.CC));
  const dynamicLR = clampBandVal(stage2Criteria.LR + ratio * (8.0 - stage2Criteria.LR));
  const dynamicGRA = clampBandVal(stage2Criteria.GRA + ratio * (8.0 - stage2Criteria.GRA));

  const dynamicOverall = roundIeltsBand([dynamicTR, dynamicCC, dynamicLR, dynamicGRA]);
  const scoreBoost = Math.max(0, dynamicOverall - stage2Band);

  // Map segments with their interactive upgrade IDs
  let itemIndex = 0;
  const mappedSegments = segments.map(s => {
    if (s.type === 'replace' || s.type === 'ins') {
      const item = upgradeItems[itemIndex];
      itemIndex++;
      return { segment: s, upgradeItem: item };
    }
    return { segment: s, upgradeItem: null };
  });

  return (
    <div className="space-y-6">
      {/* REAL-TIME DYNAMIC SCORE CARD BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-indigo-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Interactive Score Sandbox
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-mono">
                <Sparkles className="w-3.5 h-3.5" /> Live Dynamic Band Calculation
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Stage 3 · Academic Upgrades Sandbox
            </h3>
            <p className="text-xs text-indigo-200/80 max-w-xl">
              Toggle each Band 8 upgrade on or off to witness how individual academic words and argument expansions dynamically recalculate your IELTS score.
            </p>
          </div>

          {/* DYNAMIC OVERALL BAND SCORE METER */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shrink-0">
            <div>
              <div className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider">
                Dynamic Band
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white flex items-baseline gap-1">
                <span>Band {formatBand(dynamicOverall)}</span>
              </div>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-left text-xs font-mono">
              <div className="text-emerald-400 font-bold">
                +{scoreBoost.toFixed(1)} Boost
              </div>
              <div className="text-slate-300 text-[11px]">
                {activeCount}/{totalCount} Active
              </div>
            </div>
          </div>
        </div>

        {/* CRITERIA PROGRESSION BARS (TR, CC, LR, GRA) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {[
            { key: 'TR', name: 'Task Response', score: dynamicTR, base: stage2Criteria.TR },
            { key: 'CC', name: 'Coherence', score: dynamicCC, base: stage2Criteria.CC },
            { key: 'LR', name: 'Lexical Resource', score: dynamicLR, base: stage2Criteria.LR },
            { key: 'GRA', name: 'Grammar', score: dynamicGRA, base: stage2Criteria.GRA }
          ].map(c => (
            <div key={c.key} className="bg-white/5 rounded-xl p-2.5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-indigo-300">{c.key}</span>
                <span className="font-black text-white font-mono">Band {formatBand(c.score)}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${(c.score / 9) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* BULK ACTION CONTROLS & SUMMARY */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
          <div className="text-indigo-200/90 text-[11px] flex items-center gap-2">
            <span>Progress towards Band 8:</span>
            <span className="font-bold font-mono text-white">
              {Math.round(ratio * 100)}% upgrades applied
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={revertAll}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Revert to Stage 2 Baseline ({formatBand(stage2Band)})</span>
            </button>
            <button
              type="button"
              onClick={applyAll}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-md hover:shadow-indigo-500/20 cursor-pointer text-xs"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Apply All Upgrades (Band 8.0)</span>
            </button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE ESSAY TEXT DISPLAY */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <span>Interactive Essay Surface</span>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-mono">
              Click ✕ to remove or + to add upgrades
            </span>
          </div>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            Hover any upgrade for full examiner critique & payoff
          </span>
        </div>

        {/* Text Container with interactive spans */}
        <div className="font-serif text-[15px] sm:text-base leading-9 text-slate-800 whitespace-pre-wrap select-text">
          {mappedSegments.map(({ segment: s, upgradeItem: item }, idx) => {
            if (!item) {
              if (s.type === 'del') return null;
              return <span key={idx}>{s.text}</span>;
            }

            const isActive = activeUpgradeIds.has(item.id);
            const isHovered = hoveredUpgradeId === item.id;

            if (isActive) {
              return (
                <span
                  key={idx}
                  onMouseEnter={() => setHoveredUpgradeId(item.id)}
                  onMouseLeave={() => setHoveredUpgradeId(null)}
                  className="relative inline-block my-0.5"
                >
                  {/* Strikethrough of original */}
                  {s.type === 'replace' && (
                    <span className="line-through decoration-slate-400 text-slate-400 select-none mr-1.5 font-serif text-sm">
                      {item.originalText}
                    </span>
                  )}

                  {/* Upgraded text with interactive remove button */}
                  <span className="inline-flex items-center gap-1.5 font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100/90 border border-indigo-300 rounded-xl px-2 py-0.5 shadow-2xs transition-all">
                    <span className="text-sm font-serif">{item.upgradedText}</span>
                    <button
                      type="button"
                      onClick={() => toggleUpgrade(item.id)}
                      title="Remove this upgrade to see score drop"
                      className="w-4 h-4 rounded-full bg-indigo-200/80 hover:bg-red-500 hover:text-white text-indigo-700 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>

                  {/* Hover Detail Card on BOTH Striked & Upgraded */}
                  {isHovered && (
                    <div className="absolute left-0 bottom-full mb-2 z-40 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-sans shadow-2xl border border-slate-700 space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-indigo-300 flex items-center gap-1 font-mono">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Band 8 Upgrade Detail
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-600 text-white font-bold">
                          +{item.criterion}
                        </span>
                      </div>

                      {/* Original Critique */}
                      {item.originalText && (
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-rose-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Original Limitation: "{item.originalText}"
                          </span>
                          <p className="text-slate-300 text-[11px] leading-snug">
                            {item.originalCritique}
                          </p>
                        </div>
                      )}

                      {/* Value Added */}
                      <div className="space-y-0.5 pt-1 border-t border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-emerald-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Value Added: "{item.upgradedText}"
                        </span>
                        <p className="text-slate-200 text-[11px] leading-snug font-medium">
                          {item.upgradeValue}
                        </p>
                      </div>

                      {/* Sinhala Explanation */}
                      {showSinhala && (item.upgradeValueSi || item.originalCritiqueSi) && (
                        <div className="pt-1 border-t border-slate-800 text-[10px] text-indigo-200 leading-snug">
                          💡 {item.upgradeValueSi || item.originalCritiqueSi}
                        </div>
                      )}
                    </div>
                  )}
                </span>
              );
            }

            // Inactive (Reverted) State
            return (
              <span
                key={idx}
                onMouseEnter={() => setHoveredUpgradeId(item.id)}
                onMouseLeave={() => setHoveredUpgradeId(null)}
                className="relative inline-block my-0.5"
              >
                <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-dashed border-slate-300 rounded-xl px-2 py-0.5 transition-all">
                  <span className="text-sm font-serif">{item.originalText || '(omitted idea)'}</span>
                  <button
                    type="button"
                    onClick={() => toggleUpgrade(item.id)}
                    title={`Apply Band 8 upgrade: "${item.upgradedText}"`}
                    className="px-1.5 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Apply (+{item.criterion})</span>
                  </button>
                </span>

                {/* Hover Card for Inactive State */}
                {isHovered && (
                  <div className="absolute left-0 bottom-full mb-2 z-40 w-72 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-sans shadow-2xl border border-slate-700 space-y-1.5 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <span className="font-bold text-[10px] uppercase text-indigo-300 font-mono block">
                      Click to Apply Band 8 Upgrade
                    </span>
                    <p className="text-slate-200 text-[11px]">
                      Upgrading to <span className="font-bold text-emerald-300">"{item.upgradedText}"</span> raises your {item.criterion} sub-score.
                    </p>
                  </div>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* UPGRADES DIRECTORY LIST & CRITERIA VALUE EXPLANATIONS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Upgrade Breakdown & Score Contribution</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Review what each individual replacement changes and how it elevates the score towards Band 8.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            {activeCount} of {totalCount} Upgrades Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {upgradeItems.map((item, idx) => {
            const isActive = activeUpgradeIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                      +{item.criterion}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleUpgrade(item.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 text-indigo-600" />
                        <span>Apply</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Before vs After */}
                <div className="text-xs space-y-1.5 font-sans">
                  {item.originalText && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10px] font-bold text-rose-600 uppercase font-mono">Original:</span>
                      <span className="line-through text-slate-500 font-serif">"{item.originalText}"</span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono">Upgraded:</span>
                    <span className="font-bold text-indigo-950 font-serif">"{item.upgradedText}"</span>
                  </div>

                  <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">
                    {item.upgradeValue}
                  </p>

                  {showSinhala && item.upgradeValueSi && (
                    <p className="text-[10px] text-slate-500 pt-0.5 leading-relaxed bg-white/60 p-1.5 rounded-lg border border-slate-100">
                      💡 {item.upgradeValueSi}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

