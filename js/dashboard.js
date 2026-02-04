// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Dashboard Module (Professional Data Center)
// ═══════════════════════════════════════════════════════════════════

function renderDashboard() {
    // Calculate key metrics
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Revenue metrics
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    
    const thisMonthRevenue = paidInvoices
        .filter(i => {
            const paidDate = new Date(i.paid_date || i.created_at);
            return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear;
        })
        .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    
    const lastMonthRevenue = paidInvoices
        .filter(i => {
            const paidDate = new Date(i.paid_date || i.created_at);
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return paidDate.getMonth() === lastMonth && paidDate.getFullYear() === lastMonthYear;
        })
        .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    
    const revenueChange = lastMonthRevenue > 0 
        ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
        : 0;
    
    // Expenses metrics
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const thisMonthExpenses = expenses
        .filter(e => {
            const expDate = new Date(e.date);
            return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    
    // Profit
    const totalProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;
    
    // Outstanding invoices
    const unpaidInvoices = invoices.filter(i => i.status === 'unpaid');
    const totalOutstanding = unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    
    const overdueInvoices = unpaidInvoices.filter(i => {
        if (!i.due_date) return false;
        return new Date(i.due_date) < today;
    });
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    
    // Active jobs
    const activeJobs = jobs.filter(j => j.status !== 'completed').length;
    const upcomingJobs = jobs.filter(j => new Date(j.date) >= today && j.status !== 'completed')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    
    // Pending quotes
    const pendingQuotes = quotes.filter(q => !q.accepted && q.status !== 'converted').length;
    const acceptedQuotes = quotes.filter(q => q.accepted || q.status === 'accepted').length;
    
    setTimeout(() => initCharts(), 100);
    
    return `<div class="space-y-6">
        
        <!-- Page Header -->
        <div class="flex justify-between items-start">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Your business at a glance</p>
            </div>
            <div class="text-right">
                <div class="text-sm text-gray-500 dark:text-gray-400">${today.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                <div class="text-lg font-semibold text-gray-900 dark:text-white">${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
        </div>
        
        <!-- Key Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <!-- Total Revenue -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    ${Math.abs(revenueChange) > 0 ? `<div class="flex items-center gap-1 text-xs font-medium ${revenueChange > 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${revenueChange > 0 ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}"></path>
                        </svg>
                        ${Math.abs(revenueChange)}%
                    </div>` : ''}
                </div>
                <div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Revenue</div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">${formatCurrency(totalRevenue)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${formatCurrency(thisMonthRevenue)} this month</div>
                </div>
            </div>
            
            <!-- Net Profit -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 ${totalProfit >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'} rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div class="text-xs font-medium ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                        ${profitMargin}% margin
                    </div>
                </div>
                <div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Net Profit</div>
                    <div class="text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">${formatCurrency(totalProfit)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${formatCurrency(totalExpenses)} expenses</div>
                </div>
            </div>
            
            <!-- Outstanding Invoices -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    ${overdueInvoices.length > 0 ? `<div class="text-xs font-medium text-red-600 dark:text-red-400">
                        ${overdueInvoices.length} overdue
                    </div>` : ''}
                </div>
                <div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Outstanding</div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">${formatCurrency(totalOutstanding)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${unpaidInvoices.length} unpaid invoice${unpaidInvoices.length !== 1 ? 's' : ''}</div>
                </div>
            </div>
            
            <!-- Active Jobs -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    ${pendingQuotes > 0 ? `<div class="text-xs font-medium text-blue-600 dark:text-blue-400">
                        ${pendingQuotes} pending
                    </div>` : ''}
                </div>
                <div>
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Active Jobs</div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">${activeJobs}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${acceptedQuotes} accepted quote${acceptedQuotes !== 1 ? 's' : ''}</div>
                </div>
            </div>
            
        </div>
        
        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Revenue Trend Chart -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
                <div class="relative h-64">
                    <canvas id="revenueChart"></canvas>
                </div>
            </div>
            
            <!-- Expense Breakdown Chart -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
                <div class="relative h-64">
                    <canvas id="expenseChart"></canvas>
                </div>
            </div>
            
        </div>
        
        <!-- Bottom Section: Upcoming Jobs & Recent Activity -->
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
                        <div class="p-6 text-center text-gray-500 dark:text-gray-400">
                            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p class="text-sm">No upcoming jobs scheduled</p>
                        </div>
                    ` : upcomingJobs.map(job => {
                        const client = clients.find(c => c.id === job.client_id);
                        const daysUntil = Math.ceil((new Date(job.date) - today) / (1000 * 60 * 60 * 24));
                        return `
                            <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors" onclick="switchTab('schedule'); openJobDetail(${JSON.stringify(job).replace(/"/g, '&quot;')})">
                                <div class="flex items-start justify-between">
                                    <div class="flex-1">
                                        <div class="text-sm font-medium text-gray-900 dark:text-white">${job.title}</div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${client?.name || 'Unknown'}</div>
                                    </div>
                                    <div class="text-right ml-4">
                                        <div class="text-xs font-medium text-gray-900 dark:text-white">${formatDate(job.date)}</div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">${daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}</div>
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
                        <div class="p-6 text-center text-gray-500 dark:text-gray-400">
                            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p class="text-sm">All invoices paid!</p>
                        </div>
                    ` : unpaidInvoices.slice(0, 5).map(inv => {
                        const client = clients.find(c => c.id === inv.client_id);
                        const isOverdue = inv.due_date && new Date(inv.due_date) < today;
                        const daysOverdue = isOverdue ? Math.ceil((today - new Date(inv.due_date)) / (1000 * 60 * 60 * 24)) : 0;
                        return `
                            <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors" onclick="switchTab('invoices'); openInvoiceDetail(${JSON.stringify(inv).replace(/"/g, '&quot;')})">
                                <div class="flex items-start justify-between">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2">
                                            <div class="text-sm font-medium text-gray-900 dark:text-white">${inv.invoice_number || 'INV-' + inv.id.slice(0, 3)}</div>
                                            ${isOverdue ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                                                ${daysOverdue}d overdue
                                            </span>` : ''}
                                        </div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${client?.name || 'Unknown'}</div>
                                    </div>
                                    <div class="text-right ml-4">
                                        <div class="text-sm font-semibold text-gray-900 dark:text-white">${formatCurrency(inv.total)}</div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">${inv.due_date ? 'Due ' + formatDate(inv.due_date) : 'No due date'}</div>
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

function initCharts() {
    initRevenueChart();
    initExpenseChart();
}

function initRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    
    // Get last 6 months of revenue data
    const today = new Date();
    const months = [];
    const revenueData = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        months.push(monthName);
        
        const monthRevenue = invoices
            .filter(inv => {
                if (inv.status !== 'paid') return false;
                const paidDate = new Date(inv.paid_date || inv.created_at);
                return paidDate.getMonth() === date.getMonth() && paidDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
        
        revenueData.push(monthRevenue);
    }
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Revenue',
                data: revenueData,
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
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Revenue: $' + context.parsed.y.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                        }
                    }
                }
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
}

function initExpenseChart() {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    
    // Group expenses by category
    const categories = {};
    expenses.forEach(exp => {
        const category = exp.category || 'Other';
        categories[category] = (categories[category] || 0) + parseFloat(exp.amount || 0);
    });
    
    const labels = Object.keys(categories);
    const data = Object.values(categories);
    
    // Colors for categories
    const colors = [
        'rgb(20, 184, 166)',   // teal
        'rgb(59, 130, 246)',   // blue
        'rgb(249, 115, 22)',   // orange
        'rgb(236, 72, 153)',   // pink
        'rgb(139, 92, 246)',   // purple
        'rgb(34, 197, 94)',    // green
        'rgb(251, 191, 36)',   // yellow
        'rgb(239, 68, 68)'     // red
    ];
    
    if (labels.length === 0) {
        canvas.parentElement.innerHTML = '<div class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">No expense data yet</div>';
        return;
    }
    
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
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
                        font: {
                            size: 11
                        }
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
}

console.log('✅ Dashboard module loaded (Professional Data Center)');
