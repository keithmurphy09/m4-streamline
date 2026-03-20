// M4 Xero Integration UI
// Adds Connect Xero section to Company Settings
// Additive only
(function(){
try {

var XERO_WORKER = 'https://round-paper-a015.keithmurphy009.workers.dev';

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'.xero-section{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-top:24px}',
'.dark .xero-section{background:#1f2937;border-color:#374151}',
'.xero-hd{display:flex;align-items:center;gap:12px;margin-bottom:16px}',
'.xero-logo{width:40px;height:40px;border-radius:10px;background:#13B5EA;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
'.xero-title{font-size:18px;font-weight:700;color:#0f172a}',
'.dark .xero-title{color:#fff}',
'.xero-desc{font-size:13px;color:#64748b;margin-bottom:20px;line-height:1.5}',
'.dark .xero-desc{color:#9ca3af}',
'',
'.xero-connect-btn{padding:12px 28px;font-size:14px;font-weight:700;color:#fff;background:#13B5EA;border:none;border-radius:10px;cursor:pointer;font-family:inherit;transition:all 0.15s;display:flex;align-items:center;gap:8px}',
'.xero-connect-btn:hover{background:#0e9fd0;transform:translateY(-1px)}',
'.xero-connect-btn:disabled{opacity:0.5;cursor:not-allowed}',
'.xero-disconnect-btn{padding:8px 16px;font-size:12px;font-weight:600;color:#ef4444;background:#fff;border:1px solid #fecaca;border-radius:8px;cursor:pointer;font-family:inherit}',
'.dark .xero-disconnect-btn{background:#374151;border-color:#991b1b}',
'.xero-disconnect-btn:hover{background:#fef2f2}',
'',
'.xero-status{display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:10px;margin-bottom:16px}',
'.xero-status-connected{background:#f0fdf4;border:1px solid #bbf7d0}',
'.dark .xero-status-connected{background:rgba(22,163,74,0.1);border-color:rgba(22,163,74,0.3)}',
'.xero-status-dot{width:10px;height:10px;border-radius:50%;background:#10b981;animation:tc-pulse 2s infinite}',
'.xero-status-text{font-size:13px;font-weight:600;color:#16a34a}',
'.dark .xero-status-text{color:#4ade80}',
'.xero-status-org{font-size:12px;color:#64748b;margin-left:auto}',
'',
'.xero-sync-section{border-top:1px solid #e2e8f0;padding-top:16px;margin-top:16px}',
'.dark .xero-sync-section{border-top-color:#374151}',
'.xero-sync-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f3f4f6}',
'.dark .xero-sync-row{border-bottom-color:#374151}',
'.xero-sync-row:last-child{border-bottom:none}',
'.xero-sync-label{font-size:14px;font-weight:500;color:#374151}',
'.dark .xero-sync-label{color:#d1d5db}',
'.xero-sync-sublabel{font-size:11px;color:#94a3b8}',
'.xero-sync-btn{padding:8px 16px;font-size:12px;font-weight:600;color:#fff;background:#13B5EA;border:none;border-radius:6px;cursor:pointer;font-family:inherit;transition:all 0.15s}',
'.xero-sync-btn:hover{background:#0e9fd0}',
'.xero-sync-btn:disabled{opacity:0.5;cursor:not-allowed}',
'.xero-sync-result{font-size:11px;margin-top:4px}'
].join('\n');
document.head.appendChild(css);

function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============ STATE ============
var _xeroStatus = null;
var _xeroChecked = false;

// ============ CHECK XERO STATUS ============
async function checkXeroStatus() {
  if (!currentUser) return;
  try {
    var r = await fetch(XERO_WORKER + '/status?user_id=' + currentUser.id);
    _xeroStatus = await r.json();
  } catch(e) {
    _xeroStatus = { connected: false };
  }
  _xeroChecked = true;
}

// ============ CONNECT XERO ============
window.connectXero = async function() {
  if (!currentUser) return;

  // Store user ID for callback page
  localStorage.setItem('m4_xero_user_id', currentUser.id);

  try {
    var r = await fetch(XERO_WORKER + '/auth');
    var data = await r.json();
    if (data.auth_url) {
      window.open(data.auth_url, '_blank');
    } else {
      showNotification('Error getting auth URL', 'error');
    }
  } catch(e) {
    showNotification('Error: ' + e.message, 'error');
  }
};

// ============ DISCONNECT XERO ============
window.disconnectXero = async function() {
  if (!confirm('Disconnect Xero? This will stop all syncing.')) return;
  if (!currentUser) return;

  try {
    await fetch(XERO_WORKER + '/disconnect?user_id=' + currentUser.id, { method: 'POST' });
    _xeroStatus = { connected: false };
    _xeroChecked = true;
    localStorage.removeItem('m4_xero_connected');
    showNotification('Xero disconnected', 'success');
    renderApp();
  } catch(e) {
    showNotification('Error: ' + e.message, 'error');
  }
};

// ============ SYNC FUNCTIONS ============
window.xeroSyncInvoices = async function() {
  var btn = document.getElementById('xero-sync-inv-btn');
  if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }

  try {
    var invData = invoices.map(function(inv) {
      var cl = clients.find(function(c) { return c.id === inv.client_id; });
      return {
        invoice_number: inv.invoice_number || inv.title,
        title: inv.title,
        client_name: cl ? cl.name : 'Unknown',
        issue_date: inv.issue_date,
        due_date: inv.due_date,
        total: inv.total,
        subtotal: inv.subtotal,
        gst: inv.gst,
        include_gst: inv.include_gst,
        status: inv.status,
        items: inv.items || [{ description: inv.title || 'Services', quantity: 1, price: inv.total }]
      };
    });

    var r = await fetch(XERO_WORKER + '/sync/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': currentUser.id },
      body: JSON.stringify({ invoices: invData })
    });
    var result = await r.json();

    var success = result.results ? result.results.filter(function(r) { return r.success; }).length : 0;
    var failed = result.results ? result.results.filter(function(r) { return !r.success; }).length : 0;

    showNotification(success + ' invoices synced to Xero' + (failed > 0 ? ', ' + failed + ' failed' : ''), success > 0 ? 'success' : 'error');

    var resultEl = document.getElementById('xero-sync-inv-result');
    if (resultEl) resultEl.innerHTML = '<span style="color:#10b981;">' + success + ' synced</span>' + (failed > 0 ? ' <span style="color:#ef4444;">' + failed + ' failed</span>' : '');
  } catch(e) {
    showNotification('Sync error: ' + e.message, 'error');
  }

  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

window.xeroSyncExpenses = async function() {
  var btn = document.getElementById('xero-sync-exp-btn');
  if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }

  try {
    var expData = expenses.map(function(exp) {
      return {
        id: exp.id,
        date: exp.date,
        amount: exp.amount,
        category: exp.category,
        description: exp.description,
        vendor: exp.vendor || exp.team_member_name || exp.category,
        team_member: exp.team_member_name
      };
    });

    var r = await fetch(XERO_WORKER + '/sync/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': currentUser.id },
      body: JSON.stringify({ expenses: expData })
    });
    var result = await r.json();

    var success = result.results ? result.results.filter(function(r) { return r.success; }).length : 0;
    var failed = result.results ? result.results.filter(function(r) { return !r.success; }).length : 0;

    showNotification(success + ' expenses synced to Xero' + (failed > 0 ? ', ' + failed + ' failed' : ''), success > 0 ? 'success' : 'error');

    var resultEl = document.getElementById('xero-sync-exp-result');
    if (resultEl) resultEl.innerHTML = '<span style="color:#10b981;">' + success + ' synced</span>' + (failed > 0 ? ' <span style="color:#ef4444;">' + failed + ' failed</span>' : '');
  } catch(e) {
    showNotification('Sync error: ' + e.message, 'error');
  }

  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

window.xeroSyncContacts = async function() {
  var btn = document.getElementById('xero-sync-con-btn');
  if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }

  try {
    var conData = clients.map(function(c) {
      return { name: c.name, email: c.email, phone: c.phone, address: c.address };
    });

    var r = await fetch(XERO_WORKER + '/sync/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': currentUser.id },
      body: JSON.stringify({ contacts: conData })
    });
    var result = await r.json();

    showNotification(result.synced + ' contacts synced to Xero', result.success ? 'success' : 'error');

    var resultEl = document.getElementById('xero-sync-con-result');
    if (resultEl) resultEl.innerHTML = '<span style="color:#10b981;">' + (result.synced || 0) + ' synced</span>';
  } catch(e) {
    showNotification('Sync error: ' + e.message, 'error');
  }

  if (btn) { btn.textContent = 'Sync Now'; btn.disabled = false; }
};

// ============ INJECT UI ============
function injectXeroSection() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'company') return;

  var companyContent = document.querySelector('.space-y-6');
  if (!companyContent) return;
  if (companyContent.dataset.xeroAdded) return;
  companyContent.dataset.xeroAdded = 'true';

  var section = document.createElement('div');
  section.className = 'xero-section';
  section.id = 'xero-section';

  var h = '';
  h += '<div class="xero-hd">';
  h += '<div class="xero-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 14.59L6 12l1.41-1.41L11 14.17l6.59-6.59L19 9l-8.41 8.59z"/></svg></div>';
  h += '<div><div class="xero-title">Xero Integration</div><div style="font-size:12px;color:#94a3b8;">Sync invoices, expenses, and contacts</div></div>';
  h += '</div>';

  if (_xeroStatus && _xeroStatus.connected) {
    h += '<div class="xero-status xero-status-connected">';
    h += '<span class="xero-status-dot"></span>';
    h += '<span class="xero-status-text">Connected</span>';
    h += '<span class="xero-status-org">' + escH(_xeroStatus.tenant_name || 'Your Organisation') + '</span>';
    h += '</div>';

    // Sync controls
    h += '<div class="xero-sync-section">';

    h += '<div class="xero-sync-row">';
    h += '<div><div class="xero-sync-label">Invoices</div><div class="xero-sync-sublabel">Push all invoices to Xero</div><div class="xero-sync-result" id="xero-sync-inv-result"></div></div>';
    h += '<button class="xero-sync-btn" id="xero-sync-inv-btn" onclick="xeroSyncInvoices()">Sync Now</button>';
    h += '</div>';

    h += '<div class="xero-sync-row">';
    h += '<div><div class="xero-sync-label">Expenses</div><div class="xero-sync-sublabel">Push all expenses to Xero as bills</div><div class="xero-sync-result" id="xero-sync-exp-result"></div></div>';
    h += '<button class="xero-sync-btn" id="xero-sync-exp-btn" onclick="xeroSyncExpenses()">Sync Now</button>';
    h += '</div>';

    h += '<div class="xero-sync-row">';
    h += '<div><div class="xero-sync-label">Contacts / Clients</div><div class="xero-sync-sublabel">Push all clients to Xero contacts</div><div class="xero-sync-result" id="xero-sync-con-result"></div></div>';
    h += '<button class="xero-sync-btn" id="xero-sync-con-btn" onclick="xeroSyncContacts()">Sync Now</button>';
    h += '</div>';

    h += '</div>';

    h += '<div style="margin-top:16px;text-align:right;">';
    h += '<button class="xero-disconnect-btn" onclick="disconnectXero()">Disconnect Xero</button>';
    h += '</div>';

  } else {
    h += '<div class="xero-desc">Connect your Xero account to automatically sync invoices, expenses, and client contacts. Keep your accounting up to date without manual data entry.</div>';
    h += '<button class="xero-connect-btn" onclick="connectXero()">';
    h += '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 14.59L6 12l1.41-1.41L11 14.17l6.59-6.59L19 9l-8.41 8.59z"/></svg>';
    h += 'Connect to Xero';
    h += '</button>';
  }

  section.innerHTML = h;
  companyContent.appendChild(section);
}

// ============ CHECK FOR CALLBACK RETURN ============
function checkCallbackReturn() {
  if (localStorage.getItem('m4_xero_connected') === 'true') {
    localStorage.removeItem('m4_xero_connected');
    _xeroChecked = false;
    checkXeroStatus().then(function() { renderApp(); });
  }
}

// ============ OBSERVER ============
var _xTimer = null;
var _xObs = new MutationObserver(function() {
  if (_xTimer) clearTimeout(_xTimer);
  _xTimer = setTimeout(async function() {
    if (!currentUser) return;
    if (!_xeroChecked) await checkXeroStatus();
    injectXeroSection();
    checkCallbackReturn();
  }, 300);
});
_xObs.observe(document.body, { childList: true, subtree: true });

console.log('Xero integration UI loaded');

} catch(e) {
  console.error('Xero UI error:', e);
}
})();
