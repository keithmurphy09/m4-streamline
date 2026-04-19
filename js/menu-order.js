// M4 Mobile Menu Order Fix
// Moves Resources section to bottom of hamburger menu
// Additive only
(function(){
try {

function fixMenuOrder() {
  if (window.innerWidth > 768) return;

  var menu = document.getElementById('mobile-menu');
  if (!menu) return;

  // Find the nav container inside the menu
  var navContainer = menu.querySelector('.space-y-1');
  if (!navContainer) return;

  // Find the Resources header and its items
  var children = Array.from(navContainer.children);
  var resourcesStart = -1;
  var resourcesElements = [];

  for (var i = 0; i < children.length; i++) {
    var text = children[i].textContent.trim();

    // Find the Resources header
    if (text === 'Resources' && children[i].tagName === 'DIV') {
      resourcesStart = i;
    }

    // Collect Resources header and its buttons until next section header
    if (resourcesStart >= 0 && i >= resourcesStart) {
      if (i > resourcesStart && children[i].tagName === 'DIV' && children[i].classList.contains('pt-4')) {
        // Hit next section header, stop
        break;
      }
      resourcesElements.push(children[i]);
    }
  }

  if (resourcesElements.length === 0) return;
  if (navContainer.dataset.menuFixed) return;
  navContainer.dataset.menuFixed = '1';

  // Move all Resources elements to end
  for (var j = 0; j < resourcesElements.length; j++) {
    navContainer.appendChild(resourcesElements[j]);
  }
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(fixMenuOrder, 200);
}).observe(document.body, { childList: true, subtree: true });

setTimeout(fixMenuOrder, 1000);
setTimeout(fixMenuOrder, 3000);

console.log('Mobile menu order fix loaded');

} catch(e) { console.error('menu-order error:', e); }
})();
