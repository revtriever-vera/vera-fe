import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import {
    RouterProvider,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    type AnyRoute,
    type AnyRouter
} from '@tanstack/react-router';
import { ToastProvider } from '@/app/providers/toast-provider';
import { SampleDataContext, type SampleDataControls } from '@/shared/lib/sample-data/sample-data-context';

export interface RenderInRouterOptions {
    readonly path?: string;
    readonly sample?: SampleDataControls;
    readonly client?: QueryClient;
}

export interface RenderedInRouter {
    readonly router: AnyRouter;
    readonly client: QueryClient;
}

export function sampleControls(overrides: Partial<SampleDataControls> = {}): SampleDataControls {
    return {
        available: true,
        active: false,
        isLoading: false,
        load: (): Promise<void> => Promise.resolve(),
        clear: (): Promise<void> => Promise.resolve(),
        ...overrides
    };
}

export function renderInRouter(ui: ReactElement, { path = '/', sample, client }: RenderInRouterOptions = {}): RenderedInRouter {
    const queryClient: QueryClient =
        client ?? new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const wrap = (children: ReactNode): ReactElement =>
        sample === undefined ? <>{children}</> : <SampleDataContext value={sample}>{children}</SampleDataContext>;
    const root: AnyRoute = createRootRoute({ component: (): ReactElement => wrap(ui) });
    const catchAll: AnyRoute = createRoute({ getParentRoute: () => root, path: '$', component: (): ReactElement => wrap(ui) });
    const router: AnyRouter = createRouter({
        routeTree: root.addChildren([catchAll]),
        history: createMemoryHistory({ initialEntries: [path] })
    });
    render(
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <RouterProvider router={router} />
            </ToastProvider>
        </QueryClientProvider>
    );
    return { router, client: queryClient };
}
