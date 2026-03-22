// M4 Quote Variations + Button Layout Fix
// Adds Variation button, fixes Delete position
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.qv-var-btn{display:inline-flex;align-items:center;padding:8px 16px;font-size:14px;font-weight:500;color:#d97706;background:#fff;border:1px solid #fde68a;border-radius:8px;cursor:pointer;font-family:inherit;transition:all 0.15s}',
'.dark .qv-var-btn{background:#374151;border-color:#92400e;color:#fbbf24}',
'.qv-var-btn:hover{background:#fffbeb;border-color:#f59e0b}',
'.dark .qv-var-btn:hover{background:#78350f}'
].join('\n');
document.head.appendChild(css);

// ============ CREATE VARIATION ============
window.createQuoteVariation = async function(quoteId) {
  var q = quotes.find(function(x) { return x.id === quoteId; });
  if (!q) { showNotification('Quote not found', 'error'); return; }

  // Find existing variations to determine next letter
  var baseNumber = q.quote_number || '';
  // Strip existing variation letter if this is already a variation
  var baseMatch = baseNumber.match(/^(.+?)(-[A-Z])?$/);
  var base = baseMatch ? baseMatch[1] : baseNumber;

  // Find all variations of this base
  var existing = quotes.filter(function(x) {
    return x.quote_number && (x.quote_number === base || x.quote_number.match(new RegExp('^' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '-[A-Z]$')));
  });

  // Determine next letter
  var maxLetter = 0;
  existing.forEach(function(x) {
    var m = x.quote_number.match(/-([A-Z])$/);
    if (m) {
      var code = m[1].charCodeAt(0) - 64; // A=1, B=2, etc
      if (code > maxLetter) maxLetter = code;
    }
  });
  var nextLetter = String.fromCharCode(65 + maxLetter); // A, B, C...
  var varNumber = base + '-' + nextLetter;

  try {
    // Create variation with same client, address, but new quote
    var varData = {
      user_id: currentUser.id,
      client_id: q.client_id,
      title: q.title + ' (Variation ' + nextLetter + ')',
      quote_number: varNumber,
      total: 0,
      subtotal: 0,
      items: [],
      notes: 'Variation of ' + (q.quote_number || q.title),
      status: 'pending',
      job_address: q.job_address || null,
      include_gst: q.include_gst || false,
      deposit_percentage: q.deposit_percentage || 0
    };

    var r = await supabaseClient.from('quotes').insert([varData]).select();
    if (r.error) throw r.error;

    quotes.push(r.data[0]);
    showNotification('Variation ' + varNumber + ' created', 'success');

    // Open the variation for editing
    selectedQuoteForDetail = null;
    quoteViewMode = 'detail';
    selectedQuoteForDetail = r.data[0];
    openModal('quote', r.data[0]);

  } catch(e) {
    console.error('Variation error:', e);
    showNotification('Error creating variation: ' + e.message, 'error');
  }
};

// ============ INJECT BUTTONS ============
function enhanceButtons() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'quotes') return;
  if (typeof selectedQuoteForDetail === 'undefined' || !selectedQuoteForDetail) return;

  var q = selectedQuoteForDetail;

  // Find the actions div
  var actionDivs = document.querySelectorAll('.flex.flex-wrap.gap-2');
  var actionDiv = null;
  actionDivs.forEach(function(d) {
    if (d.querySelector('button') && d.textContent.indexOf('Edit Quote') !== -1 || d.textContent.indexOf('Amend Quote') !== -1) {
      actionDiv = d;
    }
  });
  if (!actionDiv) return;
  if (actionDiv.dataset.qvEnhanced) return;
  actionDiv.dataset.qvEnhanced = 'true';

  // Fix Delete button - remove ml-auto so it flows naturally
  var deleteBtn = actionDiv.querySelector('button[onclick*="deleteQuote"]');
  if (deleteBtn) {
    deleteBtn.classList.remove('ml-auto');
  }

  // Add Variation button before Delete (inside the more-actions div)
  var moreDiv = actionDiv.querySelector('[id^="more-actions-"]');
  if (moreDiv && deleteBtn) {
    var varBtn = document.createElement('button');
    varBtn.className = 'qv-var-btn';
    varBtn.textContent = 'Variation';
    varBtn.onclick = function() { createQuoteVariation(q.id); };
    moreDiv.insertBefore(varBtn, deleteBtn);
  } else {
    // No more-actions div, add before Delete directly
    var varBtn = document.createElement('button');
    varBtn.className = 'qv-var-btn';
    varBtn.textContent = 'Variation';
    varBtn.onclick = function() { createQuoteVariation(q.id); };
    if (deleteBtn) {
      deleteBtn.parentElement.insertBefore(varBtn, deleteBtn);
    } else {
      actionDiv.appendChild(varBtn);
    }
  }
};

var _qvTimer = null;
new MutationObserver(function() {
  if (_qvTimer) clearTimeout(_qvTimer);
  _qvTimer = setTimeout(enhanceButtons, 300);
}).observe(document.body, { childList: true, subtree: true });

console.log('Quote variations loaded');

} catch(e) {
  console.error('Quote variations error:', e);
}
})();
