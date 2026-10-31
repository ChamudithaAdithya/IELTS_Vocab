import type { ListeningItem } from '../types/tutor';

export const CAMBRIDGE_LISTENING_TESTS: ListeningItem[] = [
  {
    id: 'c18-l-sec1',
    section: 1,
    cambridgeSource: 'Cambridge IELTS 18, Listening Test 1 - Section 1',
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
  },
  {
    id: 'c17-l-sec2',
    section: 2,
    cambridgeSource: 'Cambridge IELTS 17, Listening Test 2 - Section 2',
    title: 'Redhill Wetland Wildlife Reserve - Visitor Orientation Guide',
    audioSimText:
      'GUIDE: Welcome to the Redhill Wetland Wildlife Reserve! I want to outline a few key guidelines before we head onto the wooden boardwalks.\nFirst, the main visitor centre is open daily until 5.30 pm. Binoculars can be rented from the reception desk for a deposit of £10.\nSecond, regarding wildlife observation: please remain strictly on the marked boardwalk paths. Stepping onto the marshland will disturb nesting wetland birds, especially marsh harriers and kingfishers.\nThird, if you wish to photograph the wild otters, the optimal viewing platform is the North Hide, situated right beside the freshwater lake. Feeding the otters is strictly forbidden as it harms their natural foraging instincts.\nFinally, a reminder that bicycles and dogs are not permitted anywhere past the visitor centre gate.',
    questions: [
      {
        number: 1,
        question: 'Binoculars rental deposit: £ __________',
        answer: '10',
        distractors: ['5', '15'],
        explanation: 'The guide confirms binoculars can be rented for a deposit of £10.',
        explanationSi: 'දුරදක්න කුලියට ගැනීම සඳහා තැන්පතුව £10 කි.'
      },
      {
        number: 2,
        question: 'Best platform to view otters: the __________ Hide',
        answer: 'North',
        distractors: ['South', 'East'],
        explanation: '"the optimal viewing platform is the North Hide".',
        explanationSi: 'ඔටර් සතුන් නැරඹීමට හොඳම ස්ථානය වන්නේ North Hide ය.'
      },
      {
        number: 3,
        question: 'Location of the viewing hide: beside the freshwater __________',
        answer: 'lake',
        distractors: ['river', 'pond'],
        explanation: '"situated right beside the freshwater lake".',
        explanationSi: 'මෙම නැරඹුම් මැදිරිය පිහිටා ඇත්තේ මිරිදිය විල (lake) අසලයි.'
      },
      {
        number: 4,
        question: 'Animals not allowed inside the reserve: __________ and bicycles',
        answer: 'dogs',
        distractors: ['horses', 'pets'],
        explanation: 'Guide states: "bicycles and dogs are not permitted anywhere past the gate".',
        explanationSi: 'ඇතුළට රැගෙන යාම තහනම් සතුන් වන්නේ බල්ලන් (dogs) ය.'
      }
    ]
  },
  {
    id: 'c16-l-sec3',
    section: 3,
    cambridgeSource: 'Cambridge IELTS 16, Listening Test 3 - Section 3',
    title: 'Renewable Offshore Wind Farm Case Study - Academic Tutorial',
    audioSimText:
      'PROFESSOR: Good afternoon, Liam and Sarah. Let’s review your draft project proposal on the Hornsea Offshore Wind Farm.\nSARAH: Thanks Professor Adams. We focused primarily on the marine engineering aspects and turbine energy generation capacity.\nPROFESSOR: Your technical summary of the turbine specifications is excellent. However, you need to expand your analysis on environmental impact.\nLIAM: Do you mean underwater acoustic noise during construction?\nPROFESSOR: Exactly. Pile-driving foundations into the seabed generates high-decibel acoustic shockwaves that disrupt marine mammals, particularly harbour porpoises and grey seals.\nSARAH: Should we also investigate how seabed cables affect migratory fish?\nPROFESSOR: Yes, the electromagnetic fields emitted by high-voltage subsea cables are suspected of disorienting rays and sharks. Make sure to consult the 2023 Danish marine study in your bibliography.',
    questions: [
      {
        number: 1,
        question: 'Project focus of the draft: marine engineering and energy __________',
        answer: 'generation',
        distractors: ['distribution', 'storage'],
        explanation: 'Sarah explains: "turbine energy generation capacity".',
        explanationSi: 'පළමු අවධානය යොමු කළේ බලශක්ති උත්පාදනය (generation) කෙරෙහිය.'
      },
      {
        number: 2,
        question: 'Underwater construction hazard: high-decibel __________ noise',
        answer: 'acoustic',
        distractors: ['drilling', 'vibration'],
        explanation: 'Professor references: "generates high-decibel acoustic shockwaves".',
        explanationSi: 'මුහුදු පත්ලේ ඉදිකිරීම් නිසා ඇතිවන ධ්වනි (acoustic) ඝෝෂාව.'
      },
      {
        number: 3,
        question: 'Marine mammal species disrupted: harbour porpoises and grey __________',
        answer: 'seals',
        distractors: ['dolphins', 'whales'],
        explanation: '"disrupt marine mammals, particularly harbour porpoises and grey seals".',
        explanationSi: 'බාධා එල්ල වන සාගර ක්ෂීරපායී සතුන් වන්නේ grey seals ය.'
      },
      {
        number: 4,
        question: 'Subsea cables emit __________ fields that disorient fish',
        answer: 'electromagnetic',
        distractors: ['electric', 'magnetic'],
        explanation: '"the electromagnetic fields emitted by high-voltage subsea cables".',
        explanationSi: 'විද්‍යුත් චුම්භක ක්ෂේත්‍ර (electromagnetic fields).'
      }
    ]
  },
  {
    id: 'c15-l-sec4',
    section: 4,
    cambridgeSource: 'Cambridge IELTS 15, Listening Test 4 - Section 4',
    title: 'Ancient Roman Aqueduct Architecture and Hydraulic Engineering',
    audioSimText:
      'LECTURER: Today we examine one of antiquity’s greatest civil engineering achievements: Roman aqueducts.\nContrary to popular assumption, only about twenty percent of the Roman aqueduct network was carried on monumental stone arches. Over eighty percent was constructed subterranean, through tunnels carved into bedrock or buried masonry channels.\nThis underground design was intentional. It served two vital functions: first, it protected the urban water supply from contamination and enemy poisoning; second, it prevented water evaporation during scorching Mediterranean summers.\nTo maintain continuous water flow without mechanical pumps, Roman surveyors utilized an ingenious instrument called the chorobates to engineer an extraordinarily slight downward gradient, often as gentle as thirty centimetres per kilometre. Water cascaded by gravity alone until terminating in municipal storage reservoirs known as the castellum divisorium.',
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
  },
  {
    id: 'c14-l-sec1',
    section: 1,
    cambridgeSource: 'Cambridge IELTS 14, Listening Test 1 - Section 1',
    title: 'Crime Report Form - Burglary Inquiry at Local Police Station',
    audioSimText:
      'OFFICER: Good morning. Police Station incident desk, Officer Henderson speaking. How may I assist you today?\nCALLER: Hello officer, I need to log a formal crime report. My apartment was broken into yesterday evening while I was at work.\nOFFICER: I am terribly sorry to hear that. Let me take down your particulars for the incident log. May I have your full name and residential address?\nCALLER: Yes, my name is Louise Taylor, and the address is Apartment 4, 41 Ellison Park, Brampton.\nOFFICER: Thank you. And what were the principal items taken from the premises?\nCALLER: They stole my silver laptop computer from the study desk, and also a gold antique wristwatch from the dresser.\nOFFICER: Do you happen to have the serial registration number for the laptop?\nCALLER: Yes, it is recorded in my purchase receipts: SN-7729-BK.\nOFFICER: Noted. And what was the estimated date and window of time for the break-in?\nCALLER: Between 4.30 pm and 8.00 pm on Tuesday, October 15th.',
    questions: [
      {
        number: 1,
        question: 'Caller’s residential address: Flat 4, 41 __________ Park',
        answer: 'Ellison',
        distractors: ['Allison', 'Edison'],
        explanation: 'The caller clearly states: "41 Ellison Park, Brampton".',
        explanationSi: 'ඇමතුම්කරු සඳහන් කරන ලිපිනය "Ellison" වේ.'
      },
      {
        number: 2,
        question: 'Main electronic item taken: silver __________ computer',
        answer: 'laptop',
        distractors: ['desktop', 'tablet'],
        explanation: 'Caller reports: "They stole my silver laptop computer from the study desk".',
        explanationSi: 'සොරාගෙන ඇති ඉලෙක්ට්‍රොනික උපකරණය "laptop" පරිගණකයයි.'
      },
      {
        number: 3,
        question: 'Jewellery reported missing: a gold antique __________',
        answer: 'wristwatch',
        distractors: ['necklace', 'ring'],
        explanation: 'Caller specifically mentions: "also a gold antique wristwatch from the dresser".',
        explanationSi: 'සොරාගත් ආභරණය පැරණි රන් "wristwatch" එකකි.'
      },
      {
        number: 4,
        question: 'Break-in occurred between 4.30 pm and __________ pm',
        answer: '8.00',
        distractors: ['4.30', '6.00'],
        explanation: 'The time window confirmed is between 4.30 pm and 8.00 pm.',
        explanationSi: 'අවසාන වේලාව ප.ව. 8.00 ලෙස සටහන් වේ.'
      }
    ]
  },
  {
    id: 'c13-l-sec1',
    section: 1,
    cambridgeSource: 'Cambridge IELTS 13, Listening Test 1 - Section 1',
    title: 'Cookery Classes Inquiry - The Food Studio Workshop',
    audioSimText:
      'RECEPTIONIST: Welcome to The Food Studio culinary academy! How can I help you find the right workshop?\nSTUDENT: Hi, I would love to improve my cooking skills, especially for international cuisine.\nRECEPTIONIST: Brilliant! We have our most popular 6-week module entitled "Modern Mediterranean Cooking". It starts on Saturday mornings from 9.30 to 11.30 am.\nSTUDENT: That sounds great. What specific practical techniques will we cover in week one?\nRECEPTIONIST: In the opening masterclass, our head chef focuses intensively on professional knife skills and safe butchery.\nSTUDENT: Excellent, that’s exactly what I struggle with! And what is the tuition fee per session?\nRECEPTIONIST: It is £45 per individual workshop, but enrolling for the full six sessions grants a package discount of £230.\nSTUDENT: Wonderful, I will register for the full package today.',
    questions: [
      {
        number: 1,
        question: 'Core practical skill taught during week one: professional __________ skills',
        answer: 'knife',
        distractors: ['baking', 'chopping'],
        explanation: 'The receptionist emphasizes: "head chef focuses intensively on professional knife skills".',
        explanationSi: 'පළමු සතියේ උගන්වන ප්‍රධාන කුසලතාව "knife" හැසිරවීමයි.'
      },
      {
        number: 2,
        question: 'Workshop timing: Saturday mornings starting at __________ am',
        answer: '9.30',
        distractors: ['11.30', '9.00'],
        explanation: 'Schedule is announced as Saturday mornings from 9.30 to 11.30 am.',
        explanationSi: 'ආරම්භක වේලාව පෙරවරු 9.30 වේ.'
      },
      {
        number: 3,
        question: 'Discounted rate for registering all 6 workshops: £ __________',
        answer: '230',
        distractors: ['45', '270'],
        explanation: 'Distractor trap: Individual session is £45 (6 x 45 = 270), but full package discount is £230.',
        explanationSi: 'සම්පූර්ණ පාඨමාලාවේ වට්ටම් ගාස්තුව £230 කි.'
      }
    ]
  },
  {
    id: 'c12-l-sec1',
    section: 1,
    cambridgeSource: 'Cambridge IELTS 12, Listening Test 1 - Section 1',
    title: 'Family Excursions & River Cruise Reservation',
    audioSimText:
      'AGENT: Good morning, River Thames Sightseeing & Heritage Cruises. Can I help you arrange a day trip?\nVISITOR: Hello, yes, my family and I would like to book a weekend river cruise.\nAGENT: Certainly. Our flagship tour is the Historic Royal River Cruise sailing from Westminster Pier directly to Greenwich Maritime.\nVISITOR: How long does the cruise take one-way?\nAGENT: It is an enjoyable 45 minutes on the water, featuring an informative live audio commentary by our licensed skippers.\nVISITOR: Superb. How much are the tickets for two adults and one child?\nAGENT: Adult tickets are £18 each, and the child concession ticket for ages 5 to 15 is £9.\nVISITOR: That is very reasonable. Is lunch included or can we bring a picnic?\nAGENT: Refreshments like hot coffee and pastries are available on board, but you are also very welcome to bring your own packed lunch.',
    questions: [
      {
        number: 1,
        question: 'Cruise destination from Westminster Pier: maritime __________',
        answer: 'Greenwich',
        distractors: ['Richmond', 'Windsor'],
        explanation: 'The agent states: "sailing from Westminster Pier directly to Greenwich Maritime".',
        explanationSi: 'ගමනාන්තය "Greenwich" වේ.'
      },
      {
        number: 2,
        question: 'Duration of the river cruise one-way: __________ minutes',
        answer: '45',
        distractors: ['60', '30'],
        explanation: 'Confirmed time: "an enjoyable 45 minutes on the water".',
        explanationSi: 'ගමන් කාලය මිනිත්තු 45 කි.'
      },
      {
        number: 3,
        question: 'Price of one adult ticket: £ __________',
        answer: '18',
        distractors: ['9', '27'],
        explanation: 'Adult ticket is £18 (distractor: child ticket is £9).',
        explanationSi: 'වැඩිහිටි ප්‍රවේශපත්‍රයක මිල £18 කි.'
      }
    ]
  }
];
