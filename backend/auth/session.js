const USERNAME_RE = /^[a-z0-9.-]{3,32}$/i;

export function normalizeUsername(username) {
  const value = String(username ?? '').trim().toLowerCase();
  if (!USERNAME_RE.test(value)) throw new Error('Invalid Steem username');
  return value;
}

export function createSession(user) {
  if (!user?.id || !user?.steem_username) throw new Error('User is required');
  return Object.freeze({ userId: user.id, username: user.steem_username });
}

export function requireSession(session) {
  if (!session?.userId) throw new Error('Authentication required');
  return session;
}
