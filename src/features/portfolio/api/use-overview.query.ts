import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { holderQuery } from '../lib/holder-filter';
import type { Overview } from '../types';
import { portfolioKeys } from './portfolio-keys';

export function useOverview(holder?: string): UseQueryResult<Overview> {
    return useQuery({
        queryKey: portfolioKeys.overviewOf(holder),
        queryFn: async ({ signal }): Promise<Overview> =>
            unwrap(await apiClient.GET('/portfolio/overview', { params: { query: holderQuery(holder) }, signal }))
    });
}
