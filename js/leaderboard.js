import { t } from './i18n.js';

const root = document.getElementById('leaderboard');
const LEADERBOARD_TITLE = '🏆 Steem Flags Leaderboard';
const DATA_URL = './data/leaderboard.json';

function avatarUrl(username) {
  return `https://steemitimages.com/u/${encodeURIComponent(username)}/avatar`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function render(rows) {
  const body = rows.map((row,index)=>{
    const username=String(row.username||'—');
    const sf=Number(row.sf||0);
    const avatar=row.avatar||avatarUrl(username);
    const medal=index===0?'🥇':index===1?'🥈':index===2?'🥉':String(index+1);
    return `<tr><td class="rank">${medal}</td><td class="leaderPlayer"><img class="leaderAvatar" src="${avatar}" alt="@${username}"><span>@${escapeHtml(username)}</span></td><td>${sf.toLocaleString()} SF</td></tr>`;
  }).join('');

  root.innerHTML=`<h2>${LEADERBOARD_TITLE}</h2><table><thead><tr><th>${t('rank')}</th><th>${t('player')}</th><th>${t('sf')}</th></tr></thead><tbody>${body}</tbody></table>`;
}

async function loadLeaderboard(){
 try{
  const response=await fetch(`${DATA_URL}?v=${Date.now()}`,{cache:'no-store'});
  const data=await response.json();
  const rows=Object.entries(data.players||{}).map(([username,value])=>({username,sf:Number(value?.sf||0),avatar:value?.avatar})).sort((a,b)=>b.sf-a.sf).slice(0,100);
  render(rows);
 }catch(e){
  root.innerHTML=`<h2>${LEADERBOARD_TITLE}</h2>`;
 }
}

if(root) loadLeaderboard();