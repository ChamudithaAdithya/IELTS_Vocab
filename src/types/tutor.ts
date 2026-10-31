/**
 * Types for the AI Writing Tutor (IELTS Writing evaluation + personalised lessons).
 */

export type LessonTopicId =
  | 'subject-verb-agreement'
  | 'plural-nouns'
  | 'articles-countable'
  | 'prepositions'
  | 'verb-patterns'
  | 'word-forms'
  | 'verb-tenses'
  | 'sentence-structure'
  | 'academic-vocabulary'
  | 'task-response';

export const LESSON_TOPIC_IDS: LessonTopicId[] = [
  'subject-verb-agreement',
  'plural-nouns',
  'articles-countable',
  'prepositions',
  'verb-patterns',
  'word-forms',
  'verb-tenses',
  'sentence-structure',
  'academic-vocabulary',
  'task-response',
];

export type Severity = 'High' | 'Medium' | 'Low';

export type CriterionKey = 'TR' | 'CC' | 'LR' | 'GRA';

/**
 * One piece of an essay.
 * - text:    unchanged words
 * - del:     words that must be removed (shown struck through)
 * - ins:     words the student forgot (shown in red)
 * - replace: `text` is wrong (struck through) and `to` is the correction (red)
 */
export interface EssaySegment {
  type: 'text' | 'del' | 'ins' | 'replace';
  text: string;
  to?: string;
  issueId?: string;
  note?: string;
}

export interface CriterionScore {
  key: CriterionKey;
  name: string;
  band: number;
  comment: string;
  commentSi?: string;
  toReach8?: string;
}

export interface MainProblem {
  severity: Severity;
  title: string;
  description: string;
  descriptionSi?: string;
}

export interface TutorIssue {
  id: string;
  title: string;
  category: 'Grammar' | 'Vocabulary' | 'Punctuation' | 'Spelling' | 'Structure' | 'Task';
  severity: Severity;
  original: string;
  corrected: string;
  why: string;
  whySi?: string;
  rule: string;
  lessonTopic: LessonTopicId;
  occurrences: number;
  tag?: string;
}

export interface Improvement {
  original: string;
  better: string;
  why: string;
  whySi?: string;
}

export interface TutorReport {
  id: string;
  createdAt: string;
  source: 'sample' | 'ai';
  taskType: 'task1' | 'task2';
  question: string;
  targetBand: number;
  overallBand: number;
  confidence: 'Low' | 'Medium' | 'High';
  criteria: CriterionScore[];
  mainProblems: MainProblem[];
  learningOrder: LessonTopicId[];
  teacherNote: string;
  teacherNoteSi?: string;
  /** Original essay → corrected essay (errors only, no rewriting). */
  markedEssay: EssaySegment[];
  issues: TutorIssue[];
  improvements: Improvement[];
  /** Corrected essay → Band 8 essay (upgrades only, no regeneration). */
  band8Edits: EssaySegment[];
  band8Overall: number;
  band8Criteria: { key: CriterionKey; band: number }[];
  band8Notes: string[];
  warnings?: string[];
}

export interface LessonQuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface TutorLesson {
  id: LessonTopicId;
  title: string;
  titleSi: string;
  category: 'Grammar' | 'Vocabulary' | 'Writing';
  curriculumLevel: number;
  summary: string;
  covers: string;
  basics: {
    points: string[];
    pointsSi: string[];
    examples: { sentence: string; note: string }[];
  };
  rule: {
    title: string;
    headers: string[];
    rows: string[][];
    tip: string;
    tipSi?: string;
  };
  quiz: LessonQuizQuestion[];
  applyPrompt: string;
}

export interface LessonProgressEntry {
  status: 'not_started' | 'in_progress' | 'completed';
  bestScore: number;
  attempts: number;
}

export interface TutorState {
  assessments: TutorReport[];
  lessonProgress: Partial<Record<LessonTopicId, LessonProgressEntry>>;
  targetBand: number;
}
