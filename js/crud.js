// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - CRUD Operations Module
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// CLIENT OPERATIONS
// ═══════════════════════════════════════════════════════════════════

async function addClient() {
    const name = document.getElementById('client_name').value.trim();
    const email = document.getElementById('client_email').value.trim();
    const phone = document.getElementById('client_phone').value.trim();
    const address = document.getElementById('client_address').value.trim();
    const notes = document.getElementById('client_notes')?.value.trim() || '';
    
    if (!name || !email || !phone) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('clients')
            .insert([{ user_id: currentUser.id, name, email, phone, address, notes }])
            .select();
            
        if (error) throw error;
        
        clients.push(data[0]);
        closeModal();
        if (openedFromDashboard) {
            switchTab('clients');
        }
        showNotification('Client added successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error adding client:', error);
        showNotification('Error adding client', 'error');
    }
}

async function updateClient(id) {
    const name = document.getElementById('client_name').value.trim();
    const email = document.getElementById('client_email').value.trim();
    const phone = document.getElementById('client_phone').value.trim();
    const address = document.getElementById('client_address').value.trim();
    const notes = document.getElementById('client_notes')?.value.trim() || '';
    
    if (!name || !email || !phone) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('clients')
            .update({ name, email, phone, address, notes })
            .eq('id', id);
            
        if (error) throw error;
        
        const client = clients.find(c => c.id === id);
        if (client) {
            Object.assign(client, { name, email, phone, address, notes });
        }
        
        closeModal();
        showNotification('Client updated successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error updating client:', error);
        showNotification('Error updating client', 'error');
    }
}

async function deleteClient(id) {
    try {
        // Check for related records first
        const relatedQuotes = quotes.filter(q => q.client_id === id);
        const relatedJobs = jobs.filter(j => j.client_id === id);
        const relatedInvoices = invoices.filter(i => i.client_id === id);
        
        if (relatedQuotes.length > 0 || relatedJobs.length > 0 || relatedInvoices.length > 0) {
            const message = `Cannot delete client. They have:\n` +
                `${relatedQuotes.length} quote(s)\n` +
                `${relatedJobs.length} job(s)\n` +
                `${relatedInvoices.length} invoice(s)\n\n` +
                `Please delete these items first.`;
            showNotification(message, 'error');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this client?')) {
            return;
        }
        
        // Delete client notes first
        const { error: notesError } = await supabaseClient
            .from('client_notes')
            .delete()
            .eq('client_id', id);
        
        if (notesError) {
            console.error('Error deleting client notes:', notesError);
        }
        
        // Delete the client
        const { error } = await supabaseClient
            .from('clients')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        // Remove from local array
        const index = clients.findIndex(c => c.id === id);
        if (index > -1) clients.splice(index, 1);
        
        showNotification('Client deleted successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error deleting client:', error);
        showNotification('Error deleting client: ' + error.message, 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════
// QUOTE OPERATIONS
// ═══════════════════════════════════════════════════════════════════

function saveQuote() {
    const clientId = document.getElementById('client_id').value;
    const title = document.getElementById('title').value.trim();
    const jobAddress = document.getElementById('job_address').value.trim();
    const notes = document.getElementById('notes')?.value.trim() || '';
    const includeGst = document.getElementById('include_gst').checked;
    const depositPercentage = parseInt(document.getElementById('deposit_percentage').value) || 0;
    const paymentTerms = document.getElementById('payment_terms').value.trim();
    
    if (!clientId || !title || quoteItems.length === 0) {
        showNotification('Please fill in all required fields and add at least one item', 'error');
        return;
    }
    
    const subtotal = quoteItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const gst = includeGst ? subtotal * 0.1 : 0;
    const total = subtotal + gst;
    
    addQuote({
        client_id: clientId,
        title,
        job_address: jobAddress,
        quote_number: title,
        total,
        subtotal,
        gst,
        items: quoteItems,
        notes,
        include_gst: includeGst,
        deposit_percentage: depositPercentage,
        payment_terms: paymentTerms,
        status: 'pending'
    });
}

async function addQuote(quote) {
    try {
        // Generate a unique share token for the quote viewer link
        const shareToken = 'qt_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        const { data, error } = await supabaseClient
            .from('quotes')
            .insert([{ ...quote, user_id: currentUser.id, share_token: shareToken }])
            .select();
            
        if (error) throw error;
        
        quotes.push(data[0]);
        lastCreatedQuote = data[0];
        closeModal();
        showNotification('Quote created successfully!', 'success');
        if (openedFromDashboard) {
            switchTab('quotes');
        }
    } catch (error) {
        console.error('Error creating quote:', error);
        showNotification('Error creating quote', 'error');
    }
}

async function updateQuote(id) {
    const title = document.getElementById('title').value.trim();
    const jobAddress = document.getElementById('job_address').value.trim();
    const notes = document.getElementById('notes')?.value.trim() || '';
    const includeGst = document.getElementById('include_gst').checked;
    const depositPercentage = parseInt(document.getElementById('deposit_percentage').value) || 0;
    const paymentTerms = document.getElementById('payment_terms').value.trim();
    
    if (!title || quoteItems.length === 0) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const subtotal = quoteItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const gst = includeGst ? subtotal * 0.1 : 0;
    const total = subtotal + gst;
    
    try {
        const { error } = await supabaseClient
            .from('quotes')
            .update({
                title,
                job_address: jobAddress,
                quote_number: title,
                total,
                subtotal,
                gst,
                items: quoteItems,
                notes,
                include_gst: includeGst,
                deposit_percentage: depositPercentage,
                payment_terms: paymentTerms
            })
            .eq('id', id);
            
        if (error) throw error;
        
        const quote = quotes.find(q => q.id === id);
        if (quote) {
            Object.assign(quote, {
                title,
                job_address: jobAddress,
                quote_number: title,
                total,
                subtotal,
                gst,
                items: quoteItems,
                notes,
                include_gst: includeGst,
                deposit_percentage: depositPercentage,
                payment_terms: paymentTerms
            });
        }
        
        closeModal();
        showNotification('Quote updated successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error updating quote:', error);
        showNotification('Error updating quote', 'error');
    }
}

async function deleteQuote(id) {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    
    try {
        const { error } = await supabaseClient.from('quotes').delete().eq('id', id);
        if (error) throw error;
        
        const index = quotes.findIndex(q => q.id === id);
        if (index > -1) quotes.splice(index, 1);
        
        // Reset view mode and go back to list
        if (typeof quoteViewMode !== 'undefined') {
            quoteViewMode = 'table';
            selectedQuoteForDetail = null;
        }
        
        showNotification('Quote deleted successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error deleting quote:', error);
        
        // Check if it's a foreign key constraint error (409 conflict)
        if (error.code === '23503' || error.message?.includes('violates foreign key') || error.status === 409) {
            showNotification('Cannot delete quote - it has linked jobs or invoices. Delete those first.', 'error');
        } else {
            showNotification('Error deleting quote: ' + (error.message || 'Unknown error'), 'error');
        }
    }
}

async function convertToInvoice(quote) {
    if (!confirm(`Convert quote "${quote.title}" to an invoice?`)) return;
    
    try {
        // Generate invoice number
        const invoiceNumber = `INV-${String(invoices.length + 1).padStart(5, '0')}`;
        const issueDate = new Date().toISOString().split('T')[0];
        const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Create invoice
        const { data, error } = await supabaseClient
            .from('invoices')
            .insert([{
                user_id: currentUser.id,
                client_id: quote.client_id,
                quote_id: quote.id,
                title: quote.title,
                job_address: quote.job_address,
                invoice_number: invoiceNumber,
                total: quote.total,
                subtotal: quote.subtotal,
                gst: quote.gst,
                items: quote.items,
                notes: quote.notes,
                issue_date: issueDate,
                due_date: dueDate,
                status: 'unpaid',
                include_gst: quote.include_gst,
                payment_terms: quote.payment_terms
            }])
            .select();
            
        if (error) throw error;
        
        // Update quote status
        await supabaseClient
            .from('quotes')
            .update({ status: 'converted' })
            .eq('id', quote.id);
        
        const quoteObj = quotes.find(q => q.id === quote.id);
        if (quoteObj) quoteObj.status = 'converted';
        
        invoices.push(data[0]);
        showNotification('Quote converted to invoice successfully!', 'success');
        switchTab('invoices');
    } catch (error) {
        console.error('Error converting quote:', error);
        showNotification('Error converting quote to invoice', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════
// INVOICE OPERATIONS
// ═══════════════════════════════════════════════════════════════════

async function updateInvoiceDetails(id) {
    const title = document.getElementById('title').value.trim();
    const issueDate = document.getElementById('issue_date').value;
    const dueDate = document.getElementById('due_date').value;
    const notes = document.getElementById('notes')?.value.trim() || '';
    
    try {
        const { error } = await supabaseClient
            .from('invoices')
            .update({ title, issue_date: issueDate, due_date: dueDate, notes })
            .eq('id', id);
            
        if (error) throw error;
        
        const invoice = invoices.find(i => i.id === id);
        if (invoice) {
            Object.assign(invoice, { title, issue_date: issueDate, due_date: dueDate, notes });
        }
        
        closeModal();
        showNotification('Invoice updated successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error updating invoice:', error);
        showNotification('Error updating invoice', 'error');
    }
}

async function quickMarkAsPaid(id) {
    if (!confirm('Mark this invoice as paid?')) return;
    
    try {
        const paidDate = new Date().toISOString().split('T')[0];
        const { error } = await supabaseClient
            .from('invoices')
            .update({ status: 'paid', paid_date: paidDate })
            .eq('id', id);
            
        if (error) throw error;
        
        const invoice = invoices.find(i => i.id === id);
        if (invoice) {
            invoice.status = 'paid';
            invoice.paid_date = paidDate;
        }
        
        showNotification('Invoice marked as paid!', 'success');
        
        // Trigger confetti celebration!
        if (typeof triggerConfetti === 'function') {
            triggerConfetti();
        }
        
        renderApp();
    } catch (error) {
        console.error('Error marking invoice as paid:', error);
        showNotification('Error updating invoice', 'error');
    }
}

async function quickMarkAsUnpaid(id) {
    if (!confirm('Mark this invoice as unpaid?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('invoices')
            .update({ status: 'unpaid', paid_date: null })
            .eq('id', id);
            
        if (error) throw error;
        
        const invoice = invoices.find(i => i.id === id);
        if (invoice) {
            invoice.status = 'unpaid';
            invoice.paid_date = null;
        }
        
        showNotification('Invoice marked as unpaid!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error marking invoice as unpaid:', error);
        showNotification('Error updating invoice', 'error');
    }
}

async function deleteInvoice(id) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
        const { error } = await supabaseClient.from('invoices').delete().eq('id', id);
        if (error) throw error;
        
        const index = invoices.findIndex(i => i.id === id);
        if (index > -1) invoices.splice(index, 1);
        
        // Reset view mode and go back to list
        if (typeof invoiceViewMode !== 'undefined') {
            invoiceViewMode = 'table';
            selectedInvoiceForDetail = null;
        }
        
        showNotification('Invoice deleted successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error deleting invoice:', error);
        showNotification('Error deleting invoice', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════
// JOB OPERATIONS
// ═══════════════════════════════════════════════════════════════════

function saveJob() {
    const clientId = document.getElementById('client_id').value;
    const title = document.getElementById('title').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value || '06:00';
    const duration = parseInt(document.getElementById('duration').value) || 1;
    const notes = document.getElementById('notes')?.value.trim() || '';
    const status = document.getElementById('jobStatus')?.value || 'scheduled';
    const jobAddress = document.getElementById('job_address')?.value.trim() || '';
    const isRecurring = document.getElementById('is_recurring_job')?.checked || false;
    const recurringInterval = parseInt(document.getElementById('job_recurring_schedule')?.value) || 7;
    const recurringCount = parseInt(document.getElementById('job_recurring_count')?.value) || 1;

    if (!clientId || !title || !date) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    const assignedTeamMembers = Array.from(document.querySelectorAll('.worker-checkbox:checked')).map(cb => cb.value);

    const baseJob = {
        client_id: clientId,
        quote_id: editingItem?.quote_id,
        title,
        time,
        duration,
        notes,
        status,
        job_address: jobAddress,
        assigned_team_members: assignedTeamMembers
    };

    if (isRecurring && recurringCount > 1) {
        const startDate = new Date(date);
        const promises = [];
        for (let i = 0; i < recurringCount; i++) {
            const jobDate = new Date(startDate);
            jobDate.setDate(jobDate.getDate() + (recurringInterval * i));
            promises.push(addJob({ ...baseJob, date: jobDate.toISOString().split('T')[0] }));
        }
        Promise.all(promises).then(() => {
            showNotification(`${recurringCount} recurring jobs scheduled!`, 'success');
        });
    } else {
        addJob({ ...baseJob, date });
    }
}

async function addJob(job) {
    try {
        const { data, error } = await supabaseClient
            .from('jobs')
            .insert([{ ...job, user_id: currentUser.id }])
            .select();
            
        if (error) throw error;
        
        jobs.push(data[0]);
        closeModal();
        showNotification('Job scheduled successfully!', 'success');
        if (openedFromDashboard) {
            switchTab('schedule');
        }
    } catch (error) {
        console.error('Error scheduling job:', error);
        showNotification('Error scheduling job', 'error');
    }
}

async function updateJob(id) {
    const clientId = document.getElementById('client_id').value;
    const title = document.getElementById('title').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value || '06:00';
    const duration = parseInt(document.getElementById('duration').value) || 1;
    const notes = document.getElementById('notes')?.value.trim() || '';
    const status = document.getElementById('jobStatus')?.value || 'scheduled';
    const jobAddress = document.getElementById('job_address')?.value.trim() || '';
    
    if (!clientId || !title || !date) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const assignedTeamMembers = Array.from(document.querySelectorAll('.worker-checkbox:checked')).map(cb => cb.value);
    
    try {
        const { error } = await supabaseClient
            .from('jobs')
            .update({
                client_id: clientId,
                title,
                date,
                time,
                duration,
                notes,
                status,
                job_address: jobAddress,
                assigned_team_members: assignedTeamMembers
            })
            .eq('id', id);
            
        if (error) throw error;
        
        const job = jobs.find(j => j.id === id);
        if (job) {
            Object.assign(job, {
                client_id: clientId,
                title,
                date,
                time,
                duration,
                notes,
                status,
                job_address: jobAddress,
                assigned_team_members: assignedTeamMembers
            });
        }
        
        closeModal();
        showNotification('Job updated successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error updating job:', error);
        showNotification('Error updating job', 'error');
    }
}

async function deleteJob(id) {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
        const { error } = await supabaseClient.from('jobs').delete().eq('id', id);
        if (error) throw error;
        
        const index = jobs.findIndex(j => j.id === id);
        if (index > -1) jobs.splice(index, 1);
        
        showNotification('Job deleted successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error deleting job:', error);
        showNotification('Error deleting job', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPENSE OPERATIONS
// ═══════════════════════════════════════════════════════════════════

function saveExpense() {
    const date = document.getElementById('expense_date').value;
    const amount = parseFloat(document.getElementById('amount').value);
    let category = document.getElementById('category').value;
    const customCategory = document.getElementById('custom_category')?.value.trim();
    const description = document.getElementById('description')?.value.trim() || '';
    const jobIdRaw = document.getElementById('job_id')?.value || '';
    const teamMemberId = document.getElementById('team_member_id')?.value || null;
    
    // Handle custom category
    if (category === '__custom__' && customCategory) {
        category = customCategory;
        saveCustomExpenseCategory(category);
    }
    
    if (!date || !amount || !category || category === '__custom__') {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    let jobId = null;
    let descriptionWithJob = description;
    
    if (jobIdRaw && jobIdRaw.startsWith('job_')) {
        jobId = jobIdRaw.replace('job_', '');
    } else if (jobIdRaw && jobIdRaw.startsWith('quote_')) {
        const quoteId = jobIdRaw.replace('quote_', '');
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
            const client = clients.find(c => c.id === quote.client_id);
            descriptionWithJob = description + ` [Related to: ${quote.title}${client ? ' - ' + client.name : ''} (Quote)]`;
        }
    }
    
    addExpense({
        date,
        amount,
        category,
        description: descriptionWithJob,
        job_id: jobId,
        team_member_id: teamMemberId
    });
}

async function addExpense(expense) {
    try {
        const { data, error } = await supabaseClient
            .from('expenses')
            .insert([{ ...expense, user_id: currentUser.id }])
            .select();
            
        if (error) throw error;
        
        expenses.push(data[0]);
        closeModal();
        showNotification('Expense added successfully!', 'success');
        if (openedFromDashboard) {
            switchTab('expenses');
        }
    } catch (error) {
        console.error('Error adding expense:', error);
        showNotification('Error adding expense', 'error');
    }
}

async function updateExpense(id) {
    const date = document.getElementById('expense_date').value;
    const amount = parseFloat(document.getElementById('amount').value);
    let category = document.getElementById('category').value;
    const customCategory = document.getElementById('custom_category')?.value.trim();
    const description = document.getElementById('description')?.value.trim() || '';
    const jobIdRaw = document.getElementById('job_id')?.value || '';
    const teamMemberId = document.getElementById('team_member_id')?.value || null;
    
    // Handle custom category
    if (category === '__custom__' && customCategory) {
        category = customCategory;
        saveCustomExpenseCategory(category);
    }
    
    if (!date || !amount || !category || category === '__custom__') {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    let jobId = null;
    let descriptionWithJob = description;
    
    if (jobIdRaw && jobIdRaw.startsWith('job_')) {
        jobId = jobIdRaw.replace('job_', '');
    } else if (jobIdRaw && jobIdRaw.startsWith('quote_')) {
        const quoteId = jobIdRaw.replace('quote_', '');
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
            const client = clients.find(c => c.id === quote.client_id);
            descriptionWithJob = description + ` [Related to: ${quote.title}${client ? ' - ' + client.name : ''} (Quote)]`;
        }
    }
    
    try {
        const { error } = await supabaseClient
            .from('expenses')
            .update({
                date,
                amount,
                category,
                description: descriptionWithJob,
                job_id: jobId,
                team_member_id: teamMemberId
            })
            .eq('id', id);
            
        if (error) throw error;
        
        const expense = expenses.find(e => e.id === id);
        if (expense) {
            Object.assign(expense, {
                date,
                amount,
                category,
                description: descriptionWithJob,
                job_id: jobId,
                team_member_id: teamMemberId
            });
        }
        
        closeModal();
        showNotification('Expense updated successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error updating expense:', error);
        showNotification('Error updating expense', 'error');
    }
}

async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        const { error } = await supabaseClient.from('expenses').delete().eq('id', id);
        if (error) throw error;
        
        const index = expenses.findIndex(e => e.id === id);
        if (index > -1) expenses.splice(index, 1);
        
        showNotification('Expense deleted successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error deleting expense:', error);
        showNotification('Error deleting expense', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════
// TEAM MEMBER OPERATIONS
// ═══════════════════════════════════════════════════════════════════

async function saveTeamMember() {
    const name = document.getElementById('team_name').value.trim();
    if (!name) {
        showNotification('Name is required', 'error');
        return;
    }
    
    const member = {
        name: name,
        email: document.getElementById('team_email').value.trim(),
        phone: document.getElementById('team_phone').value.trim(),
        occupation: document.getElementById('team_occupation').value.trim(),
        color: document.getElementById('team_color').value,
        role: document.getElementById('team_role')?.value || 'tradesperson' // NEW: Include role
    };
    
    if (editingItem) {
        await updateTeamMember(editingItem.id, member);
    } else {
        await addTeamMember(member);
    }
}

// ADD TEAM MEMBER (NEW FUNCTION)
async function addTeamMember(member) {
    try {
        const { data, error } = await supabaseClient
            .from('team_members')
            .insert([{
                ...member,
                account_owner_id: currentUser.id
            }])
            .select();
        
        if (error) throw error;
        
        if (data) {
            teamMembers.push(data[0]);
            showNotification('Team member added successfully!', 'success');
        }
        
        closeModal();
        renderApp();
    } catch (error) {
        console.error('Error adding team member:', error);
        showNotification('Error adding team member: ' + error.message, 'error');
    }
}

// UPDATE TEAM MEMBER (NEW FUNCTION)
async function updateTeamMember(id, member) {
    try {
        const { data, error } = await supabaseClient
            .from('team_members')
            .update(member)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        
        if (data) {
            const index = teamMembers.findIndex(m => m.id === id);
            if (index !== -1) {
                teamMembers[index] = data[0];
            }
            showNotification('Team member updated successfully!', 'success');
        }
        
        closeModal();
        renderApp();
    } catch (error) {
        console.error('Error updating team member:', error);
        showNotification('Error updating team member: ' + error.message, 'error');
    }
}

// DELETE TEAM MEMBER (NEW FUNCTION)
async function deleteTeamMember(id) {
    try {
        if (!confirm('Delete this team member? This action cannot be undone.')) {
            return;
        }
        
        isLoading = true;
        loadingMessage = 'Deleting team member...';
        renderApp();
        
        const { error } = await supabaseClient
            .from('team_members')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        teamMembers = teamMembers.filter(m => m.id !== id);
        showNotification('Team member deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting team member:', error);
        showNotification('Failed to delete team member: ' + error.message, 'error');
    } finally {
        isLoading = false;
        renderApp();
    }
}

// EDIT TEAM MEMBER (NEW FUNCTION)
function editTeamMember(id) {
    const member = teamMembers.find(m => m.id === id);
    if (member) {
        openModal('team_member', member);
    }
}

// ═══════════════════════════════════════════════════════════════════
// CLIENT NOTE OPERATIONS
// ═══════════════════════════════════════════════════════════════════

async function saveClientNote() {
    const noteText = document.getElementById('note_text')?.value.trim();
    
    if (!noteText) {
        showNotification('Please enter a note', 'error');
        return;
    }
    
    const note = {
        client_id: editingItem.client_id,
        related_type: editingItem.related_type,
        related_id: editingItem.related_id,
        note_text: noteText
    };
    
    try {
        const { data, error } = await supabaseClient
            .from('client_notes')
            .insert([{ ...note, user_id: currentUser.id }])
            .select();
            
        if (error) throw error;
        
        // Add to local array (create if doesn't exist)
        if (!window.clientNotes) window.clientNotes = [];
        window.clientNotes.push(data[0]);
        
        closeModal();
        showNotification('Note saved successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error saving note:', error);
        showNotification('Error saving note', 'error');
    }
}

async function deleteClientNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('client_notes')
            .delete()
            .eq('id', noteId);
            
        if (error) throw error;
        
        // Remove from local array
        if (window.clientNotes) {
            const index = window.clientNotes.findIndex(n => n.id === noteId);
            if (index > -1) window.clientNotes.splice(index, 1);
        }
        
        showNotification('Note deleted successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error deleting note:', error);
        showNotification('Error deleting note', 'error');
    }
}

async function saveCustomExpenseCategory(categoryName) {
    try {
        const customCategories = companySettings?.custom_expense_categories || [];
        
        // Don't add if already exists
        if (customCategories.includes(categoryName)) return;
        
        const updatedCategories = [...customCategories, categoryName];
        
        const { error } = await supabaseClient
            .from('company_settings')
            .update({ custom_expense_categories: updatedCategories })
            .eq('user_id', currentUser.id);
        
        if (error) throw error;
        
        // Update local settings
        if (!companySettings) companySettings = {};
        companySettings.custom_expense_categories = updatedCategories;
    } catch (error) {
        console.error('Error saving custom category:', error);
        // Don't show error to user, category will still work for this expense
    }
}

console.log('✅ CRUD operations module loaded');
