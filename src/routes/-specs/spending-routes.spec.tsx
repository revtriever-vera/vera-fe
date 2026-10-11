import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import { closedState } from '../../../test/fixtures/onboarding';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const TABS_LABEL: string = 'Seções dos gastos';

async function markedTabs(): Promise<string[]> {
    const tabs: HTMLElement = await screen.findByRole('navigation', { name: TABS_LABEL });
    return Array.from(tabs.querySelectorAll('a'))
        .filter((link: HTMLElement): boolean => link.classList.contains('bg-surface'))
        .map((link: HTMLElement): string => link.textContent ?? '');
}

describe('rotas de /spending', () => {
    it.each([
        ['/spending', 'Resumo do mês'],
        ['/spending/transactions', 'Transações'],
        ['/spending/cuts', 'Onde cortar'],
        ['/spending/connections', 'Conexões'],
        ['/spending/rules', 'Regras']
    ])('%s abre sob o título Gastos e só a aba %s fica marcada', async (path: string, active: string) => {
        renderRouterAt(path, { signedIn: true });

        expect(await screen.findByRole('heading', { name: 'Gastos', level: 1 })).toBeInTheDocument();
        expect(await markedTabs()).toEqual([active]);
    });

    it('as abas navegam entre as telas', async () => {
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt('/spending', { signedIn: true });
        const tabs: HTMLElement = await screen.findByRole('navigation', { name: TABS_LABEL });

        await user.click(within(tabs).getByRole('link', { name: 'Regras' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/spending/rules');
        });
        expect(await markedTabs()).toEqual(['Regras']);
    });

    it('a página de Conexões monta o cartão de importação', async () => {
        renderRouterAt('/spending/connections', { signedIn: true });

        expect(await screen.findByRole('region', { name: 'Suas credenciais' })).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: 'Importar arquivo' })).toBeInTheDocument();
    });

    it('lê o mês no resumo e nos cortes', async () => {
        const summary: AnyRouter = renderRouterAt('/spending?month=2026-09', { signedIn: true });
        await screen.findByRole('heading', { name: 'Gastos', level: 1 });
        expect(summary.state.location.search).toEqual({ month: '2026-09' });
    });

    it('degrada ?month=abc sem lançar', async () => {
        const router: AnyRouter = renderRouterAt('/spending?month=abc', { signedIn: true });
        await screen.findByRole('heading', { name: 'Gastos', level: 1 });

        expect(router.state.location.search).toEqual({});
    });

    it('valida os filtros de /spending/transactions e descarta o que for inválido', async () => {
        const router: AnyRouter = renderRouterAt(
            '/spending/transactions?month=2026-09&uncategorized=true&direction=out&q=padaria&page=2&direction=x',
            { signedIn: true }
        );
        await screen.findByRole('heading', { name: 'Gastos', level: 1 });

        expect(router.state.location.search).toEqual({ month: '2026-09', uncategorized: true, q: 'padaria', page: 2 });
    });

    it('aceita ?import=true em qualquer tela de gastos', async () => {
        const router: AnyRouter = renderRouterAt('/spending/connections?import=true', { signedIn: true });
        await screen.findByRole('heading', { name: 'Gastos', level: 1 });

        expect(router.state.location.search).toEqual({ import: true });
    });
});

async function menuLinks(): Promise<HTMLElement> {
    const nav: HTMLElement = (await screen.findAllByRole('navigation', { name: 'Navegação principal' }))[0] as HTMLElement;
    await screen.findByRole('heading', { name: 'Gastos', level: 1 });
    return nav;
}

describe('menu lateral do grupo Gastos', () => {
    it('mostra o grupo com os quatro itens', async () => {
        renderRouterAt('/spending', { signedIn: true });

        const nav: HTMLElement = await menuLinks();

        expect(within(nav).getByRole('heading', { name: 'Gastos' })).toBeInTheDocument();
        for (const name of ['Resumo do mês', 'Transações', 'Onde cortar', 'Conexões']) {
            expect(within(nav).getByRole('link', { name })).toBeInTheDocument();
        }
        expect(within(nav).getByRole('link', { name: 'Resumo do mês' })).toHaveAttribute('aria-current', 'page');
    });

    it('mostra o contador de sem categoria com nome acessível', async () => {
        server.use(http.get('*/spending/transactions/uncategorized-count', () => HttpResponse.json({ count: 3 })));
        renderRouterAt('/spending', { signedIn: true });

        const nav: HTMLElement = await menuLinks();

        expect(await within(nav).findByRole('link', { name: /3 transações sem categoria/ })).toHaveTextContent('Transações');
    });

    it('não mostra o contador quando é zero', async () => {
        renderRouterAt('/spending', { signedIn: true });

        const nav: HTMLElement = await menuLinks();

        await waitFor(() => {
            expect(within(nav).getByRole('link', { name: 'Transações' })).toBeInTheDocument();
        });
    });

    it('não mostra o contador nem consulta a API com os dados de exemplo ativos', async () => {
        const calls: string[] = [];
        server.use(
            http.get('*/spending/transactions/uncategorized-count', () => {
                calls.push('count');
                return HttpResponse.json({ count: 3 });
            }),
            http.get('*/onboarding', () => HttpResponse.json(closedState({ sample: { active: true, available: true } })))
        );
        renderRouterAt('/spending', { signedIn: true });

        const nav: HTMLElement = await menuLinks();
        await screen.findByText('Você está vendo dados de exemplo. Eles não são seus.');

        expect(within(nav).getByRole('link', { name: 'Transações' })).toBeInTheDocument();
        expect(within(nav).queryByRole('link', { name: /sem categoria/ })).not.toBeInTheDocument();
        expect(calls).toEqual([]);
    });
});
