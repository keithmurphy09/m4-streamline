// M4 Dashboard Mobile Layout
// Stacks greeting and date/weather vertically on mobile
// Additive only
(function(){
try {

function fixDashLayout() {
  if (window.innerWidth > 768) return;
  if (typeof activeTab !== 'undefined' && activeTab !== 'dashboard') return;

  var headerRow = document.querySelector('.flex.justify-between.items-start');
  if (!headerRow) return;
  if (headerRow.dataset.dashFixed) return;

  var h1 = headerRow.querySelector('h1');
  if (!h1) return;

  headerRow.dataset.dashFixed = '1';

  // Stack vertically
  headerRow.style.setProperty('flex-direction', 'column', 'important');
  headerRow.style.setProperty('align-items', 'stretch', 'important');
  headerRow.style.setProperty('gap', '6px', 'important');

  // Greeting smaller
  if (h1) {
    h1.style.setProperty('font-size', '22px', 'important');
    h1.style.setProperty('line-height', '1.2', 'important');
  }

  // Date section - inline, smaller
  var dateDiv = headerRow.querySelector('.text-right');
  if (dateDiv) {
    dateDiv.style.setProperty('text-align', 'left', 'important');
    dateDiv.style.setProperty('display', 'flex', 'important');
    dateDiv.style.setProperty('align-items', 'center', 'important');
    dateDiv.style.setProperty('gap', '6px', 'important');
    dateDiv.style.setProperty('flex-wrap', 'wrap', 'important');

    // Make date text smaller
    var dateTexts = dateDiv.querySelectorAll('div');
    dateTexts.forEach(function(dt) {
      dt.style.setProperty('font-size', '12px', 'important');
      dt.style.setProperty('display', 'inline', 'important');
    });
  }

  // Weather widget - all 5 days in one row, no scroll
  var weather = headerRow.querySelector('.dash-weather');
  if (weather) {
    weather.style.setProperty('display', 'flex', 'important');
    weather.style.setProperty('flex-wrap', 'nowrap', 'important');
    weather.style.setProperty('gap', '4px', 'important');
    weather.style.setProperty('margin-top', '4px', 'important');
    weather.style.setProperty('width', '100%', 'important');
    weather.style.setProperty('justify-content', 'space-between', 'important');

    var days = weather.querySelectorAll('.dash-weather-day');
    days.forEach(function(day) {
      day.style.setProperty('min-width', '0', 'important');
      day.style.setProperty('flex', '1', 'important');
      day.style.setProperty('padding', '4px 2px', 'important');

      // Smaller text inside
      var dayLabel = day.querySelector('.day');
      if (dayLabel) dayLabel.style.setProperty('font-size', '8px', 'important');

      var temp = day.querySelector('.temp');
      if (temp) temp.style.setProperty('font-size', '12px', 'important');

      var icon = day.querySelector('.icon');
      if (icon) icon.style.setProperty('font-size', '14px', 'important');
    });
  }
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(fixDashLayout, 200);
}).observe(document.body, { childList: true, subtree: true });

setTimeout(fixDashLayout, 1000);

console.log('Dashboard mobile layout loaded');

} catch(e) { console.error('dash-mobile error:', e); }
})();
