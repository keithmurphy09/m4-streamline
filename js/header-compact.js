// M4 Header Compact - Mobile
// Additive only
(function(){
try {

function compact() {
  if (window.innerWidth > 768) return;

  // === BLACK HEADER ===
  var header = document.querySelector('.bg-black.border-b-4');
  if (!header) return;

  // Reduce padding
  header.style.setProperty('padding', '4px 8px', 'important');

  // The inner container has gap-4 which creates space even for hidden children
  // Remove the gap entirely and use margin on visible children instead
  var headerInner = header.querySelector('.max-w-7xl');
  if (headerInner) {
    headerInner.style.setProperty('gap', '0px', 'important');

    // Add small margin only to visible children
    for (var i = 0; i < headerInner.children.length; i++) {
      var child = headerInner.children[i];
      var display = getComputedStyle(child).display;
      if (display === 'none') continue;
      child.style.setProperty('margin-bottom', '2px', 'important');
    }
  }

  // === NAV BAR ===
  // Find by structure: bg-white with border-teal-400
  var allDivs = document.querySelectorAll('div.border-b.border-teal-400');
  for (var j = 0; j < allDivs.length; j++) {
    var navOuter = allDivs[j];
    // Skip if inside the header
    if (navOuter.closest('.bg-black')) continue;

    // Force height on the nav container
    navOuter.style.setProperty('max-height', '44px', 'important');
    navOuter.style.setProperty('overflow', 'hidden', 'important');

    // Find h-16 inside and shrink it
    var h16 = navOuter.querySelector('[class*="h-16"]');
    if (h16) {
      h16.style.setProperty('height', '40px', 'important');
    }

    // Hide desktop nav on mobile
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
