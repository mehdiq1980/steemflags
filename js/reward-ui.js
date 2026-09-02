const REWARD_STATE_KEY='steemFlagsPendingRewards';
const POLL_MS=250;
let lastShown='';
let endHandled=false;
function readRewards(){try{const raw=localStorage.getItem(REWARD_STATE_KEY);const data=raw?JSON.parse(raw):null;return data?.username?data:null}catch{return null}}
function currentUsername(){try{const s=JSON.parse(localStorage.getItem('steemFlagsAuthSession')||'null');return String(s?.username||'').trim().toLowerCase()}catch{return ''}}
function detectFinishedGame(){
  const game=document.getElementById('gameView'), counter=document.getElementById('questionCounter'), score=document.getElementById('scoreLabel'), answers=document.getElementById('answers');
  if(!game||game.hidden||!counter||!answers)return;
  const text=String(counter.textContent||'');
  if(!/20\s*(of|\/)\s*20/i.test(text))return;
  const buttons=[...answers.querySelectorAll('button')];
  if(!buttons.length||!buttons.every(b=>b.disabled))return;
  const username=currentUsername();
  if(!username||endHandled)return;
  const m=String(score?.textContent||'').match(/-?\d+/);const gameReward=m?Number(m[0]):0;
  endHandled=true;
  try{localStorage.setItem(REWARD_STATE_KEY,JSON.stringify({username,gameReward,perfectBonus:0,adReward:0,context:'game',pendingSave:true}))}catch{}
  game.hidden=true;
  const home=document.getElementById('homeView'),board=document.getElementById('leaderboardSection'),login=document.getElementById('loginView');
  if(login)login.hidden=true;if(home)home.hidden=false;if(board)board.hidden=false;
  window.dispatchEvent(new CustomEvent('steemflags:reward-ready'));
}
function showRewards(data){const modal=document.getElementById('rewardModal'),lines=document.getElementById('rewardLines'),ok=document.getElementById('rewardOkButton'),ad=document.getElementById('sponsorAdButton');if(!modal||!lines||!ok)return;const key=JSON.stringify(data);if(lastShown===key&&!modal.hidden)return;lastShown=key;const gameReward=Number(data.gameReward)||0,perfectBonus=Number(data.perfectBonus)||0,adReward=Number(data.adReward)||0,total=gameReward+perfectBonus+adReward;lines.innerHTML=`<div class="rewardLine"><span>Game Reward</span><strong>${gameReward>0?'+':''}${gameReward} D2E</strong></div><div class="rewardLine"><span>Perfect Bonus</span><strong>${perfectBonus>0?'+':''}${perfectBonus} D2E</strong></div><div class="rewardLine"><span>Sponsor Ad</span><strong>${adReward>0?'+':''}${adReward} D2E</strong></div><div class="rewardLine"><span>Total Reward</span><strong>${total>0?'+':''}${total} D2E</strong></div>`;if(ad)ad.hidden=true;ok.onclick=()=>{modal.hidden=true;try{localStorage.removeItem(REWARD_STATE_KEY)}catch{}const login=document.getElementById('loginView'),home=document.getElementById('homeView'),board=document.getElementById('leaderboardSection'),game=document.getElementById('gameView');if(login)login.hidden=true;if(home)home.hidden=false;if(board)board.hidden=false;if(game)game.hidden=true;window.dispatchEvent(new CustomEvent('steemflags:show-home'))};modal.hidden=false}
function check(){detectFinishedGame();const data=readRewards();const modal=document.getElementById('rewardModal');if(data&&modal)showRewards(data)}
function startRewardUI(){check();setInterval(check,POLL_MS);window.addEventListener('steemflags:reward-ready',check)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startRewardUI,{once:true});else startRewardUI();