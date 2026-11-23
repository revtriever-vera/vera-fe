import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { tokenStore } from '@/shared/lib/api/token-store';
import { track } from '@/shared/lib/analytics';
import { ana, member, membersList, pendingInvite } from '../../../test/fixtures/members';
import { problem, sessionIdentity } from '../../../test/fixtures/auth';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

vi.mock('@/shared/lib/analytics', () => ({ track: vi.fn(), resetAnalytics: vi.fn(), initAnalytics: vi.fn() }));

type Role = 'owner' | 'editor' | 'viewer';

async function openPeople(role: Role = 'owner', list: ReturnType<typeof membersList> = membersList()): Promise<void> {
    server.use(
        http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ role }))),
        http.get('*/members', (): Response => HttpResponse.json(list)),
        ...signedInHandlers()
    );
    renderRouterAt('/settings/people');
    await screen.findByRole('region', { name: 'Pessoas da conta' });
}

function failWith(method: 'post' | 'patch' | 'delete', path: string, type: string, status: number): void {
    server.use(http[method](path, (): Response => HttpResponse.json(problem(type, status), { status })));
}

afterEach((): void => {
    tokenStore.set(null);
    vi.clearAllMocks();
});

describe('people list', () => {
    it('shows active people and pending invites with their chips', async () => {
        await openPeople();

        const list: HTMLElement = screen.getByRole('region', { name: 'Pessoas da conta' });
        expect(within(list).getByText('3 pessoas')).toBeInTheDocument();
        expect(within(list).getByText('você')).toBeInTheDocument();
        expect(within(list).getByText('convite enviado')).toBeInTheDocument();
        expect(within(list).getByText(/Editor: mexe em carteira e gastos/)).toBeInTheDocument();
        expect(within(list).getByText('o link vale 3 dias')).toBeInTheDocument();
    });

    it('shows an expired invite as expired, still with resend', async () => {
        const expired: string = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        await openPeople('owner', membersList({ invites: [pendingInvite({ expiresAt: expired })] }));

        expect(screen.getByText('o link expirou, reenvie o convite')).toBeInTheDocument();
        expect(screen.queryByText(/o link vale/)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reenviar' })).toBeInTheDocument();
    });

    it('locks the role of the only owner', async () => {
        await openPeople('owner', membersList({ members: [member()], invites: [] }));

        expect(screen.getByRole('combobox', { name: 'Papel de Maria Teste' })).toBeDisabled();
        expect(screen.getByText(/Você é o único dono/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Sair da conta' })).not.toBeInTheDocument();
    });

    it('changes a role with PATCH and confirms with a toast', async () => {
        const user: UserEvent = userEvent.setup();
        const bodies: unknown[] = [];
        server.use(
            http.patch('*/members/:id', async ({ request }): Promise<Response> => {
                bodies.push(await request.json());
                return HttpResponse.json({ member: ana({ role: 'viewer' }) });
            })
        );
        await openPeople();

        await user.click(screen.getByRole('combobox', { name: 'Papel de Ana Souza' }));
        await user.click(await screen.findByRole('option', { name: 'Leitura' }));

        expect(await screen.findByText('Papel de Ana Souza atualizado.')).toBeInTheDocument();
        expect(bodies).toEqual([{ role: 'viewer' }]);
        expect(track).toHaveBeenCalledWith('member_role_changed', { from: 'editor', to: 'viewer' });
    });

    it('shows the last owner message', async () => {
        const user: UserEvent = userEvent.setup();
        failWith('patch', '*/members/:id', 'members.last_owner', 409);
        await openPeople();

        await user.click(screen.getByRole('combobox', { name: 'Papel de Ana Souza' }));
        await user.click(await screen.findByRole('option', { name: 'Dono' }));

        expect(await screen.findByText('A conta precisa de pelo menos um Dono. Passe o papel a outra pessoa antes.')).toBeInTheDocument();
    });

    it('resends a pending invite', async () => {
        const user: UserEvent = userEvent.setup();
        server.use(
            http.post('*/members/invites/:id/resend', (): Response =>
                HttpResponse.json({
                    invite: { id: pendingInvite().id, email: 'ana@exemplo.com', role: 'viewer', expiresAt: pendingInvite().expiresAt }
                })
            )
        );
        await openPeople();

        await user.click(screen.getByRole('button', { name: 'Reenviar' }));

        expect(await screen.findByText('Convite reenviado para ana@exemplo.com')).toBeInTheDocument();
    });
});

describe('removing', () => {
    it('removes an active person after confirming', async () => {
        const user: UserEvent = userEvent.setup();
        const calls: string[] = [];
        server.use(
            http.delete('*/members/:id', ({ params }): Response => {
                calls.push(String(params['id']));
                return new HttpResponse(null, { status: 204 });
            })
        );
        await openPeople();

        const row: HTMLElement = screen.getByText('Ana Souza').closest('li') as HTMLElement;
        await user.click(within(row).getByRole('button', { name: 'Remover' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Remover Ana Souza?' });
        expect(within(dialog).getByText('Ana Souza perde o acesso à conta.')).toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Remover' }));

        await waitFor((): void => {
            expect(calls).toEqual(['00000000-0000-4000-8000-000000000002']);
        });
        expect(track).toHaveBeenCalledWith('member_removed');
    });

    it('revokes a pending invite with its own text', async () => {
        const user: UserEvent = userEvent.setup();
        const calls: string[] = [];
        server.use(
            http.delete('*/members/invites/:id', ({ params }): Response => {
                calls.push(String(params['id']));
                return new HttpResponse(null, { status: 204 });
            })
        );
        await openPeople();

        const row: HTMLElement = screen.getByText('ana@exemplo.com').closest('li') as HTMLElement;
        await user.click(within(row).getByRole('button', { name: 'Remover' }));
        const dialog: HTMLElement = await screen.findByRole('dialog');
        expect(within(dialog).getByText('O link do convite deixa de funcionar.')).toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Remover' }));

        await waitFor((): void => {
            expect(calls).toEqual([pendingInvite().id]);
        });
    });
});

describe('inviting', () => {
    it('blocks an invalid e-mail', async () => {
        const user: UserEvent = userEvent.setup();
        await openPeople();

        await user.type(screen.getByLabelText('E-mail'), 'ana');
        await user.click(screen.getByRole('button', { name: 'Enviar convite' }));

        expect(await screen.findByText('Esse e-mail não parece certo.')).toBeInTheDocument();
    });

    it('sends the invite with the default Editor role', async () => {
        const user: UserEvent = userEvent.setup();
        const bodies: unknown[] = [];
        server.use(
            http.post('*/members/invites', async ({ request }): Promise<Response> => {
                bodies.push(await request.json());
                return HttpResponse.json(
                    { invite: { id: pendingInvite().id, email: 'novo@exemplo.com', role: 'editor', expiresAt: pendingInvite().expiresAt } },
                    { status: 201 }
                );
            })
        );
        await openPeople();

        await user.type(screen.getByLabelText('E-mail'), 'novo@exemplo.com');
        await user.click(screen.getByRole('button', { name: 'Enviar convite' }));

        expect(await screen.findByText('Convite enviado para novo@exemplo.com')).toBeInTheDocument();
        expect(bodies).toEqual([{ email: 'novo@exemplo.com', role: 'editor' }]);
        expect(track).toHaveBeenCalledWith('member_invited', { role: 'editor' });
    });

    it.each([
        ['invites.already_member', 409, 'Essa pessoa já está na conta.'],
        ['members.limit_reached', 409, 'A conta já tem 10 pessoas.'],
        ['core.too_many_attempts', 429, 'Muitas tentativas. Aguarde um pouco e tente de novo.']
    ])('shows the message for %s', async (type: string, status: number, message: string): Promise<void> => {
        const user: UserEvent = userEvent.setup();
        failWith('post', '*/members/invites', type, status);
        await openPeople();

        await user.type(screen.getByLabelText('E-mail'), 'novo@exemplo.com');
        await user.click(screen.getByRole('button', { name: 'Enviar convite' }));

        expect(await screen.findByText(message)).toBeInTheDocument();
    });
});

describe('leaving', () => {
    it('signs out and goes to login as an editor', async () => {
        const user: UserEvent = userEvent.setup();
        server.use(http.post('*/members/me/leave', (): Response => new HttpResponse(null, { status: 204 })));
        await openPeople('editor', membersList({ members: [member({ role: 'editor' }), ana({ role: 'owner' })], invites: [] }));

        await user.click(screen.getByRole('button', { name: 'Sair da conta' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Sair da conta?' });
        expect(within(dialog).getByText('Para voltar, alguém da conta precisa te convidar de novo.')).toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Sair da conta' }));

        expect(await screen.findByText('Você saiu da conta.')).toBeInTheDocument();
        expect(tokenStore.get()).toBeNull();
        expect(track).toHaveBeenCalledWith('member_left');
    });
});

describe('roles', () => {
    it.each<Role>(['editor', 'viewer'])(
        'shows the list without selectors, buttons or invite card to %s',
        async (role: Role): Promise<void> => {
            await openPeople(role, membersList({ members: [member({ role }), ana({ role: 'owner' })], invites: [] }));

            expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Remover' })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Reenviar' })).not.toBeInTheDocument();
            expect(screen.queryByRole('region', { name: 'Convidar' })).not.toBeInTheDocument();
        }
    );

    it('refreshes the role and warns when the API says it changed', async () => {
        const user: UserEvent = userEvent.setup();
        failWith('post', '*/members/invites', 'members.forbidden_role', 403);
        await openPeople();
        server.use(http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ role: 'viewer' }))));

        await user.type(screen.getByLabelText('E-mail'), 'novo@exemplo.com');
        await user.click(screen.getByRole('button', { name: 'Enviar convite' }));

        expect(await screen.findByText('Seu papel nesta conta mudou. Atualize a página.')).toBeInTheDocument();
        await waitFor((): void => {
            expect(screen.queryByRole('region', { name: 'Convidar' })).not.toBeInTheDocument();
        });
    });
});
