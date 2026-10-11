import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { RouterProvider, createMemoryHistory, createRouter, type AnyRouter } from '@tanstack/react-router';
import { ToastProvider } from '@/app/providers/toast-provider';
import { routeTree } from '@/routeTree.gen';

export function renderRouterAt(path: string): AnyRouter {
    const client: QueryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    });
    const router: AnyRouter = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: [path] })
    });
    render(
        <QueryClientProvider client={client}>
            <ToastProvider>
                <RouterProvider router={router} />
            </ToastProvider>
        </QueryClientProvider>
    );
    return router;
}
