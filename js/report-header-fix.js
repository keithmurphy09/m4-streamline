// M4 Report/Analytics Header Fix - Light mode
// Additive only
(function(){
try {

var s = document.createElement('style');
s.textContent = [
'body:not(.dark) div.bg-black:not(.border-b-4):not(.cb-row){background:#f1f5f9 !important;color:#0f172a !important}',
'body:not(.dark) div.bg-black:not(.border-b-4):not(.cb-row) h2,body:not(.dark) div.bg-black:not(.border-b-4):not(.cb-row) h3,body:not(.dark) div.bg-black:not(.border-b-4):not(.cb-row) span,body:not(.dark) div.bg-black:not(.border-b-4):not(.cb-row) p,body:not(.dark) div.bg-black:not(.border-b-4):not(.cb-row) div{color:#0f172a !important}',
'body:not(.dark) div.bg-black:not(.border-b-4):not(.cb-row) .text-teal-400,body:not(.dark) div.bg-black:not(.border-b-4):not(.cb-row) .text-teal-500{color:#0d9488 !important}',
'body:not(.dark) div.bg-gray-800:not(.border-b-4){background:#f1f5f9 !important;color:#0f172a !important}',
'body:not(.dark) div.bg-gray-800:not(.border-b-4) h2,body:not(.dark) div.bg-gray-800:not(.border-b-4) h3,body:not(.dark) div.bg-gray-800:not(.border-b-4) span,body:not(.dark) div.bg-gray-800:not(.border-b-4) p,body:not(.dark) div.bg-gray-800:not(.border-b-4) div{color:#0f172a !important}'
].join('\n');
document.head.appendChild(s);

console.log('Report header fix loaded');

} catch(e) {
  console.error('Report header fix error:', e);
}
})();
