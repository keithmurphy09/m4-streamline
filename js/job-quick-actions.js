// M4 Job Quick Actions - Popup modals for Daily Log and Add Photo
// Uses setAttribute to directly overwrite inline onclick handlers
// Additive only
(function(){
try {

function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function getJobId() {
  return (typeof selectedJobForDetail !== 'undefined' && selectedJobForDetail)
    ? selectedJobForDetail.id : null;
}

// ============ BUTTON REWRITING ============
function rewriteButtons() {
  var jobId = getJobId();
  if (!jobId) return;

  // DAILY LOG: button with onclick containing 'job-dailylog-section'
  var allBtns = document.querySelectorAll('button');
  for (var i = 0; i < allBtns.length; i++) {
    var btn = allBtns[i];
    var oc = btn.getAttribute('onclick') || '';
    if (oc.indexOf('job-dailylog-section') !== -1) {
      // Overwrite the onclick attribute entirely
      btn.setAttribute('onclick', "openDailyLogModal('" + jobId + "')");
    }
  }

  // ADD PHOTO: label containing input[onchange*="uploadJobPhoto"]
  var photoInputs = document.querySelectorAll('input[onchange*="uploadJobPhoto"]');
  for (var p = 0; p < photoInputs.length; p++) {
    var inp = photoInputs[p];
    var label = inp.closest('label');
    if (!label || label.dataset.qaSwapped) continue;
    label.dataset.qaSwapped = 'true';

    var newBtn = document.createElement('button');
    newBtn.className = label.className;
    newBtn.textContent = 'Add Photo';
    newBtn.setAttribute('onclick', "openPhotoModal('" + jobId + "')");
    label.parentNode.replaceChild(newBtn, label);
  }
}

// Run after every DOM change
var _qaTimer = null;
var _qaObs = new MutationObserver(function() {
  if (_qaTimer) clearTimeout(_qaTimer);
  _qaTimer = setTimeout(rewriteButtons, 80);
});
_qaObs.observe(document.body, { childList: true, subtree: true });

// ============ DAILY LOG MODAL ============
window.openDailyLogModal = function(jobId) {
  if (!jobId) return;
  // Prevent duplicates
  if (document.getElementById('dailylog-modal')) return;

  var job = null;
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id === jobId) { job = jobs[i]; break; }
  }
  if (!job) return;

  var cl = null;
  for (var c = 0; c < clients.length; c++) {
    if (clients[c].id === job.client_id) { cl = clients[c]; break; }
  }

  var recentLogs = (window.dailyLogs || [])
    .filter(function(l) { return l.job_id === jobId; })
    .sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); })
    .slice(0, 3);

  var recentHtml = '';
  if (recentLogs.length > 0) {
    recentHtml = '<div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">' +
      '<p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Recent Entries</p>' +
      '<div class="space-y-2">';
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (var r = 0; r < recentLogs.length; r++) {
      var log = recentLogs[r];
      var ld = new Date(log.created_at);
      var ds = months[ld.getMonth()] + ' ' + ld.getDate();
      var preview = (log.note_text || '').substring(0, 80);
      if ((log.note_text || '').length > 80) preview += '...';
      recentHtml += '<div class="text-sm"><span class="text-xs text-gray-400">' + ds + '</span>';
      if (log.author_name) recentHtml += ' <span class="text-xs text-teal-600 dark:text-teal-400">' + escH(log.author_name) + '</span>';
      recentHtml += '<div class="text-gray-600 dark:text-gray-300">' + escH(preview) + '</div>';
      if (log.photo_url) recentHtml += ' <span class="text-xs text-blue-500">+ photo</span>';
      recentHtml += '</div>';
    }
    recentHtml += '</div></div>';
  }

  var overlay = document.createElement('div');
  overlay.id = 'dailylog-modal';
  overlay.className = 'fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto';
  overlay.setAttribute('onclick', 'if(event.target===this)closeDailyLogModal()');

  overlay.innerHTML =
    '<div class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-lg w-full my-4" style="max-height:90vh;overflow-y:auto;">' +
      '<div class="flex justify-between mb-4">' +
        '<div>' +
          '<h3 class="text-lg sm:text-xl font-bold dark:text-white">Daily Log</h3>' +
          '<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">' + escH(job.title) + (cl ? ' - ' + escH(cl.name) : '') + '</p>' +
        '</div>' +
        '<button onclick="closeDailyLogModal()" class="text-2xl leading-none dark:text-gray-300 hover:text-gray-600">&times;</button>' +
      '</div>' +
      recentHtml +
      '<div class="space-y-3">' +
        '<div>' +
          '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">What happened on site today?</label>' +
          '<textarea id="modal-log-text" placeholder="e.g. Completed framing on north wall, waiting on inspection..." rows="4" class="w-full px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"></textarea>' +
        '</div>' +
        '<div>' +
          '<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attach Photo (optional)</label>' +
          '<div class="flex items-center gap-3">' +
            '<label class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">' +
              '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>' +
              'Choose Photo' +
              '<input type="file" accept="image/*" id="modal-log-photo" onchange="onModalLogPhotoSelected(this)" class="hidden" />' +
            '</label>' +
            '<span id="modal-log-photo-name" class="text-sm text-gray-400 dark:text-gray-500 truncate"></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="flex gap-3 mt-6">' +
        '<button onclick="saveDailyLogFromModal(\'' + jobId + '\')" class="flex-1 bg-teal-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors">Post Log</button>' +
        '<button onclick="closeDailyLogModal()" class="px-6 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
  setTimeout(function() {
    var ta = document.getElementById('modal-log-text');
    if (ta) ta.focus();
  }, 100);
};

window.closeDailyLogModal = function() {
  var m = document.getElementById('dailylog-modal');
  if (m) m.remove();
  window._modalLogPhoto = null;
  renderApp();
};

window.onModalLogPhotoSelected = function(input) {
  var file = input.files[0];
  if (!file) return;
  window._modalLogPhoto = file;
  var nameEl = document.getElementById('modal-log-photo-name');
  if (nameEl) nameEl.textContent = file.name;
};

window.saveDailyLogFromModal = async function(jobId) {
  var textarea = document.getElementById('modal-log-text');
  var noteText = textarea ? textarea.value.trim() : '';
  if (!noteText) {
    showNotification('Please write a note for the daily log', 'error');
    if (textarea) textarea.focus();
    return;
  }

  try {
    var ownerId = accountOwnerId || currentUser.id;
    var photoUrl = null;

    if (window._modalLogPhoto) {
      var file = window._modalLogPhoto;
      var fileExt = file.name.split('.').pop();
      var fileName = 'daily-log-' + jobId + '-' + Date.now() + '.' + fileExt;
      var filePath = 'daily-logs/' + fileName;
      var storageClient = typeof supabaseClient !== 'undefined' ? supabaseClient : supabase;
      var uploadResult = await storageClient.storage.from('job-photos').upload(filePath, file);
      if (!uploadResult.error) {
        var urlResult = storageClient.storage.from('job-photos').getPublicUrl(filePath);
        photoUrl = urlResult.data ? urlResult.data.publicUrl : null;
      }
      window._modalLogPhoto = null;
    }

    var authorName = (isTeamMember && teamMemberData)
      ? teamMemberData.name
      : (companySettings ? (companySettings.business_name || '') : (currentUser ? currentUser.email : ''));

    var result = await supabaseClient
      .from('daily_logs')
      .insert([{ job_id: jobId, user_id: ownerId, note_text: noteText, photo_url: photoUrl, author_name: authorName }])
      .select();

    if (result.error) throw result.error;
    if (result.data && result.data[0]) {
      if (!window.dailyLogs) window.dailyLogs = [];
      window.dailyLogs.unshift(result.data[0]);
    }

    closeDailyLogModal();
    showNotification('Daily log posted', 'success');
  } catch (error) {
    console.error('Error adding daily log:', error);
    showNotification('Error: ' + error.message, 'error');
  }
};

// ============ ADD PHOTO MODAL ============
window.openPhotoModal = function(jobId) {
  if (!jobId) return;
  if (document.getElementById('photo-modal')) return;

  var job = null;
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id === jobId) { job = jobs[i]; break; }
  }
  if (!job) return;

  var cl = null;
  for (var c = 0; c < clients.length; c++) {
    if (clients[c].id === job.client_id) { cl = clients[c]; break; }
  }

  var existingPhotos = job.photos || [];
  var photosHtml = '';
  if (existingPhotos.length > 0) {
    photosHtml = '<div class="mb-4">' +
      '<p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Existing Photos (' + existingPhotos.length + ')</p>' +
      '<div class="grid grid-cols-3 gap-2">';
    for (var p = 0; p < Math.min(existingPhotos.length, 6); p++) {
      photosHtml += '<img src="' + escH(existingPhotos[p]) + '" class="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />';
    }
    if (existingPhotos.length > 6) {
      photosHtml += '<div class="w-full h-20 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400">+' + (existingPhotos.length - 6) + ' more</div>';
    }
    photosHtml += '</div></div>';
  }

  var overlay = document.createElement('div');
  overlay.id = 'photo-modal';
  overlay.className = 'fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto';
  overlay.setAttribute('onclick', 'if(event.target===this)closePhotoModal()');

  overlay.innerHTML =
    '<div class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-lg w-full my-4" style="max-height:90vh;overflow-y:auto;">' +
      '<div class="flex justify-between mb-4">' +
        '<div>' +
          '<h3 class="text-lg sm:text-xl font-bold dark:text-white">Add Photo</h3>' +
          '<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">' + escH(job.title) + (cl ? ' - ' + escH(cl.name) : '') + '</p>' +
        '</div>' +
        '<button onclick="closePhotoModal()" class="text-2xl leading-none dark:text-gray-300 hover:text-gray-600">&times;</button>' +
      '</div>' +
      photosHtml +
      '<div class="space-y-3">' +
        '<div id="photo-preview-area" class="hidden mb-3">' +
          '<img id="photo-preview-img" class="w-full max-h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700" />' +
        '</div>' +
        '<label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors">' +
          '<div class="flex flex-col items-center justify-center pt-5 pb-6">' +
            '<svg class="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>' +
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>' +
            '</svg>' +
            '<p class="text-sm text-gray-500 dark:text-gray-400">Click to select a photo</p>' +
          '</div>' +
          '<input type="file" accept="image/*" id="modal-photo-file" onchange="onModalPhotoSelected(this)" class="hidden" />' +
        '</label>' +
        '<p id="modal-photo-name" class="text-sm text-gray-500 dark:text-gray-400 text-center"></p>' +
      '</div>' +
      '<div class="flex gap-3 mt-6">' +
        '<button id="upload-photo-btn" onclick="savePhotoFromModal(\'' + jobId + '\')" class="flex-1 bg-teal-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors opacity-50 cursor-not-allowed" disabled>Upload Photo</button>' +
        '<button onclick="closePhotoModal()" class="px-6 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Done</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
};

window.closePhotoModal = function() {
  var m = document.getElementById('photo-modal');
  if (m) m.remove();
  window._modalPhotoFile = null;
  renderApp();
};

window.onModalPhotoSelected = function(input) {
  var file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showNotification('Please select an image file', 'error');
    return;
  }
  window._modalPhotoFile = file;
  var nameEl = document.getElementById('modal-photo-name');
  if (nameEl) nameEl.textContent = file.name;
  var previewArea = document.getElementById('photo-preview-area');
  var previewImg = document.getElementById('photo-preview-img');
  if (previewArea && previewImg) {
    var reader = new FileReader();
    reader.onload = function(ev) {
      previewImg.src = ev.target.result;
      previewArea.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }
  var btn = document.getElementById('upload-photo-btn');
  if (btn) { btn.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed'); }
};

window.savePhotoFromModal = async function(jobId) {
  if (!window._modalPhotoFile) {
    showNotification('Please select a photo first', 'error');
    return;
  }
  var btn = document.getElementById('upload-photo-btn');
  if (btn) { btn.textContent = 'Uploading...'; btn.disabled = true; }

  try {
    var file = window._modalPhotoFile;
    var fileExt = file.name.split('.').pop();
    var fileName = jobId + '-' + Date.now() + '.' + fileExt;
    var filePath = 'job-photos/' + fileName;
    var storageClient = typeof supabaseClient !== 'undefined' ? supabaseClient : supabase;
    var uploadResult = await storageClient.storage.from('job-photos').upload(filePath, file);
    if (uploadResult.error) throw uploadResult.error;
    var urlResult = storageClient.storage.from('job-photos').getPublicUrl(filePath);
    var photoUrl = urlResult.data ? urlResult.data.publicUrl : null;
    if (!photoUrl) throw new Error('Could not get photo URL');

    var job = null;
    for (var i = 0; i < jobs.length; i++) {
      if (jobs[i].id === jobId) { job = jobs[i]; break; }
    }
    var updatedPhotos = ((job && job.photos) ? job.photos : []).concat([photoUrl]);
    var updateResult = await supabaseClient.from('jobs').update({ photos: updatedPhotos }).eq('id', jobId);
    if (updateResult.error) throw updateResult.error;
    if (job) job.photos = updatedPhotos;

    window._modalPhotoFile = null;

    // Stay open - refresh modal to show the new photo
    closePhotoModal();
    openPhotoModal(jobId);
    showNotification('Photo uploaded! Add another or click Done.', 'success');
  } catch (error) {
    console.error('Error uploading photo:', error);
    showNotification('Error: ' + error.message, 'error');
    if (btn) { btn.textContent = 'Upload Photo'; btn.disabled = false; }
  }
};

console.log('Job quick actions modals loaded');

} catch(e) {
  console.error('Job quick actions init error:', e);
}
})();
