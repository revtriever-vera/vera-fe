const ANY_HOLDER: string = 'any';

export const changesKeys: {
    all: readonly ['portfolio-changes'];
    window: (days: string, holder: string | undefined) => readonly ['portfolio-changes', string, string];
} = {
    all: ['portfolio-changes'] as const,
    window: (days: string, holder: string | undefined): readonly ['portfolio-changes', string, string] =>
        [...changesKeys.all, days, holder ?? ANY_HOLDER] as const
};
