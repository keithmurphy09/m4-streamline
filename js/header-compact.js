// M4 Header Compact - Mobile
// Additive only. Inline styles override Tailwind.
// Does NOT touch logos, only reduces container padding/gaps/heights.
(function(){
try {

function compact() {
  if (window.innerWidth > 768) return;

  // === BLACK HEADER ===
  // Line 79: div.bg-black.text-white.p-4.border-b-4
  var header = document.querySelector('.bg-black.border-b-4');
  if (header) {
    header.style.setProperty('padding', '6px 10px', 'important');
  }

  // Line 80: div.max-w-7xl flex-col with gap-4
  var headerInner = header ? header.querySelector('.max-w-7xl') : null;
  if (headerInner) {
    headerInner.style.setProperty('gap', '4px', 'important');
  }

  // Line 97-100: Title section "M4 STREAMLINE" - hide on mobile, cobrand shows it
  if (headerInner) {
    var kids = headerInner.children;
    for (var i = 0; i < kids.length; i++) {
      var txt = kids[i].textContent || '';
      // Hide the title div but NOT the cobrand row or controls
      if (kids[i].classList && kids[i].classList.contains('text-center') && txt.indexOf('M4 STREAMLINE') !== -1 && !kids[i].classList.contains('cb-row')) {
        kids[i].style.setProperty('display', 'none', 'important');
      }
    }
  }

  // === NAV BAR ===
  // Line 190: div.bg-white.border-b.border-teal-400
  // Line 192: div.flex.items-center.h-16
  var navOuter = document.querySelector('.border-b.border-teal-400');
  if (navOuter) {
    var h16 = navOuter.querySelector('.h-16');
    if (h16) {
      h16.style.setProperty('height', '40px', 'important');
    }
    // Line 203: nav.hidden.md:flex - force hidden on mobile
    var desktopNav = navOuter.querySelector('nav');
    if (desktopNav && window.innerWidth <= 768) {
      desktopNav.style.setProperty('display', 'none', 'important');
    }
  }
}

// Run after DOM changes settle
var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(compact, 150);
}).observe(document.body, { childList: true, subtree: true });

// Run on load and after delays
setTimeout(compact, 500);
setTimeout(compact, 1500);
setTimeout(compact, 3500);

console.log('Header compact loaded');

} catch(e) { console.error('header-compact error:', e); }
})();
