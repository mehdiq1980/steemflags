import assert from 'node:assert/strict';
import test from 'node:test';
import { validateReferralCode } from '../validation/referral-input.js';

test('normalizes a valid referral code', () => {
  assert.equal(validateReferralCode(' ABC_1234 '), 'abc_1234');
});

test('rejects malformed referral codes', () => {
  assert.throws(() => validateReferralCode('x'), /Invalid referral code/);
  assert.throws(() => validateReferralCode('bad code'), /Invalid referral code/);
});
