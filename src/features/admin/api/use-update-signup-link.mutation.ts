import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { SignupLink, UpdateSignupLinkInput } from '../types';
import { adminKeys } from './admin-keys';

export interface UpdateSignupLinkVariables {
    readonly id: string;
    readonly input: UpdateSignupLinkInput;
}

export function useUpdateSignupLink(): UseMutationResult<SignupLink, ApiError, UpdateSignupLinkVariables> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, input }: UpdateSignupLinkVariables): Promise<SignupLink> =>
            unwrap<SignupLink>(await apiClient.PATCH('/platform/signup-links/{id}', { params: { path: { id } }, body: input })),
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: adminKeys.signupLinks() });
        }
    });
}
