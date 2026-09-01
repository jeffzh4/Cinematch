// api/share-og.ts imports sibling .ts modules by extensionless specifier
// (idiomatic TS, and how Vercel's own bundler resolves it) — Node's raw ESM
// resolver can't follow that without a loader, so this test bundles the
// file with esbuild first (same tool Vercel uses) rather than importing the
// source directly.

import { test, describe, before, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT   = fileURLToPath(new URL('..', import.meta.url));
const ESBUILD_BIN = join(REPO_ROOT, 'node_modules', '.bin', 'esbuild');

let handler;

before(async () => {
  const workDir = mkdtempSync(join(tmpdir(), 'share-og-test-'));
  const outFile = join(workDir, 'handler.mjs');
  execFileSync(ESBUILD_BIN, [
    join(REPO_ROOT, 'api', 'share-og.ts'),
    '--bundle', '--platform=neutral', '--format=esm',
    `--outfile=${outFile}`,
  ], { stdio: 'pipe' });
  const mod = await import(outFile);
  handler = mod.default;
  rmSync(workDir, { recursive: true, force: true });
});

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

function mockRes() {
  return {
    _status: 200,
    _body: '',
    _headers: {},
    setHeader(k, v) { this._headers[k] = v; return this; },
    status(c) { this._status = c; return this; },
    send(b) { this._body = b; return this; },
  };
}

const VALID_ID = 'a'.repeat(32);

describe('api/share-og handler', () => {
  test('valid id + KV hit: renders real headline, strips <em> tags, mentions first film', async () => {
    global.fetch = async () => ({
      ok: true, status: 200,
      json: async () => [{ result: JSON.stringify({
        headline: 'For a <em>quiet</em> night in.',
        films: [{ title: 'Paterson', year: 2016 }, { title: 'Columbus' }],
      }) }],
    });
    const req = { query: { id: VALID_ID }, headers: { host: 'cinematch-navy.vercel.app' } };
    const res = mockRes();
    await handler(req, res);

    assert.equal(res._status, 200);
    assert.ok(res._body.includes('quiet night in'));
    assert.ok(!res._body.includes('<em>'), 'headline must have em tags stripped');
    assert.ok(res._body.includes('Paterson'), 'description should mention the first film');
    assert.ok(res._body.includes('og:image'));
    assert.ok(res._body.includes('http-equiv="refresh"'), 'must redirect real visitors to share.html');
  });

  test('valid id + KV hit: og:image points at the per-share dynamic image endpoint', async () => {
    global.fetch = async () => ({
      ok: true, status: 200,
      json: async () => [{ result: JSON.stringify({ headline: 'x', films: [{ title: 'Y' }] }) }],
    });
    const req = { query: { id: VALID_ID }, headers: { host: 'cinematch-navy.vercel.app' } };
    const res = mockRes();
    await handler(req, res);

    const match = res._body.match(/og:image" content="([^"]+)"/);
    assert.ok(match, 'og:image tag must be present');
    assert.equal(match[1], `https://cinematch-navy.vercel.app/api/share-image?id=${VALID_ID}`);
  });

  test('invalid id format: falls back to generic content, still 200', async () => {
    const req = { query: { id: 'not-a-valid-id' }, headers: {} };
    const res = mockRes();
    await handler(req, res);
    assert.equal(res._status, 200);
    assert.ok(res._body.includes('Shared picks'));
  });

  test('KV miss (expired/never created): graceful fallback, still 200', async () => {
    global.fetch = async () => ({ ok: true, status: 200, json: async () => [{ result: null }] });
    const req = { query: { id: VALID_ID }, headers: {} };
    const res = mockRes();
    await handler(req, res);
    assert.equal(res._status, 200);
    assert.ok(res._body.includes("Couldn't find"));
  });

  test('KV throws: never a 500 to a crawler, graceful fallback', async () => {
    global.fetch = async () => { throw new Error('network down'); };
    const req = { query: { id: VALID_ID }, headers: {} };
    const res = mockRes();
    await handler(req, res);
    assert.equal(res._status, 200);
    assert.ok(res._body.includes('Shared picks'));
  });
});
