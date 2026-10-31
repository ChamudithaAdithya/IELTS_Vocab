import type { EssaySegment, TutorReport } from '../types/tutor';

/* Small helpers to keep the marked essays readable. */
const t = (text: string): EssaySegment => ({ type: 'text', text });
const del = (text: string, issueId?: string, note?: string): EssaySegment => ({ type: 'del', text, issueId, note });
const ins = (text: string, issueId?: string, note?: string): EssaySegment => ({ type: 'ins', text, issueId, note });
const rep = (text: string, to: string, issueId?: string, note?: string): EssaySegment => ({ type: 'replace', text, to, issueId, note });

export const SAMPLE_QUESTION =
  'Some people believe that university students should be free to study whatever they like. Others think they should only be allowed to study subjects that will be useful in the future, such as those related to science and technology. Discuss both views and give your own opinion.';

/**
 * A weak student essay (approx. Band 5.5) marked ONLY for real errors.
 * Original text = text + del + replace.text
 * Corrected text = text + ins + replace.to
 */
const MARKED_ESSAY: EssaySegment[] = [
  // Paragraph 1
  t('Nowadays, choosing '), ins('a ', 'articles', 'Countable noun "subject" needs an article.'),
  t('subject '), rep('in', 'at', 'prep', 'We say "at university".'),
  t(' university is a big decision for many '), rep('student', 'students', 'plural', '"many" + plural noun.'),
  t('. Some people think '), rep('student', 'students', 'plural', 'General statement about all students → plural.'),
  t(' should study what they like, but other people believe they must only study useful '),
  rep('subject', 'subjects', 'plural', 'Science and technology = more than one subject.'),
  t(' like science and technology. In this essay'), ins(',', 'punct', 'Comma after an introductory phrase.'),
  t(' I will discuss both '), rep('side', 'sides', 'plural', '"both" + plural noun.'),
  t(' and give my opinion.\n\n'),

  // Paragraph 2
  t('Firstly, many people have different '), rep('opinion', 'opinions', 'plural', '"different" opinions of many people → plural.'),
  t(' about this. Students should choose '),
  rep('their interested subjects', 'subjects they are interested in', 'wordform', '"Interested" describes a person\'s feeling, not the subject.'),
  t(' because interest '), rep('make', 'makes', 'sva', '"interest" is singular → makes.'),
  t(' them more motivated. If a student '), rep('study', 'studies', 'sva', '"a student" = he/she → studies.'),
  t(' a subject that they are interested'), ins(' in', 'prep', '"interested" always needs "in".'),
  t(', they will work hard and get good marks. For example'), ins(',', 'punct', 'Comma after "For example".'),
  t(' my cousin '), rep('love', 'loves', 'sva', '"my cousin" = he → loves.'),
  t(' art and now he is a designer.\n\n'),

  // Paragraph 3
  t('On the other hand, some '), rep('peoples', 'people', 'plural', '"People" is already plural.'),
  t(' think science and technology '), rep('is', 'are', 'sva', 'Two things joined by "and" → plural verb.'),
  t(' more useful. '), rep('This', 'These', 'plural', '"This" is for one thing; "these" for many.'),
  t(' subjects help the country to develop and '), rep('it', 'they', 'sva', '"These subjects" are plural → they.'),
  t(' give many jobs. If students study history or art, they may '),
  rep('face difficulties to find', 'have difficulty finding', 'verbpat', 'Pattern: have difficulty + verb-ing.'),
  t(' '), del('a ', 'articles', '"Employment" is uncountable → no "a".'),
  t('employment after '), rep('graduate', 'graduating', 'verbpat', 'After a preposition ("after") use verb-ing.'),
  t('.\n\n'),

  // Paragraph 4
  t('In conclusion, I think both '), rep('side', 'sides', 'plural', '"both" + plural noun.'),
  t(' have good points. Students should study what they like'), ins(',', 'punct', 'Comma before "but" when it joins two full sentences.'),
  t(' but they should also think about '), del('the ', 'articles', 'General idea (jobs in general) → no "the".'),
  t('jobs. '), rep('Government', 'The government', 'articles', 'A specific, known government → "The government".'),
  t(' should balance both sides.'),
];

/**
 * Corrected essay → Band 8 version.
 * Only upgrades and developments are made – the student's essay is kept, not regenerated.
 */
const BAND8_EDITS: EssaySegment[] = [
  // Paragraph 1
  t('Nowadays, choosing a subject at university is a '), rep('big', 'significant', undefined, 'More precise academic adjective.'),
  t(' decision for many students. Some people think students should '),
  rep('study what they like', 'be free to study whatever they enjoy', undefined, 'Paraphrases the question accurately.'),
  t(', but '), rep('other people', 'others', undefined, 'Avoids repeating "people".'),
  t(' believe they '), rep('must', 'should', undefined, 'Matches the meaning of the question.'),
  t(' only study '), rep('useful subjects like', 'subjects with clear practical value, such as', undefined, '"such as" is more formal than "like" for examples.'),
  t(' science and technology. In this essay, I will discuss both sides and '),
  rep('give my opinion', 'explain why I believe students should be free to choose, provided that they consider their future careers', undefined, 'Band 8 needs a clear position from the introduction.'),
  t('.\n\n'),

  // Paragraph 2
  t('Firstly, '), rep('many people have different opinions about this', 'there are strong reasons to let students follow their own interests', undefined, 'A clear topic sentence tells the reader what the paragraph is about.'),
  t('. Students should choose subjects they are interested in because interest makes them more motivated. If a student studies a subject that they are interested in, they '),
  rep('will work hard and get good marks', 'are likely to work harder and achieve higher grades', undefined, '"achieve higher grades" is more academic than "get good marks".'),
  t('. '), ins('Motivated learners are also more likely to keep developing their skills after graduation. ', undefined, 'Explains WHY – idea development for Task Response.'),
  t('For example, my cousin '), rep('loves', 'has always loved', undefined, 'Present perfect shows a long-term interest.'),
  t(' art'), ins(',', undefined, 'Comma before "and" joining two full ideas.'),
  t(' and now he is a '), ins('successful graphic ', undefined, 'A more specific, convincing example.'),
  t('designer.\n\n'),

  // Paragraph 3
  t('On the other hand, some people '), rep('think', 'argue that', undefined, 'More precise reporting verb.'),
  t(' science and technology are more useful. These subjects help the country to develop'), ins(',', undefined, 'Comma before "and" joining two clauses.'),
  t(' and they '), rep('give many jobs', 'create a large number of well-paid jobs', undefined, 'Natural collocation: "create jobs".'),
  t('. '), ins('South Korea, for instance, has grown rapidly by investing heavily in engineering and technology education. ', undefined, 'A specific example supports the view.'),
  t('If students study history or art, they may have difficulty finding employment after graduating'),
  ins(' because the job market in these fields is highly competitive', undefined, 'Adds the reason – full development of the idea.'),
  t('.\n\n'),

  // Paragraph 4
  t('In conclusion, '), del('I think ', undefined, 'The opinion is given in the next sentence instead.'),
  t('both sides have '), rep('good points', 'valid arguments', undefined, 'More academic collocation.'),
  t('. '), ins('In my view, ', undefined, 'Clearly restates the writer\'s position.'),
  t('students should '), rep('study what they like', 'be free to study what they enjoy', undefined, 'Echoes the introduction.'),
  t(', but they should also think '), rep('about jobs', 'carefully about their future employment', undefined, 'More precise.'),
  t('. The government '), rep('should balance both sides', 'could support this by balancing students\' interests with the needs of the job market, for example, by offering career guidance at university', undefined, 'Specific and precise instead of the vague "both sides".'),
  t('.'),
];

export const SAMPLE_REPORT: TutorReport = {
  id: 'sample-task2-education',
  createdAt: '2026-10-30T00:00:00.000Z',
  source: 'sample',
  taskType: 'task2',
  question: SAMPLE_QUESTION,
  targetBand: 8,
  overallBand: 5.5,
  confidence: 'Medium',
  criteria: [
    {
      key: 'TR', name: 'Task Response', band: 5.5,
      comment: 'Both views are mentioned, but ideas are short and not developed. Under 250 words. Your opinion is not clear.',
      commentSi: 'අදහස් දෙකම සඳහන් කර ඇත, නමුත් ඒවා වර්ධනය කර නැත. වචන 250 ට අඩුය. ඔබේ මතය පැහැදිලි නැත.',
      toReach8: 'Write 260–300 words. Give a clear opinion in the introduction. Support every main idea with a reason AND an example.',
    },
    {
      key: 'CC', name: 'Coherence & Cohesion', band: 6.0,
      comment: 'Paragraphs are logical, but topic sentences are weak and linking words are basic.',
      commentSi: 'ඡේද තාර්කිකයි, නමුත් ප්‍රධාන වාක්‍ය දුර්වලයි, සම්බන්ධක වචන සරලයි.',
      toReach8: 'Start each body paragraph with a clear topic sentence. Use a range of linking words naturally.',
    },
    {
      key: 'LR', name: 'Lexical Resource', band: 5.5,
      comment: 'Simple, repeated vocabulary ("good", "big", "jobs"). Some word-form errors.',
      commentSi: 'සරල, නැවත නැවත යෙදෙන වචන. වචන ස්වරූප වැරදි කිහිපයක් ඇත.',
      toReach8: 'Use precise collocations (create jobs, achieve higher grades) and fix word forms (interested / interesting).',
    },
    {
      key: 'GRA', name: 'Grammar', band: 5.0,
      comment: 'Frequent errors with plurals, verb agreement and articles. Mostly simple sentences.',
      commentSi: 'බහුවචන, ක්‍රියාපද ගැළපීම සහ a/an/the සම්බන්ධ වැරදි නිතර ඇත.',
      toReach8: 'Most sentences must be error-free. Master plurals and subject–verb agreement first.',
    },
  ],
  mainProblems: [
    {
      severity: 'High',
      title: 'Grammar accuracy',
      description: 'You make repeated mistakes with plural nouns (8), verb agreement (5) and articles (4).',
      descriptionSi: 'ඔබ බහුවචන (8), ක්‍රියාපද ගැළපීම (5) සහ a/an/the (4) සම්බන්ධයෙන් නැවත නැවත වැරදි කරයි.',
    },
    {
      severity: 'High',
      title: 'Essay too short & ideas not developed',
      description: 'About 180 words – IELTS requires at least 250. Each idea needs a reason and an example.',
      descriptionSi: 'වචන 180 ක් පමණි – අවම වශයෙන් 250 ක් අවශ්‍යයි. සෑම අදහසකටම හේතුවක් සහ උදාහරණයක් අවශ්‍යයි.',
    },
    {
      severity: 'Medium',
      title: 'Word forms and word partners',
      description: '"interested" vs "interesting", "interested in", "have difficulty finding".',
      descriptionSi: '"interested" සහ "interesting", "interested in", "have difficulty finding".',
    },
  ],
  learningOrder: ['plural-nouns', 'subject-verb-agreement', 'articles-countable', 'prepositions', 'verb-patterns', 'task-response'],
  teacherNote:
    'Do not try to learn difficult vocabulary yet. Your biggest score gain will come from fixing plurals, verb agreement and articles – these three topics caused 17 of your 25 mistakes. Then practise writing longer paragraphs with a reason and an example.',
  teacherNoteSi:
    'දැනට අමාරු වචන ඉගෙනීමට උත්සාහ නොකරන්න. බහුවචන, ක්‍රියාපද ගැළපීම සහ a/an/the නිවැරදි කිරීමෙන් ඔබට වැඩිම ලකුණු ලැබේ – ඔබේ වැරදි 25 න් 17 ක් මෙම මාතෘකා තුනෙනි.',
  markedEssay: MARKED_ESSAY,
  issues: [
    {
      id: 'plural', title: 'Singular and plural nouns', category: 'Grammar', severity: 'High',
      original: 'Firstly, many people have different opinion about this.',
      corrected: 'Firstly, many people have different opinions about this.',
      why: 'You are talking about the opinions of many people, so there is more than one opinion. Use the plural: opinions. The same problem appears with "student", "side", "subject", "peoples" and "This subjects".',
      whySi: 'ඔබ කතා කරන්නේ බොහෝ දෙනාගේ අදහස් ගැනයි. එබැවින් බහුවචනය "opinions" යොදන්න.',
      rule: 'many / both / different / several + plural noun. "People" is already plural.',
      lessonTopic: 'plural-nouns', occurrences: 8, tag: 'Repeated 8 times – high priority',
    },
    {
      id: 'sva', title: 'Subject–verb agreement', category: 'Grammar', severity: 'High',
      original: 'If a student study a subject that they are interested, …',
      corrected: 'If a student studies a subject that they are interested in, …',
      why: '"A student" is one person (he/she). In the present simple, he/she/it needs a verb with -s: studies. Same problem: "interest make", "my cousin love", "science and technology is", "it give".',
      whySi: '"A student" යනු එක් අයෙකි. he/she සමඟ ක්‍රියාපදයට -s එකතු වේ: studies.',
      rule: 'he / she / it / one thing + verb-s. Two things joined by "and" → plural verb.',
      lessonTopic: 'subject-verb-agreement', occurrences: 5, tag: 'High-priority weakness',
    },
    {
      id: 'articles', title: 'Articles (a / an / the)', category: 'Grammar', severity: 'High',
      original: 'they may have difficulty finding a employment after graduating.',
      corrected: 'they may have difficulty finding employment after graduating.',
      why: '"Employment" is uncountable – you cannot say "one employment, two employments". We never put "a" before uncountable nouns. Also: "choosing a subject", "think about jobs", "The government".',
      whySi: '"Employment" ගණන් කළ නොහැකි නාම පදයකි. එය ඉදිරියෙන් "a" යොදන්න එපා.',
      rule: 'a / an only with ONE countable noun. No article for general uncountable ideas.',
      lessonTopic: 'articles-countable', occurrences: 4, tag: 'Repeated practice recommended',
    },
    {
      id: 'wordform', title: 'Interested vs. interesting (word form)', category: 'Vocabulary', severity: 'Medium',
      original: 'Students should choose their interested subjects.',
      corrected: 'Students should choose subjects they are interested in.',
      why: '"Interested" describes how a PERSON feels. The subjects do not feel interested – the students do. So the student is the subject of "are interested in".',
      whySi: '"Interested" යනු පුද්ගලයෙකුට දැනෙන ආකාරයයි. විෂයයන්ට එසේ දැනෙන්නේ නැත.',
      rule: '-ed = how a person feels. -ing = the thing that causes the feeling.',
      lessonTopic: 'word-forms', occurrences: 1, tag: 'New lesson recommended',
    },
    {
      id: 'prep', title: 'Missing or wrong preposition', category: 'Grammar', severity: 'Medium',
      original: 'a subject that they are interested, they will work hard',
      corrected: 'a subject that they are interested in, they will work hard',
      why: 'The adjective "interested" always needs the preposition "in" – even when it comes at the end of the clause. Also: we say "at university", not "in university".',
      whySi: '"interested" සමඟ සැමවිටම "in" යෙදිය යුතුය.',
      rule: 'Learn word + preposition as one chunk: interested in, depend on, responsible for.',
      lessonTopic: 'prepositions', occurrences: 2, tag: 'Related to the "interested" issue',
    },
    {
      id: 'verbpat', title: 'Verb patterns (-ing / to + verb)', category: 'Grammar', severity: 'Medium',
      original: 'they may face difficulties to find a employment after graduate.',
      corrected: 'they may have difficulty finding employment after graduating.',
      why: 'The fixed pattern is "have difficulty + verb-ing". Also, after a preposition like "after", the verb takes -ing: after graduating.',
      whySi: 'නිවැරදි රටාව "have difficulty + verb-ing" වේ. "after" වැනි වචනවලට පසුව -ing යොදන්න.',
      rule: 'have difficulty / avoid / enjoy + verb-ing. Preposition + verb-ing.',
      lessonTopic: 'verb-patterns', occurrences: 2,
    },
    {
      id: 'punct', title: 'Commas after introductory phrases', category: 'Punctuation', severity: 'Low',
      original: 'For example my cousin love art and now he is a designer.',
      corrected: 'For example, my cousin loves art and now he is a designer.',
      why: 'Put a comma after starting phrases like "For example," "In this essay," and before "but" when it joins two complete sentences.',
      whySi: '"For example," වැනි ආරම්භක වාක්‍ය කොටස්වලට පසුව කොමාවක් යොදන්න.',
      rule: 'Introductory phrase + comma. Full sentence + ", but" + full sentence.',
      lessonTopic: 'sentence-structure', occurrences: 3,
    },
  ],
  improvements: [
    {
      original: 'Government should balance both sides.',
      better: 'The government could balance students\' interests with the needs of the job market.',
      why: 'Your idea is understandable, but "both sides" is vague. Say exactly what should be balanced.',
      whySi: 'ඔබේ අදහස තේරුම් ගත හැක, නමුත් "both sides" පැහැදිලි නැත.',
    },
    {
      original: 'they will work hard and get good marks.',
      better: 'they are likely to work harder and achieve higher grades.',
      why: '"get good marks" is correct but informal. "achieve higher grades" is a natural academic collocation.',
      whySi: '"get good marks" නිවැරදියි, නමුත් අවිධිමත්ය.',
    },
    {
      original: 'they give many jobs.',
      better: 'they create a large number of well-paid jobs.',
      why: 'We usually say "create jobs" or "provide jobs", not "give jobs".',
      whySi: 'සාමාන්‍යයෙන් "create jobs" ලෙස කියයි.',
    },
  ],
  band8Edits: BAND8_EDITS,
  band8Overall: 8.0,
  band8Criteria: [
    { key: 'TR', band: 8.0 },
    { key: 'CC', band: 8.0 },
    { key: 'LR', band: 7.5 },
    { key: 'GRA', band: 8.0 },
  ],
  band8Notes: [
    'A clear position is now stated in the introduction and repeated in the conclusion (Task Response).',
    'Each body paragraph has a clear topic sentence, a reason and a specific example (Task Response, Coherence).',
    'Vague words were replaced with precise collocations: "create jobs", "achieve higher grades", "valid arguments" (Lexical Resource).',
    'A wider range of structures: present perfect, "provided that", "because" clauses (Grammar).',
    'Length is now above 250 words without changing your ideas.',
  ],
  warnings: ['About 180 words – IELTS Task 2 requires at least 250 words. Short essays lose Task Response marks.'],
};
