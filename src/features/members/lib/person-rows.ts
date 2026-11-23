import type { MemberRole, MembersList } from '../types';

export interface PersonRow {
    readonly id: string;
    readonly name: string;
    readonly email: string | null;
    readonly role: MemberRole;
    readonly isYou: boolean;
    readonly pending: boolean;
    readonly expiresAt: string | null;
}

export function toPersonRows(list: MembersList): readonly PersonRow[] {
    const members: PersonRow[] = list.members.map(
        (member): PersonRow => ({
            id: member.userId,
            name: member.name,
            email: member.email,
            role: member.role,
            isYou: member.isYou,
            pending: false,
            expiresAt: null
        })
    );
    const invites: PersonRow[] = list.invites.map(
        (invite): PersonRow => ({
            id: invite.id,
            name: invite.email,
            email: invite.email,
            role: invite.role,
            isYou: false,
            pending: true,
            expiresAt: invite.expiresAt
        })
    );
    return [...members, ...invites];
}

export function isOnlyOwner(rows: readonly PersonRow[], person: PersonRow): boolean {
    return person.role === 'owner' && !person.pending && rows.filter((row: PersonRow): boolean => row.role === 'owner' && !row.pending).length === 1;
}
