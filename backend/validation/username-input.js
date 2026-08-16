export function validateUsernameInput(username) {
  const value = String(username ?? '').trim().toLowerCase();
  if (!/^[a-z0-9.-]{3,32}$/.test(value)) throw new Error('Invalid username');
  return value;
}
