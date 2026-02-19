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
                    <button onclick="openCustomReportBuilder()" class="px-4 py-2 bg-white text-teal-600 border border-teal-400 rounded-lg hover:bg-teal-50 transition-colors text-sm whitespace-nowrap">
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

// Download report as PDF with M4 branding and professional tables
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
    
    // Generate PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Add M4 logo
    const logoUrl = companySettings?.logo_url || 'https://i.imgur.com/dF4xRDK.jpeg';
    try {
        const img = await loadImageForPDF(logoUrl);
        doc.addImage(img, 'JPEG', pageWidth - 45, 10, 35, 20);
    } catch (error) {
        console.log('Logo load skipped');
    }
    
    let y = 15;
    
    // Company name
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(20, 184, 166);
    doc.text(companySettings?.business_name || 'M4 STREAMLINE', 15, y);
    
    y += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('"streamlining your business"', 15, y);
    
    y += 15;
    
    // Report title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Financial Report', 15, y);
    
    y += 7;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(range.label, 15, y);
    doc.text(`${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}`, 15, y + 5);
    
    y += 15;
    
    // Profit & Loss Table
    doc.autoTable({
        startY: y,
        head: [['Profit & Loss Statement', '']],
        body: [
            ['Revenue', `$${revenue.toFixed(2)}`],
            ['Total Expenses', `$${totalExpenses.toFixed(2)}`],
            ['', ''],
            [{ content: 'Net Profit', styles: { fontStyle: 'bold' } }, 
             { content: `$${profit.toFixed(2)} (${margin.toFixed(1)}% margin)`, styles: { fontStyle: 'bold', textColor: profit >= 0 ? [20, 184, 166] : [255, 140, 0] } }]
        ],
        theme: 'grid',
        headStyles: { fillColor: [20, 184, 166], fontSize: 12, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 120 },
            1: { halign: 'right', cellWidth: 60 }
        },
        margin: { left: 15, right: 15 }
    });
    
    y = doc.lastAutoTable.finalY + 10;
    
    // GST Summary Table
    doc.autoTable({
        startY: y,
        head: [['GST Summary', '']],
        body: [
            ['GST Collected (on sales)', `$${gstCollected.toFixed(2)}`],
            ['GST Paid (on expenses)', '$0.00'],
            ['', ''],
            [{ content: 'Net GST Payable', styles: { fontStyle: 'bold' } }, 
             { content: `$${gstCollected.toFixed(2)}`, styles: { fontStyle: 'bold', textColor: [20, 184, 166] } }]
        ],
        theme: 'grid',
        headStyles: { fillColor: [20, 184, 166], fontSize: 12, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 120 },
            1: { halign: 'right', cellWidth: 60 }
        },
        margin: { left: 15, right: 15 }
    });
    
    y = doc.lastAutoTable.finalY + 10;
    
    // Check if new page needed
    if (y > pageHeight - 80) {
        doc.addPage();
        y = 20;
    }
    
    // Expense Breakdown Table
    const expenseRows = Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amount]) => [
            cat,
            `$${amount.toFixed(2)}`,
            `${revenue > 0 ? ((amount / revenue) * 100).toFixed(1) : '0.0'}%`
        ]);
    
    expenseRows.push([
        { content: 'Total', styles: { fontStyle: 'bold' } },
        { content: `$${totalExpenses.toFixed(2)}`, styles: { fontStyle: 'bold' } },
        { content: `${revenue > 0 ? ((totalExpenses / revenue) * 100).toFixed(1) : '0.0'}%`, styles: { fontStyle: 'bold' } }
    ]);
    
    doc.autoTable({
        startY: y,
        head: [['Expense Breakdown by Category', 'Amount', '% of Revenue']],
        body: expenseRows.length > 1 ? expenseRows : [['No expenses for this period', '', '']],
        theme: 'grid',
        headStyles: { fillColor: [20, 184, 166], fontSize: 12, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 90 },
            1: { halign: 'right', cellWidth: 50 },
            2: { halign: 'right', cellWidth: 40 }
        },
        margin: { left: 15, right: 15 }
    });
    
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
        doc.text(
            `Generated on ${new Date().toLocaleDateString()}`,
            15,
            pageHeight - 10
        );
    }
    
    // Save PDF
    doc.save(`Financial-Report-${range.label.replace(/\s/g, '-')}.pdf`);
}

// Helper function to load images for PDF
function loadImageForPDF(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
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
            const expensesByCategory = {};
            periodExpenses.forEach(exp => {
                const cat = exp.category || 'Other';
                byCategory[cat] = (byCategory[cat] || 0) + parseFloat(exp.amount || 0);
                if (!expensesByCategory[cat]) {
                    expensesByCategory[cat] = [];
                }
                expensesByCategory[cat].push(exp);
            });
            return {
                total: totalExpenses,
                byCategory,
                expensesByCategory, // Detailed items
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
            return {
                completed: periodJobs.length,
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
            return {
                total: periodQuotes.length,
                accepted,
                conversionRate: periodQuotes.length > 0 ? (accepted / periodQuotes.length * 100) : 0,
                range: range.label
            };
        
        default:
            return {};
    }
}

// Download custom report as PDF
async function downloadCustomReportPDF(reportId) {
    try {
        console.log('Generating custom report PDF for:', reportId);
        
        const report = customReports.find(r => r.id === reportId);
        if (!report) {
            console.error('Report not found:', reportId);
            alert('Report not found');
            return;
        }
        
        // Always get fresh data
        const data = {};
        report.sections.forEach(section => {
            const range = getReportDateRange(section.dateRange);
            data[section.id] = calculateSectionData(section.id, range);
        });
        
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            console.error('jsPDF not loaded');
            alert('PDF library not loaded. Please refresh the page.');
            return;
        }
        
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Add M4 logo
        const logoUrl = companySettings?.logo_url || 'https://i.imgur.com/dF4xRDK.jpeg';
        try {
            const img = await loadImageForPDF(logoUrl);
            doc.addImage(img, 'JPEG', 15, 13, 25, 25);
        } catch (error) {
            console.log('Logo load skipped:', error.message);
        }
        
        let y = 15;
        
        // Company name and tagline (centered on right side)
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(20, 184, 166);
        doc.text('M4 STREAMLINE', pageWidth / 2, y, { align: 'center' });
        
        y += 8;
        doc.setFontSize(11);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(20, 184, 166);
        doc.text('"streamlining your business"', pageWidth / 2, y, { align: 'center' });
        
        y += 20;
        
        // Report title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(report.name, pageWidth / 2, y, { align: 'center' });
        
        y += 10;
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const now = new Date();
        const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
        doc.text(`Generated: ${dateStr}`, pageWidth / 2, y, { align: 'center' });
        
        y += 15;
        
        // Company info (centered)
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(companySettings?.business_name || 'M4 Streamline', pageWidth / 2, y, { align: 'center' });
        y += 5;
        if (companySettings?.abn) {
            doc.text(`ABN: ${companySettings.abn}`, pageWidth / 2, y, { align: 'center' });
            y += 5;
        }
        
        y += 10;
        
        const sectionNames = {
            revenue: 'Revenue Summary',
            expenses: 'Expense Breakdown',
            profit: 'Profit & Loss',
            gst: 'GST Summary',
            jobs: 'Jobs Completed',
            clients: 'Top Clients',
            quotes: 'Quote Statistics'
        };
        
        // Render each section
        for (const section of report.sections) {
            const sectionData = data[section.id];
            if (!sectionData) continue;
            
            // Check if new page needed
            if (y > pageHeight - 40) {
                doc.addPage();
                y = 20;
            }
            
            // Section header (teal bar)
            doc.setFillColor(20, 184, 166);
            doc.rect(15, y - 5, pageWidth - 30, 10, 'F');
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(sectionNames[section.id], 20, y + 2);
            
            y += 12;
            
            // Period
            doc.setFontSize(10);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text(`Period: ${sectionData.range}`, 20, y);
            y += 10;
            
            if (section.id === 'expenses' && sectionData.expensesByCategory) {
                // Total Expenses
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text(`Total Expenses: $${sectionData.total.toFixed(2)}`, 20, y);
                y += 10;
                
                // Each category with detailed line items
                const sortedCategories = Object.entries(sectionData.byCategory).sort((a, b) => b[1] - a[1]);
                
                for (const [category, total] of sortedCategories) {
                    const categoryExpenses = sectionData.expensesByCategory[category];
                    
                    if (y > pageHeight - 60) {
                        doc.addPage();
                        y = 20;
                    }
                    
                    // Category header with gray background
                    doc.setFillColor(240, 240, 240);
                    doc.rect(15, y - 4, pageWidth - 30, 8, 'F');
                    doc.setFontSize(11);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(0, 0, 0);
                    doc.text(category, 20, y + 2);
                    doc.text(`$${total.toFixed(2)}`, pageWidth - 20, y + 2, { align: 'right' });
                    y += 10;
                    
                    // Table header
                    doc.setFontSize(9);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(80, 80, 80);
                    doc.text('Date', 20, y);
                    doc.text('Description', 45, y);
                    doc.text('Job', 120, y);
                    doc.text('Amount', pageWidth - 20, y, { align: 'right' });
                    y += 6;
                    
                    // Expense line items
                    doc.setFont(undefined, 'normal');
                    doc.setFontSize(8);
                    doc.setTextColor(0, 0, 0);
                    
                    for (const exp of categoryExpenses) {
                        if (y > pageHeight - 20) {
                            doc.addPage();
                            y = 20;
                        }
                        
                        const date = new Date(exp.date).toLocaleDateString('en-GB');
                        const description = doc.splitTextToSize(exp.description || '', 70);
                        const job = exp.job_reference || '';
                        const amount = `$${parseFloat(exp.amount || 0).toFixed(2)}`;
                        
                        doc.text(date, 20, y);
                        doc.text(description[0] || '', 45, y);
                        doc.text(job, 120, y);
                        doc.text(amount, pageWidth - 20, y, { align: 'right' });
                        
                        y += 5;
                    }
                    
                    y += 5; // Space before next category
                }
                
            } else {
                // Other sections use simple tables
                switch (section.id) {
                    case 'revenue':
                        doc.autoTable({
                            startY: y,
                            body: [
                                ['Total Revenue', `$${sectionData.total.toFixed(2)}`],
                                ['Invoices Paid', sectionData.count.toString()]
                            ],
                            theme: 'plain',
                            styles: { fontSize: 10, cellPadding: 2 },
                            columnStyles: {
                                0: { cellWidth: 120, fontStyle: 'bold' },
                                1: { halign: 'right', cellWidth: 60 }
                            },
                            margin: { left: 20 }
                        });
                        y = doc.lastAutoTable.finalY + 10;
                        break;
                    
                    case 'profit':
                        doc.autoTable({
                            startY: y,
                            body: [
                                ['Revenue', `$${sectionData.revenue.toFixed(2)}`],
                                ['Expenses', `$${sectionData.expenses.toFixed(2)}`],
                                [{ content: 'Net Profit', styles: { fontStyle: 'bold' } }, 
                                 { content: `$${sectionData.profit.toFixed(2)} (${sectionData.margin.toFixed(1)}%)`, 
                                   styles: { fontStyle: 'bold' } }]
                            ],
                            theme: 'plain',
                            styles: { fontSize: 10, cellPadding: 2 },
                            columnStyles: {
                                0: { cellWidth: 120 },
                                1: { halign: 'right', cellWidth: 60 }
                            },
                            margin: { left: 20 }
                        });
                        y = doc.lastAutoTable.finalY + 10;
                        break;
                    
                    case 'gst':
                        doc.autoTable({
                            startY: y,
                            body: [
                                ['GST Collected', `$${sectionData.collected.toFixed(2)}`],
                                ['GST Paid', `$${sectionData.paid.toFixed(2)}`],
                                [{ content: 'Net GST Payable', styles: { fontStyle: 'bold' } }, 
                                 { content: `$${sectionData.collected.toFixed(2)}`, styles: { fontStyle: 'bold' } }]
                            ],
                            theme: 'plain',
                            styles: { fontSize: 10, cellPadding: 2 },
                            columnStyles: {
                                0: { cellWidth: 120 },
                                1: { halign: 'right', cellWidth: 60 }
                            },
                            margin: { left: 20 }
                        });
                        y = doc.lastAutoTable.finalY + 10;
                        break;
                    
                    case 'jobs':
                        doc.setFontSize(10);
                        doc.setFont(undefined, 'normal');
                        doc.setTextColor(0, 0, 0);
                        doc.text(`Jobs Completed: ${sectionData.completed}`, 20, y);
                        y += 10;
                        break;
                    
                    case 'clients':
                        if (sectionData.topClients && sectionData.topClients.length > 0) {
                            const clientRows = sectionData.topClients.map(([name, revenue], i) => [
                                `${i + 1}. ${name}`,
                                `$${revenue.toFixed(2)}`
                            ]);
                            
                            doc.autoTable({
                                startY: y,
                                body: clientRows,
                                theme: 'plain',
                                styles: { fontSize: 10, cellPadding: 2 },
                                columnStyles: {
                                    0: { cellWidth: 120 },
                                    1: { halign: 'right', cellWidth: 60 }
                                },
                                margin: { left: 20 }
                            });
                            y = doc.lastAutoTable.finalY + 10;
                        }
                        break;
                    
                    case 'quotes':
                        doc.autoTable({
                            startY: y,
                            body: [
                                ['Total Quotes', sectionData.total.toString()],
                                ['Accepted', sectionData.accepted.toString()],
                                ['Conversion Rate', `${sectionData.conversionRate.toFixed(1)}%`]
                            ],
                            theme: 'plain',
                            styles: { fontSize: 10, cellPadding: 2 },
                            columnStyles: {
                                0: { cellWidth: 120 },
                                1: { halign: 'right', cellWidth: 60 }
                            },
                            margin: { left: 20 }
                        });
                        y = doc.lastAutoTable.finalY + 10;
                        break;
                }
            }
            
            y += 5;
        }
        
        // Footer on last page
        doc.setPage(doc.internal.getNumberOfPages());
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text(
            'Generated by M4 Streamline - Professional Business Management',
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
        
        console.log('Saving PDF...');
        doc.save(`${report.name.replace(/\s/g, '-')}.pdf`);
        console.log('PDF generated successfully');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert(`Failed to generate PDF: ${error.message}`);
    }
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
