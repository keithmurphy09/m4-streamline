// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Professional Dashboard (Based on Mockup)
// ═════════════════════════════════════════════════════════════════

let dashboardRevenueChartInstance = null;
let dashboardExpenseChartInstance = null;

function renderDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const upcomingJobs = jobs.filter(j => j.date >= today).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);
    const tomorrowJobs = jobs.filter(j => j.date === tomorrow);
    const pendingQuotes = quotes.filter(q => q.status === 'pending' && !q.accepted);
    const acceptedQuotes = quotes.filter(q => q.accepted || q.status === 'accepted');
    const unpaidInvoices = invoices.filter(i => i.status === 'unpaid').slice(0, 4);
    
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
    const totalUnpaid = invoices.filter(i => i.status === 'unpaid').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
    
    // Last 30 days revenue
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRevenue = invoices.filter(i => i.status === 'paid' && new Date(i.issue_date) >= thirtyDaysAgo).reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    
    // Revenue growth
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const previousMonthRevenue = invoices.filter(i => i.status === 'paid' && new Date(i.issue_date) >= sixtyDaysAgo && new Date(i.issue_date) < thirtyDaysAgo).reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const revenueGrowth = previousMonthRevenue > 0 ? (((recentRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1) : 0;
    
    // Active jobs count
    const activeJobs = jobs.filter(j => j.date >= today).length;
    
    // Current date display
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateString = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    return `<div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Page Header -->
        <div class="flex justify-between items-start">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Your business at a glance</p>
            </div>
            <div class="text-right">
                <div class="text-sm text-gray-500 dark:text-gray-400">${dayName}</div>
                <div class="text-lg font-semibold text-gray-900 dark:text-white">${dateString}</div>
            </div>
        </div>
        
        ${!companySettings?.business_name && !companySettings?.phone ? `
        <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
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
        
        ${!localStorage.getItem('userGuideDismissed') ? `
        <div id="userGuideBanner" class="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4">
            <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
                <div class="flex-1">
                    <p class="text-sm font-medium text-teal-900 dark:text-teal-200">New to M4 Streamline?</p>
                    <p class="text-sm text-teal-700 dark:text-teal-300 mt-1">Check out our comprehensive <button onclick="dismissUserGuide(); downloadUserGuide();" class="underline font-medium hover:text-teal-900 dark:hover:text-teal-100">User Guide</button> for a complete walkthrough.</p>
                </div>
                <button onclick="dismissUserGuide()" class="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>
        ` : ''}
        
        <!-- Key Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <!-- Total Revenue -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="switchTab('analytics')">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    ${revenueGrowth != 0 ? `
                    <div class="flex items-center gap-1 text-xs font-medium ${revenueGrowth > 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${revenueGrowth > 0 ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}"></path>
                        </svg>
                        ${Math.abs(revenueGrowth)}%
                    </div>
                    ` : ''}
                </div>
                <div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Revenue</div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">$${totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">$${recentRevenue.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} this month</div>
                </div>
            </div>
            
            <!-- Net Profit -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="switchTab('analytics')">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div class="text-xs font-medium ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                        ${profitMargin}% margin
                    </div>
                </div>
                <div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Net Profit</div>
                    <div class="text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">$${Math.abs(netProfit).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">$${totalExpenses.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})} expenses</div>
                </div>
            </div>
            
            <!-- Outstanding Invoices -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="switchTab('invoices')">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    ${overdueInvoices.length > 0 ? `
                    <div class="text-xs font-medium text-red-600 dark:text-red-400">
                        ${overdueInvoices.length} overdue
                    </div>
                    ` : ''}
                </div>
                <div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Outstanding</div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">$${totalUnpaid.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${invoices.filter(i => i.status === 'unpaid').length} unpaid invoices</div>
                </div>
            </div>
            
            <!-- Active Jobs -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="switchTab('schedule')">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    ${pendingQuotes.length > 0 ? `
                    <div class="text-xs font-medium text-blue-600 dark:text-blue-400">
                        ${pendingQuotes.length} pending
                    </div>
                    ` : ''}
                </div>
                <div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Active Jobs</div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">${activeJobs}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${acceptedQuotes.length} accepted quotes</div>
                </div>
            </div>
            
        </div>
        
        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Revenue Trend Chart -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
                <div class="relative h-64">
                    <canvas id="dashboardRevenueChart"></canvas>
                </div>
            </div>
            
            <!-- Expense Breakdown Chart -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
                <div class="relative h-64">
                    <canvas id="dashboardExpenseChart"></canvas>
                </div>
            </div>
            
        </div>
        
        <!-- Bottom Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Upcoming Jobs -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Jobs</h3>
                        <button onclick="switchTab('schedule')" class="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">
                            View All →
                        </button>
                    </div>
                </div>
                <div class="divide-y divide-gray-100 dark:divide-gray-700">
                    ${upcomingJobs.length === 0 ? `
                        <div class="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No upcoming jobs scheduled
                        </div>
                    ` : upcomingJobs.map(job => {
                        const client = clients.find(c => c.id === job.client_id);
                        const jobDate = new Date(job.date);
                        const daysUntil = Math.ceil((jobDate - new Date()) / (1000 * 60 * 60 * 24));
                        return `
                        <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onclick="switchTab('schedule')">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="text-sm font-medium text-gray-900 dark:text-white">${job.title}</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${client?.name || 'Unknown'}</div>
                                </div>
                                <div class="text-right ml-4">
                                    <div class="text-xs font-medium text-gray-900 dark:text-white">${jobDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">${daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : daysUntil + ' days'}</div>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- Outstanding Invoices -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Outstanding Invoices</h3>
                        <button onclick="switchTab('invoices')" class="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">
                            View All →
                        </button>
                    </div>
                </div>
                <div class="divide-y divide-gray-100 dark:divide-gray-700">
                    ${unpaidInvoices.length === 0 ? `
                        <div class="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No outstanding invoices
                        </div>
                    ` : unpaidInvoices.map(inv => {
                        const client = clients.find(c => c.id === inv.client_id);
                        const dueDate = inv.due_date ? new Date(inv.due_date) : null;
                        const isOverdue = dueDate && dueDate < todayDate;
                        const daysOverdue = isOverdue ? Math.ceil((todayDate - dueDate) / (1000 * 60 * 60 * 24)) : 0;
                        return `
                        <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onclick="switchTab('invoices')">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <div class="text-sm font-medium text-gray-900 dark:text-white">${inv.invoice_number || 'INV-' + inv.id.slice(0,6)}</div>
                                        ${isOverdue ? `
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                            ${daysOverdue}d overdue
                                        </span>
                                        ` : ''}
                                    </div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${client?.name || 'Unknown'}</div>
                                </div>
                                <div class="text-right ml-4">
                                    <div class="text-sm font-semibold text-gray-900 dark:text-white">$${(inv.total || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">Due ${dueDate ? dueDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
        </div>
        
        <!-- Quick Actions -->
        <div class="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onclick="openModal('quote')" class="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm">
                    + Create Quote
                </button>
                <button onclick="openModal('invoice')" class="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm">
                    + Create Invoice
                </button>
                <button onclick="openModal('job')" class="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm">
                    + Schedule Job
                </button>
                <button onclick="openModal('expense')" class="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm">
                    + Add Expense
                </button>
            </div>
        </div>
        
    </div>`;
}

// Initialize dashboard charts
function initializeDashboardCharts() {
    console.log('🎨 Initializing dashboard charts...');
    
    // Revenue Trend Chart
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
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                            }
                        }
                    }
                }
            }
        });
        console.log('✅ Revenue chart created!');
    }
    
    // Expense Breakdown Chart
    const categories = {};
    expenses.forEach(exp => {
        const cat = exp.category || 'Other';
        categories[cat] = (categories[cat] || 0) + parseFloat(exp.amount || 0);
    });
    
    const expenseLabels = Object.keys(categories);
    const expenseData = Object.values(categories);
    const colors = [
        'rgb(20, 184, 166)',
        'rgb(59, 130, 246)',
        'rgb(249, 115, 22)',
        'rgb(236, 72, 153)',
        'rgb(139, 92, 246)',
        'rgb(34, 197, 94)'
    ];
    
    const expenseCtx = document.getElementById('dashboardExpenseChart');
    if (expenseCtx) {
        if (dashboardExpenseChartInstance) {
            dashboardExpenseChartInstance.destroy();
        }
        
        dashboardExpenseChartInstance = new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: expenseLabels,
                datasets: [{
                    data: expenseData,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = '$' + context.parsed.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return label + ': ' + value + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
        console.log('✅ Expense chart created!');
    }
}

// Dismiss user guide banner
function dismissUserGuide() {
    localStorage.setItem('userGuideDismissed', 'true');
    const banner = document.getElementById('userGuideBanner');
    if (banner) {
        banner.style.opacity = '0';
        banner.style.transition = 'opacity 0.3s';
        setTimeout(() => {
            renderApp();
        }, 300);
    }
}

console.log('✅ Professional Dashboard module loaded (Mockup Design)');
