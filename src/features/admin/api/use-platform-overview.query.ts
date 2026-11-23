import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { PlatformOverview } from '../types';
import { adminKeys } from './admin-keys';
import { isPlatformRefusal } from './is-platform-refusal';

export function usePlatformOverview(): UseQueryResult<PlatformOverview> {
    return useQuery({
        queryKey: adminKeys.overview(),
        queryFn: async ({ signal }): Promise<PlatformOverview> =>
            unwrap<PlatformOverview>(await apiClient.GET('/platform/overview', { signal })),
        retry: (count: number, error: Error): boolean => !isPlatformRefusal(error) && count < 2
    });
}
