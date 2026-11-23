import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { CreateSignupLinkInput, SignupLink } from '../types';
import { adminKeys } from './admin-keys';

export function useCreateSignupLink(): UseMutationResult<SignupLink, ApiError, CreateSignupLinkInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateSignupLinkInput): Promise<SignupLink> =>
            unwrap<SignupLink>(await apiClient.POST('/platform/signup-links', { body: input })),
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: adminKeys.signupLinks() });
        }
    });
}
