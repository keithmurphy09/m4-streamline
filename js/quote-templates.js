// M4 Quote Templates - Detailed Quote Setup
// Saves line items + rates as template, pre-fills on use
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'.qt-setup-btn{padding:4px 12px;font-size:11px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit;margin-top:6px}',
'.qt-setup-btn:hover{background:#0f766e}',
'.qt-edit-btn{padding:3px 10px;font-size:10px;font-weight:600;background:transparent;color:#0d9488;border:1px solid #0d9488;border-radius:5px;cursor:pointer;font-family:inherit;margin-left:8px}',
'.qt-edit-btn:hover{background:#0d9488;color:#fff}',
'.qt-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center}',
'.qt-modal-box{background:#fff;border-radius:16px;padding:28px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto}',
'.dark .qt-modal-box{background:#1f2937}',
'.qt-modal-title{font-size:20px;font-weight:800;color:#0f172a;margin-bottom:4px}',
'.dark .qt-modal-title{color:#fff}',
'.qt-modal-sub{font-size:13px;color:#64748b;margin-bottom:20px}',
'.qt-row{display:flex;gap:8px;align-items:center;margin-bottom:8px}',
'.qt-row input{padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;box-sizing:border-box}',
'.dark .qt-row input{background:#374151;border-color:#4b5563;color:#fff}',
'.qt-desc-input{flex:1}',
'.qt-rate-input{width:90px}',
'.qt-del{width:28px;height:28px;border:none;background:#fee2e2;color:#ef4444;border-radius:6px;cursor:pointer;font-size:16px;font-weight:700;flex-shrink:0;display:flex;align-items:center;justify-content:center}',
'.qt-del:hover{background:#ef4444;color:#fff}',
'.qt-add-row{padding:8px 16px;font-size:12px;font-weight:600;background:#f0fdfa;color:#0d9488;border:1px dashed #0d9488;border-radius:8px;cursor:pointer;font-family:inherit;width:100%;margin:12px 0}',
'.dark .qt-add-row{background:rgba(13,148,136,0.1);border-color:#0d9488}',
'.qt-add-row:hover{background:#ccfbf1}',
'.qt-save{padding:10px 24px;font-size:14px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit}',
'.qt-save:hover{background:#0f766e}',
'.qt-cancel{padding:10px 24px;font-size:14px;font-weight:600;background:#fff;color:#64748b;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;font-family:inherit;margin-right:8px}',
'.dark .qt-cancel{background:#374151;border-color:#4b5563;color:#9ca3af}',
'.qt-hd-row{display:flex;gap:8px;margin-bottom:6px;padding:0 0 4px;border-bottom:1px solid #e2e8f0}',
'.dark .qt-hd-row{border-color:#4b5563}',
'.qt-hd{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase}',
'.qt-filled{background:#f0fdfa;border:2px solid #0d9488;border-radius:10px;padding:8px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between}',
'.dark .qt-filled{background:rgba(13,148,136,0.1)}',
'.qt-filled-text{font-size:12px;color:#0d9488;font-weight:600}',
'.qt-filled-count{font-size:11px;color:#64748b}'
].join('\n');
document.head.appendChild(css);

var _template = null;
var _loaded = false;

function getOwnerId() {
  return (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : (currentUser ? currentUser.id : null);
}

// Load template
async function loadTemplate() {
  if (_loaded) return;
  try {
    var oid = getOwnerId();
    if (!oid) return;
    var r = await supabaseClient.from('quote_templates').select('*').eq('user_id', oid).eq('template_name', 'Detailed Quote').limit(1);
    if (r.data && r.data.length > 0) _template = r.data[0];
    _loaded = true;
  } catch(e) { console.error('Template load error:', e); }
}

// Save template
async function saveTemplate(items) {
  var oid = getOwnerId();
  if (!oid) return;
  try {
    if (_template) {
      var r = await supabaseClient.from('quote_templates').update({ items: items, updated_at: new Date().toISOString() }).eq('id', _template.id).select();
      if (r.data && r.data[0]) _template = r.data[0];
    } else {
      var r2 = await supabaseClient.from('quote_templates').insert([{ user_id: oid, template_name: 'Detailed Quote', items: items }]).select();
      if (r2.data && r2.data[0]) _template = r2.data[0];
    }
    showNotification('Template saved with ' + items.length + ' items', 'success');
    // Reset UI so it re-enhances with updated template
    document.querySelectorAll('[data-qt-ready]').forEach(function(el) { delete el.dataset.qtReady; });
  } catch(e) {
    showNotification('Error: ' + e.message, 'error');
  }
}

// Open template editor
window.openQuoteTemplateEditor = function() {
  var items = (_template && _template.items) ? JSON.parse(JSON.stringify(_template.items)) : [];
  if (items.length === 0) items.push({ description: '', rate: 0 });

  var overlay = document.createElement('div');
  overlay.className = 'qt-modal';
  overlay.id = 'qt-template-modal';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  function renderEditor() {
    var h = '<div class="qt-modal-box">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><div class="qt-modal-title">Detailed Quote Template</div><button onclick="document.getElementById(\'qt-template-modal\').remove()" style="background:none;border:none;font-size:24px;color:#94a3b8;cursor:pointer;">&times;</button></div>';
    h += '<div class="qt-modal-sub">Add your standard line items and rates. When you use Detailed Quote, these will pre-fill. Just enter quantities.</div>';

    h += '<div class="qt-hd-row"><div class="qt-hd" style="flex:1">Description</div><div class="qt-hd" style="width:90px">Rate ($)</div><div style="width:28px"></div></div>';

    for (var i = 0; i < items.length; i++) {
      h += '<div class="qt-row">';
      h += '<input class="qt-desc-input" type="text" placeholder="e.g. Ceiling paint - 2 coats" value="' + escH(items[i].description || '') + '" data-idx="' + i + '" data-field="desc">';
      h += '<input class="qt-rate-input" type="number" step="0.01" placeholder="0.00" value="' + (items[i].rate || '') + '" data-idx="' + i + '" data-field="rate">';
      h += '<button class="qt-del" onclick="this.parentElement.remove()">x</button>';
      h += '</div>';
    }

    h += '<button class="qt-add-row" onclick="var row=document.createElement(\'div\');row.className=\'qt-row\';row.innerHTML=\'<input class=qt-desc-input type=text placeholder=Description><input class=qt-rate-input type=number step=0.01 placeholder=0.00><button class=qt-del onclick=this.parentElement.remove()>x</button>\';this.parentElement.insertBefore(row,this);">+ Add Line Item</button>';

    h += '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">';
    h += '<button class="qt-cancel" onclick="document.getElementById(\'qt-template-modal\').remove()">Cancel</button>';
    h += '<button class="qt-save" onclick="saveQuoteTemplate()">Save Template</button>';
    h += '</div></div>';

    overlay.innerHTML = h;
  }

  renderEditor();
  document.body.appendChild(overlay);
};

// Save from editor
window.saveQuoteTemplate = function() {
  var modal = document.getElementById('qt-template-modal');
  if (!modal) return;
  var rows = modal.querySelectorAll('.qt-row');
  var items = [];
  rows.forEach(function(row) {
    var descEl = row.querySelector('.qt-desc-input') || row.querySelector('input[type="text"]');
    var rateEl = row.querySelector('.qt-rate-input') || row.querySelector('input[type="number"]');
    var desc = descEl ? descEl.value.trim() : '';
    var rate = rateEl ? parseFloat(rateEl.value) || 0 : 0;
    if (desc) items.push({ description: desc, rate: rate });
  });
  if (items.length === 0) { showNotification('Add at least one item', 'error'); return; }
  saveTemplate(items);
  modal.remove();
};

// Pre-fill quote form with template items
window.applyQuoteTemplate = function() {
  if (!_template || !_template.items || _template.items.length === 0) return;

  // Wait for form to fully render
  setTimeout(function() {
    // Find the Add Line Item button - this anchors us to the line items section
    var addBtn = null;
    document.querySelectorAll('button').forEach(function(b) {
      var t = b.textContent.trim();
      if (t === '+ Add Line Item' || t === '+ Add Item' || t === 'Add Line Item') addBtn = b;
    });
    if (!addBtn) return;

    // The line items container is the parent of the add button
    var container = addBtn.parentElement;
    if (!container) return;

    // Remove existing line items - find X buttons ONLY in this container
    container.querySelectorAll('button').forEach(function(b) {
      var t = b.textContent.trim();
      if (t === 'x' || t === 'X' || t === '\u00d7') b.click();
    });

    var templateItems = _template.items;

    // Add rows
    for (var i = 0; i < templateItems.length; i++) {
      addBtn.click();
    }

    // Fill after DOM updates
    setTimeout(function() {
      // Find description inputs ONLY in the line items container
      var descInputs = [];
      container.querySelectorAll('input, textarea').forEach(function(inp) {
        var ph = (inp.placeholder || '').toLowerCase();
        if (ph.indexOf('escription') !== -1) descInputs.push(inp);
      });

      for (var j = 0; j < Math.min(templateItems.length, descInputs.length); j++) {
        var item = templateItems[j];
        var descInput = descInputs[j];
        setInputValue(descInput, item.description);

        // Find qty/rate in same line item block
        var block = descInput.parentElement;
        if (block) block = block.parentElement || block;

        var numInputs = [];
        block.querySelectorAll('input').forEach(function(inp) {
          if (inp === descInput) return;
          var ph = (inp.placeholder || '').toLowerCase();
          if (ph.indexOf('escription') !== -1) return;
          numInputs.push(inp);
        });

        if (numInputs.length >= 2) {
          setInputValue(numInputs[0], '');
          setInputValue(numInputs[1], item.rate);
        }
      }
    }, 400);
  }, 800);
};

function setInputValue(input, value) {
  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  nativeInputValueSetter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function escH(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }

// Enhance the Detailed Quote box
function enhanceDetailedBox() {
  // Find the button containing "Detailed Quote" text
  var detailedBox = null;
  document.querySelectorAll('button').forEach(function(btn) {
    if (btn.dataset.qtReady) return;
    var kids = btn.querySelectorAll('div');
    kids.forEach(function(d) {
      if (d.textContent.trim() === 'Detailed Quote' && d.children.length === 0) {
        detailedBox = btn;
      }
    });
  });
  if (!detailedBox) return;
  detailedBox.dataset.qtReady = 'true';

  // Add setup/edit button
  var btnContainer = document.createElement('div');
  btnContainer.style.marginTop = '6px';

  if (_template && _template.items && _template.items.length > 0) {
    // Template exists - show status + edit button
    btnContainer.innerHTML = '<div class="qt-filled"><span class="qt-filled-text">Template ready</span><span class="qt-filled-count">' + _template.items.length + ' items</span></div><button class="qt-edit-btn" onclick="event.stopPropagation();openQuoteTemplateEditor()">Edit Template</button>';

    // Override click to pre-fill
    detailedBox.addEventListener('click', function() {
      setTimeout(applyQuoteTemplate, 500);
    });
  } else {
    // No template - show create button
    btnContainer.innerHTML = '<button class="qt-setup-btn" onclick="event.stopPropagation();openQuoteTemplateEditor()">Setup Template</button>';
  }

  detailedBox.appendChild(btnContainer);
}

// Observer
var _qtTimer = null;
new MutationObserver(function() {
  if (_qtTimer) clearTimeout(_qtTimer);
  _qtTimer = setTimeout(async function() {
    if (!currentUser) return;
    if (!_loaded) await loadTemplate();
    enhanceDetailedBox();
  }, 300);
}).observe(document.body, { childList: true, subtree: true });

console.log('Quote templates loaded');

} catch(e) {
  console.error('Quote template error:', e);
}
})();
