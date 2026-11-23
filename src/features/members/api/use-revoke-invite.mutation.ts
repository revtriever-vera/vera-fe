import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrapEmpty } from '@/shared/lib/api/client';
import { membersKeys } from './members-keys';

export function useRevokeInvite(): UseMutationResult<void, Error, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (inviteId: string): Promise<void> => {
            unwrapEmpty(await apiClient.DELETE('/members/invites/{inviteId}', { params: { path: { inviteId } } }));
        },
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: membersKeys.list() });
        }
    });
}
