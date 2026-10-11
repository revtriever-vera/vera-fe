import type { ValueSource } from '../types';

export type ValueSourceKey =
    | 'sources.brapi'
    | 'sources.finnhub'
    | 'sources.twelvedata'
    | 'sources.alphavantage'
    | 'sources.coingecko'
    | 'sources.tesouro_direto'
    | 'sources.curve_cdi'
    | 'sources.curve_pre'
    | 'sources.curve_ipca';

const SOURCE_KEYS: Readonly<Record<ValueSource, ValueSourceKey>> = {
    brapi: 'sources.brapi',
    finnhub: 'sources.finnhub',
    twelvedata: 'sources.twelvedata',
    alphavantage: 'sources.alphavantage',
    coingecko: 'sources.coingecko',
    tesouro_direto: 'sources.tesouro_direto',
    curve_cdi: 'sources.curve_cdi',
    curve_pre: 'sources.curve_pre',
    curve_ipca: 'sources.curve_ipca'
};

const ESTIMATED_SOURCES: readonly ValueSource[] = ['curve_cdi', 'curve_pre', 'curve_ipca'];

export function valueSourceKey(source: ValueSource): ValueSourceKey {
    return SOURCE_KEYS[source];
}

export function isEstimatedSource(source: ValueSource): boolean {
    return ESTIMATED_SOURCES.includes(source);
}
