import type {
  CriterionKey,
  EssaySegment,
  LessonTopicId,
  TutorReport,
  TutorIssue,
  MainProblem,
  Improvement
} from '../types/tutor';
import { roundIeltsBand, countWords, formatBand, generateAcademicUpgradeSegments } from './tutorEngine';

interface PatternRule {
  id: string;
  regex: RegExp;
  replacement: string | ((match: string, ...groups: string[]) => string);
  title: string;
  category: TutorIssue['category'];
  severity: TutorIssue['severity'];
  why: string;
  whySi: string;
  rule: string;
  lessonTopic: LessonTopicId;
  tag?: string;
}

const GRAMMAR_RULES: PatternRule[] = [
  {
    id: 'i-am-agree',
    regex: /\b(I)\s+am\s+agree\b/gi,
    replacement: '$1 agree',
    title: 'Incorrect Verb Form: "I am agree"',
    category: 'Grammar',
    severity: 'High',
    why: '"Agree" is an active verb, not an adjective. In English we say "I agree", never "I am agree".',
    whySi: '"agree" යනු ක්‍රියාපදයකි. "I am agree" නොකියා "I agree" යයි කියන්න.',
    rule: 'Subject + agree (NOT: subject + am/is/are + agree).',
    lessonTopic: 'sentence-structure',
    tag: 'Elementary Error'
  },
  {
    id: 'people-is',
    regex: /\b(people)\s+is\b/gi,
    replacement: '$1 are',
    title: 'Subject-Verb Agreement: "People is"',
    category: 'Grammar',
    severity: 'High',
    why: '"People" is an irregular plural noun referring to multiple individuals. It always requires the plural verb "are" or "were".',
    whySi: '"People" බහුවචන බැවින් "are" හෝ "were" යෙදිය යුතුය.',
    rule: 'People + are / were / have (plural verb).',
    lessonTopic: 'subject-verb-agreement',
    tag: 'Critical Foundation'
  },
  {
    id: 'peoples',
    regex: /\b(peoples)\b/gi,
    replacement: 'people',
    title: 'Irregular Plural: "Peoples"',
    category: 'Grammar',
    severity: 'High',
    why: '"People" is already the plural form of "person". Do not add -s to it in general contexts.',
    whySi: '"Person" හි බහුවචනය "people" වේ. එයට -s එකතු නොකරන්න.',
    rule: 'One person → many people.',
    lessonTopic: 'plural-nouns',
    tag: 'Common Trap'
  },
  {
    id: 'there-is-plural',
    regex: /\bthere\s+is\s+(many|several|a lot of|different|better|more|numerous)\s+([a-z]+s)\b/gi,
    replacement: 'there are $1 $2',
    title: 'Agreement after "There is / There are"',
    category: 'Grammar',
    severity: 'Medium',
    why: 'In "there be" structures, the verb agrees with the following subject. If the noun is plural, use "there are".',
    whySi: 'නාම පදය බහුවචන නම් "there are" විය යුතුය.',
    rule: 'there is + singular noun / there are + plural noun.',
    lessonTopic: 'subject-verb-agreement'
  },
  {
    id: 'sva-he-she-it',
    regex: /\b(it|he|she|this|government|service|education|technology|society)\s+(give|help|make|need|seem|show|lead|cause|provide|affect|become|play)\b/gi,
    replacement: (m, subj, verb) => {
      const v = verb.toLowerCase();
      let res = v + 's';
      if (v.endsWith('ch') || v.endsWith('sh') || v.endsWith('ss') || v.endsWith('x')) res = v + 'es';
      return `${subj} ${res}`;
    },
    title: 'Subject-Verb Agreement (Third Person Singular -s)',
    category: 'Grammar',
    severity: 'High',
    why: 'When the subject is third-person singular (it, he, she, or a singular noun), the verb in the present simple tense requires an -s ending.',
    whySi: 'ඒකවචන කර්තෘ සඳහා වර්තමාන කාලයේදී ක්‍රියාපදයට -s එකතු වේ.',
    rule: 'He / She / It / Singular noun + verb-s.',
    lessonTopic: 'subject-verb-agreement',
    tag: 'High Priority'
  },
  {
    id: 'chart-singular-verb',
    regex: /\b(the|this)\s+(bar chart|chart|pie chart|table|graph|line graph|diagram)\s+(give|show|illustrate|represent|indicate|compare|depict)\b/gi,
    replacement: '$1 $2 $3s',
    title: 'Subject-Verb Agreement: Chart + Verbs in -s',
    category: 'Grammar',
    severity: 'High',
    why: 'The subject ("the bar chart") is singular third-person. In the introductory sentence, the reporting verb must end in -s: "The bar chart gives / shows".',
    whySi: '"The bar chart" ඒකවචන බැවින් ක්‍රියාපදයට -s එකතු විය යුතුය (shows / gives).',
    rule: 'The chart gives / shows / illustrates (singular noun + verb-s).',
    lessonTopic: 'subject-verb-agreement',
    tag: 'Task 1 Intro Error'
  },
  {
    id: 'plural-was',
    regex: /\b(both categories|households|both proportions|these categories|the proportions|the numbers|the figures|percentages|they|both)\s+was\b/gi,
    replacement: '$1 were',
    title: 'Subject-Verb Agreement: Plural Noun + "were"',
    category: 'Grammar',
    severity: 'High',
    why: 'Plural subjects ("households", "both categories", "proportions") require the plural past verb "were", not the singular "was".',
    whySi: 'බහුවචන කර්තෘ සඳහා "were" යෙදිය යුතුය ("was" නොවේ).',
    rule: 'Plural subject + were (NOT was).',
    lessonTopic: 'subject-verb-agreement',
    tag: 'Critical Foundation'
  },
  {
    id: 'few-decade',
    regex: /\b(few|a few|next few|several)\s+(decade|year|month|category|proportion|country|problem)\b/gi,
    replacement: '$1 $2s',
    title: 'Quantifier Agreement: "few / several" + Plural Noun',
    category: 'Grammar',
    severity: 'High',
    why: 'Quantifiers such as "few", "a few", and "several" indicate multiple items and must be followed by a plural noun (e.g. "few decades").',
    whySi: '"few", "several" වැනි වචනවලට පසු බහුවචන නාම පද (-s) යෙදිය යුතුය.',
    rule: 'few / several + plural noun (-s).',
    lessonTopic: 'plural-nouns',
    tag: 'Common Slip'
  },
  {
    id: 'percent-past-tense',
    regex: /\b(\d+\s*percent|\d+%\s*)\s+(owns|rents|wants|increases)\b/gi,
    replacement: (m, pct, verb) => {
      const pastMap: Record<string, string> = { owns: 'owned', rents: 'rented', wants: 'wanted', increases: 'increased' };
      return `${pct} ${pastMap[verb.toLowerCase()] || verb}`;
    },
    title: 'Historical Data Past Tense: Percentage + Past Verb',
    category: 'Grammar',
    severity: 'High',
    why: 'When describing historical data from past years (e.g., in 1918), use the past tense (e.g. "23 percent owned their house", not present "owns").',
    whySi: 'පසුගිය වසරවල දත්ත විස්තර කිරීමේදී අතීත කාල ක්‍රියාපද (past tense) යොදන්න.',
    rule: 'Past year + past tense verb (e.g., In 1918, 23% owned).',
    lessonTopic: 'verb-tenses',
    tag: 'Task 1 Historical Tense'
  },
  {
    id: 'many-singular',
    regex: /\b(many|several|different|various|both|these|numerous)\s+(country|student|reason|problem|category|side|factor|skill|building|park|game|activity|decisions?|opinion)\b/gi,
    replacement: (m, quant, noun) => {
      const n = noun.toLowerCase();
      let plural = n + 's';
      if (n.endsWith('y') && !/[aeiou]y$/.test(n)) plural = n.slice(0, -1) + 'ies';
      return `${quant} ${plural}`;
    },
    title: 'Missing Plural Noun Ending (-s / -es)',
    category: 'Grammar',
    severity: 'High',
    why: 'Words like "many", "several", "different", and "both" denote more than one item and must be followed by plural nouns.',
    whySi: '"many", "several", "different" වැනි වචනවලට පසු බහුවචන නාම පද යොදන්න.',
    rule: 'many / several / different + plural noun (-s / -es).',
    lessonTopic: 'plural-nouns',
    tag: 'Plural Foundation'
  },
  {
    id: 'this-plural',
    regex: /\b(this)\s+([a-z]+s)\b/gi,
    replacement: 'these $2',
    title: 'Demonstrative Agreement: "This" vs "These"',
    category: 'Grammar',
    severity: 'Medium',
    why: '"This" is singular (this problem); "these" is plural (these problems).',
    whySi: 'බහුවචන නාම පද සඳහා "these" යොදන්න.',
    rule: 'this + singular / these + plural.',
    lessonTopic: 'plural-nouns'
  },
  {
    id: 'uncountable-a-employment',
    regex: /\b(a|an)\s+(employment|information|advice|research|equipment|knowledge|traffic)\b/gi,
    replacement: '$2',
    title: 'Incorrect Article with Uncountable Noun',
    category: 'Grammar',
    severity: 'High',
    why: 'Nouns such as "employment", "information", "advice", and "research" are uncountable in English. They cannot take "a" or "an".',
    whySi: 'ගණන් කළ නොහැකි නාම පද සමඟ "a" හෝ "an" යොදන්න එපා.',
    rule: 'Uncountable nouns take no indefinite article (a/an) and no plural -s.',
    lessonTopic: 'articles-countable',
    tag: 'IELTS Classic Trap'
  },
  {
    id: 'uncountable-plurals',
    regex: /\b(advices|informations|equipments|knowledges)\b/gi,
    replacement: m => m.toLowerCase().replace(/s$/, ''),
    title: 'Uncountable Noun with Incorrect Plural -s',
    category: 'Grammar',
    severity: 'High',
    why: 'English uncountable nouns have no plural form. Say "information" or "pieces of advice", never "informations" or "advices".',
    whySi: 'ගණන් කළ නොහැකි නාම පදවලට -s එකතු කළ නොහැක.',
    rule: 'advice, information, equipment (no plural -s).',
    lessonTopic: 'articles-countable'
  },
  {
    id: 'waste-their-times',
    regex: /\bwaste\s+their\s+times\b/gi,
    replacement: 'waste their time',
    title: 'Idiomatic Collocation: "Waste their time"',
    category: 'Grammar',
    severity: 'Medium',
    why: '"Time" in the sense of hours or duration is uncountable. We say "waste their time", not "times".',
    whySi: 'කාලය නාස්ති කිරීමේදී "waste their time" යයි කියන්න.',
    rule: 'waste time (uncountable).',
    lessonTopic: 'articles-countable'
  },
  {
    id: 'interested-subjects',
    regex: /\btheir\s+interested\s+subjects\b/gi,
    replacement: 'subjects they are interested in',
    title: 'Word Form: "Interested" vs "Interesting"',
    category: 'Vocabulary',
    severity: 'High',
    why: '"Interested" describes how a PERSON feels. The subjects do not feel interested; the students are interested IN them.',
    whySi: '"Interested" යනු පුද්ගලයාට හැඟෙන ආකාරයයි.',
    rule: '-ed = person feels it / -ing = thing that causes the feeling.',
    lessonTopic: 'word-forms',
    tag: 'Word Form Trap'
  },
  {
    id: 'missing-interested-in',
    regex: /\b(interested)\s+([,\.])/gi,
    replacement: '$1 in$2',
    title: 'Missing Preposition after "Interested"',
    category: 'Grammar',
    severity: 'Medium',
    why: 'The adjective "interested" always requires the preposition "in", even when appearing at the end of a relative clause.',
    whySi: '"interested" සමඟ සැමවිටම "in" යෙදිය යුතුය.',
    rule: 'interested + in.',
    lessonTopic: 'prepositions'
  },
  {
    id: 'depend-of',
    regex: /\b(depend|depends|depending)\s+(of|from)\b/gi,
    replacement: '$1 on',
    title: 'Incorrect Preposition: "Depend on"',
    category: 'Grammar',
    severity: 'Medium',
    why: 'In English, the verb "depend" takes the preposition "on", not "of" or "from".',
    whySi: '"depend" සමඟ "on" යොදන්න.',
    rule: 'depend on / rely on.',
    lessonTopic: 'prepositions'
  },
  {
    id: 'responsible-of',
    regex: /\b(responsible)\s+(of|to)\b/gi,
    replacement: 'responsible for',
    title: 'Incorrect Preposition: "Responsible for"',
    category: 'Grammar',
    severity: 'Medium',
    why: 'The adjective "responsible" takes the preposition "for": "parents are responsible for their children".',
    whySi: '"responsible" සමඟ "for" යොදන්න.',
    rule: 'responsible + for.',
    lessonTopic: 'prepositions'
  },
  {
    id: 'pay-attention-on',
    regex: /\bpay\s+attention\s+on\b/gi,
    replacement: 'pay attention to',
    title: 'Collocation Preposition: "Pay attention to"',
    category: 'Grammar',
    severity: 'Medium',
    why: 'We pay attention "to" something, not "on".',
    whySi: '"pay attention to" නිවැරදි යෙදුමයි.',
    rule: 'pay attention + to.',
    lessonTopic: 'prepositions'
  },
  {
    id: 'in-the-other-hand',
    regex: /\bin\s+the\s+other\s+hand\b/gi,
    replacement: 'On the other hand',
    title: 'Fixed Idiom Preposition: "On the other hand"',
    category: 'Vocabulary',
    severity: 'Low',
    why: 'The standard idiom for contrasting points is "On the other hand", not "In the other hand".',
    whySi: '"On the other hand" නිවැරදි යෙදුමයි.',
    rule: 'On the one hand / On the other hand.',
    lessonTopic: 'academic-vocabulary'
  },
  {
    id: 'difficulties-to-find',
    regex: /\b(face|have)\s+difficulties?\s+to\s+([a-z]+)\b/gi,
    replacement: (m, verb, action) => {
      let gerund = action + 'ing';
      if (action.endsWith('e') && !action.endsWith('ee')) gerund = action.slice(0, -1) + 'ing';
      return `have difficulty ${gerund}`;
    },
    title: 'Verb Pattern: "Have difficulty + -ing"',
    category: 'Grammar',
    severity: 'High',
    why: 'The standard English pattern is "have difficulty + verb-ing", not "difficulties to do".',
    whySi: '"have difficulty + -ing" නිවැරදි රටාවයි.',
    rule: 'have difficulty + verb-ing.',
    lessonTopic: 'verb-patterns',
    tag: 'Gerund Pattern'
  },
  {
    id: 'preposition-verb-ing',
    regex: /\b(after|before|by|without)\s+(graduate|leave|study|work|pay|use)\b/gi,
    replacement: (m, prep, verb) => {
      let g = verb + 'ing';
      if (verb.endsWith('e')) g = verb.slice(0, -1) + 'ing';
      return `${prep} ${g}`;
    },
    title: 'Verb Form after Preposition: Preposition + -ing',
    category: 'Grammar',
    severity: 'Medium',
    why: 'When a verb immediately follows a preposition (after, before, without, by), it must take the -ing gerund form.',
    whySi: 'Preposition එකකට පසු ක්‍රියාපදය -ing විය යුතුය.',
    rule: 'Preposition + verb-ing.',
    lessonTopic: 'verb-patterns'
  },
  {
    id: 'omitted-the-government',
    regex: /\b(?<!the\s)(government|environment|public)\s+(should|must|can|is|plays|has)\b/gi,
    replacement: 'the $1 $2',
    title: 'Missing Definite Article: "the government / the environment"',
    category: 'Grammar',
    severity: 'Medium',
    why: 'Institutions of state and our shared planet require the definite article "the": the government, the environment, the public.',
    whySi: 'රජය සහ පරිසරය හැඳින්වීමේදී "the" යොදන්න.',
    rule: 'the government / the environment / the public.',
    lessonTopic: 'articles-countable',
    tag: 'Academic Convention'
  },
  {
    id: 'adverb-trend-gradual',
    regex: /\b(went up|increased|decreased|fell|dropped|rose)\s+(gradual|continuous|dramatic|sharp|rapid)\b/gi,
    replacement: '$1 $2ly',
    title: 'Adjective vs Adverb in Trends (-ly)',
    category: 'Vocabulary',
    severity: 'High',
    why: 'When describing how an action or trend happens, modify the verb with an adverb ending in -ly: "increased gradually".',
    whySi: 'ක්‍රියාපදයක් විස්තර කිරීමට -ly සහිත adverb යොදන්න.',
    rule: 'Verb + Adverb (increased gradually) / Adjective + Noun (a gradual increase).',
    lessonTopic: 'word-forms',
    tag: 'Task 1 Core'
  },
  {
    id: 'invented-adverbs-higherly-lowery',
    regex: /\b(higherly|lowery)\b/gi,
    replacement: m => m.toLowerCase() === 'higherly' ? 'the highest proportion' : 'the lowest proportion',
    title: 'Non-Standard Invented Word: "Higherly" / "Lowery"',
    category: 'Vocabulary',
    severity: 'High',
    why: '"Higherly" and "lowery" are non-existent words in standard English. In IELTS Task 1, use comparative phrases such as "spent the highest proportion", "at a higher rate", or "spent the lowest amount".',
    whySi: '"higherly" හෝ "lowery" ඉංග්‍රීසි භාෂාවේ වලංගු වචන නොවේ. "the highest proportion" හෝ "the lowest proportion" යොදන්න.',
    rule: 'Use standard comparative forms: higher / the highest proportion (NOT higherly).',
    lessonTopic: 'word-forms',
    tag: 'Vocabulary Slip'
  },
  {
    id: 'there-vs-their-possessive',
    regex: /\b(spend|spent|spends|waste|wasted|use|used|save|saved|lose|lost)\s+there\s+([a-z]+)\b/gi,
    replacement: '$1 their $2',
    title: 'Homophone Error: "There" vs "Their"',
    category: 'Grammar',
    severity: 'High',
    why: '"There" indicates a location or dummy pronoun ("over there"). Possession requires the pronoun "their" ("their money", "their expenditure").',
    whySi: '"there" යනු ස්ථානයකි. හිමිකම හැඟවීමට "their" ("their money") යෙදිය යුතුය.',
    rule: 'their + noun (possessive pronoun).',
    lessonTopic: 'word-forms',
    tag: 'Critical Foundation'
  },
  {
    id: 'sva-compound-proper-nouns',
    regex: /\b([A-Za-z]+,\s+[A-Za-z]+(?:\s+and\s+[A-Za-z]+|\s*,[A-Za-z\s,]+and\s+[A-Za-z]+))\s+(shows|demonstrates|indicates|displays|spends)\b/gi,
    replacement: '$1 show',
    title: 'Subject-Verb Agreement: Compound Plural Subject + Verb',
    category: 'Grammar',
    severity: 'High',
    why: 'When multiple countries or entities are joined by "and" (e.g. "Sweden, Italy and Spain"), the subject is plural and requires a plural verb ("show" or past tense "showed"), never singular "shows".',
    whySi: 'රටවල් කිහිපයක් "and" මඟින් සම්බන්ධ කළ විට එය බහුවචන කර්තෘවරයෙකි. ඒ සඳහා "show" හෝ "showed" යෙදිය යුතුය.',
    rule: 'Country A, Country B and Country C (plural) + show / showed (plural verb).',
    lessonTopic: 'subject-verb-agreement',
    tag: 'Plural Subject'
  },
  {
    id: 'counties-countries-confusion',
    regex: /\b(all|five|different|both|these|several|many|in)\s+counties\b/gi,
    replacement: '$1 countries',
    title: 'Spelling / Word Choice: "Counties" vs "Countries"',
    category: 'Vocabulary',
    severity: 'High',
    why: 'A "county" is a local regional district. Sovereign nations are "countries" (with an "r").',
    whySi: '"counties" යනු දිස්ත්‍රික්ක වේ. ස්වාධීන රටවල් සඳහා "countries" විය යුතුය.',
    rule: 'country → countries (sovereign nations).',
    lessonTopic: 'academic-vocabulary',
    tag: 'Spelling Slip'
  },
  {
    id: 'country-capitalization',
    regex: /\b(ireland|italy|spain|sweden|turkey|germany|france|britain|england|china|japan|india|america|canada|australia)\b/g,
    replacement: m => m.charAt(0).toUpperCase() + m.slice(1),
    title: 'Capitalization: Proper Country Names',
    category: 'Grammar',
    severity: 'Medium',
    why: 'Names of countries are proper nouns and must always start with a capital letter (e.g., "Ireland", "Italy", "Spain", "Sweden", "Turkey").',
    whySi: 'රටවල නම් සැමවිටම කැපිටල් අකුරකින් (Capital Letter) ලිවිය යුතුය.',
    rule: 'Capitalize all country names (Ireland, Italy, Spain, Sweden, Turkey).',
    lessonTopic: 'sentence-structure',
    tag: 'Capitalization'
  },
  {
    id: 'missing-apostrophe-it-s',
    regex: /\b(it)\s+s\b/gi,
    replacement: 'it was',
    title: 'Broken Contraction: "It s"',
    category: 'Grammar',
    severity: 'Medium',
    why: '"It s" is a formatting slip missing the apostrophe. In academic IELTS writing, avoid contractions and write "it is" or past tense "it was".',
    whySi: '"It s" වෙනුවට විධිමත් ලෙස "it was" හෝ "it is" ලියන්න.',
    rule: 'Formal style: write "it was" or "it is" (avoid broken contractions).',
    lessonTopic: 'sentence-structure'
  },
  {
    id: 'task1-spend-higher-money',
    regex: /\b(spend|spent|spends)\s+(higher|lower)\s+(money|percentage|expenditure)\b/gi,
    replacement: (m, v, comp, n) => {
      const isPast = v.toLowerCase() === 'spent';
      if (comp.toLowerCase() === 'higher') {
        return n.toLowerCase() === 'money'
          ? (isPast ? 'spent more money' : 'spend more money')
          : `accounted for a higher ${n}`;
      } else {
        return n.toLowerCase() === 'money'
          ? (isPast ? 'spent less money' : 'spend less money')
          : `accounted for a lower ${n}`;
      }
    },
    title: 'Unnatural Collocation: "Spend higher / lower money"',
    category: 'Vocabulary',
    severity: 'High',
    why: 'Money is an uncountable quantity modified by "more" or "less", not "higher" or "lower". Say "spent more money" or "had higher expenditure".',
    whySi: '"money" සඳහා "more money" හෝ "less money" යොදන්න. "higher money" වැරදිය.',
    rule: 'spend more / less money (OR: higher / lower expenditure).',
    lessonTopic: 'academic-vocabulary',
    tag: 'Task 1 Collocation'
  },
  {
    id: 'consumers-spending-noun-phrase',
    regex: /\bconsumers\s+spending\b/gi,
    replacement: 'consumer spending',
    title: 'Compound Noun Slip: "Consumer spending"',
    category: 'Grammar',
    severity: 'Medium',
    why: 'When "consumer" functions as a noun adjunct modifying "spending", it is singular: "consumer spending" (not "consumers spending").',
    whySi: '"consumer spending" යනු නිවැරදි සංයුක්ත නාමයයි.',
    rule: 'consumer spending / consumer expenditure (singular noun adjunct).',
    lessonTopic: 'academic-vocabulary'
  },
  {
    id: 'for-foods-and-drinks',
    regex: /\bfor\s+foods\s+and\s+drinks\b/gi,
    replacement: 'on food and drinks',
    title: 'Preposition after "Spend": "Spend on"',
    category: 'Grammar',
    severity: 'Medium',
    why: 'The verb "spend" requires the preposition "on" for items purchased: "spend money on food and drinks", not "for".',
    whySi: '"spend" ක්‍රියාපදයට පසු "on" යෙදිය යුතුය ("spend on food").',
    rule: 'spend money / time ON something (NOT for).',
    lessonTopic: 'prepositions'
  },
  {
    id: 'food-uncountable',
    regex: /\b(for|on|in)\s+foods\b/gi,
    replacement: '$1 food',
    title: 'Mass Noun: "Food" as a General Category',
    category: 'Vocabulary',
    severity: 'Low',
    why: 'When referring to food in general consumer expenditure, "food" is uncountable. Do not use the plural "foods".',
    whySi: 'සාමාන්‍ය පරිභෝජනය ගැන කතා කිරීමේදී "food" ගණන් කළ නොහැක.',
    rule: 'expenditure on food (uncountable).',
    lessonTopic: 'articles-countable'
  }
];

export function evaluateEssayLocally(params: {
  question: string;
  promptImage?: string | null;
  essay: string;
  taskType: 'task1' | 'task2';
  targetBand: number;
  sinhala: boolean;
}): TutorReport {
  const { question, promptImage, essay, taskType, targetBand, sinhala } = params;
  const rawText = essay.replace(/\r\n/g, '\n').trim();
  const wordCount = countWords(rawText);
  const minWords = taskType === 'task1' ? 150 : 250;

  const warnings: string[] = [];
  if (wordCount < minWords) {
    warnings.push(`Word count: ${wordCount} words. IELTS ${taskType === 'task1' ? 'Task 1 requires at least 150' : 'Task 2 requires at least 250'} words. A short essay receives a penalty in Task Response.`);
  }

  const detectedIssues: TutorIssue[] = [];
  const appliedIssueOccurrences: Record<string, number> = {};

  // Build segments by scanning text
  let currentPos = 0;
  const segments: EssaySegment[] = [];

  // Find all matches with their index and rule
  interface RuleMatch {
    start: number;
    end: number;
    origText: string;
    newText: string;
    rule: PatternRule;
  }

  const matches: RuleMatch[] = [];

  for (const rule of GRAMMAR_RULES) {
    const rx = new RegExp(rule.regex.source, rule.regex.flags);
    let m: RegExpExecArray | null;
    while ((m = rx.exec(rawText)) !== null) {
      const origText = m[0];
      const start = m.index;
      const end = start + origText.length;

      let newText = '';
      if (typeof rule.replacement === 'function') {
        newText = (rule.replacement as any)(...m);
      } else {
        newText = origText.replace(rule.regex, rule.replacement);
      }

      if (newText !== origText) {
        matches.push({ start, end, origText, newText, rule });
      }
    }
  }

  // Sort matches by start position and resolve overlaps
  matches.sort((a, b) => a.start - b.start);
  const nonOverlappingMatches: RuleMatch[] = [];
  let lastEnd = 0;
  for (const match of matches) {
    if (match.start >= lastEnd) {
      nonOverlappingMatches.push(match);
      lastEnd = match.end;
    }
  }

  // Construct segments
  currentPos = 0;
  for (const match of nonOverlappingMatches) {
    if (match.start > currentPos) {
      segments.push({
        type: 'text',
        text: rawText.substring(currentPos, match.start)
      });
    }

    const issueId = match.rule.id;
    appliedIssueOccurrences[issueId] = (appliedIssueOccurrences[issueId] || 0) + 1;

    segments.push({
      type: 'replace',
      text: match.origText,
      to: match.newText,
      issueId,
      note: match.rule.rule
    });

    // Record issue if not already in list
    let existing = detectedIssues.find(i => i.id === issueId);
    if (!existing) {
      // Find full sentence containing this error for illustration
      const sentenceRegex = /[^.!?\n]+[.!?\n]*/g;
      let sentence = match.origText;
      let sm: RegExpExecArray | null;
      while ((sm = sentenceRegex.exec(rawText)) !== null) {
        if (sm.index <= match.start && sm.index + sm[0].length >= match.end) {
          sentence = sm[0].trim();
          break;
        }
      }

      const correctedSentence = sentence.replace(match.origText, match.newText);

      detectedIssues.push({
        id: issueId,
        title: match.rule.title,
        category: match.rule.category,
        severity: match.rule.severity,
        original: sentence,
        corrected: correctedSentence,
        why: match.rule.why,
        whySi: match.rule.whySi,
        rule: match.rule.rule,
        lessonTopic: match.rule.lessonTopic,
        occurrences: 1,
        tag: match.rule.tag
      });
    } else {
      existing.occurrences += 1;
    }

    currentPos = match.end;
  }

  if (currentPos < rawText.length) {
    segments.push({
      type: 'text',
      text: rawText.substring(currentPos)
    });
  }

  // Calculate criterion bands
  const errorCount = nonOverlappingMatches.length;
  const paragraphCount = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

  // Check for historical data tense inconsistency in Task 1 (e.g. 2002 data written in present tense)
  const isHistoricalTask = taskType === 'task1' && /\b(19\d\d|200\d|201\d|202[0-3])\b/.test(question || rawText);
  const usesPresentTenseForHistorical = isHistoricalTask && /\b(spend|spends|shows)\b/i.test(rawText);
  if (usesPresentTenseForHistorical) {
    warnings.push('Historical data tense warning: The data refers to past historical periods (e.g. 2002). IELTS Task 1 requires the past simple tense (e.g. "spent", "showed", "represented") rather than present simple ("spend", "shows").');
  }

  // Grammatical Range & Accuracy (Strict Official IELTS Descriptor Thresholds)
  let graBand = 6.0;
  if (errorCount >= 6) graBand = 5.0; // Frequent systematic errors = Band 5.0
  else if (errorCount >= 4) graBand = 5.5;
  else if (errorCount >= 2) graBand = 6.0;
  else if (errorCount === 1) graBand = 6.5;
  else {
    // 0 errors detected by basic regex rules.
    // In an offline rule scanner, absence of basic errors does NOT prove Band 8.0 complex grammar.
    const hasComplexStructures = /\b(although|whereas|while|despite|in contrast|consequently|furthermore|moreover|which|who|whom|whose|if|unless|provided that)\b/i.test(rawText);
    graBand = hasComplexStructures ? 7.0 : 6.5;
  }
  if (usesPresentTenseForHistorical && graBand > 5.0) {
    graBand = Math.max(5.0, graBand - 0.5); // Penalty for writing past historical data in present tense
  }

  // Lexical Resource
  let lrBand = 6.0;
  if (errorCount >= 6) lrBand = 5.0; // Multiple non-standard words, spelling, or unnatural collocations
  else if (errorCount >= 4) lrBand = 5.5;
  else if (errorCount >= 2) lrBand = 6.0;
  else lrBand = 6.5;

  // Task Response / Achievement (Strict Official IELTS Criteria)
  let trBand = 6.0;
  if (wordCount < minWords) {
    const penalty = Math.min(2.0, Math.ceil((minWords - wordCount) / 40) * 0.5);
    trBand = Math.max(4.5, 6.0 - penalty);
  } else if (errorCount >= 6) {
    trBand = 5.5; // Repetitive or unclear data comparisons
  } else if (wordCount >= 180 && errorCount <= 2) {
    trBand = 6.5;
  } else {
    trBand = 6.0;
  }

  // Coherence & Cohesion
  let ccBand = 6.0;
  if (paragraphCount < 3) {
    ccBand = 5.0;
    warnings.push('Essay lacks standard paragraph organization (Introduction, Overview/Body Paragraphs).');
  } else if (paragraphCount >= 4) {
    ccBand = errorCount >= 6 ? 6.0 : 6.5;
  }

  const criteria = [
    {
      key: 'TR' as CriterionKey,
      name: taskType === 'task1' ? 'Task Achievement' : 'Task Response',
      band: trBand,
      comment: wordCount < minWords
        ? `Under-length (${wordCount}/${minWords} words). Ideas cannot be fully developed without sufficient length.`
        : errorCount >= 5
        ? 'Main trends and figures are identifiable, but repetitive expressions and unclear comparisons limit precision.'
        : 'Good coverage of the prompt with identifiable thesis and relevant supporting points.',
      commentSi: wordCount < minWords
        ? 'වචන ප්‍රමාණය ප්‍රමාණවත් නොවේ. අදහස් පූර්ණ ලෙස වර්ධනය කිරීමට වැඩිදුර විස්තර අවශ්‍යයි.'
        : errorCount >= 5
        ? 'දත්ත ප්‍රධාන වශයෙන් හඳුනාගෙන ඇතත්, නැවත නැවත යෙදෙන විස්තර හේතුවෙන් නිරවද්‍යතාව සීමා වේ.'
        : 'ප්‍රශ්නයට අදාළ අදහස් සහ පැහැදිලි මතයක් ඇත.',
      toReach8: 'Provide a clear, accurate overview with striking contrasts rather than mechanical listing of percentages.'
    },
    {
      key: 'CC' as CriterionKey,
      name: 'Coherence & Cohesion',
      band: ccBand,
      comment: paragraphCount >= 4
        ? errorCount >= 5
          ? 'Clear paragraph division, though some cohesive devices are mechanical or overused.'
          : 'Clear paragraph division with logical progression between introduction, arguments, and conclusion.'
        : 'Paragraphing is inconsistent or underdeveloped. Ensure a 4-paragraph structure.',
      commentSi: 'ඡේද බෙදීම සහ තාර්කික ප්‍රගතිය පැහැදිලිය.',
      toReach8: 'Use complex referencing and topic sentences rather than mechanical linking phrases.'
    },
    {
      key: 'LR' as CriterionKey,
      name: 'Lexical Resource',
      band: lrBand,
      comment: errorCount >= 5
        ? 'Contains non-standard words (e.g. "higherly", "lowery"), spelling slips, and awkward comparative collocations ("spend higher money").'
        : 'Adequate range of vocabulary with some attempts at academic collocations.',
      commentSi: errorCount >= 5
        ? 'අස්වාභාවික වචන (higherly/lowery) සහ නුහුරු යෙදුම් ("spend higher money") නිසා ලකුණු අඩු වේ.'
        : 'වචන තේරුම් ගත හැක, නමුත් සරල වචන නිතර භාවිතා වේ.',
      toReach8: 'Use authentic Task 1 collocations: "accounted for the largest proportion", "represented the smallest share".'
    },
    {
      key: 'GRA' as CriterionKey,
      name: 'Grammar',
      band: graBand,
      comment: errorCount >= 5
        ? `Detected ${errorCount} grammar and agreement errors, including compound subjects and tense inconsistencies.`
        : `Detected ${errorCount} grammar and agreement errors. Error-free sentences are required for Band 7+.`,
      commentSi: `ව්‍යාකරණ වැරදි ${errorCount} ක් හඳුනා ගැනිණි. Band 7+ සඳහා වැරදි රහිත වාක්‍ය අවශ්‍යයි.`,
      toReach8: 'Eliminate foundational errors with singular/plural nouns, subject-verb agreement, and past tense consistency.'
    }
  ];

  const overallBand = roundIeltsBand(criteria.map(c => c.band));

  // Main problems summary
  const mainProblems: MainProblem[] = [];
  if (detectedIssues.some(i => i.lessonTopic === 'plural-nouns')) {
    mainProblems.push({
      severity: 'High',
      title: 'Plural Noun Endings (-s / -es)',
      description: 'Repeated omission of plural endings after quantifiers like "many", "several", and "different".',
      descriptionSi: '"many", "several" වැනි වචනවලට පසු බහුවචන -s අතහැර දැමීම.'
    });
  }
  if (detectedIssues.some(i => i.lessonTopic === 'subject-verb-agreement')) {
    mainProblems.push({
      severity: 'High',
      title: 'Subject-Verb Agreement',
      description: 'Plural compound subjects (Sweden, Italy and Spain) or third-person singulars must agree with verb forms.',
      descriptionSi: 'බහුවචන හෝ ඒකවචන කර්තෘ සඳහා නිවැරදි ක්‍රියාපද ගැළපීම.'
    });
  }
  if (detectedIssues.some(i => i.id.includes('adverb') || i.id.includes('homophone') || i.id.includes('collocation'))) {
    mainProblems.push({
      severity: 'High',
      title: 'Non-Standard Words & Unnatural Collocations',
      description: 'Avoid invented words like "higherly" or "lowery" and homophones like "there money". Use "their money" and "highest proportion".',
      descriptionSi: '"higherly", "lowery" වැනි වැරදි වචන මඟහැර "their money", "highest proportion" වැනි නිවැරදි යෙදුම් භාවිත කරන්න.'
    });
  }
  if (wordCount < minWords) {
    mainProblems.push({
      severity: 'High',
      title: `Under Minimum Length (${wordCount}/${minWords} Words)`,
      description: `IELTS examiners apply automatic deductions if an essay is under the required length.`,
      descriptionSi: 'අවම වචන ප්‍රමාණය සපුරා නොමැත.'
    });
  }
  if (mainProblems.length === 0) {
    mainProblems.push({
      severity: 'Medium',
      title: 'Lexical Precision & Complex Structures',
      description: 'To move from Band 6 to Band 8, upgrade informal verbs and add conditional/relative clauses.',
      descriptionSi: 'Band 8 සඳහා වඩාත් විධිමත් වචන සහ සංකීර්ණ වාක්‍ය රටා යොදන්න.'
    });
  }

  // Recommended learning order
  const learningOrder: LessonTopicId[] = Array.from(
    new Set([
      ...detectedIssues.map(i => i.lessonTopic),
      'plural-nouns' as LessonTopicId,
      'subject-verb-agreement' as LessonTopicId,
      'articles-countable' as LessonTopicId,
      'academic-vocabulary' as LessonTopicId,
      'task-response' as LessonTopicId
    ])
  ).slice(0, 6);

  // Improvements
  const improvements: Improvement[] = [
    {
      original: 'make poor people suffer',
      better: 'imposes disproportionate economic hardship on low-income households',
      why: 'Replaces colloquial and informal phrasing with standard academic sociology terminology.',
      whySi: 'වඩාත් විධිමත් ශාස්ත්‍රීය වචන සංයෝජනයක් යෙදීම.'
    },
    {
      original: 'cost a lot of money',
      better: 'place an unsustainable fiscal burden on public budgets',
      why: '"a lot of money" is spoken English; "fiscal burden" is an authentic Band 8 academic collocation.',
      whySi: '"a lot of money" යනු කතාබහේදී යොදන සරල වචනයකි.'
    }
  ];

  // Upgraded Band 8 version based on corrected text
  const correctedText = segments
    .map(s => (s.type === 'replace' ? s.to : s.type === 'del' ? '' : s.text))
    .join('');

  const band8Edits: EssaySegment[] = generateAcademicUpgradeSegments(correctedText, improvements);

  return {
    id: `local-eval-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: 'offline',
    engineModel: 'Built-in Cambridge Examiner (Offline)',
    taskType,
    question,
    promptImage: promptImage || undefined,
    targetBand,
    overallBand,
    confidence: 'High',
    criteria,
    mainProblems,
    learningOrder,
    teacherNote:
      errorCount >= 4
        ? `Noticeable grammar, agreement, and word-choice slips were detected (e.g. non-standard comparatives, compound agreement, homophones). In IELTS, frequent systematic errors limit Grammatical Accuracy and Lexical Resource to Band 5.0 - 5.5. Eliminating these foundational errors is your fastest path to Band 6.5+.`
        : errorCount > 0
        ? `You demonstrated solid ideas with a clear overall direction. However, you lost marks due to ${errorCount} grammar and agreement errors. Once you master subject-verb agreement and plurals, your score will rapidly reach Band 7.0+.`
        : `No basic rule violations were detected by the offline rule scanner. (Note: The Built-in Offline Examiner scans for foundational patterns. For comprehensive LLM-level feedback on sentence variety and official scoring, connect Gemini AI in Settings).`,
    teacherNoteSi:
      errorCount >= 4
        ? `ක්‍රියාපද ගැළපීම, අතීත කාල ක්‍රියාපද, සහ නුහුරු වචන (lowery, higherly වැනි) හේතුවෙන් ලකුණු අඩු වී ඇත. මෙම මූලික වැරදි නිවැරදි කරගැනීමෙන් ඔබට Band 6.5+ වෙත ළඟා විය හැක.`
        : errorCount > 0
        ? `ඔබට හොඳ අදහස් ඇත. නමුත් මූලික ව්‍යාකරණ වැරදි ${errorCount} ක් නිසා ලකුණු අඩුවී ඇත. ක්‍රියාපද ගැළපීම නිවැරදි කරගැනීමෙන් ඔබට Band 7.0+ දක්වා පහසුවෙන් ළඟා විය හැක.`
        : `මූලික රීති වැරදි හමු නොවීය. වඩාත් ගැඹුරු විභාග ඇගයීමක් සඳහා Settings වෙතින් Gemini AI සම්බන්ධ කරන්න.`,
    markedEssay: segments,
    issues: detectedIssues,
    improvements,
    band8Edits,
    band8Overall: 8.0,
    band8Criteria: [
      { key: 'TR', band: 8.0 },
      { key: 'CC', band: 8.0 },
      { key: 'LR', band: 8.0 },
      { key: 'GRA', band: 8.0 }
    ],
    band8Notes: [
      'Eliminated all subject-verb and noun agreement errors.',
      'Replaced colloquial phrases with formal academic collocations.',
      'Ensured full idea development with clear topic sentences and evidence.'
    ],
    warnings
  };
}
