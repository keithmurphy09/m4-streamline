// M4 Co-Brand Header
// ONLY hides logo+M4 text rows. NEVER touches buttons.
// Additive only
(function(){
try {

var s = document.createElement('style');
s.textContent = 'button[onclick*="enterDemoMode"],button[onclick*="exitDemoMode"]{display:none !important}.cb-hide{display:none !important}.bg-black.border-b-4 .max-w-7xl{position:relative !important}.cb-row{display:flex !important;align-items:center;grid-column:1/-1 !important;padding:4px 0}.cb-logo{height:110px;width:auto;filter:invert(1) brightness(3) contrast(1.2);flex-shrink:0;margin-right:20px}.cb-mid{flex:1;display:flex;flex-direction:column;align-items:center}.cb-txt{height:28px;width:auto;filter:invert(1)}.cb-p{font-size:11px;color:#94a3b8;margin-top:3px}.cb-p b{color:#2dd4bf;font-weight:700}.bg-black.border-b-4 .max-w-7xl>div:not(.cb-row):not(.cb-hide){position:absolute !important;top:8px;right:0;display:flex !important;justify-content:flex-end !important;z-index:10}@media(max-width:768px){.cb-logo{height:50px;margin-right:10px}.cb-txt{height:18px}.cb-p{font-size:9px}}';
document.head.appendChild(s);

var _r = false;
function run() {
  if (_r) return;
  _r = true;
  setTimeout(function(){ _r = false; }, 50);

  var g = document.querySelector('.bg-black .max-w-7xl');
  if (!g) return;
  if (g.querySelector('.cb-row')) return;

  // Hide rows containing logo/Logged in and M4 STREAMLINE text
  Array.from(g.children).forEach(function(c) {
    var t = c.textContent || '';
    if (t.indexOf('Logged in') !== -1) c.classList.add('cb-hide');
    if (t.indexOf('M4 STREAMLINE') !== -1 && t.indexOf('TRADIES') === -1) c.classList.add('cb-hide');
    if (t.indexOf('streamlining your business') !== -1) c.classList.add('cb-hide');
  });

  // Add branding row
  var r = document.createElement('div');
  r.className = 'cb-row';
  r.innerHTML = '<img class="cb-logo" src="tradies-network-logo.png" alt="Tradies Network"><div class="cb-mid"><img class="cb-txt" src="tradies-network-text.png" alt="Tradies Network"><div class="cb-p">Powered by <b>M4 STREAMLINE</b></div></div>';
  g.insertBefore(r, g.firstChild);
}

new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
} catch(e) { console.error('CB error:', e); }
})();
