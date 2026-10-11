import { bpsToInput } from '../../lib/parse-percent-input';
import { SYSTEM_CLASS_KEYS, type SystemClassKey } from '../../types';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { FixedIncomeIndexer } from '../types';

export const MIN_APPLIED_DATE: string = '2010-01-01';

export interface RateRange {
    readonly min: number;
    readonly max: number;
}

export const RATE_RANGE_BPS: Readonly<Record<FixedIncomeIndexer, RateRange>> = {
    cdi_percent: { min: 1, max: 30000 },
    prefixed: { min: 0, max: 10000 },
    ipca_plus: { min: 0, max: 5000 }
};

export type RateLabelKey = 'fixedIncome.rate.cdi_percent' | 'fixedIncome.rate.prefixed' | 'fixedIncome.rate.ipca_plus';

interface IndexerDefaults {
    readonly rateBps: number;
    readonly rateLabelKey: RateLabelKey;
    readonly classKey: SystemClassKey;
}

const INDEXER_DEFAULTS: Readonly<Record<FixedIncomeIndexer, IndexerDefaults>> = {
    cdi_percent: { rateBps: 10500, rateLabelKey: 'fixedIncome.rate.cdi_percent', classKey: SYSTEM_CLASS_KEYS.fixedIncomePost },
    prefixed: { rateBps: 1250, rateLabelKey: 'fixedIncome.rate.prefixed', classKey: SYSTEM_CLASS_KEYS.fixedIncomePre },
    ipca_plus: { rateBps: 620, rateLabelKey: 'fixedIncome.rate.ipca_plus', classKey: SYSTEM_CLASS_KEYS.fixedIncomeIpca }
};

export function defaultRateText(indexer: FixedIncomeIndexer, locale: SupportedLocale): string {
    return bpsToInput(INDEXER_DEFAULTS[indexer].rateBps, locale);
}

export function rateLabelKey(indexer: FixedIncomeIndexer): RateLabelKey {
    return INDEXER_DEFAULTS[indexer].rateLabelKey;
}

export function indexerClassKey(indexer: FixedIncomeIndexer): SystemClassKey {
    return INDEXER_DEFAULTS[indexer].classKey;
}

export function localTodayIso(now: Date = new Date()): string {
    const month: string = String(now.getMonth() + 1).padStart(2, '0');
    const day: string = String(now.getDate()).padStart(2, '0');
    return `${String(now.getFullYear())}-${month}-${day}`;
}
