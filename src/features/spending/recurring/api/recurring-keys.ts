export const recurringKeys: {
    all: readonly ['recurring'];
    overview: () => readonly ['recurring', 'overview'];
    calendar: (days: number) => readonly ['recurring', 'calendar', number];
} = {
    all: ['recurring'] as const,
    overview: (): readonly ['recurring', 'overview'] => [...recurringKeys.all, 'overview'] as const,
    calendar: (days: number): readonly ['recurring', 'calendar', number] => [...recurringKeys.all, 'calendar', days] as const
};
