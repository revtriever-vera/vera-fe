import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { TitleDetail } from '../types';

export function useFixedIncomeTitle(id: string): UseQueryResult<TitleDetail> {
    return useQuery({
        queryKey: portfolioKeys.fixedIncomeTitle(id),
        queryFn: async ({ signal }): Promise<TitleDetail> =>
            unwrap(await apiClient.GET('/fixed-income/titles/{id}', { params: { path: { id } }, signal }))
    });
}
