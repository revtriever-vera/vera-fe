import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrapEmpty } from '@/shared/lib/api/client';
import { membersKeys } from './members-keys';

export function useRemoveMember(): UseMutationResult<void, Error, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string): Promise<void> => {
            unwrapEmpty(await apiClient.DELETE('/members/{userId}', { params: { path: { userId } } }));
        },
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: membersKeys.list() });
        }
    });
}
