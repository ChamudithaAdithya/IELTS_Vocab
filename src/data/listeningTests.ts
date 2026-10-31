import type { ListeningItem } from '../types/tutor';

export const CAMBRIDGE_LISTENING_TESTS: ListeningItem[] = [
  {
    id: 'c18-l-sec1',
    section: 1,
    cambridgeSource: 'Cambridge IELTS 18, Listening Test 1 (Section 1)',
    title: 'Buckworth Community Arts Centre - Course Registration',
    audioSimText:
      'WOMAN: Good morning, Buckworth Arts Centre. How can I help you?\nMAN: Hello, I’m inquiring about pottery and ceramic evening classes for adults.\nWOMAN: Certainly! We have a beginner pottery course starting on Monday evenings from 7.00 to 9.00 pm.\nMAN: Great. And what is the total fee for the 8-week term?\nWOMAN: The standard fee is £180, but if you book before this Friday, there is an early-bird discount down to £165.\nMAN: Excellent, I will register today. What should I bring with me?\nWOMAN: Just an apron and an old towel. All clay and sculpting tools are supplied in the studio.\nMAN: Perfect. Where is the centre located exactly?\nWOMAN: It’s on Bramford Road, opposite the central library.',
    questions: [
      {
        number: 1,
        question: 'Name of course: Beginner __________ class',
        answer: 'pottery',
        distractors: ['ceramic', 'sculpture'],
        explanation: 'The receptionist states: "We have a beginner pottery course starting on Monday evenings".',
        explanationSi: 'පළමු ප්‍රශ්නය සඳහා නිවැරදි පිළිතුර "pottery" වේ.'
      },
      {
        number: 2,
        question: 'Early-bird discounted fee: £ __________',
        answer: '165',
        distractors: ['180'],
        explanation: 'Distractor alert: £180 is the standard fee; £165 is the discounted early-bird rate.',
        explanationSi: 'සාමාන්‍ය ගාස්තුව £180 වුවද, කලින් වෙන්කිරීමේ වට්ටම් ගාස්තුව £165 කි.'
      },
      {
        number: 3,
        question: 'Items student must bring: an apron and an old __________',
        answer: 'towel',
        distractors: ['clay', 'tools'],
        explanation: 'Receptionist confirms: "Just an apron and an old towel. All clay and tools are supplied."',
        explanationSi: 'සිසුවා විසින් රැගෙන ආ යුත්තේ apron එකක් සහ old towel එකකි.'
      },
      {
        number: 4,
        question: 'Location: on Bramford Road, opposite the __________',
        answer: 'library',
        distractors: ['station', 'park'],
        explanation: '"opposite the central library" -> answer is "library".',
        explanationSi: 'මධ්‍යස්ථානය පිහිටා ඇත්තේ පුස්තකාලය (library) ඉදිරිපිටය.'
      }
    ]
  }
];

