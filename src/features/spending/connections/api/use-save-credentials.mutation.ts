import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { CredentialsView } from '../../types';
import type { SaveCredentialsBody } from '../types';
import { invalidateConnections } from './invalidate-connections';

export function useSaveCredentials(): UseMutationResult<CredentialsView, ApiError, SaveCredentialsBody> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        gcTime: 0,
        mutationFn: async (body: SaveCredentialsBody): Promise<CredentialsView> =>
            unwrap(await apiClient.PUT('/spending/connections/credentials', { body })),
        onSuccess: async (): Promise<void> => {
            await invalidateConnections(queryClient);
        }
    });
}
