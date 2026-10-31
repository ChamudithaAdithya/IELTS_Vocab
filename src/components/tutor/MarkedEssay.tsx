import React, { useState } from 'react';
import type { EssaySegment } from '../../types/tutor';

interface MarkedEssayProps {
  segments: EssaySegment[];
  /** 'marked' shows strike-through + red insertions; 'result' shows the clean final text with changes highlighted. */
  mode: 'marked' | 'result';
  /** Colour scheme: corrections (red) or Band 8 upgrades (indigo). */
  tone?: 'correction' | 'upgrade';
  activeIssueId?: string | null;
  onSelectIssue?: (issueId: string) => void;
}

export const MarkedEssay: React.FC<MarkedEssayProps> = ({
  segments,
  mode,
  tone = 'correction',
  activeIssueId,
  onSelectIssue,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const addCls =
    tone === 'correction'
      ? 'text-red-600 font-semibold bg-red-50 rounded px-0.5'
      : 'text-indigo-700 font-semibold bg-indigo-50 rounded px-0.5';
  const resultCls =
    tone === 'correction'
      ? 'bg-emerald-50 text-emerald-800 border-b-2 border-emerald-300 rounded-sm'
      : 'bg-indigo-50 text-indigo-800 border-b-2 border-indigo-300 rounded-sm';

  return (
    <div className="font-serif text-[15px] sm:text-base leading-8 text-slate-800 whitespace-pre-wrap">
      {segments.map((s, i) => {
        if (s.type === 'text') return <span key={i}>{s.text}</span>;

        const isActive = activeIssueId && s.issueId === activeIssueId;
        const interactive = !!(s.issueId && onSelectIssue);
        const wrapperCls = `relative inline transition-all ${interactive ? 'cursor-pointer' : 'cursor-help'} ${
          isActive ? 'ring-2 ring-amber-300 rounded bg-amber-50' : ''
        }`;
        const tooltip = s.note && hovered === i && (
          <span className="absolute left-0 bottom-full mb-1 z-20 w-60 rounded-lg bg-slate-900 text-white text-xs font-sans leading-snug px-3 py-2 shadow-xl pointer-events-none whitespace-normal">
            {s.note}
          </span>
        );
        const handlers = {
          onMouseEnter: () => setHovered(i),
          onMouseLeave: () => setHovered(null),
          onClick: () => s.issueId && onSelectIssue?.(s.issueId),
        };

        if (mode === 'result') {
          if (s.type === 'del') return null;
          const shown = s.type === 'ins' ? s.text : s.to;
          return (
            <span key={i} className={`${wrapperCls} ${resultCls}`} {...handlers}>
              {shown}
              {tooltip}
            </span>
          );
        }

        return (
          <span key={i} className={wrapperCls} {...handlers}>
            {(s.type === 'del' || s.type === 'replace') && (
              <span className="line-through decoration-2 decoration-red-500 text-slate-400">{s.text}</span>
            )}
            {s.type === 'replace' && <span className="text-slate-300 select-none"> </span>}
            {s.type === 'replace' && <span className={addCls}>{s.to}</span>}
            {s.type === 'ins' && <span className={addCls}>{s.text}</span>}
            {tooltip}
          </span>
        );
      })}
    </div>
  );
};

export const MarkingLegend: React.FC<{ tone?: 'correction' | 'upgrade' }> = ({ tone = 'correction' }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
    <span className="flex items-center gap-1.5">
      <span className="line-through decoration-2 decoration-red-500 text-slate-400 font-serif">wrong</span>
      = {tone === 'correction' ? 'remove / wrong' : 'replaced'}
    </span>
    <span className="flex items-center gap-1.5">
      <span className={`font-semibold font-serif ${tone === 'correction' ? 'text-red-600' : 'text-indigo-700'}`}>new</span>
      = {tone === 'correction' ? 'correct / forgotten word' : 'upgrade / added idea'}
    </span>
    <span>Hover a change to see why.</span>
  </div>
);
