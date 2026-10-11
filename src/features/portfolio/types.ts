import type { paths } from '@/shared/lib/api/schema';

export type HoldingsResponse = paths['/portfolio/holdings']['get']['responses']['200']['content']['application/json'];
export type HoldingView = HoldingsResponse['data'][number];
export type Overview = paths['/portfolio/overview']['get']['responses']['200']['content']['application/json'];
export type OverviewClass = Overview['classes'][number];
export type ClassesResponse = paths['/allocation/classes']['get']['responses']['200']['content']['application/json'];
export type AssetClassView = ClassesResponse['data'][number];
export type CreateClassInput = paths['/allocation/classes']['post']['requestBody']['content']['application/json'];
export type UpdateClassBody = paths['/allocation/classes/{id}']['patch']['requestBody']['content']['application/json'];
export type MergeClassesBody = paths['/allocation/classes/{id}/merge']['post']['requestBody']['content']['application/json'];
export type PortfolioSettings = paths['/allocation/settings']['get']['responses']['200']['content']['application/json'];
export type UpdatePortfolioSettings = paths['/allocation/settings']['put']['requestBody']['content']['application/json'];

export type BaseCurrency = PortfolioSettings['baseCurrency'];
export type DeviationStatus = OverviewClass['status'];
export type HoldingTypeGroup = HoldingView['typeGroup'];
export type ValueSource = HoldingView['valueSource'];
export type HoldingKind = HoldingView['kind'];

export const CLASS_COLOR_KEYS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'] as const;

export type ClassColorKey = (typeof CLASS_COLOR_KEYS)[number];

export const BASE_CURRENCIES = ['BRL', 'USD'] as const;

export const DEVIATION_STATUS = {
    within: 'within',
    above: 'above',
    below: 'below'
} as const;

export const SYSTEM_CLASS_KEYS = {
    fixedIncomePost: 'rf_pos',
    fixedIncomePre: 'rf_pre',
    fixedIncomeIpca: 'rf_ipca',
    stocksBr: 'acoes_br',
    fii: 'fii',
    stocksUs: 'acoes_eua',
    reits: 'reits',
    crypto: 'cripto'
} as const;

export type SystemClassKey = (typeof SYSTEM_CLASS_KEYS)[keyof typeof SYSTEM_CLASS_KEYS];

export type SaveClassTargetsBody = paths['/allocation/targets/classes']['put']['requestBody']['content']['application/json'];

export type Assignment =
    paths['/allocation/assignments/{subjectType}/{subjectId}']['put']['responses']['200']['content']['application/json'];
export type AssignmentSubjectType = Assignment['subjectType'];
