// M4 Company Info Tabs
// Converts long scroll into clean tabbed layout
// Xero stays at top as key feature
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = '.ci-tabs{display:flex;gap:0;border-bottom:2px solid #e2e8f0;margin-bottom:20px;overflow-x:auto;-webkit-overflow-scrolling:touch}.dark .ci-tabs{border-color:#374151}.ci-tab{padding:10px 18px;font-size:13px;font-weight:600;color:#64748b;background:none;border:none;cursor:pointer;font-family:inherit;white-space:nowrap;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.2s}.ci-tab:hover{color:#0d9488}.ci-tab-active{color:#0d9488;border-bottom-color:#0d9488}.ci-section{display:none}.ci-section-active{display:block}@media(max-width:768px){.ci-tab{padding:8px 12px;font-size:11px}}';
document.head.appendChild(css);

var _done = false;

function setupTabs() {
  if (_done) return;

  // Find company settings heading
  var compH2 = null;
  document.querySelectorAll('h2').forEach(function(el) {
    if (el.textContent.trim() === 'Company Settings') compH2 = el;
  });
  if (!compH2) return;

  var container = compH2.closest('div');
  if (!container) return;
  if (container.querySelector('.ci-tabs')) return;

  _done = true;

  // Tab config
  var tabConfig = [
    { label: 'Business Info', match: 'Company Settings' },
    { label: 'Logo', match: 'Company Logo' },
    { label: 'Bank Details', match: 'Bank Details' },
    { label: 'Stripe', match: 'Stripe Payment' },
    { label: 'Email', match: 'Email Settings' },
    { label: 'Automations', match: 'Email Automations' },
    { label: 'SMS', match: 'SMS Notifications' }
  ];

  // Find headings
  var sections = [];
  var headings = container.querySelectorAll('h2, h3');

  headings.forEach(function(heading) {
    var text = heading.textContent.trim();
    tabConfig.forEach(function(tab) {
      if (text.indexOf(tab.match) !== -1) {
        sections.push({ label: tab.label, heading: heading });
      }
    });
  });

  if (sections.length < 2) return;

  // Check for Xero section - keep it always visible at top
  var xeroSection = null;
  container.querySelectorAll('h3, h2, div').forEach(function(el) {
    var t = el.textContent.trim();
    if (t.indexOf('Xero') !== -1 && (el.tagName === 'H3' || el.tagName === 'H2') && !xeroSection) {
      xeroSection = el;
    }
  });

  // Group headings into wrappers
  sections.forEach(function(sec, idx) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ci-section' + (idx === 0 ? ' ci-section-active' : '');
    wrapper.id = 'ci-sec-' + idx;

    var nextHeading = sections[idx + 1] ? sections[idx + 1].heading : null;
    var el = sec.heading;
    var els = [el];

    while (el.nextElementSibling) {
      el = el.nextElementSibling;
      if (el === nextHeading) break;
      var isTab = false;
      tabConfig.forEach(function(t) {
        if (el.textContent.trim().indexOf(t.match) !== -1 && (el.tagName === 'H2' || el.tagName === 'H3')) isTab = true;
      });
      if (isTab) break;
      // Don't capture Xero section into a tab
      if (xeroSection && el === xeroSection) break;
      els.push(el);
    }

    sec.heading.parentNode.insertBefore(wrapper, sec.heading);
    els.forEach(function(e) { wrapper.appendChild(e); });
  });

  // Build tab bar
  var tabBar = document.createElement('div');
  tabBar.className = 'ci-tabs';

  sections.forEach(function(sec, idx) {
    var btn = document.createElement('button');
    btn.className = 'ci-tab' + (idx === 0 ? ' ci-tab-active' : '');
    btn.textContent = sec.label;
    btn.onclick = function() {
      tabBar.querySelectorAll('.ci-tab').forEach(function(t) { t.classList.remove('ci-tab-active'); });
      container.querySelectorAll('.ci-section').forEach(function(s) { s.classList.remove('ci-section-active'); });
      btn.classList.add('ci-tab-active');
      var target = document.getElementById('ci-sec-' + idx);
      if (target) target.classList.add('ci-section-active');
    };
    tabBar.appendChild(btn);
  });

  // Insert tab bar
  var firstSection = container.querySelector('.ci-section');
  if (firstSection) {
    container.insertBefore(tabBar, firstSection);
  }
}

var _t = null;
new MutationObserver(function() {
  if (_done) return;
  if (_t) clearTimeout(_t);
  _t = setTimeout(setupTabs, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Company tabs loaded');

} catch(e) {
  console.error('Company tabs error:', e);
}
})();
