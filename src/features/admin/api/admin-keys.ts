export const adminKeys: {
    all: readonly ['admin'];
    audit: (limit: number) => readonly ['admin', 'audit', number];
    signupLinks: () => readonly ['admin', 'signup-links'];
} = {
    all: ['admin'] as const,
    audit: (limit: number): readonly ['admin', 'audit', number] => [...adminKeys.all, 'audit', limit] as const,
    signupLinks: (): readonly ['admin', 'signup-links'] => [...adminKeys.all, 'signup-links'] as const
};
