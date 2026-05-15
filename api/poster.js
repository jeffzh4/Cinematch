// Vercel serverless function: proxies the TMDB poster lookup.
// API key lives in Vercel env vars (TMDB_API_KEY), never in source.

module.exports = async function handler(req, res) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server missing TMDB_API_KEY' });
  }

  const title = (req.query?.title || '').trim();
  const year  = (req.query?.year  || '').trim();
  if (!title) {
    return res.status(400).json({ error: 'Missing title' });
  }

  try {
    const params = new URLSearchParams({ api_key: apiKey, query: title });
    if (year) params.set('year', year);

    const response = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'TMDB request failed' });
    }

    const data = await response.json();
    const hit = data.results?.find(r => r.poster_path) || null;

    if (!hit) {
      return res.status(200).json({ posterUrl: null });
    }

    res.status(200).json({
      posterUrl: `https://image.tmdb.org/t/p/w500${hit.poster_path}`,
      tmdbTitle: hit.title,
      tmdbYear:  hit.release_date?.slice(0, 4) ?? null
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown server error' });
  }
};
