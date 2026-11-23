import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrapEmpty } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { adminKeys } from './admin-keys';

export function useRevokeSignupLink(): UseMutationResult<void, ApiError, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            unwrapEmpty(await apiClient.DELETE('/platform/signup-links/{id}', { params: { path: { id } } }));
        },
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: adminKeys.signupLinks() });
        }
    });
}
