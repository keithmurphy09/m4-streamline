// M4 Mobile Menu Fix
// Fixes scroll, active tab dark box, and bottom padding
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
  '#mobile-menu{',
  '  overscroll-behavior:contain!important;',
  '  -webkit-overflow-scrolling:touch!important;',
  '  padding-bottom:120px!important;',
  '}',

  'html:not(.dark) #mobile-menu .bg-teal-50{background-color:#f0fdfa!important}',
  'html:not(.dark) #mobile-menu [class*="bg-teal-900"]{background-color:#f0fdfa!important}',
  'html:not(.dark) #mobile-menu button{color:#374151!important}',
  'html:not(.dark) #mobile-menu .text-teal-600{color:#0d9488!important}',
].join('\n');
document.head.appendChild(css);

console.log('Mobile menu fix loaded');

} catch(e) { console.error('menu-fix error:', e); }
})();
