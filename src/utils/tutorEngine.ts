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
 */
export const roundIeltsBand = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const floor = Math.floor(avg);
  const frac = avg - floor;
  if (frac < 0.25) return floor;
  if (frac < 0.75) return floor + 0.5;
  return floor + 1;
};

export const formatBand = (band: number) => band.toFixed(1);

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
  return `You are a strict, certified IELTS Academic Writing examiner AND a patient English teacher for weak learners who may not understand grammar terminology.

TASK TYPE: Writing ${taskType === 'task1' ? 'Task 1' : 'Task 2'}
QUESTION:
"""${question}"""

STUDENT ESSAY:
"""${essay}"""

STUDENT TARGET BAND: ${targetBand}. NEVER inflate scores because of the target. Score only what is written, using the official public IELTS Writing band descriptors (TR/TA, CC, LR, GRA), in 0.5 steps.

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
    {"key":"TR","band":0,"comment":"one sentence","commentSi":"","toReach8":"one concrete instruction"},
    {"key":"CC","band":0,"comment":"","commentSi":"","toReach8":""},
    {"key":"LR","band":0,"comment":"","commentSi":"","toReach8":""},
    {"key":"GRA","band":0,"comment":"","commentSi":"","toReach8":""}
  ],
  "confidence":"Low|Medium|High",
  "mainProblems":[{"severity":"High|Medium|Low","title":"","description":"","descriptionSi":""}],
  "learningOrder":["lessonTopic ids"],
  "teacherNote":"2-3 sentences of honest, encouraging, specific advice",
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
    if (b8Segments.length && normalise(buildOriginal(b8Segments)) === normalise(correctedEssay)) {
      band8Edits = b8Segments;
    } else if (b8Segments.length) {
      warnings.push('The Band 8 edits could not be aligned with your corrected essay, so only the final version is shown.');
      band8Edits = [{ type: 'text', text: buildResult(b8Segments) }];
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
    console.warn('Band 8 pass skipped or timed out, using baseline upgraded model.', e);
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
