// M4 Co-Brand Header - Tradies Network v6
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.cb-wrap{display:flex !important;align-items:center;width:100%;padding:6px 0;grid-column:1/-1 !important}',
'.cb-logo-box{flex-shrink:0;position:relative}',
'.cb-logo-img{height:65px;width:auto;object-fit:contain;filter:invert(1) brightness(3) contrast(1.2);position:relative;z-index:1}',
'.cb-logo-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.15),transparent 70%);z-index:0;pointer-events:none}',
'.cb-center{flex:1;text-align:center}',
'.cb-name{font-size:24px;font-weight:800;color:#fff;letter-spacing:1.5px}',
'.cb-sub{font-size:13px;color:#94a3b8;letter-spacing:0.5px;margin-top:3px}',
'.cb-sub span{color:#2dd4bf;font-weight:700}',
'.cb-admin{display:flex;align-items:center;gap:8px;flex-shrink:0}',
'@media(max-width:768px){.cb-logo-img{height:40px}.cb-logo-glow{width:50px;height:50px}.cb-name{font-size:16px}.cb-sub{font-size:10px}}'
].join('\n');
document.head.appendChild(css);

var _cbDone = false;

function injectCoBrand() {
  if (_cbDone) return;
  if (document.getElementById('cb-flag')) return;

  var headerGrid = document.querySelector('.max-w-7xl.mx-auto.flex.flex-col');
  if (!headerGrid) return;
  var parent = headerGrid.parentElement;
  if (!parent || parent.className.indexOf('bg-black') === -1) return;

  _cbDone = true;
  var flag = document.createElement('div');
  flag.id = 'cb-flag';
  flag.style.display = 'none';
  document.body.appendChild(flag);

  // Hide ALL existing children
  var children = Array.from(headerGrid.children);
  var adminBtns = [];
  children.forEach(function(child) {
    // Keep only the dark mode toggle and settings icon
    var btns = child.querySelectorAll('button');
    btns.forEach(function(btn) {
      var oc = btn.getAttribute('onclick') || '';
      var txt = btn.textContent.trim();
      // Keep dark mode and settings buttons
      if (oc.indexOf('darkMode') !== -1 || oc.indexOf('toggleTheme') !== -1 || btn.querySelector('svg[class*="w-6"]')) {
        adminBtns.push(btn);
      }
    });
    // Keep ADMIN badge
    var spans = child.querySelectorAll('span');
    spans.forEach(function(sp) {
      if (sp.textContent.trim() === 'ADMIN') adminBtns.push(sp);
    });
    child.style.display = 'none';
  });

  // Remove old wrappers
  var old = headerGrid.querySelector('.cb-wrap');
  if (old) old.remove();

  // Build new header
  var wrapper = document.createElement('div');
  wrapper.className = 'cb-wrap';

  // Logo with glow
  var logoBox = document.createElement('div');
  logoBox.className = 'cb-logo-box';
  logoBox.innerHTML = '<div class="cb-logo-glow"></div><img class="cb-logo-img" src="tradies-network-logo.png" alt="Tradies Network">';
  wrapper.appendChild(logoBox);

  // Centered text
  var center = document.createElement('div');
  center.className = 'cb-center';
  center.innerHTML = '<div class="cb-name">TRADIES NETWORK</div><div class="cb-sub">Powered by <span>M4 STREAMLINE</span></div>';
  wrapper.appendChild(center);

  // Admin buttons on right
  if (adminBtns.length > 0) {
    var adminBox = document.createElement('div');
    adminBox.className = 'cb-admin';
    adminBtns.forEach(function(btn) {
      adminBox.appendChild(btn);
    });
    wrapper.appendChild(adminBox);
  }

  headerGrid.insertBefore(wrapper, headerGrid.firstChild);
  wrapper.style.display = 'flex';
}

var _cbTimer = null;
new MutationObserver(function() {
  if (_cbDone) return;
  if (_cbTimer) clearTimeout(_cbTimer);
  _cbTimer = setTimeout(injectCoBrand, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Co-brand header v6 loaded');

} catch(e) {
  console.error('Co-brand error:', e);
}
})();
