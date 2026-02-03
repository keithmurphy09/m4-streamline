// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Invoices Module
// ═══════════════════════════════════════════════════════════════════

function renderInvoices() {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let content = '';
    
    if (invoiceFilter === 'monthly') {
        const paidInvoices = invoices.filter(i => i.status === 'paid');
        const monthlyGroups = {};
        
        paidInvoices.forEach(inv => {
            const date = new Date(inv.issue_date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            if (!monthlyGroups[monthKey]) {
                monthlyGroups[monthKey] = {
                    label: monthLabel,
                    invoices: [],
                    total: 0
                };
            }
            monthlyGroups[monthKey].invoices.push(inv);
            monthlyGroups[monthKey].total += parseFloat(inv.total || 0);
        });
        
        const sortedMonths = Object.keys(monthlyGroups).sort().reverse();
        
        content = sortedMonths.length === 0 
            ? '<div class="text-center py-12 text-gray-500 dark:text-gray-400">No paid invoices yet</div>'
            : sortedMonths.map(monthKey => {
                const group = monthlyGroups[monthKey];
                return `
                    <div class="mb-6">
                        <div class="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-400 mb-3">
                            <div class="flex justify-between items-center">
                                <h3 class="text-xl font-bold text-teal-900">${group.label}</h3>
                                <div class="text-right">
                                    <div class="text-sm text-gray-600 dark:text-gray-300">${group.invoices.length} invoice${group.invoices.length === 1 ? '' : 's'}</div>
                                    <div class="text-2xl font-bold text-teal-600">$${group.total.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                        <div class="grid gap-3 ml-4">
                            ${group.invoices.map(inv => {
                                const client = clients.find(c => c.id === inv.client_id);
                                const linkedQuote = inv.quote_id ? quotes.find(q => q.id === inv.quote_id) : null;
                                const jobAddress = linkedQuote?.job_address || client?.address || '';
                                return `<div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow border-l-4 border-green-500">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <h4 class="font-semibold dark:text-white">${inv.title}</h4>
                                            <p class="text-sm text-gray-600 dark:text-gray-300">${client?.name || 'Unknown'}${jobAddress ? ` • 📍 ${jobAddress}` : ''}</p>
                                            <p class="text-xs text-gray-500 dark:text-gray-400">${inv.invoice_number} • ${inv.issue_date}</p>
                                            ${inv.paid_date ? `<p class="text-xs text-green-600 font-medium mt-1">✓ Paid: ${new Date(inv.paid_date).toLocaleDateString()}</p>` : ''}
                                        </div>
                                        <div class="text-right">
                                            <p class="text-xl font-bold text-green-600">$${inv.total?.toFixed(2)}</p>
                                            <div class="flex gap-2 mt-2">
                                                <button onclick='openModal("invoice", ${JSON.stringify(inv).replace(/"/g, "&quot;")})' class="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
                                                <button onclick="generatePDF('invoice', ${JSON.stringify(inv).replace(/"/g, '&quot;')})" class="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">PDF</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('');
    } else {
        let filteredInvoices = invoiceFilter === 'unpaid' 
            ? invoices.filter(i => i.status === 'unpaid')
            : invoices.filter(i => i.status === 'paid');
        
        if (invoiceSearch) {
            filteredInvoices = filteredInvoices.filter(inv => {
                const client = clients.find(c => c.id === inv.client_id);
                const searchLower = invoiceSearch.toLowerCase();
                return (
                    inv.title.toLowerCase().includes(searchLower) ||
                    (inv.invoice_number || '').toLowerCase().includes(searchLower) ||
                    (client?.name || '').toLowerCase().includes(searchLower) ||
                    (inv.total?.toString() || '').includes(searchLower)
                );
            });
        }
        
        filteredInvoices.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
        });
        
        content = filteredInvoices.length === 0 
            ? `<div class="text-center py-12 text-gray-500 dark:text-gray-400">No ${invoiceFilter} invoices found</div>` 
            : filteredInvoices.map(inv => { 
                const client = clients.find(c => c.id === inv.client_id);
                let borderColor = '';
                let statusBadge = '';
                
                if (inv.status === 'paid') {
                    borderColor = 'border-l-4 border-green-500';
                    statusBadge = '<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1 inline-block">✓ PAID</span>';
                } else if (inv.due_date) {
                    const dueDate = new Date(inv.due_date);
                    dueDate.setHours(0,0,0,0);
                    const diffTime = dueDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays < 0) {
                        borderColor = 'border-l-4 border-red-500';
                        statusBadge = `<span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mt-1 inline-block">⚠ OVERDUE (${Math.abs(diffDays)} days)</span>`;
                    } else if (diffDays <= 7) {
                        borderColor = 'border-l-4 border-yellow-500';
                        statusBadge = `<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mt-1 inline-block">⏰ DUE IN ${diffDays} DAYS</span>`;
                    }
                }
                
                const paymentLinkButton = (inv.status === 'unpaid' && stripeSettings?.publishable_key) 
                    ? `<button onclick="copyPaymentLink('${inv.id}')" class="px-3 py-1 bg-purple-600 text-white rounded text-sm">💳 Get Payment Link</button>` 
                    : '';
                
                const isSelected = selectedInvoices.includes(inv.id);
                const linkedQuote = inv.quote_id ? quotes.find(q => q.id === inv.quote_id) : null;
                const jobAddress = linkedQuote?.job_address || client?.address || '';
                
                return `<div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow ${borderColor} ${isSelected ? 'ring-2 ring-blue-400' : ''}">
                    <div class="flex gap-3">
                        <div class="flex items-start pt-1">
                            <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelection('invoices', '${inv.id}')" class="w-5 h-5 text-blue-600 rounded">
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between mb-3">
                                <div>
                                    <h3 class="text-lg font-semibold dark:text-white dark:text-white">${inv.title}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-300">${client?.name || 'Unknown'}${jobAddress ? ` • 📍 ${jobAddress}` : ''}</p>
                                    <p class="text-xs">${inv.invoice_number}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Issued: ${inv.issue_date}</p>
                                    ${inv.due_date ? `<p class="text-xs text-gray-500 dark:text-gray-400">Due: ${inv.due_date}</p>` : ''}
                                    ${inv.status === 'paid' && inv.paid_date ? `<p class="text-xs text-green-600 font-medium dark:text-gray-200">✓ Paid: ${new Date(inv.paid_date).toLocaleDateString()}</p>` : ''}
                                    ${statusBadge}
                                </div>
                                <p class="text-2xl font-bold text-teal-500">$${inv.total?.toFixed(2)}</p>
                            </div>
                            <div class="flex gap-2 flex-wrap">
                                <button onclick='openModal("invoice", ${JSON.stringify(inv).replace(/"/g, "&quot;")})' class="px-3 py-1 bg-blue-600 text-white rounded text-sm">Edit</button>
                                ${inv.status === 'unpaid' ? `<button onclick="quickMarkAsPaid('${inv.id}')" class="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium dark:text-gray-200">💰 Mark Paid</button>` : ''}
                                ${inv.status === 'paid' ? `<button onclick="quickMarkAsUnpaid('${inv.id}')" class="px-3 py-1 bg-gray-600 text-white rounded text-sm">Mark Unpaid</button>` : ''}
                                ${paymentLinkButton}
                                <button onclick="generatePDF('invoice', ${JSON.stringify(inv).replace(/"/g, '&quot;')})" class="px-3 py-1 bg-blue-600 text-white rounded text-sm">Download PDF</button>
                                <button onclick="sendInvoiceEmail(${JSON.stringify(inv).replace(/"/g, '&quot;')})" class="px-3 py-1 bg-teal-600 text-white rounded text-sm">📧 Email</button>
                                ${client?.phone && smsSettings?.enabled ? `<button onclick="sendInvoiceSMS(${JSON.stringify(inv).replace(/"/g, '&quot;')})" class="px-3 py-1 bg-green-600 text-white rounded text-sm">📱 SMS</button>` : ''}
                                <button onclick="deleteInvoice('${inv.id}')" class="px-3 py-1 text-red-600 border rounded text-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>`; 
            }).join('');
    }
    
    const unpaidTotal = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + parseFloat(i.total || 0), 0);
    const paidTotal = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + parseFloat(i.total || 0), 0);
    
    const filterTabs = `<div class="flex flex-wrap gap-2 mb-4"><button onclick="invoiceFilter='unpaid'; renderApp();" class="px-3 sm:px-4 py-2 rounded text-sm ${invoiceFilter === 'unpaid' ? 'bg-black text-white border-teal-400' : 'bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600'} border">Unpaid (${invoices.filter(i => i.status === 'unpaid').length})</button><button onclick="invoiceFilter='paid'; renderApp();" class="px-3 sm:px-4 py-2 rounded text-sm ${invoiceFilter === 'paid' ? 'bg-black text-white border-teal-400' : 'bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600'} border">Paid (${invoices.filter(i => i.status === 'paid').length})</button><button onclick="invoiceFilter='monthly'; renderApp();" class="px-3 sm:px-4 py-2 rounded text-sm ${invoiceFilter === 'monthly' ? 'bg-black text-white border-teal-400' : 'bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600'} border">Monthly</button></div>`;
    
    const searchBar = invoiceFilter !== 'monthly' ? `<input type="text" placeholder="🔍 Search invoices..." value="${invoiceSearch}" oninput="debouncedSearch('invoice', this.value, false);" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-4">` : '';
    
    const bulkActions = selectedInvoices.length > 0 && invoiceFilter !== 'monthly' ? `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <span class="text-sm font-medium text-blue-900">${selectedInvoices.length} invoice${selectedInvoices.length > 1 ? 's' : ''} selected</span>
            <button onclick="bulkDelete('invoices')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium dark:text-gray-200">🗑️ Delete Selected</button>
        </div>
    ` : '';
    
    const selectAllCheckbox = invoiceFilter !== 'monthly' ? `
        <div class="flex items-center gap-2 mb-4">
            <input type="checkbox" ${selectedInvoices.length === invoices.length && invoices.length > 0 ? 'checked' : ''} onchange="toggleSelectAll('invoices')" class="w-5 h-5 text-blue-600 rounded">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Select All</label>
        </div>
    ` : '';
    
    return `<div><div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6"><h2 class="text-2xl font-bold dark:text-teal-400">Invoices</h2><div class="flex flex-wrap items-center gap-3"><button onclick="exportToCSV('invoices')" class="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 text-sm whitespace-nowrap">Export CSV</button><div class="text-sm flex gap-4"><div>Outstanding: <span class="font-bold text-red-600">$${unpaidTotal.toFixed(2)}</span></div><div>Paid: <span class="font-bold text-green-600">$${paidTotal.toFixed(2)}</span></div></div></div></div>${filterTabs}${searchBar}${bulkActions}${selectAllCheckbox}<div class="grid gap-4">${content}</div></div>`;
}

console.log('✅ Invoices module loaded');
