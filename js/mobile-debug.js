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
  var bh2 = document.querySelector('.bg-black.border-b-4');
  if(bh2) log('header h:' + bh2.offsetHeight, '#ff0');

  log('html dark class: ' + document.documentElement.classList.contains('dark'), '#ff0');
  log('body dark class: ' + document.body.classList.contains('dark'), '#ff0');
  log('darkMode var: ' + (typeof darkMode !== 'undefined' ? darkMode : 'undefined'), '#ff0');
  log('localStorage dark: ' + localStorage.getItem('darkMode'), '#ff0');
  log('prefers-dark: ' + window.matchMedia('(prefers-color-scheme: dark)').matches, '#ff0');

  log('Body: ' + document.body.scrollWidth + 'x' + document.body.scrollHeight);
}, 3000);

} catch(e) { console.error('debug error:', e); }
})();
