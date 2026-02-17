// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Advanced Scheduling System
// ═══════════════════════════════════════════════════════════════════

// Recurring Job Patterns
const recurringPatterns = {
    daily: {
        name: 'Daily',
        description: 'Repeat every day',
        generateDates: (startDate, endDate) => {
            const dates = [];
            const current = new Date(startDate);
            const end = new Date(endDate);
            
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            return dates;
        }
    },
    
    weekly: {
        name: 'Weekly',
        description: 'Repeat every week on the same day',
        generateDates: (startDate, endDate) => {
            const dates = [];
            const current = new Date(startDate);
            const end = new Date(endDate);
            
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 7);
            }
            return dates;
        }
    },
    
    biweekly: {
        name: 'Bi-Weekly',
        description: 'Repeat every 2 weeks',
        generateDates: (startDate, endDate) => {
            const dates = [];
            const current = new Date(startDate);
            const end = new Date(endDate);
            
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 14);
            }
            return dates;
        }
    },
    
    monthly: {
        name: 'Monthly',
        description: 'Repeat on the same day each month',
        generateDates: (startDate, endDate) => {
            const dates = [];
            const current = new Date(startDate);
            const end = new Date(endDate);
            const dayOfMonth = current.getDate();
            
            while (current <= end) {
                dates.push(new Date(current));
                current.setMonth(current.getMonth() + 1);
                // Handle months with fewer days
                if (current.getDate() !== dayOfMonth) {
                    current.setDate(0); // Last day of previous month
                }
            }
            return dates;
        }
    },
    
    monthly_first: {
        name: 'Monthly (1st)',
        description: 'First day of each month',
        generateDates: (startDate, endDate) => {
            const dates = [];
            const current = new Date(startDate);
            current.setDate(1);
            const end = new Date(endDate);
            
            while (current <= end) {
                dates.push(new Date(current));
                current.setMonth(current.getMonth() + 1);
            }
            return dates;
        }
    },
    
    quarterly: {
        name: 'Quarterly',
        description: 'Every 3 months',
        generateDates: (startDate, endDate) => {
            const dates = [];
            const current = new Date(startDate);
            const end = new Date(endDate);
            
            while (current <= end) {
                dates.push(new Date(current));
                current.setMonth(current.getMonth() + 3);
            }
            return dates;
        }
    },
    
    custom_interval: {
        name: 'Custom Interval',
        description: 'Repeat every X days',
        generateDates: (startDate, endDate, interval = 7) => {
            const dates = [];
            const current = new Date(startDate);
            const end = new Date(endDate);
            
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + interval);
            }
            return dates;
        }
    }
};

// Create Recurring Job Series
async function createRecurringJob(jobData, pattern, startDate, endDate, options = {}) {
    try {
        const dates = recurringPatterns[pattern].generateDates(startDate, endDate, options.interval);
        
        if (dates.length > 50) {
            if (!confirm(`This will create ${dates.length} jobs. Continue?`)) {
                return;
            }
        }
        
        // Create series record
        const seriesId = `series_${Date.now()}`;
        
        const { data: seriesData, error: seriesError } = await supabaseClient
            .from('job_series')
            .insert({
                id: seriesId,
                title: jobData.title,
                pattern: pattern,
                start_date: startDate,
                end_date: endDate,
                client_id: jobData.client_id,
                team_member_id: jobData.team_member_id,
                created_at: new Date().toISOString()
            });
        
        if (seriesError) throw seriesError;
        
        // Create individual job instances
        const jobInstances = dates.map(date => ({
            ...jobData,
            date: date.toISOString().split('T')[0],
            series_id: seriesId,
            instance_number: dates.indexOf(date) + 1,
            total_instances: dates.length,
            created_at: new Date().toISOString()
        }));
        
        const { error: jobsError } = await supabaseClient
            .from('jobs')
            .insert(jobInstances);
        
        if (jobsError) throw jobsError;
        
        showNotification(`Created ${dates.length} recurring jobs!`, 'success');
        renderApp();
        
    } catch (error) {
        console.error('Error creating recurring jobs:', error);
        showNotification('Failed to create recurring jobs', 'error');
    }
}

// Update Recurring Job Series
async function updateRecurringSeries(seriesId, updateType, changes) {
    // updateType: 'this_only', 'this_and_future', 'all'
    
    try {
        const seriesJobs = jobs.filter(j => j.series_id === seriesId);
        
        if (updateType === 'this_only') {
            // Update single instance - remove from series
            changes.series_id = null;
        } else if (updateType === 'this_and_future') {
            // Update from this instance forward
            const futureJobs = seriesJobs.filter(j => new Date(j.date) >= new Date(changes.date));
            const jobIds = futureJobs.map(j => j.id);
            
            const { error } = await supabaseClient
                .from('jobs')
                .update(changes)
                .in('id', jobIds);
            
            if (error) throw error;
        } else {
            // Update all instances
            const { error } = await supabaseClient
                .from('jobs')
                .update(changes)
                .eq('series_id', seriesId);
            
            if (error) throw error;
        }
        
        showNotification('Recurring jobs updated!', 'success');
        renderApp();
        
    } catch (error) {
        console.error('Error updating series:', error);
        showNotification('Failed to update recurring jobs', 'error');
    }
}

// Delete Recurring Job Series
async function deleteRecurringSeries(seriesId, deleteType, fromDate = null) {
    // deleteType: 'this_only', 'this_and_future', 'all'
    
    const message = deleteType === 'all' 
        ? 'Delete all jobs in this series?' 
        : deleteType === 'this_and_future'
            ? 'Delete this job and all future occurrences?'
            : 'Delete only this job?';
    
    if (!confirm(message)) return;
    
    try {
        if (deleteType === 'this_only') {
            // Delete single instance (handled elsewhere)
            return;
        } else if (deleteType === 'this_and_future') {
            const seriesJobs = jobs.filter(j => j.series_id === seriesId && new Date(j.date) >= new Date(fromDate));
            const jobIds = seriesJobs.map(j => j.id);
            
            const { error } = await supabaseClient
                .from('jobs')
                .delete()
                .in('id', jobIds);
            
            if (error) throw error;
        } else {
            // Delete all
            const { error } = await supabaseClient
                .from('jobs')
                .delete()
                .eq('series_id', seriesId);
            
            if (error) throw error;
            
            // Delete series record
            await supabaseClient
                .from('job_series')
                .delete()
                .eq('id', seriesId);
        }
        
        showNotification('Recurring jobs deleted', 'success');
        renderApp();
        
    } catch (error) {
        console.error('Error deleting series:', error);
        showNotification('Failed to delete recurring jobs', 'error');
    }
}

// Prefill recurring modal from existing job or quote
function prefillFromJob(value) {
    if (!value) return;

    let title, clientId, address, teamMemberId;

    if (value.startsWith('quote_')) {
        const quoteId = value.replace('quote_', '');
        const quote = quotes.find(q => q.id === quoteId);
        if (!quote) return;
        title = quote.title;
        clientId = quote.client_id;
        address = quote.job_address || '';
        teamMemberId = null;
    } else {
        const jobId = value.replace('job_', '');
        const job = jobs.find(j => j.id === jobId);
        if (!job) return;
        title = job.title;
        clientId = job.client_id;
        address = job.job_address || '';
        teamMemberId = job.team_member_id;
    }

    const titleEl = document.getElementById('recurring_title');
    const clientEl = document.getElementById('recurring_client');
    const addressEl = document.getElementById('recurring_address');
    const teamEl = document.getElementById('recurring_team');

    if (titleEl) titleEl.value = title || '';
    if (clientEl) clientEl.value = clientId || '';
    if (addressEl) addressEl.value = address;
    if (teamEl && teamMemberId) teamEl.value = teamMemberId;
}

// Render Recurring Job Modal
function renderRecurringJobModal(baseJobData = null) {
    return `
        <div id="recurringJobModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center">
                        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Create Recurring Job</h2>
                        <button onclick="closeModal('recurringJobModal')" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="p-6 space-y-4">
                    <!-- Link to Existing Job -->
                    <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🔗 Link to Existing Job (optional)</label>
                        <select id="recurring_linked_job" onchange="prefillFromJob(this.value)" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm">
                            <option value="">— Start from scratch —</option>
                            ${quotes.length > 0 ? `<optgroup label="Quotes">` + quotes.filter(q => q.status !== 'converted').map(q => {
                                const client = clients.find(c => c.id === q.client_id);
                                return `<option value="quote_${q.id}">${q.quote_number || q.title}${client ? ' — ' + client.name : ''} (${q.status || 'pending'})</option>`;
                            }).join('') + `</optgroup>` : ''}
                            ${jobs.length > 0 ? `<optgroup label="Jobs">` + jobs.map(j => {
                                const client = clients.find(c => c.id === j.client_id);
                                return `<option value="job_${j.id}">${j.title}${client ? ' — ' + client.name : ''}</option>`;
                            }).join('') + `</optgroup>` : ''}
                        </select>
                        <div class="text-xs text-gray-400 mt-1">Selecting a job will prefill the details below</div>
                    </div>

                    <!-- Job Details -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Title *</label>
                        <input type="text" id="recurring_title" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="e.g., Monthly Pool Maintenance" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client *</label>
                        <select id="recurring_client" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required>
                            <option value="">Select Client</option>
                            ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                        <input type="text" id="recurring_address" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="Service location">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Member</label>
                        <select id="recurring_team" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                            <option value="">Unassigned</option>
                            ${teamMembers.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <!-- Recurrence Pattern -->
                    <div class="border-t pt-4">
                        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Recurrence Pattern</h3>
                        
                        <div class="grid grid-cols-2 gap-3 mb-4">
                            ${Object.entries(recurringPatterns).map(([key, pattern]) => `
                                <label class="flex items-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-teal-400 transition-colors">
                                    <input type="radio" name="recurrence_pattern" value="${key}" class="mr-3">
                                    <div>
                                        <div class="font-medium text-gray-900 dark:text-white">${pattern.name}</div>
                                        <div class="text-xs text-gray-600 dark:text-gray-400">${pattern.description}</div>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                        
                        <div id="custom_interval_input" class="hidden mb-4">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repeat every X days</label>
                            <input type="number" id="recurring_interval" min="1" value="7" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                        </div>
                    </div>
                    
                    <!-- Date Range -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date *</label>
                            <input type="date" id="recurring_start_date" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date *</label>
                            <input type="date" id="recurring_end_date" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required>
                        </div>
                    </div>
                    
                    <!-- Preview -->
                    <div id="recurring_preview" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div class="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Preview</div>
                        <div id="preview_text" class="text-sm text-blue-700 dark:text-blue-300">
                            Select a pattern and dates to see preview
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex gap-3 pt-4">
                        <button onclick="submitRecurringJob()" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                            Create Recurring Jobs
                        </button>
                        <button onclick="closeModal('recurringJobModal')" class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            // Show/hide custom interval input
            document.querySelectorAll('input[name="recurrence_pattern"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    document.getElementById('custom_interval_input').classList.toggle('hidden', e.target.value !== 'custom_interval');
                    updateRecurringPreview();
                });
            });
            
            // Update preview when dates change
            ['recurring_start_date', 'recurring_end_date', 'recurring_interval'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.addEventListener('change', updateRecurringPreview);
            });
        </script>
    `;
}

function updateRecurringPreview() {
    const pattern = document.querySelector('input[name="recurrence_pattern"]:checked')?.value;
    const startDate = document.getElementById('recurring_start_date')?.value;
    const endDate = document.getElementById('recurring_end_date')?.value;
    const interval = parseInt(document.getElementById('recurring_interval')?.value || 7);
    
    if (!pattern || !startDate || !endDate) return;
    
    const dates = recurringPatterns[pattern].generateDates(new Date(startDate), new Date(endDate), interval);
    
    const previewText = `
        Will create ${dates.length} job${dates.length !== 1 ? 's' : ''} between ${new Date(startDate).toLocaleDateString()} and ${new Date(endDate).toLocaleDateString()}
        <br><br>
        <strong>First 5 dates:</strong><br>
        ${dates.slice(0, 5).map(d => d.toLocaleDateString()).join(', ')}
        ${dates.length > 5 ? '...' : ''}
    `;
    
    document.getElementById('preview_text').innerHTML = previewText;
}

async function submitRecurringJob() {
    const title = document.getElementById('recurring_title').value;
    const clientId = document.getElementById('recurring_client').value;
    const address = document.getElementById('recurring_address').value;
    const teamMemberId = document.getElementById('recurring_team').value || null;
    const pattern = document.querySelector('input[name="recurrence_pattern"]:checked')?.value;
    const startDate = document.getElementById('recurring_start_date').value;
    const endDate = document.getElementById('recurring_end_date').value;
    const interval = parseInt(document.getElementById('recurring_interval')?.value || 7);
    
    if (!title || !clientId || !pattern || !startDate || !endDate) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const jobData = {
        title,
        client_id: clientId,
        address,
        team_member_id: teamMemberId,
        status: 'scheduled',
        user_id: (await supabaseClient.auth.getUser()).data.user.id
    };
    
    await createRecurringJob(jobData, pattern, new Date(startDate), new Date(endDate), { interval });
    
    closeModal('recurringJobModal');
}

// Calendar View Enhancements
function renderCalendarView(month, year) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const monthJobs = jobs.filter(job => {
        const jobDate = new Date(job.date);
        return jobDate.getMonth() === month && jobDate.getFullYear() === year;
    });
    
    return `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <!-- Calendar Header -->
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                    ${new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div class="flex gap-2">
                    <button onclick="changeMonth(${month - 1}, ${year})" class="px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        ←
                    </button>
                    <button onclick="changeMonth(${month + 1}, ${year})" class="px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        →
                    </button>
                    <button onclick="changeMonth(${new Date().getMonth()}, ${new Date().getFullYear()})" class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                        Today
                    </button>
                </div>
            </div>
            
            <!-- Calendar Grid -->
            <div class="grid grid-cols-7 gap-2">
                ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => `
                    <div class="text-center font-semibold text-gray-600 dark:text-gray-400 py-2">${day}</div>
                `).join('')}
                
                ${Array(startingDayOfWeek).fill(null).map(() => '<div class="aspect-square"></div>').join('')}
                
                ${Array(daysInMonth).fill(null).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayJobs = monthJobs.filter(j => j.date === dateStr);
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    
                    return `
                        <div class="aspect-square border ${isToday ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onclick="showDayJobs('${dateStr}')">
                            <div class="text-sm font-medium ${isToday ? 'text-teal-600' : 'text-gray-900 dark:text-white'}">${day}</div>
                            ${dayJobs.length > 0 ? `
                                <div class="mt-1 space-y-1">
                                    ${dayJobs.slice(0, 3).map(job => `
                                        <div class="text-xs px-1 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded truncate" title="${job.title}">
                                            ${job.title}
                                        </div>
                                    `).join('')}
                                    ${dayJobs.length > 3 ? `<div class="text-xs text-gray-500">+${dayJobs.length - 3} more</div>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Database Schema for Recurring Jobs
const recurringJobsSchema = `
-- Add to your Supabase database

CREATE TABLE IF NOT EXISTS job_series (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    pattern TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    client_id UUID REFERENCES clients(id),
    team_member_id UUID REFERENCES team_members(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add series tracking to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS series_id TEXT REFERENCES job_series(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS instance_number INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS total_instances INTEGER;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_series ON jobs(series_id);
CREATE INDEX IF NOT EXISTS idx_job_series_client ON job_series(client_id);
`;

console.log('✅ Advanced Scheduling system loaded');
console.log('📅 Recurring job patterns available:', Object.keys(recurringPatterns).length);
