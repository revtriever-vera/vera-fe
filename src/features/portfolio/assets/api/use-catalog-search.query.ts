import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { CatalogGroup, CatalogSearchResponse } from '../types';

const SEARCH_LIMIT: number = 30;

export interface CatalogSearchInput {
    readonly group: CatalogGroup;
    readonly q: string;
}

export function useCatalogSearch({ group, q }: CatalogSearchInput): UseQueryResult<CatalogSearchResponse> {
    return useQuery({
        queryKey: portfolioKeys.catalogSearch({ group, q }),
        queryFn: async ({ signal }): Promise<CatalogSearchResponse> =>
            unwrap(
                await apiClient.GET('/catalog/assets', {
                    params: { query: { group, q: q === '' ? undefined : q, limit: SEARCH_LIMIT } },
                    signal
                })
            ),
        placeholderData: keepPreviousData
    });
}
