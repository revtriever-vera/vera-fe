import { describe, expect, it } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { List, Wallet, PieChart } from 'lucide-react';
import { http, HttpResponse } from 'msw';
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

const ASSETS_PATH: string = '/portfolio/assets';

const BADGE_ITEMS: readonly NavItem[] = [
    {
        id: 'transactions',
        to: '/portfolio',
        labelKey: 'navSpendingTransactions',
        icon: List,
        group: 'spending',
        badge: 'spendingUncategorized'
    }
];

const ITEMS: readonly NavItem[] = [
    { id: 'overview', to: '/portfolio', labelKey: 'navPortfolioOverview', icon: PieChart, group: 'portfolio' },
    { id: 'assets', to: '/portfolio/assets', labelKey: 'navPortfolioAssets', icon: Wallet, group: 'portfolio' },
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
    const pages: AnyRoute[] = ['portfolio', 'portfolio/assets', 'portfolio/assets/42', 'extra'].map((page: string) =>
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
        renderShell(ITEMS, '/portfolio/assets');

        const nav: HTMLElement = await screen.findByRole('navigation', { name: 'Navegação principal' });

        expect(within(nav).getByRole('heading', { name: 'Patrimônio' })).toBeInTheDocument();
        expect(within(nav).getByRole('link', { name: 'Meus ativos' })).toHaveAttribute('aria-current', 'page');
        expect(within(nav).getByRole('link', { name: 'Visão geral' })).not.toHaveAttribute('aria-current');
        expect(within(nav).getByRole('link', { name: 'Configurações' })).toBeInTheDocument();
    });

    it('keeps the parent item of a nested page as the only active one', async () => {
        renderShell(ITEMS, '/portfolio/assets/42');

        const nav: HTMLElement = await screen.findByRole('navigation', { name: 'Navegação principal' });

        expect(within(nav).getByRole('link', { name: 'Meus ativos' })).toHaveAttribute('aria-current', 'page');
        expect(within(nav).getByRole('link', { name: 'Visão geral' })).not.toHaveAttribute('aria-current');
    });

    it('renders the top slot when received', async () => {
        renderShell(ITEMS, '/portfolio', true);

        expect(await screen.findByText('Continuar configuração')).toBeInTheDocument();
    });

    it('renders only the brand and the user box without items', async () => {
        renderShell([], '/portfolio');

        const nav: HTMLElement = await screen.findByRole('navigation', { name: 'Navegação principal' });

        expect(within(nav).queryAllByRole('link')).toHaveLength(0);
        expect(await screen.findByRole('group', { name: 'Conta' })).toBeInTheDocument();
        expect(screen.getAllByText('vera').length).toBeGreaterThan(0);
    });

    it('opens the menu as a drawer, closes it with Escape and when navigating', async () => {
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderShell(ITEMS, '/portfolio');

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
        expect(router.state.location.pathname).toBe('/portfolio/assets');
    });

    it('closes the drawer from the overlay and from the close button', async () => {
        const user: UserEvent = userEvent.setup();
        renderShell(ITEMS, '/portfolio');

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
        renderShell(ITEMS, '/portfolio');
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

    it('shows the uncategorized count in the menu and in the top bar button', async () => {
        const user: UserEvent = userEvent.setup();
        server.use(http.get('*/spending/transactions/uncategorized-count', () => HttpResponse.json({ count: 3 })));
        renderShell(BADGE_ITEMS, '/portfolio');

        const nav: HTMLElement = await screen.findByRole('navigation', { name: 'Navegação principal' });
        expect(await within(nav).findByRole('link', { name: /3 transações sem categoria/ })).toBeInTheDocument();

        await user.click(await screen.findByRole('button', { name: 'Abrir menu, 3 transações sem categoria' }));
        expect(within(screen.getByRole('dialog')).getByRole('link', { name: /3 transações sem categoria/ })).toBeInTheDocument();
    });

    it('uses the singular when there is one uncategorized transaction', async () => {
        server.use(http.get('*/spending/transactions/uncategorized-count', () => HttpResponse.json({ count: 1 })));
        renderShell(BADGE_ITEMS, '/portfolio');

        expect(await screen.findByRole('button', { name: 'Abrir menu, 1 transação sem categoria' })).toBeInTheDocument();
    });

    it('does not ask for the count when no item carries a badge', async () => {
        const calls: string[] = [];
        server.use(
            http.get('*/spending/transactions/uncategorized-count', () => {
                calls.push('count');
                return HttpResponse.json({ count: 3 });
            })
        );
        renderShell(ITEMS, '/portfolio');

        await screen.findByRole('navigation', { name: 'Navegação principal' });

        expect(calls).toEqual([]);
        expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument();
    });
});
