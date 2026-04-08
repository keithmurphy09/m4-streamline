// M4 Co-Brand Header - Tradies Network v2
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.cb-header{display:flex;align-items:center;gap:12px;flex-wrap:nowrap}',
'.cb-tn-logo{height:45px;width:auto;object-fit:contain;filter:invert(1)}',
'.cb-divider{width:1px;height:36px;background:rgba(255,255,255,0.2);flex-shrink:0}',
'.cb-text{display:flex;flex-direction:column;line-height:1.2}',
'.cb-tn-name{font-size:16px;font-weight:800;color:#fff;letter-spacing:0.5px;white-space:nowrap}',
'.cb-powered{font-size:10px;color:#94a3b8;letter-spacing:0.5px;white-space:nowrap}',
'.cb-powered span{color:#2dd4bf;font-weight:700}',
'@media(max-width:768px){.cb-tn-logo{height:30px}.cb-tn-name{font-size:12px}.cb-powered{font-size:8px}.cb-divider{height:24px}}'
].join('\n');
document.head.appendChild(css);

var _cbDone = false;

function injectCoBrand() {
  if (_cbDone) return;
  if (document.getElementById('cb-flag')) return;

  // Find the M4 STREAMLINE text in the header
  var target = null;
  document.querySelectorAll('div, span, a, h1, h2').forEach(function(el) {
    var t = el.textContent.trim();
    if (t === 'M4 STREAMLINE' && !target) target = el;
  });

  if (!target) return;

  // Find the header row (parent that contains logo + text)
  var headerRow = target.parentElement;
  if (!headerRow) return;

  // Prevent re-running
  _cbDone = true;
  var flag = document.createElement('div');
  flag.id = 'cb-flag';
  flag.style.display = 'none';
  document.body.appendChild(flag);

  // Hide all existing branding in this row
  for (var i = 0; i < headerRow.children.length; i++) {
    var child = headerRow.children[i];
    var text = child.textContent || '';
    if (text.indexOf('M4 STREAMLINE') !== -1 || text.indexOf('streamlining') !== -1 || text.indexOf('Logged in') !== -1) {
      child.style.display = 'none';
    }
    if (child.tagName === 'IMG') {
      child.style.display = 'none';
    }
  }

  // Build co-brand element
  var wrapper = document.createElement('div');
  wrapper.className = 'cb-header';
  wrapper.innerHTML = '<img class="cb-tn-logo" src="tradies-network-logo.png" alt="Tradies Network">' +
    '<div class="cb-divider"></div>' +
    '<div class="cb-text"><div class="cb-tn-name">TRADIES NETWORK</div><div class="cb-powered">Powered by <span>M4 STREAMLINE</span></div></div>';

  headerRow.insertBefore(wrapper, headerRow.firstChild);
}

var _cbTimer = null;
var _cbObs = new MutationObserver(function() {
  if (_cbDone) return;
  if (_cbTimer) clearTimeout(_cbTimer);
  _cbTimer = setTimeout(injectCoBrand, 500);
});
_cbObs.observe(document.body, { childList: true, subtree: true });

console.log('Co-brand header v2 loaded');

} catch(e) {
  console.error('Co-brand error:', e);
}
})();
