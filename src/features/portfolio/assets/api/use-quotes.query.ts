import { useQuery, useQueryClient, type Query, type QueryClient, type QueryState } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { Quote, QuotesResponse } from '../types';

export const QUOTE_POLL_MS: number = 2500;
export const QUOTE_MAX_POLLS: number = 10;

export function quotePollInterval(updateCount: number, pendingCount: number): number | false {
    return pendingCount > 0 && updateCount < QUOTE_MAX_POLLS ? QUOTE_POLL_MS : false;
}

export interface QuoteBook {
    readonly quotes: ReadonlyMap<string, Quote>;
    readonly pending: ReadonlySet<string>;
    readonly exhausted: boolean;
    readonly isLoading: boolean;
}

const EMPTY_BOOK: QuoteBook = { quotes: new Map<string, Quote>(), pending: new Set<string>(), exhausted: false, isLoading: false };

type QuotesQuery = Query<QuotesResponse, Error, QuotesResponse, ReturnType<typeof portfolioKeys.quotes>>;

export function useQuotes(assetIds: readonly string[]): QuoteBook {
    const ids: readonly string[] = [...assetIds].sort();
    const queryClient: QueryClient = useQueryClient();
    const queryKey: ReturnType<typeof portfolioKeys.quotes> = portfolioKeys.quotes(ids);
    const { data, isLoading } = useQuery({
        queryKey,
        queryFn: async ({ signal }): Promise<QuotesResponse> =>
            unwrap(await apiClient.GET('/market-data/quotes', { params: { query: { assetIds: ids.join(',') } }, signal })),
        enabled: ids.length > 0,
        refetchInterval: (query: QuotesQuery): number | false =>
            quotePollInterval(query.state.dataUpdateCount, query.state.data?.pendingAssetIds.length ?? 0)
    });
    if (data === undefined) {
        return { ...EMPTY_BOOK, isLoading };
    }
    const state: QueryState<QuotesResponse> | undefined = queryClient.getQueryState<QuotesResponse>(queryKey);
    const pending: ReadonlySet<string> = new Set<string>(data.pendingAssetIds);
    return {
        quotes: new Map<string, Quote>(data.quotes.map((quote: Quote): [string, Quote] => [quote.assetId, quote])),
        pending,
        exhausted: pending.size > 0 && (state?.dataUpdateCount ?? 0) >= QUOTE_MAX_POLLS,
        isLoading
    };
}
