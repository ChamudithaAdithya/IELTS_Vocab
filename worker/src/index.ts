interface Env {
  ELEVENLABS_API_KEY: string;
  ELEVENLABS_VOICE_ID: string;
  ALLOWED_ORIGIN: string;
}

const cors = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Vary': 'Origin',
});

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = origin === env.ALLOWED_ORIGIN || origin.startsWith('http://localhost:');
    if (!allowed) return new Response('Forbidden', { status: 403 });
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
    const text = new URL(request.url).searchParams.get('text') ?? '';
    if (!text || text.length > 500) return new Response('Invalid text', { status: 400, headers: cors(origin) });
    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${env.ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': env.ELEVENLABS_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_flash_v2_5' }),
    });
    if (!upstream.ok) return new Response('Voice generation failed', { status: 502, headers: cors(origin) });
    return new Response(upstream.body, { headers: { ...cors(origin), 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=604800' } });
  },
};
