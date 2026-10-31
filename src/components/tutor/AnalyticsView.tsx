import React from 'react';
import { Award, TrendingUp, AlertTriangle, BookOpen, CheckCircle2, ArrowLeft, Sparkles, Target } from 'lucide-react';
import type { TutorState } from '../../types/tutor';
import { TUTOR_LESSONS } from '../../data/tutorLessons';

interface AnalyticsViewProps {
  tutorState: TutorState;
  showSinhala: boolean;
  onNavigateToSection?: (section: string) => void;
  onOpenLesson?: (lessonId: string) => void;
  onBackToHub?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tutorState,
  showSinhala,
  onNavigateToSection,
  onOpenLesson,
  onBackToHub,
}) => {
  const assessments = tutorState?.assessments || [];
  const latestAssessment = assessments[0];
  const writingBand = latestAssessment ? latestAssessment.overallBand : 6.5;
  const readingBand = 7.0;
  const listeningBand = 7.5;
  const speakingBand = 7.0;

  const overallBand = Math.round(((writingBand + readingBand + listeningBand + speakingBand) / 4) * 2) / 2;
  const lessonProgress = tutorState?.lessonProgress || {};
  const completedLessonsCount = Object.values(lessonProgress).filter(p => p && p.bestScore >= 80).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
                Module 5 & 6
              </span>
              <span className="text-xs text-slate-500">IELTS Analytics & Personal Coach</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Performance Analytics & Learning Coach
            </h1>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
          <div>
            <p className="text-[10px] uppercase font-bold text-indigo-300">Estimated Overall Band</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{overallBand.toFixed(1)}</span>
              <span className="text-xs text-indigo-300">/ 9.0 (Target: 8.0)</span>
            </div>
          </div>
          <Award className="w-8 h-8 text-amber-400 shrink-0" />
        </div>
      </div>

      {/* 4 Skill Score Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Writing Tutor</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{writingBand.toFixed(1)}</span>
            <span className="text-xs font-bold text-amber-600">Priority</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Task 1 & Task 2 Evaluated</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Reading Tutor</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{readingBand.toFixed(1)}</span>
            <span className="text-xs font-bold text-emerald-600">On Track</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Passage 1 TFNG & MCQ</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Listening Tutor</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{listeningBand.toFixed(1)}</span>
            <span className="text-xs font-bold text-emerald-600">Strong</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Section 1 Distractor Mastery</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Speaking Tutor</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{speakingBand.toFixed(1)}</span>
            <span className="text-xs font-bold text-indigo-600">Practice</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Part 2 Cue Card Simulation</p>
        </div>
      </div>

      {/* Main Grid: Learning Coach Advice & Error Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Learning Coach Daily Prescription (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Personal Coach Daily Prescription</h2>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs text-indigo-950">
            <span className="font-bold text-indigo-900 block">Teacher's Strategic Instruction:</span>
            <p>
              "Do not waste energy memorizing rare 10-letter words yet. Over 70% of lost marks in your Task 1 and Task 2 essays stem from <strong>subject-verb agreement</strong> and <strong>plural noun omissions</strong>. Mastering these foundation rules will immediately lift your GRA and TR criteria to a solid 7.5+."
            </p>
            {showSinhala && (
              <p className="text-slate-600 text-[11px] font-sans pt-1 border-t border-indigo-100">
                අමාරු වචන කටපාඩම් කිරීමට පෙර, නිතර සිදුවන ඒකවචන/බහුවචන සහ ක්‍රියාපද ගැළපීමේ වැරදි නිවැරදි කරගන්න. එමඟින් ලකුණු පහසුවෙන්ම Band 7.5+ දක්වා ඉහළ නංවාගත හැක.
              </p>
            )}
          </div>

          {/* Recommended Learning Order */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Recommended Lesson Sequence (Foundations First):
            </span>
            <div className="space-y-2">
              {TUTOR_LESSONS.slice(0, 5).map((l, idx) => {
                const prog = tutorState.lessonProgress[l.id];
                const isPassed = prog && prog.bestScore >= 80;

                return (
                  <div
                    key={l.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-[11px]">
                        0{idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900">{l.title}</span>
                        <p className="text-slate-500 text-[11px]">{l.summary}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPassed ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Mastered
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenLesson?.(l.id)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Study Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Persistent Repeated Errors Tracker (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Persistent Mistake Patterns</h2>
          </div>

          <p className="text-xs text-slate-500">
            Errors identified across your writing and speaking submissions:
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950">Subject-Verb Agreement</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                  4 Detected
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                e.g. "People is facing..." ➜ "People are facing..."
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950">Plural Noun Endings (-s / -es)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                  5 Detected
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                e.g. "many student" ➜ "many students"
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Uncountable Noun Articles</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                  2 Detected
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                e.g. "a employment", "many advices"
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigateToSection?.('writing')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Write Next Essay to Retest Patterns
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
