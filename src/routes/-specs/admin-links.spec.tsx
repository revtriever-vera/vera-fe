import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { signupLink } from '../../../test/fixtures/admin';
import { problem } from '../../../test/fixtures/auth';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

function listLinks(...items: ReturnType<typeof signupLink>[]): void {
    server.use(http.get('*/platform/signup-links', () => HttpResponse.json({ items })));
}

async function openForm(user: UserEvent): Promise<HTMLElement> {
    await user.click(await screen.findByRole('button', { name: 'Novo link' }));
    return screen.findByRole('dialog');
}

describe('Admin signup links', () => {
    it('lists the links with offer, status, uses and validity', async () => {
        listLinks(signupLink(), signupLink({ id: 'b', label: 'Feira', status: 'revoked', maxUses: null, expiresAt: null }));
        renderRouterAt('/admin/links', { signedIn: true });

        const row: HTMLElement = (await screen.findByText('Parceiros')).closest('tr') as HTMLElement;
        expect(within(row).getByText('Teste de 14 dias com cartão')).toBeInTheDocument();
        expect(within(row).getByText('1 regra de desconto')).toBeInTheDocument();
        expect(within(row).getByText('Vale 30 dias depois do uso')).toBeInTheDocument();
        expect(within(row).getByText('Ativo')).toBeInTheDocument();
        expect(within(row).getByText('12 de 100')).toBeInTheDocument();
        const revoked: HTMLElement = screen.getByText('Feira').closest('tr') as HTMLElement;
        expect(within(revoked).getByText('12 (sem limite)')).toBeInTheDocument();
        expect(within(revoked).getByText('Não expira')).toBeInTheDocument();
        expect(within(revoked).queryByRole('button', { name: 'Revogar o link Feira' })).not.toBeInTheDocument();
    });

    it('shows the empty state', async () => {
        renderRouterAt('/admin/links', { signedIn: true });

        expect(await screen.findByText('Nenhum link ainda')).toBeInTheDocument();
    });

    it('shows a failure when the links do not load', async () => {
        server.use(http.get('*/platform/signup-links', () => HttpResponse.json(problem('core.internal', 500), { status: 500 })));
        renderRouterAt('/admin/links', { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar os links.')).toBeInTheDocument();
    });

    it('copies the link of a row', async () => {
        listLinks(signupLink());
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/links', { signedIn: true });

        await user.click(await screen.findByRole('button', { name: 'Copiar o link Parceiros' }));

        expect(await screen.findByText('Link copiado')).toBeInTheDocument();
        expect(await navigator.clipboard.readText()).toBe('https://app.vera.test/signup?link=tokentokentokentoken');
    });

    it('revokes an active link after the confirmation', async () => {
        listLinks(signupLink());
        let revoked: string | null = null;
        server.use(
            http.delete('*/platform/signup-links/:id', ({ params }) => {
                revoked = String(params['id']);
                return new HttpResponse(null, { status: 204 });
            })
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/links', { signedIn: true });

        await user.click(await screen.findByRole('button', { name: 'Revogar o link Parceiros' }));
        await user.click(await screen.findByRole('button', { name: 'Revogar link' }));

        expect(await screen.findByText('Link revogado')).toBeInTheDocument();
        expect(revoked).toBe('33333333-3333-4333-8333-333333333333');
    });

    it('asks for a limit and a validity before a no-card link', async () => {
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/links', { signedIn: true });
        const dialog: HTMLElement = await openForm(user);

        await user.type(within(dialog).getByLabelText('Nome do link'), 'Feira');
        await user.click(within(dialog).getByRole('radio', { name: 'Sem cartão' }));
        await user.type(within(dialog).getByLabelText('Dias de teste'), '14');
        await user.click(within(dialog).getByRole('button', { name: 'Criar link' }));

        expect(await within(dialog).findByText('Sem cartão exige um limite de usos.')).toBeInTheDocument();
        expect(within(dialog).getByText('Sem cartão exige uma validade.')).toBeInTheDocument();
    });

    it('previews the discount in reais and creates the link', async () => {
        let body: unknown = null;
        server.use(
            http.post('*/platform/signup-links', async ({ request }) => {
                body = await request.json();
                return HttpResponse.json(signupLink(), { status: 201 });
            })
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/links', { signedIn: true });
        const dialog: HTMLElement = await openForm(user);

        expect(within(dialog).getByText('Sem desconto: R$ 14,90 por ciclo.')).toBeInTheDocument();
        await user.type(within(dialog).getByLabelText('Nome do link'), 'Parceiros');
        await user.click(within(dialog).getByRole('radio', { name: 'Com cartão' }));
        await user.type(within(dialog).getByLabelText('Dias de teste'), '14');
        await user.click(within(dialog).getByRole('button', { name: 'Adicionar regra' }));
        await user.type(within(dialog).getByLabelText('Desconto (%)'), '50');
        await user.type(within(dialog).getByLabelText('Do ciclo'), '1');
        await user.type(within(dialog).getByLabelText('Até o ciclo'), '3');
        expect(within(dialog).getByText('Ciclos 1 a 3: R$ 7,45 por ciclo, 50% de desconto.')).toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Criar link' }));

        expect(await screen.findByText('Link criado')).toBeInTheDocument();
        expect(body).toEqual({
            label: 'Parceiros',
            trial: { kind: 'card', days: 14 },
            rules: [{ percent: 50, fromCycle: 1, toCycle: 3 }],
            maxUses: null,
            expiresAt: null,
            offerValidityDays: 30
        });
        await waitFor((): void => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('explains the refusal of the API inside the form', async () => {
        server.use(
            http.post('*/platform/signup-links', () => {
                const refusal = { ...problem('signup_links.invalid_offer', 422), meta: { reason: 'rule_out_of_range' } };
                return HttpResponse.json(refusal, { status: 422 });
            })
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/links', { signedIn: true });
        const dialog: HTMLElement = await openForm(user);

        await user.type(within(dialog).getByLabelText('Nome do link'), 'Parceiros');
        await user.click(within(dialog).getByRole('button', { name: 'Criar link' }));

        expect(await within(dialog).findByText(/Uma regra de desconto está fora dos limites/)).toBeInTheDocument();
    });

    it('edits a link with the same form, warning that subscriptions keep their scale', async () => {
        listLinks(signupLink());
        let patched: { id: string; body: unknown } | null = null;
        server.use(
            http.patch('*/platform/signup-links/:id', async ({ request, params }) => {
                patched = { id: String(params['id']), body: await request.json() };
                return HttpResponse.json(signupLink({ label: 'Parceiros 2', offerValidityDays: 10 }));
            })
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/links', { signedIn: true });

        await user.click(await screen.findByRole('button', { name: 'Editar o link Parceiros' }));
        const dialog: HTMLElement = await screen.findByRole('dialog');
        expect(within(dialog).getByText('Editar link de cadastro')).toBeInTheDocument();
        expect(within(dialog).getByText('Assinaturas já feitas mantêm a régua de desconto delas.')).toBeInTheDocument();
        expect(within(dialog).getByLabelText('Nome do link')).toHaveValue('Parceiros');
        expect(within(dialog).getByLabelText('Dias de teste')).toHaveValue('14');
        const label: HTMLElement = within(dialog).getByLabelText('Nome do link');
        await user.clear(label);
        await user.type(label, 'Parceiros 2');
        const validity: HTMLElement = within(dialog).getByLabelText('Validade da oferta (dias)');
        await user.clear(validity);
        await user.type(validity, '10');
        await user.click(within(dialog).getByRole('button', { name: 'Salvar alterações' }));

        expect(await screen.findByText('Link atualizado')).toBeInTheDocument();
        expect(patched).toMatchObject({
            id: '33333333-3333-4333-8333-333333333333',
            body: { label: 'Parceiros 2', offerValidityDays: 10, expiresAt: '2026-12-31T23:59:59.000Z', maxUses: 100 }
        });
    });

    it('refuses an offer validity out of range and a refusal of the API on edit', async () => {
        listLinks(signupLink());
        server.use(
            http.patch('*/platform/signup-links/:id', () => {
                const refusal = { ...problem('signup_links.invalid_offer', 422), meta: { reason: 'offer_validity_out_of_range' } };
                return HttpResponse.json(refusal, { status: 422 });
            })
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/admin/links', { signedIn: true });

        await user.click(await screen.findByRole('button', { name: 'Editar o link Parceiros' }));
        const dialog: HTMLElement = await screen.findByRole('dialog');
        const validity: HTMLElement = within(dialog).getByLabelText('Validade da oferta (dias)');
        await user.clear(validity);
        await user.type(validity, '400');
        await user.click(within(dialog).getByRole('button', { name: 'Salvar alterações' }));
        expect(await within(dialog).findByText('Informe de 1 a 365 dias.')).toBeInTheDocument();

        await user.clear(validity);
        await user.type(validity, '365');
        await user.click(within(dialog).getByRole('button', { name: 'Salvar alterações' }));
        expect(await within(dialog).findByText('A validade da oferta vai de 1 a 365 dias.')).toBeInTheDocument();
    });
});
