import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { invalidateSpending } from '../../api/invalidate-spending';
import type { RecategorizeBody, RecategorizeResult } from '../../types';

export interface RecategorizeInput {
    readonly id: string;
    readonly body: RecategorizeBody;
}

export function useRecategorize(): UseMutationResult<RecategorizeResult, ApiError, RecategorizeInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, body }: RecategorizeInput): Promise<RecategorizeResult> =>
            unwrap(await apiClient.PATCH('/spending/transactions/{id}', { params: { path: { id } }, body })),
        onSuccess: async (): Promise<void> => {
            await invalidateSpending(queryClient);
        }
    });
}
