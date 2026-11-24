import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { CreatedPlatformToken, CreatePlatformTokenInput } from '../types';
import { adminKeys } from './admin-keys';

export function useCreatePlatformToken(): UseMutationResult<CreatedPlatformToken, ApiError, CreatePlatformTokenInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreatePlatformTokenInput): Promise<CreatedPlatformToken> =>
            unwrap<CreatedPlatformToken>(await apiClient.POST('/platform/tokens', { body: input })),
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: adminKeys.tokens() });
        }
    });
}
