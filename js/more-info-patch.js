// Steem Flags More Information Patch
// Activates the existing countryInfoLink element.

(function(){
  function showMoreInformation(countryName){
    const info=document.getElementById('countryInfoLink');
    if(!info || !countryName) return;

    info.hidden=false;
    info.style.display='block';
    info.textContent='More Information...';
    info.href=`https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`;
    info.target='_blank';
  }

  window.showMoreInformation=showMoreInformation;
})();
