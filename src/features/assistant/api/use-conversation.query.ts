import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ConversationView } from '../types';
import { assistantKeys } from './assistant-keys';

export function useConversation(enabled: boolean): UseQueryResult<ConversationView> {
    return useQuery({
        queryKey: assistantKeys.conversation(),
        queryFn: async ({ signal }): Promise<ConversationView> =>
            unwrap(await apiClient.GET('/assistant/conversations/current', { signal })),
        enabled
    });
}
