// M4 Client Mobile Fix
// Makes client name visible above buttons on mobile
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'@media(max-width:768px){',
'  #clientsList .flex.items-center.gap-3{',
'    flex-wrap:wrap !important;',
'  }',
'  #clientsList .cl-info{',
'    width:100% !important;',
'    flex:1 1 100% !important;',
'    order:-1 !important;',
'    margin-bottom:8px !important;',
'  }',
'  #clientsList .cl-avatar{',
'    order:-2 !important;',
'  }',
'  #clientsList input[type="checkbox"]{',
'    order:-3 !important;',
'  }',
'  #clientsList .flex.gap-2.flex-shrink-0{',
'    width:100% !important;',
'    flex-wrap:wrap !important;',
'    gap:6px !important;',
'  }',
'  #clientsList .flex.gap-2.flex-shrink-0 button{',
'    flex:1 !important;',
'    min-width:0 !important;',
'    font-size:12px !important;',
'    padding:8px 4px !important;',
'    white-space:nowrap !important;',
'  }',
'}'
].join('\n');
document.head.appendChild(css);

console.log('Client mobile fix loaded');

} catch(e) { console.error('client-mobile error:', e); }
})();
