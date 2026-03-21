// M4 Quote P&L Bills Enhancement
// Injects bills data into quote detail P&L section
// Additive only
(function(){
try {

function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatCurrency(n) {
  return '$' + parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function enhanceQuotePL() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'quotes') return;

  // Find the P&L section
  var plHeading = null;
  var headings = document.querySelectorAll('h3');
  headings.forEach(function(h) {
    if (h.textContent.trim() === 'Profit & Loss Analysis') plHeading = h;
  });
  if (!plHeading) return;

  var plCard = plHeading.closest('.bg-white, .dark\\:bg-gray-800');
  if (!plCard || plCard.dataset.billsAdded) return;
  plCard.dataset.billsAdded = 'true';

  // Find which quote we're viewing
  if (typeof selectedQuoteForDetail === 'undefined' || !selectedQuoteForDetail) return;
  var q = selectedQuoteForDetail;

  // Find related job (same logic as quotes.js)
  var relatedJob = jobs.find(function(j) {
    return j.title === q.title && j.client_id === q.client_id;
  });
  if (!relatedJob) {
    relatedJob = jobs.find(function(j) {
      return j.title && q.title && j.title.toLowerCase() === q.title.toLowerCase() && j.client_id === q.client_id;
    });
  }

  // Load bills for this job
  var jobBills = [];
  if (relatedJob) {
    // Check if _bills is accessible
    if (typeof _bills !== 'undefined') {
      jobBills = _bills.filter(function(b) { return b.job_id === relatedJob.id; });
    }
  }

  // If no bills from local, try to find via Supabase query
  if (jobBills.length === 0 && relatedJob) {
    // Use async approach
    loadBillsForJob(relatedJob.id, plCard, q);
    return;
  }

  if (jobBills.length > 0) {
    injectBillsIntoPI(plCard, jobBills, q);
  }
}

async function loadBillsForJob(jobId, plCard, quote) {
  try {
    var ownerId = (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : (currentUser ? currentUser.id : null);
    if (!ownerId) return;

    var r = await supabaseClient.from('bills').select('*').eq('user_id', ownerId).eq('job_id', jobId);
    var jobBills = r.data || [];

    if (jobBills.length > 0) {
      injectBillsIntoPI(plCard, jobBills, quote);
    }
  } catch(e) {
    console.error('Error loading bills for quote P&L:', e);
  }
}

function injectBillsIntoPI(plCard, jobBills, quote) {
  if (plCard.dataset.billsInjected) return;
  plCard.dataset.billsInjected = 'true';

  var totalBills = jobBills.reduce(function(sum, b) { return sum + parseFloat(b.amount || 0); }, 0);

  // Find the "Total Expenses" row to insert after
  var rows = plCard.querySelectorAll('.flex.justify-between');
  var expenseRow = null;
  var detailsEl = null;
  rows.forEach(function(row) {
    var label = row.querySelector('.text-gray-600, .dark\\:text-gray-400');
    if (label && label.textContent.trim() === 'Total Expenses:') expenseRow = row;
  });

  // Also check for the details/expandable expenses
  detailsEl = plCard.querySelector('details');

  // Build bills row
  var billsRow = document.createElement('div');
  billsRow.className = 'flex justify-between py-2 border-b border-gray-100 dark:border-gray-700';
  billsRow.innerHTML = '<span class="text-sm text-gray-600 dark:text-gray-400">Bills (Subcontractors):</span><span class="text-sm font-medium text-red-600 dark:text-red-400">' + formatCurrency(totalBills) + '</span>';

  // Build expandable bill details
  var billDetails = document.createElement('div');
  billDetails.className = 'mt-2 mb-2 pl-4';
  var detailsH = '<details class="text-xs text-gray-500 dark:text-gray-400"><summary class="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Show ' + jobBills.length + ' bill' + (jobBills.length > 1 ? 's' : '') + '</summary><div class="mt-2 space-y-1 pl-2">';
  jobBills.forEach(function(b) {
    var statusBadge = b.status === 'paid'
      ? '<span style="font-size:9px;padding:1px 6px;border-radius:10px;background:#d1fae5;color:#065f46;margin-left:6px;">PAID</span>'
      : '<span style="font-size:9px;padding:1px 6px;border-radius:10px;background:#fee2e2;color:#991b1b;margin-left:6px;">UNPAID</span>';
    detailsH += '<div class="flex justify-between py-1"><span>' + escH(b.vendor_name) + (b.bill_number ? ' #' + escH(b.bill_number) : '') + statusBadge + '</span><span class="font-medium">' + formatCurrency(b.amount) + '</span></div>';
  });
  detailsH += '</div></details>';
  billDetails.innerHTML = detailsH;

  // Insert after expense row or details
  var insertAfter = detailsEl || expenseRow;
  if (insertAfter && insertAfter.parentElement) {
    insertAfter.parentElement.insertBefore(billsRow, insertAfter.nextSibling);
    billsRow.parentElement.insertBefore(billDetails, billsRow.nextSibling);
  }

  // Update the Net Profit calculation
  var revenue = parseFloat(quote.total || 0);
  var expenseText = expenseRow ? expenseRow.querySelector('.text-red-600, .dark\\:text-red-400') : null;
  var currentExpenses = expenseText ? parseFloat(expenseText.textContent.replace(/[^0-9.-]/g, '')) : 0;
  var totalCosts = currentExpenses + totalBills;
  var newProfit = revenue - totalCosts;
  var newMargin = revenue > 0 ? ((newProfit / revenue) * 100).toFixed(1) : 0;

  // Find and update profit row
  var profitRow = plCard.querySelector('.bg-teal-50, .bg-red-50');
  if (profitRow) {
    var profitVal = profitRow.querySelector('.text-lg.font-bold');
    var marginVal = profitRow.querySelector('.text-xs');
    if (profitVal) {
      profitVal.textContent = formatCurrency(newProfit);
      profitVal.className = 'text-lg font-bold ' + (newProfit >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-red-700 dark:text-red-400');
    }
    if (marginVal) {
      marginVal.textContent = '(' + newMargin + '% margin)';
    }
    profitRow.className = profitRow.className.replace(/bg-teal-50|bg-red-50/g, '') + ' ' + (newProfit >= 0 ? 'bg-teal-50' : 'bg-red-50');
  }

  // Add a "Total Costs" summary row before profit
  if (totalBills > 0 && profitRow) {
    var costsRow = document.createElement('div');
    costsRow.className = 'flex justify-between py-2 border-b border-gray-100 dark:border-gray-700';
    costsRow.innerHTML = '<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Total Costs (Expenses + Bills):</span><span class="text-sm font-bold text-red-600 dark:text-red-400">' + formatCurrency(totalCosts) + '</span>';
    profitRow.parentElement.insertBefore(costsRow, profitRow);
  }
}

// ============ OBSERVER ============
var _qplTimer = null;
var _qplObs = new MutationObserver(function() {
  if (_qplTimer) clearTimeout(_qplTimer);
  _qplTimer = setTimeout(enhanceQuotePL, 300);
});
_qplObs.observe(document.body, { childList: true, subtree: true });

console.log('Quote P&L bills enhancement loaded');

} catch(e) {
  console.error('Quote P&L bills error:', e);
}
})();
