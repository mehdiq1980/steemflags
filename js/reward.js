const GITHUB_ISSUE_URL = 'https://github.com/mehdiq1980/steemflags/issues/new';

function ensureClaimStyles(){
  if(document.getElementById('sfClaimStyles')) return;
  const style=document.createElement('style');
  style.id='sfClaimStyles';
  style.textContent=`
    .sfClaimOverlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,8,20,.82);backdrop-filter:blur(5px)}
    .sfClaimCard{width:min(92vw,430px);padding:34px 24px;text-align:center;border-radius:24px;background:#0d1628;border:1px solid rgba(255,255,255,.12);box-shadow:0 20px 70px rgba(0,0,0,.45)}
    .sfClaimTitle{margin:0 0 16px;font-size:1.4rem;font-weight:800}.sfClaimAmount{margin:8px 0 26px;font-size:3.8rem;line-height:1;font-weight:900;letter-spacing:-.05em}.sfClaimUnit{font-size:1.25rem;font-weight:800;margin-left:7px}
    .sfClaimButton{width:100%;border:0;border-radius:14px;padding:16px 20px;background:#22c55e;color:#06120a;font-size:1.1rem;font-weight:900;cursor:pointer}.sfClaimButton:hover{background:#16a34a}.sfClaimButton:disabled{opacity:.65;cursor:wait}
    .sfClaimStatus{min-height:1.4em;margin:14px 0 0;font-size:.92rem;color:#aab6c9}
  `;
  document.head.appendChild(style);
}

function buildIssueUrl({username,sf,eventId}){
  const title=`[SF-EVENT] ${username} +${sf} SF`;
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

export function showClaimDialog({username,sf,eventId}){
  ensureClaimStyles();
  document.getElementById('sfClaimOverlay')?.remove();
  const overlay=document.createElement('div');
  overlay.id='sfClaimOverlay';
  overlay.className='sfClaimOverlay';
  overlay.innerHTML=`<section class="sfClaimCard" role="dialog" aria-modal="true">
    <h2 class="sfClaimTitle">Game Complete!</h2>
    <div class="sfClaimAmount">+${sf}<span class="sfClaimUnit">SF</span></div>
    <button id="sfClaimButton" class="sfClaimButton" type="button">Claim Rewards</button>
    <p class="sfClaimStatus">Your reward is ready to claim.</p>
  </section>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#sfClaimButton').addEventListener('click',()=>{
    const url=buildIssueUrl({username,sf,eventId});
    const issueTab=window.open(url,'_blank','noopener,noreferrer');
    if(!issueTab){
      window.location.assign(url);
      return;
    }
    overlay.remove();
    window.location.assign('./');
  });
}

export async function broadcastSFReward({username,sf,eventId}){
  const account=String(username??'').trim().toLowerCase();
  const amount=Number(sf);
  const id=String(eventId??'').trim();
  if(!/^[a-z0-9.-]{3,32}$/.test(account)||!Number.isInteger(amount)||amount<1||amount>20||!id) return {ok:false};
  showClaimDialog({username:account,sf:amount,eventId:id});
  return {ok:true,waitingForClaim:true};
}
