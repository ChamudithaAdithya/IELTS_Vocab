# Phase 2 — English Correction Engine (P0)

> **Priority:** P0 (Must-Have Core Educational Engine)  
> **Primary Layer:** English Intelligence  
> **Deliverable:** A structured, context-aware grammar analyzer that listens to every completed speaking turn, classifies mistakes accurately, explains *what* was wrong and *why*, and displays clean correction cards without breaking conversational warmth.

---

## 1. P0.3 — Grammar Correction After Every Speaking Turn

**Objective:** Analyze every finalized user turn and surface meaningful, genuinely helpful English improvements.

### Core Grammar Categories to Detect

| Category | Code | Incorrect Example | Corrected Example |
| :--- | :--- | :--- | :--- |
| **Tenses** | `VERB_TENSE` | `I go yesterday` | `I went yesterday` |
| **Articles** | `ARTICLES` | `I bought book` | `I bought a book` |
| **Prepositions** | `PREPOSITIONS` | `Interested on` | `Interested in` |
| **Subject-Verb Agreement** | `SVA` | `She go` | `She goes` |
| **Verb Forms** | `VERB_FORMS` | `I have went` | `I have gone` |
| **Plurals** | `PLURALS` | `Many student` | `Many students` |
| **Sentence Structure** | `SENTENCE_STRUCTURE` | `Because I was tired.` *(fragment)* | `I stayed home because I was tired.` |
| **Word Choice / Collocation** | `WORD_CHOICE` | `I did a party` | `I had a party` |
| **Word Order** | `WORD_ORDER` | `I like very much it` | `I like it very much` |
| **Conditionals** | `CONDITIONALS` | `If I will go` | `If I go` |

### Additional Language Signals
- Incorrect vocabulary usage and awkward word combinations.
- Unnatural phrasing (grammatically okay, but not idiomatic).
- Word/phrase repetition (`I think, I think...`) and incomplete fragments.
- Opportunities to improve sentence complexity.

### Critical 4-Way Classification Rule
Every piece of feedback **must** be explicitly typed so the learner is never falsely told that valid English is "wrong":

| Label / Severity | Meaning | Example |
| :--- | :--- | :--- |
| **🔴 Incorrect (`GRAMMAR_ERROR`)** | Genuine grammatical or structural error | `"She don't like coffee."` $\rightarrow$ `"She doesn't like coffee."` |
| **🟡 Unnatural (`UNNATURAL`)** | Grammatically valid, but uncommon among fluent speakers | `"I am having a doubt."` $\rightarrow$ `"I have a question."` |
| **🔵 Alternative (`ALTERNATIVE`)** | Another equally valid way to say the same thing | `"I was very tired."` $\rightarrow$ `"I felt exhausted."` |
| **🟣 Advanced (`ADVANCED`)** | Higher-register / Band 8+ expression (not "more correct") | `"Very interesting"` $\rightarrow$ `"Absolutely captivating"` |

### Correction Card Presentation Blueprint

```text
Your Speaking Feedback · 2 improvements
────────────────────────────────────────────────────────────
ORIGINAL SENTENCE
"Yesterday I go to university and meet my friends."

CORRECTED SENTENCE
"Yesterday I went to university and met my friends."

Detected Mistakes
1. "go"    [Verb Tense · Incorrect]   →  Correct: "went"
   The sentence refers to yesterday, so the past tense is needed.

2. "meet"  [Verb Tense · Incorrect]   →  Correct: "met"
   The second action also happened in the past.

[🎙️ Practice Corrected Sentence ("Try Again")]
```

---

## 2. P0.4 — Explain What Was Wrong and Why

**Objective:** Correction without clear reasoning creates passive reading rather than lasting habit change.

### Required Fields for Every Detected Mistake

| Field | Purpose |
| :--- | :--- |
| `original` | Exact phrase the user spoke |
| `correction` | Exact corrected phrase |
| `category` | Mistake taxonomy code (`VERB_TENSE`, `ARTICLES`, etc.) |
| `severity` | `GRAMMAR_ERROR` \| `UNNATURAL` \| `ALTERNATIVE` \| `ADVANCED` |
| `explanation` | Plain-English explanation of *why* the original is wrong |
| `grammar_rule` | Concise reusable rule name / formula |
| `example` | Additional natural sentence applying the rule |
| `learning_tip` | Memorable takeaway to avoid repeating the mistake |
| `confidence` | Model confidence (`0.0 – 1.0`) for gating uncertain detections |

### Example: Detailed Explanation Expansion
- **User:** *"I have went to Colombo yesterday."*
- **Corrected:** *"I went to Colombo yesterday."*
- **What is wrong?** You used the present perfect structure with a specific finished past-time expression (`yesterday`).
- **Grammar rule:** Present perfect (`have / has + past participle`) vs. Simple past (`subject + past verb`).
- **Why necessary?** `"Yesterday"` pins the action to a finished point in the past, requiring simple past.
- **More examples:**
  - *I went to school yesterday.*
  - *She visited her grandmother last week.*
  - *They watched a movie two days ago.*
- **Remember:** With `"yesterday"`, `"last week"`, or `"two days ago"`, use simple past for completed actions.

### Optional Verbal Explanation (Voice Coach Mode)
Users can optionally tap **"🔊 Explain Aloud"** (never interrupting normal chat automatically):
> *"By the way, you said 'I have went'. The correct form is 'I have gone', because we always use the past participle after 'have'."*

---

## 3. Dedicated Grammar Engine Contract (Decoupled from Chat Prompt)

Do **not** mix friend conversation and grammar analysis in a single unstructured prompt. Send a structured request to a dedicated Grammar Analysis service/module:

### Input Payload
```json
{
  "original_transcript": "Yesterday I go to university.",
  "conversation_context": "The user is talking about yesterday's activities.",
  "correction_mode": "balanced",
  "language": "en"
}
```

### Structured Output Payload
```json
{
  "corrected_sentence": "Yesterday I went to university.",
  "mistakes": [
    {
      "original": "go",
      "correction": "went",
      "category": "VERB_TENSE",
      "severity": "GRAMMAR_ERROR",
      "explanation": "The action happened in the past.",
      "grammar_rule": "Simple Past Tense",
      "example": "I went to school yesterday.",
      "learning_tip": "When using 'yesterday', switch action verbs to past tense.",
      "confidence": 0.98
    }
  ],
  "natural_expression": null,
  "learning_recommendation": "Practise irregular past-tense verbs."
}
```

---

## 4. Strict Validation Rules & QA Dataset

The Grammar Engine **must enforce** these 10 validation invariants:
1. Preserve the user's original meaning completely.
2. Never invent facts or rewrite ideas the user did not express.
3. Never alter already-correct sentences unnecessarily.
4. Use conversation context (tense, subject, prior question) before judging errors.
5. Strictly separate `GRAMMAR_ERROR` from `UNNATURAL` / `ADVANCED`.
6. Deduplicate overlapping mistake spans.
7. Always return strict schema-valid JSON renderable by the UI.
8. Include `confidence` and uncertainty flags to prevent false positives.
9. Accept valid British (`travelling`, `colour`, `have got`) and American (`traveling`, `color`) variations equally.
10. Never output contradictory explanations across rules.

### Pre-Deployment Grammar Evaluation Dataset
Build and test against a curated benchmark set covering:
- Grammatically correct everyday & complex sentences (must yield `0` false errors).
- Single-mistake and multi-mistake sentences across all 10 categories.
- Grammatically correct but non-idiomatic regional expressions (must classify as `UNNATURAL`, not `GRAMMAR_ERROR`).
- Ambiguous/clipped STT transcripts (must defer gracefully rather than falsely penalizing).
