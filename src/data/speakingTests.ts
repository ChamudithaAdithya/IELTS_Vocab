import type { SpeakingPartPrompt } from '../types/tutor';

export const CAMBRIDGE_SPEAKING_TESTS: SpeakingPartPrompt[] = [
  {
    id: 'sp-part1-hometown',
    part: 1,
    topic: 'Hometown & Daily Routine',
    questions: [
      'Where is your hometown located, and what is it like?',
      'What do you like most about living in your area?',
      'Has your hometown changed much over the last ten years?'
    ],
    sampleBand8Answer:
      'I was born and raised in Kandy, a historic city nestled in the central highlands of Sri Lanka. What I appreciate most about it is the harmonious blend of cultural heritage and lush mountainous scenery. Over the past decade, however, it has undergone noticeable urbanization, with increased commercial infrastructure and modern transport links, although the pleasant cool climate remains largely unchanged.',
    examinerTips: [
      'Avoid 1-word answers. Aim for 2-3 complex sentences per Part 1 question.',
      'Use natural discourse markers: "Well, to be perfectly honest...", "As a matter of fact..."',
      'Showcase topic-specific adjectives: "lush mountainous scenery", "undergone noticeable urbanization".'
    ]
  },
  {
    id: 'sp-part2-cuecard-c18',
    part: 2,
    topic: 'Describe a traditional celebration or festival in your country',
    questions: [
      'You will have 1 minute to prepare your notes, then speak for 1 to 2 minutes.'
    ],
    cueCardPoints: [
      'What the celebration is and when it takes place',
      'What people usually do during this event',
      'What food or traditional costumes are associated with it',
      'And explain why this festival holds personal significance for you.'
    ],
    sampleBand8Answer:
      'I would like to speak about the Sinhala and Tamil New Year, which is celebrated annually in mid-April. It marks the transition of the sun and signifies the culmination of the agricultural harvesting season. Families engage in age-old customary rituals conducted at auspicious moments, such as lighting the hearth, boiling milk in an earthen pot to symbolize prosperity, and partaking in ceremonial meals featuring milk rice and sweetmeats like Kavum and Kokis.\n\nWhat makes this festival particularly meaningful to me is its power to reunite extended families across generations. In today’s frantic pace of life, it offers an indispensable opportunity to disconnect from electronic devices, seek blessings from our elders, and renew fraternal bonds with warmth and mutual goodwill.',
    examinerTips: [
      'Use the 1-minute preparation time to write 4-5 bullet points covering each prompt bullet.',
      'Speak smoothly without pausing to search for words; paraphrase smoothly if you forget a specific term.',
      'Structure your talk chronologically: Background → Activities → Sensory details (food/rituals) → Personal reflection.'
    ]
  },
  {
    id: 'sp-part3-culture',
    part: 3,
    topic: 'Cultural Preservation & Globalization',
    questions: [
      'Do you think modern teenagers are losing interest in their cultural traditions?',
      'How does international media influence local festivals and customs?',
      'Should national governments actively finance cultural events, or should they be privately organized?'
    ],
    sampleBand8Answer:
      'I wouldn’t say teenagers are completely disengaged; rather, their interaction with heritage is transforming. Due to widespread digitalization and globalization, young people are naturally exposed to Western pop culture. Consequently, they tend to reinterpret traditional customs through a contemporary lens. In terms of state support, I firmly believe public funding is indispensable because commercial sponsorship frequently commodifies sacred ceremonies, whereas government patronage safeguards their historic authenticity for future generations.',
    examinerTips: [
      'In Part 3, do not give personal anecdotes about yourself or your family; speak from a broader societal perspective.',
      'Use abstract academic connectors: "Consequently", "On the other hand", "From an economic standpoint".',
      'Demonstrate speculative language: "It could be argued that...", "One potential ramification is..."'
    ]
  }
];

