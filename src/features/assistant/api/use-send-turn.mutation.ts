import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { unwrap } from '@/shared/lib/api/client';
import type { SendTurnInput, TurnStarted } from '../types';
import { assistantClient } from './assistant-client';
import { assistantKeys } from './assistant-keys';

export function useSendTurn(): UseMutationResult<TurnStarted, Error, SendTurnInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: SendTurnInput): Promise<TurnStarted> =>
            unwrap(await assistantClient.POST('/assistant/turns', { body: input })),
        onSettled: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: assistantKeys.conversation() });
        }
    });
}
