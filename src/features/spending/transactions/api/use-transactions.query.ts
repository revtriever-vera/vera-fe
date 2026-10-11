import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { spendingKeys } from '../../api/spending-keys';
import type { TransactionsQuery, TransactionsResponse } from '../../types';

export function useTransactions(filters: TransactionsQuery): UseQueryResult<TransactionsResponse> {
    return useQuery({
        queryKey: spendingKeys.transactions(filters),
        placeholderData: keepPreviousData,
        queryFn: async ({ signal }): Promise<TransactionsResponse> =>
            unwrap(await apiClient.GET('/spending/transactions', { params: { query: filters }, signal }))
    });
}
