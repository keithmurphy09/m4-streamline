// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Authentication Module
// ═══════════════════════════════════════════════════════════════════

async function checkAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const quoteToken = urlParams.get('quote');
    
    if (quoteToken) {
        window.location.href = 'quote-viewer.html?quote=' + quoteToken;
        return;
    }
    
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const access_token = hashParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token');
    
    if (access_token && refresh_token) {
        await supabaseClient.auth.setSession({
            access_token,
            refresh_token
        });
        window.location.hash = '';
        window.location.href = window.location.pathname;
        return;
    }
    
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        currentUser = session.user;
        await loadAllData();
        setupSessionTimeout();
        renderApp();
    } else {
        renderAuth();
    }
}

function renderAuth() {
    document.getElementById('app').innerHTML = `<div class="min-h-screen flex items-center justify-center bg-black"><div class="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full"><div class="text-center mb-8"><div class="text-teal-400 text-5xl font-bold mb-2">M4</div><h1 class="text-2xl font-bold text-black dark:text-white">Streamline</h1><p class="text-gray-600 dark:text-gray-300 mt-2">Business Management</p></div><div class="bg-teal-50 border-l-4 border-teal-400 p-4 mb-6 rounded"><p class="text-sm font-medium text-teal-900 mb-1">🎉 Start Your Free Trial</p><p class="text-xs text-teal-700">14 days free • Cancel anytime</p></div><div id="signup-section"><h3 class="text-lg font-bold dark:text-teal-400 mb-4 text-center">Choose Your Account Type</h3><div class="grid grid-cols-2 gap-4 mb-6"><div onclick="selectedAccountType='sole_trader'; renderAuth();" class="cursor-pointer p-4 border-2 rounded-lg ${selectedAccountType === 'sole_trader' ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-200'}"><div class="text-center"><div class="text-2xl mb-2">👤</div><h4 class="font-bold mb-1">Sole Trader</h4><p class="text-xs text-gray-600 dark:text-gray-300 mb-2">Perfect for individuals</p><p class="text-2xl font-bold text-teal-600">$19.99<span class="text-sm text-gray-500 dark:text-gray-400">/mo</span></p></div></div><div onclick="selectedAccountType='business'; renderAuth();" class="cursor-pointer p-4 border-2 rounded-lg ${selectedAccountType === 'business' ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-200'}"><div class="text-center"><div class="text-2xl mb-2">👥</div><h4 class="font-bold mb-1">Business</h4><p class="text-xs text-gray-600 dark:text-gray-300 mb-2">Teams & job assignments</p><p class="text-2xl font-bold text-teal-600">$49.99<span class="text-sm text-gray-500 dark:text-gray-400">/mo</span></p></div></div></div><div><input type="email" id="email" placeholder="Email" class="w-full px-4 py-3 border rounded-lg mb-3"><input type="password" id="password" placeholder="Password" class="w-full px-4 py-3 border rounded-lg mb-2"><div class="text-xs text-gray-500 dark:text-gray-400 mb-4 pl-1">Password must be 8+ characters with uppercase, lowercase, and number</div><button onclick="handleLogin()" class="w-full bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 border-2 border-teal-400 mb-3">Sign In</button><button onclick="handleSignup()" class="w-full bg-white text-black px-4 py-3 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-black">Start Free Trial - ${selectedAccountType === 'sole_trader' ? 'Sole Trader' : 'Business'}</button><div id="auth-error" class="mt-3 text-red-600 text-sm text-center"></div></div></div></div></div>`;
}

async function handleLogin() {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ 
        email: document.getElementById('email').value, 
        password: document.getElementById('password').value 
    });
    if (error) document.getElementById('auth-error').textContent = error.message;
    else { currentUser = data.user; await loadAllData(); renderApp(); }
}

async function handleSignup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('auth-error');
    
    if (password.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters long';
        errorDiv.className = 'mt-3 text-red-600 text-sm text-center';
        return;
    }
    if (!/[A-Z]/.test(password)) {
        errorDiv.textContent = 'Password must contain at least one uppercase letter';
        errorDiv.className = 'mt-3 text-red-600 text-sm text-center';
        return;
    }
    if (!/[a-z]/.test(password)) {
        errorDiv.textContent = 'Password must contain at least one lowercase letter';
        errorDiv.className = 'mt-3 text-red-600 text-sm text-center';
        return;
    }
    if (!/[0-9]/.test(password)) {
        errorDiv.textContent = 'Password must contain at least one number';
        errorDiv.className = 'mt-3 text-red-600 text-sm text-center';
        return;
    }
    
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
        errorDiv.textContent = error.message;
        errorDiv.className = 'mt-3 text-red-600 text-sm text-center';
    } else { 
        errorDiv.textContent = 'Success! Please check your email to verify your account before logging in.'; 
        errorDiv.className = 'mt-3 text-green-600 text-sm text-center'; 
    }
}

async function handleLogout() { 
    clearTimeout(sessionTimeout);
    await supabaseClient.auth.signOut(); 
    currentUser = null;
    activeTab = 'dashboard';
    localStorage.setItem('activeTab', 'dashboard');
    renderAuth(); 
}

async function loadAllData() {
    isLoading = true;
    loadingMessage = 'Loading your data...';
    if (typeof renderApp === 'function') renderApp();
    
    try {
        if (useDemoData) {
            clients = demoClients;
            jobs = demoJobs;
            quotes = demoQuotes;
            invoices = demoInvoices;
            expenses = demoExpenses;
            teamMembers = demoTeamMembers;
            return;
        }
        
        const [c, j, q, i, e, s, sub, admin, team, stripe, pay, email, sms] = await Promise.all([
            supabaseClient.from('clients').select('*'), 
            supabaseClient.from('jobs').select('*'), 
            supabaseClient.from('quotes').select('*'), 
            supabaseClient.from('invoices').select('*'),
            supabaseClient.from('expenses').select('*'),
            supabaseClient.from('company_settings').select('*').eq('user_id', currentUser.id).single(),
            supabaseClient.from('subscriptions').select('*').eq('user_id', currentUser.id).single(),
            supabaseClient.from('admin_users').select('*').eq('user_id', currentUser.id).single(),
            supabaseClient.from('team_members').select('*').eq('account_owner_id', currentUser.id),
            supabaseClient.from('stripe_settings').select('*').eq('user_id', currentUser.id).single(),
            supabaseClient.from('payments').select('*'),
            supabaseClient.from('email_settings').select('*').eq('user_id', currentUser.id).single(),
            supabaseClient.from('sms_settings').select('*').eq('user_id', currentUser.id).single()
        ]);
        
        clients = c.data || []; 
        jobs = j.data || []; 
        quotes = q.data || []; 
        invoices = i.data || [];
        expenses = e.data || [];
        companySettings = s.data || null;
        subscription = sub.data || null;
        isAdmin = admin.data?.is_admin || false;
        teamMembers = team.data || [];
        stripeSettings = stripe.data || null;
        payments = pay.data || [];
        emailSettings = email.data || null;
        smsSettings = sms.data || null;
        
        if (!subscription) {
            const { data: trialCheck } = await supabaseClient
                .from('trial_emails')
                .select('email')
                .eq('email', currentUser.email.toLowerCase())
                .single();
            
            const accountType = selectedAccountType || 'sole_trader';
            const monthlyRate = accountType === 'business' ? 49.99 : 19.99;
            
            if (trialCheck) {
                const { data } = await supabaseClient.from('subscriptions').insert([{
                    user_id: currentUser.id,
                    trial_ends_at: new Date(Date.now() - 1000).toISOString(),
                    subscription_status: 'trial',
                    account_type: accountType,
                    monthly_rate: monthlyRate
                }]).select().single();
                subscription = data;
            } else {
                const { data } = await supabaseClient.from('subscriptions').insert([{
                    user_id: currentUser.id,
                    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    subscription_status: 'trial',
                    account_type: accountType,
                    monthly_rate: monthlyRate
                }]).select().single();
                subscription = data;
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
        alert('⚠️ Error loading data: ' + error.message);
    } finally {
        isLoading = false;
        loadingMessage = 'Loading...';
    }
}

console.log('✅ Auth loaded');
