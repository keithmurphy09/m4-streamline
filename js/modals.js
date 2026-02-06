// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Modal System Module
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// MODAL CONTROL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function openModal(type, item = null) {
    modalType = type;
    editingItem = item;
    showModal = true;
    if (type === 'quote') quoteItems = item?.items || [{ description: '', quantity: 1, price: 0 }];
    renderApp();
    if (type === 'quote') setTimeout(renderQuoteItems, 100);
    
    // Initialize address autocomplete for any address fields - with delay for modal rendering
    setTimeout(() => initAllAddressAutocomplete(), 500);
}

function closeModal() {
    showModal = false;
    editingItem = null;
    modalType = '';
    
    // Clear Google Maps autocomplete tracking
    if (typeof clearInitializedFields === 'function') {
        clearInitializedFields();
    }
    
    renderApp();
}

function openQuoteForClient(client) {
    editingItem = { client_id: client.id };
    modalType = 'quote';
    quoteItems = [{ description: '', quantity: 1, price: 0 }];
    showModal = true;
    renderApp();
    setTimeout(renderQuoteItems, 100);
    
    // Initialize autocomplete with delay for quote modal
    setTimeout(() => initAllAddressAutocomplete(), 500);
}

function openJobFromQuote(quote) {
    const today = new Date().toISOString().split('T')[0];
    editingItem = {
        client_id: quote.client_id,
        title: quote.title,
        date: today,
        time: '06:00',
        notes: `Quote: ${quote.title} - Total: $${quote.total.toFixed(2)}\n\n${quote.notes || ''}`
    };
    modalType = 'job';
    showModal = true;
    renderApp();
    
    // Initialize autocomplete with delay for job modal
    setTimeout(() => initAllAddressAutocomplete(), 500);
}

function viewJobExpenses(jobId, jobTitle) {
    modalType = 'job_expenses';
    editingItem = { jobId, jobTitle };
    showModal = true;
    renderApp();
}

// ═══════════════════════════════════════════════════════════════════
// MODAL RENDERING
// ═══════════════════════════════════════════════════════════════════

function renderModal() {
    if (!showModal) return '';
    
    let form = '';
    let title = modalType.charAt(0).toUpperCase() + modalType.slice(1);
    
    // CLIENT MODAL
    if (modalType === 'client') {
        const name = editingItem?.name || '';
        const email = editingItem?.email || '';
        const phone = editingItem?.phone || '';
        const address = editingItem?.address || '';
        const notes = editingItem?.notes || '';
        const buttonText = editingItem ? 'Update Client' : 'Add Client';
        const action = editingItem ? `updateClient('${editingItem.id}')` : `addClient()`;
        
        title = editingItem ? 'Edit Client' : 'Add Client';
        form = `
            <input type="text" id="client_name" placeholder="Name *" value="${name}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3" required>
            <input type="email" id="client_email" placeholder="Email *" value="${email}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3" required>
            <input type="tel" id="client_phone" placeholder="Phone *" value="${phone}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3" required>
            <input type="text" id="client_address" placeholder="Address" value="${address}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3">
            <textarea id="client_notes" placeholder="Internal notes (only visible to you)" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3" rows="3">${notes}</textarea>
            <button onclick="${action}" class="w-full bg-black text-white px-4 py-2 rounded border border-teal-400">${buttonText}</button>
        `;
    }
    
    // JOB MODAL
    if (modalType === 'job') {
        const clientId = editingItem?.client_id || '';
        const jobTitle = editingItem?.title || '';
        const date = editingItem?.date || '';
        const time = editingItem?.time || '06:00';
        const duration = editingItem?.duration || 1;
        const notes = editingItem?.notes || '';
        const status = editingItem?.status || 'scheduled';
        const assignedTeam = editingItem?.assigned_team_members || [];
        const buttonText = (editingItem && editingItem.id) ? 'Update Job' : 'Schedule Job';
        const action = (editingItem && editingItem.id) ? `updateJob('${editingItem.id}')` : `saveJob()`;
        
        const workerCheckboxes = getAccountType() === 'business' && teamMembers.length > 0 
            ? `<div class="mb-3">
                <label class="block text-sm font-medium mb-2 dark:text-gray-200">Assign Team Members</label>
                <div class="border rounded p-3 space-y-2 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                    ${teamMembers.map(m => {
                        const isChecked = assignedTeam.includes(m.id);
                        return `<label class="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
                            <input type="checkbox" value="${m.id}" ${isChecked ? 'checked' : ''} class="worker-checkbox" />
                            <span class="flex-1">${m.name}${m.occupation ? ` - ${m.occupation}` : ''}</span>
                            <span class="w-4 h-4 rounded-full" style="background-color: ${m.color || '#14b8a6'}"></span>
                        </label>`;
                    }).join('')}
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Select multiple team members for this job</p>
               </div>`
            : '';
        
        title = editingItem && editingItem.id ? 'Edit Job' : 'Schedule Job';
        form = `
            <select id="client_id" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3" required>
                <option value="">Select Client *</option>
                ${clients.map(c => `<option value="${c.id}" ${c.id === clientId ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
            <input type="text" id="title" placeholder="Job Title *" value="${jobTitle}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3" required>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Job Site Address</label>
                <input type="text" id="job_address" placeholder="Job site address (start typing for suggestions)" value="${editingItem?.job_address || ''}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" onchange="autoFillJobAddress()">
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Auto-fills from client address</p>
            </div>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Start Date *</label>
                <input type="date" id="date" value="${date}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required>
            </div>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Start Time</label>
                <input type="time" id="time" value="${time}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
            </div>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Duration (days)</label>
                <input type="number" id="duration" value="${duration}" min="1" max="30" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
            </div>
            ${workerCheckboxes}
            <select id="jobStatus" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3">
                <option value="scheduled" ${status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                <option value="in_progress" ${status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
            <textarea id="notes" placeholder="Notes (optional)" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3" rows="3">${notes}</textarea>
            <button onclick="${action}" class="w-full bg-black text-white px-4 py-2 rounded border border-teal-400">${buttonText}</button>
        `;
    }
    
    // QUOTE MODAL
    if (modalType === 'quote') {
        const clientId = editingItem?.client_id || '';
        const quoteTitle = editingItem?.title || '';
        const notes = editingItem?.notes || '';
        const jobAddress = editingItem?.job_address || '';
        const includeGst = editingItem?.include_gst || false;
        const depositPercentage = editingItem?.deposit_percentage || 0;
        const paymentTerms = editingItem?.payment_terms || 'Full payment (COD) to be paid on completion';
        const isEditing = editingItem && editingItem.id;
        const buttonText = isEditing ? 'Update Quote' : 'Create Quote';
        
        if (isEditing) {
            quoteItems = editingItem.items || [{ description: '', quantity: 1, price: 0 }];
        }
        
        const displayQuoteNumber = isEditing ? quoteTitle : `QT-${String(quotes.length + 1).padStart(3, '0')}`;
        
        title = isEditing ? 'Edit Quote' : 'Create Quote';
        form = `
            <select id="client_id" onchange="autoFillJobAddress()" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3" required>
                <option value="">Select Client *</option>
                ${clients.map(c => `<option value="${c.id}" ${c.id === clientId ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Quote/PO Number</label>
                <input type="text" id="title" value="${displayQuoteNumber}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Auto-generated, but you can edit it</p>
            </div>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Job Address</label>
                <input type="text" id="job_address" placeholder="Job site address (start typing for suggestions)" value="${jobAddress}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Defaults to client address</p>
            </div>
            <div id="items-list"></div>
            <button onclick="addQuoteItem()" class="text-teal-500 text-sm mb-3">+ Add Item</button>
            <div id="quote-total" class="font-bold mb-3">Total: $0</div>
            <div class="mb-3">
                <label class="flex items-center cursor-pointer">
                    <input type="checkbox" id="include_gst" ${includeGst ? 'checked' : ''} onchange="updateQuoteTotal()" class="mr-2">
                    <span class="text-sm font-medium dark:text-gray-200">Include GST (10%)</span>
                </label>
            </div>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-2 dark:text-gray-200">Deposit Required</label>
                <input type="hidden" id="deposit_percentage" value="${depositPercentage}">
                <div class="flex gap-2 flex-wrap">
                    <button type="button" onclick="setDeposit(0)" class="px-4 py-2 border rounded text-sm ${depositPercentage === 0 ? 'bg-black text-white border-teal-400' : 'bg-white text-black border-gray-300'}">0% (COD)</button>
                    <button type="button" onclick="setDeposit(30)" class="px-4 py-2 border rounded text-sm ${depositPercentage === 30 ? 'bg-black text-white border-teal-400' : 'bg-white text-black border-gray-300'}">30%</button>
                    <button type="button" onclick="setDeposit(40)" class="px-4 py-2 border rounded text-sm ${depositPercentage === 40 ? 'bg-black text-white border-teal-400' : 'bg-white text-black border-gray-300'}">40%</button>
                    <button type="button" onclick="setDeposit(50)" class="px-4 py-2 border rounded text-sm ${depositPercentage === 50 ? 'bg-black text-white border-teal-400' : 'bg-white text-black border-gray-300'}">50%</button>
                </div>
            </div>
            <div id="deposit-amount" class="text-sm text-gray-600 dark:text-gray-300 mb-3"></div>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Payment Terms</label>
                <textarea id="payment_terms" placeholder="Payment terms" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" rows="2">${paymentTerms}</textarea>
            </div>
            <textarea id="notes" placeholder="Notes (optional)" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3" rows="3">${notes}</textarea>
            <button onclick="${isEditing ? `updateQuote('${editingItem.id}')` : 'saveQuote()'}" class="w-full bg-black text-white px-4 py-2 rounded border border-teal-400">${buttonText}</button>
        `;
    }
    
    // INVOICE MODAL
    if (modalType === 'invoice') {
        const invTitle = editingItem?.title || '';
        const invoiceNumber = editingItem?.invoice_number || '';
        const issueDate = editingItem?.issue_date || new Date().toISOString().split('T')[0];
        const dueDate = editingItem?.due_date || '';
        const notes = editingItem?.notes || '';
        
        title = 'Edit Invoice';
        form = `
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Invoice Number</label>
                <input type="text" id="invoice_number" value="${invoiceNumber}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" readonly>
            </div>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Title</label>
                <input type="text" id="title" value="${invTitle}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
            </div>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Issue Date</label>
                <input type="date" id="issue_date" value="${issueDate}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
            </div>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Due Date</label>
                <input type="date" id="due_date" value="${dueDate}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
            </div>
            <textarea id="notes" placeholder="Notes (optional)" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3" rows="3">${notes}</textarea>
            <button onclick="updateInvoiceDetails('${editingItem.id}')" class="w-full bg-black text-white px-4 py-2 rounded border border-teal-400">Update Invoice</button>
        `;
    }
    
    // EXPENSE MODAL
    if (modalType === 'expense') {
        const date = editingItem?.date || new Date().toISOString().split('T')[0];
        const amount = editingItem?.amount || '';
        const category = editingItem?.category || 'Materials';
        const description = editingItem?.description || '';
        const team_member_id = editingItem?.team_member_id || '';
        const job_id_raw = editingItem?.job_id || '';
        
        let job_id = '';
        if (job_id_raw) {
            job_id = `job_${job_id_raw}`;
        } else if (editingItem && description) {
            const match = description.match(/\[Related to: ([^\]]+)\]/);
            if (match) {
                const relatedText = match[1];
                const matchingQuote = quotes.find(q => relatedText.includes(q.title));
                if (matchingQuote) {
                    job_id = `quote_${matchingQuote.id}`;
                } else {
                    const matchingJob = jobs.find(j => relatedText.includes(j.title));
                    if (matchingJob) {
                        job_id = `job_${matchingJob.id}`;
                    }
                }
            }
        }
        
        const categories = ['Materials', 'Fuel', 'Equipment', 'Subcontractors', 'Office Supplies', 'Insurance', 'Marketing', 'Other'];
        const buttonText = editingItem ? 'Update Expense' : 'Add Expense';
        const action = editingItem ? `updateExpense('${editingItem.id}')` : `saveExpense()`;
        
        const jobOptions = [];
        quotes.forEach(q => {
            const client = clients.find(c => c.id === q.client_id);
            jobOptions.push({
                id: `quote_${q.id}`,
                display: `${q.title}${client ? ' - ' + client.name : ''} (Quote)`,
                date: q.created_at || q.date
            });
        });
        jobs.forEach(j => {
            const client = clients.find(c => c.id === j.client_id);
            jobOptions.push({
                id: `job_${j.id}`,
                display: `${j.title}${client ? ' - ' + client.name : ''} (Scheduled)`,
                date: j.date
            });
        });
        jobOptions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const teamMemberDropdown = getAccountType() === 'business' 
            ? `<div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Team Member (Optional)</label>
                <select id="team_member_id" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <option value="">No specific team member</option>
                    ${teamMembers.map(m => `<option value="${m.id}" ${m.id === team_member_id ? 'selected' : ''}>${m.name}${m.occupation ? ' - ' + m.occupation : ''}</option>`).join('')}
                </select>
               </div>`
            : '';
        
        title = editingItem ? 'Edit Expense' : 'Add Expense';
        form = `
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Date *</label>
                <input type="date" id="expense_date" value="${date}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required>
            </div>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Amount *</label>
                <input type="number" id="amount" placeholder="0.00" value="${amount}" step="0.01" min="0" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required>
            </div>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Category *</label>
                <select id="category" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required>
                    ${categories.map(c => `<option value="${c}" ${c === category ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Related Job/Quote (Optional)</label>
                <select id="job_id" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <option value="">No specific job</option>
                    ${jobOptions.map(opt => `<option value="${opt.id}" ${opt.id === job_id ? 'selected' : ''}>${opt.display}</option>`).join('')}
                </select>
            </div>
            ${teamMemberDropdown}
            <div class="mb-3">
                <label class="block text-sm font-medium mb-1 dark:text-gray-200">Description</label>
                <textarea id="description" placeholder="Expense description" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" rows="3">${description}</textarea>
            </div>
            <button onclick="${action}" class="w-full bg-black text-white px-4 py-2 rounded border border-teal-400">${buttonText}</button>
        `;
    }
    
    // JOB EXPENSES VIEW MODAL
    if (modalType === 'job_expenses') {
        const jobId = editingItem?.jobId;
        const jobTitle = editingItem?.jobTitle;
        const jobExpensesList = expenses.filter(e => e.job_id === jobId);
        const totalExpenses = jobExpensesList.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        
        title = `Expenses for ${jobTitle}`;
        form = `
            <div class="space-y-4">
                <div class="bg-blue-50 dark:bg-blue-900 p-3 rounded border-l-4 border-blue-500">
                    <p class="text-sm font-medium dark:text-gray-200">Job: <span class="font-bold">${jobTitle}</span></p>
                    <p class="text-sm dark:text-gray-200">Total Expenses: <span class="font-bold text-red-600">$${totalExpenses.toFixed(2)}</span></p>
                </div>
                ${jobExpensesList.length === 0 ? '<p class="text-gray-500 dark:text-gray-400 text-center py-8">No expenses recorded for this job yet</p>' : ''}
                <div class="space-y-3">
                    ${jobExpensesList.sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => {
                        const teamMember = exp.team_member_id ? teamMembers.find(tm => tm.id === exp.team_member_id) : null;
                        return `<div class="border rounded p-3 dark:border-gray-700">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex-1">
                                    <p class="font-semibold dark:text-white">${exp.category}</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-300">${exp.description || 'No description'}</p>
                                    ${teamMember ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">👤 ${teamMember.name}</p>` : ''}
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">📅 ${new Date(exp.date).toLocaleDateString()}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-lg font-bold text-red-600">$${parseFloat(exp.amount).toFixed(2)}</p>
                                    <button onclick="closeModal(); openModal('expense', ${JSON.stringify(exp).replace(/"/g, '&quot;')})" class="text-xs text-blue-600 hover:underline mt-1">Edit</button>
                                </div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
                <button onclick="closeModal(); openModal('expense', {job_id: '${jobId}'})" class="w-full bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
                    + Add Expense to This Job
                </button>
            </div>
        `;
    }
    
    // TEAM MEMBER MODAL
    if (modalType === 'team_member') {
        const name = editingItem?.name || '';
        const email = editingItem?.email || '';
        const phone = editingItem?.phone || '';
        const occupation = editingItem?.occupation || '';
        const color = editingItem?.color || '#3b82f6';
        const buttonText = editingItem ? 'Update Team Member' : 'Add Team Member';
        const action = editingItem ? `updateTeamMember('${editingItem.id}')` : `saveTeamMember()`;
        
        title = editingItem ? 'Edit Team Member' : 'Add Team Member';
        form = `
            <input type="text" id="team_name" placeholder="Name *" value="${name}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3" required>
            <input type="email" id="team_email" placeholder="Email (optional)" value="${email}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3">
            <input type="tel" id="team_phone" placeholder="Phone (optional)" value="${phone}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3">
            <input type="text" id="team_occupation" placeholder="Occupation (e.g., Painter, Electrician)" value="${occupation}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-3">
            <div class="mb-3">
                <label class="block text-sm font-medium mb-2 dark:text-gray-200">Calendar Color</label>
                <div class="flex items-center gap-3">
                    <input type="color" id="team_color" value="${color}" class="h-10 w-20 cursor-pointer border rounded">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Choose a color for this team member's jobs</span>
                </div>
            </div>
            <button onclick="${action}" class="w-full bg-black text-white px-4 py-2 rounded border border-teal-400 hover:bg-gray-800">${buttonText}</button>
        `;
    }
    
    return `
        <div class="fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto" onclick="if(event.target===this)closeModal()">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-2xl w-full my-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between mb-4">
                    <h3 class="text-lg sm:text-xl font-bold dark:text-white">${title}</h3>
                    <button onclick="closeModal()" class="text-2xl leading-none dark:text-gray-300">×</button>
                </div>
                ${form}
            </div>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════
// QUOTE ITEMS FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function addQuoteItem() {
    quoteItems.push({ description: '', quantity: 1, price: 0 });
    renderQuoteItems();
}

function updateQuoteTotal() {
    renderQuoteItems();
}

function setDeposit(percentage) {
    document.getElementById('deposit_percentage').value = percentage;
    
    const buttons = document.querySelectorAll('[onclick^="setDeposit"]');
    buttons.forEach(btn => {
        const btnPercentage = parseInt(btn.textContent);
        if (btnPercentage === percentage || (percentage === 0 && btn.textContent.includes('COD'))) {
            btn.className = 'px-4 py-2 border rounded text-sm bg-black text-white border-teal-400';
        } else {
            btn.className = 'px-4 py-2 border rounded text-sm bg-white text-black border-gray-300';
        }
    });
    
    renderQuoteItems();
}

function renderQuoteItems() {
    const container = document.getElementById('items-list');
    if (!container) return;
    
    const items = quoteItems.map((item, index) => {
        return `
            <div class="border rounded p-3 mb-3 dark:border-gray-600">
                <input type="text" placeholder="Description *" value="${item.description}" onchange="quoteItems[${index}].description=this.value; renderQuoteItems()" class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-2">
                <div class="flex gap-2">
                    <input type="number" placeholder="Qty" value="${item.quantity}" onchange="quoteItems[${index}].quantity=parseFloat(this.value); renderQuoteItems()" class="w-20 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" min="1">
                    <input type="number" placeholder="Price" value="${item.price}" onchange="quoteItems[${index}].price=parseFloat(this.value); renderQuoteItems()" class="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" min="0" step="0.01">
                    <button onclick="quoteItems.splice(${index}, 1); renderQuoteItems()" class="px-3 py-2 text-red-600 border rounded hover:bg-red-50">×</button>
                </div>
                <div class="text-right text-sm mt-1 font-semibold dark:text-gray-200">Line: $${(item.quantity * item.price).toFixed(2)}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = items;
    
    const subtotal = quoteItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const includeGst = document.getElementById('include_gst')?.checked || false;
    const gst = includeGst ? subtotal * 0.1 : 0;
    const total = subtotal + gst;
    
    const totalContainer = document.getElementById('quote-total');
    if (totalContainer) {
        totalContainer.innerHTML = `
            <div class="space-y-1">
                <div class="flex justify-between dark:text-gray-200"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
                ${includeGst ? `<div class="flex justify-between dark:text-gray-200"><span>GST (10%):</span><span>$${gst.toFixed(2)}</span></div>` : ''}
                <div class="flex justify-between font-bold text-lg border-t pt-2 dark:text-white"><span>Total:</span><span>$${total.toFixed(2)}</span></div>
            </div>
        `;
    }
    
    const depositPercentage = parseInt(document.getElementById('deposit_percentage')?.value || 0);
    const depositAmount = total * (depositPercentage / 100);
    const depositContainer = document.getElementById('deposit-amount');
    if (depositContainer && depositPercentage > 0) {
        depositContainer.innerHTML = `Deposit amount (${depositPercentage}%): <span class="font-bold">$${depositAmount.toFixed(2)}</span>`;
    } else if (depositContainer) {
        depositContainer.innerHTML = '';
    }
}

function autoFillJobAddress() {
    const clientId = document.getElementById('client_id').value;
    const addressField = document.getElementById('job_address');
    
    if (clientId && addressField) {
        const client = clients.find(c => c.id === clientId);
        if (client && client.address && !addressField.value) {
            addressField.value = client.address;
        }
    }
}

console.log('✅ Modal system module loaded');
