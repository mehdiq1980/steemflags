(function(){
  let translating=false;

  function translateAnswerButtons(){
    if(translating)return;
    const lang=document.documentElement.lang||localStorage.getItem('steemFlagsLanguage')||'en';
    const game=window.__steemFlagsGame;
    if(!game?.current?.options)return;

    let names;
    try{names=new Intl.DisplayNames([lang],{type:'region'});}catch{return;}

    translating=true;
    try{
      document.querySelectorAll('.answer').forEach(button=>{
        const canonical=button.dataset.canonical||button.textContent.trim();
        const option=game.current.options.find(item=>item[0]===canonical);
        if(!option)return;
        const code=option[2];
        if(!code)return;
        const translated=names.of(String(code).toUpperCase());
        if(translated && button.textContent!==translated) button.textContent=translated;
        button.dataset.canonical=option[0];
      });
    }finally{
      translating=false;
    }
  }

  window.addEventListener('languagechange',translateAnswerButtons);
  document.addEventListener('DOMContentLoaded',translateAnswerButtons);

  const observer=new MutationObserver(()=>{
    if(!translating)translateAnswerButtons();
  });
  observer.observe(document.body,{subtree:true,childList:true});

  setTimeout(translateAnswerButtons,500);
  setTimeout(translateAnswerButtons,1500);
  setTimeout(translateAnswerButtons,3000);
})();
