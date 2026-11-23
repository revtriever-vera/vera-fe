import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { track } from '@/shared/lib/analytics';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { IssuerKind, IssuerSearchResponse } from '../types';

export interface IssuerSearchInput {
    readonly kind: IssuerKind;
    readonly q: string;
}

export function useIssuerSearch({ kind, q }: IssuerSearchInput): UseQueryResult<IssuerSearchResponse> {
    return useQuery({
        queryKey: portfolioKeys.issuerSearch({ kind, q }),
        queryFn: async ({ signal }): Promise<IssuerSearchResponse> => {
            const result: IssuerSearchResponse = unwrap(
                await apiClient.GET('/issuers', { params: { query: { kind, q: q === '' ? undefined : q } }, signal })
            );
            if (q !== '') {
                track('issuer_searched', { kind, hasResults: result.items.length > 0 });
            }
            return result;
        },
        placeholderData: keepPreviousData
    });
}
