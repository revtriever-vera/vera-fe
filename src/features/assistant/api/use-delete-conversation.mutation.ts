import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { unwrapEmpty } from '@/shared/lib/api/client';
import { assistantClient } from './assistant-client';
import { assistantKeys } from './assistant-keys';

export function useDeleteConversation(): UseMutationResult<void, Error, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            unwrapEmpty(await assistantClient.DELETE('/assistant/conversations/{id}', { params: { path: { id } } }));
        },
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: assistantKeys.conversation() });
        }
    });
}
