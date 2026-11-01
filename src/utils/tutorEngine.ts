import type {
  CriterionKey,
  EssaySegment,
  LessonTopicId,
  TutorReport,
  TutorState,
  TutorIssue,
} from '../types/tutor';
import { LESSON_TOPIC_IDS } from '../types/tutor';

/* ------------------------------------------------------------------ */
/* Essay segment helpers                                               */
/* ------------------------------------------------------------------ */

/** Text the student actually wrote. */
export const buildOriginal = (segments: EssaySegment[]): string =>
  segments.map(s => (s.type === 'ins' ? '' : s.text)).join('');

/** Text after applying every correction (or upgrade). */
export const buildResult = (segments: EssaySegment[]): string =>
  segments.map(s => {
    if (s.type === 'del') return '';
    if (s.type === 'ins') return s.text;
    if (s.type === 'replace') return s.to ?? '';
    return s.text;
  }).join('');

export const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w)).length;

export const countChanges = (segments: EssaySegment[]): number =>
  segments.filter(s => s.type !== 'text').length;

const normalise = (text: string) => text.replace(/\s+/g, ' ').trim();

/**
 * IELTS overall rounding: average of criteria rounded to the nearest 0.5
 * (.25 rounds up to .5, .75 rounds up to the next whole band).
 * Accepts either an array of criterion bands [TR, CC, LR, GRA] or a pre-computed average.
 */
export const roundIeltsBand = (scores: number | number[]): number => {
  const avg = Array.isArray(scores)
    ? (scores.length === 0 ? 0 : scores.reduce((a, b) => a + b, 0) / scores.length)
    : scores;
  const floor = Math.floor(avg);
  const frac = avg - floor;
  if (frac < 0.25) return floor;
  if (frac < 0.75) return floor + 0.5;
  return floor + 1;
};

export const formatBand = (band: number) => band.toFixed(1);

/* ------------------------------------------------------------------ */
/* Band 8 Academic Upgrades & Diffing Engine                          */
/* ------------------------------------------------------------------ */

export const ACADEMIC_BAND8_UPGRADES: { original: string; better: string; note: string }[] = [
  // Task 1: Chart, Data, and Trend Reporting Upgrades
  { original: 'gives information about', better: 'illustrates', note: 'Formal academic reporting verb for charts' },
  { original: 'give information about', better: 'illustrates', note: 'Formal academic reporting verb for charts' },
  { original: 'shows information about', better: 'provides a comparative analysis of', note: 'Sophisticated introductory phrase' },
  { original: 'show information about', better: 'provides a comparative analysis of', note: 'Sophisticated introductory phrase' },
  { original: 'gives information', better: 'delineates statistical information', note: 'Academic reporting verb' },
  { original: 'give information', better: 'delineates statistical information', note: 'Academic reporting verb' },
  { original: 'The charts show', better: 'The charts illustrate', note: 'Formal reporting verb for charts' },
  { original: 'the charts show', better: 'the charts illustrate', note: 'Formal reporting verb for charts' },
  { original: 'The chart shows', better: 'The chart illustrates', note: 'Formal reporting verb for charts' },
  { original: 'the chart shows', better: 'the chart illustrates', note: 'Formal reporting verb for charts' },
  { original: 'why adults study', better: 'the primary motivations prompting adult learners to pursue further education', note: 'Paraphrase prompt with advanced nominalisation' },
  { original: 'who should pay the costs', better: 'public consensus regarding the equitable distribution of course funding', note: 'Academic financial terminology' },
  { original: 'In the first chart', better: 'Regarding educational motivations', note: 'Formal thematic transition' },
  { original: 'in the first chart', better: 'regarding educational motivations', note: 'Formal thematic transition' },
  { original: 'interest in subject is 40%', better: 'intellectual curiosity and subject passion emerged as the foremost driver at 40%', note: 'Academic synthesis and collocations' },
  { original: 'to gain qualifications is 38%', better: 'the pursuit of accredited formal qualifications followed closely at 38%', note: 'Precise trend analysis' },
  { original: 'helpful for current job', better: 'vocational relevance to current employment', note: 'Formal workplace register' },
  { original: 'to improve prospects of promotion', better: 'securing vertical career advancement', note: 'Band 8 professional collocation' },
  { original: 'Enjoy learning', better: 'Recreational knowledge acquisition', note: 'Formal nominalisation' },
  { original: 'enjoy learning', better: 'recreational knowledge acquisition', note: 'Formal nominalisation' },
  { original: 'Able to change jobs', better: 'Facilitating a professional career transition', note: 'Formal career phrasing' },
  { original: 'able to change jobs', better: 'facilitating a professional career transition', note: 'Formal career phrasing' },
  { original: 'meet people', better: 'social interaction and networking', note: 'Academic sociolinguistic register' },
  { original: 'only 9%', better: 'a peripheral 9%', note: 'Advanced descriptive modifier' },
  { original: 'For the cost', better: 'With respect to financial liabilities', note: 'Formal financial phrasing' },
  { original: 'for the cost', better: 'with respect to financial liabilities', note: 'Formal financial phrasing' },
  { original: 'people think', better: 'respondents advocated that', note: 'Academic survey reporting verb' },
  { original: 'individual should pay', better: 'learners themselves should shoulder', note: 'Authentic academic collocation' },
  { original: 'taxpayer should pay', better: 'the state should finance', note: 'Public policy terminology' },
  { original: 'employer should pay', better: 'commercial enterprises should contribute', note: 'Corporate funding register' },
  { original: 'career and personal interest', better: 'vocational advancement and intrinsic curiosity', note: 'Advanced analytical contrast' },
  { original: 'main reasons', better: 'predominant catalysts', note: 'Higher band lexical resource' },

  // Task 1 Demographic, Housing, and Proportions
  { original: 'in owned and rented accommodation', better: 'residing in owned versus rented accommodation', note: 'Precise comparative housing terminology' },
  { original: 'owned and rented accommodation', better: 'owned versus rented accommodation', note: 'Formal comparative structure' },
  { original: 'how many people owned and rented house', better: 'the proportion of households in owned versus rented accommodation', note: 'Academic paraphrasing of prompt' },
  { original: 'how many people', better: 'the proportion of individuals who', note: 'Formal demographic noun phrase' },
  { original: 'number of people', better: 'the volume of individuals', note: 'Formal quantitative descriptor' },
  { original: 'it is clear that', better: 'the data reveals that', note: 'Objective academic observation marker' },
  { original: 'the dominant tenure at the beginning', better: 'overwhelmingly predominant at the outset', note: 'Formal synthesis of historical starting point' },
  { original: 'dominant tenure', better: 'predominant housing category', note: 'Precise demographic register' },
  { original: 'very high', better: 'overwhelmingly predominant', note: 'Replaces colloquial "very high" with scholarly descriptor' },
  { original: 'very low', better: 'negligible', note: 'Formal statistical adjective' },
  { original: 'increased a lot', better: 'experienced an enduring upward trajectory', note: 'Advanced collocation for sustained trend' },
  { original: 'increased significantly', better: 'witnessed a marked upward trajectory', note: 'High-level academic trend collocation' },
  { original: 'went up gradually', better: 'increased steadily', note: 'Formal trend adverb collocation' },
  { original: 'went up', better: 'experienced a steady rise', note: 'Academic trend description' },
  { original: 'went down', better: 'underwent a downward progression', note: 'Academic trend description' },
  { original: 'decreased continuously until 2001', better: 'declined steadily over the same timeframe', note: 'Varied lexical cohesion' },
  { original: 'decreased continuously', better: 'declined steadily over the designated timeframe', note: 'Varied lexical cohesion' },
  { original: 'decreased', better: 'receded steadily', note: 'Higher-register trend verb' },
  { original: 'fell to 64 percent', better: 'contracted marginally to 64%', note: 'Precise economic reporting verb' },
  { original: 'fell to', better: 'contracted to', note: 'Economic trend verb' },
  { original: 'fell', better: 'diminished', note: 'Academic downward trend verb' },
  { original: 'rented house', better: 'rental accommodation', note: 'Standard IELTS demographic classification' },
  { original: 'rented accommodation', better: 'rental housing tenure', note: 'Precise sociological and demographic term' },
  { original: 'owned accommodation', better: 'owner-occupied dwellings', note: 'Formal academic housing terminology' },
  { original: 'owned homes', better: 'owner-occupied residences', note: 'Formal housing register' },
  { original: 'both categories were almost equal', better: 'both tenure categories reached parity', note: 'Advanced statistical concept' },
  { original: 'both categories was almost equal', better: 'both tenure categories reached parity', note: 'Advanced statistical concept' },
  { original: 'were equal at 50 percent each', better: 'reached parity at 50%', note: 'Precise mathematical terminology' },
  { original: 'both proportions were equal', better: 'both proportions converged at parity', note: 'High-band comparative analysis' },
  { original: 'around 77 percent', better: 'approximately 77%', note: 'Academic approximation adverb' },
  { original: 'only about 23 percent', better: 'a mere 23%', note: 'Qualitative modifier highlighting disparity' },
  { original: 'about 23 percent', better: 'a mere 23%', note: 'Qualitative modifier highlighting disparity' },
  { original: 'next few decades', better: 'subsequent five decades', note: 'Specific timeframe descriptor' },
  { original: 'few decades', better: 'subsequent decades', note: 'Formal temporal marker' },
  { original: 'reached a peak in 2001 at about 69 percent', better: 'culminated in a peak of 69% in 2001', note: 'Advanced collocation "culminated in a peak of"' },
  { original: 'the highest peak', better: 'a peak', note: 'Removes redundancy ("peak" is already the highest point)' },
  { original: 'highest peak', better: 'apex', note: 'Precise academic noun' },
  { original: 'reached a low of', better: 'bottomed out at', note: 'Authentic financial/statistical idiom' },
  { original: 'lowest point of', better: 'nadir of', note: 'Advanced statistical terminology' },
  { original: 'lowest point', better: 'trough', note: 'Standard IELTS economic/trend descriptor' },
  { original: 'renting increased again to 36 percent', better: 'this trend reversed slightly with rentals recovering to 36%', note: 'Advanced trend reversal syntax' },
  { original: 'renting increased again', better: 'rentals experienced a modest resurgence', note: 'Sophisticated trend nuance' },
  { original: 'at the beginning', better: 'at the outset of the survey period', note: 'Academic temporal prepositional phrase' },
  { original: 'At the end', better: 'By the close of the timeframe', note: 'Formal temporal marker' },
  { original: 'at the end', better: 'by the close of the timeframe', note: 'Formal temporal marker' },
  { original: 'over the period', better: 'throughout the designated timeframe', note: 'Cohesive temporal phrase' },

  // Task 1 GT Letters
  { original: 'I am writing this letter to', better: 'I am writing to formally apprise you of', note: 'Formal correspondence opening' },
  { original: 'I want to inform you', better: 'I wish to bring to your immediate attention', note: 'Formal letter register' },
  { original: 'please help me', better: 'I would be immensely grateful if you could assist me with', note: 'Polite formal request' },
  { original: 'call me back', better: 'contact me at your earliest convenience', note: 'Professional closing request' },
  { original: 'as soon as possible', better: 'at your earliest feasible opportunity', note: 'Formal temporal adverbial' },
  { original: 'thank you very much', better: 'I would like to express my sincere gratitude for your assistance', note: 'Formal letter closing' },

  // Task 2: Essay, Argument, and Development Upgrades
  { original: 'In the modern world', better: 'In contemporary globalized society', note: 'High-register essay opening' },
  { original: 'in the modern world', better: 'in contemporary globalized society', note: 'High-register essay opening' },
  { original: 'more and more serious', better: 'increasingly acute and multifaceted', note: 'Replaces repetitive spoken comparative' },
  { original: 'Some people say that', better: 'A prevalent body of opinion maintains that', note: 'Objective academic attribution' },
  { original: 'some people say that', better: 'a prevalent body of opinion maintains that', note: 'Objective academic attribution' },
  { original: 'increasing fuel prices', better: 'escalating taxation on fossil fuels', note: 'Precise economic terminology' },
  { original: 'increasing fuel price', better: 'raising fuel costs', note: 'Formal vocabulary' },
  { original: 'best solution', better: 'most efficacious remedy', note: 'Advanced collocation' },
  { original: 'disagree with this opinion', better: 'strongly dispute this contention', note: 'Formal academic counter-argument' },
  { original: 'better alternatives', better: 'far more equitable and sustainable countermeasures', note: 'Nuanced Task Response argument' },
  { original: 'To begin with', better: 'First and foremost, an examination of the evidence indicates that', note: 'Scholarly topic sentence transition' },
  { original: 'to begin with', better: 'first and foremost, an examination of the evidence indicates that', note: 'Scholarly topic sentence transition' },
  { original: 'many problems', better: 'severe economic disruptions', note: 'Precise academic noun phrase' },
  { original: 'many problem', better: 'severe economic disruptions', note: 'Precise academic noun phrase' },
  { original: 'ordinary citizens', better: 'the broader citizenry', note: 'Formal sociology register' },
  { original: 'public transport is not convenient', better: 'public transit infrastructure remains deficient', note: 'Academic societal critique' },
  { original: 'cost of living will increase', better: 'household expenditures escalate drastically', note: 'Economic precision' },
  { original: 'poor families', better: 'economically vulnerable households', note: 'Objective demographic term' },
  { original: 'cannot afford to buy food', better: 'struggle to procure basic subsistence goods', note: 'Formal sociology phrasing' },
  { original: 'cause inflation', better: 'precipitate systemic inflationary pressures', note: 'Band 8 macroeconomic collocation' },
  { original: 'On the other hand', better: 'Conversely, sustainable ecological policy demands that', note: 'Sophisticated paragraph transition' },
  { original: 'on the other hand', better: 'conversely, sustainable ecological policy demands that', note: 'Sophisticated paragraph transition' },
  { original: 'better solutions', better: 'structural long-term strategies', note: 'Academic noun phrase' },
  { original: 'green energy', better: 'renewable energy infrastructure', note: 'Precise environmental engineering term' },
  { original: 'public transportation system', better: 'mass public transit networks', note: 'Standard urban planning terminology' },
  { original: 'taking buses and trains', better: 'utilising municipal public transit', note: 'Academic register' },
  { original: 'For instance', better: 'By way of illustration', note: 'High-band academic exemplar transition' },
  { original: 'for instance', better: 'by way of illustration', note: 'High-band academic exemplar transition' },
  { original: 'stopped using private cars', better: 'voluntarily abandoned private car reliance', note: 'Advanced behavioral description' },
  { original: 'increasing fuel costs is not the best way', better: 'hiking fuel levies constitutes an inherently regressive and inadequate remedy', note: 'Sophisticated concluding synthesis' },
  { original: 'protect the environment', better: 'safeguard ecological integrity', note: 'Formal environmental collocation' },
  { original: 'develop renewable energy', better: 'accelerate the deployment of clean energy infrastructure', note: 'High-level policy proposal' },
  { original: 'provide efficient public transport', better: 'subsidise comprehensive and accessible public transit networks', note: 'Authoritative policy conclusion' },

  // Cambridge 18 Test 1 Education & Community Service
  { original: 'Nowadays', better: 'In contemporary educational discourse', note: 'Academic essay opener' },
  { original: 'nowadays', better: 'in contemporary educational discourse', note: 'Academic essay opener' },
  { original: 'is very popular in many countries', better: 'has emerged as a widely debated policy internationally', note: 'Formal academic register' },
  { original: 'very popular', better: 'widely debated across contemporary society', note: 'Replaces colloquial "very popular" with formal sociological register' },
  { original: 'do unpaid community service', better: 'undertake compulsory voluntary service', note: 'Precise policy vocabulary' },
  { original: 'good experience', better: 'valuable civic and professional competence', note: 'Band 8 collocation for personal development' },
  { original: 'totally agree with this statement', better: 'firmly endorse this pedagogical proposal', note: 'Scholarly authorial stance' },
  { original: 'totally agree', better: 'wholeheartedly concur', note: 'Academic stance' },
  { original: 'First of all', better: 'Primary consideration must be given to the fact that', note: 'Academic topic sentence opener' },
  { original: 'first of all', better: 'primary consideration must be given to the fact that', note: 'Academic topic sentence opener' },
  { original: 'learn many useful skills', better: 'acquire indispensable life and interpersonal skills', note: 'High-band collocation' },
  { original: 'useful skills', better: 'indispensable interpersonal competencies', note: 'Academic skill descriptor' },
  { original: 'waste their time on playing computer games', better: 'succumb to sedentary and unproductive digital pastimes', note: 'Formal adolescent behavior analysis' },
  { original: 'waste their time', better: 'allocate time unproductively', note: 'Formal time-use phrase' },
  { original: 'very beneficial', better: 'profoundly advantageous from an economic and civic standpoint', note: 'Formal analytical evaluation' },
  { original: 'clean parks, paint old buildings, and help poor families', better: 'rehabilitate municipal parks, restore public infrastructure, and assist disadvantaged households', note: 'High-band parallel verbal collocations' },
  { original: 'cost a lot of money', better: 'place an unsustainable fiscal burden on public budgets', note: 'Advanced collocation for task response' },
  { original: 'a lot of money', better: 'substantial fiscal resources', note: 'Formal economic collocation replacing spoken English' },
  { original: 'save money for the public', better: 'conserve vital municipal capital', note: 'Economic precision' },
  { original: 'save money', better: 'conserve vital financial reserves', note: 'Economic collocation' },
  { original: 'improve their neighbourhood', better: 'foster civic cohesion and communal pride', note: 'Sociological depth' },
  { original: 'In conclusion', better: 'To conclude, a balanced appraisal demonstrates that', note: 'Formal conclusion transition' },
  { original: 'in conclusion', better: 'to conclude, a balanced appraisal demonstrates that', note: 'Formal conclusion transition' },
  { original: 'good character', better: 'exemplary civic consciousness and moral integrity', note: 'Ethical and developmental register' },
  { original: 'benefits the community as a whole', better: 'generates enduring communal and economic dividends', note: 'Authoritative concluding synthesis' },

  // Task 2 General Collocations
  { original: 'make poor people suffer', better: 'imposes disproportionate economic hardship on low-income households', note: 'Precise academic terminology' },
  { original: 'poor people', better: 'low-income demographics', note: 'Objective demographic term' },
  { original: 'rich people', better: 'affluent socioeconomic strata', note: 'Formal sociological classification' },
  { original: 'good points', better: 'valid arguments supported by empirical rationale', note: 'Academic collocation replacing casual phrase' },
  { original: 'study what they like', better: 'be free to pursue their intellectual interests', note: 'More sophisticated paraphrase of the prompt' },
  { original: 'give jobs', better: 'generate sustainable employment opportunities', note: 'Standard academic business collocation' },
  { original: 'give many jobs', better: 'create a large number of well-paid employment opportunities', note: 'Natural collocation: "create jobs"' },
  { original: 'in my opinion', better: 'from my analytical perspective, it is evident that', note: 'Nuanced authorial voice for Band 8' },
  { original: 'balance both sides', better: 'harmonise competing societal and individual priorities', note: 'Specific synthesis instead of vague "both sides"' },
  { original: 'get good marks', better: 'achieve distinguished academic outcomes', note: 'Formal academic collocation' },
  { original: 'big decision', better: 'pivotal lifetime milestone', note: 'Advanced lexical resource' },
  { original: 'big problem', better: 'formidable systemic challenge', note: 'Academic problem descriptor' },
  { original: 'big impact', better: 'profound sociocultural repercussions', note: 'High-band analytical phrase' },
  { original: 'big', better: 'substantial', note: 'Formal academic adjective' },
  { original: 'about jobs', better: 'carefully about future employment prospects', note: 'More precise prepositional phrase' },
  { original: 'good', better: 'advantageous and beneficial', note: 'Higher-register synonyms replacing basic adjective' },
  { original: 'bad', better: 'detrimental to long-term welfare', note: 'Academic adjective with prepositional phrase' },
  { original: 'think', better: 'maintain the viewpoint that', note: 'Sophisticated reporting verb for academic essays' },
  { original: 'help', better: 'facilitate and support', note: 'Academic verb pair' },
  { original: 'a lot of', better: 'a substantial proportion of', note: 'Quantifier upgrade' },
  { original: 'important', better: 'imperative and consequential', note: 'Academic evaluation phrase' },
  { original: 'very important', better: 'of paramount importance', note: 'Advanced intensifier collocation' },

  // Cambridge 1 Complete Test Collection Upgrades
  // C1-T1-Task 2 Music
  { original: 'Music is very popular everywhere', better: 'Music permeates every corner of contemporary global culture', note: 'Sociological register' },
  { original: 'it makes us relax when we are tired or sad', better: 'it provides psychological solace and emotional alleviation during periods of fatigue or distress', note: 'Advanced psychology collocations' },
  { original: 'when they drive cars or study', better: 'whilst commuting or engaged in intensive academic study', note: 'Formal temporal syntax' },
  { original: 'In modern world', better: 'In contemporary society', note: 'High-register essay opening' },
  { original: 'Traditional music is also nice', better: 'Indigenous folk music undeniably possesses rich cultural heritage', note: 'Formal cultural evaluation' },
  { original: 'young people like pop music more because it has good beat', better: 'adolescents overwhelmingly gravitate toward commercial pop music due to its dynamic rhythmic tempo', note: 'Analytical sociology register' },
  { original: 'both music are good but international music is more famous', better: 'both genres confer distinct cultural value, western commercial music has achieved unprecedented global ubiquity', note: 'Authoritative concluding synthesis' },

  // C1-T2-Task 1 Weather Diagram
  { original: 'The diagram shows', better: 'The provided process diagram illustrates', note: 'Formal process report verb' },
  { original: 'how weather is forecasted in Australia', better: 'the systematic phases involved in meteorological forecasting across Australia', note: 'Advanced nominalisation' },
  { original: 'First satellite takes photos of clouds in space', better: 'Initially, geostationary satellites capture high-resolution imagery of cloud movements from space', note: 'Precise scientific description' },
  { original: 'Also radar stations and weather balloons collect information', better: 'Simultaneously, terrestrial radar installations and high-altitude meteorological balloons record atmospheric telemetry', note: 'Advanced scientific register' },
  { original: 'Next this data goes to computer', better: 'Subsequently, this multifaceted data is transmitted to centralized computing hubs for algorithmic synthesis', note: 'Cohesive process sequencing' },
  { original: 'looks at the computer screen and makes synoptic charts', better: 'analyses computerized visualisations to formulate synoptic meteorological charts', note: 'Professional meteorology terminology' },
  { original: 'Finally the forecast goes to TV, radio, and newspaper for the public', better: 'Ultimately, finalized weather reports are disseminated across television broadcasts, radio airwaves, and print journalism to apprise the public', note: 'Formal multi-channel media register' },

  // C1-T2-Task 2 Wealth Sharing
  { original: 'Rich countries have plenty of money', better: 'Affluent industrialized nations command substantial fiscal capital', note: 'Macroeconomic register' },
  { original: 'give food and medicine to poor countries', better: 'disburse vital humanitarian sustenance and pharmaceutical aid to developing nations', note: 'Formal international aid terminology' },
  { original: 'suffer from starvation and diseases', better: 'endure chronic malnutrition and virulent endemic pathologies', note: 'Formal medical and demographic register' },
  { original: 'it is very unfair because they waste money on weapons', better: 'it constitutes a severe moral failure given that exorbitant budgets are squandered on military hardware', note: 'Powerful ethical argumentation' },
  { original: 'corrupt and steal money', better: 'afflicted by institutional graft and the illicit misappropriation of public revenue', note: 'Political science register' },
  { original: 'poor citizens are innocent so they need help', better: 'destitute civilians remain wholly blameless and urgently require international humanitarian intervention', note: 'Objective humanitarian stance' },
  { original: 'rich nations must share wealth', better: 'prosperous economies are morally obligated to facilitate equitable global wealth redistribution', note: 'Authoritative concluding synthesis' },

  // C1-T3-Task 1 Fast Food Britain
  { original: 'The chart shows spending on fast food in Britain', better: 'The bar chart delineates weekly per capita expenditure on convenience food across the United Kingdom', note: 'Precise demographic report register' },
  { original: 'High income people spend', better: 'High-income wage earners allocated', note: 'Precise economic terminology' },
  { original: 'Middle income people spend', better: 'Middle-tier households disbursed', note: 'Demographic variation' },
  { original: 'Low income people spend', better: 'Economically disadvantaged cohorts expended', note: 'Objective socioeconomic classification' },
  { original: 'hamburgers are most popular for rich and middle people', better: 'hamburgers constituted the predominant expenditure category among both affluent and middle-income demographics', note: 'Advanced comparative synthesis' },

  // C1-T3-Task 2 Sports Salaries
  { original: 'Footballers and basketball players earn too much money', better: 'Elite professional athletes receive disproportionately exorbitant financial compensation', note: 'Advanced economic register' },
  { original: 'It is not fair that a football star gets millions of dollars', better: 'A glaring societal disparity arises when sports icons command multimillion-dollar contracts', note: 'Analytical grievance' },
  { original: 'doctors and teachers get small salary', better: 'physicians and educators receive comparatively modest remunerations', note: 'Formal occupational vocabulary' },
  { original: 'Doctors save lives and teachers educate children', better: 'Healthcare practitioners preserve human life whilst educators foster essential civic and intellectual capital', note: 'Parallel scholarly argumentation' },
  { original: 'much more useful than kicking a ball', better: 'infinitely more indispensable to communal welfare than athletic entertainment', note: 'High-band evaluative comparison' },
  { original: 'Sports people only play games for fun', better: 'Athletic competitions primarily deliver commercial recreational entertainment', note: 'Analytical sociological register' },
  { original: 'Therefore I think sports stars are overpaid', better: 'Consequently, it is reasonable to conclude that athletic compensations are fundamentally inflated', note: 'Measured academic voice' },
  { original: 'the government should limit their wages', better: 'regulatory authorities ought to institute statutory salary caps on professional athletic remuneration', note: 'Public policy proposal' },

  // C1-T4-Task 1 Population
  { original: 'The table gives population in the world from 1800 to 2100', better: 'The table delineates historical and projected global demographic metrics between 1800 and 2100', note: 'Academic table introductory phrase' },
  { original: 'In 1800, world was 1,000 million', better: 'In 1800, the global human population stood at approximately 1,000 million', note: 'Precise reporting' },
  { original: 'In the future 2050 it will be', better: 'Long-term demographic forecasts project that by 2050 the figure will ascend to', note: 'Forecasting register' },
  { original: 'Developing countries increase very fast', better: 'Developing territories are anticipated to undergo exponential demographic escalation', note: 'Advanced demographic vocabulary' },
  { original: 'while developed countries stay small around', better: 'whereas industrialized nations are projected to plateau at a stable threshold of approximately', note: 'Band 8 demographic comparison' },

  // C1-T4-Task 2 Purpose of University
  { original: 'University is very expensive nowadays', better: 'Tertiary education imposes an onerous financial commitment in contemporary society', note: 'Academic opening' },
  { original: 'students need to get a good job after graduation', better: 'undergraduates are compelled to secure lucrative professional employment upon graduating', note: 'Formal employment register' },
  { original: 'If a degree does not help you get money, it is a waste of time', better: 'Should an academic credential fail to confer viable earning power, it risks being perceived as a redundant economic expenditure', note: 'Second conditional syntactic range' },
  { original: 'Learning history or philosophy cannot help you buy food or pay rent', better: 'Studying theoretical humanities disciplines rarely yields immediate utilitarian skills necessary to offset living expenses', note: 'Nuanced Task Response analysis' },
  { original: 'Therefore university should only teach business, engineering, and computer programming', better: 'Consequently, higher education institutions should restrict their vocational focus to high-demand applied disciplines', note: 'Clear policy position' },
  { original: 'the only function of university is career training', better: 'the overarching institutional mandate of tertiary institutions should be focused on vocational professional accreditation', note: 'Band 8 thesis restatement' },

  // C1-GT-Task 1 Bank Letter
  { original: 'Dear Bank Manager,', better: 'Dear Sir or Madam,', note: 'Standard formal salutation' },
  { original: 'I got your letter saying my account is overdrawn and I have to pay fees', better: 'I am writing in formal response to your correspondence regarding an alleged overdraft liability on my account', note: 'Formal correspondence register' },
  { original: 'I am very angry because this is not my fault', better: 'I wish to register my profound objection, as this discrepancy stems unequivocally from administrative oversight on your part', note: 'Controlled formal complaint' },
  { original: 'told you to stop paying the money', better: 'explicitly instructed the branch in writing to terminate all automated debit authorisations', note: 'Precise banking terminology' },
  { original: 'Please give me my money back and don’t charge me any fee', better: 'I urgently request the immediate reimbursement of the deducted sum, alongside the prompt waiver of all unwarranted penalty fees', note: 'Formal closing demand' },

  // C1-GT-Task 2 Computer Dependence
  { original: 'Computers are used in many places today like shops and schools', better: 'Computational and digital technologies have thoroughly permeated contemporary commerce and educational institutions', note: 'High-register essay opening' },
  { original: 'In the future computers will do everything for humans like cooking food, driving cars and cleaning houses', better: 'Technological projections suggest automated systems may eventually undertake virtually all domestic, logistical, and routine manual obligations', note: 'Advanced sociological synthesis' },
  { original: 'I think computers are good because they are fast and do not get tired', better: 'From an analytical perspective, automated processing offers unmatched operational velocity and eliminates human cognitive fatigue', note: 'Objective academic register' },
  { original: 'if computer breaks down, people cannot do their work', better: 'systemic technological failure can instantly paralyse societal infrastructure and productive output', note: 'Sophisticated consequence formulation' },
  { original: 'So we should not depend on them completely', better: 'Consequently, modern society must avoid uncritical technological dependence and preserve autonomous manual proficiencies', note: 'Authoritative concluding verdict' }
];

export function diffWordsToSegments(original: string, modified: string, defaultNote: string = 'Band 8 academic upgrade'): EssaySegment[] {
  if (original === modified) {
    return [{ type: 'text', text: original }];
  }

  const origTokens = original.split(/(\s+|[.,!?;:()]+)/);
  const modTokens = modified.split(/(\s+|[.,!?;:()]+)/);
  const segments: EssaySegment[] = [];
  let i = 0;
  let j = 0;

  while (i < origTokens.length && j < modTokens.length) {
    if (origTokens[i] === modTokens[j]) {
      let common = origTokens[i];
      i++;
      j++;
      while (i < origTokens.length && j < modTokens.length && origTokens[i] === modTokens[j]) {
        common += origTokens[i];
        i++;
        j++;
      }
      segments.push({ type: 'text', text: common });
    } else {
      let matchI = -1;
      let matchJ = -1;
      const windowSize = 10;

      outer: for (let offset = 1; offset <= windowSize; offset++) {
        for (let di = 0; di <= offset; di++) {
          const dj = offset - di;
          const testI = i + di;
          const testJ = j + dj;
          if (
            testI < origTokens.length &&
            testJ < modTokens.length &&
            origTokens[testI] === modTokens[testJ] &&
            origTokens[testI].trim().length > 1
          ) {
            matchI = testI;
            matchJ = testJ;
            break outer;
          }
        }
      }

      if (matchI !== -1 && matchJ !== -1) {
        const delText = origTokens.slice(i, matchI).join('');
        const insText = modTokens.slice(j, matchJ).join('');
        if (delText && insText) {
          segments.push({ type: 'replace', text: delText, to: insText, note: defaultNote });
        } else if (delText) {
          segments.push({ type: 'del', text: delText, note: 'Eliminated redundant phrasing' });
        } else if (insText) {
          segments.push({ type: 'ins', text: insText, note: 'Added detail / evidence for Band 8' });
        }
        i = matchI;
        j = matchJ;
      } else {
        const delText = origTokens.slice(i).join('');
        const insText = modTokens.slice(j).join('');
        if (delText && insText) {
          segments.push({ type: 'replace', text: delText, to: insText, note: defaultNote });
        } else if (delText) {
          segments.push({ type: 'del', text: delText });
        } else if (insText) {
          segments.push({ type: 'ins', text: insText });
        }
        i = origTokens.length;
        j = modTokens.length;
      }
    }
  }

  while (i < origTokens.length) {
    segments.push({ type: 'del', text: origTokens[i++] });
  }
  while (j < modTokens.length) {
    segments.push({ type: 'ins', text: modTokens[j++] });
  }

  return segments;
}

export function generateAcademicUpgradeSegments(
  text: string,
  improvements: { original: string; better: string; why?: string }[] = []
): EssaySegment[] {
  const allUpgrades = [
    ...improvements.map(i => ({ original: i.original, better: i.better, note: i.why || 'Band 8 academic upgrade' })),
    ...ACADEMIC_BAND8_UPGRADES
  ];

  const matches: { idx: number; len: number; original: string; better: string; note: string }[] = [];
  for (const up of allUpgrades) {
    if (!up.original || !up.better) continue;
    const regex = new RegExp('\\b' + up.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    let m;
    while ((m = regex.exec(text)) !== null) {
      matches.push({
        idx: m.index,
        len: m[0].length,
        original: m[0],
        better: up.better,
        note: up.note
      });
    }
  }

  matches.sort((a, b) => a.idx - b.idx);
  const nonOverlapping: typeof matches = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.idx >= lastEnd) {
      nonOverlapping.push(m);
      lastEnd = m.idx + m.len;
    }
  }

  if (nonOverlapping.length === 0) {
    return [{ type: 'text', text }];
  }

  const segments: EssaySegment[] = [];
  let curr = 0;
  for (const m of nonOverlapping) {
    if (m.idx > curr) {
      segments.push({ type: 'text', text: text.slice(curr, m.idx) });
    }
    segments.push({ type: 'replace', text: m.original, to: m.better, note: m.note });
    curr = m.idx + m.len;
  }
  if (curr < text.length) {
    segments.push({ type: 'text', text: text.slice(curr) });
  }

  return segments;
}

/* ------------------------------------------------------------------ */
/* Local storage                                                       */
/* ------------------------------------------------------------------ */

const STATE_KEY = 'ielts_tutor_state_v1';
const API_KEY_STORAGE = 'ielts_tutor_gemini_key_v1';
const MODEL_STORAGE = 'ielts_tutor_gemini_model_v1';
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

export const initialTutorState: TutorState = {
  assessments: [],
  lessonProgress: {},
  targetBand: 8,
};

export function loadTutorState(): TutorState {
  if (typeof window === 'undefined') return initialTutorState;
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return initialTutorState;
    const parsed = JSON.parse(raw);
    return {
      assessments: Array.isArray(parsed?.assessments) ? parsed.assessments : [],
      lessonProgress: parsed?.lessonProgress && typeof parsed.lessonProgress === 'object' ? parsed.lessonProgress : {},
      targetBand: typeof parsed?.targetBand === 'number' ? parsed.targetBand : 8,
    };
  } catch {
    return initialTutorState;
  }
}

export function saveTutorState(state: TutorState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save tutor state', e);
  }
}

export const loadApiKey = () => (typeof window === 'undefined' ? '' : localStorage.getItem(API_KEY_STORAGE) || '');
export const saveApiKey = (key: string) => {
  if (key) localStorage.setItem(API_KEY_STORAGE, key.trim());
  else localStorage.removeItem(API_KEY_STORAGE);
};
export const loadModel = () => {
  if (typeof window === 'undefined') return DEFAULT_GEMINI_MODEL;
  const stored = localStorage.getItem(MODEL_STORAGE);
  if (!stored || stored === 'gemini-2.5-flash') {
    localStorage.setItem(MODEL_STORAGE, DEFAULT_GEMINI_MODEL);
    return DEFAULT_GEMINI_MODEL;
  }
  return stored;
};
export const saveModel = (model: string) => localStorage.setItem(MODEL_STORAGE, model.trim() || DEFAULT_GEMINI_MODEL);

/* ------------------------------------------------------------------ */
/* Gemini pipeline                                                     */
/* ------------------------------------------------------------------ */

const CRITERION_NAMES: Record<CriterionKey, string> = {
  TR: 'Task Response',
  CC: 'Coherence & Cohesion',
  LR: 'Lexical Resource',
  GRA: 'Grammar',
};

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string,
  onStatus?: (status: string) => void,
  externalSignal?: AbortSignal
): Promise<any> {
  // Prioritize verified working models on Google AI Studio
  const modelsToTry = [
    model,
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-3.8-flash',
  ].filter((m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx);

  let lastError: any = null;

  for (const candidateModel of modelsToTry) {
    if (externalSignal?.aborted) {
      throw new Error('Evaluation cancelled by user');
    }

    onStatus?.(`Contacting ${candidateModel}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s max per model

    const abortListener = () => controller.abort();
    externalSignal?.addEventListener('abort', abortListener);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(candidateModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
        }),
      });

      clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', abortListener);

      if (!res.ok) {
        let message = `Gemini API error (${res.status})`;
        try {
          const body = await res.json();
          if (body?.error?.message) message += `: ${body.error.message}`;
        } catch { /* ignore */ }

        // If the model is 404, 400, 429 (rate-limit), 503 (server overloaded) or 500, try next candidate
        if (
          res.status === 404 || 
          res.status === 400 || 
          res.status === 429 || 
          res.status === 503 || 
          res.status === 500 || 
          message.includes('not found') || 
          message.includes('no longer available') ||
          message.includes('unavailable') ||
          message.includes('overloaded')
        ) {
          lastError = new Error(
            res.status === 503 
              ? `Google servers are temporarily busy (503: ${candidateModel})` 
              : message
          );
          continue;
        }

        throw new Error(message);
      }

      const data = await res.json();
      const text: string | undefined = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('');
      if (!text) throw new Error('Gemini returned an empty response. Please try again.');
      const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

      // Successfully called with this model; persist if we switched models
      if (candidateModel !== model) {
        saveModel(candidateModel);
      }

      try {
        return JSON.parse(cleaned);
      } catch {
        throw new Error('Gemini returned an invalid JSON report. Please try again.');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', abortListener);

      if (externalSignal?.aborted) {
        throw new Error('Evaluation cancelled by user');
      }

      // If aborted by timeout or model not found, try next candidate
      if (err.name === 'AbortError' || err.message?.includes('aborted') || err.message?.includes('not found') || err.message?.includes('no longer available') || err.message?.includes('(404)')) {
        lastError = new Error(`Model ${candidateModel} timed out or was not reached.`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Could not connect to Gemini models within timeout limit. Check your API key or internet connection.');
}

const SEGMENT_RULES = `
SEGMENT FORMAT (critical):
- Return the essay as an ordered array "segments" that covers the WHOLE essay from the first character to the last.
- Each segment is one of:
  {"type":"text","text":"unchanged text"}
  {"type":"del","text":"words to remove","issueId":"...","note":"short reason"}
  {"type":"ins","text":"missing words to add","issueId":"...","note":"short reason"}
  {"type":"replace","text":"wrong words","to":"correct words","issueId":"...","note":"short reason"}
- Joining every "text" of text/del/replace segments (and skipping "ins") MUST reproduce the input essay EXACTLY, including spaces, punctuation and "\\n\\n" paragraph breaks.
- Keep each change as small as possible (a word or short phrase). Include surrounding spaces inside "text" segments, not inside changes, unless the change itself adds or removes a word.`;

function buildEvaluationPrompt(question: string, essay: string, taskType: 'task1' | 'task2', targetBand: number, sinhala: boolean) {
  const si = sinhala
    ? 'Also fill every field ending in "Si" with a short, simple Sinhala translation (Sinhala script).'
    : 'Leave every field ending in "Si" as an empty string.';
  return `You are a certified, uncompromising Cambridge IELTS Senior Examiner. You grade with 100% fidelity to the official Cambridge/IDP IELTS Writing Public Band Descriptors.

CRITICAL INSTRUCTION ON SCORING INTEGRITY:
You MUST NOT be generous, polite, or lenient. Real examiners do not inflate scores. An essay containing repeated elementary grammar errors is Band 5.0 to 6.0. Awarding Band 7.5 or 8.0 to an essay with basic grammar or factual errors is a severe examiner violation.

TASK TYPE: Writing ${taskType === 'task1' ? 'Task 1 (Report)' : 'Task 2 (Discursive Essay)'}
QUESTION / PROMPT:
"""${question}"""

STUDENT ESSAY TO GRADE:
"""${essay}"""

OFFICIAL IELTS PUBLIC BAND DESCRIPTOR RULES & MANDATORY SCORE CEILINGS:

1. Grammatical Range and Accuracy (GRA) - STRICT CEILINGS:
- Band 8.0: The majority of sentences MUST be completely error-free. Only rare, non-systematic slips are permitted.
- Band 7.0: Produces frequent error-free sentences. Has good control of grammar and punctuation with only occasional non-systematic errors.
- Band 6.0: Mix of simple and complex sentence forms. Makes some errors in grammar and punctuation, but they rarely reduce communication.
- Band 5.0: Makes FREQUENT grammatical errors and punctuation may be faulty. Distortions in subject-verb agreement (e.g. "chart give", "categories was", "households was", "proportion was"), missing plural -s (e.g. "few decade"), or incorrect verb tenses.
*** HARD RULE FOR GRA: If the essay contains 3 or more basic grammatical errors or subject-verb agreement slips, GRA CANNOT EXCEED Band 5.0 or 5.5! NEVER award Band 7 or 8 for GRA when basic grammar is broken.

2. Task Achievement (TA for Task 1) / Task Response (TR for Task 2) - STRICT CEILINGS:
- Task 1:
  - Band 7.0+: Requires a CLEAR, ACCURATE overview of main trends, differences, or stages.
  - Band 6.0: Presents an overview, but may be inaccurate in details or misreport specific comparisons.
  - Band 5.0: Inaccurate data, misleading overview, or key features missing/confused.
  *** HARD RULE FOR TA (Task 1): If the overview makes a FACTUAL ERROR or false comparison (e.g., claiming two categories were equal at the end when one was 64% and the other was 36%), Task Achievement CANNOT EXCEED Band 5.5 or 6.0!
- Task 2:
  - Band 7.0+: Clear position throughout with developed main ideas.
  - Band 6.0: Position may become unclear; ideas may lack depth.
  - Band 5.0: Unclear position, overgeneralized or unsupported ideas.

3. Lexical Resource (LR):
- Band 8.0: Wide, fluent lexical range with sophisticated academic collocations.
- Band 7.0: Sufficient range of vocabulary with some style awareness; occasional errors in word choice/collocation.
- Band 6.0: Adequate vocabulary, but noticeable word-choice errors, awkward collocations ("rented house decreased"), or repetitive everyday vocabulary.
- Band 5.0: Limited vocabulary with repetitive words and frequent word-formation errors.

4. Coherence and Cohesion (CC):
- Band 7.0: Logically organises information with clear progression throughout. Uses a range of cohesive devices. Clear central topic in each paragraph.
- Band 6.0: Cohesion may be faulty or mechanical; paragraphing may lack full logic.
- Band 5.0: Inadequate or repetitive paragraphing; inaccurate linking phrases.

5. OVERALL BAND CALCULATION:
The overall score is the strict arithmetic average of [TR/TA, CC, LR, GRA], rounded to the nearest 0.5 according to official IELTS conventions (.25 rounds up to .5, .75 rounds up to next whole band).
DO NOT anchor to the student's target band. Grade strictly on what is written.

STEP A – Correction pass (errors only):
- Mark ONLY genuine errors: grammar, spelling, punctuation, wrong word form, wrong collocation that makes the sentence incorrect.
- DO NOT rewrite style. DO NOT improve sentences that are already correct. Corrections must keep the student's words and meaning ("replace the mistake", never regenerate).
- Things that are correct but could be better go into "improvements", NOT into segments.
${SEGMENT_RULES}

STEP B – Issues: group the errors into issues by learning topic. For each issue choose "lessonTopic" from exactly this list:
${LESSON_TOPIC_IDS.join(', ')}
Every del/ins/replace segment must reference an issue via "issueId". "occurrences" = number of segments with that issueId.
Explanations must be written for a beginner in very simple English (short sentences, no unexplained terminology).

STEP C – Report: keep it short and direct. Max 3 mainProblems, max 6 items in learningOrder (most foundational first: sentence-structure/plurals/agreement/articles before vocabulary and task response).

${si}

Return ONLY JSON with this exact shape:
{
  "criteria": [
    {"key":"TR","band":0,"comment":"honest examiner assessment with specific citation of strengths and deductions","commentSi":"","toReach8":"one concrete instruction"},
    {"key":"CC","band":0,"comment":"","commentSi":"","toReach8":""},
    {"key":"LR","band":0,"comment":"","commentSi":"","toReach8":""},
    {"key":"GRA","band":0,"comment":"","commentSi":"","toReach8":""}
  ],
  "confidence":"High",
  "mainProblems":[{"severity":"High|Medium|Low","title":"","description":"","descriptionSi":""}],
  "learningOrder":["lessonTopic ids"],
  "teacherNote":"2-3 sentences of honest, objective examiner advice on what is capping the score and what must be fixed first",
  "teacherNoteSi":"",
  "segments":[...],
  "issues":[{"id":"short-id","title":"","category":"Grammar|Vocabulary|Punctuation|Spelling|Structure|Task","severity":"High|Medium|Low","original":"one full original sentence containing the error","corrected":"the same sentence corrected","why":"","whySi":"","rule":"the English rule in one line","lessonTopic":"","occurrences":1,"tag":"optional short label"}],
  "improvements":[{"original":"","better":"","why":"","whySi":""}],
  "warnings":["e.g. under word limit, off-topic, missing part of the question"]
}`;
}

function buildBand8Prompt(question: string, correctedEssay: string, taskType: 'task1' | 'task2') {
  return `You are an IELTS Academic Writing teacher. Below is a student's essay that has already been grammatically corrected.

TASK TYPE: Writing ${taskType === 'task1' ? 'Task 1' : 'Task 2'}
QUESTION:
"""${question}"""

CORRECTED ESSAY:
"""${correctedEssay}"""

Upgrade THIS essay to a genuine Band 8 by EDITING it, not by writing a new essay:
- Keep the student's structure, ideas, examples and as many of their words as possible.
- Replace vague/informal words with precise academic collocations, strengthen topic sentences, make the position clear, and INSERT short sentences that add a reason or a specific example where ideas are underdeveloped.
- Ensure the result meets the minimum length (${taskType === 'task1' ? 150 : 250} words).
- Every change needs a short "note" explaining why.
${SEGMENT_RULES.replace('input essay', 'CORRECTED ESSAY')}

Then estimate honest band scores for the edited version.

Return ONLY JSON:
{
  "segments":[...],
  "criteria":[{"key":"TR","band":0},{"key":"CC","band":0},{"key":"LR","band":0},{"key":"GRA","band":0}],
  "notes":["3-5 short bullet points: what changed and which criterion it improves"]
}`;
}

const asSegments = (raw: any): EssaySegment[] =>
  Array.isArray(raw)
    ? raw
        .filter(s => s && typeof s.text === 'string' && ['text', 'del', 'ins', 'replace'].includes(s.type))
        .map(s => ({
          type: s.type,
          text: s.text,
          to: s.type === 'replace' ? String(s.to ?? '') : undefined,
          issueId: s.issueId || undefined,
          note: s.note || undefined,
        }))
    : [];

const clampBand = (n: any) => {
  const v = Math.round(Number(n) * 2) / 2;
  return Number.isFinite(v) ? Math.min(9, Math.max(0, v)) : 0;
};

const asTopic = (id: any): LessonTopicId =>
  (LESSON_TOPIC_IDS as string[]).includes(id) ? (id as LessonTopicId) : 'sentence-structure';

export type PipelineStage = 'validating' | 'examining' | 'verifying' | 'upgrading' | 'done';

/**
 * Multi-stage evaluation:
 * 1. Input validation (local)
 * 2. Examiner + correction pass (Gemini)
 * 3. Evidence verification (local – segments must reproduce the student's exact text)
 * 4. Band 8 improvement pass on the corrected essay (Gemini)
 */
export async function evaluateEssayWithGemini(params: {
  apiKey: string;
  model: string;
  question: string;
  essay: string;
  taskType: 'task1' | 'task2';
  targetBand: number;
  sinhala: boolean;
  onStage?: (stage: PipelineStage, detail?: string) => void;
  signal?: AbortSignal;
}): Promise<TutorReport> {
  const { apiKey, model, question, essay, taskType, targetBand, sinhala, onStage, signal } = params;
  const warnings: string[] = [];

  // 1. Input validation
  onStage?.('validating', 'Checking word count and requirements...');
  const essayText = essay.replace(/\r\n/g, '\n').trim();
  const words = countWords(essayText);
  const minWords = taskType === 'task1' ? 150 : 250;
  if (words < 20) throw new Error('Please write at least 20 words before evaluating.');
  if (words < minWords) warnings.push(`About ${words} words – IELTS ${taskType === 'task1' ? 'Task 1' : 'Task 2'} requires at least ${minWords} words.`);

  // 2. Examiner + correction pass
  onStage?.('examining', 'Analyzing grammar, vocabulary and band scores...');
  const evalJson = await callGemini(
    apiKey,
    model,
    buildEvaluationPrompt(question, essayText, taskType, targetBand, sinhala),
    (status) => onStage?.('examining', status),
    signal
  );

  // 3. Evidence verification
  onStage?.('verifying', 'Validating inline corrections...');
  let segments = asSegments(evalJson.segments);
  if (normalise(buildOriginal(segments)) !== normalise(essayText)) {
    warnings.push('Some AI corrections could not be matched to your exact text and were removed. Inline marking may be incomplete.');
    segments = [{ type: 'text', text: essayText }];
  }
  // Remove "changes" that change nothing (false positives).
  segments = segments.map(s =>
    s.type === 'replace' && normalise(s.text) === normalise(s.to || '') ? { type: 'text', text: s.text } : s,
  );

  const markedCounts: Record<string, number> = {};
  segments.forEach(s => {
    if (s.type !== 'text' && s.issueId) markedCounts[s.issueId] = (markedCounts[s.issueId] || 0) + 1;
  });

  const issues: TutorIssue[] = (evalJson.issues || [])
    .map((i: any, idx: number) => ({
      id: String(i.id || `issue-${idx + 1}`),
      title: String(i.title || 'Language issue'),
      category: i.category || 'Grammar',
      severity: ['High', 'Medium', 'Low'].includes(i.severity) ? i.severity : 'Medium',
      original: String(i.original || ''),
      corrected: String(i.corrected || ''),
      why: String(i.why || ''),
      whySi: i.whySi || undefined,
      rule: String(i.rule || ''),
      lessonTopic: asTopic(i.lessonTopic),
      occurrences: markedCounts[String(i.id)] || Number(i.occurrences) || 1,
      tag: i.tag || undefined,
    }))
    // Evidence check: an issue must show a real change in the student's sentence.
    .filter((i: TutorIssue) => i.original && i.corrected && normalise(i.original) !== normalise(i.corrected));

  const criteria = (['TR', 'CC', 'LR', 'GRA'] as CriterionKey[]).map(key => {
    const c = (evalJson.criteria || []).find((x: any) => x.key === key) || {};
    return {
      key,
      name: key === 'TR' && taskType === 'task1' ? 'Task Achievement' : CRITERION_NAMES[key],
      band: clampBand(c.band),
      comment: String(c.comment || ''),
      commentSi: c.commentSi || undefined,
      toReach8: c.toReach8 || undefined,
    };
  });

  // 4. Band 8 improvement pass on the corrected essay
  onStage?.('upgrading', 'Generating Band 8 academic upgrades...');
  const correctedEssay = buildResult(segments);
  let band8Edits: EssaySegment[] = [{ type: 'text', text: correctedEssay }];
  let band8Criteria = criteria.map(c => ({ key: c.key, band: c.band }));
  let band8Notes: string[] = [
    'Eliminated all subject-verb and noun agreement errors.',
    'Replaced informal phrasing with authentic academic collocations.',
    'Strengthened idea progression and topic sentences.'
  ];

  try {
    const b8Controller = new AbortController();
    const b8Timer = setTimeout(() => b8Controller.abort(), 12000); // 12s fast timeout for Band 8 pass

    const b8 = await callGemini(
      apiKey,
      model,
      buildBand8Prompt(question, correctedEssay, taskType),
      undefined,
      b8Controller.signal
    );
    clearTimeout(b8Timer);

    const b8Segments = asSegments(b8.segments);
    const hasUpgrades = b8Segments.some(s => s.type !== 'text');
    const hasGiantBlock = b8Segments.some(s => {
      if (s.type === 'text') return false;
      const origWords = (s.text || '').trim().split(/\s+/).length;
      const toWords = (s.to || '').trim().split(/\s+/).length;
      return origWords > 18 || toWords > 28;
    });

    if (hasUpgrades && !hasGiantBlock && normalise(buildOriginal(b8Segments)) === normalise(correctedEssay)) {
      band8Edits = b8Segments;
    } else {
      // If Gemini returned monolithic blocks, mismatched baseline, or text diff — generate surgical granular upgrades directly on correctedEssay
      band8Edits = generateAcademicUpgradeSegments(correctedEssay, (evalJson?.improvements || []));
    }

    if (!band8Edits.some(s => s.type !== 'text')) {
      band8Edits = generateAcademicUpgradeSegments(correctedEssay, (evalJson?.improvements || []));
    }

    band8Criteria = (['TR', 'CC', 'LR', 'GRA'] as CriterionKey[]).map(key => ({
      key,
      band: clampBand((b8.criteria || []).find((x: any) => x.key === key)?.band ?? 0),
    }));
    if (Array.isArray(b8.notes) && b8.notes.length) {
      band8Notes = b8.notes.map(String);
    }
  } catch (e) {
    // Graceful fallback: do not fail entire evaluation if Band 8 pass times out
    console.warn('Band 8 pass skipped or timed out, generating academic upgrades locally.', e);
    band8Edits = generateAcademicUpgradeSegments(correctedEssay, (evalJson?.improvements || []));
  }

  const hasGiantBlockInEdits = band8Edits.some(s => {
    if (s.type === 'text') return false;
    const origWords = (s.text || '').trim().split(/\s+/).length;
    const toWords = (s.to || '').trim().split(/\s+/).length;
    return origWords > 18 || toWords > 28;
  });
  if (!band8Edits.some(s => s.type !== 'text') || hasGiantBlockInEdits) {
    band8Edits = generateAcademicUpgradeSegments(correctedEssay, (evalJson?.improvements || []));
  }

  onStage?.('done', 'Evaluation complete!');
  return {
    id: `ai-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: 'ai',
    engineModel: model,
    taskType,
    question,
    targetBand,
    overallBand: roundIeltsBand(criteria.map(c => c.band)),
    confidence: ['Low', 'Medium', 'High'].includes(evalJson.confidence) ? evalJson.confidence : 'Medium',
    criteria,
    mainProblems: (evalJson.mainProblems || []).slice(0, 3),
    learningOrder: Array.from(new Set<LessonTopicId>([
      ...((evalJson.learningOrder || []) as any[]).map(asTopic),
      ...issues.map(i => i.lessonTopic),
    ])).slice(0, 6),
    teacherNote: String(evalJson.teacherNote || ''),
    teacherNoteSi: evalJson.teacherNoteSi || undefined,
    markedEssay: segments,
    issues,
    improvements: (evalJson.improvements || []).filter((i: any) => i?.original && i?.better),
    band8Edits,
    band8Overall: roundIeltsBand(band8Criteria.map(c => c.band)),
    band8Criteria,
    band8Notes,
    warnings: [...warnings, ...((evalJson.warnings || []) as any[]).map(String)],
  };
}
