export const authKeys: {
    all: readonly ['auth'];
    login: (provider: string) => readonly ['auth', 'login', string];
} = {
    all: ['auth'] as const,
    login: (provider: string): readonly ['auth', 'login', string] => [...authKeys.all, 'login', provider] as const
};
