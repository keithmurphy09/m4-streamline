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

// Team Management Page
function renderTeam() {
    if (getAccountType() !== 'business') {
        return `
            <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                <h2 class="text-2xl font-bold mb-4 dark:text-white">Team Management</h2>
                <p class="text-gray-600 dark:text-gray-300 mb-4">Team management is only available for Business accounts.</p>
                <button onclick="switchTab('company')" class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                    Back to Company Settings
                </button>
            </div>
        `;
    }
    
    return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your team members</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="editingItem = null; openModal('team_member')" class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                        + Add Team Member
                    </button>
                    <button onclick="switchTab('company')" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        Back
                    </button>
                </div>
            </div>
            
            ${teamMembers.length === 0 ? `
                <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                    No team members yet. Click "Add Team Member" to get started.
                </div>
            ` : `
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-100 dark:bg-gray-900">
                            <tr>
                                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Occupation</th>
                                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${teamMembers.map(member => {
                                // Escape member data for onclick
                                const memberJson = JSON.stringify({
                                    id: member.id,
                                    name: member.name || '',
                                    email: member.email || '',
                                    phone: member.phone || '',
                                    occupation: member.occupation || '',
                                    color: member.color || '#3b82f6'
                                }).replace(/"/g, '&quot;');
                                
                                return `
                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${member.name}</td>
                                    <td class="px-6 py-4 text-sm text-teal-600 dark:text-teal-400">${member.occupation || '-'}</td>
                                    <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">${member.email || '-'}</td>
                                    <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">${member.phone || '-'}</td>
                                    <td class="px-6 py-4 text-sm">
                                        <button onclick="editingItem = JSON.parse('${memberJson}'.replace(/&quot;/g, '\\\"')); openModal('team_member')" class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 mr-2">
                                            Edit
                                        </button>
                                        <button onclick="deleteTeamMember('${member.id}')" class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

// Admin Panel Page
async function renderAdmin() {
    if (!isAdmin) {
        return `
            <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                <h2 class="text-2xl font-bold mb-4 dark:text-white">Admin Panel</h2>
                <p class="text-gray-600 dark:text-gray-300 mb-4">Access denied. Admin privileges required.</p>
                <button onclick="switchTab('company')" class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                    Back to Company Settings
                </button>
            </div>
        `;
    }
    
    // Fetch all users from subscriptions table
    let allUsers = [];
    let activeUsers = [];
    let trialUsers = [];
    
    try {
        const { data, error } = await supabaseClient
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            allUsers = data;
            activeUsers = data.filter(u => u.subscription_status === 'active');
            trialUsers = data.filter(u => u.subscription_status === 'trial');
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
    
    return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">System administration and user management</p>
                </div>
                <button onclick="switchTab('company')" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    Back
                </button>
            </div>
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 class="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Total Users</h3>
                    <p class="text-2xl font-bold text-blue-900 dark:text-blue-300">${allUsers.length}</p>
                </div>
                
                <div class="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h3 class="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Active</h3>
                    <p class="text-2xl font-bold text-green-900 dark:text-green-300">${activeUsers.length}</p>
                </div>
                
                <div class="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <h3 class="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">Trial</h3>
                    <p class="text-2xl font-bold text-yellow-900 dark:text-yellow-300">${trialUsers.length}</p>
                </div>
                
                <div class="p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border border-teal-200 dark:border-teal-800 rounded-lg">
                    <h3 class="text-xs font-medium text-teal-600 dark:text-teal-400 mb-1">System</h3>
                    <p class="text-sm font-semibold text-teal-900 dark:text-teal-300">✓ Online</p>
                </div>
            </div>
            
            <!-- All Users List -->
            <div>
                <h2 class="text-lg font-bold mb-4 dark:text-white">All Users</h2>
                ${allUsers.length === 0 ? `
                    <p class="text-gray-500 dark:text-gray-400">No users found</p>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-100 dark:bg-gray-900">
                                <tr>
                                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Account Type</th>
                                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Created</th>
                                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                ${allUsers.map(user => `
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${user.email || user.user_id || 'No email'}</td>
                                        <td class="px-6 py-4 text-sm">
                                            <span class="px-2 py-1 rounded text-xs ${user.account_type === 'business' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}">
                                                ${user.account_type === 'business' ? 'Business' : 'Sole Trader'}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-sm">
                                            <span class="px-2 py-1 rounded text-xs ${user.subscription_status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}">
                                                ${user.subscription_status || 'trial'}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            ${user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td class="px-6 py-4 text-sm">
                                            <button onclick="toggleUserStatus('${user.id}', '${user.subscription_status}')" class="px-3 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700">
                                                ${user.subscription_status === 'active' ? 'Set Trial' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Delete team member
async function deleteTeamMember(memberId) {
    if (!confirm('Are you sure you want to delete this team member?')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('team_members')
            .delete()
            .eq('id', memberId);
        
        if (error) throw error;
        
        // Update local state
        teamMembers = teamMembers.filter(m => m.id !== memberId);
        
        showNotification('Team member deleted successfully', 'success');
        renderApp();
    } catch (error) {
        console.error('Error deleting team member:', error);
        showNotification('Failed to delete team member', 'error');
    }
}

// Toggle user subscription status (admin only)
async function toggleUserStatus(userId, currentStatus) {
    if (!isAdmin) {
        showNotification('Admin access required', 'error');
        return;
    }
    
    const newStatus = currentStatus === 'active' ? 'trial' : 'active';
    
    try {
        const { error } = await supabaseClient
            .from('subscriptions')
            .update({ subscription_status: newStatus })
            .eq('id', userId);
        
        if (error) throw error;
        
        showNotification(`User status updated to ${newStatus}`, 'success');
        renderApp();
    } catch (error) {
        console.error('Error updating user status:', error);
        showNotification('Failed to update user status', 'error');
    }
}

console.log('✅ Company settings module loaded (COMPLETE)');
