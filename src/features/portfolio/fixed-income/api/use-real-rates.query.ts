import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { RealRatesResponse } from '../types';

export function useRealRates(): UseQueryResult<RealRatesResponse> {
    return useQuery({
        queryKey: portfolioKeys.realRates(),
        staleTime: 0,
        queryFn: async ({ signal }): Promise<RealRatesResponse> => unwrap(await apiClient.GET('/portfolio/real-rates', { signal }))
    });
}
