export const noticesKeys: {
    all: readonly ['notices'];
    preferences: () => readonly ['notices', 'preferences'];
} = {
    all: ['notices'] as const,
    preferences: (): readonly ['notices', 'preferences'] => [...noticesKeys.all, 'preferences'] as const
};
