import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { holderQuery } from '../../lib/holder-filter';
import type { GoalsList } from '../types';
import { goalsKeys } from './goals-keys';

export function useGoals(holder?: string): UseQueryResult<GoalsList> {
    return useQuery({
        queryKey: goalsKeys.listOf(holder),
        queryFn: async ({ signal }): Promise<GoalsList> =>
            unwrap(await apiClient.GET('/goals', { params: { query: holderQuery(holder) }, signal }))
    });
}
