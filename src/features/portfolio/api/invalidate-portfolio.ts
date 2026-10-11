import type { QueryClient } from '@tanstack/react-query';
import { portfolioKeys } from './portfolio-keys';

export async function invalidatePortfolio(queryClient: QueryClient): Promise<void> {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: portfolioKeys.holdings() }),
        queryClient.invalidateQueries({ queryKey: portfolioKeys.overview() }),
        queryClient.invalidateQueries({ queryKey: portfolioKeys.classes() }),
        queryClient.invalidateQueries({ queryKey: portfolioKeys.classDetails() })
    ]);
}
