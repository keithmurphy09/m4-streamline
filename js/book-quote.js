// M4 Book Quote - Measure & Quote Appointments
// Floating button on dashboard, books M&Q appointments with SMS confirmation
// Day-before SMS reminder, distinct color on calendar
// Additive only
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'.bq-fab{position:fixed;bottom:24px;left:24px;padding:12px 20px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;cursor:pointer;z-index:40;display:flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(245,158,11,0.4);transition:all 0.2s;font-family:inherit;font-size:13px;font-weight:700}',
'.bq-fab:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(245,158,11,0.5)}',
'',
'.bq-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px;animation:bqFadeIn 0.2s ease}',
'@keyframes bqFadeIn{from{opacity:0}to{opacity:1}}',
'.bq-modal{background:#fff;border-radius:16px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,0.3)}',
'.dark .bq-modal{background:#1f2937}',
'.bq-modal-hd{padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center}',
'.dark .bq-modal-hd{border-bottom-color:#374151}',
'.bq-modal-title{font-family:Outfit,sans-serif;font-size:20px;font-weight:700;color:#0f172a;display:flex;align-items:center;gap:8px}',
'.dark .bq-modal-title{color:#fff}',
'.bq-modal-badge{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;background:#fef3c7;color:#92400e;border:1px solid #fde68a}',
'.bq-modal-body{padding:20px 24px 24px}',
'.bq-field{margin-bottom:14px}',
'.bq-field label{display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.03em}',
'.dark .bq-field label{color:#9ca3af}',
'.bq-field input,.bq-field select,.bq-field textarea{width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit;outline:none;transition:border-color 0.15s;background:#fff;color:#0f172a}',
'.dark .bq-field input,.dark .bq-field select,.dark .bq-field textarea{background:#374151;color:#e2e8f0;border-color:#4b5563}',
'.bq-field input:focus,.bq-field select:focus,.bq-field textarea:focus{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,0.1)}',
'.bq-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
'.bq-new-client{font-size:12px;color:#f59e0b;background:none;border:none;cursor:pointer;font-family:inherit;font-weight:600;padding:0;margin-top:4px}',
'.bq-new-client:hover{text-decoration:underline}',
'.bq-sms-toggle{display:flex;align-items:center;gap:8px;padding:8px 0;font-size:13px;color:#64748b;cursor:pointer}',
'.dark .bq-sms-toggle{color:#9ca3af}',
'.bq-sms-toggle input{width:18px;height:18px;accent-color:#f59e0b}',
'.bq-submit{width:100%;padding:14px;font-size:15px;font-weight:700;color:#fff;background:linear-gradient(135deg,#f59e0b,#d97706);border:none;border-radius:10px;cursor:pointer;font-family:inherit;transition:all 0.15s;margin-top:8px}',
'.bq-submit:hover{opacity:0.9;transform:translateY(-1px)}',
'.bq-submit:disabled{opacity:0.5;cursor:not-allowed}'
].join('\n');
document.head.appendChild(css);

function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ============ M&Q IDENTIFIER ============
var MQ_PREFIX = 'M&Q - ';

function isMQJob(job) {
  return job && job.title && job.title.indexOf(MQ_PREFIX) === 0;
}

// ============ INJECT FLOATING BUTTON ON DASHBOARD ============
function injectBookQuoteBtn() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'dashboard') {
    var existing = document.getElementById('bq-fab');
    if (existing) existing.remove();
    return;
  }
  if (document.getElementById('bq-fab')) return;
  if (!currentUser) return;

  var fab = document.createElement('button');
  fab.id = 'bq-fab';
  fab.className = 'bq-fab';
  fab.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>Book M&amp;Q';
  fab.setAttribute('onclick', 'openBookQuote()');
  document.body.appendChild(fab);
}

// ============ ALSO ADD TO QUICK ACTIONS ============
function injectQuickActionBtn() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'dashboard') return;
  var grids = document.querySelectorAll('.grid.grid-cols-2.md\\:grid-cols-4');
  if (grids.length === 0) return;
  var grid = grids[grids.length - 1];
  if (grid.dataset.bqAdded) return;
  grid.dataset.bqAdded = 'true';

  var btn = document.createElement('button');
  btn.className = 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-900/30 border border-gray-200 dark:border-gray-600 hover:border-amber-400 px-4 py-3 rounded-lg font-medium transition-colors text-sm';
  btn.innerHTML = '<svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>Book M&amp;Q';
  btn.setAttribute('onclick', 'openBookQuote()');
  grid.appendChild(btn);
}

// ============ OPEN BOOKING FORM ============
window.openBookQuote = function() {
  if (document.getElementById('bq-overlay')) return;

  var clientOpts = '<option value="">Select existing client</option>';
  var sorted = clients.slice().sort(function(a, b) { return (a.name || '').localeCompare(b.name || ''); });
  for (var i = 0; i < sorted.length; i++) {
    clientOpts += '<option value="' + sorted[i].id + '">' + escH(sorted[i].name) + '</option>';
  }

  // Default to tomorrow 9am
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var defDate = tomorrow.toISOString().split('T')[0];

  var hasSMS = typeof smsSettings !== 'undefined' && smsSettings && smsSettings.enabled;

  var ov = document.createElement('div');
  ov.id = 'bq-overlay';
  ov.className = 'bq-overlay';
  ov.setAttribute('onclick', 'if(event.target===this)closeBookQuote()');

  ov.innerHTML =
    '<div class="bq-modal">' +
      '<div class="bq-modal-hd">' +
        '<span class="bq-modal-title">Book Measure &amp; Quote <span class="bq-modal-badge">M&amp;Q</span></span>' +
        '<button onclick="closeBookQuote()" style="background:none;border:none;font-size:22px;color:#94a3b8;cursor:pointer;">&times;</button>' +
      '</div>' +
      '<div class="bq-modal-body">' +

        '<div class="bq-field">' +
          '<label>Client</label>' +
          '<select id="bq-client" onchange="bqClientChanged()">' + clientOpts + '</select>' +
          '<button class="bq-new-client" onclick="bqToggleNewClient()">+ New client</button>' +
        '</div>' +

        '<div id="bq-new-client-fields" style="display:none;">' +
          '<div class="bq-field"><label>Client Name *</label><input type="text" id="bq-new-name" placeholder="e.g. Rob Smith"></div>' +
          '<div class="bq-row">' +
            '<div class="bq-field"><label>Email</label><input type="email" id="bq-new-email" placeholder="rob@email.com"></div>' +
            '<div class="bq-field"><label>Phone *</label><input type="text" id="bq-new-phone" placeholder="0412 345 678"></div>' +
          '</div>' +
        '</div>' +

        '<div class="bq-field">' +
          '<label>Appointment Address *</label>' +
          '<input type="text" id="bq-address" placeholder="e.g. 45 Smith St, Brisbane QLD 4000">' +
        '</div>' +

        '<div class="bq-row">' +
          '<div class="bq-field"><label>Date *</label><input type="date" id="bq-date" value="' + defDate + '"></div>' +
          '<div class="bq-field"><label>Time *</label><input type="time" id="bq-time" value="09:00"></div>' +
        '</div>' +

        '<div class="bq-field">' +
          '<label>Notes (optional)</label>' +
          '<textarea id="bq-notes" rows="2" placeholder="e.g. Side gate access, ask for Rob"></textarea>' +
        '</div>' +

        (hasSMS ? '<label class="bq-sms-toggle"><input type="checkbox" id="bq-send-sms" checked> Send SMS confirmation to client</label>' : '<p style="font-size:11px;color:#94a3b8;padding:4px 0;">SMS not configured. Set up in Company Settings to send booking confirmations.</p>') +

        '<button class="bq-submit" id="bq-submit-btn" onclick="submitBookQuote()">Book Appointment</button>' +

      '</div>' +
    '</div>';

  document.body.appendChild(ov);

  // Init Google Maps autocomplete on address field
  if (typeof initAddressAutocomplete === 'function') {
    setTimeout(function() { initAddressAutocomplete('bq-address'); }, 300);
  }
};

window.closeBookQuote = function() {
  var ov = document.getElementById('bq-overlay');
  if (ov) ov.remove();
};

window.bqToggleNewClient = function() {
  var fields = document.getElementById('bq-new-client-fields');
  var select = document.getElementById('bq-client');
  if (fields.style.display === 'none') {
    fields.style.display = 'block';
    if (select) select.style.display = 'none';
  } else {
    fields.style.display = 'none';
    if (select) select.style.display = '';
  }
};

window.bqClientChanged = function() {
  var sel = document.getElementById('bq-client');
  if (!sel || !sel.value) return;
  var client = clients.find(function(c) { return c.id === sel.value; });
  if (client && client.address) {
    var addr = document.getElementById('bq-address');
    if (addr && !addr.value) addr.value = client.address;
  }
};

// ============ SUBMIT BOOKING ============
window.submitBookQuote = async function() {
  var isNewClient = document.getElementById('bq-new-client-fields').style.display !== 'none';
  var clientId = null;
  var clientName = '';
  var clientPhone = '';

  // Validate & get client
  if (isNewClient) {
    var name = (document.getElementById('bq-new-name') || {}).value;
    var phone = (document.getElementById('bq-new-phone') || {}).value;
    if (!name || !name.trim()) { showNotification('Please enter client name', 'error'); return; }
    clientName = name.trim();
    clientPhone = (phone || '').trim();

    try {
      var cr = await supabaseClient.from('clients').insert([{
        user_id: currentUser.id,
        name: clientName,
        email: (document.getElementById('bq-new-email') || {}).value || '',
        phone: clientPhone
      }]).select();
      if (cr.error) throw cr.error;
      if (cr.data && cr.data[0]) { clients.push(cr.data[0]); clientId = cr.data[0].id; }
    } catch(e) { showNotification('Error creating client: ' + e.message, 'error'); return; }
  } else {
    clientId = (document.getElementById('bq-client') || {}).value;
    if (!clientId) { showNotification('Please select a client', 'error'); return; }
    var client = clients.find(function(c) { return c.id === clientId; });
    if (client) { clientName = client.name; clientPhone = client.phone || ''; }
  }

  var address = (document.getElementById('bq-address') || {}).value;
  var date = (document.getElementById('bq-date') || {}).value;
  var time = (document.getElementById('bq-time') || {}).value;
  var notes = (document.getElementById('bq-notes') || {}).value;

  if (!address || !date || !time) {
    showNotification('Please fill in address, date, and time', 'error');
    return;
  }

  var btn = document.getElementById('bq-submit-btn');
  if (btn) { btn.textContent = 'Booking...'; btn.disabled = true; }

  try {
    // Create job with M&Q prefix
    var jobTitle = MQ_PREFIX + clientName;
    var job = {
      user_id: currentUser.id,
      client_id: clientId,
      title: jobTitle,
      date: date,
      time: time,
      duration: 1,
      notes: notes || '',
      status: 'scheduled',
      job_address: address
    };

    var r = await supabaseClient.from('jobs').insert([job]).select();
    if (r.error) throw r.error;
    if (r.data && r.data[0]) jobs.push(r.data[0]);

    // Send SMS confirmation
    var sendSMS = document.getElementById('bq-send-sms');
    if (sendSMS && sendSMS.checked && clientPhone && typeof smsSettings !== 'undefined' && smsSettings && smsSettings.enabled) {
      await sendMQConfirmationSMS(clientName, clientPhone, date, time, address);
    }

    closeBookQuote();
    showNotification('M&Q booked with ' + clientName + ' on ' + formatMQDate(date) + ' at ' + formatMQTime(time), 'success');
    renderApp();
  } catch(e) {
    console.error('Book quote error:', e);
    showNotification('Error: ' + e.message, 'error');
    if (btn) { btn.textContent = 'Book Appointment'; btn.disabled = false; }
  }
};

// ============ SMS FUNCTIONS ============
async function sendMQConfirmationSMS(clientName, phone, date, time, address) {
  var message = 'Hi ' + clientName + ', your measure & quote appointment is confirmed for ' + formatMQDate(date) + ' at ' + formatMQTime(time) + '. Address: ' + address + '. See you then! - ' + ((typeof companySettings !== 'undefined' && companySettings && companySettings.business_name) || 'M4 Streamline');

  try {
    var response = await fetch('https://xviustrrsuhidzbcpgow.supabase.co/functions/v1/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXVzdHJyc3VoaWR6YmNwZ293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODk1NDgsImV4cCI6MjA4NDM2NTU0OH0.CEcc50c1K2Qnh6rXt_1-_w30LzHvDniGLbqWhdOolRY'
      },
      body: JSON.stringify({
        user_id: currentUser.id,
        to_number: phone,
        message: message
      })
    });
    var result = await response.json();
    if (response.ok && result.success) {
      showNotification('SMS confirmation sent to ' + phone, 'success');
    } else {
      console.error('SMS error:', result);
    }
  } catch(e) {
    console.error('SMS send error:', e);
  }
}

async function sendMQReminderSMS(job) {
  var client = clients.find(function(c) { return c.id === job.client_id; });
  if (!client || !client.phone) return;

  var message = 'Hi ' + client.name + ', just a reminder about your measure & quote appointment tomorrow at ' + (job.time || '9:00 AM') + '. Address: ' + (job.job_address || 'as discussed') + '. See you then! - ' + ((typeof companySettings !== 'undefined' && companySettings && companySettings.business_name) || 'M4 Streamline');

  try {
    await fetch('https://xviustrrsuhidzbcpgow.supabase.co/functions/v1/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXVzdHJyc3VoaWR6YmNwZ293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODk1NDgsImV4cCI6MjA4NDM2NTU0OH0.CEcc50c1K2Qnh6rXt_1-_w30LzHvDniGLbqWhdOolRY'
      },
      body: JSON.stringify({
        user_id: currentUser.id,
        to_number: client.phone,
        message: message
      })
    });
    console.log('M&Q reminder sent to', client.name);
  } catch(e) {
    console.error('Reminder SMS error:', e);
  }
}

// ============ DAY-BEFORE REMINDERS ============
function checkMQReminders() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'dashboard') return;
  if (!(typeof smsSettings !== 'undefined' && smsSettings && smsSettings.enabled)) return;

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var tomorrowStr = tomorrow.toISOString().split('T')[0];

  var tomorrowMQ = jobs.filter(function(j) {
    return isMQJob(j) && j.date === tomorrowStr && j.status !== 'completed';
  });

  if (tomorrowMQ.length === 0) return;

  // Check which reminders already sent today
  var sentKey = 'mq_reminders_sent_' + new Date().toISOString().split('T')[0];
  var sent = [];
  try { sent = JSON.parse(localStorage.getItem(sentKey) || '[]'); } catch(e) {}

  tomorrowMQ.forEach(function(job) {
    if (sent.indexOf(job.id) !== -1) return;
    sendMQReminderSMS(job);
    sent.push(job.id);
  });

  localStorage.setItem(sentKey, JSON.stringify(sent));
}

// ============ FORMAT HELPERS ============
function formatMQDate(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()];
}

function formatMQTime(timeStr) {
  if (!timeStr) return '';
  var parts = timeStr.split(':');
  var h = parseInt(parts[0]);
  var m = parts[1] || '00';
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + m + ' ' + ampm;
}

// ============ COLOR M&Q JOBS ON CALENDAR ============
function colorMQJobs() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'schedule') return;

  // Find calendar bars that contain M&Q jobs
  var bars = document.querySelectorAll('[data-job-id], .fc-event, [onclick*="openJobDetail"]');
  bars.forEach(function(bar) {
    if (bar.dataset.mqColored) return;
    var text = bar.textContent || bar.innerText || '';
    if (text.indexOf('M&Q') !== -1 || text.indexOf('M&amp;Q') !== -1) {
      bar.dataset.mqColored = 'true';
      bar.style.background = '#fef3c7';
      bar.style.borderColor = '#f59e0b';
      bar.style.borderLeft = '3px solid #f59e0b';
      bar.style.color = '#92400e';
    }
  });

  // Also check gantt bars
  var ganttBars = document.querySelectorAll('.gantt-bar');
  ganttBars.forEach(function(bar) {
    if (bar.dataset.mqColored) return;
    var title = bar.getAttribute('title') || '';
    if (title.indexOf('M&Q') !== -1) {
      bar.dataset.mqColored = 'true';
      bar.style.background = '#fef3c7';
      bar.style.borderLeft = '3px solid #f59e0b';
    }
  });

  // Color M&Q rows in job list
  var rows = document.querySelectorAll('tr[onclick*="openJobDetail"]');
  rows.forEach(function(row) {
    if (row.dataset.mqColored) return;
    var text = row.textContent || '';
    if (text.indexOf('M&Q') !== -1) {
      row.dataset.mqColored = 'true';
      row.style.background = '#fffbeb';
    }
  });

  // Gantt sidebar job rows
  var ganttJobs = document.querySelectorAll('.gantt-job-row');
  ganttJobs.forEach(function(row) {
    if (row.dataset.mqColored) return;
    var text = row.textContent || '';
    if (text.indexOf('M&Q') !== -1) {
      row.dataset.mqColored = 'true';
      row.style.background = '#fffbeb';
      row.style.borderLeft = '3px solid #f59e0b';
    }
  });
}

// ============ OBSERVER ============
var _bqTimer = null;
var _bqReminderChecked = false;
var _bqObs = new MutationObserver(function() {
  if (_bqTimer) clearTimeout(_bqTimer);
  _bqTimer = setTimeout(function() {
    if (!currentUser) return;
    injectBookQuoteBtn();
    injectQuickActionBtn();
    colorMQJobs();

    // Check reminders once per session
    if (!_bqReminderChecked && typeof activeTab !== 'undefined' && activeTab === 'dashboard') {
      _bqReminderChecked = true;
      setTimeout(checkMQReminders, 3000);
    }
  }, 200);
});
_bqObs.observe(document.body, { childList: true, subtree: true });

console.log('Book quote loaded');

} catch(e) {
  console.error('Book quote init error:', e);
}
})();
