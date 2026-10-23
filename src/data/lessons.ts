import { Lesson } from '../types';
import { IMPORTED_ACADEMIC_LESSON } from './importedVocabulary';

export const LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    number: 1,
    title: 'People, Personality & Character',
    subtitle: 'Describing individuals, behavioral traits, and personal values',
    category: 'Society & Individual',
    description: 'Learn high-scoring Band 7.5+ vocabulary to describe character traits, psychological attitudes, and social behavior in IELTS Speaking Part 2/3 and Writing Task 2.',
    sinhalaDescription: 'පුද්ගල චරිත ලක්ෂණ, හැසිරීම් සහ මානසික ආකල්ප IELTS විභාගයේදී ස්වභාවිකව විස්තර කිරීමට ඉහළ ලකුණු ලබා දෙන වචන මාලාව.',
    bannerImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    words: [
      {
        id: 'l1-w1',
        term: 'Diligent',
        partOfSpeech: 'adjective',
        ipa: '/ˈdɪlɪdʒənt/',
        definition: 'Having or showing care and conscientiousness in one\'s work or duties.',
        sinhalaDefinition: 'උත්සාහවන්ත / කැපවීමෙන් වැඩ කරන',
        notes: 'Much more formal and academic than simply saying "hardworking". Frequently used in IELTS to describe students, employees, or researchers.',
        sinhalaNotes: '"Hardworking" යන සරල වචනයට වඩා විධිමත් වූවකි. අධ්‍යයන හෝ රැකියා ක්ෂේත්‍රයේ කැපවීමෙන් කටයුතු කරන අය විස්තර කිරීමට යොදා ගනී.',
        collocations: [
          { text: 'Diligent student', sinhala: 'උත්සාහවන්ත ශිෂ්‍යයා' },
          { text: 'Diligent research', sinhala: 'නිරන්තර කැපවීමෙන් කළ පර්යේෂණය' },
          { text: 'Remain diligent', sinhala: 'නොකඩවා උත්සාහවන්තව සිටීම' },
          { text: 'Diligent effort', sinhala: 'මහන්සි වී කළ උත්සාහය' }
        ],
        exampleSentences: [
          {
            en: 'Through diligent study and perseverance, she secured a top scholarship.',
            si: 'නිරන්තර උත්සාහවන්ත අධ්‍යයනය සහ නොපසුබස්නා උත්සාහය තුළින් ඇය ඉහළම ශිෂ්‍යත්වය දිනා ගත්තාය.'
          },
          {
            en: 'Diligent employees are essential for maintaining productivity in high-pressure workplaces.',
            si: 'අධික පීඩනයක් සහිත සේවා ස්ථානවල ඵලදායිතාව පවත්වා ගැනීම සඳහා කැපවීමෙන් වැඩ කරන සේවකයින් අත්‍යවශ්‍ය වේ.'
          },
          {
            en: 'The examiner noticed that the candidate made a diligent effort to use precise lexical resources.',
            si: 'අපේක්ෂකයා නිවැරදි වචන මාලාවක් භාවිතා කිරීමට මහන්සි වී උත්සාහ කළ බව පරීක්ෂකවරයා නිරීක්ෂණය කළේය.'
          },
        ],
        practicePrompt: 'Describe a diligent person you know and how their hard work inspired you.',
        bandLevel: 'Band 7.5+',
        commonMistake: {
          incorrect: 'He works very diligent.',
          correct: 'He works diligently. / He is a diligent worker.',
          explanation: '"Diligent" is an adjective; use the adverb "diligently" to modify a verb.'
        }
      },
      {
        id: 'l1-w2',
        term: 'Resilient',
        partOfSpeech: 'adjective',
        ipa: '/rɪˈzɪliənt/',
        definition: 'Able to withstand or recover quickly from difficult conditions, failures, or trauma.',
        sinhalaDefinition: 'දුෂ්කරතා හමුවේ නොසැලී සිටින / ඉක්මනින් යථා තත්ත්වයට පත්වන',
        notes: 'Crucial for both personality questions and broader societal topics such as economics and climate adaptation.',
        sinhalaNotes: 'පෞද්ගලික දුෂ්කරතා හෝ ආර්ථික අර්බුද හමුවේ නොසැලී සිටීමේ හැකියාව විස්තර කිරීමට යොදා ගනී.',
        collocations: [
          { text: 'Remarkably resilient', sinhala: 'විශේෂ ලෙස නොසැලෙන' },
          { text: 'Build emotional resilience', sinhala: 'මානසික ශක්තිය ගොඩනැගීම' },
          { text: 'Resilient economy', sinhala: 'කම්පනවලට ඔරොත්තු දෙන ආර්ථිකයක්' },
          { text: 'Resilient character', sinhala: 'නොසැලෙන චරිතයක්' }
        ],
        exampleSentences: [
          {
            en: 'Children are often more resilient than adults when adapting to unfamiliar environments.',
            si: 'නුහුරු පරිසරයන්ට අනුගත වීමේදී වැඩිහිටියන්ට වඩා දරුවන් බොහෝ විට දුෂ්කරතාවලට නොසැලී මුහුණ දීමේ හැකියාවෙන් යුක්ත වේ.'
          },
          {
            en: 'Overcoming hardship helps young adults become more resilient individuals.',
            si: 'දුෂ්කරතාවලට මුහුණ දී ජය ගැනීම තරුණ තරුණියන්ට නොසැලෙන ශක්තිමත් පුද්ගලයන් බවට පත්වීමට උපකාරී වේ.'
          },
          {
            en: 'A resilient mindset is essential for dealing with modern professional setbacks.',
            si: 'නූතන වෘත්තීය පසුබෑම්වලට මුහුණ දීම සඳහා නොසැලෙන මානසිකත්වයක් තිබීම අත්‍යවශ්‍යය.'
          },
        ],
        practicePrompt: 'Explain how developing resilience helps students face exam pressure.',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l1-w3',
        term: 'Meticulous',
        partOfSpeech: 'adjective',
        ipa: '/məˈtɪkjələs/',
        definition: 'Showing great attention to detail; very careful and precise.',
        sinhalaDefinition: 'සියුම් තොරතුරු කෙරෙහි දැඩි අවධානයක් දක්වන / ඉතා සුපරීක්ෂාකාරී',
        notes: 'Use when describing someone who checks every minor detail, e.g., scientists, editors, architects, or planners.',
        sinhalaNotes: 'සුළු දේ කෙරෙහි පවා ගැඹුරින් විමසිලිමත් වන පුද්ගලයින් විස්තර කිරීමට මෙය ඉතා සුදුසුය.',
        collocations: [
          { text: 'Meticulous planning', sinhala: 'ඉතා සුපරීක්ෂාකාරී සැලසුම් කිරීම' },
          { text: 'Meticulous attention to detail', sinhala: 'සියුම් කරුණු කෙරෙහි විශේෂ අවධානය' },
          { text: 'Meticulous researcher', sinhala: 'විමසිලිමත් පර්යේෂකයා' },
          { text: 'In a meticulous manner', sinhala: 'ඉතා පිළිවෙළකට හා නිවැරදිව' }
        ],
        exampleSentences: [
          {
            en: 'Success in surgical procedures demands meticulous attention to detail.',
            si: 'ශල්‍යකර්ම සාර්ථක කර ගැනීම සඳහා ඉතා සියුම් කරුණු කෙරෙහි පවා සුපරීක්ෂාකාරී අවධානයක් අවශ්‍ය වේ.'
          },
          {
            en: 'His meticulous approach to data collection ensured that the research findings were undisputed.',
            si: 'දත්ත එක්රැස් කිරීම කෙරෙහි ඔහු දැක්වූ සුපරීක්ෂාකාරී ප්‍රවේශය නිසා පර්යේෂණ සොයාගැනීම් මතභේදයකින් තොර විය.'
          },
          {
            en: 'Writing a Band 8 essay requires meticulous planning of paragraph structure.',
            si: 'Band 8 මට්ටමේ රචනයක් ලිවීම සඳහා ඡේද ව්‍යුහය ඉතා සූක්ෂ්ම ලෙස සැලසුම් කිරීම අවශ්‍ය වේ.'
          },
        ],
        practicePrompt: 'Describe a situation where meticulous planning was crucial for success.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l1-w4',
        term: 'Gregarious',
        partOfSpeech: 'adjective',
        ipa: '/ɡrɪˈɡeəriəs/',
        definition: 'Fond of company; sociable and enjoying being around others.',
        sinhalaDefinition: 'සමාජශීලී / අන් අය සමඟ එකමුතුව කාලය ගත කිරීමට ප්‍රිය කරන',
        notes: 'A sophisticated synonym for "outgoing" or "sociable". High lexical score in IELTS Speaking Part 1 & 2.',
        sinhalaNotes: '"Friendly" හෝ "sociable" යන වචන වෙනුවට භාවිතා කළ හැකි උසස් මට්ටමේ වචනයකි.',
        collocations: [
          { text: 'Gregarious personality', sinhala: 'සමාජශීලී පෞරුෂය' },
          { text: 'Naturally gregarious', sinhala: 'උපතින්ම සමාජශීලී' },
          { text: 'A gregarious animal/species', sinhala: 'රංචු ගැසී වසන සත්ත්ව විශේෂයක්' }
        ],
        exampleSentences: [
          {
            en: 'Unlike his introverted brother, Kevin has a gregarious nature and makes friends effortlessly.',
            si: 'තම අන්තර්වර්තී සහෝදරයා මෙන් නොව, කෙවින් සමාජශීලී ගතිගුණ ඇති අතර ඉතා පහසුවෙන් මිතුරන් ඇති කර ගනී.'
          },
          {
            en: 'Gregarious individuals often thrive in team-oriented corporate environments.',
            si: 'කණ්ඩායම් හැඟීමෙන් යුත් ආයතනික පරිසරයන්හි සමාජශීලී පුද්ගලයෝ බොහෝ විට කැපී පෙනෙති.'
          },
          {
            en: 'During university festivals, even shy students can become unexpectedly gregarious.',
            si: 'විශ්වවිද්‍යාල උත්සව කාලවලදී ලැජ්ජාශීලී සිසුන් පවා අනපේක්ෂිත ලෙස සමාජශීලී විය හැක.'
          },
        ],
        practicePrompt: 'Compare the advantages of being gregarious versus being reserved in the workplace.',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l1-w5',
        term: 'Conscientious',
        partOfSpeech: 'adjective',
        ipa: '/ˌkɒnʃiˈenʃəs/',
        definition: 'Wishing to do one\'s work or duty thoroughly and correctly, guided by a moral sense.',
        sinhalaDefinition: 'හෘද සාක්ෂියට එකඟව වගකීම් සහගතව කටයුතු කරන',
        notes: 'Combines the ideas of honesty, thoroughness, and ethical duty. Extremely respected by IELTS examiners.',
        sinhalaNotes: 'කාර්යයක් සාධාරණව, වගකීමෙන් සහ හෘද සාක්ෂියට අනුව සම්පූර්ණ කරන පුද්ගලයන් සඳහා යොදයි.',
        collocations: [
          { text: 'Conscientious objector', sinhala: 'හෘද සාක්ෂිය මත විරුද්ධ වන්නා' },
          { text: 'Conscientious worker', sinhala: 'වගකීම්සහගත සේවකයා' },
          { text: 'Conscientious approach', sinhala: 'හෘද සාක්ෂියට එකඟ ප්‍රවේශය' }
        ],
        exampleSentences: [
          {
            en: 'A conscientious teacher cares not only about exam grades but also about moral development.',
            si: 'වගකීම් සහගත ගුරුවරයෙකු විභාග ලකුණු ගැන පමණක් නොව දරුවන්ගේ සදාචාරාත්මක සංවර්ධනය ගැනද සැලකිලිමත් වේ.'
          },
          {
            en: 'She is a conscientious employee who consistently checks her deliverables before submission.',
            si: 'ඇය තම කාර්යයන් භාරදීමට පෙර ඒවා නැවත නැවතත් පරීක්ෂා කරන ඉතා හෘද සාක්ෂියට එකඟව වැඩ කරන සේවිකාවකි.'
          },
          {
            en: 'Conscientious citizens actively take part in environmental protection programs.',
            si: 'වගකීම්සහගත පුරවැසියෝ පරිසර සංරක්ෂණ වැඩසටහන් සඳහා සක්‍රීයව දායක වෙති.'
          },
        ],
        practicePrompt: 'Explain why employers prioritize conscientious candidates over simply clever ones.',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l1-w6',
        term: 'Empathy',
        partOfSpeech: 'noun',
        ipa: '/ˈempəθi/',
        definition: 'The ability to understand and share the feelings and perspectives of another person.',
        sinhalaDefinition: 'අනුන්ගේ දුක හෝ හැඟීම් තමන්ගේම සේ තේරුම් ගැනීමේ හැකියාව (සහවේදනය)',
        notes: 'Distinguish from sympathy: sympathy is feeling sorry for someone; empathy is putting yourself in their shoes.',
        sinhalaNotes: 'අනුකම්පාවට (sympathy) වඩා ගැඹුරුය; අන් අයගේ තත්ත්වය තුළ තමන් සිටින සේ සිතා බැලීමයි.',
        collocations: [
          { text: 'Lack of empathy', sinhala: 'සහවේදනය නොමැතිකම' },
          { text: 'Cultivate empathy', sinhala: 'සහවේදන හැකියාව ප්‍රගුණ කිරීම' },
          { text: 'Deep empathy for', sinhala: '... පිළිබඳ ගැඹුරු සහවේදනය' },
          { text: 'Show genuine empathy', sinhala: 'සැබෑ සහවේදනය ප්‍රකට කිරීම' }
        ],
        exampleSentences: [
          {
            en: 'Reading literary fiction has been shown to increase empathy towards diverse cultures.',
            si: 'සාහිත්‍ය කෘති කියවීම විවිධ සංස්කෘතීන් කෙරෙහි සහකම්පනය වැඩි කිරීමට උපකාරී වන බව පෙන්වා දී ඇත.'
          },
          {
            en: 'Effective leaders must possess emotional intelligence and genuine empathy.',
            si: 'ඵලදායී නායකයින් සතුව චිත්තවේගීය බුද්ධිය මෙන්ම සැබෑ සහකම්පනයද පැවතිය යුතුය.'
          },
          {
            en: 'A lack of empathy in digital communication frequently escalates online misunderstandings.',
            si: 'ඩිජිටල් සන්නිවේදනයේ සහකම්පනය නොමැතිකම බොහෝ විට අන්තර්ජාලය තුළ වැරදි වැටහීම් උග්‍ර කිරීමට හේතු වේ.'
          },
        ],
        practicePrompt: 'Discuss whether school education should explicitly teach empathy to children.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l1-w7',
        term: 'Charismatic',
        partOfSpeech: 'adjective',
        ipa: '/ˌkærɪzˈmætɪk/',
        definition: 'Exercising a compelling charm which inspires devotion or admiration in others.',
        sinhalaDefinition: 'අන්‍යයන් ආකර්ෂණය කර ගන්නා / ප්‍රතාපවත් චරිතයක් ඇති',
        notes: 'Often used in discussions of political leaders, motivational speakers, and cultural icons.',
        sinhalaNotes: 'නායකයින් හෝ ප්‍රබල පුද්ගලයින් තුළ පවතින සුවිශේෂී ආකර්ෂණීය පෞරුෂය විස්තර කිරීමට යොදයි.',
        collocations: [
          { text: 'Charismatic leader', sinhala: 'ප්‍රතාපවත් / ආකර්ෂණීය නායකයා' },
          { text: 'Charismatic appeal', sinhala: 'විශේෂ ආකර්ෂණීය බව' },
          { text: 'Highly charismatic', sinhala: 'ඉමහත් ආකර්ෂණයක් ඇති' }
        ],
        exampleSentences: [
          {
            en: 'Nelson Mandela was renowned as an exceptionally charismatic statesman.',
            si: 'නෙල්සන් මැන්ඩෙලා අතිශය ආකර්ෂණීය රාජ්‍ය නායකයෙකු ලෙස ප්‍රසිද්ධියට පත් විය.'
          },
          {
            en: 'A charismatic teacher can inspire students to love even the most difficult subjects.',
            si: 'ආකර්ෂණීය පෞරුෂයක් ඇති ගුරුවරයෙකුට වඩාත් අපහසු විෂයයන්ට පවා සිසුන්ගේ ප්‍රියතාවය ඇති කළ හැකිය.'
          },
          {
            en: 'Charisma alone is insufficient for governing; integrity and technical competence are also paramount.',
            si: 'රටක් පාලනය කිරීමට ආකර්ෂණය පමණක් ප්‍රමාණවත් නොවේ; අවංකභාවය සහ තාක්ෂණික නිපුණතාවද අත්‍යවශ්‍ය වේ.'
          },
        ],
        practicePrompt: 'Do you believe charismatic leaders are more effective than quiet, analytical leaders?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l1-w8',
        term: 'Cynical',
        partOfSpeech: 'adjective',
        ipa: '/ˈsɪnɪkəl/',
        definition: 'Believing that people are motivated purely by self-interest; distrustful of human sincerity.',
        sinhalaDefinition: 'සැක සහිත / මිනිසුන්ගේ අවංකභාවය විශ්වාස නොකරන ආකල්පයක් ඇති',
        notes: 'Use in Task 2 essays discussing public trust in politics, media, advertising, or institutions.',
        sinhalaNotes: 'මිනිසුන් ආත්මාර්ථකාමී යැයි සිතන, ආයතන හෝ දේශපාලනය කෙරෙහි සැක සහිත ආකල්පය විස්තර කරයි.',
        collocations: [
          { text: 'Cynical view/attitude', sinhala: 'සැක සහිත ආකල්පය' },
          { text: 'Become cynical', sinhala: 'සැක සහිත මනසක් ඇති කර ගැනීම' },
          { text: 'Cynical ploy/manipulation', sinhala: 'වංචනික උපක්‍රමය' }
        ],
        exampleSentences: [
          {
            en: 'Repeated broken campaign promises have made many young voters deeply cynical.',
            si: 'දේශපාලනඥයන් දුන් මැතිවරණ පොරොන්දු දිගින් දිගටම කඩවීම නිසා බොහෝ තරුණ ඡන්දදායකයින් දේශපාලනය ගැන කලකිරී සිටිති.'
          },
          {
            en: 'It is easy to adopt a cynical worldview, yet optimism often drives genuine progress.',
            si: 'සෑම දෙයක් ගැනම සැකමුසු කලකිරුණු ආකල්පයක් ගැනීම පහසු වුවද, සැබෑ ප්‍රගතිය ගෙන එන්නේ සුබවාදී බලාපොරොත්තුවයි.'
          },
          {
            en: 'Advertising campaigns are sometimes dismissed by consumers as cynical marketing gimmicks.',
            si: 'පාරිභෝගිකයින් සමහර වෙළඳ ප්‍රචාරණ ව්‍යාපාර ප්‍රතික්ෂේප කරන්නේ හුදු වාණිජ උපක්‍රම ලෙස සලකමිනි.'
          },
        ],
        practicePrompt: 'Explain why modern citizens have grown cynical regarding commercial advertisements.',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l1-w9',
        term: 'Introverted',
        partOfSpeech: 'adjective',
        ipa: '/ˈɪntrəvɜːtɪd/',
        definition: 'Inward-looking and quiet; gaining energy from solitary activities rather than social interaction.',
        sinhalaDefinition: 'අභ්‍යන්තරයට නැඹුරු වූ / නිහඬ හා තනිව සිටීමට ප්‍රිය කරන',
        notes: 'Remember: introverted does not mean antisocial or shy; it refers to energy processing style.',
        sinhalaNotes: '"ලාමක" හෝ "ලැජ්ජාශීලී" යන්න නොවේ; තමන්ගේම මනස තුළ තනිව කල්ගත කර ශක්තිය ලබන ස්වභාවයයි.',
        collocations: [
          { text: 'Introverted nature', sinhala: 'අභ්‍යන්තර නැඹුරුවක් ඇති ස්වභාවය' },
          { text: 'Tend to be introverted', sinhala: 'නිහඬ ස්වභාවයකට නැඹුරු වීම' },
          { text: 'Introverted disposition', sinhala: 'සන්සුන්, තැන්පත් මානසිකත්වය' }
        ],
        exampleSentences: [
          {
            en: 'Introverted employees frequently excel at tasks demanding prolonged focus and deep analytical thought.',
            si: 'දිගු වේලාවක් දැඩි අවධානයක් සහ ගැඹුරු විශ්ලේෂණාත්මක චින්තනයක් අවශ්‍ය වන කාර්යයන්හිදී අන්තර්වර්තී සේවකයෝ විශිෂ්ට දස්කම් දක්වති.'
          },
          {
            en: 'Society often rewards gregarious behavior, neglecting the profound insights of introverted thinkers.',
            si: 'අන්තර්වර්තී චින්තකයින්ගේ ගැඹුරු තීක්ෂ්ණ බුද්ධිය නොසලකා හරිමින් සමාජය බොහෝ විට සමාජශීලී හැසිරීම් පමණක් අගය කරයි.'
          },
          {
            en: 'An introverted child may prefer solitary hobbies such as programming or sketching.',
            si: 'අන්තර්වර්තී දරුවෙකු පරිගණක ක්‍රමලේඛනය හෝ චිත්‍ර ඇඳීම වැනි තනිව කරන විනෝදාංශවලට වැඩි කැමැත්තක් දැක්විය හැක.'
          },
        ],
        practicePrompt: 'Discuss the strengths that an introverted person brings to an academic research team.',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l1-w10',
        term: 'Altruistic',
        partOfSpeech: 'adjective',
        ipa: '/ˌæltruˈɪstɪk/',
        definition: 'Showing a disinterested and selfless concern for the well-being of others.',
        sinhalaDefinition: 'පරාර්ථකාමී / තමන්ගේ වාසිය නොසලකා අනුන්ට සෙත සලසන',
        notes: 'Opposite of selfish / egoistic. Band 8+ vocabulary for philanthropy, community service, and ethical behavior.',
        sinhalaNotes: '"Selfless" යන වචනයට වඩා ඉහළ මට්ටමේ වචනයකි. පරාර්ථකාමී පරිත්‍යාග සහ සමාජ සේවා විස්තර කිරීමට භාවිතා කරයි.',
        collocations: [
          { text: 'Altruistic motives', sinhala: 'පරාර්ථකාමී චේතනා' },
          { text: 'Altruistic behavior', sinhala: 'පරාර්ථකාමී හැසිරීම' },
          { text: 'Purely altruistic', sinhala: 'සම්පූර්ණයෙන්ම පරාර්ථකාමී' }
        ],
        exampleSentences: [
          {
            en: 'Volunteering at a local hospice is driven primarily by altruistic motives.',
            si: 'ප්‍රාදේශීය උපස්ථාන මධ්‍යස්ථානයක ස්වේච්ඡාවෙන් සේවය කිරීම ප්‍රධාන වශයෙන් පරාර්ථකාමී චේතනාවෙන් මෙහෙයවනු ලබන්නකි.'
          },
          {
            en: 'Biologists debate whether true altruistic behavior exists in the animal kingdom.',
            si: 'සත්ත්ව ලෝකයේ සැබෑ පරාර්ථකාමී හැසිරීම් පවතින්නේද යන්න පිළිබඳව ජීව විද්‍යාඥයින් තර්ක කරති.'
          },
          {
            en: 'Cultivating altruistic values in childhood fosters a harmonious and cooperative society.',
            si: 'ළමා කාලයේදී පරාර්ථකාමී වටිනාකම් ප්‍රගුණ කිරීම සාමකාමී හා සහයෝගී සමාජයක් ගොඩනැගීමට ඉවහල් වේ.'
          },
        ],
        practicePrompt: 'Describe an altruistic act you witnessed in your community.',
        bandLevel: 'Band 8.0+'
      }
    ],
    speakingChallenge: {
      part: 'PART 2 / PART 3 PRACTICE',
      question: 'Describe a person whose character you admire. You should say who they are, how you know them, what qualities they possess, and explain why you admire them.',
      minimumTargetWords: 3,
      sampleBand9Answer: 'I would like to speak about my maternal uncle, who has always impressed me as an extraordinarily conscientious and resilient individual. Throughout his career as an environmental researcher, he demonstrated diligent dedication to fieldwork under harsh conditions. Despite facing significant professional setbacks, he maintained a remarkably optimistic outlook rather than becoming cynical. What I admire most is his genuine empathy towards younger generations, as he consistently devotes his weekends to mentoring underprivileged students through purely altruistic initiatives.',
      examinerTips: [
        'Use specific personality adjectives (e.g., resilient, conscientious) rather than generic words like "good" or "nice".',
        'Back up each trait with a concrete real-life anecdote or consequence.',
        'Vary your sentence structure using contrasting subordinate clauses (e.g. "Despite facing... he maintained...").'
      ]
    }
  },
  {
    id: 'lesson-2',
    number: 2,
    title: 'Family & Relationships',
    subtitle: 'With Sinhala translations · IELTS Speaking & Writing',
    category: 'Family & Society',
    description: 'Learn advanced vocabulary to discuss family life, parenting, childhood, relationships, and social changes naturally.',
    sinhalaDescription: 'පවුල් ජීවිතය, දෙමාපිය රැකවරණය, ළමා කාලය, සබඳතා සහ සමාජ වෙනස්කම් ස්වභාවිකව විස්තර කිරීමට උසස් වචන මාලාව.',
    bannerImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    words: [
      {
        id: 'l2-w1',
        term: 'Upbringing',
        partOfSpeech: 'noun',
        ipa: '/ˈʌpˌbrɪŋɪŋ/',
        definition: 'The way a child is raised and taught by their parents or guardians.',
        sinhalaDefinition: 'හැදී වැඩීම / ඇතිදැඩි කිරීම',
        notes: 'This noun refers to the environment, values, discipline, and experiences that shape a child while growing up. It is particularly useful when discussing how parents influence children\'s behaviour.',
        sinhalaNotes: 'දරුවෙකු හැදී වැඩෙන පරිසරය, දෙමාපියන්ගෙන් ලැබෙන වටිනාකම්, විනය සහ අත්දැකීම් මෙම වචනයෙන් අදහස් වේ.',
        collocations: [
          { text: 'Strict upbringing', sinhala: 'දැඩි විනයක් සහිත හැදී වැඩීම' },
          { text: 'A sheltered upbringing', sinhala: 'බාහිර අත්දැකීම්වලින් සීමා වූ හැදී වැඩීම' },
          { text: 'Have a happy upbringing', sinhala: 'සතුටින් පිරි ළමා කාලයක් ගත කර හැදී වැඩීම' },
          { text: 'Influence someone\'s upbringing', sinhala: 'කෙනෙකුගේ හැදී වැඩීමට බලපෑම් කිරීම' },
          { text: 'Family upbringing', sinhala: 'පවුල තුළ සිදුවන ඇතිදැඩි කිරීම' }
        ],
        exampleSentences: [
          {
            en: 'My strict upbringing taught me the importance of discipline and responsibility.',
            si: 'මගේ දැඩි විනය සහිත ඇතිදැඩි කිරීම මට විනය සහ වගකීමේ වැදගත්කම කියා දුන්නේය.'
          },
          {
            en: 'A child\'s upbringing can have a profound influence on their personality.',
            si: 'දරුවෙකුගේ හැදී වැඩීම ඔවුන්ගේ පෞරුෂයට ගැඹුරු බලපෑමක් ඇති කළ හැකිය.'
          },
          {
            en: 'Children who have a supportive upbringing may find it easier to develop healthy relationships.',
            si: 'උපකාරශීලී පරිසරයක හැදී වැඩෙන දරුවන්ට සෞඛ්‍ය සම්පන්න සබඳතා ගොඩනඟා ගැනීම පහසු විය හැකිය.'
          },
        ],
        practicePrompt: 'Describe how parents influence a child\'s personality.',
        bandLevel: 'Band 7.5+',
        commonMistake: {
          incorrect: 'He was upbringing in a small village.',
          correct: 'He had a rural upbringing. / He was brought up in a small village.',
          explanation: '"Upbringing" is a noun. The phrasal verb form is "bring up" (passive: "be brought up").'
        }
      },
      {
        id: 'l2-w2',
        term: 'Affection',
        partOfSpeech: 'noun',
        ipa: '/əˈfekʃən/',
        definition: 'A feeling of liking or loving someone or something.',
        sinhalaDefinition: 'සෙනෙහස / ආදරය',
        notes: 'Affection is a noun used to describe feelings of warmth, love, and care. It is common in discussions about parent-child relationships and emotional development.',
        sinhalaNotes: 'ආදරය, උණුසුම් හැඟීම් සහ සැලකිල්ල ප්‍රකාශ කරන නාම පදයකි. දෙමාපියන් සහ දරුවන් අතර සම්බන්ධතා ගැන කතා කිරීමේදී මෙය ප්‍රයෝජනවත් වේ.',
        collocations: [
          { text: 'Show affection', sinhala: 'සෙනෙහස පෙන්වීම' },
          { text: 'Express affection', sinhala: 'ආදරය ප්‍රකාශ කිරීම' },
          { text: 'Parental affection', sinhala: 'දෙමාපිය සෙනෙහස' },
          { text: 'A lack of affection', sinhala: 'සෙනෙහස නොමැතිකම' },
          { text: 'Deep affection', sinhala: 'ගැඹුරු ආදරයක්' }
        ],
        exampleSentences: [
          {
            en: 'Parents should show affection towards their children to help them feel secure.',
            si: 'දරුවන්ට ආරක්ෂිත හැඟීමක් ඇති කිරීමට දෙමාපියන් ඔවුන් කෙරෙහි සෙනෙහස දැක්විය යුතුය.'
          },
          {
            en: 'Some people find it difficult to express affection, even when they deeply care about their families.',
            si: 'සමහර අය තම පවුල ගැන ගැඹුරින් සිතුවද සෙනෙහස ප්‍රකාශ කිරීමට අපහසු වෙති.'
          },
          {
            en: 'A lack of affection during childhood may affect a person\'s ability to build close relationships.',
            si: 'ළමා වියේදී ආදරය හා සෙනෙහස නොලැබීම පුද්ගලයෙකුගේ සමීප සබඳතා ගොඩනැගීමේ හැකියාවට බලපෑ හැකිය.'
          },
        ],
        practicePrompt: 'Explain why showing love is important in a family.',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l2-w3',
        term: 'Resemble',
        partOfSpeech: 'verb',
        ipa: '/rɪˈzembəl/',
        definition: 'To look like or be similar to someone or something.',
        sinhalaDefinition: 'සමාන වීම / පෙනුමෙන් සමාන වීම',
        notes: 'This is a verb. Unlike "look like", "resemble" does not take "to" before its object. For example, say "She resembles her mother," not "She resembles to her mother."',
        sinhalaNotes: 'මෙය ක්‍රියා පදයකි. "Resemble" යන වචනයෙන් පසුව "to" යෙදීම අවශ්‍ය නොවේ.',
        collocations: [
          { text: 'Resemble a parent', sinhala: 'දෙමාපියෙකුට සමාන වීම' },
          { text: 'Physically resemble', sinhala: 'ශාරීරික පෙනුමෙන් සමාන වීම' },
          { text: 'Closely resemble', sinhala: 'බෙහෙවින් සමාන වීම' },
          { text: 'Resemble one another', sinhala: 'එකිනෙකාට සමාන වීම' }
        ],
        exampleSentences: [
          {
            en: 'I resemble my father in terms of both appearance and personality.',
            si: 'මම පෙනුමෙන් මෙන්ම පෞරුෂයෙන්ද මගේ පියාට බොහෝ සෙයින් සමාන වෙමි.'
          },
          {
            en: 'Although the two siblings closely resemble one another, they have very different interests.',
            si: 'ඒ කුඩා නගරය මගේ ගමට බෙහෙවින් සමාන වන අතර එහි මට නිවසේ සුවපහසුවක් දැනේ.'
          },
          {
            en: 'Children may resemble their parents physically while developing completely different personalities.',
            si: 'කාලයත් සමඟ ඇගේ වාචික ශෛලිය ඇගේ මවගේ කතා විලාසයට සමාන වීමට පටන් ගත්තේය.'
          },
        ],
        practicePrompt: 'Compare your personality or appearance with a relative.',
        bandLevel: 'Band 7.5+',
        commonMistake: {
          incorrect: 'He resembles to his grandfather.',
          correct: 'He resembles his grandfather.',
          explanation: '"Resemble" is a transitive verb and takes a direct object without the preposition "to".'
        }
      },
      {
        id: 'l2-w4',
        term: 'Household',
        partOfSpeech: 'noun',
        ipa: '/ˈhaʊshəʊld/',
        definition: 'All the people who live together in one home, or the home and its domestic arrangements.',
        sinhalaDefinition: 'එකම නිවසක ජීවත් වන පිරිස / ගෘහය',
        notes: '"Household" is particularly useful for IELTS topics involving family structures, living costs, domestic responsibilities, and economic conditions. It does not necessarily mean that everyone in the household is related.',
        sinhalaNotes: 'පවුලේ ව්‍යුහය, ජීවන වියදම්, ගෙදර වැඩ සහ ආර්ථික තත්ත්වයන් ගැන සාකච්ඡා කිරීමේදී මෙම වචනය භාවිතා කළ හැකිය. එකම නිවසේ ජීවත් වන සියලු දෙනා ඥාතීන් විය යුතු නැත.',
        collocations: [
          { text: 'Household chores', sinhala: 'ගෙදර දෛනික වැඩකටයුතු' },
          { text: 'Household income', sinhala: 'ගෘහස්ථ ආදායම' },
          { text: 'Household responsibilities', sinhala: 'ගෘහස්ථ වගකීම්' },
          { text: 'Single-parent household', sinhala: 'තනි දෙමාපියෙකු සිටින පවුලක්' },
          { text: 'Run a household', sinhala: 'ගෘහයක් පවත්වාගෙන යාම' }
        ],
        exampleSentences: [
          {
            en: 'Sharing household chores teaches children to become more responsible.',
            si: 'අපේ නිවසේ ගෘහ මූල්‍ය කටයුතු සැලසුම් කරන්නේ මගේ දෙමාපියන් විසිනි.'
          },
          {
            en: 'In many families, both parents need to work to maintain a reasonable household income.',
            si: 'බොහෝ නූතන සමාජවල තනි පුද්ගල නිවාස ඒකක සංඛ්‍යාව කැපී පෙනෙන ලෙස වැඩි වී ඇත.'
          },
          {
            en: 'Children growing up in single-parent households may face particular financial or practical challenges, although every family\'s circumstances are distinct.',
            si: 'ගෘහ වියදම් ඉහළ යාම නිසා ජීවන වියදම කළමනාකරණය කර ගැනීම පවුල්වලට අපහසු වී තිබේ.'
          },
        ],
        practicePrompt: 'Describe how chores are shared in your home.',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l2-w5',
        term: 'Bond',
        partOfSpeech: 'noun',
        ipa: '/bɒnd/',
        definition: 'A close connection or relationship between people.',
        sinhalaDefinition: 'බැඳීම / සමීප සම්බන්ධතාවය',
        notes: '"Bond" can be used as both a noun and a verb. As a noun, it refers to a connection; as a verb, it means to develop a closer relationship.',
        sinhalaNotes: 'මෙය නාම පදයක් ලෙස බැඳීමක් අදහස් කරන අතර ක්‍රියා පදයක් ලෙස සමීප සම්බන්ධතාවයක් වර්ධනය කර ගැනීම අදහස් කරයි.',
        collocations: [
          { text: 'A strong family bond', sinhala: 'ශක්තිමත් පවුල් බැඳීමක්' },
          { text: 'Emotional bond', sinhala: 'චිත්තවේගීය බැඳීම' },
          { text: 'Strengthen the bond', sinhala: 'බැඳීම ශක්තිමත් කිරීම' },
          { text: 'Form a close bond', sinhala: 'සමීප බැඳීමක් ඇති කර ගැනීම' },
          { text: 'Bond with someone', sinhala: 'කෙනෙකු සමඟ බැඳීමක් ඇති කර ගැනීම' }
        ],
        exampleSentences: [
          {
            en: 'Spending quality time together helps family members develop a strong emotional bond.',
            si: 'කුඩා කල සිටම මගේ සහෝදරිය සහ මම අතර ඉතා සමීප සහයෝගී බැඳීමක් පැවතුණි.'
          },
          {
            en: 'Parents can strengthen their bond with their children by listening to their concerns.',
            si: 'එකට ආහාර ගැනීම සහ අත්දැකීම් බෙදා ගැනීම පවුලේ සාමාජිකයන් අතර සබඳතාවය ශක්තිමත් කරයි.'
          },
          {
            en: 'Family celebrations provide an opportunity for relatives to reconnect and form closer bonds.',
            si: 'අභියෝගවලට එකට මුහුණ දීමෙන් දෙමාපියන් සහ දරුවන් අතර නොබිඳෙන බැඳීමක් ගොඩනැගේ.'
          },
        ],
        practicePrompt: 'Explain how families can strengthen their relationships.',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l2-w6',
        term: 'Generational gap',
        partOfSpeech: 'phrase',
        ipa: '/ˌdʒen.əˈreɪ.ʃən.əl ɡæp/',
        definition: 'Differences in attitudes, beliefs, values, or behaviour between people of different generations.',
        sinhalaDefinition: 'පරම්පරා අතර පරතරය / අදහස් හා වටිනාකම්වල වෙනස්කම්',
        notes: 'This expression is useful when discussing disagreements between parents and children, technological changes, traditions, and differences in social attitudes.',
        sinhalaNotes: 'දෙමාපියන් සහ දරුවන් අතර මතභේද, තාක්ෂණික වෙනස්කම්, සම්ප්‍රදායන් සහ සමාජ ආකල්පවල වෙනස්කම් ගැන කතා කිරීමේදී මෙය වැදගත් වේ.',
        collocations: [
          { text: 'Bridge the generational gap', sinhala: 'පරම්පරා අතර පරතරය අඩු කිරීම' },
          { text: 'A widening generational gap', sinhala: 'වැඩිවෙමින් පවතින පරම්පරා පරතරය' },
          { text: 'Generational differences', sinhala: 'පරම්පරා අතර වෙනස්කම්' },
          { text: 'Conflict between generations', sinhala: 'පරම්පරා අතර ගැටුම්' }
        ],
        exampleSentences: [
          {
            en: 'Open communication can help bridge the generational gap between parents and teenagers.',
            si: 'තාක්ෂණික වෙනස්කම් හේතුවෙන් දෙමාපියන් සහ දරුවන් අතර පරම්පරා පරතරය තවත් පුළුල් වී ඇත.'
          },
          {
            en: 'The rapid development of technology has contributed to a widening generational gap in some families.',
            si: 'විවෘත හා අවංක සංවාදයක් පැවැත්වීමෙන් පවුල්වල පරම්පරා පරතරය අඩු කර ගත හැකිය.'
          },
          {
            en: 'Generational differences do not necessarily lead to conflict if family members respect one another\'s viewpoints.',
            si: 'වැඩ කරන සේවා ස්ථානවල පරම්පරා පරතරය සමහර අවස්ථාවල සන්නිවේදන ගැටලු ඇති කළ හැකිය.'
          },
        ],
        practicePrompt: 'Describe one difference between young people and older people.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l2-w7',
        term: 'Compassion',
        partOfSpeech: 'noun',
        ipa: '/kəmˈpæʃ.ən/',
        definition: 'A feeling of sympathy for someone who is suffering, combined with a desire to help them.',
        sinhalaDefinition: 'කරුණාව / අනුකම්පාව',
        notes: 'Compassion is stronger than simply feeling sorry for someone because it often involves a willingness to help. It can be used in family, education, healthcare, and social issues.',
        sinhalaNotes: 'කෙනෙකුගේ දුක ගැන කනගාටු වීම පමණක් නොව, ඔහුට හෝ ඇයට උපකාර කිරීමට ඇති කැමැත්තද මෙයින් අදහස් වේ.',
        collocations: [
          { text: 'Show compassion', sinhala: 'කරුණාව පෙන්වීම' },
          { text: 'Treat someone with compassion', sinhala: 'කෙනෙකුට කරුණාවෙන් සැලකීම' },
          { text: 'Compassion towards others', sinhala: 'අන් අය කෙරෙහි කරුණාව' },
          { text: 'A compassionate person', sinhala: 'කරුණාවන්ත පුද්ගලයෙක්' },
          { text: 'Develop compassion', sinhala: 'කරුණාව වර්ධනය කර ගැනීම' }
        ],
        exampleSentences: [
          {
            en: 'Parents can teach children compassion by encouraging them to help others.',
            si: 'අන් අය කෙරෙහි දයාව දැක්වීම සෞඛ්‍ය සම්පන්න සබඳතාවල පදනම වේ.'
          },
          {
            en: 'Elderly relatives should be treated with compassion and respect.',
            si: 'දුෂ්කර කාලවලදී දෙමාපියන් දරුවන්ට කරුණාවෙන් හා ඉවසීමෙන් සැලකිය යුතුය.'
          },
          {
            en: 'Growing up in a supportive environment can help children develop empathy and compassion.',
            si: 'අන් අයගේ දුක් ගැහැට තේරුම් ගෙන උපකාර කිරීම සැබෑ දයාවේ ලක්ෂණයයි.'
          },
        ],
        practicePrompt: 'Explain how parents can teach children to care for others.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l2-w8',
        term: 'Conflict',
        partOfSpeech: 'noun',
        ipa: '/ˈkɒn.flɪkt/',
        definition: 'A serious disagreement or argument between people or groups.',
        sinhalaDefinition: 'ගැටුම / මතභේදය',
        notes: 'Conflict can occur because of differences in opinions, expectations, values, or interests. In IELTS, it is often used when discussing family disagreements and relationships.',
        sinhalaNotes: 'අදහස්, අපේක්ෂා, වටිනාකම් හෝ අවශ්‍යතා වෙනස් වීම නිසා පුද්ගලයන් අතර ගැටුම් ඇති විය හැකිය.',
        collocations: [
          { text: 'Family conflict', sinhala: 'පවුල් ගැටුම' },
          { text: 'Resolve a conflict', sinhala: 'ගැටුමක් විසඳීම' },
          { text: 'Avoid unnecessary conflict', sinhala: 'අනවශ්‍ය ගැටුම් වළක්වා ගැනීම' },
          { text: 'Intergenerational conflict', sinhala: 'පරම්පරා අතර ගැටුම' },
          { text: 'A source of conflict', sinhala: 'ගැටුමකට හේතුවක්' }
        ],
        exampleSentences: [
          {
            en: 'Financial difficulties can become a major source of conflict within a family.',
            si: 'විවෘත සන්නිවේදනය නොමැති විට පවුල තුළ මතභේද සහ ගැටුම් පහසුවෙන්ම ඇති විය හැක.'
          },
          {
            en: 'Parents should encourage their children to resolve conflicts through calm discussion.',
            si: 'පවුල් ආරවුල් සාකච්ඡා මාර්ගයෙන් විසඳා ගැනීමෙන් අනවශ්‍ය අමනාපකම් වළක්වා ගත හැකිය.'
          },
          {
            en: 'Differences in lifestyle choices sometimes lead to intergenerational conflict.',
            si: 'දෙමාපියන් සහ යෞවන දරුවන් අතර නිදහස පිළිබඳව නිරන්තර ගැටුම් ඇතිවීම සාමාන්‍ය දෙයකි.'
          },
        ],
        practicePrompt: 'Describe how family disagreements can be resolved.',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l2-w9',
        term: 'Responsibility',
        partOfSpeech: 'noun',
        ipa: '/rɪˌspɒn.sɪˈbɪl.ə.ti/',
        definition: 'A duty or obligation to deal with something or take care of someone.',
        sinhalaDefinition: 'වගකීම',
        notes: 'This word is useful for discussing parenting, family duties, education, employment, and adulthood. "Responsible" is the adjective form.',
        sinhalaNotes: 'දෙමාපියන්ගේ යුතුකම්, පවුලේ වැඩකටයුතු, අධ්‍යාපනය, රැකියාව සහ වැඩිහිටි ජීවිතය ගැන කතා කිරීමේදී මෙම වචනය භාවිතා කළ හැකිය.',
        collocations: [
          { text: 'Take responsibility for', sinhala: '... පිළිබඳ වගකීම භාර ගැනීම' },
          { text: 'Parental responsibilities', sinhala: 'දෙමාපිය වගකීම්' },
          { text: 'Share responsibilities', sinhala: 'වගකීම් බෙදා ගැනීම' },
          { text: 'A sense of responsibility', sinhala: 'වගකීම් සහගත හැඟීමක්' },
          { text: 'Accept responsibility', sinhala: 'වගකීම පිළිගැනීම' }
        ],
        exampleSentences: [
          {
            en: 'Giving children age-appropriate household tasks helps them develop a sense of responsibility.',
            si: 'පවුලේ වැඩිමහල් දරුවෙකු ලෙස මට බාල සහෝදරයන් ගැන සොයා බැලීමේ විශාල වගකීමක් පැවතුණි.'
          },
          {
            en: 'Parents should share family responsibilities to maintain a healthy work-life balance.',
            si: 'දරුවන්ට නිවසේ සුළු වැඩ පැවරීමෙන් කුඩා කල සිටම වගකීම පිළිබඳ අවබෝධයක් ඇති කළ හැකිය.'
          },
          {
            en: 'Becoming financially independent requires young adults to take responsibility for their decisions.',
            si: 'තම පවුලේ යහපැවැත්ම රැකගැනීම සෑම සාමාජිකයෙකුගේම පොදු වගකීමකි.'
          },
        ],
        practicePrompt: 'Explain how young people can become more responsible.',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l2-w10',
        term: 'Mutual respect',
        partOfSpeech: 'phrase',
        ipa: '/ˈmjuː.tʃu.əl rɪˈspekt/',
        definition: 'Respect that two or more people show towards one another.',
        sinhalaDefinition: 'අන්‍යෝන්‍ය ගෞරවය',
        notes: 'Mutual respect is an important foundation for healthy relationships. It means that everyone values the other\'s feelings, opinions, boundaries, and rights.',
        sinhalaNotes: 'සෞඛ්‍ය සම්පන්න සම්බන්ධතාවයක පදනමක් ලෙස අන්‍යෝන්‍ය ගෞරවය වැදගත් වේ. අනෙක් පුද්ගලයාගේ හැඟීම්, අදහස්, සීමාවන් සහ අයිතිවාසිකම් අගය කිරීම මෙයින් අදහස් වේ.',
        collocations: [
          { text: 'Build mutual respect', sinhala: 'අන්‍යෝන්‍ය ගෞරවය ගොඩනැගීම' },
          { text: 'Based on mutual respect', sinhala: 'අන්‍යෝන්‍ය ගෞරවය මත පදනම් වූ' },
          { text: 'Maintain mutual respect', sinhala: 'අන්‍යෝන්‍ය ගෞරවය පවත්වා ගැනීම' },
          { text: 'Respect each other\'s boundaries', sinhala: 'එකිනෙකාගේ සීමාවන්ට ගරු කිරීම' }
        ],
        exampleSentences: [
          {
            en: 'A healthy family relationship should be based on mutual respect and understanding.',
            si: 'අන්‍යෝන්‍ය ගෞරවය යනු ඕනෑම දිගුකාලීන සාර්ථක සම්බන්ධතාවයක අත්‍යවශ්‍ය පදනමයි.'
          },
          {
            en: 'Parents and teenagers can disagree while still maintaining mutual respect.',
            si: 'විවිධ මත දැරුවද පවුලේ සාමාජිකයන් එකිනෙකාට ගරු කළ යුතුය.'
          },
          {
            en: 'Mutual respect allows family members to express their opinions without fear of being judged.',
            si: 'ගුරුවරුන් සහ සිසුන් අතර අන්‍යෝන්‍ය ගෞරවය පැවතීම සාර්ථක ඉගෙනුම් පරිසරයක් බිහි කරයි.'
          },
        ],
        practicePrompt: 'Explain why respect is important in family relationships.',
        bandLevel: 'Band 7.5+'
      }
    ],
    speakingChallenge: {
      part: 'PART 1 / PART 3 PRACTICE',
      question: 'How important is family in shaping a person\'s character?',
      minimumTargetWords: 3,
      sampleBand9Answer: 'Family plays an indispensable role in shaping character, predominantly through the values instilled during a child\'s upbringing. When parents show consistent affection and share household responsibilities fairly, children naturally develop compassion and a strong sense of responsibility. Furthermore, maintaining mutual respect at home bridges the generational gap, ensuring that potential family conflicts are resolved through constructive dialogue rather than emotional hostility.',
      examinerTips: [
        'Aim for 4–6 sentences structured logically: direct thesis -> supporting explanation -> real-world implication.',
        'Seamlessly incorporate at least 3 target vocabulary items (e.g. upbringing, mutual respect, generational gap).',
        'Avoid repetitive phrasing such as "Family is good because..."'
      ]
    }
  },
  {
    id: 'lesson-3',
    number: 3,
    title: 'Education & Academics',
    subtitle: 'Academic achievement, curriculum, critical thinking, lifelong learning',
    category: 'Education & Learning',
    description: 'Learn sophisticated vocabulary for education topics: school curriculums, university tuition, pedagogical approaches, and lifelong learning.',
    sinhalaDescription: 'පාසල් විෂයමාලා, විශ්වවිද්‍යාල ගාස්තු, ඉගැන්වීම් ක්‍රමවේද සහ ජීවිත කාලය පුරා ඉගෙනීම පිළිබඳ ඉහළ ලකුණු ලබා දෙන වචන මාලාව.',
    bannerImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    words: [
      {
        id: 'l3-w1',
        term: 'Academic achievement',
        partOfSpeech: 'phrase',
        ipa: '/ˌæk.əˈdem.ɪk əˈtʃiːv.mənt/',
        definition: 'The extent to which a student, teacher, or institution has attained their educational goals.',
        sinhalaDefinition: 'අධ්‍යාපනික සාධනය / විශිෂ්ටත්වය',
        notes: 'Far more formal than "good grades" or "exam success". Common in IELTS essays discussing standard testing.',
        sinhalaNotes: '"Good marks" වෙනුවට භාවිතා කළ හැකි ශාස්ත්‍රීය යෙදුමකි. විභාග සහ පාසල් සාර්ථකත්වය විස්තර කරයි.',
        collocations: [
          { text: 'Strive for academic achievement', sinhala: 'අධ්‍යාපනික සාර්ථකත්වය උදෙසා කැපවීම' },
          { text: 'High academic achievement', sinhala: 'ඉහළ අධ්‍යාපනික සාධනය' },
          { text: 'Measure academic achievement', sinhala: 'අධ්‍යාපනික සාධනය මැන බැලීම' }
        ],
        exampleSentences: [
          {
            en: 'Schools should not prioritize academic achievement to the detriment of mental health.',
            si: 'අධ්‍යාපනික ජයග්‍රහණ නූතන අධ්‍යාපනික සම්පත් පරිහරණය කිරීමේ හැකියාව සමඟ නිරන්තරයෙන් බැඳී පවතී.'
          },
          {
            en: 'Socioeconomic factors significantly influence children\'s academic achievement in standardized examinations.',
            si: 'සාම්ප්‍රදායික විභාග ජයග්‍රහණ මෙන්ම නිර්මාණාත්මක චින්තනයටද පාසල් විසින් ඇගයීම් ලබා දිය යුතුය.'
          },
          {
            en: 'Scholarships are typically awarded on the basis of exceptional academic achievement.',
            si: 'ඉහළ අධ්‍යාපනික ලකුණු ලැබීම ව්‍යවසායකත්ව සාර්ථකත්වය පිළිබඳව ඉබේම සහතිකයක් නොවේ.'
          },
        ],
        practicePrompt: 'Discuss whether standardized tests are the fairest measure of academic achievement.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l3-w2',
        term: 'Curriculum',
        partOfSpeech: 'noun',
        ipa: '/kəˈrɪk.jə.ləm/',
        definition: 'The subjects comprising a course of study in a school or college.',
        sinhalaDefinition: 'විෂය මාලාව',
        notes: 'Plural: curricula or curriculums. Used when discussing educational reforms and holistic learning.',
        sinhalaNotes: 'පාසලක හෝ විශ්වවිද්‍යාලයක උගන්වන විෂයයන් සහ අධ්‍යයන සැලැස්ම.',
        collocations: [
          { text: 'National curriculum', sinhala: 'ජාතික විෂය මාලාව' },
          { text: 'Revise the curriculum', sinhala: 'විෂය මාලාව සංශෝධනය කිරීම' },
          { text: 'Extracurricular activities', sinhala: 'විෂය සමගාමී ක්‍රියාකාරකම්' },
          { text: 'Well-rounded curriculum', sinhala: 'සර්වතෝභද්‍ර (සමබර) විෂය මාලාව' }
        ],
        exampleSentences: [
          {
            en: 'Modern educators argue that coding and financial literacy should be integrated into the primary school curriculum.',
            si: 'ජාතික විෂය මාලාවට දේශගුණික දැනුම සහ මූල්‍ය සාක්ෂරතාව ඇතුළත් කළ යුතුය.'
          },
          {
            en: 'A rigid curriculum may stifle students\' innate creativity and genuine curiosity.',
            si: 'පාසල් විෂය මාලාව නවීකරණය කිරීමෙන් සිසුන්ට කාලෝචිත ඩිජිටල් කුසලතා ඉගෙන ගැනීමට අවස්ථාව ලැබේ.'
          },
          {
            en: 'Schools must update their curricula to match the evolving demands of the job market.',
            si: 'විෂය බාහිර ක්‍රියාකාරකම් මඟින් අධ්‍යාපනික විෂය නිර්දේශය ඉතා ඵලදායී ලෙස සම්පූර්ණ කෙරේ.'
          },
        ],
        practicePrompt: 'Should practical life skills be included in the secondary school curriculum?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l3-w3',
        term: 'Critical thinking',
        partOfSpeech: 'phrase',
        ipa: '/ˌkrɪt.ɪ.kəl ˈθɪŋ.kɪŋ/',
        definition: 'The objective analysis and evaluation of an issue in order to form a reasoned judgment.',
        sinhalaDefinition: 'විවේචනාත්මක චින්තනය / ගැඹුරින් විමසා බලා තීරණ ගැනීමේ හැකියාව',
        notes: 'In IELTS Writing Task 2, examiners look for arguments advocating critical thinking over rote memorization.',
        sinhalaNotes: 'කටපාඩම් කිරීමට එහා ගොස්, කරුණු විමසා සාධාරණ නිගමනවලට එළඹීමේ චින්තන හැකියාව.',
        collocations: [
          { text: 'Foster critical thinking', sinhala: 'විවේචනාත්මක චින්තනය පෝෂණය කිරීම' },
          { text: 'Critical thinking skills', sinhala: 'විවේචනාත්මක චින්තන කුසලතා' },
          { text: 'Encourage critical thinking', sinhala: 'විවේචනාත්මක චින්තනය දිරිමත් කිරීම' }
        ],
        exampleSentences: [
          {
            en: 'University education is primarily aimed at fostering independent and critical thinking.',
            si: 'විශ්වවිද්‍යාල විසින් කටපාඩම් කිරීමට වඩා විවේචනාත්මක හා ගැඹුරු චින්තනය ප්‍රවර්ධනය කළ යුතුය.'
          },
          {
            en: 'In an era of rampant misinformation, critical thinking is an indispensable life skill.',
            si: 'විවේචනාත්මක චින්තනය මඟින් මාධ්‍ය මඟින් පැතිරෙන අසත්‍ය තොරතුරු අපක්ෂපාතීව විශ්ලේෂණය කිරීමට පුරවැසියන්ට හැකියාව ලැබේ.'
          },
          {
            en: 'Rote memorisation hinders students from acquiring vital critical thinking capabilities.',
            si: 'විවාද කණ්ඩායම් සිසුන්ගේ විවේචනාත්මක චින්තනය සහ කරුණු ඒත්තු ගැන්වීමේ වාචික කුසලතා දියුණු කරයි.'
          },
        ],
        practicePrompt: 'Explain how universities can foster critical thinking rather than passive learning.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l3-w4',
        term: 'Lifelong learning',
        partOfSpeech: 'phrase',
        ipa: '/ˌlaɪf.lɒŋ ˈlɜː.nɪŋ/',
        definition: 'The ongoing, voluntary, and self-motivated pursuit of knowledge throughout adulthood.',
        sinhalaDefinition: 'ජීවිත කාලය පුරා අඛණ්ඩව ඉගෙනීම',
        notes: 'Essential for essays addressing rapidly changing technology, artificial intelligence, and adult retraining.',
        sinhalaNotes: 'පාසල් අධ්‍යාපනයෙන් නොනැවතී ජීවිත කාලය පුරාම නව දැනුම සහ කුසලතා අත්පත් කර ගැනීම.',
        collocations: [
          { text: 'Commitment to lifelong learning', sinhala: 'ජීවිත කාලය පුරා ඉගෙනීමට ඇති කැපවීම' },
          { text: 'Promote lifelong learning', sinhala: 'අඛණ්ඩ ඉගෙනීම ප්‍රවර්ධනය කිරීම' },
          { text: 'Lifelong learning opportunities', sinhala: 'ජීවිත කාලය පුරා ඉගෙනීමේ අවස්ථා' }
        ],
        exampleSentences: [
          {
            en: 'Due to automation, modern professionals must embrace lifelong learning to remain employable.',
            si: 'වේගයෙන් වෙනස් වන රැකියා වෙළඳපොළ තුළ ජීවිත කාලය පුරාම අඛණ්ඩව ඉගෙනීම අත්‍යවශ්‍ය අවශ්‍යතාවක් බවට පත්ව ඇත.'
          },
          {
            en: 'Governments should subsidise adult training programmes to cultivate a culture of lifelong learning.',
            si: 'වැඩිහිටි සේවකයින් අතර අඛණ්ඩ ඉගෙනීම දිරිමත් කිරීම සඳහා රජය සහනාධාර හඳුන්වා දුන්නේය.'
          },
          {
            en: 'Retirees increasingly engage in lifelong learning to maintain cognitive vitality.',
            si: 'අඛණ්ඩ ඉගෙනීම මොළය ක්‍රියාශීලීව තබා ගන්නා අතර ඥානන පිරිහීමේ අවදානම අවම කරයි.'
          },
        ],
        practicePrompt: 'Why is lifelong learning crucial in today\'s technology-driven workplace?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l3-w5',
        term: 'Pedagogy',
        partOfSpeech: 'noun',
        ipa: '/ˈped.ə.ɡɒdʒ.i/',
        definition: 'The method and practice of teaching, especially as an academic subject or theoretical concept.',
        sinhalaDefinition: 'ඉගැන්වීම් ක්‍රමවේදය / ශික්ෂණ විද්‍යාව',
        notes: 'Adjective form: pedagogical (e.g., "pedagogical methods"). Impressive academic vocabulary for education essays.',
        sinhalaNotes: 'ගුරුවරුන් විසින් දැනුම ලබා දීමට යොදා ගන්නා විද්‍යාත්මක හා ප්‍රායෝගික ඉගැන්වීම් කලාව.',
        collocations: [
          { text: 'Innovative pedagogy', sinhala: 'නව්‍ය ඉගැන්වීම් ක්‍රමවේදය' },
          { text: 'Pedagogical approach', sinhala: 'ඉගැන්වීමේ ප්‍රවේශය' },
          { text: 'Student-centred pedagogy', sinhala: 'ශිෂ්‍ය කේන්ද්‍රීය ඉගැන්වීම් ක්‍රමය' }
        ],
        exampleSentences: [
          {
            en: 'The integration of interactive tablets requires teachers to adapt their pedagogical approach.',
            si: 'ශිෂ්‍ය කේන්ද්‍රීය ඉගැන්වීම් ක්‍රමවේදය අක්‍රිය පන්ති කාමර සජීවී ඉගෙනුම් මධ්‍යස්ථාන බවට පරිවර්තනය කර ඇත.'
          },
          {
            en: 'Traditional pedagogical techniques often fail to engage digitally native pupils.',
            si: 'ඵලදායී ඉගැන්වීම් ශිල්ප ක්‍රම සිසුන්ගේ විවිධ මානසික කුසලතාවලට ගැලපෙන පරිදි ඉගැන්වීම් උපාය මාර්ග සකස් කර ගනී.'
          },
          {
            en: 'Finland\'s progressive pedagogy emphasizes holistic play-based learning over standardized examination.',
            si: 'නව්‍ය ඉගැන්වීම් ක්‍රම මඟින් විද්‍යා හා ගණිත විෂයන් සඳහා සිසුන්ගේ උනන්දුව වැඩි කිරීමට ක්‍රීඩා ආකෘති එක් කරයි.'
          },
        ],
        practicePrompt: 'Compare traditional teacher-centered pedagogy with modern interactive approaches.',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l3-w6',
        term: 'Tuition fees',
        partOfSpeech: 'noun',
        ipa: '/tjuːˈɪʃ.ən fiːz/',
        definition: 'The money paid for instruction or teaching, particularly at a college or university.',
        sinhalaDefinition: 'අධ්‍යාපන ගාස්තු / විශ්වවිද්‍යාල පාඨමාලා ගාස්තු',
        notes: 'Essential for IELTS Writing Task 2 questions discussing whether higher education should be free or privatised.',
        sinhalaNotes: 'විශ්වවිද්‍යාල හෝ උසස් අධ්‍යාපන ආයතන සඳහා ගෙවනු ලබන අධ්‍යයන ගාස්තු.',
        collocations: [
          { text: 'Exorbitant tuition fees', sinhala: 'අධික අධ්‍යාපන ගාස්තු' },
          { text: 'Abolish tuition fees', sinhala: 'අධ්‍යාපන ගාස්තු අහෝසි කිරීම' },
          { text: 'Subsidise tuition fees', sinhala: 'අධ්‍යාපන ගාස්තු සඳහා සහනාධාර දීම' },
          { text: 'Skyrocketing tuition fees', sinhala: 'ශීඝ්‍රයෙන් ඉහළ යන ගාස්තු' }
        ],
        exampleSentences: [
          {
            en: 'Soaring tuition fees deter talented students from low-income backgrounds from attending university.',
            si: 'අධික පාඨමාලා ගාස්තු හේතුවෙන් බොහෝ දක්ෂ සිසුන්ට උසස් අධ්‍යාපනය ලැබීමට ඇති අවස්ථාව අහිමි වේ.'
          },
          {
            en: 'Some argue that tertiary tuition fees should be completely funded by state taxation.',
            si: 'උසස් අධ්‍යාපන ගාස්තු බදු ගෙවන්නන්ගේ මුදලින් දැරිය යුතුද යන්න පිළිබඳව තවමත් විවාද පවතී.'
          },
          {
            en: 'Graduates often spend their twenties repaying loans incurred from steep university tuition fees.',
            si: 'ශිෂ්‍යත්ව මඟින් අඩු ආදායම්ලාභී පවුල්වල විශ්වවිද්‍යාල අධ්‍යයන ගාස්තු බර සැලකිය යුතු ලෙස ලිහිල් කෙරේ.'
          },
        ],
        practicePrompt: 'Should university education be completely tuition-free for all citizens? Give your opinion.',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l3-w7',
        term: 'Literacy',
        partOfSpeech: 'noun',
        ipa: '/ˈlɪt.ər.ə.si/',
        definition: 'The ability to read and write; also competence in a specific area (e.g. digital literacy, financial literacy).',
        sinhalaDefinition: 'සාක්ෂරතාව / කියවීම හා ලිවීමේ හැකියාව',
        notes: 'Collocates broadly: basic literacy, computer literacy, financial literacy, media literacy.',
        sinhalaNotes: 'අකුරු කියවීම හා ලිවීමට අමතරව නිශ්චිත විෂය ක්ෂේත්‍රයක් පිළිබඳ ප්‍රවීණතාවය සඳහාද යොදයි.',
        collocations: [
          { text: 'Universal literacy', sinhala: 'සර්වජන සාක්ෂරතාව' },
          { text: 'Financial literacy', sinhala: 'මූල්‍ය සාක්ෂරතාව' },
          { text: 'Digital literacy rate', sinhala: 'ඩිජිටල් සාක්ෂරතා අනුපාතය' },
          { text: 'Eradicate illiteracy', sinhala: 'නූගත්කම තුරන් කිරීම' }
        ],
        exampleSentences: [
          {
            en: 'Basic literacy is recognized worldwide as a fundamental human right.',
            si: 'වැඩිහිටි සාක්ෂරතා වැඩසටහන් මඟින් ආන්තික ප්‍රජාවන්ට හොඳ රැකියාවක් ලබා ගැනීමට ශක්තියක් ලැබේ.'
          },
          {
            en: 'Improving digital literacy among the elderly allows them to access essential public services.',
            si: 'ඩිජිටල් සාක්ෂරතාවය දැන් සාමාන්‍ය කියවීම සහ ලිවීම තරම්ම මූලික කුසලතාවක් ලෙස සැලකේ.'
          },
          {
            en: 'A nation\'s economic trajectory is inextricably bound to the literacy rate of its adult population.',
            si: 'මව්වරුන්ගේ සාක්ෂරතාවය වෙනුවෙන් ආයෝජනය කිරීමෙන් මුළු ගමටම සෞඛ්‍යමය හා ආර්ථිකමය ප්‍රතිලාභ හිමි වේ.'
          },
        ],
        practicePrompt: 'Why is financial literacy just as crucial as traditional academic literacy?',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l3-w8',
        term: 'Vocational training',
        partOfSpeech: 'phrase',
        ipa: '/vəʊˈkeɪ.ʃən.əl ˈtreɪ.nɪŋ/',
        definition: 'Education and training that prepares people for a skilled trade or craft (e.g. plumbing, carpentry, mechanics).',
        sinhalaDefinition: 'වෘත්තීය පුහුණුව / කාර්මික අධ්‍යාපනය',
        notes: 'In Task 2, vocational training is constantly contrasted with university degrees.',
        sinhalaNotes: 'න්‍යායාත්මක උපාධි වෙනුවට ප්‍රායෝගික රැකියා හා තාක්ෂණික කුසලතා සඳහා ලබා දෙන පුහුණුව.',
        collocations: [
          { text: 'Provide vocational training', sinhala: 'වෘත්තීය පුහුණුව ලබා දීම' },
          { text: 'Vocational institutions', sinhala: 'කාර්මික/වෘත්තීය ආයතන' },
          { text: 'Pursue vocational training', sinhala: 'වෘත්තීය පුහුණුවක් හැදෑරීම' }
        ],
        exampleSentences: [
          {
            en: 'Governments should invest in vocational training to address severe shortages of skilled plumbers and electricians.',
            si: 'වෘත්තීය පුහුණුව මඟින් පාසල් හැර යන තරුණ පිරිසට ප්‍රායෝගික හා රැකියා වෙළඳපොළට ගැළපෙන තාක්ෂණික කුසලතා ලබා දෙයි.'
          },
          {
            en: 'Not all secondary school leavers need a university degree; vocational training often offers quicker employment.',
            si: 'ජර්මනියේ ද්විත්ව අධ්‍යාපන ක්‍රමය පන්ති කාමර න්‍යාය සහ ප්‍රායෝගික වෘත්තීය පුහුණුව මනාව ඒකාබද්ධ කරයි.'
          },
          {
            en: 'Pairing academic theory with vocational training creates well-prepared apprentices.',
            si: 'සාම්ප්‍රදායික උපාධි හා සසඳන විට වෘත්තීය පුහුණුව පහත් කොට සැලකීමේ ආකල්පය රජයන් විසින් තුරන් කළ යුතුය.'
          },
        ],
        practicePrompt: 'Compare the advantages of vocational training versus an academic university degree.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l3-w9',
        term: 'Intellectual curiosity',
        partOfSpeech: 'phrase',
        ipa: '/ˌɪn.təlˈek.tʃu.əl ˌkjʊə.riˈɒs.ə.ti/',
        definition: 'A desire to deeply understand how the world works, seek knowledge, and ask questions.',
        sinhalaDefinition: 'බුද්ධිමය කුතුහලය / අලුත් දේ දැන ගැනීමේ නොතිත් ආශාව',
        notes: 'Very high register phrase to describe genuine passion for learning rather than grade-seeking.',
        sinhalaNotes: 'විභාග සමත්වීමට පමණක් නොව, දැනුම සොයා යාමට ඇති දැඩි උනන්දුව.',
        collocations: [
          { text: 'Stimulate intellectual curiosity', sinhala: 'බුද්ධිමය කුතුහලය උද්දීපනය කිරීම' },
          { text: 'Possess intellectual curiosity', sinhala: 'දැනුම සෙවීමේ කුතුහලයක් තිබීම' },
          { text: 'Quench intellectual curiosity', sinhala: 'දැනුම පිපාසය සංසිඳුවා ගැනීම' }
        ],
        exampleSentences: [
          {
            en: 'Inspirational educators stimulate intellectual curiosity rather than enforcing mindless memorization.',
            si: 'දැනුම සෙවීමේ කුතුහලය මුල් කරගත් පර්යේෂණ පෙරළිකාර විද්‍යාත්මක සොයාගැනීම්වලට මඟ පාදයි.'
          },
          {
            en: 'A candidate with intellectual curiosity will adapt rapidly to technological changes.',
            si: 'විශිෂ්ට ගුරුවරුන් විභාග සඳහා සිසුන් සූදානම් කිරීමට පමණක් සීමා නොවී ඔවුන්ගේ දැනුම සෙවීමේ පිපාසය පෝෂණය කරති.'
          },
          {
            en: 'Childhood exploration lays the groundwork for lifelong intellectual curiosity.',
            si: 'දැනුම සෙවීමේ කුතුහලය පුද්ගලයන්ට සාම්ප්‍රදායික නොවන නව්‍ය ගැටලු විසඳීමේ ක්‍රම ගවේෂණය කිරීමට පෙළඹවීමක් ලබා දෙයි.'
          },
        ],
        practicePrompt: 'How can primary teachers stimulate intellectual curiosity in early childhood?',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l3-w10',
        term: 'Cognitive development',
        partOfSpeech: 'phrase',
        ipa: '/ˈkɒɡ.nə.tɪv dɪˈvel.əp.mənt/',
        definition: 'How a person perceives, thinks, and gains understanding of their world through the relations of interaction and genetic factors.',
        sinhalaDefinition: 'ප්‍රජානන (මනෝමය) වර්ධනය / චින්තන ශක්තියේ විකාශනය',
        notes: 'Scientific and academic vocabulary for childhood education, psychology, and early development essays.',
        sinhalaNotes: 'මනසේ චින්තන ශක්තිය, ගැටලු විසඳීම සහ තේරුම් ගැනීමේ හැකියාව වර්ධනය වීම.',
        collocations: [
          { text: 'Promote cognitive development', sinhala: 'චින්තන වර්ධනය ප්‍රවර්ධනය කිරීම' },
          { text: 'Early cognitive development', sinhala: 'මුල් ළමාවියේ ප්‍රජානන වර්ධනය' },
          { text: 'Impair cognitive development', sinhala: 'චින්තන වර්ධනයට බාධා පැමිණවීම' }
        ],
        exampleSentences: [
          {
            en: 'Excessive screen time in early years may impair young children\'s cognitive development.',
            si: 'මුල් ළමාවියේ පරිසර උත්තේජනය දරුවාගේ ඥානන හා මානසික සංවර්ධනයට තීරණාත්මක කාර්යභාරයක් ඉටු කරයි.'
          },
          {
            en: 'Musical education has been proved to enhance spatial reasoning and cognitive development.',
            si: 'කුඩා කල ඇතිවන මන්දපෝෂණය දරුවාගේ දිගුකාලීන බුද්ධි වර්ධනයට ආපසු හැරවිය නොහැකි හානියක් සිදු කරයි.'
          },
          {
            en: 'Nutritional deficiencies during infancy pose severe hazards to long-term cognitive development.',
            si: 'අන්තර්ක්‍රියාකාරී අධ්‍යාපනික ක්‍රීඩා මතකය උත්තේජනය කරන අතර කුඩා දරුවන්ගේ බුද්ධි වර්ධනය වේගවත් කරයි.'
          },
        ],
        practicePrompt: 'Discuss how physical sports contribute to a child\'s cognitive development.',
        bandLevel: 'Band 8.0+'
      }
    ],
    speakingChallenge: {
      part: 'PART 3 PRACTICE',
      question: 'Do you believe schools should focus primarily on academic achievement or practical skills?',
      minimumTargetWords: 3,
      sampleBand9Answer: 'In my view, an effective educational institution should strike a harmonious balance between academic achievement and vocational training. While mastering a rigorous curriculum cultivates critical thinking and intellectual curiosity, students also require practical skills to navigate adulthood. Neglecting either domain creates a skewed educational framework; therefore, schools must update their pedagogy to encourage both theoretical inquiry and real-world competency.',
      examinerTips: [
        'Take a nuanced perspective: rather than choosing 100% one side, show balanced analytical evaluation.',
        'Contrast theoretical words (academic achievement, intellectual curiosity) with vocational terms.',
        'Use transition adverbs like "therefore", "furthermore", "in contrast".'
      ]
    }
  },
  {
    id: 'lesson-4',
    number: 4,
    title: 'Work & Careers',
    subtitle: 'Career prospects, job satisfaction, qualifications, professional development and work-life balance',
    category: 'Employment & Economy',
    description: 'Master lexical resources for modern employment, workplace automation, career progression, remuneration, and occupational health.',
    sinhalaDescription: 'වෘත්තීය අවස්ථා, රැකියා තෘප්තිය, සුදුසුකම්, රැකියා සහ පෞද්ගලික ජීවිතයේ සමබරතාවය පිළිබඳ ඉහළ ලකුණු ලබා දෙන වචන මාලාව.',
    bannerImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
    words: [
      {
        id: 'l4-w1',
        term: 'Career prospects',
        partOfSpeech: 'phrase',
        ipa: '/kəˈrɪər ˈprɒs.pekts/',
        definition: 'The probability or likelihood of future success and advancement in one\'s occupation.',
        sinhalaDefinition: 'වෘත්තීය දියුණුව සඳහා ඇති අනාගත අවස්ථා / ඉදිරි මංපෙත්',
        notes: 'High-value collocation for discussing university degrees, choice of profession, or migration.',
        sinhalaNotes: 'රැකියාවක ඉහළට යාමට හෝ අනාගතයේ ලබාගත හැකි සාර්ථකත්වයේ විභවය.',
        collocations: [
          { text: 'Bright career prospects', sinhala: 'දීප්තිමත් වෘත්තීය අනාගතය' },
          { text: 'Enhance career prospects', sinhala: 'වෘත්තීය අවස්ථා පුළුල් කර ගැනීම' },
          { text: 'Bleak career prospects', sinhala: 'අවිනිශ්චිත/බලාපොරොත්තු රහිත වෘත්තීය අනාගතය' }
        ],
        exampleSentences: [
          {
            en: 'Many students pursue postgraduate degrees specifically to enhance their career prospects.',
            si: 'පිළිගත් සහතිකපත්‍ර පාඨමාලාවක් අවසන් කිරීමෙන් විදේශ රටවල ඔබේ වෘත්තීය අවස්ථා විශාල ලෙස ඉහළ යයි.'
          },
          {
            en: 'Industries driven by green technology offer exceptionally bright career prospects for young engineers.',
            si: 'තාක්ෂණික විශ්වවිද්‍යාල උපාධිධාරීන්ට තොරතුරු තාක්ෂණ ක්ෂේත්‍රයේ විශිෂ්ට වෘත්තීය අවස්ථා හිමිවේ.'
          },
          {
            en: 'Graduates who speak multiple languages often enjoy superior global career prospects.',
            si: 'ආර්ථික අවපාතයන් නිසා අලුතින් උපාධිය ලැබූවන්ගේ වෘත්තීය අවස්ථා තාවකාලිකව මන්දගාමී විය හැකිය.'
          },
        ],
        practicePrompt: 'What steps can university graduates take to boost their career prospects?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l4-w2',
        term: 'Job satisfaction',
        partOfSpeech: 'phrase',
        ipa: '/dʒɒb ˌsæt.ɪsˈfæk.ʃən/',
        definition: 'The feeling of contentment or fulfillment that a person derives from their work.',
        sinhalaDefinition: 'රැකියා තෘප්තිය',
        notes: 'Central theme in IELTS Writing Task 2 when comparing high salary versus meaningful work.',
        sinhalaNotes: 'තමන් කරන රැකියාවෙන් සහ එහි පරිසරයෙන් ලබන මානසික සතුට හා තෘප්තිය.',
        collocations: [
          { text: 'Derive job satisfaction from', sinhala: 'රැකියාවෙන් තෘප්තියක් ලැබීම' },
          { text: 'High level of job satisfaction', sinhala: 'ඉහළ රැකියා තෘප්තිය' },
          { text: 'Contribute to job satisfaction', sinhala: 'රැකියා තෘප්තියට දායක වීම' }
        ],
        exampleSentences: [
          {
            en: 'Research consistently reveals that supportive colleagues contribute more to job satisfaction than remuneration alone.',
            si: 'අර්ථවත් රාජකාරි සහ සාධනීය නායකත්වය රැකියා තෘප්තිය ඉහළ නැංවීමේ ප්‍රධාන සාධක වේ.'
          },
          {
            en: 'Workers who find meaning in their daily tasks report significantly higher job satisfaction.',
            si: 'දිගුකාලීන රැකියා තෘප්තියක් සහතික කිරීමට ඉහළ වැටුපක් පමණක් ප්‍රමාණවත් නොවේ.'
          },
          {
            en: 'Monotonous routines and micromanagement invariably erode employee job satisfaction.',
            si: 'සේවා ස්ථානයේ ස්වාධීනත්වය ඉහළ රැකියා තෘප්තියක් සමඟ ඍජුවම සම්බන්ධ වන බව සමීක්ෂණ පෙන්වා දෙයි.'
          },
        ],
        practicePrompt: 'Which is more critical for long-term well-being: high salary or job satisfaction?',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l4-w3',
        term: 'Work-life balance',
        partOfSpeech: 'phrase',
        ipa: '/ˌwɜːk.laɪf ˈbæl.əns/',
        definition: 'The division of one\'s time and focus between working and family/leisure activities.',
        sinhalaDefinition: 'රැකියාව සහ පෞද්ගලික ජීවිතය අතර සමබරතාවය',
        notes: 'Always hyphenated as a compound noun. Frequently paired with verbs: maintain, achieve, disrupt.',
        sinhalaNotes: 'කාර්යබහුල රැකියාව සහ පවුලේ සතුට හෝ විවේකය අතර ඇති කරගත යුතු මනා සමබරතාව.',
        collocations: [
          { text: 'Maintain a healthy work-life balance', sinhala: 'නිරෝගී රැකියා-ජීවිත සමබරතාවයක් පවත්වා ගැනීම' },
          { text: 'Achieve work-life balance', sinhala: 'රැකියාව හා ජීවිතය සමබර කර ගැනීම' },
          { text: 'Compromise work-life balance', sinhala: 'ජීවිත සමබරතාවය පලුදු කර ගැනීම' }
        ],
        exampleSentences: [
          {
            en: 'Telecommuting has enabled countless employees to maintain a healthier work-life balance.',
            si: 'දුරස්ථව සේවය කිරීමේ ක්‍රම මඟින් පුද්ගලයාගේ රැකියාව සහ ජීවිතය අතර සමබරතාවය වැඩිදියුණු වීම හෝ අවදානමට ලක්වීම සිදුවිය හැකිය.'
          },
          {
            en: 'In competitive financial sectors, long overtime hours frequently destroy any semblance of work-life balance.',
            si: 'නිරෝගී රැකියා-ජීවිත සමබරතාවයක් පවත්වා ගැනීම දිගුකාලීන මානසික ආතතිය වළක්වා මානසික සුවය රැක ගැනීමට උපකාරී වේ.'
          },
          {
            en: 'Forward-thinking corporations introduce four-day work weeks to support work-life balance.',
            si: 'ප්‍රගතිශීලී සමාගම් සේවකයින්ගේ රැකියා-ජීවිත සමබරතාවය වැඩිදියුණු කිරීමට දින හතරක වැඩ සති හඳුන්වා දෙයි.'
          },
        ],
        practicePrompt: 'Describe the consequences when an individual fails to maintain a work-life balance.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l4-w4',
        term: 'Burnout',
        partOfSpeech: 'noun',
        ipa: '/ˈbɜːn.aʊt/',
        definition: 'Physical or mental collapse caused by overwork, unremitting stress, or chronic exhaustion.',
        sinhalaDefinition: 'අධික වෙහෙස නිසා ඇතිවන කායික හා මානසික බිඳවැටීම (වෙහෙසට පත්වීම)',
        notes: 'Collocates with: suffer from, prevent, lead to. Relevant for health, occupational stress, and labor essays.',
        sinhalaNotes: 'නොනවත්වා වැඩ කිරීම නිසා මානසික හා කායික වශයෙන් සම්පූර්ණයෙන්ම අකර්මණ්‍ය වීම.',
        collocations: [
          { text: 'Suffer from burnout', sinhala: 'අධික වෙහෙසෙන් පීඩා විඳීම' },
          { text: 'Prevent workplace burnout', sinhala: 'සේවා ස්ථානීය විඩාව වැළැක්වීම' },
          { text: 'Signs of chronic burnout', sinhala: 'දීර්ඝකාලීන ක්ෂය වීමේ ලක්ෂණ' }
        ],
        exampleSentences: [
          {
            en: 'Healthcare professionals working on the frontlines during pandemics faced an unprecedented risk of burnout.',
            si: 'අධික ලෙස වැඩ කිරීම සහ ප්‍රමාණවත් විවේකයක් නොමැතිකම අනිවාර්යයෙන්ම දැඩි මානසික හා ශාරීරික විඩාවට (burnout) මඟ පාදයි.'
          },
          {
            en: 'Ignoring the initial symptoms of burnout can result in long-term depressive disorders.',
            si: 'සේවක විඩාවේ මුල් ලක්ෂණ හඳුනා ගැනීම සඳහා ආයතන විසින් සුවතා වැඩසටහන් ස්ථාපිත කළ යුතුය.'
          },
          {
            en: 'Organizations must establish realistic deadlines to safeguard employees against severe burnout.',
            si: 'දිගුකාලීන නිවාඩුවක් ලබා ගැනීම විධායක නිලධාරීන්ට දැඩි වෘත්තීය විඩාවෙන් සුවය ලැබීමට උපකාරී වේ.'
          },
        ],
        practicePrompt: 'What measures should managers implement to prevent employee burnout?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l4-w5',
        term: 'Lucrative',
        partOfSpeech: 'adjective',
        ipa: '/ˈluː.krə.tɪv/',
        definition: 'Producing a great deal of profit; highly moneymaking.',
        sinhalaDefinition: 'ඉතා ලාභදායී / අධික ආදායමක් උපයා දෙන',
        notes: 'Sophisticated synonym for "well-paying", "profitable", or "high-earning".',
        sinhalaNotes: '"Profitable" හෝ "high-paying" වෙනුවට භාවිතා කළ හැකි උසස් ශාස්ත්‍රීය වචනයකි.',
        collocations: [
          { text: 'Lucrative career', sinhala: 'අධික ආදායම් ලබන වෘත්තිය' },
          { text: 'Lucrative market', sinhala: 'ලාභදායී වෙළඳපොළ' },
          { text: 'Lucrative contract', sinhala: 'ඉමහත් ලාභදායී ගිවිසුම' }
        ],
        exampleSentences: [
          {
            en: 'He abandoned a lucrative career in corporate law to work for a non-profit conservation group.',
            si: 'මෘදුකාංග ඉංජිනේරු විද්‍යාව 21 වන සියවසේ වඩාත්ම ලාභදායී හා ආදායම් උපදවන වෘත්තීන්ගෙන් එකක්ව පවතී.'
          },
          {
            en: 'Artificial intelligence development has emerged as one of the most lucrative industries of the 21st century.',
            si: 'ලාභදායී නීතිඥ වෘත්තිය අත්හැර ඔහු ලාභ නොලබන මානව හිමිකම් සංවිධානයකට සේවය කිරීමට එක් විය.'
          },
          {
            en: 'While nursing is socially rewarding, it is regrettably far less lucrative than banking.',
            si: 'වාණිජ දේපළ වෙළඳාම ඉවසිලිවන්ත ආයෝජකයින්ට අතිශය ලාභදායී ප්‍රතිලාභ ලබා දෙයි.'
          },
        ],
        practicePrompt: 'Would you choose a less lucrative career if it provided greater creative freedom?',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l4-w6',
        term: 'Telecommuting',
        partOfSpeech: 'noun',
        ipa: '/ˌtel.ɪ.kəˈmjuː.tɪŋ/',
        definition: 'The practice of working from home using the internet, email, and telephone rather than traveling to an office.',
        sinhalaDefinition: 'නිවසේ සිට දුරස්ථව සේවය කිරීම / දුරස්ථ රැකියා ක්‍රමය',
        notes: 'Also known as "remote work". Essential IELTS topic in post-pandemic work patterns.',
        sinhalaNotes: 'කාර්යාලයට නොගොස් අන්තර්ජාලය සහ සන්නිවේදන මාධ්‍ය හරහා නිවසේ සිට රාජකාරි කිරීම.',
        collocations: [
          { text: 'Embrace telecommuting', sinhala: 'දුරස්ථ රැකියා ක්‍රමය වැළඳ ගැනීම' },
          { text: 'Rise of telecommuting', sinhala: 'දුරස්ථ රැකියාවල සීඝ්‍ර වර්ධනය' },
          { text: 'Telecommuting policies', sinhala: 'දුරස්ථ සේවා ප්‍රතිපත්ති' }
        ],
        exampleSentences: [
          {
            en: 'Telecommuting substantially curtails daily traffic congestion and greenhouse emissions in metropolitan areas.',
            si: 'නිවසේ සිට දුරස්ථව වැඩ කිරීම මඟින් දිගු ගමන් කාලය ඉතිරි වන අතර නාගරික රථවාහන තදබදය අවම වේ.'
          },
          {
            en: 'One drawback of widespread telecommuting is the sense of isolation experienced by younger staff.',
            si: 'ඵලදායී දුරස්ථ සේවා සැපයීමක් සඳහා විශ්වාසදායක අධිවේගී අන්තර්ජාල සම්බන්ධතාවක් නැතුවම බැරිය.'
          },
          {
            en: 'Hybrid models blend telecommuting with occasional in-person collaborative sessions.',
            si: 'ගෝලීය වසංගතයෙන් පසු බොහෝ බහුජාතික සමාගම් ස්ථිර ප්‍රතිපත්තියක් ලෙස නිවසේ සිට වැඩ කිරීමේ ක්‍රමය අනුගමනය කළහ.'
          },
        ],
        practicePrompt: 'Evaluate the advantages and disadvantages of telecommuting for modern workers.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l4-w7',
        term: 'Professional development',
        partOfSpeech: 'phrase',
        ipa: '/prəˌfeʃ.ən.əl dɪˈvel.əp.mənt/',
        definition: 'Learning to earn or maintain professional credentials such as academic degrees, formal coursework, and conferences.',
        sinhalaDefinition: 'වෘත්තීය සංවර්ධනය / කුසලතා අඛණ්ඩව ප්‍රවර්ධනය කිරීම',
        notes: 'Crucial in Task 2 essays discussing employer responsibilities towards staff training.',
        sinhalaNotes: 'සේවකයෙකුගේ රැකියා කුසලතා, දැනුම සහ සුදුසුකම් ඉහළ නංවා ගැනීමට කෙරෙන පුහුණුව.',
        collocations: [
          { text: 'Ongoing professional development', sinhala: 'අඛණ්ඩ වෘත්තීය සංවර්ධනය' },
          { text: 'Invest in professional development', sinhala: 'වෘත්තීය සංවර්ධනය වෙනුවෙන් ආයෝජනය කිරීම' },
          { text: 'Professional development workshops', sinhala: 'වෘත්තීය සංවර්ධන වැඩමුළු' }
        ],
        exampleSentences: [
          {
            en: 'Companies that finance continuous professional development experience markedly lower staff turnover.',
            si: 'සේවකයන්ගේ වෘත්තීය කුසලතා සංවර්ධනය වෙනුවෙන් ආයෝජනය කරන සමාගම්වල සේවකයන් රැඳී සිටීමේ ප්‍රතිශතය ඉහළය.'
          },
          {
            en: 'Teachers are required to attend regular professional development seminars to master updated technologies.',
            si: 'අඛණ්ඩ වෘත්තීය සංවර්ධනය සඳහා ක්ෂේත්‍රයේ සම්මන්ත්‍රණ සහ වැඩමුළුවලට සහභාගී වීම අත්‍යවශ්‍ය වේ.'
          },
          {
            en: 'Investing in professional development sharpens an employee\'s competitive edge.',
            si: 'මඟපෙන්වීමේ වැඩසටහන් මඟින් වෘත්තීය ජීවිතය ආරම්භ කරන අයට විධිමත් මඟපෙන්වීමක් සලසයි.'
          },
        ],
        practicePrompt: 'Why should employers allocate a percentage of their budget to professional development?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l4-w8',
        term: 'Job security',
        partOfSpeech: 'phrase',
        ipa: '/ˈdʒɒb sɪˌkjʊə.rɪ.ti/',
        definition: 'The probability that an individual will keep their job, with minimal danger of becoming unemployed.',
        sinhalaDefinition: 'රැකියා සුරක්ෂිතභාවය',
        notes: 'Crucial when comparing public sector jobs with volatile gig economy or startup roles.',
        sinhalaNotes: 'රැකියාවෙන් ඉවත් කරනු ලැබීමේ හෝ රැකියාව අහිමිවීමේ අවදානමක් නොමැති බව.',
        collocations: [
          { text: 'Seek job security', sinhala: 'රැකියා සුරක්ෂිතතාව අපේක්ෂා කිරීම' },
          { text: 'Threaten job security', sinhala: 'රැකියා සුරක්ෂිතතාවයට තර්ජනයක් වීම' },
          { text: 'Relinquish job security', sinhala: 'රැකියා සුරක්ෂිතතාව අත්හැර දැමීම' }
        ],
        exampleSentences: [
          {
            en: 'Civil service positions have traditionally attracted applicants who prize job security over speculative high income.',
            si: 'ඉතිහාසය පුරාම රාජ්‍ය අංශයේ රැකියා අසමසම රැකියා සුරක්ෂිතතාවක් ලබා දීම වෙනුවෙන් ඇගයීමට ලක් විය.'
          },
          {
            en: 'The emergence of AI and automation poses a tangible threat to the job security of clerical workers.',
            si: 'ස්වයංක්‍රීයකරණය සහ කෘතිම බුද්ධිය අනාගත රැකියා සුරක්ෂිතතාවයට පෙර නොවූ විරූ අභියෝග එල්ල කරයි.'
          },
          {
            en: 'Freelancers often enjoy creative autonomy at the expense of predictable job security.',
            si: 'තාවකාලික කොන්ත්‍රාත් සේවකයින්ට බොහෝ විට අඩු වැටුප් හා රැකියා සුරක්ෂිතතාවක් නොමැතිකමේ ගැටලුවලට මුහුණ දීමට සිදුවේ.'
          },
        ],
        practicePrompt: 'In the modern economy, is job security becoming a relic of the past?',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l4-w9',
        term: 'Meritocracy',
        partOfSpeech: 'noun',
        ipa: '/ˌmer.ɪˈtɒk.rə.si/',
        definition: 'A system, organization, or society in which people are chosen and advanced because of their abilities, rather than wealth or connections.',
        sinhalaDefinition: 'දක්ෂතාවයට මුල් තැන දෙන ක්‍රමය / කුසලතා පදනම් සමාජ ක්‍රමය',
        notes: 'Adjective: meritocratic (e.g. "a meritocratic system"). High register IELTS vocabulary.',
        sinhalaNotes: 'ඥාති සංග්‍රහය හෝ ධනය වෙනුවට පුද්ගලයාගේ දක්ෂතාව සහ කුසලතාව මත උසස්වීම් ලබා දෙන ක්‍රමය.',
        collocations: [
          { text: 'True meritocracy', sinhala: 'සැබෑ කුසලතා පදනම් සමාජයක්' },
          { text: 'Meritocratic principles', sinhala: 'කුසලතා පදනම් ප්‍රතිපත්ති' },
          { text: 'Promote based on meritocracy', sinhala: 'දක්ෂතාව මත උසස්වීම් ලබා දීම' }
        ],
        exampleSentences: [
          {
            en: 'A transparent recruitment procedure is indispensable for establishing an authentic meritocracy.',
            si: 'සැබෑ කුසලතා මත පදනම් වූ ක්‍රමයකින් (meritocracy) තනතුරු උසස්වීම් තීරණය වන්නේ හිතවත්කම්වලට වඩා දක්ෂතාව මත බව සහතික කෙරේ.'
          },
          {
            en: 'In a strict meritocracy, nepotism and political favoritism are systematically dismantled.',
            si: 'ක්‍රියාකාරී කුසලතා පාලනයක් රඳා පවතින අත්‍යවශ්‍ය පදනම වන්නේ අධ්‍යාපනික සමානාත්මතාවයයි.'
          },
          {
            en: 'Critics argue that educational inequalities prevent society from becoming a genuine meritocracy.',
            si: 'සමාජ ආර්ථික අසමානතාවය නිසා නූතන සමාජයට සැබෑ කුසලතා පාලනයක් වීමට නොහැකි බව විචාරකයෝ තර්ක කරති.'
          },
        ],
        practicePrompt: 'How can modern corporations transition into genuine meritocracies?',
        bandLevel: 'Band 8.5+'
      },
      {
        id: 'l4-w10',
        term: 'Remuneration',
        partOfSpeech: 'noun',
        ipa: '/rɪˌmjuː.nərˈeɪ.ʃən/',
        definition: 'Money paid for work or a service; salary or financial compensation.',
        sinhalaDefinition: 'පාරිශ්‍රමිකය / වැටුප හෝ සේවා ප්‍රතිලාභ',
        notes: 'Much more academic than "pay" or "wages". Spelling note: re-MUN-eration (not re-NUM-eration).',
        sinhalaNotes: '"Salary" හෝ "pay" යන සරල වචන වෙනුවට ලිවීමේදී භාවිතා වන ඉතා උසස් වචනයකි.',
        collocations: [
          { text: 'Adequate remuneration', sinhala: 'ප්‍රමාණවත් පාරිශ්‍රමිකය' },
          { text: 'Financial remuneration', sinhala: 'මූල්‍යමය ගෙවීම' },
          { text: 'Remuneration package', sinhala: 'වැටුප් සහ ප්‍රතිලාභ පැකේජය' }
        ],
        exampleSentences: [
          {
            en: 'To retain premier researchers, universities must offer generous remuneration packages.',
            si: 'ජ්‍යෙෂ්ඨ විධායකයින්ට කොටස් හිමිකම් සහ ප්‍රසාද දීමනා ඇතුළු පුළුල් වැටුප් හා ප්‍රතිලාභ පැකේජ ලැබේ.'
          },
          {
            en: 'Essential workers frequently receive remuneration that fails to reflect their societal contribution.',
            si: 'අත්‍යවශ්‍ය සෞඛ්‍ය සේවකයින්ට සාධාරණ වේතනයක් ලබා දීම මූලික මානව හිමිකම් කරුණකි.'
          },
          {
            en: 'Gender disparity in remuneration remains an urgent challenge across multinational corporations.',
            si: 'වැටුප් ගෙවීමේදී ස්ත්‍රී පුරුෂ භාවය මත ඇතිවන පරතරය තවමත් ආයතන ගණනාවක පවතින බාධාවකි.'
          },
        ],
        practicePrompt: 'Should CEO remuneration be legally capped relative to the average worker\'s wage?',
        bandLevel: 'Band 8.0+'
      }
    ],
    speakingChallenge: {
      part: 'PART 2 PRACTICE',
      question: 'Describe an ideal job you would like to have in the future. You should say what the job is, what qualifications it requires, what the daily responsibilities would be, and explain why this job appeals to you.',
      minimumTargetWords: 3,
      sampleBand9Answer: 'My ideal career would be an environmental policy consultant for international sustainability bodies. This vocation appeals to me because it combines lucrative career prospects with profound job satisfaction. Rather than working solely for financial remuneration, I would be contributing to climate resilience. Furthermore, modern consultancy offers extensive opportunities for telecommuting, allowing me to maintain an exemplary work-life balance while pursuing continuous professional development.',
      examinerTips: [
        'Avoid speaking only about salary; emphasize intellectual fulfillment and working conditions.',
        'Integrate collocations such as "financial remuneration", "work-life balance", and "professional development".',
        'Use conditional and future modal structures ("I would be contributing...", "This vocation appeals to me because...").'
      ]
    }
  },
  {
    id: 'lesson-5',
    number: 5,
    title: 'Environment & Sustainability',
    subtitle: 'Biodiversity, conservation, carbon emissions, renewable energy and sustainable development',
    category: 'Ecology & Climate',
    description: 'Essential Band 7.5+ vocabulary to write and speak authoritatively on climate change, deforestation, green technology, and wildlife conservation.',
    sinhalaDescription: 'දේශගුණික විපර්යාස, ජෛව විවිධත්වය, වන විනාශය, හරිත තාක්ෂණය සහ තිරසාර සංවර්ධනය පිළිබඳ ඉහළ ලකුණු ලබා දෙන වචන මාලාව.',
    bannerImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    words: [
      {
        id: 'l5-w1',
        term: 'Biodiversity',
        partOfSpeech: 'noun',
        ipa: '/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/',
        definition: 'The variety of plant and animal life in the world or in a particular habitat.',
        sinhalaDefinition: 'ජෛව විවිධත්වය / පරිසරයක ඇති ජීවී විශේෂවල විවිධත්වය',
        notes: 'Collocates with: preserve, threaten, rich in, loss of. Common in environmental essays.',
        sinhalaNotes: 'පරිසර පද්ධතියක ඇති ගස්කොළන් සහ සතුන්ගේ විවිධත්වය සහ ප්‍රමාණය.',
        collocations: [
          { text: 'Loss of biodiversity', sinhala: 'ජෛව විවිධත්වය අහිමි වීම' },
          { text: 'Preserve biodiversity', sinhala: 'ජෛව විවිධත්වය සුරැකීම' },
          { text: 'Rich biodiversity', sinhala: 'සරු ජෛව විවිධත්වය' },
          { text: 'Biodiversity hotspot', sinhala: 'ජෛව විවිධත්වයෙන් අනූන කලාපයක්' }
        ],
        exampleSentences: [
          {
            en: 'Tropical rainforests boast unprecedented biodiversity, harbouring over half of the world\'s plant and animal species.',
            si: 'නිවර්තන වැසි වනාන්තර තුළ හදිසි සංරක්ෂණයක් අවශ්‍ය වන විස්මිත පොහොසත් ජෛව විවිධත්වයක් පවතී.'
          },
          {
            en: 'Widespread monoculture farming contributes gravely to the catastrophic loss of global biodiversity.',
            si: 'වාසස්ථාන විනාශ වීම සාගර සහ ගොඩබිම් ජෛව විවිධත්වයට ඇති විශාලතම තනි තර්ජනයයි.'
          },
          {
            en: 'Ecotourism can generate funds needed to preserve regional biodiversity without causing environmental degradation.',
            si: 'ඒකවගා කෘෂිකර්මාන්තය හේතුවෙන් ප්‍රදේශයේ කෘමීන්ගේ සහ පක්ෂීන්ගේ ජෛව විවිධත්වය දැඩි ලෙස අඩු වේ.'
          },
        ],
        practicePrompt: 'Why is the preservation of biodiversity crucial for human survival?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l5-w2',
        term: 'Conservation',
        partOfSpeech: 'noun',
        ipa: '/ˌkɒn.səˈveɪ.ʃən/',
        definition: 'The protection and preservation of the natural environment and wildlife.',
        sinhalaDefinition: 'සංරක්ෂණය / ස්වාභාවික සම්පත් ආරක්ෂා කිරීම',
        notes: 'Associated terms: conservationist (noun - person), conserve (verb).',
        sinhalaNotes: 'වනජීවීන්, වනාන්තර සහ ජල මූලාශ්‍ර විනාශ නොවී රැකගැනීමේ ක්‍රියාවලිය.',
        collocations: [
          { text: 'Wildlife conservation', sinhala: 'වනජීවී සංරක්ෂණය' },
          { text: 'Conservation efforts', sinhala: 'සංරක්ෂණ ප්‍රයත්න' },
          { text: 'Energy conservation', sinhala: 'බලශක්ති සංරක්ෂණය' },
          { text: 'Conservation area', sinhala: 'සංරක්ෂිත ප්‍රදේශය' }
        ],
        exampleSentences: [
          {
            en: 'Grassroots conservation efforts have successfully revived several critically endangered avian species.',
            si: 'වනජීවී සංරක්ෂණ සංවිධාන වඳවීමේ තර්ජනයට ලක්ව ඇති සතුන් දඩයම්කරුවන්ගෙන් ආරක්ෂා කිරීමට නොනවත්වා වෙහෙසෙයි.'
          },
          {
            en: 'Government subsidies should be redirected towards marine conservation initiatives.',
            si: 'නියඟ කාලවලදී දැඩි ජල සංරක්ෂණ ක්‍රමවේද අනිවාර්යයෙන්ම ක්‍රියාත්මක කළ යුතුය.'
          },
          {
            en: 'Without urgent conservation policies, coastal coral reefs face irreversible bleaching.',
            si: 'ප්‍රදේශයේ ආදිවාසී ප්‍රජාවන් සම්බන්ධ කර ගැනීමෙන් ප්‍රජා මූලික සංරක්ෂණ ව්‍යාපෘති ඉහළ සාර්ථකත්වයක් අත්කර ගනී.'
          },
        ],
        practicePrompt: 'Should governments prioritize economic expansion over environmental conservation?',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l5-w3',
        term: 'Carbon emissions',
        partOfSpeech: 'phrase',
        ipa: '/ˌkɑː.bən iˈmɪʃ.ənz/',
        definition: 'Carbon dioxide and related greenhouse gases released into the atmosphere from burning fossil fuels.',
        sinhalaDefinition: 'කාබන් විමෝචනය / වායුගෝලයට කාබන් ඩයොක්සයිඩ් මුදා හැරීම',
        notes: 'Synonymous in context: greenhouse emissions, carbon footprint. Paired with: curb, mitigate, slash.',
        sinhalaNotes: 'ෆොසිල ඉන්ධන දහනය නිසා පරිසරයට එක්වන හරිතාගාර වායූන්.',
        collocations: [
          { text: 'Curb carbon emissions', sinhala: 'කාබන් විමෝචනය සීමා කිරීම' },
          { text: 'Heavy carbon emissions', sinhala: 'අධික කාබන් විමෝචනය' },
          { text: 'Net-zero carbon emissions', sinhala: 'ශුද්ධ ශුන්‍ය කාබන් විමෝචනය' },
          { text: 'Carbon emission cap', sinhala: 'කාබන් විමෝචන උපරිම සීමාව' }
        ],
        exampleSentences: [
          {
            en: 'Transitioning to electric public transport is paramount to slashing municipal carbon emissions.',
            si: 'කාර්මික රටවල් 2050 වන විට තම කාබන් විමෝචනය ශුන්‍ය මට්ටමකට අඩු කිරීමට ප්‍රතිඥා දී ඇත.'
          },
          {
            en: 'Industrialized nations bear a historical responsibility for the bulk of atmospheric carbon emissions.',
            si: 'හරිතාගාර වායු විමෝචනය පාලනය කිරීම සඳහා ගල් අඟුරු බලාගාරවලින් ඉවත් වීම අත්‍යවශ්‍ය වේ.'
          },
          {
            en: 'Strict carbon emissions taxes incentivize corporations to adopt clean manufacturing technologies.',
            si: 'කාබන් බද්දක් පැනවීම මඟින් සමාගම්වල කාබන් විමෝචනය කපා හැරීමට පෙළඹවීමක් ලැබේ.'
          },
        ],
        practicePrompt: 'Discuss effective legislative measures governments can enforce to curb carbon emissions.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l5-w4',
        term: 'Renewable energy',
        partOfSpeech: 'phrase',
        ipa: '/rɪˌnjuː.ə.bəl ˈen.ə.dʒi/',
        definition: 'Energy from a source that is not depleted when used, such as wind, solar, tidal, or geothermal power.',
        sinhalaDefinition: 'පුනර්ජනනීය බලශක්තිය (සූර්ය, සුළං ආදී නොසිඳෙන බලශක්තිය)',
        notes: 'Opposite: fossil fuels, finite resources. Key solution in virtually any climate essay.',
        sinhalaNotes: 'භාවිතය නිසා අවසන් නොවන, පරිසර හිතකාමී ස්වභාවික බලශක්ති ප්‍රභව.',
        collocations: [
          { text: 'Harness renewable energy', sinhala: 'පුනර්ජනනීය බලශක්තිය ප්‍රයෝජනයට ගැනීම' },
          { text: 'Renewable energy infrastructure', sinhala: 'පුනර්ජනනීය බලශක්ති යටිතල පහසුකම්' },
          { text: 'Transition to renewable energy', sinhala: 'පුනර්ජනනීය බලශක්තිය වෙත මාරු වීම' }
        ],
        exampleSentences: [
          {
            en: 'Harnessing renewable energy like offshore wind and solar radiation is the cornerstone of decarbonisation.',
            si: 'සුළං සහ සූර්ය බලය වැනි පුනර්ජනනීය බලශක්ති ප්‍රභවයන් සඳහා කරන ආයෝජන වාර්තාගත මට්ටමකට පැමිණ ඇත.'
          },
          {
            en: 'Heavy initial capital investment is required to establish efficient renewable energy grids.',
            si: 'භූතාප බලශක්තිය යනු කාලගුණික තත්ත්වයන්ගෙන් බාධාවක් නොවන ශක්තිමත් පුනර්ජනනීය බලශක්ති ආකාරයකි.'
          },
          {
            en: 'Developing countries require global financial assistance to leapfrog fossil fuels into renewable energy.',
            si: 'පුනර්ජනනීය බලශක්තියේ උපරිම ඵල නෙළා ගැනීමට ලාභදායී බැටරි ගබඩා පද්ධති සංවර්ධනය කිරීම ඉතා වැදගත්ය.'
          },
        ],
        practicePrompt: 'Explain why some nations are slow to transition fully towards renewable energy.',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l5-w5',
        term: 'Sustainable development',
        partOfSpeech: 'phrase',
        ipa: '/səˌsteɪ.nə.bəl dɪˈvel.əp.mənt/',
        definition: 'Economic development that is conducted without depletion of natural resources so future generations are not harmed.',
        sinhalaDefinition: 'තිරසාර සංවර්ධනය / අනාගත පරපුරට සම්පත් සුරකිමින් කරන සංවර්ධනය',
        notes: 'The gold standard phrase for Task 2 conclusion paragraphs on economy and nature.',
        sinhalaNotes: 'අනාගත පරම්පරාවේ පැවැත්මට හානි නොවන අයුරින් වර්තමාන අවශ්‍යතා සපුරා ගැනීම.',
        collocations: [
          { text: 'Pursue sustainable development', sinhala: 'තිරසාර සංවර්ධනය උදෙසා කටයුතු කිරීම' },
          { text: 'Principles of sustainable development', sinhala: 'තිරසාර සංවර්ධන මූලධර්ම' },
          { text: 'Goals for sustainable development', sinhala: 'තිරසාර සංවර්ධන ඉලක්ක' }
        ],
        exampleSentences: [
          {
            en: 'Urban planners must prioritize sustainable development by creating walkable neighbourhoods and green spaces.',
            si: 'තිරසාර සංවර්ධනය මඟින් ආර්ථික ප්‍රගතිය සහ ස්වභාවික සම්පත් ආරක්ෂා කිරීම අතර මනා එකඟතාවක් ඇති කරයි.'
          },
          {
            en: 'Balancing industrial growth with ecological integrity is the primary objective of sustainable development.',
            si: 'එක්සත් ජාතීන්ගේ තිරසාර සංවර්ධන ඉලක්ක මඟින් ගෝලීය දරිද්‍රතාවය, අසමානතාවය සහ දේශගුණික විපර්යාස විසඳීමට කටයුතු කරයි.'
          },
          {
            en: 'The United Nations outlined seventeen goals to guide global sustainable development.',
            si: 'තිරසාර සංවර්ධනයට සහාය වීම සඳහා සිවිල් ඉංජිනේරු ව්‍යාපෘති පරිසර හිතකාමී ද්‍රව්‍යවලට මුල්තැන දිය යුතුය.'
          },
        ],
        practicePrompt: 'Can developing economies realistically achieve sustainable development without slowing down growth?',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l5-w6',
        term: 'Deforestation',
        partOfSpeech: 'noun',
        ipa: '/diːˌfɒr.ɪˈsteɪ.ʃən/',
        definition: 'The purposeful clearing of forested land on a massive scale.',
        sinhalaDefinition: 'වන විනාශය / මහා පරිමාණයෙන් ගස් කැපීම',
        notes: 'Causes: agricultural expansion, logging, cattle ranching. Consequences: soil erosion, habitat loss.',
        sinhalaNotes: 'ගොවිතැන්, දැව හෝ ඉදිකිරීම් සඳහා වනාන්තර මහා පරිමාණයෙන් එළිපෙහෙළි කිරීම.',
        collocations: [
          { text: 'Rampant deforestation', sinhala: 'පාලනයකින් තොර දරුණු වන විනාශය' },
          { text: 'Combat deforestation', sinhala: 'වන විනාශයට එරෙහිව සටන් කිරීම' },
          { text: 'Halt deforestation', sinhala: 'වන විනාශය නතර කිරීම' },
          { text: 'Deforestation rates', sinhala: 'වන විනාශයේ ප්‍රතිශතය' }
        ],
        exampleSentences: [
          {
            en: 'Rampant deforestation in the Amazon Basin exacerbates global heating by destroying earth\'s natural carbon sinks.',
            si: 'ඇමසන් ද්‍රෝණියේ සිදුවන සීඝ්‍ර වන විනාශය සමස්ත ලෝකයේම දේශගුණික ස්ථාවරත්වයට දැඩි තර්ජනයක් එල්ල කරයි.'
          },
          {
            en: 'Logging moratoriums and strict satellite surveillance are needed to halt illegal deforestation.',
            si: 'නීතිවිරෝධී දැව කැපීම සහ ගව පාලනය නිවර්තන වන විනාශයේ ප්‍රධාන සාධක වේ.'
          },
          {
            en: 'Soil erosion and disastrous landslides are direct consequences of indiscriminate deforestation.',
            si: 'නැවත වන වගා කිරීමේ ව්‍යාපෘති මඟින් වාණිජ වන විනාශයේ විනාශකාරී ප්‍රතිවිපාකවලට එරෙහිව සටන් වදියි.'
          },
        ],
        practicePrompt: 'What international policies could be implemented to halt illegal deforestation worldwide?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l5-w7',
        term: 'Climate mitigation',
        partOfSpeech: 'phrase',
        ipa: '/ˈklaɪ.mət ˌmɪt.ɪˈɡeɪ.ʃən/',
        definition: 'Actions taken to reduce or prevent the emission of greenhouse gases to limit the magnitude of future warming.',
        sinhalaDefinition: 'දේශගුණික විපර්යාස අවම කිරීමේ ක්‍රියාමාර්ග',
        notes: 'Mitigation = preventing future damage (e.g. reforestation); Adaptation = coping with changes already occurring.',
        sinhalaNotes: 'දේශගුණ විපර්යාසයේ දරුණු ප්‍රතිඵල අවම කිරීම සඳහා ගන්නා ප්‍රතිපත්තිමය ක්‍රියාමාර්ග.',
        collocations: [
          { text: 'Climate mitigation strategies', sinhala: 'දේශගුණ විපර්යාස අවම කිරීමේ උපායමාර්ග' },
          { text: 'Urgent climate mitigation', sinhala: 'හදිසි දේශගුණික අවම කිරීම් පියවර' },
          { text: 'Mitigation and adaptation', sinhala: 'අවම කිරීම සහ අනුවර්තනය වීම' }
        ],
        exampleSentences: [
          {
            en: 'Afforestation and aggressive renewable energy deployment are critical components of climate mitigation.',
            si: 'වන වගාව සහ තෙත්බිම් ප්‍රතිසංස්කරණය කිරීම දේශගුණික විපර්යාස අවම කිරීමේ ඵලදායී ස්වභාවික ක්‍රමවේද වේ.'
          },
          {
            en: 'Without proactive climate mitigation, low-lying island nations face existential inundation.',
            si: 'වාතයෙන් සෘජුවම කාබන් උරාගැනීමේ පද්ධති දේශගුණික බලපෑම් අවම කිරීමේ තාක්ෂණික විසඳුම්වලට අයත් වේ.'
          },
          {
            en: 'Both mitigation and adaptation strategies must be funded equitably by the international community.',
            si: 'ගෝලීය දේශගුණික හානි අවම කිරීමේ ප්‍රයත්නයන් සඳහා දියුණු සහ නැගී එන ආර්ථිකයන් අතර එක්සත් සහයෝගීතාවක් අවශ්‍ය වේ.'
          },
        ],
        practicePrompt: 'Distinguish between climate mitigation and climate adaptation using concrete examples.',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l5-w8',
        term: 'Ecological catastrophe',
        partOfSpeech: 'phrase',
        ipa: '/ˌiː.kəˈlɒdʒ.ɪ.kəl kəˈtæs.trə.fi/',
        definition: 'A massive environmental disaster characterized by widespread habitat destruction and loss of life.',
        sinhalaDefinition: 'පාරිසරික ව්‍යසනය / දැවැන්ත පාරිසරික විනාශය',
        notes: 'Strong impact phrase for essays discussing oil spills, nuclear leaks, or tipping points.',
        sinhalaNotes: 'තෙල් කාන්දුවීම්, වන ගිනි හෝ විෂ ද්‍රව්‍ය නිසා සිදුවන මහා පරිමාණ පාරිසරික විනාශය.',
        collocations: [
          { text: 'Avert an ecological catastrophe', sinhala: 'පාරිසරික ව්‍යසනයක් වළක්වා ගැනීම' },
          { text: 'Impending ecological catastrophe', sinhala: 'ළඟ එන පාරිසරික ව්‍යසනය' },
          { text: 'Result in an ecological catastrophe', sinhala: 'පාරිසරික ව්‍යසනයකින් කෙළවර වීම' }
        ],
        exampleSentences: [
          {
            en: 'A failure to cap global temperatures below 1.5°C will precipitate an irreversible ecological catastrophe.',
            si: 'ධ්‍රැවීය අයිස් තට්ටු දියවීම වෙරළබඩ නගර පුරා පෙර නොවූ විරූ පාරිසරික ව්‍යසනයක් ඇති කිරීමට හේතු විය හැක.'
          },
          {
            en: 'The catastrophic oil spill decimated marine fauna, resulting in an enduring ecological catastrophe.',
            si: 'ව්‍යසනයේ න්‍යෂ්ටික විකිරණ අවට වනාන්තරවල දිගුකාලීන පාරිසරික ව්‍යසනයක් ඇති කළේය.'
          },
          {
            en: 'Immediate intervention is required to avert an ecological catastrophe in the drying lake.',
            si: 'පාරිසරික ව්‍යසනයක් වැළැක්වීම සඳහා වත්මන් පරිභෝජන රටාවන්හි රැඩිකල් වෙනසක් සිදු කිරීම අවශ්‍ය වේ.'
          },
        ],
        practicePrompt: 'Describe an ecological catastrophe caused by human negligence.',
        bandLevel: 'Band 8.5+'
      },
      {
        id: 'l5-w9',
        term: 'Flora and fauna',
        partOfSpeech: 'phrase',
        ipa: '/ˌflɔː.rə ænd ˈfɔː.nə/',
        definition: 'The plants (flora) and animals (fauna) of a particular region, habitat, or geological period.',
        sinhalaDefinition: 'ශාක සහ සත්ත්ව ප්‍රජාව',
        notes: 'Always ordered "flora and fauna" (not fauna and flora). Natural academic binomial pair.',
        sinhalaNotes: 'යම් නිශ්චිත කලාපයකට අයත් සමස්ත ශාක හා සත්ත්ව ලෝකය එකට හැඳින්වීම.',
        collocations: [
          { text: 'Indigenous flora and fauna', sinhala: 'දේශීය ශාක සහ සතුන්' },
          { text: 'Protect local flora and fauna', sinhala: 'ප්‍රාදේශීය ශාක හා සතුන් ආරක්ෂා කිරීම' },
          { text: 'Diverse flora and fauna', sinhala: 'විවිධත්වයෙන් යුතු ශාක හා සතුන්' }
        ],
        exampleSentences: [
          {
            en: 'Invasive plant species can drastically alter habitats, threatening indigenous flora and fauna.',
            si: 'මැඩගස්කරයට ආවේණික ශාක හා සත්ත්ව ප්‍රජාව වසර මිලියන ගණනක් පුරා සම්පූර්ණ හුදකලාවේ පරිණාමය විය.'
          },
          {
            en: 'The national park was established to safeguard rare flora and fauna from urbanization.',
            si: 'මිරිදිය ජල ප්‍රවාහවල සිදුවන දූෂණය අවදානමට ලක්විය හැකි ජලජ ශාක හා සත්ත්ව විශේෂ අනතුරේ හෙළයි.'
          },
          {
            en: 'Sri Lanka\'s endemic flora and fauna draw eco-tourists from around the globe.',
            si: 'පරිසර සංචාරක ව්‍යාපාරය සංචාරකයන්ට සංවේදී දේශීය ශාක හා සත්ත්ව ලෝකය වගකීමෙන් යුතුව අගය කිරීමට මඟ පෙන්වයි.'
          },
        ],
        practicePrompt: 'How does rapid urbanization endanger endemic flora and fauna?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l5-w10',
        term: 'Finite resources',
        partOfSpeech: 'phrase',
        ipa: '/ˈfaɪ.naɪt rɪˈsɔː.sɪz/',
        definition: 'Natural resources that exist in limited amounts and cannot be easily replenished once exhausted (e.g. coal, crude oil).',
        sinhalaDefinition: 'සීමිත සම්පත් / භාවිතයෙන් අවසන් වන ස්වභාවික සම්පත්',
        notes: 'Pronunciation: FAHY-nahyt (not fih-neet). Opposite of renewable resources.',
        sinhalaNotes: 'පොළොවේ පවතින සීමිත ප්‍රමාණයක් ඇති, නැවත සෑදීමට මිලියන ගණන් ගතවන සම්පත්.',
        collocations: [
          { text: 'Depletion of finite resources', sinhala: 'සීමිත සම්පත් ක්ෂය වීම' },
          { text: 'Dependence on finite resources', sinhala: 'සීමිත සම්පත් මත යැපීම' },
          { text: 'Conserve finite resources', sinhala: 'සීමිත සම්පත් පරෙස්සමෙන් පරිභෝජනය කිරීම' }
        ],
        exampleSentences: [
          {
            en: 'Humanity must accept that our planet possesses finite resources which cannot sustain infinite consumption.',
            si: 'ෆොසිල ඉන්ධන යනු අනාගතයේ දිනෙක අවසන් වන සීමිත සම්පත් බැවින් මිනිස් ශිෂ්ටාචාරය සදහටම පවත්වා ගැනීමට ඒවා ප්‍රමාණවත් නොවේ.'
          },
          {
            en: 'Over-dependence on finite fossil resources exacerbates both geopolitical conflict and environmental degradation.',
            si: 'සීමිත සම්පත් නොසැලකිලිමත් ලෙස ක්ෂය කිරීම අනාගත පරපුර දැඩි අර්බුදයකට ඇද දමනු ඇත.'
          },
          {
            en: 'Circular economic models seek to decouple economic prosperity from the exploitation of finite resources.',
            si: 'චක්‍රීය ආර්ථික ක්‍රමයකට මාරුවීමෙන් සීමිත ස්වභාවික සම්පත් ක්ෂය වීම මත ඇති අපගේ යැපීම අවම වේ.'
          },
        ],
        practicePrompt: 'How can modern economies decouple growth from the consumption of finite resources?',
        bandLevel: 'Band 7.5+'
      }
    ],
    speakingChallenge: {
      part: 'PART 3 PRACTICE',
      question: 'Do you believe individuals or governments bear greater responsibility for protecting the environment?',
      minimumTargetWords: 3,
      sampleBand9Answer: 'While individuals can certainly make conscious consumer decisions—such as curbing waste and choosing public transit—governments undeniably bear the primary responsibility for environmental stewardship. Only state administrations possess the regulatory authority to mandate caps on industrial carbon emissions and fund transitions toward renewable energy. Furthermore, shielding fragile biodiversity and averting ecological catastrophes requires nationwide legislation that individual citizens cannot enact independently.',
      examinerTips: [
        'Use persuasive concessive structures: "While individuals can certainly... governments undeniably bear..."',
        'Incorporate precise ecological terminology (carbon emissions, biodiversity, ecological catastrophe).',
        'Provide concrete justifications (regulatory authority, large-scale infrastructure funding).'
      ]
    }
  },
  {
    id: 'lesson-6',
    number: 6,
    title: 'Health & Lifestyle',
    subtitle: 'Well-being, sedentary lifestyle, balanced diet, physical activity and mental resilience',
    category: 'Health & Wellness',
    description: 'Band 7.5+ vocabulary to debate public health policies, sedentary office cultures, mental well-being, preventative medicine, and nutrition.',
    sinhalaDescription: 'සුවපත්භාවය, අලස ජීවන රටාව, සමබර ආහාර, මානසික ශක්තිය සහ නිවාරණ සෞඛ්‍යය පිළිබඳ ඉහළ ලකුණු ලබා දෙන වචන මාලාව.',
    bannerImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    words: [
      {
        id: 'l6-w1',
        term: 'Well-being',
        partOfSpeech: 'noun',
        ipa: '/ˌwelˈbiː.ɪŋ/',
        definition: 'The state of being comfortable, healthy, or happy.',
        sinhalaDefinition: 'සුවපත්භාවය / කායික හා මානසික යහපැවැත්ම',
        notes: 'Broad umbrella term encompassing physical, psychological, and financial wellness.',
        sinhalaNotes: 'නිරෝගීකම, මානසික සතුට සහ සාමකාමී ජීවන තත්ත්වය එකට විස්තර කරයි.',
        collocations: [
          { text: 'Physical and mental well-being', sinhala: 'කායික හා මානසික සුවපත්භාවය' },
          { text: 'Promote overall well-being', sinhala: 'සමස්ත යහපැවැත්ම ප්‍රවර්ධනය කිරීම' },
          { text: 'Emotional well-being', sinhala: 'චිත්තවේගීය යහපැවැත්ම' },
          { text: 'Threat to personal well-being', sinhala: 'පෞද්ගලික සුවපත්භාවයට එල්ල වන තර්ජනයක්' }
        ],
        exampleSentences: [
          {
            en: 'Governments should measure national progress not merely by GDP, but by the overall well-being of their citizens.',
            si: 'සේවකයින්ගේ සුවපහසුව හා යහපැවැත්ම වැඩිදියුණු කිරීම සඳහා සැලසුම් කළ වැඩසටහන් ඉහළ රැකියා තෘප්තියක් ගෙන දෙයි.'
          },
          {
            en: 'Spending time in nature has been empirically shown to enhance mental well-being.',
            si: 'සම්පූර්ණ යහපැවැත්ම ශාරීරික සෞඛ්‍යය, චිත්තවේගීය සමබරතාවය සහ තෘප්තිමත් සමාජ සබඳතා යන සියල්ලෙන් සමන්විත වේ.'
          },
          {
            en: 'Chronic financial instability takes a heavy toll on personal well-being and family harmony.',
            si: 'හෘද සෞඛ්‍යය මෙන්ම මානසික යහපැවැත්ම කෙරෙහිද සමසේ ප්‍රමුඛත්වය ලබා දිය යුතුය.'
          },
        ],
        practicePrompt: 'How can modern cities be redesigned to promote citizens\' physical and psychological well-being?',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l6-w2',
        term: 'Sedentary lifestyle',
        partOfSpeech: 'phrase',
        ipa: '/ˈsed.ən.tər.i ˈlaɪf.staɪl/',
        definition: 'A way of living that involves little or no physical activity, often sitting for long periods.',
        sinhalaDefinition: 'අක්‍රිය (අලස) ජීවන රටාව / ශාරීරික ක්‍රියාකාරකම්වලින් තොර ජීවිතය',
        notes: 'Prime vocabulary for health essays regarding desk jobs, video gaming, and modern conveniences.',
        sinhalaNotes: 'කාර්යාලවල එකතැන වාඩි වී වැඩ කිරීම හෝ ව්‍යායාම නොමැතිව දවස ගත කිරීම.',
        collocations: [
          { text: 'Lead a sedentary lifestyle', sinhala: 'අක්‍රිය ජීවන රටාවක් ගත කිරීම' },
          { text: 'Combating a sedentary lifestyle', sinhala: 'අක්‍රිය ජීවන රටාවෙන් මිදීම' },
          { text: 'Risks of a sedentary lifestyle', sinhala: 'අක්‍රිය ජීවිතයකින් ඇතිවන අවදානම' }
        ],
        exampleSentences: [
          {
            en: 'Leading a sedentary lifestyle substantially elevates the vulnerability to cardiovascular ailments and type 2 diabetes.',
            si: 'අක්‍රිය හා ව්‍යායාම විරහිත ජීවන රටාව හෘද රෝග සහ දෙවන වර්ගයේ දියවැඩියාව ඇතිවීමේ අවදානම සැලකිය යුතු ලෙස ඉහළ නංවයි.'
          },
          {
            en: 'Modern office workers are trapped in sedentary lifestyles, staring at screens for eight or more hours daily.',
            si: 'කාර්යාල සේවකයින්ට හිටගෙන වැඩ කරන මේස භාවිතා කිරීමට දිරිදීම මඟින් අක්‍රිය ජීවන රටාවේ අනතුරු අවම කරයි.'
          },
          {
            en: 'Schools must introduce daily physical education to discourage children from adopting sedentary lifestyles.',
            si: 'තිරය ඉදිරිපිට ගත කරන කාලය වෙනුවට එළිමහන් ක්‍රීඩාවල යෙදෙන දරුවන් අක්‍රිය ජීවන රටාවකට හුරුවීම අඩුය.'
          },
        ],
        practicePrompt: 'Describe effective daily strategies to counteract a sedentary desk job.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l6-w3',
        term: 'Balanced diet',
        partOfSpeech: 'phrase',
        ipa: '/ˌbæl.ənst ˈdaɪ.ət/',
        definition: 'A diet consisting of the proper quantities and proportions of foods needed to maintain health.',
        sinhalaDefinition: 'සමබර ආහාර වේලක්',
        notes: 'Collocates with: maintain, consume, adhere to, nutritional components.',
        sinhalaNotes: 'ශරීරයට අවශ්‍ය සියලුම පෝෂ්‍ය පදාර්ථ නිසි ප්‍රමාණයෙන් අඩංගු ආහාර වේල.',
        collocations: [
          { text: 'Maintain a balanced diet', sinhala: 'සමබර ආහාර වේලක් පවත්වා ගැනීම' },
          { text: 'Adhere to a balanced diet', sinhala: 'සමබර ආහාර රටාවකට අනුගත වීම' },
          { text: 'Components of a balanced diet', sinhala: 'සමබර ආහාර වේලක අඩංගු පෝෂ්‍ය පදාර්ථ' }
        ],
        exampleSentences: [
          {
            en: 'Adhering to a balanced diet rich in leafy greens, legumes, and lean proteins bolsters immune resilience.',
            si: 'පලා වර්ග සහ ධාන්‍ය වර්ගවලින් පොහොසත් සමබර ආහාර වේලක් ප්‍රතිශක්තිකරණ පද්ධතිය ශක්තිමත් කරයි.'
          },
          {
            en: 'Fast food consumption undermines the benefits of an otherwise balanced diet.',
            si: 'සමබර ආහාර වේලක් ලබා ගැනීමෙන් අධික මිලැති කෘතිම අතිරේක ඖෂධවල අවශ්‍යතාව නැතිවන බව පෝෂණවේදීහු අවධාරණය කරති.'
          },
          {
            en: 'Nutritional education in schools enables youngsters to make informed choices toward a balanced diet.',
            si: 'සමබර ආහාර වේලක අඩංගු දෑ පිළිබඳව යෞවනයන් දැනුවත් කිරීමෙන් ජීවිත කාලය පුරාම පවතින නිරෝගී පුරුදු ඇතිවේ.'
          },
        ],
        practicePrompt: 'Why is it difficult for low-income families to access a balanced diet?',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l6-w4',
        term: 'Mental resilience',
        partOfSpeech: 'phrase',
        ipa: '/ˈmen.təl rɪˈzɪl.i.əns/',
        definition: 'The capacity to adapt successfully in the presence of risk, severe stress, or psychological adversity.',
        sinhalaDefinition: 'මානසික ශක්තිය / පීඩනයන් හමුවේ නොසැලී සිටීමේ හැකියාව',
        notes: 'Crucial in post-pandemic IELTS topics on workplace pressure and student well-being.',
        sinhalaNotes: 'මානසික පීඩන, විභාග හෝ ජීවන ගැටලුවලට සාර්ථකව මුහුණ දීමේ මානසික ශක්තිමත්භාවය.',
        collocations: [
          { text: 'Build mental resilience', sinhala: 'මානසික ශක්තිය ගොඩනැගීම' },
          { text: 'Demonstrate mental resilience', sinhala: 'මානසික ශක්තිය ප්‍රකට කිරීම' },
          { text: 'Cultivate mental resilience', sinhala: 'මානසික ශක්තිය පුරුදු පුහුණු කිරීම' }
        ],
        exampleSentences: [
          {
            en: 'Mindfulness meditation and cognitive reframing can help individuals cultivate mental resilience.',
            si: 'මානසික ශක්තිය ගොඩනැගීම සිසුන්ට ජාතික විභාගවල දැඩි පීඩනයට නොසැලී මුහුණ දීමට හැකියාව ලබා දෙයි.'
          },
          {
            en: 'Athletes require not only physical endurance but formidable mental resilience to succeed under scrutiny.',
            si: 'සිහියෙන් යුතුව කටයුතු කිරීම මානසික ශක්තිය හා ඔරොත්තු දීමේ හැකියාව වැඩිදියුණු කිරීම සඳහා ඔප්පු කරන ලද ක්‍රමයකි.'
          },
          {
            en: 'Developing mental resilience during adolescence shields young adults from anxiety disorders.',
            si: 'ඉහළ මානසික ශක්තියක් ඇති පුද්ගලයන් පෞද්ගලික දුක්ඛදායක තත්වයන්ගෙන් සහ ආර්ථික අර්බුදවලින් ඉතා ඉක්මනින් යථා තත්ත්වයට පත්වේ.'
          },
        ],
        practicePrompt: 'How can educational systems help adolescents build mental resilience against exam stress?',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l6-w5',
        term: 'Preventive medicine',
        partOfSpeech: 'phrase',
        ipa: '/prɪˌven.tɪv ˈmed.ɪ.sən/',
        definition: 'Medical practices and public health policies designed to avert illness rather than treating symptoms after onset.',
        sinhalaDefinition: 'නිවාරණ වෛද්‍ය විද්‍යාව / රෝග වැළැක්වීමේ ප්‍රතිකාර ක්‍රම',
        notes: 'Core Task 2 theme: "Should healthcare spending focus on prevention or cure?"',
        sinhalaNotes: 'රෝගයක් හැදුණු පසු ප්‍රතිකාර කිරීමට වඩා, රෝගය ඇතිවීම වළක්වා ගැනීමට ගන්නා පියවර.',
        collocations: [
          { text: 'Focus on preventive medicine', sinhala: 'නිවාරණ සෞඛ්‍යය කෙරෙහි අවධානය යොමු කිරීම' },
          { text: 'Invest in preventive medicine', sinhala: 'රෝග නිවාරණය සඳහා ආයෝජනය කිරීම' },
          { text: 'Principles of preventive medicine', sinhala: 'නිවාරණ වෛද්‍ය විද්‍යාවේ මූලධර්ම' }
        ],
        exampleSentences: [
          {
            en: 'Allocating funds to preventive medicine—such as vaccination and dietary education—saves billions in emergency care.',
            si: 'රෝග නිවාරණ වෛද්‍ය විද්‍යාව සඳහා ආයෝජනය කිරීමෙන් හදිසි රෝහල්ගතවීම් සඳහා යන මහජන වියදම් අඩු කරගත හැකිය.'
          },
          {
            en: 'A robust healthcare system balances advanced surgical intervention with accessible preventive medicine.',
            si: 'වාර්ෂික සෞඛ්‍ය පරීක්ෂණ සහ නියමිත එන්නත් ලබා ගැනීම නූතන රෝග නිවාරණ වෛද්‍ය විද්‍යාවේ ප්‍රධාන කුළුණු වේ.'
          },
          {
            en: 'Routine screenings and health checkups form the frontline of modern preventive medicine.',
            si: 'රෝග නිවාරණ වෛද්‍ය විද්‍යාව ඖෂධ ලබාදීමට වඩා මුල් කාලයේදීම ජීවන රටාව වෙනස් කිරීමට ප්‍රමුඛත්වය දෙයි.'
          },
        ],
        practicePrompt: 'Should state health budgets prioritize preventive medicine over expensive hospital treatments?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l6-w6',
        term: 'Longevity',
        partOfSpeech: 'noun',
        ipa: '/lɒnˈdʒev.ə.ti/',
        definition: 'Long life or existence; the length of an individual\'s lifespan.',
        sinhalaDefinition: 'දීර්ඝායුෂ / දිගු කලක් ජීවත් වීමේ හැකියාව',
        notes: 'Pronunciation: lon-JEV-i-tee. Used when discussing ageing populations, retirement, and public health.',
        sinhalaNotes: 'නිරෝගීව දිගු කලක් ජීවත් වීම හෝ ආයු අපේක්ෂාව.',
        collocations: [
          { text: 'Increase longevity', sinhala: 'දීර්ඝායුෂ වැඩි කිරීම' },
          { text: 'Factors affecting longevity', sinhala: 'දීර්ඝායුෂ කෙරෙහි බලපාන සාධක' },
          { text: 'Exceptional longevity', sinhala: 'අසාමාන්‍ය දීර්ඝායුෂයක්' }
        ],
        exampleSentences: [
          {
            en: 'Advances in pharmacology and sanitation have contributed significantly to increased human longevity over the past century.',
            si: 'ක්‍රමවත් ශාරීරික ව්‍යායාම සහ ආහාර පාලනය මිනිසාගේ දීර්ඝායුෂ ලැබීමට හේතුවන බව ඔප්පු වී ඇත.'
          },
          {
            en: 'Regions like Okinawa are world-renowned for the exceptional longevity of their elderly populations.',
            si: 'සනීපාරක්ෂාව සහ ප්‍රතිජීවක ඖෂධවල දියුණුව හේතුවෙන් 20 වන සියවසේදී මිනිසාගේ සාමාන්‍ය ආයු අපේක්ෂාව විශාල ලෙස ඉහළ ගියේය.'
          },
          {
            en: 'While longevity has increased, ensuring that extra years are lived in good health remains a challenge.',
            si: 'වැඩිහිටි ජනගහනයක් සහ ඉහළ ආයු කාලයක් සහිත රටවල් විශ්‍රාම වැටුප් සුරක්ෂිතතාව සම්බන්ධයෙන් විශේෂ ආර්ථික අභියෝගවලට මුහුණ දෙයි.'
          },
        ],
        practicePrompt: 'What lifestyle factors contribute most decisively to human longevity?',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l6-w7',
        term: 'Nutritious',
        partOfSpeech: 'adjective',
        ipa: '/njuːˈtrɪʃ.əs/',
        definition: 'Nourishing and efficient as food; containing essential nutrients.',
        sinhalaDefinition: 'පෝෂ්‍යදායී / පෝෂණ ගුණයෙන් සපිරි',
        notes: 'Far more formal than "healthy food". Pair with nouns: meal, diet, ingredients.',
        sinhalaNotes: '"Healthy food" යන සරල වචනය වෙනුවට ලිවීමේදී භාවිතා කළ යුතු උසස් වචනයකි.',
        collocations: [
          { text: 'Nutritious diet', sinhala: 'පෝෂ්‍යදායී ආහාර වේල' },
          { text: 'Wholesome and nutritious', sinhala: 'ගුණදායක හා පෝෂ්‍යදායී' },
          { text: 'Highly nutritious ingredients', sinhala: 'ඉහළ පෝෂණ ගුණයෙන් යුතු අමුද්‍රව්‍ය' }
        ],
        exampleSentences: [
          {
            en: 'Providing affordable, nutritious school meals ensures that children from all backgrounds can concentrate in class.',
            si: 'පෝෂ්‍යදායී උදෑසන ආහාරයක් ගැනීමෙන් අධ්‍යයන කටයුතු සාර්ථකව කරගෙන යාමට අවශ්‍ය මානසික ශක්තිය ලැබේ.'
          },
          {
            en: 'Legumes and whole grains provide an affordable and highly nutritious base for everyday cooking.',
            si: 'පාසල් ආපනශාලාවල පෝෂ්‍යදායී ආහාර සඳහා සහනාධාර ලබා දීමෙන් කුඩා දරුවන් තරබාරු වීමේ අවදානම වළක්වා ගත හැකිය.'
          },
          {
            en: 'Heavily processed snacks masquerade as healthy while lacking genuinely nutritious components.',
            si: 'දේශීයව සපයා ගන්නා සරල අමුද්‍රව්‍ය මඟින් ඉතා පෝෂ්‍යදායී මෙන්ම ආර්ථික වාසිදායක ආහාර වේලක් සකසා ගත හැකිය.'
          },
        ],
        practicePrompt: 'How can governments make nutritious food more affordable than ultra-processed junk food?',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l6-w8',
        term: 'Chronic illness',
        partOfSpeech: 'phrase',
        ipa: '/ˈkrɒn.ɪk ˈɪl.nəs/',
        definition: 'A human health condition or disease that is persistent or long-lasting in its effects.',
        sinhalaDefinition: 'දීර්ඝකාලීන (නිදන්ගත) රෝගී තත්ත්වය',
        notes: 'Opposite of acute illness. Includes diabetes, hypertension, and asthma.',
        sinhalaNotes: 'කෙටි කලකින් සුව නොවන, ජීවිත කාලය පුරා ඖෂධ ගැනීමට සිදුවන දියවැඩියාව වැනි නිදන්ගත රෝග.',
        collocations: [
          { text: 'Suffer from a chronic illness', sinhala: 'නිදන්ගත රෝගයකින් පෙළීම' },
          { text: 'Manage chronic illness', sinhala: 'නිදන්ගත රෝග පාලනය කිරීම' },
          { text: 'Burden of chronic illness', sinhala: 'නිදන්ගත රෝග නිසා ඇතිවන පීඩනය' }
        ],
        exampleSentences: [
          {
            en: 'Sedentary habits and excessive sugar intake are primary drivers of chronic illnesses in urban populations.',
            si: 'දියවැඩියාව සහ අධික රුධිර පීඩනය යනු අඛණ්ඩ වෛද්‍ය අධීක්ෂණයක් අවශ්‍ය වන නිදන්ගත රෝග සඳහා උදාහරණ වේ.'
          },
          {
            en: 'Managing a chronic illness requires patient discipline and consistent access to healthcare specialists.',
            si: 'දුර්වල ආහාර රටාව සහ දිගුකාලීන අලසකම ලොව පුරා නිදන්ගත රෝග ශීඝ්‍රයෙන් ඉහළ යාමට ප්‍රධානතම හේතු වේ.'
          },
          {
            en: 'The rising prevalence of chronic illness places tremendous strain on national healthcare infrastructure.',
            si: 'නිදන්ගත රෝගවලට එරෙහිව සටන් කරන පුද්ගලයන්ට රෝගී උපකාරක කණ්ඩායම් මඟින් අත්‍යවශ්‍ය මානසික සහනයක් සැලසේ.'
          },
        ],
        practicePrompt: 'Discuss the societal costs associated with the rise of chronic illnesses.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l6-w9',
        term: 'Vitality',
        partOfSpeech: 'noun',
        ipa: '/vaɪˈtæl.ə.ti/',
        definition: 'The state of being strong and active; energy and liveliness.',
        sinhalaDefinition: 'ජීව ශක්තිය / ප්‍රබෝධමත් බව සහ ශක්තිමත්භාවය',
        notes: 'High lexical score when describing youthful energy, recovery from sickness, or economic vibrancy.',
        sinhalaNotes: 'කායික හා මානසිකව පවතින ප්‍රබෝධමත් බව, ක්‍රියාශීලී බව සහ සවිබල බව.',
        collocations: [
          { text: 'Youthful vitality', sinhala: 'තරුණ ජීව ශක්තිය' },
          { text: 'Restore vitality', sinhala: 'ජීව ශක්තිය යළි ලබා ගැනීම' },
          { text: 'Physical and mental vitality', sinhala: 'කායික හා මානසික ප්‍රබෝධය' }
        ],
        exampleSentences: [
          {
            en: 'Regular aerobic exercise and adequate REM sleep are the twin engines of daily vitality.',
            si: 'ක්‍රමවත් හෘද ව්‍යායාම සහ සුව නින්ද දෛනික ජීව ශක්තිය පවත්වා ගැනීමේ ප්‍රධාන එන්ජින් දෙක වේ.'
          },
          {
            en: 'Proper hydration immediately restores a sense of vitality during strenuous manual labor.',
            si: 'ප්‍රමාණවත් තරම් ජලය පානය කිරීමෙන් වෙහෙසකර වැඩවලදී ක්ෂණික ප්‍රබෝධයක් සහ ශක්තියක් නැවත ලැබේ.'
          },
          {
            en: 'Older adults who maintain social engagements demonstrate superior cognitive vitality.',
            si: 'සමාජශීලී ක්‍රියාකාරකම්වල නිරත වන වැඩිහිටියන් උසස් මානසික ප්‍රබෝධයක් සහ ජීව ශක්තියක් ප්‍රදර්ශනය කරති.'
          },
        ],
        practicePrompt: 'What daily habits help you maintain high mental and physical vitality?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l6-w10',
        term: 'Sedentary',
        partOfSpeech: 'adjective',
        ipa: '/ˈsed.ən.tər.i/',
        definition: 'Tending to spend much time seated; somewhat inactive physically.',
        sinhalaDefinition: 'එකතැන වාඩි වී සිටින / ශාරීරිකව අක්‍රිය',
        notes: 'Collocates with: job, occupation, recreation, routine.',
        sinhalaNotes: 'වැඩි වෙලාවක් එකතැන වාඩි වී සිටින රැකියා හෝ ජීවන රටාවන් විස්තර කිරීමට යොදයි.',
        collocations: [
          { text: 'Sedentary occupation', sinhala: 'එකතැන වාඩි වී කරන රැකියාව' },
          { text: 'Sedentary habits', sinhala: 'ශාරීරිකව අක්‍රිය පුරුදු' },
          { text: 'Remain sedentary', sinhala: 'එකතැන වාඩි වී අක්‍රියව සිටීම' }
        ],
        exampleSentences: [
          {
            en: 'People engaged in sedentary occupations should stand and stretch every forty-five minutes.',
            si: 'අක්‍රිය හා වාඩි වී කරන රැකියාවල නියුතු පුද්ගලයින් සෑම මිනිත්තු හතළිස් පහකට වරක් නැගී සිට ඇඟ දිගහැරිය යුතුය.'
          },
          {
            en: 'Prolonged sedentary behavior has been described by epidemiologists as the new smoking.',
            si: 'දිගු වේලාවක් අක්‍රියව වාඩි වී සිටීමේ හැසිරීම වසංගතවේදීන් විසින් නූතන දුම්පානයක් ලෙස හඳුන්වා දී ඇත.'
          },
          {
            en: 'Replacing sedentary screen time with outdoor play is paramount for young children.',
            si: 'අක්‍රියව තිරය ඉදිරිපිට ගත කරන කාලය වෙනුවට එළිමහන් ක්‍රීඩා ලබාදීම කුඩා දරුවන්ට අතිශයින් වැදගත් වේ.'
          },
        ],
        practicePrompt: 'How can modern companies encourage staff in sedentary occupations to stay active?',
        bandLevel: 'Band 7.0+'
      }
    ],
    speakingChallenge: {
      part: 'PART 3 PRACTICE',
      question: 'Why do so many people today struggle to maintain a healthy lifestyle?',
      minimumTargetWords: 3,
      sampleBand9Answer: 'The struggle to maintain overall well-being in the modern era stems largely from the ubiquitous sedentary lifestyle fostered by digital technology. The majority of contemporary workers spend eight hours seated in offices, consuming fast food rather than taking time to prepare a balanced diet. Furthermore, severe workplace stress depletes their daily vitality and undermines mental resilience, leaving individuals with little energy for physical exercise after hours.',
      examinerTips: [
        'Identify systemic reasons (office culture, time constraints) rather than merely blaming individual laziness.',
        'Use sophisticated cause-and-effect connectors ("stems largely from", "fostered by", "furthermore... depletes").',
        'Employ high-level lexical items like "sedentary lifestyle", "well-being", and "vitality".'
      ]
    }
  },
  {
    id: 'lesson-7',
    number: 7,
    title: 'Technology & Innovation',
    subtitle: 'Artificial intelligence, automation, breakthrough, obsolete and digital literacy',
    category: 'Technology & Future',
    description: 'Band 8+ lexical resources for analyzing artificial intelligence, workplace automation, cyber threats, and rapid obsolescence.',
    sinhalaDescription: 'කෘත්‍රිම බුද්ධිය, ස්වයංක්‍රීයකරණය, නව සොයාගැනීම්, යල්පැන ගිය තාක්ෂණයන් සහ ඩිජිටල් සාක්ෂරතාවය පිළිබඳ වචන මාලාව.',
    bannerImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    words: [
      {
        id: 'l7-w1',
        term: 'Breakthrough',
        partOfSpeech: 'noun',
        ipa: '/ˈbreɪk.θruː/',
        definition: 'A sudden, dramatic, and important discovery or development.',
        sinhalaDefinition: 'විශිෂ්ට නව සොයාගැනීම / පෙරළිකාර ජයග්‍රහණය',
        notes: 'Frequently paired with adjectives: technological, medical, scientific, groundbreaking.',
        sinhalaNotes: 'විද්‍යාවේ හෝ තාක්ෂණයේ පෙරළියක් ඇති කළ වැදගත් නව සොයා ගැනීමක්.',
        collocations: [
          { text: 'Scientific breakthrough', sinhala: 'විද්‍යාත්මක පෙරළිකාර සොයාගැනීම' },
          { text: 'Technological breakthrough', sinhala: 'තාක්ෂණික පෙරළිය' },
          { text: 'Major breakthrough in', sinhala: '... ක්ෂේත්‍රයේ ප්‍රධාන ජයග්‍රහණයක්' }
        ],
        exampleSentences: [
          {
            en: 'Recent breakthroughs in mRNA vaccines have revolutionized preventative immunology.',
            si: 'mRNA එන්නත්වල මෑතකාලීන දියුණුව රෝග නිවාරණ ප්‍රතිශක්තිකරණයේ පෙරළියක් ඇති කර තිබේ.'
          },
          {
            en: 'Quantum computing promises a profound breakthrough in cryptographic capabilities.',
            si: 'ක්වොන්ටම් පරිගණක මඟින් දත්ත ආරක්ෂණ ක්‍රමවේදවල ගැඹුරු පෙරළියක් ඇති කිරීමට පොරොන්දු වේ.'
          },
          {
            en: 'The team achieved a monumental breakthrough after years of painstaking laboratory trials.',
            si: 'වසර ගණනාවක විද්‍යාගාර පරීක්ෂණවලින් පසු කණ්ඩායම අතිවිශිෂ්ට ඓතිහාසික පෙරළියක් අත්කර ගත්තේය.'
          },
        ],
        practicePrompt: 'Describe a modern technological breakthrough that has transformed everyday life.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l7-w2',
        term: 'Obsolete',
        partOfSpeech: 'adjective',
        ipa: '/ˈɒb.sə.liːt/',
        definition: 'No longer produced or used; out of date.',
        sinhalaDefinition: 'යල් පැන ගිය / භාවිතයෙන් ඉවත් වූ',
        notes: 'Much more academic than "old-fashioned". Used for gadgets, skills, laws, and machinery.',
        sinhalaNotes: '"Old" හෝ "outdated" වෙනුවට තාක්ෂණය හා උපකරණ සඳහා යොදන උසස් ශාස්ත්‍රීය වචනයකි.',
        collocations: [
          { text: 'Render something obsolete', sinhala: 'යමක් භාවිතයෙන් ඉවත් කර දැමීම' },
          { text: 'Virtually obsolete', sinhala: 'මුළුමනින්ම පාහේ යල්පැන ගිය' },
          { text: 'Become obsolete', sinhala: 'යල්පැන යාම' }
        ],
        exampleSentences: [
          {
            en: 'Generative AI has rendered many traditional clerical workflows virtually obsolete.',
            si: 'නිර්මාණාත්මක AI මඟින් බොහෝ සාම්ප්‍රදායික ලිපිකරු කාර්ය ප්‍රවාහයන් සම්පූර්ණයෙන්ම භාවිතයෙන් ඉවත් කර ඇත.'
          },
          {
            en: 'Videotapes and floppy disks became completely obsolete within a few short years of digital storage arriving.',
            si: 'ඩිජිටල් ගබඩා පැමිණීමත් සමඟ වීඩියෝ පට සහ ෆ්ලොපි ඩිස්ක් කෙටි කලක් තුළ මුළුමනින්ම යල්පැන ගියේය.'
          },
          {
            en: 'Unless workers continuously upskill, their professional knowledge will quickly become obsolete.',
            si: 'සේවකයින් අඛණ්ඩව නව දැනුම ලබා නොගතහොත්, ඔවුන්ගේ වෘත්තීය නිපුණතාව ඉක්මනින්ම භාවිතයෙන් ඉවතට යනු ඇත.'
          },
        ],
        practicePrompt: 'Name one everyday object that you predict will be entirely obsolete in twenty years.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l7-w3',
        term: 'State-of-the-art',
        partOfSpeech: 'adjective',
        ipa: '/ˌsteɪt.əv.ðiːˈɑːt/',
        definition: 'Incorporating the newest ideas and the most up-to-date features; cutting-edge.',
        sinhalaDefinition: 'නවතම තාක්ෂණයෙන් අනූන / අති නවීන',
        notes: 'Always hyphenated before a noun (e.g., "state-of-the-art laboratory").',
        sinhalaNotes: 'වර්තමානයේ පවතින ඉහළම හා දියුණුම තාක්ෂණය අඩංගු බව හැඟවීම.',
        collocations: [
          { text: 'State-of-the-art equipment', sinhala: 'අති නවීන උපකරණ' },
          { text: 'State-of-the-art facilities', sinhala: 'අති නවීන පහසුකම්' },
          { text: 'State-of-the-art technology', sinhala: 'නවතම තාක්ෂණය' }
        ],
        exampleSentences: [
          {
            en: 'The research university opened a state-of-the-art laboratory dedicated to clean nanotechnology.',
            si: 'පර්යේෂණ විශ්වවිද්‍යාලය පිරිසිදු නැනෝ තාක්ෂණය සඳහා කැප වූ අතිනවීන විද්‍යාගාරයක් ආරම්භ කළේය.'
          },
          {
            en: 'Equipping secondary schools with state-of-the-art computers ensures equitable education.',
            si: 'ද්විතීයික පාසල් සඳහා අතිනවීන පරිගණක ලබාදීමෙන් සාධාරණ අධ්‍යාපන අවස්ථා සහතික කෙරේ.'
          },
          {
            en: 'Hospitals require state-of-the-art diagnostic machinery to identify malignant tumors early.',
            si: 'මුල් අවධියේදීම පිළිකා හඳුනා ගැනීම සඳහා රෝහල්වලට අතිනවීන රෝග විනිශ්චය යන්ත්‍ර අවශ්‍ය වේ.'
          },
        ],
        practicePrompt: 'Describe a public facility that would benefit greatly from state-of-the-art technology.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l7-w4',
        term: 'Automation',
        partOfSpeech: 'noun',
        ipa: '/ˌɔː.təˈmeɪ.ʃən/',
        definition: 'The use of largely automatic equipment in a system of manufacturing or other production processes.',
        sinhalaDefinition: 'ස්වයංක්‍රීයකරණය / මිනිස් ශ්‍රමය වෙනුවට යන්ත්‍ර යොදා ගැනීම',
        notes: 'Associated verb: automate (e.g., "automate repetitive tasks"). Prime Task 2 essay topic.',
        sinhalaNotes: 'කර්මාන්ත ශාලා හෝ කාර්යාලවල මිනිස් මැදිහත්වීමකින් තොරව කාර්යයන් ඉටු කිරීම.',
        collocations: [
          { text: 'Workplace automation', sinhala: 'සේවා ස්ථානීය ස්වයංක්‍රීයකරණය' },
          { text: 'Widespread automation', sinhala: 'මහා පරිමාණ ස්වයංක්‍රීයකරණය' },
          { text: 'The rise of automation', sinhala: 'ස්වයංක්‍රීයකරණයේ නැගී සිටීම' }
        ],
        exampleSentences: [
          {
            en: 'While automation streamlines production lines, it risks displacing uncredentialed manual laborers.',
            si: 'ස්වයංක්‍රීයකරණය නිෂ්පාදන මාර්ග කාර්යක්ෂම කරන අතරම, සහතික නොමැති අතින් වැඩ කරන ශ්‍රමිකයන් විස්ථාපනය කිරීමේ අවදානමක් ඇත.'
          },
          {
            en: 'Self-checkout kiosks in supermarkets are a noticeable manifestation of retail automation.',
            si: 'සුපිරි වෙළඳසැල්වල ස්වයංක්‍රීය ගෙවීම් පර්යන්ත සිල්ලර වෙළඳාමේ ස්වයංක්‍රීයකරණයේ පැහැදිලි ලක්ෂණයකි.'
          },
          {
            en: 'Governments must establish retraining safety nets to shield citizens from the disruption of rapid automation.',
            si: 'වේගවත් ස්වයංක්‍රීයකරණයේ බලපෑමෙන් පුරවැසියන් ආරක්ෂා කිරීම සඳහා රජයන් ප්‍රති-පුහුණු ආරක්ෂණ දැල් ස්ථාපිත කළ යුතුය.'
          },
        ],
        practicePrompt: 'Will workplace automation create more high-skilled jobs than it destroys?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l7-w5',
        term: 'Disruptive innovation',
        partOfSpeech: 'phrase',
        ipa: '/dɪsˈrʌp.tɪv ˌɪn.əˈveɪ.ʃən/',
        definition: 'An innovation that creates a new market and value network, eventually displacing established market-leading firms.',
        sinhalaDefinition: 'වෙළඳපොළ මුළුමනින්ම වෙනස් කරන නව්‍යකරණය',
        notes: 'Economics and technology buzzword. Examples: smartphones, ride-sharing, streaming services.',
        sinhalaNotes: 'පැවති සාම්ප්‍රදායික ක්‍රම සහ සමාගම් අභිබවා අලුත්ම ක්ෂේත්‍රයක් විවෘත කරන නව සොයාගැනීම.',
        collocations: [
          { text: 'Pioneer disruptive innovation', sinhala: 'පෙරළිකාර නව්‍යකරණයට මුලපිරීම' },
          { text: 'Embrace disruptive innovation', sinhala: 'පෙරළිකාර තාක්ෂණයන් වැළඳ ගැනීම' },
          { text: 'Impact of disruptive innovation', sinhala: 'පෙරළිකාර තාක්ෂණයේ බලපෑම' }
        ],
        exampleSentences: [
          {
            en: 'Smartphone photography represents a classic disruptive innovation that decimated traditional film manufacturers.',
            si: 'ස්මාර්ට්ෆෝන් ඡායාරූපකරණය යනු සාම්ප්‍රදායික ෆිල්ම් නිෂ්පාදකයින් බිඳ දැමූ සම්භාව්‍ය පෙරළිකාර නවෝත්පාදනයකි.'
          },
          {
            en: 'Companies that dismiss disruptive innovations risk bankruptcy within a single business cycle.',
            si: 'පෙරළිකාර නවෝත්පාදනයන් නොසලකා හරින සමාගම් තනි ව්‍යාපාරික චක්‍රයක් තුළ බංකොලොත් වීමේ අවදානමකට ලක්වේ.'
          },
          {
            en: 'Ride-hailing applications represent disruptive innovations that reshaped urban mobility.',
            si: 'ටැක්සි සේවා යෙදුම් යනු නාගරික සංචලතාව මුළුමනින්ම වෙනස් කළ පෙරළිකාර නවෝත්පාදනයන් නියෝජනය කරයි.'
          },
        ],
        practicePrompt: 'Give an example of a disruptive innovation that transformed your home country.',
        bandLevel: 'Band 8.5+'
      },
      {
        id: 'l7-w6',
        term: 'Cyber security',
        partOfSpeech: 'noun',
        ipa: '/ˈsaɪ.bə sɪˌkjʊə.rə.ti/',
        definition: 'The state of being protected against the criminal or unauthorized use of electronic data.',
        sinhalaDefinition: 'සයිබර් ආරක්ෂණය / පරිගණක හා දත්ත ආරක්ෂාව',
        notes: 'Collocates with: breaches, protocols, infrastructure, vulnerabilities.',
        sinhalaNotes: 'අන්තර්ජාලය හරහා සිදුවන අනවසර දත්ත සොරකම් සහ හැකින්වලින් පරිගණක පද්ධති ආරක්ෂා කිරීම.',
        collocations: [
          { text: 'Cyber security breaches', sinhala: 'සයිබර් ආරක්ෂණ උල්ලංඝනය වීම්' },
          { text: 'Strengthen cyber security', sinhala: 'සයිබර් ආරක්ෂාව තර කිරීම' },
          { text: 'Cyber security protocols', sinhala: 'සයිබර් ආරක්ෂණ නීති පද්ධතිය' }
        ],
        exampleSentences: [
          {
            en: 'National defense doctrines now place equal emphasis on physical territorial integrity and cyber security.',
            si: 'ජාතික ආරක්‍ෂක ප්‍රතිපත්ති දැන් භෞතික භෞමික අඛණ්ඩතාව සහ සයිබර් ආරක්‍ෂාව කෙරෙහි සමසේ අවධානය යොමු කරයි.'
          },
          {
            en: 'A catastrophic cyber security breach can expose the private banking data of millions of citizens.',
            si: 'ව්‍යසනකාරී සයිබර් ආරක්ෂණ කඩවීමකින් මිලියන සංඛ්‍යාත පුරවැසියන්ගේ පුද්ගලික බැංකු දත්ත හෙළිදරව් විය හැකිය.'
          },
          {
            en: 'Financial institutions invest billions annually to shore up their cyber security defences.',
            si: 'මූල්‍ය ආයතන තම සයිබර් ආරක්‍ෂක පවුරු ශක්තිමත් කිරීම සඳහා වාර්ෂිකව බිලියන ගණන් ආයෝජනය කරයි.'
          },
        ],
        practicePrompt: 'Why has cyber security become a vital national defense priority in recent years?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l7-w7',
        term: 'Technophile',
        partOfSpeech: 'noun',
        ipa: '/ˈtek.nə.faɪl/',
        definition: 'A person who is enthusiastic about new technology.',
        sinhalaDefinition: 'නවීන තාක්ෂණයට දැඩි ඇල්මක් දක්වන පුද්ගලයා',
        notes: 'Opposite: technophobe (someone who fears or dislikes technology). Band 8+ personality descriptor.',
        sinhalaNotes: 'නවීන ගැජට්, පරිගණක හෝ යෙදුම් භාවිතයට දැඩි ප්‍රියතාවයක් දක්වන අය.',
        collocations: [
          { text: 'Avid technophile', sinhala: 'දැඩි තාක්ෂණ ලෝලියා' },
          { text: 'Appeals to technophiles', sinhala: 'තාක්ෂණ ලෝලීන් ආකර්ෂණය කර ගන්නා' },
          { text: 'Self-confessed technophile', sinhala: 'තාක්ෂණයට පෙම් බඳින්නෙකු ලෙස පිළිගත්' }
        ],
        exampleSentences: [
          {
            en: 'As an avid technophile, he queues outside flagship stores on launch mornings for every smart device.',
            si: 'තාක්ෂණයට දැඩි ඇලුම් කරන්නෙකු ලෙස, ඔහු සෑම ස්මාර්ට් උපාංගයක් සඳහාම වෙළඳසැල් ඉදිරිපිට පෝලිම්වල රැඳී සිටියි.'
          },
          {
            en: 'Technophiles often embrace early versions of software despite obvious bugs and battery drain.',
            si: 'පැහැදිලි දෝෂ සහ බැටරි බැසයාම් තිබියදීත් තාක්ෂණ ලෝලීන් මෘදුකාංගවල මුල් සංස්කරණ ඉතා උනන්දුවෙන් වැළඳ ගනී.'
          },
          {
            en: 'Bridging the divide between technophiles and technophobes is a primary goal of public digital literacy.',
            si: 'තාක්ෂණ ලෝලීන් සහ තාක්ෂණයට බිය වන අය අතර පරතරය අවම කිරීම මහජන ඩිජිටල් සාක්ෂරතාවයේ මූලික ඉලක්කයකි.'
          },
        ],
        practicePrompt: 'Would you classify yourself as a technophile or a technophobe? Explain why.',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l7-w8',
        term: 'Artificial intelligence',
        partOfSpeech: 'phrase',
        ipa: '/ˌɑː.tɪˈfɪʃ.əl ɪnˈtel.ɪ.dʒəns/',
        definition: 'The theory and development of computer systems able to perform tasks normally requiring human intelligence.',
        sinhalaDefinition: 'කෘත්‍රිම බුද්ධිය (AI)',
        notes: 'Abbreviation AI is ubiquitous, but always write "artificial intelligence" in full in IELTS academic writing.',
        sinhalaNotes: 'මිනිස් බුද්ධියෙන් සිදුකරන චින්තන කටයුතු යන්ත්‍ර මඟින් සිදුකිරීමේ තාක්ෂණය.',
        collocations: [
          { text: 'Regulate artificial intelligence', sinhala: 'කෘත්‍රිම බුද්ධිය නියාමනය කිරීම' },
          { text: 'The advent of artificial intelligence', sinhala: 'කෘත්‍රිම බුද්ධියේ සම්ප්‍රාප්තිය' },
          { text: 'Artificial intelligence algorithms', sinhala: 'කෘත්‍රිම බුද්ධි ඇල්ගොරිතම' }
        ],
        exampleSentences: [
          {
            en: 'The advent of artificial intelligence holds transformative potential for medical diagnostics and climate modeling.',
            si: 'කෘතිම බුද්ධියේ ආගමනය වෛද්‍ය රෝග විනිශ්චය සහ දේශගුණික ආකෘති නිර්මාණය සඳහා පරිවර්තනීය හැකියාවක් දරයි.'
          },
          {
            en: 'Ethicists stress that artificial intelligence must remain accountable to human oversight.',
            si: 'කෘතිම බුද්ධිය මානව අධීක්ෂණයට නිරන්තරයෙන් යටත්ව පැවතිය යුතු බව ආචාරධර්මවාදීන් අවධාරණය කරයි.'
          },
          {
            en: 'Unregulated artificial intelligence could perpetuate demographic biases embedded within training datasets.',
            si: 'නිසි නියාමනයක් නොමැති කෘතිම බුද්ධිය පුහුණු දත්තවල අඩංගු ජනගහන පක්ෂග්‍රාහීත්වයන් තවදුරටත් ඉදිරියට ගෙන යා හැක.'
          },
        ],
        practicePrompt: 'Discuss the potential ethical hazards posed by unregulated artificial intelligence.',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l7-w9',
        term: 'Algorithm',
        partOfSpeech: 'noun',
        ipa: '/ˈæl.ɡə.rɪ.ðəm/',
        definition: 'A process or set of rules to be followed in calculations or other problem-solving operations, especially by a computer.',
        sinhalaDefinition: 'ඇල්ගොරිතමය / ගැටලු විසඳීමේ පරිගණක නීති පද්ධතිය',
        notes: 'Essential for discussing social media echo chambers, search engine ranking, and targeted advertising.',
        sinhalaNotes: 'පරිගණකයක හෝ සමාජ මාධ්‍යයක තීරණ ගැනීමට සකසා ඇති ගණිතමය පියවර මාලාව.',
        collocations: [
          { text: 'Social media algorithms', sinhala: 'සමාජ මාධ්‍ය ඇල්ගොරිතම' },
          { text: 'Algorithmic bias', sinhala: 'ඇල්ගොරිතම තුළ ඇති පක්ෂග්‍රාහී බව' },
          { text: 'Complex mathematical algorithm', sinhala: 'සංකීර්ණ ගණිතමය ඇල්ගොරිතමය' }
        ],
        exampleSentences: [
          {
            en: 'Social media algorithms are deliberately engineered to maximise user engagement and screen retention time.',
            si: 'සමාජ මාධ්‍ය ඇල්ගොරිතම විශේෂයෙන් නිර්මාණය කර ඇත්තේ පරිශීලක සහභාගීත්වය සහ තිරය මත රැඳී සිටින කාලය උපරිම කිරීමටයි.'
          },
          {
            en: 'Algorithmic bias can inadvertently discriminate against minority loan applicants if historical data is flawed.',
            si: 'ඓතිහාසික දත්ත දෝෂ සහිත නම් ඇල්ගොරිතම පක්ෂග්‍රාහීත්වය සුළුතර ණය ඉල්ලුම්කරුවන්ට නොදැනුවත්වම වෙනස්කම් කළ හැකිය.'
          },
          {
            en: 'Search engines continuously refine their ranking algorithms to suppress spam and misleading news.',
            si: 'අනවශ්‍ය පණිවිඩ සහ නොමඟ යවන පුවත් මැඩපැවැත්වීම සඳහා සෙවුම් යන්ත්‍ර තම ශ්‍රේණිගත කිරීමේ ඇල්ගොරිතම නිරන්තරයෙන් පිරිපහදු කරයි.'
          },
        ],
        practicePrompt: 'How do social media algorithms shape public opinion and political polarization?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l7-w10',
        term: 'Digital literacy',
        partOfSpeech: 'phrase',
        ipa: '/ˌdɪdʒ.ɪ.təl ˈlɪt.ər.ə.si/',
        definition: 'An individual\'s ability to find, evaluate, and clearly communicate information through typing and other media on various digital platforms.',
        sinhalaDefinition: 'ඩිජිටල් සාක්ෂරතාව / පරිගණක හා අන්තර්ජාලය නිසි ලෙස භාවිත කිරීමේ හැකියාව',
        notes: 'Pairs with: cultivate, improve, lack of, curriculum.',
        sinhalaNotes: 'අන්තර්ජාලය, පරිගණක සහ තොරතුරු තාක්ෂණය නිවැරදිව හා ආරක්ෂිතව පරිහරණය කිරීමේ හැකියාව.',
        collocations: [
          { text: 'Enhance digital literacy', sinhala: 'ඩිජිටල් සාක්ෂරතාව වැඩිදියුණු කිරීම' },
          { text: 'Lack of digital literacy', sinhala: 'ඩිජිටල් සාක්ෂරතාවයේ ඌනතාවය' },
          { text: 'Promote digital literacy', sinhala: 'ඩිජිටල් සාක්ෂරතාව ප්‍රවර්ධනය කිරීම' }
        ],
        exampleSentences: [
          {
            en: 'Without adequate digital literacy, citizens are vulnerable to online financial fraud and phoney news.',
            si: 'ප්‍රමාණවත් ඩිජිටල් සාක්ෂරතාවක් නොමැතිව පුරවැසියන් අන්තර්ජාල මූල්‍ය වංචාවලට සහ ව්‍යාජ ප්‍රවෘත්තිවලට ගොදුරු වේ.'
          },
          {
            en: 'Fostering digital literacy in elderly citizens bridges social disconnection and isolation.',
            si: 'වැඩිහිටි පුරවැසියන් තුළ ඩිජිටල් සාක්ෂරතාවය වර්ධනය කිරීම සමාජ හුදකලාව හා විසන්ධිවීම දුරු කරයි.'
          },
          {
            en: 'Modern primary curriculums must incorporate digital literacy alongside fundamental numeracy.',
            si: 'නූතන ප්‍රාථමික විෂයමාලාවලට මූලික ගණිතය සමඟ ඩිජිටල් සාක්ෂරතාවද අනිවාර්යයෙන් ඇතුළත් කළ යුතුය.'
          },
        ],
        practicePrompt: 'Why is digital literacy just as critical for modern survival as basic literacy?',
        bandLevel: 'Band 7.5+'
      }
    ],
    speakingChallenge: {
      part: 'PART 3 PRACTICE',
      question: 'Do you believe artificial intelligence will make human employees obsolete?',
      minimumTargetWords: 3,
      sampleBand9Answer: 'I do not believe artificial intelligence will render the human workforce entirely obsolete, although it will inevitably trigger substantial workplace automation. While algorithms can execute repetitive analytical calculations with state-of-the-art precision, they lack genuine human empathy, ethical discernment, and creative intuition. Consequently, the advent of this disruptive innovation will simply compel professionals to upskill their digital literacy to collaborate with intelligent systems.',
      examinerTips: [
        'Present an objective, well-reasoned viewpoint acknowledging both sides (automation vs human intuition).',
        'Employ high-level lexical items: "render obsolete", "workplace automation", "disruptive innovation".',
        'Use sophisticated conjunctive adverbs ("consequently", "nevertheless", "inevitably").'
      ]
    }
  },
  {
    id: 'lesson-8',
    number: 8,
    title: 'Culture & Global Community',
    subtitle: 'Cultural heritage, assimilation, cosmopolitan, indigenous and preservation',
    category: 'Culture & Globalization',
    description: 'Band 8+ vocabulary to discuss cultural identity, globalization, loss of traditional dialects, assimilation, and historical monument preservation.',
    sinhalaDescription: 'සංස්කෘතික උරුමයන්, ගෝලීයකරණය, සම්ප්‍රදායික භාෂා රැකගැනීම සහ සංස්කෘතික අනන්‍යතාවය පිළිබඳ ඉහළ ලකුණු ලබා දෙන වචන මාලාව.',
    bannerImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    words: [
      {
        id: 'l8-w1',
        term: 'Cultural heritage',
        partOfSpeech: 'phrase',
        ipa: '/ˈkʌl.tʃər.əl ˈher.ɪ.tɪdʒ/',
        definition: 'An expression of the ways of living developed by a community and passed on from generation to generation, including customs, practices, places, and objects.',
        sinhalaDefinition: 'සංස්කෘතික උරුමය / පරම්පරාවෙන් පරම්පරාවට උරුම වූ සිරිත් විරිත් හා ස්මාරක',
        notes: 'Differentiate between tangible heritage (buildings, art) and intangible heritage (dances, oral traditions).',
        sinhalaNotes: 'අතීතයෙන් උරුම වූ ඓතිහාසික ස්ථාන, කලා නිර්මාණ සහ ජන සිරිත් විරිත්.',
        collocations: [
          { text: 'Preserve cultural heritage', sinhala: 'සංස්කෘතික උරුමය සුරැකීම' },
          { text: 'Rich cultural heritage', sinhala: 'පොහොසත් සංස්කෘතික උරුමය' },
          { text: 'UNESCO World Heritage', sinhala: 'යුනෙස්කෝ ලෝක උරුමය' },
          { text: 'Intangible cultural heritage', sinhala: 'අස්පර්ශනීය සංස්කෘතික උරුමය' }
        ],
        exampleSentences: [
          {
            en: 'Historical monuments are not mere tourist attractions; they are irreplaceable pillars of a nation\'s cultural heritage.',
            si: 'ඓතිහාසික ස්මාරක හුදු සංචාරක ආකර්ෂණ ස්ථාන පමණක් නොව, ඒවා ජාතියක සංස්කෘතික උරුමයේ ප්‍රතිස්ථාපනය කළ නොහැකි කුළුණු වේ.'
          },
          {
            en: 'Rapid globalization often homogenizes youthful entertainment, eroding ancient cultural heritage.',
            si: 'වේගවත් ගෝලීයකරණය බොහෝ විට තරුණ විනෝදාස්වාදය එකම ඒකාකාරී ස්වරූපයකට පත් කරමින් පුරාණ සංස්කෘතික උරුමය ක්ෂය කරයි.'
          },
          {
            en: 'UNESCO allocates funding to restore vulnerable cultural heritage sites devastated by natural disasters.',
            si: 'ස්වභාවික විපත්වලින් විනාශ වූ සංවේදී සංස්කෘතික උරුම ස්ථාන ප්‍රතිසංස්කරණය කිරීම සඳහා යුනෙස්කෝව අරමුදල් වෙන් කරයි.'
          },
        ],
        practicePrompt: 'Why should governments fund the preservation of ancient cultural heritage?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l8-w2',
        term: 'Assimilation',
        partOfSpeech: 'noun',
        ipa: '/əˌsɪm.ɪˈleɪ.ʃən/',
        definition: 'The process whereby individuals or groups of differing ethnic heritage are absorbed into the dominant culture of a society.',
        sinhalaDefinition: 'සංස්කෘතිකව මුසු වීම / ප්‍රධාන සංස්කෘතියට අනුගත වීම',
        notes: 'Associated verb: assimilate into. Contrast with "multiculturalism" or "cultural segregation".',
        sinhalaNotes: 'සංක්‍රමණිකයන් හෝ සුළුතර ජන කොටස් තමන් ගිය රටේ ප්‍රධාන සංස්කෘතියට හැඩගැසීමේ ක්‍රියාවලිය.',
        collocations: [
          { text: 'Cultural assimilation', sinhala: 'සංස්කෘතික සම්මිශ්‍රණය / අනුගත වීම' },
          { text: 'Facilitate assimilation', sinhala: 'අනුගත වීමේ ක්‍රියාවලිය පහසු කිරීම' },
          { text: 'Resist assimilation', sinhala: 'අනුගත වීමට විරුද්ධ වීම' }
        ],
        exampleSentences: [
          {
            en: 'Immigrants often experience pressure toward cultural assimilation while struggling to preserve their mother tongue.',
            si: 'සංක්‍රමණිකයන් බොහෝ විට තම මව්භාෂාව ආරක්ෂා කර ගැනීමට වෙහෙසෙන අතරම සංස්කෘතික උකහා ගැනීම (assimilation) සඳහා වන පීඩනයට මුහුණ දෙයි.'
          },
          {
            en: 'Language classes facilitate the social assimilation of newly arrived refugees.',
            si: 'භාෂා පන්ති අලුතින් පැමිණි සරණාගතයින් සමාජයට සුමටව අනුගත වීමට පහසුකම් සලසයි.'
          },
          {
            en: 'True multicultural societies celebrate diverse customs rather than demanding complete assimilation.',
            si: 'සැබෑ බහුසංස්කෘතික සමාජ සම්පූර්ණ උකහා ගැනීමක් ඉල්ලා සිටිනවා වෙනුවට විවිධ සිරිත් විරිත් සමරනු ලබයි.'
          },
        ],
        practicePrompt: 'Should immigrants be expected to assimilate into host cultures, or should differences be celebrated?',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l8-w3',
        term: 'Cosmopolitan',
        partOfSpeech: 'adjective',
        ipa: '/ˌkɒz.məˈpɒl.ɪ.tən/',
        definition: 'Familiar with and at ease in many different countries and cultures; including people from many different countries.',
        sinhalaDefinition: 'විශ්වීය / විවිධ ජාතීන් හා සංස්කෘතීන්ගෙන් පිරි',
        notes: 'Often describes cities: London, New York, Singapore, Toronto.',
        sinhalaNotes: 'ලෝකයේ විවිධ රටවල මිනිසුන් හා සංස්කෘතීන් එක්තැන් වූ බහුවිධ පරිසරයක්.',
        collocations: [
          { text: 'Cosmopolitan city', sinhala: 'විශ්වීය (බහුසංස්කෘතික) නගරය' },
          { text: 'Cosmopolitan outlook', sinhala: 'විශ්වීය ආකල්පය' },
          { text: 'Cosmopolitan atmosphere', sinhala: 'බහුජාතික පරිසරය' }
        ],
        exampleSentences: [
          {
            en: 'Metropolitan hubs like Singapore boast a vibrant, cosmopolitan atmosphere enriched by global culinary traditions.',
            si: 'සිංගප්පූරුව වැනි මහා නගර ලෝක ආහාර සම්ප්‍රදායන්ගෙන් පොහොසත් වූ විචිත්‍රවත්, සර්වජාතික (cosmopolitan) වාතාවරණයකින් යුක්ත වේ.'
          },
          {
            en: 'Studying abroad endows young people with an enlightened, cosmopolitan worldview.',
            si: 'විදේශයන්හි අධ්‍යාපනය ලැබීම තරුණ තරුණියන්ට බුද්ධිමත්, සර්වජාතික ලෝක දැක්මක් ලබා දෙයි.'
          },
          {
            en: 'The hotel attracts a diverse, cosmopolitan clientele of diplomats and entrepreneurs.',
            si: 'හෝටලය රාජ්‍ය තාන්ත්‍රිකයින්ගේ සහ ව්‍යවසායකයින්ගේ විවිධ වූ සර්වජාතික පාරිභෝගික පිරිසක් ආකර්ෂණය කර ගනී.'
          },
        ],
        practicePrompt: 'What are the cultural advantages of living in a cosmopolitan metropolis?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l8-w4',
        term: 'Indigenous',
        partOfSpeech: 'adjective',
        ipa: '/ɪnˈdɪdʒ.ɪ.nəs/',
        definition: 'Originating or occurring naturally in a particular place; native.',
        sinhalaDefinition: 'දේශීය / ආදිවාසී / යම් ප්‍රදේශයකට ආවේණික',
        notes: 'Applies to peoples, traditions, languages, and wildlife (e.g. "indigenous communities", "indigenous plants").',
        sinhalaNotes: 'යම් රටක හෝ කලාපයක මුල් බැසගත් මුල් වැසියන් හෝ ආවේණික දේ.',
        collocations: [
          { text: 'Indigenous peoples/communities', sinhala: 'ආදිවාසී ප්‍රජාවන්' },
          { text: 'Indigenous languages', sinhala: 'දේශීය ස්වදේශික භාෂා' },
          { text: 'Indigenous knowledge', sinhala: 'දේශීය පාරම්පරික ඥානය' }
        ],
        exampleSentences: [
          {
            en: 'Indigenous communities possess invaluable ecological wisdom regarding sustainable forest stewardship.',
            si: 'ආදිවාසී ප්‍රජාවන් සතුව තිරසාර වනාන්තර භාරකාරත්වය පිළිබඳ මිල කළ නොහැකි පාරිසරික ප්‍රඥාවක් පවතී.'
          },
          {
            en: 'Efforts are underway to document endangered indigenous languages before their last fluent speakers pass away.',
            si: 'වඳවීමේ තර්ජනයට ලක්ව ඇති ආදිවාසී භාෂා කතා කරන අවසන් කථිකයන් අභාවප්‍රාප්ත වීමට පෙර ඒවා ලේඛනගත කිරීමට කටයුතු කරමින් පවතී.'
          },
          {
            en: 'Colonial expansion frequently dispossessed indigenous tribes of their ancestral territories.',
            si: 'යටත් විජිත ව්‍යාප්තිය නිසා බොහෝ විට ආදිවාසී ගෝත්‍රිකයන්ගේ පාරම්පරික ඉඩම් ඔවුන්ට අහිමි විය.'
          },
        ],
        practicePrompt: 'Why is traditional indigenous ecological knowledge so valuable for modern conservation?',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l8-w5',
        term: 'Westernisation',
        partOfSpeech: 'noun',
        ipa: '/ˌwes.tən.aɪˈzeɪ.ʃən/',
        definition: 'The process whereby non-Western societies come under the influence of Western culture in domains such as industry, technology, law, lifestyle, and diet.',
        sinhalaDefinition: 'බටහිරකරණය / බටහිර සංස්කෘතියේ ආභාෂය පැතිරීම',
        notes: 'Associated verb: westernise. Crucial in essays debating the loss of Asian or African cultural traditions.',
        sinhalaNotes: 'ඇඳුම් පැළඳුම්, ආහාර, සංගීතය හෝ චින්තනය තුළ බටහිර රටවල සිරිත් විරිත් පැතිර යාම.',
        collocations: [
          { text: 'Rapid westernisation', sinhala: 'ශීඝ්‍ර බටහිරකරණය' },
          { text: 'Influence of westernisation', sinhala: 'බටහිරකරණයේ බලපෑම' },
          { text: 'Resist westernisation', sinhala: 'බටහිරකරණයට විරුද්ධ වීම' }
        ],
        exampleSentences: [
          {
            en: 'Rapid westernisation has led to the proliferation of American fast-food chains in traditional Asian capitals.',
            si: 'වේගවත් බටහිරකරණය නිසා සාම්ප්‍රදායික ආසියානු අගනගරවල ඇමරිකානු ක්ෂණික ආහාර ආයතන බහුල වීමට හේතු වී තිබේ.'
          },
          {
            en: 'Some cultural historians fear that uncritical westernisation erodes historic social values and collectivist norms.',
            si: 'අන්ධ බටහිරකරණය ඓතිහාසික සමාජ වටිනාකම් සහ සාමූහික සම්ප්‍රදායන් විනාශ කරනු ඇතැයි සමහර සංස්කෘතික ඉතිහාසඥයෝ බිය වෙති.'
          },
          {
            en: 'Modernization should not be confused with blind westernisation; nations can develop while preserving their roots.',
            si: 'නවීකරණය යනු අන්ධ බටහිරකරණය සමඟ පටලවා නොගත යුතුය; රටවලට තම මූලයන් ආරක්ෂා කරගනිමින් සංවර්ධනය විය හැක.'
          },
        ],
        practicePrompt: 'Is modernization synonymous with westernisation? Provide reasons and examples.',
        bandLevel: 'Band 8.0+'
      },
      {
        id: 'l8-w6',
        term: 'Preservation',
        partOfSpeech: 'noun',
        ipa: '/ˌprez.əˈveɪ.ʃən/',
        definition: 'The act or process of keeping something in existence or in its original state.',
        sinhalaDefinition: 'සුරක්ෂිත කිරීම / ආරක්ෂා කර තබා ගැනීම',
        notes: 'Associated verb: preserve. Collocates with: monuments, languages, customs, peace.',
        sinhalaNotes: 'අනාගතය උදෙසා යමක් නොවෙනස්ව, විනාශ වීමට නොදී ආරක්ෂා කිරීම.',
        collocations: [
          { text: 'Historic preservation', sinhala: 'ඓතිහාසික උරුමයන් සංරක්ෂණය කිරීම' },
          { text: 'Language preservation', sinhala: 'භාෂා සංරක්ෂණය' },
          { text: 'Preservation of peace', sinhala: 'සාමය ආරක්ෂා කර තැබීම' }
        ],
        exampleSentences: [
          {
            en: 'The preservation of minority dialects requires proactive educational policies and digital archives.',
            si: 'සුළුතර භාෂා උපභාෂා සංරක්ෂණය කිරීම සඳහා ක්‍රියාකාරී අධ්‍යාපන ප්‍රතිපත්ති සහ ඩිජිටල් ලේඛනාගාර අවශ්‍ය වේ.'
          },
          {
            en: 'Urban regeneration projects must balance modern architectural development with historical preservation.',
            si: 'නාගරික ප්‍රතිජනන ව්‍යාපෘති නවීන ගෘහ නිර්මාණ සංවර්ධනය සහ ඓතිහාසික සංරක්ෂණය සමබර කළ යුතුය.'
          },
          {
            en: 'Preservation of ancestral traditions gives younger generations a rooted sense of identity.',
            si: 'පාරම්පරික සම්ප්‍රදායන් සංරක්ෂණය කිරීම තරුණ පරම්පරාවට මුල් බැසගත් අනන්‍යතාව පිළිබඳ හැඟීමක් ලබා දෙයි.'
          },
        ],
        practicePrompt: 'Why is the preservation of dying languages a vital concern for global humanity?',
        bandLevel: 'Band 7.0+'
      },
      {
        id: 'l8-w7',
        term: 'Egalitarian',
        partOfSpeech: 'adjective',
        ipa: '/ɪˌɡæl.ɪˈteə.ri.ən/',
        definition: 'Believing in or based on the principle that all people are equal and deserve equal rights and opportunities.',
        sinhalaDefinition: 'සමානාත්මතාවාදී / සැමට සමාන අයිතිවාසිකම් හිමි විය යුතුයැයි සලකන',
        notes: 'High Band 8.5+ descriptor for societies, family structures, and legal philosophies.',
        sinhalaNotes: 'ධනවත් හෝ දුප්පත් භේදයකින් තොරව සැමට සමාන අයිතිවාසිකම් ලබා දෙන සමාජ ක්‍රමය.',
        collocations: [
          { text: 'Egalitarian society', sinhala: 'සමානාත්මතාවාදී සමාජයක්' },
          { text: 'Egalitarian principles', sinhala: 'සමානාත්මතා මූලධර්ම' },
          { text: 'Strive for an egalitarian future', sinhala: 'සමානාත්මතාවාදී අනාගතයක් උදෙසා කැපවීම' }
        ],
        exampleSentences: [
          {
            en: 'Nordic countries are widely praised for cultivating highly egalitarian social models with minimal income inequality.',
            si: 'නෝර්ඩික් රටවල් අවම ආදායම් අසමානතාවයක් සහිත ඉහළ සමානාත්මතා (egalitarian) සමාජ ආකෘති පවත්වා ගැනීම වෙනුවෙන් පුළුල් ලෙස ප්‍රශංසාවට ලක්වේ.'
          },
          {
            en: 'Modern marriages strive to be egalitarian, with partners sharing domestic chores and financial responsibilities equally.',
            si: 'නූතන විවාහයන් ගෘහස්ථ වැඩ සහ මූල්‍ය වගකීම් සමසේ බෙදා ගනිමින් සමානාත්මතාවයෙන් යුක්ත වීමට උත්සාහ කරයි.'
          },
          {
            en: 'Education is universally heralded as the greatest equalizer in creating an egalitarian democracy.',
            si: 'සමානාත්මතාවයෙන් යුතු ප්‍රජාතන්ත්‍රවාදයක් නිර්මාණය කිරීමේ ශ්‍රේෂ්ඨතම සමානකාරකය ලෙස අධ්‍යාපනය විශ්වීය වශයෙන් පිළිගැනේ.'
          },
        ],
        practicePrompt: 'How can educational equality pave the way towards a more egalitarian society?',
        bandLevel: 'Band 8.5+'
      },
      {
        id: 'l8-w8',
        term: 'Cross-cultural communication',
        partOfSpeech: 'phrase',
        ipa: '/ˌkrɒs.kʌl.tʃər.əl kəˌmjuː.nɪˈkeɪ.ʃən/',
        definition: 'A field of study and practical skill looking at how people from differing cultural backgrounds communicate and perceive the world.',
        sinhalaDefinition: 'අන්තර් සංස්කෘතික සන්නිවේදනය / විවිධ සංස්කෘතීන් අතර අදහස් හුවමාරුව',
        notes: 'Essential for global trade, diplomacy, tourism, and multicultural workspaces.',
        sinhalaNotes: 'විවිධ සංස්කෘතික පසුබිම් ඇති පුද්ගලයන් අතර සාර්ථකව හා ගෞරවනීයව අදහස් හුවමාරු කර ගැනීමේ හැකියාව.',
        collocations: [
          { text: 'Facilitate cross-cultural communication', sinhala: 'අන්තර් සංස්කෘතික සන්නිවේදනය පහසු කිරීම' },
          { text: 'Barriers to cross-cultural communication', sinhala: 'අන්තර් සංස්කෘතික සන්නිවේදන බාධක' },
          { text: 'Master cross-cultural communication', sinhala: 'අන්තර් සංස්කෘතික සන්නිවේදනය ප්‍රගුණ කිරීම' }
        ],
        exampleSentences: [
          {
            en: 'Mastering English as a global lingua franca facilitates effortless cross-cultural communication across continents.',
            si: 'ඉංග්‍රීසි ගෝලීය භාෂාවක් ලෙස ප්‍රගුණ කිරීම මහාද්වීප හරහා වෙහෙසකින් තොරව අන්තර් සංස්කෘතික සන්නිවේදනයට පහසුකම් සලසයි.'
          },
          {
            en: 'Multinational corporations conduct training workshops to preempt misunderstandings in cross-cultural communication.',
            si: 'බහුජාතික සමාගම් අන්තර් සංස්කෘතික සන්නිවේදනයේ සිදුවන වැරදි වැටහීම් කල්තියා වළක්වා ගැනීමට පුහුණු වැඩමුළු පවත්වයි.'
          },
          {
            en: 'Study exchange programmes foster mutual empathy through authentic cross-cultural communication.',
            si: 'ශිෂ්‍ය හුවමාරු වැඩසටහන් සැබෑ අන්තර් සංස්කෘතික සන්නිවේදනය තුළින් අන්‍යෝන්‍ය සහකම්පනය පෝෂණය කරයි.'
          },
        ],
        practicePrompt: 'What are the main barriers to effective cross-cultural communication in international business?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l8-w9',
        term: 'Cultural identity',
        partOfSpeech: 'phrase',
        ipa: '/ˈkʌl.tʃər.əl aɪˈden.tə.ti/',
        definition: 'The identity or feeling of belonging to a group, influenced by common heritage, language, religion, and folklore.',
        sinhalaDefinition: 'සංස්කෘතික අනන්‍යතාවය',
        notes: 'Collocates with: retain, erode, forge, strengthen, affirm.',
        sinhalaNotes: 'යම් ජන කොටසකගේ භාෂාව, සිරිත් විරිත් සහ උරුමය මත පදනම් වූ ආත්මීය අනන්‍යතාව.',
        collocations: [
          { text: 'Retain cultural identity', sinhala: 'සංස්කෘතික අනන්‍යතාවය රැකගැනීම' },
          { text: 'Loss of cultural identity', sinhala: 'සංස්කෘතික අනන්‍යතාවය අහිමි වීම' },
          { text: 'Forge a strong cultural identity', sinhala: 'ශක්තිමත් සංස්කෘතික අනන්‍යතාවයක් ගොඩනැගීම' }
        ],
        exampleSentences: [
          {
            en: 'Celebrating traditional holidays allows diaspora communities to retain a tangible connection to their cultural identity.',
            si: 'සාම්ප්‍රදායික නිවාඩු දින සැමරීම විදේශගත ප්‍රජාවන්ට තම සංස්කෘතික අනන්‍යතාවය සමඟ ස්පර්ශ්‍ය සම්බන්ධතාවක් පවත්වා ගැනීමට ඉඩ සලසයි.'
          },
          {
            en: 'Language is the single most intimate vessel of a community\'s unique cultural identity.',
            si: 'භාෂාව යනු ප්‍රජාවක සුවිශේෂී සංස්කෘතික අනන්‍යතාවයේ වඩාත්ම සමීප හා වටිනා නෞකාවයි.'
          },
          {
            en: 'Young emigrants often navigate dual cultural identities, synthesising ancestral traditions with their host nation\'s lifestyle.',
            si: 'තරුණ සංක්‍රමණිකයන් බොහෝ විට පාරම්පරික සම්ප්‍රදායන් සහ සත්කාරක ජාතියේ ජීවන රටාව මුසු කරමින් ද්විත්ව සංස්කෘතික අනන්‍යතාවක් ගොඩනඟා ගනී.'
          },
        ],
        practicePrompt: 'How does learning one\'s mother tongue help children retain their cultural identity?',
        bandLevel: 'Band 7.5+'
      },
      {
        id: 'l8-w10',
        term: 'Xenophobia',
        partOfSpeech: 'noun',
        ipa: '/ˌzen.əˈfəʊ.bi.ə/',
        definition: 'Dislike of or prejudice against people from other countries or different cultures.',
        sinhalaDefinition: 'විදේශිකයන් හෝ වෙනත් සංස්කෘතීන් කෙරෙහි ඇති බිය සහ වෛරය',
        notes: 'Pronounced zen-uh-FOE-bee-uh. High-level sociological vocabulary.',
        sinhalaNotes: 'වෙනත් රටවලින් හෝ සංස්කෘතීන්ගෙන් පැමිණි පුද්ගලයින් කෙරෙහි දක්වන අසාධාරණ බිය, අකමැත්ත හෝ විරෝධය.',
        collocations: [
          { text: 'Combating xenophobia', sinhala: 'විදේශික විරෝධයට එරෙහිව සටන් කිරීම' },
          { text: 'Rise of xenophobia', sinhala: 'විදේශික විරෝධය ඉහළ යාම' },
          { text: 'Xenophobic attitudes', sinhala: 'විදේශිකයන් කෙරෙහි ඇති වෛරී ආකල්ප' }
        ],
        exampleSentences: [
          {
            en: 'Economic hardship often creates scapegoats, giving rise to regrettable surges in xenophobia.',
            si: 'ආර්ථික දුෂ්කරතා බොහෝ විට අනවශ්‍ය ගැටුම් ඇති කරමින් විදේශිකයන් කෙරෙහි වන වෛරය සහ විදේශ භීතිකාව (xenophobia) ඉහළ නැංවීමට හේතු වේ.'
          },
          {
            en: 'Intercultural school curricula play an instrumental role in dismantling xenophobia before it takes root.',
            si: 'අන්තර් සංස්කෘතික පාසල් විෂය මාලාවන් විදේශ භීතිකාව මුල් බැස ගැනීමට පෙර එය විනාශ කිරීමේ වැදගත් කාර්යභාරයක් ඉටු කරයි.'
          },
          {
            en: 'Civic leaders must firmly denounce xenophobic rhetoric that threatens communal harmony.',
            si: 'ප්‍රජා සහජීවනයට තර්ජනයක් වන විදේශ භීතිකාව පැතිරවීමේ ප්‍රකාශයන් සිවිල් නායකයින් දැඩි ලෙස හෙළා දැකිය යුතුය.'
          },
        ],
        practicePrompt: 'What proactive steps can community leaders take to counteract rising xenophobia?',
        bandLevel: 'Band 8.5+'
      }
    ],
    speakingChallenge: {
      part: 'PART 3 PRACTICE',
      question: 'Is globalization leading to the loss of unique national cultures?',
      minimumTargetWords: 3,
      sampleBand9Answer: 'While globalization inevitably introduces widespread westernisation and ubiquitous international brands, it does not necessarily obliterate unique cultural identity. In fact, many communities actively leverage digital tools to accelerate the preservation of their intangible cultural heritage. Living in a cosmopolitan society frequently encourages cross-cultural communication rather than xenophobia, allowing individuals to appreciate indigenous traditions while participating fully in the global community.',
      examinerTips: [
        'Balance your answer: don\'t just say "yes" or "no"; acknowledge commercial westernisation while noting cultural revival.',
        'Contrast contrasting viewpoints using phrases like "while... it does not necessarily...", "in fact...".',
        'Use high-band vocabulary: "intangible cultural heritage", "cosmopolitan", "cross-cultural communication".'
      ]
    }
  },
  IMPORTED_ACADEMIC_LESSON
];

// Flat list of all words for quick lookup & dictionary
export const ALL_WORDS = LESSONS.flatMap(lesson => 
  lesson.words.map(w => ({
    ...w,
    lessonNumber: lesson.number,
    lessonTitle: lesson.title,
    lessonId: lesson.id
  }))
);
