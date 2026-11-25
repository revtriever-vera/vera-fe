export const investmentImportsKeys: {
    all: readonly ['portfolio', 'investment-imports'];
    list: (page: number) => readonly ['portfolio', 'investment-imports', 'list', number];
} = {
    all: ['portfolio', 'investment-imports'] as const,
    list: (page: number): readonly ['portfolio', 'investment-imports', 'list', number] =>
        [...investmentImportsKeys.all, 'list', page] as const
};
