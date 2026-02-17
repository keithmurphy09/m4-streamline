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
                    
                    <h3 class="text-lg font-bold dark:text-teal-400 mt-6 mb-4">🎨 Company Logo</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">Upload your company logo to appear on quotes and invoices. Recommended size: 500x500px or larger.</p>
                    <p class="text-xs text-teal-600 dark:text-teal-400 mb-4">💡 If no logo is uploaded, the M4 Streamline logo will be used as default.</p>
                    
                    <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                        <div class="mb-4">
                            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                ${settings.logo_url ? 'Your Logo:' : 'Current Logo (Default):'}
                            </p>
                            <img src="${settings.logo_url || 'final_logo.png'}" alt="Company Logo" class="h-32 w-auto object-contain border border-gray-200 dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-800">
                            ${!settings.logo_url ? '<p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">M4 Streamline Logo (Default)</p>' : ''}
                        </div>
                        
                        <div class="flex gap-2">
                            <label class="flex-1 cursor-pointer">
                                <input type="file" accept="image/*" onchange="uploadCompanyLogo(this)" class="hidden" id="logo-upload-input">
                                <div class="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-center font-medium transition-colors">
                                    ${settings.logo_url ? 'Change Logo' : 'Upload Custom Logo'}
                                </div>
                            </label>
                            ${settings.logo_url ? `
                                <button onclick="removeCompanyLogo()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                                    Remove
                                </button>
                            ` : ''}
                        </div>
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

async function uploadCompanyLogo(input) {
    const file = input.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image must be less than 5MB', 'error');
        return;
    }
    
    try {
        showNotification('Uploading logo...', 'info');
        
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${currentUser.id}-${Date.now()}.${fileExt}`;
        const filePath = fileName; // Changed: don't include folder in path
        
        console.log('📤 Uploading file:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('company-logos')
            .upload(filePath, file);
        
        if (uploadError) {
            console.error('❌ Storage upload error:', uploadError);
            
            // Check if bucket exists
            if (uploadError.message?.includes('Bucket not found') || uploadError.statusCode === 404) {
                showNotification('❌ Storage bucket "company-logos" not found. Please create it in Supabase Dashboard.', 'error');
                return;
            }
            
            throw uploadError;
        }
        
        console.log('✅ File uploaded:', uploadData);
        
        // Get public URL
        const { data: urlData } = supabaseClient.storage
            .from('company-logos')
            .getPublicUrl(filePath);
        
        const logoUrl = urlData.publicUrl;
        console.log('🔗 Logo URL:', logoUrl);
        
        // Update company settings with logo URL
        if (companySettings?.id) {
            // Update existing record
            console.log('📝 Updating existing settings, ID:', companySettings.id);
            
            const { data: updateData, error: updateError } = await supabaseClient
                .from('company_settings')
                .update({ logo_url: logoUrl })
                .eq('id', companySettings.id)
                .select();
            
            if (updateError) {
                console.error('❌ Update error:', updateError);
                
                // Check if column exists
                if (updateError.message?.includes('column') && updateError.message?.includes('logo_url')) {
                    showNotification('❌ Database error: logo_url column missing. Run: ALTER TABLE company_settings ADD COLUMN logo_url TEXT;', 'error');
                    return;
                }
                
                throw updateError;
            }
            
            console.log('✅ Settings updated:', updateData);
            if (updateData && updateData[0]) {
                companySettings = updateData[0];
            }
        } else {
            // Insert new record
            console.log('📝 Creating new settings record');
            
            const newSettings = {
                user_id: currentUser.id,
                logo_url: logoUrl,
                business_name: '',
                abn: '',
                phone: '',
                email: '',
                address: ''
            };
            
            const { data: insertData, error: insertError } = await supabaseClient
                .from('company_settings')
                .insert([newSettings])
                .select();
            
            if (insertError) {
                console.error('❌ Insert error:', insertError);
                
                // Check if column exists
                if (insertError.message?.includes('column') && insertError.message?.includes('logo_url')) {
                    showNotification('❌ Database error: logo_url column missing. Run: ALTER TABLE company_settings ADD COLUMN logo_url TEXT;', 'error');
                    return;
                }
                
                throw insertError;
            }
            
            console.log('✅ Settings created:', insertData);
            if (insertData && insertData[0]) {
                companySettings = insertData[0];
            }
        }
        
        // Update local state
        if (companySettings) {
            companySettings.logo_url = logoUrl;
        }
        
        showNotification('✅ Logo uploaded successfully!', 'success');
        renderApp();
    } catch (error) {
        console.error('❌ Error uploading logo:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            details: error.details
        });
        
        showNotification(`Failed to upload logo: ${error.message || 'Unknown error'}`, 'error');
    }
    
    // Reset input
    input.value = '';
}

async function removeCompanyLogo() {
    if (!confirm('Are you sure you want to remove your company logo?')) {
        return;
    }
    
    try {
        // Remove from company settings
        if (companySettings?.id) {
            const { error } = await supabaseClient
                .from('company_settings')
                .update({ logo_url: null })
                .eq('id', companySettings.id);
            
            if (error) throw error;
        }
        
        // Update local state
        if (companySettings) companySettings.logo_url = null;
        
        showNotification('✅ Logo removed', 'success');
        renderApp();
    } catch (error) {
        console.error('Error removing logo:', error);
        showNotification('Failed to remove logo', 'error');
    }
}

// ============= TEAM MANAGEMENT =============
function renderTeam() {
    if (getAccountType() !== 'business') {
        return `<div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
            <h2 class="text-2xl font-bold mb-4 dark:text-white">Team Management</h2>
            <p class="text-gray-600 dark:text-gray-300">Only available for Business accounts</p>
            <button onclick="switchTab('company')" class="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 mt-4 px-4 py-2 rounded-lg transition-colors">Back</button>
        </div>`;
    }
    
    return `<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold dark:text-white">Team Management</h1>
            <div class="flex gap-2">
                <button onclick="editingItem = null; openModal('team_member')" class="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 px-4 py-2 rounded-lg transition-colors">+ Add Team Member</button>
                <button onclick="switchTab('company')" class="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 px-4 py-2 rounded-lg transition-colors">Back</button>
            </div>
        </div>
        ${teamMembers.length === 0 ? '<p class="text-gray-500">No team members</p>' : `
            <table class="w-full">
                <thead class="bg-gray-100 dark:bg-gray-900">
                    <tr>
                        <th class="px-6 py-3 text-left">Name</th>
                        <th class="px-6 py-3 text-left">Occupation</th>
                        <th class="px-6 py-3 text-left">Email</th>
                        <th class="px-6 py-3 text-left">Phone</th>
                        <th class="px-6 py-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${teamMembers.map(m => `<tr class="border-t dark:border-gray-700">
                        <td class="px-6 py-4">${m.name}</td>
                        <td class="px-6 py-4 text-teal-600">${m.occupation || '-'}</td>
                        <td class="px-6 py-4">${m.email || '-'}</td>
                        <td class="px-6 py-4">${m.phone || '-'}</td>
                        <td class="px-6 py-4">
                            <button onclick="editTeamMember('${m.id}')" class="px-3 py-1 bg-blue-600 text-white rounded text-sm mr-2">Edit</button>
                            <button onclick="deleteTeamMember('${m.id}')" class="px-3 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>
        `}
    </div>`;
}

// ============= ADMIN PANEL =============
async function renderAdmin() {
    if (!isAdmin) {
        return `<div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
            <h2 class="text-2xl font-bold mb-4 dark:text-white">Admin Panel</h2>
            <p class="text-gray-600 dark:text-gray-300">Admin access required</p>
            <button onclick="switchTab('company')" class="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 mt-4 px-4 py-2 rounded-lg transition-colors">Back</button>
        </div>`;
    }
    
    let users = [];
    try {
        const { data: subsData } = await supabaseClient.from('subscriptions').select('*').order('created_at', { ascending: false });
        users = subsData || [];
    } catch (e) {
        console.error('Error:', e);
    }
    
    const active = users.filter(u => u.subscription_status === 'active');
    const trial = users.filter(u => u.subscription_status === 'trial');
    
    return `<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold dark:text-white">Admin Panel</h1>
            <button onclick="switchTab('company')" class="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-400 px-4 py-2 rounded-lg transition-colors">Back</button>
        </div>
        
        <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                <div class="text-xs text-blue-600">Total Users</div>
                <div class="text-2xl font-bold text-blue-900 dark:text-blue-300">${users.length}</div>
            </div>
            <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                <div class="text-xs text-green-600">Active</div>
                <div class="text-2xl font-bold text-green-900 dark:text-green-300">${active.length}</div>
            </div>
            <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                <div class="text-xs text-yellow-600">Trial</div>
                <div class="text-2xl font-bold text-yellow-900 dark:text-yellow-300">${trial.length}</div>
            </div>
            <div class="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200">
                <div class="text-xs text-teal-600">System</div>
                <div class="text-sm font-bold text-teal-900 dark:text-teal-300">✓ Online</div>
            </div>
        </div>
        
        <h2 class="text-lg font-bold mb-4 dark:text-white">All Users</h2>
        ${users.length === 0 ? '<p class="text-gray-500">No users found</p>' : `
            <table class="w-full">
                <thead class="bg-gray-100 dark:bg-gray-900">
                    <tr>
                        <th class="px-6 py-3 text-left">Email</th>
                        <th class="px-6 py-3 text-left">Account Type</th>
                        <th class="px-6 py-3 text-left">Status</th>
                        <th class="px-6 py-3 text-left">Created</th>
                        <th class="px-6 py-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(u => `<tr class="border-t dark:border-gray-700">
                        <td class="px-6 py-4 font-medium">${u.user_email || u.user_id}</td>
                        <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs ${u.account_type === 'business' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">${u.account_type === 'business' ? 'Business' : 'Sole Trader'}</span></td>
                        <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs ${u.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${u.subscription_status || 'trial'}</span></td>
                        <td class="px-6 py-4">${u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                        <td class="px-6 py-4">
                            <button onclick="toggleUserStatus('${u.id}', '${u.subscription_status}')" class="px-3 py-1 bg-teal-600 text-white rounded text-xs">${u.subscription_status === 'active' ? 'Set Trial' : 'Activate'}</button>
                                        <div class="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Discount</div>
                                            <div class="flex items-center gap-1 mb-1">
                                                <input type="number" id="discount_${u.id}" value="${u.discount_percent || 0}" min="0" max="100" class="w-14 px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:text-white">
                                                <span class="text-xs text-gray-500">%</span>
                                                <select id="discount_months_${u.id}" class="px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:text-white">
                                                    <option value="">Indefinite</option>
                                                    <option value="1" ${u.discount_months == 1 ? 'selected' : ''}>1 month</option>
                                                    <option value="2" ${u.discount_months == 2 ? 'selected' : ''}>2 months</option>
                                                    <option value="3" ${u.discount_months == 3 ? 'selected' : ''}>3 months</option>
                                                    <option value="6" ${u.discount_months == 6 ? 'selected' : ''}>6 months</option>
                                                    <option value="12" ${u.discount_months == 12 ? 'selected' : ''}>12 months</option>
                                                </select>
                                            </div>
                                            ${u.discount_percent > 0 && u.discount_start_date ? `<div class="text-xs text-gray-400 mb-1">Started: ${new Date(u.discount_start_date).toLocaleDateString()}${u.discount_months ? ` · Ends: ${new Date(new Date(u.discount_start_date).setMonth(new Date(u.discount_start_date).getMonth() + u.discount_months)).toLocaleDateString()}` : ' · Indefinite'}</div>` : ''}
                                            <button onclick="saveDiscount('${u.id}')" class="w-full px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600">Save Discount</button>
                                            ${u.discount_percent > 0 ? `<button onclick="removeDiscount('${u.id}')" class="w-full px-2 py-1 mt-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">Remove Discount</button>` : ''}
                                        </div>
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>
        `}
    </div>`;
}

// Edit team member - safe lookup by ID
function editTeamMember(id) {
    const member = teamMembers.find(m => m.id === id);
    openModal("team_member", member);
}

// Delete team member
async function deleteTeamMember(id) {
    if (!confirm('Delete this team member?')) return;
    try {
        await supabaseClient.from('team_members').delete().eq('id', id);
        teamMembers = teamMembers.filter(m => m.id !== id);
        showNotification('Team member deleted', 'success');
        renderApp();
    } catch (e) {
        showNotification('Failed to delete', 'error');
    }
}

// Save discount for a user
async function saveDiscount(id) {
    const percent = parseFloat(document.getElementById('discount_' + id).value) || 0;
    const months = document.getElementById('discount_months_' + id).value;
    if (percent < 0 || percent > 100) { showNotification('Discount must be 0-100%', 'error'); return; }
    try {
        await supabaseClient.from('subscriptions').update({
            discount_percent: percent,
            discount_months: months ? parseInt(months) : null,
            discount_start_date: percent > 0 ? new Date().toISOString() : null
        }).eq('id', id);
        showNotification(`Discount set to ${percent}%${months ? ' for ' + months + ' months' : ' indefinitely'}`, 'success');
        renderApp();
    } catch (e) {
        showNotification('Failed to save discount', 'error');
    }
}

// Remove discount
async function removeDiscount(id) {
    try {
        await supabaseClient.from('subscriptions').update({
            discount_percent: 0,
            discount_months: null,
            discount_start_date: null
        }).eq('id', id);
        showNotification('Discount removed', 'success');
        renderApp();
    } catch (e) {
        showNotification('Failed to remove discount', 'error');
    }
}

// Toggle user status
async function toggleUserStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'trial' : 'active';
    try {
        await supabaseClient.from('subscriptions').update({ subscription_status: newStatus }).eq('id', id);
        showNotification(`Status updated to ${newStatus}`, 'success');
        renderApp();
    } catch (e) {
        showNotification('Failed to update', 'error');
    }
}

console.log('✅ Company settings module loaded (COMPLETE)');
