// M4 Promo Codes - Signup discount + Admin management
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = '.pc-box{margin-top:12px;display:flex;gap:8px;align-items:center;justify-content:center}.pc-input{padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;width:160px;text-transform:uppercase}.dark .pc-input{background:#374151;border-color:#4b5563;color:#fff}.pc-btn{padding:8px 14px;font-size:12px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit}.pc-btn:hover{background:#0f766e}.pc-ok{color:#0d9488;font-size:12px;font-weight:600}.pc-err{color:#ef4444;font-size:12px}.pc-admin{margin-top:20px;padding:20px;background:#fff;border-radius:12px;border:1px solid #e2e8f0}.dark .pc-admin{background:#1f2937;border-color:#374151}.pc-admin h3{font-size:16px;font-weight:700;margin-bottom:12px}.pc-table{width:100%;border-collapse:collapse;font-size:13px}.pc-table th{text-align:left;padding:8px;border-bottom:2px solid #e2e8f0;font-size:11px;text-transform:uppercase;color:#64748b}.dark .pc-table th{border-color:#4b5563}.pc-table td{padding:8px;border-bottom:1px solid #f1f5f9}.dark .pc-table td{border-color:#374151}.pc-add{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;align-items:center}.pc-add input,.pc-add select{padding:6px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;font-family:inherit}.dark .pc-add input,.dark .pc-add select{background:#374151;border-color:#4b5563;color:#fff}.pc-del{color:#ef4444;cursor:pointer;border:none;background:none;font-size:14px;font-weight:700}.pc-active{color:#0d9488;font-weight:700}.pc-inactive{color:#94a3b8}';
document.head.appendChild(css);

// ========== SIGNUP PROMO CODE ==========
function addPromoInput() {
  // Find the auth/login form area
  var authForm = document.querySelector('#auth-container') || document.querySelector('[class*="auth"]');
  if (!authForm) {
    // Try finding signup button
    document.querySelectorAll('button').forEach(function(b) {
      var t = b.textContent.trim().toLowerCase();
      if ((t === 'sign up' || t === 'create account' || t === 'register') && !b.dataset.pcDone) {
        b.dataset.pcDone = '1';
        var box = document.createElement('div');
        box.className = 'pc-box';
        box.innerHTML = '<input class="pc-input" id="pc-signup-code" type="text" placeholder="Promo code (optional)">';
        b.parentElement.insertBefore(box, b);
      }
    });
    return;
  }
  if (authForm.querySelector('.pc-box')) return;

  var box = document.createElement('div');
  box.className = 'pc-box';
  box.innerHTML = '<input class="pc-input" id="pc-signup-code" type="text" placeholder="Promo code (optional)">';
  authForm.appendChild(box);
}

// Validate and redeem a promo code
window.validatePromoCode = async function(code) {
  if (!code) return null;
  code = code.trim().toUpperCase();
  try {
    var r = await supabaseClient.from('promo_codes').select('*').eq('code', code).eq('active', true).limit(1);
    if (!r.data || r.data.length === 0) return null;
    var promo = r.data[0];

    // Check date range
    var now = new Date();
    if (promo.valid_from && new Date(promo.valid_from) > now) return null;
    if (promo.valid_until && new Date(promo.valid_until) < now) return null;

    // Check max uses
    if (promo.max_uses > 0 && promo.times_used >= promo.max_uses) return null;

    return promo;
  } catch(e) { return null; }
};

window.redeemPromoCode = async function(userId, promo) {
  try {
    // Increment usage
    await supabaseClient.from('promo_codes').update({ times_used: (promo.times_used || 0) + 1 }).eq('id', promo.id);
    // Record redemption
    await supabaseClient.from('promo_redemptions').insert([{
      user_id: userId,
      promo_code_id: promo.id,
      code: promo.code,
      discount_percent: promo.discount_percent
    }]);
    return true;
  } catch(e) { return false; }
};

// Check for promo code after signup
window.checkAndRedeemPromo = async function(userId) {
  var input = document.getElementById('pc-signup-code');
  if (!input || !input.value.trim()) return;
  var promo = await validatePromoCode(input.value);
  if (promo) {
    await redeemPromoCode(userId, promo);
    showNotification('Promo code applied! ' + promo.discount_percent + '% discount', 'success');
  }
};

// ========== ADMIN PROMO MANAGEMENT ==========
window.renderPromoAdmin = async function(container) {
  try {
    var r = await supabaseClient.from('promo_codes').select('*').order('created_at', { ascending: false });
    var promos = r.data || [];

    var h = '<div class="pc-admin">';
    h += '<h3>Promo Codes</h3>';

    // Add form
    h += '<div class="pc-add">';
    h += '<input id="pc-new-code" type="text" placeholder="CODE" style="width:100px;text-transform:uppercase">';
    h += '<input id="pc-new-discount" type="number" min="1" max="100" value="10" style="width:60px" placeholder="%">';
    h += '<span style="font-size:11px;color:#64748b">% off</span>';
    h += '<input id="pc-new-from" type="date" title="Valid from">';
    h += '<input id="pc-new-until" type="date" title="Valid until">';
    h += '<input id="pc-new-max" type="number" min="0" value="0" style="width:60px" placeholder="Max uses" title="0 = unlimited">';
    h += '<button class="pc-btn" onclick="createPromoCode()">Add Code</button>';
    h += '</div>';

    // Table
    h += '<table class="pc-table"><thead><tr><th>Code</th><th>Discount</th><th>Valid From</th><th>Valid Until</th><th>Used</th><th>Max</th><th>Status</th><th></th></tr></thead><tbody>';
    promos.forEach(function(p) {
      var from = p.valid_from ? new Date(p.valid_from).toLocaleDateString() : '-';
      var until = p.valid_until ? new Date(p.valid_until).toLocaleDateString() : 'No limit';
      var max = p.max_uses > 0 ? p.max_uses : 'Unlimited';
      var status = p.active ? '<span class="pc-active">Active</span>' : '<span class="pc-inactive">Inactive</span>';
      h += '<tr><td><strong>' + p.code + '</strong></td><td>' + p.discount_percent + '%</td><td>' + from + '</td><td>' + until + '</td><td>' + (p.times_used || 0) + '</td><td>' + max + '</td><td>' + status + '</td>';
      h += '<td><button class="pc-del" onclick="togglePromoCode(\'' + p.id + '\',' + !p.active + ')">x</button></td></tr>';
    });
    h += '</tbody></table>';
    if (promos.length === 0) h += '<p style="color:#94a3b8;font-size:13px;text-align:center;margin-top:12px">No promo codes yet</p>';
    h += '</div>';

    container.innerHTML = h;
  } catch(e) {
    container.innerHTML = '<p style="color:#ef4444">Error loading promo codes</p>';
  }
};

window.createPromoCode = async function() {
  var code = (document.getElementById('pc-new-code').value || '').trim().toUpperCase();
  var discount = parseInt(document.getElementById('pc-new-discount').value) || 10;
  var from = document.getElementById('pc-new-from').value || null;
  var until = document.getElementById('pc-new-until').value || null;
  var max = parseInt(document.getElementById('pc-new-max').value) || 0;

  if (!code) { showNotification('Enter a promo code', 'error'); return; }
  if (discount < 1 || discount > 100) { showNotification('Discount must be 1-100%', 'error'); return; }

  try {
    var r = await supabaseClient.from('promo_codes').insert([{
      code: code,
      discount_percent: discount,
      valid_from: from ? new Date(from).toISOString() : new Date().toISOString(),
      valid_until: until ? new Date(until + 'T23:59:59').toISOString() : null,
      max_uses: max,
      active: true
    }]);
    if (r.error) { showNotification('Error: ' + r.error.message, 'error'); return; }
    showNotification('Promo code ' + code + ' created', 'success');
    // Re-render
    var container = document.getElementById('pc-admin-container');
    if (container) renderPromoAdmin(container);
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
};

window.togglePromoCode = async function(id, active) {
  try {
    await supabaseClient.from('promo_codes').update({ active: active }).eq('id', id);
    showNotification(active ? 'Code activated' : 'Code deactivated', 'success');
    var container = document.getElementById('pc-admin-container');
    if (container) renderPromoAdmin(container);
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
};

// Inject admin section in admin panel
function injectAdmin() {
  if (typeof isAdmin === 'undefined' || !isAdmin) {
    // Check for admin badge
    var badge = document.querySelector('.bg-red-600');
    if (!badge || badge.textContent.trim() !== 'ADMIN') return;
  }

  // Find Company or Settings section
  var inserted = false;
  document.querySelectorAll('h2, h3').forEach(function(el) {
    var t = el.textContent.trim();
    if ((t === 'Admin Panel' || t === 'Subscription Management' || t === 'User Management') && !inserted) {
      var section = el.closest('div');
      if (section && !section.querySelector('#pc-admin-container')) {
        var container = document.createElement('div');
        container.id = 'pc-admin-container';
        section.appendChild(container);
        renderPromoAdmin(container);
        inserted = true;
      }
    }
  });
}

// Inject promo input on auth pages
function injectSignup() {
  // Look for signup forms
  var forms = document.querySelectorAll('form, [class*="auth"], [class*="login"], [class*="signup"]');
  forms.forEach(function(form) {
    if (form.querySelector('.pc-box')) return;
    var signupBtn = null;
    form.querySelectorAll('button').forEach(function(b) {
      var t = b.textContent.trim().toLowerCase();
      if (t === 'sign up' || t === 'create account' || t === 'register') signupBtn = b;
    });
    if (!signupBtn) return;
    if (signupBtn.dataset.pcDone) return;
    signupBtn.dataset.pcDone = '1';

    var box = document.createElement('div');
    box.className = 'pc-box';
    box.innerHTML = '<input class="pc-input" id="pc-signup-code" type="text" placeholder="Promo code (optional)">';
    signupBtn.parentElement.insertBefore(box, signupBtn);
  });
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(function() {
    injectSignup();
    injectAdmin();
  }, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Promo codes loaded');

} catch(e) {
  console.error('Promo codes error:', e);
}
})();
