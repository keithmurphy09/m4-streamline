// M4 Mobile Compatibility Fixes
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
// Nav bar - collapse to hamburger on mobile
'@media(max-width:768px){',
// Fix nav items overlapping
'.flex.items-center.gap-1{flex-wrap:wrap !important;gap:2px !important}',
'nav .flex{flex-wrap:wrap !important}',
// Tighten nav tabs
'nav button,nav a{font-size:11px !important;padding:4px 6px !important;white-space:nowrap}',
// Fix dashboard cards not fitting
'.grid.grid-cols-2{grid-template-columns:1fr !important;gap:12px !important}',
'.grid.grid-cols-4{grid-template-columns:repeat(2,1fr) !important;gap:8px !important}',
// Prevent any element overflowing viewport
'body,#app{overflow-x:hidden !important;max-width:100vw !important}',
'*{max-width:100vw}',
// Fix large icons/elements
'.text-4xl,.text-5xl,.text-6xl{font-size:24px !important}',
// Fix header padding
'.p-4.md\\:p-6{padding:8px !important}',
// Footer mobile
'.tn-footer{padding:16px 12px !important}',
'.tn-footer-inner{gap:8px !important}',
'.tn-footer-logo{height:30px !important}',
'.tn-footer-txt{height:16px !important}',
'}'
].join('\n');
document.head.appendChild(css);

// Fix: collapse mobile nav into hamburger
function fixMobileNav() {
  if (window.innerWidth > 768) return;

  // Find the navigation bar
  var nav = document.querySelector('nav') || document.querySelector('[class*="border-b"][class*="bg-white"]');
  if (!nav) return;
  if (nav.dataset.mfDone) return;
  nav.dataset.mfDone = '1';

  // Make nav scrollable horizontally instead of wrapping
  nav.style.overflowX = 'auto';
  nav.style.overflowY = 'hidden';
  nav.style.whiteSpace = 'nowrap';
  nav.style.webkitOverflowScrolling = 'touch';

  // Hide "M4" text on mobile to save space
  nav.querySelectorAll('span, div, a').forEach(function(el) {
    if (el.textContent.trim() === 'M4' && el.children.length === 0) {
      el.style.display = 'none';
    }
  });
}

// Fix: prevent menu items from stacking on load
function fixMenuOverlap() {
  if (window.innerWidth > 768) return;

  // Force any dropdown menus closed
  document.querySelectorAll('[class*="dropdown"], [class*="menu"]').forEach(function(el) {
    if (el.offsetHeight > window.innerHeight * 0.5) {
      el.style.display = 'none';
    }
  });
}

// Fix: make sure auth page renders properly on mobile
function fixAuthMobile() {
  if (window.innerWidth > 768) return;

  var authContainers = document.querySelectorAll('[class*="max-w-md"], [class*="max-w-lg"], [class*="max-w-xl"]');
  authContainers.forEach(function(el) {
    el.style.maxWidth = '100%';
    el.style.padding = '12px';
    el.style.margin = '0 auto';
  });
}

// Fix: calendar mobile view
function fixCalendarMobile() {
  if (window.innerWidth > 768) return;

  // Make calendar table scrollable
  document.querySelectorAll('table').forEach(function(tbl) {
    if (tbl.querySelector('th') && tbl.closest('[class*="calendar"], [class*="schedule"]')) {
      var wrapper = tbl.parentElement;
      if (wrapper && wrapper.style.overflowX !== 'auto') {
        wrapper.style.overflowX = 'auto';
        wrapper.style.webkitOverflowScrolling = 'touch';
        tbl.style.minWidth = '600px';
      }
    }
  });

  // Make any full-day view scrollable
  document.querySelectorAll('[class*="h-screen"], [class*="min-h-screen"]').forEach(function(el) {
    if (el.scrollHeight > window.innerHeight) {
      el.style.overflow = 'auto';
    }
  });
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(function() {
    fixMobileNav();
    fixMenuOverlap();
    fixAuthMobile();
    fixCalendarMobile();
  }, 300);
}).observe(document.body, { childList: true, subtree: true });

// Also run on resize
window.addEventListener('resize', function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(function() {
    fixMobileNav();
    fixMenuOverlap();
    fixAuthMobile();
    fixCalendarMobile();
  }, 300);
});

console.log('Mobile fixes loaded');

} catch(e) {
  console.error('Mobile fix error:', e);
}
})();
