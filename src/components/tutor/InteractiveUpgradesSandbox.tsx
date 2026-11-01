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
  Info
} from 'lucide-react';
import type { EssaySegment } from '../../types/tutor';
import { roundIeltsBand, formatBand, generateAcademicUpgradeSegments } from '../../utils/tutorEngine';

export interface UpgradeDetailItem {
  id: string;
  type: 'replace' | 'ins' | 'del';
  originalText: string;
  upgradedText: string;
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

// Comprehensive Examiner Knowledge Base for IELTS Academic Upgrades
const UPGRADE_EXPLANATIONS: Record<string, {
  criterion: 'LR' | 'TR' | 'CC' | 'GRA';
  critique: string;
  critiqueSi?: string;
  value: string;
  valueSi?: string;
}> = {
  // Task 1: Chart, Data, and Trend Reporting Upgrades
  'gives information about': {
    criterion: 'LR',
    critique: '"gives information about" is an elementary, repetitive introductory formula. Academic Task 1 requires precise reporting verbs like "illustrates" or "delineates".',
    critiqueSi: '"gives information about" යනු සරල යෙදුමකි. ඒ වෙනුවට "illustrates" වැනි ශාස්ත්‍රීය වාර්තාකරණ ක්‍රියාපදයක් යොදන්න.',
    value: 'Replaces generic introduction with formal reporting verb "illustrates", setting an immediate Band 8 tone for Lexical Resource.',
    valueSi: 'විධිමත් වාර්තාකරණ ක්‍රියාපදයක් යොදා ආරම්භයේදීම LR ලකුණු ඉහළ නංවයි.'
  },
  'give information about': {
    criterion: 'LR',
    critique: '"give information about" is an elementary, repetitive introductory formula. Academic Task 1 requires precise reporting verbs like "illustrates" or "delineates".',
    critiqueSi: '"give information about" යනු සරල යෙදුමකි. ඒ වෙනුවට "illustrates" වැනි ශාස්ත්‍රීය වාර්තාකරණ ක්‍රියාපදයක් යොදන්න.',
    value: 'Replaces generic introduction with formal reporting verb "illustrates", setting an immediate Band 8 tone for Lexical Resource.',
    valueSi: 'විධිමත් වාර්තාකරණ ක්‍රියාපදයක් යොදා ආරම්භයේදීම LR ලකුණු ඉහළ නංවයි.'
  },
  'owned and rented accommodation': {
    criterion: 'LR',
    critique: 'Directly repeats the prompt vocabulary without demonstrating candidate comparative paraphrasing skills.',
    critiqueSi: 'ප්‍රශ්නයේ ඇති වචන ඒ ආකාරයෙන්ම නැවත යෙදීමකි.',
    value: 'Upgrades to "owned versus rented accommodation", introducing sharp comparative structure for Lexical Resource Band 8.',
    valueSi: '"versus" යොදා සංසන්දනාත්මක ඉදිරිපත් කිරීම ශක්තිමත් කරයි.'
  },
  'it is clear that': {
    criterion: 'CC',
    critique: '"it is clear that" is an overused cliché. Band 8+ examiners look for mature, analytical discourse markers.',
    critiqueSi: '"it is clear that" යනු නිතර භාවිතා වන සරල යෙදුමකි.',
    value: 'Upgrades to "the data reveals a dramatic structural inversion:", establishing scholarly coherence and authorial stance.',
    valueSi: 'දත්තවල ප්‍රධාන හැරවුම් ලක්ෂ්‍යය විධිමත් ලෙස විස්තර කරමින් Coherence (CC) ඉහළ නංවයි.'
  },
  'the dominant tenure': {
    criterion: 'LR',
    critique: '"the dominant tenure" can be expressed with greater lexical sophistication.',
    critiqueSi: 'වඩාත් ගැඹුරු ශාස්ත්‍රීය වචනයක් යෙදිය හැක.',
    value: 'Replaces with "overwhelmingly predominant in 1918", exhibiting advanced vocabulary range (LR Band 8).',
    valueSi: '"overwhelmingly predominant" යොදා LR ලකුණු ඉහළ නංවයි.'
  },
  'increased significantly': {
    criterion: 'LR',
    critique: 'Standard adverb-verb combination that misses the opportunity to capture an enduring 93-year historical trajectory.',
    critiqueSi: 'සාමාන්‍ය යෙදුමකි. දීර්ඝකාලීන ප්‍රවණතාවක් විස්තර කිරීමට වඩාත් සුදුසු වචන ඇත.',
    value: 'Upgrades to "experienced an enduring upward trajectory", demonstrating exceptional academic collocation (LR Band 8.5).',
    valueSi: 'වසර 93 ක දිගුකාලීන වර්ධනය පෙන්වීමට "enduring upward trajectory" යොදා ගනී.'
  },
  'both categories were almost equal': {
    criterion: 'TR',
    critique: 'FATAL FACTUAL INACCURACY: In 2011, home ownership was 64% and renting was 36% (a 28% difference!). Claiming they were equal at the end caps Task Achievement at Band 6.',
    critiqueSi: 'මාරාන්තික දත්ත වරදක්: 2011 දී නිවාස හිමිකම 64% ක් වූ අතර කුලිය 36% ක් විය. ඒවා සමාන වූයේ 1971 දීය. මෙම වරද නිසා TA ලකුණු Band 6 ට සීමා වේ.',
    value: 'Replaces factual error with accurate synthesis: "Home ownership eventually surpassed rental accommodation in 1971, before receding slightly in the final decade", securing Band 8.5 Task Achievement.',
    valueSi: '1971 සමාන වූ වසර සහ 2011 සත්‍ය දත්ත නිවැරදිව දක්වා Task Achievement ලකුණු Band 8.5 දක්වා ඉහළ නංවයි.'
  },
  'around 77 percent': {
    criterion: 'LR',
    critique: '"around" is informal conversational English.',
    critiqueSi: '"around" යනු කතාබහේදී යොදන සරල වචනයකි.',
    value: 'Upgrades to formal academic approximation "approximately 77%".',
    valueSi: 'විධිමත් ශාස්ත්‍රීය යෙදුමක් වන "approximately 77%" යෙදීම.'
  },
  'only about 23 percent': {
    criterion: 'LR',
    critique: '"only about" is casual speech phrasing.',
    critiqueSi: '"only about" යනු කතාබහේදී යොදන සරල යෙදුමකි.',
    value: 'Upgrades to "a mere 23%", adding analytical evaluative depth to the comparison (+LR).',
    valueSi: '"a mere 23%" යොදා සංසන්දනය වඩාත් ආකර්ෂණීය කරයි.'
  },
  'next few decades': {
    criterion: 'TR',
    critique: '"next few decades" is chronologically vague about the timeframe between 1918 and 1971.',
    critiqueSi: '"next few decades" යනු කාලය පිළිබඳ පැහැදිලි නොවන යෙදුමකි.',
    value: 'Specifies exact historical period: "subsequent five decades", demonstrating analytical precision (+TR).',
    valueSi: 'වසර 50 ක කාලය "subsequent five decades" ලෙස නිශ්චිතව දක්වයි.'
  },
  'went up gradually': {
    criterion: 'LR',
    critique: '"went up" is a basic phrasal verb discouraged in formal IELTS Academic reports.',
    critiqueSi: '"went up" යනු සරල phrasal verb එකකි. ශාස්ත්‍රීය රචනා සඳහා එය නුසුදුසුය.',
    value: 'Replaces phrasal verb with formal academic collocation "increased steadily" (LR Band 8).',
    valueSi: 'විධිමත් ශාස්ත්‍රීය යෙදුමක් වන "increased steadily" භාවිත කරයි.'
  },
  'were equal at 50 percent each': {
    criterion: 'LR',
    critique: 'Basic arithmetic description lacking statistical register.',
    critiqueSi: 'සරල ගණිතමය විස්තර කිරීමකි.',
    value: 'Upgrades to "reached parity at 50%", showcasing authentic academic and statistical terminology (LR Band 8).',
    valueSi: '"reached parity" යන උසස් සංඛ්‍යානමය යෙදුම භාවිත කරයි.'
  },
  'reached a peak in 2001 at about 69 percent': {
    criterion: 'LR',
    critique: 'Basic verb-noun collocation for a milestone high point.',
    critiqueSi: 'සාමාන්‍ය වචන සංයෝජනයකි.',
    value: 'Upgrades to "culminated in a peak of 69% in 2001", an exemplary Band 8 collocation (+LR).',
    valueSi: '"culminated in a peak of" යන Band 8 මට්ටමේ උසස් යෙදුම භාවිත කරයි.'
  },
  'decreased continuously until 2001': {
    criterion: 'CC',
    critique: 'Repetitive trend verbs across paragraphs weaken lexical cohesion.',
    critiqueSi: 'එකම වචන නැවත නැවත යෙදීමෙන් වාක්‍ය විවිධත්වය අඩු වේ.',
    value: 'Upgrades to "declined continuously over the same timeframe", establishing elegant parallel cohesion (+CC & LR).',
    valueSi: '"declined continuously" යොදා වචන විවිධත්වය සහ Cohesion වැඩි කරයි.'
  },
  'reached a low of': {
    criterion: 'LR',
    critique: '"reached a low" is a basic idiom.',
    critiqueSi: '"reached a low" යනු සරල යෙදුමකි.',
    value: 'Upgrades to authentic economic idiom "bottomed out at 31% in 2001" (LR Band 8).',
    valueSi: '"bottomed out at" යන නිවැරදි ආර්ථික විද්‍යාත්මක යෙදුම භාවිත කරයි.'
  },
  'renting increased again to 36 percent': {
    criterion: 'TR',
    critique: 'Mechanical description that misses the opportunity to evaluate the final trend reversal.',
    critiqueSi: 'අවසාන දශකයේ සිදුවූ පෙරළිය විශ්ලේෂණය කර නොතිබීම.',
    value: 'Upgrades to "this trend reversed slightly with rentals recovering to 36%", fulfilling Band 8.5 Task Achievement.',
    valueSi: 'ප්‍රවණතාවයේ වෙනස්වීම ගැඹුරින් විස්තර කරමින් Task Achievement ඉහළ නංවයි.'
  },
  'fell to 64 percent': {
    criterion: 'LR',
    critique: '"fell" is an elementary school verb for downward movement.',
    critiqueSi: '"fell" යනු සරල ක්‍රියාපදයකි.',
    value: 'Upgrades to precise economic reporting verb "contracted marginally to 64%" (LR Band 8).',
    valueSi: '"contracted marginally" යන ශාස්ත්‍රීය ආර්ථික විද්‍යාත්මක යෙදුම භාවිත කරයි.'
  },

  // Task 2 Upgrades
  'big': {
    criterion: 'LR',
    critique: 'Generic spoken adjective. In IELTS Academic Task 2, "big" lacks precision and caps Lexical Resource at Band 6.0.',
    critiqueSi: '"big" යනු කතාබහේදී යොදන සරල වචනයකි. ශාස්ත්‍රීය රචනයකදී එය Lexical Resource ලකුණු Band 6.0 මට්ටමට සීමා කරයි.',
    value: 'Upgrades to "significant/substantial", demonstrating formal academic precision and lifting Lexical Resource to Band 8.0.',
    valueSi: 'වඩාත් විධිමත් ශාස්ත්‍රීය විශේෂණ පදයක් යොදා LR ලකුණු Band 8.0 දක්වා ඉහළ නංවයි.'
  },
  'study what they like': {
    criterion: 'TR',
    critique: 'Directly echoes the question prompt ("study what they like") without demonstrating candidate paraphrasing ability.',
    critiqueSi: 'ප්‍රශ්නයේ ඇති වචන ඒ ආකාරයෙන්ම නැවත යෙදීමකි. ස්වාධීන වචන මාලාවක් නොපෙන්වයි.',
    value: 'Paraphrases prompt into "be free to study whatever they enjoy", showing flexible syntax and satisfying Band 8 Task Response.',
    valueSi: 'ප්‍රශ්නයේ අදහස වඩාත් පරිණත ලෙස විස්තර කර TR සහ LR ලකුණු ඉහළ නංවයි.'
  },
  'other people': {
    criterion: 'CC',
    critique: 'Repetitive nominal phrasing following "Some people...". Lacks cohesion and variety in discourse referencing.',
    critiqueSi: '"Some people" යෙදීමෙන් පසු නැවත "other people" කියා පුනරාවර්තනය කිරීම දුර්වල යෙදුමකි.',
    value: 'Substitutes concise pronoun "others", establishing elegant cohesion and varied referencing for Coherence & Cohesion (CC).',
    valueSi: '"others" ලෙස කෙටියෙන් යොදා Coherence & Cohesion (CC) මට්ටම ඉහළ නංවයි.'
  },
  'must': {
    criterion: 'TR',
    critique: 'Excessively dogmatic modality ("must only study"). High-band IELTS academic writing uses hedged, balanced argument.',
    critiqueSi: '"must only study" යනු අනවශ්‍ය තරම් දැඩි, ඒකපාර්ශ්වික ප්‍රකාශයකි.',
    value: 'Softens to academic recommendation "should", correctly mirroring the nuanced prompt requirement.',
    valueSi: '"should" ලෙස සමබර ශාස්ත්‍රීය ප්‍රවේශයක් යොදා Task Response නිවැරදි කරයි.'
  },
  'useful subjects like': {
    criterion: 'LR',
    critique: '"useful" is vague and elementary; using "like" to introduce formal academic examples sounds colloquial.',
    critiqueSi: '"useful" යනු සරල වචනයකි. උදාහරණ දැක්වීමට "like" යෙදීම කතාබහේදී කරන දෙයකි.',
    value: 'Upgrades to "subjects with clear practical value, such as", exhibiting sophisticated collocation and academic exemplar syntax.',
    valueSi: '"such as" සහ "clear practical value" යොදා විධිමත් ශාස්ත්‍රීය වචන භාවිතය (LR) පෙන්වයි.'
  },
  'give my opinion': {
    criterion: 'TR',
    critique: 'Mechanical, memorised formula ("give my opinion"). It fails to state the candidate\'s actual perspective in the introduction.',
    critiqueSi: '"give my opinion" යනු කටපාඩම් කළ සරල වාක්‍යයකි. මෙහිදී සැබෑ ස්ථාවරය පැහැදිලි නොවේ.',
    value: 'Explicitly outlines candidate stance from the outset: "explain why I believe students should be free to choose...", securing Band 8 TR.',
    valueSi: 'හැඳින්වීමේදීම පැහැදිලි තර්කානුකූල ස්ථාවරයක් ගොඩනගා Task Response Band 8 මට්ටමට ඔසවා තබයි.'
  },
  'many people have different opinions about this': {
    criterion: 'CC',
    critique: 'Empty, low-content filler sentence. It wastes word count without delivering a clear paragraph topic or argument.',
    critiqueSi: 'කිසිදු නිශ්චිත අදහසක් නොමැති හිස් වාක්‍යයකි.',
    value: 'Replaces with an authoritative topic sentence: "there are strong reasons to let students follow their own interests" (+CC & TR).',
    valueSi: 'ඡේදයේ ප්‍රධාන තර්කය මුලින්ම පැහැදිලි කරන ශක්තිමත් ආරම්භක වාක්‍යයක් යොදයි.'
  },
  'will work hard and get good marks': {
    criterion: 'LR',
    critique: '"get good marks" is school-level English; absolute predictive auxiliary "will work hard" lacks scholarly hedging.',
    critiqueSi: '"get good marks" යනු ප්‍රාථමික පාසල් මට්ටමේ සරල යෙදුමකි.',
    value: 'Upgrades to "are likely to work harder and achieve higher grades", displaying academic collocation and probabilistic modal hedging.',
    valueSi: '"achieve higher grades" සහ "are likely to" යොදා Band 8 ශාස්ත්‍රීය වචන භාවිතය සනාථ කරයි.'
  },
  'loves': {
    criterion: 'GRA',
    critique: 'Present simple "loves" fails to convey a lasting, continuous commitment and limits grammatical range.',
    critiqueSi: 'සරල වර්තමාන කාලය යෙදීමෙන් ගැඹුරු ව්‍යාකරණ විවිධත්වයක් නොපෙනේ.',
    value: 'Uses Present Perfect "has always loved", demonstrating advanced tense aspect for Grammatical Range & Accuracy (GRA).',
    valueSi: 'Present Perfect කාලය යොදා ව්‍යාකරණ විවිධත්වය (GRA Band 8) ප්‍රදර්ශනය කරයි.'
  },
  'successful graphic': {
    criterion: 'TR',
    critique: 'Vague example ("he is a designer") lacks descriptive specificity and credibility.',
    critiqueSi: 'සාමාන්‍ය "designer" යන්න තර්කය ඔප්පු කිරීමට ප්‍රමාණවත් තරම් ප්‍රබල නොවේ.',
    value: 'Enriches to "successful graphic designer", providing tangible, convincing supporting detail for Task Response.',
    valueSi: 'වඩාත් පැහැදිලි සහ ආකර්ෂණීය උදාහරණයක් මගින් තර්කය ශක්තිමත් කරයි.'
  },
  'think': {
    criterion: 'LR',
    critique: 'Overused spoken verb. High-scoring candidates employ precise academic reporting verbs for counter-arguments.',
    critiqueSi: '"think" යනු සාමාන්‍ය කතාබහේදී නිතර භාවිත වන සරල ක්‍රියාපදයකි.',
    value: 'Replaces with scholarly reporting verb "argue that", establishing objective academic distance (+LR & CC).',
    valueSi: 'ශාස්ත්‍රීය වාර්තාකරණ ක්‍රියාපදයක් වන "argue that" යොදා ගනී.'
  },
  'give many jobs': {
    criterion: 'LR',
    critique: '"give jobs" is unnatural phrasing in English. Economies and industries do not "give" jobs; "many jobs" is informal.',
    critiqueSi: '"give jobs" යනු ඉංග්‍රීසි භාෂාවේ ස්වභාවික යෙදුමක් නොවේ.',
    value: 'Upgrades to authentic economic collocation "create a large number of well-paid jobs", fulfilling Band 8 Lexical Resource.',
    valueSi: '"create well-paid jobs" යන ස්වභාවික ශාස්ත්‍රීය ආර්ථික විද්‍යාත්මක යෙදුම භාවිත කරයි.'
  },
  'good points': {
    criterion: 'LR',
    critique: 'Casual conversational idiom ("have good points") that undermines the analytical authority of the conclusion.',
    critiqueSi: '"good points" යනු අනියම් කතාබහේදී යෙදෙන සරල යෙදුමකි.',
    value: 'Replaces with formal academic collocation "valid arguments", reinforcing sophisticated vocabulary (+LR Band 8).',
    valueSi: '"valid arguments" යනු Band 8 මට්ටමේ නිවැරදි ශාස්ත්‍රීය වචන සංයෝජනයකි.'
  },
  'about jobs': {
    criterion: 'LR',
    critique: 'Vague prepositional phrase common in elementary discourse.',
    critiqueSi: '"about jobs" යනු අපැහැදිලි සරල යෙදුමකි.',
    value: 'Upgrades to "carefully about their future employment", demonstrating precise prepositional usage and formal terminology.',
    valueSi: '"future employment" ලෙස වඩාත් නිශ්චිත වෘත්තීය යෙදුමක් යෙදීම.'
  },
  'should balance both sides': {
    criterion: 'TR',
    critique: 'Clichéd, superficial conclusion ("balance both sides") that offers zero concrete, actionable synthesis or policy depth.',
    critiqueSi: '"balance both sides" යනු අපැහැදිලි, සරල නිගමනයකි.',
    value: 'Synthesizes concrete institutional policy: "could support this by balancing students\' interests with the needs of the job market, for example, by offering career guidance", satisfying Band 8.5 TR.',
    valueSi: 'දෙපාර්ශ්වයේම අදහස් නිශ්චිත ප්‍රතිපත්තිමය විසඳුමක් සමග සංසන්දනය කර පරිණත නිගමනයකට එළඹේ.'
  },
  'I think': {
    criterion: 'CC',
    critique: 'Weak, redundant personal announcement in concluding summary.',
    critiqueSi: 'නිගමනයේදී අනවශ්‍ය ලෙස තමන්ගේ මතය සරලව ප්‍රකාශ කිරීමකි.',
    value: 'Removes redundant phrase and establishes a stronger, authoritative conclusion in the subsequent sentence (+CC).',
    valueSi: 'අනවශ්‍ය සරල වචන ඉවත් කර ශාස්ත්‍රීය ස්වරය තහවුරු කරයි.'
  },
  'South Korea': {
    criterion: 'TR',
    critique: 'The argument lacks an empirical national case study to validate technology-led economic growth.',
    critiqueSi: 'තාක්ෂණික අධ්‍යාපනයේ වැදගත්කම ඔප්පු කිරීමට නිශ්චිත රටක උදාහරණයක් නොමැතිකම.',
    value: 'Inserts real-world national evidence: "South Korea, for instance, has grown rapidly...", securing Band 8.5 Task Response.',
    valueSi: 'දකුණු කොරියාවේ ආර්ථික සංවර්ධනය උදාහරණයක් ලෙස දක්වා තර්කය තහවුරු කරයි.'
  },
  'job market': {
    criterion: 'TR',
    critique: 'Leaves the vulnerability of humanities degrees unsubstantiated.',
    critiqueSi: 'කලා හෝ ඉතිහාසය හදාරන්නන් මුහුණ දෙන අභියෝගයට හේතුව පැහැදිලි කර නොතිබීම.',
    value: 'Appends causal clause: "because the job market in these fields is highly competitive", achieving full idea elaboration.',
    valueSi: 'රැකියා වෙළඳපොළේ තරඟකාරීත්වය පැහැදිලි කරමින් තර්කය සම්පූර්ණ කරයි.'
  },
  'Motivated learners': {
    criterion: 'TR',
    critique: 'Argument stops at test marks without elaborating post-graduation benefits.',
    critiqueSi: 'ශිෂ්‍ය උනන්දුවේ දිගුකාලීන වාසිය පැහැදිලි කර නොතිබීම.',
    value: 'Inserts analytical elaboration: "Motivated learners are also more likely to keep developing their skills...", securing Band 8 TR.',
    valueSi: 'උපාධියෙන් පසුවද දක්ෂතා වර්ධනය වන බව පෙන්වා දෙමින් තර්කය ගැඹුරු කරයි.'
  },
  'In my view': {
    criterion: 'CC',
    critique: 'Conclusion lacks a clear, sophisticated discourse marker signaling authorial verdict.',
    critiqueSi: 'කතුවරයාගේ අවසන් තීරණය හඳුන්වා දීමට විධිමත් සංක්‍රාන්ති යෙදුමක් නොතිබීම.',
    value: 'Injects formal discourse marker "In my view,", clearly demarcating the candidate\'s concluding judgment (+CC).',
    valueSi: '"In my view," යොදා අවසන් තීරණය විධිමත් ලෙස සටහන් කරයි.'
  },

  // Cambridge 1 Test 1: Adult Education & Cost Upgrades
  'the charts show': {
    criterion: 'LR',
    critique: '"show" is an elementary reporting verb that misses the opportunity to display higher-register Academic vocabulary.',
    critiqueSi: '"show" යනු මූලික ක්‍රියාපදයකි. ඒ වෙනුවට ශාස්ත්‍රීය වාර්තාකරණ ක්‍රියාපදයක් යෙදිය යුතුය.',
    value: 'Upgrades to "illustrate", establishing an authentic Band 8 introductory tone.',
    valueSi: 'විධිමත් වාර්තාකරණ ක්‍රියාපදයක් යොදා ආරම්භයේදීම LR ලකුණු ඉහළ නංවයි.'
  },
  'why adults study': {
    criterion: 'TR',
    critique: 'Directly copies the prompt wording without demonstrating lexical variety or academic nominalisation.',
    critiqueSi: 'ප්‍රශ්නයේ ඇති වචන ඒ ආකාරයෙන්ම නැවත යෙදීමකි.',
    value: 'Upgrades to "the primary motivations prompting adult learners to pursue further education" (+TR & LR).',
    valueSi: 'ප්‍රශ්නයේ අදහස වඩාත් පරිණත ශාස්ත්‍රීය වචන වලින් ප්‍රතිසංස්කරණය කරයි.'
  },
  'who should pay the costs': {
    criterion: 'LR',
    critique: 'Spoken informal phrasing for public policy and expenditure distribution.',
    critiqueSi: 'මුදල් ගෙවීම පිළිබඳ කතාබහේදී යොදන සරල යෙදුමකි.',
    value: 'Upgrades to "public consensus regarding the equitable distribution of course funding" (+LR Band 8).',
    valueSi: 'පාඨමාලා වියදම් බෙදී යාම පිළිබඳ රාජ්‍ය ප්‍රතිපත්ති යෙදුම් භාවිත කරයි.'
  },
  'helpful for current job': {
    criterion: 'LR',
    critique: '"helpful for" is basic spoken English for vocational utility.',
    critiqueSi: '"helpful for" යනු කතාබහේදී යොදන සරල වචනයකි.',
    value: 'Upgrades to "vocational relevance to current employment", demonstrating professional academic register.',
    valueSi: 'වෘත්තීය උපයෝගීතාව විධිමත් ලෙස විස්තර කරයි.'
  },
  'to improve prospects of promotion': {
    criterion: 'LR',
    critique: 'Formulaic phrasing that can be made significantly more concise and impactful.',
    critiqueSi: 'වඩාත් සංක්ෂිප්ත හා ප්‍රබල ශාස්ත්‍රීය යෙදුමක් යෙදිය හැක.',
    value: 'Upgrades to "securing vertical career advancement", showcasing exemplary Band 8 collocation.',
    valueSi: '"securing vertical career advancement" යන උසස් වෘත්තීය යෙදුම භාවිත කරයි.'
  },
  'enjoy learning': {
    criterion: 'LR',
    critique: 'Informal verbal phrase without academic nominalisation.',
    critiqueSi: 'ශාස්ත්‍රීය නොවන සරල ක්‍රියාපද යෙදුමකි.',
    value: 'Upgrades to "recreational knowledge acquisition" (+LR Band 8).',
    valueSi: 'ශාස්ත්‍රීය නාමකරණයක් යොදා LR ලකුණු ඉහළ නංවයි.'
  },
  'able to change jobs': {
    criterion: 'LR',
    critique: 'Basic verbal clause lacking executive professional register.',
    critiqueSi: 'රැකියා මාරුව පිළිබඳ සරල යෙදුමකි.',
    value: 'Upgrades to "facilitating a professional career transition" (+LR Band 8.5).',
    valueSi: 'වෘත්තීය ක්ෂේත්‍ර මාරුව පිළිබඳ විධිමත් ශාස්ත්‍රීය යෙදුම භාවිත කරයි.'
  },
  'people think': {
    criterion: 'CC',
    critique: '"people think" is elementary spoken English for survey and opinion reporting.',
    critiqueSi: '"people think" යනු සරල කතාබහේ යෙදුමකි.',
    value: 'Upgrades to "respondents advocated that", demonstrating academic statistical analysis register.',
    valueSi: 'සමීක්ෂණ දත්ත වාර්තා කිරීමේ විධිමත් ක්‍රියාපදය යොදයි.'
  },
  'individual should pay': {
    criterion: 'LR',
    critique: 'Colloquial spoken phrasing for personal financial liability.',
    critiqueSi: 'වියදම් දැරීම පිළිබඳ සරල යෙදුමකි.',
    value: 'Upgrades to "learners themselves should shoulder", exhibiting authentic collocation.',
    valueSi: 'ඉගෙනුම්කරුවන් විසින්ම වියදම් දැරීම පිළිබඳ උසස් යෙදුම භාවිත කරයි.'
  },
  'taxpayer should pay': {
    criterion: 'TR',
    critique: 'Informal reference to public fiscal funding.',
    critiqueSi: 'රජයේ මූල්‍ය ප්‍රතිපාදන පිළිබඳ සරල ප්‍රකාශයකි.',
    value: 'Upgrades to "the state should finance", reflecting formal public economics terminology.',
    valueSi: 'රාජ්‍ය මූල්‍ය ප්‍රතිපාදන පිළිබඳ නිවැරදි වචන යොදයි.'
  },
  'employer should pay': {
    criterion: 'LR',
    critique: 'Basic conversational English.',
    critiqueSi: 'සේවා යෝජකයා ගෙවීම පිළිබඳ සරල යෙදුමකි.',
    value: 'Upgrades to "commercial enterprises should contribute", fulfilling Band 8 Lexical Resource.',
    valueSi: 'ආයතනික දායකත්වය පිළිබඳ විධිමත් ආර්ථික යෙදුම භාවිත කරයි.'
  },
  'main reasons': {
    criterion: 'LR',
    critique: '"main reasons" is an overused cliché in Task 1 summaries.',
    critiqueSi: '"main reasons" යනු නිතර භාවිතා වන සරල වචනයකි.',
    value: 'Upgrades to "predominant catalysts", demonstrating rich and varied vocabulary.',
    valueSi: '"predominant catalysts" යොදා වචන මාලාවේ පොහොසත්කම පෙන්වයි.'
  },

  // Cambridge 17 Test 2: Fuel Prices & Environment
  'in the modern world': {
    criterion: 'LR',
    critique: '"In the modern world" is an overused IELTS memorised formula.',
    critiqueSi: '"In the modern world" යනු කටපාඩම් කළ සරල හැඳින්වීමකි.',
    value: 'Upgrades to "In contemporary globalized society", lifting register to Band 8.',
    valueSi: 'විධිමත් ශාස්ත්‍රීය සමාජ විද්‍යාත්මක හැඳින්වීමක් යොදයි.'
  },
  'more and more serious': {
    criterion: 'LR',
    critique: 'Conversational repetition ("more and more") discouraged in formal academic writing.',
    critiqueSi: '"more and more" යනු කතාබහේදී යොදන සරල පුනරාවර්තනයකි.',
    value: 'Upgrades to "increasingly acute and multifaceted", demonstrating advanced lexical range.',
    valueSi: '"increasingly acute" යොදා ගැටලුවේ බරපතලකම ගැඹුරින් විස්තර කරයි.'
  },
  'disagree with this opinion': {
    criterion: 'TR',
    critique: 'Basic spoken reaction that lacks analytical conviction.',
    critiqueSi: 'සරල එකඟ නොවීමකි.',
    value: 'Upgrades to "strongly dispute this contention", asserting a powerful and authoritative academic stance.',
    valueSi: 'ශක්තිමත් ශාස්ත්‍රීය ස්ථාවරයක් ගොඩනගා Task Response ඉහළ නංවයි.'
  },
  'cost of living will increase': {
    criterion: 'LR',
    critique: 'Simple spoken sentence for economic inflation.',
    critiqueSi: 'ජීවන වියදම ඉහළ යාම පිළිබඳ සරල ප්‍රකාශයකි.',
    value: 'Upgrades to "household expenditures escalate drastically", exhibiting macroeconomic accuracy.',
    valueSi: 'ආර්ථික විද්‍යාත්මක නිවැරදි යෙදුම් භාවිත කරයි.'
  },
  'protect the environment': {
    criterion: 'LR',
    critique: 'Elementary collocation repeated from primary school English.',
    critiqueSi: 'නිතර භාවිත වන සරල යෙදුමකි.',
    value: 'Upgrades to "safeguard ecological integrity", setting a distinguished Band 8 standard.',
    valueSi: '"safeguard ecological integrity" යන උසස් පාරිසරික යෙදුම භාවිත කරයි.'
  },

  // Additional Cambridge 1 Process, Wealth, Sports, and Population Upgrades
  'the diagram shows': {
    criterion: 'LR',
    critique: 'Standard prompt repetition without demonstrating report register.',
    critiqueSi: 'ප්‍රශ්නයේ ඇති සරල යෙදුමයි.',
    value: 'Upgrades to "The provided process diagram illustrates", demonstrating formal process reporting.',
    valueSi: 'ක්‍රියාවලි සටහන් සඳහා විධිමත් වාර්තාකරණ යෙදුම භාවිත කරයි.'
  },
  'rich countries have plenty of money': {
    criterion: 'LR',
    critique: '"plenty of money" is colloquial spoken English.',
    critiqueSi: '"plenty of money" යනු කතාබහේදී යොදන සරල වචනයකි.',
    value: 'Upgrades to "Affluent industrialized nations command substantial fiscal capital" (+LR Band 8.5).',
    valueSi: 'විධිමත් ආර්ථික හා සමාජ විද්‍යාත්මක යෙදුම් භාවිත කරයි.'
  },
  'footballers and basketball players earn too much money': {
    criterion: 'LR',
    critique: 'Spoken, casual opening statement.',
    critiqueSi: 'කතාබහේදී අදහස් දක්වන සරල ආරම්භයකි.',
    value: 'Upgrades to "Elite professional athletes receive disproportionately exorbitant financial compensation" (+LR Band 8.5).',
    valueSi: 'වෘත්තීය මලල ක්‍රීඩක වැටුප් පිළිබඳ විධිමත් ශාස්ත්‍රීය විවේචනයක් ඉදිරිපත් කරයි.'
  },
  'doctors save lives and teachers educate children': {
    criterion: 'TR',
    critique: 'Superficial parallel statement that misses the opportunity to contrast essential human capital.',
    critiqueSi: 'කරුණු මතුපිටින් සැසඳීමකි.',
    value: 'Upgrades to "Healthcare practitioners preserve human life whilst educators foster essential civic and intellectual capital" (+TR & LR).',
    valueSi: 'සමාජයට අත්‍යවශ්‍ය සේවාවන් ගැඹුරින් විශ්ලේෂණය කරමින් ලකුණු ඉහළ නංවයි.'
  },
  'university is very expensive nowadays': {
    criterion: 'LR',
    critique: 'Everyday spoken phrasing.',
    critiqueSi: '"very expensive" යනු සාමාන්‍ය කතාබහේ යෙදුමකි.',
    value: 'Upgrades to "Tertiary education imposes an onerous financial commitment in contemporary society" (+LR Band 8).',
    valueSi: 'උසස් අධ්‍යාපන වියදම් පිළිබඳ විධිමත් සමාජ විද්‍යාත්මක යෙදුම භාවිත කරයි.'
  },
  'computers are used in many places today': {
    criterion: 'LR',
    critique: 'Elementary descriptive formula.',
    critiqueSi: 'මූලික විස්තරාත්මක යෙදුමකි.',
    value: 'Upgrades to "Computational and digital technologies have thoroughly permeated contemporary commerce and education" (+LR Band 8).',
    valueSi: 'තාක්ෂණික ව්‍යාප්තිය පිළිබඳ උසස් ශාස්ත්‍රීය යෙදුම භාවිත කරයි.'
  }
};

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

        const criterion = exp?.criterion || (s.type === 'ins' ? 'TR' : 'LR');

        list.push({
          id,
          type: s.type,
          originalText: s.type === 'ins' ? '' : s.text,
          upgradedText: s.type === 'del' ? '' : (s.type === 'replace' ? (s.to || '') : s.text),
          criterion,
          originalCritique: exp?.critique || (
            s.type === 'del'
              ? `The phrasing "${orig}" is conversational filler in an academic essay and creates stylistic weakness.`
              : `The original expression "${orig}" is basic or informal English for IELTS Academic Task 2.`
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

  // Keep active upgrade IDs in sync when upgradeItems change
  useEffect(() => {
    setActiveUpgradeIds(new Set(upgradeItems.map(u => u.id)));
  }, [upgradeItems]);

  // Dedicated hover state for separate striked vs added tooltips
  const [hovered, setHovered] = useState<{ id: string; target: 'striked' | 'added' } | null>(null);

  // Collapsible toggle for detailed criteria progress breakdown
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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
            <div className="flex items-center gap-2 font-mono text-[11px] text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-200">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>{activeCount} of {totalCount} Upgrades Active</span>
            </div>
          </div>

          {/* Interactive Legend with Action Indicators */}
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
        </div>

        {/* Text Container */}
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
                    <del
                      onMouseEnter={() => setHovered({ id: item.id, target: 'striked' })}
                      onMouseLeave={() => setHovered(null)}
                      className="line-through decoration-rose-500 decoration-2 text-slate-400 select-none mr-1.5 font-serif text-sm cursor-help hover:text-slate-600 transition-colors"
                    >
                      {item.originalText}
                    </del>

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
                            Existing Word Limitation
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-bold">
                            Band 6.0–6.5 Spoken
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold text-rose-200">
                            Striked Word: <span className="line-through text-slate-300 font-serif font-normal">"{item.originalText}"</span>
                          </div>
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
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold text-emerald-200">
                            Upgraded: <span className="text-white font-serif font-bold">"{item.upgradedText}"</span>
                          </div>
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
                      <p className="text-slate-200 text-[11px]">
                        Click <span className="font-bold text-emerald-300">+{item.criterion}</span> to upgrade to <span className="font-bold text-indigo-300">"{item.upgradedText}"</span> and raise your score.
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
                        <p className="text-slate-100 text-[11px] leading-relaxed">
                          {item.upgradeValue}
                        </p>
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
                      <div className="absolute left-0 bottom-full mb-2 z-50 w-72 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-sans shadow-2xl border border-rose-500/40 space-y-1.5 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        <span className="font-bold text-[10px] uppercase text-rose-300 font-mono block">
                          Redundant Word Omitted
                        </span>
                        <p className="text-slate-200 text-[11px]">
                          {item.originalCritique}
                        </p>
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
                <div className="text-xs space-y-1.5 font-sans">
                  {item.originalText && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10px] font-bold text-rose-600 uppercase font-mono">Stage 2 Word:</span>
                      <span className="line-through text-slate-500 font-serif">"{item.originalText}"</span>
                    </div>
                  )}

                  {item.upgradedText && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono">Band 8 Word:</span>
                      <span className="font-bold text-indigo-950 font-serif">"{item.upgradedText}"</span>
                    </div>
                  )}

                  {/* Critique & Value Added */}
                  <div className="pt-1 space-y-1">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong className="text-slate-800">Why striked:</strong> {item.originalCritique}
                    </p>
                    <p className="text-[11px] text-indigo-950 leading-relaxed font-medium">
                      <strong className="text-emerald-700">Value added:</strong> {item.upgradeValue}
                    </p>
                  </div>

                  {showSinhala && (item.upgradeValueSi || item.originalCritiqueSi) && (
                    <div className="text-[10px] text-slate-500 pt-1 leading-relaxed bg-white/70 p-2 rounded-lg border border-slate-100 font-sinhala">
                      💡 {item.upgradeValueSi || item.originalCritiqueSi}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
