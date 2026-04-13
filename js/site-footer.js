// M4 Site Footer - Tradies Network
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = '.tn-footer{background:#0a0a0a;border-top:3px solid #2dd4bf;padding:32px 20px;text-align:center;margin-top:40px}.tn-footer-inner{max-width:800px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px}.tn-footer-logo{height:50px;width:auto;filter:invert(1) brightness(3) contrast(1.2);opacity:0.7}.tn-footer-name{font-size:15px;font-weight:700;color:#fff;letter-spacing:1px}.tn-footer-name span{color:#2dd4bf;font-weight:400;font-size:13px}.tn-footer-addr{font-size:12px;color:#64748b;letter-spacing:0.3px}.tn-footer-copy{font-size:11px;color:#475569}@media(max-width:768px){.tn-footer{padding:24px 16px}.tn-footer-logo{height:36px}.tn-footer-name{font-size:13px}}';
document.head.appendChild(css);

function addFooter() {
  if (document.querySelector('.tn-footer')) return;

  var app = document.getElementById('app');
  if (!app) return;
  // Don't add to landing page
  var landing = document.getElementById('landing');
  if (landing && landing.style.display !== 'none') return;

  var footer = document.createElement('div');
  footer.className = 'tn-footer';
  footer.innerHTML = '<div class="tn-footer-inner">' +
    '<img class="tn-footer-logo" src="tradies-network-logo.png" alt="Tradies Network">' +
    '<div class="tn-footer-name">TRADIES NETWORK <span>Powered by M4 STREAMLINE</span></div>' +
    '<div class="tn-footer-addr">470 Old Cleveland Rd, Camp Hill QLD 4152</div>' +
    '<div class="tn-footer-copy">All rights reserved</div>' +
    '</div>';

  app.appendChild(footer);
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(addFooter, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Site footer loaded');

} catch(e) {
  console.error('Footer error:', e);
}
})();
