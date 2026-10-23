import React, { useState } from 'react';
import { 
  Check, 
  Copy,
  BookOpen
} from 'lucide-react';
import { ALL_WORDS, LESSONS } from '../data/lessons';

export const SpeakingLabView: React.FC<{ showSinhala: boolean }> = ({ showSinhala }) => {
  const [inputText, setInputText] = useState(
    'In contemporary society, many young people face a widening generational gap with their parents. A strict upbringing often instills a strong sense of responsibility, but families must also maintain mutual respect and open affection to avoid unnecessary conflict and strengthen their emotional bond.'
  );

  const [copied, setCopied] = useState(false);

  const UPGRADE_SUGGESTIONS = [
    { simple: 'hard working', advanced: 'diligent / conscientious' },
    { simple: 'strong mind', advanced: 'resilient / mental resilience' },
    { simple: 'raise children', advanced: 'upbringing' },
    { simple: 'family love', advanced: 'affection / emotional bond' },
    { simple: 'look like', advanced: 'resemble' },
    { simple: 'difference between old and young', advanced: 'generational gap' },
    { simple: 'good marks', advanced: 'academic achievement' },
    { simple: 'high paying', advanced: 'lucrative / generous remuneration' },
    { simple: 'work from home', advanced: 'telecommuting' },
    { simple: 'too tired from work', advanced: 'burnout' },
    { simple: 'save nature', advanced: 'conservation / preserve biodiversity' },
    { simple: 'sitting all day', advanced: 'sedentary lifestyle' },
    { simple: 'old technology', advanced: 'obsolete' },
    { simple: 'very new technology', advanced: 'state-of-the-art' },
  ];

  const wordsInInput = inputText.split(/\s+/).filter(Boolean);
  const detectedTargetWords = ALL_WORDS.filter(w => {
    const regex = new RegExp(`\\b${w.term}\\b`, 'i');
    return regex.test(inputText);
  });

  const activeSuggestions = UPGRADE_SUGGESTIONS.filter(s => {
    const regex = new RegExp(`\\b${s.simple}\\b`, 'i');
    return regex.test(inputText);
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">
          Speaking & Writing Vocabulary Lab
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Type or paste an IELTS response to check for Band 7+ vocabulary usage.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Your text ({wordsInInput.length} words):</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy text'}</span>
            </button>
          </div>

          <textarea
            rows={6}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full border border-slate-300 rounded p-3 text-sm text-slate-900 focus:outline-slate-400"
          />

          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="text-slate-400">Sample:</span>
            {LESSONS.slice(0, 3).map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => setInputText(l.speakingChallenge.sampleBand9Answer)}
                className="text-slate-600 hover:text-slate-900 underline underline-offset-2"
              >
                Lesson {l.number} sample
              </button>
            ))}
          </div>
        </div>

        {/* Detected words */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
          <span className="font-semibold text-slate-900">
            Target words detected ({detectedTargetWords.length}):
          </span>

          {detectedTargetWords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {detectedTargetWords.map(w => (
                <span
                  key={w.id}
                  className="bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-800 font-medium"
                >
                  ✓ {w.term} {showSinhala && <span className="text-slate-500 font-sinhala">({w.sinhalaDefinition.split('/')[0].trim()})</span>}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">None detected yet.</p>
          )}
        </div>

        {/* Upgrade suggestions */}
        {activeSuggestions.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
            <span className="font-semibold text-slate-900">
              Suggested vocabulary upgrades:
            </span>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              {activeSuggestions.map((item, i) => (
                <li key={i}>
                  Replace <span className="line-through text-slate-400">"{item.simple}"</span> with{' '}
                  <strong className="text-slate-900">{item.advanced}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
