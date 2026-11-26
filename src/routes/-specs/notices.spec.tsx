import { afterEach, describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { tokenStore } from '@/shared/lib/api/token-store';
import { problem } from '../../../test/fixtures/auth';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

afterEach((): void => {
    tokenStore.set(null);
});

async function openPreferences(): Promise<HTMLElement> {
    renderRouterAt('/settings/preferences', { signedIn: true });
    return screen.findByRole('region', { name: 'Avisos por e-mail' });
}

describe('Avisos por e-mail em Preferências', () => {
    it('lista cada tipo com o interruptor no estado da pessoa', async () => {
        const card: HTMLElement = await openPreferences();

        expect(await within(card).findByRole('switch', { name: 'Débitos da semana' })).toBeChecked();
        expect(within(card).getByRole('switch', { name: 'Véspera do débito' })).not.toBeChecked();
        expect(within(card).getByRole('switch', { name: 'Objetivo atrasado' })).toBeChecked();
    });

    it('lista os avisos novos da carteira, com o texto de cada um', async () => {
        const card: HTMLElement = await openPreferences();

        expect(await within(card).findByRole('switch', { name: 'Data-com amanhã' })).toBeChecked();
        expect(within(card).getByRole('switch', { name: 'Pagamento de provento hoje' })).toBeChecked();
        expect(within(card).getByRole('switch', { name: 'Assembleia chegando' })).not.toBeChecked();
        expect(within(card).getByRole('switch', { name: 'Vencimento de renda fixa' })).toBeChecked();
        expect(within(card).queryByText('Outros avisos')).toBeNull();
    });

    it('liga a véspera e avisa', async () => {
        const user: UserEvent = userEvent.setup();
        const card: HTMLElement = await openPreferences();

        await user.click(await within(card).findByRole('switch', { name: 'Véspera do débito' }));

        expect(await screen.findByText('Você vai receber este aviso.')).toBeInTheDocument();
        await waitFor((): void => {
            expect(within(card).getByRole('switch', { name: 'Véspera do débito' })).toBeChecked();
        });
    });

    it('desliga um aviso e mostra o erro quando a API recusa', async () => {
        const user: UserEvent = userEvent.setup();
        const card: HTMLElement = await openPreferences();
        await user.click(await within(card).findByRole('switch', { name: 'Débitos da semana' }));
        expect(await screen.findByText('Você não vai mais receber este aviso.')).toBeInTheDocument();

        server.use(
            http.patch('*/notifications/preferences', () => HttpResponse.json(problem('notices.unknown_type', 422), { status: 422 }))
        );
        await user.click(await within(card).findByRole('switch', { name: 'Objetivo atrasado' }));

        expect(await screen.findByText('Este aviso não existe mais.')).toBeInTheDocument();
    });

    it('mostra o erro de carga e nomeia um tipo desconhecido de forma genérica', async () => {
        server.use(http.get('*/notifications/preferences', () => HttpResponse.json(problem('boom', 500), { status: 500 })));
        const card: HTMLElement = await openPreferences();
        expect(await within(card).findByText('Não foi possível carregar os avisos.')).toBeInTheDocument();
    });

    it('trata um tipo novo da API sem quebrar', async () => {
        server.use(http.get('*/notifications/preferences', () => HttpResponse.json({ items: [{ type: 'novo_tipo', enabled: true }] })));
        const card: HTMLElement = await openPreferences();
        expect(await within(card).findByRole('switch', { name: 'Outros avisos' })).toBeChecked();
    });
});

describe('Página de descadastro', () => {
    it('abre sem sessão, confirma no botão e mostra o aviso que parou', async () => {
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/avisos/sair/token-do-email');

        await user.click(await screen.findByRole('button', { name: 'Parar de receber' }));

        expect(await screen.findByRole('heading', { name: 'Pronto, parou' })).toBeInTheDocument();
        expect(screen.getByText('Você não recebe mais o aviso "Débitos da semana" por e-mail.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Abrir a Vera' })).toBeInTheDocument();
    });

    it('explica quando o link não vale mais', async () => {
        server.use(
            http.post('*/notifications/unsubscribe/:token', () => HttpResponse.json(problem('notices.invalid_token', 404), { status: 404 }))
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/avisos/sair/token-velho');

        await user.click(await screen.findByRole('button', { name: 'Parar de receber' }));

        expect(await screen.findByText(/Este link não vale mais/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Parar de receber' })).toBeEnabled();
    });
});
