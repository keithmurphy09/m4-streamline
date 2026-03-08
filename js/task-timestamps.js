// M4 Task Timestamps Enhancement
(function(){
try {

// Override addJobTask to include due_date
window.addJobTask = async function(jobId) {
var input = document.getElementById('new-task-input-' + jobId);
if (!input) return;
var title = input.value.trim();
if (!title) return;

var dueDateInput = document.getElementById('new-task-due-' + jobId);
var dueDate = dueDateInput ? dueDateInput.value : null;

try {
var ownerId = accountOwnerId || currentUser.id;
var insertData = {
job_id: jobId,
user_id: ownerId,
title: title,
completed: false
};
if (dueDate) insertData.due_date = dueDate;

var result = await supabaseClient
.from('job_tasks')
.insert([insertData])
.select();

if (result.error) throw result.error;

if (result.data && result.data[0]) {
window.jobTasks.push(result.data[0]);
}

input.value = '';
if (dueDateInput) dueDateInput.value = '';
renderApp();
} catch (error) {
console.error('Error adding task:', error);
showNotification('Error adding task: ' + error.message, 'error');
}
};

// Override toggleJobTask to save completed_at
window.toggleJobTask = async function(taskId, completed) {
try {
var updateData = { completed: completed };
if (completed) {
updateData.completed_at = new Date().toISOString();
} else {
updateData.completed_at = null;
}

var result = await supabaseClient
.from('job_tasks')
.update(updateData)
.eq('id', taskId);

if (result.error) throw result.error;

var task = window.jobTasks.find(function(t) { return t.id === taskId; });
if (task) {
task.completed = completed;
task.completed_at = updateData.completed_at;
}

renderApp();
} catch (error) {
console.error('Error updating task:', error);
showNotification('Error updating task', 'error');
}
};

// Format date nicely
function fmtDate(dateStr) {
try {
var d = new Date(dateStr);
var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
} catch(e) {
return dateStr;
}
}

function fmtDateTime(dateStr) {
try {
var d = new Date(dateStr);
var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var hr = d.getHours();
var min = String(d.getMinutes()).padStart(2, '0');
var ampm = hr >= 12 ? 'pm' : 'am';
hr = hr % 12 || 12;
return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ' ' + hr + ':' + min + ampm;
} catch(e) {
return dateStr;
}
}

// Enhance task section after each render
function enhanceTasks() {
var section = document.getElementById('job-tasks-section');
if (!section) return;

// Inject due date picker into add-task area
var addArea = section.querySelector('.flex.gap-2.mb-4');
if (addArea && !addArea.querySelector('[id^="new-task-due-"]')) {
var taskInput = addArea.querySelector('[id^="new-task-input-"]');
if (taskInput) {
var jobId = taskInput.id.replace('new-task-input-', '');
var dateInput = document.createElement('input');
dateInput.type = 'date';
dateInput.id = 'new-task-due-' + jobId;
dateInput.title = 'Due date (optional)';
dateInput.style.cssText = 'padding:0.375rem 0.5rem;font-size:0.875rem;border:1px solid #e5e7eb;border-radius:0.5rem;background:#fff;color:#374151;outline:none;min-width:130px;';
var addBtn = addArea.querySelector('button');
if (addBtn) addArea.insertBefore(dateInput, addBtn);
}
}

// Add timestamps to each task row
var checkboxes = section.querySelectorAll('input[type="checkbox"][onchange*="toggleJobTask"]');
checkboxes.forEach(function(cb) {
var row = cb.closest('.flex');
if (!row || row.dataset.tsAdded) return;
row.dataset.tsAdded = 'true';

var match = cb.getAttribute('onchange').match(/toggleJobTask\('([^']+)'/);
if (!match) return;
var taskId = match[1];
var task = window.jobTasks.find(function(t) { return t.id === taskId; });
if (!task) return;

var bits = [];
if (task.created_at) {
bits.push('Added: ' + fmtDate(task.created_at));
}
if (task.due_date) {
var overdue = !task.completed && new Date(task.due_date + 'T23:59:59') < new Date();
var color = overdue ? '#ef4444' : '#9ca3af';
bits.push('<span style="color:' + color + '">' + (overdue ? 'OVERDUE - ' : 'Due: ') + fmtDate(task.due_date) + '</span>');
}
if (task.completed_at) {
bits.push('Done: ' + fmtDateTime(task.completed_at));
}

if (bits.length > 0) {
var titleSpan = row.querySelector('.flex-1');
if (titleSpan) {
// Wrap existing text in a div for proper layout
var existingText = titleSpan.innerHTML;
titleSpan.innerHTML = '<div>' + existingText + '</div>' +
'<div style="font-size:0.65rem;color:#9ca3af;margin-top:2px;">' + bits.join(' &middot; ') + '</div>';
}
}
});
}

// Watch for task section appearing after renders
var debounceTimer = null;
var observer = new MutationObserver(function() {
if (debounceTimer) clearTimeout(debounceTimer);
debounceTimer = setTimeout(function() {
var section = document.getElementById('job-tasks-section');
if (section && !section.dataset.tsEnhanced) {
section.dataset.tsEnhanced = 'true';
enhanceTasks();
}
}, 100);
});
observer.observe(document.body, { childList: true, subtree: true });

console.log('Task timestamps enhancement loaded');

} catch(e) {
console.error('Task timestamps init error:', e);
}
})();
