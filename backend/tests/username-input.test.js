import assert from 'node:assert/strict';
import test from 'node:test';
import { validateUsernameInput } from '../validation/username-input.js';

test('normalizes a valid username', () => {
  assert.equal(validateUsernameInput(' Player-01 '), 'player-01');
});

test('rejects malformed usernames', () => {
  assert.throws(() => validateUsernameInput('x'), /Invalid username/);
  assert.throws(() => validateUsernameInput('bad user'), /Invalid username/);
});
