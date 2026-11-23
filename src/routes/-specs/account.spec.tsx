import { resetAnalytics, track } from '@/shared/lib/analytics';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { AnyRouter } from '@tanstack/react-router';
import { tokenStore } from '@/shared/lib/api/token-store';
import { i18n } from '@/shared/lib/i18n';
import type { BillingMe } from '@/features/billing/types';
import { supportAccessItem } from '../../../test/fixtures/account';
import { problem, sessionIdentity } from '../../../test/fixtures/auth';
import { billingMe, selfHostedBilling } from '../../../test/fixtures/billing';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const EMAIL: string = 'maria@example.test';

function failWith(method: 'get' | 'patch' | 'delete', path: string, type: string, status: number): void {
    server.use(http[method](path, (): Response => HttpResponse.json(problem(type, status), { status })));
}

async function openAccount(identity: Parameters<typeof sessionIdentity>[0] = {}, tab: string = 'privacy'): Promise<AnyRouter> {
    server.use(
        http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity(identity))),
        ...signedInHandlers()
    );
    const router: AnyRouter = renderRouterAt(`/settings/${tab}`);
    await screen.findByRole('heading', { name: 'Configurações', level: 1 });
    await screen.findByRole('region', { name: tab === 'privacy' ? 'Seus dados' : 'Idioma' });
    return router;
}

async function openDeleteModal(user: UserEvent): Promise<HTMLElement> {
    await user.click(await screen.findByRole('button', { name: 'Excluir conta' }));
    return screen.findByRole('dialog', { name: 'Excluir conta' });
}

afterEach((): void => {
    tokenStore.set(null);
    vi.restoreAllMocks();
});

describe('account profile', () => {
    it('shows name, email and provider with no edit action', async () => {
        await openAccount({}, 'preferences');

        const profile: HTMLElement = screen.getByRole('region', { name: 'Perfil' });
        expect(within(profile).getByText('Maria Teste')).toBeInTheDocument();
        expect(within(profile).getByText(EMAIL)).toBeInTheDocument();
        expect(within(profile).getByText('Você entra com o Google')).toBeInTheDocument();
        expect(within(profile).queryByRole('button')).not.toBeInTheDocument();
        expect(within(profile).queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('shows Facebook for a Facebook login', async () => {
        await openAccount({ loginProvider: 'facebook' }, 'preferences');

        expect(screen.getByText('Você entra com o Facebook')).toBeInTheDocument();
    });
});

describe('account language', () => {
    async function chooseEnglish(user: UserEvent): Promise<void> {
        await user.click(screen.getByRole('combobox', { name: 'Idioma da interface' }));
        await user.click(await screen.findByRole('option', { name: 'English' }));
    }

    it('lists the languages in their own names', async () => {
        const user: UserEvent = userEvent.setup();
        await openAccount({}, 'preferences');

        await user.click(screen.getByRole('combobox', { name: 'Idioma da interface' }));

        expect(await screen.findByRole('option', { name: 'Português (Brasil)' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    });

    it('switches the interface at once, saves the preference and updates the session user', async () => {
        const bodies: unknown[] = [];
        server.use(
            http.patch('*/auth/me/preferences', async ({ request }): Promise<Response> => {
                bodies.push(await request.json());
                return HttpResponse.json(sessionIdentity({ locale: 'en', preferredLocale: 'en' }));
            })
        );
        const user: UserEvent = userEvent.setup();
        await openAccount({}, 'preferences');

        await chooseEnglish(user);

        expect(await screen.findByRole('heading', { name: 'Settings', level: 1 })).toBeInTheDocument();
        await waitFor((): void => {
            expect(bodies).toEqual([{ locale: 'en' }]);
        });
        expect(i18n.language).toBe('en');
        expect(await screen.findByRole('combobox', { name: 'Interface language' })).toHaveTextContent('English');
        expect(track).toHaveBeenCalledWith('language_changed', { locale: 'en' });
    });

    it('reverts the selector and shows an error when saving fails', async () => {
        failWith('patch', '*/auth/me/preferences', 'validation_failed', 422);
        const user: UserEvent = userEvent.setup();
        await openAccount({}, 'preferences');

        await chooseEnglish(user);

        expect(await screen.findByText('Não foi possível salvar o idioma. Tente novamente.')).toBeInTheDocument();
        expect(i18n.language).toBe('pt-BR');
        expect(screen.getByRole('combobox', { name: 'Idioma da interface' })).toHaveTextContent('Português (Brasil)');
    });
});

describe('account export', () => {
    let createUrl: MockInstance<typeof URL.createObjectURL>;
    let revokeUrl: MockInstance<typeof URL.revokeObjectURL>;
    let clicked: { download: string; href: string }[];

    beforeEach((): void => {
        clicked = [];
        URL.createObjectURL = (): string => 'blob:export-1';
        URL.revokeObjectURL = (): void => undefined;
        createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:export-1');
        revokeUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation((): void => undefined);
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement): void {
            clicked.push({ download: this.download, href: this.href });
        });
    });

    it('downloads the file named by the response header and releases the object URL', async () => {
        const user: UserEvent = userEvent.setup();
        await openAccount();

        await user.click(screen.getByRole('button', { name: 'Exportar' }));

        await waitFor((): void => {
            expect(clicked).toEqual([{ download: 'vera-meus-dados-2026-10-11.zip', href: 'blob:export-1' }]);
        });
        expect(createUrl).toHaveBeenCalledTimes(1);
        await waitFor((): void => {
            expect(revokeUrl).toHaveBeenCalledWith('blob:export-1');
        });
        expect(await screen.findByText('Seus dados foram baixados.')).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('account_export_requested');
    });

    it('falls back to the default name when the header is missing', async () => {
        server.use(http.get('*/account/export/spreadsheets', (): Response => HttpResponse.json({ format: 'vera-export/1' })));
        const user: UserEvent = userEvent.setup();
        await openAccount();

        await user.click(screen.getByRole('button', { name: 'Exportar' }));

        await waitFor((): void => {
            expect(clicked.map((link) => link.download)).toEqual(['vera-meus-dados.zip']);
        });
    });

    it('does not fire twice while loading', async () => {
        let calls: number = 0;
        server.use(
            http.get('*/account/export/spreadsheets', async (): Promise<Response> => {
                calls += 1;
                await new Promise((resolve): void => {
                    setTimeout(resolve, 100);
                });
                return HttpResponse.json({ format: 'vera-export/1' });
            })
        );
        const user: UserEvent = userEvent.setup();
        await openAccount();
        const button: HTMLElement = screen.getByRole('button', { name: 'Exportar' });

        await user.click(button);
        await user.click(screen.getByRole('button', { name: 'Preparando o arquivo…' }));
        await waitFor((): void => {
            expect(clicked).toHaveLength(1);
        });

        expect(calls).toBe(1);
    });

    it('shows the rate limit message on 429', async () => {
        failWith('get', '*/account/export/spreadsheets', 'core.too_many_attempts', 429);
        const user: UserEvent = userEvent.setup();
        await openAccount();

        await user.click(screen.getByRole('button', { name: 'Exportar' }));

        expect(
            await screen.findByText('Você já baixou seus dados algumas vezes agora há pouco. Tente de novo mais tarde.')
        ).toBeInTheDocument();
        expect(clicked).toEqual([]);
    });

    it('shows an error with guidance on identity.export_failed', async () => {
        failWith('get', '*/account/export/spreadsheets', 'identity.export_failed', 500);
        const user: UserEvent = userEvent.setup();
        await openAccount();

        await user.click(screen.getByRole('button', { name: 'Exportar' }));

        expect(await screen.findByText(/Não conseguimos montar o arquivo agora/)).toBeInTheDocument();
        expect(clicked).toEqual([]);
    });
});

describe('account deletion', () => {
    it('opens a modal with what is erased, the export invite and the button disabled', async () => {
        const user: UserEvent = userEvent.setup();
        await openAccount();

        const dialog: HTMLElement = await openDeleteModal(user);

        expect(within(dialog).getByText(/apaga para sempre a carteira, metas, transações, regras e lembretes/)).toBeInTheDocument();
        expect(within(dialog).queryByText(/Premium/)).not.toBeInTheDocument();
        expect(within(dialog).getByText('Quer guardar uma cópia? Exporte seus dados antes.')).toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: 'Exportar' })).toBeEnabled();
        expect(within(dialog).getByRole('button', { name: 'Excluir minha conta' })).toBeDisabled();
    });

    it('enables the button only when EXCLUIR is typed, in any case and with edge spaces', async () => {
        const user: UserEvent = userEvent.setup();
        await openAccount();
        const dialog: HTMLElement = await openDeleteModal(user);
        const field: HTMLElement = within(dialog).getByLabelText('Para confirmar, escreva EXCLUIR');
        const submit: HTMLElement = within(dialog).getByRole('button', { name: 'Excluir minha conta' });

        await user.type(field, 'EXCLUI');
        expect(submit).toBeDisabled();

        await user.clear(field);
        await user.type(field, '  excluir ');
        expect(submit).toBeEnabled();
    });

    it('closes the modal on Voltar', async () => {
        const user: UserEvent = userEvent.setup();
        await openAccount();
        const dialog: HTMLElement = await openDeleteModal(user);

        await user.click(within(dialog).getByRole('button', { name: 'Voltar' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it.each([
        ['identity.erasure_failed', 500, /Ela continua intacta/],
        ['core.too_many_attempts', 429, /Muitas tentativas/],
        ['identity.forbidden', 403, /Só quem criou a conta pode excluí-la/]
    ])('keeps the modal and the session on %s', async (type: string, status: number, message: RegExp) => {
        failWith('delete', '*/account', type, status);
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = await openAccount();
        const dialog: HTMLElement = await openDeleteModal(user);

        await user.type(within(dialog).getByLabelText('Para confirmar, escreva EXCLUIR'), 'EXCLUIR');
        await user.click(within(dialog).getByRole('button', { name: 'Excluir minha conta' }));

        expect(await within(dialog).findByText(message)).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(tokenStore.get()).not.toBeNull();
        expect(router.state.location.pathname).toBe('/settings/privacy');
    });

    it('on 204 ends the session without calling logout, goes to the login and shows the notice once', async () => {
        const calls: string[] = [];
        const bodies: unknown[] = [];
        server.use(
            http.delete('*/account', async ({ request }): Promise<Response> => {
                bodies.push(await request.json());
                return new HttpResponse(null, { status: 204 });
            }),
            http.post('*/auth/logout', (): Response => {
                calls.push('logout');
                return new HttpResponse(null, { status: 204 });
            })
        );
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = await openAccount();
        const dialog: HTMLElement = await openDeleteModal(user);

        await user.type(within(dialog).getByLabelText('Para confirmar, escreva EXCLUIR'), 'excluir');
        await user.click(within(dialog).getByRole('button', { name: 'Excluir minha conta' }));

        expect(await screen.findByText('Sua conta foi excluída.')).toBeInTheDocument();
        await waitFor((): void => {
            expect(router.state.location.pathname).toBe('/login');
        });
        await waitFor((): void => {
            expect(router.state.location.search).toEqual({});
        });
        expect(bodies).toEqual([{ confirmEmail: EMAIL }]);
        expect(tokenStore.get()).toBeNull();
        expect(calls).toEqual([]);
        expect(screen.getByText('Sua conta foi excluída.')).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('account_delete_opened');
        expect(track).toHaveBeenCalledWith('account_deleted');
        expect(resetAnalytics).toHaveBeenCalled();
    });

    it.each([['editor'], ['viewer']] as const)('shows the owner-only notice and no buttons for %s', async (role) => {
        await openAccount({ role });

        expect(screen.getByText('Só o Dono da conta exporta ou exclui os dados.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Excluir conta' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Exportar' })).not.toBeInTheDocument();
        expect(screen.queryByRole('region', { name: 'Acessos do suporte' })).not.toBeInTheDocument();
    });
});

describe('account support access', () => {
    it('lists when, who, the reason and the layers of each opening', async () => {
        server.use(
            http.get('*/account/support-access', (): Response =>
                HttpResponse.json({
                    items: [
                        supportAccessItem({ layers: ['summary', 'data'] }),
                        supportAccessItem({ id: '55555555-5555-4555-8555-555555555555', operatorName: null, reason: 'Revisão de fatura' })
                    ]
                })
            )
        );
        await openAccount();

        const list: HTMLElement = await screen.findByRole('list', { name: 'Acessos do suporte, do mais recente ao mais antigo' });

        expect(within(list).getAllByRole('listitem')).toHaveLength(2);
        expect(within(list).getByText('Aberto por Marina Souza')).toBeInTheDocument();
        expect(within(list).getByText('Motivo: Cliente pediu ajuda com a assinatura')).toBeInTheDocument();
        expect(within(list).getAllByText('Resumo')).toHaveLength(2);
        expect(within(list).getByText('Dados da conta')).toBeInTheDocument();
        expect(within(list).getByText('Pessoa não identificada')).toBeInTheDocument();
    });

    it('says no one opened the account yet', async () => {
        await openAccount();

        expect(await screen.findByText(/Nenhum acesso até agora/)).toBeInTheDocument();
    });

    it('shows an error when the list fails to load', async () => {
        failWith('get', '*/account/support-access', 'identity.unauthorized', 403);
        await openAccount();

        expect(await screen.findByText(/Não foi possível carregar os acessos do suporte/)).toBeInTheDocument();
    });
});

describe('account deletion text by plan', () => {
    async function openModalWith(billing: BillingMe): Promise<HTMLElement> {
        server.use(http.get('*/billing/me', (): Response => HttpResponse.json(billing)));
        const user: UserEvent = userEvent.setup();
        await openAccount();
        return openDeleteModal(user);
    }

    it('cites the Premium cancelation for a hosted subscriber', async () => {
        const subscription: BillingMe['subscription'] = {
            status: 'active',
            method: 'card',
            since: '2026-10-01T00:00:00.000Z',
            paidThrough: '2026-12-01T00:00:00.000Z',
            nextChargeAt: '2026-12-01T00:00:00.000Z',
            card: { brand: 'visa', last4: '4242' },
            graceEndsAt: null,
            withdrawalEndsAt: null,
            canResume: false,
            discount: null,
            nextChargeAmountMinor: 1490
        };
        const dialog: HTMLElement = await openModalWith(billingMe({ subscription }));

        expect(await within(dialog).findByText(/O Premium é cancelado, sem novas cobranças/)).toBeInTheDocument();
        expect(screen.getByText(/além de cancelar o Premium/)).toBeInTheDocument();
    });

    it('leaves the Premium out for the Free plan and for a self-hosted installation', async () => {
        const dialog: HTMLElement = await openModalWith(selfHostedBilling());

        expect(within(dialog).queryByText(/Premium/)).not.toBeInTheDocument();
    });
});
