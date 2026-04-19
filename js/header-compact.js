// M4 Header Compact - Mobile
// ONLY adjusts sizes. Does NOT move, clone, or rearrange any elements.
// Additive only
(function(){
try {

function compact() {
  if (window.innerWidth > 768) return;

  var header = document.querySelector('.bg-black.border-b-4');
  if (!header) return;

  // Reduce header padding
  header.style.setProperty('padding', '4px 8px', 'important');
  header.style.setProperty('height', 'auto', 'important');

  // Inner container - remove gap and padding-bottom
  var headerInner = header.querySelector('.max-w-7xl');
  if (headerInner) {
    headerInner.style.setProperty('gap', '2px', 'important');
    headerInner.style.setProperty('padding-bottom', '0px', 'important');
    headerInner.style.setProperty('height', 'auto', 'important');
    headerInner.style.setProperty('min-height', '0', 'important');
  }

  // Cobrand elements - smaller
  var cbLogo = document.querySelector('.cb-logo');
  if (cbLogo) cbLogo.style.setProperty('height', '30px', 'important');

  var cbTxt = document.querySelector('.cb-txt');
  if (cbTxt) cbTxt.style.setProperty('height', '12px', 'important');

  var cbP = document.querySelector('.cb-p');
  if (cbP) {
    cbP.style.setProperty('font-size', '7px', 'important');
    cbP.style.setProperty('margin-top', '0', 'important');
  }

  // Nav bar - reduce height
  var allDivs = document.querySelectorAll('div.border-b.border-teal-400');
  for (var k = 0; k < allDivs.length; k++) {
    var navOuter = allDivs[k];
    if (navOuter.closest('.bg-black')) continue;

    navOuter.style.setProperty('max-height', '44px', 'important');
    navOuter.style.setProperty('overflow', 'hidden', 'important');

    var h16 = navOuter.querySelector('[class*="h-16"]');
    if (h16) h16.style.setProperty('height', '40px', 'important');

    var desktopNav = navOuter.querySelector('nav');
    if (desktopNav) desktopNav.style.setProperty('display', 'none', 'important');

    break;
  }
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(compact, 150);
}).observe(document.body, { childList: true, subtree: true });

setTimeout(compact, 500);
setTimeout(compact, 1500);
setTimeout(compact, 3500);

console.log('Header compact loaded');

} catch(e) { console.error('header-compact error:', e); }
})();
