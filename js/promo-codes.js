// M4 Promo Codes - Signup discount + Admin management
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = '.pc-box{margin-top:12px;display:flex;gap:8px;align-items:center;justify-content:center}.pc-input{padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;width:160px;text-transform:uppercase}.dark .pc-input{background:#374151;border-color:#4b5563;color:#fff}.pc-btn{padding:8px 14px;font-size:12px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit}.pc-btn:hover{background:#0f766e}.pc-ok{color:#0d9488;font-size:12px;font-weight:600}.pc-err{color:#ef4444;font-size:12px}.pc-admin{margin-top:20px;padding:20px;background:#fff;border-radius:12px;border:1px solid #e2e8f0}.dark .pc-admin{background:#1f2937;border-color:#374151}.pc-admin h3{font-size:16px;font-weight:700;margin-bottom:12px}.pc-table{width:100%;border-collapse:collapse;font-size:13px}.pc-table th{text-align:left;padding:8px;border-bottom:2px solid #e2e8f0;font-size:11px;text-transform:uppercase;color:#64748b}.dark .pc-table th{border-color:#4b5563}.pc-table td{padding:8px;border-bottom:1px solid #f1f5f9}.dark .pc-table td{border-color:#374151}.pc-add{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;align-items:center}.pc-add input,.pc-add select{padding:6px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;font-family:inherit}.dark .pc-add input,.dark .pc-add select{background:#374151;border-color:#4b5563;color:#fff}.pc-del{color:#ef4444;cursor:pointer;border:none;background:none;font-size:14px;font-weight:700}.pc-active{color:#0d9488;font-weight:700}.pc-inactive{color:#94a3b8}';
document.head.appendChild(css);

// ========== SIGNUP PROMO CODE ==========
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
    h += '<input id="pc-new-code" type="text" placeholder="CODE" style="width:120px;text-transform:uppercase">';
    h += '<input id="pc-new-discount" type="number" min="1" max="100" value="10" style="width:60px" placeholder="%">';
    h += '<span style="font-size:11px;color:#64748b">% off for</span>';
    h += '<input id="pc-new-months" type="number" min="1" max="36" value="6" style="width:50px">';
    h += '<span style="font-size:11px;color:#64748b">months</span>';
    h += '<select id="pc-new-applies" style="padding:6px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px"><option value="subscription">Subscription</option><option value="advertising">Advertising</option><option value="both">Both</option></select>';
    h += '<button class="pc-btn" onclick="createPromoCode()">Add Code</button>';
    h += '</div>';

    // Table
    h += '<table class="pc-table"><thead><tr><th>Code</th><th>Discount</th><th>Term</th><th>Applies To</th><th>Used</th><th>Status</th><th></th></tr></thead><tbody>';
    promos.forEach(function(p) {
      var term = p.term_months ? p.term_months + ' months' : 'Ongoing';
      var applies = p.applies_to || 'subscription';
      var appliesLabel = applies === 'both' ? '<span style="color:#0d9488">Sub + Ad</span>' : applies === 'advertising' ? '<span style="color:#d97706">Advertising</span>' : '<span style="color:#0284c7">Subscription</span>';
      var status = p.active ? '<span class="pc-active">Active</span>' : '<span class="pc-inactive">Inactive</span>';
      h += '<tr><td><strong>' + p.code + '</strong></td><td>' + p.discount_percent + '%</td><td>' + term + '</td><td>' + appliesLabel + '</td><td>' + (p.times_used || 0) + '</td><td>' + status + '</td>';
      h += '<td><button class="pc-del" onclick="togglePromoCode(\'' + p.id + '\',' + !p.active + ')" title="' + (p.active ? 'Deactivate' : 'Activate') + '">' + (p.active ? 'x' : 'on') + '</button></td></tr>';
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
  var months = parseInt(document.getElementById('pc-new-months').value) || 0;
  var applies = document.getElementById('pc-new-applies').value || 'subscription';

  if (!code) { showNotification('Enter a promo code', 'error'); return; }
  if (discount < 1 || discount > 100) { showNotification('Discount must be 1-100%', 'error'); return; }

  try {
    var r = await supabaseClient.from('promo_codes').insert([{
      code: code,
      discount_percent: discount,
      term_months: months || null,
      applies_to: applies,
      active: true
    }]);
    if (r.error) { showNotification('Error: ' + r.error.message, 'error'); return; }
    showNotification('Promo code ' + code + ' created', 'success');
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
  if (document.getElementById('pc-admin-container')) return;

  // Find "Support Messages" or "All Users" heading
  var target = null;
  document.querySelectorAll('h2, h3').forEach(function(el) {
    var t = el.textContent.trim();
    if (t === 'Support Messages' || t === 'All Users') target = el;
  });
  if (!target) return;

  // Check admin badge exists
  var badge = document.querySelector('.bg-red-600');
  if (!badge || badge.textContent.trim() !== 'ADMIN') return;

  var section = target.closest('div');
  if (!section) return;

  var container = document.createElement('div');
  container.id = 'pc-admin-container';
  section.parentElement.appendChild(container);
  renderPromoAdmin(container);
}

// Inject promo input on signup page
function injectSignup() {
  if (document.querySelector('.pc-box')) return;

  // Find the "Start 14-Day Free Trial" button with handleSignup onclick
  var trialBtn = null;
  document.querySelectorAll('button').forEach(function(b) {
    var oc = b.getAttribute('onclick') || '';
    if (oc.indexOf('handleSignup') !== -1) trialBtn = b;
  });
  if (!trialBtn) return;
  if (trialBtn.dataset.pcDone) return;
  trialBtn.dataset.pcDone = '1';

  var box = document.createElement('div');
  box.className = 'pc-box';
  box.style.cssText = 'margin:8px 0;display:flex;gap:8px;align-items:center;justify-content:center';
  box.innerHTML = '<input class="pc-input" id="pc-signup-code" type="text" placeholder="Promo code (optional)" style="flex:1;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;text-transform:uppercase"><button class="pc-btn" type="button" onclick="applyPromoAtSignup()" style="padding:10px 16px;font-size:12px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:8px;cursor:pointer;white-space:nowrap">Apply Code</button>';
  trialBtn.parentElement.insertBefore(box, trialBtn);
}

// Apply promo code at signup
window.applyPromoAtSignup = async function() {
  var input = document.getElementById('pc-signup-code');
  if (!input || !input.value.trim()) { showNotification('Enter a promo code', 'error'); return; }
  var promo = await validatePromoCode(input.value);
  if (promo) {
    input.style.borderColor = '#0d9488';
    input.style.background = '#f0fdfa';
    // Store in sessionStorage so handleSignup can pick it up
    sessionStorage.setItem('pc_code', promo.code);
    sessionStorage.setItem('pc_discount', promo.discount_percent);
    sessionStorage.setItem('pc_months', promo.term_months || 6);
    sessionStorage.setItem('pc_id', promo.id);
    showNotification(promo.discount_percent + '% off for ' + (promo.term_months || 6) + ' months - applied after free trial!', 'success');
  } else {
    input.style.borderColor = '#ef4444';
    input.style.background = '#fef2f2';
    sessionStorage.removeItem('pc_code');
    showNotification('Invalid or expired promo code', 'error');
  }
};

// Hook into signup to redeem code after account creation
var _origSignup = window.handleSignup;
if (typeof _origSignup === 'function') {
  window.handleSignup = async function() {
    await _origSignup.apply(this, arguments);
    // After signup, check if promo was applied
    var pcId = sessionStorage.getItem('pc_id');
    if (pcId && typeof currentUser !== 'undefined' && currentUser) {
      try {
        var code = sessionStorage.getItem('pc_code');
        var discount = parseInt(sessionStorage.getItem('pc_discount')) || 0;
        var months = parseInt(sessionStorage.getItem('pc_months')) || 6;
        // Increment usage count
        var ur = await supabaseClient.from('promo_codes').select('times_used').eq('id', pcId).single();
        if (ur.data) {
          await supabaseClient.from('promo_codes').update({ times_used: (ur.data.times_used || 0) + 1 }).eq('id', pcId);
        }
        // Record redemption
        await supabaseClient.from('promo_redemptions').insert([{
          user_id: currentUser.id,
          promo_code_id: pcId,
          code: code,
          discount_percent: discount
        }]);
        // Apply discount to subscription
        await supabaseClient.from('subscriptions').update({
          discount_percent: discount,
          discount_months: months,
          discount_start_date: new Date().toISOString()
        }).eq('user_id', currentUser.id);
        sessionStorage.removeItem('pc_code');
        sessionStorage.removeItem('pc_discount');
        sessionStorage.removeItem('pc_months');
        sessionStorage.removeItem('pc_id');
      } catch(e) { console.error('Promo redeem error:', e); }
    }
  };
}

var _t = null;
var _promoRedeemed = false;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(async function() {
    injectSignup();
    injectAdmin();

    // Fallback: redeem stored promo after login completes
    if (!_promoRedeemed && sessionStorage.getItem('pc_id') && typeof currentUser !== 'undefined' && currentUser) {
      _promoRedeemed = true;
      try {
        var pcId = sessionStorage.getItem('pc_id');
        var code = sessionStorage.getItem('pc_code');
        var discount = parseInt(sessionStorage.getItem('pc_discount')) || 0;
        var months = parseInt(sessionStorage.getItem('pc_months')) || 6;

        var ur = await supabaseClient.from('promo_codes').select('times_used').eq('id', pcId).single();
        if (ur.data) {
          await supabaseClient.from('promo_codes').update({ times_used: (ur.data.times_used || 0) + 1 }).eq('id', pcId);
        }
        await supabaseClient.from('promo_redemptions').insert([{
          user_id: currentUser.id,
          promo_code_id: pcId,
          code: code,
          discount_percent: discount
        }]);
        await supabaseClient.from('subscriptions').update({
          discount_percent: discount,
          discount_months: months,
          discount_start_date: new Date().toISOString()
        }).eq('user_id', currentUser.id);

        sessionStorage.removeItem('pc_code');
        sessionStorage.removeItem('pc_discount');
        sessionStorage.removeItem('pc_months');
        sessionStorage.removeItem('pc_id');
        showNotification('Promo code applied to your account!', 'success');
      } catch(e) { console.error('Promo redeem error:', e); }
    }
  }, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Promo codes loaded');

} catch(e) {
  console.error('Promo codes error:', e);
}
})();
