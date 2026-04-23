// M4 Refer a Friend
// Floating button, sends invite, both get 20% off 2 months on signup
// Additive only
(function(){
try {

var REWARD_PERCENT = 20;
var REWARD_MONTHS = 2;

var css = document.createElement('style');
css.textContent = '.rf-fab{position:fixed;bottom:80px;right:24px;background:linear-gradient(135deg,#0d9488,#14b8a6);color:#fff;border:none;border-radius:28px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(13,148,136,0.4);z-index:9998;display:flex;align-items:center;gap:6px;font-family:inherit;transition:all 0.2s}.rf-fab:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(13,148,136,0.5)}.rf-fab svg{width:18px;height:18px;fill:currentColor}.rf-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px}.rf-box{background:#fff;border-radius:16px;padding:28px;max-width:440px;width:100%}.dark .rf-box{background:#1f2937}.rf-title{font-size:20px;font-weight:800;margin-bottom:4px}.dark .rf-title{color:#fff}.rf-sub{font-size:13px;color:#64748b;margin-bottom:20px;line-height:1.5}.rf-input{width:100%;padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;font-family:inherit;margin-bottom:12px;box-sizing:border-box}.dark .rf-input{background:#374151;border-color:#4b5563;color:#fff}.rf-send{width:100%;padding:12px;font-size:14px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:10px;cursor:pointer;font-family:inherit}.rf-send:hover{background:#0f766e}.rf-send:disabled{opacity:0.5;cursor:not-allowed}.rf-close{background:none;border:none;font-size:22px;color:#94a3b8;cursor:pointer;float:right}.rf-list{margin-top:20px;border-top:1px solid #e2e8f0;padding-top:16px}.dark .rf-list{border-color:#4b5563}.rf-list-title{font-size:13px;font-weight:700;color:#64748b;margin-bottom:8px}.rf-ref{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:12px;border-bottom:1px solid #f1f5f9}.dark .rf-ref{border-color:#374151}.rf-ref-email{color:#0f172a;font-weight:500}.dark .rf-ref-email{color:#fff}.rf-ref-status{font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px}.rf-pending{background:#fef3c7;color:#d97706}.rf-converted{background:#d1fae5;color:#059669}.rf-reward{background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:12px;margin-bottom:16px;font-size:12px;color:#0f766e;text-align:center;line-height:1.4}.dark .rf-reward{background:rgba(13,148,136,0.1);border-color:#0d9488;color:#2dd4bf}@media(max-width:768px){.rf-fab{bottom:70px;right:12px;padding:8px 14px;font-size:11px}.rf-fab span{display:none}}';
document.head.appendChild(css);

var _rfAdded = false;

function shouldShow() {
  return typeof currentUser !== 'undefined' && currentUser;
}

function addReferralButton() {
  if (_rfAdded) return;
  if (!shouldShow()) return;
  if (document.getElementById('rf-fab')) return;

  // Don't show on landing page
  var landing = document.getElementById('landing');
  if (landing && landing.offsetHeight > 0) return;

  _rfAdded = true;

  var fab = document.createElement('button');
  fab.className = 'rf-fab';
  fab.id = 'rf-fab';
  fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg><span>Refer a Friend</span>';
  fab.onclick = openReferralModal;
  document.body.appendChild(fab);
}

async function openReferralModal() {
  if (document.getElementById('rf-modal')) return;

  // Load existing referrals
  var referrals = [];
  try {
    var r = await supabaseClient.from('referrals').select('*').eq('referrer_user_id', currentUser.id).order('created_at', { ascending: false });
    referrals = r.data || [];
  } catch(e) {}

  var overlay = document.createElement('div');
  overlay.className = 'rf-modal';
  overlay.id = 'rf-modal';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  var h = '<div class="rf-box">';
  h += '<button class="rf-close" onclick="document.getElementById(\'rf-modal\').remove()">&times;</button>';
  h += '<div class="rf-title">Refer a Friend</div>';
  h += '<div class="rf-sub">Invite a mate to try M4 Streamline. When they subscribe, you BOTH get <strong>' + REWARD_PERCENT + '% off for ' + REWARD_MONTHS + ' months!</strong></div>';

  h += '<div class="rf-reward">Your referral link discount is applied automatically after their 14-day free trial ends.</div>';

  h += '<input class="rf-input" id="rf-email" type="email" placeholder="Enter your friend\'s email">';
  h += '<button class="rf-send" id="rf-send-btn" onclick="sendReferral()">Send Invite</button>';

  // Show existing referrals
  if (referrals.length > 0) {
    h += '<div class="rf-list">';
    h += '<div class="rf-list-title">Your Referrals</div>';
    referrals.forEach(function(ref) {
      var statusClass = ref.status === 'converted' ? 'rf-converted' : 'rf-pending';
      var statusText = ref.status === 'converted' ? 'Subscribed' : 'Pending';
      h += '<div class="rf-ref"><span class="rf-ref-email">' + ref.referred_email + '</span><span class="rf-ref-status ' + statusClass + '">' + statusText + '</span></div>';
    });
    h += '</div>';
  }

  h += '</div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

window.sendReferral = async function() {
  var input = document.getElementById('rf-email');
  var btn = document.getElementById('rf-send-btn');
  if (!input || !input.value.trim()) { showNotification('Enter an email address', 'error'); return; }

  var email = input.value.trim().toLowerCase();

  // Don't refer yourself
  if (email === currentUser.email) { showNotification('You cannot refer yourself', 'error'); return; }

  // Check if already referred
  try {
    var existing = await supabaseClient.from('referrals').select('id').eq('referrer_user_id', currentUser.id).eq('referred_email', email);
    if (existing.data && existing.data.length > 0) { showNotification('You have already referred this email', 'error'); return; }
  } catch(e) {}

  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    // Save referral
    var r = await supabaseClient.from('referrals').insert([{
      referrer_user_id: currentUser.id,
      referrer_email: currentUser.email,
      referred_email: email,
      status: 'pending'
    }]);

    if (r.error) {
      showNotification('Error: ' + r.error.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Send Invite';
      return;
    }

    // Send invite email
    try {
      var fromName = 'Tradies Network';
      try {
        if (typeof companySettings !== 'undefined' && companySettings && companySettings.business_name) {
          fromName = companySettings.business_name;
        }
      } catch(e) {}

      var signupUrl = window.location.href.split('?')[0].split('#')[0];
      var htmlContent = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">' +
        '<div style="text-align:center;padding:20px;background:#0a0a0a;border-radius:8px;">' +
          '<img src="https://raw.githubusercontent.com/keithmurphy09/m4-streamline/main/tradies-network-text.png" style="max-width:220px;height:auto;margin:10px auto;display:block;">' +
          '<p style="color:#2dd4bf;font-size:12px;margin:0;">Powered by M4 STREAMLINE</p>' +
        '</div>' +
        '<p style="margin-top:20px;">Hey!</p>' +
        '<p>Your mate <strong>' + (fromName || currentUser.email) + '</strong> thinks you\'d love M4 Streamline - the all-in-one business management app for tradies.</p>' +
        '<p>Sign up now and you\'ll <strong>both get ' + REWARD_PERCENT + '% off for ' + REWARD_MONTHS + ' months</strong> when you subscribe after your free 14-day trial.</p>' +
        '<p style="margin:30px 0;"><a href="' + signupUrl + '" style="background:#0d9488;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;font-size:16px;">Start Your Free Trial</a></p>' +
        '<p style="color:#94a3b8;font-size:12px;">No credit card required. Cancel anytime.</p>' +
        '<div style="margin-top:30px;padding-top:15px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;">This is an automated referral from M4 Streamline / Tradies Network</div>' +
      '</div>';

      await fetch('https://xviustrrsuhidzbcpgow.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXVzdHJyc3VoaWR6YmNwZ293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODk1NDgsImV4cCI6MjA4NDM2NTU0OH0.CEcc50c1K2Qnh6rXt_1-_w30LzHvDniGLbqWhdOolRY'
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          to_email: email,
          to_name: email.split('@')[0],
          subject: fromName + ' thinks you\'d love M4 Streamline!',
          html_content: htmlContent
        })
      });
    } catch(e) {
      // Email failed but referral still saved
      console.error('Referral email error:', e);
    }

    showNotification('Referral sent to ' + email + '!', 'success');
    document.getElementById('rf-modal').remove();

  } catch(e) {
    showNotification('Error: ' + e.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Send Invite';
  }
};

// Check on login if current user was referred
async function checkReferralOnLogin() {
  if (!currentUser) return;
  try {
    // Check if this user's email has a pending referral
    var r = await supabaseClient.from('referrals').select('*').eq('referred_email', currentUser.email).eq('status', 'pending').limit(1);
    if (!r.data || r.data.length === 0) return;

    var referral = r.data[0];

    // Check if user has an active subscription (not just trial)
    var sub = await supabaseClient.from('subscriptions').select('*').eq('user_id', currentUser.id).limit(1);
    if (!sub.data || sub.data.length === 0) return;
    if (sub.data[0].subscription_status === 'trial') return; // Wait until they actually subscribe

    // User has subscribed! Apply rewards to both
    // Update referral status
    await supabaseClient.from('referrals').update({
      status: 'converted',
      referred_user_id: currentUser.id,
      converted_at: new Date().toISOString()
    }).eq('id', referral.id);

    // Apply discount to referred user (this user)
    await supabaseClient.from('subscriptions').update({
      discount_percent: REWARD_PERCENT,
      discount_months: REWARD_MONTHS,
      discount_start_date: new Date().toISOString()
    }).eq('user_id', currentUser.id);

    // Apply discount to referrer
    await supabaseClient.from('subscriptions').update({
      discount_percent: REWARD_PERCENT,
      discount_months: REWARD_MONTHS,
      discount_start_date: new Date().toISOString()
    }).eq('user_id', referral.referrer_user_id);

    showNotification('Referral reward applied! ' + REWARD_PERCENT + '% off for ' + REWARD_MONTHS + ' months!', 'success');

  } catch(e) {
    console.error('Referral check error:', e);
  }
}

var _t = null;
var _checked = false;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(function() {
    addReferralButton();
    if (!_checked && currentUser) {
      _checked = true;
      checkReferralOnLogin();
    }
  }, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Refer a Friend loaded');

} catch(e) {
  console.error('Referral error:', e);
}
})();
