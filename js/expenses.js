// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Expenses Module
// ═══════════════════════════════════════════════════════════════════

function renderExpenses() {
    const defaultCategories = ['Labour', 'Materials', 'Fuel', 'Equipment', 'Subcontractors', 'Office Supplies', 'Insurance', 'Marketing', 'Other'];
    const customCategories = companySettings?.custom_expense_categories || [];
    const categories = [...defaultCategories, ...customCategories];
    
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
                <button onclick="exportToCSV('expenses')" class="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 text-sm whitespace-nowrap">Export CSV</button>
                <button onclick="openModal('expense')" class="bg-black text-white px-3 sm:px-4 py-2 rounded-lg border border-teal-400 text-sm whitespace-nowrap">+ Add Expense</button>
            </div>
        </div>
        
        <input type="text" placeholder="🔍 Search expenses..." value="${expenseSearch}" oninput="debouncedSearch('expense', this.value);" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-4">
        
        ${selectedExpenses.length > 0 ? `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <span class="text-sm font-medium text-blue-900">${selectedExpenses.length} expense${selectedExpenses.length > 1 ? 's' : ''} selected</span>
            <button onclick="bulkDelete('expenses')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium dark:text-gray-200">🗑️ Delete Selected</button>
        </div>
        ` : ''}
        
        <div class="bg-white rounded-lg shadow overflow-hidden">
            ${paginatedExpenses.length === 0 ? 
                `<div class="text-center py-12 text-gray-500 dark:text-gray-400">${expenseSearch ? 'No expenses found' : expenseFilter === 'all' ? 'No expenses yet. Click "+ Add Expense" to get started!' : 'No expenses for this month.'}</div>` 
                : 
                `<div class="overflow-x-auto dark:bg-gray-800">
                    <table class="w-full">
                        <thead class="bg-black text-white">
                            <tr>
                                <th class="px-4 py-3 text-center">
                                    <input type="checkbox" ${selectedExpenses.length === totalExpensesCount && totalExpensesCount > 0 ? 'checked' : ''} onchange="toggleSelectAll('expenses')" class="w-4 h-4 text-blue-600 rounded">
                                </th>
                                <th class="px-4 py-3 text-left text-sm font-semibold dark:text-white">Date</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold dark:text-white">Category</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold dark:text-white">Job</th>
                                ${getAccountType() === 'business' ? '<th class="px-4 py-3 text-left text-sm font-semibold dark:text-white">Team Member</th>' : ''}
                                <th class="px-4 py-3 text-left text-sm font-semibold dark:text-white">Description</th>
                                <th class="px-4 py-3 text-right text-sm font-semibold dark:text-white">Amount</th>
                                <th class="px-4 py-3 text-center text-sm font-semibold dark:text-white">Actions</th>
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
                                <tr class="hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 ${isSelected ? 'bg-blue-50' : ''}">
                                    <td class="px-4 py-3 text-center">
                                        <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelection('expenses', '${exp.id}')" class="w-4 h-4 text-blue-600 rounded">
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">${new Date(exp.date).toLocaleDateString()}</td>
                                    <td class="px-4 py-3">
                                        <span class="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">${exp.category}</span>
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
                                            <button onclick='openModal("expense", ${JSON.stringify(exp).replace(/"/g, "&quot;")})' class="text-blue-600 hover:text-blue-800 text-sm font-medium dark:text-gray-200">Edit</button>
                                            <button onclick="deleteExpense('${exp.id}')" class="text-red-600 hover:text-red-800 text-sm font-medium dark:text-gray-200">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            `}).join('')}
                            <tr class="bg-gray-50 dark:bg-gray-800 font-bold border-t-2 border-gray-300">
                                <td colspan="${getAccountType() === 'business' ? '5' : '4'}" class="px-4 py-4 text-right text-sm uppercase">Total ${expenseFilter !== 'all' ? `(${getMonthLabel(expenseFilter)})` : ''}:</td>
                                <td class="px-4 py-4 text-right text-lg text-red-600">$${totalExpenses.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>`
            }
            ${getPaginationHTML('expenses', totalExpensesCount, currentPage.expenses)}
        </div>
    </div>`;
}

console.log('✅ Expenses module loaded');
