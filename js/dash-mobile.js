// M4 Dashboard Mobile Layout
// Stacks greeting and date/weather vertically on mobile
// Additive only
(function(){
try {

function fixDashLayout() {
  if (window.innerWidth > 768) return;
  if (typeof activeTab !== 'undefined' && activeTab !== 'dashboard') return;

  // Find the header row: div.flex.justify-between.items-start
  var headerRow = document.querySelector('.flex.justify-between.items-start');
  if (!headerRow) return;
  if (headerRow.dataset.dashFixed) return;

  // Check it's the dashboard header (contains the h1)
  var h1 = headerRow.querySelector('h1');
  if (!h1) return;

  headerRow.dataset.dashFixed = '1';

  // Stack vertically on mobile
  headerRow.style.setProperty('flex-direction', 'column', 'important');
  headerRow.style.setProperty('align-items', 'stretch', 'important');
  headerRow.style.setProperty('gap', '8px', 'important');

  // Date section - make it a row below greeting
  var dateDiv = headerRow.querySelector('.text-right');
  if (dateDiv) {
    dateDiv.style.setProperty('text-align', 'left', 'important');
    dateDiv.style.setProperty('display', 'flex', 'important');
    dateDiv.style.setProperty('align-items', 'center', 'important');
    dateDiv.style.setProperty('gap', '8px', 'important');
  }

  // Weather widget - make it horizontal row
  var weather = headerRow.querySelector('.dash-weather');
  if (weather) {
    weather.style.setProperty('flex-wrap', 'nowrap', 'important');
    weather.style.setProperty('overflow-x', 'auto', 'important');
    weather.style.setProperty('margin-top', '4px', 'important');
    weather.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');

    // Make weather days smaller
    var days = weather.querySelectorAll('.dash-weather-day');
    days.forEach(function(day) {
      day.style.setProperty('min-width', '52px', 'important');
      day.style.setProperty('padding', '4px 6px', 'important');
    });
  }

  // Greeting text - smaller on mobile
  if (h1) {
    h1.style.setProperty('font-size', '24px', 'important');
    h1.style.setProperty('line-height', '1.2', 'important');
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
