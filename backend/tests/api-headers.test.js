import assert from 'node:assert/strict';
import test from 'node:test';
import { JSON_HEADERS, withJsonHeaders } from '../api/headers.js';

test('defines JSON and no-store response headers', () => {
  assert.equal(JSON_HEADERS['content-type'], 'application/json; charset=utf-8');
  assert.equal(JSON_HEADERS['cache-control'], 'no-store');
});

test('preserves custom headers while applying defaults', () => {
  const response = withJsonHeaders({ status: 200, headers: { 'x-request-id': '1' } });
  assert.equal(response.headers['x-request-id'], '1');
  assert.equal(response.headers['cache-control'], 'no-store');
});
