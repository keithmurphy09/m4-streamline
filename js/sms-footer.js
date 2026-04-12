// M4 SMS Footer - Do not reply notice
// Additive only
(function(){
try {

var _origQuoteSMS = window.sendQuoteSMS;
var _origInvoiceSMS = window.sendInvoiceSMS;

function getFooter() {
  var name = '';
  var phone = '';
  try {
    if (typeof settings !== 'undefined' && settings) {
      name = settings.business_name || settings.company_name || '';
      phone = settings.phone || settings.business_phone || '';
    }
    if (!name && typeof currentUser !== 'undefined' && currentUser) {
      name = currentUser.user_metadata ? (currentUser.user_metadata.business_name || currentUser.user_metadata.full_name || '') : '';
    }
  } catch(e) {}

  var footer = '\n\nDo not reply to this text.';
  if (name && phone) {
    footer += ' To respond, contact ' + name + ' on ' + phone + '.';
  } else if (phone) {
    footer += ' To respond, call ' + phone + '.';
  } else if (name) {
    footer += ' To respond, contact ' + name + ' directly.';
  }
  return footer;
}

// Override sendQuoteSMS
window.sendQuoteSMS = async function(quote) {
  var client = clients.find(function(c) { return c.id === quote.client_id; });
  if (!client || !client.phone) { showNotification('Client has no phone number', 'error'); return; }
  if (!smsSettings || !smsSettings.enabled) { showNotification('SMS is not configured', 'error'); return; }

  var currentUrl = window.location.href.split('?')[0].split('#')[0];
  var baseUrl = currentUrl.replace(/\/[^\/]*$/, '/');
  var shareLink = baseUrl + 'quote-viewer.html?quote=' + quote.share_token;

  var message = 'Hi ' + client.name + ', your quote ' + (quote.quote_number || quote.title) + ' for $' + quote.total.toFixed(2) + ' is ready. View it here: ' + shareLink;
  message += getFooter();

  try {
    var response = await fetch('https://xviustrrsuhidzbcpgow.supabase.co/functions/v1/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + supabaseClient.supabaseKey
      },
      body: JSON.stringify({
        user_id: currentUser.id,
        to_number: client.phone,
        message: message
      })
    });
    var result = await response.json();
    if (response.ok && result.success) {
      showNotification('SMS sent to ' + client.phone, 'success');
    } else {
      showNotification('SMS failed: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch(e) {
    showNotification('SMS error: ' + e.message, 'error');
  }
};

// Override sendInvoiceSMS
window.sendInvoiceSMS = async function(invoice) {
  var client = clients.find(function(c) { return c.id === invoice.client_id; });
  if (!client || !client.phone) { showNotification('Client has no phone number', 'error'); return; }
  if (!smsSettings || !smsSettings.enabled) { showNotification('SMS is not configured', 'error'); return; }

  var baseUrl = window.location.href.split('?')[0].replace('index.html', '').replace(/\/[^\/]*$/, '/');
  var paymentLink = baseUrl + 'payment.html?invoice=' + invoice.id;

  var message = 'Hi ' + client.name + ', your invoice ' + (invoice.invoice_number || invoice.title) + ' for $' + invoice.total.toFixed(2) + ' is ready. View & pay here: ' + paymentLink;
  message += getFooter();

  try {
    var response = await fetch('https://xviustrrsuhidzbcpgow.supabase.co/functions/v1/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + supabaseClient.supabaseKey
      },
      body: JSON.stringify({
        user_id: currentUser.id,
        to_number: client.phone,
        message: message
      })
    });
    var result = await response.json();
    if (response.ok && result.success) {
      showNotification('SMS sent to ' + client.phone, 'success');
    } else {
      showNotification('SMS failed: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch(e) {
    showNotification('SMS error: ' + e.message, 'error');
  }
};

console.log('SMS footer loaded');

} catch(e) {
  console.error('SMS footer error:', e);
}
})();
