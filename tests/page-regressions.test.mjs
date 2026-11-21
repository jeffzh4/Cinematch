import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('favorites restores its empty state after the saved list becomes empty', () => {
  const html = readFileSync('favorites.html', 'utf8');
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].at(-1)[1];
  let saved = JSON.stringify([{ title: 'Paterson', year: 2016 }]);
  let stateAttached = true;
  const state = {};
  const list = {
    set innerHTML(value) { stateAttached = false; },
    appendChild(node) {
      assert.ok(node, 'empty-state node must remain available after the first render');
      if (node === state) stateAttached = true;
    },
  };
  const context = {
    localStorage: { getItem: () => saved },
    window: {},
    document: {
      getElementById: id => id === 'film-list' ? list : stateAttached ? state : null,
      createElement: () => ({}),
      querySelectorAll: () => [],
    },
  };
  runInNewContext(script, context);
  assert.equal(stateAttached, false);
  saved = '[]';
  context.render();
  assert.equal(stateAttached, true);
});
