// M4 Custom Message Templates
// Editor UI in Company Settings + overrides default templates with user customizations
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.mt-section{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-top:24px}',
'.dark .mt-section{background:#1f2937;border-color:#374151}',
'.mt-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;cursor:pointer}',
'.mt-title{font-size:18px;font-weight:700;color:#0f172a}',
'.dark .mt-title{color:#fff}',
'.mt-toggle{font-size:20px;color:#94a3b8;transition:transform 0.2s}',
'.mt-toggle.open{transform:rotate(180deg)}',
'.mt-list{display:none}',
'.mt-list.open{display:block}',
'.mt-card{border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:10px;cursor:pointer;transition:all 0.15s}',
'.dark .mt-card{border-color:#374151}',
'.mt-card:hover{border-color:#0d9488;background:#f0fdfa}',
'.dark .mt-card:hover{background:rgba(13,148,136,0.1)}',
'.mt-card-hd{display:flex;align-items:center;justify-content:space-between}',
'.mt-card-name{font-size:14px;font-weight:600;color:#0f172a}',
'.dark .mt-card-name{color:#fff}',
'.mt-card-ch{font-size:11px;padding:2px 8px;border-radius:6px;font-weight:600}',
'.mt-ch-email{background:#dbeafe;color:#1e40af}',
'.mt-ch-sms{background:#d1fae5;color:#065f46}',
'.mt-card-sub{font-size:12px;color:#64748b;margin-top:4px}',
'.mt-card-custom{font-size:10px;color:#0d9488;font-weight:600;margin-top:4px}',
'',
'.mt-editor{display:none;margin-top:12px;padding:16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0}',
'.dark .mt-editor{background:#374151;border-color:#4b5563}',
'.mt-editor.open{display:block}',
'.mt-editor label{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:4px;margin-top:12px}',
'.dark .mt-editor label{color:#d1d5db}',
'.mt-editor label:first-child{margin-top:0}',
'.mt-editor input,.mt-editor textarea{width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;box-sizing:border-box}',
'.dark .mt-editor input,.dark .mt-editor textarea{background:#1f2937;border-color:#4b5563;color:#fff}',
'.mt-editor textarea{min-height:120px;resize:vertical;line-height:1.5}',
'.mt-vars{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;margin-bottom:8px}',
'.mt-var{padding:4px 10px;font-size:11px;font-weight:600;background:#e0f2fe;color:#0369a1;border-radius:6px;cursor:pointer;border:none;font-family:inherit;transition:all 0.1s}',
'.dark .mt-var{background:rgba(3,105,161,0.2);color:#38bdf8}',
'.mt-var:hover{background:#bae6fd;transform:scale(1.05)}',
'.mt-actions{display:flex;gap:8px;margin-top:12px;justify-content:flex-end}',
'.mt-save{padding:8px 20px;font-size:13px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit}',
'.mt-save:hover{background:#0f766e}',
'.mt-reset{padding:8px 16px;font-size:13px;font-weight:600;background:#fff;color:#64748b;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;font-family:inherit}',
'.dark .mt-reset{background:#374151;border-color:#4b5563;color:#9ca3af}',
'.mt-preview{margin-top:12px;padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;line-height:1.6;color:#374151;white-space:pre-wrap}',
'.dark .mt-preview{background:#1f2937;border-color:#4b5563;color:#d1d5db}'
].join('\n');
document.head.appendChild(css);

// Default templates (match email-automation.js)
var DEFAULTS = {
  quote_sent: { name: 'Quote Sent', channel: 'email', subject: 'New Quote from {company_name} - {quote_title}', body: 'Hi {client_name},\n\nPlease find attached a quote for {quote_title}.\n\nQuote Amount: {quote_total}\n\nIf you have any questions, feel free to reach out.\n\nRegards,\n{company_name}\n{company_phone}' },
  quote_reminder: { name: 'Quote Reminder', channel: 'email', subject: 'Reminder: Quote Pending - {quote_title}', body: 'Hi {client_name},\n\nJust following up on the quote we sent for {quote_title}.\n\nThe quoted amount was {quote_total}. Would you like to go ahead?\n\nLet me know if you have any questions.\n\nRegards,\n{company_name}' },
  quote_accepted: { name: 'Quote Accepted', channel: 'email', subject: 'Quote Accepted - Next Steps', body: 'Hi {client_name},\n\nGreat news! Your quote for {quote_title} has been accepted.\n\nWe will be in touch shortly to schedule the work.\n\nRegards,\n{company_name}' },
  invoice_sent: { name: 'Invoice Sent', channel: 'email', subject: 'Invoice {invoice_number} from {company_name}', body: 'Hi {client_name},\n\nPlease find attached invoice {invoice_number} for {invoice_total}.\n\nDue date: {invoice_due_date}\n\nPayment Details:\nBank: {bank_name}\nBSB: {bsb}\nAccount: {account_number}\nReference: {invoice_number}\n\nRegards,\n{company_name}' },
  payment_reminder: { name: 'Payment Reminder', channel: 'email', subject: 'Payment Reminder - Invoice {invoice_number}', body: 'Hi {client_name},\n\nThis is a friendly reminder that invoice {invoice_number} for {invoice_total} is due on {invoice_due_date}.\n\nIf you have already paid, please disregard this message.\n\nRegards,\n{company_name}' },
  overdue_invoice: { name: 'Overdue Invoice', channel: 'email', subject: 'Overdue Invoice {invoice_number}', body: 'Hi {client_name},\n\nInvoice {invoice_number} for {invoice_total} is now overdue.\n\nPlease arrange payment at your earliest convenience.\n\nRegards,\n{company_name}' },
  payment_received: { name: 'Payment Received', channel: 'email', subject: 'Payment Received - Thank You!', body: 'Hi {client_name},\n\nPayment received for invoice {invoice_number}. Thank you!\n\nRegards,\n{company_name}' },
  job_scheduled: { name: 'Job Scheduled', channel: 'email', subject: 'Job Scheduled - {job_title}', body: 'Hi {client_name},\n\nYour job {job_title} has been scheduled for {job_date}.\n\nAddress: {job_address}\n\nWe look forward to getting started.\n\nRegards,\n{company_name}' },
  job_reminder: { name: 'Job Reminder', channel: 'email', subject: 'Reminder: Job Tomorrow - {job_title}', body: 'Hi {client_name},\n\nJust a reminder that we are scheduled to be at your property tomorrow for {job_title}.\n\nAddress: {job_address}\n\nSee you then!\n\nRegards,\n{company_name}' },
  job_completed: { name: 'Job Completed', channel: 'email', subject: 'Job Completed - {job_title}', body: 'Hi {client_name},\n\nWe have completed {job_title} at {job_address}.\n\nIf you have any questions or concerns, please do not hesitate to get in touch.\n\nRegards,\n{company_name}' },
  quote_sent_sms: { name: 'Quote Sent (SMS)', channel: 'sms', subject: '', body: 'Hi {client_name}, new quote from {company_name} for {quote_title} - {quote_total}. View and approve here: {quote_link}' },
  invoice_sent_sms: { name: 'Invoice Sent (SMS)', channel: 'sms', subject: '', body: 'Hi {client_name}, invoice {invoice_number} for {invoice_total} from {company_name}. Due: {invoice_due_date}. Pay ref: {invoice_number}' },
  mq_confirmation_sms: { name: 'M&Q Booking SMS', channel: 'sms', subject: '', body: 'Hi {client_name}, your measure & quote is booked for {job_date} at {job_address}. See you then! - {company_name}' }
};

var VARIABLES = [
  '{client_name}', '{client_email}', '{client_phone}', '{client_address}',
  '{company_name}', '{company_phone}', '{company_email}',
  '{quote_title}', '{quote_number}', '{quote_total}', '{quote_link}',
  '{invoice_number}', '{invoice_total}', '{invoice_due_date}',
  '{job_title}', '{job_date}', '{job_address}',
  '{bank_name}', '{bsb}', '{account_number}'
];

var _userTemplates = {};
var _mtLoaded = false;
var _mtEditing = null;

function getOwnerId() {
  return (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : (currentUser ? currentUser.id : null);
}

// ============ LOAD USER TEMPLATES ============
async function loadTemplates() {
  try {
    var oid = getOwnerId();
    if (!oid) return;
    var r = await supabaseClient.from('message_templates').select('*').eq('user_id', oid);
    _userTemplates = {};
    (r.data || []).forEach(function(t) {
      _userTemplates[t.template_key] = t;
    });
    _mtLoaded = true;
  } catch(e) { console.error('Template load error:', e); }
}

// ============ GET TEMPLATE (user override or default) ============
window.getMessageTemplate = function(key) {
  if (_userTemplates[key]) {
    return { subject: _userTemplates[key].subject, body: _userTemplates[key].body, enabled: _userTemplates[key].enabled };
  }
  if (DEFAULTS[key]) {
    return { subject: DEFAULTS[key].subject, body: DEFAULTS[key].body, enabled: true };
  }
  return null;
};

// ============ SAVE TEMPLATE ============
window.saveMessageTemplate = async function(key) {
  var subEl = document.getElementById('mt-subject-' + key);
  var bodyEl = document.getElementById('mt-body-' + key);
  if (!bodyEl || !bodyEl.value.trim()) { showNotification('Message body cannot be empty', 'error'); return; }

  try {
    var oid = getOwnerId();
    var channel = DEFAULTS[key] ? DEFAULTS[key].channel : 'email';
    var data = {
      user_id: oid,
      template_key: key,
      channel: channel,
      subject: subEl ? subEl.value.trim() : '',
      body: bodyEl.value.trim(),
      enabled: true,
      updated_at: new Date().toISOString()
    };

    if (_userTemplates[key]) {
      await supabaseClient.from('message_templates').update(data).eq('id', _userTemplates[key].id);
      Object.assign(_userTemplates[key], data);
    } else {
      var r = await supabaseClient.from('message_templates').insert([data]).select();
      if (r.data && r.data[0]) _userTemplates[key] = r.data[0];
    }

    showNotification('Template saved!', 'success');
  } catch(e) {
    showNotification('Error: ' + e.message, 'error');
  }
};

window.resetMessageTemplate = async function(key) {
  if (!confirm('Reset to default template?')) return;
  if (_userTemplates[key]) {
    try {
      await supabaseClient.from('message_templates').delete().eq('id', _userTemplates[key].id);
      delete _userTemplates[key];
      showNotification('Template reset to default', 'success');
      // Refresh editor
      _mtEditing = null;
      renderApp();
    } catch(e) { showNotification('Error: ' + e.message, 'error'); }
  }
};

window.toggleTemplateEditor = function(key) {
  _mtEditing = (_mtEditing === key) ? null : key;
  renderTemplateList();
};

window.insertVariable = function(key, variable) {
  var bodyEl = document.getElementById('mt-body-' + key);
  if (!bodyEl) return;
  var start = bodyEl.selectionStart;
  var end = bodyEl.selectionEnd;
  var text = bodyEl.value;
  bodyEl.value = text.substring(0, start) + variable + text.substring(end);
  bodyEl.selectionStart = bodyEl.selectionEnd = start + variable.length;
  bodyEl.focus();
};

function escH(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }

// ============ RENDER TEMPLATE LIST ============
function renderTemplateList() {
  var list = document.getElementById('mt-list');
  if (!list) return;

  var h = '';
  var keys = Object.keys(DEFAULTS);
  keys.forEach(function(key) {
    var def = DEFAULTS[key];
    var custom = _userTemplates[key];
    var isEditing = (_mtEditing === key);
    var current = custom || { subject: def.subject, body: def.body };
    var chClass = def.channel === 'sms' ? 'mt-ch-sms' : 'mt-ch-email';

    h += '<div class="mt-card" onclick="toggleTemplateEditor(\'' + key + '\')">';
    h += '<div class="mt-card-hd">';
    h += '<span class="mt-card-name">' + escH(def.name) + '</span>';
    h += '<span class="mt-card-ch ' + chClass + '">' + def.channel.toUpperCase() + '</span>';
    h += '</div>';
    if (def.channel === 'email') h += '<div class="mt-card-sub">Subject: ' + escH(current.subject) + '</div>';
    if (custom) h += '<div class="mt-card-custom">Customised</div>';
    h += '</div>';

    if (isEditing) {
      h += '<div class="mt-editor open" onclick="event.stopPropagation()">';

      if (def.channel === 'email') {
        h += '<label>Subject Line</label>';
        h += '<input type="text" id="mt-subject-' + key + '" value="' + escH(current.subject) + '">';
      }

      h += '<label>Message Body</label>';
      h += '<div class="mt-vars">';
      VARIABLES.forEach(function(v) {
        h += '<button class="mt-var" onclick="event.stopPropagation();insertVariable(\'' + key + '\',\'' + v + '\')">' + v + '</button>';
      });
      h += '</div>';
      h += '<textarea id="mt-body-' + key + '">' + escH(current.body) + '</textarea>';

      h += '<div class="mt-actions">';
      if (custom) h += '<button class="mt-reset" onclick="event.stopPropagation();resetMessageTemplate(\'' + key + '\')">Reset to Default</button>';
      h += '<button class="mt-save" onclick="event.stopPropagation();saveMessageTemplate(\'' + key + '\')">Save Template</button>';
      h += '</div>';

      h += '</div>';
    }
  });

  list.innerHTML = h;
}

// ============ INJECT INTO COMPANY SETTINGS ============
function injectTemplateSection() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'company') return;

  var h2 = null;
  document.querySelectorAll('h2').forEach(function(el) {
    if (el.textContent.trim() === 'Company Settings') h2 = el;
  });
  if (!h2) return;
  if (document.getElementById('mt-section')) return;

  var container = h2.parentElement;
  if (!container) return;

  var section = document.createElement('div');
  section.className = 'mt-section';
  section.id = 'mt-section';

  section.innerHTML =
    '<div class="mt-hd" onclick="toggleTemplateList()">' +
      '<div class="mt-title">Message Templates</div>' +
      '<span class="mt-toggle" id="mt-toggle-icon">&#9660;</span>' +
    '</div>' +
    '<div style="font-size:13px;color:#64748b;margin-bottom:12px;">Customise the emails and SMS messages sent to your clients. Click any template to edit. Use the variable buttons to insert personalised data.</div>' +
    '<div class="mt-list" id="mt-list"></div>';

  container.appendChild(section);
}

window.toggleTemplateList = function() {
  var list = document.getElementById('mt-list');
  var icon = document.getElementById('mt-toggle-icon');
  if (!list) return;

  if (list.classList.contains('open')) {
    list.classList.remove('open');
    if (icon) icon.classList.remove('open');
  } else {
    list.classList.add('open');
    if (icon) icon.classList.add('open');
    renderTemplateList();
  }
};

// ============ OVERRIDE EMAIL TEMPLATES IN AUTOMATION ============
// Override the global emailTemplates if it exists
function overrideGlobalTemplates() {
  if (typeof emailTemplates === 'undefined') return;

  Object.keys(_userTemplates).forEach(function(key) {
    var ut = _userTemplates[key];
    if (emailTemplates[key]) {
      emailTemplates[key].subject = ut.subject;
      emailTemplates[key].body = ut.body;
    }
  });
}

// ============ OBSERVER ============
var _mtTimer = null;
new MutationObserver(function() {
  if (_mtTimer) clearTimeout(_mtTimer);
  _mtTimer = setTimeout(async function() {
    if (!currentUser) return;
    if (!_mtLoaded) {
      await loadTemplates();
      overrideGlobalTemplates();
    }
    injectTemplateSection();
  }, 400);
}).observe(document.body, { childList: true, subtree: true });

console.log('Custom message templates loaded');

} catch(e) {
  console.error('Template error:', e);
}
})();
