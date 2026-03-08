// M4 Gantt Chart v2 - Task-Level Scheduling
// Replaces gantt-chart.js v1. Additive only, wraps existing functions.
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'.gantt-wrap{display:flex;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;font-size:13px}',
'.gantt-sb{flex-shrink:0;border-right:2px solid #e5e7eb;display:flex;flex-direction:column;background:#fff}',
'.gantt-sb-hd{display:flex;align-items:center;border-bottom:1px solid #e5e7eb;background:#f9fafb;font-weight:600;color:#374151;flex-shrink:0}',
'.gantt-row{display:flex;align-items:center;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:background 0.15s}',
'.gantt-row:hover{background:#f0fdfa!important}',
'.gantt-job-hd{background:#f0f9ff!important;cursor:default;font-weight:600}',
'.gantt-job-hd:hover{background:#f0f9ff!important}',
'.gantt-tl{flex:1;display:flex;flex-direction:column;overflow:hidden}',
'.gantt-tl-hd{overflow:hidden;flex-shrink:0;border-bottom:1px solid #e5e7eb}',
'.gantt-tl-body{overflow:auto;flex:1;position:relative}',
'.gantt-bar{position:absolute;border-radius:4px;cursor:pointer;display:flex;align-items:center;transition:filter 0.15s;box-shadow:0 1px 2px rgba(0,0,0,0.08)}',
'.gantt-bar:hover{filter:brightness(0.9)}',
'.gantt-bar-label{font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 6px}',
'.gantt-today-line{position:absolute;top:0;width:2px;background:#ef4444;z-index:5;pointer-events:none}',
'.gantt-empty{padding:48px;text-align:center;color:#9ca3af;font-size:14px}',
'.gantt-dep-svg{position:absolute;top:0;left:0;pointer-events:none;z-index:4}',
'.gantt-unsched{font-style:italic;color:#9ca3af;font-size:11px}',
'.gantt-worker-dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0}',
'',
'.gantt-sched-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:4px 0}',
'.gantt-sched-row input,.gantt-sched-row select{padding:4px 6px;font-size:12px;border:1px solid #d1d5db;border-radius:6px;background:#fff;color:#374151;outline:none}',
'.gantt-sched-row input:focus,.gantt-sched-row select:focus{border-color:#14b8a6;box-shadow:0 0 0 2px rgba(20,184,166,0.15)}',
'.gantt-sched-row label{font-size:11px;color:#6b7280;font-weight:500}',
'.gantt-sched-btn{padding:3px 10px;font-size:11px;font-weight:600;border:none;border-radius:5px;cursor:pointer;transition:background 0.15s}',
'.gantt-sched-save{background:#0d9488;color:#fff}.gantt-sched-save:hover{background:#0f766e}',
'.gantt-sched-cancel{background:#e5e7eb;color:#374151}.gantt-sched-cancel:hover{background:#d1d5db}',
'.gantt-edit-icon{opacity:0;transition:opacity 0.15s;cursor:pointer;color:#9ca3af;flex-shrink:0}',
'.gantt-edit-icon:hover{color:#0d9488}',
'.gantt-row:hover .gantt-edit-icon,.gantt-task-item:hover .gantt-edit-icon{opacity:1}',
'.gantt-task-item{position:relative}',
'.gantt-task-badges{display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-top:2px}',
'.gantt-badge{font-size:10px;padding:1px 6px;border-radius:4px;white-space:nowrap}',
'',
'.dark .gantt-wrap{border-color:#374151}',
'.dark .gantt-sb{background:#1f2937;border-right-color:#374151}',
'.dark .gantt-sb-hd{background:#111827;border-bottom-color:#374151;color:#d1d5db}',
'.dark .gantt-row{border-bottom-color:#374151}',
'.dark .gantt-row:hover{background:rgba(13,148,136,0.1)!important}',
'.dark .gantt-job-hd{background:#1e3a5f!important}',
'.dark .gantt-job-hd:hover{background:#1e3a5f!important}',
'.dark .gantt-tl-hd{border-bottom-color:#374151}',
'.dark .gantt-today-line{background:#f87171}',
'.dark .gantt-sched-row input,.dark .gantt-sched-row select{background:#374151;color:#e5e7eb;border-color:#4b5563}',
'.dark .gantt-sched-cancel{background:#4b5563;color:#e5e7eb}'
].join('\n');
document.head.appendChild(css);

// ============ STATE ============
window.ganttScale = 'month';
var _editingTaskId = null;

// ============ HELPERS ============
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var DAY_LETTERS = ['S','M','T','W','T','F','S'];

function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function parseD(str) {
  if (!str) return null;
  var p = str.split('-');
  return new Date(parseInt(p[0],10), parseInt(p[1],10)-1, parseInt(p[2],10));
}

function fmtD(str) {
  var d = parseD(str);
  if (!d) return '-';
  return MONTHS[d.getMonth()] + ' ' + d.getDate();
}

function sameDay(a, b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

function isDark() {
  return document.documentElement.classList.contains('dark');
}

function findMember(id) {
  if (!id) return null;
  for (var i = 0; i < teamMembers.length; i++) {
    if (teamMembers[i].id === id) return teamMembers[i];
  }
  return null;
}

// Bar color palette
var PALETTE = [
  {bg:'#fecaca',bd:'#ef4444',tx:'#991b1b'},
  {bg:'#bfdbfe',bd:'#3b82f6',tx:'#1e40af'},
  {bg:'#a5f3fc',bd:'#06b6d4',tx:'#155e75'},
  {bg:'#fed7aa',bd:'#f97316',tx:'#9a3412'},
  {bg:'#c4b5fd',bd:'#8b5cf6',tx:'#5b21b6'},
  {bg:'#d9f99d',bd:'#84cc16',tx:'#3f6212'},
  {bg:'#fbcfe8',bd:'#ec4899',tx:'#9d174d'},
  {bg:'#fde68a',bd:'#eab308',tx:'#854d0e'}
];
var cMap = {};
var cIdx = 0;

function barColor(memberId, fallbackIdx) {
  var m = findMember(memberId);
  if (m && m.color) {
    return {bg: m.color + '30', bd: m.color, tx: m.color};
  }
  var key = memberId || ('f-' + fallbackIdx);
  if (!cMap[key]) {
    cMap[key] = PALETTE[cIdx % PALETTE.length];
    cIdx++;
  }
  return cMap[key];
}

// ============ VIEW TOGGLE ============
function buildToggle() {
  function bc(a) {
    return a
      ? 'bg-white text-gray-900 border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]'
      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600';
  }
  return '<div class="flex gap-2">' +
    '<button onclick="scheduleView=\'list\';jobViewMode=\'table\';renderApp();" class="px-3 py-2 rounded text-sm ' + bc(scheduleView==='list') + ' border">List</button>' +
    '<button onclick="scheduleView=\'calendar\';jobViewMode=\'calendar\';renderApp();" class="px-3 py-2 rounded text-sm ' + bc(scheduleView==='calendar') + ' border">Calendar</button>' +
    '<button onclick="scheduleView=\'gantt\';jobViewMode=\'gantt\';renderApp();" class="px-3 py-2 rounded text-sm ' + bc(scheduleView==='gantt') + ' border">Gantt</button>' +
  '</div>';
}

function buildWorkerFilter() {
  if (!(getAccountType() === 'business' && teamMembers.length > 0)) return '';
  var h = '<select onchange="calendarFilter=this.value;renderApp();" class="px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white text-sm">';
  h += '<option value="all"' + (calendarFilter==='all'?' selected':'') + '>All Workers</option>';
  h += '<option value="unassigned"' + (calendarFilter==='unassigned'?' selected':'') + '>Unassigned</option>';
  for (var i = 0; i < teamMembers.length; i++) {
    var m = teamMembers[i];
    h += '<option value="' + m.id + '"' + (calendarFilter===m.id?' selected':'') + '>' + escH(m.name) + (m.occupation ? ' - ' + escH(m.occupation) : '') + '</option>';
  }
  h += '</select>';
  return h;
}

// ============ OVERRIDE renderSchedule ============
var _origRS = window.renderSchedule;

window.renderSchedule = function() {
  if (scheduleView === 'gantt') {
    var scaleOpts = '<div class="flex gap-2 items-center">' +
      '<select onchange="ganttScale=this.value;renderGanttChart();" class="px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white text-sm">' +
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
  var html = _origRS();
  return injectGanttBtn(html);
};

function injectGanttBtn(html) {
  var marker = 'border">Calendar</button>';
  var pos = 0;
  while (true) {
    var idx = html.indexOf(marker, pos);
    if (idx === -1) break;
    var after = idx + marker.length;
    var cls = (scheduleView === 'gantt')
      ? 'bg-white text-gray-900 border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]'
      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600';
    var btn = '<button onclick="scheduleView=\'gantt\';jobViewMode=\'gantt\';renderApp();" class="px-3 py-2 rounded text-sm ' + cls + ' border">Gantt</button>';
    html = html.substring(0, after) + btn + html.substring(after);
    pos = after + btn.length;
  }
  return html;
}

// ============ GANTT CHART RENDERING ============
window.renderGanttChart = async function() {
  try {
  var container = document.getElementById('gantt-container');
  if (!container) return;
  container.innerHTML = '<div class="gantt-empty">Loading schedule...</div>';

  await loadJobTasks();

  var fj = jobs.slice();
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

  fj.sort(function(a, b) {
    if (a.date === b.date) return (a.title || '').localeCompare(b.title || '');
    return a.date < b.date ? -1 : 1;
  });

  if (fj.length === 0) {
    container.innerHTML = '<div class="gantt-empty">No jobs to display. Schedule a job to see it here.</div>';
    return;
  }

  // Build rows: job headers + task rows
  var rows = [];
  var allTasks = window.jobTasks || [];

  for (var ji = 0; ji < fj.length; ji++) {
    var job = fj[ji];
    var cl = null;
    for (var ci = 0; ci < clients.length; ci++) {
      if (clients[ci].id === job.client_id) { cl = clients[ci]; break; }
    }
    var jobLabel = escH(job.title);
    if (cl) jobLabel += ' - ' + escH(cl.name);

    var tasks = allTasks.filter(function(t) { return t.job_id === job.id; });
    tasks.sort(function(a, b) {
      var sa = a.sort_order || 0;
      var sb = b.sort_order || 0;
      if (sa !== sb) return sa - sb;
      if (a.start_date && b.start_date) return a.start_date < b.start_date ? -1 : 1;
      if (a.start_date) return -1;
      if (b.start_date) return 1;
      return 0;
    });

    rows.push({type:'job', job:job, label:jobLabel, taskCount:tasks.length});

    if (tasks.length === 0) {
      rows.push({
        type:'task-fb', job:job,
        title: job.title,
        startDate: job.date,
        duration: parseInt(job.duration) || 1,
        memberId: null, memberName: null, memberColor: null,
        taskId: null, dependsOn: null, completed: false
      });
    } else {
      for (var ti = 0; ti < tasks.length; ti++) {
        var task = tasks[ti];
        var mem = findMember(task.assigned_member_id);
        rows.push({
          type:'task', job:job, task:task,
          title: task.title,
          startDate: task.start_date || null,
          duration: task.duration_days || 1,
          memberId: task.assigned_member_id || null,
          memberName: mem ? mem.name : null,
          memberColor: mem ? (mem.color || '#14b8a6') : null,
          taskId: task.id,
          dependsOn: task.depends_on || null,
          completed: task.completed || false
        });
      }
    }
  }

  var ROW_H = 40;
  var JOB_H = 34;
  var HDR_H = 50;
  var SB_W = 380;
  var DAY_W = (ganttScale === 'week') ? 40 : 22;

  // Timeline range
  var minD = null;
  var maxD = null;
  for (var ri = 0; ri < rows.length; ri++) {
    var r = rows[ri];
    if (r.type === 'job' || !r.startDate) continue;
    var sd = parseD(r.startDate);
    if (!sd) continue;
    var ed = new Date(sd);
    ed.setDate(ed.getDate() + r.duration);
    if (!minD || sd < minD) minD = new Date(sd);
    if (!maxD || ed > maxD) maxD = new Date(ed);
  }
  if (!minD) {
    for (var ji2 = 0; ji2 < fj.length; ji2++) {
      var sd2 = parseD(fj[ji2].date);
      if (!sd2) continue;
      var dur2 = parseInt(fj[ji2].duration) || 1;
      var ed2 = new Date(sd2);
      ed2.setDate(ed2.getDate() + dur2);
      if (!minD || sd2 < minD) minD = new Date(sd2);
      if (!maxD || ed2 > maxD) maxD = new Date(ed2);
    }
  }
  if (!minD) {
    container.innerHTML = '<div class="gantt-empty">No valid dates found.</div>';
    return;
  }

  var padStart = new Date(minD);
  padStart.setDate(padStart.getDate() - 5);
  var padEnd = new Date(maxD);
  padEnd.setDate(padEnd.getDate() + 14);

  var allDays = [];
  var dd = new Date(padStart);
  while (dd <= padEnd) {
    allDays.push(new Date(dd));
    dd.setDate(dd.getDate() + 1);
  }
  var totalW = allDays.length * DAY_W;

  // Month groups
  var monthGroups = [];
  var curMK = '';
  for (var di = 0; di < allDays.length; di++) {
    var mk = allDays[di].getFullYear() + '-' + allDays[di].getMonth();
    if (mk !== curMK) {
      monthGroups.push({label: MONTHS_FULL[allDays[di].getMonth()], count: 1});
      curMK = mk;
    } else {
      monthGroups[monthGroups.length - 1].count++;
    }
  }

  // Today
  var today = new Date();
  today.setHours(0,0,0,0);
  var todayIdx = -1;
  for (var di2 = 0; di2 < allDays.length; di2++) {
    if (sameDay(allDays[di2], today)) { todayIdx = di2; break; }
  }

  var dk = isDark();
  var bgEven = dk ? '#1f2937' : '#ffffff';
  var bgOdd = dk ? '#111827' : '#f9fafb';
  var hdrBg = dk ? '#111827' : '#f9fafb';
  var txtP = dk ? '#e5e7eb' : '#1f2937';
  var txtS = dk ? '#9ca3af' : '#6b7280';
  var bdrL = dk ? '#374151' : '#f3f4f6';
  var bdrM = dk ? '#374151' : '#e5e7eb';
  var weBg = dk ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  var jobBg = dk ? '#1e3a5f' : '#f0f9ff';
  var jobTxt = dk ? '#93c5fd' : '#1e40af';

  var totalH = 0;
  for (var ri2 = 0; ri2 < rows.length; ri2++) {
    totalH += (rows[ri2].type === 'job') ? JOB_H : ROW_H;
  }
  var maxH = Math.min(totalH + HDR_H + 4, 650);

  var h = '';
  h += '<div class="gantt-wrap" style="height:' + maxH + 'px;">';

  // === SIDEBAR ===
  h += '<div class="gantt-sb" style="width:' + SB_W + 'px;">';
  h += '<div class="gantt-sb-hd" style="height:' + HDR_H + 'px;padding:0 12px;">';
  h += '<span style="width:28px;text-align:center;color:' + txtS + ';">#</span>';
  h += '<span style="flex:1;padding:0 8px;">Task</span>';
  h += '<span style="width:80px;text-align:center;">Worker</span>';
  h += '<span style="width:60px;text-align:center;">Start</span>';
  h += '<span style="width:45px;text-align:center;">Days</span>';
  h += '</div>';

  h += '<div id="gantt-sb-scroll" style="overflow:hidden;flex:1;">';
  var taskNum = 0;
  for (var ri3 = 0; ri3 < rows.length; ri3++) {
    var row = rows[ri3];
    if (row.type === 'job') {
      taskNum = 0;
      h += '<div class="gantt-row gantt-job-hd" style="height:' + JOB_H + 'px;padding:0 12px;background:' + jobBg + ';">';
      h += '<span style="font-size:12px;font-weight:700;color:' + jobTxt + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">' + row.label + '</span>';
      h += '<span style="font-size:10px;color:' + txtS + ';flex-shrink:0;margin-left:8px;">' + row.taskCount + ' task' + (row.taskCount !== 1 ? 's' : '') + '</span>';
      h += '</div>';
    } else {
      taskNum++;
      var bg = (taskNum % 2 === 0) ? bgOdd : bgEven;
      var wName = row.memberName || '';
      var wColor = row.memberColor || '';
      var startStr = row.startDate ? fmtD(row.startDate) : '-';
      var clickFn = row.job ? 'openGanttJobDetail(\'' + row.job.id + '\')' : '';

      h += '<div class="gantt-row" style="height:' + ROW_H + 'px;padding:0 12px;background:' + bg + ';" onclick="' + clickFn + '">';
      h += '<span style="width:28px;text-align:center;font-size:11px;color:' + txtS + ';">' + taskNum + '</span>';
      h += '<span style="flex:1;padding:0 8px;font-size:12px;font-weight:500;color:' + txtP + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + escH(row.title) + '">' + escH(row.title) + '</span>';
      if (wName) {
        h += '<span style="width:80px;text-align:center;font-size:11px;color:' + txtS + ';display:flex;align-items:center;justify-content:center;gap:4px;">';
        h += '<span class="gantt-worker-dot" style="background:' + wColor + ';"></span>';
        h += '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escH(wName.split(' ')[0]) + '</span></span>';
      } else {
        h += '<span style="width:80px;text-align:center;font-size:10px;color:#d1d5db;">-</span>';
      }
      h += '<span style="width:60px;text-align:center;font-size:11px;color:' + txtS + ';">' + startStr + '</span>';
      h += '<span style="width:45px;text-align:center;font-size:11px;color:' + txtS + ';">' + row.duration + '</span>';
      h += '</div>';
    }
  }
  h += '</div></div>';

  // === TIMELINE ===
  h += '<div class="gantt-tl">';
  h += '<div class="gantt-tl-hd" id="gantt-hd-scroll">';
  h += '<div style="width:' + totalW + 'px;height:' + HDR_H + 'px;background:' + hdrBg + ';">';

  // Month row
  h += '<div style="display:flex;height:25px;">';
  for (var mi = 0; mi < monthGroups.length; mi++) {
    var mg = monthGroups[mi];
    h += '<div style="width:' + (mg.count * DAY_W) + 'px;font-size:12px;font-weight:600;color:' + txtP + ';padding:4px 8px;border-right:1px solid ' + bdrM + ';border-bottom:1px solid ' + bdrL + ';overflow:hidden;white-space:nowrap;">' + mg.label + '</div>';
  }
  h += '</div>';

  // Day row
  h += '<div style="display:flex;height:25px;">';
  for (var di3 = 0; di3 < allDays.length; di3++) {
    var day = allDays[di3];
    var isWE = (day.getDay() === 0 || day.getDay() === 6);
    var isT = (di3 === todayIdx);
    var dayBg = isT ? (dk ? '#1e3a5f' : '#dbeafe') : (isWE ? (dk ? 'rgba(255,255,255,0.04)' : '#f3f4f6') : 'transparent');
    var dayCol = isT ? (dk ? '#60a5fa' : '#1d4ed8') : (isWE ? (dk ? '#6b7280' : '#9ca3af') : txtS);
    var dayFW = isT ? '700' : '400';
    var dayText = (ganttScale === 'week') ? DAY_LETTERS[day.getDay()] + ' ' + day.getDate() : String(day.getDate());
    h += '<div style="width:' + DAY_W + 'px;font-size:' + (ganttScale === 'week' ? '10' : '9') + 'px;text-align:center;color:' + dayCol + ';background:' + dayBg + ';font-weight:' + dayFW + ';line-height:25px;border-right:1px solid ' + bdrL + ';">' + dayText + '</div>';
  }
  h += '</div></div></div>';

  // Body
  h += '<div class="gantt-tl-body" id="gantt-body-scroll">';
  h += '<div id="gantt-canvas" style="width:' + totalW + 'px;position:relative;height:' + totalH + 'px;">';

  // Row backgrounds
  var yOff = 0;
  for (var ri4 = 0; ri4 < rows.length; ri4++) {
    var rr = rows[ri4];
    var rH2 = (rr.type === 'job') ? JOB_H : ROW_H;
    var rBg = (rr.type === 'job') ? jobBg : ((ri4 % 2 === 0) ? bgEven : bgOdd);
    h += '<div style="position:absolute;left:0;top:' + yOff + 'px;width:100%;height:' + rH2 + 'px;background:' + rBg + ';border-bottom:1px solid ' + bdrL + ';"></div>';
    yOff += rH2;
  }

  // Weekend shading
  for (var di4 = 0; di4 < allDays.length; di4++) {
    if (allDays[di4].getDay() === 0 || allDays[di4].getDay() === 6) {
      h += '<div style="position:absolute;left:' + (di4 * DAY_W) + 'px;top:0;width:' + DAY_W + 'px;height:' + totalH + 'px;background:' + weBg + ';pointer-events:none;"></div>';
    }
  }

  // Today line
  if (todayIdx >= 0) {
    h += '<div class="gantt-today-line" style="left:' + (todayIdx * DAY_W + Math.floor(DAY_W / 2)) + 'px;height:' + totalH + 'px;"></div>';
  }

  // === BARS ===
  var barPos = {};
  yOff = 0;
  for (var ri5 = 0; ri5 < rows.length; ri5++) {
    var row5 = rows[ri5];
    var rH3 = (row5.type === 'job') ? JOB_H : ROW_H;

    if (row5.type !== 'job' && row5.startDate) {
      var sd5 = parseD(row5.startDate);
      if (sd5) {
        var sIdx = -1;
        for (var di5 = 0; di5 < allDays.length; di5++) {
          if (sameDay(allDays[di5], sd5)) { sIdx = di5; break; }
        }
        if (sIdx >= 0) {
          var barL = sIdx * DAY_W + 2;
          var barW = Math.max(row5.duration * DAY_W - 4, DAY_W - 4);
          var barT = yOff + 6;
          var barH2 = rH3 - 12;
          var bc = barColor(row5.memberId, ri5);
          var opa = row5.completed ? '0.5' : '1';
          var tipParts = [row5.title];
          if (row5.memberName) tipParts.push(row5.memberName);
          tipParts.push(row5.duration + ' day' + (row5.duration !== 1 ? 's' : ''));
          var tip = escH(tipParts.join(' - '));
          var clickJob = row5.job ? 'openGanttJobDetail(\'' + row5.job.id + '\')' : '';

          h += '<div class="gantt-bar" style="left:' + barL + 'px;top:' + barT + 'px;width:' + barW + 'px;height:' + barH2 + 'px;background:' + bc.bg + ';border-left:3px solid ' + bc.bd + ';opacity:' + opa + ';" onclick="' + clickJob + '" title="' + tip + '">';
          var labelText = escH(row5.title);
          if (barW > 80) {
            h += '<span class="gantt-bar-label" style="color:' + bc.tx + ';">' + labelText + '</span>';
          } else if (barW > 40) {
            h += '<span class="gantt-bar-label" style="color:' + bc.tx + ';">' + row5.duration + 'd</span>';
          }
          h += '</div>';

          // Label to right of short bars
          if (barW <= 80) {
            h += '<span style="position:absolute;left:' + (barL + barW + 4) + 'px;top:' + (barT + 3) + 'px;font-size:11px;color:' + txtS + ';white-space:nowrap;pointer-events:none;">' + labelText + '</span>';
          }

          if (row5.taskId) {
            barPos[row5.taskId] = {l: barL, r: barL + barW, cy: barT + barH2 / 2};
          }
        }
      }
    } else if (row5.type !== 'job' && !row5.startDate) {
      h += '<span class="gantt-unsched" style="position:absolute;left:12px;top:' + (yOff + 10) + 'px;">Not scheduled - click to set dates</span>';
    }
    yOff += rH3;
  }

  // === DEPENDENCY ARROWS ===
  var arrows = '';
  for (var ri6 = 0; ri6 < rows.length; ri6++) {
    var row6 = rows[ri6];
    if (row6.type === 'job' || !row6.dependsOn) continue;
    var from = barPos[row6.dependsOn];
    var to = barPos[row6.taskId];
    if (!from || !to) continue;
    var x1 = from.r;
    var y1 = from.cy;
    var x2 = to.l;
    var y2 = to.cy;
    var midX = x1 + 12;
    var arrowCol = dk ? '#6b7280' : '#9ca3af';
    arrows += '<path d="M' + x1 + ' ' + y1 + ' L' + midX + ' ' + y1 + ' L' + midX + ' ' + y2 + ' L' + x2 + ' ' + y2 + '" fill="none" stroke="' + arrowCol + '" stroke-width="1.5" />';
    arrows += '<polygon points="' + x2 + ',' + y2 + ' ' + (x2 - 5) + ',' + (y2 - 3) + ' ' + (x2 - 5) + ',' + (y2 + 3) + '" fill="' + arrowCol + '" />';
  }
  if (arrows) {
    h += '<svg class="gantt-dep-svg" width="' + totalW + '" height="' + totalH + '">' + arrows + '</svg>';
  }

  h += '</div></div></div></div>';
  container.innerHTML = h;

  // Scroll sync
  var bodyEl = document.getElementById('gantt-body-scroll');
  var hdrEl = document.getElementById('gantt-hd-scroll');
  var sbEl = document.getElementById('gantt-sb-scroll');
  if (bodyEl) {
    bodyEl.addEventListener('scroll', function() {
      if (hdrEl) hdrEl.scrollLeft = bodyEl.scrollLeft;
      if (sbEl) sbEl.scrollTop = bodyEl.scrollTop;
    });
    if (todayIdx >= 0) {
      bodyEl.scrollLeft = Math.max(0, todayIdx * DAY_W - 120);
    } else {
      for (var k in barPos) {
        bodyEl.scrollLeft = Math.max(0, barPos[k].l - 40);
        break;
      }
    }
  }

  } catch(err) {
    console.error('Gantt render error:', err);
    var c = document.getElementById('gantt-container');
    if (c) c.innerHTML = '<div class="gantt-empty">Error rendering Gantt chart. Check console.</div>';
  }
};

// ============ SCROLL TO TODAY ============
window.scrollGanttToToday = function() {
  var bodyEl = document.getElementById('gantt-body-scroll');
  if (!bodyEl) return;
  var line = document.querySelector('.gantt-today-line');
  if (line) bodyEl.scrollLeft = Math.max(0, parseInt(line.style.left) - 120);
};

// ============ OPEN JOB FROM GANTT ============
window.openGanttJobDetail = function(jobId) {
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id === jobId) {
      scheduleView = 'list';
      openJobDetail(jobs[i]);
      return;
    }
  }
};

// ============ OVERRIDE addJobTask ============
window.addJobTask = async function(jobId) {
  var input = document.getElementById('new-task-input-' + jobId);
  if (!input) return;
  var title = input.value.trim();
  if (!title) return;

  var dueDateEl = document.getElementById('new-task-due-' + jobId);
  var startDateEl = document.getElementById('gantt-new-start-' + jobId);
  var durationEl = document.getElementById('gantt-new-dur-' + jobId);
  var memberEl = document.getElementById('gantt-new-member-' + jobId);
  var dependsEl = document.getElementById('gantt-new-dep-' + jobId);

  var dueDate = (dueDateEl && dueDateEl.value) ? dueDateEl.value : null;
  var startDate = (startDateEl && startDateEl.value) ? startDateEl.value : null;
  var durDays = (durationEl && parseInt(durationEl.value)) ? parseInt(durationEl.value) : 1;
  var memberId = (memberEl && memberEl.value) ? memberEl.value : null;
  var dependsOn = (dependsEl && dependsEl.value) ? dependsEl.value : null;

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
      title: title,
      completed: false,
      sort_order: maxSort + 1,
      duration_days: durDays
    };
    if (dueDate) insertData.due_date = dueDate;
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

    input.value = '';
    if (dueDateEl) dueDateEl.value = '';
    if (startDateEl) startDateEl.value = '';
    if (durationEl) durationEl.value = '1';
    if (memberEl) memberEl.value = '';
    if (dependsEl) dependsEl.value = '';
    renderApp();
  } catch (error) {
    console.error('Error adding task:', error);
    showNotification('Error adding task: ' + error.message, 'error');
  }
};

// ============ TASK SCHEDULE EDITING ============
window.openTaskScheduleEdit = function(taskId) {
  _editingTaskId = taskId;
  renderApp();
};

window.cancelTaskScheduleEdit = function() {
  _editingTaskId = null;
  renderApp();
};

window.saveTaskSchedule = async function(taskId) {
  var startEl = document.getElementById('gantt-edit-start-' + taskId);
  var durEl = document.getElementById('gantt-edit-dur-' + taskId);
  var memEl = document.getElementById('gantt-edit-member-' + taskId);
  var depEl = document.getElementById('gantt-edit-dep-' + taskId);

  var updateData = {
    start_date: (startEl && startEl.value) ? startEl.value : null,
    duration_days: (durEl && parseInt(durEl.value)) ? parseInt(durEl.value) : 1,
    assigned_member_id: (memEl && memEl.value) ? memEl.value : null,
    depends_on: (depEl && depEl.value) ? depEl.value : null
  };

  try {
    var result = await supabaseClient
      .from('job_tasks')
      .update(updateData)
      .eq('id', taskId);

    if (result.error) throw result.error;

    var task = (window.jobTasks || []).find(function(t) { return t.id === taskId; });
    if (task) {
      task.start_date = updateData.start_date;
      task.duration_days = updateData.duration_days;
      task.assigned_member_id = updateData.assigned_member_id;
      task.depends_on = updateData.depends_on;
    }
    _editingTaskId = null;
    showNotification('Task schedule updated', 'success');
    renderApp();
  } catch (error) {
    console.error('Error updating task schedule:', error);
    showNotification('Error: ' + error.message, 'error');
  }
};

// ============ DOM ENHANCEMENT: Job Detail Task Section ============
function enhanceTaskSection() {
  var section = document.getElementById('job-tasks-section');
  if (!section || section.dataset.ganttEnhanced) return;
  section.dataset.ganttEnhanced = 'true';
  if (!selectedJobForDetail) return;
  var jobId = selectedJobForDetail.id;
  var jobTasks = (window.jobTasks || []).filter(function(t) { return t.job_id === jobId; });

  // Add scheduling row below add-task input
  var addArea = section.querySelector('.flex.gap-2.mb-4');
  if (addArea && !document.getElementById('gantt-new-start-' + jobId)) {
    var schedRow = document.createElement('div');
    schedRow.className = 'gantt-sched-row';
    schedRow.style.marginBottom = '12px';
    schedRow.style.marginTop = '4px';

    var memberOpts = '<option value="">Unassigned</option>';
    for (var i = 0; i < teamMembers.length; i++) {
      memberOpts += '<option value="' + teamMembers[i].id + '">' + escH(teamMembers[i].name) + '</option>';
    }
    var depOpts = '<option value="">None</option>';
    for (var j = 0; j < jobTasks.length; j++) {
      depOpts += '<option value="' + jobTasks[j].id + '">' + escH(jobTasks[j].title) + '</option>';
    }

    schedRow.innerHTML =
      '<label>Start</label><input type="date" id="gantt-new-start-' + jobId + '" style="width:130px;">' +
      '<label>Days</label><input type="number" id="gantt-new-dur-' + jobId + '" value="1" min="1" max="365" style="width:55px;">' +
      '<label>Worker</label><select id="gantt-new-member-' + jobId + '" style="min-width:100px;">' + memberOpts + '</select>' +
      '<label>After</label><select id="gantt-new-dep-' + jobId + '" style="min-width:100px;">' + depOpts + '</select>';
    addArea.parentNode.insertBefore(schedRow, addArea.nextSibling);
  }

  // Enhance each task row
  var checkboxes = section.querySelectorAll('input[type="checkbox"][onchange*="toggleJobTask"]');
  checkboxes.forEach(function(cb) {
    var row = cb.closest('.flex');
    if (!row || row.dataset.ganttAdded) return;
    row.dataset.ganttAdded = 'true';
    row.classList.add('gantt-task-item');

    var match = cb.getAttribute('onchange').match(/toggleJobTask\('([^']+)'/);
    if (!match) return;
    var taskId = match[1];
    var task = (window.jobTasks || []).find(function(t) { return t.id === taskId; });
    if (!task) return;

    // Edit icon
    var deleteBtn = row.querySelector('button[onclick*="deleteJobTask"]');
    if (deleteBtn && !row.querySelector('.gantt-edit-icon')) {
      var editBtn = document.createElement('button');
      editBtn.className = 'gantt-edit-icon';
      editBtn.title = 'Schedule task';
      editBtn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
      editBtn.setAttribute('onclick', 'event.stopPropagation();openTaskScheduleEdit(\'' + taskId + '\')');
      deleteBtn.parentNode.insertBefore(editBtn, deleteBtn);
    }

    // Scheduling badges
    var titleSpan = row.querySelector('.flex-1');
    if (titleSpan && !titleSpan.querySelector('.gantt-task-badges')) {
      var badges = [];
      if (task.start_date) {
        badges.push('<span class="gantt-badge" style="background:#dbeafe;color:#1e40af;">' + fmtD(task.start_date) + '</span>');
      }
      if (task.duration_days && task.duration_days > 1) {
        badges.push('<span class="gantt-badge" style="background:#fef3c7;color:#92400e;">' + task.duration_days + ' days</span>');
      }
      var mem = findMember(task.assigned_member_id);
      if (mem) {
        badges.push('<span class="gantt-badge" style="background:' + (mem.color || '#14b8a6') + '20;color:' + (mem.color || '#14b8a6') + ';">' + escH(mem.name.split(' ')[0]) + '</span>');
      }
      if (task.depends_on) {
        var depTask = (window.jobTasks || []).find(function(t) { return t.id === task.depends_on; });
        if (depTask) {
          badges.push('<span class="gantt-badge" style="background:#f3e8ff;color:#7c3aed;">After: ' + escH(depTask.title) + '</span>');
        }
      }
      if (badges.length > 0) {
        var badgeDiv = document.createElement('div');
        badgeDiv.className = 'gantt-task-badges';
        badgeDiv.innerHTML = badges.join('');
        titleSpan.appendChild(badgeDiv);
      }
    }

    // Inline edit row
    if (_editingTaskId === taskId && !document.getElementById('gantt-edit-row-' + taskId)) {
      var sVal = task.start_date || '';
      var dVal = task.duration_days || 1;
      var mVal = task.assigned_member_id || '';
      var dpVal = task.depends_on || '';

      var memberOpts2 = '<option value="">Unassigned</option>';
      for (var m = 0; m < teamMembers.length; m++) {
        memberOpts2 += '<option value="' + teamMembers[m].id + '"' + (mVal === teamMembers[m].id ? ' selected' : '') + '>' + escH(teamMembers[m].name) + '</option>';
      }
      var siblingTasks = jobTasks.filter(function(t) { return t.id !== taskId; });
      var depOpts2 = '<option value="">None</option>';
      for (var s = 0; s < siblingTasks.length; s++) {
        depOpts2 += '<option value="' + siblingTasks[s].id + '"' + (dpVal === siblingTasks[s].id ? ' selected' : '') + '>' + escH(siblingTasks[s].title) + '</option>';
      }

      var editRow = document.createElement('div');
      editRow.id = 'gantt-edit-row-' + taskId;
      editRow.className = 'gantt-sched-row';
      editRow.style.padding = '8px 0 8px 28px';
      editRow.innerHTML =
        '<label>Start</label><input type="date" id="gantt-edit-start-' + taskId + '" value="' + sVal + '" style="width:130px;">' +
        '<label>Days</label><input type="number" id="gantt-edit-dur-' + taskId + '" value="' + dVal + '" min="1" max="365" style="width:55px;">' +
        '<label>Worker</label><select id="gantt-edit-member-' + taskId + '" style="min-width:100px;">' + memberOpts2 + '</select>' +
        '<label>After</label><select id="gantt-edit-dep-' + taskId + '" style="min-width:100px;">' + depOpts2 + '</select>' +
        '<button class="gantt-sched-btn gantt-sched-save" onclick="saveTaskSchedule(\'' + taskId + '\')">Save</button>' +
        '<button class="gantt-sched-btn gantt-sched-cancel" onclick="cancelTaskScheduleEdit()">Cancel</button>';
      row.parentNode.insertBefore(editRow, row.nextSibling);
    }
  });
}

// MutationObserver
var _ganttObTimer = null;
var _ganttObs = new MutationObserver(function() {
  if (_ganttObTimer) clearTimeout(_ganttObTimer);
  _ganttObTimer = setTimeout(function() {
    var section = document.getElementById('job-tasks-section');
    if (section && !section.dataset.ganttEnhanced) {
      enhanceTaskSection();
    }
  }, 150);
});
_ganttObs.observe(document.body, { childList: true, subtree: true });

console.log('Gantt chart v2 loaded');

} catch(e) {
  console.error('Gantt init error:', e);
}
})();
