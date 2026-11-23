import type { SessionUser } from './session-context';
import { useSession } from './session-provider';

type Role = SessionUser['role'];

const ROLE_RANK: Readonly<Record<Role, number>> = { viewer: 0, editor: 1, owner: 2 };

export interface RoleState {
    readonly role: Role;
    readonly canEdit: boolean;
    readonly isOwner: boolean;
}

export function hasRole(role: Role, min: Role): boolean {
    return ROLE_RANK[role] >= ROLE_RANK[min];
}

export function useRole(): RoleState {
    const { user } = useSession();
    const role: Role = user?.role ?? 'viewer';
    return { role, canEdit: hasRole(role, 'editor'), isOwner: hasRole(role, 'owner') };
}
