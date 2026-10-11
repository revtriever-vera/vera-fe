import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { spendingKeys } from '../../api/spending-keys';
import type { ImportsResponse } from '../../types';

export const IMPORTS_PAGE_SIZE: number = 10;

export function useImports(page: number): UseQueryResult<ImportsResponse> {
    return useQuery({
        queryKey: spendingKeys.imports(page),
        queryFn: async ({ signal }): Promise<ImportsResponse> =>
            unwrap(await apiClient.GET('/spending/imports', { params: { query: { page, pageSize: IMPORTS_PAGE_SIZE } }, signal })),
        placeholderData: keepPreviousData
    });
}
