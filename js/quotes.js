// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Quotes Module (Professional Table View)
// ═══════════════════════════════════════════════════════════════════

// View state
let quoteViewMode = 'table'; // 'table' or 'detail'
let selectedQuoteForDetail = null;

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

// Get deposit icon HTML for a quote
function getDepositIconHTML(quote) {
    if (!quote.deposit_percentage || quote.deposit_percentage === 0) {
        return '<span class="text-gray-300 dark:text-gray-600">—</span>'; // No deposit required
    }
    
    const depositAmount = quote.total * (quote.deposit_percentage / 100);
    
    // Find deposit invoice for this quote
    const depositInvoice = invoices.find(inv => 
        inv.quote_id === quote.id && 
        inv.title && 
        inv.title.includes('Deposit')
    );
    
    if (depositInvoice) {
        const isPaid = depositInvoice.status === 'paid';
        
        if (isPaid) {
            return `<span class="text-green-600 dark:text-green-400 text-lg" title="Deposit paid: ${formatCurrency(depositAmount)}">✓</span>`;
        } else {
            return `<span class="text-yellow-600 dark:text-yellow-400 text-lg" title="Awaiting deposit: ${formatCurrency(depositAmount)}">⏳</span>`;
        }
    } else {
        // Deposit required but no invoice created yet
        return `<span class="text-gray-400 dark:text-gray-500 text-xs" title="Deposit required: ${formatCurrency(depositAmount)} (${quote.deposit_percentage}%)">●</span>`;
    }
}

function openQuoteDetail(quote) {
    selectedQuoteForDetail = quote;
    quoteViewMode = 'detail';
    renderApp();
}

function closeQuoteDetail() {
    selectedQuoteForDetail = null;
    quoteViewMode = 'table';
    renderApp();
}

function renderQuotes() {
    if (quoteViewMode === 'detail' && selectedQuoteForDetail) {
        return renderQuoteDetail();
    }
    return renderQuotesTable();
}

function renderQuotesTable() {
    const filteredQuotes = quotes.filter(q => {
        const client = clients.find(c => c.id === q.client_id);
        const searchTerm = quoteSearch.toLowerCase();
        return q.title.toLowerCase().includes(searchTerm) ||
               q.quote_number?.toLowerCase().includes(searchTerm) ||
               client?.name.toLowerCase().includes(searchTerm) ||
               q.total?.toString().includes(searchTerm) ||
               q.job_address?.toLowerCase().includes(searchTerm);
    });
    
    // Apply smart filter if active
    const smartFiltered = typeof getSmartFilteredData === 'function' 
        ? getSmartFilteredData(filteredQuotes, 'quotes')
        : filteredQuotes;
    
    const sortedQuotes = [...smartFiltered].sort((a, b) => {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
    
    const totalQuotes = sortedQuotes.length;
    const startIndex = (currentPage.quotes - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedQuotes = sortedQuotes.slice(startIndex, endIndex);
    
    const quoteRows = paginatedQuotes.length === 0 
        ? '<tr><td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No quotes found</td></tr>'
        : paginatedQuotes.map(q => {
            const client = clients.find(c => c.id === q.client_id);
            const isSelected = selectedQuotes.includes(q.id);
            const isAccepted = q.accepted || q.status === 'accepted';
            const isConverted = q.status === 'converted';
            
            // Status badge - prioritize quote_status
            let statusBadge = '';
            const quoteStatus = q.quote_status || 'pending';
            
            if (quoteStatus === 'won') {
                statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">✅ WON</span>';
            } else if (quoteStatus === 'lost') {
                statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">❌ LOST</span>';
            } else if (isConverted) {
                statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">CONVERTED</span>';
            } else if (isAccepted) {
                statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">ACCEPTED</span>';
            } else {
                statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">⏳ PENDING</span>';
            }
            
            return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${isSelected ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}" onclick="openQuoteDetail(${JSON.stringify(q).replace(/"/g, '&quot;')})">
                <td class="px-6 py-4" onclick="event.stopPropagation()">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelection('quotes', '${q.id}')" class="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500">
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${q.quote_number || 'QT-' + q.id.slice(0, 3)}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${client?.name || 'Unknown'}</div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">${client?.email || ''}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 dark:text-white">${q.title}</div>
                    ${q.job_address ? `<div class="text-xs text-gray-400 dark:text-gray-500">${q.job_address}</div>` : ''}
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-600 dark:text-gray-400">${formatDate(q.created_at)}</div>
                </td>
                <td class="px-6 py-4">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">${formatCurrency(q.total)}</div>
                </td>
                <td class="px-6 py-4 text-center">
                    ${getDepositIconHTML(q)}
                </td>
                <td class="px-6 py-4 text-right" onclick="event.stopPropagation()">
                    <div class="relative inline-block">
                        <button onclick="toggleQuoteActions('${q.id}')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                            </svg>
                        </button>
                        <div id="actions-${q.id}" class="hidden fixed mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                            <div class="py-1">
                                <button onclick="generatePDF('quote', ${JSON.stringify(q).replace(/"/g, '&quot;')}); toggleQuoteActions('${q.id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Download PDF</button>
                                <button onclick="sendQuoteEmail(${JSON.stringify(q).replace(/"/g, '&quot;')}); toggleQuoteActions('${q.id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Email Quote</button>
                                ${client?.phone && smsSettings?.enabled ? `<button onclick="sendQuoteSMS(${JSON.stringify(q).replace(/"/g, '&quot;')}); toggleQuoteActions('${q.id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">SMS Quote</button>` : ''}
                                <button onclick="openNoteModal('quote', '${q.id}', '${q.client_id}'); toggleQuoteActions('${q.id}')" class="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700">Add Note</button>
                                ${!isConverted ? `<button onclick="convertToInvoice(${JSON.stringify(q).replace(/"/g, '&quot;')}); toggleQuoteActions('${q.id}')" class="block w-full text-left px-4 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-700">Convert to Invoice</button>` : ''}
                                <button onclick="deleteQuote('${q.id}'); toggleQuoteActions('${q.id}')" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>`;
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
    
    return `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-visible">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100 dark:border-gray-700">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Quotes</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all your project quotes</p>
                </div>
                <button onclick="openModal('quote')" class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/30 border border-gray-200 dark:border-gray-600 hover:border-green-500 rounded-lg transition-colors shadow-sm">
                    Create Quote
                </button>
            </div>
            
            <!-- ⭐ SMART FILTER BAR ⭐ -->
            ${typeof renderSmartFilterBar === 'function' ? renderSmartFilterBar('quotes') : ''}
            
            <!-- Search and Filter -->
            <div class="flex gap-3">
                <input type="text" 
                       id="quote-search-input"
                       placeholder="Search quotes by number, client, or description..." 
                       value="${quoteSearch}" 
                       oninput="quoteSearch = this.value; saveSearchCursor('quote-search-input'); clearTimeout(window.quoteSearchTimer); window.quoteSearchTimer = setTimeout(() => { currentPage.quotes = 1; renderApp(); setTimeout(() => restoreSearchCursor('quote-search-input'), 0); }, 300);" 
                       class="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
                <button onclick="exportToCSV('quotes')" class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded-lg transition-colors">
                    Export CSV
                </button>
            </div>
        </div>
        
        ${bulkActions}
        
        <!-- Desktop Table View -->
        <div class="quotes-desktop-table">
            <div class="overflow-x-auto overflow-y-visible">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <th class="px-6 py-3 text-left w-12">
                                <input type="checkbox" 
                                       ${selectedQuotes.length === quotes.length && quotes.length > 0 ? 'checked' : ''} 
                                       onchange="toggleSelectAll('quotes')" 
                                       class="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500">
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Quote #</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Client</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                            <th class="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Deposit</th>
                            <th class="px-6 py-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
                        ${quoteRows}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Mobile Cards View -->
        <div class="quotes-mobile-cards" style="display: none;">
            ${paginatedQuotes.length === 0 
                ? '<div class="text-center py-12 text-gray-500 dark:text-gray-400">No quotes found</div>'
                : paginatedQuotes.map(q => {
                    const client = clients.find(c => c.id === q.client_id);
                    const isAccepted = q.accepted || q.status === 'accepted';
                    const isConverted = q.status === 'converted';
                    
                    // Status badge - prioritize quote_status
                    let statusBadge = '';
                    const quoteStatus = q.quote_status || 'pending';
                    
                    if (quoteStatus === 'won') {
                        statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">✅ WON</span>';
                    } else if (quoteStatus === 'lost') {
                        statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">❌ LOST</span>';
                    } else if (isConverted) {
                        statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">CONVERTED</span>';
                    } else if (isAccepted) {
                        statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">ACCEPTED</span>';
                    } else {
                        statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">⏳ PENDING</span>';
                    }
                    
                    const depositInfo = getDepositIconHTML(q);
                    
                    return `
                        <div class="quote-card" onclick="openQuoteDetail(${JSON.stringify(q).replace(/"/g, '&quot;')})">
                            <div class="quote-card-header">
                                <div>
                                    <div class="quote-card-number">${q.quote_number || 'QT-' + q.id.slice(0, 3)}</div>
                                    <div class="quote-card-date">${formatDate(q.created_at)}</div>
                                </div>
                                <div class="quote-card-amount">${formatCurrency(q.total)}</div>
                            </div>
                            
                            <div class="quote-card-client">${client?.name || 'Unknown'}</div>
                            ${q.job_address ? `<div class="quote-card-address">${q.job_address}</div>` : ''}
                            <div class="quote-card-title">${q.title}</div>
                            
                            <div class="quote-card-status-row">
                                ${statusBadge}
                                ${depositInfo ? `<span class="quote-card-deposit">${depositInfo}</span>` : ''}
                            </div>
                            
                            <div class="quote-card-actions" onclick="event.stopPropagation()">
                                <button onclick="generatePDF('quote', ${JSON.stringify(q).replace(/"/g, '&quot;')})" class="quote-card-action-btn">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </svg>
                                    PDF
                                </button>
                                <button onclick="sendQuoteEmail(${JSON.stringify(q).replace(/"/g, '&quot;')})" class="quote-card-action-btn">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                    Email
                                </button>
                                ${client?.phone && smsSettings?.enabled ? `
                                <button onclick="sendQuoteSMS(${JSON.stringify(q).replace(/"/g, '&quot;')})" class="quote-card-action-btn">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                                    </svg>
                                    SMS
                                </button>
                                ` : '<div></div>'}
                            </div>
                        </div>
                    `;
                }).join('')
            }
        </div>
        
        <!-- Pagination -->
        ${pagination ? `<div class="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            ${pagination}
        </div>` : ''}
    </div>`;
}

function toggleQuoteActions(quoteId) {
    const menu = document.getElementById(`actions-${quoteId}`);
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
    document.querySelectorAll('[id^="actions-"]').forEach(m => {
        if (m.id !== `actions-${quoteId}`) {
            m.classList.add('hidden');
        }
    });
}

function renderQuoteDetail() {
    const q = selectedQuoteForDetail;
    if (!q) {
        closeQuoteDetail();
        return '';
    }
    
    const client = clients.find(c => c.id === q.client_id);
    const isAccepted = q.accepted || q.status === 'accepted';
    const isConverted = q.status === 'converted';
    
    // Status badge - prioritize quote_status over old accepted/converted logic
    let statusBadge = '';
    const quoteStatus = q.quote_status || 'pending';
    
    if (quoteStatus === 'won') {
        statusBadge = '<span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">✅ WON</span>';
    } else if (quoteStatus === 'lost') {
        statusBadge = '<span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">❌ LOST</span>';
    } else if (isConverted) {
        statusBadge = '<span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">CONVERTED</span>';
    } else if (isAccepted) {
        statusBadge = '<span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">ACCEPTED</span>';
    } else {
        statusBadge = '<span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">⏳ PENDING</span>';
    }
    
    // Calculate profit/loss - find related job and expenses
    // Debug: Let's find all possible connections
    let relatedJob = null;
    let totalExpenses = 0;
    let linkedExpensesList = [];
    let debugInfo = {
        quoteId: q.id,
        quoteTitle: q.title,
        quoteNumber: q.quote_number,
        quoteClientId: q.client_id,
        matchingJobs: [],
        allExpenses: expenses.length,
        expensesWithJobId: expenses.filter(e => e.job_id).length
    };
    
    console.log('📊 QUOTE INFO:', {
        id: q.id,
        title: q.title,
        quote_number: q.quote_number,
        client_id: q.client_id
    });
    
    // Strategy 1: Find job by exact title and client match
    const jobsByExactMatch = jobs.filter(j => j.title === q.title && j.client_id === q.client_id);
    debugInfo.matchingJobs = jobsByExactMatch.map(j => ({ id: j.id, title: j.title }));
    relatedJob = jobsByExactMatch[0];
    
    // Strategy 2: If no exact match, try case-insensitive title match
    if (!relatedJob) {
        relatedJob = jobs.find(j => 
            j.title?.toLowerCase() === q.title?.toLowerCase() && 
            j.client_id === q.client_id
        );
        if (relatedJob) {
            debugInfo.matchedBy = 'case-insensitive';
        }
    } else {
        debugInfo.matchedBy = 'exact match';
    }
    
    // Strategy 3: Check if quote has been converted and has invoice with job
    if (!relatedJob && q.status === 'converted') {
        const relatedInvoice = invoices.find(inv => 
            inv.quote_id === q.id || 
            (inv.title === q.title && inv.client_id === q.client_id)
        );
        if (relatedInvoice) {
            relatedJob = jobs.find(j => 
                j.invoice_id === relatedInvoice.id ||
                (j.title === relatedInvoice.title && j.client_id === relatedInvoice.client_id)
            );
            if (relatedJob) {
                debugInfo.matchedBy = 'via invoice';
            }
        }
    }
    
    // Get expenses from related job - CHECK ALL POSSIBLE FIELD NAMES
    if (relatedJob) {
        debugInfo.relatedJobId = relatedJob.id;
        debugInfo.relatedJobTitle = relatedJob.title;
        
        // Method 1: Check expenses with job_id field
        const jobExpenses = expenses.filter(e => 
            e.job_id === relatedJob.id || 
            e.jobId === relatedJob.id ||  // Alternative field name
            e.linked_job_id === relatedJob.id  // Another possible field
        );
        
        // Method 2: FALLBACK - Check description text for quote/job references
        const quoteNumber = q.quote_number || q.title;
        const textMatchedExpenses = expenses.filter(e => {
            const description = (e.description || '').toLowerCase();
            const notes = (e.notes || '').toLowerCase();
            const searchText = description + ' ' + notes;
            
            // Check if description mentions:
            // 1. The quote number (e.g., "QT-007" or "ORD-411920-32")
            // 2. The job title
            // 3. The quote title
            const quoteNumLower = quoteNumber.toLowerCase();
            const quoteTitleLower = q.title.toLowerCase();
            const jobTitleLower = relatedJob.title.toLowerCase();
            
            return searchText.includes(quoteNumLower) ||
                   searchText.includes(quoteTitleLower) ||
                   searchText.includes(jobTitleLower);
        });
        
        // Combine both methods and remove duplicates
        const allFoundExpenses = [...jobExpenses, ...textMatchedExpenses];
        const uniqueExpenses = Array.from(new Set(allFoundExpenses.map(e => e.id)))
            .map(id => allFoundExpenses.find(e => e.id === id));
        
        debugInfo.expensesFound = uniqueExpenses.length;
        debugInfo.foundByJobId = jobExpenses.length;
        debugInfo.foundByTextMatch = textMatchedExpenses.length;
        debugInfo.quoteNumber = quoteNumber;
        debugInfo.expenseDetails = uniqueExpenses.map(e => ({
            id: e.id,
            amount: e.amount,
            description: e.description,
            job_id: e.job_id,
            matchMethod: jobExpenses.includes(e) ? 'job_id' : 'text'
        }));
        
        linkedExpensesList.push(...uniqueExpenses);
        totalExpenses += uniqueExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    } else {
        debugInfo.noJobFound = true;
        debugInfo.quoteNumber = q.quote_number || q.title;
        
        // EMERGENCY FALLBACK: If no job found, try matching expenses by quote number directly
        const quoteNumber = q.quote_number || q.title;
        console.log('🔍 NO JOB FOUND - Searching expenses for quote:', quoteNumber);
        console.log('🔍 Total expenses to search:', expenses.length);
        
        const directQuoteMatch = expenses.filter(e => {
            const description = (e.description || '').toLowerCase();
            const notes = (e.notes || '').toLowerCase();
            const searchText = description + ' ' + notes;
            const quoteNumLower = quoteNumber.toLowerCase();
            
            const matches = searchText.includes(quoteNumLower);
            
            if (matches) {
                console.log('✅ MATCH FOUND:', {
                    amount: e.amount,
                    description: e.description?.substring(0, 80),
                    searchedFor: quoteNumLower,
                    foundIn: searchText.substring(0, 100)
                });
            }
            
            return matches;
        });
        
        console.log('🔍 Expenses found without job:', directQuoteMatch.length);
        
        if (directQuoteMatch.length > 0) {
            debugInfo.foundWithoutJob = directQuoteMatch.length;
            debugInfo.expenseDetails = directQuoteMatch.map(e => ({
                id: e.id,
                amount: e.amount,
                description: e.description,
                matchMethod: 'quote-number-fallback'
            }));
            
            linkedExpensesList.push(...directQuoteMatch);
            totalExpenses += directQuoteMatch.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        } else {
            console.log('❌ NO EXPENSES FOUND - Debugging first 3 expenses:');
            expenses.slice(0, 3).forEach(e => {
                console.log({
                    description: e.description,
                    lowercaseDesc: (e.description || '').toLowerCase(),
                    searchingFor: quoteNumber.toLowerCase()
                });
            });
        }
    }
    
    // Also check for expenses directly linked to quote
    const directQuoteExpenses = expenses.filter(e => 
        e.quote_id === q.id || 
        e.quoteId === q.id
    );
    if (directQuoteExpenses.length > 0) {
        debugInfo.directQuoteExpenses = directQuoteExpenses.length;
        linkedExpensesList.push(...directQuoteExpenses);
        totalExpenses += directQuoteExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    }
    
    // Remove duplicates (in case same expense is linked both ways)
    linkedExpensesList = Array.from(new Set(linkedExpensesList.map(e => e.id)))
        .map(id => linkedExpensesList.find(e => e.id === id));
    
    // Log debug info to console
    console.log('🔍 Quote Expense Linking Debug:', {
        ...debugInfo,
        matchingSummary: {
            byJobId: debugInfo.foundByJobId || 0,
            byTextMatch: debugInfo.foundByTextMatch || 0,
            total: debugInfo.expensesFound || 0
        }
    });
    
    const revenue = parseFloat(q.total || 0);
    const profit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;
    
    // Line items table
    const lineItemsTable = q.items && q.items.length > 0 ? `
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
                    ${q.items.map(item => `
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
                        <td class="py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">${formatCurrency(q.subtotal || q.total)}</td>
                    </tr>
                    ${q.gst ? `<tr>
                        <td colspan="3" class="py-2 text-right text-sm text-gray-600 dark:text-gray-400">GST (10%):</td>
                        <td class="py-2 text-right text-sm text-gray-600 dark:text-gray-400">${formatCurrency(q.gst)}</td>
                    </tr>` : ''}
                    ${q.deposit_amount ? `<tr>
                        <td colspan="3" class="py-2 text-right text-sm text-gray-600 dark:text-gray-400">Deposit Required:</td>
                        <td class="py-2 text-right text-sm text-gray-600 dark:text-gray-400">${formatCurrency(q.deposit_amount)}</td>
                    </tr>` : ''}
                    <tr class="border-t border-gray-200 dark:border-gray-600">
                        <td colspan="3" class="py-4 text-right text-lg font-bold text-gray-900 dark:text-white">Total:</td>
                        <td class="py-4 text-right text-lg font-bold text-gray-900 dark:text-white">${formatCurrency(q.total)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    ` : '';
    
    const profitLossSection = `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profit & Loss Analysis</h3>
            <div class="space-y-3">
                <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Quoted Amount:</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">${formatCurrency(revenue)}</span>
                </div>
                ${isConverted || relatedJob ? `
                <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Revenue (Paid):</span>
                    <span class="text-sm font-medium text-teal-600 dark:text-teal-400">${formatCurrency(revenue)}</span>
                </div>
                ` : ''}
                <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Total Expenses:</span>
                    <span class="text-sm font-medium text-red-600 dark:text-red-400">${formatCurrency(totalExpenses)}</span>
                </div>
                ${linkedExpensesList.length > 0 ? `
                <div class="mt-2 mb-2 pl-4">
                    <details class="text-xs text-gray-500 dark:text-gray-400">
                        <summary class="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Show ${linkedExpensesList.length} expense${linkedExpensesList.length > 1 ? 's' : ''}</summary>
                        <div class="mt-2 space-y-1 pl-2">
                            ${linkedExpensesList.map(e => `
                                <div class="flex justify-between py-1">
                                    <span>${e.description || e.category}</span>
                                    <span class="font-medium">${formatCurrency(e.amount)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </details>
                </div>
                ` : ''}
                <div class="flex justify-between py-3 ${profit >= 0 ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-red-50 dark:bg-red-900/20'} px-4 rounded-lg">
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">Net Profit:</span>
                    <div class="text-right">
                        <span class="text-lg font-bold ${profit >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-red-700 dark:text-red-400'}">${formatCurrency(profit)}</span>
                        <span class="text-xs ${profit >= 0 ? 'text-teal-600 dark:text-teal-500' : 'text-red-600 dark:text-red-500'} ml-2">(${profitMargin}% margin)</span>
                    </div>
                </div>
            </div>
            ${linkedExpensesList.length === 0 && relatedJob ? `
            <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                <p class="mb-2">✅ Job found but no expenses linked yet.</p>
                <p class="text-xs mb-2">Job: <strong>"${debugInfo.relatedJobTitle}"</strong></p>
                <p class="text-xs">Tip: When adding expenses, select this job to track costs.</p>
                <details class="mt-3 text-xs">
                    <summary class="cursor-pointer text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300">🔍 Show Debug Info</summary>
                    <div class="mt-2 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 font-mono space-y-1">
                        <div><strong>Quote:</strong> "${debugInfo.quoteTitle}"</div>
                        <div><strong>Related Job:</strong> "${debugInfo.relatedJobTitle}"</div>
                        <div><strong>Job ID:</strong> ${debugInfo.relatedJobId}</div>
                        <div class="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                            <strong>System Info:</strong>
                        </div>
                        <div>• Total Expenses: ${debugInfo.allExpenses}</div>
                        <div>• With job_id: ${debugInfo.expensesWithJobId}</div>
                        <div>• Found by job_id field: ${debugInfo.foundByJobId || 0}</div>
                        <div>• Found by text match: ${debugInfo.foundByTextMatch || 0}</div>
                        <div>• <strong>Total found: ${debugInfo.expensesFound || 0}</strong></div>
                        ${debugInfo.expenseDetails && debugInfo.expenseDetails.length > 0 ? `
                        <div class="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                            <strong>Expenses found:</strong>
                        </div>
                        ${debugInfo.expenseDetails.map(e => `
                        <div>• $${parseFloat(e.amount || 0).toFixed(2)} - ${e.description?.substring(0, 30)}... (via ${e.matchMethod})</div>
                        `).join('')}
                        ` : ''}
                        <div class="text-teal-600 dark:text-teal-400 mt-2">
                            ℹ️ Text matching searches expense descriptions for job/quote references.
                        </div>
                    </div>
                </details>
            </div>
            ` : linkedExpensesList.length === 0 && !relatedJob ? `
            <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
                <p class="font-medium text-yellow-800 dark:text-yellow-400 mb-2">⚠️ No job found for this quote</p>
                <p class="text-xs text-yellow-700 dark:text-yellow-500 mb-2">Schedule a job first to start tracking expenses and profit.</p>
                <details class="mt-3 text-xs">
                    <summary class="cursor-pointer text-yellow-800 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300">🔍 Show Debug Info</summary>
                    <div class="mt-2 p-3 bg-white dark:bg-gray-800 rounded border border-yellow-200 dark:border-yellow-800 font-mono space-y-1">
                        <div><strong>Quote Title:</strong> "${debugInfo.quoteTitle}"</div>
                        <div><strong>Client ID:</strong> ${debugInfo.quoteClientId}</div>
                        <div><strong>Jobs Found:</strong> ${debugInfo.matchingJobs.length}</div>
                        ${debugInfo.matchingJobs.length > 0 ? `
                        <div><strong>Matching Jobs:</strong> ${debugInfo.matchingJobs.map(j => j.title).join(', ')}</div>
                        ` : '<div class="text-red-600 dark:text-red-400">❌ No jobs with matching title & client</div>'}
                        <div class="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                            <strong>To link expenses:</strong>
                        </div>
                        <div>1. Click "Schedule Job" below</div>
                        <div>2. When adding expenses, select that job</div>
                        <div>3. Expenses will appear here automatically</div>
                    </div>
                </details>
            </div>
            ` : ''}
            ${totalExpenses > 0 || relatedJob ? `
            <button onclick="switchTab('expenses')" class="mt-4 w-full px-4 py-2 text-sm font-medium text-teal-700 dark:text-teal-400 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg transition-colors">
                ${linkedExpensesList.length > 0 ? 'View All Expenses' : 'Add Expenses'}
            </button>
            ` : ''}
        </div>
    `;
    
    const activityTimeline = `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Activity</h3>
            <div class="space-y-3">
                ${isAccepted ? `<div class="flex gap-3">
                    <div class="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></div>
                    <div class="flex-1">
                        <div class="text-xs text-gray-400 dark:text-gray-500">${formatDate(q.accepted_at || q.created_at)}</div>
                        <div class="text-sm text-gray-900 dark:text-white">Quote accepted by client</div>
                    </div>
                </div>` : ''}
                ${isConverted ? `<div class="flex gap-3">
                    <div class="w-2 h-2 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                    <div class="flex-1">
                        <div class="text-xs text-gray-400 dark:text-gray-500">${formatDate(q.converted_at || q.created_at)}</div>
                        <div class="text-sm text-gray-900 dark:text-white">Converted to invoice</div>
                    </div>
                </div>` : ''}
                <div class="flex gap-3">
                    <div class="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mt-1.5 flex-shrink-0"></div>
                    <div class="flex-1">
                        <div class="text-xs text-gray-400 dark:text-gray-500">${formatDate(q.created_at)}</div>
                        <div class="text-sm text-gray-900 dark:text-white">Quote created</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return `<div class="space-y-6">
        <!-- Back Button -->
        <button onclick="closeQuoteDetail()" class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Quotes
        </button>
        
        <!-- Header -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">${q.quote_number || 'QT-' + q.id.slice(0, 3)}</h1>
                        ${statusBadge}
                    </div>
                    <h2 class="text-xl text-gray-600 dark:text-gray-400">${q.title}</h2>
                    <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Created ${formatDate(q.created_at)}</p>
                </div>
                <div class="text-right">
                    <div class="text-4xl font-bold text-gray-900 dark:text-white">${formatCurrency(q.total)}</div>
                    <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Total Amount</p>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <!-- First 4 actions (always visible on mobile) -->
                ${!isConverted ? `<button onclick='openJobFromQuote(${JSON.stringify(q).replace(/"/g, "&quot;")})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded-lg transition-colors">Schedule Job</button>` : ''}
                ${!isAccepted && !isConverted ? `<button onclick='openModal("quote", ${JSON.stringify(q).replace(/"/g, "&quot;")})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded-lg transition-colors">Edit Quote</button>` : ''}
                ${!isConverted ? `<button onclick='convertToInvoice(${JSON.stringify(q).replace(/"/g, '&quot;')})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded-lg transition-colors">Convert to Invoice</button>` : ''}
                <button onclick='generatePDF("quote", ${JSON.stringify(q).replace(/"/g, '&quot;')})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded-lg transition-colors">Download PDF</button>
                <button onclick='sendQuoteEmail(${JSON.stringify(q).replace(/"/g, '&quot;')})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded-lg transition-colors">Email Quote</button>
                
                <!-- Show More button (mobile only) -->
                <button id="show-more-btn-${q.id}" onclick="toggleMoreActions('${q.id}')" class="md:hidden inline-flex items-center px-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-teal-300 dark:border-teal-600 rounded-lg transition-colors">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                    Show More
                </button>
                
                <!-- Additional actions (hidden on mobile by default) -->
                <div id="more-actions-${q.id}" class="hidden md:contents">
                    ${client?.phone && smsSettings?.enabled ? `<button onclick='sendQuoteSMS(${JSON.stringify(q).replace(/"/g, '&quot;')})' class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded-lg transition-colors">SMS Quote</button>` : ''}
                    <button onclick="toggleQuoteCommunications('${q.id}')" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded-lg transition-colors">Communications</button>
                    <button onclick="document.getElementById('file-upload-${q.id}').click()" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded-lg transition-colors">Add File</button>
                    <button onclick="toggleQuoteFiles('${q.id}')" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded-lg transition-colors">View Files</button>
                    <input type="file" id="file-upload-${q.id}" class="hidden" onchange="uploadQuoteFile(this, '${q.id}')" multiple>
                    <button onclick="deleteQuote('${q.id}')" class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors ml-auto">Delete</button>
                </div>
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
                        ${q.job_address || client?.address ? `<div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Address</div>
                            <div class="text-sm text-gray-900 dark:text-white">${q.job_address || client.address}</div>
                        </div>` : ''}
                    </div>
                </div>
                
                <!-- Salesperson -->
                ${getAccountType() === 'business' && teamMembers.filter(tm => tm.role === 'salesperson').length > 0 ? `
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Salesperson</h3>
                    <div class="space-y-3">
                        <select id="quote-salesperson-${q.id}" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
                            <option value="">None</option>
                            ${teamMembers.filter(tm => tm.role === 'salesperson').map(tm => 
                                `<option value="${tm.id}" ${q.salesperson_id === tm.id ? 'selected' : ''}>${tm.name}</option>`
                            ).join('')}
                        </select>
                        <button onclick="updateQuoteSalesperson('${q.id}')" class="w-full px-3 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
                            Update Salesperson
                        </button>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Track quote performance by salesperson in Analytics</p>
                    </div>
                </div>
                ` : ''}
                
                <!-- Quote Status -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Quote Status</h3>
                    <div class="space-y-3">
                        <select id="quote-status-${q.id}" onchange="toggleLostReason('${q.id}')" class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
                            <option value="pending" ${(q.quote_status || 'pending') === 'pending' ? 'selected' : ''}>⏳ Pending</option>
                            <option value="won" ${q.quote_status === 'won' ? 'selected' : ''}>✅ Won</option>
                            <option value="lost" ${q.quote_status === 'lost' ? 'selected' : ''}>❌ Lost</option>
                        </select>
                        
                        <div id="lost-reason-${q.id}" class="${q.quote_status === 'lost' ? '' : 'hidden'} space-y-2">
                            <label class="block text-xs text-gray-600 dark:text-gray-400">Reason for loss:</label>
                            <textarea id="lost-reason-text-${q.id}" placeholder="e.g., Price too high, chose competitor, timing..." class="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600" rows="3">${q.lost_reason || ''}</textarea>
                        </div>
                        
                        <button onclick="updateQuoteStatus('${q.id}')" class="w-full px-3 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
                            Update Status
                        </button>
                        
                        <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            <p><strong>Won:</strong> Quote accepted/converted</p>
                            <p><strong>Lost:</strong> Client declined (include reason)</p>
                            <p><strong>Pending:</strong> Awaiting response</p>
                        </div>
                    </div>
                </div>
                
                <!-- Notes -->
                ${q.notes ? `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Notes</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">${q.notes}</p>
                </div>` : ''}
                
                <!-- Job Linking Status -->
                ${relatedJob ? `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Related Job</h3>
                    <button onclick="switchTab('schedule'); openJobDetail(${JSON.stringify(relatedJob).replace(/"/g, '&quot;')})" class="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                        <div class="text-sm font-medium text-teal-600 dark:text-teal-400">${relatedJob.title}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">${formatDate(relatedJob.date)} at ${relatedJob.time || '09:00'}</div>
                        ${linkedExpensesList.length > 0 ? `<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${linkedExpensesList.length} expense${linkedExpensesList.length > 1 ? 's' : ''} linked</div>` : ''}
                    </button>
                </div>` : !isConverted ? `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">No Job Yet</h3>
                    <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">Schedule a job for this quote to track expenses and profit.</p>
                    <button onclick='openJobFromQuote(${JSON.stringify(q).replace(/"/g, "&quot;")})' class="w-full px-3 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
                        Schedule Job
                    </button>
                </div>` : ''}
                
                <!-- Activity -->
                ${activityTimeline}
            </div>
        </div>
        
        <!-- Communications Panel (Collapsible) -->
        <div id="quote-communications-${q.id}" class="hidden mt-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Communication History</h3>
                    <button onclick="openNoteModal('quote', '${q.id}', '${q.client_id}')" class="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">+ Add Note</button>
                </div>
                <div class="space-y-3">
                    ${(() => {
                        const quoteNotes = window.clientNotes ? window.clientNotes.filter(n => n.related_id === q.id && n.related_type === 'quote').sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [];
                        if (quoteNotes.length === 0) {
                            return '<p class="text-sm text-gray-500 dark:text-gray-400 italic">No communication notes yet. Click "+ Add Note" to log client interactions.</p>';
                        }
                        return quoteNotes.map(note => {
                            const noteDate = new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                            return `<div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <div class="flex justify-between items-start gap-2 mb-2">
                                    <span class="text-xs text-gray-500 dark:text-gray-400">${noteDate}</span>
                                    <button onclick="deleteClientNote('${note.id}')" class="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                </div>
                                <p class="text-sm text-gray-700 dark:text-gray-300">${note.note_text}</p>
                            </div>`;
                        }).join('');
                    })()}
                </div>
            </div>
        </div>
        
        <!-- Files Panel (Collapsible) -->
        <div id="quote-files-${q.id}" class="hidden mt-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Files & Documents</h3>
                    <button onclick="document.getElementById('file-upload-${q.id}').click()" class="px-3 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">Upload File</button>
                </div>
                <div id="quote-files-list-${q.id}" class="space-y-2">
                    <p class="text-sm text-gray-500 dark:text-gray-400 italic">Loading files...</p>
                </div>
            </div>
        </div>
    </div>`;
}

function toggleQuoteCommunications(quoteId) {
    console.log('Toggling communications for quote:', quoteId);
    const panel = document.getElementById(`quote-communications-${quoteId}`);
    console.log('Found panel:', panel);
    if (panel) {
        const wasHidden = panel.classList.contains('hidden');
        panel.classList.toggle('hidden');
        console.log('Panel is now:', wasHidden ? 'visible' : 'hidden');
        // Scroll into view if being shown
        if (wasHidden) {
            setTimeout(() => {
                panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    } else {
        console.error('Communications panel not found for quote:', quoteId);
        alert('Communications panel not found. Please refresh the page.');
    }
}

function toggleQuoteFiles(quoteId) {
    const panel = document.getElementById(`quote-files-${quoteId}`);
    if (panel) {
        const wasHidden = panel.classList.contains('hidden');
        panel.classList.toggle('hidden');
        if (wasHidden) {
            loadQuoteFiles(quoteId);
            setTimeout(() => {
                panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
}

async function loadQuoteFiles(quoteId) {
    const listContainer = document.getElementById(`quote-files-list-${quoteId}`);
    if (!listContainer) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('quote_files')
            .select('*')
            .eq('quote_id', quoteId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Database error loading quote files:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error details:', error.details);
            throw error;
        }
        
        if (!data || data.length === 0) {
            listContainer.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400 italic">No files uploaded yet.</p>';
            return;
        }
        
        listContainer.innerHTML = data.map(file => {
            const uploadDate = new Date(file.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const fileSize = file.file_size ? (file.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size';
            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div class="flex-1 min-w-0">
                        <a href="${file.file_url}" target="_blank" class="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline truncate block">${file.file_name}</a>
                        <div class="text-xs text-gray-500 dark:text-gray-400">${fileSize} • ${uploadDate}</div>
                    </div>
                    <button onclick="deleteQuoteFile('${file.id}', '${quoteId}')" class="ml-2 text-red-500 hover:text-red-700 text-sm px-2 py-1">Delete</button>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading files:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        const errorMsg = error.message || error.hint || 'Unknown error loading files';
        listContainer.innerHTML = `<p class="text-sm text-red-500">Error: ${errorMsg}</p>`;
    }
}

async function uploadQuoteFile(input, quoteId) {
    const files = input.files;
    if (!files || files.length === 0) return;
    
    try {
        isLoading = true;
        loadingMessage = 'Uploading files...';
        renderApp();
        
        for (const file of files) {
            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${quoteId}-${Date.now()}.${fileExt}`;
            const filePath = `quote-files/${fileName}`;
            
            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('quote-files')
                .upload(filePath, file);
            
            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                console.error('Bucket:', 'quote-files');
                console.error('File path:', filePath);
                throw uploadError;
            }
            
            // Get public URL
            const { data: { publicUrl } } = supabaseClient.storage
                .from('quote-files')
                .getPublicUrl(filePath);
            
            // Save file record to database
            const { error: dbError } = await supabaseClient
                .from('quote_files')
                .insert([{
                    user_id: currentUser.id,
                    quote_id: quoteId,
                    file_name: file.name,
                    file_url: publicUrl,
                    file_size: file.size,
                    file_type: file.type
                }]);
            
            if (dbError) {
                console.error('Database insert error:', dbError);
                console.error('Table:', 'quote_files');
                throw dbError;
            }
        }
        
        showNotification('Files uploaded successfully!');
        loadQuoteFiles(quoteId);
        input.value = ''; // Clear input
    } catch (error) {
        console.error('Error uploading files:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));
        showNotification('Error uploading files: ' + (error.message || 'Unknown error'), 'error');
    } finally {
        isLoading = false;
        renderApp();
    }
}

async function deleteQuoteFile(fileId, quoteId) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('quote_files')
            .delete()
            .eq('id', fileId);
        
        if (error) throw error;
        
        showNotification('File deleted successfully!');
        loadQuoteFiles(quoteId);
    } catch (error) {
        console.error('Error deleting file:', error);
        showNotification('Error deleting file', 'error');
    }
}

// Toggle "Show More" actions on mobile
function toggleMoreActions(quoteId) {
    const moreActions = document.getElementById(`more-actions-${quoteId}`);
    const showMoreBtn = document.getElementById(`show-more-btn-${quoteId}`);
    
    if (moreActions && showMoreBtn) {
        const isHidden = moreActions.classList.contains('hidden');
        
        if (isHidden) {
            // Show more actions
            moreActions.classList.remove('hidden');
            moreActions.classList.add('contents'); // Use contents to maintain flexbox layout
            showMoreBtn.innerHTML = `
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                </svg>
                Show Less
            `;
        } else {
            // Hide more actions
            moreActions.classList.add('hidden');
            moreActions.classList.remove('contents');
            showMoreBtn.innerHTML = `
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
                Show More
            `;
        }
    }
}

// Toggle lost reason field visibility
function toggleLostReason(quoteId) {
    const selectElement = document.getElementById(`quote-status-${quoteId}`);
    const lostReasonDiv = document.getElementById(`lost-reason-${quoteId}`);
    
    if (!selectElement || !lostReasonDiv) return;
    
    const status = selectElement.value;
    
    if (status === 'lost') {
        lostReasonDiv.classList.remove('hidden');
    } else {
        lostReasonDiv.classList.add('hidden');
    }
}

// Update quote status (won/lost/pending)
async function updateQuoteStatus(quoteId) {
    const selectElement = document.getElementById(`quote-status-${quoteId}`);
    const lostReasonText = document.getElementById(`lost-reason-text-${quoteId}`);
    
    if (!selectElement) {
        showNotification('Could not find status selector', 'error');
        return;
    }
    
    const status = selectElement.value;
    const lostReason = status === 'lost' ? (lostReasonText?.value.trim() || null) : null;
    
    // Validate: if lost, require a reason
    if (status === 'lost' && !lostReason) {
        showNotification('Please provide a reason for losing this quote', 'error');
        lostReasonText?.focus();
        return;
    }
    
    try {
        const updateData = {
            quote_status: status,
            lost_reason: lostReason
        };
        
        // If status is won, also set accepted flag for compatibility
        if (status === 'won') {
            updateData.accepted = true;
            updateData.status = 'accepted';
        }
        
        const { error } = await supabaseClient
            .from('quotes')
            .update(updateData)
            .eq('id', quoteId);
        
        if (error) throw error;
        
        // Update local data
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
            quote.quote_status = status;
            quote.lost_reason = lostReason;
            if (status === 'won') {
                quote.accepted = true;
                quote.status = 'accepted';
            }
        }
        
        // Update selected quote if it's the current one
        if (selectedQuoteForDetail && selectedQuoteForDetail.id === quoteId) {
            selectedQuoteForDetail.quote_status = status;
            selectedQuoteForDetail.lost_reason = lostReason;
            if (status === 'won') {
                selectedQuoteForDetail.accepted = true;
                selectedQuoteForDetail.status = 'accepted';
            }
        }
        
        let message = '';
        if (status === 'won') {
            message = '✅ Quote marked as WON!';
        } else if (status === 'lost') {
            message = '❌ Quote marked as LOST (reason saved)';
        } else {
            message = '⏳ Quote status set to PENDING';
        }
        
        showNotification(message, 'success');
        renderApp();
    } catch (error) {
        console.error('Error updating quote status:', error);
        showNotification('Error updating status: ' + error.message, 'error');
    }
}

// Helper: Auto-set quote to Won when customer accepts
// Call this from wherever your quote acceptance logic is
async function markQuoteAsWon(quoteId, skipNotification = false) {
    try {
        const { error } = await supabaseClient
            .from('quotes')
            .update({
                quote_status: 'won',
                accepted: true,
                status: 'accepted'
            })
            .eq('id', quoteId);
        
        if (error) throw error;
        
        // Update local data
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
            quote.quote_status = 'won';
            quote.accepted = true;
            quote.status = 'accepted';
        }
        
        if (!skipNotification) {
            showNotification('✅ Quote automatically marked as WON!', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('Error marking quote as won:', error);
        return false;
    }
}

// Update salesperson for a quote
async function updateQuoteSalesperson(quoteId) {
    const selectElement = document.getElementById(`quote-salesperson-${quoteId}`);
    if (!selectElement) {
        showNotification('Could not find salesperson selector', 'error');
        return;
    }
    
    const salespersonId = selectElement.value || null;
    
    try {
        const { error } = await supabaseClient
            .from('quotes')
            .update({ salesperson_id: salespersonId })
            .eq('id', quoteId);
        
        if (error) throw error;
        
        // Update local data
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
            quote.salesperson_id = salespersonId;
        }
        
        // Update selected quote if it's the current one
        if (selectedQuoteForDetail && selectedQuoteForDetail.id === quoteId) {
            selectedQuoteForDetail.salesperson_id = salespersonId;
        }
        
        const salesperson = teamMembers.find(tm => tm.id === salespersonId);
        const message = salesperson 
            ? `Salesperson set to ${salesperson.name}`
            : 'Salesperson removed';
        
        showNotification(message, 'success');
        renderApp();
    } catch (error) {
        console.error('Error updating salesperson:', error);
        showNotification('Error updating salesperson: ' + error.message, 'error');
    }
}

console.log('✅ Quotes module loaded (Professional Table View)');
