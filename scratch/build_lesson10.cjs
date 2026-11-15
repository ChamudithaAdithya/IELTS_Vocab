const fs = require('fs');
const path = require('path');

const RAW_WORDS = [
  // Paragraph A (20 words)
  {
    para: 'Paragraph A',
    term: 'Formed',
    pos: 'verb',
    ipa: '/fɔːmd/',
    simple: 'Created or established',
    synonym: 'Established',
    siDef: 'ගොඩනඟන ලද / ස්ථාපිත කරන ලද',
    band: 'Band 7.0+',
    colloc: [
      ['Formed a settlement', 'ජනාවාසයක් ස්ථාපිත කරන ලදී'],
      ['Newly formed', 'අලුතින් පිහිටුවන ලද'],
      ['Formed an alliance', 'සන්ධානයක් ගොඩනඟා ගන්නා ලදී']
    ],
    example: {
      en: 'The kingdom formed in the fertile Limpopo basin around the eleventh century.',
      si: 'එකොළොස්වන සියවස ආසන්නයේ සාරවත් ලිම්පෝපෝ නිම්නයේ මෙම රාජධානිය ස්ථාපිත විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph A',
    term: 'Bantu-speaking',
    pos: 'adjective',
    ipa: '/ˈbæntuː ˈspiːkɪŋ/',
    simple: 'Speaking languages of the Bantu family',
    synonym: 'Linguistic group',
    siDef: 'බාන්ටු භාෂා කතා කරන ජන කොට්ඨාසය',
    band: 'Band 7.5+',
    colloc: [
      ['Bantu-speaking people', 'බාන්ටු භාෂා කතා කරන ජනතාව'],
      ['Bantu-speaking migration', 'බාන්ටු භාෂිකයන්ගේ සංක්‍රමණය'],
      ['Bantu-speaking farmers', 'බාන්ටු භාෂාව කතා කරන ගොවීන්']
    ],
    example: {
      en: 'Bantu-speaking communities migrated across southern Africa, introducing agriculture and iron smelting.',
      si: 'බාන්ටු භාෂා කතා කරන ප්‍රජාවන් දකුණු අප්‍රිකාව පුරා සංක්‍රමණය වෙමින් කෘෂිකර්මාන්තය සහ යකඩ උණු කිරීම හඳුන්වා දුන්හ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph A',
    term: 'Plateau',
    pos: 'noun',
    ipa: '/ˈplætəʊ/',
    simple: 'Large, high, flat area of land',
    synonym: 'Tableland',
    siDef: 'සානුව / උස් තැනිතලා භූමිය',
    band: 'Band 7.5+',
    colloc: [
      ['Rocky plateau', 'ගල් සහිත සානුව'],
      ['High plateau', 'උස් සානුව'],
      ['Plateau summit', 'සානුවේ මුදුන']
    ],
    example: {
      en: 'The elite members of Mapungubwe society dwelled atop an inaccessible sandstone plateau.',
      si: 'මාපුංගුබ්වේ සමාජයේ ප්‍රභූ පන්තිය පහසුවෙන් ළඟාවිය නොහැකි වැලිගල් සානුව මුදුනේ වාසය කළහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph A',
    term: 'Defended',
    pos: 'verb',
    ipa: '/dɪˈfendɪd/',
    simple: 'Protected from attack',
    synonym: 'Guarded',
    siDef: 'ප්‍රහාරවලින් ආරක්ෂා කරන ලද',
    band: 'Band 7.0+',
    colloc: [
      ['Heavily defended', 'දැඩි ලෙස ආරක්ෂිත'],
      ['Defended territory', 'ආරක්ෂා කළ භූමිය'],
      ['Defended against invaders', 'ආක්‍රමණිකයන්ගෙන් ආරක්ෂා විය']
    ],
    example: {
      en: 'The steep cliffs naturally defended the summit from potential attackers.',
      si: 'ප්‍රපාතාකාර කඳු බෑවුම් මගින් සානුවේ මුදුන සතුරු ප්‍රහාරවලින් ස්වභාවිකවම ආරක්ෂා විය.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph A',
    term: 'Inaccessibility',
    pos: 'noun',
    ipa: '/ˌɪnækˌsesəˈbɪləti/',
    simple: 'Difficulty of reaching a place',
    synonym: 'Remoteness',
    siDef: 'ළඟාවීමේ අපහසුතාව / දුරස්ථ බව',
    band: 'Band 8.0+',
    colloc: [
      ['Inaccessibility of the hill', 'කන්දට ළඟාවීමේ දුෂ්කරතාව'],
      ['Relative inaccessibility', 'සාපේක්ෂ ළඟාවීමේ අපහසුව'],
      ['Physical inaccessibility', 'භෞතිකව ළඟාවිය නොහැකි බව']
    ],
    example: {
      en: 'The inaccessibility of the mountain fortress ensured the safety of the royal court.',
      si: 'කඳුකර බලකොටුවට පහසුවෙන් ළඟාවිය නොහැකි වීම රාජකීය පිරිවරගේ ආරක්ෂාව තහවුරු කළේය.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph A',
    term: 'Cattle herding',
    pos: 'noun',
    ipa: '/ˈkætl ˌhɜːdɪŋ/',
    simple: 'Keeping and managing cows',
    synonym: 'Livestock farming',
    siDef: 'ගව පාලනය / ගවයන් රැකබලා ගැනීම',
    band: 'Band 7.0+',
    colloc: [
      ['Pastoral cattle herding', 'එඬේර ගව පාලනය'],
      ['Traditional cattle herding', 'සාම්ප්‍රදායික ගව පාලනය'],
      ['Depend on cattle herding', 'ගව පාලනය මත යැපීම']
    ],
    example: {
      en: 'Cattle herding was both a primary source of sustenance and a symbol of prestige in Mapungubwe.',
      si: 'ගව පාලනය මාපුංගුබ්වේ වැසියන්ගේ ප්‍රධාන ජීවනෝපාය මෙන්ම සමාජ තත්ත්වය පෙන්වන සංකේතයක්ද විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph A',
    term: 'Surplus',
    pos: 'noun',
    ipa: '/ˈsɜːpləs/',
    simple: 'More than what is needed',
    synonym: 'Excess',
    siDef: 'අතිරික්තය / අවශ්‍ය ප්‍රමාණයට වඩා වැඩි ප්‍රමාණය',
    band: 'Band 8.0+',
    colloc: [
      ['Agricultural surplus', 'කෘෂිකාර්මික අතිරික්තය'],
      ['Surplus of grain', 'ධාන්‍ය අතිරික්තය'],
      ['Generate a surplus', 'අතිරික්තයක් නිපදවීම']
    ],
    example: {
      en: 'A persistent food surplus allowed specialized craftsmen to produce jewellery and pottery.',
      si: 'අඛණ්ඩ ආහාර අතිරික්තය හේතුවෙන් දක්ෂ ශිල්පීන්ට ආභරණ සහ මැටි භාණ්ඩ නිෂ්පාදනයෙහි නිරත වීමට හැකි විය.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph A',
    term: 'Traded',
    pos: 'verb',
    ipa: '/treɪdɪd/',
    simple: 'Exchanged or sold goods',
    synonym: 'Exchanged',
    siDef: 'වෙළඳාම් කරන ලද / හුවමාරු කළ',
    band: 'Band 7.0+',
    colloc: [
      ['Traded with merchants', 'වෙළඳුන් සමඟ වෙළඳාම් කළේය'],
      ['Extensively traded', 'පුළුල් ලෙස වෙළඳාම් කළේය'],
      ['Traded commodities', 'වෙළඳාම් කළ භාණ්ඩ']
    ],
    example: {
      en: 'Locals traded ivory and alluvial gold with Arab merchants along the Indian Ocean coastline.',
      si: 'ප්‍රදේශවාසීන් ඉන්දියන් සාගර වෙරළ තීරයේ අරාබි වෙළඳුන් සමඟ ඇත්දළ සහ රත්තරන් වෙළඳාම් කළහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph A',
    term: 'Archaeology',
    pos: 'noun',
    ipa: '/ˌɑːkiˈɒlədʒi/',
    simple: 'Study of ancient societies through remains',
    synonym: 'Antiquities study',
    siDef: 'පුරාවිද්‍යාව / පැරණි නටබුන් අධ්‍යයනය',
    band: 'Band 7.5+',
    colloc: [
      ['Modern archaeology', 'නූතන පුරාවිද්‍යාව'],
      ['Archaeology excavation', 'පුරාවිද්‍යාත්මක කැණීම්'],
      ['Evidence from archaeology', 'පුරාවිද්‍යාත්මක සාක්ෂි']
    ],
    example: {
      en: 'Advances in archaeology have transformed our understanding of pre-colonial African kingdoms.',
      si: 'පුරාවිද්‍යාවේ දියුණුව යටත්විජිත යුගයට පෙර අප්‍රිකානු රාජධානි පිළිබඳ අපගේ අවබෝධය වෙනස් කර ඇත.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph A',
    term: 'Revealed',
    pos: 'verb',
    ipa: '/rɪˈviːld/',
    simple: 'Made something known',
    synonym: 'Disclosed',
    siDef: 'හෙළිදරව් කරන ලද / අනාවරණය කළ',
    band: 'Band 7.5+',
    colloc: [
      ['Excavations revealed', 'කැණීම්වලින් හෙළි විය'],
      ['Clearly revealed', 'පැහැදිලිව අනාවරණය කළේය'],
      ['Revealed the presence', 'පැවැත්ම හෙළි කළේය']
    ],
    example: {
      en: 'Excavations revealed that social stratification was deeply entrenched in the settlement.',
      si: 'කැණීම්වලින් හෙළි වූයේ මෙම ජනාවාසය තුළ සමාජ පන්ති භේදය දැඩිව පැවති බවයි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph A',
    term: 'Extensive',
    pos: 'adjective',
    ipa: '/ɪkˈstensɪv/',
    simple: 'Large in size or amount',
    synonym: 'Widespread',
    siDef: 'විස්තීර්ණ / පුළුල් / විශාල ප්‍රමාණයේ',
    band: 'Band 7.5+',
    colloc: [
      ['Extensive trade network', 'පුළුල් වෙළඳ ජාලය'],
      ['Extensive research', 'විස්තීර්ණ පර්යේෂණය'],
      ['Extensive remains', 'විශාල නටබුන් ප්‍රමාණයක්']
    ],
    example: {
      en: 'Archaeologists uncovered extensive cattle enclosures containing thick layers of manure.',
      si: 'පුරාවිද්‍යාඥයන් විසින් ඝන ගොම තට්ටු සහිත විශාල ගව ගාල් සොයා ගන්නා ලදී.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph A',
    term: 'Manure',
    pos: 'noun',
    ipa: '/məˈnjʊə(r)/',
    simple: 'Animal waste used as fertiliser',
    synonym: 'Dung',
    siDef: 'සත්ව පොහොර / ගොම',
    band: 'Band 7.0+',
    colloc: [
      ['Layers of manure', 'පොහොර තට්ටු'],
      ['Cattle manure', 'ගව පොහොර'],
      ['Accumulated manure', 'එකතු වූ සත්ව අපද්‍රව්‍ය']
    ],
    example: {
      en: 'Deep deposits of fossilized manure indicate that hundreds of cattle were corralled near the village.',
      si: 'ෆොසිල බවට පත් වූ ගැඹුරු ගොම තට්ටු මගින් ගවයන් සිය ගණනක් ගම්මානය අසල ගාල් කර සිටි බව පෙන්නුම් කරයි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph A',
    term: 'Indicate',
    pos: 'verb',
    ipa: '/ˈɪndɪkeɪt/',
    simple: 'Show or suggest',
    synonym: 'Demonstrate',
    siDef: 'පෙන්වා දෙනවා / ඇඟවුම් කරනවා',
    band: 'Band 7.5+',
    colloc: [
      ['Findings indicate', 'සොයාගැනීම් පෙන්වා දෙයි'],
      ['Clearly indicate', 'පැහැදිලිව ඇඟවුම් කරයි'],
      ['Data indicates that', 'දත්ත මගින් පෙන්නුම් කරන්නේ']
    ],
    example: {
      en: 'The presence of glass beads and Chinese celadon indicates thriving long-distance maritime links.',
      si: 'වීදුරු පබළු සහ චීන සෙලඩන් මැටි භාණ්ඩ තිබීමෙන් පෙන්නුම් කරන්නේ සක්‍රීය දුරස්ථ සාගර වෙළඳ සබඳතා පැවති බවයි.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph A',
    term: 'Herds',
    pos: 'noun',
    ipa: '/hɜːdz/',
    simple: 'Groups of animals',
    synonym: 'Flocks',
    siDef: 'සත්ව රංචු',
    band: 'Band 7.0+',
    colloc: [
      ['Herds of cattle', 'ගව රංචු'],
      ['Large herds', 'විශාල රංචු'],
      ['Graze the herds', 'රංචු තණ කැවීම']
    ],
    example: {
      en: 'Prosperous rulers maintained immense herds of livestock on the surrounding floodplains.',
      si: 'ධනවත් පාලකයන් අවට ගංවතුර තැනිතලාවල දැවැන්ත පශු සම්පත් රංචු නඩත්තු කළහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph A',
    term: 'Traditional',
    pos: 'adjective',
    ipa: '/trəˈdɪʃənl/',
    simple: 'Existing for a long time',
    synonym: 'Conventional',
    siDef: 'සාම්ප්‍රදායික / පුරාණයේ සිට පැවත එන',
    band: 'Band 7.0+',
    colloc: [
      ['Traditional practices', 'සාම්ප්‍රදායික පිළිවෙත්'],
      ['Traditional society', 'සාම්ප්‍රදායික සමාජය'],
      ['Traditional craftsmanship', 'සාම්ප්‍රදායික ශිල්පීයත්වය']
    ],
    example: {
      en: 'Farmers combined traditional crop rotation with seasonal pastoralism.',
      si: 'ගොවීන් සාම්ප්‍රදායික බෝග මාරු කිරීමේ ක්‍රම සමඟ සෘතුමය එඬේර ජීවිතය මුසු කළහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph A',
    term: 'Archaeological record',
    pos: 'phrase',
    ipa: '/ˌɑːkiəˈlɒdʒɪkl ˈrekɔːd/',
    simple: 'Physical evidence of past human life',
    synonym: 'Historical evidence',
    siDef: 'පුරාවිද්‍යාත්මක වාර්තා හා සාක්ෂි එකතුව',
    band: 'Band 8.0+',
    colloc: [
      ['Preserved in the archaeological record', 'පුරාවිද්‍යාත්මක වාර්තාවේ සුරැකී ඇත'],
      ['Examine the archaeological record', 'පුරාවිද්‍යාත්මක වාර්තාව පරීක්ෂා කිරීම'],
      ['Gaps in the archaeological record', 'පුරාවිද්‍යාත්මක සාක්ෂිවල හිඩැස්']
    ],
    example: {
      en: 'The archaeological record at Mapungubwe provides tangible proof of early state formation in Southern Africa.',
      si: 'මාපුංගුබ්වේ පුරාවිද්‍යාත්මක සාක්ෂි දකුණු අප්‍රිකාවේ මුල් රාජ්‍යයන් බිහිවීම පිළිබඳ ස්පර්ශ්‍ය සාක්ෂි සපයයි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph A',
    term: 'Marked increase',
    pos: 'phrase',
    ipa: '/mɑːkt ˈɪnkriːs/',
    simple: 'A clear, noticeable rise',
    synonym: 'Significant growth',
    siDef: 'පැහැදිලි කැපී පෙනෙන වැඩිවීමක්',
    band: 'Band 8.0+',
    colloc: [
      ['Show a marked increase', 'කැපී පෙනෙන වර්ධනයක් පෙන්වයි'],
      ['A marked increase in population', 'ජනගහනයේ පැහැදිලි වැඩිවීමක්'],
      ['Experience a marked increase', 'කැපී පෙනෙන වැඩිවීමක් අත්විඳීම']
    ],
    example: {
      en: 'Excavation layers demonstrate a marked increase in imported foreign artefacts during the 12th century.',
      si: '12 වන සියවසේදී ආනයනය කරන ලද විදේශීය කෞතුක භාණ්ඩවල කැපී පෙනෙන වැඩිවීමක් කැණීම් තට්ටු මගින් පෙන්නුම් කෙරේ.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph A',
    term: 'Domesticated',
    pos: 'adjective',
    ipa: '/dəˈmestɪkeɪtɪd/',
    simple: 'Raised or trained by humans',
    synonym: 'Tamed',
    siDef: 'මිනිසුන් විසින් හීලෑ කරන ලද / ගෘහාශ්‍රිත',
    band: 'Band 7.5+',
    colloc: [
      ['Domesticated animals', 'ගෘහාශ්‍රිත සතුන්'],
      ['Domesticated crops', 'වගා කරන ලද බෝග'],
      ['Domesticated species', 'හීලෑ කළ සත්ව විශේෂ']
    ],
    example: {
      en: 'Bones of domesticated cattle far outnumbered those of hunted wild game at the site.',
      si: 'එම ස්ථානයෙන් හමු වූ දඩයම් කළ වන සතුන්ගේ අස්ථිවලට වඩා ගෘහාශ්‍රිත ගවයන්ගේ අස්ථි ප්‍රමාණය බෙහෙවින් වැඩි විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph A',
    term: 'Cultivation',
    pos: 'noun',
    ipa: '/ˌkʌltɪˈveɪʃn/',
    simple: 'Growing crops',
    synonym: 'Farming',
    siDef: 'බෝග වගා කිරීම / ගොවිතැන',
    band: 'Band 7.5+',
    colloc: [
      ['Sorghum cultivation', 'මෙනේරි වගාව'],
      ['Intensive cultivation', 'දැඩි වගා කටයුතු'],
      ['Land under cultivation', 'වගා කළ භූමිය']
    ],
    example: {
      en: 'Abundant river silt supported the cultivation of millet, sorghum, and cotton.',
      si: 'ගංගා ආශ්‍රිත සාරවත් රොන්මඩ මෙනේරි, බඩඉරිඟු සහ කපු වගාව සඳහා මහඟු පිටුවහලක් විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph A',
    term: 'Abundant',
    pos: 'adjective',
    ipa: '/əˈbʌndənt/',
    simple: 'Existing in large quantities',
    synonym: 'Plentiful',
    siDef: 'සුලබ / බහුලව පවතින / ප්‍රමාණවත් තරම් ඇති',
    band: 'Band 7.5+',
    colloc: [
      ['Abundant rainfall', 'බහුල වර්ෂාපතනය'],
      ['Abundant natural resources', 'සුලබ ස්වභාවික සම්පත්'],
      ['Abundant evidence', 'ප්‍රමාණවත් සාක්ෂි']
    ],
    example: {
      en: 'The settlement flourished due to an abundant supply of water from the confluence of the rivers.',
      si: 'ගංගා දෙක එක්වන ස්ථානයෙන් ලැබුණු බහුල ජල සැපයුම හේතුවෙන් මෙම ජනාවාසය සමෘද්ධිමත් විය.'
    },
    isPriority: true
  },

  // Paragraph B (17 words)
  {
    para: 'Paragraph B',
    term: 'Population',
    pos: 'noun',
    ipa: '/ˌpɒpjuˈleɪʃn/',
    simple: 'Number of people living in an area',
    synonym: 'Inhabitants',
    siDef: 'ජනගහනය / වැසියන් සංඛ්‍යාව',
    band: 'Band 7.0+',
    colloc: [
      ['Dense population', 'ඝන ජනගහනය'],
      ['Population growth', 'ජනගහන වර්ධනය'],
      ['Peak population', 'උපරිම ජනගහනය']
    ],
    example: {
      en: 'The population of Mapungubwe grew to roughly five thousand inhabitants at its zenith.',
      si: 'මාපුංගුබ්වේ ජනගහනය එහි ස්වර්ණමය යුගයේදී වැසියන් පන්දහසක් පමණ දක්වා වර්ධනය විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'At its peak',
    pos: 'phrase',
    ipa: '/æt ɪts piːk/',
    simple: 'At its highest point',
    synonym: 'At its height',
    siDef: 'එහි උපරිම මට්ටමේ පවතින විට',
    band: 'Band 8.0+',
    colloc: [
      ['At its peak of prosperity', 'සමෘද්ධියේ උපරිමයේදී'],
      ['Production was at its peak', 'නිෂ්පාදනය උපරිම මට්ටමක පැවතුණි'],
      ['Reach at its peak', 'උච්චතම අවස්ථාවට ළඟාවීම']
    ],
    example: {
      en: 'At its peak, the kingdom dominated the southern African gold trade for nearly a century.',
      si: 'එහි උච්චතම අවස්ථාවේදී, මෙම රාජධානිය සියවසකට ආසන්න කාලයක් දකුණු අප්‍රිකානු රන් වෙළඳාමේ ආධිපත්‍යය දැරීය.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph B',
    term: 'Wealthiest',
    pos: 'adjective',
    ipa: '/ˈwelθiɪst/',
    simple: 'Having the most money or possessions',
    synonym: 'Richest',
    siDef: 'වඩාත්ම ධනවත් / ප්‍රභූතම',
    band: 'Band 7.0+',
    colloc: [
      ['Wealthiest citizens', 'ධනවත්ම පුරවැසියන්'],
      ['Wealthiest kingdom', 'ධනවත්ම රාජධානිය'],
      ['Among the wealthiest', 'ධනවතුන් අතර']
    ],
    example: {
      en: 'The wealthiest families lived in stone-walled complexes elevated above the commoners.',
      si: 'වඩාත්ම ධනවත් පවුල් සාමාන්‍ය ජනයාට වඩා ඉහළින් පිහිටි ගල් බැමි සහිත සංකීර්ණවල වාසය කළහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'Precious',
    pos: 'adjective',
    ipa: '/ˈpreʃəs/',
    simple: 'Very valuable',
    synonym: 'Valuable',
    siDef: 'ඉතා වටිනා / අගනා',
    band: 'Band 7.0+',
    colloc: [
      ['Precious metals', 'වටිනා ලෝහ'],
      ['Precious commodities', 'වටිනා වෙළඳ ද්‍රව්‍ය'],
      ['Precious beads', 'අගනා පබළු']
    ],
    example: {
      en: 'Foreign merchants exchanged glazed ceramics for precious gold nuggets and elephant ivory.',
      si: 'විදේශීය වෙළඳුන් අගනා රන් කැබලි සහ ඇත්දළ සඳහා ඔප දැමූ මැටි භාණ්ඩ හුවමාරු කර ගත්හ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'Advisers',
    pos: 'noun',
    ipa: '/ədˈvaɪzəz/',
    simple: 'People who give guidance',
    synonym: 'Counsellors',
    siDef: 'උපදේශකවරුන්',
    band: 'Band 7.5+',
    colloc: [
      ['Royal advisers', 'රාජකීය උපදේශකයින්'],
      ['Chief political advisers', 'ප්‍රධාන දේශපාලන උපදේශකයින්'],
      ['Trusted advisers', 'විශ්වාසවන්ත උපදේශකයින්']
    ],
    example: {
      en: 'The sacred monarch resided on the hilltop with close family members and trusted royal advisers.',
      si: 'ශුද්ධ වූ රජු කඳු මුදුනේ වාසය කළේ සමීප පවුලේ සාමාජිකයන් සහ විශ්වාසවන්ත රාජකීය උපදේශකයින් සමඟ ය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'Dwelt',
    pos: 'verb',
    ipa: '/dwelt/',
    simple: 'Lived in a place',
    synonym: 'Resided',
    siDef: 'වාසය කළේය / ජීවත් විය',
    band: 'Band 8.0+',
    colloc: [
      ['Dwelt on the hilltop', 'කඳු මුදුනේ වාසය කළේය'],
      ['Where people dwelt', 'මිනිසුන් වාසය කළ ස්ථානය'],
      ['Dwelt in seclusion', 'හුදකලාව වාසය කළේය']
    ],
    example: {
      en: 'Only the king and his immediate entourage dwelt atop the sacred hill.',
      si: 'පූජනීය කඳු මුදුනේ වාසය කළේ රජු සහ ඔහුගේ සමීපතම රාජකීය පිරිවර පමණි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'Enclosure',
    pos: 'noun',
    ipa: '/ɪnˈkləʊʒə(r)/',
    simple: 'Area surrounded by a barrier',
    synonym: 'Compound',
    siDef: 'ආවරණය කරන ලද වටපිටාව / කොටුව',
    band: 'Band 7.5+',
    colloc: [
      ['Stone enclosure', 'ගල් බැමි කොටුව'],
      ['Royal enclosure', 'රාජකීය වටපිටාව'],
      ['Boundary enclosure', 'මායිම් ආවරණය']
    ],
    example: {
      en: 'A massive stone enclosure separated the royal quarters from the rest of the mountain.',
      si: 'විශාල ගල් බැම්මකින් යුත් කොටුවකින් රාජකීය නිවාස කන්දේ අනෙක් කොටස් වලින් වෙන් කරන ලදී.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'Composed of',
    pos: 'phrase',
    ipa: '/kəmˈpəʊzd ɒv/',
    simple: 'Made up of',
    synonym: 'Consisting of',
    siDef: 'සමන්විත වූ / සෑදී ඇති',
    band: 'Band 7.5+',
    colloc: [
      ['Composed of stone walls', 'ගල් බැමි වලින් සමන්විත'],
      ['Largely composed of', 'බොහෝ දුරට සමන්විත වන්නේ'],
      ['Composed of distinct layers', 'විවිධ ස්ථර වලින් සමන්විත']
    ],
    example: {
      en: 'The royal palace was composed of dressed stone blocks laid without mortar.',
      si: 'රාජකීය මාලිගය බදාම නොමැතිව තැන්පත් කරන ලද කැපූ ගල් කුට්ටි වලින් සමන්විත විය.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph B',
    term: 'Territory',
    pos: 'noun',
    ipa: '/ˈterətri/',
    simple: 'Land controlled by a group',
    synonym: 'Region',
    siDef: 'පාලන ප්‍රදේශය / දේශසීමාව',
    band: 'Band 7.0+',
    colloc: [
      ['Sovereign territory', 'ස්වෛරී භූමිය'],
      ['Vast territory', 'විශාල ප්‍රදේශය'],
      ['Expand territory', 'භූමිය පුළුල් කිරීම']
    ],
    example: {
      en: 'Mapungubwe extended its political dominance over a territory spanning thousands of square kilometres.',
      si: 'මාපුංගුබ්වේ රාජධානිය වර්ග කිලෝමීටර් දහස් ගණනක භූමි ප්‍රදේශයක් පුරා සිය දේශපාලන ආධිපත්‍යය පැතිරවීය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'Occupation',
    pos: 'noun',
    ipa: '/ˌɒkjuˈpeɪʃn/',
    simple: 'Living in or using a place',
    synonym: 'Settlement',
    siDef: 'පදිංචිව සිටීම / භුක්ති විඳීම',
    band: 'Band 7.5+',
    colloc: [
      ['Centuries of occupation', 'සියවස් ගණනාවක පදිංචිය'],
      ['Continuous occupation', 'අඛණ්ඩ පදිංචිය'],
      ['Human occupation', 'මානව ජනාවාසකරණය']
    ],
    example: {
      en: 'Radio-carbon dating indicates continuous human occupation between 1075 and 1220 AD.',
      si: 'විකිරණශීලී කාබන් කාල නිර්ණය පෙන්වා දෙන්නේ ක්‍රි.ව. 1075 සහ 1220 අතර කාලය තුළ අඛණ්ඩ මානව පදිංචිය පැවති බවයි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'Complex',
    pos: 'noun',
    ipa: '/ˈkɒmpleks/',
    simple: 'Group of connected buildings',
    synonym: 'Compound',
    siDef: 'ගොඩනැගිලි සංකීර්ණය',
    band: 'Band 7.5+',
    colloc: [
      ['Architectural complex', 'වාස්තු විද්‍යාත්මක සංකීර්ණය'],
      ['Palace complex', 'මාලිගා සංකීර්ණය'],
      ['Residential complex', 'නේවාසික සංකීර්ණය']
    ],
    example: {
      en: 'The hill complex featured distinct ritual spaces, granaries, and residential huts.',
      si: 'කඳුකර සංකීර්ණය තුළ විශේෂ චාරිත්‍රානුකූල ස්ථාන, ධාන්‍යාගාර සහ නේවාසික පැල්පත් දක්නට ලැබුණි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'Surrounded',
    pos: 'verb',
    ipa: '/səˈraʊndɪd/',
    simple: 'Having something all around',
    synonym: 'Encircled',
    siDef: 'වටවී ඇති / වටකරන ලද',
    band: 'Band 7.0+',
    colloc: [
      ['Surrounded by hills', 'කඳුවලින් වටවී ඇත'],
      ['Surrounded by a fence', 'වැටකින් වටවී ඇත'],
      ['Completely surrounded', 'සම්පූර්ණයෙන්ම වටවී ඇත']
    ],
    example: {
      en: 'The central homestead was surrounded by a wooden palisade to keep predators out.',
      si: 'කොල්ලකාරී සතුන්ගෙන් ආරක්ෂා වීම සඳහා ප්‍රධාන නිවස වටා ලී වැටක් ඉදිකර තිබුණි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'Palisade',
    pos: 'noun',
    ipa: '/ˌpælɪˈseɪd/',
    simple: 'Fence made from wooden posts',
    synonym: 'Wooden barrier',
    siDef: 'ලී කණු වැට / ආරක්ෂක ලී බැම්ම',
    band: 'Band 8.0+',
    colloc: [
      ['Defensive palisade', 'ආරක්ෂක ලී වැට'],
      ['Wooden palisade', 'ලී කණු වැට'],
      ['Erect a palisade', 'ලී වැටක් ඉදි කිරීම']
    ],
    example: {
      en: 'Post-holes discovered along the perimeter confirm the presence of a tall defensive palisade.',
      si: 'ප්‍රාකාරය දිගේ හමු වූ කණු සිටවූ වළවල් මගින් උස ආරක්ෂක ලී වැටක් තිබූ බව තහවුරු වේ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'Indicated by',
    pos: 'phrase',
    ipa: '/ˈɪndɪkeɪtɪd baɪ/',
    simple: 'Shown or suggested by',
    synonym: 'Evidenced by',
    siDef: 'මගින් පෙන්වා දෙන / ඇඟවුම් කරන',
    band: 'Band 7.5+',
    colloc: [
      ['As indicated by evidence', 'සාක්ෂි මගින් පෙන්වා දී ඇති පරිදි'],
      ['Indicated by postholes', 'කණු සලකුණු මගින් හෙළි වන'],
      ['Status indicated by jewellery', 'ආභරණ මගින් පෙන්වන තත්ත්වය']
    ],
    example: {
      en: 'The high social standing of the deceased was indicated by gold beads found in the graves.',
      si: 'මියගිය අයගේ උසස් සමාජ තත්ත්වය සොහොන්වල තිබී හමුවූ රන් පබළු මගින් පෙන්නුම් කෙරිණි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'Thatch',
    pos: 'noun',
    ipa: '/θætʃ/',
    simple: 'Dried plant material used for roofs',
    synonym: 'Roofing straw',
    siDef: 'පිදුරු හෝ තණකොළ සෙවිලි කළ වහල',
    band: 'Band 7.5+',
    colloc: [
      ['Thatch roof', 'පිදුරු සෙවිලි කළ වහලය'],
      ['Layers of thatch', 'පිදුරු තට්ටු'],
      ['Burned thatch', 'පිළිස්සුණු පිදුරු']
    ],
    example: {
      en: 'Ordinary houses had mud-plastered walls covered with conical roofs of woven thatch.',
      si: 'සාමාන්‍ය නිවාසවල මැටි ගෑ බිත්ති සහ වියන ලද පිදුරු සෙවිලි කළ කේතුකාකාර වහල තිබුණි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'Settlement',
    pos: 'noun',
    ipa: '/ˈsetlmənt/',
    simple: 'Place where people establish homes',
    synonym: 'Community',
    siDef: 'ජනාවාසය / ගම්මානය',
    band: 'Band 7.0+',
    colloc: [
      ['Permanent settlement', 'ස්ථිර ජනාවාසය'],
      ['Ancient settlement', 'පැරණි ජනාවාසය'],
      ['Urban settlement', 'නාගරික ජනාවාසය']
    ],
    example: {
      en: 'What began as a farming village evolved into the largest urban settlement of its era.',
      si: 'ගොවි ගම්මානයක් ලෙස ආරම්භ වූ ස්ථානය එකල පැවති විශාලතම නාගරික ජනාවාසය බවට පරිණාමය විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph B',
    term: 'Predates',
    pos: 'verb',
    ipa: '/ˌpriːˈdeɪts/',
    simple: 'Existed before something else',
    synonym: 'Came before',
    siDef: 'යම් දෙයකට පෙර පැවතියා / ඊට වඩා පැරණිය',
    band: 'Band 8.0+',
    colloc: [
      ['Predates Great Zimbabwe', 'මහා සිම්බාබ්වේ රාජධානියට පෙර පැවතුණි'],
      ['Predates European arrival', 'යුරෝපීය ආගමනයට පෙර පැවතුණි'],
      ['Predates written records', 'ලිඛිත වාර්තාවලට වඩා පැරණිය']
    ],
    example: {
      en: 'The architecture of Mapungubwe predates the monumental stone structures of Great Zimbabwe.',
      si: 'මාපුංගුබ්වේ හි ගෘහ නිර්මාණ ශිල්පය මහා සිම්බාබ්වේ දැවැන්ත ගල් නිර්මාණවලටත් පෙර පැවති එකකි.'
    },
    isPriority: true
  },

  // Paragraph C (14 words)
  {
    para: 'Paragraph C',
    term: 'Buried',
    pos: 'verb',
    ipa: '/ˈberid/',
    simple: 'Placed a dead body in the ground',
    synonym: 'Interred',
    siDef: 'මිහිදන් කරන ලද / වළලන ලද',
    band: 'Band 7.0+',
    colloc: [
      ['Buried with gold', 'රන් ආභරණ සමඟ මිහිදන් කළ'],
      ['Buried on the hill', 'කඳු මුදුනේ මිහිදන් කළ'],
      ['Formally buried', 'චාරිත්‍රානුකූලව මිහිදන් කරන ලදී']
    ],
    example: {
      en: 'Royals were buried at the top of the hill with exquisite gold figurines and glass ornaments.',
      si: 'රාජකීයයන් කඳු මුදුනේ අතිවිශිෂ්ට රන් රූප සහ වීදුරු සැරසිලි සමඟ මිහිදන් කරන ලදී.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph C',
    term: 'Demarcated',
    pos: 'verb',
    ipa: '/ˈdiːmɑːkeɪtɪd/',
    simple: 'Clearly marked or separated',
    synonym: 'Delimited',
    siDef: 'පැහැදිලිව වෙන් කරන ලද / මායිම් ලකුණු කළ',
    band: 'Band 8.5+',
    colloc: [
      ['Clearly demarcated', 'පැහැදිලිව වෙන් කර ඇති'],
      ['Demarcated boundaries', 'මායිම් ලකුණු කරන ලද සීමාවන්'],
      ['Socially demarcated', 'සමාජයීය වශයෙන් වෙන් වූ']
    ],
    example: {
      en: 'Dry-stone retaining walls demarcated elite living areas from the settlements below.',
      si: 'වියළි ගල් බැමි මගින් ප්‍රභූ ජීවන ප්‍රදේශ පහළ ජනාවාසවලින් පැහැදිලිව වෙන් කර තිබුණි.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph C',
    term: 'Dwellings',
    pos: 'noun',
    ipa: '/ˈdwelɪŋz/',
    simple: 'Places where people live',
    synonym: 'Residences',
    siDef: 'වාසස්ථාන / නිවාස',
    band: 'Band 7.5+',
    colloc: [
      ['Traditional dwellings', 'සාම්ප්‍රදායික වාසස්ථාන'],
      ['Commoner dwellings', 'සාමාන්‍ය වැසියන්ගේ නිවාස'],
      ['Erect dwellings', 'වාසස්ථාන ඉදිකිරීම']
    ],
    example: {
      en: 'While elite dwellings sat atop the plateau, the commoners built their homes in the surrounding valley.',
      si: 'ප්‍රභූ නිවාස සානුව මුදුනේ පිහිටා තිබියදී, සාමාන්‍ය වැසියන් සිය නිවෙස් අවට නිම්නයේ ඉදිකර ගත්හ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph C',
    term: 'Surrounding',
    pos: 'adjective',
    ipa: '/səˈraʊndɪŋ/',
    simple: 'Located around something',
    synonym: 'Nearby',
    siDef: 'වටපිටාවේ පිහිටි / අවට ප්‍රදේශයේ',
    band: 'Band 7.0+',
    colloc: [
      ['Surrounding landscape', 'අවට භූ දර්ශනය'],
      ['Surrounding communities', 'අවට ප්‍රජාවන්'],
      ['Surrounding valley', 'අවට නිම්නය']
    ],
    example: {
      en: 'Runoff water from the surrounding sandstone ridges nourished agricultural plots in the valley.',
      si: 'අවට වැලිගල් කඳුවැටිවලින් ගලා ආ ජලය නිම්නයේ කෘෂිකාර්මික බිම් සාරවත් කළේය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph C',
    term: 'Valley',
    pos: 'noun',
    ipa: '/ˈvæli/',
    simple: 'Low land between hills',
    synonym: 'Basin',
    siDef: 'නිම්නය / මිටියාවත',
    band: 'Band 7.0+',
    colloc: [
      ['Fertile valley', 'සාරවත් නිම්නය'],
      ['River valley', 'ගංගා නිම්නය'],
      ['Valley floor', 'නිම්නයේ බිම් මට්ටම']
    ],
    example: {
      en: 'Most of the population resided on the fertile valley floor close to their cultivated fields.',
      si: 'ජනගහනයෙන් වැඩි කොටසක් සිය වගාබිම්වලට ආසන්නව පිහිටි සාරවත් නිම්න භූමියේ වාසය කළහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph C',
    term: 'Sockets',
    pos: 'noun',
    ipa: '/ˈsɒkɪts/',
    simple: 'Holes designed to hold something',
    synonym: 'Recesses',
    siDef: 'කණු හෝ දැව සවි කිරීමට සාදන ලද සිදුරු',
    band: 'Band 7.5+',
    colloc: [
      ['Chiseled sockets', 'ගල් කපා සෑදූ කුහර'],
      ['Wooden post sockets', 'ලී කණු සවි කළ කුහර'],
      ['Rock-cut sockets', 'පර්වතයේ කැපූ කුහර']
    ],
    example: {
      en: 'Sockets carved into the rock face held stout wooden beams that formed an access stairway.',
      si: 'පර්වතය මතුපිට කැපූ කුහරවලට ශක්තිමත් ලී බාල්ක සවි කර ප්‍රවේශ පඩිපෙළක් සකසා තිබුණි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph C',
    term: 'Cliff face',
    pos: 'noun',
    ipa: '/klɪf feɪs/',
    simple: 'Steep exposed side of a cliff',
    synonym: 'Rock face',
    siDef: 'ප්‍රපාතාකාර පර්වත බෑවුම',
    band: 'Band 7.5+',
    colloc: [
      ['Sheer cliff face', 'කෙළින් පිහිටි පර්වත බෑවුම'],
      ['Ascend the cliff face', 'පර්වත බෑවුම තරණය කිරීම'],
      ['Steep cliff face', 'බෑවුම් සහිත පර්වතය']
    ],
    example: {
      en: 'A narrow crevice in the sheer cliff face provided the only entry point to the royal summit.',
      si: 'ප්‍රපාතාකාර පර්වත බෑවුමේ පිහිටි පටු විවරයක් රාජකීය මුදුනට ඇතුළු විය හැකි එකම ස්ථානය විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph C',
    term: 'Grander',
    pos: 'adjective',
    ipa: '/ˈɡrændə(r)/',
    simple: 'More impressive or luxurious',
    synonym: 'More magnificent',
    siDef: 'වඩාත් තේජාන්විත / වඩාත් විශිෂ්ට',
    band: 'Band 7.5+',
    colloc: [
      ['Grander structures', 'වඩාත් තේජාන්විත ගොඩනැගිලි'],
      ['Grander scale', 'වඩාත් විශාල පරිමාණයකින්'],
      ['Grander residence', 'වඩාත් විශිෂ්ට නිවහන']
    ],
    example: {
      en: 'The king’s compound was significantly grander in scale and decorative finish than ordinary huts.',
      si: 'රජුගේ පරිශ්‍රය සාමාන්‍ය පැල්පත්වලට වඩා පරිමාණයෙන් සහ අලංකාරයෙන් බෙහෙවින් විශිෂ්ට විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph C',
    term: 'Residences',
    pos: 'noun',
    ipa: '/ˈrezɪdənsɪz/',
    simple: 'Homes or houses',
    synonym: 'Dwellings',
    siDef: 'නේවාසික ස්ථාන / නිවාස',
    band: 'Band 7.5+',
    colloc: [
      ['Royal residences', 'රාජකීය නිවාස'],
      ['Elite residences', 'ප්‍රභූ නිවාස'],
      ['Construct residences', 'නිවාස ඉදිකිරීම']
    ],
    example: {
      en: 'Stone foundations reveal the exact boundaries of several high-status residences.',
      si: 'ගල් පදනම් මගින් උසස් සමාජ මට්ටමේ නිවාස කිහිපයක නියම සීමාවන් හෙළිදරව් වේ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph C',
    term: 'Dotted around',
    pos: 'phrase',
    ipa: '/ˈdɒtɪd əˈraʊnd/',
    simple: 'Scattered across an area',
    synonym: 'Dispersed',
    siDef: 'ප්‍රදේශය පුරා විසිරී ඇති',
    band: 'Band 8.0+',
    colloc: [
      ['Dotted around the valley', 'මිටියාවත පුරා විසිරී ඇත'],
      ['Settlements dotted around', 'විසිරී පිහිටි ජනාවාස'],
      ['Shrines dotted around', 'තැනින් තැන පිහිටි පුදබිම්']
    ],
    example: {
      en: 'Smaller satellite homesteads were dotted around the base of the mountain.',
      si: 'කන්ද පාමුල අවට ප්‍රදේශය පුරා කුඩා අනුබද්ධ ජනාවාස විසිරී තිබුණි.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph C',
    term: 'Outskirts',
    pos: 'noun',
    ipa: '/ˈaʊtskɜːts/',
    simple: 'Outer parts of an area',
    synonym: 'Periphery',
    siDef: 'නගර හෝ ජනාවාසයක පිටත මායිම',
    band: 'Band 7.5+',
    colloc: [
      ['On the outskirts of town', 'නගරයේ මායිම් ප්‍රදේශයේ'],
      ['Rural outskirts', 'ග්‍රාමීය මායිම'],
      ['Located on the outskirts', 'පිටත මායිමේ පිහිටා ඇත']
    ],
    example: {
      en: 'Blacksmiths and ceramic workers operated on the outskirts of the settlement to keep smoke away.',
      si: 'දුමාරය පිටවීම වැළැක්වීම සඳහා කම්මල්කරුවන් සහ කුඹල්කරුවන් ජනාවාසයේ පිටත මායිමේ වැඩ කළහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph C',
    term: 'Impressive',
    pos: 'adjective',
    ipa: '/ɪmˈpresɪv/',
    simple: 'Causing admiration',
    synonym: 'Remarkable',
    siDef: 'විස්මයජනක / සිත් ඇදගන්නාසුළු',
    band: 'Band 7.0+',
    colloc: [
      ['Impressive masonry', 'විස්මයජනක ගල් වැඩ'],
      ['Impressive achievements', 'සිත් ඇදගන්නා ජයග්‍රහණ'],
      ['Impressive architecture', 'විශිෂ්ට ගෘහ නිර්මාණ ශිල්පය']
    ],
    example: {
      en: 'The dry-stone terracing on the southern flank remains an impressive feat of pre-modern engineering.',
      si: 'දකුණු බෑවුමේ පිහිටි ගල් බැමි අදටත් පූර්ව නූතන ඉංජිනේරු විද්‍යාවේ විස්මයජනක නිර්මාණයකි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph C',
    term: 'Local chiefs',
    pos: 'phrase',
    ipa: '/ˈləʊkl tʃiːfs/',
    simple: 'Leaders of smaller communities',
    synonym: 'Regional leaders',
    siDef: 'ප්‍රාදේශීය නායකයින් / ගම් ප්‍රධානීන්',
    band: 'Band 7.5+',
    colloc: [
      ['Council of local chiefs', 'ප්‍රාදේශීය නායකයන්ගේ සභාව'],
      ['Subordinate local chiefs', 'යටත් ප්‍රාදේශීය ප්‍රධානීන්'],
      ['Tribute from local chiefs', 'ප්‍රාදේශීය නායකයන්ගෙන් ලැබුණු පඬුරු']
    ],
    example: {
      en: 'The king exerted authority over local chiefs by controlling the distribution of prestigious trade goods.',
      si: 'වටිනා වෙළඳ භාණ්ඩ බෙදා හැරීම පාලනය කිරීම මගින් රජු ප්‍රාදේශීය නායකයින් කෙරෙහි තම බලය තහවුරු කළේය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph C',
    term: 'Servants',
    pos: 'noun',
    ipa: '/ˈsɜːvənts/',
    simple: 'People working for someone',
    synonym: 'Attendants',
    siDef: 'සේවකයන් / උපස්ථායකයන්',
    band: 'Band 7.0+',
    colloc: [
      ['Royal servants', 'රාජකීය සේවකයෝ'],
      ['Domestic servants', 'ගෘහ සේවකයෝ'],
      ['Attended by servants', 'සේවකයින් විසින් උපස්ථාන කරන ලද']
    ],
    example: {
      en: 'Hundreds of servants carried firewood, fresh water, and food up the cliff each day.',
      si: 'සෑම දිනකම සේවකයන් සිය ගණනක් දර, පිරිසිදු ජලය සහ ආහාර පර්වතය මුදුනට රැගෙන ගියහ.'
    },
    isPriority: false
  },

  // Paragraph D (17 words)
  {
    para: 'Paragraph D',
    term: 'Carnivore',
    pos: 'noun',
    ipa: '/ˈkɑːnɪvɔː(r)/',
    simple: 'Animal that eats meat',
    synonym: 'Meat-eater',
    siDef: 'මාංශ භක්ෂක සත්වයා',
    band: 'Band 7.5+',
    colloc: [
      ['Apex carnivore', 'ප්‍රධාන මාංශ භක්ෂකයා'],
      ['Wild carnivores', 'වනචාරී මාංශ භක්ෂකයින්'],
      ['Bones of carnivores', 'මාංශ භක්ෂක සතුන්ගේ අස්ථි']
    ],
    example: {
      en: 'Carnivore teeth and claws were fashioned into ritual amulets by Mapungubwe shamans.',
      si: 'මාපුංගුබ්වේ පූජකවරුන් විසින් මාංශ භක්ෂක සතුන්ගේ දත් සහ නියපොතු චාරිත්‍රානුකූල සුර බවට පත් කරන ලදී.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph D',
    term: 'Remains',
    pos: 'noun',
    ipa: '/rɪˈmeɪnz/',
    simple: 'Parts left after something has died or disappeared',
    synonym: 'Relics',
    siDef: 'නටබුන් / අවශේෂ / අස්ථි කොටස්',
    band: 'Band 7.0+',
    colloc: [
      ['Skeletal remains', 'ඇටසැකිලි අවශේෂ'],
      ['Architectural remains', 'වාස්තු විද්‍යාත්මක නටබුන්'],
      ['Animal remains', 'සත්ව අවශේෂ']
    ],
    example: {
      en: 'Buried remains of ancient meals offer direct insights into the diet of the kingdom’s social tiers.',
      si: 'පුරාණ ආහාරවල අවශේෂ මගින් රාජධානියේ විවිධ සමාජ පන්තිවල ආහාර පුරුදු පිළිබඳ සෘජු අවබෝධයක් ලබා දෙයි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph D',
    term: 'Ivory',
    pos: 'noun',
    ipa: '/ˈaɪvəri/',
    simple: 'Hard white material from elephant tusks',
    synonym: 'Elephant tusk material',
    siDef: 'ඇත්දළ',
    band: 'Band 7.5+',
    colloc: [
      ['Carved ivory', 'කැටයම් කළ ඇත්දළ'],
      ['Ivory trade', 'ඇත්දළ වෙළඳාම'],
      ['Precious ivory', 'වටිනා ඇත්දළ']
    ],
    example: {
      en: 'Unworked elephant ivory was stockpiled at the citadel before being transported to eastern ports.',
      si: 'නැගෙනහිර වරායන් වෙත ප්‍රවාහනය කිරීමට පෙර අමු ඇත්දළ බලකොටුවේ ගබඩා කර තබන ලදී.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph D',
    term: 'Splinters',
    pos: 'noun',
    ipa: '/ˈsplɪntəz/',
    simple: 'Small, thin, sharp pieces',
    synonym: 'Fragments',
    siDef: 'කුඩා කැබලි / පතුරු',
    band: 'Band 7.5+',
    colloc: [
      ['Ivory splinters', 'ඇත්දළ කැබලි'],
      ['Bone splinters', 'අස්ථි පතුරු'],
      ['Splinters of wood', 'ලී පතුරු']
    ],
    example: {
      en: 'Thousands of tiny ivory splinters found in the soil indicate active on-site carving workshops.',
      si: 'පසෙහි තිබී හමු වූ කුඩා ඇත්දළ පතුරු දහස් ගණනක් මගින් එම ස්ථානයේ ඇත්දළ කැටයම් වැඩපොළවල් තිබූ බව හෙළි වේ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph D',
    term: 'Suggesting',
    pos: 'verb',
    ipa: '/səˈdʒestɪŋ/',
    simple: 'Indicating something may be true',
    synonym: 'Implying',
    siDef: 'පෙන්වා දෙමින් / ඇඟවුම් කරමින්',
    band: 'Band 7.5+',
    colloc: [
      ['Evidence suggesting that', 'සාක්ෂි මගින් ඇඟවෙන්නේ'],
      ['Data suggesting a change', 'වෙනසක් පෙන්නුම් කරන දත්ත'],
      ['Findings suggesting wealth', 'ධනය පෙන්නුම් කරන සොයාගැනීම්']
    ],
    example: {
      en: 'Exotic marine cowrie shells were found throughout the valley, suggesting established coastal contacts.',
      si: 'මුළු නිම්නය පුරාම සාගර කවඩි බෙල්ලන් හමුවීමෙන් වෙරළබඩ සබඳතා පැවති බව ඇඟවේ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph D',
    term: 'Accumulated',
    pos: 'verb',
    ipa: '/əˈkjuːmjəleɪtɪd/',
    simple: 'Collected over time',
    synonym: 'Gathered',
    siDef: 'කාලයත් සමඟ එක්රැස් වූ / ගොඩගැසුණු',
    band: 'Band 8.0+',
    colloc: [
      ['Accumulated wealth', 'එක්රැස් වූ ධනය'],
      ['Debris accumulated', 'නටබුන් එකතු විය'],
      ['Accumulated over centuries', 'සියවස් ගණනාවක් පුරා රැස් වූ']
    ],
    example: {
      en: 'Rulers accumulated vast stores of grain to protect against recurring regional famines.',
      si: 'නිතර ඇතිවන නියඟ හා සාගින්නෙන් ආරක්ෂා වීම සඳහා පාලකයෝ විශාල ධාන්‍ය තොග රැස් කළහ.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph D',
    term: 'Tusks',
    pos: 'noun',
    ipa: '/tʌsks/',
    simple: 'Long pointed teeth of certain animals',
    synonym: 'Elephant teeth',
    siDef: 'ඇත් දළ / සත්ව දළ',
    band: 'Band 7.0+',
    colloc: [
      ['Elephant tusks', 'ඇත් දළ'],
      ['Pairs of tusks', 'දළ යුගල'],
      ['Heavy tusks', 'බරැති ඇත්දළ']
    ],
    example: {
      en: 'Hunting parties ranged across the savanna to secure prime elephant tusks for foreign export.',
      si: 'විදේශ අපනයනය සඳහා උසස් තත්ත්වයේ ඇත්දළ ලබා ගැනීමට දඩයම් කණ්ඩායම් සැවානා තණබිම් පුරා ගමන් කළහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph D',
    term: 'Coastal',
    pos: 'adjective',
    ipa: '/ˈkəʊstl/',
    simple: 'Near the sea',
    synonym: 'Seaside',
    siDef: 'මුහුදුබඩ / වෙරළබඩ',
    band: 'Band 7.0+',
    colloc: [
      ['Coastal ports', 'වෙරළබඩ වරායන්'],
      ['Coastal traders', 'වෙරළබඩ වෙළඳුන්'],
      ['Coastal settlements', 'වෙරළබඩ ජනාවාස']
    ],
    example: {
      en: 'Caravans trekked hundreds of miles from the interior to trade at coastal ports such as Chibuene.',
      si: 'අභ්‍යන්තරයේ සිට පැමිණි ගැල්කරුවන් චිබුයින් වැනි වෙරළබඩ වරායන්හි වෙළඳාම් කිරීමට සැතපුම් සිය ගණනක් පයින් ගමන් කළහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph D',
    term: 'Presence',
    pos: 'noun',
    ipa: '/ˈprezns/',
    simple: 'State of existing somewhere',
    synonym: 'Existence',
    siDef: 'පැවැත්ම / තිබීම',
    band: 'Band 7.5+',
    colloc: [
      ['Presence of artefacts', 'කෞතුක වස්තු පැවතීම'],
      ['Physical presence', 'භෞතික පැවැත්ම'],
      ['Confirm the presence', 'පැවැත්ම තහවුරු කිරීම']
    ],
    example: {
      en: 'The presence of glazed Persian pottery confirms that trans-oceanic trade reached inland Africa.',
      si: 'ඔප දැමූ පර්සියානු මැටි භාණ්ඩ හමුවීමෙන් තහවුරු වන්නේ සාගරය හරහා පැමිණි වෙළඳාම අප්‍රිකානු අභ්‍යන්තරයටද ළඟා වූ බවයි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph D',
    term: 'Merchants',
    pos: 'noun',
    ipa: '/ˈmɜːtʃənts/',
    simple: 'People who buy and sell goods',
    synonym: 'Traders',
    siDef: 'වෙළඳුන්',
    band: 'Band 7.0+',
    colloc: [
      ['Foreign merchants', 'විදේශීය වෙළඳුන්'],
      ['Swahili merchants', 'ස්වාහිලි වෙළඳුන්'],
      ['Wealthy merchants', 'ධනවත් වෙළඳුන්']
    ],
    example: {
      en: 'Arab and Swahili merchants sailed dhows down the East African coast to obtain precious goods.',
      si: 'වටිනා භාණ්ඩ ලබා ගැනීම සඳහා අරාබි සහ ස්වාහිලි වෙළඳුන් නැගෙනහිර අප්‍රිකානු වෙරළ ඔස්සේ යාත්‍රා කළහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph D',
    term: 'Locally sourced',
    pos: 'phrase',
    ipa: '/ˈləʊkəli sɔːst/',
    simple: 'Obtained from the surrounding area',
    synonym: 'Locally obtained',
    siDef: 'ප්‍රාදේශීයව ලබාගත් / අවටින් සපයාගත්',
    band: 'Band 7.5+',
    colloc: [
      ['Locally sourced materials', 'ප්‍රාදේශීයව ලබාගත් ද්‍රව්‍ය'],
      ['Locally sourced gold', 'ප්‍රදේශයෙන් ලබාගත් රත්තරන්'],
      ['Locally sourced clay', 'අවටින් සපයාගත් මැටි']
    ],
    example: {
      en: 'Artisans fashioned delicate animal statuettes from locally sourced river clay.',
      si: 'ශිල්පීන් ප්‍රදේශයේ ගංගාවලින් ලබාගත් මැටි යොදා ගනිමින් සියුම් සත්ව ප්‍රතිමා නිර්මාණය කළහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph D',
    term: 'Trade links',
    pos: 'phrase',
    ipa: '/treɪd lɪŋks/',
    simple: 'Trading connections between places',
    synonym: 'Commercial ties',
    siDef: 'වෙළඳ සබඳතා / සබඳතා ජාලය',
    band: 'Band 7.5+',
    colloc: [
      ['Extensive trade links', 'පුළුල් වෙළඳ සබඳතා'],
      ['International trade links', 'ජාත්‍යන්තර වෙළඳ සබඳතා'],
      ['Establish trade links', 'වෙළඳ සබඳතා ගොඩනැගීම']
    ],
    example: {
      en: 'Flourishing trade links with the Indian Ocean network transformed local political dynamics.',
      si: 'ඉන්දියන් සාගර ජාලය සමඟ පැවති සමෘද්ධිමත් වෙළඳ සබඳතා දේශීය දේශපාලන රටාව වෙනස් කළේය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph D',
    term: 'Strengthening',
    pos: 'verb',
    ipa: '/ˈstreŋθnɪŋ/',
    simple: 'Making something stronger',
    synonym: 'Reinforcement',
    siDef: 'ශක්තිමත් කිරීම / තහවුරු කිරීම',
    band: 'Band 7.5+',
    colloc: [
      ['Strengthening authority', 'බලය තහවුරු කිරීම'],
      ['Strengthening ties', 'සබඳතා ශක්තිමත් කිරීම'],
      ['Strengthening economic power', 'ආර්ථික ශක්තිය වැඩි කිරීම']
    ],
    example: {
      en: 'The monopoly on gold trade played a key role in strengthening the king’s political supremacy.',
      si: 'රන් වෙළඳාමේ ඒකාධිකාරය රජුගේ දේශපාලන ආධිපත්‍යය ශක්තිමත් කිරීමට ප්‍රධාන කාර්යභාරයක් ඉටු කළේය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph D',
    term: 'Political authority',
    pos: 'phrase',
    ipa: '/pəˈlɪtɪkl ɔːˈθɒrəti/',
    simple: 'Power to govern or make decisions',
    synonym: 'Governing power',
    siDef: 'දේශපාලන බලය / පාලන අධිකාරිය',
    band: 'Band 8.0+',
    colloc: [
      ['Centralized political authority', 'කේන්ද්‍රගත දේශපාලන අධිකාරිය'],
      ['Exercise political authority', 'දේශපාලන බලය ක්‍රියාත්මක කිරීම'],
      ['Consolidate political authority', 'පාලන බලය ස්ථාවර කිරීම']
    ],
    example: {
      en: 'Control over prestige commodities allowed rulers to consolidate centralized political authority.',
      si: 'වටිනා භාණ්ඩ පාලනය කිරීම මගින් පාලකයන්ට කේන්ද්‍රගත දේශපාලන බලය තහවුරු කර ගැනීමට හැකි විය.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph D',
    term: 'Monopolise',
    pos: 'verb',
    ipa: '/məˈnɒpəlaɪz/',
    simple: 'Gain exclusive control over something',
    synonym: 'Dominate',
    siDef: 'ඒකාධිකාරයක් ඇති කර ගැනීම',
    band: 'Band 8.5+',
    colloc: [
      ['Monopolise trade', 'වෙළඳාම තනිව පාලනය කිරීම'],
      ['Monopolise resources', 'සම්පත්වල ඒකාධිකාරය ගැනීම'],
      ['Attempt to monopolise', 'තනි අයිතිය ලබා ගැනීමට උත්සාහ කිරීම']
    ],
    example: {
      en: 'The elite attempted to monopolise the importation of glass beads to maintain their exclusive status.',
      si: 'සිය සුවිශේෂී තත්ත්වය පවත්වා ගැනීම සඳහා ප්‍රභූන් වීදුරු පබළු ආනයනයේ ඒකාධිකාරය තබා ගැනීමට උත්සාහ කළහ.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph D',
    term: 'Lucrative',
    pos: 'adjective',
    ipa: '/ˈluːkrətɪv/',
    simple: 'Producing a lot of money',
    synonym: 'Profitable',
    siDef: 'ඉතා ලාභදායී / විශාල ධනයක් ගෙන දෙන',
    band: 'Band 8.0+',
    colloc: [
      ['Lucrative trade', 'ලාභදායී වෙළඳාම'],
      ['Highly lucrative', 'ඉතාමත් ලාභ උපදවන'],
      ['Lucrative market', 'ලාභදායී වෙළඳපොළ']
    ],
    example: {
      en: 'Participation in the lucrative Indian Ocean exchange enriched Mapungubwe’s ruling elite.',
      si: 'ඉතා ලාභදායී ඉන්දියන් සාගර වෙළඳාමට සම්බන්ධ වීමෙන් මාපුංගුබ්වේ පාලක ප්‍රභූන් මහත් ධනවත් විය.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph D',
    term: 'Interregional',
    pos: 'adjective',
    ipa: '/ˌɪntəˈriːdʒənl/',
    simple: 'Between different regions',
    synonym: 'Cross-regional',
    siDef: 'කලාප අතර පවතින / අන්තර් කලාපීය',
    band: 'Band 8.0+',
    colloc: [
      ['Interregional commerce', 'අන්තර් කලාපීය වාණිජ්‍යය'],
      ['Interregional network', 'කලාප අතර ජාලය'],
      ['Interregional relations', 'අන්තර් කලාපීය සබඳතා']
    ],
    example: {
      en: 'Mapungubwe served as a crucial nexus in an interregional network connecting Africa, Arabia, and Asia.',
      si: 'අප්‍රිකාව, අරාබිය සහ ආසියාව යා කළ අන්තර් කලාපීය ජාලයක වැදගත් මධ්‍යස්ථානයක් ලෙස මාපුංගුබ්වේ ක්‍රියා කළේය.'
    },
    isPriority: true
  },

  // Paragraph E (16 words)
  {
    para: 'Paragraph E',
    term: 'Discoveries',
    pos: 'noun',
    ipa: '/dɪˈskʌvəriz/',
    simple: 'Things found for the first time',
    synonym: 'Findings',
    siDef: 'සොයාගැනීම් / අනාවරණයන්',
    band: 'Band 7.0+',
    colloc: [
      ['Archaeological discoveries', 'පුරාවිද්‍යාත්මක සොයාගැනීම්'],
      ['Remarkable discoveries', 'විශිෂ්ට සොයාගැනීම්'],
      ['Recent discoveries', 'මෑතකාලීන සොයාගැනීම්']
    ],
    example: {
      en: 'Gold artefacts from early discoveries are now preserved in the national museum in Pretoria.',
      si: 'මුල් සොයාගැනීම්වලින් හමුවූ රන් කෞතුක වස්තු දැන් ප්‍රිටෝරියා හි ජාතික කෞතුකාගාරයේ සුරක්ෂිතව තබා ඇත.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph E',
    term: 'Pottery',
    pos: 'noun',
    ipa: '/ˈpɒtəri/',
    simple: 'Objects made from clay and hardened by heat',
    synonym: 'Ceramics',
    siDef: 'මැටි භාණ්ඩ / කුඹල් කර්මාන්තය',
    band: 'Band 7.0+',
    colloc: [
      ['Earthenware pottery', 'මැටි බඳුන්'],
      ['Pottery shards', 'මැටි බඳුන් කැබලි'],
      ['Fine pottery', 'සියුම් මැටි නිර්මාණ']
    ],
    example: {
      en: 'Distinctive pottery styles help archaeologists trace cultural diffusion across the region.',
      si: 'සුවිශේෂී මැටි භාණ්ඩ මෝස්තර මගින් කලාපය පුරා සංස්කෘතික ව්‍යාප්තිය සොයා ගැනීමට පුරාවිද්‍යාඥයන්ට උපකාරී වේ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph E',
    term: 'On a scale',
    pos: 'phrase',
    ipa: '/ɒn ə skeɪl/',
    simple: 'At a particular level or amount',
    synonym: 'To an extent',
    siDef: 'යම් පරිමාණයකින් / ප්‍රමාණයකින්',
    band: 'Band 7.5+',
    colloc: [
      ['On an unprecedented scale', 'පෙර නොවූ විරූ පරිමාණයකින්'],
      ['On a massive scale', 'දැවැන්ත පරිමාණයකින්'],
      ['On a local scale', 'ප්‍රාදේශීය මට්ටමින්']
    ],
    example: {
      en: 'Craft production occurred on a scale never previously witnessed in pre-colonial southern Africa.',
      si: 'යටත්විජිත යුගයට පෙර දකුණු අප්‍රිකාවේ මීට පෙර කිසිදා නොදුටු පරිමාණයකින් ශිල්පීය භාණ්ඩ නිෂ්පාදනය සිදු විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph E',
    term: 'Professional',
    pos: 'adjective',
    ipa: '/prəˈfeʃənl/',
    simple: 'Doing an activity as a skilled occupation',
    synonym: 'Specialist',
    siDef: 'වෘත්තීය මට්ටමේ / විශේෂඥ',
    band: 'Band 7.0+',
    colloc: [
      ['Professional craftsmen', 'වෘත්තීය ශිල්පීන්'],
      ['Professional standards', 'වෘත්තීය ප්‍රමිතීන්'],
      ['Highly professional', 'ඉතා උසස් වෘත්තීය මට්ටමේ']
    ],
    example: {
      en: 'The uniform thickness of ceramic vessels suggests the work of full-time professional artisans.',
      si: 'මැටි බඳුන්වල ඒකාකාරී ඝනකම මගින් පෙනී යන්නේ ඒවා පූර්ණකාලීන වෘත්තීය ශිල්පීන්ගේ නිර්මාණ බවයි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph E',
    term: 'Indicator',
    pos: 'noun',
    ipa: '/ˈɪndɪkeɪtə(r)/',
    simple: 'Something that shows a condition',
    synonym: 'Sign',
    siDef: 'දර්ශකය / සලකුණ / සාධකය',
    band: 'Band 7.5+',
    colloc: [
      ['Reliable indicator', 'විශ්වාසදායක දර්ශකය'],
      ['Indicator of prosperity', 'සමෘද්ධියේ සලකුණක්'],
      ['Economic indicator', 'ආර්ථික දර්ශකය']
    ],
    example: {
      en: 'The abundance of delicate spindle whorls serves as a clear indicator of flourishing cloth production.',
      si: 'සියුම් කටින කූරු බහුලව හමුවීම රෙදි පිළි නිෂ්පාදනය සාර්ථකව පැවති බවට පැහැදිලි දර්ශකයකි.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph E',
    term: 'Prosperity',
    pos: 'noun',
    ipa: '/prɒˈsperəti/',
    simple: 'State of being successful and wealthy',
    synonym: 'Wealth',
    siDef: 'සමෘද්ධිය / ධනවත්භාවය',
    band: 'Band 8.0+',
    colloc: [
      ['Economic prosperity', 'ආර්ථික සමෘද්ධිය'],
      ['Era of prosperity', 'සමෘද්ධිමත් යුගය'],
      ['General prosperity', 'පොදු සෞභාග්‍යය']
    ],
    example: {
      en: 'Mapungubwe reached the pinnacle of its prosperity between 1220 and 1250 AD.',
      si: 'මාපුංගුබ්වේ රාජධානිය ක්‍රි.ව. 1220 සහ 1250 අතර කාලය තුළ සිය සමෘද්ධියේ උච්චතම ස්ථානයට ළඟා විය.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph E',
    term: 'Spherical',
    pos: 'adjective',
    ipa: '/ˈsferɪkl/',
    simple: 'Shaped like a ball',
    synonym: 'Round',
    siDef: 'ගෝලාකාර / බෝලයක හැඩය ඇති',
    band: 'Band 7.5+',
    colloc: [
      ['Spherical pots', 'ගෝලාකාර මැටි බඳුන්'],
      ['Spherical beads', 'ගෝලාකාර පබළු'],
      ['Roughly spherical', 'දළ වශයෙන් ගෝලාකාර']
    ],
    example: {
      en: 'Potters produced spherical jars decorated with intricate incised geometric patterns.',
      si: 'කුඹල්කරුවන් සියුම් ලෙස කැපූ ජ්‍යාමිතික රටාවලින් සරසන ලද ගෝලාකාර භාජන නිපදවූහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph E',
    term: 'Vessels',
    pos: 'noun',
    ipa: '/ˈveslz/',
    simple: 'Containers used to hold things',
    synonym: 'Containers',
    siDef: 'බඳුන් / බහාලුම්',
    band: 'Band 7.5+',
    colloc: [
      ['Clay vessels', 'මැටි බඳුන්'],
      ['Drinking vessels', 'පානීය බඳුන්'],
      ['Storage vessels', 'ගබඩා බඳුන්']
    ],
    example: {
      en: 'Large ceramic vessels were sunken into house floors to store fermenting sorghum beer.',
      si: 'පැසවන ලද බීර ගබඩා කිරීම සඳහා විශාල මැටි බඳුන් නිවාසවල පොළොව තුළ ගිල්වා තබන ලදී.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph E',
    term: 'Beakers',
    pos: 'noun',
    ipa: '/ˈbiːkəz/',
    simple: 'Drinking containers or cups',
    synonym: 'Cups',
    siDef: 'පානීය කෝප්ප / බීකර්',
    band: 'Band 7.0+',
    colloc: [
      ['Ceramic beakers', 'මැටි කෝප්ප'],
      ['Tall beakers', 'උස බීකර්'],
      ['Drinking beakers', 'බීම සඳහා ගන්නා කෝප්ප']
    ],
    example: {
      en: 'Finely burnished beakers were reserved exclusively for royal feasting ceremonies.',
      si: 'මනාව ඔප දැමූ බීකර් කෝප්ප රාජකීය භෝජන සංග්‍රහ සඳහා පමණක් වෙන් කර තිබුණි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph E',
    term: 'Decorative',
    pos: 'adjective',
    ipa: '/ˈdekərətɪv/',
    simple: 'Used to make something attractive',
    synonym: 'Ornamental',
    siDef: 'සැරසිලිමය / විසිතුරු',
    band: 'Band 7.0+',
    colloc: [
      ['Decorative motifs', 'සැරසිලි මෝස්තර'],
      ['Decorative beads', 'විසිතුරු පබළු'],
      ['Purely decorative', 'සැරසිලි සඳහා පමණක් වූ']
    ],
    example: {
      en: 'The vessels displayed decorative herringbone incisions near the rim.',
      si: 'මෙම බඳුන්වල කට ආසන්නයේ විසිතුරු කැටයම් රටා දක්නට ලැබුණි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph E',
    term: 'Ceramic',
    pos: 'adjective',
    ipa: '/səˈræmɪk/',
    simple: 'Made from clay hardened by heat',
    synonym: 'Earthenware',
    siDef: 'සෙරමික් / පිඟන් මැටි හෝ පුලුස්සන ලද මැටි',
    band: 'Band 7.0+',
    colloc: [
      ['Ceramic figurines', 'මැටි ප්‍රතිමා'],
      ['Ceramic fragments', 'පිඟන් මැටි කැබලි'],
      ['Ceramic technology', 'මැටි භාණ්ඩ තාක්ෂණය']
    ],
    example: {
      en: 'Ceramic technology at Mapungubwe was remarkably sophisticated, using controlled open firing.',
      si: 'මාපුංගුබ්වේ මැටි තාක්ෂණය උෂ්ණත්වය පාලනය කළ පිළිස්සුම් ක්‍රම භාවිතා කරමින් ඉතා දියුණු මට්ටමක පැවතුණි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph E',
    term: 'Figurines',
    pos: 'noun',
    ipa: '/ˈfɪɡəriːnz/',
    simple: 'Small models of people or animals',
    synonym: 'Statuettes',
    siDef: 'කුඩා පිළිම / ප්‍රතිමා',
    band: 'Band 7.5+',
    colloc: [
      ['Clay figurines', 'මැටි පිළිම'],
      ['Animal figurines', 'සත්ව රූප'],
      ['Stylised figurines', 'කලාත්මක ප්‍රතිමා']
    ],
    example: {
      en: 'Archaeologists unearthed stylised clay figurines representing cattle, wild animals, and human forms.',
      si: 'පුරාවිද්‍යාඥයන් විසින් ගවයන්, වන සතුන් සහ මිනිස් රූ නිරූපණය කරන කලාත්මක මැටි පිළිම සොයා ගන්නා ලදී.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph E',
    term: 'Stylised',
    pos: 'adjective',
    ipa: '/ˈstaɪlaɪzd/',
    simple: 'Represented in a simplified artistic way',
    synonym: 'Artistic',
    siDef: 'කලාත්මක ලෙස නිරූපිත / සම්මත හැඩතල ගැන්වූ',
    band: 'Band 8.0+',
    colloc: [
      ['Stylised representations', 'කලාත්මක නිරූපණයන්'],
      ['Highly stylised', 'ඉතා උසස් කලාත්මක ශෛලියකින් යුත්'],
      ['Stylised forms', 'කලාත්මක හැඩතල']
    ],
    example: {
      en: 'The human figurines feature stylised elongated heads and incised torso markings.',
      si: 'මිනිස් ප්‍රතිමාවල කලාත්මකව දිගටි කළ හිස් සහ කඳෙහි කැටයම් කළ සලකුණු දක්නට ලැබේ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph E',
    term: 'Elongated',
    pos: 'adjective',
    ipa: '/ˈiːlɒŋɡeɪtɪd/',
    simple: 'Longer than normal',
    synonym: 'Extended',
    siDef: 'දිගටි වූ / දිගු කරන ලද',
    band: 'Band 7.5+',
    colloc: [
      ['Elongated limbs', 'දිගටි අත්පා'],
      ['Elongated torso', 'දිගටි කඳ'],
      ['Elongated neck', 'දිගු බෙල්ල']
    ],
    example: {
      en: 'The famous golden rhinoceros features an elongated body wrapped around a carved wooden core.',
      si: 'සුප්‍රසිද්ධ රන් කාണ്ടാමෘග ප්‍රතිමාව කැටයම් කළ ලී අච්චුවක් වටා ඔතා ඇති දිගටි ශරීරයකින් සමන්විත වේ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph E',
    term: 'Ancestors',
    pos: 'noun',
    ipa: '/ˈænsestəz/',
    simple: 'Family members from earlier generations',
    synonym: 'Forebears',
    siDef: 'මුතුන්මිත්තන් / පූර්වජයන්',
    band: 'Band 7.0+',
    colloc: [
      ['Veneration of ancestors', 'මුතුන්මිත්තන් පිදීම'],
      ['Spirits of ancestors', 'මුතුන්මිත්තන්ගේ ආත්ම'],
      ['Royal ancestors', 'රාජකීය මුතුන්මිත්තන්']
    ],
    example: {
      en: 'Hilltop rituals were primarily aimed at communicating with deceased royal ancestors for rain and fertility.',
      si: 'කඳු මුදුනේ පැවැත්වූ චාරිත්‍රවල ප්‍රධාන අරමුණ වූයේ වැසි සහ සාරවත් බව පතා මියගිය රාජකීය මුතුන්මිත්තන් සමඟ සන්නිවේදනය කිරීමයි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph E',
    term: 'Precise',
    pos: 'adjective',
    ipa: '/prɪˈsaɪs/',
    simple: 'Exact and accurate',
    synonym: 'Specific',
    siDef: 'නිරවද්‍ය / නිශ්චිත / පැහැදිලි',
    band: 'Band 7.5+',
    colloc: [
      ['Precise function', 'නිශ්චිත කාර්යය'],
      ['Precise measurements', 'නිවැරදි මිනුම්'],
      ['Precise chronology', 'නිශ්චිත කාලක්‍රමය']
    ],
    example: {
      en: 'While the precise function of some clay statuettes remains debated, their symbolic value is undeniable.',
      si: 'සමහර මැටි ප්‍රතිමාවල නිශ්චිත කාර්යභාරය පිළිබඳ විවාද පවතින නමුත් ඒවායේ සංකේතාත්මක වටිනාකම ප්‍රතික්ෂේප කළ නොහැක.'
    },
    isPriority: false
  },

  // Paragraph F (12 words)
  {
    para: 'Paragraph F',
    term: 'Artefacts',
    pos: 'noun',
    ipa: '/ˈɑːtɪfækts/',
    simple: 'Objects made by humans, especially historically',
    synonym: 'Historical objects',
    siDef: 'කෞතුක වස්තු / මානව නිර්මාණ',
    band: 'Band 7.5+',
    colloc: [
      ['Gold artefacts', 'රන් කෞතුක භාණ්ඩ'],
      ['Preserved artefacts', 'සුරැකි කෞතුක වස්තු'],
      ['Uncover artefacts', 'කෞතුක වස්තු සොයා ගැනීම']
    ],
    example: {
      en: 'Exquisite gold foil artefacts confirm that Mapungubwe was a pioneer in southern African metallurgy.',
      si: 'විශිෂ්ට රන් තහඩු කෞතුක භාණ්ඩ මගින් තහවුරු වන්නේ මාපුංගුබ්වේ දකුණු අප්‍රිකානු ලෝහ කර්මාන්තයේ පුරෝගාමියෙකු වූ බවයි.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph F',
    term: 'Crafting',
    pos: 'verb',
    ipa: '/ˈkrɑːftɪŋ/',
    simple: 'Making something skilfully',
    synonym: 'Creating',
    siDef: 'දක්ෂ ලෙස නිර්මාණය කිරීම',
    band: 'Band 7.5+',
    colloc: [
      ['Crafting gold foil', 'රන් තහඩු නිර්මාණය'],
      ['Skilful crafting', 'දක්ෂ නිර්මාණකරණය'],
      ['Crafting fine ornaments', 'සියුම් ආභරණ තැනීම']
    ],
    example: {
      en: 'Artisans spent weeks crafting paper-thin sheets of gold foil using polished hammer stones.',
      si: 'ඔප දැමූ ගල් මිටි භාවිතයෙන් කඩදාසි තරම් තුනී රන් තහඩු සෑදීමට ශිල්පීන් සති ගණනාවක් ගත කළහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph F',
    term: 'Rectangular',
    pos: 'adjective',
    ipa: '/rekˈtæŋɡjələ(r)/',
    simple: 'Having four sides and four right angles',
    synonym: 'Oblong',
    siDef: 'සෘජුකෝණාස්‍රාකාර',
    band: 'Band 7.0+',
    colloc: [
      ['Rectangular sheets', 'සෘජුකෝණාස්‍රාකාර තහඩු'],
      ['Rectangular building', 'සෘජුකෝණාස්‍රාකාර ගොඩනැගිල්ල'],
      ['Rectangular plaques', 'සෘජුකෝණාස්‍රාකාර පලක']
    ],
    example: {
      en: 'Gold foil was cut into rectangular sheets before being attached to carved wooden statuettes.',
      si: 'කැටයම් කළ ලී ප්‍රතිමාවලට සවි කිරීමට පෙර රන් තහඩු සෘජුකෝණාස්‍රාකාර කොටස්වලට කපා ගන්නා ලදී.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph F',
    term: 'Geometrical',
    pos: 'adjective',
    ipa: '/ˌdʒiːəˈmetrɪkl/',
    simple: 'Related to shapes and measurements',
    synonym: 'Geometric',
    siDef: 'ජ්‍යාමිතික / ජ්‍යාමිතික හැඩතල සහිත',
    band: 'Band 7.5+',
    colloc: [
      ['Geometrical patterns', 'ජ්‍යාමිතික රටා'],
      ['Geometrical designs', 'ජ්‍යාමිතික මෝස්තර'],
      ['Geometrical precision', 'ජ්‍යාමිතික නිරවද්‍යතාව']
    ],
    example: {
      en: 'Intricate geometrical bands decorated the edges of gold headbands and armlets.',
      si: 'රන් හිස් පටි සහ බාහු පළඳනාවල දාර සියුම් ජ්‍යාමිතික රටාවලින් සරසා තිබුණි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph F',
    term: 'Carving',
    pos: 'noun',
    ipa: '/ˈkɑːvɪŋ/',
    simple: 'Cutting shapes or patterns into material',
    synonym: 'Engraving',
    siDef: 'කැටයම් කිරීම / කැටයම් කලාව',
    band: 'Band 7.0+',
    colloc: [
      ['Wood carving', 'ලී කැටයම්'],
      ['Bone carving', 'අස්ථි කැටයම්'],
      ['Fine carving', 'සියුම් කැටයම්']
    ],
    example: {
      en: 'Skilled wood carving served as the foundation over which gold leaf was delicately hammered.',
      si: 'සියුම් රන් පත්‍ර තලා සවි කිරීම සඳහා පදනම වූයේ දක්ෂ ලී කැටයම් නිර්මාණයයි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph F',
    term: 'Tacks',
    pos: 'noun',
    ipa: '/tæks/',
    simple: 'Small nails used to attach materials',
    synonym: 'Pins',
    siDef: 'කුඩා ඇණ / තහඩු සවි කරන කුඩා කූරු',
    band: 'Band 7.5+',
    colloc: [
      ['Gold tacks', 'කුඩා රන් ඇණ'],
      ['Fastened with tacks', 'ඇණ මගින් සවි කළ'],
      ['Tiny tacks', 'ඉතා කුඩා ඇණ']
    ],
    example: {
      en: 'Goldsmiths secured the gold foil onto wooden shapes using tiny hand-forged gold tacks.',
      si: 'රන්කරුවන් අතින් තැනූ කුඩා රන් ඇණ යොදා ගනිමින් රන් තහඩු ලී හැඩතල මත සවි කළහ.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph F',
    term: 'Sceptre',
    pos: 'noun',
    ipa: '/ˈseptə(r)/',
    simple: 'Decorated staff representing royal authority',
    synonym: 'Royal staff',
    siDef: 'රාජකීය සෙංකෝලය / රාජ යෂ්ටිය',
    band: 'Band 8.5+',
    colloc: [
      ['Golden sceptre', 'රන් සෙංකෝලය'],
      ['Symbolic sceptre', 'සංකේතාත්මක රාජ යෂ්ටිය'],
      ['Hold the sceptre', 'සෙංකෝලය දැරීම']
    ],
    example: {
      en: 'The recovered golden sceptre symbolized the king’s divine right to rule and mediate with spirits.',
      si: 'සොයා ගන්නා ලද රන් සෙංකෝලයෙන් සංකේතවත් වූයේ රජුගේ පාලන බලය සහ ආධ්‍යාත්මික සබඳතාවයි.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph F',
    term: 'Gold-working',
    pos: 'noun',
    ipa: '/ɡəʊld ˈwɜːkɪŋ/',
    simple: 'Making objects from gold',
    synonym: 'Goldsmithing',
    siDef: 'රන් කර්මාන්තය / රත්‍රන් වැඩ',
    band: 'Band 7.5+',
    colloc: [
      ['Ancient gold-working', 'පැරණි රන් කර්මාන්තය'],
      ['Mastery of gold-working', 'රන් වැඩෙහි ප්‍රවීණත්වය'],
      ['Gold-working traditions', 'රන් කර්මාන්ත සම්ප්‍රදායන්']
    ],
    example: {
      en: 'The technological mastery of gold-working reached its apex during the 13th century in the valley.',
      si: 'රන් වැඩ පිළිබඳ තාක්ෂණික ප්‍රවීණත්වය 13 වන සියවසේදී මෙම නිම්නය තුළ උච්චතම අවස්ථාවට ළඟා විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph F',
    term: 'Hammered',
    pos: 'verb',
    ipa: '/ˈhæməd/',
    simple: 'Shaped by hitting with a hammer',
    synonym: 'Beaten',
    siDef: 'මිටියෙන් තලා හැඩගැස්වූ',
    band: 'Band 7.0+',
    colloc: [
      ['Hammered gold foil', 'තැලූ රන් තහඩුව'],
      ['Hammered into sheets', 'තහඩු බවට තැලූ'],
      ['Delicately hammered', 'සියුම් ලෙස තලා හැඩගැස්වූ']
    ],
    example: {
      en: 'Gold nuggets were heated and hammered into foil less than a millimetre in thickness.',
      si: 'රන් කැටි රත් කර මිලිමීටරයකට වඩා අඩු ඝනකමක් ඇති තහඩු බවට මිටියෙන් තළන ලදී.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph F',
    term: 'Royal burial site',
    pos: 'phrase',
    ipa: '/ˈrɔɪəl ˈberiəl saɪt/',
    simple: 'Place where kings or queens were buried',
    synonym: 'Royal tomb',
    siDef: 'රාජකීය සුසාන භූමිය',
    band: 'Band 8.0+',
    colloc: [
      ['Ancient royal burial site', 'පුරාණ රාජකීය සුසාන භූමිය'],
      ['Excavate a royal burial site', 'රාජකීය සුසානයක් කැණීම'],
      ['Sacred royal burial site', 'පූජනීය රාජකීය සුසානය']
    ],
    example: {
      en: 'Mapungubwe Hill served as a sacred royal burial site for several generations of revered leaders.',
      si: 'මාපුංගුබ්වේ කන්ද පරම්පරා කිහිපයක ගෞරවනීය නායකයන් වෙනුවෙන් පූජනීය රාජකීය සුසාන භූමියක් විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph F',
    term: 'Intrinsic value',
    pos: 'phrase',
    ipa: '/ɪnˈtrɪnzɪk ˈvæljuː/',
    simple: 'Value something has in itself',
    synonym: 'Inherent worth',
    siDef: 'සහජ / ආවේණික වටිනාකම',
    band: 'Band 8.5+',
    colloc: [
      ['Possess intrinsic value', 'ආවේණික වටිනාකමක් තිබීම'],
      ['Recognise intrinsic value', 'සහජ වටිනාකම හඳුනාගැනීම'],
      ['Intrinsic value of gold', 'රත්‍රන් සතු සහජ වටිනාකම']
    ],
    example: {
      en: 'While foreign traders valued gold for its commercial currency, locals prized its intrinsic symbolic luster.',
      si: 'විදේශිකයන් රත්‍රන් වාණිජ්‍ය මුදලක් ලෙස අගය කළ අතර, ප්‍රදේශවාසීන් එහි සංකේතාත්මක දීප්තිය අගය කළහ.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph F',
    term: 'Currency',
    pos: 'noun',
    ipa: '/ˈkʌrənsi/',
    simple: 'Money used for exchange',
    synonym: 'Money',
    siDef: 'විනිමය මාධ්‍යය / මුදල්',
    band: 'Band 7.0+',
    colloc: [
      ['Form of currency', 'මුදල් ආකාරයක්'],
      ['Standard currency', 'සම්මත මුදල්'],
      ['Foreign currency', 'විදේශ විනිමය']
    ],
    example: {
      en: 'Imported glass beads functioned not merely as ornaments but as an accepted local currency.',
      si: 'ආනයනික වීදුරු පබළු සැරසිලි ලෙස පමණක් නොව පිළිගත් දේශීය මුදල් ඒකකයක් ලෙසද භාවිතා විය.'
    },
    isPriority: false
  },

  // Paragraph G (10 words)
  {
    para: 'Paragraph G',
    term: 'Kingdom',
    pos: 'noun',
    ipa: '/ˈkɪŋdəm/',
    simple: 'Country ruled by a king or queen',
    synonym: 'Monarchy',
    siDef: 'රාජධානිය / රජෙකු විසින් පාලනය කළ රට',
    band: 'Band 7.0+',
    colloc: [
      ['Ancient kingdom', 'පුරාණ රාජධානිය'],
      ['Flourishing kingdom', 'සමෘද්ධිමත් රාජධානිය'],
      ['Decline of the kingdom', 'රාජධානියේ බිඳවැටීම']
    ],
    example: {
      en: 'The Kingdom of Mapungubwe was the direct political precursor to the civilization at Great Zimbabwe.',
      si: 'මාපුංගුබ්වේ රාජධානිය මහා සිම්බාබ්වේ ශිෂ්ටාචාරයේ සෘජු දේශපාලන පූර්වගාමියා විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph G',
    term: 'In decline',
    pos: 'phrase',
    ipa: '/ɪn dɪˈklaɪn/',
    simple: 'Becoming weaker or less successful',
    synonym: 'Deteriorating',
    siDef: 'පිරිහෙමින් පවතින / පරිහානියට පත්වන',
    band: 'Band 8.0+',
    colloc: [
      ['The kingdom was in decline', 'රාජධානිය පිරිහෙමින් පැවතුණි'],
      ['Economic power in decline', 'ආර්ථික බලය පිරිහීම'],
      ['Trade in decline', 'වෙළඳාම පසුබෑම']
    ],
    example: {
      en: 'By the late thirteenth century, Mapungubwe was in decline due to environmental and geopolitical shifts.',
      si: 'දහතුන්වන සියවසේ අගභාගය වන විට පාරිසරික හා භූ-දේශපාලනික වෙනස්කම් හේතුවෙන් මාපුංගුබ්වේ පිරිහෙමින් පැවතුණි.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph G',
    term: 'Overpopulation',
    pos: 'noun',
    ipa: '/ˌəʊvəˌpɒpjuˈleɪʃn/',
    simple: 'Too many people for available resources',
    synonym: 'Excessive population',
    siDef: 'අධික ජනගහනය / සම්පත් ඉක්මවා ගිය ජනගහනය',
    band: 'Band 7.5+',
    colloc: [
      ['Severe overpopulation', 'දැඩි අධික ජනගහනය'],
      ['Pressure of overpopulation', 'අධික ජනගහනයේ පීඩනය'],
      ['Lead to overpopulation', 'අධික ජනගහනයකට මග පෑදීම']
    ],
    example: {
      en: 'Overpopulation in the narrow valley strained arable land and depleted localized timber supplies.',
      si: 'පටු නිම්නයේ ඇති වූ අධික ජනගහනය නිසා වගාබිම් සීමා වී දේශීය දැව සම්පත ක්ෂය වී ගියේය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph G',
    term: 'Stress on resources',
    pos: 'phrase',
    ipa: '/stres ɒn rɪˈsɔːsɪz/',
    simple: 'Pressure on available supplies',
    synonym: 'Resource strain',
    siDef: 'පවතින සම්පත් මත අධික පීඩනයක් ඇතිවීම',
    band: 'Band 8.0+',
    colloc: [
      ['Placed stress on resources', 'සම්පත් මත දැඩි පීඩනයක් එල්ල කළේය'],
      ['Severe stress on resources', 'සම්පත් හිඟවීමේ පීඩනය'],
      ['Relieve stress on resources', 'සම්පත් පීඩනය ලිහිල් කිරීම']
    ],
    example: {
      en: 'Rapid population expansion placed severe stress on resources, especially grazing lands and water reserves.',
      si: 'වේගවත් ජනගහන වර්ධනය පවතින සම්පත්, විශේෂයෙන් තණබිම් සහ ජල සංචිත මත දැඩි පීඩනයක් ඇති කළේය.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph G',
    term: 'Local resources',
    pos: 'phrase',
    ipa: '/ˈləʊkl rɪˈsɔːsɪz/',
    simple: 'Materials or supplies available nearby',
    synonym: 'Regional supplies',
    siDef: 'ප්‍රාදේශීය සම්පත් / අවටින් ලැබෙන ද්‍රව්‍ය',
    band: 'Band 7.0+',
    colloc: [
      ['Deplete local resources', 'ප්‍රාදේශීය සම්පත් ක්ෂය කිරීම'],
      ['Rely on local resources', 'දේශීය සම්පත් මත යැපීම'],
      ['Abundant local resources', 'සුලබ ප්‍රාදේශීය සම්පත්']
    ],
    example: {
      en: 'Centuries of intensive agriculture eventually exhausted local resources throughout the river basin.',
      si: 'සියවස් ගණනාවක දැඩි කෘෂිකර්මාන්තය හේතුවෙන් ගංගා නිම්නයේ ප්‍රාදේශීය සම්පත් අවසානයේ සිඳී ගියේය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph G',
    term: 'Crisis point',
    pos: 'noun',
    ipa: '/ˈkraɪsɪs pɔɪnt/',
    simple: 'Stage when a problem becomes extremely serious',
    synonym: 'Critical stage',
    siDef: 'අර්බුදකාරී තීරණාත්මක අවස්ථාව',
    band: 'Band 8.0+',
    colloc: [
      ['Reach a crisis point', 'අර්බුදකාරී තත්ත්වයකට පත්වීම'],
      ['Environmental crisis point', 'පාරිසරික අර්බුදකාරී අවස්ථාව'],
      ['At the crisis point', 'අර්බුදයේ උච්චතම අවස්ථාවේදී']
    ],
    example: {
      en: 'The community reached a crisis point when consecutive monsoons failed to replenish local aquifers.',
      si: 'අඛණ්ඩව වැසි නොලැබී භූගත ජල සංචිත සිඳී යාමත් සමඟ ප්‍රජාව දැඩි අර්බුදකාරී තත්ත්වයකට මුහුණ දුන්නේය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph G',
    term: 'Droughts',
    pos: 'noun',
    ipa: '/draʊts/',
    simple: 'Long periods without enough rainfall',
    synonym: 'Dry spells',
    siDef: 'නියඟයන් / වියළි කාලගුණික තත්ත්වයන්',
    band: 'Band 7.5+',
    colloc: [
      ['Prolonged droughts', 'දීර්ඝ කාලීන නියඟයන්'],
      ['Severe droughts', 'දැඩි නියඟයන්'],
      ['Recurring droughts', 'නැවත නැවත ඇතිවන නියඟ']
    ],
    example: {
      en: 'A succession of devastating droughts made large-scale sorghum cultivation unviable.',
      si: 'අඛණ්ඩව ඇති වූ දැඩි නියඟ හේතුවෙන් මහා පරිමාණ ධාන්‍ය වගාව තවදුරටත් කරගෙන යාමට නොහැකි විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph G',
    term: 'Trade routes',
    pos: 'phrase',
    ipa: '/treɪd ruːts/',
    simple: 'Paths used for transporting goods',
    synonym: 'Commercial routes',
    siDef: 'වෙළඳ මාර්ග',
    band: 'Band 7.5+',
    colloc: [
      ['Maritime trade routes', 'මුහුදු වෙළඳ මාර්ග'],
      ['Ancient trade routes', 'පැරණි වෙළඳ මාර්ග'],
      ['Trade routes shifted', 'වෙළඳ මාර්ග වෙනස් විය']
    ],
    example: {
      en: 'As gold deposits were exhausted locally, primary trade routes shifted northward toward the Zimbabwean plateau.',
      si: 'දේශීයව රන් නිධි සිඳී යාමත් සමඟ ප්‍රධාන වෙළඳ මාර්ග උතුරු දෙසින් පිහිටි සිම්බාබ්වේ සානුව වෙත මාරු විය.'
    },
    isPriority: false
  },
  {
    para: 'Paragraph G',
    term: 'Shifted',
    pos: 'verb',
    ipa: '/ˈʃɪftɪd/',
    simple: 'Moved or changed position',
    synonym: 'Relocated',
    siDef: 'වෙනස් විය / ස්ථානය මාරු විය',
    band: 'Band 7.5+',
    colloc: [
      ['Shifted northwards', 'උතුරු දෙසට මාරු විය'],
      ['Power shifted', 'බලය මාරු විය'],
      ['Focus shifted', 'අවධානය යොමු වූ ස්ථානය වෙනස් විය']
    ],
    example: {
      en: 'Economic power shifted away from the Limpopo Valley to emerging kingdoms with better rainfall.',
      si: 'ආර්ථික බලය ලිම්පෝපෝ නිම්නයෙන් ඉවත් වී වඩා හොඳ වර්ෂාපතනයක් සහිත නව රාජධානි වෙත මාරු විය.'
    },
    isPriority: true
  },
  {
    para: 'Paragraph G',
    term: 'Prospered',
    pos: 'verb',
    ipa: '/ˈprɒspəd/',
    simple: 'Became successful or wealthy',
    synonym: 'Flourished',
    siDef: 'සමෘද්ධිමත් විය / දියුණු විය',
    band: 'Band 8.0+',
    colloc: [
      ['Prospered greatly', 'ඉමහත් ලෙස දියුණු විය'],
      ['The kingdom prospered', 'රාජධානිය සමෘද්ධිමත් විය'],
      ['Prospered through trade', 'වෙළඳාමෙන් දියුණුවට පත්විය']
    ],
    example: {
      en: 'Great Zimbabwe subsequently prospered as it took over the gold monopoly previously held by Mapungubwe.',
      si: 'මීට පෙර මාපුංගුබ්වේ සතුව තිබූ රන් ඒකාධිකාරය හිමිකර ගැනීමත් සමඟ මහා සිම්බාබ්වේ රාජධානිය සමෘද්ධිමත් විය.'
    },
    isPriority: true
  }
];

console.log(`Loaded ${RAW_WORDS.length} raw words.`);

// Generate the TypeScript file content
const output = `import { Lesson, Word } from '../types';

export const MAPUNGUBWE_WORDS: Word[] = [
${RAW_WORDS.map((w, idx) => {
  const id = `l10-w${idx + 1}`;
  const notesText = `[${w.para}] Simple meaning: "${w.simple}". IELTS Synonym: "${w.synonym}". Essential academic vocabulary for describing history, archaeology, and civilisations in IELTS Reading and Writing Task 2.${w.isPriority ? ' ★ 25 High-Priority Target Term.' : ''}`;
  const siNotesText = `[${w.para}] සරල අර්ථය: "${w.simple}". සමාන පදය: "${w.synonym}". ඉතිහාසය, පුරාවිද්‍යාව සහ පැරණි ශිෂ්ටාචාර පිළිබඳ IELTS Reading සහ Writing Task 2 හි ලකුණු වැඩිකර ගැනීමට අත්‍යවශ්‍ය වචනයකි.`;

  const collocationsCode = w.colloc.map(([text, sinhala]) =>
    `      { text: ${JSON.stringify(text)}, sinhala: ${JSON.stringify(sinhala)} }`
  ).join(',\n');

  const practicePrompt = `Use "${w.term}" in a sentence explaining the historical significance or archaeological findings of an ancient civilization.`;

  return `  {
    id: ${JSON.stringify(id)},
    term: ${JSON.stringify(w.term)},
    partOfSpeech: ${JSON.stringify(w.pos)},
    ipa: ${JSON.stringify(w.ipa)},
    definition: ${JSON.stringify(`${w.simple}. (IELTS Synonym: ${w.synonym})`)},
    sinhalaDefinition: ${JSON.stringify(w.siDef)},
    notes: ${JSON.stringify(notesText)},
    sinhalaNotes: ${JSON.stringify(siNotesText)},
    collocations: [
${collocationsCode}
    ],
    exampleSentences: [
      {
        en: ${JSON.stringify(w.example.en)},
        si: ${JSON.stringify(w.example.si)}
      }
    ],
    practicePrompt: ${JSON.stringify(practicePrompt)},
    bandLevel: ${JSON.stringify(w.band)}
  }`;
}).join(',\n')}
];

export const LESSON_10_MAPUNGUBWE: Lesson = {
  id: 'lesson-10',
  number: 10,
  title: 'History, Archaeology & Ancient Kingdoms (Mapungubwe)',
  subtitle: '100+ Vocabulary Words, Synonyms & Paraphrasing Strategies from the Mapungubwe Reading Passage',
  category: 'History & Archaeology',
  description: 'Master 100+ academic vocabulary items extracted paragraph-by-paragraph (Paragraphs A to G) from the Mapungubwe IELTS Reading passage. Features simple meanings, high-scoring IELTS synonyms, reading paraphrase keys, and the 25 highest-priority vocabulary words.',
  sinhalaDescription: 'Mapungubwe ඉතිහාස පාඨයෙන් උපුටා ගත් ඡේද A සිට G දක්වා වූ වචන 100+, සරල අර්ථ, සමාන පද, IELTS Reading ප්‍රශ්නෝත්තර උපක්‍රම සහ ප්‍රමුඛතම වචන 25 ඇතුළත් සම්පූර්ණ අධ්‍යයන පාඩම.',
  bannerImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
  words: MAPUNGUBWE_WORDS,
  speakingChallenge: {
    part: 'PART 3 PRACTICE',
    question: 'Why is it important for modern societies to preserve and study archaeological sites from ancient kingdoms like Mapungubwe?',
    minimumTargetWords: 4,
    sampleBand9Answer: 'Investigating ancient settlements like Mapungubwe provides profound insights into early economic prosperity, indigenous craftsmanship, and interregional trade networks that predated European contact. Preserving these artefacts and royal burial sites not only demystifies past socioeconomic hierarchies but also strengthens cultural heritage and national identity.',
    examinerTips: [
      'Use topic-specific archaeological terms: "artefacts", "interregional trade", "predated", "prosperity".',
      'Demonstrate lexical resource by using academic collocations such as "marked increase", "intrinsic value", and "stress on resources".',
      'Structure your response with clear cohesion: state your thesis, provide historical context, and evaluate cultural significance.'
    ]
  },
  writingChallenge: {
    task: 'IELTS Writing Task 2',
    prompt: 'Some people argue that governments spend too much money on preserving ancient archaeological ruins and historical artefacts instead of investing in urgent modern infrastructure. To what extent do you agree or disagree?',
    sampleBand8Paragraph: 'While allocating public funds to urgent contemporary infrastructure is crucial, completely disregarding archaeological heritage would be profoundly short-sighted. Historical sites such as ancient trading kingdoms possess immense intrinsic value; they foster tourism, stimulate economic revenue, and provide tangible historical evidence that enriches collective cultural understanding. Therefore, a balanced budgetary approach is paramount.'
  }
};
`;

const destPath = path.join(__dirname, '..', 'src', 'data', 'lesson10Mapungubwe.ts');
fs.writeFileSync(destPath, output, 'utf8');
console.log(`Successfully generated ${destPath} with ${RAW_WORDS.length} words!`);
