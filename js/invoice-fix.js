// M4 Invoice Update Fix
// Overrides updateInvoiceDetails to also save amount/total
// Additive only
(function(){
try {

window.updateInvoiceDetails = async function(id) {
  var title = (document.getElementById('title') || {}).value || '';
  var issueDate = (document.getElementById('issue_date') || {}).value || '';
  var dueDate = (document.getElementById('due_date') || {}).value || '';
  var notes = (document.getElementById('notes') || {}).value || '';
  var totalEl = document.getElementById('invoice_total');
  var newTotal = totalEl ? parseFloat(totalEl.value) : null;

  var updateData = {
    title: title.trim(),
    issue_date: issueDate,
    due_date: dueDate,
    notes: notes.trim()
  };

  // Include total if the field exists and has a value
  if (newTotal !== null && !isNaN(newTotal)) {
    updateData.total = newTotal;
    updateData.subtotal = newTotal;
    // Recalculate GST if invoice had GST
    var invoice = invoices.find(function(i) { return i.id === id; });
    if (invoice && invoice.include_gst) {
      updateData.subtotal = newTotal / 1.1;
      updateData.gst = newTotal - updateData.subtotal;
    }
    // Update items to reflect new total
    if (invoice && invoice.items && invoice.items.length === 1) {
      var updatedItems = JSON.parse(JSON.stringify(invoice.items));
      updatedItems[0].price = updateData.subtotal / (updatedItems[0].quantity || 1);
      updateData.items = updatedItems;
    }
  }

  try {
    var result = await supabaseClient
      .from('invoices')
      .update(updateData)
      .eq('id', id);

    if (result.error) throw result.error;

    // Update local data
    var invoice = invoices.find(function(i) { return i.id === id; });
    if (invoice) {
      Object.assign(invoice, updateData);
      // Also update selectedInvoiceForDetail if viewing this invoice
      if (typeof selectedInvoiceForDetail !== 'undefined' && selectedInvoiceForDetail && selectedInvoiceForDetail.id === id) {
        Object.assign(selectedInvoiceForDetail, updateData);
      }
    }

    closeModal();
    showNotification('Invoice updated successfully!', 'success');
    renderApp();
  } catch (err) {
    console.error('Error updating invoice:', err);
    showNotification('Error updating invoice: ' + err.message, 'error');
  }
};

console.log('Invoice update fix loaded');

} catch(e) {
  console.error('Invoice update fix error:', e);
}
})();
