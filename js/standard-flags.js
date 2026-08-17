// Replaces the quiz's emoji flag with a real SVG flag asset while preserving each flag's natural proportions.
const FLAG_CODES = {
  '🇫🇷':'fr','🇩🇪':'de','🇮🇹':'it','🇪🇸':'es','🇵🇹':'pt','🇯🇵':'jp','🇰🇷':'kr','🇮🇳':'in','🇧🇷':'br','🇨🇦':'ca','🇺🇸':'us','🇬🇧':'gb','🇦🇺':'au','🇲🇽':'mx','🇦🇷':'ar','🇹🇷':'tr','🇪🇬':'eg','🇿🇦':'za','🇳🇬':'ng','🇸🇪':'se','🇳🇴':'no','🇫🇮':'fi','🇬🇷':'gr','🇹🇭':'th','🇮🇩':'id','🇻🇳':'vn','🇵🇭':'ph','🇳🇿':'nz','🇨🇭':'ch','🇦🇹':'at','🇳🇱':'nl','🇧🇪':'be','🇩🇰':'dk','🇵🇱':'pl','🇺🇦':'ua','🇮🇪':'ie','🇮🇸':'is','🇨🇿':'cz','🇭🇺':'hu','🇷🇴':'ro','🇭🇷':'hr','🇷🇸':'rs','🇸🇰':'sk','🇸🇮':'si','🇧🇬':'bg','🇱🇹':'lt','🇱🇻':'lv','🇪🇪':'ee','🇲🇦':'ma','🇰🇪':'ke','🇬🇭':'gh','🇨🇱':'cl','🇨🇴':'co','🇵🇪':'pe','🇺🇾':'uy','🇪🇨':'ec','🇨🇷':'cr','🇵🇦':'pa','🇯🇲':'jm','🇩🇴':'do','🇸🇦':'sa','🇦🇪':'ae','🇯🇴':'jo','🇮🇶':'iq','🇵🇰':'pk','🇧🇩':'bd','🇳🇵':'np','🇲🇾':'my','🇸🇬':'sg'
};
function normalize(value) { return String(value || '').trim(); }
function renderStandardFlag() {
  const target = document.getElementById('flagImage');
  if (!target) return;
  const emoji = normalize(target.textContent);
  const code = FLAG_CODES[emoji];
  if (!code || target.dataset.flagCode === code) return;
  target.dataset.flagCode = code;
  target.replaceChildren();
  const image = document.createElement('img');
  image.className = 'flagImageAsset';
  image.src = `https://flagcdn.com/${code}.svg`;
  image.alt = target.getAttribute('aria-label') || 'Country flag';
  image.loading = 'eager';
  image.decoding = 'async';
  image.onerror = () => { image.onerror = null; image.src = `https://flagcdn.com/w640/${code}.png`; };
  target.appendChild(image);
}
const observer = new MutationObserver(renderStandardFlag);
observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderStandardFlag); else renderStandardFlag();
