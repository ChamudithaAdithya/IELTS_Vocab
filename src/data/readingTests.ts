import type { ReadingPassage } from '../types/tutor';

export const CAMBRIDGE_READING_TESTS: ReadingPassage[] = [
  {
    id: 'c18-reading-pass1',
    cambridgeSource: 'Cambridge IELTS 18, Academic Test 1 (Reading Passage 1)',
    title: 'Urban Farming: The Vertical Revolution',
    paragraphs: [
      {
        label: 'Paragraph A',
        text: 'By the year 2050, nearly 80% of the Earth’s population will reside in urban centres. Applying the most conservative estimates to current demographic trends, the human population will increase by roughly three billion people during that time. An estimated 109 hectares of new land will be needed to grow enough food to feed them, if traditional farming practices continue as they are practiced today. At present, throughout the world, over 80% of the land that is suitable for raising crops is already in use.'
      },
      {
        label: 'Paragraph B',
        text: 'Historically, some 15% of that has been laid waste by poor management practices. What can be done to ensure enough food for the world’s population to live on? The concept of indoor farming is not new, since hothouse production of tomatoes and other produce has been in vogue for some time. What is new is the urgent need to scale up this technology to accommodate another three billion people. Many believe an entirely new approach to agriculture is required, employing cutting-edge technologies. One such proposal is for "Vertical Farming".'
      },
      {
        label: 'Paragraph C',
        text: 'The concept of vertical farming involves cultivating plants inside tall multi-storey buildings in cities. Proponents argue that if food were produced in skyscrapers throughout metropolitan centres, food would not need to be transported thousands of kilometres to reach consumers, dramatically diminishing fossil fuel consumption and carbon emissions. Furthermore, vertical farms would operate independent of weather variations, meaning that droughts, floods and seasonal changes would no longer curtail crop yields.'
      },
      {
        label: 'Paragraph D',
        text: 'However, critics emphasize substantial economic and technical hurdles. Foremost among these is the staggering capital investment required to purchase prime metropolitan real estate and construct high-tech facilities equipped with artificial LED lighting and climate control systems. Unlike open fields, which harvest natural sunlight without cost, vertical farms rely around the clock on generated electric power, which could inadvertently offset the ecological advantages unless supplied by renewable energy.'
      }
    ],
    questions: [
      {
        id: 'q1',
        type: 'TFNG',
        question: 'Current agricultural land across the globe is mostly already being utilized.',
        correctAnswer: 'TRUE',
        paragraphReference: 'Paragraph A',
        explanation: 'Paragraph A directly states: "over 80% of the land that is suitable for raising crops is already in use", which confirms "mostly already being utilized".',
        explanationSi: 'A ඡේදයේ සඳහන් වන්නේ ලෝකයේ වගා කළ හැකි ඉඩම්වලින් 80% කට වඩා දැනටමත් භාවිතයේ පවතින බවයි. එබැවින් TRUE වේ.',
        vocabularyFocus: {
          term: 'Suitable for raising crops',
          meaning: 'Arable land capable of agricultural production',
          academicCollocation: 'arable land / fertile soil'
        }
      },
      {
        id: 'q2',
        type: 'TFNG',
        question: 'The practice of indoor greenhouse farming was first invented to accommodate vertical skyscrapers.',
        correctAnswer: 'FALSE',
        paragraphReference: 'Paragraph B',
        explanation: 'Paragraph B clarifies: "The concept of indoor farming is not new, since hothouse production of tomatoes has been in vogue for some time." It predates vertical skyscraper farming.',
        explanationSi: 'B ඡේදයේ පැහැදිලි කරන්නේ ගෘහස්ථ වගාව (hothouse) අලුත් දෙයක් නොවන බවයි. එබැවින් FALSE වේ.',
        vocabularyFocus: {
          term: 'In vogue',
          meaning: 'Popular or fashionable at a given time',
          academicCollocation: 'widely adopted / gained prevalence'
        }
      },
      {
        id: 'q3',
        type: 'TFNG',
        question: 'Government subsidies will be required to fund the construction of vertical farms.',
        correctAnswer: 'NOT GIVEN',
        paragraphReference: 'Paragraph D',
        explanation: 'Paragraph D discusses high capital investment and expensive real estate, but makes no mention of whether government subsidies will be provided or required.',
        explanationSi: 'D ඡේදයේ අධික වියදම් ගැන කීවද, රජයේ සහනාධාර (subsidies) ගැන කිසිවක් සඳහන් නොවේ. එබැවින් NOT GIVEN වේ.',
        vocabularyFocus: {
          term: 'Capital investment',
          meaning: 'Funds invested in a firm for the purpose of furthering its business objectives',
          academicCollocation: 'substantial capital outlay'
        }
      },
      {
        id: 'q4',
        type: 'mcq',
        question: 'According to Paragraph C, a major ecological advantage of vertical farming is:',
        options: [
          'Decreasing the distance food must travel to city consumers',
          'Eliminating the need for all electric lighting systems',
          'Relying exclusively on open-air rain irrigation',
          'Reducing the overall human population growth rate'
        ],
        correctAnswer: 'Decreasing the distance food must travel to city consumers',
        paragraphReference: 'Paragraph C',
        explanation: 'Paragraph C explicitly highlights that "food would not need to be transported thousands of kilometres to reach consumers, dramatically diminishing fossil fuel consumption".',
        explanationSi: 'C ඡේදයේ ආහාර නගර කරා ප්‍රවාහනය කිරීමට වන දුර අඩු වීම ප්‍රධාන පාරිසරික වාසියක් ලෙස දක්වයි.',
        vocabularyFocus: {
          term: 'Diminishing fossil fuel consumption',
          meaning: 'Cutting down the combustion of non-renewable petroleum energy',
          academicCollocation: 'reduce carbon footprint'
        }
      }
    ]
  }
];

