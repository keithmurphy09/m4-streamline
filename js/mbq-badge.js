// M4 MBQ Badge on Landing Page
// Adds Master Builders Queensland badge to landing nav
// Additive only
(function(){
try {

function addBadge() {
  var nav = document.querySelector('.lp2-nav');
  if (!nav) return;
  if (nav.dataset.mbqDone) return;
  nav.dataset.mbqDone = '1';

  var badge = document.createElement('img');
  badge.src = 'mbq-badge.png';
  badge.alt = 'Master Builders Queensland - Proud Member';
  badge.style.cssText = 'height:40px;width:auto;margin-left:12px;flex-shrink:0;cursor:pointer;';
  badge.title = 'Master Builders Queensland - Proud Member';

  // Add it after the sign in / start free trial buttons (right side of nav)
  var navRight = nav.querySelector('.lp2-nav-right') || nav.querySelector('.lp2-nav-links');
  if (navRight) {
    navRight.appendChild(badge);
  } else {
    nav.appendChild(badge);
  }
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
