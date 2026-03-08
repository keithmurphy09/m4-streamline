// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Calendar Enhancement Override
// Makes multi-day jobs render as spanning colored bars
// ADDITIVE FILE - original schedule.js is NOT modified
// To revert: just remove this <script> tag from your HTML
// ═══════════════════════════════════════════════════════════════════

// Soft color palette for event bars (matches the clean scheduling look)
const _calendarBarColors = [
    { bg: '#DBEAFE', text: '#1e40af' },   // light blue
    { bg: '#FED7AA', text: '#9a3412' },   // peach / orange
    { bg: '#CFFAFE', text: '#155e75' },   // cyan
    { bg: '#FECDD3', text: '#9f1239' },   // pink
    { bg: '#D9F99D', text: '#3f6212' },   // light green
    { bg: '#E9D5FF', text: '#6b21a8' },   // lavender
    { bg: '#FEF08A', text: '#854d0e' },   // yellow
    { bg: '#FBCFE8', text: '#9d174d' },   // rose
];

// Assigns a consistent color per client_id so same client = same color
const _calendarColorMap = {};
let _calendarColorIndex = 0;

function _getCalendarBarColor(clientId) {
    if (!clientId) return _calendarBarColors[0];
    if (!_calendarColorMap[clientId]) {
        _calendarColorMap[clientId] = _calendarBarColors[_calendarColorIndex % _calendarBarColors.length];
        _calendarColorIndex++;
    }
    return _calendarColorMap[clientId];
}

// Override renderCalendar with spanning-bar version
renderCalendar = function() {
    var calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    calendarEl.innerHTML = '';

    var filteredJobs = jobs;
    if (calendarFilter !== 'all') {
        if (calendarFilter === 'unassigned') {
            filteredJobs = jobs.filter(function(job) {
                return !job.assigned_to && (!job.assigned_team_members || job.assigned_team_members.length === 0);
            });
        } else {
            filteredJobs = jobs.filter(function(job) {
                var teamIds = job.assigned_team_members || (job.assigned_to ? [job.assigned_to] : []);
                return teamIds.includes(calendarFilter);
            });
        }
    }

    var calendarEvents = filteredJobs.map(function(job) {
        var client = clients.find(function(c) { return c.id === job.client_id; });
        var assignedTeamIds = job.assigned_team_members || (job.assigned_to ? [job.assigned_to] : []);
        var assignedWorkers = assignedTeamIds.map(function(id) {
            return teamMembers.find(function(m) { return m.id === id; });
        }).filter(function(w) { return w; });

        var duration = parseInt(job.duration) || 1;

        // Build a clean title: "Job Title (Client Name)" or just job title
        var eventTitle = job.title;
        if (client) {
            eventTitle += ' (' + client.name + ')';
        }

        // Calculate end date (FullCalendar end date is exclusive, so +1 day)
        var parts = job.date.split('-').map(Number);
        var startDate = new Date(parts[0], parts[1] - 1, parts[2]);
        var endDate = new Date(parts[0], parts[1] - 1, parts[2] + duration);
        var endDateStr = endDate.getFullYear() + '-' +
            String(endDate.getMonth() + 1).padStart(2, '0') + '-' +
            String(endDate.getDate()).padStart(2, '0');

        // Pick color based on worker color or client-based palette
        var barColor;
        if (assignedWorkers.length > 0 && assignedWorkers[0].color) {
            // Use worker color with light background
            var wColor = assignedWorkers[0].color;
            barColor = { bg: wColor + '30', text: wColor };
        } else {
            barColor = _getCalendarBarColor(job.client_id);
        }

        return {
            title: eventTitle,
            start: job.date,
            end: duration > 1 ? endDateStr : null,
            allDay: true,
            backgroundColor: barColor.bg,
            borderColor: 'transparent',
            textColor: barColor.text,
            extendedProps: {
                jobId: job.id,
                jobTitle: job.title,
                clientName: client ? client.name : undefined,
                workers: assignedWorkers,
                duration: duration,
                dayNumber: 1
            }
        };
    });

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: calendarEvents,
        eventClick: function(info) {
            var job = jobs.find(function(j) { return j.id === info.event.extendedProps.jobId; });
            if (job) {
                scheduleView = 'list';
                openJobDetail(job);
            }
        },
        eventDidMount: function(info) {
            info.el.style.cursor = 'pointer';
            info.el.style.borderRadius = '3px';
            info.el.style.fontSize = '0.7rem';
            info.el.style.fontWeight = '500';
        },
        dayMaxEvents: 4,
        eventDisplay: 'block'
    });

    calendar.render();
};

console.log('✅ Calendar enhancement override loaded (spanning bars)');
