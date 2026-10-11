import type {
    AssetClassView,
    ClassesResponse,
    DeviationStatus,
    HoldingView,
    HoldingsResponse,
    Overview,
    OverviewClass,
    PortfolioSettings
} from '@/features/portfolio/types';

export const SAMPLE_AS_OF: string = '2026-10-09T12:00:00.000Z';
export const SAMPLE_PRICE_DATE: string = '2026-10-09';
export const SAMPLE_USD_RATE: string = '5.42';
export const SAMPLE_TOTAL_MINOR: number = 177310040;
export const SAMPLE_TOLERANCE_BPS: number = 500;

const BPS: number = 10000;

export function portfolioSettings(overrides: Partial<PortfolioSettings> = {}): PortfolioSettings {
    return { baseCurrency: 'BRL', toleranceBps: SAMPLE_TOLERANCE_BPS, ...overrides };
}

interface ClassSeed {
    readonly key: string;
    readonly id: string;
    readonly colorKey: string;
    readonly targetBps: number;
}

const CLASS_SEEDS: readonly ClassSeed[] = [
    { key: 'rf_pos', id: 'class-rf-pos', colorKey: 'c1', targetBps: 2000 },
    { key: 'rf_pre', id: 'class-rf-pre', colorKey: 'c2', targetBps: 800 },
    { key: 'rf_ipca', id: 'class-rf-ipca', colorKey: 'c3', targetBps: 1200 },
    { key: 'acoes_br', id: 'class-acoes-br', colorKey: 'c4', targetBps: 1500 },
    { key: 'fii', id: 'class-fii', colorKey: 'c5', targetBps: 700 },
    { key: 'acoes_eua', id: 'class-acoes-eua', colorKey: 'c6', targetBps: 2500 },
    { key: 'reits', id: 'class-reits', colorKey: 'c7', targetBps: 800 },
    { key: 'cripto', id: 'class-cripto', colorKey: 'c8', targetBps: 500 }
];

export function assetClass(overrides: Partial<AssetClassView> = {}): AssetClassView {
    return {
        id: 'class-custom',
        systemKey: null,
        aliasKeys: [],
        name: 'Minha classe',
        colorKey: 'c9',
        targetBps: 0,
        sortOrder: 9,
        ...overrides
    };
}

export function defaultClasses(): ClassesResponse {
    return {
        data: CLASS_SEEDS.map((seed: ClassSeed, index: number): AssetClassView =>
            assetClass({
                id: seed.id,
                systemKey: seed.key,
                name: null,
                colorKey: seed.colorKey,
                targetBps: seed.targetBps,
                sortOrder: index + 1
            })
        )
    };
}

export function holding(overrides: Partial<HoldingView> = {}): HoldingView {
    return {
        kind: 'position',
        id: 'position-1',
        assetId: 'asset-1',
        symbol: 'ITUB4',
        name: 'Itaú Unibanco PN',
        market: 'B3',
        typeGroup: 'acoes_br',
        classId: 'class-acoes-br',
        quantity: '2000',
        quantityDecimals: 0,
        unitPrice: '37.80',
        priceCurrency: 'BRL',
        nativeValueMinor: 7560000,
        nativeCurrency: 'BRL',
        valueMinor: 7560000,
        valueSource: 'brapi',
        priceDate: SAMPLE_PRICE_DATE,
        dollarExposure: false,
        missingQuote: false,
        stale: false,
        estimated: false,
        matured: false,
        missingRate: false,
        ...overrides
    };
}

function fixedIncome(id: string, symbol: string, name: string, classId: string, overrides: Partial<HoldingView>): HoldingView {
    return holding({
        kind: 'fixed_income',
        id,
        assetId: null,
        symbol,
        name,
        market: null,
        typeGroup: 'fixed_income',
        classId,
        quantity: null,
        quantityDecimals: null,
        unitPrice: null,
        priceCurrency: null,
        valueSource: 'curve_cdi',
        priceDate: null,
        estimated: true,
        ...overrides
    });
}

function treasury(id: string, symbol: string, classId: string, quantity: string, unitPrice: string, valueMinor: number): HoldingView {
    return holding({
        id,
        assetId: `asset-${id}`,
        symbol,
        name: 'Tesouro Direto',
        market: 'TESOURO',
        typeGroup: 'tesouro',
        classId,
        quantity,
        quantityDecimals: 2,
        unitPrice,
        nativeValueMinor: valueMinor,
        valueMinor,
        valueSource: 'tesouro_direto'
    });
}

function brStock(id: string, symbol: string, name: string, quantity: string, unitPrice: string, valueMinor: number): HoldingView {
    return holding({ id, assetId: `asset-${id}`, symbol, name, quantity, unitPrice, nativeValueMinor: valueMinor, valueMinor });
}

function fii(id: string, symbol: string, name: string, quantity: string, unitPrice: string, valueMinor: number): HoldingView {
    return holding({
        id,
        assetId: `asset-${id}`,
        symbol,
        name,
        typeGroup: 'fii',
        classId: 'class-fii',
        quantity,
        unitPrice,
        nativeValueMinor: valueMinor,
        valueMinor
    });
}

interface UsAsset {
    readonly id: string;
    readonly symbol: string;
    readonly name: string;
    readonly typeGroup: 'acoes_eua' | 'reits' | 'cripto';
    readonly classId: string;
    readonly quantity: string;
    readonly unitPrice: string;
    readonly nativeMinor: number;
    readonly valueMinor: number;
}

function usAsset(asset: UsAsset): HoldingView {
    return holding({
        id: asset.id,
        assetId: `asset-${asset.id}`,
        symbol: asset.symbol,
        name: asset.name,
        market: asset.typeGroup === 'cripto' ? 'CRYPTO' : 'US',
        typeGroup: asset.typeGroup,
        classId: asset.classId,
        quantity: asset.quantity,
        quantityDecimals: asset.typeGroup === 'cripto' ? 8 : 2,
        unitPrice: asset.unitPrice,
        priceCurrency: 'USD',
        nativeValueMinor: asset.nativeMinor,
        nativeCurrency: 'USD',
        valueMinor: asset.valueMinor,
        valueSource: asset.typeGroup === 'cripto' ? 'coingecko' : 'finnhub',
        dollarExposure: true
    });
}

const US_ASSETS: readonly UsAsset[] = [
    {
        id: 'voo',
        symbol: 'VOO',
        name: 'Vanguard S&P 500 ETF',
        typeGroup: 'acoes_eua',
        classId: 'class-acoes-eua',
        quantity: '40',
        unitPrice: '545',
        nativeMinor: 2180000,
        valueMinor: 11815600
    },
    {
        id: 'aapl',
        symbol: 'AAPL',
        name: 'Apple',
        typeGroup: 'acoes_eua',
        classId: 'class-acoes-eua',
        quantity: '60',
        unitPrice: '228',
        nativeMinor: 1368000,
        valueMinor: 7414560
    },
    {
        id: 'msft',
        symbol: 'MSFT',
        name: 'Microsoft',
        typeGroup: 'acoes_eua',
        classId: 'class-acoes-eua',
        quantity: '30',
        unitPrice: '430',
        nativeMinor: 1290000,
        valueMinor: 6991800
    },
    {
        id: 'o',
        symbol: 'O',
        name: 'Realty Income',
        typeGroup: 'reits',
        classId: 'class-reits',
        quantity: '300',
        unitPrice: '58',
        nativeMinor: 1740000,
        valueMinor: 9430800
    },
    {
        id: 'vnq',
        symbol: 'VNQ',
        name: 'Vanguard Real Estate ETF',
        typeGroup: 'reits',
        classId: 'class-reits',
        quantity: '120',
        unitPrice: '92',
        nativeMinor: 1104000,
        valueMinor: 5983680
    },
    {
        id: 'btc',
        symbol: 'BTC',
        name: 'Bitcoin',
        typeGroup: 'cripto',
        classId: 'class-cripto',
        quantity: '0.45',
        unitPrice: '62000',
        nativeMinor: 2790000,
        valueMinor: 15121800
    },
    {
        id: 'eth',
        symbol: 'ETH',
        name: 'Ethereum',
        typeGroup: 'cripto',
        classId: 'class-cripto',
        quantity: '4',
        unitPrice: '2600',
        nativeMinor: 1040000,
        valueMinor: 5636800
    }
];

function sampleFixedIncome(): HoldingView[] {
    return [
        fixedIncome('fi-cdb', 'CDB Inter', 'CDB 110% do CDI, venc. 2028', 'class-rf-pos', {
            nativeValueMinor: 18240000,
            valueMinor: 18240000
        }),
        fixedIncome('fi-lci', 'LCI Itaú', 'LCI 95% do CDI, venc. 2027', 'class-rf-pos', {
            nativeValueMinor: 13490000,
            valueMinor: 13490000
        }),
        fixedIncome('fi-treasury', 'Treasury 2027', 'US Treasury Note 4,25%', 'class-rf-pre', {
            nativeValueMinor: 2000000,
            nativeCurrency: 'USD',
            valueMinor: 10840000,
            valueSource: 'curve_pre',
            dollarExposure: true
        })
    ];
}

function sampleTreasuries(): HoldingView[] {
    return [
        treasury('td-selic', 'Tesouro Selic 2029', 'class-rf-pos', '3.2', '16200', 5184000),
        treasury('td-pre', 'Tesouro Pré 2027', 'class-rf-pre', '120', '812', 9744000),
        treasury('td-ipca', 'Tesouro IPCA+ 2035', 'class-rf-ipca', '60', '2150', 12900000)
    ];
}

function sampleBrazilian(): HoldingView[] {
    return [
        brStock('itub4', 'ITUB4', 'Itaú Unibanco PN', '2000', '37.80', 7560000),
        brStock('wege3', 'WEGE3', 'WEG ON', '1500', '52.10', 7815000),
        brStock('petr4', 'PETR4', 'Petrobras PN', '1800', '36.90', 6642000),
        fii('hglg11', 'HGLG11', 'CSHG Logística', '400', '158.00', 6320000),
        fii('knri11', 'KNRI11', 'Kinea Renda Imobiliária', '350', '152.00', 5320000),
        holding({
            id: 'ivvb11',
            assetId: 'asset-ivvb11',
            symbol: 'IVVB11',
            name: 'ETF S&P 500 na B3',
            typeGroup: 'acoes_eua',
            classId: 'class-acoes-eua',
            quantity: '300',
            unitPrice: '362.00',
            nativeValueMinor: 10860000,
            valueMinor: 10860000,
            dollarExposure: true
        })
    ];
}

export function sampleHoldings(): HoldingsResponse {
    return {
        baseCurrency: 'BRL',
        asOf: SAMPLE_AS_OF,
        data: [...sampleFixedIncome(), ...sampleTreasuries(), ...sampleBrazilian(), ...US_ASSETS.map(usAsset)]
    };
}

export function emptyHoldings(): HoldingsResponse {
    return { baseCurrency: 'BRL', asOf: SAMPLE_AS_OF, data: [] };
}

function statusOf(deviationBps: number, toleranceBps: number): DeviationStatus {
    if (Math.abs(deviationBps) <= toleranceBps) {
        return 'within';
    }
    return deviationBps > 0 ? 'above' : 'below';
}

function overviewClass(assetClassView: AssetClassView, valueMinor: number, count: number, total: number, tolerance: number): OverviewClass {
    const shareBps: number = total === 0 ? 0 : Math.round((valueMinor * BPS) / total);
    const deviationBps: number = shareBps - assetClassView.targetBps;
    return {
        classId: assetClassView.id,
        systemKey: assetClassView.systemKey,
        name: assetClassView.name,
        displayName: assetClassView.name ?? assetClassView.systemKey ?? '',
        colorKey: assetClassView.colorKey,
        valueMinor,
        shareBps,
        targetBps: assetClassView.targetBps,
        deviationBps,
        status: statusOf(deviationBps, tolerance),
        gapMinor: Math.round((assetClassView.targetBps * total) / BPS) - valueMinor,
        holdingsCount: count
    };
}

function largestDeviation(classes: readonly OverviewClass[]): Overview['largestDeviation'] {
    const worst: OverviewClass | undefined = [...classes].sort(
        (a: OverviewClass, b: OverviewClass): number => Math.abs(b.deviationBps) - Math.abs(a.deviationBps)
    )[0];
    if (worst === undefined || worst.status === 'within') {
        return null;
    }
    return { classId: worst.classId, deviationBps: worst.deviationBps, gapMinor: worst.gapMinor, status: worst.status };
}

export function emptyOverview(overrides: Partial<Overview> = {}): Overview {
    return {
        baseCurrency: 'BRL',
        asOf: SAMPLE_AS_OF,
        toleranceBps: SAMPLE_TOLERANCE_BPS,
        empty: true,
        totalMinor: 0,
        unclassifiedMinor: 0,
        dollarExposure: { valueMinor: 0, shareBps: 0 },
        usdRate: null,
        classes: defaultClasses().data.map((view: AssetClassView): OverviewClass => overviewClass(view, 0, 0, 0, SAMPLE_TOLERANCE_BPS)),
        outsideCount: 0,
        largestDeviation: null,
        quality: { missingQuotes: 0, staleQuotes: 0, estimatedFixedIncome: 0, indexDataMissing: 0, missingRates: 0 },
        ...overrides
    };
}

export function sampleOverview(): Overview {
    const holdings: readonly HoldingView[] = sampleHoldings().data;
    const total: number = holdings.reduce((sum: number, item: HoldingView): number => sum + item.valueMinor, 0);
    const classes: OverviewClass[] = defaultClasses().data.map((view: AssetClassView): OverviewClass => {
        const members: HoldingView[] = holdings.filter((item: HoldingView): boolean => item.classId === view.id);
        const value: number = members.reduce((sum: number, item: HoldingView): number => sum + item.valueMinor, 0);
        return overviewClass(view, value, members.length, total, SAMPLE_TOLERANCE_BPS);
    });
    const exposure: number = holdings
        .filter((item: HoldingView): boolean => item.dollarExposure)
        .reduce((sum: number, item: HoldingView): number => sum + item.valueMinor, 0);
    return emptyOverview({
        empty: false,
        totalMinor: total,
        dollarExposure: { valueMinor: exposure, shareBps: Math.round((exposure * BPS) / total) },
        usdRate: { brlPerUnit: SAMPLE_USD_RATE, date: SAMPLE_PRICE_DATE, source: 'ptax' },
        classes,
        outsideCount: classes.filter((item: OverviewClass): boolean => item.status !== 'within').length,
        largestDeviation: largestDeviation(classes),
        quality: { missingQuotes: 0, staleQuotes: 0, estimatedFixedIncome: 3, indexDataMissing: 0, missingRates: 0 }
    });
}

export function overviewWithQuality(quality: Partial<Overview['quality']>): Overview {
    const base: Overview = sampleOverview();
    return { ...base, quality: { ...base.quality, ...quality } };
}

export function allWithinOverview(): Overview {
    const base: Overview = sampleOverview();
    const classes: OverviewClass[] = base.classes.map((item: OverviewClass): OverviewClass => ({
        ...item,
        targetBps: item.shareBps,
        deviationBps: 0,
        status: 'within',
        gapMinor: 0
    }));
    return { ...base, classes, outsideCount: 0, largestDeviation: null };
}

export function usdOverview(): Overview {
    const base: Overview = sampleOverview();
    const rate: number = Number(SAMPLE_USD_RATE);
    const convert = (minor: number): number => Math.round(minor / rate);
    return {
        ...base,
        baseCurrency: 'USD',
        totalMinor: convert(base.totalMinor),
        dollarExposure: { ...base.dollarExposure, valueMinor: convert(base.dollarExposure.valueMinor) },
        classes: base.classes.map((item: OverviewClass): OverviewClass => ({
            ...item,
            valueMinor: convert(item.valueMinor),
            gapMinor: convert(item.gapMinor)
        })),
        largestDeviation:
            base.largestDeviation === null ? null : { ...base.largestDeviation, gapMinor: convert(base.largestDeviation.gapMinor) }
    };
}
