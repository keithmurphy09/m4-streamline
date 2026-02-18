// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Email Automation Settings
// ═══════════════════════════════════════════════════════════════════

// Email automation settings (stored in localStorage)
let emailAutomationSettings = {
    enabled: true,
    automations: {
        quote_sent: true,
        quote_reminder: true,
        quote_accepted: true,
        invoice_sent: true,
        invoice_reminder: true,
        invoice_overdue: true,
        invoice_paid: true,
        payment_received: true,
        job_scheduled: true,
        job_reminder: true,
        job_completed: true,
        portal_invite: true
    }
};

// Load settings from localStorage
function loadEmailAutomationSettings() {
    const saved = localStorage.getItem('emailAutomationSettings');
    if (saved) {
        emailAutomationSettings = JSON.parse(saved);
    }
}

// Save settings to localStorage
function saveEmailAutomationSettings() {
    localStorage.setItem('emailAutomationSettings', JSON.stringify(emailAutomationSettings));
    showNotification('Email automation settings saved!', 'success');
}

// Toggle automation on/off
function toggleEmailAutomation(key) {
    emailAutomationSettings.automations[key] = !emailAutomationSettings.automations[key];
    saveEmailAutomationSettings();
    renderApp();
}

// Toggle master switch
function toggleEmailAutomationMaster() {
    emailAutomationSettings.enabled = !emailAutomationSettings.enabled;
    saveEmailAutomationSettings();
    renderApp();
}

// Render email automation settings panel
function renderEmailAutomationSettings() {
    const automations = [
        { key: 'quote_sent', label: 'Quote Sent', description: 'Send email when quote is created' },
        { key: 'quote_reminder', label: 'Quote Reminder', description: 'Remind clients about pending quotes' },
        { key: 'quote_accepted', label: 'Quote Accepted', description: 'Confirmation when quote is accepted' },
        { key: 'invoice_sent', label: 'Invoice Sent', description: 'Send email when invoice is created' },
        { key: 'invoice_reminder', label: 'Invoice Reminder', description: 'Remind about upcoming due dates' },
        { key: 'invoice_overdue', label: 'Invoice Overdue', description: 'Alert when invoice becomes overdue' },
        { key: 'invoice_paid', label: 'Invoice Paid', description: 'Thank you when payment received' },
        { key: 'payment_received', label: 'Payment Receipt', description: 'Send payment confirmation' },
        { key: 'job_scheduled', label: 'Job Scheduled', description: 'Notify when job is scheduled' },
        { key: 'job_reminder', label: 'Job Reminder', description: 'Remind about upcoming jobs' },
        { key: 'job_completed', label: 'Job Completed', description: 'Notify when job is finished' },
        { key: 'portal_invite', label: 'Portal Invite', description: 'Send client portal access link' }
    ];

    return `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl mb-6">
            <!-- Header -->
            <div class="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Email Automation</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Automatically send emails for key events</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" ${emailAutomationSettings.enabled ? 'checked' : ''} 
                               onchange="toggleEmailAutomationMaster()" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                            ${emailAutomationSettings.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </label>
                </div>
            </div>

            <!-- Automation Toggles -->
            <div class="space-y-4">
                    ${automations.map(auto => `
                        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg ${!emailAutomationSettings.enabled ? 'opacity-50' : ''}">
                            <div class="flex-1">
                                <h4 class="text-sm font-medium text-gray-900 dark:text-white">${auto.label}</h4>
                                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">${auto.description}</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" 
                                       ${emailAutomationSettings.automations[auto.key] ? 'checked' : ''} 
                                       ${!emailAutomationSettings.enabled ? 'disabled' : ''}
                                       onchange="toggleEmailAutomation('${auto.key}')" 
                                       class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600 peer-disabled:opacity-50"></div>
                            </label>
                        </div>
                    `).join('')}
                </div>

                <!-- Custom Template Editor (Coming Soon) -->
                <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Pro Tip</h4>
                    <p class="text-sm text-blue-800 dark:text-blue-400">
                        Email templates can be customized in <code class="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded">email-automation.js</code>
                    </p>
                </div>
        </div>
    `;
}

// Load settings on startup
loadEmailAutomationSettings();

console.log('✅ Email automation settings loaded');
