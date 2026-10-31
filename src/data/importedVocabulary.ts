import rawVocabulary from './academic-vocabulary.txt?raw';
import type { Lesson, Word } from '../types';
import { ACADEMIC_VOCAB_DICTIONARY } from './academicVocabularyDictionary';

const CORRECTIONS: Record<string, string> = {
  'Ignore': 'ignore',
  'rang form to': 'range from ... to',
  'bay contrast': 'by contrast',
  'cop with': 'cope with',
  'un upheaval': 'an upheaval',
  'fore-see': 'foresee',
  'straight forward': 'straightforward',
  'succeed  in/at': 'succeed in/at',
  'succeed in/at': 'succeed in/at',
  'legally  construct': 'legally / construct',
  'legally construct': 'legally / construct',
  'an option  fail to': 'an option / fail to',
  'an option fail to': 'an option / fail to',
  'unrealistic  merely': 'unrealistic / merely',
  'unrealistic merely': 'unrealistic / merely',
  'irrevocable  on the point of': 'irrevocable / on the point of',
  'irrevocable on the point of': 'irrevocable / on the point of',
  'polaris': 'polarise',
  'unction': 'function',
  'disperse with': 'dispense with',
};

const splitCombinedEntry = (entry: string): string[] =>
  entry.split(/\s+\/\s+(?=[a-z])/i).map(item => item.trim()).filter(Boolean);

const importedTerms = rawVocabulary
  .replace(/\r?\n/g, ' ')
  .split(',')
  .map(item => item.replace(/\s+/g, ' ').trim())
  .filter(Boolean)
  .flatMap(item => splitCombinedEntry(CORRECTIONS[item] ?? item));

const uniqueTerms = importedTerms.filter(
  (term, index, terms) =>
    terms.findIndex(candidate => candidate.toLocaleLowerCase() === term.toLocaleLowerCase()) === index,
);

const inferPartOfSpeech = (term: string): Word['partOfSpeech'] => {
  if (/\s|\//.test(term)) return 'phrase';
  if (/ly$/i.test(term)) return 'adverb';
  if (/tion|sion|ment|ness|ity|ism|ance|ence|ship|hood|ure|cy$/i.test(term)) return 'noun';
  if (/able|ible|al|ant|ent|ary|ful|ic|ical|ive|less|ous|ed$/i.test(term)) return 'adjective';
  return 'verb';
};

const capitalise = (term: string) => term.charAt(0).toLocaleUpperCase() + term.slice(1);

const createImportedWord = (term: string, index: number): Word => {
  const entry = ACADEMIC_VOCAB_DICTIONARY[term.toLocaleLowerCase()];
  const label = capitalise(term);

  if (entry) {
    const primarySi = entry.siDef.split('/')[0].trim();
    return {
      id: `l9-w${index + 1}`,
      term: label,
      partOfSpeech: entry.pos,
      definition: entry.def,
      sinhalaDefinition: entry.siDef,
      notes: entry.notes,
      sinhalaNotes: entry.siNotes,
      collocations: entry.collocations.map(([text, sinhala]) => ({ text, sinhala })),
      exampleSentences: entry.examples.map(([en, si]) => ({ en, si })),
      practicePrompt: `Write a formal IELTS sentence using "${term}" (${primarySi}).`,
      bandLevel: 'Band 7.5+',
    };
  }

  const partOfSpeech = inferPartOfSpeech(term);
  return {
    id: `l9-w${index + 1}`,
    term: label,
    partOfSpeech,
    definition: `An academic ${partOfSpeech} used for precise expression in IELTS Speaking and Writing.`,
    sinhalaDefinition: label,
    notes: `Use "${term}" accurately in formal IELTS contexts.`,
    sinhalaNotes: `IELTS විභාගයේදී "${term}" නිවැරදි සන්දර්භය තුළ භාවිත කරන්න.`,
    collocations: [],
    exampleSentences: [],
    practicePrompt: `Write one formal IELTS sentence that uses "${term}" naturally and accurately.`,
    bandLevel: 'Band 7.0+',
  };
};

export const IMPORTED_ACADEMIC_WORDS: Word[] = uniqueTerms.map(createImportedWord);

export const IMPORTED_ACADEMIC_LESSON: Lesson = {
  id: 'lesson-9',
  number: 9,
  title: 'Academic Vocabulary & Cohesion Master List',
  subtitle: 'A comprehensive imported collection for IELTS Speaking and Writing',
  category: 'Academic English',
  description: 'Study the complete supplied vocabulary list as a separate lesson. Repeated entries are removed, while search, bookmarks, pronunciation, flashcards and quizzes remain available for every item.',
  sinhalaDescription: 'ලබා දුන් සම්පූර්ණ වචන ලැයිස්තුව වෙනම පාඩමක් ලෙස අධ්‍යයනය කරන්න. නැවත නැවත ඇති වචන ඉවත් කර ඇති අතර සෙවීම, සලකුණු කිරීම, උච්චාරණය, ෆ්ලෑෂ්කාඩ් සහ ප්‍රශ්නාවලි සෑම අයිතමයකටම ලබා ගත හැක.',
  bannerImage: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=80',
  words: IMPORTED_ACADEMIC_WORDS,
  speakingChallenge: {
    part: 'PART 3 PRACTICE',
    question: 'How does a broad academic vocabulary improve communication in education and professional life?',
    minimumTargetWords: 5,
    sampleBand9Answer: 'A broad academic vocabulary enables speakers to articulate complex ideas with greater precision. It can also make the relationship between evidence and conclusions more evident, provided that sophisticated expressions are used naturally rather than mechanically. Ultimately, vocabulary is most valuable when it clarifies an argument, supports coherent communication and helps the audience comprehend the speaker’s intended meaning.',
    examinerTips: [
      'Choose five items from this lesson and use them in a connected response.',
      'Check the grammatical pattern of each word or phrase before speaking.',
      'Prioritise natural, accurate use over inserting difficult words unnecessarily.',
    ],
  },
  writingChallenge: {
    task: 'IELTS Writing Task 2',
    prompt: 'Some people believe sophisticated vocabulary is the most important feature of academic writing. To what extent do you agree?',
    sampleBand8Paragraph: 'Although a varied vocabulary can make an essay more precise, it cannot compensate for weak reasoning. Complex terms are worthwhile only when they convey the writer’s meaning accurately and contribute to a coherent argument. Consequently, learners should broaden their vocabulary while simultaneously developing grammar, organisation and critical thinking.',
  },
};
