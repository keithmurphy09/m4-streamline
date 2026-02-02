// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Schedule Module
// ═══════════════════════════════════════════════════════════════════

function renderSchedule() {
    const viewToggle = `<div class="flex gap-2"><button onclick="scheduleView='list'; renderApp();" class="px-3 py-2 rounded text-sm ${scheduleView === 'list' ? 'bg-black text-white border-teal-400' : 'bg-white text-black border-gray-300'} border">List</button><button onclick="scheduleView='calendar'; renderApp();" class="px-3 py-2 rounded text-sm ${scheduleView === 'calendar' ? 'bg-black text-white border-teal-400' : 'bg-white text-black border-gray-300'} border">Calendar</button></div>`;
    
    const workerFilter = getAccountType() === 'business' && teamMembers.length > 0 
        ? `<select onchange="calendarFilter=this.value; renderApp();" class="px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white text-sm">
            <option value="all" ${calendarFilter === 'all' ? 'selected' : ''}>All Workers</option>
            <option value="unassigned" ${calendarFilter === 'unassigned' ? 'selected' : ''}>Unassigned</option>
            ${teamMembers.map(m => `<option value="${m.id}" ${calendarFilter === m.id ? 'selected' : ''}>${m.name}${m.occupation ? ' - ' + m.occupation : ''}</option>`).join('')}
           </select>`
        : '';
    
    if (scheduleView === 'calendar') {
        setTimeout(() => renderCalendar(), 100);
        return `<div><div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6"><h2 class="text-2xl font-bold dark:text-teal-400">Schedule</h2><div class="flex flex-wrap gap-2 sm:gap-4">${workerFilter}${viewToggle}<button onclick="openModal('job')" class="bg-black text-white px-4 py-2 rounded-lg border border-teal-400 text-sm whitespace-nowrap">+ Schedule Job</button></div></div><div id="calendar" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-gray-700"></div></div>`;
    }
    
    const filteredJobs = jobs.filter(job => {
        if (!jobSearch) return true;
        const client = clients.find(c => c.id === job.client_id);
        const assignedTeamIds = job.assigned_team_members || (job.assigned_to ? [job.assigned_to] : []);
        const assignedWorkers = assignedTeamIds.map(id => teamMembers.find(m => m.id === id)).filter(w => w);
        const workerNames = assignedWorkers.map(w => w.name).join(' ');
        const searchLower = jobSearch.toLowerCase();
        return (
            job.title.toLowerCase().includes(searchLower) ||
            (client?.name || '').toLowerCase().includes(searchLower) ||
            (client?.address || '').toLowerCase().includes(searchLower) ||
            workerNames.toLowerCase().includes(searchLower) ||
            (job.notes || '').toLowerCase().includes(searchLower)
        );
    });
    
    const totalJobs = filteredJobs.length;
    const startIndex = (currentPage.jobs - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
    
    const jobsList = paginatedJobs.length === 0 ? '<div class="text-center py-12 text-gray-500 dark:text-gray-400">No jobs found</div>' : paginatedJobs.map(job => { 
        const client = clients.find(c => c.id === job.client_id);
        const isSelected = selectedJobs.includes(job.id);
        
        const relatedQuote = quotes.find(q => q.title === job.title && q.client_id === job.client_id);
        const jobAddress = relatedQuote?.job_address || client?.address || '';
        
        const assignedTeamIds = job.assigned_team_members || (job.assigned_to ? [job.assigned_to] : []);
        const assignedWorkers = assignedTeamIds.map(id => teamMembers.find(m => m.id === id)).filter(w => w);
        const workerColor = assignedWorkers[0]?.color || '#14b8a6';
        
        const statusColors = {
            scheduled: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800'
        };
        const statusLabels = {
            scheduled: 'Scheduled',
            in_progress: 'In Progress',
            completed: 'Completed'
        };
        const statusColor = statusColors[job.status] || statusColors.scheduled;
        const statusLabel = statusLabels[job.status] || statusLabels.scheduled;
        
        const teamDisplay = assignedWorkers.length > 0 
            ? `<div class="mt-2 max-h-20 overflow-y-auto space-y-1">
                ${assignedWorkers.map(w => `<div class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${w.color || '#14b8a6'}"></span>
                    <span>👤 ${w.name}${w.occupation ? ' - ' + w.occupation : ''}</span>
                </div>`).join('')}
               </div>`
            : '<p class="text-sm text-gray-400 mt-2">👤 Unassigned</p>';
        
        
        return `<div class="bg-white p-4 rounded-lg shadow border-l-4 ${isSelected ? 'ring-2 ring-blue-400' : ''}" style="border-color: ${workerColor}";>
            <div class="flex gap-3">
                <div class="flex items-start pt-1">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelection('jobs', '${job.id}')" class="w-5 h-5 text-blue-600 rounded">
                </div>
                <div class="flex-1">
                    <div class="flex flex-col sm:flex-row sm:justify-between gap-3">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold dark:text-white dark:text-white">${job.title}</h3>
                            <span class="text-xs ${statusColor} px-2 py-1 rounded inline-block mt-1">${statusLabel}</span>
                            <p class="text-gray-600 dark:text-gray-300 mt-1">${client?.name || 'Unknown'}</p>
                            ${jobAddress ? `<a href="${/iPhone|iPad|iPod/.test(navigator.userAgent) ? 'maps://?q=' : 'https://maps.google.com/?q='}${encodeURIComponent(jobAddress)}" target="_blank" class="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">📍 ${jobAddress}</a>` : ''}
                            ${teamDisplay}
                            <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">📅 ${new Date(job.date).toLocaleDateString()} ⏰ ${job.time}${job.duration > 1 ? ` (${job.duration} days)` : ''}</div>
                            ${job.notes ? `<p class="text-sm text-gray-700 mt-2 italic">${job.notes}</p>` : ''}
                            ${job.photos && job.photos.length > 0 ? `<div class="mt-3 flex gap-2 flex-wrap">${job.photos.map(photo => `<img src="${photo}" class="w-20 h-20 object-cover rounded border border-teal-400" />`).join('')}</div>` : ''}
                        </div>
                        <div class="flex sm:flex-col gap-2">
                            <button onclick='openModal("job", ${JSON.stringify(job).replace(/"/g, "&quot;")})' class="px-3 py-1 bg-blue-600 text-white rounded text-sm">Edit</button>
                            <label class="cursor-pointer px-3 py-1 bg-teal-500 text-white rounded text-sm text-center"><input type="file" accept="image/*" onchange="uploadJobPhoto(this, '${job.id}')" class="hidden" />Add Photo</label>
                            <button onclick="deleteJob('${job.id}')" class="px-3 py-1 text-red-600 border border-red-200 rounded text-sm">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`; 
    }).join('');
    
    const pagination = getPaginationHTML('jobs', totalJobs, currentPage.jobs);
    
    const bulkActions = selectedJobs.length > 0 ? `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <span class="text-sm font-medium text-blue-900">${selectedJobs.length} job${selectedJobs.length > 1 ? 's' : ''} selected</span>
            <button onclick="bulkDelete('jobs')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium dark:text-gray-200">🗑️ Delete Selected</button>
        </div>
    ` : '';
    
    const selectAllCheckbox = paginatedJobs.length > 0 ? `
        <div class="flex items-center gap-2 mb-4">
            <input type="checkbox" ${selectedJobs.length === jobs.length && jobs.length > 0 ? 'checked' : ''} onchange="toggleSelectAll('jobs')" class="w-5 h-5 text-blue-600 rounded">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Select All</label>
        </div>
    ` : '';
    
    return `<div><div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6"><h2 class="text-2xl font-bold dark:text-teal-400">Schedule</h2><div class="flex flex-wrap gap-2 sm:gap-4">${viewToggle}<button onclick="exportToCSV('jobs')" class="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 text-sm whitespace-nowrap">Export CSV</button><button onclick="openModal('job')" class="bg-black text-white px-3 sm:px-4 py-2 rounded-lg border border-teal-400 text-sm whitespace-nowrap">+ Schedule Job</button></div></div><input type="text" placeholder="🔍 Search jobs..." value="${jobSearch}" oninput="debouncedSearch('job', this.value);" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-4">${bulkActions}${selectAllCheckbox}<div class="grid gap-4">${jobsList}</div>${pagination}</div>`;
}

function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    
    calendarEl.innerHTML = '';
    
    let filteredJobs = jobs;
    if (calendarFilter !== 'all') {
        if (calendarFilter === 'unassigned') {
            filteredJobs = jobs.filter(job => !job.assigned_to && (!job.assigned_team_members || job.assigned_team_members.length === 0));
        } else {
            filteredJobs = jobs.filter(job => {
                const teamIds = job.assigned_team_members || (job.assigned_to ? [job.assigned_to] : []);
                return teamIds.includes(calendarFilter);
            });
        }
    }
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: filteredJobs.flatMap(job => {
            const client = clients.find(c => c.id === job.client_id);
            
            const assignedTeamIds = job.assigned_team_members || (job.assigned_to ? [job.assigned_to] : []);
            const assignedWorkers = assignedTeamIds.map(id => teamMembers.find(m => m.id === id)).filter(w => w);
            
            const duration = parseInt(job.duration) || 1;
            
            let eventTitle = '';
            if (assignedWorkers.length > 0) {
                eventTitle = assignedWorkers.map(w => `● ${w.name}`).join('\n') + '\n';
            }
            eventTitle += job.title;
            if (client) {
                eventTitle += '\n' + client.name;
            }
            
            const events = [];
            for (let i = 0; i < duration; i++) {
                const [year, month, day] = job.date.split('-').map(Number);
                const eventDate = new Date(year, month - 1, day + i);
                const eventDateString = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
                
                const borderColor = assignedWorkers[0]?.color || '#14b8a6';
                
                events.push({
                    title: eventTitle,
                    start: eventDateString,
                    allDay: true,
                    backgroundColor: '#ffffff',
                    borderColor: borderColor,
                    textColor: '#000000',
                    extendedProps: {
                        jobId: job.id,
                        jobTitle: job.title,
                        clientName: client?.name,
                        workers: assignedWorkers,
                        duration: duration,
                        dayNumber: i + 1
                    }
                });
            }
            
            return events;
        }),
        eventClick: function(info) {
            const job = jobs.find(j => j.id === info.event.extendedProps.jobId);
            if (job) {
                const workers = info.event.extendedProps.workers || [];
                const workerNames = workers.length > 0 
                    ? workers.map(w => w.name + (w.occupation ? ` (${w.occupation})` : '')).join('\n')
                    : 'Unassigned';
                const duration = job.duration || 1;
                const durationText = duration > 1 ? `\nDuration: ${duration} days` : '';
                alert('Job: ' + job.title + '\nClient: ' + info.event.extendedProps.clientName + '\n\nTeam Members:\n' + workerNames + '\n\nDate: ' + new Date(job.date).toLocaleDateString() + '\nTime: ' + job.time + durationText);
            }
        }
    });
    
    calendar.render();
}

console.log('✅ Schedule module loaded');
