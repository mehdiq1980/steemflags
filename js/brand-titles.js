(function(){
  const HOME_TITLE='Guess the Flags<br>&amp; Earn $STEEM';
  const LEADERBOARD_TITLE='Steem Flags Leaderboard';
  function applyBrandTitles(){
    const home=document.querySelector('.homeTitle');
    if(home) home.innerHTML=HOME_TITLE;
    const board=document.querySelector('#leaderboardSection h2');
    if(board) board.textContent=LEADERBOARD_TITLE;
  }
  applyBrandTitles();
  document.addEventListener('steemflags:ready',applyBrandTitles);
  document.addEventListener('steemflags:show-home',applyBrandTitles);
  window.addEventListener('languagechange',applyBrandTitles);
  new MutationObserver(applyBrandTitles).observe(document.documentElement,{childList:true,subtree:true});
})();
