import { Lesson, QuizQuestion, Word } from '../types';
import { ALL_WORDS } from '../data/lessons';

export function generateQuizForLesson(lesson: Lesson): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const words = lesson.words;

  words.forEach((word, idx) => {
    // Generate other distractors
    const otherWords = ALL_WORDS.filter(w => w.id !== word.id);
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);

    // Question 1: Definition or Sinhala Meaning
    if (idx % 2 === 0) {
      // Pick English Definition -> Guess the word
      const distractorTerms = shuffledOthers.slice(0, 3).map(w => w.term);
      const options = [word.term, ...distractorTerms].sort(() => Math.random() - 0.5);

      questions.push({
        id: `q-${word.id}-def`,
        type: 'definition',
        wordId: word.id,
        term: word.term,
        question: `Which Band 7+ word matches this definition?\n"${word.definition}"`,
        options,
        correctAnswer: word.term,
        explanation: `${word.term} (${word.partOfSpeech}): ${word.definition}`,
        sinhalaExplanation: `සිංහල තේරුම: ${word.sinhalaDefinition}`,
      });
    } else {
      // Pick Sinhala meaning -> Guess the word
      const distractorTerms = shuffledOthers.slice(0, 3).map(w => w.term);
      const options = [word.term, ...distractorTerms].sort(() => Math.random() - 0.5);

      questions.push({
        id: `q-${word.id}-sinhala`,
        type: 'definition',
        wordId: word.id,
        term: word.term,
        question: `මෙම සිංහල තේරුමට ගැලපෙන IELTS Band 7+ වචනය කුමක්ද?\n"${word.sinhalaDefinition}"`,
        options,
        correctAnswer: word.term,
        explanation: `English: ${word.term} - ${word.definition}`,
        sinhalaExplanation: `${word.term}: ${word.sinhalaDefinition}`,
      });
    }

    // Question 2: Collocation or Sentence Gap
    if (word.collocations.length > 0) {
      const targetCollocation = word.collocations[0];
      // Create a prompt where the target word is replaced by a blank in the collocation or example sentence
      const rawSentence = word.exampleSentences[0];
      const sentence = typeof rawSentence === 'string' ? rawSentence : rawSentence?.en;
      const regex = new RegExp(`\\b${word.term}\\b`, 'i');
      
      if (sentence && regex.test(sentence)) {
        const maskedSentence = sentence.replace(regex, '_______');
        const distractorTerms = shuffledOthers.slice(0, 3).map(w => w.term);
        const options = [word.term, ...distractorTerms].sort(() => Math.random() - 0.5);

        questions.push({
          id: `q-${word.id}-sentence`,
          type: 'sentence_gap',
          wordId: word.id,
          term: word.term,
          question: `Fill in the missing Band 7+ word:\n"${maskedSentence}"`,
          options,
          correctAnswer: word.term,
          explanation: `Full sentence: "${sentence}"`,
          sinhalaExplanation: `අදාළ සන්ධර්භය: ${word.sinhalaDefinition}`,
        });
      } else {
        // Collocation question
        const phraseParts = targetCollocation.text.split(' ');
        const distractorTerms = shuffledOthers.slice(0, 3).map(w => w.term);
        const options = [word.term, ...distractorTerms].sort(() => Math.random() - 0.5);

        questions.push({
          id: `q-${word.id}-colloc`,
          type: 'collocation',
          wordId: word.id,
          term: word.term,
          question: `Complete the authentic collocation: "${targetCollocation.text.replace(new RegExp(`\\b${word.term}\\b`, 'i'), '_______')}" (${targetCollocation.sinhala})`,
          options,
          correctAnswer: word.term,
          explanation: `Authentic collocation: "${targetCollocation.text}" (${targetCollocation.sinhala})`,
          sinhalaExplanation: `නිරවද්‍ය යෙදුම: ${targetCollocation.sinhala}`,
        });
      }
    }
  });

  // Limit to 10 balanced questions per quiz
  return questions.slice(0, 10);
}
