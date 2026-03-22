// M4 Xero Auto-Sync v2
// Overrides CRUD functions to auto-push to Xero
// Additive only
(function(){
try {

var XERO_WORKER = 'https://round-paper-a015.keithmurphy009.workers.dev';

function isXeroConnected() {
  return typeof _xStatus !== 'undefined' && _xStatus && _xStatus.connected;
}

function xeroHeaders() {
  return { 'Content-Type': 'application/json', 'X-User-Id': currentUser.id };
}

// ============ PUSH HELPERS ============

async function pushInvoiceToXero(inv) {
  if (!isXeroConnected() || !currentUser) return;
  if (inv.xero_id) return;
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
      inv.xero_id = result.xero_id;
      await supabaseClient.from('invoices').update({ xero_id: result.xero_id }).eq('id', inv.id);
      console.log('Xero: Invoice ' + (inv.invoice_number || inv.title) + ' synced');
    } else {
      console.warn('Xero: Invoice sync failed -', result.error);
    }
  } catch(e) { console.error('Xero auto-sync invoice error:', e); }
}

async function pushContactToXero(client) {
  if (!isXeroConnected() || !currentUser) return;
  if (client.xero_contact_id) return;
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
  } catch(e) { console.error('Xero auto-sync contact error:', e); }
}

async function pushBillToXero(bill) {
  if (!isXeroConnected() || !currentUser) return;
  try {
    var r = await fetch(XERO_WORKER + '/push/expense', {
      method: 'POST', headers: xeroHeaders(),
      body: JSON.stringify({ expense: {
        date: bill.date, due_date: bill.due_date, amount: bill.amount,
        vendor: bill.vendor_name, bill_number: bill.bill_number,
        description: bill.description, job_title: bill.job_title, file_url: bill.file_url
      }})
    });
    var result = await r.json();
    if (result.success && result.xero_id) {
      await supabaseClient.from('bills').update({ xero_id: result.xero_id }).eq('id', bill.id);
      console.log('Xero: Bill from ' + bill.vendor_name + ' synced');
    } else {
      console.warn('Xero: Bill sync failed -', result.error);
    }
  } catch(e) { console.error('Xero auto-sync bill error:', e); }
}

// ============ OVERRIDE: ADD CLIENT ============
var _origAddClient = window.addClient;
if (typeof _origAddClient === 'function') {
  window.addClient = async function() {
    var countBefore = clients.length;
    await _origAddClient();
    // Find the newly added client
    if (clients.length > countBefore) {
      var newest = clients[clients.length - 1];
      if (newest) pushContactToXero(newest);
    }
  };
}

// ============ OVERRIDE: CONVERT TO INVOICE ============
var _origConvertToInvoice = window.convertToInvoice;
if (typeof _origConvertToInvoice === 'function') {
  window.convertToInvoice = async function(quote) {
    var countBefore = invoices.length;
    await _origConvertToInvoice(quote);
    // Find the newly created invoice
    if (invoices.length > countBefore) {
      var newest = invoices[invoices.length - 1];
      if (newest) pushInvoiceToXero(newest);
    }
  };
}

// ============ OVERRIDE: DELETE INVOICE ============
var _origDeleteInvoice = window.deleteInvoice;
if (typeof _origDeleteInvoice === 'function') {
  window.deleteInvoice = async function(id) {
    var inv = invoices.find(function(i) { return i.id === id; });
    var xeroId = inv ? inv.xero_id : null;
    await _origDeleteInvoice(id);
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

// ============ OVERRIDE: MARK PAID ============
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
          body: JSON.stringify({ xero_id: xeroId, amount: inv.total, paid_date: new Date().toISOString().split('T')[0] })
        });
        console.log('Xero: Invoice marked as paid');
      } catch(e) { console.error('Xero pay error:', e); }
    }
  };
}

// ============ OVERRIDE: MARK UNPAID ============
var _origQuickMarkAsUnpaid = window.quickMarkAsUnpaid;
if (typeof _origQuickMarkAsUnpaid === 'function') {
  window.quickMarkAsUnpaid = async function(id) {
    var inv = invoices.find(function(i) { return i.id === id; });
    var xeroId = inv ? inv.xero_id : null;
    await _origQuickMarkAsUnpaid(id);
    if (xeroId && isXeroConnected()) {
      try {
        await fetch(XERO_WORKER + '/pay/invoice', {
          method: 'POST', headers: xeroHeaders(),
          body: JSON.stringify({ xero_id: xeroId, action: 'unpaid' })
        });
        console.log('Xero: Invoice payment reversed');
      } catch(e) { console.error('Xero unpaid error:', e); }
    }
  };
}

// ============ OVERRIDE: SAVE BILL ============
var _origSaveBill = window.saveBill;
if (typeof _origSaveBill === 'function') {
  window.saveBill = async function() {
    await _origSaveBill();
    if (!isXeroConnected()) return;
    // Find the newest bill from Supabase
    try {
      var oid = (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : currentUser.id;
      var r = await supabaseClient.from('bills').select('*').eq('user_id', oid).order('created_at', { ascending: false }).limit(1);
      var bill = r.data && r.data[0] ? r.data[0] : null;
      if (bill && !bill.xero_id) pushBillToXero(bill);
    } catch(e) { console.error('Xero bill auto-sync error:', e); }
  };
}

// ============ OVERRIDE: DELETE BILL ============
var _origDeleteBill = window.deleteBill;
if (typeof _origDeleteBill === 'function') {
  window.deleteBill = async function(id) {
    var xeroId = null;
    try {
      var r = await supabaseClient.from('bills').select('xero_id').eq('id', id).single();
      if (r.data) xeroId = r.data.xero_id;
    } catch(e) {}
    await _origDeleteBill(id);
    if (xeroId && isXeroConnected()) {
      try {
        await fetch(XERO_WORKER + '/delete/expense', {
          method: 'POST', headers: xeroHeaders(),
          body: JSON.stringify({ xero_id: xeroId })
        });
        console.log('Xero: Bill voided');
      } catch(e) { console.error('Xero void bill error:', e); }
    }
  };
}

// ============ OVERRIDE: DELETE CLIENT ============
var _origDeleteClient = window.deleteClient;
if (typeof _origDeleteClient === 'function') {
  window.deleteClient = async function(id) {
    await _origDeleteClient(id);
    // Xero doesn't allow contact deletion
  };
}

// ============ BULK SYNC OVERRIDES ============

window.xeroSyncInvoices = async function() {
  var btn = document.getElementById('xero-sync-inv');
  if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }
  try {
    var d = invoices.map(function(inv) {
      var cl = clients.find(function(c) { return c.id === inv.client_id; });
      return {
        id: inv.id, xero_id: inv.xero_id || null,
        invoice_number: inv.invoice_number || inv.title, title: inv.title,
        client_name: cl ? cl.name : 'Unknown', issue_date: inv.issue_date,
        due_date: inv.due_date, paid_date: inv.paid_date || null,
        total: inv.total, subtotal: inv.subtotal, gst: inv.gst,
        include_gst: inv.include_gst, status: inv.status,
        items: inv.items || [{ description: inv.title || 'Services', quantity: 1, price: inv.total }]
      };
    });
    var r = await fetch(XERO_WORKER + '/sync/invoices', {
      method: 'POST', headers: xeroHeaders(),
      body: JSON.stringify({ invoices: d })
    });
    var res = await r.json();
    if (res.results) {
      for (var i = 0; i < res.results.length; i++) {
        var result = res.results[i];
        if (result.success && result.xero_id && result.id) {
          var inv = invoices.find(function(x) { return x.id === result.id; });
          if (inv) { inv.xero_id = result.xero_id; await supabaseClient.from('invoices').update({ xero_id: result.xero_id }).eq('id', result.id); }
        }
      }
    }
    var msg = (res.synced || 0) + ' invoices synced';
    if (res.skipped > 0) msg += ', ' + res.skipped + ' already synced';
    if (res.failed > 0) msg += ', ' + res.failed + ' failed';
    showNotification(msg, (res.synced > 0 || res.skipped > 0) ? 'success' : 'error');
    if (res.results) res.results.forEach(function(r) { if (r.error) console.warn('Xero:', r.invoice_number, r.error); });
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

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
    if (res.success && res.contact_ids) {
      for (var name in res.contact_ids) {
        var client = clients.find(function(c) { return c.name === name; });
        if (client) { client.xero_contact_id = res.contact_ids[name]; await supabaseClient.from('clients').update({ xero_contact_id: res.contact_ids[name] }).eq('id', client.id); }
      }
    }
    showNotification((res.synced || 0) + ' contacts synced', res.success ? 'success' : 'error');
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

window.xeroSyncBills = async function() {
  var btn = document.getElementById('xero-sync-exp');
  if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }
  try {
    var oid = (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : currentUser.id;
    var r = await supabaseClient.from('bills').select('*').eq('user_id', oid);
    var allBills = r.data || [];
    if (allBills.length === 0) { showNotification('No bills to sync', 'error'); if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; } return; }
    var toSync = allBills.filter(function(b) { return !b.xero_id; });
    if (toSync.length === 0) { showNotification('All bills already synced', 'success'); if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; } return; }
    var synced = 0; var failed = 0;
    for (var i = 0; i < toSync.length; i++) {
      try {
        var xr = await fetch(XERO_WORKER + '/push/expense', {
          method: 'POST', headers: xeroHeaders(),
          body: JSON.stringify({ expense: { date: toSync[i].date, due_date: toSync[i].due_date, amount: toSync[i].amount, vendor: toSync[i].vendor_name, bill_number: toSync[i].bill_number, description: toSync[i].description, job_title: toSync[i].job_title, file_url: toSync[i].file_url }})
        });
        var xres = await xr.json();
        if (xres.success && xres.xero_id) { await supabaseClient.from('bills').update({ xero_id: xres.xero_id }).eq('id', toSync[i].id); synced++; }
        else { failed++; console.warn('Bill sync failed:', toSync[i].vendor_name, xres.error); }
      } catch(e) { failed++; }
    }
    var skipped = allBills.length - toSync.length;
    var msg = synced + ' bills synced';
    if (skipped > 0) msg += ', ' + skipped + ' already synced';
    if (failed > 0) msg += ', ' + failed + ' failed';
    showNotification(msg, synced > 0 ? 'success' : 'error');
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

window.xeroSyncTimesheets = async function() {
  var btn = document.getElementById('xero-sync-time');
  if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }
  try {
    var oid = (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : currentUser.id;
    var r = await supabaseClient.from('time_entries').select('*').eq('user_id', oid);
    var entries = (r.data || []).map(function(e) { return { team_member_name: e.team_member_name, clock_in: e.clock_in, clock_out: e.clock_out, job_title: e.job_title }; });
    var sr = await fetch(XERO_WORKER + '/sync/timesheets', {
      method: 'POST', headers: xeroHeaders(),
      body: JSON.stringify({ entries: entries })
    });
    var res = await sr.json();
    if (res.success) {
      showNotification(res.total_entries + ' time entries processed for ' + res.total_workers + ' workers', 'success');
      if (res.summary) res.summary.forEach(function(s) { console.log('Payroll: ' + s.name + ' - ' + s.total_hours + ' hours'); });
    } else { showNotification('Error: ' + (res.error || 'Unknown'), 'error'); }
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

console.log('Xero auto-sync v2 loaded');

} catch(e) {
  console.error('Xero auto-sync error:', e);
}
})();
