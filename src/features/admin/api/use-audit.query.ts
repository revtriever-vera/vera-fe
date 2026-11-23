import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { ApiError } from '@/shared/lib/api/api-error';
import type { AuditList } from '../types';
import { adminKeys } from './admin-keys';

export const AUDIT_LIMIT: number = 50;

/** Recusa da API (fora da company de sistema, ou instalação sem admin): repetir não muda a resposta. */
function isRefusal(error: unknown): boolean {
    return error instanceof ApiError && (error.status === 403 || error.status === 404);
}

export function useAudit(): UseQueryResult<AuditList> {
    return useQuery({
        queryKey: adminKeys.audit(AUDIT_LIMIT),
        queryFn: async ({ signal }): Promise<AuditList> =>
            unwrap<AuditList>(await apiClient.GET('/platform/audit', { params: { query: { limit: AUDIT_LIMIT } }, signal })),
        retry: (count: number, error: Error): boolean => !isRefusal(error) && count < 2
    });
}
