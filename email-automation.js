// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Email Automation System
// ═══════════════════════════════════════════════════════════════════

// Email Templates
const emailTemplates = {
    quote_sent: {
        subject: 'New Quote from {company_name} - {quote_title}',
        body: `Hi {client_name},

Thank you for your interest! I've prepared a quote for {quote_title}.

Quote Details:
- Total: ${'{quote_total}'}
- Valid until: ${'{quote_expiry}'}

You can view and accept your quote here: {quote_link}

If you have any questions, feel free to reach out!

Best regards,
{company_name}
{company_phone}`
    },
    
    quote_reminder: {
        subject: 'Reminder: Quote Pending - {quote_title}',
        body: `Hi {client_name},

Just following up on the quote I sent you for {quote_title}.

The quote expires in {days_until_expiry} days. Would you like to proceed?

View quote: {quote_link}

Let me know if you have any questions!

Best regards,
{company_name}`
    },
    
    quote_accepted: {
        subject: 'Quote Accepted - Next Steps',
        body: `Hi {client_name},

Great news! I've received your acceptance of the quote for {quote_title}.

Next Steps:
1. We'll schedule your job for {job_date}
2. I'll send you a confirmation email
3. Invoice will be issued upon completion

Thanks for choosing us!

Best regards,
{company_name}`
    },
    
    invoice_sent: {
        subject: 'Invoice {invoice_number} from {company_name}',
        body: `Hi {client_name},

Your invoice is ready!

Invoice: {invoice_number}
Amount Due: ${'{invoice_total}'}
Due Date: {due_date}

View and pay online: {invoice_link}

Payment Options:
- Online payment (link above)
- Bank transfer: {bank_details}
- Contact us for other arrangements

Thank you for your business!

Best regards,
{company_name}`
    },
    
    invoice_reminder: {
        subject: 'Payment Reminder - Invoice {invoice_number}',
        body: `Hi {client_name},

This is a friendly reminder that invoice {invoice_number} is due in {days_until_due} days.

Amount Due: ${'{invoice_total}'}
Due Date: {due_date}

Pay now: {invoice_link}

If you've already paid, please disregard this message.

Thank you!

Best regards,
{company_name}`
    },
    
    invoice_overdue: {
        subject: 'Overdue Invoice {invoice_number}',
        body: `Hi {client_name},

Invoice {invoice_number} is now overdue.

Amount Due: ${'{invoice_total}'}
Original Due Date: {due_date}
Days Overdue: {days_overdue}

Please arrange payment at your earliest convenience: {invoice_link}

If there's an issue, please contact me so we can work it out.

Best regards,
{company_name}`
    },
    
    payment_received: {
        subject: 'Payment Received - Thank You!',
        body: `Hi {client_name},

Payment received for invoice {invoice_number}!

Amount Paid: ${'{invoice_total}'}
Payment Date: {payment_date}

Receipt: {receipt_link}

Thank you for your prompt payment! We look forward to working with you again.

Best regards,
{company_name}`
    },
    
    job_scheduled: {
        subject: 'Job Scheduled - {job_title}',
        body: `Hi {client_name},

Your job has been scheduled!

Job: {job_title}
Date: {job_date}
Time: {job_time}
Location: {job_address}

What to expect:
- Our team will arrive at the scheduled time
- Estimated duration: {job_duration}
- Point of contact: {team_member}

If you need to reschedule, please let me know ASAP.

See you soon!

Best regards,
{company_name}`
    },
    
    job_reminder: {
        subject: 'Reminder: Job Tomorrow - {job_title}',
        body: `Hi {client_name},

Quick reminder that we're scheduled for tomorrow!

Job: {job_title}
Date: {job_date}
Time: {job_time}
Location: {job_address}

Please ensure:
- Access to work area
- Parking available
- Pets secured

See you tomorrow!

Best regards,
{company_name}`
    },
    
    job_completed: {
        subject: 'Job Completed - {job_title}',
        body: `Hi {client_name},

We've completed your job: {job_title}

Completed: {completion_date}
Invoice: {invoice_link}

We hope you're satisfied with our work! If you have any concerns, please let me know within 48 hours.

Would you mind leaving us a review? {review_link}

Thank you for your business!

Best regards,
{company_name}`
    },
    
    portal_invite: {
        subject: 'Welcome to Your Client Portal - {company_name}',
        body: `Hi {client_name},

You've been invited to access your exclusive client portal!

Access your portal: {portal_url}

In your portal, you can:
✓ View and accept quotes instantly
✓ Pay invoices online securely  
✓ Track your job progress in real-time
✓ Request new quotes
✓ View your complete project history

This link is valid for 30 days.

If you have any questions, feel free to reach out!

Best regards,
{company_name}
{company_phone}`
    },
    
    invoice_paid: {
        subject: 'Payment Confirmed - Invoice {invoice_number}',
        body: `Hi {client_name},

Great news! We've received your payment for invoice {invoice_number}.

Amount Paid: ${'{invoice_total}'}
Payment Date: {payment_date}

Thank you for your prompt payment!

Best regards,
{company_name}`
    }
};

// Email Automation Rules
const automationRules = {
    quote_sent: {
        trigger: 'quote_created',
        delay: 0, // Send immediately
        enabled: true
    },
    
    quote_reminder_3days: {
        trigger: 'quote_pending',
        delay: 3, // 3 days after quote sent
        enabled: true,
        condition: (quote) => !quote.accepted && quote.status === 'pending'
    },
    
    quote_reminder_7days: {
        trigger: 'quote_pending',
        delay: 7, // 7 days after quote sent
        enabled: true,
        condition: (quote) => !quote.accepted && quote.status === 'pending'
    },
    
    invoice_sent: {
        trigger: 'invoice_created',
        delay: 0,
        enabled: true
    },
    
    invoice_reminder_before_due: {
        trigger: 'invoice_unpaid',
        delay: -3, // 3 days before due date
        enabled: true,
        condition: (invoice) => invoice.status === 'unpaid'
    },
    
    invoice_reminder_due: {
        trigger: 'invoice_due',
        delay: 0, // On due date
        enabled: true,
        condition: (invoice) => invoice.status === 'unpaid'
    },
    
    invoice_overdue_3days: {
        trigger: 'invoice_overdue',
        delay: 3, // 3 days after due
        enabled: true,
        condition: (invoice) => invoice.status === 'unpaid'
    },
    
    invoice_overdue_7days: {
        trigger: 'invoice_overdue',
        delay: 7,
        enabled: true,
        condition: (invoice) => invoice.status === 'unpaid'
    },
    
    job_reminder_1day: {
        trigger: 'job_scheduled',
        delay: -1, // 1 day before
        enabled: true,
        condition: (job) => job.status === 'scheduled'
    }
};

// Template Variable Replacement
function replaceTemplateVariables(template, data) {
    let result = template;
    
    // Replace all {variable} placeholders
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        result = result.replace(regex, data[key] || '');
    });
    
    return result;
}

// Generate Email Data
function generateEmailData(type, item) {
    const client = clients.find(c => c.id === item.client_id);
    const data = {
        company_name: companySettings.business_name || 'Our Company',
        company_phone: companySettings.phone || '',
        company_email: companySettings.email || '',
        client_name: client?.name || 'Valued Client',
        client_email: client?.email || ''
    };
    
    // Add type-specific data
    if (type.includes('quote')) {
        data.quote_title = item.title;
        data.quote_total = `$${item.total.toLocaleString()}`;
        data.quote_link = `${window.location.origin}/quote/${item.id}`;
        data.quote_expiry = item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'TBD';
        
        if (item.expiry_date) {
            const daysUntil = Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
            data.days_until_expiry = daysUntil;
        }
    }
    
    if (type.includes('invoice')) {
        data.invoice_number = item.invoice_number || 'N/A';
        data.invoice_total = `$${item.total.toLocaleString()}`;
        data.invoice_link = `${window.location.origin}/invoice/${item.id}`;
        data.due_date = item.due_date ? new Date(item.due_date).toLocaleDateString() : 'Upon receipt';
        data.bank_details = companySettings.bank_details || 'Contact us for details';
        data.receipt_link = `${window.location.origin}/receipt/${item.id}`;
        data.payment_date = new Date().toLocaleDateString();
        
        if (item.due_date) {
            const daysUntil = Math.ceil((new Date(item.due_date) - new Date()) / (1000 * 60 * 60 * 24));
            data.days_until_due = daysUntil;
            
            if (daysUntil < 0) {
                data.days_overdue = Math.abs(daysUntil);
            }
        }
    }
    
    if (type.includes('job')) {
        data.job_title = item.title;
        data.job_date = new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        data.job_time = item.time || 'TBD';
        data.job_address = item.address || 'TBD';
        data.job_duration = item.duration || 'TBD';
        data.team_member = item.team_member_id ? teamMembers.find(m => m.id === item.team_member_id)?.name : 'Our team';
        data.completion_date = new Date().toLocaleDateString();
        data.review_link = companySettings.review_link || '#';
    }
    
    return data;
}

// Send Email via Supabase Edge Function (integrated with SendGrid)
async function sendEmail(to, subject, body, type = 'general', itemId = null) {
    // Check if email is configured
    if (!emailSettings || !emailSettings.sendgrid_api_key) {
        console.log('Email not configured - skipping send');
        return false;
    }
    
    // Convert plain text to HTML
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
                <img src="${companySettings?.logo_url || 'https://i.imgur.com/dF4xRDK.jpeg'}" alt="Company Logo" style="max-width: 150px; max-height: 100px; margin-bottom: 10px; object-fit: contain;">
                <h1 style="color: #14b8a6; margin: 10px 0; font-size: 24px;">${companySettings?.business_name || 'M4 STREAMLINE'}</h1>
            </div>
            <div style="white-space: pre-wrap; line-height: 1.6;">${body}</div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
                ${companySettings?.business_name || 'M4 STREAMLINE'}<br>
                ${companySettings?.phone || ''} | ${companySettings?.email || ''}
            </p>
        </div>
    `;
    
    try {
        const response = await fetch('https://xviustrrsuhidzbcpgow.supabase.co/functions/v1/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXVzdHJyc3VoaWR6YmNwZ293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODk1NDgsImV4cCI6MjA4NDM2NTU0OH0.CEcc50c1K2Qnh6rXt_1-_w30LzHvDniGLbqWhdOolRY'
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                to_email: to,
                to_name: to.split('@')[0], // Extract name from email if no name provided
                subject: subject,
                html_content: htmlContent
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ Email sent:', type, 'to', to);
            
            // Log email in database
            try {
                await supabaseClient.from('email_logs').insert({
                    recipient: to,
                    subject: subject,
                    body: body,
                    type: type,
                    item_id: itemId,
                    sent_at: new Date().toISOString(),
                    status: 'sent',
                    user_id: currentUser.id
                });
            } catch (logError) {
                console.error('Error logging email:', logError);
            }
            
            return true;
        } else {
            console.error('Email send error:', result);
            
            // Log failure
            try {
                await supabaseClient.from('email_logs').insert({
                    recipient: to,
                    subject: subject,
                    body: body,
                    type: type,
                    item_id: itemId,
                    sent_at: new Date().toISOString(),
                    status: 'failed',
                    error_message: result.error || 'Unknown error',
                    user_id: currentUser.id
                });
            } catch (logError) {
                console.error('Error logging email failure:', logError);
            }
            
            return false;
        }
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
}

// Send Automated Email
async function sendAutomatedEmail(templateType, item) {
    const template = emailTemplates[templateType];
    if (!template) {
        console.error('Template not found:', templateType);
        return false;
    }
    
    const data = generateEmailData(templateType, item);
    
    if (!data.client_email) {
        console.warn('No email address for client');
        return false;
    }
    
    const subject = replaceTemplateVariables(template.subject, data);
    const body = replaceTemplateVariables(template.body, data);
    
    return await sendEmail(data.client_email, subject, body, templateType, item.id);
}

// Check and Send Scheduled Emails
async function processEmailAutomations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check quote reminders
    quotes.filter(q => q.status === 'pending' && !q.accepted).forEach(async quote => {
        const createdDate = new Date(quote.created_at);
        const daysSinceCreated = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
        
        // 3-day reminder
        if (daysSinceCreated === 3 && automationRules.quote_reminder_3days.enabled) {
            await sendAutomatedEmail('quote_reminder', quote);
        }
        
        // 7-day reminder
        if (daysSinceCreated === 7 && automationRules.quote_reminder_7days.enabled) {
            await sendAutomatedEmail('quote_reminder', quote);
        }
    });
    
    // Check invoice reminders
    invoices.filter(i => i.status === 'unpaid' && i.due_date).forEach(async invoice => {
        const dueDate = new Date(invoice.due_date);
        dueDate.setHours(0, 0, 0, 0);
        const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
        
        // 3 days before due
        if (daysUntilDue === 3 && automationRules.invoice_reminder_before_due.enabled) {
            await sendAutomatedEmail('invoice_reminder', invoice);
        }
        
        // On due date
        if (daysUntilDue === 0 && automationRules.invoice_reminder_due.enabled) {
            await sendAutomatedEmail('invoice_reminder', invoice);
        }
        
        // 3 days overdue
        if (daysUntilDue === -3 && automationRules.invoice_overdue_3days.enabled) {
            await sendAutomatedEmail('invoice_overdue', invoice);
        }
        
        // 7 days overdue
        if (daysUntilDue === -7 && automationRules.invoice_overdue_7days.enabled) {
            await sendAutomatedEmail('invoice_overdue', invoice);
        }
    });
    
    // Check job reminders
    jobs.filter(j => j.status === 'scheduled' && j.date).forEach(async job => {
        const jobDate = new Date(job.date);
        jobDate.setHours(0, 0, 0, 0);
        const daysUntilJob = Math.floor((jobDate - today) / (1000 * 60 * 60 * 24));
        
        // 1 day before
        if (daysUntilJob === 1 && automationRules.job_reminder_1day.enabled) {
            await sendAutomatedEmail('job_reminder', job);
        }
    });
}

// Trigger specific emails on actions
async function triggerEmail(action, item) {
    // Check if email automation is enabled
    if (typeof emailAutomationSettings !== 'undefined' && !emailAutomationSettings.enabled) {
        console.log('Email automation disabled');
        return;
    }
    
    // Check if this specific automation is enabled
    if (typeof emailAutomationSettings !== 'undefined' && 
        emailAutomationSettings.automations && 
        emailAutomationSettings.automations[action] === false) {
        console.log(`Email automation disabled for: ${action}`);
        return;
    }
    
    switch(action) {
        case 'quote_sent':
        case 'quote_created':
            if (automationRules.quote_sent.enabled) {
                await sendAutomatedEmail('quote_sent', item);
            }
            break;
            
        case 'quote_accepted':
            await sendAutomatedEmail('quote_accepted', item);
            break;
            
        case 'invoice_sent':
        case 'invoice_created':
            if (automationRules.invoice_sent.enabled) {
                await sendAutomatedEmail('invoice_sent', item);
            }
            break;
            
        case 'invoice_paid':
        case 'payment_received':
            await sendAutomatedEmail('payment_received', item);
            break;
            
        case 'job_scheduled':
            await sendAutomatedEmail('job_scheduled', item);
            break;
            
        case 'portal_invite':
            await sendAutomatedEmail('portal_invite', item);
            break;
            
        case 'job_completed':
            await sendAutomatedEmail('job_completed', item);
            break;
    }
}

// Render Email Automation Settings
function renderEmailAutomationSettings() {
    return `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Automations</h3>
            
            <div class="space-y-4">
                ${Object.entries(automationRules).map(([key, rule]) => `
                    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div class="flex-1">
                            <div class="font-medium text-gray-900 dark:text-white">${key.replace(/_/g, ' ').toUpperCase()}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">
                                Trigger: ${rule.trigger} | Delay: ${rule.delay} days
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" ${rule.enabled ? 'checked' : ''} onchange="toggleAutomation('${key}')" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                        </label>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function toggleAutomation(key) {
    automationRules[key].enabled = !automationRules[key].enabled;
    // Save to settings
    console.log('Automation toggled:', key, automationRules[key].enabled);
}

// Database Schema for Email System
const emailSystemSchema = `
-- Add to your Supabase database

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT,
    item_id UUID,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'sent',
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_item ON email_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
`;

// Run email automations daily
if (typeof setInterval !== 'undefined') {
    // Run once per day at midnight
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            processEmailAutomations();
        }
    }, 60000); // Check every minute
}

console.log('✅ Email Automation system loaded');
