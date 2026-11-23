import { useQuery, useQueryClient, type QueryClient, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { ApiError } from '@/shared/lib/api/api-error';
import type { SummaryKind, SummaryParams, SummaryView } from '../types';
import { aiKeys } from './ai-keys';

const NO_CONTENT: number = 204;
const CONSENT_REQUIRED: string = 'ai.consent_required';

export function useSummary(kind: SummaryKind, params: SummaryParams, enabled: boolean): UseQueryResult<SummaryView | null> {
    const queryClient: QueryClient = useQueryClient();
    return useQuery({
        queryKey: aiKeys.summary(kind, params),
        queryFn: async ({ signal }): Promise<SummaryView | null> => {
            const {
                data,
                error: problem,
                response
            } = await apiClient.GET('/ai/summaries/{kind}', {
                params: { path: { kind }, query: params },
                signal
            });
            if (response.status === NO_CONTENT) {
                return null;
            }
            try {
                return unwrap({ data, error: problem, response });
            } catch (error) {
                if (error instanceof ApiError && error.problem.type === CONSENT_REQUIRED) {
                    await queryClient.invalidateQueries({ queryKey: aiKeys.consent() });
                }
                throw error;
            }
        },
        enabled,
        retry: false
    });
}
