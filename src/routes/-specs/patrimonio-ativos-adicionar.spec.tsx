import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { mockAssetsApi } from '../../../test/helpers/assets-api';
import { renderRouterAt } from '../../../test/router';

describe('/patrimonio/ativos: Adicionar ativo', () => {
    it('o botão abre o modal e fechar limpa a busca', async () => {
        mockAssetsApi();
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt('/patrimonio/ativos', { signedIn: true });

        await user.click(await screen.findByRole('button', { name: 'Adicionar ativo' }));
        expect(await screen.findByRole('dialog', { name: 'O que você quer adicionar?' })).toBeInTheDocument();
        expect(router.state.location.search).toEqual({ add: true });

        await user.keyboard('{Escape}');

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).toBeNull();
        });
        expect(router.state.location.search).toEqual({});
        expect(screen.getByRole('button', { name: 'Adicionar ativo' })).toHaveFocus();
    });

    it('?add=true&classId= abre o modal já com a classe pré-selecionada', async () => {
        mockAssetsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/patrimonio/ativos?add=true&classId=class-fii', { signedIn: true });

        await user.click(await screen.findByRole('button', { name: /Renda fixa/ }));

        expect(await screen.findByRole('combobox', { name: 'Classe' })).toHaveTextContent('FIIs');
    });
});
