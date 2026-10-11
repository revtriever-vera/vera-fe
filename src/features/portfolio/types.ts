import type { components } from '@/shared/lib/api/schema';

export type HoldingView = components['schemas']['HoldingView'];
export type HoldingsResponse = components['schemas']['HoldingsResponse'];
export type Overview = components['schemas']['Overview'];
export type OverviewClass = components['schemas']['OverviewClass'];
export type AssetClassView = components['schemas']['AssetClassView'];
export type ClassesResponse = components['schemas']['ClassesResponse'];
export type PortfolioSettings = components['schemas']['PortfolioSettings'];
export type UpdatePortfolioSettings = components['schemas']['UpdatePortfolioSettings'];

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
