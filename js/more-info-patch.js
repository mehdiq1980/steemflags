// Steem Flags More Information Patch
// Automatically hooks answer buttons without changing app-v2.js

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

  function hookAnswers(){
    const answers=document.getElementById('answers');
    if(!answers) return;

    const observer=new MutationObserver(()=>{
      [...answers.children].forEach(button=>{
        if(button.dataset.moreInfoHooked) return;
        const oldClick=button.onclick;
        button.onclick=function(event){
          if(oldClick) oldClick.call(this,event);
          setTimeout(()=>{
            const text=document.getElementById('feedback')?.textContent||'';
            const country=text.split('\n')[1] || '';
            if(country) showMoreInformation(country);
          },50);
        };
        button.dataset.moreInfoHooked='1';
      });
    });

    observer.observe(answers,{childList:true});
  }

  document.addEventListener('DOMContentLoaded',hookAnswers);
  setTimeout(hookAnswers,1000);
})();
