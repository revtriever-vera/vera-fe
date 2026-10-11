import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { http } from 'msw';
import { installClassDetailApi } from '../../../../../test/helpers/class-detail-api';
import { server } from '../../../../../test/msw/server';
import { renderRouterAt } from '../../../../../test/router';

const PATH: string = '/portfolio/classes/class-acoes-br';

describe('ClassDetailPage', () => {
    it('mostra o carregamento enquanto o detalhe não chega', async () => {
        server.use(http.get('*/portfolio/classes/:classId', () => new Promise<Response>(() => undefined)));
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Carregando a classe')).toBeInTheDocument();
    });

    it('mostra o detalhe da classe quando a API responde', async () => {
        installClassDetailApi();
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByRole('heading', { name: 'Ações Brasil' })).toBeInTheDocument();
        expect(screen.getByRole('list', { name: 'Ativos da classe' })).toBeInTheDocument();
    });
});
