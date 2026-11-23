import type {
    AccountAccess,
    AccountData,
    AccountItem,
    AccountList,
    AuditEntry,
    PlatformOverview,
    SignupLink
} from '@/features/admin/types';

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
            billing: {
                subscriptions: [
                    {
                        id: '66666666-6666-4666-8666-666666666666',
                        status: 'active',
                        paymentMethod: 'card',
                        paidThrough: '2026-12-10T12:00:00.000Z',
                        firstPaidAt: '2026-11-10T12:00:00.000Z',
                        canceledAt: null,
                        createdAt: '2026-11-10T12:00:00.000Z'
                    }
                ],
                invoices: [
                    {
                        id: '77777777-7777-4777-8777-777777777777',
                        status: 'paid',
                        totalCents: 1990,
                        method: 'card',
                        dueDate: '2026-11-10T12:00:00.000Z',
                        cycleStart: '2026-11-10T12:00:00.000Z',
                        cycleEnd: '2026-12-10T12:00:00.000Z',
                        paidAt: '2026-11-10T12:00:00.000Z'
                    }
                ]
            },
            offer: null,
            usage: [{ period: '2026-11', feature: 'ai', costMicros: 1500000, entries: 12 }]
        },
        data: accountData(),
        ...overrides
    };
}

export function accountData(overrides: Partial<AccountData> = {}): AccountData {
    return {
        positions: [],
        fixed_income: { titles: [] },
        allocation: { settings: { baseCurrency: 'BRL', toleranceBps: 500 }, classes: [], assetTargets: [] },
        goals: {
            goals: [
                {
                    id: '88888888-8888-4888-8888-888888888888',
                    kind: 'custom',
                    name: 'Reserva',
                    targetMinor: 1000000,
                    targetDate: '2027-12-31',
                    holderUserId: null,
                    manualMinor: 250000,
                    reserveMonths: null,
                    createdAt: '2026-11-10T12:00:00.000Z'
                }
            ],
            goalHoldings: []
        },
        transactions: { accounts: [], transactions: [], imports: [] },
        spending_categories: { categories: [], rules: [] },
        spending_settings: null,
        recurring: { series: [], suppressions: [], alerts: [] },
        bank_connections: { connections: [] },
        ...overrides
    };
}
