// M4 Quote Bills Box - below P&L in quote detail
// Additive only
(function(){
try {

function fmt(n) { return '$' + parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function esc(s) { return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }

async function inject() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'quotes') return;
  if (typeof selectedQuoteForDetail === 'undefined' || !selectedQuoteForDetail) return;
  if (document.getElementById('qbills')) return;

  var all = document.querySelectorAll('h3');
  var plH = null;
  var lineItemsH = null;
  all.forEach(function(h) {
    if (h.textContent.trim() === 'Profit & Loss Analysis') plH = h;
    if (h.textContent.trim() === 'Line Items') lineItemsH = h;
  });

  // Use P&L section if exists, otherwise fall back to Line Items
  var targetH = plH || lineItemsH;
  if (!targetH) return;

  // Walk up to the card container
  var card = targetH.parentElement;
  while (card && card.parentElement && !card.classList.contains('shadow-sm') && !card.classList.contains('rounded-xl')) {
    card = card.parentElement;
  }
  if (!card || card === document.body) card = targetH.parentElement;

  // Find related job
  var q = selectedQuoteForDetail;
  var rj = jobs.find(function(j) { return j.title === q.title && j.client_id === q.client_id; });
  if (!rj) rj = jobs.find(function(j) { return j.title && q.title && j.title.toLowerCase() === q.title.toLowerCase() && j.client_id === q.client_id; });

  var oid = (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : (currentUser ? currentUser.id : null);
  if (!oid) return;

  var bills = [];
  if (rj) {
    var r = await supabaseClient.from('bills').select('*').eq('user_id', oid).eq('job_id', rj.id);
    bills = r.data || [];
  }

  var tot = bills.reduce(function(s, b) { return s + parseFloat(b.amount || 0); }, 0);
  var unpaid = bills.filter(function(b) { return b.status !== 'paid'; });
  var totU = unpaid.reduce(function(s, b) { return s + parseFloat(b.amount || 0); }, 0);
  var jobId = rj ? rj.id : '';

  var h = '';
  h += '<div id="qbills" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6" style="margin-top:16px;">';

  // Header with Add Bill button
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">';
  h += '<h3 class="text-lg font-semibold text-gray-900 dark:text-white" style="margin:0;">Bills / Supplier Invoices</h3>';
  h += '<button onclick="openAddBillModal(\'' + jobId + '\')" style="padding:8px 16px;font-size:13px;font-weight:600;background:#0d9488;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;">+ Add Bill</button>';
  h += '</div>';

  if (bills.length === 0) {
    if (!rj) {
      h += '<div style="text-align:center;padding:32px;color:#94a3b8;">';
      h += '<p style="font-size:14px;margin-bottom:4px;">No bills yet.</p>';
      h += '<p style="font-size:12px;">Add supplier invoices now — they will link to the job once scheduled.</p>';
      h += '</div>';
    } else {
      h += '<div style="text-align:center;padding:32px;color:#94a3b8;">';
      h += '<p style="font-size:14px;margin-bottom:4px;">No bills for this job yet.</p>';
      h += '<p style="font-size:12px;">Add supplier invoices to track true job profitability.</p>';
      h += '</div>';
    }
  } else {
    // Summary boxes
    h += '<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">';
    h += '<div style="flex:1;min-width:100px;padding:10px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;" class="dark:bg-gray-700/50 dark:border-gray-600"><div style="font-size:10px;color:#64748b;font-weight:600;">TOTAL</div><div style="font-size:18px;font-weight:800;" class="dark:text-white">' + fmt(tot) + '</div></div>';
    if (totU > 0) h += '<div style="flex:1;min-width:100px;padding:10px;background:#fef2f2;border-radius:8px;border:1px solid #fecaca;" class="dark:bg-red-900/20 dark:border-red-800"><div style="font-size:10px;color:#ef4444;font-weight:600;">UNPAID</div><div style="font-size:18px;font-weight:800;color:#ef4444;">' + fmt(totU) + '</div></div>';
    h += '<div style="flex:1;min-width:100px;padding:10px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;" class="dark:bg-green-900/20 dark:border-green-800"><div style="font-size:10px;color:#16a34a;font-weight:600;">PAID</div><div style="font-size:18px;font-weight:800;color:#16a34a;">' + fmt(tot - totU) + '</div></div>';
    h += '</div>';

    // Bills list
    bills.forEach(function(b) {
      var sc = b.status === 'paid' ? 'background:#d1fae5;color:#065f46;' : 'background:#fee2e2;color:#991b1b;';
      h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid #f1f5f9;" class="dark:border-gray-700">';
      h += '<div>';
      h += '<div style="font-size:13px;font-weight:600;" class="dark:text-white">' + esc(b.vendor_name) + '</div>';
      h += '<div style="font-size:11px;color:#94a3b8;">';
      if (b.bill_number) h += '#' + esc(b.bill_number) + ' ';
      h += (b.date || '');
      if (b.due_date) h += ' &middot; Due: ' + b.due_date;
      h += '</div>';
      if (b.description) h += '<div style="font-size:11px;color:#b0b8c4;margin-top:2px;">' + esc(b.description) + '</div>';
      h += '</div>';
      h += '<div style="display:flex;align-items:center;gap:8px;">';
      h += '<span style="font-weight:700;" class="dark:text-white">' + fmt(b.amount) + '</span>';
      h += '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:8px;' + sc + '">' + (b.status === 'paid' ? 'PAID' : 'UNPAID') + '</span>';
      h += '</div>';
      h += '</div>';
    });

    // Impact note
    h += '<div style="margin-top:12px;padding:10px 14px;border-radius:8px;background:#fef3c7;border:1px solid #fde68a;" class="dark:bg-amber-900/20 dark:border-amber-800">';
    h += '<div style="font-size:12px;font-weight:600;color:#92400e;" class="dark:text-amber-400">These bills reduce your profit by ' + fmt(tot) + '</div>';
    h += '</div>';
  }

  h += '</div>';
  card.insertAdjacentHTML('afterend', h);
}

var t = null;
new MutationObserver(function() {
  if (t) clearTimeout(t);
  t = setTimeout(inject, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Quote bills box loaded');
} catch(e) { console.error('qbills err:', e); }
})();
