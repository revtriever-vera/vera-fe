import type { AccountAccess, AccountItem, AccountList, AuditEntry, PlatformOverview, SignupLink } from '@/features/admin/types';

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
        expiresAt: '2026-12-31T23:59:59.000Z',
        offerValidityDays: 30,
        status: 'active',
        redemptionCount: 12,
        trialCount: 10,
        subscriptionCount: 4,
        revokedAt: null,
        createdAt: '2026-11-20T12:00:00.000Z',
        ...overrides
    };
}

export function platformOverview(overrides: Partial<PlatformOverview> = {}): PlatformOverview {
    return { accounts: { total: 120, createdLast30Days: 14 }, plans: { free: 90, premium: 30, trials: 6 }, ...overrides };
}

export function accountItem(overrides: Partial<AccountItem> = {}): AccountItem {
    return {
        id: '44444444-4444-4444-8444-444444444444',
        name: 'Família Silva',
        createdAt: '2026-11-10T12:00:00.000Z',
        plan: 'free',
        planSource: null,
        trialEndsAt: null,
        ...overrides
    };
}

export function accountList(items: AccountItem[] = [accountItem()], overrides: Partial<AccountList> = {}): AccountList {
    return { items, page: 1, pageSize: 25, total: items.length, ...overrides };
}

export function accountAccess(overrides: Partial<AccountAccess> = {}): AccountAccess {
    return {
        accountId: '44444444-4444-4444-8444-444444444444',
        summary: {
            account: accountItem(),
            locale: 'pt-BR',
            timezone: 'America/Sao_Paulo',
            people: [
                {
                    id: '55555555-5555-4555-8555-555555555555',
                    name: 'Ana Silva',
                    email: 'ana@example.com',
                    role: 'owner',
                    joinedAt: '2026-11-10T12:00:00.000Z'
                }
            ],
            billing: { subscriptions: [{ status: 'active', provider: 'revtriever' }] },
            offer: null,
            usage: { used: 120, limit: 400 }
        },
        data: { goals: [{ name: 'Reserva', targetMinor: 1000000 }], assets: [] },
        ...overrides
    };
}
