// M4 Expense Quick View - Slide-in side panel
// Click any expense row to see full details + receipt photo
// Additive only
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'.exp-panel-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:55;opacity:0;transition:opacity 0.25s}',
'.exp-panel-overlay.active{opacity:1}',
'.exp-panel{position:fixed;top:0;right:-420px;width:400px;max-width:90vw;height:100vh;background:#fff;z-index:56;box-shadow:-4px 0 24px rgba(0,0,0,0.12);transition:right 0.3s ease;overflow-y:auto;display:flex;flex-direction:column}',
'.exp-panel.active{right:0}',
'.dark .exp-panel{background:#1f2937;box-shadow:-4px 0 24px rgba(0,0,0,0.4)}',
'.exp-panel-hd{padding:20px 24px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}',
'.dark .exp-panel-hd{border-bottom-color:#374151}',
'.exp-panel-body{padding:24px;flex:1;overflow-y:auto}',
'.exp-panel-row{display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f3f4f6}',
'.dark .exp-panel-row{border-bottom-color:#374151}',
'.exp-panel-label{font-size:12px;color:#6b7280;font-weight:500;text-transform:uppercase;letter-spacing:0.05em}',
'.dark .exp-panel-label{color:#9ca3af}',
'.exp-panel-value{font-size:14px;color:#1f2937;font-weight:500;text-align:right;max-width:60%}',
'.dark .exp-panel-value{color:#e5e7eb}',
'.exp-panel-receipt{margin-top:16px;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb}',
'.dark .exp-panel-receipt{border-color:#374151}',
'.exp-panel-receipt img{width:100%;cursor:pointer;transition:opacity 0.15s}',
'.exp-panel-receipt img:hover{opacity:0.9}',
'.exp-panel-actions{padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;gap:10px;flex-shrink:0}',
'.dark .exp-panel-actions{border-top-color:#374151}'
].join('\n');
document.head.appendChild(css);

function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function fmtDate(d) {
  if (!d) return '-';
  try {
    var dt = new Date(d);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return dt.getDate() + ' ' + months[dt.getMonth()] + ' ' + dt.getFullYear();
  } catch(e) { return d; }
}

function fmtCurrency(n) {
  var num = parseFloat(n) || 0;
  return '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ============ OPEN PANEL ============
window.openExpenseQuickView = function(expenseId) {
  var exp = null;
  for (var i = 0; i < expenses.length; i++) {
    if (expenses[i].id === expenseId) { exp = expenses[i]; break; }
  }
  if (!exp) return;

  // Close any existing
  closeExpenseQuickView();

  // Get related info
  var teamMember = null;
  if (exp.team_member_id) {
    for (var t = 0; t < teamMembers.length; t++) {
      if (teamMembers[t].id === exp.team_member_id) { teamMember = teamMembers[t]; break; }
    }
  }

  var jobDisplay = '-';
  var jobObj = null;
  if (exp.job_id) {
    for (var j = 0; j < jobs.length; j++) {
      if (jobs[j].id === exp.job_id) { jobObj = jobs[j]; break; }
    }
    if (jobObj) {
      var cl = null;
      for (var c = 0; c < clients.length; c++) {
        if (clients[c].id === jobObj.client_id) { cl = clients[c]; break; }
      }
      jobDisplay = jobObj.title + (cl ? ' - ' + cl.name : '');
    }
  } else if (exp.description) {
    var match = exp.description.match(/\[Related to: ([^\]]+)\]/);
    if (match) {
      jobDisplay = match[1].replace(/\s*\((?:Quote|Scheduled)\)\s*$/, '');
    }
  }

  // Clean description (remove [Related to:...] tag)
  var cleanDesc = (exp.description || '').replace(/\s*\[Related to:[^\]]+\]/, '').trim();

  // Category badge color
  var catColors = {
    'Materials': '#dbeafe;color:#1e40af',
    'Labour': '#fef3c7;color:#92400e',
    'Fuel': '#fee2e2;color:#991b1b',
    'Equipment': '#e0e7ff;color:#3730a3',
    'Subcontractors': '#fef3c7;color:#92400e',
    'Office Supplies': '#d1fae5;color:#065f46',
    'Insurance': '#fce7f3;color:#831843',
    'Marketing': '#e9d5ff;color:#581c87'
  };
  var catStyle = catColors[exp.category] || '#f3f4f6;color:#374151';

  // Build overlay
  var overlay = document.createElement('div');
  overlay.id = 'exp-panel-overlay';
  overlay.className = 'exp-panel-overlay';
  overlay.setAttribute('onclick', 'closeExpenseQuickView()');

  // Build panel
  var panel = document.createElement('div');
  panel.id = 'exp-panel';
  panel.className = 'exp-panel';

  var html = '';

  // Header
  html += '<div class="exp-panel-hd">';
  html += '<div>';
  html += '<h3 class="text-lg font-bold dark:text-white">Expense Details</h3>';
  html += '<p class="text-xs text-gray-400 dark:text-gray-500 mt-1">' + fmtDate(exp.date) + '</p>';
  html += '</div>';
  html += '<button onclick="closeExpenseQuickView()" class="text-2xl leading-none text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">&times;</button>';
  html += '</div>';

  // Body
  html += '<div class="exp-panel-body">';

  // Amount (big)
  html += '<div class="text-center mb-6">';
  html += '<div class="text-3xl font-bold text-red-600">' + fmtCurrency(exp.amount) + '</div>';
  html += '<span class="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full" style="background:' + catStyle + '">' + escH(exp.category) + '</span>';
  html += '</div>';

  // Details
  html += '<div class="exp-panel-row"><span class="exp-panel-label">Date</span><span class="exp-panel-value">' + fmtDate(exp.date) + '</span></div>';
  html += '<div class="exp-panel-row"><span class="exp-panel-label">Amount</span><span class="exp-panel-value text-red-600 font-semibold">' + fmtCurrency(exp.amount) + '</span></div>';
  html += '<div class="exp-panel-row"><span class="exp-panel-label">Category</span><span class="exp-panel-value">' + escH(exp.category) + '</span></div>';

  if (jobDisplay !== '-') {
    html += '<div class="exp-panel-row"><span class="exp-panel-label">Job / Quote</span><span class="exp-panel-value">' + escH(jobDisplay) + '</span></div>';
  }

  if (teamMember) {
    html += '<div class="exp-panel-row"><span class="exp-panel-label">Team Member</span><span class="exp-panel-value">';
    if (teamMember.color) {
      html += '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + teamMember.color + ';margin-right:6px;vertical-align:middle;"></span>';
    }
    html += escH(teamMember.name);
    if (teamMember.occupation) html += ' <span style="color:#9ca3af;font-weight:400;">(' + escH(teamMember.occupation) + ')</span>';
    html += '</span></div>';
  }

  if (cleanDesc) {
    html += '<div class="exp-panel-row" style="flex-direction:column;gap:4px;"><span class="exp-panel-label">Description</span><span class="exp-panel-value" style="text-align:left;max-width:100%;margin-top:4px;color:#4b5563;">' + escH(cleanDesc) + '</span></div>';
  }

  // Receipt photo
  if (exp.receipt_url) {
    html += '<div style="margin-top:20px;">';
    html += '<span class="exp-panel-label">Receipt</span>';
    html += '<div class="exp-panel-receipt" style="margin-top:8px;">';
    html += '<img src="' + escH(exp.receipt_url) + '" onclick="openExpReceiptPreview(\'' + escH(exp.receipt_url) + '\')" title="Click to enlarge" />';
    html += '</div>';
    html += '<div style="margin-top:8px;display:flex;gap:8px;">';
    html += '<a href="' + escH(exp.receipt_url) + '" target="_blank" download class="text-xs text-teal-600 dark:text-teal-400 hover:underline">Download</a>';
    html += '<a href="' + escH(exp.receipt_url) + '" target="_blank" class="text-xs text-gray-500 dark:text-gray-400 hover:underline">Open in new tab</a>';
    html += '</div>';
    html += '</div>';
  } else {
    html += '<div style="margin-top:20px;text-align:center;padding:20px;background:#f9fafb;border-radius:8px;" class="dark:bg-gray-700/50">';
    html += '<svg class="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>';
    html += '<p class="text-xs text-gray-400 dark:text-gray-500">No receipt attached</p>';
    html += '</div>';
  }

  // Created timestamp
  if (exp.created_at) {
    html += '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #f3f4f6;" class="dark:border-gray-700">';
    html += '<span class="text-xs text-gray-400 dark:text-gray-500">Added ' + fmtDate(exp.created_at) + '</span>';
    html += '</div>';
  }

  html += '</div>';

  // Action buttons
  html += '<div class="exp-panel-actions">';
  html += '<button onclick="editExpenseFromPanel(\'' + exp.id + '\')" class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors text-center">Edit</button>';
  html += '<button onclick="deleteExpenseFromPanel(\'' + exp.id + '\')" class="px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">Delete</button>';
  html += '</div>';

  panel.innerHTML = html;

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  // Animate in
  requestAnimationFrame(function() {
    overlay.classList.add('active');
    panel.classList.add('active');
  });

  // Keyboard close
  window._expPanelKeyFn = function(e) {
    if (e.key === 'Escape') closeExpenseQuickView();
  };
  document.addEventListener('keydown', window._expPanelKeyFn);
};

// ============ CLOSE PANEL ============
window.closeExpenseQuickView = function() {
  var overlay = document.getElementById('exp-panel-overlay');
  var panel = document.getElementById('exp-panel');
  if (overlay) { overlay.classList.remove('active'); }
  if (panel) { panel.classList.remove('active'); }
  setTimeout(function() {
    if (overlay) overlay.remove();
    if (panel) panel.remove();
  }, 300);
  if (window._expPanelKeyFn) {
    document.removeEventListener('keydown', window._expPanelKeyFn);
    window._expPanelKeyFn = null;
  }
};

// ============ PANEL ACTIONS ============
window.editExpenseFromPanel = function(expId) {
  var exp = null;
  for (var i = 0; i < expenses.length; i++) {
    if (expenses[i].id === expId) { exp = expenses[i]; break; }
  }
  if (!exp) return;
  closeExpenseQuickView();
  openModal('expense', exp);
};

window.deleteExpenseFromPanel = function(expId) {
  closeExpenseQuickView();
  deleteExpense(expId);
};

window.openExpReceiptPreview = function(url) {
  if (typeof openPhotoLightbox === 'function') {
    openPhotoLightbox([url], 0);
  } else {
    window.open(url, '_blank');
  }
};

// ============ INTERCEPT CLICKS ON EXPENSE ROWS ============
function addRowClicks() {
  // Desktop table rows
  var tables = document.querySelectorAll('.expenses-desktop-table tbody tr');
  for (var i = 0; i < tables.length; i++) {
    var row = tables[i];
    if (row.dataset.qvAdded) continue;
    // Skip the totals row
    if (row.querySelector('td[colspan]')) continue;

    // Find expense ID from the edit button onclick
    var editBtn = row.querySelector('button[onclick*="openModal"]');
    if (!editBtn) continue;
    var oc = editBtn.getAttribute('onclick') || '';
    var idMatch = oc.match(/"id"\s*:\s*"([^"]+)"/);
    if (!idMatch) continue;

    row.dataset.qvAdded = 'true';
    row.dataset.expId = idMatch[1];
    row.style.cursor = 'pointer';
    row.setAttribute('onclick', "expenseRowClicked(event, '" + idMatch[1] + "')");
  }

  // Mobile cards
  var cards = document.querySelectorAll('.expense-card');
  for (var c = 0; c < cards.length; c++) {
    var card = cards[c];
    if (card.dataset.qvAdded) continue;

    var editBtn2 = card.querySelector('button[onclick*="openModal"]');
    if (!editBtn2) continue;
    var oc2 = editBtn2.getAttribute('onclick') || '';
    var idMatch2 = oc2.match(/"id"\s*:\s*"([^"]+)"/);
    if (!idMatch2) continue;

    card.dataset.qvAdded = 'true';
    card.style.cursor = 'pointer';
    card.setAttribute('onclick', "expenseRowClicked(event, '" + idMatch2[1] + "')");
  }
}

window.expenseRowClicked = function(event, expId) {
  // Don't open panel if user clicked checkbox, edit, delete, or a link
  var target = event.target;
  if (target.tagName === 'INPUT') return;
  if (target.tagName === 'A') return;
  if (target.tagName === 'BUTTON' || target.closest('button')) return;

  event.stopPropagation();
  openExpenseQuickView(expId);
};

// ============ OBSERVER ============
var _expQvTimer = null;
var _expQvObs = new MutationObserver(function() {
  if (_expQvTimer) clearTimeout(_expQvTimer);
  _expQvTimer = setTimeout(addRowClicks, 200);
});
_expQvObs.observe(document.body, { childList: true, subtree: true });

console.log('Expense quick view loaded');

} catch(e) {
  console.error('Expense quick view init error:', e);
}
})();
