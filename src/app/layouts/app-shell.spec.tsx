import { describe, expect, it } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Wallet, PieChart } from 'lucide-react';
import {
    Link,
    Outlet,
    RouterProvider,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    type AnyRoute,
    type AnyRouter
} from '@tanstack/react-router';
import { SessionProvider } from '@/app/providers/session-provider';
import { server } from '../../../test/msw/server';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import type { NavItem } from './app-nav';
import { AppShell } from './app-shell';

const ASSETS_PATH: string = '/patrimonio/ativos';

const ITEMS: readonly NavItem[] = [
    { id: 'overview', to: '/patrimonio', labelKey: 'navPortfolioOverview', icon: PieChart, group: 'portfolio' },
    { id: 'assets', to: '/patrimonio/ativos', labelKey: 'navPortfolioAssets', icon: Wallet, group: 'portfolio' },
    { id: 'extra', to: '/extra', labelKey: 'navGroupSettings', icon: Wallet }
];

function renderShell(items: readonly NavItem[], path: string, withSlot: boolean = false): AnyRouter {
    server.use(...signedInHandlers());
    const root: AnyRoute = createRootRoute({ component: Outlet });
    const shell: AnyRoute = createRoute({
        getParentRoute: () => root,
        id: 'shell',
        component: () => (
            <AppShell items={items} topSlot={withSlot ? <p>Continuar configuração</p> : undefined}>
                <Link to={ASSETS_PATH}>ir para ativos</Link>
                <Outlet />
            </AppShell>
        )
    });
    const pages: AnyRoute[] = ['patrimonio', 'patrimonio/ativos', 'patrimonio/ativos/42', 'extra'].map((page: string) =>
        createRoute({ getParentRoute: () => shell, path: `/${page}`, component: () => <main>{`pagina ${page}`}</main> })
    );
    const router: AnyRouter = createRouter({
        routeTree: root.addChildren([shell.addChildren(pages)]),
        history: createMemoryHistory({ initialEntries: [path] })
    });
    render(
        <QueryClientProvider client={new QueryClient()}>
            <SessionProvider>
                <RouterProvider router={router} />
            </SessionProvider>
        </QueryClientProvider>
    );
    return router;
}

describe('AppShell', () => {
    it('renders the items, groups them and marks the active one', async () => {
        renderShell(ITEMS, '/patrimonio/ativos');

        const nav: HTMLElement = await screen.findByRole('navigation', { name: 'Navegação principal' });

        expect(within(nav).getByRole('heading', { name: 'Patrimônio' })).toBeInTheDocument();
        expect(within(nav).getByRole('link', { name: 'Meus ativos' })).toHaveAttribute('aria-current', 'page');
        expect(within(nav).getByRole('link', { name: 'Visão geral' })).not.toHaveAttribute('aria-current');
        expect(within(nav).getByRole('link', { name: 'Configurações' })).toBeInTheDocument();
    });

    it('keeps the parent item of a nested page as the only active one', async () => {
        renderShell(ITEMS, '/patrimonio/ativos/42');

        const nav: HTMLElement = await screen.findByRole('navigation', { name: 'Navegação principal' });

        expect(within(nav).getByRole('link', { name: 'Meus ativos' })).toHaveAttribute('aria-current', 'page');
        expect(within(nav).getByRole('link', { name: 'Visão geral' })).not.toHaveAttribute('aria-current');
    });

    it('renders the top slot when received', async () => {
        renderShell(ITEMS, '/patrimonio', true);

        expect(await screen.findByText('Continuar configuração')).toBeInTheDocument();
    });

    it('renders only the brand and the user box without items', async () => {
        renderShell([], '/patrimonio');

        const nav: HTMLElement = await screen.findByRole('navigation', { name: 'Navegação principal' });

        expect(within(nav).queryAllByRole('link')).toHaveLength(0);
        expect(await screen.findByRole('group', { name: 'Conta' })).toBeInTheDocument();
        expect(screen.getAllByText('vera').length).toBeGreaterThan(0);
    });

    it('opens the menu as a drawer, closes it with Escape and when navigating', async () => {
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderShell(ITEMS, '/patrimonio');

        await user.click(await screen.findByRole('button', { name: 'Abrir menu' }));
        const dialog: HTMLElement = screen.getByRole('dialog', { name: 'Navegação principal' });
        expect(dialog).toHaveFocus();
        expect(within(dialog).getByRole('link', { name: 'Meus ativos' })).toBeInTheDocument();

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveFocus();

        await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
        await user.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Meus ativos' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/patrimonio/ativos');
    });

    it('closes the drawer from the overlay and from the close button', async () => {
        const user: UserEvent = userEvent.setup();
        renderShell(ITEMS, '/patrimonio');

        await user.click(await screen.findByRole('button', { name: 'Abrir menu' }));
        await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Fechar menu' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
        const overlay: HTMLElement | undefined = screen
            .getAllByRole('button', { name: 'Fechar menu' })
            .find((node: HTMLElement) => node.tabIndex === -1);
        await user.click(overlay as HTMLElement);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('keeps the focus inside the drawer', async () => {
        const user: UserEvent = userEvent.setup();
        renderShell(ITEMS, '/patrimonio');
        await user.click(await screen.findByRole('button', { name: 'Abrir menu' }));
        const dialog: HTMLElement = screen.getByRole('dialog');
        const focusables: HTMLElement[] = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter(
            (node: HTMLElement) => node.tabIndex !== -1
        );

        act(() => {
            focusables[focusables.length - 1]?.focus();
        });
        await user.tab();
        expect(focusables[0]).toHaveFocus();

        await user.tab({ shift: true });
        expect(focusables[focusables.length - 1]).toHaveFocus();
    });
});
