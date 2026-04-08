// M4 Co-Brand Header - Tradies Network v3
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.cb-header-wrap{display:flex;align-items:center;width:100%;padding:12px 0}',
'.cb-tn-logo{height:90px;width:auto;object-fit:contain;filter:invert(1);flex-shrink:0}',
'.cb-center{flex:1;display:flex;align-items:center;justify-content:center;gap:14px}',
'.cb-divider{width:2px;height:44px;background:rgba(255,255,255,0.15);flex-shrink:0}',
'.cb-text{display:flex;flex-direction:column;line-height:1.2}',
'.cb-tn-name{font-size:24px;font-weight:800;color:#fff;letter-spacing:1px;white-space:nowrap}',
'.cb-powered{font-size:13px;color:#94a3b8;letter-spacing:0.5px;white-space:nowrap;margin-top:2px}',
'.cb-powered span{color:#2dd4bf;font-weight:700}',
'@media(max-width:768px){.cb-tn-logo{height:50px}.cb-tn-name{font-size:16px}.cb-powered{font-size:10px}.cb-divider{height:30px}}'
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

  _cbDone = true;
  var flag = document.createElement('div');
  flag.id = 'cb-flag';
  flag.style.display = 'none';
  document.body.appendChild(flag);

  // Hide EVERYTHING in the header row
  for (var i = 0; i < headerRow.children.length; i++) {
    headerRow.children[i].style.display = 'none';
  }

  // Also hide "Logged in" text and circle logo in parent/grandparent
  var grandparent = headerRow.parentElement;
  if (grandparent) {
    for (var j = 0; j < grandparent.children.length; j++) {
      var child = grandparent.children[j];
      var text = child.textContent || '';
      if (text.indexOf('Logged in') !== -1) child.style.display = 'none';
      // Hide circle logo images
      var imgs = child.querySelectorAll('img');
      imgs.forEach(function(img) {
        if (img.src.indexOf('tradies') === -1) img.style.display = 'none';
      });
    }
    // Check one more level up
    var greatgp = grandparent.parentElement;
    if (greatgp) {
      greatgp.querySelectorAll('img').forEach(function(img) {
        if (img.src.indexOf('final_logo') !== -1 || (img.src.indexOf('logo') !== -1 && img.src.indexOf('tradies') === -1)) {
          img.style.display = 'none';
        }
      });
      greatgp.querySelectorAll('div, span, p').forEach(function(el) {
        if (el.textContent.indexOf('Logged in') !== -1 && el.children.length < 3) {
          el.style.display = 'none';
        }
      });
    }
  }

  // Build new header
  var wrapper = document.createElement('div');
  wrapper.className = 'cb-header-wrap';
  wrapper.innerHTML =
    '<img class="cb-tn-logo" src="tradies-network-logo.png" alt="Tradies Network">' +
    '<div class="cb-center">' +
      '<div class="cb-divider"></div>' +
      '<div class="cb-text">' +
        '<div class="cb-tn-name">TRADIES NETWORK</div>' +
        '<div class="cb-powered">Powered by <span>M4 STREAMLINE</span></div>' +
      '</div>' +
    '</div>';

  headerRow.style.display = 'block';
  headerRow.innerHTML = '';
  headerRow.appendChild(wrapper);
}

var _cbTimer = null;
new MutationObserver(function() {
  if (_cbDone) return;
  if (_cbTimer) clearTimeout(_cbTimer);
  _cbTimer = setTimeout(injectCoBrand, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Co-brand header v3 loaded');

} catch(e) {
  console.error('Co-brand error:', e);
}
})();
