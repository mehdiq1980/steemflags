const API_BASE='https://steemflags.mehdiq.workers.dev';

const status=document.getElementById('leaderboardStatus');
const body=document.getElementById('leaderboardBody');

function avatarUrl(username){
  return `https://steemitimages.com/u/${encodeURIComponent(username)}/avatar`;
}

function escapeHtml(value){
  return String(value).replace(/[&<>\'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
}

function render(accounts){
  if(!body)return;
  const rows=accounts.map((account,index)=>{
    const username=String(account?.Username||account?.username||'—');
    const d2e=Math.max(0,Number(account?.D2E??account?.d2e)||0);
    const medal=index===0?'🥇':index===1?'🥈':index===2?'🥉':String(index+1);
    const avatar=avatarUrl(username);
    return `<tr><td>${medal}</td><td><div class="leaderboardUser"><img class="leaderboardAvatar" src="${avatar}" alt="@${escapeHtml(username)}" loading="lazy" onerror="this.style.visibility='hidden'"><span>@${escapeHtml(username)}</span></div></td><td>${d2e.toLocaleString()} D2E</td></tr>`;
  }).join('');
  body.innerHTML=rows||'<tr><td colspan="3" class="muted">No players yet.</td></tr>';
  if(status)status.hidden=true;
}

async function loadLeaderboard(){
  if(!status||!body)return;
  status.hidden=false;
  status.textContent='Loading leaderboard…';
  try{
    const response=await fetch(`${API_BASE}/api/accounts?limit=100`,{cache:'no-store'});
    if(!response.ok)throw new Error(`LEADERBOARD_API_${response.status}`);
    const data=await response.json();
    if(!data?.success||!Array.isArray(data.accounts))throw new Error('LEADERBOARD_API_INVALID');
    const accounts=data.accounts.slice().sort((a,b)=>{
      const ad=Number(a?.D2E)||0,bd=Number(b?.D2E)||0;
      return bd-ad||String(a?.Username||'').localeCompare(String(b?.Username||''));
    });
    render(accounts);
  }catch(error){
    console.error('Leaderboard load failed:',error);
    status.hidden=false;
    status.textContent='Unable to load leaderboard. Please refresh the page.';
    body.innerHTML='';
  }
}

loadLeaderboard();
