import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import { RouterProvider, createMemoryHistory, createRootRoute, createRouter, type AnyRouter } from '@tanstack/react-router';
import { SessionProvider, useSession } from '@/app/providers/session-provider';
import { ToastProvider } from '@/app/providers/toast-provider';
import { BillingContext, type BillingState } from '@/shared/lib/billing/billing-context';
import type { FeatureAccess } from '@/shared/lib/billing/billing-types';
import type { SessionIdentity } from '@/features/auth/types';
import { billingState } from './fixtures/billing';
import { sessionIdentity } from './fixtures/auth';
import { server } from './msw/server';
import { signedInHandlers } from './msw/handlers/auth.handlers';
import { http, HttpResponse } from 'msw';

export interface SummariesRenderOptions {
    readonly billing?: Partial<BillingState>;
    readonly identity?: Partial<SessionIdentity>;
}

function SessionReady({ children }: { readonly children: ReactNode }): ReactElement | null {
    const { isRestoring } = useSession();
    return isRestoring ? null : <>{children}</>;
}

export function featureAccess(state: FeatureAccess): () => FeatureAccess {
    return (): FeatureAccess => state;
}

export function renderSummaries(ui: ReactElement, { billing = {}, identity = {} }: SummariesRenderOptions = {}): RenderResult {
    server.use(
        http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity(identity))),
        ...signedInHandlers()
    );
    const client: QueryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const router: AnyRouter = createRouter({
        routeTree: createRootRoute({ component: () => <SessionReady>{ui}</SessionReady> }),
        history: createMemoryHistory({ initialEntries: ['/'] })
    });
    return render(
        <QueryClientProvider client={client}>
            <SessionProvider>
                <ToastProvider>
                    <BillingContext value={billingState(billing)}>
                        <RouterProvider router={router} />
                    </BillingContext>
                </ToastProvider>
            </SessionProvider>
        </QueryClientProvider>
    );
}
