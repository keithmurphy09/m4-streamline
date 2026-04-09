// M4 Co-Brand Header
// Additive only
(function(){
try {

var s = document.createElement('style');
s.textContent = 'button[onclick*="enterDemoMode"],button[onclick*="exitDemoMode"]{display:none !important}.cb-hide{display:none !important}.cb-row{display:flex !important;align-items:center;grid-column:1/-1 !important;padding:4px 0}.cb-logo{height:80px;width:auto;filter:invert(1) brightness(3) contrast(1.2);flex-shrink:0;margin-right:20px}.cb-mid{flex:1;display:flex;flex-direction:column;align-items:center}.cb-n{font-size:24px;font-weight:800;color:#fff;letter-spacing:1.5px}.cb-p{font-size:13px;color:#94a3b8;margin-top:3px}.cb-p b{color:#2dd4bf;font-weight:700}.cb-btns{display:flex;align-items:center;gap:8px;margin-top:8px}@media(max-width:768px){.cb-logo{height:45px;margin-right:10px}.cb-n{font-size:16px}.cb-p{font-size:10px}}';
document.head.appendChild(s);

var _r = false;
function run() {
  if (_r) return;
  _r = true;
  setTimeout(function(){ _r = false; }, 50);

  var g = document.querySelector('.bg-black .max-w-7xl');
  if (!g) return;

  // Already injected - nothing to do
  if (g.querySelector('.cb-row')) return;

  // Fresh render from renderApp() - set up everything
  // Find admin badge and icon buttons
  var badge = g.querySelector('.bg-red-600');
  var icons = [];
  g.querySelectorAll('button').forEach(function(b) {
    var oc = b.getAttribute('onclick') || '';
    if (oc.indexOf('enterDemoMode') !== -1) return;
    if (oc.indexOf('exitDemoMode') !== -1) return;
    if (b.querySelector('svg')) icons.push(b);
  });

  // Hide ALL original children
  Array.from(g.children).forEach(function(c) { c.classList.add('cb-hide'); });

  // Build new row
  var r = document.createElement('div');
  r.className = 'cb-row';
  r.innerHTML = '<img class="cb-logo" src="tradies-network-logo.png" alt="Tradies Network"><div class="cb-mid"><div class="cb-n">TRADIES NETWORK</div><div class="cb-p">Powered by <b>M4 STREAMLINE</b></div><div class="cb-btns"></div></div>';

  var btns = r.querySelector('.cb-btns');
  if (badge) btns.appendChild(badge);
  icons.forEach(function(b) { btns.appendChild(b); });

  g.appendChild(r);
}

new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
} catch(e) { console.error('CB error:', e); }
})();
