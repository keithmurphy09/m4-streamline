// M4 Header Compact - Mobile
// Additive only
(function(){
try {

function compact() {
  if (window.innerWidth > 768) return;

  // === BLACK HEADER ===
  var header = document.querySelector('.bg-black.border-b-4');
  if (!header) return;

  header.style.setProperty('padding', '4px 8px', 'important');
  header.style.setProperty('height', 'auto', 'important');
  header.style.setProperty('max-height', 'none', 'important');

  // Inner container - force height to fit content only
  var headerInner = header.querySelector('.max-w-7xl');
  if (headerInner) {
    headerInner.style.setProperty('gap', '0px', 'important');
    headerInner.style.setProperty('padding-bottom', '0px', 'important');
    headerInner.style.setProperty('height', 'auto', 'important');
    headerInner.style.setProperty('min-height', '0', 'important');
    headerInner.style.setProperty('display', 'flex', 'important');
    headerInner.style.setProperty('flex-direction', 'column', 'important');
    headerInner.style.setProperty('grid-template-rows', 'none', 'important');

    for (var i = 0; i < headerInner.children.length; i++) {
      var child = headerInner.children[i];
      var display = getComputedStyle(child).display;
      if (display === 'none') continue;
      child.style.setProperty('margin-bottom', '2px', 'important');
      child.style.setProperty('height', 'auto', 'important');
      child.style.setProperty('min-height', '0', 'important');
    }
  }

  // === NAV BAR ===
  var allDivs = document.querySelectorAll('div.border-b.border-teal-400');
  for (var j = 0; j < allDivs.length; j++) {
    var navOuter = allDivs[j];
    if (navOuter.closest('.bg-black')) continue;

    navOuter.style.setProperty('max-height', '44px', 'important');
    navOuter.style.setProperty('overflow', 'hidden', 'important');

    var h16 = navOuter.querySelector('[class*="h-16"]');
    if (h16) {
      h16.style.setProperty('height', '40px', 'important');
    }

    var desktopNav = navOuter.querySelector('nav');
    if (desktopNav) {
      desktopNav.style.setProperty('display', 'none', 'important');
    }

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
