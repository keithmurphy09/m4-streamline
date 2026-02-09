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
            
            // Get client notes (communication history)
            const clientNotesList = window.clientNotes ? window.clientNotes.filter(n => n.client_id === c.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [];
            const notesHTML = clientNotesList.length > 0 ? `
                <div class="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">📞 Communication History</p>
                    ${clientNotesList.slice(0, 3).map(note => {
                        const noteDate = new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                        let contextLabel = '';
                        if (note.related_type === 'quote') {
                            const quote = quotes.find(q => q.id === note.related_id);
                            contextLabel = quote ? `<span class="text-xs text-blue-600 dark:text-blue-400">Quote: ${quote.title}</span>` : '';
                        } else if (note.related_type === 'invoice') {
                            const invoice = invoices.find(i => i.id === note.related_id);
                            contextLabel = invoice ? `<span class="text-xs text-teal-600 dark:text-teal-400">Invoice: ${invoice.title}</span>` : '';
                        }
                        return `<div class="bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-xs mb-2">
                            <div class="flex justify-between items-start gap-2 mb-1">
                                <span class="text-gray-500 dark:text-gray-400">${noteDate}</span>
                                <button onclick="deleteClientNote('${note.id}')" class="text-red-500 hover:text-red-700 text-xs">×</button>
                            </div>
                            ${contextLabel ? `<div class="mb-1">${contextLabel}</div>` : ''}
                            <p class="text-gray-700 dark:text-gray-300">${note.note_text}</p>
                        </div>`;
                    }).join('')}
                    ${clientNotesList.length > 3 ? `<p class="text-xs text-gray-500 dark:text-gray-400 italic">+ ${clientNotesList.length - 3} more note${clientNotesList.length - 3 > 1 ? 's' : ''}</p>` : ''}
                </div>
            ` : '';
            
            return `<div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow ${isSelected ? 'ring-2 ring-blue-400' : ''}">
                <div class="flex gap-3">
                    <div class="flex items-start pt-1">
                        <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelection('clients', '${c.id}')" class="w-5 h-5 text-blue-600 rounded">
                    </div>
                    <div class="flex-1">
                        <div class="flex flex-col sm:flex-row sm:justify-between gap-3">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold dark:text-white dark:text-white">${c.name}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-300">${c.email}</p>
                                <p class="text-sm text-gray-600 dark:text-gray-300">${c.phone}</p>
                                ${c.address ? `<p class="text-sm text-gray-600 dark:text-gray-300 mt-1">📍 ${c.address}</p>` : ''}
                                ${c.notes ? `<p class="text-sm text-gray-700 italic mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded dark:bg-yellow-900/20 dark:border-yellow-600">📝 ${c.notes}</p>` : ''}
                                ${notesHTML}
                            </div>
                            <div class="flex sm:flex-col gap-2">
                                <button onclick='openQuoteForClient(${JSON.stringify(c).replace(/"/g, "&quot;")})' class="flex-1 sm:w-24 px-3 py-1 bg-teal-600 text-white rounded text-sm whitespace-nowrap">New Quote</button>
                                <button onclick='openModal("client", ${JSON.stringify(c).replace(/"/g, "&quot;")})' class="flex-1 sm:w-24 px-3 py-1 bg-blue-600 text-white rounded text-sm">Edit</button>
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
    
    return `<div><div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6"><h2 class="text-2xl font-bold dark:text-teal-400">Clients</h2><div class="flex flex-wrap gap-2"><button onclick="exportToCSV('clients')" class="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 text-sm whitespace-nowrap">Export CSV</button><button onclick="openModal('client')" class="bg-black text-white px-3 sm:px-4 py-2 rounded-lg border border-teal-400 text-sm whitespace-nowrap">+ Add Client</button></div></div><div class="mb-4"><input type="text" id="clientSearchInput" placeholder="Search clients..." value="${clientSearch}" oninput="clientSearch = this.value; clearTimeout(window.clientSearchTimer); window.clientSearchTimer = setTimeout(() => { currentPage.clients = 1; renderApp(); setTimeout(() => document.getElementById('clientSearchInput')?.focus(), 0); }, 300);" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm" /></div>${bulkActions}${selectAllCheckbox}<div id="clientsList" class="grid gap-4">${clientsList}</div>${pagination}</div>`;
}

console.log('✅ Clients module loaded');
