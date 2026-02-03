// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Admin Panel Module (COMPLETE)
// ═══════════════════════════════════════════════════════════════════

async function renderAdmin() {
    if (!isAdmin) {
        return `
            <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                <h2 class="text-2xl font-bold mb-4 dark:text-white">Access Denied</h2>
                <p class="text-gray-600 dark:text-gray-300">Admin access required.</p>
            </div>
        `;
    }
    
    // Load all subscriptions
    const { data: allSubs, error } = await supabaseClient.from('subscriptions').select('*');
    
    if (error) {
        console.error('Error loading subscriptions:', error);
        return `
            <div>
                <h2 class="text-2xl font-bold mb-6 dark:text-white">Admin - Subscription Management</h2>
                <p class="text-red-600 dark:text-red-400">Error: ${error.message || 'Unknown error'}</p>
            </div>
        `;
    }
    
    const users = allSubs || [];
    console.log('Loaded subscriptions:', users);
    
    // Calculate stats
    const activeUsers = users.filter(u => u.subscription_status === 'active').length;
    const trialUsers = users.filter(u => u.subscription_status === 'trial').length;
    const expiredUsers = users.filter(u => u.subscription_status === 'expired').length;
    
    return `
        <div>
            <h2 class="text-2xl font-bold mb-6 dark:text-white">🔧 Admin - Subscription Management</h2>
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-teal-500">
                    <div class="text-gray-600 dark:text-gray-300 text-sm">Total Users</div>
                    <div class="text-3xl font-bold mt-2 dark:text-white">${users.length}</div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
                    <div class="text-gray-600 dark:text-gray-300 text-sm">Active</div>
                    <div class="text-3xl font-bold mt-2 text-green-600">${activeUsers}</div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-yellow-500">
                    <div class="text-gray-600 dark:text-gray-300 text-sm">Trial</div>
                    <div class="text-3xl font-bold mt-2 text-yellow-600">${trialUsers}</div>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-red-500">
                    <div class="text-gray-600 dark:text-gray-300 text-sm">Expired</div>
                    <div class="text-3xl font-bold mt-2 text-red-600">${expiredUsers}</div>
                </div>
            </div>
            
            <!-- Subscriptions Table -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table class="min-w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Account Type</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trial Ends</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        ${users.length === 0 ? `
                            <tr>
                                <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No subscriptions found</td>
                            </tr>
                        ` : users.map(u => {
                            const trialEnds = new Date(u.trial_ends_at);
                            const daysLeft = Math.ceil((trialEnds - new Date()) / (1000 * 60 * 60 * 24));
                            const statusColor = u.subscription_status === 'active' ? 'text-green-600' : 
                                              u.subscription_status === 'trial' ? 'text-yellow-600' : 'text-red-600';
                            const accountType = u.account_type === 'business' ? 'Business' : 'Sole Trader';
                            
                            return `
                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td class="px-6 py-4 text-sm dark:text-gray-200">${u.user_email || 'Unknown'}</td>
                                    <td class="px-6 py-4 text-sm dark:text-gray-200">
                                        <span class="px-2 py-1 text-xs rounded ${u.account_type === 'business' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}">
                                            ${accountType}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm ${statusColor} font-medium">${u.subscription_status.toUpperCase()}</td>
                                    <td class="px-6 py-4 text-sm dark:text-gray-200">
                                        ${trialEnds.toLocaleDateString()}<br>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">(${daysLeft} days)</span>
                                    </td>
                                    <td class="px-6 py-4 text-sm space-x-2">
                                        ${u.subscription_status !== 'active' ? 
                                            `<button onclick="activateSubscription('${u.user_id}')" class="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Activate</button>` : 
                                            `<button onclick="deactivateSubscription('${u.user_id}')" class="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">Deactivate</button>`
                                        }
                                        <button onclick="extendTrial('${u.user_id}')" class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Extend Trial</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Admin Actions
async function activateSubscription(userId) {
    try {
        const { error } = await supabaseClient
            .from('subscriptions')
            .update({
                subscription_status: 'active',
                subscription_activated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        
        if (error) throw error;
        
        showNotification('Subscription activated!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error activating subscription:', error);
        showNotification('Error activating subscription', 'error');
    }
}

async function deactivateSubscription(userId) {
    if (confirm('Are you sure you want to deactivate this subscription?')) {
        try {
            const { error } = await supabaseClient
                .from('subscriptions')
                .update({
                    subscription_status: 'expired'
                })
                .eq('user_id', userId);
            
            if (error) throw error;
            
            showNotification('Subscription deactivated!', 'success');
            renderApp();
        } catch (error) {
            console.error('Error deactivating subscription:', error);
            showNotification('Error deactivating subscription', 'error');
        }
    }
}

async function extendTrial(userId) {
    const days = prompt('How many days to extend trial?', '14');
    if (days && !isNaN(days)) {
        try {
            const { data } = await supabaseClient
                .from('subscriptions')
                .select('trial_ends_at')
                .eq('user_id', userId)
                .single();
            
            const currentEnd = new Date(data.trial_ends_at);
            const newEnd = new Date(currentEnd.getTime() + parseInt(days) * 24 * 60 * 60 * 1000);
            
            const { error } = await supabaseClient
                .from('subscriptions')
                .update({
                    trial_ends_at: newEnd.toISOString()
                })
                .eq('user_id', userId);
            
            if (error) throw error;
            
            showNotification(`Trial extended by ${days} days!`, 'success');
            renderApp();
        } catch (error) {
            console.error('Error extending trial:', error);
            showNotification('Error extending trial', 'error');
        }
    }
}

console.log('✅ Admin panel module loaded (COMPLETE)');
