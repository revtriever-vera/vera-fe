import { useRef, type RefObject } from 'react';
import { useQuery, type Query, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { decidePolling, type PollDecision } from '../lib/link-polling';
import type { LinkView } from '../types';
import { whatsappKeys } from './whatsapp-keys';

export function useWhatsAppLink(enabled: boolean): UseQueryResult<LinkView> {
    const startedAt: RefObject<number | null> = useRef<number | null>(null);
    return useQuery({
        queryKey: whatsappKeys.link(),
        enabled,
        staleTime: 0,
        queryFn: async ({ signal }): Promise<LinkView> => unwrap(await apiClient.GET('/whatsapp/link', { signal })),
        refetchInterval: (query: Query<LinkView>): number | false => {
            const decision: PollDecision = decidePolling(query.state.data, startedAt.current, Date.now());
            startedAt.current = decision.startedAt;
            return decision.interval;
        }
    });
}
