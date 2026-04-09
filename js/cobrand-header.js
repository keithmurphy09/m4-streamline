// M4 Co-Brand Header v8
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'button[onclick*="enterDemoMode"],button[onclick*="exitDemoMode"]{display:none !important}',
'.cb-row{display:flex !important;align-items:center;grid-column:1/-1 !important;padding:4px 0;gap:16px}',
'.cb-logo{height:65px;width:auto;filter:invert(1) brightness(3) contrast(1.2);flex-shrink:0}',
'.cb-mid{flex:1;text-align:center}',
'.cb-n{font-size:24px;font-weight:800;color:#fff;letter-spacing:1.5px}',
'.cb-p{font-size:13px;color:#94a3b8;margin-top:3px}',
'.cb-p b{color:#2dd4bf;font-weight:700}',
'.cb-hide{display:none !important}',
'@media(max-width:768px){.cb-logo{height:40px}.cb-n{font-size:16px}.cb-p{font-size:10px}}'
].join('\n');
document.head.appendChild(css);

function run() {
  var grid = document.querySelector('.bg-black .max-w-7xl');
  if (!grid) return;

  // Always re-hide old content (handles renderApp rebuilds)
  Array.from(grid.children).forEach(function(child) {
    if (child.classList.contains('cb-row')) return;
    var text = child.textContent || '';
    // Keep the buttons row (has ADMIN or dark mode toggle)
    if (child.querySelector('.bg-red-600') || child.querySelector('button[onclick*="toggleTheme"]') || child.querySelector('button[onclick*="darkMode"]')) {
      // Just hide demo buttons inside it
      child.querySelectorAll('button[onclick*="enterDemoMode"],button[onclick*="exitDemoMode"]').forEach(function(b) { b.style.display = 'none'; });
      return;
    }
    // Check if this is the buttons row by checking for settings/theme icons
    var hasIcons = false;
    child.querySelectorAll('button').forEach(function(b) {
      if (b.querySelector('svg')) hasIcons = true;
    });
    if (hasIcons && text.indexOf('ADMIN') !== -1) {
      child.querySelectorAll('button[onclick*="enterDemoMode"],button[onclick*="exitDemoMode"]').forEach(function(b) { b.style.display = 'none'; });
      return;
    }
    // Hide everything else (logo, Logged in, M4 STREAMLINE)
    child.classList.add('cb-hide');
  });

  // Add branding row if not present
  if (!grid.querySelector('.cb-row')) {
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
}

// Run immediately and on every DOM change
var _cbRunning = false;
new MutationObserver(function() {
  if (_cbRunning) return;
  _cbRunning = true;
  run();
  setTimeout(function() { _cbRunning = false; }, 50);
}).observe(document.body, { childList: true, subtree: true });

console.log('Co-brand header v8 loaded');

} catch(e) {
  console.error('Co-brand error:', e);
}
})();
