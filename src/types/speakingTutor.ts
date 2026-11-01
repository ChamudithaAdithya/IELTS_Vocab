import type { EssaySegment, MainProblem, TutorIssue } from './tutor';

export type SpeakingCriterionKey = 'FC' | 'LR' | 'GRA' | 'PR';

export interface SpeakingCriterionScore {
  key: SpeakingCriterionKey;
  name: string;
  band: number;
  comment: string;
  commentSi?: string;
  toReach8?: string;
}

export interface FluencyMetrics {
  wordCount: number;
  durationSec: number;
  wordsPerMinute: number;
  fillerCount: number;
  fillerRatio: number;
  hesitationWords: string[];
}

export interface SpeakingEvaluationReport {
  id: string;
  turnIndex: number;
  question: string;
  spokenText: string;
  overallBand: number;
  confidence?: 'High' | 'Medium' | 'Low';
  criteria: SpeakingCriterionScore[];
  mainProblems: MainProblem[];
  /** Stage 2: Inline struck-through spoken slips & corrections */
  markedSpeech: EssaySegment[];
  issues: TutorIssue[];
  /** Stage 3: Granular spoken upgrades for live score simulation */
  band8Edits: EssaySegment[];
  stage2Criteria: { FC: number; LR: number; GRA: number; PR: number };
  stage2Band: number;
  /** Stage 4: Native Band 8.5/9.0 model spoken answer */
  band8ModelAnswer: string;
  band8AudioTips: string[];
  /** Real-time verbal audio response spoken aloud by the AI examiner */
  examinerSpokenFeedback: string;
  examinerSpokenFeedbackSi?: string;
  nextFollowUpQuestion?: string;
  fluencyMetrics?: FluencyMetrics;
}

export interface SpeakingTurn {
  id: string;
  role: 'examiner' | 'candidate';
  text: string;
  timestamp: number;
  audioDurationSec?: number;
  report?: SpeakingEvaluationReport;
  followUpPrompt?: string;
}

export interface SpeakingTopic {
  id: string;
  part: 1 | 2 | 3;
  topic: string;
  category: string;
  introAudioText?: string;
  questions: string[];
  cueCardPoints?: string[];
  sampleBand8Answer: string;
  examinerTips: string[];
}

export interface SpeakingUpgradeDetailItem {
  id: string;
  type: 'replace' | 'ins' | 'del';
  originalText: string;
  upgradedText: string;
  criterion: SpeakingCriterionKey;
  originalCritique: string;
  originalCritiqueSi?: string;
  upgradeValue: string;
  upgradeValueSi?: string;
  note?: string;
}

/* ------------------------------------------------------------------ */
/* Adaptive Diagnostic & Micro-Roadmap Types                          */
/* ------------------------------------------------------------------ */

export interface MicroImprovementTask {
  id: string;
  title: string;
  criterion: SpeakingCriterionKey;
  targetDecimalBoost: number; // e.g. 0.3
  instruction: string;
  instructionSi?: string;
  exampleBefore: string;
  exampleAfter: string;
  isCompleted?: boolean;
}

export interface DiagnosticQuestion {
  id: string;
  part: 1 | 2 | 3;
  number: number;
  total: number;
  question: string;
  guidance: string;
  guidanceSi?: string;
  sampleBand5Answer: string; // Accessible stepping-stone model
  sampleBand8Answer: string; // Advanced reference model
}

export interface DiagnosticAssessmentResult {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  candidateAnswer: string;
  workingDecimalScore: number; // e.g. 4.0, 4.3
  officialBandEstimate: number; // e.g. 4.0, 4.5
  criteria: SpeakingCriterionScore[];
  whatYouDidWell: string[];
  whatYouDidWellSi?: string[];
  whatNeedsCorrection: TutorIssue[];
  markedSpeech: EssaySegment[];
  steppingStoneModel: string; // Realistic Band 5.0–5.5 answer
  band8StretchModel: string; // Band 8.5 model
  microTasks: MicroImprovementTask[];
  evidenceNeededForHigherBand: string[];
  evidenceNeededForHigherBandSi?: string[];
}

export interface ProgressSessionPoint {
  id: string;
  sessionNumber: number;
  sessionLabel: string;
  internalDecimalScore: number;
  officialBand: number;
  completedTasks: string[];
  notes: string;
}


