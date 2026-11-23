import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { InviteResult } from '../types';
import { membersKeys } from './members-keys';

export function useResendInvite(): UseMutationResult<InviteResult, Error, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (inviteId: string): Promise<InviteResult> =>
            unwrap<InviteResult>(await apiClient.POST('/members/invites/{inviteId}/resend', { params: { path: { inviteId } } })),
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: membersKeys.list() });
        }
    });
}
