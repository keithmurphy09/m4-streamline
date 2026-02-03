// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Admin Panel Module (Admin Only)
// ═══════════════════════════════════════════════════════════════════

function renderAdmin() {
    if (!isAdmin) {
        return `
            <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                <h2 class="text-2xl font-bold mb-4 dark:text-white">Access Denied</h2>
                <p class="text-gray-600 dark:text-gray-300">Admin access required.</p>
            </div>
        `;
    }
    
    return `
        <div>
            <h2 class="text-2xl font-bold mb-6 dark:text-white">🔧 Admin Panel</h2>
            
            <div class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6 mb-6">
                <p class="text-red-900 dark:text-red-200 font-bold mb-2">⚠️ Admin Tools</p>
                <p class="text-sm text-red-800 dark:text-red-300">
                    Full admin panel features will be added in the next update.
                    Use your single file backup to access all admin tools.
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 class="font-bold dark:text-white mb-2">Total Users</h3>
                    <div class="text-3xl font-bold text-teal-600">-</div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Coming soon</p>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 class="font-bold dark:text-white mb-2">Active Subscriptions</h3>
                    <div class="text-3xl font-bold text-green-600">-</div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Coming soon</p>
                </div>
            </div>
        </div>
    `;
}

console.log('✅ Admin panel module loaded');
