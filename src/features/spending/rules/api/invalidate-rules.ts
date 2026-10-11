import type { QueryClient } from '@tanstack/react-query';
import { invalidateSpending } from '../../api/invalidate-spending';
import { spendingKeys } from '../../api/spending-keys';

export async function invalidateRules(queryClient: QueryClient): Promise<void> {
    await Promise.all([
        invalidateSpending(queryClient),
        queryClient.invalidateQueries({ queryKey: spendingKeys.rules() }),
        queryClient.invalidateQueries({ queryKey: spendingKeys.categories() })
    ]);
}
