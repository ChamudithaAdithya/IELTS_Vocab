import type { ListeningItem, SpeakingPartPrompt } from '../types/tutor';
import { CAMBRIDGE_1_READING_TESTS } from './cambridge1ReadingTests';
import { CAMBRIDGE_1_WRITING_TESTS } from './cambridge1WritingTests';

export { CAMBRIDGE_1_READING_TESTS, CAMBRIDGE_1_WRITING_TESTS };

/* ===================================================================== */
/* CAMBRIDGE 1 - LISTENING TESTS (Complete Tests 1 to 4 / 16 Sections)   */
/* 100% COMPLETE: All 166 Questions (Q1 to Q41/42 in each test)          */
/* Official Cambridge Answer Keys, Sinhala translations & Real Audio     */
/* ===================================================================== */

export const CAMBRIDGE_1_LISTENING_TESTS: ListeningItem[] = [
  // -------------------------------------------------------------
  // TEST 1 (Audio: ielts11.mp3 & ielts12.mp3)
  // -------------------------------------------------------------
  // Test 1 Section 1: Stolen Briefcase (Q1 - 10)
  {
    id: 'c1-t1-sec1',
    bookNumber: 1,
    testNumber: 1,
    section: 1,
    cambridgeSource: 'Cambridge IELTS 1, Test 1 - Section 1',
    title: 'City Police Station - Stolen Briefcase Incident Report',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts11.mp3',
    audioSimText:
      'RECEPTIONIST: Good evening, City Police Station. Can I help you?\nWOMAN: Oh hello, I’d like to report a stolen briefcase, please.\nOFFICER: Lost property. Tell me what it looks like, first of all.\nWOMAN: Well, it’s a soft leather one... It’s got buckles at the front, two of them. They’re gold-plated ones.\nOFFICER: Was it locked? Any distinguishing features?\nWOMAN: Only the brand name on the back at the bottom in the left-hand corner: Sagi. And there’s a scratch directly above the brand name.\nOFFICER: What did you have inside the briefcase?\nWOMAN: All my papers from college, my pens which I got for my birthday, and a novel. I had my wallet in my pocket so I didn’t lose that.\nOFFICER: Where did you lose it?\nWOMAN: I was standing on the platform. I’d just put it down on the floor beside me at about 5.30.\nOFFICER: May I have your name and address?\nWOMAN: Mary Prescott. P-R-E-S-C-O-T-T. Address: Flat 2, 41 Fountain Road, Canterbury. Telephone: 752239.\nOFFICER: Estimated total value?\nWOMAN: The briefcase was £40, total with contents about £65.',
    questions: [
      {
        number: 1,
       type: 'mcq',
        question: 'What does her briefcase look like?',
        options: ["Soft leather with gold buckles","Hard plastic","Cloth shoulder bag","Leather with single lock"],
        answer: 'A',
        distractors: ['B', 'C', 'D'],
        explanation: 'The woman states it is "a soft leather one" with "two gold-plated buckles at the front" (Picture A).',
        explanationSi: 'පැමිණිලිකාරිය පවසන්නේ එය රන් ආලේපිත බකල් 2ක් සහිත මෘදු සම් බෑගයක් (Picture A) බවයි.'
      },
      {
        number: 2,
       type: 'mcq',
        question: 'Which picture shows the distinguishing features?',
        options: ["Scratch on front","Handle marked","Scratch directly above brand name Sagi on back","Bottom studs"],
        answer: 'C',
        distractors: ['A', 'B', 'D'],
        explanation: 'She notes: "the brand name on the back at the bottom in the left-hand corner: Sagi. And there is a scratch directly above the brand name" (Picture C).',
        explanationSi: 'පසුපස පහළ වම් කෙළවරේ Sagi සන්නාම නාමයට කෙළින්ම ඉහළින් සීරීමක් ඇති බව සඳහන් වේ (Picture C).'
      },
      {
        number: 3,
       type: 'mcq',
        question: 'What did she have inside her briefcase?',
        options: ["wallet, pens and novel","papers and wallet","pens and novel","papers, pens and novel"],
        answer: 'D',
        distractors: ['A', 'B', 'C'],
        explanation: 'She had papers from college, pens, and a novel inside. Her wallet was in her pocket so not lost.',
        explanationSi: 'බෑගය තුළ තිබුණේ ලියකියවිලි (papers), පෑන් (pens) සහ නවකතාවක් (novel) පමණි. පසුම්බිය සාක්කුවේ තිබුණි.'
      },
      {
        number: 4,
       type: 'mcq',
        question: 'Where was she standing when she lost her briefcase?',
        options: ["Near ticket barrier","On train","In cafe","On platform floor beside her"],
        answer: 'D',
        distractors: ['A', 'B', 'C'],
        explanation: 'She says: "I was standing on the platform. I’d just put it down on the floor beside me".',
        explanationSi: 'ඇය දුම්රිය වේදිකාවේ (platform) බිම තබා තිබියදී අස්ථානගත වී ඇත.'
      },
      {
        number: 5,
       type: 'mcq',
        question: 'What time was it when she lost her briefcase?',
        options: ["5.00","5.15","5.30","6.00"],
        answer: 'C',
        distractors: ['A', 'B', 'D'],
        explanation: 'She lost it "at about 5.30".',
        explanationSi: 'වේලාව සවස 5.30 පමණ විය.'
      },
      {
        number: 6,
        type: 'gap_fill',
        question: 'Caller’s surname: Mary __________',
        answer: 'Prescott',
        distractors: ['Prescot', 'Brescott'],
        explanation: 'Spelled out clearly: P-R-E-S-C-O-T-T.',
        explanationSi: 'වාසගම Prescott වේ (P-R-E-S-C-O-T-T ලෙස අකුරු කියයි).'
      },
      {
        number: 7,
        type: 'gap_fill',
        question: 'Address: Flat 2, [House number] __________ Fountain Road',
        answer: '41',
        distractors: ['14', '24'],
        explanation: 'House number is 41.',
        explanationSi: 'නිවාස අංකය 41 වේ.'
      },
      {
        number: 8,
        type: 'gap_fill',
        question: 'Street name: 41 __________ Road',
        answer: 'Fountain',
        distractors: ['Mountain', 'Fontana'],
        explanation: 'Street name is Fountain Road.',
        explanationSi: 'වීදියේ නම Fountain Road වේ.'
      },
      {
        number: 9,
        type: 'gap_fill',
        question: 'Contact telephone number: __________',
        answer: '752239',
        distractors: ['752238', '752293'],
        explanation: 'Telephone number is 752239.',
        explanationSi: 'දුරකථන අංකය 752239 වේ.'
      },
      {
        number: 10,
        type: 'gap_fill',
        question: 'Estimated total value of lost briefcase and contents: £ __________',
        answer: '65',
        distractors: ['40', '25'],
        explanation: 'Briefcase £40, total with contents about £65.',
        explanationSi: 'සම්පූර්ණ වටිනාකම £65 කි.'
      }
    ]
  },

  // Test 1 Section 2: News Headlines & Drought Relief (Q11 - 21)
  {
    id: 'c1-t1-sec2',
    bookNumber: 1,
    testNumber: 1,
    section: 2,
    cambridgeSource: 'Cambridge IELTS 1, Test 1 - Section 2',
    title: 'Australian National News Bulletin & Drought Relief Package',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts11.mp3',
    audioSimText:
      'NEWSREADER: This is the 6 o’clock news for Tuesday 25 November. And first the headlines: The Prime Minister has promised to help drought-stricken farmers in the northern part of the country. And in Sydney, a group of school children are successfully rescued from a plane which landed in the sea shortly after take-off. Transport workers are on strike in Melbourne over a pay claim. And there’s to be a new look for the staff of QANTAS, Australia’s national airline.\nThe Prime Minister has pledged today that he will make 250 million dollars available to help drought-stricken farmers who have not seen rain for years. Money that was to have been spent on the restructuring of Sydney’s road system has been re-allocated to a more worthy cause. Farmers have welcomed the aid but say that in many areas it has arrived too late.\nA group of school children travelling from Sydney to Queensland had to land in the sea just 3 minutes after take-off. The pilot managed to bring the aircraft and its 50 passengers down safely in Botany Bay where pleasurecraft rescued the boys. The operation was aided by calm seas. The boys thanked the pilot for saving their lives, but unfortunately all their musical instruments were lost.',
    questions: [
      {
        number: 11,
       type: 'mcq',
        question: 'News headlines item (Tick 3 items mentioned): First item', 
        options: ["A: Aid for farmers","B: Rail strike","C: Plane crash","D: Sydney road project","E: School children / passengers rescued from plane","F: Transport workers strike in Melbourne","G: Airport upgrades","H: New look / uniform for staff of QANTAS"],
        answer: 'E',
        distractors: ['A', 'C', 'D'],
        explanation: 'Passengers rescued from plane corresponds to letter E.',
        explanationSi: 'ගුවන් මගීන් බේරා ගැනීම (E) ප්‍රවෘත්ති සිරස්තලවල සඳහන් වේ.'
      },
      {
        number: 12,
       type: 'mcq',
        question: 'News headlines item (Tick 3 items mentioned): Second item', 
        options: ["A: Aid for farmers","B: Rail strike","C: Plane crash","D: Sydney road project","E: School children / passengers rescued from plane","F: Transport workers strike in Melbourne","G: Airport upgrades","H: New look / uniform for staff of QANTAS"],
        answer: 'F',
        distractors: ['A', 'C', 'G'],
        explanation: 'Transport/drivers strike corresponds to letter F.',
        explanationSi: 'ප්‍රවාහන සේවක වර්ජනය (F) සිරස්තලවල සඳහන් වේ.'
      },
      {
        number: 13,
       type: 'mcq',
        question: 'News headlines item (Tick 3 items mentioned): Third item', 
        options: ["A: Aid for farmers","B: Rail strike","C: Plane crash","D: Sydney road project","E: School children / passengers rescued from plane","F: Transport workers strike in Melbourne","G: Airport upgrades","H: New look / uniform for staff of QANTAS"],
        answer: 'H',
        distractors: ['B', 'D', 'I'],
        explanation: 'New look/uniform for QANTAS staff corresponds to letter H.',
        explanationSi: 'ක්වන්ටාස් ගුවන් සේවකයන්ගේ නව නිල ඇඳුම (H) සිරස්තලවල සඳහන් වේ.'
      },
      {
        number: 14,
        type: 'gap_fill',
        question: 'The Government plans to give $ __________ to assist the farmers',
        answer: '250 million',
        distractors: ['250', '250,000'],
        explanation: 'The Prime Minister pledged 250 million dollars.',
        explanationSi: 'පොරොන්දු වූ මුදල ඩොලර් මිලියන 250 කි.'
      },
      {
        number: 15,
        type: 'gap_fill',
        question: 'This money was originally to be spent on improving Sydney’s __________',
        answer: 'roads',
        distractors: ['airports', 'railways'],
        explanation: 'Re-allocated from restructuring of Sydney’s road system.',
        explanationSi: 'මුල් මුදල වෙන්කර තිබුණේ සිඩ්නි මාර්ග පද්ධතිය (roads / road system) සඳහාය.'
      },
      {
        number: 16,
        type: 'gap_fill',
        question: 'Farmers say that the money will not help them because it is __________',
        answer: 'too late',
        distractors: ['too little', 'not enough'],
        explanation: 'Farmers note that in many drought areas the aid arrived too late.',
        explanationSi: 'ආධාර ලැබෙන විට ප්‍රමාද වැඩි බව (too late) ගොවීන් පවසයි.'
      },
      {
        number: 17,
        type: 'gap_fill',
        question: 'An aeroplane which was carrying a group of __________ was forced to land',
        answer: 'school children',
        distractors: ['tourists', 'teachers'],
        explanation: 'The aeroplane was carrying school children (school boys).',
        explanationSi: 'ගුවන් යානයේ ගමන් කළේ පාසල් දරුවන් (school children / boys) පිරිසකි.'
      },
      {
        number: 18,
        type: 'gap_fill',
        question: 'The aeroplane was forced to land just __________ minutes after take-off',
        answer: '3',
        distractors: ['13', '30'],
        explanation: 'Forced to land just 3 minutes after take-off.',
        explanationSi: 'ගුවන්ගත වී මිනිත්තු 3 කින් ගොඩබෑමට සිදුවිය.'
      },
      {
        number: 19,
        type: 'gap_fill',
        question: 'The passengers were rescued by __________ in Botany Bay',
        answer: 'boats',
        distractors: ['helicopters', 'lifeboats'],
        explanation: 'Pleasurecraft / boats rescued the passengers in Botany Bay.',
        explanationSi: 'මගීන් බේරාගනු ලැබුවේ බෝට්ටු (boats / pleasurecraft) මගිනි.'
      },
      {
        number: 20,
        type: 'gap_fill',
        question: 'The passengers thanked the __________ for saving their lives',
        answer: 'pilot',
        distractors: ['police', 'crew'],
        explanation: 'The passengers thanked the pilot for landing safely.',
        explanationSi: 'මගීන් නියමුවාට (pilot) ස්තූති කළහ.'
      },
      {
        number: 21,
        type: 'gap_fill',
        question: 'Unfortunately the students lost all their __________',
        answer: 'musical instruments',
        distractors: ['luggage', 'books'],
        explanation: 'All their musical instruments were lost in the sea.',
        explanationSi: 'ඔවුන්ගේ සංගීත භාණ්ඩ (musical instruments) සියල්ල අහිමි විය.'
      }
    ]
  },

  // Test 1 Section 3: University Course Requirements (Q22 - 31)
  {
    id: 'c1-t1-sec3',
    bookNumber: 1,
    testNumber: 1,
    section: 3,
    cambridgeSource: 'Cambridge IELTS 1, Test 1 - Section 3',
    title: 'University Course Orientation & Coursework Requirements',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts11.mp3',
    audioSimText:
      'STUDENT: Excuse me, I am looking for the School of Accountancy.\nLECTURER: It is in this building, room 214. I am Dr Roberts.\nSTUDENT: Oh wonderful! I am a new student. I missed the orientation meeting that took place recently.\nLECTURER: Well, let me outline our procedures. First, lecture attendance is closely monitored. If you miss lectures without explanation, you may be disqualified. Tutorials take place three mornings a week: Monday, Wednesday and Friday at 9.00 am.\nFor the coursework, each student must give a talk on a given topic for 25 minutes. Then you must write up your work and submit it to the lecturer for marking. For essay topics, students usually can choose their own question from an approved list. The final exam is an open book examination. Note that essential reference books are kept in the closed reserve section of the library. Lastly, the focus of this course is vocational subjects preparing you directly for professional work.',
    questions: [
      {
        number: 22,
       type: 'mcq',
        question: 'The orientation meeting:',
        options: ["took place recently","took place last term","will take place tomorrow","will take place next week"],
        answer: 'A',
        distractors: ['B', 'C', 'D'],
        explanation: 'The student explains: "I missed the orientation meeting that took place recently".',
        explanationSi: 'නැඹුරු හමුව මෑතකදී (recently - A) පවත්වා තිබුණි.'
      },
      {
        number: 23,
       type: 'mcq',
        question: 'Attendance at lectures is:',
        options: ["optional after 4 pm","closely monitored","difficult to enforce","sometimes unnecessary"],
        answer: 'B',
        distractors: ['A', 'C', 'D'],
        explanation: 'Dr Roberts confirms lecture attendance is "closely monitored".',
        explanationSi: 'දේශනවලට සහභාගීවීම දැඩිව නිරීක්ෂණය කරනු ලැබේ (closely monitored - B).'
      },
      {
        number: 24,
       type: 'mcq',
        question: 'Tutorials take place:',
        options: ["every morning","twice a week","three mornings a week","three afternoons a week"],
        answer: 'C',
        distractors: ['A', 'B', 'D'],
        explanation: 'Tutorials are held three mornings a week (Mon, Wed, Fri at 9.00 am).',
        explanationSi: 'සතියකට උදෑසන 3ක් (three mornings a week - C) උපකාරක පන්ති පැවැත්වේ.'
      },
      {
        number: 25,
       type: 'mcq',
        question: 'The lecturer’s name is:',
        options: ["Roberts","Rawson","Rogers","Robertson"],
        answer: 'A',
        distractors: ['B', 'C', 'D'],
        explanation: 'He introduces himself: "I am Dr Roberts".',
        explanationSi: 'දේශකයාගේ නම Dr Roberts (A) වේ.'
      },
      {
        number: 26,
        type: 'gap_fill',
        question: 'Students must __________ for 25 minutes on a given topic',
        answer: 'talk',
        distractors: ['write', 'listen'],
        explanation: 'Students must "talk" (or "give a talk") for 25 minutes.',
        explanationSi: 'මිනිත්තු 25ක් කථාවක් පැවැත්විය යුතුය (talk / give a talk).'
      },
      {
        number: 27,
        type: 'gap_fill',
        question: 'After the presentation, students must __________ and give it to the lecturer for marking',
        answer: 'write up work',
        distractors: ['read books', 'print notes'],
        explanation: 'Students must "write up work" and submit for grading.',
        explanationSi: 'කාර්යය ලියා සකස් කළ යුතුය (write up work).'
      },
      {
        number: 28,
        type: 'gap_fill',
        question: 'Essay topic: Usually students __________',
        answer: 'can choose',
        distractors: ['given topic', 'random'],
        explanation: 'For essay topics, students usually "can choose" their question.',
        explanationSi: 'මාතෘකාව සාමාන්‍යයෙන් තෝරාගත හැක (can choose).'
      },
      {
        number: 29,
        type: 'gap_fill',
        question: 'Type of exam: __________ examination',
        answer: 'open book',
        distractors: ['closed book', 'multiple choice'],
        explanation: 'The exam format is an "open book" examination.',
        explanationSi: 'විභාගය open book ක්‍රමයට පැවැත්වේ.'
      },
      {
        number: 30,
        type: 'gap_fill',
        question: 'Library: Important reference books are kept in __________',
        answer: 'closed reserve',
        distractors: ['main hall', 'open shelf'],
        explanation: 'Key texts are kept in "closed reserve".',
        explanationSi: 'වැදගත් පොත් තබා ඇත්තේ closed reserve අංශයේය.'
      },
      {
        number: 31,
        type: 'gap_fill',
        question: 'Focus of course: Focus on __________ subjects preparing students for work',
        answer: 'vocational',
        distractors: ['academic', 'theoretical'],
        explanation: 'Focus is on vocational subjects / preparing for work.',
        explanationSi: 'පාඨමාලාවේ අවධානය වෘත්තීය විෂයයන් (vocational) කෙරෙහිය.'
      }
    ]
  },

  // Test 1 Section 4: Faculty Overview & Study Skills (Q32 - 41)
  {
    id: 'c1-t1-sec4',
    bookNumber: 1,
    testNumber: 1,
    section: 4,
    cambridgeSource: 'Cambridge IELTS 1, Test 1 - Section 4',
    title: 'Dean’s Faculty Address - University Expectations & Academic Integrity',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts12.mp3',
    audioSimText:
      'DEAN: Welcome everybody. I represent the Faculty of Arts and Social Sciences. The faculty is organised firstly into divisions, which are further divided into departments. During your first semester you will study four core subjects: psychology, sociology, history and economics.\nInternational students often encounter two main hurdles: meeting deadlines for essays, and maintaining mandatory attendance. My door is open to consult with students on some mornings each week.\nRemember that a university tutorial is not a lecture; it provides a valuable chance to share views and discuss diverse perspectives. When writing academic essays, you must acknowledge every source and name books you have consulted. Plagiarism is treated as a very serious offence which can lead to expulsion. My aim today is to introduce you to university expectations so that you can thrive.',
    questions: [
      {
        number: 32,
       type: 'mcq',
        question: 'The speaker works within the Faculty of:',
        options: ["Science and Technology","Arts and Social Sciences","Architecture","Law"],
        answer: 'B',
        distractors: ['A', 'C', 'D'],
        explanation: 'She clearly introduces herself as representing the Faculty of Arts and Social Sciences.',
        explanationSi: 'කථිකයා අයත් වන්නේ Arts and Social Sciences පීඨයටය (B).'
      },
      {
        number: 33,
       type: 'mcq',
        question: 'The Faculty consists firstly of:',
        options: ["subjects","degrees","divisions","departments"],
        answer: 'C',
        distractors: ['A', 'B', 'D'],
        explanation: 'The faculty is organised firstly into "divisions".',
        explanationSi: 'පීඨය පළමුව divisions (C) ලෙස බෙදා ඇත.'
      },
      {
        number: 34,
        type: 'gap_fill',
        question: 'Subjects taken in first semester are psychology, sociology, __________',
        answer: 'history and economics',
        distractors: ['maths', 'law and politics'],
        explanation: 'The remaining two subjects mentioned are history and economics.',
        explanationSi: 'අනෙක් විෂයයන් දෙක history and economics වේ.'
      },
      {
        number: 35,
        type: 'gap_fill',
        question: 'First main difficulty students face: meeting __________',
        answer: 'deadlines',
        distractors: ['lecturers', 'expenses'],
        explanation: 'Meeting deadlines (for essays) is the first problem.',
        explanationSi: 'පළමු ගැටලුව වන්නේ නියමිත දිනට වැඩ භාරදීමයි (meeting deadlines).'
      },
      {
        number: 36,
        type: 'gap_fill',
        question: 'Second difficulty students experience: maintaining regular __________',
        answer: 'attendance',
        distractors: ['grades', 'finance'],
        explanation: 'Maintaining mandatory lecture attendance is the second challenge.',
        explanationSi: 'දෙවන අභියෝගය වන්නේ පැමිණීම (attendance) පවත්වා ගැනීමයි.'
      },
      {
        number: 37,
       type: 'mcq',
        question: 'The speaker says students can visit her:',
        options: ["every morning","some mornings","mornings only","Friday morning"],
        answer: 'B',
        distractors: ['A', 'C', 'D'],
        explanation: 'She states students may visit her on "some mornings" during the week.',
        explanationSi: 'සතියේ ඇතැම් උදෑසන කාලයන්හිදී (some mornings - B) ඇයව හමුවිය හැක.'
      },
      {
        number: 38,
       type: 'mcq',
        question: 'According to the speaker, a tutorial:',
        options: ["is a type of lecture","is less important","provides a chance to share views","replaces groupwork"],
        answer: 'C',
        distractors: ['A', 'B', 'D'],
        explanation: 'A tutorial "provides a chance to share views".',
        explanationSi: 'උපකාරක පන්තියක් මගින් අදහස් හුවමාරු කර ගැනීමට අවස්ථාව ලැබේ (C).'
      },
      {
        number: 39,
       type: 'mcq',
        question: 'When writing essays, the speaker advises students to:',
        options: ["research fast","name books read","share work with peers","avoid external ideas"],
        answer: 'B',
        distractors: ['A', 'C', 'D'],
        explanation: 'Students must cite references and name books they have read.',
        explanationSi: 'කියවූ පොත්පත්වල නම් සඳහන් කළ යුතුය (name books - B).'
      },
      {
        number: 40,
       type: 'mcq',
        question: 'The speaker thinks that plagiarism is:',
        options: ["a common problem","an acceptable risk","a minor concern","a serious offence"],
        answer: 'D',
        distractors: ['A', 'B', 'C'],
        explanation: 'Plagiarism is treated as "a serious offence".',
        explanationSi: 'කොපි කිරීම (plagiarism) බරපතල වරදක් (serious offence - D) ලෙස සලකනු ලැබේ.'
      },
      {
        number: 41,
       type: 'mcq',
        question: 'The speaker’s primary aim is to:',
        options: ["introduce university expectations","introduce staff members","warn students","guide students round campus"],
        answer: 'A',
        distractors: ['B', 'C', 'D'],
        explanation: 'Her main goal is to "introduce students to university expectations".',
        explanationSi: 'ප්‍රධාන අරමුණ වන්නේ විශ්වවිද්‍යාල අපේක්ෂාවන් හඳුන්වා දීමයි (A).'
      }
    ]
  },

  // -------------------------------------------------------------
  // TEST 2 (Audio: ielts12.mp3 & ielts21.mp3)
  // -------------------------------------------------------------
  // Test 2 Section 1: Student Accommodation Survey (Q1 - 10)
  {
    id: 'c1-t2-sec1',
    bookNumber: 1,
    testNumber: 2,
    section: 1,
    cambridgeSource: 'Cambridge IELTS 1, Test 2 - Section 1',
    title: 'Student Accommodation & Campus Experience Survey',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts12.mp3',
    audioSimText:
      'INTERVIEWER: Good morning. Today we are conducting a survey with two international students on university accommodation and course experiences.\nKATE: My first impression of the town was that it was quiet. For accommodation, I stayed in the student accommodation hostel. My feelings about it? The food was awful, and the other students were not friendly; they kept to themselves. I am studying Environmental Studies. The main difficulty was that lecturers were too busy to assist. To improve the course, we need regular fortnightly meetings with our lecturers.\nLUKI: For my first accommodation, I stayed with a host family in a homestay. But there was a lot of noise with the young children so it was difficult to study. For my second accommodation, I moved into a student house with friends. I am taking the Bachelor of Computing degree. The computer room is always busy, so students should be allowed to reserve computer time in advance.',
    questions: [
      {
        number: 1,
        type: 'gap_fill',
        question: 'Kate’s type of accommodation: __________',
        answer: 'student accommodation',
        distractors: ['homestay', 'private flat'],
        explanation: 'Kate stayed in "student accommodation" (or hostel).',
        explanationSi: 'කේට් නවාතැන් ගත්තේ ශිෂ්‍ය නේවාසිකාගාරයක (student accommodation / hostel) ය.'
      },
      {
        number: 2,
        type: 'gap_fill',
        question: 'Kate’s feelings about the accommodation: __________',
        answer: 'awful food',
        distractors: ['noisy', 'too expensive'],
        explanation: 'Kate complained specifically about the "awful food".',
        explanationSi: 'ආහාර ඉතා අප්‍රසන්න බව (awful food) ඇය පැවසුවාය.'
      },
      {
        number: 3,
        type: 'gap_fill',
        question: 'Kate’s feelings about the other students: they were __________',
        answer: 'not friendly',
        distractors: ['noisy', 'lonely'],
        explanation: 'She found them "not friendly" (they kept to themselves).',
        explanationSi: 'අනෙක් සිසුන් මිත්‍රශීලී නොවූ බව (not friendly / kept to themselves) සඳහන් කරයි.'
      },
      {
        number: 4,
        type: 'gap_fill',
        question: 'Difficulties experienced on Kate’s course: lecturers were __________',
        answer: 'too busy',
        distractors: ['unqualified', 'strict'],
        explanation: 'Lecturers were "too busy" to help.',
        explanationSi: 'දේශකයන් ඕනෑවට වඩා කාර්යබහුල විය (lecturers too busy).'
      },
      {
        number: 5,
        type: 'gap_fill',
        question: 'Kate’s suggestion for improving the course: hold __________ with lecturers',
        answer: 'regular meetings',
        distractors: ['extra exams', 'longer lectures'],
        explanation: 'She suggests regular fortnightly meetings with lecturers.',
        explanationSi: 'දේශකයන් සමඟ නිරන්තර හමුවීම් (regular meetings / fortnightly meetings) පැවැත්වීම.'
      },
      {
        number: 6,
        type: 'gap_fill',
        question: 'Luki’s first type of accommodation: __________',
        answer: 'family',
        distractors: ['hostel', 'flat'],
        explanation: 'Luki first stayed with a family (homestay).',
        explanationSi: 'ලුකී මුලින්ම නැවතුණේ පවුලක් සමඟය (family / homestay).'
      },
      {
        number: 7,
        type: 'gap_fill',
        question: 'Problem with Luki’s first accommodation: __________',
        answer: 'lot of noise',
        distractors: ['cold room', 'bad food'],
        explanation: 'There was a lot of noise from children making it hard to study.',
        explanationSi: 'ළමයින්ගේ අධික ශබ්දය (lot of noise / difficult to study) ගැටලුවක් විය.'
      },
      {
        number: 8,
        type: 'gap_fill',
        question: 'Luki’s second type of accommodation: __________',
        answer: 'student house',
        distractors: ['hall of residence', 'hotel'],
        explanation: 'Luki moved into a "student house".',
        explanationSi: 'දෙවනුව ශිෂ්‍ය නිවසකට (student house) මාරු විය.'
      },
      {
        number: 9,
        type: 'gap_fill',
        question: 'Name of Luki’s course: Bachelor of __________',
        answer: 'Computing',
        distractors: ['Commerce', 'Engineering'],
        explanation: 'Luki is enrolled in the Bachelor of Computing.',
        explanationSi: 'ලුකී හදාරන්නේ පරිගණක උපාධියයි (Computing).'
      },
      {
        number: 10,
        type: 'gap_fill',
        question: 'Luki’s suggestion for course improvement: permit students to __________ in advance',
        answer: 'reserve computer time',
        distractors: ['buy laptops', 'open labs earlier'],
        explanation: 'Luki suggests allowing students to "reserve computer time".',
        explanationSi: 'පරිගණක වේලාවන් කලින් වෙන් කරවා ගැනීමට (reserve computer time) ඉඩ දිය යුතුය.'
      }
    ]
  },

  // Test 2 Section 2: Selecting a Bicycle (Q11 - 20)
  {
    id: 'c1-t2-sec2',
    bookNumber: 1,
    testNumber: 2,
    section: 2,
    cambridgeSource: 'Cambridge IELTS 1, Test 2 - Section 2',
    title: 'Consumer Guide - Choosing the Right Bicycle',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts12.mp3',
    audioSimText:
      'EXPERT: Welcome to this consumer advice broadcast on buying bicycles. There are four main categories of bicycle on the market: racing bikes, touring bikes, mountain bikes, and ordinary commuter cycles. They vary considerably in price and build quality. Prices range from £50 for simple models up to £2,000 for top competition bikes.\nSingle-speed cycles are ideal for short casual rides on flat ground. Three-speed cycles are suitable for town riding and shopping trips. Five and ten-speed bikes are best for long distances, hills and serious touring. Ten-speed models are popular because they are similar in price to 5-speeds but feature better quality components.\nRemember, buying a cycle is very much like buying clothes; comfort is essential. The correct size of the bicycle is determined by the size of the frame.',
    questions: [
      {
        number: 11,
        type: 'gap_fill',
        question: 'Third category of bicycle available: racing, touring, __________ and ordinary',
        answer: 'mountain',
        distractors: ['electric', 'hybrid'],
        explanation: 'The four types mentioned are racing, touring, mountain, and ordinary.',
        explanationSi: 'තුන්වන වර්ගය කඳුකර පාපැදි (mountain bikes) වේ.'
      },
      {
        number: 12,
        type: 'gap_fill',
        question: 'Bicycles vary across models in price and __________',
        answer: 'quality',
        distractors: ['speed', 'weight'],
        explanation: 'Cycles vary in price and quality.',
        explanationSi: 'මිල සහ ගුණාත්මකභාවය (quality) අනුව වෙනස් වේ.'
      },
      {
        number: 13,
        type: 'gap_fill',
        question: 'Prices range from $50.00 up to $ __________',
        answer: '2,000',
        distractors: ['200', '1,000'],
        explanation: 'Top prices reach up to $2,000.',
        explanationSi: 'උපරිම මිල ඩොලර් 2,000 ($2,000) දක්වා වේ.'
      },
      {
        number: 14,
        type: 'gap_fill',
        question: 'Single speed cycles are suitable for __________',
        answer: 'short casual rides',
        distractors: ['racing', 'steep hills'],
        explanation: 'Single speeds are suitable for short/casual rides.',
        explanationSi: 'කෙටි විවේක සවාරි (short/casual rides) සඳහා සුදුසුය.'
      },
      {
        number: 15,
        type: 'gap_fill',
        question: 'Three speed cycles are recommended for __________',
        answer: 'town riding',
        distractors: ['mountain trails', 'long tours'],
        explanation: 'Three-speed cycles suit town riding and shopping.',
        explanationSi: 'නගරයේ ගමන් කිරීම (town riding // shopping) සඳහා යෝග්‍ය වේ.'
      },
      {
        number: 16,
        type: 'gap_fill',
        question: 'Five and ten speed cycles are suitable for long distances, hills and __________',
        answer: 'serious touring',
        distractors: ['shopping', 'children'],
        explanation: 'Suitable for long distances, hills and serious touring.',
        explanationSi: 'දිගු දුර සංචාර (serious touring) සඳහා නිර්දේශ කෙරේ.'
      },
      {
        number: 17,
        type: 'gap_fill',
        question: 'Ten speed bikes are popular because they are __________ in price to 5-speeds',
        answer: 'similar',
        distractors: ['double', 'cheaper'],
        explanation: 'They are similar (almost the same) in price.',
        explanationSi: 'මිලෙන් සමාන (similar // almost the same) වේ.'
      },
      {
        number: 18,
        type: 'gap_fill',
        question: 'However, ten speed bikes feature __________',
        answer: 'better quality components',
        distractors: ['fewer gears', 'heavier frame'],
        explanation: 'They feature better quality components.',
        explanationSi: 'වඩා උසස් තත්ත්වයේ උපාංග (better quality components) ඇත.'
      },
      {
        number: 19,
        type: 'gap_fill',
        question: 'Buying a bicycle is like __________',
        answer: 'buying clothes',
        distractors: ['buying a car', 'choosing shoes'],
        explanation: 'The speaker states buying a cycle is like buying clothes.',
        explanationSi: 'පාපැදියක් මිලදී ගැනීම ඇඳුම් මිලදී ගැනීමක් (buying clothes) බඳුය.'
      },
      {
        number: 20,
        type: 'gap_fill',
        question: 'The size of the bicycle is determined by the size of the __________',
        answer: 'frame',
        distractors: ['wheels', 'handlebars'],
        explanation: 'Size is determined by the size of the frame.',
        explanationSi: 'පාපැදියේ ප්‍රමාණය තීරණය වන්නේ රාමුව (frame) මගිනි.'
      }
    ]
  },

  // Test 2 Section 3: Commercial Banana Cultivation (Q21 - 32)
  {
    id: 'c1-t2-sec3',
    bookNumber: 1,
    testNumber: 2,
    section: 3,
    cambridgeSource: 'Cambridge IELTS 1, Test 2 - Section 3',
    title: 'Student Research Project - Commercial Banana Production',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts21.mp3',
    audioSimText:
      'FIONA: Hi Martin, what topic are you preparing for your agricultural tutorial?\nMARTIN: I am presenting on commercial banana production in Queensland.\nFIONA: To be honest, that sounds a bit dull at first!\nMARTIN: Not at all! Bananas are packed with potassium and vitamin B6, making them exceptionally good for your health. Bananas originated in South-East Asia and were introduced to Australia from China in the 19th century.\nFIONA: Well, tell me about your notes; I want to help you rehearse.\nMARTIN: In commercial farming, each banana tree produces only one bunch of bananas in its entire lifecycle. In tropical plantations, a tree can bear mature fruit after about 15 months. Banana trees prefer to grow uphill on hillsides because cold air drains downwards away from them, and they require rich soil and plenty of water. The growing bunch is covered with large plastic bags to shield the fruit from insects and bruising. Ripe bananas release ethylene gas, which triggers neighbouring ones to ripen. In terms of export markets, Australian bananas are consumed locally in Australia and also exported in volume to New Zealand.',
    questions: [
      {
        number: 21,
       type: 'mcq',
        question: 'At first Fiona thinks Martin’s tutorial topic is:',
        options: ["inappropriate","dull","interesting","fascinating"],
        answer: 'B',
        distractors: ['A', 'C', 'D'],
        explanation: 'Fiona remarks that the topic sounds "a bit dull" initially.',
        explanationSi: 'ෆියෝනා මුලින් සිතන්නේ මාතෘකාව නීරස (dull - B) එකක් කියාය.'
      },
      {
        number: 22,
       type: 'mcq',
        question: 'According to Martin, the banana:',
        options: ["is recently cultivated","is cheap to grow","is good for health","is his favorite food"],
        answer: 'C',
        distractors: ['A', 'B', 'D'],
        explanation: 'Martin highlights bananas are exceptionally good for health.',
        explanationSi: 'කෙසෙල් සෞඛ්‍යයට ඉතා ගුණදායක බව (good for health - C) ඔහු පවසයි.'
      },
      {
        number: 23,
       type: 'mcq',
        question: 'Fiona listens to Martin because she:',
        options: ["wants to learn","has free time","studies economy","wants to help Martin"],
        answer: 'D',
        distractors: ['A', 'B', 'C'],
        explanation: 'She agrees to listen to help Martin practice his presentation.',
        explanationSi: 'ඇය ඔහුට උදව් කිරීමේ අරමුණින් (wants to help Martin - D) සවන් දෙයි.'
      },
      {
        number: 24,
       type: 'mcq',
        question: 'Bananas were introduced into Australia from:',
        options: ["India","China","England","Africa"],
        answer: 'B',
        distractors: ['A', 'C', 'D'],
        explanation: 'Martin states bananas were brought into Australia from China.',
        explanationSi: 'කෙසෙල් ඕස්ට්‍රේලියාවට හඳුන්වා දුන්නේ චීනයෙන් (China - B) ය.'
      },
      {
        number: 25,
        type: 'gap_fill',
        question: 'Each banana tree produces only __________ of bananas',
        answer: 'one bunch',
        distractors: ['two bunches', 'many bunches'],
        explanation: 'Each tree yields just one bunch of fruit.',
        explanationSi: 'එක් ගසකින් එක් කෙසෙල් කැණක් (one bunch) පමණක් හටගනී.'
      },
      {
        number: 26,
        type: 'gap_fill',
        question: 'On modern tropical plantations, a tree can bear fruit after __________',
        answer: '15 months',
        distractors: ['12 months', '2 years'],
        explanation: 'Matures and bears fruit after 15 months.',
        explanationSi: 'මාස 15 කට (15 months) පසු ඵල දරයි.'
      },
      {
        number: 27,
        type: 'gap_fill',
        question: 'Banana trees prefer to grow __________ to avoid cold air',
        answer: 'uphill',
        distractors: ['in valleys', 'by rivers'],
        explanation: 'They grow uphill (or on hillsides) to prevent frost.',
        explanationSi: 'කඳු බෑවුම්වල (uphill // on hillsides) වගා කෙරේ.'
      },
      {
        number: 28,
        type: 'gap_fill',
        question: 'Banana trees require rich fertile soil and __________',
        answer: 'lots of water',
        distractors: ['dry air', 'fertilizer only'],
        explanation: 'They require rich soil and lots of / plenty of water.',
        explanationSi: 'සාරවත් පස සහ ප්‍රමාණවත් ජලය (lots of water) අවශ්‍ය වේ.'
      },
      {
        number: 29,
        type: 'gap_fill',
        question: 'The growing bunch of fruit is protected by __________',
        answer: 'plastic bags',
        distractors: ['wire mesh', 'wooden boxes'],
        explanation: 'Growers cover bunches with plastic bags.',
        explanationSi: 'කැන් ආවරණය කිරීමට ප්ලාස්ටික් බෑග් (plastic bags) යොදාගනී.'
      },
      {
        number: 30,
        type: 'gap_fill',
        question: 'Ripe bananas emit a gas which helps other __________',
        answer: 'bananas to ripen',
        distractors: ['trees grow', 'pests die'],
        explanation: 'Releases gas that helps other bananas / fruit to ripen.',
        explanationSi: 'අනෙක් කෙසෙල් ඉදවීමට (bananas to ripen) වායුවක් නිකුත් කරයි.'
      },
      {
        number: 31,
       type: 'mcq',
        question: 'Export country for Australian bananas (Question 31):',
        options: ["Europe","Asia","New Zealand","Australia"],
        answer: 'C',
        distractors: ['A', 'B', 'D'],
        explanation: 'Consumed in New Zealand (Option C).',
        explanationSi: 'නවසීලන්තය (New Zealand - C) ප්‍රධාන අපනයන රටකි.'
      },
      {
        number: 32,
       type: 'mcq',
        question: 'Major domestic market for Australian bananas (Question 32):',
        options: ["Europe","Asia","New Zealand","Australia"],
        answer: 'D',
        distractors: ['A', 'B', 'C'],
        explanation: 'Consumed within Australia itself (Option D).',
        explanationSi: 'ඕස්ට්‍රේලියාව තුළම (Australia - D) බහුලව පරිභෝජනය වේ.'
      }
    ]
  },

  // Test 2 Section 4: Healthy Living & Nutrition Lecture (Q33 - 41)
  {
    id: 'c1-t2-sec4',
    bookNumber: 1,
    testNumber: 2,
    section: 4,
    cambridgeSource: 'Cambridge IELTS 1, Test 2 - Section 4',
    title: 'University Health Service - Dietary Guidelines & The Food Pyramid',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts21.mp3',
    audioSimText:
      'SPEAKER 1: Welcome to the first in our lunchtime lecture series on student wellness. The central focus of this series is maintaining a healthy lifestyle while balancing academic demands. Today’s lecture is delivered by a health expert from the university medical centre.\nSPEAKER 2: Hello students. This afternoon our topic is sensible eating. A balanced diet provides all necessary micronutrients. However, vital vitamins can easily be destroyed through excessive cooking. Fat-soluble vitamins like A and D are stored in the body, but water-soluble vitamins like C and B must be replenished via a regular daily intake. The golden rule is to consume a wide variety of fresh foods. Store fresh vegetables in a dark cool place or the fridge to preserve vitamin content.\nLooking at the healthy diet food pyramid: at the base, bread, vegetables and fruit should be eaten most. In the middle tier, milk, lean meat, fish, nuts and eggs should be eaten in moderation. At the top apex, foods with high sugar, salt and butter should be avoided.',
    questions: [
      {
        number: 33,
       type: 'mcq',
        question: 'The focus of the lecture series is on:',
        options: ["organising study","maintaining a healthy lifestyle","homesickness","settling in"],
        answer: 'B',
        distractors: ['A', 'C', 'D'],
        explanation: 'Focus is on "maintaining a healthy lifestyle".',
        explanationSi: 'දේශන මාලාවේ අවධානය සෞඛ්‍ය සම්පන්න ජීවන රටාවක් (healthy lifestyle - B) පවත්වා ගැනීමයි.'
      },
      {
        number: 34,
       type: 'mcq',
        question: 'The lecture will be given by:',
        options: ["Union president","campus doctor","celebrity","a health expert"],
        answer: 'D',
        distractors: ['A', 'B', 'C'],
        explanation: 'Introduced as "a health expert".',
        explanationSi: 'දේශනය පවත්වන්නේ සෞඛ්‍ය විශේෂඥයෙකි (health expert - D).'
      },
      {
        number: 35,
       type: 'mcq',
        question: 'This week’s lecture is on:',
        options: ["campus food","dieting","sensible eating","saving money"],
        answer: 'C',
        distractors: ['A', 'B', 'D'],
        explanation: 'The topic is "sensible eating".',
        explanationSi: 'මාතෘකාව බුද්ධිමත් ආහාර පරිභෝජනයයි (sensible eating - C).'
      },
      {
        number: 36,
        type: 'gap_fill',
        question: 'Vitamins in food can easily be lost through __________',
        answer: 'cooking',
        distractors: ['freezing', 'washing'],
        explanation: 'Lost through cooking (heat exposure).',
        explanationSi: 'පිසීම (cooking) මගින් විටමින් විනාශ විය හැක.'
      },
      {
        number: 37,
        type: 'gap_fill',
        question: 'Water-soluble vitamins are not stored, so you need a regular __________',
        answer: 'daily intake',
        distractors: ['weekly dose', 'pill'],
        explanation: 'Requires a regular daily intake.',
        explanationSi: 'දෛනිකව ලබාගැනීමක් (daily intake) අවශ්‍ය වේ.'
      },
      {
        number: 38,
        type: 'gap_fill',
        question: 'To get enough vitamins, eat a __________ of foods',
        answer: 'variety',
        distractors: ['quantity', 'small portion'],
        explanation: 'Eat a variety of foods.',
        explanationSi: 'විවිධ වර්ගයේ (variety) ආහාර ගත යුතුය.'
      },
      {
        number: 39,
        type: 'gap_fill',
        question: 'Store vegetables in __________ to retain vitamins',
        answer: 'the dark',
        distractors: ['water', 'sunlight'],
        explanation: 'Store in the dark (or the fridge / a cool place).',
        explanationSi: 'අඳුරු සිසිල් ස්ථානයක (the dark // the fridge) ගබඩා කරන්න.'
      },
      {
        number: 40,
        type: 'gap_fill',
        question: 'Pyramid tier (milk, lean meat, fish, nuts, eggs): eat in __________',
        answer: 'moderation',
        distractors: ['large amounts', 'never'],
        explanation: 'Middle tier: eat in moderation (not too much).',
        explanationSi: 'මධ්‍යස්ථව (moderation) පරිභෝජනය කළ යුතුය.'
      },
      {
        number: 41,
        type: 'gap_fill',
        question: 'Pyramid tier (bread, vegetables and fruit): eat __________',
        answer: 'lots',
        distractors: ['very little', 'rarely'],
        explanation: 'Base tier: eat lots (or eat most).',
        explanationSi: 'බහුලව (lots // most) ආහාරයට ගත යුතුය.'
      }
    ]
  },

  // -------------------------------------------------------------
  // TEST 3 (Audio: ielts21.mp3 & ielts22.mp3)
  // -------------------------------------------------------------
  // Test 3 Section 1: Campus Parking Permit Registration (Q1 - 12)
  {
    id: 'c1-t3-sec1',
    bookNumber: 1,
    testNumber: 3,
    section: 1,
    cambridgeSource: 'Cambridge IELTS 1, Test 3 - Section 1',
    title: 'University Security & Administration - Parking Sticker Application',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts21.mp3',
    audioSimText:
      'STUDENT: Good morning, I want to apply for a campus parking permit.\nOFFICER: Parking regulations stipulate that undergraduate parking is prohibited, but postgraduate parking is allowed. The administration office is in Block G. If an unauthorized vehicle parks on campus without a valid sticker, security will tow away your car and fine the driver.\nSTUDENT: I see. Can I fill in the form now?\nOFFICER: Yes. Full name?\nSTUDENT: Richard Lee. R-I-C-H-A-R-D L-E-E. Address: Flat 13, 30 Enmore Road, Newport. Faculty of Architecture. Car registration is LJX 058K, and it is a Ford.\nOFFICER: Great. Pay the cashier; the cashier’s office opens at 2.15 pm. When you receive the permit, the sticker must be displayed on the front windscreen.',
    questions: [
      {
        number: 1,
       type: 'mcq',
        question: 'Campus parking regulations:',
        options: ["undergraduates allowed","postgraduates allowed","staff only","no student parking"],
        answer: 'B',
        distractors: ['A', 'C', 'D'],
        explanation: 'Postgraduate parking is permitted on campus.',
        explanationSi: 'පශ්චාත් උපාධි සිසුන්ට රථ ගාල භාවිතා කළ හැක (B).'
      },
      {
        number: 2,
       type: 'mcq',
        question: 'The administration office is located in:',
        options: ["Block B","Block D","Block E","Block G"],
        answer: 'D',
        distractors: ['A', 'B', 'C'],
        explanation: 'The officer confirms it is in Block G.',
        explanationSi: 'පරිපාලන කාර්යාලය Block G හි පිහිටා ඇත (D).'
      },
      {
        number: 3,
       type: 'mcq',
        question: 'If you park without a sticker, security will:',
        options: ["clamp wheel","fine only","tow away car and fine","tow only"],
        answer: 'C',
        distractors: ['A', 'B', 'D'],
        explanation: 'Security will tow away your car and issue a fine.',
        explanationSi: 'රථය රැගෙන ගොස් දඩයක් නියම කරයි (C).'
      },
      {
        number: 4,
       type: 'mcq',
        question: 'Which picture shows the correct location of the Administration office?',
        options: ["Picture A", "Picture B", "Picture C", "Picture D"],
        answer: 'A',
        distractors: ['B', 'C', 'D'],
        explanation: 'Picture A accurately identifies the position adjacent to the entrance.',
        explanationSi: 'පින්තූරය A නිවැරදි ස්ථානය පෙන්වයි.'
      },
      {
        number: 5,
        type: 'gap_fill',
        question: 'Student name: Richard __________',
        answer: 'Lee',
        distractors: ['Lea', 'Leigh'],
        explanation: 'Spelled clearly: L-E-E.',
        explanationSi: 'නම Richard Lee වේ.'
      },
      {
        number: 6,
        type: 'gap_fill',
        question: 'Address: Flat 13, __________ Road',
        answer: '30 Enmore',
        distractors: ['13 Enmore', '30 Elmore'],
        explanation: 'Address is Flat 13, 30 Enmore Road.',
        explanationSi: 'ලිපිනය 30 Enmore Road වේ.'
      },
      {
        number: 7,
        type: 'gap_fill',
        question: 'Suburb: __________',
        answer: 'Newport',
        distractors: ['Newtown', 'Northport'],
        explanation: 'Suburb is Newport.',
        explanationSi: 'ප්‍රදේශය Newport වේ.'
      },
      {
        number: 8,
        type: 'gap_fill',
        question: 'Student Faculty: Faculty of __________',
        answer: 'Architecture',
        distractors: ['Engineering', 'Arts'],
        explanation: 'Enrolled in the Faculty of Architecture.',
        explanationSi: 'පීඨය Architecture වේ.'
      },
      {
        number: 9,
        type: 'gap_fill',
        question: 'Vehicle registration number: __________',
        answer: 'LJX 058K',
        distractors: ['LGX 058K', 'LJX 058B'],
        explanation: 'Registration number is LJX 058K.',
        explanationSi: 'ලියාපදිංචි අංකය LJX 058K වේ.'
      },
      {
        number: 10,
        type: 'gap_fill',
        question: 'Make of vehicle: __________',
        answer: 'Ford',
        distractors: ['Fiat', 'Holden'],
        explanation: 'Car make is Ford.',
        explanationSi: 'මෝටර් රථයේ වර්ගය Ford වේ.'
      },
      {
        number: 11,
       type: 'mcq',
        question: 'Cashier’s office opens at:',
        options: ["12.15","2.00","2.15","4.30"],
        answer: 'C',
        distractors: ['A', 'B', 'D'],
        explanation: 'Opens at 2.15 pm.',
        explanationSi: 'මුදල් අයකැමි කාර්යාලය ප.ව. 2.15 ට විවෘත වේ (C).'
      },
      {
        number: 12,
        type: 'gap_fill',
        question: 'The parking sticker must be displayed on the __________',
        answer: 'front windscreen',
        distractors: ['rear window', 'bumper'],
        explanation: 'Must be fixed on the front windscreen / window.',
        explanationSi: 'ස්ටිකරය ඉදිරිපස වීදුරුවේ (front windscreen) ඇලවිය යුතුය.'
      }
    ]
  },

  // Test 3 Section 2: Maritime Museum Tour (Q13 - 23)
  {
    id: 'c1-t3-sec2',
    bookNumber: 1,
    testNumber: 3,
    section: 2,
    cambridgeSource: 'Cambridge IELTS 1, Test 3 - Section 2',
    title: 'Australian National Maritime Museum - Guided Visitor Orientation',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts22.mp3',
    audioSimText:
      'GUIDE: Welcome to the National Maritime Museum. The museum was officially opened in November 1991. Our facilities comprise the modern exhibition building and several historic ships moored along the wharf. The Education Centre is clearly signposted with green arrows on the floor. If you get separated from your party, please rendezvous at the central information desk.\nVisitors touring our naval destroyer, The Vampire, should note that there are steep stairs to climb. Guided tours of The Vampire depart every hour on the hour. Today’s audiovisual theatre features a video about Captain Cook. In the Leisure Gallery, exhibits illustrate how Australian beach and surf culture has been shaped by the sea. The Picture Gallery displays masterpieces by famous Australian artists. Annual family membership costs $70, and our "Passengers and the Sea" wing showcases an extensive collection of emigrant souvenirs.',
    questions: [
      {
        number: 13,
        type: 'gap_fill',
        question: 'Date the Maritime Museum was opened: __________',
        answer: 'November 1991',
        distractors: ['1990', 'October 1991'],
        explanation: 'Opened in November 1991.',
        explanationSi: 'කෞතුකාගාරය විවෘත කළේ 1991 නොවැම්බර් මසදීය.'
      },
      {
        number: 14,
        type: 'gap_fill',
        question: 'The museum complex consists of an exhibition hall and __________',
        answer: 'historic ships',
        distractors: ['dockyard', 'submarine'],
        explanation: 'Consists of the building and historic ships.',
        explanationSi: 'ඓතිහාසික නැව් (historic ships) ප්‍රදර්ශනයට තබා ඇත.'
      },
      {
        number: 15,
        type: 'gap_fill',
        question: 'The Education Centre is signposted by __________',
        answer: 'green arrows',
        distractors: ['blue signs', 'red lines'],
        explanation: 'Signposted by green arrows on the floor.',
        explanationSi: 'කොළ පැහැති ඊතල (green arrows) මගින් සලකුණු කර ඇත.'
      },
      {
        number: 16,
        type: 'gap_fill',
        question: 'If you lose your group, meet at the __________',
        answer: 'information desk',
        distractors: ['entrance gate', 'gift shop'],
        explanation: 'Meet at the central information desk.',
        explanationSi: 'තොරතුරු කවුළුව (information desk) අසලදී හමුවන්න.'
      },
      {
        number: 17,
        type: 'gap_fill',
        question: 'Warning about touring The Vampire: there are __________',
        answer: 'stairs to climb',
        distractors: ['dark rooms', 'narrow doors'],
        explanation: 'Warning: lots of stairs to climb.',
        explanationSi: 'නැගීමට පඩිපෙල් (stairs to climb) ඇති බවට අනතුරු අඟවයි.'
      },
      {
        number: 18,
        type: 'gap_fill',
        question: 'Guided tours of The Vampire depart __________',
        answer: 'every hour',
        distractors: ['every 30 mins', 'twice daily'],
        explanation: 'Tours depart every hour.',
        explanationSi: 'සෑම පැයකට වරක්ම (every hour) සංචාර පිටත් වේ.'
      },
      {
        number: 19,
        type: 'gap_fill',
        question: 'Person featured in today’s documentary video: __________',
        answer: 'Captain Cook',
        distractors: ['Admiral Nelson', 'Arthur Phillip'],
        explanation: 'Features a video on Captain Cook.',
        explanationSi: 'වීඩියෝ පටය කැප්ටන් කුක් (Captain Cook) පිළිබඳවයි.'
      },
      {
        number: 20,
        type: 'gap_fill',
        question: 'The Leisure Gallery shows how Australian culture is influenced by __________',
        answer: 'the sea',
        distractors: ['the sun', 'sports'],
        explanation: 'Influenced by the sea.',
        explanationSi: 'මුහුද (the sea) මගින් ඕස්ට්‍රේලියානු සංස්කෘතියට ඇති බලපෑම දක්වයි.'
      },
      {
        number: 21,
        type: 'gap_fill',
        question: 'The Picture Gallery contains works created by __________',
        answer: 'Australian artists',
        distractors: ['British sailors', 'modern photographers'],
        explanation: 'Features works by Australian artists (painters).',
        explanationSi: 'ඕස්ට්‍රේලියානු කලාකරුවන්ගේ (Australian artists) චිත්‍ර අඩංගු වේ.'
      },
      {
        number: 22,
        type: 'gap_fill',
        question: 'Cost of family membership: $ __________',
        answer: '70',
        distractors: ['50', '80'],
        explanation: 'Family membership is $70.',
        explanationSi: 'සාමාජික ගාස්තුව ඩොලර් 70 කි.'
      },
      {
        number: 23,
        type: 'gap_fill',
        question: 'Passengers and the Sea includes a collection of __________',
        answer: 'souvenirs',
        distractors: ['clothing', 'diaries'],
        explanation: 'Includes a collection of emigrant souvenirs.',
        explanationSi: 'සංචාරක සිහිවටන (souvenirs) එකතුවක් අඩංගු වේ.'
      }
    ]
  },

  // Test 3 Section 3: Dynamic Airline Pricing (Q24 - 32)
  {
    id: 'c1-t3-sec3',
    bookNumber: 1,
    testNumber: 3,
    section: 3,
    cambridgeSource: 'Cambridge IELTS 1, Test 3 - Section 3',
    title: 'Business Seminar - Yield Management in Airline Booking',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts22.mp3',
    audioSimText:
      'MARK: Good afternoon. Today I will talk briefly about dynamic pricing strategies in commercial aviation.\nSUSAN: From a customer perspective, airline fares are generally lowest when tickets are non-refundable and bought with restrictions.\nMARK: Exactly. Yield and revenue management may look complex, but it is completely reasonable from an economic standpoint. The airlines want to increase profits by segmenting price-sensitive vacationers from business travelers.\nTwo fundamental drivers made this dynamic pricing feasible: first, airline deregulation where the law has changed; second, the advent of powerful computer programs calculating seat demand algorithms in real time. In the near future, customers will book tickets directly from home computer terminals. Furthermore, other travel sectors are adopting identical models, especially hotel rooms and hire cars.',
    questions: [
      {
        number: 24,
       type: 'mcq',
        question: 'Mark is going to talk briefly about:',
        options: ["marketing new products","pricing strategies","managing corporations","setting sales targets"],
        answer: 'B',
        distractors: ['A', 'C', 'D'],
        explanation: 'Mark focuses specifically on pricing strategies.',
        explanationSi: 'මිල නියම කිරීමේ උපායමාර්ග (pricing strategies - B) පිළිබඳව සාකච්ඡා කරයි.'
      },
      {
        number: 25,
       type: 'mcq',
        question: 'According to Susan, air fares are lowest when they:',
        options: ["include weekend","booked early","are non-refundable","business travel"],
        answer: 'C',
        distractors: ['A', 'B', 'D'],
        explanation: 'Fares are cheapest when tickets are non-refundable.',
        explanationSi: 'මුදල් ආපසු නොගෙවන (non-refundable - C) ටිකට්පත් මිලෙන් අඩුය.'
      },
      {
        number: 26,
       type: 'mcq',
        question: 'Mark thinks dynamic yield management is:',
        options: ["interesting","complicated","time-consuming","reasonable"],
        answer: 'D',
        distractors: ['A', 'B', 'C'],
        explanation: 'He considers the strategy economically reasonable.',
        explanationSi: 'එය සාධාරණ (reasonable - D) ක්‍රමවේදයක් බව ඔහු පවසයි.'
      },
      {
        number: 27,
       type: 'mcq',
        question: 'The primary goal of airline companies is to:',
        options: ["increase profits","benefit passenger","sell cheap seats","improve service"],
        answer: 'A',
        distractors: ['B', 'C', 'D'],
        explanation: 'Their ultimate goal is to increase profits.',
        explanationSi: 'ගුවන් සමාගම්වල අරමුණ ලාභය වැඩිකර ගැනීමයි (increase profits - A).'
      },
      {
        number: 28,
        type: 'gap_fill',
        question: 'First factor facilitating new pricing: deregulation because the __________',
        answer: 'law has changed',
        distractors: ['oil is cheaper', 'airports expanded'],
        explanation: 'First reason: the law has changed (airline deregulation).',
        explanationSi: 'නීතිය වෙනස් වීම (law has changed) පළමු හේතුවයි.'
      },
      {
        number: 29,
        type: 'gap_fill',
        question: 'Second factor facilitating new pricing: development of __________',
        answer: 'computer programs',
        distractors: ['faster planes', 'more staff'],
        explanation: 'Development of powerful computer programs.',
        explanationSi: 'පරිගණක වැඩසටහන් (computer programs) භාවිතය දෙවන හේතුවයි.'
      },
      {
        number: 30,
        type: 'gap_fill',
        question: 'In future people will be able to book airline tickets directly __________',
        answer: 'from home',
        distractors: ['at stations', 'via post'],
        explanation: 'Passengers will book from home (home computers).',
        explanationSi: 'නිවසේ සිටම (from home) ටිකට්පත් වෙන්කරවා ගත හැක.'
      },
      {
        number: 31,
        type: 'gap_fill',
        question: 'Also marketed using dynamic pricing are: (1) __________',
        answer: 'hotel rooms',
        distractors: ['trains', 'cruises'],
        explanation: 'Hotels / hotel rooms are priced this way.',
        explanationSi: 'හෝටල් කාමර (hotel rooms) ද මෙම ක්‍රමයට අලෙවි කෙරේ.'
      },
      {
        number: 32,
        type: 'gap_fill',
        question: 'And: (2) __________',
        answer: 'hire cars',
        distractors: ['bicycles', 'taxis'],
        explanation: 'Hire cars are also priced dynamically.',
        explanationSi: 'කුලී රථ (hire cars) ද මෙම ආකෘතියට අනුව මිල කෙරේ.'
      }
    ]
  },

  // Test 3 Section 4: Supermarket Layout Psychology (Q33 - 42)
  {
    id: 'c1-t3-sec4',
    bookNumber: 1,
    testNumber: 3,
    section: 4,
    cambridgeSource: 'Cambridge IELTS 1, Test 3 - Section 4',
    title: 'Retail Psychology - Supermarket Space Management & Consumer Flow',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts22.mp3',
    audioSimText:
      'LECTURER: Welcome to this lecture on retail psychology. Supermarket chains deploy advanced space management techniques. To discover what shoppers think about store displays and products, managers distribute customer questionnaires. To study movement patterns, researchers install hidden TV cameras overhead. A specialist video recorder tracks customer journeys. Modern retailers use computerized 3D simulation software, such as "Spaceman", to determine the optimum position or shelf for each item.\nObservational analysis reveals that when shoppers enter an aisle, they tend to walk straight past the first few shelves without buying. However, merchandise placed at eye level sells most rapidly; these premium zones are known as hotspots. Gondola ends are prominent display locations: the front gondola end is used to introduce new brands, while the rear gondola end showcases special offers and discounts. Finally, checkouts are utilized to trigger impulse buying of small luxury treats such as chocolates.',
    questions: [
      {
        number: 33,
        type: 'gap_fill',
        question: 'Customer questionnaires reveal what customers think about store __________',
        answer: 'displays and products',
        distractors: ['staff and prices', 'lighting'],
        explanation: 'Questionnaires gather views on displays and products.',
        explanationSi: 'ප්‍රදර්ශන සහ භාණ්ඩ (displays and products) පිළිබඳ පාරිභෝගික අදහස් ලබාගනී.'
      },
      {
        number: 34,
        type: 'gap_fill',
        question: 'To observe customer movements, supermarkets install hidden __________',
        answer: 'TV cameras',
        distractors: ['sensors', 'mirrors'],
        explanation: 'Researchers deploy hidden TV cameras.',
        explanationSi: 'සැඟවුණු කැමරා (TV cameras) මගින් පාරිභෝගික චලනයන් නිරීක්ෂණය කරයි.'
      },
      {
        number: 35,
        type: 'gap_fill',
        question: 'Eye movement analysis utilizes a specialized video __________',
        answer: 'recorder',
        distractors: ['glasses', 'scanner'],
        explanation: 'Recorded with a specialist video recorder.',
        explanationSi: 'වීඩියෝ පටිගත කිරීමේ උපකරණ (recorder) භාවිතා කරයි.'
      },
      {
        number: 36,
        type: 'gap_fill',
        question: 'Example of sophisticated shelf-management computer software: "__________"',
        answer: 'Spaceman',
        distractors: ['ShopMaster', 'Retailer'],
        explanation: 'Software named "Spaceman".',
        explanationSi: 'මෘදුකාංගයේ නම "Spaceman" වේ.'
      },
      {
        number: 37,
        type: 'gap_fill',
        question: 'This software calculates the best __________ for each item on the shelf',
        answer: 'position',
        distractors: ['price', 'discount'],
        explanation: 'Determines the best position / shelf spot.',
        explanationSi: 'භාණ්ඩය තැබිය යුතු හොඳම ස්ථානය (position // shelf) තීරණය කරයි.'
      },
      {
        number: 38,
        type: 'gap_fill',
        question: 'At the entrance to an aisle, customers usually __________ the first shelves',
        answer: 'walk past',
        distractors: ['stop at', 'examine'],
        explanation: 'Shoppers tend to walk straight past / ignore the first shelves.',
        explanationSi: 'පළමු රාක්ක පසුකර ඇවිද යයි (walk past // ignore).'
      },
      {
        number: 39,
        type: 'gap_fill',
        question: 'Products sell most effectively if they are positioned __________',
        answer: 'at eye level',
        distractors: ['on the floor', 'on the top shelf'],
        explanation: 'Items sell best placed at eye level.',
        explanationSi: 'ඇස් මට්ටමේ (at eye level) ඇති භාණ්ඩ වැඩිපුර අලෙවි වේ.'
      },
      {
        number: 40,
        type: 'gap_fill',
        question: 'These high-selling shelf zones are known as __________',
        answer: 'hotspots',
        distractors: ['dead zones', 'prime bays'],
        explanation: 'Termed "hotspots".',
        explanationSi: 'මෙම කලාප "hotspots" ලෙස හැඳින්වේ.'
      },
      {
        number: 41,
        type: 'gap_fill',
        question: 'The rear gondola end is frequently used to display __________',
        answer: 'special offers',
        distractors: ['dairy items', 'magazines'],
        explanation: 'Often features special offers and discounts.',
        explanationSi: 'විශේෂ දීමනා (special offers) ප්‍රදර්ශනය කරයි.'
      },
      {
        number: 42,
        type: 'gap_fill',
        question: 'Checkout lanes are strategic locations used to prompt impulse sales of __________',
        answer: 'chocolates',
        distractors: ['newspapers', 'drinks'],
        explanation: 'Checkouts trigger impulse buys of chocolates.',
        explanationSi: 'පිටවීමේ කවුන්ටර අසල චොකලට් (chocolates) තබා ඇත.'
      }
    ]
  },

  // -------------------------------------------------------------
  // TEST 4 (Audio: ielts22.mp3)
  // -------------------------------------------------------------
  // Test 4 Section 1: University Enrolment & Campus Queries (Q1 - 12)
  {
    id: 'c1-t4-sec1',
    bookNumber: 1,
    testNumber: 4,
    section: 1,
    cambridgeSource: 'Cambridge IELTS 1, Test 4 - Section 1',
    title: 'Student Services - Campus Enrolment & Registration Formalities',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts22.mp3',
    audioSimText:
      'STUDENT: Excuse me, where is the administration building?\nSTAFF: It is building C, past the main lawn. Be prepared: there are about 50 people waiting in the queue!\nSTUDENT: I’ll get lunch first at the refectory. I’d like a cheese sandwich and a hot coffee, please.\nCASHIER: That will be $3.50 altogether.\nSTUDENT: Here is a $5.00 note.\nCASHIER: Thank you, $1.50 change.\nOFFICER: Next for registration, please! Name?\nSTUDENT: Julia Perkins. P-E-R-K-I-N-S. Address: Flat 5, 15 Waratah Road, Brisbane. No telephone connected yet. I am taking first year Law.\nOFFICER: Fine. Don’t forget that before term begins you must organise tutorial groups with your tutor and pay the student union fees.',
    questions: [
      {
        number: 1,
       type: 'mcq',
        question: 'Where is the administration building?',
        options: ["Building A", "Building B", "Building C", "Building D"],
        answer: 'C',
        distractors: ['A', 'B', 'D'],
        explanation: 'Staff confirms it is Building C.',
        explanationSi: 'පරිපාලන ගොඩනැගිල්ල Building C වේ.'
      },
      {
        number: 2,
       type: 'mcq',
        question: 'How many people are waiting in the queue?',
        options: ["50","100","200","300"],
        answer: 'A',
        distractors: ['B', 'C', 'D'],
        explanation: 'About 50 people in queue.',
        explanationSi: 'පෝලිමේ 50 දෙනෙකු පමණ (50 - A) සිටිති.'
      },
      {
        number: 3,
       type: 'mcq',
        question: 'What does the woman order for lunch?',
        options: ["Salad","Cheese sandwich","Burger","Pie"],
        answer: 'B',
        distractors: ['A', 'C', 'D'],
        explanation: 'Orders a cheese sandwich (Option B).',
        explanationSi: 'ඇය ඇණවුම් කළේ චීස් සැන්ඩ්විච් එකකි (B).'
      },
      {
        number: 4,
       type: 'mcq',
        question: 'What does the woman order to drink?',
        options: ["Orange juice","Tea","Mineral water","Hot coffee"],
        answer: 'D',
        distractors: ['A', 'B', 'C'],
        explanation: 'Orders a hot coffee (Option D).',
        explanationSi: 'ඇය උණුසුම් කෝපි එකක් (hot coffee - D) ඇණවුම් කළාය.'
      },
      {
        number: 5,
       type: 'mcq',
        question: 'How much money does the woman give the cashier?',
        options: ["$2.00","$3.00","$3.50","$5.00"],
        answer: 'D',
        distractors: ['A', 'B', 'C'],
        explanation: 'Tenders a $5.00 note (meal was $3.50, change $1.50).',
        explanationSi: 'ඇය ඩොලර් 5 ක නෝට්ටුවක් (D) ලබා දෙයි.'
      },
      {
        number: 6,
        type: 'gap_fill',
        question: 'Student name: Julia __________',
        answer: 'Perkins',
        distractors: ['Parkins', 'Perkens'],
        explanation: 'Spelled: P-E-R-K-I-N-S.',
        explanationSi: 'නම Julia Perkins වේ.'
      },
      {
        number: 7,
        type: 'gap_fill',
        question: 'Address: Flat 5, 15 __________ Road',
        answer: 'Waratah',
        distractors: ['Warratah', 'Walatah'],
        explanation: 'Address: 15 Waratah Road.',
        explanationSi: 'වීදිය Waratah Road වේ.'
      },
      {
        number: 8,
        type: 'gap_fill',
        question: 'Town: __________',
        answer: 'Brisbane',
        distractors: ['Sydney', 'Melbourne'],
        explanation: 'Town is Brisbane.',
        explanationSi: 'නගරය Brisbane වේ.'
      },
      {
        number: 9,
        type: 'gap_fill',
        question: 'Telephone contact: __________',
        answer: 'none',
        distractors: ['07345678', 'blank'],
        explanation: 'No phone connected yet (accepted: none // not connected).',
        explanationSi: 'දුරකථනයක් නොමැත (none // not connected).'
      },
      {
        number: 10,
        type: 'gap_fill',
        question: 'Enrolled course: __________',
        answer: 'first year Law',
        distractors: ['Arts', 'Business'],
        explanation: 'Enrolled in first year Law.',
        explanationSi: 'පාඨමාලාව first year Law වේ.'
      },
      {
        number: 11,
       type: 'mcq',
        question: 'Requirement 1 before starting classes:',
        options: ["Check board","Attend lecture","Organise tutorial groups","Buy books"],
        answer: 'C',
        distractors: ['A', 'B', 'D'],
        explanation: 'Must organise tutorial groups.',
        explanationSi: 'උපකාරක කණ්ඩායම් සංවිධානය කරගත යුතුය (C).'
      },
      {
        number: 12,
       type: 'mcq',
        question: 'Requirement 2 before starting classes:',
        options: ["Buy gown","Medical check","Open bank account","Pay the union fees"],
        answer: 'D',
        distractors: ['A', 'B', 'C'],
        explanation: 'Must pay the student union fees.',
        explanationSi: 'ශිෂ්‍ය සංගම් ගාස්තු ගෙවිය යුතුය (D).'
      }
    ]
  },

  // Test 4 Section 2: Student Banking Guide (Q13 - 21)
  {
    id: 'c1-t4-sec2',
    bookNumber: 1,
    testNumber: 4,
    section: 2,
    cambridgeSource: 'Cambridge IELTS 1, Test 4 - Section 2',
    title: 'International Student Advisory - Managing Banking & Accounts',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts22.mp3',
    audioSimText:
      'ADVISER: Setting up your finances is an essential step. There are four major banks with branches near campus: Barclays on Realty Square, NatWest on Preston Park, Lloyds in City Plaza, and Midland located on Hope Street.\nTo open an account, overseas students must provide documentary evidence that they can support themselves financially. You must take your passport and official letter of enrolment from the university. We recommend opening a current student account. The bank will issue a chequebook and a cheque guarantee card.\nA cashcard allows you to withdraw cash 24 hours a day at ATMs. Debit cards take money directly from your account. If you need an overdraft, you must obtain prior permission from the bank manager. Most local branches remain open until 4.30 pm or 5 pm on weekdays.',
    questions: [
      {
        number: 13,
        type: 'gap_fill',
        question: 'Midland Bank campus branch location: __________',
        answer: 'Hope Street',
        distractors: ['High Street', 'Realty Square'],
        explanation: 'Midland is on Hope Street.',
        explanationSi: 'මිඩ්ලන්ඩ් බැංකුව පිහිටා ඇත්තේ Hope Street හි ය.'
      },
      {
        number: 14,
        type: 'gap_fill',
        question: 'Students must provide __________ showing they can support themselves',
        answer: 'evidence',
        distractors: ['cash', 'guarantor'],
        explanation: 'Must provide evidence of financial support.',
        explanationSi: 'මූල්‍ය හැකියාව පිළිබඳ සාක්ෂි (evidence) සැපයිය යුතුය.'
      },
      {
        number: 15,
        type: 'gap_fill',
        question: 'Documents needed to open an account: letter of enrolment and __________',
        answer: 'passport',
        distractors: ['birth certificate', 'driving licence'],
        explanation: 'Must take passport and letter of enrolment.',
        explanationSi: 'ගුවන් ගමන් බලපත්‍රය (passport) රැගෙන යා යුතුය.'
      },
      {
        number: 16,
        type: 'gap_fill',
        question: 'Recommended account type for full-time students: __________ account',
        answer: 'current',
        distractors: ['deposit', 'savings'],
        explanation: 'Recommended: current / student account.',
        explanationSi: 'ජංගම ගිණුමක් (current account) ආරම්භ කිරීම නිර්දේශ කෙරේ.'
      },
      {
        number: 17,
        type: 'gap_fill',
        question: 'Bank supplies cheque guarantee card and a __________',
        answer: 'chequebook',
        distractors: ['calculator', 'wallet'],
        explanation: 'The bank supplies a chequebook.',
        explanationSi: 'චෙක්පොතක් (chequebook) ලබාදෙයි.'
      },
      {
        number: 18,
        type: 'gap_fill',
        question: 'With a cashcard, students can __________ cash at ATMs anytime',
        answer: 'withdraw',
        distractors: ['deposit', 'transfer'],
        explanation: 'Can withdraw cash at any time.',
        explanationSi: 'ඕනෑම වේලාවක මුදල් ආපසු ලබාගත හැක (withdraw).'
      },
      {
        number: 19,
        type: 'gap_fill',
        question: 'Debit/Switch cards deduct money __________ the account',
        answer: 'directly from',
        distractors: ['at end of month', 'with interest'],
        explanation: 'Deducts money directly from the account.',
        explanationSi: 'ගිණුමෙන් කෙළින්ම (directly from) මුදල් අය කෙරේ.'
      },
      {
        number: 20,
        type: 'gap_fill',
        question: 'Before taking an overdraft, students must have __________',
        answer: 'permission of bank',
        distractors: ['good grades', 'credit history'],
        explanation: 'Must have permission from / of bank.',
        explanationSi: 'බැංකුවේ පූර්ව අවසරය (permission of bank) තිබිය යුතුය.'
      },
      {
        number: 21,
        type: 'gap_fill',
        question: 'During weekdays, most banks stay open until __________',
        answer: '4.30 pm',
        distractors: ['3.30 pm', '6.00 pm'],
        explanation: 'Open until 4.30 pm (or 5 pm).',
        explanationSi: 'බැංකු ප.ව. 4.30 හෝ 5.00 දක්වා විවෘතව පවතී.'
      }
    ]
  },

  // Test 4 Section 3: Engineering of Aluminium Cans (Q22 - 31)
  {
    id: 'c1-t4-sec3',
    bookNumber: 1,
    testNumber: 4,
    section: 3,
    cambridgeSource: 'Cambridge IELTS 1, Test 4 - Section 3',
    title: 'Manufacturing Technology - Design & Engineering of the Aluminium Can',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts22.mp3',
    audioSimText:
      'ENGINEER: Aluminium drinks cans are modern engineering marvels. Approximately 300 million cans are manufactured every day in the US—more than nails or paper clips! Each can weighs only 0.48 ounces, and the wall is thinner than two magazine pages. Despite this featherweight design, it can withstand over 90 pounds of internal pressure per square inch, which is more than three times the pressure inside a typical car tyre.\nExamining the structure: the wall is manufactured thicker at the base to endure stamping stresses. The exterior aluminium surface is wrapped with a colourful printed label. The base is engineered in the shape of an inward dome to distribute pressure evenly without bursting. Around the rim, the top lid connects with an airtight folded flange. The lid is made of a stiffer alloy and comprises 25% of the total can weight. Finally, opening is achieved via a rivet tab and a pre-scored opening on the top surface.',
    questions: [
      {
        number: 22,
        type: 'gap_fill',
        question: 'Number of cans produced every day in the US: __________',
        answer: '300 million',
        distractors: ['30 million', '3 billion'],
        explanation: '300 million cans manufactured daily in the US.',
        explanationSi: 'ඇමරිකාවේ දිනකට කෑන් මිලියන 300 ක් නිපදවයි.'
      },
      {
        number: 23,
        type: 'gap_fill',
        question: 'More cans are produced in the US than nails or __________',
        answer: 'paper clips',
        distractors: ['bottles', 'screws'],
        explanation: 'More than nails or paper clips.',
        explanationSi: 'ඇණ හෝ කඩදාසි ක්ලිප් (paper clips) වලට වඩා වැඩි ප්‍රමාණයක් නිපදවේ.'
      },
      {
        number: 24,
        type: 'gap_fill',
        question: 'The thickness of a can wall is thinner than two __________',
        answer: 'magazine pages',
        distractors: ['leaves', 'plastic sheets'],
        explanation: 'Thinner than two magazine pages (or pieces of paper).',
        explanationSi: 'සඟරා පිටු දෙකකට වඩා (magazine pages) තුනී වේ.'
      },
      {
        number: 25,
        type: 'gap_fill',
        question: 'A can withstands internal pressure over __________ the pressure of a car tyre',
        answer: 'three times',
        distractors: ['two times', 'ten times'],
        explanation: 'Withstands over three times car tyre pressure.',
        explanationSi: 'මෝටර් රථ ටයරයක පීඩනය මෙන් තෙගුණයක් (three times) දරාගත හැක.'
      },
      {
        number: 26,
        type: 'gap_fill',
        question: 'Can body: the aluminium is manufactured __________ at the base',
        answer: 'thicker',
        distractors: ['thinner', 'wider'],
        explanation: 'Wall is manufactured thicker at base.',
        explanationSi: 'පාදම අසලදී ඇලුමිනියම් ඝනකම වැඩිය (thicker).'
      },
      {
        number: 27,
        type: 'gap_fill',
        question: 'The decorative reflective exterior is wrapped with a printed __________',
        answer: 'label',
        distractors: ['foil', 'sticker'],
        explanation: 'The exterior features a printed label.',
        explanationSi: 'මුද්‍රිත ලේබලයකින් (label) සරසා ඇත.'
      },
      {
        number: 28,
        type: 'gap_fill',
        question: 'The base is shaped like an inward __________ to withstand pressure',
        answer: 'dome',
        distractors: ['cone', 'cylinder'],
        explanation: 'Base is shaped like a dome.',
        explanationSi: 'පාදම ගෝලාකාර හැඩයකින් (dome) නිර්මාණය කර ඇත.'
      },
      {
        number: 29,
        type: 'gap_fill',
        question: 'Airtight rim junction connecting the lid: the __________',
        answer: 'flange',
        distractors: ['seam', 'groove'],
        explanation: 'Lid is joined with a folded flange.',
        explanationSi: 'බැඳි වාටිය flange ලෙස හැඳින්වේ.'
      },
      {
        number: 30,
        type: 'gap_fill',
        question: 'The top lid accounts for __________ of the total weight of the can',
        answer: '25%',
        distractors: ['15%', '50%'],
        explanation: 'Lid makes up 25% of total weight.',
        explanationSi: 'මුදුන සම්පූර්ණ බරින් 25% ක් (25%) වේ.'
      },
      {
        number: 31,
        type: 'gap_fill',
        question: 'The drink can is opened by pulling the tab to fracture the __________',
        answer: 'scored opening',
        distractors: ['seal', 'perforated rim'],
        explanation: 'Tab presses down into the scored opening.',
        explanationSi: 'කැපුම් විවරය (scored opening) විවෘත වේ.'
      }
    ]
  },

  // Test 4 Section 4: Academic Sports Science Disciplines (Q32 - 42)
  {
    id: 'c1-t4-sec4',
    bookNumber: 1,
    testNumber: 4,
    section: 4,
    cambridgeSource: 'Cambridge IELTS 1, Test 4 - Section 4',
    title: 'Faculty of Health Sciences - Overview of Sports Studies Programme',
    audioUrl: '/cambridge-media/Cambridge%20IELTS%201/Cambridge%20IELTS%201%20(2001)%20-%20CD%20Audio/ielts22.mp3',
    audioSimText:
      'PROFESSOR: Good morning and welcome to this introductory university lecture. The aim today is for prospective students to experience a university lecture and to find out about the Sports Studies programme.\nThe degree encompasses three core strands: sports psychology, sports management and sports physiology.\nFirst, sports psychologists work primarily with top athletes. Their scientific enquiry seeks to discover what makes winners mentally resilient and capable of peak performance under intense stress.\nSecond, sports management and marketing examines commercial market forces. Today professional athletics competes directly with other leisure activities for spectator disposable income; modern fans demand top-tier entertainment.\nThird, sports physiology, also known as exercise science, operates across two analytical dimensions: at the macro level, researchers perform fitness testing and physical body measurements; at the micro level, specialists conduct cellular research to observe cellular change during intensive exertion.',
    questions: [
      {
        number: 32,
        type: 'gap_fill',
        question: 'First purpose of the mini-lecture: to experience __________',
        answer: 'a university lecture',
        distractors: ['campus life', 'an exam'],
        explanation: 'To experience a university lecture.',
        explanationSi: 'විශ්වවිද්‍යාල දේශනයක අත්දැකීමක් (a university lecture) ලබාදීම.'
      },
      {
        number: 33,
        type: 'gap_fill',
        question: 'Second purpose: to find out about the __________ programme',
        answer: 'Sports Studies',
        distractors: ['Physical Education', 'Health'],
        explanation: 'To learn about the Sports Studies programme.',
        explanationSi: 'Sports Studies පාඨමාලාව පිළිබඳ දැනුවත් කිරීම.'
      },
      {
        number: 34,
        type: 'gap_fill',
        question: 'Three strands of Sports Studies: sports psychology, sports __________ and sports physiology',
        answer: 'management',
        distractors: ['marketing', 'medicine'],
        explanation: 'The three strands: psychology, management, and physiology.',
        explanationSi: 'තුන්වන අංශය කළමනාකරණය (management) වේ.'
      },
      {
        number: 35,
        type: 'gap_fill',
        question: 'Sports psychologists work predominantly with __________',
        answer: 'top athletes',
        distractors: ['coaches', 'children'],
        explanation: 'Psychologists work with top athletes.',
        explanationSi: 'දක්ෂතම මලල ක්‍රීඩකයන් (top athletes) සමඟ කටයුතු කරයි.'
      },
      {
        number: 36,
        type: 'gap_fill',
        question: 'Psychologists aim to discover what __________ under pressure',
        answer: 'makes winners',
        distractors: ['causes stress', 'athletes eat'],
        explanation: 'Seek to discover what makes winners / makes them win.',
        explanationSi: 'ජයග්‍රාහකයන් බිහිවන්නේ කෙසේද (makes winners) යන්න සොයා බලයි.'
      },
      {
        number: 37,
        type: 'gap_fill',
        question: 'Sports marketing and management examines commercial __________',
        answer: 'market forces',
        distractors: ['sponsorships', 'regulations'],
        explanation: 'Examines commercial market forces.',
        explanationSi: 'වෙළඳපොල බලවේග (market forces) පිළිබඳ අධ්‍යයනය කරයි.'
      },
      {
        number: 38,
        type: 'gap_fill',
        question: 'Today sport competes directly for spectators with other __________',
        answer: 'leisure activities',
        distractors: ['jobs', 'schools'],
        explanation: 'Competes with other leisure activities.',
        explanationSi: 'වෙනත් විවේක කාල ක්‍රියාකාරකම් (leisure activities) සමඟ තරඟ කරයි.'
      },
      {
        number: 39,
        type: 'gap_fill',
        question: 'Modern stadium spectators primarily expect __________',
        answer: 'entertainment',
        distractors: ['cheap tickets', 'free food'],
        explanation: 'Spectators want entertainment.',
        explanationSi: 'නරඹන්නන් විනෝදාස්වාදය (entertainment) අපේක්ෂා කරයි.'
      },
      {
        number: 40,
        type: 'gap_fill',
        question: 'Sports physiology is also known as __________',
        answer: 'exercise science',
        distractors: ['kinesiology', 'anatomy'],
        explanation: 'Also known as exercise science.',
        explanationSi: 'ව්‍යායාම විද්‍යාව (exercise science) ලෙසද හැඳින්වේ.'
      },
      {
        number: 41,
        type: 'gap_fill',
        question: 'Macro-level research focuses on __________',
        answer: 'fitness testing',
        distractors: ['diet plans', 'microscopy'],
        explanation: 'Macro level looks at fitness testing // body measurements.',
        explanationSi: 'ශාරීරික යෝග්‍යතා පරීක්ෂණ (fitness testing) සිදුකරයි.'
      },
      {
        number: 42,
        type: 'gap_fill',
        question: 'Micro-level physiological research investigates __________ during exercise',
        answer: 'cellular research',
        distractors: ['heart rate', 'lung volume'],
        explanation: 'Micro level investigates cellular research // cellular change.',
        explanationSi: 'සෛලීය වෙනස්කම් (cellular research // cellular change) පිළිබඳව පරීක්ෂා කරයි.'
      }
    ]
  }
];

/* ===================================================================== */
/* CAMBRIDGE 1 - SPEAKING MODULE (Complete Tests 1 to 4)                 */
/* Authentic Cambridge Candidate Task Cards & Examiner Interaction       */
/* ===================================================================== */

export const CAMBRIDGE_1_SPEAKING_TESTS: SpeakingPartPrompt[] = [
  // Test 1 Speaking: Clubs and Associations
  {
    id: 'c1-spk-test1',
    part: 2,
    topic: 'University Clubs and Associations (Orientation Week)',
    questions: [
      'What kinds of clubs or societies are popular among students in your country?',
      'Do you think joining extracurricular clubs helps students improve their academic performance?',
      'How do cultural societies help international students settle into campus life?'
    ],
    cueCardPoints: [
      'Which club or association you would like to join',
      'What benefits or activities you expect it to provide',
      'What meeting times and membership fees apply',
      'Why you think this club would enrich your university experience'
    ],
    sampleBand8Answer:
      'If I were attending orientation week, I would definitely join the university debate society and the outdoor hiking association. Participating in the debate society would substantially hone my critical thinking and public discourse competencies, providing a forum to exchange intellectual perspectives. Simultaneously, an outdoor club organizes weekend excursions that offer mental respite from rigorous study and foster lasting camaraderie among peers.',
    examinerTips: [
      'In Part 2, speak continuously for 1 to 2 minutes using precise academic discourse markers.',
      'Show range of tenses and modal conditionals (e.g. "If I were to enroll, I would relish the opportunity to...").',
      'Directly address all prompt bullets on the cue card.'
    ]
  },

  // Test 2 Speaking: Requesting an Academic Extension
  {
    id: 'c1-spk-test2',
    part: 2,
    topic: 'Negotiating an Academic Deadline Extension',
    questions: [
      'Why do students sometimes struggle to submit coursework by the prescribed deadline?',
      'Should universities impose strict penalties on late submissions without exceptions?',
      'What support services should higher education institutions offer to students facing academic distress?'
    ],
    cueCardPoints: [
      'Which assignment you need an extension for',
      'Why you have been unable to finish it on time (e.g. reference book scarcity)',
      'How much additional time you are requesting',
      'What steps you have already taken to complete the research'
    ],
    sampleBand8Answer:
      'I would respectfully explain to my lecturer that while substantial preliminary research has been completed, a critical monograph required for the theoretical literature review was recalled to the closed reserve library. Consequently, I require an extension of two working weeks. I have outlined my thesis draft and bibliography to demonstrate diligence and reassure the examiner that the requested postponement is justified.',
    examinerTips: [
      'Use formal academic register when simulating communication with a lecturer.',
      'Incorporate sophisticated justification phrases: "Due to unforeseen logistical constraints...", "To ensure methodological rigor...".'
    ]
  },

  // Test 3 Speaking: Public Holidays & Cultural Celebrations
  {
    id: 'c1-spk-test3',
    part: 2,
    topic: 'Public Holidays & Traditional Festivities',
    questions: [
      'How do national holidays reinforce cultural identity in modern societies?',
      'Are traditional holidays becoming excessively commercialized nowadays?',
      'Should countries introduce more public holidays to improve work-life balance?'
    ],
    cueCardPoints: [
      'What the public holiday or festival is',
      'When and how people celebrate it',
      'What special meals or rituals are associated with it',
      'Why this celebration holds profound personal and national significance'
    ],
    sampleBand8Answer:
      'In Sri Lanka, the Sinhala and Tamil New Year in mid-April marks the sun’s transition into the constellation of Aries, symbolizing agricultural harvest and cosmic renewal. Families prepare milk rice and sweetmeats at astrologically auspicious hours, clad in traditional attire. It is a time of profound familial reconciliation, where past grievances are forgiven and communal bonds are revitalized across generations.',
    examinerTips: [
      'Bring rich sensory and cultural vocabulary to life ("astrologically auspicious", "communal solidarity", "cultural continuity").',
      'Part 3 requires abstract generalization rather than purely personal anecdotes.'
    ]
  },

  // Test 4 Speaking: Planning an Excursion
  {
    id: 'c1-spk-test4',
    part: 2,
    topic: 'Planning an Educational or Leisure Excursion',
    questions: [
      'What are the advantages of taking students on field trips compared to classroom instruction?',
      'How can tourism organizers minimize environmental damage to sensitive natural reserves?',
      'Do you believe solo travel is more beneficial than group excursions?'
    ],
    cueCardPoints: [
      'Where the excursion destination is',
      'What mode of transport and logistical arrangements are required',
      'What activities participants will engage in',
      'Why this excursion provides both educational insight and relaxation'
    ],
    sampleBand8Answer:
      'An ideal educational excursion would be a three-day field expedition to a biodiversity reserve such as the Sinharaja Rain Forest. Participants would travel via chartered coach and embark on guided ecological surveys led by indigenous naturalists. This immersive experience allows students to witness endemic flora and complex canopy ecosystems firsthand, transforming theoretical biological concepts into tangible, unforgettable realities.',
    examinerTips: [
      'Demonstrate lexical versatility when describing geographical features and ecological phenomena.',
      'Maintain steady natural intonation with varied sentence structures.'
    ]
  }
];
