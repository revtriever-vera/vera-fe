import type { paths } from '@/shared/lib/api/schema';

export type FgcCoverage = paths['/portfolio/fgc']['get']['responses']['200']['content']['application/json'];
export type FgcGroup = FgcCoverage['groups'][number];
export type FgcOutside = FgcCoverage['outside'][number];
export type FgcOutsideReason = FgcOutside['reason'];
export type MaturitiesResponse = paths['/portfolio/maturities']['get']['responses']['200']['content']['application/json'];
export type MaturityItem = MaturitiesResponse['items'][number];
export type RealRatesResponse = paths['/portfolio/real-rates']['get']['responses']['200']['content']['application/json'];
export type RealRateItem = RealRatesResponse['items'][number];

export const MATURITY_ATTENTION_DAYS = 60;
export const MATURITY_REALLOCATE_DAYS = 90;
