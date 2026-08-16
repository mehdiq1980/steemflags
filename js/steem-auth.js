const STEEM_RPC = 'https://api.steemit.com';

function getDsteem() {
  const lib = globalThis.dsteem;
  if (!lib?.PrivateKey) throw new Error('AUTH_LIBRARY_UNAVAILABLE');
  return lib;
}

function normalizeKey(value) {
  return String(value ?? '').trim().toUpperCase();
}

async function getAccount(accountName) {
  const response = await fetch(STEEM_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'condenser_api.get_accounts',
      params: [[accountName]],
      id: 1
    }),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`HTTP_${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message || 'RPC_ERROR');
  return payload.result?.[0] ?? null;
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

  let account;
  try {
    account = await getAccount(accountName);
  } catch (error) {
    console.error('Steem RPC account lookup failed:', error);
    throw new Error('STEEM_RPC_UNAVAILABLE');
  }

  if (!account) throw new Error('ACCOUNT_NOT_FOUND');

  const authority = account.posting;
  const keyAuths = Array.isArray(authority?.key_auths) ? authority.key_auths : [];
  const threshold = Number(authority?.weight_threshold ?? 1);
  const matchingWeight = keyAuths.reduce((sum, entry) => {
    const key = Array.isArray(entry) ? entry[0] : entry?.key;
    const weight = Number(Array.isArray(entry) ? entry[1] : entry?.weight ?? 0);
    return normalizeKey(key) === derivedPublicKey ? sum + weight : sum;
  }, 0);

  if (matchingWeight < threshold) throw new Error('POSTING_KEY_UNAUTHORIZED');

  return { username: account.name, publicKey: privateKey.createPublic().toString() };
}
