import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import type { Assignment, AssignmentSubjectType } from '../../types';

export interface ReclassifyInput {
    readonly subjectType: AssignmentSubjectType;
    readonly subjectId: string;
    readonly classId: string;
}

export function useReclassify(): UseMutationResult<Assignment, ApiError, ReclassifyInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ subjectType, subjectId, classId }: ReclassifyInput): Promise<Assignment> =>
            unwrap(
                await apiClient.PUT('/allocation/assignments/{subjectType}/{subjectId}', {
                    params: { path: { subjectType, subjectId } },
                    body: { classId }
                })
            ),
        onSettled: async (): Promise<void> => {
            await invalidatePortfolio(queryClient);
        }
    });
}
