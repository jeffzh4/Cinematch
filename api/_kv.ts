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
  // A failed response does not prove the server skipped the command.
  // Replaying LPUSH/INCR could duplicate a completed write.
  const retrySafe = commands.every(command =>
    ['GET', 'MGET', 'LLEN', 'LRANGE', 'SET'].includes(String(command[0]).toUpperCase()));
  const attempts = retrySafe ? MAX_ATTEMPTS : 1;

  for (let attempt = 1; attempt <= attempts; attempt++) {
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
      if (attempt === attempts) throw lastError;
      await sleep(BASE_DELAY_MS * 2 ** (attempt - 1)); // 100ms, 200ms, ...
      continue;
    }

    if (res.ok) {
      const payload: unknown = await res.json();
      if (!Array.isArray(payload) || payload.length !== commands.length ||
          payload.some(item => !item || typeof item !== 'object' ||
            'error' in item || !('result' in item))) {
        throw new Error('Invalid KV pipeline response');
      }
      return payload as KVResult[];
    }

    if (!isRetryableStatus(res.status)) {
      // 4xx — a retry can't fix a bad request or bad auth. Fail fast.
      throw new Error(`KV pipeline failed: ${res.status}`);
    }

    lastError = new Error(`KV pipeline failed: ${res.status}`);
    if (attempt === attempts) throw lastError;
    await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
  }

  throw lastError;
}
