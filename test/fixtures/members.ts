import type { InvitePreview } from '@/features/auth/types';
import type { MemberView, MembersList, PendingInvite } from '@/features/members/types';

export function member(overrides: Partial<MemberView> = {}): MemberView {
    return {
        userId: '00000000-0000-4000-8000-000000000001',
        name: 'Maria Teste',
        email: 'maria@exemplo.com',
        role: 'owner',
        isYou: true,
        joinedAt: '2026-11-01T12:00:00.000Z',
        ...overrides
    };
}

export function pendingInvite(overrides: Partial<PendingInvite> = {}): PendingInvite {
    return {
        id: '00000000-0000-4000-8000-0000000000a1',
        email: 'ana@exemplo.com',
        role: 'viewer',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        lastSentAt: '2026-11-20T12:00:00.000Z',
        ...overrides
    };
}

export function ana(overrides: Partial<MemberView> = {}): MemberView {
    return member({
        userId: '00000000-0000-4000-8000-000000000002',
        name: 'Ana Souza',
        email: 'ana.souza@exemplo.com',
        role: 'editor',
        isYou: false,
        ...overrides
    });
}

export function membersList(overrides: Partial<MembersList> = {}): MembersList {
    return { members: [member(), ana()], invites: [pendingInvite()], ...overrides };
}

export function invitePreview(overrides: Partial<InvitePreview> = {}): InvitePreview {
    return {
        inviterName: 'Marcos',
        accountName: 'Marcos Lima',
        role: 'editor',
        emailMasked: 'l***@exemplo.com',
        expiresAt: '2026-12-01T12:00:00.000Z',
        ...overrides
    };
}
