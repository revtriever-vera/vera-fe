import type { paths } from '@/shared/lib/api/schema';

type CatalogOperation = paths['/catalog/assets']['get'];

export type CatalogSearchResponse = CatalogOperation['responses']['200']['content']['application/json'];
export type CatalogAsset = CatalogSearchResponse['data'][number];
export type CatalogGroup = NonNullable<NonNullable<CatalogOperation['parameters']['query']>['group']>;
export type CatalogKind = CatalogAsset['kind'];

export type QuotesResponse = paths['/market-data/quotes']['get']['responses']['200']['content']['application/json'];
export type Quote = QuotesResponse['quotes'][number];
export type ExchangeRateView = paths['/market-data/exchange-rates/{currency}']['get']['responses']['200']['content']['application/json'];

export type PositionView = paths['/positions/{id}']['get']['responses']['200']['content']['application/json'];
export type CreatePositionBody = paths['/positions']['post']['requestBody']['content']['application/json'];
export type UpdatePositionBody = paths['/positions/{id}']['patch']['requestBody']['content']['application/json'];

export type FixedIncomePreviewBody = paths['/fixed-income/preview']['post']['requestBody']['content']['application/json'];
export type FixedIncomePreview = paths['/fixed-income/preview']['post']['responses']['200']['content']['application/json'];
export type CreateTitleBody = paths['/fixed-income/titles']['post']['requestBody']['content']['application/json'];
export type TitleView = paths['/fixed-income/titles']['post']['responses']['201']['content']['application/json'];

export type FixedIncomeKind = CreateTitleBody['kind'];
export type FixedIncomeIndexer = CreateTitleBody['indexer'];
export type AssetCurrency = NonNullable<CreateTitleBody['currency']>;

export const FIXED_INCOME_KINDS = ['cdb', 'lci', 'lca', 'lc', 'debenture', 'cri', 'cra'] as const satisfies readonly FixedIncomeKind[];
export const FIXED_INCOME_INDEXERS = ['cdi_percent', 'prefixed', 'ipca_plus'] as const satisfies readonly FixedIncomeIndexer[];
export const ASSET_CURRENCIES = ['BRL', 'USD'] as const satisfies readonly AssetCurrency[];

export type UpdateTitleBody = paths['/fixed-income/titles/{id}']['patch']['requestBody']['content']['application/json'];
export type TitleDetail = paths['/fixed-income/titles/{id}']['get']['responses']['200']['content']['application/json'];
export type TitleValuation = TitleDetail['valuation'];
export type ExportFormat = paths['/portfolio/export']['get']['parameters']['query']['format'];

export const EXPORT_FORMATS = ['xlsx', 'csv'] as const satisfies readonly ExportFormat[];
