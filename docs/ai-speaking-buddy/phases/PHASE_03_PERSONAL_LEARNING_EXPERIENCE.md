# Phase 3 — Personal Learning Experience (P1)

> **Priority:** P1 (High-Value Personalization & Active Learning)  
> **Primary Layers:** English Intelligence + Learning Intelligence  
> **Deliverable:** A personalized speaking companion with controllable correction intensity, vocabulary & collocation coaching, cross-session memory, recurring mistake tracking, and active *"Try Again"* practice.

---

## 1. P1.1 — Three Correction Intensity Modes

Users control how actively corrections appear without affecting the truthfulness of the underlying grammar analyzer:

| Mode | Target Learner | Feedback Depth |
| :--- | :--- | :--- |
| **Mode A — Gentle** | Learners building confidence or nervous about mistakes | Only 1–2 major clarity-impacting mistakes per turn (`go → went`, `buyed → bought`). Zero interruption; no lengthy grammar lectures unless clicked. |
| **Mode B — Balanced** *(Recommended Default)* | Everyday learners seeking steady growth | Meaningful grammar mistakes, unnatural expressions, clear concise explanations, selective vocabulary upgrades, and recurring mistake tracking. |
| **Mode C — Detailed** | Intensive learners & IELTS Band 7.5+ candidates | Every meaningful grammar, article, preposition, sentence structure, and word-choice issue with full rules, alternative expressions, extra examples, and practice prompts. |

> **Implementation Invariant:** Changing intensity filters **how much** feedback is surfaced and expanded — it never downgrades accuracy or marks valid English as wrong.

---

## 2. P1.2 — Vocabulary & Natural-Expression Suggestions

**Objective:** Help learners evolve from repetitive basic adjectives to fluent, idiomatic English.

### Example Flow
- **User:** *"The movie was very good. I really liked it. It was very interesting."*
- **Vocabulary Improvement Card:**
  - **Original:** `Very good` / `Very interesting`
  - **Upgrades:** `Excellent` *(common)* · `Fascinating` *(engaging)* · `Captivating` *(holds full attention)*
  - **More Natural Sentence:** *"The movie was absolutely fascinating. I was captivated by its storyline."*

### Core Capabilities
1. **Basic Word Upgrade Detector:** Scans for overused words (`good`, `bad`, `nice`, `interesting`, `very`, `big`, `small`, `important`, `happy`, `sad`) and suggests context-matched alternatives.
2. **Collocation Coaching:**
   | Unnatural / Non-Idiomatic | Natural Collocation |
   | :--- | :--- |
   | `do a mistake` | `make a mistake` |
   | `strong rain` | `heavy rain` |
   | `big traffic` | `heavy traffic` |
   | `take a decision` *(regionally accepted in UK/South Asia — mark as optional style note, not error)* | `make a decision` |
   | `highly interesting` | `very / extremely interesting` |
3. **Personal Vocabulary Collection (Save 1-Click):** Each saved item stores:
   - Word or phrase
   - Simple English explanation
   - Optional Sinhala meaning
   - Context example sentence
   - Synonyms & pronunciation audio
   - Date learned
4. **Natural Expression Comparison:** Side-by-side *"What I said"* vs. *"How a fluent speaker expresses it"* + why it sounds smoother.

---

## 3. P1.3 — Conversation Memory (Cross-Session Continuity)

**Objective:** Ensure the companion never feels like a stranger resetting to zero on every login.

### Three-Tier Memory Architecture

| Tier | Scope | What It Stores |
| :--- | :--- | :--- |
| **Short-Term Memory** | Active turn window | Last 6–12 messages for immediate conversational coherence |
| **Session Memory** | Current session | Active topic, mood, mistakes already mentioned this session |
| **Long-Term Memory** | Cross-session profile | Stable interests (*software engineering*, *React*, *travelling*), preferred style, vocabulary level, and recurring grammar needs |

#### Continuity Example
- **Day 1 — User:** *"I'm currently learning React and TypeScript."*
- **Day 3 — AI Buddy:** *"Hey! How is your React learning going? Did you manage to build that component you were working on?"*

### Mandatory Privacy Controls
- Users can inspect every saved memory item in a transparent **Memory Panel**.
- Users can delete individual memories or wipe conversation history in 1 click.
- Toggle switch to disable long-term personalization completely.
- Never store raw spoken sentences indiscriminately as personal facts; store **learning analytics** separately from **personal conversation memories**.

---

## 4. P1.4 — Recurring Mistake Tracking & Normalized Error Rate

**Objective:** Spot persistent error patterns across weeks so learners actually eliminate chronic habits.

### Normalized Error Rate Formula
Never judge progress by raw mistake counts alone (a 500-word chat naturally has more errors than a 50-word chat). Track normalized rate:

$$\text{Error Rate} = \frac{\text{Confirmed Errors}}{\text{Analyzed Words}} \times 100$$

### Capabilities
- **Mistake Frequency Dashboard:** Aggregates top recurring categories (e.g., *Past tense: 12*, *Articles: 9*, *Prepositions: 7*, *Verb forms: 4*).
- **Recurrence Tracking:** Detects whether an error keeps reappearing after prior explanations.
- **Trend Measurement:** Highlights improving categories (*"Your article usage improved this week!"*).
- **Targeted Conversational Coaching:** AI gently steers future chats toward practicing weak patterns (e.g., asking past-tense story questions when irregular past verbs are recurring).

---

## 5. High-Impact Companion Features (Section 5 Additions)

### 5.1 — "Try Again": Active Spoken Correction Loop
Turns passive correction into active muscle memory:
1. Correction card invites user: *"Can you try saying: **'I have gone to Colombo.'**?"*
2. User clicks **🎙️ Try Again** and speaks the corrected sentence aloud.
3. System checks whether the target structure was produced cleanly:
   - **Matched:** Marks mistake **✓ Mastered**, updates **Correction Success Rate**, and gives brief encouragement.
   - **Missed:** Gently highlights the missed token for one optional retry.
4. Always **optional** so conversations stay relaxed.

### 5.2 — "Teach Me Something New" (Organic Expression Drops)
Occasionally introduces one natural expression mid-conversation (e.g., *"You can also say 'I was overwhelmed with work' instead of 'I had too much work'"*) with audio playback, Sinhala meaning, example, and 1-click Save.

### 5.3 — Conversation Topic Generator
Low-pressure topic starters when users don't know what to talk about:
- **Travel & Adventure** — Experiences and dream destinations.
- **Interesting Ideas** — Science, technology, and creativity.
- **University & Career** — Studies, projects, and daily challenges.
- **Random Everyday Chat** — Talk about absolutely anything.

### 5.4 — Personal English Knowledge Base
Every conversation feeds a searchable personal library organized into:
- Grammar mistakes & corrected sentences
- Saved vocabulary, synonyms, and collocations
- Natural expressions & pronunciation bookmarks
- Personal grammar notes
