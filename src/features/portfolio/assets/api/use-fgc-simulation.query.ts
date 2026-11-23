import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { track } from '@/shared/lib/analytics';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { FgcSimulation, FgcSimulationBody } from '../types';

export function useFgcSimulation(body: FgcSimulationBody | null): UseQueryResult<FgcSimulation> {
    return useQuery({
        queryKey: portfolioKeys.fgcSimulation(body === null ? {} : { ...body, excludeTitleId: body.excludeTitleId ?? null }),
        queryFn: async ({ signal }): Promise<FgcSimulation> => {
            if (body === null) {
                throw new Error('missing simulation body');
            }
            const result: FgcSimulation = unwrap(await apiClient.POST('/portfolio/fgc/simulate', { body, signal }));
            track('fgc_preview_shown', { verdict: result.verdict });
            return result;
        },
        enabled: body !== null,
        retry: false
    });
}
