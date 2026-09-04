const STEEM_RPC_ENDPOINTS = [
  'https://steemflags.mehdiq.workers.dev/api/steem-rpc',
  'https://api.justyy.com',
  'https://api3.justyy.com',
  'https://steemd.steemworld.org',
  'https://api.steemyy.com',
  'https://api2.justyy.com',
  'https://api.steemitdev.com',
  'https://api.steemit.com',
  'https://steem.senior.workers.dev',
  'https://steem.justyy.com',
  'https://api.steem.fans'
];
const RPC_TIMEOUT_MS = 7000;
const AUTH_TIMEOUT_MS = 25000;
const DSTEEM_SOURCES = [
  'https://unpkg.com/dsteem@0.11.5/dist/dsteem.js',
  'https://cdn.jsdelivr.net/npm/dsteem@0.11.5/dist/dsteem.js'
];
let dsteemPromise = null;

function loadScript(src){
  return new Promise((resolve,reject)=>{
    const existing=[...document.scripts].find(script=>script.src===src);
    if(existing){
      if(globalThis.dsteem?.PrivateKey)return resolve(globalThis.dsteem);
      existing.addEventListener('load',()=>resolve(globalThis.dsteem),{once:true});
      existing.addEventListener('error',()=>reject(new Error('AUTH_LIBRARY_LOAD_FAILED')),{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src=src;
    script.async=true;
    const timer=setTimeout(()=>{script.remove();reject(new Error('AUTH_LIBRARY_TIMEOUT'))},10000);
    script.onload=()=>{clearTimeout(timer);globalThis.dsteem?.PrivateKey?resolve(globalThis.dsteem):reject(new Error('AUTH_LIBRARY_INVALID'))};
    script.onerror=()=>{clearTimeout(timer);script.remove();reject(new Error('AUTH_LIBRARY_LOAD_FAILED'))};
    document.head.appendChild(script);
  });
}

async function getDsteem(){
  if(globalThis.dsteem?.PrivateKey)return globalThis.dsteem;
  if(!dsteemPromise){
    dsteemPromise=Promise.any(DSTEEM_SOURCES.map(source=>loadScript(source))).catch(error=>{dsteemPromise=null;throw new Error(`AUTH_LIBRARY_UNAVAILABLE: ${error?.message||'dsteem could not be loaded'}`)});
  }
  return dsteemPromise;
}

function normalizeKey(value){return String(value??'').trim().toUpperCase()}

async function rpcRequest(body){
  const requests=STEEM_RPC_ENDPOINTS.map(endpoint=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),RPC_TIMEOUT_MS);
    return fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body,cache:'no-store',signal:controller.signal})
      .then(async response=>{
        if(!response.ok)throw new Error(`HTTP_${response.status}`);
        const payload=await response.json();
        if(payload?.error)throw new Error(payload.error.message||'RPC_ERROR');
        const accounts=payload?.result;
        if(Array.isArray(accounts)&&accounts.length>0&&accounts[0])return accounts[0];
        throw new Error('ACCOUNT_NOT_FOUND');
      })
      .finally(()=>clearTimeout(timer));
  });
  try{return await Promise.any(requests)}catch(error){
    const errors=Array.isArray(error?.errors)?error.errors:[];
    if(errors.some(item=>item?.message==='ACCOUNT_NOT_FOUND'))throw new Error('ACCOUNT_NOT_FOUND');
    throw new Error('STEEM_RPC_UNAVAILABLE');
  }
}

async function getAccount(accountName){
  const body=JSON.stringify({jsonrpc:'2.0',method:'condenser_api.get_accounts',params:[[accountName]],id:1});
  try{return await rpcRequest(body)}catch(error){
    if(error?.message==='ACCOUNT_NOT_FOUND')throw error;
    console.warn('Steem RPC failed on all endpoints',error);
    throw new Error('STEEM_RPC_UNAVAILABLE');
  }
}

export async function verifyPostingKey(username,postingKey){
  const accountName=String(username??'').trim().toLowerCase();
  const keyValue=String(postingKey??'').trim();
  if(!accountName)throw new Error('USERNAME_EMPTY');
  if(!keyValue)throw new Error('POSTING_KEY_EMPTY');

  const authPromise=(async()=>{
    const dsteem=await getDsteem();
    let privateKey;
    try{privateKey=dsteem.PrivateKey.fromString(keyValue)}catch{throw new Error('POSTING_KEY_FORMAT')}
    let publicKey;
    try{publicKey=privateKey.createPublic().toString()}catch{throw new Error('POSTING_KEY_PUBLIC_KEY_ERROR')}

    const account=await getAccount(accountName);
    const authority=account?.posting;
    if(!authority)throw new Error('POSTING_AUTHORITY_MISSING');

    const threshold=Number(authority.weight_threshold??1);
    const keyAuths=Array.isArray(authority.key_auths)?authority.key_auths:[];
    const matchingWeight=keyAuths.reduce((sum,entry)=>{
      const authorityKey=Array.isArray(entry)?entry[0]:entry?.key;
      const weight=Number(Array.isArray(entry)?entry[1]:entry?.weight??0);
      return normalizeKey(authorityKey)===normalizeKey(publicKey)?sum+weight:sum;
    },0);

    if(matchingWeight<threshold)throw new Error(`POSTING_KEY_UNAUTHORIZED: public key does not match posting authority (weight ${matchingWeight}/${threshold})`);
    return {username:account.name,publicKey};
  })();

  let timeoutId;
  const timeout=new Promise((_,reject)=>{timeoutId=setTimeout(()=>reject(new Error('AUTH_TIMEOUT')),AUTH_TIMEOUT_MS)});
  try{return await Promise.race([authPromise,timeout])}finally{clearTimeout(timeoutId)}
}
