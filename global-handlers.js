// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Global Click Handlers (Close Dropdowns & Modals)
// ADD THIS FILE TO YOUR PROJECT ROOT
// LOAD IT IN index.html: <script src="global-handlers.js"></script>
// ═══════════════════════════════════════════════════════════════════

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        // Check if click is inside a dropdown or on a toggle button
        const clickedDropdown = event.target.closest('[id*="actions"]');
        const clickedToggle = event.target.closest('button[onclick*="toggle"]');
        
        // If clicked outside both, close all dropdowns
        if (!clickedDropdown && !clickedToggle) {
            document.querySelectorAll('[id*="actions"]').forEach(menu => {
                menu.classList.add('hidden');
            });
        }
    });
    
    // Close recurring job modal when clicking outside
    document.addEventListener('click', function(event) {
        const recurringModal = document.getElementById('recurringJobModalContainer');
        if (recurringModal) {
            const modalContent = recurringModal.querySelector('.bg-white');
            const clickedInside = event.target.closest('.bg-white.dark\\:bg-gray-800.rounded-xl');
            const clickedToggle = event.target.closest('button[onclick*="Recurring"]');
            
            if (!clickedInside && !clickedToggle) {
                recurringModal.remove();
            }
        }
    });
    
    console.log('✅ Global click handlers loaded');
});

// Function to close recurring job modal
function closeRecurringJobModal() {
    const modal = document.getElementById('recurringJobModalContainer');
    if (modal) {
        modal.remove();
    }
}

console.log('✅ Global handlers module loaded');
