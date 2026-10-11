import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { SpendingSettings } from '../types';
import { spendingKeys } from './spending-keys';

export function useSpendingSettings(): UseQueryResult<SpendingSettings> {
    return useQuery({
        queryKey: spendingKeys.settings(),
        queryFn: async ({ signal }): Promise<SpendingSettings> => unwrap(await apiClient.GET('/spending/settings', { signal }))
    });
}
