import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { CredentialsView } from '../../types';
import { invalidateConnections } from './invalidate-connections';

export function useTestCredentials(): UseMutationResult<CredentialsView, ApiError, void> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<CredentialsView> => unwrap(await apiClient.POST('/spending/connections/credentials/test')),
        onSuccess: async (): Promise<void> => {
            await invalidateConnections(queryClient);
        }
    });
}
