import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { HoldingsResponse } from '../types';
import { portfolioKeys } from './portfolio-keys';

export function useHoldings(): UseQueryResult<HoldingsResponse> {
    return useQuery({
        queryKey: portfolioKeys.holdings(),
        queryFn: async ({ signal }): Promise<HoldingsResponse> => unwrap(await apiClient.GET('/portfolio/holdings', { signal }))
    });
}
