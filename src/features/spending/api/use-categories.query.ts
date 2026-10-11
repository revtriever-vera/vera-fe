import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { CategoriesResponse } from '../types';
import { spendingKeys } from './spending-keys';

export function useCategories(): UseQueryResult<CategoriesResponse> {
    return useQuery({
        queryKey: spendingKeys.categories(),
        queryFn: async ({ signal }): Promise<CategoriesResponse> => unwrap(await apiClient.GET('/spending/categories', { signal }))
    });
}
