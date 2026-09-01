const LEADERBOARD_PATH='data/leaderboard.json';

function avatarUrl(username){return `https://steemitimages.com/u/${encodeURIComponent(username)}/avatar`;}
function escapeHtml(value){return String(value).replace(/[&<>\\'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));}

async function readLeaderboard(){
  // Resolve from the actual document URL. This works on GitHub Pages project
  // sites (/steemflags/), nested pages, and local previews without hardcoding
  // the repository path.
  const url=new URL(LEADERBOARD_PATH,document.baseURI);
  url.searchParams.set('v',Date.now().toString());

  let response;
  try{
    response=await fetch(url.href,{method:'GET',cache:'no-store',headers:{'Accept':'application/json'}});
  }catch(e){
    throw Error(`LEADERBOARD_NETWORK: ${e?.message||'network error'}`);
  }
  if(!response.ok)throw Error(`LEADERBOARD_${response.status}`);

  const text=await response.text();
  let data;
  try{data=JSON.parse(text)}catch{throw Error('LEADERBOARD_JSON_INVALID')}

  if(data&&data.players&&typeof data.players==='object'&&!Array.isArray(data.players)){
    return Object.entries(data.players).map(([username,player])=>({
      Username:username,
      D2E:Number(player?.sf??player?.D2E??player?.d2e)||0
    }));
  }
  if(Array.isArray(data?.accounts))return data.accounts;
  if(Array.isArray(data?.players))return data.players;
  throw Error('LEADERBOARD_DATA_INVALID');
}

function renderLeaderboard(accounts){
  const body=document.getElementById('leaderboardBody');
  if(!body)return;
  accounts.sort((a,b)=>(Number(b?.D2E??b?.d2e??b?.sf)||0)-(Number(a?.D2E??a?.d2e??a?.sf)||0)||String(a?.Username||a?.username||'').localeCompare(String(b?.Username||b?.username||'')));
  body.innerHTML=accounts.map((a,i)=>{
    const u=String(a?.Username||a?.username||'—');
    const d=Math.max(0,Number(a?.D2E??a?.d2e??a?.sf)||0);
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
