// M4 Xero Auto-Sync
// Hooks into invoice/expense/client CRUD to auto-push to Xero
// Additive only
(function(){
try {

var XERO_WORKER = 'https://round-paper-a015.keithmurphy009.workers.dev';

// ============ CHECK IF XERO IS CONNECTED ============
function isXeroConnected() {
  // Check cached status from xero-integration.js
  return typeof _xStatus !== 'undefined' && _xStatus && _xStatus.connected;
}

function xeroHeaders() {
  return { 'Content-Type': 'application/json', 'X-User-Id': currentUser.id };
}

// ============ AUTO-SYNC INVOICE ON CREATE ============
var _origAddInvoice = window.addInvoice;
if (typeof _origAddInvoice === 'function') {
  // addInvoice isn't on window - it's local to crud.js
  // We'll use a different approach: watch for new invoices after save
}

// Watch for invoice changes via MutationObserver + polling
var _lastInvoiceCount = 0;
var _lastExpenseCount = 0;
var _lastClientCount = 0;

function checkForNewItems() {
  if (!isXeroConnected() || !currentUser) return;

  // Check for new invoices
  if (invoices.length > _lastInvoiceCount && _lastInvoiceCount > 0) {
    var newInvoices = invoices.filter(function(inv) { return !inv.xero_id; });
    // Find the newest one (just added)
    var newest = newInvoices[newInvoices.length - 1];
    if (newest && !newest._xero_pushing) {
      newest._xero_pushing = true;
      pushInvoiceToXero(newest);
    }
  }
  _lastInvoiceCount = invoices.length;

  // Check for new expenses
  if (expenses.length > _lastExpenseCount && _lastExpenseCount > 0) {
    var newExpenses = expenses.filter(function(exp) { return !exp.xero_id; });
    var newestExp = newExpenses[newExpenses.length - 1];
    if (newestExp && !newestExp._xero_pushing) {
      newestExp._xero_pushing = true;
      pushExpenseToXero(newestExp);
    }
  }
  _lastExpenseCount = expenses.length;

  // Check for new clients
  if (clients.length > _lastClientCount && _lastClientCount > 0) {
    var newClients = clients.filter(function(c) { return !c.xero_contact_id; });
    var newestClient = newClients[newClients.length - 1];
    if (newestClient && !newestClient._xero_pushing) {
      newestClient._xero_pushing = true;
      pushContactToXero(newestClient);
    }
  }
  _lastClientCount = clients.length;
}

// ============ PUSH FUNCTIONS ============
async function pushInvoiceToXero(inv) {
  try {
    var cl = clients.find(function(c) { return c.id === inv.client_id; });
    var data = {
      invoice_number: inv.invoice_number || inv.title,
      title: inv.title,
      client_name: cl ? cl.name : 'Unknown',
      issue_date: inv.issue_date,
      due_date: inv.due_date,
      paid_date: inv.paid_date || null,
      total: inv.total,
      subtotal: inv.subtotal,
      gst: inv.gst,
      include_gst: inv.include_gst,
      status: inv.status,
      items: inv.items || [{ description: inv.title || 'Services', quantity: 1, price: inv.total }]
    };

    var r = await fetch(XERO_WORKER + '/push/invoice', {
      method: 'POST', headers: xeroHeaders(),
      body: JSON.stringify({ invoice: data })
    });
    var result = await r.json();

    if (result.success && result.xero_id) {
      // Save xero_id back to Supabase
      inv.xero_id = result.xero_id;
      await supabaseClient.from('invoices').update({ xero_id: result.xero_id }).eq('id', inv.id);
      console.log('Xero: Invoice ' + (inv.invoice_number || inv.title) + ' synced');
    } else {
      console.warn('Xero: Invoice sync failed -', result.error);
    }
  } catch(e) {
    console.error('Xero auto-sync invoice error:', e);
  }
}

async function pushExpenseToXero(exp) {
  try {
    var data = {
      date: exp.date,
      amount: exp.amount,
      category: exp.category,
      description: exp.description,
      vendor: exp.vendor || exp.team_member_name || exp.category,
      team_member: exp.team_member_name,
      job_title: exp.job_title
    };

    var r = await fetch(XERO_WORKER + '/push/expense', {
      method: 'POST', headers: xeroHeaders(),
      body: JSON.stringify({ expense: data })
    });
    var result = await r.json();

    if (result.success && result.xero_id) {
      exp.xero_id = result.xero_id;
      await supabaseClient.from('expenses').update({ xero_id: result.xero_id }).eq('id', exp.id);
      console.log('Xero: Expense synced');
    } else {
      console.warn('Xero: Expense sync failed -', result.error);
    }
  } catch(e) {
    console.error('Xero auto-sync expense error:', e);
  }
}

async function pushContactToXero(client) {
  try {
    var r = await fetch(XERO_WORKER + '/push/contact', {
      method: 'POST', headers: xeroHeaders(),
      body: JSON.stringify({ contact: { name: client.name, email: client.email, phone: client.phone, address: client.address } })
    });
    var result = await r.json();

    if (result.success && result.xero_contact_id) {
      client.xero_contact_id = result.xero_contact_id;
      await supabaseClient.from('clients').update({ xero_contact_id: result.xero_contact_id }).eq('id', client.id);
      console.log('Xero: Contact ' + client.name + ' synced');
    } else {
      console.warn('Xero: Contact sync failed -', result.error);
    }
  } catch(e) {
    console.error('Xero auto-sync contact error:', e);
  }
}

// ============ OVERRIDE DELETE FUNCTIONS ============
var _origDeleteInvoice = window.deleteInvoice;
if (typeof _origDeleteInvoice === 'function') {
  window.deleteInvoice = async function(id) {
    // Find invoice before deleting
    var inv = invoices.find(function(i) { return i.id === id; });
    var xeroId = inv ? inv.xero_id : null;

    // Call original delete
    await _origDeleteInvoice(id);

    // Void in Xero if synced
    if (xeroId && isXeroConnected()) {
      try {
        await fetch(XERO_WORKER + '/delete/invoice', {
          method: 'POST', headers: xeroHeaders(),
          body: JSON.stringify({ xero_id: xeroId })
        });
        console.log('Xero: Invoice voided');
      } catch(e) { console.error('Xero void error:', e); }
    }
  };
}

var _origDeleteExpense = window.deleteExpense;
if (typeof _origDeleteExpense === 'function') {
  window.deleteExpense = async function(id) {
    var exp = expenses.find(function(e) { return e.id === id; });
    var xeroId = exp ? exp.xero_id : null;

    await _origDeleteExpense(id);

    if (xeroId && isXeroConnected()) {
      try {
        await fetch(XERO_WORKER + '/delete/expense', {
          method: 'POST', headers: xeroHeaders(),
          body: JSON.stringify({ xero_id: xeroId })
        });
        console.log('Xero: Expense voided');
      } catch(e) { console.error('Xero void error:', e); }
    }
  };
}

var _origDeleteClient = window.deleteClient;
if (typeof _origDeleteClient === 'function') {
  window.deleteClient = async function(id) {
    // Can't delete contacts in Xero, just let the M4 delete happen
    await _origDeleteClient(id);
  };
}

// ============ OVERRIDE MARK AS PAID ============
var _origQuickMarkAsPaid = window.quickMarkAsPaid;
if (typeof _origQuickMarkAsPaid === 'function') {
  window.quickMarkAsPaid = async function(id) {
    var inv = invoices.find(function(i) { return i.id === id; });
    var xeroId = inv ? inv.xero_id : null;

    await _origQuickMarkAsPaid(id);

    if (xeroId && isXeroConnected()) {
      try {
        await fetch(XERO_WORKER + '/pay/invoice', {
          method: 'POST', headers: xeroHeaders(),
          body: JSON.stringify({
            xero_id: xeroId,
            amount: inv.total,
            paid_date: new Date().toISOString().split('T')[0]
          })
        });
        console.log('Xero: Invoice marked as paid');
      } catch(e) { console.error('Xero pay error:', e); }
    }
  };
}

// ============ UPDATE BULK SYNC TO STORE XERO IDS ============
var _origXeroSyncInvoices = window.xeroSyncInvoices;
window.xeroSyncInvoices = async function() {
  var btn = document.getElementById('xero-sync-inv');
  if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }

  try {
    var d = invoices.map(function(inv) {
      var cl = clients.find(function(c) { return c.id === inv.client_id; });
      return {
        id: inv.id,
        xero_id: inv.xero_id || null,
        invoice_number: inv.invoice_number || inv.title,
        title: inv.title,
        client_name: cl ? cl.name : 'Unknown',
        issue_date: inv.issue_date,
        due_date: inv.due_date,
        paid_date: inv.paid_date || null,
        total: inv.total,
        subtotal: inv.subtotal,
        gst: inv.gst,
        include_gst: inv.include_gst,
        status: inv.status,
        items: inv.items || [{ description: inv.title || 'Services', quantity: 1, price: inv.total }]
      };
    });

    var r = await fetch(XERO_WORKER + '/sync/invoices', {
      method: 'POST', headers: xeroHeaders(),
      body: JSON.stringify({ invoices: d })
    });
    var res = await r.json();

    // Save xero_ids back to Supabase
    if (res.results) {
      for (var i = 0; i < res.results.length; i++) {
        var result = res.results[i];
        if (result.success && result.xero_id && result.id) {
          var inv = invoices.find(function(x) { return x.id === result.id; });
          if (inv) {
            inv.xero_id = result.xero_id;
            await supabaseClient.from('invoices').update({ xero_id: result.xero_id }).eq('id', result.id);
          }
        }
      }
    }

    var synced = res.synced || 0;
    var skipped = res.skipped || 0;
    var failed = res.failed || 0;
    var msg = synced + ' invoices synced';
    if (skipped > 0) msg += ', ' + skipped + ' already synced';
    if (failed > 0) msg += ', ' + failed + ' failed';
    showNotification(msg, synced > 0 || skipped > 0 ? 'success' : 'error');
    if (res.results) res.results.forEach(function(r) { if (r.error) console.warn('Xero:', r.invoice_number, r.error); });
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }

  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

// Update contacts sync to store IDs
var _origXeroSyncContacts = window.xeroSyncContacts;
window.xeroSyncContacts = async function() {
  var btn = document.getElementById('xero-sync-con');
  if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }

  try {
    var d = clients.map(function(c) { return { name: c.name, email: c.email, phone: c.phone, address: c.address }; });
    var r = await fetch(XERO_WORKER + '/sync/contacts', {
      method: 'POST', headers: xeroHeaders(),
      body: JSON.stringify({ contacts: d })
    });
    var res = await r.json();

    // Save contact IDs
    if (res.success && res.contact_ids) {
      for (var name in res.contact_ids) {
        var client = clients.find(function(c) { return c.name === name; });
        if (client) {
          client.xero_contact_id = res.contact_ids[name];
          await supabaseClient.from('clients').update({ xero_contact_id: res.contact_ids[name] }).eq('id', client.id);
        }
      }
    }

    showNotification((res.synced || 0) + ' contacts synced to Xero', res.success ? 'success' : 'error');
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }

  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

// ============ POLLING FOR NEW ITEMS ============
setInterval(function() {
  if (typeof currentUser !== 'undefined' && currentUser) {
    checkForNewItems();
  }
}, 2000);

// Initialize counts
setTimeout(function() {
  _lastInvoiceCount = invoices.length;
  _lastExpenseCount = expenses.length;
  _lastClientCount = clients.length;
}, 3000);

console.log('Xero auto-sync loaded');

} catch(e) {
  console.error('Xero auto-sync error:', e);
}
})();
