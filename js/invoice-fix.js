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

// ============ OVERRIDE saveInvoice to generate invoice_number ============
var _origSaveInvoice = window.saveInvoice;
if (typeof _origSaveInvoice === 'function') {
  // saveInvoice is not on window, it's a local function in modals.js
  // We need a different approach
}

// Override via direct declaration since modals.js uses plain function declaration
window.saveInvoice = async function() {
  var clientIdEl = document.getElementById('client_id');
  var titleEl = document.getElementById('title');
  var totalEl = document.getElementById('invoice_total');
  var issueDateEl = document.getElementById('issue_date');
  var dueDateEl = document.getElementById('due_date');
  var notesEl = document.getElementById('notes');
  var progressiveEl = document.getElementById('is_progressive');
  var scheduleEl = document.getElementById('recurring_schedule');
  var countEl = document.getElementById('recurring_count');

  var clientId = clientIdEl ? clientIdEl.value : '';
  var title = titleEl ? titleEl.value : '';
  var total = totalEl ? parseFloat(totalEl.value) : 0;
  var issueDate = issueDateEl ? issueDateEl.value : '';
  var dueDate = dueDateEl ? dueDateEl.value : '';
  var notes = notesEl ? notesEl.value : '';
  var isProgressive = progressiveEl ? progressiveEl.checked : false;
  var recurringSchedule = scheduleEl ? scheduleEl.value : null;
  var recurringCount = countEl ? parseInt(countEl.value) : null;

  if (!clientId || !title || !total) {
    alert('Please select a client, enter a title and amount');
    return;
  }

  try {
    isLoading = true;
    loadingMessage = 'Creating invoice...';
    renderApp();

    // Generate invoice number: INV-XXXXX
    var maxNum = 0;
    invoices.forEach(function(inv) {
      if (inv.invoice_number) {
        var match = inv.invoice_number.match(/INV-(\d+)/);
        if (match) {
          var n = parseInt(match[1]);
          if (n > maxNum) maxNum = n;
        }
      }
    });
    var invoiceNumber = 'INV-' + String(maxNum + 1).padStart(5, '0');

    var invoiceData = {
      user_id: currentUser.id,
      client_id: clientId,
      title: title,
      total: total,
      invoice_number: invoiceNumber,
      items: [{ description: title, quantity: 1, price: total }],
      notes: notes || null,
      status: 'unpaid',
      is_recurring_parent: isProgressive,
      recurring_schedule: isProgressive ? recurringSchedule : null,
      recurring_count: isProgressive ? recurringCount : null,
      recurring_start_date: isProgressive && issueDate ? new Date(issueDate).toISOString() : null
    };

    if (issueDate) invoiceData.issue_date = issueDate;
    if (dueDate) invoiceData.due_date = dueDate;

    var result = await supabaseClient.from('invoices').insert([invoiceData]).select();
    if (result.error) throw result.error;

    invoices.push(result.data[0]);
    closeModal();
    if (typeof openedFromDashboard !== 'undefined' && openedFromDashboard) {
      switchTab('invoices');
    }
    showNotification(isProgressive ? 'Progressive invoice created!' : 'Invoice ' + invoiceNumber + ' created!', 'success');

    // Auto-push to Xero if connected
    if (typeof window._xStatus !== 'undefined' && window._xStatus && window._xStatus.connected && result.data[0]) {
      try {
        var newInv = result.data[0];
        var cl = clients.find(function(c) { return c.id === newInv.client_id; });
        var xr = await fetch('https://round-paper-a015.keithmurphy009.workers.dev/push/invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Id': currentUser.id },
          body: JSON.stringify({ invoice: {
            invoice_number: newInv.invoice_number, title: newInv.title,
            client_name: cl ? cl.name : 'Unknown', issue_date: newInv.issue_date,
            due_date: newInv.due_date, total: newInv.total, status: newInv.status,
            include_gst: newInv.include_gst,
            items: newInv.items || [{ description: newInv.title, quantity: 1, price: newInv.total }]
          }})
        });
        var xres = await xr.json();
        if (xres.success && xres.xero_id) {
          newInv.xero_id = xres.xero_id;
          await supabaseClient.from('invoices').update({ xero_id: xres.xero_id }).eq('id', newInv.id);
          console.log('Xero: Invoice ' + invoiceNumber + ' synced');
        }
      } catch(xe) { console.warn('Xero auto-sync failed:', xe); }
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    showNotification('Failed to create invoice: ' + error.message, 'error');
  } finally {
    isLoading = false;
    renderApp();
  }
};

} catch(e) {
  console.error('Invoice update fix error:', e);
}
})();
