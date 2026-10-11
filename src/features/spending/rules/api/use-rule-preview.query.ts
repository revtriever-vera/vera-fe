import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { spendingKeys } from '../../api/spending-keys';
import type { RulePreview, RulePreviewInput } from '../../types';

export function useRulePreview(input: RulePreviewInput | null): UseQueryResult<RulePreview> {
    return useQuery({
        queryKey: spendingKeys.rulePreview(input ?? { matchType: 'contains', pattern: '', appliesTo: 'out' }),
        queryFn: async ({ signal }): Promise<RulePreview> => {
            if (input === null) {
                throw new Error('missing preview input');
            }
            return unwrap(await apiClient.POST('/spending/rules/preview', { body: input, signal }));
        },
        enabled: input !== null,
        retry: false,
        staleTime: 30_000
    });
}
