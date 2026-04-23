// M4 Admin Controls - Subscription, Delete, Admin Toggle
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = '.ac-panel{margin-top:20px;padding:20px;background:#fff;border-radius:12px;border:1px solid #e2e8f0}.dark .ac-panel{background:#1f2937;border-color:#374151}.ac-panel h3{font-size:16px;font-weight:700;margin-bottom:12px}.ac-table{width:100%;border-collapse:collapse;font-size:12px}.ac-table th{text-align:left;padding:8px;border-bottom:2px solid #e2e8f0;font-size:10px;text-transform:uppercase;color:#64748b}.dark .ac-table th{border-color:#4b5563}.ac-table td{padding:8px;border-bottom:1px solid #f1f5f9}.dark .ac-table td{border-color:#374151}.ac-btn{padding:4px 10px;font-size:11px;font-weight:600;border:none;border-radius:5px;cursor:pointer;font-family:inherit;margin:1px}.ac-btn-type{background:#e0f2fe;color:#0284c7}.ac-btn-type:hover{background:#0284c7;color:#fff}.ac-btn-admin{background:#fef3c7;color:#d97706}.ac-btn-admin:hover{background:#d97706;color:#fff}.ac-btn-del{background:#fee2e2;color:#ef4444}.ac-btn-del:hover{background:#ef4444;color:#fff}.ac-btn-admin-on{background:#d97706;color:#fff}.ac-search{padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;width:100%;max-width:300px;margin-bottom:12px;font-family:inherit}.dark .ac-search{background:#374151;border-color:#4b5563;color:#fff}';
document.head.appendChild(css);

var _adminTable = null;

// Discover admin table name
async function findAdminTable() {
  if (_adminTable) return _adminTable;
  // Try common names
  var names = ['admin_users', 'admins', 'admin', 'user_roles', 'roles'];
  for (var i = 0; i < names.length; i++) {
    try {
      var r = await supabaseClient.from(names[i]).select('*').limit(1);
      if (!r.error) { _adminTable = names[i]; return _adminTable; }
    } catch(e) {}
  }
  return null;
}

// Render admin controls
window.renderAdminControls = async function(container) {
  try {
    // Get all subscriptions
    var r = await supabaseClient.from('subscriptions').select('*').order('created_at', { ascending: false });
    var subs = r.data || [];

    // Find admin table
    var adminTbl = await findAdminTable();

    // Get admin status for all users
    var admins = {};
    if (adminTbl) {
      var ar = await supabaseClient.from(adminTbl).select('*');
      if (ar.data) {
        ar.data.forEach(function(a) {
          admins[a.user_id] = a.is_admin || false;
        });
      }
    }

    var h = '<div class="ac-panel">';
    h += '<h3>Account Management</h3>';
    h += '<input class="ac-search" id="ac-search" type="text" placeholder="Search by email..." oninput="filterAdminTable()">';

    h += '<table class="ac-table" id="ac-table"><thead><tr><th>Email</th><th>Type</th><th>Status</th><th>Admin</th><th>Actions</th></tr></thead><tbody>';

    subs.forEach(function(s) {
      var isAdm = admins[s.user_id] || false;
      var typeBtn = s.account_type === 'business'
        ? '<button class="ac-btn ac-btn-type" onclick="acChangeType(\'' + s.user_id + '\',\'' + s.user_email + '\',\'sole_trader\')">Switch to Sole Trader</button>'
        : '<button class="ac-btn ac-btn-type" onclick="acChangeType(\'' + s.user_id + '\',\'' + s.user_email + '\',\'business\')">Switch to Business</button>';

      var adminBtn = isAdm
        ? '<button class="ac-btn ac-btn-admin-on" onclick="acToggleAdmin(\'' + s.user_id + '\',\'' + s.user_email + '\',false)">Remove Admin</button>'
        : '<button class="ac-btn ac-btn-admin" onclick="acToggleAdmin(\'' + s.user_id + '\',\'' + s.user_email + '\',true)">Make Admin</button>';

      var delBtn = '<button class="ac-btn ac-btn-del" onclick="acDeleteAccount(\'' + s.user_id + '\',\'' + s.user_email + '\')">Delete</button>';

      h += '<tr data-email="' + (s.user_email || '').toLowerCase() + '">';
      h += '<td><strong>' + (s.user_email || 'Unknown') + '</strong></td>';
      h += '<td>' + (s.account_type || 'sole_trader') + '</td>';
      h += '<td>' + (s.subscription_status || 'trial') + '</td>';
      h += '<td>' + (isAdm ? '<span style="color:#d97706;font-weight:700">ADMIN</span>' : '-') + '</td>';
      h += '<td>' + typeBtn + adminBtn + delBtn + '</td>';
      h += '</tr>';
    });

    h += '</tbody></table>';
    if (subs.length === 0) h += '<p style="color:#94a3b8;text-align:center;margin-top:12px">No users yet</p>';
    h += '</div>';

    // Active Discounts section
    var discounted = subs.filter(function(s) { return s.discount_percent && s.discount_percent > 0; });

    h += '<div class="ac-panel" style="margin-top:16px">';
    h += '<h3>Active Discounts <span style="font-size:12px;font-weight:400;color:#64748b">(' + discounted.length + ' users)</span></h3>';

    if (discounted.length > 0) {
      h += '<table class="ac-table"><thead><tr><th>Email</th><th>Discount</th><th>Months</th><th>Start Date</th><th>Expires</th><th>Stripe Action</th></tr></thead><tbody>';
      discounted.forEach(function(s) {
        var start = s.discount_start_date ? new Date(s.discount_start_date) : null;
        var startStr = start ? start.toLocaleDateString() : '-';
        var expiresStr = '-';
        if (start && s.discount_months) {
          var expires = new Date(start);
          expires.setMonth(expires.getMonth() + s.discount_months);
          expiresStr = expires.toLocaleDateString();
          if (expires < new Date()) expiresStr = '<span style="color:#ef4444">' + expiresStr + ' (EXPIRED)</span>';
        } else if (!s.discount_months) {
          expiresStr = 'Ongoing';
        }
        h += '<tr>';
        h += '<td><strong>' + (s.user_email || 'Unknown') + '</strong></td>';
        h += '<td style="color:#0d9488;font-weight:700">' + s.discount_percent + '%</td>';
        h += '<td>' + (s.discount_months || 'Ongoing') + '</td>';
        h += '<td>' + startStr + '</td>';
        h += '<td>' + expiresStr + '</td>';
        h += '<td><span style="font-size:10px;color:#64748b">Apply in Stripe</span></td>';
        h += '</tr>';
      });
      h += '</tbody></table>';
    } else {
      h += '<p style="color:#94a3b8;font-size:13px;text-align:center">No active discounts</p>';
    }

    // Referrals section
    try {
      var refs = await supabaseClient.from('referrals').select('*').order('created_at', { ascending: false });
      var refData = refs.data || [];
      if (refData.length > 0) {
        h += '<h3 style="margin-top:20px">Referrals <span style="font-size:12px;font-weight:400;color:#64748b">(' + refData.length + ' total)</span></h3>';
        h += '<table class="ac-table"><thead><tr><th>Referrer</th><th>Referred</th><th>Status</th><th>Date</th></tr></thead><tbody>';
        refData.forEach(function(ref) {
          var status = ref.status === 'converted' ? '<span style="color:#059669;font-weight:700">Subscribed</span>' : '<span style="color:#d97706">Pending</span>';
          h += '<tr><td>' + ref.referrer_email + '</td><td>' + ref.referred_email + '</td><td>' + status + '</td><td>' + new Date(ref.created_at).toLocaleDateString() + '</td></tr>';
        });
        h += '</tbody></table>';
      }
    } catch(e) {}

    h += '</div>';

    container.innerHTML = h;
  } catch(e) {
    container.innerHTML = '<p style="color:#ef4444">Error: ' + e.message + '</p>';
  }
};

// Search filter
window.filterAdminTable = function() {
  var q = (document.getElementById('ac-search').value || '').toLowerCase();
  var rows = document.querySelectorAll('#ac-table tbody tr');
  rows.forEach(function(row) {
    var email = row.getAttribute('data-email') || '';
    row.style.display = email.indexOf(q) !== -1 ? '' : 'none';
  });
};

// Change subscription type
window.acChangeType = async function(userId, email, newType) {
  if (!confirm('Change ' + email + ' to ' + newType + '?')) return;
  try {
    var r = await supabaseClient.from('subscriptions').update({ account_type: newType }).eq('user_id', userId);
    if (r.error) { showNotification('Error: ' + r.error.message, 'error'); return; }
    showNotification(email + ' changed to ' + newType, 'success');
    var c = document.getElementById('ac-admin-container');
    if (c) renderAdminControls(c);
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
};

// Toggle admin
window.acToggleAdmin = async function(userId, email, makeAdmin) {
  if (!confirm((makeAdmin ? 'Make ' : 'Remove admin from ') + email + '?')) return;
  try {
    var tbl = await findAdminTable();
    if (!tbl) {
      // Create admin_users table entry via upsert
      tbl = 'admin_users';
    }

    if (makeAdmin) {
      // Try update first, then insert
      var r = await supabaseClient.from(tbl).upsert({ user_id: userId, is_admin: true }, { onConflict: 'user_id' });
      if (r.error) {
        // Try insert
        r = await supabaseClient.from(tbl).insert([{ user_id: userId, is_admin: true }]);
      }
      if (r.error) { showNotification('Error: ' + r.error.message, 'error'); return; }
    } else {
      var r2 = await supabaseClient.from(tbl).update({ is_admin: false }).eq('user_id', userId);
      if (r2.error) { showNotification('Error: ' + r2.error.message, 'error'); return; }
    }
    showNotification(email + (makeAdmin ? ' is now admin' : ' admin removed'), 'success');
    var c = document.getElementById('ac-admin-container');
    if (c) renderAdminControls(c);
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
};

// Delete account
window.acDeleteAccount = async function(userId, email) {
  if (!confirm('DELETE account for ' + email + '? This cannot be undone!')) return;
  if (!confirm('Are you SURE? All data for ' + email + ' will be permanently deleted.')) return;
  try {
    // Delete from all user tables
    var tables = ['subscriptions', 'quotes', 'invoices', 'expenses', 'clients', 'jobs',
      'time_entries', 'company_settings', 'email_settings', 'sms_settings',
      'team_members', 'warranty_items', 'quote_templates', 'promo_redemptions'];

    for (var i = 0; i < tables.length; i++) {
      try {
        await supabaseClient.from(tables[i]).delete().eq('user_id', userId);
      } catch(e) {}
      // Also try account_owner_id
      try {
        await supabaseClient.from(tables[i]).delete().eq('account_owner_id', userId);
      } catch(e) {}
    }

    // Remove admin status
    var tbl = await findAdminTable();
    if (tbl) {
      try { await supabaseClient.from(tbl).delete().eq('user_id', userId); } catch(e) {}
    }

    showNotification(email + ' account deleted', 'success');
    var c = document.getElementById('ac-admin-container');
    if (c) renderAdminControls(c);
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
};

// Inject into admin panel
function inject() {
  if (document.getElementById('ac-admin-container')) return;

  // Check admin
  var badge = document.querySelector('.bg-red-600');
  if (!badge || badge.textContent.trim() !== 'ADMIN') return;

  // Find admin section
  var target = null;
  document.querySelectorAll('h2, h3').forEach(function(el) {
    var t = el.textContent.trim();
    if (t === 'All Users' || t === 'Support Messages') target = el;
  });
  if (!target) return;

  var section = target.closest('div');
  if (!section) return;

  var container = document.createElement('div');
  container.id = 'ac-admin-container';
  section.parentElement.appendChild(container);
  renderAdminControls(container);
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(inject, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Admin controls loaded');

} catch(e) {
  console.error('Admin controls error:', e);
}
})();
