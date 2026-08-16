const STEEM_RPC = 'https://api.steemit.com';

function getClient() {
  if (!window.dsteem?.Client || !window.dsteem?.PrivateKey) {
    throw new Error('AUTH_LIBRARY_UNAVAILABLE');
  }
  return new window.dsteem.Client(STEEM_RPC);
}

export async function verifyPostingKey(username, postingKey) {
  const client = getClient();
  const value = String(postingKey || '').trim();
  if (!value) throw new Error('POSTING_KEY_EMPTY');

  let key;
  try {
    key = window.dsteem.PrivateKey.fromString(value);
  } catch {
    throw new Error('POSTING_KEY_FORMAT');
  }

  const publicKey = key.createPublic().toString();
  let accounts;
  try {
    accounts = await client.database.getAccounts([username]);
  } catch {
    throw new Error('STEEM_RPC_UNAVAILABLE');
  }

  const account = accounts?.[0];
  if (!account) throw new Error('ACCOUNT_NOT_FOUND');

  const posting = account.posting || {};
  const authorized = (posting.key_auths || []).some(([keyAuth]) => String(keyAuth).trim() === publicKey);
  if (!authorized) throw new Error('POSTING_KEY_UNAUTHORIZED');

  return { username: account.name, publicKey };
}
