import type {
    AccountView,
    AccountsResponse,
    CategoriesResponse,
    CategoryFlexibility,
    CategoryKind,
    CategorySource,
    ConnectionView,
    ConnectionsResponse,
    CredentialsView,
    CutSuggestion,
    CutsResponse,
    IconKey,
    ImportPreview,
    ImportView,
    ImportsResponse,
    MonthlySummary,
    RuleView,
    SpendingSettings,
    SummaryCategoryRow,
    TransactionView,
    TransactionsResponse
} from '@/features/spending/types';

export const CANONICAL_MONTH: string = '2026-09';
export const CURRENT_MONTH: string = '2026-10';
export const CANONICAL_INCOME_MINOR: number = 2800000;
export const CANONICAL_SAVED_MINOR: number = 336000;
export const CANONICAL_UNCATEGORIZED_MINOR: number = 80000;
const CREATED_AT: string = '2026-10-01T12:00:00.000Z';

interface CategorySeed {
    readonly key: string;
    readonly kind: CategoryKind;
    readonly flexibility: CategoryFlexibility | null;
    readonly icon: IconKey;
}

const CATEGORY_SEEDS: readonly CategorySeed[] = [
    { key: 'housing', kind: 'expense', flexibility: 'fixed', icon: 'Home' },
    { key: 'education', kind: 'expense', flexibility: 'fixed', icon: 'BookOpen' },
    { key: 'health', kind: 'expense', flexibility: 'fixed', icon: 'HeartPulse' },
    { key: 'home_services', kind: 'expense', flexibility: 'fixed', icon: 'Wrench' },
    { key: 'taxes_fees', kind: 'expense', flexibility: 'fixed', icon: 'Landmark' },
    { key: 'groceries', kind: 'expense', flexibility: 'flexible', icon: 'ShoppingCart' },
    { key: 'eating_out', kind: 'expense', flexibility: 'flexible', icon: 'UtensilsCrossed' },
    { key: 'transport', kind: 'expense', flexibility: 'flexible', icon: 'Car' },
    { key: 'leisure', kind: 'expense', flexibility: 'flexible', icon: 'Film' },
    { key: 'subscriptions', kind: 'expense', flexibility: 'flexible', icon: 'Repeat' },
    { key: 'shopping', kind: 'expense', flexibility: 'flexible', icon: 'ShoppingBag' },
    { key: 'other_expenses', kind: 'expense', flexibility: 'flexible', icon: 'CircleEllipsis' },
    { key: 'income', kind: 'income', flexibility: null, icon: 'TrendingUp' },
    { key: 'other_income', kind: 'income', flexibility: null, icon: 'PlusCircle' },
    { key: 'own_transfer', kind: 'transfer', flexibility: null, icon: 'ArrowLeftRight' },
    { key: 'card_payment', kind: 'transfer', flexibility: null, icon: 'CreditCard' },
    { key: 'investments', kind: 'transfer', flexibility: null, icon: 'PiggyBank' }
];

export function categoryId(systemKey: string): string {
    return `cat-${systemKey.replaceAll('_', '-')}`;
}

export function accountId(key: string): string {
    return `acc-${key}`;
}

export function categoryView(overrides: Partial<CategoriesResponse['categories'][number]> = {}): CategoriesResponse['categories'][number] {
    return {
        id: 'cat-custom',
        systemKey: null,
        name: 'Pets',
        kind: 'expense',
        flexibility: 'flexible',
        icon: 'PawPrint',
        position: 17,
        isSystem: false,
        ...overrides
    };
}

export function defaultCategories(): CategoriesResponse {
    return {
        categories: CATEGORY_SEEDS.map((seed: CategorySeed, position: number) =>
            categoryView({
                id: categoryId(seed.key),
                systemKey: seed.key,
                name: null,
                kind: seed.kind,
                flexibility: seed.flexibility,
                icon: seed.icon,
                position,
                isSystem: true
            })
        )
    };
}

export function systemCategory(systemKey: string): CategoriesResponse['categories'][number] {
    const found: CategoriesResponse['categories'][number] | undefined = defaultCategories().categories.find(
        (category: CategoriesResponse['categories'][number]): boolean => category.systemKey === systemKey
    );
    if (found === undefined) {
        throw new Error(`unknown system category ${systemKey}`);
    }
    return found;
}

export function spendingSettings(overrides: Partial<SpendingSettings> = {}): SpendingSettings {
    return { savingsGoalBps: 2000, incomeMode: 'transactions', declaredIncomeMinor: null, ...overrides };
}

export function ruleView(overrides: Partial<RuleView> = {}): RuleView {
    return {
        id: 'rule-1',
        matchType: 'description',
        label: 'padaria estrela',
        appliesTo: 'out',
        categoryId: categoryId('groceries'),
        createdAt: CREATED_AT,
        updatedAt: CREATED_AT,
        ...overrides
    };
}

interface AccountSeed {
    readonly key: string;
    readonly name: string;
    readonly kind: AccountView['kind'];
    readonly institution: string;
    readonly last4: string;
}

const ACCOUNT_SEEDS: readonly AccountSeed[] = [
    { key: 'nubank-card', name: 'Nubank Cartão', kind: 'credit_card', institution: 'Nubank', last4: '4321' },
    { key: 'nubank-checking', name: 'Nubank Conta', kind: 'checking', institution: 'Nubank', last4: '8765' },
    { key: 'itau-checking', name: 'Itaú Conta', kind: 'checking', institution: 'Itaú', last4: '1098' }
];

export function accountView(overrides: Partial<AccountView> = {}): AccountView {
    return {
        id: 'acc-file',
        name: 'Extrato do banco',
        kind: 'checking',
        institutionName: null,
        numberLast4: null,
        currency: 'BRL',
        source: 'file',
        transactionCount: 0,
        lastTransactionDate: null,
        isSample: false,
        ...overrides
    };
}

export function emptyAccounts(): AccountsResponse {
    return { accounts: [] };
}

export function canonicalAccounts(): AccountsResponse {
    const counts: Readonly<Record<string, number>> = transactionCountsByAccount();
    return {
        accounts: ACCOUNT_SEEDS.map((seed: AccountSeed): AccountView =>
            accountView({
                id: accountId(seed.key),
                name: seed.name,
                kind: seed.kind,
                institutionName: seed.institution,
                numberLast4: seed.last4,
                source: 'pluggy',
                transactionCount: counts[accountId(seed.key)] ?? 0,
                lastTransactionDate: '2026-10-01'
            })
        )
    };
}

interface TransactionSeed {
    readonly account: string;
    readonly day: number;
    readonly description: string;
    readonly amountMinor: number;
    readonly category: string | null;
    readonly source: CategorySource;
    readonly counterparty?: string;
}

const CANONICAL_TRANSACTION_SEEDS: readonly TransactionSeed[] = [
    { account: 'itau-checking', day: 5, description: 'SALARIO EMPRESA X', amountMinor: 2800000, category: 'income', source: 'provider' },
    {
        account: 'itau-checking',
        day: 6,
        description: 'ALUGUEL IMOBILIARIA LOPES',
        amountMinor: -650000,
        category: 'housing',
        source: 'provider'
    },
    {
        account: 'itau-checking',
        day: 6,
        description: 'CONDOMINIO EDIFICIO SOL',
        amountMinor: -120000,
        category: 'housing',
        source: 'provider'
    },
    { account: 'itau-checking', day: 7, description: 'COLEGIO ALFA', amountMinor: -320000, category: 'education', source: 'dictionary' },
    { account: 'nubank-card', day: 8, description: 'SMART FIT', amountMinor: -12990, category: 'health', source: 'dictionary' },
    { account: 'itau-checking', day: 8, description: 'UNIMED BH', amountMinor: -125010, category: 'health', source: 'dictionary' },
    { account: 'nubank-card', day: 9, description: 'DROGASIL', amountMinor: -2000, category: 'health', source: 'dictionary' },
    {
        account: 'nubank-card',
        day: 10,
        description: 'PAO DE ACUCAR 1243',
        amountMinor: -41230,
        category: 'groceries',
        source: 'dictionary'
    },
    {
        account: 'itau-checking',
        day: 11,
        description: 'SUPERMERCADO BOM PRECO',
        amountMinor: -248770,
        category: 'groceries',
        source: 'provider'
    },
    {
        account: 'nubank-card',
        day: 12,
        description: 'IFOOD *RESTAURANTE SABOR',
        amountMinor: -8990,
        category: 'eating_out',
        source: 'dictionary'
    },
    { account: 'nubank-card', day: 13, description: 'RAPPI *PEDIDO', amountMinor: -6450, category: 'eating_out', source: 'dictionary' },
    {
        account: 'nubank-card',
        day: 15,
        description: 'RESTAURANTE COCO BAMBU',
        amountMinor: -229560,
        category: 'eating_out',
        source: 'provider'
    },
    { account: 'nubank-card', day: 16, description: 'UBER *TRIP', amountMinor: -3250, category: 'transport', source: 'dictionary' },
    { account: 'nubank-card', day: 17, description: 'SHELL BOX POSTO', amountMinor: -25000, category: 'transport', source: 'dictionary' },
    { account: 'nubank-card', day: 18, description: '99APP *CORRIDA', amountMinor: -101750, category: 'transport', source: 'dictionary' },
    { account: 'nubank-card', day: 19, description: 'CINEMARK SHOPPING', amountMinor: -9600, category: 'leisure', source: 'dictionary' },
    { account: 'nubank-card', day: 20, description: 'INGRESSO COM', amountMinor: -180400, category: 'leisure', source: 'dictionary' },
    { account: 'nubank-card', day: 21, description: 'NETFLIX.COM', amountMinor: -5590, category: 'subscriptions', source: 'dictionary' },
    { account: 'nubank-card', day: 21, description: 'SPOTIFY', amountMinor: -3490, category: 'subscriptions', source: 'dictionary' },
    {
        account: 'nubank-card',
        day: 22,
        description: 'APPLE COM BILL',
        amountMinor: -54920,
        category: 'subscriptions',
        source: 'dictionary'
    },
    { account: 'nubank-card', day: 23, description: 'AMAZON MARKETPLACE', amountMinor: -38900, category: 'shopping', source: 'dictionary' },
    { account: 'nubank-card', day: 24, description: 'MERCADOLIVRE', amountMinor: -196100, category: 'shopping', source: 'dictionary' },
    {
        account: 'itau-checking',
        day: 14,
        description: 'Pix enviado · Maria Souza',
        amountMinor: -35000,
        category: null,
        source: 'none',
        counterparty: 'Maria Souza'
    },
    {
        account: 'itau-checking',
        day: 28,
        description: 'Pix enviado · Maria Souza',
        amountMinor: -45000,
        category: null,
        source: 'none',
        counterparty: 'Maria Souza'
    },
    {
        account: 'itau-checking',
        day: 25,
        description: 'PAGAMENTO FATURA NUBANK',
        amountMinor: -900000,
        category: 'card_payment',
        source: 'dictionary'
    },
    {
        account: 'nubank-card',
        day: 25,
        description: 'PAGAMENTO RECEBIDO',
        amountMinor: 900000,
        category: 'card_payment',
        source: 'dictionary'
    },
    {
        account: 'itau-checking',
        day: 26,
        description: 'APLICACAO CDB',
        amountMinor: -200000,
        category: 'investments',
        source: 'dictionary'
    },
    {
        account: 'itau-checking',
        day: 27,
        description: 'TRANSF MESMA TITULARIDADE',
        amountMinor: -100000,
        category: 'own_transfer',
        source: 'provider'
    },
    {
        account: 'nubank-checking',
        day: 27,
        description: 'TRANSF MESMA TITULARIDADE',
        amountMinor: 100000,
        category: 'own_transfer',
        source: 'provider'
    }
];

function accountNameOf(key: string): string {
    return ACCOUNT_SEEDS.find((seed: AccountSeed): boolean => seed.key === key)?.name ?? key;
}

function seedToTransaction(seed: TransactionSeed, index: number): TransactionView {
    return transactionView({
        id: `tx-${String(index + 1).padStart(3, '0')}`,
        accountId: accountId(seed.account),
        accountName: accountNameOf(seed.account),
        date: `${CANONICAL_MONTH}-${String(seed.day).padStart(2, '0')}`,
        amountMinor: seed.amountMinor,
        description: seed.description,
        counterpartyName: seed.counterparty ?? null,
        categoryId: seed.category === null ? null : categoryId(seed.category),
        categorySource: seed.source,
        source: 'pluggy'
    });
}

function transactionCountsByAccount(): Readonly<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const seed of CANONICAL_TRANSACTION_SEEDS) {
        counts[accountId(seed.account)] = (counts[accountId(seed.account)] ?? 0) + 1;
    }
    return counts;
}

export function transactionView(overrides: Partial<TransactionView> = {}): TransactionView {
    return {
        id: 'tx-001',
        accountId: accountId('itau-checking'),
        accountName: 'Itaú Conta',
        date: `${CANONICAL_MONTH}-14`,
        amountMinor: -35000,
        currency: 'BRL',
        description: 'Pix enviado · Maria Souza',
        counterpartyName: null,
        categoryId: null,
        categorySource: 'none',
        ruleId: null,
        source: 'pluggy',
        installment: null,
        isSample: false,
        ...overrides
    };
}

export function emptyTransactions(): TransactionsResponse {
    return {
        data: [],
        pagination: { page: 1, pageSize: 50, totalRecords: 0, totalPages: 0 },
        totals: { inMinor: 0, outMinor: 0, count: 0 }
    };
}

export function canonicalTransactions(): TransactionsResponse {
    const data: TransactionView[] = CANONICAL_TRANSACTION_SEEDS.map(seedToTransaction).sort(
        (a: TransactionView, b: TransactionView): number => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
    );
    const inMinor: number = data
        .filter((item: TransactionView): boolean => item.amountMinor > 0)
        .reduce((sum: number, item: TransactionView): number => sum + item.amountMinor, 0);
    const outMinor: number = data
        .filter((item: TransactionView): boolean => item.amountMinor < 0)
        .reduce((sum: number, item: TransactionView): number => sum + item.amountMinor, 0);
    return {
        data,
        pagination: { page: 1, pageSize: 50, totalRecords: data.length, totalPages: 1 },
        totals: { inMinor, outMinor, count: data.length }
    };
}

interface SummarySeed {
    readonly key: string;
    readonly spentMinor: number;
    readonly averageMinor: number;
    readonly transactionCount: number;
}

const EXPENSE_SUMMARY_SEEDS: readonly SummarySeed[] = [
    { key: 'housing', spentMinor: 770000, averageMinor: 770000, transactionCount: 2 },
    { key: 'education', spentMinor: 320000, averageMinor: 320000, transactionCount: 1 },
    { key: 'health', spentMinor: 140000, averageMinor: 138000, transactionCount: 3 },
    { key: 'groceries', spentMinor: 290000, averageMinor: 265000, transactionCount: 2 },
    { key: 'eating_out', spentMinor: 245000, averageMinor: 175000, transactionCount: 3 },
    { key: 'transport', spentMinor: 130000, averageMinor: 120000, transactionCount: 3 },
    { key: 'leisure', spentMinor: 190000, averageMinor: 140000, transactionCount: 2 },
    { key: 'subscriptions', spentMinor: 64000, averageMinor: 61000, transactionCount: 3 },
    { key: 'shopping', spentMinor: 235000, averageMinor: 160000, transactionCount: 2 }
];

function summaryRow(seed: SummarySeed): SummaryCategoryRow {
    const category: CategoriesResponse['categories'][number] = systemCategory(seed.key);
    return {
        categoryId: category.id,
        systemKey: seed.key,
        name: null,
        icon: category.icon,
        flexibility: category.flexibility,
        spentMinor: seed.spentMinor,
        averageMinor: seed.averageMinor,
        deltaBps: Math.round(((seed.spentMinor - seed.averageMinor) * 10000) / seed.averageMinor),
        isNew: false,
        transactionCount: seed.transactionCount
    };
}

export function emptySummary(month: string = CURRENT_MONTH, overrides: Partial<MonthlySummary> = {}): MonthlySummary {
    return {
        month,
        isPartial: month === CURRENT_MONTH,
        hasData: false,
        currency: 'BRL',
        previousMonth: null,
        nextMonth: null,
        availableMonths: [],
        income: { minor: 0, mode: 'transactions', fromTransactionsMinor: 0 },
        expensesMinor: 0,
        uncategorizedMinor: 0,
        uncategorizedCount: 0,
        uncategorizedInflowMinor: 0,
        savedMinor: 0,
        savingsRateBps: null,
        goal: { bps: 2000, minor: 0 },
        gapMinor: 0,
        fixedMinor: 0,
        fixedShareBps: null,
        flexibleMinor: 0,
        transfersOutMinor: 0,
        averageMonths: 0,
        excludedCurrencyCount: 0,
        categories: [],
        incomeCategories: [],
        ...overrides
    };
}

export function canonicalSummary(overrides: Partial<MonthlySummary> = {}): MonthlySummary {
    const income: CategoriesResponse['categories'][number] = systemCategory('income');
    return emptySummary(CANONICAL_MONTH, {
        isPartial: false,
        hasData: true,
        previousMonth: '2026-08',
        nextMonth: CURRENT_MONTH,
        availableMonths: ['2026-06', '2026-07', '2026-08', CANONICAL_MONTH, CURRENT_MONTH],
        income: { minor: CANONICAL_INCOME_MINOR, mode: 'transactions', fromTransactionsMinor: CANONICAL_INCOME_MINOR },
        expensesMinor: 2464000,
        uncategorizedMinor: CANONICAL_UNCATEGORIZED_MINOR,
        uncategorizedCount: 2,
        savedMinor: CANONICAL_SAVED_MINOR,
        savingsRateBps: 1200,
        goal: { bps: 2000, minor: 560000 },
        gapMinor: 224000,
        fixedMinor: 1230000,
        fixedShareBps: 4393,
        flexibleMinor: 1154000,
        transfersOutMinor: 1200000,
        averageMonths: 3,
        categories: [...EXPENSE_SUMMARY_SEEDS]
            .sort((first: SummarySeed, second: SummarySeed): number => second.spentMinor - first.spentMinor)
            .map(summaryRow),
        incomeCategories: [
            {
                categoryId: income.id,
                systemKey: 'income',
                name: null,
                icon: income.icon,
                flexibility: null,
                spentMinor: CANONICAL_INCOME_MINOR,
                averageMinor: CANONICAL_INCOME_MINOR,
                deltaBps: 0,
                isNew: false,
                transactionCount: 1
            }
        ],
        ...overrides
    });
}

export type CutsCase = 'goal20' | 'goal35' | 'goal60' | 'goal10' | 'pixLeisure';

const FLEXIBLE_SEEDS: readonly SummarySeed[] = EXPENSE_SUMMARY_SEEDS.filter(
    (seed: SummarySeed): boolean => systemCategory(seed.key).flexibility === 'flexible'
);

function suggestion(key: string, cutMinor: number, spentMinor?: number): CutSuggestion {
    const seed: SummarySeed | undefined = FLEXIBLE_SEEDS.find((item: SummarySeed): boolean => item.key === key);
    if (seed === undefined) {
        throw new Error(`unknown flexible category ${key}`);
    }
    const spent: number = spentMinor ?? seed.spentMinor;
    const category: CategoriesResponse['categories'][number] = systemCategory(key);
    return {
        categoryId: category.id,
        systemKey: key,
        name: null,
        icon: category.icon,
        spentMinor: spent,
        averageMinor: seed.averageMinor,
        excessMinor: Math.max(0, spent - seed.averageMinor),
        cutMinor,
        limitMinor: spent - cutMinor
    };
}

function cutsBase(overrides: Partial<CutsResponse>): CutsResponse {
    return {
        month: CANONICAL_MONTH,
        limitMonth: CURRENT_MONTH,
        isPartial: false,
        status: 'cut_suggested',
        goal: { bps: 2000, minor: 560000, simulated: false },
        incomeMinor: CANONICAL_INCOME_MINOR,
        savedMinor: CANONICAL_SAVED_MINOR,
        savingsRateBps: 1200,
        gapMinor: 224000,
        surplusMinor: 0,
        totalCutMinor: 224000,
        flexibleTotalMinor: 1154000,
        excessTotalMinor: 233000,
        categoriesWithCut: 6,
        uncategorizedMinor: CANONICAL_UNCATEGORIZED_MINOR,
        averageMonths: 3,
        suggestions: [],
        ...overrides
    };
}

const CUTS_BY_CASE: Readonly<Record<CutsCase, () => CutsResponse>> = {
    goal20: (): CutsResponse =>
        cutsBase({
            suggestions: [
                suggestion('shopping', 72103),
                suggestion('eating_out', 67296),
                suggestion('leisure', 48069),
                suggestion('groceries', 24034),
                suggestion('transport', 9614),
                suggestion('subscriptions', 2884)
            ]
        }),
    goal35: (): CutsResponse =>
        cutsBase({
            goal: { bps: 3500, minor: 980000, simulated: true },
            gapMinor: 644000,
            totalCutMinor: 644000,
            suggestions: [
                suggestion('shopping', 158696),
                suggestion('eating_out', 157257),
                suggestion('groceries', 128284),
                suggestion('leisure', 117669),
                suggestion('transport', 56300),
                suggestion('subscriptions', 25794)
            ]
        }),
    goal60: (): CutsResponse =>
        cutsBase({
            status: 'exceeds_flexible',
            goal: { bps: 6000, minor: 1680000, simulated: true },
            gapMinor: 1344000,
            totalCutMinor: 1154000,
            suggestions: FLEXIBLE_SEEDS.map((seed: SummarySeed): CutSuggestion => suggestion(seed.key, seed.spentMinor)).sort(
                (a: CutSuggestion, b: CutSuggestion): number => b.cutMinor - a.cutMinor
            )
        }),
    goal10: (): CutsResponse =>
        cutsBase({
            status: 'goal_met',
            goal: { bps: 1000, minor: 280000, simulated: true },
            gapMinor: 0,
            surplusMinor: 56000,
            totalCutMinor: 0,
            categoriesWithCut: 0,
            suggestions: FLEXIBLE_SEEDS.map((seed: SummarySeed): CutSuggestion => suggestion(seed.key, 0)).sort(
                (a: CutSuggestion, b: CutSuggestion): number => b.spentMinor - a.spentMinor
            )
        }),
    pixLeisure: (): CutsResponse =>
        cutsBase({
            flexibleTotalMinor: 1234000,
            excessTotalMinor: 313000,
            uncategorizedMinor: 0,
            suggestions: [
                suggestion('leisure', 93035, 270000),
                suggestion('shopping', 53674),
                suggestion('eating_out', 50096),
                suggestion('groceries', 17891),
                suggestion('transport', 7157),
                suggestion('subscriptions', 2147)
            ]
        })
};

export function canonicalCuts(kind: CutsCase = 'goal20'): CutsResponse {
    return CUTS_BY_CASE[kind]();
}

export function emptyCuts(month: string = CURRENT_MONTH, overrides: Partial<CutsResponse> = {}): CutsResponse {
    return cutsBase({
        month,
        limitMonth: '2026-11',
        isPartial: month === CURRENT_MONTH,
        status: 'no_data',
        incomeMinor: 0,
        savedMinor: 0,
        savingsRateBps: null,
        gapMinor: 0,
        totalCutMinor: 0,
        flexibleTotalMinor: 0,
        excessTotalMinor: 0,
        categoriesWithCut: 0,
        uncategorizedMinor: 0,
        averageMonths: 0,
        goal: { bps: 2000, minor: 0, simulated: false },
        ...overrides
    });
}

export function notConfiguredCredentials(): CredentialsView {
    return { configured: false, clientIdHint: null, status: null, lastVerifiedAt: null, updatedAt: null };
}

export function validCredentials(overrides: Partial<CredentialsView> = {}): CredentialsView {
    return {
        configured: true,
        clientIdHint: '••••c0de',
        status: 'valid',
        lastVerifiedAt: CREATED_AT,
        updatedAt: CREATED_AT,
        ...overrides
    };
}

export function connectionView(overrides: Partial<ConnectionView> = {}): ConnectionView {
    return {
        id: 'conn-itau',
        itemIdHint: '••••0001',
        connectorName: 'Itaú',
        status: 'active',
        statusReason: null,
        consentExpiresAt: '2027-01-10T12:00:00.000Z',
        lastSyncAt: CREATED_AT,
        lastSuccessAt: CREATED_AT,
        syncing: false,
        accounts: [{ accountId: accountId('itau-checking'), name: 'Itaú Conta', kind: 'checking', numberLast4: '1098' }],
        lastRun: { trigger: 'daily', status: 'succeeded', startedAt: CREATED_AT, finishedAt: CREATED_AT, inserted: 12, failureCode: null },
        ...overrides
    };
}

export function canonicalConnections(): ConnectionsResponse {
    return {
        credentials: validCredentials(),
        connections: [
            connectionView(),
            connectionView({
                id: 'conn-nubank',
                itemIdHint: '••••0002',
                connectorName: 'Nubank',
                status: 'needs_attention',
                statusReason: 'login_error',
                lastSuccessAt: null,
                accounts: [
                    { accountId: accountId('nubank-card'), name: 'Nubank Cartão', kind: 'credit_card', numberLast4: '4321' },
                    { accountId: accountId('nubank-checking'), name: 'Nubank Conta', kind: 'checking', numberLast4: '8765' }
                ],
                lastRun: {
                    trigger: 'daily',
                    status: 'failed',
                    startedAt: CREATED_AT,
                    finishedAt: CREATED_AT,
                    inserted: 0,
                    failureCode: 'login_error'
                }
            })
        ]
    };
}

export function emptyConnections(): ConnectionsResponse {
    return { credentials: notConfiguredCredentials(), connections: [] };
}

export function ofxPreview(overrides: Partial<ImportPreview> = {}): ImportPreview {
    return {
        detectedFormat: 'ofx',
        format: 'ofx',
        fileName: 'vera-qa-nubank-cartao.ofx',
        rows: 6,
        rejected: 0,
        rejections: [],
        periodStart: '2026-09-02',
        periodEnd: '2026-09-27',
        currency: 'BRL',
        sample: [
            { date: '2026-09-02', description: 'UBER *TRIP', amountMinor: -3250 },
            { date: '2026-09-05', description: 'NETFLIX.COM', amountMinor: -5590 },
            { date: '2026-09-12', description: 'IFOOD *RESTAURANTE SABOR', amountMinor: -8990 },
            { date: '2026-09-18', description: '99APP *CORRIDA', amountMinor: -101750 },
            { date: '2026-09-25', description: 'PAGAMENTO RECEBIDO', amountMinor: 900000 },
            { date: '2026-09-27', description: 'SPOTIFY', amountMinor: -3490 }
        ],
        columns: null,
        accountHint: { institution: 'Nubank', numberLast4: '4321' },
        suggestedAccountId: accountId('nubank-card'),
        alreadyImportedAt: null,
        ...overrides
    };
}

export function importView(overrides: Partial<ImportView> = {}): ImportView {
    return {
        id: 'imp-1',
        accountId: accountId('nubank-card'),
        accountName: 'Nubank Cartão',
        format: 'ofx',
        fileName: 'vera-qa-nubank-cartao.ofx',
        rows: 6,
        inserted: 4,
        duplicates: 2,
        rejected: 0,
        periodStart: '2026-09-02',
        periodEnd: '2026-09-27',
        status: 'completed',
        createdAt: CREATED_AT,
        ...overrides
    };
}

export function emptyImports(): ImportsResponse {
    return { data: [], pagination: { page: 1, pageSize: 20, totalRecords: 0, totalPages: 0 } };
}
