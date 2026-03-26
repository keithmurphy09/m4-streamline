// M4 Admin User Progress
// Click a user email in admin panel to see their checklist completion
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.up-panel{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:12px 0;animation:upSlide 0.2s ease}',
'.dark .up-panel{background:#1f2937;border-color:#374151}',
'@keyframes upSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}',
'.up-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6}',
'.dark .up-row{border-bottom-color:#374151}',
'.up-row:last-child{border-bottom:none}',
'.up-label{font-size:13px;color:#374151;font-weight:500}',
'.dark .up-label{color:#d1d5db}',
'.up-done{font-size:12px;font-weight:700;color:#10b981}',
'.up-not{font-size:12px;font-weight:700;color:#ef4444}',
'.up-bar{height:8px;border-radius:4px;background:#e2e8f0;overflow:hidden;margin-top:12px}',
'.dark .up-bar{background:#374151}',
'.up-bar-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#0d9488,#2dd4bf);transition:width 0.3s}',
'.up-score{font-size:14px;font-weight:700;color:#0f172a;margin-top:8px}',
'.dark .up-score{color:#fff}',
'.up-close{float:right;background:none;border:none;font-size:18px;color:#94a3b8;cursor:pointer;line-height:1}',
'.up-close:hover{color:#ef4444}',
'.up-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}',
'.up-stat{padding:8px;background:#f8fafc;border-radius:8px;text-align:center;border:1px solid #e2e8f0}',
'.dark .up-stat{background:#374151;border-color:#4b5563}',
'.up-stat-num{font-size:18px;font-weight:800;color:#0f172a}',
'.dark .up-stat-num{color:#fff}',
'.up-stat-label{font-size:10px;color:#64748b;text-transform:uppercase;font-weight:600}'
].join('\n');
document.head.appendChild(css);

// ============ LOAD USER PROGRESS ============
async function loadUserProgress(userId, email) {
  var checks = [];

  try {
    // 1. Company settings
    var cs = await supabaseClient.from('company_settings').select('business_name,phone,logo_url,bank_name,bsb').eq('user_id', userId).single();
    var settings = cs.data || {};
    checks.push({ label: 'Business details', done: !!(settings.business_name && settings.phone) });
    checks.push({ label: 'Logo uploaded', done: !!settings.logo_url });
    checks.push({ label: 'Bank details', done: !!(settings.bank_name && settings.bsb) });

    // 2. Xero connected
    var xr = await supabaseClient.from('xero_tokens').select('id').eq('user_id', userId);
    checks.push({ label: 'Xero connected', done: !!(xr.data && xr.data.length > 0) });

    // 3. Clients
    var cl = await supabaseClient.from('clients').select('id').eq('user_id', userId);
    var clientCount = cl.data ? cl.data.length : 0;
    checks.push({ label: 'Added clients', done: clientCount > 0, count: clientCount });

    // 4. Quotes
    var qt = await supabaseClient.from('quotes').select('id').eq('user_id', userId);
    var quoteCount = qt.data ? qt.data.length : 0;
    checks.push({ label: 'Created quotes', done: quoteCount > 0, count: quoteCount });

    // 5. Invoices
    var inv = await supabaseClient.from('invoices').select('id').eq('user_id', userId);
    var invoiceCount = inv.data ? inv.data.length : 0;
    checks.push({ label: 'Created invoices', done: invoiceCount > 0, count: invoiceCount });

    // 6. Jobs
    var jb = await supabaseClient.from('jobs').select('id').eq('user_id', userId);
    var jobCount = jb.data ? jb.data.length : 0;
    checks.push({ label: 'Scheduled jobs', done: jobCount > 0, count: jobCount });

    // 7. Team members
    var tm = await supabaseClient.from('team_members').select('id').eq('owner_id', userId);
    var teamCount = tm.data ? tm.data.length : 0;
    checks.push({ label: 'Added team members', done: teamCount > 0, count: teamCount });

    // 8. Expenses
    var ex = await supabaseClient.from('expenses').select('id').eq('user_id', userId);
    var expenseCount = ex.data ? ex.data.length : 0;
    checks.push({ label: 'Logged expenses', done: expenseCount > 0, count: expenseCount });

  } catch(e) {
    console.error('Error loading user progress:', e);
  }

  return { checks: checks, stats: { clients: clientCount || 0, quotes: quoteCount || 0, invoices: invoiceCount || 0, jobs: jobCount || 0 } };
}

// ============ SHOW PROGRESS PANEL ============
window.showUserProgress = async function(userId, email) {
  // Remove existing panel
  var existing = document.getElementById('up-panel-' + userId);
  if (existing) { existing.remove(); return; }

  // Close other panels
  document.querySelectorAll('[id^="up-panel-"]').forEach(function(el) { el.remove(); });

  // Find the row to insert after
  var emailCells = document.querySelectorAll('td');
  var targetRow = null;
  emailCells.forEach(function(td) {
    if (td.textContent.trim() === email) {
      targetRow = td.closest('tr');
    }
  });

  if (!targetRow) return;

  // Show loading
  var panel = document.createElement('tr');
  panel.id = 'up-panel-' + userId;
  panel.innerHTML = '<td colspan="5"><div class="up-panel"><div style="text-align:center;padding:16px;color:#94a3b8;font-size:13px;">Loading user activity...</div></div></td>';
  targetRow.insertAdjacentElement('afterend', panel);

  // Load data
  var data = await loadUserProgress(userId, email);
  var checks = data.checks;
  var stats = data.stats;
  var doneCount = checks.filter(function(c) { return c.done; }).length;
  var pct = Math.round((doneCount / checks.length) * 100);

  var h = '<td colspan="5"><div class="up-panel">';
  h += '<button class="up-close" onclick="document.getElementById(\'up-panel-' + userId + '\').remove()">&times;</button>';
  h += '<div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4px;" class="dark:text-white">' + escH(email) + '</div>';
  h += '<div style="font-size:12px;color:#64748b;margin-bottom:12px;">Setup Progress: ' + doneCount + ' of ' + checks.length + ' completed</div>';

  // Progress bar
  h += '<div class="up-bar"><div class="up-bar-fill" style="width:' + pct + '%;"></div></div>';
  h += '<div class="up-score">' + pct + '% complete</div>';

  // Stats boxes
  h += '<div class="up-stats">';
  h += '<div class="up-stat"><div class="up-stat-num">' + stats.clients + '</div><div class="up-stat-label">Clients</div></div>';
  h += '<div class="up-stat"><div class="up-stat-num">' + stats.quotes + '</div><div class="up-stat-label">Quotes</div></div>';
  h += '<div class="up-stat"><div class="up-stat-num">' + stats.invoices + '</div><div class="up-stat-label">Invoices</div></div>';
  h += '<div class="up-stat"><div class="up-stat-num">' + stats.jobs + '</div><div class="up-stat-label">Jobs</div></div>';
  h += '</div>';

  // Checklist
  h += '<div style="margin-top:16px;">';
  checks.forEach(function(c) {
    var icon = c.done ? '<span class="up-done">Done</span>' : '<span class="up-not">Not yet</span>';
    if (c.done && c.count) icon = '<span class="up-done">' + c.count + '</span>';
    h += '<div class="up-row"><span class="up-label">' + escH(c.label) + '</span>' + icon + '</div>';
  });
  h += '</div>';

  h += '</div></td>';
  panel.innerHTML = h;
};

function escH(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }

// ============ MAKE EMAIL CELLS CLICKABLE ============
function enhanceAdminTable() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'admin' && activeTab !== 'company') return;

  var tables = document.querySelectorAll('table');
  tables.forEach(function(table) {
    var rows = table.querySelectorAll('tr');
    rows.forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length < 3) return;

      var emailCell = cells[0];
      if (!emailCell || emailCell.dataset.upReady) return;

      var email = emailCell.textContent.trim();
      if (!email || !email.includes('@')) return;

      emailCell.dataset.upReady = 'true';

      // Find user ID from the row's buttons
      var userId = null;
      var btns = row.querySelectorAll('button');
      btns.forEach(function(btn) {
        var oc = btn.getAttribute('onclick') || '';
        var m = oc.match(/['"]([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})['"]/);
        if (m) userId = m[1];
      });

      // Also check select elements and inputs
      if (!userId) {
        var inputs = row.querySelectorAll('input, select, button');
        inputs.forEach(function(el) {
          var id = el.id || '';
          var m = id.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/);
          if (m) userId = m[1];
        });
      }

      if (!userId) return;

      emailCell.style.cursor = 'pointer';
      emailCell.style.color = '#0d9488';
      emailCell.style.fontWeight = '600';
      emailCell.title = 'Click to see user activity';
      emailCell.onclick = function() { showUserProgress(userId, email); };
    });
  });
}

var _upTimer = null;
new MutationObserver(function() {
  if (_upTimer) clearTimeout(_upTimer);
  _upTimer = setTimeout(enhanceAdminTable, 400);
}).observe(document.body, { childList: true, subtree: true });

console.log('Admin user progress loaded');

} catch(e) {
  console.error('User progress error:', e);
}
})();
