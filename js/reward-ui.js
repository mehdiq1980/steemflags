const REWARD_STATE_KEY='steemFlagsPendingRewards';
let lastShown='';
function readRewards(){try{const raw=localStorage.getItem(REWARD_STATE_KEY);const data=raw?JSON.parse(raw):null;return data?.username?data:null}catch{return null}}
function showRewards(data){
  const modal=document.getElementById('rewardModal'),lines=document.getElementById('rewardLines'),ok=document.getElementById('rewardOkButton'),ad=document.getElementById('sponsorAdButton');
  if(!modal||!lines||!ok)return;
  const key=JSON.stringify(data);if(lastShown===key&&!modal.hidden)return;lastShown=key;
  const gameReward=Number(data.gameReward)||0,perfectBonus=Number(data.perfectBonus)||0,adReward=Number(data.adReward)||0,total=gameReward+perfectBonus+adReward;
  lines.innerHTML=`<div class="rewardLine"><span>✅ Quiz Rewards</span><strong>${gameReward>0?'+':''}${gameReward} D2E</strong></div><div class="rewardLine"><span>✅ Rewards for getting all answers correct</span><strong>${perfectBonus>0?'+':''}${perfectBonus} D2E</strong></div><div class="rewardLine"><span>✅ Sponsor Ad Rewards</span><strong>${adReward>0?'+':''}${adReward} D2E</strong></div><div class="rewardLine rewardTotal"><span>💰 Total Rewards</span><strong>${total>0?'+':''}${total} D2E</strong></div>`;
  if(ad){ad.hidden=false;ad.textContent='📣 Watch a Sponsor Ad for +2 D2E';ad.onclick=()=>{try{sessionStorage.setItem('steemFlagsSponsorContext','game')}catch{}window.location.href='./sponsor-ad.html'}}
  ok.onclick=()=>{modal.hidden=true;try{localStorage.removeItem(REWARD_STATE_KEY);sessionStorage.removeItem('steemFlagsSponsorContext');sessionStorage.removeItem('steemFlagsSponsorReward')}catch{}const login=document.getElementById('loginView'),home=document.getElementById('homeView'),board=document.getElementById('leaderboardSection'),game=document.getElementById('gameView');if(login)login.hidden=true;if(home)home.hidden=false;if(board)board.hidden=false;if(game)game.hidden=true;window.dispatchEvent(new CustomEvent('steemflags:show-home'))};
  modal.hidden=false;
}
function check(){
  const q=new URLSearchParams(location.search);
  if(q.get('sponsorReward')==='2'){
    const data=readRewards();
    if(data){data.adReward=2;data.pendingSave=false;try{localStorage.setItem(REWARD_STATE_KEY,JSON.stringify(data))}catch{}}
    window.history.replaceState({},document.title,location.pathname+location.hash);
  }
  const data=readRewards();
  const modal=document.getElementById('rewardModal');
  if(data&&modal)showRewards(data);
}
function startRewardUI(){check();setInterval(check,500);window.addEventListener('steemflags:reward-ready',check)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startRewardUI,{once:true});else startRewardUI();