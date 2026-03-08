// M4 Calendar Tasks - Show individual trades/tasks on calendar
// Loads AFTER calendar-clean.js, wraps renderCalendar
// Jobs with scheduled tasks show each task as its own bar
// Jobs without scheduled tasks show the job bar (existing behavior)
(function(){
try {

var _origRenderCal = window.renderCalendar;

window.renderCalendar = function() {
try {
var el = document.getElementById('calendar');
if (!el) return;
el.innerHTML = '';

var allTasks = window.jobTasks || [];

// Filter jobs by worker (same logic as calendar-clean)
var fj = jobs;
if (calendarFilter !== 'all') {
if (calendarFilter === 'unassigned') {
fj = jobs.filter(function(j) {
return !j.assigned_to && (!j.assigned_team_members || j.assigned_team_members.length === 0);
});
} else {
fj = jobs.filter(function(j) {
var t = j.assigned_team_members || (j.assigned_to ? [j.assigned_to] : []);
// Also include jobs that have tasks assigned to this worker
var jobTasks = allTasks.filter(function(tk) { return tk.job_id === j.id; });
var hasTaskForWorker = false;
for (var ti = 0; ti < jobTasks.length; ti++) {
if (jobTasks[ti].assigned_member_id === calendarFilter) {
hasTaskForWorker = true;
break;
}
}
return t.indexOf(calendarFilter) !== -1 || hasTaskForWorker;
});
}
}

// Color palette fallback
var palette = [
{bg:'#DBEAFE',t:'#1e40af'},
{bg:'#FED7AA',t:'#9a3412'},
{bg:'#CFFAFE',t:'#155e75'},
{bg:'#FECDD3',t:'#9f1239'},
{bg:'#D9F99D',t:'#3f6212'},
{bg:'#E9D5FF',t:'#6b21a8'},
{bg:'#FEF08A',t:'#854d0e'},
{bg:'#FBCFE8',t:'#9d174d'}
];
var palMap = {};
var palIdx = 0;

function pickPalette(key) {
if (!key) return palette[0];
if (!palMap[key]) {
palMap[key] = palette[palIdx % palette.length];
palIdx++;
}
return palMap[key];
}

function makeEndStr(startStr, days) {
var p = startStr.split('-').map(Number);
var ed = new Date(p[0], p[1] - 1, p[2] + days);
return ed.getFullYear() + '-' +
String(ed.getMonth() + 1).padStart(2, '0') + '-' +
String(ed.getDate()).padStart(2, '0');
}

function findMember(id) {
if (!id) return null;
for (var i = 0; i < teamMembers.length; i++) {
if (teamMembers[i].id === id) return teamMembers[i];
}
return null;
}

var events = [];

for (var ji = 0; ji < fj.length; ji++) {
var job = fj[ji];
var cl = null;
for (var ci = 0; ci < clients.length; ci++) {
if (clients[ci].id === job.client_id) { cl = clients[ci]; break; }
}

// Get surname
var surname = '';
if (cl && cl.name) {
var np = cl.name.trim().split(' ');
surname = np[np.length - 1];
}

// Get address
var rq = null;
if (typeof quotes !== 'undefined') {
for (var qi = 0; qi < quotes.length; qi++) {
if (quotes[qi].title === job.title && quotes[qi].client_id === job.client_id) {
rq = quotes[qi];
break;
}
}
}
var addr = (rq && rq.job_address) || job.job_address || (cl && cl.address) || '';

// Get scheduled tasks for this job
var jobScheduledTasks = allTasks.filter(function(tk) {
return tk.job_id === job.id && tk.start_date;
});

// Apply worker filter to tasks too
if (calendarFilter !== 'all' && calendarFilter !== 'unassigned') {
jobScheduledTasks = jobScheduledTasks.filter(function(tk) {
return tk.assigned_member_id === calendarFilter ||
!tk.assigned_member_id; // Show unassigned tasks too
});
}

if (jobScheduledTasks.length > 0) {
// Show each scheduled task as its own calendar event
for (var ti = 0; ti < jobScheduledTasks.length; ti++) {
var task = jobScheduledTasks[ti];
var dur = task.duration_days || 1;
var mem = findMember(task.assigned_member_id);

// Title: Worker - Task - Surname
var titleParts = [];
if (mem) titleParts.push(mem.name);
titleParts.push(task.title);
if (surname) titleParts.push(surname);
var title = titleParts.join(' - ');

// Color by worker
var bc;
if (mem && mem.color) {
bc = {bg: mem.color + '30', t: mem.color};
} else {
bc = pickPalette(task.assigned_member_id || ('task-' + ti));
}

// Completed tasks get faded
var opacity = task.completed ? 0.45 : 1;

events.push({
title: title,
start: task.start_date,
end: dur > 1 ? makeEndStr(task.start_date, dur) : null,
allDay: true,
backgroundColor: bc.bg,
borderColor: 'transparent',
textColor: bc.t,
extendedProps: {
jobId: job.id,
taskId: task.id,
jobTitle: job.title,
taskTitle: task.title,
clientName: cl ? cl.name : undefined,
workerName: mem ? mem.name : undefined,
duration: dur,
isTask: true,
opacity: opacity
}
});
}
} else {
// No scheduled tasks: fall back to job-level bar (original behavior)
var jids = job.assigned_team_members || (job.assigned_to ? [job.assigned_to] : []);
var jworkers = [];
for (var wi = 0; wi < jids.length; wi++) {
var ww = findMember(jids[wi]);
if (ww) jworkers.push(ww);
}

var jdur = parseInt(job.duration) || 1;
var jtitleParts = [];
if (jworkers.length > 0) {
jtitleParts.push(jworkers.map(function(w) { return w.name; }).join(', '));
}
if (surname) jtitleParts.push(surname);
if (addr) jtitleParts.push(addr);
var jtitle = jtitleParts.length > 0 ? jtitleParts.join(' - ') : job.title;

var jbc;
if (jworkers.length > 0 && jworkers[0].color) {
jbc = {bg: jworkers[0].color + '30', t: jworkers[0].color};
} else {
jbc = pickPalette(job.client_id);
}

events.push({
title: jtitle,
start: job.date,
end: jdur > 1 ? makeEndStr(job.date, jdur) : null,
allDay: true,
backgroundColor: jbc.bg,
borderColor: 'transparent',
textColor: jbc.t,
extendedProps: {
jobId: job.id,
jobTitle: job.title,
clientName: cl ? cl.name : undefined,
workers: jworkers,
duration: jdur,
isTask: false
}
});
}
}

var cal = new FullCalendar.Calendar(el, {
initialView: 'dayGridMonth',
headerToolbar: {
left: 'prev,next today',
center: 'title',
right: 'dayGridMonth,timeGridWeek'
},
events: events,
eventClick: function(info) {
var j = null;
var jId = info.event.extendedProps.jobId;
for (var i = 0; i < jobs.length; i++) {
if (jobs[i].id === jId) { j = jobs[i]; break; }
}
if (j) {
scheduleView = 'list';
openJobDetail(j);
}
},
eventDidMount: function(info) {
info.el.style.cursor = 'pointer';
// Apply opacity for completed tasks
var opa = info.event.extendedProps.opacity;
if (opa && opa < 1) {
info.el.style.opacity = String(opa);
}
},
dayMaxEvents: 5,
eventDisplay: 'block'
});

cal.render();
} catch (err) {
console.error('Calendar tasks render error:', err);
// Fallback to original
if (_origRenderCal) _origRenderCal();
}
};

console.log('Calendar tasks enhancement loaded');

} catch(e) {
console.error('Calendar tasks init error:', e);
}
})();
