// M4 Dashboard Enhancements
// 1. Personalized welcome with name popup
// 2. 5-day weather widget (Open-Meteo, no API key)
// 3. Today's scheduled events box
// Additive only
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'.dash-weather{display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
'.dash-weather-day{text-align:center;padding:6px 8px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;min-width:56px}',
'.dark .dash-weather-day{background:#1f2937;border-color:#374151}',
'.dash-weather-day .day{font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase}',
'.dark .dash-weather-day .day{color:#9ca3af}',
'.dash-weather-day .temp{font-size:14px;font-weight:700;color:#0f172a}',
'.dark .dash-weather-day .temp{color:#e2e8f0}',
'.dash-weather-day .icon{font-size:18px;line-height:1;margin:2px 0}',
'.dash-weather-day.today{background:#f0fdfa;border-color:#99f6e4}',
'.dark .dash-weather-day.today{background:rgba(13,148,136,0.15);border-color:rgba(45,212,191,0.3)}',
'',
'.dash-today-event{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;border-left:3px solid #14b8a6;background:#f8fafc;transition:background 0.15s;cursor:pointer}',
'.dash-today-event:hover{background:#f0fdfa}',
'.dark .dash-today-event{background:#1f2937;border-left-color:#2dd4bf}',
'.dark .dash-today-event:hover{background:rgba(13,148,136,0.1)}',
'.dash-today-time{font-size:12px;font-weight:600;color:#0d9488;min-width:50px}',
'.dash-today-title{font-size:13px;font-weight:600;color:#0f172a}',
'.dark .dash-today-title{color:#e2e8f0}',
'.dash-today-sub{font-size:11px;color:#64748b}',
'.dark .dash-today-sub{color:#9ca3af}',
'',
'.dash-welcome-edit{cursor:pointer;color:#94a3b8;transition:color 0.15s;vertical-align:middle;margin-left:4px}',
'.dash-welcome-edit:hover{color:#0d9488}'
].join('\n');
document.head.appendChild(css);

// ============ HELPERS ============
function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getGreeting() {
  var h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getUserName() {
  return localStorage.getItem('m4_user_display_name') || '';
}

function setUserName(name) {
  localStorage.setItem('m4_user_display_name', name);
}

// Weather code to emoji
function weatherEmoji(code) {
  if (code === 0) return '&#9728;&#65039;';
  if (code <= 3) return '&#9925;';
  if (code <= 48) return '&#127787;&#65039;';
  if (code <= 57) return '&#127782;&#65039;';
  if (code <= 67) return '&#127783;&#65039;';
  if (code <= 77) return '&#10052;&#65039;';
  if (code <= 82) return '&#127783;&#65039;';
  if (code <= 86) return '&#127784;&#65039;';
  if (code <= 99) return '&#9928;&#65039;';
  return '&#9729;&#65039;';
}

var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ============ PERSONALIZED WELCOME ============
window.promptUserName = function() {
  var current = getUserName();
  var name = prompt('What should we call you?', current || '');
  if (name !== null) {
    setUserName(name.trim());
    renderApp();
  }
};

function injectWelcome() {
  // Find the dashboard header h1
  var h1 = document.querySelector('h1.text-3xl');
  if (!h1 || h1.textContent.trim() !== 'Dashboard') return;
  if (h1.dataset.welcomeAdded) return;
  h1.dataset.welcomeAdded = 'true';

  var name = getUserName();
  var greeting = getGreeting();

  if (name) {
    h1.innerHTML = greeting + ', <span style="color:#0d9488;">' + escH(name) + '</span>';
  } else {
    h1.textContent = greeting + '!';
  }

  // Add edit icon
  var editBtn = document.createElement('span');
  editBtn.className = 'dash-welcome-edit';
  editBtn.title = name ? 'Change name' : 'Set your name';
  editBtn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display:inline;vertical-align:middle;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>';
  editBtn.setAttribute('onclick', 'promptUserName()');
  h1.appendChild(editBtn);

  // Update subtitle
  var subtitle = h1.parentElement.querySelector('p');
  if (subtitle) subtitle.textContent = 'Your business at a glance';

  // Prompt on first visit if no name set
  if (!name && !localStorage.getItem('m4_name_prompted')) {
    localStorage.setItem('m4_name_prompted', 'true');
    setTimeout(function() {
      promptUserName();
    }, 1500);
  }
}

// ============ WEATHER WIDGET ============
var _weatherData = null;
var _weatherLoading = false;
var _weatherError = false;

function fetchWeather() {
  if (_weatherData || _weatherLoading) return;
  _weatherLoading = true;

  // Try to get location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        loadWeatherData(pos.coords.latitude, pos.coords.longitude);
      },
      function() {
        // Default: Brisbane, Australia
        loadWeatherData(-27.47, 153.03);
      },
      { timeout: 5000 }
    );
  } else {
    loadWeatherData(-27.47, 153.03);
  }
}

function loadWeatherData(lat, lon) {
  var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5';

  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.daily) {
        _weatherData = data.daily;
        _weatherLoading = false;
        injectWeather();
      }
    })
    .catch(function() {
      _weatherLoading = false;
      _weatherError = true;
    });
}

function injectWeather() {
  if (!_weatherData) return;

  // Find the date display (top right of dashboard header)
  var dateDiv = document.querySelector('.flex.justify-between.items-start .text-right');
  if (!dateDiv) return;
  if (dateDiv.dataset.weatherAdded) return;
  dateDiv.dataset.weatherAdded = 'true';

  var html = '<div class="dash-weather" style="margin-top:8px;">';
  var todayStr = new Date().toISOString().split('T')[0];

  for (var i = 0; i < Math.min(_weatherData.time.length, 5); i++) {
    var date = new Date(_weatherData.time[i] + 'T00:00:00');
    var dayName = (i === 0) ? 'Today' : DAYS[date.getDay()];
    var maxTemp = Math.round(_weatherData.temperature_2m_max[i]);
    var minTemp = Math.round(_weatherData.temperature_2m_min[i]);
    var emoji = weatherEmoji(_weatherData.weather_code[i]);
    var isToday = (_weatherData.time[i] === todayStr);

    html += '<div class="dash-weather-day' + (isToday ? ' today' : '') + '">';
    html += '<div class="day">' + dayName + '</div>';
    html += '<div class="icon">' + emoji + '</div>';
    html += '<div class="temp">' + maxTemp + '&deg;</div>';
    html += '<div style="font-size:10px;color:#94a3b8;">' + minTemp + '&deg;</div>';
    html += '</div>';
  }
  html += '</div>';

  dateDiv.insertAdjacentHTML('beforeend', html);
}

// ============ TODAY'S EVENTS ============
function injectTodaysEvents() {
  // Find the key metrics grid
  var metricsGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
  if (!metricsGrid) return;
  if (metricsGrid.dataset.eventsAdded) return;
  metricsGrid.dataset.eventsAdded = 'true';

  var today = new Date().toISOString().split('T')[0];

  // Get today's jobs
  var todayJobs = jobs.filter(function(j) { return j.date === today; });

  // Get today's tasks from all jobs
  var todayTasks = (window.jobTasks || []).filter(function(t) {
    return t.start_date === today;
  });

  // Get overdue invoices
  var todayDate = new Date(); todayDate.setHours(0,0,0,0);
  var overdueInvs = invoices.filter(function(inv) {
    if (inv.status !== 'unpaid' || !inv.due_date) return false;
    var d = new Date(inv.due_date); d.setHours(0,0,0,0);
    return d <= todayDate;
  });

  var events = [];

  // Add jobs
  for (var ji = 0; ji < todayJobs.length; ji++) {
    var j = todayJobs[ji];
    var cl = null;
    for (var ci = 0; ci < clients.length; ci++) {
      if (clients[ci].id === j.client_id) { cl = clients[ci]; break; }
    }
    events.push({
      time: j.time || '09:00',
      title: j.title,
      sub: cl ? cl.name : '',
      color: '#14b8a6',
      icon: '&#128296;',
      onclick: "scheduleView='list';openJobDetail(jobs.find(function(x){return x.id==='" + j.id + "'}))"
    });
  }

  // Add tasks starting today
  for (var ti = 0; ti < todayTasks.length; ti++) {
    var t = todayTasks[ti];
    var mem = null;
    for (var mi = 0; mi < teamMembers.length; mi++) {
      if (teamMembers[mi].id === t.assigned_member_id) { mem = teamMembers[mi]; break; }
    }
    // Find parent job
    var parentJob = null;
    for (var pj = 0; pj < jobs.length; pj++) {
      if (jobs[pj].id === t.job_id) { parentJob = jobs[pj]; break; }
    }
    events.push({
      time: '&mdash;',
      title: t.title,
      sub: (mem ? mem.name : '') + (parentJob ? (mem ? ' &middot; ' : '') + parentJob.title : ''),
      color: mem && mem.color ? mem.color : '#3b82f6',
      icon: '&#128203;',
      onclick: parentJob ? "scheduleView='list';openJobDetail(jobs.find(function(x){return x.id==='" + parentJob.id + "'}))" : ''
    });
  }

  // Sort by time
  events.sort(function(a, b) { return a.time.localeCompare(b.time); });

  // Build HTML
  var section = document.createElement('div');
  section.className = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6';
  section.style.marginTop = '24px';

  var h = '<div class="flex justify-between items-center mb-4">';
  h += '<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Today\'s Schedule</h3>';
  h += '<span class="text-xs font-medium px-2 py-1 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">' + events.length + ' event' + (events.length !== 1 ? 's' : '') + '</span>';
  h += '</div>';

  if (events.length === 0) {
    h += '<div class="text-center py-6">';
    h += '<div style="font-size:28px;margin-bottom:8px;">&#128197;</div>';
    h += '<p class="text-sm text-gray-400 dark:text-gray-500">No events scheduled for today</p>';
    h += '<button onclick="openModal(\'job\')" class="mt-3 text-sm text-teal-600 dark:text-teal-400 hover:underline">+ Schedule a job</button>';
    h += '</div>';
  } else {
    h += '<div class="space-y-2">';
    for (var ei = 0; ei < events.length; ei++) {
      var ev = events[ei];
      h += '<div class="dash-today-event" style="border-left-color:' + ev.color + ';" onclick="' + escH(ev.onclick) + '">';
      h += '<div class="dash-today-time">' + ev.icon + ' ' + escH(ev.time) + '</div>';
      h += '<div>';
      h += '<div class="dash-today-title">' + escH(ev.title) + '</div>';
      if (ev.sub) h += '<div class="dash-today-sub">' + escH(ev.sub) + '</div>';
      h += '</div>';
      h += '</div>';
    }
    h += '</div>';
  }

  // Add overdue invoices reminder if any
  if (overdueInvs.length > 0) {
    var totalOverdue = 0;
    for (var oi = 0; oi < overdueInvs.length; oi++) totalOverdue += parseFloat(overdueInvs[oi].total || 0);
    h += '<div style="margin-top:12px;padding:10px 12px;border-radius:8px;background:#fef2f2;border:1px solid #fecaca;" class="dark:bg-red-900/10 dark:border-red-900/30">';
    h += '<div style="font-size:12px;font-weight:600;color:#dc2626;" class="dark:text-red-400">&#9888;&#65039; ' + overdueInvs.length + ' overdue invoice' + (overdueInvs.length > 1 ? 's' : '') + ' &mdash; $' + totalOverdue.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0}) + ' outstanding</div>';
    h += '</div>';
  }

  section.innerHTML = h;

  // Insert after the metrics grid
  metricsGrid.parentNode.insertBefore(section, metricsGrid.nextSibling);
}

// ============ OBSERVER ============
var _dashTimer = null;
var _dashObs = new MutationObserver(function() {
  if (_dashTimer) clearTimeout(_dashTimer);
  _dashTimer = setTimeout(function() {
    // Only run on dashboard tab
    if (typeof activeTab !== 'undefined' && activeTab !== 'dashboard') return;

    injectWelcome();
    fetchWeather();
    if (_weatherData) injectWeather();
    injectTodaysEvents();
  }, 200);
});
_dashObs.observe(document.body, { childList: true, subtree: true });

console.log('Dashboard enhancements loaded');

} catch(e) {
  console.error('Dashboard enhance error:', e);
}
})();
