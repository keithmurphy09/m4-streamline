// M4 Co-Brand Header - Tradies Network v8
// CSS hides old branding instantly (no flash)
// Never moves or touches dark mode, settings, or admin badge
// Additive only
(function(){
try {

// CSS loads immediately - hides old branding before paint
var css = document.createElement('style');
css.textContent = [
// Hide old M4 logo and Logged in text via the header's first child
'.bg-black .max-w-7xl > div:first-child img:not(.cb-logo){display:none !important}',
'.bg-black .max-w-7xl > div:first-child span:not(.bg-red-600){display:none !important}',

// Hide demo mode buttons
'button[onclick*="enterDemoMode"]{display:none !important}',
'button[onclick*="exitDemoMode"]{display:none !important}',

// Co-brand styles
'.cb-row{display:flex !important;align-items:center;grid-column:1/-1 !important;padding:4px 0;gap:16px}',
'.cb-logo{height:65px;width:auto;object-fit:contain;filter:invert(1) brightness(3) contrast(1.2);flex-shrink:0}',
'.cb-mid{flex:1;text-align:center}',
'.cb-n{font-size:24px;font-weight:800;color:#fff;letter-spacing:1.5px}',
'.cb-p{font-size:13px;color:#94a3b8;letter-spacing:0.5px;margin-top:3px}',
'.cb-p b{color:#2dd4bf;font-weight:700}',
'@media(max-width:768px){.cb-logo{height:40px}.cb-n{font-size:16px}.cb-p{font-size:10px}}'
].join('\n');
document.head.appendChild(css);

function inject() {
  var grid = document.querySelector('.bg-black .max-w-7xl');
  if (!grid) return;
  if (grid.querySelector('.cb-row')) return;

  var row = document.createElement('div');
  row.className = 'cb-row';
  row.innerHTML =
    '<img class="cb-logo" src="tradies-network-logo.png" alt="Tradies Network">' +
    '<div class="cb-mid">' +
      '<div class="cb-n">TRADIES NETWORK</div>' +
      '<div class="cb-p">Powered by <b>M4 STREAMLINE</b></div>' +
    '</div>';

  grid.insertBefore(row, grid.firstChild);
}

var t = null;
new MutationObserver(function() {
  if (t) clearTimeout(t);
  t = setTimeout(inject, 150);
}).observe(document.body, { childList: true, subtree: true });

console.log('Co-brand header v8 loaded');

} catch(e) {
  console.error('Co-brand error:', e);
}
})();
