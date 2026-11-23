import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import { problem, loginSession, sessionIdentity } from '../../../test/fixtures/auth';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';
import type { GoogleCredentialResponse, GoogleIdentity } from '@/features/auth/lib/google-identity';

const google: { callback: ((response: GoogleCredentialResponse) => void) | null } = vi.hoisted(() => ({ callback: null }));

vi.mock('@/shared/config/env', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/config/env')>();
    return { env: { ...original.env, VITE_GOOGLE_CLIENT_ID: 'client-test.apps.example' } };
});

vi.mock('@/features/auth/lib/google-identity', () => ({
    loadGoogleIdentity: (): Promise<GoogleIdentity> =>
        Promise.resolve({
            initialize: (config): void => {
                google.callback = config.callback;
            },
            renderButton: (): void => undefined
        })
}));

describe('AdminLoginBox', () => {
    beforeEach((): void => {
        google.callback = null;
    });

    it('signs in with the admin audience and lands on the audit', async () => {
        let body: unknown = null;
        server.use(
            http.post('*/auth/google', async ({ request }) => {
                body = await request.json();
                return HttpResponse.json(loginSession());
            }),
            http.get('*/auth/me', () => HttpResponse.json(sessionIdentity())),
            http.get('*/platform/audit', () => HttpResponse.json({ items: [] }))
        );
        const router: AnyRouter = renderRouterAt('/admin/login');

        await waitFor((): void => {
            expect(google.callback).not.toBeNull();
        });
        google.callback?.({ credential: 'google-id-token' });

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/admin/audit');
        });
        expect(body).toEqual({ idToken: 'google-id-token', audience: 'admin' });
    });

    it('shows the refusal for a person outside the system company', async () => {
        server.use(http.post('*/auth/google', () => HttpResponse.json(problem('identity.platform_only', 403), { status: 403 })));
        renderRouterAt('/admin/login');

        await waitFor((): void => {
            expect(google.callback).not.toBeNull();
        });
        google.callback?.({ credential: 'google-id-token' });

        expect(await screen.findByText('Esta conta não tem acesso ao admin.')).toBeInTheDocument();
    });

    describe('second factor', () => {
        const signedIn = (): void => {
            server.use(
                http.get('*/auth/me', () => HttpResponse.json(sessionIdentity())),
                http.get('*/platform/audit', () => HttpResponse.json({ items: [] }))
            );
        };

        const loginWith = async (response: object): Promise<UserEvent> => {
            server.use(http.post('*/auth/google', () => HttpResponse.json(response)));
            const user: UserEvent = userEvent.setup();
            renderRouterAt('/admin/login');
            await waitFor((): void => {
                expect(google.callback).not.toBeNull();
            });
            google.callback?.({ credential: 'google-id-token' });
            return user;
        };

        it('enrolls the authenticator, shows the recovery codes and enters only after the confirmation', async () => {
            let activateBody: unknown = null;
            signedIn();
            server.use(
                http.post('*/auth/totp/enroll', () =>
                    HttpResponse.json({ secret: 'JBSWY3DPEHPK3PXP', otpauthUri: 'otpauth://totp/Vera:admin?secret=JBSWY3DPEHPK3PXP' })
                ),
                http.post('*/auth/totp/activate', async ({ request }) => {
                    activateBody = await request.json();
                    return HttpResponse.json({ ...loginSession(), recoveryCodes: ['aaaa-1111', 'bbbb-2222'] });
                })
            );
            const user: UserEvent = await loginWith({ outcome: 'totp_enrollment_required', setupToken: 'setup-1' });

            expect(await screen.findByRole('img', { name: 'QR code para cadastrar o autenticador' })).toBeInTheDocument();
            expect(screen.getByText('JBSWY3DPEHPK3PXP')).toBeInTheDocument();
            await user.type(screen.getByLabelText('Código de 6 dígitos'), '123456');
            await user.click(screen.getByRole('button', { name: 'Ativar' }));

            expect(await screen.findByRole('heading', { name: 'Guarde seus códigos de recuperação' })).toBeInTheDocument();
            expect(screen.getByText('aaaa-1111')).toBeInTheDocument();
            expect(activateBody).toEqual({ setupToken: 'setup-1', code: '123456' });
            await user.click(screen.getByRole('button', { name: 'Guardei os códigos' }));
            expect(await screen.findByText('Os eventos mais recentes do admin, do mais novo para o mais antigo.')).toBeInTheDocument();
        });

        it('copies and downloads the recovery codes', async () => {
            signedIn();
            const created: string[] = [];
            vi.stubGlobal(
                'URL',
                Object.assign(URL, {
                    createObjectURL: (blob: Blob): string => {
                        created.push(blob.type);
                        return 'blob:codes';
                    },
                    revokeObjectURL: (): void => undefined
                })
            );
            server.use(
                http.post('*/auth/totp/enroll', () => HttpResponse.json({ secret: 'SECRET', otpauthUri: 'otpauth://totp/Vera' })),
                http.post('*/auth/totp/activate', () => HttpResponse.json({ ...loginSession(), recoveryCodes: ['aaaa-1111'] }))
            );
            const user: UserEvent = await loginWith({ outcome: 'totp_enrollment_required', setupToken: 'setup-1' });
            await user.type(await screen.findByLabelText('Código de 6 dígitos'), '123456');
            await user.click(screen.getByRole('button', { name: 'Ativar' }));

            await user.click(await screen.findByRole('button', { name: 'Copiar códigos' }));
            expect(await screen.findByRole('button', { name: 'Códigos copiados' })).toBeInTheDocument();
            await user.click(screen.getByRole('button', { name: 'Baixar códigos' }));
            expect(created).toEqual(['text/plain']);
            vi.unstubAllGlobals();
        });

        it('signs in with the authenticator code on the next login', async () => {
            let body: unknown = null;
            signedIn();
            server.use(
                http.post('*/auth/totp/verify', async ({ request }) => {
                    body = await request.json();
                    return HttpResponse.json(loginSession());
                })
            );
            const user: UserEvent = await loginWith({ outcome: 'totp_required', challengeToken: 'challenge-1' });

            await user.type(await screen.findByLabelText('Código de 6 dígitos'), '654321');
            await user.click(screen.getByRole('button', { name: 'Confirmar' }));

            expect(await screen.findByText('Os eventos mais recentes do admin, do mais novo para o mais antigo.')).toBeInTheDocument();
            expect(body).toEqual({ challengeToken: 'challenge-1', code: '654321' });
        });

        it('accepts a recovery code instead of the six digits', async () => {
            let body: unknown = null;
            signedIn();
            server.use(
                http.post('*/auth/totp/verify', async ({ request }) => {
                    body = await request.json();
                    return HttpResponse.json(loginSession());
                })
            );
            const user: UserEvent = await loginWith({ outcome: 'totp_required', challengeToken: 'challenge-1' });

            await user.click(await screen.findByRole('button', { name: 'Usar um código de recuperação' }));
            await user.type(screen.getByLabelText('Código de recuperação'), 'aaaa-1111');
            await user.click(screen.getByRole('button', { name: 'Confirmar' }));

            await waitFor((): void => {
                expect(body).toEqual({ challengeToken: 'challenge-1', code: 'aaaa-1111' });
            });
        });

        it('refuses a malformed code before calling the API', async () => {
            const user: UserEvent = await loginWith({ outcome: 'totp_required', challengeToken: 'challenge-1' });

            await user.type(await screen.findByLabelText('Código de 6 dígitos'), '12');
            await user.click(screen.getByRole('button', { name: 'Confirmar' }));

            expect(await screen.findByText('Digite os 6 dígitos do código.')).toBeInTheDocument();
        });

        it('says when the code is wrong and keeps the step', async () => {
            server.use(
                http.post('*/auth/totp/verify', () => HttpResponse.json(problem('identity.invalid_totp_code', 401), { status: 401 }))
            );
            const user: UserEvent = await loginWith({ outcome: 'totp_required', challengeToken: 'challenge-1' });

            await user.type(await screen.findByLabelText('Código de 6 dígitos'), '000000');
            await user.click(screen.getByRole('button', { name: 'Confirmar' }));

            expect(await screen.findByText('Código incorreto. Confira e tente de novo.')).toBeInTheDocument();
            expect(screen.getByLabelText('Código de 6 dígitos')).toBeInTheDocument();
        });

        it('says when the person is locked out for fifteen minutes', async () => {
            server.use(http.post('*/auth/totp/verify', () => HttpResponse.json(problem('core.too_many_attempts', 429), { status: 429 })));
            const user: UserEvent = await loginWith({ outcome: 'totp_required', challengeToken: 'challenge-1' });

            await user.type(await screen.findByLabelText('Código de 6 dígitos'), '000000');
            await user.click(screen.getByRole('button', { name: 'Confirmar' }));

            expect(await screen.findByText('Muitas tentativas. Tente de novo em 15 minutos.')).toBeInTheDocument();
        });

        it('goes back to Google when the challenge expired', async () => {
            server.use(
                http.post('*/auth/totp/verify', () => HttpResponse.json(problem('identity.invalid_totp_token', 401), { status: 401 }))
            );
            const user: UserEvent = await loginWith({ outcome: 'totp_required', challengeToken: 'challenge-1' });

            await user.type(await screen.findByLabelText('Código de 6 dígitos'), '000000');
            await user.click(screen.getByRole('button', { name: 'Confirmar' }));

            expect(await screen.findByText('O tempo para confirmar acabou. Entre com o Google de novo.')).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Admin da Vera' })).toBeInTheDocument();
        });

        it('lets the person go back to Google from the code step', async () => {
            const user: UserEvent = await loginWith({ outcome: 'totp_required', challengeToken: 'challenge-1' });

            await user.click(await screen.findByRole('button', { name: 'Voltar para o Google' }));

            expect(screen.getByRole('heading', { name: 'Admin da Vera' })).toBeInTheDocument();
        });
    });
});
