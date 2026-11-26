import type { ApiPaths } from '@/shared/lib/api/api-paths';

export type MonthlyReviewList = ApiPaths['/portfolio-watch/monthly-reviews']['get']['responses']['200']['content']['application/json'];
export type MonthlyReviewResponse =
    ApiPaths['/portfolio-watch/monthly-reviews/{month}']['get']['responses']['200']['content']['application/json'];
export type MonthlyReview = MonthlyReviewResponse & { readonly summary?: string | null };
export type ClassReturn = MonthlyReview['byClass'][number];
export type ClassReason = NonNullable<ClassReturn['reason']>;
export type Benchmark = MonthlyReview['benchmarks']['cdi'];
export type BenchmarkState = Benchmark['state'];
export type CoverageReason = NonNullable<MonthlyReview['coverage']['reason']>;
export type PriceMove = MonthlyReview['topGainers'][number];
export type IssuerRow = MonthlyReview['concentration']['topIssuers'][number];
export type SectorRow = MonthlyReview['concentration']['sectors'][number];
export type FgcGroup = MonthlyReview['concentration']['fgcExposure']['groups'][number];

export const BENCHMARK_NAMES = ['cdi', 'ipca', 'ibovespa'] as const;

export type BenchmarkName = (typeof BENCHMARK_NAMES)[number];

export const CLASS_REASONS = [
    'quantity_mismatch',
    'fixed_income_flow_unknown',
    'asset_without_snapshot',
    'unconvertible_flow',
    'no_base'
] as const satisfies readonly ClassReason[];

export const COVERAGE_REASON = {
    noOperations: 'no_operations',
    noPreviousSnapshot: 'no_previous_snapshot',
    classesNotClosing: 'classes_not_closing',
    noBase: 'no_base'
} as const satisfies Record<string, CoverageReason>;

export const MONTH_PATTERN: RegExp = /^\d{4}-(0[1-9]|1[0-2])$/;
