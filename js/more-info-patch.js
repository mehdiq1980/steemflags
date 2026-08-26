// Steem Flags More Information Patch
// Activates More Information after answer selection without modifying app-v2.js

(function(){
  function showMoreInformation(countryName){
    const info=document.getElementById('countryInfoLink');
    if(!info || !countryName) return;

    info.hidden=false;
    info.style.removeProperty('display');
    info.style.removeProperty('display');
    info.textContent='More Information...';
    info.href=`https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`;
    info.target='_blank';
    info.removeAttribute('aria-hidden');
    info.removeAttribute('tabindex');
  }

  window.showMoreInformation=showMoreInformation;

  // Detect answer buttons created dynamically by app-v2.js
  document.addEventListener('click',function(e){
    const btn=e.target.closest('.answer');
    if(!btn) return;

    setTimeout(function(){
      const feedback=document.getElementById('feedback');
      const text=feedback?.textContent||'';
      if(text.includes('Wrong Answer')){
        const country=text.split('\n')[1]?.trim();
        if(country) showMoreInformation(country);
      }
    },50);
  });
})();
