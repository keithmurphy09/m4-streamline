// M4 Admin Panel Tabs
// Converts long scroll into clean tabbed layout
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = '.ap-tabs{display:flex;gap:0;border-bottom:2px solid #e2e8f0;margin-bottom:20px;overflow-x:auto;-webkit-overflow-scrolling:touch}.dark .ap-tabs{border-color:#374151}.ap-tab{padding:10px 18px;font-size:13px;font-weight:600;color:#64748b;background:none;border:none;cursor:pointer;font-family:inherit;white-space:nowrap;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.2s}.ap-tab:hover{color:#0d9488}.ap-tab-active{color:#0d9488;border-bottom-color:#0d9488}.ap-section{display:none}.ap-section-active{display:block}@media(max-width:768px){.ap-tab{padding:8px 12px;font-size:11px}}';
document.head.appendChild(css);

var _done = false;

function setupTabs() {
  if (_done) return;

  // Find the admin panel container - look for "All Users" heading
  var allUsersH2 = null;
  document.querySelectorAll('h2').forEach(function(el) {
    if (el.textContent.trim() === 'All Users') allUsersH2 = el;
  });
  if (!allUsersH2) return;

  var container = allUsersH2.closest('div');
  if (!container) return;
  if (container.querySelector('.ap-tabs')) return;

  _done = true;

  // Define tab config - heading text to match
  var tabConfig = [
    { label: 'Users', match: 'All Users' },
    { label: 'Support', match: 'Support Messages' },
    { label: 'Promo Codes', match: 'Promo Codes' },
    { label: 'Accounts', match: 'Account Management' },
    { label: 'Discounts', match: 'Active Discounts' }
  ];

  // Find all section headings and their content
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

  // Group each heading + siblings until next heading into a wrapper
  sections.forEach(function(sec, idx) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ap-section' + (idx === 0 ? ' ap-section-active' : '');
    wrapper.id = 'ap-sec-' + idx;

    // Collect elements from this heading until the next section heading
    var nextHeading = sections[idx + 1] ? sections[idx + 1].heading : null;
    var el = sec.heading;
    var els = [el];

    while (el.nextElementSibling) {
      el = el.nextElementSibling;
      if (el === nextHeading) break;
      // Stop if we hit another h2/h3 that matches a tab
      var isTab = false;
      tabConfig.forEach(function(t) {
        if (el.textContent.trim().indexOf(t.match) !== -1 && (el.tagName === 'H2' || el.tagName === 'H3')) isTab = true;
      });
      if (isTab) break;
      els.push(el);
    }

    // Wrap them
    sec.heading.parentNode.insertBefore(wrapper, sec.heading);
    els.forEach(function(e) { wrapper.appendChild(e); });
  });

  // Build tab bar
  var tabBar = document.createElement('div');
  tabBar.className = 'ap-tabs';

  // Keep the active user count visible above tabs
  var countEl = container.querySelector('[class*="text-2xl"], [class*="text-3xl"]');
  
  sections.forEach(function(sec, idx) {
    var btn = document.createElement('button');
    btn.className = 'ap-tab' + (idx === 0 ? ' ap-tab-active' : '');
    btn.textContent = sec.label;
    btn.onclick = function() {
      // Deactivate all
      tabBar.querySelectorAll('.ap-tab').forEach(function(t) { t.classList.remove('ap-tab-active'); });
      container.querySelectorAll('.ap-section').forEach(function(s) { s.classList.remove('ap-section-active'); });
      // Activate this
      btn.classList.add('ap-tab-active');
      var target = document.getElementById('ap-sec-' + idx);
      if (target) target.classList.add('ap-section-active');
    };
    tabBar.appendChild(btn);
  });

  // Insert tab bar before first section
  var firstSection = container.querySelector('.ap-section');
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

console.log('Admin tabs loaded');

} catch(e) {
  console.error('Admin tabs error:', e);
}
})();
