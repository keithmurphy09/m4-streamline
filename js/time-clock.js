// M4 Time Clock v2 - Clock In/Out with GPS
// Dropdown job picker, location on each event, clock button on job detail
// Additive only
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'.tc-bar{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:16px;flex-wrap:wrap}',
'.dark .tc-bar{background:#1f2937;border-color:#374151}',
'.tc-btn-in{padding:8px 20px;font-size:13px;font-weight:700;color:#fff;background:#10b981;border:none;border-radius:8px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:6px;font-family:inherit}',
'.tc-btn-in:hover{background:#059669;transform:translateY(-1px)}',
'.tc-btn-out{padding:8px 20px;font-size:13px;font-weight:700;color:#fff;background:#ef4444;border:none;border-radius:8px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:6px;font-family:inherit}',
'.tc-btn-out:hover{background:#dc2626;transform:translateY(-1px)}',
'.tc-btn-sm{padding:6px 14px;font-size:12px;font-weight:600;border:none;border-radius:6px;cursor:pointer;transition:all 0.15s;display:inline-flex;align-items:center;gap:4px;font-family:inherit}',
'.tc-status-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}',
'.tc-pulse{animation:tc-pulse 2s infinite}',
'@keyframes tc-pulse{0%,100%{opacity:1}50%{opacity:0.4}}',
'.tc-job-select{padding:6px 10px;font-size:13px;border:1px solid #d1d5db;border-radius:8px;background:#fff;color:#374151;outline:none;min-width:160px;font-family:inherit}',
'.dark .tc-job-select{background:#374151;color:#e5e7eb;border-color:#4b5563}',
'.tc-job-select:focus{border-color:#14b8a6;box-shadow:0 0 0 2px rgba(20,184,166,0.15)}',
'',
'.tc-panel{margin-top:8px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px}',
'.dark .tc-panel{background:#111827;border-color:#374151}',
'.tc-entry{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:12px;flex-wrap:wrap}',
'.dark .tc-entry{border-bottom-color:#1f2937}',
'.tc-entry:last-child{border-bottom:none}',
'.tc-entry-name{font-weight:600;color:#0f172a;min-width:80px}',
'.dark .tc-entry-name{color:#e2e8f0}',
'.tc-entry-job{color:#64748b;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'.dark .tc-entry-job{color:#9ca3af}',
'.tc-entry-time{font-size:11px;color:#374151;font-weight:500}',
'.dark .tc-entry-time{color:#d1d5db}',
'.tc-entry-loc{font-size:10px;color:#0d9488;cursor:pointer;text-decoration:underline}',
'.tc-entry-loc:hover{color:#0f766e}',
'.tc-entry-dur{font-weight:700;color:#0d9488;min-width:50px;text-align:right;font-size:12px}'
].join('\n');
document.head.appendChild(css);

// ============ STATE ============
var _timeEntries = [];
var _currentEntry = null;
var _entriesLoaded = false;

// ============ HELPERS ============
function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function fmtTime(dateStr) {
  if (!dateStr) return '-';
  var d = new Date(dateStr);
  var h = d.getHours(); var m = d.getMinutes();
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
}

function fmtDurShort(start, end) {
  if (!start || !end) return '-';
  var diff = Math.floor((new Date(end) - new Date(start)) / 1000);
  var hrs = Math.floor(diff / 3600);
  var mins = Math.floor((diff % 3600) / 60);
  return hrs + 'h ' + mins + 'm';
}

function fmtCoords(lat, lng) {
  if (!lat || !lng) return '';
  return lat.toFixed(4) + ', ' + lng.toFixed(4);
}

function getLocation() {
  return new Promise(function(resolve) {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      function(pos) { resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
      function() { resolve(null); },
      { timeout: 10000, maximumAge: 60000 }
    );
  });
}

function getTeamMemberId() {
  if (typeof isTeamMember !== 'undefined' && isTeamMember && typeof teamMemberData !== 'undefined' && teamMemberData) {
    return teamMemberData.id;
  }
  return currentUser ? currentUser.id : null;
}

function getTeamMemberName() {
  if (typeof isTeamMember !== 'undefined' && isTeamMember && typeof teamMemberData !== 'undefined' && teamMemberData) {
    return teamMemberData.name;
  }
  return localStorage.getItem('m4_user_display_name') || 'Owner';
}

function getOwnerId() {
  return (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : (currentUser ? currentUser.id : null);
}

// ============ LOAD ENTRIES ============
async function loadTimeEntries() {
  if (_entriesLoaded) return;
  try {
    var ownerId = getOwnerId();
    if (!ownerId) return;
    var today = new Date(); today.setHours(0,0,0,0);
    var result = await supabaseClient
      .from('time_entries')
      .select('*')
      .eq('user_id', ownerId)
      .gte('clock_in', today.toISOString())
      .order('clock_in', { ascending: false });
    if (result.error) throw result.error;
    _timeEntries = result.data || [];
    _entriesLoaded = true;

    var myId = getTeamMemberId();
    _currentEntry = null;
    for (var i = 0; i < _timeEntries.length; i++) {
      if (_timeEntries[i].team_member_id === myId && !_timeEntries[i].clock_out) {
        _currentEntry = _timeEntries[i];
        break;
      }
    }
  } catch (err) {
    console.error('Error loading time entries:', err);
  }
}

// ============ CLOCK IN ============
window.tcClockIn = async function(preselectedJobId) {
  var myId = getTeamMemberId();
  var myName = getTeamMemberName();
  var ownerId = getOwnerId();

  // Get selected job
  var jobId = preselectedJobId || null;
  var jobTitle = null;
  if (!jobId) {
    var sel = document.getElementById('tc-job-select');
    if (sel && sel.value) {
      jobId = sel.value;
    }
  }
  if (jobId) {
    for (var i = 0; i < jobs.length; i++) {
      if (jobs[i].id === jobId) { jobTitle = jobs[i].title; break; }
    }
  }

  // Disable button
  var btns = document.querySelectorAll('.tc-btn-in');
  for (var b = 0; b < btns.length; b++) { btns[b].disabled = true; btns[b].textContent = 'Locating...'; }

  var loc = await getLocation();

  try {
    var entry = {
      user_id: ownerId,
      team_member_id: myId,
      team_member_name: myName,
      job_id: jobId,
      job_title: jobTitle,
      clock_in: new Date().toISOString(),
      clock_in_lat: loc ? loc.lat : null,
      clock_in_lng: loc ? loc.lng : null
    };

    var result = await supabaseClient.from('time_entries').insert([entry]).select();
    if (result.error) throw result.error;

    _currentEntry = result.data[0];
    _timeEntries.unshift(_currentEntry);
    showNotification('Clocked in at ' + fmtTime(_currentEntry.clock_in) + (jobTitle ? ' for ' + jobTitle : '') + (loc ? ' - location recorded' : ''), 'success');
    renderApp();
  } catch (err) {
    console.error('Clock in error:', err);
    showNotification('Error clocking in: ' + err.message, 'error');
  }
};

// ============ CLOCK OUT ============
window.tcClockOut = async function() {
  if (!_currentEntry) return;

  var btns = document.querySelectorAll('.tc-btn-out');
  for (var b = 0; b < btns.length; b++) { btns[b].disabled = true; btns[b].textContent = 'Locating...'; }

  var loc = await getLocation();

  try {
    var clockOut = new Date().toISOString();
    var update = {
      clock_out: clockOut,
      clock_out_lat: loc ? loc.lat : null,
      clock_out_lng: loc ? loc.lng : null
    };

    var result = await supabaseClient.from('time_entries').update(update).eq('id', _currentEntry.id);
    if (result.error) throw result.error;

    var dur = fmtDurShort(_currentEntry.clock_in, clockOut);
    _currentEntry.clock_out = clockOut;
    _currentEntry.clock_out_lat = loc ? loc.lat : null;
    _currentEntry.clock_out_lng = loc ? loc.lng : null;
    _currentEntry = null;

    showNotification('Clocked out. Duration: ' + dur, 'success');
    renderApp();
  } catch (err) {
    console.error('Clock out error:', err);
    showNotification('Error clocking out: ' + err.message, 'error');
  }
};

window.openTcMap = function(lat, lng) {
  if (!lat || !lng) return;
  window.open('https://www.google.com/maps?q=' + lat + ',' + lng, '_blank');
};

// ============ BUILD JOB DROPDOWN ============
function buildJobSelect() {
  var h = '<select class="tc-job-select" id="tc-job-select">';
  h += '<option value="">General (no job)</option>';
  for (var i = 0; i < jobs.length; i++) {
    var j = jobs[i];
    var cl = null;
    for (var c = 0; c < clients.length; c++) {
      if (clients[c].id === j.client_id) { cl = clients[c]; break; }
    }
    h += '<option value="' + j.id + '">' + escH(j.title) + (cl ? ' - ' + escH(cl.name) : '') + '</option>';
  }
  h += '</select>';
  return h;
}

// ============ BUILD ENTRY ROW ============
function buildEntryRow(e) {
  var h = '<div class="tc-entry">';
  // Name
  var mem = null;
  for (var m = 0; m < teamMembers.length; m++) {
    if (teamMembers[m].id === e.team_member_id) { mem = teamMembers[m]; break; }
  }
  var color = mem && mem.color ? mem.color : '#14b8a6';
  h += '<span class="tc-status-dot" style="background:' + color + ';' + (!e.clock_out ? 'animation:tc-pulse 2s infinite;' : '') + '"></span>';
  h += '<span class="tc-entry-name">' + escH(e.team_member_name || 'Unknown') + '</span>';

  // Job
  if (e.job_title) h += '<span class="tc-entry-job">' + escH(e.job_title) + '</span>';

  // Clock in
  h += '<span class="tc-entry-time">&#128994; In: ' + fmtTime(e.clock_in);
  if (e.clock_in_lat) {
    h += ' <span class="tc-entry-loc" onclick="openTcMap(' + e.clock_in_lat + ',' + e.clock_in_lng + ')" title="' + fmtCoords(e.clock_in_lat, e.clock_in_lng) + '">&#128205; map</span>';
  }
  h += '</span>';

  // Clock out
  if (e.clock_out) {
    h += '<span class="tc-entry-time">&#128308; Out: ' + fmtTime(e.clock_out);
    if (e.clock_out_lat) {
      h += ' <span class="tc-entry-loc" onclick="openTcMap(' + e.clock_out_lat + ',' + e.clock_out_lng + ')" title="' + fmtCoords(e.clock_out_lat, e.clock_out_lng) + '">&#128205; map</span>';
    }
    h += '</span>';
    h += '<span class="tc-entry-dur">' + fmtDurShort(e.clock_in, e.clock_out) + '</span>';
  } else {
    h += '<span class="tc-entry-time" style="color:#10b981;font-weight:600;">Active</span>';
  }

  h += '</div>';
  return h;
}

// ============ INJECT TIME CLOCK BAR ON SCHEDULE VIEW ============
function injectScheduleBar() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'schedule') return;

  var scheduleH2 = document.querySelector('h2.text-2xl.font-bold');
  if (!scheduleH2 || scheduleH2.textContent.trim() !== 'Schedule') return;

  var container = scheduleH2.closest('.flex') || scheduleH2.parentElement;
  if (!container || !container.parentElement) return;
  if (container.parentElement.dataset.tcAdded) return;
  container.parentElement.dataset.tcAdded = 'true';

  var bar = document.createElement('div');
  bar.className = 'tc-bar';

  var h = '';
  if (_currentEntry) {
    h += '<span class="tc-status-dot tc-pulse" style="background:#10b981;"></span>';
    h += '<span style="font-size:13px;font-weight:600;color:#10b981;">Clocked In at ' + fmtTime(_currentEntry.clock_in) + '</span>';
    if (_currentEntry.job_title) h += '<span style="font-size:12px;color:#64748b;padding:4px 10px;background:#f1f5f9;border-radius:6px;" class="dark:bg-gray-700 dark:text-gray-300">' + escH(_currentEntry.job_title) + '</span>';
    h += '<div style="flex:1;"></div>';
    h += '<button class="tc-btn-out" onclick="tcClockOut()"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" stroke-width="2"/></svg>Clock Out</button>';
  } else {
    h += '<span class="tc-status-dot" style="background:#94a3b8;"></span>';
    h += '<span style="font-size:13px;color:#64748b;">Not clocked in</span>';
    h += '<div style="flex:1;"></div>';
    h += buildJobSelect();
    h += '<button class="tc-btn-in" onclick="tcClockIn()"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21" stroke-width="2" stroke-linejoin="round"/></svg>Clock In</button>';
  }
  bar.innerHTML = h;
  container.parentElement.insertBefore(bar, container.nextSibling);
}

// ============ INJECT CLOCK BUTTON ON JOB DETAIL ============
function injectJobDetailClock() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'schedule') return;
  if (typeof selectedJobForDetail === 'undefined' || !selectedJobForDetail) return;

  // Find the actions bar in job detail
  var actionBars = document.querySelectorAll('.flex.flex-wrap.gap-2.pt-4.border-t');
  if (actionBars.length === 0) return;
  var actionBar = actionBars[actionBars.length - 1];
  if (actionBar.dataset.tcAdded) return;
  actionBar.dataset.tcAdded = 'true';

  var jobId = selectedJobForDetail.id;
  var isClockedInHere = _currentEntry && _currentEntry.job_id === jobId;
  var isClockedInElsewhere = _currentEntry && _currentEntry.job_id !== jobId;

  var btn = document.createElement('button');

  if (isClockedInHere) {
    btn.className = 'tc-btn-sm';
    btn.style.cssText = 'background:#ef4444;color:#fff;';
    btn.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" stroke-width="2"/></svg> Clock Out';
    btn.setAttribute('onclick', 'tcClockOut()');
  } else if (isClockedInElsewhere) {
    btn.className = 'tc-btn-sm';
    btn.style.cssText = 'background:#f59e0b;color:#fff;cursor:default;';
    btn.innerHTML = 'Clocked in on ' + escH(_currentEntry.job_title || 'another job');
    btn.disabled = true;
  } else {
    btn.className = 'tc-btn-sm';
    btn.style.cssText = 'background:#10b981;color:#fff;';
    btn.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21" stroke-width="2" stroke-linejoin="round"/></svg> Clock In';
    btn.setAttribute('onclick', "tcClockIn('" + jobId + "')");
  }

  // Insert before the Delete button
  var deleteBtn = actionBar.querySelector('button[onclick*="deleteJob"]');
  if (deleteBtn) {
    actionBar.insertBefore(btn, deleteBtn);
  } else {
    actionBar.appendChild(btn);
  }

  // Show time entries for this job - load ALL entries, not just today
  var parentSection = actionBar.closest('.bg-white, .dark\\:bg-gray-800');
  if (parentSection && !parentSection.dataset.tcLog) {
    parentSection.dataset.tcLog = 'true';
    loadJobTimeEntries(jobId, parentSection);
  }
}

async function loadJobTimeEntries(jobId, parentSection) {
  try {
    var ownerId = getOwnerId();
    var result = await supabaseClient
      .from('time_entries')
      .select('*')
      .eq('user_id', ownerId)
      .eq('job_id', jobId)
      .order('clock_in', { ascending: false });
    if (result.error) throw result.error;
    var entries = result.data || [];
    if (entries.length === 0) return;

    // Calculate total hours
    var totalSecs = 0;
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].clock_in && entries[i].clock_out) {
        totalSecs += Math.floor((new Date(entries[i].clock_out) - new Date(entries[i].clock_in)) / 1000);
      }
    }
    var totalHrs = Math.floor(totalSecs / 3600);
    var totalMins = Math.floor((totalSecs % 3600) / 60);

    var logDiv = document.createElement('div');
    logDiv.style.cssText = 'margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0;';
    logDiv.className = 'dark:border-gray-700';
    var lh = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
    lh += '<span style="font-size:13px;font-weight:700;color:#0f172a;" class="dark:text-white">Time Log</span>';
    lh += '<span style="font-size:12px;font-weight:600;color:#0d9488;">' + entries.length + ' entries &middot; ' + totalHrs + 'h ' + totalMins + 'm total</span>';
    lh += '</div>';
    for (var e = 0; e < entries.length; e++) lh += buildEntryRow(entries[e]);
    logDiv.innerHTML = lh;
    parentSection.appendChild(logDiv);
  } catch (err) {
    console.error('Error loading job time entries:', err);
  }
}

// ============ OBSERVER ============
var _tcTimer = null;
var _tcObs = new MutationObserver(function() {
  if (_tcTimer) clearTimeout(_tcTimer);
  _tcTimer = setTimeout(async function() {
    if (typeof activeTab !== 'undefined' && activeTab !== 'schedule') return;
    if (!_entriesLoaded) await loadTimeEntries();
    injectScheduleBar();
    injectJobDetailClock();
  }, 200);
});
_tcObs.observe(document.body, { childList: true, subtree: true });

console.log('Time clock v2 loaded');

} catch(e) {
  console.error('Time clock init error:', e);
}
})();
