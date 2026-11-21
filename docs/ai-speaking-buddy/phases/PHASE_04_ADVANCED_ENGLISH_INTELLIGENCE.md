# Phase 4 — Advanced English Intelligence (P2)

> **Priority:** P2 (Advanced Personalization & Accessibility)  
> **Primary Layers:** English Intelligence + Learning Intelligence  
> **Deliverable:** A complete English improvement platform featuring phoneme-aware pronunciation & fluency diagnostics, weekly progress reports, and clear Sinhala (`සිංහල`) grammar & vocabulary explanations.

---

## 1. P2.1 — Pronunciation & Fluency Analysis

**Objective:** Evaluate *how* the user speaks separately from *what* grammar they used.

> [!IMPORTANT]
> **Architectural Rule:** Ordinary Speech-to-Text confidence scores are **NOT** sufficient to judge pronunciation quality. Pronunciation scoring must compare actual recorded audio against reference phonetics (via phoneme-level alignment or dedicated pronunciation assessment services such as Azure Speech Pronunciation Assessment / Whisper acoustic alignment).

### A. Pronunciation Analysis Dimensions
- Mispronounced target words and unclear/dropped sounds.
- Word stress & syllable stress (e.g., **`COM-for-ta-ble`** — coaching middle-syllable reduction).
- Difficult consonants and vowel length distinctions.
- Connected speech, linking, and natural contractions.
- **Practice Loop:** `Listen to Reference → Repeat Aloud → Compare Audio & Stress`.

### B. Fluency Metrics Suite

| Metric | What It Measures |
| :--- | :--- |
| **Speaking Speed** | Words per minute (WPM) |
| **Pauses** | Pause frequency and average duration |
| **Hesitation** | Unnecessary mid-clause stops and vocalized fillers (`um`, `uh`) |
| **Repetition** | Repeated words and restarted phrases |
| **Self-Correction** | Frequency of mid-sentence restarts |
| **Sentence Length** | Average words per spoken sentence |
| **Response Development** | How fully ideas and reasons are elaborated |

### C. Coaching Principle
- Never equate speaking *faster* with *better fluency*. Clarity, rhythm, natural pausing, and coherent thought groups matter most.
- Example recommendation: *"You speak at a comfortable pace, but pause frequently while searching for adjectives. Try 3-minute topic chats on technology or travel this week."*

---

## 2. P2.2 — Weekly English Improvement Reports

**Objective:** Give learners motivating, honest, evidence-based visibility into their 7-day progress.

### Weekly Report Card Layout
```text
WEEKLY ENGLISH REPORT · 7-Day Learning Summary
───────────────────────────────────────────────────────────
145 min spoken  |  1,850 words  |  68 mistakes corrected  |  24 new expressions

Grammar Accuracy Trend (Mon → Sun):  [Normalized Error Rate Chart]

Weekly Achievement:
✓ Your past-tense mistakes dropped noticeably this week. Keep practising irregular verbs!

Next Week's Focus:
• Practise articles (a / an / the)
• Expand sentence complexity with "although" & "whereas"
• Use 5 newly saved collocations in conversation
• Complete 3 casual speaking sessions
```

### Report Sections
1. Speaking activity (sessions, minutes, total words).
2. Grammar accuracy trend (normalized error rate per 100 words).
3. Top recurring mistakes vs. resolved mistakes.
4. Vocabulary & collocation growth.
5. Pronunciation & fluency highlights.
6. Week-over-week comparison.
7. Personalized next-week action plan.

> **Integrity Guardrail:** Weekly statistics are **learning analytics**, not official IELTS Band scores. Never display a claimed IELTS Band jump unless produced by a validated IELTS mock assessment.

---

## 3. P2.3 — Sinhala (`සිංහල`) Explanations for Difficult Grammar Concepts

**Objective:** Make complex grammar immediately intuitive for Sri Lankan learners who understand English examples but find dense English grammar terminology hard to absorb.

### Four Explanation Language Modes
1. **English Only**
2. **Simple English**
3. **English + Sinhala (`සිංහල`)** *(Recommended for ESL learners)*
4. **Sinhala Focused**

### Example Bilingual Grammar Card
- **User Said:** `"I have went to school."`
- **Corrected:** `"I have gone to school."`
- **Simple English:** After `"have"`, we need the past participle (`V3`), not the simple past (`V2`).
- **Sinhala Explanation:** `"Have"` යන helping verb එකෙන් පසුව සාමාන්‍යයෙන් භාවිතා කළ යුත්තේ verb එකේ past participle (`V3`) ආකාරයයි.

| Verb Form | Example |
| :---: | :--- |
| **V1 (Base)** | `Go` |
| **V2 (Simple Past)** | `Went` |
| **V3 (Past Participle)** | `Gone` |

- **More Examples:** *I have eaten.* · *She has written.* · *They have gone.*

### Specialized Sinhala Learner Features
- Clear Sinhala explanations of grammar terms (tense, participle, countable vs. uncountable nouns).
- Sinhala meanings for newly saved vocabulary and idioms.
- Structural comparisons between Sinhala and English word order / prepositions.
- Targeted notes for frequent Sinhala-to-English transfer patterns (e.g., *"I am having a doubt"* $\rightarrow$ *"I have a question"*, *"went to shopping"* $\rightarrow$ *"went shopping"*, *"lots of works"* $\rightarrow$ *"a lot of work"*).

> **Quality Rule:** Sinhala explanations must explain the **underlying grammar concept clearly**, never just output literal word-for-word machine translations.
