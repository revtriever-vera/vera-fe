import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { ConsentSource, ConsentState } from '../types';
import { aiKeys } from './ai-keys';

export interface GrantConsentInput {
    readonly noticeVersion: number;
    readonly source: ConsentSource;
}

export function useGrantConsent(): UseMutationResult<ConsentState, ApiError, GrantConsentInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: GrantConsentInput): Promise<ConsentState> =>
            unwrap(await apiClient.PUT('/ai/consent', { body: { noticeVersion: input.noticeVersion, source: input.source } })),
        onSuccess: async (state: ConsentState): Promise<void> => {
            queryClient.setQueryData(aiKeys.consent(), state);
            await queryClient.invalidateQueries({ queryKey: aiKeys.all });
        },
        onError: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: aiKeys.consent() });
        }
    });
}
