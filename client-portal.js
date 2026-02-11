// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Client Portal System
// ═══════════════════════════════════════════════════════════════════

// Client Portal Authentication
let clientPortalSession = null;

async function sendClientPortalInvite(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client || !client.email) {
        showNotification('Client must have an email address', 'error');
        return;
    }
    
    try {
        // Generate secure access token
        const token = generateSecureToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30-day access
        
        // Save portal access
        const { error } = await supabaseClient
            .from('client_portal_access')
            .upsert({
                client_id: clientId,
                access_token: token,
                expires_at: expiresAt.toISOString(),
                created_at: new Date().toISOString()
            });
        
        if (error) throw error;
        
        // Generate portal link
        const portalUrl = `${window.location.origin}/client-portal.html?token=${token}`;
        
        // Send email (you'll need to implement email sending)
        const emailBody = `
Hello ${client.name},

You've been invited to access your client portal for ${companySettings.business_name}.

Access your portal here: ${portalUrl}

In your portal, you can:
- View and accept quotes
- Pay invoices online
- Track job progress
- Request new quotes
- View your project history

This link is valid for 30 days.

Best regards,
${companySettings.business_name}
        `;
        
        // For now, copy to clipboard
        await navigator.clipboard.writeText(portalUrl);
        showNotification('Portal link copied to clipboard! Send it to client via email.', 'success');
        
        console.log('Portal invite for:', client.name);
        console.log('Portal URL:', portalUrl);
        console.log('Email body:', emailBody);
        
    } catch (error) {
        console.error('Error creating portal access:', error);
        showNotification('Failed to create portal access', 'error');
    }
}

function generateSecureToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Client Portal Login
async function clientPortalLogin(token) {
    try {
        const { data, error } = await supabaseClient
            .from('client_portal_access')
            .select(`
                *,
                clients (*)
            `)
            .eq('access_token', token)
            .gt('expires_at', new Date().toISOString())
            .single();
        
        if (error || !data) {
            throw new Error('Invalid or expired access link');
        }
        
        clientPortalSession = {
            client: data.clients,
            accessToken: token,
            expiresAt: data.expires_at
        };
        
        return true;
    } catch (error) {
        console.error('Portal login error:', error);
        return false;
    }
}

// Render Client Portal Interface
function renderClientPortal() {
    if (!clientPortalSession) {
        return `
            <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div class="text-red-600 text-5xl mb-4">🔒</div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p class="text-gray-600">Invalid or expired access link. Please contact your service provider for a new link.</p>
                </div>
            </div>
        `;
    }
    
    const client = clientPortalSession.client;
    
    // Get client's data
    const clientQuotes = quotes.filter(q => q.client_id === client.id);
    const clientInvoices = invoices.filter(i => i.client_id === client.id);
    const clientJobs = jobs.filter(j => j.client_id === client.id);
    
    const pendingQuotes = clientQuotes.filter(q => !q.accepted && q.status === 'pending');
    const unpaidInvoices = clientInvoices.filter(i => i.status === 'unpaid');
    const upcomingJobs = clientJobs.filter(j => new Date(j.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="bg-white border-b border-gray-200">
                <div class="max-w-6xl mx-auto px-4 py-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <img src="https://i.imgur.com/dF4xRDK.jpeg" alt="M4 Streamline" class="h-12">
                            <div>
                                <h1 class="text-2xl font-bold text-gray-900">Client Portal</h1>
                                <p class="text-sm text-gray-600">Welcome, ${client.name}</p>
                            </div>
                        </div>
                        <button onclick="clientPortalLogout()" class="text-sm text-gray-600 hover:text-gray-900">
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="max-w-6xl mx-auto px-4 py-8">
                <!-- Quick Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white rounded-xl border border-gray-200 p-6">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">📝</div>
                            <div>
                                <div class="text-sm text-gray-600">Pending Quotes</div>
                                <div class="text-2xl font-bold text-gray-900">${pendingQuotes.length}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl border border-gray-200 p-6">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">💰</div>
                            <div>
                                <div class="text-sm text-gray-600">Unpaid Invoices</div>
                                <div class="text-2xl font-bold text-gray-900">${unpaidInvoices.length}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl border border-gray-200 p-6">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">📅</div>
                            <div>
                                <div class="text-sm text-gray-600">Upcoming Jobs</div>
                                <div class="text-2xl font-bold text-gray-900">${upcomingJobs.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Pending Quotes Section -->
                ${pendingQuotes.length > 0 ? `
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-lg font-semibold text-gray-900">Pending Quotes</h2>
                        </div>
                        <div class="divide-y divide-gray-200">
                            ${pendingQuotes.map(quote => `
                                <div class="p-6 hover:bg-gray-50 transition-colors">
                                    <div class="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 class="font-semibold text-gray-900 mb-1">${quote.title}</h3>
                                            <p class="text-sm text-gray-600">${quote.job_address || 'No address specified'}</p>
                                            <p class="text-sm text-gray-500 mt-1">Created: ${new Date(quote.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-2xl font-bold text-teal-600">$${quote.total.toLocaleString()}</div>
                                            ${quote.include_gst ? '<div class="text-xs text-gray-500">Inc. GST</div>' : ''}
                                        </div>
                                    </div>
                                    
                                    <!-- Quote Items -->
                                    <div class="bg-gray-50 rounded-lg p-4 mb-4">
                                        <div class="text-xs font-semibold text-gray-600 uppercase mb-2">Quote Details</div>
                                        ${quote.line_items ? JSON.parse(quote.line_items).map(item => `
                                            <div class="flex justify-between text-sm py-1">
                                                <span>${item.description}</span>
                                                <span class="font-semibold">$${(item.quantity * item.price).toFixed(2)}</span>
                                            </div>
                                        `).join('') : '<div class="text-sm text-gray-500">No line items</div>'}
                                    </div>
                                    
                                    <div class="flex gap-3">
                                        <button onclick="clientAcceptQuote('${quote.id}')" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                                            ✓ Accept Quote
                                        </button>
                                        <button onclick="viewQuotePDF('${quote.id}')" class="px-6 py-3 border border-gray-300 hover:border-teal-400 rounded-lg font-semibold transition-colors">
                                            View PDF
                                        </button>
                                        <button onclick="clientDeclineQuote('${quote.id}')" class="px-6 py-3 border border-gray-300 hover:border-red-400 text-red-600 rounded-lg font-semibold transition-colors">
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Unpaid Invoices Section -->
                ${unpaidInvoices.length > 0 ? `
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-lg font-semibold text-gray-900">Unpaid Invoices</h2>
                        </div>
                        <div class="divide-y divide-gray-200">
                            ${unpaidInvoices.map(invoice => {
                                const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date();
                                return `
                                    <div class="p-6">
                                        <div class="flex items-start justify-between mb-4">
                                            <div>
                                                <div class="flex items-center gap-2 mb-1">
                                                    <h3 class="font-semibold text-gray-900">${invoice.invoice_number || 'Invoice'}</h3>
                                                    ${isOverdue ? '<span class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">OVERDUE</span>' : ''}
                                                </div>
                                                <p class="text-sm text-gray-600">${invoice.title}</p>
                                                <p class="text-sm text-gray-500 mt-1">Due: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}</p>
                                            </div>
                                            <div class="text-right">
                                                <div class="text-2xl font-bold text-gray-900">$${invoice.total.toLocaleString()}</div>
                                            </div>
                                        </div>
                                        
                                        <div class="flex gap-3">
                                            <button onclick="clientPayInvoice('${invoice.id}')" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                                                💳 Pay Now
                                            </button>
                                            <button onclick="viewInvoicePDF('${invoice.id}')" class="px-6 py-3 border border-gray-300 hover:border-teal-400 rounded-lg font-semibold transition-colors">
                                                View PDF
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Upcoming Jobs -->
                ${upcomingJobs.length > 0 ? `
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-lg font-semibold text-gray-900">Upcoming Jobs</h2>
                        </div>
                        <div class="divide-y divide-gray-200">
                            ${upcomingJobs.map(job => `
                                <div class="p-6">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <h3 class="font-semibold text-gray-900 mb-1">${job.title}</h3>
                                            <p class="text-sm text-gray-600">${job.address || 'No address'}</p>
                                            <p class="text-sm text-teal-600 font-medium mt-2">📅 ${new Date(job.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">${job.status || 'Scheduled'}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Request New Quote -->
                <div class="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-8 text-center text-white">
                    <h2 class="text-2xl font-bold mb-2">Need a New Quote?</h2>
                    <p class="mb-6 opacity-90">Tell us about your project and we'll get back to you within 24 hours</p>
                    <button onclick="openNewQuoteRequest()" class="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                        Request Quote
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Client Portal Actions
async function clientAcceptQuote(quoteId) {
    if (!confirm('Accept this quote?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('quotes')
            .update({ 
                accepted: true, 
                status: 'accepted',
                accepted_date: new Date().toISOString()
            })
            .eq('id', quoteId);
        
        if (error) throw error;
        
        showNotification('Quote accepted! We\'ll be in touch soon.', 'success');
        location.reload();
    } catch (error) {
        console.error('Error accepting quote:', error);
        showNotification('Failed to accept quote', 'error');
    }
}

async function clientDeclineQuote(quoteId) {
    const reason = prompt('Optional: Let us know why you\'re declining this quote');
    
    try {
        const { error } = await supabaseClient
            .from('quotes')
            .update({ 
                status: 'declined',
                decline_reason: reason || null
            })
            .eq('id', quoteId);
        
        if (error) throw error;
        
        showNotification('Quote declined. Thank you for letting us know.', 'success');
        location.reload();
    } catch (error) {
        console.error('Error declining quote:', error);
        showNotification('Failed to decline quote', 'error');
    }
}

async function clientPayInvoice(invoiceId) {
    // This would integrate with Stripe or your payment processor
    alert('Payment integration coming soon! Contact us to arrange payment.');
    
    // Example Stripe integration (you'd need to set this up):
    /*
    const invoice = invoices.find(i => i.id === invoiceId);
    const stripe = Stripe('your_publishable_key');
    
    const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: invoice.stripe_price_id, quantity: 1 }],
        mode: 'payment',
        successUrl: window.location.href + '?payment=success',
        cancelUrl: window.location.href + '?payment=cancelled',
    });
    */
}

function clientPortalLogout() {
    clientPortalSession = null;
    location.reload();
}

function openNewQuoteRequest() {
    const message = prompt('Please describe your project:');
    if (!message) return;
    
    // This would send a notification to the business owner
    alert('Thank you! We\'ve received your quote request and will respond within 24 hours.');
}

// Database Schema for Client Portal
const clientPortalSchema = `
-- Add to your Supabase database

CREATE TABLE IF NOT EXISTS client_portal_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    access_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ
);

-- Add decline_reason to quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS decline_reason TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_portal_access_token ON client_portal_access(access_token);
CREATE INDEX IF NOT EXISTS idx_portal_client ON client_portal_access(client_id);
`;

console.log('✅ Client Portal system loaded');
