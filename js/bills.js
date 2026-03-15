// M4 Bills / Accounts Payable
// Upload subcontractor invoices, track paid/unpaid, link to jobs
// Additive only
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'.bill-tab-active{padding:8px 16px;font-size:13px;font-weight:600;border-radius:6px;cursor:pointer;border:1px solid #2dd4bf;background:#fff;color:#0f172a;box-shadow:0 0 10px rgba(45,212,191,0.5);font-family:inherit;transition:all 0.15s}',
'.dark .bill-tab-active{background:#374151;color:#e2e8f0}',
'.bill-tab-inactive{padding:8px 16px;font-size:13px;font-weight:600;border-radius:6px;cursor:pointer;border:1px solid #d1d5db;background:#fff;color:#0f172a;font-family:inherit;transition:all 0.15s}',
'.bill-tab-inactive:hover{border-color:#2dd4bf}',
'.dark .bill-tab-inactive{background:#374151;color:#e2e8f0;border-color:#4b5563}',
'',
'.bill-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;transition:all 0.15s;cursor:pointer}',
'.bill-card:hover{border-color:#99f6e4;box-shadow:0 4px 12px rgba(0,0,0,0.05)}',
'.dark .bill-card{background:#1f2937;border-color:#374151}',
'.dark .bill-card:hover{border-color:#2dd4bf}',
'',
'.bill-status{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em}',
'.bill-status-unpaid{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}',
'.dark .bill-status-unpaid{background:rgba(220,38,38,0.1);border-color:rgba(220,38,38,0.3)}',
'.bill-status-paid{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}',
'.dark .bill-status-paid{background:rgba(22,163,74,0.1);border-color:rgba(22,163,74,0.3)}',
'.bill-status-overdue{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;animation:tc-pulse 2s infinite}',
'',
'.bill-file-thumb{width:40px;height:40px;border-radius:8px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;border:1px solid #e2e8f0}',
'.dark .bill-file-thumb{background:#374151;border-color:#4b5563}',
'.bill-file-thumb:hover{border-color:#0d9488}',
'.bill-file-thumb img{width:100%;height:100%;object-fit:cover;border-radius:7px}'
].join('\n');
document.head.appendChild(css);

// ============ STATE ============
var _bills = [];
var _billsLoaded = false;
var _billView = 'expenses'; // 'expenses' or 'bills'

// ============ HELPERS ============
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

function isOverdue(bill) {
  if (bill.status === 'paid' || !bill.due_date) return false;
  var today = new Date(); today.setHours(0,0,0,0);
  var due = new Date(bill.due_date + 'T00:00:00');
  return due < today;
}

// ============ LOAD BILLS ============
async function loadBills() {
  if (_billsLoaded) return;
  try {
    var ownerId = getOwnerId();
    if (!ownerId) return;
    var result = await supabaseClient
      .from('bills')
      .select('*')
      .eq('user_id', ownerId)
      .order('created_at', { ascending: false });
    if (result.error) throw result.error;
    _bills = result.data || [];
    _billsLoaded = true;
  } catch (err) {
    console.error('Error loading bills:', err);
  }
}

// ============ ADD BILL MODAL ============
window.openAddBillModal = function(preselectedJobId) {
  if (document.getElementById('bill-modal')) return;

  var jobOptions = '<option value="">No specific job</option>';
  for (var i = 0; i < jobs.length; i++) {
    var j = jobs[i];
    var cl = null;
    for (var c = 0; c < clients.length; c++) { if (clients[c].id === j.client_id) { cl = clients[c]; break; } }
    var sel = (preselectedJobId && j.id === preselectedJobId) ? ' selected' : '';
    jobOptions += '<option value="' + j.id + '"' + sel + '>' + escH(j.title) + (cl ? ' - ' + escH(cl.name) : '') + '</option>';
  }

  var today = new Date().toISOString().split('T')[0];

  var overlay = document.createElement('div');
  overlay.id = 'bill-modal';
  overlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50';
  overlay.setAttribute('onclick', 'if(event.target===this)closeBillModal()');

  overlay.innerHTML =
    '<div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full" style="max-height:90vh;overflow-y:auto;">' +
      '<div class="flex justify-between mb-4">' +
        '<h3 class="text-xl font-bold dark:text-white">Add Bill</h3>' +
        '<button onclick="closeBillModal()" class="text-2xl leading-none dark:text-gray-300">&times;</button>' +
      '</div>' +

      '<div class="mb-3">' +
        '<label class="block text-sm font-medium mb-1 dark:text-gray-200">Vendor / Supplier *</label>' +
        '<input type="text" id="bill-vendor" placeholder="e.g. Bunnings, subcontractor name" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">' +
      '</div>' +

      '<div class="mb-3">' +
        '<label class="block text-sm font-medium mb-1 dark:text-gray-200">Their Invoice Number</label>' +
        '<input type="text" id="bill-number" placeholder="INV-001" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">' +
      '</div>' +

      '<div class="grid grid-cols-2 gap-3 mb-3">' +
        '<div>' +
          '<label class="block text-sm font-medium mb-1 dark:text-gray-200">Amount *</label>' +
          '<input type="number" id="bill-amount" placeholder="0.00" step="0.01" min="0" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">' +
        '</div>' +
        '<div>' +
          '<label class="block text-sm font-medium mb-1 dark:text-gray-200">Bill Date *</label>' +
          '<input type="date" id="bill-date" value="' + today + '" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">' +
        '</div>' +
      '</div>' +

      '<div class="mb-3">' +
        '<label class="block text-sm font-medium mb-1 dark:text-gray-200">Due Date</label>' +
        '<input type="date" id="bill-due-date" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">' +
      '</div>' +

      '<div class="mb-3">' +
        '<label class="block text-sm font-medium mb-1 dark:text-gray-200">Related Job</label>' +
        '<select id="bill-job" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">' + jobOptions + '</select>' +
      '</div>' +

      '<div class="mb-3">' +
        '<label class="block text-sm font-medium mb-1 dark:text-gray-200">Description</label>' +
        '<textarea id="bill-description" rows="2" placeholder="What is this bill for?" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"></textarea>' +
      '</div>' +

      '<div class="mb-4">' +
        '<label class="block text-sm font-medium mb-1 dark:text-gray-200">Upload Invoice Copy</label>' +
        '<div id="bill-file-area">' +
          '<label class="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-teal-400 text-sm text-gray-500 dark:text-gray-400">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' +
            'Upload photo or PDF' +
            '<input type="file" accept="image/*,.pdf" id="bill-file-input" onchange="onBillFileSelected(this)" class="hidden" />' +
          '</label>' +
        '</div>' +
        '<input type="hidden" id="bill-file-url" />' +
      '</div>' +

      '<button onclick="saveBill()" class="w-full bg-black text-white px-4 py-2.5 rounded-lg border border-teal-400 font-medium">Add Bill</button>' +
    '</div>';

  document.body.appendChild(overlay);
};

window.closeBillModal = function() {
  var m = document.getElementById('bill-modal');
  if (m) m.remove();
};

window.onBillFileSelected = async function(input) {
  var file = input.files[0];
  if (!file) return;

  var area = document.getElementById('bill-file-area');
  if (area) area.innerHTML = '<div class="text-sm text-gray-500 text-center py-2">Uploading...</div>';

  try {
    var ext = file.name.split('.').pop();
    var fname = 'bill-' + Date.now() + '.' + ext;
    var sc = typeof supabaseClient !== 'undefined' ? supabaseClient : supabase;

    var uploadResult = await sc.storage.from('job-photos').upload('bills/' + fname, file);
    if (uploadResult.error) throw uploadResult.error;

    var urlResult = sc.storage.from('job-photos').getPublicUrl('bills/' + fname);
    var url = urlResult.data ? urlResult.data.publicUrl : null;

    var hidden = document.getElementById('bill-file-url');
    if (hidden) hidden.value = url || '';

    if (area) {
      area.innerHTML = '<div class="flex items-center gap-2 p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">' +
        '<svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' +
        '<span class="text-sm text-teal-700 dark:text-teal-400 font-medium">' + escH(file.name) + '</span>' +
      '</div>';
    }
  } catch (err) {
    console.error('Error uploading bill file:', err);
    if (area) area.innerHTML = '<div class="text-sm text-red-500">Upload failed. Try again.</div>';
  }
};

window.saveBill = async function() {
  var vendor = document.getElementById('bill-vendor');
  var amount = document.getElementById('bill-amount');
  var date = document.getElementById('bill-date');
  var dueDate = document.getElementById('bill-due-date');
  var jobEl = document.getElementById('bill-job');
  var billNum = document.getElementById('bill-number');
  var desc = document.getElementById('bill-description');
  var fileUrl = document.getElementById('bill-file-url');

  if (!vendor || !vendor.value.trim() || !amount || !parseFloat(amount.value) || !date || !date.value) {
    showNotification('Please fill in vendor, amount, and date', 'error');
    return;
  }

  var jobId = (jobEl && jobEl.value) ? jobEl.value : null;
  var jobTitle = null;
  if (jobId) {
    for (var i = 0; i < jobs.length; i++) {
      if (jobs[i].id === jobId) { jobTitle = jobs[i].title; break; }
    }
  }

  try {
    var bill = {
      user_id: getOwnerId(),
      vendor_name: vendor.value.trim(),
      bill_number: billNum ? billNum.value.trim() : null,
      amount: parseFloat(amount.value),
      date: date.value,
      due_date: (dueDate && dueDate.value) ? dueDate.value : null,
      status: 'unpaid',
      job_id: jobId,
      job_title: jobTitle,
      description: desc ? desc.value.trim() : null,
      file_url: (fileUrl && fileUrl.value) ? fileUrl.value : null
    };

    var result = await supabaseClient.from('bills').insert([bill]).select();
    if (result.error) throw result.error;

    if (result.data && result.data[0]) _bills.unshift(result.data[0]);
    closeBillModal();
    showNotification('Bill added - $' + parseFloat(amount.value).toFixed(2) + ' from ' + vendor.value.trim(), 'success');
    renderApp();
  } catch (err) {
    console.error('Error saving bill:', err);
    showNotification('Error: ' + err.message, 'error');
  }
};

// ============ TOGGLE BILL STATUS ============
window.toggleBillStatus = async function(billId) {
  var bill = null;
  for (var i = 0; i < _bills.length; i++) { if (_bills[i].id === billId) { bill = _bills[i]; break; } }
  if (!bill) return;

  var newStatus = bill.status === 'paid' ? 'unpaid' : 'paid';
  var paidDate = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null;

  try {
    var result = await supabaseClient.from('bills').update({ status: newStatus, paid_date: paidDate }).eq('id', billId);
    if (result.error) throw result.error;
    bill.status = newStatus;
    bill.paid_date = paidDate;
    showNotification('Bill marked as ' + newStatus, 'success');
    renderApp();
  } catch (err) {
    console.error('Error updating bill:', err);
    showNotification('Error: ' + err.message, 'error');
  }
};

window.deleteBill = async function(billId) {
  if (!confirm('Delete this bill?')) return;
  try {
    var result = await supabaseClient.from('bills').delete().eq('id', billId);
    if (result.error) throw result.error;
    _bills = _bills.filter(function(b) { return b.id !== billId; });
    showNotification('Bill deleted', 'success');
    renderApp();
  } catch (err) {
    console.error('Error deleting bill:', err);
  }
};

// ============ BUILD BILL ROW ============
function buildBillRow(b) {
  var overdue = isOverdue(b);
  var statusCls = b.status === 'paid' ? 'bill-status-paid' : (overdue ? 'bill-status-overdue' : 'bill-status-unpaid');
  var statusText = b.status === 'paid' ? 'PAID' : (overdue ? 'OVERDUE' : 'UNPAID');

  var h = '<div class="bill-card" style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">';

  // File thumbnail
  if (b.file_url) {
    h += '<div class="bill-file-thumb" onclick="event.stopPropagation();window.open(\'' + escH(b.file_url) + '\',\'_blank\')">';
    if (b.file_url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
      h += '<img src="' + escH(b.file_url) + '" />';
    } else {
      h += '<svg width="20" height="20" fill="none" stroke="#64748b" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>';
    }
    h += '</div>';
  }

  // Info
  h += '<div style="flex:1;min-width:0;">';
  h += '<div style="display:flex;align-items:center;gap:8px;">';
  h += '<span style="font-size:14px;font-weight:700;color:#0f172a;" class="dark:text-white">' + escH(b.vendor_name) + '</span>';
  if (b.bill_number) h += '<span style="font-size:11px;color:#94a3b8;">#' + escH(b.bill_number) + '</span>';
  h += '</div>';
  if (b.job_title) h += '<div style="font-size:11px;color:#64748b;" class="dark:text-gray-400">' + escH(b.job_title) + '</div>';
  if (b.description) h += '<div style="font-size:11px;color:#94a3b8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" class="dark:text-gray-500">' + escH(b.description) + '</div>';
  h += '</div>';

  // Due date
  if (b.due_date) {
    h += '<div style="text-align:center;min-width:70px;">';
    h += '<div style="font-size:10px;color:#94a3b8;">Due</div>';
    h += '<div style="font-size:12px;font-weight:500;color:' + (overdue ? '#dc2626' : '#374151') + ';" class="dark:text-gray-300">' + fmtDate(b.due_date) + '</div>';
    h += '</div>';
  }

  // Amount
  h += '<div style="text-align:right;min-width:80px;">';
  h += '<div style="font-size:16px;font-weight:700;color:#dc2626;">$' + parseFloat(b.amount).toFixed(2) + '</div>';
  h += '</div>';

  // Status toggle
  h += '<button class="bill-status ' + statusCls + '" onclick="event.stopPropagation();toggleBillStatus(\'' + b.id + '\')" title="Click to toggle">' + statusText + '</button>';

  // Delete
  h += '<button onclick="event.stopPropagation();deleteBill(\'' + b.id + '\')" title="Delete" style="background:none;border:none;cursor:pointer;color:#94a3b8;padding:2px;" onmouseenter="this.style.color=\'#ef4444\'" onmouseleave="this.style.color=\'#94a3b8\'"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>';

  h += '</div>';
  return h;
}

// ============ INJECT BILLS TOGGLE INTO EXPENSES TAB ============
function injectBillsToggle() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'expenses') return;

  var expHeader = document.querySelector('h2.text-2xl');
  if (!expHeader) return;
  var hText = expHeader.textContent.trim();
  if (hText !== 'Expenses' && hText !== 'Bills') return;
  if (expHeader.dataset.billsAdded) return;
  expHeader.dataset.billsAdded = 'true';

  // Update heading
  expHeader.textContent = _billView === 'bills' ? 'Bills' : 'Expenses';

  var container = expHeader.closest('.flex') || expHeader.parentElement;
  if (!container) return;

  // Find the buttons row
  var btnRow = container.querySelector('.flex.flex-wrap') || container.querySelector('.flex.gap-2');
  if (!btnRow) btnRow = container;

  // Build toggle matching Schedule view style
  var expCls = _billView === 'expenses' ? 'bill-tab-active' : 'bill-tab-inactive';
  var billCls = _billView === 'bills' ? 'bill-tab-active' : 'bill-tab-inactive';
  var unpaidCount = _bills.filter(function(b){ return b.status === 'unpaid'; }).length;
  var badge = unpaidCount > 0 ? ' <span style="background:#fecaca;color:#dc2626;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;margin-left:2px;">' + unpaidCount + '</span>' : '';

  var toggleDiv = document.createElement('div');
  toggleDiv.style.cssText = 'display:flex;gap:4px;align-items:center;';
  toggleDiv.innerHTML =
    '<button class="' + expCls + '" onclick="switchBillView(\'expenses\')">Expenses</button>' +
    '<button class="' + billCls + '" onclick="switchBillView(\'bills\')">Bills' + badge + '</button>';

  // Insert toggle as first item
  if (btnRow.firstChild) {
    btnRow.insertBefore(toggleDiv, btnRow.firstChild);
  } else {
    btnRow.appendChild(toggleDiv);
  }

  // Add "+ Add Bill" button at end
  var addBillBtn = document.createElement('button');
  addBillBtn.className = 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 px-3 sm:px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors';
  addBillBtn.textContent = '+ Add Bill';
  addBillBtn.setAttribute('onclick', 'openAddBillModal()');
  btnRow.appendChild(addBillBtn);

  // If viewing bills, hide expenses and show bills
  if (_billView === 'bills') {
    showBillsList();
  }
}

window.switchBillView = function(view) {
  _billView = view;
  renderApp();
};

function showBillsList() {
  var existing = document.getElementById('bills-list-container');
  if (existing) return;

  // Find the expenses header and hide all content below it
  var expHeader = document.querySelector('h2.text-2xl');
  if (!expHeader) return;
  var headerRow = expHeader.closest('.flex') || expHeader.parentElement;
  if (!headerRow) return;
  var parent = headerRow.parentElement;
  if (!parent) return;

  // Hide every sibling after the header row
  var sibling = headerRow.nextElementSibling;
  while (sibling) {
    if (sibling.id !== 'bills-list-container') {
      sibling.style.display = 'none';
    }
    sibling = sibling.nextElementSibling;
  }

  var billsDiv = document.createElement('div');
  billsDiv.id = 'bills-list-container';

  var unpaid = _bills.filter(function(b) { return b.status === 'unpaid'; });
  var paid = _bills.filter(function(b) { return b.status === 'paid'; });
  var totalUnpaid = unpaid.reduce(function(s, b) { return s + parseFloat(b.amount || 0); }, 0);
  var totalOverdue = unpaid.filter(isOverdue).length;

  var h = '';

  // Summary
  h += '<div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap;">';
  h += '<div style="padding:12px 20px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;flex:1;min-width:150px;" class="dark:bg-red-900/10 dark:border-red-900/30">';
  h += '<div style="font-size:11px;color:#dc2626;font-weight:600;text-transform:uppercase;">Outstanding</div>';
  h += '<div style="font-size:22px;font-weight:800;color:#dc2626;">$' + totalUnpaid.toFixed(2) + '</div>';
  h += '<div style="font-size:11px;color:#94a3b8;">' + unpaid.length + ' unpaid' + (totalOverdue > 0 ? ', ' + totalOverdue + ' overdue' : '') + '</div>';
  h += '</div>';
  h += '</div>';

  if (_bills.length === 0) {
    h += '<div style="text-align:center;padding:48px;color:#94a3b8;">';
    h += '<div style="font-size:28px;margin-bottom:8px;">&#128196;</div>';
    h += '<p style="font-size:14px;">No bills yet. Add your first bill from a supplier or subcontractor.</p>';
    h += '<button onclick="openAddBillModal()" style="margin-top:12px;color:#0d9488;font-size:14px;font-weight:600;background:none;border:none;cursor:pointer;">+ Add Bill</button>';
    h += '</div>';
  } else {
    if (unpaid.length > 0) {
      h += '<div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:8px;" class="dark:text-white">Unpaid (' + unpaid.length + ')</div>';
      for (var u = 0; u < unpaid.length; u++) h += buildBillRow(unpaid[u]);
    }
    if (paid.length > 0) {
      h += '<div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:16px;margin-bottom:8px;" class="dark:text-white">Paid (' + paid.length + ')</div>';
      for (var p = 0; p < paid.length; p++) h += buildBillRow(paid[p]);
    }
  }

  billsDiv.innerHTML = h;
  parent.appendChild(billsDiv);
}

// ============ BILLS IN JOB DETAIL ============
function injectJobDetailBills() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'schedule') return;
  if (typeof selectedJobForDetail === 'undefined' || !selectedJobForDetail) return;

  var jobId = selectedJobForDetail.id;
  var taskSection = document.getElementById('job-tasks-section');
  if (!taskSection) return;
  if (taskSection.dataset.billsAdded) return;
  taskSection.dataset.billsAdded = 'true';

  var jobBills = _bills.filter(function(b) { return b.job_id === jobId; });

  var section = document.createElement('div');
  section.className = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6';
  section.style.marginTop = '24px';

  var totalBills = jobBills.reduce(function(s, b) { return s + parseFloat(b.amount || 0); }, 0);
  var unpaidBills = jobBills.filter(function(b) { return b.status === 'unpaid'; });

  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
  h += '<h3 style="font-size:16px;font-weight:700;color:#0f172a;" class="dark:text-white">Bills</h3>';
  h += '<div style="display:flex;align-items:center;gap:8px;">';
  if (jobBills.length > 0) h += '<span style="font-size:12px;color:#64748b;">' + jobBills.length + ' bills &middot; $' + totalBills.toFixed(2) + (unpaidBills.length > 0 ? ' (' + unpaidBills.length + ' unpaid)' : '') + '</span>';
  h += '<button class="tc-btn-sm" style="background:#0d9488;color:#fff;" onclick="openAddBillModal(\'' + jobId + '\')">+ Add Bill</button>';
  h += '</div></div>';

  if (jobBills.length > 0) {
    for (var i = 0; i < jobBills.length; i++) h += buildBillRow(jobBills[i]);
  } else {
    h += '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:13px;">No bills for this job yet</div>';
  }

  section.innerHTML = h;
  taskSection.parentElement.insertBefore(section, taskSection.nextSibling);
}

// ============ OVERDUE BILLS ON DASHBOARD ============
function injectDashboardOverdue() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'dashboard') return;

  var overdueBills = _bills.filter(isOverdue);
  if (overdueBills.length === 0) return;

  var metricsGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
  if (!metricsGrid || metricsGrid.dataset.billsWarning) return;
  metricsGrid.dataset.billsWarning = 'true';

  var total = overdueBills.reduce(function(s, b) { return s + parseFloat(b.amount || 0); }, 0);

  var warning = document.createElement('div');
  warning.style.cssText = 'margin-top:12px;padding:12px 16px;border-radius:10px;background:#fef2f2;border:1px solid #fecaca;display:flex;align-items:center;justify-content:space-between;cursor:pointer;';
  warning.className = 'dark:bg-red-900/10 dark:border-red-900/30';
  warning.setAttribute('onclick', "switchTab('expenses');setTimeout(function(){switchBillView('bills')},300)");
  warning.innerHTML =
    '<div style="font-size:13px;font-weight:600;color:#dc2626;" class="dark:text-red-400">&#9888;&#65039; ' + overdueBills.length + ' overdue bill' + (overdueBills.length > 1 ? 's' : '') + ' &mdash; $' + total.toFixed(2) + ' outstanding</div>' +
    '<span style="font-size:12px;color:#dc2626;font-weight:500;" class="dark:text-red-400">View &rarr;</span>';

  metricsGrid.parentElement.insertBefore(warning, metricsGrid.nextSibling);
}

// ============ OBSERVER ============
var _billTimer = null;
var _billObs = new MutationObserver(function() {
  if (_billTimer) clearTimeout(_billTimer);
  _billTimer = setTimeout(async function() {
    if (!_billsLoaded) await loadBills();
    injectBillsToggle();
    injectJobDetailBills();
    injectDashboardOverdue();
  }, 200);
});
_billObs.observe(document.body, { childList: true, subtree: true });

console.log('Bills module loaded');

} catch(e) {
  console.error('Bills init error:', e);
}
})();
