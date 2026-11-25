import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { InvestmentImportList } from '../types';
import { investmentImportsKeys } from './investment-imports-keys';

export const INVESTMENT_IMPORTS_PAGE_SIZE: number = 5;

export function useInvestmentImports(page: number): UseQueryResult<InvestmentImportList> {
    return useQuery({
        queryKey: investmentImportsKeys.list(page),
        queryFn: async ({ signal }): Promise<InvestmentImportList> =>
            unwrap(
                await apiClient.GET('/investment-imports', {
                    params: { query: { page, pageSize: INVESTMENT_IMPORTS_PAGE_SIZE } },
                    signal
                })
            ),
        placeholderData: keepPreviousData
    });
}
