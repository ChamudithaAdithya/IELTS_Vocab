import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Bookmark, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink,
  MessageSquare,
  BookOpen,
  ArrowRight,
  Sparkles,
  Sliders
} from 'lucide-react';
import { Lesson, Word, UserProgress } from '../types';
import { LessonRightSidebar } from './LessonRightSidebar';
import { loadVoiceSettings, playSpeech, stopAllSpeech } from '../utils/speech';

interface LessonViewProps {
  lesson: Lesson;
  allLessons: Lesson[];
  onSelectLesson: (lessonId: string) => void;
  showSinhala: boolean;
  userProgress: UserProgress;
  onToggleMastered: (wordId: string) => void;
  onToggleBookmark: (wordId: string) => void;
  onSaveChecklistSentence: (wordId: string, sentence: string) => void;
  onStartQuiz: (lesson: Lesson) => void;
  onStartFlashcards: (lesson: Lesson) => void;
  onOpenVoiceSettings?: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  allLessons,
  onSelectLesson,
  showSinhala,
  userProgress,
  onToggleMastered,
  onToggleBookmark,
  onSaveChecklistSentence,
  onStartQuiz,
  onStartFlashcards,
  onOpenVoiceSettings,
}) => {
  // Web Speech API state
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);
  const [showExampleSpeakers, setShowExampleSpeakers] = useState(
    () => loadVoiceSettings().showExampleSpeakers,
  );
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Practice checklist state
  const [expandedChecklistId, setExpandedChecklistId] = useState<string | null>(null);
  const [checklistInputs, setChecklistInputs] = useState<Record<string, string>>(userProgress.checklistSubmissions || {});
  const [checklistFeedback, setChecklistFeedback] = useState<Record<string, { success: boolean; message: string }>>({});

  // Speaking challenge state
  const [speakingText, setSpeakingText] = useState(userProgress.speakingDrafts[lesson.id] || '');
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [speakingEvaluation, setSpeakingEvaluation] = useState<{
    wordsFound: string[];
    wordCount: number;
    feedback: string;
  } | null>(null);

  // Mobile right-sidebar lookup drawer state
  const [isMobileLookupOpen, setIsMobileLookupOpen] = useState(false);

  // Preload and cache browser speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const syncVoiceSettings = () => {
      setShowExampleSpeakers(loadVoiceSettings().showExampleSpeakers);
    };
    window.addEventListener('voice-settings-changed', syncVoiceSettings);
    window.addEventListener('storage', syncVoiceSettings);
    return () => {
      window.removeEventListener('voice-settings-changed', syncVoiceSettings);
      window.removeEventListener('storage', syncVoiceSettings);
    };
  }, []);

  /**
   * Pronounce word using Web Speech API with custom voice settings
   */
  const handlePronounce = (text: string, id: string) => {
    if (playingWordId === id) {
      stopAllSpeech();
      setPlayingWordId(null);
      return;
    }

    playSpeech(text, {
      onStart: () => setPlayingWordId(id),
      onEnd: () => setPlayingWordId(null),
      onError: () => setPlayingWordId(null),
    });
  };

  const scrollToWord = (wordId: string) => {
    const el = document.getElementById(`word-${wordId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCheckSentence = (word: Word) => {
    const input = checklistInputs[word.id]?.trim() || '';
    if (!input) {
      setChecklistFeedback(prev => ({
        ...prev,
        [word.id]: { success: false, message: 'Please write a sentence first.' }
      }));
      return;
    }

    const regex = new RegExp(`\\b${word.term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    const matched = regex.test(input);

    if (matched) {
      onSaveChecklistSentence(word.id, input);
      setChecklistFeedback(prev => ({
        ...prev,
        [word.id]: {
          success: true,
          message: `Great! "${word.term}" is correctly used in your sentence.`
        }
      }));
    } else {
      setChecklistFeedback(prev => ({
        ...prev,
        [word.id]: {
          success: false,
          message: `Please make sure to include the word "${word.term}" in your sentence.`
        }
      }));
    }
  };

  const handleEvaluateSpeaking = () => {
    const trimmed = speakingText.trim();
    if (!trimmed) return;

    const wordsInText = trimmed.split(/\s+/).filter(Boolean);
    const found: string[] = [];

    lesson.words.forEach(w => {
      const regex = new RegExp(`\\b${w.term}\\b`, 'i');
      if (regex.test(trimmed)) {
        found.push(w.term);
      }
    });

    let advice = '';
    if (found.length >= 3 && wordsInText.length >= 40) {
      advice = `Well done! You successfully used ${found.length} target words (${found.join(', ')}) in ${wordsInText.length} words.`;
    } else if (found.length >= 1) {
      advice = `Good effort. You used ${found.length} word (${found.join(', ')}). Aim for at least 3 target words to achieve Band 7+.`;
    } else {
      advice = 'Try to incorporate at least three vocabulary words from this lesson in your response.';
    }

    setSpeakingEvaluation({
      wordsFound: found,
      wordCount: wordsInText.length,
      feedback: advice
    });
    setShowModelAnswer(true);
  };

  const completedCount = lesson.words.filter(w => userProgress.completedChecklistIds.includes(w.id)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 2-Column Responsive Layout: Left = Lesson Content, Right = Sticky Word Meaning Lookup */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Column: Lesson Details, Words, Practice, Speaking */}
        <div className="flex-1 min-w-0 max-w-3xl space-y-10">
          {/* Lesson Header */}
          <header className="border-b border-slate-200 pb-6 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                IELTS Master Band 7+ Vocabulary
              </span>

              <div className="flex items-center gap-2">
                <label htmlFor="lesson-selector" className="text-xs text-slate-500">
                  Lesson:
                </label>
                <select
                  id="lesson-selector"
                  value={lesson.id}
                  onChange={(e) => onSelectLesson(e.target.value)}
                  className="text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-md px-2.5 py-1 focus:outline-slate-400 cursor-pointer"
                >
                  {allLessons.map(l => (
                    <option key={l.id} value={l.id}>
                      Lesson {l.number}: {l.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Lesson {lesson.number}: {lesson.title}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                With Sinhala translations · IELTS Speaking & Writing
              </p>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {lesson.description}
            </p>

            {showSinhala && (
              <p className="text-sm text-slate-600 font-sinhala leading-relaxed border-l-2 border-slate-300 pl-3">
                {lesson.sinhalaDescription}
              </p>
            )}

            {/* Quick Word Jump Pills + Mobile Lookup Launcher */}
            <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-600">
                <span className="font-semibold text-slate-500">Jump to:</span>
                {lesson.words.map((w, i) => (
                  <button
                    key={w.id}
                    onClick={() => scrollToWord(w.id)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    {i + 1}. {w.term}
                  </button>
                ))}
              </div>

              {/* Mobile trigger in header */}
              <button
                type="button"
                onClick={() => setIsMobileLookupOpen(true)}
                className="lg:hidden text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Word Lookup ({lesson.words.length})</span>
              </button>
            </div>
          </header>

          {/* Quick Subheader Controls */}
          <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                Lesson {lesson.number} Target Words ({lesson.words.length}):
              </span>
              <span className="text-slate-500 hidden sm:inline">
                Tap speaker on any word to hear natural pronunciation
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenVoiceSettings && (
                <button
                  type="button"
                  onClick={onOpenVoiceSettings}
                  className="px-2 py-1 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1 transition-colors"
                  title="Voice & Pronunciation Settings"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Voice Settings</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsMobileLookupOpen(true)}
                className="lg:hidden px-2.5 py-1 text-white bg-slate-900 hover:bg-slate-800 rounded font-medium flex items-center gap-1 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lookup</span>
              </button>
            </div>
          </div>

      {/* Vocabulary Words List */}
      <section className="space-y-10">
        {lesson.words.map((word, index) => {
          const isMastered = userProgress.masteredWordIds.includes(word.id);
          const isBookmarked = userProgress.bookmarkedWordIds.includes(word.id);
          const isSpeaking = playingWordId === word.id;

          return (
            <article
              key={word.id}
              id={`word-${word.id}`}
              className="bg-white border border-slate-200 rounded-lg p-6 space-y-5 scroll-mt-20"
            >
              {/* Word Header with Speaker Icon Button */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {index + 1}. {word.term}
                  </h2>

                  {/* Speaker Icon Button for Web Speech API */}
                  <button
                    type="button"
                    onClick={() => handlePronounce(word.term, word.id)}
                    className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
                      isSpeaking
                        ? 'text-blue-700 bg-blue-50 ring-1 ring-blue-300'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title="Listen to pronunciation (Web Speech API)"
                    aria-label={`Pronounce ${word.term}`}
                  >
                    <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse text-blue-700' : ''}`} />
                  </button>

                  <span className="text-xs text-slate-500 italic">
                    ({word.partOfSpeech})
                  </span>

                  {word.ipa && (
                    <span className="text-xs text-slate-400 font-mono">
                      {word.ipa}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleBookmark(word.id)}
                    className={`p-1.5 rounded-md text-xs transition-colors ${
                      isBookmarked
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                    title={isBookmarked ? 'Saved in Word Bank' : 'Save word'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleMastered(word.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                      isMastered
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isMastered ? 'Learned ✓' : 'Mark learned'}
                  </button>
                </div>
              </div>

              {/* Definition */}
              <div className="space-y-1.5 text-sm">
                <div>
                  <span className="font-semibold text-slate-900">Definition: </span>
                  <span className="text-slate-800">{word.definition}</span>
                </div>

                {showSinhala && (
                  <div className="font-sinhala text-slate-700">
                    <span className="font-semibold text-slate-900">Sinhala: </span>
                    <span>{word.sinhalaDefinition}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5 text-sm bg-slate-50 border border-slate-100 rounded-md p-3.5">
                <div>
                  <span className="font-semibold text-slate-900">Notes: </span>
                  <span className="text-slate-700">{word.notes}</span>
                </div>

                {showSinhala && word.sinhalaNotes && (
                  <div className="font-sinhala text-slate-600 text-xs sm:text-sm pt-1 border-t border-slate-200">
                    <span className="font-semibold text-slate-800">Sinhala: </span>
                    <span>{word.sinhalaNotes}</span>
                  </div>
                )}
              </div>

              {/* Collocations */}
              {word.collocations.length > 0 && (
                <div className="space-y-2 text-sm">
                  <span className="font-semibold text-slate-900 block">Collocations:</span>
                  <ul className="space-y-1.5 pl-4 list-disc text-slate-700">
                    {word.collocations.map((colloc, cIdx) => (
                      <li key={cIdx} className="leading-relaxed">
                        <span className="font-medium text-slate-900">{colloc.text}</span>
                        {showSinhala && (
                          <span className="text-slate-600 font-sinhala"> — {colloc.sinhala}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Example Sentences */}
              {word.exampleSentences.length > 0 && (
                <div className="space-y-2 text-sm">
                  <span className="font-semibold text-slate-900 block">Example Sentences:</span>
                  <ol className="space-y-2.5 pl-4 list-decimal text-slate-700">
                    {word.exampleSentences.map((sentence, sIdx) => {
                      const enText = typeof sentence === 'string' ? sentence : sentence.en;
                      const siText = typeof sentence === 'string' ? '' : sentence.si;
                      const regex = new RegExp(`(${word.term})`, 'gi');
                      const parts = enText.split(regex);
                      return (
                        <li key={sIdx} className="leading-relaxed pl-1 space-y-0.5">
                          <div className="text-slate-800 flex items-start gap-2">
                            <span className="flex-1">
                              {parts.map((part, pIdx) =>
                                regex.test(part) ? (
                                  <strong key={pIdx} className="text-slate-900 font-semibold underline decoration-slate-300 underline-offset-2">
                                    {part}
                                  </strong>
                                ) : (
                                  part
                                )
                              )}
                            </span>
                            {showExampleSpeakers && (
                              <button
                                type="button"
                                onClick={() => handlePronounce(enText, `${word.id}-example-${sIdx}`)}
                                className="shrink-0 p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                title="Pronounce this example sentence"
                                aria-label="Pronounce this example sentence"
                              >
                                <Volume2 className={`w-4 h-4 ${playingWordId === `${word.id}-example-${sIdx}` ? 'animate-pulse text-indigo-600' : ''}`} />
                              </button>
                            )}
                          </div>
                          {showSinhala && siText && (
                            <div className="text-xs text-slate-600 font-sinhala leading-relaxed pl-0.5">
                              {siText}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Action Step: Master the Vocabulary */}
      <section className="bg-slate-50 border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Action Step: Master the Vocabulary
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Don't just memorise the Sinhala meanings. Learn how to use each word in a natural sentence.
          </p>
        </div>

        {/* Practice Checklist Tracker */}
        <div className="border-t border-slate-200 pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Your practice checklist</span>
            <span>{completedCount}/{lesson.words.length} completed</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-slate-800 h-full transition-all duration-300"
              style={{ width: `${(completedCount / lesson.words.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 10 Checklist Prompts */}
        <div className="space-y-3 pt-2">
          {lesson.words.map((word, index) => {
            const isCompleted = userProgress.completedChecklistIds.includes(word.id);
            const isExpanded = expandedChecklistId === word.id;
            const currentSentence = checklistInputs[word.id] || '';
            const feedback = checklistFeedback[word.id];

            return (
              <div
                key={word.id}
                className="bg-white border border-slate-200 rounded-md overflow-hidden text-sm"
              >
                <div
                  onClick={() => setExpandedChecklistId(isExpanded ? null : word.id)}
                  className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-slate-900">
                      {index + 1}. {word.term}
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      — {word.practicePrompt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCompleted && (
                      <span className="text-xs text-emerald-700 font-medium">
                        Completed ✓
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3.5 pt-0 border-t border-slate-100 space-y-3 mt-2">
                    <p className="text-xs text-slate-600">
                      Prompt: {word.practicePrompt}
                    </p>

                    <textarea
                      rows={2}
                      value={currentSentence}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChecklistInputs(prev => ({ ...prev, [word.id]: val }));
                      }}
                      placeholder={`Write a sentence using "${word.term}"...`}
                      className="w-full border border-slate-300 rounded p-2.5 text-sm text-slate-900 focus:outline-slate-400"
                    />

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-400">
                        Collocation hint: {word.collocations[0]?.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCheckSentence(word)}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-800 transition-colors"
                      >
                        Check sentence
                      </button>
                    </div>

                    {feedback && (
                      <div className={`p-2.5 rounded text-xs ${
                        feedback.success
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {feedback.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quiz & Flashcards Buttons */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onStartQuiz(lesson)}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
          >
            Start vocabulary test
          </button>
          <button
            type="button"
            onClick={() => onStartFlashcards(lesson)}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 transition-colors"
          >
            Practice with flashcards
          </button>
        </div>
      </section>

      {/* IELTS Speaking Challenge */}
      <section className="border border-slate-200 rounded-lg p-6 sm:p-8 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {lesson.speakingChallenge.part}
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            IELTS Speaking challenge
          </h3>
          <p className="text-xs text-slate-500">
            Answer this question in 4–6 sentences using at least three words from this lesson.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded border border-slate-200">
          <p className="font-semibold text-slate-900 text-base">
            "{lesson.speakingChallenge.question}"
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Your written or spoken answer:</span>
            <span>{speakingText.split(/\s+/).filter(Boolean).length} words</span>
          </div>

          <textarea
            rows={4}
            value={speakingText}
            onChange={(e) => setSpeakingText(e.target.value)}
            placeholder="Write your answer here..."
            className="w-full border border-slate-300 rounded p-3 text-sm text-slate-900 focus:outline-slate-400"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleEvaluateSpeaking}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
            >
              Check my answer
            </button>

            <button
              type="button"
              onClick={() => setShowModelAnswer(prev => !prev)}
              className="text-xs text-slate-600 hover:text-slate-900 underline underline-offset-2"
            >
              {showModelAnswer ? 'Hide sample answer' : 'View model Band 9 answer'}
            </button>
          </div>
        </div>

        {speakingEvaluation && (
          <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
            <p className="font-semibold text-slate-900">Feedback:</p>
            <p className="text-slate-700">{speakingEvaluation.feedback}</p>
          </div>
        )}

        {showModelAnswer && (
          <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3 text-xs">
            <div>
              <p className="font-semibold text-slate-900">Model Band 9 Answer:</p>
              <p className="text-slate-700 italic mt-1 leading-relaxed">
                "{lesson.speakingChallenge.sampleBand9Answer}"
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1">
              <p className="font-semibold text-slate-900">Examiner Tips:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                {lesson.speakingChallenge.examinerTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* Next Lessons in the same format */}
      <section className="border-t border-slate-200 pt-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Next lessons in the same format:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {allLessons
            .filter(l => l.id !== lesson.id)
            .map(otherLesson => (
              <div
                key={otherLesson.id}
                onClick={() => {
                  onSelectLesson(otherLesson.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-4 border border-slate-200 rounded-lg hover:border-slate-400 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Lesson {otherLesson.number}</span>
                  <span>10 words</span>
                </div>
                <h4 className="font-bold text-slate-900">
                  {otherLesson.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-1">
                  {otherLesson.subtitle}
                </p>
              </div>
            ))}
        </div>
      </section>
        </div>

        {/* Right Sticky Column: Dedicated Word Meaning Lookup (Desktop: lg+) */}
        <aside className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-24 self-start">
          <LessonRightSidebar
            lesson={lesson}
            allLessons={allLessons}
            showSinhala={showSinhala}
            userProgress={userProgress}
            onScrollToWord={scrollToWord}
            onSelectLesson={onSelectLesson}
            onOpenVoiceSettings={onOpenVoiceSettings}
          />
        </aside>
      </div>

      {/* Floating Action Button for Mobile screens (lg:hidden) */}
      <button
        type="button"
        onClick={() => setIsMobileLookupOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all border border-slate-700"
        aria-label="Open Lesson Word Lookup"
      >
        <BookOpen className="w-4 h-4" />
        <span>Word Lookup ({lesson.words.length})</span>
      </button>

      {/* Mobile Slide-over Drawer (lg:hidden) */}
      {isMobileLookupOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
          onClick={() => setIsMobileLookupOpen(false)}
        >
          <div 
            className="w-full max-w-sm h-full bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <LessonRightSidebar
              lesson={lesson}
              allLessons={allLessons}
              showSinhala={showSinhala}
              userProgress={userProgress}
              onScrollToWord={scrollToWord}
              onSelectLesson={onSelectLesson}
              onOpenVoiceSettings={onOpenVoiceSettings}
              onCloseMobileDrawer={() => setIsMobileLookupOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
