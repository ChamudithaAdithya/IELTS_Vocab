import type { EssaySegment, TutorReport } from '../types/tutor';

export interface CambridgeTestPrompt {
  id: string;
  cambridgeBook: string; // e.g. "Cambridge IELTS 18, Test 1"
  taskType: 'task1' | 'task2';
  category: 'Education' | 'Environment' | 'Society' | 'Technology' | 'Housing/Urban' | 'Media';
  question: string;
  examinerInstructions: string[];
  suggestedTimeMinutes: number;
  minimumWords: number;
  weakCandidateEssay: {
    band: number;
    title: string;
    text: string;
    report: TutorReport;
  };
  band8ModelAnswer: {
    text: string;
    examinerComments: string[];
  };
}

const t = (text: string): EssaySegment => ({ type: 'text', text });
const del = (text: string, issueId?: string, note?: string): EssaySegment => ({ type: 'del', text, issueId, note });
const ins = (text: string, issueId?: string, note?: string): EssaySegment => ({ type: 'ins', text, issueId, note });
const rep = (text: string, to: string, issueId?: string, note?: string): EssaySegment => ({ type: 'replace', text, to, issueId, note });

/* ------------------------------------------------------------------ */
/* Test 1: Cambridge 18 Test 1 (Task 2) - Community Service          */
/* ------------------------------------------------------------------ */
const C18_T1_QUESTION =
  'Some people believe that unpaid community service should be a compulsory part of high school programmes (for example working for a charity, improving the neighbourhood or teaching sports to younger children). To what extent do you agree or disagree?';

const C18_T1_WEAK_TEXT =
  'Nowadays, community service is very popular in many country. Some people believe that high school student should do unpaid community service because it give them good experience. In my opinion, I am totally agree with this statement for several reason.\n\nFirst of all, community service help student to learn many useful skill. When student work for a charity, they learns how to communicate with other peoples. For example my younger brother did volunteer work in a hospital last year and he learn how to be patient and caring. Furthermore, this activities make student more responsible and they do not waste their times on playing computer game.\n\nSecondly, unpaid service is very beneficial for the society. Young peoples can clean park, paint old building, and help poor families. If the government pay for all this works, it will cost a lot of money. Therefore, student volunteers can save money for public and improve their neighbourhood.\n\nIn conclusion, I strongly believe that community service should be compulsory in all high school. It not only develop good character in teenagers but also benefit the community as a whole.';

const C18_T1_SEGMENTS: EssaySegment[] = [
  t('Nowadays, community service is very popular in many '), rep('country', 'countries', 'plural', '"many" + plural noun.'),
  t('. Some people believe that high school '), rep('student', 'students', 'plural', 'General plural for students.'),
  t(' should do unpaid community service because it '), rep('give', 'gives', 'sva', '"it" = singular → gives.'),
  t(' them good experience. In my opinion, I '), del('am ', 'grammar', 'Say "I agree", NOT "I am agree".'),
  t('totally agree with this statement for several '), rep('reason', 'reasons', 'plural', '"several" + plural noun.'),
  t('.\n\nFirst of all, community service '), rep('help', 'helps', 'sva', '"service" is singular → helps.'),
  t(' '), rep('student', 'students', 'plural', 'General plural noun.'),
  t(' to learn many useful '), rep('skill', 'skills', 'plural', '"many" + plural noun.'),
  t('. When '), rep('student', 'students', 'plural', 'Plural subject.'),
  t(' work for a charity, they '), rep('learns', 'learn', 'sva', '"they" is plural → base verb learn.'),
  t(' how to communicate with other '), rep('peoples', 'people', 'plural', '"People" is already plural.'),
  t('. For example'), ins(',', 'punct', 'Comma after "For example".'),
  t(' my younger brother did volunteer work in a hospital last year and he '),
  rep('learn', 'learned', 'tenses', 'Past time reference "last year" → learned.'),
  t(' how to be patient and caring. Furthermore, '), rep('this', 'these', 'plural', '"activities" is plural → these.'),
  t(' activities make '), rep('student', 'students', 'plural', 'Plural noun.'),
  t(' more responsible and they do not waste their '), rep('times', 'time', 'articles', '"time" is uncountable here.'),
  t(' on playing computer '), rep('game', 'games', 'plural', 'Plural: computer games.'),
  t('.\n\nSecondly, unpaid service is very beneficial for '), del('the ', 'articles', 'General society → no "the".'),
  t('society. Young '), rep('peoples', 'people', 'plural', '"People" is already plural.'),
  t(' can clean '), rep('park', 'parks', 'plural', 'Plural noun.'),
  t(', paint old '), rep('building', 'buildings', 'plural', 'Plural noun.'),
  t(', and help poor families. If the government '), rep('pay', 'pays', 'sva', '"government" = singular → pays.'),
  t(' for all '), rep('this works', 'this work', 'articles', '"work" is uncountable → this work.'),
  t(', it will cost a lot of money. Therefore, student volunteers can save money for '),
  rep('public', 'the public', 'articles', 'Specific group → the public.'),
  t(' and improve their neighbourhood.\n\nIn conclusion, I strongly believe that community service should be compulsory in all high '),
  rep('school', 'schools', 'plural', '"all" + plural noun.'),
  t('. It not only '), rep('develop', 'develops', 'sva', '"It" = singular → develops.'),
  t(' good character in teenagers but also '), rep('benefit', 'benefits', 'sva', '"It" = singular → benefits.'),
  t(' the community as a whole.')
];

const C18_T1_BAND8_EDITS: EssaySegment[] = [
  t('Nowadays, '), ins('the concept of integrating ', undefined, 'More academic phrasing'),
  t('community service '), rep('is very popular in many countries', 'into the secondary curriculum has sparked considerable debate', undefined, 'Formal IELTS introduction'),
  t('. Some people believe that high school students should '),
  rep('do unpaid community service because it gives them good experience', 'be required to undertake voluntary work as part of their formal education', undefined, 'Precise lexical upgrade'),
  t('. In my opinion, I '), rep('totally agree with this statement', 'firmly support this policy', undefined, 'Academic collocation'),
  t(' for several '), rep('reasons', 'compelling reasons: it fosters social responsibility and provides tangible benefits to local communities', undefined, 'Clear thesis preview'),
  t('.\n\nFirst of all, community service helps students to '),
  rep('learn many useful skills', 'acquire indispensable life skills that cannot be taught in a traditional classroom', undefined, 'Band 8 depth'),
  t('. When students work for a charity, they learn how to communicate '),
  ins('effectively ', undefined, 'Academic adverb'),
  t('with people '), ins('from diverse socioeconomic backgrounds', undefined, 'Idea development'),
  t('. For example, '), rep('my younger brother did volunteer work in a hospital last year and he learned how to be patient and caring', 'high school students who assist in elderly care homes frequently develop empathy, emotional resilience, and interpersonal competence', undefined, 'Universal academic evidence'),
  t('. Furthermore, these activities '),
  rep('make students more responsible and they do not waste their time on playing computer games', 'instil a strong work ethic and steer adolescents away from sedentary and unproductive habits', undefined, 'Lexical resource upgrade'),
  t('.\n\nSecondly, unpaid service is very beneficial for society '),
  ins('from an economic and civic standpoint', undefined, 'Adds dimension'),
  t('. Young people can clean parks, paint old buildings, and help poor families'),
  ins(', directly addressing underfunded municipal services', undefined, 'Explains significance'),
  t('. If the government '), rep('pays for all this work, it will cost a lot of money', 'were to finance these initiatives through public expenditure, the fiscal burden would be substantial', undefined, 'Second conditional grammar structure'),
  t('. Therefore, student volunteers can save money for the public and improve their neighbourhood'),
  ins(' while cultivating a shared sense of civic duty', undefined, 'Link back'),
  t('.\n\nIn conclusion, I strongly believe that community service should be compulsory in all high schools. It not only develops good character in teenagers but also benefits the community as a whole'),
  ins(', preparing them to become proactive and conscientious citizens', undefined, 'Strong concluding link'),
  t('.')
];

const C18_T1_REPORT: TutorReport = {
  id: 'c18-t1-community-service',
  createdAt: '2026-10-30T10:00:00.000Z',
  source: 'sample',
  taskType: 'task2',
  question: C18_T1_QUESTION,
  targetBand: 8.0,
  overallBand: 5.5,
  confidence: 'High',
  criteria: [
    {
      key: 'TR',
      name: 'Task Response',
      band: 6.0,
      comment: 'Addresses the prompt with a clear position throughout, but points lack extended development and rely on personal anecdotes.',
      commentSi: 'පැහැදිලි මතයක් ඇත, නමුත් කරුණු ප්‍රමාණවත් ලෙස විස්තර කර නොමැති අතර පෞද්ගලික උදාහරණ මත රඳා පවතී.',
      toReach8: 'Support arguments with universal civic and economic evidence rather than personal family anecdotes.'
    },
    {
      key: 'CC',
      name: 'Coherence & Cohesion',
      band: 6.0,
      comment: 'Clear 4-paragraph organisation with basic mechanical linkers (First of all, Secondly, In conclusion).',
      commentSi: 'ඡේද 4 කින් යුත් පැහැදිලි ව්‍යුහයක් ඇත, නමුත් සම්බන්ධක වචන සරලයි.',
      toReach8: 'Use complex internal clause linking and thematic topic sentences instead of basic ordinal linkers.'
    },
    {
      key: 'LR',
      name: 'Lexical Resource',
      band: 5.5,
      comment: 'Repetitive basic words ("good", "clean park", "save money"). Repeated errors with "peoples" and countable nouns.',
      commentSi: 'සරල වචන නිතර භාවිතා වේ. "peoples" සහ නාම පද වැරදි කිහිපයක් ඇත.',
      toReach8: 'Incorporate academic collocations (civic responsibility, fiscal burden, emotional resilience).'
    },
    {
      key: 'GRA',
      name: 'Grammar',
      band: 5.0,
      comment: 'Frequent basic grammatical errors: singular/plural nouns (10x), subject-verb agreement (5x), and incorrect "I am agree".',
      commentSi: 'නිතර ව්‍යාකරණ වැරදි: ඒකවචන/බහුවචන, ක්‍රියාපද ගැළපීම සහ "I am agree".',
      toReach8: 'Eliminate elementary agreement and plural errors so the majority of sentences are error-free.'
    }
  ],
  mainProblems: [
    {
      severity: 'High',
      title: 'Elementary Plural and Agreement Errors',
      description: 'You missed plural -s on 10 nouns and mismatched subjects with verbs ("it give", "they learns", "government pay").',
      descriptionSi: 'නාම පද 10 ක බහුවචන -s අතහැර දමා ඇති අතර කර්තෘ සහ ක්‍රියාපදය නොගැළපේ.'
    },
    {
      severity: 'High',
      title: 'Grammar Pattern: "I am agree"',
      description: 'In English, "agree" is already a verb. Say "I agree" or "I firmly agree", never "I am agree".',
      descriptionSi: 'ඉංග්‍රීසි භාෂාවේ "agree" යනු ක්‍රියාපදයකි. "I am agree" නොකියා "I agree" යයි කියන්න.'
    },
    {
      severity: 'Medium',
      title: 'Anecdotal Evidence vs Objective IELTS Arguments',
      description: 'Using "my younger brother" weakens Task Response. Use broader societal references.',
      descriptionSi: 'මගේ සහෝදරයා වැනි පෞද්ගලික උදාහරණ වෙනුවට පොදු සමාජ උදාහරණ යොදන්න.'
    }
  ],
  learningOrder: ['plural-nouns', 'subject-verb-agreement', 'sentence-structure', 'articles-countable', 'academic-vocabulary', 'task-response'],
  teacherNote:
    'You have good ideas and a clear opinion, which examiners like. However, you lost almost 2 full band scores solely due to basic grammar slips like "student should", "it give", "other peoples", and "I am agree". Fix these foundations first!',
  teacherNoteSi:
    'ඔබ සතුව හොඳ අදහස් ඇත. නමුත් මූලික ව්‍යාකරණ වැරදි නිසා ඔබට ලකුණු අහිමි විය. මෙම මූලික නීති මුලින්ම ප්‍රගුණ කරන්න.',
  markedEssay: C18_T1_SEGMENTS,
  issues: [
    {
      id: 'plural-c18',
      title: 'Singular / Plural Noun Endings',
      category: 'Grammar',
      severity: 'High',
      original: 'Some people believe that high school student should do unpaid community service in many country.',
      corrected: 'Some people believe that high school students should do unpaid community service in many countries.',
      why: 'When speaking about items or individuals in general, English requires the plural form. "Many" and "all" must be followed by plural nouns.',
      whySi: 'සාමාන්‍යයෙන් කතා කරන විට බහුවචනය අවශ්‍යයි. "many" සහ "all" පසුව බහුවචන නාම පද යොදන්න.',
      rule: 'many / all / several + plural noun (-s / -es).',
      lessonTopic: 'plural-nouns',
      occurrences: 10,
      tag: 'Critical Foundation'
    },
    {
      id: 'sva-c18',
      title: 'Subject-Verb Agreement',
      category: 'Grammar',
      severity: 'High',
      original: 'community service help student because it give them good experience.',
      corrected: 'community service helps students because it gives them good experience.',
      why: '"Community service" and "it" are third-person singular subjects. In the present simple tense, their verbs must take -s (helps, gives).',
      whySi: 'තනි කර්තෘ සඳහා වර්තමාන කාලයේදී ක්‍රියාපදයට -s එකතු වේ.',
      rule: 'He / She / It / Singular Noun + verb with -s.',
      lessonTopic: 'subject-verb-agreement',
      occurrences: 5,
      tag: 'High Priority'
    },
    {
      id: 'agree-c18',
      title: 'Incorrect Verb Usage: "I am agree"',
      category: 'Grammar',
      severity: 'High',
      original: 'In my opinion, I am totally agree with this statement.',
      corrected: 'In my opinion, I totally agree with this statement.',
      why: '"Agree" is an active verb, not an adjective. Do not use the auxiliary verb "am" with it.',
      whySi: '"agree" යනු ක්‍රියාපදයකි. එය සමඟ "am" යොදන්න එපා.',
      rule: 'Subject + agree (NOT: subject + am/is/are + agree).',
      lessonTopic: 'sentence-structure',
      occurrences: 1,
      tag: 'Common Trap'
    },
    {
      id: 'uncountable-c18',
      title: 'Uncountable Nouns: "time" and "work"',
      category: 'Grammar',
      severity: 'Medium',
      original: 'waste their times on computer game and pay for all this works.',
      corrected: 'waste their time on computer games and pay for all this work.',
      why: '"Time" (as duration) and "work" (as labour) are uncountable nouns in this context and cannot take an -s plural.',
      whySi: 'කාලය සහ ශ්‍රමය යන අර්ථයෙන් "time" සහ "work" ගණන් කළ නොහැකි නාම පද වේ.',
      rule: 'Uncountable nouns do not take plural -s.',
      lessonTopic: 'articles-countable',
      occurrences: 2
    }
  ],
  improvements: [
    {
      original: 'Young peoples can clean park, paint old building, and help poor families.',
      better: 'Young people can rehabilitate public parks, renovate dilapidated municipal buildings, and assist underprivileged families.',
      why: 'Replaces simple verbs and nouns with formal academic IELTS collocations.',
      whySi: 'සරල වචන වෙනුවට ශාස්ත්‍රීය වචන සංයෝජන යොදන්න.'
    },
    {
      original: 'it will cost a lot of money.',
      better: 'it would place an enormous financial burden on municipal budgets.',
      why: '"cost a lot of money" is informal spoken English. The improved version is precise and authoritative.',
      whySi: '"cost a lot of money" යනු කතාබහේදී යොදන සරල වචනයකි.'
    }
  ],
  band8Edits: C18_T1_BAND8_EDITS,
  band8Overall: 8.0,
  band8Criteria: [
    { key: 'TR', band: 8.0 },
    { key: 'CC', band: 8.0 },
    { key: 'LR', band: 8.0 },
    { key: 'GRA', band: 8.0 }
  ],
  band8Notes: [
    'Upgraded personal anecdote about brother to universal academic observations on adolescent development.',
    'Integrated conditional clauses ("If the government were to finance...") demonstrating complex grammatical range.',
    'Replaced basic vocabulary with precise collocations: "civic responsibility", "fiscal burden", "interpersonal competence".',
    'Maintained the exact original arguments and structure rather than rewriting.'
  ]
};

/* ------------------------------------------------------------------ */
/* Test 2: Cambridge 17 Test 2 (Task 2) - Fuel Price Environment     */
/* ------------------------------------------------------------------ */
const C17_T2_QUESTION =
  'Some people think that the best way to solve environmental problems is to increase the price of fuel. To what extent do you agree or disagree?';

const C17_T2_WEAK_TEXT =
  'In the modern world, environmental problem is becoming more and more serious. Some people say that increasing fuel price is the best solution for this problem. However, I disagree with this opinion because it will make poor people suffer and there is better alternatives.\n\nTo begin with, high fuel price create many problem for ordinary citizens. Many people need their car to go to work every day because public transport is not convenient. If petrol become very expensive, the cost of living will increase and poor families cannot afford to buy foods. Moreover, transport company will increase the price of goods, which will cause inflation in the country.\n\nOn the other hand, government should focus on better solutions instead of just rising fuel price. First, they should invest money in green energy like solar and wind power. Second, government must improve public transportation system so that people will prefer taking bus and train. For instance in my city, when metro was built, many drivers stopped using private car.\n\nIn conclusion, increasing fuel cost is not the best way to protect environment. Government should develop renewable energy and provide efficient public transport.';

const C17_T2_SEGMENTS: EssaySegment[] = [
  t('In the modern world, environmental '), rep('problem is', 'problems are', 'sva', '"problems" plural with plural verb "are".'),
  t(' becoming more and more serious. Some people say that increasing fuel '),
  rep('price is', 'prices is', 'plural', 'Generally "fuel prices".'),
  t(' the best solution for this problem. However, I disagree with this opinion because it will make poor people suffer and there '),
  rep('is', 'are', 'sva', '"alternatives" is plural → there are.'),
  t(' better alternatives.\n\nTo begin with, high fuel '), rep('price create', 'prices create', 'plural', 'Subject "prices" plural with verb "create".'),
  t(' many '), rep('problem', 'problems', 'plural', '"many" + plural noun.'),
  t(' for ordinary citizens. Many people need their '), rep('car', 'cars', 'plural', 'Many people → cars.'),
  t(' to go to work every day because public transport is not convenient. If petrol '),
  rep('become', 'becomes', 'sva', '"petrol" is singular uncountable → becomes.'),
  t(' very expensive, the cost of living will increase and poor families cannot afford to buy '),
  rep('foods', 'food', 'articles', '"food" is uncountable here.'),
  t('. Moreover, transport '), rep('company', 'companies', 'plural', 'General plural "companies".'),
  t(' will increase the price of goods, which will cause inflation in the country.\n\nOn the other hand, '),
  rep('government', 'the government', 'articles', 'Specific authority → the government.'),
  t(' should focus on better solutions instead of just '),
  rep('rising fuel price', 'raising fuel prices', 'wordform', '"Raise" takes an object, not "rise".'),
  t('. First, they should invest money in green energy like solar and wind power. Second, '),
  rep('government', 'the government', 'articles', 'Needs article: the government.'),
  t(' must improve '), ins('the ', 'articles', 'Definite article.'),
  t('public transportation system so that people will prefer taking '),
  rep('bus and train', 'buses and trains', 'plural', 'Plural vehicles.'),
  t('. For instance'), ins(',', 'punct', 'Comma after "For instance".'),
  t(' in my city, when '), ins('the ', 'articles', 'Specific metro.'),
  t('metro was built, many drivers stopped using private '), rep('car', 'cars', 'plural', 'Plural noun: private cars.'),
  t('.\n\nIn conclusion, increasing fuel '), rep('cost is', 'costs is', 'plural', 'Fuel costs.'),
  t(' not the best way to protect '), ins('the ', 'articles', 'Specific: the environment.'),
  t('environment. '), rep('Government', 'Governments', 'plural', 'General plural governments.'),
  t(' should develop renewable energy and provide efficient public transport.')
];

const C17_T2_BAND8_EDITS: EssaySegment[] = [
  t('In the modern world, environmental problems are becoming '),
  rep('more and more serious', 'increasingly severe', undefined, 'More academic tone'),
  t('. Some people argue that increasing fuel prices is the most effective solution to this crisis. However, I '),
  rep('disagree with this opinion', 'strongly dispute this contention', undefined, 'Higher band lexical resource'),
  t(' because it '), rep('will make poor people suffer and there are better alternatives', 'imposes an unfair burden on low-income demographics while failing to address the systemic causes of pollution', undefined, 'Academic depth'),
  t('.\n\nTo begin with, escalating fuel prices '),
  rep('create many problems for ordinary citizens', 'disproportionately penalise economically vulnerable households', undefined, 'Band 8 collocations'),
  t('. Many individuals depend on private vehicles for commuting due to deficient public transport infrastructure. If fuel costs escalate sharply, the basic cost of living rises, leaving impoverished families unable to afford essential food and utilities. Moreover, freight and logistics companies inevitably pass higher fuel surcharges onto consumer goods, thereby accelerating nationwide inflation.\n\nOn the other hand, governments should implement structural green solutions rather than relying exclusively on punitive taxation. First, public investment should be redirected towards subsidising renewable energy infrastructure, such as solar and offshore wind farms. Second, local authorities must modernise public transit networks to render public commuting faster and more cost-effective than private vehicles. When dependable rapid transit options exist, commuters voluntarily shift away from car dependency without the need for regressive fuel taxes.\n\nIn conclusion, hiking fuel prices is an inequitable and inadequate remedy for environmental degradation. Governments should instead accelerate the transition to renewable energy and expand eco-friendly public transportation.')
];

const C17_T2_REPORT: TutorReport = {
  id: 'c17-t2-fuel-environment',
  createdAt: '2026-10-30T10:00:00.000Z',
  source: 'sample',
  taskType: 'task2',
  question: C17_T2_QUESTION,
  targetBand: 8.0,
  overallBand: 6.0,
  confidence: 'High',
  criteria: [
    {
      key: 'TR',
      name: 'Task Response',
      band: 6.5,
      comment: 'Directly addresses the prompt and presents a clear, consistent argument against fuel price hikes with relevant alternative solutions.',
      commentSi: 'පැහැදිලි තර්කයක් සහ විකල්ප විසඳුම් ඉදිරිපත් කරයි.',
      toReach8: 'Elaborate on why increasing fuel price alone fails to address industrial pollution (systemic causes).'
    },
    {
      key: 'CC',
      name: 'Coherence & Cohesion',
      band: 6.5,
      comment: 'Well-structured paragraphs with clear progression. Linking phrases like "To begin with" and "On the other hand" are well deployed.',
      commentSi: 'ඡේද හොඳින් සකස් කර ඇත.',
      toReach8: 'Use conceptual referents and complex dependent clauses rather than formulaic "First, Second" enumeration.'
    },
    {
      key: 'LR',
      name: 'Lexical Resource',
      band: 5.5,
      comment: 'Adequate but simple vocabulary. Misuse of "rising" instead of "raising", and "foods" instead of "food".',
      commentSi: '"rising" සහ "foods" වැනි වචන භාවිතයේ වැරදි ඇත.',
      toReach8: 'Incorporate academic collocations: "disproportionately penalise", "regressive taxation", "structural green solutions".'
    },
    {
      key: 'GRA',
      name: 'Grammar',
      band: 5.5,
      comment: 'Several subject-verb agreement slips ("there is better alternatives", "petrol become") and omitted articles before "government" and "environment".',
      commentSi: '"there is better alternatives" වැනි ක්‍රියාපද ගැළපීමේ වැරදි සහ articles අතහැරීම් ඇත.',
      toReach8: 'Consistently include definite articles before institutional nouns ("the government", "the environment").'
    }
  ],
  mainProblems: [
    {
      severity: 'High',
      title: 'Missing Definite Article ("the government", "the environment")',
      description: 'You wrote "government should" and "protect environment". When referring to a specific public institution or our shared natural world, use "the".',
      descriptionSi: '"the government" සහ "the environment" සඳහා "the" යෙදිය යුතුය.'
    },
    {
      severity: 'Medium',
      title: 'There is vs There are (Agreement)',
      description: 'You wrote "there is better alternatives". Since "alternatives" is plural, the correct form is "there are".',
      descriptionSi: '"alternatives" බහුවචන බැවින් "there are" විය යුතුය.'
    },
    {
      severity: 'Medium',
      title: 'Word Choice: Raise vs Rise',
      description: '"Rise" is intransitive (the sun rises). To increase something actively, use the transitive verb "raise": "raising fuel prices".',
      descriptionSi: 'මිලක් වැඩිකිරීමේදී "raise" යොදන්න, "rise" නොවේ.'
    }
  ],
  learningOrder: ['articles-countable', 'subject-verb-agreement', 'plural-nouns', 'word-forms', 'academic-vocabulary', 'task-response'],
  teacherNote:
    'This is a solid essay with strong reasoning. Your main weaknesses are omitting "the" before "government/environment", agreement after "there is/are", and basic word repetitions. Fixing these will quickly boost your grammar score to Band 7+.',
  teacherNoteSi:
    'මෙය හොඳ තර්ක සහිත රචනාවකි. "the" යෙදීම සහ "there are" වැනි මූලික කරුණු නිවැරදි කිරීමෙන් ඔබට ඉහළ ලකුණු ලබාගත හැක.',
  markedEssay: C17_T2_SEGMENTS,
  issues: [
    {
      id: 'articles-c17',
      title: 'Omission of "the" with Government and Environment',
      category: 'Grammar',
      severity: 'High',
      original: 'government should focus on better solutions to protect environment.',
      corrected: 'the government should focus on better solutions to protect the environment.',
      why: 'In academic writing, single institutions representing the state and our planet require the definite article "the".',
      whySi: 'රජය සහ පරිසරය හැඳින්වීමේදී "the" යොදන්න.',
      rule: 'Use "the" with unique entities: the government, the environment, the public.',
      lessonTopic: 'articles-countable',
      occurrences: 4,
      tag: 'Academic Convention'
    },
    {
      id: 'there-be-c17',
      title: 'There is / There are Agreement',
      category: 'Grammar',
      severity: 'Medium',
      original: 'there is better alternatives for this problem.',
      corrected: 'there are better alternatives for this problem.',
      why: 'In "there + be" constructions, the verb matches the noun that follows. "Alternatives" is plural, requiring "are".',
      whySi: 'නාම පදය බහුවචන නම් "there are" යොදන්න.',
      rule: 'there is + singular / there are + plural.',
      lessonTopic: 'subject-verb-agreement',
      occurrences: 1
    },
    {
      id: 'raise-rise-c17',
      title: 'Transitive vs Intransitive: Raise vs Rise',
      category: 'Vocabulary',
      severity: 'Medium',
      original: 'instead of just rising fuel price.',
      corrected: 'instead of just raising fuel prices.',
      why: '"Raise" requires an object (raise taxes, raise prices). "Rise" does not take an object (prices rise).',
      whySi: 'යමක් වැඩි කිරීම සඳහා "raise" යොදන්න.',
      rule: 'raise + object (prices/taxes) / subject + rise (prices rise).',
      lessonTopic: 'word-forms',
      occurrences: 1
    }
  ],
  improvements: [
    {
      original: 'poor people suffer and poor families cannot afford to buy foods.',
      better: 'low-income demographics endure disproportionate economic hardship.',
      why: 'Replaces emotive and colloquial expressions with objective demographic terminology.',
      whySi: 'වඩාත් විධිමත් ශාස්ත්‍රීය වචන යොදන්න.'
    }
  ],
  band8Edits: C17_T2_BAND8_EDITS,
  band8Overall: 8.0,
  band8Criteria: [
    { key: 'TR', band: 8.0 },
    { key: 'CC', band: 8.0 },
    { key: 'LR', band: 8.0 },
    { key: 'GRA', band: 8.0 }
  ],
  band8Notes: [
    'Transformed simple economic explanations into precise terminology: "regressive taxation", "logistics surcharges".',
    'Used concise compound structures: "low-income demographics", "rapid transit infrastructure".',
    'Zero grammatical errors with sophisticated sentence embedding.'
  ]
};

/* ------------------------------------------------------------------ */
/* Test 3: Cambridge 18 Test 2 (Task 1 Academic) - Housing Data      */
/* ------------------------------------------------------------------ */
const C18_T2_TASK1_QUESTION =
  'The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.';

const C18_T2_TASK1_WEAK_TEXT =
  'The bar chart give information about how many people owned and rented house in England and Wales from 1918 to 2011.\n\nOverall, it is clear that rented accommodation was very high at the beginning, but home ownership increased a lot over the period. At the end, both category was almost equal.\n\nIn 1918, around 77 percent of households was renting their home, while only about 23 percent owns their house. Over the next few decade, the percentage of owned accommodation went up gradual. In 1971, both proportion was equal at 50 percent each. After that, home ownership continued to rise and it reached the highest peak in 2001 at about 69 percent.\n\nBy contrast, rented house decreased continuous until 2001, where it reached the lowest point of 31 percent. However in 2011, renting increased again to 36 percent, while owned home fell to 64 percent.';

const C18_T2_TASK1_SEGMENTS: EssaySegment[] = [
  t('The bar chart '), rep('give', 'gives', 'sva', '"chart" singular → gives.'),
  t(' information about '), rep('how many people owned and rented house', 'the proportion of households in owned and rented accommodation', 'task', 'IELTS Task 1 paraphrasing.'),
  t(' in England and Wales from 1918 to 2011.\n\nOverall, it is clear that rented accommodation was '),
  rep('very high', 'the dominant tenure', 'task', 'More academic overview.'),
  t(' at the beginning, but home ownership increased '), rep('a lot', 'significantly', 'wordform', 'Academic adverb.'),
  t(' over the period. At the end, both '), rep('category was', 'categories were', 'sva', '"categories" plural with plural verb "were".'),
  t(' almost equal.\n\nIn 1918, around 77 percent of households '), rep('was', 'were', 'sva', '"households" plural → were.'),
  t(' renting their '), rep('home', 'homes', 'plural', 'Plural homes.'),
  t(', while only about 23 percent '), rep('owns', 'owned', 'tenses', 'Past date 1918 → owned.'),
  t(' their '), rep('house', 'houses', 'plural', 'Plural houses.'),
  t('. Over the next few '), rep('decade', 'decades', 'plural', '"few" + plural noun.'),
  t(', the percentage of owned accommodation went up '),
  rep('gradual', 'gradually', 'wordform', 'Adverb modifying "went up".'),
  t('. In 1971, both '), rep('proportion was', 'proportions were', 'sva', '"proportions" plural → were.'),
  t(' equal at 50 percent each. After that, home ownership continued to rise and '),
  del('it ', 'grammar', 'Unnecessary pronoun.'),
  t('reached '), rep('the highest peak', 'a peak', 'task', '"peak" is already the highest point.'),
  t(' in 2001 at about 69 percent.\n\nBy contrast, rented '), rep('house', 'accommodation', 'vocab', 'Proper category name.'),
  t(' decreased '), rep('continuous', 'continuously', 'wordform', 'Adverb modifying "decreased".'),
  t(' until 2001, '), rep('where', 'when', 'grammar', 'Refers to time (2001) → when.'),
  t(' it reached '), rep('the lowest point of', 'a low of', 'task', 'Natural trend phrasing.'),
  t(' 31 percent. However'), ins(',', 'punct', 'Comma after however.'),
  t(' in 2011, renting increased again to 36 percent, while owned '),
  rep('home', 'homes', 'plural', 'Plural homes.'),
  t(' fell to 64 percent.')
];

const C18_T2_TASK1_REPORT: TutorReport = {
  id: 'c18-t2-task1-housing',
  createdAt: '2026-10-30T10:00:00.000Z',
  source: 'sample',
  taskType: 'task1',
  question: C18_T2_TASK1_QUESTION,
  targetBand: 8.0,
  overallBand: 5.5,
  confidence: 'High',
  criteria: [
    {
      key: 'TR',
      name: 'Task Achievement',
      band: 6.0,
      comment: 'Reports key trends with an overall overview, but descriptions are repetitive and the 1971 crossover point could be highlighted more clearly.',
      commentSi: 'ප්‍රධාන ප්‍රවණතා දක්වා ඇත, නමුත් විස්තර නැවත නැවත සිදුවේ.',
      toReach8: 'Highlight the crossover year (1971) as a pivotal structural transition point in the overview.'
    },
    {
      key: 'CC',
      name: 'Coherence & Cohesion',
      band: 6.0,
      comment: 'Chronological progression is clear, but transitions are simple and repetitive ("After that", "However in 2011").',
      commentSi: 'කාලානුක්‍රමිකව කරුණු දක්වා ඇත, නමුත් සම්බන්ධක සරලයි.',
      toReach8: 'Group trends by tenure type or milestone eras rather than simple year-by-year listing.'
    },
    {
      key: 'LR',
      name: 'Lexical Resource',
      band: 5.5,
      comment: 'Used adjectives as adverbs ("went up gradual", "decreased continuous"). Informal "a lot" and redundancy ("highest peak").',
      commentSi: 'ක්‍රියා විශේෂණ වෙනුවට නාම විශේෂණ යොදා ඇත (gradual වෙනුවට gradually).',
      toReach8: 'Use formal trend vocabulary: "experienced an upward trajectory", "surpassed", "fluctuated marginally".'
    },
    {
      key: 'GRA',
      name: 'Grammar',
      band: 5.0,
      comment: 'Mismatched singular/plural verbs with percentage subjects ("households was", "proportions was"), tense clash ("owns" in 1918), and "where" instead of "when".',
      commentSi: 'ප්‍රතිශත සමඟ ක්‍රියාපද ඒකවචන/බහුවචන ගැළපීමේ වැරදි සහ කාල පද වැරදි ඇත.',
      toReach8: 'Maintain correct past tense consistency throughout past historical data.'
    }
  ],
  mainProblems: [
    {
      severity: 'High',
      title: 'Adjective vs Adverb in Trend Descriptions',
      description: 'You wrote "went up gradual" and "decreased continuous". Verbs must be modified by adverbs ending in -ly: "gradually" and "continuously".',
      descriptionSi: 'ක්‍රියාපදයක් විස්තර කිරීමට -ly සහිත adverb යොදන්න: gradually, continuously.'
    },
    {
      severity: 'High',
      title: 'Plural Subject Agreement with Percentages',
      description: '"77 percent of households" and "both categories" are plural subjects. They require plural verbs: "were", not "was".',
      descriptionSi: '"households" බහුවචන බැවින් "were" යොදන්න.'
    },
    {
      severity: 'Medium',
      title: 'Redundant Terminology: "Highest Peak"',
      description: 'A "peak" is already the highest point on a chart. Saying "highest peak" is tautological. Simply say "reached a peak of".',
      descriptionSi: '"peak" යනු දැනටමත් උපරිමයයි. "highest peak" යැයි කීම අනවශ්‍යයි.'
    }
  ],
  learningOrder: ['word-forms', 'subject-verb-agreement', 'plural-nouns', 'verb-tenses', 'academic-vocabulary', 'task-response'],
  teacherNote:
    'In IELTS Academic Task 1, describing trends accurately requires knowing when to use adverbs (increased dramatically) versus adjectives (a dramatic increase). Watch out for historical past tense consistency!',
  teacherNoteSi:
    'Task 1 හි ප්‍රවණතා විස්තර කිරීමේදී adjective සහ adverb නිවැරදිව භාවිතය අතිශයින් වැදගත් වේ.',
  markedEssay: C18_T2_TASK1_SEGMENTS,
  issues: [
    {
      id: 'adverb-c18-t1',
      title: 'Adjective vs Adverb in Trends (-ly)',
      category: 'Vocabulary',
      severity: 'High',
      original: 'went up gradual and decreased continuous.',
      corrected: 'went up gradually and decreased continuously.',
      why: 'When describing HOW a number changes, modify the verb with an adverb: verb + adverb (rose steadily, dropped sharply).',
      whySi: 'වෙනස්වීම විස්තර කිරීමට ක්‍රියා විශේෂණ (adverb) යොදන්න.',
      rule: 'Verb + Adverb (-ly) OR Adjective + Noun (a gradual rise).',
      lessonTopic: 'word-forms',
      occurrences: 2
    },
    {
      id: 'sva-task1',
      title: 'Agreement with Percentages & Plural Nouns',
      category: 'Grammar',
      severity: 'High',
      original: '77 percent of households was renting and both category was equal.',
      corrected: '77 percent of households were renting and both categories were equal.',
      why: 'Percentages take a plural verb if the following noun is plural: 77% of households were.',
      whySi: 'ප්‍රතිශතයට පසු ඇති නාම පදය බහුවචන නම් ක්‍රියාපදයද බහුවචන විය යුතුය.',
      rule: 'percentage of + plural noun + plural verb.',
      lessonTopic: 'subject-verb-agreement',
      occurrences: 3
    }
  ],
  improvements: [
    {
      original: 'The bar chart give information about how many people owned and rented house',
      better: 'The bar chart illustrates the proportion of households residing in owned versus rented accommodation',
      why: 'Formal Academic Task 1 introduction using standard housing terminology.',
      whySi: 'පළමු වාක්‍යය වඩාත් ශාස්ත්‍රීය ලෙස ප්‍රතිසංස්කරණය කිරීම.'
    }
  ],
  band8Edits: [
    t('The bar chart illustrates the proportion of households residing in owned versus rented accommodation in England and Wales from 1918 to 2011.\n\nOverall, the data reveals a dramatic structural inversion in housing tenure: while rented accommodation was overwhelmingly predominant in 1918, home ownership experienced an enduring upward trajectory, eventually surpassing rental accommodation in 1971 before receding slightly in the final decade.\n\nIn 1918, approximately 77% of households rented their dwellings, compared to a mere 23% who owned their homes. Over the subsequent five decades, home ownership increased steadily until reaching parity with rental housing at 50% in 1971. Following this pivotal milestone, the ownership rate continued its ascent, culminating in a peak of 69% in 2001.\n\nConversely, rental accommodation declined continuously over the same timeframe, bottoming out at 31% in 2001. However, this downward trend reversed modestly between 2001 and 2011, with rental tenure recovering to 36% while home ownership contracted to 64%.')
  ],
  band8Overall: 8.5,
  band8Criteria: [
    { key: 'TR', band: 8.5 },
    { key: 'CC', band: 8.5 },
    { key: 'LR', band: 8.5 },
    { key: 'GRA', band: 8.5 }
  ],
  band8Notes: [
    'Presents an exceptional overview highlighting the "structural inversion" and the 1971 parity crossover.',
    'Flawless integration of numerical data with trend adverbs and comparative structures ("bottoming out at", "culminating in a peak of").',
    'Precise lexical domain words: "housing tenure", "proportions", "subsequent five decades".'
  ]
};

export const ALL_CAMBRIDGE_TESTS: CambridgeTestPrompt[] = [
  {
    id: 'c18-t1',
    cambridgeBook: 'Cambridge IELTS 18, Test 1',
    taskType: 'task2',
    category: 'Education',
    question: C18_T1_QUESTION,
    examinerInstructions: [
      'Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
      'Write at least 250 words.',
      'Spend about 40 minutes on this task.'
    ],
    suggestedTimeMinutes: 40,
    minimumWords: 250,
    weakCandidateEssay: {
      band: 5.5,
      title: 'Weak Candidate Submission (Band 5.5 - Real Agreement & Plural Errors)',
      text: C18_T1_WEAK_TEXT,
      report: C18_T1_REPORT
    },
    band8ModelAnswer: {
      text: C18_T1_BAND8_EDITS.map(s => (s.type === 'replace' ? s.to : s.type === 'del' ? '' : s.text)).join(''),
      examinerComments: [
        'Clear, consistent thesis throughout the essay.',
        'Ideas developed with universal societal reasons rather than trivial personal stories.',
        'High degree of grammatical accuracy and natural lexical collocations.'
      ]
    }
  },
  {
    id: 'c17-t2',
    cambridgeBook: 'Cambridge IELTS 17, Test 2',
    taskType: 'task2',
    category: 'Environment',
    question: C17_T2_QUESTION,
    examinerInstructions: [
      'Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
      'Write at least 250 words.',
      'Spend about 40 minutes on this task.'
    ],
    suggestedTimeMinutes: 40,
    minimumWords: 250,
    weakCandidateEssay: {
      band: 6.0,
      title: 'Typical Candidate Submission (Band 6.0 - Article & Word-Choice Traps)',
      text: C17_T2_WEAK_TEXT,
      report: C17_T2_REPORT
    },
    band8ModelAnswer: {
      text: C17_T2_BAND8_EDITS.map(s => (s.type === 'replace' ? s.to : s.type === 'del' ? '' : s.text)).join(''),
      examinerComments: [
        'Sophisticated economic and environmental counter-arguments.',
        'Precise collocations (escalating fuel prices, regressive taxation, systemic causes).',
        'Complex sentences with no grammatical inaccuracies.'
      ]
    }
  },
  {
    id: 'c18-t2-t1',
    cambridgeBook: 'Cambridge IELTS 18, Test 2 (Task 1)',
    taskType: 'task1',
    category: 'Housing/Urban',
    question: C18_T2_TASK1_QUESTION,
    examinerInstructions: [
      'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
      'Write at least 150 words.',
      'Spend about 20 minutes on this task.'
    ],
    suggestedTimeMinutes: 20,
    minimumWords: 150,
    weakCandidateEssay: {
      band: 5.5,
      title: 'Candidate Task 1 Report (Band 5.5 - Adverb & Percentage Agreement Slips)',
      text: C18_T2_TASK1_WEAK_TEXT,
      report: C18_T2_TASK1_REPORT
    },
    band8ModelAnswer: {
      text: C18_T2_TASK1_REPORT.band8Edits[0].text,
      examinerComments: [
        'Exemplary overview capturing the fundamental crossover in 1971.',
        'Rich variety of trend verbs (receded, bottomed out at, culminated in a peak of).',
        'Flawless academic reporting tone and accurate comparisons.'
      ]
    }
  },
  {
    id: 'c16-gt-t1',
    cambridgeBook: 'Cambridge IELTS 16 (General Training), Test 1 (Task 1)',
    taskType: 'task1',
    category: 'Housing/Urban',
    question:
      'You recently stayed at a hotel and left a valuable item in your room. Write a letter to the hotel manager. In your letter:\n- explain which room you stayed in and when\n- describe the item you left behind\n- explain what you would like the manager to do about it\nWrite at least 150 words.',
    examinerInstructions: [
      'Begin your letter as follows: Dear Sir or Madam,',
      'Cover all three bullet points with appropriate formal tone.',
      'Write at least 150 words in about 20 minutes.'
    ],
    suggestedTimeMinutes: 20,
    minimumWords: 150,
    weakCandidateEssay: {
      band: 5.5,
      title: 'Candidate Letter (Band 5.5 - Mixed Informal Tone & Agreement Errors)',
      text:
        'Dear Sir or Madam,\n\nI am writing this letter to tell you that I stay in your hotel last weekend and I forget my valuable watch in room. My room number was 304 and I checkout on Sunday morning.\n\nThe watch is very important for me because it is a gift from my father on my birthday. It is silver color with black leather strap. I think I leave it on the small table near the bed or inside the bathroom shelf.\n\nCould you please ask your cleaning staff to search the room? If they find it, please keep it safe and contact to me by phone. I can pay for courier cost so you can post it to my home address.\n\nI hope you can help me with this problem. I am looking forward to hear from you soon.\n\nYours faithfully,\nKamal Perera',
      report: {
        id: 'c16-gt-t1-report',
        createdAt: new Date().toISOString(),
        source: 'sample',
        engineModel: 'Cambridge Official Standard Examiner',
        taskType: 'task1',
        question: 'Hotel possession retrieval letter',
        targetBand: 8.0,
        overallBand: 5.5,
        confidence: 'High',
        criteria: [
          {
            key: 'TR',
            name: 'Task Achievement',
            band: 6.0,
            comment: 'All three bullet points are covered, but explanations are brief and lacking situational detail.',
            commentSi: 'කරුණු තුනම ආවරණය කර ඇතත් පැහැදිලි කිරීම් කෙටිය.',
            toReach8: 'Provide fuller contextual detail (dates of stay, booking reference, explicit model details).'
          },
          {
            key: 'CC',
            name: 'Coherence & Cohesion',
            band: 6.0,
            comment: 'Logical paragraph structure matching the prompt bullets, but transitional linking is basic.',
            commentSi: 'ඡේද වෙන් කිරීම පැහැදිලිය.',
            toReach8: 'Use formal business correspondence linkers: "With regards to the item", "Should the watch be located".'
          },
          {
            key: 'LR',
            name: 'Lexical Resource',
            band: 5.5,
            comment: 'Repetitive everyday vocabulary ("tell you", "valuable watch", "silver color"). Informal phrasings ("contact to me").',
            commentSi: 'සාමාන්‍ය කතාබහේ වචන යොදා ඇත.',
            toReach8: 'Use formal hospitality correspondence vocabulary: "retrieve a misplaced possession", "incur all shipping charges".'
          },
          {
            key: 'GRA',
            name: 'Grammar',
            band: 5.0,
            comment: 'Past tense inconsistency ("I stay", "I forget", "I leave" instead of stayed, forgot, left), missing articles ("in room"), and wrong preposition ("contact to me", "looking forward to hear").',
            commentSi: 'අතීත කාල ක්‍රියාපද (stayed, left) වෙනුවට වර්තමාන කාලය යෙදීම සහ "to hear" වෙනුවට "to hearing" විය යුතුය.',
            toReach8: 'Master past tense accuracy for past events and verb patterns like "look forward to + -ing".'
          }
        ],
        mainProblems: [
          {
            severity: 'High',
            title: 'Past Tense Inconsistency for Completed Stays',
            description: 'You wrote "I stay", "I checkout", and "I leave". Since your hotel stay concluded last weekend, all verbs must be in the past simple: stayed, checked out, left.',
            descriptionSi: 'හෝටලයේ රැඳී සිටීම අවසන් වී ඇති බැවින් අතීත කාලය (stayed, checked out, left) යොදන්න.'
          },
          {
            severity: 'High',
            title: 'Incorrect Preposition & Verb Patterns',
            description: '"contact" does not take "to" (say "contact me", not "contact to me"). Furthermore, "look forward to" requires a gerund: "look forward to hearing from you".',
            descriptionSi: '"contact me" විය යුතුය. "look forward to hearing" විය යුතුය.'
          }
        ],
        learningOrder: ['verb-tenses', 'verb-patterns', 'prepositions', 'articles-countable', 'academic-vocabulary', 'task-response'],
        teacherNote: 'In IELTS General Training Task 1 formal letters, maintaining consistent past tenses for past occurrences and using correct business email formulas like "look forward to hearing from you" is vital for Band 7+.',
        teacherNoteSi: 'විධිමත් ලිපිවලදී අතීත කාලය සහ "look forward to hearing" වැනි නිවැරදි යෙදුම් භාවිතය අත්‍යවශ්‍ය වේ.',
        markedEssay: [
          t('Dear Sir or Madam,\n\nI am writing this letter to '), rep('tell you', 'inform you', undefined, 'Formal letter opening'),
          t(' that I '), rep('stay', 'stayed', 'tenses', 'Past simple: stayed'),
          t(' in your hotel last weekend and I '), rep('forget', 'left', 'tenses', 'Left behind, not forget'),
          t(' my valuable watch in '), ins('my ', 'articles', 'Missing possessive pronoun'),
          t('room. My room number was 304 and I '), rep('checkout', 'checked out', 'tenses', 'Past tense: checked out'),
          t(' on Sunday morning.\n\nThe watch is very important '), rep('for', 'to', 'prep', 'Important to someone'),
          t(' me because it '), rep('is', 'was', 'tenses', 'Past tense'),
          t(' a gift from my father on my birthday. It is silver '), rep('color', 'in color', undefined, 'More natural phrasing'),
          t(' with '), ins('a ', 'articles', 'Missing article'),
          t('black leather strap. I think I '), rep('leave', 'left', 'tenses', 'Past simple: left'),
          t(' it on the small table near the bed or inside the bathroom shelf.\n\nCould you please ask your cleaning staff to search the room? If they find it, please keep it safe and '),
          rep('contact to me', 'contact me', 'prep', '"contact" takes no preposition'),
          t(' by phone. I can pay for '), ins('the ', 'articles', 'Specific cost'),
          t('courier cost so you can post it to my home address.\n\nI hope you can help me with this problem. I am looking forward to '),
          rep('hear', 'hearing', 'verb-pattern', 'look forward to + -ing'),
          t(' from you soon.\n\nYours faithfully,\nKamal Perera')
        ],
        issues: [
          {
            id: 'gt-tense-1',
            title: 'Present tense used for past events',
            category: 'Grammar',
            severity: 'High',
            original: 'I stay in your hotel and I forget my watch.',
            corrected: 'I stayed in your hotel and I left my watch.',
            why: 'Events that occurred in the past (last weekend) require the past simple tense.',
            whySi: 'පසුගිය සති අන්තයේ සිදුවූ දෙයක් බැවින් අතීත කාලය යොදන්න.',
            rule: 'Past simple for finished time periods.',
            lessonTopic: 'verb-tenses',
            occurrences: 4
          },
          {
            id: 'gt-verb-pattern',
            title: 'Look forward to + -ing',
            category: 'Grammar',
            severity: 'Medium',
            original: 'I am looking forward to hear from you.',
            corrected: 'I am looking forward to hearing from you.',
            why: 'In "look forward to", "to" is a preposition, which must be followed by a noun or gerund (-ing).',
            whySi: '"to" මෙහි නිපාත පදයක් බැවින් පසුව එන්නේ gerund (-ing) පදයකි.',
            rule: 'look forward to + V-ing.',
            lessonTopic: 'verb-patterns',
            occurrences: 1
          }
        ],
        improvements: [
          {
            original: 'I am writing this letter to tell you',
            better: 'I am writing to inquire about a personal item that I inadvertently left behind',
            why: 'Standard formal business correspondence register.',
            whySi: 'වඩාත් විධිමත් ලිපි ආරම්භයක්.'
          }
        ],
        band8Edits: [
          t('Dear Sir or Madam,\n\nI am writing to inquire about a valuable personal possession that I inadvertently misplaced during my recent stay at your hotel. I was accommodated in Room 304 from October 24th to 27th, and checked out on the morning of Sunday, October 27th (Booking Reference: #HT-88219).\n\nThe item in question is a stainless steel Seiko automatic wristwatch featuring an engraved case back and a dark brown leather strap. It carries immense sentimental value as it was presented to me by my father. To the best of my recollection, I left it either on the bedside nightstand or inside the recessed vanity cabinet in the bathroom.\n\nI would be exceedingly grateful if you could arrange for housekeeping personnel to inspect the room thoroughly. Should the timepiece be recovered, please secure it at the reception desk and notify me via telephone at +94 77 123 4567. Naturally, I will gladly reimburse any postage and courier expenses required to dispatch it to my residential address in Colombo.\n\nThank you very much for your prompt assistance in this matter. I look forward to hearing from you at your earliest convenience.\n\nYours faithfully,\nKamal Perera')
        ],
        band8Overall: 8.5,
        band8Criteria: [
          { key: 'TR', band: 8.5 },
          { key: 'CC', band: 8.5 },
          { key: 'LR', band: 8.5 },
          { key: 'GRA', band: 8.5 }
        ],
        band8Notes: [
          'Exemplary formal tone with precise business letter register ("inadvertently misplaced", "sentimental value", "prompt assistance").',
          'Supplies concrete practical details: booking reference, dates, serial description.',
          'Flawless grammar with conditionals and gerund structures ("Should the timepiece be recovered").'
        ]
      }
    },
    band8ModelAnswer: {
      text:
        'Dear Sir or Madam,\n\nI am writing to inquire about a valuable personal possession that I inadvertently misplaced during my recent stay at your hotel. I was accommodated in Room 304 from October 24th to 27th, and checked out on the morning of Sunday, October 27th (Booking Reference: #HT-88219).\n\nThe item in question is a stainless steel Seiko automatic wristwatch featuring an engraved case back and a dark brown leather strap. It carries immense sentimental value as it was presented to me by my father. To the best of my recollection, I left it either on the bedside nightstand or inside the recessed vanity cabinet in the bathroom.\n\nI would be exceedingly grateful if you could arrange for housekeeping personnel to inspect the room thoroughly. Should the timepiece be recovered, please secure it at the reception desk and notify me via telephone at +94 77 123 4567. Naturally, I will gladly reimburse any postage and courier expenses required to dispatch it to my residential address in Colombo.\n\nThank you very much for your prompt assistance in this matter. I look forward to hearing from you at your earliest convenience.\n\nYours faithfully,\nKamal Perera',
      examinerComments: [
        'Mastery of formal register with no informal slips.',
        'All bullet points fully fleshed out with realistic details.',
        'Advanced conditional inversion ("Should the timepiece be recovered") demonstrating Band 9 grammar control.'
      ]
    }
  }
];

export const getCambridgeTest = (id: string): CambridgeTestPrompt | undefined =>
  ALL_CAMBRIDGE_TESTS.find(t => t.id === id);
