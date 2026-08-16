import assert from 'node:assert/strict';
import test from 'node:test';
import { authorizeUser, authorizeMutation } from '../auth/authorization.js';

test('allows access to the authenticated user resource', () => {
  const session = { userId: 10 };
  assert.equal(authorizeUser(session, 10).userId, 10);
});

test('rejects access to another user resource', () => {
  assert.throws(() => authorizeUser({ userId: 10 }, 11), /Forbidden/);
});

test('mutation authorization uses the same ownership boundary', () => {
  assert.equal(authorizeMutation({ userId: '10' }, 10).userId, '10');
});
