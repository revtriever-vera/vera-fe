import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import type { HoldingKind } from '../../types';

export interface SetHolderInput {
    readonly kind: HoldingKind;
    readonly id: string;
    readonly holderUserId: string | null;
}

async function patchHolder({ kind, id, holderUserId }: SetHolderInput): Promise<void> {
    const params: { path: { id: string } } = { path: { id } };
    if (kind === 'position') {
        unwrap(await apiClient.PATCH('/positions/{id}', { params, body: { holderUserId } }));
        return;
    }
    unwrap(await apiClient.PATCH('/fixed-income/titles/{id}', { params, body: { holderUserId } }));
}

export function useSetHolder(): UseMutationResult<void, ApiError, SetHolderInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: patchHolder,
        onSettled: async (): Promise<void> => {
            await invalidatePortfolio(queryClient);
        }
    });
}
