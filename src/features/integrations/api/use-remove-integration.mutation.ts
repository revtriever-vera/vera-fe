import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrapEmpty } from '@/shared/lib/api/client';
import { useBilling } from '@/shared/lib/billing/use-billing';
import type { IntegrationKind } from '../types';
import { integrationsKeys } from './integrations-keys';

export function useRemoveIntegration(): UseMutationResult<void, Error, IntegrationKind> {
    const queryClient: QueryClient = useQueryClient();
    const { refresh } = useBilling();
    return useMutation({
        mutationFn: async (kind: IntegrationKind): Promise<void> => {
            unwrapEmpty(await apiClient.DELETE('/integrations/{kind}', { params: { path: { kind } } }));
        },
        onSuccess: async (): Promise<void> => {
            await Promise.all([queryClient.invalidateQueries({ queryKey: integrationsKeys.all }), refresh()]);
        }
    });
}
