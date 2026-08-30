(function(){
  function translateAnswerButtons(){
    const lang=document.documentElement.lang||localStorage.getItem('steemFlagsLanguage')||'en';
    if(lang==='en')return;
    const game=window.__steemFlagsGame;
    if(!game?.current?.options)return;
    let names;
    try{names=new Intl.DisplayNames([lang],{type:'region'});}catch{return;}
    document.querySelectorAll('.answer').forEach(button=>{
      const option=game.current.options.find(item=>item[0]===button.dataset.canonical||item[0]===button.textContent.trim());
      if(!option)return;
      const code=option[2];
      if(!code)return;
      const translated=names.of(String(code).toUpperCase());
      if(translated)button.textContent=translated;
      button.dataset.canonical=option[0];
    });
  }
  const observer=new MutationObserver(()=>queueMicrotask(translateAnswerButtons));
  observer.observe(document.body,{subtree:true,childList:true});
  window.addEventListener('languagechange',translateAnswerButtons);
  document.addEventListener('DOMContentLoaded',translateAnswerButtons);
  setTimeout(translateAnswerButtons,500);
  setTimeout(translateAnswerButtons,1500);
  setTimeout(translateAnswerButtons,3000);
})();
