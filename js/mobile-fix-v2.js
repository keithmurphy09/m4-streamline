// M4 Mobile Fix v2 - Defensive CSS Safety Net
// Additive only. Does NOT modify any existing code.
// Purpose: prevent visual breakage on dashboard reload (red ADMIN stripe, giant icons)
// Kill switch: append ?nomobilev2=1 to URL or run localStorage.setItem('m4_nomobilev2','1')
(function(){
  try {
    // Kill switch check
    var params = '';
    try { params = window.location.search || ''; } catch(e) {}
    var killed = false;
    try {
      if (params.indexOf('nomobilev2=1') !== -1) killed = true;
      if (window.localStorage && localStorage.getItem('m4_nomobilev2') === '1') killed = true;
    } catch(e) {}
    if (killed) {
      try { console.log('mobile-fix-v2 disabled by kill switch'); } catch(e) {}
      return;
    }

    var css = document.createElement('style');
    css.setAttribute('data-m4', 'mobile-fix-v2');
    css.textContent = [
      '@media(max-width:768px){',

      // --- ADMIN badge containment ---
      // Cap the red admin badge so it cannot stretch vertically down the page
      '.bg-red-600{max-height:32px !important;max-width:80px !important;overflow:hidden !important;display:inline-flex !important;align-items:center !important;justify-content:center !important;line-height:1.2 !important;flex-shrink:0 !important}',

      // --- Icon containment ---
      // Cap all SVG icons so they cannot render at natural size
      'svg{max-width:32px !important;max-height:32px !important}',
      // Allow specific larger icons where intentional (hero/header/nav logos excluded)
      'header svg,.tn-footer svg,nav svg{max-width:28px !important;max-height:28px !important}',

      // --- Button icon containment ---
      // Buttons that contain only an icon should not grow huge
      'button > svg:only-child{width:24px !important;height:24px !important}',

      // --- Dashboard card icon containment ---
      // Cards on the dashboard (messages, resources, etc) - cap their icons
      '[class*="card"] svg,[class*="Card"] svg{max-width:32px !important;max-height:32px !important}',

      // --- Header height safety ---
      // Prevent header from growing taller than needed on load
      '.bg-black.border-b-4{max-height:120px !important;overflow:hidden !important}',

      // --- Generic overflow protection for broken-state elements ---
      // Any absolutely positioned element cannot escape viewport height
      '[style*="position: absolute"],[style*="position:absolute"]{max-height:100vh !important}',

      '}'
    ].join('\n');

    // Insert at end of head so it overrides earlier rules
    if (document.head) {
      document.head.appendChild(css);
    } else {
      document.addEventListener('DOMContentLoaded', function(){
        if (document.head) document.head.appendChild(css);
      });
    }

    try { console.log('mobile-fix-v2 loaded'); } catch(e) {}
  } catch(e) {
    try { console.error('mobile-fix-v2 error:', e); } catch(err) {}
  }
})();
