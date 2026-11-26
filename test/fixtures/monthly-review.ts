import type { MonthlyReview, MonthlyReviewList } from '@/features/portfolio/review/types';

export const REVIEW_MONTH: string = '2026-10';
export const CLASS_ACOES_ID: string = 'class-acoes-br';
export const CLASS_RENDA_FIXA_ID: string = 'class-rf-pos';

export function sampleReviewList(): MonthlyReviewList {
    return {
        items: [
            { month: '2026-10', returnPct: 1.42 },
            { month: '2026-09', returnPct: null }
        ]
    };
}

export function sampleReview(overrides: Partial<MonthlyReview> = {}): MonthlyReview {
    return {
        month: REVIEW_MONTH,
        baseCurrency: 'BRL',
        returnPct: 1.42,
        byClass: [
            { classId: CLASS_ACOES_ID, startMinor: 10_000_000, endMinor: 10_300_000, returnPct: 3 },
            { classId: CLASS_RENDA_FIXA_ID, startMinor: 5_000_000, endMinor: 5_050_000, reason: 'fixed_income_flow_unknown' }
        ],
        benchmarks: {
            cdi: { state: 'ok', returnPct: 0.95, referenceMonth: '2026-10' },
            ipca: { state: 'ok', returnPct: 0.31, referenceMonth: '2026-09' },
            ibovespa: { state: 'not_configured', returnPct: null, referenceMonth: null }
        },
        topGainers: [{ assetId: '00000000-0000-4000-8000-0000000000b1', symbol: 'XPLG11', variationPct: 3.4 }],
        topLosers: [{ assetId: '00000000-0000-4000-8000-0000000000b2', symbol: 'MGLU3', variationPct: -6.25 }],
        income: { amountMinor: 78_000, source: 'ledger' },
        concentration: {
            topIssuers: [
                { key: '00000000-0000-4000-8000-0000000000c1', name: 'Banco Exemplo', valueMinor: 4_000_000, shareBps: 3900 },
                { key: 'funds', name: null, valueMinor: 1_000_000, shareBps: 1000 }
            ],
            sectors: [{ key: 'financeiro', valueMinor: 2_000_000, shareBps: 5000 }],
            fgcExposure: {
                overLimitMinor: 120_000,
                groups: [{ groupId: 'banco-exemplo', groupName: 'Banco Exemplo', overMinor: 120_000 }]
            }
        },
        coverage: { reason: null, message: null, generatedAt: '2026-11-01T08:00:00.000Z' },
        ...overrides
    };
}

export function reviewWithoutOperations(): MonthlyReview {
    const base: MonthlyReview = sampleReview();
    const { returnPct: _omitted, ...rest }: MonthlyReview = base;
    return { ...rest, byClass: [], coverage: { reason: 'no_operations', message: null, generatedAt: base.coverage.generatedAt } };
}
