export const adminKeys: {
    all: readonly ['admin'];
    audit: (limit: number) => readonly ['admin', 'audit', number];
    signupLinks: () => readonly ['admin', 'signup-links'];
    overview: () => readonly ['admin', 'overview'];
    accounts: (page: number, search: string) => readonly ['admin', 'accounts', number, string];
} = {
    all: ['admin'] as const,
    audit: (limit: number): readonly ['admin', 'audit', number] => [...adminKeys.all, 'audit', limit] as const,
    signupLinks: (): readonly ['admin', 'signup-links'] => [...adminKeys.all, 'signup-links'] as const,
    overview: (): readonly ['admin', 'overview'] => [...adminKeys.all, 'overview'] as const,
    accounts: (page: number, search: string): readonly ['admin', 'accounts', number, string] =>
        [...adminKeys.all, 'accounts', page, search] as const
};
