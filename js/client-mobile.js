// M4 Client Mobile Fix
// Fixes: name layout, button sizes, popup header text
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'@media(max-width:768px){',

// Client card layout - name above buttons
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

// Email/phone contact items - inline with icons
'  #clientsList .cl-contact{',
'    display:flex !important;',
'    flex-wrap:wrap !important;',
'    gap:8px !important;',
'    align-items:center !important;',
'  }',
'  #clientsList .cl-contact-item{',
'    display:inline-flex !important;',
'    align-items:center !important;',
'    gap:4px !important;',
'    font-size:12px !important;',
'  }',
'  #clientsList .cl-contact-item svg{',
'    flex-shrink:0 !important;',
'    width:12px !important;',
'    height:12px !important;',
'    max-width:12px !important;',
'    max-height:12px !important;',
'  }',

// All action buttons same size
'  #clientsList .flex.gap-2.flex-shrink-0{',
'    width:100% !important;',
'    display:flex !important;',
'    flex-wrap:nowrap !important;',
'    gap:6px !important;',
'  }',
'  #clientsList .flex.gap-2.flex-shrink-0 button{',
'    flex:1 !important;',
'    min-width:0 !important;',
'    font-size:12px !important;',
'    padding:8px 4px !important;',
'    white-space:nowrap !important;',
'    min-height:36px !important;',
'    max-height:36px !important;',
'  }',

'}',

// Client profile popup - force white text in header (all screen sizes)
'#client-quick-view .bg-black h2{color:#fff !important}',
'#client-quick-view .bg-black .text-gray-300{color:#d1d5db !important}',
'#client-quick-view .bg-black .text-gray-300 a{color:#d1d5db !important}',
'#client-quick-view .bg-black .text-teal-400{color:#2dd4bf !important}',
'#client-quick-view .bg-black *{color:inherit}',
'#client-quick-view .bg-black{color:#fff !important}',
'#client-quick-view .bg-black .text-xs{color:#2dd4bf !important}',

// Stats cards in popup - single column on mobile
'@media(max-width:768px){',
'  #client-quick-view .grid-cols-2{',
'    grid-template-columns:1fr !important;',
'    gap:8px !important;',
'  }',
'}'
].join('\n');
document.head.appendChild(css);

console.log('Client mobile fix loaded');

} catch(e) { console.error('client-mobile error:', e); }
})();
