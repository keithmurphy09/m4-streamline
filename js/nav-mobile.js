// M4 Nav Bar Mobile Fix
// Targets the hamburger+M4 bar from app.js line 192
// Additive only
(function(){
try {

function fixNav() {
  if (window.innerWidth > 768) return;

  // The nav bar is: div.border-b.border-teal-400 > div.max-w-7xl > div.flex.items-center.justify-between.h-16
  // Find it by traversing from the border-b.border-teal-400 that is NOT inside the header
  var candidates = document.querySelectorAll('div.border-b');
  for (var i = 0; i < candidates.length; i++) {
    var el = candidates[i];
    // Skip if inside black header
    if (el.closest('.bg-black')) continue;
    // Must have border-teal-400 class
    if (!el.className || el.className.indexOf('border-teal-400') === -1) continue;

    // Found the nav outer container
    el.style.setProperty('max-height', '44px', 'important');
    el.style.setProperty('overflow', 'hidden', 'important');

    // Find the inner flex row - it contains the hamburger and M4 text
    var allDivs = el.querySelectorAll('div');
    for (var j = 0; j < allDivs.length; j++) {
      var d = allDivs[j];
      // Look for the div that contains both a button and the M4 text
      var hasButton = d.querySelector('button');
      var hasM4 = false;
      for (var c = 0; c < d.children.length; c++) {
        if (d.children[c].textContent && d.children[c].textContent.trim() === 'M4') hasM4 = true;
      }
      if (hasButton && hasM4) {
        // This is the flex row
        d.style.setProperty('display', 'flex', 'important');
        d.style.setProperty('flex-direction', 'row', 'important');
        d.style.setProperty('align-items', 'center', 'important');
        d.style.setProperty('justify-content', 'space-between', 'important');
        d.style.setProperty('height', '40px', 'important');
        break;
      }
    }

    // Hide desktop nav
    var nav = el.querySelector('nav');
    if (nav) nav.style.setProperty('display', 'none', 'important');

    break;
  }
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(fixNav, 150);
}).observe(document.body, { childList: true, subtree: true });

setTimeout(fixNav, 500);
setTimeout(fixNav, 1500);
setTimeout(fixNav, 3500);

console.log('Nav mobile fix loaded');

} catch(e) { console.error('nav-mobile error:', e); }
})();
