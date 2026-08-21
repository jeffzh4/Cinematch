// Shared Vercel KV REST pipeline helper.
// Requires KV_REST_API_URL and KV_REST_API_TOKEN in environment variables.

export interface KVResult {
  result: unknown;
}

export async function kvPipeline(commands: unknown[][]): Promise<KVResult[]> {
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
