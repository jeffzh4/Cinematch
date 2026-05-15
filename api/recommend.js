// Vercel serverless function: proxies the Anthropic API.
// API key lives in Vercel env vars (ANTHROPIC_API_KEY), never in source.

const SYSTEM_PROMPT = `You are CineMatch, a film curator with deep knowledge across world cinema, decades, and genres. Given a person's mood, preferred genres, and the occasion, recommend exactly 6 films that match what they're truly looking for.

For each film, write a 2-3 sentence reason that:
- Explains why this film fits their specific input
- Captures the film's essence in literary, evocative prose
- NEVER reveals plot twists, endings, or spoilers
- Avoids cliché phrasing like "must-watch", "epic", or "hidden gem"

Lean toward quality and intentionality. Don't always default to the most obvious title — surprise them when appropriate. Mix well-known and lesser-known films. Vary the decade and country of origin when it serves the request.

Respond with ONLY a JSON object in this exact schema, no other text:

{
  "headline": "A brief literary phrase capturing the vibe of their request. You may include a single <em>word</em> for emphasis (rendered in purple) and an optional <br> for a line break. Maximum 12 words. Example: 'For a slow night<br>that asks <em>nothing</em> of you.'",
  "films": [
    {
      "num": 1,
      "title": "Film Title",
      "director": "Director Name",
      "year": 2003,
      "runtime": 102,
      "genre": "Drama",
      "rating": 4.2,
      "reason": "2-3 sentence spoiler-free explanation tailored to their input."
    }
  ]
}

Return runtime in minutes (integer), year as an integer, rating as a number out of 5 (one decimal). Return exactly 6 films. Output valid JSON only — no markdown, no code fences, no commentary.`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server missing ANTHROPIC_API_KEY' });
  }

  const { mood = '', genres = [], occasion = '' } = req.body || {};

  const userMessage = `Mood: ${mood || '(not specified)'}
Genres: ${genres.length ? genres.join(', ') : '(no preference)'}
Occasion: ${occasion || '(not specified)'}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Anthropic ${response.status}`, detail: errText.slice(0, 300) });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const cleaned = text
      .replace(/^\s*```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    let parsed;
    try { parsed = JSON.parse(cleaned); }
    catch { return res.status(502).json({ error: 'Failed to parse Claude response' }); }

    if (!parsed.films || !Array.isArray(parsed.films) || parsed.films.length === 0) {
      return res.status(502).json({ error: 'Invalid response shape from Claude' });
    }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown server error' });
  }
};
