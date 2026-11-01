import React, { useState, useMemo } from 'react';
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
  // Task 1 Demographic & Trend Upgrades
  'gives information': {
    criterion: 'LR',
    critique: 'Repetitive prompt language. In IELTS Task 1, academic reporting verbs like "illustrates" or "delineates" are expected.',
    critiqueSi: 'ප්‍රශ්නයේ ඇති වචන නැවත යෙදීමකි. "illustrates" වැනි විධිමත් ක්‍රියාපදයක් යෙදිය යුතුය.',
    value: 'Upgrades to "illustrates the proportion...", fulfilling Band 8 Lexical Resource and Task Achievement.',
    valueSi: 'ශාස්ත්‍රීය වාර්තාකරණ ක්‍රියාපදයක් යොදා LR ලකුණු ඉහළ නංවයි.'
  },
  'give information': {
    criterion: 'LR',
    critique: 'Repetitive prompt language. In IELTS Task 1, academic reporting verbs like "illustrates" or "delineates" are expected.',
    critiqueSi: 'ප්‍රශ්නයේ ඇති වචන නැවත යෙදීමකි. "illustrates" වැනි විධිමත් ක්‍රියාපදයක් යෙදිය යුතුය.',
    value: 'Upgrades to "illustrates the proportion...", fulfilling Band 8 Lexical Resource and Task Achievement.',
    valueSi: 'ශාස්ත්‍රීය වාර්තාකරණ ක්‍රියාපදයක් යොදා LR ලකුණු ඉහළ නංවයි.'
  },
  'how many people': {
    criterion: 'TR',
    critique: 'Inaccurate representation of data: the chart presents percentage of households, not an absolute headcount of people.',
    critiqueSi: 'ප්‍රස්ථාරයේ දැක්වෙන්නේ කුටුම්භ ප්‍රතිශතයයි, පුද්ගල ගණන නොවේ.',
    value: 'Accurately defines data as "the proportion of households in owned versus rented accommodation" (+TA Band 8).',
    valueSi: 'දත්ත නිවැරදිව ශාස්ත්‍රීය කාණ්ඩ මගින් අර්ථ දක්වා Task Achievement ඉහළ නංවයි.'
  },
  'very high': {
    criterion: 'LR',
    critique: 'Colloquial spoken intensifier ("very high"). Lacks analytical demographic sophistication.',
    critiqueSi: '"very high" යනු කතාබහේදී යොදන සරල වචනයකි.',
    value: 'Upgrades to "overwhelmingly predominant in 1918", delivering formal demographic analysis (+LR Band 8).',
    valueSi: '"overwhelmingly predominant" ලෙස උසස් ශාස්ත්‍රීය යෙදුමක් භාවිත කරයි.'
  },
  'increased a lot': {
    criterion: 'LR',
    critique: '"a lot" is informal spoken English, strictly penalized in IELTS Academic Task 1.',
    critiqueSi: '"a lot" යනු අවිධිමත් කතාබහේ වචනයක් බැවින් ලකුණු අඩු වේ.',
    value: 'Upgrades to "experienced an enduring upward trajectory", demonstrating advanced collocation (+LR Band 8).',
    valueSi: 'උසස් ප්‍රවණතා විස්තරාත්මක යෙදුමක් යොදා Band 8 LR තහවුරු කරයි.'
  },
  'almost equal': {
    criterion: 'TR',
    critique: 'Fatal factual error in overview: in 2011, home ownership was 64% and renting was 36% (a 28% gap!). Parity was reached in 1971, not at the end.',
    critiqueSi: 'සාරාංශයේ බරපතල දත්ත වැරැද්දකි: 2011 දී දෙකම සමාන නොවේ (64% සහ 36%). සමාන වූයේ 1971 දීය.',
    value: 'Accurately captures the crossover and decade reversal: "eventually surpassing rental accommodation in 1971 before receding slightly in the final decade" (+TA Band 8.5).',
    valueSi: 'සැබෑ දත්ත ප්‍රවණතාව නිවැරදිව වාර්තා කරමින් Task Achievement Band 8.5 මට්ටමට ඔසවා තබයි.'
  },
  'was almost equal': {
    criterion: 'TR',
    critique: 'Fatal factual error in overview: in 2011, home ownership was 64% and renting was 36% (a 28% gap!). Parity was reached in 1971, not at the end.',
    critiqueSi: 'සාරාංශයේ බරපතල දත්ත වැරැද්දකි: 2011 දී දෙකම සමාන නොවේ (64% සහ 36%). සමාන වූයේ 1971 දීය.',
    value: 'Accurately captures the crossover and decade reversal: "eventually surpassing rental accommodation in 1971 before receding slightly in the final decade" (+TA Band 8.5).',
    valueSi: 'සැබෑ දත්ත ප්‍රවණතාව නිවැරදිව වාර්තා කරමින් Task Achievement Band 8.5 මට්ටමට ඔසවා තබයි.'
  },
  'were almost equal': {
    criterion: 'TR',
    critique: 'Fatal factual error in overview: in 2011, home ownership was 64% and renting was 36% (a 28% gap!). Parity was reached in 1971, not at the end.',
    critiqueSi: 'සාරාංශයේ බරපතල දත්ත වැරැද්දකි: 2011 දී දෙකම සමාන නොවේ (64% සහ 36%). සමාන වූයේ 1971 දීය.',
    value: 'Accurately captures the crossover and decade reversal: "eventually surpassing rental accommodation in 1971 before receding slightly in the final decade" (+TA Band 8.5).',
    valueSi: 'සැබෑ දත්ත ප්‍රවණතාව නිවැරදිව වාර්තා කරමින් Task Achievement Band 8.5 මට්ටමට ඔසවා තබයි.'
  },
  'around 77 percent': {
    criterion: 'LR',
    critique: '"around" is everyday conversational wording; continuous "were renting" is less concise than simple past.',
    critiqueSi: '"around" යනු සරල වචනයකි.',
    value: 'Upgrades to "approximately 77% of households rented their dwellings", using academic adverb and lexical variation (+LR Band 8).',
    valueSi: 'ශාස්ත්‍රීය සංඛ්‍යානමය යෙදුම් භාවිත කර LR ඉහළ නංවයි.'
  },
  '77 percent': {
    criterion: 'LR',
    critique: 'Everyday conversational phrasing; lacks statistical precision.',
    critiqueSi: 'සාමාන්‍ය කතාබහේ වචන මාලාවකි.',
    value: 'Upgrades to "approximately 77% of households rented their dwellings" (+LR Band 8).',
    valueSi: 'විධිමත් සංඛ්‍යානමය යෙදුමක් යෙදීම.'
  },
  'while only about': {
    criterion: 'CC',
    critique: '"while only about" is repetitive and wordy.',
    critiqueSi: 'අනවශ්‍ය ලෙස දිගු සරල සම්බන්ධකයකි.',
    value: 'Employs sophisticated contrast structure "compared to a mere 23% who owned their homes" (+CC & LR Band 8).',
    valueSi: 'උසස් සංසන්දනාත්මක වාක්‍ය රටාවක් යොදයි.'
  },
  '23 percent': {
    criterion: 'CC',
    critique: 'Simple coordinate clause lacking comparative impact.',
    critiqueSi: 'සරල වාක්‍ය රටාවකි.',
    value: 'Upgrades to "compared to a mere 23% who owned their homes", highlighting minority demographic status (+CC Band 8).',
    valueSi: 'සුළුතර ප්‍රතිශතය කැපී පෙනෙන ලෙස සංසන්දනය කරයි.'
  },
  'few decade': {
    criterion: 'TR',
    critique: '"few decade" is grammatically incorrect and mathematically vague.',
    critiqueSi: '"few decade" යනු ව්‍යාකරණමය වශයෙන් මෙන්ම ගණනය කිරීම් අතින්ද අපැහැදිලිය.',
    value: 'Quantifies exact historical period: "Over the subsequent five decades" (1918 to 1971) (+TA & LR Band 8).',
    valueSi: 'නිශ්චිත කාල පරතරය නිවැරදිව ගණනය කර දක්වයි.'
  },
  'few decades': {
    criterion: 'TR',
    critique: '"few decades" is vague. High-scoring candidates calculate the exact interval from the axes.',
    critiqueSi: 'ප්‍රස්ථාර අක්ෂවලින් නිශ්චිත කාලය ගණනය නොකිරීම.',
    value: 'Quantifies exact historical period: "Over the subsequent five decades" (1918 to 1971) (+TA & LR Band 8).',
    valueSi: 'නිශ්චිත කාල පරතරය නිවැරදිව ගණනය කර දක්වයි.'
  },
  'went up gradually': {
    criterion: 'LR',
    critique: '"went up" is a basic spoken phrasal verb unsuited for IELTS Academic writing.',
    critiqueSi: '"went up" යනු කතාබහේදී යොදන සරල යෙදුමකි.',
    value: 'Upgrades to formal academic trend verb "increased steadily" (+LR Band 8).',
    valueSi: 'විධිමත් ශාස්ත්‍රීය ප්‍රවණතා ක්‍රියාපදයක් යොදයි.'
  },
  'went up gradual': {
    criterion: 'LR',
    critique: '"went up" is basic and "gradual" is an adjective incorrectly modifying a verb.',
    critiqueSi: 'ක්‍රියාපදයක් විස්තර කිරීමට adjective යෙදීමේ වැරැද්දකි.',
    value: 'Upgrades to formal academic trend verb "increased steadily" (+LR Band 8).',
    valueSi: 'විධිමත් ශාස්ත්‍රීය ප්‍රවණතා ක්‍රියාපදයක් යොදයි.'
  },
  'both proportions were equal': {
    criterion: 'LR',
    critique: 'Mechanical repetition of "equal at 50 percent each".',
    critiqueSi: '"equal at 50 percent" යන්න සරල පුනරාවර්තනයකි.',
    value: 'Introduces advanced demographic concept: "home ownership reached parity with rental housing at 50%" (+LR Band 8).',
    valueSi: '"reached parity" යන උසස් සංඛ්‍යානමය සංකල්පය යොදයි.'
  },
  'both proportion was equal': {
    criterion: 'LR',
    critique: 'Double error: grammar agreement slip and mechanical repetition.',
    critiqueSi: 'ව්‍යාකරණ වැරැද්දක් සහිත සරල යෙදුමකි.',
    value: 'Introduces advanced demographic concept: "home ownership reached parity with rental housing at 50%" (+LR Band 8).',
    valueSi: '"reached parity" යන උසස් සංඛ්‍යානමය සංකල්පය යොදයි.'
  },
  'highest peak': {
    criterion: 'LR',
    critique: 'Tautological redundancy: a "peak" is already the highest point on a chart.',
    critiqueSi: '"peak" යනු දැනටමත් ඉහළම ස්ථානයයි. "highest peak" යැයි කීම අනවශ්‍යයි.',
    value: 'Uses natural academic culmination phrase: "culminating in a peak of 69% in 2001" (+LR Band 8).',
    valueSi: '"culminating in a peak" යන ස්වභාවික ශාස්ත්‍රීය යෙදුම භාවිත කරයි.'
  },
  'reached a peak': {
    criterion: 'LR',
    critique: 'Standard trend phrase that can be upgraded with participial culmination syntax.',
    critiqueSi: 'වඩාත් සංකීර්ණ වාක්‍ය රටාවකට ප්‍රතිසංස්කරණය කළ හැක.',
    value: 'Upgrades to "culminated in a peak of 69% in 2001" (+GRA & LR Band 8).',
    valueSi: 'වඩාත් උසස් වාක්‍ය රටාවක් යොදයි.'
  },
  'rented house decreased': {
    criterion: 'LR',
    critique: '"rented house" is an awkward category label; "decreased continuously until 2001" repeats the year 2001 twice.',
    critiqueSi: 'වචන මාලාවේ දුර්වලතාවක් සහ වසර පුනරාවර්තනය වීමක් ඇත.',
    value: 'Upgrades to "rental accommodation declined continuously over the same timeframe" (+CC & LR Band 8).',
    valueSi: 'කාණ්ඩ නාමය සහ සම්බන්ධක නිවැරදිව යොදයි.'
  },
  'lowest point of': {
    criterion: 'LR',
    critique: '"lowest point of" is wordy and the relative clause "where it reached" incorrectly uses "where" for a year.',
    critiqueSi: 'වසරක් සඳහා "where" යෙදීම වැරදිය.',
    value: 'Applies authentic trend participle: "bottoming out at a low of 31% in 2001" (+GRA & LR Band 8).',
    valueSi: '"bottoming out at" යන උසස් ප්‍රවණතා යෙදුම භාවිත කරයි.'
  },
  'renting increased again': {
    criterion: 'TR',
    critique: 'Simple listing of the final year numbers without synthesizing the historical trend reversal.',
    critiqueSi: 'අවසාන දශකයේ ප්‍රවණතා වෙනස්වීම විශ්ලේෂණය කර නොතිබීම.',
    value: 'Synthesizes trend reversal: "this downward trend reversed modestly, with rental tenure recovering to 36% while home ownership contracted to 64%" (+TA & LR Band 8.5).',
    valueSi: 'ප්‍රවණතාව ආපසු හැරීම ගැඹුරින් විශ්ලේෂණය කර Band 8.5 TA තහවුරු කරයි.'
  },
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
  }
};

export const InteractiveUpgradesSandbox: React.FC<InteractiveUpgradesSandboxProps> = ({
  correctedText,
  segments,
  stage2Criteria,
  stage2Band,
  showSinhala
}) => {
  // Ensure effectiveSegments always has upgrade operations (fallback to generated upgrades from correctedText if segments is plain text)
  const effectiveSegments = useMemo(() => {
    const hasEdits = segments && segments.some(s => s.type !== 'text');
    if (hasEdits) return segments;
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
  React.useEffect(() => {
    setActiveUpgradeIds(new Set(upgradeItems.map(u => u.id)));
  }, [upgradeItems]);

  // Dedicated hover state for separate striked vs added tooltips
  const [hovered, setHovered] = useState<{ id: string; target: 'striked' | 'added' } | null>(null);

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
      {/* 1. DYNAMIC BAND SCORE CONTROL PANEL */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-indigo-900/60 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Stage 3 · Improvement Pass
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-mono">
                <Sparkles className="w-3.5 h-3.5" /> Live Dynamic IELTS Score Simulator
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Stage 3 · Academic Upgrades Sandbox
            </h3>
            <p className="text-xs text-indigo-200/80 max-w-2xl leading-relaxed">
              This interactive view builds on your exact Stage 2 corrected essay. Hover over any striked word to see why the examiner penalizes it, or hover over newly added words to see the value added. Click the <strong>✕</strong> icon on any word to remove it, or <strong>+</strong> to restore it, and watch the Band score dynamically recalculate!
            </p>
          </div>

          {/* DYNAMIC BAND SCORE BADGE */}
          <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shrink-0">
            <div>
              <div className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider">
                Dynamic Band
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white flex items-baseline gap-1 font-mono">
                <span>Band {formatBand(dynamicOverall)}</span>
              </div>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-left text-xs font-mono">
              <div className="text-emerald-400 font-bold">
                +{scoreBoost.toFixed(1)} Band Boost
              </div>
              <div className="text-slate-300 text-[11px]">
                {activeCount} of {totalCount} Upgrades Active
              </div>
            </div>
          </div>
        </div>

        {/* 4 CRITERIA DYNAMIC PROGRESS METERS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
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

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
          <div className="text-indigo-200/90 text-[11px] flex items-center gap-2">
            <span>Score Progression:</span>
            <span className="font-bold font-mono text-white">
              {Math.round(ratio * 100)}% of Band 8 upgrades applied
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={revertAll}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Revert to Stage 2 Baseline ({formatBand(stage2Band)})</span>
            </button>
            <button
              type="button"
              onClick={applyAll}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-md hover:shadow-indigo-500/20 cursor-pointer text-xs"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Apply All Upgrades (Band 8.0)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE ESSAY SURFACE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <span>Stage 3 Interactive Essay Surface</span>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-mono">
              Base: Exact Stage 2 Corrected Text
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>Hover striked: See examiner limitation</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
              <span>Hover added: See value added</span>
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
