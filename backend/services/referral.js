export const REFERRAL_REWARD = 5;

export function normalizeCode(code) {
  return String(code ?? '').trim().toLowerCase();
}

export function validateReferral({ inviterId, inviteeId, existingReferral }) {
  if (!inviterId || !inviteeId) throw new Error('Missing referral participants');
  if (String(inviterId) === String(inviteeId)) throw new Error('Self referral is not allowed');
  if (existingReferral) throw new Error('Referral already claimed');
  return true;
}

export function rewardAmount() {
  return REFERRAL_REWARD;
}
