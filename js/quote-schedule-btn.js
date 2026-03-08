// M4 Quote Schedule Button Enhancement v2
// Always shows a schedule button on quote cards and dropdowns
// If job exists: "Add Trade" -> opens job detail to add tasks
// If no job yet: "Schedule Job" -> creates new job from quote
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

function findJobForQuote(q) {
  if (!q) return null;
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].title === q.title && jobs[i].client_id === q.client_id) return jobs[i];
  }
  return null;
}

// ============ DROPDOWN MENUS (table 3-dot) ============
function enhanceQuoteDropdowns() {
  var menus = document.querySelectorAll('[id^="actions-"]');
  menus.forEach(function(menu) {
    if (menu.dataset.schedBtnAdded) return;

    var qId = menu.id.replace('actions-', '');
    if (!qId) return;

    // Verify this is a quote menu
    var text = menu.textContent || '';
    if (text.indexOf('Email Quote') === -1) return;

    menu.dataset.schedBtnAdded = 'true';

    var q = findQuoteById(qId);
    if (!q) return;

    var container = menu.querySelector('.py-1');
    if (!container) return;

    var existingJob = findJobForQuote(q);
    var btnLabel = existingJob ? 'Add Trade' : 'Schedule Job';

    // Find insertion point: before Convert to Invoice or before Delete
    var convertBtn = null;
    var deleteBtn = null;
    var buttons = container.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var btnText = buttons[i].textContent.trim();
      if (btnText === 'Convert to Invoice') convertBtn = buttons[i];
      if (btnText === 'Delete') deleteBtn = buttons[i];
    }

    var schedBtn = document.createElement('button');
    schedBtn.className = 'block w-full text-left px-4 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-700';
    schedBtn.textContent = btnLabel;
    schedBtn.setAttribute('onclick', 'scheduleTradeFromQuoteId(\'' + qId + '\')');

    if (convertBtn) {
      container.insertBefore(schedBtn, convertBtn);
    } else if (deleteBtn) {
      container.insertBefore(schedBtn, deleteBtn);
    } else {
      container.appendChild(schedBtn);
    }
  });
}

// ============ MOBILE CARDS ============
function enhanceMobileCards() {
  var cards = document.querySelectorAll('.quote-card');
  cards.forEach(function(card) {
    if (card.dataset.schedBtnAdded) return;

    var actionsDiv = card.querySelector('.quote-card-actions');
    if (!actionsDiv) return;

    var onclickAttr = card.getAttribute('onclick') || '';
    var idMatch = onclickAttr.match(/"id"\s*:\s*"([^"]+)"/);
    if (!idMatch) return;
    var qId = idMatch[1];

    var q = findQuoteById(qId);
    if (!q) return;

    card.dataset.schedBtnAdded = 'true';

    var existingJob = findJobForQuote(q);
    var btnLabel = existingJob ? 'Add Trade' : 'Schedule';

    var schedBtn = document.createElement('button');
    schedBtn.className = 'quote-card-action-btn';
    schedBtn.style.color = '#0d9488';
    schedBtn.style.fontWeight = '600';
    schedBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>' +
      '</svg> ' + btnLabel;
    schedBtn.setAttribute('onclick', 'event.stopPropagation();scheduleTradeFromQuoteId(\'' + qId + '\')');

    if (actionsDiv.firstChild) {
      actionsDiv.insertBefore(schedBtn, actionsDiv.firstChild);
    } else {
      actionsDiv.appendChild(schedBtn);
    }
  });
}

// ============ QUOTE DETAIL VIEW ============
function enhanceQuoteDetail() {
  // The detail view hides "Schedule Job" when isConverted is true
  // We inject an "Add Trade" button into the actions bar for converted quotes
  var actionsBar = document.querySelector('.flex.flex-wrap.gap-2.pt-4.border-t');
  if (!actionsBar || actionsBar.dataset.tradeBtnAdded) return;

  // Check if there's already a Schedule Job button visible
  var hasScheduleBtn = false;
  var btns = actionsBar.querySelectorAll('button');
  for (var i = 0; i < btns.length; i++) {
    var txt = btns[i].textContent.trim();
    if (txt === 'Schedule Job' || txt === 'Add Trade') {
      hasScheduleBtn = true;
      break;
    }
  }
  if (hasScheduleBtn) return;

  // Find current quote from the detail view
  // Look for the quote number in the header
  var qNumEl = actionsBar.closest('.bg-white, .dark\\:bg-gray-800');
  if (!qNumEl) return;

  // Try to get quote ID from edit button onclick
  var editBtn = null;
  for (var b = 0; b < btns.length; b++) {
    var oc = btns[b].getAttribute('onclick') || '';
    if (oc.indexOf('openModal') !== -1 && oc.indexOf('quote') !== -1) {
      editBtn = btns[b];
      break;
    }
  }
  if (!editBtn) return;

  var editOc = editBtn.getAttribute('onclick') || '';
  var idMatch = editOc.match(/"id"\s*:\s*"([^"]+)"/);
  if (!idMatch) return;
  var qId = idMatch[1];

  var q = findQuoteById(qId);
  if (!q) return;

  var existingJob = findJobForQuote(q);
  if (!existingJob) return; // No job = original Schedule Job button should be visible

  actionsBar.dataset.tradeBtnAdded = 'true';

  var tradeBtn = document.createElement('button');
  tradeBtn.className = 'inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 border border-teal-600 rounded-lg transition-colors';
  tradeBtn.innerHTML = '<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>' +
    '</svg>Add Trade';
  tradeBtn.setAttribute('onclick', 'scheduleTradeFromQuoteId(\'' + qId + '\')');

  // Insert as first button
  if (actionsBar.firstChild) {
    actionsBar.insertBefore(tradeBtn, actionsBar.firstChild);
  } else {
    actionsBar.appendChild(tradeBtn);
  }
}

// ============ MAIN ACTION ============
window.scheduleTradeFromQuoteId = function(quoteId) {
  var q = findQuoteById(quoteId);
  if (!q) {
    showNotification('Quote not found', 'error');
    return;
  }

  // Close any open dropdown
  var menu = document.getElementById('actions-' + quoteId);
  if (menu) menu.classList.add('hidden');

  var existingJob = findJobForQuote(q);

  if (existingJob) {
    // Job exists: go straight to job detail so user can add a task/trade
    scheduleView = 'list';
    openJobDetail(existingJob);
    showNotification('Add a new trade in the Tasks section below', 'success');
  } else {
    // No job yet: create one via existing modal
    if (typeof openJobFromQuote === 'function') {
      openJobFromQuote(q);
    } else {
      showNotification('Schedule function not available', 'error');
    }
  }
};

// ============ OBSERVER ============
var _quoteSchedTimer = null;
var _quoteSchedObs = new MutationObserver(function() {
  if (_quoteSchedTimer) clearTimeout(_quoteSchedTimer);
  _quoteSchedTimer = setTimeout(function() {
    enhanceQuoteDropdowns();
    enhanceMobileCards();
    enhanceQuoteDetail();
  }, 200);
});
_quoteSchedObs.observe(document.body, { childList: true, subtree: true });

console.log('Quote schedule button v2 loaded');

} catch(e) {
  console.error('Quote schedule btn init error:', e);
}
})();
