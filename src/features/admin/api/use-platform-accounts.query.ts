import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { AccountList } from '../types';
import { adminKeys } from './admin-keys';
import { isPlatformRefusal } from './is-platform-refusal';

export const ACCOUNTS_PAGE_SIZE: number = 25;

export function usePlatformAccounts(page: number, search: string): UseQueryResult<AccountList> {
    return useQuery({
        queryKey: adminKeys.accounts(page, search),
        queryFn: async ({ signal }): Promise<AccountList> =>
            unwrap<AccountList>(
                await apiClient.GET('/platform/accounts', {
                    params: { query: { page, pageSize: ACCOUNTS_PAGE_SIZE, search: search === '' ? undefined : search } },
                    signal
                })
            ),
        placeholderData: keepPreviousData,
        retry: (count: number, error: Error): boolean => !isPlatformRefusal(error) && count < 2
    });
}
