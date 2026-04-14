// M4 Signup Branding - Tradies Network
// Replaces M4/Streamline branding on auth page with T logo
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = '.tn-auth-logo{height:80px;width:auto;margin:0 auto 8px;display:block;}.tn-auth-txt{height:28px;width:auto;display:block;margin:0 auto 4px;filter:invert(1)}.tn-auth-sub{font-size:11px;color:#64748b;text-align:center;margin-bottom:16px}.tn-auth-sub b{color:#0d9488}';
document.head.appendChild(css);

function brandAuth() {
  // Find "M4" heading - it's the teal text at top of auth
  var m4El = null;
  document.querySelectorAll('h1, h2, div, span').forEach(function(el) {
    if (el.textContent.trim() === 'M4' && el.children.length === 0) {
      var next = el.nextElementSibling;
      if (next && (next.textContent.trim() === 'Streamline' || next.textContent.trim().indexOf('Streamline') !== -1)) {
        m4El = el;
      }
    }
  });
  if (!m4El) return;
  if (m4El.dataset.tnDone) return;
  m4El.dataset.tnDone = '1';

  // Find parent that holds M4 + Streamline + Business Management
  var parent = m4El.parentElement;
  if (!parent) return;

  // Hide M4, Streamline, Business Management
  Array.from(parent.children).forEach(function(child) {
    var t = child.textContent.trim();
    if (t === 'M4' || t === 'Streamline' || t === 'Business Management') {
      child.style.display = 'none';
    }
  });

  // Insert T logo + branding
  var wrap = document.createElement('div');
  wrap.innerHTML = '<img class="tn-auth-logo" src="tradies-network-logo.png" alt="Tradies Network"><img class="tn-auth-txt" src="tradies-network-text.png" alt="Tradies Network"><div class="tn-auth-sub">Powered by <b>M4 STREAMLINE</b></div>';
  parent.insertBefore(wrap, parent.firstChild);
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(brandAuth, 300);
}).observe(document.body, { childList: true, subtree: true });

} catch(e) { console.error('Auth branding error:', e); }
})();
