import type { ReadingPassage } from '../types/tutor';

export const CAMBRIDGE_READING_TESTS: ReadingPassage[] = [
  {
    id: 'c18-reading-pass1',
    cambridgeSource: 'Cambridge IELTS 18 (Academic), Test 1 - Passage 1',
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
        id: 'c18-p1-q1',
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
        id: 'c18-p1-q2',
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
        id: 'c18-p1-q3',
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
        id: 'c18-p1-q4',
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
  },
  {
    id: 'c17-reading-pass2',
    cambridgeSource: 'Cambridge IELTS 17 (Academic), Test 2 - Passage 1',
    title: 'The History of the Pencil: From Cumberland Graphite to Mass Production',
    paragraphs: [
      {
        label: 'Paragraph A',
        text: 'The modern pencil owes its origins to a colossal storm that struck the rural Borrowdale valley in Cumbria, England, in the mid-sixteenth century. The tempest uprooted hundreds of ancient trees, exposing a massive subterranean vein of a dark, crystalline substance. Locals discovered that this mysterious black mineral was ideal for marking sheep. It was initially mistaken for a form of lead or plumbago, but was in fact an exceptionally pure, solid deposit of graphite.'
      },
      {
        label: 'Paragraph B',
        text: 'Because Borrowdale graphite was soft and crumbly in its raw natural state, artisans initially wrapped sticks of it in string, animal sheepskin or paper sleeves to prevent hands from becoming blackened. In 1565, Swiss naturalist Conrad Gessner documented the earliest known wooden casing: a hollowed piece of juniper wood that enveloped a graphite core. This rustic innovation marked the birth of the wooden pencil.'
      },
      {
        label: 'Paragraph C',
        text: 'During the Napoleonic Wars in the late eighteenth century, France faced a crippling economic blockade that severed its access to British graphite. In response to this dire shortage, French inventor Nicolas-Jacques Conté developed a revolutionary powdered graphite and clay formula in 1795. By mixing finely powdered graphite with powdered clay and kiln-firing the mixture at high temperatures, Conté was able to produce ceramic-graphite rods of varying hardness.'
      },
      {
        label: 'Paragraph D',
        text: 'Conté’s invention laid the technological foundation for modern pencil grading systems. By adjusting the ratio of clay to graphite, manufacturers could regulate the darkness and hardness of the pencil stroke: more clay produced a harder, lighter line (the modern "H" series), whereas a higher proportion of graphite produced a softer, intensely dark mark (the modern "B" series). To this day, the HB pencil remains the universal global standard for handwriting and academic examinations.'
      }
    ],
    questions: [
      {
        id: 'c17-p2-q1',
        type: 'TFNG',
        question: 'The Borrowdale deposit in Cumbria was correctly identified as graphite immediately after discovery.',
        correctAnswer: 'FALSE',
        paragraphReference: 'Paragraph A',
        explanation: 'Paragraph A states: "It was initially mistaken for a form of lead or plumbago, but was in fact an exceptionally pure... deposit of graphite." Therefore, it was NOT correctly identified immediately.',
        explanationSi: 'එය මුලින්ම ඊයම් (lead) ලෙස වරදවා වටහාගත් බව A ඡේදයේ පැහැදිලි කරයි. එබැවින් FALSE වේ.',
        vocabularyFocus: {
          term: 'Initially mistaken for',
          meaning: 'Wrongly perceived at first',
          academicCollocation: 'erroneously categorized'
        }
      },
      {
        id: 'c17-p2-q2',
        type: 'TFNG',
        question: 'The French blockade during the Napoleonic Wars directly motivated the creation of the clay-graphite mixture.',
        correctAnswer: 'TRUE',
        paragraphReference: 'Paragraph C',
        explanation: 'Paragraph C states: "In response to this dire shortage, French inventor Nicolas-Jacques Conté developed a revolutionary powdered graphite and clay formula in 1795."',
        explanationSi: 'බ්‍රිතාන්‍ය සැපයුම් ඇනහිටීම නිසා ඇතිවූ හිඟයට පිළියමක් ලෙස Conté මැටි-ග්‍රැෆයිට් මිශ්‍රණය සොයාගත් බව පැහැදිලි කරයි. එබැවින් TRUE වේ.',
        vocabularyFocus: {
          term: 'Dire shortage',
          meaning: 'A severe and urgent lack of essential resources',
          academicCollocation: 'acute scarcity / deficit'
        }
      },
      {
        id: 'c17-p2-q3',
        type: 'TFNG',
        question: 'Nicolas-Jacques Conté became the wealthiest industrialist in eighteenth-century France.',
        correctAnswer: 'NOT GIVEN',
        paragraphReference: 'Paragraph C & D',
        explanation: 'The text describes Conté’s technical invention and its importance, but provides no financial details or rankings about his wealth.',
        explanationSi: 'Conté ගේ ධනවත්කම පිළිබඳව කිසිදු තොරතුරක් ඡේදවල අඩංගු නොවේ. එබැවින් NOT GIVEN වේ.',
        vocabularyFocus: {
          term: 'Laid the technological foundation',
          meaning: 'Provided the essential underlying principles for future advancement',
          academicCollocation: 'established the groundwork'
        }
      },
      {
        id: 'c17-p2-q4',
        type: 'mcq',
        question: 'In the modern pencil grading hierarchy, increasing the percentage of clay in the mixture causes:',
        options: [
          'A harder rod that leaves a lighter stroke on paper',
          'A softer core that creates extremely dark lines',
          'A rod that can only be written on wet parchment',
          'The pencil core to dissolve immediately in water'
        ],
        correctAnswer: 'A harder rod that leaves a lighter stroke on paper',
        paragraphReference: 'Paragraph D',
        explanation: 'Paragraph D confirms: "more clay produced a harder, lighter line (the modern "H" series)".',
        explanationSi: 'D ඡේදයේ පැහැදිලිව දක්වන්නේ මැටි ප්‍රමාණය වැඩිවීමෙන් පැන්සල් තුඩ දැඩි (harder) වන අතර ලියවෙන ඉර ලා පැහැති (lighter) වන බවයි.',
        vocabularyFocus: {
          term: 'Regulate the darkness and hardness',
          meaning: 'Control and standardize material density and pigment',
          academicCollocation: 'calibrate intensity / standardize'
        }
      }
    ]
  },
  {
    id: 'c16-reading-pass3',
    cambridgeSource: 'Cambridge IELTS 16 (Academic), Test 1 - Passage 2',
    title: 'Polar Bears: Arctic Apex Predators in a Warming Biosphere',
    paragraphs: [
      {
        label: 'Paragraph A',
        text: 'Polar bears (Ursus maritimus) are uniquely adapted to thrive in one of the planet’s most extreme environments: the circumpolar Arctic sea ice. Unlike terrestrial brown bears, polar bears rely almost exclusively on marine sea ice platforms to hunt their primary prey: ringed seals and bearded seals. Their dense fur, thick adipose layer of blubber, and elongated skulls are evolutionary marvels fine-tuned over millennia for survival in sub-zero marine conditions.'
      },
      {
        label: 'Paragraph B',
        text: 'However, anthropogenically driven climate change represents an existential threat to polar bear ecology. Satellite observations over the past four decades demonstrate that Arctic sea ice extent has plummeted at an unprecedented rate, accompanied by earlier seasonal melting in spring and delayed freezing in autumn. As a consequence, bears are forced onto land for increasingly protracted fasting intervals, exhausting their energy reserves before winter sea ice regenerates.'
      },
      {
        label: 'Paragraph C',
        text: 'Recent physiological studies conducted in Hudson Bay, Canada, reveal troubling declines in female reproductive success and cub survival rates. Without sufficient sea ice from which to ambush seals surfacing at breathing holes, bears are documented consuming bird eggs, kelp, and carrion on land. Biologists emphasize that these terrestrial foraging activities provide negligible caloric sustenance compared to calorie-dense seal blubber, failing to prevent severe nutritional deficit.'
      }
    ],
    questions: [
      {
        id: 'c16-p3-q1',
        type: 'TFNG',
        question: 'Polar bears derive the bulk of their nutritional sustenance from hunting on open land.',
        correctAnswer: 'FALSE',
        paragraphReference: 'Paragraph A & C',
        explanation: 'Paragraph A emphasizes that polar bears rely "almost exclusively on marine sea ice platforms to hunt their primary prey: ringed seals", while Paragraph C confirms terrestrial food provides negligible calories.',
        explanationSi: 'ධ්‍රැව වලසුන් ප්‍රධාන වශයෙන් දඩයම් කරන්නේ මුහුදු අයිස් මතදී සීල් මසුන්ය. ගොඩබිම ආහාර ඔවුන්ට ප්‍රමාණවත් නොවේ. එබැවින් FALSE වේ.',
        vocabularyFocus: {
          term: 'Apex predators',
          meaning: 'Predators at the top of a food chain with no natural predators',
          academicCollocation: 'keystone species / ecological hierarchy'
        }
      },
      {
        id: 'c16-p3-q2',
        type: 'TFNG',
        question: 'Satellite telemetry shows that Arctic sea ice is melting earlier in spring and reforming later in autumn.',
        correctAnswer: 'TRUE',
        paragraphReference: 'Paragraph B',
        explanation: 'Paragraph B states: "accompanied by earlier seasonal melting in spring and delayed freezing in autumn."',
        explanationSi: 'වසන්තයේදී අයිස් කලින් දියවී යන බවත් සරත් සෘතුවේදී අයිස් මිදීම ප්‍රමාද වන බවත් චන්ද්‍රිකා දත්ත තහවුරු කරයි. එබැවින් TRUE වේ.',
        vocabularyFocus: {
          term: 'Protracted fasting intervals',
          meaning: 'Extended periods of involuntary starvation without food intake',
          academicCollocation: 'prolonged deprivation / calorie deficit'
        }
      },
      {
        id: 'c16-p3-q3',
        type: 'mcq',
        question: 'According to Paragraph C, why is terrestrial food such as kelp and bird eggs insufficient for polar bears?',
        options: [
          'It provides negligible calories compared to energy-rich marine seal blubber',
          'It causes chronic digestive poisoning in Arctic carnivores',
          'It is completely frozen under deep permafrost soil',
          'It can only be digested during prolonged winter hibernation'
        ],
        correctAnswer: 'It provides negligible calories compared to energy-rich marine seal blubber',
        paragraphReference: 'Paragraph C',
        explanation: 'Paragraph C states: "these terrestrial foraging activities provide negligible caloric sustenance compared to calorie-dense seal blubber".',
        explanationSi: 'ගොඩබිම ශාක හා පක්ෂි බිත්තරවල ඇති කැලරි ප්‍රමාණය සීල් මේදයට සාපේක්ෂව ඉතා අල්පය. එබැවින් නිවැරදි පිළිතුර පළමු විකල්පයයි.',
        vocabularyFocus: {
          term: 'Negligible caloric sustenance',
          meaning: 'Insignificant energy yield',
          academicCollocation: 'nutritionally inadequate'
        }
      }
    ]
  },
  {
    id: 'c15-reading-pass4',
    cambridgeSource: 'Cambridge IELTS 15 (Academic), Test 1 - Passage 3',
    title: 'Driverless Cars: Transforming Urban Infrastructure and Safety',
    paragraphs: [
      {
        label: 'Paragraph A',
        text: 'The advent of autonomous, driverless vehicles is heralded as the most consequential transportation revolution since the transition from horse-drawn carriages to the internal combustion engine. Equipped with sophisticated arrays of LIDAR sensors, radar, machine-vision cameras, and artificial intelligence neural networks, autonomous cars can navigate complex urban road networks with millisecond reaction times.'
      },
      {
        label: 'Paragraph B',
        text: 'Road safety advocates point to an undeniable reality: over 90% of vehicular collisions globally are attributed to human error, predominantly distracted driving, speeding, and alcohol impairment. By removing the unpredictable human element from vehicle operation, automated driving algorithms possess the mathematical capacity to dramatically reduce road fatalities and catastrophic injuries.'
      },
      {
        label: 'Paragraph C',
        text: 'Beyond individual passenger safety, urban planners anticipate profound transformations in civic geometry. Because autonomous fleets can operate continuously on on-demand rideshare networks, the necessity for vast private vehicle parking spaces—which currently consume up to 30% of prime metropolitan land—could be eliminated, permitting the reallocation of asphalt parking lots into green public parks and affordable housing.'
      }
    ],
    questions: [
      {
        id: 'c15-p4-q1',
        type: 'TFNG',
        question: 'Over nine-tenths of automobile accidents worldwide are caused by human errors.',
        correctAnswer: 'TRUE',
        paragraphReference: 'Paragraph B',
        explanation: 'Paragraph B explicitly states: "over 90% of vehicular collisions globally are attributed to human error".',
        explanationSi: 'B ඡේදයේ සඳහන් වන්නේ රිය අනතුරුවලින් 90% කට වඩා සිදුවන්නේ මිනිස් වැරදි (human error) නිසා බවයි. එබැවින් TRUE වේ.',
        vocabularyFocus: {
          term: 'Attributed to human error',
          meaning: 'Caused by human negligence or misjudgment',
          academicCollocation: 'causally linked to operator error'
        }
      },
      {
        id: 'c15-p4-q2',
        type: 'mcq',
        question: 'According to Paragraph C, how could autonomous vehicles transform metropolitan city land use?',
        options: [
          'By repurposing parking spaces into green parks and residential housing',
          'By requiring cities to convert all parks into automated highways',
          'By banning pedestrians and cyclists from all public roads',
          'By tripling the total number of private automobile garages'
        ],
        correctAnswer: 'By repurposing parking spaces into green parks and residential housing',
        paragraphReference: 'Paragraph C',
        explanation: 'Paragraph C states that eliminating parking spaces will permit "the reallocation of asphalt parking lots into green public parks and affordable housing".',
        explanationSi: 'C ඡේදයේ දක්වන්නේ වාහන නැවැත්වීමේ ස්ථාන වෙනුවට හරිත උද්‍යාන සහ නිවාස ඉදිකිරීමට හැකිවන බවයි.',
        vocabularyFocus: {
          term: 'Reallocation of prime metropolitan land',
          meaning: 'Repurposing valuable urban real estate for community benefit',
          academicCollocation: 'urban regeneration and spatial planning'
        }
      }
    ]
  },
  {
    id: 'c14-reading-pass1',
    cambridgeSource: 'Cambridge IELTS 14 (Academic), Test 1 - Passage 1',
    title: 'The Concept of Human Intelligence & Cognitive Assessment',
    paragraphs: [
      {
        label: 'Paragraph A',
        text: 'Human intelligence is amongst the most extensively scrutinized yet intensely contested concepts in modern psychological research. In popular speech, intelligence is frequently conceived as a general, monolithic capacity enabling individuals to solve complex problems, acquire new knowledge, and adapt fluidly to novel environmental demands. During the early twentieth century, British psychologist Charles Spearman pioneered the concept of a general cognitive factor, designated as "g".'
      },
      {
        label: 'Paragraph B',
        text: 'Spearman posited that individuals performing proficiently in one mental domain—such as numerical calculation—almost inevitably demonstrated superior competence in verbal reasoning and spatial manipulation. Subsequent cognitive theorists, however, argued that this unitary model was fundamentally reductive. American psychologist Howard Gardner advanced the theory of "Multiple Intelligences", positing that humans exhibit distinct intelligences ranging from musical and bodily-kinaesthetic to interpersonal and spatial capacities.'
      },
      {
        label: 'Paragraph C',
        text: 'A persistent question concerns whether cognitive ability is predominantly shaped by genetic inheritance or environmental cultivation. Twin studies conducted over several decades illustrate that identical twins reared apart exhibit strikingly correlated scores on standardized intelligence batteries, underscoring hereditary predispositions. Nonetheless, environmental variables such as socioeconomic status, nutritional access in early childhood, and cognitive stimulation in schooling exert profound compensatory effects.'
      }
    ],
    questions: [
      {
        id: 'c14-p1-q1',
        type: 'TFNG',
        question: 'Charles Spearman believed that intellectual competence was composed of independent, unrelated human talents.',
        correctAnswer: 'FALSE',
        paragraphReference: 'Paragraph A & B',
        explanation: 'Paragraph A and B state that Spearman pioneered a single general factor "g", where high performance in one domain correlated with superior competence in others.',
        explanationSi: 'Spearman විශ්වාස කළේ තනි "g" සාධකයක් මඟින් සියලු හැකියාවන් එකිනෙකට බැඳී ඇති බවයි, එබැවින් FALSE වේ.',
        vocabularyFocus: {
          term: 'Monolithic capacity',
          meaning: 'An indivisible, uniform single ability',
          academicCollocation: 'unitary cognitive construct'
        }
      },
      {
        id: 'c14-p1-q2',
        type: 'TFNG',
        question: 'Studies of identical twins reared apart provide evidence of genetic influences on cognitive ability.',
        correctAnswer: 'TRUE',
        paragraphReference: 'Paragraph C',
        explanation: 'Paragraph C states that identical twins reared apart exhibit correlated intelligence scores, "underscoring hereditary predispositions".',
        explanationSi: 'C ඡේදයේ දක්වන්නේ වෙන වෙනම හැදී වැඩුණු නිවුන් දරුවන්ගේ බුද්ධි පරීක්ෂණ ලකුණු සමාන බවයි, එබැවින් TRUE වේ.',
        vocabularyFocus: {
          term: 'Hereditary predispositions',
          meaning: 'Genetically transmitted tendencies or traits',
          academicCollocation: 'genetic endowment / innate capacity'
        }
      },
      {
        id: 'c14-p1-q3',
        type: 'mcq',
        question: 'What was Howard Gardner’s primary criticism of Spearman’s unitary theory?',
        options: [
          'That Spearman completely ignored the influence of genetic inheritance',
          'That a single general factor is reductive and ignores diverse distinct intelligences',
          'That numerical calculations should not be included in standardized psychometric tests',
          'That musical talents have no relationship whatsoever to cognitive functioning'
        ],
        correctAnswer: 'That a single general factor is reductive and ignores diverse distinct intelligences',
        paragraphReference: 'Paragraph B',
        explanation: 'Paragraph B states Gardner believed the unitary model was "fundamentally reductive" and argued for distinct intelligences like musical and interpersonal abilities.',
        explanationSi: 'B ඡේදයට අනුව Howard Gardner පෙන්වා දුන්නේ බුද්ධිය තනි සාධකයකට සීමා කිරීම වැරදි බව සහ විවිධ බුද්ධි වර්ග පවතින බවයි.',
        vocabularyFocus: {
          term: 'Fundamentally reductive',
          meaning: 'Overly simplistic; failing to capture complex nuances',
          academicCollocation: 'simplistic reductionism'
        }
      }
    ]
  },
  {
    id: 'c13-reading-pass1',
    cambridgeSource: 'Cambridge IELTS 13 (Academic), Test 1 - Passage 1',
    title: 'Case Study: Tourism New Zealand Website',
    paragraphs: [
      {
        label: 'Paragraph A',
        text: 'New Zealand is a country of breathtaking topographical diversity, boasting alpine mountains, glaciers, and scenic fjords. In 1999, the national tourism organization initiated the globally acclaimed "100% Pure New Zealand" campaign. Central to this strategic campaign was the development of the official website, www.newzealand.com, intended to convert international interest into tangible bookings.'
      },
      {
        label: 'Paragraph B',
        text: 'Unlike standard commercial travel portals that aggressively prioritize direct flight and accommodation sales, the Tourism New Zealand portal aimed primarily to inspire and educate prospective visitors. It incorporated interactive itineraries, detailed geographical overviews, and candid feedback from independent travelers, providing an authentic visitor perspective.'
      },
      {
        label: 'Paragraph C',
        text: 'A pivotal innovation was providing localized small business operators—such as boutique bed-and-breakfasts and Maori cultural eco-guides—free business directory listings on the national portal. This allowed micro-enterprises with negligible digital marketing budgets to gain international exposure alongside multinational hotel chains.'
      }
    ],
    questions: [
      {
        id: 'c13-p1-q1',
        type: 'TFNG',
        question: 'The primary initial objective of www.newzealand.com was to compete directly against commercial airline booking platforms.',
        correctAnswer: 'FALSE',
        paragraphReference: 'Paragraph B',
        explanation: 'Paragraph B clarifies that unlike commercial portals that prioritize direct ticket sales, this website aimed to "inspire and educate prospective visitors".',
        explanationSi: 'B ඡේදයේ පැහැදිලි කරන්නේ වෙබ් අඩවියේ මූලික අරමුණ වූයේ ගුවන් ටිකට්පත් විකිණීම නොව සංචාරකයින් උනන්දු කරවීම හා දැනුවත් කිරීම බවයි.',
        vocabularyFocus: {
          term: 'Convert interest into tangible bookings',
          meaning: 'Transform theoretical curiosity into real customer reservations',
          academicCollocation: 'commercial conversion rate'
        }
      },
      {
        id: 'c13-p1-q2',
        type: 'TFNG',
        question: 'Local small business owners had to pay hefty annual membership fees to appear on the official portal.',
        correctAnswer: 'FALSE',
        paragraphReference: 'Paragraph C',
        explanation: 'Paragraph C explicitly states the portal provided localized small business operators "free business directory listings".',
        explanationSi: 'C ඡේදයේ පැහැදිලිවම දක්වන්නේ සුළු ව්‍යාපාර සඳහා නොමිලේ (free) ලියාපදිංචිය ලබාදුන් බවයි. එබැවින් FALSE වේ.',
        vocabularyFocus: {
          term: 'Micro-enterprises',
          meaning: 'Very small businesses with few staff and modest capital',
          academicCollocation: 'small and medium enterprises (SMEs)'
        }
      }
    ]
  },
  {
    id: 'c12-reading-pass1',
    cambridgeSource: 'Cambridge IELTS 12 (Academic), Test 1 - Passage 1',
    title: 'The Remarkable Properties & Uses of Cork',
    paragraphs: [
      {
        label: 'Paragraph A',
        text: 'Cork is the thick outer bark of the cork oak tree, known botanically as Quercus suber. Native to the western Mediterranean basin, including Portugal and southern Spain, this unique evergreen oak thrives in dry, warm climates. Portugal alone supplies approximately half of the world’s commercial cork harvest.'
      },
      {
        label: 'Paragraph B',
        text: 'The harvesting of cork is an extraordinary eco-friendly agricultural practice. Unlike conventional timber logging, which necessitates felling the entire tree, cork is harvested by delicately stripping the bark using specialized axes without inflicting trauma on the underlying living trunk. The tree subsequently regenerates its outer bark over an interval of nine to ten years.'
      },
      {
        label: 'Paragraph C',
        text: 'Cork’s microscopic cellular structure accounts for its unparalleled physical attributes. Composed of millions of microscopic polyhedral cells filled with an air-like gas, cork is exceptionally light, elastic, and impervious to moisture. Although synthetic screw caps and silicone bungs have recently penetrated the wine industry, traditional cork stoppers retain distinct prestige among premium vintners.'
      }
    ],
    questions: [
      {
        id: 'c12-p1-q1',
        type: 'TFNG',
        question: 'Stripping the outer bark during cork harvesting causes the death of the cork oak tree.',
        correctAnswer: 'FALSE',
        paragraphReference: 'Paragraph B',
        explanation: 'Paragraph B confirms that cork is harvested "without inflicting trauma on the underlying living trunk" and the tree "subsequently regenerates its outer bark".',
        explanationSi: 'B ඡේදයේ දක්වන්නේ පොත්ත ගැලවීමේදී ගසට හානියක් නොවන බවත් නැවත පොත්ත වැවෙන බවත්ය. එබැවින් FALSE වේ.',
        vocabularyFocus: {
          term: 'Impervious to moisture',
          meaning: 'Waterproof; not allowing fluids or humidity to pass through',
          academicCollocation: 'hydrophobic barrier / moisture resistance'
        }
      },
      {
        id: 'c12-p1-q2',
        type: 'mcq',
        question: 'Which geographical territory supplies approximately 50 percent of the world’s annual cork output?',
        options: [
          'Southern California',
          'Portugal',
          'Northern Italy',
          'Greece'
        ],
        correctAnswer: 'Portugal',
        paragraphReference: 'Paragraph A',
        explanation: 'Paragraph A states: "Portugal alone supplies approximately half of the world’s commercial cork harvest."',
        explanationSi: 'A ඡේදයේ පැහැදිලිව දක්වන්නේ පෘතුගාලය (Portugal) ලෝකයේ කෝක් නිෂ්පාදනයෙන් අඩක් සපයන බවයි.',
        vocabularyFocus: {
          term: 'Commercial cork harvest',
          meaning: 'Agricultural yield produced for global industrial sale',
          academicCollocation: 'sustainable agrarian output'
        }
      }
    ]
  },
  {
    id: 'c10-reading-pass1',
    cambridgeSource: 'Cambridge IELTS 10 (Academic), Test 1 - Passage 1',
    title: 'The Step Pyramid of Djoser at Saqqara',
    paragraphs: [
      {
        label: 'Paragraph A',
        text: 'During the Third Dynasty of ancient Egypt around 2670 BC, King Djoser reigned over a prosperous civilization. Prior to his rule, Egyptian sovereigns and noble dignitaries were conventionally interred within rectangular, flat-roofed mudbrick tombs known as mastabas. Djoser, however, commissioned an unprecedented monumental resting place.'
      },
      {
        label: 'Paragraph B',
        text: 'The mastermind behind this architectural revolution was Imhotep, a royal physician, priest, and brilliant engineer. Imhotep conceived the audacious idea of stacking successive stone mastabas of diminishing dimensions atop one another, culminating in a magnificent six-tiered step pyramid rising over 62 metres into the desert sky.'
      },
      {
        label: 'Paragraph C',
        text: 'The Step Pyramid was constructed almost entirely from dressed limestone, signifying the very first colossal stone monument ever erected in human history. It established the architectural blueprint that culminated a century later in the world-famous Great Pyramids of Giza.'
      }
    ],
    questions: [
      {
        id: 'c10-p1-q1',
        type: 'TFNG',
        question: 'Before King Djoser, royal pharaohs were buried in tall triangular limestone pyramids.',
        correctAnswer: 'FALSE',
        paragraphReference: 'Paragraph A',
        explanation: 'Paragraph A states that before Djoser, dignitaries were buried in "rectangular, flat-roofed mudbrick tombs known as mastabas".',
        explanationSi: 'A ඡේදයේ දක්වන්නේ ඩෝජර්ට පෙර රජවරුන් මිහිදන් කළේ mastabas නම් පැතලි වහල සහිත මැටි ගඩොල් සොහොන්වල බවයි. එබැවින් FALSE වේ.',
        vocabularyFocus: {
          term: 'Architectural blueprint',
          meaning: 'A prototype design or pioneering structural pattern',
          academicCollocation: 'structural precedent / foundational archetype'
        }
      },
      {
        id: 'c10-p1-q2',
        type: 'TFNG',
        question: 'Imhotep served exclusively as a military commander during Djoser’s reign.',
        correctAnswer: 'FALSE',
        paragraphReference: 'Paragraph B',
        explanation: 'Paragraph B describes Imhotep as a "royal physician, priest, and brilliant engineer", not a military commander.',
        explanationSi: 'B ඡේදයට අනුව ඉම්හොටෙප් යනු වෛද්‍යවරයෙක්, පූජකයෙක් සහ ඉංජිනේරුවෙකි. එබැවින් FALSE වේ.',
        vocabularyFocus: {
          term: 'Diminishing dimensions',
          meaning: 'Decreasing sizes stacked progressively higher',
          academicCollocation: 'graduated proportions'
        }
      }
    ]
  }
];
