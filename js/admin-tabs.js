// M4 Admin Panel Tabs
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = '.ap-tabs{display:flex;gap:0;border-bottom:2px solid #e2e8f0;margin:0 -24px 20px;padding:0 24px;overflow-x:auto;-webkit-overflow-scrolling:touch}.dark .ap-tabs{border-color:#374151}.ap-tab{padding:10px 16px;font-size:13px;font-weight:600;color:#64748b;background:none;border:none;cursor:pointer;font-family:inherit;white-space:nowrap;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.2s}.ap-tab:hover{color:#0d9488}.ap-tab-active{color:#0d9488;border-bottom-color:#0d9488}.ap-hide{display:none !important}@media(max-width:768px){.ap-tab{padding:8px 10px;font-size:11px}}';
document.head.appendChild(css);

var _done = false;

function setup() {
  if (_done) return;

  // Find the grandparent container
  var h2 = null;
  document.querySelectorAll('h2').forEach(function(el) {
    if (el.textContent.trim() === 'All Users') h2 = el;
  });
  if (!h2) return;

  var card1 = h2.parentElement; // first white card
  if (!card1) return;
  var gp = card1.parentElement; // max-w-7xl container
  if (!gp || gp.children.length < 2) return;
  if (gp.querySelector('.ap-tabs')) return;

  _done = true;

  var card2 = gp.children[1]; // second white card

  // Card1 has: Admin Panel header (div), stats grid (div), "All Users" h2, table
  // Card2 has: Support Messages, (empty), Promo Codes, Account Management+Discounts

  // Find elements in card1
  var headerDiv = null;
  var statsDiv = null;
  var usersH2 = null;
  var usersTable = null;

  Array.from(card1.children).forEach(function(c) {
    if (c.textContent.indexOf('Admin Panel') !== -1 && c.tagName === 'DIV') headerDiv = c;
    else if (c.className.indexOf('grid') !== -1) statsDiv = c;
    else if (c.tagName === 'H2') usersH2 = c;
    else if (c.tagName === 'TABLE') usersTable = c;
  });

  // Get card2 children
  var card2Kids = Array.from(card2.children);

  // Build tab definitions
  var tabs = [
    { label: 'Users', els: [usersH2, usersTable].filter(Boolean) },
    { label: 'Support', els: card2Kids.slice(0, 2) },
    { label: 'Promo Codes', els: [card2Kids[2]].filter(Boolean) },
    { label: 'Accounts', els: [card2Kids[3]].filter(Boolean) }
  ];

  // Tag all elements with tab index
  tabs.forEach(function(tab, idx) {
    tab.els.forEach(function(el) {
      if (el) el.setAttribute('data-ap-tab', idx);
    });
  });

  // Move card2 children into card1 (single card layout)
  card2Kids.forEach(function(c) {
    card1.appendChild(c);
  });
  card2.style.display = 'none';

  // Build tab bar - insert after stats
  var tabBar = document.createElement('div');
  tabBar.className = 'ap-tabs';

  tabs.forEach(function(tab, idx) {
    var btn = document.createElement('button');
    btn.className = 'ap-tab' + (idx === 0 ? ' ap-tab-active' : '');
    btn.textContent = tab.label;
    btn.onclick = function() {
      // Deactivate all tabs
      tabBar.querySelectorAll('.ap-tab').forEach(function(t) { t.classList.remove('ap-tab-active'); });
      btn.classList.add('ap-tab-active');
      // Hide all tab content
      card1.querySelectorAll('[data-ap-tab]').forEach(function(el) { el.classList.add('ap-hide'); });
      // Show selected tab content
      card1.querySelectorAll('[data-ap-tab="' + idx + '"]').forEach(function(el) { el.classList.remove('ap-hide'); });
    };
    tabBar.appendChild(btn);
  });

  // Insert tab bar after stats grid
  var insertAfter = statsDiv || headerDiv;
  if (insertAfter && insertAfter.nextSibling) {
    card1.insertBefore(tabBar, insertAfter.nextSibling);
  } else {
    card1.insertBefore(tabBar, usersH2);
  }

  // Initially hide non-active tabs
  tabs.forEach(function(tab, idx) {
    if (idx > 0) {
      tab.els.forEach(function(el) { if (el) el.classList.add('ap-hide'); });
    }
  });
}

var _t = null;
new MutationObserver(function() {
  if (_done) return;
  if (_t) clearTimeout(_t);
  _t = setTimeout(setup, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Admin tabs loaded');

} catch(e) {
  console.error('Admin tabs error:', e);
}
})();
