import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { RouterProvider, createMemoryHistory, createRootRoute, createRouter, type AnyRouter } from '@tanstack/react-router';
import { BillingContext, type BillingState } from '@/shared/lib/billing/billing-context';
import { billingState } from './fixtures/billing';

export interface BillingRender {
    readonly state: BillingState;
    readonly container: HTMLElement;
}

export function renderWithBilling(ui: ReactElement, overrides: Partial<BillingState> = {}): BillingRender {
    const state: BillingState = billingState(overrides);
    const router: AnyRouter = createRouter({
        routeTree: createRootRoute({ component: () => ui }),
        history: createMemoryHistory({ initialEntries: ['/'] })
    });
    const { container } = render(
        <BillingContext value={state}>
            <RouterProvider router={router} />
        </BillingContext>
    );
    return { state, container };
}
