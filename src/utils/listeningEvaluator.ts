import type { ListeningItem, ListeningAIReport, ListeningQuestionFeedback } from '../types/tutor';

/**
 * Normalizes text for comparison (strips punctuation, trims whitespace, lowercases).
 */
function normalizeAnswer(str: string): string {
  return str
    .toLowerCase()
    .replace(/[£$,.?!]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if two IELTS listening answers match, allowing for common IELTS equivalent formats
 * (e.g. "12th" vs "12", "high-visibility" vs "high visibility", alternatives with "//" or brackets).
 */
function isEquivalentAnswer(user: string, official: string): boolean {
  if (!user || !official) return false;
  const u = normalizeAnswer(user);
  if (!u) return false;

  // Split on // or ' or '
  const rawAlternatives = official.split(/\/\/|\sor\s/);
  const candidates: string[] = [];
  rawAlternatives.forEach(alt => {
    candidates.push(alt);
    // Remove words in brackets: e.g. "(musical) instruments" -> "instruments"
    const noBrackets = alt.replace(/\(.*?\)/g, '').trim();
    if (noBrackets) candidates.push(noBrackets);
    // Remove bracket characters: e.g. "(musical) instruments" -> "musical instruments"
    const strippedBrackets = alt.replace(/[()]/g, '').trim();
    if (strippedBrackets) candidates.push(strippedBrackets);
    // Slash variants: e.g. "student/hostel" -> "student", "hostel"
    if (alt.includes('/')) {
      alt.split('/').forEach(part => {
        if (part.trim()) candidates.push(part.trim());
      });
    }
  });

  const numWords: Record<string, string> = {
    '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
    '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten'
  };

  for (const cand of candidates) {
    const o = normalizeAnswer(cand);
    if (u === o) return true;

    // Check number words: '3' vs 'three'
    if (numWords[u] && numWords[u] === o) return true;
    if (numWords[o] && numWords[o] === u) return true;

    // Ordinal numbers (12th -> 12, 21st -> 21)
    const stripOrdinal = (s: string) => s.replace(/(st|nd|rd|th)$/, '');
    if (stripOrdinal(u) === stripOrdinal(o)) return true;

    // Hyphen vs space (high-visibility vs high visibility)
    if (u.replace(/-/g, ' ') === o.replace(/-/g, ' ')) return true;

    // Singular vs plural tolerance check
    if (u + 's' === o || u === o + 's') return true;
  }

  return false;
}

/**
 * Performs a comprehensive Cambridge IELTS AI Evaluation on student's listening answers.
 */
export function evaluateListeningPerformance(
  test: ListeningItem,
  userAnswers: Record<number, string>
): ListeningAIReport {
  let score = 0;
  let distractorTrapCount = 0;
  let spellingSlipCount = 0;
  let omissionCount = 0;

  const total = test.questions.length;
  const breakdown: ListeningQuestionFeedback[] = [];

  test.questions.forEach(q => {
    const rawUser = (userAnswers[q.number] || '').trim();
    const correct = q.answer;
    const isCorrect = isEquivalentAnswer(rawUser, correct);

    let errorType: ListeningQuestionFeedback['errorType'] = 'other';
    let feedback = '';
    let feedbackSi = '';

    if (isCorrect) {
      score++;
      errorType = 'correct';
      feedback = `Spot-on! Correct answer identified without falling for audio traps.`;
      feedbackSi = `නිවැරදියි! ශ්‍රව්‍ය රැවටිලිවලට හසු නොවී නිවැරදි පිළිතුර ලබාගෙන ඇත.`;
    } else if (!rawUser) {
      omissionCount++;
      errorType = 'omission';
      feedback = `Unanswered item. The official speaker stated: "${correct}".`;
      feedbackSi = `පිළිතුරක් සටහන් කර නොමැත. නිවැරදි පිළිතුර: "${correct}".`;
    } else {
      // Check if user fell for a known distractor trap
      const matchedDistractor = q.distractors.find(d => isEquivalentAnswer(rawUser, d));
      if (matchedDistractor) {
        distractorTrapCount++;
        errorType = 'distractor_trap';
        feedback = `Cambridge Distractor Trap: You wrote "${rawUser}", which the speaker initially uttered before correcting themselves to "${correct}".`;
        feedbackSi = `කේම්බ්‍රිජ් රැවටිල්ලකි (Trap): කථිකයා පළමුවෙන් "${rawUser}" පැවසුවද, පසුව එය "${correct}" ලෙස නිවැරදි කරන ලදී.`;
      } else {
        // Check spelling difference
        const uNorm = normalizeAnswer(rawUser);
        const oNorm = normalizeAnswer(correct);
        if (
          uNorm.length > 2 &&
          oNorm.length > 2 &&
          (uNorm.startsWith(oNorm.slice(0, 3)) || oNorm.startsWith(uNorm.slice(0, 3)))
        ) {
          spellingSlipCount++;
          errorType = 'spelling_grammar';
          feedback = `Phonetic/Spelling mismatch: You wrote "${rawUser}", but official spelling is "${correct}". In IELTS Listening, spelling must be 100% accurate.`;
          feedbackSi = `අක්ෂර වින්‍යාසයේ දෝෂයකි: ඔබ "${rawUser}" ලියූ නමුත් නිවැරදි අක්ෂර වින්‍යාසය "${correct}" වේ.`;
        } else {
          errorType = 'other';
          feedback = `Acoustic miscomprehension. You wrote "${rawUser}", while the speaker said "${correct}".`;
          feedbackSi = `ශ්‍රව්‍ය අවබෝධයේ දෝෂයකි. නිවැරදි පිළිතුර: "${correct}".`;
        }
      }
    }

    breakdown.push({
      number: q.number,
      userAnswer: rawUser || '(blank)',
      correctAnswer: correct,
      isCorrect,
      errorType,
      feedback,
      feedbackSi
    });
  });

  const accuracyPercentage = Math.round((score / total) * 100);

  // Scaled 9-Band Listening formula
  let bandScore = 5.0;
  if (accuracyPercentage === 100) bandScore = 9.0;
  else if (accuracyPercentage >= 85) bandScore = 8.5;
  else if (accuracyPercentage >= 75) bandScore = 8.0;
  else if (accuracyPercentage >= 65) bandScore = 7.5;
  else if (accuracyPercentage >= 50) bandScore = 6.5;
  else if (accuracyPercentage >= 35) bandScore = 6.0;

  // Distractor Vulnerability
  let distractorVulnerability: 'Low' | 'Medium' | 'High' = 'Low';
  if (distractorTrapCount >= 2) distractorVulnerability = 'High';
  else if (distractorTrapCount === 1) distractorVulnerability = 'Medium';

  // Executive summary
  let executiveSummary = '';
  let executiveSummarySi = '';

  if (bandScore >= 8.5) {
    executiveSummary = `Outstanding listening comprehension! You demonstrated exceptional acoustic acuity, resisted Cambridge distractor traps, and captured precise spellings and numbers seamlessly.`;
    executiveSummarySi = `විශිෂ්ට ශ්‍රවණ කුසලතාවක්! ඔබ සියලු ශ්‍රව්‍ය රැවටිලි හඳුනාගෙන නිවැරදි පිළිතුරු හා අක්ෂර වින්‍යාසය ලබාගෙන ඇත.`;
  } else if (bandScore >= 7.0) {
    executiveSummary = `Strong competence with minor acoustic or distractor slips. Your primary target is to watch for mid-sentence corrections where speakers revise initial figures or dates.`;
    executiveSummarySi = `හොඳ මට්ටමක පවතී. කථිකයා සංඛ්‍යා හෝ දිනයන් වෙනස් කරන අවස්ථා (self-corrections) පිළිබඳව වැඩි අවධානයක් යොමු කරන්න.`;
  } else {
    executiveSummary = `Developing listening skills. Focus on note-completion techniques, identifying signpost language, and pre-reading questions to predict whether a noun, date, or number is required.`;
    executiveSummarySi = `ශ්‍රවණ හැකියාව තවදුරටත් පුහුණු විය යුතුය. ප්‍රශ්නයට අවශ්‍ය වන්නේ නාම පදයක්ද, දිනයක්ද යන්න කලින් හඳුනාගන්න.`;
  }

  // Acoustic Advice based on Section
  let acousticAnalysis = '';
  let acousticAnalysisSi = '';

  if (test.section === 1) {
    acousticAnalysis = `Section 1 focuses on daily social dialogue. Watch out for rapid number recitation (e.g. 077 vs double-7), spelled-out surnames, and currency distractors where standard vs discounted rates are contrasted.`;
    acousticAnalysisSi = `Section 1 හි සාමාන්‍ය සංවාද අඩංගු වේ. දුරකථන අංක, නම් අකුරු කිරීම සහ මිල ගණන් වෙනස් වන රැවටිලි පිළිබඳව විමසිලිමත් වන්න.`;
  } else if (test.section === 2) {
    acousticAnalysis = `Section 2 features a single speaker delivering local orientation. Key challenges are directional spatial prepositions and facility schedules with opening and closing times.`;
    acousticAnalysisSi = `Section 2 හි තනි කථිකයෙකු මඟ පෙන්වීම් ලබාදෙයි. වේලාවන් සහ උපදෙස් කෙරෙහි අවධානය යොමු කරන්න.`;
  } else if (test.section === 3) {
    acousticAnalysis = `Section 3 involves academic multi-speaker debates. Listen for transition cues like "Having said that...", "On the contrary", and agreements vs disagreements between students.`;
    acousticAnalysisSi = `Section 3 හි ශාස්ත්‍රීය වාද විවාද ඇතුළත් වේ. සිසුන් එකඟ වන සහ එකඟ නොවන කරුණු වෙන්කර හඳුනාගන්න.`;
  } else {
    acousticAnalysis = `Section 4 is an uninterrupted academic lecture. Focus on signposting discourse markers ("Turning now to...", "What is pivotal here is...") to navigate dense factual information.`;
    acousticAnalysisSi = `Section 4 හි අඛණ්ඩ ශාස්ත්‍රීය දේශනයක් ඇතුළත් වේ. ප්‍රධාන සංකල්ප සහ පාරිභාෂික වචන අල්ලා ගැනීමට මඟපෙන්වන වචන (signposts) අනුගමනය කරන්න.`;
  }

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendedDrills: string[] = [];

  if (score > 0) {
    strengths.push(`Accurately retrieved ${score} of ${total} spoken answers.`);
  }
  if (distractorTrapCount === 0) {
    strengths.push(`Resisted 100% of Cambridge distractor traps.`);
  } else {
    weaknesses.push(`Fell for ${distractorTrapCount} Cambridge distractor trap(s).`);
    recommendedDrills.push(`Cambridge Distractor Drill: Wait until the speaker finishes the full thought before recording the final answer.`);
  }

  if (spellingSlipCount > 0) {
    weaknesses.push(`Lost marks on ${spellingSlipCount} spelling or plural 's' slips.`);
    recommendedDrills.push(`IELTS Spelling Bank: Practice double letters (accommodation, committee, questionnaire).`);
  }

  if (omissionCount > 0) {
    weaknesses.push(`Left ${omissionCount} question(s) unattempted.`);
    recommendedDrills.push(`Prediction Technique: Read the question stem during the 30-second silent buffer to predict word type.`);
  }

  return {
    score,
    total,
    bandScore,
    accuracyPercentage,
    distractorVulnerability,
    executiveSummary,
    executiveSummarySi,
    acousticAnalysis,
    acousticAnalysisSi,
    questionBreakdown: breakdown,
    strengths,
    weaknesses,
    recommendedDrills
  };
}

