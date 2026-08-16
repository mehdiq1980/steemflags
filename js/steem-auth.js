const STEEM_RPC = 'https://api.steemit.com';

function getClient() {
  if (!window.dsteem?.Client || !window.dsteem?.PrivateKey) {
    throw new Error('Steem authentication library is unavailable');
  }
  return new window.dsteem.Client(STEEM_RPC);
}

export async function verifyPostingKey(username, postingKey) {
  const client = getClient();
  const key = window.dsteem.PrivateKey.fromString(postingKey.trim());
  const publicKey = key.createPublic().toString();
  const accounts = await client.database.getAccounts([username]);
  const account = accounts?.[0];
  if (!account) throw new Error('Steem account not found');

  const authorized = (account.posting?.key_auths || []).some(([keyAuth]) => keyAuth === publicKey);
  if (!authorized) throw new Error('Posting key is not authorized for this account');

  return { username: account.name, publicKey };
}
