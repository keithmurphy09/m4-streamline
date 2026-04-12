// M4 Custom Deposit + SMS Footer Note
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = '.qt-custom-dep{display:inline-flex;align-items:center;gap:4px}.qt-dep-input{width:50px;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;text-align:center;font-family:inherit}.dark .qt-dep-input{background:#374151;border-color:#4b5563;color:#fff}.qt-dep-go{padding:6px 10px;font-size:12px;font-weight:700;background:#0d9488;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:inherit}.qt-dep-go:hover{background:#0f766e}.qt-sms-note{background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:12px;color:#0f766e;line-height:1.4}.dark .qt-sms-note{background:rgba(13,148,136,0.1);border-color:#0d9488;color:#2dd4bf}';
document.head.appendChild(css);

// === CUSTOM DEPOSIT ===
function addCustomDeposit() {
  // Find the 50% button
  var btns = document.querySelectorAll('button');
  var lastBtn = null;
  btns.forEach(function(b) {
    if (b.getAttribute('onclick') === 'setDeposit(50)') lastBtn = b;
  });
  if (!lastBtn) return;
  if (lastBtn.parentElement.querySelector('.qt-custom-dep')) return;

  var wrap = document.createElement('span');
  wrap.className = 'qt-custom-dep';
  wrap.innerHTML = '<input class="qt-dep-input" type="number" min="0" max="100" placeholder="%" title="Custom deposit %"><button class="qt-dep-go" onclick="var v=this.previousElementSibling.value;if(v&&!isNaN(v)&&v>=0&&v<=100){setDeposit(parseInt(v));}else{showNotification(\'Enter 0-100\',\'error\');}" type="button">Set</button>';
  lastBtn.insertAdjacentElement('afterend', wrap);
}

// === SMS FOOTER NOTE ===
function addSMSNote() {
  // Find message template headings or SMS-related sections
  var targets = [];
  document.querySelectorAll('h2, h3, h4, div, label').forEach(function(el) {
    var t = el.textContent.trim();
    if ((t === 'SMS Templates' || t === 'Message Templates' || t === 'SMS Settings') && el.children.length < 3) {
      targets.push(el);
    }
  });
  if (targets.length === 0) return;

  targets.forEach(function(target) {
    if (target.parentElement.querySelector('.qt-sms-note')) return;
    var note = document.createElement('div');
    note.className = 'qt-sms-note';
    note.textContent = 'A "Do not reply" footer with your business name and phone number is automatically added to all outgoing texts. No need to include this in your templates.';
    target.insertAdjacentElement('afterend', note);
  });
}

var _t = null;
new MutationObserver(function() {
  if (_t) clearTimeout(_t);
  _t = setTimeout(function() {
    addCustomDeposit();
    addSMSNote();
  }, 300);
}).observe(document.body, { childList: true, subtree: true });

console.log('Custom deposit + SMS note loaded');

} catch(e) {
  console.error('Deposit/SMS note error:', e);
}
})();
