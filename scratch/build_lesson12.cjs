const fs = require('fs');
const path = require('path');

const examplesPart1 = require('./examples_part1.cjs');
const examplesPart2 = require('./examples_part2.cjs');
const allExamples = [...examplesPart1, ...examplesPart2];

const batch1Table1 = [
  ["Virtually", "පාහේ / බොහෝ දුරට", "Almost; very nearly."],
  ["Distinct", "පැහැදිලිව වෙනස් වූ", "Clearly different from others."],
  ["Handedness", "අත් භාවිතයේ ප්‍රමුඛතාව", "The tendency to use one hand more than the other."],
  ["Lateral asymmetry", "දෙපස අතර අසමමිතිය", "A difference between the left and right sides."],
  ["Relatives", "ඥාතීන්", "People or animals belonging to the same family group."],
  ["Apes", "වානරයන්", "Large primates such as gorillas and chimpanzees."],
  ["Decided", "පැහැදිලි / නිශ්චිත", "Clear and definite."],
  ["Sidedness", "එක් පැත්තකට ඇති නැඹුරුව", "A preference for one side of the body."],
  ["Distinctive", "සුවිශේෂී", "Having a quality that makes something recognizable."],
  ["Asymmetry", "අසමමිතිය", "A lack of balance or similarity between two sides."],
  ["Systematic", "ක්‍රමානුකූල", "Done or arranged according to an organized method."],
  ["Categories", "වර්ග / කාණ්ඩ", "Groups into which things are divided."],
  ["Categorise", "වර්ගීකරණය කිරීම", "To put things into groups."],
  ["Phenomena", "සංසිද්ධි", "Events or things that can be observed."],
  ["Essentially", "මූලික වශයෙන්", "Basically; in the most important sense."],
  ["Ambiguous", "අපැහැදිලි / අර්ථ කිහිපයක් ඇති", "Having more than one possible meaning."],
  ["Inherited", "උරුම වූ", "Passed genetically from parents to children."],
  ["Element", "අංගය / සාධකය", "One part or factor of something."],
  ["Tend to", "නැඹුරු වීම", "To be likely to do something."],
  ["Automatically", "ස්වයංක්‍රීයව", "Without needing conscious effort."],
  ["Offspring", "පැටවුන් / දරුවන්", "The children or young of a person or animal."],
  ["Identical twins", "සමාන නිවුන් දරුවන්", "Twins who develop from the same fertilized egg."],
  ["Genes", "ජාන", "Units of heredity passed from parents to children."],
  ["Differ", "වෙනස් වීම", "To be unlike something or someone else."],
  ["Factors", "සාධක", "Things that influence a result."],
  ["Clues", "ඉඟි / හෝඩුවාවන්", "Small pieces of information that help solve something."],
  ["Anthropologist", "මානව විද්‍යාඥයා", "A person who studies humans and human societies."],
  ["Remarkable", "කැපී පෙනෙන / විශේෂ", "Unusual or impressive enough to attract attention."],
  ["Stroke", "ආඝාතය", "A medical condition caused by interrupted blood flow to the brain."],
  ["Blood clot", "රුධිර කැටිය", "A thick mass of blood that has become solid."],
  ["Paralysis", "අංශභාගය", "Loss of the ability to move part or all of the body."],
  ["Hemisphere", "අර්ධගෝලය", "One half of the brain."],
  ["Vice versa", "එහි විරුද්ධ අතටත් එසේම", "The same applies in the opposite direction."],
  ["Brain damage", "මොළයට සිදුවන හානිය", "Injury or harm affecting the brain."],
  ["Language centre", "භාෂා මධ්‍යස්ථානය", "The brain area responsible for language functions."],
  ["Majority", "බහුතරය", "The larger part of a group."],
  ["Dominance", "ප්‍රමුඛත්වය / ආධිපත්‍යය", "The state of being more powerful or influential."],
  ["Capacity", "හැකියාව / ධාරිතාව", "The ability or potential to do something."],
  ["Bilateral", "දෙපාර්ශ්වික", "Involving or affecting both sides."],
  ["Evolution", "පරිණාමය", "The gradual development of living things over generations."],
  ["Specialised", "විශේෂිත වූ", "Designed or developed for a particular function."],
  ["Fine control", "සියුම් පාලනය", "The ability to control small and precise movements."],
  ["Preference", "කැමැත්ත / නැඹුරුව", "A greater liking for one thing over another."],
  ["Recovery", "සුවය ලැබීම / යථා තත්ත්වයට පත්වීම", "The process of becoming healthy or normal again."],
  ["Observed", "නිරීක්ෂණය කළ", "Watched carefully to learn something."],
  ["Primates", "ප්‍රයිමේටාවන්", "The animal group that includes humans, monkeys and apes."],
  ["Anatomical", "ශරීර ව්‍යුහයට අදාළ", "Related to the physical structure of a body."],
  ["Acquired", "ලබාගත් / අත්පත් කරගත්", "Gained or developed through experience or learning."],
  ["Variation", "වෙනස්කම / විචලනය", "A difference or change in form or condition."],
  ["Evident", "පැහැදිලිව පෙනෙන", "Easy to see or understand."],
  ["Embryos", "කලල", "Unborn organisms during an early stage of development."],
  ["Foetus", "ගර්භස්ථ දරුවා", "An unborn baby developing inside the uterus."],
  ["Secrete", "ශ්‍රාවය කිරීම", "To produce and release a substance."],
  ["Hormones", "හෝමෝන", "Chemical substances that regulate body functions."],
  ["Mature", "පරිණත වීම", "To develop fully."],
  ["Pregnancy", "ගර්භණීභාවය", "The condition of carrying a developing baby in the uterus."],
  ["Lateralised", "එක් අර්ධගෝලයකට විශේෂිත වූ", "Having a function mainly controlled by one side of the brain."],
  ["Rationality", "තාර්කිකත්වය", "The ability to think logically."],
  ["Abstraction", "වියුක්ත චින්තනය", "Thinking about ideas rather than physical objects."],
  ["Mathematicians", "ගණිතඥයන්", "People who study or work with mathematics."],
  ["Architects", "ගෘහ නිර්මාණ ශිල්පීන්", "People who design buildings."],
  ["Consolation", "සැනසීම", "Something that makes a person feel less disappointed."],
  ["Alarming", "අනතුරුදායක බවක් ඇති කරන / කලබලකාරී", "Causing worry, fear or concern."],
  ["Reinforces", "තවදුරටත් ශක්තිමත් කරයි", "Makes an idea or belief stronger."],
  ["Virtue", "ගුණධර්මය / යහපත් ගුණය", "A good quality or morally good behaviour."],
  ["Subliminally", "යටි සිතට බලපාන ආකාරයෙන්", "In a way that affects the mind without conscious awareness."],
  ["Sinister", "අසුබ / නපුරු බවක් ඇති", "Suggesting danger or evil."],
  ["Coincidence", "අහඹු සිදුවීම", "Two things happening together by chance."],
  ["Stammer", "ගොත ගැසීම", "A speech problem involving repeated or blocked sounds."],
  ["Robbed of", "අහිමි කරනු ලැබූ", "Deprived of something valuable."],
  ["Gradually", "ක්‍රමයෙන්", "Slowly, over a period of time."],
  ["Migratory", "සංක්‍රමණය වන", "Moving from one place to another at particular times."],
  ["Beekeeping", "මී මැසි පාලනය", "The activity of keeping bees to collect honey or other products."],
  ["Eke out", "ඉතා අසීරුවෙන් උපයා ගැනීම", "To manage to obtain or make a small amount of something."],
  ["Full-time living", "පූර්ණකාලීන ජීවනෝපාය", "Work that provides a person's main source of income."],
  ["Commercial", "වාණිජමය", "Related to business or making money."],
  ["Pull up stakes", "පදිංචිය හෝ ස්ථානය වෙනස් කිරීම", "To leave a place and move somewhere else."],
  ["Migrate", "සංක්‍රමණය වීම", "To move from one region to another."],
  ["Nectar", "මල් පැණි", "Sweet liquid produced by flowers."],
  ["Pollinate", "පරාගණය කිරීම", "To transfer pollen so that plants can reproduce."],
  ["Crops", "වගා බෝග", "Plants grown by farmers for food or other uses."],
  ["Fertile", "සාරවත්", "Able to produce healthy plants or offspring."],
  ["Central Valley", "මධ්‍යම නිම්නය", "A low area of land between hills or mountains; here, a geographical region."],
  ["Blooming season", "මල් පිපෙන කාලය", "The period when plants produce flowers."],
  ["Hives", "මී වද / මී මැසි පෙට්ටි", "Structures where bees live."],
  ["Haul", "බරක් ඇදගෙන යාම / ප්‍රවාහනය කිරීම", "To pull or transport something heavy."],
  ["Rent", "කුලියට ගැනීම / දීම", "To pay to use something temporarily."],
  ["Experimented", "අත්හදා බැලීම් කළ", "Tried something to discover whether it works."],
  ["Barges", "භාණ්ඩ ප්‍රවාහන පැතලි බෝට්ටු", "Flat-bottomed boats used for transporting goods."],
  ["Waterways", "ජල මාර්ග", "Rivers, canals or other routes used by boats."],
  ["Affordable", "දැරිය හැකි මිලකට ඇති", "Not too expensive to buy or use."],
  ["Catch on", "ජනප්‍රිය වීම / ප්‍රචලිත වීම", "To become popular or widely accepted."],
  ["Particular demand", "විශේෂ ඉල්ලුම", "A strong need for a specific thing."],
  ["Groves", "ගස් වතු", "Small groups or areas of trees."],
  ["Bonanza", "විශාල වාසියක් / ලාභදායී අවස්ථාවක්", "A situation that produces a lot of money or benefits."],
  ["Tranquil", "සන්සුන්", "Calm and peaceful."],
  ["Pallets", "භාණ්ඩ තැබීමට භාවිත කරන තට්ටු", "Flat platforms used to store or move goods."],
  ["Back-to-back", "පිටපිට / එකිනෙකට පිටුපසින්", "Positioned with their backs against each other."],
  ["Lively", "ක්‍රියාශීලී / උද්‍යෝගිමත්", "Active, energetic or full of movement."],
  ["Pacify", "සන්සුන් කිරීම", "To make someone or something less angry or excited."],
  ["Fragrant", "සුවඳවත්", "Having a pleasant smell."],
  ["Encourage", "දිරිමත් කිරීම", "To give someone support or confidence to do something."],
  ["Temporary", "තාවකාලික", "Lasting for a limited time."],
  ["Extensions", "දිගු කිරීම් / අමතර කොටස්", "Additional parts that make something larger."],
  ["Brood chamber", "පැටවුන් ඇතිදැඩි කරන මී වද කුටිය", "The part of a hive where the queen lays eggs and young bees develop."],
  ["Inserted", "ඇතුළු කරන ලද", "Put or placed inside something."],
  ["Irritate", "කුපිත කිරීම / අපහසුතාවට පත් කිරීම", "To make someone or something annoyed or uncomfortable."],
  ["Warehouse", "ගබඩාව", "A large building used for storing goods."],
  ["Rotating blades", "භ්‍රමණය වන තල", "Blades that turn around an axis."],
  ["Capacity", "උපරිම ධාරිතාව", "The maximum amount something can hold."],
  ["Revolutions per minute", "මිනිත්තුවකට භ්‍රමණ වාර ගණන", "The number of complete turns made in one minute."],
  ["Centrifugal force", "කේන්ද්‍රාපසාරී බලය", "The apparent outward force experienced by an object moving in a circle."],
  ["Shipment", "නැව්ගත කිරීම / භාණ්ඩ ප්‍රවාහනය", "The process of sending goods to another place."],
  ["Approximately", "ආසන්න වශයෙන්", "Almost, but not exactly."],
  ["Weakened", "දුර්වල වූ", "Made less strong or healthy."],
  ["Mites", "මයිටාවන්", "Tiny organisms related to ticks and spiders."],
  ["Ageing", "වයස්ගත වීම", "The process of becoming older."],
  ["Colony", "ජනපදය / සමූහය", "A group of organisms living together."],
  ["Teeming with", "විශාල ප්‍රමාණයක් පිරී ඇති", "Containing a very large number of living things."],
  ["Separated", "වෙන් කරන ලද", "Divided or moved apart."],
  ["Migratory beekeeping", "සංක්‍රමණික මී මැසි පාලනය", "Moving beehives to different places according to flowering seasons."]
];

const batch1Table2 = [
  ["Tourism", "සංචාරක කර්මාන්තය", "Travelling to places for enjoyment, education or other purposes."],
  ["Holidaymaking", "නිවාඩු ගත කිරීම", "Taking a holiday away from normal work and daily activities."],
  ["Social phenomena", "සමාජීය සංසිද්ධි", "Events or patterns that occur within society."],
  ["Commentators", "විචාරකයන්", "People who discuss and give opinions about events or subjects."],
  ["Trivial", "සුළු / නොවැදගත්", "Not important or serious."],
  ["Weightier", "වඩා වැදගත් / බරපතළ", "More serious or important."],
  ["Accounting for", "පැහැදිලි කිරීම", "Explaining why something happens."],
  ["Deviance", "සමාජ සම්මතවලින් බැහැර හැසිරීම", "Behaviour that differs from accepted social standards."],
  ["Investigation", "විමර්ශනය", "A careful examination to discover facts."],
  ["Bizarre", "අමුතු / විකාර සහගත", "Very strange or unusual."],
  ["Idiosyncratic", "පුද්ගලිකව සුවිශේෂී වූ", "Unusual in a way that is particular to one person or group."],
  ["Defined as", "ලෙස අර්ථ දක්වන ලද", "Explained or described as having a particular meaning."],
  ["Assumption", "උපකල්පනය", "Something accepted as true without complete proof."],
  ["Reveal", "හෙළිදරව් කිරීම", "To make something known or visible."],
  ["Analysis", "විශ්ලේෂණය", "A detailed examination of something."],
  ["Applied to", "සඳහා යෙදීම", "Used in a particular situation or context."],
  ["Presupposes", "පෙර සිටම උපකල්පනය කරයි", "Assumes something is true before considering another thing."],
  ["Regulated", "නියාමනය කරන ලද", "Controlled by rules or regulations."],
  ["Manifestation", "ප්‍රකාශනය / පෙනී සිටීම", "A visible or clear example of something."],
  ["Spheres", "ක්ෂේත්‍ර", "Areas of activity, knowledge or influence."],
  ["Defining characteristics", "හඳුනාගැනීමේ මූලික ලක්ෂණ", "Qualities that make something what it is."],
  ["Regularised", "ක්‍රමවත් කළ", "Made to follow a regular pattern or schedule."],
  ["Destinations", "ගමනාන්ත", "Places to which people travel."],
  ["Necessarily", "අනිවාර්යයෙන්ම", "In a way that cannot be avoided."],
  ["Temporary", "තාවකාලික", "Continuing for only a limited time."],
  ["Proportion", "අනුපාතය", "A part or share compared with the whole."],
  ["Engages in", "නිරත වීම", "Takes part in an activity."],
  ["Provision", "සැපයීම", "The act of providing something needed."],
  ["Mass character", "මහා පරිමාණ ස්වභාවය", "A feature involving large numbers of people."],
  ["Gazes", "බැල්ම / දිගු බැලීම්", "Looks directed at something."],
  ["Anticipation", "අපේක්ෂාව", "The feeling of expecting something to happen."],
  ["Daydreaming", "සිහින මැවීම", "Thinking pleasantly about imagined situations."],
  ["Fantasy", "මනඃකල්පිත සිතුවිලි", "An imagined situation that may not be real."],
  ["Intense", "දැඩි / තීව්‍ර", "Very strong or extreme."],
  ["Customarily", "සාමාන්‍යයෙන් / සම්ප්‍රදායිකව", "In the way something is usually done."],
  ["Sustained", "පවත්වාගෙන ගිය", "Continued or maintained over time."],
  ["Variety", "විවිධත්වය", "A range of different things."],
  ["Reinforce", "ශක්තිමත් කිරීම", "To make something stronger or more effective."],
  ["Landscape", "භූ දර්ශනය", "The visible features of an area of land."],
  ["Townscape", "නගර දර්ශනය", "The visible appearance and features of a town."],
  ["Separate off", "වෙන් කර දැක්වීම", "To distinguish something from its surroundings."],
  ["Out of the ordinary", "සාමාන්‍යයෙන් වෙනස් වූ", "Unusual or different from what is normal."],
  ["Sensitivity", "සංවේදීතාව", "The ability to notice or respond to something."],
  ["Linger", "වැඩි වේලාවක් රැඳී සිටීම", "To stay somewhere longer than necessary."],
  ["Objectified", "වස්තුවක් ලෙස නිරූපණය කළ", "Presented or treated as a distinct object."],
  ["Captured", "සටහන් කරගත් / ග්‍රහණය කරගත්", "Recorded or preserved, often in a photograph."],
  ["Reproduced", "නැවත නිර්මාණය කළ", "Produced or copied again."],
  ["Recaptured", "නැවත අත්විඳීම", "Experienced or remembered again."],
  ["Dissertation", "පර්යේෂණ නිබන්ධනය", "A long piece of academic writing based on research."],
  ["Pseudo-event", "කෘත්‍රිමව නිර්මාණය කළ සිදුවීම", "An event created mainly to attract attention rather than arising naturally."],
  ["Contemporary", "සමකාලීන / වර්තමාන", "Belonging to the present time."],
  ["Thrive on", "මත රඳා පවතිමින් සාර්ථක වීම", "To become successful or enjoy something because of it."],
  ["Isolated", "හුදකලා වූ", "Separated from other people or places."],
  ["Host environment", "සත්කාරක පරිසරය", "The surroundings and society of the place being visited."],
  ["Inauthentic", "අව්‍යාජ නොවන", "Not genuine or real."],
  ["Contrived", "කෘත්‍රිමව සැලසුම් කළ", "Created deliberately rather than occurring naturally."],
  ["Gullibly", "පහසුවෙන් රැවටෙන ලෙස", "In a way that shows someone is easily deceived."],
  ["Disregarding", "නොසලකා හරිමින්", "Ignoring or paying little attention to something."],
  ["Self-perpetuating", "තමන් විසින්ම පවත්වාගෙන යන", "Continuing or maintaining itself without outside help."],
  ["Illusions", "මායාවන් / වැරදි හැඟීම්", "Beliefs or appearances that are not real."],
  ["Evaluating", "ඇගයීම", "Judging the value or quality of something."],
  ["Potential", "විභවය / හැකියාව", "The possibility of developing or achieving something."],
  ["Insulates", "වෙන් කර ආරක්ෂා කරයි", "Protects something by separating it from outside influences."],
  ["Burgeoning", "වේගයෙන් වර්ධනය වන", "Growing or developing quickly."],
  ["Array", "විශාල එකතුව / පෙළගැස්ම", "A large or varied collection of things."],
  ["Hierarchy", "ධූරාවලිය", "A system in which people or things are ranked."],
  ["Interplay", "අන්‍යෝන්‍ය බලපෑම", "The way two or more things influence each other."],
  ["Competition", "තරගකාරීත්වය", "An attempt to be more successful than others."],
  ["Distinctions", "වෙනස්කම් / භේද", "Differences between people or things."],
  ["Marker of status", "සමාජ තත්ත්වය පෙන්වන ලක්ෂණය", "Something that indicates a person's social position."],
  ["Cater for", "අවශ්‍යතා සපුරාලීම", "To provide what someone needs or wants."],
  ["Expectations", "අපේක්ෂාවන්", "Things people believe or hope will happen."]
];

function inferPos(term) {
  const t = term.trim();
  if (t === "Pull up stakes") return "idiom";
  if (t.includes(" ")) return "phrase";
  if (/^(Virtually|Essentially|Automatically|Subliminally|Gradually|Approximately|Necessarily|Customarily|Gullibly|Back-to-back)$/i.test(t)) {
    return "adverb";
  }
  if (/^(Distinct|Decided|Distinctive|Systematic|Ambiguous|Inherited|Remarkable|Bilateral|Specialised|Anatomical|Acquired|Evident|Lateralised|Alarming|Sinister|Migratory|Commercial|Fertile|Affordable|Tranquil|Lively|Fragrant|Temporary|Inserted|Weakened|Separated|Trivial|Weightier|Bizarre|Idiosyncratic|Regulated|Regularised|Intense|Sustained|Objectified|Captured|Reproduced|Recaptured|Contemporary|Isolated|Inauthentic|Contrived|Self-perpetuating|Burgeoning)$/i.test(t)) {
    return "adjective";
  }
  if (/^(Categorise|Differ|Observed|Secrete|Mature|Reinforces|Migrate|Pollinate|Haul|Rent|Experimented|Pacify|Encourage|Irritate|Reveal|Presupposes|Reinforce|Linger|Disregarding|Evaluating|Insulates)$/i.test(t)) {
    return "verb";
  }
  return "noun";
}

function buildEntry(row, idx, passageSection) {
  const [term, sinhalaMeaning, simpleExplanation] = row;
  const pos = inferPos(term);
  const id = `l12-w${idx + 1}`;
  const rawEx = allExamples[idx];

  if (!rawEx || rawEx.length !== 5) {
    throw new Error(`Missing 5 examples at index ${idx} (${term})`);
  }

  let sectionLabel = '';
  let sectionSi = '';
  if (passageSection === 'handedness') {
    sectionLabel = 'Right and Left-handedness in Humans';
    sectionSi = 'මිනිසුන්ගේ දකුණත් සහ වමත් භාවිතය';
  } else if (passageSection === 'beekeeping') {
    sectionLabel = 'Migratory Beekeeping';
    sectionSi = 'සංක්‍රමණික මී මැසි පාලනය';
  } else {
    sectionLabel = 'Tourism and Social Science';
    sectionSi = 'සංචාරක කර්මාන්තය සහ සමාජ විද්‍යාව';
  }

  const exampleSentences = rawEx.map(([en, si]) => ({ en, si }));

  // Use the first two natural short phrases from examples as clean collocations
  const collocations = [
    { text: rawEx[0][0].replace(/[.!?]+$/, ''), sinhala: rawEx[0][1].replace(/[.!?]+$/, '') },
    { text: rawEx[1][0].replace(/[.!?]+$/, ''), sinhala: rawEx[1][1].replace(/[.!?]+$/, '') }
  ];

  return {
    id,
    term,
    partOfSpeech: pos,
    definition: simpleExplanation,
    sinhalaDefinition: sinhalaMeaning,
    notes: `[${sectionLabel}] ${simpleExplanation}`,
    sinhalaNotes: `[${sectionSi}] ${sinhalaMeaning}`,
    collocations,
    exampleSentences,
    practicePrompt: `Write a short 3–5 word sentence using "${term}" (${sinhalaMeaning}).`,
    bandLevel: 'Band 7.5+'
  };
}

const words = [];

batch1Table1.forEach((row, i) => {
  const section = i < 71 ? 'handedness' : 'beekeeping';
  words.push(buildEntry(row, words.length, section));
});

batch1Table2.forEach((row) => {
  words.push(buildEntry(row, words.length, 'tourism'));
});

// Verify word counts of all 965 example sentences
let totalExamples = 0;
words.forEach((w) => {
  if (w.exampleSentences.length !== 5) {
    throw new Error(`Word ${w.term} does not have 5 examples!`);
  }
  totalExamples += w.exampleSentences.length;
});

console.log(`Total words built: ${words.length}, Total short example sentences: ${totalExamples}`);

const tsContent = `import { Lesson, Word } from '../types';

export const CAMBRIDGE_BATCH_1_WORDS: Word[] = ${JSON.stringify(words, null, 2)};

export const LESSON_12_CAMBRIDGE_BATCH_1: Lesson = {
  id: 'lesson-12',
  number: 12,
  title: 'IELTS Vocabulary Collection — Batch 1 (193 Words)',
  subtitle: 'Words & phrases from Right and Left-handedness, Migratory Beekeeping, and Tourism & Social Science',
  category: 'Cambridge Reading',
  description: 'Complete 100% collection of all 193 words and phrases from IELTS Vocabulary Collection — Batch 1, featuring Sinhala meanings, simple English explanations, and 5 short (3–5 word) example sentences for every word.',
  sinhalaDescription: 'IELTS කියවීම් පාඨවලින් උපුටා ගත් Batch 1 හි සියලුම වචන සහ යෙදුම් 193 (100%ක්ම) සිංහල තේරුම්, සරල ඉංග්‍රීසි පැහැදිලි කිරීම් සහ සෑම වචනයකටම කෙටි උදාහරණ වාක්‍ය 5 බැගින් මෙහි ඇතුළත් වේ.',
  bannerImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
  words: CAMBRIDGE_BATCH_1_WORDS,
  speakingChallenge: {
    part: 'PART 3 PRACTICE: SCIENCE, AGRICULTURE & TOURISM',
    question: 'How do scientific research, modern agricultural practices such as migratory beekeeping, and global tourism shape contemporary society?',
    minimumTargetWords: 5,
    sampleBand9Answer: 'Scientific investigation into human phenomena such as lateral asymmetry and brain hemisphere dominance reveals how specialised our species has become through evolution. Similarly, commercial agriculture relies heavily on migratory beekeeping to pollinate fertile crops during the blooming season. Meanwhile, contemporary tourism has evolved into a burgeoning social phenomenon where commentators analyse the interplay between authentic host environments and tourist expectations.',
    examinerTips: [
      'Use precise academic terms from Batch 1 such as "phenomena", "systematic", "commercial", and "contemporary".',
      'Combine multi-word phrases like "defining characteristics", "out of the ordinary", or "cater for" naturally.',
      'Support your points with clear explanations rather than memorised lists.'
    ]
  },
  writingChallenge: {
    task: 'IELTS Writing Task 2 (Academic Essay)',
    prompt: 'International tourism has become a massive global industry, yet some commentators argue that it creates contrived experiences and isolates visitors from the host environment. To what extent do you agree or disagree?',
    sampleBand8Paragraph: 'Contemporary holidaymaking is no longer a trivial pastime; rather, a substantial proportion of the population engages in international travel as a marker of status. Critics observe that mass tourism often insulates visitors from the host environment by catering for their expectations with contrived pseudo-events. Nevertheless, when regulated thoughtfully, tourism has the potential to reinforce cultural sensitivity and provide a financial bonanza for isolated local communities.'
  }
};
`;

const outPath = path.join(__dirname, '..', 'src', 'data', 'lesson12CambridgeBatch1.ts');
fs.writeFileSync(outPath, tsContent, 'utf8');
console.log('Successfully wrote:', outPath);
