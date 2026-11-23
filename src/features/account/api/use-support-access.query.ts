import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { SupportAccessList } from '../types';
import { accountKeys } from './account-keys';

export function useSupportAccess(): UseQueryResult<SupportAccessList> {
    return useQuery({
        queryKey: accountKeys.supportAccess(),
        queryFn: async ({ signal }): Promise<SupportAccessList> =>
            unwrap<SupportAccessList>(await apiClient.GET('/account/support-access', { signal }))
    });
}
