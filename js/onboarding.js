// M4 Onboarding Wizard
// 1. Full-screen welcome on first login
// 2. Step-by-step modal wizard
// 3. Persistent dashboard checklist until complete
// Additive only
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'/* Welcome Screen */',
'.ob-welcome{position:fixed;inset:0;z-index:200;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);display:flex;align-items:center;justify-content:center;animation:ob-fadeIn 0.5s ease}',
'@keyframes ob-fadeIn{from{opacity:0}to{opacity:1}}',
'.ob-welcome-inner{text-align:center;max-width:560px;padding:40px}',
'.ob-welcome-icon{width:80px;height:80px;margin:0 auto 24px;background:rgba(45,212,191,0.15);border-radius:20px;display:flex;align-items:center;justify-content:center}',
'.ob-welcome-h1{font-family:Outfit,sans-serif;font-size:36px;font-weight:800;color:#fff;margin:0 0 12px}',
'.ob-welcome-h1 span{color:#2dd4bf}',
'.ob-welcome-p{font-size:17px;color:#94a3b8;line-height:1.7;margin:0 0 40px}',
'.ob-welcome-btn{padding:16px 40px;font-size:16px;font-weight:700;color:#fff;background:#0d9488;border:none;border-radius:10px;cursor:pointer;transition:all 0.2s;font-family:inherit;box-shadow:0 4px 14px rgba(13,148,136,0.4)}',
'.ob-welcome-btn:hover{background:#0f766e;transform:translateY(-2px)}',
'.ob-welcome-skip{display:block;margin-top:20px;font-size:13px;color:#64748b;background:none;border:none;cursor:pointer;font-family:inherit}',
'.ob-welcome-skip:hover{color:#94a3b8}',
'',
'/* Wizard Modal */',
'.ob-wizard{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:20px;animation:ob-fadeIn 0.3s ease}',
'.ob-wizard-box{background:#fff;border-radius:16px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,0.3)}',
'.dark .ob-wizard-box{background:#1f2937}',
'.ob-wizard-hd{padding:24px 28px 0;display:flex;justify-content:space-between;align-items:center}',
'.ob-wizard-step{font-size:12px;font-weight:600;color:#0d9488;text-transform:uppercase;letter-spacing:0.05em}',
'.ob-wizard-close{background:none;border:none;font-size:20px;color:#94a3b8;cursor:pointer}',
'.ob-wizard-close:hover{color:#64748b}',
'.ob-wizard-body{padding:20px 28px 28px}',
'.ob-wizard-title{font-family:Outfit,sans-serif;font-size:22px;font-weight:700;color:#0f172a;margin:0 0 6px}',
'.dark .ob-wizard-title{color:#fff}',
'.ob-wizard-desc{font-size:14px;color:#64748b;margin:0 0 24px;line-height:1.5}',
'.ob-wizard-progress{height:4px;background:#e2e8f0;border-radius:2px;margin:16px 28px 0;overflow:hidden}',
'.dark .ob-wizard-progress{background:#374151}',
'.ob-wizard-progress-bar{height:100%;background:#0d9488;border-radius:2px;transition:width 0.3s ease}',
'.ob-wizard-field{margin-bottom:16px}',
'.ob-wizard-field label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px}',
'.dark .ob-wizard-field label{color:#d1d5db}',
'.ob-wizard-field input,.ob-wizard-field textarea{width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;font-family:inherit;outline:none;transition:border-color 0.15s}',
'.dark .ob-wizard-field input,.dark .ob-wizard-field textarea{background:#374151;color:#e2e8f0;border-color:#4b5563}',
'.ob-wizard-field input:focus,.ob-wizard-field textarea:focus{border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,0.1)}',
'.ob-wizard-btns{display:flex;gap:12px;margin-top:24px}',
'.ob-wizard-next{flex:1;padding:12px;font-size:14px;font-weight:700;color:#fff;background:#0d9488;border:none;border-radius:8px;cursor:pointer;font-family:inherit;transition:background 0.15s}',
'.ob-wizard-next:hover{background:#0f766e}',
'.ob-wizard-back{padding:12px 20px;font-size:14px;font-weight:600;color:#64748b;background:#f1f5f9;border:none;border-radius:8px;cursor:pointer;font-family:inherit}',
'.dark .ob-wizard-back{background:#374151;color:#d1d5db}',
'.ob-wizard-skip-step{padding:12px 16px;font-size:13px;color:#94a3b8;background:none;border:none;cursor:pointer;font-family:inherit}',
'.ob-wizard-skip-step:hover{color:#64748b}',
'',
'/* Dashboard Checklist */',
'.ob-checklist{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px}',
'.dark .ob-checklist{background:#1f2937;border-color:#374151}',
'.ob-checklist-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}',
'.ob-checklist-title{font-size:15px;font-weight:700;color:#0f172a}',
'.dark .ob-checklist-title{color:#fff}',
'.ob-checklist-progress{font-size:12px;color:#0d9488;font-weight:600}',
'.ob-checklist-bar{height:6px;background:#e2e8f0;border-radius:3px;margin-bottom:16px;overflow:hidden}',
'.dark .ob-checklist-bar{background:#374151}',
'.ob-checklist-bar-fill{height:100%;background:linear-gradient(90deg,#0d9488,#2dd4bf);border-radius:3px;transition:width 0.3s}',
'.ob-check-item{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:background 0.1s}',
'.dark .ob-check-item{border-bottom-color:#374151}',
'.ob-check-item:last-child{border-bottom:none}',
'.ob-check-item:hover{background:#f8fafc;margin:0 -8px;padding-left:8px;padding-right:8px;border-radius:6px}',
'.dark .ob-check-item:hover{background:#111827}',
'.ob-check-icon{width:24px;height:24px;border-radius:50%;border:2px solid #d1d5db;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s}',
'.ob-check-icon.done{background:#0d9488;border-color:#0d9488}',
'.ob-check-text{font-size:13px;font-weight:500;color:#374151}',
'.dark .ob-check-text{color:#d1d5db}',
'.ob-check-text.done{color:#94a3b8;text-decoration:line-through}',
'.ob-checklist-dismiss{font-size:12px;color:#94a3b8;background:none;border:none;cursor:pointer;font-family:inherit}',
'.ob-checklist-dismiss:hover{color:#64748b}'
].join('\n');
document.head.appendChild(css);

// ============ STATE ============
var STORAGE_KEY = 'm4_onboarding';

function getState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) { return {}; }
}
function setState(obj) {
  var s = getState();
  for (var k in obj) s[k] = obj[k];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ============ CHECK COMPLETION ============
function getChecklist() {
  var s = companySettings || {};
  return [
    { id: 'business', label: 'Add business details', done: !!(s.business_name && s.phone), action: "switchTab('company')" },
    { id: 'logo', label: 'Upload your logo', done: !!s.logo_url, action: "switchTab('company')" },
    { id: 'bank', label: 'Set up bank details', done: !!(s.bank_name && s.bsb), action: "switchTab('company')" },
    { id: 'xero', label: 'Connect Xero', done: !!(typeof _xStatus !== 'undefined' && _xStatus && _xStatus.connected), action: "switchTab('company')" },
    { id: 'client', label: 'Add your first client', done: clients.length > 0, action: "openModal('client')" },
    { id: 'quote', label: 'Create your first quote', done: quotes.length > 0, action: "openModal('quote')" },
    { id: 'team', label: 'Add a team member', done: teamMembers.length > 0, action: "switchTab('team')" }
  ];
}

function getCompletionCount() {
  var items = getChecklist();
  var done = 0;
  for (var i = 0; i < items.length; i++) { if (items[i].done) done++; }
  return done;
}

function isAllComplete() {
  return getCompletionCount() === getChecklist().length;
}

// ============ 1. WELCOME SCREEN ============
function showWelcome() {
  var state = getState();
  if (state.welcomeDone || state.dismissed) return;
  if (!currentUser) return;

  var el = document.createElement('div');
  el.id = 'ob-welcome';
  el.className = 'ob-welcome';
  el.innerHTML =
    '<div class="ob-welcome-inner">' +
      '<div class="ob-welcome-icon"><svg width="40" height="40" fill="none" stroke="#2dd4bf" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>' +
      '<h1 class="ob-welcome-h1">Welcome to <span>M4 Streamline</span></h1>' +
      '<p class="ob-welcome-p">Let\'s get your account set up. It takes about 2 minutes and you\'ll be ready to start quoting, scheduling, and managing your trade business.</p>' +
      '<button class="ob-welcome-btn" onclick="startOnboardingWizard()">Let\'s Get Started</button>' +
      '<button class="ob-welcome-skip" onclick="skipOnboarding()">I\'ll set up later</button>' +
    '</div>';
  document.body.appendChild(el);
}

window.startOnboardingWizard = function() {
  setState({ welcomeDone: true });
  var w = document.getElementById('ob-welcome');
  if (w) w.remove();
  showWizardStep(0);
};

window.skipOnboarding = function() {
  setState({ welcomeDone: true });
  var w = document.getElementById('ob-welcome');
  if (w) w.remove();
};

// ============ 2. WIZARD STEPS ============
var STEPS = [
  {
    title: 'Business Details',
    desc: 'Tell us about your business so we can set up your quotes and invoices.',
    fields: function() {
      var s = companySettings || {};
      return '<div class="ob-wizard-field"><label>Business Name *</label><input type="text" id="ob-biz-name" value="' + escH(s.business_name || '') + '" placeholder="e.g. Murphy\'s Plumbing"></div>' +
        '<div class="ob-wizard-field"><label>ABN</label><input type="text" id="ob-abn" value="' + escH(s.abn || '') + '" placeholder="e.g. 12 345 678 901"></div>' +
        '<div class="ob-wizard-field"><label>Phone *</label><input type="text" id="ob-phone" value="' + escH(s.phone || '') + '" placeholder="e.g. 0400 123 456"></div>' +
        '<div class="ob-wizard-field"><label>Email</label><input type="text" id="ob-email" value="' + escH(s.email || '') + '" placeholder="e.g. info@yourbusiness.com"></div>' +
        '<div class="ob-wizard-field"><label>Address</label><input type="text" id="ob-address" value="' + escH(s.address || '') + '" placeholder="e.g. 123 Main St, Brisbane QLD 4000"></div>';
    },
    save: async function() {
      var name = document.getElementById('ob-biz-name');
      var phone = document.getElementById('ob-phone');
      if (!name || !name.value.trim() || !phone || !phone.value.trim()) {
        showNotification('Please enter business name and phone', 'error'); return false;
      }
      var data = {
        business_name: name.value.trim(),
        abn: (document.getElementById('ob-abn') || {}).value || '',
        phone: phone.value.trim(),
        email: (document.getElementById('ob-email') || {}).value || '',
        address: (document.getElementById('ob-address') || {}).value || ''
      };
      try {
        if (companySettings && companySettings.id) {
          await supabaseClient.from('company_settings').update(data).eq('id', companySettings.id);
          Object.assign(companySettings, data);
        } else {
          data.user_id = currentUser.id;
          var r = await supabaseClient.from('company_settings').insert([data]).select();
          if (r.data) companySettings = r.data[0];
        }
        return true;
      } catch(e) { showNotification('Error: ' + e.message, 'error'); return false; }
    }
  },
  {
    title: 'Upload Your Logo',
    desc: 'Your logo appears on quotes, invoices, and your client portal. You can always change it later.',
    fields: function() {
      var s = companySettings || {};
      var preview = s.logo_url
        ? '<img src="' + escH(s.logo_url) + '" style="max-height:100px;margin:0 auto 16px;display:block;border-radius:8px;" />'
        : '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:13px;margin-bottom:16px;">No logo uploaded yet</div>';
      return preview +
        '<div class="ob-wizard-field"><label style="display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border:2px dashed #d1d5db;border-radius:10px;cursor:pointer;transition:border-color 0.15s;" onmouseenter="this.style.borderColor=\'#0d9488\'" onmouseleave="this.style.borderColor=\'#d1d5db\'">' +
          '<svg width="20" height="20" fill="none" stroke="#64748b" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' +
          '<span style="font-size:14px;color:#64748b;font-weight:500;">Choose logo file</span>' +
          '<input type="file" accept="image/*" id="ob-logo-file" onchange="obUploadLogo(this)" style="display:none" />' +
        '</label></div>' +
        '<div id="ob-logo-status"></div>';
    },
    save: async function() { return true; },
    optional: true
  },
  {
    title: 'Bank Details',
    desc: 'These appear on your invoices so clients know where to pay.',
    fields: function() {
      var s = companySettings || {};
      return '<div class="ob-wizard-field"><label>Bank Name</label><input type="text" id="ob-bank" value="' + escH(s.bank_name || '') + '" placeholder="e.g. Commonwealth Bank"></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div class="ob-wizard-field"><label>BSB</label><input type="text" id="ob-bsb" value="' + escH(s.bsb || '') + '" placeholder="e.g. 064-000"></div>' +
          '<div class="ob-wizard-field"><label>Account Number</label><input type="text" id="ob-acc" value="' + escH(s.account_number || '') + '" placeholder="e.g. 1234 5678"></div>' +
        '</div>' +
        '<div class="ob-wizard-field"><label>Account Name</label><input type="text" id="ob-accname" value="' + escH(s.account_name || '') + '" placeholder="e.g. Murphy\'s Plumbing Pty Ltd"></div>';
    },
    save: async function() {
      var data = {
        bank_name: (document.getElementById('ob-bank') || {}).value || '',
        bsb: (document.getElementById('ob-bsb') || {}).value || '',
        account_number: (document.getElementById('ob-acc') || {}).value || '',
        account_name: (document.getElementById('ob-accname') || {}).value || ''
      };
      try {
        if (companySettings && companySettings.id) {
          await supabaseClient.from('company_settings').update(data).eq('id', companySettings.id);
          Object.assign(companySettings, data);
        }
        return true;
      } catch(e) { return true; }
    },
    optional: true
  },
  {
    title: 'Connect Xero',
    desc: 'Connect your Xero account to automatically sync invoices, bills, and contacts. Keep your accounting up to date without manual data entry.',
    fields: function() {
      var connected = typeof _xStatus !== 'undefined' && _xStatus && _xStatus.connected;
      if (connected) {
        return '<div style="text-align:center;padding:24px;">' +
          '<div style="font-size:48px;margin-bottom:16px;">&#9989;</div>' +
          '<p style="font-size:16px;font-weight:700;color:#10b981;">Xero Connected!</p>' +
          '<p style="font-size:13px;color:#64748b;margin-top:8px;">' + (_xStatus.tenant_name || 'Your Organisation') + '</p>' +
          '</div>';
      }
      return '<div style="text-align:center;padding:24px;">' +
        '<div style="width:60px;height:60px;border-radius:14px;background:#13B5EA;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 14.59L6 12l1.41-1.41L11 14.17l6.59-6.59L19 9l-8.41 8.59z"/></svg></div>' +
        '<p style="font-size:15px;color:#64748b;line-height:1.6;margin-bottom:20px;">Sync invoices, expenses, and clients automatically. No more manual data entry.</p>' +
        '<button onclick="connectXero()" style="padding:14px 32px;background:#13B5EA;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;">Connect to Xero</button>' +
        '</div>';
    },
    save: async function() { return true; },
    optional: true,
    noSaveBtn: true
  },
  {
    title: 'Add Your First Client',
    desc: 'Clients are the heart of your business. Add one now and you can start quoting right away.',
    fields: function() {
      return '<div class="ob-wizard-field"><label>Client Name *</label><input type="text" id="ob-client-name" placeholder="e.g. Rob Smith"></div>' +
        '<div class="ob-wizard-field"><label>Email</label><input type="email" id="ob-client-email" placeholder="e.g. rob@email.com"></div>' +
        '<div class="ob-wizard-field"><label>Phone</label><input type="text" id="ob-client-phone" placeholder="e.g. 0412 345 678"></div>' +
        '<div class="ob-wizard-field"><label>Address</label><input type="text" id="ob-client-address" placeholder="e.g. 45 Smith St, Brisbane"></div>';
    },
    save: async function() {
      var name = document.getElementById('ob-client-name');
      if (!name || !name.value.trim()) { showNotification('Please enter client name', 'error'); return false; }
      try {
        var client = {
          user_id: currentUser.id,
          name: name.value.trim(),
          email: (document.getElementById('ob-client-email') || {}).value || '',
          phone: (document.getElementById('ob-client-phone') || {}).value || '',
          address: (document.getElementById('ob-client-address') || {}).value || ''
        };
        var r = await supabaseClient.from('clients').insert([client]).select();
        if (r.error) throw r.error;
        if (r.data) clients.push(r.data[0]);
        return true;
      } catch(e) { showNotification('Error: ' + e.message, 'error'); return false; }
    }
  },
  {
    title: 'Create Your First Quote',
    desc: 'Ready to send a quote? We\'ll walk you through it. Or skip and do it from the dashboard.',
    fields: function() {
      return '<div style="text-align:center;padding:24px;">' +
        '<div style="font-size:48px;margin-bottom:16px;">&#128203;</div>' +
        '<p style="font-size:15px;color:#64748b;line-height:1.6;">Click below to open the full quote builder where you can add line items, set deposit amounts, and send to your client.</p>' +
        '<button onclick="closeWizard();openModal(\'quote\',null,true)" style="margin-top:16px;padding:12px 28px;background:#0d9488;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Open Quote Builder</button>' +
      '</div>';
    },
    save: async function() { return true; },
    optional: true,
    noSaveBtn: true
  },
  {
    title: 'Add Team Members',
    desc: 'If you have employees or subcontractors, add them here. They can log in with their own accounts.',
    fields: function() {
      return '<div class="ob-wizard-field"><label>Team Member Name *</label><input type="text" id="ob-team-name" placeholder="e.g. Jake the Plumber"></div>' +
        '<div class="ob-wizard-field"><label>Email</label><input type="email" id="ob-team-email" placeholder="e.g. jake@email.com"></div>' +
        '<div class="ob-wizard-field"><label>Occupation</label><input type="text" id="ob-team-occ" placeholder="e.g. Plumber, Electrician"></div>' +
        '<div class="ob-wizard-field"><label>Role</label><select id="ob-team-role" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;font-family:inherit;background:#fff;color:#374151;" class="dark:bg-gray-700 dark:text-white dark:border-gray-600"><option value="trades">Tradesperson</option><option value="salesperson">Salesperson</option></select></div>';
    },
    save: async function() {
      var name = document.getElementById('ob-team-name');
      if (!name || !name.value.trim()) { showNotification('Please enter team member name', 'error'); return false; }
      try {
        var member = {
          user_id: currentUser.id,
          name: name.value.trim(),
          email: (document.getElementById('ob-team-email') || {}).value || '',
          occupation: (document.getElementById('ob-team-occ') || {}).value || '',
          role: (document.getElementById('ob-team-role') || {}).value || 'trades'
        };
        var r = await supabaseClient.from('team_members').insert([member]).select();
        if (r.error) throw r.error;
        if (r.data) teamMembers.push(r.data[0]);
        return true;
      } catch(e) { showNotification('Error: ' + e.message, 'error'); return false; }
    },
    optional: true
  }
];

var _currentStep = 0;

function showWizardStep(step) {
  _currentStep = step;
  if (step >= STEPS.length) {
    closeWizard();
    setState({ wizardDone: true });
    showNotification('Setup complete! You\'re ready to go.', 'success');
    renderApp();
    return;
  }

  var s = STEPS[step];
  var existing = document.getElementById('ob-wizard');
  if (existing) existing.remove();

  var el = document.createElement('div');
  el.id = 'ob-wizard';
  el.className = 'ob-wizard';

  var pct = Math.round(((step) / STEPS.length) * 100);

  var h = '<div class="ob-wizard-box">';
  h += '<div class="ob-wizard-progress"><div class="ob-wizard-progress-bar" style="width:' + pct + '%"></div></div>';
  h += '<div class="ob-wizard-hd"><span class="ob-wizard-step">Step ' + (step + 1) + ' of ' + STEPS.length + '</span><button class="ob-wizard-close" onclick="closeWizard()">&times;</button></div>';
  h += '<div class="ob-wizard-body">';
  h += '<h2 class="ob-wizard-title">' + escH(s.title) + '</h2>';
  h += '<p class="ob-wizard-desc">' + s.desc + '</p>';
  h += s.fields();

  if (!s.noSaveBtn) {
    h += '<div class="ob-wizard-btns">';
    if (step > 0) h += '<button class="ob-wizard-back" onclick="showWizardStep(' + (step - 1) + ')">Back</button>';
    h += '<button class="ob-wizard-next" onclick="saveWizardStep()">' + (step === STEPS.length - 1 ? 'Finish Setup' : 'Save &amp; Continue') + '</button>';
    if (s.optional) h += '<button class="ob-wizard-skip-step" onclick="showWizardStep(' + (step + 1) + ')">Skip</button>';
    h += '</div>';
  } else {
    h += '<div class="ob-wizard-btns">';
    if (step > 0) h += '<button class="ob-wizard-back" onclick="showWizardStep(' + (step - 1) + ')">Back</button>';
    h += '<button class="ob-wizard-skip-step" onclick="showWizardStep(' + (step + 1) + ')">' + (step === STEPS.length - 1 ? 'Finish Setup' : 'Skip for now') + '</button>';
    h += '</div>';
  }

  h += '</div></div>';
  el.innerHTML = h;
  document.body.appendChild(el);
}

window.saveWizardStep = async function() {
  var s = STEPS[_currentStep];
  var btn = document.querySelector('.ob-wizard-next');
  if (btn) { btn.textContent = 'Saving...'; btn.disabled = true; }

  var ok = await s.save();
  if (ok) {
    showWizardStep(_currentStep + 1);
  } else {
    if (btn) { btn.textContent = 'Save & Continue'; btn.disabled = false; }
  }
};

window.closeWizard = function() {
  var w = document.getElementById('ob-wizard');
  if (w) w.remove();
  setState({ welcomeDone: true });
};

// Logo upload handler
window.obUploadLogo = async function(input) {
  var file = input.files[0];
  if (!file) return;
  var status = document.getElementById('ob-logo-status');
  if (status) status.innerHTML = '<p style="text-align:center;font-size:13px;color:#64748b;">Uploading...</p>';

  try {
    var ext = file.name.split('.').pop();
    var fname = 'logo-' + Date.now() + '.' + ext;
    var sc = typeof supabaseClient !== 'undefined' ? supabaseClient : supabase;
    var up = await sc.storage.from('job-photos').upload('logos/' + fname, file);
    if (up.error) throw up.error;
    var url = sc.storage.from('job-photos').getPublicUrl(up.data.path);
    var publicUrl = url.data ? url.data.publicUrl : '';

    if (companySettings && companySettings.id) {
      await supabaseClient.from('company_settings').update({ logo_url: publicUrl }).eq('id', companySettings.id);
      companySettings.logo_url = publicUrl;
    }

    if (status) status.innerHTML = '<div style="text-align:center;"><img src="' + escH(publicUrl) + '" style="max-height:80px;margin:8px auto;border-radius:8px;" /><p style="font-size:12px;color:#10b981;font-weight:600;">Logo uploaded!</p></div>';
  } catch(e) {
    console.error(e);
    if (status) status.innerHTML = '<p style="text-align:center;font-size:13px;color:#ef4444;">Upload failed</p>';
  }
};

// ============ 3. DASHBOARD CHECKLIST ============
function injectChecklist() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'dashboard') return;

  var state = getState();
  if (state.checklistDismissed) return;
  if (isAllComplete()) return;

  var metricsGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
  if (!metricsGrid) return;
  if (metricsGrid.dataset.obChecklist) return;
  metricsGrid.dataset.obChecklist = 'true';

  var items = getChecklist();
  var doneCount = getCompletionCount();
  var total = items.length;
  var pct = Math.round((doneCount / total) * 100);

  var el = document.createElement('div');
  el.className = 'ob-checklist';

  var h = '<div class="ob-checklist-hd">';
  h += '<span class="ob-checklist-title">Setup Your Account</span>';
  h += '<div style="display:flex;align-items:center;gap:12px;">';
  h += '<span class="ob-checklist-progress">' + doneCount + '/' + total + ' complete</span>';
  h += '<button class="ob-checklist-dismiss" onclick="dismissChecklist()">Dismiss</button>';
  h += '</div></div>';

  h += '<div class="ob-checklist-bar"><div class="ob-checklist-bar-fill" style="width:' + pct + '%"></div></div>';

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var iconH = item.done
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
      : '';
    h += '<div class="ob-check-item" onclick="' + (item.done ? '' : escH(item.action)) + '">';
    h += '<div class="ob-check-icon ' + (item.done ? 'done' : '') + '">' + iconH + '</div>';
    h += '<span class="ob-check-text ' + (item.done ? 'done' : '') + '">' + escH(item.label) + '</span>';
    h += '</div>';
  }

  el.innerHTML = h;
  metricsGrid.parentElement.insertBefore(el, metricsGrid);
}

window.dismissChecklist = function() {
  setState({ checklistDismissed: true });
  var el = document.querySelector('.ob-checklist');
  if (el) el.remove();
};

// ============ INIT ============
function init() {
  if (!currentUser) return;
  if (typeof isTeamMember !== 'undefined' && isTeamMember) return; // Only for account owners

  var state = getState();

  // Show welcome screen on first ever login
  if (!state.welcomeDone && !state.dismissed) {
    // Check if this is truly a new user (no company settings, no clients, no quotes)
    var isNew = !companySettings || (!companySettings.business_name && clients.length === 0 && quotes.length === 0);
    if (isNew) {
      showWelcome();
      return;
    } else {
      setState({ welcomeDone: true, wizardDone: true });
    }
  }
}

// ============ OBSERVER ============
var _obTimer = null;
var _obInited = false;
var _obObs = new MutationObserver(function() {
  if (_obTimer) clearTimeout(_obTimer);
  _obTimer = setTimeout(function() {
    if (!_obInited && typeof currentUser !== 'undefined' && currentUser) {
      _obInited = true;
      init();
    }
    injectChecklist();
  }, 300);
});
_obObs.observe(document.body, { childList: true, subtree: true });

console.log('Onboarding wizard loaded');

} catch(e) {
  console.error('Onboarding init error:', e);
}
})();
