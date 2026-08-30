const LEADERBOARD_URL='../data/leaderboard.json';

function avatarUrl(username){return `https://steemitimages.com/u/${encodeURIComponent(username)}/avatar`;}
function escapeHtml(value){return String(value).replace(/[&<>\\'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));}

async function readLeaderboard(){
  // leaderboard.js lives in /js, so ../data points to the repository's /data directory.
  // Keep the request same-origin so GitHub Pages does not depend on raw.githubusercontent.com CORS.
  const response=await fetch(`${LEADERBOARD_URL}?v=${Date.now()}`,{method:'GET',cache:'no-store'});
  if(!response.ok)throw Error(`LEADERBOARD_${response.status}`);
  const data=await response.json();

  if(data&&data.players&&typeof data.players==='object'){
    return Object.entries(data.players).map(([username,player])=>({
      Username:username,
      D2E:Number(player?.sf??player?.D2E??player?.d2e)||0
    }));
  }
  if(Array.isArray(data?.accounts))return data.accounts;
  if(Array.isArray(data?.players))return data.players;
  throw Error('LEADERBOARD_DATA_INVALID');
}

function loadLeaderboard(){
  const status=document.getElementById('leaderboardStatus');
  const body=document.getElementById('leaderboardBody');
  if(!status||!body)return false;
  status.hidden=false;
  status.textContent='Loading leaderboard…';

  readLeaderboard().then(accounts=>{
    accounts.sort((a,b)=>(Number(b?.D2E??b?.d2e??b?.sf)||0)-(Number(a?.D2E??a?.d2e??a?.sf)||0)||String(a?.Username||a?.username||'').localeCompare(String(b?.Username||b?.username||'')));
    body.innerHTML=accounts.map((a,i)=>{
      const u=String(a?.Username||a?.username||'—');
      const d=Math.max(0,Number(a?.D2E??a?.d2e??a?.sf)||0);
      const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':String(i+1);
      return `<tr><td>${medal}</td><td><div class="leaderboardUser"><img class="leaderboardAvatar" src="${avatarUrl(u)}" alt="@${escapeHtml(u)}" loading="lazy" onerror="this.style.visibility='hidden'"><span>@${escapeHtml(u)}</span></div></td><td>${d.toLocaleString()}</td></tr>`;
    }).join('')||'<tr><td colspan="3" class="muted">No players yet.</td></tr>';
    status.hidden=true;
  }).catch(e=>{
    console.error('Leaderboard load failed:',e);
    status.hidden=false;
    status.textContent='Unable to load leaderboard. Please refresh the page.';
    body.innerHTML='';
  });
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
