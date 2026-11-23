import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { ApiError } from '@/shared/lib/api/api-error';
import type { SummaryKind, SummaryParams, SummaryView } from '../types';
import { aiKeys } from './ai-keys';

const NO_CONTENT: number = 204;
const CONSENT_REQUIRED: string = 'ai.consent_required';

export function useRegenerateSummary(kind: SummaryKind, params: SummaryParams): UseMutationResult<SummaryView | null, ApiError, void> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<SummaryView | null> => {
            const { data, error, response } = await apiClient.POST('/ai/summaries/{kind}/regenerate', {
                params: { path: { kind } },
                body: params
            });
            return response.status === NO_CONTENT ? null : unwrap({ data, error, response });
        },
        onSuccess: (view: SummaryView | null): void => {
            queryClient.setQueryData(aiKeys.summary(kind, params), view);
        },
        onError: async (error: ApiError): Promise<void> => {
            if (error.problem.type === CONSENT_REQUIRED) {
                await queryClient.invalidateQueries({ queryKey: aiKeys.consent() });
            }
        }
    });
}
