// M4 Client Row Enhancement
// Adds avatar initials, email/phone, and stats to each client row
// Additive only
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'.cl-avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff;flex-shrink:0;letter-spacing:0.5px}',
'.cl-info{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}',
'.cl-name{font-size:15px;font-weight:600;color:#0f172a;cursor:pointer;transition:color 0.15s;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'.cl-name:hover{color:#0d9488}',
'.dark .cl-name{color:#e2e8f0}',
'.dark .cl-name:hover{color:#2dd4bf}',
'.cl-contact{display:flex;gap:12px;align-items:center;flex-wrap:wrap}',
'.cl-contact-item{font-size:12px;color:#64748b;display:flex;align-items:center;gap:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px}',
'.dark .cl-contact-item{color:#9ca3af}',
'.cl-contact-item a{color:inherit;text-decoration:none}',
'.cl-contact-item a:hover{color:#0d9488;text-decoration:underline}',
'.cl-stats{display:flex;gap:16px;align-items:center;flex-shrink:0}',
'.cl-stat{text-align:center;min-width:70px}',
'.cl-stat-val{font-size:13px;font-weight:700;color:#0f172a}',
'.dark .cl-stat-val{color:#e2e8f0}',
'.cl-stat-label{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.03em}',
'@media(max-width:768px){.cl-stats{display:none}.cl-contact{margin-top:2px}}'
].join('\n');
document.head.appendChild(css);

// ============ HELPERS ============
function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Generate consistent color from name
var COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#6366f1'];
function avatarColor(name) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  var parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

function fmtCurrency(n) {
  var num = parseFloat(n) || 0;
  if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'k';
  return '$' + num.toFixed(0);
}

// ============ ENHANCE ROWS ============
function enhanceClientRows() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'clients') return;

  var rows = document.querySelectorAll('#clientsList > div');
  if (rows.length === 0) return;

  rows.forEach(function(row) {
    if (row.dataset.clEnhanced) return;
    row.dataset.clEnhanced = 'true';

    // Find the inner flex container
    var inner = row.querySelector('.flex.items-center.gap-3');
    if (!inner) return;

    // Find the client name element
    var nameEl = inner.querySelector('h3');
    if (!nameEl) return;
    var clientName = nameEl.textContent.trim();

    // Find client data
    var clientId = null;
    var viewBtn = inner.querySelector('button[onclick*="openClientQuickView"]');
    if (viewBtn) {
      var match = viewBtn.getAttribute('onclick').match(/openClientQuickView\('([^']+)'/);
      if (match) clientId = match[1];
    }
    if (!clientId) return;

    var client = null;
    for (var i = 0; i < clients.length; i++) {
      if (clients[i].id === clientId) { client = clients[i]; break; }
    }
    if (!client) return;

    // Calc stats
    var clientQuotes = [];
    var clientInvoicesPaid = 0;
    var clientInvoicesTotal = 0;
    var clientQuotesTotal = 0;
    for (var q = 0; q < quotes.length; q++) {
      if (quotes[q].client_id === clientId) {
        clientQuotes.push(quotes[q]);
        clientQuotesTotal += parseFloat(quotes[q].total || 0);
      }
    }
    for (var inv = 0; inv < invoices.length; inv++) {
      if (invoices[inv].client_id === clientId) {
        clientInvoicesTotal += parseFloat(invoices[inv].total || 0);
        if (invoices[inv].status === 'paid') clientInvoicesPaid += parseFloat(invoices[inv].total || 0);
      }
    }

    // Get checkbox (keep it)
    var checkbox = inner.querySelector('input[type="checkbox"]');

    // Get buttons container
    var btnsDiv = inner.querySelector('.flex.gap-2.flex-shrink-0');

    // Rebuild inner content
    var initials = getInitials(clientName);
    var color = avatarColor(clientName);

    // Create avatar
    var avatar = document.createElement('div');
    avatar.className = 'cl-avatar';
    avatar.style.background = color;
    avatar.textContent = initials;

    // Create info block
    var info = document.createElement('div');
    info.className = 'cl-info';

    var nameDiv = document.createElement('div');
    nameDiv.className = 'cl-name';
    nameDiv.textContent = clientName;
    nameDiv.setAttribute('onclick', "openClientQuickView('" + clientId + "')");
    info.appendChild(nameDiv);

    // Contact line
    var contactDiv = document.createElement('div');
    contactDiv.className = 'cl-contact';
    if (client.email) {
      contactDiv.innerHTML += '<span class="cl-contact-item"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg><a href="mailto:' + escH(client.email) + '">' + escH(client.email) + '</a></span>';
    }
    if (client.phone) {
      contactDiv.innerHTML += '<span class="cl-contact-item"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg><a href="tel:' + escH(client.phone) + '">' + escH(client.phone) + '</a></span>';
    }
    if (contactDiv.innerHTML) info.appendChild(contactDiv);

    // Stats block
    var stats = document.createElement('div');
    stats.className = 'cl-stats';

    if (clientQuotesTotal > 0) {
      stats.innerHTML += '<div class="cl-stat"><div class="cl-stat-val">' + fmtCurrency(clientQuotesTotal) + '</div><div class="cl-stat-label">Quoted</div></div>';
    }
    if (clientInvoicesTotal > 0) {
      stats.innerHTML += '<div class="cl-stat"><div class="cl-stat-val">' + fmtCurrency(clientInvoicesTotal) + '</div><div class="cl-stat-label">Invoiced</div></div>';
    }
    if (clientInvoicesPaid > 0) {
      stats.innerHTML += '<div class="cl-stat"><div class="cl-stat-val" style="color:#10b981;">' + fmtCurrency(clientInvoicesPaid) + '</div><div class="cl-stat-label">Paid</div></div>';
    }

    // Clear and rebuild inner
    inner.innerHTML = '';
    if (checkbox) inner.appendChild(checkbox);
    inner.appendChild(avatar);
    inner.appendChild(info);
    if (stats.innerHTML) inner.appendChild(stats);
    if (btnsDiv) inner.appendChild(btnsDiv);
  });
}

// ============ OBSERVER ============
var _clTimer = null;
var _clObs = new MutationObserver(function() {
  if (_clTimer) clearTimeout(_clTimer);
  _clTimer = setTimeout(enhanceClientRows, 200);
});
_clObs.observe(document.body, { childList: true, subtree: true });

console.log('Client row enhancement loaded');

} catch(e) {
  console.error('Client enhance error:', e);
}
})();
