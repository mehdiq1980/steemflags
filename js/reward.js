import { loadState, saveState } from './storage.js';

const GITHUB_ISSUE_URL = 'https://github.com/mehdiq1980/steemflags/issues/new';

function buildIssueUrl({username,sf,eventId}){
  const title=`[SF-EVENT] ${username} +${sf} D2E`;
  const body=[
    '[SF-EVENT]',
    `event_id: ${eventId}`,
    `username: ${username}`,
    'type: game_result',
    `sf_delta: ${sf}`,
    `created_at: ${new Date().toISOString()}`
  ].join('\n');
  return `${GITHUB_ISSUE_URL}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

function saveReward(username, amount){
  const state = loadState(username);
  state.sf = Number(state.sf || 0) + Number(amount);
  saveState(state, username);
  return state.sf;
}

export function showClaimDialog({username,sf,eventId}){
  const overlay=document.createElement('div');
  overlay.innerHTML=`<div style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#081020dd;overflow:auto;padding:20px;box-sizing:border-box"><div style="width:min(520px,100%);background:#0d1628;padding:30px;border-radius:20px;text-align:center;color:white;box-sizing:border-box"><h2>Game Complete!</h2><div style="font-size:48px;font-weight:bold">+${sf} D2E</div><button id="sfClaimButton" style="margin-top:20px;padding:15px 30px;background:#22c55e;border:0;border-radius:12px;font-weight:bold">Claim Rewards</button><div style="margin-top:24px;width:100%;overflow:hidden;border-radius:12px;background:#fff"><iframe src="./savewarninig.html" title="Save reward warning" style="display:block;width:100%;height:360px;border:0" loading="eager"></iframe></div></div></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#sfClaimButton').onclick=()=>{
    saveReward(username,sf);
    const url=buildIssueUrl({username,sf,eventId});
    window.open(url,'_blank','noopener,noreferrer');
    overlay.remove();
    window.location.replace('./');
  };
}

export async function broadcastSFReward({username,sf,eventId}){
  const account=String(username??'').trim().toLowerCase();
  const amount=Number(sf);
  const id=String(eventId??'').trim();
  if(!/^[a-z0-9.-]{3,32}$/.test(account)||!Number.isInteger(amount)||amount<1||amount>20||!id) return {ok:false};
  showClaimDialog({username:account,sf:amount,eventId:id});
  return {ok:true,waitingForClaim:true};
}
