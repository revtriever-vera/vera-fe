import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { InvitePreview } from '../types';
import { authKeys } from './auth-keys';

export function useInvitePreview(token: string): UseQueryResult<InvitePreview> {
    return useQuery({
        queryKey: authKeys.invite(token),
        queryFn: async ({ signal }): Promise<InvitePreview> =>
            unwrap<InvitePreview>(await apiClient.GET('/invites/{token}', { params: { path: { token } }, signal })),
        staleTime: Infinity,
        retry: false
    });
}
