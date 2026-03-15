// M4 Time Clock - Clock In/Out with GPS
// Team members clock in/out on jobs with geolocation
// Boss sees who's on site and where
// Additive only
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'.tc-bar{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:16px;flex-wrap:wrap}',
'.dark .tc-bar{background:#1f2937;border-color:#374151}',
'.tc-btn-in{padding:8px 20px;font-size:13px;font-weight:700;color:#fff;background:#10b981;border:none;border-radius:8px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:6px}',
'.tc-btn-in:hover{background:#059669;transform:translateY(-1px)}',
'.tc-btn-out{padding:8px 20px;font-size:13px;font-weight:700;color:#fff;background:#ef4444;border:none;border-radius:8px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:6px}',
'.tc-btn-out:hover{background:#dc2626;transform:translateY(-1px)}',
'.tc-status{display:flex;align-items:center;gap:8px;font-size:13px}',
'.tc-status-dot{width:10px;height:10px;border-radius:50%;animation:tc-pulse 2s infinite}',
'@keyframes tc-pulse{0%,100%{opacity:1}50%{opacity:0.4}}',
'.tc-timer{font-family:monospace;font-size:16px;font-weight:700;color:#0f172a;letter-spacing:0.5px}',
'.dark .tc-timer{color:#e2e8f0}',
'',
'.tc-team-panel{margin-top:8px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px}',
'.dark .tc-team-panel{background:#111827;border-color:#374151}',
'.tc-team-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9}',
'.dark .tc-team-row{border-bottom-color:#1f2937}',
'.tc-team-row:last-child{border-bottom:none}',
'.tc-team-name{font-size:13px;font-weight:600;color:#0f172a;flex:1}',
'.dark .tc-team-name{color:#e2e8f0}',
'.tc-team-job{font-size:11px;color:#64748b;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'.tc-team-time{font-size:12px;font-weight:600;color:#0d9488;min-width:60px;text-align:right}',
'.tc-team-loc{font-size:10px;color:#94a3b8;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}',
'.tc-team-loc:hover{color:#0d9488;text-decoration:underline}',
'',
'.tc-history-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px}',
'.dark .tc-history-row{border-bottom-color:#374151}'
].join('\n');
document.head.appendChild(css);

// ============ STATE ============
var _timeEntries = [];
var _currentEntry = null;
var _timerInterval = null;
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

function fmtDuration(start, end) {
  if (!start) return '-';
  var s = new Date(start);
  var e = end ? new Date(end) : new Date();
  var diff = Math.floor((e - s) / 1000);
  var hrs = Math.floor(diff / 3600);
  var mins = Math.floor((diff % 3600) / 60);
  var secs = diff % 60;
  return (hrs < 10 ? '0' : '') + hrs + ':' + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function fmtDurationShort(start, end) {
  if (!start) return '-';
  var s = new Date(start);
  var e = end ? new Date(end) : new Date();
  var diff = Math.floor((e - s) / 1000);
  var hrs = Math.floor(diff / 3600);
  var mins = Math.floor((diff % 3600) / 60);
  return hrs + 'h ' + mins + 'm';
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
  var name = localStorage.getItem('m4_user_display_name');
  return name || 'Owner';
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
    var today = new Date();
    today.setHours(0,0,0,0);
    var result = await supabaseClient
      .from('time_entries')
      .select('*')
      .eq('user_id', ownerId)
      .gte('clock_in', today.toISOString())
      .order('clock_in', { ascending: false });
    if (result.error) throw result.error;
    _timeEntries = result.data || [];
    _entriesLoaded = true;

    // Find current active entry for this team member
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
window.clockIn = async function() {
  var myId = getTeamMemberId();
  var myName = getTeamMemberName();
  var ownerId = getOwnerId();

  // Pick a job (optional)
  var jobOpts = [];
  for (var i = 0; i < jobs.length; i++) {
    jobOpts.push(jobs[i].title);
  }

  var jobTitle = null;
  var jobId = null;
  if (jobs.length > 0) {
    var pick = prompt('Which job are you clocking in for?\\n\\n' + jobs.map(function(j, idx) { return (idx+1) + '. ' + j.title; }).join('\\n') + '\\n\\nEnter number (or leave blank for general)');
    if (pick && parseInt(pick) > 0 && parseInt(pick) <= jobs.length) {
      var pickedJob = jobs[parseInt(pick) - 1];
      jobTitle = pickedJob.title;
      jobId = pickedJob.id;
    }
  }

  var btn = document.getElementById('tc-clock-btn');
  if (btn) { btn.textContent = 'Getting location...'; btn.disabled = true; }

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
    showNotification('Clocked in' + (jobTitle ? ' for ' + jobTitle : '') + (loc ? ' (location recorded)' : ''), 'success');
    renderApp();
  } catch (err) {
    console.error('Clock in error:', err);
    showNotification('Error clocking in: ' + err.message, 'error');
    if (btn) { btn.disabled = false; }
  }
};

// ============ CLOCK OUT ============
window.clockOut = async function() {
  if (!_currentEntry) return;

  var btn = document.getElementById('tc-clock-btn');
  if (btn) { btn.textContent = 'Getting location...'; btn.disabled = true; }

  var loc = await getLocation();

  try {
    var update = {
      clock_out: new Date().toISOString(),
      clock_out_lat: loc ? loc.lat : null,
      clock_out_lng: loc ? loc.lng : null
    };

    var result = await supabaseClient.from('time_entries').update(update).eq('id', _currentEntry.id);
    if (result.error) throw result.error;

    var dur = fmtDurationShort(_currentEntry.clock_in, update.clock_out);
    _currentEntry.clock_out = update.clock_out;
    _currentEntry.clock_out_lat = update.clock_out_lat;
    _currentEntry.clock_out_lng = update.clock_out_lng;
    _currentEntry = null;

    showNotification('Clocked out. Duration: ' + dur, 'success');
    renderApp();
  } catch (err) {
    console.error('Clock out error:', err);
    showNotification('Error clocking out: ' + err.message, 'error');
    if (btn) { btn.disabled = false; }
  }
};

// ============ OPEN MAP LINK ============
window.openTcMap = function(lat, lng) {
  if (!lat || !lng) return;
  window.open('https://www.google.com/maps?q=' + lat + ',' + lng, '_blank');
};

// ============ INJECT TIME CLOCK BAR ============
function injectTimeClockBar() {
  // Only show on schedule tab
  if (typeof activeTab !== 'undefined' && activeTab !== 'schedule') return;

  var scheduleH2 = document.querySelector('h2.text-2xl.font-bold');
  if (!scheduleH2 || scheduleH2.textContent.trim() !== 'Schedule') return;

  var container = scheduleH2.closest('.flex') || scheduleH2.parentElement;
  if (!container) return;
  if (container.parentElement.dataset.tcAdded) return;
  container.parentElement.dataset.tcAdded = 'true';

  var bar = document.createElement('div');
  bar.className = 'tc-bar';
  bar.id = 'tc-bar';

  var isOwner = !(typeof isTeamMember !== 'undefined' && isTeamMember);
  var myName = getTeamMemberName();

  if (_currentEntry) {
    // Clocked in state
    bar.innerHTML =
      '<div class="tc-status">' +
        '<span class="tc-status-dot" style="background:#10b981;"></span>' +
        '<span style="font-size:13px;font-weight:600;color:#10b981;">Clocked In</span>' +
      '</div>' +
      '<span class="tc-timer" id="tc-timer">' + fmtDuration(_currentEntry.clock_in, null) + '</span>' +
      (_currentEntry.job_title ? '<span style="font-size:12px;color:#64748b;padding:4px 10px;background:#f1f5f9;border-radius:6px;" class="dark:bg-gray-700 dark:text-gray-300">' + escH(_currentEntry.job_title) + '</span>' : '') +
      '<div style="flex:1;"></div>' +
      '<button class="tc-btn-out" id="tc-clock-btn" onclick="clockOut()">' +
        '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" stroke-width="2"/></svg>' +
        'Clock Out' +
      '</button>';

    // Start timer
    if (_timerInterval) clearInterval(_timerInterval);
    _timerInterval = setInterval(function() {
      var el = document.getElementById('tc-timer');
      if (el && _currentEntry) el.textContent = fmtDuration(_currentEntry.clock_in, null);
    }, 1000);
  } else {
    // Not clocked in
    bar.innerHTML =
      '<div class="tc-status">' +
        '<span class="tc-status-dot" style="background:#94a3b8;animation:none;"></span>' +
        '<span style="font-size:13px;color:#64748b;">Not clocked in</span>' +
      '</div>' +
      '<div style="flex:1;"></div>' +
      '<button class="tc-btn-in" id="tc-clock-btn" onclick="clockIn()">' +
        '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21" stroke-width="2" stroke-linejoin="round"/></svg>' +
        'Clock In' +
      '</button>';

    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
  }

  container.parentElement.insertBefore(bar, container.nextSibling);

  // Boss view: show all active team members
  if (isOwner) {
    injectTeamPanel(bar);
  }
}

function injectTeamPanel(afterEl) {
  var activeEntries = _timeEntries.filter(function(e) { return !e.clock_out; });
  var todayDone = _timeEntries.filter(function(e) { return !!e.clock_out; });

  if (activeEntries.length === 0 && todayDone.length === 0) return;

  var panel = document.createElement('div');
  panel.className = 'tc-team-panel';

  var h = '';

  if (activeEntries.length > 0) {
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
    h += '<span style="font-size:13px;font-weight:700;color:#0f172a;" class="dark:text-white">On the Clock</span>';
    h += '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:#d1fae5;color:#065f46;font-weight:600;" class="dark:bg-teal-900/30 dark:text-teal-400">' + activeEntries.length + ' active</span>';
    h += '</div>';

    for (var i = 0; i < activeEntries.length; i++) {
      var e = activeEntries[i];
      var mem = null;
      for (var m = 0; m < teamMembers.length; m++) {
        if (teamMembers[m].id === e.team_member_id) { mem = teamMembers[m]; break; }
      }
      var color = mem && mem.color ? mem.color : '#14b8a6';
      h += '<div class="tc-team-row">';
      h += '<span style="width:8px;height:8px;border-radius:50%;background:' + color + ';flex-shrink:0;"></span>';
      h += '<span class="tc-team-name">' + escH(e.team_member_name || 'Unknown') + '</span>';
      if (e.job_title) h += '<span class="tc-team-job">' + escH(e.job_title) + '</span>';
      h += '<span class="tc-team-time">' + fmtTime(e.clock_in) + '</span>';
      h += '<span class="tc-team-time" style="color:#0f172a;font-weight:700;" class="dark:text-white">' + fmtDurationShort(e.clock_in, null) + '</span>';
      if (e.clock_in_lat && e.clock_in_lng) {
        h += '<span class="tc-team-loc" onclick="openTcMap(' + e.clock_in_lat + ',' + e.clock_in_lng + ')" title="View on map">&#128205; Map</span>';
      }
      h += '</div>';
    }
  }

  if (todayDone.length > 0) {
    h += '<div style="margin-top:' + (activeEntries.length > 0 ? '16' : '0') + 'px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
    h += '<span style="font-size:13px;font-weight:700;color:#0f172a;" class="dark:text-white">Completed Today</span>';
    h += '<span style="font-size:11px;color:#94a3b8;">' + todayDone.length + ' entries</span>';
    h += '</div>';

    for (var j = 0; j < Math.min(todayDone.length, 10); j++) {
      var d = todayDone[j];
      h += '<div class="tc-history-row">';
      h += '<span style="font-weight:600;color:#0f172a;min-width:80px;" class="dark:text-gray-200">' + escH(d.team_member_name || 'Unknown') + '</span>';
      if (d.job_title) h += '<span style="color:#64748b;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" class="dark:text-gray-400">' + escH(d.job_title) + '</span>';
      h += '<span style="color:#64748b;min-width:100px;text-align:right;" class="dark:text-gray-400">' + fmtTime(d.clock_in) + ' - ' + fmtTime(d.clock_out) + '</span>';
      h += '<span style="font-weight:700;color:#0d9488;min-width:50px;text-align:right;">' + fmtDurationShort(d.clock_in, d.clock_out) + '</span>';
      if (d.clock_in_lat) {
        h += '<span class="tc-team-loc" onclick="openTcMap(' + d.clock_in_lat + ',' + d.clock_in_lng + ')">&#128205;</span>';
      }
      h += '</div>';
    }
  }

  panel.innerHTML = h;
  afterEl.parentElement.insertBefore(panel, afterEl.nextSibling);
}

// ============ OBSERVER ============
var _tcTimer = null;
var _tcObs = new MutationObserver(function() {
  if (_tcTimer) clearTimeout(_tcTimer);
  _tcTimer = setTimeout(async function() {
    if (typeof activeTab !== 'undefined' && activeTab !== 'schedule') return;
    if (!_entriesLoaded) await loadTimeEntries();
    injectTimeClockBar();
  }, 200);
});
_tcObs.observe(document.body, { childList: true, subtree: true });

console.log('Time clock loaded');

} catch(e) {
  console.error('Time clock init error:', e);
}
})();
