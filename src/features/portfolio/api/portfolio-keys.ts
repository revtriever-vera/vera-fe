export interface CatalogSearchParams {
    readonly group: string;
    readonly q: string;
}

export interface FixedIncomePreviewInput {
    readonly [field: string]: string | number | boolean | null;
}

export const portfolioKeys: {
    all: readonly ['portfolio'];
    settings: () => readonly ['portfolio', 'settings'];
    classes: () => readonly ['portfolio', 'classes'];
    holdings: () => readonly ['portfolio', 'holdings'];
    overview: () => readonly ['portfolio', 'overview'];
    classDetails: () => readonly ['portfolio', 'class-detail'];
    classDetail: (classId: string) => readonly ['portfolio', 'class-detail', string];
    catalogSearch: (params: CatalogSearchParams) => readonly ['portfolio', 'catalog-search', CatalogSearchParams];
    quotes: (ids: readonly string[]) => readonly ['portfolio', 'quotes', readonly string[]];
    exchangeRate: (currency: string) => readonly ['portfolio', 'exchange-rate', string];
    fixedIncomePreview: (input: FixedIncomePreviewInput) => readonly ['portfolio', 'fixed-income-preview', FixedIncomePreviewInput];
    position: (id: string) => readonly ['portfolio', 'position', string];
    contributions: () => readonly ['portfolio', 'contribution'];
    contribution: (amount: number) => readonly ['portfolio', 'contribution', number];
} = {
    all: ['portfolio'] as const,
    settings: (): readonly ['portfolio', 'settings'] => [...portfolioKeys.all, 'settings'] as const,
    classes: (): readonly ['portfolio', 'classes'] => [...portfolioKeys.all, 'classes'] as const,
    holdings: (): readonly ['portfolio', 'holdings'] => [...portfolioKeys.all, 'holdings'] as const,
    overview: (): readonly ['portfolio', 'overview'] => [...portfolioKeys.all, 'overview'] as const,
    classDetails: (): readonly ['portfolio', 'class-detail'] => [...portfolioKeys.all, 'class-detail'] as const,
    classDetail: (classId: string): readonly ['portfolio', 'class-detail', string] => [...portfolioKeys.classDetails(), classId] as const,
    catalogSearch: (params: CatalogSearchParams): readonly ['portfolio', 'catalog-search', CatalogSearchParams] =>
        [...portfolioKeys.all, 'catalog-search', params] as const,
    quotes: (ids: readonly string[]): readonly ['portfolio', 'quotes', readonly string[]] => [...portfolioKeys.all, 'quotes', ids] as const,
    exchangeRate: (currency: string): readonly ['portfolio', 'exchange-rate', string] =>
        [...portfolioKeys.all, 'exchange-rate', currency] as const,
    fixedIncomePreview: (input: FixedIncomePreviewInput): readonly ['portfolio', 'fixed-income-preview', FixedIncomePreviewInput] =>
        [...portfolioKeys.all, 'fixed-income-preview', input] as const,
    position: (id: string): readonly ['portfolio', 'position', string] => [...portfolioKeys.all, 'position', id] as const,
    contributions: (): readonly ['portfolio', 'contribution'] => [...portfolioKeys.all, 'contribution'] as const,
    contribution: (amount: number): readonly ['portfolio', 'contribution', number] => [...portfolioKeys.contributions(), amount] as const
};
