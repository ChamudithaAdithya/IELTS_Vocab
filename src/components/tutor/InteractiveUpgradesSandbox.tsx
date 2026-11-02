import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Plus, 
  X, 
  TrendingUp, 
  Award, 
  HelpCircle, 
  ArrowRight,
  Sliders,
  Check,
  ChevronDown,
  Info,
  Copy,
  FileText,
  Split
} from 'lucide-react';
import type { EssaySegment } from '../../types/tutor';
import { roundIeltsBand, formatBand, generateAcademicUpgradeSegments } from '../../utils/tutorEngine';

export interface UpgradeDetailItem {
  id: string;
  type: 'replace' | 'ins' | 'del';
  originalText: string;
  originalMeaningSi?: string;
  upgradedText: string;
  upgradedMeaningSi?: string;
  criterion: 'LR' | 'TR' | 'CC' | 'GRA';
  originalCritique: string;
  originalCritiqueSi?: string;
  upgradeValue: string;
  upgradeValueSi?: string;
  note?: string;
}

interface InteractiveUpgradesSandboxProps {
  correctedText: string;
  segments: EssaySegment[];
  stage2Criteria: { TR: number; CC: number; LR: number; GRA: number };
  stage2Band: number;
  showSinhala: boolean;
}

// Comprehensive Dictionary for IELTS Phrases & Academic Collocations (Sinhala Meanings)
export const IELTS_SINHALA_DICTIONARY: Record<string, string> = {
  // Chart, Report & Introduction Phrases
  'the table illustrates the information on': 'වගුව මගින් ... පිළිබඳ තොරතුරු දක්වයි',
  'the table compares data regarding': 'වගුව මගින් ... පිළිබඳ දත්ත සංසන්දනය කරයි',
  'the table shows information on': 'වගුව මගින් ... පිළිබඳ තොරතුරු දක්වයි',
  'the table compares statistical data regarding': 'වගුව මගින් ... පිළිබඳ සංඛ්‍යානමය දත්ත සංසන්දනය කරයි',
  'the chart shows information on': 'ප්‍රස්තාරය මගින් ... පිළිබඳ තොරතුරු දක්වයි',
  'the chart delineates comparative figures regarding': 'ප්‍රස්තාරය මගින් ... පිළිබඳ සංසන්දනාත්මක අගයන් විස්තර කරයි',
  'the charts show': 'ප්‍රස්තාර මගින් දක්වයි',
  'the charts illustrate': 'ප්‍රස්තාර මගින් පැහැදිලිව නිරූපණය කරයි',
  'the chart shows': 'ප්‍රස්තාරය මගින් දක්වයි',
  'the chart illustrates': 'ප්‍රස්තාරය මගින් පැහැදිලිව නිරූපණය කරයි',
  'illustrates the information on': '... පිළිබඳ තොරතුරු දක්වයි',
  'compares data regarding': '... පිළිබඳ දත්ත සංසන්දනය කරයි',
  'shows the information on': '... පිළිබඳ තොරතුරු පෙන්වයි',
  'delineates data regarding': '... පිළිබඳ දත්ත විස්තර කරයි',
  'gives information about': '... පිළිබඳ තොරතුරු සපයයි',
  'give information about': '... පිළිබඳ තොරතුරු සපයයි',
  'shows information about': '... පිළිබඳ තොරතුරු පෙන්වයි',
  'provides a comparative analysis of': '... පිළිබඳ සංසන්දනාත්මක විශ්ලේෂණයක් සපයයි',
  'gives information': 'තොරතුරු සපයයි',
  'delineates statistical information': 'සංඛ්‍යානමය තොරතුරු විස්තර කරයි',
  'the diagram shows': 'සටහන මගින් පෙන්වයි',
  'the provided process diagram illustrates': 'සපයා ඇති ක්‍රියාවලි සටහන මගින් නිරූපණය කරයි',
  'how weather is forecasted in australia': 'ඕස්ට්‍රේලියාව තුළ කාලගුණය පුරෝකථනය කරන ආකාරය',
  'the systematic phases involved in meteorological forecasting across australia': 'ඕස්ට්‍රේලියාව පුරා කාලගුණ විද්‍යාත්මක පුරෝකථනයට අදාළ ක්‍රමවත් අදියරයන්',

  // Consumer, Economic & Financial Collocations
  'consumer spending': 'පාරිභෝගික වියදම් කිරීම',
  'consumer expenditure': 'පාරිභෝගික සමස්ත වියදම (ආර්ථික යෙදුම)',
  'consumer spendings': 'පාරිභෝගික වියදම් රටා',
  'household expenditure patterns': 'ගෘහස්ත වියදම් රටා',
  'spend higher money for': 'සඳහා වැඩි මුදලක් වියදම් කරයි',
  'spent higher money for': 'සඳහා වැඩි මුදලක් වියදම් කළේය',
  'allocated the largest proportion of expenditure to': 'සඳහා විශාලතම වියදම් ප්‍රතිශතය වෙන් කළේය',
  'allocated the largest share of spending to': 'සඳහා විශාලතම වියදම් පංගුව වෙන් කළේය',
  'spend lower money for': 'සඳහා අඩු මුදලක් වියදම් කරයි',
  'spent lower money for': 'සඳහා අඩු මුදලක් වියදම් කළේය',
  'allocated the smallest share of spending to': 'සඳහා අවම වියදම් පංගුව වෙන් කළේය',
  'allocated the lowest proportion to': 'සඳහා අවම ප්‍රතිශතය වෙන් කළේය',
  'spend lower percentage than other categories': 'අනෙක් කාණ්ඩ වලට වඩා අඩු ප්‍රතිශතයක් වියදම් කරයි',
  'represented the lowest proportion of overall household budgets': 'සමස්ත ගෘහස්ත අයවැයෙන් අවම ප්‍රතිශතය නියෝජනය කළේය',
  'spend more money than other countries': 'අනෙක් රටවලට වඩා වැඩි මුදලක් වියදම් කරයි',
  'recorded the highest proportion among the surveyed nations': 'සමීක්ෂණය කළ ජාතීන් අතරින් ඉහළම ප්‍රතිශතය වාර්තා කළේය',
  'spend similar range': 'සමාන පරාසයක වියදම් කරයි',
  'clustered within a narrow range of': 'සමීප පරාසයක් තුළ කාණ්ඩගත විය',
  'shows strikingly higher': 'කැපී පෙනෙන ලෙස ඉහළ අගයක් පෙන්වයි',
  'strikingly higher': 'කැපී පෙනෙන ලෙස ඉහළ',
  'recorded the highest figure, peaking at': 'ඉහළම අගය වාර්තා කරමින් උපරිමයට ළඟා විය',
  'accounted for the largest proportion of expenditure': 'වියදමෙන් විශාලතම ප්‍රතිශතය නියෝජනය කළේය',
  'shows similar spending percentage': 'සමාන වියදම් ප්‍රතිශතයක් පෙන්වයි',
  'exhibited comparable expenditure allocations of': 'සමාන වියදම් වෙන් කිරීම් ප්‍රදර්ශනය කළේය',
  'shows similar spending': 'සමාන වියදමක් පෙන්වයි',
  'allocated comparable proportions': 'සමාන ප්‍රතිශතයන් වෙන් කළේය',
  'shows similar expenditure': 'සමාන වියදමක් පෙන්වයි',
  'showed similar expenditure': 'සමාන වියදමක් පෙන්නුම් කළේය',
  'converged within a comparable range of': 'සමාන පරාසයක් තුළ එකමුතු විය',
  'converged within a narrow band of': 'සමීප පරාසයක් තුළ ඒකරාශී විය',
  'spent the lowest proportion approximately': 'ආසන්න වශයෙන් අඩුම ප්‍රතිශතය වියදම් කළේය',
  'registered the lowest individual share at approximately': 'ආසන්න වශයෙන් අවම තනි පංගුව වාර්තා කළේය',
  'spent the highest proportion than other countries': 'අනෙක් රටවලට වඩා වැඩිම ප්‍රතිශතයක් වියදම් කළේය',
  'exceeded all other nations with an expenditure of': 'වියදමකින් අනෙකුත් සියලුම ජාතීන් අභිබවා ගියේය',
  'around 5.4%': 'ආසන්න වශයෙන් 5.4% ක් පමණ',
  'a modest 5.4%': 'මධ්‍යස්ථ 5.4% ක ප්‍රමාණයක්',
  'on food and drinks': 'ආහාර පාන සඳහා',
  'on food, beverage and tobacco items': 'ආහාර, පානීය ද්‍රව්‍ය සහ දුම්කොළ අයිතම සඳහා',
  'clothing and footwear': 'ඇඳුම් සහ පාවහන්',
  'apparel and footwear': 'ඇඳුම් පැළඳුම් සහ පාවහන්',
  'leisure and education': 'විවේකය සහ අධ්‍යාපනය',
  'recreation and educational pursuits': 'විනෝදාත්මක සහ අධ්‍යාපනික කටයුතු',

  // Categories & Demographic Scope
  'different items such as': 'විවිධ අයිතම වන ...',
  'selected expenditure categories, namely': 'තෝරාගත් වියදම් කාණ්ඩ, එනම් ...',
  'different countries including': 'විවිධ රටවල් ඇතුළුව',
  'five distinct european nations, specifically': 'යුරෝපීය ජාතීන් පහක්, විශේෂයෙන්ම',
  'from all countries': 'සියලුම රටවලින්',
  'across all five examined nations': 'පරීක්ෂා කරන ලද ජාතීන් පහ පුරාම',
  'for all these countries': 'මෙම සියලු රටවල් සඳහා',
  'across all five countries': 'රටවල් පහ පුරාම',
  'owned and rented accommodation': 'අයිති සහ කුලියට ගත් නිවාස',
  'owned versus rented accommodation': 'අයිති සහ කුලී නිවාස අතර සංසන්දනය',
  'the dominant tenure at the beginning': 'ආරම්භයේදී ප්‍රමුඛතම නිවාස කාණ්ඩය',
  'overwhelmingly predominant at the outset': 'ආරම්භයේදීම ඉමහත් බහුතරයක් ලෙස පැවති',
  'the dominant tenure': 'ප්‍රමුඛතම නිවාස කාණ්ඩය',
  'overwhelmingly predominant in 1918': '1918 දී ඉමහත් බහුතරයක් ලෙස පැවති',
  'both categories were almost equal': 'කාණ්ඩ දෙකම පාහේ සමාන විය',
  'were equal at 50 percent each': 'එකක් 50% බැගින් සමාන විය',
  'reached parity at 50%': '50% හිදී සම තත්ත්වයට පත් විය (parity)',
  'around 77 percent': '77% ක් පමණ',
  'approximately 77%': 'ආසන්න වශයෙන් 77%',
  'only about 23 percent': '23% ක් පමණක්',
  'a mere 23%': 'සුළු ප්‍රමාණයක් වන 23% ක්',
  'next few decades': 'ඊළඟ දශක කිහිපය',
  'subsequent five decades': 'ඉදිරි දශක පහක කාලය',

  // Overview & Cohesive Transitions
  'overall, from these categories the noticeable information is': 'සමස්තයක් ලෙස, මෙම කාණ්ඩ වලින් කැපී පෙනෙන තොරතුර නම්',
  'overall, it is immediately apparent that': 'සමස්තයක් ලෙස, ක්ෂණිකවම පැහැදිලි වන්නේ',
  'overall, it can be seen that': 'සමස්තයක් ලෙස දැකගත හැක්කේ',
  'overall, a macroscopic analysis reveals that': 'සමස්තයක් ලෙස පුළුල් විශ්ලේෂණයකින් හෙළි වන්නේ',
  'the noticeable information is': 'කැපී පෙනෙන තොරතුර නම්',
  'the most conspicuous feature is that': 'වඩාත්ම කැපී පෙනෙන ලක්ෂණය වන්නේ',
  'what is remarkable': 'කැපී පෙනෙන කරුණක් නම්',
  'remarkably,': 'විශේෂයෙන් කැපී පෙනෙන පරිදි,',
  'in addition to that': 'ඊට අමතරව',
  'additionally,': 'තවද / මීට අමතරව,',
  'it is noticeable that': 'කැපී පෙනෙන කරුණක් නම්',
  'evidently,': 'පැහැදිලිවම පෙනෙන පරිදි,',
  'it is clear that': 'පැහැදිලි වන්නේ',
  'the data reveals that': 'දත්ත වලින් හෙළි වන්නේ',
  'the data reveals a dramatic structural inversion:': 'දත්ත මගින් නාටකාකාර ව්‍යුහාත්මක පෙරළියක් හෙළි කරයි:',
  'apart from that': 'ඊට අමතරව / එය හැරුණු විට',
  'in sharp contrast,': 'පැහැදිලි ප්‍රතිවිරෝධයක් ලෙස / ඊට හාත්පසින්ම වෙනස්ව,',
  'lastly': 'අවසාන වශයෙන්',
  'finally, turning to': 'අවසාන වශයෙන්, ... දෙසට අවධානය යොමු කිරීමේදී',
  'lastly consumers spend their money on': 'අවසාන වශයෙන් පාරිභෝගිකයන් තම මුදල් වියදම් කරන්නේ',
  'finally, regarding consumer spending on': 'අවසාන වශයෙන්, පාරිභෝගික වියදම් පිළිබඳ සලකා බැලීමේදී',

  // Trend & Statistical Movement
  'increased a lot': 'ගොඩක් වැඩි විය',
  'experienced a dramatic surge': 'නාටකාකාර දැවැන්ත වර්ධනයක් අත්විඳින ලදී',
  'increased significantly': 'සැලකිය යුතු ලෙස වැඩි විය',
  'experienced an enduring upward trajectory': 'දිගුකාලීන අඛණ්ඩ වර්ධනයක් අත්විඳින ලදී',
  'went up gradually': 'ක්‍රමයෙන් ඉහළ ගියේය',
  'increased steadily': 'නොකඩවා ස්ථාවරව ඉහළ ගියේය',
  'went up a lot': 'ඉහළ ගියේය',
  'escalated substantially': 'සැලකිය යුතු ලෙස ඉහළ ගියේය',
  'went down': 'පහළ ගියේය',
  'witnessed a marked decline': 'කැපී පෙනෙන පහත වැටීමක් දක්නට ලැබිණි',
  'decreased steadily': 'ක්‍රමයෙන් අඩු විය',
  'exhibited a persistent downward trajectory': 'නොකඩවා පහළ යන ප්‍රවණතාවක් ප්‍රදර්ශනය කළේය',
  'decreased continuously until 2001': '2001 දක්වා අඛණ්ඩව අඩු විය',
  'declined continuously over the same timeframe': 'එම කාලසීමාව පුරාම අඛණ්ඩව පහත වැටුණි',
  'fell to 64 percent': '64% දක්වා පහළ වැටුණි',
  'contracted marginally to 64%': 'සුළු වශයෙන් 64% දක්වා අඩු විය (contracted marginally)',
  'did not change': 'වෙනස් නොවීය',
  'remained largely static': 'බොහෝ දුරට ස්ථාවරව පැවතුණි',
  'reach a peak': 'උපරිමයට ළඟා වීම',
  'culminate in a peak of': 'උපරිම අගයකට ළඟා වීම',
  'reached a peak': 'උපරිමයට ළඟා විය',
  'culminated in a peak of': 'උපරිම අගයකට ළඟා විය',
  'reached a peak in 2001 at about 69 percent': '2001 දී 69% ක පමණ උපරිමයකට ළඟා විය',
  'culminated in a peak of 69% in 2001': '2001 දී 69% ක උපරිම අගයකට ළඟා විය',
  'reached a low of': 'අවම අගයකට ළඟා විය',
  'bottomed out at': 'අවම මට්ටමට පත් විය',
  'bottomed out at 31% in 2001': '2001 දී 31% ක අවම මට්ටමකට පත් විය',
  'renting increased again to 36 percent': 'කුලියට ගැනීම නැවත 36% දක්වා වැඩි විය',
  'this trend reversed slightly with rentals recovering to 36%': 'කුලී නිවාස 36% දක්වා යථා තත්ත්වයට පත්වෙමින් ප්‍රවණතාව මඳක් ආපසු හැරුණි',
  'was the highest': 'ඉහළම එක විය',
  'stood as the dominant category': 'ප්‍රමුඛතම කාණ්ඩය ලෙස පැවතුණි',
  'was the lowest': 'අඩුම එක විය',
  'registered the lowest overall share': 'සමස්ත අවම පංගුව වාර්තා කළේය',
  'big difference': 'ලොකු වෙනසක්',
  'marked disparity': 'කැපී පෙනෙන විෂමතාවයක්',
  'more and more': 'වැඩි වැඩියෙන්',
  'an increasingly prominent share of': 'වඩාත් කැපී පෙනෙන පංගුවක්',

  // Task 2 Vocabulary & Concepts
  'big': 'විශාල / ලොකු',
  'significant': 'සැලකිය යුතු / ප්‍රබල',
  'substantial': 'සැලකිය යුතු ප්‍රමාණයක්',
  'study what they like': 'තමන් කැමති දේ ඉගෙන ගැනීම',
  'be free to study whatever they enjoy': 'තමන් ප්‍රිය කරන ඕනෑම විෂයක් හැදෑරීමට නිදහස තිබීම',
  'other people': 'අනෙක් මිනිසුන්',
  'others': 'අනෙක් අය',
  'must': 'අනිවාර්යයෙන්ම කළ යුතුය (දැඩි ප්‍රකාශය)',
  'should': 'කළ යුතුය (සමබර ශාස්ත්‍රීය නිර්දේශය)',
  'useful subjects like': 'ප්‍රයෝජනවත් විෂයන් වන',
  'subjects with clear practical value, such as': 'පැහැදිලි ප්‍රායෝගික වටිනාකමක් සහිත විෂයන්, එනම්',
  'give my opinion': 'මගේ අදහස දීම',
  'explain why i believe': 'මා එසේ විශ්වාස කරන්නේ මන්දැයි පැහැදිලි කිරීම',
  'will work hard and get good marks': 'වෙහෙස මහන්සි වී හොඳ ලකුණු ලබා ගනීවි',
  'are likely to work harder and achieve higher grades': 'වඩා වෙහෙස මහන්සි වී ඉහළ ශ්‍රේණි ලබා ගැනීමට වැඩි ඉඩකඩක් ඇත',
  'loves': 'ආදරය කරයි (වර්තමාන කාලය)',
  'has always loved': 'සැමවිටම ප්‍රිය කර ඇත (Present Perfect)',
  'successful graphic': 'සාර්ථක ග්‍රැෆික් නිර්මාණකරුවෙක්',
  'successful graphic designer': 'සාර්ථක ග්‍රැෆික් නිර්මාණ ශිල්පියෙක් (විශේෂිත)',
  'think': 'සිතනවා (කතාබහේ වචනයක්)',
  'argue that': 'තර්ක කරනවා (ශාස්ත්‍රීය)',
  'give many jobs': 'රැකියා ගොඩක් දෙනවා',
  'create a large number of well-paid jobs': 'ඉහළ වැටුප් සහිත රැකියා විශාල ප්‍රමාණයක් බිහි කිරීම',
  'good points': 'හොඳ කරුණු',
  'valid arguments': 'වලංගු සහ පදනම් සහිත තර්ක',
  'about jobs': 'රැකියා ගැන',
  'carefully about their future employment': 'තම අනාගත රැකියා අවස්ථා පිළිබඳව සැලකිලිමත්ව',
  'should balance both sides': 'දෙපැත්තම සමබර කළ යුතුයි',
  'i think': 'මම හිතන්නේ (අනවශ්‍ය පුද්ගලික ප්‍රකාශයක්)',
  'in my view': 'මගේ දෘෂ්ටිකෝණයට අනුව',
  'in my view,': 'මගේ දෘෂ්ටිකෝණයට අනුව,',
  'why adults study': 'වැඩිහිටියන් ඉගෙන ගන්නේ ඇයිද යන්න',
  'the primary motivations prompting adult learners to pursue further education': 'වැඩිහිටි ඉගෙනුම්කරුවන් උසස් අධ්‍යාපනය කරා යොමු කරන ප්‍රධාන පෙළඹවීම්',
  'who should pay the costs': 'වියදම් ගෙවිය යුත්තේ කවුරුන්ද යන්න',
  'public consensus regarding the equitable distribution of course funding': 'පාඨමාලා අරමුදල් සාධාරණව බෙදී යාම පිළිබඳ මහජන එකඟතාව',
  'helpful for current job': 'වත්මන් රැකියාවට ප්‍රයෝජනවත්',
  'vocational relevance to current employment': 'වත්මන් රැකියාවට ඇති වෘත්තීයමය අදාළත්වය',
  'to improve prospects of promotion': 'උසස්වීම් අවස්ථා වැඩි දියුණු කර ගැනීමට',
  'securing vertical career advancement': 'වෘත්තීයමය වශයෙන් ඉහළ උසස්වීම් සුරක්ෂිත කර ගැනීම',
  'enjoy learning': 'ඉගෙනීමට ප්‍රිය කිරීම',
  'recreational knowledge acquisition': 'විනෝදාත්මක ලෙස දැනුම අත්පත් කර ගැනීම',
  'able to change jobs': 'රැකියා මාරු කිරීමට හැකි වීම',
  'facilitating a professional career transition': 'වෘත්තීය ක්ෂේත්‍ර මාරුවක් පහසු කර ගැනීම',
  'people think': 'මිනිසුන් සිතනවා',
  'respondents advocated that': 'සමීක්ෂණයට පිළිතුරු දුන් අය යෝජනා කළේ',
  'individual should pay': 'පුද්ගලයා විසින් ගෙවිය යුතුයි',
  'learners themselves should shoulder': 'ඉගෙනුම්කරුවන් විසින්ම දැරිය යුතුයි',
  'taxpayer should pay': 'බදු ගෙවන්නා ගෙවිය යුතුයි',
  'the state should finance': 'රජය විසින් මූල්‍ය ප්‍රතිපාදන සැපයිය යුතුයි',
  'employer should pay': 'සේවායෝජකයා ගෙවිය යුතුයි',
  'commercial enterprises should contribute': 'වාණිජ ව්‍යාපාර දායක විය යුතුයි',
  'main reasons': 'ප්‍රධාන හේතු',
  'predominant catalysts': 'ප්‍රමුඛතම උත්ප්‍රේරක / ප්‍රධාන හේතු සාධක',
  'in the modern world': 'නූතන ලෝකයේ',
  'in contemporary globalized society': 'සමකාලීන ගෝලීයකරණය වූ සමාජයේ',
  'more and more serious': 'වැඩි වැඩියෙන් බරපතල',
  'increasingly acute and multifaceted': 'වඩාත් උග්‍ර සහ බහුවිධ වූ',
  'disagree with this opinion': 'මෙම මතය සමඟ එකඟ නොවෙමි',
  'strongly dispute this contention': 'මෙම තර්කය දැඩි ලෙස ප්‍රතික්ෂේප කරමි',
  'cost of living will increase': 'ජීවන වියදම වැඩි වේවි',
  'household expenditures escalate drastically': 'ගෘහස්ත වියදම් සීඝ්‍රයෙන් ඉහළ යනු ඇත',
  'protect the environment': 'පරිසරය ආරක්ෂා කිරීම',
  'safeguard ecological integrity': 'පාරිසරික අඛණ්ඩතාව සහ සුරක්ෂිතතාව රැක ගැනීම',
  'rich countries have plenty of money': 'ධනවත් රටවලට සල්ලි ගොඩක් තියෙනවා',
  'affluent industrialized nations command substantial fiscal capital': 'ධනවත් කාර්මික රටවල් සැලකිය යුතු මූල්‍ය ප්‍රාග්ධනයක් පාලනය කරයි',
  'footballers and basketball players earn too much money': 'පාපන්දු සහ පැසිපන්දු ක්‍රීඩකයින් ඕනෑවට වඩා මුදල් උපයනවා',
  'elite professional athletes receive disproportionately exorbitant financial compensation': 'ප්‍රභූ වෘත්තීය මලල ක්‍රීඩකයින් අසමානුපාතික ලෙස අධික මූල්‍ය වන්දියක් ලබයි',
  'doctors save lives and teachers educate children': 'වෛද්‍යවරු ජීවිත බේරනවා ගුරුවරු ළමයින්ට උගන්වනවා',
  'healthcare practitioners preserve human life whilst educators foster essential civic and intellectual capital': 'සෞඛ්‍ය වෘත්තිකයන් මිනිස් ජීවිත සුරකින අතර අධ්‍යාපනඥයන් අත්‍යවශ්‍ය සමාජ හා බුද්ධිමය ප්‍රාග්ධනය පෝෂණය කරයි',
  'university is very expensive nowadays': 'මේ දිනවල විශ්වවිද්‍යාලය ඉතා මිල අධිකය',
  'tertiary education imposes an onerous financial commitment in contemporary society': 'තෘතියික අධ්‍යාපනය සමකාලීන සමාජය තුළ දැඩි මූල්‍ය බරක් පටවයි',
  'computers are used in many places today': 'අද බොහෝ තැන්වල පරිගණක භාවිත වේ',
  'computational and digital technologies have thoroughly permeated contemporary commerce and education': 'ගණනය කිරීමේ සහ ඩිජිටල් තාක්ෂණයන් සමකාලීන වාණිජ්‍ය හා අධ්‍යාපනය පුරා ගැඹුරින් ව්‍යාප්ත වී ඇත'
};

// Comprehensive Examiner Knowledge Base for IELTS Academic Upgrades
const UPGRADE_EXPLANATIONS: Record<string, {
  criterion: 'LR' | 'TR' | 'CC' | 'GRA';
  originalMeaningSi?: string;
  upgradedMeaningSi?: string;
  critique: string;
  critiqueSi?: string;
  value: string;
  valueSi?: string;
}> = {
  // Universal Task 1 Table & Report Upgrades
  'The table illustrates the information on': {
    criterion: 'LR',
    originalMeaningSi: 'වගුව මගින් ... පිළිබඳ තොරතුරු දක්වයි',
    upgradedMeaningSi: 'වගුව මගින් ... පිළිබඳ දත්ත සංසන්දනය කරයි',
    critique: '"The table illustrates the information on" is repetitive and wordy. Formal Task 1 reports use concise synthesis such as "The table compares data regarding".',
    critiqueSi: '"The table illustrates the information on" යනු අනවශ්‍ය ලෙස දිගු හැඳින්වීමකි.',
    value: 'Replaces wordy opening with concise, high-impact comparative verb "The table compares data regarding" (LR Band 8).',
    valueSi: 'විධිමත් වාර්තාකරණ ක්‍රියාපදයක් යොදා LR ලකුණු ඉහළ නංවයි.'
  },
  'consumer spending': {
    criterion: 'LR',
    originalMeaningSi: 'පාරිභෝගික වියදම් කිරීම',
    upgradedMeaningSi: 'පාරිභෝගික සමස්ත වියදම (ආර්ථික යෙදුම)',
    critique: '"consumer spending" is standard conversational register. Academic economic reports prefer "consumer expenditure" or "household expenditure".',
    critiqueSi: '"consumer spending" වෙනුවට වඩාත් ශාස්ත්‍රීය ආර්ථික විද්‍යාත්මක යෙදුමක් වන "consumer expenditure" යෙදිය හැක.',
    value: 'Upgrades to authentic macroeconomic collocation "consumer expenditure" (LR Band 8.5).',
    valueSi: '"consumer expenditure" යන විධිමත් ආර්ථික යෙදුම භාවිත කරයි.'
  },
  'different items such as': {
    criterion: 'LR',
    originalMeaningSi: 'විවිධ අයිතම වන ...',
    upgradedMeaningSi: 'තෝරාගත් වියදම් කාණ්ඩ, එනම් ...',
    critique: '"different items such as" is informal conversational phrasing.',
    critiqueSi: 'උදාහරණ දැක්වීමට යොදා ඇති සරල යෙදුමකි.',
    value: 'Upgrades to formal exemplar syntax "selected expenditure categories, namely" (+LR Band 8).',
    valueSi: 'විධිමත් වර්ගීකරණ යෙදුමක් යොදා LR ලකුණු ඉහළ නංවයි.'
  },
  'different countries including': {
    criterion: 'TR',
    originalMeaningSi: 'විවිධ රටවල් ඇතුළුව',
    upgradedMeaningSi: 'යුරෝපීය ජාතීන් පහක්, විශේෂයෙන්ම',
    critique: '"different countries including" misses the opportunity for analytical geographical categorization.',
    critiqueSi: 'රටවල් සමූහය පිළිබඳ වඩාත් නිශ්චිත භූගෝලීය වර්ගීකරණයක් ඉදිරිපත් කළ හැක.',
    value: 'Upgrades to "five distinct European nations, specifically", establishing clear analytical scope (+TR).',
    valueSi: 'නිශ්චිත භූගෝලීය රාමුවක් දක්වා Task Achievement ශක්තිමත් කරයි.'
  },
  'Overall, from these categories the noticeable information is': {
    criterion: 'CC',
    originalMeaningSi: 'සමස්තයක් ලෙස, මෙම කාණ්ඩ වලින් කැපී පෙනෙන තොරතුර නම්',
    upgradedMeaningSi: 'සමස්තයක් ලෙස, ක්ෂණිකවම පැහැදිලි වන්නේ',
    critique: 'Clunky, low-content transition phrase that delays the author\'s main overview insight.',
    critiqueSi: 'ප්‍රධාන ප්‍රවණතාව හඳුන්වා දීමට පෙර අනවශ්‍ය දිගු වාක්‍ය ඛණ්ඩයක් යෙදීමකි.',
    value: 'Upgrades to authoritative Band 8 overview formula "Overall, it is immediately apparent that" (+CC).',
    valueSi: 'විධිමත් Band 8 Overview ආරම්භයක් යොදා Coherence (CC) ඉහළ නංවයි.'
  },
  'strikingly higher': {
    criterion: 'LR',
    originalMeaningSi: 'කැපී පෙනෙන ලෙස ඉහළ',
    upgradedMeaningSi: 'වියදමෙන් විශාලතම ප්‍රතිශතය නියෝජනය කළේය',
    critique: '"strikingly higher" without an economic noun creates an incomplete, awkward comparative.',
    critiqueSi: 'සංසන්දනාත්මක ඉදිරිපත් කිරීමේදී අසම්පූර්ණ යෙදුමකි.',
    value: 'Upgrades to authentic economic idiom "accounted for the largest proportion of expenditure" (LR Band 8).',
    valueSi: 'විශාලතම වියදම් ප්‍රතිශතය විධිමත් ලෙස විස්තර කරයි.'
  },
  'spend lower percentage than other categories': {
    criterion: 'TR',
    originalMeaningSi: 'අනෙක් කාණ්ඩ වලට වඩා අඩු ප්‍රතිශතයක් වියදම් කරයි',
    upgradedMeaningSi: 'සමස්ත ගෘහස්ත අයවැයෙන් අවම ප්‍රතිශතය නියෝජනය කළේය',
    critique: 'Superficial phrasing with grammatical awkwardness ("spend lower percentage").',
    critiqueSi: 'අවම වියදම සරල ලෙස විස්තර කිරීමකි.',
    value: 'Upgrades to "represented the lowest proportion of overall household budgets", fulfilling Band 8 Task Achievement.',
    valueSi: 'අවම පංගුව පිළිබඳ නිවැරදි ආර්ථික විද්‍යාත්මක වාර්තාකරණය (+TR & LR).'
  },
  'In addition to that': {
    criterion: 'CC',
    originalMeaningSi: 'ඊට අමතරව',
    upgradedMeaningSi: 'තවද / මීට අමතරව,',
    critique: '"In addition to that" is a mechanical, repetitive linker common in lower-band writing.',
    critiqueSi: '"In addition to that" යනු නිතර භාවිතා වන සරල සංක්‍රාන්ති යෙදුමකි.',
    value: 'Replaces with concise, elegant transition "Additionally," improving Coherence & Cohesion (CC).',
    valueSi: '"Additionally," යොදා වාක්‍ය අතර තාර්කික සම්බන්ධය වඩාත් සංක්ෂිප්ත කරයි.'
  },
  'It is noticeable that': {
    criterion: 'CC',
    originalMeaningSi: 'කැපී පෙනෙන කරුණක් නම්',
    upgradedMeaningSi: 'පැහැදිලිවම පෙනෙන පරිදි,',
    critique: 'Overused formulaic announcement that adds word count without analytical substance.',
    critiqueSi: 'අනවශ්‍ය ලෙස වචන වැඩි කරන සරල හැඳින්වීමකි.',
    value: 'Replaces with sharp academic discourse adverb "Evidently," enhancing stylistic maturity (+CC).',
    valueSi: '"Evidently," යන විධිමත් ශාස්ත්‍රීය යෙදුම භාවිත කරයි.'
  },
  'shows similar spending percentage': {
    criterion: 'LR',
    originalMeaningSi: 'සමාන වියදම් ප්‍රතිශතයක් පෙන්වයි',
    upgradedMeaningSi: 'සමාන වියදම් වෙන් කිරීම් ප්‍රදර්ශනය කළේය',
    critique: 'Basic arithmetic description lacking academic statistical register.',
    critiqueSi: 'සරල ගණිතමය විස්තර කිරීමකි.',
    value: 'Upgrades to "exhibited comparable expenditure allocations of" (LR Band 8).',
    valueSi: 'සංඛ්‍යානමය දත්ත විධිමත් ලෙස සංසන්දනය කරයි.'
  },
  'shows similar expenditure': {
    criterion: 'LR',
    originalMeaningSi: 'සමාන වියදමක් පෙන්වයි',
    upgradedMeaningSi: 'සමාන පරාසයක් තුළ එකමුතු විය',
    critique: 'Generic reporting verb combination.',
    critiqueSi: 'සාමාන්‍ය වාර්තාකරණ යෙදුමකි.',
    value: 'Upgrades to "converged within a comparable range of", showcasing sophisticated trend synthesis.',
    valueSi: 'දත්ත අතර සමානකම් ගැඹුරින් සංසන්දනය කරයි.'
  },
  'Apart from that': {
    criterion: 'CC',
    originalMeaningSi: 'ඊට අමතරව / එය හැරුණු විට',
    upgradedMeaningSi: 'පැහැදිලි ප්‍රතිවිරෝධයක් ලෙස / ඊට හාත්පසින්ම වෙනස්ව,',
    critique: '"Apart from that" is casual spoken English unsuitable for introducing a major contrast in formal reports.',
    critiqueSi: '"Apart from that" යනු කතාබහේදී යෙදෙන සරල වචනයකි.',
    value: 'Replaces with authoritative academic transition "In sharp contrast,", lifting Coherence to Band 8.',
    valueSi: '"In sharp contrast," යොදා ප්‍රබල වෙනසක් විධිමත් ලෙස දක්වයි.'
  },
  'Lastly': {
    criterion: 'CC',
    originalMeaningSi: 'අවසාන වශයෙන්',
    upgradedMeaningSi: 'අවසාන වශයෙන්, ... දෙසට අවධානය යොමු කිරීමේදී',
    critique: '"Lastly" sounds informal and abrupt at the start of a final data category paragraph.',
    critiqueSi: '"Lastly" යනු ලිඛිත වාර්තාවකට වඩා කතාවට ගැළපෙන සරල වචනයකි.',
    value: 'Upgrades to formal report transition "Finally, turning to", providing professional structural flow.',
    valueSi: '"Finally, turning to" යොදා අවසන් ඡේදය විධිමත් ලෙස ආරම්භ කරයි.'
  },
  'spend more money than other countries': {
    criterion: 'TR',
    originalMeaningSi: 'අනෙක් රටවලට වඩා වැඩි මුදලක් වියදම් කරයි',
    upgradedMeaningSi: 'සමීක්ෂණය කළ ජාතීන් අතරින් ඉහළම ප්‍රතිශතය වාර්තා කළේය',
    critique: 'Everyday spoken phrasing ("spend more money") that misses statistical register.',
    critiqueSi: '"spend more money" යනු කතාබහේ සරල යෙදුමකි.',
    value: 'Upgrades to "recorded the highest proportion among the surveyed nations", fulfilling Band 8 Task Achievement.',
    valueSi: 'සමීක්ෂණයට ලක්වූ රටවල් අතර ඉහළම ප්‍රතිශතය නිවැරදිව දක්වයි.'
  },
  'spend similar range': {
    criterion: 'LR',
    originalMeaningSi: 'සමාන පරාසයක වියදම් කරයි',
    upgradedMeaningSi: 'සමීප පරාසයක් තුළ කාණ්ඩගත විය',
    critique: 'Unnatural collocation in English ("spend similar range").',
    critiqueSi: 'ඉංග්‍රීසි භාෂාවේ අස්වාභාවික වචන සංයෝජනයකි.',
    value: 'Upgrades to authentic statistical collocation "clustered within a narrow range of" (LR Band 8).',
    valueSi: '"clustered within a narrow range" යන උසස් සංඛ්‍යානමය යෙදුම භාවිත කරයි.'
  },
  'around 5.4%': {
    criterion: 'LR',
    originalMeaningSi: 'ආසන්න වශයෙන් 5.4% ක් පමණ',
    upgradedMeaningSi: 'මධ්‍යස්ථ 5.4% ක ප්‍රමාණයක්',
    critique: '"around" is an informal spoken approximation.',
    critiqueSi: '"around" යනු කතාබහේදී යොදන සරල වචනයකි.',
    value: 'Upgrades to analytical evaluative phrase "a modest 5.4%" (+LR & TR).',
    valueSi: '"a modest 5.4%" යොදා දත්තයේ ප්‍රමාණය වඩාත් නිවැරදිව අර්ථ දක්වයි.'
  },
  // Task 1: Chart, Data, and Trend Reporting Upgrades
  'gives information about': {
    criterion: 'LR',
    originalMeaningSi: '... පිළිබඳ තොරතුරු සපයයි',
    upgradedMeaningSi: 'පැහැදිලිව නිරූපණය කරයි (illustrates)',
    critique: '"gives information about" is an elementary, repetitive introductory formula. Academic Task 1 requires precise reporting verbs like "illustrates" or "delineates".',
    critiqueSi: '"gives information about" යනු සරල යෙදුමකි. ඒ වෙනුවට "illustrates" වැනි ශාස්ත්‍රීය වාර්තාකරණ ක්‍රියාපදයක් යොදන්න.',
    value: 'Replaces generic introduction with formal reporting verb "illustrates", setting an immediate Band 8 tone for Lexical Resource.',
    valueSi: 'විධිමත් වාර්තාකරණ ක්‍රියාපදයක් යොදා ආරම්භයේදීම LR ලකුණු ඉහළ නංවයි.'
  },
  'give information about': {
    criterion: 'LR',
    originalMeaningSi: '... පිළිබඳ තොරතුරු සපයයි',
    upgradedMeaningSi: 'පැහැදිලිව නිරූපණය කරයි (illustrates)',
    critique: '"give information about" is an elementary, repetitive introductory formula. Academic Task 1 requires precise reporting verbs like "illustrates" or "delineates".',
    critiqueSi: '"give information about" යනු සරල යෙදුමකි. ඒ වෙනුවට "illustrates" වැනි ශාස්ත්‍රීය වාර්තාකරණ ක්‍රියාපදයක් යොදන්න.',
    value: 'Replaces generic introduction with formal reporting verb "illustrates", setting an immediate Band 8 tone for Lexical Resource.',
    valueSi: 'විධිමත් වාර්තාකරණ ක්‍රියාපදයක් යොදා ආරම්භයේදීම LR ලකුණු ඉහළ නංවයි.'
  },
  'owned and rented accommodation': {
    criterion: 'LR',
    originalMeaningSi: 'අයිති සහ කුලියට ගත් නිවාස',
    upgradedMeaningSi: 'අයිති සහ කුලී නිවාස අතර සංසන්දනය',
    critique: 'Directly repeats the prompt vocabulary without demonstrating candidate comparative paraphrasing skills.',
    critiqueSi: 'ප්‍රශ්නයේ ඇති වචන ඒ ආකාරයෙන්ම නැවත යෙදීමකි.',
    value: 'Upgrades to "owned versus rented accommodation", introducing sharp comparative structure for Lexical Resource Band 8.',
    valueSi: '"versus" යොදා සංසන්දනාත්මක ඉදිරිපත් කිරීම ශක්තිමත් කරයි.'
  },
  'it is clear that': {
    criterion: 'CC',
    originalMeaningSi: 'පැහැදිලි වන්නේ',
    upgradedMeaningSi: 'දත්ත වලින් හෙළි වන ප්‍රධාන හැරවුම් ලක්ෂ්‍යය නම්',
    critique: '"it is clear that" is an overused cliché. Band 8+ examiners look for mature, analytical discourse markers.',
    critiqueSi: '"it is clear that" යනු නිතර භාවිතා වන සරල යෙදුමකි.',
    value: 'Upgrades to "the data reveals a dramatic structural inversion:", establishing scholarly coherence and authorial stance.',
    valueSi: 'දත්තවල ප්‍රධාන හැරවුම් ලක්ෂ්‍යය විධිමත් ලෙස විස්තර කරමින් Coherence (CC) ඉහළ නංවයි.'
  },
  'the dominant tenure': {
    criterion: 'LR',
    originalMeaningSi: 'ප්‍රමුඛතම නිවාස කාණ්ඩය',
    upgradedMeaningSi: '1918 දී ඉමහත් බහුතරයක් ලෙස පැවති',
    critique: '"the dominant tenure" can be expressed with greater lexical sophistication.',
    critiqueSi: 'වඩාත් ගැඹුරු ශාස්ත්‍රීය වචනයක් යෙදිය හැක.',
    value: 'Replaces with "overwhelmingly predominant in 1918", exhibiting advanced vocabulary range (LR Band 8).',
    valueSi: '"overwhelmingly predominant" යොදා LR ලකුණු ඉහළ නංවයි.'
  },
  'increased significantly': {
    criterion: 'LR',
    originalMeaningSi: 'සැලකිය යුතු ලෙස වැඩි විය',
    upgradedMeaningSi: 'දිගුකාලීන අඛණ්ඩ වර්ධනයක් අත්විඳින ලදී',
    critique: 'Standard adverb-verb combination that misses the opportunity to capture an enduring 93-year historical trajectory.',
    critiqueSi: 'සාමාන්‍ය යෙදුමකි. දීර්ඝකාලීන ප්‍රවණතාවක් විස්තර කිරීමට වඩාත් සුදුසු වචන ඇත.',
    value: 'Upgrades to "experienced an enduring upward trajectory", demonstrating exceptional academic collocation (LR Band 8.5).',
    valueSi: 'වසර 93 ක දිගුකාලීන වර්ධනය පෙන්වීමට "enduring upward trajectory" යොදා ගනී.'
  },
  'both categories were almost equal': {
    criterion: 'TR',
    originalMeaningSi: 'කාණ්ඩ දෙකම පාහේ සමාන විය',
    upgradedMeaningSi: '1971 දී කුලී නිවාස අභිබවා ගොස් අවසානයේ මඳක් අඩු විය',
    critique: 'FATAL FACTUAL INACCURACY: In 2011, home ownership was 64% and renting was 36% (a 28% difference!). Claiming they were equal at the end caps Task Achievement at Band 6.',
    critiqueSi: 'මාරාන්තික දත්ත වරදක්: 2011 දී නිවාස හිමිකම 64% ක් වූ අතර කුලිය 36% ක් විය. ඒවා සමාන වූයේ 1971 දීය. මෙම වරද නිසා TA ලකුණු Band 6 ට සීමා වේ.',
    value: 'Replaces factual error with accurate synthesis: "Home ownership eventually surpassed rental accommodation in 1971, before receding slightly in the final decade", securing Band 8.5 Task Achievement.',
    valueSi: '1971 සමාන වූ වසර සහ 2011 සත්‍ය දත්ත නිවැරදිව දක්වා Task Achievement ලකුණු Band 8.5 දක්වා ඉහළ නංවයි.'
  },
  'around 77 percent': {
    criterion: 'LR',
    originalMeaningSi: '77% ක් පමණ',
    upgradedMeaningSi: 'ආසන්න වශයෙන් 77% (විධිමත්)',
    critique: '"around" is informal conversational English.',
    critiqueSi: '"around" යනු කතාබහේදී යොදන සරල වචනයකි.',
    value: 'Upgrades to formal academic approximation "approximately 77%".',
    valueSi: 'විධිමත් ශාස්ත්‍රීය යෙදුමක් වන "approximately 77%" යෙදීම.'
  },
  'only about 23 percent': {
    criterion: 'LR',
    originalMeaningSi: '23% ක් පමණක්',
    upgradedMeaningSi: 'සුළු ප්‍රමාණයක් වන 23% ක්',
    critique: '"only about" is casual speech phrasing.',
    critiqueSi: '"only about" යනු කතාබහේදී යොදන සරල යෙදුමකි.',
    value: 'Upgrades to "a mere 23%", adding analytical evaluative depth to the comparison (+LR).',
    valueSi: '"a mere 23%" යොදා සංසන්දනය වඩාත් ආකර්ෂණීය කරයි.'
  },
  'next few decades': {
    criterion: 'TR',
    originalMeaningSi: 'ඊළඟ දශක කිහිපය',
    upgradedMeaningSi: 'ඉදිරි දශක පහක කාලය',
    critique: '"next few decades" is chronologically vague about the timeframe between 1918 and 1971.',
    critiqueSi: '"next few decades" යනු කාලය පිළිබඳ පැහැදිලි නොවන යෙදුමකි.',
    value: 'Specifies exact historical period: "subsequent five decades", demonstrating analytical precision (+TR).',
    valueSi: 'වසර 50 ක කාලය "subsequent five decades" ලෙස නිශ්චිතව දක්වයි.'
  },
  'went up gradually': {
    criterion: 'LR',
    originalMeaningSi: 'ක්‍රමයෙන් ඉහළ ගියේය',
    upgradedMeaningSi: 'නොකඩවා ස්ථාවරව ඉහළ ගියේය',
    critique: '"went up" is a basic phrasal verb discouraged in formal IELTS Academic reports.',
    critiqueSi: '"went up" යනු සරල phrasal verb එකකි. ශාස්ත්‍රීය රචනා සඳහා එය නුසුදුසුය.',
    value: 'Replaces phrasal verb with formal academic collocation "increased steadily" (LR Band 8).',
    valueSi: 'විධිමත් ශාස්ත්‍රීය යෙදුමක් වන "increased steadily" භාවිත කරයි.'
  },
  'were equal at 50 percent each': {
    criterion: 'LR',
    originalMeaningSi: 'එකක් 50% බැගින් සමාන විය',
    upgradedMeaningSi: '50% හිදී සම තත්ත්වයට පත් විය (reached parity)',
    critique: 'Basic arithmetic description lacking statistical register.',
    critiqueSi: 'සරල ගණිතමය විස්තර කිරීමකි.',
    value: 'Upgrades to "reached parity at 50%", showcasing authentic academic and statistical terminology (LR Band 8).',
    valueSi: '"reached parity" යන උසස් සංඛ්‍යානමය යෙදුම භාවිත කරයි.'
  },
  'reached a peak in 2001 at about 69 percent': {
    criterion: 'LR',
    originalMeaningSi: '2001 දී 69% ක පමණ උපරිමයකට ළඟා විය',
    upgradedMeaningSi: '2001 දී 69% ක උපරිම අගයකට ළඟා විය (culminated in a peak)',
    critique: 'Basic verb-noun collocation for a milestone high point.',
    critiqueSi: 'සාමාන්‍ය වචන සංයෝජනයකි.',
    value: 'Upgrades to "culminated in a peak of 69% in 2001", an exemplary Band 8 collocation (+LR).',
    valueSi: '"culminated in a peak of" යන Band 8 මට්ටමේ උසස් යෙදුම භාවිත කරයි.'
  },
  'decreased continuously until 2001': {
    criterion: 'CC',
    originalMeaningSi: '2001 දක්වා අඛණ්ඩව අඩු විය',
    upgradedMeaningSi: 'එම කාලසීමාව පුරාම අඛණ්ඩව පහත වැටුණි',
    critique: 'Repetitive trend verbs across paragraphs weaken lexical cohesion.',
    critiqueSi: 'එකම වචන නැවත නැවත යෙදීමෙන් වාක්‍ය විවිධත්වය අඩු වේ.',
    value: 'Upgrades to "declined continuously over the same timeframe", establishing elegant parallel cohesion (+CC & LR).',
    valueSi: '"declined continuously" යොදා වචන විවිධත්වය සහ Cohesion වැඩි කරයි.'
  },
  'reached a low of': {
    criterion: 'LR',
    originalMeaningSi: 'අවම අගයකට ළඟා විය',
    upgradedMeaningSi: '2001 දී 31% ක අවම මට්ටමකට පත් විය (bottomed out)',
    critique: '"reached a low" is a basic idiom.',
    critiqueSi: '"reached a low" යනු සරල යෙදුමකි.',
    value: 'Upgrades to authentic economic idiom "bottomed out at 31% in 2001" (LR Band 8).',
    valueSi: '"bottomed out at" යන නිවැරදි ආර්ථික විද්‍යාත්මක යෙදුම භාවිත කරයි.'
  },
  'renting increased again to 36 percent': {
    criterion: 'TR',
    originalMeaningSi: 'කුලියට ගැනීම නැවත 36% දක්වා වැඩි විය',
    upgradedMeaningSi: 'කුලී නිවාස 36% දක්වා යථා තත්ත්වයට පත්වෙමින් ප්‍රවණතාව ආපසු හැරුණි',
    critique: 'Mechanical description that misses the opportunity to evaluate the final trend reversal.',
    critiqueSi: 'අවසාන දශකයේ සිදුවූ පෙරළිය විශ්ලේෂණය කර නොතිබීම.',
    value: 'Upgrades to "this trend reversed slightly with rentals recovering to 36%", fulfilling Band 8.5 Task Achievement.',
    valueSi: 'ප්‍රවණතාවයේ වෙනස්වීම ගැඹුරින් විස්තර කරමින් Task Achievement ඉහළ නංවයි.'
  },
  'fell to 64 percent': {
    criterion: 'LR',
    originalMeaningSi: '64% දක්වා පහළ වැටුණි',
    upgradedMeaningSi: 'සුළු වශයෙන් 64% දක්වා අඩු විය (contracted marginally)',
    critique: '"fell" is an elementary school verb for downward movement.',
    critiqueSi: '"fell" යනු සරල ක්‍රියාපදයකි.',
    value: 'Upgrades to precise economic reporting verb "contracted marginally to 64%" (LR Band 8).',
    valueSi: '"contracted marginally" යන ශාස්ත්‍රීය ආර්ථික විද්‍යාත්මක යෙදුම භාවිත කරයි.'
  },

  // Task 2 Upgrades
  'big': {
    criterion: 'LR',
    originalMeaningSi: 'විශාල / ලොකු',
    upgradedMeaningSi: 'සැලකිය යුතු / ප්‍රබල (significant / substantial)',
    critique: 'Generic spoken adjective. In IELTS Academic Task 2, "big" lacks precision and caps Lexical Resource at Band 6.0.',
    critiqueSi: '"big" යනු කතාබහේදී යොදන සරල වචනයකි. ශාස්ත්‍රීය රචනයකදී එය Lexical Resource ලකුණු Band 6.0 මට්ටමට සීමා කරයි.',
    value: 'Upgrades to "significant/substantial", demonstrating formal academic precision and lifting Lexical Resource to Band 8.0.',
    valueSi: 'වඩාත් විධිමත් ශාස්ත්‍රීය විශේෂණ පදයක් යොදා LR ලකුණු Band 8.0 දක්වා ඉහළ නංවයි.'
  },
  'study what they like': {
    criterion: 'TR',
    originalMeaningSi: 'තමන් කැමති දේ ඉගෙන ගැනීම',
    upgradedMeaningSi: 'තමන් ප්‍රිය කරන ඕනෑම විෂයක් හැදෑරීමට නිදහස තිබීම',
    critique: 'Directly echoes the question prompt ("study what they like") without demonstrating candidate paraphrasing ability.',
    critiqueSi: 'ප්‍රශ්නයේ ඇති වචන ඒ ආකාරයෙන්ම නැවත යෙදීමකි. ස්වාධීන වචන මාලාවක් නොපෙන්වයි.',
    value: 'Paraphrases prompt into "be free to study whatever they enjoy", showing flexible syntax and satisfying Band 8 Task Response.',
    valueSi: 'ප්‍රශ්නයේ අදහස වඩාත් පරිණත ලෙස විස්තර කර TR සහ LR ලකුණු ඉහළ නංවයි.'
  },
  'other people': {
    criterion: 'CC',
    originalMeaningSi: 'අනෙක් මිනිසුන්',
    upgradedMeaningSi: 'අනෙක් අය (others)',
    critique: 'Repetitive nominal phrasing following "Some people...". Lacks cohesion and variety in discourse referencing.',
    critiqueSi: '"Some people" යෙදීමෙන් පසු නැවත "other people" කියා පුනරාවර්තනය කිරීම දුර්වල යෙදුමකි.',
    value: 'Substitutes concise pronoun "others", establishing elegant cohesion and varied referencing for Coherence & Cohesion (CC).',
    valueSi: '"others" ලෙස කෙටියෙන් යොදා Coherence & Cohesion (CC) මට්ටම ඉහළ නංවයි.'
  },
  'must': {
    criterion: 'TR',
    originalMeaningSi: 'අනිවාර්යයෙන්ම කළ යුතුය (දැඩි ප්‍රකාශය)',
    upgradedMeaningSi: 'කළ යුතුය (සමබර ශාස්ත්‍රීය නිර්දේශය - should)',
    critique: 'Excessively dogmatic modality ("must only study"). High-band IELTS academic writing uses hedged, balanced argument.',
    critiqueSi: '"must only study" යනු අනවශ්‍ය තරම් දැඩි, ඒකපාර්ශ්වික ප්‍රකාශයකි.',
    value: 'Softens to academic recommendation "should", correctly mirroring the nuanced prompt requirement.',
    valueSi: '"should" ලෙස සමබර ශාස්ත්‍රීය ප්‍රවේශයක් යොදා Task Response නිවැරදි කරයි.'
  },
  'useful subjects like': {
    criterion: 'LR',
    originalMeaningSi: 'ප්‍රයෝජනවත් විෂයන් වන',
    upgradedMeaningSi: 'පැහැදිලි ප්‍රායෝගික වටිනාකමක් සහිත විෂයන්, එනම් (such as)',
    critique: '"useful" is vague and elementary; using "like" to introduce formal academic examples sounds colloquial.',
    critiqueSi: '"useful" යනු සරල වචනයකි. උදාහරණ දැක්වීමට "like" යෙදීම කතාබහේදී කරන දෙයකි.',
    value: 'Upgrades to "subjects with clear practical value, such as", exhibiting sophisticated collocation and academic exemplar syntax.',
    valueSi: '"such as" සහ "clear practical value" යොදා විධිමත් ශාස්ත්‍රීය වචන භාවිතය (LR) පෙන්වයි.'
  },
  'give my opinion': {
    criterion: 'TR',
    originalMeaningSi: 'මගේ අදහස දීම',
    upgradedMeaningSi: 'මා එසේ විශ්වාස කරන්නේ මන්දැයි පැහැදිලි කිරීම',
    critique: 'Mechanical, memorised formula ("give my opinion"). It fails to state the candidate\'s actual perspective in the introduction.',
    critiqueSi: '"give my opinion" යනු කටපාඩම් කළ සරල වාක්‍යයකි. මෙහිදී සැබෑ ස්ථාවරය පැහැදිලි නොවේ.',
    value: 'Explicitly outlines candidate stance from the outset: "explain why I believe students should be free to choose...", securing Band 8 TR.',
    valueSi: 'හැඳින්වීමේදීම පැහැදිලි තර්කානුකූල ස්ථාවරයක් ගොඩනගා Task Response Band 8 මට්ටමට ඔසවා තබයි.'
  },
  'many people have different opinions about this': {
    criterion: 'CC',
    originalMeaningSi: 'බොහෝ මිනිසුන්ට මේ ගැන විවිධ මත තිබේ (හිස් වාක්‍යයක්)',
    upgradedMeaningSi: 'සිසුන්ට තමන්ගේ රුචිකත්වයන් අනුව යාමට ඉඩ දීමට ප්‍රබල හේතු තිබේ',
    critique: 'Empty, low-content filler sentence. It wastes word count without delivering a clear paragraph topic or argument.',
    critiqueSi: 'කිසිදු නිශ්චිත අදහසක් නොමැති හිස් වාක්‍යයකි.',
    value: 'Replaces with an authoritative topic sentence: "there are strong reasons to let students follow their own interests" (+CC & TR).',
    valueSi: 'ඡේදයේ ප්‍රධාන තර්කය මුලින්ම පැහැදිලි කරන ශක්තිමත් ආරම්භක වාක්‍යයක් යොදයි.'
  },
  'will work hard and get good marks': {
    criterion: 'LR',
    originalMeaningSi: 'මහන්සි වී වැඩ කර හොඳ ලකුණු ලබා ගනු ඇත',
    upgradedMeaningSi: 'වඩාත් කැපවීමෙන් අධ්‍යයනය කර ඉහළ ශ්‍රේණි ලබා ගැනීමට වැඩි ඉඩක් ඇත',
    critique: '"get good marks" is school-level English; absolute predictive auxiliary "will work hard" lacks scholarly hedging.',
    critiqueSi: '"get good marks" යනු ප්‍රාථමික පාසල් මට්ටමේ සරල යෙදුමකි.',
    value: 'Upgrades to "are likely to work harder and achieve higher grades", displaying academic collocation and probabilistic modal hedging.',
    valueSi: '"achieve higher grades" සහ "are likely to" යොදා Band 8 ශාස්ත්‍රීය වචන භාවිතය සනාථ කරයි.'
  },
  'loves': {
    criterion: 'GRA',
    originalMeaningSi: 'ආදරය කරයි / ප්‍රිය කරයි',
    upgradedMeaningSi: 'සැමවිටම දැඩි ඇල්මක් දක්වා ඇත (has always loved)',
    critique: 'Present simple "loves" fails to convey a lasting, continuous commitment and limits grammatical range.',
    critiqueSi: 'සරල වර්තමාන කාලය යෙදීමෙන් ගැඹුරු ව්‍යාකරණ විවිධත්වයක් නොපෙනේ.',
    value: 'Uses Present Perfect "has always loved", demonstrating advanced tense aspect for Grammatical Range & Accuracy (GRA).',
    valueSi: 'Present Perfect කාලය යොදා ව්‍යාකරණ විවිධත්වය (GRA Band 8) ප්‍රදර්ශනය කරයි.'
  },
  'successful graphic': {
    criterion: 'TR',
    originalMeaningSi: 'සාමාන්‍ය නිර්මාණකරුවෙක් (designer)',
    upgradedMeaningSi: 'සාර්ථක ග්‍රැෆික් නිර්මාණ ශිල්පියෙක් (successful graphic designer)',
    critique: 'Vague example ("he is a designer") lacks descriptive specificity and credibility.',
    critiqueSi: 'සාමාන්‍ය "designer" යන්න තර්කය ඔප්පු කිරීමට ප්‍රමාණවත් තරම් ප්‍රබල නොවේ.',
    value: 'Enriches to "successful graphic designer", providing tangible, convincing supporting detail for Task Response.',
    valueSi: 'වඩාත් පැහැදිලි සහ ආකර්ෂණීය උදාහරණයක් මගින් තර්කය ශක්තිමත් කරයි.'
  },
  'think': {
    criterion: 'LR',
    originalMeaningSi: 'සිතනවා / කල්පනා කරනවා',
    upgradedMeaningSi: 'තර්ක කරයි / පෙන්වා දෙයි (argue that)',
    critique: 'Overused spoken verb. High-scoring candidates employ precise academic reporting verbs for counter-arguments.',
    critiqueSi: '"think" යනු සාමාන්‍ය කතාබහේදී නිතර භාවිත වන සරල ක්‍රියාපදයකි.',
    value: 'Replaces with scholarly reporting verb "argue that", establishing objective academic distance (+LR & CC).',
    valueSi: 'ශාස්ත්‍රීය වාර්තාකරණ ක්‍රියාපදයක් වන "argue that" යොදා ගනී.'
  },
  'give many jobs': {
    criterion: 'LR',
    originalMeaningSi: 'රැකියා ගොඩක් දෙනවා',
    upgradedMeaningSi: 'ඉහළ වැටුප් සහිත රැකියා විශාල ප්‍රමාණයක් බිහිකරයි (create a large number of well-paid jobs)',
    critique: '"give jobs" is unnatural phrasing in English. Economies and industries do not "give" jobs; "many jobs" is informal.',
    critiqueSi: '"give jobs" යනු ඉංග්‍රීසි භාෂාවේ ස්වභාවික යෙදුමක් නොවේ.',
    value: 'Upgrades to authentic economic collocation "create a large number of well-paid jobs", fulfilling Band 8 Lexical Resource.',
    valueSi: '"create well-paid jobs" යන ස්වභාවික ශාස්ත්‍රීය ආර්ථික විද්‍යාත්මක යෙදුම භාවිත කරයි.'
  },
  'good points': {
    criterion: 'LR',
    originalMeaningSi: 'හොඳ කරුණු තිබේ (have good points)',
    upgradedMeaningSi: 'වලංගු ශාස්ත්‍රීය තර්ක පවතී (valid arguments)',
    critique: 'Casual conversational idiom ("have good points") that undermines the analytical authority of the conclusion.',
    critiqueSi: '"good points" යනු අනියම් කතාබහේදී යෙදෙන සරල යෙදුමකි.',
    value: 'Replaces with formal academic collocation "valid arguments", reinforcing sophisticated vocabulary (+LR Band 8).',
    valueSi: '"valid arguments" යනු Band 8 මට්ටමේ නිවැරදි ශාස්ත්‍රීය වචන සංයෝජනයකි.'
  },
  'about jobs': {
    criterion: 'LR',
    originalMeaningSi: 'රැකියා ගැන (about jobs)',
    upgradedMeaningSi: 'තමන්ගේ අනාගත රැකියා අවස්ථා පිළිබඳව සැලකිලිමත්ව (carefully about their future employment)',
    critique: 'Vague prepositional phrase common in elementary discourse.',
    critiqueSi: '"about jobs" යනු අපැහැදිලි සරල යෙදුමකි.',
    value: 'Upgrades to "carefully about their future employment", demonstrating precise prepositional usage and formal terminology.',
    valueSi: '"future employment" ලෙස වඩාත් නිශ්චිත වෘත්තීය යෙදුමක් යෙදීම.'
  },
  'should balance both sides': {
    criterion: 'TR',
    originalMeaningSi: 'දෙපැත්තම සමබර කළ යුතුයි',
    upgradedMeaningSi: 'ශිෂ්‍ය රුචිකත්වයන් රැකියා වෙළඳපොළේ අවශ්‍යතා සමග සමබර කිරීම',
    critique: 'Clichéd, superficial conclusion ("balance both sides") that offers zero concrete, actionable synthesis or policy depth.',
    critiqueSi: '"balance both sides" යනු අපැහැදිලි, සරල නිගමනයකි.',
    value: 'Synthesizes concrete institutional policy: "could support this by balancing students\' interests with the needs of the job market, for example, by offering career guidance", satisfying Band 8.5 TR.',
    valueSi: 'දෙපාර්ශ්වයේම අදහස් නිශ්චිත ප්‍රතිපත්තිමය විසඳුමක් සමග සංසන්දනය කර පරිණත නිගමනයකට එළඹේ.'
  },
  'I think': {
    criterion: 'CC',
    originalMeaningSi: 'මම හිතනවා (අනවශ්‍ය පුද්ගලික ප්‍රකාශයක්)',
    upgradedMeaningSi: 'විධිමත් ශාස්ත්‍රීය ස්වරය (ඉවත් කරන ලදී)',
    critique: 'Weak, redundant personal announcement in concluding summary.',
    critiqueSi: 'නිගමනයේදී අනවශ්‍ය ලෙස තමන්ගේ මතය සරලව ප්‍රකාශ කිරීමකි.',
    value: 'Removes redundant phrase and establishes a stronger, authoritative conclusion in the subsequent sentence (+CC).',
    valueSi: 'අනවශ්‍ය සරල වචන ඉවත් කර ශාස්ත්‍රීය ස්වරය තහවුරු කරයි.'
  },
  'South Korea': {
    criterion: 'TR',
    originalMeaningSi: 'සාමාන්‍ය විස්තරය (උදාහරණයක් නොමැතිව)',
    upgradedMeaningSi: 'ප්‍රායෝගික සාක්ෂිය: දකුණු කොරියාව තාක්ෂණයෙන් වේගයෙන් දියුණු වීම',
    critique: 'The argument lacks an empirical national case study to validate technology-led economic growth.',
    critiqueSi: 'තාක්ෂණික අධ්‍යාපනයේ වැදගත්කම ඔප්පු කිරීමට නිශ්චිත රටක උදාහරණයක් නොමැතිකම.',
    value: 'Inserts real-world national evidence: "South Korea, for instance, has grown rapidly...", securing Band 8.5 Task Response.',
    valueSi: 'දකුණු කොරියාවේ ආර්ථික සංවර්ධනය උදාහරණයක් ලෙස දක්වා තර්කය තහවුරු කරයි.'
  },
  'job market': {
    criterion: 'TR',
    originalMeaningSi: 'රැකියා සොයාගැනීම අපහසු විය හැක',
    upgradedMeaningSi: 'මෙම ක්ෂේත්‍රවල රැකියා වෙළඳපොළ අතිශය තරඟකාරී වන බැවින්',
    critique: 'Leaves the vulnerability of humanities degrees unsubstantiated.',
    critiqueSi: 'කලා හෝ ඉතිහාසය හදාරන්නන් මුහුණ දෙන අභියෝගයට හේතුව පැහැදිලි කර නොතිබීම.',
    value: 'Appends causal clause: "because the job market in these fields is highly competitive", achieving full idea elaboration.',
    valueSi: 'රැකියා වෙළඳපොළේ තරඟකාරීත්වය පැහැදිලි කරමින් තර්කය සම්පූර්ණ කරයි.'
  },
  'Motivated learners': {
    criterion: 'TR',
    originalMeaningSi: 'ඉගෙනීමට පමණක් සීමා වීම',
    upgradedMeaningSi: 'උනන්දුවක් දක්වන ඉගෙනුම්කරුවන් අඛණ්ඩව සිය කුසලතා සංවර්ධනය කර ගැනීමට වැඩි ඉඩක් පැවතීම',
    critique: 'Argument stops at test marks without elaborating post-graduation benefits.',
    critiqueSi: 'ශිෂ්‍ය උනන්දුවේ දිගුකාලීන වාසිය පැහැදිලි කර නොතිබීම.',
    value: 'Inserts analytical elaboration: "Motivated learners are also more likely to keep developing their skills...", securing Band 8 TR.',
    valueSi: 'උපාධියෙන් පසුවද දක්ෂතා වර්ධනය වන බව පෙන්වා දෙමින් තර්කය ගැඹුරු කරයි.'
  },
  'In my view': {
    criterion: 'CC',
    originalMeaningSi: 'මගේ අදහස (In my view)',
    upgradedMeaningSi: 'විධිමත් නිගමන ප්‍රකාශය: මාගේ දෘෂ්ටිකෝණයට අනුව, (In my view,)',
    critique: 'Conclusion lacks a clear, sophisticated discourse marker signaling authorial verdict.',
    critiqueSi: 'කතුවරයාගේ අවසන් තීරණය හඳුන්වා දීමට විධිමත් සංක්‍රාන්ති යෙදුමක් නොතිබීම.',
    value: 'Injects formal discourse marker "In my view,", clearly demarcating the candidate\'s concluding judgment (+CC).',
    valueSi: '"In my view," යොදා අවසන් තීරණය විධිමත් ලෙස සටහන් කරයි.'
  },

  // Cambridge 1 Test 1: Adult Education & Cost Upgrades
  'the charts show': {
    criterion: 'LR',
    originalMeaningSi: 'ප්‍රස්ථාර මගින් දක්වයි (the charts show)',
    upgradedMeaningSi: 'ප්‍රස්ථාර මගින් ශාස්ත්‍රීයව නිරූපණය කරයි (illustrate)',
    critique: '"show" is an elementary reporting verb that misses the opportunity to display higher-register Academic vocabulary.',
    critiqueSi: '"show" යනු මූලික ක්‍රියාපදයකි. ඒ වෙනුවට ශාස්ත්‍රීය වාර්තාකරණ ක්‍රියාපදයක් යෙදිය යුතුය.',
    value: 'Upgrades to "illustrate", establishing an authentic Band 8 introductory tone.',
    valueSi: 'විධිමත් වාර්තාකරණ ක්‍රියාපදයක් යොදා ආරම්භයේදීම LR ලකුණු ඉහළ නංවයි.'
  },
  'why adults study': {
    criterion: 'TR',
    originalMeaningSi: 'වැඩිහිටියන් ඉගෙන ගන්නේ ඇයි (සරල වාක්‍යය)',
    upgradedMeaningSi: 'වැඩිහිටි ඉගෙනුම්කරුවන් උසස් අධ්‍යාපනය හැදෑරීමට පෙළඹෙන ප්‍රධාන චේතනාවන්',
    critique: 'Directly copies the prompt wording without demonstrating lexical variety or academic nominalisation.',
    critiqueSi: 'ප්‍රශ්නයේ ඇති වචන ඒ ආකාරයෙන්ම නැවත යෙදීමකි.',
    value: 'Upgrades to "the primary motivations prompting adult learners to pursue further education" (+TR & LR).',
    valueSi: 'ප්‍රශ්නයේ අදහස වඩාත් පරිණත ශාස්ත්‍රීය වචන වලින් ප්‍රතිසංස්කරණය කරයි.'
  },
  'who should pay the costs': {
    criterion: 'LR',
    originalMeaningSi: 'වියදම් ගෙවිය යුත්තේ කවුරුන්ද යන්න',
    upgradedMeaningSi: 'පාඨමාලා වියදම් සාධාරණව බෙදී යාම පිළිබඳ මහජන එකඟතාව',
    critique: 'Spoken informal phrasing for public policy and expenditure distribution.',
    critiqueSi: 'මුදල් ගෙවීම පිළිබඳ කතාබහේදී යොදන සරල යෙදුමකි.',
    value: 'Upgrades to "public consensus regarding the equitable distribution of course funding" (+LR Band 8).',
    valueSi: 'පාඨමාලා වියදම් බෙදී යාම පිළිබඳ රාජ්‍ය ප්‍රතිපත්ති යෙදුම් භාවිත කරයි.'
  },
  'helpful for current job': {
    criterion: 'LR',
    originalMeaningSi: 'දැනට කරන රැකියාවට ප්‍රයෝජනවත්',
    upgradedMeaningSi: 'වත්මන් වෘත්තීය රැකියාව සඳහා පවතින සෘජු වෘත්තීයමය අදාළත්වය',
    critique: '"helpful for" is basic spoken English for vocational utility.',
    critiqueSi: '"helpful for" යනු කතාබහේදී යොදන සරල වචනයකි.',
    value: 'Upgrades to "vocational relevance to current employment", demonstrating professional academic register.',
    valueSi: 'වෘත්තීය උපයෝගීතාව විධිමත් ලෙස විස්තර කරයි.'
  },
  'to improve prospects of promotion': {
    criterion: 'LR',
    originalMeaningSi: 'උසස්වීම් අවස්ථා වැඩි දියුණු කර ගැනීමට',
    upgradedMeaningSi: 'වෘත්තීයමය වශයෙන් ඉහළ උසස්වීම් සුරක්ෂිත කර ගැනීම',
    critique: 'Formulaic phrasing that can be made significantly more concise and impactful.',
    critiqueSi: 'වඩාත් සංක්ෂිප්ත හා ප්‍රබල ශාස්ත්‍රීය යෙදුමක් යෙදිය හැක.',
    value: 'Upgrades to "securing vertical career advancement", showcasing exemplary Band 8 collocation.',
    valueSi: '"securing vertical career advancement" යන උසස් වෘත්තීය යෙදුම භාවිත කරයි.'
  },
  'enjoy learning': {
    criterion: 'LR',
    originalMeaningSi: 'ඉගෙනීමට ප්‍රිය කිරීම / විනෝදයෙන් ඉගෙනීම',
    upgradedMeaningSi: 'විනෝදාත්මක ලෙස දැනුම අත්පත් කර ගැනීම (recreational knowledge acquisition)',
    critique: 'Informal verbal phrase without academic nominalisation.',
    critiqueSi: 'ශාස්ත්‍රීය නොවන සරල ක්‍රියාපද යෙදුමකි.',
    value: 'Upgrades to "recreational knowledge acquisition" (+LR Band 8).',
    valueSi: 'ශාස්ත්‍රීය නාමකරණයක් යොදා LR ලකුණු ඉහළ නංවයි.'
  },
  'able to change jobs': {
    criterion: 'LR',
    originalMeaningSi: 'රැකියා මාරු කිරීමට හැකි වීම',
    upgradedMeaningSi: 'නව වෘත්තීය ක්ෂේත්‍ර මාරුවක් පහසු කර ගැනීම (facilitating career transition)',
    critique: 'Basic verbal clause lacking executive professional register.',
    critiqueSi: 'රැකියා මාරුව පිළිබඳ සරල යෙදුමකි.',
    value: 'Upgrades to "facilitating a professional career transition" (+LR Band 8.5).',
    valueSi: 'වෘත්තීය ක්ෂේත්‍ර මාරුව පිළිබඳ විධිමත් ශාස්ත්‍රීය යෙදුම භාවිත කරයි.'
  },
  'people think': {
    criterion: 'CC',
    originalMeaningSi: 'මිනිසුන් සිතනවා (people think)',
    upgradedMeaningSi: 'සමීක්ෂණයට පිළිතුරු දුන් අය නිර්දේශ කළේ (respondents advocated that)',
    critique: '"people think" is elementary spoken English for survey and opinion reporting.',
    critiqueSi: '"people think" යනු සරල කතාබහේ යෙදුමකි.',
    value: 'Upgrades to "respondents advocated that", demonstrating academic statistical analysis register.',
    valueSi: 'සමීක්ෂණ දත්ත වාර්තා කිරීමේ විධිමත් ක්‍රියාපදය යොදයි.'
  },
  'individual should pay': {
    criterion: 'LR',
    originalMeaningSi: 'පුද්ගලයා විසින් වියදම් දැරිය යුතුයි',
    upgradedMeaningSi: 'ඉගෙනුම්කරුවන් විසින්ම මූල්‍ය වගකීම දැරිය යුතුයි (learners themselves should shoulder)',
    critique: 'Colloquial spoken phrasing for personal financial liability.',
    critiqueSi: 'වියදම් දැරීම පිළිබඳ සරල යෙදුමකි.',
    value: 'Upgrades to "learners themselves should shoulder", exhibiting authentic collocation.',
    valueSi: 'ඉගෙනුම්කරුවන් විසින්ම වියදම් දැරීම පිළිබඳ උසස් යෙදුම භාවිත කරයි.'
  },
  'taxpayer should pay': {
    criterion: 'TR',
    originalMeaningSi: 'බදු ගෙවන්නා ගෙවිය යුතුයි',
    upgradedMeaningSi: 'රජය විසින් ඒ සඳහා මූල්‍ය ප්‍රතිපාදන සැපයිය යුතුයි (the state should finance)',
    critique: 'Informal reference to public fiscal funding.',
    critiqueSi: 'රජයේ මූල්‍ය ප්‍රතිපාදන පිළිබඳ සරල ප්‍රකාශයකි.',
    value: 'Upgrades to "the state should finance", reflecting formal public economics terminology.',
    valueSi: 'රාජ්‍ය මූල්‍ය ප්‍රතිපාදන පිළිබඳ නිවැරදි වචන යොදයි.'
  },
  'employer should pay': {
    criterion: 'LR',
    originalMeaningSi: 'සේවා යෝජකයා ගෙවිය යුතුයි',
    upgradedMeaningSi: 'වාණිජ ව්‍යාපාරික ආයතන ඒ සඳහා දායක විය යුතුයි (commercial enterprises should contribute)',
    critique: 'Basic conversational English.',
    critiqueSi: 'සේවා යෝජකයා ගෙවීම පිළිබඳ සරල යෙදුමකි.',
    value: 'Upgrades to "commercial enterprises should contribute", fulfilling Band 8 Lexical Resource.',
    valueSi: 'ආයතනික දායකත්වය පිළිබඳ විධිමත් ආර්ථික යෙදුම භාවිත කරයි.'
  },
  'main reasons': {
    criterion: 'LR',
    originalMeaningSi: 'ප්‍රධාන හේතු (main reasons)',
    upgradedMeaningSi: 'ප්‍රමුඛතම උත්ප්‍රේරක සාධක (predominant catalysts)',
    critique: '"main reasons" is an overused cliché in Task 1 summaries.',
    critiqueSi: '"main reasons" යනු නිතර භාවිතා වන සරල වචනයකි.',
    value: 'Upgrades to "predominant catalysts", demonstrating rich and varied vocabulary.',
    valueSi: '"predominant catalysts" යොදා වචන මාලාවේ පොහොසත්කම පෙන්වයි.'
  },

  // Cambridge 17 Test 2: Fuel Prices & Environment
  'in the modern world': {
    criterion: 'LR',
    originalMeaningSi: 'නූතන ලෝකයේ (කටපාඩම් කළ සරල හැඳින්වීම)',
    upgradedMeaningSi: 'වර්තමාන ගෝලීයකරණය වූ සමාජය තුළ (in contemporary globalized society)',
    critique: '"In the modern world" is an overused IELTS memorised formula.',
    critiqueSi: '"In the modern world" යනු කටපාඩම් කළ සරල හැඳින්වීමකි.',
    value: 'Upgrades to "In contemporary globalized society", lifting register to Band 8.',
    valueSi: 'විධිමත් ශාස්ත්‍රීය සමාජ විද්‍යාත්මක හැඳින්වීමක් යොදයි.'
  },
  'more and more serious': {
    criterion: 'LR',
    originalMeaningSi: 'වැඩි වැඩියෙන් බරපතල වෙනවා',
    upgradedMeaningSi: 'වඩාත් උග්‍ර සහ බහුවිධ වූ (increasingly acute and multifaceted)',
    critique: 'Conversational repetition ("more and more") discouraged in formal academic writing.',
    critiqueSi: '"more and more" යනු කතාබහේදී යොදන සරල පුනරාවර්තනයකි.',
    value: 'Upgrades to "increasingly acute and multifaceted", demonstrating advanced lexical range.',
    valueSi: '"increasingly acute" යොදා ගැටලුවේ බරපතලකම ගැඹුරින් විස්තර කරයි.'
  },
  'disagree with this opinion': {
    criterion: 'TR',
    originalMeaningSi: 'මෙම අදහසට එකඟ නොවෙමි (disagree with this opinion)',
    upgradedMeaningSi: 'මෙම තර්කය දැඩි ලෙස විවේචනාත්මකව ප්‍රතික්ෂේප කරමි (strongly dispute this contention)',
    critique: 'Basic spoken reaction that lacks analytical conviction.',
    critiqueSi: 'සරල එකඟ නොවීමකි.',
    value: 'Upgrades to "strongly dispute this contention", asserting a powerful and authoritative academic stance.',
    valueSi: 'ශක්තිමත් ශාස්ත්‍රීය ස්ථාවරයක් ගොඩනගා Task Response ඉහළ නංවයි.'
  },
  'cost of living will increase': {
    criterion: 'LR',
    originalMeaningSi: 'ජීවන වියදම වැඩි වේවි',
    upgradedMeaningSi: 'ගෘහස්ත වියදම් සීඝ්‍රයෙන් ඉහළ යනු ඇත (household expenditures escalate drastically)',
    critique: 'Simple spoken sentence for economic inflation.',
    critiqueSi: 'ජීවන වියදම ඉහළ යාම පිළිබඳ සරල ප්‍රකාශයකි.',
    value: 'Upgrades to "household expenditures escalate drastically", exhibiting macroeconomic accuracy.',
    valueSi: 'ආර්ථික විද්‍යාත්මක නිවැරදි යෙදුම් භාවිත කරයි.'
  },
  'protect the environment': {
    criterion: 'LR',
    originalMeaningSi: 'පරිසරය ආරක්ෂා කිරීම',
    upgradedMeaningSi: 'පාරිසරික අඛණ්ඩතාව සහ සුරක්ෂිතතාව රැක ගැනීම (safeguard ecological integrity)',
    critique: 'Elementary collocation repeated from primary school English.',
    critiqueSi: 'නිතර භාවිත වන සරල යෙදුමකි.',
    value: 'Upgrades to "safeguard ecological integrity", setting a distinguished Band 8 standard.',
    valueSi: '"safeguard ecological integrity" යන උසස් පාරිසරික යෙදුම භාවිත කරයි.'
  },

  // Additional Cambridge 1 Process, Wealth, Sports, and Population Upgrades
  'the diagram shows': {
    criterion: 'LR',
    originalMeaningSi: 'රූප සටහන පෙන්වයි (the diagram shows)',
    upgradedMeaningSi: 'සපයා ඇති ක්‍රියාවලි සටහන මගින් නිරූපණය කරයි (process diagram illustrates)',
    critique: 'Standard prompt repetition without demonstrating report register.',
    critiqueSi: 'ප්‍රශ්නයේ ඇති සරල යෙදුමයි.',
    value: 'Upgrades to "The provided process diagram illustrates", demonstrating formal process reporting.',
    valueSi: 'ක්‍රියාවලි සටහන් සඳහා විධිමත් වාර්තාකරණ යෙදුම භාවිත කරයි.'
  },
  'rich countries have plenty of money': {
    criterion: 'LR',
    originalMeaningSi: 'ධනවත් රටවලට මුදල් ගොඩක් තිබේ',
    upgradedMeaningSi: 'ධනවත් කාර්මික රටවල් සැලකිය යුතු මූල්‍ය ප්‍රාග්ධනයක් පාලනය කරයි (substantial fiscal capital)',
    critique: '"plenty of money" is colloquial spoken English.',
    critiqueSi: '"plenty of money" යනු කතාබහේදී යොදන සරල වචනයකි.',
    value: 'Upgrades to "Affluent industrialized nations command substantial fiscal capital" (+LR Band 8.5).',
    valueSi: 'විධිමත් ආර්ථික හා සමාජ විද්‍යාත්මක යෙදුම් භාවිත කරයි.'
  },
  'footballers and basketball players earn too much money': {
    criterion: 'LR',
    originalMeaningSi: 'පාපන්දු සහ පැසිපන්දු ක්‍රීඩකයින් වැඩි මුදලක් උපයනවා',
    upgradedMeaningSi: 'ප්‍රභූ වෘත්තීය ක්‍රීඩකයින්ට අසමාන ලෙස අතිවිශාල මූල්‍ය ප්‍රතිලාභ ලැබේ',
    critique: 'Spoken, casual opening statement.',
    critiqueSi: 'කතාබහේදී අදහස් දක්වන සරල ආරම්භයකි.',
    value: 'Upgrades to "Elite professional athletes receive disproportionately exorbitant financial compensation" (+LR Band 8.5).',
    valueSi: 'වෘත්තීය මලල ක්‍රීඩක වැටුප් පිළිබඳ විධිමත් ශාස්ත්‍රීය විවේචනයක් ඉදිරිපත් කරයි.'
  },
  'doctors save lives and teachers educate children': {
    criterion: 'TR',
    originalMeaningSi: 'වෛද්‍යවරුන් ජීවිත බේරා ගන්නා අතර ගුරුවරුන් ළමයින්ට උගන්වයි',
    upgradedMeaningSi: 'සෞඛ්‍ය සේවකයින් ජීවිත බේරාගන්නා අතර අධ්‍යාපනඥයින් අත්‍යවශ්‍ය බුද්ධිමය සම්පත් සංවර්ධනය කරයි',
    critique: 'Superficial parallel statement that misses the opportunity to contrast essential human capital.',
    critiqueSi: 'කරුණු මතුපිටින් සැසඳීමකි.',
    value: 'Upgrades to "Healthcare practitioners preserve human life whilst educators foster essential civic and intellectual capital" (+TR & LR).',
    valueSi: 'සමාජයට අත්‍යවශ්‍ය සේවාවන් ගැඹුරින් විශ්ලේෂණය කරමින් ලකුණු ඉහළ නංවයි.'
  },
  'university is very expensive nowadays': {
    criterion: 'LR',
    originalMeaningSi: 'මේ දිනවල විශ්ව විද්‍යාල අධ්‍යාපනය ඉතා මිල අධිකයි',
    upgradedMeaningSi: 'තෘතියික අධ්‍යාපනය වර්තමාන සමාජය තුළ දැඩි මූල්‍යමය බරක් පටවයි',
    critique: 'Everyday spoken phrasing.',
    critiqueSi: '"very expensive" යනු සාමාන්‍ය කතාබහේ යෙදුමකි.',
    value: 'Upgrades to "Tertiary education imposes an onerous financial commitment in contemporary society" (+LR Band 8).',
    valueSi: 'උසස් අධ්‍යාපන වියදම් පිළිබඳ විධිමත් සමාජ විද්‍යාත්මක යෙදුම භාවිත කරයි.'
  },
  'computers are used in many places today': {
    criterion: 'LR',
    originalMeaningSi: 'අද බොහෝ ස්ථානවල පරිගණක භාවිතා වේ',
    upgradedMeaningSi: 'ඩිජිටල් තාක්ෂණයන් වර්තමාන වාණිජ හා අධ්‍යාපනය පුරා සම්පූර්ණයෙන්ම ව්‍යාප්ත වී ඇත',
    critique: 'Elementary descriptive formula.',
    critiqueSi: 'මූලික විස්තරාත්මක යෙදුමකි.',
    value: 'Upgrades to "Computational and digital technologies have thoroughly permeated contemporary commerce and education" (+LR Band 8).',
    valueSi: 'තාක්ෂණික ව්‍යාප්තිය පිළිබඳ උසස් ශාස්ත්‍රීය යෙදුම භාවිත කරයි.'
  }
};

/**
 * Intelligent helper to lookup or infer the Sinhala meaning of any English phrase or word.
 */
export function lookupSinhalaMeaning(phrase: string, fallbackType: 'original' | 'upgraded' = 'original'): string {
  if (!phrase || !phrase.trim()) return '';
  const clean = phrase.trim().toLowerCase().replace(/^[",.\s]+|[",.\s]+$/g, '');
  
  // 1. Direct dictionary match
  if (IELTS_SINHALA_DICTIONARY[clean]) {
    return IELTS_SINHALA_DICTIONARY[clean];
  }

  // 2. Exact match in UPGRADE_EXPLANATIONS
  for (const [key, exp] of Object.entries(UPGRADE_EXPLANATIONS)) {
    if (clean === key.toLowerCase()) {
      if (fallbackType === 'original' && exp.originalMeaningSi) return exp.originalMeaningSi;
      if (fallbackType === 'upgraded' && exp.upgradedMeaningSi) return exp.upgradedMeaningSi;
    }
  }

  // 3. Substring match in IELTS_SINHALA_DICTIONARY
  for (const [key, val] of Object.entries(IELTS_SINHALA_DICTIONARY)) {
    if (clean.length >= 4 && (clean.includes(key) || (key.length >= 6 && key.includes(clean)))) {
      return val;
    }
  }

  // 4. Substring match in UPGRADE_EXPLANATIONS
  for (const [key, exp] of Object.entries(UPGRADE_EXPLANATIONS)) {
    if (clean.length >= 5 && (clean.includes(key.toLowerCase()) || key.toLowerCase().includes(clean))) {
      if (fallbackType === 'original' && exp.originalMeaningSi) return exp.originalMeaningSi;
      if (fallbackType === 'upgraded' && exp.upgradedMeaningSi) return exp.upgradedMeaningSi;
    }
  }

  // 5. Common IELTS vocabulary fallback dictionary
  const wordMap: Record<string, string> = {
    'table': 'වගුව',
    'chart': 'ප්‍රස්තාරය',
    'graph': 'ප්‍රස්තාරය',
    'diagram': 'සටහන',
    'spend': 'වියදම් කරනවා',
    'spending': 'වියදම් කිරීම',
    'spent': 'වියදම් කළා',
    'expenditure': 'සමස්ත වියදම',
    'money': 'මුදල්',
    'country': 'රට',
    'countries': 'රටවල්',
    'nations': 'ජාතීන් / රටවල්',
    'percentage': 'ප්‍රතිශතය',
    'proportion': 'අනුපාතය / පංගුව',
    'higher': 'ඉහළ',
    'lower': 'අඩු / පහළ',
    'highest': 'ඉහළම',
    'lowest': 'අඩුම',
    'increase': 'වැඩි වීම',
    'increased': 'වැඩි විය',
    'decrease': 'අඩු වීම',
    'decreased': 'අඩු විය',
    'went up': 'ඉහළ ගියේය',
    'went down': 'පහළ ගියේය',
    'shows': 'පෙන්වයි',
    'show': 'පෙන්වයි',
    'illustrates': 'නිරූපණය කරයි',
    'compares': 'සංසන්දනය කරයි',
    'noticeable': 'කැපී පෙනෙන',
    'striking': 'කැපී පෙනෙන',
    'different': 'විවිධ / වෙනස්',
    'similar': 'සමාන',
    'same': 'එකම',
    'food': 'ආහාර',
    'drinks': 'පානීය ද්‍රව්‍ය',
    'clothing': 'ඇඳුම්',
    'footwear': 'පාවහන්',
    'leisure': 'විවේකය',
    'education': 'අධ්‍යාපනය',
    'people': 'මිනිසුන්',
    'adults': 'වැඩිහිටියන්',
    'students': 'සිසුන්',
    'study': 'ඉගෙනීම',
    'learn': 'ඉගෙන ගන්නවා',
    'job': 'රැකියාව',
    'jobs': 'රැකියා',
    'work': 'රැකියාව / වැඩ කිරීම',
    'employment': 'රැකියා නියුක්තිය',
    'pay': 'ගෙවනවා',
    'costs': 'වියදම්',
    'government': 'රජය',
    'state': 'රාජ්‍යය',
    'taxpayer': 'බදු ගෙවන්නා',
    'employer': 'සේවායෝජකයා',
    'company': 'සමාගම',
    'environment': 'පරිසරය',
    'world': 'ලෝකය',
    'society': 'සමාජය'
  };

  if (wordMap[clean]) return wordMap[clean];

  // 6. Multi-word phrase translation fallback
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.length <= 6) {
    const translated = words.map(w => wordMap[w] || IELTS_SINHALA_DICTIONARY[w] || '').filter(Boolean);
    if (translated.length >= Math.ceil(words.length / 2)) {
      return translated.join(' ');
    }
  }

  return '';
}

export const InteractiveUpgradesSandbox: React.FC<InteractiveUpgradesSandboxProps> = ({
  correctedText,
  segments,
  stage2Criteria,
  stage2Band,
  showSinhala
}) => {
  // Ensure effectiveSegments always has valid granular upgrade operations (fallback to generated upgrades from correctedText if segments is plain text or has giant monolithic blocks)
  const effectiveSegments = useMemo(() => {
    const hasEdits = segments && segments.some(s => s.type !== 'text');
    if (hasEdits) {
      const hasGiantBlock = segments.some(s => {
        if (s.type === 'text') return false;
        const origWords = (s.text || '').trim().split(/\s+/).length;
        const toWords = (s.to || '').trim().split(/\s+/).length;
        return origWords > 18 || toWords > 28;
      });
      if (!hasGiantBlock) return segments;
    }
    return generateAcademicUpgradeSegments(correctedText);
  }, [segments, correctedText]);

  // Extract all upgradeable segments (replace, ins, del)
  const upgradeItems = useMemo<UpgradeDetailItem[]>(() => {
    const list: UpgradeDetailItem[] = [];
    let counter = 0;

    effectiveSegments.forEach((s) => {
      if (s.type === 'replace' || s.type === 'ins' || s.type === 'del') {
        counter++;
        const id = `up-${counter}`;
        const orig = s.type === 'replace' ? s.text.trim() : (s.type === 'del' ? s.text.trim() : '');
        const upg = s.type === 'replace' ? (s.to || '').trim() : (s.type === 'ins' ? s.text.trim() : '');

        // Lookup matching explanation or generate intelligent fallback
        const searchTarget = (orig || upg).toLowerCase();
        const matchKey = Object.keys(UPGRADE_EXPLANATIONS).find(k => 
          searchTarget.includes(k.toLowerCase()) || k.toLowerCase().includes(searchTarget)
        );
        const exp = matchKey ? UPGRADE_EXPLANATIONS[matchKey] : null;

        const originalMeaningSi = exp?.originalMeaningSi || (orig ? lookupSinhalaMeaning(orig, 'original') : undefined);
        const upgradedMeaningSi = exp?.upgradedMeaningSi || (upg ? lookupSinhalaMeaning(upg, 'upgraded') : undefined);

        const criterion = exp?.criterion || (
          s.note?.includes('CC') || s.note?.includes('transition') || s.note?.includes('formula') ? 'CC' :
          s.note?.includes('TR') || s.note?.includes('scope') || s.note?.includes('Achievement') ? 'TR' :
          s.note?.includes('GRA') || s.note?.includes('syntax') ? 'GRA' :
          s.type === 'ins' ? 'TR' : 'LR'
        );

        list.push({
          id,
          type: s.type,
          originalText: s.type === 'ins' ? '' : s.text,
          originalMeaningSi,
          upgradedText: s.type === 'del' ? '' : (s.type === 'replace' ? (s.to || '') : s.text),
          upgradedMeaningSi,
          criterion,
          originalCritique: exp?.critique || (
            s.type === 'del'
              ? `The phrasing "${orig}" is conversational filler that weakens formal academic register.`
              : `The original expression "${orig}" is basic everyday language that limits your band score.`
          ),
          originalCritiqueSi: exp?.critiqueSi || (
            s.type === 'del'
              ? `මෙම යෙදුම ("${orig}") ශාස්ත්‍රීය රචනයකදී අනවශ්‍ය සරල වචනයක් බැවින් ඉවත් කෙරේ.`
              : `මුල් යෙදුම ("${orig}") IELTS ශාස්ත්‍රීය රචනයකට සාපේක්ෂව සරල වේ.`
          ),
          upgradeValue: exp?.value || s.note || (
            s.type === 'ins'
              ? `Adds essential argument elaboration and specific supporting evidence required for Task Response Band 8.`
              : `Replaces informal expression with authentic Band 8 academic phrasing, directly strengthening ${criterion}.`
          ),
          upgradeValueSi: exp?.valueSi || `ශාස්ත්‍රීය ඉදිරිපත් කිරීම (Band 8) තහවුරු කරමින් ලකුණු ඉහළ නංවයි.`,
          note: s.note
        });
      }
    });

    return list;
  }, [effectiveSegments]);

  // Set of currently active upgrade IDs (all active by default to demonstrate Band 8)
  const [activeUpgradeIds, setActiveUpgradeIds] = useState<Set<string>>(() => {
    return new Set(upgradeItems.map(u => u.id));
  });

  // Stable signature representing the actual set of upgrade operations
  const upgradeSignature = useMemo(
    () => upgradeItems.map(u => `${u.id}:${u.originalText}->${u.upgradedText}`).join('|'),
    [upgradeItems]
  );

  // Keep active upgrade IDs in sync ONLY when the essay or upgrade items actually change
  useEffect(() => {
    setActiveUpgradeIds(new Set(upgradeItems.map(u => u.id)));
  }, [upgradeSignature]);

  // Dedicated hover state for separate striked vs added tooltips
  const [hovered, setHovered] = useState<{ id: string; target: 'striked' | 'added' } | null>(null);

  // Collapsible toggle for detailed criteria progress breakdown
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [surfaceViewMode, setSurfaceViewMode] = useState<'interactive' | 'side-by-side' | 'clean'>('interactive');
  const [showStrikethroughs, setShowStrikethroughs] = useState<boolean>(true);
  const [copiedSimulated, setCopiedSimulated] = useState<boolean>(false);

  // Toggle single upgrade on or off
  const toggleUpgrade = (id: string) => {
    setActiveUpgradeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const applyAll = () => {
    setActiveUpgradeIds(new Set(upgradeItems.map(u => u.id)));
  };

  const revertAll = () => {
    setActiveUpgradeIds(new Set());
  };

  // DYNAMIC IELTS SCORE CALCULATION
  const totalCount = upgradeItems.length;
  const activeCount = upgradeItems.filter(u => activeUpgradeIds.has(u.id)).length;
  const ratio = totalCount > 0 ? activeCount / totalCount : 1;

  // Sub-score contributions based on active upgrades per criterion
  const clampScore = (val: number) => Math.min(8.5, Math.max(5.0, Math.round(val * 2) / 2));

  const countForCrit = (crit: string) => upgradeItems.filter(u => u.criterion === crit).length;
  const activeForCrit = (crit: string) => upgradeItems.filter(u => u.criterion === crit && activeUpgradeIds.has(u.id)).length;

  const critRatio = (crit: string) => {
    const tot = countForCrit(crit);
    return tot > 0 ? activeForCrit(crit) / tot : ratio;
  };

  const dynamicTR = clampScore(stage2Criteria.TR + critRatio('TR') * (8.0 - stage2Criteria.TR));
  const dynamicCC = clampScore(stage2Criteria.CC + critRatio('CC') * (8.0 - stage2Criteria.CC));
  const dynamicLR = clampScore(stage2Criteria.LR + critRatio('LR') * (8.0 - stage2Criteria.LR));
  const dynamicGRA = clampScore(stage2Criteria.GRA + critRatio('GRA') * (8.0 - stage2Criteria.GRA));

  const dynamicOverall = roundIeltsBand([dynamicTR, dynamicCC, dynamicLR, dynamicGRA]);
  const scoreBoost = Math.max(0, dynamicOverall - stage2Band);

  // Map segments with their corresponding upgrade item
  let itemIndex = 0;
  const mappedSegments = effectiveSegments.map(s => {
    if (s.type === 'replace' || s.type === 'ins' || s.type === 'del') {
      const item = upgradeItems[itemIndex];
      itemIndex++;
      return { segment: s, upgradeItem: item };
    }
    return { segment: s, upgradeItem: null };
  });

  // Current simulated text reflecting active vs inactive upgrades
  const currentSimulatedText = useMemo(() => {
    return mappedSegments.map(({ segment: s, upgradeItem: item }) => {
      if (!item) return s.text;
      const isActive = activeUpgradeIds.has(item.id);
      if (item.type === 'replace') {
        return isActive ? item.upgradedText : item.originalText;
      } else if (item.type === 'ins') {
        return isActive ? item.upgradedText : '';
      } else if (item.type === 'del') {
        return isActive ? '' : item.originalText;
      }
      return s.text;
    }).join('');
  }, [mappedSegments, activeUpgradeIds]);

  const handleCopySimulated = () => {
    navigator.clipboard.writeText(currentSimulatedText);
    setCopiedSimulated(true);
    setTimeout(() => setCopiedSimulated(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* STAGE 3 INTRO HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono">
              Stage 3 · Improvement Pass
            </span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Essay Surface & Score Simulator
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Stage 3 · Academic Upgrades Sandbox
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Click <strong>✕</strong> on any highlighted Band 8 upgrade to remove it and observe the dynamic score change, or click <strong>+</strong> to restore it. The simulator bar remains pinned while scrolling so you can test changes anywhere in the essay without losing your place.
          </p>
        </div>
      </div>

      {/* 1. STICKY COMPACT DYNAMIC SCORE SIMULATOR (SLIM HUD) */}
      <div className="sticky top-2 z-30 space-y-2">
        <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl px-3.5 sm:px-5 py-2.5 shadow-2xl border border-indigo-500/40 flex flex-wrap items-center justify-between gap-3 transition-all duration-200">
          {/* Left: Overall Live Band Score Badge */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-bold hidden sm:inline">
              Dynamic Score:
            </span>
            <span className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
              Band {formatBand(dynamicOverall)}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-mono font-bold">
              +{scoreBoost.toFixed(1)} Boost
            </span>
          </div>

          {/* Center: 4 Criteria Mini Badges */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {[
              { key: 'TR', name: 'Task Response', score: dynamicTR, base: stage2Criteria.TR },
              { key: 'CC', name: 'Coherence', score: dynamicCC, base: stage2Criteria.CC },
              { key: 'LR', name: 'Lexical Resource', score: dynamicLR, base: stage2Criteria.LR },
              { key: 'GRA', name: 'Grammar', score: dynamicGRA, base: stage2Criteria.GRA }
            ].map(c => {
              const isUpgraded = c.score > c.base;
              return (
                <div
                  key={c.key}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border text-[10px] sm:text-[11px] font-mono flex items-center gap-1 transition-all ${
                    isUpgraded
                      ? 'bg-indigo-950/80 border-indigo-400/50 text-indigo-200 shadow-2xs'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400'
                  }`}
                  title={`${c.name} (${c.key}): Band ${formatBand(c.score)} (Stage 2 baseline: ${formatBand(c.base)})`}
                >
                  <span className="font-bold text-[9px] sm:text-[10px] text-slate-400">{c.key}</span>
                  <span className={`font-black ${isUpgraded ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {formatBand(c.score)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Quick Action Controls & Details Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] text-indigo-200/90 font-mono hidden lg:inline">
              {activeCount}/{totalCount} Active
            </span>
            <button
              type="button"
              onClick={revertAll}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
              title={`Revert to Stage 2 baseline (Band ${formatBand(stage2Band)})`}
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">Revert</span>
              <span className="font-mono text-[10px]">({formatBand(stage2Band)})</span>
            </button>
            <button
              type="button"
              onClick={applyAll}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-md hover:shadow-indigo-500/20 cursor-pointer"
              title="Apply all Band 8 upgrades"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span className="hidden md:inline">Apply All</span>
              <span className="font-mono text-[10px]">(8.0)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(prev => !prev)}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title={isExpanded ? 'Collapse detailed meters' : 'Expand detailed criteria meters'}
            >
              <span className="hidden xl:inline text-[11px]">{isExpanded ? 'Hide Details' : 'Details'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Collapsible Details Drawer */}
        {isExpanded && (
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-indigo-500/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between text-xs border-b border-indigo-900/80 pb-2">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Four IELTS Assessment Criteria Breakdown</span>
              </span>
              <span className="font-mono text-slate-300 text-[11px]">
                {Math.round(ratio * 100)}% of Band 8 upgrades applied
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: 'TR', name: 'Task Response', score: dynamicTR, base: stage2Criteria.TR, count: activeForCrit('TR'), tot: countForCrit('TR') },
                { key: 'CC', name: 'Coherence', score: dynamicCC, base: stage2Criteria.CC, count: activeForCrit('CC'), tot: countForCrit('CC') },
                { key: 'LR', name: 'Lexical Resource', score: dynamicLR, base: stage2Criteria.LR, count: activeForCrit('LR'), tot: countForCrit('LR') },
                { key: 'GRA', name: 'Grammar', score: dynamicGRA, base: stage2Criteria.GRA, count: activeForCrit('GRA'), tot: countForCrit('GRA') }
              ].map(c => (
                <div key={c.key} className="bg-white/5 rounded-xl p-2.5 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-300">{c.name} ({c.key})</span>
                    <span className="font-black text-white font-mono">Band {formatBand(c.score)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${(c.score / 9) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-0.5">
                    <span>Baseline: {formatBand(c.base)}</span>
                    <span>{c.count}/{c.tot} Upgrades</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. INTERACTIVE ESSAY SURFACE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span className="text-base sm:text-lg">Stage 3 Interactive Essay Surface</span>
              <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-mono">
                Base: Exact Stage 2 Corrected Essay
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Surface View Mode Selector */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSurfaceViewMode('interactive')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    surfaceViewMode === 'interactive'
                      ? 'bg-white text-indigo-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Interactive Mode: Click ✕ / + on words to test dynamic score changes"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Sandbox</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSurfaceViewMode('side-by-side')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    surfaceViewMode === 'side-by-side'
                      ? 'bg-white text-indigo-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Side-by-side comparison: Stage 2 Baseline vs Band 8 Upgraded"
                >
                  <Split className="w-3 h-3 text-indigo-600" />
                  <span>Compare</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSurfaceViewMode('clean')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    surfaceViewMode === 'clean'
                      ? 'bg-white text-indigo-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Clean Reading View: Read the current simulated essay without strikethroughs"
                >
                  <FileText className="w-3 h-3 text-indigo-600" />
                  <span>Clean Read</span>
                </button>
              </div>

              {/* Show / Hide Strikethroughs Toggle (Active in Sandbox View) */}
              {surfaceViewMode === 'interactive' && (
                <button
                  type="button"
                  onClick={() => setShowStrikethroughs(prev => !prev)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${
                    showStrikethroughs
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-300 font-bold'
                  }`}
                  title="Toggle crossed-out baseline words on or off"
                >
                  <Sliders className="w-3 h-3 text-indigo-600" />
                  <span>{showStrikethroughs ? 'Strikethroughs: Shown' : 'Strikethroughs: Hidden'}</span>
                </button>
              )}

              {/* Copy Simulated Text Button */}
              <button
                type="button"
                onClick={handleCopySimulated}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Copy the current simulated essay text"
              >
                {copiedSimulated ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Legend with Action Indicators (Shown in Sandbox Mode) */}
          {surfaceViewMode === 'interactive' && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-600 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="line-through decoration-rose-500 decoration-2 text-slate-400 font-serif">old word</span>
                <span>= Stage 2 baseline (hover for critique)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 font-bold text-indigo-950 bg-indigo-50 border border-indigo-300 rounded px-1.5 py-0.2 font-serif">
                  <span>Band 8 word</span>
                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-[9px] font-bold">✕</span>
                </span>
                <span>= Click <strong>✕</strong> to remove upgrade & drop score</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-slate-800 bg-slate-100 border border-slate-300 rounded px-1.5 py-0.2 font-serif">
                  <span>old word</span>
                  <span className="px-1 py-0.2 rounded bg-indigo-600 text-white text-[9px] font-bold flex items-center gap-0.5">+LR</span>
                </span>
                <span>= Click <strong>+</strong> to restore upgrade & raise score</span>
              </span>
            </div>
          )}
        </div>

        {/* Text Container: Interactive Sandbox View */}
        {surfaceViewMode === 'interactive' && (
          <div className="font-serif text-[15px] sm:text-base leading-9 text-slate-800 whitespace-pre-wrap select-text">
            {mappedSegments.map(({ segment: s, upgradeItem: item }, idx) => {
              if (!item) {
                return <span key={idx}>{s.text}</span>;
              }

              const isActive = activeUpgradeIds.has(item.id);
              const isHoveredStriked = hovered?.id === item.id && hovered?.target === 'striked';
              const isHoveredAdded = hovered?.id === item.id && hovered?.target === 'added';

              // CASE 1: REPLACEMENT SEGMENT (e.g., 'big' -> 'significant')
              if (item.type === 'replace') {
                if (isActive) {
                  return (
                    <span key={idx} className="relative inline-block my-0.5">
                      {/* Strikethrough of Stage 2 Original Word with its own dedicated hover */}
                      {showStrikethroughs && (
                        <del
                          onMouseEnter={() => setHovered({ id: item.id, target: 'striked' })}
                          onMouseLeave={() => setHovered(null)}
                          className="line-through decoration-rose-500 decoration-2 text-slate-400 select-none mr-1.5 font-serif text-sm cursor-help hover:text-slate-600 transition-colors"
                        >
                          {item.originalText}
                        </del>
                      )}

                      {/* Newly Added Band 8 Word with its own dedicated hover & Remove (✕) Icon */}
                      <ins
                        onMouseEnter={() => setHovered({ id: item.id, target: 'added' })}
                        onMouseLeave={() => setHovered(null)}
                        className="no-underline inline-flex items-center gap-1 font-bold text-indigo-950 bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-300 rounded-lg px-2 py-0.5 shadow-2xs font-serif transition-all cursor-help"
                      >
                        <span className="text-sm">{item.upgradedText}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUpgrade(item.id);
                          }}
                          title={`Remove Band 8 upgrade "${item.upgradedText}" to see score drop`}
                          className="w-4 h-4 rounded-full bg-indigo-200/90 hover:bg-rose-600 hover:text-white text-indigo-800 flex items-center justify-center transition-all cursor-pointer shrink-0 ml-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </ins>

                      {/* STRIKED WORD TOOLTIP */}
                      {isHoveredStriked && (
                        <div className="absolute left-0 bottom-full mb-2 z-50 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-sans shadow-2xl border border-rose-500/40 space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-rose-300 flex items-center gap-1.5 font-mono">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              Baseline Phrasing
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-bold">
                              Band 6.0–6.5
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-rose-200">
                              Original Word: <span className="line-through text-slate-300 font-serif font-normal">"{item.originalText}"</span>
                            </div>
                            {item.originalMeaningSi && (
                              <div className="text-[10.5px] font-sinhala text-rose-300 bg-rose-950/70 border border-rose-800/50 rounded-md px-2 py-0.5">
                                🇱🇰 සිංහල තේරුම: "{item.originalMeaningSi}"
                              </div>
                            )}
                            <p className="text-slate-200 text-[11px] leading-relaxed">
                              {item.originalCritique}
                            </p>
                          </div>
                          {showSinhala && item.originalCritiqueSi && (
                            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-rose-200 font-sinhala leading-relaxed">
                              💡 {item.originalCritiqueSi}
                            </div>
                          )}
                        </div>
                      )}

                      {/* NEWLY ADDED WORD TOOLTIP */}
                      {isHoveredAdded && (
                        <div className="absolute left-0 bottom-full mb-2 z-50 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-sans shadow-2xl border border-emerald-500/40 space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 font-mono">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              Band 8 Academic Upgrade
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-bold">
                              +{item.criterion} Band Boost
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-emerald-200">
                              Upgraded: <span className="text-white font-serif font-bold">"{item.upgradedText}"</span>
                            </div>
                            {item.upgradedMeaningSi && (
                              <div className="text-[10.5px] font-sinhala text-emerald-300 bg-emerald-950/70 border border-emerald-800/50 rounded-md px-2 py-0.5">
                                🇱🇰 සිංහල තේරුම: "{item.upgradedMeaningSi}"
                              </div>
                            )}
                            <p className="text-slate-100 text-[11px] leading-relaxed">
                              {item.upgradeValue}
                            </p>
                          </div>
                          {showSinhala && item.upgradeValueSi && (
                            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-indigo-200 font-sinhala leading-relaxed">
                              💡 {item.upgradeValueSi}
                            </div>
                          )}
                        </div>
                      )}
                    </span>
                  );
                }

                // Inactive (Removed State) -> Display Stage 2 word cleanly with (+) button
                return (
                  <span
                    key={idx}
                    onMouseEnter={() => setHovered({ id: item.id, target: 'striked' })}
                    onMouseLeave={() => setHovered(null)}
                    className="relative inline-block my-0.5"
                  >
                    <span className="inline-flex items-center gap-1 text-slate-800 bg-slate-100/90 hover:bg-slate-200/90 border border-slate-300 rounded-lg px-2 py-0.5 transition-all">
                      <span className="text-sm font-serif">{item.originalText}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUpgrade(item.id);
                        }}
                        title={`Click + to apply Band 8 upgrade: "${item.upgradedText}" (+${item.criterion})`}
                        className="px-1.5 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-sans font-bold flex items-center gap-0.5 cursor-pointer shadow-2xs ml-0.5"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>+{item.criterion}</span>
                      </button>
                    </span>

                    {/* Tooltip on inactive word */}
                    {isHoveredStriked && (
                      <div className="absolute left-0 bottom-full mb-2 z-50 w-72 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-sans shadow-2xl border border-slate-700 space-y-1.5 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        <span className="font-bold text-[10px] uppercase text-indigo-300 font-mono block">
                          Stage 2 Baseline Word: "{item.originalText}"
                        </span>
                        {item.originalMeaningSi && (
                          <div className="text-[10px] font-sinhala text-rose-300 bg-rose-950/70 border border-rose-800/40 rounded px-1.5 py-0.5">
                            🇱🇰 තේරුම: "{item.originalMeaningSi}"
                          </div>
                        )}
                        <p className="text-slate-200 text-[11px]">
                          Click <span className="font-bold text-emerald-300">+{item.criterion}</span> to upgrade to <span className="font-bold text-indigo-300">"{item.upgradedText}"</span>
                          {item.upgradedMeaningSi ? ` (${item.upgradedMeaningSi})` : ''} and raise your score.
                        </p>
                      </div>
                    )}
                  </span>
                );
              }

              // CASE 2: INSERTION SEGMENT (e.g. Added Idea Development / Evidence)
              if (item.type === 'ins') {
                if (isActive) {
                  return (
                    <span
                      key={idx}
                      onMouseEnter={() => setHovered({ id: item.id, target: 'added' })}
                      onMouseLeave={() => setHovered(null)}
                      className="relative inline-block my-0.5"
                    >
                      <ins className="no-underline inline-flex items-center gap-1 font-bold text-emerald-950 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-300 rounded-lg px-2 py-0.5 shadow-2xs font-serif transition-all cursor-help">
                        <span className="text-sm">{item.upgradedText}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUpgrade(item.id);
                          }}
                          title="Remove this supporting idea to see score drop"
                          className="w-4 h-4 rounded-full bg-emerald-200 hover:bg-rose-600 hover:text-white text-emerald-800 flex items-center justify-center transition-all cursor-pointer shrink-0 ml-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </ins>

                      {isHoveredAdded && (
                        <div className="absolute left-0 bottom-full mb-2 z-50 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-sans shadow-2xl border border-emerald-500/40 space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 font-mono">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              Band 8 Idea Development (+{item.criterion})
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-emerald-200">
                              Added: <span className="text-white font-serif font-bold">"{item.upgradedText}"</span>
                            </div>
                            {item.upgradedMeaningSi && (
                              <div className="text-[10.5px] font-sinhala text-emerald-300 bg-emerald-950/70 border border-emerald-800/50 rounded-md px-2 py-0.5">
                                🇱🇰 සිංහල තේරුම: "{item.upgradedMeaningSi}"
                              </div>
                            )}
                            <p className="text-slate-100 text-[11px] leading-relaxed">
                              {item.upgradeValue}
                            </p>
                          </div>
                          {showSinhala && item.upgradeValueSi && (
                            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-indigo-200 font-sinhala leading-relaxed">
                              💡 {item.upgradeValueSi}
                            </div>
                          )}
                        </div>
                      )}
                    </span>
                  );
                }

                // Inactive Insertion -> Subtle (+) button
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleUpgrade(item.id)}
                    title={`Click to add Band 8 sentence: "${item.upgradedText.slice(0, 45)}..."`}
                    className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100 border border-dashed border-indigo-300 rounded-md px-1.5 py-0.5 mx-1 transition-all cursor-pointer my-0.5 shadow-2xs"
                  >
                    <Plus className="w-3 h-3 text-indigo-600" />
                    <span>+ Add Band 8 {item.criterion === 'TR' ? 'Example' : 'Sentence'}</span>
                  </button>
                );
              }

              // CASE 3: DELETION SEGMENT (e.g. Removing 'I think ' for academic tone)
              if (item.type === 'del') {
                if (isActive) {
                  if (!showStrikethroughs) return null;
                  return (
                    <span
                      key={idx}
                      onMouseEnter={() => setHovered({ id: item.id, target: 'striked' })}
                      onMouseLeave={() => setHovered(null)}
                      className="relative inline-block my-0.5"
                    >
                      <del className="line-through decoration-rose-500 decoration-2 text-slate-400 font-serif mr-1 cursor-help">
                        {item.originalText}
                      </del>
                      <button
                        type="button"
                        onClick={() => toggleUpgrade(item.id)}
                        title={`Click ✕ to restore "${item.originalText}"`}
                        className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded px-1 py-0.2 cursor-pointer hover:bg-rose-100"
                      >
                        <X className="w-2.5 h-2.5" />
                        <span>Omitted</span>
                      </button>

                      {isHoveredStriked && (
                        <div className="absolute left-0 bottom-full mb-2 z-50 w-72 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-sans shadow-2xl border border-rose-500/40 space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                          <div className="space-y-1">
                            <span className="font-bold text-[10px] uppercase text-rose-300 font-mono block">
                              Redundant Word Omitted: <span className="font-serif normal-case line-through text-slate-300">"{item.originalText}"</span>
                            </span>
                            {item.originalMeaningSi && (
                              <div className="text-[10.5px] font-sinhala text-rose-300 bg-rose-950/70 border border-rose-800/50 rounded-md px-2 py-0.5">
                                🇱🇰 සිංහල තේරුම: "{item.originalMeaningSi}"
                              </div>
                            )}
                            <p className="text-slate-200 text-[11px] leading-relaxed">
                              {item.originalCritique}
                            </p>
                          </div>
                          {showSinhala && item.originalCritiqueSi && (
                            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-rose-200 font-sinhala leading-relaxed">
                              💡 {item.originalCritiqueSi}
                            </div>
                          )}
                        </div>
                      )}
                    </span>
                  );
                }

                // Inactive Deletion (Word is restored)
                return (
                  <span key={idx} className="inline-flex items-center gap-1 text-slate-800 bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 font-serif my-0.5">
                    <span>{item.originalText}</span>
                    <button
                      type="button"
                      onClick={() => toggleUpgrade(item.id)}
                      title="Omit for Band 8 concise academic style"
                      className="text-[10px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded px-1 py-0.2 cursor-pointer"
                    >
                      Omit
                    </button>
                  </span>
                );
              }

              return null;
            })}
          </div>
        )}

        {/* View Mode: Side-by-Side Comparison */}
        {surfaceViewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Stage 2 Clean Baseline</span>
                </span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                  Band {formatBand(stage2Band)}
                </span>
              </div>
              <div className="font-serif text-sm sm:text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap select-text">
                {correctedText}
              </div>
            </div>

            <div className="bg-indigo-50/40 border border-indigo-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-indigo-200 pb-2 text-xs font-bold text-indigo-950">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Stage 3 Simulated Band 8 Essay</span>
                </span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-300 text-indigo-900 font-bold">
                  Band {formatBand(dynamicOverall)}
                </span>
              </div>
              <div className="font-serif text-sm sm:text-[15px] leading-relaxed text-slate-900 whitespace-pre-wrap font-medium select-text">
                {currentSimulatedText}
              </div>
            </div>
          </div>
        )}

        {/* View Mode: Clean Polished Read */}
        {surfaceViewMode === 'clean' && (
          <div className="p-5 sm:p-6 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs font-mono text-slate-500">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Simulated Essay (Clean Read)</span>
              </span>
              <span className="font-bold text-indigo-800">
                Live Score: Band {formatBand(dynamicOverall)} ({activeCount}/{totalCount} Upgrades Applied)
              </span>
            </div>
            <div className="font-serif text-[15px] sm:text-base leading-relaxed text-slate-900 whitespace-pre-wrap font-medium select-text">
              {currentSimulatedText}
            </div>
          </div>
        )}
      </div>

      {/* 3. UPGRADES DIRECTORY LIST & CRITERIA VALUE EXPLANATIONS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Upgrade Breakdown & Dynamic Score Contribution</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Review what each individual word change contributes towards Band 8. Toggle any upgrade below to see the dynamic score update in real-time.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            {activeCount} of {totalCount} Upgrades Active
          </span>
        </div>

        {upgradeItems.length === 0 ? (
          <div className="p-8 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
            <Award className="w-8 h-8 text-indigo-600 mx-auto" />
            <h5 className="font-bold text-slate-800 text-sm">High Academic Register Achieved</h5>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your essay already maintains a strong academic register. Switch to <strong>Compare</strong> or <strong>Clean Read</strong> mode above to examine the full essay synthesis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {upgradeItems.map((item, idx) => {
              const isActive = activeUpgradeIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                        +{item.criterion}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 capitalize">
                        {item.type === 'replace' ? 'Word Upgrade' : item.type === 'ins' ? 'Idea Elaboration' : 'Redundancy Omission'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleUpgrade(item.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-300" />
                          <span>Active (Band 8.0)</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 text-indigo-600" />
                          <span>Apply (+{item.criterion})</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Striked vs Upgraded Detail */}
                  <div className="text-xs space-y-2.5 font-sans">
                    {item.originalText && (
                      <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-rose-700 uppercase font-mono tracking-wider">Stage 2 Word:</span>
                          <span className="line-through text-rose-950 font-serif font-medium text-[13px]">"{item.originalText}"</span>
                        </div>
                        {item.originalMeaningSi && (
                          <div className="text-[11px] font-sinhala text-rose-900 flex items-baseline gap-1.5 pt-0.5">
                            <span className="text-[10px] font-bold text-rose-600 font-sans uppercase">🇱🇰 සිංහල තේරුම:</span>
                            <span className="font-semibold">"{item.originalMeaningSi}"</span>
                          </div>
                        )}
                      </div>
                    )}

                    {item.upgradedText && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase font-mono tracking-wider">Band 8 Word:</span>
                          <span className="font-bold text-emerald-950 font-serif text-[13px]">"{item.upgradedText}"</span>
                        </div>
                        {item.upgradedMeaningSi && (
                          <div className="text-[11px] font-sinhala text-emerald-900 flex items-baseline gap-1.5 pt-0.5">
                            <span className="text-[10px] font-bold text-emerald-600 font-sans uppercase">🇱🇰 සිංහල තේරුම:</span>
                            <span className="font-semibold">"{item.upgradedMeaningSi}"</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Critique & Value Added */}
                    <div className="pt-1 space-y-1.5">
                      <div className="text-[11px] text-slate-700 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <p>
                          <strong className="text-rose-700 font-bold">Why striked:</strong> {item.originalCritique}
                        </p>
                        {showSinhala && item.originalCritiqueSi && (
                          <p className="text-[10.5px] text-rose-900 font-sinhala pt-0.5 border-t border-rose-100">
                            💡 <strong>ඇයි ඉවත් කළේ:</strong> {item.originalCritiqueSi}
                          </p>
                        )}
                      </div>

                      <div className="text-[11px] text-indigo-950 leading-relaxed font-medium bg-white/70 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <p>
                          <strong className="text-emerald-700 font-bold">Value added:</strong> {item.upgradeValue}
                        </p>
                        {showSinhala && item.upgradeValueSi && (
                          <p className="text-[10.5px] text-indigo-900 font-sinhala pt-0.5 border-t border-indigo-100">
                            💡 <strong>එකතු කළ අගය:</strong> {item.upgradeValueSi}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
