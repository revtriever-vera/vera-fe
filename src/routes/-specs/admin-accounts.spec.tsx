import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { accountAccess, accountItem, accountList, platformOverview, signupLink } from '../../../test/fixtures/admin';
import { problem } from '../../../test/fixtures/auth';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

function useAccounts(): void {
    server.use(
        http.get('*/platform/overview', () => HttpResponse.json(platformOverview())),
        http.get('*/platform/signup-links', () => HttpResponse.json({ items: [signupLink()] })),
        http.get('*/platform/accounts', () =>
            HttpResponse.json(
                accountList([
                    accountItem(),
                    accountItem({
                        id: '66666666-6666-4666-8666-666666666666',
                        name: 'Casa Souza',
                        plan: 'premium',
                        planSource: 'trial',
                        trialEndsAt: '2026-12-01T12:00:00.000Z'
                    })
                ])
            )
        )
    );
}

async function openAccount(user: UserEvent, reason: string): Promise<void> {
    await user.click(await screen.findByRole('button', { name: 'Abrir a conta Família Silva' }));
    if (reason !== '') {
        await user.type(screen.getByLabelText('Motivo'), reason);
    }
}

describe('Admin accounts route', () => {
    it('shows the numbers, the funnel by link and the list of accounts', async () => {
        useAccounts();
        renderRouterAt('/admin/accounts', { signedIn: true });

        expect(await screen.findByText('Família Silva')).toBeInTheDocument();
        const numbers: HTMLElement = screen.getByRole('region', { name: 'Números da plataforma' });
        expect(within(numbers).getByText('120')).toBeInTheDocument();
        expect(within(numbers).getByText('30')).toBeInTheDocument();
        const funnel: HTMLElement = await screen.findByRole('region', { name: 'Funil por link' });
        expect(within(funnel).getByText('Parceiros')).toBeInTheDocument();
        expect(within(funnel).getByText('12')).toBeInTheDocument();
        expect(screen.getByText('Premium em teste')).toBeInTheDocument();
    });

    it('shows the empty state when there is no account', async () => {
        renderRouterAt('/admin/accounts', { signedIn: true });

        expect(await screen.findByText('Nenhuma conta ainda')).toBeInTheDocument();
    });

    it('searches by name', async () => {
        const searches: (string | null)[] = [];
        server.use(
            http.get('*/platform/accounts', ({ request }) => {
                searches.push(new URL(request.url).searchParams.get('search'));
                return HttpResponse.json(accountList([]));
            })
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/accounts', { signedIn: true });

        await user.type(await screen.findByRole('searchbox', { name: 'Buscar conta' }), 'silva');

        await waitFor(() => {
            expect(searches).toContain('silva');
        });
        expect(await screen.findByText('Nenhuma conta encontrada')).toBeInTheDocument();
    });

    it('shows a failure when the accounts do not load', async () => {
        server.use(http.get('*/platform/accounts', () => HttpResponse.json(problem('core.internal', 500), { status: 500 })));
        renderRouterAt('/admin/accounts', { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar as contas.')).toBeInTheDocument();
    });

    it('refuses to open an account without a reason and sends nothing', async () => {
        useAccounts();
        let called: boolean = false;
        server.use(
            http.post('*/platform/accounts/:id/access', () => {
                called = true;
                return HttpResponse.json(accountAccess());
            })
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/accounts', { signedIn: true });

        await openAccount(user, '');
        await user.click(screen.getByRole('button', { name: 'Abrir conta' }));

        expect(await screen.findByText('Informe o motivo.')).toBeInTheDocument();
        expect(called).toBe(false);
    });

    it('opens the summary and the data with the reason, marked as recorded and read only', async () => {
        useAccounts();
        let body: unknown = null;
        server.use(
            http.post('*/platform/accounts/:id/access', async ({ request }) => {
                body = await request.json();
                return HttpResponse.json(accountAccess());
            })
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/accounts', { signedIn: true });

        await openAccount(user, 'Cliente pediu ajuda');
        await user.click(screen.getByRole('checkbox', { name: /Dados da conta/ }));
        await user.click(screen.getByRole('button', { name: 'Abrir conta' }));

        expect(await screen.findByText('Acesso registrado')).toBeInTheDocument();
        expect(body).toEqual({ reason: 'Cliente pediu ajuda', layers: ['summary', 'data'] });
        expect(screen.getByText('Motivo: Cliente pediu ajuda')).toBeInTheDocument();
        expect(screen.getByText('ana@example.com')).toBeInTheDocument();
        expect(screen.getByText('Reserva')).toBeInTheDocument();
        expect(screen.getByText(/Só leitura/)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Voltar às contas' }));
        expect(await screen.findByText('Família Silva')).toBeInTheDocument();
    });

    it('tells when the account no longer exists', async () => {
        useAccounts();
        server.use(
            http.post('*/platform/accounts/:id/access', () =>
                HttpResponse.json(problem('platform.account_not_found', 404), { status: 404 })
            )
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/accounts', { signedIn: true });

        await openAccount(user, 'Cliente pediu ajuda');
        await user.click(screen.getByRole('button', { name: 'Abrir conta' }));

        expect(await screen.findByText('Essa conta não existe mais.')).toBeInTheDocument();
    });

    it('refuses a session that is not of the system company', async () => {
        server.use(
            http.get('*/platform/audit', () => HttpResponse.json(problem('identity.platform_only', 403), { status: 403 })),
            http.get('*/platform/accounts', () => HttpResponse.json(problem('identity.platform_only', 403), { status: 403 }))
        );
        renderRouterAt('/admin/accounts', { signedIn: true });

        expect(await screen.findByText('Sem acesso ao admin')).toBeInTheDocument();
    });
});
