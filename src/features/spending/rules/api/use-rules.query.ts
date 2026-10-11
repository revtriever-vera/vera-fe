import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { spendingKeys } from '../../api/spending-keys';
import type { RulesResponse } from '../../types';

export function useRules(): UseQueryResult<RulesResponse> {
    return useQuery({
        queryKey: spendingKeys.rules(),
        queryFn: async ({ signal }): Promise<RulesResponse> => unwrap(await apiClient.GET('/spending/rules', { signal }))
    });
}
