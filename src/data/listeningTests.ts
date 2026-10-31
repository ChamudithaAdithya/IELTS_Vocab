import type { ListeningItem } from '../types/tutor';
import { CAMBRIDGE_1_LISTENING_TESTS } from './cambridge1FullTests';

export const CAMBRIDGE_LISTENING_TESTS: ListeningItem[] = [
  ...CAMBRIDGE_1_LISTENING_TESTS,
  /* ------------------------------------------------------------------ */
  /* Cambridge 18                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'c18-t1-sec1',
    bookNumber: 18,
    testNumber: 1,
    section: 1,
    cambridgeSource: 'Cambridge IELTS 18, Test 1 - Part 1',
    title: 'Buckworth Community Arts Centre - Course Registration',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%2018/AUDIO-20230609T000359Z-001/AUDIO/Test%201-%20original%20exams/18%20section1-part1.mp3',
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
  },
  {
    id: 'c18-t2-sec1',
    bookNumber: 18,
    testNumber: 2,
    section: 1,
    cambridgeSource: 'Cambridge IELTS 18, Test 2 - Part 1',
    title: 'Local Festival Voluntary Work Registration Form',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%2018/AUDIO-20230609T000359Z-001/AUDIO/Test%20%202-%20original%20exams/18%20section2-part1.mp3',
    audioSimText:
      'COORDINATOR: Good morning, Midsummer Cultural Festival volunteer desk. Are you interested in helping out?\nVOLUNTEER: Yes, I would love to volunteer during the festival weekend.\nCOORDINATOR: Fantastic! First, could you tell me your preferred area of assistance?\nVOLUNTEER: I really enjoy working outdoors with visitors, so directing crowds or acting as a stage steward would be great.\nCOORDINATOR: Excellent. We particularly need help with parking supervision and guiding visitors from the station.\nVOLUNTEER: Parking steward sounds ideal. What dates do you need me?\nCOORDINATOR: The main festival runs on July 14th and 15th, but we need volunteer orientation on Thursday July 12th at 6.00 pm.\nVOLUNTEER: I will attend the orientation. What should volunteers wear?\nCOORDINATOR: We will issue an official yellow high-visibility jacket. You just need to wear sensible dark trousers and waterproof shoes.',
    questions: [
      {
        number: 1,
        question: 'Assigned voluntary role: __________ steward',
        answer: 'parking',
        distractors: ['stage', 'crowd'],
        explanation: 'Coordinator confirms: "Parking steward sounds ideal".',
        explanationSi: 'ස්වේච්ඡා කාර්යභාරය "parking steward" වේ.'
      },
      {
        number: 2,
        question: 'Mandatory volunteer orientation date: July __________ at 6.00 pm',
        answer: '12th',
        distractors: ['14th', '15th'],
        explanation: 'The festival is July 14-15, but orientation is Thursday July 12th.',
        explanationSi: 'දිශානති දිනය ජූලි 12 වනදා (July 12th) වේ.'
      },
      {
        number: 3,
        question: 'Official uniform provided: a yellow __________ jacket',
        answer: 'high-visibility',
        distractors: ['waterproof', 'leather'],
        explanation: '"We will issue an official yellow high-visibility jacket".',
        explanationSi: 'ලබාදෙන නිල ඇඳුම "high-visibility" කබායකි.'
      }
    ]
  },
  {
    id: 'c18-t2-sec2',
    bookNumber: 18,
    testNumber: 2,
    section: 2,
    cambridgeSource: 'Cambridge IELTS 18, Test 2 - Part 2',
    title: 'Redhill Country Park & Woodland Trail Orientation',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%2018/AUDIO-20230609T000359Z-001/AUDIO/Test%20%202-%20original%20exams/18%20section2-part2.mp3',
    audioSimText:
      'RANGER: Welcome to Redhill Country Park visitor briefing! Before you set off exploring our trails, please take note of a few safety rules. First, cycling is permitted only along the paved perimeter path; bicycles are strictly prohibited on the ancient woodland boardwalk to safeguard rare mosses. Secondly, dogs must be kept on short leads near the sheep pastures at all times. Finally, if you would like to rent binoculars for bird watching across the reedbeds, they are available at the information hut for a £5 refundable deposit.',
    questions: [
      {
        number: 1,
        question: 'Cycling is allowed only on the __________ path',
        answer: 'paved',
        distractors: ['woodland', 'boardwalk'],
        explanation: 'Ranger confirms: "cycling is permitted only along the paved perimeter path".',
        explanationSi: 'පාපැදි ධාවනය කළ හැක්කේ "paved" මාවතේ පමණි.'
      },
      {
        number: 2,
        question: 'Refundable deposit for binocular rental: £ __________',
        answer: '5',
        distractors: ['10', '15'],
        explanation: 'Binoculars are available for a £5 refundable deposit.',
        explanationSi: 'දුරදක්න කුලී තැන්පතුව £5 කි.'
      }
    ]
  },

  /* ------------------------------------------------------------------ */
  /* Cambridge 17                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'c17-t1-sec1',
    bookNumber: 17,
    testNumber: 1,
    section: 1,
    cambridgeSource: 'Cambridge IELTS 17, Test 1 - Part 1',
    title: 'Buckworth Health Club - Annual Membership Inquiry',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%2017/Audio%20cambridge%2017/ELT_IELTS17_t1_audio1.mp3',
    audioSimText:
      'AGENT: Good morning, Buckworth Leisure and Fitness Club. How can I assist you?\nCUSTOMER: Hello, I would like some information regarding your gym and pool membership packages.\nAGENT: Certainly! We have two main tiers: Peak and Off-peak. Our Peak membership offers unlimited access seven days a week, including our heated swimming pool and sauna.\nCUSTOMER: Great. And what is the monthly membership fee for Peak access?\nAGENT: The standard monthly fee is £60, but if you sign a 12-month contract, it reduces to £52 per month.\nCUSTOMER: That sounds very reasonable. Do you offer an induction with a personal fitness trainer?\nAGENT: Yes, every new member receives a complimentary one-hour assessment with a trainer, plus a personalized workout programme.\nCUSTOMER: Perfect. Is there parking on site?\nAGENT: Yes, we have a secure underground car park which is free for members for up to three hours.',
    questions: [
      {
        number: 1,
        question: 'Discounted monthly fee with a 12-month contract: £ __________',
        answer: '52',
        distractors: ['60'],
        explanation: 'Distractor trap: £60 is the standard fee; £52 is the 12-month discounted fee.',
        explanationSi: 'මාස 12 ක ගිවිසුම යටතේ මාසික ගාස්තුව £52 කි.'
      },
      {
        number: 2,
        question: 'New members receive a complimentary assessment with a fitness __________',
        answer: 'trainer',
        distractors: ['nutritionist', 'doctor'],
        explanation: '"receives a complimentary one-hour assessment with a trainer".',
        explanationSi: 'නොමිලේ ලැබෙන ඇගයීම "trainer" කෙනෙකු සමඟ වේ.'
      },
      {
        number: 3,
        question: 'Free parking duration for members: up to __________ hours',
        answer: '3',
        distractors: ['1', '2'],
        explanation: '"free for members for up to three hours".',
        explanationSi: 'නොමිලේ වාහන නැවැත්වීමේ කාලය පැය 3 කි.'
      }
    ]
  },
  {
    id: 'c17-t2-sec2',
    bookNumber: 17,
    testNumber: 2,
    section: 2,
    cambridgeSource: 'Cambridge IELTS 17, Test 2 - Part 2',
    title: 'Redhill Wetland Wildlife Reserve - Visitor Orientation Guide',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%2017/Audio%20cambridge%2017/ELT_IELTS17_t2_audio2.mp3',
    audioSimText:
      'GUIDE: Good afternoon everyone and welcome to the Redhill Wetland Reserve. I’d like to highlight our daily schedule and safety rules.\nFirst, guided marshland walks depart daily from outside the visitor centre at 10.30 am and 2.15 pm.\nFor families with children, our discovery pond-dipping workshop takes place near the willow hide at 11.45 am.\nPlease remember that all dogs must be kept on a lead at all times to prevent scaring the nesting birds.\nIf you wish to hire high-powered binoculars, they are available at the front desk for a £10 refundable deposit.\nFinally, the reserve gates lock promptly at 6.00 pm.',
    questions: [
      {
        number: 1,
        question: 'Marshland guided walk morning departure: __________ am',
        answer: '10.30',
        distractors: ['11.45', '2.15'],
        explanation: 'Guide states: "guided marshland walks depart daily at 10.30 am".',
        explanationSi: 'උදෑසන ගමන් ආරම්භය පෙරවරු 10.30 වේ.'
      },
      {
        number: 2,
        question: 'Equipment rental deposit: £ __________ refundable deposit',
        answer: '10',
        distractors: ['5', '15'],
        explanation: '"available at the front desk for a £10 refundable deposit".',
        explanationSi: 'නැවත ගෙවන තැන්පතුව £10 කි.'
      },
      {
        number: 3,
        question: 'Rule regarding dogs: must be kept on a __________ at all times',
        answer: 'lead',
        distractors: ['collar', 'cage'],
        explanation: '"all dogs must be kept on a lead at all times".',
        explanationSi: 'සුනඛයන් සැමවිටම "lead" එකකින් බැඳ තැබිය යුතුය.'
      }
    ]
  },
  {
    id: 'c17-t3-sec1',
    bookNumber: 17,
    testNumber: 3,
    section: 1,
    cambridgeSource: 'Cambridge IELTS 17, Test 3 - Part 1',
    title: 'Customer Feedback Survey - City Public Bicycle Scheme',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%2017/Audio%20cambridge%2017/ELT_IELTS17_t3_audio1.mp3',
    audioSimText:
      'INTERVIEWER: Excuse me, sir! Do you have a moment to answer three brief questions about our municipal bicycle hire service?\nCOMMUTER: Sure, I commute with these bikes daily.\nINTERVIEWER: Fantastic! How many days a week do you normally utilize the bicycles?\nCOMMUTER: I ride to work Monday through Friday, so exactly 5 days a week.\nINTERVIEWER: And which docking station do you most frequently return the bicycle to in the evening?\nCOMMUTER: Usually the station near St. Peter’s Church, right by the market square.\nINTERVIEWER: Great. What is your primary complaint or suggestion for improvement?\nCOMMUTER: The electronic locking mechanism on the docking bays often jams when trying to release a bike, especially during morning rush hour.',
    questions: [
      {
        number: 1,
        question: 'Commuter uses the bicycle scheme __________ days per week',
        answer: '5',
        distractors: ['7', '3'],
        explanation: '"Monday through Friday, so exactly 5 days a week".',
        explanationSi: 'සතියකට දින 5 ක් භාවිතා කරයි.'
      },
      {
        number: 2,
        question: 'Most frequent evening docking station: near St. Peter’s __________',
        answer: 'Church',
        distractors: ['Square', 'Market'],
        explanation: '"near St. Peter’s Church, right by the market square".',
        explanationSi: 'ස්ථානය "Church" වේ.'
      },
      {
        number: 3,
        question: 'Main operational issue reported: electronic __________ mechanism jams',
        answer: 'locking',
        distractors: ['payment', 'pedal'],
        explanation: '"electronic locking mechanism on the docking bays often jams".',
        explanationSi: 'ගැටලුව "locking" mechanism එකයි.'
      }
    ]
  },

  /* ------------------------------------------------------------------ */
  /* Cambridge 16                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'c16-t1-sec1',
    bookNumber: 16,
    testNumber: 1,
    section: 1,
    cambridgeSource: 'Cambridge IELTS 16, Test 1 - Part 1',
    title: 'Children’s Weekend Art Class Registration',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%2016/Cam%2016-Audio/Cam%2016-Audio/Test%201%20Part%201.mp3',
    audioSimText:
      'RECEPTIONIST: Hello, Junior Art Academy. How may I help you?\nPARENT: Hello, I’d like to enroll my 8-year-old daughter in your Saturday morning art club.\nRECEPTIONIST: Wonderful! Our Saturday junior session runs from 10.00 am to 11.30 am.\nPARENT: That’s a convenient time. What is the fee per term?\nRECEPTIONIST: The 10-week term is £95, which covers all materials such as paints, brushes, and clay.\nPARENT: Fantastic. What should she wear on the first day?\nRECEPTIONIST: We recommend old clothes and an overall or old shirt to protect against oil pastels.\nPARENT: And where do classes take place?\nRECEPTIONIST: In Studio 3 on the ground floor of our St. Jude’s campus.',
    questions: [
      {
        number: 1,
        question: 'Art class timing: Saturday morning from 10.00 to __________ am',
        answer: '11.30',
        distractors: ['12.00', '11.00'],
        explanation: '"from 10.00 am to 11.30 am".',
        explanationSi: 'වේලාව පෙරවරු 11.30 දක්වා වේ.'
      },
      {
        number: 2,
        question: 'Fee for the 10-week term: £ __________',
        answer: '95',
        distractors: ['100', '85'],
        explanation: 'Confirmed fee: £95 per term.',
        explanationSi: 'පාඨමාලා ගාස්තුව £95 කි.'
      },
      {
        number: 3,
        question: 'Class location: Studio 3 on the __________ floor',
        answer: 'ground',
        distractors: ['first', 'second'],
        explanation: '"ground floor of our St. Jude’s campus".',
        explanationSi: 'පිහිටීම බිම් මහල (ground floor) වේ.'
      }
    ]
  },
  {
    id: 'c16-t1-sec3',
    bookNumber: 16,
    testNumber: 1,
    section: 3,
    cambridgeSource: 'Cambridge IELTS 16, Test 1 - Part 3',
    title: 'Hornsea Offshore Wind Farm Ecological Survey',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%2016/Cam%2016-Audio/Cam%2016-Audio/Test%201%20Part%203.mp3',
    audioSimText:
      'PROFESSOR: Welcome James and Sandra. Today let’s review your field research proposal on the Hornsea offshore wind farm.\nJAMES: Thanks Professor. Our primary objective is to investigate the environmental repercussions of underwater pile-driving during turbine installation.\nSANDRA: Yes, initial hydrophone data indicates acoustic shockwaves can disrupt harbour porpoise echolocation for miles.\nPROFESSOR: Good. Did you also evaluate potential seabed sediment disturbance?\nJAMES: We did. Cable-laying trenching temporarily increases water turbidity, but benthic communities recover within twenty-four months.\nPROFESSOR: And what about electromagnetic field emissions from subsea transmission cables?\nSANDRA: That was surprising—demersal fish species like thornback rays appear mildly disoriented near unshielded cables.',
    questions: [
      {
        number: 1,
        question: 'Primary ecological concern: disruption of porpoise __________ by acoustic noise',
        answer: 'echolocation',
        distractors: ['migration', 'breeding'],
        explanation: '"disrupt harbour porpoise echolocation for miles".',
        explanationSi: 'ධ්වනි කම්පන මඟින් ඩොල්ෆින් සතුන්ගේ "echolocation" ක්‍රියාවලියට බාධා වේ.'
      },
      {
        number: 2,
        question: 'Benthic sea floor communities recover within __________ months',
        answer: '24',
        distractors: ['12', '36'],
        explanation: '"recover within twenty-four months".',
        explanationSi: 'ප්‍රකෘතිමත් වීමට මාස 24 ක් ගතවේ.'
      }
    ]
  },

  /* ------------------------------------------------------------------ */
  /* Cambridge 15                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'c15-t1-sec1',
    bookNumber: 15,
    testNumber: 1,
    section: 1,
    cambridgeSource: 'Cambridge IELTS 15, Test 1 - Part 1',
    title: 'Bankside Recruitment Agency - Candidate Profile',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%2015/Cambridge%20IELTS%2015%20Audio/IELTS15_test1_audio1.mp3',
    audioSimText:
      'CONSULTANT: Good morning. Bankside Recruitment Services, my name is Rachel. How can I help?\nCANDIDATE: Hello Rachel, I’d like to register with your agency for temporary administrative work.\nCONSULTANT: Excellent. First, may I have your full surname?\nCANDIDATE: It’s Pargetter, spelled P-A-R-G-E-T-T-E-R.\nCONSULTANT: And what is your contact telephone number?\nCANDIDATE: It’s 07788 321 904.\nCONSULTANT: Perfect. What clerical software are you most proficient with?\nCANDIDATE: I have five years of advanced experience with financial spreadsheets and database entry.\nCONSULTANT: Wonderful. When would you be available to commence work?\nCANDIDATE: Immediately, starting next Monday, October 21st.',
    questions: [
      {
        number: 1,
        question: 'Candidate surname: __________',
        answer: 'Pargetter',
        distractors: ['Pargeter', 'Pargetter'],
        explanation: 'Spelled clearly: P-A-R-G-E-T-T-E-R.',
        explanationSi: 'අවසාන නම "Pargetter" වේ.'
      },
      {
        number: 2,
        question: 'Key administrative software skill: advanced financial __________',
        answer: 'spreadsheets',
        distractors: ['word processing', 'presentations'],
        explanation: '"advanced experience with financial spreadsheets".',
        explanationSi: 'ප්‍රධාන කුසලතාව "spreadsheets" හැසිරවීමයි.'
      },
      {
        number: 3,
        question: 'Candidate available to start from Monday, October __________',
        answer: '21st',
        distractors: ['14th', '28th'],
        explanation: '"starting next Monday, October 21st".',
        explanationSi: 'ආරම්භක දිනය ඔක්තෝබර් 21 වේ.'
      }
    ]
  },
  {
    id: 'c15-t4-sec4',
    bookNumber: 15,
    testNumber: 4,
    section: 4,
    cambridgeSource: 'Cambridge IELTS 15, Test 4 - Part 4',
    title: 'Ancient Roman Aqueduct Architecture & Hydraulic Engineering',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%2015/Cambridge%20IELTS%2015%20Audio/IELTS15_test4_audio4.mp3',
    audioSimText:
      'LECTURER: In today’s lecture on classical civil engineering, we examine the construction of Roman aqueducts.\nPopular imagination envisions miles of monumental stone arches traversing valleys. In reality, less than 20% of the aqueduct network was carried on visible arches.\nThe vast majority—over 80%—ran entirely underground through rock-cut tunnels.\nThis underground routing served two paramount purposes: first, it shielded the conduit from hostile military contamination; second, it prevented water evaporation during scorching Mediterranean summers.\nTo calculate the delicate slope required for water to flow continuously without eroding the concrete lining, surveyors utilized an ingenious instrument called the chorobates.\nWater cascaded by gravity alone, requiring no mechanical pumping.',
    questions: [
      {
        number: 1,
        question: 'Percentage of aqueduct system carried on arches: only __________ percent',
        answer: '20',
        distractors: ['80'],
        explanation: 'Distractor trap: 80% was underground; only 20% was on arches.',
        explanationSi: 'ආරුක්කු මත තිබුණේ 20% ක් පමණි. 80% ක්ම පොළොව යටිනි.'
      },
      {
        number: 2,
        question: 'Underground tunnels protected water from contamination and __________',
        answer: 'evaporation',
        distractors: ['freezing', 'leakage'],
        explanation: 'Lecturer states: "second, it prevented water evaporation during summers".',
        explanationSi: 'වාෂ්පීභවනය (evaporation) වැළැක්වීම ප්‍රධාන අරමුණක් විය.'
      },
      {
        number: 3,
        question: 'Surveying tool used by engineers to calculate slope: the __________',
        answer: 'chorobates',
        distractors: ['groma', 'compass'],
        explanation: 'Lecturer names: "surveyors utilized an ingenious instrument called the chorobates".',
        explanationSi: 'භාවිතා කළ සමීක්ෂණ උපකරණය "chorobates" වේ.'
      },
      {
        number: 4,
        question: 'Power source moving the water through the channels: __________ alone',
        answer: 'gravity',
        distractors: ['pressure', 'pumps'],
        explanation: '"Water cascaded by gravity alone".',
        explanationSi: 'ජලය ගලා ගියේ ගුරුත්වාකර්ෂණය (gravity) මඟින් පමණි.'
      }
    ]
  }
];
