import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { ConcentrationResponse } from '../types';

export function useConcentration(): UseQueryResult<ConcentrationResponse> {
    return useQuery({
        queryKey: portfolioKeys.concentration(),
        queryFn: async ({ signal }): Promise<ConcentrationResponse> => unwrap(await apiClient.GET('/portfolio/concentration', { signal }))
    });
}
