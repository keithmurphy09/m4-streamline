// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Document Templates System
// ═══════════════════════════════════════════════════════════════════

// Pre-built Document Templates
const documentTemplates = {
    // Quote Templates
    basic_quote: {
        name: 'Basic Quote',
        category: 'quotes',
        description: 'Simple quote with line items',
        fields: {
            title: 'Quote Title',
            job_address: 'Job Address',
            line_items: [
                { description: 'Labor', quantity: 1, price: 0 },
                { description: 'Materials', quantity: 1, price: 0 }
            ],
            notes: 'Thank you for considering our services.',
            payment_terms: 'NET 30',
            include_gst: true
        }
    },
    
    detailed_quote: {
        name: 'Detailed Quote',
        category: 'quotes',
        description: 'Comprehensive quote with breakdown',
        fields: {
            title: 'Quote Title',
            job_address: 'Job Address',
            line_items: [
                { description: 'Site Preparation', quantity: 1, price: 0 },
                { description: 'Materials & Supplies', quantity: 1, price: 0 },
                { description: 'Labor - Primary Work', quantity: 1, price: 0 },
                { description: 'Labor - Finishing', quantity: 1, price: 0 },
                { description: 'Equipment Rental', quantity: 1, price: 0 },
                { description: 'Cleanup & Disposal', quantity: 1, price: 0 }
            ],
            notes: 'Detailed breakdown of all project costs. Valid for 30 days.',
            payment_terms: '50% deposit, 50% on completion',
            warranty: '12 months workmanship warranty',
            include_gst: true
        }
    },
    
    maintenance_quote: {
        name: 'Maintenance Agreement',
        category: 'quotes',
        description: 'Recurring maintenance quote',
        fields: {
            title: 'Monthly Maintenance Agreement',
            job_address: 'Service Address',
            line_items: [
                { description: 'Monthly Inspection', quantity: 1, price: 0 },
                { description: 'Preventive Maintenance', quantity: 1, price: 0 },
                { description: 'Priority Service Access', quantity: 1, price: 0 }
            ],
            notes: 'Covers monthly inspections and preventive maintenance. Emergency calls included.',
            payment_terms: 'Monthly billing',
            contract_length: '12 months',
            include_gst: true
        }
    },
    
    // Invoice Templates
    standard_invoice: {
        name: 'Standard Invoice',
        category: 'invoices',
        description: 'Professional invoice',
        fields: {
            title: 'Invoice Title',
            job_address: 'Service Location',
            line_items: [
                { description: 'Service Description', quantity: 1, price: 0 }
            ],
            notes: 'Thank you for your business!',
            payment_terms: 'Payment due within 30 days',
            include_gst: true
        }
    },
    
    progress_invoice: {
        name: 'Progress Invoice',
        category: 'invoices',
        description: 'Milestone-based billing',
        fields: {
            title: 'Progress Invoice - Milestone {X}',
            job_address: 'Project Location',
            line_items: [
                { description: 'Milestone 1: Foundation Complete', quantity: 1, price: 0 },
                { description: 'Milestone 2: Framework Complete', quantity: 1, price: 0 },
                { description: 'Milestone 3: Finishing Work', quantity: 1, price: 0 }
            ],
            notes: 'Progress billing for project completion.',
            payment_terms: 'Due upon milestone completion',
            include_gst: true
        }
    },
    
    // Contract Templates
    service_contract: {
        name: 'Service Contract',
        category: 'contracts',
        description: 'Standard service agreement',
        content: `
SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on {date} between:

SERVICE PROVIDER:
{company_name}
{company_address}
ABN: {company_abn}

CLIENT:
{client_name}
{client_address}

SCOPE OF WORK:
{scope_description}

TERMS & CONDITIONS:
1. Payment Terms: {payment_terms}
2. Project Timeline: {timeline}
3. Warranty: {warranty_terms}
4. Cancellation Policy: {cancellation_policy}

TOTAL AMOUNT: {total_amount}

Agreed and accepted:

_____________________          _____________________
Service Provider               Client
Date: ____________            Date: ____________
        `
    },
    
    // Proposal Templates
    project_proposal: {
        name: 'Project Proposal',
        category: 'proposals',
        description: 'Comprehensive project proposal',
        content: `
PROJECT PROPOSAL

Prepared for: {client_name}
Date: {date}
Project: {project_name}

EXECUTIVE SUMMARY:
{executive_summary}

PROJECT OVERVIEW:
{project_overview}

SCOPE OF WORK:
{scope_of_work}

TIMELINE:
{timeline}

BUDGET:
{budget_breakdown}

TERMS & CONDITIONS:
{terms_conditions}

NEXT STEPS:
{next_steps}

We look forward to working with you!

{company_name}
{company_contact}
        `
    },
    
    // Email Templates (Professional Signatures)
    email_signature: {
        name: 'Email Signature',
        category: 'email',
        description: 'Professional email signature',
        content: `
---
{your_name}
{your_title}
{company_name}

📞 {phone}
✉️ {email}
🌐 {website}
📍 {address}

{tagline}
        `
    },
    
    // Letter Templates
    thank_you_letter: {
        name: 'Thank You Letter',
        category: 'letters',
        description: 'Post-project thank you',
        content: `
{date}

Dear {client_name},

Thank you for choosing {company_name} for your recent {project_type}.

We truly appreciate your business and trust in our services. It was a pleasure working with you on {project_description}.

If you have any questions or concerns about the completed work, please don't hesitate to reach out. We stand behind our workmanship and want to ensure you're completely satisfied.

We would be honored to serve you again in the future and would greatly appreciate if you could refer us to friends and family who might need our services.

Thank you again for your business!

Sincerely,

{your_name}
{company_name}
{phone}
        `
    },
    
    // Receipt Template
    payment_receipt: {
        name: 'Payment Receipt',
        category: 'receipts',
        description: 'Payment confirmation',
        content: `
PAYMENT RECEIPT

Receipt #: {receipt_number}
Date: {date}

FROM:
{company_name}
{company_address}
ABN: {company_abn}

TO:
{client_name}
{client_address}

PAYMENT DETAILS:
Invoice #: {invoice_number}
Amount Paid: ${'{amount_paid}'}
Payment Method: {payment_method}
Transaction ID: {transaction_id}

Balance Remaining: ${'{balance_remaining}'}

Thank you for your payment!

{company_name}
{company_phone}
        `
    },
    
    // Work Order Template
    work_order: {
        name: 'Work Order',
        category: 'work_orders',
        description: 'Internal work order',
        content: `
WORK ORDER #{work_order_number}

Date: {date}
Priority: {priority}

CLIENT INFORMATION:
Name: {client_name}
Address: {client_address}
Phone: {client_phone}

JOB DETAILS:
Location: {job_address}
Scheduled Date: {job_date}
Estimated Duration: {duration}

WORK DESCRIPTION:
{work_description}

MATERIALS NEEDED:
{materials_list}

ASSIGNED TO:
{team_member}

SPECIAL INSTRUCTIONS:
{special_instructions}

COMPLETION CHECKLIST:
☐ Site preparation complete
☐ Primary work complete
☐ Quality check passed
☐ Client walkthrough done
☐ Site cleaned
☐ Client signature obtained

___________________
Completed By

___________________
Client Signature
        `
    },
    
    // Estimate vs Quote
    rough_estimate: {
        name: 'Rough Estimate',
        category: 'estimates',
        description: 'Ballpark estimate (not binding)',
        fields: {
            title: 'Rough Estimate',
            job_address: 'Project Location',
            line_items: [
                { description: 'Labor (estimated)', quantity: 1, price: 0 },
                { description: 'Materials (estimated)', quantity: 1, price: 0 },
                { description: 'Contingency (10%)', quantity: 1, price: 0 }
            ],
            notes: 'This is a rough estimate only. Final quote will be provided after site inspection.',
            disclaimer: 'This estimate is not binding and subject to change based on site conditions.',
            include_gst: true
        }
    }
};

// Apply Template to New Document
function applyTemplate(templateId, documentType) {
    const template = documentTemplates[templateId];
    if (!template) {
        console.error('Template not found:', templateId);
        return null;
    }
    
    const newDocument = {
        ...template.fields,
        created_at: new Date().toISOString(),
        template_used: templateId
    };
    
    // Replace variables with actual company data
    if (template.content) {
        newDocument.content = replaceTemplateVariables(template.content, {
            company_name: companySettings.business_name,
            company_address: companySettings.address,
            company_abn: companySettings.abn,
            company_phone: companySettings.phone,
            company_email: companySettings.email,
            company_contact: companySettings.contact_name,
            date: new Date().toLocaleDateString()
        });
    }
    
    return newDocument;
}

function replaceTemplateVariables(content, variables) {
    let result = content;
    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        result = result.replace(regex, variables[key] || '');
    });
    return result;
}

// Create Document from Template
async function createFromTemplate(templateId, clientId) {
    const template = documentTemplates[templateId];
    if (!template) return;
    
    const client = clients.find(c => c.id === clientId);
    const documentData = applyTemplate(templateId, template.category);
    
    if (!documentData) return;
    
    // Pre-fill client information
    documentData.client_id = clientId;
    documentData.client_name = client?.name;
    documentData.client_address = client?.address;
    documentData.client_email = client?.email;
    documentData.client_phone = client?.phone;
    
    // Open modal with pre-filled data
    if (template.category === 'quotes') {
        openModal('quote', documentData);
    } else if (template.category === 'invoices') {
        openModal('invoice', documentData);
    }
}

// Render Template Selector
function renderTemplateSelector(category) {
    const categoryTemplates = Object.entries(documentTemplates)
        .filter(([_, template]) => template.category === category);
    
    return `
        <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📄 Start from Template
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${categoryTemplates.map(([id, template]) => `
                    <button 
                        id="template-btn-${id}"
                        onclick="applyTemplateToForm('${id}')"
                        class="text-left p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-teal-400 rounded-lg transition-colors group"
                    >
                        <div class="font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 mb-1">
                            ${template.name}
                        </div>
                        <div class="text-xs text-gray-600 dark:text-gray-400">
                            ${template.description}
                        </div>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// Custom Template Builder
let customTemplates = [];

function saveCustomTemplate(name, category, data) {
    const template = {
        id: `custom_${Date.now()}`,
        name: name,
        category: category,
        description: 'Custom template',
        fields: data,
        custom: true,
        created_at: new Date().toISOString()
    };
    
    customTemplates.push(template);
    
    // Save to localStorage
    localStorage.setItem('customTemplates', JSON.stringify(customTemplates));
    
    showNotification('Template saved!', 'success');
}

function loadCustomTemplates() {
    const saved = localStorage.getItem('customTemplates');
    if (saved) {
        customTemplates = JSON.parse(saved);
    }
}

// Render Template Manager
function renderTemplateManager() {
    return `
        <div class="max-w-6xl mx-auto space-y-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Document Templates</h2>
            
            <!-- Template Categories -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${renderTemplateCategoryCard('quotes', '📝', 'Quote Templates', 'Pre-built quote formats')}
                ${renderTemplateCategoryCard('invoices', '💰', 'Invoice Templates', 'Professional invoicing')}
                ${renderTemplateCategoryCard('contracts', '📄', 'Contracts', 'Service agreements')}
                ${renderTemplateCategoryCard('proposals', '📊', 'Proposals', 'Project proposals')}
                ${renderTemplateCategoryCard('letters', '✉️', 'Letters', 'Business correspondence')}
                ${renderTemplateCategoryCard('receipts', '🧾', 'Receipts', 'Payment receipts')}
            </div>
            
            <!-- Available Templates -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">All Templates</h3>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${Object.entries(documentTemplates).map(([id, template]) => `
                            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-teal-400 transition-colors">
                                <div class="text-sm font-medium text-teal-600 mb-1">${template.category.toUpperCase()}</div>
                                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">${template.name}</h4>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">${template.description}</p>
                                <button onclick="previewTemplate('${id}')" class="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Preview Template
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderTemplateCategoryCard(category, icon, title, description) {
    const count = Object.values(documentTemplates).filter(t => t.category === category).length;
    return `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:border-teal-400 transition-colors" onclick="filterTemplatesByCategory('${category}')">
            <div class="text-4xl mb-3">${icon}</div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">${title}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${description}</p>
            <div class="text-xs text-teal-600 font-medium">${count} template${count !== 1 ? 's' : ''}</div>
        </div>
    `;
}

function previewTemplate(templateId) {
    const template = documentTemplates[templateId];
    alert(`Template: ${template.name}\n\n${template.description}\n\nCategory: ${template.category}`);
    // In real implementation, show modal with full preview
}

// Apply template to open quote/invoice modal
function applyTemplateToForm(templateId) {
    const template = documentTemplates[templateId];
    if (!template) {
        console.error('Template not found:', templateId);
        return;
    }

    // Highlight selected button, clear others
    document.querySelectorAll('[id^="template-btn-"]').forEach(btn => {
        btn.classList.remove('border-teal-400', 'bg-teal-50', 'dark:bg-teal-900/20');
        btn.classList.add('border-gray-200', 'dark:border-gray-700');
    });
    const selected = document.getElementById('template-btn-' + templateId);
    if (selected) {
        selected.classList.remove('border-gray-200', 'dark:border-gray-700');
        selected.classList.add('border-teal-400', 'bg-teal-50', 'dark:bg-teal-900/20');
    }

    // Populate existing open modal without closing/reopening (avoids flash)
    const prefill = { ...template.fields, items: template.fields.line_items };

    // Fill text fields if they exist in the DOM
    const jobAddress = document.getElementById('job_address');
    const notes = document.getElementById('notes');
    const paymentTerms = document.getElementById('payment_terms');
    const includeGst = document.getElementById('include_gst');

    if (jobAddress && prefill.job_address) jobAddress.value = prefill.job_address;
    if (notes && prefill.notes) notes.value = prefill.notes;
    if (paymentTerms && prefill.payment_terms) paymentTerms.value = prefill.payment_terms;
    if (includeGst && prefill.include_gst !== undefined) includeGst.checked = prefill.include_gst;

    // Replace line items and re-render
    if (prefill.items && typeof quoteItems !== 'undefined') {
        quoteItems = prefill.items.map(i => ({ ...i }));
        if (typeof renderQuoteItems === 'function') renderQuoteItems();
    }
}

// Load custom templates on startup
loadCustomTemplates();

console.log('✅ Document Templates system loaded');
console.log(`📄 ${Object.keys(documentTemplates).length} templates available`);
