// M4 Trial Paywall
// Blocks app when trial expired and no active Stripe subscription
// Additive only
(function(){
try {

var STRIPE_WORKER = 'https://rough-leaf-6e8e.keithmurphy009.workers.dev';

var css = document.createElement('style');
css.textContent = [
'.pw-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}',
'.pw-card{max-width:680px;width:90%;text-align:center;color:#fff;padding:40px}',
'.pw-logo{font-size:28px;font-weight:800;margin-bottom:8px}',
'.pw-logo span{color:#2dd4bf}',
'.pw-tagline{font-size:13px;color:#64748b;font-style:italic;margin-bottom:32px}',
'.pw-title{font-size:32px;font-weight:800;margin-bottom:12px;line-height:1.2}',
'.pw-sub{font-size:16px;color:#94a3b8;margin-bottom:40px;line-height:1.6}',
'.pw-plans{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px}',
'.pw-plan{background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.1);border-radius:16px;padding:28px 24px;cursor:pointer;transition:all 0.2s;text-align:center}',
'.pw-plan:hover{border-color:#2dd4bf;background:rgba(45,212,191,0.05);transform:translateY(-2px)}',
'.pw-plan-name{font-size:18px;font-weight:700;margin-bottom:4px}',
'.pw-plan-price{font-size:36px;font-weight:800;color:#2dd4bf;margin-bottom:4px}',
'.pw-plan-price span{font-size:16px;font-weight:400;color:#94a3b8}',
'.pw-plan-desc{font-size:13px;color:#94a3b8;line-height:1.5}',
'.pw-plan-btn{margin-top:16px;padding:12px 28px;background:#0d9488;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;width:100%;transition:background 0.15s}',
'.pw-plan-btn:hover{background:#0f766e}',
'.pw-featured{border-color:#2dd4bf;position:relative}',
'.pw-featured-tag{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#0d9488;color:#fff;font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;white-space:nowrap}',
'.pw-footer{font-size:13px;color:#475569}',
'.pw-footer a{color:#2dd4bf;text-decoration:none}',
'.pw-footer a:hover{text-decoration:underline}',
'@media(max-width:600px){.pw-plans{grid-template-columns:1fr}.pw-title{font-size:24px}.pw-card{padding:24px}}'
].join('\n');
document.head.appendChild(css);

var _pwChecked = false;
var _pwShowing = false;

async function checkTrialStatus() {
  if (_pwChecked) return;
  if (typeof currentUser === 'undefined' || !currentUser) return;
  if (typeof subscription === 'undefined' || !subscription) return;

  _pwChecked = true;

  // Skip for admin
  if (currentUser.email === 'm4projectsanddesigns@gmail.com') return;

  // Only check trial users
  if (subscription.subscription_status !== 'trial') return;

  // Check if trial expired
  if (!subscription.trial_ends_at) return;
  var trialEnds = new Date(subscription.trial_ends_at);
  var now = new Date();
  var daysLeft = Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24));

  // Trial still active
  if (daysLeft > 0) return;

  // Trial expired - check if they have an active Stripe subscription
  try {
    var r = await fetch(STRIPE_WORKER + '/status?email=' + encodeURIComponent(currentUser.email));
    var stripeStatus = await r.json();

    if (stripeStatus.subscribed && stripeStatus.status === 'active') {
      // They have a Stripe subscription - update their status in Supabase
      var plan = stripeStatus.plan || 'sole_trader';
      var accountType = plan === 'business' ? 'business' : 'sole_trader';
      await supabaseClient.from('subscriptions').update({
        subscription_status: 'active',
        account_type: accountType,
        subscription_activated_at: new Date().toISOString()
      }).eq('user_id', currentUser.id);
      subscription.subscription_status = 'active';
      subscription.account_type = accountType;
      return;
    }
  } catch(e) {
    console.warn('Stripe status check failed:', e);
  }

  // No active subscription - show paywall
  showPaywall();
}

function showPaywall() {
  if (_pwShowing) return;
  _pwShowing = true;

  var overlay = document.createElement('div');
  overlay.className = 'pw-overlay';
  overlay.id = 'pw-overlay';

  var h = '<div class="pw-card">';
  h += '<div class="pw-logo">M4 <span>STREAMLINE</span></div>';
  h += '<div class="pw-tagline">"streamlining your business"</div>';
  h += '<div class="pw-title">Your free trial has ended</div>';
  h += '<div class="pw-sub">Thanks for trying M4 Streamline! To continue using all features, choose a plan below. Your data is safe and waiting for you.</div>';

  h += '<div class="pw-plans">';

  h += '<div class="pw-plan">';
  h += '<div class="pw-plan-name">Sole Trader</div>';
  h += '<div class="pw-plan-price">$79 <span>/month</span></div>';
  h += '<div class="pw-plan-desc">Perfect for one-person operations. All features included.</div>';
  h += '<button class="pw-plan-btn" onclick="subscribePlan(\'sole_trader\')">Choose Sole Trader</button>';
  h += '</div>';

  h += '<div class="pw-plan pw-featured">';
  h += '<div class="pw-featured-tag">MOST POPULAR</div>';
  h += '<div class="pw-plan-name">Business</div>';
  h += '<div class="pw-plan-price">$149 <span>/month</span></div>';
  h += '<div class="pw-plan-desc">For teams. Unlimited team members, full access for everyone.</div>';
  h += '<button class="pw-plan-btn" onclick="subscribePlan(\'business\')">Choose Business</button>';
  h += '</div>';

  h += '</div>';

  h += '<div class="pw-footer">Questions? <a href="mailto:m4projectsanddesigns@gmail.com">Contact us</a></div>';
  h += '</div>';

  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

// Check periodically
var _pwTimer = null;
var _pwObs = new MutationObserver(function() {
  if (_pwTimer) clearTimeout(_pwTimer);
  _pwTimer = setTimeout(checkTrialStatus, 1000);
});
_pwObs.observe(document.body, { childList: true, subtree: true });

console.log('Trial paywall loaded');

} catch(e) {
  console.error('Paywall error:', e);
}
})();
