// M4 Receipt Scanner v4 - Platform-level AI scanning
// Every user gets automatic receipt scanning, zero setup
// Additive only
(function(){
try {

function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

window._pendingReceiptUrl = null;
window._pendingReceiptFile = null;
window._pendingReceiptData = null;

// Platform API key - built into the product
var _AI_KEY = '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';

// ============ INJECT SCAN RECEIPT BUTTON ============
function injectScanButton() {
  var addBtns = document.querySelectorAll('button');
  for (var i = 0; i < addBtns.length; i++) {
    var btn = addBtns[i];
    if (btn.textContent.trim() !== '+ Add Expense') continue;
    if (btn.dataset.scanAdded) continue;
    btn.dataset.scanAdded = 'true';

    var scanBtn = document.createElement('button');
    scanBtn.className = btn.className;
    scanBtn.innerHTML = '<svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>Scan Receipt';
    scanBtn.setAttribute('onclick', 'openReceiptScanner()');
    btn.parentNode.insertBefore(scanBtn, btn);
  }
}

// ============ SCANNER MODAL ============
window.openReceiptScanner = function() {
  if (document.getElementById('receipt-scanner-modal')) return;

  var overlay = document.createElement('div');
  overlay.id = 'receipt-scanner-modal';
  overlay.className = 'fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto';
  overlay.setAttribute('onclick', 'if(event.target===this)closeReceiptScanner()');

  overlay.innerHTML =
    '<div class="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full my-4" style="max-height:90vh;overflow-y:auto;">' +
      '<div class="flex justify-between mb-4">' +
        '<h3 class="text-lg sm:text-xl font-bold dark:text-white">Scan Receipt</h3>' +
        '<button onclick="closeReceiptScanner()" class="text-2xl leading-none dark:text-gray-300 hover:text-gray-600">&times;</button>' +
      '</div>' +
      '<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Take a photo or upload a receipt image. We will automatically read the date, amount and description.</p>' +

      '<div id="receipt-preview-area" class="hidden mb-4">' +
        '<img id="receipt-preview-img" class="w-full max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700" />' +
        '<p id="receipt-file-name" class="text-xs text-gray-400 text-center mt-2"></p>' +
      '</div>' +

      '<label class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors" id="receipt-drop-zone">' +
        '<div class="flex flex-col items-center justify-center py-4">' +
          '<svg class="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>' +
          '</svg>' +
          '<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Take photo or choose file</p>' +
          '<p class="text-xs text-gray-400 dark:text-gray-500 mt-1">JPG, PNG, HEIC</p>' +
        '</div>' +
        '<input type="file" accept="image/*" capture="environment" id="receipt-file-input" onchange="onReceiptFileSelected(this)" class="hidden" />' +
      '</label>' +

      '<div id="receipt-status" class="hidden mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300 text-center"></div>' +

      '<div class="flex gap-3 mt-6">' +
        '<button id="receipt-continue-btn" onclick="continueWithReceipt()" class="flex-1 bg-teal-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors opacity-50 cursor-not-allowed" disabled>Upload & Scan</button>' +
        '<button onclick="closeReceiptScanner()" class="px-6 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
};

window.closeReceiptScanner = function() {
  var m = document.getElementById('receipt-scanner-modal');
  if (m) m.remove();
};

window.onReceiptFileSelected = function(input) {
  var file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showNotification('Please select an image file', 'error');
    return;
  }
  window._pendingReceiptFile = file;

  var preview = document.getElementById('receipt-preview-area');
  var previewImg = document.getElementById('receipt-preview-img');
  var fileName = document.getElementById('receipt-file-name');
  var dropZone = document.getElementById('receipt-drop-zone');

  if (previewImg) {
    var reader = new FileReader();
    reader.onload = function(e) {
      previewImg.src = e.target.result;
      if (preview) preview.classList.remove('hidden');
      if (dropZone) dropZone.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
  if (fileName) fileName.textContent = file.name;

  var btn = document.getElementById('receipt-continue-btn');
  if (btn) {
    btn.disabled = false;
    btn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
};

// ============ FILE TO BASE64 ============
function fileToBase64(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() { resolve(reader.result.split(',')[1]); };
    reader.onerror = function() { reject(new Error('Failed to read file')); };
    reader.readAsDataURL(file);
  });
}

function setStatus(msg) {
  var el = document.getElementById('receipt-status');
  if (el) {
    el.textContent = msg;
    el.classList.remove('hidden');
  }
}

// ============ UPLOAD + SCAN ============
window.continueWithReceipt = async function() {
  if (!window._pendingReceiptFile) return;

  var btn = document.getElementById('receipt-continue-btn');
  if (btn) { btn.disabled = true; }

  try {
    var file = window._pendingReceiptFile;

    // Step 1: Convert to base64
    setStatus('Reading image...');
    var base64Data = await fileToBase64(file);
    var mediaType = file.type || 'image/jpeg';

    // Step 2: Upload to storage
    setStatus('Uploading receipt...');
    var fileExt = file.name.split('.').pop();
    var fileName = 'receipt-' + Date.now() + '.' + fileExt;
    var filePath = 'receipts/' + fileName;
    var sc = typeof supabaseClient !== 'undefined' ? supabaseClient : supabase;

    var uploadResult = await sc.storage.from('job-photos').upload(filePath, file);
    if (uploadResult.error) throw uploadResult.error;

    var urlResult = sc.storage.from('job-photos').getPublicUrl(filePath);
    var receiptUrl = urlResult.data ? urlResult.data.publicUrl : null;
    if (!receiptUrl) throw new Error('Could not get receipt URL');

    window._pendingReceiptUrl = receiptUrl;
    window._pendingReceiptFile = null;

    // Step 3: AI scan
    setStatus('Analysing receipt with AI...');
    var extracted = await scanReceipt(base64Data, mediaType);
    window._pendingReceiptData = extracted;

    if (extracted) {
      console.log('Scan result:', extracted);
      var parts = [];
      if (extracted.amount) parts.push('$' + parseFloat(extracted.amount).toFixed(2));
      if (extracted.date) parts.push(extracted.date);
      if (extracted.description) parts.push(extracted.description);
      if (parts.length > 0) {
        setStatus('Found: ' + parts.join(', '));
        await new Promise(function(r) { setTimeout(r, 1000); });
      }
    }

    closeReceiptScanner();
    openModal('expense');

    if (extracted && (extracted.amount || extracted.date)) {
      showNotification('Receipt scanned! Check the pre-filled details.', 'success');
    } else {
      showNotification('Receipt uploaded! Fill in the details below.', 'success');
    }
  } catch (error) {
    console.error('Error with receipt:', error);
    setStatus('Error: ' + error.message);
    showNotification('Error: ' + error.message, 'error');
    if (btn) { btn.disabled = false; }
  }
};

// ============ AI SCAN VIA ANTHROPIC API ============
async function scanReceipt(base64Data, mediaType) {
  try {
    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': _AI_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data
              }
            },
            {
              type: 'text',
              text: 'You are a receipt reader. Extract the following from this receipt image.\n\nRespond ONLY with a valid JSON object. No markdown, no backticks, no explanation, nothing else:\n\n{"date":"YYYY-MM-DD","amount":123.45,"description":"Store name - items purchased","currency":"AUD"}\n\nRules:\n- date must be YYYY-MM-DD format. If unclear, use null.\n- amount must be a number (the TOTAL paid). No currency symbols. If unclear, use null.\n- description should be the store/merchant name followed by a brief summary of items.\n- currency should be the 3-letter code (AUD, USD, NZD etc).\n- If you cannot read a field, set it to null.\n- Respond with ONLY the JSON object, nothing else.'
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      var errBody = '';
      try { errBody = await response.text(); } catch(e) {}
      console.error('AI API error:', response.status, errBody);
      return null;
    }

    var data = await response.json();
    var text = '';
    if (data.content && data.content.length > 0) {
      for (var i = 0; i < data.content.length; i++) {
        if (data.content[i].type === 'text') {
          text += data.content[i].text;
        }
      }
    }

    if (!text) {
      console.warn('Empty AI response');
      return null;
    }

    // Clean response
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    // Try to find JSON in response
    var jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    var parsed = JSON.parse(text);
    console.log('Parsed receipt:', parsed);
    return parsed;
  } catch (err) {
    console.error('Receipt scan error:', err);
    return null;
  }
}

// ============ ENHANCE EXPENSE MODAL ============
function enhanceExpenseModal() {
  var dateField = document.getElementById('expense_date');
  if (!dateField) return;

  var form = dateField.closest('.bg-white, .dark\\:bg-gray-800') || dateField.closest('div');
  if (!form || form.dataset.receiptEnhanced) return;
  form.dataset.receiptEnhanced = 'true';

  var existingReceipt = (typeof editingItem !== 'undefined' && editingItem && editingItem.receipt_url)
    ? editingItem.receipt_url : null;
  var receiptUrl = window._pendingReceiptUrl || existingReceipt || null;

  // Hidden field for receipt_url
  var hiddenField = document.getElementById('receipt_url_field');
  if (!hiddenField) {
    hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.id = 'receipt_url_field';
    hiddenField.value = receiptUrl || '';
    form.appendChild(hiddenField);
  }

  // Receipt section above date field
  var dateLabel = dateField.closest('.mb-3');
  if (!dateLabel) return;

  var receiptSection = document.createElement('div');
  receiptSection.className = 'mb-4';
  receiptSection.id = 'expense-receipt-section';

  if (receiptUrl) {
    receiptSection.innerHTML = buildReceiptPreview(receiptUrl);
  } else {
    receiptSection.innerHTML = buildReceiptUploader();
  }

  dateLabel.parentNode.insertBefore(receiptSection, dateLabel);

  // Pre-fill from AI scan
  if (window._pendingReceiptData) {
    var rd = window._pendingReceiptData;
    window._pendingReceiptData = null;
    if (rd.date) {
      var df = document.getElementById('expense_date');
      if (df) df.value = rd.date;
    }
    if (rd.amount) {
      var af = document.getElementById('amount');
      if (af) af.value = parseFloat(rd.amount).toFixed(2);
    }
    if (rd.description) {
      var descf = document.getElementById('description');
      if (descf) descf.value = rd.description;
    }
  }

  if (window._pendingReceiptUrl) {
    window._pendingReceiptUrl = null;
  }
}

function buildReceiptPreview(url) {
  return '<div class="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">' +
    '<div class="flex items-start gap-3">' +
      '<img src="' + escH(url) + '" class="w-16 h-20 object-cover rounded border border-gray-200 dark:border-gray-600 cursor-pointer" onclick="openExpReceiptLB(\'' + escH(url) + '\')" />' +
      '<div class="flex-1">' +
        '<p class="text-sm font-medium text-teal-700 dark:text-teal-400">Receipt attached</p>' +
        '<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to preview</p>' +
        '<button onclick="removeExpenseReceipt()" class="text-xs text-red-500 hover:text-red-700 mt-1">Remove</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function buildReceiptUploader() {
  return '<div class="flex items-center gap-2">' +
    '<label class="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors text-sm text-gray-500 dark:text-gray-400">' +
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>' +
      'Attach Receipt Photo' +
      '<input type="file" accept="image/*" capture="environment" onchange="uploadReceiptInModal(this)" class="hidden" />' +
    '</label>' +
  '</div>';
}

window.uploadReceiptInModal = async function(input) {
  var file = input.files[0];
  if (!file || !file.type.startsWith('image/')) {
    showNotification('Please select an image', 'error');
    return;
  }

  var section = document.getElementById('expense-receipt-section');
  if (section) section.innerHTML = '<div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-500 dark:text-gray-400 text-center">Uploading...</div>';

  try {
    var fileExt = file.name.split('.').pop();
    var fileName = 'receipt-' + Date.now() + '.' + fileExt;
    var filePath = 'receipts/' + fileName;
    var sc = typeof supabaseClient !== 'undefined' ? supabaseClient : supabase;

    var uploadResult = await sc.storage.from('job-photos').upload(filePath, file);
    if (uploadResult.error) throw uploadResult.error;

    var urlResult = sc.storage.from('job-photos').getPublicUrl(filePath);
    var receiptUrl = urlResult.data ? urlResult.data.publicUrl : null;
    if (!receiptUrl) throw new Error('Could not get URL');

    var hidden = document.getElementById('receipt_url_field');
    if (hidden) hidden.value = receiptUrl;

    if (section) section.innerHTML = buildReceiptPreview(receiptUrl);
    showNotification('Receipt uploaded', 'success');
  } catch (error) {
    console.error('Error uploading receipt:', error);
    if (section) section.innerHTML = '<div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600">Upload failed. <button onclick="removeExpenseReceipt()" class="underline">Try again</button></div>';
  }
};

window.removeExpenseReceipt = function() {
  var hidden = document.getElementById('receipt_url_field');
  if (hidden) hidden.value = '';
  var section = document.getElementById('expense-receipt-section');
  if (section) section.innerHTML = buildReceiptUploader();
};

window.openExpReceiptLB = function(url) {
  if (typeof openPhotoLightbox === 'function') {
    openPhotoLightbox([url], 0);
  } else {
    window.open(url, '_blank');
  }
};

// ============ OVERRIDE saveExpense ============
var _origSaveExpense = window.saveExpense;

window.saveExpense = function() {
  var receiptField = document.getElementById('receipt_url_field');
  window._receiptUrlForSave = (receiptField && receiptField.value) ? receiptField.value : null;
  _origSaveExpense();
};

var _origAddExpense = window.addExpense;

window.addExpense = async function(expense) {
  if (window._receiptUrlForSave) {
    expense.receipt_url = window._receiptUrlForSave;
    window._receiptUrlForSave = null;
  }
  var result = await _origAddExpense(expense);
  if (expense.receipt_url && expenses.length > 0) {
    var latest = expenses[expenses.length - 1];
    if (latest && !latest.receipt_url) latest.receipt_url = expense.receipt_url;
  }
  return result;
};

var _origUpdateExpense = window.updateExpense;

window.updateExpense = async function(id) {
  var receiptField = document.getElementById('receipt_url_field');
  var receiptUrl = (receiptField && receiptField.value) ? receiptField.value : null;

  await _origUpdateExpense(id);

  if (receiptUrl !== null) {
    try {
      await supabaseClient
        .from('expenses')
        .update({ receipt_url: receiptUrl || null })
        .eq('id', id);
      var exp = expenses.find(function(e) { return e.id === id; });
      if (exp) exp.receipt_url = receiptUrl || null;
    } catch (err) {
      console.error('Error saving receipt URL:', err);
    }
  }
};

// ============ OBSERVER ============
var _receiptTimer = null;
var _receiptObs = new MutationObserver(function() {
  if (_receiptTimer) clearTimeout(_receiptTimer);
  _receiptTimer = setTimeout(function() {
    injectScanButton();
    enhanceExpenseModal();
  }, 200);
});
_receiptObs.observe(document.body, { childList: true, subtree: true });

console.log('Receipt scanner v4 loaded');

} catch(e) {
  console.error('Receipt scanner init error:', e);
}
})();
