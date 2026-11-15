import type { ReadingPassage } from '../types/tutor';

/* ===================================================================== */
/* CAMBRIDGE IELTS 1 - READING TEST 1 & TEST 2                           */
/* Test 1 (Questions 1-40):                                              */
/*   Passage 1: A spark, a flint: How fire leapt to life (Q1-15)         */
/*   Passage 2: Zoo conservation programmes (Q16-28)                     */
/*   Passage 3: ARCHITECTURE - Reaching for the Sky (Q29-40)             */
/* Test 2 (Questions 1-41):                                              */
/*   Passage 1: Right and left-handedness in humans (Q1-12)              */
/*   Passage 2: MIGRATORY BEEKEEPING - Taking Wing (Q13-27)              */
/*   Passage 3: TOURISM (Q28-41)                                         */
/* ===================================================================== */

export const CAMBRIDGE_1_READING_TESTS: ReadingPassage[] = [
  /* =================================================================== */
  /* TEST 1 - PASSAGE 1: A spark, a flint: How fire leapt to life (Q1-15)*/
  /* =================================================================== */
  {
    id: 'c1-t1-pass1',
    cambridgeSource: 'Cambridge IELTS 1, Test 1 - Reading Passage 1',
    title: 'A spark, a flint: How fire leapt to life — The control of fire was the first and perhaps greatest of humanity’s steps towards a life-enhancing technology',
    paragraphs: [
      {
        label: 'Paragraph 1',
        text: 'To early man, fire was a divine gift randomly delivered in the form of lightning, forest fire or burning lava. Unable to make flame for themselves, the earliest peoples probably stored fire by keeping slow burning logs alight or by carrying charcoal in pots.',
      },
      {
        label: 'Paragraph 2',
        text: 'How and where man learnt how to produce flame at will is unknown. It was probably a secondary invention, accidentally made during tool-making operations with wood or stone. Studies of primitive societies suggest that the earliest method of making fire was through friction. European peasants would insert a wooden drill in a round hole and rotate it briskly between their palms. This process could be speeded up by wrapping a cord around the drill and pulling on each end.',
      },
      {
        label: 'Paragraph 3',
        text: 'The Ancient Greeks used lenses or concave mirrors to concentrate the sun’s rays and burning glasses were also used by Mexican Aztecs and the Chinese.',
      },
      {
        label: 'Paragraph 4',
        text: 'Percussion methods of fire-lighting date back to Paleolithic times, when some Stone Age tool-makers discovered that chipping flints produced sparks. The technique became more efficient after the discovery of iron, about 5000 years ago. In Arctic North America, the Eskimos produced a slow-burning spark by striking quartz against iron pyrites, a compound that contains sulphur. The Chinese lit their fires by striking porcelain with bamboo. In Europe, the combination of steel, flint and tinder remained the main method of fire-lighting until the mid 19th century.',
      },
      {
        label: 'Paragraph 5',
        text: 'Fire-lighting was revolutionised by the discovery of phosphorus, isolated in 1669 by a German alchemist trying to transmute silver into gold. Impressed by the element’s combustibility, several 17th century chemists used it to manufacture fire-lighting devices, but the results were dangerously inflammable. With phosphorus costing the equivalent of several hundred pounds per ounce, the first matches were expensive.',
      },
      {
        label: 'Paragraph 6',
        text: 'The quest for a practical match really began after 1781 when a group of French chemists came up with the Phosphoric Candle or Ethereal Match, a sealed glass tube containing a twist of paper tipped with phosphorus. When the tube was broken, air rushed in, causing the phosphorus to self-combust. An even more hazardous device, popular in America, was the Instantaneous Light Box — a bottle filled with sulphuric acid into which splints treated with chemicals were dipped.',
      },
      {
        label: 'Paragraph 7',
        text: 'The first matches resembling those used today were made in 1827 by John Walker, an English pharmacist who borrowed the formula from a military rocket-maker called Congreve. Costing a shilling a box, Congreves were splints coated with sulphur and tipped with potassium chlorate. To light them, the user drew them quickly through folded glass paper.',
      },
      {
        label: 'Paragraph 8',
        text: 'Walker never patented his invention, and three years later it was copied by a Samuel Jones, who marketed his product as Lucifers. About the same time, a French chemistry student called Charles Sauria produced the first “strike-anywhere” match by substituting white phosphorus for the potassium chlorate in the Walker formula. However, since white phosphorus is a deadly poison, from 1845 match-makers exposed to its fumes succumbed to necrosis, a disease that eats away jaw-bones. It wasn’t until 1906 that the substance was eventually banned.',
      },
      {
        label: 'Paragraph 9',
        text: 'That was 62 years after a Swedish chemist called Pasch had discovered non-toxic red or amorphous phosphorus, a development exploited commercially by Pasch’s compatriot J E Lundstrom in 1885. Lundstrom’s safety matches were safe because the red phosphorus was non-toxic; it was painted on to the striking surface instead of the match tip, which contained potassium chlorate with a relatively high ignition temperature of 182 degrees centigrade.',
      },
      {
        label: 'Paragraph 10',
        text: 'America lagged behind Europe in match technology and safety standards. It wasn’t until 1900 that the Diamond Match Company bought a French patent for safety matches — but the formula did not work properly in the different climatic conditions prevailing in America and it was another 11 years before scientists finally adapted the French patent for the US.',
      },
      {
        label: 'Paragraph 11',
        text: 'The Americans, however, can claim several “firsts” in match technology and marketing. In 1892 the Diamond Match Company pioneered book matches. The innovation didn’t catch on until after 1896, when a brewery had the novel idea of advertising its product in match books. Today book matches are the most widely used type in the US, with 90 percent handed out free by hotels, restaurants and others.',
      },
      {
        label: 'Paragraph 12',
        text: 'Other American innovations include an anti-afterglow solution to prevent the match from smouldering after it has been blown out; and the waterproof match, which lights after eight hours in water.',
      },
    ],
    wordBank: [
      'Mexicans',
      'despite',
      'sunlight',
      'percussion',
      'unaware',
      'heating',
      'until',
      'random',
      'preserve',
      'lacking',
      'chance',
      'without',
      'Eskimos',
      'smoke',
      'rotating',
      'realising',
      'heavenly',
      'friction',
      'make',
      'surprised',
    ],
    summaryContext: {
      title: 'EARLY FIRE-LIGHTING METHODS',
      instruction:
        'Complete the summary below. Choose your answers from the box at the bottom of the page and write them in boxes 1-8 on your answer sheet.\nNB There are more words than spaces so you will not use them all. You may use any of the words more than once.',
      exampleAnswer: 'Primitive societies saw fire as a heavenly gift.',
      fullText:
        'Primitive societies saw fire as a heavenly gift.\nThey tried to (1) .......... burning logs or charcoal (2) .......... that they could create fire themselves. It is suspected that the first man-made flames were produced by (3) .......... .\nThe very first fire-lighting methods involved the creation of (4) .......... by, for example, rapidly (5) .......... a wooden stick in a round hole. The use of (6) .......... or persistent chipping was also widespread in Europe and among other peoples such as the Chinese and (7) .......... . European practice of this method continued until the 1850s (8) .......... the discovery of phosphorus some years earlier.',
    },
    matchingContext: {
      title: 'Questions 9-15',
      instruction:
        'Look at the following notes that have been made about the matches described in Reading Passage 1. Decide which type of match (A-H) corresponds with each description and write your answers in boxes 9-15 on your answer sheet.\nNB There are more matches than descriptions so you will not use them all. You may use any match more than once.',
      options: [
        { code: 'A', text: 'the Ethereal Match' },
        { code: 'B', text: 'the Instantaneous Lightbox' },
        { code: 'C', text: 'Congreves' },
        { code: 'D', text: 'Lucifers' },
        { code: 'E', text: 'the first strike-anywhere match' },
        { code: 'F', text: 'Lundstrom’s safety match' },
        { code: 'G', text: 'book matches' },
        { code: 'H', text: 'waterproof matches' },
      ],
    },
    questions: [
      {
        id: 'c1-t1-p1-q1',
        type: 'summary',
        question: 'They tried to (1) .......... burning logs or charcoal',
        correctAnswer: 'preserve',
        evidence:
          'Unable to make flame for themselves, the earliest peoples probably stored fire by keeping slow burning logs alight or by carrying charcoal in pots.',
        explanation:
          'Paragraph 1 states that early humans stored ("preserved") fire by keeping slow-burning logs alight or carrying charcoal in pots.',
        paragraphReference: 'Paragraph 1',
      },
      {
        id: 'c1-t1-p1-q2',
        type: 'summary',
        question: 'burning logs or charcoal (2) .......... that they could create fire themselves.',
        correctAnswer: 'unaware',
        evidence:
          'Unable to make flame for themselves, the earliest peoples probably stored fire... How and where man learnt how to produce flame at will is unknown.',
        explanation:
          'Early peoples were "unaware" that they could create fire themselves.',
        paragraphReference: 'Paragraph 1',
      },
      {
        id: 'c1-t1-p1-q3',
        type: 'summary',
        question: 'It is suspected that the first man-made flames were produced by (3) .......... .',
        correctAnswer: 'chance',
        evidence:
          'It was probably a secondary invention, accidentally made during tool-making operations with wood or stone.',
        explanation:
          '"Accidentally made" corresponds to produced by "chance".',
        paragraphReference: 'Paragraph 2',
      },
      {
        id: 'c1-t1-p1-q4',
        type: 'summary',
        question: 'The very first fire-lighting methods involved the creation of (4) ..........',
        correctAnswer: 'friction',
        evidence:
          'Studies of primitive societies suggest that the earliest method of making fire was through friction.',
        explanation:
          'Paragraph 2 explicitly states that the earliest method of making fire was through "friction".',
        paragraphReference: 'Paragraph 2',
      },
      {
        id: 'c1-t1-p1-q5',
        type: 'summary',
        question: 'by, for example, rapidly (5) .......... a wooden stick in a round hole.',
        correctAnswer: 'rotating',
        evidence:
          'European peasants would insert a wooden drill in a round hole and rotate it briskly between their palms.',
        explanation:
          '"Rotate it briskly" matches rapidly "rotating" a wooden stick in a round hole.',
        paragraphReference: 'Paragraph 2',
      },
      {
        id: 'c1-t1-p1-q6',
        type: 'summary',
        question: 'The use of (6) .......... or persistent chipping was also widespread in Europe',
        correctAnswer: 'percussion',
        evidence:
          'Percussion methods of fire-lighting date back to Paleolithic times, when some Stone Age tool-makers discovered that chipping flints produced sparks.',
        explanation:
          'Paragraph 4 defines chipping flints to produce sparks as "percussion" methods.',
        paragraphReference: 'Paragraph 4',
      },
      {
        id: 'c1-t1-p1-q7',
        type: 'summary',
        question: 'and among other peoples such as the Chinese and (7) .......... .',
        correctAnswer: 'Eskimos',
        evidence:
          'In Arctic North America, the Eskimos produced a slow-burning spark by striking quartz against iron pyrites... The Chinese lit their fires by striking porcelain with bamboo.',
        explanation:
          'Paragraph 4 mentions both the Chinese and the "Eskimos" using percussion methods.',
        paragraphReference: 'Paragraph 4',
      },
      {
        id: 'c1-t1-p1-q8',
        type: 'summary',
        question: 'European practice of this method continued until the 1850s (8) .......... the discovery of phosphorus some years earlier.',
        correctAnswer: 'despite',
        evidence:
          'In Europe, the combination of steel, flint and tinder remained the main method of fire-lighting until the mid 19th century. Fire-lighting was revolutionised by the discovery of phosphorus, isolated in 1669...',
        explanation:
          'Europeans continued using steel, flint, and tinder until the 1850s "despite" phosphorus having been discovered in 1669.',
        paragraphReference: 'Paragraph 4',
      },
      {
        id: 'c1-t1-p1-q9',
        type: 'mcq',
        question: 'made using a less poisonous type of phosphorus',
        options: [
          'A: the Ethereal Match',
          'B: the Instantaneous Lightbox',
          'C: Congreves',
          'D: Lucifers',
          'E: the first strike-anywhere match',
          'F: Lundstrom’s safety match',
          'G: book matches',
          'H: waterproof matches',
        ],
        correctAnswer: 'F',
        evidence:
          'Lundstrom’s safety matches were safe because the red phosphorus was non-toxic; it was painted on to the striking surface instead of the match tip...',
        explanation:
          'Lundstrom’s safety match (F) used non-toxic red phosphorus.',
        paragraphReference: 'Paragraph 9',
      },
      {
        id: 'c1-t1-p1-q10',
        type: 'mcq',
        question: 'identical to a previous type of match',
        options: [
          'A: the Ethereal Match',
          'B: the Instantaneous Lightbox',
          'C: Congreves',
          'D: Lucifers',
          'E: the first strike-anywhere match',
          'F: Lundstrom’s safety match',
          'G: book matches',
          'H: waterproof matches',
        ],
        correctAnswer: 'D',
        evidence:
          'Walker never patented his invention, and three years later it was copied by a Samuel Jones, who marketed his product as Lucifers.',
        explanation:
          'Lucifers (D) were a direct copy of John Walker’s Congreves.',
        paragraphReference: 'Paragraph 8',
      },
      {
        id: 'c1-t1-p1-q11',
        type: 'mcq',
        question: 'caused a deadly illness',
        options: [
          'A: the Ethereal Match',
          'B: the Instantaneous Lightbox',
          'C: Congreves',
          'D: Lucifers',
          'E: the first strike-anywhere match',
          'F: Lundstrom’s safety match',
          'G: book matches',
          'H: waterproof matches',
        ],
        correctAnswer: 'E',
        evidence:
          'About the same time, a French chemistry student called Charles Sauria produced the first “strike-anywhere” match by substituting white phosphorus... from 1845 match-makers exposed to its fumes succumbed to necrosis, a disease that eats away jaw-bones.',
        explanation:
          'The first strike-anywhere match (E) used white phosphorus, causing deadly necrosis.',
        paragraphReference: 'Paragraph 8',
      },
      {
        id: 'c1-t1-p1-q12',
        type: 'mcq',
        question: 'first to look like modern matches',
        options: [
          'A: the Ethereal Match',
          'B: the Instantaneous Lightbox',
          'C: Congreves',
          'D: Lucifers',
          'E: the first strike-anywhere match',
          'F: Lundstrom’s safety match',
          'G: book matches',
          'H: waterproof matches',
        ],
        correctAnswer: 'C',
        evidence:
          'The first matches resembling those used today were made in 1827 by John Walker... Congreves were splints coated with sulphur and tipped with potassium chlorate.',
        explanation:
          'Congreves (C) were the first matches resembling those used today.',
        paragraphReference: 'Paragraph 7',
      },
      {
        id: 'c1-t1-p1-q13',
        type: 'mcq',
        question: 'first matches used for advertising',
        options: [
          'A: the Ethereal Match',
          'B: the Instantaneous Lightbox',
          'C: Congreves',
          'D: Lucifers',
          'E: the first strike-anywhere match',
          'F: Lundstrom’s safety match',
          'G: book matches',
          'H: waterproof matches',
        ],
        correctAnswer: 'G',
        evidence:
          'In 1892 the Diamond Match Company pioneered book matches. The innovation didn’t catch on until after 1896, when a brewery had the novel idea of advertising its product in match books.',
        explanation:
          'Book matches (G) were the first matches used for advertising.',
        paragraphReference: 'Paragraph 11',
      },
      {
        id: 'c1-t1-p1-q14',
        type: 'mcq',
        question: 'relied on an airtight glass container',
        options: [
          'A: the Ethereal Match',
          'B: the Instantaneous Lightbox',
          'C: Congreves',
          'D: Lucifers',
          'E: the first strike-anywhere match',
          'F: Lundstrom’s safety match',
          'G: book matches',
          'H: waterproof matches',
        ],
        correctAnswer: 'A',
        evidence:
          '...a group of French chemists came up with the Phosphoric Candle or Ethereal Match, a sealed glass tube containing a twist of paper tipped with phosphorus.',
        explanation:
          'The Ethereal Match (A) relied on a sealed (airtight) glass tube.',
        paragraphReference: 'Paragraph 6',
      },
      {
        id: 'c1-t1-p1-q15',
        type: 'mcq',
        question: 'made with the help of an army design',
        options: [
          'A: the Ethereal Match',
          'B: the Instantaneous Lightbox',
          'C: Congreves',
          'D: Lucifers',
          'E: the first strike-anywhere match',
          'F: Lundstrom’s safety match',
          'G: book matches',
          'H: waterproof matches',
        ],
        correctAnswer: 'C',
        evidence:
          'The first matches resembling those used today were made in 1827 by John Walker, an English pharmacist who borrowed the formula from a military rocket-maker called Congreve.',
        explanation:
          'Congreves (C) borrowed their formula from a military rocket-maker.',
        paragraphReference: 'Paragraph 7',
      },
    ],
  },

  /* =================================================================== */
  /* TEST 1 - PASSAGE 2: Zoo conservation programmes (Questions 16-28)   */
  /* =================================================================== */
  {
    id: 'c1-t1-pass2',
    cambridgeSource: 'Cambridge IELTS 1, Test 1 - Reading Passage 2',
    title: 'Zoo conservation programmes',
    paragraphs: [
      {
        label: 'Paragraph 1',
        text: 'One of London Zoo’s recent advertisements caused me some irritation, so patently did it distort reality. Headlined “Without zoos you might as well tell these animals to get stuffed”, it was bordered with illustrations of several endangered species and went on to extol the myth that without zoos like London Zoo these animals “will almost certainly disappear forever”. With the zoo world’s rather mediocre record on conservation, one might be forgiven for being slightly sceptical about such an advertisement.',
      },
      {
        label: 'Paragraph 2',
        text: 'Zoos were originally created as places of entertainment, and their suggested involvement with conservation didn’t seriously arise until about 30 years ago, when the Zoological Society of London held the first formal international meeting on the subject. Eight years later, a series of world conferences took place, entitled “The Breeding of Endangered Species”, and from this point onwards conservation became the zoo community’s buzzword. This commitment has now been clearly defined in The World Zoo Conservation Strategy (WZCS, September 1993), which although an important and welcome document does seem to be based on an unrealistic optimism about the nature of the zoo industry',
      },
      {
        label: 'Paragraph 3',
        text: 'The WZCS estimates that there are about 10,000 zoos in the world, of which around 1,000 represent a core of quality collections capable of participating in co-ordinated conservation programmes. This is probably the document’s first failing, as I believe that 10,000 is a serious underestimate of the total number of places masquerading as zoological establishments. Of course it is difficult to get accurate data but, to put the issue into perspective, I have found that, in a year of working in Eastern Europe, I discover fresh zoos on almost a weekly basis.',
      },
      {
        label: 'Paragraph 4',
        text: 'The second flaw in the reasoning of the WZCS document is the naive faith it places in its 1,000 core zoos. One would assume that the calibre of these institutions would have been carefully examined, but it appears that the criterion for inclusion on this select list might merely be that the zoo is a member of a zoo federation or association. This might be a good starting point, working on the premise that members must meet certain standards, but again the facts don’t support the theory. The greatly respected American Association of Zoological Parks and Aquariums (AAZPA) has had extremely dubious members, and in the UK the Federation of Zoological Gardens of Great Britain and Ireland has occasionally had members that have been roundly censured in the national press. These include Robin Hill Adventure Park on the Isle of Wight, which many considered the most notorious collection of animals in the country. This establishment, which for years was protected by the Isle’s local council (which viewed it as a tourist amenity), was finally closed down following a damning report by a veterinary inspector appointed under the terms of the Zoo Licensing Act 1981. As it was always a collection of dubious repute, one is obliged to reflect upon the standards that the Zoo Federation sets when granting membership. The situation is even worse in developing countries where little money is available for redevelopment and it is hard to see a way of incorporating collections into the overall scheme of the WZCS.',
      },
      {
        label: 'Paragraph 5',
        text: 'Even assuming that the WZCS’s 1,000 core zoos are all of a high standard complete with scientific staff and research facilities, trained and dedicated keepers, accommodation that permits normal or natural behaviour, and a policy of co-operating fully with one another what might be the potential for conservation? Colin Tudge, author of Last Animals at the Zoo (Oxford University Press, 1992), argues that “if the world’s zoos worked together in co-operative breeding programmes, then even without further expansion they could save around 2,000 species of endangered land vertebrates”. This seems an extremely optimistic proposition from a man who must be aware of the failings and weaknesses of the zoo industry the man who, when a member of the council of London Zoo, had to persuade the zoo to devote more of its activities to conservation. Moreover, where are the facts to support such optimism?',
      },
      {
        label: 'Paragraph 6',
        text: 'Today approximately 16 species might be said to have been “saved” by captive breeding programmes, although a number of these can hardly be looked upon as resounding successes. Beyond that, about a further 20 species are being seriously considered for zoo conservation programmes. Given that the international conference at London Zoo was held 30 years ago, this is pretty slow progress, and a long way off Tudge’s target of 2,000.',
      },
    ],
    questions: [
      {
        id: 'c1-t1-p2-q16',
        type: 'TFNG',
        question: 'London Zoo’s advertisements are dishonest.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'YES',
        evidence:
          'One of London Zoo’s recent advertisements caused me some irritation, so patently did it distort reality... went on to extol the myth...',
        explanation:
          'The writer states that London Zoo’s advertisement patently distorted reality and extolled a myth, agreeing that it is dishonest.',
        paragraphReference: 'Paragraph 1',
      },
      {
        id: 'c1-t1-p2-q17',
        type: 'TFNG',
        question: 'Zoos made an insignificant contribution to conservation up until 30 years ago.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'YES',
        evidence:
          'Zoos were originally created as places of entertainment, and their suggested involvement with conservation didn’t seriously arise until about 30 years ago...',
        explanation:
          'Zoos were created for entertainment and did not seriously engage with conservation until about 30 years ago.',
        paragraphReference: 'Paragraph 2',
      },
      {
        id: 'c1-t1-p2-q18',
        type: 'TFNG',
        question: 'The WZCS document is not known in Eastern Europe.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NOT GIVEN',
        evidence:
          '...in a year of working in Eastern Europe, I discover fresh zoos on almost a weekly basis.',
        explanation:
          'The writer mentions discovering unlisted zoos in Eastern Europe, but never states whether the WZCS document is known there.',
        paragraphReference: 'Paragraph 3',
      },
      {
        id: 'c1-t1-p2-q19',
        type: 'TFNG',
        question: 'Zoos in the WZCS select list were carefully inspected.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NO',
        evidence:
          'One would assume that the calibre of these institutions would have been carefully examined, but it appears that the criterion for inclusion on this select list might merely be that the zoo is a member of a zoo federation or association.',
        explanation:
          'The writer contradicts the idea that they were carefully inspected, noting inclusion was merely based on federation membership.',
        paragraphReference: 'Paragraph 4',
      },
      {
        id: 'c1-t1-p2-q20',
        type: 'TFNG',
        question: 'No-one knew how the animals were being treated at Robin Hill Adventure Park.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NO',
        evidence:
          '...in the UK the Federation of Zoological Gardens of Great Britain and Ireland has occasionally had members that have been roundly censured in the national press. These include Robin Hill Adventure Park on the Isle of Wight, which many considered the most notorious collection of animals in the country.',
        explanation:
          'Robin Hill Adventure Park was roundly censured in the national press and widely considered notorious, so people clearly knew.',
        paragraphReference: 'Paragraph 4',
      },
      {
        id: 'c1-t1-p2-q21',
        type: 'TFNG',
        question: 'Colin Tudge was dissatisfied with the treatment of animals at London Zoo.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NOT GIVEN',
        evidence:
          '...the man who, when a member of the council of London Zoo, had to persuade the zoo to devote more of its activities to conservation.',
        explanation:
          'The passage mentions Tudge persuading London Zoo to devote more activities to conservation, but says nothing about dissatisfaction with how animals were treated there.',
        paragraphReference: 'Paragraph 5',
      },
      {
        id: 'c1-t1-p2-q22',
        type: 'TFNG',
        question: 'The number of successful zoo conservation programmes is unsatisfactory.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'YES',
        evidence:
          'Today approximately 16 species might be said to have been “saved” by captive breeding programmes, although a number of these can hardly be looked upon as resounding successes... Given that the international conference at London Zoo was held 30 years ago, this is pretty slow progress...',
        explanation:
          'The writer considers 16 species over 30 years (with many not resounding successes) slow and unsatisfactory progress.',
        paragraphReference: 'Paragraph 6',
      },
      {
        id: 'c1-t1-p2-q23',
        type: 'mcq',
        question: 'What were the objectives of the WZCS document?',
        options: [
          'A: to improve the calibre of zoos world-wide',
          'B: to identify zoos suitable for conservation practice',
          'C: to provide funds for zoos in underdeveloped countries',
          'D: to list the endangered species of the world',
        ],
        correctAnswer: 'B',
        evidence:
          'The WZCS estimates that there are about 10,000 zoos in the world, of which around 1,000 represent a core of quality collections capable of participating in co-ordinated conservation programmes.',
        explanation:
          'The WZCS aimed to identify a core of quality zoos capable of participating in coordinated conservation programmes (B).',
        paragraphReference: 'Paragraph 3',
      },
      {
        id: 'c1-t1-p2-q24',
        type: 'mcq',
        question: 'Why does the writer refer to Robin Hill Adventure Park?',
        options: [
          'A: to support the Isle of Wight local council',
          'B: to criticise the 1981 Zoo Licensing Act',
          'C: to illustrate a weakness in the WZCS document',
          'D: to exemplify the standards in AAZPA zoos',
        ],
        correctAnswer: 'C',
        evidence:
          'The second flaw in the reasoning of the WZCS document is the naive faith it places in its 1,000 core zoos... These include Robin Hill Adventure Park on the Isle of Wight...',
        explanation:
          'Robin Hill Adventure Park is cited to illustrate the second flaw/weakness in the WZCS document (C).',
        paragraphReference: 'Paragraph 4',
      },
      {
        id: 'c1-t1-p2-q25',
        type: 'mcq',
        question: 'What word best describes the writer’s response to Colin Tudges’ prediction on captive breeding programmes?',
        options: [
          'A: disbelieving',
          'B: impartial',
          'C: prejudiced',
          'D: accepting',
        ],
        correctAnswer: 'A',
        evidence:
          'This seems an extremely optimistic proposition from a man who must be aware of the failings and weaknesses of the zoo industry... Moreover, where are the facts to support such optimism?',
        explanation:
          'The writer is sceptical and disbelieving (A) of Tudge’s optimistic prediction.',
        paragraphReference: 'Paragraph 5',
      },
      {
        id: 'c1-t1-p2-q26',
        type: 'mcq',
        question: 'Which THREE of the following factors are mentioned? (Factor 1 of 3)',
        options: [
          'A: the number of unregistered zoos in the world',
          'B: the lack of money in developing countries',
          'C: the actions of the Isle of Wight local council',
          'D: the failure of the WZCS to examine the standards of the “core zoos”',
          'E: the unrealistic aim of the WZCS in view of the number of species “saved” to date',
          'F: the policies of WZCS zoo managers',
        ],
        correctAnswer: 'A // D // E',
        evidence:
          'Paragraph 3 (underestimate of total zoos = A), Paragraph 4 (naive faith in 1,000 core zoos without examining calibre = D), Paragraph 6 (only ~16 species saved vs target of 2,000 = E).',
        explanation:
          'The three factors that lead the writer to doubt the value of the WZCS document are A, D, and E.',
        paragraphReference: 'Paragraph 3',
      },
      {
        id: 'c1-t1-p2-q27',
        type: 'mcq',
        question: 'Which THREE of the following factors are mentioned? (Factor 2 of 3)',
        options: [
          'A: the number of unregistered zoos in the world',
          'B: the lack of money in developing countries',
          'C: the actions of the Isle of Wight local council',
          'D: the failure of the WZCS to examine the standards of the “core zoos”',
          'E: the unrealistic aim of the WZCS in view of the number of species “saved” to date',
          'F: the policies of WZCS zoo managers',
        ],
        correctAnswer: 'A // D // E',
        evidence:
          'Paragraph 3 (A), Paragraph 4 (D), Paragraph 6 (E).',
        explanation:
          'The three factors mentioned by the writer are A, D, and E.',
        paragraphReference: 'Paragraph 4',
      },
      {
        id: 'c1-t1-p2-q28',
        type: 'mcq',
        question: 'Which THREE of the following factors are mentioned? (Factor 3 of 3)',
        options: [
          'A: the number of unregistered zoos in the world',
          'B: the lack of money in developing countries',
          'C: the actions of the Isle of Wight local council',
          'D: the failure of the WZCS to examine the standards of the “core zoos”',
          'E: the unrealistic aim of the WZCS in view of the number of species “saved” to date',
          'F: the policies of WZCS zoo managers',
        ],
        correctAnswer: 'A // D // E',
        evidence:
          'Paragraph 3 (A), Paragraph 4 (D), Paragraph 6 (E).',
        explanation:
          'The three factors mentioned by the writer are A, D, and E.',
        paragraphReference: 'Paragraph 6',
      },
    ],
  },

  /* =================================================================== */
  /* TEST 1 - PASSAGE 3: ARCHITECTURE - Reaching for the Sky (Q29-40)    */
  /* =================================================================== */
  {
    id: 'c1-t1-pass3',
    cambridgeSource: 'Cambridge IELTS 1, Test 1 - Reading Passage 3',
    title: 'ARCHITECTURE - Reaching for the Sky',
    paragraphs: [
      {
        label: 'Paragraph 1',
        text: 'Architecture is the art and science of designing buildings and structures. A building reflects the scientific and technological achievements of the age as well as the ideas and aspirations of the designer and client. The appearance of individual buildings, however, is often controversial.',
      },
      {
        label: 'Paragraph 2',
        text: 'The use of an architectural style cannot be said to start or finish on a specific date. Neither is it possible to say exactly what characterises a particular movement. But the origins of what is now generally known as modern architecture can be traced back to the social and technological changes of the 18th and 19th centuries.',
      },
      {
        label: 'Paragraph 3',
        text: 'Instead of using timber, stone and traditional building techniques, architects began to explore ways of creating buildings by using the latest technology and materials such as steel, glass and concrete strengthened steel bars, known as reinforced concrete. Technological advances also helped bring about the decline of rural industries and an increase in urban populations as people moved to the towns to work in the new factories. Such rapid and uncontrolled growth helped to turn parts of cities into slums.',
      },
      {
        label: 'Paragraph 4',
        text: 'By the 1920s architects throughout Europe were reacting against the conditions created by industrialisation. A new style of architecture emerged to reflect more idealistic notions for the future. It was made possible by new materials and construction techniques and was known as Modernism.',
      },
      {
        label: 'Paragraph 5',
        text: 'By the 1930s many buildings emerging from this movement were designed in the International Style. This was largely characterised by the bold use of new materials and simple, geometric forms, often with white walls supported by stilt-like pillars. These were stripped of unnecessary decoration that would detract from their primary purpose — to be used or lived in.',
      },
      {
        label: 'Paragraph 6',
        text: 'Walter Gropius, Charles Jeanneret (better known as Le Corbusier) and Ludwig Mies van der Rohe were among the most influential of the many architects who contributed to the development of Modernism in the first half of the century. But the economic depression of the 1930s and the second world war (1939-45) prevented their ideas from being widely realised until the economic conditions improved and war-torn cities had to be rebuilt. By the 1950s, the International Style had developed into a universal approach to building, which standardised the appearance of new buildings in cities across the world.',
      },
      {
        label: 'Paragraph 7',
        text: 'Unfortunately, this Modernist interest in geometric simplicity and function became exploited for profit. The rediscovery of quick-and-easy-to-handle reinforced concrete and an improved ability to prefabricate building sections meant that builders could meet the budgets of commissioning authorities and handle a renewed demand for development quickly and cheaply. But this led to many badly designed buildings, which discredited the original aims of Modernism.',
      },
      {
        label: 'Paragraph 8',
        text: 'Influenced by Le Corbusier’s ideas on town planning, every large British city built multi-storey housing estates in the 1960s. Mass-produced, low-cost high-rises seemed to offer a solution to the problem of housing a growing inner-city population. But far from meeting human needs, the new estates often proved to be windswept deserts lacking essential social facilities and services. Many of these buildings were poorly designed and constructed and have since been demolished.',
      },
      {
        label: 'Paragraph 9',
        text: 'By the 1970s, a new respect for the place of buildings within the existing townscape arose. Preserving historic buildings or keeping only their facades (or fronts) grew common. Architects also began to make more use of building styles and materials that were traditional to the area. The architectural style usually referred to as High Tech was also emerging. It celebrated scientific and engineering achievements by openly parading the sophisticated techniques used in construction. Such buildings are commonly made of metal and glass; examples are Stansted airport and the Lloyd’s building in London.',
      },
      {
        label: 'Paragraph 10',
        text: 'Disillusionment at the failure of many of the poor imitations of Modernist architecture led to interest in various styles and ideas from the past and present. By the 1980s the coexistence of different styles of architecture in the same building became known as Post Modern. Other architects looked back to the classical tradition. The trend in architecture now favours smaller scale building design that reflects a growing public awareness of environmental issues such as energy efficiency. Like the Modernists, people today recognise that a well designed environment improves the quality of life but is not necessarily achieved by adopting one well defined style of architecture.',
      },
      {
        label: 'Paragraph 11',
        text: 'Twentieth century architecture will mainly be remembered for its tall buildings. They have been made possible by the development of light steel frames and safe passenger lifts. They originated in the US over a century ago to help meet the demand for more economical use of land. As construction techniques improved, the skyscraper became a reality.\n\nRuth Coleman',
      },
    ],
    tableContext: {
      title: 'Questions 29-35',
      headers: ['PERIOD', 'STYLE OF PERIOD', 'BUILDING MATERIALS', 'CHARACTERISTICS'],
      rows: [
        ['Before 18th century', 'traditional', '(29)', ''],
        ['1920s', 'introduction of (30)', 'steel, glass and concrete', 'exploration of latest technology'],
        ['1930s - 1950s', '(31)', '', 'geometric forms'],
        ['1960s', 'decline of Modernism', 'pre-fabricated sections', '(32)'],
        ['1970s', 'end of Modernist era', 'traditional materials', '(33) historic buildings'],
        ['1970s', 'beginning of (34) era', 'metal and glass', 'sophisticated techniques paraded'],
        ['1980s', 'Post-Modernism', '', '(35)'],
      ],
    },
    matchingContext: {
      title: 'Questions 36-40',
      instruction:
        'Reading Passage 3 describes a number of cause and effect relationships. Match each Cause (36-40) in List A, with its Effect (A-H) in List B.\nWrite your answers (A-H) in boxes 36-40 on your answer sheet.\nNB There are more effects in List B than you will need, so you will not use all of them. You may use any effect more than once if you wish.',
      options: [
        { code: 'A', text: 'The quality of life is improved.' },
        { code: 'B', text: 'Architecture reflects the age.' },
        { code: 'C', text: 'A number of these have been knocked down.' },
        { code: 'D', text: 'Light steel frames and lifts are developed.' },
        { code: 'E', text: 'Historical buildings are preserved.' },
        { code: 'F', text: 'All decoration is removed.' },
        { code: 'G', text: 'Parts of cities become slums.' },
        { code: 'H', text: 'Modernist ideas cannot be put into practice until the second half of the 20th century.' },
      ],
    },
    questions: [
      {
        id: 'c1-t1-p3-q29',
        type: 'summary',
        question: 'Before 18th century — Building Materials',
        correctAnswer: 'timber and stone // timber, stone // wood and stone // stone and timber',
        evidence:
          'Instead of using timber, stone and traditional building techniques, architects began to explore ways of creating buildings by using the latest technology...',
        explanation:
          'Before the 18th century, traditional building materials were "timber, stone" (or "timber and stone").',
        paragraphReference: 'Paragraph 3',
      },
      {
        id: 'c1-t1-p3-q30',
        type: 'summary',
        question: '1920s — Style of Period: introduction of ..........',
        correctAnswer: 'Modernism',
        evidence:
          'By the 1920s architects throughout Europe were reacting against the conditions created by industrialisation... It was made possible by new materials and construction techniques and was known as Modernism.',
        explanation:
          'The 1920s saw the introduction of "Modernism".',
        paragraphReference: 'Paragraph 4',
      },
      {
        id: 'c1-t1-p3-q31',
        type: 'summary',
        question: '1930s - 1950s — Style of Period',
        correctAnswer: 'International Style // the International Style',
        evidence:
          'By the 1930s many buildings emerging from this movement were designed in the International Style.',
        explanation:
          'From the 1930s to the 1950s, the style characterized by geometric forms was the "International Style".',
        paragraphReference: 'Paragraph 5',
      },
      {
        id: 'c1-t1-p3-q32',
        type: 'summary',
        question: '1960s — Characteristics',
        correctAnswer: 'badly designed buildings // poorly designed buildings // multi-storey housing // multi-storey housing estates // low-cost high-rises // poorly designed',
        evidence:
          'But this led to many badly designed buildings... Influenced by Le Corbusier’s ideas on town planning, every large British city built multi-storey housing estates in the 1960s... Many of these buildings were poorly designed and constructed...',
        explanation:
          'The 1960s decline of Modernism using prefabricated sections resulted in "badly designed buildings" / "multi-storey housing estates".',
        paragraphReference: 'Paragraph 7',
      },
      {
        id: 'c1-t1-p3-q33',
        type: 'summary',
        question: '1970s (end of Modernist era) — Characteristics: .......... historic buildings',
        correctAnswer: 'preservation of // preserving',
        evidence:
          'By the 1970s, a new respect for the place of buildings within the existing townscape arose. Preserving historic buildings or keeping only their facades (or fronts) grew common.',
        explanation:
          'In the 1970s, "preserving" (or "preservation of") historic buildings became a key characteristic.',
        paragraphReference: 'Paragraph 9',
      },
      {
        id: 'c1-t1-p3-q34',
        type: 'summary',
        question: '1970s — Style of Period: beginning of .......... era',
        correctAnswer: 'High Tech // High-Tech',
        evidence:
          'The architectural style usually referred to as High Tech was also emerging. It celebrated scientific and engineering achievements by openly parading the sophisticated techniques used in construction.',
        explanation:
          'The 1970s style using metal and glass and parading sophisticated techniques was the "High Tech" era.',
        paragraphReference: 'Paragraph 9',
      },
      {
        id: 'c1-t1-p3-q35',
        type: 'summary',
        question: '1980s (Post-Modernism) — Characteristics',
        correctAnswer: 'coexistence of styles // different styles // coexistence of different styles // styles mixed',
        evidence:
          'By the 1980s the coexistence of different styles of architecture in the same building became known as Post Modern.',
        explanation:
          'Post-Modernism in the 1980s was characterized by the "coexistence of styles" (or "different styles").',
        paragraphReference: 'Paragraph 10',
      },
      {
        id: 'c1-t1-p3-q36',
        type: 'mcq',
        question: 'A rapid movement of people from rural areas to cities is triggered by technological advance.',
        options: [
          'A: The quality of life is improved.',
          'B: Architecture reflects the age.',
          'C: A number of these have been knocked down.',
          'D: Light steel frames and lifts are developed.',
          'E: Historical buildings are preserved.',
          'F: All decoration is removed.',
          'G: Parts of cities become slums.',
          'H: Modernist ideas cannot be put into practice until the second half of the 20th century.',
        ],
        correctAnswer: 'G',
        evidence:
          'Technological advances also helped bring about the decline of rural industries and an increase in urban populations as people moved to the towns to work in the new factories. Such rapid and uncontrolled growth helped to turn parts of cities into slums.',
        explanation:
          'Rapid rural-to-urban migration caused parts of cities to become slums (G).',
        paragraphReference: 'Paragraph 3',
      },
      {
        id: 'c1-t1-p3-q37',
        type: 'mcq',
        question: 'Buildings become simple and functional.',
        options: [
          'A: The quality of life is improved.',
          'B: Architecture reflects the age.',
          'C: A number of these have been knocked down.',
          'D: Light steel frames and lifts are developed.',
          'E: Historical buildings are preserved.',
          'F: All decoration is removed.',
          'G: Parts of cities become slums.',
          'H: Modernist ideas cannot be put into practice until the second half of the 20th century.',
        ],
        correctAnswer: 'F',
        evidence:
          'This was largely characterised by the bold use of new materials and simple, geometric forms... These were stripped of unnecessary decoration that would detract from their primary purpose — to be used or lived in.',
        explanation:
          'To make buildings simple and functional, all unnecessary decoration was removed (F).',
        paragraphReference: 'Paragraph 5',
      },
      {
        id: 'c1-t1-p3-q38',
        type: 'mcq',
        question: 'An economic depression and the second world war hit Europe.',
        options: [
          'A: The quality of life is improved.',
          'B: Architecture reflects the age.',
          'C: A number of these have been knocked down.',
          'D: Light steel frames and lifts are developed.',
          'E: Historical buildings are preserved.',
          'F: All decoration is removed.',
          'G: Parts of cities become slums.',
          'H: Modernist ideas cannot be put into practice until the second half of the 20th century.',
        ],
        correctAnswer: 'H',
        evidence:
          'But the economic depression of the 1930s and the second world war (1939-45) prevented their ideas from being widely realised until the economic conditions improved and war-torn cities had to be rebuilt. By the 1950s...',
        explanation:
          'The 1930s depression and WWII prevented Modernist ideas from being put into practice until the second half of the 20th century (H).',
        paragraphReference: 'Paragraph 6',
      },
      {
        id: 'c1-t1-p3-q39',
        type: 'mcq',
        question: 'Multi-storey housing estates are built according to contemporary ideas on town planning.',
        options: [
          'A: The quality of life is improved.',
          'B: Architecture reflects the age.',
          'C: A number of these have been knocked down.',
          'D: Light steel frames and lifts are developed.',
          'E: Historical buildings are preserved.',
          'F: All decoration is removed.',
          'G: Parts of cities become slums.',
          'H: Modernist ideas cannot be put into practice until the second half of the 20th century.',
        ],
        correctAnswer: 'C',
        evidence:
          'Influenced by Le Corbusier’s ideas on town planning, every large British city built multi-storey housing estates in the 1960s... Many of these buildings were poorly designed and constructed and have since been demolished.',
        explanation:
          'Many of these 1960s multi-storey housing estates have since been demolished / knocked down (C).',
        paragraphReference: 'Paragraph 8',
      },
      {
        id: 'c1-t1-p3-q40',
        type: 'mcq',
        question: 'Less land must be used for building.',
        options: [
          'A: The quality of life is improved.',
          'B: Architecture reflects the age.',
          'C: A number of these have been knocked down.',
          'D: Light steel frames and lifts are developed.',
          'E: Historical buildings are preserved.',
          'F: All decoration is removed.',
          'G: Parts of cities become slums.',
          'H: Modernist ideas cannot be put into practice until the second half of the 20th century.',
        ],
        correctAnswer: 'D',
        evidence:
          'Twentieth century architecture will mainly be remembered for its tall buildings. They have been made possible by the development of light steel frames and safe passenger lifts. They originated in the US over a century ago to help meet the demand for more economical use of land.',
        explanation:
          'The need for more economical use of land led to tall buildings made possible by developing light steel frames and lifts (D).',
        paragraphReference: 'Paragraph 11',
      },
    ],
  },

  /* =================================================================== */
  /* TEST 2 - PASSAGE 1: Right and left-handedness in humans (Q1-12)     */
  /* =================================================================== */
  {
    id: 'c1-t2-pass1',
    cambridgeSource: 'Cambridge IELTS 1, Test 2 - Reading Passage 1',
    title: 'Right and left-handedness in humans',
    paragraphs: [
      {
        label: 'Paragraph 1',
        text: 'Why do humans, virtually alone among all animal species, display a distinct left or right-handedness? Not even our closest relatives among the apes possess such decided lateral asymmetry, as psychologists call it. Yet about 90 per cent of every human population that has ever lived appears to have been right-handed. Professor Bryan Turner at Deakin University has studied the research literature on left-handedness and found that handedness goes with sidedness. So nine out of ten people are right-handed and eight are right-footed. He noted that this distinctive asymmetry in the human population is itself systematic. “Humans think in categories: black and white, up and down, left and right. It’s a system of signs that enables us to categorise phenomena that are essentially ambiguous.”',
      },
      {
        label: 'Paragraph 2',
        text: 'Research has shown that there is a genetic or inherited element to handedness. But while left-handedness tends to run in families, neither left nor right handers will automatically produce off-spring with the same handedness; in fact about 6 per cent of children with two right-handed parents will be left-handed. However, among two left-handed parents, perhaps 40 per cent of the children will also be left-handed. With one right and one left-handed parent, 15 to 20 per cent of the offspring will be left-handed. Even among identical twins who have exactly the same genes, one in six pairs will differ in their handedness.',
      },
      {
        label: 'Paragraph 3',
        text: 'What then makes people left-handed if it is not simply genetic? Other factors must be at work and researchers have turned to the brain for clues. In the 1860s the French surgeon and anthropologist, Dr Paul Broca, made the remarkable finding that patients who had lost their powers of speech as a result of a stroke (a blood clot in the brain) had paralysis of the right half of their body. He noted that since the left hemisphere of the brain controls the right half of their body, and vice versa, the brain damage must have been in the brain’s left hemisphere. Psychologists now believe that among right-handed people, probably 95 per cent have their language centre in the left hemisphere, while 5 per cent have right-sided language. Left-handers, however, do not show the reverse pattern but instead a majority also have their language in the left hemisphere. Some 30 per cent have right hemisphere language.',
      },
      {
        label: 'Paragraph 4',
        text: 'Dr Brinkman, a brain researcher at the Australian National University in Canberra, has suggested that evolution of speech went with right-handed preference. According to Brinkman, as the brain evolved, one side became specialised for fine control of movement (necessary for producing speech) and along with this evolution came right-hand preference. According to Brinkman, most left-handers have left hemisphere dominance but also some capacity in the right hemisphere. She has observed that if a left-handed person is brain-damaged in the left hemisphere, the recovery of speech is quite often better and this is explained by the fact that left-handers have a more bilateral speech function.',
      },
      {
        label: 'Paragraph 5',
        text: 'In her studies of macaque monkeys, Brinkman has noticed that primates (monkeys) seem to learn a hand preference from their mother in the first year of life but this could be one hand or the other. In humans, however, the specialisation in function of the two hemispheres results in anatomical differences: areas that are involved with the production of speech are usually larger on the left side than on the right. Since monkeys have not acquired the art of speech, one would not expect to see such a variation but Brinkman claims to have discovered a trend in monkeys towards the asymmetry that is evident in the human brain.',
      },
      {
        label: 'Paragraph 6',
        text: 'Two American researchers, Geschwind and Galaburda, studied the brains of human embryos and discovered that the left-right asymmetry exists before birth. But as the brain develops, a number of things can affect it. Every brain is initially female in its organisation and it only becomes a male brain when the male foetus begins to secrete hormones. Geschwind and Galaburda knew that different parts of the brain mature at different rates; the right hemisphere develops first, then the left. Moreover, a girl’s brain develops somewhat faster than that of a boy. So, if something happens to the brain’s development during pregnancy, it is more likely to be affected in a male and the hemisphere more likely to be involved is the left. The brain may become less lateralised and this in turn could result in left-handedness and the development of certain superior skills that have their origins in the left hemisphere such as logic, rationality and abstraction. It should be no surprise then that among mathematicians and architects, left-handers tend to be more common and there are more left-handed males than females.',
      },
      {
        label: 'Paragraph 7',
        text: 'The results of this research may be some consolation to left-handers who have for centuries lived in a world designed to suit right-handed people. However, what is alarming, according to Mr. Charles Moore, a writer and journalist, is the way the word “right” reinforces its own virtue. Subliminally he says, language tells people to think that anything on the right can be trusted while anything on the left is dangerous or even sinister. We speak of left-handed compliments and according to Moore, “it is no coincidence that left-handed children, forced to use their right hand, often develop a stammer as they are robbed of their freedom of speech”. However, as more research is undertaken on the causes of left-handedness, attitudes towards left-handed people are gradually changing for the better. Indeed when the champion tennis player Ivan Lendl was asked what the single thing was that he would choose in order to improve his game, he said he would like to become a left-hander.',
      },
    ],
    matchingContext: {
      title: 'Questions 1-7',
      instruction:
        'Use the information in the text to match the people (listed A-E) with the opinions (listed 1-7) below. Write the appropriate letter (A-E) in boxes 1-7 on your answer sheet. Some people match more than one opinion.',
      options: [
        { code: 'A', text: 'Dr Broca' },
        { code: 'B', text: 'Dr Brinkman' },
        { code: 'C', text: 'Geschwind and Galaburda' },
        { code: 'D', text: 'Charles Moore' },
        { code: 'E', text: 'Professor Turner' },
      ],
    },
    tableContext: {
      title: 'Percentage of children left-handed',
      headers: ["Parents' handedness", 'Percentage of children left-handed'],
      rows: [
        ['One parent left-handed\nOne parent right-handed', '(8) ........................................ %'],
        ['Both parents left-handed', '(9) ........................................ %'],
        ['Both parents right-handed', '(10) ........................................ %'],
      ],
    },
    questions: [
      {
        id: 'c1-t2-p1-q1',
        type: 'mcq',
        question: 'Human beings started to show a preference for right-handedness when they first developed language.',
        options: [
          'A: Dr Broca',
          'B: Dr Brinkman',
          'C: Geschwind and Galaburda',
          'D: Charles Moore',
          'E: Professor Turner',
        ],
        correctAnswer: 'B',
        evidence:
          'Dr Brinkman, a brain researcher at the Australian National University in Canberra, has suggested that evolution of speech went with right-handed preference.',
        explanation:
          'Dr Brinkman proposed that as the human brain evolved for speech, one side specialised in fine movement control, bringing right-hand preference.',
        explanationSi:
          'මිනිසුන් භාෂාව වර්ධනය කරගත් මුල් අවධියේදී දකුණත් භාවිතයට නැඹුරුවක් දැක්වූ බව යෝජනා කළේ Dr Brinkman (B) විසිනි (ඡේදය 4).',
        paragraphReference: 'Paragraph 4',
      },
      {
        id: 'c1-t2-p1-q2',
        type: 'mcq',
        question: 'Society is prejudiced against left-handed people.',
        options: [
          'A: Dr Broca',
          'B: Dr Brinkman',
          'C: Geschwind and Galaburda',
          'D: Charles Moore',
          'E: Professor Turner',
        ],
        correctAnswer: 'D',
        evidence:
          'However, what is alarming, according to Mr. Charles Moore, a writer and journalist, is the way the word “right” reinforces its own virtue. Subliminally he says, language tells people to think that anything on the right can be trusted while anything on the left is dangerous or even sinister.',
        explanation:
          'Charles Moore highlights how language and societal attitudes reinforce prejudice against left-handed people.',
        explanationSi:
          'සමාජය සහ භාෂාව වමත්කරුවන් කෙරෙහි අගතියකින් කටයුතු කරන බව පෙන්වා දෙන්නේ Charles Moore (D) ය (ඡේදය 7).',
        paragraphReference: 'Paragraph 7',
      },
      {
        id: 'c1-t2-p1-q3',
        type: 'mcq',
        question: 'Boys are more likely to be left-handed.',
        options: [
          'A: Dr Broca',
          'B: Dr Brinkman',
          'C: Geschwind and Galaburda',
          'D: Charles Moore',
          'E: Professor Turner',
        ],
        correctAnswer: 'C',
        evidence:
          'So, if something happens to the brain’s development during pregnancy, it is more likely to be affected in a male and the hemisphere more likely to be involved is the left... there are more left-handed males than females.',
        explanation:
          'Geschwind and Galaburda explained why male foetuses are more likely to experience left-hemisphere developmental shifts resulting in higher rates of left-handedness in boys.',
        explanationSi:
          'පිරිමි ළමුන් වමත්කරුවන් වීමේ වැඩි සම්භාවිතාවක් ඇති බව කලල පර්යේෂණ මගින් පෙන්වා දුන්නේ Geschwind and Galaburda (C) ය (ඡේදය 6).',
        paragraphReference: 'Paragraph 6',
      },
      {
        id: 'c1-t2-p1-q4',
        type: 'mcq',
        question: 'After a stroke, left-handed people recover their speech more quickly than right-handed people.',
        options: [
          'A: Dr Broca',
          'B: Dr Brinkman',
          'C: Geschwind and Galaburda',
          'D: Charles Moore',
          'E: Professor Turner',
        ],
        correctAnswer: 'B',
        evidence:
          'She has observed that if a left-handed person is brain-damaged in the left hemisphere, the recovery of speech is quite often better and this is explained by the fact that left-handers have a more bilateral speech function.',
        explanation:
          'Dr Brinkman observed better speech recovery in left-handers following left-hemisphere brain damage because their speech function is more bilateral.',
        explanationSi:
          'ආඝාතයකින් පසු වමත්කරුවන්ගේ කථන හැකියාව වඩා ඉක්මනින් යථා තත්ත්වයට පත්වන බව නිරීක්ෂණය කළේ Dr Brinkman (B) ය (ඡේදය 4).',
        paragraphReference: 'Paragraph 4',
      },
      {
        id: 'c1-t2-p1-q5',
        type: 'mcq',
        question: 'People who suffer strokes on the left side of the brain usually lose their power of speech.',
        options: [
          'A: Dr Broca',
          'B: Dr Brinkman',
          'C: Geschwind and Galaburda',
          'D: Charles Moore',
          'E: Professor Turner',
        ],
        correctAnswer: 'A',
        evidence:
          'In the 1860s the French surgeon and anthropologist, Dr Paul Broca, made the remarkable finding that patients who had lost their powers of speech as a result of a stroke (a blood clot in the brain) had paralysis of the right half of their body. He noted that... the brain damage must have been in the brain’s left hemisphere.',
        explanation:
          'Dr Paul Broca discovered the link between left-hemisphere stroke damage and loss of speech.',
        explanationSi:
          'මොළයේ වම් පැත්තේ ආඝාතයකට ලක්වූවන්ගේ කථන හැකියාව නැතිවන බව සොයාගත්තේ Dr Paul Broca (A) ය (ඡේදය 3).',
        paragraphReference: 'Paragraph 3',
      },
      {
        id: 'c1-t2-p1-q6',
        type: 'mcq',
        question: 'The two sides of the brain develop different functions before birth.',
        options: [
          'A: Dr Broca',
          'B: Dr Brinkman',
          'C: Geschwind and Galaburda',
          'D: Charles Moore',
          'E: Professor Turner',
        ],
        correctAnswer: 'C',
        evidence:
          'Two American researchers, Geschwind and Galaburda, studied the brains of human embryos and discovered that the left-right asymmetry exists before birth.',
        explanation:
          'Geschwind and Galaburda studied human embryos and proved that left-right hemisphere asymmetry is present prior to birth.',
        explanationSi:
          'උපතට පෙරම මොළයේ දෙපැත්ත විවිධ කාර්යයන් වර්ධනය කරගන්නා බව සොයාගත්තේ Geschwind and Galaburda (C) ය (ඡේදය 6).',
        paragraphReference: 'Paragraph 6',
      },
      {
        id: 'c1-t2-p1-q7',
        type: 'mcq',
        question: 'Asymmetry is a common feature of the human body.',
        options: [
          'A: Dr Broca',
          'B: Dr Brinkman',
          'C: Geschwind and Galaburda',
          'D: Charles Moore',
          'E: Professor Turner',
        ],
        correctAnswer: 'E',
        evidence:
          'Professor Bryan Turner at Deakin University has studied the research literature on left-handedness and found that handedness goes with sidedness. So nine out of ten people are right-handed and eight are right-footed. He noted that this distinctive asymmetry in the human population is itself systematic.',
        explanation:
          'Professor Turner demonstrated that asymmetry (handedness and footedness) is a systematic, common feature across the human population.',
        explanationSi:
          'අසමමිතිය මිනිස් සිරුරේ පොදු ලක්ෂණයක් බව පෙන්වා දුන්නේ Professor Turner (E) ය (ඡේදය 1).',
        paragraphReference: 'Paragraph 1',
      },
      {
        id: 'c1-t2-p1-q8',
        type: 'summary',
        question: 'One parent left-handed, One parent right-handed (% left-handed)',
        correctAnswer: '15-20% // 15 to 20% // 15-20 // 15 to 20 // 15–20% // 15–20',
        evidence:
          'With one right and one left-handed parent, 15 to 20 per cent of the offspring will be left-handed.',
        explanation:
          'Paragraph 2 explicitly states that with one right-handed and one left-handed parent, 15 to 20 per cent of the children will be left-handed.',
        explanationSi:
          'එක් මව්පියෙකු වමත් සහ අනෙකා දකුණත් වූ විට දරුවන් වමත් වීමේ ප්‍රතිශතය 15–20% කි (ඡේදය 2).',
        paragraphReference: 'Paragraph 2',
      },
      {
        id: 'c1-t2-p1-q9',
        type: 'summary',
        question: 'Both parents left-handed (% left-handed)',
        correctAnswer: '40% // 40 // 40 percent',
        evidence:
          'However, among two left-handed parents, perhaps 40 per cent of the children will also be left-handed.',
        explanation:
          'Paragraph 2 states that when both parents are left-handed, 40 per cent of the children will also be left-handed.',
        explanationSi:
          'දෙමාපියන් දෙදෙනාම වමත් වූ විට දරුවන් වමත් වීමේ ප්‍රතිශතය 40% කි (ඡේදය 2).',
        paragraphReference: 'Paragraph 2',
      },
      {
        id: 'c1-t2-p1-q10',
        type: 'summary',
        question: 'Both parents right-handed (% left-handed)',
        correctAnswer: '6% // 6 // 6 percent',
        evidence:
          '...in fact about 6 per cent of children with two right-handed parents will be left-handed.',
        explanation:
          'Paragraph 2 reports that about 6 per cent of children with two right-handed parents will be left-handed.',
        explanationSi:
          'දෙමාපියන් දෙදෙනාම දකුණත් වූ විට දරුවන් වමත් වීමේ ප්‍රතිශතය 6% කි (ඡේදය 2).',
        paragraphReference: 'Paragraph 2',
      },
      {
        id: 'c1-t2-p1-q11',
        type: 'mcq',
        question: 'A study of monkeys has shown that',
        options: [
          'A: monkeys are not usually right-handed.',
          'B: monkeys display a capacity for speech.',
          'C: monkey brains are smaller than human brains.',
          'D: monkey brains are asymmetric.',
        ],
        correctAnswer: 'D',
        evidence:
          'Since monkeys have not acquired the art of speech, one would not expect to see such a variation but Brinkman claims to have discovered a trend in monkeys towards the asymmetry that is evident in the human brain.',
        explanation:
          'Dr Brinkman discovered a trend in monkey brains toward structural asymmetry similar to that seen in the human brain.',
        explanationSi:
          'වඳුරන්ගේ මොළයද මිනිස් මොළය මෙන් අසමමිතික (asymmetric - D) බව අධ්‍යයනයෙන් හෙළි විය (ඡේදය 5).',
        paragraphReference: 'Paragraph 5',
      },
      {
        id: 'c1-t2-p1-q12',
        type: 'mcq',
        question: 'According to the writer, left-handed people',
        options: [
          'A: will often develop a stammer.',
          'B: have undergone hardship for years.',
          'C: are untrustworthy.',
          'D: are good tennis players.',
        ],
        correctAnswer: 'B',
        evidence:
          'The results of this research may be some consolation to left-handers who have for centuries lived in a world designed to suit right-handed people.',
        explanation:
          'The writer notes that left-handers have lived for centuries in a world built for right-handers, undergoing long-standing hardship.',
        explanationSi:
          'කතුවරයාට අනුව වමත්කරුවන් සියවස් ගණනාවක් තිස්සේ දුෂ්කරතාවලට මුහුණ දී ඇත (B) (ඡේදය 7).',
        paragraphReference: 'Paragraph 7',
      },
    ],
  },

  /* ------------------------------------------------------------------- */
  /* PASSAGE 2: MIGRATORY BEEKEEPING - Taking Wing (Questions 13-27)     */
  /* ------------------------------------------------------------------- */
  {
    id: 'c1-t2-pass2',
    cambridgeSource: 'Cambridge IELTS 1, Test 2 - Reading Passage 2',
    title: 'MIGRATORY BEEKEEPING — Taking Wing',
    paragraphs: [
      {
        label: 'Paragraph 1',
        text: 'To eke out a full-time living from their honeybees, about half the nation’s 2,000 commercial beekeepers pull up stakes each spring, migrating north to find more flowers for their bees. Besides turning floral nectar into honey, these hardworking insects also pollinate crops for farmers -for a fee. As autumn approaches, the beekeepers pack up their hives and go south, scrambling for pollination contracts in hot spots like California’s fertile Central Valley.',
      },
      {
        label: 'Paragraph 2',
        text: 'Of the 2,000 commercial beekeepers in the United States about half migrate This pays off in two ways Moving north in the summer and south in the winter lets bees work a longer blooming season, making more honey — and money — for their keepers. Second, beekeepers can carry their hives to farmers who need bees to pollinate their crops. Every spring a migratory beekeeper in California may move up to 160 million bees to flowering fields in Minnesota and every winter his family may haul the hives back to California, where farmers will rent the bees to pollinate almond and cherry trees.',
      },
      {
        label: 'Paragraph 3',
        text: 'Migratory beekeeping is nothing new. The ancient Egyptians moved clay hives, probably on rafts, down the Nile to follow the bloom and nectar flow as it moved toward Cairo. In the 1880s North American beekeepers experimented with the same idea, moving bees on barges along the Mississippi and on waterways in Florida, but their lighter, wooden hives kept falling into the water. Other keepers tried the railroad and horse-drawn wagons, but that didn’t prove practical. Not until the 1920s when cars and trucks became affordable and roads improved, did migratory beekeeping begin to catch on.',
      },
      {
        label: 'Paragraph 4',
        text: 'For the Californian beekeeper, the pollination season begins in February. At this time, the beehives are in particular demand by farmers who have almond groves; they need two hives an acre. For the three-week long bloom, beekeepers can hire out their hives for $32 each. It’s a bonanza for the bees too. Most people consider almond honey too bitter to eat so the bees get to keep it for themselves.',
      },
      {
        label: 'Paragraph 5',
        text: 'By early March it is time to move the bees. It can take up to seven nights to pack the 4,000 or so hives that a beekeeper may own. These are not moved in the middle of the day because too many of the bees would end up homeless. But at night, the hives are stacked onto wooden pallets, back-to-back in sets of four, and lifted onto a truck. It is not necessary to wear gloves or a beekeeper’s veil because the hives are not being opened and the bees should remain relatively quiet. Just in case some are still lively, bees can be pacified with a few puffs of smoke blown into each hive’s narrow entrance.',
      },
      {
        label: 'Paragraph 6',
        text: 'In their new location, the beekeeper will pay the farmer to allow his bees to feed in such places as orange groves. The honey produced here is fragrant and sweet and can be sold by the beekeepers. To encourage the bees to produce as much honey as possible during this period, the beekeepers open the hives and stack extra boxes called supers on top. These temporary hive extensions contain frames of empty comb for the bees to fill with honey. In the brood chamber below, the bees will stash honey to eat later. To prevent the queen from crawling up to the top and laying eggs, a screen can be inserted between the brood chamber and the supers. Three weeks later the honey can be gathered.',
      },
      {
        label: 'Paragraph 7',
        text: 'Foul smelling chemicals are often used to irritate the bees and drive them down into the hive’s bottom boxes, leaving the honey-filled supers more or less bee free. These can then be pulled off the hive. They are heavy with honey and may weigh up to 90 pounds each. The supers are taken to a warehouse. In the extracting room, the frames are lilted out and lowered into an “uncapper” where rotating blades shave away the wax that covers each cell. The uncapped frames are put in a carousel that sits on the bottom of a large stainless steel drum. The carousel is filled to capacity with 72 frames. A switch is flipped and the frames begin to whirl at 300 revolutions per minute; centrifugal force throws the honey out of the combs. Finally the honey is poured into barrels for shipment.',
      },
      {
        label: 'Paragraph 8',
        text: 'After this, approximately a quarter of the hives weakened by disease, mites, or an ageing or dead queen, will have to be replaced. To create new colonies, a healthy double hive, teeming with bees, can be separated into two boxes. One half will hold the queen and a young, already mated queen can be put in the other half, to make two hives from one. By the time the flowers bloom, the new queens will be laying eggs, filling each hive with young worker bees. The beekeeper’s family will then migrate with them to their summer location.',
      },
    ],
    wordBank: [
      'smoke',
      'barrels',
      'set off',
      'pollinate',
      'combs',
      'full',
      'chemicals',
      'protection',
      'light',
      'machines',
      'screen',
      'empty',
      'pay',
      'charge',
      'split',
      'supers',
      'prepare',
      'queens',
    ],
    summaryContext: {
      title: 'BEEKEEPER MOVEMENTS (Questions 13–19)',
      instruction:
        'The flow chart below outlines the movements of the migratory beekeeper as described in Reading Passage 2. Complete the flow chart. Choose your answers from the box and write your answers in boxes 13–19 on your answer sheet.',
      exampleText: 'In February, Californian farmers hire bees to help .......... almond trees.',
      exampleAnswer: 'pollinate',
      fullText:
        'Example: In February, Californian farmers hire bees to help pollinate almond trees.\n↓\nIn March, beekeepers (13) .......... for migration at night when the hives are (14) .......... and the bees are generally tranquil. A little (15) .......... can ensure that this is the case.\n↓\nThey transport their hives to orange groves where farmers (16) .......... beekeepers for placing them on their land. Here the bees make honey.\n↓\nAfter three weeks, the supers can be taken to a warehouse where (17) .......... are used to remove the wax and extract the honey from the (18) .......... .\n↓\nAfter the honey collection, the old hives are rejected. Good double hives are (19) .......... and re-queened and the beekeeper transports them to their summer base.',
    },
    questions: [
      {
        id: 'c1-t2-p2-q13',
        type: 'summary',
        question: 'In March, beekeepers (13) .......... for migration at night',
        correctAnswer: 'prepare // set off',
        evidence:
          'By early March it is time to move the bees. It can take up to seven nights to pack the 4,000 or so hives that a beekeeper may own.',
        explanation:
          'In early March, beekeepers spend up to seven nights packing and preparing their hives for migration.',
        explanationSi:
          'මාර්තු මාසයේදී මීමැසි පාලකයන් රාත්‍රී කාලයේදී සංක්‍රමණය සඳහා සූදානම් වේ (prepare) (ඡේදය 5).',
        paragraphReference: 'Paragraph 5',
      },
      {
        id: 'c1-t2-p2-q14',
        type: 'summary',
        question: 'when the hives are (14) .......... and the bees are generally tranquil.',
        correctAnswer: 'full',
        evidence:
          'These are not moved in the middle of the day because too many of the bees would end up homeless. But at night, the hives are stacked onto wooden pallets...',
        explanation:
          'Hives are moved at night when all the foraging bees have returned inside, so the hives are full rather than missing daytime foragers.',
        explanationSi:
          'රාත්‍රී කාලයේදී සියලුම මීමැස්සන් වදය තුළ සිටින බැවින් මී වද පිරී පවතී (full) (ඡේදය 5).',
        paragraphReference: 'Paragraph 5',
      },
      {
        id: 'c1-t2-p2-q15',
        type: 'summary',
        question: 'A little (15) .......... can ensure that this is the case.',
        correctAnswer: 'smoke',
        evidence:
          'Just in case some are still lively, bees can be pacified with a few puffs of smoke blown into each hive’s narrow entrance.',
        explanation:
          'A few puffs of smoke blown into the hive entrance pacifies the bees and keeps them tranquil.',
        explanationSi:
          'මීමැස්සන් සන්සුන්ව තැබීමට දුම් ස්වල්පයක් (smoke) භාවිතා කළ හැක (ඡේදය 5).',
        paragraphReference: 'Paragraph 5',
      },
      {
        id: 'c1-t2-p2-q16',
        type: 'summary',
        question: 'They transport their hives to orange groves where farmers (16) .......... beekeepers for placing them on their land.',
        correctAnswer: 'charge',
        evidence:
          'In their new location, the beekeeper will pay the farmer to allow his bees to feed in such places as orange groves.',
        explanation:
          'Since the beekeeper pays the farmer, the farmers charge the beekeepers for placing hives on their orange groves.',
        explanationSi:
          'දොඩම් වතුවල මී වද තැබීම සඳහා ගොවීන් මීමැසි පාලකයන්ගෙන් මුදල් අය කරයි (charge) (ඡේදය 6).',
        paragraphReference: 'Paragraph 6',
      },
      {
        id: 'c1-t2-p2-q17',
        type: 'summary',
        question: 'After three weeks, the supers can be taken to a warehouse where (17) .......... are used to remove the wax',
        correctAnswer: 'machines',
        evidence:
          'In the extracting room, the frames are lifted out and lowered into an “uncapper” where rotating blades shave away the wax... The uncapped frames are put in a carousel...',
        explanation:
          'Mechanical devices (machines: the uncapper and the whirling stainless-steel carousel) remove the wax and spin out the honey.',
        explanationSi:
          'ඉටි ඉවත් කර මී පැණි නිස්සාරණය කිරීමට යන්ත්‍ර (machines) භාවිතා කෙරේ (ඡේදය 7).',
        paragraphReference: 'Paragraph 7',
      },
      {
        id: 'c1-t2-p2-q18',
        type: 'summary',
        question: 'and extract the honey from the (18) .......... .',
        correctAnswer: 'combs',
        evidence:
          'A switch is flipped and the frames begin to whirl at 300 revolutions per minute; centrifugal force throws the honey out of the combs.',
        explanation:
          'Centrifugal force in the spinning carousel extracts the honey from the combs.',
        explanationSi:
          'කේන්ද්‍රාපසාරී බලය මගින් මී වදවලින් (combs) පැණි ඉවත් කරනු ලැබේ (ඡේදය 7).',
        paragraphReference: 'Paragraph 7',
      },
      {
        id: 'c1-t2-p2-q19',
        type: 'summary',
        question: 'Good double hives are (19) .......... and re-queened and the beekeeper transports them to their summer base.',
        correctAnswer: 'split',
        evidence:
          'To create new colonies, a healthy double hive, teeming with bees, can be separated into two boxes.',
        explanation:
          'Healthy double hives are separated into two boxes (split) and given a young mated queen.',
        explanationSi:
          'නිරෝගී ද්විත්ව මී වද දෙකට බෙදා (split) නව රැජිනන් යොදනු ලැබේ (ඡේදය 8).',
        paragraphReference: 'Paragraph 8',
      },
      {
        id: 'c1-t2-p2-q20',
        type: 'summary',
        question: 'Diagram Label 20: Frames of .......... (inside the top supers)',
        correctAnswer: 'empty comb // comb',
        evidence:
          'These temporary hive extensions contain frames of empty comb for the bees to fill with honey.',
        explanation:
          'Paragraph 6 explains that the supers stacked on top contain frames of empty comb.',
        explanationSi:
          'ඉහළින් තබන supers පෙට්ටි තුළ හිස් මී වද රාමු (empty comb) අඩංගු වේ (ඡේදය 6).',
        paragraphReference: 'Paragraph 6',
      },
      {
        id: 'c1-t2-p2-q21',
        type: 'summary',
        question: 'Diagram Label 21: .......... (inserted between the supers and the bottom chamber)',
        correctAnswer: 'screen',
        evidence:
          'To prevent the queen from crawling up to the top and laying eggs, a screen can be inserted between the brood chamber and the supers.',
        explanation:
          'A screen is placed between the lower brood chamber and the upper supers to keep the queen below.',
        explanationSi:
          'රැජින ඉහළට යාම වැළැක්වීමට brood chamber සහ supers අතර දැලක් (screen) යොදනු ලැබේ (ඡේදය 6).',
        paragraphReference: 'Paragraph 6',
      },
      {
        id: 'c1-t2-p2-q22',
        type: 'summary',
        question: 'Diagram Label 22: .......... (lower box where the queen lays eggs and bees store food)',
        correctAnswer: 'brood chamber',
        evidence:
          'In the brood chamber below, the bees will stash honey to eat later.',
        explanation:
          'The bottom chamber of the hive is called the brood chamber.',
        explanationSi:
          'මී වදයේ පහළ කොටස හඳුන්වන්නේ brood chamber ලෙසයි (ඡේදය 6).',
        paragraphReference: 'Paragraph 6',
      },
      {
        id: 'c1-t2-p2-q23',
        type: 'summary',
        question: 'Diagram Label 23: .......... (bottom opening of the hive)',
        correctAnswer: 'narrow entrance // entrance',
        evidence:
          'Just in case some are still lively, bees can be pacified with a few puffs of smoke blown into each hive’s narrow entrance.',
        explanation:
          'At the base of each hive is the narrow entrance through which bees enter and smoke can be puffed.',
        explanationSi:
          'මී වදයේ පහළ ඇති පටු පිවිසුම narrow entrance ලෙස හැඳින්වේ (ඡේදය 5).',
        paragraphReference: 'Paragraph 5',
      },
      {
        id: 'c1-t2-p2-q24',
        type: 'TFNG',
        question: 'The Egyptians keep bees on the banks of the Nile.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NOT GIVEN',
        evidence:
          'The ancient Egyptians moved clay hives, probably on rafts, down the Nile to follow the bloom and nectar flow as it moved toward Cairo.',
        explanation:
          'The passage only mentions that ancient Egyptians moved clay hives on rafts down the Nile; it gives no information on whether Egyptians today keep bees on the banks of the Nile.',
        explanationSi:
          'පැරණි ඊජිප්තු ජාතිකයන් නයිල් ගඟ දිගේ පාරුවලින් මී වද ගෙන ගිය බව පමණක් සඳහන් වන අතර, වර්තමානයේ ගං ඉවුරේ මීමැසි පාලනය කරන බවක් සඳහන් නොවේ (NOT GIVEN).',
        paragraphReference: 'Paragraph 3',
      },
      {
        id: 'c1-t2-p2-q25',
        type: 'TFNG',
        question: 'First attempts at migratory beekeeping in America were unsuccessful.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'YES',
        evidence:
          'In the 1880s North American beekeepers experimented with the same idea, moving bees on barges along the Mississippi and on waterways in Florida, but their lighter, wooden hives kept falling into the water. Other keepers tried the railroad and horse-drawn wagons, but that didn’t prove practical.',
        explanation:
          'Early 1880s North American experiments with barges, railroads, and horse-drawn wagons failed until trucks and roads improved in the 1920s.',
        explanationSi:
          'ඇමරිකාවේ සංක්‍රමණික මීමැසි පාලනය සඳහා ගත් මුල් උත්සාහයන් අසාර්ථක වූ බව 3 වන ඡේදයේ පැහැදිලිව දැක්වේ (YES).',
        paragraphReference: 'Paragraph 3',
      },
      {
        id: 'c1-t2-p2-q26',
        type: 'TFNG',
        question: 'Bees keep honey for themselves in the bottom of the hive.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'YES',
        evidence:
          'In the brood chamber below, the bees will stash honey to eat later.',
        explanation:
          'Paragraph 6 explicitly confirms that in the brood chamber below (the bottom of the hive), the bees stash honey to eat later.',
        explanationSi:
          'මී වදයේ පහළ කොටසේ (brood chamber below) මීමැස්සන් තමන්ගේ පරිභෝජනය සඳහා මී පැණි තැන්පත් කර ගන්නා බව සඳහන් වේ (YES).',
        paragraphReference: 'Paragraph 6',
      },
      {
        id: 'c1-t2-p2-q27',
        type: 'TFNG',
        question: 'The honey is spun to make it liquid.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NO',
        evidence:
          'A switch is flipped and the frames begin to whirl at 300 revolutions per minute; centrifugal force throws the honey out of the combs.',
        explanation:
          'The frames are spun so that centrifugal force throws the honey out of the combs, NOT to make the honey liquid.',
        explanationSi:
          'මී වද කරකවනු ලබන්නේ කේන්ද්‍රාපසාරී බලයෙන් මී පැණි වදවලින් ඉවතට ගැනීමට මිස එය දියරයක් බවට පත් කිරීමට නොවේ (NO).',
        paragraphReference: 'Paragraph 7',
      },
    ],
  },

  /* ------------------------------------------------------------------- */
  /* PASSAGE 3: TOURISM (Questions 28-41)                                */
  /* ------------------------------------------------------------------- */
  {
    id: 'c1-t2-pass3',
    cambridgeSource: 'Cambridge IELTS 1, Test 2 - Reading Passage 3',
    title: 'TOURISM',
    paragraphs: [
      {
        label: 'Paragraph A',
        text: 'Tourism, holidaymaking and travel are these days more significant social phenomena than most commentators have considered. On the face of it there could not be a more trivial subject for a book. And indeed since social scientists have had considerable difficulty explaining weightier topics such as work or politics it might be thought that they would have great difficulties in accounting for more trivial phenomena such as holidaymaking. However there are interesting parallels with the study of deviance. This involves the investigation of bizarre and idiosyncratic social practices which happen to be defined as deviant in some societies but not necessarily in others. The assumption is that the investigation of deviance can reveal interesting and significant aspects of normal societies. It could be said that a similar analysis can be applied to tourism.',
      },
      {
        label: 'Paragraph B',
        text: 'Tourism is a leisure activity which presupposes its opposite namely regulated and organised work. It is one manifestation of how work and leisure are organised as separate and regulated spheres of social practice in modern societies. Indeed acting as a tourist is one of the defining characteristics of being “modern” and the popular concept of tourism is that it is organised within particular places and occurs for regularised periods of time. Tourist relationships arise from a movement of people to and their stay in various destinations. This necessarily involves some movement, that is the journey, and a period of stay in a new place or places. The journey and the stay are by definition outside the normal places of residence and work and are of a short term and temporary nature and there is a clear intention to return “home” within a relatively short period of time.',
      },
      {
        label: 'Paragraph C',
        text: 'A substantial proportion of the population of modern societies engages in such tourist practices; new socialised forms of provision have developed in order to cope with the mass character of the gazes of tourists as opposed to the individual character of travel. Places are chosen to be visited and be gazed upon because there is an anticipation, especially through daydreaming and fantasy, of intense pleasures, either on a different scale or involving different senses from those customarily encountered. Such anticipation is constructed and sustained through a variety of non-tourist practices such as films, TV, literature, magazines, records and videos which construct and reinforce this daydreaming.',
      },
      {
        label: 'Paragraph D',
        text: 'Tourists tend to visit features of landscape and townscape which separate them off from everyday experience. Such aspects are viewed because they are taken to be in some sense out of the ordinary. The viewing of these tourist sights often involves different forms of social patterning with a much greater sensitivity to visual elements of landscape or townscape than is normally found in everyday life. People linger over these sights in a way that they would not normally do in their home environment and the vision is objectified or captured through photographs, postcards, films and so on which enable the memory to be endlessly reproduced and recaptured.',
      },
      {
        label: 'Paragraph E',
        text: 'One of the earliest dissertations on the subject of tourism is Boorstin’s analysis of the “pseudo event” (1964) where he argues that contemporary Americans cannot experience “reality” directly, but thrive on “pseudo events”. Isolated from the host environment and the local people, the mass tourist travels in guided groups and finds pleasure in inauthentic contrived attractions, gullibly enjoying the “pseudo events” and disregarding the “real” world outside. Over time, the images generated of different tourist sights come to constitute a closed self-perpetuating system of illusions which provide the tourist with the basis for selecting and evaluating potential places to visit. Such visits are made, says Boorstin, within the “environmental bubble” of the familiar American style hotel which insulates the tourist from the strangeness of the host environment.',
      },
      {
        label: 'Paragraph F',
        text: 'To service the burgeoning tourist industry, an array of professionals has developed who attempt to reproduce ever-new objects for the tourist to look at. These objects or places are located in a complex and changing hierarchy. This depends upon the interplay between, on the one hand, competition between interests involved in the provision of such objects and, on the other hand, changing class, gender, and generational distinctions of taste within the potential population of visitors. It has been said that to be a tourist is one of the characteristics of the “modern experience”. Not to go away is like not possessing a car or a nice house. Travel is a marker of status in modern societies and is also thought to be necessary for good health. The role of the professional, therefore, is to cater for the needs and tastes of the tourists in accordance with their class and overall expectations.',
      },
    ],
    matchingContext: {
      title: 'List of Headings (Questions 28–32)',
      instruction:
        'Choose the correct heading for each section from the list of headings below. Write the appropriate numbers (i–ix) in boxes 28–32 on your answer sheet. Paragraph D has been done for you as an example (ix).',
      options: [
        { code: 'i', text: 'The politics of tourism' },
        { code: 'ii', text: 'The cost of tourism' },
        { code: 'iii', text: 'Justifying the study of tourism' },
        { code: 'iv', text: 'Tourism contrasted with travel' },
        { code: 'v', text: 'The essence of modern tourism' },
        { code: 'vi', text: 'Tourism versus leisure' },
        { code: 'vii', text: 'The artificiality of modern tourism' },
        { code: 'viii', text: 'The role of modern tour guides' },
        { code: 'ix', text: 'Creating an alternative to the everyday experience (Example: Paragraph D)' },
      ],
    },
    questions: [
      {
        id: 'c1-t2-p3-q28',
        type: 'headings',
        question: 'Paragraph A',
        options: [
          'i: The politics of tourism',
          'ii: The cost of tourism',
          'iii: Justifying the study of tourism',
          'iv: Tourism contrasted with travel',
          'v: The essence of modern tourism',
          'vi: Tourism versus leisure',
          'vii: The artificiality of modern tourism',
          'viii: The role of modern tour guides',
          'ix: Creating an alternative to the everyday experience',
        ],
        correctAnswer: 'iii',
        evidence:
          'On the face of it there could not be a more trivial subject for a book... However there are interesting parallels with the study of deviance... It could be said that a similar analysis can be applied to tourism.',
        explanation:
          'Paragraph A explains why tourism—despite appearing trivial at first glance—deserves serious sociological study, just like the study of deviance.',
        explanationSi:
          'සංචාරක ව්‍යාපාරය බැලූ බැල්මට සුළු කරුණක් ලෙස පෙනුනද එය අධ්‍යයනය කිරීමේ වැදගත්කම A ඡේදයෙන් සාධාරණීකරණය කරයි (iii).',
        paragraphReference: 'Paragraph A',
      },
      {
        id: 'c1-t2-p3-q29',
        type: 'headings',
        question: 'Paragraph B',
        options: [
          'i: The politics of tourism',
          'ii: The cost of tourism',
          'iii: Justifying the study of tourism',
          'iv: Tourism contrasted with travel',
          'v: The essence of modern tourism',
          'vi: Tourism versus leisure',
          'vii: The artificiality of modern tourism',
          'viii: The role of modern tour guides',
          'ix: Creating an alternative to the everyday experience',
        ],
        correctAnswer: 'v',
        evidence:
          'Indeed acting as a tourist is one of the defining characteristics of being “modern” and the popular concept of tourism is that it is organised within particular places and occurs for regularised periods of time.',
        explanation:
          'Paragraph B defines the fundamental nature and core characteristics (the essence) of modern tourism: separation from regulated work, movement to destinations, and temporary stay before returning home.',
        explanationSi:
          'නූතන සංචාරක ව්‍යාපාරයේ මූලික ස්වභාවය සහ ලක්ෂණ B ඡේදයෙන් විස්තර කරයි (v - The essence of modern tourism).',
        paragraphReference: 'Paragraph B',
      },
      {
        id: 'c1-t2-p3-q30',
        type: 'headings',
        question: 'Paragraph C',
        options: [
          'i: The politics of tourism',
          'ii: The cost of tourism',
          'iii: Justifying the study of tourism',
          'iv: Tourism contrasted with travel',
          'v: The essence of modern tourism',
          'vi: Tourism versus leisure',
          'vii: The artificiality of modern tourism',
          'viii: The role of modern tour guides',
          'ix: Creating an alternative to the everyday experience',
        ],
        correctAnswer: 'iv',
        evidence:
          '...new socialised forms of provision have developed in order to cope with the mass character of the gazes of tourists as opposed to the individual character of travel.',
        explanation:
          'Paragraph C contrasts the mass, socially organized character of modern tourism with the individual character of travel.',
        explanationSi:
          'සංචාරක ව්‍යාපාරයේ (tourism) සාමූහික ස්වභාවය සහ පුද්ගලික ගමන් බිමන් (travel) අතර වෙනස C ඡේදයෙන් දක්වයි (iv).',
        paragraphReference: 'Paragraph C',
      },
      {
        id: 'c1-t2-p3-q31',
        type: 'headings',
        question: 'Paragraph E',
        options: [
          'i: The politics of tourism',
          'ii: The cost of tourism',
          'iii: Justifying the study of tourism',
          'iv: Tourism contrasted with travel',
          'v: The essence of modern tourism',
          'vi: Tourism versus leisure',
          'vii: The artificiality of modern tourism',
          'viii: The role of modern tour guides',
          'ix: Creating an alternative to the everyday experience',
        ],
        correctAnswer: 'vii',
        evidence:
          'One of the earliest dissertations on the subject of tourism is Boorstin’s analysis of the “pseudo event” (1964)... finds pleasure in inauthentic contrived attractions, gullibly enjoying the “pseudo events”...',
        explanation:
          'Paragraph E discusses Boorstin’s critique of "pseudo events", inauthentic contrived attractions, and illusions—the artificiality of modern tourism.',
        explanationSi:
          'නූතන සංචාරක ව්‍යාපාරයේ කෘත්‍රිම බව ("pseudo events" / inauthentic contrived attractions) E ඡේදයෙන් විස්තර කෙරේ (vii).',
        paragraphReference: 'Paragraph E',
      },
      {
        id: 'c1-t2-p3-q32',
        type: 'headings',
        question: 'Paragraph F',
        options: [
          'i: The politics of tourism',
          'ii: The cost of tourism',
          'iii: Justifying the study of tourism',
          'iv: Tourism contrasted with travel',
          'v: The essence of modern tourism',
          'vi: Tourism versus leisure',
          'vii: The artificiality of modern tourism',
          'viii: The role of modern tour guides',
          'ix: Creating an alternative to the everyday experience',
        ],
        correctAnswer: 'i',
        evidence:
          'These objects or places are located in a complex and changing hierarchy. This depends upon the interplay between, on the one hand, competition between interests involved in the provision of such objects and, on the other hand, changing class, gender, and generational distinctions of taste... Travel is a marker of status in modern societies...',
        explanation:
          'Paragraph F examines competing commercial interests, social hierarchy, status, class, gender, and generational power dynamics—the politics of tourism.',
        explanationSi:
          'සමාජ පන්තිය, තත්ත්වය (status) සහ විවිධ අවශ්‍යතා අතර තරඟකාරීත්වය හෙවත් සංචාරක ව්‍යාපාරයේ දේශපාලනය F ඡේදයෙන් විස්තර කරයි (i).',
        paragraphReference: 'Paragraph F',
      },
      {
        id: 'c1-t2-p3-q33',
        type: 'TFNG',
        question: 'Tourism is a trivial subject.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NO',
        evidence:
          'Tourism, holidaymaking and travel are these days more significant social phenomena than most commentators have considered. On the face of it there could not be a more trivial subject for a book.',
        explanation:
          'Although on the surface it might seem trivial, the writer explicitly states that tourism is a much more significant social phenomenon than commentators have considered.',
        explanationSi:
          'සංචාරක ව්‍යාපාරය සුළු හෝ නොවැදගත් විෂයයක් නොව ඉතා වැදගත් සමාජ සංසිද්ධියක් බව කතුවරයා පවසයි (NO).',
        paragraphReference: 'Paragraph A',
      },
      {
        id: 'c1-t2-p3-q34',
        type: 'TFNG',
        question: 'An analysis of deviance can act as a model for the analysis of tourism.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'YES',
        evidence:
          'However there are interesting parallels with the study of deviance... The assumption is that the investigation of deviance can reveal interesting and significant aspects of normal societies. It could be said that a similar analysis can be applied to tourism.',
        explanation:
          'Paragraph A directly states that a similar analysis to the study of deviance can be applied to tourism.',
        explanationSi:
          'අපගමනය (deviance) පිළිබඳ විශ්ලේෂණය සංචාරක ව්‍යාපාරය විශ්ලේෂණය කිරීමටද ආදර්ශයක් ලෙස යොදාගත හැකි බව කතුවරයා පවසයි (YES).',
        paragraphReference: 'Paragraph A',
      },
      {
        id: 'c1-t2-p3-q35',
        type: 'TFNG',
        question: 'Tourists usually choose to travel overseas.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NOT GIVEN',
        evidence:
          'The journey and the stay are by definition outside the normal places of residence and work...',
        explanation:
          'The passage mentions traveling outside normal places of residence and work, but never states whether tourists usually travel overseas or domestically.',
        explanationSi:
          'සංචාරකයන් බොහෝ විට විදේශගත වීමට තෝරා ගන්නා බවක් ඡේදයේ සඳහන් නොවේ (NOT GIVEN).',
        paragraphReference: 'Paragraph B',
      },
      {
        id: 'c1-t2-p3-q36',
        type: 'TFNG',
        question: 'Tourists focus more on places they visit than those at home.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'YES',
        evidence:
          'The viewing of these tourist sights often involves different forms of social patterning with a much greater sensitivity to visual elements of landscape or townscape than is normally found in everyday life. People linger over these sights in a way that they would not normally do in their home environment...',
        explanation:
          'Paragraph D confirms that tourists view sights with much greater visual sensitivity and linger over them in ways they would not do in their home environment.',
        explanationSi:
          'සංචාරකයන් තම නිවස අවට පරිසරයට වඩා තමන් සංචාරය කරන ස්ථාන කෙරෙහි වැඩි අවධානයක් යොමු කරන බව D ඡේදයේ දැක්වේ (YES).',
        paragraphReference: 'Paragraph D',
      },
      {
        id: 'c1-t2-p3-q37',
        type: 'TFNG',
        question: 'Tour operators try to cheat tourists.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NOT GIVEN',
        evidence:
          'To service the burgeoning tourist industry, an array of professionals has developed who attempt to reproduce ever-new objects for the tourist to look at.',
        explanation:
          'The writer mentions tourism professionals catering to tourists’ tastes and reproducing objects to look at, but never claims that tour operators try to cheat tourists.',
        explanationSi:
          'සංචාරක නියෝජිතයන් සංචාරකයන් රැවටීමට උත්සාහ කරන බවක් කතුවරයා පවසා නැත (NOT GIVEN).',
        paragraphReference: 'Paragraph F',
      },
      {
        id: 'c1-t2-p3-q38',
        type: 'mcq',
        question: 'Our concept of tourism arises from ...',
        options: [
          'A: local people and their environment.',
          'B: the expectations of tourists.',
          'C: the phenomena of holidaymaking.',
          'D: the distinction we make between work and leisure.',
          'E: the individual character of travel.',
          'F: places seen in everyday life.',
          'G: photographs which recapture our holidays.',
          'H: sights designed specially for tourists.',
        ],
        correctAnswer: 'D',
        evidence:
          'Tourism is a leisure activity which presupposes its opposite namely regulated and organised work. It is one manifestation of how work and leisure are organised as separate and regulated spheres of social practice in modern societies.',
        explanation:
          'Paragraph B explains that our concept of tourism stems from the division between regulated work and leisure.',
        explanationSi:
          'සංචාරක ව්‍යාපාරය පිළිබඳ අපගේ සංකල්පය පැන නගින්නේ රැකියාව සහ විවේකය අතර අප ඇති කරගන්නා වෙනස (D) මගිනි (ඡේදය B).',
        paragraphReference: 'Paragraph B',
      },
      {
        id: 'c1-t2-p3-q39',
        type: 'mcq',
        question: 'The media can be used to enhance ...',
        options: [
          'A: local people and their environment.',
          'B: the expectations of tourists.',
          'C: the phenomena of holidaymaking.',
          'D: the distinction we make between work and leisure.',
          'E: the individual character of travel.',
          'F: places seen in everyday life.',
          'G: photographs which recapture our holidays.',
          'H: sights designed specially for tourists.',
        ],
        correctAnswer: 'B',
        evidence:
          'Places are chosen to be visited and be gazed upon because there is an anticipation, especially through daydreaming and fantasy, of intense pleasures... Such anticipation is constructed and sustained through a variety of non-tourist practices such as films, TV, literature, magazines, records and videos...',
        explanation:
          'Paragraph C states that media (films, TV, literature, magazines, videos) construct and sustain tourists’ anticipation and expectations.',
        explanationSi:
          'සංචාරකයන්ගේ බලාපොරොත්තු (B - the expectations of tourists) ඉහළ නැංවීමට මාධ්‍ය (චිත්‍රපට, රූපවාහිනිය, සඟරා) භාවිතා කළ හැක (ඡේදය C).',
        paragraphReference: 'Paragraph C',
      },
      {
        id: 'c1-t2-p3-q40',
        type: 'mcq',
        question: 'People view tourist landscapes in a different way from ...',
        options: [
          'A: local people and their environment.',
          'B: the expectations of tourists.',
          'C: the phenomena of holidaymaking.',
          'D: the distinction we make between work and leisure.',
          'E: the individual character of travel.',
          'F: places seen in everyday life.',
          'G: photographs which recapture our holidays.',
          'H: sights designed specially for tourists.',
        ],
        correctAnswer: 'F',
        evidence:
          'Tourists tend to visit features of landscape and townscape which separate them off from everyday experience... with a much greater sensitivity to visual elements of landscape or townscape than is normally found in everyday life.',
        explanation:
          'Paragraph D shows that people gaze at tourist landscapes with much greater visual sensitivity than places seen in everyday life.',
        explanationSi:
          'එදිනෙදා ජීවිතයේදී දකින ස්ථානවලට (F - places seen in everyday life) වඩා වෙනස් ආකාරයකින් මිනිසුන් සංචාරක භූ දර්ශන දෙස බලයි (ඡේදය D).',
        paragraphReference: 'Paragraph D',
      },
      {
        id: 'c1-t2-p3-q41',
        type: 'mcq',
        question: 'Group tours encourage participants to look at ...',
        options: [
          'A: local people and their environment.',
          'B: the expectations of tourists.',
          'C: the phenomena of holidaymaking.',
          'D: the distinction we make between work and leisure.',
          'E: the individual character of travel.',
          'F: places seen in everyday life.',
          'G: photographs which recapture our holidays.',
          'H: sights designed specially for tourists.',
        ],
        correctAnswer: 'H',
        evidence:
          'Isolated from the host environment and the local people, the mass tourist travels in guided groups and finds pleasure in inauthentic contrived attractions, gullibly enjoying the “pseudo events”...',
        explanation:
          'Paragraph E explains that guided group tours direct tourists toward contrived attractions ("pseudo events") specially designed for tourists.',
        explanationSi:
          'කණ්ඩායම් සංචාර මගින් සංචාරකයන් සඳහාම විශේෂයෙන් නිර්මාණය කරන ලද කෘත්‍රිම ආකර්ෂණයන් (H - sights designed specially for tourists) නැරඹීමට පොළඹවයි (ඡේදය E).',
        paragraphReference: 'Paragraph E',
      },
    ],
  },
];
