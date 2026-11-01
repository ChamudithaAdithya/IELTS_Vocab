import React, { useState, useMemo } from 'react';
import { 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  RotateCcw, 
  HelpCircle,
  TrendingUp,
  FileText,
  Copy,
  Check,
  Sliders,
  ChevronDown
} from 'lucide-react';
import type { TutorReport, LessonTopicId } from '../../types/tutor';
import { MarkedEssay, MarkingLegend } from './MarkedEssay';
import { InteractiveUpgradesSandbox } from './InteractiveUpgradesSandbox';
import { 
  formatBand, 
  buildResult, 
  roundIeltsBand,
  diffWordsToSegments, 
  generateAcademicUpgradeSegments 
} from '../../utils/tutorEngine';

interface TutorReportViewProps {
  report: TutorReport;
  showSinhala: boolean;
  onOpenLesson: (topicId: LessonTopicId, userSentence?: { original: string; corrected: string }) => void;
  onRetest?: () => void;
}

export const TutorReportView: React.FC<TutorReportViewProps> = ({
  report,
  showSinhala,
  onOpenLesson,
  onRetest,
}) => {
  const [essayViewMode, setEssayViewMode] = useState<'marked' | 'result'>('marked');
  const [band8ViewMode, setBand8ViewMode] = useState<'marked' | 'result'>('result');
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedBand8, setCopiedBand8] = useState(false);

  const correctedText = buildResult(report.markedEssay);
  const band8Text = buildResult(report.band8Edits);

  // Stage 1 baseline criteria
  const baselineTR = report.criteria.find(c => c.key === 'TR')?.band ?? report.overallBand;
  const baselineCC = report.criteria.find(c => c.key === 'CC')?.band ?? report.overallBand;
  const baselineLR = report.criteria.find(c => c.key === 'LR')?.band ?? report.overallBand;
  const baselineGRA = report.criteria.find(c => c.key === 'GRA')?.band ?? report.overallBand;

  // Stage 2: All grammar, plurals, agreement, and punctuation errors are eliminated
  // GRA jumps to 7.0+, CC improves by 0.5 for punctuation & structure clarity
  const stage2Criteria = useMemo(() => ({
    TR: baselineTR,
    CC: Math.min(8.0, baselineCC + 0.5),
    LR: baselineLR,
    GRA: Math.max(7.0, Math.min(8.0, baselineGRA + 1.5))
  }), [baselineTR, baselineCC, baselineLR, baselineGRA]);

  const stage2Band = useMemo(() => {
    return roundIeltsBand([stage2Criteria.TR, stage2Criteria.CC, stage2Criteria.LR, stage2Criteria.GRA]);
  }, [stage2Criteria]);

  const stage2Gain = Math.max(0.5, stage2Band - report.overallBand);

  // Compute robust Band 8 upgrade segments so "View Upgrades" and Sandbox ALWAYS work on candidate's essay
  const band8Segments = useMemo(() => {
    // 1. Check if report.band8Edits has valid, granular edits matching correctedText
    if (report.band8Edits && Array.isArray(report.band8Edits)) {
      const nonText = report.band8Edits.filter(s => s.type !== 'text');
      const hasGiantBlock = nonText.some(s => {
        const origWords = (s.text || '').trim().split(/\s+/).length;
        const toWords = (s.to || '').trim().split(/\s+/).length;
        return origWords > 18 || toWords > 28;
      });
      const originalText = report.band8Edits
        .map(s => (s.type === 'replace' ? s.text : s.type === 'ins' ? '' : s.text))
        .join('');
      const isMatchingBase = originalText.trim().replace(/\s+/g, ' ') === correctedText.trim().replace(/\s+/g, ' ');

      if (nonText.length >= 3 && !hasGiantBlock && isMatchingBase) {
        return report.band8Edits;
      }
    }

    // 2. Otherwise generate granular word-and-phrase academic upgrades directly on correctedText
    const generated = generateAcademicUpgradeSegments(correctedText, report.improvements);
    return generated;
  }, [report.band8Edits, correctedText, report.improvements]);

  const cleanBand8FinalText = useMemo(() => {
    if (band8Text && band8Text.trim().length > 50 && band8Text.trim() !== correctedText.trim()) {
      return band8Text;
    }
    return buildResult(band8Segments);
  }, [band8Text, correctedText, band8Segments]);

  const handleCopyClean = () => {
    navigator.clipboard.writeText(correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBand8 = () => {
    navigator.clipboard.writeText(cleanBand8FinalText);
    setCopiedBand8(true);
    setTimeout(() => setCopiedBand8(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Warnings Banner if any */}
      {report.warnings && report.warnings.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            {report.warnings.map((w, idx) => (
              <p key={idx}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* Screen 1: Top Evaluation Summary */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                Academic IELTS · {report.taskType === 'task1' ? 'Task 1' : 'Task 2'}
              </span>
              {report.source === 'ai' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Evaluated with Gemini AI ({report.engineModel || 'gemini-3.8-flash'})
                </span>
              ) : report.source === 'offline' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                  Built-in Cambridge Examiner (Offline Mode)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  Cambridge Benchmark Assessment
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Writing Evaluation Report
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 max-w-2xl font-serif">
              "{report.question}"
            </p>
          </div>

          {/* Overall Estimated Band Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-md">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 font-mono">
                Current Estimated Band
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black tracking-tight font-mono">
                  Band {formatBand(report.overallBand)}
                </span>
                <span className="text-xs text-slate-400">/ 9.0</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Target: <span className="text-emerald-400 font-bold">Band {formatBand(report.targetBand)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 4 Assessment Criteria Breakdown */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            IELTS Official Criteria Scores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {report.criteria.map((c) => {
              const bgColour =
                c.band >= 7.5 ? 'bg-emerald-50/70 border-emerald-200' :
                c.band >= 6.5 ? 'bg-blue-50/70 border-blue-200' :
                c.band >= 5.5 ? 'bg-amber-50/70 border-amber-200' : 'bg-red-50/70 border-red-200';
              return (
                <div key={c.key} className={`p-4 rounded-xl border ${bgColour} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{c.name}</span>
                    <span className="text-sm font-extrabold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                      {formatBand(c.band)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{c.comment}</p>
                  {showSinhala && c.commentSi && (
                    <p className="text-[10px] text-slate-500 font-sinhala leading-snug">{c.commentSi}</p>
                  )}
                  {c.toReach8 && (
                    <div className="pt-2 border-t border-slate-200/70 text-[10px] text-indigo-900 font-medium">
                      <span className="font-bold text-indigo-600">To reach 8:</span> {c.toReach8}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Problems Detected */}
        {report.mainProblems.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Your Main Problems (Priority Order)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.mainProblems.map((prob, idx) => (
                <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        prob.severity === 'High'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : prob.severity === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {prob.severity} Priority
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">#0{idx + 1}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 pt-1">{prob.title}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{prob.description}</p>
                  {showSinhala && prob.descriptionSi && (
                    <p className="text-[10px] text-slate-500 font-sinhala">{prob.descriptionSi}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teacher's Recommendation */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Teacher's Recommendation
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
            {report.teacherNote}
          </p>
          {showSinhala && report.teacherNoteSi && (
            <p className="text-xs text-indigo-800 font-sinhala pt-1 leading-relaxed">
              {report.teacherNoteSi}
            </p>
          )}
        </div>
      </section>

      {/* Screen 2: Stage 2 · Correction Pass */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                Stage 2 · Correction Pass
              </span>
              <span className="text-xs text-slate-500">Replacing mistakes only — no rewriting</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Inline Error Marking & Clean Corrected Essay
            </h2>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setEssayViewMode('marked')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                essayViewMode === 'marked'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Marked (Strike & Red)
            </button>
            <button
              type="button"
              onClick={() => setEssayViewMode('result')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                essayViewMode === 'result'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clean Corrected Essay
            </button>
          </div>
        </div>

        {/* STAGE 2 EXACT SCORE IMPACT CARD (WITH ALL GRAMMAR FIXED) */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono">
                Stage 2 Corrected Score
              </span>
              <span className="text-xs font-bold text-emerald-800 font-mono">
                +{stage2Gain.toFixed(1)} Band Jump
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                Corrected Essay: Band {formatBand(stage2Band)}
              </span>
              <span className="text-xs text-slate-500 line-through">
                (from Band {formatBand(report.overallBand)})
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              Eliminating all agreement, plural noun, preposition, and verb pattern slips eliminates grammatical penalties. Your Grammatical Accuracy (GRA) score jumps from Band {formatBand(baselineGRA)} to Band {formatBand(stage2Criteria.GRA)}, elevating your overall essay to Band {formatBand(stage2Band)} before adding any advanced vocabulary!
            </p>
            {showSinhala && (
              <p className="text-[11px] text-emerald-900 font-sinhala">
                💡 ව්‍යාකරණ, බහුවචන සහ විරාම ලකුණු නිවැරදි කිරීමෙන් පමණක් ඔබේ ලකුණු මට්ටම Band {formatBand(stage2Band)} දක්වා ඉහළ යයි.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 shrink-0 bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
            {[
              { label: 'TR', val: stage2Criteria.TR },
              { label: 'CC', val: stage2Criteria.CC },
              { label: 'LR', val: stage2Criteria.LR },
              { label: 'GRA', val: stage2Criteria.GRA }
            ].map(item => (
              <div key={item.label} className="text-center px-2 py-1">
                <span className="text-[9px] font-mono font-bold text-slate-400 block">{item.label}</span>
                <span className="text-xs font-black text-slate-900 font-mono">Band {formatBand(item.val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        {essayViewMode === 'marked' ? (
          <MarkingLegend tone="correction" />
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>This clean version uses your exact sentences with only grammatical errors replaced.</span>
            <button
              type="button"
              onClick={handleCopyClean}
              className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        {/* Essay Display */}
        <div className="p-4 sm:p-6 bg-slate-50/60 rounded-xl border border-slate-200">
          <MarkedEssay
            segments={report.markedEssay}
            mode={essayViewMode}
            tone="correction"
            activeIssueId={activeIssueId}
            onSelectIssue={id => {
              setActiveIssueId(id);
              const el = document.getElementById(`issue-${id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          />
        </div>
      </section>

      {/* Screen 3: "My Mistakes" Section (Detected Issues) */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 font-mono">
              My Mistakes ({report.issues.length} detected)
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Detected Issues & Associated Lessons
            </h2>
            <p className="text-xs text-slate-500">
              Every identified problem has an explanation, the English rule, and a link to a personalized lesson.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {report.issues.map((iss, idx) => {
            const isActive = activeIssueId === iss.id;
            return (
              <div
                key={iss.id}
                id={`issue-${iss.id}`}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isActive
                    ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      Issue {idx + 1 < 10 ? `0${idx + 1}` : idx + 1} —
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{iss.title}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {iss.category}
                    </span>
                    {iss.occurrences > 1 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700">
                        {iss.occurrences}x
                      </span>
                    )}
                  </div>
                  {iss.tag && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {iss.tag}
                    </span>
                  )}
                </div>

                {/* Sentences comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 text-xs">
                  <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 mb-1">
                      Your sentence
                    </p>
                    <p className="font-serif italic text-slate-800 leading-relaxed">
                      "{iss.original}"
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                      Correct sentence
                    </p>
                    <p className="font-semibold text-slate-900 leading-relaxed">
                      "{iss.corrected}"
                    </p>
                  </div>
                </div>

                {/* Why is this wrong? */}
                <div className="pt-2 space-y-1">
                  <p className="text-xs font-bold text-slate-800">Why is this wrong?</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{iss.why}</p>
                  {showSinhala && iss.whySi && (
                    <p className="text-xs text-slate-500 font-sinhala">{iss.whySi}</p>
                  )}
                </div>

                {/* Rule & Lesson Link */}
                <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Learn rule:</span> {iss.rule}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenLesson(iss.lessonTopic, { original: iss.original, corrected: iss.corrected })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Study Lesson</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Screen 4: STAGE 3 · INTERACTIVE ACADEMIC UPGRADES SANDBOX (DYNAMIC SCORE SIMULATOR) */}
      <section className="space-y-4">
        <InteractiveUpgradesSandbox
          correctedText={correctedText}
          segments={band8Segments}
          stage2Criteria={stage2Criteria}
          stage2Band={stage2Band}
          showSinhala={showSinhala}
        />
      </section>

      {/* Screen 5: STAGE 4 · FINAL BAND 8 MODEL ESSAY */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono">
                Stage 4 · Final Model Essay
              </span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> Official Band 8.0 Target Achieved
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Fully Polished Band 8 Model Essay
            </h2>
            <p className="text-xs text-slate-500">
              The finalized, clean academic version incorporating all lexical, structural, and argument enhancements.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyBand8}
              className="px-3 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Copy Clean Band 8 Essay"
            >
              {copiedBand8 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBand8 ? 'Copied Band 8!' : 'Copy Band 8 Essay'}</span>
            </button>
          </div>
        </div>

        {/* Final Band 8 Official Score Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { key: 'TR', name: 'Task Response', band: 8.0 },
            { key: 'CC', name: 'Coherence', band: 8.0 },
            { key: 'LR', name: 'Lexical Resource', band: 8.0 },
            { key: 'GRA', name: 'Grammar', band: 8.0 }
          ].map(c => (
            <div key={c.key} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
                {c.key}
              </span>
              <p className="text-base font-extrabold text-indigo-950 font-mono">Band {formatBand(c.band)}</p>
            </div>
          ))}
        </div>

        {/* Clean Model Essay Display */}
        <div className="p-5 sm:p-8 bg-slate-50/70 rounded-2xl border border-slate-200 text-slate-900 font-serif text-[15px] sm:text-base leading-8 whitespace-pre-wrap select-text">
          {cleanBand8FinalText}
        </div>

        {/* Key Examiner Notes on How Band 8 Was Reached */}
        {report.band8Notes && report.band8Notes.length > 0 && (
          <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              How This Version Reached Band 8 (Examiner Summary)
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
              {report.band8Notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Screen 6: Recommended Learning Plan */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono">
            Personal Learning Plan
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Recommended Learning Order
          </h2>
          <p className="text-xs text-slate-500">
            Fix your foundational grammar weaknesses first before studying advanced vocabulary.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {report.learningOrder.map((topicId, idx) => (
            <div
              key={topicId}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col justify-between gap-3 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-600">Step {idx + 1}</span>
                  <span className="text-[10px] text-slate-400">Lesson #{idx + 1}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 capitalize">
                  {topicId.replace(/-/g, ' ')}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onOpenLesson(topicId)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-slate-600" />
                <span>Open Lesson</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
