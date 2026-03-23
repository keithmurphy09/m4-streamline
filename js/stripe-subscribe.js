// M4 Stripe Subscriptions
// Loads Stripe.js, wires pricing buttons to secure checkout worker
// Additive only
(function(){
try {

var STRIPE_WORKER = 'https://rough-leaf-6e8e.keithmurphy009.workers.dev';
var STRIPE_PK = 'pk_live_51SrtfvRyQRluLLu5QM2pa6174eabcUiLnNfq6N7DNtnBgJgMaRvPzCTBmooQ2ukUeZkAufA4Z7cAq392TF3Ior3w00M7CJb3eF';

// Load Stripe.js
var script = document.createElement('script');
script.src = 'https://js.stripe.com/v3/';
script.onload = function() { console.log('Stripe.js loaded'); };
document.head.appendChild(script);

// ============ SUBSCRIBE FUNCTIONS ============
window.subscribePlan = async function(plan) {
  var email = '';
  var userId = '';
  if (typeof currentUser !== 'undefined' && currentUser) {
    email = currentUser.email || '';
    userId = currentUser.id || '';
  }

  try {
    showNotification('Redirecting to checkout...', 'success');

    var r = await fetch(STRIPE_WORKER + '/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: plan, email: email, user_id: userId })
    });
    var data = await r.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      showNotification('Error: ' + (data.error || 'Could not create checkout'), 'error');
    }
  } catch(e) {
    showNotification('Error: ' + e.message, 'error');
  }
};

window.openBillingPortal = async function() {
  if (!currentUser) return;

  try {
    // Get customer ID from Stripe
    var sr = await fetch(STRIPE_WORKER + '/status?email=' + encodeURIComponent(currentUser.email));
    var status = await sr.json();

    if (!status.customer_id) {
      showNotification('No active subscription found', 'error');
      return;
    }

    var r = await fetch(STRIPE_WORKER + '/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: status.customer_id })
    });
    var data = await r.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      showNotification('Error: ' + (data.error || 'Could not open portal'), 'error');
    }
  } catch(e) {
    showNotification('Error: ' + e.message, 'error');
  }
};

// ============ WIRE UP PRICING BUTTONS ============
function wirePricingButtons() {
  // Find pricing cards on landing page
  var cards = document.querySelectorAll('.lp2-price-card');
  cards.forEach(function(card) {
    var title = card.querySelector('h3');
    if (!title) return;
    var name = title.textContent.trim();

    var btn = card.querySelector('button, a');
    if (!btn || btn.dataset.stripeWired) return;
    btn.dataset.stripeWired = 'true';

    if (name === 'Solo Trader') {
      btn.setAttribute('onclick', "subscribePlan('sole_trader')");
      btn.removeAttribute('href');
      btn.style.cursor = 'pointer';
    } else if (name === 'Business') {
      btn.setAttribute('onclick', "subscribePlan('business')");
      btn.removeAttribute('href');
      btn.style.cursor = 'pointer';
    }
    // Trial button stays as-is (goes to signup)
  });
}

// ============ CHECK SUBSCRIPTION SUCCESS ============
function checkSubscriptionReturn() {
  var params = new URLSearchParams(window.location.search);
  if (params.get('subscription') === 'success') {
    var plan = params.get('plan') || 'your plan';
    setTimeout(function() {
      showNotification('Subscription activated! Welcome to M4 Streamline ' + plan.replace('_', ' ') + '.', 'success');
    }, 1000);
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }
  if (params.get('subscription') === 'cancelled') {
    setTimeout(function() {
      showNotification('Subscription cancelled. You can try again anytime.', 'error');
    }, 1000);
    window.history.replaceState({}, '', window.location.pathname);
  }
}

checkSubscriptionReturn();

// Observer for landing page pricing buttons
var _spTimer = null;
new MutationObserver(function() {
  if (_spTimer) clearTimeout(_spTimer);
  _spTimer = setTimeout(wirePricingButtons, 300);
}).observe(document.body, { childList: true, subtree: true });

// ============ OVERRIDE DISCOUNT FUNCTIONS TO SYNC WITH STRIPE ============
var _origSaveDiscount = window.saveDiscount;
window.saveDiscount = async function(id) {
  // Call original to save to Supabase
  if (typeof _origSaveDiscount === 'function') await _origSaveDiscount(id);

  // Now apply to Stripe
  var percentEl = document.getElementById('discount_' + id);
  var monthsEl = document.getElementById('discount_months_' + id);
  var percent = percentEl ? parseFloat(percentEl.value) : 0;
  var months = monthsEl && monthsEl.value ? parseInt(monthsEl.value) : null;

  if (percent <= 0) return;

  // Find user email from the admin table
  var row = percentEl ? percentEl.closest('tr') : null;
  var email = '';
  if (row) {
    var cells = row.querySelectorAll('td');
    if (cells.length > 0) email = cells[0].textContent.trim();
  }

  if (!email) { console.warn('Could not find user email for Stripe discount'); return; }

  try {
    var r = await fetch('https://rough-leaf-6e8e.keithmurphy009.workers.dev/discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, percent: percent, months: months })
    });
    var result = await r.json();
    if (result.success) {
      showNotification('Discount applied in Stripe: ' + percent + '% off' + (months ? ' for ' + months + ' months' : ' indefinitely'), 'success');
    } else {
      showNotification('Saved locally but Stripe: ' + (result.error || 'unknown error'), 'error');
    }
  } catch(e) {
    showNotification('Saved locally but Stripe sync failed: ' + e.message, 'error');
  }
};

var _origRemoveDiscount = window.removeDiscount;
window.removeDiscount = async function(id) {
  // Find email before removing
  var percentEl = document.getElementById('discount_' + id);
  var row = percentEl ? percentEl.closest('tr') : null;
  var email = '';
  if (row) {
    var cells = row.querySelectorAll('td');
    if (cells.length > 0) email = cells[0].textContent.trim();
  }

  // Call original
  if (typeof _origRemoveDiscount === 'function') await _origRemoveDiscount(id);

  // Remove from Stripe
  if (!email) return;
  try {
    var r = await fetch('https://rough-leaf-6e8e.keithmurphy009.workers.dev/remove-discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    });
    var result = await r.json();
    if (result.success) {
      showNotification('Discount removed from Stripe', 'success');
    }
  } catch(e) { console.warn('Stripe discount removal failed:', e); }
};

console.log('Stripe subscriptions loaded');

} catch(e) {
  console.error('Stripe error:', e);
}
})();
