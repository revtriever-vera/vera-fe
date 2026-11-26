import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ActionSummary, ConfirmActionInput } from '../types';
import { assistantKeys } from './assistant-keys';

export interface ConfirmActionVariables {
    readonly id: string;
    readonly choice: ConfirmActionInput;
}

async function refresh(queryClient: QueryClient, id: string): Promise<void> {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: assistantKeys.conversation() }),
        queryClient.invalidateQueries({ queryKey: assistantKeys.action(id) })
    ]);
}

export function useConfirmAction(): UseMutationResult<ActionSummary, Error, ConfirmActionVariables> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, choice }: ConfirmActionVariables): Promise<ActionSummary> =>
            unwrap(await apiClient.POST('/assistant/actions/{id}/confirm', { params: { path: { id } }, body: choice })),
        onSettled: async (_data, _error, { id }): Promise<void> => {
            await refresh(queryClient, id);
        }
    });
}

export function useCancelAction(): UseMutationResult<ActionSummary, Error, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<ActionSummary> =>
            unwrap(await apiClient.POST('/assistant/actions/{id}/cancel', { params: { path: { id } } })),
        onSettled: async (_data, _error, id): Promise<void> => {
            await refresh(queryClient, id);
        }
    });
}
