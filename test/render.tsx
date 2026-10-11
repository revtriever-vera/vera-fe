import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import { ToastProvider } from '@/app/providers/toast-provider';

function createClient(): QueryClient {
    return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

export function renderWithProviders(ui: ReactElement): RenderResult {
    const client: QueryClient = createClient();
    const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
        <QueryClientProvider client={client}>
            <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
    );
    return render(ui, { wrapper });
}

export interface QueryWrapper {
    readonly client: QueryClient;
    readonly wrapper: ({ children }: { children: ReactNode }) => ReactElement;
}

export function createQueryWrapper(): QueryWrapper {
    const client: QueryClient = createClient();
    const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    return { client, wrapper };
}
