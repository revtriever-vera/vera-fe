import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ActionView } from '../types';
import { assistantKeys } from './assistant-keys';

export function useAction(id: string, enabled: boolean): UseQueryResult<ActionView> {
    return useQuery({
        queryKey: assistantKeys.action(id),
        queryFn: async ({ signal }): Promise<ActionView> =>
            unwrap(await apiClient.GET('/assistant/actions/{id}', { params: { path: { id } }, signal })),
        enabled
    });
}
