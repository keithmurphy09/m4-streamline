// M4 Mobile Debug - Shows errors on screen
// REMOVE BEFORE FINAL LAUNCH
// Additive only
(function(){
try {

var d = document.createElement('div');
d.id = 'mdbg';
d.style.cssText = 'position:fixed;bottom:0;left:0;right:0;max-height:30vh;overflow-y:auto;background:rgba(0,0,0,0.9);color:#0f0;font-size:10px;font-family:monospace;padding:8px;z-index:99999;display:none;word-wrap:break-word';
document.body.appendChild(d);

// Toggle button
var btn = document.createElement('button');
btn.textContent = 'DBG';
btn.style.cssText = 'position:fixed;bottom:4px;right:4px;z-index:100000;background:#ef4444;color:#fff;border:none;border-radius:50%;width:36px;height:36px;font-size:10px;font-weight:700;cursor:pointer;opacity:0.7';
btn.onclick = function() {
  d.style.display = d.style.display === 'none' ? 'block' : 'none';
};
document.body.appendChild(btn);

function log(msg, color) {
  var line = document.createElement('div');
  line.style.cssText = 'border-bottom:1px solid #333;padding:2px 0;color:' + (color || '#0f0');
  line.textContent = new Date().toLocaleTimeString() + ' ' + msg;
  d.appendChild(line);
  d.scrollTop = d.scrollHeight;
}

// Screen info
log('Screen: ' + window.innerWidth + 'x' + window.innerHeight + ' DPR:' + window.devicePixelRatio);

// Catch errors
window.addEventListener('error', function(e) {
  log('ERR: ' + e.message + ' @ ' + (e.filename || '').split('/').pop() + ':' + e.lineno, '#ef4444');
});

// Catch promise rejections
window.addEventListener('unhandledrejection', function(e) {
  log('PROMISE: ' + (e.reason ? e.reason.message || e.reason : 'unknown'), '#f59e0b');
});

// Intercept console.error
var _ce = console.error;
console.error = function() {
  var args = Array.from(arguments).map(function(a) { return typeof a === 'object' ? JSON.stringify(a).substring(0, 100) : String(a); });
  log('ERR: ' + args.join(' '), '#ef4444');
  _ce.apply(console, arguments);
};

// Check overflow on load
setTimeout(function() {
  var overflows = [];
  document.querySelectorAll('*').forEach(function(el) {
    var r = el.getBoundingClientRect();
    if (r.right > window.innerWidth + 5 && el.offsetWidth > 50) {
      overflows.push(el.tagName + '.' + (el.className || '').split(' ')[0] + ' +' + Math.round(r.right - window.innerWidth) + 'px');
    }
  });
  if (overflows.length > 0) {
    log('OVERFLOW: ' + overflows.slice(0, 5).join(', '), '#f59e0b');
  } else {
    log('No overflow detected');
  }
  log('Body: ' + document.body.scrollWidth + 'x' + document.body.scrollHeight);
}, 2000);

console.log('Mobile debug loaded - tap red DBG button');

} catch(e) {}
})();
