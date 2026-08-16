import assert from 'node:assert/strict';
import test from 'node:test';
import { startSession, recordAnswer, TOTAL_QUESTIONS } from '../services/game-session.js';
import { consumeGameEnergy } from '../services/energy.js';
import { answerDelta } from '../services/sf.js';
import { validateReferral } from '../services/referral.js';

test('a game consumes exactly one energy', () => {
  const session = startSession({ energy: 3 });
  assert.equal(session.energyAfter, 2);
});

test('a session completes after 20 answers', () => {
  let session = startSession({ energy: 3 });
  for (let i = 0; i < TOTAL_QUESTIONS; i++) session = recordAnswer(session, true);
  assert.equal(session.questionsAnswered, 20);
  assert.equal(session.completed, true);
  assert.equal(session.points, 20);
});

test('wrong answers subtract exactly one point', () => {
  const session = startSession({ energy: 3 });
  const next = recordAnswer(session, false);
  assert.equal(next.points, -1);
});

test('energy cannot be consumed when empty', () => {
  assert.throws(() => consumeGameEnergy(0), /Not enough energy/);
});

test('answer deltas are +1 and -1', () => {
  assert.equal(answerDelta(true), 1);
  assert.equal(answerDelta(false), -1);
});

test('self referral is rejected', () => {
  assert.throws(() => validateReferral({ inviterId: 7, inviteeId: 7 }), /Self referral/);
});
