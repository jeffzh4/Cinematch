// Vercel serverless function: proxies the TMDB poster lookup.
// API key lives in Vercel env vars (TMDB_API_KEY), never in source.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, boundedString, rateLimit } from './_security';

interface TMDBMovie {
  poster_path:  string | null;
  title:        string;
  release_date: string;
}

interface TMDBSearchResponse {
  results: TMDBMovie[];
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  applySecurityHeaders(res);
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!rateLimit(req, res, 60, 60_000)) return;
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server missing TMDB_API_KEY' });
    return;
  }

  const title = boundedString(req.query?.title, 200);
  const year  = boundedString(req.query?.year, 4);

  if (!title) {
    res.status(400).json({ error: 'Missing title' });
    return;
  }

  try {
    const params = new URLSearchParams({ api_key: apiKey, query: title });
    if (year) params.set('year', year);

    const response = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`);
    if (!response.ok) {
      res.status(response.status).json({ error: 'TMDB request failed' });
      return;
    }

    const data = await response.json() as TMDBSearchResponse;
    const hit  = data.results?.find((r) => r.poster_path) ?? null;

    if (!hit) {
      res.status(200).json({ posterUrl: null });
      return;
    }

    res.status(200).json({
      posterUrl: `https://image.tmdb.org/t/p/w500${hit.poster_path}`,
      tmdbTitle: hit.title,
      tmdbYear:  hit.release_date?.slice(0, 4) ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    res.status(500).json({ error: message });
  }
}
