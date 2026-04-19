// M4 Mobile Debug v2
(function(){
try {
var d = document.createElement('div');
d.id = 'mdbg';
d.style.cssText = 'position:fixed;bottom:0;left:0;right:0;max-height:50vh;overflow-y:auto;background:rgba(0,0,0,0.92);color:#0f0;font-size:10px;font-family:monospace;padding:8px;z-index:99999;display:none;word-wrap:break-word';
document.body.appendChild(d);

var btn = document.createElement('button');
btn.textContent = 'DBG';
btn.style.cssText = 'position:fixed;bottom:4px;right:4px;z-index:100000;background:#ef4444;color:#fff;border:none;border-radius:50%;width:36px;height:36px;font-size:10px;font-weight:700;cursor:pointer;opacity:0.7';
btn.onclick = function() { d.style.display = d.style.display === 'none' ? 'block' : 'none'; };
document.body.appendChild(btn);

function log(msg, color) {
  var line = document.createElement('div');
  line.style.cssText = 'border-bottom:1px solid #333;padding:2px 0;color:' + (color || '#0f0');
  line.textContent = new Date().toLocaleTimeString() + ' ' + msg;
  d.appendChild(line);
  d.scrollTop = d.scrollHeight;
}

log('Screen: ' + window.innerWidth + 'x' + window.innerHeight);

window.addEventListener('error', function(e) {
  log('ERR: ' + e.message + ' @ ' + (e.filename || '').split('/').pop() + ':' + e.lineno, '#ef4444');
});
window.addEventListener('unhandledrejection', function(e) {
  log('PROMISE: ' + (e.reason ? (e.reason.message || e.reason) : 'unknown'), '#f59e0b');
});

setTimeout(function() {
  log('header h:' + (document.querySelector('.bg-black.border-b-4') || {}).offsetHeight, '#ff0');
  log('html dark: ' + document.documentElement.classList.contains('dark'), '#ff0');
  log('darkMode: ' + (typeof darkMode !== 'undefined' ? darkMode : 'undef'), '#ff0');
  log('prefers-dark: ' + window.matchMedia('(prefers-color-scheme: dark)').matches, '#ff0');
  var navTest = document.querySelectorAll('div.border-b.border-teal-400');
log('nav candidates: ' + navTest.length, '#ff0');
for(var ni=0;ni<navTest.length;ni++){var n=navTest[ni];log('  nav'+ni+': inHeader='+!!n.closest('.bg-black')+' h='+n.offsetHeight+' kids='+n.children.length, '#ff0');}

  // Check actual background colours
  var html = document.documentElement;
  var body = document.body;
  var app = document.getElementById('app');
  var mainDiv = app ? app.firstElementChild : null;

  log('html bg: ' + getComputedStyle(html).backgroundColor, '#ff0');
  log('body bg: ' + getComputedStyle(body).backgroundColor, '#ff0');
  if(app) log('app bg: ' + getComputedStyle(app).backgroundColor, '#ff0');
  if(mainDiv) log('mainDiv bg: ' + getComputedStyle(mainDiv).backgroundColor + ' class: ' + (mainDiv.className || '').substring(0,50), '#ff0');

  // Check if any stylesheet has dark overrides active
  var darkRules = 0;
  try {
    for(var si = 0; si < document.styleSheets.length; si++) {
      try {
        var rules = document.styleSheets[si].cssRules;
        for(var ri = 0; ri < rules.length; ri++) {
          var txt = rules[ri].cssText || '';
          if(txt.indexOf('prefers-color-scheme: dark') !== -1) darkRules++;
        }
      } catch(e) {}
    }
  } catch(e) {}
  log('dark CSS rules: ' + darkRules, '#ff0');

  log('Body: ' + document.body.scrollWidth + 'x' + document.body.scrollHeight);
}, 3000);

} catch(e) { console.error('debug error:', e); }
})();
