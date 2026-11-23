export const authKeys: {
    all: readonly ['auth'];
    login: (provider: string) => readonly ['auth', 'login', string];
    totp: (step: string) => readonly ['auth', 'totp', string];
    invite: (token: string) => readonly ['auth', 'invite', string];
    offer: (token: string) => readonly ['auth', 'offer', string];
} = {
    all: ['auth'] as const,
    login: (provider: string): readonly ['auth', 'login', string] => [...authKeys.all, 'login', provider] as const,
    totp: (step: string): readonly ['auth', 'totp', string] => [...authKeys.all, 'totp', step] as const,
    invite: (token: string): readonly ['auth', 'invite', string] => [...authKeys.all, 'invite', token] as const,
    offer: (token: string): readonly ['auth', 'offer', string] => [...authKeys.all, 'offer', token] as const
};
