import type { FgcCoverage, FgcGroup, MaturitiesResponse, MaturityItem, RealRateItem, RealRatesResponse } from '@/features/portfolio/fixed-income/types';

export function emptyMaturities(): MaturitiesResponse {
    return { asOf: '2026-10-09', reference: { cdiAnnualBps: 1465, ipca12mBps: 450, cdiDate: '2026-10-08', ipcaMonth: '2026-09' }, items: [] };
}

export function maturityItem(overrides: Partial<MaturityItem> = {}): MaturityItem {
    return {
        holdingKind: 'fixed_income',
        id: 'title-cdb',
        name: 'CDB Banco Alfa',
        issuerName: 'Banco Alfa',
        kind: 'cdb',
        maturityDate: '2026-11-20',
        daysToMaturity: 42,
        soon: true,
        estimatedValueMinor: 1234567,
        currency: 'BRL',
        reallocateMinor: 1230000,
        estimated: false,
        basis: 'contract',
        taxRegime: 'regressive',
        isSample: false,
        ...overrides
    };
}

export function maturities(items: readonly MaturityItem[] = [maturityItem()]): MaturitiesResponse {
    return { ...emptyMaturities(), items: [...items] };
}

export function realRateItem(overrides: Partial<RealRateItem> = {}): RealRateItem {
    return {
        id: 'title-cdb',
        name: 'CDB Banco Alfa',
        kind: 'cdb',
        indexer: 'cdi_percent',
        rateBps: 11000,
        appliedMinor: 1000000,
        appliedAt: '2025-03-10',
        valueMinor: 1120000,
        nominalAnnualBps: 1612,
        realAnnualBps: 1100,
        lowReal: false,
        correctedMinor: 1040000,
        purchasingPowerGainMinor: 80000,
        purchasingPowerGainBps: 769,
        taxRegime: 'regressive',
        estimated: false,
        ...overrides
    };
}

export function realRates(items: readonly RealRateItem[] = [realRateItem()]): RealRatesResponse {
    return { asOf: '2026-10-09', reference: { ipca12mBps: 450, ipcaMonth: '2026-09' }, items: [...items] };
}

export function fgcGroup(overrides: Partial<FgcGroup> = {}): FgcGroup {
    return {
        groupId: 'group-alfa',
        groupName: 'Conglomerado Alfa',
        totalMinor: 30000000,
        coveredMinor: 25000000,
        overMinor: 5000000,
        titles: [{ id: 'title-cdb', name: 'CDB Banco Alfa', issuerName: 'Banco Alfa', kind: 'cdb', valueMinor: 30000000, estimated: false }],
        ...overrides
    };
}

export function emptyFgc(): FgcCoverage {
    return {
        currency: 'BRL',
        scope: 'account',
        peopleCount: 1,
        limitPerGroupMinor: 25000000,
        capMinor: 100000000,
        coveredMinor: 0,
        capShareBps: 0,
        groups: [],
        outside: [],
        asOf: '2026-10-09'
    };
}

export function fgcCoverage(overrides: Partial<FgcCoverage> = {}): FgcCoverage {
    return { ...emptyFgc(), coveredMinor: 25000000, capShareBps: 2500, groups: [fgcGroup()], ...overrides };
}
