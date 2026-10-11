import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/shared/lib/api/api-error';

function shouldRetry(failureCount: number, error: unknown): boolean {
    if (error instanceof ApiError && error.status < 500) {
        return false;
    }
    return failureCount < 2;
}

export function QueryProvider({ children }: { readonly children: ReactNode }): ReactElement {
    const [client] = useState(
        (): QueryClient =>
            new QueryClient({
                defaultOptions: {
                    queries: { staleTime: 30_000, retry: shouldRetry },
                    mutations: { retry: false }
                }
            })
    );
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
