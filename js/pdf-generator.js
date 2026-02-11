// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - PDF Generator Module (FIXED)
// ═══════════════════════════════════════════════════════════════════

function generatePDF(type, item) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const company = item.company_info || companySettings || {};
    
    // Add M4 logo from image
    const logoImg = new Image();
    logoImg.src = 'https://i.imgur.com/dF4xRDK.jpeg';
    
    // Logo left
    doc.addImage(logoImg, 'JPEG', 10, 10, 25, 25);
    
    // M4 STREAMLINE centered
    doc.setFontSize(24);
    doc.setTextColor(20, 184, 166);
    doc.text('M4 STREAMLINE', 105, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.text('"streamlining your business"', 105, 28, { align: 'center' });
    
    // Quote/Invoice number top right - ALL TEAL, perfectly aligned
    if (type === 'invoice' && (item.quote_number || item.original_quote_number)) {
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(20, 184, 166);
        const quoteNum = item.quote_number || item.original_quote_number || '';
        doc.text(`Quote #: ${quoteNum}`, 200, 22, { align: 'right' });
    } else if (type === 'quote' && item.quote_number) {
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(20, 184, 166);
        doc.text(`Quote #: ${item.quote_number}`, 200, 22, { align: 'right' });
    }
    
    doc.setFontSize(18);
    doc.setTextColor(20, 184, 166);
    const title = type === 'quote' ? 'QUOTE' : 'INVOICE';
    doc.text(title, 20, 55);
    
    const client = clients.find(c => c.id === item.client_id);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Client:', 20, 65);
    doc.text(client?.name || 'Unknown', 45, 65);
    doc.text(client?.email || '', 45, 71);
    doc.text(client?.phone || '', 45, 77);
    
    // Add job address if different from client address or if specified
    if (type === 'quote' && item.job_address) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Job Site:', 20, 85);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        const addressLines = doc.splitTextToSize(item.job_address, 100);
        doc.text(addressLines, 45, 85);
    }
    
    if (type === 'invoice') {
        doc.text('Invoice #:', 140, 65);
        doc.text(item.invoice_number || '', 170, 65);
        doc.text('Date:', 140, 71);
        doc.text(item.issue_date || '', 170, 71);
    } else {
        if (item.quote_number) {
            doc.text('Quote #:', 140, 65);
            doc.text(item.quote_number, 170, 65);
            doc.text('Date:', 140, 71);
            doc.text(item.date || '', 170, 71);
        } else {
            doc.text('Date:', 140, 65);
            doc.text(item.date || '', 170, 65);
        }
    }
    
    let y = item.job_address && type === 'quote' ? 105 : 95;
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(0, 0, 0);
    doc.rect(20, y - 7, 170, 10, 'F');
    doc.text('Description', 25, y);
    doc.text('Qty', 120, y);
    doc.text('Price', 145, y);
    doc.text('Total', 170, y);
    
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    if (item.items && Array.isArray(item.items)) {
        item.items.forEach(lineItem => {
            const startY = y;
            
            // Check if we need a new page (leaving room for totals)
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            // Wrap description text to fit in available space (from x=25 to x=115, so 90 units wide)
            const descriptionLines = doc.splitTextToSize(lineItem.description || '', 90);
            doc.text(descriptionLines, 25, y);
            
            // Calculate height needed for description
            const descriptionHeight = descriptionLines.length * 5;
            
            // Place quantity, price, and total at the FIRST line of the description
            doc.text(String(lineItem.quantity || 0), 120, startY);
            doc.text('$' + (lineItem.price || 0).toFixed(2), 145, startY);
            doc.text('$' + ((lineItem.quantity * lineItem.price) || 0).toFixed(2), 170, startY);
            
            // Move y down by the height of the description + spacing
            y += Math.max(descriptionHeight, 5) + 2;
        });
    }
    
    y += 10;
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(120, y, 190, y);
    
    // Show GST breakdown if applicable
    if (item.include_gst) {
        y += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Subtotal:', 145, y);
        doc.text('$' + (item.subtotal || 0).toFixed(2), 170, y);
        
        y += 6;
        doc.text('GST (10%):', 145, y);
        doc.text('$' + (item.gst || 0).toFixed(2), 170, y);
        
        y += 8;
        doc.setLineWidth(0.5);
        doc.setDrawColor(20, 184, 166);
        doc.line(120, y, 190, y);
    }
    
    y += 8;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(item.include_gst ? 'TOTAL (inc GST):' : 'TOTAL:', 125, y);
    doc.setTextColor(20, 184, 166);
    doc.text('$' + (item.total || 0).toFixed(2), 170, y);
    
    // Add deposit information for invoices with deposits
    if (type === 'invoice' && item.deposit_paid && item.deposit_paid > 0) {
        y += 12;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Payment Breakdown:', 125, y);
        
        y += 7;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(50, 50, 50);
        
        doc.text('Original Total:', 125, y);
        doc.text('$' + (item.original_total || item.total).toFixed(2), 170, y);
        
        y += 5;
        doc.setTextColor(100, 100, 100);
        doc.text('Less Deposit Paid:', 125, y);
        doc.text('-$' + item.deposit_paid.toFixed(2), 170, y);
        
        y += 5;
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 140, 0); // Orange
        doc.text('Balance Due:', 125, y);
        doc.text('$' + item.total.toFixed(2), 170, y);
    }
    
    // Add deposit information for quotes - FIXED VERSION
    if (type === 'quote') {
        if (item.deposit_percentage > 0) {
            y += 12;
            
            // FIXED: Calculate deposit amount from percentage
            const depositAmount = (item.total * (item.deposit_percentage / 100));
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(255, 140, 0); // Orange color
            doc.text('DEPOSIT REQUIRED: $' + depositAmount.toFixed(2), 20, y);
            
            y += 6;
            doc.setFontSize(9);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text('(' + item.deposit_percentage + '% of total)', 20, y);
            
            // Calculate and show balance
            const balance = (item.total || 0) - depositAmount;
            y += 8;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text('Balance on completion:', 20, y);
            doc.text('$' + balance.toFixed(2), 80, y);
            
            y += 5;
            doc.setFontSize(8);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text('(Unless specified otherwise)', 20, y);
        } else {
            // 0% deposit - show custom payment terms
            y += 12;
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('Payment Terms:', 20, y);
            
            y += 6;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100, 100, 100);
            const paymentTermsText = item.payment_terms || 'Full payment (COD) to be paid on completion';
            const codText = doc.splitTextToSize(paymentTermsText, 170);
            doc.text(codText, 20, y);
        }
    }
    
    // Add bank details for quotes (ADDED - was only for invoices before)
    if (type === 'quote' && company.bank_name) {
        y += 15;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Payment Details:', 20, y);
        
        y += 7;
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(50, 50, 50);
        
        if (company.bank_name) {
            doc.text('Bank: ' + company.bank_name, 20, y);
            y += 5;
        }
        if (company.account_name) {
            doc.text('Account Name: ' + company.account_name, 20, y);
            y += 5;
        }
        if (company.bsb) {
            doc.text('BSB: ' + company.bsb, 20, y);
            y += 5;
        }
        if (company.account_number) {
            doc.text('Account Number: ' + company.account_number, 20, y);
            y += 5;
        }
    }
    
    // Add bank details for invoices (if Stripe is disabled or not configured)
    if (type === 'invoice' && company.bank_name) {
        y += 15;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Payment Details:', 20, y);
        
        y += 7;
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(50, 50, 50);
        
        if (company.bank_name) {
            doc.text('Bank: ' + company.bank_name, 20, y);
            y += 5;
        }
        if (company.account_name) {
            doc.text('Account Name: ' + company.account_name, 20, y);
            y += 5;
        }
        if (company.bsb) {
            doc.text('BSB: ' + company.bsb, 20, y);
            y += 5;
        }
        if (company.account_number) {
            doc.text('Account Number: ' + company.account_number, 20, y);
            y += 5;
        }
        
        // Add payment reference suggestion
        y += 3;
        doc.setFontSize(8);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(100, 100, 100);
        const referenceText = doc.splitTextToSize('Please use invoice number as payment reference', 170);
        doc.text(referenceText, 20, y);
    }
    
    if (item.notes) {
        y += 15;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.text('Notes:', 20, y);
        const splitNotes = doc.splitTextToSize(item.notes, 170);
        doc.text(splitNotes, 20, y + 5);
    }
    
    // Add Terms & Conditions page for quotes
    if (type === 'quote') {
        doc.addPage();
        
        // Header matching main page
        doc.addImage(logoImg, 'JPEG', 10, 10, 25, 25);
        
        doc.setFontSize(24);
        doc.setTextColor(20, 184, 166);
        doc.text('M4 STREAMLINE', 105, 22, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont(undefined, 'italic');
        doc.text('"streamlining your business"', 105, 28, { align: 'center' });
        
        // Company info centered
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        let infoY = 33;
        if (company.abn) { doc.text('ABN: ' + company.abn, 105, infoY, { align: 'center' }); infoY += 4; }
        if (company.phone) { doc.text(company.phone, 105, infoY, { align: 'center' }); infoY += 4; }
        if (company.email) { doc.text(company.email, 105, infoY, { align: 'center' }); }
        
        // Terms & Conditions title
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text('Terms & Conditions', 20, 55);
        
        let y = 70;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        // Terms content
        const terms = [
            {
                title: '1. Acceptance',
                text: 'By accepting this quote, you agree to these terms and conditions. The quote is valid for 30 days from the date of issue.'
            },
            {
                title: '2. Payment',
                text: 'Payment terms are as specified in the quote. Deposits must be paid before work commences. Final payment is due upon completion unless otherwise agreed.'
            },
            {
                title: '3. Scope of Work',
                text: 'Work will be carried out as described in this quote. Any additional work outside this scope will be quoted separately and requires written approval.'
            },
            {
                title: '4. Variations',
                text: 'Any variations to the quoted work must be agreed in writing. Variations may result in additional charges and extended completion times.'
            },
            {
                title: '5. Warranty',
                text: 'All work is guaranteed for a period of 12 months from completion date, subject to normal wear and tear.'
            },
            {
                title: '6. Liability',
                text: 'Our liability is limited to the cost of rectifying any defects in our workmanship. We are not liable for consequential losses or damages.'
            },
            {
                title: '7. Access and Site Conditions',
                text: 'Client must provide reasonable access to the work site and ensure utilities are available. Additional charges may apply if site conditions differ from those described.'
            },
            {
                title: '8. Cancellation',
                text: 'Cancellation must be made in writing. Cancellation fees may apply for work already commenced or materials ordered.'
            }
        ];
        
        terms.forEach(term => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFont(undefined, 'bold');
            doc.text(term.title, 20, y);
            y += 6;
            
            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize(term.text, 170);
            doc.text(lines, 20, y);
            y += (lines.length * 5) + 8;
        });
    }
    
    const filename = type === 'quote' ? `Quote-${item.title}.pdf` : `Invoice-${item.invoice_number}.pdf`;
    doc.save(filename);
}

console.log('✅ PDF Generator loaded');
