import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  applySecurityHeaders,
  clientKey,
  rateLimit,
  boundedString,
  boundedStringArray,
} from '../api/_security.ts';

function mockRes() {
  return {
    _headers: {},
    _status: 200,
    _body: undefined,
    setHeader(k, v) { this._headers[k] = v; return this; },
    status(c) { this._status = c; return this; },
    json(b) { this._body = b; return this; },
  };
}

describe('boundedString', () => {
  test('trims and truncates', () => {
    assert.equal(boundedString('  hello world  ', 5), 'hello');
  });
  test('non-string input returns empty string', () => {
    assert.equal(boundedString(42, 10), '');
    assert.equal(boundedString(null, 10), '');
    assert.equal(boundedString(undefined, 10), '');
    assert.equal(boundedString({}, 10), '');
    assert.equal(boundedString(['x'], 10), '');
  });
  test('short string passes through untouched', () => {
    assert.equal(boundedString('hi', 100), 'hi');
  });
});

describe('boundedStringArray', () => {
  test('filters non-string items, trims, truncates, caps length', () => {
    const input = ['  drama  ', 42, 'comedy', null, 'thriller', 'sci-fi'];
    assert.deepEqual(boundedStringArray(input, 3, 20), ['drama', 'comedy', 'thriller']);
  });
  test('non-array input returns empty array', () => {
    assert.deepEqual(boundedStringArray('not an array', 5, 10), []);
    assert.deepEqual(boundedStringArray(null, 5, 10), []);
  });
  test('drops empty strings after trim', () => {
    assert.deepEqual(boundedStringArray(['  ', 'x', ''], 5, 10), ['x']);
  });
  test('truncates each item to maxLength', () => {
    assert.deepEqual(boundedStringArray(['abcdefgh'], 5, 3), ['abc']);
  });
});

describe('clientKey', () => {
  test('uses first x-forwarded-for entry when present', () => {
    const req = { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }, socket: {} };
    assert.equal(clientKey(req), '1.2.3.4');
  });
  test('handles x-forwarded-for as an array (some runtimes normalize this way)', () => {
    const req = { headers: { 'x-forwarded-for': ['9.9.9.9', '1.1.1.1'] }, socket: {} };
    assert.equal(clientKey(req), '9.9.9.9');
  });
  test('falls back to socket.remoteAddress when header absent', () => {
    const req = { headers: {}, socket: { remoteAddress: '10.0.0.1' } };
    assert.equal(clientKey(req), '10.0.0.1');
  });
  test('falls back to "unknown" when nothing is available', () => {
    const req = { headers: {}, socket: {} };
    assert.equal(clientKey(req), 'unknown');
  });
});

describe('applySecurityHeaders', () => {
  test('sets the expected hardening headers', () => {
    const res = mockRes();
    applySecurityHeaders(res);
    assert.equal(res._headers['X-Content-Type-Options'], 'nosniff');
    assert.equal(res._headers['X-Frame-Options'], 'DENY');
    assert.equal(res._headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
    assert.equal(res._headers['Permissions-Policy'], 'camera=(), microphone=(), geolocation=()');
  });
});

describe('rateLimit', () => {
  test('allows requests under the limit', () => {
    const req = { headers: { 'x-forwarded-for': 'test-ip-1' }, socket: {}, url: '/api/test-under' };
    const res = mockRes();
    assert.equal(rateLimit(req, res, 3, 60_000), true);
    assert.equal(rateLimit(req, res, 3, 60_000), true);
    assert.equal(rateLimit(req, res, 3, 60_000), true);
  });

  test('blocks requests once the limit is exceeded, sets Retry-After and 429', () => {
    const req = { headers: { 'x-forwarded-for': 'test-ip-2' }, socket: {}, url: '/api/test-over' };
    const res = mockRes();
    assert.equal(rateLimit(req, res, 2, 60_000), true);
    assert.equal(rateLimit(req, res, 2, 60_000), true);
    assert.equal(rateLimit(req, res, 2, 60_000), false);
    assert.equal(res._status, 429);
    assert.equal(res._body.error, 'Too many requests');
    assert.ok(res._headers['Retry-After'] > 0);
  });

  test('different clients on the same route have independent buckets', () => {
    const resA = mockRes();
    const resB = mockRes();
    const reqA = { headers: { 'x-forwarded-for': 'client-a' }, socket: {}, url: '/api/test-independent' };
    const reqB = { headers: { 'x-forwarded-for': 'client-b' }, socket: {}, url: '/api/test-independent' };
    assert.equal(rateLimit(reqA, resA, 1, 60_000), true);
    assert.equal(rateLimit(reqA, resA, 1, 60_000), false); // client A now over limit
    assert.equal(rateLimit(reqB, resB, 1, 60_000), true);  // client B unaffected
  });
});
