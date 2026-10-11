import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { UncategorizedCount } from '../types';
import { spendingKeys } from './spending-keys';

export interface UncategorizedCountOptions {
    readonly enabled?: boolean;
}

export function useUncategorizedCount({ enabled = true }: UncategorizedCountOptions = {}): UseQueryResult<UncategorizedCount> {
    return useQuery({
        enabled,
        queryKey: spendingKeys.uncategorizedCount(),
        queryFn: async ({ signal }): Promise<UncategorizedCount> =>
            unwrap(await apiClient.GET('/spending/transactions/uncategorized-count', { signal }))
    });
}
