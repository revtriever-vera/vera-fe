import { useQuery, useQueryClient, type Query, type QueryClient, type UseQueryResult } from '@tanstack/react-query';
import { unwrap } from '@/shared/lib/api/client';
import { TURN_STATUS, type TurnView } from '../types';
import { assistantClient } from './assistant-client';
import { assistantKeys } from './assistant-keys';

export const TURN_POLL_MS: number = 1500;

function isSettled(turn: TurnView | undefined): boolean {
    return turn !== undefined && turn.status !== TURN_STATUS.pending;
}

function nextPoll(query: Query<TurnView>): number | false {
    return isSettled(query.state.data) ? false : TURN_POLL_MS;
}

export function useTurn(id: string | null): UseQueryResult<TurnView> {
    const queryClient: QueryClient = useQueryClient();
    return useQuery({
        queryKey: assistantKeys.turn(id ?? ''),
        queryFn: async ({ signal }): Promise<TurnView> => {
            const turn: TurnView = unwrap(
                await assistantClient.GET('/assistant/turns/{id}', { params: { path: { id: id ?? '' } }, signal })
            );
            if (isSettled(turn)) {
                await queryClient.invalidateQueries({ queryKey: assistantKeys.conversation() });
            }
            return turn;
        },
        enabled: id !== null,
        refetchInterval: nextPoll
    });
}
