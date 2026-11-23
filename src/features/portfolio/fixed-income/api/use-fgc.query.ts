import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import { holderQuery } from '../../lib/holder-filter';
import type { FgcCoverage } from '../types';

export function useFgc(holder?: string): UseQueryResult<FgcCoverage> {
    return useQuery({
        queryKey: portfolioKeys.fgcOf(holder),
        staleTime: 0,
        queryFn: async ({ signal }): Promise<FgcCoverage> =>
            unwrap(await apiClient.GET('/portfolio/fgc', { params: { query: holderQuery(holder) }, signal }))
    });
}
