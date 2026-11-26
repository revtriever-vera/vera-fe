import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import type { InvestmentImportUndone } from '../types';
import { investmentImportsKeys } from './investment-imports-keys';

export function useUndoInvestmentImport(): UseMutationResult<InvestmentImportUndone, ApiError, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<InvestmentImportUndone> =>
            unwrap(await apiClient.DELETE('/investment-imports/{id}', { params: { path: { id } } })),
        onSuccess: async (): Promise<void> => {
            await Promise.all([invalidatePortfolio(queryClient), queryClient.invalidateQueries({ queryKey: investmentImportsKeys.all })]);
        }
    });
}
