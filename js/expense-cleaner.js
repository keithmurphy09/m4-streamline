// M4 Expense Description Cleaner
// Strips duplicate [Related to:...] tags from display
// Also cleans database on first load
// Additive only
(function(){
try {

var _dbCleaned = false;

// Strip all [Related to:...] tags from a string
function cleanDesc(str) {
  if (!str) return '';
  return str.replace(/\s*\[Related to:[^\]]*\]/g, '').trim();
}

// ============ CLEAN DATABASE (once) ============
async function cleanDatabase() {
  if (_dbCleaned) return;
  _dbCleaned = true;

  var dirty = expenses.filter(function(e) {
    if (!e.description) return false;
    var matches = e.description.match(/\[Related to:/g);
    return matches && matches.length > 1;
  });

  if (dirty.length === 0) return;
  console.log('Cleaning ' + dirty.length + ' expense descriptions...');

  for (var i = 0; i < dirty.length; i++) {
    var exp = dirty[i];
    // Keep only the first [Related to:...] tag
    var firstTag = exp.description.match(/\[Related to:[^\]]*\]/);
    var cleaned = exp.description.replace(/\s*\[Related to:[^\]]*\]/g, '').trim();
    if (firstTag) cleaned = cleaned + ' ' + firstTag[0];

    try {
      await supabaseClient
        .from('expenses')
        .update({ description: cleaned })
        .eq('id', exp.id);
      exp.description = cleaned;
    } catch (err) {
      console.error('Error cleaning expense:', err);
    }
  }
  console.log('Expense descriptions cleaned');
}

// ============ CLEAN DOM DISPLAY ============
function cleanDisplayDescriptions() {
  // Desktop table
  var cells = document.querySelectorAll('.expenses-desktop-table td');
  cells.forEach(function(td) {
    var text = td.textContent || '';
    if (text.indexOf('[Related to:') === -1) return;
    // Only process description cells (they have text + possibly a receipt link)
    var link = td.querySelector('a');
    var raw = '';
    td.childNodes.forEach(function(n) {
      if (n.nodeType === 3) raw += n.textContent;
    });
    if (raw.indexOf('[Related to:') !== -1) {
      var cleaned = cleanDesc(raw);
      td.childNodes.forEach(function(n) {
        if (n.nodeType === 3 && n.textContent.indexOf('[Related to:') !== -1) {
          n.textContent = cleaned;
        }
      });
    }
  });

  // Mobile cards
  var descs = document.querySelectorAll('.expense-card-description');
  descs.forEach(function(el) {
    if (el.textContent.indexOf('[Related to:') !== -1) {
      el.textContent = cleanDesc(el.textContent);
    }
  });
}

// ============ OBSERVER ============
var _cleanTimer = null;
var _cleanObs = new MutationObserver(function() {
  if (_cleanTimer) clearTimeout(_cleanTimer);
  _cleanTimer = setTimeout(function() {
    if (typeof activeTab !== 'undefined' && activeTab === 'expenses') {
      cleanDisplayDescriptions();
      cleanDatabase();
    }
  }, 300);
});
_cleanObs.observe(document.body, { childList: true, subtree: true });

console.log('Expense description cleaner loaded');

} catch(e) {
  console.error('Expense cleaner error:', e);
}
})();
