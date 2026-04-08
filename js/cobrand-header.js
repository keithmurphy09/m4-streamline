// M4 Co-Brand Header - Tradies Network
// Adds Tradies Network logo and co-branded text to header
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.cb-header{display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
'.cb-tn-logo{height:45px;width:auto;object-fit:contain}',
'.cb-divider{width:1px;height:36px;background:rgba(255,255,255,0.2);flex-shrink:0}',
'.cb-text{display:flex;flex-direction:column;line-height:1.2}',
'.cb-tn-name{font-size:16px;font-weight:800;color:#fff;letter-spacing:0.5px}',
'.cb-powered{font-size:10px;color:#94a3b8;letter-spacing:0.5px}',
'.cb-powered span{color:#2dd4bf;font-weight:700}',
'@media(max-width:768px){.cb-tn-logo{height:32px}.cb-tn-name{font-size:13px}.cb-powered{font-size:8px}.cb-divider{height:28px}}'
].join('\n');
document.head.appendChild(css);

function injectCoBrand() {
  // Find the existing logo/header area
  var logoImg = document.querySelector('header img, .header img, [class*="header"] img');
  if (!logoImg) {
    // Try finding by the M4 STREAMLINE text
    var m4Text = null;
    document.querySelectorAll('div, span, a').forEach(function(el) {
      if (el.textContent.trim() === 'M4 STREAMLINE' || el.textContent.trim().indexOf('M4 STREAMLINE') === 0) {
        if (!m4Text || el.textContent.trim().length < (m4Text.textContent || '').length) m4Text = el;
      }
    });
    if (m4Text) logoImg = m4Text;
  }

  if (!logoImg) return;
  if (logoImg.dataset.cbDone) return;
  logoImg.dataset.cbDone = 'true';

  // Find the header container
  var headerContainer = logoImg.parentElement;
  if (!headerContainer) return;

  // Build co-branded header
  var wrapper = document.createElement('div');
  wrapper.className = 'cb-header';

  // Tradies Network logo
  var tnLogo = document.createElement('img');
  tnLogo.className = 'cb-tn-logo';
  tnLogo.src = 'tradies-network-logo.png';
  tnLogo.alt = 'Tradies Network';
  // Invert if on dark background (the logo is black on transparent)
  tnLogo.style.filter = 'invert(1)';

  // Divider
  var divider = document.createElement('div');
  divider.className = 'cb-divider';

  // Text
  var textBlock = document.createElement('div');
  textBlock.className = 'cb-text';
  textBlock.innerHTML = '<div class="cb-tn-name">TRADIES NETWORK</div><div class="cb-powered">Powered by <span>M4 STREAMLINE</span></div>';

  wrapper.appendChild(tnLogo);
  wrapper.appendChild(divider);
  wrapper.appendChild(textBlock);

  // Replace or insert before existing logo
  if (logoImg.tagName === 'IMG') {
    logoImg.style.display = 'none';
    logoImg.parentElement.insertBefore(wrapper, logoImg);
  } else {
    // It's a text element - hide original M4 branding and replace
    var parent = logoImg.parentElement;
    // Hide all children that are part of the old branding
    var siblings = parent.children;
    for (var i = 0; i < siblings.length; i++) {
      if (siblings[i].textContent.indexOf('M4 STREAMLINE') !== -1 || siblings[i].textContent.indexOf('streamlining') !== -1) {
        siblings[i].style.display = 'none';
      }
    }
    if (logoImg.textContent.indexOf('M4 STREAMLINE') !== -1) {
      logoImg.style.display = 'none';
    }
    parent.insertBefore(wrapper, parent.firstChild);
  }

  // Also update the existing logo img if it's the M4 logo
  var allImgs = headerContainer.querySelectorAll('img');
  allImgs.forEach(function(img) {
    if (img !== tnLogo && (img.src.indexOf('final_logo') !== -1 || img.src.indexOf('logo') !== -1) && img.src.indexOf('tradies') === -1) {
      img.style.display = 'none';
    }
  });
}

var _cbTimer = null;
new MutationObserver(function() {
  if (_cbTimer) clearTimeout(_cbTimer);
  _cbTimer = setTimeout(injectCoBrand, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Co-brand header loaded');

} catch(e) {
  console.error('Co-brand error:', e);
}
})();
