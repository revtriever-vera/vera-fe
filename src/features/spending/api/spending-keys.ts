import type { RulePreviewInput, TransactionsQuery } from '../types';

export const spendingKeys: {
    all: readonly ['spending'];
    categories: () => readonly ['spending', 'categories'];
    rules: () => readonly ['spending', 'rules'];
    rulePreview: (input: RulePreviewInput) => readonly ['spending', 'rule-preview', RulePreviewInput];
    accounts: () => readonly ['spending', 'accounts'];
    transactionLists: () => readonly ['spending', 'transactions'];
    transactions: (filters: TransactionsQuery) => readonly ['spending', 'transactions', TransactionsQuery];
    uncategorizedCount: () => readonly ['spending', 'uncategorized-count'];
    summaries: () => readonly ['spending', 'summary'];
    summary: (month: string | null) => readonly ['spending', 'summary', string | null];
    settings: () => readonly ['spending', 'settings'];
    cutsList: () => readonly ['spending', 'cuts'];
    cuts: (month: string | null, goalBps: number | null) => readonly ['spending', 'cuts', string | null, number | null];
    connections: () => readonly ['spending', 'connections'];
    credentials: () => readonly ['spending', 'credentials'];
    importLists: () => readonly ['spending', 'imports'];
    imports: (page: number) => readonly ['spending', 'imports', number];
} = {
    all: ['spending'] as const,
    categories: (): readonly ['spending', 'categories'] => [...spendingKeys.all, 'categories'] as const,
    rules: (): readonly ['spending', 'rules'] => [...spendingKeys.all, 'rules'] as const,
    rulePreview: (input: RulePreviewInput): readonly ['spending', 'rule-preview', RulePreviewInput] =>
        [...spendingKeys.all, 'rule-preview', input] as const,
    accounts: (): readonly ['spending', 'accounts'] => [...spendingKeys.all, 'accounts'] as const,
    transactionLists: (): readonly ['spending', 'transactions'] => [...spendingKeys.all, 'transactions'] as const,
    transactions: (filters: TransactionsQuery): readonly ['spending', 'transactions', TransactionsQuery] =>
        [...spendingKeys.transactionLists(), filters] as const,
    uncategorizedCount: (): readonly ['spending', 'uncategorized-count'] => [...spendingKeys.all, 'uncategorized-count'] as const,
    summaries: (): readonly ['spending', 'summary'] => [...spendingKeys.all, 'summary'] as const,
    summary: (month: string | null): readonly ['spending', 'summary', string | null] => [...spendingKeys.summaries(), month] as const,
    settings: (): readonly ['spending', 'settings'] => [...spendingKeys.all, 'settings'] as const,
    cutsList: (): readonly ['spending', 'cuts'] => [...spendingKeys.all, 'cuts'] as const,
    cuts: (month: string | null, goalBps: number | null): readonly ['spending', 'cuts', string | null, number | null] =>
        [...spendingKeys.cutsList(), month, goalBps] as const,
    connections: (): readonly ['spending', 'connections'] => [...spendingKeys.all, 'connections'] as const,
    credentials: (): readonly ['spending', 'credentials'] => [...spendingKeys.all, 'credentials'] as const,
    importLists: (): readonly ['spending', 'imports'] => [...spendingKeys.all, 'imports'] as const,
    imports: (page: number): readonly ['spending', 'imports', number] => [...spendingKeys.importLists(), page] as const
};
