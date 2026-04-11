// M4 Quote Templates v3
// Additive only
(function(){
try {

var s = document.createElement('style');
s.textContent = '.qt-e{padding:3px 10px;font-size:10px;font-weight:600;background:transparent;color:#0d9488;border:1px solid #0d9488;border-radius:5px;cursor:pointer;font-family:inherit;display:inline-block}.qt-e:hover{background:#0d9488;color:#fff}.qt-b{font-size:10px;color:#0d9488;font-weight:600}.qt-f{padding:8px 16px;font-size:12px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;margin-left:8px}.qt-f:hover{background:#0f766e}.qt-m{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center}.qt-bx{background:#fff;border-radius:16px;padding:28px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto}.dark .qt-bx{background:#1f2937}.qt-r{display:flex;gap:8px;margin-bottom:8px}.qt-r input{padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit}.dark .qt-r input{background:#374151;border-color:#4b5563;color:#fff}';
document.head.appendChild(s);

var _tpl = null;
var _loaded = false;

function oid() { return (typeof accountOwnerId !== 'undefined' && accountOwnerId) ? accountOwnerId : (currentUser ? currentUser.id : null); }
function esc(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }

async function load() {
  if (_loaded) return;
  try {
    var r = await supabaseClient.from('quote_templates').select('*').eq('user_id', oid()).eq('template_name', 'Detailed Quote').limit(1);
    if (r.data && r.data.length > 0) _tpl = r.data[0];
    _loaded = true;
  } catch(e) {}
}

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
  } catch(e) { showNotification('Error: ' + e.message, 'error'); }
}

// Editor
window.openQTEditor = function() {
  if (document.getElementById('qt-ed')) return;
  var items = (_tpl && _tpl.items) ? JSON.parse(JSON.stringify(_tpl.items)) : [{ description: '', rate: 0 }];
  var el = document.createElement('div');
  el.className = 'qt-m';
  el.id = 'qt-ed';
  el.onclick = function(e) { if (e.target === el) el.remove(); };

  var h = '<div class="qt-bx">';
  h += '<div style="display:flex;justify-content:space-between;margin-bottom:16px"><div style="font-size:18px;font-weight:700">Detailed Quote Template</div><button onclick="document.getElementById(\'qt-ed\').remove()" style="background:none;border:none;font-size:22px;color:#94a3b8;cursor:pointer">&times;</button></div>';
  h += '<div style="font-size:12px;color:#64748b;margin-bottom:16px">Add standard line items with rates. Quantities are entered when quoting.</div>';
  h += '<div style="display:flex;gap:8px;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0"><div style="flex:1;font-size:11px;font-weight:700;color:#64748b">DESCRIPTION</div><div style="width:80px;font-size:11px;font-weight:700;color:#64748b">RATE ($)</div><div style="width:28px"></div></div>';
  h += '<div id="qt-rows">';
  for (var i = 0; i < items.length; i++) {
    h += '<div class="qt-r"><input style="flex:1" value="' + esc(items[i].description) + '" placeholder="e.g. Ceiling paint"><input style="width:80px" type="number" step="0.01" value="' + (items[i].rate || '') + '" placeholder="0.00"><button onclick="this.parentElement.remove()" style="width:28px;height:28px;border:none;background:#fee2e2;color:#ef4444;border-radius:6px;cursor:pointer;font-weight:700">x</button></div>';
  }
  h += '</div>';
  h += '<button onclick="var c=document.getElementById(\'qt-rows\');var d=document.createElement(\'div\');d.className=\'qt-r\';d.innerHTML=\'<input style=flex:1 placeholder=Description><input style=width:80px type=number step=0.01 placeholder=0.00><button onclick=this.parentElement.remove() style=width:28px;height:28px;border:none;background:#fee2e2;color:#ef4444;border-radius:6px;cursor:pointer;font-weight:700>x</button>\';c.appendChild(d)" style="width:100%;padding:8px;font-size:12px;font-weight:600;background:#f0fdfa;color:#0d9488;border:1px dashed #0d9488;border-radius:8px;cursor:pointer;margin:12px 0">+ Add Line Item</button>';
  h += '<div style="display:flex;justify-content:flex-end;gap:8px"><button onclick="document.getElementById(\'qt-ed\').remove()" style="padding:8px 20px;font-size:13px;background:#fff;color:#64748b;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer">Cancel</button><button onclick="saveQT()" style="padding:8px 20px;font-size:13px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:8px;cursor:pointer">Save Template</button></div>';
  h += '</div>';
  el.innerHTML = h;
  document.body.appendChild(el);
};

window.saveQT = function() {
  var items = [];
  document.querySelectorAll('#qt-rows .qt-r').forEach(function(r) {
    var inp = r.querySelectorAll('input');
    var d = inp[0] ? inp[0].value.trim() : '';
    var p = inp[1] ? parseFloat(inp[1].value) || 0 : 0;
    if (d) items.push({ description: d, rate: p });
  });
  if (!items.length) { showNotification('Add at least one item', 'error'); return; }
  save(items);
  var ed = document.getElementById('qt-ed');
  if (ed) ed.remove();
};

// Set value on React-controlled input
function sv(el, val) {
  var proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  setter.call(el, val);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

// Apply template
window.applyQT = function() {
  console.log('QT: applyQT called, _tpl:', _tpl ? _tpl.items.length + ' items' : 'null');
  if (!_tpl || !_tpl.items || !_tpl.items.length) { showNotification('No template saved', 'error'); return; }

  // Find + Add Item button
  var addBtn = null;
  document.querySelectorAll('button').forEach(function(b) {
    if (b.textContent.trim().indexOf('Add') !== -1 && b.textContent.trim().indexOf('Item') !== -1) {
      if (!addBtn) addBtn = b;
    }
  });
  if (!addBtn) return;

  var items = _tpl.items;

  // Delete existing rows
  var parent = addBtn.parentElement;
  var xBtns = [];
  parent.querySelectorAll('button').forEach(function(b) {
    if (b.textContent.trim() === 'x' || b.textContent.trim() === 'X') xBtns.push(b);
  });
  for (var d = xBtns.length - 1; d >= 0; d--) xBtns[d].click();

  // Add rows after delete settles
  setTimeout(function() {
    for (var i = 0; i < items.length; i++) addBtn.click();

    // Fill after rows render
    setTimeout(function() {
      // Collect all line item blocks - each has a description input
      var descInputs = [];
      parent.querySelectorAll('input, textarea').forEach(function(inp) {
        if ((inp.placeholder || '').indexOf('escription') !== -1) descInputs.push(inp);
      });

      console.log('QT: found ' + descInputs.length + ' description inputs for ' + items.length + ' items');

      for (var j = 0; j < Math.min(items.length, descInputs.length); j++) {
        // Set description
        sv(descInputs[j], items[j].description);

        // Find the line item card - go up until we find a div with border
        var card = descInputs[j].parentElement;
        while (card && card !== parent) {
          var cs = window.getComputedStyle(card);
          if (cs.borderWidth && parseFloat(cs.borderWidth) > 0) break;
          card = card.parentElement;
        }
        if (!card || card === parent) card = descInputs[j].parentElement.parentElement;

        // Get ALL inputs in this card except the description
        var allInCard = card.querySelectorAll('input');
        var numInputs = [];
        for (var k = 0; k < allInCard.length; k++) {
          if (allInCard[k] === descInputs[j]) continue;
          if ((allInCard[k].placeholder || '').indexOf('escription') !== -1) continue;
          numInputs.push(allInCard[k]);
        }

        console.log('QT row ' + j + ': ' + items[j].description + ' -> ' + numInputs.length + ' number inputs');

        // numInputs[0] = qty, numInputs[1] = price
        if (numInputs.length >= 2) {
          sv(numInputs[0], '');
          sv(numInputs[1], items[j].rate);
        } else if (numInputs.length === 1) {
          sv(numInputs[0], items[j].rate);
        }
      }

      showNotification('Template applied - enter quantities', 'success');
    }, 500);
  }, 300);
};

// UI Enhancement - runs on DOM changes
function enhance() {
  if (!_loaded) return;

  // 1. Detailed Quote card badge (ONE only)
  document.querySelectorAll('button').forEach(function(btn) {
    // Skip if already tagged
    if (btn.querySelector('.qt-tag')) return;

    var found = false;
    btn.querySelectorAll('div').forEach(function(d) {
      if (d.textContent.trim() === 'Detailed Quote' && d.children.length === 0) found = true;
    });
    if (!found) return;

    var tag = document.createElement('div');
    tag.className = 'qt-tag';
    tag.style.marginTop = '6px';

    if (_tpl && _tpl.items && _tpl.items.length > 0) {
      tag.innerHTML = '<span class="qt-b">' + _tpl.items.length + ' saved items</span> <button class="qt-e" onclick="event.stopPropagation();openQTEditor()">Edit</button>';
    } else {
      tag.innerHTML = '<button class="qt-e" onclick="event.stopPropagation();openQTEditor()">Setup Template</button>';
    }
    btn.appendChild(tag);
  });

  // 2. Fill button (ONE only)
  if (!_tpl || !_tpl.items || !_tpl.items.length) return;
  document.querySelectorAll('button').forEach(function(b) {
    if (b.textContent.trim().indexOf('Add') === -1 || b.textContent.trim().indexOf('Item') === -1) return;
    if (b.nextElementSibling && b.nextElementSibling.classList.contains('qt-f')) return;
    var fb = document.createElement('button');
    fb.className = 'qt-f';
    fb.textContent = 'Fill from Template';
    fb.type = 'button';
    fb.setAttribute('onclick', 'window.applyQT();return false;');
    b.insertAdjacentElement('afterend', fb);
    console.log('QT: Fill button injected');
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
