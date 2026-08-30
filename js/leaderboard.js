const API_BASE='https://steemflags.mehdiq.workers.dev';
function avatarUrl(username){return `https://steemitimages.com/u/${encodeURIComponent(username)}/avatar`;}
function escapeHtml(value){return String(value).replace(/[&<>\'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));}
function loadLeaderboard(){
  const status=document.getElementById('leaderboardStatus');
  const body=document.getElementById('leaderboardBody');
  if(!status||!body)return false;
  status.hidden=false;status.textContent='Loading leaderboard…';
  fetch(`${API_BASE}/api/leaderboard?limit=100`,{method:'GET',cache:'no-store'})
    .then(async r=>{const text=await r.text();let d=null;try{d=JSON.parse(text)}catch{}if(!r.ok)throw Error(d?.error||`LEADERBOARD_API_${r.status}`);if(!d?.success||!Array.isArray(d.accounts))throw Error('LEADERBOARD_API_INVALID');return d.accounts})
    .then(accounts=>{
      accounts.sort((a,b)=>(Number(b?.D2E)||0)-(Number(a?.D2E)||0)||String(a?.Username||'').localeCompare(String(b?.Username||'')));
      body.innerHTML=accounts.map((a,i)=>{const u=String(a?.Username||a?.username||'—');const d=Math.max(0,Number(a?.D2E??a?.d2e)||0);const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':String(i+1);return `<tr><td>${medal}</td><td><div class="leaderboardUser"><img class="leaderboardAvatar" src="${avatarUrl(u)}" alt="@${escapeHtml(u)}" loading="lazy" onerror="this.style.visibility='hidden'"><span>@${escapeHtml(u)}</span></div></td><td>${d.toLocaleString()}</td></tr>`}).join('')||'<tr><td colspan="3" class="muted">No players yet.</td></tr>';
      status.hidden=true;
    })
    .catch(e=>{console.error('Leaderboard load failed:',e);status.hidden=false;status.textContent='Unable to load leaderboard. Please refresh the page.';body.innerHTML='';});
  return true;
}
function initLeaderboard(){if(loadLeaderboard())return;let n=0;const t=setInterval(()=>{if(loadLeaderboard()||++n>=40)clearInterval(t)},250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initLeaderboard,{once:true});else initLeaderboard();
window.addEventListener('steemflags:ready',initLeaderboard,{once:true});
