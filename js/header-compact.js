// M4 Header Compact - Mobile
// Uses CSS only via injected stylesheet. No DOM cloning or moving.
// Additive only
(function(){
try {

if (window.innerWidth > 768) return;

var css = document.createElement('style');
css.textContent = [
'@media(max-width:768px){',

// Header padding
'  .bg-black.border-b-4{padding:4px 8px !important;height:auto !important}',

// Inner container - single row wrapping
'  .bg-black.border-b-4 .max-w-7xl{',
'    gap:0px !important;',
'    padding-bottom:0px !important;',
'    height:auto !important;',
'    min-height:0 !important;',
'  }',

// Cobrand row
'  .cb-row{padding:4px 0 !important}',
'  .cb-logo{height:30px !important;margin-right:0 !important}',
'  .cb-txt{height:12px !important}',
'  .cb-p{font-size:7px !important;margin-top:0 !important}',

// Controls row - position it visually next to cobrand row
// cobrand-header.js sets this to position:static on mobile
// We override to absolute, positioned at top-right of header
'  .bg-black.border-b-4 .max-w-7xl>div:not(.cb-row):not(.cb-hide){',
'    position:absolute !important;',
'    top:4px !important;',
'    right:8px !important;',
'    display:flex !important;',
'    gap:4px !important;',
'    align-items:center !important;',
'    margin-top:0 !important;',
'    z-index:10 !important;',
'  }',

// Make header relative for absolute positioning
'  .bg-black.border-b-4 .max-w-7xl{position:relative !important}',

// Shrink buttons
'  .bg-black.border-b-4 button{',
'    padding:3px 6px !important;',
'    font-size:11px !important;',
'    min-height:28px !important;',
'  }',

// ADMIN badge
'  .bg-black.border-b-4 span.bg-red-600{',
'    font-size:9px !important;',
'    padding:2px 5px !important;',
'  }',

// Nav bar
'  div.border-b.border-teal-400:not(.bg-black *){',
'    max-height:44px !important;',
'    overflow:hidden !important;',
'  }',

'  div.border-b.border-teal-400:not(.bg-black *) .flex.items-center.justify-between{',
'    height:40px !important;',
'  }',

// Hide desktop nav on mobile
'  div.border-b.border-teal-400:not(.bg-black *) nav{',
'    display:none !important;',
'  }',

'}'
].join('\n');
document.head.appendChild(css);

console.log('Header compact loaded');

} catch(e) { console.error('header-compact error:', e); }
})();
