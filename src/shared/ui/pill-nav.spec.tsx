import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
    RouterProvider,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    type AnyRootRoute,
    type AnyRoute,
    type AnyRouter
} from '@tanstack/react-router';
import { PillNav } from './pill-nav';

function Page(): ReactElement {
    return (
        <PillNav
            label="Filtros"
            items={[
                { to: '/', label: 'Todos' },
                { to: '/outro', label: 'Outro' }
            ]}
        />
    );
}

function renderPillNav(path: string): void {
    const rootRoute: AnyRootRoute = createRootRoute();
    const indexRoute: AnyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Page });
    const otherRoute: AnyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/outro', component: Page });
    const routeTree: AnyRoute = rootRoute.addChildren([indexRoute, otherRoute]);
    const router: AnyRouter = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) });
    render(<RouterProvider router={router} />);
}

describe('PillNav', () => {
    it('renderiza um pill por item', async () => {
        renderPillNav('/');

        expect(await screen.findByRole('link', { name: 'Todos' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Outro' })).toBeInTheDocument();
    });
});
