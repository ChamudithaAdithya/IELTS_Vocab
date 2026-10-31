import type {
  CriterionKey,
  EssaySegment,
  LessonTopicId,
  TutorReport,
  TutorIssue,
  MainProblem,
  Improvement
} from '../types/tutor';
import { roundIeltsBand, countWords, formatBand } from './tutorEngine';

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
  }
];

export function evaluateEssayLocally(params: {
  question: string;
  essay: string;
  taskType: 'task1' | 'task2';
  targetBand: number;
  sinhala: boolean;
}): TutorReport {
  const { question, essay, taskType, targetBand, sinhala } = params;
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

  // Task Response / Achievement
  let trBand = 7.0;
  if (wordCount < minWords) {
    const penalty = Math.min(2.0, Math.ceil((minWords - wordCount) / 40) * 0.5);
    trBand = Math.max(4.5, 7.0 - penalty);
  } else if (wordCount >= 280) {
    trBand = 7.5;
  }

  // Coherence & Cohesion
  let ccBand = 6.5;
  if (paragraphCount < 3) {
    ccBand = 5.0;
    warnings.push('Essay lacks standard 4-paragraph essay organization (Introduction, 2 Body Paragraphs, Conclusion).');
  } else if (paragraphCount >= 4) {
    ccBand = 7.0;
  }

  // Grammatical Range & Accuracy
  let graBand = 7.0;
  if (errorCount >= 10) graBand = 5.0;
  else if (errorCount >= 6) graBand = 5.5;
  else if (errorCount >= 3) graBand = 6.0;
  else if (errorCount >= 1) graBand = 6.5;
  else graBand = 8.0;

  // Lexical Resource
  let lrBand = 6.5;
  if (errorCount >= 8) lrBand = 5.5;
  else if (errorCount >= 4) lrBand = 6.0;

  const criteria = [
    {
      key: 'TR' as CriterionKey,
      name: taskType === 'task1' ? 'Task Achievement' : 'Task Response',
      band: trBand,
      comment: wordCount < minWords
        ? `Under-length (${wordCount}/${minWords} words). Ideas cannot be fully developed without sufficient length.`
        : 'Good coverage of the prompt with identifiable thesis and relevant supporting points.',
      commentSi: wordCount < minWords
        ? 'වචන ප්‍රමාණය ප්‍රමාණවත් නොවේ. අදහස් පූර්ණ ලෙස වර්ධනය කිරීමට වැඩිදුර විස්තර අවශ්‍යයි.'
        : 'ප්‍රශ්නයට අදාළ අදහස් සහ පැහැදිලි මතයක් ඇත.',
      toReach8: 'Elaborate each main argument with concrete societal or empirical examples.'
    },
    {
      key: 'CC' as CriterionKey,
      name: 'Coherence & Cohesion',
      band: ccBand,
      comment: paragraphCount >= 4
        ? 'Clear paragraph division with logical progression between introduction, arguments, and conclusion.'
        : 'Paragraphing is inconsistent or underdeveloped. Ensure a 4-paragraph structure.',
      commentSi: 'ඡේද බෙදීම සහ තාර්කික ප්‍රගතිය පැහැදිලිය.',
      toReach8: 'Use complex referencing and topic sentences rather than mechanical linking phrases.'
    },
    {
      key: 'LR' as CriterionKey,
      name: 'Lexical Resource',
      band: lrBand,
      comment: errorCount > 5
        ? 'Vocabulary is understandable but contains repetitive everyday terms and word-form slips.'
        : 'Adequate range of vocabulary with some attempts at academic collocations.',
      commentSi: 'වචන තේරුම් ගත හැක, නමුත් සරල වචන නිතර භාවිතා වේ.',
      toReach8: 'Incorporate precise academic collocations (e.g. "disproportionately penalise", "civic responsibility").'
    },
    {
      key: 'GRA' as CriterionKey,
      name: 'Grammar',
      band: graBand,
      comment: `Detected ${errorCount} grammar and agreement errors. Error-free sentences are required for Band 7+.`,
      commentSi: `ව්‍යාකරණ වැරදි ${errorCount} ක් හඳුනා ගැනිණි. Band 7+ සඳහා වැරදි රහිත වාක්‍ය අවශ්‍යයි.`,
      toReach8: 'Eliminate foundational errors with singular/plural nouns and subject-verb agreement.'
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
      description: 'Third-person singular subjects (it/he/she/government) must take verbs ending in -s in the present tense.',
      descriptionSi: 'ඒකවචන කර්තෘ සඳහා ක්‍රියාපදයට -s එකතු විය යුතුය.'
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

  const band8Edits: EssaySegment[] = [
    {
      type: 'text',
      text: correctedText
        .replace(/very popular/gi, 'widely debated')
        .replace(/good experience/gi, 'valuable civic and professional competence')
        .replace(/a lot of money/gi, 'substantial fiscal resources')
        .replace(/cost of living/gi, 'overall cost of living')
    }
  ];

  return {
    id: `local-eval-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: 'sample',
    taskType,
    question,
    targetBand,
    overallBand,
    confidence: 'High',
    criteria,
    mainProblems,
    learningOrder,
    teacherNote:
      errorCount > 0
        ? `You demonstrated solid ideas with a clear overall direction. However, you lost marks due to ${errorCount} grammar and agreement errors. Once you master subject-verb agreement and plurals, your score will rapidly reach Band 7.5+.`
        : `Outstanding grammatical accuracy! Your essay contains almost zero structural slips. Focus on developing ideas with deeper academic collocations to secure a solid Band 8.0+.`,
    teacherNoteSi:
      errorCount > 0
        ? `ඔබට හොඳ අදහස් ඇත. නමුත් මූලික ව්‍යාකරණ වැරදි ${errorCount} ක් නිසා ලකුණු අඩුවී ඇත. ක්‍රියාපද ගැළපීම නිවැරදි කරගැනීමෙන් ඔබට Band 7.5+ දක්වා පහසුවෙන් ළඟා විය හැක.`
        : `ඉතා විශිෂ්ටයි! ව්‍යාකරණ වැරදි නොමැති තරම්ය. Band 8 සඳහා තර්ක තවදුරටත් පුළුල් කරන්න.`,
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
