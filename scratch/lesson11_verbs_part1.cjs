// Comprehensive raw data for all 63 irregular verbs
module.exports = [
  // 1. Be
  {
    v1: "Be",
    v2: "Was / Were",
    v3: "Been",
    ipa: "/biː/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "වීම / සිටීම",
    colloc: [
      ["Be careful", "ප්‍රවේශම් වන්න"],
      ["Have been to", "ගොස් තිබීම"],
      ["Will be ready", "සූදානම් වනු ඇත"]
    ],
    examples: [
      { en: "I want to be a doctor one day.", si: "මට කවදා හෝ දිනක වෛද්‍යවරයකු වීමට අවශ්‍යයි." },
      { en: "She was at the library yesterday morning.", si: "ඇය ඊයේ උදෑසන පුස්තකාලයේ සිටියාය." },
      { en: "They have been friends for ten years.", si: "ඔවුන් වසර දහයක් තිස්සේ මිතුරන්ව සිට ඇත." },
      { en: "Regular exercise is important to be healthy.", si: "නිරෝගීව සිටීමට ක්‍රමවත් ව්‍යායාම වැදගත් වේ." }
    ],
    mistake: {
      incorrect: "I was be there yesterday.",
      correct: "I was there yesterday. / I have been there.",
      explanation: "Use V2 (was/were) for past simple, or have/has + V3 (been) for present perfect."
    }
  },
  // 2. Become
  {
    v1: "Become",
    v2: "Became",
    v3: "Become",
    ipa: "/bɪˈkʌm/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "බවට පත්වීම",
    colloc: [
      ["Become famous", "ප්‍රසිද්ධියට පත්වීම"],
      ["Become aware", "දැනුවත් වීම"],
      ["Become difficult", "දුෂ්කර වීම"]
    ],
    examples: [
      { en: "Caterpillars become beautiful butterflies.", si: "දළඹුවන් ලස්සන සමනලුන් බවට පත්වේ." },
      { en: "He became an engineer after years of study.", si: "වසර ගණනාවක අධ්‍යයනයෙන් පසු ඔහු ඉංජිනේරුවෙකු විය." },
      { en: "Online learning has become very popular globally.", si: "මාර්ගගත ඉගෙනීම ගෝලීයව ඉතා ජනප්‍රිය වී ඇත." },
      { en: "With practice, English will become easier for you.", si: "පුහුණුවීම් සමඟ ඔබට ඉංග්‍රීසි පහසු වනු ඇත." }
    ],
    mistake: {
      incorrect: "He has became very successful.",
      correct: "He has become very successful.",
      explanation: "With 'has/have', use the V3 form 'become', not V2 'became'."
    }
  },
  // 3. Begin
  {
    v1: "Begin",
    v2: "Began",
    v3: "Begun",
    ipa: "/bɪˈɡɪn/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "ආරම්භ කිරීම",
    colloc: [
      ["Begin classes", "පන්ති ආරම්භ කිරීම"],
      ["Begin to understand", "තේරුම් ගැනීමට පටන් ගැනීම"],
      ["Newly begun", "අලුතින් ආරම්භ කළ"]
    ],
    examples: [
      { en: "We begin school at eight every morning.", si: "අපි සෑම උදෑසනකම අටට පාසල ආරම්භ කරමු." },
      { en: "The concert began at seven o'clock last night.", si: "ඊයේ රාත්‍රී හතට සංගීත ප්‍රසංගය ආරම්භ විය." },
      { en: "The exam has already begun, so please be quiet.", si: "විභාගය දැනටමත් ආරම්භ වී ඇත, එබැවින් කරුණාකර නිහඬ වන්න." },
      { en: "It began to rain while we walked home.", si: "අපි ගෙදර ඇවිද යන අතරතුර වැස්ස ආරම්භ විය." }
    ],
    mistake: {
      incorrect: "They have began the project.",
      correct: "They have begun the project. / They began the project.",
      explanation: "Use V3 'begun' with have/has, and V2 'began' for simple past."
    }
  },
  // 4. Break
  {
    v1: "Break",
    v2: "Broke",
    v3: "Broken",
    ipa: "/breɪk/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "කැඩීම",
    colloc: [
      ["Break a rule", "නීතියක් කඩ කිරීම"],
      ["Break a record", "වාර්තාවක් බිඳ දැමීම"],
      ["Take a break", "විවේකයක් ගැනීම"]
    ],
    examples: [
      { en: "Be careful not to break the glass cup.", si: "වීදුරු කෝප්පය නොකැඩීමට ප්‍රවේශම් වන්න." },
      { en: "He broke his arm during the football match.", si: "පාපන්දු තරගය අතරතුර ඔහු තම අත කඩා ගත්තේය." },
      { en: "Someone has broken the window of the old house.", si: "කවුරුන් හෝ පැරණි නිවසේ ජනේලය කඩා දමා ඇත." },
      { en: "You should never break your promises to friends.", si: "මිතුරන්ට දුන් පොරොන්දු කිසි විටෙකත් නොකැඩිය යුතුය." }
    ],
    mistake: {
      incorrect: "The toy is broke.",
      correct: "The toy is broken. / He broke the toy.",
      explanation: "Use the V3 adjective 'broken' to describe the broken state."
    }
  },
  // 5. Bring
  {
    v1: "Bring",
    v2: "Brought",
    v3: "Brought",
    ipa: "/brɪŋ/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "ගෙන ඒම",
    colloc: [
      ["Bring an umbrella", "කුඩයක් ගෙන ඒම"],
      ["Bring good news", "හොඳ ආරංචියක් ගෙන ඒම"],
      ["Bring about change", "වෙනසක් ඇති කිරීම"]
    ],
    examples: [
      { en: "Please bring your textbook to class tomorrow.", si: "කරුණාකර හෙට පන්තියට ඔබේ පෙළපොත රැගෙන එන්න." },
      { en: "My sister brought delicious cake for my birthday.", si: "මගේ උපන්දිනයට මගේ සහෝදරිය රසවත් කේක් රැගෙන ආවාය." },
      { en: "The postman has brought a parcel for you.", si: "තැපැල්කරු ඔබට පාර්සලයක් ගෙනවිත් ඇත." },
      { en: "Technology has brought many improvements to education.", si: "තාක්ෂණය අධ්‍යාපනයට බොහෝ දියුණුවක් ගෙන දී ඇත." }
    ],
    mistake: {
      incorrect: "She brang her laptop to work.",
      correct: "She brought her laptop to work.",
      explanation: "'Bring' is irregular; both V2 and V3 are 'brought' (never 'brang')."
    }
  },
  // 6. Build
  {
    v1: "Build",
    v2: "Built",
    v3: "Built",
    ipa: "/bɪld/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "ඉදිකිරීම",
    colloc: [
      ["Build a house", "නිවසක් ඉදිකිරීම"],
      ["Build confidence", "ආත්ම විශ්වාසය ගොඩනැගීම"],
      ["Build relationships", "සබඳතා ගොඩනැගීම"]
    ],
    examples: [
      { en: "Birds build safe nests high up in trees.", si: "කුරුල්ලෝ ගස් මුදුන්වල ආරක්ෂිත කූඩු හදති." },
      { en: "They built a new hospital in our town last year.", si: "ඔවුන් පසුගිය වසරේ අපේ නගරයේ නව රෝහලක් ඉදි කළහ." },
      { en: "This bridge was built over a hundred years ago.", si: "මෙම පාලම මීට වසර සියයකට පෙර ඉදිකරන ලද්දකි." },
      { en: "Daily practice helps build strong language skills.", si: "දිනපතා පුහුණුවීම ශක්තිමත් භාෂා කුසලතා ගොඩනැගීමට උපකාරී වේ." }
    ],
    mistake: {
      incorrect: "They builded a wooden boat.",
      correct: "They built a wooden boat.",
      explanation: "The past forms of build end in -t: 'built'."
    }
  },
  // 7. Buy
  {
    v1: "Buy",
    v2: "Bought",
    v3: "Bought",
    ipa: "/baɪ/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "මිලදී ගැනීම",
    colloc: [
      ["Buy groceries", "බඩු බාහිරාදිය මිලදී ගැනීම"],
      ["Buy online", "අන්තර්ජාලයෙන් මිලදී ගැනීම"],
      ["Afford to buy", "මිලදී ගැනීමට හැකියාව තිබීම"]
    ],
    examples: [
      { en: "I want to buy a new English dictionary.", si: "මට අලුත් ඉංග්‍රීසි ශබ්දකෝෂයක් මිලදී ගැනීමට අවශ්‍යයි." },
      { en: "Yesterday, she bought fresh fruits at the local market.", si: "ඊයේ ඇය දේශීය වෙළඳපොලෙන් නැවුම් පලතුරු මිලදී ගත්තාය." },
      { en: "He has bought train tickets for the family trip.", si: "ඔහු පවුලේ සංචාරය සඳහා දුම්රිය ප්‍රවේශපත්‍ර මිලදී ගෙන ඇත." },
      { en: "Many people prefer to buy things online nowadays.", si: "වර්තමානයේ බොහෝ අය අන්තර්ජාලයෙන් බඩු මිලදී ගැනීමට කැමතියි." }
    ],
    mistake: {
      incorrect: "I buyed a pair of shoes.",
      correct: "I bought a pair of shoes.",
      explanation: "The past tense and participle of buy is 'bought'."
    }
  },
  // 8. Catch
  {
    v1: "Catch",
    v2: "Caught",
    v3: "Caught",
    ipa: "/kætʃ/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "අල්ලා ගැනීම",
    colloc: [
      ["Catch a ball", "පන්දුවක් අල්ලා ගැනීම"],
      ["Catch a bus", "බස් රථයකට නැගීම"],
      ["Catch a cold", "හෙම්බිරිස්සාවක් හැදීම"]
    ],
    examples: [
      { en: "Run fast so you can catch the morning train.", si: "උදෑසන දුම්රිය අල්ලා ගැනීමට වේගයෙන් දුවන්න." },
      { en: "The goalkeeper caught the ball with both hands.", si: "ගෝල රකින්නා දෑතින්ම පන්දුව අල්ලා ගත්තේය." },
      { en: "Police have caught the thief who stole the bicycle.", si: "පාපැදිය සොරකම් කළ හොරා පොලිසිය විසින් අල්ලාගෙන ඇත." },
      { en: "Wear warm clothes so you do not catch a cold.", si: "හෙම්බිරිස්සාව හැදෙන්නේ නැතිවෙන්න උණුසුම් ඇඳුම් අඳින්න." }
    ],
    mistake: {
      incorrect: "He catched the fish with a net.",
      correct: "He caught the fish with a net.",
      explanation: "The irregular past form is 'caught'."
    }
  },
  // 9. Choose
  {
    v1: "Choose",
    v2: "Chose",
    v3: "Chosen",
    ipa: "/tʃuːz/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "තෝරා ගැනීම",
    colloc: [
      ["Choose wisely", "ඥානාන්විතව තෝරා ගැනීම"],
      ["Choose a career", "වෘත්තියක් තෝරා ගැනීම"],
      ["Freely choose", "නිදහසේ තෝරා ගැනීම"]
    ],
    examples: [
      { en: "You can choose any book from this shelf.", si: "මෙම රාක්කයෙන් ඔබට ඕනෑම පොතක් තෝරාගත හැක." },
      { en: "Last year, she chose to study medicine in Colombo.", si: "පසුගිය වසරේ ඇය කොළඹදී වෛද්‍ය විද්‍යාව හැදෑරීමට තෝරා ගත්තාය." },
      { en: "He was chosen as the school cricket team captain.", si: "ඔහු පාසල් ක්‍රිකට් කණ්ඩායමේ නායකයා ලෙස තෝරා ගන්නා ලදී." },
      { en: "Take your time to choose the best option for your future.", si: "ඔබේ අනාගතය සඳහා හොඳම විකල්පය තෝරා ගැනීමට කාලය ගන්න." }
    ],
    mistake: {
      incorrect: "She has chose the red dress.",
      correct: "She has chosen the red dress. / She chose the red dress.",
      explanation: "With has/have use V3 'chosen'. Use V2 'chose' for past simple."
    }
  },
  // 10. Come
  {
    v1: "Come",
    v2: "Came",
    v3: "Come",
    ipa: "/kʌm/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "පැමිණීම",
    colloc: [
      ["Come home", "ගෙදර පැමිණීම"],
      ["Come true", "සැබෑ වීම"],
      ["Come to an end", "අවසානයකට පැමිණීම"]
    ],
    examples: [
      { en: "Please come to my birthday party on Saturday.", si: "කරුණාකර සෙනසුරාදා මගේ උපන් දින සාදයට එන්න." },
      { en: "My uncle came to visit us yesterday evening.", si: "ඊයේ සවස මගේ මාමා අපව බැලීමට පැමිණියේය." },
      { en: "The doctor has come, so you can see him now.", si: "දොස්තර මහතා පැමිණ ඇත, එබැවින් ඔබට දැන් ඔහුව හමුවිය හැක." },
      { en: "With patience and effort, your dreams will come true.", si: "ඉවසීමෙන් සහ උත්සාහයෙන් ඔබේ සිහින සැබෑ වනු ඇත." }
    ],
    mistake: {
      incorrect: "They have came early today.",
      correct: "They have come early today. / They came early today.",
      explanation: "The V3 participle reverts to 'come' (come -> came -> come)."
    }
  },
  // 11. Cost
  {
    v1: "Cost",
    v2: "Cost",
    v3: "Cost",
    ipa: "/kɒst/",
    pattern: "Pattern 1: All 3 Forms Same",
    si: "මිල වීම",
    colloc: [
      ["Cost a fortune", "විශාල මුදලක් වැය වීම"],
      ["Cost of living", "ජීවන වියදම"],
      ["Cost money", "මුදල් වැය වීම"]
    ],
    examples: [
      { en: "How much does this English dictionary cost?", si: "මෙම ඉංග්‍රීසි ශබ්දකෝෂයේ මිල කීයද?" },
      { en: "The ticket cost five hundred rupees yesterday.", si: "ඊයේ එම ටිකට් පත රුපියල් පන්සියයක් විය." },
      { en: "The repairs have cost more than we expected.", si: "අලුත්වැඩියාවන් සඳහා අප බලාපොරොත්තු වූවාට වඩා මුදලක් වැය වී ඇත." },
      { en: "Rising fuel prices increase the cost of food.", si: "ඉන්ධන මිල ඉහළ යාම නිසා ආහාර ද්‍රව්‍යවල මිල වැඩි වේ." }
    ],
    mistake: {
      incorrect: "That phone costed a lot of money.",
      correct: "That phone cost a lot of money.",
      explanation: "Pattern 1: Cost remains 'cost' in all three forms (never costed)."
    }
  },
  // 12. Cut
  {
    v1: "Cut",
    v2: "Cut",
    v3: "Cut",
    ipa: "/kʌt/",
    pattern: "Pattern 1: All 3 Forms Same",
    si: "කැපීම",
    colloc: [
      ["Cut paper", "කඩදාසි කැපීම"],
      ["Cut costs", "වියදම් කපා හැරීම"],
      ["Cut down trees", "ගස් කැපීම"]
    ],
    examples: [
      { en: "Use scissors to cut the ribbon cleanly.", si: "පීත්ත පටිය පිරිසිදුව කැපීමට කතුර භාවිතා කරන්න." },
      { en: "He cut his finger while slicing an apple yesterday.", si: "ඊයේ ඇපල් ගෙඩියක් කපන අතරතුර ඔහු තම ඇඟිල්ල කපා ගත්තේය." },
      { en: "The gardener has cut the grass in the front yard.", si: "වතුපාලකයා ඉදිරිපස මිදුලේ තණකොළ කපා ඇත." },
      { en: "Companies try to cut costs to save money.", si: "මුදල් ඉතිරි කර ගැනීම සඳහා සමාගම් වියදම් කපා හැරීමට උත්සාහ කරයි." }
    ],
    mistake: {
      incorrect: "She cutted the paper into squares.",
      correct: "She cut the paper into squares.",
      explanation: "Pattern 1: Cut is invariant: cut -> cut -> cut."
    }
  },
  // 13. Do
  {
    v1: "Do",
    v2: "Did",
    v3: "Done",
    ipa: "/duː/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "කිරීම",
    colloc: [
      ["Do homework", "ගෙදර වැඩ කිරීම"],
      ["Do your best", "ඔබේ උපරිමය කිරීම"],
      ["Do research", "පර්යේෂණ කිරීම"]
    ],
    examples: [
      { en: "Children should do their homework every afternoon.", si: "ළමයි සෑම සවසකම තම ගෙදර වැඩ කළ යුතුය." },
      { en: "She did all the exercises without any mistakes.", si: "ඇය කිසිදු වරදක් නොමැතිව සියලුම අභ්‍යාස කළාය." },
      { en: "Have you done your household chores yet?", si: "ඔබ දැනටමත් ඔබේ ගෙදර දොරේ වැඩ කර අවසන් කර තිබේද?" },
      { en: "Always do your best in the IELTS examination.", si: "IELTS විභාගයේදී සැමවිටම ඔබේ උපරිමය කරන්න." }
    ],
    mistake: {
      incorrect: "I have did my homework.",
      correct: "I have done my homework. / I did my homework.",
      explanation: "Use V3 'done' with have/has. Use V2 'did' for past simple."
    }
  },
  // 14. Draw
  {
    v1: "Draw",
    v2: "Drew",
    v3: "Drawn",
    ipa: "/drɔː/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "ඇඳීම",
    colloc: [
      ["Draw a picture", "පින්තූරයක් ඇඳීම"],
      ["Draw a map", "සිතියමක් ඇඳීම"],
      ["Draw attention", "අවධානය දිනා ගැනීම"]
    ],
    examples: [
      { en: "Little children love to draw colorful flowers.", si: "කුඩා ළමයි වර්ණවත් මල් ඇඳීමට කැමතියි." },
      { en: "The architect drew a clear plan for the new house.", si: "ගෘහ නිර්මාණ ශිල්පියා නව නිවස සඳහා පැහැදිලි සැලැස්මක් ඇන්දේය." },
      { en: "She has drawn a beautiful portrait of her mother.", si: "ඇය තම මවගේ ලස්සන රුවක් ඇඳ ඇත." },
      { en: "The loud sound drew everyone's attention immediately.", si: "මහත් හඬ වහාම සැමගේ අවධානය දිනා ගත්තේය." }
    ],
    mistake: {
      incorrect: "He drawed an elephant.",
      correct: "He drew an elephant.",
      explanation: "The past simple form is 'drew' (V2)."
    }
  },
  // 15. Drink
  {
    v1: "Drink",
    v2: "Drank",
    v3: "Drunk",
    ipa: "/drɪŋk/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "පානය කිරීම",
    colloc: [
      ["Drink water", "වතුර බීම"],
      ["Drink hot tea", "උණු තේ බීම"],
      ["Drink responsibly", "වගකීමෙන් පානය කිරීම"]
    ],
    examples: [
      { en: "You should drink at least eight glasses of water daily.", si: "ඔබ දිනපතා අවම වශයෙන් වතුර වීදුරු අටක්වත් පානය කළ යුතුය." },
      { en: "He was thirsty, so he drank a large glass of juice.", si: "ඔහුට පිපාසය තිබූ නිසා ඔහු විශාල ජූස් වීදුරුවක් බීවේය." },
      { en: "I have drunk three cups of tea this morning.", si: "මම අද උදෑසන තේ කෝප්ප තුනක් බී ඇත්තෙමි." },
      { en: "Athletes drink electrolyte water after heavy training.", si: "ක්‍රීඩකයන් දැඩි පුහුණුවෙන් පසු ඉලෙක්ට්‍රෝලයිට් ජලය පානය කරයි." }
    ],
    mistake: {
      incorrect: "He has drank all the milk.",
      correct: "He has drunk all the milk. / He drank all the milk.",
      explanation: "V1: drink, V2: drank, V3: drunk. Use 'drunk' with has/have."
    }
  },
  // 16. Drive
  {
    v1: "Drive",
    v2: "Drove",
    v3: "Driven",
    ipa: "/draɪv/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "රිය පැදවීම",
    colloc: [
      ["Drive carefully", "ප්‍රවේශමෙන් රිය පැදවීම"],
      ["Drive a car", "මෝටර් රථයක් පැදවීම"],
      ["Drive economic growth", "ආර්ථික වර්ධනය මෙහෙයවීම"]
    ],
    examples: [
      { en: "You must have a valid license to drive a car.", si: "මෝටර් රථයක් පැදවීමට ඔබට වලංගු රියදුරු බලපත්‍රයක් තිබිය යුතුය." },
      { en: "My father drove us to the beach last Sunday.", si: "පසුගිය ඉරිදා මගේ පියා අපව වෙරළට රැගෙන ගියේය." },
      { en: "She has driven this vehicle for over five years.", si: "ඇය වසර පහකට වැඩි කාලයක් මෙම වාහනය පදවා ඇත." },
      { en: "Always drive carefully in the heavy rain.", si: "තද වැස්සේ සැමවිටම ප්‍රවේශමෙන් රිය පදවන්න." }
    ],
    mistake: {
      incorrect: "He has drove across the country.",
      correct: "He has driven across the country.",
      explanation: "V3 is 'driven' (drive -> drove -> driven)."
    }
  },
  // 17. Eat
  {
    v1: "Eat",
    v2: "Ate",
    v3: "Eaten",
    ipa: "/iːt/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "ආහාර ගැනීම",
    colloc: [
      ["Eat healthy food", "නිරෝගී ආහාර ගැනීම"],
      ["Eat dinner", "රාත්‍රී ආහාරය ගැනීම"],
      ["Eat out", "පිටතින් ආහාර ගැනීම"]
    ],
    examples: [
      { en: "Children should eat plenty of fresh vegetables.", si: "ළමයි නැවුම් එළවළු ඕනෑ තරම් කෑ යුතුය." },
      { en: "We ate spicy rice and curry for lunch.", si: "අපි දිවා ආහාරය සඳහා සැර බත් සහ වෑංජන කෑවෙමු." },
      { en: "Have you eaten breakfast yet this morning?", si: "ඔබ අද උදෑසන ආහාරය දැනටමත් ගෙන තිබේද?" },
      { en: "Eating balanced meals keeps your body energetic.", si: "සමබර ආහාර ගැනීම ඔබේ සිරුර ශක්තිමත්ව තබයි." }
    ],
    mistake: {
      incorrect: "I have ate lunch.",
      correct: "I have eaten lunch. / I ate lunch.",
      explanation: "Use V3 'eaten' after have/has. Use V2 'ate' for past simple."
    }
  },
  // 18. Fall
  {
    v1: "Fall",
    v2: "Fell",
    v3: "Fallen",
    ipa: "/fɔːl/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "වැටීම",
    colloc: [
      ["Fall asleep", "නින්දට වැටීම"],
      ["Fall down", "බිම වැටීම"],
      ["Fall in love", "ආදරයෙන් බැඳීම"]
    ],
    examples: [
      { en: "Leaves fall from the trees during autumn.", si: "සරත් සෘතුවේදී ගස් වලින් කොළ වැටේ." },
      { en: "The clumsy boy fell off his bicycle yesterday.", si: "ඊයේ එම නොසැලකිලිමත් පිරිමි ළමයා පාපැදියෙන් වැටුණි." },
      { en: "The coconut has fallen into the green grass.", si: "පොල් ගෙඩිය කොළ පැහැති තණකොළ මතට වැටී ඇත." },
      { en: "He was so tired that he fell asleep immediately.", si: "ඔහු කෙතරම් මහන්සි වී සිටියේද යත් ඔහුට වහාම නින්ද ගියේය." }
    ],
    mistake: {
      incorrect: "The price has fell down.",
      correct: "The price has fallen. / The price fell.",
      explanation: "V3 is 'fallen' (fall -> fell -> fallen)."
    }
  },
  // 19. Feel
  {
    v1: "Feel",
    v2: "Felt",
    v3: "Felt",
    ipa: "/fiːl/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "දැනීම",
    colloc: [
      ["Feel happy", "සතුටක් දැනීම"],
      ["Feel tired", "මහන්සියක් දැනීම"],
      ["Feel confident", "ආත්ම විශ්වාසයක් දැනීම"]
    ],
    examples: [
      { en: "I feel very confident about my English test.", si: "මගේ ඉංග්‍රීසි විභාගය ගැන මට විශාල ආත්ම විශ්වාසයක් දැනේ." },
      { en: "She felt exhausted after the long marathon run.", si: "දිගු මැරතන් ධාවනයෙන් පසු ඇයට දැඩි තෙහෙට්ටුවක් දැනුණි." },
      { en: "He has felt sick since yesterday evening.", si: "ඊයේ සවස සිට ඔහුට අසනීප ගතියක් දැනී ඇත." },
      { en: "Helping other people makes you feel joyful inside.", si: "අන් අයට උපකාර කිරීමෙන් ඔබට සිතට මහත් සතුටක් දැනේ." }
    ],
    mistake: {
      incorrect: "I feeled very happy.",
      correct: "I felt very happy.",
      explanation: "The past tense of feel is 'felt', never feeled."
    }
  },
  // 20. Find
  {
    v1: "Find",
    v2: "Found",
    v3: "Found",
    ipa: "/faɪnd/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "සොයා ගැනීම",
    colloc: [
      ["Find a solution", "විසඳුමක් සොයා ගැනීම"],
      ["Find out the truth", "සත්‍යය දැන ගැනීම"],
      ["Find employment", "රැකියාවක් සොයා ගැනීම"]
    ],
    examples: [
      { en: "Use a dictionary when you want to find new words.", si: "නව වචන සොයා ගැනීමට අවශ්‍ය වූ විට ශබ්දකෝෂයක් භාවිතා කරන්න." },
      { en: "I found my lost house keys under the sofa.", si: "මට අහිමි වූ ගෙදර යතුරු සෝෆාව යට තිබී මට හමුවිය." },
      { en: "Archaeologists have found ancient gold beads on the hill.", si: "කඳු මුදුනේ තිබී පැරණි රන් පබළු පුරාවිද්‍යාඥයන්ට හමු වී ඇත." },
      { en: "Students work hard to find a suitable university course.", si: "සුදුසු විශ්වවිද්‍යාල පාඨමාලාවක් සොයා ගැනීමට සිසුන් මහන්සි වී වැඩ කරති." }
    ],
    mistake: {
      incorrect: "She finded her lost dog.",
      correct: "She found her lost dog.",
      explanation: "V2 and V3 of find are 'found'."
    }
  }
];

