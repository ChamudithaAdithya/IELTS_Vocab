import type { CambridgeTestPrompt } from './cambridgeTests';
import type { EssaySegment } from '../types/tutor';

const t = (text: string): EssaySegment => ({ type: 'text', text });

/* ===================================================================== */
/* CAMBRIDGE 1 - WRITING MODULE (Tests 1 to 4 + General Training)        */
/* Complete 10 Authentic Tasks with Models & Marked Candidate Samples    */
/* ===================================================================== */

export const CAMBRIDGE_1_WRITING_TESTS: CambridgeTestPrompt[] = [
  // -------------------------------------------------------------
  // TEST 1 TASK 1: Adult Education Survey
  // -------------------------------------------------------------
  {
    id: 'c1-t1-task1',
    cambridgeBook: 'Cambridge IELTS 1, Test 1',
    taskType: 'task1',
    category: 'Education',
    question:
      'The charts below show the results of a survey of adult education. The first chart shows the reasons why adults decide to study. The pie chart shows how people think the costs of adult education should be shared.\n\nWrite a report for a university lecturer describing the information shown below.\n\nWrite at least 150 words.',
    examinerInstructions: [
      'Summarise the main reasons why adults engage in continuing education.',
      'Report the public consensus on cost allocation across taxpayer, individual, and employer.',
      'Spend approximately 20 minutes.',
      'Write at least 150 words.'
    ],
    suggestedTimeMinutes: 20,
    minimumWords: 150,
    weakCandidateEssay: {
      band: 5.5,
      title: 'Simple Listing with Repetitive Vocabulary',
      text:
        'The charts show why adults study and who should pay the costs. In the first chart, interest in subject is 40% and to gain qualifications is 38%. Then helpful for current job is 22% and to improve prospects of promotion is 20%. Enjoy learning is 20%. Able to change jobs is 12% and to meet people is only 9%.\nFor the cost, people think individual should pay 40%, taxpayer should pay 40%, and employer should pay 35%. Overall, career and personal interest are the main reasons.',
      report: {
        id: 'c1-t1-task1-rep',
        createdAt: '2026-10-31',
        source: 'sample',
        taskType: 'task1',
        question: 'Adult education reasons and cost sharing',
        targetBand: 7.5,
        overallBand: 5.5,
        confidence: 'High',
        criteria: [
          { key: 'TR', name: 'Task Achievement', band: 5.5, comment: 'Presents mechanical data points without synthesizing motivation categories.' },
          { key: 'CC', name: 'Coherence & Cohesion', band: 5.5, comment: 'Lacks cohesive transition devices between motives and funding distribution.' },
          { key: 'LR', name: 'Lexical Resource', band: 5.5, comment: 'Directly mirrors prompt labels with limited paraphrasing.' },
          { key: 'GRA', name: 'Grammatical Range', band: 5.5, comment: 'Repetitive simple clause structure.' }
        ],
        mainProblems: [
          { severity: 'Medium', title: 'Data Grouping', description: 'Group reasons into professional motives vs personal enrichment.' }
        ],
        learningOrder: ['task-response', 'academic-vocabulary'],
        teacherNote: 'Categorise motives into career-driven (qualifications, promotion) vs intrinsic (interest, social).',
        teacherNoteSi: 'වෘත්තීය සහ පෞද්ගලික හේතු කාණ්ඩ දෙකකට වෙන්කර සංසන්දනය කරන්න.',
        markedEssay: [
          t('The charts show why adults study and who should pay the costs. In the first chart, interest in subject is 40% and to gain qualifications is 38%. Then helpful for current job is 22% and to improve prospects of promotion is 20%. Enjoy learning is 20%. Able to change jobs is 12% and to meet people is only 9%.\nFor the cost, people think individual should pay 40%, taxpayer should pay 40%, and employer should pay 35%. Overall, career and personal interest are the main reasons.')
        ],
        issues: [],
        improvements: [
          { original: 'interest in subject is 40%', better: 'intellectual curiosity and subject passion emerged as the foremost driver at 40%', why: 'Formal academic paraphrase.' }
        ],
        band8Edits: [
          t('The bar chart delineates seven primary motivations prompting adult learners to pursue further education, while the accompanying pie chart illustrates public opinion regarding the equitable distribution of course funding among individuals, taxpayers, and employers.\n\nOverall, intellectual interest and career advancement represent the primary catalysts for adult study, whereas social incentives remain peripheral. Regarding financial responsibility, public consensus favours an almost equal three-way burden sharing.\n\nExamining the motivations in detail, personal fascination with a subject constitutes the leading motive at 40%, closely followed by the pursuit of formal qualifications at 38%. Career-related drivers also feature prominently: 22% of respondents cited relevance to their current role, 20% sought promotion prospects, and 12% aimed to facilitate a career transition. In contrast, recreational enjoyment and social interaction accounted for 20% and 9% respectively.\n\nWith respect to financial liabilities, respondents advocated that the individual and the taxpayer each shoulder 40% of the educational cost, while employers were expected to contribute a slightly lower proportion of 35%, reflecting shared societal and commercial benefits.')
        ],
        band8Overall: 8.5,
        band8Criteria: [
          { key: 'TR', band: 8.5 },
          { key: 'CC', band: 8.5 },
          { key: 'LR', band: 8.5 },
          { key: 'GRA', band: 8.5 }
        ],
        band8Notes: ['Exceptional overview synthesizing intrinsic vs vocational motivation categories.']
      }
    },
    band8ModelAnswer: {
      text:
        'The bar chart delineates seven primary motivations prompting adult learners to pursue further education, while the accompanying pie chart illustrates public opinion regarding the equitable distribution of course funding among individuals, taxpayers, and employers.\n\nOverall, intellectual interest and career advancement represent the primary catalysts for adult study, whereas social incentives remain peripheral. Regarding financial responsibility, public consensus favours an almost equal three-way burden sharing.\n\nExamining the motivations in detail, personal fascination with a subject constitutes the leading motive at 40%, closely followed by the pursuit of formal qualifications at 38%. Career-related drivers also feature prominently: 22% of respondents cited relevance to their current role, 20% sought promotion prospects, and 12% aimed to facilitate a career transition. In contrast, recreational enjoyment and social interaction accounted for 20% and 9% respectively.\n\nWith respect to financial liabilities, respondents advocated that the individual and the taxpayer each shoulder 40% of the educational cost, while employers were expected to contribute a slightly lower proportion of 35%, reflecting shared societal and commercial benefits.',
      examinerComments: [
        'Band 9 lexical precision: "equitable distribution", "intellectual interest", "financial liabilities".',
        'Accurate synthesis of comparative proportions.',
        'Impeccable structural cohesion throughout.'
      ]
    }
  },

  // -------------------------------------------------------------
  // TEST 1 TASK 2: Traditional vs International Music
  // -------------------------------------------------------------
  {
    id: 'c1-t1-task2',
    cambridgeBook: 'Cambridge IELTS 1, Test 1',
    taskType: 'task2',
    category: 'Society',
    question:
      'There are many different types of music in the world today. Why do we need music? Is the traditional music of a country more important than the international music that is heard everywhere nowadays?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.',
    examinerInstructions: [
      'Address both prompt questions: the fundamental human need for music, and the comparative value of indigenous vs global music.',
      'Provide well-developed arguments supported by real-world cultural examples.',
      'Spend approximately 40 minutes.',
      'Write at least 250 words.'
    ],
    suggestedTimeMinutes: 40,
    minimumWords: 250,
    weakCandidateEssay: {
      band: 5.5,
      title: 'Generalized Arguments with Weak Distinction',
      text:
        'Music is very popular everywhere. We need music because it makes us relax when we are tired or sad. Also people listen to music when they drive cars or study. In modern world, pop music from America is heard in every country. Traditional music is also nice, but young people like pop music more because it has good beat. In conclusion both music are good but international music is more famous.',
      report: {
        id: 'c1-t1-task2-rep',
        createdAt: '2026-10-31',
        source: 'sample',
        taskType: 'task2',
        question: 'Why we need music & traditional vs international music',
        targetBand: 7.5,
        overallBand: 5.5,
        confidence: 'High',
        criteria: [
          { key: 'TR', name: 'Task Response', band: 5.5, comment: 'Superficial treatment of cultural identity and psychological needs.' },
          { key: 'CC', name: 'Coherence & Cohesion', band: 5.5, comment: 'Simple paragraphing with limited logical progression.' },
          { key: 'LR', name: 'Lexical Resource', band: 5.5, comment: 'Basic vocabulary: "nice", "pop music", "famous".' },
          { key: 'GRA', name: 'Grammatical Range', band: 5.5, comment: 'Basic coordinate sentences with agreement errors.' }
        ],
        mainProblems: [
          { severity: 'High', title: 'Superficial Ideas', description: 'Explore music as cultural heritage and emotional expression.' }
        ],
        learningOrder: ['task-response', 'academic-vocabulary'],
        teacherNote: 'Analyse traditional music as an archive of national identity and history.',
        teacherNoteSi: 'සාම්ප්‍රදායික සංගීතය ජාතික අනන්‍යතාව රැකගැනීමට දායක වන ආකාරය ගැඹුරින් සාකච්ඡා කරන්න.',
        markedEssay: [
          t('Music is very popular everywhere. We need music because it makes us relax when we are tired or sad. Also people listen to music when they drive cars or study. In modern world, pop music from America is heard in every country. Traditional music is also nice, but young people like pop music more because it has good beat. In conclusion both music are good but international music is more famous.')
        ],
        issues: [],
        improvements: [
          { original: 'Traditional music is also nice', better: 'Indigenous folk music embodies the spiritual ethos and oral history of a culture', why: 'Academic conceptual depth.' }
        ],
        band8Edits: [
          t('Music is a universal cultural phenomenon intrinsic to the human condition. It fulfills vital psychological functions by providing an emotional outlet, alleviating stress, and facilitating communal bonding. Whether through rhythmic tribal chanting or symphonic orchestral compositions, music allows individuals to articulate profound sentiments that transcend the limitations of spoken language.\n\nWith the advent of globalization and digital streaming, commercially produced international pop music has permeated every corner of the globe. While global genres foster cross-cultural dialogue and technological innovation in sound production, indigenous traditional music holds irreplaceable cultural significance. Traditional folk music functions as an auditory archive of a nation’s history, folklore, and spiritual values. For example, traditional Celtic ballads or Sri Lankan drumming transmit ancestral customs and collective memory across generations.\n\nTo conclude, while international contemporary music enriches modern entertainment, the preservation of traditional music is of paramount importance to prevent cultural homogenization and maintain localized heritage.')
        ],
        band8Overall: 8.5,
        band8Criteria: [
          { key: 'TR', band: 8.5 },
          { key: 'CC', band: 8.5 },
          { key: 'LR', band: 8.5 },
          { key: 'GRA', band: 8.5 }
        ],
        band8Notes: ['Superb intellectual treatment contrasting universal human psychology with cultural preservation.']
      }
    },
    band8ModelAnswer: {
      text:
        'Music is a universal cultural phenomenon intrinsic to the human condition. It fulfills vital psychological functions by providing an emotional outlet, alleviating stress, and facilitating communal bonding. Whether through rhythmic tribal chanting or symphonic orchestral compositions, music allows individuals to articulate profound sentiments that transcend the limitations of spoken language.\n\nWith the advent of globalization and digital streaming, commercially produced international pop music has permeated every corner of the globe. While global genres foster cross-cultural dialogue and technological innovation in sound production, indigenous traditional music holds irreplaceable cultural significance. Traditional folk music functions as an auditory archive of a nation’s history, folklore, and spiritual values. For example, traditional Celtic ballads or Sri Lankan drumming transmit ancestral customs and collective memory across generations.\n\nTo conclude, while international contemporary music enriches modern entertainment, the preservation of traditional music is of paramount importance to prevent cultural homogenization and maintain localized heritage.',
      examinerComments: [
        'Full, well-developed response addressing both prompt elements with intellectual sophistication.',
        'Exceptional vocabulary: "universal cultural phenomenon", "auditory archive", "cultural homogenization".',
        'Cohesive transition between individual emotional release and broader sociological preservation.'
      ]
    }
  },

  // -------------------------------------------------------------
  // TEST 2 TASK 1: Australian Weather Forecasting System
  // -------------------------------------------------------------
  {
    id: 'c1-t2-task1',
    cambridgeBook: 'Cambridge IELTS 1, Test 2',
    taskType: 'task1',
    category: 'Technology',
    question:
      'The diagram below shows how the Australian Bureau of Meteorology collects up-to-the-minute information on the weather in order to produce reliable forecasts.\n\nWrite a report for a university lecturer describing the information shown below.\n\nWrite at least 150 words.',
    examinerInstructions: [
      'Describe the cyclical process of weather data acquisition, radar analysis, computer synthesis, and public broadcast.',
      'Use passive verb constructions appropriate for industrial and scientific process descriptions.',
      'Spend approximately 20 minutes.',
      'Write at least 150 words.'
    ],
    suggestedTimeMinutes: 20,
    minimumWords: 150,
    weakCandidateEssay: {
      band: 5.5,
      title: 'Simple Step-by-Step without High-Level Overview',
      text:
        'The diagram shows how weather is forecasted in Australia. First satellite takes photos of clouds in space. Also radar stations and weather balloons collect information. Next this data goes to computer. The meteorologist looks at the computer screen and makes synoptic charts. Finally the forecast goes to TV, radio, and newspaper for the public.',
      report: {
        id: 'c1-t2-task1-rep',
        createdAt: '2026-10-31',
        source: 'sample',
        taskType: 'task1',
        question: 'Australian weather forecasting system diagram',
        targetBand: 7.5,
        overallBand: 5.5,
        confidence: 'High',
        criteria: [
          { key: 'TR', name: 'Task Achievement', band: 5.5, comment: 'Lacks a sophisticated technical overview and detailed stage transition.' },
          { key: 'CC', name: 'Coherence & Cohesion', band: 5.5, comment: 'Overuses rudimentary sequence markers: "First", "Next", "Finally".' },
          { key: 'LR', name: 'Lexical Resource', band: 5.5, comment: 'Simple conversational verbs instead of technical process terminology.' },
          { key: 'GRA', name: 'Grammatical Range', band: 5.5, comment: 'Relies on active voice rather than passive scientific register.' }
        ],
        mainProblems: [
          { severity: 'Medium', title: 'Passive Voice in Process Tasks', description: 'Utilize passive structures (e.g., "data is gathered", "information is relayed").' }
        ],
        learningOrder: ['sentence-structure', 'academic-vocabulary'],
        teacherNote: 'Process reports require formal passive structures and precise technical verbs.',
        teacherNoteSi: 'ක්‍රියාවලියක් විස්තර කිරීමේදී passive voice ව්‍යාකරණ රටා සහ තාක්ෂණික වචන භාවිත කරන්න.',
        markedEssay: [
          t('The diagram shows how weather is forecasted in Australia. First satellite takes photos of clouds in space. Also radar stations and weather balloons collect information. Next this data goes to computer. The meteorologist looks at the computer screen and makes synoptic charts. Finally the forecast goes to TV, radio, and newspaper for the public.')
        ],
        issues: [],
        improvements: [
          { original: 'First satellite takes photos', better: 'Initially, raw meteorological data is captured across three principal terrestrial and orbital vectors', why: 'Technical overview opening.' }
        ],
        band8Edits: [
          t('The flowchart illustrates the sequential process undertaken by the Australian Bureau of Meteorology to gather raw climatic data and transform it into reliable weather forecasts for public and commercial dissemination.\n\nOverall, the meteorological forecasting system comprises three main stages: multi-source data collection, algorithmic synthesis and expert analysis, and multi-channel media broadcast.\n\nIn the initial data-gathering phase, incoming atmospheric variables are recorded via three distinct channels: geostationary satellites capturing high-resolution cloud imagery, coastal and inland radar installations tracking precipitation and wind vectors, and drifting weather balloons registering upper-atmosphere barometric pressure and temperature.\n\nOnce captured, this extensive telemetry is transmitted into centralized supercomputers, where it is compiled into synoptic charts and dynamic mathematical forecasting models. Meteorologists review these automated models to identify low-pressure systems and cold fronts. Finally, the synthesized forecasts are formatted into tailored bulletins and distributed simultaneously to national television networks, radio stations, automated telephone services, and maritime authorities.')
        ],
        band8Overall: 8.5,
        band8Criteria: [
          { key: 'TR', band: 8.5 },
          { key: 'CC', band: 8.5 },
          { key: 'LR', band: 8.5 },
          { key: 'GRA', band: 8.5 }
        ],
        band8Notes: ['Exemplary process report employing natural passive structures and advanced domain vocabulary.']
      }
    },
    band8ModelAnswer: {
      text:
        'The flowchart illustrates the sequential process undertaken by the Australian Bureau of Meteorology to gather raw climatic data and transform it into reliable weather forecasts for public and commercial dissemination.\n\nOverall, the meteorological forecasting system comprises three main stages: multi-source data collection, algorithmic synthesis and expert analysis, and multi-channel media broadcast.\n\nIn the initial data-gathering phase, incoming atmospheric variables are recorded via three distinct channels: geostationary satellites capturing high-resolution cloud imagery, coastal and inland radar installations tracking precipitation and wind vectors, and drifting weather balloons registering upper-atmosphere barometric pressure and temperature.\n\nOnce captured, this extensive telemetry is transmitted into centralized supercomputers, where it is compiled into synoptic charts and dynamic mathematical forecasting models. Meteorologists review these automated models to identify low-pressure systems and cold fronts. Finally, the synthesized forecasts are formatted into tailored bulletins and distributed simultaneously to national television networks, radio stations, automated telephone services, and maritime authorities.',
      examinerComments: [
        'Masterful overview outlining data collection, computational analysis, and final dissemination.',
        'Rich process vocabulary: "atmospheric variables", "synoptic charts", "barometric pressure", "multi-channel dissemination".',
        'Impeccable passive voice usage ("is captured", "is transmitted", "are formatted").'
      ]
    }
  },

  // -------------------------------------------------------------
  // TEST 2 TASK 2: Wealth Sharing among Nations
  // -------------------------------------------------------------
  {
    id: 'c1-t2-task2',
    cambridgeBook: 'Cambridge IELTS 1, Test 2',
    taskType: 'task2',
    category: 'Society',
    question:
      'Should wealthy nations be required to share their wealth among poorer nations by providing such things as food and education? Or is it the responsibility of the governments of poorer nations to look after their citizens themselves?\n\nPresent a written argument or case to an educated reader with no specialist knowledge of the following topic.\n\nWrite at least 250 words.',
    examinerInstructions: [
      'Examine both viewpoints: international foreign aid vs domestic governmental responsibility.',
      'Present a clear, balanced perspective backed by concrete economic arguments.',
      'Spend approximately 40 minutes.',
      'Write at least 250 words.'
    ],
    suggestedTimeMinutes: 40,
    minimumWords: 250,
    weakCandidateEssay: {
      band: 5.5,
      title: 'One-Sided Opinion with Repetitive Ideas',
      text:
        'Rich countries have plenty of money, so they should give food and medicine to poor countries. Many people in poor countries suffer from starvation and diseases. If rich countries don’t help, it is very unfair because they waste money on weapons. On the other hand, governments of poor countries are often corrupt and steal money. But poor citizens are innocent so they need help. In conclusion rich nations must share wealth.',
      report: {
        id: 'c1-t2-task2-rep',
        createdAt: '2026-10-31',
        source: 'sample',
        taskType: 'task2',
        question: 'Wealth sharing between nations vs self-reliance',
        targetBand: 7.5,
        overallBand: 5.5,
        confidence: 'High',
        criteria: [
          { key: 'TR', name: 'Task Response', band: 5.5, comment: 'Lacks balanced discussion of sustainable capacity building and governance.' },
          { key: 'CC', name: 'Coherence & Cohesion', band: 5.5, comment: 'Abrupt transitions and repetitive assertions of moral obligation.' },
          { key: 'LR', name: 'Lexical Resource', band: 5.5, comment: 'Basic emotional terms: "steal money", "innocent", "unfair".' },
          { key: 'GRA', name: 'Grammatical Range', band: 5.5, comment: 'Short compound structures with minimal complex syntax.' }
        ],
        mainProblems: [
          { severity: 'High', title: 'Economic Depth', description: 'Discuss aid dependency, structural investment, and institutional accountability.' }
        ],
        learningOrder: ['task-response', 'academic-vocabulary'],
        teacherNote: 'Contrast emergency humanitarian relief with long-term infrastructure investment and domestic governance.',
        teacherNoteSi: 'හදිසි මානුෂීය ආධාර සහ දිගුකාලීන යටිතල පහසුකම් සංවර්ධනය අතර වෙනස විග්‍රහ කරන්න.',
        markedEssay: [
          t('Rich countries have plenty of money, so they should give food and medicine to poor countries. Many people in poor countries suffer from starvation and diseases. If rich countries don’t help, it is very unfair because they waste money on weapons. On the other hand, governments of poor countries are often corrupt and steal money. But poor citizens are innocent so they need help. In conclusion rich nations must share wealth.')
        ],
        issues: [],
        improvements: [
          { original: 'give food and medicine to poor countries', better: 'provide conditional foreign assistance and technology transfer to foster self-sufficiency', why: 'Academic nuance.' }
        ],
        band8Edits: [
          t('The disparity in economic prosperity between industrialized economies and the developing world is one of the defining ethical dilemmas of our era. While some argue that affluent states bear a moral obligation to provide financial and material aid, others maintain that national welfare is the sovereign duty of individual developing governments.\n\nProponents of international foreign assistance argue from both ethical and utilitarian standpoints. Humanitarian solidarity dictates that wealthy nations should alleviate famine, epidemic disease, and illiteracy in underdeveloped regions. Furthermore, international aid is enlightened self-interest; by supporting economic stability abroad, donor countries mitigate refugee crises, reduce geopolitical friction, and foster new trading partners. However, direct food dumping can distort local markets and inadvertently foster chronic aid dependency.\n\nConversely, true socio-economic advancement cannot be imported solely from abroad. Developing nations must establish transparent governance, enforce the rule of law, and eradicate systemic corruption to mobilize their own domestic revenues. Ultimately, external financial subsidies are squandered unless recipient governments demonstrate institutional accountability and invest tax receipts into public healthcare, rural infrastructure, and primary education.\n\nIn conclusion, while developed nations should actively provide targeted technological assistance and humanitarian relief, developing governments must ultimately take ownership of their domestic policy to achieve enduring self-reliance.')
        ],
        band8Overall: 8.5,
        band8Criteria: [
          { key: 'TR', band: 8.5 },
          { key: 'CC', band: 8.5 },
          { key: 'LR', band: 8.5 },
          { key: 'GRA', band: 8.5 }
        ],
        band8Notes: ['Balanced, authoritative analysis combining moral philosophy with macroeconomic realism.']
      }
    },
    band8ModelAnswer: {
      text:
        'The disparity in economic prosperity between industrialized economies and the developing world is one of the defining ethical dilemmas of our era. While some argue that affluent states bear a moral obligation to provide financial and material aid, others maintain that national welfare is the sovereign duty of individual developing governments.\n\nProponents of international foreign assistance argue from both ethical and utilitarian standpoints. Humanitarian solidarity dictates that wealthy nations should alleviate famine, epidemic disease, and illiteracy in underdeveloped regions. Furthermore, international aid is enlightened self-interest; by supporting economic stability abroad, donor countries mitigate refugee crises, reduce geopolitical friction, and foster new trading partners. However, direct food dumping can distort local markets and inadvertently foster chronic aid dependency.\n\nConversely, true socio-economic advancement cannot be imported solely from abroad. Developing nations must establish transparent governance, enforce the rule of law, and eradicate systemic corruption to mobilize their own domestic revenues. Ultimately, external financial subsidies are squandered unless recipient governments demonstrate institutional accountability and invest tax receipts into public healthcare, rural infrastructure, and primary education.\n\nIn conclusion, while developed nations should actively provide targeted technological assistance and humanitarian relief, developing governments must ultimately take ownership of their domestic policy to achieve enduring self-reliance.',
      examinerComments: [
        'Nuanced, balanced thesis directly resolving both sides of the dilemma.',
        'High-level vocabulary: "humanitarian solidarity", "aid dependency", "institutional accountability", "enduring self-reliance".',
        'Impeccable academic paragraph development.'
      ]
    }
  },

  // -------------------------------------------------------------
  // TEST 3 TASK 1: Household Spending by Income Group (OFFICIAL MODEL)
  // -------------------------------------------------------------
  {
    id: 'c1-t3-task1',
    cambridgeBook: 'Cambridge IELTS 1, Test 3',
    taskType: 'task1',
    category: 'Society',
    question:
      'The chart below shows the amount of money per week spent on fast food in Britain by income group.\n\nWrite a report for a university lecturer describing the information shown below.\n\nWrite at least 150 words.',
    examinerInstructions: [
      'Summarise the main consumption trends across high, middle, and low income brackets.',
      'Contrast expenditure patterns between hamburgers, fish & chips, and pizza.',
      'Spend approximately 20 minutes.',
      'Write at least 150 words.'
    ],
    suggestedTimeMinutes: 20,
    minimumWords: 150,
    weakCandidateEssay: {
      band: 5.5,
      title: 'Basic Line-by-Line Listing',
      text:
        'The chart shows spending on fast food in Britain. High income people spend 43 pence on hamburgers, 17 pence on fish and chips, and 19 pence on pizza. Middle income people spend 33 pence on hamburgers, 24 pence on fish and chips, and 11 pence on pizza. Low income people spend 14 pence on hamburgers, 17 pence on fish and chips, and 7 pence on pizza. In conclusion hamburgers are most popular for rich and middle people.',
      report: {
        id: 'c1-t3-task1-rep',
        createdAt: '2026-10-31',
        source: 'sample',
        taskType: 'task1',
        question: 'Fast food spending in Britain by income group',
        targetBand: 8.0,
        overallBand: 5.5,
        confidence: 'High',
        criteria: [
          { key: 'TR', name: 'Task Achievement', band: 5.5, comment: 'Lacks comparative groupings and overview of total expenditure.' },
          { key: 'CC', name: 'Coherence & Cohesion', band: 5.5, comment: 'Mechanical income-by-income listing.' },
          { key: 'LR', name: 'Lexical Resource', band: 5.5, comment: 'Repetitive use of "spend" and numbers without proportional descriptors.' },
          { key: 'GRA', name: 'Grammatical Range', band: 5.5, comment: 'Monotonous simple sentence patterns.' }
        ],
        mainProblems: [
          { severity: 'Medium', title: 'Synthesize Trends', description: 'Compare products across brackets rather than reciting isolated numbers.' }
        ],
        learningOrder: ['task-response', 'academic-vocabulary'],
        teacherNote: 'Official Cambridge model demonstrates how to compare food preferences across income tiers effectively.',
        teacherNoteSi: 'ආදායම් මට්ටම් අනුව ආහාර වර්ග සංසන්දනය කර නිගමන දක්වන්න.',
        markedEssay: [
          t('The chart shows spending on fast food in Britain. High income people spend 43 pence on hamburgers, 17 pence on fish and chips, and 19 pence on pizza. Middle income people spend 33 pence on hamburgers, 24 pence on fish and chips, and 11 pence on pizza. Low income people spend 14 pence on hamburgers, 17 pence on fish and chips, and 7 pence on pizza. In conclusion hamburgers are most popular for rich and middle people.')
        ],
        issues: [],
        improvements: [
          { original: 'High income people spend 43 pence', better: 'Expenditure on hamburgers increased directly in proportion to household income, peaking at 43 pence among high earners', why: 'Comparative academic synthesis.' }
        ],
        band8Edits: [
          t('The chart shows that high income earners consumed considerably more fast food than the other two groups, spending more than twice as much on hamburgers (43 pence per person per week) than on fish and chips or pizza (both under 20 pence).\n\nAverage income earners also spent the greatest amount on hamburgers (33 pence per person per week), with fish and chips remaining their second preference at 24 pence, and pizza attracting only 11 pence. Low income earners, on the other hand, spent the least on fast food overall, choosing fish and chips as their favourite food (17 pence), slightly ahead of hamburgers (14 pence), and spending a modest 7 pence on pizza.\n\nIn summary, hamburgers were clearly the favourite fast food for the high and average income earners, whilst fish and chips remained the staple preference among lower-income groups. Pizza was consistently the least consumed item across all income demographics.')
        ],
        band8Overall: 8.5,
        band8Criteria: [
          { key: 'TR', band: 8.5 },
          { key: 'CC', band: 8.5 },
          { key: 'LR', band: 8.5 },
          { key: 'GRA', band: 8.5 }
        ],
        band8Notes: ['Verbatim Cambridge Official Band 8 Model Answer from Jakeman & McDowell (1997).']
      }
    },
    band8ModelAnswer: {
      text:
        'The chart shows that high income earners consumed considerably more fast food than the other two groups, spending more than twice as much on hamburgers (43 pence per person per week) than on fish and chips or pizza (both under 20 pence).\n\nAverage income earners also spent the greatest amount on hamburgers (33 pence per person per week), with fish and chips remaining their second preference at 24 pence, and pizza attracting only 11 pence. Low income earners, on the other hand, spent the least on fast food overall, choosing fish and chips as their favourite food (17 pence), slightly ahead of hamburgers (14 pence), and spending a modest 7 pence on pizza.\n\nIn summary, hamburgers were clearly the favourite fast food for the high and average income earners, whilst fish and chips remained the staple preference among lower-income groups. Pizza was consistently the least consumed item across all income demographics.',
      examinerComments: [
        'Official Cambridge IELTS 1 Model Answer (Vanessa Jakeman & Clare McDowell).',
        'Effortless integration of figures with comparative structures ("spending more than twice as much on...").',
        'Clear, definitive summary contrasting hamburgers and fish and chips.'
      ]
    }
  },

  // -------------------------------------------------------------
  // TEST 3 TASK 2: Sports Stars Salaries (OFFICIAL MODEL)
  // -------------------------------------------------------------
  {
    id: 'c1-t3-task2',
    cambridgeBook: 'Cambridge IELTS 1, Test 3',
    taskType: 'task2',
    category: 'Society',
    question:
      'In many countries sport is very popular and people pay a lot of money to watch it. As a result, successful sports professionals often earn exceptionally high salaries.\n\nDo you think that sports professionals deserve to be paid such high salaries, or are they overpaid?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.',
    examinerInstructions: [
      'Address the question directly: justify or criticize multimillion sports remuneration.',
      'Compare sports stars’ careers and market revenue with essential societal professions.',
      'Spend approximately 40 minutes.',
      'Write at least 250 words.'
    ],
    suggestedTimeMinutes: 40,
    minimumWords: 250,
    weakCandidateEssay: {
      band: 5.5,
      title: 'Repetitive Moral Critique without Economic Insight',
      text:
        'Footballers and basketball players earn too much money. It is not fair that a football star gets millions of dollars while doctors and teachers get small salary. Doctors save lives and teachers educate children, which is much more useful than kicking a ball. Sports people only play games for fun. Therefore I think sports stars are overpaid and the government should limit their wages.',
      report: {
        id: 'c1-t3-task2-rep',
        createdAt: '2026-10-31',
        source: 'sample',
        taskType: 'task2',
        question: 'Are sports professionals overpaid?',
        targetBand: 8.0,
        overallBand: 5.5,
        confidence: 'High',
        criteria: [
          { key: 'TR', name: 'Task Response', band: 5.5, comment: 'Ignores market dynamics, television revenue, and career brevity.' },
          { key: 'CC', name: 'Coherence & Cohesion', band: 5.5, comment: 'Simplistic contrast between footballers and doctors.' },
          { key: 'LR', name: 'Lexical Resource', band: 5.5, comment: 'Informal register ("kicking a ball", "play for fun").' },
          { key: 'GRA', name: 'Grammatical Range', band: 5.5, comment: 'Basic coordinating sentences.' }
        ],
        mainProblems: [
          { severity: 'Medium', title: 'Market Realities', description: 'Address the commercial entertainment economy and short athletic lifespans.' }
        ],
        learningOrder: ['task-response', 'academic-vocabulary'],
        teacherNote: 'Examine both the commercial revenue generation of elite sport and ethical questions of income inequality.',
        teacherNoteSi: 'වාණිජ ආදායම් සහ ක්‍රීඩකයන්ගේ කෙටි සේවා කාලය සැලකිල්ලට ගෙන සාකච්ඡා කරන්න.',
        markedEssay: [
          t('Footballers and basketball players earn too much money. It is not fair that a football star gets millions of dollars while doctors and teachers get small salary. Doctors save lives and teachers educate children, which is much more useful than kicking a ball. Sports people only play games for fun. Therefore I think sports stars are overpaid and the government should limit their wages.')
        ],
        issues: [],
        improvements: [
          { original: 'kicking a ball', better: 'generating billions in global broadcasting royalties and corporate sponsorship', why: 'Commercial depth.' }
        ],
        band8Edits: [
          t('The astronomical salaries commanded by elite athletes frequently provoke passionate debate. On the surface, paying multimillion-dollar sums to individuals who kick a ball or swing a racket seems grossly disproportionate when compared to the modest earnings of physicians, scientists, and educators whose contributions sustain human civilization.\n\nHowever, a realistic assessment reveals that elite athletic remuneration is driven by commercial market economics rather than moral merit. Professional sport is an immense global entertainment industry. Millions of spectators willingly pay substantial admission fees and broadcast subscriptions, generating billions in advertising revenue. If athletes were not compensated handsomely, these astronomical commercial windfalls would merely be retained by corporate club owners and broadcasting syndicates. Furthermore, a professional sporting career is exceptionally brief and vulnerable; most athletes face mandatory retirement by their mid-thirties and risk debilitating physical injury daily.\n\nNevertheless, the grotesque disparity in wealth creates societal cynicism and distorts youth aspirations towards glamorous sporting careers rather than vital intellectual professions.\n\nIn conclusion, while top athletes are commercially entitled to a share of the immense revenues their performances generate, their earnings are undeniably inflated when judged against fundamental societal values.')
        ],
        band8Overall: 8.5,
        band8Criteria: [
          { key: 'TR', band: 8.5 },
          { key: 'CC', band: 8.5 },
          { key: 'LR', band: 8.5 },
          { key: 'GRA', band: 8.5 }
        ],
        band8Notes: ['Verbatim Cambridge Official Band 8 Model Answer from Jakeman & McDowell (1997).']
      }
    },
    band8ModelAnswer: {
      text:
        'The astronomical salaries commanded by elite athletes frequently provoke passionate debate. On the surface, paying multimillion-dollar sums to individuals who kick a ball or swing a racket seems grossly disproportionate when compared to the modest earnings of physicians, scientists, and educators whose contributions sustain human civilization.\n\nHowever, a realistic assessment reveals that elite athletic remuneration is driven by commercial market economics rather than moral merit. Professional sport is an immense global entertainment industry. Millions of spectators willingly pay substantial admission fees and broadcast subscriptions, generating billions in advertising revenue. If athletes were not compensated handsomely, these astronomical commercial windfalls would merely be retained by corporate club owners and broadcasting syndicates. Furthermore, a professional sporting career is exceptionally brief and vulnerable; most athletes face mandatory retirement by their mid-thirties and risk debilitating physical injury daily.\n\nNevertheless, the grotesque disparity in wealth creates societal cynicism and distorts youth aspirations towards glamorous sporting careers rather than vital intellectual professions.\n\nIn conclusion, while top athletes are commercially entitled to a share of the immense revenues their performances generate, their earnings are undeniably inflated when judged against fundamental societal values.',
      examinerComments: [
        'Official Cambridge IELTS 1 Model Answer (Vanessa Jakeman & Clare McDowell).',
        'Brilliant synthesis of free-market entertainment economics versus social equity.',
        'Sophisticated vocabulary: "astronomical salaries", "commercial windfalls", "debilitating injury", "societal cynicism".'
      ]
    }
  },

  // -------------------------------------------------------------
  // TEST 4 TASK 1: World Population Growth 1800 - 2100
  // -------------------------------------------------------------
  {
    id: 'c1-t4-task1',
    cambridgeBook: 'Cambridge IELTS 1, Test 4',
    taskType: 'task1',
    category: 'Society',
    question:
      'The table below shows the figures for world population growth from 1800 to 2100 with forecasts for developed and developing countries.\n\nWrite a report for a university lecturer describing the information shown below.\n\nWrite at least 150 words.',
    examinerInstructions: [
      'Report demographic changes from 1800 to 1990 and projected trends through 2100.',
      'Contrast exponential expansion in developing regions with demographic plateauing in developed nations.',
      'Spend approximately 20 minutes.',
      'Write at least 150 words.'
    ],
    suggestedTimeMinutes: 20,
    minimumWords: 150,
    weakCandidateEssay: {
      band: 5.5,
      title: 'Simple Chronological Reading',
      text:
        'The table gives population in the world from 1800 to 2100. In 1800, world was 1,000 million. In 1900 it was 1,600 million. In 1950 it was 2,500 million and in 1990 it was 5,300 million. In the future 2050 it will be 10,000 million and 2100 it will be 11,500 million. Developing countries increase very fast from 700 to 10,000 million, while developed countries stay small around 1,500 million.',
      report: {
        id: 'c1-t4-task1-rep',
        createdAt: '2026-10-31',
        source: 'sample',
        taskType: 'task1',
        question: 'World population growth 1800-2100',
        targetBand: 7.5,
        overallBand: 5.5,
        confidence: 'High',
        criteria: [
          { key: 'TR', name: 'Task Achievement', band: 5.5, comment: 'Recites years in isolation without calculating growth multiples.' },
          { key: 'CC', name: 'Coherence & Cohesion', band: 5.5, comment: 'Repetitive time clauses ("In 1800", "In 1900", "In 1950").' },
          { key: 'LR', name: 'Lexical Resource', band: 5.5, comment: 'Lacks demographic terms like "tenfold", "plateau", "divergence".' },
          { key: 'GRA', name: 'Grammatical Range', band: 5.5, comment: 'Simple sentences lacking complex subordinators.' }
        ],
        mainProblems: [
          { severity: 'Medium', title: 'Calculated Multiples', description: 'Show that global population grew fivefold between 1800 and 1990.' }
        ],
        learningOrder: ['task-response', 'academic-vocabulary'],
        teacherNote: 'Highlight the divergence where developing nations account for over 85% of total future growth.',
        teacherNoteSi: 'සංවර්ධනය වෙමින් පවතින රටවල ජනගහනය ශීඝ්‍රයෙන් ඉහළ යාම සහ දියුණු රටවල ස්ථාවර වීම සංසන්දනය කරන්න.',
        markedEssay: [
          t('The table gives population in the world from 1800 to 2100. In 1800, world was 1,000 million. In 1900 it was 1,600 million. In 1950 it was 2,500 million and in 1990 it was 5,300 million. In the future 2050 it will be 10,000 million and 2100 it will be 11,500 million. Developing countries increase very fast from 700 to 10,000 million, while developed countries stay small around 1,500 million.')
        ],
        issues: [],
        improvements: [
          { original: 'Developing countries increase very fast', better: 'Developing regions are projected to experience an exponential demographic surge, driving virtually all future global expansion', why: 'Demographic precision.' }
        ],
        band8Edits: [
          t('The table details the historical expansion of global population from 1800 to 1990, alongside demographic projections up to the year 2100, segmented between developed and developing regions.\n\nOverall, the global population experienced an unprecedented surge throughout the twentieth century, and this momentum is projected to continue before stabilizing late in the twenty-first century. Significantly, virtually the entirety of future demographic expansion is forecast to take place within developing nations.\n\nIn 1800, the world population stood at one billion, with developing regions accounting for 700 million and developed nations 300 million. Growth remained steady over the next century, reaching 1.6 billion by 1900. However, the subsequent nine decades witnessed an explosive acceleration: by 1990, global population had more than tripled to 5.3 billion, propelled by rapid growth in developing regions from 1.7 billion in 1950 to 4.1 billion in 1990.\n\nLooking ahead, global population is projected to peak around 11.5 billion by 2100. Developing nations will account for 10.2 billion of this total, representing a tenfold increase since 1800. In stark contrast, developed countries are anticipated to peak at approximately 1.4 billion before plateauing, resulting in a dramatic shift in global demographic equilibrium.')
        ],
        band8Overall: 8.5,
        band8Criteria: [
          { key: 'TR', band: 8.5 },
          { key: 'CC', band: 8.5 },
          { key: 'LR', band: 8.5 },
          { key: 'GRA', band: 8.5 }
        ],
        band8Notes: ['Authoritative demographic analysis capturing the divergence between developed and developing nations.']
      }
    },
    band8ModelAnswer: {
      text:
        'The table details the historical expansion of global population from 1800 to 1990, alongside demographic projections up to the year 2100, segmented between developed and developing regions.\n\nOverall, the global population experienced an unprecedented surge throughout the twentieth century, and this momentum is projected to continue before stabilizing late in the twenty-first century. Significantly, virtually the entirety of future demographic expansion is forecast to take place within developing nations.\n\nIn 1800, the world population stood at one billion, with developing regions accounting for 700 million and developed nations 300 million. Growth remained steady over the next century, reaching 1.6 billion by 1900. However, the subsequent nine decades witnessed an explosive acceleration: by 1990, global population had more than tripled to 5.3 billion, propelled by rapid growth in developing regions from 1.7 billion in 1950 to 4.1 billion in 1990.\n\nLooking ahead, global population is projected to peak around 11.5 billion by 2100. Developing nations will account for 10.2 billion of this total, representing a tenfold increase since 1800. In stark contrast, developed countries are anticipated to peak at approximately 1.4 billion before plateauing, resulting in a dramatic shift in global demographic equilibrium.',
      examinerComments: [
        'Comprehensive overview capturing both historical acceleration and future stabilization.',
        'High-calibre demographic vocabulary: "demographic equilibrium", "plateauing", "tenfold increase".',
        'Flawless structural grouping.'
      ]
    }
  },

  // -------------------------------------------------------------
  // TEST 4 TASK 2: Purpose of Higher Education (Vocational vs Pure Knowledge)
  // -------------------------------------------------------------
  {
    id: 'c1-t4-task2',
    cambridgeBook: 'Cambridge IELTS 1, Test 4',
    taskType: 'task2',
    category: 'Education',
    question:
      'In the modern world, the purpose of higher education is viewed in two contrasting ways: some believe universities should provide students with knowledge and skills for future careers, while others believe that the true function of a university is to give access to knowledge for its own sake, regardless of whether the course is useful to an employer.\n\nWhat, in your opinion, should be the main function of a university?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.',
    examinerInstructions: [
      'Examine both views: vocational professional preparation vs intellectual discovery for its own sake.',
      'State and defend your personal perspective with convincing arguments.',
      'Spend approximately 40 minutes.',
      'Write at least 250 words.'
    ],
    suggestedTimeMinutes: 40,
    minimumWords: 250,
    weakCandidateEssay: {
      band: 5.5,
      title: 'Practical Focus Ignoring Pure Academic Inquiry',
      text:
        'University is very expensive nowadays, so students need to get a good job after graduation. If a degree does not help you get money, it is a waste of time. Learning history or philosophy cannot help you buy food or pay rent. Therefore university should only teach business, engineering, and computer programming. In conclusion, the only function of university is career training.',
      report: {
        id: 'c1-t4-task2-rep',
        createdAt: '2026-10-31',
        source: 'sample',
        taskType: 'task2',
        question: 'Main function of a university: vocational vs pure knowledge',
        targetBand: 7.5,
        overallBand: 5.5,
        confidence: 'High',
        criteria: [
          { key: 'TR', name: 'Task Response', band: 5.5, comment: 'Dismisses academic inquiry and humanities without balanced evaluation.' },
          { key: 'CC', name: 'Coherence & Cohesion', band: 5.5, comment: 'Monolithic focus on utilitarian employment.' },
          { key: 'LR', name: 'Lexical Resource', band: 5.5, comment: 'Informal register ("get money", "waste of time").' },
          { key: 'GRA', name: 'Grammatical Range', band: 5.5, comment: 'Simple conditionals with restricted range.' }
        ],
        mainProblems: [
          { severity: 'High', title: 'Balanced Philosophy', description: 'Recognize that theoretical research and critical inquiry underpin technological progress.' }
        ],
        learningOrder: ['task-response', 'academic-vocabulary'],
        teacherNote: 'A high-scoring essay synthesizes vocational training with fundamental theoretical inquiry.',
        teacherNoteSi: 'වෘත්තීය නිපුණතා සහ න්‍යායික පර්යේෂණ යන දෙඅංශයේම වැදගත්කම සමබරව විග්‍රහ කරන්න.',
        markedEssay: [
          t('University is very expensive nowadays, so students need to get a good job after graduation. If a degree does not help you get money, it is a waste of time. Learning history or philosophy cannot help you buy food or pay rent. Therefore university should only teach business, engineering, and computer programming. In conclusion, the only function of university is career training.')
        ],
        issues: [],
        improvements: [
          { original: 'If a degree does not help you get money, it is a waste of time', better: 'A purely utilitarian focus overlooks how pure theoretical research catalyzes groundbreaking scientific breakthroughs', why: 'Intellectual depth.' }
        ],
        band8Edits: [
          t('The ongoing debate regarding the true objective of tertiary education reflects a fundamental tension between pragmatic utilitarianism and classical humanist ideals. While one school of thought contends that universities should operate primarily as professional training grounds for corporate employment, another insists that academia’s core mission is the pursuit of knowledge for its intrinsic intellectual value.\n\nAdvocates of vocational education argue that in an intensely competitive global economy, degrees must deliver tangible return on investment. With escalating tuition fees and graduate indebtedness, students naturally expect universities to equip them with marketable technical competencies in disciplines such as medicine, computer science, and engineering. From a macroeconomic perspective, governments require universities to generate a specialized workforce that stimulates productivity and technological innovation.\n\nHowever, reducing higher education to mere career apprenticeship endangers the broader societal purpose of academia. Throughout history, the most transformative human breakthroughs—from theoretical physics to democratic philosophy—arose from unfettered curiosity and basic research devoid of immediate commercial applications. Disciplines like literature, history, and philosophy foster critical thinking, ethical discernment, and cultural reflection, producing enlightened citizens capable of interrogating dogma.\n\nIn my view, the primary function of a university is not an either-or choice, but a dual responsibility. While institutions must ensure graduates possess the vocational agility required to secure employment, their crowning objective must remain cultivating independent critical inquiry and expanding the boundaries of human knowledge.')
        ],
        band8Overall: 8.5,
        band8Criteria: [
          { key: 'TR', band: 8.5 },
          { key: 'CC', band: 8.5 },
          { key: 'LR', band: 8.5 },
          { key: 'GRA', band: 8.5 }
        ],
        band8Notes: ['Exceptional academic synthesis balancing macroeconomic realism with classical humanist ideals.']
      }
    },
    band8ModelAnswer: {
      text:
        'The ongoing debate regarding the true objective of tertiary education reflects a fundamental tension between pragmatic utilitarianism and classical humanist ideals. While one school of thought contends that universities should operate primarily as professional training grounds for corporate employment, another insists that academia’s core mission is the pursuit of knowledge for its intrinsic intellectual value.\n\nAdvocates of vocational education argue that in an intensely competitive global economy, degrees must deliver tangible return on investment. With escalating tuition fees and graduate indebtedness, students naturally expect universities to equip them with marketable technical competencies in disciplines such as medicine, computer science, and engineering. From a macroeconomic perspective, governments require universities to generate a specialized workforce that stimulates productivity and technological innovation.\n\nHowever, reducing higher education to mere career apprenticeship endangers the broader societal purpose of academia. Throughout history, the most transformative human breakthroughs—from theoretical physics to democratic philosophy—arose from unfettered curiosity and basic research devoid of immediate commercial applications. Disciplines like literature, history, and philosophy foster critical thinking, ethical discernment, and cultural reflection, producing enlightened citizens capable of interrogating dogma.\n\nIn my view, the primary function of a university is not an either-or choice, but a dual responsibility. While institutions must ensure graduates possess the vocational agility required to secure employment, their crowning objective must remain cultivating independent critical inquiry and expanding the boundaries of human knowledge.',
      examinerComments: [
        'Band 9 academic depth: "pragmatic utilitarianism", "classical humanist ideals", "unfettered curiosity".',
        'Direct resolution of prompt with sophisticated philosophical balance.',
        'Impeccable paragraph transitions and lexical range.'
      ]
    }
  },

  // -------------------------------------------------------------
  // GENERAL TRAINING TASK 1: Bank Overdraft Dispute (OFFICIAL MODEL)
  // -------------------------------------------------------------
  {
    id: 'c1-gt-task1',
    cambridgeBook: 'Cambridge IELTS 1, General Training',
    taskType: 'task1',
    category: 'Society',
    question:
      'You have received a letter from your bank stating that you are overdrawn and will be charged an overdraft fee. However, this is because the bank made an error by continuing to pay a direct debit for a car you already sold.\n\nWrite a letter to the bank manager explaining the situation and asking them to correct the mistake.\n\nWrite at least 150 words.',
    examinerInstructions: [
      'Write in a formal letter format.',
      'Explain the background of the car sale and previous written instruction to cancel the direct debit.',
      'Request the return of funds from the garage and the reversal of overdraft penalties.',
      'Spend approximately 20 minutes.',
      'Write at least 150 words.'
    ],
    suggestedTimeMinutes: 20,
    minimumWords: 150,
    weakCandidateEssay: {
      band: 5.5,
      title: 'Informal Complaint Letter',
      text:
        'Dear Bank Manager,\nI got your letter saying my account is overdrawn and I have to pay fees. I am very angry because this is not my fault. I sold my car two months ago and told you to stop paying the money. You sent me letter saying you will stop it, but you still paid 300 dollars this month! Please give me my money back and don’t charge me any fee.\nYours,\nP Stoft',
      report: {
        id: 'c1-gt-task1-rep',
        createdAt: '2026-10-31',
        source: 'sample',
        taskType: 'task1',
        question: 'Letter to bank regarding direct debit error',
        targetBand: 8.0,
        overallBand: 5.5,
        confidence: 'High',
        criteria: [
          { key: 'TR', name: 'Task Achievement', band: 5.5, comment: 'Mentions basic facts but lacks professional formal clarity and requested actions.' },
          { key: 'CC', name: 'Coherence & Cohesion', band: 5.5, comment: 'Short emotional outbursts without formal sequencing.' },
          { key: 'LR', name: 'Lexical Resource', band: 5.5, comment: 'Informal diction ("I got your letter", "very angry").' },
          { key: 'GRA', name: 'Grammatical Range', band: 5.5, comment: 'Limited complex formal sentence structures.' }
        ],
        mainProblems: [
          { severity: 'Medium', title: 'Formal Business Letter Register', description: 'Maintain polite but firm professional phrasing.' }
        ],
        learningOrder: ['academic-vocabulary', 'sentence-structure'],
        teacherNote: 'Official Cambridge Band 8 Model Answer on lines 5104-5120 demonstrates perfect business correspondence.',
        teacherNoteSi: 'බැංකු කළමනාකරු වෙත යවන නිල ලිපියක තිබිය යුතු ගෞරවනීය හා නිරවුල් භාෂා ශෛලිය යොදාගන්න.',
        markedEssay: [
          t('Dear Bank Manager,\nI got your letter saying my account is overdrawn and I have to pay fees. I am very angry because this is not my fault. I sold my car two months ago and told you to stop paying the money. You sent me letter saying you will stop it, but you still paid 300 dollars this month! Please give me my money back and don’t charge me any fee.\nYours,\nP Stoft')
        ],
        issues: [],
        improvements: [
          { original: 'I got your letter saying my account is overdrawn', better: 'I am writing in response to your letter dated 15th October concerning the overdrawn balance on my account', why: 'Formal correspondence standard.' }
        ],
        band8Edits: [
          t('Dear Sir or Madam,\n\nI am writing in response to your letter of 15th October stating that my current account is overdrawn and notifying me that an overdraft charge has been debited. I would like to clarify that this situation has arisen entirely as a result of an administrative error on the part of your bank.\n\nIf you inspect your records, you will see that I wrote to your branch several weeks ago explaining the situation. For the past twelve months, I had been paying $300 per month via standing order for a car purchased last summer. However, two months ago I sold the vehicle and instructed the bank in writing to terminate the monthly instalments immediately. I subsequently received formal acknowledgement of my instruction, yet despite this, a further $300 was erroneously deducted this month, occasioning the overdraft.\n\nI request that you immediately reverse the unauthorized debit and waive all associated overdraft penalties. Furthermore, I would appreciate your contacting the garage in question to explain your error and recover the funds.\n\nYours faithfully,\nP. Stoft')
        ],
        band8Overall: 8.5,
        band8Criteria: [
          { key: 'TR', band: 8.5 },
          { key: 'CC', band: 8.5 },
          { key: 'LR', band: 8.5 },
          { key: 'GRA', band: 8.5 }
        ],
        band8Notes: ['Verbatim Cambridge Official Band 8 Model Answer from Jakeman & McDowell (1997).']
      }
    },
    band8ModelAnswer: {
      text:
        'Dear Sir or Madam,\n\nI am writing in response to your letter of 15th October stating that my current account is overdrawn and notifying me that an overdraft charge has been debited. I would like to clarify that this situation has arisen entirely as a result of an administrative error on the part of your bank.\n\nIf you inspect your records, you will see that I wrote to your branch several weeks ago explaining the situation. For the past twelve months, I had been paying $300 per month via standing order for a car purchased last summer. However, two months ago I sold the vehicle and instructed the bank in writing to terminate the monthly instalments immediately. I subsequently received formal acknowledgement of my instruction, yet despite this, a further $300 was erroneously deducted this month, occasioning the overdraft.\n\nI request that you immediately reverse the unauthorized debit and waive all associated overdraft penalties. Furthermore, I would appreciate your contacting the garage in question to explain your error and recover the funds.\n\nYours faithfully,\nP. Stoft',
      examinerComments: [
        'Official Cambridge IELTS 1 Model Answer (lines 5104-5120).',
        'Impeccable formal business tone with precise factual explanation.',
        'Clear, polite requests for rectification.'
      ]
    }
  },

  // -------------------------------------------------------------
  // GENERAL TRAINING TASK 2: Dependency on Computers (OFFICIAL MODEL)
  // -------------------------------------------------------------
  {
    id: 'c1-gt-task2',
    cambridgeBook: 'Cambridge IELTS 1, General Training',
    taskType: 'task2',
    category: 'Technology',
    question:
      'We are becoming increasingly dependent on computers. They are used in businesses, hospitals, crime detection and even to fly planes. What things will they be used for in the future? Is this dependence on computers a good thing or should we be more suspicious of their benefits?\n\nWrite at least 250 words.',
    examinerInstructions: [
      'Address both questions: future technological applications and positive vs cautionary evaluation of reliance on computers.',
      'Support views with concrete examples and balanced reasoning.',
      'Spend approximately 40 minutes.',
      'Write at least 250 words.'
    ],
    suggestedTimeMinutes: 40,
    minimumWords: 250,
    weakCandidateEssay: {
      band: 5.5,
      title: 'Simple Everyday Observations',
      text:
        'Computers are used in many places today like shops and schools. In the future computers will do everything for humans like cooking food, driving cars and cleaning houses. I think computers are good because they are fast and do not get tired. But if computer breaks down, people cannot do their work. So we should not depend on them completely.',
      report: {
        id: 'c1-gt-task2-rep',
        createdAt: '2026-10-31',
        source: 'sample',
        taskType: 'task2',
        question: 'Future uses and dependency on computers',
        targetBand: 8.0,
        overallBand: 5.5,
        confidence: 'High',
        criteria: [
          { key: 'TR', name: 'Task Response', band: 5.5, comment: 'Simplistic examples of future uses without exploring systemic vulnerability.' },
          { key: 'CC', name: 'Coherence & Cohesion', band: 5.5, comment: 'Short simple clauses with repetitive connectors.' },
          { key: 'LR', name: 'Lexical Resource', band: 5.5, comment: 'Basic vocabulary: "do everything", "breaks down".' },
          { key: 'GRA', name: 'Grammatical Range', band: 5.5, comment: 'Simple present tense without modal conditionality.' }
        ],
        mainProblems: [
          { severity: 'Medium', title: 'Systemic Risk Analysis', description: 'Examine vulnerability of critical national infrastructure to technological failure.' }
        ],
        learningOrder: ['task-response', 'academic-vocabulary'],
        teacherNote: 'The official Cambridge model highlights systemic reliance and the catastrophic vulnerability of software failure.',
        teacherNoteSi: 'පරිගණක මත පූර්ණ ලෙස යැපීමේදී ඇතිවිය හැකි අවදානම් පිළිබඳව විග්‍රහ කරන්න.',
        markedEssay: [
          t('Computers are used in many places today like shops and schools. In the future computers will do everything for humans like cooking food, driving cars and cleaning houses. I think computers are good because they are fast and do not get tired. But if computer breaks down, people cannot do their work. So we should not depend on them completely.')
        ],
        issues: [],
        improvements: [
          { original: 'if computer breaks down, people cannot do their work', better: 'You have only got to go into a bank when their main computer is broken to appreciate the chaos that would occur if systems fail', why: 'Real-world illustrative power.' }
        ],
        band8Edits: [
          t('Computers are a relatively new invention. The first computers were built fifty years ago and it is only in the last thirty or so years that their influence has affected our everyday life. Personal computers were introduced as recently as the early eighties. In this short time they have made a tremendous impact on our lives. We are now so dependent on computers that it is hard to imagine what things would be like today without them. You have only got to go into a bank when their main computer is broken to appreciate the chaos that would occur if computers were suddenly removed worldwide.\n\nIn the future, computers will be used to create bigger and even more sophisticated machines. The prospects for this are quite alarming. They will be so complex that no individual could hope to understand how they work. They will bring a lot of benefits, but they will also increase the potential for unimaginable chaos. They will, for example, be able to fly planes and coordinate the movements of several aircraft in the vicinity of an airport. Providing all the computers are working correctly, nothing can go wrong. If one small program fails—disaster.\n\nThere is a certain inevitability that technology will progress and become increasingly complex. We should, however, ensure that we are still in a position where we are able to control technology. It will be all too easy to suddenly discover that technology is controlling us. By then it might be too late. I believe that it is very important to be suspicious of the benefits that computers will bring and to make sure that we never become totally dependent on a completely technological world.')
        ],
        band8Overall: 8.5,
        band8Criteria: [
          { key: 'TR', band: 8.5 },
          { key: 'CC', band: 8.5 },
          { key: 'LR', band: 8.5 },
          { key: 'GRA', band: 8.5 }
        ],
        band8Notes: ['Verbatim Cambridge Official Band 8 Model Answer from Jakeman & McDowell (1997).']
      }
    },
    band8ModelAnswer: {
      text:
        'Computers are a relatively new invention. The first computers were built fifty years ago and it is only in the last thirty or so years that their influence has affected our everyday life. Personal computers were introduced as recently as the early eighties. In this short time they have made a tremendous impact on our lives. We are now so dependent on computers that it is hard to imagine what things would be like today without them. You have only got to go into a bank when their main computer is broken to appreciate the chaos that would occur if computers were suddenly removed worldwide.\n\nIn the future, computers will be used to create bigger and even more sophisticated machines. The prospects for this are quite alarming. They will be so complex that no individual could hope to understand how they work. They will bring a lot of benefits, but they will also increase the potential for unimaginable chaos. They will, for example, be able to fly planes and coordinate the movements of several aircraft in the vicinity of an airport. Providing all the computers are working correctly, nothing can go wrong. If one small program fails—disaster.\n\nThere is a certain inevitability that technology will progress and become increasingly complex. We should, however, ensure that we are still in a position where we are able to control technology. It will be all too easy to suddenly discover that technology is controlling us. By then it might be too late. I believe that it is very important to be suspicious of the benefits that computers will bring and to make sure that we never become totally dependent on a completely technological world.',
      examinerComments: [
        'Official Cambridge IELTS 1 Model Answer (lines 5123-5136).',
        'Brilliantly captures both the transformative power and catastrophic vulnerability of automation.',
        'Eloquent, balanced conclusion.'
      ]
    }
  }
];
