// M4 Quote/Invoice Auto-Refresh
// Reloads data after update so changes show immediately
// Additive only
(function(){
try {

var _origUpdateQuote = window.updateQuote;
window.updateQuote = async function(id) {
  await _origUpdateQuote(id);
  // Refresh data
  if (typeof loadData === 'function') await loadData();
  if (typeof renderApp === 'function') renderApp();
};

var _origSaveQuote = window.saveQuote;
window.saveQuote = async function() {
  await _origSaveQuote();
  if (typeof loadData === 'function') await loadData();
  if (typeof renderApp === 'function') renderApp();
};

var _origUpdateInvoice = window.updateInvoiceDetails;
if (_origUpdateInvoice) {
  window.updateInvoiceDetails = async function(id) {
    await _origUpdateInvoice(id);
    if (typeof loadData === 'function') await loadData();
    if (typeof renderApp === 'function') renderApp();
  };
}

var _origSaveInvoice = window.saveInvoice;
if (_origSaveInvoice) {
  window.saveInvoice = async function() {
    await _origSaveInvoice();
    if (typeof loadData === 'function') await loadData();
    if (typeof renderApp === 'function') renderApp();
  };
}

console.log('Quote/Invoice auto-refresh loaded');

} catch(e) {
  console.error('Auto-refresh error:', e);
}
})();
