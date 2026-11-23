import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { OfferPreview } from '../types';
import { authKeys } from './auth-keys';

export function useOfferPreview(token: string): UseQueryResult<OfferPreview> {
    return useQuery({
        queryKey: authKeys.offer(token),
        queryFn: async ({ signal }): Promise<OfferPreview> =>
            unwrap<OfferPreview>(await apiClient.GET('/signup-links/{token}', { params: { path: { token } }, signal })),
        staleTime: Infinity,
        retry: false
    });
}
