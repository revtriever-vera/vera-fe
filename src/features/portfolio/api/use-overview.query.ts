import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { Overview } from '../types';
import { portfolioKeys } from './portfolio-keys';

export function useOverview(): UseQueryResult<Overview> {
    return useQuery({
        queryKey: portfolioKeys.overview(),
        queryFn: async ({ signal }): Promise<Overview> => unwrap(await apiClient.GET('/portfolio/overview', { signal }))
    });
}
