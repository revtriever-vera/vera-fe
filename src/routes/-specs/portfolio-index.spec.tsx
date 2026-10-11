import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { emptyOverview } from '../../../test/fixtures/portfolio';
import { installOverviewApi } from '../../../test/helpers/overview-api';
import { renderRouterAt } from '../../../test/router';

async function openOverview(): Promise<{ router: AnyRouter; user: UserEvent }> {
    const router: AnyRouter = renderRouterAt('/portfolio', { signedIn: true });
    await screen.findByText('R$ 1.773.100,40');
    return { router, user: userEvent.setup() };
}

describe('/portfolio: visão geral', () => {
    it('abre no layout do patrimônio com a aba Visão geral marcada', async () => {
        installOverviewApi();
        await openOverview();

        expect(screen.getByRole('heading', { name: 'Patrimônio', level: 1 })).toBeInTheDocument();
        const tabs: HTMLElement = screen.getByRole('navigation', { name: 'Seções do patrimônio' });
        expect(within(tabs).getByRole('link', { name: 'Visão geral' })).toHaveAttribute('aria-current', 'page');
    });

    it('Onde aportar leva ao aporte inteligente', async () => {
        installOverviewApi();
        const { router, user } = await openOverview();

        await user.click(screen.getByRole('link', { name: 'Onde aportar' }));

        expect(router.state.location.pathname).toBe('/portfolio/contribution');
    });

    it('clicar numa linha da tabela abre a classe', async () => {
        installOverviewApi();
        const { router, user } = await openOverview();
        const row: HTMLElement = within(screen.getByRole('table')).getByText('Cripto').closest('tr') as HTMLElement;

        await user.click(row);

        expect(router.state.location.pathname).toBe('/portfolio/classes/class-cripto');
    });

    it('a linha da tabela se abre pelo teclado com Enter', async () => {
        installOverviewApi();
        const { router, user } = await openOverview();
        const row: HTMLElement = within(screen.getByRole('table')).getByText('FIIs').closest('tr') as HTMLElement;

        row.focus();
        await user.keyboard('{Enter}');

        expect(router.state.location.pathname).toBe('/portfolio/classes/class-fii');
    });

    it('o cartão da lista estreita é um link para a classe', async () => {
        installOverviewApi();
        await openOverview();
        const card: HTMLElement = within(screen.getByRole('list', { name: 'Classes da carteira' })).getAllByRole('link')[5] as HTMLElement;

        expect(card).toHaveAttribute('href', '/portfolio/classes/class-acoes-eua');
    });

    it('trocar para US$ salva a moeda, refaz a consulta e mostra o total em dólar', async () => {
        const api = installOverviewApi();
        const { user } = await openOverview();

        await user.click(screen.getByRole('radio', { name: 'US$' }));

        expect(await screen.findByText('US$ 327.140,30')).toBeInTheDocument();
        expect(api.settingsPatches).toEqual([{ baseCurrency: 'USD' }]);
        expect(api.overviewCalls()).toBe(2);
    });

    it('o estado vazio leva ao cadastro do primeiro ativo', async () => {
        installOverviewApi({ overview: emptyOverview() });
        const router: AnyRouter = renderRouterAt('/portfolio', { signedIn: true });
        const user: UserEvent = userEvent.setup();

        await user.click(await screen.findByRole('link', { name: 'Cadastrar meu primeiro ativo' }));

        expect(router.state.location.pathname).toBe('/portfolio/get-started');
    });
});
