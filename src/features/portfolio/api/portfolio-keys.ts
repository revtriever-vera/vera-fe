export interface CatalogSearchParams {
    readonly group: string;
    readonly q: string;
}

export interface IssuerSearchParams {
    readonly kind: string;
    readonly q: string;
}

export interface FgcSimulationInput {
    readonly [field: string]: string | number | boolean | null;
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
    concentration: () => readonly ['portfolio', 'concentration'];
    classDetails: () => readonly ['portfolio', 'class-detail'];
    classDetail: (classId: string) => readonly ['portfolio', 'class-detail', string];
    catalogSearch: (params: CatalogSearchParams) => readonly ['portfolio', 'catalog-search', CatalogSearchParams];
    quotes: (ids: readonly string[]) => readonly ['portfolio', 'quotes', readonly string[]];
    exchangeRate: (currency: string) => readonly ['portfolio', 'exchange-rate', string];
    fixedIncomePreview: (input: FixedIncomePreviewInput) => readonly ['portfolio', 'fixed-income-preview', FixedIncomePreviewInput];
    issuerSearch: (params: IssuerSearchParams) => readonly ['portfolio', 'issuer-search', IssuerSearchParams];
    fgcSimulation: (input: FgcSimulationInput) => readonly ['portfolio', 'fgc-simulation', FgcSimulationInput];
    position: (id: string) => readonly ['portfolio', 'position', string];
    fixedIncomeTitle: (id: string) => readonly ['portfolio', 'fixed-income-title', string];
    contributions: () => readonly ['portfolio', 'contribution'];
    contribution: (amount: number) => readonly ['portfolio', 'contribution', number];
    fgc: () => readonly ['portfolio', 'fgc'];
    maturities: () => readonly ['portfolio', 'maturities'];
    realRates: () => readonly ['portfolio', 'real-rates'];
} = {
    all: ['portfolio'] as const,
    settings: (): readonly ['portfolio', 'settings'] => [...portfolioKeys.all, 'settings'] as const,
    classes: (): readonly ['portfolio', 'classes'] => [...portfolioKeys.all, 'classes'] as const,
    holdings: (): readonly ['portfolio', 'holdings'] => [...portfolioKeys.all, 'holdings'] as const,
    overview: (): readonly ['portfolio', 'overview'] => [...portfolioKeys.all, 'overview'] as const,
    concentration: (): readonly ['portfolio', 'concentration'] => [...portfolioKeys.all, 'concentration'] as const,
    classDetails: (): readonly ['portfolio', 'class-detail'] => [...portfolioKeys.all, 'class-detail'] as const,
    classDetail: (classId: string): readonly ['portfolio', 'class-detail', string] => [...portfolioKeys.classDetails(), classId] as const,
    catalogSearch: (params: CatalogSearchParams): readonly ['portfolio', 'catalog-search', CatalogSearchParams] =>
        [...portfolioKeys.all, 'catalog-search', params] as const,
    quotes: (ids: readonly string[]): readonly ['portfolio', 'quotes', readonly string[]] => [...portfolioKeys.all, 'quotes', ids] as const,
    exchangeRate: (currency: string): readonly ['portfolio', 'exchange-rate', string] =>
        [...portfolioKeys.all, 'exchange-rate', currency] as const,
    fixedIncomePreview: (input: FixedIncomePreviewInput): readonly ['portfolio', 'fixed-income-preview', FixedIncomePreviewInput] =>
        [...portfolioKeys.all, 'fixed-income-preview', input] as const,
    issuerSearch: (params: IssuerSearchParams): readonly ['portfolio', 'issuer-search', IssuerSearchParams] =>
        [...portfolioKeys.all, 'issuer-search', params] as const,
    fgcSimulation: (input: FgcSimulationInput): readonly ['portfolio', 'fgc-simulation', FgcSimulationInput] =>
        [...portfolioKeys.all, 'fgc-simulation', input] as const,
    position: (id: string): readonly ['portfolio', 'position', string] => [...portfolioKeys.all, 'position', id] as const,
    fixedIncomeTitle: (id: string): readonly ['portfolio', 'fixed-income-title', string] =>
        [...portfolioKeys.all, 'fixed-income-title', id] as const,
    contributions: (): readonly ['portfolio', 'contribution'] => [...portfolioKeys.all, 'contribution'] as const,
    contribution: (amount: number): readonly ['portfolio', 'contribution', number] => [...portfolioKeys.contributions(), amount] as const,
    fgc: (): readonly ['portfolio', 'fgc'] => [...portfolioKeys.all, 'fgc'] as const,
    maturities: (): readonly ['portfolio', 'maturities'] => [...portfolioKeys.all, 'maturities'] as const,
    realRates: (): readonly ['portfolio', 'real-rates'] => [...portfolioKeys.all, 'real-rates'] as const
};
