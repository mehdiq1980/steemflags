(function(){
  const TITLES={
    en:{home:'Guess the Flags<br>&amp; Earn $STEEM',leaderboard:'Steem Flags Leaderboard'},
    fa:{home:'پرچم‌ها را حدس بزنید<br>و $STEEM کسب کنید',leaderboard:'لیدربورد استیم فلگز'},
    es:{home:'Adivina las banderas<br>y gana $STEEM',leaderboard:'Clasificación de Steem Flags'},
    ur:{home:'جھنڈے پہچانیں<br>اور $STEEM کمائیں',leaderboard:'اسٹیم فلیگز لیڈر بورڈ'},
    hi:{home:'झंडे पहचानें<br>और $STEEM कमाएँ',leaderboard:'स्टीम फ्लैग्स लीडरबोर्ड'},
    bn:{home:'পতাকা চিনুন<br>এবং $STEEM উপার্জন করুন',leaderboard:'স্টিম ফ্ল্যাগস লিডারবোর্ড'},
    zh:{home:'猜旗帜<br>赚取 $STEEM',leaderboard:'Steem Flags 排行榜'},
    ko:{home:'국기를 맞히고<br>$STEEM을 획득하세요',leaderboard:'Steem Flags 리더보드'}
  };
  function getLang(){
    try{return localStorage.getItem('steemFlagsLanguage')||'en'}catch{return 'en'}
  }
  function applyTranslatedBrandTitles(){
    const lang=getLang();
    const x=TITLES[lang]||TITLES.en;
    const home=document.querySelector('.homeTitle');
    if(home)home.innerHTML=x.home;
    const board=document.querySelector('#leaderboardSection h2');
    if(board)board.textContent=x.leaderboard;
  }
  applyTranslatedBrandTitles();
  document.addEventListener('steemflags:ready',applyTranslatedBrandTitles);
  document.addEventListener('steemflags:show-home',applyTranslatedBrandTitles);
  window.addEventListener('languagechange',applyTranslatedBrandTitles);
  new MutationObserver(applyTranslatedBrandTitles).observe(document.documentElement,{childList:true,subtree:true});
})();
