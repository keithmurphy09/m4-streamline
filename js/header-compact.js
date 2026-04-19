// M4 Header Compact - Mobile
// Clones controls into cb-row, then removes IDs from original to fix settings menu
// Additive only
(function(){
try {

function compact() {
  if (window.innerWidth > 768) return;

  var header = document.querySelector('.bg-black.border-b-4');
  if (!header) return;

  header.style.setProperty('padding', '4px 8px', 'important');
  header.style.setProperty('height', 'auto', 'important');

  var headerInner = header.querySelector('.max-w-7xl');
  if (headerInner) {
    headerInner.style.setProperty('gap', '0px', 'important');
    headerInner.style.setProperty('padding-bottom', '0px', 'important');
    headerInner.style.setProperty('height', 'auto', 'important');
    headerInner.style.setProperty('min-height', '0', 'important');
    headerInner.style.setProperty('display', 'flex', 'important');
    headerInner.style.setProperty('flex-direction', 'column', 'important');

    for (var i = 0; i < headerInner.children.length; i++) {
      var child = headerInner.children[i];
      var display = getComputedStyle(child).display;
      if (display === 'none') continue;
      child.style.setProperty('margin-bottom', '2px', 'important');
      child.style.setProperty('height', 'auto', 'important');
      child.style.setProperty('min-height', '0', 'important');
    }
  }

  var cbRow = document.querySelector('.cb-row');
  var controlsRow = null;

  if (headerInner) {
    for (var j = 0; j < headerInner.children.length; j++) {
      var ch = headerInner.children[j];
      if (ch.classList.contains('cb-row')) continue;
      if (ch.classList.contains('cb-hide')) continue;
      if (getComputedStyle(ch).display === 'none') continue;
      if (ch.querySelectorAll('button').length > 0 || ch.querySelector('.bg-red-600')) {
        controlsRow = ch;
        break;
      }
    }
  }

  if (cbRow && controlsRow && !cbRow.dataset.merged) {
    cbRow.dataset.merged = '1';

    // Style cb-row
    cbRow.style.setProperty('display', 'flex', 'important');
    cbRow.style.setProperty('flex-wrap', 'nowrap', 'important');
    cbRow.style.setProperty('align-items', 'center', 'important');
    cbRow.style.setProperty('justify-content', 'space-between', 'important');
    cbRow.style.setProperty('padding', '4px 0', 'important');
    cbRow.style.setProperty('width', '100%', 'important');

    var cbLogo = cbRow.querySelector('.cb-logo');
    if (cbLogo) {
      cbLogo.style.setProperty('height', '30px', 'important');
      cbLogo.style.setProperty('margin-right', '0', 'important');
      cbLogo.style.setProperty('flex-shrink', '0', 'important');
    }

    var cbMid = cbRow.querySelector('.cb-mid');
    if (cbMid) {
      cbMid.style.setProperty('flex', '1', 'important');
      cbMid.style.setProperty('text-align', 'center', 'important');
      cbMid.style.setProperty('align-items', 'center', 'important');
    }

    var cbTxt = cbRow.querySelector('.cb-txt');
    if (cbTxt) cbTxt.style.setProperty('height', '12px', 'important');

    var cbP = cbRow.querySelector('.cb-p');
    if (cbP) {
      cbP.style.setProperty('font-size', '7px', 'important');
      cbP.style.setProperty('margin-top', '0', 'important');
    }

    // Clone controls into cb-row
    var controlsClone = controlsRow.cloneNode(true);
    controlsClone.style.setProperty('display', 'flex', 'important');
    controlsClone.style.setProperty('align-items', 'center', 'important');
    controlsClone.style.setProperty('gap', '4px', 'important');
    controlsClone.style.setProperty('flex-shrink', '0', 'important');
    controlsClone.style.setProperty('margin-bottom', '0', 'important');

    controlsClone.querySelectorAll('button').forEach(function(b) {
      b.style.setProperty('padding', '3px 6px', 'important');
      b.style.setProperty('font-size', '11px', 'important');
      b.style.setProperty('min-height', '28px', 'important');
    });

    var adminBadge = controlsClone.querySelector('.bg-red-600');
    if (adminBadge) {
      adminBadge.style.setProperty('font-size', '9px', 'important');
      adminBadge.style.setProperty('padding', '2px 5px', 'important');
    }

    cbRow.appendChild(controlsClone);

    // Remove IDs from original so getElementById finds the clone
    var origMenu = controlsRow.querySelector('#settings-menu');
    if (origMenu) origMenu.removeAttribute('id');

    // Hide original controls row
    controlsRow.style.setProperty('display', 'none', 'important');
  }

  // Nav bar
  var allDivs = document.querySelectorAll('div.border-b.border-teal-400');
  for (var k = 0; k < allDivs.length; k++) {
    var navOuter = allDivs[k];
    if (navOuter.closest('.bg-black')) continue;

    navOuter.style.setProperty('max-height', '44px', 'important');
    navOuter.style.setProperty('overflow', 'hidden', 'important');

    var h16 = navOuter.querySelector('[class*="h-16"]');
    if (h16) h16.style.setProperty('height', '40px', 'important');

    var desktopNav = navOuter.querySelector('nav');
    if (desktopNav) desktopNav.style.setProperty('display', 'none', 'important');

    break;
  }
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(compact, 150);
}).observe(document.body, { childList: true, subtree: true });

setTimeout(compact, 500);
setTimeout(compact, 1500);
setTimeout(compact, 3500);

console.log('Header compact loaded');

} catch(e) { console.error('header-compact error:', e); }
})();
