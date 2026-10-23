export interface Collocation {
  text: string;
  sinhala: string;
}

export interface ExampleSentence {
  en: string;
  si: string;
}

export interface Word {
  id: string;
  term: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'idiom';
  ipa?: string;
  definition: string;
  sinhalaDefinition: string;
  notes: string;
  sinhalaNotes: string;
  collocations: Collocation[];
  exampleSentences: ExampleSentence[];
  practicePrompt: string;
  bandLevel: string; // e.g., 'Band 7.0+', 'Band 7.5+', 'Band 8.0+'
  commonMistake?: {
    incorrect: string;
    correct: string;
    explanation: string;
  };
}

export interface Challenge {
  part: string; // e.g. "PART 1 / PART 3 PRACTICE"
  question: string;
  minimumTargetWords: number;
  sampleBand9Answer: string;
  examinerTips: string[];
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  sinhalaDescription: string;
  bannerImage: string;
  words: Word[];
  speakingChallenge: Challenge;
  writingChallenge?: {
    task: string;
    prompt: string;
    sampleBand8Paragraph: string;
  };
}

export interface QuizQuestion {
  id: string;
  type: 'definition' | 'collocation' | 'sentence_gap';
  wordId: string;
  term: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sinhalaExplanation: string;
}

export interface UserProgress {
  masteredWordIds: string[];
  bookmarkedWordIds: string[];
  checklistSubmissions: Record<string, string>; // wordId -> user sentence
  completedChecklistIds: string[];
  quizBestScores: Record<string, number>; // lessonId -> score percent
  speakingDrafts: Record<string, string>; // lessonId -> user text
}
