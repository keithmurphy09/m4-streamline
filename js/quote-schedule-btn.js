// M4 Quote Schedule Button Enhancement
// Injects "Schedule Job" into quote table dropdown menus and mobile cards
// Additive only - no modifications to existing files
(function(){
try {

function findQuoteById(id) {
  if (!id) return null;
  for (var i = 0; i < quotes.length; i++) {
    if (quotes[i].id === id) return quotes[i];
  }
  return null;
}

function isQuoteConverted(q) {
  if (!q) return true;
  if (q.status === 'converted') return true;
  // Check if job already exists for this quote
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].title === q.title && jobs[i].client_id === q.client_id) return true;
  }
  return false;
}

function enhanceQuoteDropdowns() {
  // Find all quote action dropdown menus
  var menus = document.querySelectorAll('[id^="actions-"]');
  menus.forEach(function(menu) {
    if (menu.dataset.schedBtnAdded) return;

    // Extract quote ID from menu id (format: "actions-{quoteId}")
    var qId = menu.id.replace('actions-', '');
    if (!qId) return;

    // Verify this is a quote menu (not invoice or job)
    // Quote menus contain "Download PDF" + "Email Quote" text
    var text = menu.textContent || '';
    if (text.indexOf('Email Quote') === -1) return;

    menu.dataset.schedBtnAdded = 'true';

    var q = findQuoteById(qId);
    if (!q) return;
    if (isQuoteConverted(q)) return;

    // Find the py-1 container inside the menu
    var container = menu.querySelector('.py-1');
    if (!container) return;

    // Find the "Convert to Invoice" button or the delete button as insertion point
    var convertBtn = null;
    var deleteBtn = null;
    var buttons = container.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var btnText = buttons[i].textContent.trim();
      if (btnText === 'Convert to Invoice') convertBtn = buttons[i];
      if (btnText === 'Delete') deleteBtn = buttons[i];
    }

    // Create schedule button
    var schedBtn = document.createElement('button');
    schedBtn.className = 'block w-full text-left px-4 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-700';
    schedBtn.textContent = 'Schedule Job';
    schedBtn.setAttribute('onclick', 'scheduleJobFromQuoteId(\'' + qId + '\')');

    // Insert before Convert to Invoice, or before Delete
    if (convertBtn) {
      container.insertBefore(schedBtn, convertBtn);
    } else if (deleteBtn) {
      container.insertBefore(schedBtn, deleteBtn);
    } else {
      container.appendChild(schedBtn);
    }
  });
}

function enhanceMobileCards() {
  var cards = document.querySelectorAll('.quote-card');
  cards.forEach(function(card) {
    if (card.dataset.schedBtnAdded) return;

    // Find the actions area
    var actionsDiv = card.querySelector('.quote-card-actions');
    if (!actionsDiv) return;

    // Get quote ID from the onclick of the card
    var onclickAttr = card.getAttribute('onclick') || '';
    // Extract ID from JSON in onclick - look for "id":"xxx"
    var idMatch = onclickAttr.match(/"id"\s*:\s*"([^"]+)"/);
    if (!idMatch) return;
    var qId = idMatch[1];

    var q = findQuoteById(qId);
    if (!q) return;
    if (isQuoteConverted(q)) return;

    card.dataset.schedBtnAdded = 'true';

    // Create schedule button matching existing card button style
    var schedBtn = document.createElement('button');
    schedBtn.className = 'quote-card-action-btn';
    schedBtn.style.color = '#0d9488';
    schedBtn.style.fontWeight = '600';
    schedBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>' +
      '</svg> Schedule';
    schedBtn.setAttribute('onclick', 'event.stopPropagation();scheduleJobFromQuoteId(\'' + qId + '\')');

    // Insert as first action button
    if (actionsDiv.firstChild) {
      actionsDiv.insertBefore(schedBtn, actionsDiv.firstChild);
    } else {
      actionsDiv.appendChild(schedBtn);
    }
  });
}

// Global function to schedule from quote ID (used by both dropdown and card buttons)
window.scheduleJobFromQuoteId = function(quoteId) {
  var q = findQuoteById(quoteId);
  if (!q) {
    showNotification('Quote not found', 'error');
    return;
  }

  // Close any open dropdown
  var menu = document.getElementById('actions-' + quoteId);
  if (menu) menu.classList.add('hidden');

  // Use existing openJobFromQuote
  if (typeof openJobFromQuote === 'function') {
    openJobFromQuote(q);
  } else {
    showNotification('Schedule function not available', 'error');
  }
};

// Run on DOM changes
var _quoteSchedTimer = null;
var _quoteSchedObs = new MutationObserver(function() {
  if (_quoteSchedTimer) clearTimeout(_quoteSchedTimer);
  _quoteSchedTimer = setTimeout(function() {
    enhanceQuoteDropdowns();
    enhanceMobileCards();
  }, 200);
});
_quoteSchedObs.observe(document.body, { childList: true, subtree: true });

console.log('Quote schedule button enhancement loaded');

} catch(e) {
  console.error('Quote schedule btn init error:', e);
}
})();
