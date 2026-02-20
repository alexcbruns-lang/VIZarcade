export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { trackName, artistName, genres } = req.body;

  if (!trackName || !artistName) {
    return res.status(400).json({ error: 'Missing trackName or artistName' });
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const prompt = `You are a visual theme engine for a music visualizer app. Given a song, return a JSON object describing the perfect visual theme.

Song: "${trackName}" by ${artistName}
Genres: ${(genres || []).join(', ') || 'unknown'}

Return ONLY a raw JSON object (no markdown, no explanation) with these exact fields:
{
  "label": "2-3 word vibe label in ALL CAPS (e.g. PURE EUPHORIA, DARK ENERGY, HEARTBREAK, FESTIVAL MADNESS)",
  "palette": ["#hex1","#hex2","#hex3","#hex4"],
  "bgColor": "#hex — very dark background color thematically matching the song",
  "particleShape": one of: "trail","float","drift","burst","spiral","sharp",
  "geoSides": [n1,n2,n3] — array of 3 polygon side counts (3-12) matching the song's geometry feel,
  "waveAmp": number 0.4-2.0 — wave intensity matching song energy,
  "beatFlash": number 0.05-0.35 — beat flash brightness,
  "orbIntensity": number 0.05-0.18 — background glow intensity,
  "gridColor": "rgba(r,g,b,a) — subtle grid color matching palette",
  "symbols": array of 0-3 special symbols to render, chosen from: heart, star, diamond, lightning, note, infinity, flower, spiral, crown, flame, snowflake, moon,
  "splashDesc": "5-10 word poetic description shown during song transition"
}

Be creative and truly match the song's soul. For example:
- A Marshmello track: white/pastel palette, smiley/party energy, high waveAmp, symbols: ["star","flower"]
- A heartbreak ballad: dark reds/purples, slow drift particles, symbols: ["heart"]
- A metal track: harsh reds/blacks, burst particles, jagged triangles, symbols: ["lightning","flame"]
- A holiday song: cool blues/whites, symbols: ["snowflake","star"]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const theme = JSON.parse(clean);

    return res.status(200).json(theme);
  } catch (e) {
    console.error('Theme generation error:', e);
    return res.status(500).json({ error: 'Theme generation failed' });
  }
}
