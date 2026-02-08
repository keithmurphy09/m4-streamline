// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Company Settings Module (COMPLETE)
// ═══════════════════════════════════════════════════════════════════

function renderCompany() {
    const settings = companySettings || {};
    const stripe = stripeSettings || {};
    const email = emailSettings || {};
    const sms = smsSettings || {};
    
    return `
        <div>
            <h2 class="text-2xl font-bold mb-6 dark:text-white">Company Settings</h2>
            
            <!-- Company Info -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl mb-6">
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
            
            <!-- Stripe Payment Settings -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl mb-6">
                <h3 class="text-lg font-bold dark:text-teal-400 mb-2">💳 Stripe Payment Settings</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">Enable online payments for your invoices. Get your API keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" class="text-teal-600 underline">Stripe Dashboard</a>.</p>
                
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                        <div>
                            <p class="font-medium dark:text-gray-200">Enable Stripe Payments</p>
                            <p class="text-xs text-gray-600 dark:text-gray-300">Turn off to show bank details instead</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="stripe_enabled" ${stripe.enabled !== false ? 'checked' : ''} class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">Publishable Key</label>
                        <input type="text" id="stripe_publishable_key" value="${stripe.publishable_key || ''}" placeholder="pk_test_... (optional)" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Starts with pk_test_ or pk_live_</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">Secret Key</label>
                        <input type="password" id="stripe_secret_key" value="${stripe.secret_key || ''}" placeholder="sk_test_... (optional)" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Starts with sk_test_ or sk_live_</p>
                    </div>
                    
                    ${stripe.enabled !== false && stripe.publishable_key ? '<div class="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded p-3 text-sm text-green-800 dark:text-green-200">✓ Stripe is enabled. Clients can pay invoices online!</div>' : '<div class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded p-3 text-sm text-yellow-800 dark:text-yellow-200">⚠ Stripe is disabled. Clients will see bank transfer details.</div>'}
                    
                    <button onclick="saveStripeSettings()" class="w-full bg-black text-white px-4 py-3 rounded-lg border border-teal-400 hover:bg-gray-800">
                        Save Stripe Settings
                    </button>
                </div>
            </div>
            
            <!-- SendGrid Email Settings -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl mb-6">
                <h3 class="text-lg font-bold dark:text-teal-400 mb-2">📧 Email Settings (SendGrid)</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">Configure email delivery for quotes and invoices. Get your API key from <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" class="text-teal-600 underline">SendGrid Dashboard</a>.</p>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">SendGrid API Key</label>
                        <input type="password" id="sendgrid_api_key" value="${email.sendgrid_api_key || ''}" placeholder="SG...." class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Starts with SG.</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">From Email (Verified in SendGrid)</label>
                        <input type="email" id="sendgrid_from_email" value="${email.from_email || settings.email || ''}" placeholder="your@email.com" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be verified in SendGrid</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-200">From Name</label>
                        <input type="text" id="sendgrid_from_name" value="${email.from_name || settings.business_name || ''}" placeholder="Your Business Name" class="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    </div>
                    
                    ${email.sendgrid_api_key ? '<div class="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded p-3 text-sm text-green-800 dark:text-green-200">✓ Email is configured. You can send quotes and invoices!</div>' : '<div class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded p-3 text-sm text-yellow-800 dark:text-yellow-200">⚠ Add your SendGrid API key to enable email sending</div>'}
                    
                    <button onclick="saveEmailSettings()" class="w-full bg-black text-white px-4 py-3 rounded-lg border border-teal-400 hover:bg-gray-800">
                        Save Email Settings
                    </button>
                </div>
            </div>
            
            <!-- SMS Settings -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl mb-6">
                <h3 class="text-lg font-bold dark:text-teal-400 mb-2">📱 SMS Notifications (Twilio)</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">Send SMS notifications to clients. Solves email delivery issues.</p>
                
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                        <div>
                            <p class="font-medium dark:text-gray-200">Enable SMS Notifications</p>
                            <p class="text-xs text-gray-600 dark:text-gray-300">Turn on to send SMS to clients</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="sms_enabled" ${sms.enabled ? 'checked' : ''} class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                    </div>
                    
                    <div class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded p-3 text-sm">
                        <p class="text-blue-900 dark:text-blue-200 font-medium mb-1">📊 SMS Usage</p>
                        <p class="text-blue-700 dark:text-blue-300">${sms.sms_count_current_month || 0} / ${sms.sms_limit || 50} SMS used this month</p>
                        <div class="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: ${Math.min(((sms.sms_count_current_month || 0) / (sms.sms_limit || 50)) * 100, 100)}%"></div>
                        </div>
                    </div>
                    
                    <h4 class="font-semibold mt-4 dark:text-white">Send SMS when:</h4>
                    
                    <label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                        <input type="checkbox" id="notify_quote_sent" ${sms.notify_quote_sent !== false ? 'checked' : ''} class="w-5 h-5 text-teal-600 rounded">
                        <div>
                            <p class="font-medium dark:text-gray-200">Quote Sent</p>
                            <p class="text-xs text-gray-600 dark:text-gray-300">Notify client when quote is ready</p>
                        </div>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                        <input type="checkbox" id="notify_invoice_sent" ${sms.notify_invoice_sent !== false ? 'checked' : ''} class="w-5 h-5 text-teal-600 rounded">
                        <div>
                            <p class="font-medium dark:text-gray-200">Invoice Sent</p>
                            <p class="text-xs text-gray-600 dark:text-gray-300">Notify client when invoice is ready</p>
                        </div>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                        <input type="checkbox" id="notify_payment_received" ${sms.notify_payment_received ? 'checked' : ''} class="w-5 h-5 text-teal-600 rounded">
                        <div>
                            <p class="font-medium dark:text-gray-200">Payment Received</p>
                            <p class="text-xs text-gray-600 dark:text-gray-300">Thank client when payment is received</p>
                        </div>
                    </label>
                    
                    <label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                        <input type="checkbox" id="notify_job_reminder" ${sms.notify_job_reminder ? 'checked' : ''} class="w-5 h-5 text-teal-600 rounded">
                        <div>
                            <p class="font-medium dark:text-gray-200">Job Reminder</p>
                            <p class="text-xs text-gray-600 dark:text-gray-300">Remind client 1 day before scheduled job</p>
                        </div>
                    </label>
                    
                    ${sms.enabled ? '<div class="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded p-3 text-sm text-green-800 dark:text-green-200">✓ SMS is enabled. Clients will receive SMS notifications!</div>' : '<div class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded p-3 text-sm text-yellow-800 dark:text-yellow-200">⚠ SMS is disabled. Turn on to start sending SMS</div>'}
                    
                    <button onclick="saveSMSSettings()" class="w-full bg-black text-white px-4 py-3 rounded-lg border border-teal-400 hover:bg-gray-800">
                        Save SMS Settings
                    </button>
                </div>
            </div>
            
            <!-- Automated Reminders -->
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl mb-6">
                <div class="mb-4">
                    <h3 class="text-lg font-bold dark:text-teal-400 mb-2">🔔 Automated Reminders</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Automatically send reminders to clients via SMS or email</p>
                </div>
                
                <div class="space-y-6">
                    <!-- Payment Reminders -->
                    <div class="border-l-4 border-orange-400 pl-4 py-2">
                        <div class="flex items-center gap-3 mb-3">
                            <input type="checkbox" id="enable_payment_reminders" ${settings.enable_payment_reminders ? 'checked' : ''} class="w-5 h-5 text-teal-600 rounded">
                            <label for="enable_payment_reminders" class="font-semibold dark:text-white">Enable Payment Reminders</label>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Automatically email clients when invoices become overdue</p>
                        
                        <div class="flex items-center gap-3">
                            <label class="text-sm dark:text-gray-300">Send reminder</label>
                            <input type="number" id="payment_reminder_days" value="${settings.payment_reminder_days || 5}" min="1" max="90" class="w-20 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 text-center">
                            <label class="text-sm dark:text-gray-300">days after invoice due date</label>
                        </div>
                    </div>
                    
                    <!-- Job Reminders -->
                    <div class="border-l-4 border-blue-400 pl-4 py-2">
                        <div class="flex items-center gap-3 mb-3">
                            <input type="checkbox" id="enable_job_reminders" ${settings.enable_job_reminders ? 'checked' : ''} class="w-5 h-5 text-teal-600 rounded">
                            <label for="enable_job_reminders" class="font-semibold dark:text-white">Enable Job Reminders</label>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Automatically send SMS (or email if no phone) 2 days before scheduled jobs</p>
                        <p class="text-xs text-gray-500 dark:text-gray-500 italic">💡 Reminder will include final payment amount if applicable</p>
                    </div>
                    
                    <button onclick="saveReminderSettings()" class="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 w-full">
                        Save Reminder Settings
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Save Functions
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

async function saveStripeSettings() {
    const publishableKey = document.getElementById('stripe_publishable_key').value.trim();
    const secretKey = document.getElementById('stripe_secret_key').value.trim();
    const enabled = document.getElementById('stripe_enabled').checked;
    
    if (publishableKey && !publishableKey.startsWith('pk_')) {
        showNotification('Invalid Publishable Key. Should start with pk_test_ or pk_live_', 'error');
        return;
    }
    
    if (secretKey && !secretKey.startsWith('sk_')) {
        showNotification('Invalid Secret Key. Should start with sk_test_ or sk_live_', 'error');
        return;
    }
    
    if (enabled && (!publishableKey || !secretKey)) {
        showNotification('Stripe is enabled but keys are missing', 'error');
        return;
    }
    
    const settings = {
        user_id: currentUser.id,
        publishable_key: publishableKey || null,
        secret_key: secretKey || null,
        enabled: enabled
    };
    
    try {
        if (stripeSettings) {
            const { data, error } = await supabaseClient
                .from('stripe_settings')
                .update(settings)
                .eq('user_id', currentUser.id)
                .select();
            if (error) throw error;
            if (data) stripeSettings = data[0];
        } else {
            const { data, error } = await supabaseClient
                .from('stripe_settings')
                .insert([settings])
                .select();
            if (error) throw error;
            if (data) stripeSettings = data[0];
        }
        
        showNotification('Stripe settings saved!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error saving Stripe settings:', error);
        showNotification('Error saving Stripe settings', 'error');
    }
}

async function saveEmailSettings() {
    const apiKey = document.getElementById('sendgrid_api_key').value.trim();
    const fromEmail = document.getElementById('sendgrid_from_email').value.trim();
    const fromName = document.getElementById('sendgrid_from_name').value.trim();
    
    if (!apiKey || !fromEmail || !fromName) {
        showNotification('Please fill in all email settings fields', 'error');
        return;
    }
    
    if (!apiKey.startsWith('SG.')) {
        showNotification('Invalid SendGrid API Key. Should start with SG.', 'error');
        return;
    }
    
    if (!fromEmail.includes('@')) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    const settings = {
        user_id: currentUser.id,
        sendgrid_api_key: apiKey,
        from_email: fromEmail,
        from_name: fromName
    };
    
    try {
        if (emailSettings) {
            const { data, error } = await supabaseClient
                .from('email_settings')
                .update(settings)
                .eq('user_id', currentUser.id)
                .select();
            if (error) throw error;
            if (data) emailSettings = data[0];
        } else {
            const { data, error} = await supabaseClient
                .from('email_settings')
                .insert([settings])
                .select();
            if (error) throw error;
            if (data) emailSettings = data[0];
        }
        
        showNotification('✅ Email settings saved! You can now send quotes and invoices.', 'success');
        renderApp();
    } catch (error) {
        console.error('Error saving email settings:', error);
        showNotification('Error saving email settings', 'error');
    }
}

async function saveSMSSettings() {
    const enabled = document.getElementById('sms_enabled').checked;
    const notify_quote_sent = document.getElementById('notify_quote_sent').checked;
    const notify_invoice_sent = document.getElementById('notify_invoice_sent').checked;
    const notify_payment_received = document.getElementById('notify_payment_received').checked;
    const notify_job_reminder = document.getElementById('notify_job_reminder').checked;
    
    const settings = {
        user_id: currentUser.id,
        enabled: enabled,
        notify_quote_sent: notify_quote_sent,
        notify_invoice_sent: notify_invoice_sent,
        notify_payment_received: notify_payment_received,
        notify_job_reminder: notify_job_reminder
    };
    
    try {
        if (smsSettings) {
            const { data, error } = await supabaseClient
                .from('sms_settings')
                .update(settings)
                .eq('user_id', currentUser.id)
                .select();
            if (error) throw error;
            if (data) smsSettings = data[0];
        } else {
            const { data, error } = await supabaseClient
                .from('sms_settings')
                .insert([settings])
                .select();
            if (error) throw error;
            if (data) smsSettings = data[0];
        }
        
        showNotification('✅ SMS settings saved!', 'success');
        renderApp();
    } catch (error) {
        console.error('Error saving SMS settings:', error);
        showNotification('Error saving SMS settings', 'error');
    }
}

async function saveReminderSettings() {
    const enable_payment_reminders = document.getElementById('enable_payment_reminders').checked;
    const payment_reminder_days = parseInt(document.getElementById('payment_reminder_days').value) || 5;
    const enable_job_reminders = document.getElementById('enable_job_reminders').checked;
    
    try {
        if (!companySettings || !companySettings.id) {
            // Create new company settings if doesn't exist
            const { data, error } = await supabaseClient
                .from('company_settings')
                .insert([{
                    user_id: currentUser.id,
                    enable_payment_reminders,
                    payment_reminder_days,
                    enable_job_reminders
                }])
                .select();
            
            if (error) throw error;
            companySettings = data[0];
        } else {
            // Update existing
            const { data, error } = await supabaseClient
                .from('company_settings')
                .update({
                    enable_payment_reminders,
                    payment_reminder_days,
                    enable_job_reminders
                })
                .eq('id', companySettings.id)
                .select();
            
            if (error) throw error;
            if (data) companySettings = data[0];
        }
        
        showNotification('Reminder settings saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving reminder settings:', error);
        showNotification('Error saving reminder settings', 'error');
    }
}

console.log('✅ Company settings module loaded (COMPLETE)');
