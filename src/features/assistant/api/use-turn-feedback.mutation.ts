import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { unwrapEmpty } from '@/shared/lib/api/client';
import { assistantClient } from './assistant-client';

export function useTurnFeedback(): UseMutationResult<void, Error, string> {
    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            unwrapEmpty(
                await assistantClient.POST('/assistant/turns/{id}/feedback', {
                    params: { path: { id } },
                    body: { helpful: false }
                })
            );
        }
    });
}
