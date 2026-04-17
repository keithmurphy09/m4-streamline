// M4 Header Compact - mobile
// Additive only. Uses inline styles which override Tailwind.
(function(){
try {
if (window.innerWidth > 768) return;

function compact() {
  if (window.innerWidth > 768) return;

  // Black header
  var header = document.querySelector('.bg-black.border-b-4');
  if (header) {
    header.style.padding = '4px 8px';
  }

  // Hide original logo on mobile
  var logo = header ? header.querySelector('img[src*="final_logo"]') : null;
  if (logo) logo.style.display = 'none';

  // Hide original title
  var titles = header ? header.querySelectorAll('.text-center') : [];
  titles.forEach(function(t) { t.style.display = 'none'; });

  // Hide logged in email
  if (header) {
    header.querySelectorAll('.text-xs.text-teal-400').forEach(function(el) {
      if (el.textContent.indexOf('Logged') !== -1) el.parentElement.style.display = 'none';
    });
  }

  // Cobrand row
  var cbRow = document.querySelector('.cb-row');
  if (cbRow) {
    cbRow.style.flexWrap = 'nowrap';
    cbRow.style.padding = '4px 0';
    cbRow.style.gap = '8px';
    cbRow.style.justifyContent = 'flex-start';
  }

  var cbLogo = document.querySelector('.cb-logo');
  if (cbLogo) {
    cbLogo.style.height = '30px';
    cbLogo.style.marginRight = '0';
  }

  var cbTxt = document.querySelector('.cb-txt');
  if (cbTxt) cbTxt.style.height = '12px';

  var cbP = document.querySelector('.cb-p');
  if (cbP) {
    cbP.style.fontSize = '7px';
    cbP.style.marginTop = '0';
  }

  // Buttons in header smaller
  if (header) {
    header.querySelectorAll('button').forEach(function(b) {
      b.style.padding = '3px 6px';
      b.style.fontSize = '11px';
      b.style.minHeight = '28px';
    });
  }

  // ADMIN badge
  var admin = header ? header.querySelector('span.bg-red-600') : null;
  if (admin) {
    admin.style.fontSize = '9px';
    admin.style.padding = '2px 5px';
  }

  // Nav bar - the div with border-teal-400 containing h-16
  var navContainer = document.querySelector('.border-b.border-teal-400');
  if (navContainer) {
    // Find the h-16 flex container inside
    var h16 = navContainer.querySelector('.h-16');
    if (h16) h16.style.height = '36px';

    // M4 text
    var m4text = navContainer.querySelector('.text-2xl');
    if (m4text) m4text.style.fontSize = '16px';

    // Reduce padding
    var inner = navContainer.querySelector('.px-4');
    if (inner) {
      inner.style.paddingLeft = '8px';
      inner.style.paddingRight = '8px';
    }
  }
}

// Run after DOM settles
var _timer = null;
new MutationObserver(function() {
  if (_timer) clearTimeout(_timer);
  _timer = setTimeout(compact, 200);
}).observe(document.body, { childList: true, subtree: true });

// Also run on load
setTimeout(compact, 1000);
setTimeout(compact, 3000);

} catch(e) { console.error('header-compact error:', e); }
})();
