import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { AssetTargetsInput, SavedAssetTargets } from '../types';

export function useSaveAssetTargets(classId: string): UseMutationResult<SavedAssetTargets, ApiError, AssetTargetsInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: AssetTargetsInput): Promise<SavedAssetTargets> =>
            unwrap(await apiClient.PUT('/allocation/targets/classes/{classId}/assets', { params: { path: { classId } }, body })),
        onSuccess: async (): Promise<void> => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: portfolioKeys.classDetail(classId) }),
                invalidatePortfolio(queryClient),
                queryClient.invalidateQueries({ queryKey: portfolioKeys.contributions() })
            ]);
        }
    });
}
