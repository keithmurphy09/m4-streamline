// M4 Dark Mode Fix
// Ensures dark class is applied AND injects dark mode CSS directly
// so it works even if Tailwind config doesn't pick up darkMode:'class'
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
  updateDarkStyles(isDark);
}

var darkStyle = null;

function updateDarkStyles(isDark) {
  if (isDark) {
    if (!darkStyle) {
      darkStyle = document.createElement('style');
      darkStyle.id = 'm4-dark-override';
      document.head.appendChild(darkStyle);
    }
    darkStyle.textContent = [
      'html.dark body{background-color:#111827!important}',
      'html.dark .bg-gray-50{background-color:#111827!important}',
      'html.dark .bg-white{background-color:#1f2937!important}',
      'html.dark .bg-gray-100{background-color:#374151!important}',
      'html.dark .bg-gray-800{background-color:#1f2937!important}',
      'html.dark .min-h-screen.bg-gray-50{background-color:#111827!important}',
      'html.dark .text-gray-900{color:#f9fafb!important}',
      'html.dark .text-gray-700{color:#d1d5db!important}',
      'html.dark .text-gray-500{color:#9ca3af!important}',
      'html.dark .text-gray-300{color:#d1d5db!important}',
      'html.dark .text-gray-400{color:#9ca3af!important}',
      'html.dark .border-gray-200{border-color:#374151!important}',
      'html.dark .border-gray-100{border-color:#374151!important}',
      'html.dark .bg-gray-50.dark\\:bg-gray-900{background-color:#111827!important}',
      'html.dark .bg-white.dark\\:bg-gray-800{background-color:#1f2937!important}',
      'html.dark .text-gray-900.dark\\:text-white{color:#fff!important}',
      'html.dark .shadow-sm{box-shadow:0 1px 2px rgba(0,0,0,0.3)!important}',
      'html.dark input,html.dark select,html.dark textarea{background-color:#374151!important;color:#f9fafb!important;border-color:#4b5563!important}',
      'html.dark .rounded-xl,html.dark .rounded-lg{border-color:#374151!important}',
    ].join('\n');
  } else {
    if (darkStyle) {
      darkStyle.textContent = '';
    }
  }
}

ensureDarkMode();

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(ensureDarkMode, 100);
}).observe(document.body, { childList: true, subtree: true });

setTimeout(ensureDarkMode, 500);
setTimeout(ensureDarkMode, 1500);
setTimeout(ensureDarkMode, 3500);

console.log('Dark mode fix loaded');

} catch(e) { console.error('darkmode-fix error:', e); }
})();
