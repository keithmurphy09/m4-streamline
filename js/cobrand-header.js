// M4 Co-Brand Header - Tradies Network v5
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.cb-header-wrap{display:flex !important;align-items:center;width:100%;gap:16px;padding:4px 0;grid-column:1/-1 !important}',
'.cb-tn-logo{height:65px;width:auto;object-fit:contain;filter:invert(1) brightness(2) contrast(1.5);flex-shrink:0}',
'.cb-text{display:flex;flex-direction:column;line-height:1.2;flex:1;text-align:center}',
'.cb-tn-name{font-size:22px;font-weight:800;color:#fff;letter-spacing:1px}',
'.cb-powered{font-size:12px;color:#94a3b8;letter-spacing:0.5px;margin-top:2px}',
'.cb-powered span{color:#2dd4bf;font-weight:700}',
'.cb-right{display:flex;align-items:center;gap:8px;flex-shrink:0}',
'@media(max-width:768px){.cb-tn-logo{height:40px}.cb-tn-name{font-size:15px}.cb-powered{font-size:9px}}'
].join('\n');
document.head.appendChild(css);

var _cbDone = false;

function injectCoBrand() {
  if (_cbDone) return;
  if (document.getElementById('cb-flag')) return;

  // Find the header grid container
  var headerGrid = document.querySelector('.max-w-7xl.mx-auto.flex.flex-col');
  if (!headerGrid) return;
  // Make sure it's in the black header
  var parent = headerGrid.parentElement;
  if (!parent || parent.className.indexOf('bg-black') === -1) return;

  _cbDone = true;
  var flag = document.createElement('div');
  flag.id = 'cb-flag';
  flag.style.display = 'none';
  document.body.appendChild(flag);

  // Collect all existing children
  var children = Array.from(headerGrid.children);
  
  // Find which ones are the logo/branding (to hide) vs admin buttons (to keep)
  var keepElements = [];
  children.forEach(function(child) {
    var text = child.textContent || '';
    var hasLogo = child.querySelector('img') || text.indexOf('Logged in') !== -1;
    var isM4Brand = text.indexOf('M4 STREAMLINE') !== -1 && text.indexOf('TRADIES') === -1;
    
    if (hasLogo || isM4Brand || text.indexOf('Logged in') !== -1) {
      child.style.display = 'none';
    } else if (child.className.indexOf('cb-') === -1) {
      keepElements.push(child);
    }
  });

  // Remove old cb-header-wrap if exists from previous versions
  var oldWrap = headerGrid.querySelector('.cb-header-wrap');
  if (oldWrap) oldWrap.remove();

  // Build new header
  var wrapper = document.createElement('div');
  wrapper.className = 'cb-header-wrap';

  // Logo on left
  var logo = document.createElement('img');
  logo.className = 'cb-tn-logo';
  logo.src = 'tradies-network-logo.png';
  logo.alt = 'Tradies Network';
  wrapper.appendChild(logo);

  // Text in center
  var textBlock = document.createElement('div');
  textBlock.className = 'cb-text';
  textBlock.innerHTML = '<div class="cb-tn-name">TRADIES NETWORK</div><div class="cb-powered">Powered by <span>M4 STREAMLINE</span></div>';
  wrapper.appendChild(textBlock);

  // Admin buttons on right
  var right = document.createElement('div');
  right.className = 'cb-right';
  keepElements.forEach(function(el) {
    right.appendChild(el);
  });
  wrapper.appendChild(right);

  // Insert as first child
  headerGrid.insertBefore(wrapper, headerGrid.firstChild);
}

var _cbTimer = null;
new MutationObserver(function() {
  if (_cbDone) return;
  if (_cbTimer) clearTimeout(_cbTimer);
  _cbTimer = setTimeout(injectCoBrand, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Co-brand header v5 loaded');

} catch(e) {
  console.error('Co-brand error:', e);
}
})();
