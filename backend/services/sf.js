/**
 * Server-side SF rules. Database writes must be performed in a transaction
 * by the API layer; this module deliberately contains no browser/localStorage code.
 */

export const SF_TYPES = Object.freeze({
  CORRECT_ANSWER: 'CORRECT_ANSWER',
  WRONG_ANSWER: 'WRONG_ANSWER',
  VIDEO_REWARD: 'VIDEO_REWARD',
  REFERRAL: 'REFERRAL',
  ENERGY_PURCHASE: 'ENERGY_PURCHASE'
});

export function nextBalance(currentBalance, delta) {
  const current = Number(currentBalance);
  const change = Number(delta);
  if (!Number.isFinite(current) || current < 0) throw new Error('Invalid SF balance');
  if (!Number.isFinite(change) || !Number.isInteger(change)) throw new Error('Invalid SF change');
  return Math.max(0, current + change);
}

export function answerDelta(correct) {
  return correct ? 1 : -1;
}

export function assertIntegerSF(amount) {
  if (!Number.isInteger(amount)) throw new Error('SF amount must be an integer');
  return amount;
}
