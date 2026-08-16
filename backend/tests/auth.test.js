import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeUsername, createSession, requireSession } from '../auth/session.js';

test('normalizes a valid username', () => {
  assert.equal(normalizeUsername('  Player-01 '), 'player-01');
});

test('rejects invalid usernames', () => {
  assert.throws(() => normalizeUsername('x'), /Invalid Steem username/);
});

test('creates and validates an authenticated session', () => {
  const session = createSession({ id: 12, steem_username: 'player' });
  assert.equal(requireSession(session).userId, 12);
});

test('rejects an unauthenticated request', () => {
  assert.throws(() => requireSession(null), /Authentication required/);
});
