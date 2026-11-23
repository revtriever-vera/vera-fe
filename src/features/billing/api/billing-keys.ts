export const billingKeys: {
    all: readonly ['billing'];
    me: () => readonly ['billing', 'me'];
    invoices: (page: number) => readonly ['billing', 'invoices', number];
} = {
    all: ['billing'] as const,
    me: (): readonly ['billing', 'me'] => [...billingKeys.all, 'me'] as const,
    invoices: (page: number): readonly ['billing', 'invoices', number] => [...billingKeys.all, 'invoices', page] as const
};
