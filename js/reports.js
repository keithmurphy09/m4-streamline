// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Reports Module
// ═══════════════════════════════════════════════════════════════════

// Report date range
let reportRange = 'current'; // 'current', 'quarter', 'year', 'all'

// Custom reports
let customReports = []; // Saved custom report templates
let showCustomReportBuilder = false;
let customReportName = '';
let customReportSections = {
    revenue: false,
    expenses: false,
    profit: false,
    gst: false,
    expenseBreakdown: false,
    topClients: false
};

// Expandable sections state
let expandedSections = {
    pl: true,
    gst: true,
    expenses: true
};

function toggleReportSection(section) {
    expandedSections[section] = !expandedSections[section];
    renderApp();
}

function renderReports() {
    // Load custom reports if not already loaded
    if (customReports.length === 0 && currentUser) {
        loadCustomReports();
    }
    
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
                
                <div class="flex gap-3 flex-wrap">
                    <button onclick="openCustomReportBuilder()" class="px-4 py-2 bg-black text-white rounded-lg border border-teal-400 hover:bg-gray-900 transition-colors text-sm whitespace-nowrap">
                        📝 Create Custom Report
                    </button>
                    <select onchange="reportRange=this.value; renderApp();" class="px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 bg-white text-sm">
                        <option value="current" ${reportRange === 'current' ? 'selected' : ''}>This Month</option>
                        <option value="quarter" ${reportRange === 'quarter' ? 'selected' : ''}>This Quarter</option>
                        <option value="year" ${reportRange === 'year' ? 'selected' : ''}>This Year</option>
                        <option value="all" ${reportRange === 'all' ? 'selected' : ''}>All Time</option>
                    </select>
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
                <div onclick="toggleReportSection('pl')" class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-colors">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold dark:text-white">Profit & Loss Statement</h3>
                        <span class="text-2xl">${expandedSections.pl ? '▼' : '▶'}</span>
                    </div>
                </div>
                
                ${expandedSections.pl ? `
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
                ` : ''}
            </div>
            
            <!-- GST Summary -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div onclick="toggleReportSection('gst')" class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-colors">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold dark:text-white">GST Summary</h3>
                        <span class="text-2xl">${expandedSections.gst ? '▼' : '▶'}</span>
                    </div>
                </div>
                
                ${expandedSections.gst ? `
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
                ` : ''}
            </div>
            
            <!-- Expense Breakdown -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div onclick="toggleReportSection('expenses')" class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-colors">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold dark:text-white">Expense Breakdown by Category</h3>
                        <span class="text-2xl">${expandedSections.expenses ? '▼' : '▶'}</span>
                    </div>
                </div>
                
                ${expandedSections.expenses ? `
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
                ` : ''}
            </div>
            
            <!-- Custom Report Builder Modal -->
            ${showCustomReportBuilder ? `
            <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" onclick="if(event.target===this)closeCustomReportBuilder()">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold dark:text-white">Create Custom Report</h3>
                        <button onclick="closeCustomReportBuilder()" class="text-2xl leading-none dark:text-gray-300">×</button>
                    </div>
                    
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Select sections to include in your custom report. Each section can have its own date range.</p>
                    
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-4 border rounded dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div class="flex items-center gap-3">
                                <input type="checkbox" ${customReportSections.revenue ? 'checked' : ''} onchange="toggleCustomSection('revenue')" class="w-5 h-5">
                                <span class="font-medium dark:text-white">💰 Revenue Summary</span>
                            </div>
                            ${customReportSections.revenue ? `
                            <select onchange="updateSectionDateRange('revenue', this.value)" class="px-3 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600">
                                <option value="current" ${(sectionDateRanges.revenue || 'current') === 'current' ? 'selected' : ''}>This Month</option>
                                <option value="quarter" ${sectionDateRanges.revenue === 'quarter' ? 'selected' : ''}>This Quarter</option>
                                <option value="year" ${sectionDateRanges.revenue === 'year' ? 'selected' : ''}>This Year</option>
                                <option value="all" ${sectionDateRanges.revenue === 'all' ? 'selected' : ''}>All Time</option>
                            </select>
                            ` : ''}
                        </div>
                        
                        <div class="flex items-center justify-between p-4 border rounded dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div class="flex items-center gap-3">
                                <input type="checkbox" ${customReportSections.expenses ? 'checked' : ''} onchange="toggleCustomSection('expenses')" class="w-5 h-5">
                                <span class="font-medium dark:text-white">💸 Expense Breakdown</span>
                            </div>
                            ${customReportSections.expenses ? `
                            <select onchange="updateSectionDateRange('expenses', this.value)" class="px-3 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600">
                                <option value="current">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                                <option value="all">All Time</option>
                            </select>
                            ` : ''}
                        </div>
                        
                        <div class="flex items-center justify-between p-4 border rounded dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div class="flex items-center gap-3">
                                <input type="checkbox" ${customReportSections.profit ? 'checked' : ''} onchange="toggleCustomSection('profit')" class="w-5 h-5">
                                <span class="font-medium dark:text-white">📊 Profit & Loss</span>
                            </div>
                            ${customReportSections.profit ? `
                            <select onchange="updateSectionDateRange('profit', this.value)" class="px-3 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600">
                                <option value="current">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                                <option value="all">All Time</option>
                            </select>
                            ` : ''}
                        </div>
                        
                        <div class="flex items-center justify-between p-4 border rounded dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div class="flex items-center gap-3">
                                <input type="checkbox" ${customReportSections.gst ? 'checked' : ''} onchange="toggleCustomSection('gst')" class="w-5 h-5">
                                <span class="font-medium dark:text-white">🧾 GST Summary</span>
                            </div>
                            ${customReportSections.gst ? `
                            <select onchange="updateSectionDateRange('gst', this.value)" class="px-3 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600">
                                <option value="current">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                                <option value="all">All Time</option>
                            </select>
                            ` : ''}
                        </div>
                        
                        <div class="flex items-center justify-between p-4 border rounded dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div class="flex items-center gap-3">
                                <input type="checkbox" ${customReportSections.jobs ? 'checked' : ''} onchange="toggleCustomSection('jobs')" class="w-5 h-5">
                                <span class="font-medium dark:text-white">✅ Jobs Completed</span>
                            </div>
                            ${customReportSections.jobs ? `
                            <select onchange="updateSectionDateRange('jobs', this.value)" class="px-3 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600">
                                <option value="current">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                                <option value="all">All Time</option>
                            </select>
                            ` : ''}
                        </div>
                        
                        <div class="flex items-center justify-between p-4 border rounded dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div class="flex items-center gap-3">
                                <input type="checkbox" ${customReportSections.clients ? 'checked' : ''} onchange="toggleCustomSection('clients')" class="w-5 h-5">
                                <span class="font-medium dark:text-white">👥 Top Clients</span>
                            </div>
                            ${customReportSections.clients ? `
                            <select onchange="updateSectionDateRange('clients', this.value)" class="px-3 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600">
                                <option value="current">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                                <option value="all">All Time</option>
                            </select>
                            ` : ''}
                        </div>
                        
                        <div class="flex items-center justify-between p-4 border rounded dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div class="flex items-center gap-3">
                                <input type="checkbox" ${customReportSections.quotes ? 'checked' : ''} onchange="toggleCustomSection('quotes')" class="w-5 h-5">
                                <span class="font-medium dark:text-white">📋 Quote Statistics</span>
                            </div>
                            ${customReportSections.quotes ? `
                            <select onchange="updateSectionDateRange('quotes', this.value)" class="px-3 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600">
                                <option value="current">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                                <option value="all">All Time</option>
                            </select>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="flex gap-3 mt-6">
                        <button onclick="closeCustomReportBuilder()" class="flex-1 px-4 py-2 border rounded dark:border-gray-600 dark:text-gray-300">Cancel</button>
                        <button onclick="saveCustomReportTemplate()" class="flex-1 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">Save Report</button>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <!-- Saved Custom Reports -->
            ${customReports.length > 0 ? `
            <div class="mt-8 pt-8 border-t-2 border-gray-300 dark:border-gray-600">
                <h3 class="text-xl font-bold dark:text-white mb-4">My Saved Custom Reports</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${customReports.map(report => `
                        <div class="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <h4 class="font-bold dark:text-white">${report.name}</h4>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Created: ${new Date(report.created).toLocaleDateString()}</p>
                                    ${report.lastRun ? `<p class="text-xs text-gray-500 dark:text-gray-400">Last refreshed: ${new Date(report.lastRun).toLocaleDateString()}</p>` : ''}
                                </div>
                                <button onclick="deleteCustomReport('${report.id}')" class="text-red-600 hover:text-red-700 text-sm">Delete</button>
                            </div>
                            
                            <div class="mb-4">
                                <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">Sections:</p>
                                <div class="flex flex-wrap gap-1">
                                    ${report.sections.map(s => {
                                        const names = { revenue: '💰', expenses: '💸', profit: '📊', gst: '🧾', jobs: '✅', clients: '👥', quotes: '📋' };
                                        return `<span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">${names[s.id] || s.id}</span>`;
                                    }).join('')}
                                </div>
                            </div>
                            
                            <div class="flex gap-2">
                                <button onclick="refreshCustomReport('${report.id}')" class="flex-1 px-4 py-2 border border-teal-600 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-sm font-medium">
                                    🔄 Refresh Data
                                </button>
                                <button onclick="downloadCustomReportPDF('${report.id}')" class="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium">
                                    📄 Download PDF
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
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
async function downloadReportPDF() {
    const range = getReportDateRange(reportRange);
    
    // Filter data
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
    
    // Expense breakdown
    const expensesByCategory = {};
    periodExpenses.forEach(exp => {
        const cat = exp.category || 'Other';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + parseFloat(exp.amount || 0);
    });
    
    // Generate PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Financial Report', pageWidth / 2, y, { align: 'center' });
    
    y += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(range.label, pageWidth / 2, y, { align: 'center' });
    
    y += 15;
    
    // Profit & Loss
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Profit & Loss Statement', 20, y);
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Revenue:`, 20, y);
    doc.text(`$${revenue.toFixed(2)}`, pageWidth - 20, y, { align: 'right' });
    
    y += 7;
    doc.text(`Total Expenses:`, 20, y);
    doc.text(`$${totalExpenses.toFixed(2)}`, pageWidth - 20, y, { align: 'right' });
    
    y += 10;
    doc.setFont(undefined, 'bold');
    doc.text(`Net Profit:`, 20, y);
    doc.text(`$${profit.toFixed(2)} (${margin.toFixed(1)}% margin)`, pageWidth - 20, y, { align: 'right' });
    
    y += 15;
    
    // GST Summary
    doc.setFontSize(14);
    doc.text('GST Summary', 20, y);
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`GST Collected:`, 20, y);
    doc.text(`$${gstCollected.toFixed(2)}`, pageWidth - 20, y, { align: 'right' });
    
    y += 7;
    doc.text(`GST Paid:`, 20, y);
    doc.text(`$0.00`, pageWidth - 20, y, { align: 'right' });
    
    y += 10;
    doc.setFont(undefined, 'bold');
    doc.text(`Net GST Payable:`, 20, y);
    doc.text(`$${gstCollected.toFixed(2)}`, pageWidth - 20, y, { align: 'right' });
    
    y += 15;
    
    // Expense Breakdown
    doc.setFontSize(14);
    doc.text('Expense Breakdown', 20, y);
    
    y += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, amount]) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.text(cat, 20, y);
        doc.text(`$${amount.toFixed(2)}`, pageWidth - 20, y, { align: 'right' });
        y += 7;
    });
    
    // Save PDF
    doc.save(`Financial-Report-${range.label.replace(/\s/g, '-')}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════
// CUSTOM REPORT BUILDER
// ═══════════════════════════════════════════════════════════════════

// Load saved custom reports from localStorage
function loadCustomReports() {
    if (!currentUser) return;
    try {
        const saved = localStorage.getItem(`customReports_${currentUser.id}`);
        if (saved) {
            customReports = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading custom reports:', error);
    }
}

// Open custom report builder
function openCustomReportBuilder() {
    showCustomReportBuilder = true;
    customReportName = '';
    customReportSections = {
        revenue: false,
        expenses: false,
        profit: false,
        gst: false,
        jobs: false,
        clients: false,
        quotes: false
    };
    renderApp();
}

// Close custom report builder
function closeCustomReportBuilder() {
    showCustomReportBuilder = false;
    renderApp();
}

// Toggle section in builder
function toggleCustomSection(sectionId) {
    customReportSections[sectionId] = !customReportSections[sectionId];
    renderApp();
}

// Update section date range
let sectionDateRanges = {};

function updateSectionDateRange(sectionId, range) {
    sectionDateRanges[sectionId] = range;
}

// Save custom report template
function saveCustomReportTemplate() {
    const selectedSections = Object.entries(customReportSections)
        .filter(([_, selected]) => selected)
        .map(([id, _]) => ({
            id,
            dateRange: sectionDateRanges[id] || 'current'
        }));
    
    if (selectedSections.length === 0) {
        showNotification('Please select at least one section', 'error');
        return;
    }
    
    const reportNumber = customReports.length + 1;
    const newReport = {
        id: `custom-${Date.now()}`,
        name: `Custom Report ${reportNumber}`,
        sections: selectedSections,
        created: new Date().toISOString(),
        lastRun: null,
        lastData: null
    };
    
    customReports.push(newReport);
    
    try {
        localStorage.setItem(`customReports_${currentUser.id}`, JSON.stringify(customReports));
        showNotification('Custom report saved!', 'success');
        closeCustomReportBuilder();
    } catch (error) {
        console.error('Error saving custom report:', error);
        showNotification('Failed to save custom report', 'error');
    }
}

// Refresh custom report data
function refreshCustomReport(reportId) {
    const report = customReports.find(r => r.id === reportId);
    if (!report) return;
    
    const data = {};
    
    report.sections.forEach(section => {
        const range = getReportDateRange(section.dateRange);
        data[section.id] = calculateSectionData(section.id, range);
    });
    
    report.lastRun = new Date().toISOString();
    report.lastData = data;
    
    try {
        localStorage.setItem(`customReports_${currentUser.id}`, JSON.stringify(customReports));
        showNotification('Report data refreshed!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error saving report data:', error);
        showNotification('Failed to refresh data', 'error');
    }
}

// Calculate data for a section
function calculateSectionData(sectionId, range) {
    const periodInvoices = invoices.filter(inv => {
        const date = new Date(inv.issue_date);
        return date >= range.start && date <= range.end;
    });
    
    const periodExpenses = expenses.filter(exp => {
        const date = new Date(exp.date);
        return date >= range.start && date <= range.end;
    });
    
    const periodJobs = jobs.filter(job => {
        const date = new Date(job.date);
        return date >= range.start && date <= range.end && job.status === 'completed';
    });
    
    const paidInvoices = periodInvoices.filter(inv => inv.status === 'paid');
    const revenue = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalExpenses = periodExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    
    switch (sectionId) {
        case 'revenue':
            return {
                total: revenue,
                count: paidInvoices.length,
                range: range.label
            };
        
        case 'expenses':
            const byCategory = {};
            periodExpenses.forEach(exp => {
                const cat = exp.category || 'Other';
                byCategory[cat] = (byCategory[cat] || 0) + parseFloat(exp.amount || 0);
            });
            return {
                total: totalExpenses,
                byCategory,
                range: range.label
            };
        
        case 'profit':
            return {
                revenue,
                expenses: totalExpenses,
                profit: revenue - totalExpenses,
                margin: revenue > 0 ? ((revenue - totalExpenses) / revenue * 100) : 0,
                range: range.label
            };
        
        case 'gst':
            return {
                collected: paidInvoices.reduce((sum, inv) => sum + (inv.gst || 0), 0),
                paid: 0,
                range: range.label
            };
        
        case 'jobs':
            const totalJobs = jobs.filter(job => {
                const date = new Date(job.date);
                return date >= range.start && date <= range.end;
            }).length;
            return {
                completed: periodJobs.length,
                total: totalJobs,
                completionRate: totalJobs > 0 ? (periodJobs.length / totalJobs * 100) : 0,
                range: range.label
            };
        
        case 'clients':
            const clientRevenue = {};
            paidInvoices.forEach(inv => {
                const client = clients.find(c => c.id === inv.client_id);
                const name = client?.name || 'Unknown';
                clientRevenue[name] = (clientRevenue[name] || 0) + (inv.total || 0);
            });
            const top5 = Object.entries(clientRevenue)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            return {
                topClients: top5,
                range: range.label
            };
        
        case 'quotes':
            const periodQuotes = quotes.filter(q => {
                const date = new Date(q.created_at);
                return date >= range.start && date <= range.end;
            });
            const accepted = periodQuotes.filter(q => q.status === 'accepted' || q.accepted).length;
            const pending = periodQuotes.filter(q => q.status === 'pending').length;
            return {
                total: periodQuotes.length,
                accepted,
                pending,
                conversionRate: periodQuotes.length > 0 ? (accepted / periodQuotes.length * 100) : 0,
                range: range.label
            };
        
        default:
            return {};
    }
}

// Download custom report as PDF
function downloadCustomReportPDF(reportId) {
    const report = customReports.find(r => r.id === reportId);
    if (!report) return;
    
    // Always get fresh data
    const data = {};
    report.sections.forEach(section => {
        const range = getReportDateRange(section.dateRange);
        data[section.id] = calculateSectionData(section.id, range);
    });
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;
    
    // M4 STREAMLINE HEADER
    const logoImg = new Image();
    logoImg.src = 'https://i.imgur.com/dF4xRDK.jpeg';
    doc.addImage(logoImg, 'JPEG', 10, 10, 25, 25);
    
    doc.setFontSize(24);
    doc.setTextColor(20, 184, 166); // Teal
    doc.text('M4 STREAMLINE', pageWidth / 2, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.text('"streamlining your business"', pageWidth / 2, 28, { align: 'center' });
    
    // Report Title
    y = 45;
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(report.name, pageWidth / 2, y, { align: 'center' });
    
    y += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, y, { align: 'center' });
    
    y += 15;
    
    // Company info if available
    if (companySettings?.business_name) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(companySettings.business_name, pageWidth / 2, y, { align: 'center' });
        y += 4;
        if (companySettings.abn) {
            doc.text(`ABN: ${companySettings.abn}`, pageWidth / 2, y, { align: 'center' });
            y += 4;
        }
        y += 6;
    }
    
    // Render each section
    report.sections.forEach((section, sectionIndex) => {
        const sectionData = data[section.id];
        if (!sectionData) return;
        
        const sectionNames = {
            revenue: 'Revenue Summary',
            expenses: 'Expense Breakdown',
            profit: 'Profit & Loss',
            gst: 'GST Summary',
            jobs: 'Jobs Completed',
            clients: 'Top Clients',
            quotes: 'Quote Statistics'
        };
        
        // Check if we need a new page
        if (y > pageHeight - 40) {
            doc.addPage();
            y = 20;
        }
        
        // Section header with teal background
        doc.setFillColor(20, 184, 166);
        doc.rect(10, y - 5, pageWidth - 20, 10, 'F');
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(sectionNames[section.id] || section.id, 15, y + 2);
        
        y += 12;
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(`Period: ${sectionData.range}`, 15, y);
        
        y += 10;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        
        // Section-specific rendering with DETAILED DATA
        switch (section.id) {
            case 'revenue':
                // Revenue header
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text(`Total Revenue: $${sectionData.total.toFixed(2)}`, 15, y);
                doc.text(`Invoices Paid: ${sectionData.count}`, pageWidth - 80, y);
                y += 10;
                
                // Get actual invoice details
                const range = getReportDateRange(section.dateRange);
                const paidInvoices = invoices.filter(inv => {
                    const date = new Date(inv.issue_date);
                    return inv.status === 'paid' && date >= range.start && date <= range.end;
                }).sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));
                
                // Calculate analytics
                if (paidInvoices.length > 0) {
                    const invoiceAmounts = paidInvoices.map(inv => inv.total || 0);
                    const avgInvoice = invoiceAmounts.reduce((a, b) => a + b, 0) / invoiceAmounts.length;
                    const largestInvoice = Math.max(...invoiceAmounts);
                    const smallestInvoice = Math.min(...invoiceAmounts);
                    
                    // Analytics box
                    doc.setFillColor(240, 248, 255);
                    doc.rect(10, y - 4, pageWidth - 20, 25, 'F');
                    doc.setFontSize(9);
                    doc.setFont(undefined, 'normal');
                    doc.text('Average Invoice:', 15, y);
                    doc.text(`$${avgInvoice.toFixed(2)}`, 60, y);
                    doc.text('Largest Invoice:', 100, y);
                    doc.text(`$${largestInvoice.toFixed(2)}`, 145, y);
                    y += 5;
                    doc.text('Smallest Invoice:', 15, y);
                    doc.text(`$${smallestInvoice.toFixed(2)}`, 60, y);
                    doc.text('Median Invoice:', 100, y);
                    const sortedAmounts = [...invoiceAmounts].sort((a, b) => a - b);
                    const median = sortedAmounts[Math.floor(sortedAmounts.length / 2)];
                    doc.text(`$${median.toFixed(2)}`, 145, y);
                    y += 10;
                    
                    // Revenue by month (if year or all time)
                    if (section.dateRange === 'year' || section.dateRange === 'all') {
                        const monthlyRevenue = {};
                        paidInvoices.forEach(inv => {
                            const monthKey = new Date(inv.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                            monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (inv.total || 0);
                        });
                        
                        doc.setFont(undefined, 'bold');
                        doc.text('Monthly Breakdown:', 15, y);
                        y += 6;
                        doc.setFont(undefined, 'normal');
                        doc.setFontSize(8);
                        
                        Object.entries(monthlyRevenue).forEach(([month, amount]) => {
                            if (y > pageHeight - 25) {
                                doc.addPage();
                                y = 20;
                            }
                            doc.text(month, 15, y);
                            doc.text(`$${amount.toFixed(2)}`, 60, y);
                            y += 4;
                        });
                        y += 6;
                    }
                    
                    doc.setFontSize(9);
                    y += 5;
                }
                
                if (paidInvoices.length > 0) {
                    // Table header
                    doc.setFillColor(0, 0, 0);
                    doc.rect(10, y - 5, pageWidth - 20, 8, 'F');
                    doc.setFontSize(9);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(255, 255, 255);
                    doc.text('Date', 15, y);
                    doc.text('Invoice #', 45, y);
                    doc.text('Client', 80, y);
                    doc.text('GST', 135, y);
                    doc.text('Amount', pageWidth - 30, y, { align: 'right' });
                    
                    y += 8;
                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(0, 0, 0);
                    
                    paidInvoices.forEach(inv => {
                        if (y > pageHeight - 30) {
                            doc.addPage();
                            y = 20;
                        }
                        
                        const client = clients.find(c => c.id === inv.client_id);
                        doc.setFontSize(8);
                        doc.text(new Date(inv.issue_date).toLocaleDateString(), 15, y);
                        doc.text(inv.invoice_number || 'N/A', 45, y);
                        const clientName = doc.splitTextToSize(client?.name || 'Unknown', 50);
                        doc.text(clientName[0], 80, y);
                        doc.text(`$${(inv.gst || 0).toFixed(2)}`, 135, y);
                        doc.text(`$${inv.total.toFixed(2)}`, pageWidth - 30, y, { align: 'right' });
                        y += 5;
                    });
                }
                break;
            
            case 'expenses':
                // Expenses header
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text(`Total Expenses: $${sectionData.total.toFixed(2)}`, 15, y);
                y += 10;
                
                // Get actual expense details
                const expRange = getReportDateRange(section.dateRange);
                const periodExpenses = expenses.filter(exp => {
                    const date = new Date(exp.date);
                    return date >= expRange.start && date <= expRange.end;
                }).sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // Group by category
                const expensesByCategory = {};
                periodExpenses.forEach(exp => {
                    const cat = exp.category || 'Other';
                    if (!expensesByCategory[cat]) expensesByCategory[cat] = [];
                    expensesByCategory[cat].push(exp);
                });
                
                // Analytics section
                if (periodExpenses.length > 0) {
                    const expenseAmounts = periodExpenses.map(exp => parseFloat(exp.amount || 0));
                    const avgExpense = expenseAmounts.reduce((a, b) => a + b, 0) / expenseAmounts.length;
                    const largestExpense = Math.max(...expenseAmounts);
                    const totalWithReceipts = periodExpenses.filter(exp => exp.receipt_url).length;
                    
                    // Analytics box
                    doc.setFillColor(255, 248, 240);
                    doc.rect(10, y - 4, pageWidth - 20, 20, 'F');
                    doc.setFontSize(9);
                    doc.setFont(undefined, 'normal');
                    doc.text('Total Expenses:', 15, y);
                    doc.text(String(periodExpenses.length), 60, y);
                    doc.text('Average Expense:', 85, y);
                    doc.text(`$${avgExpense.toFixed(2)}`, 130, y);
                    doc.text('Largest:', 155, y);
                    doc.text(`$${largestExpense.toFixed(2)}`, pageWidth - 30, y, { align: 'right' });
                    y += 5;
                    doc.text('With Receipts:', 15, y);
                    doc.text(`${totalWithReceipts} (${((totalWithReceipts/periodExpenses.length)*100).toFixed(0)}%)`, 60, y);
                    doc.text('Categories:', 85, y);
                    doc.text(String(Object.keys(expensesByCategory).length), 130, y);
                    y += 10;
                    
                    // Team member breakdown (if business account)
                    if (getAccountType() === 'business' && teamMembers.length > 0) {
                        const byTeamMember = {};
                        periodExpenses.forEach(exp => {
                            if (exp.team_member_id) {
                                const member = teamMembers.find(m => m.id === exp.team_member_id);
                                const name = member?.name || 'Unknown';
                                byTeamMember[name] = (byTeamMember[name] || 0) + parseFloat(exp.amount || 0);
                            }
                        });
                        
                        if (Object.keys(byTeamMember).length > 0) {
                            doc.setFont(undefined, 'bold');
                            doc.text('Expenses by Team Member:', 15, y);
                            y += 6;
                            doc.setFont(undefined, 'normal');
                            doc.setFontSize(8);
                            
                            Object.entries(byTeamMember)
                                .sort((a, b) => b[1] - a[1])
                                .forEach(([member, amount]) => {
                                    if (y > pageHeight - 25) {
                                        doc.addPage();
                                        y = 20;
                                    }
                                    doc.text(member, 15, y);
                                    doc.text(`$${amount.toFixed(2)}`, 80, y);
                                    y += 4;
                                });
                            y += 6;
                        }
                    }
                    
                    doc.setFontSize(9);
                    y += 5;
                }
                
                // Render each category with detail
                Object.entries(expensesByCategory).sort((a, b) => {
                    const totalA = a[1].reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                    const totalB = b[1].reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                    return totalB - totalA;
                }).forEach(([category, catExpenses]) => {
                    if (y > pageHeight - 40) {
                        doc.addPage();
                        y = 20;
                    }
                    
                    const categoryTotal = catExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                    
                    // Category subheader
                    doc.setFillColor(240, 240, 240);
                    doc.rect(10, y - 4, pageWidth - 20, 7, 'F');
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(0, 0, 0);
                    doc.text(category, 15, y);
                    doc.text(`$${categoryTotal.toFixed(2)}`, pageWidth - 30, y, { align: 'right' });
                    y += 8;
                    
                    // Table header for category
                    doc.setFontSize(8);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(80, 80, 80);
                    doc.text('Date', 15, y);
                    doc.text('Description', 45, y);
                    doc.text('Job', 120, y);
                    doc.text('Amount', pageWidth - 30, y, { align: 'right' });
                    y += 5;
                    
                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(0, 0, 0);
                    
                    // Category expense items
                    catExpenses.forEach(exp => {
                        if (y > pageHeight - 25) {
                            doc.addPage();
                            y = 20;
                        }
                        
                        doc.setFontSize(7);
                        doc.text(new Date(exp.date).toLocaleDateString(), 15, y);
                        
                        // Description (truncate if needed)
                        const description = exp.description || '-';
                        const cleanDesc = description.replace(/\[Related to:[^\]]+\]/, '').trim();
                        const descLines = doc.splitTextToSize(cleanDesc || '-', 70);
                        doc.text(descLines[0], 45, y);
                        
                        // Job association
                        let jobDisplay = '-';
                        if (exp.job_id) {
                            const job = jobs.find(j => j.id === exp.job_id);
                            jobDisplay = job ? job.title.substring(0, 30) : '-';
                        } else if (description.includes('[Related to:')) {
                            const match = description.match(/\[Related to: ([^\]]+)\]/);
                            if (match) {
                                jobDisplay = match[1].replace(/\s*\((?:Quote|Scheduled)\)\s*$/, '').substring(0, 30);
                            }
                        }
                        doc.text(jobDisplay, 120, y);
                        
                        doc.text(`$${parseFloat(exp.amount).toFixed(2)}`, pageWidth - 30, y, { align: 'right' });
                        y += 4;
                    });
                    
                    y += 4; // Space between categories
                });
                break;
            
            case 'profit':
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text('Profit & Loss Statement', 15, y);
                y += 10;
                
                // Get detailed data
                const plRange = getReportDateRange(section.dateRange);
                const plInvoices = invoices.filter(inv => {
                    const date = new Date(inv.issue_date);
                    return inv.status === 'paid' && date >= plRange.start && date <= plRange.end;
                });
                const plExpenses = expenses.filter(exp => {
                    const date = new Date(exp.date);
                    return date >= plRange.start && date <= plRange.end;
                });
                
                // Create P&L table
                doc.setFillColor(240, 248, 255);
                doc.rect(10, y - 4, pageWidth - 20, 50, 'F');
                
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text('REVENUE', 20, y);
                y += 6;
                doc.setFont(undefined, 'normal');
                doc.setFontSize(9);
                doc.text(`Paid Invoices (${plInvoices.length})`, 25, y);
                doc.text(`$${sectionData.revenue.toFixed(2)}`, pageWidth - 30, y, { align: 'right' });
                y += 5;
                
                // Top expense categories
                const plExpensesByCategory = {};
                plExpenses.forEach(exp => {
                    const cat = exp.category || 'Other';
                    plExpensesByCategory[cat] = (plExpensesByCategory[cat] || 0) + parseFloat(exp.amount || 0);
                });
                
                y += 3;
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text('EXPENSES', 20, y);
                y += 6;
                doc.setFont(undefined, 'normal');
                doc.setFontSize(9);
                
                const topExpCategories = Object.entries(plExpensesByCategory)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);
                
                topExpCategories.forEach(([cat, amount]) => {
                    doc.text(cat, 25, y);
                    doc.text(`$${amount.toFixed(2)}`, pageWidth - 30, y, { align: 'right' });
                    y += 4;
                });
                
                if (Object.keys(plExpensesByCategory).length > 5) {
                    const otherTotal = Object.entries(plExpensesByCategory)
                        .slice(5)
                        .reduce((sum, [_, amt]) => sum + amt, 0);
                    doc.text('Other categories', 25, y);
                    doc.text(`$${otherTotal.toFixed(2)}`, pageWidth - 30, y, { align: 'right' });
                    y += 4;
                }
                
                y += 2;
                doc.setFont(undefined, 'bold');
                doc.text('Total Expenses', 25, y);
                doc.text(`$${sectionData.expenses.toFixed(2)}`, pageWidth - 30, y, { align: 'right' });
                y += 8;
                
                doc.setLineWidth(0.5);
                doc.setDrawColor(20, 184, 166);
                doc.line(20, y - 3, pageWidth - 30, y - 3);
                
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(sectionData.profit >= 0 ? 20 : 200, sectionData.profit >= 0 ? 184 : 0, sectionData.profit >= 0 ? 166 : 0);
                doc.text('NET PROFIT', 20, y);
                doc.text(`$${sectionData.profit.toFixed(2)}`, pageWidth - 30, y, { align: 'right' });
                y += 7;
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text(`Profit Margin: ${sectionData.margin.toFixed(1)}% | ${sectionData.profit >= 0 ? 'Profitable' : 'Operating at Loss'}`, 20, y);
                doc.setTextColor(0, 0, 0);
                break;
            
            case 'gst':
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text('GST Summary', 15, y);
                y += 10;
                
                // Get GST details
                const gstRange = getReportDateRange(section.dateRange);
                const gstInvoices = invoices.filter(inv => {
                    const date = new Date(inv.issue_date);
                    return inv.status === 'paid' && date >= gstRange.start && date <= gstRange.end;
                });
                
                const totalGSTInvoices = gstInvoices.filter(inv => inv.include_gst).length;
                
                // GST box
                doc.setFillColor(255, 250, 240);
                doc.rect(10, y - 4, pageWidth - 20, 30, 'F');
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                doc.text('GST Collected (from sales)', 20, y);
                doc.text(`$${sectionData.collected.toFixed(2)}`, pageWidth - 30, y, { align: 'right' });
                y += 5;
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(`From ${totalGSTInvoices} GST-inclusive invoices`, 25, y);
                doc.setTextColor(0, 0, 0);
                y += 7;
                
                doc.setFontSize(10);
                doc.text('GST Paid (on expenses)', 20, y);
                doc.text(`$${sectionData.paid.toFixed(2)}`, pageWidth - 30, y, { align: 'right' });
                y += 5;
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text('Estimated at 10% of registered expenses', 25, y);
                doc.setTextColor(0, 0, 0);
                y += 10;
                
                doc.setLineWidth(0.5);
                doc.setDrawColor(20, 184, 166);
                doc.line(20, y - 3, pageWidth - 30, y - 3);
                
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(20, 184, 166);
                const netGST = sectionData.collected - sectionData.paid;
                doc.text(`Net GST ${netGST >= 0 ? 'Payable to' : 'Refund from'} ATO`, 20, y);
                doc.text(`$${Math.abs(netGST).toFixed(2)}`, pageWidth - 30, y, { align: 'right' });
                y += 6;
                doc.setFontSize(8);
                doc.setFont(undefined, 'italic');
                doc.setTextColor(100, 100, 100);
                doc.text(`Report for ${gstRange.label} - Ensure accuracy with your registered accountant`, 20, y);
                doc.setTextColor(0, 0, 0);
                break;
            
            case 'jobs':
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text(`Jobs Completed: ${sectionData.completed}`, 15, y);
                doc.text(`Total Jobs: ${sectionData.total}`, pageWidth - 80, y);
                y += 7;
                doc.setFont(undefined, 'normal');
                doc.text(`Completion Rate: ${sectionData.completionRate?.toFixed(1) || 0}%`, 15, y);
                y += 10;
                
                // Get actual completed jobs
                const jobsRange = getReportDateRange(section.dateRange);
                const completedJobs = jobs.filter(job => {
                    const date = new Date(job.date);
                    return job.status === 'completed' && date >= jobsRange.start && date <= jobsRange.end;
                }).sort((a, b) => new Date(b.date) - new Date(a.date));
                
                if (completedJobs.length > 0) {
                    // Calculate job analytics
                    const jobsByClient = {};
                    completedJobs.forEach(job => {
                        const client = clients.find(c => c.id === job.client_id);
                        const clientName = client?.name || 'Unknown';
                        jobsByClient[clientName] = (jobsByClient[clientName] || 0) + 1;
                    });
                    
                    // Analytics box
                    doc.setFillColor(240, 255, 240);
                    doc.rect(10, y - 4, pageWidth - 20, 15, 'F');
                    doc.setFontSize(9);
                    doc.text('Most Active Client:', 15, y);
                    const topClient = Object.entries(jobsByClient).sort((a, b) => b[1] - a[1])[0];
                    doc.text(`${topClient[0]} (${topClient[1]} jobs)`, 70, y);
                    y += 5;
                    doc.text('Unique Clients Served:', 15, y);
                    doc.text(String(Object.keys(jobsByClient).length), 70, y);
                    y += 12;
                    
                    // Jobs table
                    doc.setFillColor(0, 0, 0);
                    doc.rect(10, y - 5, pageWidth - 20, 8, 'F');
                    doc.setFontSize(8);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(255, 255, 255);
                    doc.text('Date', 15, y);
                    doc.text('Job Title', 45, y);
                    doc.text('Client', 120, y);
                    doc.text('Team', pageWidth - 30, y, { align: 'right' });
                    y += 8;
                    
                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(0, 0, 0);
                    
                    completedJobs.forEach(job => {
                        if (y > pageHeight - 25) {
                            doc.addPage();
                            y = 20;
                        }
                        
                        const client = clients.find(c => c.id === job.client_id);
                        const teamMember = job.team_member_id ? teamMembers.find(m => m.id === job.team_member_id) : null;
                        
                        doc.setFontSize(7);
                        doc.text(new Date(job.date).toLocaleDateString(), 15, y);
                        const titleText = doc.splitTextToSize(job.title || 'Untitled', 70);
                        doc.text(titleText[0], 45, y);
                        const clientText = doc.splitTextToSize(client?.name || 'Unknown', 50);
                        doc.text(clientText[0], 120, y);
                        doc.text(teamMember?.name || '-', pageWidth - 30, y, { align: 'right' });
                        y += 4;
                    });
                }
                break;
            
            case 'clients':
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text('Top Clients by Revenue', 20, y);
                y += 10;
                
                // Get client details
                const clientDetails = {};
                const clientRange = getReportDateRange(section.dateRange);
                
                invoices.forEach(inv => {
                    const invDate = new Date(inv.issue_date);
                    if (invDate >= clientRange.start && invDate <= clientRange.end) {
                        const client = clients.find(c => c.id === inv.client_id);
                        const clientName = client?.name || 'Unknown';
                        
                        if (!clientDetails[clientName]) {
                            clientDetails[clientName] = {
                                revenue: 0,
                                invoiceCount: 0,
                                paidCount: 0,
                                outstanding: 0,
                                jobCount: 0,
                                lastInvoice: null,
                                invoiceValues: []
                            };
                        }
                        
                        clientDetails[clientName].invoiceCount++;
                        if (inv.status === 'paid') {
                            clientDetails[clientName].revenue += inv.total || 0;
                            clientDetails[clientName].paidCount++;
                        } else {
                            clientDetails[clientName].outstanding += inv.total || 0;
                        }
                        clientDetails[clientName].invoiceValues.push(inv.total || 0);
                        
                        if (!clientDetails[clientName].lastInvoice || new Date(inv.issue_date) > new Date(clientDetails[clientName].lastInvoice)) {
                            clientDetails[clientName].lastInvoice = inv.issue_date;
                        }
                    }
                });
                
                // Count jobs per client
                jobs.forEach(job => {
                    const jobDate = new Date(job.date);
                    if (jobDate >= clientRange.start && jobDate <= clientRange.end && job.status === 'completed') {
                        const client = clients.find(c => c.id === job.client_id);
                        const clientName = client?.name || 'Unknown';
                        if (clientDetails[clientName]) {
                            clientDetails[clientName].jobCount++;
                        }
                    }
                });
                
                const topClients = Object.entries(clientDetails)
                    .sort((a, b) => b[1].revenue - a[1].revenue)
                    .slice(0, 10);
                
                // Table header
                doc.setFillColor(0, 0, 0);
                doc.rect(10, y - 5, pageWidth - 20, 8, 'F');
                doc.setFontSize(8);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(255, 255, 255);
                doc.text('#', 15, y);
                doc.text('Client', 22, y);
                doc.text('Revenue', 70, y);
                doc.text('Invoices', 95, y);
                doc.text('Jobs', 118, y);
                doc.text('Avg Invoice', 135, y);
                doc.text('Outstanding', 165, y);
                y += 8;
                
                doc.setFont(undefined, 'normal');
                doc.setTextColor(0, 0, 0);
                
                topClients.forEach(([clientName, details], i) => {
                    if (y > pageHeight - 25) {
                        doc.addPage();
                        y = 20;
                    }
                    
                    const avgInvoice = details.invoiceValues.length > 0 
                        ? details.invoiceValues.reduce((a, b) => a + b, 0) / details.invoiceValues.length 
                        : 0;
                    
                    doc.setFontSize(8);
                    doc.text(`${i + 1}`, 15, y);
                    const nameText = doc.splitTextToSize(clientName, 45);
                    doc.text(nameText[0], 22, y);
                    doc.text(`$${details.revenue.toFixed(2)}`, 70, y);
                    doc.text(`${details.paidCount}/${details.invoiceCount}`, 95, y);
                    doc.text(String(details.jobCount), 118, y);
                    doc.text(`$${avgInvoice.toFixed(2)}`, 135, y);
                    
                    if (details.outstanding > 0) {
                        doc.setTextColor(200, 0, 0);
                        doc.text(`$${details.outstanding.toFixed(2)}`, 165, y);
                        doc.setTextColor(0, 0, 0);
                    } else {
                        doc.text('-', 165, y);
                    }
                    
                    y += 5;
                });
                
                // Summary stats
                y += 5;
                doc.setFontSize(9);
                doc.setFont(undefined, 'italic');
                doc.setTextColor(100, 100, 100);
                const totalRevenue = topClients.reduce((sum, [_, d]) => sum + d.revenue, 0);
                const totalOutstanding = topClients.reduce((sum, [_, d]) => sum + d.outstanding, 0);
                doc.text(`Top ${topClients.length} clients represent $${totalRevenue.toFixed(2)} in revenue`, 15, y);
                if (totalOutstanding > 0) {
                    y += 4;
                    doc.text(`Total outstanding from top clients: $${totalOutstanding.toFixed(2)}`, 15, y);
                }
                doc.setTextColor(0, 0, 0);
                break;
            
            case 'quotes':
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text(`Total Quotes: ${sectionData.total}`, 15, y);
                doc.text(`Conversion Rate: ${sectionData.conversionRate.toFixed(1)}%`, pageWidth - 80, y);
                y += 10;
                
                // Get actual quotes
                const quotesRange = getReportDateRange(section.dateRange);
                const periodQuotes = quotes.filter(q => {
                    const date = new Date(q.created_at || q.date);
                    return date >= quotesRange.start && date <= quotesRange.end;
                }).sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
                
                if (periodQuotes.length > 0) {
                    // Calculate quote analytics
                    const quoteAmounts = periodQuotes.map(q => q.total || 0);
                    const avgQuote = quoteAmounts.reduce((a, b) => a + b, 0) / quoteAmounts.length;
                    const largestQuote = Math.max(...quoteAmounts);
                    const totalQuoteValue = quoteAmounts.reduce((a, b) => a + b, 0);
                    const acceptedValue = periodQuotes.filter(q => q.status === 'accepted' || q.accepted).reduce((sum, q) => sum + (q.total || 0), 0);
                    
                    // Analytics box
                    doc.setFillColor(255, 240, 255);
                    doc.rect(10, y - 4, pageWidth - 20, 25, 'F');
                    doc.setFontSize(9);
                    doc.setFont(undefined, 'normal');
                    doc.text('Total Quote Value:', 15, y);
                    doc.text(`$${totalQuoteValue.toFixed(2)}`, 65, y);
                    doc.text('Accepted Value:', 105, y);
                    doc.text(`$${acceptedValue.toFixed(2)}`, 155, y);
                    y += 5;
                    doc.text('Average Quote:', 15, y);
                    doc.text(`$${avgQuote.toFixed(2)}`, 65, y);
                    doc.text('Largest Quote:', 105, y);
                    doc.text(`$${largestQuote.toFixed(2)}`, 155, y);
                    y += 5;
                    doc.text('Accepted:', 15, y);
                    doc.text(String(sectionData.accepted), 65, y);
                    doc.text('Pending:', 105, y);
                    doc.text(String(sectionData.pending), 155, y);
                    y += 12;
                    
                    // Quotes table
                    doc.setFillColor(0, 0, 0);
                    doc.rect(10, y - 5, pageWidth - 20, 8, 'F');
                    doc.setFontSize(8);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(255, 255, 255);
                    doc.text('Date', 15, y);
                    doc.text('Quote #', 40, y);
                    doc.text('Client', 70, y);
                    doc.text('Status', 120, y);
                    doc.text('Amount', pageWidth - 30, y, { align: 'right' });
                    y += 8;
                    
                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(0, 0, 0);
                    
                    periodQuotes.forEach(quote => {
                        if (y > pageHeight - 25) {
                            doc.addPage();
                            y = 20;
                        }
                        
                        const client = clients.find(c => c.id === quote.client_id);
                        const status = quote.status || (quote.accepted ? 'accepted' : 'pending');
                        
                        doc.setFontSize(7);
                        doc.text(new Date(quote.created_at || quote.date).toLocaleDateString(), 15, y);
                        doc.text(quote.quote_number || '-', 40, y);
                        const clientText = doc.splitTextToSize(client?.name || 'Unknown', 45);
                        doc.text(clientText[0], 70, y);
                        
                        // Status with color
                        if (status === 'accepted') {
                            doc.setTextColor(0, 150, 0);
                        } else if (status === 'declined') {
                            doc.setTextColor(200, 0, 0);
                        } else {
                            doc.setTextColor(100, 100, 100);
                        }
                        doc.text(status.charAt(0).toUpperCase() + status.slice(1), 120, y);
                        doc.setTextColor(0, 0, 0);
                        
                        doc.text(`$${(quote.total || 0).toFixed(2)}`, pageWidth - 30, y, { align: 'right' });
                        y += 4;
                    });
                    
                    // Quote summary stats
                    y += 5;
                    doc.setFontSize(9);
                    doc.setFont(undefined, 'italic');
                    doc.setTextColor(100, 100, 100);
                    doc.text(`Win rate: ${sectionData.conversionRate.toFixed(1)}% | Value capture: $${acceptedValue.toFixed(2)} of $${totalQuoteValue.toFixed(2)} (${totalQuoteValue > 0 ? ((acceptedValue/totalQuoteValue)*100).toFixed(1) : 0}%)`, 15, y);
                    doc.setTextColor(0, 0, 0);
                }
                break;
        }
        
        y += 15;
    });
    
    // Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont(undefined, 'italic');
    doc.text('Generated by M4 Streamline - Professional Business Management', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    doc.save(`${report.name.replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
}

// Delete custom report
function deleteCustomReport(reportId) {
    if (!confirm('Delete this custom report?')) return;
    
    customReports = customReports.filter(r => r.id !== reportId);
    
    try {
        localStorage.setItem(`customReports_${currentUser.id}`, JSON.stringify(customReports));
        showNotification('Report deleted', 'success');
        renderApp();
    } catch (error) {
        console.error('Error deleting report:', error);
        showNotification('Failed to delete report', 'error');
    }
}

console.log('✅ Reports module loaded');

// Load custom reports when module loads
if (typeof currentUser !== 'undefined' && currentUser) {
    loadCustomReports();
}
