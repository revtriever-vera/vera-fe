export interface PendingPathItem<Body> {
    parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
    };
    get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    'application/json': Body;
                };
            };
        };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
}

export interface PendingHoldingView {
    kind: 'position' | 'fixed_income';
    id: string;
    assetId: string | null;
    symbol: string;
    name: string;
    market: 'B3' | 'US' | 'CRYPTO' | 'TESOURO' | null;
    typeGroup: 'fixed_income' | 'tesouro' | 'acoes_br' | 'fii' | 'acoes_eua' | 'reits' | 'cripto';
    classId: string;
    quantity: string | null;
    quantityDecimals: number | null;
    unitPrice: string | null;
    priceCurrency: string | null;
    nativeValueMinor: number;
    nativeCurrency: 'BRL' | 'USD';
    valueMinor: number;
    valueSource:
        'brapi' | 'finnhub' | 'twelvedata' | 'alphavantage' | 'coingecko' | 'tesouro_direto' | 'curve_cdi' | 'curve_pre' | 'curve_ipca';
    priceDate: string | null;
    dollarExposure: boolean;
    missingQuote: boolean;
    stale: boolean;
    estimated: boolean;
    matured: boolean;
    missingRate: boolean;
}

export interface PendingHoldingsResponse {
    baseCurrency: 'BRL' | 'USD';
    asOf: string;
    data: PendingHoldingView[];
}

export interface PendingOverviewClass {
    classId: string;
    systemKey: string | null;
    name: string | null;
    colorKey: string;
    valueMinor: number;
    shareBps: number;
    targetBps: number;
    deviationBps: number;
    status: 'within' | 'above' | 'below';
    gapMinor: number;
    holdingsCount: number;
}

export interface PendingOverview {
    baseCurrency: 'BRL' | 'USD';
    asOf: string;
    toleranceBps: number;
    empty: boolean;
    totalMinor: number;
    unclassifiedMinor: number;
    dollarExposure: {
        valueMinor: number;
        shareBps: number;
    };
    usdRate: {
        brlPerUnit: string;
        date: string;
        source: string;
    } | null;
    classes: PendingOverviewClass[];
    outsideCount: number;
    largestDeviation: {
        classId: string;
        deviationBps: number;
        gapMinor: number;
        status: 'within' | 'above' | 'below';
    } | null;
    quality: {
        missingQuotes: number;
        staleQuotes: number;
        estimatedFixedIncome: number;
        indexDataMissing: number;
        missingRates: number;
    };
}

export interface PendingPaths {
    '/portfolio/holdings': PendingPathItem<PendingHoldingsResponse>;
    '/portfolio/overview': PendingPathItem<PendingOverview>;
}
