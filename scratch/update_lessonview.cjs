const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('D:/IELTS WEB/IELTS_Vocab/src/components/LessonView.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add state: const [expandedWordExamples, setExpandedWordExamples] = useState<Record<string, boolean>>({});
if (!content.includes('expandedWordExamples')) {
  content = content.replace(
    'const [isMobileLookupOpen, setIsMobileLookupOpen] = useState(false);',
    'const [isMobileLookupOpen, setIsMobileLookupOpen] = useState(false);\n  const [expandedWordExamples, setExpandedWordExamples] = useState<Record<string, boolean>>({});'
  );
}

// 2. Replace example sentences render block
const targetOldBlock = `{/* Example Sentences */}
              {word.exampleSentences.length > 0 && (
                <div className="space-y-2 text-sm">
                  <span className="font-semibold text-slate-900 block">Example Sentences:</span>
                  <ol className="space-y-2.5 pl-4 list-decimal text-slate-700">
                    {word.exampleSentences.map((sentence, sIdx) => {
                      const enText = typeof sentence === 'string' ? sentence : sentence.en;
                      const siText = typeof sentence === 'string' ? '' : sentence.si;
                      const regex = new RegExp(\`(\${word.term})\`, 'gi');
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
                                onClick={() => handlePronounce(enText, \`\${word.id}-example-\${sIdx}\`)}
                                className="shrink-0 p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                title="Pronounce this example sentence"
                                aria-label="Pronounce this example sentence"
                              >
                                <Volume2 className={\`w-4 h-4 \${playingWordId === \`\${word.id}-example-\${sIdx}\` ? 'animate-pulse text-indigo-600' : ''}\`} />
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
              )}`;

const newBlock = `{/* Example Sentences */}
              {word.exampleSentences.length > 0 && (() => {
                const isExpanded = !!expandedWordExamples[word.id];
                const displayedSentences = isExpanded || word.exampleSentences.length <= 3 
                  ? word.exampleSentences 
                  : word.exampleSentences.slice(0, 3);

                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 block">Example Sentences:</span>
                      {word.exampleSentences.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setExpandedWordExamples(prev => ({ ...prev, [word.id]: !prev[word.id] }))}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <span>{isExpanded ? 'Show fewer' : \`Show all \${word.exampleSentences.length} simple examples\`}</span>
                          <ChevronDown className={\`w-3.5 h-3.5 transition-transform duration-200 \${isExpanded ? 'rotate-180' : ''}\`} />
                        </button>
                      )}
                    </div>
                    <ol className="space-y-2.5 pl-4 list-decimal text-slate-700">
                      {displayedSentences.map((sentence, sIdx) => {
                        const enText = typeof sentence === 'string' ? sentence : sentence.en;
                        const siText = typeof sentence === 'string' ? '' : sentence.si;
                        const regex = new RegExp(\`(\${word.term})\`, 'gi');
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
                                  onClick={() => handlePronounce(enText, \`\${word.id}-example-\${sIdx}\`)}
                                  className="shrink-0 p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                  title="Pronounce this example sentence"
                                  aria-label="Pronounce this example sentence"
                                >
                                  <Volume2 className={\`w-4 h-4 \${playingWordId === \`\${word.id}-example-\${sIdx}\` ? 'animate-pulse text-indigo-600' : ''}\`} />
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
                );
              })()}`;

if (content.includes(targetOldBlock)) {
  content = content.replace(targetOldBlock, newBlock);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('Successfully updated LessonView.tsx with expandable simple examples!');
} else {
  // Try CRLF / LF agnostic replace
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const normalizedTarget = targetOldBlock.replace(/\r\n/g, '\n');
  if (normalizedContent.includes(normalizedTarget)) {
    content = normalizedContent.replace(normalizedTarget, newBlock.replace(/\r\n/g, '\n'));
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('Successfully updated LessonView.tsx (normalized line endings)!');
  } else {
    console.error('Could not find targetOldBlock in LessonView.tsx');
  }
}

