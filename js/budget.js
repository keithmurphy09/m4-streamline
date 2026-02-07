// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Budget Module
// ═══════════════════════════════════════════════════════════════════

// Budget settings stored in database (per user)
let budgetSettings = {
    monthly_budgets: {
        'Labour': 2000,
        'Materials': 1500,
        'Fuel': 400,
        'Equipment': 800,
        'Marketing': 300,
        'Insurance': 200,
        'Other': 500
    }
};

// Budget editing state
let editingBudget = false;

function renderBudget() {
    const now = new Date();
    const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Get this month's expenses
    const monthExpenses = expenses.filter(e => {
        const expDate = new Date(e.date);
        return expDate >= monthStart && expDate <= monthEnd;
    });
    
    // Calculate spending per category
    const categorySpending = {};
    monthExpenses.forEach(e => {
        const cat = e.category || 'Other';
        categorySpending[cat] = (categorySpending[cat] || 0) + parseFloat(e.amount || 0);
    });
    
    // Get budget categories
    const budgets = budgetSettings.monthly_budgets || {};
    const categories = Object.keys(budgets);
    
    // Calculate totals
    const totalBudget = Object.values(budgets).reduce((sum, val) => sum + val, 0);
    const totalSpent = Object.values(categorySpending).reduce((sum, val) => sum + val, 0);
    const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Generate category rows
    const categoryRows = categories.map(category => {
        const budget = budgets[category] || 0;
        const spent = categorySpending[category] || 0;
        const percent = budget > 0 ? (spent / budget) * 100 : 0;
        const isOverBudget = spent > budget;
        
        return `
            <div class="bg-white dark:bg-gray-800 p-5 rounded-lg border ${isOverBudget ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}">
                <div class="flex justify-between items-center mb-3">
                    <div class="flex items-center gap-3">
                        <div class="text-lg font-semibold dark:text-white">${category}</div>
                        ${isOverBudget ? '<span class="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-medium">⚠️ OVER</span>' : ''}
                    </div>
                    ${editingBudget ? `
                        <input type="number" 
                               id="budget-${category}" 
                               value="${budget}" 
                               class="w-32 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-right"
                               placeholder="Budget">
                    ` : `
                        <div class="text-right">
                            <div class="text-sm text-gray-600 dark:text-gray-400">$${spent.toFixed(2)} / $${budget.toFixed(2)}</div>
                            <div class="text-xs ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'} font-medium">${percent.toFixed(0)}%</div>
                        </div>
                    `}
                </div>
                ${!editingBudget ? `
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div class="h-3 rounded-full transition-all ${isOverBudget ? 'bg-red-500' : percent > 80 ? 'bg-orange-500' : 'bg-teal-500'}" style="width: ${Math.min(percent, 100)}%"></div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 class="text-2xl font-bold dark:text-white">Budget Tracker</h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Track spending against monthly budgets</p>
                </div>
                
                ${editingBudget ? `
                    <div class="flex gap-2">
                        <button onclick="saveBudget()" class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                            ✓ Save Budget
                        </button>
                        <button onclick="cancelBudgetEdit()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                            Cancel
                        </button>
                    </div>
                ` : `
                    <button onclick="editBudget()" class="px-4 py-2 bg-black text-white rounded-lg border border-teal-400 hover:bg-gray-900 transition-colors">
                        Edit Budget
                    </button>
                `}
            </div>
            
            <!-- Current Period -->
            <div class="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-teal-200 dark:border-teal-800">
                <div class="text-sm text-teal-700 dark:text-teal-400 font-medium mb-2">Budget Period</div>
                <div class="text-2xl font-bold dark:text-white">${currentMonth}</div>
            </div>
            
            <!-- Overall Budget Summary -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div class="flex justify-between items-end mb-4">
                    <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Budget This Month</div>
                        <div class="text-3xl font-bold dark:text-white">$${totalBudget.toFixed(2)}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Spent</div>
                        <div class="text-2xl font-bold ${totalSpent > totalBudget ? 'text-red-600' : 'text-teal-600'}">$${totalSpent.toFixed(2)}</div>
                    </div>
                </div>
                
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden mb-2">
                    <div class="h-4 rounded-full transition-all ${totalSpent > totalBudget ? 'bg-red-500' : percentSpent > 80 ? 'bg-orange-500' : 'bg-teal-500'}" style="width: ${Math.min(percentSpent, 100)}%"></div>
                </div>
                
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600 dark:text-gray-400">${percentSpent.toFixed(1)}% used</span>
                    <span class="${totalSpent > totalBudget ? 'text-red-600 font-semibold' : 'text-gray-600 dark:text-gray-400'}">
                        ${totalSpent > totalBudget ? `$${(totalSpent - totalBudget).toFixed(2)} OVER BUDGET` : `$${(totalBudget - totalSpent).toFixed(2)} remaining`}
                    </span>
                </div>
            </div>
            
            <!-- Category Budgets -->
            <div>
                <h3 class="text-lg font-bold dark:text-white mb-4">Budget by Category</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${categoryRows}
                </div>
            </div>
            
            ${!editingBudget && totalSpent > totalBudget ? `
                <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
                    <div class="flex items-start gap-3">
                        <div class="text-2xl">⚠️</div>
                        <div>
                            <div class="font-semibold text-red-900 dark:text-red-400 mb-1">Over Budget Alert</div>
                            <div class="text-sm text-red-700 dark:text-red-300">You've exceeded your monthly budget by $${(totalSpent - totalBudget).toFixed(2)}. Consider reviewing your spending or adjusting your budget.</div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Edit budget
function editBudget() {
    editingBudget = true;
    renderApp();
}

// Cancel budget editing
function cancelBudgetEdit() {
    editingBudget = false;
    renderApp();
}

// Save budget
async function saveBudget() {
    try {
        const categories = Object.keys(budgetSettings.monthly_budgets);
        const newBudgets = {};
        
        categories.forEach(cat => {
            const input = document.getElementById(`budget-${cat}`);
            if (input) {
                newBudgets[cat] = parseFloat(input.value) || 0;
            }
        });
        
        // Update local state
        budgetSettings.monthly_budgets = newBudgets;
        
        // Save to database (if user has company_settings)
        if (companySettings && companySettings.id) {
            const { error } = await supabaseClient
                .from('company_settings')
                .update({ 
                    budget_settings: JSON.stringify(newBudgets) 
                })
                .eq('id', companySettings.id);
            
            if (error) throw error;
        }
        
        editingBudget = false;
        showNotification('Budget saved successfully!', 'success');
        renderApp();
        
    } catch (error) {
        console.error('Error saving budget:', error);
        showNotification('Failed to save budget: ' + error.message, 'error');
    }
}

console.log('✅ Budget module loaded');
