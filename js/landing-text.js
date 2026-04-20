// M4 Landing Page Text Fix
// Makes dark text visible on dark backgrounds, keeps card text dark
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
  // Nav links
  '.lp2-nav-links a{color:#cbd5e1!important}',
  '.lp2-nav-links a:hover{color:#2dd4bf!important}',
  '.lp2-nav-logo{color:#f0faf7!important}',
  '.lp2-nav.scrolled{background:rgba(8,12,11,0.95)!important}',

  // Hero
  '.lp2-hero-content h1{color:#f0faf7!important}',
  '.lp2-hero-content p{color:#94a3b8!important}',

  // Section headers (on dark backgrounds, NOT inside cards)
  '.lp2-section-tag{color:#2dd4bf!important}',
  '.lp2-section-title{color:#f0faf7!important}',
  '.lp2-section-sub{color:#94a3b8!important}',

  // Dark section headings only
  '.lp2-section-dark h2{color:#f0faf7!important}',
  '.lp2-section-dark h3:not(.lp2-card h3){color:#f0faf7!important}',
  '.lp2-section-dark p{color:#94a3b8!important}',

  // Cards keep their original dark text on white background
  '.lp2-card h3{color:#0f172a!important}',
  '.lp2-card p{color:#64748b!important}',
  '.lp2-card-tag{color:#0d9488!important}',

  // FAQ
  '.lp2-faq-q{color:#f0faf7!important}',
  '.lp2-faq-a{color:#94a3b8!important}',
  '.lp2-faq-item{border-bottom-color:rgba(255,255,255,0.1)!important}',

  // General landing h2 on dark backgrounds (but not inside cards)
  '#landing > section h2{color:#f0faf7!important}',
  '#landing > section > h2{color:#f0faf7!important}',

  // "Got questions?" heading
  '#landing [id*="faq"] h2{color:#f0faf7!important}',

  // "Built different" heading
  '#landing .lp2-section h2{color:#f0faf7!important}',
].join('\n');
document.head.appendChild(css);

console.log('Landing page text fix loaded');

} catch(e) { console.error('landing-text error:', e); }
})();
