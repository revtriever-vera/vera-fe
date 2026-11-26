import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import type { CommitBody, InvestmentImportCreated } from '../types';
import type { TitleDecision } from '../schemas/imported-title.schema';
import { investmentImportsKeys } from './investment-imports-keys';

export interface CommitInvestmentImportInput extends Omit<CommitBody, 'fixedIncome'> {
    readonly fixedIncome?: readonly TitleDecision[];
}

function bodyOf({ fixedIncome, ...rest }: CommitInvestmentImportInput): CommitBody {
    return fixedIncome === undefined ? rest : { ...rest, fixedIncome: [...fixedIncome] };
}

export function useCommitInvestmentImport(): UseMutationResult<InvestmentImportCreated, ApiError, CommitInvestmentImportInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: CommitInvestmentImportInput): Promise<InvestmentImportCreated> =>
            unwrap(await apiClient.POST('/investment-imports', { body: bodyOf(input) })),
        onSuccess: async (): Promise<void> => {
            await Promise.all([invalidatePortfolio(queryClient), queryClient.invalidateQueries({ queryKey: investmentImportsKeys.all })]);
        }
    });
}
