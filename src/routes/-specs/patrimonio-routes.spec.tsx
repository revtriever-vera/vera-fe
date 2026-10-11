import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import type { AnyRouter } from '@tanstack/react-router';
import { installContributionApi } from '../../../test/helpers/contribution-api';
import { renderRouterAt } from '../../../test/router';

const ROUTES: readonly string[] = ['/patrimonio/ativos', '/patrimonio/comecar', '/patrimonio/classes/class-fii'];

describe('rotas de /patrimonio', () => {
    it.each(ROUTES)('%s abre dentro do layout com o título e a página em construção', async (path: string) => {
        renderRouterAt(path, { signedIn: true });

        expect(await screen.findByRole('heading', { name: 'Patrimônio', level: 1 })).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: 'Em construção' })).toBeInTheDocument();
    });

    it.each([
        ['/patrimonio', 'Visão geral'],
        ['/patrimonio/carteira-alvo', 'Carteira-alvo'],
        ['/patrimonio/aporte', 'Aporte inteligente'],
        ['/patrimonio/ativos', 'Meus ativos']
    ])('em %s só a aba %s fica marcada', async (path: string, active: string) => {
        renderRouterAt(path, { signedIn: true });

        const tabs: HTMLElement = await screen.findByRole('navigation', { name: 'Seções do patrimônio' });
        const links: HTMLElement[] = Array.from(tabs.querySelectorAll('a'));
        const marked: string[] = links
            .filter((link: HTMLElement): boolean => link.classList.contains('bg-surface'))
            .map((link: HTMLElement): string => link.textContent ?? '');

        expect(marked).toEqual([active]);
    });

    it('as abas navegam entre as telas', async () => {
        const router: AnyRouter = renderRouterAt('/patrimonio', { signedIn: true });
        const tabs: HTMLElement = await screen.findByRole('navigation', { name: 'Seções do patrimônio' });
        const link: HTMLElement = within(tabs).getByRole('link', { name: 'Meus ativos' });

        link.click();

        await screen.findByRole('heading', { name: 'Em construção' });
        expect(router.state.location.pathname).toBe('/patrimonio/ativos');
    });

    it('valida o parâmetro de busca de /patrimonio/ativos', async () => {
        const router: AnyRouter = renderRouterAt('/patrimonio/ativos?add=true&classId=x', { signedIn: true });
        await screen.findByRole('heading', { name: 'Em construção' });

        expect(router.state.location.search).toEqual({ add: true, classId: 'x' });
    });

    it('descarta um parâmetro inválido em /patrimonio/ativos sem lançar', async () => {
        const router: AnyRouter = renderRouterAt('/patrimonio/ativos?add=talvez', { signedIn: true });
        await screen.findByRole('heading', { name: 'Em construção' });

        expect(router.state.location.search).toEqual({});
    });

    it('lê o valor do aporte como número', async () => {
        installContributionApi();
        const router: AnyRouter = renderRouterAt('/patrimonio/aporte?amount=1500', { signedIn: true });
        await screen.findByRole('heading', { name: 'Aporte inteligente', level: 2 });

        expect(router.state.location.search).toEqual({ amount: 1500 });
    });

    it('degrada /patrimonio/aporte?amount=abc sem lançar', async () => {
        installContributionApi();
        const router: AnyRouter = renderRouterAt('/patrimonio/aporte?amount=abc', { signedIn: true });
        await screen.findByRole('heading', { name: 'Aporte inteligente', level: 2 });

        await waitFor(() => {
            expect(router.state.location.search).toEqual({ amount: 10000 });
        });
    });
});
