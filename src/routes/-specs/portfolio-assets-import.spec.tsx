import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { mockHoldingsApi } from '../../../test/helpers/holdings-api';
import { sessionIdentity } from '../../../test/fixtures/auth';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const PATH: string = '/portfolio/assets';

describe('/portfolio/assets: importar operações', () => {
    it('dono vê o botão e abre o passo do relatório, com o histórico vazio', async () => {
        mockHoldingsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });

        await user.click(await screen.findByRole('button', { name: 'Importar operações' }));

        expect(await screen.findByRole('dialog', { name: 'Importar operações' })).toBeInTheDocument();
        expect(screen.getByLabelText('Relatório da B3')).toBeInTheDocument();
        expect(await screen.findByText('Você ainda não importou nenhum relatório.')).toBeInTheDocument();
    });

    it('quem só lê não vê o botão', async () => {
        renderRouterAt(PATH, { signedIn: true });
        server.use(http.get('*/auth/me', () => HttpResponse.json(sessionIdentity({ role: 'viewer' }))));

        expect(await screen.findByText('Nenhum ativo cadastrado')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Importar operações' })).not.toBeInTheDocument();
    });

    it('editor também importa', async () => {
        mockHoldingsApi();
        renderRouterAt(PATH, { signedIn: true });
        server.use(http.get('*/auth/me', () => HttpResponse.json(sessionIdentity({ role: 'editor' }))));

        expect(await screen.findByRole('button', { name: 'Importar operações' })).toBeInTheDocument();
    });
});
