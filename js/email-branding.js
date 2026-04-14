// M4 Email Branding - Tradies Network
// Overrides sendQuoteEmail and sendInvoiceEmail
// Additive only
(function(){
try {

var TN_LOGO = 'https://raw.githubusercontent.com/keithmurphy09/m4-streamline/main/tradies-network-logo.png';
var TN_TEXT = 'https://raw.githubusercontent.com/keithmurphy09/m4-streamline/main/tradies-network-text.png';
var TN_FROM = 'info@tradiesnetwork.app';

function getDoNotReply() {
  var name = '';
  var phone = '';
  var email = '';
  try {
    if (typeof companySettings !== 'undefined' && companySettings) {
      name = companySettings.business_name || '';
      phone = companySettings.phone || '';
      email = companySettings.email || '';
    }
    if (!name && typeof settings !== 'undefined' && settings) {
      name = settings.business_name || settings.company_name || '';
      phone = settings.phone || settings.business_phone || '';
      email = settings.email || '';
    }
  } catch(e) {}

  var contact = '';
  if (name && phone) contact = name + ' on ' + phone;
  else if (name && email) contact = name + ' at ' + email;
  else if (phone) contact = phone;
  else if (name) contact = name + ' directly';

  return '<div style="margin-top:30px;padding-top:15px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;">Do not reply to this email.' + (contact ? ' To respond, please contact ' + contact + '.' : '') + '</div>';
}

function buildEmailHTML(opts) {
  return '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">' +
    '<div style="text-align:center;margin-bottom:30px;padding:20px;background:#0a0a0a;border-radius:8px;">' +
      '<img src="' + TN_LOGO + '" alt="Tradies Network" style="max-width:80px;max-height:60px;margin-bottom:10px;filter:invert(1) brightness(3) contrast(1.2);">' +
      '<img src="' + TN_TEXT + '" alt="Tradies Network" style="max-width:220px;height:auto;margin:10px auto;display:block;filter:invert(1);">' +
      '<p style="color:#2dd4bf;font-size:12px;margin:0;">Powered by M4 STREAMLINE</p>' +
    '</div>' +
    '<p>Hello ' + opts.clientName + ',</p>' +
    '<p>' + opts.fromName + ' has sent you ' + opts.docType + ': <strong>' + opts.title + '</strong></p>' +
    '<p>Total Amount: <strong>$' + opts.total + '</strong></p>' +
    '<p>' + opts.message + '</p>' +
    '<p style="margin:30px 0;">' +
      '<a href="' + opts.link + '" style="background-color:#0d9488;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;">' + opts.btnText + '</a>' +
    '</p>' +
    '<p>Or copy and paste this link into your browser:</p>' +
    '<p style="color:#0d9488;word-break:break-all;">' + opts.link + '</p>' +
    '<p>Best regards,<br>' + opts.fromName + '</p>' +
    getDoNotReply() +
  '</div>';
}

// Override sendQuoteEmail
var _origQE = window.sendQuoteEmail;
window.sendQuoteEmail = async function(quote) {
  var client = clients.find(function(c) { return c.id === quote.client_id; });
  if (!client || !client.email) { alert('Client email not found!'); return; }
  if (!emailSettings || !emailSettings.sendgrid_api_key) { alert('Email not configured! Please add your SendGrid settings in Company Info.'); return; }

  var currentUrl = window.location.href.split('?')[0].split('#')[0];
  var baseUrl = currentUrl.replace(/\/[^\/]*$/, '/');
  var shareLink = baseUrl + 'quote-viewer.html?quote=' + quote.share_token;
  var fromName = emailSettings.from_name || 'Tradies Network';

  var html = buildEmailHTML({
    clientName: client.name,
    fromName: fromName,
    docType: 'a quote for',
    title: quote.title,
    total: quote.total.toFixed(2),
    message: 'Please click the link below to view and download your quote.',
    link: shareLink,
    btnText: 'View Your Quote'
  });

  try {
    var response = await fetch('https://xviustrrsuhidzbcpgow.supabase.co/functions/v1/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXVzdHJyc3VoaWR6YmNwZ293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODk1NDgsImV4cCI6MjA4NDM2NTU0OH0.CEcc50c1K2Qnh6rXt_1-_w30LzHvDniGLbqWhdOolRY'
      },
      body: JSON.stringify({
        user_id: currentUser.id,
        to_email: client.email,
        to_name: client.name,
        subject: 'Quote from ' + fromName + ' - ' + (quote.quote_number || quote.title),
        html_content: html
      })
    });
    var result = await response.json();
    if (response.ok && result.success) {
      showNotification('Quote emailed to ' + client.email, 'success');
    } else {
      showNotification('Email failed: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch(e) {
    showNotification('Email error: ' + e.message, 'error');
  }
};

// Override sendInvoiceEmail
var _origIE = window.sendInvoiceEmail;
window.sendInvoiceEmail = async function(invoice) {
  var client = clients.find(function(c) { return c.id === invoice.client_id; });
  if (!client || !client.email) { alert('Client email not found!'); return; }
  if (!emailSettings || !emailSettings.sendgrid_api_key) { alert('Email not configured! Please add your SendGrid settings in Company Info.'); return; }

  var baseUrl = window.location.href.split('?')[0].replace('index.html', '').replace(/\/[^\/]*$/, '/');
  var paymentLink = baseUrl + 'payment.html?invoice=' + invoice.id;
  var fromName = emailSettings.from_name || 'Tradies Network';

  var html = buildEmailHTML({
    clientName: client.name,
    fromName: fromName,
    docType: 'an invoice for',
    title: invoice.title,
    total: invoice.total.toFixed(2),
    message: 'Please click the link below to view and pay your invoice.',
    link: paymentLink,
    btnText: 'View & Pay Invoice'
  });

  try {
    var response = await fetch('https://xviustrrsuhidzbcpgow.supabase.co/functions/v1/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXVzdHJyc3VoaWR6YmNwZ293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODk1NDgsImV4cCI6MjA4NDM2NTU0OH0.CEcc50c1K2Qnh6rXt_1-_w30LzHvDniGLbqWhdOolRY'
      },
      body: JSON.stringify({
        user_id: currentUser.id,
        to_email: client.email,
        to_name: client.name,
        subject: 'Invoice from ' + fromName + ' - ' + (invoice.invoice_number || invoice.title),
        html_content: html
      })
    });
    var result = await response.json();
    if (response.ok && result.success) {
      showNotification('Invoice emailed to ' + client.email, 'success');
    } else {
      showNotification('Email failed: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch(e) {
    showNotification('Email error: ' + e.message, 'error');
  }
};

console.log('Email branding loaded');

} catch(e) {
  console.error('Email branding error:', e);
}
})();
