import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { PositionView } from '../types';

export function usePosition(id: string): UseQueryResult<PositionView> {
    return useQuery({
        queryKey: portfolioKeys.position(id),
        queryFn: async ({ signal }): Promise<PositionView> =>
            unwrap(await apiClient.GET('/positions/{id}', { params: { path: { id } }, signal }))
    });
}
