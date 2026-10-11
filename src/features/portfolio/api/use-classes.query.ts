import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ClassesResponse } from '../types';
import { portfolioKeys } from './portfolio-keys';

export function useClasses(): UseQueryResult<ClassesResponse> {
    return useQuery({
        queryKey: portfolioKeys.classes(),
        queryFn: async ({ signal }): Promise<ClassesResponse> => unwrap(await apiClient.GET('/allocation/classes', { signal }))
    });
}
