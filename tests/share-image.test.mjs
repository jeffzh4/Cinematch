// api/share-image.ts imports a sibling .ts module by extensionless
// specifier, which Node's raw ESM resolver can't follow without a loader.
// So this test bundles the file with esbuild first (same transform tool
// Vercel uses), stubs '@vercel/og' with a fake package that records what it
// was called with, then imports and exercises the compiled handler directly.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT   = fileURLToPath(new URL('..', import.meta.url));
const ESBUILD_BIN = join(REPO_ROOT, 'node_modules', '.bin', 'esbuild');

let workDir;
let handler;
let getLastCall;

before(async () => {
  workDir = mkdtempSync(join(tmpdir(), 'share-image-test-'));

  // Fake @vercel/og that records the element tree + options it was called with.
  const ogDir = join(workDir, 'node_modules', '@vercel', 'og');
  mkdirSync(ogDir, { recursive: true });
  writeFileSync(join(ogDir, 'package.json'), JSON.stringify({ name: '@vercel/og', version: '0.0.0', type: 'module', main: 'index.js' }));
  writeFileSync(join(ogDir, 'index.js'), `
    export class ImageResponse {
      constructor(element, options) {
        globalThis.__lastImageCall = { element, options };
        this.status = 200;
      }
    }
  `);

  const outFile = join(workDir, 'handler.mjs');
  execFileSync(ESBUILD_BIN, [
    join(REPO_ROOT, 'api', 'share-image.ts'),
    '--bundle', '--platform=neutral', '--format=esm',
    '--external:@vercel/og',
    `--outfile=${outFile}`,
  ], { stdio: 'pipe' });

  const mod = await import(outFile);
  handler = mod.default;
  getLastCall = () => globalThis.__lastImageCall;
});

after(() => {
  rmSync(workDir, { recursive: true, force: true });
});

function flattenText(el, out = []) {
  if (typeof el === 'string') { out.push(el); return out; }
  if (!el || typeof el !== 'object') return out;
  const children = el.props?.children;
  if (Array.isArray(children)) children.forEach((c) => flattenText(c, out));
  else if (children) flattenText(children, out);
  return out;
}

const ORIGINAL_FETCH = global.fetch;
const ORIGINAL_ENV = { ...process.env };
function resetEnv() {
  process.env.KV_REST_API_URL   = 'https://fake-kv.example.com';
  process.env.KV_REST_API_TOKEN = 'fake-token';
}

const VALID_ID = 'a'.repeat(32);

describe('api/share-image handler (bundled via esbuild)', () => {
  test('valid id + KV hit: renders headline (em stripped) and first 3 film titles', async () => {
    resetEnv();
    global.fetch = async () => ({
      ok: true, status: 200,
      json: async () => [{ result: JSON.stringify({
        headline: 'For a <em>quiet</em> night in.',
        films: [{ title: 'Paterson' }, { title: 'Columbus' }, { title: 'Past Lives' }, { title: 'Aftersun' }],
      }) }],
    });

    const req = new Request(`https://example.com/api/share-image?id=${VALID_ID}`);
    const res = await handler(req);
    assert.equal(res.status, 200);

    const { element, options } = getLastCall();
    assert.deepEqual(options, { width: 1200, height: 630 });
    assert.equal(element.type, 'div');

    const text = flattenText(element);
    assert.ok(text.includes('CINEMATCH'));
    assert.ok(text.includes('For a quiet night in.'));
    assert.ok(text.includes('Paterson  ·  Columbus  ·  Past Lives'), 'only first 3 films should be joined');
    global.fetch = ORIGINAL_FETCH;
    process.env = { ...ORIGINAL_ENV };
  });

  test('invalid id format: falls back to generic headline, status 200', async () => {
    resetEnv();
    const req = new Request('https://example.com/api/share-image?id=not-valid');
    const res = await handler(req);
    assert.equal(res.status, 200);
    assert.ok(flattenText(getLastCall().element).includes('Six films, picked for you'));
    process.env = { ...ORIGINAL_ENV };
  });

  test('KV miss: falls back to generic headline, status 200', async () => {
    resetEnv();
    global.fetch = async () => ({ ok: true, status: 200, json: async () => [{ result: null }] });
    const req = new Request(`https://example.com/api/share-image?id=${VALID_ID}`);
    const res = await handler(req);
    assert.equal(res.status, 200);
    assert.ok(flattenText(getLastCall().element).includes('Six films, picked for you'));
    global.fetch = ORIGINAL_FETCH;
    process.env = { ...ORIGINAL_ENV };
  });

  test('KV throws: never fails the image response, status 200', async () => {
    resetEnv();
    global.fetch = async () => { throw new Error('network down'); };
    const req = new Request(`https://example.com/api/share-image?id=${VALID_ID}`);
    const res = await handler(req);
    assert.equal(res.status, 200);
    assert.ok(flattenText(getLastCall().element).includes('Six films, picked for you'));
    global.fetch = ORIGINAL_FETCH;
    process.env = { ...ORIGINAL_ENV };
  });
});
