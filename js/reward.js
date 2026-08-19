const CLAIM_ENDPOINT = '/api/claim';

function ensureClaimStyles(){
  if(document.getElementById('sfClaimStyles')) return;
  const style=document.createElement('style');
  style.id='sfClaimStyles';
  style.textContent=`
    .sfClaimOverlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,8,20,.82);backdrop-filter:blur(5px)}
    .sfClaimCard{width:min(92vw,430px);padding:32px 24px;text-align:center;border-radius:24px;background:#0d1628;border:1px solid rgba(255,255,255,.12);box-shadow:0 20px 70px rgba(0,0,0,.45)}
    .sfClaimTitle{margin:0 0 12px;font-size:1.35rem;font-weight:800}.sfClaimAmount{margin:8px 0 24px;font-size:3.2rem;line-height:1;font-weight:900;letter-spacing:-.04em}.sfClaimUnit{font-size:1.15rem;font-weight:800;margin-left:6px}
    .sfClaimButton{width:100%;border:0;border-radius:14px;padding:15px 20px;background:#22c55e;color:#06120a;font-size:1.08rem;font-weight:900;cursor:pointer}.sfClaimButton:disabled{opacity:.65;cursor:wait}
    .sfClaimStatus{min-height:1.4em;margin:14px 0 0;font-size:.92rem;color:#aab6c9}.sfClaimStatus.ok{color:#6ee7a0}.sfClaimStatus.bad{color:#fca5a5}
  `;
  document.head.appendChild(style);
}

function showClaimDialog({username,sf,eventId}){
  ensureClaimStyles();
  const old=document.getElementById('sfClaimOverlay');
  if(old) old.remove();
  const overlay=document.createElement('div');
  overlay.id='sfClaimOverlay';
  overlay.className='sfClaimOverlay';
  overlay.innerHTML=`<section class="sfClaimCard" role="dialog" aria-modal="true" aria-labelledby="sfClaimTitle">
    <h2 id="sfClaimTitle" class="sfClaimTitle">Game Complete!</h2>
    <div class="sfClaimAmount">+${sf}<span class="sfClaimUnit">SF</span></div>
    <button id="sfClaimButton" class="sfClaimButton" type="button">Claim Rewards</button>
    <p id="sfClaimStatus" class="sfClaimStatus" role="status" aria-live="polite"></p>
  </section>`;
  document.body.appendChild(overlay);
  const button=overlay.querySelector('#sfClaimButton');
  const status=overlay.querySelector('#sfClaimStatus');
  return new Promise(resolve=>{
    button.addEventListener('click',async()=>{
      button.disabled=true;
      status.className='sfClaimStatus';
      status.textContent='Submitting reward…';
      try{
        const response=await fetch(CLAIM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,sf,event_id:eventId})});
        const data=await response.json().catch(()=>({}));
        if(!response.ok||!data.ok) throw new Error(data.error||'Claim failed');
        status.className='sfClaimStatus ok';
        status.textContent='Reward submitted successfully.';
        setTimeout(()=>{overlay.remove();resolve({ok:true,result:data})},650);
      }catch(error){
        button.disabled=false;
        status.className='sfClaimStatus bad';
        status.textContent='Unable to submit reward. Please try again.';
        resolve({ok:false,error});
      }
    });
  });
}

export async function broadcastSFReward({username, sf, eventId}, privateKey){
  const account=String(username??'').trim().toLowerCase();
  const amount=Number(sf);
  const id=String(eventId??'').trim();
  if(!/^[a-z0-9.-]{3,32}$/.test(account)||!Number.isInteger(amount)||amount<1||amount>20||!id||!privateKey) return {ok:false};
  return showClaimDialog({username:account,sf:amount,eventId:id});
}
