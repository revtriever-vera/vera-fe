import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { ApiError } from '@/shared/lib/api/api-error';
import type { PlatformTokenList } from '../types';
import { adminKeys } from './admin-keys';

function isRefusal(error: unknown): boolean {
    return error instanceof ApiError && (error.status === 403 || error.status === 404);
}

export function usePlatformTokens(): UseQueryResult<PlatformTokenList> {
    return useQuery({
        queryKey: adminKeys.tokens(),
        queryFn: async ({ signal }): Promise<PlatformTokenList> =>
            unwrap<PlatformTokenList>(await apiClient.GET('/platform/tokens', { signal })),
        retry: (count: number, error: Error): boolean => !isRefusal(error) && count < 2
    });
}
