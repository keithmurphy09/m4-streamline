// M4 Warranty Tracking
// Adds warranty section to completed job cards + dashboard expiry warnings
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.wt-section{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-top:16px}',
'.dark .wt-section{background:#1f2937;border-color:#374151}',
'.wt-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}',
'.wt-title{font-size:16px;font-weight:700;color:#0f172a}',
'.dark .wt-title{color:#fff}',
'.wt-badge{padding:3px 10px;font-size:11px;font-weight:700;border-radius:10px}',
'.wt-badge-active{background:#d1fae5;color:#065f46}',
'.wt-badge-expiring{background:#fef3c7;color:#92400e}',
'.wt-badge-expired{background:#fee2e2;color:#991b1b}',
'.wt-badge-claimed{background:#dbeafe;color:#1e40af}',
'.wt-info{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}',
'.wt-info-item{font-size:13px;color:#64748b}',
'.dark .wt-info-item{color:#9ca3af}',
'.wt-info-val{font-weight:600;color:#0f172a}',
'.dark .wt-info-val{color:#fff}',
'.wt-bar{height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;margin:8px 0}',
'.dark .wt-bar{background:#374151}',
'.wt-bar-fill{height:100%;border-radius:3px;transition:width 0.3s}',
'.wt-claim{padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:8px;font-size:13px}',
'.dark .wt-claim{background:#374151;border-color:#4b5563}',
'.wt-claim-date{font-size:11px;color:#94a3b8}',
'.wt-add-btn{padding:8px 16px;font-size:13px;font-weight:600;background:#0d9488;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit}',
'.wt-add-btn:hover{background:#0f766e}',
'.wt-claim-btn{padding:6px 14px;font-size:12px;font-weight:600;background:#fff;color:#d97706;border:1px solid #fde68a;border-radius:6px;cursor:pointer;font-family:inherit}',
'.dark .wt-claim-btn{background:#374151;border-color:#92400e;color:#fbbf24}',
'.wt-claim-btn:hover{background:#fffbeb}',
'',
'.wt-dash-warn{padding:12px 16px;background:#fef3c7;border:1px solid #fde68a;border-radius:10px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;cursor:pointer}',
'.dark .wt-dash-warn{background:rgba(146,64,14,0.15);border-color:rgba(253,230,138,0.3)}',
'.wt-dash-warn:hover{background:#fef9c3}',
'.wt-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center}',
'.wt-modal{background:#fff;border-radius:16px;padding:24px;max-width:420px;width:90%;max-height:80vh;overflow-y:auto}',
'.dark .wt-modal{background:#1f2937}',
'.wt-modal input,.wt-modal textarea,.wt-modal select{width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;margin-bottom:12px;box-sizing:border-box}',
'.dark .wt-modal input,.dark .wt-modal textarea,.dark .wt-modal select{background:#374151;border-color:#4b5563;color:#fff}'
].join('\n');
document.head.appendChild(css);

var _warranties = [];
var _wtLoaded = false;

function escH(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }

function fmtDate(d) {
  if (!d) return '';
  var dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(dateStr) {
  if (!dateStr) return 999;
  var now = new Date(); now.setHours(0,0,0,0);
  var exp = new Date(dateStr + 'T00:00:00');
  return Math.ceil((exp - now) / 86400000);
}

function getOwnerId() {
  return (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : (currentUser ? currentUser.id : null);
}

// ============ LOAD WARRANTIES ============
async function loadWarranties() {
  try {
    var oid = getOwnerId();
    if (!oid) return;
    var r = await supabaseClient.from('warranties').select('*').eq('user_id', oid).order('expiry_date', { ascending: true });
    _warranties = r.data || [];
    _wtLoaded = true;

    // Auto-update expired statuses
    var now = new Date(); now.setHours(0,0,0,0);
    for (var i = 0; i < _warranties.length; i++) {
      var w = _warranties[i];
      if (w.status === 'active' && w.expiry_date) {
        var exp = new Date(w.expiry_date + 'T00:00:00');
        if (exp < now) {
          w.status = 'expired';
          supabaseClient.from('warranties').update({ status: 'expired' }).eq('id', w.id);
        }
      }
    }
  } catch(e) { console.error('Warranty load error:', e); }
}

// ============ CREATE WARRANTY ============
window.createWarranty = async function(jobId) {
  var job = jobs.find(function(j) { return j.id === jobId; });
  if (!job) return;

  var cl = clients.find(function(c) { return c.id === job.client_id; });
  var completedDate = job.completed_date || job.end_date || new Date().toISOString().split('T')[0];

  // Check if warranty already exists for this job
  var existing = _warranties.find(function(w) { return w.job_id === jobId; });
  if (existing) {
    showNotification('Warranty already exists for this job', 'error');
    return;
  }

  showWarrantyModal(jobId, job.title, cl ? cl.name : 'Unknown', cl ? cl.id : null, completedDate);
};

function showWarrantyModal(jobId, jobTitle, clientName, clientId, startDate) {
  var overlay = document.createElement('div');
  overlay.className = 'wt-modal-overlay';
  overlay.id = 'wt-modal';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  var h = '<div class="wt-modal">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><div style="font-size:18px;font-weight:700;" class="dark:text-white">Add Warranty</div><button onclick="document.getElementById(\'wt-modal\').remove()" style="background:none;border:none;font-size:24px;color:#94a3b8;cursor:pointer;line-height:1;">&times;</button></div>';
  h += '<div style="font-size:13px;color:#64748b;margin-bottom:16px;">Job: <strong>' + escH(jobTitle) + '</strong><br>Client: ' + escH(clientName) + '</div>';
  h += '<label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:4px;" class="dark:text-gray-200">Warranty Period</label>';
  h += '<select id="wt-period"><option value="3">3 months</option><option value="6">6 months</option><option value="12" selected>12 months</option><option value="24">2 years</option><option value="36">3 years</option><option value="60">5 years</option><option value="84">7 years</option><option value="120">10 years</option></select>';
  h += '<label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:4px;" class="dark:text-gray-200">Start Date</label>';
  h += '<input type="date" id="wt-start" value="' + (startDate || '') + '">';
  h += '<label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:4px;" class="dark:text-gray-200">Description</label>';
  h += '<textarea id="wt-desc" rows="2" placeholder="e.g. General workmanship warranty">General workmanship warranty</textarea>';
  h += '<label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:4px;" class="dark:text-gray-200">Notes (optional)</label>';
  h += '<textarea id="wt-notes" rows="2" placeholder="Any specific terms or conditions"></textarea>';
  h += '<button class="wt-add-btn" style="width:100%;" onclick="saveWarranty(\'' + jobId + '\',\'' + escH(jobTitle) + '\',\'' + (clientId || '') + '\',\'' + escH(clientName) + '\')">Create Warranty</button>';
  h += '</div>';

  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

window.saveWarranty = async function(jobId, jobTitle, clientId, clientName) {
  var period = parseInt((document.getElementById('wt-period') || {}).value) || 12;
  var startDate = (document.getElementById('wt-start') || {}).value;
  var desc = (document.getElementById('wt-desc') || {}).value || 'General workmanship warranty';
  var notes = (document.getElementById('wt-notes') || {}).value || null;

  if (!startDate) { showNotification('Please select a start date', 'error'); return; }

  var expiry = new Date(startDate + 'T00:00:00');
  expiry.setMonth(expiry.getMonth() + period);
  var expiryStr = expiry.getFullYear() + '-' + String(expiry.getMonth() + 1).padStart(2, '0') + '-' + String(expiry.getDate()).padStart(2, '0');

  try {
    var data = {
      user_id: getOwnerId(),
      job_id: jobId,
      job_title: jobTitle,
      client_id: clientId || null,
      client_name: clientName,
      warranty_period_months: period,
      start_date: startDate,
      expiry_date: expiryStr,
      description: desc.trim(),
      status: 'active',
      notes: notes,
      claims: []
    };

    var r = await supabaseClient.from('warranties').insert([data]).select();
    if (r.error) throw r.error;

    _warranties.push(r.data[0]);
    var modal = document.getElementById('wt-modal');
    if (modal) modal.remove();
    showNotification('Warranty created - expires ' + fmtDate(expiryStr), 'success');
    renderApp();
  } catch(e) {
    showNotification('Error: ' + e.message, 'error');
  }
};

// ============ LOG A CLAIM ============
window.logWarrantyClaim = function(warrantyId) {
  var w = _warranties.find(function(x) { return x.id === warrantyId; });
  if (!w) return;

  var overlay = document.createElement('div');
  overlay.className = 'wt-modal-overlay';
  overlay.id = 'wt-claim-modal';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  var h = '<div class="wt-modal">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><div style="font-size:18px;font-weight:700;" class="dark:text-white">Log Warranty Claim</div><button onclick="document.getElementById(\'wt-claim-modal\').remove()" style="background:none;border:none;font-size:24px;color:#94a3b8;cursor:pointer;line-height:1;">&times;</button></div>';
  h += '<div style="font-size:13px;color:#64748b;margin-bottom:16px;">Job: <strong>' + escH(w.job_title) + '</strong><br>Client: ' + escH(w.client_name) + '</div>';
  h += '<label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:4px;" class="dark:text-gray-200">Issue Description *</label>';
  h += '<textarea id="wt-claim-desc" rows="3" placeholder="Describe the warranty issue..."></textarea>';
  h += '<label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:4px;" class="dark:text-gray-200">Date</label>';
  h += '<input type="date" id="wt-claim-date" value="' + new Date().toISOString().split('T')[0] + '">';
  h += '<label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:4px;" class="dark:text-gray-200">Resolution</label>';
  h += '<textarea id="wt-claim-resolution" rows="2" placeholder="How was it resolved? (can update later)"></textarea>';
  h += '<button class="wt-add-btn" style="width:100%;" onclick="saveWarrantyClaim(\'' + warrantyId + '\')">Log Claim</button>';
  h += '</div>';

  overlay.innerHTML = h;
  document.body.appendChild(overlay);
};

window.saveWarrantyClaim = async function(warrantyId) {
  var desc = (document.getElementById('wt-claim-desc') || {}).value;
  if (!desc || !desc.trim()) { showNotification('Please describe the issue', 'error'); return; }

  var w = _warranties.find(function(x) { return x.id === warrantyId; });
  if (!w) return;

  var claim = {
    date: (document.getElementById('wt-claim-date') || {}).value || new Date().toISOString().split('T')[0],
    description: desc.trim(),
    resolution: ((document.getElementById('wt-claim-resolution') || {}).value || '').trim(),
    logged_at: new Date().toISOString()
  };

  var claims = Array.isArray(w.claims) ? w.claims.slice() : [];
  claims.push(claim);

  try {
    var r = await supabaseClient.from('warranties').update({ claims: claims, status: 'claimed' }).eq('id', warrantyId);
    if (r.error) throw r.error;

    w.claims = claims;
    w.status = 'claimed';
    var modal = document.getElementById('wt-claim-modal');
    if (modal) modal.remove();
    showNotification('Warranty claim logged', 'success');
    renderApp();
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
};

// ============ DELETE WARRANTY ============
window.deleteWarranty = async function(id) {
  if (!confirm('Delete this warranty?')) return;
  try {
    await supabaseClient.from('warranties').delete().eq('id', id);
    _warranties = _warranties.filter(function(w) { return w.id !== id; });
    showNotification('Warranty deleted', 'success');
    renderApp();
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
};

// ============ INJECT INTO JOB CARDS ============
function injectWarrantySection() {
  // Find job detail views
  var jobCards = document.querySelectorAll('[id^="job-detail-"]');
  if (jobCards.length === 0) {
    // Try finding via heading
    var headings = document.querySelectorAll('h2, h3');
    headings.forEach(function(h) {
      if (h.textContent.indexOf('Tasks') !== -1 && h.closest && !h.closest('[data-wt-checked]')) {
        var container = h.closest('.bg-white, .dark\\:bg-gray-800');
        if (container) container.dataset.wtChecked = 'true';
      }
    });
  }

  // Look for job titles in schedule detail view
  var scheduleDetail = document.querySelector('[onclick*="closeJobDetail"]');
  if (!scheduleDetail) return;

  var jobDetailContainer = scheduleDetail.closest('.bg-white, .dark\\:bg-gray-800') || scheduleDetail.parentElement;
  if (!jobDetailContainer || jobDetailContainer.dataset.wtDone) return;

  // Find which job we're viewing
  var closeBtn = scheduleDetail;
  var jobId = null;

  // Extract job ID from various onclick patterns
  var allBtns = jobDetailContainer.querySelectorAll('button, a');
  allBtns.forEach(function(btn) {
    var oc = btn.getAttribute('onclick') || '';
    var m = oc.match(/editJob\(['"]([^'"]+)['"]\)|deleteJob\(['"]([^'"]+)['"]\)|openGanttJobDetail\(['"]([^'"]+)['"]\)/);
    if (m) jobId = m[1] || m[2] || m[3];
  });

  if (!jobId) return;
  jobDetailContainer.dataset.wtDone = 'true';

  var job = jobs.find(function(j) { return j.id === jobId; });
  if (!job) return;

  var warranty = _warranties.find(function(w) { return w.job_id === jobId; });

  var section = document.createElement('div');
  section.className = 'wt-section';

  var h = '';

  if (warranty) {
    var days = daysUntil(warranty.expiry_date);
    var totalDays = warranty.warranty_period_months * 30;
    var elapsed = totalDays - days;
    var pct = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));
    var statusClass = warranty.status === 'claimed' ? 'wt-badge-claimed' : (days < 0 ? 'wt-badge-expired' : (days < 30 ? 'wt-badge-expiring' : 'wt-badge-active'));
    var statusText = warranty.status === 'claimed' ? 'CLAIMED' : (days < 0 ? 'EXPIRED' : (days < 30 ? 'EXPIRING SOON' : 'ACTIVE'));
    var barColor = days < 0 ? '#ef4444' : (days < 30 ? '#f59e0b' : '#10b981');

    h += '<div class="wt-hd"><span class="wt-title">Warranty</span><span class="wt-badge ' + statusClass + '">' + statusText + '</span></div>';
    h += '<div class="wt-info">';
    h += '<div class="wt-info-item">Period: <span class="wt-info-val">' + warranty.warranty_period_months + ' months</span></div>';
    h += '<div class="wt-info-item">Start: <span class="wt-info-val">' + fmtDate(warranty.start_date) + '</span></div>';
    h += '<div class="wt-info-item">Expires: <span class="wt-info-val">' + fmtDate(warranty.expiry_date) + '</span></div>';
    h += '<div class="wt-info-item">Remaining: <span class="wt-info-val">' + (days > 0 ? days + ' days' : 'Expired') + '</span></div>';
    h += '</div>';
    h += '<div style="font-size:12px;color:#64748b;margin-bottom:2px;">' + escH(warranty.description) + '</div>';
    h += '<div class="wt-bar"><div class="wt-bar-fill" style="width:' + pct + '%;background:' + barColor + ';"></div></div>';

    // Claims
    var claims = Array.isArray(warranty.claims) ? warranty.claims : [];
    if (claims.length > 0) {
      h += '<div style="margin-top:12px;font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;" class="dark:text-gray-200">Claims (' + claims.length + ')</div>';
      claims.forEach(function(c) {
        h += '<div class="wt-claim"><div style="font-weight:600;" class="dark:text-white">' + escH(c.description) + '</div>';
        if (c.resolution) h += '<div style="color:#16a34a;margin-top:4px;">Resolution: ' + escH(c.resolution) + '</div>';
        h += '<div class="wt-claim-date">' + fmtDate(c.date) + '</div></div>';
      });
    }

    h += '<div style="display:flex;gap:8px;margin-top:12px;">';
    h += '<button class="wt-claim-btn" onclick="logWarrantyClaim(\'' + warranty.id + '\')">Log Claim</button>';
    h += '<button style="padding:6px 14px;font-size:12px;font-weight:600;background:none;color:#ef4444;border:1px solid #fecaca;border-radius:6px;cursor:pointer;font-family:inherit;" onclick="deleteWarranty(\'' + warranty.id + '\')">Delete</button>';
    h += '</div>';

  } else {
    h += '<div class="wt-hd"><span class="wt-title">Warranty</span></div>';
    h += '<div style="text-align:center;padding:16px;color:#94a3b8;font-size:13px;">';
    h += '<p>No warranty set for this job.</p>';
    h += '<button class="wt-add-btn" style="margin-top:10px;" onclick="createWarranty(\'' + jobId + '\')">Add Warranty</button>';
    h += '</div>';
  }

  section.innerHTML = h;
  jobDetailContainer.appendChild(section);
}

// ============ DASHBOARD WARNING ============
function injectDashboardWarning() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'dashboard') return;
  if (document.getElementById('wt-dash-warning')) return;

  var expiring = _warranties.filter(function(w) {
    if (w.status === 'expired') return false;
    var days = daysUntil(w.expiry_date);
    return days >= 0 && days <= 30;
  });

  if (expiring.length === 0) return;

  // Find dashboard content area
  var dashH2 = null;
  document.querySelectorAll('h2').forEach(function(h) {
    if (h.textContent.indexOf('Dashboard') !== -1 || h.textContent.indexOf('Welcome') !== -1) dashH2 = h;
  });
  if (!dashH2) return;

  var container = dashH2.parentElement;
  if (!container) return;

  var warn = document.createElement('div');
  warn.id = 'wt-dash-warning';
  warn.className = 'wt-dash-warn';
  warn.onclick = function() { switchTab('schedule'); };

  var h = '<div>';
  h += '<div style="font-size:14px;font-weight:700;color:#92400e;">Warranties Expiring Soon</div>';
  h += '<div style="font-size:12px;color:#a16207;">';
  expiring.forEach(function(w) {
    var days = daysUntil(w.expiry_date);
    h += escH(w.job_title) + ' (' + escH(w.client_name) + ') - ' + days + ' days &middot; ';
  });
  h += '</div></div>';
  h += '<div style="font-size:20px;color:#d97706;">&rarr;</div>';

  warn.innerHTML = h;

  // Insert after the heading
  dashH2.insertAdjacentElement('afterend', warn);
}

// ============ OBSERVER ============
var _wtTimer = null;
new MutationObserver(function() {
  if (_wtTimer) clearTimeout(_wtTimer);
  _wtTimer = setTimeout(async function() {
    if (!currentUser) return;
    if (!_wtLoaded) await loadWarranties();
    injectWarrantySection();
    injectDashboardWarning();
  }, 400);
}).observe(document.body, { childList: true, subtree: true });

console.log('Warranty tracking loaded');

} catch(e) {
  console.error('Warranty error:', e);
}
})();
