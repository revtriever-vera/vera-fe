export const authKeys: {
    all: readonly ['auth'];
    login: (provider: string) => readonly ['auth', 'login', string];
    invite: (token: string) => readonly ['auth', 'invite', string];
} = {
    all: ['auth'] as const,
    login: (provider: string): readonly ['auth', 'login', string] => [...authKeys.all, 'login', provider] as const,
    invite: (token: string): readonly ['auth', 'invite', string] => [...authKeys.all, 'invite', token] as const
};
