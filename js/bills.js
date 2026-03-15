// M4 Bills v2 - Instant toggle, quick view panel, status dropdown
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.bill-tab{padding:8px 16px;font-size:13px;font-weight:600;border-radius:6px;cursor:pointer;border:1px solid #d1d5db;background:#fff;color:#0f172a;font-family:inherit;transition:all 0.15s}',
'.bill-tab:hover{border-color:#2dd4bf}',
'.bill-tab.active{border-color:#2dd4bf;box-shadow:0 0 10px rgba(45,212,191,0.5)}',
'.dark .bill-tab{background:#374151;color:#e2e8f0;border-color:#4b5563}',
'.dark .bill-tab.active{border-color:#2dd4bf;box-shadow:0 0 10px rgba(45,212,191,0.5)}',
'',
'.bill-card{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:8px;cursor:pointer;transition:all 0.15s}',
'.bill-card:hover{border-color:#99f6e4;box-shadow:0 4px 12px rgba(0,0,0,0.04)}',
'.dark .bill-card{background:#1f2937;border-color:#374151}',
'.dark .bill-card:hover{border-color:#2dd4bf}',
'',
'.bill-badge{display:inline-flex;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase}',
'.bill-badge-unpaid{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}',
'.bill-badge-paid{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}',
'.bill-badge-overdue{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}',
'.dark .bill-badge-unpaid{background:rgba(220,38,38,0.1);border-color:rgba(220,38,38,0.3)}',
'.dark .bill-badge-paid{background:rgba(22,163,74,0.1);border-color:rgba(22,163,74,0.3)}',
'',
'.bill-thumb{width:40px;height:40px;border-radius:8px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid #e2e8f0;overflow:hidden}',
'.dark .bill-thumb{background:#374151;border-color:#4b5563}',
'.bill-thumb img{width:100%;height:100%;object-fit:cover}',
'',
'.bp-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:55;opacity:0;transition:opacity 0.25s}',
'.bp-overlay.active{opacity:1}',
'.bp-panel{position:fixed;top:0;right:-420px;width:400px;max-width:90vw;height:100vh;background:#fff;z-index:56;box-shadow:-4px 0 24px rgba(0,0,0,0.12);transition:right 0.3s ease;overflow-y:auto;display:flex;flex-direction:column}',
'.bp-panel.active{right:0}',
'.dark .bp-panel{background:#1f2937;box-shadow:-4px 0 24px rgba(0,0,0,0.4)}',
'.bp-hd{padding:20px 24px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}',
'.dark .bp-hd{border-bottom-color:#374151}',
'.bp-body{padding:24px;flex:1;overflow-y:auto}',
'.bp-row{display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f3f4f6}',
'.dark .bp-row{border-bottom-color:#374151}',
'.bp-label{font-size:12px;color:#6b7280;font-weight:500;text-transform:uppercase;letter-spacing:0.05em}',
'.dark .bp-label{color:#9ca3af}',
'.bp-value{font-size:14px;color:#1f2937;font-weight:500;text-align:right;max-width:60%}',
'.dark .bp-value{color:#e5e7eb}',
'.bp-actions{padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;gap:10px;flex-shrink:0}',
'.dark .bp-actions{border-top-color:#374151}',
'.bp-status-select{padding:6px 12px;font-size:12px;font-weight:600;border-radius:8px;border:1px solid #d1d5db;background:#fff;color:#374151;cursor:pointer;font-family:inherit}',
'.dark .bp-status-select{background:#374151;color:#e2e8f0;border-color:#4b5563}'
].join('\n');
document.head.appendChild(css);

// ============ STATE ============
var _bills = [];
var _billsLoaded = false;
var _billView = 'expenses';

function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function fmtDate(d) {
  if (!d) return '-';
  var dt = new Date(d + 'T00:00:00');
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return dt.getDate() + ' ' + months[dt.getMonth()] + ' ' + dt.getFullYear();
}
function getOwnerId() {
  return (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : (currentUser ? currentUser.id : null);
}
function isOverdue(b) {
  if (b.status === 'paid' || !b.due_date) return false;
  var today = new Date(); today.setHours(0,0,0,0);
  return new Date(b.due_date + 'T00:00:00') < today;
}

// ============ LOAD ============
async function loadBills() {
  if (_billsLoaded) return;
  try {
    var ownerId = getOwnerId();
    if (!ownerId) return;
    var r = await supabaseClient.from('bills').select('*').eq('user_id', ownerId).order('created_at', { ascending: false });
    if (r.error) throw r.error;
    _bills = r.data || [];
    _billsLoaded = true;
  } catch (e) { console.error('Error loading bills:', e); }
}

// ============ ADD BILL MODAL ============
window.openAddBillModal = function(preJobId) {
  if (document.getElementById('bill-modal')) return;
  var jobOpts = '<option value="">No specific job</option>';
  for (var i = 0; i < jobs.length; i++) {
    var j = jobs[i]; var cl = null;
    for (var c = 0; c < clients.length; c++) { if (clients[c].id === j.client_id) { cl = clients[c]; break; } }
    jobOpts += '<option value="' + j.id + '"' + (preJobId === j.id ? ' selected' : '') + '>' + escH(j.title) + (cl ? ' - ' + escH(cl.name) : '') + '</option>';
  }
  var today = new Date().toISOString().split('T')[0];
  var ov = document.createElement('div');
  ov.id = 'bill-modal';
  ov.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50';
  ov.setAttribute('onclick', 'if(event.target===this)closeBillModal()');
  ov.innerHTML =
    '<div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full" style="max-height:90vh;overflow-y:auto;">' +
      '<div class="flex justify-between mb-4"><h3 class="text-xl font-bold dark:text-white">Add Bill</h3><button onclick="closeBillModal()" class="text-2xl leading-none dark:text-gray-300">&times;</button></div>' +
      '<div class="mb-3"><label class="block text-sm font-medium mb-1 dark:text-gray-200">Vendor / Supplier *</label><input type="text" id="bill-vendor" placeholder="e.g. Bunnings, subcontractor" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"></div>' +
      '<div class="mb-3"><label class="block text-sm font-medium mb-1 dark:text-gray-200">Their Invoice Number</label><input type="text" id="bill-number" placeholder="INV-001" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"></div>' +
      '<div class="grid grid-cols-2 gap-3 mb-3"><div><label class="block text-sm font-medium mb-1 dark:text-gray-200">Amount *</label><input type="number" id="bill-amount" placeholder="0.00" step="0.01" min="0" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"></div><div><label class="block text-sm font-medium mb-1 dark:text-gray-200">Bill Date *</label><input type="date" id="bill-date" value="' + today + '" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"></div></div>' +
      '<div class="mb-3"><label class="block text-sm font-medium mb-1 dark:text-gray-200">Due Date</label><input type="date" id="bill-due-date" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"></div>' +
      '<div class="mb-3"><label class="block text-sm font-medium mb-1 dark:text-gray-200">Related Job</label><select id="bill-job" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">' + jobOpts + '</select></div>' +
      '<div class="mb-3"><label class="block text-sm font-medium mb-1 dark:text-gray-200">Description</label><textarea id="bill-description" rows="2" placeholder="What is this bill for?" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"></textarea></div>' +
      '<div class="mb-4"><label class="block text-sm font-medium mb-1 dark:text-gray-200">Upload Invoice Copy</label><div id="bill-file-area"><label class="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-teal-400 text-sm text-gray-500"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>Upload photo or PDF<input type="file" accept="image/*,.pdf" id="bill-file-input" onchange="onBillFileSelected(this)" class="hidden" /></label></div><input type="hidden" id="bill-file-url" /></div>' +
      '<button onclick="saveBill()" class="w-full bg-black text-white px-4 py-2.5 rounded-lg border border-teal-400 font-medium">Add Bill</button>' +
    '</div>';
  document.body.appendChild(ov);
};
window.closeBillModal = function() { var m = document.getElementById('bill-modal'); if (m) m.remove(); };

window.onBillFileSelected = async function(input) {
  var file = input.files[0]; if (!file) return;
  var area = document.getElementById('bill-file-area');
  if (area) area.innerHTML = '<div class="text-sm text-gray-500 text-center py-2">Uploading...</div>';
  try {
    var ext = file.name.split('.').pop();
    var sc = typeof supabaseClient !== 'undefined' ? supabaseClient : supabase;
    var up = await sc.storage.from('job-photos').upload('bills/bill-' + Date.now() + '.' + ext, file);
    if (up.error) throw up.error;
    var url = sc.storage.from('job-photos').getPublicUrl('bills/bill-' + Date.now() + '.' + ext);
    // Re-get with correct path
    url = sc.storage.from('job-photos').getPublicUrl(up.data.path);
    var publicUrl = url.data ? url.data.publicUrl : '';
    document.getElementById('bill-file-url').value = publicUrl;
    if (area) area.innerHTML = '<div class="flex items-center gap-2 p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800"><svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span class="text-sm text-teal-700 dark:text-teal-400 font-medium">' + escH(file.name) + '</span></div>';
  } catch (e) { console.error(e); if (area) area.innerHTML = '<div class="text-sm text-red-500">Upload failed</div>'; }
};

window.saveBill = async function() {
  var vendor = document.getElementById('bill-vendor');
  var amount = document.getElementById('bill-amount');
  var date = document.getElementById('bill-date');
  if (!vendor || !vendor.value.trim() || !amount || !parseFloat(amount.value) || !date || !date.value) {
    showNotification('Please fill in vendor, amount, and date', 'error'); return;
  }
  var jobEl = document.getElementById('bill-job');
  var jobId = (jobEl && jobEl.value) ? jobEl.value : null;
  var jobTitle = null;
  if (jobId) { for (var i = 0; i < jobs.length; i++) { if (jobs[i].id === jobId) { jobTitle = jobs[i].title; break; } } }
  try {
    var bill = {
      user_id: getOwnerId(), vendor_name: vendor.value.trim(),
      bill_number: (document.getElementById('bill-number') || {}).value || null,
      amount: parseFloat(amount.value), date: date.value,
      due_date: (document.getElementById('bill-due-date') || {}).value || null,
      status: 'unpaid', job_id: jobId, job_title: jobTitle,
      description: (document.getElementById('bill-description') || {}).value || null,
      file_url: (document.getElementById('bill-file-url') || {}).value || null
    };
    var r = await supabaseClient.from('bills').insert([bill]).select();
    if (r.error) throw r.error;
    if (r.data && r.data[0]) _bills.unshift(r.data[0]);
    closeBillModal();
    showNotification('Bill added - $' + parseFloat(amount.value).toFixed(2) + ' from ' + vendor.value.trim(), 'success');
    refreshBillsBadge();
    if (_billView === 'bills') { switchBillView('bills'); } else { renderApp(); }
  } catch (e) { console.error(e); showNotification('Error: ' + e.message, 'error'); }
};

// ============ TOGGLE STATUS ============
window.setBillStatus = async function(billId, newStatus) {
  var bill = _bills.find(function(b) { return b.id === billId; });
  if (!bill) return;
  var paidDate = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null;
  try {
    var r = await supabaseClient.from('bills').update({ status: newStatus, paid_date: paidDate }).eq('id', billId);
    if (r.error) throw r.error;
    bill.status = newStatus; bill.paid_date = paidDate;
    showNotification('Bill marked as ' + newStatus, 'success');
    refreshBillsBadge();
    refreshBillsList();
    // Refresh quick view if open
    var panel = document.getElementById('bp-panel');
    if (panel) { closeBillPanel(); openBillPanel(billId); }
  } catch (e) { console.error(e); showNotification('Error: ' + e.message, 'error'); }
};

window.deleteBill = async function(billId) {
  if (!confirm('Delete this bill?')) return;
  try {
    var r = await supabaseClient.from('bills').delete().eq('id', billId);
    if (r.error) throw r.error;
    _bills = _bills.filter(function(b) { return b.id !== billId; });
    closeBillPanel();
    showNotification('Bill deleted', 'success');
    refreshBillsBadge();
    refreshBillsList();
  } catch (e) { console.error(e); }
};

// ============ BILL QUICK VIEW PANEL ============
window.openBillPanel = function(billId) {
  var b = _bills.find(function(x) { return x.id === billId; });
  if (!b) return;
  closeBillPanel();
  var overdue = isOverdue(b);
  var statusCls = b.status === 'paid' ? 'bill-badge-paid' : (overdue ? 'bill-badge-overdue' : 'bill-badge-unpaid');

  var ov = document.createElement('div');
  ov.id = 'bp-overlay'; ov.className = 'bp-overlay';
  ov.setAttribute('onclick', 'closeBillPanel()');

  var panel = document.createElement('div');
  panel.id = 'bp-panel'; panel.className = 'bp-panel';

  var h = '';
  h += '<div class="bp-hd"><div><h3 class="text-lg font-bold dark:text-white">Bill Details</h3><p class="text-xs text-gray-400 mt-1">' + fmtDate(b.date) + '</p></div><button onclick="closeBillPanel()" class="text-2xl leading-none text-gray-400 hover:text-gray-600 dark:text-gray-500">&times;</button></div>';
  h += '<div class="bp-body">';

  // Amount
  h += '<div class="text-center mb-6">';
  h += '<div style="font-size:32px;font-weight:800;color:#dc2626;">$' + parseFloat(b.amount).toFixed(2) + '</div>';
  h += '<div class="mt-2"><span class="bill-badge ' + statusCls + '">' + (b.status === 'paid' ? 'PAID' : (overdue ? 'OVERDUE' : 'UNPAID')) + '</span></div>';
  h += '</div>';

  // Status selector
  h += '<div class="bp-row"><span class="bp-label">Status</span><select class="bp-status-select" onchange="setBillStatus(\'' + b.id + '\',this.value)">';
  h += '<option value="unpaid"' + (b.status === 'unpaid' ? ' selected' : '') + '>Unpaid</option>';
  h += '<option value="paid"' + (b.status === 'paid' ? ' selected' : '') + '>Paid</option>';
  h += '</select></div>';

  h += '<div class="bp-row"><span class="bp-label">Vendor</span><span class="bp-value">' + escH(b.vendor_name) + '</span></div>';
  if (b.bill_number) h += '<div class="bp-row"><span class="bp-label">Invoice #</span><span class="bp-value">' + escH(b.bill_number) + '</span></div>';
  h += '<div class="bp-row"><span class="bp-label">Amount</span><span class="bp-value" style="color:#dc2626;font-weight:700;">$' + parseFloat(b.amount).toFixed(2) + '</span></div>';
  h += '<div class="bp-row"><span class="bp-label">Bill Date</span><span class="bp-value">' + fmtDate(b.date) + '</span></div>';
  if (b.due_date) h += '<div class="bp-row"><span class="bp-label">Due Date</span><span class="bp-value" style="' + (overdue ? 'color:#dc2626;font-weight:700;' : '') + '">' + fmtDate(b.due_date) + (overdue ? ' (overdue)' : '') + '</span></div>';
  if (b.paid_date) h += '<div class="bp-row"><span class="bp-label">Paid Date</span><span class="bp-value" style="color:#16a34a;">' + fmtDate(b.paid_date) + '</span></div>';
  if (b.job_title) h += '<div class="bp-row"><span class="bp-label">Job</span><span class="bp-value">' + escH(b.job_title) + '</span></div>';
  if (b.description) h += '<div class="bp-row" style="flex-direction:column;gap:4px;"><span class="bp-label">Description</span><span class="bp-value" style="text-align:left;max-width:100%;margin-top:4px;color:#4b5563;">' + escH(b.description) + '</span></div>';

  // File attachment
  if (b.file_url) {
    h += '<div style="margin-top:20px;"><span class="bp-label">Attachment</span>';
    h += '<div style="margin-top:8px;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;position:relative;" class="dark:border-gray-700">';
    if (b.file_url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
      h += '<img src="' + escH(b.file_url) + '" style="width:100%;cursor:pointer;" onclick="window.open(\'' + escH(b.file_url) + '\',\'_blank\')" />';
    } else {
      h += '<a href="' + escH(b.file_url) + '" target="_blank" style="display:flex;align-items:center;gap:8px;padding:16px;color:#0d9488;font-size:14px;font-weight:600;text-decoration:none;"><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>View Document</a>';
    }
    h += '</div>';
    h += '<div style="margin-top:6px;display:flex;gap:8px;"><a href="' + escH(b.file_url) + '" target="_blank" download class="text-xs text-teal-600 hover:underline">Download</a><a href="' + escH(b.file_url) + '" target="_blank" class="text-xs text-gray-500 hover:underline">Open in new tab</a></div>';
    h += '</div>';
  } else {
    h += '<div style="margin-top:20px;text-align:center;padding:20px;background:#f9fafb;border-radius:8px;" class="dark:bg-gray-700/50"><p class="text-xs text-gray-400">No attachment</p></div>';
  }

  h += '</div>';
  h += '<div class="bp-actions"><button onclick="deleteBill(\'' + b.id + '\')" class="px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 bg-white dark:bg-gray-700 hover:bg-red-50 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">Delete Bill</button></div>';

  panel.innerHTML = h;
  document.body.appendChild(ov);
  document.body.appendChild(panel);
  requestAnimationFrame(function() { ov.classList.add('active'); panel.classList.add('active'); });
  document.addEventListener('keydown', _bpKeyFn);
};

function _bpKeyFn(e) { if (e.key === 'Escape') closeBillPanel(); }

window.closeBillPanel = function() {
  var ov = document.getElementById('bp-overlay');
  var panel = document.getElementById('bp-panel');
  if (ov) { ov.classList.remove('active'); }
  if (panel) { panel.classList.remove('active'); }
  setTimeout(function() { if (ov) ov.remove(); if (panel) panel.remove(); }, 300);
  document.removeEventListener('keydown', _bpKeyFn);
};

// ============ BUILD BILL ROW ============
function buildBillCard(b) {
  var overdue = isOverdue(b);
  var statusCls = b.status === 'paid' ? 'bill-badge-paid' : (overdue ? 'bill-badge-overdue' : 'bill-badge-unpaid');
  var statusText = b.status === 'paid' ? 'PAID' : (overdue ? 'OVERDUE' : 'UNPAID');

  var h = '<div class="bill-card" onclick="openBillPanel(\'' + b.id + '\')">';
  if (b.file_url) {
    h += '<div class="bill-thumb">';
    if (b.file_url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
      h += '<img src="' + escH(b.file_url) + '" />';
    } else {
      h += '<svg width="20" height="20" fill="none" stroke="#64748b" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>';
    }
    h += '</div>';
  }
  h += '<div style="flex:1;min-width:0;">';
  h += '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:14px;font-weight:700;color:#0f172a;" class="dark:text-white">' + escH(b.vendor_name) + '</span>';
  if (b.bill_number) h += '<span style="font-size:11px;color:#94a3b8;">#' + escH(b.bill_number) + '</span>';
  h += '</div>';
  if (b.job_title) h += '<div style="font-size:11px;color:#64748b;" class="dark:text-gray-400">' + escH(b.job_title) + '</div>';
  h += '</div>';
  if (b.due_date) h += '<div style="text-align:center;min-width:70px;"><div style="font-size:10px;color:#94a3b8;">Due</div><div style="font-size:12px;font-weight:500;color:' + (overdue ? '#dc2626' : '#374151') + ';" class="dark:text-gray-300">' + fmtDate(b.due_date) + '</div></div>';
  h += '<div style="text-align:right;min-width:80px;"><div style="font-size:16px;font-weight:700;color:#dc2626;">$' + parseFloat(b.amount).toFixed(2) + '</div></div>';
  h += '<span class="bill-badge ' + statusCls + '">' + statusText + '</span>';
  h += '</div>';
  return h;
}

// ============ INSTANT VIEW SWITCH (NO renderApp) ============
window.switchBillView = function(view) {
  _billView = view;

  // Update tab buttons
  var tabs = document.querySelectorAll('.bill-tab');
  tabs.forEach(function(t) {
    if (t.dataset.view === view) { t.classList.add('active'); } else { t.classList.remove('active'); }
  });

  // Update heading
  var h2 = document.querySelector('[data-bill-heading]');
  if (h2) {
    h2.textContent = view === 'bills' ? 'Bills' : 'Expenses';
    // Hide/show expenses total and subtitle (siblings of h2)
    var sib = h2.nextElementSibling;
    while (sib) {
      sib.style.display = (view === 'bills') ? 'none' : '';
      sib = sib.nextElementSibling;
    }
  }

  // Toggle content
  var expContent = document.getElementById('expenses-content-wrap');
  var billContent = document.getElementById('bills-content-wrap');

  if (view === 'bills') {
    if (expContent) expContent.style.display = 'none';
    if (!billContent) {
      buildBillsContent();
    } else {
      billContent.style.display = 'block';
    }
  } else {
    if (expContent) expContent.style.display = '';
    if (billContent) billContent.style.display = 'none';
  }
};

function refreshBillsBadge() {
  var unpaidCount = _bills.filter(function(b) { return b.status === 'unpaid'; }).length;
  var billTab = document.querySelector('.bill-tab[data-view="bills"]');
  if (billTab) {
    billTab.innerHTML = 'Bills' + (unpaidCount > 0 ? ' <span style="background:#fecaca;color:#dc2626;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:2px;">' + unpaidCount + '</span>' : '');
  }
}

function refreshBillsList() {
  var bc = document.getElementById('bills-content-wrap');
  if (bc) bc.remove();
  if (_billView === 'bills') buildBillsContent();
}

function buildBillsContent() {
  var existing = document.getElementById('bills-content-wrap');
  if (existing) existing.remove();

  var expContent = document.getElementById('expenses-content-wrap');
  var insertAfter = expContent || document.querySelector('[data-bill-heading]');
  if (!insertAfter) return;

  var unpaid = _bills.filter(function(b) { return b.status === 'unpaid'; });
  var paid = _bills.filter(function(b) { return b.status === 'paid'; });
  var totalUnpaid = unpaid.reduce(function(s, b) { return s + parseFloat(b.amount || 0); }, 0);
  var totalOverdue = unpaid.filter(isOverdue).length;

  var div = document.createElement('div');
  div.id = 'bills-content-wrap';

  var h = '';
  // Summary
  h += '<div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap;">';
  h += '<div style="padding:12px 20px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;flex:1;min-width:150px;" class="dark:bg-red-900/10 dark:border-red-900/30">';
  h += '<div style="font-size:11px;color:#dc2626;font-weight:600;text-transform:uppercase;">Outstanding</div>';
  h += '<div style="font-size:22px;font-weight:800;color:#dc2626;">$' + totalUnpaid.toFixed(2) + '</div>';
  h += '<div style="font-size:11px;color:#94a3b8;">' + unpaid.length + ' unpaid' + (totalOverdue > 0 ? ', ' + totalOverdue + ' overdue' : '') + '</div>';
  h += '</div></div>';

  if (_bills.length === 0) {
    h += '<div style="text-align:center;padding:48px;color:#94a3b8;"><div style="font-size:28px;margin-bottom:8px;">&#128196;</div><p style="font-size:14px;">No bills yet.</p><button onclick="openAddBillModal()" style="margin-top:12px;color:#0d9488;font-size:14px;font-weight:600;background:none;border:none;cursor:pointer;">+ Add Bill</button></div>';
  } else {
    if (unpaid.length > 0) {
      h += '<div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:8px;" class="dark:text-white">Unpaid (' + unpaid.length + ')</div>';
      for (var u = 0; u < unpaid.length; u++) h += buildBillCard(unpaid[u]);
    }
    if (paid.length > 0) {
      h += '<div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:16px;margin-bottom:8px;" class="dark:text-white">Paid (' + paid.length + ')</div>';
      for (var p = 0; p < paid.length; p++) h += buildBillCard(paid[p]);
    }
  }

  div.innerHTML = h;
  insertAfter.parentElement.insertBefore(div, insertAfter.nextSibling);
}

// ============ INJECT TAB BUTTONS ============
function injectBillsTabs() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'expenses') return;

  var expHeader = document.querySelector('h2.text-2xl');
  if (!expHeader) return;
  var hText = expHeader.textContent.trim();
  if (hText !== 'Expenses' && hText !== 'Bills') return;
  if (expHeader.dataset.billsReady) return;
  expHeader.dataset.billsReady = 'true';
  expHeader.setAttribute('data-bill-heading', '');

  // Set heading
  expHeader.textContent = _billView === 'bills' ? 'Bills' : 'Expenses';

  // Hide expenses total/subtitle when in bills view
  if (_billView === 'bills') {
    var sib = expHeader.nextElementSibling;
    while (sib) { sib.style.display = 'none'; sib = sib.nextElementSibling; }
  }

  var container = expHeader.closest('.flex') || expHeader.parentElement;
  if (!container) return;

  // Wrap all existing expense content
  var parent = container.parentElement;
  if (parent && !document.getElementById('expenses-content-wrap')) {
    var wrap = document.createElement('div');
    wrap.id = 'expenses-content-wrap';
    // Move all siblings after container into wrap
    var sibs = [];
    var sib = container.nextElementSibling;
    while (sib) { sibs.push(sib); sib = sib.nextElementSibling; }
    for (var s = 0; s < sibs.length; s++) wrap.appendChild(sibs[s]);
    parent.appendChild(wrap);
    if (_billView === 'bills') wrap.style.display = 'none';
  }

  // Find button area
  var btnRow = container.querySelector('.flex.flex-wrap') || container.querySelector('.flex.gap-2');
  if (!btnRow) btnRow = container;

  // Build tabs
  var unpaidCount = _bills.filter(function(b) { return b.status === 'unpaid'; }).length;
  var badge = unpaidCount > 0 ? ' <span style="background:#fecaca;color:#dc2626;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:2px;">' + unpaidCount + '</span>' : '';

  var tabDiv = document.createElement('div');
  tabDiv.style.cssText = 'display:flex;gap:4px;align-items:center;';
  tabDiv.innerHTML =
    '<button class="bill-tab' + (_billView === 'expenses' ? ' active' : '') + '" data-view="expenses" onclick="switchBillView(\'expenses\')">Expenses</button>' +
    '<button class="bill-tab' + (_billView === 'bills' ? ' active' : '') + '" data-view="bills" onclick="switchBillView(\'bills\')">Bills' + badge + '</button>';

  if (btnRow.firstChild) { btnRow.insertBefore(tabDiv, btnRow.firstChild); }
  else { btnRow.appendChild(tabDiv); }

  // Add Bill button
  var addBtn = document.createElement('button');
  addBtn.className = 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 px-3 sm:px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors';
  addBtn.textContent = '+ Add Bill';
  addBtn.setAttribute('onclick', 'openAddBillModal()');
  btnRow.appendChild(addBtn);

  // If bills view, build content
  if (_billView === 'bills') buildBillsContent();
}

// ============ JOB DETAIL BILLS ============
function injectJobBills() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'schedule') return;
  if (typeof selectedJobForDetail === 'undefined' || !selectedJobForDetail) return;
  var ts = document.getElementById('job-tasks-section');
  if (!ts || ts.dataset.billsDone) return;
  ts.dataset.billsDone = 'true';
  var jobId = selectedJobForDetail.id;
  var jb = _bills.filter(function(b) { return b.job_id === jobId; });
  var total = jb.reduce(function(s, b) { return s + parseFloat(b.amount || 0); }, 0);
  var unpaid = jb.filter(function(b) { return b.status === 'unpaid'; });

  var sec = document.createElement('div');
  sec.className = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6';
  sec.style.marginTop = '24px';
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h3 style="font-size:16px;font-weight:700;color:#0f172a;" class="dark:text-white">Bills</h3><div style="display:flex;align-items:center;gap:8px;">';
  if (jb.length > 0) h += '<span style="font-size:12px;color:#64748b;">' + jb.length + ' bills &middot; $' + total.toFixed(2) + (unpaid.length > 0 ? ' (' + unpaid.length + ' unpaid)' : '') + '</span>';
  h += '<button style="padding:6px 14px;font-size:12px;font-weight:600;background:#0d9488;color:#fff;border:none;border-radius:6px;cursor:pointer;" onclick="openAddBillModal(\'' + jobId + '\')">+ Add Bill</button></div></div>';
  if (jb.length > 0) { for (var i = 0; i < jb.length; i++) h += buildBillCard(jb[i]); }
  else { h += '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:13px;">No bills for this job yet</div>'; }
  sec.innerHTML = h;
  ts.parentElement.insertBefore(sec, ts.nextSibling);
}

// ============ DASHBOARD OVERDUE ============
function injectDashOverdue() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'dashboard') return;
  var overdue = _bills.filter(isOverdue);
  if (overdue.length === 0) return;
  var mg = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
  if (!mg || mg.dataset.billWarn) return;
  mg.dataset.billWarn = 'true';
  var total = overdue.reduce(function(s, b) { return s + parseFloat(b.amount || 0); }, 0);
  var w = document.createElement('div');
  w.style.cssText = 'margin-top:12px;padding:12px 16px;border-radius:10px;background:#fef2f2;border:1px solid #fecaca;display:flex;align-items:center;justify-content:space-between;cursor:pointer;';
  w.className = 'dark:bg-red-900/10 dark:border-red-900/30';
  w.setAttribute('onclick', "switchTab('expenses');setTimeout(function(){switchBillView('bills')},300)");
  w.innerHTML = '<div style="font-size:13px;font-weight:600;color:#dc2626;" class="dark:text-red-400">&#9888;&#65039; ' + overdue.length + ' overdue bill' + (overdue.length > 1 ? 's' : '') + ' &mdash; $' + total.toFixed(2) + ' outstanding</div><span style="font-size:12px;color:#dc2626;" class="dark:text-red-400">View &rarr;</span>';
  mg.parentElement.insertBefore(w, mg.nextSibling);
}

// ============ OBSERVER ============
var _bTimer = null;
var _bObs = new MutationObserver(function() {
  if (_bTimer) clearTimeout(_bTimer);
  _bTimer = setTimeout(async function() {
    if (!_billsLoaded) await loadBills();
    injectBillsTabs();
    injectJobBills();
    injectDashOverdue();
  }, 200);
});
_bObs.observe(document.body, { childList: true, subtree: true });

console.log('Bills v2 loaded');
} catch(e) { console.error('Bills init error:', e); }
})();
