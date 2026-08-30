import { t, getLanguage } from './i18n.js';
(function(){
 const textMap=()=>{
  const lang=getLanguage();
  const set=(id,key)=>{const e=document.getElementById(id);if(e)e.textContent=t(key,lang)};
  set('questionText','whichCountry');set('nextButton','nextFlag');set('countryInfoLink','moreInfo');set('rewardTitle','rewardTitle');set('sponsorAdButton','sponsorAd');set('rewardOkButton','ok');
  document.querySelectorAll('.homeTitle,.loginGameTitle').forEach(e=>e.innerHTML=t('welcome',lang).replace(' & ','<br>& '));
  document.querySelectorAll('.leaderboardTitle h2').forEach(e=>e.textContent=t('leaderboardTitle',lang));
  document.querySelectorAll('.rewardPoolHeading').forEach(e=>e.textContent=t('weeklyRewards',lang));
  const pool=document.querySelectorAll('.rewardPoolLine');if(pool[0])pool[0].textContent=t('amount',lang);if(pool[1])pool[1].textContent=t('top5',lang);
  document.querySelectorAll('.steemSignupLink span:first-child').forEach(e=>e.textContent=t('createAccount',lang));document.querySelectorAll('.steemSignupLink span:last-child').forEach(e=>e.textContent=t('createAccountFree',lang));
  const f=document.getElementById('feedback');if(f&&f.textContent){const s=f.textContent;if(/Correct Answer: \+1 D2E|درست|Respuesta correcta/.test(s))f.textContent='✅ '+t('correct',lang);else if(/Wrong Answer: -1 D2E|Wrong|پاسخ غلط|Respuesta incorrecta/.test(s)){const parts=s.split('\n');f.textContent='❌ '+t('wrong',lang)+(parts[1]?'\n'+parts[1]:'')}}
  const lines=document.getElementById('rewardLines');if(lines){lines.querySelectorAll('.rewardLine span:first-child').forEach(e=>{const s=e.textContent;if(/Game D2E Rewards|پاداش D2E بازی|Recompensas D2E del juego/.test(s))e.textContent=t('gameReward',lang);else if(/All Flags Correct Rewards|پاداش درست|Recompensa por acertar/.test(s))e.textContent=t('perfectReward',lang);else if(/Sponsor Ad Rewards|پاداش تبلیغ|Recompensas del anuncio/.test(s))e.textContent=t('sponsorReward',lang)})}
 }
 const observer=new MutationObserver(()=>{if(!observer.busy){observer.busy=true;queueMicrotask(()=>{textMap();observer.busy=false})}});observer.observe(document.body,{subtree:true,childList:true,characterData:true});window.addEventListener('languagechange',textMap);document.addEventListener('DOMContentLoaded',textMap);setTimeout(textMap,1000);setTimeout(textMap,2500);
})();
