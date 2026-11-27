import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {defineConfig} from 'vite';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

function resolveOptionalDevHttpsConfig(): { key: Buffer; cert: Buffer } | undefined {
  if (process.env.VITE_HTTPS !== '1' && process.env.VITE_HTTPS !== 'true') {
    return undefined;
  }
  const certDir = path.join(import.meta.dirname, 'node_modules', '.vite-https');
  const keyPath = path.join(certDir, 'dev-key.pem');
  const certPath = path.join(certDir, 'dev-cert.pem');

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    fs.mkdirSync(certDir, { recursive: true });
    const lanIps = new Set<string>(['127.0.0.1']);
    const nets = os.networkInterfaces();
    for (const list of Object.values(nets)) {
      for (const info of list || []) {
        if (info.family === 'IPv4' && !info.internal && info.address) {
          lanIps.add(info.address);
        }
      }
    }
    const sanEntries = [
      'DNS:localhost',
      ...Array.from(lanIps).map((ip) => `IP:${ip}`),
    ].join(',');

    const opensslCandidates = [
      'openssl',
      'C:/Program Files/Git/usr/bin/openssl.exe',
      'C:/Program Files (x86)/Git/usr/bin/openssl.exe',
    ];
    let generated = false;
    for (const bin of opensslCandidates) {
      try {
        execFileSync(
          bin,
          [
            'req',
            '-x509',
            '-newkey',
            'rsa:2048',
            '-nodes',
            '-sha256',
            '-days',
            '365',
            '-subj',
            '/CN=localhost',
            '-addext',
            `subjectAltName=${sanEntries}`,
            '-keyout',
            keyPath,
            '-out',
            certPath,
          ],
          { stdio: 'ignore' }
        );
        generated = true;
        break;
      } catch {}
    }
    if (!generated) {
      console.warn('[vite] OpenSSL not found; falling back to HTTP.');
      return undefined;
    }
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
}

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

// Persistent multiplexed MsEdgeTTS clients (1 open WebSocket per voice reused across sentences & turns).
// MsEdgeTTS natively multiplexes concurrent `toStream()` calls by `X-RequestId` over a single open socket,
// eliminating the ~1.2s–1.8s TLS + WSS + speech.config handshake penalty on every sentence!
const PERSISTENT_SOCKET_IDLE_TTL_MS = 25_000;
const persistentVoiceClients = new Map<string, MsEdgeTTS>();
const connectingVoiceClients = new Map<string, Promise<MsEdgeTTS>>();
const clientLastActiveAt = new Map<string, number>();

function isEdgeSocketOpen(client: MsEdgeTTS): boolean {
  const ws = (client as any)?._ws || (client as any)?.ws;
  return Boolean(ws && ws.readyState === 1);
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

function evictEdgeClient(safeVoice: string, target?: MsEdgeTTS): void {
  const current = persistentVoiceClients.get(safeVoice);
  if (!target || current === target) {
    persistentVoiceClients.delete(safeVoice);
    clientLastActiveAt.delete(safeVoice);
  }
  if (target) {
    try { target.close(); } catch {}
  } else if (current) {
    try { current.close(); } catch {}
  }
}

async function getPersistentEdgeClient(
  voiceName: string,
  forceFresh: boolean = false
): Promise<MsEdgeTTS> {
  const safeVoice = ALLOWED_NEURAL_VOICES.has(voiceName)
    ? voiceName
    : 'en-US-AvaMultilingualNeural';
  const now = Date.now();

  if (!forceFresh) {
    const existing = persistentVoiceClients.get(safeVoice);
    const lastActive = clientLastActiveAt.get(safeVoice) || 0;
    if (existing && isEdgeSocketOpen(existing) && now - lastActive < PERSISTENT_SOCKET_IDLE_TTL_MS) {
      clientLastActiveAt.set(safeVoice, now);
      return existing;
    }
    if (existing) {
      evictEdgeClient(safeVoice, existing);
    }

    const inFlight = connectingVoiceClients.get(safeVoice);
    if (inFlight) {
      return inFlight;
    }
  } else {
    evictEdgeClient(safeVoice);
  }

  const connectPromise = createConfiguredEdgeClient(safeVoice)
    .then((client) => {
      persistentVoiceClients.set(safeVoice, client);
      clientLastActiveAt.set(safeVoice, Date.now());
      return client;
    })
    .finally(() => {
      if (connectingVoiceClients.get(safeVoice) === connectPromise) {
        connectingVoiceClients.delete(safeVoice);
      }
    });

  connectingVoiceClients.set(safeVoice, connectPromise);
  return connectPromise;
}

function replenishWarmPool(voiceName: string): void {
  void getPersistentEdgeClient(voiceName, false).catch(() => {});
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
    const tts = await getPersistentEdgeClient(safeVoice, attempt > 0);
    try {
      const { audioStream } = tts.toStream(escapeSsmlText(text), { rate: rateOpt });
      const chunks: Buffer[] = [];
      for await (const chunk of audioStream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const full = Buffer.concat(chunks);
      if (full.length > 0) {
        clientLastActiveAt.set(safeVoice, Date.now());
        cacheServerMp3(cacheKey, full);
        return full;
      }
      evictEdgeClient(safeVoice, tts);
    } catch (err) {
      evictEdgeClient(safeVoice, tts);
      if (attempt === 1) throw err;
    }
  }
  return Buffer.alloc(0);
}

/**
 * Streams 24kHz MP3 chunks to the HTTP response IMMEDIATELY as frames arrive from the persistent
 * Edge Neural WebSocket (~180-300ms first audio byte!) without closing the reusable socket.
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
    let tts: MsEdgeTTS;
    try {
      tts = await getPersistentEdgeClient(safeVoice, attempt > 0);
    } catch {
      if (attempt === 1) return false;
      continue;
    }
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
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'no-transform, public, max-age=86400');
          res.setHeader('X-TTS-Delivery', 'chunked-stream');
        }
        chunks.push(buf);
        res.write(buf);
      }
      if (headersSent) {
        clientLastActiveAt.set(safeVoice, Date.now());
        const full = Buffer.concat(chunks);
        cacheServerMp3(cacheKey, full);
        res.end();
        return true;
      }
      evictEdgeClient(safeVoice, tts);
    } catch {
      evictEdgeClient(safeVoice, tts);
      if (headersSent) {
        try { res.end(); } catch {}
        return true;
      }
    }
  }
  return false;
}

function registerTtsMiddlewares(middlewares: any): void {
  // Pre-warm primary voice pool on server startup so Turn 1 avoids cold WSS setup
  replenishWarmPool('en-US-AvaMultilingualNeural');

  // 1. Free Unlimited Microsoft Edge Neural HD Voice endpoint (Chunked Live Audio Streaming + Warm Socket Pool)
  middlewares.use('/api/neural-tts', async (req: any, res: any) => {
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
  middlewares.use('/api/tts', async (req: any, res: any) => {
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
          registerTtsMiddlewares(server.middlewares);
        },
        configurePreviewServer(server) {
          registerTtsMiddlewares(server.middlewares);
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
    build: {
      chunkSizeWarningLimit: 2800,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor',
                test: /node_modules/,
              },
              {
                name: 'vocab-dictionary',
                test: /academicVocabularyDictionary|importedVocabulary/,
              },
              {
                name: 'vocab-lessons',
                test: /src[\\/]data[\\/]lesson/,
              },
            ],
          },
        },
      },
    },
    server: {
      https: resolveOptionalDevHttpsConfig(),
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
