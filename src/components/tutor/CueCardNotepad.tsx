import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  FileText,
  RotateCcw,
  Sparkles,
  Timer
} from 'lucide-react';

export interface CueCardNotepadProps {
  cueCardPoints: string[];
  prepTimeRemaining: number;
  isPrepRunning: boolean;
  onTogglePrepTimer: () => void;
  onResetPrepTimer: () => void;
  isRecording: boolean;
  recordSeconds: number;
  spokenText: string;
  showSinhala?: boolean;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'about', 'it', 'this', 'that', 'you', 'your', 'should', 'say', 'was',
  'were', 'is', 'are', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'can',
  'could', 'would', 'will', 'explain', 'describe', 'what', 'how', 'why', 'when', 'where',
  'who', 'which', 'there', 'they', 'them', 'their'
]);

const INTENT_SIGNALS: Record<string, string[]> = {
  when: ['last', 'ago', 'year', 'month', 'week', 'day', 'during', 'summer', 'winter', 'morning', 'evening', 'childhood', 'recently', 'back in', 'when', 'time', 'first', 'remember'],
  where: ['in', 'at', 'place', 'city', 'town', 'country', 'home', 'house', 'school', 'university', 'park', 'restaurant', 'beach', 'village', 'located', 'near'],
  who: ['friend', 'friends', 'family', 'mother', 'father', 'parents', 'brother', 'sister', 'teacher', 'colleague', 'people', 'someone', 'everyone', 'together', 'with'],
  why: ['because', 'since', 'reason', 'because of', 'therefore', 'so', 'important', 'special', 'meaningful', 'helped', 'taught', 'inspired', 'memorable', 'love', 'enjoy'],
  feel: ['felt', 'feel', 'feeling', 'happy', 'excited', 'proud', 'grateful', 'nervous', 'relaxed', 'amazed', 'wonderful', 'memorable', 'unforgettable', 'confident']
};

function isPointCovered(point: string, spokenLower: string): boolean {
  if (!spokenLower || spokenLower.length < 12) return false;

  const lowerPt = point.toLowerCase();
  const ptTokens = lowerPt
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !STOP_WORDS.has(w));

  // Direct lexical match (at least one key content word stem from the bullet)
  const directMatch = ptTokens.some(tok => {
    const stem = tok.length > 5 ? tok.slice(0, 5) : tok;
    return spokenLower.includes(stem);
  });
  if (directMatch) return true;

  // Semantic intent match based on Wh-word in bullet
  if (/\bwhen\b/.test(lowerPt) && INTENT_SIGNALS.when.some(sig => new RegExp(`\\b${sig}\\b`, 'i').test(spokenLower))) {
    return true;
  }
  if (/\bwhere\b/.test(lowerPt) && INTENT_SIGNALS.where.some(sig => new RegExp(`\\b${sig}\\b`, 'i').test(spokenLower))) {
    return true;
  }
  if (/\bwho\b/.test(lowerPt) && INTENT_SIGNALS.who.some(sig => new RegExp(`\\b${sig}\\b`, 'i').test(spokenLower))) {
    return true;
  }
  if (/\b(why|explain)\b/.test(lowerPt) && INTENT_SIGNALS.why.some(sig => new RegExp(`\\b${sig}\\b`, 'i').test(spokenLower))) {
    return true;
  }
  if (/\b(feel|felt|feeling|impression|enjoy)\b/.test(lowerPt) && INTENT_SIGNALS.feel.some(sig => new RegExp(`\\b${sig}\\b`, 'i').test(spokenLower))) {
    return true;
  }

  return false;
}

export const CueCardNotepad: React.FC<CueCardNotepadProps> = ({
  cueCardPoints,
  prepTimeRemaining,
  isPrepRunning,
  onTogglePrepTimer,
  onResetPrepTimer,
  isRecording,
  recordSeconds,
  spokenText,
  showSinhala = false
}) => {
  const [notes, setNotes] = useState<string>('');
  const [hideNotesWhileSpeaking, setHideNotesWhileSpeaking] = useState<boolean>(false);
  const [showNotepad, setShowNotepad] = useState<boolean>(true);

  const spokenLower = spokenText.toLowerCase();

  const coverage = useMemo(() => {
    return cueCardPoints.map(pt => ({
      point: pt,
      covered: isPointCovered(pt, spokenLower)
    }));
  }, [cueCardPoints, spokenLower]);

  const coveredCount = coverage.filter(c => c.covered).length;
  const prepPercent = Math.round(((60 - prepTimeRemaining) / 60) * 100);
  const speakPercent = Math.min(100, Math.round((recordSeconds / 120) * 100));

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Live Cue Card Bullet Coverage Tracker */}
      <div className="p-3.5 rounded-xl bg-white border border-indigo-100 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cue Card Points (You should say)</span>
          </span>
          <span
            className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              coveredCount === cueCardPoints.length && cueCardPoints.length > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            {coveredCount}/{cueCardPoints.length} Covered
          </span>
        </div>

        <ul className="space-y-1.5">
          {coverage.map((item, idx) => (
            <li
              key={idx}
              className={`flex items-start gap-2 text-xs rounded-lg px-2 py-1 transition-colors ${
                item.covered
                  ? 'bg-emerald-50/70 text-emerald-950 font-medium'
                  : 'text-slate-700'
              }`}
            >
              {item.covered ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
              )}
              <span className="flex-1">{item.point}</span>
              {item.covered && (
                <span className="text-[10px] font-mono font-bold text-emerald-700 shrink-0">
                  ✓ Covered
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 1-Minute Prep Timer & Interactive Scratchpad */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700" />
            <div>
              <span className="font-bold text-amber-950 block leading-tight">
                1-Minute Preparation & Scratchpad
              </span>
              {showSinhala && (
                <span className="text-[10px] text-amber-800 font-sinhala">
                  මිනිත්තු 1ක සූදානම් වීමේ කාලය — ප්‍රධාන වචන සටහන් කරගන්න
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono font-extrabold text-base px-2 py-0.5 rounded-lg ${
                prepTimeRemaining <= 10 && prepTimeRemaining > 0
                  ? 'bg-rose-100 text-rose-700 animate-pulse'
                  : 'text-amber-950'
              }`}
            >
              {prepTimeRemaining}s
            </span>
            <button
              type="button"
              onClick={onTogglePrepTimer}
              className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg font-bold text-[11px] cursor-pointer transition-colors"
            >
              {isPrepRunning ? 'Pause' : prepTimeRemaining === 0 ? 'Restart (60s)' : 'Start 1m Prep'}
            </button>
            <button
              type="button"
              onClick={onResetPrepTimer}
              className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg cursor-pointer transition-colors"
              title="Reset preparation timer to 60 seconds"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Prep Countdown Progress Bar */}
        <div className="w-full h-1.5 bg-amber-200/70 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-600 transition-all duration-500 rounded-full"
            style={{ width: `${prepPercent}%` }}
          />
        </div>

        {/* Scratchpad Header Controls */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-amber-200/70">
          <button
            type="button"
            onClick={() => setShowNotepad(prev => !prev)}
            className="flex items-center gap-1.5 font-bold text-amber-900 hover:text-amber-950 cursor-pointer text-[11px]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showNotepad ? 'Hide Scratchpad' : 'Open Keyword Scratchpad'}</span>
          </button>

          {showNotepad && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHideNotesWhileSpeaking(prev => !prev)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                  hideNotesWhileSpeaking
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
                title="Blur notes automatically when recording to simulate strict exam memory recall"
              >
                {hideNotesWhileSpeaking ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{hideNotesWhileSpeaking ? 'Blur on Record: ON' : 'Keep Notes Visible'}</span>
              </button>

              {notes && (
                <button
                  type="button"
                  onClick={() => setNotes('')}
                  className="text-[10px] font-semibold text-amber-800 hover:text-rose-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Interactive Scratchpad Area */}
        {showNotepad && (
          <div className="relative">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Jot down quick bullet keywords (e.g., • Who: my uncle • When: 2024 • Why: inspired my career • Band 8 vocab: unforgettable, pivotal moment)..."
              className={`w-full rounded-xl p-2.5 text-xs bg-white border border-amber-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none transition-all ${
                isRecording && hideNotesWhileSpeaking ? 'blur-sm select-none opacity-60' : ''
              }`}
            />
            {isRecording && hideNotesWhileSpeaking && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setHideNotesWhileSpeaking(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Notes Hidden (Click to Peek)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2-Minute Long Turn Speaking Progress Bar */}
      {(isRecording || recordSeconds > 0) && (
        <div className="p-3 rounded-xl bg-slate-900 text-white space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-indigo-300">
              <Timer className="w-3.5 h-3.5" />
              <span>Part 2 Long Turn Target (1:00 – 2:00)</span>
            </span>
            <span className="font-mono font-bold text-amber-300">
              {formatTimer(recordSeconds)} / 2:00
            </span>
          </div>
          <div className="relative w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            {/* 1-Minute Minimum Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10"
              style={{ left: '50%' }}
              title="1:00 Minimum IELTS Part 2 Duration"
            />
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                recordSeconds < 60
                  ? 'bg-amber-400'
                  : recordSeconds <= 125
                  ? 'bg-emerald-400'
                  : 'bg-indigo-400'
              }`}
              style={{ width: `${speakPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>0:00</span>
            <span className={recordSeconds >= 60 ? 'text-emerald-300 font-bold' : ''}>
              1:00 Min {recordSeconds >= 60 ? '✓' : ''}
            </span>
            <span className={recordSeconds >= 115 ? 'text-emerald-300 font-bold' : ''}>
              2:00 Target {recordSeconds >= 115 ? '✓' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
