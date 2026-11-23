import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { MaturitiesResponse } from '../types';

export function useMaturities(): UseQueryResult<MaturitiesResponse> {
    return useQuery({
        queryKey: portfolioKeys.maturities(),
        staleTime: 0,
        queryFn: async ({ signal }): Promise<MaturitiesResponse> => unwrap(await apiClient.GET('/portfolio/maturities', { signal }))
    });
}
