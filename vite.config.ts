import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const ALLOWED_NEURAL_VOICES = new Set([
  'en-US-AvaMultilingualNeural',
  'en-US-EmmaMultilingualNeural',
  'en-US-AndrewMultilingualNeural',
  'en-GB-SoniaNeural',
  'en-GB-RyanNeural',
  'en-AU-NatashaNeural'
]);

function escapeSsmlText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function synthesizeEdgeNeuralMp3(
  text: string,
  voiceName: string,
  rateParam?: string
): Promise<Buffer> {
  const safeVoice = ALLOWED_NEURAL_VOICES.has(voiceName)
    ? voiceName
    : 'en-US-AvaMultilingualNeural';
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(safeVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const rateOpt = rateParam && /^[+-]?\d{1,2}%$/.test(rateParam) ? rateParam : '+0%';
    const { audioStream } = tts.toStream(escapeSsmlText(text), { rate: rateOpt });
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } finally {
    try { tts.close(); } catch {}
  }
}

export default defineConfig(() => {
  return {
    // Relative asset URLs work both at a custom domain and under a
    // repository subpath such as /IELTS_Vocab/ on GitHub Pages.
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'tts-proxy-middleware',
        configureServer(server) {
          // 1. Free Unlimited Microsoft Edge Neural HD Voice endpoint (Ava, Emma, Andrew, Sonia, Ryan, Natasha)
          server.middlewares.use('/api/neural-tts', async (req, res) => {
            try {
              const url = new URL(req.url || '', 'http://localhost');
              const text = (url.searchParams.get('q') || '').trim();
              const voice = url.searchParams.get('voice') || 'en-US-AvaMultilingualNeural';
              const rate = url.searchParams.get('rate') || '+0%';
              if (!text) {
                res.statusCode = 400;
                res.end('Missing text query');
                return;
              }
              const mp3 = await synthesizeEdgeNeuralMp3(text, voice, rate);
              if (!mp3 || mp3.length === 0) {
                res.statusCode = 502;
                res.end('Empty neural audio stream');
                return;
              }
              res.setHeader('Content-Type', 'audio/mpeg');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Cache-Control', 'public, max-age=86400');
              res.end(mp3);
            } catch (err: any) {
              res.statusCode = 502;
              res.end(err?.message || 'Neural TTS error');
            }
          });

          // 2. General /api/tts endpoint — upgrades to Edge Neural HD first, falls back to Google Translate TTS
          server.middlewares.use('/api/tts', async (req, res) => {
            try {
              const url = new URL(req.url || '', 'http://localhost');
              const text = (url.searchParams.get('q') || '').trim();
              const lang = url.searchParams.get('tl') || 'en-GB';
              if (!text) {
                res.statusCode = 400;
                res.end('Missing text query');
                return;
              }
              try {
                const defaultVoice =
                  lang === 'en-US'
                    ? 'en-US-AvaMultilingualNeural'
                    : lang === 'en-AU'
                    ? 'en-AU-NatashaNeural'
                    : 'en-GB-SoniaNeural';
                const neuralBuf = await synthesizeEdgeNeuralMp3(text, defaultVoice);
                if (neuralBuf && neuralBuf.length > 0) {
                  res.setHeader('Content-Type', 'audio/mpeg');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.setHeader('Cache-Control', 'public, max-age=86400');
                  res.end(neuralBuf);
                  return;
                }
              } catch {
                // Fall through to Google Translate TTS if Edge WebSocket is blocked
              }

              const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(text)}`;
              const upstream = await fetch(googleUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
              });
              if (!upstream.ok) {
                res.statusCode = upstream.status;
                res.end('Upstream error');
                return;
              }
              const buffer = Buffer.from(await upstream.arrayBuffer());
              res.setHeader('Content-Type', 'audio/mpeg');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Cache-Control', 'public, max-age=86400');
              res.end(buffer);
            } catch (err: any) {
              res.statusCode = 500;
              res.end(err.message || 'Server error');
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': import.meta.dirname,
      },
    },
    worker: {
      format: 'es',
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
