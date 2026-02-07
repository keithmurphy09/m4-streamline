// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Invoices Module (Professional Table View)
// ═══════════════════════════════════════════════════════════════════

// View state
let invoiceViewMode = 'table'; // 'table' or 'detail'
let selectedInvoiceForDetail = null;

function openInvoiceDetail(invoice) {
    selectedInvoiceForDetail = invoice;
    invoiceViewMode = 'detail';
    renderApp();
}

function closeInvoiceDetail() {
    selectedInvoiceForDetail = null;
    invoiceViewMode = 'table';
    renderApp();
}

function renderInvoices() {
    if (invoiceViewMode === 'detail' && selectedInvoiceForDetail) {
        return renderInvoiceDetail();
    }
    return renderInvoicesTable();
}

function renderInvoicesTable() {
    // Monthly view (special case)
    if (invoiceFilter === 'monthly') {
        return renderMonthlyInvoices();
    }
    
    const filteredInvoices = invoices.filter(inv => {
        const matchesStatus = invoiceFilter === 'all' || inv.status === invoiceFilter;
        if (!matchesStatus) return false;
        
        const client = clients.find(c => c.id === inv.client_id);
        const relatedQuote = quotes.find(q => q.id === inv.quote_id);
        const searchTerm = invoiceSearch.toLowerCase();
        return inv.title.toLowerCase().includes(searchTerm) ||
               inv.invoice_number?.toLowerCase().includes(searchTerm) ||
               client?.name.toLowerCase().includes(searchTerm) ||
               inv.job_address?.toLowerCase().includes(searchTerm) ||
               relatedQuote?.job_address?.toLowerCase().includes(searchTerm) ||
               client?.address?.toLowerCase().includes(searchTerm) ||
               inv.total?.toString().includes(searchTerm);
    });
    
    const sortedInvoices = [...filteredInvoices].sort((a, b) => {
        return new Date(b.issue_date || b.created_at || 0) - new Date(a.issue_date || a.created_at || 0);
    });
    
    const totalInvoices = sortedInvoices.length;
    const startIndex = (currentPage.invoices - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedInvoices = sortedInvoices.slice(startIndex, endIndex);
    
    const invoiceRows = paginatedInvoices.length === 0 
        ? '<tr><td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No invoices found</td></tr>'
        : paginatedInvoices.map(inv => {
            const client = clients.find(c => c.id === inv.client_id);
            const relatedQuote = quotes.find(q => q.id === inv.quote_id);
            const jobAddress = inv.job_address || relatedQuote?.job_address || client?.address || '';
            const isSelected = selectedInvoices.includes(inv.id);
            const isPaid = inv.status === 'paid';
            const isOverdue = inv.status === 'unpaid' && inv.due_date && new Date(inv.due_date) < new Date();
            
            let statusBadge = '';
            if (isPaid) {
                statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">PAID</span>';
            } else if (isOverdue) {
                statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">OVERDUE</span>';
            } else {
                statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">UNPAID</span>';
            }
            
            return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${isSelected ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}" onclick="openInvoiceDetail(${JSON.stringify(inv).replace(/"/g, '&quot;')})">
                <td class="px-6 py-4" onclick="event.stopPropagation()">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelection('invoices', '${inv.id}')" class="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500">
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${inv.invoice_number || 'INV-' + inv.id.slice(0, 3)}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${client?.name || 'Unknown'}</div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">${jobAddress}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 dark:text-white">${inv.title}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-600 dark:text-gray-400">${formatDate(inv.issue_date || inv.created_at)}</div>
                    ${inv.due_date ? `<div class="text-xs text-gray-400 dark:text-gray-500">Due ${formatDate(inv.due_date)}</div>` : ''}
                </td>
                <td class="px-6 py-4">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">${formatCurrency(inv.total)}</div>
                </td>
                <td class="px-6 py-4 text-right" onclick="event.stopPropagation()">
                    <div class="relative inline-block">
                        <button onclick="toggleInvoiceActions('${inv.id}')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                            </svg>
                        </button>
                        <div id="inv-actions-${inv.id}" class="hidden fixed mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                            <div class="py-1">
                                <button onclick="generatePDF('invoice', ${JSON.stringify(inv).replace(/"/g, '&quot;')}); toggleInvoiceActions('${inv.id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Download PDF</button>
                                <button onclick="sendInvoiceEmail(${JSON.stringify(inv).replace(/"/g, '&quot;')}); toggleInvoiceActions('${inv.id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Email Invoice</button>
                                ${isPaid ? `<button onclick="markUnpaid('${inv.id}'); toggleInvoiceActions('${inv.id}')" class="block w-full text-left px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-700">Mark Unpaid</button>` : `<button onclick="markPaid('${inv.id}'); toggleInvoiceActions('${inv.id}')" class="block w-full text-left px-4 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-700">Mark Paid</button>`}
                                <button onclick="deleteInvoice('${inv.id}'); toggleInvoiceActions('${inv.id}')" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>`;
        }).join('');
    
    const pagination = getPaginationHTML('invoices', totalInvoices, currentPage.invoices);
    
    const bulkActions = selectedInvoices.length > 0 ? `
        <div class="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
                <span class="font-semibold text-teal-700 dark:text-teal-400">${selectedInvoices.length}</span> invoice${selectedInvoices.length > 1 ? 's' : ''} selected
            </span>
            <button onclick="bulkDelete('invoices')" class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors">
                Delete Selected
            </button>
        </div>
    ` : '';
    
    const filterTabs = `
        <div class="flex flex-wrap gap-2 mb-4">
            <button onclick="invoiceFilter='unpaid'; currentPage.invoices=1; renderApp();" class="px-4 py-2 rounded-lg text-sm font-medium ${invoiceFilter === 'unpaid' ? 'bg-black text-white border-teal-400' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'} border transition-colors">
                Unpaid (${invoices.filter(i => i.status === 'unpaid').length})
            </button>
            <button onclick="invoiceFilter='paid'; currentPage.invoices=1; renderApp();" class="px-4 py-2 rounded-lg text-sm font-medium ${invoiceFilter === 'paid' ? 'bg-black text-white border-teal-400' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'} border transition-colors">
                Paid (${invoices.filter(i => i.status === 'paid').length})
            </button>
            <button onclick="invoiceFilter='monthly'; currentPage.invoices=1; renderApp();" class="px-4 py-2 rounded-lg text-sm font-medium ${invoiceFilter === 'monthly' ? 'bg-black text-white border-teal-400' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'} border transition-colors">
                Monthly View
            </button>
        </div>
    `;
    
    return `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-visible">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100 dark:border-gray-700">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Track payments and manage invoicing</p>
                </div>
                <button onclick="openModal('invoice')" class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-900 border border-teal-400 rounded-lg transition-colors shadow-sm">
                    Create Invoice
                </button>
            </div>
            
            ${filterTabs}
            
            <!-- Search and Filter -->
            <div class="flex gap-3">
                <input type="text" 
                       id="invoice-search-input"
                       placeholder="Search invoices by number, client, or description..." 
                       value="${invoiceSearch}" 
                       oninput="invoiceSearch = this.value; clearTimeout(window.invoiceSearchTimer); window.invoiceSearchTimer = setTimeout(() => { renderApp(); setTimeout(() => document.getElementById('invoice-search-input')?.focus(), 0); }, 300);" 
                       class="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
                <button onclick="exportToCSV('invoices')" class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">
                    Export CSV
                </button>
            </div>
        </div>
        
        ${bulkActions}
        
        <!-- Table -->
        <div class="overflow-x-auto overflow-y-visible">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <th class="px-6 py-3 text-left w-12">
                            <input type="checkbox" 
                                   ${selectedInvoices.length === invoices.length && invoices.length > 0 ? 'checked' : ''} 
                                   onchange="toggleSelectAll('invoices')" 
                                   class="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500">
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Client</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Description</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                        <th class="px-6 py-3 w-12"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
                    ${invoiceRows}
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        ${pagination ? `<div class="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            ${pagination}
        </div>` : ''}
    </div>`;
}

function toggleInvoiceActions(invoiceId) {
    const menu = document.getElementById(`inv-actions-${invoiceId}`);
    const button = event.target.closest('button');
    
    if (menu) {
        if (menu.classList.contains('hidden')) {
            // Position menu below button
            const rect = button.getBoundingClientRect();
            menu.style.top = `${rect.bottom + 8}px`;
            menu.style.left = `${rect.right - 192}px`; // 192px = w-48
            menu.classList.remove('hidden');
        } else {
            menu.classList.add('hidden');
        }
    }
    // Close other menus
    document.querySelectorAll('[id^="inv-actions-"]').forEach(m => {
        if (m.id !== `inv-actions-${invoiceId}`) {
            m.classList.add('hidden');
        }
    });
}

function renderMonthlyInvoices() {
    const monthlyData = {};
    invoices.filter(i => i.status === 'paid').forEach(inv => {
        const month = inv.paid_date ? new Date(inv.paid_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';
        if (!monthlyData[month]) monthlyData[month] = [];
        monthlyData[month].push(inv);
    });
    
    const months = Object.keys(monthlyData).sort((a, b) => new Date(b) - new Date(a));
    
    const monthlyHtml = months.map(month => {
        const monthInvoices = monthlyData[month];
        const monthTotal = monthInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
        
        const invoicesList = monthInvoices.map(inv => {
            const client = clients.find(c => c.id === inv.client_id);
            return `<div class="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer" onclick="openInvoiceDetail(${JSON.stringify(inv).replace(/"/g, '&quot;')})">
                <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${inv.invoice_number || 'INV-' + inv.id.slice(0, 3)} - ${inv.title}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${client?.name || 'Unknown'} • Paid ${formatDate(inv.paid_date)}</div>
                </div>
                <div class="text-sm font-semibold text-gray-900 dark:text-white">${formatCurrency(inv.total)}</div>
            </div>`;
        }).join('');
        
        return `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-4">
            <div class="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${month}</h3>
                <div class="text-right">
                    <div class="text-2xl font-bold text-teal-600 dark:text-teal-400">${formatCurrency(monthTotal)}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${monthInvoices.length} invoice${monthInvoices.length > 1 ? 's' : ''}</div>
                </div>
            </div>
            <div class="space-y-2">
                ${invoicesList}
            </div>
        </div>`;
    }).join('');
    
    return `<div>
        <div class="mb-6">
            <button onclick="invoiceFilter='unpaid'; renderApp();" class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Invoices
            </button>
        </div>
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Monthly Revenue</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Paid invoices grouped by month</p>
        </div>
        ${monthlyHtml || '<div class="text-center py-12 text-gray-500 dark:text-gray-400">No paid invoices found</div>'}
    </div>`;
}

function renderInvoiceDetail() {
    const inv = selectedInvoiceForDetail;
    if (!inv) {
        closeInvoiceDetail();
        return '';
    }
    
    const client = clients.find(c => c.id === inv.client_id);
    const linkedQuote = inv.quote_id ? quotes.find(q => q.id === inv.quote_id) : null;
    const isPaid = inv.status === 'paid';
    const isOverdue = inv.status === 'unpaid' && inv.due_date && new Date(inv.due_date) < new Date();
    
    let statusBadge = '';
    if (isPaid) {
        statusBadge = '<span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">PAID</span>';
    } else if (isOverdue) {
        statusBadge = '<span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">OVERDUE</span>';
    } else {
        statusBadge = '<span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">UNPAID</span>';
    }
    
    // Calculate profit/loss if we have expense data
    const linkedExpenses = expenses.filter(e => e.invoice_id === inv.id || (linkedQuote && e.quote_id === linkedQuote.id));
    const totalExpenses = linkedExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const revenue = parseFloat(inv.total || 0);
    const profit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;
    
    // Line items table
    const lineItemsTable = inv.items && inv.items.length > 0 ? `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Line Items</h3>
            <table class="w-full">
                <thead>
                    <tr class="border-b border-gray-100 dark:border-gray-700">
                        <th class="py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Description</th>
                        <th class="py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Qty</th>
                        <th class="py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Price</th>
                        <th class="py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Total</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
                    ${inv.items.map(item => `
                        <tr>
                            <td class="py-3 text-sm text-gray-900 dark:text-white">${item.description}</td>
                            <td class="py-3 text-sm text-gray-600 dark:text-gray-400 text-center">${item.quantity || 1}</td>
                            <td class="py-3 text-sm text-gray-600 dark:text-gray-400 text-right">${formatCurrency(item.price)}</td>
                            <td class="py-3 text-sm font-medium text-gray-900 dark:text-white text-right">${formatCurrency((item.quantity || 1) * (item.price || 0))}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr class="border-t-2 border-gray-200 dark:border-gray-600">
                        <td colspan="3" class="py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Subtotal:</td>
                        <td class="py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">${formatCurrency(inv.subtotal || inv.total)}</td>
                    </tr>
                    ${inv.gst ? `<tr>
                        <td colspan="3" class="py-2 text-right text-sm text-gray-600 dark:text-gray-400">GST (10%):</td>
                        <td class="py-2 text-right text-sm text-gray-600 dark:text-gray-400">${formatCurrency(inv.gst)}</td>
                    </tr>` : ''}
                    <tr class="border-t border-gray-200 dark:border-gray-600">
                        <td colspan="3" class="py-4 text-right text-lg font-bold text-gray-900 dark:text-white">Total:</td>
                        <td class="py-4 text-right text-lg font-bold text-gray-900 dark:text-white">${formatCurrency(inv.total)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    ` : '';
    
    const profitLossSection = linkedExpenses.length > 0 ? `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profit & Loss</h3>
            <div class="space-y-3">
                <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Invoice Amount:</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">${formatCurrency(revenue)}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Total Expenses:</span>
                    <span class="text-sm font-medium text-red-600 dark:text-red-400">${formatCurrency(totalExpenses)}</span>
                </div>
                <div class="flex justify-between py-3 bg-teal-50 dark:bg-teal-900/20 px-4 rounded-lg">
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">Net Profit:</span>
                    <div class="text-right">
                        <span class="text-lg font-bold ${profit >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-red-700 dark:text-red-400'}">${formatCurrency(profit)}</span>
                        <span class="text-xs ${profit >= 0 ? 'text-teal-600 dark:text-teal-500' : 'text-red-600 dark:text-red-500'} ml-2">(${profitMargin}% margin)</span>
                    </div>
                </div>
            </div>
        </div>
    ` : '';
    
    const activityTimeline = `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Activity</h3>
            <div class="space-y-3">
                ${isPaid ? `<div class="flex gap-3">
                    <div class="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></div>
                    <div class="flex-1">
                        <div class="text-xs text-gray-400 dark:text-gray-500">${formatDate(inv.paid_date)}</div>
                        <div class="text-sm text-gray-900 dark:text-white">Invoice paid</div>
                    </div>
                </div>` : ''}
                <div class="flex gap-3">
                    <div class="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mt-1.5 flex-shrink-0"></div>
                    <div class="flex-1">
                        <div class="text-xs text-gray-400 dark:text-gray-500">${formatDate(inv.issue_date || inv.created_at)}</div>
                        <div class="text-sm text-gray-900 dark:text-white">Invoice issued</div>
                    </div>
                </div>
                ${linkedQuote ? `<div class="flex gap-3">
                    <div class="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mt-1.5 flex-shrink-0"></div>
                    <div class="flex-1">
                        <div class="text-xs text-gray-400 dark:text-gray-500">${formatDate(linkedQuote.created_at)}</div>
                        <div class="text-sm text-gray-900 dark:text-white">Converted from quote</div>
                    </div>
                </div>` : ''}
            </div>
        </div>
    `;
    
    return `<div class="space-y-6">
        <!-- Back Button -->
        <button onclick="closeInvoiceDetail()" class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Invoices
        </button>
        
        <!-- Header -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">${inv.invoice_number || 'INV-' + inv.id.slice(0, 3)}</h1>
                        ${statusBadge}
                    </div>
                    <h2 class="text-xl text-gray-600 dark:text-gray-400">${inv.title}</h2>
                    <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Issued ${formatDate(inv.issue_date || inv.created_at)}</p>
                    ${inv.due_date ? `<p class="text-sm text-gray-400 dark:text-gray-500">Due ${formatDate(inv.due_date)}</p>` : ''}
                </div>
                <div class="text-right">
                    <div class="text-4xl font-bold text-gray-900 dark:text-white">${formatCurrency(inv.total)}</div>
                    <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Total Amount</p>
                    ${inv.amount_paid > 0 ? `
                        <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div class="text-sm text-gray-600 dark:text-gray-400">Paid: <span class="font-semibold text-teal-600 dark:text-teal-400">${formatCurrency(inv.amount_paid)}</span></div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">Balance: <span class="font-semibold ${inv.balance_due > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}">${formatCurrency(inv.balance_due || (inv.total - inv.amount_paid))}</span></div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Actions -->
            <div class="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                ${!isPaid ? `<button onclick='openModal("invoice", ${JSON.stringify(inv).replace(/"/g, "&quot;")})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">Edit Invoice</button>` : ''}
                ${!isPaid ? `<button onclick="recordPayment('${inv.id}', ${inv.total}, ${inv.amount_paid || 0})" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Record Payment</button>` : ''}
                ${!isPaid ? `<button onclick="markPaid('${inv.id}')" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">Mark Fully Paid</button>` : `<button onclick="markUnpaid('${inv.id}')" class="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg transition-colors">Mark as Unpaid</button>`}
                <button onclick='generatePDF("invoice", ${JSON.stringify(inv).replace(/"/g, '&quot;')})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">Download PDF</button>
                <button onclick='sendInvoiceEmail(${JSON.stringify(inv).replace(/"/g, '&quot;')})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">Email Invoice</button>
                <button onclick="deleteInvoice('${inv.id}')" class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors ml-auto">Delete</button>
            </div>
        </div>
        
        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left Column (2/3) -->
            <div class="lg:col-span-2 space-y-6">
                ${lineItemsTable}
                ${profitLossSection}
            </div>
            
            <!-- Right Column (1/3) -->
            <div class="space-y-6">
                <!-- Client Info -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Client</h3>
                    <div class="space-y-3">
                        <div>
                            <div class="text-sm font-medium text-gray-900 dark:text-white">${client?.name || 'Unknown'}</div>
                        </div>
                        ${client?.email ? `<div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email</div>
                            <div class="text-sm text-gray-900 dark:text-white">${client.email}</div>
                        </div>` : ''}
                        ${client?.phone ? `<div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Phone</div>
                            <div class="text-sm text-gray-900 dark:text-white">${client.phone}</div>
                        </div>` : ''}
                        ${client?.address ? `<div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Address</div>
                            <div class="text-sm text-gray-900 dark:text-white">${client.address}</div>
                        </div>` : ''}
                    </div>
                </div>
                
                <!-- Notes -->
                ${inv.notes ? `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Notes</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">${inv.notes}</p>
                </div>` : ''}
                
                ${linkedQuote ? `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Related Quote</h3>
                    <button onclick="switchTab('quotes'); openQuoteDetail(${JSON.stringify(linkedQuote).replace(/"/g, '&quot;')})" class="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                        <div class="text-sm font-medium text-teal-600 dark:text-teal-400">${linkedQuote.quote_number || 'QT-' + linkedQuote.id.slice(0, 3)}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">${linkedQuote.title}</div>
                    </button>
                </div>` : ''}
                
                <!-- Activity -->
                ${activityTimeline}
            </div>
        </div>
    </div>`;
}

// Record payment function
async function recordPayment(invoiceId, total, amountPaid) {
    const balance = total - amountPaid;
    const paymentAmount = prompt(`Record payment amount (Balance due: $${balance.toFixed(2)}):`);
    
    if (!paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    const newAmountPaid = amountPaid + amount;
    const newBalance = total - newAmountPaid;
    const isFullyPaid = newBalance <= 0.01;
    
    try {
        isLoading = true;
        loadingMessage = 'Recording payment...';
        renderApp();
        
        const { data, error} = await supabaseClient
            .from('invoices')
            .update({
                amount_paid: newAmountPaid,
                balance_due: newBalance,
                status: isFullyPaid ? 'paid' : 'unpaid',
                paid_date: isFullyPaid ? new Date().toISOString().split('T')[0] : null
            })
            .eq('id', invoiceId)
            .select();
        
        if (error) throw error;
        
        const index = invoices.findIndex(i => i.id === invoiceId);
        if (index !== -1) invoices[index] = data[0];
        
        showNotification(`Payment of $${amount.toFixed(2)} recorded successfully!`, 'success');
    } catch (error) {
        console.error('Error recording payment:', error);
        showNotification('Failed to record payment: ' + error.message, 'error');
    } finally {
        isLoading = false;
        renderApp();
    }
}

console.log('✅ Invoices module loaded (Professional Table View)');
