// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Calendar Clean Design Enhancement
// Single file: injects CSS + overrides calendar rendering
// To revert: remove this one script tag from index.html
// ═══════════════════════════════════════════════════════════════════

(function() {
    'use strict';

    // --- Inject calendar styles ---
    var style = document.createElement('style');
    style.textContent = '' +
        '.fc .fc-toolbar { margin-bottom: 0.75rem !important; }' +
        '.fc .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 600 !important; color: #2563eb !important; }' +
        '.fc .fc-button { background-color: #fff !important; border: 1px solid #d1d5db !important; color: #374151 !important; font-size: 0.8125rem !important; font-weight: 500 !important; padding: 0.3rem 0.75rem !important; box-shadow: none !important; text-transform: capitalize !important; border-radius: 0.375rem !important; }' +
        '.fc .fc-button:hover { background-color: #f3f4f6 !important; border-color: #9ca3af !important; }' +
        '.fc .fc-button:focus { box-shadow: none !important; outline: none !important; }' +
        '.fc .fc-button-active { background-color: #eff6ff !important; border-color: #2563eb !important; color: #2563eb !important; font-weight: 600 !important; }' +
        '.fc .fc-today-button:disabled { opacity: 0.5 !important; background-color: #fff !important; border-color: #d1d5db !important; color: #9ca3af !important; }' +
        '.fc .fc-col-header-cell { background-color: #fff !important; border-color: #e5e7eb !important; padding: 0.5rem 0 !important; }' +
        '.fc .fc-col-header-cell-cushion { font-weight: 600 !important; font-size: 0.8125rem !important; color: #6b7280 !important; text-decoration: none !important; }' +
        '.fc .fc-scrollgrid { border-color: #e5e7eb !important; }' +
        '.fc .fc-scrollgrid td, .fc .fc-scrollgrid th { border-color: #e5e7eb !important; }' +
        '.fc .fc-daygrid-day { border-color: #e5e7eb !important; }' +
        '.fc .fc-daygrid-day-frame { min-height: 5rem; }' +
        '.fc .fc-daygrid-day-number { font-size: 0.8125rem !important; font-weight: 500 !important; color: #6b7280 !important; padding: 0.35rem 0.5rem !important; text-decoration: none !important; }' +
        '.fc .fc-day-today { background-color: #fefce8 !important; }' +
        '.fc .fc-day-today .fc-daygrid-day-number { color: #1d4ed8 !important; font-weight: 700 !important; }' +
        '.fc .fc-daygrid-event { border-radius: 3px !important; border: none !important; padding: 2px 8px !important; margin-bottom: 2px !important; margin-left: 2px !important; margin-right: 2px !important; font-size: 0.7rem !important; line-height: 1.5 !important; cursor: pointer !important; }' +
        '.fc .fc-daygrid-event .fc-event-title { font-weight: 500 !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }' +
        '.fc .fc-event-time { display: none !important; }' +
        '.fc .fc-daygrid-event-harness { margin-bottom: 1px !important; }' +
        '.fc .fc-daygrid-more-link { font-size: 0.7rem !important; color: #2563eb !important; font-weight: 500 !important; }' +
        '.fc .fc-day-other .fc-daygrid-day-number { color: #d1d5db !important; }' +
        '.dark .fc .fc-toolbar-title { color: #60a5fa !important; }' +
        '.dark .fc .fc-button { background-color: #1f2937 !important; border-color: #374151 !important; color: #d1d5db !important; }' +
        '.dark .fc .fc-button:hover { background-color: #374151 !important; }' +
        '.dark .fc .fc-button-active { background-color: #1e3a5f !important; border-color: #3b82f6 !important; color: #93c5fd !important; }' +
        '.dark .fc .fc-col-header-cell { background-color: #111827 !important; border-color: #374151 !important; }' +
        '.dark .fc .fc-col-header-cell-cushion { color: #9ca3af !important; }' +
        '.dark .fc .fc-scrollgrid, .dark .fc .fc-scrollgrid td, .dark .fc .fc-scrollgrid th { border-color: #374151 !important; }' +
        '.dark .fc .fc-daygrid-day { border-color: #374151 !important; }' +
        '.dark .fc .fc-daygrid-day-number { color: #9ca3af !important; }' +
        '.dark .fc .fc-day-today { background-color: rgba(254, 249, 195, 0.05) !important; }' +
        '.dark .fc .fc-day-today .fc-daygrid-day-number { color: #93c5fd !important; }' +
        '.dark .fc .fc-day-other .fc-daygrid-day-number { color: #4b5563 !important; }';
    document.head.appendChild(style);

    // --- Color palette for event bars ---
    var barColors = [
        { bg: '#DBEAFE', text: '#1e40af' },
        { bg: '#FED7AA', text: '#9a3412' },
        { bg: '#CFFAFE', text: '#155e75' },
        { bg: '#FECDD3', text: '#9f1239' },
        { bg: '#D9F99D', text: '#3f6212' },
        { bg: '#E9D5FF', text: '#6b21a8' },
        { bg: '#FEF08A', text: '#854d0e' },
        { bg: '#FBCFE8', text: '#9d174d' }
    ];
    var colorMap = {};
    var colorIndex = 0;

    function getBarColor(clientId) {
        if (!clientId) return barColors[0];
        if (!colorMap[clientId]) {
            colorMap[clientId] = barColors[colorIndex % barColors.length];
            colorIndex++;
        }
        return colorMap[clientId];
    }

    // --- Override renderCalendar ---
    window.renderCalendar = function() {
        try {
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

                var eventTitle = job.title;
                if (client) {
                    eventTitle += ' (' + client.name + ')';
                }

                var parts = job.date.split('-').map(Number);
                var endDate = new Date(parts[0], parts[1] - 1, parts[2] + duration);
                var endDateStr = endDate.getFullYear() + '-' +
                    String(endDate.getMonth() + 1).padStart(2, '0') + '-' +
                    String(endDate.getDate()).padStart(2, '0');

                var barColor;
                if (assignedWorkers.length > 0 && assignedWorkers[0].color) {
                    var wColor = assignedWorkers[0].color;
                    barColor = { bg: wColor + '30', text: wColor };
                } else {
                    barColor = getBarColor(job.client_id);
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
        } catch (err) {
            console.error('Calendar enhancement error:', err);
        }
    };

    console.log('✅ Calendar enhancement loaded (clean design + spanning bars)');
})();
