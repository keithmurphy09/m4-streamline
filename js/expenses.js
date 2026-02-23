// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Expenses Module
// ═══════════════════════════════════════════════════════════════════

function renderExpenses() {
    const categories = ['Materials', 'Fuel', 'Equipment', 'Subcontractors', 'Office Supplies', 'Insurance', 'Marketing', 'Other'];
    
    const monthsSet = new Set();
    expenses.forEach(exp => {
        const date = new Date(exp.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthsSet.add(monthKey);
    });
    const months = Array.from(monthsSet).sort().reverse();
    
    let filteredExpenses = expenseFilter === 'all' 
        ? expenses 
        : expenses.filter(exp => {
            const date = new Date(exp.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return monthKey === expenseFilter;
        });
    
    // NEW: Filter by tradesperson (team member)
    if (window.expenseTeamFilter && window.expenseTeamFilter !== 'all') {
        filteredExpenses = filteredExpenses.filter(exp => exp.team_member_id === window.expenseTeamFilter);
    }
    
    if (expenseSearch) {
        filteredExpenses = filteredExpenses.filter(exp => {
            const teamMember = teamMembers.find(m => m.id === exp.team_member_id);
            const searchLower = expenseSearch.toLowerCase();
            return (
                (exp.description || '').toLowerCase().includes(searchLower) ||
                (exp.category || '').toLowerCase().includes(searchLower) ||
                (exp.amount?.toString() || '').includes(searchLower) ||
                (teamMember?.name || '').toLowerCase().includes(searchLower)
            );
        });
    }
    
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalExpensesCount = filteredExpenses.length;
    const startIndex = (currentPage.expenses - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);
    
    const getMonthLabel = (monthKey) => {
        if (monthKey === 'all') return 'All Time';
        const [year, month] = monthKey.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };
    
    return `<div>
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
            <div>
                <h2 class="text-2xl font-bold dark:text-teal-400">Expenses</h2>
                <div class="text-3xl font-bold text-red-600 mt-2">$${totalExpenses.toFixed(2)}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">${totalExpensesCount} expense${totalExpensesCount !== 1 ? 's' : ''} - ${getMonthLabel(expenseFilter)}</div>
            </div>
            <div class="flex flex-wrap gap-2 items-center">
                ${months.length > 0 ? `
                    <select onchange="expenseFilter=this.value; renderApp();" class="px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white text-sm">
                        <option value="all" ${expenseFilter === 'all' ? 'selected' : ''}>All Months</option>
                        ${months.map(m => `<option value="${m}" ${expenseFilter === m ? 'selected' : ''}>${getMonthLabel(m)}</option>`).join('')}
                    </select>
                ` : ''}
                ${getAccountType() === 'business' && teamMembers.filter(tm => tm.role !== 'salesperson').length > 0 ? `
                    <select onchange="window.expenseTeamFilter=this.value; renderApp();" class="px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white text-sm">
                        <option value="all" ${!window.expenseTeamFilter || window.expenseTeamFilter === 'all' ? 'selected' : ''}>All Tradespeople</option>
                        ${teamMembers.filter(tm => tm.role !== 'salesperson').map(tm => `<option value="${tm.id}" ${window.expenseTeamFilter === tm.id ? 'selected' : ''}>${tm.name}</option>`).join('')}
                    </select>
                ` : ''}
                <button onclick="exportToCSV('expenses')" class="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 px-3 sm:px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors">Export CSV</button>
                <button onclick="openModal('expense')" class="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 px-3 sm:px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors">+ Add Expense</button>
            </div>
        </div>
        
        <input type="text" placeholder="🔍 Search expenses..." value="${expenseSearch}" oninput="debouncedSearch('expense', this.value);" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-4">
        
        ${selectedExpenses.length > 0 ? `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <span class="text-sm font-medium text-blue-900">${selectedExpenses.length} expense${selectedExpenses.length > 1 ? 's' : ''} selected</span>
            <button onclick="bulkDelete('expenses')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium dark:text-gray-200">🗑️ Delete Selected</button>
        </div>
        ` : ''}
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            ${paginatedExpenses.length === 0 ? 
                `<div class="text-center py-12 text-gray-500 dark:text-gray-400">${expenseSearch ? 'No expenses found' : expenseFilter === 'all' ? 'No expenses yet. Click "+ Add Expense" to get started!' : 'No expenses for this month.'}</div>` 
                : 
                `<!-- Desktop Table View -->
                <div class="expenses-desktop-table">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-black text-white dark:bg-gray-900">
                                <tr>
                                    <th class="px-4 py-3 text-center">
                                        <input type="checkbox" ${selectedExpenses.length === totalExpensesCount && totalExpensesCount > 0 ? 'checked' : ''} onchange="toggleSelectAll('expenses')" class="w-4 h-4 text-teal-600 rounded">
                                    </th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold">Date</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold">Category</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold">Job</th>
                                    ${getAccountType() === 'business' ? '<th class="px-4 py-3 text-left text-sm font-semibold">Team Member</th>' : ''}
                                    <th class="px-4 py-3 text-left text-sm font-semibold">Description</th>
                                    <th class="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                                    <th class="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                ${paginatedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => {
                                    const teamMember = exp.team_member_id ? teamMembers.find(tm => tm.id === exp.team_member_id) : null;
                                    
                                    let jobDisplay = '-';
                                    if (exp.job_id) {
                                        const job = jobs.find(j => j.id === exp.job_id);
                                        jobDisplay = job ? job.title : '-';
                                    } else if (exp.description) {
                                        const match = exp.description.match(/\[Related to: ([^\]]+)\]/);
                                        if (match) {
                                            let title = match[1];
                                            title = title.replace(/\s*\((?:Quote|Scheduled)\)\s*$/, '');
                                            const parts = title.split(' - ');
                                            jobDisplay = parts[0] || title;
                                        }
                                    }
                                    
                                    const isSelected = selectedExpenses.includes(exp.id);
                                    return `
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'bg-teal-50 dark:bg-teal-900/20' : ''}">
                                        <td class="px-4 py-3 text-center">
                                            <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelection('expenses', '${exp.id}')" class="w-4 h-4 text-teal-600 rounded">
                                        </td>
                                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">${new Date(exp.date).toLocaleDateString()}</td>
                                        <td class="px-4 py-3">
                                            <span class="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">${exp.category}</span>
                                        </td>
                                        <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">${jobDisplay}</td>
                                        ${getAccountType() === 'business' ? `<td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">${teamMember ? teamMember.name : '-'}</td>` : ''}
                                        <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            ${exp.description || '-'}
                                            ${exp.receipt_url ? `<a href="${exp.receipt_url}" target="_blank" class="text-teal-600 hover:underline ml-2">📎</a>` : ''}
                                        </td>
                                        <td class="px-4 py-3 text-sm font-semibold text-right text-red-600">$${parseFloat(exp.amount).toFixed(2)}</td>
                                        <td class="px-4 py-3 text-center">
                                            <div class="flex justify-center gap-2">
                                                <button onclick='openModal("expense", ${JSON.stringify(exp).replace(/"/g, "&quot;")})' class="text-teal-600 hover:text-teal-800 dark:text-teal-400 text-sm font-medium">Edit</button>
                                                <button onclick="deleteExpense('${exp.id}')" class="text-red-600 hover:text-red-800 dark:text-red-400 text-sm font-medium">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                `}).join('')}
                                <tr class="bg-gray-50 dark:bg-gray-800 font-bold border-t-2 border-gray-300 dark:border-gray-600">
                                    <td colspan="${getAccountType() === 'business' ? '5' : '4'}" class="px-4 py-4 text-right text-sm uppercase dark:text-white">Total ${expenseFilter !== 'all' ? `(${getMonthLabel(expenseFilter)})` : ''}:</td>
                                    <td class="px-4 py-4 text-right text-lg text-red-600">$${totalExpenses.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Mobile Cards View -->
                <div class="expenses-mobile-cards" style="display: none;">
                    ${paginatedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => {
                        const teamMember = exp.team_member_id ? teamMembers.find(tm => tm.id === exp.team_member_id) : null;
                        
                        let jobDisplay = '-';
                        if (exp.job_id) {
                            const job = jobs.find(j => j.id === exp.job_id);
                            jobDisplay = job ? job.title : '-';
                        } else if (exp.description) {
                            const match = exp.description.match(/\[Related to: ([^\]]+)\]/);
                            if (match) {
                                let title = match[1];
                                title = title.replace(/\s*\((?:Quote|Scheduled)\)\s*$/, '');
                                const parts = title.split(' - ');
                                jobDisplay = parts[0] || title;
                            }
                        }
                        
                        // Category colors
                        const categoryColors = {
                            'Materials': 'background: #dbeafe; border-color: #60a5fa; color: #1e40af;',
                            'Fuel': 'background: #fee2e2; border-color: #fca5a5; color: #991b1b;',
                            'Equipment': 'background: #e0e7ff; border-color: #a5b4fc; color: #3730a3;',
                            'Subcontractors': 'background: #fef3c7; border-color: #fbbf24; color: #92400e;',
                            'Office Supplies': 'background: #d1fae5; border-color: #6ee7b7; color: #065f46;',
                            'Insurance': 'background: #fce7f3; border-color: #f9a8d4; color: #831843;',
                            'Marketing': 'background: #e9d5ff; border-color: #d8b4fe; color: #581c87;',
                            'Other': 'background: #f3f4f6; border-color: #9ca3af; color: #374151;'
                        };
                        const categoryStyle = categoryColors[exp.category] || categoryColors['Other'];
                        
                        return `
                            <div class="expense-card">
                                <div class="expense-card-header">
                                    <div>
                                        <div class="expense-card-date">${new Date(exp.date).toLocaleDateString()}</div>
                                        <div class="expense-card-category" style="${categoryStyle}">${exp.category}</div>
                                    </div>
                                    <div class="expense-card-amount">-$${parseFloat(exp.amount).toFixed(2)}</div>
                                </div>
                                
                                ${exp.description ? `<div class="expense-card-description">${exp.description}</div>` : ''}
                                ${jobDisplay !== '-' ? `<div class="expense-card-job">🔨 ${jobDisplay}</div>` : ''}
                                ${teamMember ? `<div class="expense-card-team">👤 ${teamMember.name}</div>` : ''}
                                ${exp.receipt_url ? `<div class="expense-card-receipt"><a href="${exp.receipt_url}" target="_blank">📎 View Receipt</a></div>` : ''}
                                
                                <div class="expense-card-actions">
                                    <button onclick='openModal("expense", ${JSON.stringify(exp).replace(/"/g, "&quot;")})' class="expense-card-action-btn">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                        Edit
                                    </button>
                                    <button onclick="deleteExpense('${exp.id}')" class="expense-card-action-btn" style="background: #fee2e2; border-color: #fca5a5; color: #991b1b;">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    
                    <!-- Mobile Total -->
                    <div class="expense-mobile-total">
                        <div class="expense-mobile-total-label">Total ${expenseFilter !== 'all' ? `(${getMonthLabel(expenseFilter)})` : ''}</div>
                        <div class="expense-mobile-total-amount">-$${totalExpenses.toFixed(2)}</div>
                    </div>
                </div>`
            }
            ${getPaginationHTML('expenses', totalExpensesCount, currentPage.expenses)}
        </div>
    </div>`;
}

console.log('✅ Expenses module loaded');
