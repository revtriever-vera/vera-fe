import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { holderQuery } from '../lib/holder-filter';
import type { HoldingsResponse } from '../types';
import { portfolioKeys } from './portfolio-keys';

export function useHoldings(holder?: string): UseQueryResult<HoldingsResponse> {
    return useQuery({
        queryKey: portfolioKeys.holdingsOf(holder),
        queryFn: async ({ signal }): Promise<HoldingsResponse> =>
            unwrap(await apiClient.GET('/portfolio/holdings', { params: { query: holderQuery(holder) }, signal }))
    });
}
