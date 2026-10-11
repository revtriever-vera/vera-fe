import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { PortfolioSettings } from '../types';
import { portfolioKeys } from './portfolio-keys';

export function usePortfolioSettings(): UseQueryResult<PortfolioSettings> {
    return useQuery({
        queryKey: portfolioKeys.settings(),
        queryFn: async ({ signal }): Promise<PortfolioSettings> => unwrap(await apiClient.GET('/allocation/settings', { signal }))
    });
}
