import type {
  SpeakingCriterionKey,
  SpeakingCriterionScore,
  SpeakingEvaluationReport,
  SpeakingTopic,
  FluencyMetrics,
  SpeakingUpgradeDetailItem,
} from '../types/speakingTutor';
import type { EssaySegment, MainProblem, TutorIssue } from '../types/tutor';
import { roundIeltsBand, formatBand } from './tutorEngine';
import { playSpeech, stopSpeech } from './speech';

/* ------------------------------------------------------------------ */
/* Random Spontaneous Conversation Topics                              */
/* ------------------------------------------------------------------ */

export const RANDOM_SPEAKING_TOPICS: SpeakingTopic[] = [
  {
    id: 'rnd-daily-routine',
    part: 1,
    topic: 'Daily Routines & Time Management',
    category: 'Lifestyle',
    introAudioText:
      "Hello! Welcome to our IELTS Speaking session. I'll be your examiner today. Let's start with your daily routine. Could you describe what a typical morning looks like for you?",
    questions: [
      'Could you describe what a typical morning looks like for you?',
      'Do you prefer to wake up early or do you stay up late at night?',
      'How do you manage your time when you have a busy schedule?',
      'If you could change one thing about your daily routine, what would it be?'
    ],
    sampleBand8Answer:
      "On weekdays, my morning typically begins around six o'clock. The first thing I do is indulge in a brisk thirty-minute jog, which kickstarts my metabolism and clears my head. After a revitalizing shower, I prepare a nutritious breakfast while glancing through international news updates. I find that establishing this disciplined rhythm sets a productive, positive tone for the entire day ahead.",
    examinerTips: [
      'Use sequencing discourse markers: "To kick things off", "Subsequently", "In the aftermath of".',
      'Showcase high-level phrasal verbs & collocations: "kickstart my metabolism", "clears my head", "disciplined rhythm".',
      'Keep answers between 3 to 4 well-developed complex sentences.'
    ]
  },
  {
    id: 'rnd-technology-ai',
    part: 3,
    topic: 'Artificial Intelligence & Future of Work',
    category: 'Technology',
    introAudioText:
      "Good day! Today, let's explore technological disruption and artificial intelligence. In your opinion, how is AI reshaping modern careers?",
    questions: [
      'In your opinion, how is artificial intelligence reshaping modern career paths?',
      'Do you believe automated machines could completely replace human teachers in the future?',
      'What ethical concerns arise when organizations rely heavily on algorithms to make decisions?',
      'How can educational institutions adapt to prepare students for an AI-driven economy?'
    ],
    sampleBand8Answer:
      "From my perspective, artificial intelligence is serving as a catalyst for seismic changes across virtually every industrial sector. Rather than merely eliminating blue-collar jobs, it is increasingly automating repetitive cognitive tasks. Consequently, professionals must cultivate uniquely human competencies, such as critical reasoning, emotional intelligence, and interdisciplinary creativity, which machines cannot readily replicate.",
    examinerTips: [
      'Avoid simplistic adjectives like "good" or "bad"; employ "catalyst for seismic changes", "cognitive tasks".',
      'Demonstrate concession structures: "While automation streamlines productivity, it inevitably poses ethical dilemmas."',
      'Project an authoritative, analytical stance appropriate for Band 8+ in Part 3.'
    ]
  },
  {
    id: 'rnd-travel-culture',
    part: 1,
    topic: 'Travel & Cross-Cultural Experiences',
    category: 'Travel & Culture',
    introAudioText:
      "Welcome! Today, let's discuss travel and exploring unfamiliar cultures. Do you enjoy traveling to remote destinations or bustling metropolitan cities?",
    questions: [
      'Do you prefer traveling to remote destinations or bustling metropolitan cities?',
      'What was the most memorable trip you have ever taken, and why?',
      'How does traveling overseas broaden an individual\'s worldview?',
      'What are some common travel mishaps people experience, and how can they be avoided?'
    ],
    sampleBand8Answer:
      "Without hesitation, I am drawn to secluded, off-the-beaten-track destinations rather than hyper-commercialized tourist hubs. A few years ago, I trekked through the Knuckles Mountain Range in central Sri Lanka. Being immersed in pristine biodiversity and interacting with humble agrarian communities was profoundly humbling. It truly opened my eyes to alternative ways of living in harmony with nature.",
    examinerTips: [
      'Use evocative sensory phrases: "off-the-beaten-track", "pristine biodiversity", "profoundly humbling".',
      'Use past continuous and past perfect structures for storytelling: "While I was trekking...", "I had never witnessed...".',
      'Maintain natural intonation and cadence without memorized monotone phrasing.'
    ]
  },
  {
    id: 'rnd-food-culinary',
    part: 1,
    topic: 'Food, Gastronomy & Dining Traditions',
    category: 'Food & Nutrition',
    introAudioText:
      "Hello! It's a pleasure to speak with you today. Let's talk about food and dining. Do you prefer home-cooked meals or dining out in restaurants?",
    questions: [
      'Do you prefer savoring home-cooked meals or dining out at gourmet restaurants?',
      'What is a traditional dish from your culture that you take pride in preparing?',
      'How have dining habits among young people changed in recent decades?',
      'Do you consider cooking to be an essential life skill that schools should teach?'
    ],
    sampleBand8Answer:
      "While dining out undoubtedly offers convenience and culinary novelty, I have a deep penchant for wholesome home-cooked meals. Preparing dishes from scratch allows me to meticulously monitor nutritional balance and experiment with aromatic spices like turmeric, cardamom, and roasted chili. There is also an undeniable sense of accomplishment in sharing a freshly cooked meal with loved ones.",
    examinerTips: [
      'Incorporate sensory culinary vocabulary: "aromatic spices", "nutritional balance", "culinary novelty".',
      'Deploy balance markers: "While X undoubtedly offers..., I have a strong preference for Y".',
      'Vary stress and rhythm to emphasize adjectives like "wholesome", "undeniable", "meticulously".'
    ]
  },
  {
    id: 'rnd-environment-sustainability',
    part: 3,
    topic: 'Environmental Preservation & Sustainability',
    category: 'Environment',
    introAudioText:
      "Good day! Today let's tackle one of the most pressing global challenges: environmental preservation. Who bears greater responsibility for combating climate change—individuals or national governments?",
    questions: [
      'Who bears greater responsibility for combating climate change—individual citizens or national governments?',
      'How effective are single-use plastic bans in reducing marine pollution?',
      'Do you think environmental education in primary schools can foster genuine long-term eco-consciousness?',
      'What renewable energy source holds the greatest promise for sustainable development?'
    ],
    sampleBand8Answer:
      "In my estimation, while individual conscientiousness regarding recycling and energy conservation is commendable, the lion's share of responsibility rests squarely on national governments and multinational corporations. Systemic decarbonization requires aggressive legislative policies, heavy subsidies for renewable energy infrastructure, and strict carbon taxation. Individual choices alone cannot counteract unchecked industrial emissions.",
    examinerTips: [
      'Use idiomatic academic phrases: "the lion\'s share of responsibility", "rests squarely on", "unchecked industrial emissions".',
      'Support opinions with macroeconomic reasoning: "subsidies for renewable infrastructure", "carbon taxation".',
      'Use smooth pauses for emphasis before key arguments.'
    ]
  },
  {
    id: 'rnd-cuecard-achievement',
    part: 2,
    topic: 'Describe a significant personal goal you successfully achieved',
    category: 'Personal Development',
    introAudioText:
      "Now we move to Part 2. I am going to give you a topic card. You will have one minute to prepare your notes, and then you should speak for one to two minutes.",
    questions: [
      'You have 1 minute to prepare notes, then speak for 1 to 2 minutes.'
    ],
    cueCardPoints: [
      'What the goal was and when you set it',
      'What obstacles or setbacks you encountered along the way',
      'How you overcame these difficulties',
      'And explain why achieving this milestone felt so rewarding.'
    ],
    sampleBand8Answer:
      "I would like to recount the arduous journey of completing a half-marathon last November. Having led a predominantly sedentary lifestyle during the lockdown, my cardiovascular stamina had deteriorated significantly. Setting this ambitious target was essentially a commitment to reclaiming my physical vitality.\n\nThe preparation process was far from plain sailing. Around mid-way through my twelve-week training regimen, I suffered excruciating shin splints that threatened to derail my aspirations altogether. Instead of throwing in the towel, I sought professional physiotherapy, restructured my footwear, and embraced low-impact cross-training like swimming to maintain endurance.\n\nCrossing that finish line was an indescribably euphoric sensation. It wasn't merely about the finisher's medal; it was definitive proof that steadfast discipline and resilience can overcome debilitating self-doubt.",
    examinerTips: [
      'Structure your 2 minutes chronologically: Initial motivation → The hurdle → The turning point → Psychological reflection.',
      'Incorporate vivid idioms naturally: "far from plain sailing", "throwing in the towel", "crossing the finish line".',
      'Vary pitch to emphasize the emotional turning point.'
    ]
  },
  {
    id: 'rnd-music-creative',
    part: 1,
    topic: 'Music, Soundtracks & Mood Regulation',
    category: 'Arts & Culture',
    introAudioText:
      "Hello! Let's talk about music and creative expression. What genre of music do you typically listen to when you want to unwind?",
    questions: [
      'What genre of music do you typically listen to when you want to unwind?',
      'Do you prefer attending live music concerts or listening through headphones in solitude?',
      'Did you learn to play any musical instruments during your childhood?',
      'Do you believe music education should be compulsory in all schools?'
    ],
    sampleBand8Answer:
      "Whenever I need to decompress after an exhausting day, I naturally gravitate toward acoustic folk or instrumental ambient melodies. There is something profoundly therapeutic about intricate acoustic guitar fingerpicking paired with gentle harmonies. It serves as an acoustic sanctuary, effectively filtering out urban noise and restoring my mental equilibrium.",
    examinerTips: [
      'Use evocative sensory metaphors: "acoustic sanctuary", "restoring mental equilibrium", "profoundly therapeutic".',
      'Use natural spoken connectors: "Whenever I need to...", "There is something inherently...".'
    ]
  },
  {
    id: 'rnd-sports-fitness',
    part: 1,
    topic: 'Sports, Athletics & Well-being',
    category: 'Health & Fitness',
    introAudioText:
      "Welcome! Today, let's discuss sports, outdoor recreation, and physical fitness. What physical activities do you engage in to stay active?",
    questions: [
      'What physical activities do you engage in on a regular basis to maintain fitness?',
      'Did you participate in team sports when you were attending school?',
      'Why do you think extreme sports like skydiving or rock climbing have gained immense popularity?',
      'Should professional athletes receive exceptionally high salaries compared to medical doctors?'
    ],
    sampleBand8Answer:
      "To keep myself in decent physical shape, I try to balance moderate calisthenics with high-intensity interval training three to four mornings a week. Growing up, I was an avid cricket player, which taught me the invaluable virtues of teamwork, tactical anticipation, and grace under pressure. Engaging in regular physical exertion not only elevates my energy levels but also drastically mitigates work-related stress.",
    examinerTips: [
      'Incorporate fitness terminology: "moderate calisthenics", "high-intensity interval training", "mitigates stress".',
      'Collocate naturally: "invaluable virtues", "grace under pressure", "tactical anticipation".'
    ]
  }
];

/* ------------------------------------------------------------------ */
/* Spoken Band 8 Upgrades & Idioms Knowledge Base                     */
/* ------------------------------------------------------------------ */

export const SPOKEN_BAND8_UPGRADES: Record<string, {
  upgraded: string;
  criterion: SpeakingCriterionKey;
  critique: string;
  critiqueSi?: string;
  value: string;
  valueSi?: string;
}> = {
  // Spoken Discourse Markers (FC & LR)
  'i think': {
    upgraded: 'from my vantage point,',
    criterion: 'FC',
    critique: '"I think" is repeated constantly by Band 5–6 candidates. Examiners look for varied discourse markers.',
    critiqueSi: '"I think" නිතර කීම සරල කථන රටාවකි. ඒ වෙනුවට "from my vantage point" යොදන්න.',
    value: 'Injects sophisticated discourse opener (+FC Band 8), establishing candidate fluency and viewpoint.',
    valueSi: 'කථන චතුරතාව සහ පැහැදිලි ආස්ථානයක් පෙන්වයි.'
  },
  'i believe': {
    upgraded: 'I am firmly convinced that',
    criterion: 'FC',
    critique: 'Standard conversational phrase that can be upgraded with modal conviction.',
    critiqueSi: 'සාමාන්‍ය විශ්වාසය පළ කිරීම වෙනුවට ස්ථිර ස්ථාවරයක් පෙන්වන යෙදුමකි.',
    value: 'Demonstrates persuasive speaking register (+FC & LR).',
    valueSi: 'ස්ථිර අදහස් දැක්වීමක් සඳහා කථන ලකුණු නංවයි.'
  },
  'in my opinion': {
    upgraded: 'in my humble estimation,',
    criterion: 'FC',
    critique: '"In my opinion" is an overused cliché in IELTS speaking.',
    critiqueSi: '"In my opinion" යනු බහුලව භාවිත වන සරල යෙදුමකි.',
    value: 'Demonstrates conversational modesty and stylistic flair (+FC).',
    valueSi: 'වඩාත් පරිණත කථන ආරම්භයක් ලබා දෙයි.'
  },
  'because': {
    upgraded: 'chiefly owing to the fact that',
    criterion: 'GRA',
    critique: 'Frequent short "because" conjunctions produce choppy, staccato sentence structures.',
    critiqueSi: '"because" නිතර යෙදීමෙන් වාක්‍ය කෙටි හා සරල වේ.',
    value: 'Constructs an extended subordinate causal clause (+GRA Band 8).',
    valueSi: 'සංකීර්ණ හේතු වාක්‍ය ඛණ්ඩයක් ගොඩනගයි.'
  },
  'and also': {
    upgraded: 'furthermore, it is worth highlighting that',
    criterion: 'FC',
    critique: '"and also" is an informal spoken linking habit.',
    critiqueSi: '"and also" යනු සරල කතාබහේදී යොදන සන්ධි පදයකි.',
    value: 'Smoothly connects secondary points with cohesive academic weight (+FC).',
    valueSi: 'කථනය අතර සුමට සබඳතාවක් තහවුරු කරයි.'
  },
  'but': {
    upgraded: 'having said that, however,',
    criterion: 'FC',
    critique: 'Repeated simple "but" breaks the rhythmic flow of spoken discourse.',
    critiqueSi: '"but" නිතර යෙදීම කථන රටාවේ රිද්මය බිඳ දමයි.',
    value: 'Introduces a nuanced contrastive concession marker (+FC).',
    valueSi: 'විරුද්ධ අදහස් ඉදිරිපත් කිරීමේදී ඉහළ ලකුණු ලබා දෙන සංක්‍රාන්ති යෙදුමකි.'
  },

  // Vocabulary & Spoken Idiomatic Collocations (LR)
  'very good': {
    upgraded: 'thoroughly rewarding',
    criterion: 'LR',
    critique: '"very good" is an elementary intensifier combination below Band 7.',
    critiqueSi: '"very good" යනු සරල ඉංග්‍රීසි යෙදුමකි.',
    value: 'Upgrades to idiomatic affective adjective (+LR Band 8).',
    valueSi: 'ශ්‍රාවකයා ආකර්ෂණය කරගන්නා උසස් නාමවිශේෂණයක් භාවිත කරයි.'
  },
  'good': {
    upgraded: 'exceptionally beneficial',
    criterion: 'LR',
    critique: 'Generic adjective that demonstrates zero lexical range.',
    critiqueSi: 'වඩාත් නිශ්චිත අර්ථයක් නොදෙන සරල වචනයකි.',
    value: 'Specifies positive utility with Band 8 academic collocation (+LR).',
    valueSi: 'LR ලකුණු ඉහළ නංවන ප්‍රබල වචනයකි.'
  },
  'a lot of': {
    upgraded: 'an extensive array of',
    criterion: 'LR',
    critique: '"a lot of" is overused spoken vernacular.',
    critiqueSi: '"a lot of" යනු සරල කතාබහේදී නිතර කියවෙන යෙදුමකි.',
    value: 'Replaces colloquial quantifier with sophisticated lexical chunk (+LR).',
    valueSi: 'බහුවිධභාවය ප්‍රකාශ කිරීමට උසස් යෙදුමකි.'
  },
  'many': {
    upgraded: 'a plethora of',
    criterion: 'LR',
    critique: 'Basic quantifier that limits lexical scoring.',
    critiqueSi: 'සරල ප්‍රමාණ පදයකි.',
    value: 'Showcases rich idiomatic vocabulary (+LR Band 8.5).',
    valueSi: 'කථන පරාසය පුළුල් කරන ඉහළ ලකුණු හිමිවන යෙදුමකි.'
  },
  'like to': {
    upgraded: 'have an immense penchant for',
    criterion: 'LR',
    critique: '"I like to" is kindergarten-level phrasing in IELTS Speaking.',
    critiqueSi: '"I like to" යනු ප්‍රාථමික මට්ටමේ යෙදුමකි.',
    value: 'Demonstrates native-like mastery of inclination verbs (+LR).',
    valueSi: 'කැමැත්ත ප්‍රකාශ කිරීමේදී උසස් විලාසයක් පෙන්වයි.'
  },
  'bad': {
    upgraded: 'decidedly detrimental',
    criterion: 'LR',
    critique: 'Vague, low-level evaluation word.',
    critiqueSi: 'අවම ලකුණු මට්ටමේ සරල වචනයකි.',
    value: 'Injects targeted academic evaluation (+LR Band 8).',
    valueSi: 'අහිතකර බලපෑම විධිමත් ලෙස විස්තර කරයි.'
  },
  'big problem': {
    upgraded: 'pressing conundrum',
    criterion: 'LR',
    critique: '"big problem" lacks nuance and descriptive depth.',
    critiqueSi: '"big problem" යනු නොගැඹුරු සරල යෙදුමකි.',
    value: 'Upgrades to idiomatic noun phrase (+LR).',
    valueSi: 'ගැටලුවේ බරපතලකම මනාව ප්‍රකාශ කරයි.'
  },
  'hard': {
    upgraded: 'exceedingly demanding',
    criterion: 'LR',
    critique: '"hard" is overly plain and colloquial.',
    critiqueSi: 'සරල කතාබස් වචනයකි.',
    value: 'Showcases advanced modifier + adjective pairing (+LR).',
    valueSi: 'දුෂ්කරතාව විස්තර කිරීමේදී LR ලකුණු නංවයි.'
  },
  'every day': {
    upgraded: 'on a day-to-day basis',
    criterion: 'LR',
    critique: 'Direct repetition of basic temporal phrase.',
    critiqueSi: 'නිතර භාවිත වන සරල කාල ප්‍රකාශනයකි.',
    value: 'Transforms phrase into a fluid idiomatic adverbial (+LR & FC).',
    valueSi: 'දෛනික ක්‍රියාවලිය චතුර ලෙස ඉදිරිපත් කරයි.'
  },
  'in my country': {
    upgraded: 'across my native land,',
    criterion: 'LR',
    critique: 'Predictable and repetitive phrase used by almost all international candidates.',
    critiqueSi: 'සියලුම සිසුන් නිතරම කියන පුරුදු යෙදුමකි.',
    value: 'Provides elegant, authentic geographic contextualization (+LR).',
    valueSi: 'මව්බිම පිළිබඳ අභිමානය සහ චතුර බව පෙන්වයි.'
  },
  'relax': {
    upgraded: 'decompress and recharge',
    criterion: 'LR',
    critique: 'Monosyllabic common verb without sensory or mental imagery.',
    critiqueSi: 'සරල ක්‍රියාපදයකි.',
    value: 'Uses dual-action collocation reflecting modern idiomatic speech (+LR).',
    valueSi: 'විවේකය සහ මානසික සුවය විචිත්‍රවත් ලෙස විස්තර කරයි.'
  },
  'really': {
    upgraded: 'profoundly',
    criterion: 'LR',
    critique: '"really" is an informal conversational crutch.',
    critiqueSi: '"really" යනු පුරුද්දට කියවෙන සරල වචනයකි.',
    value: 'Upgrades to expressive Band 8 emotional adverb (+LR).',
    valueSi: 'අවධාරණය උසස් මට්ටමකින් සිදු කරයි.'
  },
  'very interesting': {
    upgraded: 'utterly captivating',
    criterion: 'LR',
    critique: 'Standard weak adjective pairing.',
    critiqueSi: 'දුර්වල නාමවිශේෂණ එකතුවකි.',
    value: 'Replaces weak modifier with non-gradable dramatic adjective (+LR).',
    valueSi: 'උද්යෝගය මනාව ප්‍රකාශ කරන ආකර්ෂණීය යෙදුමකි.'
  },
  'i want to': {
    upgraded: 'I genuinely aspire to',
    criterion: 'GRA',
    critique: '"want to" reflects simple present intention without ambition.',
    critiqueSi: '"want to" යනු ඉතා සරල අභිලාෂයකි.',
    value: 'Demonstrates higher register modal verb with intentional depth (+GRA & LR).',
    valueSi: 'අනාගත බලාපොරොත්තුව ශාස්ත්‍රීය ලෙස ඉදිරිපත් කරයි.'
  },
  'i like': {
    upgraded: 'I have a profound fondness for',
    criterion: 'LR',
    critique: 'Repetitive elementary preference verb.',
    critiqueSi: 'නිතර කියවෙන මූලික ක්‍රියාපදයකි.',
    value: 'Demonstrates rich emotional noun collocation (+LR Band 8).',
    valueSi: 'කැමැත්ත ප්‍රකාශ කිරීමේ උසස් වාග්කෝෂයකි.'
  },
  'a lot': {
    upgraded: 'substantially',
    criterion: 'LR',
    critique: 'Slangy colloquial degree adverb.',
    critiqueSi: 'සරල කතාබස් වචනයකි.',
    value: 'Elevates degree modification to formal spoken register (+LR).',
    valueSi: 'ප්‍රමාණය විධිමත් ලෙස දක්වයි.'
  },
  'important': {
    upgraded: 'of paramount significance',
    criterion: 'LR',
    critique: 'Generic descriptor that misses an opportunity for a prepositional phrase.',
    critiqueSi: 'නිතර යෙදෙන සරල වචනයකි.',
    value: 'Converts simple adjective into prestige prepositional phrase (+LR & GRA).',
    valueSi: 'වැදගත්කම ඉහළින්ම අවධාරණය කරයි.'
  },
  'help': {
    upgraded: 'facilitate and foster',
    criterion: 'LR',
    critique: 'Basic action verb with limited range.',
    critiqueSi: 'සරල ක්‍රියාපදයකි.',
    value: 'Combines dual enabling verbs for Band 8 Lexical Resource.',
    valueSi: 'උපකාරය සහ වර්ධනය එකවර ප්‍රකාශ කරයි.'
  },
  'people': {
    upgraded: 'individuals from all walks of life',
    criterion: 'LR',
    critique: 'Over-generalized bare noun.',
    critiqueSi: 'සාමාන්‍ය නාම පදයකි.',
    value: 'Expands into inclusive idiomatic demographic phrase (+LR & FC).',
    valueSi: 'සමාජයේ සෑම තරාතිරමකම ජනතාව ආවරණය කරන උසස් යෙදුමකි.'
  },
  'learn': {
    upgraded: 'acquire invaluable insights into',
    criterion: 'LR',
    critique: 'Flat cognitive verb.',
    critiqueSi: 'සරල ඉගෙනුම් ක්‍රියාපදයකි.',
    value: 'Demonstrates academic collocation for intellectual acquisition (+LR).',
    valueSi: 'දැනුම ලබා ගැනීම ගැඹුරින් විස්තර කරයි.'
  },
  'free time': {
    upgraded: 'cherished leisure hours',
    criterion: 'LR',
    critique: 'Basic compound noun.',
    critiqueSi: 'සාමාන්‍ය නිදහස් වේලාව යන්නයි.',
    value: 'Adds evocative descriptive adjective and professional noun (+LR).',
    valueSi: 'විවේක කාලයේ වටිනාකම මනාව දක්වයි.'
  },
  'make me happy': {
    upgraded: 'bring me immense contentment',
    criterion: 'LR',
    critique: 'Juvenile verbal phrase.',
    critiqueSi: 'ළදරු මට්ටමේ ප්‍රකාශනයකි.',
    value: 'Upgrades to idiomatic abstract noun structure (+LR).',
    valueSi: 'මානසික සතුට පරිණත ලෙස විස්තර කරයි.'
  },

  // Pronunciation & Rhythmic Phrasing (PR)
  'you know': {
    upgraded: 'as you may well appreciate,',
    criterion: 'PR',
    critique: '"you know" is an unhelpful filler that degrades candidate pronunciation rhythm and coherence.',
    critiqueSi: '"you know" යනු කථනයේ රිද්මය බිඳින අනවශ්‍ය පිරවුම් වචනයකි.',
    value: 'Transforms unconscious verbal tic into an articulate rapport marker (+PR & FC).',
    valueSi: 'කථන රිද්මය සහ ශ්‍රාවක සබඳතාව ආරක්ෂා කරයි.'
  },
  'like': {
    upgraded: 'such as, for instance,',
    criterion: 'FC',
    critique: 'Casual youth filler "like" undermines examiner perception of academic seriousness.',
    critiqueSi: '"like" නිතර පිරවුමක් ලෙස කීම ලකුණු අඩු වීමට හේතු වේ.',
    value: 'Replaces verbal crutch with crisp, clear exemplification (+FC).',
    valueSi: 'පැහැදිලි උදාහරණ දැක්වීමක් බවට පත් කරයි.'
  }
};

/* ------------------------------------------------------------------ */
/* Spoken Spoken Slip Rules (Stage 2 Marker)                          */
/* ------------------------------------------------------------------ */

interface SpokenRule {
  id: string;
  regex: RegExp;
  replacement: string | ((m: string, ...groups: string[]) => string);
  title: string;
  category: TutorIssue['category'];
  severity: TutorIssue['severity'];
  why: string;
  whySi: string;
  rule: string;
  tag?: string;
}

const SPOKEN_GRAMMAR_RULES: SpokenRule[] = [
  {
    id: 'spk-people-is',
    regex: /\b(people)\s+is\b/gi,
    replacement: '$1 are',
    title: 'Subject-Verb Agreement: "People is"',
    category: 'Grammar',
    severity: 'High',
    why: 'In spoken English, "people" is a plural collective noun and must agree with "are" or "were". Saying "people is" immediately drops Grammatical Range & Accuracy to Band 5.',
    whySi: '"People" යනු බහුවචන නාම පදයක් බැවින් "are" හෝ "were" යෙදිය යුතුය. "people is" කීමෙන් GRA ලකුණු පහත වැටේ.',
    rule: 'People + are / were (plural verb agreement).',
    tag: 'Band 5 Pitfall'
  },
  {
    id: 'spk-i-am-agree',
    regex: /\b(I)\s+am\s+agree\b/gi,
    replacement: '$1 agree',
    title: 'Active Verb Confusion: "I am agree"',
    category: 'Grammar',
    severity: 'High',
    why: '"Agree" is an action verb in English, not an adjective. Say "I agree" or "I completely agree", never "I am agree".',
    whySi: '"Agree" ක්‍රියාපදයක් බැවින් "I am agree" නොකියා "I agree" යයි කියන්න.',
    rule: 'Subject + agree (NOT: subject + am + agree).',
    tag: 'Spoken Habit'
  },
  {
    id: 'spk-more-better',
    regex: /\bmore\s+(better|faster|cheaper|easier|higher|closer)\b/gi,
    replacement: (m, adj) => adj,
    title: 'Double Comparative Error',
    category: 'Grammar',
    severity: 'High',
    why: 'English adjectives ending in -er (better, faster, cheaper) are already comparative. Adding "more" before them is a double comparative error.',
    whySi: '-er අගට ඇති නාමවිශේෂණ සමඟ "more" යෙදීම ව්‍යාකරණමය දෝෂයකි.',
    rule: 'Use either "more + adjective" OR "adjective-er", never both.',
    tag: 'Double Comparative'
  },
  {
    id: 'spk-peoples',
    regex: /\bpeoples\b/gi,
    replacement: 'people',
    title: 'Plural Form Error: "Peoples"',
    category: 'Grammar',
    severity: 'Medium',
    why: '"People" is already the plural of person. "Peoples" only refers to distinct ethnic tribes, not ordinary individuals.',
    whySi: '"Person" හි සාමාන්‍ය බහුවචනය "people" වේ.',
    rule: 'One person → multiple people.',
    tag: 'Plural Trap'
  },
  {
    id: 'spk-informations',
    regex: /\b(an\s+)?informations\b/gi,
    replacement: 'information',
    title: 'Uncountable Noun: "Informations"',
    category: 'Vocabulary',
    severity: 'High',
    why: '"Information" is strictly uncountable in standard English. You cannot add -s or say "an information". Use "information" or "a piece of information".',
    whySi: '"Information" ගිණිය නොහැකි නාම පදයක් බැවින් -s එකතු නොකරන්න.',
    rule: 'Uncountable: information / pieces of information.',
    tag: 'Uncountable Noun'
  },
  {
    id: 'spk-filler-um-uh',
    regex: /\b(um+|uh+|erm+)\b/gi,
    replacement: '',
    title: 'Verbal Hesitation Filler',
    category: 'Structure',
    severity: 'Medium',
    why: 'Excessive reliance on vocalized pauses like "um" or "uh" signals processing delays to the examiner, pulling Fluency & Coherence down.',
    whySi: '"um" හෝ "uh" නිතර කීමෙන් කථන චතුරතාව (Fluency) අඩුවේ. ඒ වෙනුවට නිහඬ විරාමයක් හෝ "Well, to be fair" වැනි සන්ධියක් යොදන්න.',
    rule: 'Pause silently for 1 second or use a discourse marker instead of "um".',
    tag: 'Fluency Killer'
  },
  {
    id: 'spk-he-she-dont',
    regex: /\b(he|she|it)\s+don'?t\b/gi,
    replacement: '$1 doesn\'t',
    title: 'Subject-Verb Agreement: "He/She don\'t"',
    category: 'Grammar',
    severity: 'High',
    why: 'Third person singular subjects (he, she, it) require the auxiliary "doesn\'t", not "don\'t".',
    whySi: 'තෙවන පාර්ශ්ව ඒකවචන සඳහා "doesn\'t" යෙදිය යුතුය.',
    rule: 'He / She / It + does not (doesn\'t).',
    tag: 'Fundamental SVA'
  },
  {
    id: 'spk-listen-music',
    regex: /\blisten\s+music\b/gi,
    replacement: 'listen to music',
    title: 'Missing Dependent Preposition: "listen music"',
    category: 'Grammar',
    severity: 'Medium',
    why: 'The verb "listen" requires the preposition "to" before an object: "listen to music", "listen to the radio".',
    whySi: '"listen" ක්‍රියාපදයෙන් පසුව "to" නිපාතය යෙදිය යුතුය: "listen to music".',
    rule: 'listen + to + noun.',
    tag: 'Preposition Slip'
  },
  {
    id: 'spk-depend-of',
    regex: /\bdepends?\s+of\b/gi,
    replacement: 'depends on',
    title: 'Incorrect Preposition: "depend of"',
    category: 'Grammar',
    severity: 'Medium',
    why: 'In English, the verb "depend" collocates with "on" or "upon", never "of".',
    whySi: '"depend" සමඟ යෙදෙන්නේ "on" නිපාතයයි: "it depends on...".',
    rule: 'depend + on / upon (NOT: depend of).',
    tag: 'Preposition Collocation'
  },
  {
    id: 'spk-do-mistake',
    regex: /\b(make|do)\s+a\s+mistake\b/gi,
    replacement: 'make a mistake',
    title: 'Collocation Error: "do a mistake"',
    category: 'Vocabulary',
    severity: 'Medium',
    why: 'In English, we say "make a mistake", never "do a mistake". "Do" does not collocate with errors.',
    whySi: 'ඉංග්‍රීසි භාෂාවේදී "do a mistake" නොකියා "make a mistake" යයි කියනු ලැබේ.',
    rule: 'make a mistake / made a mistake (verb collocation).',
    tag: 'Make vs Do'
  }
];

/* ------------------------------------------------------------------ */
/* Fluency & Speech Analysis Helpers                                  */
/* ------------------------------------------------------------------ */

export function analyzeCandidateSpeechFluency(text: string, durationSec: number = 30): FluencyMetrics {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const effectiveSec = Math.max(durationSec, 5);
  const wordsPerMinute = Math.round((wordCount / effectiveSec) * 60);

  const hesitationMatches = text.match(/\b(um+|uh+|erm+|like|you know|sort of|kind of)\b/gi) || [];
  const fillerCount = hesitationMatches.length;
  const fillerRatio = wordCount > 0 ? Number((fillerCount / wordCount).toFixed(2)) : 0;

  return {
    wordCount,
    durationSec: effectiveSec,
    wordsPerMinute,
    fillerCount,
    fillerRatio,
    hesitationWords: Array.from(new Set(hesitationMatches.map(w => w.toLowerCase())))
  };
}

/* ------------------------------------------------------------------ */
/* Spoken Upgrade Segments Generator (Stage 3 Sandbox)                */
/* ------------------------------------------------------------------ */

export function generateSpokenUpgradeSegments(spokenText: string): EssaySegment[] {
  if (!spokenText.trim()) return [];

  const segments: EssaySegment[] = [];
  const lower = spokenText.toLowerCase();
  let cursor = 0;

  // Build sorted keys by length descending to match multi-word phrases first
  const upgradeKeys = Object.keys(SPOKEN_BAND8_UPGRADES).sort((a, b) => b.length - a.length);

  while (cursor < spokenText.length) {
    let matched = false;

    for (const key of upgradeKeys) {
      const targetSub = lower.slice(cursor, cursor + key.length);
      if (targetSub === key) {
        // Boundary check: word boundaries
        const prevChar = cursor > 0 ? lower[cursor - 1] : ' ';
        const nextChar = cursor + key.length < lower.length ? lower[cursor + key.length] : ' ';
        const isPrevBoundary = /[\s,.;:!?\-"]/.test(prevChar);
        const isNextBoundary = /[\s,.;:!?\-"]/.test(nextChar);

        if (isPrevBoundary && isNextBoundary) {
          const originalSnippet = spokenText.slice(cursor, cursor + key.length);
          const upgradeInfo = SPOKEN_BAND8_UPGRADES[key];

          // Preserve initial capitalization if present
          let replacement = upgradeInfo.upgraded;
          if (originalSnippet[0] === originalSnippet[0].toUpperCase() && originalSnippet[0] !== originalSnippet[0].toLowerCase()) {
            replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
          }

          segments.push({
            type: 'replace',
            text: originalSnippet,
            to: replacement,
            note: upgradeInfo.value
          });

          cursor += key.length;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      // Accumulate standard unchanged text
      const nextWordMatch = spokenText.slice(cursor).search(/\b/);
      const step = nextWordMatch > 0 ? nextWordMatch : 1;
      const unch = spokenText.slice(cursor, cursor + step);

      if (segments.length > 0 && segments[segments.length - 1].type === 'text') {
        segments[segments.length - 1].text += unch;
      } else {
        segments.push({ type: 'text', text: unch });
      }
      cursor += step;
    }
  }

  // If no upgrade was matched at all, generate at least 2 conversational enrichments
  const hasReplaces = segments.some(s => s.type === 'replace');
  if (!hasReplaces && spokenText.trim().length > 15) {
    // Inject introductory Band 8 discourse marker
    const firstWordMatch = spokenText.match(/^(\s*)([A-Za-z]+)(\b.*)$/s);
    if (firstWordMatch) {
      return [
        {
          type: 'replace',
          text: firstWordMatch[2],
          to: `Well, from my perspective, ${firstWordMatch[2].toLowerCase()}`,
          note: 'Adds natural native conversational discourse marker for Fluency Band 8'
        },
        {
          type: 'text',
          text: firstWordMatch[3]
        }
      ];
    }
  }

  return segments;
}

/* ------------------------------------------------------------------ */
/* Offline Local Speaking Evaluator Engine                            */
/* ------------------------------------------------------------------ */

export function evaluateSpokenTurnLocally(
  question: string,
  spokenText: string,
  topicContext?: SpeakingTopic,
  audioDurationSec: number = 25
): SpeakingEvaluationReport {
  const cleanSpoken = spokenText.trim();
  const fluency = analyzeCandidateSpeechFluency(cleanSpoken, audioDurationSec);
  const words = cleanSpoken.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Stage 2 Correction Pass: Scan for grammar slips & fillers
  const issues: TutorIssue[] = [];
  const markedSegments: EssaySegment[] = [];
  let remainingText = cleanSpoken;

  let currentText = cleanSpoken;
  for (const rule of SPOKEN_GRAMMAR_RULES) {
    const matches = Array.from(currentText.matchAll(rule.regex));
    if (matches.length > 0) {
      for (const m of matches) {
        const originalSnippet = m[0];
        const correctedSnippet = typeof rule.replacement === 'function' 
          ? rule.replacement(m[0], ...(m.slice(1)))
          : m[0].replace(rule.regex, rule.replacement);

        issues.push({
          id: `${rule.id}-${issues.length}`,
          title: rule.title,
          category: rule.category,
          severity: rule.severity,
          original: originalSnippet,
          corrected: correctedSnippet || '(remove filler)',
          why: rule.why,
          whySi: rule.whySi,
          rule: rule.rule,
          lessonTopic: 'sentence-structure',
          occurrences: 1,
          tag: rule.tag
        });
      }
    }
  }

  // Build Stage 2 marked speech segments
  // Simple token-based or regex-based replacement
  let stage2Marked: EssaySegment[] = [];
  let cursor = 0;
  // If issues found, map them into segments
  if (issues.length === 0) {
    stage2Marked = [{ type: 'text', text: cleanSpoken }];
  } else {
    // Construct marked segments by finding issues sequentially
    let scanText = cleanSpoken;
    for (const iss of issues) {
      const idx = scanText.toLowerCase().indexOf(iss.original.toLowerCase());
      if (idx !== -1) {
        const before = scanText.slice(0, idx);
        const match = scanText.slice(idx, idx + iss.original.length);
        scanText = scanText.slice(idx + iss.original.length);

        if (before) stage2Marked.push({ type: 'text', text: before });
        if (iss.corrected.includes('(remove')) {
          stage2Marked.push({ type: 'del', text: match, issueId: iss.id });
        } else {
          stage2Marked.push({ type: 'replace', text: match, to: iss.corrected, issueId: iss.id });
        }
      }
    }
    if (scanText) {
      stage2Marked.push({ type: 'text', text: scanText });
    }
  }

  // 2. Score Calculations (FC, LR, GRA, PR)
  let fcBand = 6.5;
  let lrBand = 6.0;
  let graBand = 6.0;
  let prBand = 6.5;

  // Fluency & Coherence adjustments
  if (wordCount < 15) {
    fcBand = 5.0;
  } else if (wordCount < 30) {
    fcBand = 6.0;
  } else if (wordCount > 60 && fluency.fillerRatio < 0.05) {
    fcBand = 7.5;
  } else if (wordCount > 40) {
    fcBand = 7.0;
  }
  if (fluency.fillerRatio > 0.12) {
    fcBand = Math.max(5.0, fcBand - 1.0);
  }

  // Grammatical Range & Accuracy adjustments
  const highSeverityGrammar = issues.filter(i => i.severity === 'High');
  if (highSeverityGrammar.length >= 3) {
    graBand = 5.0;
  } else if (highSeverityGrammar.length >= 1) {
    graBand = 5.5;
  } else if (issues.length === 0 && wordCount > 40) {
    graBand = 7.5;
  } else if (issues.length === 0) {
    graBand = 7.0;
  } else {
    graBand = 6.0;
  }

  // Lexical Resource adjustments
  const hasBand8Vocab = Object.keys(SPOKEN_BAND8_UPGRADES).some(k => 
    cleanSpoken.toLowerCase().includes(SPOKEN_BAND8_UPGRADES[k].upgraded.toLowerCase().slice(0, 8))
  );
  if (hasBand8Vocab) {
    lrBand = 7.5;
  } else if (wordCount > 45) {
    lrBand = 6.5;
  } else {
    lrBand = 6.0;
  }

  // Pronunciation estimation (cadence, contractions, linkings)
  const hasContractions = /\b(I'm|I've|don't|can't|it's|we've|that's)\b/i.test(cleanSpoken);
  if (hasContractions && fluency.fillerRatio < 0.06) {
    prBand = 7.5;
  } else if (hasContractions) {
    prBand = 7.0;
  } else {
    prBand = 6.5;
  }

  const overallBand = roundIeltsBand([fcBand, lrBand, graBand, prBand]);

  // 3. Criteria Breakdown
  const criteria: SpeakingCriterionScore[] = [
    {
      key: 'FC',
      name: 'Fluency & Coherence',
      band: fcBand,
      comment: fluency.fillerRatio > 0.08
        ? `Noticeable vocalized hesitations (${fluency.fillerCount} fillers like "um" or "like"). Candidate can maintain speech but occasionally loses rhythm.`
        : `Maintained a steady conversational flow at ~${fluency.wordsPerMinute} words per minute. Ideas were conveyed without prolonged silences.`,
      commentSi: fluency.fillerRatio > 0.08
        ? `කථනයේදී "um" හෝ "like" වැනි අනවශ්‍ය වචන භාවිතය හේතුවෙන් චතුරතාව මඳක් අඩුවී ඇත.`
        : `මනා කථන වේගයකින් හා චතුරතාවයකින් යුතුව අදහස් ප්‍රකාශ කරන ලදී.`,
      toReach8: 'Eliminate hesitation fillers entirely and link contrasting points using mature discourse markers like "having said that" or "as a consequence".'
    },
    {
      key: 'LR',
      name: 'Lexical Resource',
      band: lrBand,
      comment: hasBand8Vocab
        ? 'Commendable usage of natural spoken idiomatic expressions and specific vocabulary.'
        : 'Vocabulary is adequate for communication, but relies on common everyday words ("good", "a lot of", "big").',
      commentSi: hasBand8Vocab
        ? 'ඉහළ මට්ටමේ වාග්කෝෂ සහ සාමාන්‍ය කතාබහට ඔබින යෙදුම් මනාව යොදා ඇත.'
        : 'අදහස් සන්නිවේදනය ප්‍රමාණවත් නමුත් සරල වචන මත නිතර යැපේ.',
      toReach8: 'Deploy idiomatic collocations naturally, such as "a double-edged sword", "broaden my horizons", and "thoroughly rewarding".'
    },
    {
      key: 'GRA',
      name: 'Grammatical Range & Accuracy',
      band: graBand,
      comment: issues.length > 0
        ? `Contains noticeable spoken slips (${issues.map(i => i.title).slice(0, 2).join(', ')}). Minor subject-verb agreement or preposition issues.`
        : 'Demonstrates good grammatical control with a sound mix of compound and complex clauses.',
      commentSi: issues.length > 0
        ? `කතා කිරීමේදී සුළු ව්‍යාකරණමය දෝෂ කිහිපයක් දක්නට ලැබුණි.`
        : `ව්‍යාකරණමය වශයෙන් නිවැරදි හා සංකීර්ණ වාක්‍ය සාර්ථකව භාවිත කර ඇත.`,
      toReach8: 'Ensure third-person singular and plural subject agreement remain strictly accurate even when speaking at conversational speed.'
    },
    {
      key: 'PR',
      name: 'Pronunciation & Intonation',
      band: prBand,
      comment: hasContractions
        ? 'Natural use of standard spoken contractions ("I\'ve", "it\'s") providing smooth cadence and sentence rhythm.'
        : 'Speech is generally clear and intelligible, though could benefit from more rhythmic sentence stress and natural reductions.',
      commentSi: hasContractions
        ? 'ස්වාභාවික උච්චාරණය සහ කථන රිද්මය මනාව පවත්වාගෙන යයි.'
        : 'පැහැදිලි උච්චාරණයක් ඇතත්, ස්වාභාවික රිද්මය තවදුරටත් වර්ධනය කරගත හැක.',
      toReach8: 'Practice contrastive stress to emphasize key evaluative words and employ natural connected speech (linking sounds between word boundaries).'
    }
  ];

  // 4. Main Problems
  const mainProblems: MainProblem[] = [];
  if (issues.length > 0) {
    mainProblems.push({
      severity: 'High',
      title: 'Spoken Grammatical Slips',
      description: `Detected ${issues.length} grammatical slip(s) in your response, including: ${issues.map(i => i.title).slice(0, 2).join('; ')}.`,
      descriptionSi: `ඔබගේ කථනයේදී ව්‍යාකරණ දෝෂ ${issues.length}ක් හඳුනා ගන්නා ලදී.`
    });
  }
  if (fluency.fillerCount >= 2) {
    mainProblems.push({
      severity: 'Medium',
      title: 'Vocalized Fillers ("um", "like", "you know")',
      description: `You used ${fluency.fillerCount} filler pause(s). In IELTS Speaking, pauses should be silent or bridged with conversational discourse markers.`,
      descriptionSi: `කතා කිරීමේදී අනවශ්‍ය පිරවුම් වචන ${fluency.fillerCount}ක් යෙදී ඇත.`
    });
  }
  if (!hasBand8Vocab) {
    mainProblems.push({
      severity: 'Medium',
      title: 'Reliance on Basic Conversational Vocabulary',
      description: 'Your speech relied on everyday words ("good", "I think", "a lot of"). Examiners award Band 8 for flexible, idiomatic phrasing.',
      descriptionSi: 'සාමාන්‍ය එදිනෙදා සරල වචන වෙනුවට Band 8 මට්ටමේ උසස් කථන යෙදුම් භාවිත කළ යුතුය.'
    });
  }

  // 5. Stage 3 Granular Upgrades
  const band8Edits = generateSpokenUpgradeSegments(cleanSpoken);

  // 6. Stage 4 Model Answer
  const band8ModelAnswer = topicContext?.sampleBand8Answer || 
    `Well, from my perspective, this is a multi-faceted matter. When contemplating "${question}", I am firmly convinced that one must strike a delicate balance between immediate practicality and long-term consequences. In my experience, cultivating a proactive approach has yielded thoroughly rewarding outcomes, not only bolstering personal confidence but also broadening one's broader worldview.`;

  // 7. Spoken Examiner Real-Time Audio Response
  let examinerSpokenFeedback = '';
  if (issues.length > 0) {
    const firstIssue = issues[0];
    examinerSpokenFeedback = `Thank you for sharing your thoughts. You expressed your ideas with good clarity. However, watch out for ${firstIssue.title.toLowerCase()}; for example, instead of "${firstIssue.original}", say "${firstIssue.corrected}". Overall, your speaking achieved Band ${formatBand(overallBand)}. Let's look at your detailed breakdown.`;
  } else if (overallBand >= 7.5) {
    examinerSpokenFeedback = `Excellent delivery! Your fluency was smooth and your vocabulary sounded natural and idiomatic. You scored a strong Band ${formatBand(overallBand)}. Take a look at the live score simulator to see how subtle Band 8 upgrades boost your performance even further.`;
  } else {
    examinerSpokenFeedback = `Good effort! You answered the prompt directly. To push your score towards Band 8, focus on replacing basic words with rich collocations and varied discourse markers. Your current estimate is Band ${formatBand(overallBand)}. Let's review the correction pass below.`;
  }

  return {
    id: `spk-eval-${Date.now()}`,
    turnIndex: 1,
    question,
    spokenText: cleanSpoken,
    overallBand,
    confidence: 'High',
    criteria,
    mainProblems,
    markedSpeech: stage2Marked,
    issues,
    band8Edits,
    stage2Criteria: {
      FC: fcBand,
      LR: lrBand,
      GRA: graBand,
      PR: prBand
    },
    stage2Band: overallBand,
    band8ModelAnswer,
    band8AudioTips: topicContext?.examinerTips || [
      'Adopt a relaxed, conversational posture to maintain natural pitch variation.',
      'Paraphrase smoothly when searching for a word rather than freezing or using "um".',
      'Use idiomatic discourse markers to buy yourself 2-3 seconds of formulation time.'
    ],
    examinerSpokenFeedback,
    examinerSpokenFeedbackSi: `ස්තූතියි! ඔබගේ අදහස් පැහැදිලියි. ව්‍යාකරණ සහ උසස් කථන යෙදුම් කෙරෙහි සැලකිලිමත් වීමෙන් Band 8 වෙත ළඟා විය හැක.`,
    nextFollowUpQuestion: topicContext?.questions[1] || 'Could you elaborate on why this particular aspect holds significance for you?',
    fluencyMetrics: fluency
  };
}

/* ------------------------------------------------------------------ */
/* Gemini Online Spoken Evaluator API                                 */
/* ------------------------------------------------------------------ */

export async function evaluateSpokenTurnWithGemini(
  apiKey: string,
  model: string,
  question: string,
  spokenText: string,
  topicContext?: SpeakingTopic,
  audioDurationSec: number = 25
): Promise<SpeakingEvaluationReport> {
  if (!apiKey || !apiKey.trim()) {
    return evaluateSpokenTurnLocally(question, spokenText, topicContext, audioDurationSec);
  }

  const prompt = `You are a certified senior IELTS Speaking Examiner. Evaluate the following spoken candidate transcript in response to the question.
QUESTION: "${question}"
CANDIDATE SPOKEN TRANSCRIPT: "${spokenText}"

Evaluate strictly according to official IELTS Speaking criteria:
1. Fluency and Coherence (FC)
2. Lexical Resource (LR)
3. Grammatical Range and Accuracy (GRA)
4. Pronunciation & Intonation (PR)

Respond strictly in valid JSON format matching this schema:
{
  "overallBand": 6.5,
  "criteria": [
    {"key": "FC", "name": "Fluency & Coherence", "band": 6.5, "comment": "...", "commentSi": "...", "toReach8": "..."},
    {"key": "LR", "name": "Lexical Resource", "band": 6.0, "comment": "...", "commentSi": "...", "toReach8": "..."},
    {"key": "GRA", "name": "Grammar", "band": 6.0, "comment": "...", "commentSi": "...", "toReach8": "..."},
    {"key": "PR", "name": "Pronunciation", "band": 6.5, "comment": "...", "commentSi": "...", "toReach8": "..."}
  ],
  "mainProblems": [
    {"severity": "High", "title": "...", "description": "...", "descriptionSi": "..."}
  ],
  "issues": [
    {
      "id": "iss-1",
      "title": "Subject-Verb Agreement",
      "category": "Grammar",
      "severity": "High",
      "original": "people is",
      "corrected": "people are",
      "why": "...",
      "whySi": "...",
      "rule": "..."
    }
  ],
  "band8ModelAnswer": "Native Band 8.5/9.0 spoken answer...",
  "examinerSpokenFeedback": "Short spoken response (2-3 sentences) from examiner speaking directly to the candidate...",
  "nextFollowUpQuestion": "A natural follow-up question for the next conversational turn..."
}`;

  // Normalize model name (fallback to verified working Gemini models)
  const candidateModel = (!model || model.includes('3.8') || model.includes('2.5')) 
    ? 'gemini-1.5-flash' 
    : model;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s strict max timeout

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(candidateModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('Gemini API call failed, falling back to local evaluator', response.statusText);
      return evaluateSpokenTurnLocally(question, spokenText, topicContext, audioDurationSec);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return evaluateSpokenTurnLocally(question, spokenText, topicContext, audioDurationSec);
    }

    const parsed = JSON.parse(candidateText);

    // Compute local Stage 2 & 3 diff segments for interactive UI compatibility
    const localFallback = evaluateSpokenTurnLocally(question, spokenText, topicContext, audioDurationSec);

    return {
      id: `gemini-spk-${Date.now()}`,
      turnIndex: 1,
      question,
      spokenText,
      overallBand: typeof parsed.overallBand === 'number' ? parsed.overallBand : localFallback.overallBand,
      confidence: 'High',
      criteria: Array.isArray(parsed.criteria) ? parsed.criteria : localFallback.criteria,
      mainProblems: Array.isArray(parsed.mainProblems) ? parsed.mainProblems : localFallback.mainProblems,
      markedSpeech: localFallback.markedSpeech,
      issues: Array.isArray(parsed.issues) && parsed.issues.length > 0 ? parsed.issues : localFallback.issues,
      band8Edits: localFallback.band8Edits,
      stage2Criteria: localFallback.stage2Criteria,
      stage2Band: localFallback.stage2Band,
      band8ModelAnswer: parsed.band8ModelAnswer || localFallback.band8ModelAnswer,
      band8AudioTips: topicContext?.examinerTips || localFallback.band8AudioTips,
      examinerSpokenFeedback: parsed.examinerSpokenFeedback || localFallback.examinerSpokenFeedback,
      examinerSpokenFeedbackSi: localFallback.examinerSpokenFeedbackSi,
      nextFollowUpQuestion: parsed.nextFollowUpQuestion || localFallback.nextFollowUpQuestion,
      fluencyMetrics: localFallback.fluencyMetrics
    };
  } catch (err) {
    console.warn('Error during Gemini spoken evaluation, using local fallback:', err);
    return evaluateSpokenTurnLocally(question, spokenText, topicContext, audioDurationSec);
  }
}

