import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { HolderParam } from '../../lib/holder-filter';
import { holderQuery } from '../../lib/holder-filter';
import type { AgendaResponse } from '../types';
import { agendaKeys } from './agenda-keys';

export function useAgenda(from: string, to: string, holder: HolderParam): UseQueryResult<AgendaResponse> {
    return useQuery({
        queryKey: agendaKeys.window(from, to, holder),
        queryFn: async ({ signal }): Promise<AgendaResponse> =>
            unwrap(await apiClient.GET('/portfolio-watch/agenda', { params: { query: { from, to, ...holderQuery(holder) } }, signal }))
    });
}
