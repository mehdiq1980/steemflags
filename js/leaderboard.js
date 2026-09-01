const API_BASE='https://steemflags.mehdiq.workers.dev';

function avatarUrl(username){return `https://steemitimages.com/u/${encodeURIComponent(username)}/avatar`;}
function escapeHtml(value){return String(value).replace(/[&<>\\'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));}

async function readLeaderboard(){
  const url=`${API_BASE}/api/account?username=do2earn&_=${Date.now()}`;
  let response;
  try{response=await fetch(url,{method:'GET',cache:'no-store',headers:{'Accept':'application/json','Cache-Control':'no-cache'}})}
  catch(e){throw Error(`LEADERBOARD_NETWORK: ${e?.message||'network error'}`)}
  if(!response.ok)throw Error(`LEADERBOARD_${response.status}`);
  const data=await response.json();
  if(!data?.success||!data.account)throw Error('LEADERBOARD_DATA_INVALID');
  return [{Username:data.account.Username??data.account.username??'do2earn',D2E:Number(data.account.D2E)||0}];
}

function renderLeaderboard(accounts){
  const body=document.getElementById('leaderboardBody');
  if(!body)return;
  accounts.sort((a,b)=>(b.D2E-a.D2E)||String(a.Username).localeCompare(String(b.Username)));
  body.innerHTML=accounts.map((a,i)=>{
    const u=String(a.Username||'—');
    const d=Math.max(0,Number(a.D2E)||0);
    const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':String(i+1);
    return `<tr><td>${medal}</td><td><div class="leaderboardUser"><img class="leaderboardAvatar" src="${avatarUrl(u)}" alt="@${escapeHtml(u)}" loading="lazy" onerror="this.style.visibility='hidden'"><span>@${escapeHtml(u)}</span></div></td><td>${d.toLocaleString()}</td></tr>`;
  }).join('')||'<tr><td colspan="3" class="muted">No players yet.</td></tr>';
}

async function loadLeaderboard(){
  const status=document.getElementById('leaderboardStatus');
  const body=document.getElementById('leaderboardBody');
  if(!status||!body)return false;
  status.hidden=false;
  status.textContent='Loading leaderboard…';
  try{
    const accounts=await readLeaderboard();
    renderLeaderboard(accounts);
    status.hidden=true;
  }catch(e){
    console.error('Leaderboard load failed:',e);
    status.hidden=false;
    status.textContent='Unable to load leaderboard. Please refresh the page.';
    body.innerHTML='';
  }
  return true;
}

function initLeaderboard(){
  if(loadLeaderboard())return;
  let n=0;
  const t=setInterval(()=>{if(loadLeaderboard()||++n>=40)clearInterval(t)},250);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initLeaderboard,{once:true});
else initLeaderboard();
window.addEventListener('steemflags:ready',initLeaderboard,{once:true});
window.addEventListener('steemflags:account-updated',loadLeaderboard);
