import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { holding } from '../../../test/fixtures/portfolio';
import { mockWalletApi } from '../../../test/helpers/wallet-api';
import { renderRouterAt } from '../../../test/router';

describe('/patrimonio/comecar', () => {
    it('vazia: mostra a etapa e o rodapé Pular por enquanto, que leva à visão geral', async () => {
        mockWalletApi([]);
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt('/patrimonio/comecar', { signedIn: true });

        expect(await screen.findByRole('heading', { name: 'Cadastre seus investimentos' })).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: 'Sua carteira (0)' })).toBeInTheDocument();
        await user.click(screen.getByRole('link', { name: 'Pular por enquanto' }));

        expect(router.state.location.pathname).toBe('/patrimonio');
    });

    it('com ativos: o rodapé vira Ver minha visão geral', async () => {
        mockWalletApi([holding()]);
        renderRouterAt('/patrimonio/comecar', { signedIn: true });

        expect(await screen.findByRole('link', { name: 'Ver minha visão geral' })).toHaveAttribute('href', '/patrimonio');
        expect(screen.queryByRole('link', { name: 'Pular por enquanto' })).toBeNull();
    });
});

describe('/onboarding/assets', () => {
    it('preenche os encaixes com os cards e a coluna da carteira', async () => {
        mockWalletApi([holding()]);
        renderRouterAt('/onboarding/assets', { signedIn: true });

        const wallet: HTMLElement = await screen.findByTestId('assets-wallet');
        expect(await within(wallet).findByText('ITUB4')).toBeInTheDocument();
        expect(within(screen.getByTestId('assets-type-picker')).getAllByRole('button')).toHaveLength(7);
    });
});
