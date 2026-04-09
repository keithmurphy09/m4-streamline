// M4 Co-Brand Header - Tradies Network v7
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.cb-wrap{display:flex !important;align-items:center;width:100%;padding:6px 0;grid-column:1/-1 !important}',
'.cb-logo-img{height:65px;width:auto;object-fit:contain;filter:invert(1) brightness(3) contrast(1.2);flex-shrink:0}',
'.cb-center{flex:1;text-align:center}',
'.cb-name{font-size:24px;font-weight:800;color:#fff;letter-spacing:1.5px}',
'.cb-sub{font-size:13px;color:#94a3b8;letter-spacing:0.5px;margin-top:3px}',
'.cb-sub span{color:#2dd4bf;font-weight:700}',
'@media(max-width:768px){.cb-logo-img{height:40px}.cb-name{font-size:16px}.cb-sub{font-size:10px}}'
].join('\n');
document.head.appendChild(css);

function injectCoBrand() {
  var headerGrid = document.querySelector('.max-w-7xl.mx-auto.flex.flex-col');
  if (!headerGrid) return;
  var parent = headerGrid.parentElement;
  if (!parent || parent.className.indexOf('bg-black') === -1) return;

  // Already injected on this render
  if (headerGrid.querySelector('.cb-wrap')) return;

  var children = Array.from(headerGrid.children);

  children.forEach(function(child) {
    var text = child.textContent || '';
    // Hide logo row and "Logged in" text
    if (child.querySelector('img') && text.indexOf('Logged in') !== -1) {
      child.style.display = 'none';
      return;
    }
    // Hide M4 STREAMLINE branding row
    if (text.indexOf('M4 STREAMLINE') !== -1 && text.indexOf('TRADIES') === -1) {
      child.style.display = 'none';
      return;
    }
    // In the buttons row, hide demo mode buttons but keep everything else
    var btns = child.querySelectorAll('button');
    btns.forEach(function(btn) {
      var oc = btn.getAttribute('onclick') || '';
      if (oc.indexOf('enterDemoMode') !== -1 || oc.indexOf('exitDemoMode') !== -1) {
        btn.style.display = 'none';
      }
    });
  });

  // Build wrapper
  var wrapper = document.createElement('div');
  wrapper.className = 'cb-wrap';
  wrapper.innerHTML =
    '<img class="cb-logo-img" src="tradies-network-logo.png" alt="Tradies Network">' +
    '<div class="cb-center">' +
      '<div class="cb-name">TRADIES NETWORK</div>' +
      '<div class="cb-sub">Powered by <span>M4 STREAMLINE</span></div>' +
    '</div>';

  headerGrid.insertBefore(wrapper, headerGrid.firstChild);
}

var _cbTimer = null;
new MutationObserver(function() {
  if (_cbTimer) clearTimeout(_cbTimer);
  _cbTimer = setTimeout(injectCoBrand, 200);
}).observe(document.body, { childList: true, subtree: true });

console.log('Co-brand header v7 loaded');

} catch(e) {
  console.error('Co-brand error:', e);
}
})();
