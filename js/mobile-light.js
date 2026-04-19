// M4 Mobile Light Mode Fix
// Forces light mode appearance on mobile when system dark mode is on
// but user hasn't toggled dark mode in the app
// Only runs on mobile. Does not affect desktop.
// Additive only
(function(){
try {

// Only run on mobile
if (window.innerWidth > 768) return;

// Only run if system prefers dark
if (!window.matchMedia('(prefers-color-scheme: dark)').matches) return;

var css = document.createElement('style');
css.id = 'm4-mobile-light';
css.textContent = [
  'html:not(.dark) .bg-gray-50{background-color:#f9fafb!important}',
  'html:not(.dark) .min-h-screen{min-height:100vh}',
  'html:not(.dark) body{background-color:#f9fafb!important}',
  'html:not(.dark) .bg-white{background-color:#fff!important}',
  'html:not(.dark) .text-gray-900{color:#111827!important}',
  'html:not(.dark) .text-gray-700{color:#374151!important}',
  'html:not(.dark) .text-gray-500{color:#6b7280!important}',
  'html:not(.dark) .border-gray-200{border-color:#e5e7eb!important}',
  'html:not(.dark) .bg-gray-100{background-color:#f3f4f6!important}',
  'html:not(.dark) .bg-gray-800{background-color:#fff!important}',
  'html:not(.dark) .text-gray-300{color:#d1d5db!important}',
  'html:not(.dark) .text-gray-400{color:#9ca3af!important}',
  'html:not(.dark) .bg-teal-50{background-color:#f0fdfa!important}',
  'html:not(.dark) .text-teal-700{color:#0f766e!important}',
  'html:not(.dark) .text-teal-900{color:#134e4a!important}',
  'html:not(.dark) .border-teal-200{border-color:#99f6e4!important}',
  ':root{color-scheme:light}'
].join('\n');
document.head.appendChild(css);

console.log('Mobile light mode fix loaded');

} catch(e) { console.error('mobile-light error:', e); }
})();
