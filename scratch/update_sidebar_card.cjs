const fs = require('fs');
const path = require('path');

const sidebarPath = path.resolve('D:/IELTS WEB/IELTS_Vocab/src/components/LessonRightSidebar.tsx');
let sbContent = fs.readFileSync(sidebarPath, 'utf8');

const target = `{/* English Definition */}`;
const replacement = `{/* Irregular Verb V1, V2, V3 Forms */}
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

              {/* English Definition */}`;

if (!sbContent.includes('Verb Forms (Tenses)') && sbContent.includes(target)) {
  sbContent = sbContent.replace(target, replacement);
  fs.writeFileSync(sidebarPath, sbContent, 'utf8');
  console.log('Successfully updated LessonRightSidebar.tsx!');
} else {
  console.log('Already updated or target not found');
}

