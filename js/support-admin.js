// M4 Support Admin Panel
// Adds Support Messages section to admin panel + email notification on new message
// Additive only
(function(){
try {

var XERO_WORKER = 'https://round-paper-a015.keithmurphy009.workers.dev';

var css = document.createElement('style');
css.textContent = [
'.sa-wrap{max-width:900px;margin:0 auto}',
'.sa-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px}',
'.sa-title{font-size:22px;font-weight:800;color:#0f172a}',
'.dark .sa-title{color:#fff}',
'.sa-filters{display:flex;gap:8px}',
'.sa-filter{padding:6px 14px;font-size:12px;font-weight:600;border:1px solid #e2e8f0;background:#fff;color:#64748b;border-radius:8px;cursor:pointer;font-family:inherit}',
'.dark .sa-filter{background:#374151;border-color:#4b5563;color:#9ca3af}',
'.sa-filter.active{background:#0d9488;color:#fff;border-color:#0d9488}',
'',
'.sa-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:12px;cursor:pointer;transition:all 0.15s}',
'.dark .sa-card{background:#1f2937;border-color:#374151}',
'.sa-card:hover{border-color:#0d9488;box-shadow:0 2px 8px rgba(13,148,136,0.1)}',
'.sa-card.sa-new{border-left:4px solid #0d9488}',
'.sa-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}',
'.sa-card-name{font-size:14px;font-weight:700;color:#0f172a}',
'.dark .sa-card-name{color:#fff}',
'.sa-card-time{font-size:11px;color:#94a3b8}',
'.sa-card-topic{display:inline-block;padding:2px 8px;font-size:10px;font-weight:700;border-radius:6px;text-transform:uppercase}',
'.sa-topic-general{background:#f1f5f9;color:#64748b}',
'.sa-topic-bug{background:#fef2f2;color:#ef4444}',
'.sa-topic-feature{background:#f0fdf4;color:#16a34a}',
'.sa-topic-billing{background:#fef3c7;color:#d97706}',
'.sa-topic-xero{background:#e0f2fe;color:#0284c7}',
'.sa-card-msg{font-size:13px;color:#475569;line-height:1.5;margin-top:8px}',
'.dark .sa-card-msg{color:#9ca3af}',
'.sa-card-email{font-size:11px;color:#94a3b8;margin-top:4px}',
'',
'.sa-badge-new{display:inline-block;padding:2px 8px;font-size:10px;font-weight:700;background:#0d9488;color:#fff;border-radius:10px;margin-left:6px}',
'.sa-badge-read{display:inline-block;padding:2px 8px;font-size:10px;font-weight:700;background:#94a3b8;color:#fff;border-radius:10px;margin-left:6px}',
'.sa-badge-replied{display:inline-block;padding:2px 8px;font-size:10px;font-weight:700;background:#10b981;color:#fff;border-radius:10px;margin-left:6px}',
'',
'.sa-detail{background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden}',
'.dark .sa-detail{background:#1f2937;border-color:#374151}',
'.sa-detail-header{padding:20px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between}',
'.dark .sa-detail-header{border-bottom-color:#374151}',
'.sa-back{padding:8px 16px;font-size:13px;font-weight:600;background:#f1f5f9;border:none;border-radius:8px;cursor:pointer;color:#374151;font-family:inherit}',
'.dark .sa-back{background:#374151;color:#d1d5db}',
'.sa-detail-body{padding:20px}',
'.sa-msg-bubble{padding:14px 18px;border-radius:12px;margin-bottom:12px;max-width:85%}',
'.sa-msg-user{background:#f1f5f9;color:#0f172a;border-bottom-left-radius:4px}',
'.dark .sa-msg-user{background:#374151;color:#e2e8f0}',
'.sa-msg-reply{background:#0d9488;color:#fff;margin-left:auto;border-bottom-right-radius:4px}',
'.sa-msg-meta{font-size:10px;opacity:0.6;margin-top:6px}',
'.sa-reply-box{padding:20px;border-top:1px solid #e2e8f0}',
'.dark .sa-reply-box{border-top-color:#374151}',
'.sa-reply-input{width:100%;padding:12px;border:1px solid #e2e8f0;border-radius:10px;font-size:13px;font-family:inherit;resize:vertical;min-height:80px;box-sizing:border-box}',
'.dark .sa-reply-input{background:#374151;border-color:#4b5563;color:#fff}',
'.sa-reply-actions{display:flex;gap:8px;margin-top:10px;justify-content:flex-end}',
'.sa-reply-btn{padding:10px 20px;font-size:13px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit}',
'.sa-reply-btn:hover{background:#0f766e}',
'.sa-reply-btn:disabled{opacity:0.5;cursor:not-allowed}',
'.sa-delete-btn{padding:10px 16px;font-size:13px;font-weight:600;background:#fff;color:#ef4444;border:1px solid #fecaca;border-radius:8px;cursor:pointer;font-family:inherit}',
'.dark .sa-delete-btn{background:#374151;border-color:#991b1b}',
'',
'.sa-empty{text-align:center;padding:60px 20px;color:#94a3b8}',
'.sa-empty p{font-size:14px;margin-top:8px}',
'',
'.sa-nav-badge{position:absolute;top:-4px;right:-8px;min-width:18px;height:18px;border-radius:9px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px}'
].join('\n');
document.head.appendChild(css);

// State
var _saMessages = [];
var _saFilter = 'all';
var _saDetail = null;
var _saLoaded = false;

// ============ LOAD MESSAGES ============
async function loadMessages() {
  try {
    var oid = (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : (currentUser ? currentUser.id : null);
    if (!oid) return;
    var r = await supabaseClient.from('support_messages').select('*').order('created_at', { ascending: false });
    _saMessages = r.data || [];
    _saLoaded = true;
  } catch(e) { console.error('Support load error:', e); }
}

// ============ RENDER SUPPORT TAB ============
function renderSupportAdmin() {
  var filtered = _saMessages;
  if (_saFilter === 'new') filtered = _saMessages.filter(function(m) { return m.status === 'new'; });
  if (_saFilter === 'replied') filtered = _saMessages.filter(function(m) { return m.status === 'replied'; });

  var newCount = _saMessages.filter(function(m) { return m.status === 'new'; }).length;

  if (_saDetail) return renderDetail(_saDetail);

  var h = '<div class="sa-wrap">';
  h += '<div class="sa-header">';
  h += '<div class="sa-title">Support Messages' + (newCount > 0 ? ' <span class="sa-badge-new">' + newCount + ' new</span>' : '') + '</div>';
  h += '<div class="sa-filters">';
  h += '<button class="sa-filter ' + (_saFilter === 'all' ? 'active' : '') + '" onclick="saSetFilter(\'all\')">All (' + _saMessages.length + ')</button>';
  h += '<button class="sa-filter ' + (_saFilter === 'new' ? 'active' : '') + '" onclick="saSetFilter(\'new\')">New (' + newCount + ')</button>';
  h += '<button class="sa-filter ' + (_saFilter === 'replied' ? 'active' : '') + '" onclick="saSetFilter(\'replied\')">Replied</button>';
  h += '</div></div>';

  if (filtered.length === 0) {
    h += '<div class="sa-empty"><div style="font-size:48px;">&#128172;</div><p>No messages yet.</p></div>';
  } else {
    filtered.forEach(function(m) {
      var topicClass = 'sa-topic-' + (m.page || 'general');
      var timeAgo = getTimeAgo(m.created_at);
      var statusBadge = m.status === 'new' ? '<span class="sa-badge-new">NEW</span>' : (m.status === 'replied' ? '<span class="sa-badge-replied">REPLIED</span>' : '<span class="sa-badge-read">READ</span>');

      h += '<div class="sa-card ' + (m.status === 'new' ? 'sa-new' : '') + '" onclick="saOpenMessage(\'' + m.id + '\')">';
      h += '<div class="sa-card-head">';
      h += '<div><span class="sa-card-name">' + escH(m.user_name || 'Anonymous') + '</span> ' + statusBadge + '</div>';
      h += '<span class="sa-card-time">' + timeAgo + '</span>';
      h += '</div>';
      h += '<div><span class="sa-card-topic ' + topicClass + '">' + escH(m.page || 'general') + '</span></div>';
      h += '<div class="sa-card-msg">' + escH(m.message).substring(0, 150) + (m.message && m.message.length > 150 ? '...' : '') + '</div>';
      if (m.user_email) h += '<div class="sa-card-email">' + escH(m.user_email) + '</div>';
      h += '</div>';
    });
  }

  h += '</div>';
  return h;
}

function renderDetail(msg) {
  var h = '<div class="sa-wrap">';
  h += '<div class="sa-detail">';

  h += '<div class="sa-detail-header">';
  h += '<button class="sa-back" onclick="saBack()">&#8592; Back</button>';
  h += '<div style="display:flex;align-items:center;gap:8px;">';
  h += '<span class="sa-card-topic sa-topic-' + (msg.page || 'general') + '">' + escH(msg.page || 'general') + '</span>';
  h += '<span style="font-size:11px;color:#94a3b8;">' + getTimeAgo(msg.created_at) + '</span>';
  h += '</div></div>';

  h += '<div class="sa-detail-body">';
  h += '<div style="margin-bottom:8px;font-size:14px;font-weight:700;color:#0f172a;" class="dark:text-white">' + escH(msg.user_name || 'Anonymous') + '</div>';
  if (msg.user_email) h += '<div style="font-size:12px;color:#94a3b8;margin-bottom:16px;">' + escH(msg.user_email) + '</div>';

  // User message
  h += '<div class="sa-msg-bubble sa-msg-user">';
  h += '<div style="font-size:13px;line-height:1.6;white-space:pre-wrap;">' + escH(msg.message) + '</div>';
  h += '<div class="sa-msg-meta">' + formatDate(msg.created_at) + '</div>';
  h += '</div>';

  // Reply if exists
  if (msg.reply) {
    h += '<div class="sa-msg-bubble sa-msg-reply">';
    h += '<div style="font-size:13px;line-height:1.6;white-space:pre-wrap;">' + escH(msg.reply) + '</div>';
    h += '<div class="sa-msg-meta">' + formatDate(msg.replied_at) + '</div>';
    h += '</div>';
  }

  h += '</div>';

  // Reply box
  h += '<div class="sa-reply-box">';
  h += '<textarea class="sa-reply-input" id="sa-reply-text" placeholder="Type your reply...">' + (msg.reply || '') + '</textarea>';
  h += '<div class="sa-reply-actions">';
  h += '<button class="sa-delete-btn" onclick="saDeleteMessage(\'' + msg.id + '\')">Delete</button>';
  h += '<button class="sa-reply-btn" id="sa-reply-btn" onclick="saSendReply(\'' + msg.id + '\')">' + (msg.reply ? 'Update Reply' : 'Send Reply') + '</button>';
  h += '</div></div>';

  h += '</div></div>';
  return h;
}

// ============ ACTIONS ============
window.saSetFilter = function(f) {
  _saFilter = f;
  _saDetail = null;
  renderApp();
};

window.saBack = function() {
  _saDetail = null;
  renderApp();
};

window.saOpenMessage = async function(id) {
  var msg = _saMessages.find(function(m) { return m.id === id; });
  if (!msg) return;

  // Mark as read
  if (msg.status === 'new') {
    msg.status = 'read';
    await supabaseClient.from('support_messages').update({ status: 'read' }).eq('id', id);
  }

  _saDetail = msg;
  renderApp();
};

window.saSendReply = async function(id) {
  var txt = document.getElementById('sa-reply-text');
  if (!txt || !txt.value.trim()) { showNotification('Please enter a reply', 'error'); return; }

  var btn = document.getElementById('sa-reply-btn');
  if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }

  try {
    var reply = txt.value.trim();
    var now = new Date().toISOString();

    await supabaseClient.from('support_messages').update({
      reply: reply,
      status: 'replied',
      replied_at: now
    }).eq('id', id);

    var msg = _saMessages.find(function(m) { return m.id === id; });
    if (msg) {
      msg.reply = reply;
      msg.status = 'replied';
      msg.replied_at = now;
    }

    // Send email notification to user
    if (msg && msg.user_email) {
      try {
        await sendReplyEmail(msg.user_email, msg.user_name, reply);
      } catch(e) { console.warn('Email send failed:', e); }
    }

    showNotification('Reply sent!', 'success');
    _saDetail = msg;
    renderApp();
  } catch(e) {
    showNotification('Error: ' + e.message, 'error');
    if (btn) { btn.textContent = 'Send Reply'; btn.disabled = false; }
  }
};

window.saDeleteMessage = async function(id) {
  if (!confirm('Delete this message?')) return;
  try {
    await supabaseClient.from('support_messages').delete().eq('id', id);
    _saMessages = _saMessages.filter(function(m) { return m.id !== id; });
    _saDetail = null;
    showNotification('Message deleted', 'success');
    renderApp();
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
};

// ============ EMAIL REPLY ============
async function sendReplyEmail(to, name, reply) {
  // Use mailto as fallback - opens email client
  var subject = encodeURIComponent('M4 Streamline Support - Reply');
  var body = encodeURIComponent('Hi ' + (name || '') + ',\n\n' + reply + '\n\nRegards,\nM4 Streamline Support\nhttps://www.m4streamline.com');
  window.open('mailto:' + to + '?subject=' + subject + '&body=' + body, '_blank');
}

// ============ HELPERS ============
function escH(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }

function getTimeAgo(date) {
  if (!date) return '';
  var now = new Date();
  var d = new Date(date);
  var diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return d.toLocaleDateString();
}

function formatDate(date) {
  if (!date) return '';
  var d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ============ INJECT INTO ADMIN PANEL ============
function injectSupportTab() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'admin' && activeTab !== 'company') return;

  // Find admin panel content
  var h2 = null;
  document.querySelectorAll('h2').forEach(function(el) {
    if (el.textContent.trim() === 'All Users') h2 = el;
  });
  if (!h2) return;
  if (document.getElementById('sa-section')) return;

  var container = h2.closest('.bg-white, .dark\\:bg-gray-800') || h2.parentElement;
  if (!container || !container.parentElement) return;
  var parent = container.parentElement;

  // Add Support Messages section
  var section = document.createElement('div');
  section.id = 'sa-section';
  section.className = 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-6';

  var newCount = _saMessages.filter(function(m) { return m.status === 'new'; }).length;

  section.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;" onclick="saTogglePanel()">' +
      '<h3 class="text-lg font-semibold text-gray-900 dark:text-white" style="margin:0;">Support Messages' +
        (newCount > 0 ? ' <span style="background:#ef4444;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;margin-left:6px;">' + newCount + ' new</span>' : '') +
      '</h3>' +
      '<span style="font-size:20px;color:#94a3b8;" id="sa-toggle-icon">&#9660;</span>' +
    '</div>' +
    '<div id="sa-panel-content" style="display:none;margin-top:16px;"></div>';

  parent.appendChild(section);
}

window.saTogglePanel = function() {
  var panel = document.getElementById('sa-panel-content');
  var icon = document.getElementById('sa-toggle-icon');
  if (!panel) return;

  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    if (icon) icon.innerHTML = '&#9650;';
    renderSupportPanel();
  } else {
    panel.style.display = 'none';
    if (icon) icon.innerHTML = '&#9660;';
  }
};

function renderSupportPanel() {
  var panel = document.getElementById('sa-panel-content');
  if (!panel) return;

  var filtered = _saMessages;
  if (_saFilter === 'new') filtered = _saMessages.filter(function(m) { return m.status === 'new'; });
  if (_saFilter === 'replied') filtered = _saMessages.filter(function(m) { return m.status === 'replied'; });

  var newCount = _saMessages.filter(function(m) { return m.status === 'new'; }).length;

  var h = '';

  // Filters
  h += '<div style="display:flex;gap:8px;margin-bottom:16px;">';
  h += '<button class="sa-filter ' + (_saFilter === 'all' ? 'active' : '') + '" onclick="saFilterPanel(\'all\')">All (' + _saMessages.length + ')</button>';
  h += '<button class="sa-filter ' + (_saFilter === 'new' ? 'active' : '') + '" onclick="saFilterPanel(\'new\')">New (' + newCount + ')</button>';
  h += '<button class="sa-filter ' + (_saFilter === 'replied' ? 'active' : '') + '" onclick="saFilterPanel(\'replied\')">Replied</button>';
  h += '</div>';

  if (filtered.length === 0) {
    h += '<div style="text-align:center;padding:32px;color:#94a3b8;"><p>No messages.</p></div>';
  } else {
    filtered.forEach(function(m) {
      var topicClass = 'sa-topic-' + (m.page || 'general');
      var timeAgo = getTimeAgo(m.created_at);
      var statusBadge = m.status === 'new' ? '<span class="sa-badge-new">NEW</span>' : (m.status === 'replied' ? '<span class="sa-badge-replied">REPLIED</span>' : '<span class="sa-badge-read">READ</span>');
      var preview = m.message ? m.message.substring(0, 120) : '';
      if (m.message && m.message.length > 120) preview += '...';

      h += '<div class="sa-card ' + (m.status === 'new' ? 'sa-new' : '') + '" onclick="saOpenInline(\'' + m.id + '\')">';
      h += '<div class="sa-card-head"><div><span class="sa-card-name">' + escH(m.user_name || 'Anonymous') + '</span> ' + statusBadge + '</div>';
      h += '<span class="sa-card-time">' + timeAgo + '</span></div>';
      h += '<div style="margin:4px 0;"><span class="sa-card-topic ' + topicClass + '">' + escH(m.page || 'general') + '</span></div>';
      h += '<div class="sa-card-msg">' + escH(preview) + '</div>';
      if (m.user_email) h += '<div class="sa-card-email">' + escH(m.user_email) + '</div>';
      h += '</div>';

      // Inline detail (hidden)
      h += '<div id="sa-inline-' + m.id + '" style="display:none;margin-bottom:16px;">';
      h += '<div style="background:#f8fafc;border-radius:12px;padding:16px;border:1px solid #e2e8f0;" class="dark:bg-gray-700/50 dark:border-gray-600">';
      h += '<div style="font-size:13px;line-height:1.6;color:#374151;white-space:pre-wrap;margin-bottom:12px;" class="dark:text-gray-200">' + escH(m.message) + '</div>';
      if (m.reply) {
        h += '<div style="background:#0d9488;color:#fff;padding:12px 16px;border-radius:10px;margin-bottom:12px;">';
        h += '<div style="font-size:11px;font-weight:700;opacity:0.7;margin-bottom:4px;">YOUR REPLY</div>';
        h += '<div style="font-size:13px;line-height:1.6;white-space:pre-wrap;">' + escH(m.reply) + '</div>';
        h += '</div>';
      }
      h += '<textarea id="sa-inline-reply-' + m.id + '" class="sa-reply-input" placeholder="Type your reply..." style="margin-bottom:8px;">' + (m.reply || '') + '</textarea>';
      h += '<div style="display:flex;gap:8px;justify-content:flex-end;">';
      h += '<button class="sa-delete-btn" onclick="event.stopPropagation();saDeleteMessage(\'' + m.id + '\')">Delete</button>';
      if (m.user_email) h += '<button class="sa-reply-btn" onclick="event.stopPropagation();saInlineReply(\'' + m.id + '\')">' + (m.reply ? 'Update Reply' : 'Send Reply') + '</button>';
      h += '</div></div></div>';
    });
  }

  panel.innerHTML = h;
}

window.saFilterPanel = function(f) {
  _saFilter = f;
  renderSupportPanel();
};

window.saOpenInline = async function(id) {
  // Toggle inline detail
  var el = document.getElementById('sa-inline-' + id);
  if (!el) return;

  if (el.style.display === 'none') {
    // Close others
    document.querySelectorAll('[id^="sa-inline-"]').forEach(function(e) { e.style.display = 'none'; });
    el.style.display = 'block';

    // Mark as read
    var msg = _saMessages.find(function(m) { return m.id === id; });
    if (msg && msg.status === 'new') {
      msg.status = 'read';
      await supabaseClient.from('support_messages').update({ status: 'read' }).eq('id', id);
      renderSupportPanel();
    }
  } else {
    el.style.display = 'none';
  }
};

window.saInlineReply = async function(id) {
  var txt = document.getElementById('sa-inline-reply-' + id);
  if (!txt || !txt.value.trim()) { showNotification('Please enter a reply', 'error'); return; }

  try {
    var reply = txt.value.trim();
    var now = new Date().toISOString();

    await supabaseClient.from('support_messages').update({ reply: reply, status: 'replied', replied_at: now }).eq('id', id);

    var msg = _saMessages.find(function(m) { return m.id === id; });
    if (msg) { msg.reply = reply; msg.status = 'replied'; msg.replied_at = now; }

    // Open email client with reply
    if (msg && msg.user_email) {
      var subject = encodeURIComponent('Re: Your M4 Streamline Support Request');
      var body = encodeURIComponent('Hi ' + (msg.user_name || '') + ',\n\n' + reply + '\n\nRegards,\nM4 Streamline Support\nhttps://www.m4streamline.com');
      window.open('mailto:' + msg.user_email + '?subject=' + subject + '&body=' + body, '_blank');
    }

    showNotification('Reply saved!', 'success');
    renderSupportPanel();
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
};

// ============ NAV BADGE (unread count) ============
function updateNavBadge() {
  var newCount = _saMessages.filter(function(m) { return m.status === 'new'; }).length;
  if (newCount === 0) return;

  // Find Admin Panel link in nav
  var navLinks = document.querySelectorAll('a, button');
  navLinks.forEach(function(link) {
    if (link.textContent.trim() === 'Admin Panel' && !link.dataset.saBadge) {
      link.dataset.saBadge = 'true';
      link.style.position = 'relative';
      var badge = document.createElement('span');
      badge.className = 'sa-nav-badge';
      badge.id = 'sa-nav-badge';
      badge.textContent = newCount;
      link.appendChild(badge);
    }
  });

  // Update existing badge
  var existing = document.getElementById('sa-nav-badge');
  if (existing) {
    existing.textContent = newCount;
    existing.style.display = newCount > 0 ? 'flex' : 'none';
  }
}

// ============ OBSERVER ============
var _saTimer = null;
var _saObs = new MutationObserver(function() {
  if (_saTimer) clearTimeout(_saTimer);
  _saTimer = setTimeout(async function() {
    if (!currentUser) return;
    if (!_saLoaded) await loadMessages();
    injectSupportTab();
    updateNavBadge();
  }, 400);
});
_saObs.observe(document.body, { childList: true, subtree: true });

// Poll for new messages every 30 seconds
setInterval(async function() {
  if (!currentUser) return;
  await loadMessages();
  updateNavBadge();
}, 30000);

console.log('Support admin panel loaded');

} catch(e) {
  console.error('Support admin error:', e);
}
})();
