// M4 Gantt Toolbar Text Fix
// Ensures toolbar button/select text is visible
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
  'html:not(.dark) select.border{color:#374151!important;background-color:#fff!important}',
  'html:not(.dark) button.border{color:#374151!important;background-color:#fff!important}'
].join('\n');
document.head.appendChild(css);

console.log('Gantt toolbar fix loaded');

} catch(e) { console.error('gantt-toolbar error:', e); }
})();
