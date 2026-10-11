import type { QueryClient } from '@tanstack/react-query';
import { spendingKeys } from '../../api/spending-keys';

export async function invalidateConnections(queryClient: QueryClient): Promise<void> {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: spendingKeys.connections() }),
        queryClient.invalidateQueries({ queryKey: spendingKeys.credentials() })
    ]);
}
