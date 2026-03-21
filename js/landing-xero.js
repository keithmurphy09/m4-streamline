// M4 Landing Page - Xero Integration Section
// Injects between AI and Pricing sections
// Additive only
(function(){
try {

function injectXeroSection() {
  var pricing = document.getElementById('lp2-pricing');
  if (!pricing) return;
  if (pricing.dataset.xeroAdded) return;
  pricing.dataset.xeroAdded = 'true';

  var section = document.createElement('section');
  section.style.cssText = 'background:linear-gradient(135deg,#0a2540 0%,#13B5EA 100%);padding:100px 40px;color:#fff;position:relative;overflow:hidden;';
  section.id = 'lp2-xero';

  section.innerHTML =
    '<div style="position:absolute;top:-30%;left:-10%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.08),transparent 70%);"></div>' +
    '<div id="lp2-xero-grid">' +

      '<div style="position:relative;z-index:1;">' +
        '<div style="display:inline-block;padding:6px 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#fff;background:rgba(255,255,255,0.15);border-radius:20px;border:1px solid rgba(255,255,255,0.2);margin-bottom:16px;">Xero Integration</div>' +
        '<h2 style="font-family:Outfit,sans-serif;font-size:42px;font-weight:800;line-height:1.15;margin:0 0 16px;">Your books, <span style="color:#2dd4bf;">always in sync.</span></h2>' +
        '<p style="font-size:18px;color:rgba(255,255,255,0.7);line-height:1.6;margin:0 0 32px;">Connect Xero in one click. Invoices, bills, contacts, and payments sync automatically. No manual data entry, no double-handling, no missed transactions.</p>' +

        '<div id="lp2-xero-features">' +
          '<div style="padding:16px;background:rgba(255,255,255,0.08);border-radius:12px;border:1px solid rgba(255,255,255,0.1);">' +
            '<div style="font-size:24px;font-weight:800;color:#2dd4bf;margin-bottom:4px;">Auto-Sync</div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.6);">Invoices push to Xero the moment you create them</div>' +
          '</div>' +
          '<div style="padding:16px;background:rgba(255,255,255,0.08);border-radius:12px;border:1px solid rgba(255,255,255,0.1);">' +
            '<div style="font-size:24px;font-weight:800;color:#2dd4bf;">Paid Status</div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.6);">Mark as paid in M4 and Xero updates instantly</div>' +
          '</div>' +
          '<div style="padding:16px;background:rgba(255,255,255,0.08);border-radius:12px;border:1px solid rgba(255,255,255,0.1);">' +
            '<div style="font-size:24px;font-weight:800;color:#2dd4bf;">Bills</div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.6);">Supplier invoices with attachments sync to Xero AP</div>' +
          '</div>' +
          '<div style="padding:16px;background:rgba(255,255,255,0.08);border-radius:12px;border:1px solid rgba(255,255,255,0.1);">' +
            '<div style="font-size:24px;font-weight:800;color:#2dd4bf;">Contacts</div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.6);">Clients sync as Customers with full details</div>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
          '<a href="#lp2-pricing" style="padding:14px 32px;background:#2dd4bf;color:#0a2540;font-size:15px;font-weight:700;border-radius:10px;text-decoration:none;transition:all 0.2s;display:inline-block;" onmouseenter="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 6px 20px rgba(0,0,0,0.2)\'" onmouseleave="this.style.transform=\'\';this.style.boxShadow=\'\'">Start Free Trial</a>' +
          '<a href="#lp2-features" style="padding:14px 32px;background:rgba(255,255,255,0.1);color:#fff;font-size:15px;font-weight:600;border-radius:10px;text-decoration:none;border:1px solid rgba(255,255,255,0.3);display:inline-block;" onmouseenter="this.style.background=\'rgba(255,255,255,0.2)\'" onmouseleave="this.style.background=\'rgba(255,255,255,0.1)\'">See All Features</a>' +
        '</div>' +
      '</div>' +

      '<div id="lp2-xero-mockup" style="position:relative;z-index:1;">' +
        '<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;backdrop-filter:blur(10px);">' +

          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">' +
            '<div style="width:48px;height:48px;border-radius:12px;background:#13B5EA;display:flex;align-items:center;justify-content:center;"><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 14.59L6 12l1.41-1.41L11 14.17l6.59-6.59L19 9l-8.41 8.59z"/></svg></div>' +
            '<div><div style="font-size:18px;font-weight:700;">Xero Connected</div><div style="font-size:12px;color:rgba(255,255,255,0.5);">Murphy\'s Plumbing Pty Ltd</div></div>' +
            '<div style="margin-left:auto;width:10px;height:10px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981;"></div>' +
          '</div>' +

          '<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">' +
              '<div><div style="font-size:14px;font-weight:600;">Invoices</div><div style="font-size:11px;color:rgba(255,255,255,0.4);">12 synced today</div></div>' +
              '<div style="padding:4px 12px;background:rgba(16,185,129,0.15);color:#10b981;font-size:11px;font-weight:700;border-radius:20px;">Synced</div>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">' +
              '<div><div style="font-size:14px;font-weight:600;">Bills</div><div style="font-size:11px;color:rgba(255,255,255,0.4);">3 with attachments</div></div>' +
              '<div style="padding:4px 12px;background:rgba(16,185,129,0.15);color:#10b981;font-size:11px;font-weight:700;border-radius:20px;">Synced</div>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">' +
              '<div><div style="font-size:14px;font-weight:600;">Contacts</div><div style="font-size:11px;color:rgba(255,255,255,0.4);">48 customers</div></div>' +
              '<div style="padding:4px 12px;background:rgba(16,185,129,0.15);color:#10b981;font-size:11px;font-weight:700;border-radius:20px;">Synced</div>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;">' +
              '<div><div style="font-size:14px;font-weight:600;">Payroll Hours</div><div style="font-size:11px;color:rgba(255,255,255,0.4);">6 workers this week</div></div>' +
              '<div style="padding:4px 12px;background:rgba(16,185,129,0.15);color:#10b981;font-size:11px;font-weight:700;border-radius:20px;">Synced</div>' +
            '</div>' +
          '</div>' +

        '</div>' +
      '</div>' +

    '</div>' +

    '<style>' +
    '#lp2-xero-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;max-width:1100px;margin:0 auto;}' +
    '#lp2-xero-features{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px;}' +
    '@media(max-width:768px){' +
      '#lp2-xero-grid{grid-template-columns:1fr !important;gap:32px !important;}' +
      '#lp2-xero-features{grid-template-columns:1fr !important;}' +
      '#lp2-xero h2{font-size:28px !important;}' +
      '#lp2-xero{padding:60px 20px !important;}' +
      '#lp2-xero-mockup{margin-top:8px;}' +
    '}' +
    '</style>';

  pricing.parentElement.insertBefore(section, pricing);
}

// Also add Xero to the nav
function addXeroNav() {
  var nav = document.querySelector('.lp2-nav');
  if (!nav) return;
  if (nav.dataset.xeroNav) return;
  nav.dataset.xeroNav = 'true';

  var pricingLink = nav.querySelector('a[href="#lp2-pricing"]');
  if (pricingLink) {
    var xeroLink = document.createElement('a');
    xeroLink.href = '#lp2-xero';
    xeroLink.textContent = 'Xero';
    xeroLink.style.cssText = pricingLink.style.cssText || '';
    pricingLink.parentElement.insertBefore(xeroLink, pricingLink);
  }
}

var _lpxTimer = null;
var _lpxObs = new MutationObserver(function() {
  if (_lpxTimer) clearTimeout(_lpxTimer);
  _lpxTimer = setTimeout(function() {
    injectXeroSection();
    addXeroNav();
  }, 300);
});
_lpxObs.observe(document.body, { childList: true, subtree: true });

console.log('Landing page Xero section loaded');

} catch(e) {
  console.error('Landing Xero error:', e);
}
})();
