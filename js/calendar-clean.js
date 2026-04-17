// M4 Calendar Clean Design
(function(){
try {

var st = document.createElement('style');
st.textContent = '.fc .fc-daygrid-event .fc-event-title{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;font-size:.7rem!important;line-height:1.4!important}.fc .fc-daygrid-event{padding:2px 6px!important;border-radius:3px!important;border:none!important;cursor:pointer!important}.fc .fc-event-time{display:none!important}';
document.head.appendChild(st);

var colors = [
{bg:'#DBEAFE',t:'#1e40af'},
{bg:'#FED7AA',t:'#9a3412'},
{bg:'#CFFAFE',t:'#155e75'},
{bg:'#FECDD3',t:'#9f1239'},
{bg:'#D9F99D',t:'#3f6212'},
{bg:'#E9D5FF',t:'#6b21a8'},
{bg:'#FEF08A',t:'#854d0e'},
{bg:'#FBCFE8',t:'#9d174d'}
];
var cmap = {};
var cidx = 0;

function pickColor(clientId) {
if (!clientId) return colors[0];
if (!cmap[clientId]) {
cmap[clientId] = colors[cidx % colors.length];
cidx++;
}
return cmap[clientId];
}

window.renderCalendar = function() {
try {
var el = document.getElementById('calendar');
if (!el) return;
el.innerHTML = '';

var fj = jobs;
if (calendarFilter !== 'all') {
if (calendarFilter === 'unassigned') {
fj = jobs.filter(function(j) {
return !j.assigned_to && (!j.assigned_team_members || j.assigned_team_members.length === 0);
});
} else {
fj = jobs.filter(function(j) {
var t = j.assigned_team_members || (j.assigned_to ? [j.assigned_to] : []);
return t.includes(calendarFilter);
});
}
}

var events = fj.map(function(job) {
var cl = clients.find(function(c) { return c.id === job.client_id; });
var ids = job.assigned_team_members || (job.assigned_to ? [job.assigned_to] : []);
var workers = ids.map(function(id) {
return teamMembers.find(function(m) { return m.id === id; });
}).filter(function(w) { return w; });

var dur = parseInt(job.duration) || 1;

// Build title: Installer - Customer Surname - Address
var titleParts = [];

// Installer name(s)
if (workers.length > 0) {
titleParts.push(workers.map(function(w) { return w.name; }).join(', '));
}

// Customer surname
if (cl && cl.name) {
var nameParts = cl.name.trim().split(' ');
titleParts.push(nameParts[nameParts.length - 1]);
}

// Site address
var rq = typeof quotes !== 'undefined' ? quotes.find(function(q) { return q.title === job.title && q.client_id === job.client_id; }) : null;
var addr = (rq && rq.job_address) || job.job_address || (cl && cl.address) || '';
if (addr) titleParts.push(addr);

var title = titleParts.length > 0 ? titleParts.join(' - ') : job.title;

var parts = job.date.split('-').map(Number);
var endDt = new Date(parts[0], parts[1] - 1, parts[2] + dur);
var endStr = endDt.getFullYear() + '-' + String(endDt.getMonth() + 1).padStart(2, '0') + '-' + String(endDt.getDate()).padStart(2, '0');

var bc;
if (workers.length > 0 && workers[0].color) {
bc = {bg: workers[0].color + '30', t: workers[0].color};
} else {
bc = pickColor(job.client_id);
}

return {
title: title,
start: job.date,
end: dur > 1 ? endStr : null,
allDay: true,
backgroundColor: bc.bg,
borderColor: 'transparent',
textColor: bc.t,
extendedProps: {
jobId: job.id,
jobTitle: job.title,
clientName: cl ? cl.name : undefined,
workers: workers,
duration: dur,
dayNumber: 1
}
};
});

var cal = new FullCalendar.Calendar(el, {
  height: 'auto',
  initialView: 'dayGridMonth',
headerToolbar: {
left: 'prev,next today',
center: 'title',
right: 'dayGridMonth,timeGridWeek'
},
events: events,
eventClick: function(info) {
var j = jobs.find(function(x) { return x.id === info.event.extendedProps.jobId; });
if (j) {
scheduleView = 'list';
openJobDetail(j);
}
},
eventDidMount: function(info) {
info.el.style.cursor = 'pointer';
},
dayMaxEvents: 4,
eventDisplay: 'block'
});

cal.render();
} catch (err) {
console.error('Calendar render error:', err);
}
};

console.log('Calendar clean design loaded');

} catch (e) {
console.error('Calendar init error:', e);
}
})();
