import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { useBilling } from '@/shared/lib/billing/use-billing';
import type { IntegrationItem, SaveIntegrationVariables } from '../types';
import { integrationsKeys } from './integrations-keys';

async function save(variables: SaveIntegrationVariables): Promise<IntegrationItem> {
    switch (variables.kind) {
        case 'llm':
            return unwrap(await apiClient.PUT('/integrations/llm', { body: variables.body }));
        case 'whatsapp':
            return unwrap(await apiClient.PUT('/integrations/whatsapp', { body: variables.body }));
        case 'google':
            return unwrap(await apiClient.PUT('/integrations/google', { body: variables.body }));
    }
}

export function useSaveIntegration(): UseMutationResult<IntegrationItem, Error, SaveIntegrationVariables> {
    const queryClient: QueryClient = useQueryClient();
    const { refresh } = useBilling();
    return useMutation({
        gcTime: 0,
        mutationFn: save,
        onSuccess: async (): Promise<void> => {
            await Promise.all([queryClient.invalidateQueries({ queryKey: integrationsKeys.all }), refresh()]);
        }
    });
}
