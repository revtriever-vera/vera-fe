import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { platformToken } from '../../../test/fixtures/admin';
import { problem } from '../../../test/fixtures/auth';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

function listTokens(...items: ReturnType<typeof platformToken>[]): void {
    server.use(http.get('*/platform/tokens', () => HttpResponse.json({ items })));
}

async function openForm(user: UserEvent): Promise<HTMLElement> {
    await user.click(await screen.findByRole('button', { name: 'Novo token' }));
    return screen.findByRole('dialog');
}

describe('Admin MCP tokens', () => {
    it('lists the tokens with hint, last use and status', async () => {
        listTokens(
            platformToken({ lastUsedAt: '2026-11-22T12:00:00.000Z' }),
            platformToken({ id: 'b', name: 'Antigo', expiresAt: '2020-01-01T00:00:00.000Z' }),
            platformToken({ id: 'c', name: 'Cancelado', revokedAt: '2026-11-21T12:00:00.000Z' })
        );
        renderRouterAt('/admin/tokens', { signedIn: true });

        const active: HTMLElement = (await screen.findByText('Notebook do Lucas')).closest('tr') as HTMLElement;
        expect(within(active).getByText('termina em a1b2')).toBeInTheDocument();
        expect(within(active).getByText('Ativo')).toBeInTheDocument();
        const expired: HTMLElement = screen.getByText('Antigo').closest('tr') as HTMLElement;
        expect(within(expired).getByText('Expirado')).toBeInTheDocument();
        expect(within(expired).getByText('Nunca usado')).toBeInTheDocument();
        const revoked: HTMLElement = screen.getByText('Cancelado').closest('tr') as HTMLElement;
        expect(within(revoked).getByText('Revogado')).toBeInTheDocument();
        expect(within(revoked).queryByRole('button', { name: 'Revogar o token Cancelado' })).not.toBeInTheDocument();
    });

    it('shows the empty state', async () => {
        renderRouterAt('/admin/tokens', { signedIn: true });

        expect(await screen.findByText('Nenhum token ainda')).toBeInTheDocument();
    });

    it('shows a failure when the tokens do not load', async () => {
        server.use(http.get('*/platform/tokens', () => HttpResponse.json(problem('core.internal', 500), { status: 500 })));
        renderRouterAt('/admin/tokens', { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar os tokens.')).toBeInTheDocument();
    });

    it('asks for a name before creating', async () => {
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/tokens', { signedIn: true });
        const dialog: HTMLElement = await openForm(user);

        await user.click(within(dialog).getByRole('button', { name: 'Criar token' }));

        expect(await within(dialog).findByText('Informe um nome.')).toBeInTheDocument();
    });

    it('creates the token and shows it once with the command ready', async () => {
        let body: unknown = null;
        server.use(
            http.post('*/platform/tokens', async ({ request }) => {
                body = await request.json();
                return HttpResponse.json({ ...platformToken(), token: 'vera_pat_segredo' }, { status: 201 });
            })
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/tokens', { signedIn: true });
        const dialog: HTMLElement = await openForm(user);

        await user.type(within(dialog).getByLabelText('Nome'), 'Notebook do Lucas');
        await user.click(within(dialog).getByRole('radio', { name: '365 dias' }));
        await user.click(within(dialog).getByRole('button', { name: 'Criar token' }));

        expect(await screen.findByText('Token criado')).toBeInTheDocument();
        expect(body).toEqual({ name: 'Notebook do Lucas', expiresInDays: 365 });
        expect(screen.getByText('vera_pat_segredo')).toBeInTheDocument();
        expect(
            screen.getByText(/claude mcp add --transport http vera .*\/mcp --header "Authorization: Bearer vera_pat_segredo"/)
        ).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Já copiei' }));
        await waitFor((): void => {
            expect(screen.queryByText('vera_pat_segredo')).not.toBeInTheDocument();
        });
    });

    it('explains the refusal of the API inside the form', async () => {
        server.use(http.post('*/platform/tokens', () => HttpResponse.json(problem('validation_failed', 400), { status: 400 })));
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/tokens', { signedIn: true });
        const dialog: HTMLElement = await openForm(user);

        await user.type(within(dialog).getByLabelText('Nome'), 'X');
        await user.click(within(dialog).getByRole('button', { name: 'Criar token' }));

        expect(await within(dialog).findByText('Confira o nome e a validade do token.')).toBeInTheDocument();
    });

    it('revokes an active token after the confirmation', async () => {
        listTokens(platformToken());
        let revoked: string | null = null;
        server.use(
            http.delete('*/platform/tokens/:id', ({ params }) => {
                revoked = String(params['id']);
                return new HttpResponse(null, { status: 204 });
            })
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/tokens', { signedIn: true });

        await user.click(await screen.findByRole('button', { name: 'Revogar o token Notebook do Lucas' }));
        await user.click(await screen.findByRole('button', { name: 'Revogar token' }));

        expect(await screen.findByText('Token revogado')).toBeInTheDocument();
        expect(revoked).toBe('55555555-5555-4555-8555-555555555555');
    });

    it('tells when the token to revoke is gone', async () => {
        listTokens(platformToken());
        server.use(
            http.delete('*/platform/tokens/:id', () =>
                HttpResponse.json(problem('identity.platform_token_not_found', 404), { status: 404 })
            )
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/tokens', { signedIn: true });

        await user.click(await screen.findByRole('button', { name: 'Revogar o token Notebook do Lucas' }));
        await user.click(await screen.findByRole('button', { name: 'Revogar token' }));

        expect(await screen.findByText('Este token não existe mais.')).toBeInTheDocument();
    });
});
