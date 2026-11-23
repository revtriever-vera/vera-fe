import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { track } from '@/shared/lib/analytics';
import { mockHoldingsApi } from '../../../test/helpers/holdings-api';
import { sampleConcentration } from '../../../test/fixtures/portfolio';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

vi.mock('@/shared/lib/analytics', () => ({ track: vi.fn(), initAnalytics: vi.fn() }));

const PATH: string = '/portfolio/assets';

describe('/portfolio/assets: abas', () => {
    it('abre na lista e troca para Emissores e setores pela URL', async () => {
        mockHoldingsApi();
        server.use(http.get('*/portfolio/concentration', () => HttpResponse.json(sampleConcentration())));
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByRole('tab', { name: 'Ativos', selected: true })).toBeInTheDocument();
        await user.click(screen.getByRole('tab', { name: 'Emissores e setores' }));

        expect(await screen.findByRole('heading', { name: 'Por emissor' })).toBeInTheDocument();
        expect(router.state.location.search).toEqual({ tab: 'concentration' });
        expect(track).toHaveBeenCalledWith('assets_tab_viewed', { tab: 'concentration' });

        await user.click(screen.getByRole('tab', { name: 'Ativos' }));
        await waitFor(() => {
            expect(router.state.location.search).toEqual({});
        });
    });

    it('?tab=concentration abre a aba direto e valor inválido cai na lista', async () => {
        mockHoldingsApi();
        server.use(http.get('*/portfolio/concentration', () => HttpResponse.json(sampleConcentration())));
        renderRouterAt(`${PATH}?tab=concentration`, { signedIn: true });
        expect(await screen.findByRole('heading', { name: 'Por setor' })).toBeInTheDocument();
    });

    it('tab inválida usa a lista', async () => {
        mockHoldingsApi();
        renderRouterAt(`${PATH}?tab=xyz`, { signedIn: true });
        expect(await screen.findByRole('tab', { name: 'Ativos', selected: true })).toBeInTheDocument();
    });
});
