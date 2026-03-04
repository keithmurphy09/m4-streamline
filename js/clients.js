// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Clients Module
// ═══════════════════════════════════════════════════════════════════

function renderClients() {
    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.phone.includes(clientSearch) ||
        (c.address && c.address.toLowerCase().includes(clientSearch.toLowerCase()))
    );
    
    const totalClients = filteredClients.length;
    const startIndex = (currentPage.clients - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);
    
    const clientsList = paginatedClients.length === 0 
        ? '<div class="text-center py-12 text-gray-500 dark:text-gray-400">No clients found</div>' 
        : paginatedClients.map(c => {
            const isSelected = selectedClients.includes(c.id);
            return `<div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow ${isSelected ? 'ring-2 ring-blue-400' : ''}">
                <div class="flex gap-3">
                    <div class="flex items-start pt-1">
                        <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelection('clients', '${c.id}')" class="w-5 h-5 text-blue-600 rounded">
                    </div>
                    <div class="flex-1">
                        <div class="flex flex-col sm:flex-row sm:justify-between gap-3">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold dark:text-white cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors" onclick="openClientQuickView('${c.id}')">${c.name}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-300">${c.email}</p>
                                <p class="text-sm text-gray-600 dark:text-gray-300">${c.phone}</p>
                                ${c.address ? `<p class="text-sm text-gray-600 dark:text-gray-300 mt-1">📍 ${c.address}</p>` : ''}
                                ${c.notes ? `<p class="text-sm text-gray-700 italic mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">📝 ${c.notes}</p>` : ''}
                            </div>
                            <div class="flex sm:flex-col gap-2">
                                <button onclick="openClientQuickView('${c.id}')" class="flex-1 sm:w-24 px-3 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-600 hover:border-blue-500 rounded text-sm whitespace-nowrap transition-colors">View</button>
                                <button onclick='openQuoteForClient(${JSON.stringify(c).replace(/"/g, "&quot;")})' class="flex-1 sm:w-24 px-3 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30 border border-gray-200 dark:border-gray-600 hover:border-green-500 rounded text-sm whitespace-nowrap transition-colors">New Quote</button>
                                <button onclick='openModal("client", ${JSON.stringify(c).replace(/"/g, "&quot;")})' class="flex-1 sm:w-24 px-3 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 rounded text-sm transition-colors">Edit</button>
                                <button onclick="deleteClient('${c.id}')" class="flex-1 sm:w-24 px-3 py-1 text-red-600 border border-red-200 rounded text-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
    
    const pagination = getPaginationHTML('clients', totalClients, currentPage.clients);
    
    const bulkActions = selectedClients.length > 0 ? `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <span class="text-sm font-medium text-blue-900">${selectedClients.length} client${selectedClients.length > 1 ? 's' : ''} selected</span>
            <button onclick="bulkDelete('clients')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium dark:text-gray-200">🗑️ Delete Selected</button>
        </div>
    ` : '';
    
    const selectAllCheckbox = paginatedClients.length > 0 ? `
        <div class="flex items-center gap-2 mb-4">
            <input type="checkbox" ${selectedClients.length === clients.length && clients.length > 0 ? 'checked' : ''} onchange="toggleSelectAll('clients')" class="w-5 h-5 text-blue-600 rounded">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Select All</label>
        </div>
    ` : '';
    
    return `<div><div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6"><h2 class="text-2xl font-bold dark:text-teal-400">Clients</h2><div class="flex flex-wrap gap-2"><button onclick="exportToCSV('clients')" class="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 px-3 sm:px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors">Export CSV</button><button onclick="openModal('client')" class="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30 border border-gray-200 dark:border-gray-600 hover:border-green-500 px-3 sm:px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors">+ Add Client</button></div></div><div class="mb-4"><input type="text" id="clientSearchInput" placeholder="Search clients..." value="${clientSearch}" oninput="clientSearch = this.value; saveSearchCursor('clientSearchInput'); clearTimeout(window.clientSearchTimer); window.clientSearchTimer = setTimeout(() => { currentPage.clients = 1; renderApp(); setTimeout(() => restoreSearchCursor('clientSearchInput'), 0); }, 300);" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm" /></div>${bulkActions}${selectAllCheckbox}<div id="clientsList" class="grid gap-4">${clientsList}</div>${pagination}</div>`;
}

console.log('✅ Clients module loaded');

// ═══════════════════════════════════════════════════════════════════
// CLIENT QUICK-VIEW
// Call from anywhere: openClientQuickView(clientId)
// ═══════════════════════════════════════════════════════════════════

function openClientQuickView(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    // Gather all client data
    const clientQuotes = quotes.filter(q => q.client_id === clientId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const clientInvoices = invoices.filter(i => i.client_id === clientId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const clientJobs = jobs.filter(j => j.client_id === clientId).sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
    const clientExpenses = expenses.filter(e => e.client_id === clientId);
    const notes = (window.clientNotes || []).filter(n => n.client_id === clientId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Calculate stats
    const totalSpent = clientInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + parseFloat(i.total || 0), 0);
    const totalOutstanding = clientInvoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + parseFloat(i.total || 0), 0);
    const totalQuoteValue = clientQuotes.reduce((sum, q) => sum + parseFloat(q.total || 0), 0);
    const wonQuotes = clientQuotes.filter(q => q.accepted || q.status === 'accepted' || q.status === 'won');
    const lostQuotes = clientQuotes.filter(q => q.status === 'lost' || q.status === 'declined');
    const pendingQuotes = clientQuotes.filter(q => q.status === 'pending' && !q.accepted);
    const winRate = clientQuotes.length > 0 ? ((wonQuotes.length / clientQuotes.length) * 100).toFixed(0) : 0;
    const totalExpenseValue = clientExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const profitOnClient = totalSpent - totalExpenseValue;
    
    // Build timeline (quotes + invoices + jobs merged, sorted by date)
    const timeline = [];
    
    clientQuotes.forEach(q => {
        let statusBadge = '';
        let statusColor = '';
        if (q.accepted || q.status === 'accepted' || q.status === 'won') {
            statusBadge = 'Won'; statusColor = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        } else if (q.status === 'lost' || q.status === 'declined') {
            statusBadge = 'Lost'; statusColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        } else {
            statusBadge = 'Pending'; statusColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
        timeline.push({
            date: new Date(q.created_at),
            type: 'quote',
            icon: '📝',
            title: q.title || 'Quote',
            amount: parseFloat(q.total || 0),
            statusBadge,
            statusColor,
            id: q.id,
            clickAction: `switchTab('quotes'); setTimeout(() => { const q = quotes.find(x => x.id === '${q.id}'); if (q) openQuoteDetail(q); }, 100); closeClientQuickView();`
        });
    });
    
    clientInvoices.forEach(inv => {
        let statusBadge = '';
        let statusColor = '';
        if (inv.status === 'paid') {
            statusBadge = 'Paid'; statusColor = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        } else {
            const dueDate = inv.due_date ? new Date(inv.due_date) : null;
            const isOverdue = dueDate && dueDate < new Date();
            if (isOverdue) {
                statusBadge = 'Overdue'; statusColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            } else {
                statusBadge = 'Unpaid'; statusColor = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            }
        }
        timeline.push({
            date: new Date(inv.created_at),
            type: 'invoice',
            icon: '💰',
            title: inv.invoice_number || inv.title || 'Invoice',
            amount: parseFloat(inv.total || 0),
            statusBadge,
            statusColor,
            id: inv.id,
            clickAction: `switchTab('invoices'); setTimeout(() => { const inv = invoices.find(x => x.id === '${inv.id}'); if (inv) openInvoiceDetail(inv); }, 100); closeClientQuickView();`
        });
    });
    
    clientJobs.forEach(j => {
        const jobDate = j.date ? new Date(j.date) : new Date(j.created_at);
        const isPast = jobDate < new Date();
        timeline.push({
            date: jobDate,
            type: 'job',
            icon: '🔨',
            title: j.title || 'Job',
            amount: null,
            statusBadge: isPast ? 'Completed' : 'Upcoming',
            statusColor: isPast ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            id: j.id,
            clickAction: `switchTab('schedule'); closeClientQuickView();`
        });
    });
    
    timeline.sort((a, b) => b.date - a.date);
    
    // Render the quick-view
    const overlay = document.createElement('div');
    overlay.id = 'client-quick-view';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-end';
    overlay.onclick = (e) => { if (e.target === overlay) closeClientQuickView(); };
    
    overlay.innerHTML = `
        <div class="w-full max-w-lg bg-white dark:bg-gray-800 h-full overflow-y-auto shadow-2xl animate-slide-in" style="animation: slideInRight 0.3s ease-out;">
            
            <!-- Header -->
            <div class="sticky top-0 bg-black text-white p-5 z-10 border-b-4 border-teal-400">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-xs text-teal-400 font-medium uppercase tracking-wider mb-1">Client Profile</div>
                        <h2 class="text-xl font-bold">${client.name}</h2>
                    </div>
                    <button onclick="closeClientQuickView()" class="text-gray-400 hover:text-white text-2xl leading-none p-1">&times;</button>
                </div>
                
                <!-- Contact Info -->
                <div class="mt-3 space-y-1">
                    ${client.email ? `<div class="flex items-center gap-2 text-sm text-gray-300">
                        <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <a href="mailto:${client.email}" class="hover:text-teal-400 transition-colors">${client.email}</a>
                    </div>` : ''}
                    ${client.phone ? `<div class="flex items-center gap-2 text-sm text-gray-300">
                        <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <a href="tel:${client.phone}" class="hover:text-teal-400 transition-colors">${client.phone}</a>
                    </div>` : ''}
                    ${client.address ? `<div class="flex items-center gap-2 text-sm text-gray-300">
                        <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        ${client.address}
                    </div>` : ''}
                </div>
            </div>
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-2 gap-3 p-5">
                <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                    <div class="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Total Paid</div>
                    <div class="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">$${totalSpent.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
                </div>
                <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 text-center">
                    <div class="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Outstanding</div>
                    <div class="text-2xl font-bold text-orange-700 dark:text-orange-400 mt-1">$${totalOutstanding.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
                    <div class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Win Rate</div>
                    <div class="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">${winRate}%</div>
                    <div class="text-xs text-blue-500 dark:text-blue-500 mt-1">${wonQuotes.length}/${clientQuotes.length} quotes</div>
                </div>
                <div class="${profitOnClient >= 0 ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} border rounded-xl p-4 text-center">
                    <div class="text-xs font-semibold ${profitOnClient >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'} uppercase tracking-wider">Profit</div>
                    <div class="text-2xl font-bold ${profitOnClient >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-red-700 dark:text-red-400'} mt-1">$${Math.abs(profitOnClient).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
                    <div class="text-xs ${profitOnClient >= 0 ? 'text-teal-500' : 'text-red-500'} mt-1">${totalExpenseValue > 0 ? '$' + totalExpenseValue.toLocaleString() + ' expenses' : 'No expenses'}</div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="px-5 pb-4">
                <div class="flex gap-2">
                    <button onclick="closeClientQuickView(); openQuoteForClient(${JSON.stringify(client).replace(/"/g, '&quot;')});" class="flex-1 px-4 py-2 bg-black text-white border border-teal-400 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">+ New Quote</button>
                    <button onclick="closeClientQuickView(); openModal('invoice');" class="flex-1 px-4 py-2 bg-black text-white border border-teal-400 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">+ New Invoice</button>
                    <button onclick="closeClientQuickView(); openModal('client', ${JSON.stringify(client).replace(/"/g, '&quot;')});" class="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">Edit</button>
                </div>
            </div>
            
            ${client.notes ? `
            <div class="px-5 pb-4">
                <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div class="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1">📝 Notes</div>
                    <div class="text-sm text-gray-700 dark:text-gray-300">${client.notes}</div>
                </div>
            </div>
            ` : ''}
            
            <!-- Activity Timeline -->
            <div class="px-5 pb-6">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">History</h3>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${timeline.length} items</div>
                </div>
                
                ${timeline.length === 0 ? `
                    <div class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                        No quotes, invoices, or jobs yet
                    </div>
                ` : `
                    <div class="space-y-2">
                        ${timeline.map(item => `
                            <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border border-gray-100 dark:border-gray-700" onclick="${item.clickAction}">
                                <div class="text-xl flex-shrink-0">${item.icon}</div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm font-medium text-gray-900 dark:text-white truncate">${item.title}</span>
                                        <span class="px-2 py-0.5 rounded-full text-xs font-medium ${item.statusColor} whitespace-nowrap">${item.statusBadge}</span>
                                    </div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                                ${item.amount !== null ? `<div class="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">$${item.amount.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
            
            ${notes.length > 0 ? `
            <!-- Communication Notes -->
            <div class="px-5 pb-6">
                <h3 class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-3">Communication Notes</h3>
                <div class="space-y-2">
                    ${notes.slice(0, 5).map(n => `
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div class="text-sm text-gray-700 dark:text-gray-300">${n.note_text || n.content || ''}</div>
                            <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">${new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
        </div>
    `;
    
    // Add slide-in animation
    if (!document.getElementById('client-quickview-style')) {
        const style = document.createElement('style');
        style.id = 'client-quickview-style';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); }
                to { transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove existing quick-view if open
    const existing = document.getElementById('client-quick-view');
    if (existing) existing.remove();
    
    document.body.appendChild(overlay);
}

function closeClientQuickView() {
    const overlay = document.getElementById('client-quick-view');
    if (overlay) {
        const panel = overlay.querySelector('div');
        if (panel) {
            panel.style.animation = 'slideOutRight 0.2s ease-in';
            setTimeout(() => overlay.remove(), 200);
        } else {
            overlay.remove();
        }
    }
}
