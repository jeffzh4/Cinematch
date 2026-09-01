// Shared Vercel KV REST pipeline helper.
// Requires KV_REST_API_URL and KV_REST_API_TOKEN in environment variables.

export interface KVResult {
  result: unknown;
}

const MAX_ATTEMPTS  = 3;
const BASE_DELAY_MS = 100;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retryable: network failures (fetch throws) and 5xx responses — both are
// typically transient KV-side blips. Never retryable: 4xx (bad auth, bad
// command) — retrying a client error just wastes time and quota.
function isRetryableStatus(status: number): boolean {
  return status >= 500;
}

export async function kvPipeline(commands: unknown[][]): Promise<KVResult[]> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('KV not configured');

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${url}/pipeline`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(commands),
      });
    } catch (err) {
      // Network failure — retryable.
      lastError = err;
      if (attempt === MAX_ATTEMPTS) throw lastError;
      await sleep(BASE_DELAY_MS * 2 ** (attempt - 1)); // 100ms, 200ms, ...
      continue;
    }

    if (res.ok) return res.json() as Promise<KVResult[]>;

    if (!isRetryableStatus(res.status)) {
      // 4xx — a retry can't fix a bad request or bad auth. Fail fast.
      throw new Error(`KV pipeline failed: ${res.status}`);
    }

    lastError = new Error(`KV pipeline failed: ${res.status}`);
    if (attempt === MAX_ATTEMPTS) throw lastError;
    await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
  }

  throw lastError;
}
