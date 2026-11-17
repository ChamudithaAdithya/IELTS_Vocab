const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Table 1: Words and phrases from the reading passages (119 entries)
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

// Table 2: Batch 1 — continuation: Tourism and social science (71 entries)
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

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildHeadingParagraph(text, sizeHalfPt = 32, colorHex = '0F172A', spaceBefore = 240, spaceAfter = 120) {
  return `
    <w:p>
      <w:pPr>
        <w:spacing w:before="${spaceBefore}" w:after="${spaceAfter}"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Iskoola Pota"/>
          <w:b/>
          <w:color w:val="${colorHex}"/>
          <w:sz w:val="${sizeHalfPt}"/>
          <w:szCs w:val="${sizeHalfPt}"/>
        </w:rPr>
        <w:t>${escapeXml(text)}</w:t>
      </w:r>
    </w:p>`;
}

function buildBodyParagraph(text, italic = false) {
  return `
    <w:p>
      <w:pPr>
        <w:spacing w:before="80" w:after="120" w:line="276" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Iskoola Pota"/>
          ${italic ? '<w:i/>' : ''}
          <w:color w:val="334155"/>
          <w:sz w:val="22"/>
          <w:szCs w:val="22"/>
        </w:rPr>
        <w:t>${escapeXml(text)}</w:t>
      </w:r>
    </w:p>`;
}

function buildVocabTable(rows) {
  const colWidths = [2400, 3200, 4400]; // Total = 10000 dxa (~6.94 inches)

  const headerCells = ['Word / Phrase', 'Sinhala meaning', 'Simple explanation']
    .map((title, idx) => `
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="${colWidths[idx]}" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="1E293B"/>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:spacing w:before="60" w:after="60"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Iskoola Pota"/>
              <w:b/>
              <w:color w:val="FFFFFF"/>
              <w:sz w:val="22"/>
              <w:szCs w:val="22"/>
            </w:rPr>
            <w:t>${escapeXml(title)}</w:t>
          </w:r>
        </w:p>
      </w:tc>`).join('');

  const bodyRowsXml = rows.map((row, rIdx) => {
    const fillHex = rIdx % 2 === 1 ? 'F8FAFC' : 'FFFFFF';
    const cellsXml = row.map((cellText, cIdx) => `
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="${colWidths[cIdx]}" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="${fillHex}"/>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:spacing w:before="40" w:after="40"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:EastAsia="Nirmala UI" w:cs="Iskoola Pota"/>
              ${cIdx === 0 ? '<w:b/>' : ''}
              <w:color w:val="${cIdx === 0 ? '0F172A' : '1E293B'}"/>
              <w:sz w:val="21"/>
              <w:szCs w:val="22"/>
            </w:rPr>
            <w:t>${escapeXml(cellText)}</w:t>
          </w:r>
        </w:p>
      </w:tc>`).join('');

    return `
      <w:tr>
        <w:trPr>
          <w:cantSplit/>
        </w:trPr>
        ${cellsXml}
      </w:tr>`;
  }).join('');

  return `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="10000" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
        </w:tblBorders>
        <w:tblCellMar>
          <w:top w:w="100" w:type="dxa"/>
          <w:left w:w="140" w:type="dxa"/>
          <w:bottom w:w="100" w:type="dxa"/>
          <w:right w:w="140" w:type="dxa"/>
        </w:tblCellMar>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="${colWidths[0]}"/>
        <w:gridCol w:w="${colWidths[1]}"/>
        <w:gridCol w:w="${colWidths[2]}"/>
      </w:tblGrid>
      <w:tr>
        <w:trPr>
          <w:tblHeader/>
          <w:cantSplit/>
        </w:trPr>
        ${headerCells}
      </w:tr>
      ${bodyRowsXml}
    </w:tbl>`;
}

// CRC32 calculation for ZIP format
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createZipBuffer(files) {
  const localFileHeaders = [];
  const centralDirHeaders = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const uncompressedBuf = Buffer.from(file.content, 'utf8');
    const compressedBuf = zlib.deflateRawSync(uncompressedBuf);
    const crc = crc32(uncompressedBuf);

    // Local file header (30 bytes + nameLen)
    const lfh = Buffer.alloc(30 + nameBuf.length);
    lfh.writeUInt32LE(0x04034b50, 0); // signature
    lfh.writeUInt16LE(20, 4);         // version needed
    lfh.writeUInt16LE(0, 6);          // flags
    lfh.writeUInt16LE(8, 8);          // compression: deflate
    lfh.writeUInt16LE(0, 10);         // mod time
    lfh.writeUInt16LE(0, 12);         // mod date
    lfh.writeUInt32LE(crc, 14);
    lfh.writeUInt32LE(compressedBuf.length, 18);
    lfh.writeUInt32LE(uncompressedBuf.length, 22);
    lfh.writeUInt16LE(nameBuf.length, 26);
    lfh.writeUInt16LE(0, 28);         // extra len
    nameBuf.copy(lfh, 30);

    localFileHeaders.push(lfh, compressedBuf);

    // Central directory header (46 bytes + nameLen)
    const cdh = Buffer.alloc(46 + nameBuf.length);
    cdh.writeUInt32LE(0x02014b50, 0); // signature
    cdh.writeUInt16LE(20, 4);         // version made by
    cdh.writeUInt16LE(20, 6);         // version needed
    cdh.writeUInt16LE(0, 8);          // flags
    cdh.writeUInt16LE(8, 10);         // compression: deflate
    cdh.writeUInt16LE(0, 12);         // mod time
    cdh.writeUInt16LE(0, 14);         // mod date
    cdh.writeUInt32LE(crc, 16);
    cdh.writeUInt32LE(compressedBuf.length, 20);
    cdh.writeUInt32LE(uncompressedBuf.length, 24);
    cdh.writeUInt16LE(nameBuf.length, 28);
    cdh.writeUInt16LE(0, 30);         // extra len
    cdh.writeUInt16LE(0, 32);         // comment len
    cdh.writeUInt16LE(0, 34);         // disk number
    cdh.writeUInt16LE(0, 36);         // internal attrs
    cdh.writeUInt32LE(0, 38);         // external attrs
    cdh.writeUInt32LE(offset, 42);    // local header offset
    nameBuf.copy(cdh, 46);

    centralDirHeaders.push(cdh);
    offset += lfh.length + compressedBuf.length;
  }

  const cdBuffer = Buffer.concat(centralDirHeaders);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cdBuffer.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localFileHeaders, cdBuffer, eocd]);
}

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${buildHeadingParagraph('IELTS Vocabulary Collection — Batch 1', 36, '0F172A', 0, 120)}
    ${buildBodyParagraph('Source overview: Extracted from text.txt (approximately 14,318 words and 2,982 distinct English word forms). Common articles and conjunctions (a, an, the, and) and duplicate entries have been removed. Each entry includes a Sinhala meaning and a simple English explanation.')}
    ${buildHeadingParagraph('1. Words and phrases from the reading passages', 28, '1E293B', 200, 120)}
    ${buildVocabTable(batch1Table1)}
    ${buildHeadingParagraph('2. Batch 1 — Continuation: Tourism and social science', 28, '1E293B', 320, 120)}
    ${buildVocabTable(batch1Table2)}
    ${buildBodyParagraph('Progress: Batch 1 is the beginning of the collection. The next batches continue with vocabulary from the remaining passages in the uploaded file, including fire, zoo conservation, architecture, spoken English, underground homes, work and population viability.', true)}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const docxBuffer = createZipBuffer([
  { name: '[Content_Types].xml', content: contentTypesXml },
  { name: '_rels/.rels', content: relsXml },
  { name: 'word/document.xml', content: documentXml },
]);

const outPathWorkspace = path.resolve('d:/IELTS WEB/IELTS_Vocab/IELTS_Vocabulary_Batch_1.docx');
const outPathDesktop = path.resolve('C:/Users/anjal/OneDrive/Desktop/IELTS_Vocabulary_Batch_1.docx');

fs.writeFileSync(outPathWorkspace, docxBuffer);
fs.writeFileSync(outPathDesktop, docxBuffer);

console.log(`Successfully generated Word document (${docxBuffer.length} bytes):`);
console.log(`  1. ${outPathWorkspace}`);
console.log(`  2. ${outPathDesktop}`);
console.log(`Total entries: ${batch1Table1.length + batch1Table2.length} (${batch1Table1.length} in Table 1 + ${batch1Table2.length} in Table 2)`);
