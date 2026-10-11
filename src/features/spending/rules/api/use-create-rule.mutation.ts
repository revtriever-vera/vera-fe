import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { CreateRuleBody, RuleResult } from '../../types';
import { invalidateRules } from './invalidate-rules';

export function useCreateRule(): UseMutationResult<RuleResult, ApiError, CreateRuleBody> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: CreateRuleBody): Promise<RuleResult> => unwrap(await apiClient.POST('/spending/rules', { body })),
        onSuccess: async (): Promise<void> => {
            await invalidateRules(queryClient);
        }
    });
}
