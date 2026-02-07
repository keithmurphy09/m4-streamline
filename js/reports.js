// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Reports Module
// ═══════════════════════════════════════════════════════════════════

// Report date range
let reportRange = 'current'; // 'current', 'quarter', 'year', 'all'

function renderReports() {
    const range = getReportDateRange(reportRange);
    
    // Filter data by date range
    const periodInvoices = invoices.filter(inv => {
        const date = new Date(inv.issue_date);
        return date >= range.start && date <= range.end;
    });
    
    const periodExpenses = expenses.filter(exp => {
        const date = new Date(exp.date);
        return date >= range.start && date <= range.end;
    });
    
    // Calculate totals
    const paidInvoices = periodInvoices.filter(inv => inv.status === 'paid');
    const revenue = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const gstCollected = paidInvoices.reduce((sum, inv) => sum + (inv.gst || 0), 0);
    
    const totalExpenses = periodExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    
    const profit = revenue - totalExpenses;
    const margin = revenue > 0 ? ((profit / revenue) * 100) : 0;
    
    // Expense breakdown by category
    const expensesByCategory = {};
    periodExpenses.forEach(exp => {
        const cat = exp.category || 'Other';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + parseFloat(exp.amount || 0);
    });
    
    const categoryRows = Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amount]) => `
            <tr class="border-b border-gray-100 dark:border-gray-700">
                <td class="py-3 text-sm text-gray-900 dark:text-white">${cat}</td>
                <td class="py-3 text-sm text-gray-900 dark:text-white text-right">$${amount.toFixed(2)}</td>
                <td class="py-3 text-sm text-gray-500 dark:text-gray-400 text-right">${revenue > 0 ? ((amount / revenue) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
        `).join('');
    
    return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 class="text-2xl font-bold dark:text-white">Financial Reports</h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Profit & Loss, GST, and Tax Summaries</p>
                </div>
                
                <div class="flex gap-3">
                    <select onchange="reportRange=this.value; renderApp();" class="px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 bg-white text-sm">
                        <option value="current" ${reportRange === 'current' ? 'selected' : ''}>This Month</option>
                        <option value="quarter" ${reportRange === 'quarter' ? 'selected' : ''}>This Quarter</option>
                        <option value="year" ${reportRange === 'year' ? 'selected' : ''}>This Year</option>
                        <option value="all" ${reportRange === 'all' ? 'selected' : ''}>All Time</option>
                    </select>
                    <button onclick="downloadReport()" class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">
                        📄 Download PDF
                    </button>
                </div>
            </div>
            
            <!-- Period Display -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <div class="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">Report Period</div>
                <div class="text-2xl font-bold dark:text-white">${range.label}</div>
                <div class="text-xs text-blue-600 dark:text-blue-300 mt-1">${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}</div>
            </div>
            
            <!-- Profit & Loss Summary -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-bold dark:text-white">Profit & Loss Statement</h3>
                </div>
                
                <div class="p-6 space-y-4">
                    <!-- Revenue -->
                    <div class="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span class="font-semibold text-gray-900 dark:text-white">Revenue</span>
                        <span class="text-xl font-bold text-green-600">$${revenue.toFixed(2)}</span>
                    </div>
                    
                    <!-- Expenses -->
                    <div class="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span class="font-semibold text-gray-900 dark:text-white">Total Expenses</span>
                        <span class="text-xl font-bold text-red-600">$${totalExpenses.toFixed(2)}</span>
                    </div>
                    
                    <!-- Net Profit -->
                    <div class="flex justify-between items-center pt-2 border-t-2 border-gray-300 dark:border-gray-600">
                        <span class="text-lg font-bold text-gray-900 dark:text-white">Net Profit</span>
                        <div class="text-right">
                            <div class="text-2xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}">$${profit.toFixed(2)}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">${margin.toFixed(1)}% margin</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- GST Summary -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-bold dark:text-white">GST Summary</h3>
                </div>
                
                <div class="p-6 space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-700 dark:text-gray-300">GST Collected (on sales)</span>
                        <span class="font-semibold text-gray-900 dark:text-white">$${gstCollected.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span class="text-gray-700 dark:text-gray-300">GST Paid (on expenses)</span>
                        <span class="font-semibold text-gray-900 dark:text-white">$0.00</span>
                    </div>
                    <div class="flex justify-between items-center pt-2">
                        <span class="font-bold text-gray-900 dark:text-white">Net GST Payable</span>
                        <span class="text-xl font-bold text-teal-600">$${gstCollected.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Expense Breakdown -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-bold dark:text-white">Expense Breakdown by Category</h3>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Category</th>
                                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">% of Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${categoryRows || '<tr><td colspan="3" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No expenses for this period</td></tr>'}
                            <tr class="border-t-2 border-gray-300 dark:border-gray-600 font-bold">
                                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">Total</td>
                                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white text-right">$${totalExpenses.toFixed(2)}</td>
                                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white text-right">${revenue > 0 ? ((totalExpenses / revenue) * 100).toFixed(1) : '0.0'}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Get date range for reports
function getReportDateRange(rangeType) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    switch(rangeType) {
        case 'current':
            return {
                start: new Date(currentYear, currentMonth, 1),
                end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59),
                label: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            };
        case 'quarter':
            const quarterStart = Math.floor(currentMonth / 3) * 3;
            return {
                start: new Date(currentYear, quarterStart, 1),
                end: new Date(currentYear, quarterStart + 3, 0, 23, 59, 59),
                label: `Q${Math.floor(currentMonth / 3) + 1} ${currentYear}`
            };
        case 'year':
            return {
                start: new Date(currentYear, 0, 1),
                end: new Date(currentYear, 11, 31, 23, 59, 59),
                label: `${currentYear}`
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

// Download report as PDF
function downloadReport() {
    alert('📄 PDF export coming soon! For now, use Print > Save as PDF');
    window.print();
}

console.log('✅ Reports module loaded');
