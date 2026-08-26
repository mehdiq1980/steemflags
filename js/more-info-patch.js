// Steem Flags More Information Patch
// Waits for dynamically loaded app-shell and exposes More Information handler.

(function(){
  function showMoreInformation(countryName){
    const info=document.getElementById('countryInfoLink');
    if(!info || !countryName) return;

    info.hidden=false;
    info.style.removeProperty('display');
    info.textContent='More Information...';
    info.href=`https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`;
    info.target='_blank';
    info.removeAttribute('aria-hidden');
    info.removeAttribute('tabindex');
  }

  window.showMoreInformation=showMoreInformation;

  const observer=new MutationObserver(()=>{
    const info=document.getElementById('countryInfoLink');
    if(info){
      info.dataset.moreInfoReady='true';
    }
  });

  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
