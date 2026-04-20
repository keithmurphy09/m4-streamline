// M4 Dark Mode Fix
// Injects dark CSS directly, hooks into toggle function
// Additive only
(function(){
try {

var darkStyle = null;

function getDarkCSS() {
  return [
    'html.dark body{background-color:#111827!important}',
    'html.dark .bg-gray-50{background-color:#111827!important}',
    'html.dark .bg-white{background-color:#1f2937!important}',
    'html.dark .bg-gray-100{background-color:#374151!important}',
    'html.dark .bg-gray-800{background-color:#1f2937!important}',
    'html.dark .min-h-screen{background-color:#111827!important}',
    'html.dark .text-gray-900{color:#f9fafb!important}',
    'html.dark .text-gray-700{color:#d1d5db!important}',
    'html.dark .text-gray-500{color:#9ca3af!important}',
    'html.dark .text-gray-300{color:#d1d5db!important}',
    'html.dark .text-gray-400{color:#9ca3af!important}',
    'html.dark .border-gray-200{border-color:#374151!important}',
    'html.dark .border-gray-100{border-color:#374151!important}',
    'html.dark .border-gray-300{border-color:#4b5563!important}',
    'html.dark .shadow-sm{box-shadow:0 1px 2px rgba(0,0,0,0.3)!important}',
    'html.dark input{background-color:#374151!important;color:#f9fafb!important;border-color:#4b5563!important}',
    'html.dark select{background-color:#374151!important;color:#f9fafb!important;border-color:#4b5563!important}',
    'html.dark textarea{background-color:#374151!important;color:#f9fafb!important;border-color:#4b5563!important}',
    'html.dark .text-teal-400{color:#2dd4bf!important}',
    'html.dark .text-teal-600{color:#14b8a6!important}',
    'html.dark .bg-teal-50{background-color:rgba(13,148,136,0.1)!important}',
    'html.dark .bg-teal-100{background-color:rgba(13,148,136,0.15)!important}',
    'html.dark .bg-green-50{background-color:rgba(22,163,74,0.1)!important}',
    'html.dark .bg-orange-50{background-color:rgba(234,88,12,0.1)!important}',
    'html.dark .bg-red-50{background-color:rgba(220,38,38,0.1)!important}',
    'html.dark .bg-blue-50{background-color:rgba(37,99,235,0.1)!important}',
    'html.dark .bg-yellow-50{background-color:rgba(202,138,4,0.1)!important}',
    'html.dark .rounded-xl{border-color:#374151!important}',
    'html.dark .rounded-lg{border-color:#374151!important}',
    'html.dark p{color:#d1d5db!important}',
    'html.dark h1,html.dark h2,html.dark h3{color:#f9fafb!important}',
    'html.dark .text-2xl{color:#f9fafb!important}',
    'html.dark .text-3xl{color:#f9fafb!important}',
    'html.dark .font-bold{color:#f9fafb!important}',
    'html.dark .font-semibold{color:#e2e8f0!important}',
    'html.dark .text-sm{color:#d1d5db!important}',
    'html.dark .text-xs{color:#9ca3af!important}',
    'html.dark .bg-black{background-color:#000!important}',
    'html.dark table{border-color:#374151!important}',
    'html.dark th{background-color:#1f2937!important;color:#d1d5db!important;border-color:#374151!important}',
    'html.dark td{border-color:#374151!important;color:#d1d5db!important}',
    'html.dark tr:hover{background-color:#374151!important}',
  ].join('\n');
}

function applyDark() {
  var isDark = localStorage.getItem('darkMode') === 'true';

  if (isDark) {
    document.documentElement.classList.add('dark');
    if (!darkStyle) {
      darkStyle = document.createElement('style');
      darkStyle.id = 'm4-dark-override';
      document.head.appendChild(darkStyle);
    }
    darkStyle.textContent = getDarkCSS();
  } else {
    document.documentElement.classList.remove('dark');
    if (darkStyle) {
      darkStyle.textContent = '';
    }
  }
}

// Run immediately
applyDark();

// Override the original toggleDarkMode to also call our applyDark
var origToggle = window.toggleDarkMode;
window.toggleDarkMode = function() {
  if (origToggle) origToggle();
  setTimeout(applyDark, 50);
  setTimeout(applyDark, 300);
};

// Also watch for DOM changes
var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(applyDark, 100);
}).observe(document.body, { childList: true, subtree: true });

setTimeout(applyDark, 500);
setTimeout(applyDark, 1500);

console.log('Dark mode fix loaded');

} catch(e) { console.error('darkmode-fix error:', e); }
})();
