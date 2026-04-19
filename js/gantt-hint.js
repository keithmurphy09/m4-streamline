// M4 Gantt Landscape Hint
// Shows a tip to rotate phone when viewing gantt in portrait
// Additive only
(function(){
try {

function checkGantt() {
  if (window.innerWidth > 768) return;

  var gantt = document.getElementById('gantt-container');
  if (!gantt) {
    // Remove hint if gantt not visible
    var old = document.getElementById('gantt-rotate-hint');
    if (old) old.remove();
    return;
  }

  // Only show in portrait
  if (window.innerHeight <= window.innerWidth) {
    var old2 = document.getElementById('gantt-rotate-hint');
    if (old2) old2.remove();
    return;
  }

  // Don't add twice
  if (document.getElementById('gantt-rotate-hint')) return;

  var hint = document.createElement('div');
  hint.id = 'gantt-rotate-hint';
  hint.style.cssText = 'background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:8px 12px;margin-bottom:8px;display:flex;align-items:center;gap:8px;font-size:13px;color:#0f766e;font-weight:500;';
  hint.innerHTML = '<span style="font-size:18px;">&#128257;</span> Rotate your phone for a better Gantt view';

  // Insert before gantt container
  gantt.parentNode.insertBefore(hint, gantt);
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(checkGantt, 300);
}).observe(document.body, { childList: true, subtree: true });

window.addEventListener('resize', checkGantt);
setTimeout(checkGantt, 1000);

console.log('Gantt landscape hint loaded');

} catch(e) { console.error('gantt-hint error:', e); }
})();
