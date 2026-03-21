// M4 Quote P&L Bills Box
// Adds a Bills card below Profit & Loss in quote detail
// Additive only
(function(){
try {

function fmt(n) {
  return '$' + parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function escH(s) {
  return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
}

async function injectBillsBox() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'quotes') return;
  if (typeof selectedQuoteForDetail === 'undefined' || !selectedQuoteForDetail) return;
  if (document.getElementById('quote-bills-box')) return;

  // Find P&L heading
  var plH3 = null;
  document.querySelectorAll('h3').forEach(function(h) {
    if (h.textContent.trim() === 'Profit & Loss Analysis') plH3 = h;
  });
  if (!plH3) return;

  // Walk up to find the card container
  var plCard = plH3.parentElement;
  while (plCard && !plCard.classList.contains('rounded-xl') && !plCard.classList.contains('shadow-sm')) {
    plCard = plCard.parentElement;
  }
  if (!plCard) plCard = plH3.parentElement;

  // Find related job
  var q = selectedQuoteForDetail;
  var relatedJob = jobs.find(function(j) {
    return j.title === q.title && j.client_id === q.client_id;
  });
  if (!relatedJob) {
    relatedJob = jobs.find(function(j) {
      return j.title && q.title && j.title.toLowerCase() === q.title.toLowerCase() && j.client_id === q.client_id;
    });
  }

  if (!relatedJob) return;

  // Load bills from Supabase
  var ownerId = (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : (currentUser ? currentUser.id : null);
  if (!ownerId) return;

  var result = await supabaseClient.from('bills').select('*').eq('user_id', ownerId).eq('job_id', relatedJob.id);
  var jobBills = result.data || [];

  if (jobBills.length === 0) return;

  var totalBills = jobBills.reduce(function(sum, b) { return sum + parseFloat(b.amount || 0); }, 0);
  var paidBills = jobBills.filter(function(b) { return b.status === 'paid'; });
  var unpaidBills = jobBills.filter(function(b) { return b.status !== 'paid'; });
  var totalUnpaid = unpaidBills.reduce(function(sum, b) { return sum + parseFloat(b.amount || 0); }, 0);

  var h = '';
  h += '<div id="quote-bills-box" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6" style="margin-top:16px;">';
  h += '<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bills / Supplier Invoices</h3>';

  // Summary bar
  h += '<div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap;">';
  h += '<div style="flex:1;min-width:120px;padding:12px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;" class="dark:bg-gray-700/50 dark:border-gray-600">';
  h += '<div style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;">Total Bills</div>';
  h += '<div style="font-size:20px;font-weight:800;color:#0f172a;" class="dark:text-white">' + fmt(totalBills) + '</div>';
  h += '</div>';
  if (unpaidBills.length > 0) {
    h += '<div style="flex:1;min-width:120px;padding:12px;background:#fef2f2;border-radius:10px;border:1px solid #fecaca;" class="dark:bg-red-900/20 dark:border-red-800">';
    h += '<div style="font-size:11px;color:#ef4444;font-weight:600;text-transform:uppercase;">Outstanding</div>';
    h += '<div style="font-size:20px;font-weight:800;color:#ef4444;">' + fmt(totalUnpaid) + '</div>';
    h += '</div>';
  }
  h += '<div style="flex:1;min-width:120px;padding:12px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;" class="dark:bg-green-900/20 dark:border-green-800">';
  h += '<div style="font-size:11px;color:#16a34a;font-weight:600;text-transform:uppercase;">Paid</div>';
  h += '<div style="font-size:20px;font-weight:800;color:#16a34a;">' + fmt(totalBills - totalUnpaid) + '</div>';
  h += '</div>';
  h += '</div>';

  // Bills list
  h += '<div style="border-top:1px solid #e2e8f0;" class="dark:border-gray-700">';
  jobBills.forEach(function(b) {
    var statusColor = b.status === 'paid' ? 'background:#d1fae5;color:#065f46;' : 'background:#fee2e2;color:#991b1b;';
    var statusLabel = b.status === 'paid' ? 'PAID' : 'UNPAID';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f3f4f6;" class="dark:border-gray-700">';
    h += '<div>';
    h += '<div style="font-size:14px;font-weight:600;color:#0f172a;" class="dark:text-white">' + escH(b.vendor_name) + '</div>';
    h += '<div style="font-size:12px;color:#64748b;">';
    if (b.bill_number) h += '#' + escH(b.bill_number) + ' &middot; ';
    if (b.date) h += b.date;
    if (b.due_date) h += ' &middot; Due: ' + b.due_date;
    h += '</div>';
    if (b.description) h += '<div style="font-size:11px;color:#94a3b8;margin-top:2px;">' + escH(b.description) + '</div>';
    h += '</div>';
    h += '<div style="display:flex;align-items:center;gap:12px;">';
    h += '<span style="font-size:14px;font-weight:700;color:#0f172a;" class="dark:text-white">' + fmt(b.amount) + '</span>';
    h += '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;' + statusColor + '">' + statusLabel + '</span>';
    h += '</div>';
    h += '</div>';
  });
  h += '</div>';

  // Impact on profit
  h += '<div style="margin-top:16px;padding:12px 16px;border-radius:10px;background:#fef3c7;border:1px solid #fde68a;" class="dark:bg-amber-900/20 dark:border-amber-800">';
  h += '<div style="font-size:12px;font-weight:600;color:#92400e;" class="dark:text-amber-400">These bills reduce your profit by ' + fmt(totalBills) + '</div>';
  h += '</div>';

  h += '</div>';

  // Insert after P&L card
  plCard.insertAdjacentHTML('afterend', h);
}

var _qbTimer = null;
var _qbObs = new MutationObserver(function() {
  if (_qbTimer) clearTimeout(_qbTimer);
  _qbTimer = setTimeout(injectBillsBox, 500);
});
_qbObs.observe(document.body, { childList: true, subtree: true });

console.log('Quote bills box loaded');

} catch(e) {
  console.error('Quote bills box error:', e);
}
})();
