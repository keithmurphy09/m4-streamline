// M4 Quote Templates v2 - Clean rewrite
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = '.qt-edit{padding:3px 10px;font-size:10px;font-weight:600;background:transparent;color:#0d9488;border:1px solid #0d9488;border-radius:5px;cursor:pointer;font-family:inherit;margin-top:4px;display:inline-block}.qt-edit:hover{background:#0d9488;color:#fff}.qt-badge{font-size:10px;color:#0d9488;font-weight:600;margin-top:4px;display:block}.qt-apply{padding:8px 16px;font-size:12px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;margin-left:8px}.qt-apply:hover{background:#0f766e}.qt-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center}.qt-box{background:#fff;border-radius:16px;padding:28px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto}.dark .qt-box{background:#1f2937}.qt-row{display:flex;gap:8px;margin-bottom:8px}.qt-row input{padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit}.dark .qt-row input{background:#374151;border-color:#4b5563;color:#fff}';
document.head.appendChild(css);

var _tpl = null;
var _loaded = false;

function oid() {
  return (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : (currentUser ? currentUser.id : null);
}

function escH(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }

// Load
async function load() {
  if (_loaded) return;
  try {
    var r = await supabaseClient.from('quote_templates').select('*').eq('user_id', oid()).eq('template_name', 'Detailed Quote').limit(1);
    if (r.data && r.data.length > 0) _tpl = r.data[0];
    _loaded = true;
  } catch(e) {}
}

// Save
async function save(items) {
  try {
    if (_tpl) {
      var r = await supabaseClient.from('quote_templates').update({ items: items, updated_at: new Date().toISOString() }).eq('id', _tpl.id).select();
      if (r.data && r.data[0]) _tpl = r.data[0];
    } else {
      var r2 = await supabaseClient.from('quote_templates').insert([{ user_id: oid(), template_name: 'Detailed Quote', items: items }]).select();
      if (r2.data && r2.data[0]) _tpl = r2.data[0];
    }
    showNotification('Template saved - ' + items.length + ' items', 'success');
    // Reset so UI re-enhances
    document.querySelectorAll('[data-qt]').forEach(function(el) { delete el.dataset.qt; });
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
}

// Editor modal
window.openQTEditor = function() {
  var items = (_tpl && _tpl.items) ? JSON.parse(JSON.stringify(_tpl.items)) : [{ description: '', rate: 0 }];
  var el = document.createElement('div');
  el.className = 'qt-modal';
  el.id = 'qt-editor';
  el.onclick = function(e) { if (e.target === el) el.remove(); };

  function render() {
    var h = '<div class="qt-box">';
    h += '<div style="display:flex;justify-content:space-between;margin-bottom:16px"><div style="font-size:18px;font-weight:700">Detailed Quote Template</div><button onclick="document.getElementById(\'qt-editor\').remove()" style="background:none;border:none;font-size:22px;color:#94a3b8;cursor:pointer">&times;</button></div>';
    h += '<div style="font-size:12px;color:#64748b;margin-bottom:16px">Add your standard line items and rates. Users just enter quantities when quoting.</div>';
    h += '<div style="display:flex;gap:8px;margin-bottom:8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px"><div style="flex:1;font-size:11px;font-weight:700;color:#64748b">DESCRIPTION</div><div style="width:80px;font-size:11px;font-weight:700;color:#64748b">RATE ($)</div><div style="width:28px"></div></div>';
    h += '<div id="qt-items">';
    for (var i = 0; i < items.length; i++) {
      h += '<div class="qt-row"><input style="flex:1" type="text" placeholder="e.g. Ceiling paint - 2 coats" value="' + escH(items[i].description) + '"><input style="width:80px" type="number" step="0.01" value="' + (items[i].rate || '') + '"><button onclick="this.parentElement.remove()" style="width:28px;height:28px;border:none;background:#fee2e2;color:#ef4444;border-radius:6px;cursor:pointer;font-weight:700">x</button></div>';
    }
    h += '</div>';
    h += '<button onclick="var c=document.getElementById(\'qt-items\');var r=document.createElement(\'div\');r.className=\'qt-row\';r.innerHTML=\'<input style=flex:1 type=text placeholder=Description><input style=width:80px type=number step=0.01 placeholder=0.00><button onclick=this.parentElement.remove() style=width:28px;height:28px;border:none;background:#fee2e2;color:#ef4444;border-radius:6px;cursor:pointer;font-weight:700>x</button>\';c.appendChild(r)" style="width:100%;padding:8px;font-size:12px;font-weight:600;background:#f0fdfa;color:#0d9488;border:1px dashed #0d9488;border-radius:8px;cursor:pointer;margin:12px 0;font-family:inherit">+ Add Line Item</button>';
    h += '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px"><button onclick="document.getElementById(\'qt-editor\').remove()" style="padding:8px 20px;font-size:13px;background:#fff;color:#64748b;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;font-family:inherit">Cancel</button><button onclick="saveQTFromEditor()" style="padding:8px 20px;font-size:13px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit">Save Template</button></div>';
    h += '</div>';
    el.innerHTML = h;
  }
  render();
  document.body.appendChild(el);
};

window.saveQTFromEditor = function() {
  var rows = document.querySelectorAll('#qt-items .qt-row');
  var items = [];
  rows.forEach(function(r) {
    var inputs = r.querySelectorAll('input');
    var desc = inputs[0] ? inputs[0].value.trim() : '';
    var rate = inputs[1] ? parseFloat(inputs[1].value) || 0 : 0;
    if (desc) items.push({ description: desc, rate: rate });
  });
  if (items.length === 0) { showNotification('Add at least one item', 'error'); return; }
  save(items);
  document.getElementById('qt-editor').remove();
};

// Set input value (works with React-style forms)
function setVal(input, value) {
  var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

// Apply template to the quote form
window.applyQT = function() {
  if (!_tpl || !_tpl.items || _tpl.items.length === 0) { showNotification('No template saved', 'error'); return; }

  // Find + Add Line Item button
  var addBtn = null;
  document.querySelectorAll('button').forEach(function(b) {
    if (b.textContent.trim().indexOf('Add Line Item') !== -1 || b.textContent.trim().indexOf('Add Item') !== -1) addBtn = b;
  });
  if (!addBtn) { showNotification('Open a quote form first', 'error'); return; }

  var container = addBtn.parentElement;
  var items = _tpl.items;

  // Step 1: Delete existing rows
  var xBtns = [];
  container.querySelectorAll('button').forEach(function(b) {
    if (b.textContent.trim() === 'x' || b.textContent.trim() === 'X') xBtns.push(b);
  });
  xBtns.forEach(function(b) { b.click(); });

  // Step 2: Add rows (after small delay for deletions to process)
  setTimeout(function() {
    for (var i = 0; i < items.length; i++) addBtn.click();

    // Step 3: Fill values (after rows are added)
    setTimeout(function() {
      var descInputs = [];
      container.querySelectorAll('input, textarea').forEach(function(inp) {
        if ((inp.placeholder || '').indexOf('escription') !== -1) descInputs.push(inp);
      });

      for (var j = 0; j < Math.min(items.length, descInputs.length); j++) {
        var desc = descInputs[j];
        setVal(desc, items[j].description);

        // Walk up to line item wrapper to find qty + rate
        var wrapper = desc.parentElement;
        while (wrapper && wrapper !== container && wrapper.querySelectorAll('input').length < 3) {
          wrapper = wrapper.parentElement;
        }
        if (!wrapper || wrapper === container) continue;

        var others = [];
        wrapper.querySelectorAll('input').forEach(function(inp) {
          if (inp !== desc && (inp.placeholder || '').indexOf('escription') === -1) others.push(inp);
        });
        // others[0]=qty, others[1]=rate
        if (others[0]) setVal(others[0], '');
        if (others[1]) setVal(others[1], items[j].rate);
      }

      showNotification('Template applied - enter quantities', 'success');
    }, 300);
  }, 200);
};

// Enhance UI
function enhance() {
  // 1. Badge on Detailed Quote card
  document.querySelectorAll('button').forEach(function(btn) {
    if (btn.dataset.qt) return;
    var kids = btn.querySelectorAll('div');
    var match = false;
    kids.forEach(function(d) { if (d.textContent.trim() === 'Detailed Quote' && d.children.length === 0) match = true; });
    if (!match) return;
    btn.dataset.qt = '1';
    if (_tpl && _tpl.items && _tpl.items.length > 0) {
      var badge = document.createElement('div');
      badge.innerHTML = '<span class="qt-badge">' + _tpl.items.length + ' saved items</span><button class="qt-edit" onclick="event.stopPropagation();openQTEditor()">Edit Template</button>';
      btn.appendChild(badge);
    } else {
      var setup = document.createElement('button');
      setup.className = 'qt-edit';
      setup.textContent = 'Setup Template';
      setup.style.marginTop = '6px';
      setup.onclick = function(e) { e.stopPropagation(); openQTEditor(); };
      btn.appendChild(setup);
    }
  });

  // 2. Apply button near Add Line Item
  document.querySelectorAll('button').forEach(function(b) {
    if (b.dataset.qtApply) return;
    if (b.textContent.trim().indexOf('Add Line Item') === -1 && b.textContent.trim().indexOf('Add Item') === -1) return;
    if (!_tpl || !_tpl.items || _tpl.items.length === 0) return;
    b.dataset.qtApply = '1';
    var applyBtn = document.createElement('button');
    applyBtn.className = 'qt-apply';
    applyBtn.textContent = 'Fill from Template';
    applyBtn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); applyQT(); };
    b.parentElement.insertBefore(applyBtn, b.nextSibling);
  });
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(async function() {
    if (!currentUser) return;
    if (!_loaded) await load();
    enhance();
  }, 300);
}).observe(document.body, { childList: true, subtree: true });

} catch(e) { console.error('QT error:', e); }
})();
