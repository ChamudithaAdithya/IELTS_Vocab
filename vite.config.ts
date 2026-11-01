import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

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
          server.middlewares.use('/api/tts', async (req, res) => {
            try {
              const url = new URL(req.url || '', 'http://localhost');
              const text = url.searchParams.get('q');
              const lang = url.searchParams.get('tl') || 'en-GB';
              if (!text) {
                res.statusCode = 400;
                res.end('Missing text query');
                return;
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
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
