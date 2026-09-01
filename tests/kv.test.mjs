import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { kvPipeline } from '../api/_kv.ts';

const ORIGINAL_FETCH = global.fetch;
const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.KV_REST_API_URL   = 'https://fake-kv.example.com';
  process.env.KV_REST_API_TOKEN = 'fake-token';
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  process.env = { ...ORIGINAL_ENV };
});

function jsonResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

describe('kvPipeline', () => {
  test('throws immediately if KV env vars are missing — no fetch attempted', async () => {
    delete process.env.KV_REST_API_URL;
    let fetchCalled = false;
    global.fetch = async () => { fetchCalled = true; return jsonResponse(200, []); };
    await assert.rejects(() => kvPipeline([['GET', 'x']]), /KV not configured/);
    assert.equal(fetchCalled, false);
  });

  test('succeeds on first try with no retries needed', async () => {
    let calls = 0;
    global.fetch = async () => { calls++; return jsonResponse(200, [{ result: 'ok' }]); };
    const result = await kvPipeline([['GET', 'x']]);
    assert.deepEqual(result, [{ result: 'ok' }]);
    assert.equal(calls, 1);
  });

  test('retries on 5xx and succeeds once the transient error clears', async () => {
    let calls = 0;
    global.fetch = async () => {
      calls++;
      if (calls < 3) return jsonResponse(503, {});
      return jsonResponse(200, [{ result: 'recovered' }]);
    };
    const result = await kvPipeline([['GET', 'x']]);
    assert.deepEqual(result, [{ result: 'recovered' }]);
    assert.equal(calls, 3);
  });

  test('retries on network throw and succeeds once it clears', async () => {
    let calls = 0;
    global.fetch = async () => {
      calls++;
      if (calls < 2) throw new Error('network down');
      return jsonResponse(200, [{ result: 'recovered' }]);
    };
    const result = await kvPipeline([['GET', 'x']]);
    assert.deepEqual(result, [{ result: 'recovered' }]);
    assert.equal(calls, 2);
  });

  test('gives up after max attempts on persistent 5xx', async () => {
    let calls = 0;
    global.fetch = async () => { calls++; return jsonResponse(500, {}); };
    await assert.rejects(() => kvPipeline([['GET', 'x']]), /KV pipeline failed: 500/);
    assert.equal(calls, 3); // MAX_ATTEMPTS
  });

  test('does NOT retry on a 4xx client error — fails fast on the first attempt', async () => {
    let calls = 0;
    global.fetch = async () => { calls++; return jsonResponse(401, {}); };
    await assert.rejects(() => kvPipeline([['GET', 'x']]), /KV pipeline failed: 401/);
    assert.equal(calls, 1); // must NOT retry a client error
  });

  test('does NOT retry on a 400 bad-request error', async () => {
    let calls = 0;
    global.fetch = async () => { calls++; return jsonResponse(400, {}); };
    await assert.rejects(() => kvPipeline([['GET', 'x']]), /KV pipeline failed: 400/);
    assert.equal(calls, 1);
  });
});
