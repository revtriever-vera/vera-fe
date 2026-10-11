import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrapEmpty } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import type { HoldingKind } from '../../types';

export interface DeleteHoldingInput {
    readonly kind: HoldingKind;
    readonly id: string;
}

async function deleteHolding({ kind, id }: DeleteHoldingInput): Promise<void> {
    if (kind === 'fixed_income') {
        unwrapEmpty(await apiClient.DELETE('/fixed-income/titles/{id}', { params: { path: { id } } }));
        return;
    }
    unwrapEmpty(await apiClient.DELETE('/positions/{id}', { params: { path: { id } } }));
}

export function useDeleteHolding(): UseMutationResult<void, ApiError, DeleteHoldingInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteHolding,
        onSettled: async (): Promise<void> => {
            await invalidatePortfolio(queryClient);
        }
    });
}
