# IELTS Master Band 7+ Vocabulary

A React study app for IELTS vocabulary, with Sinhala translations, lessons,
flashcards, quizzes, pronunciation practice, and locally saved progress.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Checks

```bash
npm run lint
npm run build
```

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the app
whenever `main` is pushed. In the repository settings, set **Pages > Source**
to **GitHub Actions**.

## Generate the complete Lesson 9 data

Copy `.env.example` to `.env`, add `GEMINI_API_KEY`, then run:

```bash
npm run generate:lesson9
```

The generator resumes from `src/data/lesson9.generated.json` and validates six
English/Sinhala example pairs for every entry.

## Natural AI voice

The `worker/` folder proxies ElevenLabs without exposing its key. Authenticate
Wrangler, store the key, and deploy:

```bash
npx wrangler login
npx wrangler secret put ELEVENLABS_API_KEY --config worker/wrangler.jsonc
npx wrangler deploy --config worker/wrangler.jsonc
```

Put the returned Worker URL in `.env` as `VITE_AI_TTS_URL`. GitHub Pages must
receive that public URL as a repository Actions variable with the same name.
