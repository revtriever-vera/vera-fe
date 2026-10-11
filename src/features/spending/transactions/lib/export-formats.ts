import type { ApiPaths } from '@/shared/lib/api/api-paths';

export type ExportFormat = ApiPaths['/spending/transactions/export']['get']['parameters']['query']['format'];

export const EXPORT_FORMATS: readonly ExportFormat[] = ['xlsx', 'csv'];
