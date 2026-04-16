// M4 Mobile Debug v2 - tells us WHAT is broken
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
log('tailwind global: ' + typeof tailwind);
log('tw config: ' + (tailwind.config ? 'set' : 'missing'));
log('tw version: ' + (tailwind.version || 'unknown'));
log('stylesheet rules: ' + (document.styleSheets[0] ? document.styleSheets[0].cssRules.length : 'blocked'));
log('tw stylesheets: ' + document.querySelectorAll('style[type="text/tailwindcss"]').length);
log('head children: ' + document.head.children.length);
log('body children: ' + document.body.children.length);

window.addEventListener('error', function(e) {
  log('ERR: ' + e.message + ' @ ' + (e.filename || '').split('/').pop() + ':' + e.lineno, '#ef4444');
});
window.addEventListener('unhandledrejection', function(e) {
  log('PROMISE: ' + (e.reason ? (e.reason.message || e.reason) : 'unknown'), '#f59e0b');
});

// Check Tailwind after 3 sec
setTimeout(function() {
  // Test if Tailwind loaded by creating a test element
  var t = document.createElement('div');
  t.className = 'w-6 h-6';
  t.style.cssText = 'position:absolute;left:-9999px';
  document.body.appendChild(t);
  var cs = getComputedStyle(t);
  var w = cs.width;
  if (w === '24px') {
    log('TAILWIND: LOADED OK', '#0f0');
  } else {
    log('TAILWIND: NOT LOADED (w-6 = ' + w + ')', '#ef4444');
  }
  document.body.removeChild(t);

  // Check ADMIN badge
  var admin = document.querySelector('span.bg-red-600');
  if (admin) {
    var ar = admin.getBoundingClientRect();
    var ap = admin.parentElement;
    var apc = ap ? getComputedStyle(ap) : null;
    log('ADMIN: ' + Math.round(ar.width) + 'x' + Math.round(ar.height) + 'px', ar.height > 50 ? '#ef4444' : '#0f0');
    if (apc) log('ADMIN parent: display=' + apc.display + ' flex-dir=' + apc.flexDirection, '#ff0');
  } else {
    log('ADMIN: not found', '#ff0');
  }

  // Find giant elements
  var giants = [];
  document.querySelectorAll('svg, img, div').forEach(function(el) {
    var r = el.getBoundingClientRect();
    if (r.height > 150 && r.width > 150 && el.children.length < 2) {
      var cls = (el.className && typeof el.className === 'string') ? el.className.substring(0, 30) : el.tagName;
      giants.push(el.tagName + '.' + cls + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
  });
  if (giants.length) {
    log('GIANTS (' + giants.length + '):', '#ef4444');
    giants.slice(0, 8).forEach(function(g) { log('  ' + g, '#ef4444'); });
  }

  log('Body: ' + document.body.scrollWidth + 'x' + document.body.scrollHeight);
  log('Scripts: ' + document.querySelectorAll('script').length);
  log('Stylesheets: ' + document.styleSheets.length);
}, 3000);

} catch(e) {}
})();
