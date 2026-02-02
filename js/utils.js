// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Utility Functions
// ═══════════════════════════════════════════════════════════════════

// Search Debouncing
function debouncedSearch(searchType, value, resetPage = true) {
    if (searchType === 'client') clientSearch = value;
    else if (searchType === 'quote') quoteSearch = value;
    else if (searchType === 'invoice') invoiceSearch = value;
    else if (searchType === 'job') jobSearch = value;
    else if (searchType === 'expense') expenseSearch = value;
    
    clearTimeout(searchDebounceTimer);
    
    searchDebounceTimer = setTimeout(() => {
        if (resetPage) {
            if (searchType === 'client') currentPage.clients = 1;
            else if (searchType === 'quote') currentPage.quotes = 1;
            else if (searchType === 'invoice') currentPage.invoices = 1;
            else if (searchType === 'job') currentPage.jobs = 1;
            else if (searchType === 'expense') currentPage.expenses = 1;
        }
        renderApp();
    }, 300);
}

// Session Management
function resetSessionTimeout() {
    clearTimeout(sessionTimeout);
    if (currentUser) {
        sessionTimeout = setTimeout(() => {
            alert('Your session has expired due to inactivity. Please log in again.');
            handleLogout();
        }, SESSION_TIMEOUT_MS);
    }
}

function setupSessionTimeout() {
    let activityEvents = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
        document.addEventListener(event, resetSessionTimeout, { passive: true });
    });
    resetSessionTimeout();
}

// Account Type Helper
function getAccountType() {
    if (isAdmin && demoMode) return demoMode;
    return subscription?.account_type || 'sole_trader';
}

// Dark Mode
function toggleSettingsMenu() {
    const menu = document.getElementById('settings-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    applyDarkMode();
}

function applyDarkMode() {
    if (darkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

// Notifications
function showNotification(message, type = 'success') {
    const icon = type === 'success' ? '✅' : '❌';
    const bgColor = type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700';
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${bgColor} border-l-4 p-4 rounded shadow-lg z-50 max-w-md animate-slide-in`;
    notification.innerHTML = `<p class="font-medium dark:text-gray-200">${icon} ${message}</p>`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Selection Management
function toggleSelection(type, id) {
    const selectedArray = type === 'quotes' ? selectedQuotes : 
                          type === 'invoices' ? selectedInvoices :
                          type === 'jobs' ? selectedJobs :
                          type === 'expenses' ? selectedExpenses :
                          selectedClients;
    
    const index = selectedArray.indexOf(id);
    if (index > -1) {
        selectedArray.splice(index, 1);
    } else {
        selectedArray.push(id);
    }
    renderApp();
}

function toggleSelectAll(type) {
    const selectedArray = type === 'quotes' ? selectedQuotes : 
                          type === 'invoices' ? selectedInvoices :
                          type === 'jobs' ? selectedJobs :
                          type === 'expenses' ? selectedExpenses :
                          selectedClients;
    
    const allItems = type === 'quotes' ? quotes : 
                     type === 'invoices' ? invoices :
                     type === 'jobs' ? jobs :
                     type === 'expenses' ? expenses :
                     clients;
    
    if (selectedArray.length === allItems.length) {
        selectedArray.length = 0;
    } else {
        selectedArray.length = 0;
        allItems.forEach(item => selectedArray.push(item.id));
    }
    renderApp();
}

// Bulk Delete
async function bulkDelete(type) {
    const selectedArray = type === 'quotes' ? selectedQuotes : 
                          type === 'invoices' ? selectedInvoices :
                          type === 'jobs' ? selectedJobs :
                          type === 'expenses' ? selectedExpenses :
                          selectedClients;
    
    if (selectedArray.length === 0) {
        showNotification('No items selected', 'error');
        return;
    }
    
    const count = selectedArray.length;
    const itemType = type.slice(0, -1);
    
    if (!confirm(`Delete ${count} ${count === 1 ? itemType : type}? This cannot be undone.`)) {
        return;
    }
    
    try {
        isLoading = true;
        loadingMessage = `Deleting ${count} ${count === 1 ? itemType : type}...`;
        renderApp();
        
        const tableName = type === 'jobs' ? 'jobs' : 
                          type === 'quotes' ? 'quotes' :
                          type === 'invoices' ? 'invoices' :
                          type === 'expenses' ? 'expenses' :
                          'clients';
        
        const { error } = await supabaseClient
            .from(tableName)
            .delete()
            .in('id', selectedArray);
        
        if (error) throw error;
        
        if (type === 'quotes') {
            quotes = quotes.filter(q => !selectedArray.includes(q.id));
            selectedQuotes = [];
        } else if (type === 'invoices') {
            invoices = invoices.filter(i => !selectedArray.includes(i.id));
            selectedInvoices = [];
        } else if (type === 'jobs') {
            jobs = jobs.filter(j => !selectedArray.includes(j.id));
            selectedJobs = [];
        } else if (type === 'expenses') {
            expenses = expenses.filter(e => !selectedArray.includes(e.id));
            selectedExpenses = [];
        } else if (type === 'clients') {
            clients = clients.filter(c => !selectedArray.includes(c.id));
            selectedClients = [];
        }
        
        showNotification(`${count} ${count === 1 ? itemType : type} deleted successfully!`);
    } catch (error) {
        console.error('Bulk delete error:', error);
        showNotification(`Failed to delete ${type}: ` + error.message, 'error');
    } finally {
        isLoading = false;
        renderApp();
    }
}

// Pagination
function getPaginationHTML(section, totalItems, currentPageNum) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return '';
    
    const startItem = (currentPageNum - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPageNum * itemsPerPage, totalItems);
    
    return `
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4 border-t">
            <div class="text-sm text-gray-600 dark:text-gray-300">
                Showing ${startItem}-${endItem} of ${totalItems}
            </div>
            <div class="flex gap-2">
                ${currentPageNum > 1 ? `<button onclick="currentPage.${section}=${currentPageNum - 1}; renderApp();" class="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700">← Previous</button>` : ''}
                ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const pageNum = i + 1;
                    if (totalPages > 5 && currentPageNum > 3) {
                        const start = Math.max(1, currentPageNum - 2);
                        const actualPage = start + i;
                        if (actualPage > totalPages) return '';
                        return `<button onclick="currentPage.${section}=${actualPage}; renderApp();" class="px-3 py-1 border rounded ${actualPage === currentPageNum ? 'bg-black text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}">${actualPage}</button>`;
                    }
                    return `<button onclick="currentPage.${section}=${pageNum}; renderApp();" class="px-3 py-1 border rounded ${pageNum === currentPageNum ? 'bg-black text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}">${pageNum}</button>`;
                }).join('')}
                ${currentPageNum < totalPages ? `<button onclick="currentPage.${section}=${currentPageNum + 1}; renderApp();" class="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700">Next →</button>` : ''}
            </div>
        </div>
    `;
}

// CSV Export
function exportToCSV(type) {
    let data = [];
    let filename = '';
    let headers = [];
    
    if (type === 'clients') {
        headers = ['Name', 'Email', 'Phone', 'Address', 'Notes'];
        const filtered = clients.filter(c => 
            c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
            c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
            c.phone.includes(clientSearch) ||
            (c.address && c.address.toLowerCase().includes(clientSearch.toLowerCase()))
        );
        data = filtered.map(c => [c.name, c.email, c.phone, c.address || '', c.notes || '']);
        filename = clientSearch ? `clients_filtered_${clientSearch}.csv` : 'clients.csv';
    } else if (type === 'jobs') {
        headers = ['Client', 'Title', 'Date', 'Time', 'Status', 'Notes'];
        const filtered = jobs.filter(job => {
            if (!jobSearch) return true;
            const client = clients.find(c => c.id === job.client_id);
            const searchLower = jobSearch.toLowerCase();
            return (job.title.toLowerCase().includes(searchLower) || (client?.name || '').toLowerCase().includes(searchLower));
        });
        data = filtered.map(j => {
            const client = clients.find(c => c.id === j.client_id);
            return [client?.name || 'Unknown', j.title, j.date, j.time, j.status || 'scheduled', j.notes || ''];
        });
        filename = jobSearch ? `jobs_filtered_${jobSearch}.csv` : 'jobs.csv';
    } else if (type === 'quotes') {
        headers = ['Client', 'Title', 'Date', 'Total', 'Status', 'Accepted'];
        const filtered = quotes.filter(q => {
            if (!quoteSearch) return true;
            const client = clients.find(c => c.id === q.client_id);
            const searchLower = quoteSearch.toLowerCase();
            return (q.title.toLowerCase().includes(searchLower) || (client?.name || '').toLowerCase().includes(searchLower));
        });
        data = filtered.map(q => {
            const client = clients.find(c => c.id === q.client_id);
            return [client?.name || 'Unknown', q.title, q.date, q.total, q.status, q.accepted ? 'Yes' : 'No'];
        });
        filename = quoteSearch ? `quotes_filtered_${quoteSearch}.csv` : 'quotes.csv';
    } else if (type === 'invoices') {
        headers = ['Client', 'Invoice #', 'Title', 'Issue Date', 'Due Date', 'Total', 'Status'];
        const filtered = invoices.filter(i => {
            if (!invoiceSearch) return true;
            const client = clients.find(c => c.id === i.client_id);
            const searchLower = invoiceSearch.toLowerCase();
            return (i.title.toLowerCase().includes(searchLower) || (client?.name || '').toLowerCase().includes(searchLower));
        });
        data = filtered.map(i => {
            const client = clients.find(c => c.id === i.client_id);
            return [client?.name || 'Unknown', i.invoice_number, i.title, i.issue_date, i.due_date || '', i.total, i.status];
        });
        filename = invoiceSearch ? `invoices_filtered_${invoiceSearch}.csv` : 'invoices.csv';
    } else if (type === 'expenses') {
        headers = ['Date', 'Amount', 'Category', 'Description'];
        const filtered = expenses.filter(exp => {
            if (!expenseSearch) return true;
            const searchLower = expenseSearch.toLowerCase();
            return ((exp.description || '').toLowerCase().includes(searchLower) || (exp.category || '').toLowerCase().includes(searchLower));
        });
        data = filtered.map(e => [e.date, e.amount, e.category, e.description || '']);
        filename = expenseSearch ? `expenses_filtered_${expenseSearch}.csv` : 'expenses.csv';
    }
    
    if (data.length === 0) {
        showNotification('No data to export', 'error');
        return;
    }
    
    let csvContent = headers.join(',') + '\n';
    data.forEach(row => {
        csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Download User Guide
function downloadUserGuide() {
    const menu = document.getElementById('settings-menu');
    if (menu) {
        menu.classList.add('hidden');
    }
    window.open('https://raw.githubusercontent.com/keithmurphy09/m4-streamline/main/docs/Streamline_User_Guide.pdf', '_blank');
}

console.log('✅ Utils loaded');
