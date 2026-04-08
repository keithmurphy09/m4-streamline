// M4 Co-Brand Header - Tradies Network v4
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.cb-header-wrap{display:flex;align-items:center;width:100%;gap:16px}',
'.cb-left{display:flex;align-items:center;gap:16px;flex-shrink:0}',
'.cb-tn-logo{height:80px;width:auto;object-fit:contain;filter:invert(1) brightness(1.8)}',
'.cb-divider{width:2px;height:44px;background:rgba(255,255,255,0.15);flex-shrink:0}',
'.cb-text{display:flex;flex-direction:column;line-height:1.2}',
'.cb-tn-name{font-size:22px;font-weight:800;color:#fff;letter-spacing:1px;white-space:nowrap}',
'.cb-powered{font-size:12px;color:#94a3b8;letter-spacing:0.5px;white-space:nowrap;margin-top:2px}',
'.cb-powered span{color:#2dd4bf;font-weight:700}',
'.cb-right{display:flex;align-items:center;gap:8px;margin-left:auto;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end}',
'@media(max-width:768px){.cb-tn-logo{height:40px}.cb-tn-name{font-size:14px}.cb-powered{font-size:9px}.cb-divider{height:28px}.cb-header-wrap{gap:8px}}'
].join('\n');
document.head.appendChild(css);

var _cbDone = false;

function injectCoBrand() {
  if (_cbDone) return;
  if (document.getElementById('cb-flag')) return;

  // Find the M4 STREAMLINE text
  var target = null;
  document.querySelectorAll('div, span, a, h1, h2').forEach(function(el) {
    var t = el.textContent.trim();
    if (t === 'M4 STREAMLINE' && !target) target = el;
  });
  if (!target) return;

  // Find the header row
  var headerRow = target.parentElement;
  if (!headerRow) return;

  // Go up one more if needed to find the row with all the buttons
  var containerRow = headerRow.parentElement;
  if (!containerRow) return;

  _cbDone = true;
  var flag = document.createElement('div');
  flag.id = 'cb-flag';
  flag.style.display = 'none';
  document.body.appendChild(flag);

  // Collect the right-side elements (ADMIN badge, Sole Trader, Business, Real, icons)
  var rightElements = [];
  var children = Array.from(containerRow.children);
  children.forEach(function(child) {
    var text = child.textContent || '';
    var isLogo = child.querySelector('img[src*="final_logo"]') || child.querySelector('img[src*="logo"]');
    var isM4Text = text.indexOf('M4 STREAMLINE') !== -1 || text.indexOf('streamlining') !== -1;
    var isLoggedIn = text.indexOf('Logged in') !== -1;

    if (isLogo || isM4Text || isLoggedIn) {
      child.style.display = 'none';
    } else {
      // Keep these - they're the admin badges, buttons, icons
      rightElements.push(child);
    }
  });

  // Hide the original header row content
  headerRow.style.display = 'none';

  // Build new header
  var wrapper = document.createElement('div');
  wrapper.className = 'cb-header-wrap';

  // Left: logo + divider + text
  var left = document.createElement('div');
  left.className = 'cb-left';
  left.innerHTML =
    '<img class="cb-tn-logo" src="tradies-network-logo.png" alt="Tradies Network">' +
    '<div class="cb-divider"></div>' +
    '<div class="cb-text">' +
      '<div class="cb-tn-name">TRADIES NETWORK</div>' +
      '<div class="cb-powered">Powered by <span>M4 STREAMLINE</span></div>' +
    '</div>';

  wrapper.appendChild(left);

  // Right: move existing buttons/badges
  var right = document.createElement('div');
  right.className = 'cb-right';
  rightElements.forEach(function(el) {
    right.appendChild(el);
  });
  wrapper.appendChild(right);

  containerRow.insertBefore(wrapper, containerRow.firstChild);
}

var _cbTimer = null;
new MutationObserver(function() {
  if (_cbDone) return;
  if (_cbTimer) clearTimeout(_cbTimer);
  _cbTimer = setTimeout(injectCoBrand, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Co-brand header v4 loaded');

} catch(e) {
  console.error('Co-brand error:', e);
}
})();
