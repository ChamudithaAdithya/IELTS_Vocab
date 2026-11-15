const fs = require('fs');
const path = require('path');

// 1. Update LessonView.tsx
const lessonViewPath = path.resolve('D:/IELTS WEB/IELTS_Vocab/src/components/LessonView.tsx');
let lvContent = fs.readFileSync(lessonViewPath, 'utf8');

const lvTarget = `              {/* Definition */}
              <div className="space-y-1.5 text-sm">`;

const lvReplacement = `              {/* Irregular Verb V1, V2, V3 Forms Card */}
              {word.v1 && word.v2 && word.v3 && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-950">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                      Verb Forms & Tenses
                    </span>
                    {word.verbPattern && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[11px] font-medium border border-indigo-200">
                        {word.verbPattern}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-md border border-indigo-100 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">V1 · Present</span>
                      <span className="font-semibold text-slate-900 text-sm">{word.v1}</span>
                    </div>
                    <div className="bg-white p-2 rounded-md border border-indigo-100 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">V2 · Past Simple</span>
                      <span className="font-semibold text-indigo-600 text-sm">{word.v2}</span>
                    </div>
                    <div className="bg-white p-2 rounded-md border border-indigo-100 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">V3 · Past Participle</span>
                      <span className="font-semibold text-emerald-600 text-sm">{word.v3}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Definition */}
              <div className="space-y-1.5 text-sm">`;

if (lvContent.includes(lvTarget) && !lvContent.includes('Verb Forms & Tenses')) {
  lvContent = lvContent.replace(lvTarget, lvReplacement);
  fs.writeFileSync(lessonViewPath, lvContent, 'utf8');
  console.log('Successfully updated LessonView.tsx with V1/V2/V3 card!');
} else {
  console.log('LessonView.tsx already updated or target not found');
}

// 2. Update LessonRightSidebar.tsx
const sidebarPath = path.resolve('D:/IELTS WEB/IELTS_Vocab/src/components/LessonRightSidebar.tsx');
let sbContent = fs.readFileSync(sidebarPath, 'utf8');

const sbTarget = `              {/* English Definition */}
              <div className="pt-2 border-t border-slate-200 text-xs">`;

const sbReplacement = `              {/* Irregular Verb V1, V2, V3 Forms */}
              {selectedWord.v1 && selectedWord.v2 && selectedWord.v3 && (
                <div className="pt-2 border-t border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span>Verb Forms (Tenses):</span>
                    {selectedWord.verbPattern && (
                      <span className="text-[10px] text-indigo-600 font-medium">{selectedWord.verbPattern.split(':')[0]}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">V1</span>
                      <span className="font-bold text-slate-800">{selectedWord.v1}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">V2</span>
                      <span className="font-bold text-indigo-600">{selectedWord.v2}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">V3</span>
                      <span className="font-bold text-emerald-600">{selectedWord.v3}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* English Definition */}
              <div className="pt-2 border-t border-slate-200 text-xs">`;

if (sbContent.includes(sbTarget) && !sbContent.includes('Verb Forms (Tenses)')) {
  sbContent = sbContent.replace(sbTarget, sbReplacement);
  fs.writeFileSync(sidebarPath, sbContent, 'utf8');
  console.log('Successfully updated LessonRightSidebar.tsx with V1/V2/V3 forms!');
} else {
  console.log('LessonRightSidebar.tsx already updated or target not found');
}

