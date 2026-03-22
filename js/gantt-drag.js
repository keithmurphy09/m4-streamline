// M4 Gantt Interactive - Drag & Resize
// Additive only - enhances existing gantt bars
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.gantt-bar{cursor:grab !important;user-select:none;-webkit-user-select:none}',
'.gantt-bar.gd-dragging{cursor:grabbing !important;opacity:0.85;z-index:20;box-shadow:0 4px 12px rgba(0,0,0,0.2) !important}',
'.gd-handle{position:absolute;top:0;width:8px;height:100%;cursor:ew-resize;z-index:10}',
'.gd-handle-left{left:-2px;border-radius:4px 0 0 4px}',
'.gd-handle-right{right:-2px;border-radius:0 4px 4px 0}',
'.gd-handle:hover{background:rgba(255,255,255,0.3)}',
'.gd-ghost{position:absolute;border-radius:4px;border:2px dashed #0d9488;background:rgba(13,148,136,0.1);pointer-events:none;z-index:15}',
'.gd-snap-line{position:absolute;top:0;width:1px;background:#0d9488;z-index:15;pointer-events:none;opacity:0.5}'
].join('\n');
document.head.appendChild(css);

// State
var _gdActive = false;
var _gdMode = null; // 'move' | 'resize-left' | 'resize-right'
var _gdBar = null;
var _gdStartX = 0;
var _gdOrigLeft = 0;
var _gdOrigWidth = 0;
var _gdTaskId = null;
var _gdTaskRow = null;
var _gdCanvas = null;
var _gdDayW = 22;
var _gdAllDays = [];
var _gdGhost = null;

function getDayW() {
  return (typeof ganttScale !== 'undefined' && ganttScale === 'week') ? 40 : 22;
}

// Parse the date range from the gantt header
function parseGanttDates() {
  var days = [];
  var canvas = document.getElementById('gantt-canvas');
  if (!canvas) return days;

  var dayW = getDayW();
  var totalW = canvas.offsetWidth || parseInt(canvas.style.width) || 0;
  var numDays = Math.round(totalW / dayW);

  // Find first date from header cells
  var headerCells = document.querySelectorAll('.gantt-tl-hd div div');
  // The month groups tell us the date range
  // Simpler approach: read from the existing rows data

  // Get the date range by finding the earliest task
  var earliest = null;
  if (typeof jobs !== 'undefined') {
    jobs.forEach(function(j) {
      if (j.start_date) {
        var d = new Date(j.start_date + 'T00:00:00');
        if (!earliest || d < earliest) earliest = d;
      }
    });
  }
  if (typeof window.jobTasks !== 'undefined') {
    window.jobTasks.forEach(function(t) {
      if (t.start_date) {
        var d = new Date(t.start_date + 'T00:00:00');
        if (!earliest || d < earliest) earliest = d;
      }
    });
  }

  if (!earliest) earliest = new Date();

  // Gantt starts 7 days before earliest
  var start = new Date(earliest);
  start.setDate(start.getDate() - 7);

  for (var i = 0; i < numDays; i++) {
    var d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  return days;
}

function dateToStr(d) {
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + dd;
}

// Match a bar to its task by y-position
function matchBarToTask(bar) {
  var barTop = parseInt(bar.style.top) || 0;
  var dayW = getDayW();
  var barLeft = parseInt(bar.style.left) || 0;
  var barWidth = parseInt(bar.style.width) || 0;

  // Calculate day index from left position
  var dayIdx = Math.round((barLeft - 2) / dayW);
  var duration = Math.max(1, Math.round((barWidth + 4) / dayW));

  // Find matching task by start_date and duration
  var allDays = parseGanttDates();
  if (dayIdx < 0 || dayIdx >= allDays.length) return null;

  var barDate = dateToStr(allDays[dayIdx]);

  var match = null;
  if (typeof window.jobTasks !== 'undefined') {
    window.jobTasks.forEach(function(t) {
      if (t.start_date === barDate && (t.duration_days || 1) === duration) {
        match = t;
      }
    });
    // If no exact match, try just by date
    if (!match) {
      window.jobTasks.forEach(function(t) {
        if (t.start_date === barDate && !match) {
          match = t;
        }
      });
    }
  }

  return match;
}

// Enhance bars after gantt renders
function enhanceBars() {
  var canvas = document.getElementById('gantt-canvas');
  if (!canvas) return;
  if (canvas.dataset.gdEnhanced) return;
  canvas.dataset.gdEnhanced = 'true';

  _gdDayW = getDayW();
  _gdAllDays = parseGanttDates();
  _gdCanvas = canvas;

  var bars = canvas.querySelectorAll('.gantt-bar');
  bars.forEach(function(bar) {
    // Skip if already enhanced
    if (bar.dataset.gdReady) return;
    bar.dataset.gdReady = 'true';

    // Add resize handles
    var handleL = document.createElement('div');
    handleL.className = 'gd-handle gd-handle-left';
    handleL.addEventListener('mousedown', function(e) { startResize(e, bar, 'resize-left'); });
    handleL.addEventListener('touchstart', function(e) { startResize(e, bar, 'resize-left'); }, { passive: false });

    var handleR = document.createElement('div');
    handleR.className = 'gd-handle gd-handle-right';
    handleR.addEventListener('mousedown', function(e) { startResize(e, bar, 'resize-right'); });
    handleR.addEventListener('touchstart', function(e) { startResize(e, bar, 'resize-right'); }, { passive: false });

    bar.appendChild(handleL);
    bar.appendChild(handleR);
    bar.style.position = 'absolute';

    // Drag to move
    bar.addEventListener('mousedown', function(e) {
      if (e.target.classList.contains('gd-handle')) return;
      startDrag(e, bar);
    });
    bar.addEventListener('touchstart', function(e) {
      if (e.target.classList.contains('gd-handle')) return;
      startDrag(e, bar);
    }, { passive: false });
  });
}

function getClientX(e) {
  if (e.touches && e.touches.length > 0) return e.touches[0].clientX;
  return e.clientX;
}

function startDrag(e, bar) {
  e.preventDefault();
  e.stopPropagation();

  _gdActive = true;
  _gdMode = 'move';
  _gdBar = bar;
  _gdStartX = getClientX(e);
  _gdOrigLeft = parseInt(bar.style.left) || 0;
  _gdOrigWidth = parseInt(bar.style.width) || 0;

  bar.classList.add('gd-dragging');

  // Remove the onclick temporarily
  bar._origOnclick = bar.getAttribute('onclick');
  bar.removeAttribute('onclick');
}

function startResize(e, bar, mode) {
  e.preventDefault();
  e.stopPropagation();

  _gdActive = true;
  _gdMode = mode;
  _gdBar = bar;
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

  // Snap to day grid
  var daySnap = Math.round(dx / dayW) * dayW;

  if (_gdMode === 'move') {
    var newLeft = _gdOrigLeft + daySnap;
    if (newLeft < 2) newLeft = 2;
    _gdBar.style.left = newLeft + 'px';
  } else if (_gdMode === 'resize-right') {
    var newWidth = _gdOrigWidth + daySnap;
    if (newWidth < dayW - 4) newWidth = dayW - 4;
    _gdBar.style.width = newWidth + 'px';
  } else if (_gdMode === 'resize-left') {
    var newLeft2 = _gdOrigLeft + daySnap;
    var newWidth2 = _gdOrigWidth - daySnap;
    if (newWidth2 < dayW - 4) return;
    if (newLeft2 < 2) return;
    _gdBar.style.left = newLeft2 + 'px';
    _gdBar.style.width = newWidth2 + 'px';
  }
}

async function onEnd(e) {
  if (!_gdActive || !_gdBar) return;

  _gdBar.classList.remove('gd-dragging');

  var dayW = getDayW();
  var newLeft = parseInt(_gdBar.style.left) || 0;
  var newWidth = parseInt(_gdBar.style.width) || 0;

  // Calculate new day index and duration
  var newDayIdx = Math.round((newLeft - 2) / dayW);
  var newDuration = Math.max(1, Math.round((newWidth + 4) / dayW));

  // Restore onclick after a tick (prevents click from firing)
  var bar = _gdBar;
  var origClick = bar._origOnclick;
  setTimeout(function() {
    if (origClick) bar.setAttribute('onclick', origClick);
  }, 100);

  // Check if anything actually changed
  var origDayIdx = Math.round((_gdOrigLeft - 2) / dayW);
  var origDuration = Math.max(1, Math.round((_gdOrigWidth + 4) / dayW));

  if (newDayIdx === origDayIdx && newDuration === origDuration) {
    _gdActive = false;
    _gdBar = null;
    return;
  }

  // Find the task this bar belongs to
  var allDays = parseGanttDates();
  if (newDayIdx < 0 || newDayIdx >= allDays.length) {
    _gdActive = false;
    _gdBar = null;
    renderApp();
    return;
  }

  var newStartDate = dateToStr(allDays[newDayIdx]);
  var origStartDate = (origDayIdx >= 0 && origDayIdx < allDays.length) ? dateToStr(allDays[origDayIdx]) : null;

  // Match to task using original position
  var task = null;
  if (typeof window.jobTasks !== 'undefined' && origStartDate) {
    // Try exact match first
    window.jobTasks.forEach(function(t) {
      if (t.start_date === origStartDate && (t.duration_days || 1) === origDuration && !task) {
        task = t;
      }
    });
    // Fallback: date only
    if (!task) {
      window.jobTasks.forEach(function(t) {
        if (t.start_date === origStartDate && !task) {
          task = t;
        }
      });
    }
  }

  if (!task) {
    console.warn('Gantt drag: Could not match bar to task');
    _gdActive = false;
    _gdBar = null;
    renderApp();
    return;
  }

  // Save to Supabase
  try {
    var updateData = {
      start_date: newStartDate,
      duration_days: newDuration
    };

    var result = await supabaseClient.from('job_tasks').update(updateData).eq('id', task.id);
    if (result.error) throw result.error;

    // Update local data
    task.start_date = newStartDate;
    task.duration_days = newDuration;

    showNotification('Task moved to ' + newStartDate + ' (' + newDuration + ' day' + (newDuration > 1 ? 's' : '') + ')', 'success');
  } catch (err) {
    console.error('Gantt drag save error:', err);
    showNotification('Error updating task: ' + err.message, 'error');
  }

  _gdActive = false;
  _gdBar = null;

  // Re-render to update everything
  renderApp();
}

// Global mouse/touch listeners
document.addEventListener('mousemove', onMove);
document.addEventListener('mouseup', onEnd);
document.addEventListener('touchmove', onMove, { passive: false });
document.addEventListener('touchend', onEnd);

// Observer to enhance bars after gantt renders
var _gdTimer = null;
new MutationObserver(function() {
  if (_gdTimer) clearTimeout(_gdTimer);
  _gdTimer = setTimeout(function() {
    if (typeof activeTab !== 'undefined' && activeTab !== 'schedule') return;
    var canvas = document.getElementById('gantt-canvas');
    if (canvas && !canvas.dataset.gdEnhanced) {
      enhanceBars();
    }
  }, 300);
}).observe(document.body, { childList: true, subtree: true });

console.log('Gantt interactive drag loaded');

} catch(e) {
  console.error('Gantt drag error:', e);
}
})();
