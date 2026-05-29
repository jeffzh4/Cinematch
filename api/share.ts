// Vercel serverless function: store and retrieve shareable recommendation sets.
// Requires KV_REST_API_URL and KV_REST_API_TOKEN in environment variables.
//
// POST { headline, films } → { id, url }    — store results, return share link
// GET  ?id=xxx             → { headline, films } — retrieve stored results

import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  // ── POST: persist a result set and return a short ID ────────────────────
  if (req.method === 'POST') {
    const data = req.body as Record<string, unknown>;
    if (!data || !Array.isArray(data.films)) {
      res.status(400).json({ error: 'Invalid payload — expected { headline, films }' });
      return;
    }

    // Short unique ID: 7 base-36 random chars + base-36 timestamp suffix
    const id = Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

    try {
      await kvPipeline([
        // TTL: 30 days (2 592 000 seconds)
        ['SET', `cm:share:${id}`, JSON.stringify(data), 'EX', '2592000'],
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'KV error';
      res.status(500).json({ error: message });
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
    const id = String(req.query.id ?? '').trim();
    if (!id) {
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
      const message = err instanceof Error ? err.message : 'KV error';
      res.status(500).json({ error: message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
