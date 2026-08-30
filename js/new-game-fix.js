const API_BASE='https://steemflags.mehdiq.workers.dev';
const $=id=>document.getElementById(id);
let busy=false;
async function startNewGame(){
  if(busy)return;
  const session=(()=>{try{return JSON.parse(localStorage.getItem('steemFlagsAuthSession')||'null')}catch{return null}})();
  const username=String(session?.username||'').trim().toLowerCase();
  const button=$('newGameButton');
  const game=window.__steemFlagsGame;
  if(!username||!game){console.error('New Game unavailable: missing session or game instance');return;}
  busy=true;if(button)button.disabled=true;
  try{
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),8000);
    let response;
    try{response=await fetch(`${API_BASE}/api/game/start`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username}),cache:'no-store',signal:controller.signal})}finally{clearTimeout(timer)}
    let data={};try{data=await response.json()}catch{}
    if(!response.ok||!data.success)throw new Error(data.error||`Unable to start game (${response.status})`);
    const account=data.account||{};
    const energy=$('energyValue');if(energy)energy.textContent=Number(account.Energy)||0;
    const d2e=$('sfValue');if(d2e)d2e.textContent=Number(account.D2E)||0;
    const home=$('homeView'),leaderboard=$('leaderboardSection'),gameView=$('gameView');
    if(home)home.hidden=true;if(leaderboard)leaderboard.hidden=true;if(gameView)gameView.hidden=false;
    game.reset();game.next();
  }catch(error){
    console.error('New Game failed:',error);
    const feedback=$('feedback');
    if(feedback){feedback.textContent=error.name==='AbortError'?'Game server timeout. Please try again.':(error.message||'Unable to start game.');feedback.className='feedback bad';}
  }finally{
    busy=false;
    const energy=Number($('energyValue')?.textContent)||0;
    if(button)button.disabled=energy<=0;
  }
}
function bind(){
  const button=$('newGameButton');
  if(button){const replacement=button.cloneNode(true);button.replaceWith(replacement);replacement.addEventListener('click',startNewGame);}
  window.addEventListener('steemflags:new-game',event=>{event.stopImmediatePropagation();startNewGame()},{capture:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
window.steemFlagsStartNewGame=startNewGame;
