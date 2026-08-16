export function validateReferralCode(code) {
  const value = String(code ?? '').trim().toLowerCase();
  if (!/^[a-z0-9_-]{4,64}$/.test(value)) throw new Error('Invalid referral code');
  return value;
}
