// M4 Support Chat Widget
// Floating chat icon bottom-right, message form, saves to Supabase
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.sc-fab{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#0d9488,#14b8a6);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(13,148,136,0.4);z-index:9999;display:flex;align-items:center;justify-content:center;transition:all 0.2s;font-family:inherit}',
'.sc-fab:hover{transform:scale(1.08);box-shadow:0 6px 24px rgba(13,148,136,0.5)}',
'.sc-fab svg{width:26px;height:26px}',
'.sc-badge{position:absolute;top:-2px;right:-2px;width:14px;height:14px;border-radius:50%;background:#ef4444;border:2px solid #fff}',
'',
'.sc-panel{position:fixed;bottom:92px;right:24px;width:340px;max-height:480px;background:#fff;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,0.15);z-index:9999;overflow:hidden;display:none;flex-direction:column;border:1px solid #e2e8f0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}',
'.dark .sc-panel{background:#1f2937;border-color:#374151}',
'.sc-panel.sc-open{display:flex}',
'',
'.sc-header{padding:20px;background:linear-gradient(135deg,#0d9488,#14b8a6);color:#fff;position:relative}',
'.sc-header-title{font-size:16px;font-weight:700;margin:0 0 4px}',
'.sc-header-sub{font-size:12px;opacity:0.8;margin:0}',
'.sc-close{position:absolute;top:16px;right:16px;background:none;border:none;color:#fff;font-size:20px;cursor:pointer;opacity:0.7;line-height:1}',
'.sc-close:hover{opacity:1}',
'',
'.sc-body{padding:20px;flex:1;overflow-y:auto}',
'.sc-offline{padding:12px 16px;background:#fef3c7;border-radius:10px;border:1px solid #fde68a;margin-bottom:16px;font-size:12px;color:#92400e;line-height:1.5}',
'.dark .sc-offline{background:rgba(146,64,14,0.15);border-color:rgba(253,230,138,0.2);color:#fbbf24}',
'',
'.sc-field{margin-bottom:14px}',
'.sc-field label{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:4px}',
'.dark .sc-field label{color:#d1d5db}',
'.sc-field input,.sc-field textarea,.sc-field select{width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;background:#fff;color:#0f172a;box-sizing:border-box}',
'.dark .sc-field input,.dark .sc-field textarea,.dark .sc-field select{background:#374151;border-color:#4b5563;color:#fff}',
'.sc-field textarea{resize:vertical;min-height:80px}',
'',
'.sc-send{width:100%;padding:12px;background:#0d9488;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.15s}',
'.sc-send:hover{background:#0f766e}',
'.sc-send:disabled{opacity:0.5;cursor:not-allowed}',
'',
'.sc-success{text-align:center;padding:32px 20px}',
'.sc-success-icon{font-size:48px;margin-bottom:12px}',
'.sc-success-title{font-size:16px;font-weight:700;color:#0f172a;margin-bottom:8px}',
'.dark .sc-success-title{color:#fff}',
'.sc-success-text{font-size:13px;color:#64748b;line-height:1.5}',
'.sc-success-btn{margin-top:16px;padding:10px 20px;background:#f1f5f9;border:none;border-radius:8px;font-size:13px;font-weight:600;color:#374151;cursor:pointer;font-family:inherit}',
'.dark .sc-success-btn{background:#374151;color:#d1d5db}',
'',
'@media(max-width:480px){.sc-panel{right:12px;left:12px;width:auto;bottom:84px}.sc-fab{bottom:16px;right:16px}}'
].join('\n');
document.head.appendChild(css);

var _scOpen = false;
var _scSent = false;

// Create FAB
var fab = document.createElement('button');
fab.className = 'sc-fab';
fab.id = 'sc-fab';
fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
fab.onclick = function() { toggleChat(); };

// Create panel
var panel = document.createElement('div');
panel.className = 'sc-panel';
panel.id = 'sc-panel';

function renderForm() {
  var name = '';
  var email = '';
  if (typeof currentUser !== 'undefined' && currentUser) {
    email = currentUser.email || '';
  }
  if (typeof companySettings !== 'undefined' && companySettings) {
    name = companySettings.business_name || '';
  }

  panel.innerHTML =
    '<div class="sc-header">' +
      '<div class="sc-header-title">Need Help?</div>' +
      '<div class="sc-header-sub">We typically reply within a few hours</div>' +
      '<button class="sc-close" onclick="toggleChat()">&times;</button>' +
    '</div>' +
    '<div class="sc-body">' +
      '<div class="sc-offline">We are currently offline, but leave your message and we will reply as soon as possible.</div>' +
      '<div class="sc-field">' +
        '<label>Name</label>' +
        '<input type="text" id="sc-name" value="' + (name ? name.replace(/"/g, '&quot;') : '') + '" placeholder="Your name">' +
      '</div>' +
      '<div class="sc-field">' +
        '<label>Email</label>' +
        '<input type="email" id="sc-email" value="' + (email ? email.replace(/"/g, '&quot;') : '') + '" placeholder="your@email.com">' +
      '</div>' +
      '<div class="sc-field">' +
        '<label>Topic</label>' +
        '<select id="sc-topic">' +
          '<option value="general">General Question</option>' +
          '<option value="bug">Bug Report</option>' +
          '<option value="feature">Feature Request</option>' +
          '<option value="billing">Billing / Account</option>' +
          '<option value="xero">Xero Integration</option>' +
        '</select>' +
      '</div>' +
      '<div class="sc-field">' +
        '<label>Message *</label>' +
        '<textarea id="sc-message" placeholder="Tell us how we can help..."></textarea>' +
      '</div>' +
      '<button class="sc-send" id="sc-send-btn" onclick="sendSupportMessage()">Send Message</button>' +
    '</div>';
}

function renderSuccess() {
  panel.innerHTML =
    '<div class="sc-header">' +
      '<div class="sc-header-title">Message Sent!</div>' +
      '<div class="sc-header-sub">We will get back to you soon</div>' +
      '<button class="sc-close" onclick="toggleChat()">&times;</button>' +
    '</div>' +
    '<div class="sc-success">' +
      '<div class="sc-success-icon">&#9989;</div>' +
      '<div class="sc-success-title">Thanks for reaching out!</div>' +
      '<div class="sc-success-text">Your message has been received. We will reply to your email as soon as possible.</div>' +
      '<button class="sc-success-btn" onclick="scNewMessage()">Send Another Message</button>' +
    '</div>';
}

window.toggleChat = function() {
  _scOpen = !_scOpen;
  if (_scOpen) {
    if (_scSent) { renderSuccess(); } else { renderForm(); }
    panel.classList.add('sc-open');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  } else {
    panel.classList.remove('sc-open');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  }
};

window.scNewMessage = function() {
  _scSent = false;
  renderForm();
};

window.sendSupportMessage = async function() {
  var msg = document.getElementById('sc-message');
  if (!msg || !msg.value.trim()) {
    showNotification('Please enter a message', 'error');
    return;
  }

  var btn = document.getElementById('sc-send-btn');
  if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }

  try {
    var data = {
      user_id: (typeof currentUser !== 'undefined' && currentUser) ? currentUser.id : null,
      user_name: (document.getElementById('sc-name') || {}).value || null,
      user_email: (document.getElementById('sc-email') || {}).value || null,
      message: msg.value.trim(),
      page: (document.getElementById('sc-topic') || {}).value || 'general',
      status: 'new'
    };

    var r = await supabaseClient.from('support_messages').insert([data]);
    if (r.error) throw r.error;

    _scSent = true;
    renderSuccess();
    console.log('Support message saved - admin will see badge notification');

  } catch(e) {
    console.error('Support message error:', e);
    showNotification('Error sending message. Please try again.', 'error');
    if (btn) { btn.textContent = 'Send Message'; btn.disabled = false; }
  }
};

// Don't show on landing page
function shouldShow() {
  return typeof currentUser !== 'undefined' && currentUser;
}

// Add to DOM when logged in
var _scTimer = null;
var _scAdded = false;
var _scObs = new MutationObserver(function() {
  if (_scTimer) clearTimeout(_scTimer);
  _scTimer = setTimeout(function() {
    if (shouldShow() && !_scAdded) {
      document.body.appendChild(fab);
      document.body.appendChild(panel);
      _scAdded = true;
    }
    if (!shouldShow() && _scAdded) {
      if (fab.parentElement) fab.remove();
      if (panel.parentElement) panel.remove();
      _scAdded = false;
    }
  }, 500);
});
_scObs.observe(document.body, { childList: true, subtree: true });

console.log('Support chat widget loaded');

} catch(e) {
  console.error('Support chat error:', e);
}
})();
