// M4 Email Automation Tweaks
// Hides trigger value, adds delay selector
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = '.ea-delay{display:inline-flex;align-items:center;gap:6px;margin-top:6px}.ea-delay select{padding:4px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;font-family:inherit;background:#fff;cursor:pointer}.dark .ea-delay select{background:#374151;border-color:#4b5563;color:#fff}.ea-delay label{font-size:11px;color:#64748b}';
document.head.appendChild(css);

var _done = false;

function setup() {
  if (_done) return;

  // Find automation rows
  var rows = document.querySelectorAll('.flex.items-center.justify-between.p-4');
  var found = false;

  rows.forEach(function(row) {
    var sub = row.querySelector('.text-sm.text-gray-600, .text-sm.dark\\:text-gray-400');
    if (!sub) return;
    var text = sub.textContent || '';
    if (text.indexOf('Trigger:') === -1) return;

    found = true;
    if (sub.dataset.eaDone) return;
    sub.dataset.eaDone = '1';

    // Extract current delay
    var delayMatch = text.match(/Delay:\s*(-?\d+)/);
    var currentDelay = delayMatch ? parseInt(delayMatch[1]) : 0;
    if (currentDelay < 0) currentDelay = 0;

    // Extract automation key from the onclick
    var toggle = row.querySelector('input[onchange]');
    var automationKey = '';
    if (toggle) {
      var oc = toggle.getAttribute('onchange') || '';
      var km = oc.match(/toggleAutomation\('([^']+)'\)/);
      if (km) automationKey = km[1];
    }

    // Get actual delay from automationRules
    if (automationKey && typeof automationRules !== 'undefined' && automationRules[automationKey]) {
      currentDelay = Math.abs(automationRules[automationKey].delay || 0);
    }

    // Replace trigger text with friendly description + delay selector
    var desc = '';
    if (text.indexOf('quote_created') !== -1) desc = 'Sends when a quote is created';
    else if (text.indexOf('quote_follow') !== -1) desc = 'Follow-up for unanswered quotes';
    else if (text.indexOf('invoice_created') !== -1) desc = 'Sends when an invoice is created';
    else if (text.indexOf('invoice_overdue') !== -1) desc = 'Reminder for overdue invoices';
    else if (text.indexOf('payment_received') !== -1) desc = 'Thank you after payment';
    else if (text.indexOf('job_complete') !== -1) desc = 'Notification when job is completed';
    else desc = 'Automated email notification';

    sub.innerHTML = '<div style="margin-bottom:4px">' + desc + '</div>' +
      '<div class="ea-delay">' +
        '<label>Send after:</label>' +
        '<select onchange="updateAutomationDelay(\'' + automationKey + '\',this.value)">' +
          '<option value="0"' + (currentDelay === 0 ? ' selected' : '') + '>Immediately</option>' +
          '<option value="1"' + (currentDelay === 1 ? ' selected' : '') + '>1 day</option>' +
          '<option value="2"' + (currentDelay === 2 ? ' selected' : '') + '>2 days</option>' +
          '<option value="3"' + (currentDelay === 3 ? ' selected' : '') + '>3 days</option>' +
          '<option value="5"' + (currentDelay === 5 ? ' selected' : '') + '>5 days</option>' +
          '<option value="7"' + (currentDelay === 7 ? ' selected' : '') + '>7 days</option>' +
          '<option value="14"' + (currentDelay === 14 ? ' selected' : '') + '>14 days</option>' +
          '<option value="30"' + (currentDelay === 30 ? ' selected' : '') + '>30 days</option>' +
        '</select>' +
      '</div>';
  });

  if (found) _done = true;
}

// Save delay to automationRules
window.updateAutomationDelay = function(name, days) {
  try {
    // Find matching rule key
    for (var key in automationRules) {
      if (key.toLowerCase().indexOf(name.replace(/_/g, '')) !== -1 || name.indexOf(key) !== -1) {
        automationRules[key].delay = parseInt(days);
        // Try saving if save function exists
        if (typeof saveEmailAutomationSettings === 'function') saveEmailAutomationSettings();
        showNotification('Delay updated to ' + (days === '0' ? 'immediately' : days + ' days'), 'success');
        return;
      }
    }
    // Direct key match
    if (automationRules[name]) {
      automationRules[name].delay = parseInt(days);
      if (typeof saveEmailAutomationSettings === 'function') saveEmailAutomationSettings();
      showNotification('Delay updated to ' + (days === '0' ? 'immediately' : days + ' days'), 'success');
    }
  } catch(e) {
    showNotification('Error: ' + e.message, 'error');
  }
};

var _t = null;
new MutationObserver(function() {
  if (_done) return;
  if (_t) clearTimeout(_t);
  _t = setTimeout(setup, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Automation tweaks loaded');

} catch(e) {
  console.error('Automation tweaks error:', e);
}
})();
