// M4 MBQ Badge on Landing Page
// Places badge below Start Free Trial in hero section
// Additive only
(function(){
try {

function addBadge() {
  var landing = document.getElementById('landing');
  if (!landing) return;
  if (landing.dataset.mbqDone) return;

  // Find the hero buttons area
  var heroBtns = landing.querySelector('.lp2-hero-btns');
  if (!heroBtns) return;

  landing.dataset.mbqDone = '1';

  var container = document.createElement('div');
  container.style.cssText = 'display:flex;justify-content:center;margin-top:24px;';

  var badge = document.createElement('img');
  badge.src = 'mbq-badge.png';
  badge.alt = 'Master Builders Queensland - Proud Member';
  badge.style.cssText = 'height:80px;width:auto;pointer-events:none;';

  container.appendChild(badge);
  heroBtns.parentNode.insertBefore(container, heroBtns.nextSibling);
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(addBadge, 300);
}).observe(document.body, { childList: true, subtree: true });

setTimeout(addBadge, 1000);

console.log('MBQ badge loaded');

} catch(e) { console.error('mbq-badge error:', e); }
})();
