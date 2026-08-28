// Renders quiz flags as real SVG artwork instead of emoji.
// The flag set is the country-flags project, whose source files are taken from Wikimedia Commons.
function getCurrentFlagCode(){
  const game=window.__steemFlagsGame;
  return game?.current?.country?.[2] || null;
}
function renderQuizFlag(){
  const target=document.getElementById('flagImage');
  const code=getCurrentFlagCode();
  if(!target||!code)return;
  if(target.dataset.flagCode===code && target.querySelector('img.flagImageAsset'))return;
  target.dataset.flagCode=code;
  target.replaceChildren();
  const image=document.createElement('img');
  image.className='flagImageAsset';
  image.src=`https://raw.githubusercontent.com/hampusborgos/country-flags/master/svg/${code}.svg`;
  image.alt=target.getAttribute('aria-label')||'Country flag';
  image.loading='eager';
  image.decoding='async';
  image.referrerPolicy='no-referrer';
  image.onerror=()=>{
    image.onerror=null;
    image.src=`https://raw.githubusercontent.com/hampusborgos/country-flags/master/png1000px/${code}.png`;
  };
  target.appendChild(image);
}
const observer=new MutationObserver(renderQuizFlag);
observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
window.addEventListener('steemflags:ready',renderQuizFlag);
renderQuizFlag();
