import { UserProgress } from '../types';

const STORAGE_KEY = 'ielts_master_vocab_progress_v1';

export const initialProgress: UserProgress = {
  masteredWordIds: [],
  bookmarkedWordIds: [],
  checklistSubmissions: {},
  completedChecklistIds: [],
  quizBestScores: {},
  speakingDrafts: {},
};

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return initialProgress;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress;
    const parsed = JSON.parse(raw);
    return {
      ...initialProgress,
      ...parsed,
    };
  } catch (e) {
    console.error('Failed to load progress from localStorage', e);
    return initialProgress;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
}
