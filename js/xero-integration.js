// M4 Xero Integration UI v2 - Simplified
// Additive only
(function(){
try {

var XERO_WORKER = 'https://round-paper-a015.keithmurphy009.workers.dev';

var css = document.createElement('style');
css.textContent = [
'.xero-box{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-top:12px;margin-bottom:24px}',
'.dark .xero-box{background:#1f2937;border-color:#374151}',
'.xero-connect-btn{padding:12px 24px;font-size:14px;font-weight:700;color:#fff;background:#13B5EA;border:none;border-radius:12px;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:8px;box-shadow:0 0 0 0 rgba(19,181,234,0.7);animation:xeroPulse 2s infinite;transition:all 0.15s}',
'.xero-connect-btn:hover{background:#0e9fd0;animation:none;box-shadow:0 4px 16px rgba(19,181,234,0.4)}',
'@keyframes xeroPulse{0%{box-shadow:0 0 0 0 rgba(19,181,234,0.7)}70%{box-shadow:0 0 0 12px rgba(19,181,234,0)}100%{box-shadow:0 0 0 0 rgba(19,181,234,0)}}',
'.xero-status-bar{display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0;margin-bottom:16px}',
'.dark .xero-status-bar{background:rgba(22,163,74,0.1);border-color:rgba(22,163,74,0.3)}',
'.xero-dot{width:10px;height:10px;border-radius:50%;background:#10b981;animation:tc-pulse 2s infinite}',
'.xero-sync-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f3f4f6}',
'.dark .xero-sync-row{border-bottom-color:#374151}',
'.xero-sync-row:last-child{border-bottom:none}',
'.xero-sync-btn{padding:8px 16px;font-size:12px;font-weight:600;color:#fff;background:#13B5EA;border:none;border-radius:6px;cursor:pointer;font-family:inherit}',
'.xero-sync-btn:hover{background:#0e9fd0}',
'.xero-sync-btn:disabled{opacity:0.5;cursor:not-allowed}',
'.xero-disconnect{padding:8px 16px;font-size:12px;font-weight:600;color:#ef4444;background:#fff;border:1px solid #fecaca;border-radius:8px;cursor:pointer;font-family:inherit}',
'.dark .xero-disconnect{background:#374151;border-color:#991b1b}',
'.xero-disconnect:hover{background:#fef2f2}'
].join('\n');
document.head.appendChild(css);

function escH(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }

var _xStatus = null;
var _xChecked = false;

async function checkStatus() {
  if (!currentUser) return;
  try {
    var r = await fetch(XERO_WORKER + '/status?user_id=' + currentUser.id);
    _xStatus = await r.json();
  } catch(e) { _xStatus = { connected: false }; }
  _xChecked = true;
}

window.connectXero = async function() {
  if (!currentUser) return;
  localStorage.setItem('m4_xero_user_id', currentUser.id);
  try {
    var r = await fetch(XERO_WORKER + '/auth');
    var data = await r.json();
    if (data.auth_url) window.open(data.auth_url, '_blank');
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
};

window.disconnectXero = async function() {
  if (!confirm('Disconnect Xero?')) return;
  try {
    await fetch(XERO_WORKER + '/disconnect?user_id=' + currentUser.id, { method: 'POST' });
    _xStatus = { connected: false };
    localStorage.removeItem('m4_xero_connected');
    showNotification('Xero disconnected', 'success');
    renderApp();
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
};

window.xeroSyncInvoices = async function() {
  var btn = document.getElementById('xero-sync-inv'); if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }
  try {
    var d = invoices.map(function(inv) { var cl = clients.find(function(c){return c.id===inv.client_id;}); return { invoice_number:inv.invoice_number||inv.title, title:inv.title, client_name:cl?cl.name:'Unknown', issue_date:inv.issue_date, due_date:inv.due_date, paid_date:inv.paid_date||null, total:inv.total, subtotal:inv.subtotal, gst:inv.gst, include_gst:inv.include_gst, status:inv.status, items:inv.items||[{description:inv.title||'Services',quantity:1,price:inv.total}] }; });
    var r = await fetch(XERO_WORKER+'/sync/invoices',{method:'POST',headers:{'Content-Type':'application/json','X-User-Id':currentUser.id},body:JSON.stringify({invoices:d})});
    var res = await r.json();
    var synced = res.synced || 0; var skipped = res.skipped || 0; var paid = res.paid || 0; var failed = res.failed || 0;
    var msg = synced + ' invoices synced';
    if (paid > 0) msg += ', ' + paid + ' marked paid';
    if (skipped > 0) msg += ', ' + skipped + ' already in Xero';
    if (failed > 0) msg += ', ' + failed + ' failed';
    showNotification(msg, synced > 0 || skipped > 0 ? 'success' : 'error');
    // Show payment errors if any
    if (res.results) { res.results.forEach(function(r) { if (r.pay_error) console.warn('Payment error for ' + r.invoice_number + ': ' + r.pay_error); }); }
  } catch(e) { showNotification('Error: '+e.message,'error'); }
  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

window.xeroSyncTimesheets = async function() {
  var btn = document.getElementById('xero-sync-time'); if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }
  try {
    // Load all time entries
    var ownerId = (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : currentUser.id;
    var r = await supabaseClient.from('time_entries').select('*').eq('user_id', ownerId);
    var entries = (r.data || []).map(function(e) { return { team_member_name:e.team_member_name, clock_in:e.clock_in, clock_out:e.clock_out, job_title:e.job_title }; });
    var sr = await fetch(XERO_WORKER+'/sync/timesheets',{method:'POST',headers:{'Content-Type':'application/json','X-User-Id':currentUser.id},body:JSON.stringify({entries:entries})});
    var res = await sr.json();
    if (res.success) {
      var msg = res.total_entries + ' time entries processed for ' + res.total_workers + ' workers';
      showNotification(msg, 'success');
      // Show summary in console
      if (res.summary) res.summary.forEach(function(s) { console.log('Payroll: ' + s.name + ' - ' + s.total_hours + ' hours'); });
    } else { showNotification('Error: ' + (res.error || 'Unknown'), 'error'); }
  } catch(e) { showNotification('Error: '+e.message,'error'); }
  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

window.xeroSyncExpenses = async function() {
  var btn = document.getElementById('xero-sync-exp'); if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }
  try {
    var d = expenses.map(function(exp) { var j = exp.job_id ? jobs.find(function(x){return x.id===exp.job_id;}) : null; return { id:exp.id, date:exp.date, amount:exp.amount, category:exp.category, description:exp.description, vendor:exp.vendor||exp.team_member_name||exp.category, job_title:j?j.title:'' }; });
    var r = await fetch(XERO_WORKER+'/sync/expenses',{method:'POST',headers:{'Content-Type':'application/json','X-User-Id':currentUser.id},body:JSON.stringify({expenses:d})});
    var res = await r.json(); var ok = res.results?res.results.filter(function(x){return x.success;}).length:0;
    showNotification(ok+' expenses synced to Xero','success');
  } catch(e) { showNotification('Error: '+e.message,'error'); }
  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

window.xeroSyncContacts = async function() {
  var btn = document.getElementById('xero-sync-con'); if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }
  try {
    var d = clients.map(function(c) { return { name:c.name, email:c.email, phone:c.phone, address:c.address }; });
    var r = await fetch(XERO_WORKER+'/sync/contacts',{method:'POST',headers:{'Content-Type':'application/json','X-User-Id':currentUser.id},body:JSON.stringify({contacts:d})});
    var res = await r.json();
    showNotification((res.synced||0)+' contacts synced to Xero','success');
  } catch(e) { showNotification('Error: '+e.message,'error'); }
  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

window.xeroSyncTimeEntries = async function() {
  var btn = document.getElementById('xero-sync-time'); if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }
  try {
    // Load all completed time entries
    var ownerId = (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : currentUser.id;
    var r = await supabaseClient.from('time_entries').select('*').eq('user_id', ownerId).not('clock_out', 'is', null);
    var entries = (r.data || []).map(function(e) {
      var hours = 0;
      if (e.clock_in && e.clock_out) {
        hours = (new Date(e.clock_out) - new Date(e.clock_in)) / (1000 * 60 * 60);
      }
      return {
        team_member_name: e.team_member_name || 'Unknown',
        job_title: e.job_title || 'General',
        date: e.clock_in ? new Date(e.clock_in).toISOString().split('T')[0] : '',
        hours: Math.round(hours * 10) / 10,
        hourly_rate: 0
      };
    });
    var resp = await fetch(XERO_WORKER+'/sync/timeentries',{method:'POST',headers:{'Content-Type':'application/json','X-User-Id':currentUser.id},body:JSON.stringify({entries:entries})});
    var res = await resp.json();
    var ok = res.results ? res.results.filter(function(x){return x.success;}).length : 0;
    showNotification(ok+' timesheet' + (ok!==1?'s':'') + ' synced to Xero as draft bills','success');
  } catch(e) { showNotification('Error: '+e.message,'error'); }
  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

function inject() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'company') return;
  if (document.getElementById('xero-box')) return;

  var h2 = document.querySelector('h2.text-2xl.font-bold');
  if (!h2 || h2.textContent.trim() !== 'Company Settings') return;

  var box = document.createElement('div');
  box.className = 'xero-box';
  box.id = 'xero-box';

  var h = '';

  if (_xStatus && _xStatus.connected) {
    h += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">';
    h += '<div style="width:40px;height:40px;border-radius:10px;background:#13B5EA;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 14.59L6 12l1.41-1.41L11 14.17l6.59-6.59L19 9l-8.41 8.59z"/></svg></div>';
    h += '<div style="flex:1;"><div style="font-size:18px;font-weight:700;color:#0f172a;" class="dark:text-white">Xero Integration</div><div style="font-size:12px;color:#94a3b8;">Sync invoices, expenses, and contacts</div></div>';
    h += '</div>';
    h += '<div class="xero-status-bar"><span class="xero-dot"></span><span style="font-size:13px;font-weight:600;color:#16a34a;">Connected</span><span style="margin-left:auto;font-size:12px;color:#64748b;">' + escH(_xStatus.tenant_name || '') + '</span></div>';
    h += '<div class="xero-sync-row"><div><div style="font-size:14px;font-weight:500;color:#374151;" class="dark:text-gray-200">Invoices</div><div style="font-size:11px;color:#94a3b8;">Push all invoices to Xero</div></div><button class="xero-sync-btn" id="xero-sync-inv" onclick="xeroSyncInvoices()">Sync Now</button></div>';
    h += '<div class="xero-sync-row"><div><div style="font-size:14px;font-weight:500;color:#374151;" class="dark:text-gray-200">Expenses</div><div style="font-size:11px;color:#94a3b8;">Push expenses to Xero as bills</div></div><button class="xero-sync-btn" id="xero-sync-exp" onclick="xeroSyncExpenses()">Sync Now</button></div>';
    h += '<div class="xero-sync-row"><div><div style="font-size:14px;font-weight:500;color:#374151;" class="dark:text-gray-200">Contacts</div><div style="font-size:11px;color:#94a3b8;">Push clients to Xero contacts</div></div><button class="xero-sync-btn" id="xero-sync-con" onclick="xeroSyncContacts()">Sync Now</button></div>';
    h += '<div class="xero-sync-row"><div><div style="font-size:14px;font-weight:500;color:#374151;" class="dark:text-gray-200">Time Entries / Payroll</div><div style="font-size:11px;color:#94a3b8;">Push logged hours to Xero as draft bills per worker</div></div><button class="xero-sync-btn" id="xero-sync-time" onclick="xeroSyncTimeEntries()">Sync Now</button></div>';
    h += '<div class="xero-sync-row"><div><div style="font-size:14px;font-weight:500;color:#374151;" class="dark:text-gray-200">Timesheets</div><div style="font-size:11px;color:#94a3b8;">Push clock-in hours for payroll</div></div><button class="xero-sync-btn" id="xero-sync-time" onclick="xeroSyncTimesheets()">Sync Now</button></div>';
    h += '<div style="margin-top:16px;text-align:right;"><button class="xero-disconnect" onclick="disconnectXero()">Disconnect Xero</button></div>';
  } else {
    h += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">';
    h += '<div style="display:flex;align-items:center;gap:12px;">';
    h += '<div style="width:40px;height:40px;border-radius:10px;background:#13B5EA;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 14.59L6 12l1.41-1.41L11 14.17l6.59-6.59L19 9l-8.41 8.59z"/></svg></div>';
    h += '<div><div style="font-size:18px;font-weight:700;color:#0f172a;" class="dark:text-white">Xero Integration</div><div style="font-size:13px;color:#64748b;">Sync invoices, expenses, and contacts with Xero</div></div>';
    h += '</div>';
    h += '<button class="xero-connect-btn" onclick="connectXero()"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 14.59L6 12l1.41-1.41L11 14.17l6.59-6.59L19 9l-8.41 8.59z"/></svg> Connect to Xero</button>';
    h += '</div>';
  }

  box.innerHTML = h;
  h2.insertAdjacentElement('afterend', box);
}

function checkReturn() {
  if (localStorage.getItem('m4_xero_connected') === 'true') {
    localStorage.removeItem('m4_xero_connected');
    _xChecked = false;
    checkStatus().then(function() { renderApp(); });
  }
}

// Poll for callback return (popup sets localStorage flag)
var _xPoll = setInterval(function() {
  if (localStorage.getItem('m4_xero_connected') === 'true') {
    localStorage.removeItem('m4_xero_connected');
    clearInterval(_xPoll);
    window.location.reload();
  }
}, 1000);

var _xt = null;
var _xo = new MutationObserver(function() {
  if (_xt) clearTimeout(_xt);
  _xt = setTimeout(async function() {
    if (!currentUser) return;
    if (!_xChecked) await checkStatus();
    inject();
  }, 300);
});
_xo.observe(document.body, { childList: true, subtree: true });

console.log('Xero integration loaded');
} catch(e) { console.error('Xero error:', e); }
})();
