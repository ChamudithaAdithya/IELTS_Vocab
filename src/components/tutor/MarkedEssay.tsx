import React, { useState } from 'react';
import type { EssaySegment } from '../../types/tutor';

interface MarkedEssayProps {
  segments: EssaySegment[];
  /** 'marked' shows strike-through + coloured insertions; 'result' shows the clean final text. */
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
      ? 'text-red-700 font-semibold bg-red-50/90 border border-red-200 rounded px-1 py-0.5'
      : 'text-indigo-800 font-bold bg-indigo-50 border border-indigo-200/90 rounded px-1.5 py-0.5 shadow-2xs inline-block';

  return (
    <div className="font-serif text-[15px] sm:text-base leading-8 text-slate-800 whitespace-pre-wrap selection:bg-indigo-100">
      {segments.map((s, i) => {
        if (s.type === 'text') return <span key={i}>{s.text}</span>;

        const isActive = activeIssueId && s.issueId === activeIssueId;
        const interactive = !!(s.issueId && onSelectIssue);
        const wrapperCls = `relative inline transition-all ${interactive ? 'cursor-pointer' : 'cursor-help'} ${
          isActive ? 'ring-2 ring-amber-300 rounded bg-amber-50' : ''
        }`;

        const noteText = s.note || (tone === 'upgrade' ? 'Band 8 Academic Upgrade: More formal academic collocation' : undefined);

        const tooltip = noteText && hovered === i && (
          <span className="absolute left-0 bottom-full mb-1.5 z-30 w-64 rounded-xl bg-slate-900/95 backdrop-blur-xs text-white text-xs font-sans leading-relaxed px-3 py-2 shadow-2xl pointer-events-none whitespace-normal border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <span className={`block font-bold text-[10px] uppercase tracking-wider mb-0.5 ${
              tone === 'upgrade' ? 'text-indigo-300' : 'text-amber-300'
            }`}>
              {tone === 'upgrade' ? '✨ Band 8 Upgrade' : 'Correction Note'}
            </span>
            {noteText}
          </span>
        );

        const handlers = {
          onMouseEnter: () => setHovered(i),
          onMouseLeave: () => setHovered(null),
          onClick: () => s.issueId && onSelectIssue?.(s.issueId),
        };

        if (mode === 'result') {
          if (s.type === 'del') return null;
          const shown = s.type === 'ins' ? s.text : (s.type === 'replace' ? s.to : s.text);
          return (
            <span key={i} className={wrapperCls} {...handlers}>
              {shown}
              {tooltip}
            </span>
          );
        }

        // Mode: 'marked'
        return (
          <span key={i} className={wrapperCls} {...handlers}>
            {(s.type === 'del' || s.type === 'replace') && (
              <span className={`line-through select-none font-serif mr-1 ${
                tone === 'upgrade'
                  ? 'decoration-slate-400 text-slate-400 decoration-1'
                  : 'decoration-red-500 decoration-2 text-slate-400'
              }`}>
                {s.text}
              </span>
            )}
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
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-sans">
    <span className="flex items-center gap-1.5">
      <span className={`line-through font-serif ${
        tone === 'upgrade' ? 'decoration-slate-400 text-slate-400' : 'decoration-red-500 text-slate-400'
      }`}>
        {tone === 'upgrade' ? 'original phrase' : 'wrong'}
      </span>
      = {tone === 'upgrade' ? 'informal / replaced' : 'remove / wrong'}
    </span>
    <span className="flex items-center gap-1.5">
      <span className={`font-semibold px-1 py-0.5 rounded text-[10px] ${
        tone === 'upgrade' 
          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
          : 'text-red-600 bg-red-50 border border-red-200'
      }`}>
        {tone === 'upgrade' ? 'upgraded phrasing' : 'new'}
      </span>
      = {tone === 'upgrade' ? 'Band 8 academic upgrade' : 'correct / added word'}
    </span>
    <span className="text-slate-400">💡 Hover any change to view examiner notes.</span>
  </div>
);
