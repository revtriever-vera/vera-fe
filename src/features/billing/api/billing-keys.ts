export const billingKeys: {
    all: readonly ['billing'];
    me: () => readonly ['billing', 'me'];
} = {
    all: ['billing'] as const,
    me: (): readonly ['billing', 'me'] => [...billingKeys.all, 'me'] as const
};
