import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { PayloadKind, PayloadView, SummaryParams } from '../types';
import { aiKeys } from './ai-keys';

const NO_CONTENT: number = 204;

export function useAiPayload(kind: PayloadKind, params: SummaryParams, enabled: boolean = true): UseQueryResult<PayloadView | null> {
    return useQuery({
        queryKey: aiKeys.payload(kind, params),
        queryFn: async ({ signal }): Promise<PayloadView | null> => {
            const { data, error, response } = await apiClient.GET('/ai/payload', { params: { query: { kind, ...params } }, signal });
            return response.status === NO_CONTENT ? null : unwrap({ data, error, response });
        },
        enabled,
        gcTime: 0
    });
}
