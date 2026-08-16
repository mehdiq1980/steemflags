import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAnswerInput, validateSessionId } from '../validation/game-input.js';

test('accepts a normal answer', () => {
  assert.equal(validateAnswerInput({ answer: 'France' }), 'France');
});

test('rejects missing or oversized answers', () => {
  assert.throws(() => validateAnswerInput({}), /Invalid answer/);
  assert.throws(() => validateAnswerInput({ answer: 'x'.repeat(129) }), /Invalid answer/);
});

test('validates session identifiers', () => {
  assert.equal(validateSessionId('Abc_1234'), 'Abc_1234');
  assert.throws(() => validateSessionId('short'), /Invalid session id/);
});
