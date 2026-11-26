import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrapEmpty } from '@/shared/lib/api/client';

export function useTurnFeedback(): UseMutationResult<void, Error, string> {
    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            unwrapEmpty(
                await apiClient.POST('/assistant/turns/{id}/feedback', {
                    params: { path: { id } },
                    body: { helpful: false }
                })
            );
        }
    });
}
