// M4 Dark Mode Fix
// Ensures dark class is applied on every page render
// Additive only
(function(){
try {

function ensureDarkMode() {
  var isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Run immediately
ensureDarkMode();

// Run on every DOM change (app.js re-renders remove the class context)
var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(ensureDarkMode, 100);
}).observe(document.body, { childList: true, subtree: true });

// Run on delays
setTimeout(ensureDarkMode, 500);
setTimeout(ensureDarkMode, 1500);
setTimeout(ensureDarkMode, 3500);

console.log('Dark mode fix loaded');

} catch(e) { console.error('darkmode-fix error:', e); }
})();
