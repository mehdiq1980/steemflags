const STEEM_RPC = 'https://api.steemit.com';

function getDsteem() {
  const lib = globalThis.dsteem;
  if (!lib?.Client || !lib?.PrivateKey) throw new Error('AUTH_LIBRARY_UNAVAILABLE');
  return lib;
}

function normalizeKey(value) {
  return String(value ?? '').trim().toUpperCase();
}

export async function verifyPostingKey(username, postingKey) {
  const dsteem = getDsteem();
  const accountName = String(username ?? '').trim().toLowerCase();
  const value = String(postingKey ?? '').trim();
  if (!value) throw new Error('POSTING_KEY_EMPTY');

  let privateKey;
  try {
    privateKey = dsteem.PrivateKey.fromString(value);
  } catch (error) {
    console.error('Posting key parsing failed:', error);
    throw new Error('POSTING_KEY_FORMAT');
  }

  const derivedPublicKey = normalizeKey(privateKey.createPublic().toString());
  const client = new dsteem.Client(STEEM_RPC);

  let accounts;
  try {
    accounts = await client.database.getAccounts([accountName]);
  } catch (error) {
    console.error('Steem RPC account lookup failed:', error);
    throw new Error('STEEM_RPC_UNAVAILABLE');
  }

  const account = accounts?.[0];
  if (!account) throw new Error('ACCOUNT_NOT_FOUND');

  const authority = account.posting;
  const keyAuths = Array.isArray(authority?.key_auths) ? authority.key_auths : [];
  const threshold = Number(authority?.weight_threshold ?? 1);
  const matchingWeight = keyAuths.reduce((sum, entry) => {
    const key = Array.isArray(entry) ? entry[0] : entry?.key;
    const weight = Number(Array.isArray(entry) ? entry[1] : entry?.weight ?? 0);
    return normalizeKey(key) === derivedPublicKey ? sum + weight : sum;
  }, 0);

  // A posting key is authorized only when its weight can satisfy the
  // posting authority threshold. This also supports accounts with
  // multiple posting keys instead of treating mere key presence as enough.
  if (matchingWeight < threshold) {
    throw new Error('POSTING_KEY_UNAUTHORIZED');
  }

  return { username: account.name, publicKey: privateKey.createPublic().toString() };
}
