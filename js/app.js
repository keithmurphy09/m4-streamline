// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - App Core (Minimal Test Version)
// ═══════════════════════════════════════════════════════════════════

async function renderApp() {
    const content = await renderContent();
    const modalHtml = renderModal();
    
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
            ${isLoading ? `
                <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                        <div class="flex items-center gap-3">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                            <span class="text-lg dark:text-white">${loadingMessage}</span>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <!-- Header -->
            <div class="bg-black text-white p-6 shadow-lg border-b-4 border-teal-400">
                <div class="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 class="text-3xl font-bold text-teal-400">M4 STREAMLINE</h1>
                        <p class="text-teal-400 text-sm">Logged in: ${currentUser.email}</p>
                    </div>
                    <div class="flex gap-4">
                        <button onclick="toggleDarkMode()" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm border border-teal-400">
                            ${darkMode ? '☀️' : '🌙'}
                        </button>
                        <button onclick="handleLogout()" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Tabs -->
            <div class="bg-white dark:bg-gray-800 shadow">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="flex space-x-2">
                        ${['dashboard', 'schedule', 'clients', 'quotes', 'invoices', 'expenses'].map(tab => `
                            <button onclick="switchTab('${tab}')" class="px-6 py-4 font-medium border-b-2 ${activeTab === tab ? 'border-teal-400 text-black dark:text-white' : 'border-transparent text-gray-600 dark:text-gray-400'}">
                                ${tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Content -->
            <div class="max-w-7xl mx-auto p-6">
                ${content}
            </div>
            
            <!-- Modal -->
            ${modalHtml}
        </div>
    `;
}

async function switchTab(tab) {
    activeTab = tab;
    localStorage.setItem('activeTab', tab);
    renderApp();
}

async function renderContent() {
    // Route to appropriate render function
    if (activeTab === 'dashboard') return renderDashboard();
    if (activeTab === 'quotes') return renderQuotes();
    if (activeTab === 'invoices') return renderInvoices();
    if (activeTab === 'expenses') return renderExpenses();
    if (activeTab === 'schedule') return renderSchedule();
    if (activeTab === 'clients') return renderClients();
    
    // Other tabs - placeholder for now
    return `
        <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
            <h2 class="text-2xl font-bold mb-4 dark:text-white">✅ ${activeTab.toUpperCase()} MODULE</h2>
            <p class="text-gray-600 dark:text-gray-300">This section coming next...</p>
            <div class="mt-4 p-4 bg-green-50 dark:bg-green-900 rounded">
                <p class="text-sm text-green-800 dark:text-green-200">
                    <strong>✅ WORKING MODULES:</strong>
                    <br>• Dashboard ✅
                    <br>• Clients ✅
                    <br>• Quotes ✅
                    <br>• Invoices ✅
                    <br>• Expenses ✅
                    <br>• Schedule ✅
                    <br>
                    <br><strong>⏳ Remaining:</strong> Analytics, Company, Team, Admin
                </p>
            </div>
        </div>
    `;
}

console.log('✅ App core loaded');
