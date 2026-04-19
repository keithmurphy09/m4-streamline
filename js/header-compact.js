// M4 Header Compact - Mobile
// No cloning, no moving. Just sizing and gap fixes.
// Additive only
(function(){
try {

function compact() {
  if (window.innerWidth > 768) return;

  var header = document.querySelector('.bg-black.border-b-4');
  if (!header) return;
  if (header.dataset.hcDone) return;
  header.dataset.hcDone = '1';

  // Header padding
  header.style.setProperty('padding', '4px 8px', 'important');

  // Inner container - kill gap and bottom padding
  var headerInner = header.querySelector('.max-w-7xl');
  if (headerInner) {
    headerInner.style.setProperty('gap', '2px', 'important');
    headerInner.style.setProperty('padding-bottom', '0px', 'important');
  }

  // Cobrand sizing
  var cbLogo = document.querySelector('.cb-logo');
  if (cbLogo) cbLogo.style.setProperty('height', '30px', 'important');

  var cbTxt = document.querySelector('.cb-txt');
  if (cbTxt) cbTxt.style.setProperty('height', '12px', 'important');

  var cbP = document.querySelector('.cb-p');
  if (cbP) {
    cbP.style.setProperty('font-size', '7px', 'important');
    cbP.style.setProperty('margin-top', '0', 'important');
  }

  // Shrink buttons in controls row
  if (header) {
    header.querySelectorAll('button').forEach(function(b) {
      b.style.setProperty('padding', '3px 6px', 'important');
      b.style.setProperty('min-height', '28px', 'important');
    });
  }

  // ADMIN badge smaller
  var admin = header.querySelector('.bg-red-600');
  if (admin) {
    admin.style.setProperty('font-size', '9px', 'important');
    admin.style.setProperty('padding', '2px 5px', 'important');
  }
}

function fixNav() {
  if (window.innerWidth > 768) return;

  // Nav bar - find the white bar with border-teal-400 that is NOT inside the header
  var candidates = document.querySelectorAll('.border-b.border-teal-400');
  for (var k = 0; k < candidates.length; k++) {
    var el = candidates[k];
    if (el.closest('.bg-black')) continue;
    if (el.dataset.navDone) continue;
    el.dataset.navDone = '1';

    // Force the container height
    el.style.setProperty('max-height', '44px', 'important');
    el.style.setProperty('overflow', 'hidden', 'important');

    // Find and shrink h-16
    var inner = el.querySelector('.h-16');
    if (inner) inner.style.setProperty('height', '40px', 'important');

    // Hide desktop nav
    var nav = el.querySelector('nav.hidden');
    if (nav) nav.style.setProperty('display', 'none', 'important');

    break;
  }
}

// Run on mutations
var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(function() {
    // Reset done flags if elements were recreated
    var header = document.querySelector('.bg-black.border-b-4');
    if (header && !header.dataset.hcDone) compact();

    var nav = document.querySelector('.border-b.border-teal-400');
    if (nav && !nav.closest('.bg-black') && !nav.dataset.navDone) fixNav();
  }, 150);
}).observe(document.body, { childList: true, subtree: true });

setTimeout(function() { compact(); fixNav(); }, 500);
setTimeout(function() { compact(); fixNav(); }, 1500);
setTimeout(function() { compact(); fixNav(); }, 3500);

console.log('Header compact loaded');

} catch(e) { console.error('header-compact error:', e); }
})();
