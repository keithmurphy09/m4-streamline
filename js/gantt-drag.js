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

// Derive the gantt start date from a known bar position
function getGanttStartDate() {
  var dayW = getDayW();
  var allTasks = window.jobTasks || [];
  var canvas = document.getElementById('gantt-canvas');
  if (!canvas) return null;

  // Find any bar with a known task
  var bars = canvas.querySelectorAll('.gantt-bar[data-task-id]');
  for (var i = 0; i < bars.length; i++) {
    var tid = bars[i].dataset.taskId;
    var task = allTasks.find(function(t) { return t.id === tid; });
    if (task && task.start_date) {
      var barL = parseInt(bars[i].style.left) || 0;
      var dayIdx = Math.round((barL - 2) / dayW);
      var taskDate = new Date(task.start_date + 'T00:00:00');
      // Gantt start = task date minus dayIdx
      var ganttStart = new Date(taskDate);
      ganttStart.setDate(ganttStart.getDate() - dayIdx);
      return ganttStart;
    }
  }

  // Fallback: use job dates
  var fj = (typeof jobs !== 'undefined' ? jobs : []).filter(function(j) { return j.date && j.status !== 'completed'; });
  if (fj.length > 0) {
    fj.sort(function(a, b) { return a.date < b.date ? -1 : 1; });
    var earliest = new Date(fj[0].date + 'T00:00:00');
    earliest.setDate(earliest.getDate() - 7);
    return earliest;
  }

  return new Date();
}

function dayIdxToDate(dayIdx) {
  var start = getGanttStartDate();
  if (!start) return null;
  var d = new Date(start);
  d.setDate(d.getDate() + dayIdx);
  return d;
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

  var newDate = dayIdxToDate(newDayIdx);
  if (!newDate) {
    _gdActive = false; _gdBar = null; _gdTaskId = null;
    renderApp();
    return;
  }
  var newDateStr = dateToStr(newDate);
  var taskId = _gdTaskId;

  try {
    var r = await supabaseClient.from('job_tasks').update({ start_date: newDateStr, duration_days: newDur }).eq('id', taskId);
    if (r.error) throw r.error;

    var task = (window.jobTasks || []).find(function(t) { return t.id === taskId; });
    if (task) { task.start_date = newDateStr; task.duration_days = newDur; }

    showNotification('Task: ' + newDateStr + ' (' + newDur + ' day' + (newDur > 1 ? 's' : '') + ')', 'success');
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
