// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Company Settings Module  
// ═══════════════════════════════════════════════════════════════════

function renderCompany() {
    const settings = companySettings || {};
    
    return `
        <div>
            <h2 class="text-2xl font-bold mb-6 dark:text-white">Company Settings</h2>
            
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl">
                <p class="text-gray-600 dark:text-gray-300 mb-6">Your business information will automatically appear on all quotes and invoices.</p>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">Business Name</label>
                        <input type="text" id="business_name" value="${settings.business_name || ''}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">ABN</label>
                        <input type="text" id="abn" value="${settings.abn || ''}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">Phone</label>
                        <input type="tel" id="settings_phone" value="${settings.phone || ''}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">Email</label>
                        <input type="email" id="settings_email" value="${settings.email || ''}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">Address</label>
                        <textarea id="settings_address" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" rows="2">${settings.address || ''}</textarea>
                    </div>
                    
                    <h3 class="text-lg font-bold dark:text-teal-400 mt-6 mb-4">Bank Details (for invoices)</h3>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">Bank Name</label>
                        <input type="text" id="bank_name" value="${settings.bank_name || ''}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1 dark:text-gray-200">BSB</label>
                            <input type="text" id="bsb" value="${settings.bsb || ''}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 dark:text-gray-200">Account Number</label>
                            <input type="text" id="account_number" value="${settings.account_number || ''}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">Account Name</label>
                        <input type="text" id="account_name" value="${settings.account_name || ''}" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    </div>
                    
                    <button onclick="saveCompanySettings()" class="w-full bg-black text-white px-4 py-3 rounded-lg border border-teal-400 hover:bg-gray-800 mt-6">
                        Save Company Settings
                    </button>
                </div>
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mt-6 max-w-2xl">
                <p class="text-sm text-blue-900 dark:text-blue-200">
                    <strong>📝 Note:</strong> Advanced settings (Stripe, Email, SMS) will be added in the next update.
                    For now, use your single file backup for these features.
                </p>
            </div>
        </div>
    `;
}

async function saveCompanySettings() {
    const settings = {
        user_id: currentUser.id,
        business_name: document.getElementById('business_name').value,
        abn: document.getElementById('abn').value,
        phone: document.getElementById('settings_phone').value,
        email: document.getElementById('settings_email').value,
        address: document.getElementById('settings_address').value,
        bank_name: document.getElementById('bank_name').value,
        bsb: document.getElementById('bsb').value,
        account_number: document.getElementById('account_number').value,
        account_name: document.getElementById('account_name').value
    };
    
    try {
        if (companySettings) {
            const { data, error } = await supabaseClient
                .from('company_settings')
                .update(settings)
                .eq('user_id', currentUser.id)
                .select();
            if (error) throw error;
            if (data) companySettings = data[0];
        } else {
            const { data, error } = await supabaseClient
                .from('company_settings')
                .insert([settings])
                .select();
            if (error) throw error;
            if (data) companySettings = data[0];
        }
        
        showNotification('Settings saved successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings', 'error');
    }
}

console.log('✅ Company settings module loaded');
