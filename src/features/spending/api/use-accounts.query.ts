import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { AccountsResponse } from '../types';
import { spendingKeys } from './spending-keys';

export function useAccounts(): UseQueryResult<AccountsResponse> {
    return useQuery({
        queryKey: spendingKeys.accounts(),
        queryFn: async ({ signal }): Promise<AccountsResponse> => unwrap(await apiClient.GET('/spending/accounts', { signal }))
    });
}
