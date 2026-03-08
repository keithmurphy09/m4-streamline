// M4 Gantt Chart - Schedule Gantt View
// Additive only - wraps existing renderSchedule, touches nothing else
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'.gantt-wrap{display:flex;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden}',
'.gantt-sb{flex-shrink:0;border-right:2px solid #e5e7eb;display:flex;flex-direction:column;background:#fff}',
'.gantt-sb-hd{display:flex;align-items:center;border-bottom:1px solid #e5e7eb;background:#f9fafb;padding:0 12px;font-weight:600;font-size:13px;color:#374151;flex-shrink:0}',
'.gantt-sb-row{display:flex;align-items:center;padding:0 12px;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:background 0.15s}',
'.gantt-sb-row:hover{background:#f0fdfa!important}',
'.gantt-tl{flex:1;display:flex;flex-direction:column;overflow:hidden}',
'.gantt-tl-hd{overflow:hidden;flex-shrink:0;border-bottom:1px solid #e5e7eb}',
'.gantt-tl-body{overflow:auto;flex:1}',
'.gantt-bar{position:absolute;border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:filter 0.15s;box-shadow:0 1px 2px rgba(0,0,0,0.06)}',
'.gantt-bar:hover{filter:brightness(0.92)}',
'.gantt-today-line{position:absolute;top:0;width:2px;background:#ef4444;z-index:5;pointer-events:none}',
'.gantt-dep-arrow{position:absolute;z-index:4;pointer-events:none}',
'.gantt-empty{padding:48px;text-align:center;color:#9ca3af;font-size:14px}',
'',
'.dark .gantt-wrap{border-color:#374151}',
'.dark .gantt-sb{background:#1f2937;border-right-color:#374151}',
'.dark .gantt-sb-hd{background:#111827;border-bottom-color:#374151;color:#d1d5db}',
'.dark .gantt-sb-row{border-bottom-color:#374151}',
'.dark .gantt-sb-row:hover{background:rgba(13,148,136,0.1)!important}',
'.dark .gantt-tl-hd{border-bottom-color:#374151}',
'.dark .gantt-today-line{background:#f87171}'
].join('\n');
document.head.appendChild(css);

// ============ STATE ============
window.ganttScale = 'month';

// ============ HELPERS ============
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function parseDate(str) {
  if (!str) return null;
  var p = str.split('-');
  return new Date(parseInt(p[0],10), parseInt(p[1],10)-1, parseInt(p[2],10));
}

function sameDay(a, b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

// Bar color palette (matches Buildertrend tones)
var PALETTE = [
  {bg:'#fecaca',border:'#ef4444',text:'#991b1b'},
  {bg:'#bfdbfe',border:'#3b82f6',text:'#1e40af'},
  {bg:'#a5f3fc',border:'#06b6d4',text:'#155e75'},
  {bg:'#fed7aa',border:'#f97316',text:'#9a3412'},
  {bg:'#c4b5fd',border:'#8b5cf6',text:'#5b21b6'},
  {bg:'#fde68a',border:'#eab308',text:'#854d0e'},
  {bg:'#fbcfe8',border:'#ec4899',text:'#9d174d'},
  {bg:'#a7f3d0',border:'#10b981',text:'#065f46'}
];

var colorMap = {};
var colorIdx = 0;

function getBarColor(workers, jobIndex) {
  // Use first worker color if available
  if (workers.length > 0 && workers[0].color) {
    var wc = workers[0].color;
    return {bg: wc + '30', border: wc, text: wc};
  }
  // Use first worker id as key, else job index
  var key = workers.length > 0 ? workers[0].id : ('job-' + jobIndex);
  if (!colorMap[key]) {
    colorMap[key] = PALETTE[colorIdx % PALETTE.length];
    colorIdx++;
  }
  return colorMap[key];
}

function isDark() {
  return document.documentElement.classList.contains('dark');
}

// ============ OVERRIDE renderSchedule ============
var _origRenderSchedule = window.renderSchedule;

function buildToggle() {
  var lA = (scheduleView === 'list');
  var cA = (scheduleView === 'calendar');
  var gA = (scheduleView === 'gantt');
  function bc(active) {
    return active
      ? 'bg-white text-gray-900 border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]'
      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600';
  }
  return '<div class="flex gap-2">' +
    '<button onclick="scheduleView=\'list\';jobViewMode=\'table\';renderApp();" class="px-3 py-2 rounded text-sm ' + bc(lA) + ' border">List</button>' +
    '<button onclick="scheduleView=\'calendar\';jobViewMode=\'calendar\';renderApp();" class="px-3 py-2 rounded text-sm ' + bc(cA) + ' border">Calendar</button>' +
    '<button onclick="scheduleView=\'gantt\';jobViewMode=\'gantt\';renderApp();" class="px-3 py-2 rounded text-sm ' + bc(gA) + ' border">Gantt</button>' +
  '</div>';
}

function buildWorkerFilter() {
  if (!(getAccountType() === 'business' && teamMembers.length > 0)) return '';
  var h = '<select onchange="calendarFilter=this.value;renderApp();" class="px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white text-sm">';
  h += '<option value="all"' + (calendarFilter==='all'?' selected':'') + '>All Workers</option>';
  h += '<option value="unassigned"' + (calendarFilter==='unassigned'?' selected':'') + '>Unassigned</option>';
  for (var i=0; i<teamMembers.length; i++) {
    var m = teamMembers[i];
    h += '<option value="' + m.id + '"' + (calendarFilter===m.id?' selected':'') + '>' + escHtml(m.name) + (m.occupation ? ' - ' + escHtml(m.occupation) : '') + '</option>';
  }
  h += '</select>';
  return h;
}

window.renderSchedule = function() {
  if (scheduleView === 'gantt') {
    var scaleOpts = '<div class="flex gap-2 items-center">' +
      '<select id="gantt-scale-sel" onchange="ganttScale=this.value;renderGanttChart();" class="px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white text-sm">' +
      '<option value="week"' + (ganttScale==='week'?' selected':'') + '>Week</option>' +
      '<option value="month"' + (ganttScale==='month'?' selected':'') + '>Month</option>' +
      '</select>' +
      '<button onclick="scrollGanttToToday();" class="px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white text-sm hover:bg-gray-50 dark:hover:bg-gray-600">Today</button>' +
      '</div>';

    setTimeout(function(){ renderGanttChart(); }, 100);

    return '<div>' +
      '<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">' +
        '<h2 class="text-2xl font-bold dark:text-teal-400">Schedule</h2>' +
        '<div class="flex flex-wrap gap-2 sm:gap-4">' +
          buildWorkerFilter() + buildToggle() + scaleOpts +
          '<button onclick="openModal(\'job\')" class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded-lg transition-colors shadow-sm whitespace-nowrap">Schedule Job</button>' +
        '</div>' +
      '</div>' +
      '<div id="gantt-container" class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 overflow-hidden"></div>' +
    '</div>';
  }

  // Non-gantt: call original, inject Gantt button
  var html = _origRenderSchedule();
  return injectGanttBtn(html);
};

function injectGanttBtn(html) {
  var marker = 'border">Calendar</button>';
  var pos = 0;
  while (true) {
    var idx = html.indexOf(marker, pos);
    if (idx === -1) break;
    var after = idx + marker.length;
    var ganttActive = (scheduleView === 'gantt');
    var cls = ganttActive
      ? 'bg-white text-gray-900 border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]'
      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600';
    var btn = '<button onclick="scheduleView=\'gantt\';jobViewMode=\'gantt\';renderApp();" class="px-3 py-2 rounded text-sm ' + cls + ' border">Gantt</button>';
    html = html.substring(0, after) + btn + html.substring(after);
    pos = after + btn.length;
  }
  return html;
}

// ============ GANTT RENDERING ============
window.renderGanttChart = function() {
  try {
  var container = document.getElementById('gantt-container');
  if (!container) return;

  // Filter jobs (same logic as calendar)
  var fj = jobs;
  if (calendarFilter !== 'all') {
    if (calendarFilter === 'unassigned') {
      fj = jobs.filter(function(j) {
        return !j.assigned_to && (!j.assigned_team_members || !j.assigned_team_members.length);
      });
    } else {
      fj = jobs.filter(function(j) {
        var t = j.assigned_team_members || (j.assigned_to ? [j.assigned_to] : []);
        return t.indexOf(calendarFilter) !== -1;
      });
    }
  }

  // Sort by date, then title
  fj = fj.slice().sort(function(a, b) {
    if (a.date === b.date) return (a.title||'').localeCompare(b.title||'');
    return a.date < b.date ? -1 : 1;
  });

  if (fj.length === 0) {
    container.innerHTML = '<div class="gantt-empty">No jobs to display. Schedule a job to see it on the Gantt chart.</div>';
    return;
  }

  // Calculate timeline range
  var ROW_H = 44;
  var HDR_H = 52;
  var SB_W = 340;
  var DAY_W = (ganttScale === 'week') ? 40 : 22;

  var minD = null;
  var maxD = null;
  for (var i=0; i<fj.length; i++) {
    var sd = parseDate(fj[i].date);
    if (!sd) continue;
    var dur = parseInt(fj[i].duration) || 1;
    var ed = new Date(sd);
    ed.setDate(ed.getDate() + dur);
    if (!minD || sd < minD) minD = new Date(sd);
    if (!maxD || ed > maxD) maxD = new Date(ed);
  }
  if (!minD) { container.innerHTML = '<div class="gantt-empty">No valid job dates found.</div>'; return; }

  // Pad: 5 days before, 10 days after
  var padStart = new Date(minD);
  padStart.setDate(padStart.getDate() - 5);
  var padEnd = new Date(maxD);
  padEnd.setDate(padEnd.getDate() + 10);

  // Build day array
  var allDays = [];
  var d = new Date(padStart);
  while (d <= padEnd) {
    allDays.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  var totalW = allDays.length * DAY_W;

  // Group days by month for header
  var monthGroups = [];
  var curMKey = '';
  for (var i=0; i<allDays.length; i++) {
    var mk = allDays[i].getFullYear() + '-' + allDays[i].getMonth();
    if (mk !== curMKey) {
      monthGroups.push({label: MONTHS_FULL[allDays[i].getMonth()] + ' ' + allDays[i].getFullYear(), count:1});
      curMKey = mk;
    } else {
      monthGroups[monthGroups.length-1].count++;
    }
  }

  // Today
  var today = new Date();
  today.setHours(0,0,0,0);
  var todayIdx = -1;
  for (var i=0; i<allDays.length; i++) {
    if (sameDay(allDays[i], today)) { todayIdx = i; break; }
  }

  // Dark mode colors
  var dk = isDark();
  var bgEven = dk ? '#1f2937' : '#ffffff';
  var bgOdd = dk ? '#111827' : '#f9fafb';
  var hdrBg = dk ? '#111827' : '#f9fafb';
  var txtPrimary = dk ? '#e5e7eb' : '#1f2937';
  var txtSecondary = dk ? '#9ca3af' : '#6b7280';
  var borderLight = dk ? '#374151' : '#f3f4f6';
  var borderMed = dk ? '#374151' : '#e5e7eb';
  var weekendBg = dk ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  var maxH = Math.min(fj.length * ROW_H + HDR_H + 4, 600);
  var h = '';

  // === Outer container ===
  h += '<div class="gantt-wrap" style="height:' + maxH + 'px;">';

  // === LEFT SIDEBAR ===
  h += '<div class="gantt-sb" style="width:' + SB_W + 'px;">';

  // Sidebar header
  h += '<div class="gantt-sb-hd" style="height:' + HDR_H + 'px;">';
  h += '<span style="flex:1;">Title</span>';
  h += '<span style="width:70px;text-align:center;">Start</span>';
  h += '<span style="width:75px;text-align:center;">Workdays</span>';
  h += '</div>';

  // Sidebar body
  h += '<div id="gantt-sb-scroll" style="overflow:hidden;flex:1;">';
  for (var i=0; i<fj.length; i++) {
    var job = fj[i];
    var bg = (i % 2 === 0) ? bgEven : bgOdd;
    var sd = parseDate(job.date);
    var dateStr = sd ? (MONTHS[sd.getMonth()] + ' ' + sd.getDate()) : '-';
    var dur = parseInt(job.duration) || 1;
    h += '<div class="gantt-sb-row" style="height:' + ROW_H + 'px;background:' + bg + ';" onclick="openGanttJobDetail(\'' + job.id + '\')">';
    h += '<span style="flex:1;font-size:13px;font-weight:500;color:' + txtPrimary + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + escHtml(job.title) + '">' + escHtml(job.title) + '</span>';
    h += '<span style="width:70px;text-align:center;font-size:12px;color:' + txtSecondary + ';">' + dateStr + '</span>';
    h += '<span style="width:75px;text-align:center;font-size:12px;color:' + txtSecondary + ';">' + dur + ' day' + (dur!==1?'s':'') + '</span>';
    h += '</div>';
  }
  h += '</div></div>';

  // === RIGHT TIMELINE ===
  h += '<div class="gantt-tl">';

  // Timeline header
  h += '<div class="gantt-tl-hd" id="gantt-hd-scroll">';
  h += '<div style="width:' + totalW + 'px;height:' + HDR_H + 'px;background:' + hdrBg + ';">';

  // Month row
  h += '<div style="display:flex;height:26px;">';
  for (var i=0; i<monthGroups.length; i++) {
    var mg = monthGroups[i];
    h += '<div style="width:' + (mg.count * DAY_W) + 'px;font-size:12px;font-weight:600;color:' + txtPrimary + ';padding:4px 8px;border-right:1px solid ' + borderMed + ';border-bottom:1px solid ' + borderLight + ';overflow:hidden;white-space:nowrap;">' + mg.label + '</div>';
  }
  h += '</div>';

  // Day numbers row
  h += '<div style="display:flex;height:26px;">';
  for (var i=0; i<allDays.length; i++) {
    var day = allDays[i];
    var isWE = (day.getDay()===0 || day.getDay()===6);
    var isT = (i === todayIdx);
    var dayBg = isT ? (dk?'#1e3a5f':'#dbeafe') : (isWE ? (dk?'rgba(255,255,255,0.04)':'#f3f4f6') : 'transparent');
    var dayCol = isT ? (dk?'#60a5fa':'#1d4ed8') : (isWE ? (dk?'#6b7280':'#9ca3af') : txtSecondary);
    var dayFW = isT ? '700' : '400';
    h += '<div style="width:' + DAY_W + 'px;font-size:10px;text-align:center;color:' + dayCol + ';background:' + dayBg + ';font-weight:' + dayFW + ';line-height:26px;border-right:1px solid ' + borderLight + ';">' + day.getDate() + '</div>';
  }
  h += '</div>';
  h += '</div></div>';

  // Timeline body
  h += '<div class="gantt-tl-body" id="gantt-body-scroll">';
  h += '<div style="width:' + totalW + 'px;position:relative;">';

  // Row backgrounds + weekend shading
  for (var i=0; i<fj.length; i++) {
    var bg = (i % 2 === 0) ? bgEven : bgOdd;
    h += '<div style="height:' + ROW_H + 'px;background:' + bg + ';border-bottom:1px solid ' + borderLight + ';"></div>';
  }

  // Weekend overlay columns
  for (var di=0; di<allDays.length; di++) {
    if (allDays[di].getDay()===0 || allDays[di].getDay()===6) {
      h += '<div style="position:absolute;left:' + (di*DAY_W) + 'px;top:0;width:' + DAY_W + 'px;height:' + (fj.length*ROW_H) + 'px;background:' + weekendBg + ';pointer-events:none;"></div>';
    }
  }

  // Today line
  if (todayIdx >= 0) {
    h += '<div class="gantt-today-line" style="left:' + (todayIdx*DAY_W + Math.floor(DAY_W/2)) + 'px;height:' + (fj.length*ROW_H) + 'px;"></div>';
  }

  // === BARS ===
  for (var i=0; i<fj.length; i++) {
    var job = fj[i];
    var sd = parseDate(job.date);
    if (!sd) continue;
    var dur = parseInt(job.duration) || 1;

    // Find start day index
    var startIdx = -1;
    for (var di=0; di<allDays.length; di++) {
      if (sameDay(allDays[di], sd)) { startIdx = di; break; }
    }
    if (startIdx < 0) continue;

    // Bar position
    var barL = startIdx * DAY_W + 2;
    var barW = Math.max(dur * DAY_W - 4, DAY_W - 4);
    var barT = i * ROW_H + 8;
    var barH = ROW_H - 16;

    // Workers and color
    var ids = job.assigned_team_members || (job.assigned_to ? [job.assigned_to] : []);
    var workers = [];
    for (var wi=0; wi<ids.length; wi++) {
      for (var ti=0; ti<teamMembers.length; ti++) {
        if (teamMembers[ti].id === ids[wi]) { workers.push(teamMembers[ti]); break; }
      }
    }
    var bc = getBarColor(workers, i);

    // Status opacity
    var opa = (job.status === 'completed') ? '0.55' : '1';

    // Label
    var label = dur + ' day' + (dur!==1?'s':'');

    // Tooltip
    var cl = null;
    for (var ci=0; ci<clients.length; ci++) {
      if (clients[ci].id === job.client_id) { cl = clients[ci]; break; }
    }
    var tipParts = [job.title || ''];
    if (cl) tipParts.push(cl.name);
    if (workers.length > 0) tipParts.push(workers.map(function(w){return w.name;}).join(', '));
    tipParts.push(label);
    var tip = escHtml(tipParts.join(' - '));

    h += '<div class="gantt-bar" style="left:' + barL + 'px;top:' + barT + 'px;width:' + barW + 'px;height:' + barH + 'px;background:' + bc.bg + ';border-left:3px solid ' + bc.border + ';opacity:' + opa + ';" onclick="openGanttJobDetail(\'' + job.id + '\')" title="' + tip + '">';

    // Show label if bar is wide enough
    if (barW > 55) {
      h += '<span style="font-size:11px;font-weight:600;color:' + bc.text + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 6px;">' + label + '</span>';
    }

    h += '</div>';
  }

  h += '</div></div></div></div>';

  container.innerHTML = h;

  // === SCROLL SYNC ===
  var bodyEl = document.getElementById('gantt-body-scroll');
  var hdrEl = document.getElementById('gantt-hd-scroll');
  var sbEl = document.getElementById('gantt-sb-scroll');

  if (bodyEl) {
    bodyEl.addEventListener('scroll', function() {
      if (hdrEl) hdrEl.scrollLeft = bodyEl.scrollLeft;
      if (sbEl) sbEl.scrollTop = bodyEl.scrollTop;
    });
  }

  // Auto-scroll to first job or today
  if (bodyEl) {
    if (todayIdx >= 0) {
      var scrollTarget = Math.max(0, todayIdx * DAY_W - 100);
      bodyEl.scrollLeft = scrollTarget;
    } else {
      // Scroll to first bar
      var firstDate = parseDate(fj[0].date);
      if (firstDate) {
        for (var di=0; di<allDays.length; di++) {
          if (sameDay(allDays[di], firstDate)) {
            bodyEl.scrollLeft = Math.max(0, di * DAY_W - 40);
            break;
          }
        }
      }
    }
  }

  } catch(err) {
    console.error('Gantt render error:', err);
    var c = document.getElementById('gantt-container');
    if (c) c.innerHTML = '<div class="gantt-empty">Error rendering Gantt chart. Check console for details.</div>';
  }
};

// ============ SCROLL TO TODAY ============
window.scrollGanttToToday = function() {
  var bodyEl = document.getElementById('gantt-body-scroll');
  if (!bodyEl) return;
  var line = document.querySelector('.gantt-today-line');
  if (line) {
    var pos = parseInt(line.style.left) || 0;
    bodyEl.scrollLeft = Math.max(0, pos - 100);
  }
};

// ============ OPEN JOB FROM GANTT ============
window.openGanttJobDetail = function(jobId) {
  var job = null;
  for (var i=0; i<jobs.length; i++) {
    if (jobs[i].id === jobId) { job = jobs[i]; break; }
  }
  if (job) {
    scheduleView = 'list';
    openJobDetail(job);
  }
};

console.log('Gantt chart loaded');

} catch(e) {
  console.error('Gantt init error:', e);
}
})();
