import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { IntegrationsView } from '../types';
import { integrationsKeys } from './integrations-keys';

export function useIntegrations(enabled: boolean): UseQueryResult<IntegrationsView> {
    return useQuery({
        queryKey: integrationsKeys.list(),
        enabled,
        queryFn: async ({ signal }): Promise<IntegrationsView> => unwrap(await apiClient.GET('/integrations', { signal }))
    });
}
