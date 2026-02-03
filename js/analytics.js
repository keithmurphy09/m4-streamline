// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Analytics Module (COMPLETE WITH CHARTS)
// ═══════════════════════════════════════════════════════════════════

// Chart instances (global to prevent re-initialization)
let revenueExpensesChartInstance = null;
let expensesCategoryChartInstance = null;

function renderAnalytics() {
    // Calculate key metrics
    const totalQuotes = quotes.length;
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted' || q.accepted).length;
    const quoteWinRate = totalQuotes > 0 ? ((acceptedQuotes / totalQuotes) * 100).toFixed(1) : 0;
    
    const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid').length;
    const outstandingRevenue = invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
    
    // Top clients by revenue
    const clientRevenue = {};
    invoices.filter(inv => inv.status === 'paid').forEach(inv => {
        const clientId = inv.client_id;
        if (!clientRevenue[clientId]) clientRevenue[clientId] = 0;
        clientRevenue[clientId] += inv.total || 0;
    });
    const topClients = Object.entries(clientRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([clientId, revenue]) => {
            const client = clients.find(c => c.id === clientId);
            return { name: client?.name || 'Unknown', revenue };
        });
    
    return `
        <div>
            <h2 class="text-2xl font-bold mb-6 dark:text-white">📊 Analytics & Insights</h2>
            
            <!-- Key Metrics Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-teal-500">
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Quote Win Rate</div>
                    <div class="text-3xl font-bold text-teal-600">${quoteWinRate}%</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${acceptedQuotes} of ${totalQuotes} quotes</div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Revenue</div>
                    <div class="text-3xl font-bold text-green-600">$${totalRevenue.toFixed(2)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${paidInvoices} paid invoices</div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-red-500">
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Expenses</div>
                    <div class="text-3xl font-bold text-red-600">$${totalExpenses.toFixed(2)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${expenses.length} expenses</div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-${netProfit >= 0 ? 'blue' : 'orange'}-500">
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Net Profit</div>
                    <div class="text-3xl font-bold text-${netProfit >= 0 ? 'blue' : 'orange'}-600">$${netProfit.toFixed(2)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${profitMargin}% margin</div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-orange-500">
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Outstanding</div>
                    <div class="text-3xl font-bold text-orange-600">$${outstandingRevenue.toFixed(2)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${unpaidInvoices} unpaid</div>
                </div>
            </div>
            
            <!-- Business Funnel -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                <h3 class="text-lg font-bold dark:text-white mb-4">Business Funnel</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded">
                        <div class="text-3xl font-bold text-blue-600">${totalQuotes}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">Quotes Sent</div>
                    </div>
                    <div class="text-center p-4 bg-teal-50 dark:bg-teal-900 rounded">
                        <div class="text-3xl font-bold text-teal-600">${acceptedQuotes}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">Quotes Accepted</div>
                    </div>
                    <div class="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded">
                        <div class="text-3xl font-bold text-purple-600">${invoices.length}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">Invoices Sent</div>
                    </div>
                    <div class="text-center p-4 bg-green-50 dark:bg-green-900 rounded">
                        <div class="text-3xl font-bold text-green-600">${paidInvoices}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">Invoices Paid</div>
                    </div>
                </div>
            </div>
            
            <!-- Top Clients -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                <h3 class="text-lg font-bold dark:text-white mb-4">Top 5 Clients by Revenue</h3>
                ${topClients.length > 0 ? `
                    <div class="space-y-3">
                        ${topClients.map((client, index) => `
                            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center font-bold text-teal-600">
                                        ${index + 1}
                                    </div>
                                    <span class="font-medium dark:text-white">${client.name}</span>
                                </div>
                                <span class="text-green-600 font-bold">$${client.revenue.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="text-center text-gray-500 dark:text-gray-400 py-8">No revenue data yet</div>'}
            </div>
            
            <!-- Chart Range Selector -->
            <div class="mb-4 flex justify-end">
                <select onchange="analyticsChartRange=this.value; renderApp();" class="px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 bg-white">
                    <option value="current" ${analyticsChartRange === 'current' ? 'selected' : ''}>Current Month</option>
                    <option value="3months" ${analyticsChartRange === '3months' ? 'selected' : ''}>Last 3 Months</option>
                    <option value="6months" ${analyticsChartRange === '6months' ? 'selected' : ''}>Last 6 Months</option>
                    <option value="12months" ${analyticsChartRange === '12months' ? 'selected' : ''}>Last 12 Months</option>
                    <option value="all" ${analyticsChartRange === 'all' ? 'selected' : ''}>All Time</option>
                </select>
            </div>
            
            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Revenue vs Expenses Chart -->
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 class="text-lg font-bold dark:text-white mb-4">Revenue vs Expenses</h3>
                    <div style="height: 300px; position: relative;">
                        <canvas id="revenueExpensesChart"></canvas>
                    </div>
                </div>
                
                <!-- Expenses by Category Chart -->
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 class="text-lg font-bold dark:text-white mb-4">Expenses by Category</h3>
                    <div style="height: 300px; position: relative;">
                        <canvas id="expensesCategoryChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Summary Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Clients</div>
                    <div class="text-2xl font-bold dark:text-teal-400">${clients.length}</div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Jobs</div>
                    <div class="text-2xl font-bold dark:text-teal-400">${jobs.length}</div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Avg Quote Value</div>
                    <div class="text-2xl font-bold dark:text-teal-400">$${totalQuotes > 0 ? (quotes.reduce((sum, q) => sum + (q.total || 0), 0) / totalQuotes).toFixed(2) : '0.00'}</div>
                </div>
            </div>
        </div>
    `;
}

// Initialize charts after rendering
function initializeCharts() {
    // Only run if we're on analytics tab
    if (activeTab !== 'analytics') return;
    
    // Destroy existing charts to prevent jumping/duplication
    if (revenueExpensesChartInstance) {
        revenueExpensesChartInstance.destroy();
        revenueExpensesChartInstance = null;
    }
    if (expensesCategoryChartInstance) {
        expensesCategoryChartInstance.destroy();
        expensesCategoryChartInstance = null;
    }
    
    // Determine how many months to show based on filter
    let monthsToShow;
    switch(analyticsChartRange) {
        case 'current':
            monthsToShow = 0; // Just current month
            break;
        case '3months':
            monthsToShow = 2; // Current + 2 previous
            break;
        case '6months':
            monthsToShow = 5; // Current + 5 previous
            break;
        case '12months':
            monthsToShow = 11; // Current + 11 previous
            break;
        case 'all':
            // Calculate all months that have data
            const allDates = [
                ...invoices.filter(i => i.paid_date).map(i => new Date(i.paid_date)),
                ...expenses.map(e => new Date(e.date))
            ];
            if (allDates.length === 0) {
                monthsToShow = 5; // Default to 6 months if no data
            } else {
                const oldestDate = new Date(Math.min(...allDates));
                const now = new Date();
                monthsToShow = (now.getFullYear() - oldestDate.getFullYear()) * 12 + (now.getMonth() - oldestDate.getMonth());
            }
            break;
        default:
            monthsToShow = 0;
    }
    
    // Calculate monthly expenses
    const monthlyExpenses = {};
    const now = new Date();
    for (let i = monthsToShow; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyExpenses[key] = 0;
    }
    expenses.forEach(exp => {
        const expDate = new Date(exp.date);
        const key = expDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (monthlyExpenses[key] !== undefined) {
            monthlyExpenses[key] += parseFloat(exp.amount || 0);
        }
    });
    
    // Calculate monthly revenue
    const monthlyRevenue = {};
    for (let i = monthsToShow; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyRevenue[key] = 0;
    }
    invoices.filter(inv => inv.status === 'paid' && inv.paid_date).forEach(inv => {
        const paidDate = new Date(inv.paid_date);
        const key = paidDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (monthlyRevenue[key] !== undefined) {
            monthlyRevenue[key] += inv.total || 0;
        }
    });
    
    const months = Object.keys(monthlyRevenue);
    const revenueData = Object.values(monthlyRevenue);
    const expensesData = Object.values(monthlyExpenses);
    
    // Revenue vs Expenses Line Chart
    const ctx1 = document.getElementById('revenueExpensesChart');
    if (ctx1) {
        revenueExpensesChartInstance = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Revenue',
                        data: revenueData,
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: expensesData,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false, // DISABLE ANIMATIONS - prevents sliding
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Expenses by Category Pie Chart
    const expensesByCategory = {};
    expenses.forEach(exp => {
        const category = exp.category || 'Other';
        if (!expensesByCategory[category]) expensesByCategory[category] = 0;
        expensesByCategory[category] += parseFloat(exp.amount || 0);
    });
    
    const categories = Object.keys(expensesByCategory);
    const categoryAmounts = Object.values(expensesByCategory);
    const colors = [
        'rgb(59, 130, 246)',
        'rgb(239, 68, 68)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)',
        'rgb(20, 184, 166)',
        'rgb(249, 115, 22)'
    ];
    
    const ctx2 = document.getElementById('expensesCategoryChart');
    if (ctx2 && categories.length > 0) {
        expensesCategoryChartInstance = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: categoryAmounts,
                    backgroundColor: colors.slice(0, categories.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false, // DISABLE ANIMATIONS - prevents sliding
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': $' + context.parsed.toFixed(2) + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
}

console.log('✅ Analytics module loaded (COMPLETE WITH CHARTS)');
