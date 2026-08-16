import {loadState,saveState,resetState,refreshDailyEnergy} from './storage.js';
import {FlagGame} from './game.js';

const $=id=>document.getElementById(id);let state=refreshDailyEnergy(loadState());
const home=$('homeView'),gameView=$('gameView'),answers=$('answers'),feedback=$('feedback'),next=$('nextButton');
const energy=$('energyValue'),sf=$('sfValue'),counter=$('questionCounter'),score=$('scoreLabel'),flag=$('flagImage');
let game=new FlagGame(renderQuestion);
function renderStats(){energy.textContent=state.energy;sf.textContent=state.sf}
function renderQuestion(q,points,n){counter.textContent=`Question ${n}`;score.textContent=`Score: ${points}`;flag.src='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="480"><rect width="720" height="480" fill="white"/><text x="360" y="250" text-anchor="middle" font-size="120">${q.country[1]}</text></svg>`);answers.innerHTML='';feedback.textContent='';feedback.className='feedback';next.hidden=true;q.options.forEach(([name])=>{const b=document.createElement('button');b.className='answer';b.textContent=name;b.onclick=()=>choose(b,name);answers.appendChild(b)})}
function choose(button,name){if(state.energy<=0){feedback.textContent='No energy left today.';feedback.className='feedback bad';return}state.energy--;const r=game.answer(name);if(r.correct){state.sf++;feedback.textContent='Correct! +1 SF';feedback.className='feedback ok';button.classList.add('correct')}else{state.sf=Math.max(0,state.sf-1);feedback.textContent=`Wrong. Correct answer: ${r.answer}`;feedback.className='feedback bad';button.classList.add('wrong')}[...answers.children].forEach(b=>{b.disabled=true;if(b.textContent===r.answer)b.classList.add('correct')});saveState(state);renderStats();next.hidden=false}
$('startButton').onclick=()=>{if(state.energy<=0){feedback.textContent='No energy left today.';return}home.hidden=true;gameView.hidden=false;game.next()};next.onclick=()=>{if(state.energy>0)game.next();else{feedback.textContent='No energy left today.';feedback.className='feedback bad'}};
$('menuButton').onclick=()=>{const m=$('menu');m.hidden=!m.hidden;$('menuButton').setAttribute('aria-expanded',String(!m.hidden))};
document.querySelectorAll('[data-action="home"]').forEach(b=>b.onclick=()=>{gameView.hidden=true;home.hidden=false;$('menu').hidden=true});
document.querySelectorAll('[data-action="reset"]').forEach(b=>b.onclick=()=>{state=resetState();state=refreshDailyEnergy(state);renderStats();gameView.hidden=true;home.hidden=false;$('menu').hidden=true});
renderStats();
