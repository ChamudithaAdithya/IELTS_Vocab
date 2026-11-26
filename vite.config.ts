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

interface WarmEdgeSocket {
  client: MsEdgeTTS;
  createdAt: number;
}

const WARM_POOL_PER_VOICE = 3;
// Bing Edge TTS closes idle WebSockets around ~15-20s; keep TTL strictly under 13s and verify readyState === 1 (OPEN)!
const WARM_SOCKET_MAX_AGE_MS = 13_000;
const warmVoicePools = new Map<string, WarmEdgeSocket[]>();
const warmingInFlight = new Map<string, number>();

function isEdgeSocketOpen(client: MsEdgeTTS): boolean {
  const ws = (client as any)?._ws;
  // If internal _ws is exposed, require WebSocket.OPEN (1); otherwise rely on strict 13s age check
  return ws ? ws.readyState === 1 : true;
}

const SERVER_TTS_CACHE_MAX = 120;
const serverMp3Cache = new Map<string, Buffer>();

function cacheServerMp3(key: string, buf: Buffer): void {
  if (buf.length < 256) return;
  if (serverMp3Cache.size >= SERVER_TTS_CACHE_MAX) {
    const oldest = serverMp3Cache.keys().next().value;
    if (oldest) serverMp3Cache.delete(oldest);
  }
  serverMp3Cache.set(key, buf);
}

async function createConfiguredEdgeClient(safeVoice: string): Promise<MsEdgeTTS> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(safeVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  return tts;
}

function replenishWarmPool(voiceName: string): void {
  const safeVoice = ALLOWED_NEURAL_VOICES.has(voiceName)
    ? voiceName
    : 'en-US-AvaMultilingualNeural';
  const now = Date.now();
  const pool = (warmVoicePools.get(safeVoice) || []).filter(item => {
    if (now - item.createdAt < WARM_SOCKET_MAX_AGE_MS && isEdgeSocketOpen(item.client)) {
      return true;
    }
    try { item.client.close(); } catch {}
    return false;
  });
  warmVoicePools.set(safeVoice, pool);

  const inFlight = warmingInFlight.get(safeVoice) || 0;
  const needed = WARM_POOL_PER_VOICE - (pool.length + inFlight);
  for (let i = 0; i < needed; i++) {
    warmingInFlight.set(safeVoice, (warmingInFlight.get(safeVoice) || 0) + 1);
    createConfiguredEdgeClient(safeVoice)
      .then(client => {
        const list = warmVoicePools.get(safeVoice) || [];
        list.push({ client, createdAt: Date.now() });
        warmVoicePools.set(safeVoice, list);
      })
      .catch(() => {})
      .finally(() => {
        warmingInFlight.set(
          safeVoice,
          Math.max(0, (warmingInFlight.get(safeVoice) || 1) - 1)
        );
      });
  }
}

async function acquireEdgeClient(safeVoice: string): Promise<MsEdgeTTS> {
  const now = Date.now();
  const pool = warmVoicePools.get(safeVoice) || [];
  while (pool.length > 0) {
    const entry = pool.shift()!;
    if (now - entry.createdAt < WARM_SOCKET_MAX_AGE_MS && isEdgeSocketOpen(entry.client)) {
      replenishWarmPool(safeVoice);
      return entry.client;
    }
    try { entry.client.close(); } catch {}
  }
  replenishWarmPool(safeVoice);
  return createConfiguredEdgeClient(safeVoice);
}

async function synthesizeEdgeNeuralMp3(
  text: string,
  voiceName: string,
  rateParam?: string
): Promise<Buffer> {
  const safeVoice = ALLOWED_NEURAL_VOICES.has(voiceName)
    ? voiceName
    : 'en-US-AvaMultilingualNeural';
  const rateOpt = rateParam && /^[+-]?\d{1,2}%$/.test(rateParam) ? rateParam : '+0%';
  const cacheKey = `${safeVoice}|${rateOpt}|${text}`;
  const hit = serverMp3Cache.get(cacheKey);
  if (hit) return hit;

  for (let attempt = 0; attempt < 2; attempt++) {
    const tts =
      attempt === 0
        ? await acquireEdgeClient(safeVoice)
        : await createConfiguredEdgeClient(safeVoice);
    try {
      const { audioStream } = tts.toStream(escapeSsmlText(text), { rate: rateOpt });
      const chunks: Buffer[] = [];
      for await (const chunk of audioStream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const full = Buffer.concat(chunks);
      if (full.length > 0) {
        cacheServerMp3(cacheKey, full);
        return full;
      }
    } catch (err) {
      if (attempt === 1) throw err;
    } finally {
      try { tts.close(); } catch {}
    }
  }
  return Buffer.alloc(0);
}

/**
 * Streams 24kHz MP3 chunks to the HTTP response IMMEDIATELY as frames arrive from Edge Neural TTS
 * (eliminating full-sentence buffering wait while still populating the in-memory LRU cache).
 */
async function streamEdgeNeuralMp3ToResponse(
  text: string,
  voiceName: string,
  rateParam: string | undefined,
  res: any
): Promise<boolean> {
  const safeVoice = ALLOWED_NEURAL_VOICES.has(voiceName)
    ? voiceName
    : 'en-US-AvaMultilingualNeural';
  const rateOpt = rateParam && /^[+-]?\d{1,2}%$/.test(rateParam) ? rateParam : '+0%';
  const cacheKey = `${safeVoice}|${rateOpt}|${text}`;

  const cached = serverMp3Cache.get(cacheKey);
  if (cached && cached.length > 0) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-TTS-Delivery', 'memory-cache');
    res.end(cached);
    return true;
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    const tts =
      attempt === 0
        ? await acquireEdgeClient(safeVoice)
        : await createConfiguredEdgeClient(safeVoice);
    let headersSent = false;
    try {
      const { audioStream } = tts.toStream(escapeSsmlText(text), { rate: rateOpt });
      const chunks: Buffer[] = [];
      for await (const rawChunk of audioStream) {
        const buf = Buffer.isBuffer(rawChunk) ? rawChunk : Buffer.from(rawChunk);
        if (buf.length === 0) continue;
        if (!headersSent) {
          headersSent = true;
          res.statusCode = 200;
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Transfer-Encoding', 'chunked');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'no-transform, public, max-age=86400');
          res.setHeader('X-TTS-Delivery', 'chunked-stream');
        }
        chunks.push(buf);
        res.write(buf);
      }
      if (headersSent) {
        const full = Buffer.concat(chunks);
        cacheServerMp3(cacheKey, full);
        res.end();
        return true;
      }
    } catch {
      if (headersSent) {
        try { res.end(); } catch {}
        return true;
      }
    } finally {
      try { tts.close(); } catch {}
    }
  }
  return false;
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
          // Pre-warm primary voice pool on server startup so Turn 1 avoids cold WSS setup
          replenishWarmPool('en-US-AvaMultilingualNeural');

          // 1. Free Unlimited Microsoft Edge Neural HD Voice endpoint (Chunked Live Audio Streaming + Warm Socket Pool)
          server.middlewares.use('/api/neural-tts', async (req, res) => {
            try {
              const url = new URL(req.url || '', 'http://localhost');
              const voice = url.searchParams.get('voice') || 'en-US-AvaMultilingualNeural';
              if (url.searchParams.get('warmup') === '1') {
                replenishWarmPool(voice);
                res.statusCode = 204;
                res.end();
                return;
              }
              const text = (url.searchParams.get('q') || '').trim();
              const rate = url.searchParams.get('rate') || '+0%';
              if (!text) {
                res.statusCode = 400;
                res.end('Missing text query');
                return;
              }
              const ok = await streamEdgeNeuralMp3ToResponse(text, voice, rate, res);
              if (!ok && !res.writableEnded) {
                res.statusCode = 502;
                res.end('Empty neural audio stream');
              }
            } catch (err: any) {
              if (!res.writableEnded) {
                res.statusCode = 502;
                res.end(err?.message || 'Neural TTS error');
              }
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
