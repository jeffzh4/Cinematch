// Vercel serverless function: anonymised usage analytics via Vercel KV.
// Requires KV_REST_API_URL and KV_REST_API_TOKEN in environment variables.
//
// POST — log an anonymised recommendation entry (called from loading.html)
// GET  — return aggregated stats (used by analytics.html)

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface AnalyticsEntry {
  mood:      string;
  genres:    string[];
  occasion:  string;
  runtime:   string;
  decade:    string;
  platforms: string[];
  ts:        number;
}

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
  res.setHeader('Access-Control-Allow-Origin', '*');

  // ── POST: log one anonymised entry ──────────────────────────────────────
  if (req.method === 'POST') {
    const body = (req.body as Record<string, unknown>) || {};
    const entry: AnalyticsEntry = {
      mood:      String(body.mood      ?? '').slice(0, 200),
      genres:    Array.isArray(body.genres)    ? (body.genres    as string[]).slice(0, 10) : [],
      occasion:  String(body.occasion   ?? '').slice(0, 200),
      runtime:   String(body.runtime    ?? ''),
      decade:    String(body.decade     ?? ''),
      platforms: Array.isArray(body.platforms) ? (body.platforms as string[]).slice(0, 10) : [],
      ts: Date.now(),
    };

    try {
      await kvPipeline([['LPUSH', 'cm:analytics', JSON.stringify(entry)]]);
    } catch {
      // analytics must never break the main recommendation flow
    }
    res.status(200).json({ ok: true });
    return;
  }

  // ── GET: return aggregated stats ─────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const results = await kvPipeline([
        ['LLEN',   'cm:analytics'],
        ['LRANGE', 'cm:analytics', '0', '199'],
      ]);

      const total      = (results[0].result as number) || 0;
      const rawEntries = (results[1].result as string[]) || [];

      const entries: AnalyticsEntry[] = rawEntries
        .map((e) => { try { return JSON.parse(e) as AnalyticsEntry; } catch { return null; } })
        .filter((e): e is AnalyticsEntry => e !== null);

      // Genre counts
      const genreCounts: Record<string, number> = {};
      for (const entry of entries) {
        for (const g of entry.genres) {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        }
      }

      // Unique runtime preferences
      const runtimeCounts: Record<string, number> = {};
      for (const entry of entries) {
        if (entry.runtime) runtimeCounts[entry.runtime] = (runtimeCounts[entry.runtime] || 0) + 1;
      }

      // Recent unique moods (last 30 entries, deduped)
      const moods = [...new Set(
        entries.slice(0, 30).map((e) => e.mood).filter(Boolean)
      )].slice(0, 15);

      // Recent unique occasions (last 30 entries, deduped)
      const occasions = [...new Set(
        entries.slice(0, 30).map((e) => e.occasion).filter(Boolean)
      )].slice(0, 10);

      res.status(200).json({ total, genres: genreCounts, runtimes: runtimeCounts, moods, occasions });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'KV error';
      res.status(500).json({ error: message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
