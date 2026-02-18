// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Smart Filters (FIXED - Works on Enter, No Chips)
// ═══════════════════════════════════════════════════════════════════

// Smart filter state
let smartFilterActive = false;
let smartFilterQuery = '';
let smartFilterParsed = null;

// Parse natural language filter queries
function parseSmartFilter(query, dataType) {
    const filters = {
        status: null,
        dateRange: null,
        amountMin: null,
        amountMax: null,
        client: null
    };
    
    const q = query.toLowerCase();
    
    // Parse status
    if (q.includes('overdue')) filters.status = 'overdue';
    else if (q.includes('unpaid')) filters.status = 'unpaid';
    else if (q.includes('paid')) filters.status = 'paid';
    else if (q.includes('pending')) filters.status = 'pending';
    else if (q.includes('accepted')) filters.status = 'accepted';
    else if (q.includes('declined')) filters.status = 'declined';
    
    // Parse date ranges
    if (q.includes('today')) filters.dateRange = 'today';
    else if (q.includes('this week')) filters.dateRange = 'this_week';
    else if (q.includes('this month')) filters.dateRange = 'this_month';
    else if (q.includes('this quarter')) filters.dateRange = 'this_quarter';
    else if (q.includes('this year')) filters.dateRange = 'this_year';
    else if (q.includes('last month')) filters.dateRange = 'last_month';
    
    // Parse amounts
    const overMatch = q.match(/over\s+\$?(\d+)/);
    const aboveMatch = q.match(/above\s+\$?(\d+)/);
    if (overMatch) filters.amountMin = parseFloat(overMatch[1]);
    else if (aboveMatch) filters.amountMin = parseFloat(aboveMatch[1]);
    
    const underMatch = q.match(/under\s+\$?(\d+)/);
    const belowMatch = q.match(/below\s+\$?(\d+)/);
    if (underMatch) filters.amountMax = parseFloat(underMatch[1]);
    else if (belowMatch) filters.amountMax = parseFloat(belowMatch[1]);
    
    // Parse client name
    const clientMatch = q.match(/(?:client:|from|for)\s+([a-z\s]+?)(?:\s+|$)/i);
    if (clientMatch) filters.client = clientMatch[1].trim();
    
    return filters;
}

// Apply smart filters to data
function applySmartFilter(items, dataType, filters) {
    return items.filter(item => {
        // Status filter
        if (filters.status) {
            if (dataType === 'invoices') {
                if (filters.status === 'overdue') {
                    if (item.status !== 'unpaid' || !item.due_date) return false;
                    if (new Date(item.due_date) >= new Date()) return false;
                } else if (item.status !== filters.status) {
                    return false;
                }
            } else if (dataType === 'quotes') {
                if (filters.status === 'accepted' && !item.accepted) return false;
                if (filters.status === 'declined' && item.status !== 'declined') return false;
                if (filters.status === 'pending' && (item.accepted || item.status === 'declined')) return false;
            }
        }
        
        // Date range filter
        if (filters.dateRange) {
            const itemDate = new Date(item.issue_date || item.date || item.created_at);
            const now = new Date();
            let startDate, endDate;
            
            switch(filters.dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    endDate = new Date(now.setHours(23, 59, 59, 999));
                    break;
                case 'this_week':
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - now.getDay());
                    startDate = new Date(weekStart.setHours(0, 0, 0, 0));
                    endDate = new Date();
                    break;
                case 'this_month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date();
                    break;
                case 'this_quarter':
                    const quarter = Math.floor(now.getMonth() / 3);
                    startDate = new Date(now.getFullYear(), quarter * 3, 1);
                    endDate = new Date();
                    break;
                case 'this_year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    endDate = new Date();
                    break;
                case 'last_month':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                    break;
            }
            
            if (itemDate < startDate || itemDate > endDate) return false;
        }
        
        // Amount filters
        if (filters.amountMin && item.total < filters.amountMin) return false;
        if (filters.amountMax && item.total > filters.amountMax) return false;
        
        // Client filter
        if (filters.client) {
            const client = clients.find(c => c.id === item.client_id);
            if (!client || !client.name.toLowerCase().includes(filters.client.toLowerCase())) {
                return false;
            }
        }
        
        return true;
    });
}

// Render smart filter bar (NO quick filter chips)
function renderSmartFilterBar(dataType) {
    return `
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div class="flex items-center gap-3">
                <div class="flex-1 relative">
                    <input 
                        type="text" 
                        id="smartFilterInput"
                        placeholder="Natural language search: 'overdue this quarter' or 'unpaid over $5000'"
                        class="w-full px-4 py-2 pr-10 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                        onkeypress="if(event.key === 'Enter') { event.preventDefault(); activateSmartFilter('${dataType}'); }"
                    />
                    <svg class="w-5 h-5 absolute right-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>
                
                ${smartFilterActive ? `
                    <button 
                        onclick="clearSmartFilter()"
                        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Clear Filter
                    </button>
                ` : `
                    <button 
                        onclick="activateSmartFilter('${dataType}')"
                        class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Search
                    </button>
                `}
            </div>
            
            ${smartFilterActive ? `
                <div class="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    Filtering: <span class="font-semibold text-teal-600 dark:text-teal-400">${smartFilterQuery}</span>
                </div>
            ` : ''}
        </div>
    `;
}

// Activate smart filter
function activateSmartFilter(dataType) {
    const input = document.getElementById('smartFilterInput');
    if (!input) return;
    
    smartFilterQuery = input.value.trim();
    if (!smartFilterQuery) return;
    
    smartFilterActive = true;
    smartFilterParsed = parseSmartFilter(smartFilterQuery, dataType);
    renderApp();
    
    // Restore value after render
    setTimeout(() => {
        const newInput = document.getElementById('smartFilterInput');
        if (newInput && smartFilterQuery) newInput.value = smartFilterQuery;
    }, 50);
}

// Clear smart filter
function clearSmartFilter() {
    smartFilterQuery = '';
    smartFilterActive = false;
    smartFilterParsed = null;
    const input = document.getElementById('smartFilterInput');
    if (input) input.value = '';
    renderApp();
}

// Get filtered data based on smart filter
function getSmartFilteredData(items, dataType) {
    if (!smartFilterActive || !smartFilterParsed) {
        return items;
    }
    return applySmartFilter(items, dataType, smartFilterParsed);
}

console.log('✅ Smart Filters loaded (FIXED - Enter works, no chips)');
