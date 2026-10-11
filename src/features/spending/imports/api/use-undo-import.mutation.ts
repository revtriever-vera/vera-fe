import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { track } from '@/shared/lib/analytics';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { invalidateSpending } from '../../api/invalidate-spending';
import type { ImportRemoved } from '../../types';

export function useUndoImport(): UseMutationResult<ImportRemoved, ApiError, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<ImportRemoved> =>
            unwrap(await apiClient.DELETE('/spending/imports/{id}', { params: { path: { id } } })),
        onSuccess: async (): Promise<void> => {
            track('spending_import_undone');
            await invalidateSpending(queryClient);
        }
    });
}
