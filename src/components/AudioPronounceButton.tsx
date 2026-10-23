import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { playPronunciation, stopSpeech, EnglishAccent } from '../utils/speech';

interface AudioPronounceButtonProps {
  term: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'minimal' | 'badge';
  defaultAccent?: EnglishAccent;
  showAccentPicker?: boolean;
}

export const AudioPronounceButton: React.FC<AudioPronounceButtonProps> = ({
  term,
  size = 'md',
  variant = 'primary',
  defaultAccent = 'en-GB',
  showAccentPicker = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [accent, setAccent] = useState<EnglishAccent>(defaultAccent);
  const [isSlow, setIsSlow] = useState(false);

  const handlePlay = (e: React.MouseEvent, slowMode = isSlow) => {
    e.stopPropagation();

    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      return;
    }

    playPronunciation(term, {
      accent,
      rate: slowMode ? 0.72 : 0.95,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const getAccentLabel = (acc: EnglishAccent) => {
    switch (acc) {
      case 'en-GB': return 'UK';
      case 'en-US': return 'US';
      case 'en-AU': return 'AU';
    }
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handlePlay}
        className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
          isPlaying
            ? 'bg-indigo-600 text-white scale-105 shadow-xs'
            : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
        }`}
        title={`Listen to pronunciation (${getAccentLabel(accent)})`}
        aria-label={`Pronounce ${term}`}
      >
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-4 w-4 justify-center">
            <span className="w-0.5 bg-white h-3 animate-pulse" />
            <span className="w-0.5 bg-white h-4 animate-bounce" />
            <span className="w-0.5 bg-white h-2 animate-pulse" />
          </div>
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-200/90 p-1 sm:p-1.5 rounded-xl transition-all shadow-xs group">
      {/* Primary Listen Button */}
      <button
        onClick={(e) => handlePlay(e, false)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 ${
          isPlaying
            ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50'
            : 'bg-white text-indigo-700 hover:bg-indigo-600 hover:text-white shadow-2xs'
        }`}
        title={`Listen to British/IELTS Pronunciation (${getAccentLabel(accent)})`}
      >
        {isPlaying ? (
          <div className="flex items-center gap-1.5">
            <div className="flex items-end gap-0.5 h-3.5 w-3.5 justify-center">
              <span className="w-0.5 bg-white h-2.5 animate-pulse" />
              <span className="w-0.5 bg-white h-3.5 animate-bounce" />
              <span className="w-0.5 bg-white h-2 animate-pulse" />
            </div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold">Playing</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-600 group-hover:text-white transition-colors" />
            <span className="font-extrabold text-[11px] sm:text-xs">Pronounce</span>
          </div>
        )}
      </button>

      {/* Slow 0.75x Practice Button for Phonetics */}
      <button
        onClick={(e) => {
          setIsSlow(prev => !prev);
          handlePlay(e, !isSlow);
        }}
        className={`px-1.5 py-1 rounded-md text-[10px] font-bold transition-colors ${
          isSlow && isPlaying
            ? 'bg-amber-400 text-slate-950 font-black'
            : 'text-slate-500 hover:text-indigo-700 hover:bg-white'
        }`}
        title="Listen at 0.75x speed to study phonetics and stress"
      >
        0.75x
      </button>

      {/* Accent Picker Selector */}
      {showAccentPicker && (
        <select
          value={accent}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setAccent(e.target.value as EnglishAccent)}
          className="text-[10px] font-bold text-slate-600 bg-white/80 border border-indigo-200/60 rounded-md px-1.5 py-1 focus:outline-hidden hover:bg-white cursor-pointer"
          title="Select English accent"
        >
          <option value="en-GB">🇬🇧 UK (IELTS)</option>
          <option value="en-US">🇺🇸 US</option>
          <option value="en-AU">🇦🇺 AU</option>
        </select>
      )}
    </div>
  );
};
