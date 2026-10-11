import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import type { AnyRouter } from '@tanstack/react-router';
import { installContributionApi } from '../../../test/helpers/contribution-api';
import { renderRouterAt } from '../../../test/router';

describe('rotas de /portfolio', () => {
    it.each([
        ['/portfolio', 'Visão geral'],
        ['/portfolio/targets', 'Carteira-alvo'],
        ['/portfolio/contribution', 'Aporte inteligente'],
        ['/portfolio/assets', 'Meus ativos']
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
        const router: AnyRouter = renderRouterAt('/portfolio', { signedIn: true });
        const tabs: HTMLElement = await screen.findByRole('navigation', { name: 'Seções do patrimônio' });
        const link: HTMLElement = within(tabs).getByRole('link', { name: 'Meus ativos' });

        link.click();

        await screen.findByRole('heading', { name: 'Meus ativos', level: 2 });
        expect(router.state.location.pathname).toBe('/portfolio/assets');
    });

    it('valida o parâmetro de busca de /portfolio/assets', async () => {
        const router: AnyRouter = renderRouterAt('/portfolio/assets?add=true&classId=x', { signedIn: true });
        await screen.findByRole('heading', { name: 'Meus ativos', level: 2 });

        expect(router.state.location.search).toEqual({ add: true, classId: 'x' });
    });

    it('descarta um parâmetro inválido em /portfolio/assets sem lançar', async () => {
        const router: AnyRouter = renderRouterAt('/portfolio/assets?add=talvez', { signedIn: true });
        await screen.findByRole('heading', { name: 'Meus ativos', level: 2 });

        expect(router.state.location.search).toEqual({});
    });

    it('lê o valor do aporte como número', async () => {
        installContributionApi();
        const router: AnyRouter = renderRouterAt('/portfolio/contribution?amount=1500', { signedIn: true });
        await screen.findByRole('heading', { name: 'Aporte inteligente', level: 2 });

        expect(router.state.location.search).toEqual({ amount: 1500 });
    });

    it('degrada /portfolio/contribution?amount=abc sem lançar', async () => {
        installContributionApi();
        const router: AnyRouter = renderRouterAt('/portfolio/contribution?amount=abc', { signedIn: true });
        await screen.findByRole('heading', { name: 'Aporte inteligente', level: 2 });

        await waitFor(() => {
            expect(router.state.location.search).toEqual({ amount: 10000 });
        });
    });
});
