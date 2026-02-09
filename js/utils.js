// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Utility Functions
// ═══════════════════════════════════════════════════════════════════

// Search Debouncing
function debouncedSearch(searchType, value, resetPage = true) {
    if (searchType === 'client') clientSearch = value;
    else if (searchType === 'quote') quoteSearch = value;
    else if (searchType === 'invoice') invoiceSearch = value;
    else if (searchType === 'job') jobSearch = value;
    else if (searchType === 'expense') expenseSearch = value;
    
    clearTimeout(searchDebounceTimer);
    
    searchDebounceTimer = setTimeout(() => {
        if (resetPage) {
            if (searchType === 'client') currentPage.clients = 1;
            else if (searchType === 'quote') currentPage.quotes = 1;
            else if (searchType === 'invoice') currentPage.invoices = 1;
            else if (searchType === 'job') currentPage.jobs = 1;
            else if (searchType === 'expense') currentPage.expenses = 1;
        }
        renderApp();
    }, 300);
}

// Session Management
function resetSessionTimeout() {
    clearTimeout(sessionTimeout);
    if (currentUser) {
        sessionTimeout = setTimeout(() => {
            alert('Your session has expired due to inactivity. Please log in again.');
            handleLogout();
        }, SESSION_TIMEOUT_MS);
    }
}

function setupSessionTimeout() {
    let activityEvents = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
        document.addEventListener(event, resetSessionTimeout, { passive: true });
    });
    resetSessionTimeout();
}

// Account Type Helper
function getAccountType() {
    if (isAdmin && demoMode) return demoMode;
    return subscription?.account_type || 'sole_trader';
}

// Dark Mode
function toggleSettingsMenu() {
    const menu = document.getElementById('settings-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    applyDarkMode();
}

function applyDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    // Update global variable if it exists
    if (typeof darkMode !== 'undefined') {
        darkMode = isDark;
    }
}

// Notifications
function showNotification(message, type = 'success') {
    const icon = type === 'success' ? '✅' : '❌';
    const bgColor = type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700';
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${bgColor} border-l-4 p-4 rounded shadow-lg z-50 max-w-md animate-slide-in`;
    notification.innerHTML = `<p class="font-medium dark:text-gray-200">${icon} ${message}</p>`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Selection Management
function toggleSelection(type, id) {
    const selectedArray = type === 'quotes' ? selectedQuotes : 
                          type === 'invoices' ? selectedInvoices :
                          type === 'jobs' ? selectedJobs :
                          type === 'expenses' ? selectedExpenses :
                          selectedClients;
    
    const index = selectedArray.indexOf(id);
    if (index > -1) {
        selectedArray.splice(index, 1);
    } else {
        selectedArray.push(id);
    }
    renderApp();
}

function toggleSelectAll(type) {
    const selectedArray = type === 'quotes' ? selectedQuotes : 
                          type === 'invoices' ? selectedInvoices :
                          type === 'jobs' ? selectedJobs :
                          type === 'expenses' ? selectedExpenses :
                          selectedClients;
    
    const allItems = type === 'quotes' ? quotes : 
                     type === 'invoices' ? invoices :
                     type === 'jobs' ? jobs :
                     type === 'expenses' ? expenses :
                     clients;
    
    if (selectedArray.length === allItems.length) {
        selectedArray.length = 0;
    } else {
        selectedArray.length = 0;
        allItems.forEach(item => selectedArray.push(item.id));
    }
    renderApp();
}

// Bulk Delete
async function bulkDelete(type) {
    const selectedArray = type === 'quotes' ? selectedQuotes : 
                          type === 'invoices' ? selectedInvoices :
                          type === 'jobs' ? selectedJobs :
                          type === 'expenses' ? selectedExpenses :
                          selectedClients;
    
    if (selectedArray.length === 0) {
        showNotification('No items selected', 'error');
        return;
    }
    
    const count = selectedArray.length;
    const itemType = type.slice(0, -1);
    
    if (!confirm(`Delete ${count} ${count === 1 ? itemType : type}? This cannot be undone.`)) {
        return;
    }
    
    try {
        isLoading = true;
        loadingMessage = `Deleting ${count} ${count === 1 ? itemType : type}...`;
        renderApp();
        
        const tableName = type === 'jobs' ? 'jobs' : 
                          type === 'quotes' ? 'quotes' :
                          type === 'invoices' ? 'invoices' :
                          type === 'expenses' ? 'expenses' :
                          'clients';
        
        const { error } = await supabaseClient
            .from(tableName)
            .delete()
            .in('id', selectedArray);
        
        if (error) throw error;
        
        if (type === 'quotes') {
            quotes = quotes.filter(q => !selectedArray.includes(q.id));
            selectedQuotes = [];
        } else if (type === 'invoices') {
            invoices = invoices.filter(i => !selectedArray.includes(i.id));
            selectedInvoices = [];
        } else if (type === 'jobs') {
            jobs = jobs.filter(j => !selectedArray.includes(j.id));
            selectedJobs = [];
        } else if (type === 'expenses') {
            expenses = expenses.filter(e => !selectedArray.includes(e.id));
            selectedExpenses = [];
        } else if (type === 'clients') {
            clients = clients.filter(c => !selectedArray.includes(c.id));
            selectedClients = [];
        }
        
        showNotification(`${count} ${count === 1 ? itemType : type} deleted successfully!`);
    } catch (error) {
        console.error('Bulk delete error:', error);
        showNotification(`Failed to delete ${type}: ` + error.message, 'error');
    } finally {
        isLoading = false;
        renderApp();
    }
}

// Pagination
function getPaginationHTML(section, totalItems, currentPageNum) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return '';
    
    const startItem = (currentPageNum - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPageNum * itemsPerPage, totalItems);
    
    return `
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4 border-t">
            <div class="text-sm text-gray-600 dark:text-gray-300">
                Showing ${startItem}-${endItem} of ${totalItems}
            </div>
            <div class="flex gap-2">
                ${currentPageNum > 1 ? `<button onclick="currentPage.${section}=${currentPageNum - 1}; renderApp();" class="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700">← Previous</button>` : ''}
                ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const pageNum = i + 1;
                    if (totalPages > 5 && currentPageNum > 3) {
                        const start = Math.max(1, currentPageNum - 2);
                        const actualPage = start + i;
                        if (actualPage > totalPages) return '';
                        return `<button onclick="currentPage.${section}=${actualPage}; renderApp();" class="px-3 py-1 border rounded ${actualPage === currentPageNum ? 'bg-black text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}">${actualPage}</button>`;
                    }
                    return `<button onclick="currentPage.${section}=${pageNum}; renderApp();" class="px-3 py-1 border rounded ${pageNum === currentPageNum ? 'bg-black text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}">${pageNum}</button>`;
                }).join('')}
                ${currentPageNum < totalPages ? `<button onclick="currentPage.${section}=${currentPageNum + 1}; renderApp();" class="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700">Next →</button>` : ''}
            </div>
        </div>
    `;
}

// CSV Export
function exportToCSV(type) {
    let data = [];
    let filename = '';
    let headers = [];
    
    if (type === 'clients') {
        headers = ['Name', 'Email', 'Phone', 'Address', 'Notes'];
        const filtered = clients.filter(c => 
            c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
            c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
            c.phone.includes(clientSearch) ||
            (c.address && c.address.toLowerCase().includes(clientSearch.toLowerCase()))
        );
        data = filtered.map(c => [c.name, c.email, c.phone, c.address || '', c.notes || '']);
        filename = clientSearch ? `clients_filtered_${clientSearch}.csv` : 'clients.csv';
    } else if (type === 'jobs') {
        headers = ['Client', 'Title', 'Date', 'Time', 'Status', 'Notes'];
        const filtered = jobs.filter(job => {
            if (!jobSearch) return true;
            const client = clients.find(c => c.id === job.client_id);
            const searchLower = jobSearch.toLowerCase();
            return (job.title.toLowerCase().includes(searchLower) || (client?.name || '').toLowerCase().includes(searchLower));
        });
        data = filtered.map(j => {
            const client = clients.find(c => c.id === j.client_id);
            return [client?.name || 'Unknown', j.title, j.date, j.time, j.status || 'scheduled', j.notes || ''];
        });
        filename = jobSearch ? `jobs_filtered_${jobSearch}.csv` : 'jobs.csv';
    } else if (type === 'quotes') {
        headers = ['Client', 'Title', 'Date', 'Total', 'Status', 'Accepted'];
        const filtered = quotes.filter(q => {
            if (!quoteSearch) return true;
            const client = clients.find(c => c.id === q.client_id);
            const searchLower = quoteSearch.toLowerCase();
            return (q.title.toLowerCase().includes(searchLower) || (client?.name || '').toLowerCase().includes(searchLower));
        });
        data = filtered.map(q => {
            const client = clients.find(c => c.id === q.client_id);
            return [client?.name || 'Unknown', q.title, q.date, q.total, q.status, q.accepted ? 'Yes' : 'No'];
        });
        filename = quoteSearch ? `quotes_filtered_${quoteSearch}.csv` : 'quotes.csv';
    } else if (type === 'invoices') {
        headers = ['Client', 'Invoice #', 'Title', 'Issue Date', 'Due Date', 'Total', 'Status'];
        const filtered = invoices.filter(i => {
            if (!invoiceSearch) return true;
            const client = clients.find(c => c.id === i.client_id);
            const searchLower = invoiceSearch.toLowerCase();
            return (i.title.toLowerCase().includes(searchLower) || (client?.name || '').toLowerCase().includes(searchLower));
        });
        data = filtered.map(i => {
            const client = clients.find(c => c.id === i.client_id);
            return [client?.name || 'Unknown', i.invoice_number, i.title, i.issue_date, i.due_date || '', i.total, i.status];
        });
        filename = invoiceSearch ? `invoices_filtered_${invoiceSearch}.csv` : 'invoices.csv';
    } else if (type === 'expenses') {
        headers = ['Date', 'Amount', 'Category', 'Description'];
        const filtered = expenses.filter(exp => {
            if (!expenseSearch) return true;
            const searchLower = expenseSearch.toLowerCase();
            return ((exp.description || '').toLowerCase().includes(searchLower) || (exp.category || '').toLowerCase().includes(searchLower));
        });
        data = filtered.map(e => [e.date, e.amount, e.category, e.description || '']);
        filename = expenseSearch ? `expenses_filtered_${expenseSearch}.csv` : 'expenses.csv';
    }
    
    if (data.length === 0) {
        showNotification('No data to export', 'error');
        return;
    }
    
    let csvContent = headers.join(',') + '\n';
    data.forEach(row => {
        csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Download User Guide
function downloadUserGuide() {
    const menu = document.getElementById('settings-menu');
    if (menu) {
        menu.classList.add('hidden');
    }
    window.open('https://raw.githubusercontent.com/keithmurphy09/m4-streamline/main/docs/Streamline_User_Guide.pdf', '_blank');
}

// Account Type Helper
function getAccountType() {
    if (isAdmin && demoMode) return demoMode;
    return subscription?.account_type || 'sole_trader';
}

// Demo Mode Functions (Admin Only)
function enterDemoMode(type) {
    if (!isAdmin) return;
    demoMode = type;
    useDemoData = true;
    initDemoData();
    loadAllData();
    renderApp();
}

function exitDemoMode() {
    if (!isAdmin) return;
    demoMode = null;
    useDemoData = false;
    location.reload();
}

function initDemoData() {
    const today = new Date().toISOString().split('T')[0];
    
    // Sample clients
    demoClients = [
        { id: 'demo-client-1', name: 'John Smith', email: 'john@example.com', phone: '0412 345 678', address: '123 Main St, Brisbane', notes: 'Prefers morning appointments' },
        { id: 'demo-client-2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '0423 456 789', address: '456 Oak Ave, Gold Coast', notes: 'VIP customer' }
    ];
    
    // Sample jobs
    demoJobs = [
        { id: 'demo-job-1', client_id: 'demo-client-1', title: 'Bathroom Renovation', date: today, time: '09:00', status: 'scheduled', notes: 'Full bathroom remodel', photos: [], job_address: '123 Main St, Brisbane' },
        { id: 'demo-job-2', client_id: 'demo-client-2', title: 'Kitchen Installation', date: today, time: '14:00', status: 'in_progress', notes: 'Cabinet installation', photos: [], job_address: '456 Oak Ave, Gold Coast' }
    ];
    
    // Sample quotes
    demoQuotes = [
        { 
            id: 'demo-quote-1', 
            client_id: 'demo-client-1', 
            title: 'Bathroom Renovation', 
            created_at: today,
            quote_number: 'QT-001',
            items: [
                { description: 'Labour', quantity: 1, price: 3000 },
                { description: 'Materials', quantity: 1, price: 2000 }
            ],
            total: 5000,
            subtotal: 4545.45,
            gst: 454.55,
            deposit_percentage: 30,
            status: 'pending',
            share_token: 'demo-token-1',
            job_address: '123 Main St, Brisbane'
        }
    ];
    
    // Sample invoices
    demoInvoices = [
        {
            id: 'demo-invoice-1',
            client_id: 'demo-client-2',
            title: 'Kitchen Installation - Deposit',
            invoice_number: 'INV-001',
            issue_date: today,
            due_date: today,
            items: [{ description: 'Deposit - Kitchen Installation', quantity: 1, price: 2000 }],
            total: 2000,
            subtotal: 1818.18,
            gst: 181.82,
            status: 'unpaid',
            job_address: '456 Oak Ave, Gold Coast'
        }
    ];
    
    // Sample expenses
    demoExpenses = [
        { id: 'demo-expense-1', date: today, amount: 150, category: 'Materials', description: 'Tiles for bathroom', job_id: 'demo-job-1' },
        { id: 'demo-expense-2', date: today, amount: 80, category: 'Fuel', description: 'Weekly fuel', job_id: null }
    ];
    
    // Sample team members (for business demo)
    if (demoMode === 'business') {
        demoTeamMembers = [
            { id: 'demo-team-1', name: 'Mike Wilson', email: 'mike@example.com', phone: '0434 567 890', occupation: 'Painter', color: '#3b82f6' },
            { id: 'demo-team-2', name: 'Lisa Brown', email: 'lisa@example.com', phone: '0445 678 901', occupation: 'Electrician', color: '#ef4444' }
        ];
        demoJobs[0].assigned_to = 'demo-team-1';
        demoExpenses[0].team_member_id = 'demo-team-1';
    } else {
        demoTeamMembers = [];
    }
    
    console.log('✅ Demo data populated:', demoMode);
}

// Upgrade to Business
function confirmUpgradeToBusiness() {
    if (confirm('Upgrade to Business tier for $89.95/month?\n\nBusiness features include:\n• Unlimited team members\n• Team expense tracking\n• Advanced analytics\n• Priority support\n\nWould you like to proceed?')) {
        // Open email to support for manual upgrade
        window.location.href = 'mailto:m4projectsanddesigns@gmail.com?subject=Business%20Tier%20Upgrade%20Request&body=Hi%2C%0A%0AI%20would%20like%20to%20upgrade%20to%20the%20Business%20tier.%0A%0AMy%20account%20email%3A%20' + encodeURIComponent(currentUser.email);
    }
}

// ═══════════════════════════════════════════════════════════════════
// GOOGLE PLACES AUTOCOMPLETE
// ═══════════════════════════════════════════════════════════════════

// Google Maps API Key - User should replace with their own
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

// Track which fields have been initialized to prevent duplicates
const initializedFields = new Set();

// Clear initialized fields (call when modal closes)
function clearInitializedFields() {
    console.log('🧹 Clearing initialized autocomplete fields');
    initializedFields.clear();
}

// Initialize autocomplete on address field
function initAddressAutocomplete(inputId) {
    console.log(`🔍 Attempting to init autocomplete for: ${inputId}`);
    
    const input = document.getElementById(inputId);
    if (!input) {
        console.log(`❌ Field ${inputId} not found in DOM`);
        return;
    }
    
    // Check if already initialized
    if (initializedFields.has(inputId)) {
        console.log(`⚠️ Field ${inputId} already initialized, skipping`);
        return;
    }
    
    // Wait for Google Maps to load (with retries)
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.log(`⏳ Google Maps not ready yet for ${inputId}, retrying in 500ms...`);
        setTimeout(() => initAddressAutocomplete(inputId), 500);
        return;
    }
    
    console.log(`✅ Google Maps ready! Creating autocomplete for ${inputId}`);
    
    try {
        // Create autocomplete instance
        const autocomplete = new google.maps.places.Autocomplete(input, {
            componentRestrictions: { country: 'au' }, // Restrict to Australia
            fields: ['formatted_address', 'geometry', 'name'],
            types: ['address']
        });
        
        // When user selects an address
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            console.log('📍 Place selected:', place);
            if (place.formatted_address) {
                input.value = place.formatted_address;
                console.log('✅ Address filled:', place.formatted_address);
            }
        });
        
        // Mark as initialized
        initializedFields.add(inputId);
        console.log(`🎉 Autocomplete successfully initialized for ${inputId}`);
        
    } catch (error) {
        console.error(`❌ Error creating autocomplete for ${inputId}:`, error);
    }
}

// Initialize all address fields in current modal
function initAllAddressAutocomplete() {
    console.log('🚀 initAllAddressAutocomplete called');
    
    // Wait a bit for modal to render
    setTimeout(() => {
        console.log('🔍 Looking for address fields...');
        
        // Try to initialize all common address field IDs
        const addressFields = [
            'client_address',
            'job_address',
            'quote_address'
        ];
        
        let foundFields = 0;
        addressFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                foundFields++;
                console.log(`✅ Found field: ${fieldId}`);
                initAddressAutocomplete(fieldId);
            } else {
                console.log(`⚠️ Field not found: ${fieldId}`);
            }
        });
        
        if (foundFields === 0) {
            console.log('❌ No address fields found in modal');
        }
        
    }, 300); // Increased delay to ensure modal is fully rendered
}

// ═══════════════════════════════════════════════════════════════════
// PDF GENERATION WITH CUSTOM LOGO SUPPORT
// ═══════════════════════════════════════════════════════════════════

async function generatePDF(type, item) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const settings = companySettings || {};
        const client = clients.find(c => c.id === item.client_id);
        
        let yPos = 20;
        
        // Add logo (custom or M4 default)
        const logoUrl = settings.logo_url || 'final_logo.png';
        console.log('📄 PDF Generation - Logo URL:', logoUrl);
        
        try {
            // Load and convert logo to base64
            const img = new Image();
            
            // Only set crossOrigin for external URLs (Supabase)
            if (logoUrl.startsWith('http')) {
                img.crossOrigin = 'anonymous';
            }
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    console.log('✅ Logo loaded successfully:', {
                        width: img.width,
                        height: img.height,
                        src: img.src
                    });
                    
                    try {
                        // Convert to base64 via canvas
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        const base64 = canvas.toDataURL('image/png');
                        console.log('🔄 Logo converted to base64, length:', base64.length);
                        
                        // Calculate dimensions for PDF (max width 40mm, max height 25mm)
                        const maxWidth = 40;
                        const maxHeight = 25;
                        let pdfWidth = 40; // mm
                        let pdfHeight = (img.height / img.width) * 40; // maintain aspect ratio
                        
                        // Scale down if too tall
                        if (pdfHeight > maxHeight) {
                            pdfHeight = maxHeight;
                            pdfWidth = (img.width / img.height) * maxHeight;
                        }
                        
                        console.log('📐 Logo size in PDF:', pdfWidth, 'x', pdfHeight, 'mm');
                        
                        // Add to PDF
                        doc.addImage(base64, 'PNG', 15, yPos, pdfWidth, pdfHeight);
                        console.log('✅ Logo successfully added to PDF at position (15,', yPos, ')');
                        
                    } catch (canvasError) {
                        console.error('❌ Canvas conversion failed:', canvasError);
                        throw canvasError;
                    }
                    
                    resolve();
                };
                
                img.onerror = (error) => {
                    console.error('❌ Failed to load logo image:', logoUrl, error);
                    reject(error);
                };
                
                img.src = logoUrl;
                console.log('⏳ Loading logo from:', logoUrl);
            });
            
            yPos += 35; // Increase spacing after logo
        } catch (error) {
            console.error('❌ Error in logo loading process:', error);
            console.log('⚠️ Continuing PDF generation without logo');
            // Continue without logo
        }
        
        // Company details (right side)
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        const rightX = 140;
        let rightY = 20;
        
        if (settings.business_name) {
            doc.text(settings.business_name, rightX, rightY);
            rightY += 5;
        }
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        
        if (settings.abn) {
            doc.text(`ABN: ${settings.abn}`, rightX, rightY);
            rightY += 5;
        }
        if (settings.phone) {
            doc.text(settings.phone, rightX, rightY);
            rightY += 5;
        }
        if (settings.email) {
            doc.text(settings.email, rightX, rightY);
            rightY += 5;
        }
        if (settings.address) {
            const addressLines = doc.splitTextToSize(settings.address, 60);
            doc.text(addressLines, rightX, rightY);
            rightY += addressLines.length * 5;
        }
        
        // Document title
        yPos = Math.max(yPos, rightY + 10);
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text(type === 'quote' ? 'QUOTE' : 'INVOICE', 15, yPos);
        
        // Document number and date
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        const docNumber = type === 'quote' 
            ? (item.quote_number || `QT-${item.id.slice(0, 6)}`)
            : (item.invoice_number || `INV-${item.id.slice(0, 6)}`);
        
        doc.text(`${type === 'quote' ? 'Quote' : 'Invoice'} #: ${docNumber}`, 15, yPos);
        yPos += 6;
        
        const date = new Date(item.created_at || Date.now()).toLocaleDateString();
        doc.text(`Date: ${date}`, 15, yPos);
        yPos += 6;
        
        if (type === 'invoice' && item.due_date) {
            doc.text(`Due Date: ${new Date(item.due_date).toLocaleDateString()}`, 15, yPos);
            yPos += 6;
        }
        
        // Client details
        yPos += 5;
        doc.setFont(undefined, 'bold');
        doc.text('BILL TO:', 15, yPos);
        yPos += 6;
        
        doc.setFont(undefined, 'normal');
        if (client) {
            doc.text(client.name, 15, yPos);
            yPos += 5;
            if (client.email) {
                doc.text(client.email, 15, yPos);
                yPos += 5;
            }
            if (client.phone) {
                doc.text(client.phone, 15, yPos);
                yPos += 5;
            }
            if (client.address) {
                const clientAddressLines = doc.splitTextToSize(client.address, 80);
                doc.text(clientAddressLines, 15, yPos);
                yPos += clientAddressLines.length * 5;
            }
        }
        
        // Line items table
        yPos += 10;
        doc.setFont(undefined, 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPos - 5, 180, 8, 'F');
        doc.text('Description', 20, yPos);
        doc.text('Quantity', 110, yPos);
        doc.text('Price', 140, yPos);
        doc.text('Amount', 170, yPos);
        
        yPos += 8;
        doc.setFont(undefined, 'normal');
        
        // Add line items
        const lineItems = item.line_items || [];
        lineItems.forEach((lineItem) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            const description = doc.splitTextToSize(lineItem.description || '', 80);
            doc.text(description, 20, yPos);
            doc.text(String(lineItem.quantity || 1), 110, yPos);
            doc.text(`$${parseFloat(lineItem.price || 0).toFixed(2)}`, 140, yPos);
            doc.text(`$${parseFloat(lineItem.amount || 0).toFixed(2)}`, 170, yPos);
            
            yPos += Math.max(description.length * 5, 6);
        });
        
        // Totals
        yPos += 5;
        doc.line(15, yPos, 195, yPos);
        yPos += 8;
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('TOTAL:', 140, yPos);
        doc.text(`$${parseFloat(item.total || 0).toFixed(2)}`, 170, yPos);
        
        // Invoice-specific: Payment status
        if (type === 'invoice') {
            yPos += 10;
            doc.setFontSize(10);
            const status = item.status === 'paid' ? 'PAID' : 'UNPAID';
            const statusColor = item.status === 'paid' ? [34, 197, 94] : [239, 68, 68];
            doc.setTextColor(...statusColor);
            doc.text(`Status: ${status}`, 15, yPos);
            doc.setTextColor(0, 0, 0);
            
            // Bank details
            if (settings.bank_name && item.status !== 'paid') {
                yPos += 10;
                doc.setFont(undefined, 'bold');
                doc.text('Payment Details:', 15, yPos);
                yPos += 6;
                doc.setFont(undefined, 'normal');
                
                doc.text(`Bank: ${settings.bank_name}`, 15, yPos);
                yPos += 5;
                if (settings.bsb) {
                    doc.text(`BSB: ${settings.bsb}`, 15, yPos);
                    yPos += 5;
                }
                if (settings.account_number) {
                    doc.text(`Account: ${settings.account_number}`, 15, yPos);
                    yPos += 5;
                }
                if (settings.account_name) {
                    doc.text(`Name: ${settings.account_name}`, 15, yPos);
                }
            }
        }
        
        // Notes
        if (item.notes) {
            yPos += 10;
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFont(undefined, 'bold');
            doc.text('Notes:', 15, yPos);
            yPos += 6;
            doc.setFont(undefined, 'normal');
            const notesLines = doc.splitTextToSize(item.notes, 180);
            doc.text(notesLines, 15, yPos);
        }
        
        // Save PDF
        const fileName = `${type}_${docNumber}_${date.replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
        
        showNotification(`✅ PDF generated: ${fileName}`, 'success');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Failed to generate PDF', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════
// EMAIL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

async function sendQuoteEmail(quote) {
    const client = clients.find(c => c.id === quote.client_id);
    if (!client || !client.email) {
        alert('Client email not found!');
        return;
    }
    
    if (!emailSettings || !emailSettings.sendgrid_api_key) {
        alert('⚠️ Email not configured! Please add your SendGrid settings in Company Info.');
        return;
    }
    
    const currentUrl = window.location.href.split('?')[0].split('#')[0];
    const baseUrl = currentUrl.replace(/\/[^\/]*$/, '/');
    const shareLink = baseUrl + 'quote-viewer.html?quote=' + quote.share_token;
    
    console.log('Generated share link:', shareLink);
    console.log('Sending to:', client.email);
    
    const fromName = emailSettings.from_name;
    
    // Use custom logo if available, otherwise M4 logo
    const logoUrl = companySettings?.logo_url || 'https://i.imgur.com/dF4xRDK.jpeg';
    
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
                <img src="${logoUrl}" alt="Company Logo" style="max-width: 150px; max-height: 100px; margin-bottom: 10px; object-fit: contain;">
                <h1 style="color: #14b8a6; margin: 10px 0; font-size: 24px;">${companySettings?.business_name || 'M4 STREAMLINE'}</h1>
                ${!companySettings?.business_name ? '<p style="color: #14b8a6; font-style: italic; font-size: 14px; margin: 0;">"streamlining your business"</p>' : ''}
            </div>
            <p>Hello ${client.name},</p>
            <p>${fromName} has sent you a quote for: <strong>${quote.title}</strong></p>
            <p>Total Amount: <strong>$${quote.total.toFixed(2)}</strong></p>
            <p>Please click the link below to view and download your quote.</p>
            <p style="margin: 30px 0;">
                <a href="${shareLink}" style="background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Your Quote</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #14b8a6; word-break: break-all;">${shareLink}</p>
            <p>Best regards,<br>${fromName}</p>
        </div>
    `;
    
    try {
        console.log('Calling Edge Function...');
        
        const response = await fetch('https://xviustrrsuhidzbcpgow.supabase.co/functions/v1/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXVzdHJyc3VoaWR6YmNwZ293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODk1NDgsImV4cCI6MjA4NDM2NTU0OH0.CEcc50c1K2Qnh6rXt_1-_w30LzHvDniGLbqWhdOolRY'
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                to_email: client.email,
                to_name: client.name,
                subject: `Quote from ${fromName}: ${quote.title}`,
                html_content: htmlContent
            })
        });
        
        const result = await response.json();
        console.log('Edge Function response:', result);
        
        if (response.ok && result.success) {
            alert('✅ Email sent successfully to ' + client.email + '!\n\nQuote link: ' + shareLink);
        } else {
            console.error('Email send error:', result);
            alert('⚠️ Email may not have sent: ' + (result.error || 'Unknown error') + '\n\nManually send this link:\n' + shareLink);
        }
    } catch (error) {
        console.error('Email error:', error);
        alert('❌ Failed to send email: ' + error.message + '\n\nManually send this link:\n' + shareLink);
    }
}

async function sendQuoteSMS(quote) {
    const client = clients.find(c => c.id === quote.client_id);
    
    if (!client?.phone) {
        showNotification('Client has no phone number', 'error');
        return;
    }
    
    if (!smsSettings?.enabled) {
        showNotification('SMS is not configured', 'error');
        return;
    }
    
    const currentUrl = window.location.href.split('?')[0].split('#')[0];
    const baseUrl = currentUrl.replace(/\/[^\/]*$/, '/');
    const shareLink = baseUrl + 'quote-viewer.html?quote=' + quote.share_token;
    
    const message = `Hi ${client.name}, your quote ${quote.quote_number || quote.title} for $${quote.total.toFixed(2)} is ready. View it here: ${shareLink}`;
    
    try {
        const response = await fetch('https://xviustrrsuhidzbcpgow.supabase.co/functions/v1/send-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXVzdHJyc3VoaWR6YmNwZ293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODk1NDgsImV4cCI6MjA4NDM2NTU0OH0.CEcc50c1K2Qnh6rXt_1-_w30LzHvDniGLbqWhdOolRY'
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                to: client.phone,
                message: message
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showNotification('SMS sent successfully to ' + client.phone, 'success');
        } else {
            console.error('SMS send error:', result);
            showNotification('Failed to send SMS: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error sending SMS:', error);
        showNotification('Failed to send SMS: ' + error.message, 'error');
    }
}

async function sendInvoiceEmail(invoice) {
    const client = clients.find(c => c.id === invoice.client_id);
    if (!client || !client.email) {
        alert('Client email not found!');
        return;
    }
    
    if (!emailSettings || !emailSettings.sendgrid_api_key) {
        alert('⚠️ Email not configured! Please add your SendGrid settings in Company Info.');
        return;
    }
    
    const baseUrl = window.location.href.split('?')[0].replace('index.html', '');
    const fromName = emailSettings.from_name;
    
    // Use custom logo if available, otherwise fallback to M4 logo
    const logoUrl = companySettings?.logo_url || 'https://i.imgur.com/dF4xRDK.jpeg';
    const companyName = companySettings?.business_name || 'M4 STREAMLINE';
    
    let paymentButton = '';
    if (invoice.status === 'unpaid' && stripeSettings?.publishable_key) {
        const paymentLink = baseUrl + 'payment.html?invoice=' + invoice.id;
        paymentButton = `<p style="margin: 30px 0;">
            <a href="${paymentLink}" style="background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Invoice & Pay Online</a>
        </p>
        <p>Or copy and paste this link: <span style="color: #14b8a6;">${paymentLink}</span></p>`;
    }
    
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
                <img src="${logoUrl}" alt="Company Logo" style="max-width: 150px; max-height: 100px; margin-bottom: 10px; object-fit: contain;">
                <h1 style="color: #14b8a6; margin: 10px 0; font-size: 24px;">${companyName}</h1>
                ${!companySettings?.business_name ? '<p style="color: #14b8a6; font-style: italic; font-size: 14px; margin: 0;">"streamlining your business"</p>' : ''}
            </div>
            <p>Hello ${client.name},</p>
            <p>Your invoice is ready.</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
                <p style="margin: 5px 0;"><strong>Amount Due:</strong> $${invoice.total.toFixed(2)}</p>
                ${invoice.due_date ? `<p style="margin: 5px 0;"><strong>Due Date:</strong> ${invoice.due_date}</p>` : ''}
            </div>
            ${paymentButton}
            <p>Best regards,<br>${fromName}</p>
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
                to_email: client.email,
                to_name: client.name,
                subject: `Invoice from ${fromName} - ${invoice.invoice_number}`,
                html_content: htmlContent
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('✅ Email sent successfully to ' + client.email + '!');
        } else {
            console.error('Email send error:', result);
            alert('⚠️ Email may not have sent: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Email error:', error);
        alert('❌ Failed to send email: ' + error.message);
    }
}

console.log('✅ Utils loaded');
