// M4 Settings Button Mobile Fix
// Makes the cloned settings gear button work
// Additive only
(function(){
try {

function fixSettings() {
  if (window.innerWidth > 768) return;

  // Find the cloned controls inside cb-row
  var cbRow = document.querySelector('.cb-row');
  if (!cbRow) return;

  // Find all settings buttons (gear icon buttons with onclick containing toggleSettingsMenu)
  var buttons = cbRow.querySelectorAll('button');
  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    var onclick = btn.getAttribute('onclick') || '';
    if (onclick.indexOf('toggleSettingsMenu') === -1) continue;
    if (btn.dataset.settingsFixed) continue;
    btn.dataset.settingsFixed = '1';

    // Replace the onclick to find and toggle the ORIGINAL settings menu
    btn.removeAttribute('onclick');
    btn.addEventListener('click', function(e) {
      e.stopPropagation();

      // Find the original settings menu (not the clone's copy)
      var menus = document.querySelectorAll('[id^="settings-menu"]');
      var menu = null;
      for (var m = 0; m < menus.length; m++) {
        // Use the one that has actual menu items inside
        if (menus[m].querySelector('button') || menus[m].querySelector('a')) {
          menu = menus[m];
          break;
        }
      }

      if (!menu) {
        // Try finding by ID directly
        menu = document.getElementById('settings-menu');
      }

      if (menu) {
        // Toggle visibility
        if (menu.style.display === 'block' || !menu.classList.contains('hidden')) {
          menu.style.display = 'none';
          menu.classList.add('hidden');
        } else {
          menu.style.display = 'block';
          menu.classList.remove('hidden');
          // Position it below the button
          var rect = btn.getBoundingClientRect();
          menu.style.position = 'fixed';
          menu.style.top = (rect.bottom + 4) + 'px';
          menu.style.right = '8px';
          menu.style.left = 'auto';
          menu.style.zIndex = '9999';
        }
      }
    });
  }
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(fixSettings, 200);
}).observe(document.body, { childList: true, subtree: true });

setTimeout(fixSettings, 1000);
setTimeout(fixSettings, 2000);
setTimeout(fixSettings, 4000);

// Close settings menu when tapping elsewhere
document.addEventListener('click', function(e) {
  if (window.innerWidth > 768) return;
  if (e.target.closest('[data-settings-fixed]')) return;
  var menus = document.querySelectorAll('[id^="settings-menu"]');
  for (var i = 0; i < menus.length; i++) {
    menus[i].style.display = 'none';
    menus[i].classList.add('hidden');
  }
});

console.log('Settings mobile fix loaded');

} catch(e) { console.error('settings-mobile error:', e); }
})();
