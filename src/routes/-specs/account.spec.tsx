import { resetAnalytics, track } from '@/shared/lib/analytics';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { AnyRouter } from '@tanstack/react-router';
import { tokenStore } from '@/shared/lib/api/token-store';
import { i18n } from '@/shared/lib/i18n';
import { problem, sessionIdentity } from '../../../test/fixtures/auth';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const EMAIL: string = 'maria@example.test';

function failWith(method: 'get' | 'patch' | 'delete', path: string, type: string, status: number): void {
    server.use(http[method](path, (): Response => HttpResponse.json(problem(type, status), { status })));
}

async function openAccount(identity: Parameters<typeof sessionIdentity>[0] = {}): Promise<AnyRouter> {
    server.use(
        http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity(identity))),
        ...signedInHandlers()
    );
    const router: AnyRouter = renderRouterAt('/account');
    await screen.findByRole('heading', { name: 'Minha conta', level: 1 });
    return router;
}

async function openDeleteModal(user: UserEvent): Promise<HTMLElement> {
    await user.click(await screen.findByRole('button', { name: 'Excluir minha conta' }));
    return screen.findByRole('dialog', { name: 'Excluir minha conta' });
}

afterEach((): void => {
    tokenStore.set(null);
    vi.restoreAllMocks();
});

describe('account profile', () => {
    it('shows name, email and provider with no edit action', async () => {
        await openAccount();

        const profile: HTMLElement = screen.getByRole('region', { name: 'Perfil' });
        expect(within(profile).getByText('Maria Teste')).toBeInTheDocument();
        expect(within(profile).getByText(EMAIL)).toBeInTheDocument();
        expect(within(profile).getByText('Você entra com o Google')).toBeInTheDocument();
        expect(within(profile).queryByRole('button')).not.toBeInTheDocument();
        expect(within(profile).queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('shows Facebook for a Facebook login', async () => {
        await openAccount({ loginProvider: 'facebook' });

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
        await openAccount();

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
        await openAccount();

        await chooseEnglish(user);

        expect(await screen.findByRole('heading', { name: 'My account', level: 1 })).toBeInTheDocument();
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
        await openAccount();

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

        await user.click(screen.getByRole('button', { name: 'Baixar meus dados (JSON)' }));

        await waitFor((): void => {
            expect(clicked).toEqual([{ download: 'vera-export-2026-10-11.json', href: 'blob:export-1' }]);
        });
        expect(createUrl).toHaveBeenCalledTimes(1);
        await waitFor((): void => {
            expect(revokeUrl).toHaveBeenCalledWith('blob:export-1');
        });
        expect(await screen.findByText('Seus dados foram baixados.')).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('account_export_requested');
    });

    it('falls back to the default name when the header is missing', async () => {
        server.use(http.get('*/account/export', (): Response => HttpResponse.json({ format: 'vera-export/1' })));
        const user: UserEvent = userEvent.setup();
        await openAccount();

        await user.click(screen.getByRole('button', { name: 'Baixar meus dados (JSON)' }));

        await waitFor((): void => {
            expect(clicked.map((link) => link.download)).toEqual(['vera-export.json']);
        });
    });

    it('does not fire twice while loading', async () => {
        let calls: number = 0;
        server.use(
            http.get('*/account/export', async (): Promise<Response> => {
                calls += 1;
                await new Promise((resolve): void => {
                    setTimeout(resolve, 100);
                });
                return HttpResponse.json({ format: 'vera-export/1' });
            })
        );
        const user: UserEvent = userEvent.setup();
        await openAccount();
        const button: HTMLElement = screen.getByRole('button', { name: 'Baixar meus dados (JSON)' });

        await user.click(button);
        await user.click(screen.getByRole('button', { name: 'Preparando o arquivo…' }));
        await waitFor((): void => {
            expect(clicked).toHaveLength(1);
        });

        expect(calls).toBe(1);
    });

    it('shows the rate limit message on 429', async () => {
        failWith('get', '*/account/export', 'core.too_many_attempts', 429);
        const user: UserEvent = userEvent.setup();
        await openAccount();

        await user.click(screen.getByRole('button', { name: 'Baixar meus dados (JSON)' }));

        expect(
            await screen.findByText('Você já baixou seus dados algumas vezes agora há pouco. Tente de novo mais tarde.')
        ).toBeInTheDocument();
        expect(clicked).toEqual([]);
    });

    it('shows an error with guidance on identity.export_failed', async () => {
        failWith('get', '*/account/export', 'identity.export_failed', 500);
        const user: UserEvent = userEvent.setup();
        await openAccount();

        await user.click(screen.getByRole('button', { name: 'Baixar meus dados (JSON)' }));

        expect(await screen.findByText(/Não conseguimos montar o arquivo agora/)).toBeInTheDocument();
        expect(clicked).toEqual([]);
    });
});

describe('account deletion', () => {
    it('opens a modal listing what will be erased and keeps the button disabled', async () => {
        const user: UserEvent = userEvent.setup();
        await openAccount();

        const dialog: HTMLElement = await openDeleteModal(user);

        expect(within(dialog).getByText(/sua carteira, seus ativos e suas metas/)).toBeInTheDocument();
        expect(within(dialog).getByText(/Não há como desfazer/)).toBeInTheDocument();
        expect(within(dialog).getByText(/Seu e-mail é maria@example.test/)).toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: 'Baixar meus dados (JSON)' })).toBeEnabled();
        expect(within(dialog).getByRole('button', { name: 'Excluir minha conta' })).toBeDisabled();
    });

    it('enables the button only when the typed email matches, ignoring case and edge spaces', async () => {
        const user: UserEvent = userEvent.setup();
        await openAccount();
        const dialog: HTMLElement = await openDeleteModal(user);
        const field: HTMLElement = within(dialog).getByLabelText('Digite o seu e-mail para confirmar');
        const submit: HTMLElement = within(dialog).getByRole('button', { name: 'Excluir minha conta' });

        await user.type(field, 'outra@example.test');
        expect(submit).toBeDisabled();

        await user.clear(field);
        await user.type(field, '  MARIA@Example.TEST ');
        expect(submit).toBeEnabled();
    });

    it('closes the modal on cancel', async () => {
        const user: UserEvent = userEvent.setup();
        await openAccount();
        const dialog: HTMLElement = await openDeleteModal(user);

        await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows the field error on 422 identity.confirmation_mismatch', async () => {
        failWith('delete', '*/account', 'identity.confirmation_mismatch', 422);
        const user: UserEvent = userEvent.setup();
        await openAccount();
        const dialog: HTMLElement = await openDeleteModal(user);

        await user.type(within(dialog).getByLabelText('Digite o seu e-mail para confirmar'), EMAIL);
        await user.click(within(dialog).getByRole('button', { name: 'Excluir minha conta' }));

        expect(await within(dialog).findByText('O e-mail digitado não é o da sua conta.')).toBeInTheDocument();
        expect(tokenStore.get()).not.toBeNull();
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

        await user.type(within(dialog).getByLabelText('Digite o seu e-mail para confirmar'), EMAIL);
        await user.click(within(dialog).getByRole('button', { name: 'Excluir minha conta' }));

        expect(await within(dialog).findByText(message)).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(tokenStore.get()).not.toBeNull();
        expect(router.state.location.pathname).toBe('/account');
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

        await user.type(within(dialog).getByLabelText('Digite o seu e-mail para confirmar'), EMAIL);
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

    it('shows the owner-only notice instead of the button for a member', async () => {
        await openAccount({ role: 'member' });

        expect(screen.getByText('Só quem criou a conta pode excluí-la.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Excluir minha conta' })).not.toBeInTheDocument();
    });
});
