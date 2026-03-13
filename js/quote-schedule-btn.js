// M4 Quote Schedule Button + Add Trade Modal v3
// Always shows schedule/add-trade button on quotes
// Opens a proper modal popup for adding trades to existing jobs
// Additive only
(function(){
try {

// ============ HELPERS ============
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

function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ============ ADD TRADE MODAL ============
window.openAddTradeModal = function(jobId) {
  // Load tasks first
  if (typeof loadJobTasks === 'function') {
    loadJobTasks().then(function() {
      renderAddTradeModal(jobId);
    });
  } else {
    renderAddTradeModal(jobId);
  }
};

function renderAddTradeModal(jobId) {
  var job = null;
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id === jobId) { job = jobs[i]; break; }
  }
  if (!job) {
    showNotification('Job not found', 'error');
    return;
  }

  var cl = null;
  for (var c = 0; c < clients.length; c++) {
    if (clients[c].id === job.client_id) { cl = clients[c]; break; }
  }

  var jobTasks = (window.jobTasks || []).filter(function(t) { return t.job_id === jobId; });

  // Worker options
  var workerOpts = '<option value="">Unassigned</option>';
  for (var w = 0; w < teamMembers.length; w++) {
    var m = teamMembers[w];
    var occ = m.occupation ? ' (' + escH(m.occupation) + ')' : '';
    workerOpts += '<option value="' + m.id + '">' + escH(m.name) + occ + '</option>';
  }

  // Depends on options
  var depOpts = '<option value="">None (starts independently)</option>';
  for (var t = 0; t < jobTasks.length; t++) {
    depOpts += '<option value="' + jobTasks[t].id + '">' + escH(jobTasks[t].title) + '</option>';
  }

  // Default start date to job start
  var defaultStart = job.date || '';

  var overlay = document.createElement('div');
  overlay.id = 'add-trade-modal';
  overlay.className = 'fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto';
  overlay.setAttribute('onclick', 'if(event.target===this)closeAddTradeModal()');

  overlay.innerHTML =
    '<div class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-lg w-full my-4" style="max-height:90vh;overflow-y:auto;">' +

      // Header
      '<div class="flex justify-between mb-4">' +
        '<div>' +
          '<h3 class="text-lg sm:text-xl font-bold dark:text-white">Add Trade / Task</h3>' +
          '<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">' + escH(job.title) + (cl ? ' - ' + escH(cl.name) : '') + '</p>' +
        '</div>' +
        '<button onclick="closeAddTradeModal()" class="text-2xl leading-none dark:text-gray-300 hover:text-gray-600">&times;</button>' +
      '</div>' +

      // Existing trades summary
      (jobTasks.length > 0
        ? '<div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">' +
            '<p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Existing Trades (' + jobTasks.length + ')</p>' +
            '<div class="space-y-1">' +
              jobTasks.map(function(tk) {
                var mem = null;
                for (var mi = 0; mi < teamMembers.length; mi++) {
                  if (teamMembers[mi].id === tk.assigned_member_id) { mem = teamMembers[mi]; break; }
                }
                var label = escH(tk.title);
                if (mem) label += ' <span class="text-gray-400">-</span> <span style="color:' + (mem.color || '#14b8a6') + ';">' + escH(mem.name) + '</span>';
                if (tk.start_date) {
                  var sd = new Date(tk.start_date + 'T00:00:00');
                  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  label += ' <span class="text-gray-400">(' + months[sd.getMonth()] + ' ' + sd.getDate() + ', ' + (tk.duration_days || 1) + 'd)</span>';
                }
                return '<div class="text-sm text-gray-700 dark:text-gray-300">' + label + '</div>';
              }).join('') +
            '</div>' +
          '</div>'
        : '') +

      // Form
      '<div class="space-y-3">' +

        // Trade/task name
        '<div>' +
          '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trade / Task Name *</label>' +
          '<input type="text" id="trade-name" placeholder="e.g. Plumbing Rough-In, Electrical, Framing..." class="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent" autofocus>' +
        '</div>' +

        // Worker
        '<div>' +
          '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Worker</label>' +
          '<select id="trade-worker" class="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent">' +
            workerOpts +
          '</select>' +
        '</div>' +

        // Start date + duration row
        '<div class="grid grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>' +
            '<input type="date" id="trade-start" value="' + defaultStart + '" class="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent">' +
          '</div>' +
          '<div>' +
            '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (days)</label>' +
            '<input type="number" id="trade-duration" value="1" min="1" max="365" class="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent">' +
          '</div>' +
        '</div>' +

        // Depends on
        '<div>' +
          '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Starts After (dependency)</label>' +
          '<select id="trade-depends" class="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent">' +
            depOpts +
          '</select>' +
        '</div>' +

      '</div>' +

      // Buttons
      '<div class="flex gap-3 mt-6">' +
        '<button onclick="saveTradeFromModal(\'' + jobId + '\')" class="flex-1 bg-teal-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors">Add Trade</button>' +
        '<button onclick="closeAddTradeModal()" class="px-6 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>' +
      '</div>' +

    '</div>';

  document.body.appendChild(overlay);

  // Focus name input
  setTimeout(function() {
    var nameInput = document.getElementById('trade-name');
    if (nameInput) nameInput.focus();
  }, 100);
}

window.closeAddTradeModal = function() {
  var modal = document.getElementById('add-trade-modal');
  if (modal) modal.remove();
};

window.saveTradeFromModal = async function(jobId) {
  var nameEl = document.getElementById('trade-name');
  var workerEl = document.getElementById('trade-worker');
  var startEl = document.getElementById('trade-start');
  var durEl = document.getElementById('trade-duration');
  var depEl = document.getElementById('trade-depends');

  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) {
    showNotification('Please enter a trade/task name', 'error');
    if (nameEl) nameEl.focus();
    return;
  }

  var startDate = (startEl && startEl.value) ? startEl.value : null;
  var duration = (durEl && parseInt(durEl.value)) ? parseInt(durEl.value) : 1;
  var memberId = (workerEl && workerEl.value) ? workerEl.value : null;
  var dependsOn = (depEl && depEl.value) ? depEl.value : null;

  // Calculate sort_order
  var existing = (window.jobTasks || []).filter(function(t) { return t.job_id === jobId; });
  var maxSort = 0;
  for (var i = 0; i < existing.length; i++) {
    if ((existing[i].sort_order || 0) > maxSort) maxSort = existing[i].sort_order;
  }

  try {
    var ownerId = accountOwnerId || currentUser.id;
    var insertData = {
      job_id: jobId,
      user_id: ownerId,
      title: name,
      completed: false,
      sort_order: maxSort + 1,
      duration_days: duration
    };
    if (startDate) insertData.start_date = startDate;
    if (memberId) insertData.assigned_member_id = memberId;
    if (dependsOn) insertData.depends_on = dependsOn;

    var result = await supabaseClient
      .from('job_tasks')
      .insert([insertData])
      .select();

    if (result.error) throw result.error;

    if (result.data && result.data[0]) {
      window.jobTasks.push(result.data[0]);
    }

    closeAddTradeModal();
    showNotification(name + ' added to schedule', 'success');
    renderApp();

  } catch (error) {
    console.error('Error adding trade:', error);
    showNotification('Error: ' + error.message, 'error');
  }
};

// ============ MAIN ACTION (used by all buttons) ============
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
    // Job exists: open Add Trade modal
    openAddTradeModal(existingJob.id);
  } else {
    // No job yet: create one via existing modal
    if (typeof openJobFromQuote === 'function') {
      openJobFromQuote(q);
    } else {
      showNotification('Schedule function not available', 'error');
    }
  }
};

// ============ DROPDOWN MENUS (table 3-dot) ============
function enhanceQuoteDropdowns() {
  var menus = document.querySelectorAll('[id^="actions-"]');
  menus.forEach(function(menu) {
    if (menu.dataset.schedBtnAdded) return;

    var qId = menu.id.replace('actions-', '');
    if (!qId) return;

    var text = menu.textContent || '';
    if (text.indexOf('Email Quote') === -1) return;

    menu.dataset.schedBtnAdded = 'true';

    var q = findQuoteById(qId);
    if (!q) return;

    var container = menu.querySelector('.py-1');
    if (!container) return;

    var existingJob = findJobForQuote(q);
    var btnLabel = existingJob ? 'Add Trade' : 'Schedule Job';

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
  var actionsBar = document.querySelector('.flex.flex-wrap.gap-2.pt-4.border-t');
  if (!actionsBar || actionsBar.dataset.tradeBtnAdded) return;

  // Check if schedule/trade button already exists
  var hasBtn = false;
  var btns = actionsBar.querySelectorAll('button');
  for (var i = 0; i < btns.length; i++) {
    var txt = btns[i].textContent.trim();
    if (txt === 'Schedule Job' || txt === 'Add Trade') {
      hasBtn = true;
      break;
    }
  }
  if (hasBtn) return;

  // Find quote ID from edit button
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
  if (!existingJob) return;

  actionsBar.dataset.tradeBtnAdded = 'true';

  var tradeBtn = document.createElement('button');
  tradeBtn.className = 'inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 border border-teal-600 rounded-lg transition-colors';
  tradeBtn.innerHTML = '<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>' +
    '</svg>Add Trade';
  tradeBtn.setAttribute('onclick', 'scheduleTradeFromQuoteId(\'' + qId + '\')');

  if (actionsBar.firstChild) {
    actionsBar.insertBefore(tradeBtn, actionsBar.firstChild);
  } else {
    actionsBar.appendChild(tradeBtn);
  }
}

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

console.log('Quote schedule + Add Trade modal loaded');

} catch(e) {
  console.error('Quote schedule btn init error:', e);
}
})();
