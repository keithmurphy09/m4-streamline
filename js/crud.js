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
    if (!confirm('Are you sure you want to delete this client? This will also delete all related quotes, jobs, invoices, and expenses.')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient.from('clients').delete().eq('id', id);
        if (error) throw error;
        
        const index = clients.findIndex(c => c.id === id);
        if (index > -1) clients.splice(index, 1);
        
        showNotification('Client deleted successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error deleting client:', error);
        showNotification('Error deleting client', 'error');
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
        switchTab('quotes');
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
        showNotification('Error deleting quote', 'error');
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
    
    if (!clientId || !title || !date) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const assignedTeamMembers = Array.from(document.querySelectorAll('.worker-checkbox:checked')).map(cb => cb.value);
    
    addJob({
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
        switchTab('schedule');
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
    const category = document.getElementById('category').value;
    const description = document.getElementById('description')?.value.trim() || '';
    const jobIdRaw = document.getElementById('job_id')?.value || '';
    const teamMemberId = document.getElementById('team_member_id')?.value || null;
    
    if (!date || !amount || !category) {
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
        switchTab('expenses');
    } catch (error) {
        console.error('Error adding expense:', error);
        showNotification('Error adding expense', 'error');
    }
}

async function updateExpense(id) {
    const date = document.getElementById('expense_date').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const description = document.getElementById('description')?.value.trim() || '';
    const jobIdRaw = document.getElementById('job_id')?.value || '';
    const teamMemberId = document.getElementById('team_member_id')?.value || null;
    
    if (!date || !amount || !category) {
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
        color: document.getElementById('team_color').value
    };
    
    if (editingItem) {
        await updateTeamMember(editingItem.id);
    } else {
        await addTeamMember(member);
    }
}

console.log('✅ CRUD operations module loaded');
