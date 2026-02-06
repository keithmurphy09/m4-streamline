// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Recurring Invoices Module
// ═══════════════════════════════════════════════════════════════════

// Render recurring invoices view
function renderRecurringInvoices() {
    const activeRecurring = (recurringInvoices || []).filter(r => r.status === 'active');
    const pausedRecurring = (recurringInvoices || []).filter(r => r.status === 'paused');
    
    // Add filter tabs for navigation
    const filterTabs = `
        <div class="flex flex-wrap gap-2 mb-6">
            <button onclick="invoiceFilter='unpaid'; currentPage.invoices=1; renderApp();" class="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 border transition-colors">
                ← Back to Unpaid
            </button>
            <button onclick="invoiceFilter='paid'; currentPage.invoices=1; renderApp();" class="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 border transition-colors">
                Paid Invoices
            </button>
            <button onclick="invoiceFilter='monthly'; currentPage.invoices=1; renderApp();" class="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 border transition-colors">
                Monthly View
            </button>
        </div>
    `;
    
    return `
        <div class="space-y-6">
            ${filterTabs}
            
            <!-- Header -->
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Recurring Invoices</h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Automatically generate invoices on a schedule</p>
                </div>
                <button onclick="openRecurringInvoiceModal()" class="px-4 py-2 bg-black text-white border border-teal-400 rounded-lg hover:bg-gray-900 font-medium">
                    + New Recurring Invoice
                </button>
            </div>
            
            ${activeRecurring.length === 0 && pausedRecurring.length === 0 ? `
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div class="text-4xl mb-4">🔄</div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Recurring Invoices Yet</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">Set up automatic invoicing for retainer clients or subscriptions</p>
                    <button onclick="openRecurringInvoiceModal()" class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                        Create Your First Recurring Invoice
                    </button>
                </div>
            ` : `
                <!-- Active Recurring Invoices -->
                ${activeRecurring.length > 0 ? `
                    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                            <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase">Active (${activeRecurring.length})</h3>
                        </div>
                        <div class="divide-y divide-gray-100 dark:divide-gray-700">
                            ${activeRecurring.map(r => renderRecurringInvoiceCard(r)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Paused Recurring Invoices -->
                ${pausedRecurring.length > 0 ? `
                    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                            <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase">Paused (${pausedRecurring.length})</h3>
                        </div>
                        <div class="divide-y divide-gray-100 dark:divide-gray-700">
                            ${pausedRecurring.map(r => renderRecurringInvoiceCard(r)).join('')}
                        </div>
                    </div>
                ` : ''}
            `}
        </div>
    `;
}

// Render individual recurring invoice card
function renderRecurringInvoiceCard(recurring) {
    const client = clients.find(c => c.id === recurring.client_id);
    const nextDate = new Date(recurring.next_date);
    const daysUntil = Math.ceil((nextDate - new Date()) / (1000 * 60 * 60 * 24));
    
    const frequencyLabels = {
        'weekly': 'Weekly',
        'biweekly': 'Every 2 weeks',
        'monthly': 'Monthly',
        'quarterly': 'Every 3 months',
        'yearly': 'Yearly'
    };
    
    return `
        <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">${recurring.title}</h4>
                        <span class="px-2 py-0.5 text-xs font-medium rounded ${recurring.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}">
                            ${recurring.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="font-medium">Client:</span>
                            <span>${client?.name || 'Unknown'}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-medium">Frequency:</span>
                            <span>${frequencyLabels[recurring.frequency] || recurring.frequency}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-medium">Next Invoice:</span>
                            <span class="${daysUntil <= 3 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}">${nextDate.toLocaleDateString()} ${daysUntil > 0 ? `(in ${daysUntil} days)` : daysUntil === 0 ? '(Today!)' : '(Overdue)'}</span>
                        </div>
                        ${recurring.end_date ? `
                            <div class="flex items-center gap-2">
                                <span class="font-medium">Ends:</span>
                                <span>${new Date(recurring.end_date).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="flex items-start gap-4 ml-4">
                    <div class="text-right">
                        <div class="text-2xl font-bold text-gray-900 dark:text-white">$${recurring.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">${frequencyLabels[recurring.frequency]}</div>
                    </div>
                    <div class="flex flex-col gap-2">
                        ${recurring.status === 'active' ? `
                            <button onclick="pauseRecurringInvoice('${recurring.id}')" class="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700">
                                Pause
                            </button>
                        ` : `
                            <button onclick="resumeRecurringInvoice('${recurring.id}')" class="px-3 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700">
                                Resume
                            </button>
                        `}
                        <button onclick="editRecurringInvoice('${recurring.id}')" class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                            Edit
                        </button>
                        <button onclick="deleteRecurringInvoice('${recurring.id}')" class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Open recurring invoice modal
function openRecurringInvoiceModal(recurring = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto';
    modalContent.onclick = (e) => e.stopPropagation();
    
    const clientOptions = clients.map(c => `<option value="${c.id}" ${recurring?.client_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('');
    
    modalContent.innerHTML = `
        <div class="p-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">${recurring ? 'Edit' : 'New'} Recurring Invoice</h2>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client *</label>
                    <select id="recurring_client_id" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                        <option value="">Select Client...</option>
                        ${clientOptions}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title/Description *</label>
                    <input type="text" id="recurring_title" value="${recurring?.title || ''}" placeholder="e.g., Monthly Retainer, Subscription Fee" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount *</label>
                        <input type="number" id="recurring_amount" value="${recurring?.amount || ''}" step="0.01" min="0" placeholder="0.00" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency *</label>
                        <select id="recurring_frequency" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                            <option value="weekly" ${recurring?.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                            <option value="biweekly" ${recurring?.frequency === 'biweekly' ? 'selected' : ''}>Every 2 Weeks</option>
                            <option value="monthly" ${recurring?.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                            <option value="quarterly" ${recurring?.frequency === 'quarterly' ? 'selected' : ''}>Every 3 Months</option>
                            <option value="yearly" ${recurring?.frequency === 'yearly' ? 'selected' : ''}>Yearly</option>
                        </select>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date *</label>
                        <input type="date" id="recurring_start_date" value="${recurring?.start_date || new Date().toISOString().split('T')[0]}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date (Optional)</label>
                        <input type="date" id="recurring_end_date" value="${recurring?.end_date || ''}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Terms (Days)</label>
                    <input type="number" id="recurring_payment_terms" value="${recurring?.payment_terms || 30}" min="0" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Invoice due date will be this many days after generation</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
                    <textarea id="recurring_notes" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">${recurring?.notes || ''}</textarea>
                </div>
            </div>
            
            <div class="flex gap-3 justify-end mt-6">
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium">
                    Cancel
                </button>
                <button onclick="saveRecurringInvoice(${recurring ? "'" + recurring.id + "'" : 'null'})" class="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-medium">
                    ${recurring ? 'Update' : 'Create'} Recurring Invoice
                </button>
            </div>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Save recurring invoice
async function saveRecurringInvoice(id) {
    const client_id = document.getElementById('recurring_client_id').value;
    const title = document.getElementById('recurring_title').value;
    const amount = parseFloat(document.getElementById('recurring_amount').value);
    const frequency = document.getElementById('recurring_frequency').value;
    const start_date = document.getElementById('recurring_start_date').value;
    const end_date = document.getElementById('recurring_end_date').value || null;
    const payment_terms = parseInt(document.getElementById('recurring_payment_terms').value) || 30;
    const notes = document.getElementById('recurring_notes').value;
    
    if (!client_id || !title || !amount || !frequency || !start_date) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Calculate next date
    const next_date = calculateNextRecurringDate(start_date, frequency);
    
    const recurringData = {
        client_id,
        title,
        amount,
        frequency,
        start_date,
        end_date,
        next_date,
        payment_terms,
        notes,
        status: 'active',
        user_id: currentUser.id
    };
    
    try {
        isLoading = true;
        loadingMessage = id ? 'Updating recurring invoice...' : 'Creating recurring invoice...';
        renderApp();
        
        if (id) {
            const { data, error } = await supabaseClient
                .from('recurring_invoices')
                .update(recurringData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            const index = recurringInvoices.findIndex(r => r.id === id);
            if (index !== -1) recurringInvoices[index] = data[0];
        } else {
            const { data, error } = await supabaseClient
                .from('recurring_invoices')
                .insert([recurringData])
                .select();
            
            if (error) throw error;
            recurringInvoices.push(data[0]);
        }
        
        document.querySelector('.fixed').remove();
        showNotification(`Recurring invoice ${id ? 'updated' : 'created'} successfully!`, 'success');
    } catch (error) {
        console.error('Error saving recurring invoice:', error);
        showNotification('Failed to save recurring invoice: ' + error.message, 'error');
    } finally {
        isLoading = false;
        renderApp();
    }
}

// Calculate next recurring date
function calculateNextRecurringDate(currentDate, frequency) {
    const date = new Date(currentDate);
    
    switch(frequency) {
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'biweekly':
            date.setDate(date.getDate() + 14);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }
    
    return date.toISOString().split('T')[0];
}

// Pause recurring invoice
async function pauseRecurringInvoice(id) {
    try {
        const { error } = await supabaseClient
            .from('recurring_invoices')
            .update({ status: 'paused' })
            .eq('id', id);
        
        if (error) throw error;
        
        const index = recurringInvoices.findIndex(r => r.id === id);
        if (index !== -1) recurringInvoices[index].status = 'paused';
        
        showNotification('Recurring invoice paused', 'success');
        renderApp();
    } catch (error) {
        console.error('Error pausing recurring invoice:', error);
        showNotification('Failed to pause recurring invoice', 'error');
    }
}

// Resume recurring invoice
async function resumeRecurringInvoice(id) {
    try {
        const { error } = await supabaseClient
            .from('recurring_invoices')
            .update({ status: 'active' })
            .eq('id', id);
        
        if (error) throw error;
        
        const index = recurringInvoices.findIndex(r => r.id === id);
        if (index !== -1) recurringInvoices[index].status = 'active';
        
        showNotification('Recurring invoice resumed', 'success');
        renderApp();
    } catch (error) {
        console.error('Error resuming recurring invoice:', error);
        showNotification('Failed to resume recurring invoice', 'error');
    }
}

// Edit recurring invoice
function editRecurringInvoice(id) {
    const recurring = recurringInvoices.find(r => r.id === id);
    if (recurring) {
        openRecurringInvoiceModal(recurring);
    }
}

// Delete recurring invoice
async function deleteRecurringInvoice(id) {
    if (!confirm('Delete this recurring invoice? This will not affect invoices already generated.')) {
        return;
    }
    
    try {
        isLoading = true;
        loadingMessage = 'Deleting recurring invoice...';
        renderApp();
        
        const { error } = await supabaseClient
            .from('recurring_invoices')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        recurringInvoices = recurringInvoices.filter(r => r.id !== id);
        showNotification('Recurring invoice deleted', 'success');
    } catch (error) {
        console.error('Error deleting recurring invoice:', error);
        showNotification('Failed to delete recurring invoice', 'error');
    } finally {
        isLoading = false;
        renderApp();
    }
}

console.log('✅ Recurring Invoices module loaded');
