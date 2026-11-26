export const reviewKeys: {
    all: readonly ['portfolio-review'];
    list: () => readonly ['portfolio-review', 'list'];
    month: (month: string) => readonly ['portfolio-review', 'month', string];
} = {
    all: ['portfolio-review'] as const,
    list: (): readonly ['portfolio-review', 'list'] => [...reviewKeys.all, 'list'] as const,
    month: (month: string): readonly ['portfolio-review', 'month', string] => [...reviewKeys.all, 'month', month] as const
};
