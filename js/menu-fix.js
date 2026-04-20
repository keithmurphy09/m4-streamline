// M4 Mobile Menu Fix
// Fixes scroll, active tab dark box, and bottom padding
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
  // Prevent background scrolling when menu is open
  '#mobile-menu{',
  '  overscroll-behavior:contain!important;',
  '  -webkit-overflow-scrolling:touch!important;',
  '  padding-bottom:120px!important;',
  '}',

  // Lock body scroll when menu overlay is visible
  'body.menu-open{overflow:hidden!important;position:fixed!important;width:100%!important}',

  // Fix active tab dark background on mobile
  'html:not(.dark) #mobile-menu .bg-teal-50{background-color:#f0fdfa!important}',
  'html:not(.dark) #mobile-menu [class*="bg-teal-900"]{background-color:#f0fdfa!important}',
  'html:not(.dark) #mobile-menu [class*="dark:bg-teal"]{background-color:#f0fdfa!important}',

  // Ensure menu text is always visible
  'html:not(.dark) #mobile-menu button{color:#374151!important}',
  'html:not(.dark) #mobile-menu .text-teal-600{color:#0d9488!important}',
].join('\n');
document.head.appendChild(css);

// Lock/unlock body scroll when menu opens/closes
function watchMenu() {
  var overlay = document.getElementById('mobile-menu-overlay');
  if (!overlay) return;

  var obs = new MutationObserver(function() {
    if (overlay.classList.contains('hidden')) {
      document.body.classList.remove('menu-open');
    } else {
      document.body.classList.add('menu-open');
    }
  });
  obs.observe(overlay, { attributes: true, attributeFilter: ['class'] });
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(watchMenu, 300);
}).observe(document.body, { childList: true, subtree: true });

setTimeout(watchMenu, 1000);

console.log('Mobile menu fix loaded');

} catch(e) { console.error('menu-fix error:', e); }
})();
