export const adminKeys: {
    all: readonly ['admin'];
    audit: (limit: number) => readonly ['admin', 'audit', number];
} = {
    all: ['admin'] as const,
    audit: (limit: number): readonly ['admin', 'audit', number] => [...adminKeys.all, 'audit', limit] as const
};
