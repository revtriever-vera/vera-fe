import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { MembersList } from '../types';
import { membersKeys } from './members-keys';

export function useMembers(): UseQueryResult<MembersList> {
    return useQuery({
        queryKey: membersKeys.list(),
        queryFn: async ({ signal }): Promise<MembersList> => unwrap<MembersList>(await apiClient.GET('/members', { signal }))
    });
}
