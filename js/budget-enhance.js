// M4 Budget Enhancement
// Adds donut chart, category icons, spending velocity, visual polish
// Additive only
(function(){
try {

// ============ CSS ============
var css = document.createElement('style');
css.textContent = [
'.bgt-top{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}',
'@media(max-width:768px){.bgt-top{grid-template-columns:1fr}}',
'.bgt-donut-wrap{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;display:flex;align-items:center;gap:24px}',
'.dark .bgt-donut-wrap{background:#1f2937;border-color:#374151}',
'.bgt-donut-svg{width:140px;height:140px;flex-shrink:0}',
'.bgt-donut-center{font-family:Outfit,sans-serif;font-size:24px;font-weight:800}',
'.bgt-donut-legend{flex:1}',
'.bgt-donut-legend-item{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px}',
'.bgt-donut-legend-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}',
'',
'.bgt-velocity{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;display:flex;flex-direction:column;justify-content:center}',
'.dark .bgt-velocity{background:#1f2937;border-color:#374151}',
'.bgt-velocity-title{font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px}',
'.dark .bgt-velocity-title{color:#9ca3af}',
'.bgt-velocity-val{font-family:Outfit,sans-serif;font-size:28px;font-weight:800;color:#0f172a}',
'.dark .bgt-velocity-val{color:#e2e8f0}',
'.bgt-velocity-sub{font-size:13px;color:#64748b;margin-top:4px;line-height:1.5}',
'.dark .bgt-velocity-sub{color:#9ca3af}',
'.bgt-velocity-forecast{margin-top:16px;padding:12px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0}',
'.dark .bgt-velocity-forecast{background:#111827;border-color:#374151}',
'.bgt-velocity-forecast-label{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.03em}',
'.bgt-velocity-forecast-val{font-size:18px;font-weight:700;margin-top:2px}',
'',
'.bgt-cat-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px}',
'.bgt-cat-bar-bg{height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-top:8px}',
'.dark .bgt-cat-bar-bg{background:#374151}',
'.bgt-cat-bar-fill{height:100%;border-radius:4px;transition:width 0.5s ease}',
'.bgt-cat-change{font-size:11px;font-weight:600;display:flex;align-items:center;gap:2px}',
'.bgt-cat-change.up{color:#ef4444}',
'.bgt-cat-change.down{color:#10b981}',
'.bgt-cat-change.same{color:#94a3b8}'
].join('\n');
document.head.appendChild(css);

// ============ CATEGORY ICONS & COLORS ============
var CAT_META = {
  'Labour':       { icon: '&#128119;', color: '#3b82f6', bg: '#dbeafe' },
  'Materials':    { icon: '&#128295;', color: '#f97316', bg: '#ffedd5' },
  'Fuel':         { icon: '&#9981;',   color: '#ef4444', bg: '#fee2e2' },
  'Equipment':    { icon: '&#128736;', color: '#8b5cf6', bg: '#ede9fe' },
  'Marketing':    { icon: '&#128227;', color: '#ec4899', bg: '#fce7f3' },
  'Insurance':    { icon: '&#128737;', color: '#06b6d4', bg: '#cffafe' },
  'Subcontractors':{ icon: '&#129489;', color: '#14b8a6', bg: '#ccfbf1' },
  'Office Supplies':{ icon: '&#128203;', color: '#6366f1', bg: '#e0e7ff' },
  'Other':        { icon: '&#128178;', color: '#64748b', bg: '#f1f5f9' }
};

function getCatMeta(cat) {
  return CAT_META[cat] || CAT_META['Other'];
}

// ============ HELPERS ============
function escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============ ENHANCE BUDGET PAGE ============
function enhanceBudget() {
  if (typeof activeTab !== 'undefined' && activeTab !== 'budget') return;

  var header = document.querySelector('h2.text-2xl');
  if (!header || header.textContent.trim() !== 'Budget Tracker') return;

  var container = header.closest('.space-y-6');
  if (!container || container.dataset.bgtEnhanced) return;
  container.dataset.bgtEnhanced = 'true';

  var now = new Date();
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  var monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  var prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  var prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  var dayOfMonth = now.getDate();
  var daysInMonth = monthEnd.getDate();

  // This month's expenses
  var monthExpenses = expenses.filter(function(e) {
    var d = new Date(e.date);
    return d >= monthStart && d <= monthEnd;
  });

  // Previous month's expenses
  var prevExpenses = expenses.filter(function(e) {
    var d = new Date(e.date);
    return d >= prevMonthStart && d <= prevMonthEnd;
  });

  var catSpending = {};
  var prevCatSpending = {};
  monthExpenses.forEach(function(e) { var c = e.category || 'Other'; catSpending[c] = (catSpending[c] || 0) + parseFloat(e.amount || 0); });
  prevExpenses.forEach(function(e) { var c = e.category || 'Other'; prevCatSpending[c] = (prevCatSpending[c] || 0) + parseFloat(e.amount || 0); });

  var budgets = (typeof budgetSettings !== 'undefined' && budgetSettings.monthly_budgets) ? budgetSettings.monthly_budgets : {};
  var totalBudget = 0;
  var totalSpent = 0;
  for (var k in budgets) totalBudget += budgets[k];
  for (var k2 in catSpending) totalSpent += catSpending[k2];
  var remaining = Math.max(0, totalBudget - totalSpent);

  // Spending velocity
  var dailyRate = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;
  var projectedTotal = dailyRate * daysInMonth;
  var daysLeft = daysInMonth - dayOfMonth;

  // ============ BUILD BUDGET VS SPENT BARS ============
  var cats = Object.keys(budgets);
  var barsH = '';
  for (var i = 0; i < cats.length; i++) {
    var cat = cats[i];
    var budget = budgets[cat] || 0;
    var spent = catSpending[cat] || 0;
    if (budget === 0 && spent === 0) continue;
    var pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 100;
    var isOver = spent > budget;
    var meta = getCatMeta(cat);
    var barColor = isOver ? '#ef4444' : meta.color;

    barsH += '<div style="margin-bottom:12px;">';
    barsH += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
    barsH += '<span style="font-size:13px;font-weight:600;color:#374151;" class="dark:text-gray-300">' + escH(cat) + '</span>';
    barsH += '<span style="font-size:12px;color:' + (isOver ? '#ef4444' : '#64748b') + ';font-weight:' + (isOver ? '700' : '500') + ';">$' + spent.toFixed(0) + ' / $' + budget.toFixed(0) + '</span>';
    barsH += '</div>';
    barsH += '<div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;" class="dark:bg-gray-700">';
    barsH += '<div style="height:100%;width:' + pct.toFixed(1) + '%;background:' + barColor + ';border-radius:4px;transition:width 0.5s ease;"></div>';
    barsH += '</div>';
    barsH += '</div>';
  }

  // Overall percentage ring (simple)
  var overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  var ringColor = overallPct > 100 ? '#ef4444' : overallPct > 80 ? '#f97316' : '#0d9488';

  var overviewH = '<div class="bgt-donut-wrap">';
  overviewH += '<div style="text-align:center;flex-shrink:0;">';
  overviewH += buildDonutSVG([{label:"Spent",value:totalSpent,color:ringColor},{label:"Remaining",value:remaining,color:"#e2e8f0"}], overallPct);
  overviewH += '</div>';
  overviewH += '<div style="flex:1;min-width:0;">' + barsH + '</div>';
  overviewH += '</div>';

  // ============ BUILD VELOCITY CARD ============
  var forecastColor = projectedTotal > totalBudget ? '#ef4444' : '#10b981';
  var forecastText = projectedTotal > totalBudget ? 'On track to EXCEED budget' : 'On track to stay under budget';

  var velocityH = '<div class="bgt-velocity">';
  velocityH += '<div class="bgt-velocity-title">Daily Spending Rate</div>';
  velocityH += '<div class="bgt-velocity-val">$' + dailyRate.toFixed(2) + '<span style="font-size:14px;font-weight:500;color:#94a3b8;"> / day</span></div>';
  velocityH += '<div class="bgt-velocity-sub">' + daysLeft + ' days remaining this month</div>';
  velocityH += '<div class="bgt-velocity-forecast">';
  velocityH += '<div class="bgt-velocity-forecast-label">Projected Month Total</div>';
  velocityH += '<div class="bgt-velocity-forecast-val" style="color:' + forecastColor + ';">$' + projectedTotal.toFixed(2) + '</div>';
  velocityH += '<div style="font-size:11px;color:' + forecastColor + ';margin-top:2px;">' + forecastText + '</div>';
  velocityH += '</div></div>';

  // ============ INSERT AFTER PERIOD CARD ============
  var periodCard = container.querySelector('.bg-gradient-to-r');
  if (!periodCard) return;

  var topRow = document.createElement('div');
  topRow.className = 'bgt-top';
  topRow.innerHTML = overviewH + velocityH;

  periodCard.parentElement.insertBefore(topRow, periodCard.nextSibling);

  // ============ ENHANCE CATEGORY CARDS ============
  var catCards = container.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2 > div');
  catCards.forEach(function(card) {
    if (card.dataset.bgtCatDone) return;
    card.dataset.bgtCatDone = 'true';

    var titleEl = card.querySelector('.text-lg.font-semibold');
    if (!titleEl) return;
    var catName = titleEl.textContent.trim();
    var meta = getCatMeta(catName);

    // Skip icon injection - keep it clean

    // Add month-over-month change
    var spent = catSpending[catName] || 0;
    var prevSpent = prevCatSpending[catName] || 0;
    var changeEl = card.querySelector('.bgt-cat-change');
    if (!changeEl && prevSpent > 0) {
      var changePct = ((spent - prevSpent) / prevSpent * 100).toFixed(0);
      var changeDir = spent > prevSpent ? 'up' : (spent < prevSpent ? 'down' : 'same');
      var arrow = changeDir === 'up' ? '&#9650;' : (changeDir === 'down' ? '&#9660;' : '&#8212;');
      var changeSpan = document.createElement('span');
      changeSpan.className = 'bgt-cat-change ' + changeDir;
      changeSpan.innerHTML = arrow + ' ' + Math.abs(changePct) + '% vs last month';
      changeSpan.style.marginTop = '6px';
      changeSpan.style.display = 'block';

      // Find progress bar and add after it
      var progressBar = card.querySelector('.bg-gray-200, .dark\\:bg-gray-700');
      if (progressBar) {
        progressBar.parentElement.insertBefore(changeSpan, progressBar.nextSibling);
      }
    }

    // Color the progress bar fill
    var fill = card.querySelector('.rounded-full.transition-all');
    if (fill && !fill.dataset.bgtColored) {
      fill.dataset.bgtColored = 'true';
      var budget = budgets[catName] || 0;
      var pct = budget > 0 ? (spent / budget) * 100 : 0;
      if (pct <= 80) fill.style.background = 'linear-gradient(90deg,' + meta.color + ',' + meta.color + 'aa)';
    }
  });
}

// ============ BUILD DONUT SVG ============
function buildDonutSVG(data, centerPct) {
  var size = 140;
  var cx = size / 2;
  var cy = size / 2;
  var r = 52;
  var strokeW = 20;
  var total = 0;
  for (var i = 0; i < data.length; i++) total += data[i].value;
  if (total === 0) return '<svg width="' + size + '" height="' + size + '"></svg>';

  var circumference = 2 * Math.PI * r;
  var offset = 0;
  var paths = '';

  for (var j = 0; j < data.length; j++) {
    var pct = data[j].value / total;
    var dashLen = pct * circumference;
    var dashGap = circumference - dashLen;
    var rotation = (offset / total) * 360 - 90;

    paths += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + data[j].color + '" stroke-width="' + strokeW + '" stroke-dasharray="' + dashLen.toFixed(2) + ' ' + dashGap.toFixed(2) + '" transform="rotate(' + rotation.toFixed(2) + ' ' + cx + ' ' + cy + ')" />';
    offset += data[j].value;
  }

  // Center text
  var centerColor = centerPct > 100 ? '#ef4444' : '#0f172a';
  paths += '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" font-size="22" font-weight="800" fill="' + centerColor + '" font-family="Outfit,sans-serif" class="dark:fill-white">' + centerPct + '%</text>';
  paths += '<text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="sans-serif">used</text>';

  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' + paths + '</svg>';
}

// ============ OBSERVER ============
var _bgtTimer = null;
var _bgtObs = new MutationObserver(function() {
  if (_bgtTimer) clearTimeout(_bgtTimer);
  _bgtTimer = setTimeout(enhanceBudget, 250);
});
_bgtObs.observe(document.body, { childList: true, subtree: true });

console.log('Budget enhancement loaded');

} catch(e) {
  console.error('Budget enhance error:', e);
}
})();
