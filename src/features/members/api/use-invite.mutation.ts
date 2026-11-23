import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { InviteResult, MemberRole } from '../types';
import { membersKeys } from './members-keys';

export interface InviteInput {
    readonly email: string;
    readonly role: MemberRole;
}

export function useInvite(): UseMutationResult<InviteResult, Error, InviteInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: InviteInput): Promise<InviteResult> =>
            unwrap<InviteResult>(await apiClient.POST('/members/invites', { body: input })),
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: membersKeys.list() });
        }
    });
}
