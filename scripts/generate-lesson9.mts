import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { readFile, writeFile } from 'node:fs/promises';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('GEMINI_API_KEY is missing. Add it to .env (never commit that file).');

const sourcePath = new URL('../src/data/academic-vocabulary.txt', import.meta.url);
const outputPath = new URL('../src/data/lesson9.generated.json', import.meta.url);
const terms = [...new Map((await readFile(sourcePath, 'utf8')).replace(/\r?\n/g, ' ').split(',')
  .map(value => value.replace(/\s+/g, ' ').trim()).filter(Boolean)
  .map(value => [value.toLowerCase(), value])).values()];

let completed: any[] = [];
try { completed = JSON.parse(await readFile(outputPath, 'utf8')); } catch { /* first run */ }
const completedTerms = new Set(completed.map(item => item.term.toLowerCase()));
const remaining = terms.filter(term => !completedTerms.has(term.toLowerCase()));
const ai = new GoogleGenAI({ apiKey });

const stringField = { type: Type.STRING };
const schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    required: ['term', 'partOfSpeech', 'ipa', 'definition', 'sinhalaDefinition', 'notes', 'sinhalaNotes', 'collocations', 'exampleSentences', 'practicePrompt', 'bandLevel'],
    properties: {
      term: stringField,
      partOfSpeech: { type: Type.STRING, enum: ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom'] },
      ipa: stringField,
      definition: stringField,
      sinhalaDefinition: stringField,
      notes: stringField,
      sinhalaNotes: stringField,
      collocations: { type: Type.ARRAY, minItems: 3, maxItems: 4, items: { type: Type.OBJECT, required: ['text', 'sinhala'], properties: { text: stringField, sinhala: stringField } } },
      exampleSentences: { type: Type.ARRAY, minItems: 6, maxItems: 6, items: { type: Type.OBJECT, required: ['en', 'si'], properties: { en: stringField, si: stringField } } },
      practicePrompt: stringField,
      bandLevel: stringField,
      commonMistake: { type: Type.OBJECT, nullable: true, properties: { incorrect: stringField, correct: stringField, explanation: stringField } },
    },
  },
};

for (let start = 0; start < remaining.length; start += 5) {
  const batch = remaining.slice(start, start + 5);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Create IELTS vocabulary cards for: ${JSON.stringify(batch)}. Match a high-quality bilingual English/Sinhala dictionary. Use accurate natural Sinhala, concise learner-friendly notes, real collocations, and exactly six short distinct sentences that genuinely demonstrate each item, each with an accurate Sinhala translation. Correct an obvious typo in the term only when certain. Do not use placeholder or meta-language.`,
    config: { responseMimeType: 'application/json', responseSchema: schema },
  });
  const generated = JSON.parse(response.text ?? '[]');
  if (generated.length !== batch.length || generated.some((item: any) => item.exampleSentences?.length !== 6 || item.collocations?.length < 3)) {
    throw new Error(`Validation failed for batch beginning with ${batch[0]}`);
  }
  completed.push(...generated);
  await writeFile(outputPath, `${JSON.stringify(completed, null, 2)}\n`, 'utf8');
  console.log(`Saved ${completed.length}/${terms.length} vocabulary cards.`);
}
