// M4 Users Table Cleanup
// Hides Actions column from original All Users table
// Additive only
(function(){
try {

function hideActions() {
  // Find the original "All Users" table (class w-full, NOT ac-table or pc-table)
  document.querySelectorAll('table.w-full').forEach(function(tbl) {
    if (tbl.id === 'ac-table' || tbl.id === 'pc-table') return;
    if (tbl.className.indexOf('ac-table') !== -1 || tbl.className.indexOf('pc-table') !== -1) return;
    if (tbl.dataset.cleaned) return;

    var ths = tbl.querySelectorAll('th');
    var actionsIdx = -1;
    ths.forEach(function(th, i) {
      if (th.textContent.trim() === 'Actions') actionsIdx = i;
    });

    if (actionsIdx === -1) return;
    tbl.dataset.cleaned = '1';

    // Hide the Actions header
    ths[actionsIdx].style.display = 'none';

    // Hide Actions cell in every row
    tbl.querySelectorAll('tr').forEach(function(row) {
      var cells = row.querySelectorAll('td, th');
      if (cells[actionsIdx]) cells[actionsIdx].style.display = 'none';
    });

    // Fix any select dropdowns with double arrows in this table
    tbl.querySelectorAll('select').forEach(function(sel) {
      sel.style.webkitAppearance = 'menulist';
      sel.style.appearance = 'menulist';
      sel.style.backgroundImage = 'none';
    });
  });
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(hideActions, 500);
}).observe(document.body, { childList: true, subtree: true });

console.log('Users table cleanup loaded');

} catch(e) {
  console.error('Users table cleanup error:', e);
}
})();
