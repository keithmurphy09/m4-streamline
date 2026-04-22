// M4 Quote/Invoice Auto-Refresh v3
// Simple page reload after save/update
// Additive only
(function(){
try {

var _origUpdateQuote = window.updateQuote;
window.updateQuote = async function(id) {
  try { await _origUpdateQuote(id); } catch(e) {}
  setTimeout(function() { location.reload(); }, 800);
};

var _origUpdateInvoice = window.updateInvoiceDetails;
if (_origUpdateInvoice) {
  window.updateInvoiceDetails = async function(id) {
    try { await _origUpdateInvoice(id); } catch(e) {}
    setTimeout(function() { location.reload(); }, 800);
  };
}

console.log('Auto-refresh v3 loaded');

} catch(e) {
  console.error('Auto-refresh error:', e);
}
})();
