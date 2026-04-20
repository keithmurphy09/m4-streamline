// M4 Landing Page Text Fix
// Makes all dark text visible on dark landing page background
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
  // Nav links
  '.lp2-nav-links a{color:#cbd5e1!important}',
  '.lp2-nav-links a:hover{color:#2dd4bf!important}',
  '.lp2-nav-logo{color:#f0faf7!important}',

  // Hero
  '.lp2-hero-content h1{color:#f0faf7!important}',
  '.lp2-hero-content p{color:#94a3b8!important}',

  // Section headers
  '.lp2-section-tag{color:#2dd4bf!important}',
  '.lp2-section-title{color:#f0faf7!important}',
  '.lp2-section-sub{color:#94a3b8!important}',

  // FAQ
  '.lp2-faq-q{color:#f0faf7!important}',
  '.lp2-faq-a{color:#94a3b8!important}',
  '.lp2-faq-item{border-bottom-color:rgba(255,255,255,0.1)!important}',

  // Any h2/h3 inside landing
  '#landing h2{color:#f0faf7!important}',
  '#landing h3{color:#f0faf7!important}',

  // Scrolled nav background - make it dark too
  '.lp2-nav.scrolled{background:rgba(8,12,11,0.95)!important}',
].join('\n');
document.head.appendChild(css);

console.log('Landing page text fix loaded');

} catch(e) { console.error('landing-text error:', e); }
})();
