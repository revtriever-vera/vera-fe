export const recurringKeys: {
    all: readonly ['recurring'];
    overview: () => readonly ['recurring', 'overview'];
    calendar: (days: number) => readonly ['recurring', 'calendar', number];
    noticeBefore: () => readonly ['recurring', 'notice-before'];
} = {
    all: ['recurring'] as const,
    overview: (): readonly ['recurring', 'overview'] => [...recurringKeys.all, 'overview'] as const,
    calendar: (days: number): readonly ['recurring', 'calendar', number] => [...recurringKeys.all, 'calendar', days] as const,
    noticeBefore: (): readonly ['recurring', 'notice-before'] => [...recurringKeys.all, 'notice-before'] as const
};
