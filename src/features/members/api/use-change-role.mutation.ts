import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { MemberRole, MemberView } from '../types';
import { membersKeys } from './members-keys';

export interface ChangeRoleInput {
    readonly userId: string;
    readonly role: MemberRole;
}

interface ChangeRoleResult {
    readonly member: MemberView;
}

export function useChangeRole(): UseMutationResult<MemberView, Error, ChangeRoleInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, role }: ChangeRoleInput): Promise<MemberView> => {
            const result: ChangeRoleResult = unwrap<ChangeRoleResult>(
                await apiClient.PATCH('/members/{userId}', { params: { path: { userId } }, body: { role } })
            );
            return result.member;
        },
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: membersKeys.list() });
        }
    });
}
