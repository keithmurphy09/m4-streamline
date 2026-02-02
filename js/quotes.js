// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Quotes Module
// ═══════════════════════════════════════════════════════════════════

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
                    <div class="mt-3 mb-3 p-3 rounded-lg ${profit >= 0 ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}">
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
        
        return `<div class="bg-white p-4 rounded-lg shadow ${isAccepted ? 'border-l-4 border-green-500' : ''} ${isConverted ? 'border-l-4 border-gray-400' : ''} ${isNewQuote ? 'ring-2 ring-green-400' : ''} ${isSelected ? 'ring-2 ring-blue-400' : ''}">
            <div class="flex gap-3">
                <div class="flex items-start pt-1">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelection('quotes', '${q.id}')" class="w-5 h-5 text-blue-600 rounded">
                </div>
                <div class="flex-1">
                    <div class="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3">
                        <div><h3 class="text-lg font-semibold dark:text-white dark:text-white">${q.title}</h3><p class="text-sm">${client?.name || 'Unknown'}${jobAddress ? ` • 📍 ${jobAddress}` : ''}</p>${isAccepted ? '<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1 inline-block">✓ ACCEPTED</span>' : ''}${isConverted ? '<span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded mt-1 inline-block ml-2">✓ CONVERTED</span>' : ''}</div><p class="text-2xl font-bold text-teal-500">$${q.total?.toFixed(2)}</p>
                    </div>
                    ${q.notes ? `<p class="text-sm text-gray-600 dark:text-gray-300 italic mb-3">${q.notes}</p>` : ''}
                    ${isConverted ? '<p class="text-xs text-gray-500 dark:text-gray-400 italic mb-3">This quote has been converted to an invoice</p>' : ''}
                    ${profitDisplay}
                    <div class="flex gap-2 flex-wrap">${isAccepted || isConverted ? `<button onclick='openJobFromQuote(${JSON.stringify(q).replace(/"/g, "&quot;")})' class="px-3 py-1 bg-teal-600 text-white rounded text-sm whitespace-nowrap">📅 Schedule Job</button>` : ''}${!isAccepted && !isConverted ? `<button onclick='openModal("quote", ${JSON.stringify(q).replace(/"/g, "&quot;")})' class="px-3 py-1 bg-blue-600 text-white rounded text-sm">Edit</button>` : ''}${!isConverted ? `<button onclick='convertToInvoice(${JSON.stringify(q).replace(/"/g, '&quot;')})' class="px-3 py-1 bg-green-600 text-white rounded text-sm whitespace-nowrap">Convert to Invoice</button>` : ''}<button onclick='generatePDF("quote", ${JSON.stringify(q).replace(/"/g, '&quot;')})' class="px-3 py-1 bg-blue-600 text-white rounded text-sm whitespace-nowrap">Download PDF</button><button onclick='sendQuoteEmail(${JSON.stringify(q).replace(/"/g, '&quot;')})' class="px-3 py-1 bg-purple-600 text-white rounded text-sm whitespace-nowrap">📧 Email</button>${client?.phone && smsSettings?.enabled ? `<button onclick='sendQuoteSMS(${JSON.stringify(q).replace(/"/g, '&quot;')})' class="px-3 py-1 bg-green-600 text-white rounded text-sm whitespace-nowrap">📱 SMS</button>` : ''}<label class="cursor-pointer px-3 py-1 bg-orange-600 text-white rounded text-sm whitespace-nowrap"><input type="file" accept="image/*,.pdf,.doc,.docx,.txt" onchange="uploadQuoteFile(this, '${q.id}')" class="hidden" />📎 Upload File</label><button onclick="viewQuoteFiles('${q.id}')" class="px-3 py-1 bg-gray-600 text-white rounded text-sm whitespace-nowrap">📁 View Files</button><button onclick="deleteQuote('${q.id}')" class="px-3 py-1 text-red-600 border rounded text-sm">Delete</button></div>
                </div>
            </div>
        </div>`; 
    }).join('');
    
    const pagination = getPaginationHTML('quotes', totalQuotes, currentPage.quotes);
    
    const bulkActions = selectedQuotes.length > 0 ? `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <span class="text-sm font-medium text-blue-900">${selectedQuotes.length} quote${selectedQuotes.length > 1 ? 's' : ''} selected</span>
            <button onclick="bulkDelete('quotes')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium dark:text-gray-200">
                🗑️ Delete Selected
            </button>
        </div>
    ` : '';
    
    const selectAllCheckbox = paginatedQuotes.length > 0 ? `
        <div class="flex items-center gap-2 mb-4">
            <input type="checkbox" 
                   ${selectedQuotes.length === quotes.length && quotes.length > 0 ? 'checked' : ''} 
                   onchange="toggleSelectAll('quotes')" 
                   class="w-5 h-5 text-blue-600 rounded">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Select All</label>
        </div>
    ` : '';
    
    return `<div>${successNotification}<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6"><h2 class="text-2xl font-bold dark:text-teal-400">Quotes</h2><div class="flex flex-wrap gap-2"><button onclick="exportToCSV('quotes')" class="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 text-sm whitespace-nowrap">Export CSV</button><button onclick="openModal('quote')" class="bg-black text-white px-3 sm:px-4 py-2 rounded-lg border border-teal-400 text-sm whitespace-nowrap">+ Create Quote</button></div></div><input type="text" placeholder="🔍 Search quotes..." value="${quoteSearch}" oninput="debouncedSearch('quote', this.value);" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-4">${bulkActions}${selectAllCheckbox}<div class="grid gap-4">${quotesList}</div>${pagination}</div>`;
}

console.log('✅ Quotes module loaded');
