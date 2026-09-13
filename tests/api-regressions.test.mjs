import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

async function handler(file) {
  const output = await build({ entryPoints: [file], bundle: true, platform: 'node', format: 'esm', write: false });
  return (await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`)).default;
}
function response() {
  return { code: 200, body: null, setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
}

test('share rejects malformed film entries before persistence', async () => {
  const share = await handler('api/share.ts');
  for (const film of [null, 1, [], {}, { title: ' ' }]) {
    const res = response();
    await share({ method: 'POST', headers: {}, body: { films: Array(6).fill(film) } }, res);
    assert.equal(res.code, 400);
  }
});

test('analytics ignores corrupt rows and counts prototype property names correctly', async () => {
  const analytics = await handler('api/analytics.ts');
  const fetchBefore = global.fetch;
  const envBefore = { ...process.env };
  process.env.KV_REST_API_URL = 'https://example.test';
  process.env.KV_REST_API_TOKEN = 'test';
  global.fetch = async () => ({ ok: true, json: async () => [
    { result: 3 }, { result: ['null', '{}', JSON.stringify({ genres: ['constructor', '__proto__'], runtime: 'toString', mood: 'quiet', occasion: 'evening' })] }
  ] });
  try {
    const res = response();
    await analytics({ method: 'GET', headers: {} }, res);
    assert.equal(res.code, 200);
    assert.equal(res.body.genres.constructor, 1);
    assert.equal(res.body.genres.__proto__, 1);
    assert.equal(res.body.runtimes.toString, 1);
  } finally {
    global.fetch = fetchBefore;
    process.env = envBefore;
  }
});
