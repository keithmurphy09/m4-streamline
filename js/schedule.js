// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Schedule Module (Professional Table View)
// ═══════════════════════════════════════════════════════════════════

// View state
let jobViewMode = 'table'; // 'table', 'detail', or 'calendar'
let selectedJobForDetail = null;

function openJobDetail(job) {
    selectedJobForDetail = job;
    jobViewMode = 'detail';
    renderApp();
}

function closeJobDetail() {
    selectedJobForDetail = null;
    jobViewMode = 'table';
    renderApp();
}

function renderSchedule() {
    const viewToggle = `<div class="flex gap-2">
        <button onclick="scheduleView='list'; jobViewMode='table'; renderApp();" class="px-3 py-2 rounded text-sm ${scheduleView === 'list' ? 'bg-black text-white border-teal-400' : 'bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600'} border">List</button>
        <button onclick="scheduleView='calendar'; jobViewMode='calendar'; renderApp();" class="px-3 py-2 rounded text-sm ${scheduleView === 'calendar' ? 'bg-black text-white border-teal-400' : 'bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600'} border">Calendar</button>
    </div>`;
    
    const workerFilter = getAccountType() === 'business' && teamMembers.length > 0 
        ? `<select onchange="calendarFilter=this.value; renderApp();" class="px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white text-sm">
            <option value="all" ${calendarFilter === 'all' ? 'selected' : ''}>All Workers</option>
            <option value="unassigned" ${calendarFilter === 'unassigned' ? 'selected' : ''}>Unassigned</option>
            ${teamMembers.map(m => `<option value="${m.id}" ${calendarFilter === m.id ? 'selected' : ''}>${m.name}${m.occupation ? ' - ' + m.occupation : ''}</option>`).join('')}
           </select>`
        : '';
    
    if (scheduleView === 'calendar' || jobViewMode === 'calendar') {
        setTimeout(() => renderCalendar(), 100);
        return `<div><div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6"><h2 class="text-2xl font-bold dark:text-teal-400">Schedule</h2><div class="flex flex-wrap gap-2 sm:gap-4">${workerFilter}${viewToggle}<button onclick="openModal('job')" class="bg-black text-white px-4 py-2 rounded-lg border border-teal-400 text-sm whitespace-nowrap">+ Schedule Job</button></div></div><div id="calendar" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-gray-700"></div></div>`;
    }
    
    if (jobViewMode === 'detail' && selectedJobForDetail) {
        return renderJobDetail();
    }
    
    return renderJobsTable();
}

function renderJobsTable() {
    const viewToggle = `<div class="flex gap-2">
        <button onclick="scheduleView='list'; jobViewMode='table'; renderApp();" class="px-3 py-2 rounded text-sm bg-black text-white border-teal-400 border">List</button>
        <button onclick="scheduleView='calendar'; jobViewMode='calendar'; renderApp();" class="px-3 py-2 rounded text-sm bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600 border">Calendar</button>
    </div>`;
    
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
    
    const sortedJobs = [...filteredJobs].sort((a, b) => {
        const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
        const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
        return dateB - dateA;
    });
    
    const totalJobs = sortedJobs.length;
    const startIndex = (currentPage.jobs - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedJobs = sortedJobs.slice(startIndex, endIndex);
    
    const jobRows = paginatedJobs.length === 0 
        ? '<tr><td colspan="7" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No jobs found</td></tr>'
        : paginatedJobs.map(job => {
            const client = clients.find(c => c.id === job.client_id);
            const isSelected = selectedJobs.includes(job.id);
            
            const relatedQuote = quotes.find(q => q.title === job.title && q.client_id === job.client_id);
            const jobAddress = relatedQuote?.job_address || job.job_address || client?.address || '';
            
            const assignedTeamIds = job.assigned_team_members || (job.assigned_to ? [job.assigned_to] : []);
            const assignedWorkers = assignedTeamIds.map(id => teamMembers.find(m => m.id === id)).filter(w => w);
            
            let statusBadge = '';
            if (job.status === 'completed') {
                statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">COMPLETED</span>';
            } else if (job.status === 'in_progress') {
                statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">IN PROGRESS</span>';
            } else {
                statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">SCHEDULED</span>';
            }
            
            const workersDisplay = assignedWorkers.length > 0 
                ? assignedWorkers.slice(0, 2).map(w => `<span class="inline-flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300"><span class="w-2 h-2 rounded-full" style="background-color: ${w.color || '#14b8a6'}"></span>${w.name}</span>`).join(', ') + (assignedWorkers.length > 2 ? ` +${assignedWorkers.length - 2}` : '')
                : '<span class="text-xs text-gray-400 dark:text-gray-500">Unassigned</span>';
            
            return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${isSelected ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}" onclick="openJobDetail(${JSON.stringify(job).replace(/"/g, '&quot;')})">
                <td class="px-6 py-4" onclick="event.stopPropagation()">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelection('jobs', '${job.id}')" class="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500">
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${job.title}</div>
                    ${jobAddress ? `<div class="text-xs text-gray-400 dark:text-gray-500">${jobAddress}</div>` : ''}
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${client?.name || 'Unknown'}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-600 dark:text-gray-400">${formatDate(job.date)}</div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">${job.time || '09:00'}${job.duration > 1 ? ` (${job.duration} days)` : ''}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 dark:text-white">${workersDisplay}</div>
                </td>
                <td class="px-6 py-4">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 text-right" onclick="event.stopPropagation()">
                    <div class="relative inline-block">
                        <button onclick="toggleJobActions('${job.id}')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                            </svg>
                        </button>
                        <div id="job-actions-${job.id}" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                            <div class="py-1">
                                <button onclick='openModal("job", ${JSON.stringify(job).replace(/"/g, "&quot;")}); toggleJobActions("${job.id}")' class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Edit Job</button>
                                ${job.status !== 'completed' ? `<button onclick="updateJobStatus('${job.id}', 'completed'); toggleJobActions('${job.id}')" class="block w-full text-left px-4 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-700">Mark Complete</button>` : ''}
                                <button onclick="deleteJob('${job.id}'); toggleJobActions('${job.id}')" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>`;
        }).join('');
    
    const pagination = getPaginationHTML('jobs', totalJobs, currentPage.jobs);
    
    const bulkActions = selectedJobs.length > 0 ? `
        <div class="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
                <span class="font-semibold text-teal-700 dark:text-teal-400">${selectedJobs.length}</span> job${selectedJobs.length > 1 ? 's' : ''} selected
            </span>
            <button onclick="bulkDelete('jobs')" class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors">
                Delete Selected
            </button>
        </div>
    ` : '';
    
    return `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100 dark:border-gray-700">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Schedule</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage job assignments and timeline</p>
                </div>
                <div class="flex gap-2">
                    ${viewToggle}
                    <button onclick="openModal('job')" class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-900 border border-teal-400 rounded-lg transition-colors shadow-sm">
                        Schedule Job
                    </button>
                </div>
            </div>
            
            <!-- Search -->
            <div class="flex gap-3">
                <input type="text" 
                       id="job-search-input"
                       placeholder="Search jobs by title, client, or worker..." 
                       value="${jobSearch}" 
                       oninput="jobSearch = this.value; clearTimeout(window.jobSearchTimer); window.jobSearchTimer = setTimeout(() => { currentPage.jobs = 1; renderApp(); setTimeout(() => document.getElementById('job-search-input')?.focus(), 0); }, 300);" 
                       class="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
                <button onclick="exportToCSV('jobs')" class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">
                    Export CSV
                </button>
            </div>
        </div>
        
        ${bulkActions}
        
        <!-- Table -->
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <th class="px-6 py-3 text-left w-12">
                            <input type="checkbox" 
                                   ${selectedJobs.length === jobs.length && jobs.length > 0 ? 'checked' : ''} 
                                   onchange="toggleSelectAll('jobs')" 
                                   class="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500">
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Job</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Client</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Assigned To</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 w-12"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
                    ${jobRows}
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        ${pagination ? `<div class="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            ${pagination}
        </div>` : ''}
    </div>`;
}

function toggleJobActions(jobId) {
    const menu = document.getElementById(`job-actions-${jobId}`);
    if (menu) {
        menu.classList.toggle('hidden');
    }
    // Close other menus
    document.querySelectorAll('[id^="job-actions-"]').forEach(m => {
        if (m.id !== `job-actions-${jobId}`) {
            m.classList.add('hidden');
        }
    });
}

async function updateJobStatus(jobId, newStatus) {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .update({ status: newStatus })
            .eq('id', jobId);
        
        if (error) throw error;
        
        // Update local state
        const job = jobs.find(j => j.id === jobId);
        if (job) job.status = newStatus;
        
        renderApp();
        showToast(`Job marked as ${newStatus.replace('_', ' ')}`, 'success');
    } catch (error) {
        console.error('Error updating job status:', error);
        showToast('Failed to update job status', 'error');
    }
}

async function uploadJobPhoto(input, jobId) {
    const file = input.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
    }
    
    try {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${jobId}-${Date.now()}.${fileExt}`;
        const filePath = `job-photos/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('job-photos')
            .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from('job-photos')
            .getPublicUrl(filePath);
        
        const photoUrl = urlData.publicUrl;
        
        // Update job with new photo
        const job = jobs.find(j => j.id === jobId);
        const currentPhotos = job?.photos || [];
        const updatedPhotos = [...currentPhotos, photoUrl];
        
        const { error: updateError } = await supabase
            .from('jobs')
            .update({ photos: updatedPhotos })
            .eq('id', jobId);
        
        if (updateError) throw updateError;
        
        // Update local state
        if (job) job.photos = updatedPhotos;
        
        renderApp();
        showToast('Photo uploaded successfully', 'success');
    } catch (error) {
        console.error('Error uploading photo:', error);
        showToast('Failed to upload photo', 'error');
    }
}

function renderJobDetail() {
    const job = selectedJobForDetail;
    if (!job) {
        closeJobDetail();
        return '';
    }
    
    const client = clients.find(c => c.id === job.client_id);
    const relatedQuote = quotes.find(q => q.title === job.title && q.client_id === job.client_id);
    const jobAddress = relatedQuote?.job_address || job.job_address || client?.address || '';
    
    const assignedTeamIds = job.assigned_team_members || (job.assigned_to ? [job.assigned_to] : []);
    const assignedWorkers = assignedTeamIds.map(id => teamMembers.find(m => m.id === id)).filter(w => w);
    
    let statusBadge = '';
    if (job.status === 'completed') {
        statusBadge = '<span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">COMPLETED</span>';
    } else if (job.status === 'in_progress') {
        statusBadge = '<span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">IN PROGRESS</span>';
    } else {
        statusBadge = '<span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">SCHEDULED</span>';
    }
    
    // Calculate job expenses
    const jobExpenses = expenses.filter(e => e.job_id === job.id);
    const totalExpenses = jobExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    
    // Get quote value if available
    const relatedQuote = quotes.find(q => 
        (q.title === job.title && q.client_id === job.client_id) ||
        (q.title?.toLowerCase() === job.title?.toLowerCase() && q.client_id === job.client_id)
    );
    const quoteValue = relatedQuote ? parseFloat(relatedQuote.total || 0) : 0;
    const profit = quoteValue - totalExpenses;
    const profitMargin = quoteValue > 0 ? ((profit / quoteValue) * 100).toFixed(1) : 0;
    
    const profitLossSection = relatedQuote ? `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Financials</h3>
            <div class="space-y-3">
                <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Quote Value:</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">${formatCurrency(quoteValue)}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Job Expenses:</span>
                    <span class="text-sm font-medium text-red-600 dark:text-red-400">${formatCurrency(totalExpenses)}</span>
                </div>
                ${jobExpenses.length > 0 ? `
                <div class="mt-2 mb-2 pl-4">
                    <details class="text-xs text-gray-500 dark:text-gray-400">
                        <summary class="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Show ${jobExpenses.length} expense${jobExpenses.length > 1 ? 's' : ''}</summary>
                        <div class="mt-2 space-y-1 pl-2">
                            ${jobExpenses.map(e => `
                                <div class="flex justify-between py-1">
                                    <span>${e.description || e.category}</span>
                                    <span class="font-medium">${formatCurrency(e.amount)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </details>
                </div>
                ` : ''}
                <div class="flex justify-between py-3 ${profit >= 0 ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-red-50 dark:bg-red-900/20'} px-4 rounded-lg">
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">Net Profit:</span>
                    <div class="text-right">
                        <span class="text-lg font-bold ${profit >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-red-700 dark:text-red-400'}">${formatCurrency(profit)}</span>
                        <span class="text-xs ${profit >= 0 ? 'text-teal-600 dark:text-teal-500' : 'text-red-600 dark:text-red-500'} ml-2">(${profitMargin}% margin)</span>
                    </div>
                </div>
            </div>
            ${jobExpenses.length === 0 ? `
            <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                <p class="mb-2">No expenses linked to this job yet.</p>
                <p class="text-xs">Tip: When adding expenses, select this job to track costs.</p>
            </div>
            ` : ''}
            <button onclick="switchTab('expenses')" class="mt-4 w-full px-4 py-2 text-sm font-medium text-teal-700 dark:text-teal-400 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg transition-colors">
                ${jobExpenses.length > 0 ? 'View All Expenses' : 'Add Expenses'}
            </button>
        </div>
    ` : '';
    
    const photosSection = job.photos && job.photos.length > 0 ? `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Photos (${job.photos.length})</h3>
            <div class="grid grid-cols-2 gap-3">
                ${job.photos.map(photo => `<img src="${photo}" class="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />`).join('')}
            </div>
        </div>
    ` : '';
    
    return `<div class="space-y-6">
        <!-- Back Button -->
        <button onclick="closeJobDetail()" class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Schedule
        </button>
        
        <!-- Header -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">${job.title}</h1>
                        ${statusBadge}
                    </div>
                    <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">${formatDate(job.date)} at ${job.time || '09:00'}${job.duration > 1 ? ` (${job.duration} days)` : ''}</p>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button onclick='openModal("job", ${JSON.stringify(job).replace(/"/g, "&quot;")})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">Edit Job</button>
                ${job.status !== 'completed' ? `<button onclick="updateJobStatus('${job.id}', '${job.status === 'scheduled' ? 'in_progress' : 'completed'}')" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">Mark ${job.status === 'scheduled' ? 'In Progress' : 'Complete'}</button>` : ''}
                <label class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors cursor-pointer">
                    <input type="file" accept="image/*" onchange="uploadJobPhoto(this, '${job.id}')" class="hidden" />
                    Add Photo
                </label>
                <button onclick="deleteJob('${job.id}')" class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors ml-auto">Delete Job</button>
            </div>
        </div>
        
        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left Column (2/3) -->
            <div class="lg:col-span-2 space-y-6">
                ${profitLossSection}
                ${photosSection}
            </div>
            
            <!-- Right Column (1/3) -->
            <div class="space-y-6">
                <!-- Client Info -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Client</h3>
                    <div class="space-y-3">
                        <div>
                            <div class="text-sm font-medium text-gray-900 dark:text-white">${client?.name || 'Unknown'}</div>
                        </div>
                        ${client?.phone ? `<div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Phone</div>
                            <div class="text-sm text-gray-900 dark:text-white">${client.phone}</div>
                        </div>` : ''}
                        ${jobAddress ? `<div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Job Address</div>
                            <a href="${/iPhone|iPad|iPod/.test(navigator.userAgent) ? 'maps://?q=' : 'https://maps.google.com/?q='}${encodeURIComponent(jobAddress)}" target="_blank" class="text-sm text-teal-600 dark:text-teal-400 hover:underline">${jobAddress}</a>
                        </div>` : ''}
                    </div>
                </div>
                
                <!-- Assigned Workers -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Assigned Workers</h3>
                    ${assignedWorkers.length > 0 ? `
                        <div class="space-y-2">
                            ${assignedWorkers.map(w => `
                                <div class="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                    <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${w.color || '#14b8a6'}"></span>
                                    <div class="flex-1">
                                        <div class="text-sm font-medium text-gray-900 dark:text-white">${w.name}</div>
                                        ${w.occupation ? `<div class="text-xs text-gray-500 dark:text-gray-400">${w.occupation}</div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-sm text-gray-400 dark:text-gray-500">No workers assigned</p>'}
                </div>
                
                <!-- Notes -->
                ${job.notes ? `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Notes</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">${job.notes}</p>
                </div>` : ''}
                
                ${relatedQuote ? `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Related Quote</h3>
                    <button onclick="switchTab('quotes'); openQuoteDetail(${JSON.stringify(relatedQuote).replace(/"/g, '&quot;')})" class="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                        <div class="text-sm font-medium text-teal-600 dark:text-teal-400">${relatedQuote.quote_number || 'QT-' + relatedQuote.id.slice(0, 3)}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">${relatedQuote.title}</div>
                    </button>
                </div>` : ''}
            </div>
        </div>
    </div>`;
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

console.log('✅ Schedule module loaded (Professional Table View)');
