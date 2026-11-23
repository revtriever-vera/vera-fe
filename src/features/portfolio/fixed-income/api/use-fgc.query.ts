import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { FgcCoverage } from '../types';

export function useFgc(): UseQueryResult<FgcCoverage> {
    return useQuery({
        queryKey: portfolioKeys.fgc(),
        staleTime: 0,
        queryFn: async ({ signal }): Promise<FgcCoverage> => unwrap(await apiClient.GET('/portfolio/fgc', { signal }))
    });
}
