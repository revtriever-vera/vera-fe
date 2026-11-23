import type { AuditEntry, SignupLink } from '@/features/admin/types';

export function auditEntry(overrides: Partial<AuditEntry> = {}): AuditEntry {
    return {
        id: '11111111-1111-4111-8111-111111111111',
        action: 'admin.login',
        operatorUserId: '22222222-2222-4222-8222-222222222222',
        targetCompanyId: null,
        meta: { provider: 'google' },
        createdAt: '2026-11-23T12:00:00.000Z',
        ...overrides
    };
}

export function signupLink(overrides: Partial<SignupLink> = {}): SignupLink {
    return {
        id: '33333333-3333-4333-8333-333333333333',
        token: 'tokentokentokentoken',
        url: 'https://app.vera.test/signup?link=tokentokentokentoken',
        label: 'Parceiros',
        trial: { kind: 'card', days: 14 },
        rules: [{ percent: 50, fromCycle: 1, toCycle: 3 }],
        maxUses: 100,
        offerValidityDays: 30,
        expiresAt: '2026-12-31T23:59:59.000Z',
        status: 'active',
        redemptionCount: 12,
        trialCount: 10,
        subscriptionCount: 4,
        revokedAt: null,
        createdAt: '2026-11-20T12:00:00.000Z',
        ...overrides
    };
}
