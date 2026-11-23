import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { ContributionSuggestion } from '../types';

function isValidAmount(amountMinor: number | null): amountMinor is number {
    return amountMinor !== null && Number.isInteger(amountMinor) && amountMinor > 0;
}

export function useContributionSuggestion(
    amountMinor: number | null,
    prioritizeGoals: boolean = true
): UseQueryResult<ContributionSuggestion> {
    const valid: boolean = isValidAmount(amountMinor);
    return useQuery({
        queryKey: portfolioKeys.contribution(valid ? (amountMinor ?? 0) : 0, prioritizeGoals),
        queryFn: async ({ signal }): Promise<ContributionSuggestion> =>
            unwrap(
                await apiClient.POST('/portfolio/contributions/suggest', {
                    body: { amountMinor: amountMinor ?? 0, prioritizeGoals },
                    signal
                })
            ),
        enabled: valid,
        placeholderData: keepPreviousData
    });
}
