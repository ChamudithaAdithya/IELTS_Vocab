import React from 'react';
import {
  TrendingUp,
  ArrowRight,
  Sparkles,
  Award,
  Mic,
  BookOpen,
  Volume2
} from 'lucide-react';
import { formatBand } from '../../utils/tutorEngine';

export interface SpeakingPerformanceMetric {
  key: 'fluency' | 'grammar' | 'vocabulary' | 'pronunciation';
  label: string;
  labelSi?: string;
  percent: number;
  band?: number;
  color: string;
  strokeColor: string;
  bgColor: string;
}

export interface SpeakingPerformanceCardProps {
  overallBand?: number;
  estimatedBandLabel?: string;
  fluencyPercent?: number;
  grammarPercent?: number;
  vocabularyPercent?: number;
  pronunciationPercent?: number;
  fluencyBand?: number;
  grammarBand?: number;
  vocabularyBand?: number;
  pronunciationBand?: number;
  wordCount?: number;
  wordsPerMinute?: number;
  onViewDetailedAnalysis?: () => void;
  showSinhala?: boolean;
  className?: string;
}

export const SpeakingPerformanceCard: React.FC<SpeakingPerformanceCardProps> = ({
  overallBand = 6.0,
  estimatedBandLabel = 'Estimated Band',
  fluencyPercent,
  grammarPercent,
  vocabularyPercent,
  pronunciationPercent,
  fluencyBand = 6.5,
  grammarBand = 6.0,
  vocabularyBand = 6.5,
  pronunciationBand = 7.0,
  wordCount,
  wordsPerMinute,
  onViewDetailedAnalysis,
  showSinhala = false,
  className = ''
}) => {
  // Convert band (0-9) to standard % if percentage not directly provided
  // 6.5 / 9 * 100 ≈ 72%, 6.0 / 9 * 100 ≈ 67-68%, 6.5 -> 70-72%, 7.0 -> 75-78%
  const fPercent = typeof fluencyPercent === 'number' 
    ? fluencyPercent 
    : Math.min(100, Math.round((fluencyBand / 9) * 100));

  const gPercent = typeof grammarPercent === 'number' 
    ? grammarPercent 
    : Math.min(100, Math.round((grammarBand / 9) * 100));

  const vPercent = typeof vocabularyPercent === 'number' 
    ? vocabularyPercent 
    : Math.min(100, Math.round((vocabularyBand / 9) * 100));

  const pPercent = typeof pronunciationPercent === 'number' 
    ? pronunciationPercent 
    : Math.min(100, Math.round((pronunciationBand / 9) * 100));

  const metrics: SpeakingPerformanceMetric[] = [
    {
      key: 'fluency',
      label: 'Fluency',
      labelSi: 'කථන චතුරතාව',
      percent: fPercent,
      band: fluencyBand,
      color: 'text-indigo-600',
      strokeColor: '#4f46e5', // indigo-600
      bgColor: 'bg-indigo-50 border-indigo-100'
    },
    {
      key: 'grammar',
      label: 'Grammar',
      labelSi: 'ව්‍යාකරණ නිරවද්‍යතාව',
      percent: gPercent,
      band: grammarBand,
      color: 'text-purple-600',
      strokeColor: '#9333ea', // purple-600
      bgColor: 'bg-purple-50 border-purple-100'
    },
    {
      key: 'vocabulary',
      label: 'Vocabulary',
      labelSi: 'වාග්කෝෂය (වචන මාලාව)',
      percent: vPercent,
      band: vocabularyBand,
      color: 'text-emerald-600',
      strokeColor: '#059669', // emerald-600
      bgColor: 'bg-emerald-50 border-emerald-100'
    },
    {
      key: 'pronunciation',
      label: 'Pronunciation',
      labelSi: 'උච්චාරණය හා රිද්මය',
      percent: pPercent,
      band: pronunciationBand,
      color: 'text-amber-500',
      strokeColor: '#d97706', // amber-600
      bgColor: 'bg-amber-50 border-amber-100'
    }
  ];

  return (
    <div
      className={`bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-5 ${className}`}
    >
      {/* 1. Header with Badge */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Your Performance</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h3>
          {showSinhala && (
            <p className="text-[11px] text-slate-500 font-sinhala">ඔබගේ කථන කාර්යසාධනය සහ ලකුණු විග්‍රහය</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {typeof wordsPerMinute === 'number' && wordsPerMinute > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
              <Mic className="w-3 h-3 text-slate-500" />
              <span>{wordsPerMinute} WPM</span>
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
            Cambridge Rubric
          </span>
        </div>
      </div>

      {/* 2. Main Content: Big Band Score Left + 4 Radial Metric Gauges Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Overall Band Score Box */}
        <div className="md:col-span-4 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 text-center flex flex-col items-center justify-center shadow-inner relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/20 blur-xl pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300 font-mono mb-1">
            Overall Result
          </span>

          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-amber-400 my-1 group-hover:scale-105 transition-transform">
            {formatBand(overallBand)}
          </div>

          <span className="text-xs font-semibold text-slate-300 tracking-wide mt-0.5">
            {estimatedBandLabel}
          </span>

          {typeof wordCount === 'number' && wordCount > 0 && (
            <span className="text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-white/10 w-full">
              {wordCount} words analyzed
            </span>
          )}
        </div>

        {/* Right: The 4 Criteria Circular Gauges */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <div
              key={m.key}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all hover:-translate-y-0.5 hover:shadow-xs ${m.bgColor}`}
            >
              {/* Circular Radial Gauge */}
              <div className="relative w-14 h-14 my-1 flex items-center justify-center">
                <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-white/80"
                    strokeWidth="3.6"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Colored Progress Ring */}
                  <path
                    stroke={m.strokeColor}
                    strokeDasharray={`${m.percent}, 100`}
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700 ease-out"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                {/* Center Percentage Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono font-extrabold text-xs text-slate-900 leading-none">
                    {m.percent}%
                  </span>
                  {typeof m.band === 'number' && (
                    <span className="text-[9px] font-mono text-slate-500 font-semibold leading-none mt-0.5">
                      B{formatBand(m.band)}
                    </span>
                  )}
                </div>
              </div>

              {/* Metric Label */}
              <div className="mt-1">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {m.label}
                </span>
                {showSinhala && m.labelSi && (
                  <span className="text-[10px] text-slate-500 font-sinhala block leading-tight mt-0.5">
                    {m.labelSi}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Action Footer: View Detailed Analysis */}
      {onViewDetailedAnalysis && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Deep dive into grammatical errors, fluency rhythm, and Band 8 collocations:
          </span>

          <button
            type="button"
            onClick={onViewDetailedAnalysis}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-xs group cursor-pointer ml-auto"
          >
            <span>View Detailed Analysis</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SpeakingPerformanceCard;
