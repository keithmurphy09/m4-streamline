// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Dashboard Module
// ═══════════════════════════════════════════════════════════════════

function renderDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const upcomingJobs = jobs.filter(j => j.date >= today).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);
    const tomorrowJobs = jobs.filter(j => j.date === tomorrow);
    const pendingQuotes = quotes.filter(q => q.status === 'pending' && !q.accepted);
    const acceptedQuotes = quotes.filter(q => q.accepted || q.status === 'accepted');
    const unpaidInvoices = invoices.filter(i => i.status === 'unpaid');
    
    const expiringQuotes = quotes.filter(q => {
        if (q.accepted || q.status !== 'pending') return false;
        const createdDate = new Date(q.created_at);
        const expiryDate = new Date(createdDate);
        expiryDate.setDate(expiryDate.getDate() + 30);
        const warningDate = new Date(expiryDate);
        warningDate.setHours(warningDate.getHours() - 48);
        const now = new Date();
        return now >= warningDate && now < expiryDate;
    });
    
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    const overdueInvoices = unpaidInvoices.filter(i => {
        if (!i.due_date) return false;
        const dueDate = new Date(i.due_date);
        dueDate.setHours(0,0,0,0);
        dueDate.setDate(dueDate.getDate() + 1);
        return dueDate < todayDate;
    });
    
    const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    
    return `<div>
        <h2 class="text-2xl font-bold mb-6">Dashboard</h2>
        
        ${!companySettings?.business_name && !companySettings?.phone ? `
        <div class="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 mb-4">
            <div class="flex items-center">
                <div class="flex-shrink-0 text-2xl">⚠️</div>
                <div class="ml-3 flex-1">
                    <p class="text-sm text-orange-800 dark:text-orange-200">
                        <strong>Welcome to M4 Streamline!</strong> Please add your business details in <button onclick="switchTab('company')" class="underline font-semibold hover:text-orange-900 dark:hover:text-orange-100">Company Info</button> to generate professional quotes and invoices.
                    </p>
                </div>
            </div>
        </div>
        ` : ''}
        
        <div class="bg-teal-50 border-l-4 border-teal-500 p-4 mb-4">
            <div class="flex items-center">
                <div class="flex-shrink-0">📚</div>
                <div class="ml-3">
                    <p class="text-sm text-teal-800">
                        <strong>New to M4 Streamline?</strong> Check out the comprehensive User Guide in the ⚙️ Settings menu (top right) for a complete walkthrough!
                    </p>
                </div>
            </div>
        </div>
        
        ${tomorrowJobs.length > 0 ? `<div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 cursor-pointer hover:bg-blue-100" onclick="switchTab('schedule')"><div class="flex"><div class="flex-shrink-0">⏰</div><div class="ml-3"><p class="text-sm text-blue-700"><strong>Tomorrow's Jobs (${tomorrowJobs.length}):</strong> ${tomorrowJobs.map(j => j.title).join(', ')}</p></div></div></div>` : ''}
        ${expiringQuotes.length > 0 ? `<div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 cursor-pointer hover:bg-yellow-100" onclick="switchTab('quotes')"><div class="flex"><div class="flex-shrink-0">⚠️</div><div class="ml-3"><p class="text-sm text-yellow-700"><strong>Quotes Expiring Soon (${expiringQuotes.length}):</strong> These quotes will expire in less than 48 hours</p></div></div></div>` : ''}
        ${overdueInvoices.length > 0 ? `<div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4 cursor-pointer hover:bg-red-100" onclick="switchTab('invoices')"><div class="flex"><div class="flex-shrink-0">🚨</div><div class="ml-3"><p class="text-sm text-red-700"><strong>Overdue Invoices (${overdueInvoices.length}):</strong> $${overdueInvoices.reduce((s,i) => s + parseFloat(i.total || 0), 0).toFixed(2)} overdue</p></div></div></div>` : ''}
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-6 rounded-lg shadow border-l-4 border-teal-400 cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700" onclick="switchTab('clients')">
                <div class="text-gray-600 dark:text-gray-300 text-sm">Total Clients</div>
                <div class="text-3xl font-bold mt-2">${clients.length}</div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow border-l-4 border-blue-400 cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700" onclick="switchTab('schedule')">
                <div class="text-gray-600 dark:text-gray-300 text-sm">Upcoming Jobs</div>
                <div class="text-3xl font-bold mt-2">${upcomingJobs.length}</div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-400 cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700" onclick="switchTab('quotes')">
                <div class="text-gray-600 dark:text-gray-300 text-sm">Pending Quotes</div>
                <div class="text-3xl font-bold mt-2">${pendingQuotes.length}</div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow border-l-4 border-red-400 cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700" onclick="switchTab('invoices')">
                <div class="text-gray-600 dark:text-gray-300 text-sm">Unpaid Invoices</div>
                <div class="text-3xl font-bold mt-2">$${totalUnpaid.toFixed(2)}</div>
            </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold dark:text-teal-400">Upcoming Jobs</h3>
                    <button onclick="switchTab('schedule')" class="text-teal-500 text-sm hover:underline">View All</button>
                </div>
                ${upcomingJobs.length === 0 ? '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming jobs</p>' : upcomingJobs.map(job => {
                    const client = clients.find(c => c.id === job.client_id);
                    const isTomorrow = job.date === tomorrow;
                    return `<div class="border-l-4 ${isTomorrow ? 'border-blue-400 bg-blue-50' : 'border-teal-400'} pl-3 py-2 mb-3 cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700" onclick="switchTab('schedule')">
                        <div class="font-semibold dark:text-white">${job.title} ${isTomorrow ? '⏰' : ''}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-300">${client?.name || 'Unknown'}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">${new Date(job.date).toLocaleDateString()} at ${job.time}</div>
                    </div>`;
                }).join('')}
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700">
                <h3 class="text-lg font-bold dark:text-teal-400 mb-4">Recent Activity</h3>
                ${acceptedQuotes.length === 0 && unpaidInvoices.length === 0 ? '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>' : `
                    ${acceptedQuotes.slice(0, 3).map(q => {
                        const client = clients.find(c => c.id === q.client_id);
                        return `<div class="py-2 mb-2 border-b cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700" onclick="switchTab('quotes')">
                            <div class="flex justify-between">
                                <span class="text-sm">✓ Quote accepted: <strong>${q.title}</strong></span>
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">${client?.name || 'Unknown'} - $${q.total.toFixed(2)}</div>
                        </div>`;
                    }).join('')}
                    ${unpaidInvoices.slice(0, 3).map(inv => {
                        const client = clients.find(c => c.id === inv.client_id);
                        const isOverdue = inv.due_date && new Date(inv.due_date) < todayDate;
                        return `<div class="py-2 mb-2 border-b cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700" onclick="switchTab('invoices')">
                            <div class="flex justify-between">
                                <span class="text-sm">${isOverdue ? '🚨' : '⏳'} ${isOverdue ? 'Overdue' : 'Unpaid'}: <strong>${inv.title}</strong></span>
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">${client?.name || 'Unknown'} - $${inv.total.toFixed(2)}</div>
                        </div>`;
                    }).join('')}
                `}
            </div>
        </div>
    </div>`;
}

console.log('✅ Dashboard module loaded');
