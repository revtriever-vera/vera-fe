import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { RouterProvider, createMemoryHistory, createRouter, type AnyRouter } from '@tanstack/react-router';
import { LocaleSync } from '@/app/providers/locale-sync';
import { SessionProvider } from '@/app/providers/session-provider';
import { ToastProvider } from '@/app/providers/toast-provider';
import { routeTree } from '@/routeTree.gen';
import { registerRenderedClient } from './rendered-clients';
import { server } from './msw/server';
import { signedInHandlers } from './msw/handlers/auth.handlers';

export interface RenderRouterOptions {
    readonly signedIn?: boolean;
}

export function renderRouterAt(path: string, { signedIn = false }: RenderRouterOptions = {}): AnyRouter {
    if (signedIn) {
        server.use(...signedInHandlers());
    }
    const client: QueryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    });
    registerRenderedClient(client);
    const router: AnyRouter = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: [path] })
    });
    render(
        <QueryClientProvider client={client}>
            <SessionProvider>
                <LocaleSync />
                <ToastProvider>
                    <RouterProvider router={router} />
                </ToastProvider>
            </SessionProvider>
        </QueryClientProvider>
    );
    return router;
}
