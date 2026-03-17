// M4 Schedule Maps - Live Map & Job Map views
// Live Map: shows active clock-in locations on Google Map
// Job Map: all jobs listed left, map right with pins
// Additive only
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'.smap-container{display:flex;gap:0;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;height:600px}',
'.dark .smap-container{border-color:#374151}',
'.smap-sidebar{width:320px;flex-shrink:0;overflow-y:auto;background:#fff;border-right:1px solid #e2e8f0}',
'.dark .smap-sidebar{background:#1f2937;border-right-color:#374151}',
'.smap-map{flex:1;min-height:400px}',
'.smap-job-item{padding:12px 16px;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:background 0.15s;display:flex;align-items:center;gap:10px}',
'.smap-job-item:hover{background:#f0fdfa}',
'.dark .smap-job-item{border-bottom-color:#374151}',
'.dark .smap-job-item:hover{background:rgba(13,148,136,0.1)}',
'.smap-job-item.active{background:#f0fdfa;border-left:3px solid #0d9488}',
'.dark .smap-job-item.active{background:rgba(13,148,136,0.15)}',
'.smap-job-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}',
'.smap-job-info{flex:1;min-width:0}',
'.smap-job-title{font-size:13px;font-weight:600;color:#0f172a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'.dark .smap-job-title{color:#e2e8f0}',
'.smap-job-addr{font-size:11px;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'.dark .smap-job-addr{color:#9ca3af}',
'.smap-job-date{font-size:10px;color:#94a3b8}',
'',
'.smap-live-card{padding:14px 16px;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:background 0.15s}',
'.smap-live-card:hover{background:#f0fdfa}',
'.dark .smap-live-card{border-bottom-color:#374151}',
'.dark .smap-live-card:hover{background:rgba(13,148,136,0.1)}',
'.smap-live-name{font-size:14px;font-weight:700;color:#0f172a;display:flex;align-items:center;gap:8px}',
'.dark .smap-live-name{color:#e2e8f0}',
'.smap-live-pulse{width:10px;height:10px;border-radius:50%;background:#10b981;animation:tc-pulse 2s infinite}',
'.smap-live-detail{font-size:11px;color:#64748b;margin-top:2px}',
'.dark .smap-live-detail{color:#9ca3af}',
'',
'.smap-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:40px;color:#94a3b8}',
'.smap-empty-icon{font-size:40px;margin-bottom:12px}',
'.smap-empty-text{font-size:14px;line-height:1.5}',
'.smap-sidebar-hd{padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:700;color:#0f172a;display:flex;justify-content:space-between;align-items:center}',
'.dark .smap-sidebar-hd{border-bottom-color:#374151;color:#e2e8f0}',
'.smap-count{font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600}',
'@media(max-width:768px){.smap-container{flex-direction:column;height:auto}.smap-sidebar{width:100%;max-height:250px;border-right:none;border-bottom:1px solid #e2e8f0}.smap-map{min-height:350px}}'
].join('\n');
document.head.appendChild(css);

function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function fmtTime(d) {
  if (!d) return '';
  var dt = new Date(d);
  var h = dt.getHours(); var m = dt.getMinutes();
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
}


// ============ RENDER SCHEDULE OVERRIDE ============
var _origRS2 = window.renderSchedule;
window.renderSchedule = function() {
  if (scheduleView === 'jobmap') {
    return renderJobMapView();
  }
  if (scheduleView === 'livemap') {
    return renderLiveMapView();
  }
  // For list/calendar/gantt, render original then inject our buttons via string replacement
  var html = _origRS2();
  return injectMapBtns(html);
};

function injectMapBtns(html) {
  // Find the List button and insert Job Map before it
  var listMarker = 'border">List</button>';
  var jobMapCls = 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600';
  var jobMapBtn = '<button onclick="scheduleView=\'jobmap\';renderApp();" class="px-3 py-2 rounded text-sm ' + jobMapCls + ' border">Job Map</button>';

  var pos = 0;
  while (true) {
    var idx = html.indexOf(listMarker, pos);
    if (idx === -1) break;
    html = html.substring(0, idx) + jobMapBtn + html.substring(idx);
    pos = idx + jobMapBtn.length + listMarker.length;
  }

  // Find the Gantt button and insert Live Map after it
  var ganttMarker = 'border">Gantt</button>';
  var liveCls = 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600';
  var liveBtn = '<button onclick="scheduleView=\'livemap\';renderApp();" class="px-3 py-2 rounded text-sm ' + liveCls + ' border">Live Map</button>';

  pos = 0;
  while (true) {
    var idx2 = html.indexOf(ganttMarker, pos);
    if (idx2 === -1) break;
    var after = idx2 + ganttMarker.length;
    html = html.substring(0, after) + liveBtn + html.substring(after);
    pos = after + liveBtn.length;
  }

  return html;
}

// ============ JOB MAP VIEW ============
function renderJobMapView() {
  setTimeout(function() { initJobMap(); }, 200);

  var viewToggle = buildViewToggle('jobmap');
  var workerFilter = buildWorkerFilter();

  return '<div>' +
    '<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">' +
      '<h2 class="text-2xl font-bold dark:text-teal-400">Schedule</h2>' +
      '<div class="flex flex-wrap gap-2 sm:gap-4">' + workerFilter + viewToggle +
        '<button onclick="openModal(\'job\')" class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded-lg transition-colors shadow-sm whitespace-nowrap">Schedule Job</button>' +
      '</div>' +
    '</div>' +
    '<div class="smap-container">' +
      '<div class="smap-sidebar" id="smap-job-sidebar">' +
        '<div class="smap-sidebar-hd">Jobs<span class="smap-count" style="background:#f0fdfa;color:#0d9488;">' + jobs.length + '</span></div>' +
        '<div id="smap-job-list"></div>' +
      '</div>' +
      '<div class="smap-map" id="smap-job-map"></div>' +
    '</div>' +
  '</div>';
}

function initJobMap() {
  var mapEl = document.getElementById('smap-job-map');
  var listEl = document.getElementById('smap-job-list');
  if (!mapEl || !listEl) return;
  if (typeof google === 'undefined' || !google.maps) {
    mapEl.innerHTML = '<div class="smap-empty"><div class="smap-empty-text">Google Maps not loaded</div></div>';
    return;
  }

  var map = new google.maps.Map(mapEl, {
    zoom: 10,
    center: { lat: -27.47, lng: 153.03 },
    mapTypeControl: false,
    streetViewControl: false,
    styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }]
  });

  var geocoder = new google.maps.Geocoder();
  var bounds = new google.maps.LatLngBounds();
  var markers = [];
  var infoWindow = new google.maps.InfoWindow();

  // Build job list
  var h = '';
  var jobsWithAddr = jobs.filter(function(j) {
    return j.job_address || '';
  }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

  if (jobsWithAddr.length === 0) {
    listEl.innerHTML = '<div class="smap-empty"><div class="smap-empty-text">No jobs with addresses</div></div>';
    return;
  }

  var COLORS = ['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#14b8a6'];

  jobsWithAddr.forEach(function(job, idx) {
    var cl = clients.find(function(c) { return c.id === job.client_id; });
    var color = COLORS[idx % COLORS.length];
    var isMQ = job.title && job.title.indexOf('M&Q') === 0;
    if (isMQ) color = '#f59e0b';

    h += '<div class="smap-job-item" id="smap-job-' + job.id + '" onclick="smapFocusJob(\'' + job.id + '\')">';
    h += '<div class="smap-job-dot" style="background:' + color + ';"></div>';
    h += '<div class="smap-job-info">';
    h += '<div class="smap-job-title">' + escH(job.title) + '</div>';
    h += '<div class="smap-job-addr">' + escH(job.job_address || 'No address') + '</div>';
    h += '<div class="smap-job-date">' + escH(job.date) + (cl ? ' - ' + escH(cl.name) : '') + '</div>';
    h += '</div></div>';

    // Geocode address
    if (job.job_address) {
      geocodeAndPin(geocoder, map, bounds, markers, infoWindow, job, cl, color, idx);
    }
  });

  listEl.innerHTML = h;

  // Store references for focus
  window._smapJobMarkers = {};
  window._smapJobMap = map;
}

function geocodeAndPin(geocoder, map, bounds, markers, infoWindow, job, client, color, idx) {
  geocoder.geocode({ address: job.job_address }, function(results, status) {
    if (status === 'OK' && results[0]) {
      var pos = results[0].geometry.location;
      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: job.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      });

      var content = '<div style="font-family:sans-serif;max-width:220px;">' +
        '<div style="font-weight:700;font-size:14px;margin-bottom:4px;">' + escH(job.title) + '</div>' +
        '<div style="font-size:12px;color:#64748b;">' + escH(job.job_address) + '</div>' +
        (client ? '<div style="font-size:12px;color:#64748b;margin-top:2px;">' + escH(client.name) + '</div>' : '') +
        '<div style="font-size:11px;color:#94a3b8;margin-top:4px;">' + escH(job.date) + ' at ' + escH(job.time || '9:00') + '</div>' +
        '</div>';

      marker.addListener('click', function() {
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });

      bounds.extend(pos);
      markers.push(marker);
      if (!window._smapJobMarkers) window._smapJobMarkers = {};
      window._smapJobMarkers[job.id] = { marker: marker, pos: pos };

      if (markers.length > 1) {
        map.fitBounds(bounds, 60);
      } else {
        map.setCenter(pos);
        map.setZoom(14);
      }
    }
  });
}

window.smapFocusJob = function(jobId) {
  // Highlight sidebar item
  var items = document.querySelectorAll('.smap-job-item');
  items.forEach(function(el) { el.classList.remove('active'); });
  var item = document.getElementById('smap-job-' + jobId);
  if (item) item.classList.add('active');

  // Pan to marker
  if (window._smapJobMarkers && window._smapJobMarkers[jobId] && window._smapJobMap) {
    var m = window._smapJobMarkers[jobId];
    window._smapJobMap.panTo(m.pos);
    window._smapJobMap.setZoom(15);
    google.maps.event.trigger(m.marker, 'click');
  }
};

// ============ LIVE MAP VIEW ============
function renderLiveMapView() {
  setTimeout(function() { initLiveMap(); }, 200);

  var viewToggle = buildViewToggle('livemap');
  var workerFilter = buildWorkerFilter();

  return '<div>' +
    '<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">' +
      '<h2 class="text-2xl font-bold dark:text-teal-400">Schedule</h2>' +
      '<div class="flex flex-wrap gap-2 sm:gap-4">' + workerFilter + viewToggle +
        '<button onclick="openModal(\'job\')" class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded-lg transition-colors shadow-sm whitespace-nowrap">Schedule Job</button>' +
      '</div>' +
    '</div>' +
    '<div class="smap-container">' +
      '<div class="smap-sidebar" id="smap-live-sidebar">' +
        '<div class="smap-sidebar-hd">Active Team<span class="smap-count" id="smap-live-count" style="background:#d1fae5;color:#065f46;">0</span></div>' +
        '<div id="smap-live-list"></div>' +
      '</div>' +
      '<div class="smap-map" id="smap-live-map"></div>' +
    '</div>' +
  '</div>';
}

async function initLiveMap() {
  var mapEl = document.getElementById('smap-live-map');
  var listEl = document.getElementById('smap-live-list');
  var countEl = document.getElementById('smap-live-count');
  if (!mapEl || !listEl) return;

  if (typeof google === 'undefined' || !google.maps) {
    mapEl.innerHTML = '<div class="smap-empty"><div class="smap-empty-text">Google Maps not loaded</div></div>';
    return;
  }

  // Load today's active clock-ins
  var ownerId = (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : (currentUser ? currentUser.id : null);
  var today = new Date(); today.setHours(0,0,0,0);

  var activeEntries = [];
  try {
    var r = await supabaseClient
      .from('time_entries')
      .select('*')
      .eq('user_id', ownerId)
      .is('clock_out', null)
      .order('clock_in', { ascending: false });
    if (r.data) activeEntries = r.data;
  } catch(e) { console.error('Error loading active entries:', e); }

  if (countEl) countEl.textContent = activeEntries.length;

  if (activeEntries.length === 0) {
    listEl.innerHTML = '<div class="smap-empty"><div style="font-size:32px;margin-bottom:12px;">&#128205;</div><div class="smap-empty-text">No team members currently clocked in.<br>Active clock-ins will appear here with their GPS locations.</div></div>';
    // Still show map centered on default location
    new google.maps.Map(mapEl, { zoom: 10, center: { lat: -27.47, lng: 153.03 }, mapTypeControl: false, streetViewControl: false });
    return;
  }

  var map = new google.maps.Map(mapEl, {
    zoom: 10,
    center: { lat: -27.47, lng: 153.03 },
    mapTypeControl: false,
    streetViewControl: false
  });

  var bounds = new google.maps.LatLngBounds();
  var infoWindow = new google.maps.InfoWindow();
  var h = '';

  activeEntries.forEach(function(entry) {
    var mem = null;
    for (var m = 0; m < teamMembers.length; m++) {
      if (teamMembers[m].id === entry.team_member_id) { mem = teamMembers[m]; break; }
    }
    var color = mem && mem.color ? mem.color : '#10b981';
    var name = entry.team_member_name || 'Unknown';

    h += '<div class="smap-live-card" onclick="smapFocusLive(\'' + entry.id + '\')">';
    h += '<div class="smap-live-name"><span class="smap-live-pulse" style="background:' + color + ';"></span>' + escH(name) + '</div>';
    h += '<div class="smap-live-detail">';
    if (entry.job_title) h += escH(entry.job_title) + ' &middot; ';
    h += 'Since ' + fmtTime(entry.clock_in);
    h += '</div>';
    h += '</div>';

    // Add marker if GPS available
    if (entry.clock_in_lat && entry.clock_in_lng) {
      var pos = { lat: entry.clock_in_lat, lng: entry.clock_in_lng };
      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#fff',
          strokeWeight: 3
        },
        animation: google.maps.Animation.DROP
      });

      // Add pulsing effect label
      var labelContent = '<div style="font-family:sans-serif;max-width:220px;">' +
        '<div style="font-weight:700;font-size:14px;color:' + color + ';">' + escH(name) + '</div>' +
        (entry.job_title ? '<div style="font-size:12px;color:#374151;margin-top:2px;">' + escH(entry.job_title) + '</div>' : '') +
        '<div style="font-size:11px;color:#64748b;margin-top:4px;">Clocked in at ' + fmtTime(entry.clock_in) + '</div>' +
        (entry.clock_in_lat ? '<div style="font-size:10px;color:#94a3b8;margin-top:2px;">' + entry.clock_in_lat.toFixed(4) + ', ' + entry.clock_in_lng.toFixed(4) + '</div>' : '') +
        '</div>';

      marker.addListener('click', function() {
        infoWindow.setContent(labelContent);
        infoWindow.open(map, marker);
      });

      bounds.extend(pos);

      if (!window._smapLiveMarkers) window._smapLiveMarkers = {};
      window._smapLiveMarkers[entry.id] = { marker: marker, pos: pos };
    }
  });

  listEl.innerHTML = h;
  window._smapLiveMap = map;

  if (activeEntries.filter(function(e) { return e.clock_in_lat; }).length > 1) {
    map.fitBounds(bounds, 60);
  } else if (activeEntries.length > 0 && activeEntries[0].clock_in_lat) {
    map.setCenter({ lat: activeEntries[0].clock_in_lat, lng: activeEntries[0].clock_in_lng });
    map.setZoom(14);
  }
}

window.smapFocusLive = function(entryId) {
  if (window._smapLiveMarkers && window._smapLiveMarkers[entryId] && window._smapLiveMap) {
    var m = window._smapLiveMarkers[entryId];
    window._smapLiveMap.panTo(m.pos);
    window._smapLiveMap.setZoom(16);
    google.maps.event.trigger(m.marker, 'click');
  }
};

// ============ VIEW TOGGLE BUILDER ============
function buildViewToggle(active) {
  var views = [
    { id: 'jobmap', label: 'Job Map' },
    { id: 'list', label: 'List', mode: 'table' },
    { id: 'calendar', label: 'Calendar', mode: 'calendar' },
    { id: 'gantt', label: 'Gantt' },
    { id: 'livemap', label: 'Live Map' }
  ];

  var h = '<div class="flex gap-2">';
  views.forEach(function(v) {
    var isActive = (active === v.id) || (typeof scheduleView !== 'undefined' && scheduleView === v.id);
    var cls = isActive
      ? 'bg-white text-gray-900 border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]'
      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600';

    var onclick = '';
    if (v.id === 'list') onclick = "scheduleView='list';jobViewMode='table';renderApp();";
    else if (v.id === 'calendar') onclick = "scheduleView='calendar';jobViewMode='calendar';renderApp();";
    else if (v.id === 'gantt') onclick = "scheduleView='gantt';jobViewMode='gantt';renderApp();";
    else onclick = "scheduleView='" + v.id + "';renderApp();";

    h += '<button onclick="' + onclick + '" class="px-3 py-2 rounded text-sm ' + cls + ' border">' + v.label + '</button>';
  });
  h += '</div>';
  return h;
}

function buildWorkerFilter() {
  if (!(typeof getAccountType === 'function' && getAccountType() === 'business' && teamMembers.length > 0)) return '';
  var h = '<select onchange="calendarFilter=this.value;renderApp();" class="px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white text-sm">';
  h += '<option value="all"' + (calendarFilter==='all'?' selected':'') + '>All Workers</option>';
  h += '<option value="unassigned"' + (calendarFilter==='unassigned'?' selected':'') + '>Unassigned</option>';
  for (var i = 0; i < teamMembers.length; i++) {
    var m = teamMembers[i];
    h += '<option value="' + m.id + '"' + (calendarFilter===m.id?' selected':'') + '>' + escH(m.name) + '</option>';
  }
  h += '</select>';
  return h;
}

// ============ OBSERVER ============
var _smapTimer = null;
var _smapObs = new MutationObserver(function() {
  if (_smapTimer) clearTimeout(_smapTimer);
  _smapTimer = setTimeout(function() {
    // Color M&Q jobs if on schedule
    if (typeof activeTab !== 'undefined' && activeTab === 'schedule') {
      // placeholder for future enhancements
    }
  }, 200);
});
_smapObs.observe(document.body, { childList: true, subtree: true });

console.log('Schedule maps loaded');

} catch(e) {
  console.error('Schedule maps init error:', e);
}
})();
