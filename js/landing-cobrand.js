// M4 Landing Page - Tradies Network Dark Theme
// Overrides landing page styles and swaps branding
// Additive only
(function(){
try {

var s = document.createElement('style');
s.textContent = [
'#landing{background:#0a0a0a !important;color:#fff !important}',
'.lp2-nav{background:rgba(10,10,10,0.9) !important}',
'.lp2-nav.scrolled{background:rgba(10,10,10,0.95) !important;box-shadow:0 1px 3px rgba(0,0,0,0.3) !important}',
'.lp2-nav-logo{color:#fff !important}',
'.lp2-btn-signin{color:#fff !important}',
'.lp2-btn-signin:hover{color:#2dd4bf !important}',
'.lp2-hero-content h1{color:#fff !important}',
'.lp2-hero-content p{color:#94a3b8 !important}',
'.lp2-btn-secondary{color:#fff !important;background:transparent !important;border-color:rgba(255,255,255,0.2) !important}',
'.lp2-btn-secondary:hover{border-color:#2dd4bf !important;color:#2dd4bf !important}',
'.lp2-hero-float{background:#1a1a1a !important;border-color:#2a2a2a !important;color:#fff !important}',
'.lp2-hero-float-1{color:#2dd4bf !important}',
'.lp2-hero-img{border-color:#2a2a2a !important;box-shadow:0 25px 60px rgba(0,0,0,0.4) !important}',
'.lp2-stats{background:#111 !important}',
'.lp2-hero-note{color:#64748b !important}',
'',
'.lp2-features{background:#0a0a0a !important}',
'.lp2-section-title{color:#fff !important}',
'.lp2-section-sub{color:#94a3b8 !important}',
'.lp2-feature-card{background:#111 !important;border-color:#1a1a1a !important}',
'.lp2-feature-card:hover{border-color:#0d9488 !important;background:#0f1a1a !important}',
'.lp2-feature-icon{background:rgba(13,148,136,0.1) !important}',
'.lp2-feature-card h3{color:#fff !important}',
'.lp2-feature-card p{color:#94a3b8 !important}',
'',
'.lp2-how{background:#111 !important}',
'.lp2-how-step{color:#fff !important}',
'.lp2-how-step p{color:#94a3b8 !important}',
'.lp2-how-num{background:#0d9488 !important}',
'',
'.lp2-testimonials{background:#0a0a0a !important}',
'.lp2-testimonial-card{background:#111 !important;border-color:#1a1a1a !important}',
'.lp2-testimonial-card p{color:#cbd5e1 !important}',
'.lp2-testimonial-name{color:#fff !important}',
'.lp2-testimonial-role{color:#64748b !important}',
'',
'.lp2-pricing{background:#111 !important}',
'.lp2-price-card{background:#1a1a1a !important;border-color:#2a2a2a !important}',
'.lp2-price-card:hover{border-color:#0d9488 !important}',
'.lp2-price-card h3{color:#fff !important}',
'.lp2-price-card .lp2-price-amount{color:#fff !important}',
'.lp2-price-card .lp2-price-period{color:#64748b !important}',
'.lp2-price-card li{color:#cbd5e1 !important}',
'.lp2-price-card li::before{color:#2dd4bf !important}',
'.lp2-price-popular{background:#0d9488 !important}',
'',
'.lp2-cta{background:#0d9488 !important}',
'.lp2-footer{background:#050505 !important;color:#64748b !important}',
'.lp2-footer a{color:#94a3b8 !important}',
'.lp2-footer a:hover{color:#2dd4bf !important}',
'',
'#landing section[class*="bg-gradient"],#landing div[class*="bg-gradient"]{background:#0a0a0a !important}',
'.lp2-xero-section{background:#111 !important}',
'',
'.lp-tn-hero-logo{position:absolute;right:-40px;top:50%;transform:translateY(-50%);height:400px;width:auto;opacity:0.06;filter:invert(1);pointer-events:none}',
'.lp-tn-nav-logo{height:32px;width:auto;filter:invert(1) brightness(3) contrast(1.2);margin-right:8px}',
'.lp-tn-nav-text{display:flex;flex-direction:column;line-height:1.1}',
'.lp-tn-nav-name{font-size:18px;font-weight:800;color:#fff}',
'.lp-tn-nav-sub{font-size:9px;color:#64748b}',
'.lp-tn-nav-sub b{color:#2dd4bf}',
'@media(max-width:768px){.lp-tn-hero-logo{height:200px;right:-20px}}'
].join('\n');
document.head.appendChild(s);

function run() {
  var landing = document.getElementById('landing');
  if (!landing) return;
  if (landing.dataset.tnDone) return;

  // Wait for landing page to render
  var nav = landing.querySelector('.lp2-nav-logo');
  if (!nav) return;

  landing.dataset.tnDone = 'true';

  // Replace nav logo
  nav.innerHTML = '<img class="lp-tn-nav-logo" src="tradies-network-logo.png" alt="Tradies Network"><div class="lp-tn-nav-text"><div class="lp-tn-nav-name">TRADIES NETWORK</div><div class="lp-tn-nav-sub">Powered by <b>M4 STREAMLINE</b></div></div>';

  // Update hero text
  var h1 = landing.querySelector('.lp2-hero-content h1');
  if (h1) h1.innerHTML = 'Run your trade<br>business <span>smarter.</span>';

  // Add giant T logo as background watermark in hero
  var hero = landing.querySelector('.lp2-hero');
  if (hero) {
    hero.style.position = 'relative';
    hero.style.overflow = 'hidden';
    var bigLogo = document.createElement('img');
    bigLogo.className = 'lp-tn-hero-logo';
    bigLogo.src = 'tradies-network-logo.png';
    bigLogo.alt = '';
    hero.appendChild(bigLogo);
  }

  // Update footer branding if exists
  var footerLogo = landing.querySelector('.lp2-footer .lp2-nav-logo');
  if (footerLogo) {
    footerLogo.innerHTML = '<img class="lp-tn-nav-logo" src="tradies-network-logo.png" alt="Tradies Network"><div class="lp-tn-nav-text"><div class="lp-tn-nav-name">TRADIES NETWORK</div><div class="lp-tn-nav-sub">Powered by <b>M4 STREAMLINE</b></div></div>';
  }
}

var t = null;
new MutationObserver(function() {
  if (t) clearTimeout(t);
  t = setTimeout(run, 200);
}).observe(document.body, { childList: true, subtree: true });

} catch(e) { console.error('Landing TN error:', e); }
})();
