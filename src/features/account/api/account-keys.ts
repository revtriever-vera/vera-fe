export const accountKeys: {
    all: readonly ['account'];
    preferences: () => readonly ['account', 'preferences'];
    export: () => readonly ['account', 'export'];
    erasure: () => readonly ['account', 'erasure'];
    supportAccess: () => readonly ['account', 'support-access'];
} = {
    all: ['account'] as const,
    preferences: (): readonly ['account', 'preferences'] => [...accountKeys.all, 'preferences'] as const,
    export: (): readonly ['account', 'export'] => [...accountKeys.all, 'export'] as const,
    erasure: (): readonly ['account', 'erasure'] => [...accountKeys.all, 'erasure'] as const,
    supportAccess: (): readonly ['account', 'support-access'] => [...accountKeys.all, 'support-access'] as const
};
