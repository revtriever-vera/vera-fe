import type { InvitePreview } from '../types';

export function inviteRoleKey(role: InvitePreview['role']): 'inviteRoleOwner' | 'inviteRoleEditor' | 'inviteRoleViewer' {
    if (role === 'owner') {
        return 'inviteRoleOwner';
    }
    return role === 'editor' ? 'inviteRoleEditor' : 'inviteRoleViewer';
}
