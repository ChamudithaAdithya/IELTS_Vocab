import React from 'react';
import { 
  Library, 
  Headphones, 
  BookOpen, 
  Sparkles, 
  Mic, 
  Layers, 
  Zap, 
  CheckSquare, 
  GraduationCap, 
  BarChart3 
} from 'lucide-react';

export type AppTab = 
  | 'cambridge' 
  | 'listening' 
  | 'reading' 
  | 'tutor' 
  | 'speaking' 
  | 'wordbank' 
  | 'flashcards' 
  | 'quiz' 
  | 'lessons' 
  | 'analytics';

export interface NavItem {
  id: AppTab;
  label: string;
  shortLabel?: string;
  badge?: string;
  badgeClass?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  description: string;
}

export interface NavCategory {
  title: string;
  shortTitle: string;
  items: NavItem[];
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    title: 'Cambridge Real Exams',
    shortTitle: 'Exams',
    items: [
      {
        id: 'cambridge',
        label: 'Cambridge Library',
        shortLabel: 'Library',
        badge: 'Books 1–18',
        badgeClass: 'bg-indigo-100 text-indigo-700',
        icon: Library,
        iconColor: 'text-indigo-600',
        description: 'Past papers & full test archive',
      },
      {
        id: 'listening',
        label: 'Listening Tests',
        shortLabel: 'Listening',
        badge: 'Real Audio',
        badgeClass: 'bg-purple-100 text-purple-700',
        icon: Headphones,
        iconColor: 'text-purple-600',
        description: 'Authentic Cambridge exam recordings',
      },
      {
        id: 'reading',
        label: 'Reading Tests',
        shortLabel: 'Reading',
        badge: 'Dual-Pane',
        badgeClass: 'bg-emerald-100 text-emerald-700',
        icon: BookOpen,
        iconColor: 'text-emerald-600',
        description: 'Real academic passages & explanations',
      },
      {
        id: 'tutor',
        label: 'Writing Tutor AI',
        shortLabel: 'Writing',
        badge: 'AI Coach',
        badgeClass: 'bg-amber-100 text-amber-800',
        icon: Sparkles,
        iconColor: 'text-amber-600',
        description: 'Task 1 & 2 band evaluations',
      },
      {
        id: 'speaking',
        label: 'Speaking Tutor',
        shortLabel: 'Speaking',
        badge: 'Roadmap',
        badgeClass: 'bg-rose-100 text-rose-700',
        icon: Mic,
        iconColor: 'text-rose-600',
        description: 'Diagnostic roadmap & mock interviews',
      },
    ],
  },
  {
    title: 'Vocabulary & Skills',
    shortTitle: 'Vocab',
    items: [
      {
        id: 'wordbank',
        label: 'Word Bank & Dictionary',
        shortLabel: 'Word Bank',
        badge: '2,000+',
        badgeClass: 'bg-blue-100 text-blue-700',
        icon: Layers,
        iconColor: 'text-blue-600',
        description: 'All IELTS academic vocabulary',
      },
      {
        id: 'flashcards',
        label: 'Flashcards Lab',
        shortLabel: 'Flashcards',
        badge: 'Active Recall',
        badgeClass: 'bg-amber-100 text-amber-800',
        icon: Zap,
        iconColor: 'text-amber-500',
        description: '3D memory flashcards & spaced repetition',
      },
      {
        id: 'quiz',
        label: 'Vocabulary Quizzes',
        shortLabel: 'Quizzes',
        badge: 'Test',
        badgeClass: 'bg-teal-100 text-teal-800',
        icon: CheckSquare,
        iconColor: 'text-teal-600',
        description: 'Timed speed quizzes & collocation tests',
      },
      {
        id: 'lessons',
        label: 'Topic Lessons',
        shortLabel: 'Lessons',
        badge: 'Modules',
        badgeClass: 'bg-slate-100 text-slate-700',
        icon: GraduationCap,
        iconColor: 'text-slate-600',
        description: 'Themed vocabulary lessons & collocations',
      },
    ],
  },
  {
    title: 'Progress & Insights',
    shortTitle: 'Stats',
    items: [
      {
        id: 'analytics',
        label: 'Score Tracker & Analytics',
        shortLabel: 'Analytics',
        icon: BarChart3,
        iconColor: 'text-indigo-600',
        description: 'Unified exam performance dashboard',
      },
    ],
  },
];

