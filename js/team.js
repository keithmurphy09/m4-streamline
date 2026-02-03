// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Team Management Module (COMPLETE)
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
            <div class="flex justify-between mb-6">
                <h2 class="text-2xl font-bold dark:text-white">Team Members</h2>
                <button onclick="openModal('team_member')" class="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 border border-teal-400">
                    + Add Team Member
                </button>
            </div>
            
            <div class="grid gap-4">
                ${teamMembers.length === 0 ? `
                    <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p class="mb-4">No team members yet. Add your first worker!</p>
                        <p class="text-sm">Team members can be assigned to jobs and track expenses</p>
                    </div>
                ` : teamMembers.map(member => `
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4" style="border-color: ${member.color || '#3b82f6'}">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="text-lg font-semibold dark:text-white">${member.name}</h3>
                                ${member.occupation ? `<p class="text-sm text-gray-600 dark:text-gray-300 font-medium">${member.occupation}</p>` : ''}
                                <p class="text-sm text-gray-600 dark:text-gray-300">${member.email || 'No email'}</p>
                                <p class="text-sm text-gray-600 dark:text-gray-300">${member.phone || 'No phone'}</p>
                                <div class="flex items-center gap-2 mt-2">
                                    <div class="w-4 h-4 rounded" style="background-color: ${member.color || '#3b82f6'}"></div>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">Calendar color</span>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="editTeamMember('${member.id}')" class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                                    Edit
                                </button>
                                <button onclick="deleteTeamMember('${member.id}')" class="px-3 py-1 text-red-600 border border-red-600 rounded text-sm hover:bg-red-50 dark:hover:bg-red-900">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Team Member CRUD Operations
async function addTeamMember(member) {
    try {
        const { data, error } = await supabaseClient
            .from('team_members')
            .insert([{
                ...member,
                account_owner_id: currentUser.id
            }])
            .select();
        
        if (error) throw error;
        
        if (data) {
            teamMembers.push(data[0]);
            showNotification('Team member added successfully!', 'success');
        }
        
        closeModal();
        renderApp();
    } catch (error) {
        console.error('Error adding team member:', error);
        showNotification('Error adding team member', 'error');
    }
}

async function editTeamMember(id) {
    const member = teamMembers.find(m => m.id === id);
    if (member) {
        openModal('team_member', member);
    }
}

async function updateTeamMember(id) {
    try {
        const updatedMember = {
            name: document.getElementById('team_name').value,
            email: document.getElementById('team_email').value,
            phone: document.getElementById('team_phone').value,
            occupation: document.getElementById('team_occupation').value,
            color: document.getElementById('team_color').value
        };
        
        const { data, error } = await supabaseClient
            .from('team_members')
            .update(updatedMember)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        
        if (data) {
            const index = teamMembers.findIndex(m => m.id === id);
            if (index !== -1) {
                teamMembers[index] = data[0];
            }
            showNotification('Team member updated successfully!', 'success');
        }
        
        closeModal();
        renderApp();
    } catch (error) {
        console.error('Error updating team member:', error);
        showNotification('Error updating team member', 'error');
    }
}

async function deleteTeamMember(id) {
    try {
        if (!confirm('Delete this team member? This action cannot be undone.')) {
            return;
        }
        
        isLoading = true;
        loadingMessage = 'Deleting team member...';
        renderApp();
        
        const { error } = await supabaseClient
            .from('team_members')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        teamMembers = teamMembers.filter(m => m.id !== id);
        showNotification('Team member deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting team member:', error);
        showNotification('Failed to delete team member: ' + error.message, 'error');
    } finally {
        isLoading = false;
        renderApp();
    }
}

console.log('✅ Team management module loaded (COMPLETE)');
