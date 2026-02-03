// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Team Management Module (Business Tier)
// ═══════════════════════════════════════════════════════════════════

function renderTeam() {
    if (getAccountType() !== 'business') {
        return `
            <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                <h2 class="text-2xl font-bold mb-4 dark:text-white">Team Management</h2>
                <p class="text-gray-600 dark:text-gray-300 mb-6">Team management is available on Business plans.</p>
                <div class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 inline-block">
                    <p class="text-sm text-yellow-900 dark:text-yellow-200">
                        Upgrade to Business to manage your team members.
                    </p>
                </div>
            </div>
        `;
    }
    
    return `
        <div>
            <h2 class="text-2xl font-bold mb-6 dark:text-white">Team Management</h2>
            
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold dark:text-white">Team Members</h3>
                    <button onclick="openModal('team_member')" class="bg-black text-white px-4 py-2 rounded border border-teal-400">
                        + Add Team Member
                    </button>
                </div>
                
                ${teamMembers.length === 0 ? `
                    <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p class="mb-4">No team members added yet</p>
                        <p class="text-sm">Add team members to assign them to jobs and track their expenses</p>
                    </div>
                ` : `
                    <div class="grid gap-4">
                        ${teamMembers.map(member => `
                            <div class="border dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${member.color || '#14b8a6'}">
                                        ${member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div class="font-semibold dark:text-white">${member.name}</div>
                                        <div class="text-sm text-gray-600 dark:text-gray-300">${member.occupation || 'Team Member'}</div>
                                        ${member.phone ? `<div class="text-xs text-gray-500 dark:text-gray-400">${member.phone}</div>` : ''}
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="openModal('team_member', ${JSON.stringify(member).replace(/"/g, '&quot;')})" class="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                                        Edit
                                    </button>
                                    <button onclick="deleteTeamMember('${member.id}')" class="px-3 py-1 text-sm text-red-600 border rounded">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <p class="text-sm text-blue-900 dark:text-blue-200">
                    <strong>📝 Note:</strong> Full team management features (add/edit/delete) will be added in the next update.
                    For now, use your single file backup for team management.
                </p>
            </div>
        </div>
    `;
}

console.log('✅ Team management module loaded');
