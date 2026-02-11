// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Smart Filters System
// ═══════════════════════════════════════════════════════════════════

let smartFilterActive = false;
let smartFilterQuery = '';

// Parse natural language filter queries
function parseSmartFilter(query, dataType) {
    const q = query.toLowerCase().trim();
    const filters = {
        status: null,
        dateRange: null,
        amountMin: null,
        amountMax: null,
        client: null,
        tags: []
    };
    
    // Status keywords
    if (q.includes('overdue')) filters.status = 'overdue';
    else if (q.includes('unpaid')) filters.status = 'unpaid';
    else if (q.includes('paid')) filters.status = 'paid';
    else if (q.includes('pending')) filters.status = 'pending';
    else if (q.includes('accepted')) filters.status = 'accepted';
    else if (q.includes('declined')) filters.status = 'declined';
    
    // Date range keywords
    const today = new Date();
    if (q.includes('today')) {
        filters.dateRange = { start: new Date(today.setHours(0,0,0,0)), end: new Date(today.setHours(23,59,59,999)) };
    } else if (q.includes('this week')) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        filters.dateRange = { start: weekStart, end: weekEnd };
    } else if (q.includes('this month')) {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        filters.dateRange = { start: monthStart, end: monthEnd };
    } else if (q.includes('this quarter')) {
        const quarter = Math.floor(today.getMonth() / 3);
        const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
        const quarterEnd = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        filters.dateRange = { start: quarterStart, end: quarterEnd };
    } else if (q.includes('this year')) {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31);
        filters.dateRange = { start: yearStart, end: yearEnd };
    } else if (q.includes('last month')) {
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        filters.dateRange = { start: lastMonthStart, end: lastMonthEnd };
    }
    
    // Amount filtering
    const overMatch = q.match(/over\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    const underMatch = q.match(/under\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    const aboveMatch = q.match(/above\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    const belowMatch = q.match(/below\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    
    if (overMatch || aboveMatch) {
        const amount = parseFloat((overMatch || aboveMatch)[1].replace(/,/g, ''));
        filters.amountMin = amount;
    }
    if (underMatch || belowMatch) {
        const amount = parseFloat((underMatch || belowMatch)[1].replace(/,/g, ''));
        filters.amountMax = amount;
    }
    
    // Client name extraction (for client: or from keywords)
    const clientMatch = q.match(/(?:client:|from|for)\s+([a-z\s]+?)(?:\s|$)/i);
    if (clientMatch) {
        filters.client = clientMatch[1].trim();
    }
    
    return filters;
}

// Apply smart filters to data
function applySmartFilter(items, dataType, parsedFilters) {
    return items.filter(item => {
        // Status filter
        if (parsedFilters.status) {
            if (dataType === 'invoices') {
                if (parsedFilters.status === 'overdue') {
                    const isOverdue = item.status === 'unpaid' && item.due_date && new Date(item.due_date) < new Date();
                    if (!isOverdue) return false;
                } else if (item.status !== parsedFilters.status) {
                    return false;
                }
            } else if (dataType === 'quotes') {
                const status = item.status || (item.accepted ? 'accepted' : 'pending');
                if (status !== parsedFilters.status) return false;
            }
        }
        
        // Date range filter
        if (parsedFilters.dateRange) {
            const itemDate = dataType === 'invoices' 
                ? new Date(item.issue_date || item.created_at)
                : new Date(item.created_at || item.date);
            
            if (itemDate < parsedFilters.dateRange.start || itemDate > parsedFilters.dateRange.end) {
                return false;
            }
        }
        
        // Amount filter
        const amount = parseFloat(item.total || 0);
        if (parsedFilters.amountMin && amount < parsedFilters.amountMin) return false;
        if (parsedFilters.amountMax && amount > parsedFilters.amountMax) return false;
        
        // Client filter
        if (parsedFilters.client) {
            const client = clients.find(c => c.id === item.client_id);
            if (!client || !client.name.toLowerCase().includes(parsedFilters.client.toLowerCase())) {
                return false;
            }
        }
        
        return true;
    });
}

// Generate smart filter suggestions based on partial input
function getSmartFilterSuggestions(partialQuery, dataType) {
    const suggestions = [];
    const q = partialQuery.toLowerCase();
    
    // Status suggestions
    if (dataType === 'invoices') {
        if ('overdue'.includes(q)) suggestions.push('overdue invoices');
        if ('unpaid'.includes(q)) suggestions.push('unpaid invoices');
        if ('paid'.includes(q)) suggestions.push('paid invoices');
    } else if (dataType === 'quotes') {
        if ('pending'.includes(q)) suggestions.push('pending quotes');
        if ('accepted'.includes(q)) suggestions.push('accepted quotes');
        if ('declined'.includes(q)) suggestions.push('declined quotes');
    }
    
    // Date suggestions
    if ('this'.includes(q) || 'week'.includes(q)) suggestions.push('this week');
    if ('this'.includes(q) || 'month'.includes(q)) suggestions.push('this month');
    if ('this'.includes(q) || 'quarter'.includes(q)) suggestions.push('this quarter');
    if ('this'.includes(q) || 'year'.includes(q)) suggestions.push('this year');
    
    // Amount suggestions
    if ('over'.includes(q) || 'above'.includes(q)) {
        suggestions.push('over $5000');
        suggestions.push('over $10000');
    }
    if ('under'.includes(q) || 'below'.includes(q)) {
        suggestions.push('under $1000');
        suggestions.push('under $5000');
    }
    
    // Combined suggestions
    if (dataType === 'invoices') {
        suggestions.push('overdue invoices this quarter');
        suggestions.push('unpaid over $5000');
        suggestions.push('paid this month');
    } else {
        suggestions.push('pending quotes this week');
        suggestions.push('accepted over $10000');
        suggestions.push('quotes this quarter');
    }
    
    return suggestions.slice(0, 5); // Max 5 suggestions
}

// Render smart filter UI
function renderSmartFilterBar(dataType) {
    return `
        <div class="mb-4">
            <div class="relative">
                <input 
                    type="text" 
                    id="smartFilter${dataType}" 
                    placeholder="Try: 'overdue invoices this quarter' or 'unpaid over $5000'"
                    value="${smartFilterQuery}"
                    oninput="handleSmartFilterInput(this.value, '${dataType}')"
                    onkeydown="if(event.key==='Enter') applySmartFilterFromInput('${dataType}')"
                    class="w-full px-4 py-3 pl-12 pr-24 border-2 border-teal-400 rounded-lg dark:bg-gray-700 dark:text-white dark:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                <div class="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg class="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>
                ${smartFilterActive ? `
                    <button 
                        onclick="clearSmartFilter('${dataType}')"
                        class="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-md transition-colors"
                    >
                        Clear
                    </button>
                ` : `
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
                        Press Enter
                    </div>
                `}
            </div>
            
            <!-- Quick filter chips -->
            <div class="mt-3 flex flex-wrap gap-2">
                ${dataType === 'invoices' ? `
                    <button onclick="quickSmartFilter('overdue invoices', 'invoices')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full transition-colors">
                        Overdue
                    </button>
                    <button onclick="quickSmartFilter('unpaid invoices this quarter', 'invoices')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full transition-colors">
                        This Quarter
                    </button>
                    <button onclick="quickSmartFilter('paid this month', 'invoices')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full transition-colors">
                        Paid This Month
                    </button>
                    <button onclick="quickSmartFilter('over $5000', 'invoices')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full transition-colors">
                        Over $5,000
                    </button>
                ` : `
                    <button onclick="quickSmartFilter('pending quotes', 'quotes')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full transition-colors">
                        Pending
                    </button>
                    <button onclick="quickSmartFilter('accepted this month', 'quotes')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full transition-colors">
                        Accepted This Month
                    </button>
                    <button onclick="quickSmartFilter('over $10000', 'quotes')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full transition-colors">
                        Over $10,000
                    </button>
                `}
            </div>
        </div>
    `;
}

// Handle input changes
function handleSmartFilterInput(value, dataType) {
    smartFilterQuery = value;
    // Could show live suggestions here
}

// Apply filter from input
function applySmartFilterFromInput(dataType) {
    const input = document.getElementById(`smartFilter${dataType}`);
    if (!input || !input.value.trim()) {
        clearSmartFilter(dataType);
        return;
    }
    
    smartFilterActive = true;
    smartFilterQuery = input.value;
    renderApp();
}

// Quick filter button click
function quickSmartFilter(query, dataType) {
    smartFilterQuery = query;
    smartFilterActive = true;
    renderApp();
}

// Clear smart filter
function clearSmartFilter(dataType) {
    smartFilterActive = false;
    smartFilterQuery = '';
    renderApp();
}

console.log('✅ Smart Filters loaded');
