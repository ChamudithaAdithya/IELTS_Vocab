import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import type { TutorReport, LessonTopicId } from '../../types/tutor';
import { MarkedEssay, MarkingLegend } from './MarkedEssay';
import { formatBand, buildResult } from '../../utils/tutorEngine';

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

  const correctedText = buildResult(report.markedEssay);
  const band8Text = buildResult(report.band8Edits);

  const handleCopyClean = () => {
    navigator.clipboard.writeText(correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
                Academic IELTS · {report.taskType === 'task1' ? 'Task 1' : 'Task 2'}
              </span>
              {report.source === 'ai' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Evaluated with Gemini AI ({report.engineModel || 'gemini-3.8-flash'})
                </span>
              ) : report.source === 'offline' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
                  <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                  Evaluated with Built-in Cambridge Examiner (100% Offline Mode)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Cambridge Benchmark Sample Assessment
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
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-md">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Your Estimated Score
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {formatBand(report.overallBand)}
                </span>
                <span className="text-xs text-indigo-300">/ 9.0</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">Target: Band {formatBand(report.targetBand)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
          </div>
        </div>

        {/* Four Assessment Criteria Breakdown */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Your Four Assessment Scores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {report.criteria.map(c => {
              const gap = report.targetBand - c.band;
              return (
                <div key={c.key} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{c.name}</span>
                    <span className="text-sm font-extrabold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
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

      {/* Screen 2: Essay Correction Passes */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
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
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
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
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                essayViewMode === 'result'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clean Corrected Essay
            </button>
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
              className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium"
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
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
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

        {/* Important Improvements (Distinguished from grammar errors!) */}
        {report.improvements.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Style & Lexical Upgrades (Not Grammar Errors)
              </span>
              <p className="text-xs text-slate-500 mt-1">
                These sentences are understandable and grammatically acceptable, but the improved versions are more precise for IELTS.
              </p>
            </div>
            <div className="space-y-2">
              {report.improvements.map((imp, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-serif text-slate-500 line-through">"{imp.original}"</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline shrink-0" />
                    <span className="font-semibold text-slate-900">Better: "{imp.better}"</span>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-0.5">{imp.why}</p>
                  {showSinhala && imp.whySi && (
                    <p className="text-[10px] text-slate-500 font-sinhala">{imp.whySi}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Screen 4: Band 8 Version (Edited on top of corrected version) */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                Stage 3 · Improvement Pass
              </span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Target Band {formatBand(report.band8Overall)} Achieved
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Improved Version to Band 8 Score
            </h2>
            <p className="text-xs text-slate-500">
              Edited on top of your corrected essay with precise collocations and argument development — NOT regenerated from scratch.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setBand8ViewMode('result')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                band8ViewMode === 'result'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clean Band 8 Essay
            </button>
            <button
              type="button"
              onClick={() => setBand8ViewMode('marked')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                band8ViewMode === 'marked'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              View Upgrades (Indigo)
            </button>
          </div>
        </div>

        {/* Band 8 Score Badge Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {report.band8Criteria.map(c => (
            <div key={c.key} className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                {c.key}
              </span>
              <p className="text-base font-extrabold text-indigo-950">Band {formatBand(c.band)}</p>
            </div>
          ))}
        </div>

        {/* Display */}
        <div className="p-4 sm:p-6 bg-slate-50/60 rounded-xl border border-slate-200">
          <MarkedEssay
            segments={report.band8Edits}
            mode={band8ViewMode}
            tone="upgrade"
          />
        </div>

        {/* What Changed Notes */}
        {report.band8Notes.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              How This Version Reached Band 8 (Key Upgrades)
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
              {report.band8Notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Screen 5: Recommended Learning Plan */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
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
            <button
              key={topicId}
              type="button"
              onClick={() => onOpenLesson(topicId)}
              className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all flex items-start gap-3 group"
            >
              <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 capitalize">
                  {topicId.replace(/-/g, ' ')}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Click to open study lesson →</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
