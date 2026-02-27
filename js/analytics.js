// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Enhanced Analytics Module
// ═══════════════════════════════════════════════════════════════════

// Chart instances (global to prevent re-initialization)
let revenueExpensesChartInstance = null;
let expensesCategoryChartInstance = null;
let profitabilityChartInstance = null;

// Analytics comparison period (new variable, not in config.js)
if (typeof analyticsComparisonPeriod === 'undefined') {
    var analyticsComparisonPeriod = 'none'; // 'none', 'previous', 'year'
}

// Helper: Get date range based on filter
function getAnalyticsDateRange(rangeType) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    switch(rangeType) {
        case 'current':
            return {
                start: new Date(currentYear, currentMonth, 1),
                end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59),
                label: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            };
        case '3months':
            return {
                start: new Date(currentYear, currentMonth - 2, 1),
                end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59),
                label: 'Last 3 Months'
            };
        case '6months':
            return {
                start: new Date(currentYear, currentMonth - 5, 1),
                end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59),
                label: 'Last 6 Months'
            };
        case '12months':
            return {
                start: new Date(currentYear, currentMonth - 11, 1),
                end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59),
                label: 'Last 12 Months'
            };
        case 'all':
        default:
            return {
                start: new Date(2020, 0, 1),
                end: now,
                label: 'All Time'
            };
    }
}

// Helper: Get comparison period
function getComparisonDateRange(baseRange) {
    if (analyticsComparisonPeriod === 'none') return null;
    
    const baseStart = new Date(baseRange.start);
    const baseEnd = new Date(baseRange.end);
    const duration = baseEnd - baseStart;
    
    if (analyticsComparisonPeriod === 'previous') {
        return {
            start: new Date(baseStart.getTime() - duration),
            end: new Date(baseEnd.getTime() - duration),
            label: 'Previous Period'
        };
    } else if (analyticsComparisonPeriod === 'year') {
        return {
            start: new Date(baseStart.getFullYear() - 1, baseStart.getMonth(), baseStart.getDate()),
            end: new Date(baseEnd.getFullYear() - 1, baseEnd.getMonth(), baseEnd.getDate()),
            label: 'Same Period Last Year'
        };
    }
    return null;
}

// Helper: Filter data by date range
function filterByDateRange(items, dateField, range) {
    return items.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= range.start && itemDate <= range.end;
    });
}

// Helper: Calculate metrics for period
function calculatePeriodMetrics(range) {
    const periodInvoices = filterByDateRange(invoices, 'issue_date', range);
    const periodExpenses = filterByDateRange(expenses, 'date', range);
    const periodQuotes = filterByDateRange(quotes, 'created_at', range);
    
    const paidInvoices = periodInvoices.filter(inv => inv.status === 'paid');
    const revenue = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const expenseTotal = periodExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const profit = revenue - expenseTotal;
    const margin = revenue > 0 ? ((profit / revenue) * 100) : 0;
    
    const acceptedQuotes = periodQuotes.filter(q => q.status === 'accepted' || q.accepted).length;
    const conversionRate = periodQuotes.length > 0 ? ((acceptedQuotes / periodQuotes.length) * 100) : 0;
    
    return {
        revenue,
        expenses: expenseTotal,
        profit,
        margin,
        invoiceCount: periodInvoices.length,
        paidCount: paidInvoices.length,
        quoteCount: periodQuotes.length,
        acceptedCount: acceptedQuotes,
        conversionRate,
        avgInvoiceValue: paidInvoices.length > 0 ? revenue / paidInvoices.length : 0
    };
}

// Helper: Calculate trend
function calculateTrend(current, comparison) {
    if (!comparison || comparison === 0) return { percent: 0, direction: 'neutral' };
    const percent = ((current - comparison) / comparison * 100);
    return {
        percent: Math.abs(percent).toFixed(1),
        direction: percent > 0 ? 'up' : percent < 0 ? 'down' : 'neutral'
    };
}

function renderAnalytics() {
    // Get date ranges
    const currentRange = getAnalyticsDateRange(analyticsChartRange);
    const comparisonRange = getComparisonDateRange(currentRange);
    
    // Calculate current metrics
    const current = calculatePeriodMetrics(currentRange);
    
    // Calculate comparison metrics if enabled
    let comparison = null;
    let trends = {};
    if (comparisonRange) {
        comparison = calculatePeriodMetrics(comparisonRange);
        trends = {
            revenue: calculateTrend(current.revenue, comparison.revenue),
            expenses: calculateTrend(current.expenses, comparison.expenses),
            profit: calculateTrend(current.profit, comparison.profit),
            conversion: calculateTrend(current.conversionRate, comparison.conversionRate)
        };
    }
    
    // Calculate profitability per client
    const clientProfitability = {};
    const periodInvoices = filterByDateRange(invoices.filter(inv => inv.status === 'paid'), 'issue_date', currentRange);
    
    periodInvoices.forEach(inv => {
        const clientId = inv.client_id;
        if (!clientProfitability[clientId]) {
            clientProfitability[clientId] = { revenue: 0, expenses: 0, profit: 0, jobs: 0 };
        }
        clientProfitability[clientId].revenue += inv.total || 0;
        clientProfitability[clientId].jobs++;
        
        // Find related job expenses
        const relatedJob = jobs.find(j => j.title === inv.title && j.client_id === inv.client_id);
        if (relatedJob) {
            const jobExpenses = expenses.filter(e => 
                (e.job_id === relatedJob.id || e.jobId === relatedJob.id) ||
                (e.description?.toLowerCase().includes(relatedJob.title?.toLowerCase()))
            );
            const expenseTotal = jobExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
            clientProfitability[clientId].expenses += expenseTotal;
        }
    });
    
    // Calculate profit and margin
    Object.keys(clientProfitability).forEach(clientId => {
        const data = clientProfitability[clientId];
        data.profit = data.revenue - data.expenses;
        data.margin = data.revenue > 0 ? ((data.profit / data.revenue) * 100) : 0;
    });
    
    // Sort by profit
    const topProfitableClients = Object.entries(clientProfitability)
        .map(([clientId, data]) => {
            const client = clients.find(c => c.id === clientId);
            return { ...data, clientId, name: client?.name || 'Unknown' };
        })
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 5);
    
    // Render trend indicator
    const renderTrend = (trend, invertColors = false) => {
        if (!trend || trend.direction === 'neutral') return '';
        const isPositive = invertColors ? trend.direction === 'down' : trend.direction === 'up';
        const color = isPositive ? 'text-green-600' : 'text-red-600';
        const arrow = trend.direction === 'up' ? '↑' : '↓';
        return `<span class="${color} text-sm font-medium ml-2">${arrow} ${trend.percent}%</span>`;
    };
    
    return `
        <div>
            <!-- Header with Filters -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <h2 class="text-2xl font-bold dark:text-white">Analytics & Insights</h2>
                
                <div class="flex gap-3 flex-wrap">
                    <!-- Period Selector -->
                    <select onchange="analyticsChartRange=this.value; renderApp();" class="px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 bg-white text-sm">
                        <option value="current" ${analyticsChartRange === 'current' ? 'selected' : ''}>This Month</option>
                        <option value="3months" ${analyticsChartRange === '3months' ? 'selected' : ''}>Last 3 Months</option>
                        <option value="6months" ${analyticsChartRange === '6months' ? 'selected' : ''}>Last 6 Months</option>
                        <option value="12months" ${analyticsChartRange === '12months' ? 'selected' : ''}>Last 12 Months</option>
                        <option value="all" ${analyticsChartRange === 'all' ? 'selected' : ''}>All Time</option>
                    </select>
                    
                    <!-- Comparison Selector -->
                    <select onchange="analyticsComparisonPeriod=this.value; renderApp();" class="px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 bg-white text-sm">
                        <option value="none" ${analyticsComparisonPeriod === 'none' ? 'selected' : ''}>No Comparison</option>
                        <option value="previous" ${analyticsComparisonPeriod === 'previous' ? 'selected' : ''}>vs Previous Period</option>
                        <option value="year" ${analyticsComparisonPeriod === 'year' ? 'selected' : ''}>vs Last Year</option>
                    </select>
                </div>
            </div>
            
            <!-- Period Label -->
            <div class="mb-4">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                    Showing data for: <span class="font-semibold text-gray-900 dark:text-white">${currentRange.label}</span>
                    ${comparisonRange ? `<span class="ml-2">compared to ${comparisonRange.label}</span>` : ''}
                </div>
            </div>
            
            <!-- Actionable Alerts (Clickable) -->
            ${(() => {
                const overdueInvoices = invoices.filter(inv => {
                    if (inv.status === 'paid') return false;
                    const dueDate = new Date(inv.due_date);
                    return dueDate < new Date();
                });
                
                const unpaidQuotes = quotes.filter(q => 
                    (q.status === 'accepted' || q.accepted) && q.status !== 'converted'
                );
                const unpaidQuotesValue = unpaidQuotes.reduce((sum, q) => sum + (q.total || 0), 0);
                
                // Get current period expenses and find highest category
                const periodExpenses = filterByDateRange(expenses, 'date', currentRange);
                const categoryTotals = {};
                periodExpenses.forEach(e => {
                    const cat = e.category || 'Uncategorized';
                    categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(e.amount || 0);
                });
                const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
                
                const alerts = [];
                
                if (overdueInvoices.length > 0) {
                    alerts.push(`
                        <div onclick="switchTab('invoices'); invoiceFilter='unpaid'; renderApp();" class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-lg border-l-4 border-red-500 cursor-pointer hover:shadow-lg transition-all">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="text-sm font-semibold text-red-700 dark:text-red-400">⚠️ ${overdueInvoices.length} Invoice${overdueInvoices.length > 1 ? 's' : ''} Overdue</div>
                                    <div class="text-xs text-red-600 dark:text-red-300 mt-1">Click to review and follow up</div>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                    `);
                }
                
                if (unpaidQuotes.length > 0) {
                    alerts.push(`
                        <div onclick="switchTab('quotes'); renderApp();" class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-all">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="text-sm font-semibold text-blue-700 dark:text-blue-400">📊 $${unpaidQuotesValue.toFixed(0)} in Accepted Quotes</div>
                                    <div class="text-xs text-blue-600 dark:text-blue-300 mt-1">${unpaidQuotes.length} quote${unpaidQuotes.length > 1 ? 's' : ''} ready to convert to invoice</div>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                    `);
                }
                
                if (highestCategory) {
                    alerts.push(`
                        <div onclick="switchTab('expenses'); expenseFilter='all'; renderApp();" class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition-all">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="text-sm font-semibold text-purple-700 dark:text-purple-400">💰 Highest Expense: ${highestCategory[0]}</div>
                                    <div class="text-xs text-purple-600 dark:text-purple-300 mt-1">$${highestCategory[1].toFixed(2)} this period</div>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                    `);
                }
                
                return alerts.length > 0 ? `
                    <div class="grid grid-cols-1 md:grid-cols-${Math.min(alerts.length, 3)} gap-4 mb-6">
                        ${alerts.join('')}
                    </div>
                ` : '';
            })()}
            
            <!-- Key Metrics Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Revenue</div>
                    <div class="text-3xl font-bold text-green-600">
                        $${current.revenue.toFixed(2)}
                        ${trends.revenue ? renderTrend(trends.revenue) : ''}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${current.paidCount} paid invoices</div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-red-500">
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Expenses</div>
                    <div class="text-3xl font-bold text-red-600">
                        $${current.expenses.toFixed(2)}
                        ${trends.expenses ? renderTrend(trends.expenses, true) : ''}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Total spending</div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-${current.profit >= 0 ? 'blue' : 'orange'}-500">
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Net Profit</div>
                    <div class="text-3xl font-bold text-${current.profit >= 0 ? 'blue' : 'orange'}-600">
                        $${current.profit.toFixed(2)}
                        ${trends.profit ? renderTrend(trends.profit) : ''}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${current.margin.toFixed(1)}% margin</div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-teal-500">
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Quote Win Rate</div>
                    <div class="text-3xl font-bold text-teal-600">
                        ${current.conversionRate.toFixed(1)}%
                        ${trends.conversion ? renderTrend(trends.conversion) : ''}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${current.acceptedCount} of ${current.quoteCount} accepted</div>
                </div>
            </div>
            
            <!-- Quick Insights Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-5 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">Avg Invoice Value</div>
                            <div class="text-2xl font-bold text-purple-900 dark:text-purple-100">$${current.avgInvoiceValue.toFixed(2)}</div>
                        </div>
                        
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-sm text-indigo-700 dark:text-indigo-300 font-medium mb-1">Total Jobs</div>
                            <div class="text-2xl font-bold text-indigo-900 dark:text-indigo-100">${current.paidCount}</div>
                        </div>
                        <div class="text-4xl opacity-50">📋</div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-1">Profit per Job</div>
                            <div class="text-2xl font-bold text-emerald-900 dark:text-emerald-100">$${current.paidCount > 0 ? (current.profit / current.paidCount).toFixed(2) : '0.00'}</div>
                        </div>
                        
                    </div>
                </div>
            </div>
            
            <!-- Most Profitable Clients -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                <h3 class="text-lg font-bold dark:text-white mb-4">💎 Most Profitable Clients (${currentRange.label})</h3>
                ${topProfitableClients.length > 0 ? `
                    <div class="space-y-3">
                        ${topProfitableClients.map((client, index) => `
                            <div onclick="switchTab('invoices'); clientSearch='${client.name}'; renderApp();" class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                                <div class="flex items-center gap-4 flex-1">
                                    <div class="w-10 h-10 rounded-full ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-teal-100 dark:bg-teal-900'} flex items-center justify-center font-bold text-white shadow-md">
                                        ${index + 1}
                                    </div>
                                    <div class="flex-1">
                                        <div class="font-semibold dark:text-white">${client.name}</div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">${client.jobs} job${client.jobs !== 1 ? 's' : ''} • ${client.margin.toFixed(1)}% margin • Click to view invoices</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-lg font-bold ${client.profit >= 0 ? 'text-green-600' : 'text-red-600'}">
                                        $${client.profit.toFixed(2)}
                                    </div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">$${client.revenue.toFixed(2)} revenue</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="text-center text-gray-500 dark:text-gray-400 py-12">No profitability data for this period</div>'}
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
            
            <!-- Business Funnel -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 class="text-lg font-bold dark:text-white mb-4">Business Funnel (${currentRange.label})</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div class="text-4xl font-bold text-blue-600 dark:text-blue-400">${current.quoteCount}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">Quotes Sent</div>
                    </div>
                    <div class="text-center p-6 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 rounded-lg border border-teal-200 dark:border-teal-700">
                        <div class="text-4xl font-bold text-teal-600 dark:text-teal-400">${current.acceptedCount}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">Quotes Accepted</div>
                        <div class="text-xs text-teal-600 dark:text-teal-400 mt-1">${current.conversionRate.toFixed(0)}% rate</div>
                    </div>
                    <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div class="text-4xl font-bold text-purple-600 dark:text-purple-400">${current.invoiceCount}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">Invoices Sent</div>
                    </div>
                    <div class="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg border border-green-200 dark:border-green-700">
                        <div class="text-4xl font-bold text-green-600 dark:text-green-400">${current.paidCount}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">Invoices Paid</div>
                        <div class="text-xs text-green-600 dark:text-green-400 mt-1">$${current.revenue.toFixed(0)}</div>
                    </div>
                </div>
            </div>
            
            ${getAccountType() === 'business' && teamMembers.length > 0 ? renderTeamPerformance() : ''}
        </div>
    `;
}

// Initialize charts after rendering
function initializeCharts() {
    // Only run if we're on analytics tab
    if (activeTab !== 'analytics') return;
    
    // Check if chart canvases exist
    if (document.getElementById('revenueExpensesChart')) {
        initRevenueExpensesChart();
        initExpensesCategoryChart();
    }
}

function initRevenueExpensesChart() {
    const canvas = document.getElementById('revenueExpensesChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (revenueExpensesChartInstance) {
        revenueExpensesChartInstance.destroy();
    }
    
    const range = getAnalyticsDateRange(analyticsChartRange);
    const monthsToShow = analyticsChartRange === 'current' ? 1 : 
                        analyticsChartRange === '3months' ? 3 :
                        analyticsChartRange === '6months' ? 6 : 12;
    
    const labels = [];
    const revenueData = [];
    const expensesData = [];
    
    const now = new Date();
    for (let i = monthsToShow - 1; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        labels.push(monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        
        const monthInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.issue_date);
            return inv.status === 'paid' && invDate >= monthDate && invDate <= monthEnd;
        });
        const monthExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate >= monthDate && expDate <= monthEnd;
        });
        
        revenueData.push(monthInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0));
        expensesData.push(monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0));
    }
    
    revenueExpensesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: revenueData,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Expenses',
                    data: expensesData,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

function initExpensesCategoryChart() {
    const canvas = document.getElementById('expensesCategoryChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (expensesCategoryChartInstance) {
        expensesCategoryChartInstance.destroy();
    }
    
    const range = getAnalyticsDateRange(analyticsChartRange);
    const periodExpenses = filterByDateRange(expenses, 'date', range);
    
    const categoryTotals = {};
    periodExpenses.forEach(exp => {
        const category = exp.category || 'Other';
        if (!categoryTotals[category]) categoryTotals[category] = 0;
        categoryTotals[category] += parseFloat(exp.amount || 0);
    });
    
    const categories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);
    const amounts = categories.map(cat => categoryTotals[cat]);
    
    const colors = [
        'rgba(59, 130, 246, 0.8)',  // Blue
        'rgba(239, 68, 68, 0.8)',   // Red
        'rgba(34, 197, 94, 0.8)',   // Green
        'rgba(251, 191, 36, 0.8)',  // Yellow
        'rgba(168, 85, 247, 0.8)',  // Purple
        'rgba(236, 72, 153, 0.8)',  // Pink
        'rgba(20, 184, 166, 0.8)',  // Teal
        'rgba(249, 115, 22, 0.8)'   // Orange
    ];
    
    expensesCategoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': $' + context.parsed.toFixed(2) + ' (' + percent + '%)';
                        }
                    }
                }
            }
        }
    });
}

// ═══════════════════════════════════════════════════════════════════
// TEAM PERFORMANCE (Compact - Added to existing analytics)
// ═══════════════════════════════════════════════════════════════════

function renderTeamPerformance() {
    const salespeople = teamMembers.filter(tm => tm.role === 'salesperson');
    const tradespeople = teamMembers.filter(tm => tm.role === 'tradesperson' || !tm.role);
    
    let html = '<div class="mt-6">';
    
    // SALESPERSON TABLE
    if (salespeople.length > 0) {
        const spStats = salespeople.map(sp => {
            const spQuotes = quotes.filter(q => q.salesperson_id === sp.id);
            const won = spQuotes.filter(q => jobs.some(j => j.title === q.title && j.client_id === q.client_id) || invoices.some(i => i.title === q.title && i.client_id === q.client_id)).length;
            const winRate = spQuotes.length > 0 ? ((won / spQuotes.length) * 100).toFixed(0) : 0;
            const totalValue = spQuotes.reduce((s, q) => s + parseFloat(q.total || 0), 0);
            return { name: sp.name, quotes: spQuotes.length, won, winRate, value: totalValue };
        });
        
        html += `
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
                <h3 class="text-sm font-bold text-purple-600 dark:text-purple-400 mb-3">💼 Salesperson Performance</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Name</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Quotes</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Won</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Win Rate</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Total Value</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${spStats.map(s => `
                                <tr>
                                    <td class="px-3 py-2 dark:text-white">${s.name}</td>
                                    <td class="px-3 py-2 dark:text-gray-300">${s.quotes}</td>
                                    <td class="px-3 py-2 dark:text-gray-300">${s.won}</td>
                                    <td class="px-3 py-2 font-semibold ${s.winRate >= 50 ? 'text-green-600' : s.winRate >= 30 ? 'text-yellow-600' : 'text-gray-600'}">${s.winRate}%</td>
                                    <td class="px-3 py-2 font-semibold text-teal-600 dark:text-teal-400">$${s.value.toFixed(0)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    // TRADESPERSON TABLE
    if (tradespeople.length > 0) {
        const tpStats = tradespeople.map(tp => {
            const tpExpenses = expenses.filter(e => e.team_member_id === tp.id);
            const total = tpExpenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
            
            // Get unique job/quote identifiers from BOTH job_id field AND description parsing
            const jobIdentifiers = new Set();
            
            tpExpenses.forEach(exp => {
                // First try: job_id field
                if (exp.job_id && exp.job_id !== '' && exp.job_id !== 'null') {
                    jobIdentifiers.add(exp.job_id);
                }
                // Second try: Parse description for [Related to: ...]
                else if (exp.description) {
                    const match = exp.description.match(/\[Related to: ([^\]]+)\]/);
                    if (match) {
                        let title = match[1];
                        // Remove (Quote) or (Scheduled) suffix
                        title = title.replace(/\s*\((?:Quote|Scheduled)\)\s*$/, '');
                        // Extract the quote/job number (first part before ' - ')
                        const parts = title.split(' - ');
                        const identifier = parts[0] || title;
                        if (identifier && identifier.trim()) {
                            jobIdentifiers.add(identifier.trim());
                        }
                    }
                }
            });
            
            const jobCount = jobIdentifiers.size;
            
            // Debug logging - remove after testing
            if (tpExpenses.length > 0) {
                console.log(`[Analytics] ${tp.name}: ${tpExpenses.length} expenses, ${jobCount} jobs`);
                console.log(`[Analytics] Jobs/Quotes found:`, Array.from(jobIdentifiers));
            }
            
            const avgPerJob = jobCount > 0 ? total / jobCount : 0;
            return { name: tp.name, expenses: tpExpenses.length, jobs: jobCount, total, avgPerJob };
        });
        
        html += `
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 class="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3">🔧 Tradesperson Costs</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Name</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Expenses</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Jobs</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Total Cost</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Avg/Job</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${tpStats.map(s => `
                                <tr>
                                    <td class="px-3 py-2 dark:text-white">${s.name}</td>
                                    <td class="px-3 py-2 dark:text-gray-300">${s.expenses}</td>
                                    <td class="px-3 py-2 dark:text-gray-300">${s.jobs}</td>
                                    <td class="px-3 py-2 font-semibold text-red-600 dark:text-red-400">$${s.total.toFixed(0)}</td>
                                    <td class="px-3 py-2 dark:text-gray-300">$${s.avgPerJob.toFixed(0)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

console.log('✅ Enhanced Analytics module loaded');
