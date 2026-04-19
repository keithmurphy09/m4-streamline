// M4 FAQ Color Fix
// Makes FAQ text visible on dark landing page
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
  '.lp2-faq-q{color:#f0faf7!important}',
  '.lp2-faq-a{color:#94a3b8!important}',
  '.lp2-faq-item{border-bottom-color:rgba(255,255,255,0.1)!important}'
].join('\n');
document.head.appendChild(css);

console.log('FAQ color fix loaded');

} catch(e) { console.error('faq-fix error:', e); }
})();
