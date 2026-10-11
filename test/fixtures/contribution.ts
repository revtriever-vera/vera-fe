import type { ContributionAsset, ContributionClass, ContributionSuggestion } from '@/features/portfolio/contribution/types';

export function contributionAsset(overrides: Partial<ContributionAsset> = {}): ContributionAsset {
    return {
        kind: 'position',
        id: 'position-1',
        assetId: 'asset-1',
        typeGroup: 'acoes_br',
        symbol: 'WEGE3',
        name: 'WEG S.A.',
        amountMinor: 213607,
        approxUnits: '40',
        unitPrice: '53.40',
        priceCurrency: 'BRL',
        shareInClassBeforeBps: 5000,
        shareInClassAfterBps: 5100,
        targetInClassBps: 5000,
        ...overrides
    };
}

export function contributionClass(overrides: Partial<ContributionClass> = {}): ContributionClass {
    return {
        classId: 'class-acoes-br',
        systemKey: 'acoes_br',
        name: null,
        colorKey: 'c4',
        amountMinor: 219325,
        valueBeforeMinor: 21988000,
        shareBeforeBps: 1240,
        shareAfterBps: 1250,
        targetBps: 1500,
        note: null,
        assets: [
            contributionAsset(),
            contributionAsset({
                id: 'position-2',
                assetId: 'asset-2',
                symbol: 'PETR4',
                name: 'Petrobras PN',
                amountMinor: 5718,
                approxUnits: '1'
            })
        ],
        ...overrides
    };
}

export function sampleSuggestion(overrides: Partial<ContributionSuggestion> = {}): ContributionSuggestion {
    return {
        baseCurrency: 'BRL',
        amountMinor: 1000000,
        totalBeforeMinor: 177310040,
        totalAfterMinor: 178310040,
        warnings: [],
        classes: [
            contributionClass({
                classId: 'class-rf-ipca',
                systemKey: 'rf_ipca',
                colorKey: 'c3',
                amountMinor: 394046,
                shareBeforeBps: 730,
                shareAfterBps: 750,
                targetBps: 1200,
                assets: [
                    contributionAsset({
                        kind: 'fixed_income',
                        id: 'title-1',
                        assetId: null,
                        typeGroup: 'fixed_income',
                        symbol: 'CDB Banco Exemplo',
                        name: 'IPCA+ 6,2%',
                        amountMinor: 394046,
                        approxUnits: null,
                        unitPrice: null,
                        priceCurrency: null
                    })
                ]
            }),
            contributionClass({
                classId: 'class-acoes-eua',
                systemKey: 'acoes_eua',
                colorKey: 'c6',
                amountMinor: 347596,
                shareBeforeBps: 2090,
                shareAfterBps: 2100,
                targetBps: 2500,
                assets: [
                    contributionAsset({
                        id: 'position-3',
                        assetId: 'asset-3',
                        typeGroup: 'acoes_eua',
                        symbol: 'VOO',
                        name: 'Vanguard S&P 500 ETF',
                        amountMinor: 347596,
                        approxUnits: '0.612345',
                        priceCurrency: 'USD'
                    })
                ]
            }),
            contributionClass(),
            contributionClass({
                classId: 'class-fii',
                systemKey: 'fii',
                colorKey: 'c5',
                amountMinor: 39033,
                shareBeforeBps: 660,
                shareAfterBps: 660,
                targetBps: 700,
                assets: [
                    contributionAsset({
                        id: 'position-4',
                        assetId: 'asset-4',
                        typeGroup: 'fii',
                        symbol: 'HGLG11',
                        name: 'CSHG Logística',
                        amountMinor: 39033,
                        approxUnits: '0'
                    })
                ]
            })
        ],
        ...overrides
    };
}
