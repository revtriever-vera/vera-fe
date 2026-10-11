import type { QueryClient } from '@tanstack/react-query';
import { spendingKeys } from './spending-keys';

export async function invalidateSpending(queryClient: QueryClient): Promise<void> {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: spendingKeys.transactionLists() }),
        queryClient.invalidateQueries({ queryKey: spendingKeys.uncategorizedCount() }),
        queryClient.invalidateQueries({ queryKey: spendingKeys.summaries() }),
        queryClient.invalidateQueries({ queryKey: spendingKeys.cutsList() }),
        queryClient.invalidateQueries({ queryKey: spendingKeys.accounts() }),
        queryClient.invalidateQueries({ queryKey: spendingKeys.importLists() })
    ]);
}
