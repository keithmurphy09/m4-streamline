// M4 Company Info Tabs
// Xero stays visible at top, rest tabbed
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = '.ci-tabs{display:flex;gap:0;border-bottom:2px solid #e2e8f0;margin-bottom:20px;overflow-x:auto;-webkit-overflow-scrolling:touch}.dark .ci-tabs{border-color:#374151}.ci-tab{padding:10px 16px;font-size:13px;font-weight:600;color:#64748b;background:none;border:none;cursor:pointer;font-family:inherit;white-space:nowrap;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.2s}.ci-tab:hover{color:#0d9488}.ci-tab-active{color:#0d9488;border-bottom-color:#0d9488}.ci-hide{display:none !important}@media(max-width:768px){.ci-tab{padding:8px 10px;font-size:11px}}';
document.head.appendChild(css);

var _done = false;

function setup() {
  if (_done) return;

  var h2 = null;
  document.querySelectorAll('h2').forEach(function(el) {
    if (el.textContent.trim() === 'Company Settings') h2 = el;
  });
  if (!h2) return;

  var container = h2.parentElement;
  if (!container || container.children.length < 6) return;
  if (container.querySelector('.ci-tabs')) return;

  _done = true;

  var kids = Array.from(container.children);
  // 0: H2 heading - keep
  // 1: Xero box - keep always visible
  // 2: Business info + logo + bank details
  // 3: Stripe
  // 4: Email
  // 5: Email Automations
  // 6: SMS
  // 7: Message Templates (if exists)

  var tabs = [
    { label: 'Business Info', idx: [2] },
    { label: 'Stripe', idx: [3] },
    { label: 'Email', idx: [4] },
    { label: 'Automations', idx: [5] },
    { label: 'SMS', idx: [6] }
  ];

  // Add templates tab if it exists
  if (kids.length > 7) {
    tabs.push({ label: 'Templates', idx: [7] });
  }

  // Tag elements
  tabs.forEach(function(tab, ti) {
    tab.idx.forEach(function(kidIdx) {
      if (kids[kidIdx]) kids[kidIdx].setAttribute('data-ci-tab', ti);
    });
  });

  // Build tab bar
  var tabBar = document.createElement('div');
  tabBar.className = 'ci-tabs';

  tabs.forEach(function(tab, ti) {
    var btn = document.createElement('button');
    btn.className = 'ci-tab' + (ti === 0 ? ' ci-tab-active' : '');
    btn.textContent = tab.label;
    btn.onclick = function() {
      tabBar.querySelectorAll('.ci-tab').forEach(function(t) { t.classList.remove('ci-tab-active'); });
      btn.classList.add('ci-tab-active');
      container.querySelectorAll('[data-ci-tab]').forEach(function(el) { el.classList.add('ci-hide'); });
      container.querySelectorAll('[data-ci-tab="' + ti + '"]').forEach(function(el) { el.classList.remove('ci-hide'); });
    };
    tabBar.appendChild(btn);
  });

  // Insert tab bar after Xero box (index 1)
  if (kids[2]) {
    container.insertBefore(tabBar, kids[2]);
  }

  // Hide non-active tabs
  tabs.forEach(function(tab, ti) {
    if (ti > 0) {
      tab.idx.forEach(function(kidIdx) {
        if (kids[kidIdx]) kids[kidIdx].classList.add('ci-hide');
      });
    }
  });
}

var _t = null;
new MutationObserver(function() {
  if (_done) return;
  if (_t) clearTimeout(_t);
  _t = setTimeout(setup, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Company tabs loaded');

} catch(e) {
  console.error('Company tabs error:', e);
}
})();
