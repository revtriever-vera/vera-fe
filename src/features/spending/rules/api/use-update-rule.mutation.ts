import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { RuleResult, UpdateRuleBody } from '../../types';
import { invalidateRules } from './invalidate-rules';

export interface UpdateRuleInput {
    readonly id: string;
    readonly body: UpdateRuleBody;
}

export function useUpdateRule(): UseMutationResult<RuleResult, ApiError, UpdateRuleInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, body }: UpdateRuleInput): Promise<RuleResult> =>
            unwrap(await apiClient.PATCH('/spending/rules/{id}', { params: { path: { id } }, body })),
        onSuccess: async (): Promise<void> => {
            await invalidateRules(queryClient);
        }
    });
}
