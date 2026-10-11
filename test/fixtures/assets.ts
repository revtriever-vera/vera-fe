import type { CatalogAsset, ExchangeRateView, FixedIncomePreview, PositionView, Quote, TitleView } from '@/features/portfolio/assets/types';

export function catalogAsset(overrides: Partial<CatalogAsset> = {}): CatalogAsset {
    return {
        id: 'asset-itub4',
        symbol: 'ITUB4',
        name: 'Itaú Unibanco PN',
        market: 'B3',
        kind: 'stock',
        typeGroup: 'acoes_br',
        currency: 'BRL',
        suggestedClassKey: 'acoes_br',
        dollarExposure: false,
        quantityDecimals: 0,
        maturityDate: null,
        ...overrides
    };
}

export const IVVB11: CatalogAsset = catalogAsset({
    id: 'asset-ivvb11',
    symbol: 'IVVB11',
    name: 'iShares S&P 500',
    kind: 'etf',
    typeGroup: 'acoes_eua',
    suggestedClassKey: 'acoes_eua',
    dollarExposure: true
});

export const UNMAPPED_ETF: CatalogAsset = catalogAsset({
    id: 'asset-xyz11',
    symbol: 'XYZ11',
    name: 'ETF sem mapa',
    kind: 'etf',
    suggestedClassKey: null
});

export const TESOURO: CatalogAsset = catalogAsset({
    id: 'asset-tesouro',
    symbol: 'Tesouro Selic 2029',
    name: 'Tesouro Direto',
    market: 'TESOURO',
    kind: 'treasury',
    typeGroup: 'tesouro',
    suggestedClassKey: 'rf_pos',
    quantityDecimals: 2,
    maturityDate: '2029-03-01'
});

export const BITCOIN: CatalogAsset = catalogAsset({
    id: 'asset-btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    market: 'CRYPTO',
    kind: 'crypto',
    typeGroup: 'cripto',
    currency: 'USD',
    suggestedClassKey: 'cripto',
    quantityDecimals: 8
});

export function quote(assetId: string, price: string, overrides: Partial<Quote> = {}): Quote {
    return { assetId, price, currency: 'BRL', priceDate: '2026-10-09', source: 'brapi', stale: false, ...overrides };
}

export function exchangeRate(overrides: Partial<ExchangeRateView> = {}): ExchangeRateView {
    return { currency: 'USD', brlPerUnit: '5.42', date: '2026-10-09', source: 'ptax', ...overrides };
}

export function positionView(overrides: Partial<PositionView> = {}): PositionView {
    return {
        id: 'position-itub4',
        assetId: 'asset-itub4',
        quantity: '2000',
        averagePrice: null,
        classId: 'class-acoes-br',
        createdAt: '2026-10-01T12:00:00.000Z',
        updatedAt: '2026-10-01T12:00:00.000Z',
        ...overrides
    };
}

export function previewResult(overrides: Partial<FixedIncomePreview> = {}): FixedIncomePreview {
    return {
        asOf: '2026-10-09',
        valueMinor: 6125000,
        currency: 'BRL',
        accruedBps: 2250,
        matured: false,
        estimated: true,
        status: 'ok',
        source: 'curve_cdi',
        taxRegime: 'regressive',
        taxEstimatedMinor: 100000,
        netEstimatedMinor: 6025000,
        ...overrides
    };
}

export function titleView(overrides: Partial<TitleView> = {}): TitleView {
    return {
        id: 'title-1',
        kind: 'cdb',
        name: 'CDB Banco XP',
        indexer: 'cdi_percent',
        rateBps: 11000,
        currency: 'BRL',
        appliedMinor: 5000000,
        appliedAt: '2025-03-10',
        maturityDate: '2028-03-10',
        classId: 'class-rf-pos',
        createdAt: '2026-10-09T12:00:00.000Z',
        updatedAt: '2026-10-09T12:00:00.000Z',
        valuation: previewResult(),
        ...overrides
    };
}
