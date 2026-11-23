import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { GoalView, UpdateGoalBody } from '../types';
import { goalsKeys } from './goals-keys';

export interface UpdateGoalInput {
    readonly id: string;
    readonly body: UpdateGoalBody;
}

export function useUpdateGoal(): UseMutationResult<GoalView, ApiError, UpdateGoalInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, body }: UpdateGoalInput): Promise<GoalView> =>
            unwrap(await apiClient.PATCH('/goals/{id}', { params: { path: { id } }, body })),
        onSettled: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: goalsKeys.all });
        }
    });
}
