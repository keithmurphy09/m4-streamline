// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Analytics Module
// ═══════════════════════════════════════════════════════════════════

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

console.log('✅ Analytics module loaded');
