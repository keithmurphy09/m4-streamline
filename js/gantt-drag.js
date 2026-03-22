// M4 Gantt Interactive Drag v3
// Uses sidebar DOM to match bars to task IDs
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.gantt-bar{cursor:grab !important;user-select:none;-webkit-user-select:none}',
'.gantt-bar.gd-dragging{cursor:grabbing !important;opacity:0.85;z-index:20;box-shadow:0 4px 12px rgba(0,0,0,0.2) !important}',
'.gd-handle{position:absolute;top:0;width:8px;height:100%;cursor:ew-resize;z-index:10}',
'.gd-handle-left{left:-2px;border-radius:4px 0 0 4px}',
'.gd-handle-right{right:-2px;border-radius:0 4px 4px 0}',
'.gd-handle:hover{background:rgba(255,255,255,0.3)}'
].join('\n');
document.head.appendChild(css);

var ROW_H = 38;
var JOB_H = 42;

var _gdActive = false;
var _gdMode = null;
var _gdBar = null;
var _gdStartX = 0;
var _gdOrigLeft = 0;
var _gdOrigWidth = 0;
var _gdTaskId = null;

function getDayW() {
  return (typeof ganttScale !== 'undefined' && ganttScale === 'week') ? 40 : 22;
}

// Build y-position to taskId map from sidebar DOM
function buildRowMap() {
  var map = {};
  var sb = document.querySelector('.gantt-sb');
  if (!sb) return map;

  var rows = sb.querySelectorAll('.gantt-row');
  var yOff = 0;
  var currentJobId = null;
  var currentJobTasks = [];
  var taskIndex = 0;

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var isJob = row.classList.contains('gantt-job-row');
    var isTask = row.classList.contains('gantt-task-row');

    if (isJob) {
      // Extract job ID from onclick
      var onclick = row.getAttribute('onclick') || '';
      var jm = onclick.match(/toggleGanttJob\(['"]([^'"]+)['"]\)/);
      if (jm) {
        currentJobId = jm[1];
        // Get all tasks for this job, sorted same as gantt
        var allTasks = window.jobTasks || [];
        currentJobTasks = allTasks.filter(function(t) { return t.job_id === currentJobId; });
        currentJobTasks.sort(function(a, b) {
          var sa = a.sort_order || 0; var sb2 = b.sort_order || 0;
          if (sa !== sb2) return sa - sb2;
          if (a.start_date && b.start_date) return a.start_date < b.start_date ? -1 : 1;
          if (a.start_date) return -1;
          if (b.start_date) return 1;
          return 0;
        });
        taskIndex = 0;
      }
      yOff += JOB_H;
    } else if (isTask) {
      var barTop = yOff + 5;
      if (currentJobTasks.length > 0 && taskIndex < currentJobTasks.length) {
        var task = currentJobTasks[taskIndex];
        if (task && task.start_date) {
          map[barTop] = task.id;
        }
        taskIndex++;
      }
      yOff += ROW_H;
    }
  }

  return map;
}

// Build date array for position-to-date conversion
function buildDateArray() {
  var allTasks = window.jobTasks || [];
  var fj = (typeof jobs !== 'undefined' ? jobs : []).filter(function(j) {
    return j.status !== 'completed';
  });

  var minD = null;
  var maxD = null;

  for (var i = 0; i < fj.length; i++) {
    var sd = fj[i].date ? new Date(fj[i].date + 'T00:00:00') : null;
    if (!sd || isNaN(sd.getTime())) continue;
    var dur = parseInt(fj[i].duration) || 1;
    var ed = new Date(sd); ed.setDate(ed.getDate() + dur);
    if (!minD || sd < minD) minD = new Date(sd);
    if (!maxD || ed > maxD) maxD = new Date(ed);
  }
  for (var i2 = 0; i2 < allTasks.length; i2++) {
    if (!allTasks[i2].start_date) continue;
    var td = new Date(allTasks[i2].start_date + 'T00:00:00');
    if (isNaN(td.getTime())) continue;
    var tDur = allTasks[i2].duration_days || 1;
    var te = new Date(td); te.setDate(te.getDate() + tDur);
    if (!minD || td < minD) minD = new Date(td);
    if (!maxD || te > maxD) maxD = new Date(te);
  }

  if (!minD) minD = new Date();
  if (!maxD) { maxD = new Date(minD); maxD.setDate(maxD.getDate() + 30); }

  var start = new Date(minD); start.setDate(start.getDate() - 7);
  var end = new Date(maxD); end.setDate(end.getDate() + 14);

  var days = [];
  var cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function dateToStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function getClientX(e) {
  return (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
}

function enhanceBars() {
  var canvas = document.getElementById('gantt-canvas');
  if (!canvas || canvas.dataset.gdDone) return;
  canvas.dataset.gdDone = 'true';

  var rowMap = buildRowMap();
  var bars = canvas.querySelectorAll('.gantt-bar');

  bars.forEach(function(bar) {
    if (bar.dataset.gdReady) return;
    bar.dataset.gdReady = 'true';

    var barTop = parseInt(bar.style.top) || 0;
    var taskId = null;

    // Try exact match and nearby offsets
    for (var offset = -3; offset <= 3; offset++) {
      if (rowMap[barTop + offset]) { taskId = rowMap[barTop + offset]; break; }
    }

    if (!taskId) return;
    bar.dataset.taskId = taskId;

    // Resize handles
    var hL = document.createElement('div');
    hL.className = 'gd-handle gd-handle-left';
    hL.addEventListener('mousedown', function(e) { startAction(e, bar, 'resize-left'); });
    hL.addEventListener('touchstart', function(e) { startAction(e, bar, 'resize-left'); }, { passive: false });

    var hR = document.createElement('div');
    hR.className = 'gd-handle gd-handle-right';
    hR.addEventListener('mousedown', function(e) { startAction(e, bar, 'resize-right'); });
    hR.addEventListener('touchstart', function(e) { startAction(e, bar, 'resize-right'); }, { passive: false });

    bar.appendChild(hL);
    bar.appendChild(hR);

    // Drag to move
    bar.addEventListener('mousedown', function(e) {
      if (e.target.classList.contains('gd-handle')) return;
      startAction(e, bar, 'move');
    });
    bar.addEventListener('touchstart', function(e) {
      if (e.target.classList.contains('gd-handle')) return;
      startAction(e, bar, 'move');
    }, { passive: false });
  });

  var count = 0;
  bars.forEach(function(b) { if (b.dataset.taskId) count++; });
  console.log('Gantt drag: enhanced ' + count + ' bars');
}

function startAction(e, bar, mode) {
  e.preventDefault();
  e.stopPropagation();
  if (!bar.dataset.taskId) return;

  _gdActive = true;
  _gdMode = mode;
  _gdBar = bar;
  _gdTaskId = bar.dataset.taskId;
  _gdStartX = getClientX(e);
  _gdOrigLeft = parseInt(bar.style.left) || 0;
  _gdOrigWidth = parseInt(bar.style.width) || 0;

  bar.classList.add('gd-dragging');
  bar._origOnclick = bar.getAttribute('onclick');
  bar.removeAttribute('onclick');
}

function onMove(e) {
  if (!_gdActive || !_gdBar) return;
  e.preventDefault();

  var dx = getClientX(e) - _gdStartX;
  var dayW = getDayW();
  var snap = Math.round(dx / dayW) * dayW;

  if (_gdMode === 'move') {
    _gdBar.style.left = Math.max(2, _gdOrigLeft + snap) + 'px';
  } else if (_gdMode === 'resize-right') {
    _gdBar.style.width = Math.max(dayW - 4, _gdOrigWidth + snap) + 'px';
  } else if (_gdMode === 'resize-left') {
    var nL = _gdOrigLeft + snap;
    var nW = _gdOrigWidth - snap;
    if (nW >= dayW - 4 && nL >= 2) {
      _gdBar.style.left = nL + 'px';
      _gdBar.style.width = nW + 'px';
    }
  }
}

async function onEnd() {
  if (!_gdActive || !_gdBar) return;
  _gdBar.classList.remove('gd-dragging');

  var dayW = getDayW();
  var newLeft = parseInt(_gdBar.style.left) || 0;
  var newWidth = parseInt(_gdBar.style.width) || 0;
  var bar = _gdBar;
  var origClick = bar._origOnclick;
  setTimeout(function() { if (origClick) bar.setAttribute('onclick', origClick); }, 100);

  var origDayIdx = Math.round((_gdOrigLeft - 2) / dayW);
  var newDayIdx = Math.round((newLeft - 2) / dayW);
  var origDur = Math.max(1, Math.round((_gdOrigWidth + 4) / dayW));
  var newDur = Math.max(1, Math.round((newWidth + 4) / dayW));

  if (newDayIdx === origDayIdx && newDur === origDur) {
    _gdActive = false; _gdBar = null; _gdTaskId = null;
    return;
  }

  var allDays = buildDateArray();
  if (newDayIdx < 0 || newDayIdx >= allDays.length) {
    _gdActive = false; _gdBar = null; _gdTaskId = null;
    renderApp();
    return;
  }

  var newDate = dateToStr(allDays[newDayIdx]);
  var taskId = _gdTaskId;

  try {
    var r = await supabaseClient.from('job_tasks').update({ start_date: newDate, duration_days: newDur }).eq('id', taskId);
    if (r.error) throw r.error;

    var task = (window.jobTasks || []).find(function(t) { return t.id === taskId; });
    if (task) { task.start_date = newDate; task.duration_days = newDur; }

    showNotification('Task: ' + newDate + ' (' + newDur + ' day' + (newDur > 1 ? 's' : '') + ')', 'success');
  } catch (err) {
    console.error('Gantt drag error:', err);
    showNotification('Error: ' + err.message, 'error');
  }

  _gdActive = false; _gdBar = null; _gdTaskId = null;
  renderApp();
}

document.addEventListener('mousemove', onMove);
document.addEventListener('mouseup', onEnd);
document.addEventListener('touchmove', onMove, { passive: false });
document.addEventListener('touchend', onEnd);

var _gdTimer = null;
new MutationObserver(function() {
  if (_gdTimer) clearTimeout(_gdTimer);
  _gdTimer = setTimeout(function() {
    if (typeof activeTab !== 'undefined' && activeTab !== 'schedule') return;
    var canvas = document.getElementById('gantt-canvas');
    if (canvas && !canvas.dataset.gdDone) enhanceBars();
  }, 300);
}).observe(document.body, { childList: true, subtree: true });

console.log('Gantt drag v3 loaded');

} catch(e) {
  console.error('Gantt drag error:', e);
}
})();
