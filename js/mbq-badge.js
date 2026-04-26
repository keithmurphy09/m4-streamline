// M4 MBQ Badge on Landing Page
// Places badge next to Tradies Network logo in nav header
// Additive only
(function(){
try {

function addBadge() {
  var landing = document.getElementById('landing');
  if (!landing) return;

  var navLogo = landing.querySelector('.lp2-nav-logo');
  if (!navLogo) return;
  if (navLogo.dataset.mbqDone) return;
  navLogo.dataset.mbqDone = '1';

  var badge = document.createElement('img');
  badge.src = 'mbq-badge.png';
  badge.alt = 'Master Builders Queensland - Proud Member';
  badge.style.cssText = 'height:45px;width:auto;margin-left:16px;flex-shrink:0;pointer-events:none;';

  navLogo.appendChild(badge);
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(addBadge, 300);
}).observe(document.body, { childList: true, subtree: true });

setTimeout(addBadge, 1000);

// Hide badge when not on landing page
function checkLanding() {
  var badge = document.querySelector('[src="mbq-badge.png"]');
  var landing = document.getElementById('landing');
  if (badge && landing) {
    badge.style.display = getComputedStyle(landing).display === 'none' ? 'none' : '';
  }
}

new MutationObserver(checkLanding).observe(document.body, { childList: true, subtree: true });

console.log('MBQ badge loaded');

} catch(e) { console.error('mbq-badge error:', e); }
})();
