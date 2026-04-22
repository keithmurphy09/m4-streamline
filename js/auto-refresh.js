// M4 Quote/Invoice Auto-Refresh v2
// Reloads data after update so changes show immediately
// Additive only
(function(){
try {

function refreshAfterSave() {
  setTimeout(async function() {
    try {
      if (typeof loadData === 'function') await loadData();
    } catch(e) {}
    try {
      if (typeof renderApp === 'function') renderApp();
    } catch(e) {}
    try {
      // Also try switching to the current tab to force re-render
      if (typeof switchTab === 'function') {
        var active = document.querySelector('nav button.text-teal-500, nav button[class*="teal"]');
        if (active) active.click();
      }
    } catch(e) {}
  }, 1000);
}

var _origUpdateQuote = window.updateQuote;
window.updateQuote = async function(id) {
  try { await _origUpdateQuote(id); } catch(e) {}
  refreshAfterSave();
};

var _origSaveQuote = window.saveQuote;
window.saveQuote = async function() {
  try { await _origSaveQuote(); } catch(e) {}
  refreshAfterSave();
};

var _origUpdateInvoice = window.updateInvoiceDetails;
if (_origUpdateInvoice) {
  window.updateInvoiceDetails = async function(id) {
    try { await _origUpdateInvoice(id); } catch(e) {}
    refreshAfterSave();
  };
}

var _origSaveInvoice = window.saveInvoice;
if (_origSaveInvoice) {
  window.saveInvoice = async function() {
    try { await _origSaveInvoice(); } catch(e) {}
    refreshAfterSave();
  };
}

console.log('Quote/Invoice auto-refresh v2 loaded');

} catch(e) {
  console.error('Auto-refresh error:', e);
}
})();
