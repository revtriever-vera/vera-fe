import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { CatalogSearchResponse } from '../../assets/types';

const PICK_LIMIT: number = 8;
const MIN_QUERY_LENGTH: number = 2;
const ANY_GROUP: string = 'any';

export function useAssetPick(q: string): UseQueryResult<CatalogSearchResponse> {
    return useQuery({
        queryKey: portfolioKeys.catalogSearch({ group: ANY_GROUP, q }),
        queryFn: async ({ signal }): Promise<CatalogSearchResponse> =>
            unwrap(await apiClient.GET('/catalog/assets', { params: { query: { q, limit: PICK_LIMIT } }, signal })),
        enabled: q.length >= MIN_QUERY_LENGTH,
        placeholderData: keepPreviousData
    });
}
