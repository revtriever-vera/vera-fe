import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { spendingKeys } from '../../api/spending-keys';
import type { CutsResponse } from '../../types';

export function useCuts(month: string | null, goalBps: number | null): UseQueryResult<CutsResponse> {
    return useQuery({
        queryKey: spendingKeys.cuts(month, goalBps),
        queryFn: async ({ signal }): Promise<CutsResponse> =>
            unwrap(
                await apiClient.GET('/spending/cuts', {
                    params: {
                        query: {
                            ...(month === null ? {} : { month }),
                            ...(goalBps === null ? {} : { goalBps })
                        }
                    },
                    signal
                })
            ),
        placeholderData: keepPreviousData
    });
}
