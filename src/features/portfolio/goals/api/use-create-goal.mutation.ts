import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { CreateGoalBody, GoalView } from '../types';
import { goalsKeys } from './goals-keys';

export function useCreateGoal(): UseMutationResult<GoalView, ApiError, CreateGoalBody> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: CreateGoalBody): Promise<GoalView> => unwrap(await apiClient.POST('/goals', { body })),
        onSettled: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: goalsKeys.all });
        }
    });
}
