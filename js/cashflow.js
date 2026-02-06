// M4 STREAMLINE - Cash Flow Module

if (typeof cashFlowPeriod === 'undefined') {
    var cashFlowPeriod = '30days';
}

let cashFlowChartInstance = null;

function renderCashFlow() {
    const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const currentBalance = totalRevenue - totalExpenses;
    
    const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
    const moneyOwedToYou = unpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const aging = { current: [], days_1_30: [], days_31_60: [], days_61_90: [], days_90_plus: [] };
    
    unpaidInvoices.forEach(inv => {
        if (!inv.due_date) {
            aging.current.push(inv);
            return;
        }
        
        const dueDate = new Date(inv.due_date);
        dueDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 0) aging.current.push(inv);
        else if (daysDiff <= 30) aging.days_1_30.push(inv);
        else if (daysDiff <= 60) aging.days_31_60.push(inv);
        else if (daysDiff <= 90) aging.days_61_90.push(inv);
        else aging.days_90_plus.push(inv);
    });
    
    const agingTotals = {
        current: aging.current.reduce((sum, inv) => sum + (inv.total || 0), 0),
        days_1_30: aging.days_1_30.reduce((sum, inv) => sum + (inv.total || 0), 0),
        days_31_60: aging.days_31_60.reduce((sum, inv) => sum + (inv.total || 0), 0),
        days_61_90: aging.days_61_90.reduce((sum, inv) => sum + (inv.total || 0), 0),
        days_90_plus: aging.days_90_plus.reduce((sum, inv) => sum + (inv.total || 0), 0)
    };
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentExpenses = expenses.filter(e => new Date(e.date) >= threeMonthsAgo);
    const avgMonthlyExpenses = recentExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) / 3;
    const runway = avgMonthlyExpenses > 0 ? currentBalance / avgMonthlyExpenses : 0;
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expectedIn30Days = unpaidInvoices.filter(inv => inv.due_date && new Date(inv.due_date) <= thirtyDaysFromNow).reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const renderAgingInvoices = (invoiceList) => {
        if (invoiceList.length === 0) return '<div class="text-sm text-gray-500 dark:text-gray-400 p-4">No invoices</div>';
        
        return invoiceList.map(inv => {
            const client = clients.find(c => c.id === inv.client_id);
            const daysOverdue = inv.due_date ? Math.floor((today - new Date(inv.due_date)) / (1000 * 60 * 60 * 24)) : 0;
            
            return `<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer" onclick="switchTab('invoices'); setTimeout(() => openInvoiceDetail(${JSON.stringify(inv).replace(/"/g, '&quot;')}), 200);">
                <div class="flex-1">
                    <div class="font-medium text-gray-900 dark:text-white">${inv.invoice_number || 'INV-' + inv.id.slice(0, 8)}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">${client?.name || 'Unknown'}</div>
                    ${daysOverdue > 0 ? `<div class="text-xs text-red-600 mt-1">${daysOverdue} days overdue</div>` : ''}
                </div>
                <div class="font-bold text-gray-900 dark:text-white">$${(inv.total || 0).toFixed(2)}</div>
            </div>`;
        }).join('');
    };
    
    return `<div>
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h2 class="text-2xl font-bold dark:text-white">💸 Cash Flow</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br ${currentBalance >= 0 ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'} p-6 rounded-lg border ${currentBalance >= 0 ? 'border-green-200' : 'border-red-200'} shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <div class="text-sm font-medium ${currentBalance >= 0 ? 'text-green-700' : 'text-red-700'}">Current Balance</div>
                    <div class="text-2xl">${currentBalance >= 0 ? '💰' : '⚠️'}</div>
                </div>
                <div class="text-3xl font-bold ${currentBalance >= 0 ? 'text-green-900' : 'text-red-900'}">$${currentBalance.toFixed(2)}</div>
                <div class="text-xs ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'} mt-2">Revenue - Expenses</div>
            </div>
            
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <div class="text-sm font-medium text-blue-700">Money Owed</div>
                    <div class="text-2xl">📥</div>
                </div>
                <div class="text-3xl font-bold text-blue-900">$${moneyOwedToYou.toFixed(2)}</div>
                <div class="text-xs text-blue-600 mt-2">${unpaidInvoices.length} unpaid invoices</div>
            </div>
            
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <div class="text-sm font-medium text-purple-700">Cash Runway</div>
                    <div class="text-2xl">🏃</div>
                </div>
                <div class="text-3xl font-bold text-purple-900">${runway >= 0 ? runway.toFixed(1) : '0.0'} mo</div>
                <div class="text-xs text-purple-600 mt-2">At current burn rate</div>
            </div>
            
            <div class="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-lg border border-teal-200 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <div class="text-sm font-medium text-teal-700">Expected In 30 Days</div>
                    <div class="text-2xl">📈</div>
                </div>
                <div class="text-3xl font-bold text-teal-900">$${expectedIn30Days.toFixed(2)}</div>
                <div class="text-xs text-teal-600 mt-2">Based on due dates</div>
            </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h3 class="text-lg font-bold dark:text-white mb-4">📊 Accounts Receivable Aging</h3>
            
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Current</div>
                    <div class="text-xl font-bold text-gray-900 dark:text-white">$${agingTotals.current.toFixed(0)}</div>
                    <div class="text-xs text-gray-500">${aging.current.length} inv.</div>
                </div>
                <div class="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div class="text-xs text-yellow-700 mb-1">1-30 Days</div>
                    <div class="text-xl font-bold text-yellow-900">$${agingTotals.days_1_30.toFixed(0)}</div>
                    <div class="text-xs text-yellow-600">${aging.days_1_30.length} inv.</div>
                </div>
                <div class="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div class="text-xs text-orange-700 mb-1">31-60 Days</div>
                    <div class="text-xl font-bold text-orange-900">$${agingTotals.days_31_60.toFixed(0)}</div>
                    <div class="text-xs text-orange-600">${aging.days_31_60.length} inv.</div>
                </div>
                <div class="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div class="text-xs text-red-700 mb-1">61-90 Days</div>
                    <div class="text-xl font-bold text-red-900">$${agingTotals.days_61_90.toFixed(0)}</div>
                    <div class="text-xs text-red-600">${aging.days_61_90.length} inv.</div>
                </div>
                <div class="text-center p-4 bg-red-100 rounded-lg border-2 border-red-500">
                    <div class="text-xs text-red-700 mb-1 font-semibold">90+ Days</div>
                    <div class="text-xl font-bold text-red-900">$${agingTotals.days_90_plus.toFixed(0)}</div>
                    <div class="text-xs text-red-600">${aging.days_90_plus.length} inv.</div>
                </div>
            </div>
            
            ${(aging.days_61_90.length > 0 || aging.days_90_plus.length > 0) ? `
                <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div class="font-semibold text-red-700">⚠️ ${aging.days_61_90.length + aging.days_90_plus.length} Critical Overdue Invoices</div>
                    <div class="text-sm text-red-600 mt-1">Total at risk: $${(agingTotals.days_61_90 + agingTotals.days_90_plus).toFixed(2)}</div>
                </div>
            ` : ''}
            
            <div class="space-y-3">
                ${aging.days_90_plus.length > 0 ? `
                    <details class="bg-red-50 rounded-lg border border-red-200">
                        <summary class="cursor-pointer p-4 font-semibold text-red-900">90+ Days Overdue (${aging.days_90_plus.length} - $${agingTotals.days_90_plus.toFixed(2)})</summary>
                        <div class="p-4 pt-0 space-y-2">${renderAgingInvoices(aging.days_90_plus)}</div>
                    </details>
                ` : ''}
                ${aging.days_61_90.length > 0 ? `
                    <details class="bg-red-50 rounded-lg border border-red-200">
                        <summary class="cursor-pointer p-4 font-semibold text-red-900">61-90 Days Overdue (${aging.days_61_90.length} - $${agingTotals.days_61_90.toFixed(2)})</summary>
                        <div class="p-4 pt-0 space-y-2">${renderAgingInvoices(aging.days_61_90)}</div>
                    </details>
                ` : ''}
                ${aging.days_31_60.length > 0 ? `
                    <details class="bg-orange-50 rounded-lg border border-orange-200">
                        <summary class="cursor-pointer p-4 font-semibold text-orange-900">31-60 Days Overdue (${aging.days_31_60.length} - $${agingTotals.days_31_60.toFixed(2)})</summary>
                        <div class="p-4 pt-0 space-y-2">${renderAgingInvoices(aging.days_31_60)}</div>
                    </details>
                ` : ''}
                ${aging.days_1_30.length > 0 ? `
                    <details class="bg-yellow-50 rounded-lg border border-yellow-200">
                        <summary class="cursor-pointer p-4 font-semibold text-yellow-900">1-30 Days Overdue (${aging.days_1_30.length} - $${agingTotals.days_1_30.toFixed(2)})</summary>
                        <div class="p-4 pt-0 space-y-2">${renderAgingInvoices(aging.days_1_30)}</div>
                    </details>
                ` : ''}
                ${aging.current.length > 0 ? `
                    <details class="bg-gray-50 rounded-lg border border-gray-200">
                        <summary class="cursor-pointer p-4 font-semibold text-gray-900">Current / Not Due (${aging.current.length} - $${agingTotals.current.toFixed(2)})</summary>
                        <div class="p-4 pt-0 space-y-2">${renderAgingInvoices(aging.current)}</div>
                    </details>
                ` : ''}
            </div>
        </div>
    </div>`;
}

// Initialize cash flow chart (placeholder for now - can be expanded later)
function initializeCashFlowChart() {
    // This function is called by app.js when the cash flow tab loads
    // For now, it's just a placeholder since we don't have a chart yet
    console.log('Cash flow chart initialization called');
}

console.log('✅ Cash Flow module loaded');
