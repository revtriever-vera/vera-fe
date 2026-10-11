import { useRef, useState, type RefObject } from 'react';
import { useQuery, useQueryClient, type Query, type QueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { invalidateSpending } from '../../api/invalidate-spending';
import { spendingKeys } from '../../api/spending-keys';
import type { ConnectionsResponse } from '../../types';
import { anySyncing, POLL_INTERVAL_MS, shouldPoll } from '../lib/sync-polling';

export interface ConnectionsState {
    readonly query: UseQueryResult<ConnectionsResponse>;
    readonly stalled: boolean;
    readonly restartPolling: () => void;
}

type ConnectionsQuery = Query<ConnectionsResponse, Error, ConnectionsResponse, ReturnType<typeof spendingKeys.connections>>;

export function useConnections(): ConnectionsState {
    const queryClient: QueryClient = useQueryClient();
    const [startedAt, setStartedAt] = useState<number | null>(null);
    const wasSyncing: RefObject<boolean> = useRef<boolean>(false);
    const query: UseQueryResult<ConnectionsResponse> = useQuery({
        queryKey: spendingKeys.connections(),
        queryFn: async ({ signal }): Promise<ConnectionsResponse> => {
            const data: ConnectionsResponse = unwrap(await apiClient.GET('/spending/connections', { signal }));
            const syncing: boolean = anySyncing(data.connections);
            if (wasSyncing.current && !syncing) {
                void invalidateSpending(queryClient);
            }
            wasSyncing.current = syncing;
            setStartedAt((current: number | null): number | null => (syncing ? (current ?? Date.now()) : null));
            return data;
        },
        refetchInterval: (current: ConnectionsQuery): number | false =>
            shouldPoll(current.state.data?.connections ?? [], startedAt ?? Date.now(), Date.now()) ? POLL_INTERVAL_MS : false
    });
    const connections: readonly ConnectionsResponse['connections'][number][] = query.data?.connections ?? [];
    const stalled: boolean = anySyncing(connections) && startedAt !== null && !shouldPoll(connections, startedAt, query.dataUpdatedAt);
    return {
        query,
        stalled,
        restartPolling: (): void => {
            setStartedAt(Date.now());
        }
    };
}
