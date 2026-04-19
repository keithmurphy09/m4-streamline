// M4 Schedule Mobile Fix
// Fixes: title wrapping, button overflow, gantt sidebar width
// Additive only
(function(){
try {

var css = document.createElement('style');
css.textContent = [
'@media(max-width:768px){',

// Schedule page header - stack title and buttons
'  .flex.justify-between.items-start{',
'    flex-direction:column !important;',
'    align-items:stretch !important;',
'    gap:8px !important;',
'  }',

// Schedule title smaller
'  h1.text-3xl,',
'  h2.text-2xl{',
'    font-size:20px !important;',
'    white-space:nowrap !important;',
'  }',

// View toggle buttons - wrap in a scrollable row
'  .flex.gap-2,',
'  .flex.flex-wrap.gap-2{',
'    flex-wrap:wrap !important;',
'    gap:4px !important;',
'  }',

// Make view buttons smaller
'  .flex.gap-2 button,',
'  .flex.flex-wrap.gap-2 button{',
'    padding:6px 10px !important;',
'    font-size:12px !important;',
'    white-space:nowrap !important;',
'  }',

// Gantt sidebar - wider than current 120px to show names
'  .gantt-sb{',
'    width:140px !important;',
'    min-width:140px !important;',
'    max-width:140px !important;',
'    font-size:11px !important;',
'  }',

// Gantt job/task rows - allow text to show
'  .gantt-sb .gantt-row,',
'  .gantt-sb .gantt-job-row,',
'  .gantt-sb .gantt-task-row{',
'    padding:4px 6px !important;',
'    font-size:11px !important;',
'  }',

// Gantt sidebar text truncation
'  .gantt-sb *{',
'    overflow:hidden !important;',
'    text-overflow:ellipsis !important;',
'    white-space:nowrap !important;',
'  }',

// Gantt container scrollable
'  #gantt-container{',
'    overflow-x:auto !important;',
'    -webkit-overflow-scrolling:touch !important;',
'  }',

// Gantt wrap max width
'  .gantt-wrap{',
'    max-width:100vw !important;',
'  }',

// Search and export row - stack
'  .flex.gap-3{',
'    flex-direction:column !important;',
'    gap:6px !important;',
'  }',

'}'
].join('\n');
document.head.appendChild(css);

console.log('Schedule mobile fix loaded');

} catch(e) { console.error('schedule-mobile error:', e); }
})();
