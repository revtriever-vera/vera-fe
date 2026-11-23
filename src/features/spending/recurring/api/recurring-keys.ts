export const recurringKeys: {
    all: readonly ['recurring'];
    overview: () => readonly ['recurring', 'overview'];
} = {
    all: ['recurring'] as const,
    overview: (): readonly ['recurring', 'overview'] => [...recurringKeys.all, 'overview'] as const
};
