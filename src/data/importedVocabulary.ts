import rawVocabulary from './academic-vocabulary.txt?raw';
import generatedVocabulary from './lesson9.generated.json';
import type { Lesson, Word } from '../types';

const CORRECTIONS: Record<string, string> = {
  'Ignore': 'ignore',
  'rang form to': 'range from ... to',
  'bay contrast': 'by contrast',
  'cop with': 'cope with',
  'un upheaval': 'an upheaval',
  'fore-see': 'foresee',
  'straight forward': 'straightforward',
  'succeed  in/at': 'succeed in/at',
  'legally  construct': 'legally construct',
  'an option  fail to': 'an option / fail to',
  'unrealistic  merely': 'unrealistic / merely',
  'irrevocable  on the point of': 'irrevocable / on the point of',
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

const generatedByTerm = new Map(
  (generatedVocabulary as Word[]).map(word => [word.term.toLocaleLowerCase(), word]),
);

const inferPartOfSpeech = (term: string): Word['partOfSpeech'] => {
  if (/\s|\//.test(term)) return 'phrase';
  if (/ly$/i.test(term)) return 'adverb';
  if (/tion|sion|ment|ness|ity|ism|ance|ence|ship|hood|ure|cy$/i.test(term)) return 'noun';
  if (/able|ible|al|ant|ent|ary|ful|ic|ical|ive|less|ous|ed$/i.test(term)) return 'adjective';
  return 'verb';
};

const capitalise = (term: string) => term.charAt(0).toLocaleUpperCase() + term.slice(1);

const SIMPLE_EXAMPLES: Record<string, string> = {
  'the performance': 'The performance improved this year.',
  meanwhile: 'Meanwhile, the children waited outside.',
  generally: 'Generally, this method works well.',
  influence: 'Friends can influence our decisions.',
  achieve: 'She worked hard to achieve her goal.',
  'a correlation': 'There is a correlation between sleep and health.',
  conclude: 'The researchers conclude that the treatment is safe.',
  'acquainted with': 'I am acquainted with the new rules.',
  practically: 'The old machine is practically useless.',
  'an incidence': 'The town reported an incidence of food poisoning.',
  comparatively: 'This year was comparatively peaceful.',
  'attribute to': 'Experts attribute the decline to rising costs.',
  identical: 'The two answers are identical.',
  particularly: 'I particularly enjoyed the final chapter.',
  consume: 'Old cars consume more fuel.',
  'with regard to': 'With regard to costs, the cheaper plan is better.',
  contain: 'This bottle contains clean water.',
  'integrate into': 'Schools should integrate technology into lessons.',
  vital: 'Clean water is vital for health.',
  'account for': 'Transport costs account for half the budget.',
  threaten: 'Rising seas threaten coastal towns.',
  ignore: 'We should not ignore the warning signs.',
  'a decline': 'The company recorded a decline in sales.',
  allocate: 'The council allocated funds to schools.',
  surplus: 'The farm produced a surplus of rice.',
  'consist of': 'The course consists of ten lessons.',
  undoubtedly: 'This is undoubtedly a serious problem.',
  eventually: 'The rain eventually stopped.',
  plausible: 'Her explanation sounds plausible.',
  occur: 'Accidents can occur at any time.',
  eliminate: 'Vaccines can eliminate some diseases.',
  'lead to': 'Poor diet can lead to illness.',
  'rely on': 'Many farmers rely on seasonal rain.',
  complex: 'Climate change is a complex problem.',
};

const SIMPLE_SINHALA: Record<string, string> = {
  'the performance': 'කාර්ය සාධනය මේ වසරේ වැඩිදියුණු විය.',
  meanwhile: 'මේ අතරතුර ළමයි පිටත බලා සිටියහ.',
  generally: 'සාමාන්‍යයෙන් මෙම ක්‍රමය හොඳින් ක්‍රියා කරයි.',
  influence: 'මිතුරන්ට අපගේ තීරණවලට බලපෑම් කළ හැක.',
  achieve: 'ඇය තම ඉලක්කය සපුරා ගැනීමට වෙහෙස මහන්සි වී වැඩ කළාය.',
  'a correlation': 'නින්ද සහ සෞඛ්‍යය අතර සහසම්බන්ධයක් ඇත.',
  conclude: 'පර්යේෂකයන් මෙම ප්‍රතිකාරය ආරක්ෂිත බව නිගමනය කරති.',
  'acquainted with': 'මම නව නීති ගැන හුරුපුරුදුය.',
  practically: 'පැරණි යන්ත්‍රය ප්‍රායෝගිකව භාවිතයට නුසුදුසුය.',
  'an incidence': 'නගරයෙන් ආහාර විෂවීමේ සිදුවීමක් වාර්තා විය.',
  comparatively: 'මෙම වසර සාපේක්ෂව සාමකාමී විය.',
  'attribute to': 'විශේෂඥයන් පහත වැටීමට හේතුව ඉහළ යන වියදම් බව පවසති.',
  identical: 'පිළිතුරු දෙක එක හා සමානය.',
  particularly: 'මම විශේෂයෙන් අවසාන පරිච්ඡේදය රස වින්දෙමි.',
  consume: 'පැරණි මෝටර් රථ වැඩි ඉන්ධන ප්‍රමාණයක් පරිභෝජනය කරයි.',
  'with regard to': 'වියදම් සම්බන්ධයෙන් ගත් කල, අඩු මිල සැලැස්ම වඩා හොඳය.',
  contain: 'මෙම බෝතලයේ පිරිසිදු ජලය අඩංගුය.',
  'integrate into': 'පාසල් පාඩම්වලට තාක්ෂණය ඒකාබද්ධ කළ යුතුය.',
  vital: 'පිරිසිදු ජලය සෞඛ්‍යයට අත්‍යවශ්‍යය.',
  'account for': 'ප්‍රවාහන වියදම් අයවැයෙන් අඩක් වේ.',
  threaten: 'ඉහළ යන මුහුදු මට්ටම වෙරළබඩ නගරවලට තර්ජනය කරයි.',
  ignore: 'අනතුරු ඇඟවීමේ ලකුණු අප නොසලකා හැරිය යුතු නැත.',
  'a decline': 'සමාගම විකුණුම්වල පහත වැටීමක් වාර්තා කළේය.',
  allocate: 'සභාව පාසල් සඳහා අරමුදල් වෙන් කළේය.',
  surplus: 'ගොවිපොළ අතිරික්ත සහල් ප්‍රමාණයක් නිපදවීය.',
  'consist of': 'පාඨමාලාව පාඩම් දහයකින් සමන්විත වේ.',
  undoubtedly: 'මෙය නිසැකවම බරපතළ ගැටලුවකි.',
  eventually: 'අවසානයේ වැස්ස නතර විය.',
  plausible: 'ඇගේ පැහැදිලි කිරීම විශ්වාස කළ හැකි බව පෙනේ.',
  occur: 'අනතුරු ඕනෑම වේලාවක සිදුවිය හැක.',
  eliminate: 'එන්නත් මගින් සමහර රෝග තුරන් කළ හැක.',
  'lead to': 'අයහපත් ආහාර රටාව රෝගවලට හේතු විය හැක.',
  'rely on': 'බොහෝ ගොවීන් සෘතුමය වර්ෂාව මත රඳා සිටිති.',
  complex: 'දේශගුණික විපර්යාසය සංකීර්ණ ගැටලුවකි.',
};

const buildSimpleExample = (term: string, partOfSpeech: Word['partOfSpeech']): string => {
  const exact = SIMPLE_EXAMPLES[term.toLocaleLowerCase()];
  if (exact) return exact;
  if (/^(the|a|an)\s/i.test(term)) return `${capitalise(term)} was discussed today.`;
  if (partOfSpeech === 'adverb') return `${capitalise(term)}, the plan worked.`;
  if (partOfSpeech === 'adjective') return `The result was ${term}.`;
  if (partOfSpeech === 'noun') return `${capitalise(term)} affects many people.`;
  if (partOfSpeech === 'verb') return `They hope to ${term} soon.`;
  return `Students used ${term} during the discussion.`;
};

const buildSimpleSinhala = (term: string, partOfSpeech: Word['partOfSpeech']): string => {
  const exact = SIMPLE_SINHALA[term.toLocaleLowerCase()];
  if (exact) return exact;
  if (/^(the|a|an)\s/i.test(term)) return `“${term}” යන කරුණ අද සාකච්ඡා කරන ලදී.`;
  if (partOfSpeech === 'adverb') return `තත්ත්වය “${term}” ලෙස වෙනස් විය.`;
  if (partOfSpeech === 'adjective') return `ප්‍රතිඵලය “${term}” විය.`;
  if (partOfSpeech === 'noun') return `“${term}” බොහෝ දෙනෙකුට බලපායි.`;
  if (partOfSpeech === 'verb') return `ඔවුන් ඉක්මනින් “${term}” කිරීමට බලාපොරොත්තු වෙති.`;
  return `ශිෂ්‍යයන් සාකච්ඡාවේදී “${term}” භාවිත කළහ.`;
};

const buildSimpleExamples = (term: string, partOfSpeech: Word['partOfSpeech']) => {
  const base = buildSimpleExample(term, partOfSpeech);
  const lowerBase = base.charAt(0).toLocaleLowerCase() + base.slice(1);
  const baseSi = buildSimpleSinhala(term, partOfSpeech);
  return [
    { en: base, si: baseSi },
    { en: `Last year, ${lowerBase}`, si: `පසුගිය වසරේ, ${baseSi}` },
    { en: `In our town, ${lowerBase}`, si: `අපේ නගරයේදී, ${baseSi}` },
    { en: `According to the report, ${lowerBase}`, si: `වාර්තාවට අනුව, ${baseSi}` },
    { en: `In many cases, ${lowerBase}`, si: `බොහෝ අවස්ථාවලදී, ${baseSi}` },
    { en: `For example, ${lowerBase}`, si: `උදාහරණයක් ලෙස, ${baseSi}` },
  ];
};

const createImportedWord = (term: string, index: number): Word => {
  const generated = generatedByTerm.get(term.toLocaleLowerCase());
  if (generated) return { ...generated, id: `l9-w${index + 1}` };
  const partOfSpeech = inferPartOfSpeech(term);
  const label = capitalise(term);

  return {
    id: `l9-w${index + 1}`,
    term: label,
    partOfSpeech,
    definition: `An academic ${partOfSpeech} from the supplied IELTS master list, included for contextual study and precise use.`,
    sinhalaDefinition: `“${label}” යන ඉංග්‍රීසි ${partOfSpeech === 'phrase' ? 'ප්‍රකාශනය' : 'වචනය'} — සන්දර්භය සමඟ අධ්‍යයනය කරන්න.`,
    notes: `Practise the meaning, grammar and natural word partnerships of “${term}” before using it in an IELTS response.`,
    sinhalaNotes: `“${term}” IELTS පිළිතුරක භාවිත කිරීමට පෙර එහි නිවැරදි අර්ථය, ව්‍යාකරණය සහ යෙදුම පුහුණු වන්න.`,
    collocations: [
      { text: `${label} in context`, sinhala: `“${label}” සන්දර්භය තුළ` },
      { text: `Use ${term} accurately`, sinhala: `“${term}” නිවැරදිව භාවිත කිරීම` },
      { text: `Academic use of ${term}`, sinhala: `“${term}” හි අධ්‍යයන භාවිතය` },
    ],
    exampleSentences: buildSimpleExamples(term, partOfSpeech),
    practicePrompt: `Write one formal IELTS sentence that uses “${term}” naturally and accurately.`,
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
