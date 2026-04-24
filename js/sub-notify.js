// M4 Admin Subscription Notification
// Sends email to admin when a new user subscribes
// Additive only
(function(){
try {

var ADMIN_EMAIL = 'm4projectsanddesigns@gmail.com';
var ADMIN_EMAIL_2 = 'dennis@tradiesnetwork.com.au';

// Check for new subscriptions periodically
var _lastCheck = null;
var _checked = false;

async function checkNewSubscriptions() {
  if (!currentUser) return;
  // Only run for admin
  if (currentUser.email !== ADMIN_EMAIL && currentUser.email !== ADMIN_EMAIL_2) return;

  try {
    // Get subscriptions activated in last 24 hours
    var since = new Date();
    since.setHours(since.getHours() - 24);

    var r = await supabaseClient.from('subscriptions')
      .select('*')
      .eq('subscription_status', 'active')
      .gte('subscription_activated_at', since.toISOString())
      .order('subscription_activated_at', { ascending: false });

    if (!r.data || r.data.length === 0) return;

    // Check which ones we've already notified about
    var notifiedKey = 'sub_notified_' + new Date().toISOString().split('T')[0];
    var notified = [];
    try { notified = JSON.parse(sessionStorage.getItem(notifiedKey) || '[]'); } catch(e) {}

    var newSubs = r.data.filter(function(s) {
      return notified.indexOf(s.user_email) === -1 && s.user_email !== ADMIN_EMAIL;
    });

    if (newSubs.length === 0) return;

    // Send notification email for each new subscriber
    for (var i = 0; i < newSubs.length; i++) {
      var sub = newSubs[i];
      var html = '<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">' +
        '<div style="background:#0a0a0a;padding:20px;border-radius:8px 8px 0 0;text-align:center">' +
          '<img src="https://raw.githubusercontent.com/keithmurphy09/m4-streamline/main/tradies-network-text.png" style="max-width:200px;height:auto;">' +
        '</div>' +
        '<div style="padding:20px;background:#f8fafc;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;border-top:none">' +
          '<h2 style="color:#0d9488;margin:0 0 12px">New Subscriber!</h2>' +
          '<p><strong>Email:</strong> ' + sub.user_email + '</p>' +
          '<p><strong>Account Type:</strong> ' + (sub.account_type || 'sole_trader') + '</p>' +
          '<p><strong>Monthly Rate:</strong> $' + (sub.monthly_rate || 0) + '</p>' +
          '<p><strong>Subscribed:</strong> ' + new Date(sub.subscription_activated_at).toLocaleString() + '</p>' +
          (sub.discount_percent ? '<p><strong>Discount:</strong> ' + sub.discount_percent + '% for ' + (sub.discount_months || 'ongoing') + ' months</p>' : '') +
        '</div>' +
      '</div>';

      try {
        await fetch('https://xviustrrsuhidzbcpgow.supabase.co/functions/v1/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXVzdHJyc3VoaWR6YmNwZ293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODk1NDgsImV4cCI6MjA4NDM2NTU0OH0.CEcc50c1K2Qnh6rXt_1-_w30LzHvDniGLbqWhdOolRY'
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            to_email: ADMIN_EMAIL,
            to_name: 'Admin',
            subject: 'New Subscriber: ' + sub.user_email + ' (' + (sub.account_type || 'sole_trader') + ')',
            html_content: html
          })
        });

        // Also notify Dennis
        if (ADMIN_EMAIL_2) {
          await fetch('https://xviustrrsuhidzbcpgow.supabase.co/functions/v1/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXVzdHJyc3VoaWR6YmNwZ293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODk1NDgsImV4cCI6MjA4NDM2NTU0OH0.CEcc50c1K2Qnh6rXt_1-_w30LzHvDniGLbqWhdOolRY'
            },
            body: JSON.stringify({
              user_id: currentUser.id,
              to_email: ADMIN_EMAIL_2,
              to_name: 'Dennis',
              subject: 'New Subscriber: ' + sub.user_email + ' (' + (sub.account_type || 'sole_trader') + ')',
              html_content: html
            })
          });
        }
      } catch(e) { console.error('Sub notification error:', e); }

      notified.push(sub.user_email);
    }

    sessionStorage.setItem(notifiedKey, JSON.stringify(notified));

  } catch(e) {
    console.error('Sub check error:', e);
  }
}

// Check on login and every 5 minutes
var _t = null;
var _started = false;
new MutationObserver(function() {
  if (_started) return;
  if (!currentUser) return;
  if (currentUser.email !== ADMIN_EMAIL && currentUser.email !== ADMIN_EMAIL_2) { _started = true; return; }
  _started = true;
  
  setTimeout(checkNewSubscriptions, 3000);
  setInterval(checkNewSubscriptions, 5 * 60 * 1000);
}).observe(document.body, { childList: true, subtree: true });

console.log('Sub notifications loaded');

} catch(e) {
  console.error('Sub notification error:', e);
}
})();
