// M4 Quick Quote - Fast quoting from mobile
// Floating action button, streamlined form: client, description, amount, send
// Additive only
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'/* Floating Action Button */',
'.qq-fab{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#0d9488,#14b8a6);color:#fff;border:none;cursor:pointer;z-index:40;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(13,148,136,0.4);transition:all 0.2s;font-family:inherit}',
'.qq-fab:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(13,148,136,0.5)}',
'.qq-fab:active{transform:scale(0.95)}',
'@media(min-width:1024px){.qq-fab{display:none}}',
'',
'/* Quick Quote Modal */',
'.qq-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.6);display:flex;align-items:flex-end;justify-content:center;animation:qq-fadeIn 0.2s ease}',
'@keyframes qq-fadeIn{from{opacity:0}to{opacity:1}}',
'.qq-sheet{background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;animation:qq-slideUp 0.3s ease;padding:0}',
'@keyframes qq-slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}',
'.dark .qq-sheet{background:#1f2937}',
'.qq-handle{width:40px;height:4px;background:#d1d5db;border-radius:2px;margin:12px auto 0}',
'.dark .qq-handle{background:#4b5563}',
'.qq-hd{padding:16px 24px 0;display:flex;justify-content:space-between;align-items:center}',
'.qq-title{font-family:Outfit,sans-serif;font-size:20px;font-weight:700;color:#0f172a}',
'.dark .qq-title{color:#fff}',
'.qq-close{background:none;border:none;font-size:22px;color:#94a3b8;cursor:pointer;padding:4px}',
'.qq-body{padding:16px 24px 24px}',
'.qq-field{margin-bottom:14px}',
'.qq-field label{display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.03em}',
'.dark .qq-field label{color:#9ca3af}',
'.qq-field input,.qq-field select,.qq-field textarea{width:100%;padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;font-size:15px;font-family:inherit;outline:none;transition:border-color 0.15s;background:#fff;color:#0f172a}',
'.dark .qq-field input,.dark .qq-field select,.dark .qq-field textarea{background:#374151;color:#e2e8f0;border-color:#4b5563}',
'.qq-field input:focus,.qq-field select:focus,.qq-field textarea:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,0.1)}',
'.qq-amount-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
'.qq-gst-toggle{display:flex;align-items:center;gap:8px;padding:8px 0;font-size:13px;color:#64748b;cursor:pointer}',
'.dark .qq-gst-toggle{color:#9ca3af}',
'.qq-gst-toggle input{width:18px;height:18px;accent-color:#0d9488}',
'.qq-total-bar{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}',
'.dark .qq-total-bar{background:#111827;border-color:#374151}',
'.qq-total-label{font-size:13px;font-weight:600;color:#64748b}',
'.dark .qq-total-label{color:#9ca3af}',
'.qq-total-amount{font-size:22px;font-weight:800;color:#0f172a}',
'.dark .qq-total-amount{color:#fff}',
'.qq-send-btn{width:100%;padding:14px;font-size:15px;font-weight:700;color:#fff;background:#0d9488;border:none;border-radius:10px;cursor:pointer;font-family:inherit;transition:all 0.15s}',
'.qq-send-btn:hover{background:#0f766e}',
'.qq-send-btn:disabled{opacity:0.5;cursor:not-allowed}',
'.qq-or{text-align:center;font-size:12px;color:#94a3b8;margin:10px 0}',
'.qq-save-btn{width:100%;padding:12px;font-size:14px;font-weight:600;color:#64748b;background:#f1f5f9;border:none;border-radius:10px;cursor:pointer;font-family:inherit;transition:all 0.15s}',
'.dark .qq-save-btn{background:#374151;color:#d1d5db}',
'.qq-save-btn:hover{background:#e2e8f0}',
'.qq-new-client{font-size:12px;color:#0d9488;background:none;border:none;cursor:pointer;font-family:inherit;font-weight:600;padding:0;margin-top:4px}',
'.qq-new-client:hover{text-decoration:underline}',
'',
'/* Desktop: show in Quick Actions */',
'@media(min-width:1024px){.qq-overlay{align-items:center}.qq-sheet{border-radius:16px;max-width:480px}}'
].join('\n');
document.head.appendChild(css);

function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ============ FAB BUTTON ============
function injectFab() {
  if (document.getElementById('qq-fab')) return;
  // Don't show on landing page
  var landing = document.getElementById('landing');
  if (landing && landing.style.display !== 'none') return;
  if (!currentUser) return;

  var fab = document.createElement('button');
  fab.id = 'qq-fab';
  fab.className = 'qq-fab';
  fab.title = 'Quick Quote';
  fab.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>';
  fab.setAttribute('onclick', 'openQuickQuote()');
  document.body.appendChild(fab);
}

// ============ OPEN QUICK QUOTE ============
window.openQuickQuote = function() {
  if (document.getElementById('qq-overlay')) return;

  var clientOpts = '<option value="">Select a client</option>';
  var sorted = clients.slice().sort(function(a, b) { return (a.name || '').localeCompare(b.name || ''); });
  for (var i = 0; i < sorted.length; i++) {
    clientOpts += '<option value="' + sorted[i].id + '">' + escH(sorted[i].name) + '</option>';
  }

  var ov = document.createElement('div');
  ov.id = 'qq-overlay';
  ov.className = 'qq-overlay';
  ov.setAttribute('onclick', 'if(event.target===this)closeQuickQuote()');

  ov.innerHTML =
    '<div class="qq-sheet">' +
      '<div class="qq-handle"></div>' +
      '<div class="qq-hd"><span class="qq-title">Quick Quote</span><button class="qq-close" onclick="closeQuickQuote()">&times;</button></div>' +
      '<div class="qq-body">' +

        '<div class="qq-field">' +
          '<label>Client</label>' +
          '<select id="qq-client">' + clientOpts + '</select>' +
          '<button class="qq-new-client" onclick="qqAddClient()">+ New client</button>' +
        '</div>' +

        '<div id="qq-new-client-fields" style="display:none;">' +
          '<div class="qq-field"><label>Client Name</label><input type="text" id="qq-new-name" placeholder="e.g. Rob Smith"></div>' +
          '<div class="qq-field"><label>Email</label><input type="email" id="qq-new-email" placeholder="e.g. rob@email.com"></div>' +
          '<div class="qq-field"><label>Phone</label><input type="text" id="qq-new-phone" placeholder="e.g. 0412 345 678"></div>' +
        '</div>' +

        '<div class="qq-field">' +
          '<label>Job Address</label>' +
          '<input type="text" id="qq-address" placeholder="e.g. 45 Smith St, Brisbane">' +
        '</div>' +

        '<div class="qq-field">' +
          '<label>Description</label>' +
          '<textarea id="qq-desc" rows="2" placeholder="e.g. Bathroom renovation - supply and install tiles"></textarea>' +
        '</div>' +

        '<div class="qq-amount-row">' +
          '<div class="qq-field"><label>Amount ($)</label><input type="number" id="qq-amount" placeholder="0.00" step="0.01" min="0" oninput="qqUpdateTotal()"></div>' +
          '<div class="qq-field"><label>Deposit %</label><input type="number" id="qq-deposit" value="0" min="0" max="100" placeholder="0"></div>' +
        '</div>' +

        '<label class="qq-gst-toggle"><input type="checkbox" id="qq-gst" checked onchange="qqUpdateTotal()"> Include GST (10%)</label>' +

        '<div class="qq-total-bar">' +
          '<span class="qq-total-label">Total</span>' +
          '<span class="qq-total-amount" id="qq-total">$0.00</span>' +
        '</div>' +

        '<button class="qq-send-btn" onclick="qqSaveAndSend()">Create &amp; Send Quote</button>' +
        '<div class="qq-or">or</div>' +
        '<button class="qq-save-btn" onclick="qqSaveOnly()">Save as Draft</button>' +

      '</div>' +
    '</div>';

  document.body.appendChild(ov);
};

window.closeQuickQuote = function() {
  var ov = document.getElementById('qq-overlay');
  if (ov) ov.remove();
};

// ============ NEW CLIENT INLINE ============
window.qqAddClient = function() {
  var fields = document.getElementById('qq-new-client-fields');
  var select = document.getElementById('qq-client');
  if (fields.style.display === 'none') {
    fields.style.display = 'block';
    if (select) select.style.display = 'none';
  } else {
    fields.style.display = 'none';
    if (select) select.style.display = '';
  }
};

// ============ UPDATE TOTAL ============
window.qqUpdateTotal = function() {
  var amount = parseFloat((document.getElementById('qq-amount') || {}).value) || 0;
  var gst = document.getElementById('qq-gst');
  var total = gst && gst.checked ? amount * 1.1 : amount;
  var el = document.getElementById('qq-total');
  if (el) el.textContent = '$' + total.toFixed(2);
};

// ============ SAVE QUOTE ============
async function qqCreateQuote(sendAfter) {
  var clientId = null;
  var newClientFields = document.getElementById('qq-new-client-fields');
  var isNewClient = newClientFields && newClientFields.style.display !== 'none';

  // Create new client if needed
  if (isNewClient) {
    var cName = (document.getElementById('qq-new-name') || {}).value;
    if (!cName || !cName.trim()) { showNotification('Please enter client name', 'error'); return; }
    try {
      var cr = await supabaseClient.from('clients').insert([{
        user_id: currentUser.id,
        name: cName.trim(),
        email: (document.getElementById('qq-new-email') || {}).value || '',
        phone: (document.getElementById('qq-new-phone') || {}).value || ''
      }]).select();
      if (cr.error) throw cr.error;
      if (cr.data && cr.data[0]) {
        clients.push(cr.data[0]);
        clientId = cr.data[0].id;
      }
    } catch(e) { showNotification('Error creating client: ' + e.message, 'error'); return; }
  } else {
    clientId = (document.getElementById('qq-client') || {}).value;
    if (!clientId) { showNotification('Please select a client', 'error'); return; }
  }

  var amount = parseFloat((document.getElementById('qq-amount') || {}).value) || 0;
  if (amount <= 0) { showNotification('Please enter an amount', 'error'); return; }

  var desc = (document.getElementById('qq-desc') || {}).value || '';
  var address = (document.getElementById('qq-address') || {}).value || '';
  var gst = document.getElementById('qq-gst');
  var includeGst = gst ? gst.checked : false;
  var deposit = parseInt((document.getElementById('qq-deposit') || {}).value) || 0;

  var subtotal = amount;
  var gstAmount = includeGst ? subtotal * 0.1 : 0;
  var total = subtotal + gstAmount;

  // Generate quote number
  var qNum = 'QQ-' + Date.now().toString(36).toUpperCase();

  var btn = document.querySelector('.qq-send-btn');
  if (sendAfter && btn) { btn.textContent = 'Creating...'; btn.disabled = true; }
  var draftBtn = document.querySelector('.qq-save-btn');
  if (!sendAfter && draftBtn) { draftBtn.textContent = 'Saving...'; draftBtn.disabled = true; }

  try {
    var shareToken = 'qt_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    var quote = {
      user_id: currentUser.id,
      client_id: clientId,
      title: qNum,
      quote_number: qNum,
      job_address: address,
      total: total,
      subtotal: subtotal,
      gst: gstAmount,
      items: [{ description: desc || 'Services', quantity: 1, price: amount }],
      notes: '',
      include_gst: includeGst,
      deposit_percentage: deposit,
      payment_terms: '',
      status: 'pending',
      share_token: shareToken
    };

    var r = await supabaseClient.from('quotes').insert([quote]).select();
    if (r.error) throw r.error;

    if (r.data && r.data[0]) {
      quotes.push(r.data[0]);
      window.lastCreatedQuote = r.data[0];
    }

    closeQuickQuote();

    if (sendAfter && r.data && r.data[0]) {
      // Switch to quotes tab and show the new quote
      switchTab('quotes');
      showNotification('Quote created! Opening to send...', 'success');
      // Open quote detail after a brief delay
      setTimeout(function() {
        var q = r.data[0];
        if (typeof openQuoteDetail === 'function') {
          openQuoteDetail(q);
        }
      }, 500);
    } else {
      showNotification('Quote saved as draft - $' + total.toFixed(2), 'success');
      renderApp();
    }
  } catch(e) {
    console.error('Quick quote error:', e);
    showNotification('Error: ' + e.message, 'error');
    if (btn) { btn.textContent = 'Create & Send Quote'; btn.disabled = false; }
    if (draftBtn) { draftBtn.textContent = 'Save as Draft'; draftBtn.disabled = false; }
  }
}

window.qqSaveAndSend = function() { qqCreateQuote(true); };
window.qqSaveOnly = function() { qqCreateQuote(false); };

// ============ ADD TO QUICK ACTIONS ON DESKTOP ============
function injectDesktopButton() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'dashboard') return;

  var quickActions = document.querySelectorAll('.grid.grid-cols-2.md\\:grid-cols-4');
  if (quickActions.length === 0) return;
  var grid = quickActions[quickActions.length - 1];
  if (grid.dataset.qqAdded) return;
  grid.dataset.qqAdded = 'true';

  // Check if Scan Receipt button exists (it has the camera icon)
  var existingBtns = grid.querySelectorAll('button');
  var hasScanReceipt = false;
  existingBtns.forEach(function(b) {
    if (b.textContent.indexOf('Scan Receipt') !== -1) hasScanReceipt = true;
  });

  var btn = document.createElement('button');
  btn.className = 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 px-4 py-3 rounded-lg font-medium transition-colors text-sm';
  btn.innerHTML = '<svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Quick Quote';
  btn.setAttribute('onclick', 'openQuickQuote()');
  grid.appendChild(btn);
}

// ============ OBSERVER ============
var _qqTimer = null;
var _qqObs = new MutationObserver(function() {
  if (_qqTimer) clearTimeout(_qqTimer);
  _qqTimer = setTimeout(function() {
    if (!currentUser) return;
    injectFab();
    injectDesktopButton();
  }, 300);
});
_qqObs.observe(document.body, { childList: true, subtree: true });

console.log('Quick quote loaded');

} catch(e) {
  console.error('Quick quote init error:', e);
}
})();
