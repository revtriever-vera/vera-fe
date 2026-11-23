import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { ApiError } from '@/shared/lib/api/api-error';
import type { SignupLinkList } from '../types';
import { adminKeys } from './admin-keys';

/** Recusa da API (fora da company de sistema, ou instalação sem admin): repetir não muda a resposta. */
function isRefusal(error: unknown): boolean {
    return error instanceof ApiError && (error.status === 403 || error.status === 404);
}

export function useSignupLinks(): UseQueryResult<SignupLinkList> {
    return useQuery({
        queryKey: adminKeys.signupLinks(),
        queryFn: async ({ signal }): Promise<SignupLinkList> =>
            unwrap<SignupLinkList>(await apiClient.GET('/platform/signup-links', { signal })),
        retry: (count: number, error: Error): boolean => !isRefusal(error) && count < 2
    });
}
