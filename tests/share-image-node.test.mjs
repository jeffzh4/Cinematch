import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);

test('CommonJS Node endpoint renders a real PNG with the installed OG package', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'share-image-node-'));
  try {
    const output = await build({
      entryPoints: ['api/share-image.ts'],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      write: false,
      plugins: [{
        name: 'installed-node-renderer',
        setup(builder) {
          builder.onResolve({ filter: /^@vercel\/og$/ }, () => ({
            path: require.resolve('@vercel/og'),
            external: true,
          }));
        },
      }],
    });
    const file = join(directory, 'handler.cjs');
    await writeFile(file, output.outputFiles[0].contents);
    const { default: compiled } = await import(pathToFileURL(file).href);
    assert.equal(compiled.config, undefined, 'endpoint must use the default Node runtime');
    const response = {
      headers: {},
      setHeader(name, value) { this.headers[name] = value; },
      status(code) { this.statusCode = code; return this; },
      end(body) { this.body = body; },
    };
    await compiled.default({ method: 'GET', query: {} }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['Content-Type'], 'image/png');
    assert.deepEqual([...response.body.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(response.body.readUInt32BE(16), 1200);
    assert.equal(response.body.readUInt32BE(20), 630);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
