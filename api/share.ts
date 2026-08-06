// Vercel serverless function: store and retrieve shareable recommendation sets.
// Requires KV_REST_API_URL and KV_REST_API_TOKEN in environment variables.
//
// POST { headline, films } → { id, url }    — store results, return share link
// GET  ?id=xxx             → { headline, films } — retrieve stored results

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { applySecurityHeaders, boundedString, rateLimit } from './_security';

interface KVResult {
  result: unknown;
}

async function kvPipeline(commands: unknown[][]): Promise<KVResult[]> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('KV not configured');

  const res = await fetch(`${url}/pipeline`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(commands),
  });

  if (!res.ok) throw new Error(`KV pipeline failed: ${res.status}`);
  return res.json() as Promise<KVResult[]>;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  applySecurityHeaders(res);
  if (!rateLimit(req, res, req.method === 'POST' ? 20 : 60, 60_000)) return;

  // ── POST: persist a result set and return a short ID ────────────────────
  if (req.method === 'POST') {
    const body = req.body as Record<string, unknown>;
    if (!body || !Array.isArray(body.films) || body.films.length !== 6) {
      res.status(400).json({ error: 'Invalid payload — expected { headline, films }' });
      return;
    }

    const films = body.films.map((film) => {
      const item = film as Record<string, unknown>;
      return {
        num: typeof item.num === 'number' ? item.num : 0,
        title: boundedString(item.title, 160),
        director: boundedString(item.director, 160),
        year: typeof item.year === 'number' ? item.year : 0,
        runtime: typeof item.runtime === 'number' ? item.runtime : 0,
        genre: boundedString(item.genre, 80),
        rating: typeof item.rating === 'number' ? item.rating : 0,
        reason: boundedString(item.reason, 600),
      };
    });
    const data = { headline: boundedString(body.headline, 240), films };

    const id = randomUUID().replaceAll('-', '');

    try {
      await kvPipeline([
        // TTL: 30 days (2 592 000 seconds)
        ['SET', `cm:share:${id}`, JSON.stringify(data), 'EX', '2592000'],
      ]);
    } catch (err) {
      res.status(500).json({ error: 'Unable to create share link' });
      return;
    }

    const host   = String(req.headers.host ?? '');
    const proto  = host.startsWith('localhost') ? 'http' : 'https';
    const origin = `${proto}://${host}`;

    res.status(200).json({ id, url: `${origin}/share?id=${id}` });
    return;
  }

  // ── GET: retrieve stored results by ID ──────────────────────────────────
  if (req.method === 'GET') {
    const id = boundedString(req.query.id, 32);
    if (!/^[a-f0-9]{32}$/i.test(id)) {
      res.status(400).json({ error: 'Missing ?id param' });
      return;
    }

    try {
      const results = await kvPipeline([['GET', `cm:share:${id}`]]);
      const raw     = results[0].result as string | null;

      if (!raw) {
        res.status(404).json({ error: 'Share link not found or expired (30-day TTL)' });
        return;
      }

      res.status(200).json(JSON.parse(raw));
    } catch (err) {
      res.status(500).json({ error: 'Unable to load share link' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
