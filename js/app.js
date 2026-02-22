// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - App Core (Full Version)
// ═══════════════════════════════════════════════════════════════════

// Mobile menu state
let mobileMenuOpen = false;

function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-menu-overlay');
    
    if (mobileMenuOpen) {
        menu.classList.remove('-translate-x-full');
        menu.classList.add('translate-x-0');
        overlay.classList.remove('hidden');
    } else {
        menu.classList.remove('translate-x-0');
        menu.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
}

function closeMobileMenu() {
    mobileMenuOpen = false;
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-menu-overlay');
    menu.classList.remove('translate-x-0');
    menu.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
}

function switchTabMobile(tab) {
    switchTab(tab);
    closeMobileMenu();
}

async function renderApp() {
    // Calculate trial banner
    let trialBanner = '';
    if (useDemoData) {
        const demoType = demoMode === 'sole_trader' ? 'Sole Trader' : 'Business';
        trialBanner = `<div class="bg-orange-500 text-white text-center py-2 text-sm font-bold">🎬 DEMO MODE (${demoType}) - Sample Data Only</div>`;
    } else if (subscription && subscription.subscription_status === 'trial' && !isAdmin) {
        const trialEnds = new Date(subscription.trial_ends_at);
        const now = new Date();
        const daysLeft = Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0) {
            trialBanner = `<div class="bg-yellow-500 text-black text-center py-2 text-sm font-medium">⏰ Trial: ${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining</div>`;
        }
    }
    
    const content = await renderContent();
    const modalHtml = renderModal();
    
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
            ${trialBanner}
            
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
            <div class="bg-black text-white p-4 md:p-6 shadow-lg border-b-4 border-teal-400">
                <div class="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-3 gap-4 md:items-center">
                    <!-- Logo + User -->
                    <div class="flex items-center gap-3 justify-center md:justify-start">
                        <img src="final_logo.png" alt="M4 Logo" class="h-20 w-20 md:h-32 md:w-32 object-contain">
                        <div class="text-xs md:text-sm">
                            <div class="text-xs text-teal-400">Logged in:</div>
                            <div class="font-medium text-teal-400 truncate">${currentUser.email}</div>
                        </div>
                    </div>
                    
                    <!-- Title (Centered) -->
                    <div class="text-center">
                        <h1 class="text-2xl md:text-3xl font-bold text-teal-400">M4 STREAMLINE</h1>
                        <p class="text-teal-400 text-xs md:text-sm italic">"streamlining your business"</p>
                    </div>
                    
                    <!-- Controls -->
                    <div class="flex items-center justify-center md:justify-end gap-3 md:gap-4">
                        ${isAdmin ? '<span class="bg-red-600 px-2 py-1 rounded text-xs font-bold">ADMIN</span>' : ''}
                        
                        ${isAdmin ? `
                            <button onclick="enterDemoMode('sole_trader');" class="no-glow px-3 py-2 md:px-4 md:py-2 bg-white rounded-lg text-xs border border-teal-400 text-gray-700" style="transition: box-shadow 0.2s ease;">
                                Sole Trader
                            </button>
                            <button onclick="enterDemoMode('business');" class="no-glow px-3 py-2 md:px-4 md:py-2 bg-white rounded-lg text-xs border border-teal-400 text-gray-700" style="transition: box-shadow 0.2s ease;">
                                Business
                            </button>
                            <button onclick="exitDemoMode();" class="no-glow px-3 py-2 md:px-4 md:py-2 bg-white rounded-lg text-xs border border-teal-400 text-gray-700" style="transition: box-shadow 0.2s ease;">
                                Real
                            </button>
                        ` : ''}
                        
                        <button onclick="toggleDarkMode()" class="no-glow px-3 py-2 md:px-4 md:py-2 bg-white rounded-lg text-sm border border-teal-400" style="transition: box-shadow 0.2s ease;">
                            ${darkMode ? '☀️' : '🌙'}
                        </button>
                        
                        <div class="relative">
                            <button onclick="toggleSettingsMenu()" class="no-glow px-3 py-2 md:px-4 md:py-2 bg-white rounded-lg text-sm border border-teal-400 flex items-center gap-2" style="transition: box-shadow 0.2s ease;">
                                <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                            </button>
                            
                            <div id="settings-menu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                <div class="py-1">
                                    <button onclick="handleLogout()" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                        </svg>
                                        Logout
                                    </button>
                                    <a href="mailto:m4projectsanddesigns@gmail.com?subject=M4 Streamline Support Request" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                        </svg>
                                        Contact Support
                                    </a>
                                    <button onclick="downloadUserGuide()" class="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                        </svg>
                                        📚 User Guide
                                    </button>
                                    ${subscription?.account_type === 'sole_trader' ? `
                                        <button onclick="confirmUpgradeToBusiness()" class="w-full text-left px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                            Upgrade to Business
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Navigation with Dropdowns -->
            <div class="bg-white dark:bg-gray-800 border-b border-teal-400">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="flex items-center justify-between h-16">
                        <div class="flex items-center gap-3 md:gap-8">
                            <!-- Hamburger Menu (Mobile Only) -->
                            <button onclick="toggleMobileMenu()" class="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                            </button>
                            
                            <div class="text-teal-400 text-2xl font-bold cursor-pointer" onclick="switchTab('dashboard')">M4</div>
                            
                            <nav class="hidden md:flex gap-1">
                                <button onclick="switchTab('dashboard')" class="px-4 py-2 text-sm font-medium ${activeTab === 'dashboard' ? 'text-teal-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'} rounded transition-colors">
                                    Dashboard
                                </button>
                                
                                <button onclick="switchTab('schedule')" class="px-4 py-2 text-sm font-medium ${activeTab === 'schedule' ? 'text-teal-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'} rounded transition-colors">
                                    Schedule
                                </button>
                                
                                <!-- Customers Dropdown -->
                                <div class="relative group">
                                    <button class="px-4 py-2 text-sm font-medium ${['clients', 'quotes', 'invoices'].includes(activeTab) ? 'text-teal-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'} rounded transition-colors flex items-center gap-1">
                                        Customers
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div class="hidden group-hover:block absolute top-full left-0 pt-2 -mt-2 w-48 z-50">
                                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                                            <button onclick="switchTab('clients')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${activeTab === 'clients' ? 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500' : ''}">Clients</button>
                                            <button onclick="switchTab('quotes')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${activeTab === 'quotes' ? 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500' : ''}">Quotes</button>
                                            <button onclick="switchTab('invoices')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${activeTab === 'invoices' ? 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500' : ''}">Invoices</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Accounts Dropdown -->
                                <div class="relative group">
                                    <button class="px-4 py-2 text-sm font-medium ${['analytics', 'expenses', 'cashflow'].includes(activeTab) ? 'text-teal-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'} rounded transition-colors flex items-center gap-1">
                                        Accounts
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div class="hidden group-hover:block absolute top-full left-0 pt-2 -mt-2 w-48 z-50">
                                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                                            <button onclick="switchTab('analytics')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${activeTab === 'analytics' ? 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500' : ''}">Analytics</button>
                                            <button onclick="switchTab('expenses')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${activeTab === 'expenses' ? 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500' : ''}">Expenses</button>
                                            <button onclick="switchTab('cashflow')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${activeTab === 'cashflow' ? 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500' : ''}">Cash Flow</button>
                                            <button onclick="switchTab('budget')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${activeTab === 'budget' ? 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500' : ''}">Budget</button>
                                            <button onclick="switchTab('reports')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${activeTab === 'reports' ? 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500' : ''}">Reports</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Company Dropdown -->
                                <div class="relative group">
                                    <button class="px-4 py-2 text-sm font-medium ${['company', 'team', 'admin'].includes(activeTab) ? 'text-teal-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'} rounded transition-colors flex items-center gap-1">
                                        Company
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div class="hidden group-hover:block absolute top-full left-0 pt-2 -mt-2 w-48 z-50">
                                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                                            <button onclick="switchTab('company')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${activeTab === 'company' ? 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500' : ''}">Company Info</button>
                                            ${getAccountType() === 'business' ? `<button onclick="switchTab('team')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${activeTab === 'team' ? 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500' : ''}">Team</button>` : ''}
                                            ${isAdmin ? `<button onclick="switchTab('admin')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${activeTab === 'admin' ? 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-500' : ''}">Admin Panel</button>` : ''}
                                        </div>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Mobile Slide-Out Menu -->
            <div id="mobile-menu-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onclick="closeMobileMenu()"></div>
            <div id="mobile-menu" class="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 transform -translate-x-full transition-transform duration-300 z-50 md:hidden overflow-y-auto">
                <div class="p-6">
                    <!-- Close Button -->
                    <button onclick="closeMobileMenu()" class="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    
                    <!-- Logo -->
                    <div class="mb-8 mt-2">
                        <div class="text-teal-400 text-2xl font-bold">M4 STREAMLINE</div>
                        <div class="text-teal-400 text-xs italic">"streamlining your business"</div>
                    </div>
                    
                    <!-- Navigation Items -->
                    <div class="space-y-1">
                        <button onclick="switchTabMobile('dashboard')" class="w-full text-left px-4 py-3 text-base font-medium ${activeTab === 'dashboard' ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r">
                            Dashboard
                        </button>
                        
                        <button onclick="switchTabMobile('schedule')" class="w-full text-left px-4 py-3 text-base font-medium ${activeTab === 'schedule' ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r">
                            Schedule
                        </button>
                        
                        <div class="pt-4 pb-2 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Customers</div>
                        
                        <button onclick="switchTabMobile('clients')" class="w-full text-left px-4 py-3 text-base ${activeTab === 'clients' ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r">
                            Clients
                        </button>
                        
                        <button onclick="switchTabMobile('quotes')" class="w-full text-left px-4 py-3 text-base ${activeTab === 'quotes' ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r">
                            Quotes
                        </button>
                        
                        <button onclick="switchTabMobile('invoices')" class="w-full text-left px-4 py-3 text-base ${activeTab === 'invoices' ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r">
                            Invoices
                        </button>
                        
                        <div class="pt-4 pb-2 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Accounts</div>
                        
                        <button onclick="switchTabMobile('analytics')" class="w-full text-left px-4 py-3 text-base ${activeTab === 'analytics' ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r">
                            Analytics
                        </button>
                        
                        <button onclick="switchTabMobile('expenses')" class="w-full text-left px-4 py-3 text-base ${activeTab === 'expenses' ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r">
                            Expenses
                        </button>
                        
                        <button onclick="switchTabMobile('cashflow')" class="w-full text-left px-4 py-3 text-base ${activeTab === 'cashflow' ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r">
                            Cash Flow
                        </button>
                        
                        <button onclick="switchTabMobile('budget')" class="w-full text-left px-4 py-3 text-base ${activeTab === 'budget' ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r">
                            Budget
                        </button>
                        
                        <button onclick="switchTabMobile('reports')" class="w-full text-left px-4 py-3 text-base ${activeTab === 'reports' ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r">
                            Reports
                        </button>
                        
                        <div class="pt-4 pb-2 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Company</div>
                        
                        <button onclick="switchTabMobile('company')" class="w-full text-left px-4 py-3 text-base ${activeTab === 'company' ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r">
                            Company Info
                        </button>
                        
                        ${getAccountType() === 'business' ? `
                        <button onclick="switchTabMobile('team')" class="w-full text-left px-4 py-3 text-base ${activeTab === 'team' ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r">
                            Team
                        </button>
                        ` : ''}
                        
                        ${isAdmin ? `
                        <button onclick="switchTabMobile('admin')" class="w-full text-left px-4 py-3 text-base ${activeTab === 'admin' ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'} rounded-r">
                            Admin Panel
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Content -->
            <div class="max-w-7xl mx-auto p-3 md:p-6">
                ${content}
            </div>
            
            <!-- Mobile Bottom Navigation -->
            <nav class="mobile-nav md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50" style="padding-bottom: env(safe-area-inset-bottom);">
                <div class="flex justify-around py-2">
                    <button onclick="switchTab('dashboard')" class="flex flex-col items-center px-3 py-2 ${activeTab === 'dashboard' ? 'text-teal-600' : 'text-gray-600 dark:text-gray-400'}">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                        </svg>
                        <span class="text-xs mt-1">Home</span>
                    </button>
                    <button onclick="switchTab('quotes')" class="flex flex-col items-center px-3 py-2 ${activeTab === 'quotes' ? 'text-teal-600' : 'text-gray-600 dark:text-gray-400'}">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-xs mt-1">Quotes</span>
                    </button>
                    <button onclick="switchTab('invoices')" class="flex flex-col items-center px-3 py-2 ${activeTab === 'invoices' ? 'text-teal-600' : 'text-gray-600 dark:text-gray-400'}">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z"/>
                        </svg>
                        <span class="text-xs mt-1">Invoices</span>
                    </button>
                    <button onclick="switchTab('schedule')" class="flex flex-col items-center px-3 py-2 ${activeTab === 'schedule' ? 'text-teal-600' : 'text-gray-600 dark:text-gray-400'}">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-xs mt-1">Schedule</span>
                    </button>
                    <button onclick="switchTab('company')" class="flex flex-col items-center px-3 py-2 ${activeTab === 'company' ? 'text-teal-600' : 'text-gray-600 dark:text-gray-400'}">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-xs mt-1">Settings</span>
                    </button>
                </div>
            </nav>
            
            <!-- Modal -->
            ${modalHtml}
        </div>
    `;
    
    // Initialize dashboard charts
    if (activeTab === 'dashboard') {
        setTimeout(() => initializeDashboardCharts(), 100);
    }
    
    // Initialize charts if on analytics tab
    if (activeTab === 'analytics') {
        setTimeout(() => initializeCharts(), 100);
    }
    
    // Initialize cash flow chart
    if (activeTab === 'cashflow') {
        setTimeout(() => initializeCashFlowChart(), 100);
    }
}

function toggleSettingsMenu() {
    const menu = document.getElementById('settings-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

async function switchTab(tab) {
    activeTab = tab;
    localStorage.setItem('activeTab', tab);
    
    // Close any detail views when switching tabs
    if (typeof selectedQuoteForDetail !== 'undefined') selectedQuoteForDetail = null;
    if (typeof selectedInvoiceForDetail !== 'undefined') selectedInvoiceForDetail = null;
    
    renderApp();
}

async function renderContent() {
    // Route to appropriate render function
    if (activeTab === 'dashboard') return renderDashboard();
    if (activeTab === 'schedule') return renderSchedule();
    if (activeTab === 'clients') return renderClients();
    if (activeTab === 'quotes') return renderQuotes();
    if (activeTab === 'invoices') return renderInvoices();
    if (activeTab === 'expenses') return renderExpenses();
    if (activeTab === 'analytics') return renderAnalytics();
    if (activeTab === 'cashflow') return renderCashFlow();
    if (activeTab === 'budget') return renderBudget();
    if (activeTab === 'reports') return renderReports();
    if (activeTab === 'company') return renderCompany();
    if (activeTab === 'team') return renderTeam();
    if (activeTab === 'admin') return renderAdmin();
    
    // Fallback for unknown tabs
    return `
        <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
            <h2 class="text-2xl font-bold mb-4 dark:text-white">${activeTab.toUpperCase()}</h2>
            <p class="text-gray-600 dark:text-gray-300">Section not found.</p>
        </div>
    `;
}

// Close settings menu when clicking outside
document.addEventListener('click', function(event) {
    const menu = document.getElementById('settings-menu');
    const button = event.target.closest('button[onclick="toggleSettingsMenu()"]');
    if (menu && !menu.contains(event.target) && !button) {
        menu.classList.add('hidden');
    }
});

console.log('✅ App core loaded (full version');
