// Part 2: Verbs 21 - 42
module.exports = [
  // 21. Fly
  {
    v1: "Fly",
    v2: "Flew",
    v3: "Flown",
    ipa: "/flaɪ/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "පියාසර කිරීම",
    colloc: [
      ["Fly an airplane", "ගුවන් යානයක් පැදවීම"],
      ["Fly overseas", "විදේශගත වීම"],
      ["Birds fly south", "කුරුල්ලෝ දකුණට පියාසර කරති"]
    ],
    examples: [
      { en: "Birds fly high across the blue sky.", si: "නිල් අහස හරහා කුරුල්ලෝ ඉහළට පියාසර කරති." },
      { en: "The pilot flew the airplane through the storm safely.", si: "නියමුවා කුණාටුව මැදින් ගුවන් යානය ආරක්ෂිතව පදවාගෙන ගියේය." },
      { en: "She has flown to London three times for business.", si: "ඇය ව්‍යාපාරික කටයුතු සඳහා තුන් වතාවක් ලන්ඩනයට ගුවන් මගින් ගොස් ඇත." },
      { en: "Time seems to fly when you are enjoying yourself.", si: "ඔබ සතුටින් සිටින විට කාලය පියාඹා යන බවක් දැනේ." }
    ],
    mistake: {
      incorrect: "The bird flied away.",
      correct: "The bird flew away.",
      explanation: "V2 is 'flew' and V3 is 'flown'."
    }
  },
  // 22. Forget
  {
    v1: "Forget",
    v2: "Forgot",
    v3: "Forgotten",
    ipa: "/fəˈɡet/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "අමතක කිරීම",
    colloc: [
      ["Never forget", "කිසිදා අමතක නොකරන්න"],
      ["Forget your password", "මුරපදය අමතක වීම"],
      ["Easily forgotten", "පහසුවෙන් අමතක වන"]
    ],
    examples: [
      { en: "Do not forget to lock the door before leaving.", si: "පිටත්ව යාමට පෙර දොර අගුළු දැමීමට අමතක නොකරන්න." },
      { en: "I forgot my umbrella at home, so I got wet in the rain.", si: "මට නිවසේදී මගේ කුඩය අමතක විය, එබැවින් මම වැස්සේ තෙමුණෙමි." },
      { en: "He has forgotten the password to his email account.", si: "ඔහුට තම විද්‍යුත් තැපැල් ගිණුමේ මුරපදය අමතක වී ඇත." },
      { en: "Good memories with friends are never forgotten.", si: "මිතුරන් සමඟ ගත කළ සුන්දර මතකයන් කිසිදා අමතක නොවේ." }
    ],
    mistake: {
      incorrect: "I have forgot my notebook.",
      correct: "I have forgotten my notebook. / I forgot my notebook.",
      explanation: "V3 is 'forgotten' (forget -> forgot -> forgotten)."
    }
  },
  // 23. Get
  {
    v1: "Get",
    v2: "Got",
    v3: "Got / Gotten",
    ipa: "/ɡet/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "ලබා ගැනීම",
    colloc: [
      ["Get a job", "රැකියාවක් ලබා ගැනීම"],
      ["Get ready", "සූදානම් වීම"],
      ["Get better", "සුව වීම / යහපත් වීම"]
    ],
    examples: [
      { en: "You can get good marks if you study every day.", si: "ඔබ සෑම දිනකම පාඩම් කළහොත් හොඳ ලකුණු ලබා ගත හැක." },
      { en: "She got a promotion at work last month.", si: "පසුගිය මාසයේ ඇයට රැකියාවේ උසස්වීමක් ලැබුණි." },
      { en: "He has got a scholarship to study in the UK.", si: "එක්සත් රාජධානියේ ඉගෙනීමට ඔහුට ශිෂ්‍යත්වයක් ලැබී ඇත." },
      { en: "Drink warm tea to get better from the flu.", si: "උණ රෝගයෙන් සුවය ලබා ගැනීමට උණු තේ පානය කරන්න." }
    ],
    mistake: {
      incorrect: "She getted a high score.",
      correct: "She got a high score.",
      explanation: "The past tense of get is 'got'."
    }
  },
  // 24. Give
  {
    v1: "Give",
    v2: "Gave",
    v3: "Given",
    ipa: "/ɡɪv/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "දීම",
    colloc: [
      ["Give advice", "උපදෙස් දීම"],
      ["Give a presentation", "දේශනයක් ඉදිරිපත් කිරීම"],
      ["Give up", "අත්හැර දැමීම"]
    ],
    examples: [
      { en: "Generous people give food to the poor.", si: "ත්‍යාගශීලී මිනිසුන් දුප්පතුන්ට ආහාර දෙති." },
      { en: "The teacher gave clear instructions to all students.", si: "ගුරුවරයා සියලුම සිසුන්ට පැහැදිලි උපදෙස් ලබා දුන්නේය." },
      { en: "She was given a gold medal for her performance.", si: "ඇයගේ දක්ෂතාවය වෙනුවෙන් ඇයට රන් පදක්කමක් පිරිනමන ලදී." },
      { en: "Never give up on your long-term goals.", si: "ඔබගේ දිගුකාලීන ඉලක්ක කිසි විටෙකත් අත් නොහරින්න." }
    ],
    mistake: {
      incorrect: "He gived me a wonderful book.",
      correct: "He gave me a wonderful book.",
      explanation: "V2 is 'gave' and V3 is 'given'."
    }
  },
  // 25. Go
  {
    v1: "Go",
    v2: "Went",
    v3: "Gone",
    ipa: "/ɡəʊ/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "යාම",
    colloc: [
      ["Go abroad", "විදේශගත වීම"],
      ["Go to university", "විශ්වවිද්‍යාලයට යාම"],
      ["Go swimming", "පිහිනීමට යාම"]
    ],
    examples: [
      { en: "I go to work by bus every weekday.", si: "මම සෑම සතියේ දිනකම බස් රථයෙන් රැකියාවට යමි." },
      { en: "We went to Kandy for a family vacation last week.", si: "අපි පසුගිය සතියේ පවුලේ නිවාඩුවක් සඳහා මහනුවරට ගියෙමු." },
      { en: "My sister has gone to the supermarket to buy groceries.", si: "මගේ සහෝදරිය බඩු මිලදී ගැනීමට සුපිරි වෙළඳසැලට ගොස් ඇත." },
      { en: "Many students want to go overseas for higher studies.", si: "බොහෝ සිසුන්ට උසස් අධ්‍යාපනය සඳහා විදේශගත වීමට අවශ්‍යයි." }
    ],
    mistake: {
      incorrect: "They have went to the bank.",
      correct: "They have gone to the bank. / They went to the bank.",
      explanation: "Use V3 'gone' with have/has. Use V2 'went' for past simple."
    }
  },
  // 26. Grow
  {
    v1: "Grow",
    v2: "Grew",
    v3: "Grown",
    ipa: "/ɡrəʊ/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "වර්ධනය වීම",
    colloc: [
      ["Grow vegetables", "එළවළු වගා කිරීම"],
      ["Grow up", "වැඩිහිටියෙකු බවට පත්වීම"],
      ["Rapidly grow", "වේගයෙන් වර්ධනය වීම"]
    ],
    examples: [
      { en: "Farmers grow fresh vegetables in the valley.", si: "ගොවීන් නිම්නයේ නැවුම් එළවළු වගා කරති." },
      { en: "The small mango tree grew very tall within three years.", si: "කුඩා අඹ ගස වසර තුනක් ඇතුළත ඉතා උසට වැඩුණි." },
      { en: "The city's population has grown rapidly over the decade.", si: "දශකය පුරා නගරයේ ජනගහනය වේගයෙන් වර්ධනය වී ඇත." },
      { en: "Children grow stronger when they eat nutritious meals.", si: "පෝෂ්‍යදායී ආහාර ගන්නා විට දරුවන් ශක්තිමත්ව වැඩේ." }
    ],
    mistake: {
      incorrect: "The plant has grew quickly.",
      correct: "The plant has grown quickly. / The plant grew quickly.",
      explanation: "V3 is 'grown' (grow -> grew -> grown)."
    }
  },
  // 27. Have
  {
    v1: "Have",
    v2: "Had",
    v3: "Had",
    ipa: "/hæv/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "තිබීම / සතු වීම",
    colloc: [
      ["Have breakfast", "උදෑසන ආහාරය ගැනීම"],
      ["Have an idea", "අදහසක් තිබීම"],
      ["Have patience", "ඉවසීම තිබීම"]
    ],
    examples: [
      { en: "I have two brothers and one younger sister.", si: "මට සහෝදරයන් දෙදෙනෙකු සහ එක් බාල සහෝදරියක් සිටී." },
      { en: "We had a wonderful picnic by the river yesterday.", si: "අපි ඊයේ ගඟ අසල අපූරු විනෝද චාරිකාවක් ගත කළෙමු." },
      { en: "She has had a cold for the past three days.", si: "පසුගිය දින තුන තිස්සේ ඇයට හෙම්බිරිස්සාවක් වැළඳී ඇත." },
      { en: "It is important to have confidence when speaking in public.", si: "ප්‍රසිද්ධියේ කතා කරන විට ආත්ම විශ්වාසය තිබීම වැදගත්ය." }
    ],
    mistake: {
      incorrect: "Yesterday we haved a test.",
      correct: "Yesterday we had a test.",
      explanation: "Both V2 and V3 of have are 'had'."
    }
  },
  // 28. Hear
  {
    v1: "Hear",
    v2: "Heard",
    v3: "Heard",
    ipa: "/hɪər/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "ඇසීම",
    colloc: [
      ["Hear a sound", "ශබ්දයක් ඇසීම"],
      ["Hear the news", "ප්‍රවෘත්ති ඇසීම"],
      ["Hear someone out", "කෙනෙකුට සවන් දීම"]
    ],
    examples: [
      { en: "Can you hear the birds singing in the garden?", si: "වත්තේ කුරුල්ලන් ගී ගයන හඬ ඔබට ඇසෙනවාද?" },
      { en: "I heard strange footsteps outside in the dark night.", si: "අඳුරු රාත්‍රියේ පිටතින් අමුතු අඩිපාරවල් ශබ්දයක් මට ඇසුණි." },
      { en: "Have you heard the good news about our school?", si: "අපේ පාසල ගැන හොඳ ආරංචිය ඔබට ඇසුණාද?" },
      { en: "Listen carefully so you can hear every word of the audio.", si: "ශ්‍රව්‍ය කොටසේ සෑම වචනයක්ම ඇසෙන පරිදි හොඳින් සවන් දෙන්න." }
    ],
    mistake: {
      incorrect: "I heared a loud noise.",
      correct: "I heard a loud noise.",
      explanation: "The past forms are 'heard' (spelled with -d, pronounced /hɜːd/)."
    }
  },
  // 29. Hold
  {
    v1: "Hold",
    v2: "Held",
    v3: "Held",
    ipa: "/həʊld/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "අල්ලාගෙන සිටීම",
    colloc: [
      ["Hold hands", "අත් අල්ලා ගැනීම"],
      ["Hold a meeting", "රැස්වීමක් පැවැත්වීම"],
      ["Hold a passport", "ගමන් බලපත්‍රයක් හිමිව තිබීම"]
    ],
    examples: [
      { en: "Please hold my bag while I unlock the gate.", si: "මම ගේට්ටුව අරින තුරු කරුණාකර මගේ බෑගය අල්ලාගෙන සිටින්න." },
      { en: "The company held an important conference last Friday.", si: "පසුගිය සිකුරාදා සමාගම වැදගත් සමුළුවක් පැවැත්වීය." },
      { en: "The ceremony was held in the national auditorium.", si: "උත්සවය ජාතික ශ්‍රවණාගාරයේදී පවත්වන ලදී." },
      { en: "A mother tenderly holds her newborn child.", si: "මවක් තම අලුත උපන් දරුවා සෙනෙහසින් අල්ලා ගනී." }
    ],
    mistake: {
      incorrect: "They holded the event outside.",
      correct: "They held the event outside.",
      explanation: "V2 and V3 of hold are 'held'."
    }
  },
  // 30. Keep
  {
    v1: "Keep",
    v2: "Kept",
    v3: "Kept",
    ipa: "/kiːp/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "තබා ගැනීම",
    colloc: [
      ["Keep a promise", "පොරොන්දුවක් ඉටු කිරීම"],
      ["Keep secrets", "රහස් තබා ගැනීම"],
      ["Keep calm", "සන්සුන්ව සිටීම"]
    ],
    examples: [
      { en: "Always keep your room clean and organized.", si: "සැමවිටම ඔබේ කාමරය පිරිසිදුව හා පිළිවෙළකට තබා ගන්න." },
      { en: "She kept all her old school books in a wooden box.", si: "ඇය තම පැරණි පාසල් පොත් සියල්ල ලී පෙට්ටියක තබා ගත්තාය." },
      { en: "He has kept his promise to visit his grandparents every month.", si: "සෑම මසකම තම ආච්චි සහ සීයා බැලීමට යන බවට දුන් පොරොන්දුව ඔහු ඉටු කර ඇත." },
      { en: "Try to keep calm during the IELTS speaking interview.", si: "IELTS කථන සම්මුඛ පරීක්ෂණයේදී සන්සුන්ව සිටීමට උත්සාහ කරන්න." }
    ],
    mistake: {
      incorrect: "She keeped the money in her drawer.",
      correct: "She kept the money in her drawer.",
      explanation: "V2 and V3 of keep are 'kept'."
    }
  },
  // 31. Know
  {
    v1: "Know",
    v2: "Knew",
    v3: "Known",
    ipa: "/nəʊ/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "දැන ගැනීම",
    colloc: [
      ["Know the answer", "පිළිතුර දැන ගැනීම"],
      ["Well known", "හොඳින් ප්‍රසිද්ධ"],
      ["Know by heart", "කටපාඩමින් දැන සිටීම"]
    ],
    examples: [
      { en: "Do you know the way to the train station?", si: "දුම්රිය ස්ථානයට යන මාර්ගය ඔබ දන්නවාද?" },
      { en: "He knew the correct answer to the difficult question.", si: "අසීරු ප්‍රශ්නයට නිවැරදි පිළිතුර ඔහු දැන සිටියේය." },
      { en: "They have known each other since early childhood.", si: "ඔවුන් ළමා වියේ සිටම එකිනෙකාව හඳුනති." },
      { en: "Sri Lanka is known for its world-famous Ceylon tea.", si: "ශ්‍රී ලංකාව ලෝක ප්‍රසිද්ධ සිලෝන් තේ සඳහා ප්‍රසිද්ධය." }
    ],
    mistake: {
      incorrect: "I have knew him for years.",
      correct: "I have known him for years. / I knew him.",
      explanation: "Use V3 'known' after has/have. Use V2 'knew' for simple past."
    }
  },
  // 32. Leave
  {
    v1: "Leave",
    v2: "Left",
    v3: "Left",
    ipa: "/liːv/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "පිටව යාම / හැර යාම",
    colloc: [
      ["Leave home", "නිවසින් පිටවීම"],
      ["Leave a message", "පණිවිඩයක් තැබීම"],
      ["Leave for work", "රැකියාවට පිටත්ව යාම"]
    ],
    examples: [
      { en: "I leave home at seven to catch the morning train.", si: "උදෑසන දුම්රිය අල්ලා ගැනීමට මම හතට නිවසින් පිටත් වෙමි." },
      { en: "The bus left the station ten minutes ago.", si: "මිනිත්තු දහයකට පෙර බස් රථය නැවතුම්පොළෙන් පිටත් විය." },
      { en: "Someone has left their umbrella in the hallway.", si: "කවුරුන් හෝ තම කුඩය ශාලාවේ දමා ගොස් ඇත." },
      { en: "Never leave your personal belongings unattended in public.", si: "පොදු ස්ථානවල ඔබේ පෞද්ගලික බඩුබාහිරාදිය නොසලකා හැර නොයන්න." }
    ],
    mistake: {
      incorrect: "The train leaved on time.",
      correct: "The train left on time.",
      explanation: "V2 and V3 of leave are 'left'."
    }
  },
  // 33. Lose
  {
    v1: "Lose",
    v2: "Lost",
    v3: "Lost",
    ipa: "/luːz/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "නැති කර ගැනීම",
    colloc: [
      ["Lose weight", "බර අඩු කර ගැනීම"],
      ["Lose your way", "මංමුළා වීම"],
      ["Lose a match", "තරගයක් පරාජය වීම"]
    ],
    examples: [
      { en: "Be careful not to lose your passport when travelling.", si: "සංචාරය කරන විට ඔබේ ගමන් බලපත්‍රය නැති කර නොගැනීමට ප්‍රවේශම් වන්න." },
      { en: "Our school team lost the final match by two points.", si: "අපේ පාසල් කණ්ඩායම ලකුණු දෙකකින් අවසන් තරගය පරාජය විය." },
      { en: "He has lost his car keys and cannot open the door.", si: "ඔහුට තම මෝටර් රථ යතුරු නැති වී ඇති අතර දොර ඇරීමට නොහැක." },
      { en: "Exercise regularly if you want to lose unhealthy weight.", si: "අහිතකර බර අඩු කර ගැනීමට අවශ්‍ය නම් ක්‍රමවත්ව ව්‍යායාම කරන්න." }
    ],
    mistake: {
      incorrect: "I loosed my pen.",
      correct: "I lost my pen.",
      explanation: "The past forms of lose are 'lost'."
    }
  },
  // 34. Make
  {
    v1: "Make",
    v2: "Made",
    v3: "Made",
    ipa: "/meɪk/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "සෑදීම",
    colloc: [
      ["Make a decision", "තීරණයක් ගැනීම"],
      ["Make a mistake", "වරදක් කිරීම"],
      ["Make friends", "මිතුරන් ඇති කර ගැනීම"]
    ],
    examples: [
      { en: "She wants to make a chocolate cake for the party.", si: "සාදය සඳහා චොකලට් කේක් එකක් සෑදීමට ඇයට අවශ්‍යයි." },
      { en: "The carpenter made a sturdy dining table from teak wood.", si: "වඩු කාර්මිකයා තේක්ක ලීයෙන් ශක්තිමත් කෑම මේසයක් හැදුවේය." },
      { en: "This famous watch was made in Switzerland.", si: "මෙම ප්‍රසිද්ධ ඔරලෝසුව සාදන ලද්දේ ස්විට්සර්ලන්තයේ ය." },
      { en: "Do not be afraid to make mistakes while learning English.", si: "ඉංග්‍රීසි ඉගෙන ගන්නා විට වැරදි කිරීමට බිය නොවන්න." }
    ],
    mistake: {
      incorrect: "He maked a big mistake.",
      correct: "He made a big mistake.",
      explanation: "V2 and V3 of make are 'made'."
    }
  },
  // 35. Meet
  {
    v1: "Meet",
    v2: "Met",
    v3: "Met",
    ipa: "/miːt/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "හමුවීම",
    colloc: [
      ["Meet expectations", "බලාපොරොත්තු ඉටු කිරීම"],
      ["Meet a deadline", "නියමිත කාලසීමාවට වැඩ නිම කිරීම"],
      ["Meet new people", "නව මිනිසුන් හමුවීම"]
    ],
    examples: [
      { en: "Let's meet outside the library at five in the evening.", si: "අපි සවස පහට පුස්තකාලය ඉදිරිපිටදී හමුවෙමු." },
      { en: "I met an old school friend at the railway station.", si: "දුම්රිය ස්ථානයේදී මට පැරණි පාසල් මිතුරෙකු හමුවිය." },
      { en: "Have you ever met a famous author in person?", si: "ඔබ කවදා හෝ ප්‍රසිද්ධ ලේඛකයෙකු පෞද්ගලිකව හමුවී තිබේද?" },
      { en: "Joining clubs is a wonderful way to meet like-minded people.", si: "සමාජ ශාලාවලට බැඳීම සමාන අදහස් ඇති පුද්ගලයන් හමුවීමට හොඳ ක්‍රමයකි." }
    ],
    mistake: {
      incorrect: "We meeted yesterday afternoon.",
      correct: "We met yesterday afternoon.",
      explanation: "The irregular past forms are 'met'."
    }
  },
  // 36. Pay
  {
    v1: "Pay",
    v2: "Paid",
    v3: "Paid",
    ipa: "/peɪ/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "ගෙවීම",
    colloc: [
      ["Pay attention", "අවධානය යොමු කිරීම"],
      ["Pay bills", "බිල්පත් ගෙවීම"],
      ["Pay by card", "කාඩ්පතකින් ගෙවීම"]
    ],
    examples: [
      { en: "You can pay for your groceries with cash or a card.", si: "ඔබේ බඩුබාහිරාදිය සඳහා ඔබට මුදලින් හෝ කාඩ්පතකින් ගෙවිය හැක." },
      { en: "He paid the electricity bill online yesterday morning.", si: "ඔහු ඊයේ උදෑසන අන්තර්ජාලය හරහා විදුලි බිල ගෙවීය." },
      { en: "All the workers have been paid their monthly salaries.", si: "සියලුම සේවකයන්ට ඔවුන්ගේ මාසික වැටුප් ගෙවා ඇත." },
      { en: "Students must pay close attention during the grammar lecture.", si: "ව්‍යාකරණ දේශනය අතරතුර සිසුන් දැඩි අවධානයක් යොමු කළ යුතුය." }
    ],
    mistake: {
      incorrect: "He payed with cash.",
      correct: "He paid with cash.",
      explanation: "Spelling: The past forms are spelled 'paid' (not payed)."
    }
  },
  // 37. Put
  {
    v1: "Put",
    v2: "Put",
    v3: "Put",
    ipa: "/pʊt/",
    pattern: "Pattern 1: All 3 Forms Same",
    si: "තැබීම",
    colloc: [
      ["Put on clothes", "ඇඳුම් ඇඳීම"],
      ["Put out a fire", "ගින්නක් නිවීම"],
      ["Put into practice", "ප්‍රායෝගිකව ක්‍රියාත්මක කිරීම"]
    ],
    examples: [
      { en: "Please put your bag on the table near the door.", si: "කරුණාකර දොර අසල මේසය මත ඔබේ බෑගය තබන්න." },
      { en: "She put the fresh flowers in a glass vase yesterday.", si: "ඇය ඊයේ වීදුරු බඳුනක නැවුම් මල් තැබුවාය." },
      { en: "He has put all his savings into a fixed deposit.", si: "ඔහු තම සියලු ඉතිරිකිරීම් ස්ථාවර තැන්පතුවක තැන්පත් කර ඇත." },
      { en: "Put on a warm sweater before going outside into the cold.", si: "සීතලට එළිමහනට යාමට පෙර උණුසුම් ස්වීටරයක් ඇඳගන්න." }
    ],
    mistake: {
      incorrect: "She putted the plate away.",
      correct: "She put the plate away.",
      explanation: "Pattern 1: Put is invariant: put -> put -> put."
    }
  },
  // 38. Read
  {
    v1: "Read",
    v2: "Read",
    v3: "Read",
    ipa: "/riːd/ (V2/V3: /red/)",
    pattern: "Pattern 1: All 3 Forms Same",
    si: "කියවීම",
    colloc: [
      ["Read widely", "පුළුල් ලෙස කියවීම"],
      ["Read aloud", "ශබ්ද නඟා කියවීම"],
      ["Read a passage", "ඡේදයක් කියවීම"]
    ],
    examples: [
      { en: "I love to read English storybooks before sleeping.", si: "මම නිදා ගැනීමට පෙර ඉංග්‍රීසි කතන්දර පොත් කියවීමට ප්‍රිය කරමි." },
      { en: "Yesterday, she read the entire morning newspaper.", si: "ඊයේ ඇය මුළු උදෑසන පුවත්පතම කියෙව්වාය." },
      { en: "I have read all the chapters required for tomorrow's test.", si: "හෙට විභාගයට අවශ්‍ය සියලුම පරිච්ඡේද මම කියවා ඇත්තෙමි." },
      { en: "Reading diverse academic articles expands your vocabulary.", si: "විවිධ අධ්‍යයන ලිපි කියවීමෙන් ඔබේ වචන මාලාව පුළුල් වේ." }
    ],
    mistake: {
      incorrect: "He readed the instructions.",
      correct: "He read the instructions (pronounced /red/).",
      explanation: "Spelling stays 'read', but pronunciation changes to /red/ in V2/V3."
    }
  },
  // 39. Ride
  {
    v1: "Ride",
    v2: "Rode",
    v3: "Ridden",
    ipa: "/raɪd/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "පැදීම",
    colloc: [
      ["Ride a bicycle", "පාපැදියක් පැදීම"],
      ["Ride a horse", "අශ්වයෙකු පිට යාම"],
      ["Ride a motorcycle", "යතුරුපැදියක් පැදීම"]
    ],
    examples: [
      { en: "Many students ride their bicycles to school each morning.", si: "බොහෝ සිසුන් සෑම උදෑසනකම පාසලට පාපැදි පදිති." },
      { en: "He rode his motorcycle along the scenic mountain road.", si: "ඔහු සුන්දර කඳුකර මාර්ගයේ තම යතුරුපැදිය පැදවීය." },
      { en: "She has ridden horses since she was eight years old.", si: "ඇය වයස අවුරුදු අටේ සිටම අශ්වයන් පදවා ඇත." },
      { en: "Always wear a safe helmet whenever you ride a bike.", si: "පාපැදියක් පදින සෑම විටම ආරක්ෂිත හිස්වැස්මක් පළඳින්න." }
    ],
    mistake: {
      incorrect: "He has rode a camel.",
      correct: "He has ridden a camel. / He rode a camel.",
      explanation: "V3 is 'ridden' (ride -> rode -> ridden)."
    }
  },
  // 40. Ring
  {
    v1: "Ring",
    v2: "Rang",
    v3: "Rung",
    ipa: "/rɪŋ/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "නාද කිරීම",
    colloc: [
      ["Ring a bell", "ඝණ්ඨාරයක් නාද කිරීම"],
      ["Ring the alarm", "අනතුරු ඇඟවීම නාද කිරීම"],
      ["Ring someone up", "යමෙකුට දුරකථනයෙන් ඇමතීම"]
    ],
    examples: [
      { en: "The school bell rings at two o'clock in the afternoon.", si: "පාසල් සීනුව පස්වරු දෙකට නාද වේ." },
      { en: "The telephone rang loudly while we were eating lunch.", si: "අපි දිවා ආහාරය ගනිමින් සිටියදී දුරකථනය මහත් හඬින් නාද විය." },
      { en: "The church bells have rung for the morning service.", si: "උදෑසන දේව මෙහෙය සඳහා පල්ලියේ සීනු නාද වී ඇත." },
      { en: "Ring the emergency bell if you ever notice smoke.", si: "දුමාරයක් දුටුවහොත් හදිසි අනතුරු ඇඟවීමේ සීනුව නාද කරන්න." }
    ],
    mistake: {
      incorrect: "The bell has rang.",
      correct: "The bell has rung. / The bell rang.",
      explanation: "V1: ring, V2: rang, V3: rung. Use 'rung' with has/have."
    }
  },
  // 41. Run
  {
    v1: "Run",
    v2: "Ran",
    v3: "Run",
    ipa: "/rʌn/",
    pattern: "Pattern 3: All 3 Forms Different",
    si: "දිවීම",
    colloc: [
      ["Run fast", "වේගයෙන් දිවීම"],
      ["Run a business", "ව්‍යාපාරයක් පවත්වාගෙන යාම"],
      ["Run out of time", "කාලය ඉවර වීම"]
    ],
    examples: [
      { en: "Athletes run around the track to build endurance.", si: "ක්‍රීඩකයන් ශක්තිය වර්ධනය කර ගැනීමට ධාවන පථය වටා දුවති." },
      { en: "The boy ran as fast as he could to catch the bus.", si: "බස් රථය අල්ලා ගැනීමට පිරිමි ළමයා හැකි උපරිම වේගයෙන් දිව්වේය." },
      { en: "She has run three full marathons this year.", si: "ඇය මෙම වසරේ සම්පූර්ණ මැරතන් තරග තුනක් දුව ඇත." },
      { en: "Hurry up because we are about to run out of time.", si: "ඉක්මන් කරන්න, මන්ද අපේ කාලය අවසන් වීමට ආසන්නයි." }
    ],
    mistake: {
      incorrect: "He has ran five miles.",
      correct: "He has run five miles. / He ran five miles.",
      explanation: "V3 reverts to 'run' (run -> ran -> run)."
    }
  },
  // 42. Say
  {
    v1: "Say",
    v2: "Said",
    v3: "Said",
    ipa: "/seɪ/",
    pattern: "Pattern 2: V2 & V3 Same",
    si: "පැවසීම",
    colloc: [
      ["Say thank you", "ස්තූතිවන්ත වීම"],
      ["Needless to say", "නොකිවමනා පරිදි"],
      ["Say a few words", "වචන කිහිපයක් කතා කිරීම"]
    ],
    examples: [
      { en: "Always say thank you when someone helps you.", si: "යමෙකු ඔබට උදව් කරන විට සැමවිටම ස්තූතියි කියන්න." },
      { en: "The teacher said that the exam would start promptly.", si: "විභාගය නියමිත වේලාවටම ආරම්භ වන බව ගුරුවරයා පැවසීය." },
      { en: "Everything that was said in the meeting was recorded.", si: "රැස්වීමේදී පැවසූ සෑම දෙයක්ම සටහන් කර ගන්නා ලදී." },
      { en: "It is easy to say, but much harder to put into practice.", si: "කීම පහසුය, නමුත් එය ප්‍රායෝගිකව ක්‍රියාත්මක කිරීම වඩා දුෂ්කරය." }
    ],
    mistake: {
      incorrect: "She sayed hello to me.",
      correct: "She said hello to me (pronounced /sed/).",
      explanation: "The past forms are 'said' (pronounced /sed/)."
    }
  }
];

