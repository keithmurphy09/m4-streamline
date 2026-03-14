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
  overlay.setAttribute('onclick', 'if(event.target===this)donePhotoModal()');

  overlay.innerHTML =
    '<div class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-lg w-full my-4" style="max-height:90vh;overflow-y:auto;">' +
      '<div class="flex justify-between mb-4">' +
        '<div>' +
          '<h3 class="text-lg sm:text-xl font-bold dark:text-white">Add Photo</h3>' +
          '<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">' + escH(job.title) + (cl ? ' - ' + escH(cl.name) : '') + '</p>' +
        '</div>' +
        '<button onclick="donePhotoModal()" class="text-2xl leading-none dark:text-gray-300 hover:text-gray-600">&times;</button>' +
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
        '<button onclick="donePhotoModal()" class="px-6 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Done</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
};

window.closePhotoModal = function() {
  var m = document.getElementById('photo-modal');
  if (m) m.remove();
  window._modalPhotoFile = null;
};

// Called by the Done button - closes modal AND re-renders page
window.donePhotoModal = function() {
  closePhotoModal();
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
    _lastPhotoState = '';

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

// ============ PHOTO LIGHTBOX ============
var lbCss = document.createElement('style');
lbCss.textContent = [
'.photo-lb{position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:60;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s}',
'.photo-lb.active{opacity:1}',
'.photo-lb img{max-width:90vw;max-height:85vh;object-fit:contain;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5)}',
'.photo-lb-close{position:absolute;top:16px;right:20px;color:#fff;font-size:32px;cursor:pointer;background:rgba(255,255,255,0.15);border:none;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;transition:background 0.15s}',
'.photo-lb-close:hover{background:rgba(255,255,255,0.3)}',
'.photo-lb-nav{position:absolute;top:50%;transform:translateY(-50%);color:#fff;font-size:28px;cursor:pointer;background:rgba(255,255,255,0.15);border:none;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;transition:background 0.15s}',
'.photo-lb-nav:hover{background:rgba(255,255,255,0.3)}',
'.photo-lb-prev{left:16px}',
'.photo-lb-next{right:16px}',
'.photo-lb-count{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.7);font-size:14px}',
'.photo-lb-del{position:absolute;top:16px;left:20px;color:#fff;font-size:13px;cursor:pointer;background:rgba(220,38,38,0.7);border:none;border-radius:8px;padding:8px 16px;display:flex;align-items:center;gap:6px;transition:background 0.15s;font-weight:600}',
'.photo-lb-del:hover{background:rgba(220,38,38,1)}'
].join('\n');
document.head.appendChild(lbCss);

var _lbPhotos = [];
var _lbIdx = 0;
var _lbJobId = null;

window.openPhotoLightbox = function(photos, index, jobId) {
  _lbPhotos = photos || [];
  _lbIdx = index || 0;
  _lbJobId = jobId || null;

  // Auto-detect jobId from selectedJobForDetail
  if (!_lbJobId && typeof selectedJobForDetail !== 'undefined' && selectedJobForDetail) {
    _lbJobId = selectedJobForDetail.id;
  }
  if (_lbPhotos.length === 0) return;
  if (document.getElementById('photo-lightbox')) return;

  var lb = document.createElement('div');
  lb.id = 'photo-lightbox';
  lb.className = 'photo-lb';
  lb.setAttribute('onclick', 'if(event.target===this)closePhotoLightbox()');
  renderLbContent(lb);
  document.body.appendChild(lb);
  requestAnimationFrame(function() { lb.classList.add('active'); });

  window._lbKeyFn = function(e) {
    if (e.key === 'Escape') closePhotoLightbox();
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navLightbox(1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') navLightbox(-1);
  };
  document.addEventListener('keydown', window._lbKeyFn);
};

function renderLbContent(lb) {
  if (!lb) lb = document.getElementById('photo-lightbox');
  if (!lb) return;
  var photo = _lbPhotos[_lbIdx] || '';
  var multi = _lbPhotos.length > 1;
  lb.innerHTML =
    '<button class="photo-lb-close" onclick="closePhotoLightbox()">&times;</button>' +
    (_lbJobId ? '<button class="photo-lb-del" onclick="event.stopPropagation();deletePhotoFromLightbox()"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>Delete</button>' : '') +
    (multi ? '<button class="photo-lb-nav photo-lb-prev" onclick="event.stopPropagation();navLightbox(-1)">&#8249;</button>' : '') +
    '<img src="' + escH(photo) + '" onclick="event.stopPropagation()" />' +
    (multi ? '<button class="photo-lb-nav photo-lb-next" onclick="event.stopPropagation();navLightbox(1)">&#8250;</button>' : '') +
    (multi ? '<div class="photo-lb-count">' + (_lbIdx + 1) + ' / ' + _lbPhotos.length + '</div>' : '');
}

window.navLightbox = function(dir) {
  _lbIdx = (_lbIdx + dir + _lbPhotos.length) % _lbPhotos.length;
  renderLbContent();
};

window.closePhotoLightbox = function() {
  var lb = document.getElementById('photo-lightbox');
  if (lb) {
    lb.classList.remove('active');
    setTimeout(function() { lb.remove(); }, 200);
  }
  if (window._lbKeyFn) {
    document.removeEventListener('keydown', window._lbKeyFn);
    window._lbKeyFn = null;
  }
};

window.deletePhotoFromLightbox = async function() {
  if (!_lbJobId || _lbPhotos.length === 0) return;
  if (!confirm('Delete this photo?')) return;

  var photoToDelete = _lbPhotos[_lbIdx];

  try {
    // Find job and remove photo from array
    var job = null;
    for (var i = 0; i < jobs.length; i++) {
      if (jobs[i].id === _lbJobId) { job = jobs[i]; break; }
    }
    if (!job) throw new Error('Job not found');

    var updatedPhotos = (job.photos || []).filter(function(p) { return p !== photoToDelete; });

    var result = await supabaseClient
      .from('jobs')
      .update({ photos: updatedPhotos })
      .eq('id', _lbJobId);

    if (result.error) throw result.error;

    // Update local state
    job.photos = updatedPhotos;
    _lastPhotoState = '';

    // Update lightbox
    _lbPhotos = _lbPhotos.filter(function(p) { return p !== photoToDelete; });

    if (_lbPhotos.length === 0) {
      closePhotoLightbox();
      showNotification('Photo deleted', 'success');
      renderApp();
    } else {
      if (_lbIdx >= _lbPhotos.length) _lbIdx = _lbPhotos.length - 1;
      renderLbContent();
      showNotification('Photo deleted', 'success');
      // Update the grid behind the lightbox
      renderApp();
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    showNotification('Error: ' + error.message, 'error');
  }
};

// Click on any job photo to enlarge
document.addEventListener('click', function(e) {
  var img = e.target;
  if (img.tagName !== 'IMG') return;
  var src = img.getAttribute('src') || '';
  if (src.indexOf('job-photos') === -1 && src.indexOf('supabase') === -1) return;
  if (img.closest('#photo-lightbox')) return;
  if (img.id === 'photo-preview-img') return;

  e.preventDefault();
  e.stopPropagation();

  // Collect sibling photos in same grid
  var container = img.closest('.grid');
  var photos = [];
  var clickedIdx = 0;
  if (container) {
    var allImgs = container.querySelectorAll('img');
    for (var i = 0; i < allImgs.length; i++) {
      var s = allImgs[i].getAttribute('src') || '';
      if (s.indexOf('job-photos') !== -1 || s.indexOf('supabase') !== -1) {
        if (allImgs[i] === img) clickedIdx = photos.length;
        photos.push(s);
      }
    }
  }
  if (photos.length === 0) { photos = [src]; clickedIdx = 0; }
  openPhotoLightbox(photos, clickedIdx);
}, true);

// Make job photos look clickable + add delete X overlay
var lbCss2 = document.createElement('style');
lbCss2.textContent = [
'img[src*="job-photos"]{cursor:pointer;transition:transform 0.15s,box-shadow 0.15s}',
'img[src*="job-photos"]:hover{transform:scale(1.03);box-shadow:0 4px 12px rgba(0,0,0,0.15)}',
'.photo-thumb-wrap{position:relative;display:inline-block}',
'.photo-thumb-del{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,0.6);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;opacity:0;transition:opacity 0.15s,background 0.15s;z-index:2}',
'.photo-thumb-wrap:hover .photo-thumb-del{opacity:1}',
'.photo-thumb-del:hover{background:rgba(220,38,38,0.9)}'
].join('\n');
document.head.appendChild(lbCss2);

// Manage photos section + wrap thumbnails with delete X
var _lastPhotoState = '';

function wrapPhotoThumbs() {
  var jobId = getJobId();
  if (!jobId) return;

  var taskSection = document.getElementById('job-tasks-section');
  var dailyLogSection = document.getElementById('job-dailylog-section');
  var leftCol = taskSection ? taskSection.parentElement : (dailyLogSection ? dailyLogSection.parentElement : null);
  if (!leftCol) return;

  // Get current photo data
  var job = null;
  for (var j = 0; j < jobs.length; j++) {
    if (jobs[j].id === jobId) { job = jobs[j]; break; }
  }
  var photos = (job && job.photos) ? job.photos : [];
  var stateKey = jobId + ':' + photos.length + ':' + photos.join(',');

  // Only rebuild section if state changed
  if (stateKey !== _lastPhotoState) {
    _lastPhotoState = stateKey;

    // Remove original photo sections from schedule.js (no ID)
    var allDivs = leftCol.children;
    for (var di = allDivs.length - 1; di >= 0; di--) {
      var div = allDivs[di];
      if (div.id) continue;
      var h3 = div.querySelector('h3');
      if (h3 && h3.textContent.indexOf('Job Photos') !== -1) {
        div.remove();
      }
    }

    // Remove our existing section
    var existing = document.getElementById('job-photos-section');
    if (existing) existing.remove();

    // Build fresh
    var section = document.createElement('div');
    section.id = 'job-photos-section';
    section.className = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6';

    if (photos.length > 0) {
      var gridHtml = '<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">';
      for (var p = 0; p < photos.length; p++) {
        gridHtml += '<img src="' + escH(photos[p]) + '" class="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />';
      }
      gridHtml += '</div>';
      section.innerHTML =
        '<div class="flex justify-between items-center mb-4">' +
          '<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Job Photos (' + photos.length + ')</h3>' +
          '<button onclick="openPhotoModal(\'' + jobId + '\')" class="text-sm text-teal-600 dark:text-teal-400 hover:underline">+ Add Photo</button>' +
        '</div>' + gridHtml;
    } else {
      section.innerHTML =
        '<div class="flex justify-between items-center mb-4">' +
          '<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Job Photos</h3>' +
        '</div>' +
        '<div class="text-center py-6">' +
          '<svg class="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>' +
          '<p class="text-sm text-gray-400 dark:text-gray-500 mb-3">No photos yet</p>' +
          '<button onclick="openPhotoModal(\'' + jobId + '\')" class="px-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-lg transition-colors">Add Photo</button>' +
        '</div>';
    }
    leftCol.appendChild(section);
  }

  // Add delete X to any unwrapped photos (runs every time, cheap check)
  var section2 = document.getElementById('job-photos-section');
  if (!section2) return;
  var imgs = section2.querySelectorAll('img[src*="job-photos"]');
  for (var i = 0; i < imgs.length; i++) {
    var img = imgs[i];
    if (img.closest('.photo-thumb-wrap')) continue;

    var src = img.getAttribute('src') || '';
    var wrap = document.createElement('div');
    wrap.className = 'photo-thumb-wrap';

    var delBtn = document.createElement('button');
    delBtn.className = 'photo-thumb-del';
    delBtn.innerHTML = '&times;';
    delBtn.title = 'Delete photo';
    delBtn.setAttribute('data-photo-src', src);
    delBtn.setAttribute('onclick', "event.stopPropagation();deletePhotoThumb(this.getAttribute('data-photo-src'))");

    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);
    wrap.appendChild(delBtn);
  }
}

window.deletePhotoThumb = async function(photoSrc) {
  if (!confirm('Delete this photo?')) return;
  var jobId = getJobId();
  if (!jobId) return;

  try {
    var job = null;
    for (var i = 0; i < jobs.length; i++) {
      if (jobs[i].id === jobId) { job = jobs[i]; break; }
    }
    if (!job) throw new Error('Job not found');

    var updatedPhotos = (job.photos || []).filter(function(p) { return p !== photoSrc; });
    var result = await supabaseClient.from('jobs').update({ photos: updatedPhotos }).eq('id', jobId);
    if (result.error) throw result.error;
    job.photos = updatedPhotos;
    _lastPhotoState = '';
    showNotification('Photo deleted', 'success');
    renderApp();
  } catch (error) {
    console.error('Error deleting photo:', error);
    showNotification('Error: ' + error.message, 'error');
  }
};

// Hook into observer to wrap photos after render
var _thumbTimer = null;
var _thumbRunning = false;
var _thumbObs = new MutationObserver(function() {
  if (_thumbRunning) return;
  if (_thumbTimer) clearTimeout(_thumbTimer);
  _thumbTimer = setTimeout(function() {
    _thumbRunning = true;
    wrapPhotoThumbs();
    _thumbRunning = false;
  }, 150);
});
_thumbObs.observe(document.body, { childList: true, subtree: true });

console.log('Job quick actions modals loaded');

} catch(e) {
  console.error('Job quick actions init error:', e);
}
})();
