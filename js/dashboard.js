// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Professional Dashboard Module (Xero-inspired)
// ═══════════════════════════════════════════════════════════════════

let dashboardRevenueChartInstance = null;

function renderDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const upcomingJobs = jobs.filter(j => j.date >= today).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);
    const tomorrowJobs = jobs.filter(j => j.date === tomorrow);
    const pendingQuotes = quotes.filter(q => q.status === 'pending' && !q.accepted);
    const unpaidInvoices = invoices.filter(i => i.status === 'unpaid');
    
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    const overdueInvoices = unpaidInvoices.filter(i => {
        if (!i.due_date) return false;
        const dueDate = new Date(i.due_date);
        dueDate.setHours(0,0,0,0);
        dueDate.setDate(dueDate.getDate() + 1);
        return dueDate < todayDate;
    });
    
    // Financial calculations
    const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    
    // Last 30 days stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRevenue = invoices.filter(i => i.status === 'paid' && new Date(i.issue_date) >= thirtyDaysAgo).reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    
    return `<div class="max-w-7xl">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Dashboard</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Welcome back, here's your business overview</p>
        </div>
        
        ${!companySettings?.business_name && !companySettings?.phone ? `
        <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
            <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <div class="flex-1">
                    <p class="text-sm font-medium text-orange-900 dark:text-orange-200">Complete your setup</p>
                    <p class="text-sm text-orange-700 dark:text-orange-300 mt-1">Add your business details in <button onclick="switchTab('company')" class="underline font-medium hover:text-orange-900">Company Info</button> to start creating quotes and invoices.</p>
                </div>
            </div>
        </div>
        ` : ''}
        
        <!-- Critical Alerts (Xero-style) -->
        ${tomorrowJobs.length > 0 ? `
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" onclick="switchTab('schedule')">
            <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                </svg>
                <div class="flex-1">
                    <p class="text-sm font-medium text-blue-900 dark:text-blue-200">${tomorrowJobs.length} job${tomorrowJobs.length > 1 ? 's' : ''} scheduled for tomorrow</p>
                    <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">${tomorrowJobs.map(j => j.title).join(', ')}</p>
                </div>
            </div>
        </div>
        ` : ''}
        
        ${overdueInvoices.length > 0 ? `
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" onclick="switchTab('invoices')">
            <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <div class="flex-1">
                    <p class="text-sm font-medium text-red-900 dark:text-red-200">${overdueInvoices.length} overdue invoice${overdueInvoices.length > 1 ? 's' : ''}</p>
                    <p class="text-sm text-red-700 dark:text-red-300 mt-1">$${overdueInvoices.reduce((s,i) => s + parseFloat(i.total || 0), 0).toFixed(2)} outstanding</p>
                </div>
            </div>
        </div>
        ` : ''}
        
        <!-- Financial Summary Cards (Xero-style clean) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</span>
                    <span class="text-green-600 dark:text-green-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                        </svg>
                    </span>
                </div>
                <div class="text-3xl font-semibold text-gray-900 dark:text-white mb-2">$${totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">+$${recentRevenue.toFixed(2)} in last 30 days</div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</span>
                    <span class="text-red-600 dark:text-red-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/>
                        </svg>
                    </span>
                </div>
                <div class="text-3xl font-semibold text-gray-900 dark:text-white mb-2">$${totalExpenses.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">View breakdown in Expenses</div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</span>
                    <span class="${netProfit >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                    </span>
                </div>
                <div class="text-3xl font-semibold ${netProfit >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'} mb-2">${netProfit >= 0 ? '$' : '-$'}${Math.abs(netProfit).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Revenue minus expenses</div>
            </div>
        </div>
        
        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Revenue Chart -->
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
                    <span class="text-xs text-gray-500 dark:text-gray-400">Last 6 months</span>
                </div>
                <div class="h-64">
                    <canvas id="dashboardRevenueChart"></canvas>
                </div>
            </div>
            
            <!-- Quick Stats -->
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-6">Quick Stats</h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 -mx-3 px-3 rounded transition-colors" onclick="switchTab('clients')">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                            </div>
                            <div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">Total Clients</div>
                                <div class="text-lg font-semibold text-gray-900 dark:text-white">${clients.length}</div>
                            </div>
                        </div>
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                    
                    <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 -mx-3 px-3 rounded transition-colors" onclick="switchTab('invoices')">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                            </div>
                            <div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">Unpaid Invoices</div>
                                <div class="text-lg font-semibold text-gray-900 dark:text-white">$${totalUnpaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                        </div>
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                    
                    <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 -mx-3 px-3 rounded transition-colors" onclick="switchTab('quotes')">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                                </svg>
                            </div>
                            <div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">Pending Quotes</div>
                                <div class="text-lg font-semibold text-gray-900 dark:text-white">${pendingQuotes.length}</div>
                            </div>
                        </div>
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                    
                    <div class="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 -mx-3 px-3 rounded transition-colors" onclick="switchTab('schedule')">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                            </div>
                            <div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">Upcoming Jobs</div>
                                <div class="text-lg font-semibold text-gray-900 dark:text-white">${upcomingJobs.length}</div>
                            </div>
                        </div>
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Upcoming Jobs List (Simplified) -->
        ${upcomingJobs.length > 0 ? `
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">Upcoming Jobs</h3>
                    <button onclick="switchTab('schedule')" class="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">View all</button>
                </div>
            </div>
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
                ${upcomingJobs.map(job => {
                    const client = clients.find(c => c.id === job.client_id);
                    const jobDate = new Date(job.date);
                    const isTomorrow = job.date === tomorrow;
                    return `<div class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors" onclick="switchTab('schedule')">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <div class="font-medium text-gray-900 dark:text-white">${job.title}</div>
                                    ${isTomorrow ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Tomorrow</span>' : ''}
                                </div>
                                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">${client?.name || 'Unknown'}</div>
                            </div>
                            <div class="text-right ml-4">
                                <div class="text-sm text-gray-900 dark:text-white">${jobDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">${job.time}</div>
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>
        ` : ''}
    </div>`;
}

// Initialize dashboard charts (Xero-style minimal)
function initializeDashboardCharts() {
    const now = new Date();
    const monthLabels = [];
    const monthlyRevenue = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        monthLabels.push(monthKey);
        
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        
        const revenue = invoices
            .filter(inv => inv.status === 'paid' && new Date(inv.issue_date) >= monthStart && new Date(inv.issue_date) <= monthEnd)
            .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
        
        monthlyRevenue.push(revenue);
    }
    
    const revenueCtx = document.getElementById('dashboardRevenueChart');
    if (revenueCtx) {
        if (dashboardRevenueChartInstance) {
            dashboardRevenueChartInstance.destroy();
        }
        
        dashboardRevenueChartInstance = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Revenue',
                    data: monthlyRevenue,
                    borderColor: 'rgb(20, 184, 166)',
                    backgroundColor: 'rgba(20, 184, 166, 0.05)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgb(20, 184, 166)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return '$' + context.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            },
                            color: '#6B7280',
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#6B7280',
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }
}

console.log('✅ Professional Dashboard module loaded (Xero-inspired)');
