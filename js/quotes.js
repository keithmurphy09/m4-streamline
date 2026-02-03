// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Quotes Module
// ═══════════════════════════════════════════════════════════════════

// Helper functions
function formatCurrency(amount) {
    return '$' + parseFloat(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function renderQuotes() {
    const successNotification = lastCreatedQuote ? `<div class="bg-green-50 border-l-4 border-green-500 p-4 mb-4"><div class="flex justify-between items-center"><div><p class="text-sm text-green-700"><strong>✓ Quote Created!</strong> ${lastCreatedQuote.title} has been created successfully.</p></div></div></div>` : '';
    
    if (lastCreatedQuote) {
        setTimeout(() => {
            lastCreatedQuote = null;
            renderApp();
        }, 5000);
    }
    
    const filteredQuotes = quotes.filter(q => {
        if (!quoteSearch) return true;
        const client = clients.find(c => c.id === q.client_id);
        const searchLower = quoteSearch.toLowerCase();
        return (
            q.title.toLowerCase().includes(searchLower) ||
            (client?.name || '').toLowerCase().includes(searchLower) ||
            (q.total?.toString() || '').includes(searchLower) ||
            (q.notes || '').toLowerCase().includes(searchLower)
        );
    });
    
    filteredQuotes.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
    });
    
    const totalQuotes = filteredQuotes.length;
    const startIndex = (currentPage.quotes - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);
    
    const quotesList = paginatedQuotes.length === 0 ? '<div class="text-center py-12 text-gray-500 dark:text-gray-400">No quotes found</div>' : paginatedQuotes.map(q => { 
        const client = clients.find(c => c.id === q.client_id);
        const jobAddress = q.job_address || client?.address || '';
        const isAccepted = q.accepted || q.status === 'accepted';
        const isConverted = q.status === 'converted';
        const isNewQuote = lastCreatedQuote && lastCreatedQuote.id === q.id;
        const isSelected = selectedQuotes.includes(q.id);
        
        let profitDisplay = '';
        if (isConverted) {
            const relatedJob = jobs.find(j => j.title === q.title && j.client_id === q.client_id);
            
            let jobExpenses = relatedJob 
                ? expenses.filter(e => e.job_id === relatedJob.id).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) 
                : 0;
            
            const quoteExpenses = expenses.filter(e => {
                if (!e.description) return false;
                return e.description.includes(q.title) || 
                       (q.quote_number && e.description.includes(q.quote_number));
            }).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
            
            jobExpenses = jobExpenses + quoteExpenses;
            
            const jobInvoice = invoices.find(i => i.quote_id === q.id);
            const jobRevenue = jobInvoice && jobInvoice.status === 'paid' ? parseFloat(jobInvoice.total || 0) : 0;
            const quotedAmount = parseFloat(q.total || 0);
            const profit = jobRevenue - jobExpenses;
            const profitMargin = jobRevenue > 0 ? ((profit / jobRevenue) * 100).toFixed(1) : 0;
            
            if (jobRevenue > 0 || jobExpenses > 0) {
                profitDisplay = `
                    <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="text-xs px-3 py-1 mb-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                        ${profit >= 0 ? '💰' : '⚠️'} ${profit >= 0 ? 'Profit' : 'Loss'}: $${Math.abs(profit).toFixed(2)} ${jobRevenue > 0 ? `(${profitMargin}%)` : ''} • Click to ${profit >= 0 ? 'show' : 'view'} details
                    </button>
                    <div class="hidden mt-3 mb-3 p-3 rounded-lg ${profit >= 0 ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}">
                        <div class="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">💰 Job Performance</div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div><span class="text-gray-600 dark:text-gray-300">Quoted:</span> <span class="font-semibold dark:text-white">$${quotedAmount.toFixed(2)}</span></div>
                            ${jobRevenue > 0 ? `<div><span class="text-gray-600 dark:text-gray-300">Revenue:</span> <span class="font-semibold text-green-600">$${jobRevenue.toFixed(2)}</span></div>` : '<div><span class="text-gray-600 dark:text-gray-300">Revenue:</span> <span class="text-gray-500 dark:text-gray-400">Unpaid</span></div>'}
                            ${jobExpenses > 0 ? `<div><span class="text-gray-600 dark:text-gray-300">Expenses:</span> <span class="font-semibold text-red-600">$${jobExpenses.toFixed(2)}</span></div>` : ''}
                        </div>
                        <div class="mt-2 flex items-center justify-between">
                            <div class="text-sm font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-700'}">
                                ${profit >= 0 ? '💰' : '⚠️'} ${profit >= 0 ? 'Profit' : 'Loss'}: $${Math.abs(profit).toFixed(2)} ${jobRevenue > 0 ? `(${profitMargin}%)` : ''}
                            </div>
                            ${jobExpenses > 0 && relatedJob ? `<button onclick="viewJobExpenses('${relatedJob.id}', '${q.title.replace(/'/g, "\\'")}')" class="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">📊 View Expenses</button>` : ''}
                        </div>
                    </div>
                `;
            }
        }
        
        return `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 ${isSelected ? 'ring-2 ring-teal-400' : ''} overflow-hidden">
            <div class="p-6">
                <div class="flex gap-4">
                    <div class="flex items-start pt-1">
                        <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelection('quotes', '${q.id}')" class="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500">
                    </div>
                    <div class="flex-1">
                        <!-- Header -->
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    ${isAccepted ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">ACCEPTED</span>' : ''}
                                    ${isConverted ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">CONVERTED</span>' : ''}
                                    <span class="text-xs text-gray-400">${q.quote_number || q.title}</span>
                                </div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">${q.title}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${client?.name || 'Unknown'}</p>
                                ${jobAddress ? `<p class="text-xs text-gray-400 mt-1">${jobAddress}</p>` : ''}
                            </div>
                            <div class="text-right">
                                <div class="text-3xl font-bold text-gray-900 dark:text-white">${formatCurrency(q.total)}</div>
                                <div class="text-xs text-gray-400 mt-1">Created ${formatDate(q.created_at)}</div>
                            </div>
                        </div>
                        
                        <!-- Notes -->
                        ${q.notes ? `<div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                            <p class="text-sm text-gray-600 dark:text-gray-300">${q.notes}</p>
                        </div>` : ''}
                        
                        <!-- Profit Display -->
                        ${profitDisplay}
                        
                        <!-- Actions -->
                        <div class="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                            ${isAccepted || isConverted ? `<button onclick='openJobFromQuote(${JSON.stringify(q).replace(/"/g, "&quot;")})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">Schedule Job</button>` : ''}
                            ${!isAccepted && !isConverted ? `<button onclick='openModal("quote", ${JSON.stringify(q).replace(/"/g, "&quot;")})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">Edit</button>` : ''}
                            ${!isConverted ? `<button onclick='convertToInvoice(${JSON.stringify(q).replace(/"/g, '&quot;')})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors">Convert to Invoice</button>` : ''}
                            <button onclick='generatePDF("quote", ${JSON.stringify(q).replace(/"/g, '&quot;')})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">Download PDF</button>
                            <button onclick='sendQuoteEmail(${JSON.stringify(q).replace(/"/g, '&quot;')})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">Email</button>
                            ${client?.phone && smsSettings?.enabled ? `<button onclick='sendQuoteSMS(${JSON.stringify(q).replace(/"/g, '&quot;')})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">SMS</button>` : ''}
                            <label class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors cursor-pointer">
                                <input type="file" accept="image/*,.pdf,.doc,.docx,.txt" onchange="uploadQuoteFile(this, '${q.id}')" class="hidden" />
                                Upload File
                            </label>
                            <button onclick="viewQuoteFiles('${q.id}')" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">View Files</button>
                            <button onclick="deleteQuote('${q.id}')" class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors ml-auto">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`; 
    }).join('');
    
    const pagination = getPaginationHTML('quotes', totalQuotes, currentPage.quotes);
    
    const bulkActions = selectedQuotes.length > 0 ? `
        <div class="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
                <span class="font-semibold text-teal-700 dark:text-teal-400">${selectedQuotes.length}</span> quote${selectedQuotes.length > 1 ? 's' : ''} selected
            </span>
            <button onclick="bulkDelete('quotes')" class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors">
                Delete Selected
            </button>
        </div>
    ` : '';
    
    const selectAllCheckbox = paginatedQuotes.length > 0 ? `
        <div class="flex items-center gap-2 mb-6">
            <input type="checkbox" 
                   ${selectedQuotes.length === quotes.length && quotes.length > 0 ? 'checked' : ''} 
                   onchange="toggleSelectAll('quotes')" 
                   class="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Select All Quotes</label>
        </div>
    ` : '';
    
    return `<div>
        ${successNotification}
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
            <div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Quotes</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all your project quotes</p>
            </div>
            <div class="flex flex-wrap gap-2">
                <button onclick="exportToCSV('quotes')" class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">
                    Export CSV
                </button>
                <button onclick="openModal('quote')" class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-900 border border-teal-400 rounded-lg transition-colors shadow-sm">
                    Create Quote
                </button>
            </div>
        </div>
        
        <!-- Search -->
        <div class="mb-6">
            <input type="text" 
                   placeholder="Search quotes by title, client, or amount..." 
                   value="${quoteSearch}" 
                   oninput="debouncedSearch('quote', this.value);" 
                   class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
        </div>
        
        ${bulkActions}
        ${selectAllCheckbox}
        
        <!-- Quotes List -->
        <div class="space-y-4">
            ${quotesList}
        </div>
        
        ${pagination}
    </div>`;
}

console.log('✅ Quotes module loaded');
