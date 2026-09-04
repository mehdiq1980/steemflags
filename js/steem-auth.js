const STEEM_RPCS = [
  'https://api.steemit.com',
  'https://api.steemitdev.com',
  'https://api.steem.fans',
  'https://api.steemyy.com',
  'https://steem.justyy.com',
  'https://api.justyy.com',
  'https://api2.justyy.com',
  'https://api3.justyy.com',
  'https://steemflags.mehdiq.workers.dev/api/steem-rpc'
];

const RPC_TIMEOUT_MS = 7000;

function getDsteem(){
  if(!globalThis.dsteem?.PrivateKey) throw new Error('AUTH_LIBRARY_UNAVAILABLE');
  return globalThis.dsteem;
}

function normalizeKey(value){
  return String(value ?? '').trim().toUpperCase();
}

async function getAccount(accountName){
  const body = JSON.stringify({
    jsonrpc: '2.0',
    method: 'condenser_api.get_accounts',
    params: [[accountName]],
    id: 1
  });
  let lastError = null;
  let sawAccountNotFound = false;

  for(const rpc of STEEM_RPCS){
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);
    try{
      const response = await fetch(rpc, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body,
        cache: 'no-store',
        signal: controller.signal
      });
      if(!response.ok) throw new Error(`HTTP_${response.status}`);
      const payload = await response.json();
      if(payload.error) throw new Error(payload.error.message || 'RPC_ERROR');
      const account = payload.result?.[0];
      if(account) return account;
      sawAccountNotFound = true;
      throw new Error('ACCOUNT_NOT_FOUND');
    }catch(error){
      lastError = error?.name === 'AbortError' ? new Error('RPC_TIMEOUT') : error;
      console.warn(`Steem RPC failed: ${rpc}`, lastError);
    }finally{
      clearTimeout(timer);
    }
  }

  if(sawAccountNotFound && lastError?.message === 'ACCOUNT_NOT_FOUND'){
    throw new Error('ACCOUNT_NOT_FOUND');
  }
  throw new Error(lastError?.message === 'ACCOUNT_NOT_FOUND' ? 'ACCOUNT_NOT_FOUND' : 'STEEM_RPC_UNAVAILABLE');
}

export async function verifyPostingKey(username, postingKey){
  const dsteem = getDsteem();
  const accountName = String(username ?? '').trim().toLowerCase();
  const value = String(postingKey ?? '').trim();
  if(!accountName) throw new Error('USERNAME_EMPTY');
  if(!value) throw new Error('POSTING_KEY_EMPTY');

  let privateKey;
  try{
    privateKey = dsteem.PrivateKey.fromString(value);
  }catch{
    throw new Error('POSTING_KEY_FORMAT');
  }

  let publicKey;
  try{
    publicKey = privateKey.createPublic().toString();
  }catch{
    throw new Error('POSTING_KEY_PUBLIC_KEY_ERROR');
  }

  const account = await getAccount(accountName);
  const authority = account?.posting;
  if(!authority) throw new Error('POSTING_AUTHORITY_MISSING');

  const threshold = Number(authority.weight_threshold ?? 1);
  const keyAuths = Array.isArray(authority.key_auths) ? authority.key_auths : [];
  const matchingWeight = keyAuths.reduce((sum, entry) => {
    const key = Array.isArray(entry) ? entry[0] : entry?.key;
    const weight = Number(Array.isArray(entry) ? entry[1] : entry?.weight ?? 0);
    return normalizeKey(key) === normalizeKey(publicKey) ? sum + weight : sum;
  }, 0);

  if(matchingWeight < threshold){
    throw new Error(`POSTING_KEY_UNAUTHORIZED: public key does not match posting authority (weight ${matchingWeight}/${threshold})`);
  }

  return {username: account.name, publicKey};
}
