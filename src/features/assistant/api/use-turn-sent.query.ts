import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { SentView } from '../types';
import { assistantKeys } from './assistant-keys';

export function useTurnSent(id: string): UseQueryResult<SentView> {
    return useQuery({
        queryKey: assistantKeys.sent(id),
        queryFn: async ({ signal }): Promise<SentView> =>
            unwrap(await apiClient.GET('/assistant/turns/{id}/sent', { params: { path: { id } }, signal })),
        staleTime: 0,
        gcTime: 0
    });
}
