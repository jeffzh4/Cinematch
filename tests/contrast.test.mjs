import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { relativeLuminance, contrastRatio } from '../scripts/contrast.mjs';

describe('relativeLuminance', () => {
  test('white is 1.0', () => {
    assert.ok(Math.abs(relativeLuminance('#ffffff') - 1) < 0.0001);
  });
  test('black is 0.0', () => {
    assert.ok(Math.abs(relativeLuminance('#000000') - 0) < 0.0001);
  });
});

describe('contrastRatio', () => {
  test('white vs black is the theoretical max, 21:1', () => {
    assert.ok(Math.abs(contrastRatio('#ffffff', '#000000') - 21) < 0.01);
  });
  test('a color against itself is 1:1', () => {
    assert.ok(Math.abs(contrastRatio('#a78bff', '#a78bff') - 1) < 0.0001);
  });
  test('is symmetric — order of arguments does not matter', () => {
    const a = contrastRatio('#0c0c0c', '#f5f5f0');
    const b = contrastRatio('#f5f5f0', '#0c0c0c');
    assert.ok(Math.abs(a - b) < 0.0001);
  });
  test('CineMatch --ink-faint on --bg clears the WCAG AA 4.5:1 minimum', () => {
    const ratio = contrastRatio('#0c0c0c', '#8f8f89');
    assert.ok(ratio >= 4.5, `expected >= 4.5, got ${ratio}`);
  });
  test('the OLD --ink-faint value (#5a5a58) would have failed the minimum', () => {
    // Regression guard: this is the value a prior contrast bug shipped with.
    const ratio = contrastRatio('#0c0c0c', '#5a5a58');
    assert.ok(ratio < 4.5, `expected < 4.5 (this old value should fail), got ${ratio}`);
  });
});
