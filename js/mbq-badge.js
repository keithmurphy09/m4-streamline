// M4 MBQ Badge on Landing Page
// Places badge top right corner below nav
// Additive only
(function(){
try {

function addBadge() {
  var landing = document.getElementById('landing');
  if (!landing) return;
  if (document.getElementById('mbq-badge-wrap')) return;

  var container = document.createElement('div');
  container.id = 'mbq-badge-wrap';
  container.style.cssText = 'position:fixed;top:70px;right:20px;z-index:99;pointer-events:none;';

  var badge = document.createElement('img');
  badge.src = 'mbq-badge.png';
  badge.alt = 'Master Builders Queensland - Proud Member';
  badge.style.cssText = 'height:100px;width:auto;';

  container.appendChild(badge);
  document.body.appendChild(container);

  // Remove badge when leaving landing page
  var obs = new MutationObserver(function() {
    var l = document.getElementById('landing');
    if (!l || getComputedStyle(l).display === 'none') {
      var b = document.getElementById('mbq-badge-wrap');
      if (b) b.style.display = 'none';
    } else {
      var b2 = document.getElementById('mbq-badge-wrap');
      if (b2) b2.style.display = 'block';
    }
  });
  obs.observe(document.body, { childList: true, subtree: true, attributes: true });
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
