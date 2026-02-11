// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Shimmer Loading States
// ═══════════════════════════════════════════════════════════════════

// CSS for shimmer animation (add to your styles or style tag)
const shimmerCSS = `
<style>
@keyframes shimmer {
    0% {
        background-position: -1000px 0;
    }
    100% {
        background-position: 1000px 0;
    }
}

.shimmer {
    animation: shimmer 2s infinite;
    background: linear-gradient(
        to right,
        #f0f0f0 0%,
        #e0e0e0 20%,
        #f0f0f0 40%,
        #f0f0f0 100%
    );
    background-size: 1000px 100%;
}

.dark .shimmer {
    background: linear-gradient(
        to right,
        #374151 0%,
        #4b5563 20%,
        #374151 40%,
        #374151 100%
    );
}
</style>
`;

// Shimmer skeleton for table rows
function renderTableShimmer(rows = 5) {
    return Array(rows).fill(0).map(() => `
        <tr class="animate-pulse">
            <td class="px-6 py-4">
                <div class="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </td>
            <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 shimmer"></div>
            </td>
            <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 shimmer"></div>
            </td>
            <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 shimmer"></div>
            </td>
            <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 shimmer"></div>
            </td>
            <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 shimmer"></div>
            </td>
        </tr>
    `).join('');
}

// Shimmer skeleton for dashboard cards
function renderDashboardCardShimmer() {
    return `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-pulse">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg shimmer"></div>
            </div>
            <div class="space-y-3">
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 shimmer"></div>
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 shimmer"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 shimmer"></div>
            </div>
        </div>
    `;
}

// Shimmer skeleton for form fields
function renderFormShimmer() {
    return `
        <div class="space-y-4 animate-pulse">
            <div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 shimmer"></div>
                <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
            </div>
            <div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 shimmer"></div>
                <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
            </div>
            <div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 shimmer"></div>
                <div class="h-20 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
            </div>
        </div>
    `;
}

// Shimmer for list items
function renderListShimmer(items = 5) {
    return Array(items).fill(0).map(() => `
        <div class="flex gap-3 p-4 animate-pulse">
            <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg shimmer"></div>
            <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 shimmer"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 shimmer"></div>
            </div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 shimmer"></div>
        </div>
    `).join('');
}

// Usage example for loading states
let isLoadingInvoices = false;

async function loadInvoices() {
    isLoadingInvoices = true;
    renderApp(); // Shows shimmer
    
    try {
        // Fetch data
        const { data, error } = await supabaseClient.from('invoices').select('*');
        if (error) throw error;
        
        invoices = data;
    } catch (error) {
        console.error('Error loading invoices:', error);
    } finally {
        isLoadingInvoices = false;
        renderApp(); // Shows actual data
    }
}

// In your render function:
function renderInvoices() {
    if (isLoadingInvoices) {
        return `
            <div>
                <h2 class="text-2xl font-bold mb-4">Invoices</h2>
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-black text-white">
                            <tr>
                                <th class="px-6 py-3">Select</th>
                                <th class="px-6 py-3">Invoice #</th>
                                <th class="px-6 py-3">Client</th>
                                <th class="px-6 py-3">Description</th>
                                <th class="px-6 py-3">Date</th>
                                <th class="px-6 py-3">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderTableShimmer(8)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    // Normal rendering...
}

console.log('✅ Shimmer loading states loaded');
