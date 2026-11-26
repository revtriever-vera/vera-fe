import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { HolderParam } from '../../lib/holder-filter';
import { holderQuery } from '../../lib/holder-filter';
import type { ChangesResponse, ChangesWindow } from '../types';
import { changesKeys } from './changes-keys';

export function useChanges(days: ChangesWindow, holder: HolderParam): UseQueryResult<ChangesResponse> {
    return useQuery({
        queryKey: changesKeys.window(days, holder),
        queryFn: async ({ signal }): Promise<ChangesResponse> =>
            unwrap(await apiClient.GET('/portfolio-watch/changes', { params: { query: { days, ...holderQuery(holder) } }, signal }))
    });
}
