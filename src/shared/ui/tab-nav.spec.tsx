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
import { TabNav } from './tab-nav';

function Page(): ReactElement {
    return (
        <TabNav
            label="Seções"
            tabs={[
                { to: '/', label: 'Início' },
                { to: '/outro', label: 'Outro' }
            ]}
        />
    );
}

function renderTabNav(path: string): void {
    const rootRoute: AnyRootRoute = createRootRoute();
    const indexRoute: AnyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Page });
    const otherRoute: AnyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/outro', component: Page });
    const routeTree: AnyRoute = rootRoute.addChildren([indexRoute, otherRoute]);
    const router: AnyRouter = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) });
    render(<RouterProvider router={router} />);
}

describe('TabNav', () => {
    it('marca a aba da rota atual como ativa', async () => {
        renderTabNav('/');

        expect(await screen.findByRole('link', { name: 'Início' })).toHaveClass('bg-surface');
        expect(screen.getByRole('link', { name: 'Outro' })).not.toHaveClass('bg-surface');
    });
});
