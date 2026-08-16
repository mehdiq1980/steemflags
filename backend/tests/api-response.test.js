import assert from 'node:assert/strict';
import test from 'node:test';
import { executeApi } from '../api/response.js';

test('wraps successful API results', async () => {
  const response = await executeApi(async () => ({ value: 1 }));
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { ok: true, data: { value: 1 } });
});

test('normalizes known API errors', async () => {
  const response = await executeApi(async () => { throw new Error('Forbidden'); });
  assert.equal(response.status, 403);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error.code, 'FORBIDDEN');
});
