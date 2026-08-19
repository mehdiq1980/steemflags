const STEEM_NODES = ['https://api.steemit.com','https://api.steem.fans','https://api.steemyy.com','https://api.steemitdev.com'];
const REWARD_ID = 'steemflags_reward_v1';

function getClient(){
  if(!globalThis.dsteem?.Client || !globalThis.dsteem?.PrivateKey) throw new Error('DSTEEM_UNAVAILABLE');
  return globalThis.dsteem;
}

export async function broadcastSFReward({username, sf, eventId}, privateKey){
  const account = String(username ?? '').trim().toLowerCase();
  const amount = Number(sf);
  const id = String(eventId ?? '').trim();
  if(!account || !id || !Number.isInteger(amount) || amount < 1 || amount > 20 || !privateKey) return {ok:false};
  const dsteem = getClient();
  const json = JSON.stringify({
    app: 'steem-flags',
    version: 1,
    type: 'reward',
    event_id: id,
    username: account,
    sf: amount,
    created_at: new Date().toISOString()
  });
  const data = {
    id: REWARD_ID,
    json,
    required_auths: [],
    required_posting_auths: [account]
  };
  let lastError = null;
  for(const node of STEEM_NODES){
    try{
      const client = new dsteem.Client(node);
      const result = await client.broadcast.json(data, privateKey);
      return {ok:true, result};
    }catch(error){
      lastError = error;
      console.warn('Steem reward broadcast failed', node, error);
    }
  }
  return {ok:false, error:lastError};
}
