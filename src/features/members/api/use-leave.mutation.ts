import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrapEmpty } from '@/shared/lib/api/client';

export function useLeave(): UseMutationResult<void, Error, void> {
    return useMutation({
        mutationFn: async (): Promise<void> => {
            unwrapEmpty(await apiClient.POST('/members/me/leave'));
        }
    });
}
