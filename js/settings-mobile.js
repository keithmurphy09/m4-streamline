// M4 Settings Button Mobile Fix
// Additive only
(function(){
try {

function fixSettings() {
  if (window.innerWidth > 768) return;

  var cbRow = document.querySelector('.cb-row');
  if (!cbRow) return;

  var buttons = cbRow.querySelectorAll('button');
  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    var onclick = btn.getAttribute('onclick') || '';
    if (onclick.indexOf('toggleSettingsMenu') === -1) continue;
    if (btn.dataset.settingsFixed) continue;
    btn.dataset.settingsFixed = '1';

    btn.removeAttribute('onclick');
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();

      var menus = document.querySelectorAll('[id^="settings-menu"]');
      var menu = null;
      for (var m = 0; m < menus.length; m++) {
        if (menus[m].querySelector('button') || menus[m].querySelector('a')) {
          menu = menus[m];
          break;
        }
      }
      if (!menu) menu = document.getElementById('settings-menu');
      if (!menu) return;

      var isVisible = menu.style.display === 'block';

      if (isVisible) {
        menu.style.display = 'none';
      } else {
        menu.style.display = 'block';
        menu.classList.remove('hidden');
        menu.style.position = 'fixed';
        menu.style.top = '60px';
        menu.style.right = '8px';
        menu.style.left = 'auto';
        menu.style.zIndex = '9999';
        menu.style.maxHeight = '80vh';
        menu.style.overflowY = 'auto';
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

document.addEventListener('click', function(e) {
  if (window.innerWidth > 768) return;
  if (e.target.closest('[data-settings-fixed]')) return;
  var menus = document.querySelectorAll('[id^="settings-menu"]');
  for (var i = 0; i < menus.length; i++) {
    menus[i].style.display = 'none';
  }
});

console.log('Settings mobile fix loaded');

} catch(e) { console.error('settings-mobile error:', e); }
})();
