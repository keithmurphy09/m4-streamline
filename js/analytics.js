// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Analytics Module (COMPLETE)
// Salesperson Performance & Tradesperson Cost Tracking
// ═══════════════════════════════════════════════════════════════════

function renderAnalytics() {
    if (getAccountType() !== 'business') {
        return `
            <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                <h2 class="text-2xl font-bold mb-4 dark:text-white">Analytics</h2>
                <p class="text-gray-600 dark:text-gray-300 mb-6">Analytics are available on Business plans.</p>
                <div class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 inline-block">
                    <p class="text-sm text-yellow-900 dark:text-yellow-200">
                        Upgrade to Business to track team performance and costs.
                    </p>
                </div>
            </div>
        `;
    }
    
    // Get salespeople and tradespeople
    const salespeople = teamMembers.filter(tm => tm.role === 'salesperson');
    const tradespeople = teamMembers.filter(tm => tm.role === 'tradesperson' || !tm.role);
    
    return `
        <div>
            <h2 class="text-2xl font-bold mb-6 dark:text-teal-400">📊 Team Analytics</h2>
            
            <!-- SALESPERSON PERFORMANCE -->
            ${salespeople.length > 0 ? renderSalespersonPerformance(salespeople) : `
                <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-6">
                    <h3 class="text-lg font-bold text-purple-900 dark:text-purple-400 mb-2">💼 Salesperson Performance</h3>
                    <p class="text-sm text-purple-700 dark:text-purple-300">No salespeople added yet. Add a team member with "Salesperson" role to track sales performance.</p>
                </div>
            `}
            
            <!-- TRADESPERSON COSTS -->
            ${tradespeople.length > 0 ? renderTradespersonCosts(tradespeople) : `
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h3 class="text-lg font-bold text-blue-900 dark:text-blue-400 mb-2">🔧 Tradesperson Costs</h3>
                    <p class="text-sm text-blue-700 dark:text-blue-300">No tradespeople added yet. Add team members to track their job costs.</p>
                </div>
            `}
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// SALESPERSON PERFORMANCE TRACKING
// ═══════════════════════════════════════════════════════════════════

function renderSalespersonPerformance(salespeople) {
    const salespersonStats = salespeople.map(sp => {
        // Get all quotes by this salesperson
        const spQuotes = quotes.filter(q => q.salesperson_id === sp.id);
        
        // Calculate win rate
        const totalQuotes = spQuotes.length;
        const wonQuotes = spQuotes.filter(q => {
            // Check if quote has a job (won) or invoice (won)
            const hasJob = jobs.some(j => j.title === q.title && j.client_id === q.client_id);
            const hasInvoice = invoices.some(i => i.title === q.title && i.client_id === q.client_id);
            return hasJob || hasInvoice;
        }).length;
        const winRate = totalQuotes > 0 ? ((wonQuotes / totalQuotes) * 100).toFixed(1) : 0;
        
        // Calculate totals
        const totalValue = spQuotes.reduce((sum, q) => sum + parseFloat(q.total || 0), 0);
        const avgQuoteValue = totalQuotes > 0 ? totalValue / totalQuotes : 0;
        
        // Calculate average margin
        const avgMargin = totalQuotes > 0 
            ? spQuotes.reduce((sum, q) => {
                const lineItems = q.line_items || [];
                const subtotal = lineItems.reduce((s, item) => s + (parseFloat(item.amount) || 0), 0);
                const cost = lineItems.reduce((s, item) => s + (parseFloat(item.cost) || 0) * (parseFloat(item.quantity) || 1), 0);
                const margin = subtotal > 0 ? ((subtotal - cost) / subtotal) * 100 : 0;
                return sum + margin;
            }, 0) / totalQuotes
            : 0;
        
        return {
            salesperson: sp,
            totalQuotes,
            wonQuotes,
            winRate,
            totalValue,
            avgQuoteValue,
            avgMargin
        };
    });
    
    // Sort by total value (top performers first)
    salespersonStats.sort((a, b) => b.totalValue - a.totalValue);
    
    return `
        <div class="mb-6">
            <h3 class="text-lg font-bold dark:text-white mb-4">💼 Salesperson Performance</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${salespersonStats.map(stat => `
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-purple-500">
                        <div class="flex items-center gap-2 mb-3">
                            <h4 class="text-lg font-bold dark:text-white">${stat.salesperson.name}</h4>
                            <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">SALES</span>
                        </div>
                        
                        <!-- Win Rate -->
                        <div class="mb-3">
                            <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Win Rate</div>
                            <div class="flex items-center gap-2">
                                <div class="text-2xl font-bold ${stat.winRate >= 50 ? 'text-green-600' : stat.winRate >= 30 ? 'text-yellow-600' : 'text-red-600'}">${stat.winRate}%</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">(${stat.wonQuotes}/${stat.totalQuotes} quotes)</div>
                            </div>
                        </div>
                        
                        <!-- Total Sales -->
                        <div class="mb-3">
                            <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Sales Value</div>
                            <div class="text-xl font-bold text-teal-600">$${stat.totalValue.toFixed(2)}</div>
                        </div>
                        
                        <!-- Avg Quote -->
                        <div class="mb-3">
                            <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Quote Value</div>
                            <div class="text-lg font-semibold dark:text-white">$${stat.avgQuoteValue.toFixed(2)}</div>
                        </div>
                        
                        <!-- Avg Margin -->
                        <div>
                            <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Margin</div>
                            <div class="text-lg font-semibold ${stat.avgMargin >= 40 ? 'text-green-600' : stat.avgMargin >= 25 ? 'text-yellow-600' : 'text-red-600'}">${stat.avgMargin.toFixed(1)}%</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            ${salespersonStats.filter(s => s.totalQuotes > 0).length === 0 ? `
                <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center mt-4">
                    <p class="text-sm text-purple-700 dark:text-purple-300">Salespeople created, but no quotes assigned yet. Add quotes and set the salesperson field to see performance metrics!</p>
                </div>
            ` : ''}
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// TRADESPERSON COST TRACKING
// ═══════════════════════════════════════════════════════════════════

function renderTradespersonCosts(tradespeople) {
    const tradespersonStats = tradespeople.map(tp => {
        // Get all expenses by this tradesperson
        const tpExpenses = expenses.filter(e => e.team_member_id === tp.id);
        
        // Calculate totals
        const totalExpenses = tpExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const expenseCount = tpExpenses.length;
        
        // Get unique jobs this person worked on
        const jobIds = [...new Set(tpExpenses.filter(e => e.job_id).map(e => e.job_id))];
        const jobCount = jobIds.length;
        
        // Calculate average per job
        const avgPerJob = jobCount > 0 ? totalExpenses / jobCount : 0;
        
        // Find most expensive job
        let mostExpensiveJob = null;
        let mostExpensiveAmount = 0;
        if (jobIds.length > 0) {
            jobIds.forEach(jobId => {
                const jobExpenses = tpExpenses.filter(e => e.job_id === jobId);
                const jobTotal = jobExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                if (jobTotal > mostExpensiveAmount) {
                    mostExpensiveAmount = jobTotal;
                    const job = jobs.find(j => j.id === jobId);
                    mostExpensiveJob = job ? job.title : 'Unknown Job';
                }
            });
        }
        
        // Expense breakdown by category
        const categoryBreakdown = {};
        tpExpenses.forEach(e => {
            const cat = e.category || 'Other';
            categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + parseFloat(e.amount || 0);
        });
        
        return {
            tradesperson: tp,
            totalExpenses,
            expenseCount,
            jobCount,
            avgPerJob,
            mostExpensiveJob,
            mostExpensiveAmount,
            categoryBreakdown
        };
    });
    
    // Sort by total expenses (highest first)
    tradespersonStats.sort((a, b) => b.totalExpenses - a.totalExpenses);
    
    return `
        <div>
            <h3 class="text-lg font-bold dark:text-white mb-4">🔧 Tradesperson Costs</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${tradespersonStats.map(stat => `
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500">
                        <div class="flex items-center gap-2 mb-3">
                            <h4 class="text-lg font-bold dark:text-white">${stat.tradesperson.name}</h4>
                            <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">TRADES</span>
                        </div>
                        
                        <!-- Total Expenses -->
                        <div class="mb-3">
                            <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Expenses</div>
                            <div class="text-2xl font-bold text-red-600">$${stat.totalExpenses.toFixed(2)}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">${stat.expenseCount} expense${stat.expenseCount !== 1 ? 's' : ''}</div>
                        </div>
                        
                        <!-- Jobs & Avg per Job -->
                        <div class="mb-3">
                            <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Jobs Worked</div>
                            <div class="text-lg font-semibold dark:text-white">${stat.jobCount} job${stat.jobCount !== 1 ? 's' : ''}</div>
                            ${stat.jobCount > 0 ? `
                                <div class="text-sm text-gray-600 dark:text-gray-400">Avg: $${stat.avgPerJob.toFixed(2)}/job</div>
                            ` : ''}
                        </div>
                        
                        <!-- Most Expensive Job -->
                        ${stat.mostExpensiveJob ? `
                            <div class="mb-3">
                                <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Most Expensive Job</div>
                                <div class="text-sm font-medium dark:text-white">${stat.mostExpensiveJob}</div>
                                <div class="text-sm font-semibold text-red-600">$${stat.mostExpensiveAmount.toFixed(2)}</div>
                            </div>
                        ` : ''}
                        
                        <!-- Category Breakdown -->
                        ${Object.keys(stat.categoryBreakdown).length > 0 ? `
                            <div>
                                <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">Top Categories</div>
                                <div class="space-y-1">
                                    ${Object.entries(stat.categoryBreakdown)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 3)
                                        .map(([cat, amount]) => `
                                            <div class="flex justify-between text-xs">
                                                <span class="text-gray-600 dark:text-gray-400">${cat}</span>
                                                <span class="font-semibold dark:text-white">$${amount.toFixed(2)}</span>
                                            </div>
                                        `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            
            ${tradespersonStats.filter(s => s.expenseCount > 0).length === 0 ? `
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center mt-4">
                    <p class="text-sm text-blue-700 dark:text-blue-300">Tradespeople created, but no expenses assigned yet. Add expenses and link them to team members to track costs!</p>
                </div>
            ` : ''}
        </div>
    `;
}

console.log('✅ Analytics module loaded (COMPLETE)');
